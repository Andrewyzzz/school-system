// 财务分权 + 学期薪酬预算
//
// 覆盖两件事：
//   1) 五个财务账号各管一摊——四个学部财务各管本部任课老师，总校财务管行政后勤。
//      越权读写必须被拒，批量操作的默认名单必须自动收敛。
//   2) 学期预算由「学部薪酬预算确认」逐笔落地：总校财务按学部分开申请，
//      对应学部主任复核、校长审批；仅展示不限制发放；
//      已使用口径为已锁定工资单，锁定/解锁应能双向反映。
import assert from "node:assert/strict";
import {
  createInitialData,
  normalizeDatabase,
  queryTeachers,
  queryPayrollHistory,
  generatePayrollBatch,
  lockPayrollBatch,
  publicAccount,
  updateTeacherSalaryProfile,
} from "../server/storage.js";
import {
  FINANCE_SCOPE_IDS,
  canExportAllPayrollDetails,
  canFinanceActOnTeacher,
  canFinanceReadTeacher,
  financeScopeFor,
  payrollScopeOfTeacher,
} from "../server/financeScope.js";
import { queryTermBudget, ensureBudgetStore } from "../server/budget.js";
import { assessmentBandsForStage, isAssessmentBandAllowedForStage } from "../server/payroll.js";
import { createOaRequest, actOnOaRequest, addOaExecutionEvidence, executeOaRequest, ensureOaTemplates } from "../server/oa.js";

const db = createInitialData({ teacherCount: 60 });
normalizeDatabase(db);
ensureOaTemplates(db);
ensureBudgetStore(db);

const account = (username) => db.accounts.find((item) => item.username === username);
const byRole = (role) => db.accounts.find((item) => item.role === role);

// ---------------------------------------------------------------------------
// 1. 五个财务账号与范围归属
// ---------------------------------------------------------------------------
{
  const usernames = ["finance", "finance_kindergarten", "finance_primary", "finance_middle", "finance_high"];
  usernames.forEach((username) => {
    assert.ok(account(username), `应存在财务账号 ${username}`);
    assert.equal(account(username).role, "finance");
  });
  assert.equal(financeScopeFor(account("finance")), "headquarters", "原 finance 账号应为总校财务");
  assert.equal(financeScopeFor(account("finance_kindergarten")), "kindergarten");
  assert.equal(financeScopeFor(account("finance_primary")), "primary");
  assert.equal(financeScopeFor(account("finance_middle")), "middle");
  assert.equal(financeScopeFor(account("finance_high")), "high");
  assert.equal(canExportAllPayrollDetails(account("finance")), true, "总校财务可以导出全校工资明细");
  ["finance_kindergarten", "finance_primary", "finance_middle", "finance_high"].forEach((username) => {
    assert.equal(canExportAllPayrollDetails(account(username)), false, `${username} 只能查看和核算，不能导出`);
  });
  assert.equal(canExportAllPayrollDetails(byRole("system_admin")), false, "总校人事行政不能导出工资明细");

  // 非财务角色不受财务范围过滤；工资访问仍由接口角色控制。
  assert.equal(financeScopeFor(byRole("system_admin")), null, "行政管理应不受财务范围限制");
  assert.equal(financeScopeFor(byRole("hr")), null);

  // 缺 financeScope 字段的老账号按总校处理，绝不放开成全校
  const legacy = { role: "finance", username: "legacy_finance" };
  assert.equal(financeScopeFor(legacy), "headquarters", "缺字段的财务账号应收敛到总校而非全校");
}

