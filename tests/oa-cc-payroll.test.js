// 审批抄送（验收 1.15 / 2.13）与月度薪资三级审批（验收 3.13 / 3.14）
//
// 抄送有两条必须守住的边界：
//   1. 抄送只给「看」，不给「批」——被抄送人点通过必须被拒绝，否则等于在审批流
//      旁边开了一条谁都能走的路。
//   2. 抄送会让原本看不见这张单子的人看见它。薪资、预算类单据里是全校工资数字，
//      不能被抄给普通教师。
//
// 薪资审批的关键点是范围：批的是小学部，锁的就只能是小学部。
import assert from "node:assert/strict";
import {
  createInitialData,
  generatePayrollBatch,
  lockPayrollBatch,
  normalizeDatabase,
} from "../server/storage.js";
import { payrollScopeOfTeacher } from "../server/financeScope.js";
import {
  actOnOaRequest,
  addOaCcRecipients,
  createOaRequest,
  ensureOaTemplates,
  getOaRequestDetail,
  listCcCandidates,
  queryOaRequests,
  registerOaSideEffect,
} from "../server/oa.js";

function freshDb() {
  const db = createInitialData({ teacherCount: 20 });
  normalizeDatabase(db);
  ensureOaTemplates(db);
  return db;
}

const acct = (db, username) => {
  const a = db.accounts.find((x) => x.username === username);
  assert.ok(a, `应有账号 ${username}`);
  return { ...a, displayName: a.name };
};

// ---------------------------------------------------------------------------
// 1. 校领导账号与角色已就位
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const principal = db.accounts.find((a) => a.role === "principal");
  assert.ok(principal, "应有校领导账号，否则 3.13 的校领导审批环节没人能批");
  assert.equal(principal.username, "principal");

  const tpl = db.oaTemplates.find((t) => t.key === "payroll_approval");
  assert.ok(tpl, "应有月度薪资审批模板");
  assert.deepEqual(
    tpl.steps.map((s) => s.name),
    ["人事复核", "财务复核", "校领导审批"],
    "验收 3.13 要求人事、财务复核、校领导三个环节",
  );
  assert.ok(
    tpl.steps[2].approverRoles.includes("principal"),
    "末环节必须由校领导审批",
  );
}

// ---------------------------------------------------------------------------
// 2. 抄送只给看，不给批
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const teacher = acct(db, db.accounts.find((a) => a.role === "teacher").username);
  const head = acct(db, "head_primary");
  const hr = acct(db, "hr");

  // 请假单：抄送给教务
  const admin = acct(db, db.accounts.find((a) => a.role === "admin").username);
  const req = createOaRequest(db, teacher, {
    templateKey: "leave",
    formData: {
      leaveType: "事假",
      startDate: "2026-06-15",
      endDate: "2026-06-15",
      days: 1,
      reason: "家中有事",
    },
    ccAccountIds: [hr.id],
  });

  assert.equal(req.ccRecipients.length, 1, "应写入一条抄送");
  assert.equal(req.ccRecipients[0].accountId, hr.id);
  assert.equal(req.ccRecipients[0].source, "applicant");

  // 被抄送人看得到
  const seen = getOaRequestDetail(db, req.id, hr);
  assert.equal(seen.isCc, true, "被抄送人应被标记");
  assert.equal(seen.canAct, false, "抄送不得带来审批权");

  // 被抄送人点通过 → 必须被拒绝
  assert.throws(
    () => actOnOaRequest(db, req.id, "approve", hr, { comment: "顺手批了" }),
    /不由您(审批|处理)|无权/,
    "被抄送人审批必须被拒绝",
  );
  // 单子状态没被改动
  const after = db.oaRequests.find((r) => r.id === req.id);
  assert.equal(after.status, "pending");
  assert.equal(after.currentStepIndex, 0);
  assert.equal(after.steps[0].approvals.length, 0, "越权尝试不能留下审批记录");

  // 真正的审批人仍能批（用通用模板验证，请假模板的审批要求另填代课安排，
  // 那是另一条规则，混在这里会掩盖抄送本身的行为）
  // 注意：通用模板的审批角色本来就含 hr，所以这里不能拿 hr 验越权——
  // 他能批是因为角色，与抄送无关。越权那条已由上面的请假单覆盖。
  const g = createOaRequest(db, teacher, {
    templateKey: "general",
    formData: { subject: "领用办公用品", detail: "需要一批 A4 纸" },
  });
  const ok = actOnOaRequest(db, g.id, "approve", head, { comment: "同意" });
  assert.equal(ok.status, "approved", "真正的审批人应能正常通过");
  void admin;
}

