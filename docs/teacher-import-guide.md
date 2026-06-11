# 教师账号导入模板说明

更新时间：2026-06-11

模板文件：`templates/teacher-import-template.csv`

## 导入目标

第一阶段需要支持约 1000 个任课老师账号。导入数据用于生成教师档案基础信息和老师登录账号。

## 字段说明

| 字段 | 必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| employeeNo | 是 | FY0001 | 工号，必须唯一 |
| name | 是 | 李明 | 教师姓名 |
| stageId | 是 | primary | 学部：`primary` 小学部，`middle` 初中部，`high` 高中部 |
| department | 是 | 小学部 | 所属部门或学部 |
| primarySubjectId | 是 | chinese | 主授科目 ID |
| title | 否 | 任课教师 | 职称或岗位名称 |
| phone | 否 | 13800000001 | 手机号 |
| hiredAt | 否 | 2024-09-01 | 入职日期，格式 `YYYY-MM-DD` |
| username | 是 | teacher0001 | 登录用户名，必须唯一 |
| defaultPassword | 否 | 123456 | 初始密码，留空时默认 `123456` |
| status | 否 | active | `active` 启用，`disabled` 停用 |

## 科目 ID

| 科目 ID | 科目 |
| --- | --- |
| chinese | 语文 |
| math | 数学 |
| english | 英语 |
| physics | 物理 |
| chemistry | 化学 |
| pe | 体育 |
| biology | 生物 |
| history | 历史 |
| politics | 道法/政治 |
| geography | 地理 |

## 导入校验规则

- `employeeNo` 不能为空，且不能与系统已有工号重复。
- `username` 不能为空，且不能与系统已有用户名重复。
- `stageId` 必须是 `primary`、`middle`、`high` 之一。
- `primarySubjectId` 必须是系统支持的科目 ID。
- `status` 留空时默认为 `active`。
- `defaultPassword` 留空时默认为 `123456`。
- 同一份导入文件内部不能出现重复 `employeeNo` 或 `username`。

## 当前实现状态

- 已提供 CSV 模板。
- 已提供后端导入预览接口：`POST /api/teachers/import/preview`。
- 预览接口只做校验和规范化，不直接写入数据库。
- 真正写入导入接口后续在账号管理页面确认后再补。
