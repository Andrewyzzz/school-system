# 更新日志

从 `2026-06-16` 开始，本项目每次功能、修复、部署或文档更新都必须记录在这里。

## 2026-06-23 - 薪资结算流程置顶

- 类型：前端 / 体验优化
- 影响范围：财务端薪资结算工作台
- 提交：本次提交
- 部署：本次提交后部署到生产站
- 验证：
  - `git diff --check`
  - `node tests/phase1-production.test.js`
- 内容：
  - “本月结算流程”从老师筛选工作台下方继续上移到页面标题后方。
  - 财务进入“薪资结算”后，先看到月度结算流程和保存进度，再选择具体老师处理工资单。

## 2026-06-23 - 薪资结算流程移到顶部并显示保存进度

- 类型：前端 / 后端汇总 / 体验优化
- 影响范围：财务端薪资结算工作台 / 教师列表接口
- 提交：本次提交
- 部署：本次提交后部署到生产站
- 验证：
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check app.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check server/storage.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check server/server.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check tests/phase1-production.test.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/phase1-production.test.js`
  - `git diff --check`
  - 本地接口验证 `GET /api/teachers?month=2026-06&page=1&pageSize=20` 返回 `meta.payrollStatusCounts`，当前数据为已完成 1、已发布 998、已保存 1。
- 内容：
  - “本月结算流程”从工资档案与明细中间移到薪资结算页顶部，作为月度总览。
  - 流程标题右侧新增进度数字：已保存、未保存、已发布、已完成。
  - 教师列表接口新增 `meta.payrollStatusCounts`，按当前筛选范围统计全部老师状态，而不是只统计当前页 20 位老师。
  - 移动端下进度数字改为两列展示，避免顶部拥挤。

## 2026-06-23 - 薪资结算改为先保存再统一发布

- 类型：功能 / 流程调整 / 前后端
- 影响范围：财务端薪资结算 / 老师端工资确认 / 后端工资状态
- 提交：本次提交
- 部署：本次提交后部署到生产站
- 验证：
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check app.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check server/storage.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check server/server.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/phase1-production.test.js`
  - `git diff --check`
  - 内存副本验证：单个老师保存后状态为 `saved`，发布后状态为 `generated`，未写入真实数据库。
- 内容：
  - 单个老师工资单改为先点击“保存该老师工资”，状态进入“已保存”财务草稿。
  - “已保存”状态不会发布到老师端，老师端仍显示财务尚未发布本月工资明细。
  - 原“生成本月工资”改为“发布本月工资明细”，发布前增加确认弹窗。
  - 发布本月工资时，已保存的工资单转为“等待老师确认”，未保存的老师按当前规则生成并发布。
  - 工资状态列表新增“已保存”分组，区分财务草稿和已发布待确认。
  - 结算流程步骤改为“保存草稿、发布确认、财务处理、锁定发放”。
- 注意事项：
  - 如果保存草稿后又修改了该老师工资档案或本月奖扣，需要重新点击“保存该老师工资”刷新草稿，再统一发布。

## 2026-06-23 - 优化薪资结算流程按钮布局

- 类型：前端 / 体验优化
- 影响范围：财务端薪资结算工作台
- 提交：本次提交
- 部署：本次提交后部署到生产站
- 验证：
  - `git diff --check`
- 内容：
  - 结算流程下方操作区从左侧小块布局改为两段式铺满布局。
  - “生成与导出”按钮等宽排列，“财务结算”三个按钮等宽排列，减少右侧大面积留白。
  - 移动端下按钮自动改为单列，避免窄屏拥挤。

## 2026-06-23 - 财务端新增历史工资记录

- 类型：功能 / 后端接口 / 前端
- 影响范围：财务端工资记录 / 工资明细导出 / 后端工资快照
- 提交：本次提交
- 部署：本次提交后部署到生产站
- 验证：
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check app.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check server/storage.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check server/server.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/phase1-production.test.js`
  - `git diff --check`
  - 本地健康检查 `http://127.0.0.1:4184/api/health`
  - 财务账号验证 `GET /api/payroll/history?termId=TERM-2026-PHASE1&month=2026-06` 返回 999 份工资快照，其中已锁定 1 份、已发实发 9171 元。
  - 财务账号验证 `GET /api/payroll/export?termId=TERM-2026-PHASE1&month=2026-06` 返回 999 行导出数据，CSV 表头包含“学期”列。
- 内容：
  - 财务端和行政端新增“工资记录”栏目，独立于“薪资结算工作台”。
  - 支持按学期、月份查询历史工资快照。
  - 汇总展示当月已锁定发放的实发工资、已发应发、代扣个税和工资单状态数量。
  - 明细表展示老师、学部年级、科目、结算状态、应发、个税、实发和锁定时间。
  - 新增后端 `GET /api/payroll/history` 接口，按同一口径聚合工资快照。
  - 工资明细 CSV 导出支持按 `termId` 过滤，并新增“学期”列。
- 注意事项：
  - “当月已发实发”只统计状态为“已锁定”的工资单，未确认、异议中、待锁定的工资单不会计入已发总额。

## 2026-06-23 - 财务端工资档案按学期维护

- 类型：功能 / 体验优化 / 后端计算
- 影响范围：财务端薪资结算 / 教师工资档案 / 本月特殊奖扣
- 提交：本次提交
- 部署：本次提交后部署到生产站
- 验证：
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check app.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check server/payroll.js`
  - `/Users/yyzzz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node tests/phase1-production.test.js`
  - `git diff --check`
  - 本地健康检查 `http://127.0.0.1:4184/api/health`
- 内容：
  - 财务端“教师工资档案”改为“本学期工资档案”，默认只读，点击“编辑档案”后才可修改，保存后影响未锁定工资。
  - 试用期比例移入“特殊用工状态”，不再作为每个老师每月必填字段展示。
  - 移除长期档案里的“考勤人工扣减”，改为在“本月特殊奖扣”中选择“考勤扣减”录入。
  - 本月特殊奖扣支持“奖励/补发、考勤扣减、其他扣减”三类，并拆出独立“保存本月奖扣”按钮，不再被“编辑学期档案”锁住。
  - 保存学期工资档案时不再携带本月特殊奖扣，保存本月奖扣时仅提交 `manualItems`。
  - 移除财务界面里的“批量编辑本月奖扣 JSON”技术入口，仅保留表单式奖扣录入。
  - 移除财务端重复的“工资计算说明”面板，薪资构成统一只在“工资明细”表中查看。
  - 前后端统一按奖扣类型参与薪资计算。
  - 班主任学生数继续只在勾选“班主任”后显示和参与计算。
- 注意事项：
  - 当前本月特殊奖扣仍暂存于老师薪资档案的 `manualItems` 字段；后续生产化应拆为独立的月度调整表，支持按月份归档和审计。

## 2026-06-22 - 财务和行政通知中心支持发布通知

- 类型：功能 / 前端 / 后端对接
- 影响范围：通知中心 / 财务端 / 行政端 / 老师端通知栏
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `git diff --check`
  - 浏览器验证：本地财务账号进入“通知中心”后显示“发布通知”面板，接收范围包含全体老师、全部账号、财务内部、行政内部。
  - 接口验证：财务账号调用 `POST /api/notifications` 成功创建 `finance` 接收范围的重要通知。
- 内容：
  - 通知中心顶部新增“发布通知”表单，行政、财务、系统管理员可见，老师端隐藏。
  - 支持选择接收范围、通知等级、标题和正文，发布后调用后端通知接口并刷新通知栏。
  - 后端模式下通知列表固定读取真实后端通知，避免后端通知为空时回退显示本地演示通知。