// ---------------------------------------------------------------------------
// 3. 抄送不得越过模板的可见范围（防泄密）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const finance = acct(db, "finance_primary");
  const teacher = db.accounts.find((a) => a.role === "teacher");

  const req = createOaRequest(db, finance, {
    templateKey: "payroll_approval",
    formData: {
      month: "2026-06",
      scope: "小学部",
      headcount: 100,
      totalAmount: 800000,
      reason: "常规月度核算",
    },
  });

  // 工资单据不能抄给普通教师
  assert.throws(
    () => addOaCcRecipients(db, req.id, [teacher.id], finance),
    /不允许抄送给教师/,
    "薪资审批含全校工资数字，不得抄送普通教师",
  );
  assert.equal(
    (db.oaRequests.find((r) => r.id === req.id).ccRecipients || []).some((c) => c.accountId === teacher.id),
    false,
    "被拒绝的抄送不能留下记录",
  );

  // 候选人清单里也不应出现教师
  const candidates = listCcCandidates(db, "payroll_approval");
  assert.ok(candidates.length > 0);
  assert.ok(
    candidates.every((c) => c.role !== "teacher"),
    "候选人清单必须与校验口径一致，否则界面上选得到、提交却报错",
  );

  // 抄送给校领导则允许
  const principal = acct(db, "principal");
  const { added } = addOaCcRecipients(db, req.id, [principal.id], finance);
  assert.equal(added.length, 1);
  assert.equal(getOaRequestDetail(db, req.id, principal).isCc, true);

  // 请假单允许抄送教师（验收 2.13「抄送相关教师」）
  const t2 = acct(db, teacher.username);
  const leave = createOaRequest(db, t2, {
    templateKey: "leave",
    formData: { leaveType: "事假", startDate: "2026-06-16", endDate: "2026-06-16", days: 1, reason: "私事" },
  });
  const other = db.accounts.filter((a) => a.role === "teacher" && a.id !== t2.id)[0];
  const head = acct(db, "head_primary");
  const r2 = addOaCcRecipients(db, leave.id, [other.id], head);
  assert.equal(r2.added.length, 1, "请假单应允许抄送相关教师");
}

// ---------------------------------------------------------------------------
// 4. 抄送去重、拒绝停用账号、只有相关人能加抄送
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const finance = acct(db, "finance_primary");
  const hr = acct(db, "hr");
  const principal = acct(db, "principal");

  const req = createOaRequest(db, finance, {
    templateKey: "payroll_approval",
    formData: { month: "2026-06", scope: "小学部", headcount: 10, totalAmount: 1000, reason: "x" },
    ccAccountIds: [principal.id, principal.id],
  });
  assert.equal(req.ccRecipients.length, 1, "同一人重复抄送应折叠成一条");

  const again = addOaCcRecipients(db, req.id, [principal.id], finance);
  assert.equal(again.added.length, 0, "已在名单上的人不应再次写入");
  assert.equal(again.ccRecipients.length, 1);

  // 申请人自己不必抄送给自己
  const self = addOaCcRecipients(db, req.id, [finance.id], finance);
  assert.equal(self.added.length, 0, "申请人本来就看得到，不应写入抄送");

  // 不相关的人不能往别人的单子上加抄送
  const otherFinance = acct(db, "finance_high");
  assert.throws(
    () => addOaCcRecipients(db, req.id, [hr.id], otherFinance),
    /无权/,
    "与该单子无关的账号不得添加抄送人",
  );

  // 停用账号不能被抄送
  const disabled = db.accounts.find((a) => a.role === "division_head");
  disabled.status = "disabled";
  assert.throws(
    () => addOaCcRecipients(db, req.id, [disabled.id], finance),
    /已停用/,
    "停用账号收不到通知，抄送给他等于没抄",
  );

  // 不存在的账号
  assert.throws(() => addOaCcRecipients(db, req.id, ["ACC-NOBODY"], finance), /不存在/);
}

