import {
  decryptPii,
  encryptPii,
  maskBankCard,
  maskIdCard,
  maskPhone,
} from "./security/pii.js";
import { deepMerge, defaultTeacherSalaryProfile } from "./payroll.js";

// 第二阶段 M2：人事管控域逻辑（组织架构、岗位、全员档案、合同、薪资模板、档案变更申请、人事审计）。
//
// 约定（与一阶段一致）：
// - 所有函数直接变异内存 db，不调 saveDatabase（由路由层统一落盘）；
// - 业务校验失败 throw Error 并带 statusCode；
// - 人事写操作必须带 reason 并写入 hrAuditLogs（字段级 diff，敏感字段 diff 只存掩码值）；
// - employee ↔ teacher 双写只允许经 updateEmployee / setEmployeeStatus 收口。

export const EMPLOYEE_STATUSES = [
  "pending_onboard",
  "probation",
  "active",
  "transferring",
  "offboarding",
  "left",
  "suspended",
];

export const EMPLOYEE_STATUS_LABELS = {
  pending_onboard: "待入职",
  probation: "试用期",
  active: "在职",
  transferring: "调岗中",
  offboarding: "离职中",
  left: "已离职",
  suspended: "停用",
};

export const ORG_UNIT_TYPES = ["school", "division", "department", "grade_group"];
export const POSITION_SERIES = [
  "teacher",
  "admin",
  "logistics",
  "medical",
  "driver",
  "canteen",
  "kindergarten",
  "recruit",
  "security",
];

// 老师本人可申请修正的非关键字段白名单（PRD EMP-3）
export const PROFILE_CHANGE_FIELDS = ["phone", "emergencyContact", "emergencyPhone"];

// 敏感字段：加密存储 + 掩码展示 + 审计 diff 只存掩码
const SENSITIVE_FIELD_CONFIG = {
  idCard: { encrypted: "idCardEncrypted", masked: "idCardMasked", mask: maskIdCard, label: "证件号" },
  bankCard: { encrypted: "bankCardEncrypted", masked: "bankCardMasked", mask: maskBankCard, label: "银行卡号" },
};

const EMPLOYEE_EDITABLE_FIELDS = [
  "personName",
  "gender",
  "birthDate",
  "phone",
  "emergencyContact",
  "emergencyPhone",
  "orgUnitId",
  "positionId",
  "reportsTo",
  "hiredAt",
  "regularizedAt",
];