## 2026-06-21 - 部署生产站点 fuyuanschool.xyz

- 类型：部署 / 文档 / 服务器
- 影响范围：生产站点 / HTTPS / Nginx / 更新流程文档
- 提交：本次提交
- 部署：已部署到 `https://fuyuanschool.xyz`
- 验证：
  - GitHub 最新代码已在服务器 `/opt/school-system` 拉取到 `c061165`
  - `node --check app.js`
  - `node --check server/server.js`
  - `systemctl is-active school-system`
  - `nginx -t`
  - `curl -fsSL https://fuyuanschool.xyz/api/health`
  - 浏览器验证：`https://fuyuanschool.xyz/?v=production-deploy` 可打开登录页，并显示 10 个小学部排课老师账号。
- 内容：
  - DNS 已确认 `fuyuanschool.xyz` 和 `www.fuyuanschool.xyz` 指向 `47.76.189.5`。
  - 服务器新增 `school-system-xyz` Nginx 站点配置，反向代理到本机 `127.0.0.1:4173`。
  - 使用 Certbot 签发并部署 `fuyuanschool.xyz` / `www.fuyuanschool.xyz` HTTPS 证书，证书到期日为 `2026-09-19`，自动续期任务已启用。
  - 更新系统更新流程文档，将生产站点和健康检查地址切换为 `fuyuanschool.xyz`。

## 2026-06-21 - 登录页新增小学部排课老师账号入口

- 类型：功能 / 前端 / 账号体验
- 影响范围：登录页 / 老师端验收 / 小学部排课
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `git diff --check`
  - 浏览器验证：`http://127.0.0.1:4184/?v=scheduled-teacher-login` 登录页显示 10 个小学部已排课老师账号；点击 `teacher0871` 会填入用户名和默认密码；提交后可进入郝云昕老师端，侧边栏显示“小学部 · 语文”。
- 内容：
  - 登录页新增“小学部排课老师账号”区域，展示当前小学部课表中实际有课的老师账号。
  - 每个账号按钮显示老师姓名、科目、用户名和课时数，点击后自动填入用户名和默认密码 `123456`。
  - 后端不可用时，本地 fallback 也能识别这些排课老师账号并进入老师端。

## 2026-06-21 - 行政端新增课表总览栏目

- 类型：功能 / 前端 / 排课
- 影响范围：行政端 / 课表查看 / 排课发布结果
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `git diff --check`
  - 浏览器验证：`http://127.0.0.1:4184/?v=admin-schedule-overview` 中行政左侧新增“课表总览”，可按学部、年级、班级查看当前周课表；总览页课节为只读状态，不出现拖拽编辑入口。
- 内容：
  - 行政侧新增独立“课表总览”导航，避免只能在“行政排课”编辑页底部查看班级课表。
  - 总览页提供学部、年级、班级三级选择，并展示当前学期、自然周、发布状态、课时数和冲突数。
  - 总览课表复用同一份后端排课数据，但强制只读，防止查看页面误触编辑。

## 2026-06-21 - 打磨课程规则编辑态 UI

- 类型：前端 / 体验 / 排课
- 影响范围：行政排课 / 课程与分布规则
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - 浏览器验证：`http://127.0.0.1:4184/?v=course-rule-ui-polish` 进入课程编辑态后，课程规则卡片改为单列配置面板；分布规则 4 个输入等宽，覆盖天数自动提示从输入框下方改为独立提示条。
- 内容：
  - 编辑态隐藏冗长的课程摘要，避免和输入项重复。
  - 将课程规则分为“分布规则”和“排课偏好”两组，减少视觉混乱。
  - 课程规则卡片在桌面端改为更宽的单卡布局，避免两列卡片造成输入框拥挤。
  - 覆盖天数自动禁用说明改为提示条，并保留 active 状态样式。

## 2026-06-21 - 优化课程覆盖天数配置联动

- 类型：优化 / 前端 / 后端 / 排课 / 测试
- 影响范围：行政排课 / 课程与分布规则 / 课程规则保存
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `node tests/phase1-production.test.js`
  - `node tests/scheduling-jobs.test.js`
  - 本地接口验证：故意提交 `minPerClassPerDay=1` 且 `minWeeklyDays=5`，保存后后端返回 `minWeeklyDays=0`。
  - 浏览器验证：`http://127.0.0.1:4184/?v=coverage-toggle-saved` 中语文规则显示“每天至少 1 节（自动覆盖 5 天）”，覆盖天数输入框为禁用状态且值为 0。
- 内容：
  - 当课程设置“每天至少 N 节”时，前端自动禁用“覆盖天数”，并提示“已由每天至少规则自动覆盖 5 个教学日”。
  - 保存课程规则时，如果每天至少大于 0，前端和后端都会把 `minWeeklyDays` 归零，避免同一规则重复配置。
  - 课程摘要调整为“每天至少 N 节（自动覆盖 5 天）”，减少管理员理解成本。
  - 生产回归测试新增断言，确保旧数据即使传入覆盖天数，也会被每天至少规则覆盖并归零。

## 2026-06-21 - 排课课程分布规则与操作界面收口

- 类型：功能 / 前端 / 后端 / 排课 / 求解器 / 测试
- 影响范围：行政排课 / 课程规则 / OR-Tools / 冲突校验 / 质量诊断
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `node --check tests/scheduling-jobs.test.js`
  - `node --check tests/scheduling-solver-benchmark.test.js`
  - `PYTHONPYCACHEPREFIX=/private/tmp/codex-pycache python3 -m py_compile server/solver/ortools_scheduler.py`
  - `node tests/phase1-production.test.js`
  - `node tests/scheduling-jobs.test.js`
  - `node tests/scheduling-solver-benchmark.test.js`（3 个规模均为 OR-Tools CP-SAT，fallback 0，冲突 0，平均耗时 13.7 秒，平均评分 67）
  - 浏览器验证：`http://127.0.0.1:4184/?v=course-distribution-rules` 行政排课页显示“课程与分布规则”“禁排硬约束”两个清晰分区，编辑态每门课均显示每天至少、每天最多、覆盖天数、最多连续字段。
- 内容：
  - 课程规则新增“每天至少几节、每天最多几节、每周至少覆盖几天、同班最多连续几节”，支持语文每天都有、体育一天最多一节、数学最多连续两节等真实教务规则。
  - OR-Tools CP-SAT、后端冲突校验、排课前预检、手动调整校验和本地试运行逻辑均纳入新课程分布规则。
  - 行政排课页面把“编辑课程”整理为“课程与分布规则”，把课程分布规则集中在课程配置内，硬约束区域专注禁排规则，降低操作混乱感。
  - 质量诊断的“同班同科过度集中”改为参考每门课自己的每日上限，避免把已允许的数学连堂误报成异常。
  - 生产回归测试新增课程分布断言，覆盖每班每天语文 1 节、体育每天最多 1 节、数学最多连续 2 节。

## 2026-06-21 - 学期管理支持删除误建学期

