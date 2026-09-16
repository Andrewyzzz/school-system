// 通用审批（OA）引擎验证
// 覆盖：模板与角色过滤、表单必填与类型校验、业务规则、多级流转、会签或签、
//       拒绝、撤回、催办、越权、待办计数、查询范围、超时提醒
import assert from "node:assert/strict";
import {
  OA_TEMPLATES,
  ensureOaTemplates,
  listAllTemplates,
  createOaTemplate,
  updateOaTemplate,
  setOaTemplateStatus,
  deleteOaTemplate,
  listTemplatesForRole,
  createOaRequest,
  actOnOaRequest,
  addOaExecutionEvidence,
  executeOaRequest,
  withdrawOaRequest,
  urgeOaRequest,
  queryOaRequests,
  getOaRequestDetail,
  countOaTodos,
  scanOaTimeouts,
  findTemplate,
  calculateLeaveDays,
  calculateOvertimeHours,
  listOvertimeBatchStaffOptions,
  listClassSizeConfirmationOptions,
  registerOaSideEffect,
} from "../server/oa.js";
import { registerApprovalSideEffects } from "../server/server.js";
import { teacherPayrollPreview } from "../server/storage.js";

const account = (id, role, name) => ({ id, role, displayName: name, username: id });
const teacher = account("ACC-T1", "teacher", "张老师");
const teacher2 = account("ACC-T2", "teacher", "李老师");
const head = account("ACC-H1", "division_head", "小学部负责人");
const hr = account("ACC-HR", "hr", "人事专员");
const admin = account("ACC-AD", "admin", "教务");
const finance = { ...account("ACC-FI", "finance", "总校财务"), financeScope: "headquarters", financeReadAll: true };
const sysadmin = account("ACC-SA", "system_admin", "总校管理员");

function freshDb() {
  const db = { oaRequests: [], oaTemplates: [], notifications: [] };
  ensureOaTemplates(db);
  return db;
}

// -------------------------------------------------------- 审批完成后的执行留痕
{
  const db = freshDb();
  db.accounts = [teacher, head, finance];
  const template = createOaTemplate(
    db,
    {
      key: "execution_trace_test",
      name: "执行留痕测试",
      applicantRoles: ["teacher"],
      formFields: [{ key: "reason", label: "事项", type: "text", required: true }],
      steps: [{ name: "负责人审批", approverAccountIds: [head.id], approverMode: "any" }],
      execution: {
        enabled: true,
        name: "财务拨款",
        executorAccountIds: [finance.id],
        evidenceRequired: true,
        evidenceLabel: "拨款凭证",
      },
    },
    sysadmin,
  );
  const request = createOaRequest(db, teacher, { templateKey: template.key, formData: { reason: "测试拨款" } });
  actOnOaRequest(db, request.id, "approve", head, { comment: "批准" });
  assert.equal(request.status, "executing", "末级审批通过后应进入待执行，而不是直接办结");
  assert.equal(request.execution.status, "pending");
  assert.equal(countOaTodos(db, finance), 1, "指定执行人应收到可操作待办");
  assert.equal(getOaRequestDetail(db, request.id, finance).canExecute, true, "执行人可查看并办理执行环节");
  assert.ok(
    db.notifications.some((item) => item.accountIds.includes(finance.id) && item.title.includes("待执行")),
    "执行人应收到待执行通知，而不是只读抄送",
  );
  assert.throws(() => executeOaRequest(db, request.id, finance, {}), /请先上传拨款凭证/);
  assert.throws(() => executeOaRequest(db, request.id, head, {}), /不由您处理/);
  addOaExecutionEvidence(db, request.id, [{ id: "ATT-EXEC-1", originalName: "拨款回单.pdf" }], finance);
  executeOaRequest(db, request.id, finance, { comment: "已完成拨款" });
  assert.equal(request.status, "approved", "执行人确认后才正式办结");
  assert.equal(request.execution.status, "executed");
  assert.equal(request.execution.executedByAccountId, finance.id);
  assert.deepEqual(request.execution.evidenceAttachmentIds, ["ATT-EXEC-1"]);
  assert.ok(request.timeline.some((item) => item.action === "executed"), "执行完成必须进入审批时间线");
}

function leaveForm(overrides = {}) {
  return {
    leaveType: "事假",
    startDate: "2026-09-10",
    startHalf: "上午",
    endDate: "2026-09-11",
    endHalf: "下午",
    days: 2,
    reason: "家中有事",
    ...overrides,
  };
}

function outboundForm(overrides = {}) {
  return {
    startDate: "2026-09-10",
    startHalf: "上午",
    endDate: "2026-09-11",
    endHalf: "下午",
    reason: "参加市级教学培训",
    ...overrides,
  };
}

// -------------------------------------------------------- 请假半天精度
{
  assert.equal(calculateLeaveDays("2026-09-10", "上午", "2026-09-10", "上午"), 0.5);
  assert.equal(calculateLeaveDays("2026-09-10", "上午", "2026-09-10", "下午"), 1);
  assert.equal(calculateLeaveDays("2026-09-10", "下午", "2026-09-10", "下午"), 0.5);
  assert.equal(calculateLeaveDays("2026-09-10", "下午", "2026-09-11", "上午"), 1);
  assert.throws(
    () => calculateLeaveDays("2026-09-10", "下午", "2026-09-10", "上午"),
    /结束时间不能早于开始时间/,
  );
  assert.equal(calculateOvertimeHours("18:00", "21:30"), 3.5, "加班时长应由起止时间精确计算");
  assert.equal(calculateOvertimeHours("22:00", "02:00"), 4, "夜班可跨越午夜");
  assert.throws(() => calculateOvertimeHours("18:15", "21:00"), /每半小时/, "加班时间不应精确到分钟");
  assert.throws(() => calculateOvertimeHours("18:00", "18:00"), /不能相同/);
  const overtimeTemplate = findTemplate(freshDb(), "overtime");
  assert.equal(overtimeTemplate.formFields.find((field) => field.key === "startTime")?.type, "half_hour_time", "个人加班应使用前端半小时选择器");
  const batchTemplate = findTemplate(freshDb(), "overtime_batch");
  assert.equal(batchTemplate.formFields.find((field) => field.key === "endTime")?.type, "half_hour_time", "批量加班应使用前端半小时选择器");
}

