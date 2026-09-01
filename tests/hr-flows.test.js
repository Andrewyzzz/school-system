import assert from "node:assert/strict";
import { generateEncryptionKey } from "../server/security/pii.js";

process.env.HR_ENCRYPTION_KEY = generateEncryptionKey();

const { createInitialData, teacherPayrollPreview, generateTeacherPayrollDetail, assertPayrollEligible } =
  await import("../server/storage.js");
const {
  approveHrFlowStep,
  countHrTodos,
  createHrFlow,
  employeeByTeacherId,
  hrScopeFor,
  queryEmployees,
  queryHrAuditLogs,
  queryHrFlows,
  scanHrFlowTimeouts,
  setEmployeeStatus,
  teacherEligibility,
  withdrawHrFlow,
} = await import("../server/hr.js");
const { buildSchedulingConfig } = await import("../server/scheduling.js");

// 第二阶段 M3+M4 验收：审批流三闭环、超时提醒、scope 越权、联动矩阵（登录/任课池/计薪折算）。

function actor(db, username) {
  const account = db.accounts.find((item) => item.username === username);
  assert.ok(account, `missing account ${username}`);
  return account;
}

const db = createInitialData({ teacherCount: 12 });
const hr = actor(db, "hr");
const sysadmin = actor(db, "sysadmin");
const headPrimary = actor(db, "head_primary");
const headMiddle = actor(db, "head_middle");
const context = { clientIp: "10.0.0.9", userAgent: "hr-flows-test" };

// ---- 1. 学部负责人种子与 scope ----
assert.equal(headPrimary.role, "division_head");
assert.deepEqual(headPrimary.scopeStageIds, ["primary"]);
const primaryScope = hrScopeFor(db, headPrimary);
assert.ok(primaryScope.orgUnitIds.has("ORG-STAGE-primary"));
assert.equal(primaryScope.orgUnitIds.has("ORG-STAGE-middle"), false);

// scope 过滤：head_primary 只能看到小学部人员
const scopedList = queryEmployees(db, { pageSize: 100 }, primaryScope);
assert.ok(scopedList.meta.total > 0);
assert.ok(scopedList.items.every((employee) => employee.orgUnitName === "小学部"));
const fullList = queryEmployees(db, { pageSize: 100 });
assert.ok(fullList.meta.total > scopedList.meta.total, "全校列表应大于学部 scope 列表");

// ---- 2. 入职流程闭环 ----
// 越权：head_primary 不能为初中部发起入职
assert.throws(
  () =>
    createHrFlow(
      db,
      headPrimary,
      { flowType: "onboard", personName: "越权者", orgUnitId: "ORG-STAGE-middle", positionId: "POS-TEACHER", primarySubjectId: "math", reason: "越权测试" },
      context,
    ),
  /只能为本学部/,
);

const teacherCountBefore = db.teachers.length;
const onboard = createHrFlow(
  db,
  headPrimary,
  {
    flowType: "onboard",
    personName: "新入职教师甲",
    phone: "13700001111",
    orgUnitId: "ORG-STAGE-primary",
    positionId: "POS-TEACHER",
    primarySubjectId: "math",
    hiredAt: "2026-09-01",
    reason: "秋季扩班补充数学教师",
  },
  context,
);
assert.equal(onboard.status, "pending");
assert.equal(queryHrFlows(db, { todo: "1" }, hr).some((flow) => flow.id === onboard.id), true, "hr 应看到补全确认待办");
assert.equal(
  queryHrFlows(db, { todo: "1" }, sysadmin).some((flow) => flow.id === onboard.id),
  true,
  "system_admin 拥有 hr 步骤代理权限",
);

approveHrFlowStep(db, onboard.id, "approve", "资料齐全", hr, context);
assert.equal(onboard.currentStep, 1);
// head_middle 不能终审
assert.throws(() => approveHrFlowStep(db, onboard.id, "approve", "x", headMiddle, context), /不在您的处理范围/);
approveHrFlowStep(db, onboard.id, "approve", "同意录用", sysadmin, context);
assert.equal(onboard.status, "approved");
assert.equal(db.teachers.length, teacherCountBefore + 1, "终审通过应创建教师行");
const newTeacher = db.teachers[db.teachers.length - 1];
assert.equal(newTeacher.name, "新入职教师甲");
assert.equal(newTeacher.stageId, "primary");
const newAccount = db.accounts.find((account) => account.teacherId === newTeacher.id);
assert.ok(newAccount, "应自动创建教师账号");
assert.equal(newAccount.mustChangePassword, true);
const newEmployee = employeeByTeacherId(db, newTeacher.id);
assert.equal(newEmployee.status, "probation", "新入职默认试用期");
assert.equal(newEmployee.salaryTemplateId, "TPL-TEACHER-STD", "应自动套用岗位默认薪资模板");