- 类型：功能 / 前端 / 后端 / 学期管理
- 影响范围：行政排课 / 学期管理 / 数据安全
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/storage.js`
  - `node --check server/server.js`
  - `node --check tests/phase1-production.test.js`
  - `node tests/phase1-production.test.js`
  - `git diff --check`
- 内容：
  - 学期列表新增“删除”操作，用于删除录错且尚未投入使用的计划中学期。
  - 后端新增删除学期接口，只允许删除非当前、计划中、没有排课/考勤/薪资/月度确认/调课等业务数据的学期。
  - 删除误建学期时同步清理该学期复制出来的班级、教室、课程、任课、硬约束、老师时间规则和教室资源配置。
  - 已产生业务数据的学期禁止硬删除，仍然走归档流程，避免破坏历史数据。

## 2026-06-21 - 教室资源类型支持自定义增删

- 类型：功能 / 前端 / 后端 / 排课 / 求解器
- 影响范围：行政排课 / 教室资源 / 课程规则 / OR-Tools
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `PYTHONPYCACHEPREFIX=/private/tmp/codex-pycache python3 -m py_compile server/solver/ortools_scheduler.py`
  - `node tests/phase1-production.test.js`
  - `node tests/scheduling-jobs.test.js`
  - `node tests/scheduling-solver-benchmark.test.js`
  - `git diff --check`
- 内容：
  - 教室资源类型不再固定为实验室、机房、操场、美术室、音乐室，行政可在页面上添加或删除类型。
  - 课程规则“教室要求”下拉改为读取当前教室资源类型，新增舞蹈房、录播室等类型后可直接绑定课程。
  - 后端保存 `roomResourceTypes`、数量和具体教室目录，支持某个学部/学期没有音乐室或新增自定义资源类型。
  - OR-Tools 求解器不再把未知教室类型降级为普通教室，自定义类型继续参与教室资源约束。

## 2026-06-21 - 教室目录支持自定义名称

- 类型：功能 / 前端 / 后端 / 排课
- 影响范围：行政排课 / 班级结构 / 教室资源 / 教室目录
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `node tests/phase1-production.test.js`
  - `node tests/scheduling-jobs.test.js`
  - `node tests/scheduling-solver-benchmark.test.js`
  - `git diff --check`
  - 浏览器验证：`http://127.0.0.1:4184/?v=room-catalog-config` 行政排课页显示普通教室目录和专用教室目录，保存班级结构、保存教室资源均成功，预检状态为“预检通过”。
- 内容：
  - 班级结构区域新增普通教室目录，可按班级维护真实教室名称，例如 `小学一楼A101`。
  - 教室资源区域新增专用教室目录，可按实验室、机房、操场、美术室、音乐室维护真实名称。
  - 保存班级结构时同步保存普通教室目录；保存教室资源时同步保存专用教室目录。
  - 后端排课配置返回具体教室名称，后续课表、签到教室、换教室和二维码展示均可复用该目录。

## 2026-06-21 - 行政排课新增教室资源配置

- 类型：功能 / 前端 / 后端 / 排课
- 影响范围：行政排课 / 教室资源 / 学期配置 / 预检
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check server/storage.js`
  - `node --check server/server.js`
  - `node --check tests/phase1-production.test.js`
  - `node tests/phase1-production.test.js`
  - `node tests/scheduling-jobs.test.js`
  - `node tests/scheduling-solver-benchmark.test.js`
  - `git diff --check`
  - 浏览器验证：`http://127.0.0.1:4184/?v=room-resource-config` 行政排课页显示“教室资源”面板，顶部指标显示“6 门”“200 名”，保存教室资源 toast 返回成功，预检状态为“预检通过”。
- 内容：
  - 新增行政端“教室资源”面板，普通教室跟随班级结构自动生成，实验室、机房、操场、美术室、音乐室可按数量维护。
  - 新增后端 `/api/scheduling/rooms` 接口，教室资源按学期、学部保存，并在保存后清理受影响排课草稿。
  - 学期复制配置时同步复制教室资源配置。
  - 顶部排课概览移除 `课程/规则`、`老师/教室` 的斜杠数字展示，改为“X 门课程”“Y 名老师”等可读指标。

## 2026-06-21 - 修复保存班级老师服务端错误

- 类型：修复 / 前端 / 后端 / 排课
- 影响范围：行政排课 / 班级任课老师 / 本地 JSON 数据库写入
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/storage.js`
  - `git diff --check`
  - 浏览器验证：刷新 `http://127.0.0.1:4184/?v=save-teachers-fix-live` 后点击“保存班级老师”，toast 返回“任课配置已保存，重新生成排课时生效”，预检状态为“预检通过”。
- 内容：
  - 班级任课老师保存从 6 个科目并发 POST 改为顺序 POST，避免多个请求同时写本地数据库。
  - `saveDatabase` 增加写入队列，并使用唯一临时文件名，避免并发写入共用 `phase1-db.json.tmp` 导致 `ENOENT` 或 500。

## 2026-06-21 - 修复学期复制配置复选框视觉

- 类型：修复 / 前端 / 体验
- 影响范围：行政排课 / 学期管理
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `git diff --check`
  - 浏览器验证：`#copyTermConfig` 控件尺寸为 16x16，文案调整为“沿用当前课程、班级和任课配置”。
- 内容：
  - 将新建学期区域的大号系统 checkbox 收敛为轻量复选框。
  - 简化复制配置文案，避免它看起来像主操作按钮。

## 2026-06-21 - 行政排课体验打磨

- 类型：前端 / 体验 / 文档 / 排课
- 影响范围：行政排课 / 生成前状态 / 预检引导 / 页面概览
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check tests/phase1-production.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
  - 浏览器验证：`http://127.0.0.1:4184/?v=ux-polish-check` 加载最新样式，就绪卡显示当前卡点，“去补老师”可跳转到班级老师配置区。
- 内容：
  - 行政排课顶部概览新增课程/规则、老师/教室统计，打开页面即可看到当前年级排课资源是否完整。
  - 生成与发布区域新增“生成前状态”就绪卡，按学期、班级老师、预检、草稿四步展示当前卡点。
  - 就绪卡支持快捷跳转：去补老师、重新预检、查看阻塞项、查看冲突或直接发布。
  - 一键生成和确认发布按钮增加禁用原因，减少“按钮灰了但不知道为什么”的试用困惑。
  - 新增桌面、平板、手机响应式样式，保证就绪卡在窄屏下可读。

## 2026-06-21 - 增强排课质量诊断报告

- 类型：功能 / 前端 / 后端 / 测试 / 文档 / 排课
- 影响范围：行政排课 / 质量评分 / 诊断报告 / 资源紧张度 / benchmark
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check server/scheduling.js`
  - `node --check app.js`
  - `node --check tests/phase1-production.test.js`
  - `node --check tests/scheduling-jobs.test.js`
  - `node --check tests/scheduling-solver-benchmark.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
  - `node tests/scheduling-jobs.test.js`
  - `node tests/scheduling-solver-benchmark.test.js`（3 个规模均为 OR-Tools CP-SAT，fallback 0，冲突 0，未排 0，平均耗时 14.1 秒，平均评分 68）
- 内容：
  - 排课质量报告的扣分项新增代表课节明细，行政能看到低分项具体影响了哪些班级、课程、老师和节次。
  - 新增资源紧张度诊断：最紧张老师、最紧张教室、候选最少课程，帮助管理员判断是老师池、教室资源还是规则过窄导致排课质量下降。
  - 行政端质量评分卡增加诊断摘要区，排课后不再只显示技术分数，而是直接展示可操作的调整方向。
  - 生产回归测试新增质量诊断字段断言，确保候选数量和代表课节持续返回。

## 2026-06-21 - 学期配置独立化