// ---------------------------------------------------------------------------
// 2. 归属判定：任课老师按学部，非任课人员归总校
// ---------------------------------------------------------------------------
{
  db.teachers.forEach((teacher) => {
    const scope = payrollScopeOfTeacher(db, teacher.id);
    assert.ok(FINANCE_SCOPE_IDS.includes(scope), `归属必须落在四个口径之一：${teacher.id} → ${scope}`);
  });

  const primaryTeacher = db.teachers.find((item) => item.stageId === "primary");
  assert.equal(payrollScopeOfTeacher(db, primaryTeacher.id), "primary");

  // 岗位序列改成后勤后应改归总校——制度上维修工、电工、保洁、校警计入教辅职员工
  const employee = db.employees.find((item) => item.teacherId === primaryTeacher.id);
  assert.ok(employee, "教师应有对应人事档案");
  const logisticsPosition = db.positions.find((item) => item.series !== "teacher");
  assert.ok(logisticsPosition, "应存在非教师岗位");
  const originalPositionId = employee.positionId;
  employee.positionId = logisticsPosition.id;
  assert.equal(
    payrollScopeOfTeacher(db, primaryTeacher.id),
    "headquarters",
    "非任课岗位应归总校财务，不再算学部老师",
  );
  const headquartersList = queryTeachers(
    db,
    { stageId: "headquarters", pageSize: "100" },
    { includeFinance: true },
  );
  assert.ok(
    headquartersList.items.some((item) => item.id === primaryTeacher.id),
    "总校财务选择总校行政后勤时应按工资归属找到该人员",
  );
  employee.positionId = originalPositionId;

  // 查无此人时归总校，避免出现没人负责的工资单
  assert.equal(payrollScopeOfTeacher(db, "T-NOT-EXIST"), "headquarters");
}

// ---------------------------------------------------------------------------
// 3. 越权判定
// ---------------------------------------------------------------------------
{
  const primaryTeacher = db.teachers.find((item) => item.stageId === "primary");
  const middleTeacher = db.teachers.find((item) => item.stageId === "middle");

  assert.equal(canFinanceActOnTeacher(db, account("finance_primary"), primaryTeacher.id), true);
  assert.equal(
    canFinanceActOnTeacher(db, account("finance_primary"), middleTeacher.id),
    false,
    "小学部财务不能处理初中部老师",
  );
  assert.equal(
    canFinanceActOnTeacher(db, account("finance"), primaryTeacher.id),
    false,
    "总校财务不管任课老师，只管行政后勤",
  );
  assert.equal(canFinanceReadTeacher(db, account("finance"), primaryTeacher.id), true, "总校财务应能只读查看学部工资");
  assert.equal(
    canFinanceActOnTeacher(db, byRole("system_admin"), middleTeacher.id),
    true,
    "行政管理不受限制",
  );
}

// ---------------------------------------------------------------------------
// 4. 列表按范围收敛
// ---------------------------------------------------------------------------
{
  const all = queryTeachers(db, { pageSize: "1" }, { includeFinance: true });
  const totals = {};
  ["kindergarten", "primary", "middle", "high", "headquarters"].forEach((scope) => {
    totals[scope] = queryTeachers(db, { pageSize: "1" }, { includeFinance: true, financeScope: scope }).meta.total;
  });
  const sum = Object.values(totals).reduce((acc, value) => acc + value, 0);
  assert.equal(sum, all.meta.total, "五个口径人数之和应等于全校人数，不重不漏");
  assert.ok(totals.kindergarten > 0 && totals.primary > 0 && totals.middle > 0 && totals.high > 0, "四个学部都应有人");

  // 学部财务看到的每一位都必须属于本学部
  const primaryList = queryTeachers(db, { pageSize: "100" }, { includeFinance: true, financeScope: "primary" });
  primaryList.items.forEach((item) => {
    assert.equal(item.stageId, "primary", `小学部财务不该看到 ${item.id}（${item.stageId}）`);
  });
}

// ---------------------------------------------------------------------------
// 5. 批量操作的名单收敛与越权拦截
// ---------------------------------------------------------------------------
{
  const month = String(db.terms.find((item) => item.current)?.settlementMonth || "").trim() || "2026-06";
  const primaryTeacher = db.teachers.find((item) => item.stageId === "primary");
  const middleTeacher = db.teachers.find((item) => item.stageId === "middle");

  // 显式传入他部人员应报错，而不是静默跳过——财务需要知道自己点错了
  assert.throws(
    () => generatePayrollBatch(db, { month, teacherIds: [middleTeacher.id] }, account("finance_primary")),
    /无权处理|不属于/,
    "小学部财务批量生成初中部老师工资应被拒",
  );
  assert.throws(
    () => lockPayrollBatch(db, { month, teacherIds: [primaryTeacher.id, middleTeacher.id] }, account("finance_primary")),
    /无权处理|不属于/,
    "名单中混入他部人员时整批应被拒",
  );
}