// ------------------------------------------------------------ 模板与角色过滤
{
  assert.ok(OA_TEMPLATES.length >= 7, "应内置至少 7 类审批模板");
  OA_TEMPLATES.forEach((template) => {
    assert.ok(template.key && template.name && template.icon, `模板 ${template.key} 字段不完整`);
    assert.ok(template.formFields.length > 0, `模板 ${template.key} 必须有表单字段`);
    assert.ok(template.steps.length > 0, `模板 ${template.key} 必须有审批步骤`);
    template.steps.forEach((step) => {
      assert.ok(step.approverRoles.length > 0, `模板 ${template.key} 的步骤必须指定审批角色`);
    });
  });

  const teacherTemplates = listTemplatesForRole(freshDb(), "teacher").map((item) => item.key);
  assert.ok(teacherTemplates.includes("leave"), "老师应能发起请假");
  assert.ok(teacherTemplates.includes("outbound"), "老师应能发起外出申请");
  assert.ok(teacherTemplates.includes("lesson_swap"), "老师应能发起调课");
  assert.ok(!teacherTemplates.includes("budget_confirm"), "老师不应能发起预算确认");
  assert.ok(!teacherTemplates.includes("class_size_confirm"), "老师不应能发起人数确认");

  const financeTemplates = listTemplatesForRole(freshDb(), "finance").map((item) => item.key);
  assert.ok(financeTemplates.includes("budget_confirm"), "财务应能发起预算确认");
  assert.ok(financeTemplates.includes("lesson_rule_confirm"), "财务应能发起课时规则确认");

  const budgetTemplate = findTemplate(freshDb(), "budget_confirm");
  assert.deepEqual(
    budgetTemplate.formFields.find((field) => field.key === "termId"),
    { key: "termId", label: "适用学期", type: "term", required: true, hint: "仅显示已建立、未完成且未归档的正式学期" },
    "学部薪酬预算必须通过正式学期主键选择，不能手填名称",
  );
  assert.deepEqual(
    budgetTemplate.formFields.map((field) => field.key),
    ["termId", "budgetScope", "amount"],
    "预算申请只应填写适用学期、目标学部和该学部金额",
  );
  assert.equal(budgetTemplate.formFields.find((field) => field.key === "budgetScope")?.type, "budget_scope");
  const divisionBudgetTemplate = findTemplate(freshDb(), "division_budget_use");
  assert.equal(divisionBudgetTemplate.formFields[0].key, "termId");
  assert.equal(divisionBudgetTemplate.formFields[0].type, "term");
  assert.equal(divisionBudgetTemplate.formFields[0].hint, "仅显示已建立、未完成且未归档的正式学期");

  const divisionHeadTemplates = listTemplatesForRole(freshDb(), "division_head").map((item) => item.key);
  assert.ok(divisionHeadTemplates.includes("division_budget_use"), "学部主任应能发起本学部预算使用申请");
  assert.ok(divisionHeadTemplates.includes("class_size_confirm"), "学部主任应能发起本学部班级人数确认");

  const schedulerTemplates = listTemplatesForRole(freshDb(), "admin").map((item) => item.key);
  assert.ok(!schedulerTemplates.includes("class_size_confirm"), "学部排课负责人不应发起班级人数确认");

  const headquartersHrTemplates = listTemplatesForRole(freshDb(), "system_admin").map((item) => item.key);
  assert.ok(!headquartersHrTemplates.includes("class_size_confirm"), "总校人事行政只审批班级人数，不应自行发起");
}

// ---------------------------------------------------------- 批量加班：学部范围、校长审批与办结抄送
{
  const db = freshDb();
  const primaryHead = { ...account("ACC-HEAD-PRIMARY", "division_head", "小学部主任"), scopeStageIds: ["primary"] };
  const principal = account("ACC-PRINCIPAL", "principal", "校长");
  const headquartersHr = account("ACC-SYSTEM-ADMIN", "system_admin", "总校人事行政");
  const headquartersFinance = { ...account("ACC-FINANCE", "finance", "总校财务"), financeScope: "headquarters", financeReadAll: true };
  const primaryFinance = { ...account("ACC-FINANCE-PRIMARY", "finance", "小学部会计"), financeScope: "primary" };
  db.accounts = [primaryHead, principal, headquartersHr, headquartersFinance, primaryFinance];
  db.teachers = [
    { id: "T-P1", name: "张老师", employeeNo: "821", stageId: "primary", primarySubjectName: "语文", status: "active" },
    { id: "T-P2", name: "陈老师", employeeNo: "919", stageId: "primary", primarySubjectName: "数学", status: "active" },
    { id: "T-H1", name: "高老师", employeeNo: "072", stageId: "high", primarySubjectName: "英语", status: "active" },
  ];
  const options = listOvertimeBatchStaffOptions(db, primaryHead);
  assert.deepEqual(options.staff.map((item) => item.teacherId), ["T-P1", "T-P2"], "候选人员只能返回发起主任所属学部");
  assert.ok(listTemplatesForRole(db, primaryHead).some((item) => item.key === "overtime_batch"));
  assert.ok(!listTemplatesForRole(db, teacher).some((item) => item.key === "overtime_batch"), "老师不能发起批量加班");
  assert.throws(
    () =>
      createOaRequest(db, primaryHead, {
        templateKey: "overtime_batch",
        formData: {
          overtimeDate: "2026-09-20", startTime: "18:00", endTime: "21:30", hours: 99,
          overtimeType: "周末加班", reason: "家长开放日", participantTeacherIds: ["T-H1"],
        },
      }),
    /本学部在职老师/,
    "服务端不能接受跨学部伪造的人员 ID",
  );
  const request = createOaRequest(db, primaryHead, {
    templateKey: "overtime_batch",
    formData: {
      overtimeDate: "2026-09-20", startTime: "18:00", endTime: "21:30", hours: 99,
      overtimeType: "周末加班", reason: "家长开放日", participantTeacherIds: ["T-P1", "T-P2"],
    },
  });
  assert.equal(request.formData.hours, 3.5, "批量加班也不能采信浏览器传来的时长");
  assert.equal(request.formData.participantCount, 2);
  assert.match(request.summary, /2 人/);
  actOnOaRequest(db, request.id, "approve", principal, { comment: "同意" });
  assert.equal(request.status, "approved", "校长审批后批量加班单应办结");
  assert.deepEqual(
    new Set(request.ccRecipients.map((item) => item.accountId)),
    new Set([headquartersHr.id, headquartersFinance.id, primaryFinance.id]),
    "办结后应抄送总校人事行政、总校财务和本学部财务",
  );
  assert.ok(
    db.notifications.some((item) => item.accountIds.includes(primaryFinance.id) && item.title.includes("抄送给您")),
    "办结抄送必须产生通知提醒",
  );
}

// ---------------------------------------------------------- 外出：课程安排 + 人事备案，不计请假扣薪
{
  const db = freshDb();
  const outboundTemplate = findTemplate(db, "outbound");
  assert.ok(outboundTemplate, "应内置外出申请模板");
  assert.equal(outboundTemplate.steps.length, 2, "外出应经过学部负责人审批和人事备案");
  assert.equal(outboundTemplate.formFields.find((field) => field.key === "reason")?.label, "外出原因");
  assert.ok(
    outboundTemplate.steps[0].approverFields.some((field) => field.type === "lessonArrangement" && field.required),
    "学部负责人必须逐节安排外出期间课程",
  );
  const request = createOaRequest(db, teacher, { templateKey: "outbound", formData: outboundForm() });
  assert.equal(request.summary, "外出：2026-09-10 上午 至 2026-09-11 下午");
  assert.throws(
    () => createOaRequest(freshDb(), teacher, { templateKey: "outbound", formData: outboundForm({ startHalf: "下午", endHalf: "上午", endDate: "2026-09-10" }) }),
    /结束时间不能早于开始时间/,
    "外出起止时段必须闭合，避免漏列课程",
  );
  actOnOaRequest(db, request.id, "approve", head, {
    approverData: { lessonArrangements: [], lessonArrangements__empty: true },
  });
  assert.equal(request.steps[1].status, "pending", "课程安排完成后应流转人事备案");
  actOnOaRequest(db, request.id, "approve", hr, {});
  assert.equal(request.status, "approved", "人事备案后外出申请正式完成");
  assert.equal(request.appliedResult, undefined, "外出不应触发请假扣薪副作用");
}

