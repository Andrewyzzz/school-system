# 系统更新流程

本文档用于给后续加入项目的开发、测试和运维人员说明：代码如何改、如何验证、如何发布到生产站点，以及每次更新如何记录。

## 1. 当前环境约定

| 项目 | 当前约定 |
| --- | --- |
| GitHub 仓库 | `Andrewyzzz/school-system` |
| 默认分支 | `main` |
| 本地开发端口 | `4173` |
| 生产站点 | `https://fuyuanschool.xyz` |
| 生产代码目录 | `/opt/school-system` |
| 生产服务名 | `school-system` |
| 健康检查 | `https://fuyuanschool.xyz/api/health` |

注意：

- 不要把 SSH 私钥、服务器密码、API Token、数据库密码、微信小程序密钥写入仓库。
- 老师端只能展示本人总薪资和工作量状态，不展示逐课时金额、薪资项目拆分或财务核算明细。
- 财务端保留薪资明细、薪资规则和结算操作。
- 行政端保留排课、教师导入、人员列表和基础配置维护。

## 2. 每次开发前

1. 确认需求范围
   - 明确这次更新影响哪些角色：老师、财务、行政、教室大屏、小程序。
   - 明确是否影响后端接口、数据结构、服务器配置或线上验收流程。
   - 如果涉及薪资、考勤、权限，优先检查是否会把财务明细泄露给老师端。

2. 同步最新代码

```bash
git checkout main
git pull --ff-only origin main
```

3. 查看当前任务和文档

```bash
sed -n '1,220p' PHASE1_TODO.md
sed -n '1,220p' CHANGELOG.md
```

4. 本地启动

```bash
npm run seed
npm run dev
```

5. 确认排课求解器依赖（生产必装）

排课系统的正式求解器是 Google OR-Tools CP-SAT（Python）。没有它时后端会自动回退到内置启发式算法：小年级可用，全校规模会出现课程排不满、质量分偏低，`test:phase1` 和 `test:benchmark` 也无法完整通过。

```bash
# 建议使用独立 venv，避免污染系统 Python
python3 -m venv .venv-solver
.venv-solver/bin/pip install -r server/solver/requirements.txt

# 启动服务时指定求解器 Python
SCHEDULER_PYTHON=.venv-solver/bin/python npm run dev

# 跑测试时同样指定
SCHEDULER_PYTHON=.venv-solver/bin/python npm run test:phase1
```

验证方式：

- `GET /api/health` 返回 `schedulingSolver: "ortools-cp-sat"`（回退时为 `fallback-heuristic`）。
- `GET /api/phase1/readiness` 中 `scheduling_solver` 检查项必须通过。
- 行政排课预检面板：求解器不可用时会出现 “OR-Tools CP-SAT 求解器不可用” 提醒项。

生产服务器部署时，`SCHEDULER_PYTHON` 需要写入服务的环境变量（systemd unit 或启动脚本），并在每次服务器迁移后重新验证。

6. 第二阶段新增环境变量

| 变量 | 说明 |
| --- | --- |
| `DB_DRIVER` | 数据层驱动：`json`（默认）/ `postgres` / `dual`（迁移双写观察） |
| `DATABASE_URL` | PostgreSQL 连接串（默认 `postgresql://localhost:5432/school_system_dev`） |
| `HR_ENCRYPTION_KEY` | 人事敏感字段 AES-256-GCM 密钥（32 字节 base64，可用 `node -e "import('./server/security/pii.js').then(m=>console.log(m.generateEncryptionKey()))"` 生成）。**丢失密钥 = 已加密的证件/银行卡永久无法解密**，生产密钥必须离线备份；未配置时系统拒绝写入/读取敏感字段（不会明文落库），其余功能不受影响。 |


打开：

```text
http://127.0.0.1:4173/
```

## 3. 本地开发规范

### 3.1 前端修改

常见文件：

- `index.html`：网页端页面结构。
- `styles.css`：网页端样式和移动端兼容。
- `app.js`：网页端交互、状态、接口调用和本地 Demo 逻辑。
- `classroom.html`：教室大屏动态二维码页面。
- `miniprogram/`：微信小程序 MVP。

