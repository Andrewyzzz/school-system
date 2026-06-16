# Codex Handoff

更新时间：2026-06-16

本文用于不同设备、不同 Codex 会话之间交接项目上下文。Codex 会话本身不会自动共享记忆；请通过 GitHub 分支、提交、PR、Issue 和本文档传递开发状态。

## 当前仓库状态

- 仓库：`Andrewyzzz/school-system`
- 本地工作分支：`codex-remote-collab-onboarding`
- 基线提交：`650b0d0 Compact teacher mobile schedule`
- 当前工作区：创建本文档前为干净状态
- 最近验证：
  - `npm run check` 通过
  - `npm run test:phase1` 通过，输出 `phase1 production checks passed`

## 项目概览

这是一个学校教师任务、排课、扫码考勤、工作量确认和薪资管理系统。当前形态包括：

- 静态前端管理系统：`index.html`、`app.js`、`styles.css`
- Node 原生 HTTP API：`server/server.js`
- JSON 文件数据层和业务逻辑：`server/storage.js`
- 排课逻辑：`server/scheduling.js`
- 考勤二维码和签到签出逻辑：`server/attendance.js`
- 教师 CSV 导入逻辑：`server/importTeachers.js`
- 微信小程序老师端 MVP：`miniprogram/`
- Phase 1 生产验收脚本：`tests/phase1-production.test.js`

## 本地运行

推荐流程：

```bash
npm run seed
npm run dev
```

然后打开：

```text
http://127.0.0.1:4173/
```

健康检查：

```text
http://127.0.0.1:4173/api/health
```

如果只需要静态前端预览，也可以使用：

```bash
python3 -m http.server 4173
```

## 常用账号

- 行政账号：`admin / 123456`
- 财务账号：`finance / 123456`
- 兼容 Demo 老师账号：`teacher / 123456`
- 批量老师账号：`teacher0001` 至 `teacher1000`，默认密码均为 `123456`

## 验证命令

提交前至少运行：

```bash
npm run check
npm run test:phase1
```

`npm run check` 只做 Node 语法检查；`npm run test:phase1` 会覆盖排课、通知、工作量确认、薪资生成、复核锁定和 Phase 1 readiness。

## 关键文档

- 项目说明：`README.md`
- 三阶段计划：`ROADMAP.md`
- 第一阶段 TODO：`PHASE1_TODO.md`
- 更新流程：`docs/system-update-process.md`
- 数据库迁移计划：`docs/database-migration-plan.md`
- 第一阶段验收清单：`docs/phase1-acceptance-checklist.md`
- 已知问题：`docs/phase1-known-issues.md`
- 小程序说明：`miniprogram/README.md`

## 当前判断

Phase 1 核心链路已经基本完成并通过本地验收。后续开发更适合围绕以下方向推进：

- 第二阶段人员管控：入职、在职、调岗、离职、岗位模板和权限管理。
- 生产化数据层：按 `docs/database-migration-plan.md` 迁移到 PostgreSQL 或 MySQL。
- 排课增强：老师不可用时间、偏好、调课审批、多版本发布和回滚。
- 小程序正式版：微信登录、openid 绑定、隐藏演示提交、消息订阅。
- 审计和运维：关键操作日志、备份恢复、部署环境变量和上线检查。

## 协作约定

1. 每台设备或每个 Codex 会话使用独立分支开发。
2. 开始工作前先 `git fetch` 并确认基线分支。
3. 重要上下文写入本文档或对应 Issue/PR 描述。
4. 提交前运行验证命令，并在提交或 PR 描述里写明验证结果。
5. 不在未确认的情况下覆盖其他会话已经提交或推送的改动。

## 下一位接手者先看这里

1. 运行 `git status --short`，确认工作区是否干净。
2. 运行 `git branch --show-current`，确认所在分支。
3. 阅读 `README.md`、`PHASE1_TODO.md` 和本文件。
4. 根据用户的新需求选择对应入口文件开始改动。
5. 改完后更新本文件的“当前仓库状态”或在 PR 描述中补充交接信息。
