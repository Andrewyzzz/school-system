# 部署与验收总手册（第一阶段 + 第二阶段）

- 更新时间：2026-07-08
- 适用版本：`main` 分支 `da1c025` 及之后
- 定位：**一份文档走完从裸服务器到两阶段验收签字的全过程**。日常代码更新流程见 `docs/system-update-process.md`；本手册只覆盖部署、迁移、验收与回滚。

---

## 1. 系统组成与部署形态

| 组件 | 说明 | 生产必需 |
| --- | --- | --- |
| Node 服务 | `server/server.js`，单进程，托管 API 与静态前端 | 是（Node ≥ 22） |
| PostgreSQL 16 | 第二阶段起的正式数据层（`DB_DRIVER=postgres`） | 二阶段起必需 |
| Python + OR-Tools | CP-SAT 排课求解器（`server/solver/`） | 是（缺失回退启发式，全校规模排不满） |
| HTTPS 反向代理 | Nginx 等；摄像头扫码强制要求 HTTPS | 是 |
| 教室电脑浏览器 | 打开 `classroom.html` 展示动态签到码 | 试运行起 |

单实例部署即可支撑 3000 人同时在线（实测稳态 ~400 req/s、业务 P95 ≤ 35ms）。多实例部署前必须先解决：会话共享、审批超时扫描单实例化（见已知问题清单）。

## 2. 环境变量总表（生产必须逐项确认）

| 变量 | 阶段 | 必填 | 说明 |
| --- | --- | --- | --- |
| `PORT` / `HOST` | 一 | 否 | 默认 4173 / 0.0.0.0 |
| `SCHEDULER_PYTHON` | 一 | **是** | 指向装有 ortools 的 Python（如 `/opt/school-system/.venv-solver/bin/python`） |
| `TRUST_PROXY` | 一 | 反代后必填 `1` | 登录限流按 X-Forwarded-For 还原真实来源；不设则全校 NAT 共享限额 |
| `DB_DRIVER` | 二 | **是** | `json`（一阶段）→ `dual`（迁移观察）→ `postgres`（目标形态） |
| `DATABASE_URL` | 二 | postgres/dual 时必填 | 如 `postgresql://school:***@127.0.0.1:5432/school_system` |
| `HR_ENCRYPTION_KEY` | 二 | **是** | 人事敏感字段 AES-256-GCM 密钥（32 字节 base64）。**丢失=已加密证件/银行卡永久不可解**，离线备份至少两份 |
| `UV_THREADPOOL_SIZE` | 一 | 建议 `8` | 提升登录高峰的口令校验吞吐 |
| `ALLOW_SYNC_SCHEDULING` | 一 | 保持不设 | 同步排课接口仅开发调试用 |
| `DB_PRETTY` | 一 | 保持不设 | JSON 数据文件缩进（仅排查用） |

密钥生成：`node -e "import('./server/security/pii.js').then(m=>console.log(m.generateEncryptionKey()))"`

## 3. 首次部署（裸服务器 → 一阶段可用）

```bash
# 3.1 基础环境
# Node ≥ 22、Python3、Git、Nginx（略）；然后：
cd /opt && git clone git@github.com:Andrewyzzz/school-system.git && cd school-system
npm install                                        # 安装 pg 等依赖

# 3.2 排课求解器（生产必装）
python3 -m venv .venv-solver
.venv-solver/bin/pip install -r server/solver/requirements.txt

# 3.3 systemd 服务（示例 /etc/systemd/system/school-system.service）
# [Service]
# WorkingDirectory=/opt/school-system
# ExecStart=/usr/bin/node server/server.js
# Environment=SCHEDULER_PYTHON=/opt/school-system/.venv-solver/bin/python
# Environment=TRUST_PROXY=1
# Environment=UV_THREADPOOL_SIZE=8
# LimitNOFILE=65535
# Restart=always

# 3.4 初始化数据并启动
node server/seed.js          # 一阶段试运行种子（真实名单用教师导入功能替换）
systemctl enable --now school-system

# 3.5 Nginx HTTPS 反代到 127.0.0.1:4173（证书用 certbot 等，略）
```

### 3.6 部署自检（每次部署后必做）

```bash
curl -s https://<域名>/api/health
```

逐字段核对：

| 字段 | 期望值 | 不符时 |
| --- | --- | --- |
| `status` | `ok` | 看 systemd 日志 |
| `schedulingSolver` | `ortools-cp-sat` | 检查 SCHEDULER_PYTHON 与 venv |
| `storage.driver` | 按当前阶段（json/dual/postgres） | 检查 DB_DRIVER |
| `storage.lastSaveError` | `null` | 磁盘/数据库写入故障，立即处理 |
| `storage.postgres.connected`（二阶段） | `true` | 检查 DATABASE_URL |