// ---------------------------------------------------------------------------
// 6. 学部预算审批落地：一学部一张申请、一位对应主任复核
// ---------------------------------------------------------------------------
const term = db.terms.find((item) => item.current);
// 种子数据的演示学期固定在 2026 年夏季；本用例验证“未完成学期可申请”的
// 正常链路，因此显式延长测试期间，避免随真实日期推进变成已完成历史数据。
term.endDate = "2099-01-31";
{
  const financeAccount = account("finance");
  const principalAccount = byRole("principal");
  const plans = [
    { scope: "kindergarten", amount: 2000000, head: account("head_kindergarten") },
    { scope: "primary", amount: 6000000, head: account("head_primary") },
    { scope: "middle", amount: 5500000, head: account("head_middle") },
    { scope: "high", amount: 5000000, head: account("head_high") },
  ];

  // 总校行政后勤不属于本预算审批的四个学部范围。
  assert.throws(
    () =>
      createOaRequest(db, financeAccount, {
        templateKey: "budget_confirm",
        formData: { termId: term.id, budgetScope: "headquarters", amount: 1 },
      }),
    /请选择幼儿园、小学部、初中部或高中部/,
    "总校行政后勤不能混入学部薪酬预算申请",
  );
  assert.throws(
    () =>
      createOaRequest(db, financeAccount, {
        templateKey: "budget_confirm",
        formData: { termId: term.id, budgetScope: "primary", amount: 0 },
      }),
    /必须大于 0/,
    "学部预算金额必须是正数",
  );
  assert.throws(
    () =>
      createOaRequest(db, financeAccount, {
        templateKey: "budget_confirm",
        formData: { termId: "TERM-NOT-EXIST", budgetScope: "primary", amount: 1 },
      }),
    /请选择系统中已建立的正式学期/,
    "预算审批传入不存在的 termId 时不能回退写入当前学期",
  );
  const completedTerm = {
    ...term,
    id: "TERM-COMPLETED-BUDGET-TEST",
    name: "已完成测试学期",
    current: false,
    status: "active",
    startDate: "2020-02-01",
    endDate: "2020-07-31",
  };
  db.terms.push(completedTerm);
  assert.throws(
    () =>
      createOaRequest(db, financeAccount, {
        templateKey: "budget_confirm",
        formData: { termId: completedTerm.id, budgetScope: "primary", amount: 1 },
      }),
    /已完成，不能再发起预算审批/,
    "已完成学期即使尚未归档，也不能绕过前端直接发起预算审批",
  );
  db.terms.pop();

  plans.forEach((plan) => {
    const request = createOaRequest(db, financeAccount, {
      templateKey: "budget_confirm",
      formData: { termId: term.id, budgetScope: plan.scope, amount: plan.amount },
    });
    assert.equal(request.formData.budgetScope, plan.scope);
    assert.equal(request.formData.stageId, plan.scope, "预算单必须固化所属学部，供权限与台账统一使用");
    assert.deepEqual(request.steps[0].approverAccountIds, [plan.head.id], "只能路由给对应学部主任");
    assert.equal(queryTermBudget(db, term.id).total.budget, plans.slice(0, plans.indexOf(plan)).reduce((sum, item) => sum + item.amount, 0));
    const anotherHead = plans.find((item) => item.head.id !== plan.head.id).head;
    assert.throws(
      () => actOnOaRequest(db, request.id, "approve", anotherHead, { comment: "越权复核" }),
      /当前环节不由您处理|只能审批本学部申请/,
      "其他学部主任不能处理本学部预算单",
    );
    actOnOaRequest(db, request.id, "approve", plan.head, { comment: "本学部预算复核通过" });
    assert.equal(request.steps[0].status, "approved");
    assert.equal(request.steps[1].name, "校长审批");
    actOnOaRequest(db, request.id, "approve", principalAccount, { comment: "校长批准" });
    assert.equal(queryTermBudget(db, term.id, plan.scope).items[0].budget, plan.amount);
  });

  const budget = queryTermBudget(db, term.id);
  assert.equal(budget.total.budget, 18500000, "四张已审批的学部预算应汇总到对应学期");
  assert.equal(budget.items.length, 4, "预算汇总只展示四个教学学部");
  assert.equal(budget.items.find((item) => item.scope === "primary").budget, 6000000);
  assert.equal(budget.items.some((item) => item.scope === "headquarters"), false);
  assert.equal(
    db.termBudgets.filter((item) => item.termId === term.id).length,
    4,
    "每个学部应留下独立的一笔、可追溯的预算台账",
  );

  // 学部财务只看到自己那一条
  const primaryOnly = queryTermBudget(db, term.id, "primary");
  assert.equal(primaryOnly.items.length, 1);
  assert.equal(primaryOnly.items[0].scope, "primary");

  assert.throws(
    () =>
      createOaRequest(db, account("finance_primary"), {
        templateKey: "budget_confirm",
        formData: { termId: term.id, budgetScope: "primary", amount: 6000000 },
      }),
    /仅总校财务/,
    "学部财务不能发起学部薪酬预算确认",
  );
}

