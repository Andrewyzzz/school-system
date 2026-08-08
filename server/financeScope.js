// 财务分权：四个财务账号各管一摊
//   小学部/初中部/高中部财务 —— 各自学部的任课老师薪资
//   总校财务               —— 行政、后勤等非任课人员薪资
//
// 归属判定的唯一依据放在这里，避免各处接口各写一份口径导致边界不一致。
// system_admin 不受范围限制（返回 null 表示全校）。

export const FINANCE_SCOPES = [
  { id: "primary", name: "小学部", type: "division", stageId: "primary" },
  { id: "middle", name: "初中部", type: "division", stageId: "middle" },
  { id: "high", name: "高中部", type: "division", stageId: "high" },
  { id: "headquarters", name: "总校行政后勤", type: "headquarters", stageId: "" },
];

export const FINANCE_SCOPE_IDS = FINANCE_SCOPES.map((item) => item.id);
export const HEADQUARTERS_SCOPE = "headquarters";

export function financeScopeLabel(scopeId) {
  return FINANCE_SCOPES.find((item) => item.id === scopeId)?.name || "";
}

export function normalizeFinanceScope(value) {
  const scope = String(value || "").trim();
  return FINANCE_SCOPE_IDS.includes(scope) ? scope : "";
}

// 岗位序列为 teacher 的算任课老师，其余（admin/logistics/medical/driver/
// canteen/kindergarten/recruit/security）都算行政后勤，归总校财务。
// 制度上维修工、电工、保洁、校警计入教辅职员工，同样由总校财务发放。
function positionSeriesOf(db, teacherId) {
  const employee = (db.employees || []).find((item) => item.teacherId === teacherId);
  if (!employee) return "";
  const position = (db.positions || []).find((item) => item.id === employee.positionId);
  return String(position?.series || "");
}

/**
 * 某位老师/员工的薪资归属由哪个财务负责。
 * 任课老师按其所在学部；非任课人员一律归总校。
 * 拿不到学部信息的（数据不全）也归总校，避免出现没人负责的工资单。
 */
export function payrollScopeOfTeacher(db, teacherId) {
  const teacher = (db.teachers || []).find((item) => item.id === teacherId);
  if (!teacher) return HEADQUARTERS_SCOPE;
  const series = positionSeriesOf(db, teacherId);
  if (series && series !== "teacher") return HEADQUARTERS_SCOPE;
  const stageId = String(teacher.stageId || "");
  return FINANCE_SCOPE_IDS.includes(stageId) ? stageId : HEADQUARTERS_SCOPE;
}

/**
 * 账号的财务数据范围。返回 null 表示不受限（system_admin 或非财务角色）。
 * 财务账号缺 financeScope 字段时按总校处理并不放开全校，宁可少看不可越权。
 */
export function financeScopeFor(account) {
  if (!account || account.role !== "finance") return null;
  return normalizeFinanceScope(account.financeScope) || HEADQUARTERS_SCOPE;
}

export function canFinanceActOnTeacher(db, account, teacherId) {
  const scope = financeScopeFor(account);
  if (!scope) return true;
  return payrollScopeOfTeacher(db, teacherId) === scope;
}

export function assertTeacherInFinanceScope(db, account, teacherId) {
  if (canFinanceActOnTeacher(db, account, teacherId)) return;
  const scope = financeScopeFor(account);
  const error = new Error(`只能处理${financeScopeLabel(scope)}的薪资数据`);
  error.statusCode = 403;
  throw error;
}

/** 按账号范围过滤老师列表；不受限时原样返回。 */
export function filterTeachersByFinanceScope(db, account, teachers) {
  const scope = financeScopeFor(account);
  if (!scope) return teachers;
  return teachers.filter((teacher) => payrollScopeOfTeacher(db, teacher.id) === scope);
}

// ---------------------------------------------------------------------------
// 通用裁剪：学部财务不该在任何页面看到他部的东西——教室、组织节点、
// 制度档位都算。总校财务管行政后勤，同样看不到三个学部的教学资源。
// ---------------------------------------------------------------------------

/** 带 stageId 的行按范围过滤（教室、班级等）。总校财务不持有学部资源，返回空。 */
export function filterStageRowsByFinanceScope(account, rows, stageKey = "stageId") {
  const scope = financeScopeFor(account);
  if (!scope) return rows;
  if (scope === HEADQUARTERS_SCOPE) return [];
  return (rows || []).filter((row) => String(row?.[stageKey] || "") === scope);
}

/**
 * 组织架构裁剪：学部财务只看到总校根节点 + 自己那个学部及其子树；
 * 总校财务只看到总校根节点 + 非学部的职能部门（行政后勤、财务处等）。
 */
export function filterOrgUnitsByFinanceScope(account, units) {
  const scope = financeScopeFor(account);
  if (!scope) return units;
  const list = units || [];
  const divisionStageIds = new Set(
    list.filter((unit) => unit.type === "division").map((unit) => String(unit.stageId || "")),
  );
  // 学部子树：以本学部节点为根逐层向下收集
  const keptIds = new Set();
  const collect = (parentId) => {
    list.forEach((unit) => {
      if (unit.parentId !== parentId || keptIds.has(unit.id)) return;
      keptIds.add(unit.id);
      collect(unit.id);
    });
  };

  return list.filter((unit) => {
    if (unit.type === "school") return true; // 总校根节点保留，否则树没有根
    if (scope === HEADQUARTERS_SCOPE) {
      // 非学部的职能部门归总校；学部及其子树一概不给
      if (unit.type === "division") return false;
      return !divisionStageIds.has(String(unit.stageId || "")) || !unit.stageId;
    }
    if (unit.type === "division") return String(unit.stageId || "") === scope;
    if (keptIds.size === 0) {
      const own = list.find((item) => item.type === "division" && String(item.stageId || "") === scope);
      if (own) collect(own.id);
    }
    return keptIds.has(unit.id);
  });
}

/**
 * 薪酬制度按范围裁剪：制度里按学段分档的部分（课时费、考核档等），
 * 学部财务只需要也只应看到本学段那一档。
 * 只裁剪键名恰好是学段 id 的对象，其余结构原样保留。
 */
export function filterPayrollRulesByFinanceScope(account, rules) {
  const scope = financeScopeFor(account);
  if (!scope) return rules;
  const divisionIds = FINANCE_SCOPES.filter((item) => item.type === "division").map((item) => item.id);
  // 总校财务管行政后勤，没有教学课时档位，三个学段的分档一并摘掉
  const otherStages = scope === HEADQUARTERS_SCOPE
    ? divisionIds
    : divisionIds.filter((id) => id !== scope);

  const prune = (value) => {
    if (Array.isArray(value)) return value.map(prune);
    if (!value || typeof value !== "object") return value;
    const next = {};
    Object.entries(value).forEach(([key, item]) => {
      if (otherStages.includes(key)) return; // 他学段的档位整块摘掉
      next[key] = prune(item);
    });
    return next;
  };
  return prune(rules);
}