// ---- 3. 调岗流程闭环（小学部 → 初中部） ----
const transferTarget = db.employees.find((employee) => employee.orgUnitId === "ORG-STAGE-primary" && employee.teacherId && employee.id !== newEmployee.id);
const transfer = createHrFlow(
  db,
  headPrimary,
  {
    flowType: "transfer",
    employeeId: transferTarget.id,
    targetOrgUnitId: "ORG-STAGE-middle",
    targetPositionId: "POS-TEACHER",
    effectiveDate: "2026-08-01",
    reason: "初中部数学缺口",
  },
  context,
);
assert.equal(transferTarget.status, "transferring", "发起后进入调岗中");
assert.equal(teacherEligibility(db, transferTarget.teacherId).inTeachingPool, true, "调岗中原学部仍可排课");

// 步骤 0=原学部：head_middle 无权，head_primary 有权
assert.throws(() => approveHrFlowStep(db, transfer.id, "approve", "x", headMiddle, context), /不在您的处理范围/);
approveHrFlowStep(db, transfer.id, "approve", "原学部同意", headPrimary, context);
// 步骤 1=目标学部：head_primary 无权，head_middle 有权
assert.throws(() => approveHrFlowStep(db, transfer.id, "approve", "x", headPrimary, context), /不在您的处理范围/);
approveHrFlowStep(db, transfer.id, "approve", "目标学部接收", headMiddle, context);
approveHrFlowStep(db, transfer.id, "approve", "总校同意", sysadmin, context);
assert.equal(transfer.status, "approved");
assert.equal(transferTarget.orgUnitId, "ORG-STAGE-middle");
assert.equal(transferTarget.status, "active", "生效后恢复在职");
const transferredTeacher = db.teachers.find((teacher) => teacher.id === transferTarget.teacherId);
assert.equal(transferredTeacher.stageId, "middle", "跨学部调岗应同步教学侧学部");

// ---- 4. 拒绝与撤回恢复状态 ----
const rejectTarget = db.employees.find(
  (employee) => employee.orgUnitId === "ORG-STAGE-primary" && employee.teacherId && employee.status === "active",
);
const rejectFlow = createHrFlow(
  db,
  hr,
  { flowType: "offboard", employeeId: rejectTarget.id, effectiveDate: "2026-08-31", reason: "个人原因" },
  context,
);
assert.equal(rejectTarget.status, "offboarding");
assert.equal(teacherEligibility(db, rejectTarget.teacherId).inTeachingPool, false, "离职中冻结新增排课");
assert.throws(() => approveHrFlowStep(db, rejectFlow.id, "reject", "", headPrimary, context), /必须填写意见/);
approveHrFlowStep(db, rejectFlow.id, "reject", "挽留成功", headPrimary, context);
assert.equal(rejectFlow.status, "rejected");
assert.equal(rejectTarget.status, "active", "拒绝后恢复原状态");

const withdrawFlow = createHrFlow(
  db,
  hr,
  { flowType: "offboard", employeeId: rejectTarget.id, effectiveDate: "2026-08-31", reason: "再次发起" },
  context,
);
withdrawHrFlow(db, withdrawFlow.id, hr);
assert.equal(withdrawFlow.status, "withdrawn");
assert.equal(rejectTarget.status, "active");

// ---- 5. 离职流程闭环：课次取消 + 账号禁用 + 交接清单 ----
const offboardTarget = db.employees.find(
  (employee) => employee.orgUnitId === "ORG-STAGE-primary" && employee.teacherId && employee.status === "active",
);
// 构造生效日之后的已发布课次
["2026-09-07", "2026-09-08", "2026-09-09"].forEach((date, index) => {
  db.lessonInstances.push({
    id: `LESSON-OFFBOARD-${index}`,
    teacherId: offboardTarget.teacherId,
    classId: "CLS-primary-1-01",
    className: "一年级 1 班",
    subjectId: "chinese",
    subjectName: "语文",
    date,
    time: "08:00-08:40",
    status: "scheduled",
    source: "backend-scheduling",
    termId: "TERM-2026-PHASE1",
  });
});
const offboard = createHrFlow(
  db,
  headPrimary,
  { flowType: "offboard", employeeId: offboardTarget.id, effectiveDate: "2026-08-31", reason: "合同到期不续签" },
  context,
);
approveHrFlowStep(db, offboard.id, "approve", "学部确认", headPrimary, context);
approveHrFlowStep(db, offboard.id, "approve", "总校批准", sysadmin, context);
assert.equal(offboard.status, "approved");
assert.equal(offboardTarget.status, "left");
assert.equal(offboardTarget.leftAt, "2026-08-31");
assert.equal(offboard.payload.handover.futureLessonCount, 3, "交接清单应列出生效日后课次");
assert.equal(offboard.payload.cancelledLessonCount, 3, "生效日后课次应自动取消");
assert.ok(
  db.lessonInstances
    .filter((lesson) => lesson.id.startsWith("LESSON-OFFBOARD"))
    .every((lesson) => lesson.status === "cancelled"),
);
const offboardAccount = db.accounts.find((account) => account.teacherId === offboardTarget.teacherId);
assert.equal(offboardAccount.status, "disabled", "离职生效应禁用登录账号");
assert.ok(
  db.notifications.some((item) => item.audience === "admin" && item.title.includes("离职生效")),
  "应通知行政处理课表",
);

