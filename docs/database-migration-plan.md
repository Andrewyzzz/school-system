# 数据库迁移方案

更新时间：2026-07-08

## 2026-07-08 重大更新：PostgreSQL 运行时持久层已落地（第二阶段 M1）

后端运行时已支持三种数据层驱动（`DB_DRIVER` 环境变量）：

| 驱动 | 行为 | 用途 |
| --- | --- | --- |
| `json`（默认） | 本地 JSON 文件，与一阶段一致 | 开发、一阶段试运行 |
| `postgres` | PostgreSQL 持久化（差量行级写） | 生产目标形态 |
| `dual` | 双写：先 PostgreSQL 后 JSON 文件 | 迁移观察窗口 |

架构：业务逻辑继续操作内存域模型（一阶段已验证 3000 在线），持久层按集合建文档表
`app_<collection>`（id/seq/data JSONB），保存时与影子快照逐行 diff，只把变更行 upsert/delete
进事务（实测常态写 1~3 行、约 70~90ms）。数组顺序经 `seq` 列还原；重复主键持久化时显式拒绝。
列级规范化可后续按表推进，`001/002_*.sql` 是关系投影与报表口径。

关键文件与命令：

- 引擎：`server/db/postgresStore.js`；驱动路由：`server/storage.js`（ensureDatabase/saveDatabase/resetDatabase）
- 迁移：`npm run migrate:postgres`（试跑核对）/ `npm run migrate:postgres -- --commit`（正式迁移 + 逐行核对报告）
- 测试：`npm run test:postgres-store`、`npm run test:pii`
- 连接：`DATABASE_URL`（默认 `postgresql://localhost:5432/school_system_dev`）；HR 敏感字段密钥 `HR_ENCRYPTION_KEY`

生产切换步骤：停服 → `--commit` 迁移并确认核对全绿 → `DB_DRIVER=dual` 双写观察 → 稳定后切 `DB_DRIVER=postgres`，JSON 文件保留为回滚兜底。

已验证：postgres 驱动下登录→服务重启→会话仍有效；3000 并发压测 0 错误、稳态 447 req/s、登录 P50 305ms。

## 当前状态（2026-06-26 记录，运行时部分已被上节取代）

第一阶段当前使用 Node 原生服务 + 本地 JSON 数据文件作为开发期数据仓库：

- 数据文件：`server/data/phase1-db.json`
- 种子脚本：`node server/seed.js`
- 服务入口：`node server/server.js`

这样做的目的，是先稳定接口、权限、字段和前端交互，再切换正式数据库。

截至 `2026-06-26`，仓库已新增 PostgreSQL 初版 schema：

- `database/postgres/001_phase1_schema.sql`
- `database/README.md`
- `server/exportPostgresData.js`

注意：这代表数据库表结构和 JSON 到 PostgreSQL 的数据导出脚本已经开始沉淀，但后端运行时还没有切到 SQL repository；当前 API 仍读写 `server/data/phase1-db.json`。

## 迁移目标

后续正式部署时，将本地 JSON 数据仓库迁移到关系型数据库，建议优先 PostgreSQL 或 MySQL。

第一阶段至少需要支持：

- 约 1000 个教师账号。
- 按老师、月份、自然周查询课表和薪资。
- 财务端分页查询教师列表。
- 签入签出幂等写入。
- 薪资锁定和操作日志追溯。

## 已落地的第一版 SQL 表结构

第一版 PostgreSQL schema 覆盖：

1. `academic_terms`
2. `school_stages`
3. `grades`
4. `subjects`
5. `classes`
6. `room_resource_types`
7. `rooms`
8. `accounts`
9. `teachers`
10. `teacher_salary_profiles`
11. `payroll_rules`
12. `grade_course_rules`
13. `class_teacher_assignments`
14. `schedule_period_templates`
15. `schedule_constraints`
16. `teacher_schedule_rules`
17. `schedule_drafts`
18. `schedule_draft_assignments`
19. `schedule_versions`
20. `lesson_instances`
21. `classroom_qr_tokens`
22. `attendance_records`
23. `workload_confirmations`
24. `teacher_monthly_adjustments`
25. `payroll_details`
26. `payroll_detail_rows`
27. `payroll_batches`
28. `payroll_batch_results`
29. `notifications`
30. `notification_recipients`
31. `import_batches`
32. `audit_logs`

## 关键索引

关键索引已写入 `database/postgres/001_phase1_schema.sql`，重点包括：

- 账号唯一：`accounts.username`
- 教师工号唯一：`teachers.employee_no`
- 老师分页/筛选：`teachers(stage_id, grade_id, primary_subject_id)`
- 课表查询：`lesson_instances(teacher_id, lesson_date)`、`lesson_instances(class_id, lesson_date)`、`lesson_instances(room_id, lesson_date)`
- 排课硬冲突：同一学期、同一日期、同一节次下，老师/班级/教室不能重复占用
- 考勤幂等：同一课次的有效签入/签出各只能有一条
- 工资月结：`payroll_details(teacher_id, month)` 唯一
- 审计追溯：按操作人、老师/月、业务实体建立索引

## 迁移步骤

### 第一步：冻结字段

- 以 `docs/phase1-field-dictionary.md` 为准确认字段。
- 与学校确认教师导入模板和必填项。
- 明确课时类型、薪资项目和异常状态枚举。

### 第二步：执行 SQL schema

- 创建 PostgreSQL 数据库。
- 执行 `database/postgres/001_phase1_schema.sql`。
- 确认 `schema_migrations` 中存在 `001_phase1_schema`。

### 第三步：增加数据库适配层

- 保留当前 API 路由不变。
- 将 `server/storage.js` 中的数据读写抽象为 repository。
- 新增 SQL repository，与 JSON repository 共用同一套业务接口。

### 第四步：迁移基础数据

- 导入学部、年级、班级、科目、教室。
- 导入教师和账号。
- 导入教室二维码。
- 生成初始老师任课关系。

### 第五步：迁移业务数据

- 运行 `node server/exportPostgresData.js --output database/postgres/generated/phase1-data.sql`。
- 迁移已发布课表和课次。
- 迁移签入签出记录。
- 迁移工作量确认。
- 迁移薪资明细。
- 用 `psql "$DATABASE_URL" -f database/postgres/generated/phase1-data.sql` 导入数据。

### 第六步：灰度切换

- 开发环境先切数据库。
- 使用 1000 个教师账号进行分页、登录、课表、薪资查询测试。
- 验证签入签出幂等。
- 验证财务锁定不可重复修改。
- 验证操作日志。

## 第一阶段暂不强制做的数据库能力

- 多租户。
- 复杂组织审批流。
- 历史归档分表。
- 数据仓库和 BI。
- 人事完整生命周期。

这些能力放到第二阶段和第三阶段逐步补齐。