## 4. 第一阶段验收

### 4.1 自动验收

用 `sysadmin` 或 `finance` 账号获取 token 后：

```bash
curl -s https://<域名>/api/phase1/readiness -H "Authorization: Bearer <token>"
```

全部检查项必须 `passed: true`（其中 `payroll_lock` 需要先跑过一轮结算；`scheduling_solver` 生产必过；二阶段部署后还会出现 `postgres_connection` / `hr_encryption_key` / `hr_timeout_scanner` / `hr_backfill` 四项）。

### 4.2 人工验收清单

按 `docs/phase1-acceptance-checklist.md` 执行，重点复核：

1. 真实教师名单已通过 `sysadmin` 账号的「教师导入」写入（模板 `templates/teacher-import-template.csv`），演示种子已清除。
2. 行政完整走一遍：任课配置（可用"自动分配空缺"打底）→ 预检无阻塞 → 异步生成 → 发布 → 老师端可见课表。
3. 真机验收扫码：学校实际手机 + HTTPS 域名，教室电脑开大屏页，老师完成一次真实签入签出；异常场景（错教室/过期码/重复扫）各验一次。
4. 财务完整走一遍：工资规则核对（对照学校工资方案盖章稿）→ 批量生成 → 老师确认 → 复核 → 锁定 → 导出 CSV 用 Excel 打开无乱码。
5. 全部管理账号（admin/finance/sysadmin/hr/head_*）修改默认密码；教师首登强制改密已默认开启。
6. 备份验证：确认 `server/data/backups/`（json 阶段）或 PostgreSQL 备份计划生效，并成功演练一次恢复。

### 4.3 一阶段试运行放行条件

- 自动验收全绿 + 人工清单签字；
- 已知问题清单（`docs/phase1-known-issues.md`）中"需要现场验证"项全部关闭；
- 回滚预案（第 7 节）已向运维交底。

## 5. 第二阶段部署（一阶段在线 → 人事管控上线）

### 5.1 前置条件（缺一不开工）

- [ ] 一阶段试运行验收通过；
- [ ] PostgreSQL 16 就绪，专用库与账号已建，仅内网可达；
- [ ] `HR_ENCRYPTION_KEY` 已生成并离线备份两份（保险柜/密码管理器各一）；
- [ ] 学校已确认：组织架构表、岗位清单、学部负责人人选、离职当月折算口径（默认自然日）。

### 5.2 数据迁移窗口（选低峰，预计 30 分钟内）

```bash
cd /opt/school-system

# ① 停服（保留 JSON 数据文件作为回滚底）
systemctl stop school-system

# ② 应用数据库 schema（投影表 + 补丁）
psql "$DATABASE_URL" -f database/postgres/001_phase1_schema.sql
psql "$DATABASE_URL" -f database/postgres/002_phase2_schema.sql
psql "$DATABASE_URL" -f database/postgres/003_phase2_m2_patch.sql

# ③ 试跑核对（不写库）
DATABASE_URL=... npm run migrate:postgres

# ④ 正式迁移 + 逐行核对报告（必须全绿才继续）
DATABASE_URL=... npm run migrate:postgres -- --commit

# ⑤ 双写观察启动（systemd 加 Environment=DB_DRIVER=dual + DATABASE_URL + HR_ENCRYPTION_KEY）
systemctl daemon-reload && systemctl start school-system

# ⑥ 观察期（建议 3 天）：每天跑一次试跑核对，应始终一致
DATABASE_URL=... npm run migrate:postgres      # diff 报告全绿 = 双写一致

# ⑦ 切换正式驱动：DB_DRIVER=postgres，重启，JSON 文件保留 ≥ 30 天作回滚底
```

启动时系统会自动完成第二阶段数据初始化（幂等）：组织树、岗位字典、默认薪资模板、存量教师 → 全员档案回填、hr 与学部负责人账号。**迁移后立即核对**：`readiness` 的 `hr_backfill` 通过（档案数 ≥ 教师数）。

### 5.3 上线初始配置

1. `hr` 账号登录 → 「组织与岗位」核对组织树与学校提供的架构表一致（教学学部的排课映射徽章必须正确）。
2. 三个学部负责人账号（head_primary/middle/high）交付对应负责人并改密；如学部人选与种子不符，由 sysadmin 停用种子账号、走入职流程建新账号。
3. 财务登录核对薪资模板金额（模板 payload 仅财务/总校可见）。
4. 人事按需要补录存量员工的证件/银行卡（录入即加密）与合同信息。

## 6. 第二阶段验收

### 6.1 自动验收