// ----------------------------------------------------------- 指定审批人路由
{
  const db = freshDb();
  const primaryTeacher = account("ACC-T-PRIMARY", "teacher", "小学老师");
  primaryTeacher.teacherId = "T-PRIMARY";
  const primaryHead = { ...account("ACC-HEAD-PRIMARY", "division_head", "小学部主任"), scopeStageIds: ["primary"], department: "小学部", title: "小学部主任" };
  const highHead = { ...account("ACC-HEAD-HIGH", "division_head", "高中部主任"), scopeStageIds: ["high"], department: "高中部", title: "高中部主任" };
  db.accounts = [primaryTeacher, primaryHead, highHead, sysadmin];
  db.teachers = [{ id: "T-PRIMARY", stageId: "primary" }];

  const template = createOaTemplate(
    db,
    {
      key: "direct_person_test",
      name: "指定审批人测试",
      applicantRoles: ["teacher"],
      formFields: [{ key: "reason", label: "事由", type: "text", required: true }],
      steps: [{ name: "学部主任审批", approverAccountIds: [primaryHead.id, highHead.id], approverMode: "any" }],
    },
    sysadmin,
  );
  assert.deepEqual(template.steps[0].approverRoles, [], "指定人员后不应退回为角色群发");

  const request = createOaRequest(db, primaryTeacher, { templateKey: template.key, formData: { reason: "测试" } });
  assert.deepEqual(request.steps[0].approverAccountIds, [primaryHead.id], "小学老师的申请只应路由给小学部主任");
  assert.throws(() => actOnOaRequest(db, request.id, "approve", highHead, {}), /只能审批本学部申请|当前环节不由您处理/);
  assert.doesNotThrow(() => actOnOaRequest(db, request.id, "approve", primaryHead, {}));
}

// ---------------------------------------------------------------- 表单校验
{
  const db = freshDb();
  // 必填缺失
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "leave", formData: { leaveType: "事假" } }),
    /请填写/,
    "缺少必填项应报错",
  );
  // 选项非法
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm({ leaveType: "编造假种" }) }),
    /取值无效/,
    "非法选项应报错",
  );
  // 数字类型
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm({ days: "不是数字" }) }),
    /必须是数字/,
    "数字字段应校验",
  );
  // 业务规则：结束早于开始
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm({ startDate: "2026-09-20", endDate: "2026-09-10" }) }),
    /结束时间不能早于开始时间/,
  );
  // 天数由服务端复核，不能通过篡改客户端字段改变结果
  const corrected = createOaRequest(freshDb(), teacher, { templateKey: "leave", formData: leaveForm({ days: 999 }) });
  assert.equal(corrected.formData.days, 2);
  // 业务规则：预算金额必须为正数，且预算学部必须是四个教学学部之一。
  assert.throws(
    () =>
      createOaRequest(db, finance, {
        templateKey: "budget_confirm",
        formData: {
          termId: "TERM-TEST",
          budgetScope: "primary",
          amount: 0,
        },
      }),
    /必须大于 0/,
  );
  assert.equal(db.oaRequests.length, 0, "校验失败不应产生审批单");
}

// -------------------------------------------------------------- 越权发起
{
  const db = freshDb();
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "budget_confirm", formData: {} }),
    /当前角色无法发起/,
    "老师不能发起预算确认",
  );
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "not_exist", formData: {} }),
    /审批类型无效/,
  );
}

// ------------------------------------------------------ 请假两级流转全链路
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  assert.equal(request.status, "pending");
  assert.equal(request.steps.length, 2, "请假为两级审批");
  assert.equal(request.steps[0].status, "pending");
  assert.equal(request.steps[1].status, "waiting");
  assert.equal(request.summary, "事假 2 天（2026-09-10 上午 至 2026-09-11 下午）", "摘要应可读");
  assert.equal(request.timeline.length, 1);
  assert.ok(db.notifications.length > 0, "应通知当前审批人");

  // 待办归属
  assert.equal(countOaTodos(db, head), 1, "学部负责人应有 1 条待办");
  assert.equal(countOaTodos(db, hr), 0, "第二级审批人此时不应有待办");
  assert.equal(countOaTodos(db, teacher), 0, "申请人自己没有待办");

  // 非当前环节审批人不能操作
  assert.throws(() => actOnOaRequest(db, request.id, "approve", hr, {}), /当前环节不由您处理/);
  assert.throws(() => actOnOaRequest(db, request.id, "approve", finance, {}), /当前环节不由您处理/);

  // 第一级通过
  actOnOaRequest(db, request.id, "approve", head, { comment: "同意", approverData: { lessonArrangements: [], lessonArrangements__empty: true } });
  assert.equal(request.steps[0].status, "approved");
  assert.equal(request.currentStepIndex, 1);
  assert.equal(request.steps[1].status, "pending");
  assert.equal(request.status, "pending");
  assert.equal(countOaTodos(db, hr), 1, "应流转到人事待办");
  assert.equal(countOaTodos(db, head), 0, "上一级不再有待办");

  // 第二级通过 → 完成
  actOnOaRequest(db, request.id, "approve", hr, { comment: "已备案" });
  assert.equal(request.status, "approved");
  assert.ok(request.completedAt, "完成时应记录时间");
  assert.equal(countOaTodos(db, hr), 0);
  assert.ok(
    request.timeline.some((item) => item.action === "completed"),
    "时间线应有完成记录",
  );
  // 已结束不能再操作
  assert.throws(() => actOnOaRequest(db, request.id, "approve", hr, {}), /已通过/);
}

// --------------------------------------------- 请假最终备案后工资单自动失效
{
  // 这里验证的是生产服务注册的副作用，而不是测试内复制一份失效逻辑。
  registerApprovalSideEffects();
  // 本用例不测排课落地，避免空排课数据影响请假计薪副作用的验证。
  registerOaSideEffect("applySubstitutes", () => ({ applied: 0, cancelled: 0 }));
  const payrollTeacher = { ...teacher, teacherId: "T-LEAVE-PAYROLL" };
  const db = freshDb();
  db.accounts = [payrollTeacher, head, hr];
  db.payrollDetails = [
    { id: "PAY-OPEN", teacherId: payrollTeacher.teacherId, month: "2026-09", status: "generated" },
    { id: "PAY-LOCKED", teacherId: payrollTeacher.teacherId, month: "2026-08", status: "locked" },
  ];
  const request = createOaRequest(db, payrollTeacher, {
    templateKey: "leave",
    formData: leaveForm({ startDate: "2026-08-31", startHalf: "下午", endDate: "2026-09-01", endHalf: "上午" }),
  });
  actOnOaRequest(db, request.id, "approve", head, {
    approverData: { lessonArrangements: [], lessonArrangements__empty: true },
  });
  actOnOaRequest(db, request.id, "approve", hr, {});
  assert.equal(request.status, "approved");
  assert.equal(request.appliedResult.type, "leave_payroll");
  assert.deepEqual(request.appliedResult.months, ["2026-08", "2026-09"], "跨月请假应让两个月分别重算");
  assert.equal(request.appliedResult.invalidatedCount, 1, "只删除未锁定的已生成工资单");
  assert.deepEqual(
    db.payrollDetails.map((item) => item.id),
    ["PAY-LOCKED"],
    "已锁定工资单不得被请假审批直接改写",
  );
}