// ---------------------------------------------------------------------------
// 7. 已使用预算随锁定推进，且不限制发放
// ---------------------------------------------------------------------------
{
  const before = queryTermBudget(db, term.id, "primary").items[0];
  assert.equal(before.used, 0, "尚无锁定工资单时已使用应为 0");

  // 造一份已锁定工资单，验证已使用统计确实只认锁定状态
  const primaryTeacher = db.teachers.find((item) => item.stageId === "primary");
  const secondTeacher = db.teachers.filter((item) => item.stageId === "primary")[1];
  if (!Array.isArray(db.payrollDetails)) db.payrollDetails = [];
  db.payrollDetails.push(
    {
      id: "PAY-TEST-LOCKED",
      teacherId: primaryTeacher.id,
      termId: term.id,
      month: "2026-06",
      status: "locked",
      rowsSnapshot: [
        { name: "基本工资", amount: 5000, category: "fixed" },
        { name: "考勤扣款", amount: -150, category: "deduction" },
      ],
    },
    {
      id: "PAY-TEST-PENDING",
      teacherId: secondTeacher.id,
      termId: term.id,
      month: "2026-06",
      status: "teacher_confirmed",
      rowsSnapshot: [{ name: "基本工资", amount: 8000, category: "fixed" }],
    },
  );

  const after = queryTermBudget(db, term.id, "primary").items[0];
  assert.equal(after.used, 5000, "已使用只统计已锁定工资单，且不含扣减项");
  assert.equal(after.pending, 8000, "未锁定的金额计入结算中，不计入已使用");
  assert.equal(after.lockedCount, 1);
  assert.equal(after.remaining, 6000000 - 5000);
  assert.ok(after.usedRatio > 0 && after.usedRatio < 1);
  assert.deepEqual(after.usageDetails.salaryMonths, [
    { type: "salary_month", month: "2026-06", label: "2026-06工资", amount: 5000, lockedCount: 1 },
  ], "预算明细中的工资应按结算月汇总，不展示个人工资");

  // 解锁后已使用应退回
  db.payrollDetails.find((item) => item.id === "PAY-TEST-LOCKED").status = "reviewed";
  assert.equal(queryTermBudget(db, term.id, "primary").items[0].used, 0, "解锁后已使用应退回");
  db.payrollDetails.find((item) => item.id === "PAY-TEST-LOCKED").status = "locked";

  // 预算只做展示：即便超支，也不应有任何拦截逻辑抛错
  const budgetRow = db.termBudgets.find((item) => item.termId === term.id && item.scope === "primary");
  budgetRow.amount = 1000;
  const over = queryTermBudget(db, term.id, "primary").items[0];
  assert.ok(over.usedRatio > 1, "超支时执行率应大于 1");
  assert.equal(over.remaining, 1000 - 5000, "剩余可以为负，仅作提示");
  assert.doesNotThrow(
    () => queryTermBudget(db, term.id),
    "预算仅作展示，超支不应抛错或阻断",
  );
  budgetRow.amount = 7000000;

  // 未编预算时不显示百分比，避免除零得到 Infinity
  const noBudgetDb = createInitialData({ teacherCount: 10 });
  normalizeDatabase(noBudgetDb);
  const emptyTerm = noBudgetDb.terms.find((item) => item.current);
  const empty = queryTermBudget(noBudgetDb, emptyTerm.id, "primary").items[0];
  assert.equal(empty.budget, 0);
  assert.equal(empty.usedRatio, null, "未编预算时执行率应为 null 而不是 Infinity");
  assert.equal(empty.hasBudget, false);
}