- 类型：功能 / 后端 / 前端 / 测试 / 文档
- 影响范围：学期管理 / 排课配置 / 任课配置 / 教室二维码库 / 测试基准
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check server/scheduling.js`
  - `node --check server/storage.js`
  - `node --check server/server.js`
  - `node --check app.js`
  - `node --check tests/phase1-production.test.js`
  - `node --check tests/scheduling-jobs.test.js`
  - `node --check tests/scheduling-solver-benchmark.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
  - `node tests/scheduling-jobs.test.js`
  - `node tests/scheduling-solver-benchmark.test.js`（3 个规模均为 OR-Tools CP-SAT，fallback 0，冲突 0，未排 0，平均耗时 13.1 秒，平均评分 68）
- 内容：
  - 新建学期时真实复制班级、教室、课程规则、任课配置、硬约束和老师时间规则，不再只记录摘要。
  - 排课配置读取改为“优先当前学期，兼容旧模板数据”，支持新学期局部修改后继续继承未修改配置。
  - 课程规则、班级结构、任课关系、硬约束、老师时间规则保存时写入当前学期，避免污染旧学期。
  - 教室二维码库按当前学期过滤，避免多学期教室重复显示。
  - 生产测试新增“新学期改班级数和课程规则不影响旧学期”的断言。

## 2026-06-21 - 完成学期管理闭环

- 类型：功能 / 前端 / 后端 / 测试 / 文档
- 影响范围：学期管理 / 排课作用域 / 历史归档 / 工作量确认 / 薪资锁定
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/server.js`
  - `node --check server/storage.js`
  - `node --check server/scheduling.js`
  - `node --check server/terms.js`
  - `node --check tests/phase1-production.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
  - `node tests/scheduling-jobs.test.js`
  - `node tests/scheduling-solver-benchmark.test.js`（3 个规模均为 OR-Tools CP-SAT，fallback 0，冲突 0，未排 0，平均耗时 13.6 秒，平均评分 68）
- 内容：
  - 行政排课页新增“学期管理”面板，支持查看当前学期、新建学期、设为当前学期和归档历史学期。
  - 新增 `POST /api/terms`、`POST /api/terms/:termId/current`、`POST /api/terms/:termId/archive`。
  - 新建学期可记录复制当前课程规则、班级结构、任课配置、老师规则和硬约束的摘要，作为新学期初始化依据。
  - 归档学期进入只读状态，后端阻止排课生成、发布、回滚、调课、课表调整、工作量确认和工资生成/复核/锁定/解锁。
  - 第一阶段生产测试新增学期创建、当前学期切换、历史学期归档和归档后禁止排课断言。
- 注意事项：
  - 当前配置表仍采用“当前配置继续沿用到新学期”的方式；如果后续要保留每学期独立课程配置快照，可以在第三阶段升级为配置版本表。

## 2026-06-20 - 增加第一阶段学期上下文

- 类型：功能 / 后端 / 前端 / 测试 / 文档
- 影响范围：学期制流程 / 行政排课 / 老师课表 / 月度工作量 / 薪资结算
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/server.js`
  - `node --check server/storage.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
  - `node tests/scheduling-jobs.test.js`
  - `node tests/scheduling-solver-benchmark.test.js`（3 个规模均为 OR-Tools CP-SAT，fallback 0，冲突 0，未排 0）
- 内容：
  - 新增学期模型和 `GET /api/terms`，当前默认学期为 `2026年第一阶段试运行学期`。
  - 排课配置、草稿、正式版本和发布课次增加 `termId`、`termName`，按“学期 + 学部 + 年级 + 周次”隔离数据。
  - 老师端课表默认读取当前学期的已发布周次，避免历史学期课表混入当前课表。
  - 月度工作量确认和教师薪资明细携带学期上下文，保留按月份结算的财务口径。
  - 第一阶段 TODO 增加“学期制闭环”，记录后续学期管理页面、新学期复制配置和历史归档策略。
- 注意事项：
  - 当前只启用一个默认学期，尚未开放前端新建/切换/归档学期；后续正式多学期运营时需要补学期管理页面。

## 2026-06-20 - 增加行政排课预检与诊断面板

- 类型：功能 / 前端 / 后端 / 测试 / 排课
- 影响范围：行政排课 / 预检诊断 / 生成前校验 / 配置保存 / 文档
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/server.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
- 内容：
  - 新增 `GET /api/scheduling/precheck`，支持行政在生成课表前单独执行排课预检。
  - 排课配置接口和课程、班级、硬约束、老师规则等配置保存接口返回最新 `precheck`。
  - 行政排课页新增“排课预检”面板，展示阻塞项、提醒项、课时任务数和具体诊断卡片。
  - 预检阻塞时禁用“一键生成排课”，避免管理员在明显无解配置下直接进入长时间求解。
  - 后端预检新增“班级任课老师未配置”阻塞项，提前提示缺少老师的班级课程。
  - 生产回归测试新增未配置任课老师时预检阻塞断言。
- 注意事项：
  - 当前预检报告已能显示阻塞/提醒/正常项；后续可继续增加“一键跳转到对应配置区域”和“导出诊断报告”。

## 2026-06-20 - 支持取消异步排课任务

- 类型：功能 / 前端 / 后端 / 测试 / 排课
- 影响范围：行政排课 / 异步任务 / worker / 前端进度 / 文档
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/server.js`
  - `node --check server/schedulingJobs.js`
  - `node --check tests/scheduling-jobs.test.js`
  - `node tests/scheduling-jobs.test.js`
- 内容：
  - 新增 `POST /api/scheduling/generate-jobs/:jobId/cancel`，支持取消 queued/running 状态的排课任务。
  - 后端取消时会清理排队启动定时器或终止正在运行的 worker，任务状态变为 `cancelled`。
  - 前端排课进度卡新增“取消排课”按钮，取消后停止轮询并展示取消状态。
  - 异步任务测试新增取消场景，验证取消任务不会保存数据库，也不会写入排课草稿。
- 注意事项：
  - 当前取消是单机内存任务取消；后续如果升级为数据库/Redis 任务表，需要把 cancelled 状态持久化。

## 2026-06-20 - 增加排课异步任务与前端进度轮询

- 类型：功能 / 前端 / 后端 / 测试 / 排课
- 影响范围：行政排课 / 大规模排课 / API / worker / 任务状态 / 文档
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/server.js`
  - `node --check server/schedulingJobs.js`
  - `node --check server/schedulingJobWorker.js`
  - `node --check tests/scheduling-jobs.test.js`
  - `node tests/scheduling-jobs.test.js`
- 内容：
  - 新增排课任务 worker，行政端生成排课时先创建任务，再由后台独立执行 CP-SAT/高级排课求解。
  - 新增 `POST /api/scheduling/generate-jobs` 和 `GET /api/scheduling/generate-jobs/:jobId`，支持创建任务、查询状态和返回完成结果。
  - 前端“一键生成排课”改为异步任务模式，显示任务号、阶段、百分比，完成后自动刷新草稿、冲突、评分和诊断面板。
  - 保留原同步 `/api/scheduling/generate`，避免破坏现有测试和兼容调用。
  - 新增 `tests/scheduling-jobs.test.js`，验证任务创建、worker 完成、草稿写回数据库和任务结果查询。
- 注意事项：
  - 当前任务状态保存在单进程内存中，适合第一阶段单机部署；多服务器部署时应升级为数据库/Redis 任务表。
  - 取消任务功能尚未开放，已保留在高标准排课 TODO 中。

## 2026-06-20 - 强化大规模排课容量预检与 benchmark

- 类型：功能 / 测试 / 工程化 / 排课
- 影响范围：排课前预检 / OR-Tools CP-SAT / fallback / 大规模验收 / 文档
- 提交：本次提交
- 部署：未部署
- 验证：
  - `node --check server/scheduling.js`
  - `node --check tests/scheduling-solver-benchmark.test.js`
  - `node tests/scheduling-solver-benchmark.test.js`
