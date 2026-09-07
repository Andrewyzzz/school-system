// 学期薪酬预算：学期初经审批确定，之后只做展示，不对发放做任何限制。
//
// 数据来源固定为「学部薪酬预算确认」审批单——审批通过时写入对应学部的本学期预算，
// 财务侧任何页面都只读。这样预算数字始终有审批留痕，改预算必须再走一次审批。
//
// 已使用口径：财务已锁定发放的工资单合计，加上校长已经批准的学部预算使用申请。
// 锁定之前工资金额仍可能变动（老师提异议、财务重算），单独用「结算中」呈现在途金额。

import { FINANCE_SCOPES, payrollScopeOfTeacher } from "./financeScope.js";

// 薪酬预算只覆盖四个教学学部。总校行政后勤不再通过这张预算单维护，
// 旧台账记录保留作历史追溯，但不会混入新的学部预算汇总。
export const BUDGET_SCOPES = FINANCE_SCOPES.filter((scope) => scope.type === "division");

export const BUDGET_SCOPE_FIELDS = BUDGET_SCOPES.map((scope) => ({
  key: `budget_${scope.id}`,
  scopeId: scope.id,
  label: `${scope.name}预算（元）`,
}));

export function ensureBudgetStore(db) {
  if (!Array.isArray(db.termBudgets)) db.termBudgets = [];
  // 学部主任的预算使用申请在校长批准后写入本账，和工资锁定金额一并计算已使用。
  // 不直接修改预算总额，保证「核定额度」和「已占用」可以分别追溯。
  if (!Array.isArray(db.termBudgetUsageEntries)) db.termBudgetUsageEntries = [];
  return db;
}

function budgetRowId(termId, scopeId) {
  return `BUDGET-${termId}-${String(scopeId).toUpperCase()}`;
}

function budgetUsageRowId(requestId) {
  return `BUDGET-USE-${String(requestId || "").trim()}`;
}

/**
 * 审批通过后写入本学期预算。同一学期重复审批以最后一次为准（覆盖而非累加），
 * 并保留来源审批单号便于追溯。
 */
export function applyTermBudgetFromApproval(db, { termId, termName, amounts, requestId, actorName }) {
  ensureBudgetStore(db);
  const now = new Date().toISOString();
  const written = [];
  BUDGET_SCOPES.forEach((scope) => {
    const amount = Number(amounts?.[scope.id]);
    if (!Number.isFinite(amount)) return;
    const id = budgetRowId(termId, scope.id);
    const row = {
      id,
      termId,
      termName: termName || "",
      scope: scope.id,
      scopeName: scope.name,
      amount,
      source: "oa_approval",
      oaRequestId: requestId || "",
      approvedAt: now,
      approvedByName: actorName || "",
      updatedAt: now,
    };
    const index = db.termBudgets.findIndex((item) => item.id === id);
    if (index >= 0) db.termBudgets[index] = row;
    else db.termBudgets.push(row);
    written.push(row);
  });
  return written;
}

/**
 * 一张预算审批单只对应一个学部：总校财务分别发起，目标学部主任复核，
 * 最后由校长审批。相同学期、相同学部再次获批时覆盖该学部的核定额度。
 */
export function applyTermBudgetScopeFromApproval(db, { termId, termName, scopeId, amount, requestId, actorName }) {
  ensureBudgetStore(db);
  const scope = BUDGET_SCOPES.find((item) => item.id === scopeId);
  const normalizedAmount = Number(amount);
  if (!scope) throw new Error("学部预算口径无效");
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("本学部预算必须大于 0");
  }
  const now = new Date().toISOString();
  const row = {
    id: budgetRowId(termId, scope.id),
    termId,
    termName: termName || "",
    scope: scope.id,
    scopeName: scope.name,
    amount: normalizedAmount,
    source: "oa_approval",
    oaRequestId: requestId || "",
    approvedAt: now,
    approvedByName: actorName || "",
    updatedAt: now,
  };
  const index = db.termBudgets.findIndex((item) => item.id === row.id);
  if (index >= 0) db.termBudgets[index] = row;
  else db.termBudgets.push(row);
  return row;
}

/**
 * 学部预算使用申请通过后的台账写入。审批单 ID 是唯一键，重复执行时覆盖同一条，
 * 因此服务重试不会把一笔申请重复计入已使用。
 */
export function applyTermBudgetUsageFromApproval(
  db,
  { termId, termName, scopeId, amount, purpose, requestId, applicantName, actorName },
) {
  ensureBudgetStore(db);
  const scope = BUDGET_SCOPES.find((item) => item.id === scopeId);
  const normalizedAmount = Number(amount);
  if (!scope) throw new Error("预算使用申请的学部口径无效");
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("预算使用金额必须大于 0");
  }
  const now = new Date().toISOString();
  const row = {
    id: budgetUsageRowId(requestId),
    termId,
    termName: termName || "",
    scope: scope.id,
    scopeName: scope.name,
    amount: normalizedAmount,
    purpose: String(purpose || "").trim(),
    source: "division_budget_approval",
    oaRequestId: requestId || "",
    applicantName: applicantName || "",
    approvedAt: now,
    approvedByName: actorName || "",
    updatedAt: now,
  };
  const index = db.termBudgetUsageEntries.findIndex((item) => item.id === row.id);
  if (index >= 0) db.termBudgetUsageEntries[index] = row;
  else db.termBudgetUsageEntries.push(row);
  return row;
}

