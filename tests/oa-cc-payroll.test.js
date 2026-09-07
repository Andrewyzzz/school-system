// 月度工资确认：学部财务核算 → 学部主任签字 → 校长签字 → 总校财务执行。
// 关键是审批人查看冻结的逐人明细，且执行完成才锁薪、记入学部预算。
import assert from "node:assert/strict";
import { createInitialData, generatePayrollBatch, normalizeDatabase } from "../server/storage.js";
import { queryTermBudget } from "../server/budget.js";
import {
  actOnOaRequest,
  addOaExecutionEvidence,
  createOaRequest,
  ensureOaTemplates,
  executeOaRequest,
  getOaRequestDetail,
  listPayrollApprovalOptions,
  listTemplatesForRole,
} from "../server/oa.js";
import { registerApprovalSideEffects } from "../server/server.js";

function freshDb() {
  const db = createInitialData({ teacherCount: 24 });
  normalizeDatabase(db);
  const term = db.terms.find((item) => item.current) || db.terms[0];
  // 测试使用 2026-06；延长演示学期以免真实日期推进导致期间被判定完成。
  term.endDate = "2099-01-31";
  term.current = true;
  ensureOaTemplates(db);
  return { db, term };
}

function account(db, username) {
  const item = db.accounts.find((entry) => entry.username === username);
  assert.ok(item, `缺少账号 ${username}`);
  return { ...item, displayName: item.name };
}

function preparePrimaryPayroll(db, term, month = "2026-06") {
  const finance = account(db, "finance_primary");
  const firstPrimaryTeacher = db.teachers.find((teacher) => teacher.stageId === "primary");
  assert.ok(firstPrimaryTeacher, "测试数据应至少有一位小学老师");
  db.monthlyAssessments.push({
    id: "ASSESS-PAYROLL-120",
    teacherId: firstPrimaryTeacher.id,
    month,
    score: 120,
    note: "测试绩效",
  });
  const batch = generatePayrollBatch(db, { month }, finance);
  assert.ok(batch.successCount > 0, "应生成小学部工资明细");
  db.payrollDetails
    .filter((detail) => detail.month === month && detail.termId === term.id)
    .forEach((detail) => {
      detail.status = "reviewed";
    });
  return { finance, firstPrimaryTeacher };
}

registerApprovalSideEffects();

// 1. 模板与权限。
{
  const { db, term } = freshDb();
  const { finance } = preparePrimaryPayroll(db, term);
  const hqFinance = account(db, "finance");
  const template = db.oaTemplates.find((item) => item.key === "payroll_approval");
  assert.ok(template, "应内置月度工资确认模板");
  assert.deepEqual(template.steps.map((step) => step.name), ["学部主任确认签字", "校长审批签字"]);
  assert.equal(template.execution?.executorAccountIds?.[0], hqFinance.id, "总校财务应是执行人");
  assert.ok(template.execution?.evidenceRequired, "发放执行必须上传凭证");
  assert.deepEqual(
    template.formFields.map((field) => field.key),
    ["termId", "month", "stageName", "headcount", "totalAmount", "reason"],
    "人数和总额应由系统回填，不让财务手输",
  );
  assert.ok(listTemplatesForRole(db, finance).some((item) => item.key === "payroll_approval"));
  assert.ok(!listTemplatesForRole(db, hqFinance).some((item) => item.key === "payroll_approval"));
  assert.throws(
    () => createOaRequest(db, hqFinance, { templateKey: "payroll_approval", formData: { termId: term.id, month: "2026-06" } }),
    /无法发起|总校财务负责执行/,
  );
}

// 2. 发起时冻结逐人明细；只路由给所属学部主任。
{
  const { db, term } = freshDb();
  const { finance, firstPrimaryTeacher } = preparePrimaryPayroll(db, term);
  const options = listPayrollApprovalOptions(db, finance);
  assert.deepEqual(options.periods.map((item) => item.month), ["2026-06"]);
  assert.equal(options.periods[0].termId, term.id);

  const request = createOaRequest(db, finance, {
    templateKey: "payroll_approval",
    formData: {
      termId: term.id,
      month: "2026-06",
      stageName: "高中部",
      headcount: 1,
      totalAmount: 1,
      reason: "本月核算完成",
    },
  });
  assert.equal(request.formData.stageId, "primary");
  assert.equal(request.formData.stageName, "小学部");
  assert.ok(request.payrollSnapshot?.rows?.length > 0, "单据必须保存逐人快照");
  const scoreRow = request.payrollSnapshot.rows.find((row) => row.teacherId === firstPrimaryTeacher.id);
  assert.equal(scoreRow?.performanceScore, 120, "审批详情必须包含每人的绩效分");
  assert.ok(Number(scoreRow?.grossPay) > 0, "审批详情必须包含每人的应发工资");
  assert.equal(request.steps[0].approverAccountIds[0], account(db, "head_primary").id, "只路由给本学部主任");

  const primaryHead = account(db, "head_primary");
  const highHead = account(db, "head_high");
  assert.throws(() => getOaRequestDetail(db, request.id, highHead), /只能查看本学部/);
  assert.throws(() => actOnOaRequest(db, request.id, "approve", highHead, { comment: "越权" }), /只能审批本学部|不由您/);
  const headDetail = getOaRequestDetail(db, request.id, primaryHead);
  assert.equal(headDetail.payrollSnapshot.rows.length, request.formData.headcount, "主任查看的是完整工资快照");
  actOnOaRequest(db, request.id, "approve", primaryHead, { comment: "明细核对无误，签字确认" });
  assert.equal(request.currentStepIndex, 1);
}