// ---------------------------------------------------------------------------
// 5. 「抄送我的」列表与通知
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const finance = acct(db, "finance_primary");
  const principal = acct(db, "principal");
  const before = db.notifications.length;

  const req = createOaRequest(db, finance, {
    templateKey: "payroll_approval",
    formData: { month: "2026-06", scope: "小学部", headcount: 10, totalAmount: 1000, reason: "x" },
    ccAccountIds: [principal.id],
  });

  const list = queryOaRequests(db, { scope: "cc" }, principal);
  assert.equal(list.items.length, 1, "抄送我的列表应能查到");
  assert.equal(list.items[0].id, req.id);
  assert.equal(list.items[0].isCc, true);
  assert.equal(list.items[0].canAct, false, "列表里也不能出现可审批标记");

  // 定向通知到具体账号，而不是广播给整个角色
  const notes = db.notifications.slice(before).filter((n) => String(n.title).includes("抄送给您"));
  assert.equal(notes.length, 1);
  assert.deepEqual(notes[0].accountIds, [principal.id], "抄送通知应定向推送，不能按角色广播");
  assert.equal(notes[0].audience, "", "按角色广播会把工资单据推给同角色的所有人");

  // 时间线留痕
  assert.ok(
    req.timeline.some((t) => t.action === "cc"),
    "抄送应在时间线留痕，事后要能查是谁抄给谁的",
  );
}

// ---------------------------------------------------------------------------
// 6. 审批时附带抄送：只有当前环节审批人可以
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const finance = acct(db, "finance_primary");
  const hr = acct(db, "hr");
  const principal = acct(db, "principal");

  const req = createOaRequest(db, finance, {
    templateKey: "payroll_approval",
    formData: { month: "2026-06", scope: "小学部", headcount: 10, totalAmount: 1000, reason: "x" },
  });

  // 不是当前环节审批人 → 连带抄送一起拒绝
  assert.throws(
    () => actOnOaRequest(db, req.id, "approve", principal, { ccAccountIds: [principal.id] }),
    /不由您(审批|处理)|无权/,
  );
  assert.equal(
    (db.oaRequests.find((r) => r.id === req.id).ccRecipients || []).length,
    0,
    "越权的审批不能顺带把抄送写进去",
  );

  // 当前环节审批人可以边批边抄
  actOnOaRequest(db, req.id, "approve", hr, { comment: "核对无误", ccAccountIds: [principal.id] });
  const after = db.oaRequests.find((r) => r.id === req.id);
  assert.equal(after.ccRecipients.length, 1);
  assert.equal(after.ccRecipients[0].source, "approver");
  assert.equal(after.currentStepIndex, 1, "审批本身应正常推进");
}

// ---------------------------------------------------------------------------
// 7. 薪资三级审批走完 → 锁定该月工资、生成台账（3.13 / 3.14）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const finance = acct(db, "finance_primary");
  const hr = acct(db, "hr");
  const principal = acct(db, "principal");

  const calls = [];
  registerOaSideEffect("lockApprovedPayroll", (database, payload) => {
    calls.push(payload);
    return { month: payload.month, scope: payload.scope, lockedCount: 42, skippedCount: 1, totalAmount: 336000 };
  });

  const req = createOaRequest(db, finance, {
    templateKey: "payroll_approval",
    formData: { month: "2026-06", scope: "小学部", headcount: 43, totalAmount: 340000, reason: "常规核算" },
  });

  // 人事复核
  actOnOaRequest(db, req.id, "approve", hr, { comment: "人事核对无误" });
  assert.equal(calls.length, 0, "第一环节通过不得锁定工资");

  // 财务复核
  const financeReview = acct(db, "finance_middle");
  actOnOaRequest(db, req.id, "approve", financeReview, { comment: "财务复核通过" });
  assert.equal(calls.length, 0, "第二环节通过仍不得锁定——校领导还没批");
  const mid = db.oaRequests.find((r) => r.id === req.id);
  assert.equal(mid.status, "pending");
  assert.equal(mid.currentStepIndex, 2);

  // 校领导审批 → 落地
  const done = actOnOaRequest(db, req.id, "approve", principal, { comment: "同意发放" });
  assert.equal(done.status, "approved");
  assert.equal(calls.length, 1, "整单通过后才锁定工资");
  assert.equal(calls[0].month, "2026-06");
  assert.equal(calls[0].scope, "小学部", "锁定范围必须与审批单一致");
  assert.equal(done.appliedResult.type, "payroll_ledger");
  assert.equal(done.appliedResult.lockedCount, 42);
  assert.equal(done.appliedResult.skippedCount, 1, "没锁上的要报出来，不能只报成功数");
}