要求：

- 老师端界面优先按手机宽度检查。
- 表格类页面要有移动端卡片化或横向溢出处理。
- 课表、签到、月度确认页面不能出现老师不该看的薪资明细。
- 修改老师端薪资口径时，要同时检查网页端和小程序文案。

### 3.2 后端修改

常见文件：

- `server/server.js`：HTTP API 路由。
- `server/storage.js`：数据读写。
- `server/auth.js`：登录、Token、密码。
- `server/scheduling.js`：排课、约束、发布。
- `server/attendance.js`：签到、动态码、考勤校验。
- `server/solver/ortools_scheduler.py`：OR-Tools CP-SAT 排课求解。

要求：

- 任何老师端接口都必须做本人权限校验。
- 财务和行政接口要校验角色。
- 后端返回给老师端的数据要脱敏，尤其是薪资明细、逐课金额、全校人员工资。
- 排课改动后要检查教师、班级、教室三个维度的冲突。

### 3.3 数据和配置

常见文件：

- `server/seed.js`：种子数据。
- `templates/teacher-import-template.csv`：教师导入模板。
- `docs/phase1-field-dictionary.md`：字段字典。
- `docs/database-migration-plan.md`：后续数据库迁移方案。

要求：

- Demo 数据可以调整，但要保持 1000 个教师账号测试规模可用。
- 字段含义变化时，同步更新字段字典。
- 不要把真实学校人员数据提交到仓库。

## 4. 本地验证清单

每次提交前至少执行：

```bash
npm run check
npm run test:phase1
```

如果只想快速检查核心文件：

```bash
node --check app.js
node --check server/server.js
find miniprogram -name '*.js' -print0 | xargs -0 -n1 node --check
node tests/phase1-production.test.js
```

### 4.1 老师端重点验收

- 登录老师账号后，只能看到本人数据。
- 首页能看到课时、待处理、异常、总薪资。
- 我的课表按自然周展示，手机端不横向溢出。
- 课表每节课不显示逐课金额、津贴或薪资拆分。
- 签入/签出入口能按课表、教室、时间窗口校验。
- 考勤记录能显示通过和拦截记录。
- 月度确认能看到工作量状态和总薪资，但不显示薪资明细。

### 4.2 财务端重点验收

- 财务能查看不同老师的考勤记录。
- 财务能查看工作量明细、生成薪资、复核、锁定、导出。
- 财务端金额明细保留。
- 财务不能修改行政排课配置，除非该账号同时具备行政角色。

### 4.3 行政端重点验收

- 行政能查看全校人员列表。
- 行政能导入教师账号。
- 行政能配置课程、约束、教师池。
- 一键排课后无教师、班级、教室时间冲突。
- 发布后老师端课表同步更新。

### 4.4 手机端重点验收

在窄屏下检查：

- 底部导航不遮挡核心操作。
- 顶部按钮不超出屏幕。
- 课表像日历一样可快速看周次、日期和当天日程。
- 表格页面没有不可读的横向挤压。
- 扫码入口要提示 HTTPS 和摄像头授权要求。

## 5. 提交规范

提交前查看改动：

```bash
git status --short
git diff
```

提交：

```bash
git add <changed-files>
git commit -m "<简短英文提交信息>"
git push origin main
```

建议提交信息：

- `Polish teacher payroll and mobile schedule`
- `Add deployment update guide and changelog`
- `Fix teacher schedule salary visibility`
- `Improve scheduling constraints`

## 6. 每次更新必须维护更新日志

从 `2026-06-16` 开始，每次功能、修复、部署或文档更新，都要在仓库根目录的 `CHANGELOG.md` 增加一条记录。

记录格式：

```md
## YYYY-MM-DD - 更新标题

- 类型：功能 / 修复 / 文档 / 部署 / 安全 / 测试
- 影响范围：老师端 / 财务端 / 行政端 / 后端 / 小程序 / 服务器
- 提交：`commit_sha`
- 部署：未部署 / 已部署到生产
- 验证：
  - `npm run check`
  - `npm run test:phase1`
  - 其他人工验证说明
- 内容：
  - 变更点 1
  - 变更点 2
- 注意事项：
  - 后续需要关注的问题
```

