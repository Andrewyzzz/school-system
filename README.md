# 学校教师任务与薪资管理 Demo

这是一个本地静态网页 Demo，用于演示学校任课老师课时任务、课程签入/签出、考勤记录、薪资试算和财务结算流程。

## 演示账号

- 老师账号：`teacher / 123456`，李明，只能查看自己的课时任务、自然周课表、签入/签出入口、考勤记录、月度确认和薪资明细。
- 财务账号：`finance / 123456`，张会计，可以查看不同老师的考勤记录，并进行薪资结算。
- 行政账号：`admin / 123456`，周主任，当前用于按学部和年级自动排课、冲突校验、确认发布。

## 本地运行

### 静态 Demo

```bash
python3 -m http.server 4173
```

然后打开：

```text
http://localhost:4173/
```

### 第一阶段开发服务

第一阶段已开始加入后端 API 骨架，推荐使用下面的方式运行：

```bash
npm run seed
npm run dev
```

如果本机暂时没有 `npm`，也可以直接运行：

```bash
node server/seed.js
node server/server.js
```

然后打开：

```text
http://127.0.0.1:4173/
```

后端健康检查：

```text
http://127.0.0.1:4173/api/health
```

第一阶段 API 已支持：

- `POST /api/auth/login`：登录，返回 Token
- `GET /api/me`：查看当前账号
- `GET /api/teachers`：行政/财务分页查看教师列表
- `POST /api/teachers/import/preview`：行政预览并校验教师导入 CSV
- `POST /api/teachers/import/commit`：行政确认导入教师档案和老师账号
- `GET /api/scheduling/config`：行政读取排课学部、年级、班级、科目、老师和当前草稿
- `POST /api/scheduling/generate`：行政生成无教师/班级/教室时间冲突的排课草稿
- `POST /api/scheduling/adjust`：行政调整草稿中的任课老师、日期、节次或教室，并重新校验冲突
- `POST /api/scheduling/lock`：行政锁定或解锁草稿中的某节课，重排时保留已锁定课节
- `POST /api/scheduling/regenerate-unlocked`：行政保留已锁定课节，重新自动排未锁定课程
- `POST /api/scheduling/publish`：行政确认发布课表，生成老师端课次任务
- `GET /api/teachers/me`：老师查看本人教师信息
- `GET /api/teachers/:teacherId/schedule`：查看老师自然周课表
- `POST /api/teachers/:teacherId/attendance`：老师本人提交签入/签出，校验教室码、时间窗口和重复计薪
- `GET /api/teachers/:teacherId/workload`：查看老师月度工作内容，汇总可计薪课时、待处理、异常和薪资试算
- `POST /api/teachers/:teacherId/workload/confirm`：老师本人确认月度工作量，后端保存确认快照
- `GET /api/teachers/:teacherId/payroll`：查看老师月度薪资试算

第一阶段前端已接入：

- 登录页优先连接后端登录接口，后端不可用时保留本地 Demo 登录。
- 财务首页教师列表连接后端分页接口，可在约 1000 位教师账号中分页、搜索。
- 老师账号登录后会读取后端自然周课表。
- 行政端新增教师导入页面，可粘贴 CSV、预览校验并确认写入教师档案和账号。
- 行政排课页在后端模式下可调用真实排课接口，生成草稿、校验冲突并发布到老师端课表。
- 行政排课草稿支持手动调整老师、日期、节次和教室，调整后会重新展示教师/班级/教室冲突，存在冲突时不能发布。
- 行政可锁定已确认课节，再触发“重排未锁定课程”，系统会保留锁定课节并补排剩余课程。
- 老师扫码页在后端模式下会把签入/签出提交到真实接口，后端进行本人课时、固定教室码、时间窗口和重复计薪拦截校验。
- 老师月度确认页在后端模式下读取月度工作内容接口，按已完成签入签出的课时生成可计薪工作量，并把老师确认动作保存为后端确认快照。
- 正式网页摄像头扫码需要 HTTPS 安全上下文和用户授权，权限失败时保留手动输入/上传识别兜底；后续小程序版本改用微信原生扫码入口复用同一套后端考勤接口。

第一阶段文档和模板：

- 字段字典：`docs/phase1-field-dictionary.md`
- 教师导入说明：`docs/teacher-import-guide.md`
- 教师导入 CSV 模板：`templates/teacher-import-template.csv`
- 数据库迁移方案：`docs/database-migration-plan.md`

后端种子账号：

- 行政账号：`admin / 123456`
- 财务账号：`finance / 123456`
- 教师账号：`teacher0001` 至 `teacher1000`，默认密码均为 `123456`
- 兼容 Demo 的老师账号：`teacher / 123456`，指向 `teacher0001`

## 当前功能

- 多账号角色切换
- 登录页和本地会话保持
- 老师本人课时任务
- 老师自然周课表和之后排班查看
- 行政先选择小学、初中、高中学部，再选择对应年级生成自然周课表
- 小学、初中、高中差异化科目和班级规模排课
- 排课前置校验同一老师同一时间不能重复上课
- 行政确认后发布到老师端课表
- 首页标题通知栏和邮件式通知中心
- 老师签入/签出入口和扫码演示
- 老师本人考勤记录
- 固定教室码、签入/签出时间窗口、重复计薪拦截等防作弊校验
- 月度工作量确认
- 薪资自动试算
- 财务查看不同老师记录
- 财务薪资结算锁定
- 异常记录提醒