// ---------------------------------------------------------------------------
// 7b. 审批通过但一张都没锁上 → 必须单独告知发起人
//
// 「已通过」和「已锁定」是两回事。工资单若还没经老师确认，锁定会被前置校验
// 挡下；此时审批单仍显示通过，财务看到就会以为可以付款了。
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const finance = acct(db, "finance_primary");
  const hr = acct(db, "hr");
  const financeReview = acct(db, "finance_middle");
  const principal = acct(db, "principal");

  registerOaSideEffect("lockApprovedPayroll", () => ({
    month: "2026-06",
    scope: "小学部",
    lockedCount: 0,
    skippedCount: 335,
    failureReasons: ["请先由老师确认工资明细或提出异议"],
    totalAmount: 0,
  }));

  const req = createOaRequest(db, finance, {
    templateKey: "payroll_approval",
    formData: { month: "2026-06", scope: "小学部", headcount: 335, totalAmount: 2855100, reason: "x" },
  });
  const before = db.notifications.length;
  actOnOaRequest(db, req.id, "approve", hr, {});
  actOnOaRequest(db, req.id, "approve", financeReview, {});
  const done = actOnOaRequest(db, req.id, "approve", principal, {});

  assert.equal(done.status, "approved");
  assert.equal(done.appliedResult.lockedCount, 0);
  assert.equal(done.appliedResult.skippedCount, 335);

  const warn = db.notifications
    .slice(before)
    .find((n) => String(n.title).includes("尚未锁定") || String(n.title).includes("部分未锁定"));
  assert.ok(warn, "一张都没锁上时必须单独提醒发起人，不能只留一条「已通过」");
  assert.deepEqual(warn.accountIds, [finance.id], "该提醒应发给发起人");
  assert.equal(warn.level, "warning");
  assert.match(warn.text, /请先由老师确认/, "要带上具体原因，否则财务不知道该去做什么");
}

// ---------------------------------------------------------------------------
// 8. 驳回不得触发锁定
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const finance = acct(db, "finance_primary");
  const hr = acct(db, "hr");

  const calls = [];
  registerOaSideEffect("lockApprovedPayroll", (database, payload) => {
    calls.push(payload);
    return { lockedCount: 0 };
  });

  const req = createOaRequest(db, finance, {
    templateKey: "payroll_approval",
    formData: { month: "2026-06", scope: "小学部", headcount: 10, totalAmount: 1000, reason: "x" },
  });
  actOnOaRequest(db, req.id, "reject", hr, { comment: "课时数对不上，退回重算" });

  const after = db.oaRequests.find((r) => r.id === req.id);
  assert.equal(after.status, "rejected");
  assert.equal(calls.length, 0, "被驳回的薪资审批绝不能锁定工资");
  assert.equal(after.appliedResult, undefined);
}

// ---------------------------------------------------------------------------
// 9. 锁定范围不得越界
//
// 这是整条链上最危险的一处：lockPayrollBatch 是按「操作账号的 financeScope」
// 圈定人员的，不是按传入的 options。副作用里若传了个没有范围的系统账号，
// 批的是小学部、锁的却是全校——初高中的工资会跟着一起发出去。
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const fp = acct(db, "finance_primary");
  const fm = acct(db, "finance_middle");

  generatePayrollBatch(db, { month: "2026-06" }, fp);
  generatePayrollBatch(db, { month: "2026-06" }, fm);
  // 推进到可锁定状态
  db.payrollDetails.filter((d) => d.month === "2026-06").forEach((d) => {
    d.status = "reviewed";
  });

  const scopeOf = (d) => payrollScopeOfTeacher(db, d.teacherId);
  const before = db.payrollDetails.filter((d) => d.month === "2026-06");
  assert.ok(
    before.some((d) => scopeOf(d) === "primary") && before.some((d) => scopeOf(d) === "middle"),
    "样本里必须同时有两个学部的工资单，否则测不出越界",
  );

  // 与 server.js 中副作用处理器完全相同的调用方式
  const batch = lockPayrollBatch(
    db,
    { month: "2026-06" },
    { id: "SYSTEM-OA", role: "finance", financeScope: "primary", name: "校领导（审批 OA-1）" },
  );

  const locked = db.payrollDetails.filter((d) => d.status === "locked");
  assert.ok(locked.length > 0, "应确实锁定了一部分");
  assert.ok(
    locked.every((d) => scopeOf(d) === "primary"),
    "批的是小学部，锁定的就只能是小学部",
  );
  assert.equal(
    db.payrollDetails.filter((d) => scopeOf(d) === "middle" && d.status === "locked").length,
    0,
    "初中部的工资单一张都不能被这次审批锁定",
  );
  assert.equal(batch.total, before.filter((d) => scopeOf(d) === "primary").length, "尝试范围就应只有小学部");
}

console.log("oa cc + payroll approval checks passed");