- 内容：
  - 排课前预检新增“按教室类型汇总容量”校验，能识别物理、化学共同占用实验室导致的总容量不足。
  - 高级 fallback 新增多轮贪心构造尝试，并优先处理专用教室、每日上限、不可连续等高约束课程。
  - 大规模 benchmark 从允许部分成功升级为必须排满，高中 16 班、1500 名老师、352 节课要求未排 0、冲突 0。
  - benchmark 新增不可行配置断言：实验室总容量不足时必须在求解前被预检阻塞。
  - 更新最高标准排课 TODO 与第一阶段 TODO 的当前完成状态。
- 注意事项：
  - 高中 16 班大规模 benchmark 当前由 OR-Tools CP-SAT 主求解器完成，耗时约 30 秒；更大规模或多学部并发排课后续应异步任务化并展示进度。

## 2026-06-19 - 增加排课求解 benchmark 测试

- 类型：测试 / 工程化 / 排课
- 影响范围：OR-Tools CP-SAT / fallback / 算法回归 / 质量评分
- 提交：已提交 `848a20a`
- 部署：未部署
- 验证：
  - `node --check tests/scheduling-solver-benchmark.test.js`
  - `npm run check`
  - `npm run test:phase1`
  - `npm run test:benchmark`
- 内容：
  - 新增 `tests/scheduling-solver-benchmark.test.js`，覆盖小学 10 班、初中 12 班、高中 16 班三档场景。
  - benchmark 输出算法、是否 fallback、生成课节、未排课、冲突、质量评分、耗时。
  - 新增 `npm run test:benchmark` 脚本，并纳入 `npm run check` 语法检查。
  - 更新最高标准排课 TODO 中 benchmark 相关完成状态。
- 注意事项：
  - 当前 benchmark 是手动脚本，后续可接入 CI 并增加 P95 耗时和极限约束场景。

## 2026-06-19 - 增加排课质量 100 分评分报告

- 类型：功能 / 前端 / 后端 / 测试 / 排课
- 影响范围：行政排课 / 求解摘要 / 质量诊断 / OR-Tools CP-SAT / fallback
- 提交：已提交 `ba22ba2`
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
- 内容：
  - 后端新增 100 分排课质量报告，覆盖硬冲突、未排课、老师周课量均衡、日课量、连续上课、碎片化、班级每日课量、主科上午分布、课程偏好、同班同科集中等扣分项。
  - CP-SAT 和 fallback 统一返回 `qualityReport`，并把业务评分写入 `solver.score`。
  - 行政端冲突校验面板新增质量评分卡，展示硬冲突、未满足偏好、总扣分和主要扣分原因。
  - 求解摘要文案从技术目标值优先改为业务评分优先。
  - 生产回归测试新增质量报告断言。
- 注意事项：
  - 当前已展示扣分项和影响课节 ID，后续还可做“点击扣分项高亮课节”和版本评分差异对比。

## 2026-06-19 - 补强调课流程与版本回滚兼容

- 类型：修复 / 测试 / 排课
- 影响范围：课表回滚 / 调课审批 / 老师课表 / 签到 / 薪资工作量
- 提交：已提交 `384d886`
- 部署：未部署
- 验证：
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
- 内容：
  - 修复回滚后的发布 draft id 与 lessonInstances 溯源不一致问题，避免回滚后调课申请找不到课次。
  - 生产回归测试新增“回滚后发起调课申请并审批通过”链路。
  - 更新最高标准排课 TODO 中调课流程完成状态。
- 注意事项：
  - 当前调课申请入口由行政端发起；若要开放老师端自助申请，可在同一审批模型上扩展老师入口。

## 2026-06-19 - 增加课表发布版本与回滚

- 类型：功能 / 前端 / 后端 / 测试 / 排课
- 影响范围：行政排课 / 发布版本 / 老师课表 / 签到 / 薪资工作量
- 提交：已提交 `20045c0`
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check server/server.js`
  - `node --check server/storage.js`
  - `node --check tests/phase1-production.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
- 内容：
  - 后端新增课表正式版本快照，每次发布保留完整 assignments 和 lessonInstances。
  - 发布版本记录新增/删除/变更课节差异，并写入发布审计日志。
  - 新增课表版本回滚接口，回滚后老师端课表、签入签出和薪资工作量数据源同步切换到目标版本。
  - 行政端新增发布版本面板，展示当前正式版、历史版本、差异统计和回滚入口。
  - 生产回归测试覆盖发布两版、版本历史、回滚后 lessonInstances 切换。
- 注意事项：
  - 当前是行政确认发布，后续可扩展教务/总校二级发布审批。

## 2026-06-19 - 增加按范围局部重排

- 类型：功能 / 前端 / 后端 / 测试 / 排课
- 影响范围：行政排课 / 人工调整 / 局部重排 / OR-Tools 求解
- 提交：已提交 `b4f3fa8`
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
- 内容：
  - 行政端人工调整面板新增局部重排范围，可按班级、老师、日期、科目组合筛选。
  - 后端重排接口支持 `replanScope`，范围外课程和已锁定课程作为固定条件保留，只重排范围内未锁定课节。
  - 重排完成后恢复范围外课程原始锁定状态，避免临时保留污染正式课表。
  - 本地模式同步支持按范围局部重排。
  - 生产回归测试新增局部重排验收，确保范围外课节位置、老师、教室和锁定状态不变化。
- 注意事项：
  - 还未做多选批量移动；局部重排当前是组合筛选式，不是框选式。

## 2026-06-19 - 增加拖拽调整替代位置推荐

- 类型：功能 / 前端 / 排课
- 影响范围：行政排课 / 人工调整 / 拖拽调课
- 提交：已提交 `47be11e`
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
- 内容：
  - 人工调整面板新增“推荐可用位置”，按同一天、相近节次优先推荐可移动落点。
  - 拖拽课节到冲突/禁排位置时，自动选中该课节并提示最近可尝试的替代节次。
  - 推荐位置可一键应用，继续复用后端调整接口或本地校验逻辑。
  - 推荐计算会避开已发布课表、锁定课节，并复用硬约束、课程规则、教室类型、班级/老师/教室冲突校验。
- 注意事项：
  - 还未做多选批量移动和按范围局部重排。

## 2026-06-19 - 增强行政端拖拽调课即时校验

- 类型：功能 / 前端 / 排课
- 影响范围：行政排课 / 人工调整 / 本地试运行排课
- 提交：已提交 `0ad38c3`
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `git diff --check`
  - `node tests/phase1-production.test.js`
- 内容：
  - 行政端课表拖拽落点增加即时预检，可显示可放置或不可放置状态。
  - 拖拽落点会检查已发布状态、锁定课节、日期节次、自定义硬约束、课程每日上限、连堂限制、教室类型、老师/班级/教室冲突。
  - 拖拽失败时显示具体原因，拖拽成功后继续走后端调整接口保存并重新校验。
  - 本地试运行排课同步接入课程教室类型，避免本地生成与后端规则不一致。
  - 更新最高标准排课 TODO 中人工调整相关完成状态。
- 注意事项：
  - 还没有做多选批量移动。

## 2026-06-19 - 接入专用教室与课程教室约束