// ---------------------------------------------------------------------------
// 8. 学部预算使用申请：主任发起 → 校长审批 → 总校财务执行并上传凭证
// ---------------------------------------------------------------------------
{
  const primaryHead = account("head_primary");
  const principalAccount = byRole("principal");
  const financeAccount = account("finance");
  const before = queryTermBudget(db, term.id, "primary").items[0];
  const request = createOaRequest(db, primaryHead, {
    templateKey: "division_budget_use",
    formData: {
      termId: term.id,
      amount: 3000,
      purpose: "小学部教学活动材料",
      reason: "按本学期活动计划执行",
      // 即使浏览器伪造别的学部，服务端也必须按发起人的小学部归属。
      budgetScope: "high",
    },
  });

  assert.equal(request.formData.budgetScope, "primary", "预算使用归属必须由发起主任的学部决定");
  assert.equal(request.formData.termId, term.id, "预算使用申请必须保存正式学期主键");
  assert.equal(request.formData.termName, term.name, "学期名称由服务端按 termId 回填，仅用于展示");
  assert.equal(request.steps.length, 1);
  assert.equal(request.steps[0].name, "校长审批");
  assert.equal(request.ccRecipients.length, 0, "校长批准前不应提前向总校财务抄送");
  assert.equal(queryTermBudget(db, term.id, "primary").items[0].approvedUse, 0, "批准前不计入已使用");

  actOnOaRequest(db, request.id, "approve", principalAccount, { comment: "校长同意" });
  const after = queryTermBudget(db, term.id, "primary").items[0];
  assert.equal(request.status, "executing", "校长批准后应交由总校财务执行，而不是直接办结");
  assert.deepEqual(request.execution.executorAccountIds, [financeAccount.id], "执行人必须是总校财务");
  assert.equal(request.ccRecipients.length, 0, "执行待办不能伪装成只读抄送");
  assert.equal(after.approvedUse, 3000);
  assert.equal(after.approvedUseCount, 1);
  assert.equal(after.salaryUsed, before.salaryUsed, "预算申请不能污染工资已使用金额");
  assert.equal(after.used, before.used + 3000, "批准后的预算申请应自动计入已使用余额");
  assert.equal(after.remaining, before.remaining - 3000);
  assert.equal(after.usageDetails.budgetUses.length, 1, "预算使用明细应保留每笔已批准申请");
  assert.equal(after.usageDetails.budgetUses[0].label, "小学部教学活动材料");
  assert.equal(after.usageDetails.budgetUses[0].amount, 3000);
  assert.equal(db.termBudgetUsageEntries.length, 1, "每张已批准申请写入一条可追溯台账");
  assert.equal(db.termBudgetUsageEntries[0].oaRequestId, request.id);
  addOaExecutionEvidence(db, request.id, [{ id: "ATT-BUDGET-EXEC", originalName: "拨款凭证.pdf" }], financeAccount);
  executeOaRequest(db, request.id, financeAccount, { comment: "已拨款" });
  assert.equal(request.status, "approved", "总校财务确认拨款后审批单才正式办结");
  assert.equal(request.execution.status, "executed");
}

// ---------------------------------------------------------------------------
// 9. 工资记录按范围过滤 + 账号信息透出范围
// ---------------------------------------------------------------------------
{
  const primaryHistory = queryPayrollHistory(db, { month: "2026-06", termId: term.id, financeScope: "primary" });
  primaryHistory.items.forEach((item) => {
    assert.equal(
      payrollScopeOfTeacher(db, item.teacherId),
      "primary",
      `小学部财务的工资记录里混入了 ${item.teacherId}`,
    );
  });
  const middleHistory = queryPayrollHistory(db, { month: "2026-06", termId: term.id, financeScope: "middle" });
  assert.equal(middleHistory.items.length, 0, "初中部本月没有工资单，不该看到小学部的");

  // 前端据此调整"全校/本学部"措辞，必须透出
  const payload = publicAccount(account("finance_primary"), db);
  assert.equal(payload.financeScope, "primary");
  assert.equal(payload.financeScopeName, "小学部");
  const headquartersPayload = publicAccount(account("finance"), db);
  assert.equal(
    headquartersPayload.payrollExportAll,
    true,
    "总校财务未显式设置 payrollExportAll 时，前端仍应保留薪资配置与导出权限",
  );
  assert.equal(
    publicAccount({ ...account("finance"), payrollExportAll: false }, db).payrollExportAll,
    false,
    "显式关闭总校财务导出权限时，前端必须如实反映",
  );
  assert.equal(publicAccount(byRole("system_admin"), db).financeScope, "", "行政管理不带财务范围");
}