- 9 个测试套件在部署机通过（`npm run check` + `test:phase1/cross-grade/term-lifecycle/scheduling-jobs/postgres-export/pii/postgres-store/hr/hr-flows`，注意带 `SCHEDULER_PYTHON`）；
- `readiness` 新增四项（postgres_connection / hr_encryption_key / hr_timeout_scanner / hr_backfill）全部通过。

### 6.2 学校 UAT（按 `docs/phase2-trial-run-guide.md` 第 5 节，逐条签字）

1. 真实入职一例：学部发起 → 人事确认 → 总校终审 → 新账号登录成功且强制改密；
2. 跨学部调岗一例：双学部确认 → 终审 → 档案与教学侧学部同步、原学部收到课表移交提醒；
3. 离职一例：终审生效 → 生效日后课程自动取消、账号无法登录、当月工资固定项按天折算（财务核对金额）；
4. 越权验证：学部负责人查看其他学部档案被拒（403）；
5. 敏感留痕：修改证件号 → 审计只见掩码 diff；「查看完整」→ 审计出现 sensitive_view 记录（含操作人/原因/IP）；
6. 计薪拦截：对停用人员生成工资被拦截；对离职人员生成离职后月份被拦截；
7. 花名册导出无明文敏感信息，导出行为在审计中可查。

### 6.3 二阶段放行条件

- 6.1 + 6.2 全部通过并签字；
- 密钥备份完成确认（由校方信息负责人书面确认收到离线备份）；
- 双写观察期 diff 报告存档。

## 7. 回滚预案

### 7.1 代码回滚（任何阶段）

```bash
git revert <bad_commit> && git push origin main   # 本地革命并重新部署
# 或紧急场景：git checkout <last_good_tag> 后重启，事后补 revert 提交
```

### 7.2 二阶段数据层回滚（postgres → json）

触发条件：PostgreSQL 故障且短时间无法恢复。

```bash
systemctl stop school-system
# JSON 文件是双写/切换前保留的回滚底；确认其 meta.updatedAt 可接受（会丢失切换后的增量！）
# systemd 改回 Environment=DB_DRIVER=json，重启
systemctl start school-system
```

> 注意：回滚会丢失切换到 postgres 之后产生的全部数据增量，属最后手段；优先修复数据库（备库/PITR）。回滚后 HR 功能继续可用（JSON 驱动同样支持），但应尽快修复并重新迁移。

### 7.3 事故记录

任何回滚/事故按 `docs/system-update-process.md` 第 10 节模板记入 CHANGELOG。

## 8. 日常运维 Runbook

| 项 | 频率 | 动作 |
| --- | --- | --- |
| 健康检查 | 监控系统每分钟 | `GET /api/health`，告警条件：status≠ok、lastSaveError≠null、schedulingSolver=fallback-heuristic、postgres.connected=false |
| readiness 巡检 | 每日 | 管理 token 调用，任何 FAIL 项当日处理 |
| PostgreSQL 备份 | 每日全量 + WAL 归档 | 备份文件加密存储，保留 90 天；每月恢复演练一次并记录 |
| JSON 备份（json/dual 阶段） | 自动（滚动 50 份） | 确认 `server/data/backups/` 所在磁盘独立或有外部同步 |
| 密钥审计 | 每季度 | 核对 HR_ENCRYPTION_KEY 离线备份完好；轮换需先解密重加密（专项操作，勿直接换） |
| 审批超时 | 自动（小时级扫描） | readiness 的 hr_timeout_scanner 反映任务存活 |
| SSE 实时推送 | 自动 | /api/events 单实例广播待办/通知；多实例部署需接 Redis pub/sub 转发广播，否则跨实例事件不通 |
| 磁盘/连接数 | 监控系统 | LimitNOFILE=65535；磁盘 >80% 告警 |

## 9. 验收签字表（模板）

| 项目 | 结论（通过/不通过） | 验收人 | 日期 | 备注 |
| --- | --- | --- | --- | --- |
| 一阶段自动验收（readiness 全绿） | | | | |
| 一阶段人工清单（4.2 六项） | | | | |
| 真机扫码验收 | | | | |
| 二阶段迁移核对报告全绿 | | | | |
| 双写观察期一致性 | | | | |
| 二阶段 UAT 七项 | | | | |
| 密钥离线备份确认 | | | | |
| 回滚预案交底 | | | | |

## 10. 关联文档

- 日常更新流程：`docs/system-update-process.md`
- 数据迁移细节：`docs/database-migration-plan.md`
- 一阶段验收清单：`docs/phase1-acceptance-checklist.md`
- 一阶段试运行手册：`docs/phase1-trial-run-guide.md`
- 二阶段试运行手册：`docs/phase2-trial-run-guide.md`
- 已知问题：`docs/phase1-known-issues.md`
- 二阶段 PRD：`docs/学校人事管控系统-第二阶段PRD.md`