// ---- 6. 联动矩阵（PRD 4.5） ----
const leftEligibility = teacherEligibility(db, offboardTarget.teacherId);
assert.deepEqual(
  [leftEligibility.canLogin, leftEligibility.inTeachingPool, leftEligibility.payroll],
  [false, false, "until-left"],
);
// canAttend 随扫码签到一起去掉了：它唯一的消费方是签到接口，
// 「这个人的课算不算钱」现在由 payroll 一个字段回答
assert.equal("canAttend" in leftEligibility, false, "不应保留没有消费方的字段");

// 任课池过滤：已离职老师不出现在排课配置
const config = buildSchedulingConfig(db, { divisionId: "elementary", gradeId: "elementary-g1" });
assert.equal(
  config.teachers.some((teacher) => teacher.id === offboardTarget.teacherId),
  false,
  "已离职老师不能出现在任课池",
);

// ---- 7. 计薪联动：折算 + 拦截 ----
// 离职当月（8 月 31 日离职 = 全月在职，8 月不折算；改用 9 月拦截 + 构造 15 日离职折算）
assert.throws(() => generateTeacherPayrollDetail(db, offboardTarget.teacherId, "2026-09", actor(db, "finance")), /离职后的月份/);

const prorationTarget = db.employees.find(
  (employee) => employee.orgUnitId === "ORG-STAGE-primary" && employee.teacherId && employee.status === "active",
);
const beforePayroll = teacherPayrollPreview(db, prorationTarget.teacherId, "2026-06");
setEmployeeStatus(db, prorationTarget.id, "left", "折算测试", hr, { ...context, effectiveDate: "2026-06-15" });
const proratedPayroll = teacherPayrollPreview(db, prorationTarget.teacherId, "2026-06");
assert.equal(
  proratedPayroll.baseSalary,
  Math.round(beforePayroll.baseSalary * (15 / 30) * 100) / 100,
  "6 月 15 日离职基本工资应按 15/30 折算",
);
assert.ok(
  proratedPayroll.components.find((item) => item.name === "基本工资")?.basis.includes("折算"),
  "折算依据应写入计算说明",
);
setEmployeeStatus(db, prorationTarget.id, "active", "恢复", hr, context);

// suspended 计薪冻结
const suspendTarget = prorationTarget;
setEmployeeStatus(db, suspendTarget.id, "suspended", "风控停用", sysadmin, context);
assert.throws(() => assertPayrollEligible(db, suspendTarget.teacherId, "2026-06"), /计薪冻结/);
const suspendAccount = db.accounts.find((account) => account.teacherId === suspendTarget.teacherId);
assert.equal(suspendAccount.status, "disabled", "停用即时禁用登录");
setEmployeeStatus(db, suspendTarget.id, "active", "恢复", sysadmin, context);
assert.equal(suspendAccount.status, "active");

// ---- 8. 超时提醒（3 个工作日） ----
const staleFlow = createHrFlow(
  db,
  hr,
  { flowType: "offboard", employeeId: prorationTarget.id, effectiveDate: "2026-12-31", reason: "超时测试" },
  context,
);
staleFlow.lastActionAt = "2026-07-01T08:00:00.000Z"; // 周三，+3 工作日 = 下周一 7/6
const notifiedCount = scanHrFlowTimeouts(db, { now: new Date("2026-07-08T09:00:00+08:00") });
assert.equal(notifiedCount, 1, "超期流程应产生提醒");
assert.ok(db.notifications.some((item) => item.title.includes("审批超时提醒")));
assert.ok(staleFlow.timeoutNotifiedAt, "应记录已提醒，避免重复");
assert.equal(scanHrFlowTimeouts(db, { now: new Date("2026-07-08T10:00:00+08:00") }), 0, "同一停留只提醒一次");
withdrawHrFlow(db, staleFlow.id, hr);

// ---- 9. 待办统计与审计 scope ----
assert.equal(typeof countHrTodos(db, sysadmin), "number");
const scopedAudit = queryHrAuditLogs(db, { pageSize: 100 }, primaryScope);
const primaryEmployeeIds = new Set(
  db.employees.filter((employee) => primaryScope.orgUnitIds.has(employee.orgUnitId)).map((employee) => employee.id),
);
assert.ok(scopedAudit.items.length > 0);
assert.ok(
  scopedAudit.items.every((entry) => primaryEmployeeIds.has(entry.targetEmployeeId)),
  "学部负责人审计只含本学部人员",
);

console.log("hr flows checks passed");