// -------------------------------------------------------------------- 拒绝
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  // 拒绝必须填理由
  assert.throws(() => actOnOaRequest(db, request.id, "reject", head, { comment: "" }), /必须填写理由/);

  actOnOaRequest(db, request.id, "reject", head, { comment: "本周课程无法安排代课" });
  assert.equal(request.status, "rejected");
  assert.equal(request.steps[0].status, "rejected");
  assert.equal(request.steps[1].status, "waiting", "被拒后后续环节不再推进");
  assert.equal(countOaTodos(db, hr), 0);
  assert.ok(
    db.notifications.some((item) => item.accountIds.includes(teacher.id) && item.level === "danger"),
    "应通知申请人被拒",
  );
}

// -------------------------------------------------------------------- 撤回
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  // 他人不能撤回
  assert.throws(() => withdrawOaRequest(db, request.id, teacher2), /只能撤回本人发起的申请/);
  withdrawOaRequest(db, request.id, teacher);
  assert.equal(request.status, "withdrawn");
  assert.equal(countOaTodos(db, head), 0, "撤回后审批人待办应清空");
  // 已结束不能再撤回
  assert.throws(() => withdrawOaRequest(db, request.id, teacher), /无法撤回/);
}

// -------------------------------------------------------------------- 催办
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  const before = db.notifications.length;
  assert.throws(() => urgeOaRequest(db, request.id, teacher2), /只能催办本人发起的申请/);
  urgeOaRequest(db, request.id, teacher);
  assert.ok(db.notifications.length > before, "催办应产生新通知");
  assert.ok(request.timeline.some((item) => item.action === "urged"));
}

// ------------------------------------------------------------ 单级流程与或签
{
  const db = freshDb();
  db.accounts = [{ ...teacher, teacherId: "T1" }, admin];
  db.lessonInstances = [
    {
      id: "SWAP-L1",
      source: "backend-scheduling",
      teacherId: "T1",
      teacherName: "张老师",
      termId: "TERM-1",
      divisionId: "elementary",
      stageId: "primary",
      date: "2026-09-15",
      period: 3,
      className: "小学一(1)班",
      subjectName: "语文",
      status: "scheduled",
    },
    {
      id: "SWAP-L2",
      source: "backend-scheduling",
      teacherId: "T2",
      teacherName: "李老师",
      termId: "TERM-1",
      divisionId: "elementary",
      stageId: "primary",
      date: "2026-09-16",
      period: 2,
      className: "小学二(1)班",
      subjectName: "数学",
      status: "scheduled",
    },
  ];
  let appliedSwapPayload = null;
  registerOaSideEffect("applyLessonSwap", (_database, payload) => {
    appliedSwapPayload = payload;
    return { type: "lesson_swap", source: { lessonId: "SWAP-L1" }, counterpart: { lessonId: "SWAP-L2" } };
  });
  // 调课：双方已协商课程后，由排课负责人单级审批并落地到排课引擎
  const request = createOaRequest(db, teacher, {
    templateKey: "lesson_swap",
    formData: {
      sourceLessonId: "SWAP-L1",
      counterpartTeacherId: "T2",
      counterpartLessonId: "SWAP-L2",
      reason: "双方协商调换上课时间",
    },
  });
  assert.equal(request.steps.length, 1);
  assert.match(request.summary, /小学一\(1\)班/, "调课摘要应展示真实课程，而非内部课次 ID");
  actOnOaRequest(db, request.id, "approve", admin, { comment: "双方课程无冲突，同意调课" });
  assert.equal(appliedSwapPayload.formData.sourceLessonId, "SWAP-L1", "审批通过应把真实源课次交给排课引擎");
  assert.equal(appliedSwapPayload.formData.counterpartLessonId, "SWAP-L2", "审批通过应把协商课次交给排课引擎");
  assert.equal(request.appliedResult.type, "lesson_swap", "调课执行结果应写回审批单留痕");
  assert.equal(request.status, "approved", "单级审批通过即完成");

  // 或签：加班审批多角色任一处理即可
  const overtime = createOaRequest(db, teacher, {
    templateKey: "overtime",
    formData: {
      overtimeDate: "2026-09-20",
      startTime: "18:00",
      endTime: "21:00",
      hours: 3,
      overtimeType: "周末加班",
      reason: "监考",
    },
  });
  assert.equal(overtime.formData.hours, 3, "个人加班时长必须由服务端按起止时间重算");
  assert.equal(countOaTodos(db, head), 1);
  assert.equal(countOaTodos(db, admin), 1, "或签下多个角色都能看到待办");
  actOnOaRequest(db, overtime.id, "approve", admin, { comment: "确认" });
  assert.equal(overtime.status, "approved", "或签一人通过即完成");
  assert.equal(countOaTodos(db, head), 0, "完成后其他人待办清空");
}