function httpError(statusCode, message, details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

function nowIso() {
  return new Date().toISOString();
}

function requireReason(reason, action) {
  const text = String(reason || "").trim();
  if (!text) throw httpError(400, `请填写${action}原因（人事操作必须留痕）`);
  return text;
}

function ensureCollections(db) {
  const keys = [
    "orgUnits",
    "positions",
    "employees",
    "employeeContracts",
    "salaryTemplates",
    "salaryTemplateVersions",
    "hrFlows",
    "hrFlowSteps",
    "hrAuditLogs",
  ];
  keys.forEach((key) => {
    if (!Array.isArray(db[key])) db[key] = [];
  });
  return db;
}

let hrIdCounter = 0;

function nextId(prefix) {
  hrIdCounter = (hrIdCounter + 1) % 100000;
  return `${prefix}-${Date.now()}-${hrIdCounter}`;
}

// ---------------------------------------------------------------------------
// 审计
// ---------------------------------------------------------------------------

export function appendHrAuditLog(db, entry = {}) {
  ensureCollections(db);
  const record = {
    id: nextId("HRAUDIT"),
    actorAccountId: entry.actorAccount?.id || entry.actorAccountId || "",
    actorName: entry.actorAccount?.name || entry.actorName || "",
    action: entry.action || "",
    targetType: entry.targetType || "",
    targetId: entry.targetId || "",
    targetEmployeeId: entry.targetEmployeeId || "",
    fieldDiffs: Array.isArray(entry.fieldDiffs) ? entry.fieldDiffs : [],
    reason: entry.reason || "",
    clientIp: entry.context?.clientIp || "",
    userAgent: String(entry.context?.userAgent || "").slice(0, 200),
    createdAt: nowIso(),
  };
  db.hrAuditLogs.push(record);
  db.meta.updatedAt = record.createdAt;
  return record;
}

// 字段级 diff：只收集实际变化；敏感字段 before/after 存掩码值
export function computeFieldDiffs(before = {}, after = {}, fields = []) {
  const diffs = [];
  fields.forEach((field) => {
    const sensitive = SENSITIVE_FIELD_CONFIG[field];
    const beforeValue = sensitive ? before[sensitive.masked] || "" : before[field] ?? "";
    const afterValue = sensitive ? after[sensitive.masked] || "" : after[field] ?? "";
    if (String(beforeValue) !== String(afterValue)) {
      diffs.push({ field, before: String(beforeValue), after: String(afterValue) });
    }
  });
  return diffs;
}

export function queryHrAuditLogs(db, query = {}, scope = null) {
  ensureCollections(db);
  const scopedEmployeeIds = scope
    ? new Set(db.employees.filter((employee) => scope.orgUnitIds.has(employee.orgUnitId)).map((e) => e.id))
    : null;
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize || "20", 10), 1), 100);
  const targetEmployeeId = String(query.targetEmployeeId || "").trim();
  const actorAccountId = String(query.actorAccountId || "").trim();
  const action = String(query.action || "").trim();
  const from = String(query.from || "").trim();
  const to = String(query.to || "").trim();
  const search = String(query.search || "").trim().toLowerCase();

  const filtered = db.hrAuditLogs
    .filter((entry) => {
      // 学部负责人只能看到本学部人员相关的审计
      if (scopedEmployeeIds && (!entry.targetEmployeeId || !scopedEmployeeIds.has(entry.targetEmployeeId))) {
        return false;
      }
      if (targetEmployeeId && entry.targetEmployeeId !== targetEmployeeId) return false;
      if (actorAccountId && entry.actorAccountId !== actorAccountId) return false;
      if (action && entry.action !== action) return false;
      if (from && entry.createdAt < from) return false;
      if (to && entry.createdAt > `${to}T23:59:59.999Z` && entry.createdAt > to) return false;
      if (search) {
        const haystack = `${entry.actorName} ${entry.action} ${entry.reason} ${entry.targetId}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
    },
  };
}

// ---------------------------------------------------------------------------
// 组织架构
// ---------------------------------------------------------------------------

function findOrgUnit(db, orgUnitId) {
  return db.orgUnits.find((unit) => unit.id === orgUnitId) || null;
}

export function orgUnitDescendantIds(db, orgUnitId) {
  ensureCollections(db);
  const childrenByParent = new Map();
  db.orgUnits.forEach((unit) => {
    if (!childrenByParent.has(unit.parentId)) childrenByParent.set(unit.parentId, []);
    childrenByParent.get(unit.parentId).push(unit.id);
  });
  const result = new Set();
  const queue = [orgUnitId];
  while (queue.length) {
    const current = queue.shift();
    (childrenByParent.get(current) || []).forEach((childId) => {
      if (!result.has(childId)) {
        result.add(childId);
        queue.push(childId);
      }
    });
  }
  return result;
}

export function queryOrgUnits(db) {
  ensureCollections(db);
  const countByUnit = new Map();
  db.employees.forEach((employee) => {
    if (employee.status === "left") return;
    countByUnit.set(employee.orgUnitId, (countByUnit.get(employee.orgUnitId) || 0) + 1);
  });
  return db.orgUnits
    .map((unit) => ({ ...unit, activeEmployeeCount: countByUnit.get(unit.id) || 0 }))
    .sort((a, b) => a.displayOrder - b.displayOrder || a.createdAt.localeCompare(b.createdAt));
}

export function createOrgUnit(db, input = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const name = String(input.name || "").trim();
  if (!name) throw httpError(400, "节点名称不能为空");
  const type = String(input.type || "department");
  if (!ORG_UNIT_TYPES.includes(type)) throw httpError(400, `节点类型无效：${type}`);
  const reason = requireReason(input.reason, "新增组织节点");

  const parentId = String(input.parentId || "").trim();
  if (type !== "school") {
    const parent = findOrgUnit(db, parentId);
    if (!parent) throw httpError(400, "必须选择有效的上级节点");
    if (parent.status !== "active") throw httpError(409, "停用节点下不能新增子节点");
  } else if (db.orgUnits.some((unit) => unit.type === "school")) {
    throw httpError(409, "总校根节点只能有一个");
  }

  const stageId = String(input.stageId || "").trim();
  if (stageId && !(db.stages || []).some((stage) => stage.id === stageId)) {
    throw httpError(400, `排课学部映射无效：${stageId}`);
  }

  const now = nowIso();
  const unit = {
    id: input.id || nextId("ORG"),
    parentId: type === "school" ? "" : parentId,
    type,
    name,
    stageId,
    displayOrder: Number.isFinite(Number(input.displayOrder)) ? Number(input.displayOrder) : db.orgUnits.length,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  db.orgUnits.push(unit);
  appendHrAuditLog(db, {
    actorAccount,
    action: "org_unit_create",
    targetType: "orgUnit",
    targetId: unit.id,
    fieldDiffs: [{ field: "name", before: "", after: unit.name }],
    reason,
    context,
  });
  return unit;
}

export function updateOrgUnit(db, orgUnitId, patch = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const unit = findOrgUnit(db, orgUnitId);
  if (!unit) throw httpError(404, "组织节点不存在");
  const reason = requireReason(patch.reason, "修改组织节点");

  const before = { ...unit };
  if (patch.name !== undefined) {
    const name = String(patch.name || "").trim();
    if (!name) throw httpError(400, "节点名称不能为空");
    unit.name = name;
  }
  if (patch.stageId !== undefined) {
    const stageId = String(patch.stageId || "").trim();
    if (stageId && !(db.stages || []).some((stage) => stage.id === stageId)) {
      throw httpError(400, `排课学部映射无效：${stageId}`);
    }
    unit.stageId = stageId;
  }
  if (patch.displayOrder !== undefined && Number.isFinite(Number(patch.displayOrder))) {
    unit.displayOrder = Number(patch.displayOrder);
  }
  if (patch.parentId !== undefined) {
    if (unit.type === "school") throw httpError(400, "总校根节点不能调整上级");
    const parentId = String(patch.parentId || "").trim();
    const parent = findOrgUnit(db, parentId);
    if (!parent) throw httpError(400, "上级节点不存在");
    if (parentId === unit.id || orgUnitDescendantIds(db, unit.id).has(parentId)) {
      throw httpError(400, "不能把节点挂到自身或其下级节点，避免形成环");
    }
    unit.parentId = parentId;
  }

  const diffs = computeFieldDiffs(before, unit, ["name", "stageId", "parentId", "displayOrder"]);
  if (!diffs.length) throw httpError(400, "没有任何变化，无需保存");
  unit.updatedAt = nowIso();
  appendHrAuditLog(db, {
    actorAccount,
    action: "org_unit_update",
    targetType: "orgUnit",
    targetId: unit.id,
    fieldDiffs: diffs,
    reason,
    context,
  });
  return unit;
}

export function setOrgUnitStatus(db, orgUnitId, status, reason, actorAccount = null, context = {}) {
  ensureCollections(db);
  const unit = findOrgUnit(db, orgUnitId);
  if (!unit) throw httpError(404, "组织节点不存在");
  if (!["active", "disabled"].includes(status)) throw httpError(400, "状态只能是 active 或 disabled");
  const trimmedReason = requireReason(reason, "变更节点状态");
  if (unit.status === status) throw httpError(400, "节点已处于该状态");

  if (status === "disabled") {
    if (unit.type === "school") throw httpError(400, "总校根节点不能停用");
    const scope = orgUnitDescendantIds(db, unit.id);
    scope.add(unit.id);
    // “在职”判定 = 非已离职：停用/离职中人员也不允许藏进停用节点
    const blocking = db.employees.filter((employee) => scope.has(employee.orgUnitId) && employee.status !== "left");
    if (blocking.length) {
      throw httpError(409, `该节点及下级仍有 ${blocking.length} 名非离职人员，请先调岗或办理离职`, {
        blockingCount: blocking.length,
        sample: blocking.slice(0, 5).map((employee) => employee.personName),
      });
    }
  }

  const before = { ...unit };
  unit.status = status;
  unit.updatedAt = nowIso();
  appendHrAuditLog(db, {
    actorAccount,
    action: "org_unit_status",
    targetType: "orgUnit",
    targetId: unit.id,
    fieldDiffs: computeFieldDiffs(before, unit, ["status"]),
    reason: trimmedReason,
    context,
  });
  return unit;
}

// ---------------------------------------------------------------------------
// 岗位字典
// ---------------------------------------------------------------------------

function findPosition(db, positionId) {
  return db.positions.find((position) => position.id === positionId) || null;
}

export function queryPositions(db, query = {}) {
  ensureCollections(db);
  const series = String(query.series || "").trim();
  const holderCount = new Map();
  db.employees.forEach((employee) => {
    if (employee.status === "left") return;
    holderCount.set(employee.positionId, (holderCount.get(employee.positionId) || 0) + 1);
  });
  return db.positions
    .filter((position) => !series || position.series === series)
    .map((position) => ({ ...position, activeHolderCount: holderCount.get(position.id) || 0 }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function createPosition(db, input = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const code = String(input.code || "").trim().toUpperCase();
  const name = String(input.name || "").trim();
  const series = String(input.series || "").trim();
  if (!code || !name) throw httpError(400, "岗位编码和名称不能为空");
  if (!POSITION_SERIES.includes(series)) throw httpError(400, `岗位序列无效：${series}`);
  if (db.positions.some((position) => position.code === code)) {
    throw httpError(409, `岗位编码已存在：${code}`);
  }
  const reason = requireReason(input.reason, "新增岗位");
  const now = nowIso();
  const position = {
    id: input.id || nextId("POS"),
    code,
    name,
    series,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  db.positions.push(position);
  appendHrAuditLog(db, {
    actorAccount,
    action: "position_create",
    targetType: "position",
    targetId: position.id,
    fieldDiffs: [{ field: "name", before: "", after: `${code} ${name}` }],
    reason,
    context,
  });
  return position;
}

export function updatePosition(db, positionId, patch = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const position = findPosition(db, positionId);
  if (!position) throw httpError(404, "岗位不存在");
  const reason = requireReason(patch.reason, "修改岗位");

  const before = { ...position };
  if (patch.name !== undefined) {
    const name = String(patch.name || "").trim();
    if (!name) throw httpError(400, "岗位名称不能为空");
    position.name = name;
  }
  if (patch.series !== undefined) {
    const series = String(patch.series || "").trim();
    if (!POSITION_SERIES.includes(series)) throw httpError(400, `岗位序列无效：${series}`);
    position.series = series;
  }
  if (patch.status !== undefined) {
    if (!["active", "disabled"].includes(patch.status)) throw httpError(400, "状态只能是 active 或 disabled");
    if (patch.status === "disabled") {
      const holders = db.employees.filter(
        (employee) => employee.positionId === position.id && employee.status !== "left",
      );
      if (holders.length) {
        throw httpError(409, `该岗位仍有 ${holders.length} 名非离职任职者，请先调整岗位`, {
          holderCount: holders.length,
        });
      }
    }
    position.status = patch.status;
  }

  const diffs = computeFieldDiffs(before, position, ["name", "series", "status"]);
  if (!diffs.length) throw httpError(400, "没有任何变化，无需保存");
  position.updatedAt = nowIso();
  appendHrAuditLog(db, {
    actorAccount,
    action: "position_update",
    targetType: "position",
    targetId: position.id,
    fieldDiffs: diffs,
    reason,
    context,
  });
  return position;
}

// ---------------------------------------------------------------------------
// 全员档案
// ---------------------------------------------------------------------------

function findEmployee(db, employeeId) {
  return db.employees.find((employee) => employee.id === employeeId) || null;
}

function findTeacherRow(db, teacherId) {
  return (db.teachers || []).find((teacher) => teacher.id === teacherId) || null;
}

// 对外输出的掩码视图：结构上不含加密密文，也不含任何薪资字段
export function publicEmployee(db, employee) {
  if (!employee) return null;
  const orgUnit = findOrgUnit(db, employee.orgUnitId);
  const position = findPosition(db, employee.positionId);
  return {
    id: employee.id,
    employeeNo: employee.employeeNo,
    personName: employee.personName,
    gender: employee.gender || "",
    birthDate: employee.birthDate || "",
    idCardMasked: employee.idCardMasked || "",
    hasIdCard: Boolean(employee.idCardEncrypted),
    bankCardMasked: employee.bankCardMasked || "",
    hasBankCard: Boolean(employee.bankCardEncrypted),
    phone: employee.phone || "",
    emergencyContact: employee.emergencyContact || "",
    emergencyPhone: employee.emergencyPhone || "",
    orgUnitId: employee.orgUnitId || "",
    orgUnitName: orgUnit?.name || "",
    positionId: employee.positionId || "",
    positionName: position?.name || "",
    positionSeries: position?.series || "",
    reportsTo: employee.reportsTo || "",
    teacherId: employee.teacherId || "",
    status: employee.status,
    statusLabel: EMPLOYEE_STATUS_LABELS[employee.status] || employee.status,
    hiredAt: employee.hiredAt || "",
    regularizedAt: employee.regularizedAt || "",
    leftAt: employee.leftAt || "",
    salaryTemplateId: employee.salaryTemplateId || "",
    salaryTemplateVer: employee.salaryTemplateVer || 0,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}

export function queryEmployees(db, query = {}, scope = null) {
  ensureCollections(db);
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize || "20", 10), 1), 100);
  const search = String(query.search || "").trim().toLowerCase();
  const orgUnitId = String(query.orgUnitId || "").trim();
  const positionId = String(query.positionId || "").trim();
  const status = String(query.status || "").trim();
  const series = String(query.series || "").trim();

  const orgScope = orgUnitId ? orgUnitDescendantIds(db, orgUnitId) : null;
  if (orgScope) orgScope.add(orgUnitId);

  const positionsById = new Map(db.positions.map((position) => [position.id, position]));

  const filtered = db.employees.filter((employee) => {
    // 学部负责人 scope：只见本学部（含子树）人员
    if (scope && !scope.orgUnitIds.has(employee.orgUnitId)) return false;
    if (orgScope && !orgScope.has(employee.orgUnitId)) return false;
    if (positionId && employee.positionId !== positionId) return false;
    if (status && employee.status !== status) return false;
    if (series && positionsById.get(employee.positionId)?.series !== series) return false;
    if (!search) return true;
    return `${employee.personName} ${employee.employeeNo} ${employee.phone || ""}`
      .toLowerCase()
      .includes(search);
  });

  const summary = { total: filtered.length };
  EMPLOYEE_STATUSES.forEach((key) => {
    summary[key] = 0;
  });
  filtered.forEach((employee) => {
    summary[employee.status] = (summary[employee.status] || 0) + 1;
  });

  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize).map((employee) => publicEmployee(db, employee)),
    summary,
    meta: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
    },
  };
}

function applySensitiveField(employee, field, plaintext) {
  const config = SENSITIVE_FIELD_CONFIG[field];
  const value = String(plaintext || "").trim();
  if (!value) {
    employee[config.encrypted] = "";
    employee[config.masked] = "";
    return;
  }
  employee[config.encrypted] = encryptPii(value);
  employee[config.masked] = config.mask(value);
}

function nextEmployeeNo(db) {
  let sequence = db.employees.length + 1;
  let candidate = `EMP${String(sequence).padStart(4, "0")}`;
  const used = new Set(db.employees.map((employee) => employee.employeeNo));
  while (used.has(candidate)) {
    sequence += 1;
    candidate = `EMP${String(sequence).padStart(4, "0")}`;
  }
  return candidate;
}

export function createEmployee(db, input = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const personName = String(input.personName || "").trim();
  if (!personName) throw httpError(400, "姓名不能为空");
  const reason = requireReason(input.reason, "新建档案");

  const orgUnit = findOrgUnit(db, String(input.orgUnitId || "").trim());
  if (!orgUnit) throw httpError(400, "必须选择组织节点");
  if (orgUnit.status !== "active") throw httpError(409, "停用节点下不能新增人员");
  const position = findPosition(db, String(input.positionId || "").trim());
  if (!position) throw httpError(400, "必须选择岗位");
  if (position.status !== "active") throw httpError(409, "停用岗位不能任职");

  const employeeNo = String(input.employeeNo || "").trim() || nextEmployeeNo(db);
  if (db.employees.some((employee) => employee.employeeNo === employeeNo)) {
    throw httpError(409, `工号已存在：${employeeNo}`);
  }
  const status = String(input.status || "probation");
  if (!EMPLOYEE_STATUSES.includes(status)) throw httpError(400, `人事状态无效：${status}`);

  const now = nowIso();
  const employee = {
    id: input.id || nextId("EMP"),
    employeeNo,
    personName,
    gender: String(input.gender || ""),
    birthDate: String(input.birthDate || ""),
    idCardEncrypted: "",
    idCardMasked: "",
    phone: String(input.phone || ""),
    emergencyContact: String(input.emergencyContact || ""),
    emergencyPhone: String(input.emergencyPhone || ""),
    bankCardEncrypted: "",
    bankCardMasked: "",
    orgUnitId: orgUnit.id,
    positionId: position.id,
    reportsTo: String(input.reportsTo || ""),
    teacherId: String(input.teacherId || ""),
    status,
    hiredAt: String(input.hiredAt || ""),
    regularizedAt: String(input.regularizedAt || ""),
    leftAt: "",
    salaryTemplateId: String(input.salaryTemplateId || ""),
    salaryTemplateVer: Number(input.salaryTemplateVer || 0),
    createdAt: now,
    updatedAt: now,
  };
  if (input.idCard) applySensitiveField(employee, "idCard", input.idCard);
  if (input.bankCard) applySensitiveField(employee, "bankCard", input.bankCard);

  db.employees.push(employee);
  appendHrAuditLog(db, {
    actorAccount,
    action: "employee_create",
    targetType: "employee",
    targetId: employee.id,
    targetEmployeeId: employee.id,
    fieldDiffs: [{ field: "personName", before: "", after: personName }],
    reason,
    context,
  });
  return publicEmployee(db, employee);
}

export function getEmployeeDetail(db, employeeId) {
  ensureCollections(db);
  const employee = findEmployee(db, employeeId);
  if (!employee) throw httpError(404, "档案不存在");
  const contracts = db.employeeContracts
    .filter((contract) => contract.employeeId === employee.id)
    .sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)));
  const pendingChangeRequests = db.hrFlows.filter(
    (flow) => flow.flowType === "profile_update" && flow.employeeId === employee.id && flow.status === "pending",
  );
  return {
    employee: publicEmployee(db, employee),
    contracts,
    pendingChangeRequests,
  };
}

// 档案更新唯一入口：敏感字段加密双写；personName/phone/status 镜像到关联 teacher 行
export function updateEmployee(db, employeeId, patch = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const employee = findEmployee(db, employeeId);
  if (!employee) throw httpError(404, "档案不存在");
  const reason = requireReason(patch.reason, "修改档案");

  const before = { ...employee };

  EMPLOYEE_EDITABLE_FIELDS.forEach((field) => {
    if (patch[field] === undefined) return;
    if (field === "personName") {
      const name = String(patch.personName || "").trim();
      if (!name) throw httpError(400, "姓名不能为空");
      employee.personName = name;
      return;
    }
    if (field === "orgUnitId") {
      const orgUnit = findOrgUnit(db, String(patch.orgUnitId || "").trim());
      if (!orgUnit) throw httpError(400, "组织节点不存在");
      if (orgUnit.status !== "active") throw httpError(409, "停用节点下不能挂人员");
      employee.orgUnitId = orgUnit.id;
      return;
    }
    if (field === "positionId") {
      const position = findPosition(db, String(patch.positionId || "").trim());
      if (!position) throw httpError(400, "岗位不存在");
      if (position.status !== "active") throw httpError(409, "停用岗位不能任职");
      employee.positionId = position.id;
      return;
    }
    employee[field] = String(patch[field] ?? "");
  });

  if (patch.idCard !== undefined) applySensitiveField(employee, "idCard", patch.idCard);
  if (patch.bankCard !== undefined) applySensitiveField(employee, "bankCard", patch.bankCard);

  const diffs = computeFieldDiffs(before, employee, [...EMPLOYEE_EDITABLE_FIELDS, "idCard", "bankCard"]);
  if (!diffs.length) throw httpError(400, "没有任何变化，无需保存");

  // 镜像同步：教学侧姓名/电话以档案为准
  if (employee.teacherId) {
    const teacher = findTeacherRow(db, employee.teacherId);
    if (teacher) {
      if (patch.personName !== undefined) teacher.name = employee.personName;
      if (patch.phone !== undefined) teacher.phone = employee.phone;
    }
  }

  employee.updatedAt = nowIso();
  db.meta.updatedAt = employee.updatedAt;
  appendHrAuditLog(db, {
    actorAccount,
    action: "employee_update",
    targetType: "employee",
    targetId: employee.id,
    targetEmployeeId: employee.id,
    fieldDiffs: diffs,
    reason,
    context,
  });
  return publicEmployee(db, employee);
}

// 人事状态唯一写入口：left/suspended 冻结教学侧账号资格（完整业务联动在 M4 收口）
export function setEmployeeStatus(db, employeeId, status, reason, actorAccount = null, context = {}) {
  ensureCollections(db);
  const employee = findEmployee(db, employeeId);
  if (!employee) throw httpError(404, "档案不存在");
  if (!EMPLOYEE_STATUSES.includes(status)) throw httpError(400, `人事状态无效：${status}`);
  const trimmedReason = requireReason(reason, "变更人事状态");
  if (employee.status === status) throw httpError(400, "已处于该状态");

  const before = { ...employee };
  employee.status = status;
  if (status === "left") {
    employee.leftAt = String(context.effectiveDate || nowIso().slice(0, 10));
  } else if (before.status === "left") {
    employee.leftAt = "";
  }

  if (employee.teacherId) {
    const frozen = status === "left" || status === "suspended";
    const teacher = findTeacherRow(db, employee.teacherId);
    if (teacher) {
      teacher.status = frozen ? "disabled" : "active";
    }
    // 登录资格镜像：已离职/停用即时禁用账号，恢复在职时重新启用（PRD 4.5 联动矩阵）
    (db.accounts || [])
      .filter((account) => account.teacherId === employee.teacherId)
      .forEach((account) => {
        account.status = frozen ? "disabled" : "active";
      });
  }

  employee.updatedAt = nowIso();
  db.meta.updatedAt = employee.updatedAt;
  appendHrAuditLog(db, {
    actorAccount,
    action: "employee_status",
    targetType: "employee",
    targetId: employee.id,
    targetEmployeeId: employee.id,
    fieldDiffs: computeFieldDiffs(before, employee, ["status", "leftAt"]),
    reason: trimmedReason,
    context,
  });
  return publicEmployee(db, employee);
}

// 敏感字段完整读取：必须填原因，每次读取留审计（含 IP/UA）
export function revealSensitiveField(db, employeeId, field, reason, actorAccount = null, context = {}) {
  ensureCollections(db);
  const config = SENSITIVE_FIELD_CONFIG[field];
  if (!config) throw httpError(400, `不支持的敏感字段：${field}`);
  const employee = findEmployee(db, employeeId);
  if (!employee) throw httpError(404, "档案不存在");
  const trimmedReason = requireReason(reason, "查看完整敏感信息");
  const ciphertext = employee[config.encrypted];
  if (!ciphertext) throw httpError(404, `该档案未录入${config.label}`);
  const value = decryptPii(ciphertext);
  appendHrAuditLog(db, {
    actorAccount,
    action: "sensitive_view",
    targetType: "employee",
    targetId: employee.id,
    targetEmployeeId: employee.id,
    fieldDiffs: [{ field, before: "", after: employee[config.masked] }],
    reason: trimmedReason,
    context,
  });
  return { field, label: config.label, value };
}

export function addEmployeeContract(db, employeeId, input = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const employee = findEmployee(db, employeeId);
  if (!employee) throw httpError(404, "档案不存在");
  const reason = requireReason(input.reason, "新增合同");
  const type = String(input.type || "").trim();
  if (!["fixed_term", "open_term", "internship"].includes(type)) {
    throw httpError(400, "合同类型无效（fixed_term/open_term/internship）");
  }
  const startDate = String(input.startDate || "").trim();
  if (!startDate) throw httpError(400, "合同开始日期不能为空");
  const endDate = String(input.endDate || "").trim();
  if (endDate && endDate < startDate) throw httpError(400, "合同结束日期不能早于开始日期");

  const contract = {
    id: nextId("CON"),
    employeeId: employee.id,
    type,
    startDate,
    endDate,
    signedAt: String(input.signedAt || ""),
    fileRef: String(input.fileRef || ""),
    remark: String(input.remark || ""),
    createdAt: nowIso(),
  };
  db.employeeContracts.push(contract);
  appendHrAuditLog(db, {
    actorAccount,
    action: "contract_create",
    targetType: "employee",
    targetId: contract.id,
    targetEmployeeId: employee.id,
    fieldDiffs: [{ field: "contract", before: "", after: `${type} ${startDate}~${endDate || "长期"}` }],
    reason,
    context,
  });
  return contract;
}

export function updateEmployeeContract(db, contractId, patch = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const contract = db.employeeContracts.find((item) => item.id === contractId);
  if (!contract) throw httpError(404, "合同不存在");
  const reason = requireReason(patch.reason, "修改合同");
  const before = { ...contract };
  ["type", "startDate", "endDate", "signedAt", "fileRef", "remark"].forEach((field) => {
    if (patch[field] !== undefined) contract[field] = String(patch[field] ?? "");
  });
  if (contract.endDate && contract.endDate < contract.startDate) {
    throw httpError(400, "合同结束日期不能早于开始日期");
  }
  const diffs = computeFieldDiffs(before, contract, ["type", "startDate", "endDate", "signedAt", "fileRef", "remark"]);
  if (!diffs.length) throw httpError(400, "没有任何变化，无需保存");
  appendHrAuditLog(db, {
    actorAccount,
    action: "contract_update",
    targetType: "employee",
    targetId: contract.id,
    targetEmployeeId: contract.employeeId,
    fieldDiffs: diffs,
    reason,
    context,
  });
  return contract;
}

// 花名册导出：只输出掩码/非敏感列；防 CSV 公式注入；导出必审计
export function exportEmployeesCsv(db, query = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const result = queryEmployees(db, { ...query, page: 1, pageSize: 100 });
  const rows = [];
  let page = 1;
  let current = result;
  rows.push(...current.items);
  while (current.meta.page < current.meta.totalPages) {
    page += 1;
    current = queryEmployees(db, { ...query, page, pageSize: 100 });
    rows.push(...current.items);
  }

  const escapeCell = (value) => {
    let text = String(value ?? "");
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
      text = `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const header = ["工号", "姓名", "组织", "岗位", "序列", "状态", "电话", "证件号(掩码)", "入职日期", "离职日期"];
  const lines = [header.join(",")];
  rows.forEach((employee) => {
    lines.push(
      [
        employee.employeeNo,
        employee.personName,
        employee.orgUnitName,
        employee.positionName,
        employee.positionSeries,
        employee.statusLabel,
        employee.phone,
        employee.idCardMasked,
        employee.hiredAt,
        employee.leftAt,
      ]
        .map(escapeCell)
        .join(","),
    );
  });

  appendHrAuditLog(db, {
    actorAccount,
    action: "roster_export",
    targetType: "roster",
    targetId: "",
    fieldDiffs: [],
    reason: `导出花名册 ${rows.length} 行（筛选：${JSON.stringify(query || {})}）`,
    context,
  });

  return {
    filename: `employee-roster-${nowIso().slice(0, 10)}.csv`,
    csv: lines.join("\n"),
    rowCount: rows.length,
  };
}

// ---------------------------------------------------------------------------
// 岗位薪资模板（金额属财务权限；hr 只见绑定关系与版本号）
// ---------------------------------------------------------------------------

export function querySalaryTemplates(db, { includePayload = false } = {}) {
  ensureCollections(db);
  return db.salaryTemplates.map((template) => {
    const versions = db.salaryTemplateVersions
      .filter((version) => version.templateId === template.id)
      .sort((a, b) => b.version - a.version);
    const position = findPosition(db, template.positionId);
    return {
      id: template.id,
      name: template.name,
      positionId: template.positionId,
      positionName: position?.name || "",
      status: template.status,
      latestVersion: versions[0]?.version || 0,
      versions: versions.map((version) => ({
        id: version.id,
        version: version.version,
        effectiveFrom: version.effectiveFrom,
        createdBy: version.createdBy,
        createdAt: version.createdAt,
        ...(includePayload ? { payload: version.payload } : {}),
      })),
    };
  });
}

export function createSalaryTemplate(db, input = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const name = String(input.name || "").trim();
  if (!name) throw httpError(400, "模板名称不能为空");
  const position = findPosition(db, String(input.positionId || "").trim());
  if (!position) throw httpError(400, "必须绑定岗位");
  if (!input.payload || typeof input.payload !== "object") throw httpError(400, "模板内容不能为空");
  const reason = requireReason(input.reason, "新建薪资模板");

  const now = nowIso();
  const template = {
    id: input.id || nextId("TPL"),
    positionId: position.id,
    name,
    status: "active",
    createdAt: now,
  };
  const version = {
    id: nextId("TPLV"),
    templateId: template.id,
    version: 1,
    payload: input.payload,
    effectiveFrom: String(input.effectiveFrom || now.slice(0, 10)),
    createdBy: actorAccount?.id || "",
    createdAt: now,
  };
  db.salaryTemplates.push(template);
  db.salaryTemplateVersions.push(version);
  appendHrAuditLog(db, {
    actorAccount,
    action: "salary_template_create",
    targetType: "salaryTemplate",
    targetId: template.id,
    fieldDiffs: [{ field: "name", before: "", after: `${name} v1` }],
    reason,
    context,
  });
  return { template, version };
}

export function addSalaryTemplateVersion(db, templateId, input = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const template = db.salaryTemplates.find((item) => item.id === templateId);
  if (!template) throw httpError(404, "模板不存在");
  if (!input.payload || typeof input.payload !== "object") throw httpError(400, "模板内容不能为空");
  const reason = requireReason(input.reason, "发布模板新版本");
  const versions = db.salaryTemplateVersions.filter((version) => version.templateId === template.id);
  const nextVersion = Math.max(0, ...versions.map((version) => version.version)) + 1;
  const now = nowIso();
  const version = {
    id: nextId("TPLV"),
    templateId: template.id,
    version: nextVersion,
    payload: input.payload,
    effectiveFrom: String(input.effectiveFrom || now.slice(0, 10)),
    createdBy: actorAccount?.id || "",
    createdAt: now,
  };
  db.salaryTemplateVersions.push(version);
  appendHrAuditLog(db, {
    actorAccount,
    action: "salary_template_version",
    targetType: "salaryTemplate",
    targetId: template.id,
    fieldDiffs: [{ field: "version", before: String(nextVersion - 1), after: String(nextVersion) }],
    reason,
    context,
  });
  return version;
}

// 批量应用：员工档案登记模板引用 + 教师工资档案按 payload 深合并（存量档案不自动变，显式操作留痕）
export function applySalaryTemplate(db, templateId, options = {}, actorAccount = null, context = {}) {
  ensureCollections(db);
  const template = db.salaryTemplates.find((item) => item.id === templateId);
  if (!template) throw httpError(404, "模板不存在");
  const reason = requireReason(options.reason, "批量应用薪资模板");
  const version = db.salaryTemplateVersions.find(
    (item) => item.templateId === template.id && (options.versionId ? item.id === options.versionId : true),
  );
  const targetVersion = options.versionId
    ? version
    : db.salaryTemplateVersions
        .filter((item) => item.templateId === template.id)
        .sort((a, b) => b.version - a.version)[0];
  if (!targetVersion) throw httpError(404, "模板版本不存在");

  const employeeIds = Array.isArray(options.employeeIds) ? [...options.employeeIds] : [];
  // 前端交互友好：支持按工号指定（逐个解析，未匹配的进 skipped）
  const employeeNos = Array.isArray(options.employeeNos) ? options.employeeNos : [];
  const byNo = new Map(db.employees.map((employee) => [employee.employeeNo, employee.id]));
  const unresolved = [];
  employeeNos.forEach((no) => {
    const trimmed = String(no || "").trim();
    if (!trimmed) return;
    const id = byNo.get(trimmed);
    if (id) employeeIds.push(id);
    else unresolved.push(trimmed);
  });
  if (!employeeIds.length) throw httpError(400, "请选择要应用的员工");

  const applied = [];
  const skipped = unresolved.map((no) => ({ employeeId: no, reason: "工号不存在" }));
  employeeIds.forEach((employeeId) => {
    const employee = findEmployee(db, employeeId);
    if (!employee) {
      skipped.push({ employeeId, reason: "档案不存在" });
      return;
    }
    if (employee.status === "left") {
      skipped.push({ employeeId, reason: "已离职" });
      return;
    }
    employee.salaryTemplateId = template.id;
    employee.salaryTemplateVer = targetVersion.version;
    employee.updatedAt = nowIso();
    if (employee.teacherId) {
      const teacher = findTeacherRow(db, employee.teacherId);
      if (teacher) {
        teacher.salaryProfile = deepMerge(teacher.salaryProfile || {}, targetVersion.payload);
      } else {
        skipped.push({ employeeId, reason: "关联教师行缺失，仅登记模板引用" });
      }
    }
    applied.push(employeeId);
  });

  db.meta.updatedAt = nowIso();
  appendHrAuditLog(db, {
    actorAccount,
    action: "salary_template_apply",
    targetType: "salaryTemplate",
    targetId: template.id,
    fieldDiffs: [{ field: "appliedTo", before: "", after: `${applied.length} 人 → v${targetVersion.version}` }],
    reason: `${reason}（applied=${applied.length}, skipped=${skipped.length}）`,
    context,
  });
  return { applied, skipped, version: targetVersion.version };
}

// ---------------------------------------------------------------------------
// 档案变更申请（老师本人发起 → 人事专员审核；复用 hrFlows）
// ---------------------------------------------------------------------------

function employeeForAccount(db, account) {
  if (!account?.teacherId) return null;
  return db.employees.find((employee) => employee.teacherId === account.teacherId) || null;
}

export function createProfileChangeRequest(db, account, changes = {}, reason = "") {
  ensureCollections(db);
  const employee = employeeForAccount(db, account);
  if (!employee) throw httpError(404, "未找到本人档案，请联系人事专员");
  const trimmedReason = requireReason(reason, "提交变更申请");

  const cleanChanges = {};
  Object.entries(changes || {}).forEach(([field, value]) => {
    if (!PROFILE_CHANGE_FIELDS.includes(field)) {
      throw httpError(400, `字段 ${field} 不支持本人申请修改，请联系人事专员`);
    }
    const text = String(value ?? "").trim();
    if (text !== String(employee[field] || "")) cleanChanges[field] = text;
  });
  if (!Object.keys(cleanChanges).length) throw httpError(400, "申请内容与当前档案一致，无需提交");

  const existing = db.hrFlows.find(
    (flow) => flow.flowType === "profile_update" && flow.employeeId === employee.id && flow.status === "pending",
  );
  if (existing) throw httpError(409, "已有待审核的变更申请，请先等待处理或撤回");

  const now = nowIso();
  const flow = {
    id: nextId("FLOW"),
    flowType: "profile_update",
    employeeId: employee.id,
    payload: { changes: cleanChanges, reason: trimmedReason },
    status: "pending",
    currentStep: 0,
    createdBy: account.id,
    createdAt: now,
    closedAt: "",
  };
  db.hrFlows.push(flow);
  db.hrFlowSteps.push({
    id: nextId("FLOWSTEP"),
    flowId: flow.id,
    stepIndex: 0,
    stepName: "人事专员审核",
    actorId: "",
    action: "",
    comment: "",
    actedAt: "",
  });
  db.meta.updatedAt = now;
  appendHrAuditLog(db, {
    actorAccount: account,
    action: "profile_change_submit",
    targetType: "employee",
    targetId: flow.id,
    targetEmployeeId: employee.id,
    fieldDiffs: Object.entries(cleanChanges).map(([field, after]) => ({
      field,
      before: String(employee[field] || ""),
      after,
    })),
    reason: trimmedReason,
  });
  return flow;
}

export function queryProfileChangeRequests(db, query = {}, account = null) {
  ensureCollections(db);
  const status = String(query.status || "").trim();
  const mineOnly = account?.role === "teacher";
  const myEmployee = mineOnly ? employeeForAccount(db, account) : null;
  const employeesById = new Map(db.employees.map((employee) => [employee.id, employee]));

  return db.hrFlows
    .filter((flow) => flow.flowType === "profile_update")
    .filter((flow) => (mineOnly ? flow.employeeId === myEmployee?.id : true))
    .filter((flow) => (status ? flow.status === status : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((flow) => ({
      ...flow,
      employeeName: employeesById.get(flow.employeeId)?.personName || "",
      employeeNo: employeesById.get(flow.employeeId)?.employeeNo || "",
      steps: db.hrFlowSteps.filter((step) => step.flowId === flow.id),
    }));
}

export function reviewProfileChangeRequest(db, flowId, action, comment, actorAccount = null, context = {}) {
  ensureCollections(db);
  const flow = db.hrFlows.find((item) => item.id === flowId && item.flowType === "profile_update");
  if (!flow) throw httpError(404, "变更申请不存在");
  if (flow.status !== "pending") throw httpError(409, "该申请已处理");
  if (!["approve", "reject"].includes(action)) throw httpError(400, "审核动作只能是 approve 或 reject");
  if (action === "reject" && !String(comment || "").trim()) {
    throw httpError(400, "拒绝时必须填写意见");
  }

  const now = nowIso();
  const step = db.hrFlowSteps.find((item) => item.flowId === flow.id && item.stepIndex === flow.currentStep);
  if (step) {
    step.actorId = actorAccount?.id || "";
    step.action = action;
    step.comment = String(comment || "");
    step.actedAt = now;
  }
  flow.status = action === "approve" ? "approved" : "rejected";
  flow.closedAt = now;

  if (action === "approve") {
    updateEmployee(
      db,
      flow.employeeId,
      { ...flow.payload.changes, reason: `变更申请 ${flow.id} 审核通过：${flow.payload.reason}` },
      actorAccount,
      context,
    );
  }

  db.meta.updatedAt = now;
  appendHrAuditLog(db, {
    actorAccount,
    action: action === "approve" ? "profile_change_approve" : "profile_change_reject",
    targetType: "employee",
    targetId: flow.id,
    targetEmployeeId: flow.employeeId,
    fieldDiffs: [],
    reason: String(comment || ""),
    context,
  });
  return flow;
}

export function withdrawProfileChangeRequest(db, flowId, account) {
  ensureCollections(db);
  const flow = db.hrFlows.find((item) => item.id === flowId && item.flowType === "profile_update");
  if (!flow) throw httpError(404, "变更申请不存在");
  if (flow.status !== "pending") throw httpError(409, "只有待审核的申请可以撤回");
  const employee = employeeForAccount(db, account);
  if (!employee || flow.employeeId !== employee.id) throw httpError(403, "只能撤回本人的申请");
  flow.status = "withdrawn";
  flow.closedAt = nowIso();
  db.meta.updatedAt = flow.closedAt;
  appendHrAuditLog(db, {
    actorAccount: account,
    action: "profile_change_withdraw",
    targetType: "employee",
    targetId: flow.id,
    targetEmployeeId: employee.id,
    fieldDiffs: [],
    reason: "本人撤回",
  });
  return flow;
}

export function getMyHrProfile(db, account) {
  ensureCollections(db);
  const employee = employeeForAccount(db, account);
  if (!employee) throw httpError(404, "未找到本人档案，请联系人事专员");
  return {
    employee: publicEmployee(db, employee),
    changeRequests: queryProfileChangeRequests(db, {}, account),
    changeableFields: PROFILE_CHANGE_FIELDS,
  };
}

// ---------------------------------------------------------------------------
// seed 与幂等回填
// ---------------------------------------------------------------------------

const DEFAULT_DEPARTMENTS = [
  { id: "ORG-ADMIN", name: "行政后勤" },
  { id: "ORG-FINANCE", name: "财务处" },
  { id: "ORG-RECRUIT", name: "招生办" },
  { id: "ORG-SECURITY", name: "安保部" },
  { id: "ORG-HR", name: "人事处" },
];

const DEFAULT_POSITIONS = [
  { id: "POS-TEACHER", code: "TCH-01", name: "任课教师", series: "teacher" },
  { id: "POS-TEACHER-LEAD", code: "TCH-02", name: "教研组长", series: "teacher" },
  { id: "POS-GRADE-LEAD", code: "TCH-03", name: "年级组长", series: "teacher" },
  { id: "POS-ADMIN-STAFF", code: "ADM-01", name: "行政专员", series: "admin" },
  { id: "POS-FINANCE-STAFF", code: "ADM-02", name: "会计", series: "admin" },
  { id: "POS-HR-STAFF", code: "ADM-03", name: "人事专员", series: "admin" },
  { id: "POS-RECRUIT-STAFF", code: "REC-01", name: "招生专员", series: "recruit" },
  { id: "POS-SECURITY-STAFF", code: "SEC-01", name: "安保队员", series: "security" },
  { id: "POS-LOGISTICS-STAFF", code: "LOG-01", name: "后勤员工", series: "logistics" },
];

// 幂等回填：组织树、岗位、默认模板、teachers → employees。返回是否有变化。
export function ensureHrData(db) {
  ensureCollections(db);
  let changed = false;
  const now = nowIso();

  if (!db.orgUnits.some((unit) => unit.type === "school")) {
    db.orgUnits.push({
      id: "ORG-ROOT",
      parentId: "",
      type: "school",
      name: "总校",
      stageId: "",
      displayOrder: 0,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    changed = true;
  }
  (db.stages || []).forEach((stage, index) => {
    const id = `ORG-STAGE-${stage.id}`;
    if (!db.orgUnits.some((unit) => unit.id === id || (unit.type === "division" && unit.stageId === stage.id))) {
      db.orgUnits.push({
        id,
        parentId: "ORG-ROOT",
        type: "division",
        name: stage.name,
        stageId: stage.id,
        displayOrder: index + 1,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      changed = true;
    }
  });
  DEFAULT_DEPARTMENTS.forEach((department, index) => {
    if (!db.orgUnits.some((unit) => unit.id === department.id)) {
      db.orgUnits.push({
        id: department.id,
        parentId: "ORG-ROOT",
        type: "department",
        name: department.name,
        stageId: "",
        displayOrder: 10 + index,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      changed = true;
    }
  });

  DEFAULT_POSITIONS.forEach((template) => {
    if (!db.positions.some((position) => position.id === template.id || position.code === template.code)) {
      db.positions.push({ ...template, status: "active", createdAt: now, updatedAt: now });
      changed = true;
    }
  });

  if (!db.salaryTemplates.some((template) => template.id === "TPL-TEACHER-STD")) {
    db.salaryTemplates.push({
      id: "TPL-TEACHER-STD",
      positionId: "POS-TEACHER",
      name: "专任教师标准模板",
      status: "active",
      createdAt: now,
    });
    db.salaryTemplateVersions.push({
      id: "TPLV-TEACHER-STD-1",
      templateId: "TPL-TEACHER-STD",
      version: 1,
      payload: defaultTeacherSalaryProfile({}),
      effectiveFrom: now.slice(0, 10),
      createdBy: "",
      createdAt: now,
    });
    changed = true;
  }

  // teachers → employees 回填（敏感字段留空，不需要加密密钥）
  const employeesByTeacherId = new Set(db.employees.map((employee) => employee.teacherId).filter(Boolean));
  const divisionByStageId = new Map(
    db.orgUnits.filter((unit) => unit.type === "division" && unit.stageId).map((unit) => [unit.stageId, unit.id]),
  );
  (db.teachers || []).forEach((teacher) => {
    if (employeesByTeacherId.has(teacher.id)) return;
    db.employees.push({
      id: `EMP-${teacher.id}`,
      employeeNo: teacher.employeeNo || `EMP-${teacher.id}`,
      personName: teacher.name,
      gender: "",
      birthDate: "",
      idCardEncrypted: "",
      idCardMasked: "",
      phone: teacher.phone || "",
      emergencyContact: "",
      emergencyPhone: "",
      bankCardEncrypted: "",
      bankCardMasked: "",
      orgUnitId: divisionByStageId.get(teacher.stageId) || "ORG-ROOT",
      positionId: "POS-TEACHER",
      reportsTo: "",
      teacherId: teacher.id,
      status: teacher.status === "active" ? "active" : "suspended",
      hiredAt: teacher.hiredAt || "",
      regularizedAt: "",
      leftAt: "",
      salaryTemplateId: "",
      salaryTemplateVer: 0,
      createdAt: now,
      updatedAt: now,
    });
    changed = true;
  });

  if (changed) db.meta.updatedAt = now;
  return changed;
}

export function seedHrData(db) {
  ensureHrData(db);
  return db;
}

// ===========================================================================
// M3：人事审批流引擎（入职 / 调岗 / 离职，步骤表驱动，两级链）
// M4：人事状态 × 业务联动单一入口 + 学部负责人 scope
// ===========================================================================

import { hashPassword } from "./auth.js";

// 审批链定义：approverRoles 允许处理该步骤的角色；scope 限定学部负责人只能处理
// 本学部相关步骤（from=原学部 / to=目标学部）。hr 与总校管理员可代理任何学部步骤，
// 覆盖非教学部门（行政后勤等）没有学部负责人的情况。
export const HR_FLOW_DEFINITIONS = {
  onboard: {
    label: "入职",
    steps: [
      { name: "人事补全确认", approverRoles: ["hr", "system_admin"] },
      { name: "总校审批", approverRoles: ["system_admin"] },
    ],
  },
  transfer: {
    label: "调岗",
    steps: [
      { name: "原学部确认", approverRoles: ["division_head", "hr", "system_admin"], scope: "from" },
      { name: "目标学部确认", approverRoles: ["division_head", "hr", "system_admin"], scope: "to" },
      { name: "总校审批", approverRoles: ["system_admin"] },
    ],
  },
  offboard: {
    label: "离职",
    steps: [
      { name: "学部确认", approverRoles: ["division_head", "hr", "system_admin"], scope: "from" },
      { name: "总校审批", approverRoles: ["system_admin"] },
    ],
  },
  profile_update: {
    label: "档案变更",
    steps: [{ name: "人事专员审核", approverRoles: ["hr", "system_admin"] }],
  },
};

export const HR_FLOW_TIMEOUT_WORKDAYS = 3;

function pushHrNotification(db, { audience = "hr", teacherIds = [], title, text, level = "info" }) {
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.push({
    id: nextId("NTF-HR"),
    audience,
    teacherIds,
    accountIds: [],
    title: String(title || "").trim(),
    text: String(text || "").trim(),
    source: "人事处",
    level,
    createdAt: nowIso(),
    createdByAccountId: "SYSTEM",
    createdByName: "人事流程",
    readByAccountIds: [],
    readReceipts: {},
  });
}

function orgUnitStageId(db, orgUnitId) {
  const unit = findOrgUnit(db, orgUnitId);
  if (!unit) return "";
  if (unit.stageId) return unit.stageId;
  // 年级组等子节点向上找学部
  let current = unit;
  const guard = new Set();
  while (current?.parentId && !guard.has(current.parentId)) {
    guard.add(current.parentId);
    current = findOrgUnit(db, current.parentId);
    if (current?.stageId) return current.stageId;
  }
  return "";
}

// 学部负责人的数据范围：scopeStageIds → 组织节点集合（学部 division 及其子树）
export function hrScopeFor(db, account) {
  if (!account || account.role !== "division_head") return null;
  const stageIds = new Set(
    Array.isArray(account.scopeStageIds) ? account.scopeStageIds.map(String) : [],
  );
  const orgUnitIds = new Set();
  db.orgUnits
    .filter((unit) => unit.type === "division" && stageIds.has(unit.stageId))
    .forEach((unit) => {
      orgUnitIds.add(unit.id);
      orgUnitDescendantIds(db, unit.id).forEach((id) => orgUnitIds.add(id));
    });
  return { stageIds, orgUnitIds };
}

export function assertEmployeeInScope(db, account, employee) {
  const scope = hrScopeFor(db, account);
  if (!scope) return;
  if (!employee || !scope.orgUnitIds.has(employee.orgUnitId)) {
    throw httpError(403, "只能访问本学部人员数据");
  }
}

function canActOnFlowStep(db, account, flow, stepDef) {
  if (!account || !stepDef) return false;
  if (!stepDef.approverRoles.includes(account.role)) return false;
  if (account.role === "division_head" && stepDef.scope) {
    const stageId = stepDef.scope === "to" ? flow.payload.toStageId : flow.payload.fromStageId;
    const scope = hrScopeFor(db, account);
    // 非教学部门流程没有学部归属，学部负责人不处理，交由 hr/总校
    if (!stageId) return false;
    return Boolean(scope?.stageIds.has(stageId));
  }
  return true;
}

function activeFlowFor(db, employeeId, flowTypes) {
  return db.hrFlows.find(
    (flow) => flowTypes.includes(flow.flowType) && flow.employeeId === employeeId && flow.status === "pending",
  );
}

function createFlowSteps(db, flow, definition) {
  definition.steps.forEach((stepDef, index) => {
    db.hrFlowSteps.push({
      id: nextId("FLOWSTEP"),
      flowId: flow.id,
      stepIndex: index,
      stepName: stepDef.name,
      actorId: "",
      action: "",
      comment: "",
      actedAt: "",
    });
  });
}

// ---- 发起 ----

export function createHrFlow(db, account, input = {}, context = {}) {
  ensureCollections(db);
  const flowType = String(input.flowType || "").trim();
  const definition = HR_FLOW_DEFINITIONS[flowType];
  if (!definition || flowType === "profile_update") {
    throw httpError(400, `流程类型无效：${flowType}`);
  }
  if (!["division_head", "hr", "system_admin"].includes(account?.role || "")) {
    throw httpError(403, "只有学部负责人、人事专员或总校管理员可以发起人事流程");
  }
  const reason = requireReason(input.reason, `发起${definition.label}流程`);
  const now = nowIso();
  let payload = { reason };
  let employeeId = "";

  if (flowType === "onboard") {
    const personName = String(input.personName || "").trim();
    if (!personName) throw httpError(400, "拟入职人姓名不能为空");
    const orgUnit = findOrgUnit(db, String(input.orgUnitId || "").trim());
    if (!orgUnit || orgUnit.status !== "active") throw httpError(400, "必须选择有效的组织节点");
    const position = findPosition(db, String(input.positionId || "").trim());
    if (!position || position.status !== "active") throw httpError(400, "必须选择有效的岗位");
    const stageId = orgUnitStageId(db, orgUnit.id);
    if (account.role === "division_head") {
      const scope = hrScopeFor(db, account);
      if (!stageId || !scope.stageIds.has(stageId)) {
        throw httpError(403, "学部负责人只能为本学部发起入职");
      }
    }
    if (position.series === "teacher") {
      if (!stageId) throw httpError(400, "教师岗位必须挂在教学学部下");
      const subject = (db.subjects || []).find((item) => item.id === String(input.primarySubjectId || ""));
      if (!subject) throw httpError(400, "教师岗位必须指定任教学科");
    }
    payload = {
      ...payload,
      personName,
      gender: String(input.gender || ""),
      phone: String(input.phone || ""),
      idCard: String(input.idCard || ""),
      orgUnitId: orgUnit.id,
      orgUnitName: orgUnit.name,
      positionId: position.id,
      positionName: position.name,
      positionSeries: position.series,
      primarySubjectId: String(input.primarySubjectId || ""),
      hiredAt: String(input.hiredAt || now.slice(0, 10)),
      employeeNo: String(input.employeeNo || ""),
      fromStageId: "",
      toStageId: stageId,
    };
  } else {
    const employee =
      findEmployee(db, String(input.employeeId || "").trim()) ||
      db.employees.find((item) => item.employeeNo === String(input.employeeNo || "").trim());
    if (!employee) throw httpError(404, "档案不存在（可按档案 ID 或工号指定）");
    if (employee.status === "left") throw httpError(409, "已离职人员不能发起该流程");
    if (activeFlowFor(db, employee.id, ["transfer", "offboard"])) {
      throw httpError(409, "该人员已有进行中的调岗/离职流程");
    }
    assertEmployeeInScope(db, account, employee);
    employeeId = employee.id;
    const fromStageId = orgUnitStageId(db, employee.orgUnitId);
    const effectiveDate = String(input.effectiveDate || "").trim();
    if (!effectiveDate) throw httpError(400, "必须填写生效日期");

    if (flowType === "transfer") {
      const targetUnit = findOrgUnit(db, String(input.targetOrgUnitId || "").trim());
      if (!targetUnit || targetUnit.status !== "active") throw httpError(400, "必须选择有效的目标组织节点");
      if (targetUnit.id === employee.orgUnitId) throw httpError(400, "目标节点与当前相同");
      const targetPosition = findPosition(db, String(input.targetPositionId || employee.positionId));
      if (!targetPosition || targetPosition.status !== "active") throw httpError(400, "目标岗位无效");
      payload = {
        ...payload,
        employeeName: employee.personName,
        fromOrgUnitId: employee.orgUnitId,
        fromOrgUnitName: findOrgUnit(db, employee.orgUnitId)?.name || "",
        targetOrgUnitId: targetUnit.id,
        targetOrgUnitName: targetUnit.name,
        targetPositionId: targetPosition.id,
        targetPositionName: targetPosition.name,
        effectiveDate,
        fromStageId,
        toStageId: orgUnitStageId(db, targetUnit.id),
        priorStatus: employee.status,
      };
      employee.status = "transferring";
    } else {
      payload = {
        ...payload,
        employeeName: employee.personName,
        fromOrgUnitId: employee.orgUnitId,
        fromOrgUnitName: findOrgUnit(db, employee.orgUnitId)?.name || "",
        effectiveDate,
        reasonCategory: String(input.reasonCategory || "personal"),
        fromStageId,
        toStageId: "",
        priorStatus: employee.status,
      };
      employee.status = "offboarding";
    }
    employee.updatedAt = now;
  }

  const flow = {
    id: nextId("FLOW"),
    flowType,
    employeeId,
    payload,
    status: "pending",
    currentStep: 0,
    createdBy: account.id,
    createdByName: account.name || "",
    createdAt: now,
    lastActionAt: now,
    timeoutNotifiedAt: "",
    closedAt: "",
  };
  db.hrFlows.push(flow);
  createFlowSteps(db, flow, definition);
  db.meta.updatedAt = now;
  appendHrAuditLog(db, {
    actorAccount: account,
    action: `${flowType}_submit`,
    targetType: "employee",
    targetId: flow.id,
    targetEmployeeId: employeeId,
    fieldDiffs: [],
    reason,
    context,
  });
  return flow;
}

// ---- 审批 ----

function restorePriorStatus(db, flow) {
  if (!flow.employeeId) return;
  const employee = findEmployee(db, flow.employeeId);
  if (!employee) return;
  if (["transferring", "offboarding"].includes(employee.status)) {
    employee.status = flow.payload.priorStatus || "active";
    employee.updatedAt = nowIso();
  }
}

function offboardHandoverChecklist(db, employee, effectiveDate) {
  const futureLessons = (db.lessonInstances || []).filter(
    (lesson) =>
      lesson.teacherId === employee.teacherId &&
      lesson.source === "backend-scheduling" &&
      lesson.status !== "cancelled" &&
      lesson.date > effectiveDate,
  );
  const unconfirmedWorkloads = (db.workloadConfirmations || []).filter(
    (item) => item.teacherId === employee.teacherId && item.status && item.status !== "approved",
  ).length;
  const unlockedPayrolls = (db.payrollDetails || []).filter(
    (item) => item.teacherId === employee.teacherId && item.status !== "locked",
  ).length;
  return {
    futureLessonCount: futureLessons.length,
    unconfirmedWorkloads,
    unlockedPayrolls,
    sampleLessons: futureLessons.slice(0, 5).map((lesson) => `${lesson.date} ${lesson.time} ${lesson.className}`),
  };
}

function executeOnboard(db, flow, account, context) {
  const payload = flow.payload;
  const now = nowIso();
  let teacherId = "";

  if (payload.positionSeries === "teacher") {
    const nextNumber =
      (db.teachers || []).reduce((max, teacher) => {
        const matched = String(teacher.id || "").match(/^T(\d+)$/);
        return matched ? Math.max(max, Number.parseInt(matched[1], 10)) : max;
      }, 0) + 1;
    teacherId = `T${String(nextNumber).padStart(4, "0")}`;
    const stage = (db.stages || []).find((item) => item.id === payload.toStageId);
    const subject = (db.subjects || []).find((item) => item.id === payload.primarySubjectId);
    const template = db.salaryTemplates.find(
      (item) => item.positionId === payload.positionId && item.status === "active",
    );
    const templateVersion = template
      ? db.salaryTemplateVersions
          .filter((item) => item.templateId === template.id)
          .sort((a, b) => b.version - a.version)[0]
      : null;
    const teacher = {
      id: teacherId,
      employeeNo: payload.employeeNo || `FY${String(nextNumber).padStart(4, "0")}`,
      name: payload.personName,
      stageId: payload.toStageId,
      stageName: stage?.name || payload.orgUnitName,
      department: stage?.name || payload.orgUnitName,
      primarySubjectId: payload.primarySubjectId,
      primarySubjectName: subject?.name || "",
      title: payload.positionName || "任课教师",
      phone: payload.phone,
      status: "active",
      hiredAt: payload.hiredAt,
      salaryProfile: deepMerge(defaultTeacherSalaryProfile({}), templateVersion?.payload || {}),
      source: "hr-onboard",
      createdAt: now,
    };
    db.teachers.push(teacher);
    const username = (payload.employeeNo || teacher.employeeNo).toLowerCase();
    if ((db.accounts || []).some((item) => item.username === username)) {
      throw httpError(409, `账号名已存在：${username}`);
    }
    db.accounts.push({
      id: `ACC-${teacherId}-${Date.now()}`,
      username,
      passwordHash: hashPassword("123456"),
      role: "teacher",
      teacherId,
      name: payload.personName,
      department: teacher.department,
      status: "active",
      mustChangePassword: true,
      createdAt: now,
    });
    if (db.meta) db.meta.teacherCount = db.teachers.length;
    flow.payload.result = { teacherId, username, defaultPassword: "123456" };
  }

  const employee = createEmployee(
    db,
    {
      personName: payload.personName,
      gender: payload.gender,
      phone: payload.phone,
      idCard: payload.idCard,
      employeeNo: payload.employeeNo || (teacherId ? `FY${teacherId.slice(1)}` : ""),
      orgUnitId: payload.orgUnitId,
      positionId: payload.positionId,
      teacherId,
      hiredAt: payload.hiredAt,
      status: "probation",
      reason: `入职流程 ${flow.id} 审批通过`,
    },
    account,
    context,
  );
  flow.payload.result = { ...(flow.payload.result || {}), employeeId: employee.id };

  const template = db.salaryTemplates.find(
    (item) => item.positionId === payload.positionId && item.status === "active",
  );
  if (template) {
    const version = db.salaryTemplateVersions
      .filter((item) => item.templateId === template.id)
      .sort((a, b) => b.version - a.version)[0];
    const row = findEmployee(db, employee.id);
    if (row && version) {
      row.salaryTemplateId = template.id;
      row.salaryTemplateVer = version.version;
    }
  }

  pushHrNotification(db, {
    audience: "hr",
    title: `入职生效：${payload.personName}`,
    text: `${payload.orgUnitName} · ${payload.positionName}${teacherId ? `，教师账号 ${flow.payload.result.username}（默认密码 123456，首次登录需修改）` : ""}`,
  });
}

function executeTransfer(db, flow, account, context) {
  const payload = flow.payload;
  const employee = findEmployee(db, flow.employeeId);
  if (!employee) throw httpError(404, "档案不存在");
  const before = { ...employee };
  employee.orgUnitId = payload.targetOrgUnitId;
  employee.positionId = payload.targetPositionId;
  employee.status = payload.priorStatus || "active";
  employee.updatedAt = nowIso();

  // 跨教学学部调岗：同步教学侧学部归属；生成原学部课表移交清单
  let handover = null;
  if (employee.teacherId) {
    const teacher = findTeacherRow(db, employee.teacherId);
    if (teacher && payload.toStageId && payload.toStageId !== payload.fromStageId) {
      const stage = (db.stages || []).find((item) => item.id === payload.toStageId);
      teacher.stageId = payload.toStageId;
      teacher.stageName = stage?.name || teacher.stageName;
      teacher.department = stage?.name || teacher.department;
    }
    const futureLessons = (db.lessonInstances || []).filter(
      (lesson) =>
        lesson.teacherId === employee.teacherId &&
        lesson.source === "backend-scheduling" &&
        lesson.status !== "cancelled" &&
        lesson.date > payload.effectiveDate,
    );
    handover = {
      futureLessonCount: futureLessons.length,
      sampleLessons: futureLessons.slice(0, 5).map((lesson) => `${lesson.date} ${lesson.time} ${lesson.className}`),
    };
    if (futureLessons.length) {
      pushHrNotification(db, {
        audience: "admin",
        level: "warning",
        title: `调岗课表移交：${employee.personName}`,
        text: `生效日 ${payload.effectiveDate} 之后原学部还有 ${futureLessons.length} 节已发布课程需要调课或换师处理。`,
      });
    }
  }
  flow.payload.handover = handover;

  // 新岗位有绑定模板时自动切换（金额生效走教师工资档案深合并）
  const template = db.salaryTemplates.find(
    (item) => item.positionId === payload.targetPositionId && item.status === "active",
  );
  if (template) {
    const version = db.salaryTemplateVersions
      .filter((item) => item.templateId === template.id)
      .sort((a, b) => b.version - a.version)[0];
    if (version) {
      employee.salaryTemplateId = template.id;
      employee.salaryTemplateVer = version.version;
      if (employee.teacherId) {
        const teacher = findTeacherRow(db, employee.teacherId);
        if (teacher) teacher.salaryProfile = deepMerge(teacher.salaryProfile || {}, version.payload);
      }
    }
  }

  appendHrAuditLog(db, {
    actorAccount: account,
    action: "employee_update",
    targetType: "employee",
    targetId: employee.id,
    targetEmployeeId: employee.id,
    fieldDiffs: computeFieldDiffs(before, employee, ["orgUnitId", "positionId", "status"]),
    reason: `调岗流程 ${flow.id} 生效（${payload.effectiveDate}）`,
    context,
  });
}

function executeOffboard(db, flow, account, context) {
  const payload = flow.payload;
  const employee = findEmployee(db, flow.employeeId);
  if (!employee) throw httpError(404, "档案不存在");
  const handover = offboardHandoverChecklist(db, employee, payload.effectiveDate);
  flow.payload.handover = handover;

  // 先恢复为在职再走统一状态入口，保证审计与镜像逻辑单点
  employee.status = payload.priorStatus || "active";
  setEmployeeStatus(db, employee.id, "left", `离职流程 ${flow.id} 生效`, account, {
    ...context,
    effectiveDate: payload.effectiveDate,
  });

  // 生效日之后的已发布课次自动取消并提醒行政
  let cancelled = 0;
  if (employee.teacherId) {
    (db.lessonInstances || []).forEach((lesson) => {
      if (
        lesson.teacherId === employee.teacherId &&
        lesson.source === "backend-scheduling" &&
        lesson.status !== "cancelled" &&
        lesson.date > payload.effectiveDate
      ) {
        lesson.status = "cancelled";
        lesson.attendanceNote = `离职流程 ${flow.id} 自动取消`;
        cancelled += 1;
      }
    });
  }
  flow.payload.cancelledLessonCount = cancelled;
  if (cancelled || handover.futureLessonCount) {
    pushHrNotification(db, {
      audience: "admin",
      level: "warning",
      title: `离职生效：${employee.personName}`,
      text: `生效日 ${payload.effectiveDate}，已自动取消之后的 ${cancelled} 节课，请安排补位老师并重新发布相关课表。`,
    });
  }
}

export function approveHrFlowStep(db, flowId, action, comment, account, context = {}) {
  ensureCollections(db);
  const flow = db.hrFlows.find((item) => item.id === flowId);
  if (!flow) throw httpError(404, "流程不存在");
  if (flow.flowType === "profile_update") {
    return reviewProfileChangeRequest(db, flowId, action, comment, account, context);
  }
  if (flow.status !== "pending") throw httpError(409, "该流程已处理完毕");
  const definition = HR_FLOW_DEFINITIONS[flow.flowType];
  const stepDef = definition.steps[flow.currentStep];
  if (!canActOnFlowStep(db, account, flow, stepDef)) {
    throw httpError(403, `当前步骤（${stepDef.name}）不在您的处理范围内`);
  }
  if (!["approve", "reject"].includes(action)) throw httpError(400, "审批动作只能是 approve 或 reject");
  if (action === "reject" && !String(comment || "").trim()) throw httpError(400, "拒绝时必须填写意见");

  const now = nowIso();
  const step = db.hrFlowSteps.find((item) => item.flowId === flow.id && item.stepIndex === flow.currentStep);
  if (step) {
    step.actorId = account.id;
    step.action = action;
    step.comment = String(comment || "");
    step.actedAt = now;
  }
  flow.lastActionAt = now;
  flow.timeoutNotifiedAt = "";

  if (action === "reject") {
    flow.status = "rejected";
    flow.closedAt = now;
    restorePriorStatus(db, flow);
    appendHrAuditLog(db, {
      actorAccount: account,
      action: `${flow.flowType}_reject`,
      targetType: "employee",
      targetId: flow.id,
      targetEmployeeId: flow.employeeId,
      fieldDiffs: [],
      reason: String(comment || ""),
      context,
    });
    db.meta.updatedAt = now;
    return flow;
  }

  if (flow.currentStep < definition.steps.length - 1) {
    flow.currentStep += 1;
    appendHrAuditLog(db, {
      actorAccount: account,
      action: `${flow.flowType}_approve_step`,
      targetType: "employee",
      targetId: flow.id,
      targetEmployeeId: flow.employeeId,
      fieldDiffs: [],
      reason: `${stepDef.name} 通过：${String(comment || "")}`,
      context,
    });
    db.meta.updatedAt = now;
    return flow;
  }

  // 终审通过：执行流程效果
  flow.status = "approved";
  flow.closedAt = now;
  if (flow.flowType === "onboard") executeOnboard(db, flow, account, context);
  if (flow.flowType === "transfer") executeTransfer(db, flow, account, context);
  if (flow.flowType === "offboard") executeOffboard(db, flow, account, context);
  appendHrAuditLog(db, {
    actorAccount: account,
    action: `${flow.flowType}_approve`,
    targetType: "employee",
    targetId: flow.id,
    targetEmployeeId: flow.employeeId || flow.payload.result?.employeeId || "",
    fieldDiffs: [],
    reason: `终审通过：${String(comment || "")}`,
    context,
  });
  db.meta.updatedAt = now;
  return flow;
}

export function withdrawHrFlow(db, flowId, account) {
  ensureCollections(db);
  const flow = db.hrFlows.find((item) => item.id === flowId);
  if (!flow) throw httpError(404, "流程不存在");
  if (flow.flowType === "profile_update") return withdrawProfileChangeRequest(db, flowId, account);
  if (flow.status !== "pending") throw httpError(409, "只有进行中的流程可以撤回");
  if (flow.createdBy !== account.id && account.role !== "system_admin") {
    throw httpError(403, "只能撤回本人发起的流程");
  }
  flow.status = "withdrawn";
  flow.closedAt = nowIso();
  restorePriorStatus(db, flow);
  appendHrAuditLog(db, {
    actorAccount: account,
    action: `${flow.flowType}_withdraw`,
    targetType: "employee",
    targetId: flow.id,
    targetEmployeeId: flow.employeeId,
    fieldDiffs: [],
    reason: "发起人撤回",
  });
  db.meta.updatedAt = flow.closedAt;
  return flow;
}

export function queryHrFlows(db, query = {}, account = null) {
  ensureCollections(db);
  const status = String(query.status || "").trim();
  const flowType = String(query.flowType || "").trim();
  const todoOnly = String(query.todo || "") === "1";
  const scope = hrScopeFor(db, account);

  return db.hrFlows
    .filter((flow) => flow.flowType !== "profile_update")
    .filter((flow) => (status ? flow.status === status : true))
    .filter((flow) => (flowType ? flow.flowType === flowType : true))
    .filter((flow) => {
      if (!scope) return true;
      // 学部负责人可见：与本学部相关（原/目标学部在 scope）或本人发起
      return (
        flow.createdBy === account.id ||
        scope.stageIds.has(flow.payload.fromStageId || "") ||
        scope.stageIds.has(flow.payload.toStageId || "")
      );
    })
    .filter((flow) => {
      if (!todoOnly) return true;
      if (flow.status !== "pending") return false;
      const definition = HR_FLOW_DEFINITIONS[flow.flowType];
      return canActOnFlowStep(db, account, flow, definition.steps[flow.currentStep]);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((flow) => {
      const definition = HR_FLOW_DEFINITIONS[flow.flowType];
      const stepDef = flow.status === "pending" ? definition.steps[flow.currentStep] : null;
      return {
        ...flow,
        flowLabel: definition.label,
        currentStepName: stepDef?.name || "",
        canAct: flow.status === "pending" && canActOnFlowStep(db, account, flow, stepDef),
        canWithdraw: flow.status === "pending" && (flow.createdBy === account?.id || account?.role === "system_admin"),
        steps: db.hrFlowSteps
          .filter((step) => step.flowId === flow.id)
          .sort((a, b) => a.stepIndex - b.stepIndex),
      };
    });
}

export function countHrTodos(db, account) {
  return queryHrFlows(db, { todo: "1" }, account).length;
}

function addWorkdays(startIso, workdays) {
  const date = new Date(startIso);
  let added = 0;
  while (added < workdays) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date;
}

// 审批停留超过 3 个工作日：提醒当前步骤处理方与发起人（每次停留只提醒一次）
export function scanHrFlowTimeouts(db, { now = new Date() } = {}) {
  ensureCollections(db);
  let notified = 0;
  db.hrFlows
    .filter((flow) => flow.status === "pending" && flow.flowType !== "profile_update")
    .forEach((flow) => {
      if (flow.timeoutNotifiedAt) return;
      const deadline = addWorkdays(flow.lastActionAt || flow.createdAt, HR_FLOW_TIMEOUT_WORKDAYS);
      if (now.getTime() <= deadline.getTime()) return;
      const definition = HR_FLOW_DEFINITIONS[flow.flowType];
      const stepDef = definition.steps[flow.currentStep];
      pushHrNotification(db, {
        audience: "hr",
        level: "warning",
        title: `审批超时提醒：${definition.label}流程`,
        text: `流程 ${flow.id}（${flow.payload.personName || flow.payload.employeeName || ""}）在「${stepDef.name}」已停留超过 ${HR_FLOW_TIMEOUT_WORKDAYS} 个工作日，请尽快处理。`,
      });
      flow.timeoutNotifiedAt = nowIso();
      notified += 1;
    });
  if (notified) db.meta.updatedAt = nowIso();
  return notified;
}

// ===========================================================================
// M4：人事状态 × 业务联动单一入口（PRD 4.5 矩阵）
// ===========================================================================

export function employeeByTeacherId(db, teacherId) {
  ensureCollections(db);
  return db.employees.find((employee) => employee.teacherId === teacherId) || null;
}

// 唯一联动判定入口：登录 / 任课池 / 签到 / 计薪 都从这里读，禁止散落 if
export function teacherEligibility(db, teacherId) {
  const employee = employeeByTeacherId(db, teacherId);
  if (!employee) {
    // 无档案（历史数据或纯演示账号）按在职处理，保持一阶段兼容
    return {
      status: "active",
      canLogin: true,
      inTeachingPool: true,
      canAttend: true,
      payroll: "normal",
      leftAt: "",
    };
  }
  const status = employee.status;
  return {
    status,
    leftAt: employee.leftAt || "",
    canLogin: !["left", "suspended", "pending_onboard"].includes(status),
    // 离职中冻结新增排课；已离职/停用/待入职不进任课池
    inTeachingPool: !["left", "suspended", "pending_onboard", "offboarding"].includes(status),
    canAttend: !["left", "suspended", "pending_onboard"].includes(status),
    // normal 正常 / frozen 冻结需人工裁定 / until-left 截止离职日 / blocked 不计薪
    payroll:
      status === "suspended"
        ? "frozen"
        : status === "left"
          ? "until-left"
          : status === "pending_onboard"
            ? "blocked"
            : "normal",
  };
}
