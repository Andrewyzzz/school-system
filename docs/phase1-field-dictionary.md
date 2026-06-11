# 第一阶段字段字典

更新时间：2026-06-11

本字段字典用于第一阶段正式开发，覆盖任课老师账号、排课、签入签出、工作内容、薪资明细和财务复核。当前本地 JSON 数据仓库先按这些字段组织，后续切换正式数据库时保持业务含义不变。

## 1. 用户账号 users

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 账号唯一 ID |
| username | string | 是 | 登录用户名，必须唯一 |
| passwordHash | string | 是 | 加密后的密码 |
| role | enum | 是 | `teacher`、`admin`、`finance`、`system_admin` |
| teacherId | string | 否 | 老师账号对应教师 ID |
| name | string | 是 | 账号显示名称 |
| department | string | 否 | 所属部门或学部 |
| status | enum | 是 | `active`、`disabled` |
| createdAt | datetime | 否 | 创建时间 |
| updatedAt | datetime | 否 | 更新时间 |

## 2. 教师 teachers

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 教师唯一 ID，例如 `T0001` |
| employeeNo | string | 是 | 工号，必须唯一 |
| name | string | 是 | 教师姓名 |
| stageId | enum | 是 | `primary`、`middle`、`high` |
| stageName | string | 是 | 小学部、初中部、高中部 |
| department | string | 是 | 所属部门或学部 |
| primarySubjectId | string | 是 | 主授科目 ID |
| primarySubjectName | string | 是 | 主授科目名称 |
| title | string | 否 | 任课教师、骨干教师、高级教师等 |
| phone | string | 否 | 手机号 |
| status | enum | 是 | `active`、`disabled`、`left` |
| hiredAt | date | 否 | 入职日期 |

## 3. 学部 stages

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | `primary`、`middle`、`high` |
| name | string | 是 | 小学部、初中部、高中部 |
| grades | number[] | 是 | 学部包含年级 |
| classesPerGrade | number | 是 | 每年级默认班级数 |

## 4. 科目 subjects

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 科目 ID |
| name | string | 是 | 科目名称 |
| lessonRate | number | 是 | 默认课时单价 |

当前第一阶段默认科目：

| id | 名称 |
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

## 5. 班级 classes

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 班级唯一 ID |
| stageId | string | 是 | 所属学部 |
| stageName | string | 是 | 学部名称 |
| grade | number | 是 | 年级 |
| name | string | 是 | 班级名称 |
| roomId | string | 是 | 默认教室 ID |
| active | boolean | 是 | 是否启用 |

## 6. 教室 rooms

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 教室唯一 ID |
| stageId | string | 是 | 所属学部 |
| name | string | 是 | 教室名称 |
| qrCode | string | 是 | 固定教室二维码内容 |
| active | boolean | 是 | 是否启用 |

## 7. 课次 lessonInstances

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 课次唯一 ID |
| teacherId | string | 是 | 任课老师 |
| classId | string | 是 | 班级 |
| className | string | 是 | 班级名称 |
| subjectId | string | 是 | 科目 |
| subjectName | string | 是 | 科目名称 |
| roomId | string | 是 | 教室 |
| date | date | 是 | 上课日期 |
| time | string | 是 | 时间段，例如 `08:00-08:40` |
| type | enum | 是 | `regular`、`morning`、`evening`、`weekend` |
| units | number | 是 | 课时数 |
| status | enum | 是 | `scheduled`、`checkedIn`、`completed`、`exception` |
| checkInAt | datetime | 否 | 签入时间 |
| checkOutAt | datetime | 否 | 签出时间 |
| source | string | 是 | 数据来源，例如 `seed`、`admin-scheduling` |

## 8. 签入签出 attendanceRecords

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 签到记录 ID |
| lessonId | string | 是 | 对应课次 |
| teacherId | string | 是 | 老师 |
| roomId | string | 是 | 扫码教室 |
| action | enum | 是 | `checkIn`、`checkOut` |
| scannedAt | datetime | 是 | 扫码时间 |
| result | enum | 是 | `accepted`、`rejected`、`exception` |
| reason | string | 否 | 异常或拒绝原因 |

## 9. 工作量确认 workloadConfirmations

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 确认记录 ID |
| teacherId | string | 是 | 老师 |
| month | string | 是 | 月份，例如 `2026-06` |
| status | enum | 是 | `draft`、`teacher_confirmed`、`finance_locked` |
| confirmedAt | datetime | 否 | 老师确认时间 |
| lockedAt | datetime | 否 | 财务锁定时间 |

## 10. 薪资明细 payrollLines

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 明细 ID |
| teacherId | string | 是 | 老师 |
| month | string | 是 | 月份 |
| lessonId | string | 否 | 对应课次，固定工资项可为空 |
| itemName | string | 是 | 薪资项目 |
| basis | string | 是 | 计算口径 |
| amount | number | 是 | 金额 |
| payable | boolean | 是 | 是否计薪 |

## 索引建议

- `users.username`
- `teachers.employeeNo`
- `teachers.stageId`
- `teachers.primarySubjectId`
- `lessonInstances.teacherId + lessonInstances.date`
- `lessonInstances.classId + lessonInstances.date`
- `attendanceRecords.teacherId + attendanceRecords.scannedAt`
- `workloadConfirmations.teacherId + workloadConfirmations.month`
- `payrollLines.teacherId + payrollLines.month`