- 类型：功能 / 算法 / 测试 / 文档
- 影响范围：行政排课 / OR-Tools CP-SAT / 教室资源 / 课程规则
- 提交：已提交 `b3e17d1`
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check server/storage.js`
  - `node --check tests/phase1-production.test.js`
  - `PYTHONPYCACHEPREFIX=/private/tmp/python-cache python3 -m py_compile server/solver/ortools_scheduler.py`
  - `node tests/phase1-production.test.js`
- 内容：
  - 新增教室类型模型：普通教室、实验室、机房、操场、美术室、音乐室。
  - 初始化和老数据迁移会自动补齐各学部专用教室，并保留每个班自己的普通教室。
  - 课程规则新增教室要求，体育默认操场，物理/化学默认实验室；行政端可在课程编辑中调整。
  - 排课候选从“老师 + 时间”升级为“老师 + 时间 + 教室”，启发式算法和 OR-Tools CP-SAT 都会执行教室冲突与教室类型约束。
  - 排课前预检新增专用教室容量检查，CP-SAT 诊断新增教室资源紧张度。
  - 修正 CP-SAT 使用老师池的问题：每个班每门课严格使用“班级老师指定表”的老师。
  - 发布、手动调整和调课流程都会校验课程教室类型，未满足时阻止保存或发布。
  - 测试补充体育课排到操场、物理/化学排到实验室、错误教室调整被拒绝。
- 注意事项：
  - 还未实现更细的教室不可用时段、跨校区教室、合班共用教室和教室资源日历。

## 2026-06-19 - 增强 CP-SAT 两阶段求解与发布保护

- 类型：功能 / 算法 / 测试 / 文档
- 影响范围：行政排课 / OR-Tools CP-SAT / 发布校验 / 前端诊断摘要
- 提交：已提交 `c1142e5`
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `PYTHONPYCACHEPREFIX=/private/tmp/python-cache python3 -m py_compile server/solver/ortools_scheduler.py`
  - `node tests/phase1-production.test.js`
- 内容：
  - OR-Tools CP-SAT 改为两阶段求解：第一阶段先找硬约束可行解，第二阶段基于第一阶段 hint 优化软约束目标。
  - 求解器新增候选最少课时、老师资源紧张度等诊断信息，CP-SAT 失败或 fallback 时可回传到草稿诊断。
  - 后端发布课表时新增完整性保护：未排完的草稿不能发布。
  - 行政端排课摘要显示硬约束阶段、优化阶段状态；未排完草稿在页面显示“禁止发布”并禁用确认按钮。
  - 测试补充 CP-SAT 阶段状态和未排完草稿禁止发布的保护用例。
- 注意事项：
  - 还未实现专用教室容量诊断、未排课惩罚变量、启发式 fallback warm start 和前端独立预检面板。

## 2026-06-19 - 启动最高标准排课引擎升级

- 类型：功能 / 算法 / 测试 / 文档
- 影响范围：行政排课 / OR-Tools CP-SAT / 排课前预检 / 测试
- 提交：随本次提交
- 部署：未部署
- 验证：
  - `node --check server/scheduling.js`
  - `node --check tests/phase1-production.test.js`
  - `PYTHONPYCACHEPREFIX=/private/tmp/python-cache python3 -m py_compile server/solver/ortools_scheduler.py`
  - `node tests/phase1-production.test.js`
- 内容：
  - 新增排课前预检，生成草稿和局部重排前会检查班级周课时容量、课程每日上限、老师池容量、锁定课冲突和无候选课时任务。
  - 预检结果区分 `ok`、`warning`、`blocked`，阻塞项会在求解前拦截并返回结构化 `precheck` 明细。
  - 排课草稿新增 `precheck` 字段，后续前端可直接展示预检报告。
  - CP-SAT 默认求解时间从 `10s` 提升到 `30s`，候选池上限从 `120` 提升到 `300`，进程超时提升到 `90s`。
  - OR-Tools 候选截断从简单取前 N 个改为覆盖式候选池，保留低成本候选的同时覆盖不同日期、节次和老师。
  - 自动化测试新增无解课程规则场景，验证预检会在求解前阻塞。
  - 更新最高标准排课 TODO 完成状态。
- 注意事项：
  - 本次还未实现两阶段 CP-SAT、未排课惩罚变量、fallback warm start 和前端预检独立面板。

## 2026-06-19 - 建立最高标准排课系统 TODO

- 类型：产品规划 / 文档
- 影响范围：排课系统 / 第一阶段 TODO / README
- 提交：随本次提交
- 部署：未部署
- 验证：
  - `git diff --check`
- 内容：
  - 新增 `docs/scheduling-high-standard-todo.md`，按市面成熟排课软件标准拆解排课系统 TODO。
  - TODO 覆盖规则模型、排课前预检、两阶段 CP-SAT、fallback warm start、质量评分、人工拖拽调整、局部重排、版本发布、调课流程、性能基准和审计。
  - 在 `PHASE1_TODO.md` 中新增 `M2-S：最高标准排课系统`，把原来的排课增强项升级为完整产品级路线。
  - 在 `README.md` 文档入口中加入最高标准排课 TODO。
- 注意事项：
  - 这次只建立任务清单，不改排课算法实现。
  - 下一步若开始执行，建议优先做“排课前预检 + 两阶段 CP-SAT + 求解诊断报告”。

## 2026-06-18 - 修复本地非公网补测问题

- 类型：修复 / 测试 / 文档
- 影响范围：财务薪资结算 / 老师薪资摘要接口 / 第一阶段测试记录 / 问题清单
- 提交：随本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/payroll.js`
  - `node --check server/storage.js`
  - `node --check server/server.js`
  - `node --check server/importTeachers.js`
  - `node tests/phase1-production.test.js`
  - 本地接口：`teacher0001` 薪资接口只返回总薪资摘要
  - 本地页面：财务薪资结算页显示 `T0001 / 李明` 应发 `¥8,664`、实发 `¥8,554`、状态“已锁定”
  - 本地导出接口：按小学部一年级和 `FY0001` 搜索导出 `total=1`
- 内容：
  - 在 `docs/phase1-test-run-20260618.md` 追加本地非公网完整链路补测记录，避免继续依赖公网域名和真实手机扫码环境。
  - 记录本地生成并发布小学部一年级 `200` 节课、`T0001 / 李明` 完成 5 节课并锁定工资、实发 `8554.08` 的样例链路。
  - 修复财务端进入薪资结算页时自动生成工资的问题，改为先读取已有工资，避免已锁定工资页面卡在读取态。
  - 收窄老师端登录态、本人信息、课表、工作量和薪资接口中的教师对象，老师薪资接口不再返回工资档案、工资项目快照或逐课金额明细。
  - 记录 OR-Tools 未稳定命中可行解而 fallback 成功的问题，后续再优化求解器可解释性。
  - 按用户最新确认，将课表当前版本作为最新版验收，二维码和生产域名相关问题暂缓处理。
- 注意事项：
  - Codex 内置浏览器不支持真实下载事件，工资导出页面按钮已确认可用，CSV 落盘仍建议用普通浏览器补测。

## 2026-06-18 - 记录第一阶段部署与测试执行结果

- 类型：测试 / 文档
- 影响范围：部署验收 / 第一阶段测试记录 / README
- 提交：随本次提交
- 部署：已部署到生产服务器，当前生产代码为 `f9632e2`；正常域名访问被 DNS 解析错误阻塞
- 验证：
  - `node --check app.js`
  - `node --check server/payroll.js`
  - `node --check server/storage.js`
  - `node --check server/server.js`
  - `node --check server/importTeachers.js`
  - `node tests/phase1-production.test.js`
  - `git diff --check`
  - 服务器内 `curl http://127.0.0.1:4173/api/health`
  - 强制解析 `curl --resolve fuyuanschool.org:443:47.76.189.5 https://fuyuanschool.org/api/health`