function detailGrossPay(detail) {
  return (detail.rowsSnapshot || [])
    .filter((row) => row.category !== "deduction")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

// 预算页的「已使用明细」不下钻到单位老师，工资按结算月汇总即可：既能与每月
// 工资单核对，又不会在主任/校长的预算页暴露个人薪资。预算使用申请则保留逐笔
// 记录，方便追溯对应的审批单和用途。
function usageDetailsForBudget(lockedDetails, approvedUses) {
  const salaryByMonth = new Map();
  lockedDetails.forEach((detail) => {
    const month = String(detail.month || "").trim() || "未标记月份";
    const current = salaryByMonth.get(month) || { month, amount: 0, lockedCount: 0 };
    current.amount += detailGrossPay(detail);
    current.lockedCount += 1;
    salaryByMonth.set(month, current);
  });

  const salaryMonths = [...salaryByMonth.values()]
    .sort((a, b) => String(b.month).localeCompare(String(a.month)))
    .map((entry) => ({
      type: "salary_month",
      month: entry.month,
      label: `${entry.month}工资`,
      amount: entry.amount,
      lockedCount: entry.lockedCount,
    }));
  const budgetUses = approvedUses
    .slice()
    .sort((a, b) => String(b.approvedAt || "").localeCompare(String(a.approvedAt || "")))
    .map((entry) => ({
      type: "budget_use",
      label: entry.purpose || "学部预算使用",
      amount: Number(entry.amount || 0),
      scopeName: entry.scopeName || "",
      approvedAt: entry.approvedAt || "",
      applicantName: entry.applicantName || "",
      oaRequestId: entry.oaRequestId || "",
    }));

  return { salaryMonths, budgetUses };
}

/**
 * 某学期的预算执行情况。scopeId 传入时只返回该学部，否则返回全部四个学部。
 * 不做任何超支拦截——按学校要求仅作展示。
 */
export function queryTermBudget(db, termId, scopeId = "") {
  ensureBudgetStore(db);
  const details = (db.payrollDetails || []).filter((item) => item.termId === termId);
  const scopes = scopeId ? BUDGET_SCOPES.filter((item) => item.id === scopeId) : BUDGET_SCOPES;
  const scopedScopeIds = new Set(scopes.map((scope) => scope.id));

  const items = scopes.map((scope) => {
    const scoped = details.filter((detail) => payrollScopeOfTeacher(db, detail.teacherId) === scope.id);
    const locked = scoped.filter((detail) => detail.status === "locked");
    const inProgress = scoped.filter((detail) => detail.status !== "locked");
    const approvedUses = db.termBudgetUsageEntries.filter(
      (item) => item.termId === termId && item.scope === scope.id,
    );
    const budget = Number(
      db.termBudgets.find((item) => item.termId === termId && item.scope === scope.id)?.amount ?? 0,
    );
    const salaryUsed = locked.reduce((sum, detail) => sum + detailGrossPay(detail), 0);
    const approvedUse = approvedUses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const used = salaryUsed + approvedUse;
    const pending = inProgress.reduce((sum, detail) => sum + detailGrossPay(detail), 0);
    return {
      scope: scope.id,
      scopeName: scope.name,
      budget,
      used,
      salaryUsed,
      approvedUse,
      approvedUseCount: approvedUses.length,
      pending,
      remaining: budget - used,
      // 没编预算时不显示百分比，免得出现除零得到的 Infinity
      usedRatio: budget > 0 ? used / budget : null,
      lockedCount: locked.length,
      pendingCount: inProgress.length,
      hasBudget: budget > 0,
      usageDetails: usageDetailsForBudget(locked, approvedUses),
    };
  });

  const total = items.reduce(
    (acc, item) => ({
      budget: acc.budget + item.budget,
      used: acc.used + item.used,
      salaryUsed: acc.salaryUsed + item.salaryUsed,
      approvedUse: acc.approvedUse + item.approvedUse,
      approvedUseCount: acc.approvedUseCount + item.approvedUseCount,
      pending: acc.pending + item.pending,
      remaining: acc.remaining + item.remaining,
    }),
    { budget: 0, used: 0, salaryUsed: 0, approvedUse: 0, approvedUseCount: 0, pending: 0, remaining: 0 },
  );

  const source = db.termBudgets.find((item) => item.termId === termId);
  const totalLocked = details.filter(
    (detail) => detail.status === "locked" && scopedScopeIds.has(payrollScopeOfTeacher(db, detail.teacherId)),
  );
  const totalApprovedUses = db.termBudgetUsageEntries.filter(
    (item) => item.termId === termId && scopedScopeIds.has(item.scope),
  );
  return {
    termId,
    termName: source?.termName || "",
    items,
    total: {
      ...total,
      usedRatio: total.budget > 0 ? total.used / total.budget : null,
      usageDetails: usageDetailsForBudget(totalLocked, totalApprovedUses),
    },
    approvedAt: source?.approvedAt || "",
    oaRequestId: source?.oaRequestId || "",
    approvedByName: source?.approvedByName || "",
  };
}
