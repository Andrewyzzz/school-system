// 财务分权 + 学期薪酬预算
//
// 覆盖两件事：
//   1) 四个财务账号各管一摊——三个学部财务各管本部任课老师，总校财务管行政后勤。
//      越权读写必须被拒，批量操作的默认名单必须自动收敛。
//   2) 学期预算由「薪酬总额预算确认」审批落地，仅展示不限制发放；
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
  canFinanceActOnTeacher,
  financeScopeFor,
  payrollScopeOfTeacher,
} from "../server/financeScope.js";
import { queryTermBudget, ensureBudgetStore } from "../server/budget.js";
import { assessmentBandsForStage, isAssessmentBandAllowedForStage } from "../server/payroll.js";
import { createOaRequest, actOnOaRequest, ensureOaTemplates } from "../server/oa.js";

const db = createInitialData({ teacherCount: 60 });
normalizeDatabase(db);
ensureOaTemplates(db);
ensureBudgetStore(db);

const account = (username) => db.accounts.find((item) => item.username === username);
const byRole = (role) => db.accounts.find((item) => item.role === role);

// ---------------------------------------------------------------------------
// 1. 四个财务账号与范围归属
// ---------------------------------------------------------------------------
{
  const usernames = ["finance", "finance_primary", "finance_middle", "finance_high"];
  usernames.forEach((username) => {
    assert.ok(account(username), `应存在财务账号 ${username}`);
    assert.equal(account(username).role, "finance");
  });
  assert.equal(financeScopeFor(account("finance")), "headquarters", "原 finance 账号应为总校财务");
  assert.equal(financeScopeFor(account("finance_primary")), "primary");
  assert.equal(financeScopeFor(account("finance_middle")), "middle");
  assert.equal(financeScopeFor(account("finance_high")), "high");

  // 非财务角色不受范围限制
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
  ["primary", "middle", "high", "headquarters"].forEach((scope) => {
    totals[scope] = queryTeachers(db, { pageSize: "1" }, { includeFinance: true, financeScope: scope }).meta.total;
  });
  const sum = Object.values(totals).reduce((acc, value) => acc + value, 0);
  assert.equal(sum, all.meta.total, "四个口径人数之和应等于全校人数，不重不漏");
  assert.ok(totals.primary > 0 && totals.middle > 0 && totals.high > 0, "三个学部都应有人");

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
// 6. 预算审批落地
// ---------------------------------------------------------------------------
const term = db.terms.find((item) => item.current);
{
  const financeAccount = account("finance");
  const hrAccount = byRole("hr");
  const sysAccount = byRole("system_admin");
  const base = {
    termName: term.name,
    totalBudget: 20000000,
    payoutRatio: 90,
    reserveRatio: 10,
    reason: "按在编人数与课时规模测算",
  };

  // 各口径之和对不上总额时应被拦住
  assert.throws(
    () =>
      createOaRequest(db, financeAccount, {
        templateKey: "budget_confirm",
        formData: { ...base, budget_primary: 1, budget_middle: 1, budget_high: 1, budget_headquarters: 1 },
      }),
    /之和应等于/,
    "分口径预算与总额不符应被拒",
  );

  // 发放比例与预留比例之和不为 100% 也应被拦住
  assert.throws(
    () =>
      createOaRequest(db, financeAccount, {
        templateKey: "budget_confirm",
        formData: {
          ...base,
          payoutRatio: 80,
          reserveRatio: 10,
          budget_primary: 7000000,
          budget_middle: 6000000,
          budget_high: 5500000,
          budget_headquarters: 1500000,
        },
      }),
    /100%/,
  );

  const request = createOaRequest(db, financeAccount, {
    templateKey: "budget_confirm",
    formData: {
      ...base,
      budget_primary: 7000000,
      budget_middle: 6000000,
      budget_high: 5500000,
      budget_headquarters: 1500000,
    },
  });

  assert.equal(queryTermBudget(db, term.id).total.budget, 0, "提交但未审批完不应落地");

  actOnOaRequest(db, request.id, "approve", hrAccount, { comment: "人事复核通过" });
  assert.equal(
    queryTermBudget(db, term.id).total.budget,
    0,
    "只过了第一环节就落地的话，总校还没批预算就被改了",
  );

  actOnOaRequest(db, request.id, "approve", sysAccount, { comment: "总校批准" });
  const budget = queryTermBudget(db, term.id);
  assert.equal(budget.total.budget, 20000000, "整单通过后应落地全部四个口径");
  assert.equal(budget.items.length, 4);
  assert.equal(budget.items.find((item) => item.scope === "primary").budget, 7000000);
  assert.equal(budget.items.find((item) => item.scope === "headquarters").budget, 1500000);
  assert.equal(budget.oaRequestId, request.id, "预算应记录来源审批单，便于追溯");

  // 学部财务只看到自己那一条
  const primaryOnly = queryTermBudget(db, term.id, "primary");
  assert.equal(primaryOnly.items.length, 1);
  assert.equal(primaryOnly.items[0].scope, "primary");
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
        { name: "个税代扣", amount: -150, category: "deduction" },
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
  assert.equal(after.used, 5000, "已使用只统计已锁定工资单，且不含个税代扣");
  assert.equal(after.pending, 8000, "未锁定的金额计入结算中，不计入已使用");
  assert.equal(after.lockedCount, 1);
  assert.equal(after.remaining, 7000000 - 5000);
  assert.ok(after.usedRatio > 0 && after.usedRatio < 1);

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
// 8. 工资记录按范围过滤 + 账号信息透出范围
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

console.log("finance scope & budget checks passed");