// 3. 校长签字后待执行；凭证执行后才锁薪和计入预算。
{
  const { db, term } = freshDb();
  const { finance } = preparePrimaryPayroll(db, term);
  const primaryHead = account(db, "head_primary");
  const principal = account(db, "principal");
  const hqFinance = account(db, "finance");
  const before = queryTermBudget(db, term.id, "primary").items[0];
  const request = createOaRequest(db, finance, {
    templateKey: "payroll_approval",
    formData: { termId: term.id, month: "2026-06", reason: "按本月确认单发放" },
  });
  actOnOaRequest(db, request.id, "approve", primaryHead, { comment: "主任签字" });
  actOnOaRequest(db, request.id, "approve", principal, { comment: "校长签字" });
  assert.equal(request.status, "executing", "校长签字后只能进入总校财务执行，不得提前办结");
  assert.equal(request.execution.status, "pending");
  assert.equal(getOaRequestDetail(db, request.id, hqFinance).canExecute, true, "总校财务应收到可处理执行待办");
  assert.equal(db.payrollDetails.filter((detail) => detail.termId === term.id && detail.status === "locked").length, 0, "执行前不得锁定工资");
  assert.throws(() => executeOaRequest(db, request.id, hqFinance, { comment: "无凭证" }), /请先上传发放凭证/);

  addOaExecutionEvidence(db, request.id, [{ id: "ATT-PAYROLL-PAYMENT", originalName: "2026-06小学部发放回单.pdf" }], hqFinance);
  executeOaRequest(db, request.id, hqFinance, { comment: "已完成银行发放" });
  assert.equal(request.status, "approved");
  assert.equal(request.execution.status, "executed");
  assert.equal(request.appliedResult.type, "payroll_ledger");
  assert.equal(request.appliedResult.lockedCount, request.formData.headcount);
  assert.equal(
    db.payrollDetails.filter((detail) => detail.month === "2026-06" && detail.termId === term.id && detail.status === "locked").length,
    request.formData.headcount,
    "执行完成必须锁定本学部所有工资单",
  );
  const after = queryTermBudget(db, term.id, "primary").items[0];
  assert.equal(after.salaryUsed, request.formData.totalAmount, "锁薪完成后工资应自动计入学部预算已使用额");
  assert.equal(after.used, before.used + request.formData.totalAmount, "预算余额应只在执行完成后变化");
}

// 4. 审批期间绩效变化会阻止执行，必须重新核算并重新确认。
{
  const { db, term } = freshDb();
  const { finance, firstPrimaryTeacher } = preparePrimaryPayroll(db, term);
  const request = createOaRequest(db, finance, {
    templateKey: "payroll_approval",
    formData: { termId: term.id, month: "2026-06" },
  });
  actOnOaRequest(db, request.id, "approve", account(db, "head_primary"), { comment: "同意" });
  actOnOaRequest(db, request.id, "approve", account(db, "principal"), { comment: "同意" });
  const hqFinance = account(db, "finance");
  addOaExecutionEvidence(db, request.id, [{ id: "ATT-PAYROLL-CHANGED", originalName: "回单.pdf" }], hqFinance);
  const assessment = db.monthlyAssessments.find((item) => item.teacherId === firstPrimaryTeacher.id && item.month === "2026-06");
  assessment.score = 80;
  assert.throws(
    () => executeOaRequest(db, request.id, hqFinance, { comment: "执行" }),
    /绩效分在审批期间已发生变化|重新核算/,
    "执行前必须发现工资快照已经过期",
  );
  assert.equal(request.status, "executing", "快照过期时不应错误办结流程");
}

console.log("oa-cc-payroll tests passed");
