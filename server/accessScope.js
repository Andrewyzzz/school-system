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

// 排课负责人可在学部范围之下再限定到具体年级。空数组仍表示该学部全部年级，
// 以兼容现有的幼儿园、高中及历史排课账号。
export function accountSchedulingGradeIds(account) {
  return Array.isArray(account?.schedulingGradeIds)
    ? [...new Set(account.schedulingGradeIds.map(String).filter(Boolean))]
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

function schedulingGradeFromStoredRow(db, input) {
  const requestId = String(input.requestId || "");
  if (requestId) {
    const request = (db.scheduleChangeRequests || []).find((item) => item.id === requestId);
    if (request?.gradeId) return String(request.gradeId);
  }
  const constraintId = String(input.constraintId || "");
  if (constraintId) {
    const row = (db.scheduleConstraints || []).find((item) => item.id === constraintId);
    if (row?.gradeId) return String(row.gradeId);
    if (row?.stageId && Number.isFinite(Number(row.grade))) {
      return schedulingGradeIdFromNumber(row.stageId, row.grade);
    }
  }
  const versionId = String(input.versionId || "");
  if (versionId) {
    const row = (db.scheduleVersions || []).find((item) => item.id === versionId);
    if (row?.gradeId) return String(row.gradeId);
  }
  const assignmentId = String(input.assignmentId || "");
  if (assignmentId) {
    const draft = (db.scheduleDrafts || []).find((item) =>
      (item.assignments || []).some((assignment) => assignment.id === assignmentId),
    );
    if (draft?.gradeId) return String(draft.gradeId);
  }
  return "";
}

function schedulingGradeIdFromNumber(stageId, grade) {
  const value = Number(grade);
  if (!Number.isFinite(value)) return "";
  if (stageId === "primary") return `elementary-g${value}`;
  if (stageId === "middle") return `middle-g${value - 6}`;
  if (stageId === "high") return `high-g${value - 9}`;
  if (stageId === "kindergarten") return `kindergarten-g${value}`;
  return "";
}

export function schedulingStageId(db, input = {}) {
  return String(input.stageId || "") || stageIdForDivision(input.divisionId) || schedulingStageFromStoredRow(db, input);
}

export function schedulingGradeId(db, input = {}) {
  const directGradeId = String(input.gradeId || "");
  if (directGradeId) return directGradeId;
  const stageId = schedulingStageId(db, input);
  const fromNumber = schedulingGradeIdFromNumber(stageId, input.grade);
  return fromNumber || schedulingGradeFromStoredRow(db, input);
}

export function assertSchedulingAccess(db, account, input = {}, action = "处理") {
  const scope = accountStageScopeIds(account);
  if (!scope.length) return;
  const stageId = schedulingStageId(db, input);
  if (!stageId || !scope.includes(stageId)) {
    const error = new Error(`只能${action}本学部排课数据`);
    error.statusCode = 403;
    throw error;
  }

  const gradeScope = accountSchedulingGradeIds(account);
  if (!gradeScope.length) return;
  const gradeId = schedulingGradeId(db, input);
  if (gradeId && gradeScope.includes(gradeId)) return;
  const error = new Error(`只能${action}负责年级的排课数据`);
  error.statusCode = 403;
  throw error;
}