如果只是文档更新，也要记录。这样后续开发可以从 `CHANGELOG.md` 快速知道系统为什么变成现在这样。

## 7. 生产发布流程

发布前确认：

- 本地已经通过测试。
- 代码已经推送到 GitHub。
- `CHANGELOG.md` 已记录本次更新。
- 本次更新不包含明文密钥或真实敏感数据。

### 7.1 登录服务器并拉取代码

由有权限的维护人员使用自己的 SSH 私钥登录服务器。不要把私钥路径写死到仓库文档里。

```bash
ssh -i <your_private_key.pem> root@<server_host>
cd /opt/school-system
git pull --ff-only origin main
```

### 7.2 服务器上做语法检查

```bash
node --check app.js
node --check server/server.js
```

如果改到了其他后端脚本，也要一起检查：

```bash
npm run check
```

### 7.3 重启服务

```bash
systemctl restart school-system
systemctl is-active school-system
```

`is-active` 应返回：

```text
active
```

### 7.4 健康检查

```bash
curl -sS https://fuyuanschool.xyz/api/health
```

正常返回应类似：

```json
{
  "status": "ok",
  "service": "school-system-phase1-api"
}
```

### 7.5 发布后人工验收

至少检查：

- 打开 `https://fuyuanschool.xyz`。
- 老师账号登录后首页、课表、扫码入口、考勤记录、月度确认、总薪资可用。
- 财务账号登录后老师记录、薪资结算可用。
- 行政账号登录后排课页和人员列表可用。
- 如果本次涉及手机端，必须用手机浏览器打开生产站点检查一次。

## 8. 回滚流程

优先使用“回滚提交”的方式，不建议直接在生产服务器上做不可追踪的强制回退。

### 8.1 推荐回滚方式

在本地创建回滚提交：

```bash
git checkout main
git pull --ff-only origin main
git revert <bad_commit_sha>
git push origin main
```

然后按“生产发布流程”重新发布。

### 8.2 紧急处理原则

如果线上出现登录不可用、工资数据错乱、排课发布错误、签到无法提交等严重问题：

1. 先记录当前问题、时间、影响角色和截图。
2. 如果可以通过配置或重启恢复，先恢复服务。
3. 如果必须回滚，由负责人确认回滚目标提交。
4. 回滚后补充 `CHANGELOG.md`，说明故障原因、处理方式和后续修复计划。

## 9. 常见更新场景

### 9.1 只改网页样式

需要做：

- `node --check app.js`
- 浏览器检查桌面和手机宽度
- 更新 `CHANGELOG.md`
- 推送并发布

### 9.2 改接口或权限

需要做：

- `npm run check`
- `npm run test:phase1`
- 至少人工测试老师、财务、行政三个账号
- 检查老师端接口是否脱敏
- 更新 `CHANGELOG.md`
- 推送并发布

### 9.3 改排课算法

需要做：

- 检查行政排课生成、锁定、重排、发布
- 检查教师、班级、教室冲突
- 检查老师端课表是否同步
- 如果改 OR-Tools 依赖，要确认服务器 Python 环境可用
- 更新 `CHANGELOG.md`

### 9.4 改扫码签到

需要做：

- 检查 HTTPS 下摄像头权限说明
- 检查教室大屏动态二维码
- 检查老师签入、签出、重复扫码、错教室、过期码、非本人课表
- 检查考勤记录和月度工作量是否同步
- 更新 `CHANGELOG.md`

### 9.5 改小程序

需要做：

- 检查 `miniprogram/app.json`
- 检查相关页面 `.js` 语法
- 在微信开发者工具里预览
- 确认接口域名使用 HTTPS
- 更新 `CHANGELOG.md`

## 10. 发布事故记录模板

如果更新造成线上问题，在 `CHANGELOG.md` 对应日期下补充：

```md
### 事故记录

- 发现时间：
- 影响范围：
- 表现：
- 原因：
- 处理：
- 恢复时间：
- 后续预防：
```