// ------------------------------------------------------ 人数确认（学部主任发起，校长审批后抄送）
{
  const db = freshDb();
  const term = {
    id: "TERM-PRIMARY-2026-AUTUMN",
    name: "2026-2027学年上学期",
    schoolYear: "2026-2027",
    startDate: "2026-08-01",
    endDate: "2027-01-31",
    status: "active",
    current: true,
  };
  const primaryHead = { ...head, id: "ACC-HEAD-PRIMARY", scopeStageIds: ["primary"] };
  const headquartersFinance = { ...finance, id: "ACC-FINANCE" };
  const headquartersAdmin = { ...sysadmin, id: "ACC-SYSTEM-ADMIN" };
  const principal = account("ACC-PRINCIPAL", "principal", "校长");
  db.terms = [term];
  db.accounts = [primaryHead, headquartersFinance, headquartersAdmin, principal];
  db.classes = [
    { id: "CLS-P-1", stageId: "primary", grade: 1, name: "一年级 1 班", displayOrder: 1, active: true },
    { id: "CLS-P-2", stageId: "primary", grade: 1, name: "一年级 2 班", displayOrder: 2, active: true },
  ];
  db.teachers = [
    { id: "T-P-HOME-1", name: "王老师", employeeNo: "P001", stageId: "primary", status: "active", primarySubjectName: "语文" },
    { id: "T-P-HOME-2", name: "李老师", employeeNo: "P002", stageId: "primary", status: "active", primarySubjectName: "数学" },
    { id: "T-P-LIFE", name: "陈生活老师", employeeNo: "P003", stageId: "primary", status: "active", primarySubjectName: "生活管理", salaryProfile: { salaryCategory: "lifeTeacher" } },
  ];
  db.employees = [{ teacherId: "T-P-LIFE", positionId: "POS-LIFE-TEACHER", status: "active" }];
  db.payrollDetails = [];
  db.auditLogs = [];
  const classSizeOptions = listClassSizeConfirmationOptions(db, primaryHead, { termId: term.id });
  assert.deepEqual(classSizeOptions.classes.map((item) => item.classId), ["CLS-P-1", "CLS-P-2"]);
  assert.deepEqual(classSizeOptions.homeroomTeachers.map((item) => item.teacherId).sort(), ["T-P-HOME-1", "T-P-HOME-2"]);
  assert.deepEqual(classSizeOptions.lifeTeachers.map((item) => item.teacherId), ["T-P-LIFE"], "生活老师必须单独列出");
  assert.throws(
    () =>
      createOaRequest(db, primaryHead, {
        templateKey: "class_size_confirm",
        formData: {
          termId: term.id,
          classConfirmations: [
            { classId: "CLS-P-1", studentCount: 45, homeroomTeacherId: "T-P-HOME-1" },
            { classId: "CLS-P-2", studentCount: 44, homeroomTeacherId: "T-P-HOME-2" },
          ],
          lifeTeacherAssignments: [{ teacherId: "T-P-LIFE", studentCount: 90 }],
        },
      }),
    /不能超过本学部学生总数/,
    "生活老师负责学生数可以跨班，但合计不得超过本学部学生数",
  );
  const request = createOaRequest(db, primaryHead, {
    templateKey: "class_size_confirm",
    formData: {
      termId: term.id,
      // 即使浏览器伪造了所属学部，服务端也必须按发起主任的范围覆盖。
      stageName: "高中部",
      classConfirmations: [
        { classId: "CLS-P-1", studentCount: 45, homeroomTeacherId: "T-P-HOME-1" },
        { classId: "CLS-P-2", studentCount: 44, homeroomTeacherId: "T-P-HOME-2" },
      ],
      lifeTeacherAssignments: [{ teacherId: "T-P-LIFE", studentCount: 70 }],
      reason: "学期初核定",
    },
  });
  assert.equal(request.termId, term.id, "人数确认必须关联已存在的正式学期主键");
  assert.equal(request.formData.termName, term.name, "学期名称必须由服务端按 termId 回填");
  assert.equal(request.formData.stageId, "primary", "人数所属学部必须按发起主任的权限范围固化");
  assert.equal(request.formData.stageName, "小学部", "浏览器不能伪造其他学部的人数确认");
  assert.equal(request.formData.effectiveMonth, undefined, "人数确认不再单独维护生效月份");
  assert.equal(request.formData.scopeInfo, undefined, "班级名单已能说明范围，不再单独填写确认范围");
  assert.equal(request.formData.totalStudentCount, 89, "学生人数应由逐班明细汇总，不能由浏览器另传");
  assert.equal(request.formData.lifeTeacherStudentTotal, 70, "生活老师按负责学生总数确认，可跨班但受总人数约束");
  assert.equal(request.steps.length, 1, "人数确认只需校长审批");
  assert.deepEqual(request.steps[0].approverRoles, ["principal"]);
  assert.equal(request.ccRecipients.length, 0, "校长审批前不应提前抄送");
  actOnOaRequest(db, request.id, "approve", principal, { comment: "同意" });
  assert.equal(request.status, "approved", "校长审批通过后完成");
  assert.equal(db.classSizeConfirmations.length, 1, "校长通过后应写入学期人数快照");
  assert.equal(db.classSizeConfirmations[0].classConfirmations[0].homeroomTeacherId, "T-P-HOME-1");
  assert.equal(db.classSizeConfirmations[0].lifeTeacherAssignments[0].studentCount, 70);
  const homeroomPreview = teacherPayrollPreview(db, "T-P-HOME-1", "2026-09");
  assert.match(
    homeroomPreview.components.find((item) => item.name === "班主任津贴")?.basis || "",
    /45 人/,
    "班主任津贴应读取已批准的逐班人数，而非人事档案旧值",
  );
  const lifePreview = teacherPayrollPreview(db, "T-P-LIFE", "2026-09");
  assert.match(
    lifePreview.components.find((item) => item.name === "工作量工资")?.basis || "",
    /70 人/,
    "生活老师工作量工资应读取已批准的负责学生总数",
  );
  assert.deepEqual(
    request.ccRecipients.map((item) => item.accountId).sort(),
    [headquartersAdmin.id, headquartersFinance.id].sort(),
    "审批完成后应只抄送总校人事行政和总校财务",
  );
  assert.ok(
    db.notifications.some((item) => item.accountIds.includes(headquartersFinance.id) && item.title.includes("抄送给您")),
    "总校财务应收到审批完成后的抄送通知",
  );
  assert.throws(
    () =>
      createOaRequest(db, primaryHead, {
        templateKey: "class_size_confirm",
        formData: {
          termId: "TERM-NOT-EXIST",
          classConfirmations: [{ classId: "CLS-P-1", studentCount: 45, homeroomTeacherId: "T-P-HOME-1" }],
          lifeTeacherAssignments: [],
        },
      }),
    /请选择系统中已建立的正式学期/,
    "人数确认不可手填或伪造不存在的学期",
  );
}

// ------------------------------------------------------------------ 查询范围
{
  const db = freshDb();
  const own = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  createOaRequest(db, teacher2, { templateKey: "leave", formData: leaveForm({ reason: "另一位老师" }) });

  const todo = queryOaRequests(db, { scope: "todo" }, head);
  assert.equal(todo.meta.total, 2, "学部负责人待办应含两条");
  assert.ok(todo.items.every((item) => item.canAct), "待办项应标记可操作");

  const mine = queryOaRequests(db, { scope: "mine" }, teacher);
  assert.equal(mine.meta.total, 1, "我发起的只含本人");
  assert.ok(mine.items[0].canWithdraw, "本人待审批的可撤回");

  // 老师查看 todo 范围时看不到别人的单子
  const teacherTodo = queryOaRequests(db, { scope: "todo" }, teacher);
  assert.equal(teacherTodo.meta.total, 0);

  // 我处理过
  actOnOaRequest(db, own.id, "approve", head, { comment: "同意", approverData: { lessonArrangements: [], lessonArrangements__empty: true } });
  const handled = queryOaRequests(db, { scope: "handled" }, head);
  assert.equal(handled.meta.total, 1, "处理过的应可追溯");

  // 状态过滤与搜索（搜索命中申请人姓名或事项摘要）
  assert.equal(queryOaRequests(db, { scope: "all", status: "pending" }, sysadmin).meta.total, 2);
  assert.equal(queryOaRequests(db, { scope: "all", search: "李老师" }, sysadmin).meta.total, 1, "应能按申请人搜索");
  assert.equal(queryOaRequests(db, { scope: "all", search: "事假" }, sysadmin).meta.total, 2, "应能按摘要搜索");
  assert.equal(queryOaRequests(db, { scope: "all", search: "不存在的关键词" }, sysadmin).meta.total, 0);
}