- 内容：
  - 新增 `docs/phase1-test-run-20260618.md`，记录本轮部署尝试、自动化回归、本地页面冒烟、接口冒烟和已发现问题。
  - 记录生产部署结果：服务器从 `650b0d0` fast-forward 到 `f9632e2`，服务重启后 `school-system` 为 active。
  - 记录 DNS 问题：`fuyuanschool.org` 当前解析到 `198.18.0.20`，`www.fuyuanschool.org` 解析到 `198.18.0.19`，需要改为 `47.76.189.5`。
  - 记录生产 readiness 失败问题：当前运行库没有已发布课表，也没有已生成/已锁定工资。
  - 记录手机端课表仍偏周视图、教室二维码页显示 JSON 原文、摄像头扫码待真机验证等问题。
  - 在 `README.md` 第一阶段文档入口中加入本轮测试执行记录。
- 注意事项：
  - 下一步需要修正 DNS 后，在 `https://fuyuanschool.org` 重新执行线上页面和手机扫码测试。

## 2026-06-18 - 新增第一阶段详细测试案例

- 类型：文档 / 测试
- 影响范围：第一阶段验收 / 测试执行 / README
- 提交：随本次提交
- 部署：文档更新，推送 GitHub 后生效
- 验证：
  - `git diff --check`
- 内容：
  - 新增 `docs/phase1-test-cases.md`，按 P0/P1/P2、接口测试、自动化回归和问题记录模板整理第一阶段详细测试案例。
  - 测试案例覆盖账号权限、行政排课、课程约束、老师课表、教室动态二维码、签入签出、防作弊、月度确认、财务薪资、工资解锁重算、CSV 导出、手机端兼容和接口级验证。
  - 在 `README.md` 的第一阶段文档入口中增加详细测试案例链接。

## 2026-06-18 - 第一阶段剩余薪资任务收口

- 类型：功能 / 生产化收口
- 影响范围：财务端薪资规则 / 教师工资档案 / 薪资解锁重算 / 导入模板 / 文档
- 提交：随本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/payroll.js`
  - `node --check server/storage.js`
  - `node --check server/server.js`
  - `node --check server/importTeachers.js`
  - `node tests/phase1-production.test.js`
  - `git diff --check`
- 内容：
  - 明确第一阶段月度课时工资按“实际完成课次”计算，`4.4` 周字段仅作为制度参考保留，不参与自动折算课次。
  - 财务端增加专任教师工资规则 JSON 面板，可调整职称档、学段课时规则、岗位津贴、住房补贴、校龄等规则。
  - 财务端增加当前老师工资档案维护，可编辑职称/学历档、校龄、考核档、住房档、岗位津贴角色、人工扣减和补充项。
  - 教师导入模板补齐专任教师工资档案字段，支持批量导入工资计算所需资料。
  - 新增工资解锁重算流程：已锁定工资必须先解锁，系统记录解锁人、时间、原因和原锁定快照，再重新生成、复核、锁定。
  - 第一阶段 TODO、路线图和字段字典同步更新为最新完成状态。
- 注意事项：
  - 当前“全部规则编辑”先以 JSON 规则面板交付，生产可用但不如分项表单友好；后续可在不改后端规则结构的前提下继续优化 UI。

## 2026-06-18 - 专任教师工资规则引擎

- 类型：功能 / 薪资规则
- 影响范围：后端薪资计算 / 教师档案 / 财务结算 / 工资导出 / 文档
- 提交：随本次提交
- 部署：未部署
- 验证：
  - `node --check server/payroll.js`
  - `node --check server/storage.js`
  - `node --check server/importTeachers.js`
  - `node tests/phase1-production.test.js`
- 内容：
  - 新增 `server/payroll.js`，将专任教师工资规则从数据仓库中拆出为独立规则模块。
  - 内置富源学校 2026 专任教师工资核心口径：职称/学历基本工资、高中/初中/小学课时规则、学科系数、高中 12 节阈值、考核工资、岗位津贴、校龄工资、住房补贴、补充项和扣减项。
  - 教师种子数据和导入老师自动生成 `salaryProfile`，老数据库启动时会自动补齐缺失工资档案字段。
  - `/api/teachers/:teacherId/payroll` 改为按专任教师工资规则试算，财务端明细返回每项计算依据。
  - 工作量汇总与每节课工资依据对齐，保留每节课的规则名称、口径和金额来源。
  - 工资导出 CSV 增加规则版本、考核工资、校龄工资、住房补贴、补充项、扣减项等字段。
  - 财务端薪资规则面板文案改为“专任教师工资规则”，避免继续误导为简单课时单价配置。
  - 更新第一阶段 TODO 和字段字典，标记后端规则引擎已完成。
- 注意事项：
  - 当前规则引擎按实际完成课次计算月度课时工资，并在规则中保留 4.4 周口径字段作为制度参考。
  - 名师津贴、课题奖励第一阶段作为财务补充项留痕，完整评审流程仍在第三阶段。

## 2026-06-18 - 根据学校制度资料更新路线图

- 类型：文档 / 范围确认
- 影响范围：路线图 / 第一阶段 TODO / 第三阶段规划
- 提交：随本次提交
- 部署：文档更新，推送 GitHub 后生效
- 验证：
  - 文档结构检查
  - `git diff --check`
- 内容：
  - 根据学校提供的考勤制度、专任教师工资方案和其他岗位工资方案，重新确认第一阶段只交付任课教师排课、签入签出、工作量确认和专任教师工资计算链路。
  - 在 `ROADMAP.md` 中补充第一阶段最新范围边界，明确其他岗位工资、完整 OA、全员考勤扣款、名师津贴完整评审、课题奖励、寒暑假工资等进入第三阶段。
  - 在 `PHASE1_TODO.md` 中新增“学校专任教师工资制度补齐”任务，标记当前薪资规则距离学校正式工资口径的剩余缺口。
  - 将教师薪资从简单课时单价升级为可配置工资规则方向：基本工资、课时工资、学科系数、岗位津贴、校龄、住房、补充项、扣减项和计算依据。
- 注意事项：
  - 本次为规划和任务拆分更新，不改变当前运行代码。
  - 第一阶段后续开发应优先补齐专任教师工资规则引擎。

## 2026-06-17 - 老师端任务与签入页生产化整理

- 类型：体验优化 / 生产化收口
- 影响范围：老师工作台 / 我的课表 / 签入签出 / 后端种子数据
- 提交：随本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/storage.js`
  - `node --check server/server.js`
  - `node tests/phase1-production.test.js`
- 内容：
  - 老师工作台“下一节课任务”移除突兀的“扫码”视觉块，只展示课程任务信息和操作按钮。
  - 老师端课程任务改为只展示行政发布或后端排课发布产生的课时，未发布课表时显示“暂无课程任务”。
  - 后端新建数据库不再自动生成样例课时；旧数据库启动时会清理非发布来源的种子课时和关联考勤记录。
  - “我的课表”周次下拉扩展为 20 个自然教学周，未排课周显示 0 节，不再只跟随已有样例数据。
  - 签入签出页改为轻量操作页，默认只显示课时选择和签入/签出按钮，扫码识别和授权输入收进折叠区。

## 2026-06-17 - 老师端扫码入口生产化收口

