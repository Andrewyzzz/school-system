# 第一阶段数据库迁移方案

更新时间：2026-06-11

## 当前状态

第一阶段当前使用 Node 原生服务 + 本地 JSON 数据文件作为开发期数据仓库：

- 数据文件：`server/data/phase1-db.json`
- 种子脚本：`node server/seed.js`
- 服务入口：`node server/server.js`

这样做的目的，是先稳定接口、权限、字段和前端交互，再切换正式数据库。

## 迁移目标

后续正式部署时，将本地 JSON 数据仓库迁移到关系型数据库，建议优先 PostgreSQL 或 MySQL。

第一阶段至少需要支持：

- 约 1000 个教师账号。
- 按老师、月份、自然周查询课表和薪资。
- 财务端分页查询教师列表。
- 签入签出幂等写入。
- 薪资锁定和操作日志追溯。

## 建议表结构

1. `users`
2. `teachers`
3. `stages`
4. `subjects`
5. `classes`
6. `rooms`
7. `teacher_subject_assignments`
8. `schedule_drafts`
9. `schedule_versions`
10. `lesson_instances`
11. `attendance_records`
12. `workload_confirmations`
13. `payroll_rules`
14. `payroll_batches`
15. `payroll_lines`
16. `audit_logs`

## 关键索引

```sql
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_teachers_employee_no ON teachers(employee_no);
CREATE INDEX idx_teachers_stage_subject ON teachers(stage_id, primary_subject_id);
CREATE INDEX idx_lessons_teacher_date ON lesson_instances(teacher_id, lesson_date);
CREATE INDEX idx_lessons_class_date ON lesson_instances(class_id, lesson_date);
CREATE INDEX idx_lessons_room_date ON lesson_instances(room_id, lesson_date);
CREATE INDEX idx_attendance_teacher_time ON attendance_records(teacher_id, scanned_at);
CREATE UNIQUE INDEX idx_attendance_lesson_action ON attendance_records(lesson_id, action);
CREATE INDEX idx_workload_teacher_month ON workload_confirmations(teacher_id, month);
CREATE INDEX idx_payroll_teacher_month ON payroll_lines(teacher_id, month);
```

## 迁移步骤

### 第一步：冻结字段

- 以 `docs/phase1-field-dictionary.md` 为准确认字段。
- 与学校确认教师导入模板和必填项。
- 明确课时类型、薪资项目和异常状态枚举。

### 第二步：增加数据库适配层

- 保留当前 API 路由不变。
- 将 `server/storage.js` 中的数据读写抽象为 repository。
- 新增 SQL repository，与 JSON repository 共用同一套业务接口。

### 第三步：迁移基础数据

- 导入学部、年级、班级、科目、教室。
- 导入教师和账号。
- 导入教室二维码。
- 生成初始老师任课关系。

### 第四步：迁移业务数据

- 迁移已发布课表和课次。
- 迁移签入签出记录。
- 迁移工作量确认。
- 迁移薪资明细。

### 第五步：灰度切换

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