// ------------------------------------------------------------ 详情权限控制
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  // 申请人可看
  assert.ok(getOaRequestDetail(db, request.id, teacher).id);
  // 审批链上的角色可看
  assert.ok(getOaRequestDetail(db, request.id, head).id);
  assert.ok(getOaRequestDetail(db, request.id, hr).id);
  // 无关老师看不到
  assert.throws(() => getOaRequestDetail(db, request.id, teacher2), /无权查看/);
  // 详情应带表单字段定义，供前端渲染
  const detail = getOaRequestDetail(db, request.id, head);
  assert.ok(detail.formFields.length > 0);
  assert.equal(detail.canAct, true);
  assert.equal(getOaRequestDetail(db, request.id, teacher).canWithdraw, true);
}

// -------------------------------------------------------------- 超时提醒
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  // 刚提交不提醒
  assert.equal(scanOaTimeouts(db).reminded, 0);
  // 回拨时间超过阈值
  const old = new Date(Date.now() - 5 * 86400000).toISOString();
  request.createdAt = old;
  request.updatedAt = old;
  assert.equal(scanOaTimeouts(db).reminded, 1, "超期应提醒一次");
  assert.equal(scanOaTimeouts(db).reminded, 0, "同一周期内不重复提醒");
  // 已完成的不再提醒
  actOnOaRequest(db, request.id, "approve", head, { approverData: { lessonArrangements: [], lessonArrangements__empty: true } });
  actOnOaRequest(db, request.id, "approve", hr, {});
  assert.equal(scanOaTimeouts(db).reminded, 0);
}

// -------------------------------------------------- 重复投票与模板查找
{
  const db = freshDb();
  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  actOnOaRequest(db, request.id, "approve", head, { comment: "同意", approverData: { lessonArrangements: [], lessonArrangements__empty: true } });
  // 同一人不能在同一环节重复处理（此时已流转到下一环节，故报环节不符）
  assert.throws(() => actOnOaRequest(db, request.id, "approve", head, {}), /当前环节不由您处理/);
  assert.equal(findTemplate(db, "leave").name, "请假申请");
  assert.equal(findTemplate(db, "not_exist"), null);
}

// ---------------------------------------- 代课与工作交接由上级在审批时安排
{
  const db = freshDb();
  const leaveTemplate = findTemplate(db, "leave");
  assert.ok(
    !leaveTemplate.formFields.some((field) => field.key === "handover"),
    "请假表单不应再要求申请人填写交接人",
  );
  const arrangeFields = leaveTemplate.steps[0].approverFields || [];
  assert.ok(
    arrangeFields.some((field) => field.key === "lessonArrangements" && field.type === "lessonArrangement" && field.required),
    "学部负责人环节应逐节安排课程（结构化，可落到课表）",
  );

  const request = createOaRequest(db, teacher, { templateKey: "leave", formData: leaveForm() });
  // 未安排课程不能通过
  assert.throws(
    () => actOnOaRequest(db, request.id, "approve", head, { comment: "同意" }),
    /请安排「课程安排」/,
  );
  actOnOaRequest(db, request.id, "approve", head, {
    comment: "同意",
    approverData: { lessonArrangements: [], lessonArrangements__empty: true, handoverNote: "晨检交副班主任" },
  });
  assert.equal(request.steps[0].approverData.handoverNote, "晨检交副班主任");

  // 申请人可在详情中看到上级的安排
  const detail = getOaRequestDetail(db, request.id, teacher);
  assert.equal(detail.steps[0].approverData.handoverNote, "晨检交副班主任", "申请人应能看到上级安排");
  // 当前环节（人事备案）无需填写内容
  assert.equal(detail.currentApproverFields.length, 0);
}

// ------------------------------------------- 审批流程自定义（系统管理员 DIY）
{
  const db = freshDb();
  const before = listAllTemplates(db).length;

  // 新建自定义模板
  const created = createOaTemplate(
    db,
    {
      key: "seal_use",
      name: "用章申请",
      icon: "🔖",
      category: "行政",
      description: "公章使用申请",
      applicantRoles: ["teacher", "admin"],
      formFields: [
        { key: "sealType", label: "印章类型", type: "select", required: true, options: ["公章", "合同章"] },
        { key: "purpose", label: "用途", type: "textarea", required: true },
      ],
      steps: [
        { name: "部门负责人审批", approverRoles: ["division_head", "admin"], approverMode: "any" },
        {
          name: "办公室登记",
          approverRoles: ["hr"],
          approverMode: "any",
          approverFields: [{ key: "sealNo", label: "用印编号", type: "text", required: true }],
        },
      ],
    },
    sysadmin,
  );
  assert.equal(created.builtIn, false, "自定义模板不应标记为内置");
  assert.equal(listAllTemplates(db).length, before + 1);
  assert.ok(
    listTemplatesForRole(db, "teacher").some((item) => item.key === "seal_use"),
    "新模板应立即对可发起角色可见",
  );

  // 用自定义模板走完流程，验证审批人填写项生效
  const request = createOaRequest(db, teacher, {
    templateKey: "seal_use",
    formData: { sealType: "公章", purpose: "开具证明" },
  });
  actOnOaRequest(db, request.id, "approve", admin, { comment: "同意" });
  assert.throws(() => actOnOaRequest(db, request.id, "approve", hr, {}), /请填写「用印编号」/);
  actOnOaRequest(db, request.id, "approve", hr, { approverData: { sealNo: "YZ-2026-001" } });
  assert.equal(request.status, "approved");
  assert.equal(request.steps[1].approverData.sealNo, "YZ-2026-001");

  // 校验：标识非法、角色非法、选择类型缺选项、环节缺角色
  assert.throws(() => createOaTemplate(db, { key: "Bad Key", name: "x" }, sysadmin), /模板标识只能用/);
  // 标识重复（补齐其它必填项，确保命中的是重复校验而非缺字段）
  assert.throws(
    () =>
      createOaTemplate(
        db,
        {
          key: "seal_use",
          name: "重复的用章申请",
          applicantRoles: ["teacher"],
          formFields: [{ key: "a", label: "甲", type: "text" }],
          steps: [{ name: "审批", approverRoles: ["admin"] }],
        },
        sysadmin,
      ),
    /模板标识已存在/,
  );
  assert.throws(
    () =>
      createOaTemplate(
        db,
        {
          key: "bad_role",
          name: "测试",
          applicantRoles: ["teacher"],
          formFields: [{ key: "a", label: "甲", type: "text" }],
          steps: [{ name: "审批", approverRoles: ["不存在"] }],
        },
        sysadmin,
      ),
    /包含无效角色/,
  );
  assert.throws(
    () =>
      createOaTemplate(
        db,
        {
          key: "bad_option",
          name: "测试",
          applicantRoles: ["teacher"],
          formFields: [{ key: "a", label: "甲", type: "select" }],
          steps: [{ name: "审批", approverRoles: ["admin"] }],
        },
        sysadmin,
      ),
    /必须配置选项/,
  );

  // 修改内置模板的审批链
  const updated = updateOaTemplate(
    db,
    // 原来用「补卡申请」测，它随扫码签到一起去掉了。换一个同样是内置、
    // 同样是单级审批的模板——这里验的是「内置模板的审批链能不能改」，
    // 跟具体是哪个模板无关
    "overtime",
    {
      name: "加班申请",
      icon: "⏱️",
      category: "考勤",
      description: "加班登记",
      applicantRoles: ["teacher"],
      formFields: [{ key: "overtimeDate", label: "加班日期", type: "date", required: true }],
      steps: [
        { name: "部门负责人审批", approverRoles: ["division_head"], approverMode: "any" },
        { name: "人事复核", approverRoles: ["hr"], approverMode: "any" },
      ],
    },
    sysadmin,
  );
  assert.equal(updated.steps.length, 2, "内置模板的审批链应可改为两级");
  assert.equal(updated.updatedByName, "总校管理员", "应记录修改人");
  const newFix = createOaRequest(db, teacher, { templateKey: "overtime", formData: { overtimeDate: "2026-09-10" } });
  assert.equal(newFix.steps.length, 2, "新申请应按修改后的流程走");

  // 停用后不可发起，启用后恢复
  setOaTemplateStatus(db, "seal_use", "disabled", sysadmin);
  assert.ok(!listTemplatesForRole(db, "teacher").some((item) => item.key === "seal_use"), "停用后不再出现在可发起列表");
  assert.throws(
    () => createOaRequest(db, teacher, { templateKey: "seal_use", formData: { sealType: "公章", purpose: "x" } }),
    /已停用/,
  );
  setOaTemplateStatus(db, "seal_use", "active", sysadmin);
  assert.ok(listTemplatesForRole(db, "teacher").some((item) => item.key === "seal_use"));

  // 内置模板不可删除；有进行中单据的模板不可删除
  assert.throws(() => deleteOaTemplate(db, "leave"), /内置模板不可删除/);
  const pendingSeal = createOaRequest(db, teacher, {
    templateKey: "seal_use",
    formData: { sealType: "公章", purpose: "占用中" },
  });
  assert.throws(() => deleteOaTemplate(db, "seal_use"), /仍有审批中的单据/);
  withdrawOaRequest(db, pendingSeal.id, teacher);
  assert.deepEqual(deleteOaTemplate(db, "seal_use"), { deleted: true });
}