- 类型：功能 / 生产化收口
- 影响范围：老师端签入签出 / 教室二维码管理 / 账号权限
- 提交：随本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/storage.js`
  - `node --check server/server.js`
  - `node tests/phase1-production.test.js`
- 内容：
  - 老师端移除“模拟签入/签出”顶栏按钮。
  - 老师端扫码页移除教室二维码生成、模拟读码、模拟非上课时间、模拟伪造教室码和复制码内容。
  - 首页和课时任务里的签入/签出按钮改为进入扫码页并选中课时，不再直接提交考勤。
  - 扫码提交改为以教室动态二维码为入口，后端负责返回校验结果和考勤写入。
  - 新增 `classroom` 账号角色，用于集中管理教室大屏二维码入口。
  - 新增“教室二维码库”页面，仅 `classroom` 账号可见，可搜索教室、打开教室大屏、复制大屏地址。
  - 后端新增 `classroom` 种子账号，并允许该角色读取 `/api/classrooms`。
- 注意事项：
  - `classroom` 账号只用于教室终端/二维码库，不显示老师课时、薪资、考勤记录。
  - 本地已有数据库启动后会自动补齐 `classroom` 账号。

## 2026-06-16 - 教室签到码 PWA 大屏 App

- 类型：功能 / 教室端体验
- 影响范围：教室大屏动态二维码 / PWA 安装
- 提交：随本次提交
- 部署：未部署
- 验证：
  - `node --check server/server.js`
  - `node --check classroom-sw.js`
  - 解析 `classroom.html` 内联脚本
- 内容：
  - 新增 `classroom.webmanifest`，教室签到屏支持以 PWA 形式安装到桌面。
  - 新增 `classroom-sw.js`，缓存教室大屏页面、二维码库和校徽资源，保留离线打开页面壳的能力。
  - `classroom.html` 支持首次绑定教室编号和大屏密钥，绑定信息保存在本机浏览器。
  - 之后从桌面图标打开 `classroom.html` 会自动读取本机绑定并显示该教室实时二维码。
  - 教室屏新增“安装到桌面”“全屏显示”“重新绑定教室”操作。
  - 通过 URL 传入 `roomId` 和 `displayKey` 时会自动保存绑定，并清理地址栏中的密钥参数。
- 注意事项：
  - 动态二维码仍需要网络访问后端接口，离线状态只能打开页面壳，不能签发新的签到码。
  - 正式部署必须使用 HTTPS，PWA 安装和摄像头扫码权限都依赖安全上下文。

## 2026-06-16 - 年级班级结构和实验班配置

- 类型：功能 / 排课配置
- 影响范围：行政排课 / 班级任课老师 / 后端排课上下文
- 提交：随本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node --check server/scheduling.js`
  - `node --check server/server.js`
  - `node --check server/storage.js`
  - `node tests/phase1-production.test.js`
  - 内置浏览器检查行政排课页顶部班级结构面板
- 内容：
  - 行政排课页在学部、年级选择后新增“班级结构”配置。
  - 支持设置普通班数量和实验班数量，前端实时预览生成班级。
  - 新增 `/api/scheduling/class-structure`，保存后更新当前年级班级和教室数据。
  - 实验班作为独立班级参与老师配置、排课、教室冲突和课表发布。
  - 保存班级结构后清理当前年级旧排课草稿和调课请求，避免班级结构变更后沿用旧课表。
- 注意事项：
  - 保存班级结构后需要重新配置该年级班级任课老师，再重新生成排课。

## 2026-06-16 - 老师课表移动端一屏日程优化

- 类型：移动端体验 / 修复
- 影响范围：老师端我的课表
- 提交：随本次提交
- 部署：未部署
- 验证：
  - `node --check app.js`
  - `node tests/phase1-production.test.js`
  - 内置浏览器检查老师账号“我的课表”移动端首屏展示
- 内容：
  - 老师端“我的课表”单日时间线不再按真实时间间隔拉出大块空白，改为紧凑日程条目。
  - 手机/窄屏课表页隐藏重复的顶部操作按钮，保留底部导航和页面标题。
  - 周次选择、统计卡、日期横条和单日课程卡片整体压缩，让选中日期的 3-4 节课能在一个屏幕内完整查看。
  - 课程状态仍保留在每节课右侧，避免压缩后丢失“未到时间、已完成、异常”等判断信息。
- 注意事项：
  - 本次仅调整老师端课表展示，不改变排课、签到、薪资核算数据。

## 2026-06-16 - 老师课表时间线和财务级联筛选

- 类型：功能 / 体验优化
- 影响范围：老师端 / 财务端 / 后端导出
- 提交：随本次提交
- 部署：已部署到生产
- 验证：
  - `node --check app.js`
  - `node --check server/storage.js`
  - `node --check server/server.js`
  - `node tests/phase1-production.test.js`
  - 直接调用后端数据函数验证 `stageId=high&grade=11` 筛选和工资导出均从 1000 缩小到 333
  - 内置浏览器检查老师课表单日时间线和财务筛选控件
- 内容：
  - 老师端“我的课表”从一周顺序列表改为“点击日期，只显示当天课表”。
  - 当天课表改为时间线展示，每节课按上课时间放在对应位置。
  - 财务首页教师列表增加学部、年级、搜索筛选。
  - 财务“老师记录”和“薪资结算”增加同一套学部、年级、搜索、老师联动选择。
  - 后端教师列表接口支持按年级过滤。
  - 工资明细 CSV 导出支持按学部、年级、搜索条件导出，并新增年级列。
- 注意事项：
  - 一个老师可能覆盖多个年级；筛选某个年级时，老师下拉优先展示当前筛选年级。
  - 批量生成薪资本次仍按全量生成，导出按当前筛选范围导出。

## 2026-06-16 - 建立系统更新流程和更新日志

- 类型：文档
- 影响范围：开发流程 / 发布流程 / 运维交接
- 提交：随本次文档提交
- 部署：文档更新，推送 GitHub 后生效
- 验证：
  - 文档结构检查
- 内容：
  - 新增 `docs/system-update-process.md`，说明本地开发、测试、提交、生产发布、健康检查、回滚和事故记录流程。
  - 新增本文件，作为后续每次更新的统一记录位置。
  - 明确每次更新必须记录日期、类型、影响范围、提交、部署状态、验证方式和注意事项。
- 注意事项：
  - 后续开发在提交功能或修复时，必须同步更新本文件。

## 2026-06-16 - 老师端总薪资和手机课表体验优化

- 类型：功能 / 修复 / 移动端体验
- 影响范围：老师端 / 小程序文案 / 生产站点
- 提交：`1817f54`
- 部署：已部署到生产
- 验证：
  - `node --check app.js`
  - `node tests/phase1-production.test.js`
  - 内置浏览器检查老师端总薪资、月度确认、自然周课表
  - 线上健康检查 `https://fuyuanschool.org/api/health`
- 内容：
  - 老师端总薪资页改为主卡片 + 可计工作量 + 待处理考勤 + 确认状态 + 操作入口，避免页面过空。
  - 月度确认页顶部新增本人总薪资汇总。
  - 首页薪资区域改为“本月总薪资”，不再展示应发、实发拆分。
  - 老师端课表、课时任务、下一节课和月度确认移除逐节金额、津贴和计薪口径。
  - 老师端自然周课表移动端改为日期横条 + 按天纵向日程，更接近日历式查看。
  - 修复手机端顶部操作按钮和课表横向溢出问题。
  - 小程序薪资页同步调整文案，保持“老师端只看总薪资”的口径。
- 注意事项：
  - 财务端薪资明细、薪资规则和结算金额仍保留。
  - 后续若新增老师端薪资相关页面，必须继续遵守“老师端只展示总薪资，不展示逐课时核算”的规则。
