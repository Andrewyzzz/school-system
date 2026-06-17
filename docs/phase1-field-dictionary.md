# 第一阶段字段字典

更新时间：2026-06-18

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
| salaryProfile | object | 是 | 专任教师工资档案，用于第一阶段工资规则引擎 |
| phone | string | 否 | 手机号 |
| status | enum | 是 | `active`、`disabled`、`left` |
| hiredAt | date | 否 | 入职日期 |

### salaryProfile

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| version | string | 是 | 工资档案版本，例如 `fuyuan-dedicated-teacher-2026-v1` |
| qualificationGrade | enum | 是 | 职称/学历档：`seniorProfessor`、`seniorTeacher`、`firstOrDoctor`、`secondOrMaster`、`thirdOrBachelor`、`ungradedOrJuniorCollege` |
| schoolYears | number | 是 | 校龄年数，用于校龄工资阶梯 |
| assessmentBand | enum | 是 | 考核工资档：`high`、`middle`、`primaryCoreHigh`、`primaryCoreLow`、`primarySpecial` |
| housingTier | enum | 是 | 住房补贴档：`chief`、`backboneOrGradeHead`、`teacher` |
| probationRate | number | 是 | 试用期比例，正式员工为 `1` |
| roles | object | 是 | 班主任、年级主任、备课组长、毕业班等岗位津贴字段 |
| manualItems | array | 是 | 财务补充项/扣减项，名师津贴、课题奖励第一阶段先在此留痕 |
| attendanceDeduction | number | 是 | 第一阶段人工考勤扣减金额，完整自动扣款规则进入第三阶段 |

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

## 11. 专任教师工资规则 payrollRules.teacherSalaryScheme

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| version | string | 规则版本 |
| settlementMode | string | 第一阶段固定为 `actualCompletedLessons`，表示按实际完成课次结算 |
| monthlyWeeks | number | 制度参考字段，当前为 `4.4`；第一阶段不按周课表自动折算课次 |
| baseSalaryByQualification | object | 按职称/学历档配置基本工资 |
| stageLessonRules | object | 按高中、初中、小学配置正课、补课、代课、早晚自习、学科系数 |
| assessmentSalary | object | 按学段和岗位类别配置考核工资 |
| postAllowances | object | 按学段配置班主任、年级主任、教研组长、备课组长等教师岗位津贴 |
| seniorityAllowance | object | 校龄工资阶梯 |
| housingAllowance | object | 住房补贴档 |

第一阶段工资明细采用 `summarySnapshot` 和 `rowsSnapshot` 留存生成时的规则结果。财务锁定后，后续规则变更不会改写已锁定快照；如需更正，必须先解锁、修改规则或教师工资档案、重新生成、复核并再次锁定。

## 12. 薪资解锁记录 payrollDetails.unlockHistory

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| unlockedAt | datetime | 解锁时间 |
| unlockedByAccountId | string | 解锁人账号 |
| unlockedByName | string | 解锁人姓名 |
| reason | string | 解锁原因 |
| previousSummarySnapshot | object | 解锁前锁定汇总快照 |
| previousRowsSnapshot | array | 解锁前锁定明细快照 |

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