// -------------------------------------------------- 播种幂等性与配置保留
{
  const db = freshDb();
  // 学校改过的流程在再次播种时不应被重置
  updateOaTemplate(
    db,
    "overtime",
    {
      name: "加班申请",
      icon: "🌙",
      category: "考勤",
      description: "自定义后的说明",
      applicantRoles: ["teacher"],
      formFields: [{ key: "hours", label: "时长", type: "number", required: true }],
      steps: [{ name: "自定义环节", approverRoles: ["hr"], approverMode: "any" }],
    },
    sysadmin,
  );
  const changed = ensureOaTemplates(db);
  assert.equal(changed, false, "已有模板齐全时不应再写入");
  const overtime = findTemplate(db, "overtime");
  assert.equal(overtime.steps[0].name, "自定义环节", "自定义流程不应被播种覆盖");
  assert.equal(overtime.description, "自定义后的说明");
}

// ------------------------------- 请假代课落到课表：课次查询、阻断原因与回滚
{
  const {
    applyApprovedLessonSwap,
    applySubstituteArrangements,
    listLessonSwapOptions,
    listTeacherLessonsInRange,
  } = await import("../server/scheduling.js");

  const buildScheduleDb = () => ({
    meta: { updatedAt: "" },
    auditLogs: [], notifications: [], attendanceRecords: [], payrollDetails: [], accounts: [],
    subjects: [{ id: "chinese", name: "语文", teacherIds: ["T1", "T2", "T3"] }],
    teachers: [
      { id: "T1", name: "原老师", status: "active", stageId: "primary", primarySubjectId: "chinese", employeeNo: "T1" },
      { id: "T2", name: "代课A", status: "active", stageId: "primary", primarySubjectId: "chinese", employeeNo: "T2" },
    ],
    classes: [{ id: "C1", stageId: "primary", grade: 1, active: true, roomId: "R1", name: "一(1)班" }],
    rooms: [{ id: "R1", stageId: "primary", active: true, roomType: "homeroom", name: "101" }],
    teacherAssignments: [{ stageId: "primary", grade: 1, subjectId: "chinese", teacherIds: ["T1", "T2"] }],
    terms: [{ id: "TERM-1", name: "测试学期", current: true, status: "active", startDate: "2026-06-15", endDate: "2026-07-31" }],
    scheduleDrafts: [{
      id: "DRAFT-1", termId: "TERM-1", divisionId: "elementary", gradeId: "elementary-g1", weekStart: "2026-06-15", status: "published",
      assignments: [
        { id: "A1", teacherId: "T1", date: "2026-06-15", time: "08:00-08:40", period: 1, dayIndex: 0, classId: "C1", subjectId: "chinese", roomId: "R1" },
        { id: "A2", teacherId: "T1", date: "2026-06-16", time: "08:00-08:40", period: 1, dayIndex: 1, classId: "C1", subjectId: "chinese", roomId: "R1" },
      ],
    }],
    lessonInstances: [
      { id: "L1", termId: "TERM-1", divisionId: "elementary", gradeId: "elementary-g1", stageId: "primary", scheduleAssignmentId: "A1", schedulingDraftId: "DRAFT-1", source: "backend-scheduling", teacherId: "T1", teacherName: "原老师", date: "2026-06-15", time: "08:00-08:40", period: 1, classId: "C1", className: "一(1)班", subjectId: "chinese", subjectName: "语文", roomId: "R1", room: "101", type: "regular", units: 1, status: "scheduled" },
      { id: "L2", termId: "TERM-1", divisionId: "elementary", gradeId: "elementary-g1", stageId: "primary", scheduleAssignmentId: "A2", schedulingDraftId: "DRAFT-1", source: "backend-scheduling", teacherId: "T1", teacherName: "原老师", date: "2026-06-16", time: "08:00-08:40", period: 1, classId: "C1", className: "一(1)班", subjectId: "chinese", subjectName: "语文", roomId: "R1", room: "101", type: "regular", units: 1, status: "scheduled" },
    ],
    scheduleChangeRequests: [],
  });

  // 按教师与日期区间列出请假期间的课次
  const db1 = buildScheduleDb();
  const lessons = listTeacherLessonsInRange(db1, "T1", "2026-06-15", "2026-06-16");
  assert.equal(lessons.length, 2, "应列出请假期间的两节课");
  assert.ok(lessons[0].changeable, "正常课次应可变更");
  assert.equal(lessons[0].assignmentId, "A1");
  assert.equal(listTeacherLessonsInRange(db1, "T1", "2026-07-01", "2026-07-02").length, 0, "区间外不应返回课次");

  // 已取消的课次不可再变更并说明原因。
  // 原来这里测的是「已签到的课次」，签到取消后剩下的不可变更情形是
  // 「已取消」——它已经从工资里扣掉了，改回来会让已定案的工资对不上。
  const db2 = buildScheduleDb();
  db2.lessonInstances.find((l) => l.id === "L1").status = "cancelled";
  const blocked = listTeacherLessonsInRange(db2, "T1", "2026-06-15", "2026-06-16");
  assert.equal(blocked[0].changeable, false, "已取消的课次不可变更");
  assert.match(blocked[0].blockedReason, /已取消/, "要说清楚为什么不能变更");

  // 已锁定工资的月份同样不可变更：那个月的钱已经发出去了，
  // 这时候改课表会让工资单和课表对不上
  const db3 = buildScheduleDb();
  db3.payrollDetails = [
    { teacherId: "T1", month: "2026-06", status: "locked" },
  ];
  const lockedRows = listTeacherLessonsInRange(db3, "T1", "2026-06-15", "2026-06-16");
  assert.equal(lockedRows[0].changeable, false, "已锁薪月份的课次不可变更");
  assert.match(lockedRows[0].blockedReason, /工资已锁定/);

  // 取消课次
  const db4 = buildScheduleDb();
  const cancelled = applySubstituteArrangements(db4, [{ lessonId: "L1", action: "cancel" }], { id: "ACC", name: "审批人" });
  assert.equal(cancelled.cancelled.length, 1);
  assert.equal(db4.lessonInstances.find((item) => item.id === "L1").status, "cancelled", "课次应标记取消");
  assert.match(db4.lessonInstances.find((item) => item.id === "L1").cancelReason, /请假/);

  // 外出安排：课表转给代课老师，代课课型按代课单价计；原老师保留正常课时工资投影。
  const dbOutbound = buildScheduleDb();
  dbOutbound.payrollDetails = [
    { id: "PAY-T1", teacherId: "T1", month: "2026-06", status: "generated" },
    { id: "PAY-T2", teacherId: "T2", month: "2026-06", status: "generated" },
  ];
  const outboundApplied = applySubstituteArrangements(
    dbOutbound,
    [{ lessonId: "L1", substituteTeacherId: "T2", preserveOriginalLessonPay: true, arrangementContext: "outbound" }],
    { id: "ACC", name: "审批人", role: "admin", scopeStageIds: ["primary"] },
  );
  const outboundLesson = dbOutbound.lessonInstances.find((item) => item.id === "L1");
  assert.equal(outboundLesson.teacherId, "T2", "外出时课表应转给代课老师");
  assert.equal(outboundLesson.type, "substitute", "代课老师必须按代课课型计薪");
  assert.equal(outboundLesson.outboundOriginalTeacherId, "T1", "外出应保留原任课老师的计薪归属");
  assert.equal(outboundLesson.outboundOriginalLessonType, "regular", "原老师应按原课程类型保留正常课时工资");
  assert.equal(outboundApplied.applied[0].preserveOriginalLessonPay, true);
  assert.equal(dbOutbound.payrollDetails.length, 0, "外出改课后，两位老师未锁定的工资明细应自动作废重算");

  // 审批中心调课：老师选择自己和协商老师的两节实际课程，审批通过后原子互换上课时间。
  const dbSwap = buildScheduleDb();
  const counterpartLesson = dbSwap.lessonInstances.find((item) => item.id === "L2");
  counterpartLesson.teacherId = "T2";
  counterpartLesson.teacherName = "代课A";
  dbSwap.scheduleDrafts[0].assignments.find((item) => item.id === "A2").teacherId = "T2";
  dbSwap.accounts = [{ id: "ACC-T1", teacherId: "T1", role: "teacher" }];
  dbSwap.payrollDetails = [
    { id: "PAY-SWAP-T1", teacherId: "T1", month: "2026-06", status: "generated" },
    { id: "PAY-SWAP-T2", teacherId: "T2", month: "2026-06", status: "generated" },
  ];
  const swapOptions = listLessonSwapOptions(dbSwap, "T1");
  assert.equal(swapOptions.sourceLessons.length, 1, "老师只能从自己的已发布课程中选择待调课次");
  assert.equal(swapOptions.counterpartLessons.length, 1, "应列出同学部其他老师的协商课次");
  const appliedSwap = applyApprovedLessonSwap(
    dbSwap,
    {
      requestId: "OA-SWAP-1",
      applicantAccountId: "ACC-T1",
      formData: { sourceLessonId: "L1", counterpartLessonId: "L2" },
    },
    { id: "ACC-SCHEDULER", name: "小学排课负责人", role: "admin", scopeStageIds: ["primary"] },
  );
  const swappedSource = dbSwap.lessonInstances.find((item) => item.id === "L1");
  const swappedCounterpart = dbSwap.lessonInstances.find((item) => item.id === "L2");
  assert.equal(swappedSource.date, "2026-06-16", "源课程应换到协商课程原来的时间");
  assert.equal(swappedCounterpart.date, "2026-06-15", "协商课程应换到源课程原来的时间");
  assert.equal(swappedSource.teacherId, "T1", "调课只交换时间，不改变任课老师");
  assert.equal(swappedCounterpart.teacherId, "T2", "调课只交换时间，不改变任课老师");
  assert.equal(dbSwap.payrollDetails.length, 0, "调课后双方尚未锁定的工资明细应自动作废重算");
  assert.equal(appliedSwap.type, "lesson_swap", "调课结果应作为审批执行留痕返回");
  assert.ok(dbSwap.auditLogs.some((item) => item.action === "oa_lesson_swap_apply"), "调课应写入排课审计日志");

  // 中途失败整单回滚：第一节取消成功，第二节课次不存在
  const db5 = buildScheduleDb();
  const before = JSON.stringify(db5.lessonInstances);
  assert.throws(
    () =>
      applySubstituteArrangements(
        db5,
        [
          { lessonId: "L1", action: "cancel" },
          { lessonId: "L_NOT_EXIST", action: "cancel" },
        ],
        { id: "ACC", name: "审批人" },
      ),
    /课次不存在/,
  );
  assert.equal(JSON.stringify(db5.lessonInstances), before, "失败时课表必须整体回滚，不留半改状态");
  assert.equal(db5.scheduleChangeRequests.length, 0, "回滚后不应残留变更单");

  // 未指定代课教师时拒绝，且原课次不变
  const db6 = buildScheduleDb();
  assert.throws(
    () => applySubstituteArrangements(db6, [{ lessonId: "L1", substituteTeacherId: "" }], { id: "ACC" }),
    /未指定代课教师/,
  );
  assert.equal(db6.lessonInstances.find((item) => item.id === "L1").teacherId, "T1", "拒绝后原课次不变");

  // 空安排是允许的（请假期间本就没课）
  assert.deepEqual(applySubstituteArrangements(buildScheduleDb(), []), { applied: [], cancelled: [] });
}

console.log("oa flows checks passed");
