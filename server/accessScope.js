const DIVISION_STAGE_IDS = {
  kindergarten: "kindergarten",
  elementary: "primary",
  primary: "primary",
  middle: "middle",
  high: "high",
};

export function accountStageScopeIds(account) {
  return Array.isArray(account?.scopeStageIds)
    ? [...new Set(account.scopeStageIds.map(String).filter(Boolean))]
    : [];
}

export function stageIdForDivision(divisionId = "") {
  return DIVISION_STAGE_IDS[String(divisionId || "")] || "";
}

export function canAccessStage(account, stageId = "") {
  const scope = accountStageScopeIds(account);
  if (!scope.length) return true;
  return scope.includes(String(stageId || ""));
}

export function assertStageAccess(account, stageId = "", action = "访问") {
  if (canAccessStage(account, stageId)) return;
  const error = new Error(`只能${action}本学部数据`);
  error.statusCode = 403;
  throw error;
}

function schedulingStageFromStoredRow(db, input) {
  const requestId = String(input.requestId || "");
  if (requestId) {
    const request = (db.scheduleChangeRequests || []).find((item) => item.id === requestId);
    if (request) return stageIdForDivision(request.divisionId);
  }
  const constraintId = String(input.constraintId || "");
  if (constraintId) {
    const row = (db.scheduleConstraints || []).find((item) => item.id === constraintId);
    if (row?.stageId) return String(row.stageId);
  }
  const versionId = String(input.versionId || "");
  if (versionId) {
    const row = (db.scheduleVersions || []).find((item) => item.id === versionId);
    if (row?.divisionId) return stageIdForDivision(row.divisionId);
  }
  const assignmentId = String(input.assignmentId || "");
  if (assignmentId) {
    const draft = (db.scheduleDrafts || []).find((item) =>
      (item.assignments || []).some((assignment) => assignment.id === assignmentId),
    );
    if (draft?.divisionId) return stageIdForDivision(draft.divisionId);
  }
  return "";
}

export function schedulingStageId(db, input = {}) {
  return String(input.stageId || "") || stageIdForDivision(input.divisionId) || schedulingStageFromStoredRow(db, input);
}

export function assertSchedulingAccess(db, account, input = {}, action = "处理") {
  const scope = accountStageScopeIds(account);
  if (!scope.length) return;
  const stageId = schedulingStageId(db, input);
  if (stageId && scope.includes(stageId)) return;
  const error = new Error(`只能${action}本学部排课数据`);
  error.statusCode = 403;
  throw error;
}
