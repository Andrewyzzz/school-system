// 学期薪酬预算：学期初经审批确定，之后只做展示，不对发放做任何限制。
//
// 数据来源固定为「薪酬总额预算确认」审批单——审批通过时写入本学期各口径预算，
// 财务侧任何页面都只读。这样预算数字始终有审批留痕，改预算必须再走一次审批。
//
// 已使用口径：财务已锁定发放的工资单合计。锁定之前金额仍可能变动（老师提异议、
// 财务重算），计入已用会让数字反复跳动，因此单独用「结算中」呈现在途金额。

import { FINANCE_SCOPES, payrollScopeOfTeacher } from "./financeScope.js";

export const BUDGET_SCOPE_FIELDS = FINANCE_SCOPES.map((scope) => ({
  key: `budget_${scope.id}`,
  scopeId: scope.id,
  label: `${scope.name}预算（元）`,
}));

export function ensureBudgetStore(db) {
  if (!Array.isArray(db.termBudgets)) db.termBudgets = [];
  return db;
}

function budgetRowId(termId, scopeId) {
  return `BUDGET-${termId}-${String(scopeId).toUpperCase()}`;
}

/**
 * 审批通过后写入本学期预算。同一学期重复审批以最后一次为准（覆盖而非累加），
 * 并保留来源审批单号便于追溯。
 */
export function applyTermBudgetFromApproval(db, { termId, termName, amounts, requestId, actorName }) {
  ensureBudgetStore(db);
  const now = new Date().toISOString();
  const written = [];
  FINANCE_SCOPES.forEach((scope) => {
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

function detailGrossPay(detail) {
  return (detail.rowsSnapshot || [])
    .filter((row) => row.category !== "deduction")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

/**
 * 某学期的预算执行情况。scopeId 传入时只返回该口径，否则返回全部四个。
 * 不做任何超支拦截——按学校要求仅作展示。
 */
export function queryTermBudget(db, termId, scopeId = "") {
  ensureBudgetStore(db);
  const details = (db.payrollDetails || []).filter((item) => item.termId === termId);
  const scopes = scopeId ? FINANCE_SCOPES.filter((item) => item.id === scopeId) : FINANCE_SCOPES;

  const items = scopes.map((scope) => {
    const scoped = details.filter((detail) => payrollScopeOfTeacher(db, detail.teacherId) === scope.id);
    const locked = scoped.filter((detail) => detail.status === "locked");
    const inProgress = scoped.filter((detail) => detail.status !== "locked");
    const budget = Number(
      db.termBudgets.find((item) => item.termId === termId && item.scope === scope.id)?.amount ?? 0,
    );
    const used = locked.reduce((sum, detail) => sum + detailGrossPay(detail), 0);
    const pending = inProgress.reduce((sum, detail) => sum + detailGrossPay(detail), 0);
    return {
      scope: scope.id,
      scopeName: scope.name,
      budget,
      used,
      pending,
      remaining: budget - used,
      // 没编预算时不显示百分比，免得出现除零得到的 Infinity
      usedRatio: budget > 0 ? used / budget : null,
      lockedCount: locked.length,
      pendingCount: inProgress.length,
      hasBudget: budget > 0,
    };
  });

  const total = items.reduce(
    (acc, item) => ({
      budget: acc.budget + item.budget,
      used: acc.used + item.used,
      pending: acc.pending + item.pending,
      remaining: acc.remaining + item.remaining,
    }),
    { budget: 0, used: 0, pending: 0, remaining: 0 },
  );

  const source = db.termBudgets.find((item) => item.termId === termId);
  return {
    termId,
    termName: source?.termName || "",
    items,
    total: { ...total, usedRatio: total.budget > 0 ? total.used / total.budget : null },
    approvedAt: source?.approvedAt || "",
    oaRequestId: source?.oaRequestId || "",
    approvedByName: source?.approvedByName || "",
  };
}