// ---------------------------------------------------------------------------
// 9. 考核档与学段绑定
//
// 考核工资标准按学段划分，小学老师不可能是「高中专任」。界面下拉已按学段收敛，
// 后端也必须挡住——接口直调、脚本批改、老库遗留的错配都要拦。
// ---------------------------------------------------------------------------
{
  const primaryTeacher = db.teachers.find((item) => item.stageId === "primary");
  const middleTeacher = db.teachers.find((item) => item.stageId === "middle");
  const highTeacher = db.teachers.find((item) => item.stageId === "high");
  const sys = byRole("system_admin");

  assert.deepEqual(assessmentBandsForStage("primary"), [
    "primaryCoreHigh",
    "primaryCoreLow",
    "primarySpecial",
  ]);
  assert.deepEqual(assessmentBandsForStage("middle"), ["middle"]);
  assert.deepEqual(assessmentBandsForStage("high"), ["high"]);

  // 跨学段设置必须报错
  assert.throws(
    () => updateTeacherSalaryProfile(db, primaryTeacher.id, { assessmentBand: "high" }, sys),
    /只能是/,
    "小学老师不该能设成高中专任",
  );
  assert.throws(
    () => updateTeacherSalaryProfile(db, middleTeacher.id, { assessmentBand: "primaryCoreHigh" }, sys),
    /只能是/,
    "初中老师不该能设成小学高段核心",
  );
  assert.throws(
    () => updateTeacherSalaryProfile(db, highTeacher.id, { assessmentBand: "middle" }, sys),
    /只能是/,
    "高中老师不该能设成初中专任",
  );

  // 报错信息要给出可选项，财务才知道该怎么改
  try {
    updateTeacherSalaryProfile(db, primaryTeacher.id, { assessmentBand: "high" }, sys);
  } catch (error) {
    assert.match(error.message, /小学高段核心/, "错误信息应列出该学段的合法档位");
    assert.equal(error.statusCode, 400);
  }

  // 同学段内切换应当放行
  const before = primaryTeacher.salaryProfile.assessmentBand;
  updateTeacherSalaryProfile(db, primaryTeacher.id, { assessmentBand: "primaryCoreLow" }, sys);
  assert.equal(primaryTeacher.salaryProfile.assessmentBand, "primaryCoreLow", "同学段内切换应放行");
  updateTeacherSalaryProfile(db, primaryTeacher.id, { assessmentBand: before }, sys);

  // 全库不应存在学段与考核档错配的老师
  const mismatched = db.teachers.filter(
    (item) =>
      item.salaryProfile?.assessmentBand &&
      !isAssessmentBandAllowedForStage(item.salaryProfile.assessmentBand, item.stageId),
  );
  assert.deepEqual(
    mismatched.map((item) => `${item.id}(${item.stageId}→${item.salaryProfile.assessmentBand})`),
    [],
    "存在学段与考核档错配的老师",
  );
}


// ---------------------------------------------------------------------------
// 职称档必须是合法枚举（验收 4.3 联动的前提）
//
// 不在枚举里的值存进去后，工资计算查不到对应的标准，会静默落到默认档：
// 档案上写着「高级教师」，工资单上印着「三级教师」，两边不一致而且不报错。
// 考核档早就有这道校验，职称档漏了——是做 4.3 联动验证时试出来的。
// ---------------------------------------------------------------------------
{
  const db = createInitialData({ teacherCount: 5 });
  normalizeDatabase(db);
  const teacher = db.teachers[0];
  const actor = { id: "ACC-FIN", name: "测试" };

  assert.throws(
    () => updateTeacherSalaryProfile(db, teacher.id, { qualificationGrade: "senior" }, actor),
    /职称档只能是/,
    "拼错的档位（senior 而非 seniorTeacher）必须被拒——存进去会让工资静默算错",
  );
  assert.throws(
    () => updateTeacherSalaryProfile(db, teacher.id, { qualificationGrade: "不存在的档位" }, actor),
    /职称档只能是/,
  );

  // 六个合法档位都要收
  ["seniorProfessor", "seniorTeacher", "first", "second", "third", "ungraded"].forEach((grade) => {
    updateTeacherSalaryProfile(db, teacher.id, { qualificationGrade: grade }, actor);
    assert.equal(db.teachers[0].salaryProfile.qualificationGrade, grade, `${grade} 应被接受`);
  });
}

console.log("finance scope & budget checks passed");
