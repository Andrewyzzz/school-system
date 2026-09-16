// ---------------------------------------------------------------------------
// 通用审批（OA）引擎
//
// 设计要点：模板驱动，不为每类审批写死代码。
//   模板 = 表单字段定义 + 审批步骤定义 + 可发起角色
//   新增审批类型只需增加模板（可由代码内置或后续做成可配置），不改流转逻辑。
//
// 与人事流程（server/hr.js）的分工：
//   人事流程承载入职/调岗/离职这类"审批通过后要改人事状态并联动排课计薪"的业务链路；
//   本模块承载请假、加班、补卡、调课以及学期初各类确认事项等通用审批，审批结果本身即为结论。
// ---------------------------------------------------------------------------

// budget.js 只依赖 financeScope.js（两者都不反向依赖本模块），直接引入不构成循环
import {
  BUDGET_SCOPES,
  applyTermBudgetScopeFromApproval,
  applyTermBudgetUsageFromApproval,
  ensureBudgetStore,
} from "./budget.js";
import { FINANCE_SCOPE_IDS, financeScopeFor, financeScopeLabel, payrollScopeOfTeacher } from "./financeScope.js";

// 每张学部预算单只交给对应学部主任复核；不能让同为“学部主任”的其他三人处理。
const DIVISION_HEAD_ACCOUNT_BY_BUDGET_SCOPE = {
  kindergarten: "ACC-HEAD-KINDERGARTEN",
  primary: "ACC-HEAD-PRIMARY",
  middle: "ACC-HEAD-MIDDLE",
  high: "ACC-HEAD-HIGH",
};

function divisionHeadAccountIdForBudgetScope(scopeId) {
  return DIVISION_HEAD_ACCOUNT_BY_BUDGET_SCOPE[String(scopeId || "")] || "";
}

function isHeadquartersFinance(account) {
  return Boolean(
    account?.role === "finance" && financeScopeFor(account) === "headquarters" && account.financeReadAll,
  );
}

function divisionBudgetScopeForAccount(account) {
  if (account?.role !== "division_head") {
    throw httpError(403, "只有学部主任可以发起本学部预算使用申请");
  }
  const scopes = Array.isArray(account.scopeStageIds) ? account.scopeStageIds.map(String) : [];
  const scope = scopes.length === 1 ? scopes[0] : "";
  if (!FINANCE_SCOPE_IDS.includes(scope) || scope === "headquarters") {
    throw httpError(400, "当前账号未配置唯一的学部范围，无法确定预算归属");
  }
  return scope;
}

// 月度工资确认只能由对应学部的财务发起。总校财务是最后的执行人，
// 不能反过来替学部发起或把行政后勤混进教学学部工资确认单。
function divisionPayrollScopeForAccount(account) {
  if (account?.role !== "finance") {
    throw httpError(403, "只有学部财务可以发起月度工资确认");
  }
  const scope = financeScopeFor(account);
  if (!FINANCE_SCOPE_IDS.includes(scope) || scope === "headquarters") {
    throw httpError(403, "总校财务负责执行发放，月度工资确认应由对应学部财务发起");
  }
  return scope;
}

// 班级人数确认只能归属发起主任所辖的唯一学部。学部名称只是展示冗余，
// 真实范围始终以 stageId 为准，不能由浏览器传入其他学部。
function classSizeStageForAccount(account) {
  if (account?.role !== "division_head") {
    throw httpError(403, "只有学部主任可以发起班级学生人数确认");
  }
  const scopes = Array.isArray(account.scopeStageIds) ? account.scopeStageIds.map(String) : [];
  const stageId = scopes.length === 1 ? scopes[0] : "";
  if (!FINANCE_SCOPE_IDS.includes(stageId) || stageId === "headquarters") {
    throw httpError(400, "当前账号未配置唯一的学部范围，无法确定班级人数归属");
  }
  return stageId;
}

// 批量加班单只能由拥有一个明确学部范围的主任发起。范围不能来自浏览器，
// 否则小学主任可以伪造请求把初中老师放进同一张加班单。
function overtimeBatchStageForAccount(account) {
  if (account?.role !== "division_head") {
    throw httpError(403, "只有学部主任可以发起批量加班申请");
  }
  const scopes = Array.isArray(account.scopeStageIds) ? account.scopeStageIds.map(String) : [];
  const stageId = scopes.length === 1 ? scopes[0] : "";
  if (!FINANCE_SCOPE_IDS.includes(stageId) || stageId === "headquarters") {
    throw httpError(400, "当前账号未配置唯一的学部范围，无法发起批量加班申请");
  }
  return stageId;
}

function overtimeBatchStaffForStage(db, stageId) {
  return (db.teachers || [])
    .filter((teacher) => teacher.status === "active" && teacher.stageId === stageId)
    .map((teacher) => ({
      teacherId: teacher.id,
      name: teacher.name || teacher.id,
      employeeNo: teacher.employeeNo || "",
      subjectName: teacher.primarySubjectName || teacher.subject || teacher.title || "教师",
      stageId,
      stageName: financeScopeLabel(stageId),
    }))
    .sort((a, b) => `${a.employeeNo} ${a.name}`.localeCompare(`${b.employeeNo} ${b.name}`, "zh-Hans-CN"));
}

// 给批量申请对话框提供已按当前主任权限过滤的候选人；路由层不能返回全校名单。
export function listOvertimeBatchStaffOptions(db, account) {
  ensureCollections(db);
  const stageId = overtimeBatchStageForAccount(account);
  return {
    stageId,
    stageName: financeScopeLabel(stageId),
    staff: overtimeBatchStaffForStage(db, stageId),
  };
}

// 班级人数确认不是一段自由文本。班级、班主任和生活老师候选人都由服务端按
// “当前主任所辖学部 + 已选择学期”给出，提交时再次逐项核验，避免前端把其他
// 学部的人或已离职人员塞进确认单。班级结构本身由排课端维护；确认单只是把本
// 学期的实际人数与任命冻结下来，供薪资读取。
function activeTeachersForClassSize(db, stageId) {
  const employeesByTeacherId = new Map((db.employees || []).map((item) => [item.teacherId, item]));
  return (db.teachers || [])
    .filter((teacher) => {
      if (teacher.stageId !== stageId || teacher.status !== "active") return false;
      const employee = employeesByTeacherId.get(teacher.id);
      return !employee || !["left", "disabled", "terminated"].includes(String(employee.status || "").toLowerCase());
    })
    .map((teacher) => ({ teacher, employee: employeesByTeacherId.get(teacher.id) || null }));
}

function isLifeTeacherCandidate(item) {
  return (
    String(item?.employee?.positionId || "") === "POS-LIFE-TEACHER" ||
    String(item?.teacher?.salaryProfile?.salaryCategory || "") === "lifeTeacher"
  );
}

function classSizeClassesForTermStage(db, termId, stageId) {
  return (db.classes || [])
    .filter((item) => item.stageId === stageId && item.active !== false && (!item.termId || item.termId === termId))
    .slice()
    .sort(
      (left, right) =>
        Number(left.grade || 0) - Number(right.grade || 0) ||
        Number(left.displayOrder || 0) - Number(right.displayOrder || 0) ||
        String(left.name || left.id).localeCompare(String(right.name || right.id), "zh-Hans-CN"),
    );
}

function classSizeTeacherOption(item) {
  const teacher = item.teacher;
  return {
    teacherId: teacher.id,
    name: teacher.name || teacher.id,
    employeeNo: teacher.employeeNo || "",
    subjectName: teacher.primarySubjectName || teacher.subject || teacher.title || "教师",
    positionName: item.employee?.positionName || item.employee?.position || "",
  };
}

function existingClassSizeConfirmation(db, termId, stageId) {
  return (db.classSizeConfirmations || [])
    .filter((item) => item.termId === termId && item.stageId === stageId)
    .sort((left, right) => String(right.approvedAt || right.updatedAt || "").localeCompare(String(left.approvedAt || left.updatedAt || "")))[0] || null;
}

export function listClassSizeConfirmationOptions(db, account, options = {}) {
  ensureCollections(db);
  const stageId = classSizeStageForAccount(account);
  const termId = String(options.termId || "").trim();
  const term = (db.terms || []).find((item) => item.id === termId);
  if (!term) throw httpError(400, "请选择系统中已建立的正式学期");
  const prior = existingClassSizeConfirmation(db, termId, stageId);
  const allStaff = activeTeachersForClassSize(db, stageId);
  const homeroomTeachers = allStaff.filter((item) => !isLifeTeacherCandidate(item)).map(classSizeTeacherOption);
  const lifeTeachers = allStaff.filter(isLifeTeacherCandidate).map(classSizeTeacherOption);
  const priorClasses = new Map((prior?.classConfirmations || []).map((item) => [item.classId, item]));
  const priorLifeTeachers = new Map((prior?.lifeTeacherAssignments || []).map((item) => [item.teacherId, item]));
  return {
    term: { id: term.id, name: term.name, schoolYear: term.schoolYear || "" },
    stageId,
    stageName: financeScopeLabel(stageId),
    classes: classSizeClassesForTermStage(db, term.id, stageId).map((item) => {
      const saved = priorClasses.get(item.id);
      return {
        classId: item.id,
        className: item.name || item.id,
        grade: item.grade || "",
        studentCount: Number(saved?.studentCount ?? item.studentCount ?? 0),
        homeroomTeacherId: saved?.homeroomTeacherId || item.homeroomTeacherId || "",
      };
    }),
    homeroomTeachers,
    lifeTeachers: lifeTeachers.map((item) => ({
      ...item,
      studentCount: Number(priorLifeTeachers.get(item.teacherId)?.studentCount || 0),
    })),
    priorConfirmation: prior
      ? { approvedAt: prior.approvedAt || "", sourceRequestId: prior.sourceRequestId || "", version: Number(prior.version || 1) }
      : null,
  };
}

function prepareClassSizeConfirmationFormData(db, account, formData) {
  const stageId = classSizeStageForAccount(account);
  const termId = String(formData.termId || "").trim();
  const term = (db.terms || []).find((item) => item.id === termId);
  if (!term) throw httpError(400, "请选择系统中已建立的正式学期");
  const classes = classSizeClassesForTermStage(db, term.id, stageId);
  if (!classes.length) throw httpError(409, "该学部当前学期尚未建立班级，不能确认学生人数");
  const allStaff = activeTeachersForClassSize(db, stageId);
  const homeroomTeachers = new Map(allStaff.filter((item) => !isLifeTeacherCandidate(item)).map((item) => [item.teacher.id, item]));
  const lifeTeachers = new Map(allStaff.filter(isLifeTeacherCandidate).map((item) => [item.teacher.id, item]));
  const submittedClasses = Array.isArray(formData.classConfirmations) ? formData.classConfirmations : [];
  const byClassId = new Map();
  submittedClasses.forEach((raw) => {
    const classId = String(raw?.classId || "").trim();
    if (classId) byClassId.set(classId, raw);
  });
  if (byClassId.size !== classes.length || classes.some((item) => !byClassId.has(item.id))) {
    throw httpError(400, "请逐一填写本学部所有班级的人数并选择班主任");
  }
  const normalizedClasses = classes.map((item) => {
    const raw = byClassId.get(item.id) || {};
    const studentCount = Number(raw.studentCount);
    const homeroomTeacherId = String(raw.homeroomTeacherId || "").trim();
    if (!Number.isInteger(studentCount) || studentCount < 0) {
      throw httpError(400, `「${item.name}」学生人数必须是非负整数`);
    }
    const teacher = homeroomTeachers.get(homeroomTeacherId);
    if (!teacher) throw httpError(400, `请为「${item.name}」选择本学部在职班主任`);
    return {
      classId: item.id,
      className: item.name || item.id,
      grade: item.grade || "",
      studentCount,
      homeroomTeacherId: teacher.teacher.id,
      homeroomTeacherName: teacher.teacher.name || teacher.teacher.id,
      homeroomTeacherEmployeeNo: teacher.teacher.employeeNo || "",
    };
  });
  const submittedLife = Array.isArray(formData.lifeTeacherAssignments) ? formData.lifeTeacherAssignments : [];
  const byLifeTeacherId = new Map();
  submittedLife.forEach((raw) => {
    const teacherId = String(raw?.teacherId || "").trim();
    if (teacherId) byLifeTeacherId.set(teacherId, raw);
  });
  const unknownLifeTeacherId = [...byLifeTeacherId.keys()].find((teacherId) => !lifeTeachers.has(teacherId));
  if (unknownLifeTeacherId) throw httpError(403, "生活老师必须来自本学部在职生活老师名单");
  const normalizedLife = [...lifeTeachers.values()].map((item) => {
    const studentCount = Number(byLifeTeacherId.get(item.teacher.id)?.studentCount || 0);
    if (!Number.isInteger(studentCount) || studentCount < 0) {
      throw httpError(400, `「${item.teacher.name || item.teacher.id}」负责学生数必须是非负整数`);
    }
    return {
      teacherId: item.teacher.id,
      teacherName: item.teacher.name || item.teacher.id,
      employeeNo: item.teacher.employeeNo || "",
      studentCount,
    };
  });
  const totalStudentCount = normalizedClasses.reduce((sum, item) => sum + item.studentCount, 0);
  const lifeTeacherStudentTotal = normalizedLife.reduce((sum, item) => sum + item.studentCount, 0);
  if (lifeTeacherStudentTotal > totalStudentCount) {
    throw httpError(400, `生活老师负责学生合计 ${lifeTeacherStudentTotal} 人，不能超过本学部学生总数 ${totalStudentCount} 人`);
  }
  formData.stageId = stageId;
  formData.stageName = financeScopeLabel(stageId);
  formData.classConfirmations = normalizedClasses;
  formData.lifeTeacherAssignments = normalizedLife;
  formData.totalStudentCount = totalStudentCount;
  formData.lifeTeacherStudentTotal = lifeTeacherStudentTotal;
}

function prepareOvertimeBatchFormData(db, account, formData) {
  const stageId = overtimeBatchStageForAccount(account);
  const staff = overtimeBatchStaffForStage(db, stageId);
  const byTeacherId = new Map(staff.map((item) => [item.teacherId, item]));
  const selectedIds = [...new Set((Array.isArray(formData.participantTeacherIds) ? formData.participantTeacherIds : [])
    .map((id) => String(id || "").trim())
    .filter(Boolean))];
  if (!selectedIds.length) throw httpError(400, "请至少选择一位加班人员");
  const invalidId = selectedIds.find((teacherId) => !byTeacherId.has(teacherId));
  if (invalidId) throw httpError(403, "加班人员必须是本学部在职老师，请重新选择");
  formData.stageId = stageId;
  formData.stageName = financeScopeLabel(stageId);
  formData.participantTeacherIds = selectedIds;
  formData.participantTeacherNames = selectedIds.map((teacherId) => byTeacherId.get(teacherId).name);
  formData.participantCount = selectedIds.length;
}

function httpError(statusCode, message, details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

// 审批单指定的学期：新单优先使用不可变的 termId；存量单仍可按名称或提交日期归属。
// 预算、课表、工资和审批都以 termId 关联，名称只是冗余展示字段，不能做主键。
function resolveRequestTerm(db, { termId = "", termName = "", createdAt = "" } = {}) {
  const terms = db.terms || [];
  const requestedId = String(termId || "").trim();
  const wanted = String(termName || "").trim();
  const date = String(createdAt || "").slice(0, 10);
  return (
    terms.find((item) => requestedId && item.id === requestedId) ||
    terms.find((item) => item.name === wanted) ||
    terms.find((item) => date && item.startDate <= date && date <= item.endDate) ||
    terms.find((item) => item.current) ||
    terms[0] ||
    null
  );
}

// 存量审批在升级前没有 termId。读取时按表单中的适用学期或提交日期临时归属，
// 绝不在启动时批量改写历史审批；新审批才会从创建时持久保存 termId。
function requestTermForHistory(db, request = {}) {
  return (
    (db.terms || []).find((item) => item.id === request.termId) ||
    resolveRequestTerm(db, {
      termId: request.formData?.termId,
      termName: request.formData?.termName,
      createdAt: request.createdAt,
    })
  );
}

// 整单通过后落地的业务数据。预算额度与预算使用都只在整单最终通过后写入。
function applyApprovedRequestEffects(db, request, account, actorName) {
  if (request.templateKey === "class_size_confirm") {
    const handler = sideEffectHandlers.applyClassSizeConfirmation;
    if (!handler) throw httpError(503, "班级人数确认服务暂未就绪，请稍后重试");
    request.appliedResult = handler(
      db,
      {
        requestId: request.id,
        formData: request.formData || {},
        applicantAccountId: request.applicantAccountId,
        applicantName: request.applicantName,
        actorName,
      },
      account,
    );
    return;
  }
  if (request.templateKey === "leave") {
    const handler = sideEffectHandlers.invalidateLeavePayroll;
    if (!handler) return;
    request.appliedResult = handler(
      db,
      {
        requestId: request.id,
        applicantAccountId: request.applicantAccountId,
        formData: request.formData || {},
        actorName,
      },
      account,
    );
    return;
  }
  if (request.templateKey === "payroll_approval") {
    applyPayrollApprovalEffect(db, request, account, actorName);
    return;
  }
  if (request.templateKey === "ledger_unlock") {
    applyLedgerUnlockEffect(db, request, account, actorName);
    return;
  }
  if (request.templateKey === "budget_confirm") {
    const term = requestTermForHistory(db, request);
    if (!term) return;
    const written = applyTermBudgetScopeFromApproval(db, {
      termId: term.id,
      termName: term.name,
      scopeId: request.formData?.budgetScope,
      amount: request.formData?.amount,
      requestId: request.id,
      actorName,
    });
    request.appliedResult = {
      type: "term_budget",
      termId: term.id,
      termName: term.name,
      scopes: [{ scope: written.scope, scopeName: written.scopeName, amount: written.amount }],
    };
    return;
  }
  if (request.templateKey === "division_budget_use") {
    const term = requestTermForHistory(db, request);
    if (!term) return;
    const entry = applyTermBudgetUsageFromApproval(db, {
      termId: term.id,
      termName: term.name,
      scopeId: request.formData?.budgetScope,
      amount: request.formData?.amount,
      purpose: request.formData?.purpose,
      requestId: request.id,
      applicantName: request.applicantName,
      actorName,
    });
    request.appliedResult = {
      type: "division_budget_usage",
      termId: term.id,
      termName: term.name,
      scope: entry.scope,
      scopeName: entry.scopeName,
      amount: entry.amount,
      usageEntryId: entry.id,
    };
  }
}

// 账套解锁审批通过 → 真的把账套解开（验收 8.10）
//
// 解锁只能走这条路：账套接口上**没有**直接解锁的动作，界面上也不画解锁按钮。
// 谁锁的谁就能解开，锁定就形同虚设——而锁定的意义正是「这个月的账定案了」。
const LEDGER_TYPE_BY_LABEL = {
  人事账套: "hr",
  排课课时账套: "scheduling",
  薪资财务账套: "payroll",
};

function applyLedgerUnlockEffect(db, request, account, actorName) {
  const handler = sideEffectHandlers.unlockApprovedLedger;
  if (!handler) return;
  const type = LEDGER_TYPE_BY_LABEL[request.formData?.ledgerType] || "";
  if (!type) throw httpError(400, `账套类型无法识别：${request.formData?.ledgerType}`);
  request.appliedResult = handler(db, {
    type,
    period: String(request.formData?.period || "").trim(),
    reason: String(request.formData?.reason || ""),
    requestId: request.id,
    actorName,
    account,
  });
}

// 薪资审批通过 → 锁定该月工资并生成台账（验收 3.13 / 3.14）
//
// 锁定动作放在整单通过之后，而不是财务复核那一步：人事过了、校领导还没批就把
// 工资锁死发出去，等于审批流形同虚设。
function applyPayrollApprovalEffect(db, request, account, actorName) {
  // 新版月度工资确认在校长签字后只进入“待总校财务执行”。工资锁定、预算入账
  // 必须等执行人上传发放凭证并点击已执行后发生；旧单没有明细快照，保留原流程兼容。
  if (request.payrollSnapshot) return;
  const handler = sideEffectHandlers.lockApprovedPayroll;
  if (!handler) return;
  const result = handler(db, {
    month: String(request.formData?.month || "").trim(),
    scope: String(request.formData?.scope || "").trim(),
    requestId: request.id,
    actorName,
    account,
  });
  const locked = result?.lockedCount || 0;
  const skipped = result?.skippedCount || 0;
  request.appliedResult = {
    type: "payroll_ledger",
    month: result?.month || "",
    scope: result?.scope || "",
    lockedCount: locked,
    skippedCount: skipped,
    failureReasons: result?.failureReasons || [],
    totalAmount: result?.totalAmount || 0,
  };

  // 审批通过 ≠ 工资已锁定。没锁上的必须单独告知发起人，否则财务看到
  // 「已通过」就以为可以付款了，而实际上一分钱都没锁定。
  if (skipped > 0) {
    const reasons = (result?.failureReasons || []).join("；");
    pushOaNotification(db, {
      accountIds: [request.applicantAccountId],
      title: locked ? "薪资审批通过，但部分未锁定" : "薪资审批通过，但工资尚未锁定",
      text:
        `${result?.month || ""} ${result?.scope || ""}：已锁定 ${locked} 人，${skipped} 人未锁定。` +
        (reasons ? `原因：${reasons}` : "请检查这些人员的确认与复核状态。"),
      level: "warning",
    });
  }
}

function applyExecutedPayrollApprovalEffect(db, request, account, actorName) {
  const snapshot = request.payrollSnapshot;
  if (!snapshot) return;
  const current = payrollSnapshotForScope(db, {
    termId: snapshot.termId,
    month: snapshot.month,
    scopeId: snapshot.stageId,
    strict: true,
  });
  if (current.fingerprint !== snapshot.fingerprint) {
    throw httpError(
      409,
      "工资明细或绩效分在审批期间已发生变化，请重新核算并发起新的月度工资确认",
    );
  }
  const handler = sideEffectHandlers.executeApprovedPayroll;
  if (!handler) throw httpError(503, "工资发放执行服务暂未就绪，请稍后重试");
  const result = handler(db, {
    requestId: request.id,
    termId: snapshot.termId,
    termName: snapshot.termName,
    month: snapshot.month,
    scopeId: snapshot.stageId,
    scopeName: snapshot.stageName,
    headcount: snapshot.headcount,
    totalAmount: snapshot.totalAmount,
    actorName,
    account,
  });
  request.appliedResult = {
    type: "payroll_ledger",
    termId: snapshot.termId,
    termName: snapshot.termName,
    month: snapshot.month,
    scope: snapshot.stageId,
    scopeName: snapshot.stageName,
    headcount: snapshot.headcount,
    totalAmount: snapshot.totalAmount,
    lockedCount: Number(result?.lockedCount || 0),
    ledgerStatus: result?.ledgerStatus || "",
  };
}

function nowIso() {
  return new Date().toISOString();
}

// 审批通过后的副作用处理器（由 server 启动时注入，避免与排课模块循环依赖）
// applySubstitutes(db, arrangements, account) -> { applied, cancelled }
const sideEffectHandlers = {};

export function registerOaSideEffect(name, handler) {
  sideEffectHandlers[name] = handler;
}

let oaIdCounter = 0;

function nextId(prefix) {
  oaIdCounter = (oaIdCounter + 1) % 100000;
  return `${prefix}-${Date.now()}-${oaIdCounter}`;
}

function ensureCollections(db) {
  if (!Array.isArray(db.oaRequests)) db.oaRequests = [];
  if (!Array.isArray(db.oaTemplates)) db.oaTemplates = [];
  if (!Array.isArray(db.notifications)) db.notifications = [];
  ensureBudgetStore(db);
  return db;
}

// 模板以库内数据为准（行政管理可自定义流程）；首次运行用内置定义播种。
// 已存在的模板不会被覆盖，避免学校改过的流程被升级重置。
export function ensureOaTemplates(db) {
  ensureCollections(db);
  let changed = false;
  OA_TEMPLATES.forEach((seed, index) => {
    const existing = db.oaTemplates.find((item) => item.key === seed.key);
    if (existing) {
      if (upgradeTemplateSchema(existing, seed)) changed = true;
      return;
    }
    db.oaTemplates.push({
      ...JSON.parse(JSON.stringify(seed)),
      status: "active",
      builtIn: true,
      sortOrder: index,
      updatedAt: nowIso(),
      updatedByName: "系统初始化",
    });
    changed = true;
  });
  return changed;
}

// 表单字段是代码与数据之间的契约：审批通过后的落地逻辑按字段 key 取值，
// 字段结构改了而库内模板还是旧版，申请就会填不出正确的数据。
// 因此内置模板提升 schemaVersion 时强制同步 formFields。审批线路默认不动，
// 只有提升 workflowVersion（属于制度级流程调整）时才会同步内置步骤。
// accessVersion 单独用于权限边界升级；例如账套改由行政统一管理时，旧库中
// 已播种的 applicantRoles 也必须同步，否则只改种子不会影响正在运行的数据。
function upgradeTemplateSchema(existing, seed) {
  const seedVersion = Number(seed.schemaVersion || 1);
  const currentVersion = Number(existing.schemaVersion || 1);
  const seedAccessVersion = Number(seed.accessVersion || 1);
  const currentAccessVersion = Number(existing.accessVersion || 1);
  const seedWorkflowVersion = Number(seed.workflowVersion || 1);
  const currentWorkflowVersion = Number(existing.workflowVersion || 1);
  let changed = false;
  if (seedVersion > currentVersion) {
    existing.formFields = JSON.parse(JSON.stringify(seed.formFields || []));
    existing.schemaVersion = seedVersion;
    changed = true;
  }
  if (seedAccessVersion > currentAccessVersion) {
    existing.applicantRoles = JSON.parse(JSON.stringify(seed.applicantRoles || []));
    existing.accessVersion = seedAccessVersion;
    changed = true;
  }
  if (seedWorkflowVersion > currentWorkflowVersion) {
    existing.steps = JSON.parse(JSON.stringify(seed.steps || []));
    // 执行环节同样属于流程定义。升级内置流程时与审批步骤一起同步，
    // 但不会改写已经发起的审批单快照。
    existing.execution = seed.execution ? JSON.parse(JSON.stringify(seed.execution)) : null;
    existing.workflowVersion = seedWorkflowVersion;
    changed = true;
  }
  // 内置模板的名称、说明等展示元数据随制度版本同步；管理员自建模板不受影响。
  if (changed && existing.builtIn !== false) {
    ["name", "description", "icon", "category", "ccAllowedRoles", "completionCcAccountIds"].forEach((key) => {
      if (seed[key] !== undefined) existing[key] = JSON.parse(JSON.stringify(seed[key]));
    });
  }
  if (changed) {
    existing.updatedAt = nowIso();
    existing.updatedByName = "系统升级";
  }
  return changed;
}

// ---------------------------------------------------------------------------
// 审批模板
// ---------------------------------------------------------------------------
// 字段类型：text | textarea | number | date | select | radio | checkbox
// 步骤 approverMode：any=或签（任一人通过即可）；all=会签（全部通过才进入下一步）
// approverRoles 用现有角色体系：teacher / admin(教务) / finance / hr /
//                              division_head(学部负责人) / system_admin(总校)

export const OA_TEMPLATES = [
  {
    key: "leave",
    name: "请假申请",
    icon: "🏖️",
    category: "考勤",
    description: "事假、病假、婚假、产假等各类假期申请",
    // v3：请假区间细化到上午/下午，天数由系统按半天自动计算，
    // 并在最终审批后逐日进入当月工资的请假结算；证明材料支持真实文件附件。
    schemaVersion: 3,
    applicantRoles: ["teacher", "admin", "finance", "hr", "division_head", "system_admin"],
    formFields: [
      {
        key: "leaveType",
        label: "请假类型",
        type: "select",
        required: true,
        options: ["事假", "病假", "年假", "婚假", "丧假", "产假", "陪产假", "工伤假"],
      },
      { key: "startDate", label: "开始日期", type: "date", required: true },
      { key: "startHalf", label: "开始时段", type: "select", required: true, options: ["上午", "下午"] },
      { key: "endDate", label: "结束日期", type: "date", required: true },
      { key: "endHalf", label: "结束时段", type: "select", required: true, options: ["上午", "下午"] },
      {
        key: "days",
        label: "请假天数",
        type: "number",
        required: true,
        readonly: true,
        step: 0.5,
        hint: "由起止日期与时段自动计算，精确到 0.5 天",
      },
      { key: "reason", label: "请假事由", type: "textarea", required: true, placeholder: "请说明请假原因" },
      {
        key: "attachment",
        label: "证明材料",
        type: "file",
        required: false,
        multiple: true,
        accept: ".jpg,.jpeg,.png,.pdf",
        hint: "可上传 JPG、PNG 或 PDF，单个文件不超过 10 MB，最多 3 个",
      },
    ],
    steps: [
      {
        name: "学部负责人审批",
        approverRoles: ["division_head", "admin"],
        approverMode: "any",
        // 代课由上级逐节安排，审批通过后直接写入课表（type=lessonArrangement）
        approverFields: [
          {
            key: "lessonArrangements",
            label: "课程安排",
            type: "lessonArrangement",
            required: true,
            hint: "请假期间的每节课需指定代课教师或取消，通过后自动更新课表",
          },
          { key: "handoverNote", label: "其他工作交接", type: "text", required: false, hint: "如班级事务、值班等交接说明" },
        ],
      },
      { name: "人事备案", approverRoles: ["hr", "system_admin"], approverMode: "any" },
    ],
  },
  {
    key: "outbound",
    name: "外出申请",
    icon: "🧳",
    category: "考勤",
    description: "因培训、会议、公务等外出时发起；外出期间课程由学部统一安排",
    applicantRoles: ["teacher", "admin", "finance", "hr", "division_head", "system_admin"],
    formFields: [
      { key: "startDate", label: "外出开始日期", type: "date", required: true },
      { key: "startHalf", label: "外出开始时段", type: "select", required: true, options: ["上午", "下午"] },
      { key: "endDate", label: "外出结束日期", type: "date", required: true },
      { key: "endHalf", label: "外出结束时段", type: "select", required: true, options: ["上午", "下午"] },
      { key: "reason", label: "外出原因", type: "textarea", required: true, placeholder: "例如：参加市级教学培训" },
    ],
    steps: [
      {
        name: "学部负责人审批",
        approverRoles: ["division_head", "admin"],
        approverMode: "any",
        // 外出期间的课程由上级逐节安排。原任课老师的正常课时工资照发，
        // 代课老师另按代课单价计薪，两个口径由排课／薪资联动处理。
        approverFields: [
          {
            key: "lessonArrangements",
            label: "课程安排",
            type: "lessonArrangement",
            required: true,
            hint: "外出期间的每节课需指定代课教师或取消，通过后自动更新课表",
          },
          { key: "handoverNote", label: "其他工作交接", type: "text", required: false, hint: "如班级事务、值班等交接说明" },
        ],
      },
      { name: "人事备案", approverRoles: ["hr", "system_admin"], approverMode: "any" },
    ],
  },
  {
    key: "overtime",
    name: "加班申请",
    icon: "🌙",
    category: "考勤",
    // 从手填时长迁移为起止时间自动换算。服务端仍会在提交时重算，
    // 不能只依赖只读输入框来防止篡改。
    // v4：时间控件改为“小时 + 00/30 分钟”的下拉选择，避免原生 time
    // 控件暴露任意分钟后再由服务端拒绝。
    schemaVersion: 4,
    description: "周末、节假日及日常超时加班申请",
    applicantRoles: ["teacher", "admin", "finance", "hr", "division_head", "system_admin"],
    formFields: [
      { key: "overtimeDate", label: "加班日期", type: "date", required: true },
      { key: "startTime", label: "开始时间", type: "half_hour_time", required: true },
      { key: "endTime", label: "结束时间", type: "half_hour_time", required: true, hint: "以半小时为单位；结束时间早于开始时间时，按次日结束计算" },
      { key: "hours", label: "加班时长（小时）", type: "number", required: false, readonly: true, step: "0.5", hint: "系统按起止时间自动计算，精确到 0.5 小时" },
      { key: "overtimeType", label: "加班类型", type: "select", required: true, options: ["日常超时", "周末加班", "节假日加班", "夜班"] },
      { key: "reason", label: "加班事由", type: "textarea", required: true },
    ],
    steps: [{ name: "部门负责人确认", approverRoles: ["division_head", "admin", "hr", "system_admin"], approverMode: "any" }],
  },
  {
    key: "overtime_batch",
    name: "批量加班申请",
    icon: "🌙",
    category: "考勤",
    schemaVersion: 2,
    description: "学部主任为本学部多位老师统一发起加班申请",
    applicantRoles: ["division_head"],
    formFields: [
      { key: "overtimeDate", label: "加班日期", type: "date", required: true },
      { key: "startTime", label: "开始时间", type: "half_hour_time", required: true },
      { key: "endTime", label: "结束时间", type: "half_hour_time", required: true, hint: "以半小时为单位；结束时间早于开始时间时，按次日结束计算" },
      { key: "hours", label: "加班时长（小时）", type: "number", required: false, readonly: true, step: "0.5", hint: "系统按起止时间自动计算，精确到 0.5 小时" },
      { key: "overtimeType", label: "加班类型", type: "select", required: true, options: ["日常超时", "周末加班", "节假日加班", "夜班"] },
      { key: "reason", label: "加班事由", type: "textarea", required: true },
      {
        key: "participantTeacherIds",
        label: "加班人员",
        type: "teacher_multiselect",
        required: true,
        hint: "仅可选择本学部在职老师；可按姓名、工号或学科搜索并多选",
      },
    ],
    steps: [{ name: "校长审批", approverRoles: ["principal"], approverMode: "any" }],
  },
  {
    key: "lesson_swap",
    name: "调课申请",
    icon: "🔄",
    category: "教学",
    // v2：老师线下协商后，在审批单中选择双方的实际已发布课次。审批通过后
    // 系统交换两节课的上课时间，而不是只留一段“调课安排”的文字。
    schemaVersion: 3,
    workflowVersion: 2,
    description: "双方教师协商后，选择两节已发布课程申请互换上课时间",
    applicantRoles: ["teacher", "division_head"],
    formFields: [
      {
        key: "sourceLessonId",
        label: "我要调整的课程",
        type: "text",
        required: true,
        hint: "仅显示本人已发布、未取消的课程",
      },
      {
        key: "counterpartTeacherId",
        label: "已协商老师",
        type: "text",
        required: true,
        hint: "先选择已与您确认调课的老师",
      },
      {
        key: "counterpartLessonId",
        label: "与之交换的课程（已协商老师）",
        type: "text",
        required: true,
        hint: "选择对方已确认可交换的一节课程",
      },
      { key: "reason", label: "调课原因", type: "textarea", required: true },
    ],
    steps: [
      {
        name: "排课负责人审批",
        approverRoles: ["admin"],
        approverMode: "any",
      },
    ],
  },
  {
    key: "class_size_confirm",
    name: "班级学生人数确认",
    icon: "👥",
    category: "学期事项",
    description: "学期初确认各班学生人数，作为班主任、生活教师津贴的计算依据",
    // 班级实有人数由学部掌握，统一由学部主任提交。学期与学部都使用系统主键，
    // 不接受手工名称；校长审批通过后才抄送总校人事行政和总校财务。
    schemaVersion: 4,
    accessVersion: 3,
    workflowVersion: 4,
    applicantRoles: ["division_head"],
    completionCcAccountIds: ["ACC-SYSTEM-ADMIN", "ACC-FINANCE"],
    formFields: [
      { key: "termId", label: "适用学期", type: "term", required: true, hint: "仅可选择系统中已建立、未完成且未归档的正式学期" },
      { key: "stageName", label: "人数所属学部", type: "text", required: true, readonly: true, hint: "按当前学部主任账号自动确定，不能跨学部填写" },
      { key: "classConfirmations", label: "班级人数与班主任", type: "class_size_rows", required: true, hint: "逐班确认学生人数，并从本学部在职教师中选择班主任" },
      { key: "lifeTeacherAssignments", label: "生活老师负责学生数", type: "life_teacher_rows", required: false, hint: "生活老师可跨班负责；合计不得超过本学部学生总数" },
      { key: "reason", label: "说明", type: "textarea", required: false, hint: "人数变动原因等" },
    ],
    steps: [
      { name: "校长审批", approverRoles: ["principal"], approverMode: "any" },
    ],
  },
  {
    key: "lesson_rule_confirm",
    name: "课时规则确认",
    icon: "📐",
    category: "学期事项",
    description: "学期初确认跨头课、心理辅导折算等课时计薪规则",
    applicantRoles: ["admin", "finance", "hr", "system_admin"],
    formFields: [
      { key: "termName", label: "适用学期", type: "text", required: true },
      { key: "effectiveMonth", label: "生效月份", type: "text", required: true, placeholder: "如 2026-09" },
      { key: "ruleScope", label: "规则范围", type: "select", required: true, options: ["跨头课补助", "心理辅导折算", "补课费标准", "非正课单价", "其他"] },
      { key: "ruleDetail", label: "规则内容", type: "textarea", required: true, hint: "写明适用对象、标准与计算方式" },
      { key: "reason", label: "调整依据", type: "textarea", required: true, hint: "对应制度条款或学校决议" },
    ],
    steps: [
      { name: "财务复核", approverRoles: ["finance"], approverMode: "any" },
      { name: "总校审批", approverRoles: ["system_admin"], approverMode: "any" },
    ],
  },
  {
    key: "budget_confirm",
    name: "学部薪酬预算确认",
    // 一张单只对应一个学部，由对应主任复核；不抄给普通教师。
    ccAllowedRoles: ["hr", "finance", "division_head", "principal", "system_admin"],
    icon: "📊",
    category: "学期事项",
    description: "总校财务按学部分别提交薪酬预算，由对应学部主任复核后报校长审批",
    // v7：适用学期只能选择未完成、未归档的正式学期。
    schemaVersion: 7,
    accessVersion: 2,
    workflowVersion: 3,
    applicantRoles: ["finance"],
    formFields: [
      { key: "termId", label: "适用学期", type: "term", required: true, hint: "仅显示已建立、未完成且未归档的正式学期" },
      { key: "budgetScope", label: "预算学部", type: "budget_scope", required: true, hint: "选择本次需要复核的学部" },
      { key: "amount", label: "本学部预算（元）", type: "number", required: true },
    ],
    steps: [
      {
        name: "学部主任复核确认",
        approverRoles: ["division_head"],
        // 发起时按 budgetScope 替换成准确的一位主任，避免其他学部跨域审批。
        dynamicBudgetScopeApprover: true,
        approverMode: "any",
      },
      { name: "校长审批", approverRoles: ["principal"], approverMode: "any" },
    ],
  },
  {
    key: "division_budget_use",
    name: "学部预算使用申请",
    icon: "📌",
    category: "预算",
    description: "校长批准后由总校财务拨款；上传拨款凭证并标记已执行后完成留痕",
    schemaVersion: 3,
    // v2：审批完成后不再只抄送财务，而是创建可处理的执行待办。
    workflowVersion: 2,
    ccAllowedRoles: ["finance", "principal", "division_head", "system_admin"],
    applicantRoles: ["division_head"],
    formFields: [
      { key: "termId", label: "适用学期", type: "term", required: true, hint: "仅显示已建立、未完成且未归档的正式学期" },
      { key: "amount", label: "申请使用金额（元）", type: "number", required: true },
      { key: "purpose", label: "使用用途", type: "textarea", required: true, hint: "写明预算使用事项与金额用途" },
      { key: "reason", label: "申请说明", type: "textarea", required: true, hint: "说明申请依据、计划或附件情况" },
    ],
    steps: [{ name: "校长审批", approverRoles: ["principal"], approverMode: "any" }],
    execution: {
      name: "总校财务拨款",
      executorAccountIds: ["ACC-FINANCE"],
      evidenceRequired: true,
      evidenceLabel: "拨款凭证",
    },
  },
  {
    key: "payroll_approval",
    name: "月度工资确认",
    icon: "💰",
    category: "薪酬",
    description: "学部财务核算完成后，主任核对全员工资明细并签字，校长审批后由总校财务执行发放",
    // v2：从泛化的三级审批改为学部月度工资确认。工资明细快照在发起时固化，
    // 主任、校长和执行财务查看的是同一版含绩效分与应发金额的明细。
    schemaVersion: 2,
    accessVersion: 2,
    workflowVersion: 2,
    // 工资明细里有个人薪酬数字，不能抄给普通教师。
    ccAllowedRoles: ["hr", "finance", "division_head", "principal", "system_admin"],
    applicantRoles: ["finance"],
    formFields: [
      { key: "termId", label: "适用学期", type: "term", required: true, hint: "仅显示本学部已完成复核、可提交确认的工资期间" },
      { key: "month", label: "结算月份", type: "payroll_month", required: true, hint: "仅显示本学部已完成工资复核的月份" },
      { key: "stageName", label: "所属学部", type: "text", required: true, readonly: true },
      { key: "headcount", label: "核算人数", type: "number", required: true, readonly: true },
      { key: "totalAmount", label: "应发合计（元）", type: "number", required: true, readonly: true },
      { key: "reason", label: "核算说明", type: "textarea", required: false, hint: "可说明本月异动、补发或扣款情况" },
    ],
    steps: [
      {
        name: "学部主任确认签字",
        approverRoles: ["division_head"],
        dynamicDivisionScopeApprover: true,
        approverMode: "any",
      },
      { name: "校长审批签字", approverRoles: ["principal"], approverMode: "any" },
    ],
    execution: {
      name: "总校财务执行发放",
      executorAccountIds: ["ACC-FINANCE"],
      evidenceRequired: true,
      evidenceLabel: "发放凭证",
    },
  },
  {
    key: "ledger_unlock",
    name: "账套解锁申请",
    icon: "🔓",
    category: "薪酬",
    description: "已锁定的账套需要修改时的多级审批：财务复核、人事复核、校领导审批（验收 8.10）",
    accessVersion: 2,
    ccAllowedRoles: ["hr", "finance", "division_head", "principal", "system_admin"],
    applicantRoles: ["system_admin"],
    formFields: [
      {
        key: "ledgerType",
        label: "账套类型",
        type: "select",
        required: true,
        options: ["人事账套", "排课课时账套", "薪资财务账套"],
      },
      { key: "period", label: "账套期间", type: "text", required: true, hint: "薪资填 2026-06，排课填学期 ID，人事填年份" },
      { key: "reason", label: "解锁原因", type: "textarea", required: true, hint: "写清要改什么、为什么必须改" },
      { key: "impact", label: "影响范围", type: "textarea", required: true, hint: "涉及多少人、多少金额" },
    ],
    // 三级审批，且顺序与薪资审批相反：先财务说清要改什么，人事核对人员口径，
    // 最后校领导拍板。已锁定的账套意味着钱已经发出去了，改它要比锁它更慎重。
    steps: [
      { name: "财务复核", approverRoles: ["finance", "system_admin"], approverMode: "any" },
      { name: "人事复核", approverRoles: ["hr"], approverMode: "any" },
      { name: "校领导审批", approverRoles: ["principal"], approverMode: "any" },
    ],
  },
  {
    key: "general",
    name: "通用事项申请",
    icon: "📝",
    category: "其他",
    description: "上述类型未覆盖的事项，走通用审批",
    applicantRoles: ["teacher", "admin", "finance", "hr", "division_head", "system_admin"],
    formFields: [
      { key: "subject", label: "事项名称", type: "text", required: true },
      { key: "detail", label: "事项说明", type: "textarea", required: true },
      { key: "expectedDate", label: "期望完成日期", type: "date", required: false },
    ],
    steps: [{ name: "管理层审批", approverRoles: ["division_head", "admin", "hr", "system_admin"], approverMode: "any" }],
  },
];

export const OA_TIMEOUT_WORKDAYS = 3;

export function findTemplate(db, key) {
  ensureOaTemplates(db);
  return db.oaTemplates.find((item) => item.key === key) || null;
}

// 按角色返回可发起的模板（前端审批首页的图标网格用）
export function listTemplatesForRole(db, roleOrAccount = "") {
  ensureOaTemplates(db);
  // 路由传完整账号，以便总校财务和学部财务虽同为 finance 角色却看到不同模板。
  // 保留字符串入参兼容既有调用和纯角色测试。
  const account = roleOrAccount && typeof roleOrAccount === "object" ? roleOrAccount : null;
  const role = account?.role || String(roleOrAccount || "");
  return db.oaTemplates
    .filter((template) => template.status !== "disabled" && template.applicantRoles.includes(role))
    .filter((template) => template.key !== "budget_confirm" || !account || isHeadquartersFinance(account))
    .filter(
      (template) =>
        template.key !== "overtime_batch" ||
        !account ||
        (account.role === "division_head" && (() => {
          const scopes = Array.isArray(account.scopeStageIds) ? account.scopeStageIds.map(String) : [];
          return scopes.length === 1 && FINANCE_SCOPE_IDS.includes(scopes[0]) && scopes[0] !== "headquarters";
        })()),
    )
    .filter(
      (template) =>
        template.key !== "payroll_approval" ||
        !account ||
        (account.role === "finance" && financeScopeFor(account) && financeScopeFor(account) !== "headquarters"),
    )
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
    .map((template) => ({
      key: template.key,
      name: template.name,
      icon: template.icon,
      category: template.category,
      description: template.description,
      formFields: template.formFields,
      steps: template.steps.map((step) => ({
        name: step.name,
        approverRoles: step.approverRoles || [],
        approverAccountIds: step.approverAccountIds || [],
      })),
    }));
}

// ---------------------------------------------------------------------------
// 模板配置（行政管理自定义审批流程）
// ---------------------------------------------------------------------------

export const OA_APPROVER_ROLES = [
  { value: "division_head", label: "学部主任" },
  { value: "admin", label: "学部排课负责人" },
  { value: "hr", label: "人事" },
  { value: "finance", label: "财务" },
  { value: "principal", label: "校长（总校领导）" },
  { value: "system_admin", label: "总校人事 + 行政" },
];

export const OA_FIELD_TYPES = [
  { value: "text", label: "单行文本" },
  { value: "textarea", label: "多行文本" },
  { value: "number", label: "数字" },
  { value: "date", label: "日期" },
  { value: "select", label: "下拉选择" },
  { value: "radio", label: "单选" },
  { value: "file", label: "文件附件" },
];

// 自定义审批的审批人按具体账号选择，而不是仅按岗位群发。这样“高中学部主任”
// 不会因为同为学部主任而收到初中老师的审批单。内置历史模板仍可继续按角色运行。
export function listOaApproverAccounts(db) {
  ensureCollections(db);
  const allowedRoles = new Set(OA_APPROVER_ROLES.map((item) => item.value));
  return (db.accounts || [])
    .filter((item) => item.status !== "disabled" && allowedRoles.has(item.role))
    .map((item) => ({
      accountId: item.id,
      name: item.name || item.displayName || item.username || "未命名",
      department: item.department || "未设置部门",
      title: item.title || roleLabelOf(item.role),
      role: item.role,
      roleLabel: roleLabelOf(item.role),
      scopeStageIds: Array.isArray(item.scopeStageIds) ? item.scopeStageIds.map(String) : [],
    }))
    .sort((a, b) => `${a.department} ${a.title} ${a.name}`.localeCompare(`${b.department} ${b.title} ${b.name}`, "zh-Hans-CN"));
}

export function listAllTemplates(db) {
  ensureOaTemplates(db);
  return [...db.oaTemplates].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
}

function validateTemplateInput(db, input, { requireKey = true } = {}) {
  const key = String(input.key || "").trim();
  if (requireKey && !/^[a-z][a-z0-9_]{1,39}$/.test(key)) {
    throw httpError(400, "模板标识只能用小写字母、数字和下划线，且以字母开头");
  }
  const name = String(input.name || "").trim();
  if (!name) throw httpError(400, "审批名称不能为空");

  const applicantRoles = Array.isArray(input.applicantRoles) ? input.applicantRoles.filter(Boolean) : [];
  if (!applicantRoles.length) throw httpError(400, "至少指定一个可发起该审批的角色");

  const formFields = Array.isArray(input.formFields) ? input.formFields : [];
  if (!formFields.length) throw httpError(400, "至少配置一个表单字段");
  const fieldKeys = new Set();
  const normalizedFields = formFields.map((field, index) => {
    const fieldKey = String(field.key || "").trim();
    if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(fieldKey)) {
      throw httpError(400, `第 ${index + 1} 个字段的标识不合法`);
    }
    if (fieldKeys.has(fieldKey)) throw httpError(400, `字段标识重复：${fieldKey}`);
    fieldKeys.add(fieldKey);
    const label = String(field.label || "").trim();
    if (!label) throw httpError(400, `第 ${index + 1} 个字段缺少名称`);
    const type = String(field.type || "text");
    if (!OA_FIELD_TYPES.some((item) => item.value === type)) throw httpError(400, `字段「${label}」类型无效`);
    const options = Array.isArray(field.options) ? field.options.map((item) => String(item).trim()).filter(Boolean) : [];
    if ((type === "select" || type === "radio") && !options.length) {
      throw httpError(400, `字段「${label}」是选择类型，必须配置选项`);
    }
    return {
      key: fieldKey,
      label,
      type,
      required: Boolean(field.required),
      readonly: Boolean(field.readonly),
      step: field.step === undefined ? undefined : Number(field.step),
      multiple: Boolean(field.multiple),
      accept: String(field.accept || ""),
      placeholder: String(field.placeholder || ""),
      hint: String(field.hint || ""),
      options,
    };
  });

  const steps = Array.isArray(input.steps) ? input.steps : [];
  if (!steps.length) throw httpError(400, "至少配置一个审批环节");
  if (steps.length > 8) throw httpError(400, "审批环节最多 8 级");
  const validApproverAccounts = new Map(listOaApproverAccounts(db).map((item) => [item.accountId, item]));
  const normalizedSteps = steps.map((step, index) => {
    const stepName = String(step.name || "").trim();
    if (!stepName) throw httpError(400, `第 ${index + 1} 个环节缺少名称`);
    const approverAccountIds = [...new Set((Array.isArray(step.approverAccountIds) ? step.approverAccountIds : []).map((item) => String(item).trim()).filter(Boolean))];
    const invalidApproverAccount = approverAccountIds.find((accountId) => !validApproverAccounts.has(accountId));
    if (invalidApproverAccount) throw httpError(400, `环节「${stepName}」包含无效或已停用的审批人`);
    const approverRoles = Array.isArray(step.approverRoles) ? step.approverRoles.filter(Boolean) : [];
    if (!approverAccountIds.length && !approverRoles.length) throw httpError(400, `请为「${stepName}」选择至少一名审批人`);
    const invalidRole = approverRoles.find((role) => !OA_APPROVER_ROLES.some((item) => item.value === role));
    if (invalidRole) throw httpError(400, `环节「${stepName}」包含无效角色：${invalidRole}`);
    const approverFields = Array.isArray(step.approverFields) ? step.approverFields : [];
    const normalizedApproverFields = approverFields.map((field, fieldIndex) => {
      const fieldKey = String(field.key || "").trim();
      if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(fieldKey)) {
        throw httpError(400, `环节「${stepName}」第 ${fieldIndex + 1} 个审批填写项标识不合法`);
      }
      const label = String(field.label || "").trim();
      if (!label) throw httpError(400, `环节「${stepName}」第 ${fieldIndex + 1} 个审批填写项缺少名称`);
      return {
        key: fieldKey,
        label,
        type: String(field.type || "text"),
        required: Boolean(field.required),
        hint: String(field.hint || ""),
      };
    });
    return {
      name: stepName,
      // 选定人员时只按人员分发；approverRoles 仅保留给历史内置流程的兼容模式。
      approverAccountIds,
      approverRoles: approverAccountIds.length ? [] : approverRoles,
      approverMode: step.approverMode === "all" ? "all" : "any",
      approverFields: normalizedApproverFields,
    };
  });

  // 执行人不是审批人：它只会在所有审批通过后收到待办，并需要留存执行凭证。
  // 自定义模板默认不启用；启用后必须指定到具体在职人员，避免“抄送一群角色”
  // 却无法明确谁真正负责执行。
  const executionInput = input.execution && typeof input.execution === "object" ? input.execution : null;
  let execution = null;
  if (executionInput?.enabled !== false) {
    const executorAccountIds = [
      ...new Set(
        (Array.isArray(executionInput?.executorAccountIds) ? executionInput.executorAccountIds : [])
          .map((item) => String(item).trim())
          .filter(Boolean),
      ),
    ];
    const hasExecutionData = Boolean(executionInput && (executionInput.enabled || executorAccountIds.length || executionInput.name));
    if (hasExecutionData) {
      const name = String(executionInput.name || "").trim();
      if (!name) throw httpError(400, "请填写执行环节名称");
      if (!executorAccountIds.length) throw httpError(400, `请为「${name}」选择至少一名执行人`);
      const invalidExecutor = executorAccountIds.find((accountId) => !validApproverAccounts.has(accountId));
      if (invalidExecutor) throw httpError(400, `执行环节「${name}」包含无效或已停用的执行人`);
      execution = {
        name,
        executorAccountIds,
        // 自定义界面按具体人员配置；角色字段保留为内置历史模板兼容。
        executorRoles: [],
        evidenceRequired: executionInput.evidenceRequired !== false,
        evidenceLabel: String(executionInput.evidenceLabel || "执行凭证").trim() || "执行凭证",
      };
    }
  }

  return {
    key,
    name,
    icon: String(input.icon || "📝").slice(0, 4),
    category: String(input.category || "其他").trim() || "其他",
    description: String(input.description || "").trim(),
    applicantRoles,
    formFields: normalizedFields,
    steps: normalizedSteps,
    execution,
  };
}

export function createOaTemplate(db, input, account) {
  ensureOaTemplates(db);
  const data = validateTemplateInput(db, input);
  if (db.oaTemplates.some((item) => item.key === data.key)) {
    throw httpError(400, `模板标识已存在：${data.key}`);
  }
  const template = {
    ...data,
    status: "active",
    builtIn: false,
    sortOrder: db.oaTemplates.length,
    updatedAt: nowIso(),
    updatedByName: account?.displayName || account?.username || "",
  };
  db.oaTemplates.push(template);
  return template;
}

export function updateOaTemplate(db, key, input, account) {
  ensureOaTemplates(db);
  const template = db.oaTemplates.find((item) => item.key === key);
  if (!template) throw httpError(404, "模板不存在");
  const data = validateTemplateInput(db, { ...input, key }, { requireKey: false });
  Object.assign(template, {
    name: data.name,
    icon: data.icon,
    category: data.category,
    description: data.description,
    applicantRoles: data.applicantRoles,
    formFields: data.formFields,
    steps: data.steps,
    execution: data.execution,
    updatedAt: nowIso(),
    updatedByName: account?.displayName || account?.username || "",
  });
  return template;
}

export function setOaTemplateStatus(db, key, status, account) {
  ensureOaTemplates(db);
  const template = db.oaTemplates.find((item) => item.key === key);
  if (!template) throw httpError(404, "模板不存在");
  if (!["active", "disabled"].includes(status)) throw httpError(400, "状态无效");
  template.status = status;
  template.updatedAt = nowIso();
  template.updatedByName = account?.displayName || account?.username || "";
  return template;
}

export function deleteOaTemplate(db, key) {
  ensureOaTemplates(db);
  const template = db.oaTemplates.find((item) => item.key === key);
  if (!template) throw httpError(404, "模板不存在");
  if (template.builtIn) throw httpError(400, "内置模板不可删除，可将其停用");
  const inUse = db.oaRequests.some((item) => item.templateKey === key && item.status === "pending");
  if (inUse) throw httpError(400, "该模板下仍有审批中的单据，无法删除");
  db.oaTemplates = db.oaTemplates.filter((item) => item.key !== key);
  return { deleted: true };
}

// ---------------------------------------------------------------------------
// 表单校验
// ---------------------------------------------------------------------------

function validateFormData(template, formData = {}) {
  const clean = {};
  template.formFields.forEach((field) => {
    const raw = formData[field.key];
    const isMulti = ["multiselect", "teacher_multiselect"].includes(field.type);
    const isStructured = ["class_size_rows", "life_teacher_rows"].includes(field.type);
    const multiValues = isMulti
      ? [...new Set((Array.isArray(raw) ? raw : raw ? [raw] : []).map((item) => String(item || "").trim()).filter(Boolean))]
      : null;
    const value = typeof raw === "string" ? raw.trim() : raw;
    const isEmpty = isMulti ? !multiValues.length : isStructured ? !Array.isArray(value) || !value.length : value === undefined || value === null || value === "";
    if (field.required && isEmpty) {
      throw httpError(400, `请填写「${field.label}」`);
    }
    if (isEmpty) {
      clean[field.key] = isMulti ? [] : "";
      return;
    }
    if (isMulti) {
      clean[field.key] = multiValues;
      return;
    }
    if (isStructured) {
      if (!Array.isArray(value)) throw httpError(400, `「${field.label}」格式无效`);
      clean[field.key] = value;
      return;
    }
    if (field.type === "number") {
      const num = Number(value);
      if (!Number.isFinite(num)) throw httpError(400, `「${field.label}」必须是数字`);
      clean[field.key] = num;
      return;
    }
    if ((field.type === "select" || field.type === "radio") && Array.isArray(field.options)) {
      if (!field.options.includes(String(value))) {
        throw httpError(400, `「${field.label}」取值无效`);
      }
    }
    clean[field.key] = String(value);
  });
  return clean;
}

function dateOrdinal(dateKey, label) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ""));
  if (!match) throw httpError(400, `「${label}」日期格式无效`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw httpError(400, `「${label}」不是有效日期`);
  }
  return Math.floor(timestamp / 86400000);
}

// 起止半天均计入：同日上午→上午为 0.5 天，上午→下午为 1 天。
// 导出给测试与其他业务联动使用，避免各模块各算一套。
export function calculateLeaveDays(startDate, startHalf, endDate, endHalf) {
  const startDay = dateOrdinal(startDate, "开始日期");
  const endDay = dateOrdinal(endDate, "结束日期");
  if (!["上午", "下午"].includes(startHalf)) throw httpError(400, "开始时段无效");
  if (!["上午", "下午"].includes(endHalf)) throw httpError(400, "结束时段无效");
  const startSlot = startDay * 2 + (startHalf === "下午" ? 1 : 0);
  const endSlot = endDay * 2 + (endHalf === "下午" ? 1 : 0);
  if (endSlot < startSlot) throw httpError(400, "结束时间不能早于开始时间");
  return (endSlot - startSlot + 1) / 2;
}

function timeOfDayMinutes(value, label) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || "").trim());
  if (!match) throw httpError(400, `「${label}」时间格式无效，请选择有效时间`);
  return Number(match[1]) * 60 + Number(match[2]);
}

// 加班可跨越午夜（例如 22:00 至次日 02:00），但同一时刻并不表示 24 小时加班。
// 此函数由前端展示和服务端提交校验共享同一口径，避免手输时长与实际区间不一致。
export function calculateOvertimeHours(startTime, endTime) {
  const startMinutes = timeOfDayMinutes(startTime, "开始时间");
  const endMinutes = timeOfDayMinutes(endTime, "结束时间");
  if (startMinutes % 30 !== 0 || endMinutes % 30 !== 0) {
    throw httpError(400, "加班开始和结束时间仅支持每半小时选择一次");
  }
  if (startMinutes === endMinutes) throw httpError(400, "开始时间和结束时间不能相同");
  const durationMinutes = endMinutes > startMinutes ? endMinutes - startMinutes : endMinutes + 24 * 60 - startMinutes;
  return Number((durationMinutes / 60).toFixed(2));
}

// 请假、外出等带日期区间的模板做基本合理性校验
function validateBusinessRules(templateKey, formData) {
  if (["overtime", "overtime_batch"].includes(templateKey) && (formData.startTime || formData.endTime)) {
    // 一律覆盖浏览器提交的 hours：前端展示为只读也不能替代服务端校验。
    formData.hours = calculateOvertimeHours(formData.startTime, formData.endTime);
  }
  if (templateKey === "leave") {
    // 不采信浏览器传来的 days，防止绕过界面篡改请假天数。
    formData.days = calculateLeaveDays(
      formData.startDate,
      formData.startHalf,
      formData.endDate,
      formData.endHalf,
    );
  }
  if (templateKey === "outbound") {
    // 外出不计入请假天数和请假扣薪，但同样必须有合法、闭合的半天时间区间，
    // 否则学部负责人无法准确列出受影响课次。
    calculateLeaveDays(
      formData.startDate,
      formData.startHalf,
      formData.endDate,
      formData.endHalf,
    );
  }
  if (templateKey === "ledger_unlock") {
    const period = String(formData.period || "").trim();
    const type = formData.ledgerType;
    // 期间格式在发起时就校验。等三级审批全批完才发现「2026-6」不是合法月份，
    // 三个人的时间就白花了，而且申请人还得重新走一遍。
    if (type === "薪资财务账套" && !/^\d{4}-\d{2}$/.test(period)) {
      throw httpError(400, `薪资账套的期间应为 YYYY-MM，例如 2026-06，当前填的是「${period}」`);
    }
    if (type === "人事账套" && !/^\d{4}$/.test(period)) {
      throw httpError(400, `人事账套的期间应为年份，例如 2026，当前填的是「${period}」`);
    }
  }
  if (templateKey === "budget_confirm") {
    const scopeId = String(formData.budgetScope || "").trim();
    if (!BUDGET_SCOPES.some((scope) => scope.id === scopeId)) {
      throw httpError(400, "请选择幼儿园、小学部、初中部或高中部中的一个预算学部");
    }
    const amount = Number(formData.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw httpError(400, "本学部预算必须大于 0");
    }
  }
  if (templateKey === "division_budget_use") {
    const amount = Number(formData.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw httpError(400, "申请使用金额必须大于 0");
    }
  }
  if (templateKey === "payroll_approval" && !/^\d{4}-\d{2}$/.test(String(formData.month || ""))) {
    throw httpError(400, "结算月份格式应为 YYYY-MM，例如 2026-09");
  }
}

function payrollSnapshotFingerprint(rows = []) {
  // 这是版本校验指纹，不作为安全签名。它确保审批期间若有人改了某位老师
  // 的绩效或工资组成，总校财务执行前会被拦下，必须重新核算并重新发起确认。
  return JSON.stringify(
    rows.map((row) => ({
      teacherId: row.teacherId,
      performanceScore: row.performanceScore,
      grossPay: row.grossPay,
      components: row.components,
    })),
  );
}

function payrollSnapshotForScope(db, { termId, month, scopeId, strict = true } = {}) {
  const normalizedTermId = String(termId || "").trim();
  const normalizedMonth = String(month || "").trim();
  const normalizedScope = String(scopeId || "").trim();
  const term = (db.terms || []).find((item) => item.id === normalizedTermId);
  if (!term) throw httpError(400, "请选择系统中已建立的正式学期");
  if (!/^\d{4}-\d{2}$/.test(normalizedMonth)) throw httpError(400, "结算月份格式应为 YYYY-MM");
  if (!FINANCE_SCOPE_IDS.includes(normalizedScope) || normalizedScope === "headquarters") {
    throw httpError(400, "月度工资确认只能选择教学学部");
  }

  const teachers = (db.teachers || [])
    .filter((teacher) => teacher.status === "active" && payrollScopeOfTeacher(db, teacher.id) === normalizedScope)
    .sort((a, b) => `${a.employeeNo || ""} ${a.name || ""}`.localeCompare(`${b.employeeNo || ""} ${b.name || ""}`, "zh-Hans-CN"));
  const details = (db.payrollDetails || []).filter(
    (detail) =>
      detail.month === normalizedMonth &&
      detail.termId === normalizedTermId &&
      payrollScopeOfTeacher(db, detail.teacherId) === normalizedScope,
  );
  const detailsByTeacher = new Map(details.map((detail) => [detail.teacherId, detail]));
  const missing = teachers.filter((teacher) => !detailsByTeacher.has(teacher.id));
  const unreviewed = teachers
    .map((teacher) => ({ teacher, detail: detailsByTeacher.get(teacher.id) }))
    .filter((item) => item.detail && item.detail.status !== "reviewed");

  const problems = [];
  if (!teachers.length) problems.push("本学部暂无在职人员");
  if (missing.length) problems.push(`尚有 ${missing.length} 人未生成工资明细`);
  if (unreviewed.length) problems.push(`尚有 ${unreviewed.length} 人未完成老师确认及财务复核`);
  if (strict && problems.length) throw httpError(409, `暂不能提交月度工资确认：${problems.join("；")}`);

  const rows = teachers
    .map((teacher) => {
      const detail = detailsByTeacher.get(teacher.id);
      if (!detail) return null;
      const summary = detail.summarySnapshot || {};
      const assessment = (db.monthlyAssessments || []).find(
        (item) => item.teacherId === teacher.id && item.month === normalizedMonth,
      );
      const rawScore = Number(assessment?.score);
      const performanceScore = Number.isFinite(rawScore) && rawScore >= 0 ? rawScore : 100;
      const components = (detail.rowsSnapshot || []).map((row) => ({
        name: String(row.name || "工资项目"),
        amount: Number(row.amount || 0),
        category: String(row.category || ""),
      }));
      return {
        teacherId: teacher.id,
        employeeNo: teacher.employeeNo || teacher.id,
        teacherName: teacher.name || teacher.id,
        department: teacher.department || teacher.stageName || financeScopeLabel(normalizedScope),
        subjectName: teacher.primarySubjectName || teacher.subject || teacher.title || "-",
        performanceScore,
        baseSalary: Number(summary.baseSalary || 0),
        assessmentSalary: Number(summary.assessmentSalary || 0),
        housingAllowance: Number(summary.housingAllowance || 0),
        positionSalary: Number(summary.positionSalary || 0),
        lessonAmount: Number(summary.lessonAmount || 0),
        supplementalAmount: Number(summary.supplementalAmount || 0),
        deductionAmount: Number(summary.deductionAmount || 0),
        grossPay: Number(summary.grossPay || 0),
        components,
      };
    })
    .filter(Boolean);
  const totalAmount = rows.reduce((sum, row) => sum + row.grossPay, 0);
  return {
    version: 1,
    termId: term.id,
    termName: term.name,
    month: normalizedMonth,
    stageId: normalizedScope,
    stageName: financeScopeLabel(normalizedScope),
    headcount: rows.length,
    totalAmount,
    rows,
    fingerprint: payrollSnapshotFingerprint(rows),
    ready: problems.length === 0,
    problems,
  };
}

// 只返回“所有人都已复核”的期间，避免财务在对话框里选中一个最终必然被拒的月份。
export function listPayrollApprovalOptions(db, account) {
  ensureCollections(db);
  const scopeId = divisionPayrollScopeForAccount(account);
  const candidates = new Map();
  (db.payrollDetails || [])
    .filter((detail) => payrollScopeOfTeacher(db, detail.teacherId) === scopeId)
    .forEach((detail) => {
      if (!detail.termId || !detail.month) return;
      candidates.set(`${detail.termId}|${detail.month}`, { termId: detail.termId, month: detail.month });
    });
  const periods = [...candidates.values()]
    .map((candidate) => {
      try {
        return payrollSnapshotForScope(db, { ...candidate, scopeId, strict: true });
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => `${b.month}|${b.termName}`.localeCompare(`${a.month}|${a.termName}`, "zh-Hans-CN"))
    .map((snapshot) => ({
      termId: snapshot.termId,
      termName: snapshot.termName,
      month: snapshot.month,
      stageName: snapshot.stageName,
      headcount: snapshot.headcount,
      totalAmount: snapshot.totalAmount,
    }));
  return { scopeId, scopeName: financeScopeLabel(scopeId), periods };
}

function lessonSwapLabel(lesson = {}, { includeTeacher = false } = {}) {
  const period = lesson.period ? `第 ${lesson.period} 节` : lesson.time || "未设节次";
  return [
    includeTeacher ? lesson.teacherName || "未命名老师" : "",
    lesson.date || "未设日期",
    period,
    lesson.className || "未设班级",
    lesson.subjectName || "未设科目",
  ]
    .filter(Boolean)
    .join(" · ");
}

// 调课单必须引用真实课表中的两节课程，不能把“和谁调”留成无法执行的自由文本。
// 这里在发起时固化显示文案与学部范围；审批时还会再做一次完整冲突校验，防止
// 两个老师协商后到审批前课表或工资账套发生变化。
function prepareLessonSwapFormData(db, account, formData) {
  const sourceLessonId = String(formData.sourceLessonId || "").trim();
  const counterpartTeacherId = String(formData.counterpartTeacherId || "").trim();
  const counterpartLessonId = String(formData.counterpartLessonId || "").trim();
  const source = (db.lessonInstances || []).find((item) => item.id === sourceLessonId);
  const counterpart = (db.lessonInstances || []).find((item) => item.id === counterpartLessonId);
  const storedAccount = (db.accounts || []).find((item) => item.id === account?.id);
  const applicantTeacherId = String(account?.teacherId || storedAccount?.teacherId || "").trim();
  if (!applicantTeacherId) throw httpError(400, "当前账号未绑定教师档案，不能发起调课申请");
  if (!source || !counterpart) throw httpError(400, "请选择系统中已发布的两节课程");
  if (source.id === counterpart.id) throw httpError(400, "不能选择同一节课程互换");
  if (source.teacherId !== applicantTeacherId) throw httpError(403, "只能调整自己承担的课程");
  if (counterpart.teacherId === applicantTeacherId) throw httpError(400, "请选择另一位老师承担的课程");
  if (counterpart.teacherId !== counterpartTeacherId) throw httpError(400, "协商老师与所选课程不一致，请重新选择");
  if (source.source !== "backend-scheduling" || counterpart.source !== "backend-scheduling") {
    throw httpError(400, "只能选择已发布课表中的课程");
  }
  if (source.status === "cancelled" || counterpart.status === "cancelled") {
    throw httpError(400, "已取消的课程不能发起调课");
  }
  if (source.termId !== counterpart.termId || source.divisionId !== counterpart.divisionId) {
    throw httpError(400, "两节待交换课程必须属于同一学期、同一学部");
  }
  formData.sourceLessonId = source.id;
  formData.counterpartTeacherId = counterpart.teacherId;
  formData.counterpartLessonId = counterpart.id;
  formData.sourceLessonLabel = lessonSwapLabel(source);
  formData.counterpartLessonLabel = lessonSwapLabel(counterpart, { includeTeacher: true });
  formData.counterpartTeacherName = counterpart.teacherName || "";
  formData.stageId = source.stageId || stageIdForAccount(db, account);
  formData.termId = source.termId || "";
  formData.termName = (db.terms || []).find((term) => term.id === source.termId)?.name || "";
}

// 摘要标题：列表中一眼看清是什么申请（Lark 的列表也是这么呈现的）
function buildSummary(template, formData) {
  switch (template.key) {
    case "leave":
      return `${formData.leaveType} ${formData.days} 天（${formData.startDate} ${formData.startHalf} 至 ${formData.endDate} ${formData.endHalf}）`;
    case "outbound":
      return `外出：${formData.startDate} ${formData.startHalf} 至 ${formData.endDate} ${formData.endHalf}`;
    case "overtime":
      return `${formData.overtimeType} ${formData.overtimeDate} ${formData.hours} 小时`;
    case "overtime_batch":
      return `${formData.overtimeType} ${formData.overtimeDate} ${formData.hours} 小时 · ${Number(formData.participantCount || 0)} 人`;
    case "lesson_swap":
      return `${formData.sourceLessonLabel || "待调课程"} ⇄ ${formData.counterpartLessonLabel || "协商课程"}`;
    case "class_size_confirm":
      return `${formData.termName} · ${formData.stageName || "学部"} · 班级人数确认`;
    case "lesson_rule_confirm":
      return `${formData.termName} · ${formData.ruleScope}`;
    case "budget_confirm":
      return `${formData.termName} · ${formData.budgetScopeName || "学部"} ${Number(formData.amount).toLocaleString("zh-CN")} 元`;
    case "division_budget_use":
      return `${formData.termName} · ${formData.budgetScopeName || "本学部"} ${Number(formData.amount).toLocaleString("zh-CN")} 元`;
    case "payroll_approval":
      return `${formData.termName} · ${formData.stageName || "学部"} · ${formData.month}工资确认（${Number(formData.totalAmount || 0).toLocaleString("zh-CN")} 元）`;
    default:
      return String(formData.subject || template.name);
  }
}

// ---------------------------------------------------------------------------
// 通知
// ---------------------------------------------------------------------------

function pushOaNotification(db, { audience, accountIds = [], title, text, level = "info" }) {
  db.notifications.push({
    id: nextId("NTF-OA"),
    audience: audience || "",
    teacherIds: [],
    accountIds,
    title: String(title || "").trim(),
    text: String(text || "").trim(),
    source: "审批中心",
    level,
    createdAt: nowIso(),
    createdByAccountId: "SYSTEM",
    createdByName: "审批流程",
    readByAccountIds: [],
  });
}

// ---------------------------------------------------------------------------
// 抄送（验收 1.15 / 2.13）
//
// 抄送只给「看」的权限，不给「批」的权限——被抄送人点通过必须被拒绝，
// 否则等于绕过审批流增加了一条谁都能走的旁路。
//
// 另一个必须挡住的方向是泄密：抄送能让原本看不到这张单子的人看到它。
// 薪资、预算类单据里有全校工资数字，不能被抄给普通教师。因此可抄送的
// 角色由模板声明（ccAllowedRoles），而不是谁都能抄给谁。
// ---------------------------------------------------------------------------

// 默认放开到全部人员角色——验收 2.13 明确要求「抄送相关教师」，日常单据
// （请假、调课、加班）抄给同事是常规操作。真正敏感的单据（薪资、预算里有
// 全校工资数字）由模板自己声明 ccAllowedRoles 收紧，而不是反过来。
// classroom 是教室屏账号，没有人在看，不作为抄送对象。
const DEFAULT_CC_ALLOWED_ROLES = [
  "teacher",
  "admin",
  "hr",
  "finance",
  "division_head",
  "principal",
  "system_admin",
];

function ccAllowedRolesOf(template) {
  return Array.isArray(template?.ccAllowedRoles) && template.ccAllowedRoles.length
    ? template.ccAllowedRoles
    : DEFAULT_CC_ALLOWED_ROLES;
}

/** 能不能往这张单子上加抄送人：申请人、参与过的审批人、人事与行政管理 */
function canAddCc(request, account) {
  if (!account) return false;
  if (request.applicantAccountId === account.id) return true;
  if (["hr", "system_admin"].includes(account.role)) return true;
  return request.steps.some(
    (step) =>
      isStepApprover(step, account) &&
      (step.status === "pending" || step.approvals.some((v) => v.accountId === account.id)),
  );
}

export function isCcRecipient(request, account) {
  if (!account) return false;
  return (request.ccRecipients || []).some((item) => item.accountId === account.id);
}

/**
 * 把 accountIds 加进抄送名单。返回实际新增的条目。
 * 已在名单上的、申请人本人的会被跳过——重复抄送只会让通知变噪音。
 */
function addCcRecipients(db, request, accountIds, account, template, source = "applicant") {
  const ids = [...new Set((Array.isArray(accountIds) ? accountIds : []).map((id) => String(id).trim()).filter(Boolean))];
  if (!ids.length) return [];
  if (!canAddCc(request, account)) throw httpError(403, "无权为该审批单添加抄送人");

  const allowed = ccAllowedRolesOf(template);
  request.ccRecipients = request.ccRecipients || [];
  const existing = new Set(request.ccRecipients.map((item) => item.accountId));
  const added = [];

  ids.forEach((accountId) => {
    const target = db.accounts.find((item) => item.id === accountId);
    if (!target) throw httpError(400, `抄送对象不存在：${accountId}`);
    if (target.status === "disabled") throw httpError(400, `${target.name || target.username} 已停用，无法抄送`);
    if (!allowed.includes(target.role)) {
      throw httpError(403, `「${request.templateName}」不允许抄送给${roleLabelOf(target.role)}`);
    }
    // 申请人自己本来就看得到；重复抄送同一人只会重复推通知
    if (target.id === request.applicantAccountId || existing.has(target.id)) return;

    const entry = {
      accountId: target.id,
      name: target.name || target.username || "",
      role: target.role,
      source,
      addedByAccountId: account.id,
      addedByName: account.displayName || account.username || "",
      at: nowIso(),
    };
    request.ccRecipients.push(entry);
    existing.add(target.id);
    added.push(entry);
  });

  if (added.length) {
    pushOaNotification(db, {
      accountIds: added.map((item) => item.accountId),
      title: `抄送给您：${request.templateName}`,
      text: `${request.applicantName} 的「${request.summary}」抄送给您知悉，无需审批。`,
      level: "info",
    });
    request.timeline.push({
      action: "cc",
      actionLabel: "抄送",
      actorAccountId: account.id,
      actorName: account.displayName || account.username || "",
      comment: `抄送给 ${added.map((item) => item.name).join("、")}`,
      at: nowIso(),
    });
  }
  return added;
}

function roleLabelOf(role) {
  return (
    {
      teacher: "教师",
      admin: "教务",
      hr: "人事",
      finance: "财务",
      division_head: "学部负责人",
      principal: "校领导",
      system_admin: "行政管理",
      classroom: "教室屏",
    }[role] || role
  );
}

/** 供外部（路由）调用：给已存在的单子补抄送人 */
export function addOaCcRecipients(db, requestId, accountIds, account) {
  ensureCollections(db);
  const request = db.oaRequests.find((item) => item.id === requestId);
  if (!request) throw httpError(404, "审批单不存在");
  const template = findTemplate(db, request.templateKey);
  const added = addCcRecipients(db, request, accountIds, account, template, "approver");
  request.updatedAt = nowIso();
  return { added, ccRecipients: request.ccRecipients || [] };
}

/** 可抄送的候选人清单，供前端选择器使用 */
export function listCcCandidates(db, templateKey, keyword = "") {
  ensureCollections(db);
  const template = findTemplate(db, templateKey);
  const allowed = ccAllowedRolesOf(template);
  const needle = String(keyword || "").trim().toLowerCase();
  return db.accounts
    .filter((item) => allowed.includes(item.role) && item.status !== "disabled")
    .filter((item) => !needle || `${item.name} ${item.username}`.toLowerCase().includes(needle))
    .slice(0, 50)
    .map((item) => ({
      accountId: item.id,
      name: item.name || item.username,
      username: item.username,
      role: item.role,
      roleLabel: roleLabelOf(item.role),
    }));
}

function isStepApprover(step, account) {
  if (!step || !account) return false;
  const accountIds = Array.isArray(step.approverAccountIds) ? step.approverAccountIds : [];
  return accountIds.length ? accountIds.includes(account.id) : (step.approverRoles || []).includes(account.role);
}

function isExecutionAssignee(execution, account) {
  if (!execution || !account) return false;
  const accountIds = Array.isArray(execution.executorAccountIds) ? execution.executorAccountIds : [];
  return accountIds.length ? accountIds.includes(account.id) : (execution.executorRoles || []).includes(account.role);
}

function notifyStepApprovers(db, request, step, title, text, level = "warning") {
  if (!step) return;
  const accountIds = Array.isArray(step.approverAccountIds) ? step.approverAccountIds : [];
  if (accountIds.length) {
    pushOaNotification(db, { accountIds, title, text, level });
    return;
  }
  (step.approverRoles || []).forEach((role) => pushOaNotification(db, { audience: role, title, text, level }));
}

function notifyCurrentApprovers(db, request) {
  const step = request.steps[request.currentStepIndex];
  notifyStepApprovers(
    db,
    request,
    step,
    `待审批：${request.templateName}`,
    `${request.applicantName} 提交的「${request.summary}」等待您在「${step?.name || "当前"}」环节处理。`,
  );
}

function notifyExecutionAssignees(db, request, title = `待执行：${request.templateName}`, level = "warning") {
  const execution = request.execution;
  if (!execution) return;
  const text = `${request.applicantName} 的「${request.summary}」已全部审批通过，请完成「${execution.name}」；上传${execution.evidenceLabel || "执行凭证"}后标记已执行。`;
  const accountIds = Array.isArray(execution.executorAccountIds) ? execution.executorAccountIds : [];
  if (accountIds.length) {
    pushOaNotification(db, { accountIds, title, text, level });
    return;
  }
  (execution.executorRoles || []).forEach((role) => pushOaNotification(db, { audience: role, title, text, level }));
}

function stageIdForAccount(db, account) {
  if (!account) return "";
  const scopes = Array.isArray(account.scopeStageIds) ? account.scopeStageIds.map(String) : [];
  if (scopes.length === 1) return scopes[0];
  const teacher = account.teacherId ? (db.teachers || []).find((item) => item.id === account.teacherId) : null;
  return String(teacher?.stageId || "");
}

// 批量加班单完成后才抄送：总校人事行政、总校财务以及发起学部财务。
// 账号编号不是人员主键，故以当前角色和财务范围反查，人员替换后无需改模板。
function overtimeBatchCompletionCcAccountIds(db, request) {
  const stageId = String(request?.formData?.stageId || "");
  return [
    ...new Set(
      (db.accounts || [])
        .filter((item) => item.status !== "disabled")
        .filter((item) => {
          if (["hr", "system_admin"].includes(item.role)) return true;
          if (item.role !== "finance") return false;
          const scope = financeScopeFor(item);
          return scope === "headquarters" || scope === stageId;
        })
        .map((item) => item.id),
    ),
  ];
}

function resolveStepApproverAccounts(db, templateStep, applicant) {
  const ids = Array.isArray(templateStep.approverAccountIds) ? templateStep.approverAccountIds : [];
  if (!ids.length) return [];
  const candidates = ids
    .map((accountId) => (db.accounts || []).find((item) => item.id === accountId && item.status !== "disabled"))
    .filter(Boolean);
  const applicantStageId = stageIdForAccount(db, applicant);
  const matching = applicantStageId
    ? candidates.filter((item) => {
        const scopes = Array.isArray(item.scopeStageIds) ? item.scopeStageIds.map(String) : [];
        return !scopes.length || scopes.includes(applicantStageId);
      })
    : candidates;
  if (!matching.length) {
    throw httpError(400, "该审批流程没有与申请人所属学部匹配的审批人，请联系行政调整流程配置");
  }
  return matching;
}

// 执行环节也在发起时固化人员快照。之后即使模板修改或人员岗位调整，
// 已经发起的单据仍能清楚追溯“当时由谁负责执行”。
function buildRequestExecution(db, templateExecution, applicant) {
  if (!templateExecution) return null;
  const executorAccounts = resolveStepApproverAccounts(
    db,
    {
      approverAccountIds: templateExecution.executorAccountIds || [],
      approverRoles: templateExecution.executorRoles || [],
    },
    applicant,
  );
  const configuredIds = Array.isArray(templateExecution.executorAccountIds) ? templateExecution.executorAccountIds : [];
  if (configuredIds.length && !executorAccounts.length) {
    throw httpError(400, `「${templateExecution.name || "执行"}」未找到可用执行人，请联系行政调整流程配置`);
  }
  return {
    name: templateExecution.name || "执行",
    executorAccountIds: executorAccounts.map((item) => item.id),
    executorAccounts: executorAccounts.map((item) => ({
      accountId: item.id,
      name: item.name || item.username || "未命名",
      department: item.department || "未设置部门",
      title: item.title || roleLabelOf(item.role),
    })),
    executorRoles: executorAccounts.length ? [] : [...(templateExecution.executorRoles || [])],
    evidenceRequired: templateExecution.evidenceRequired !== false,
    evidenceLabel: templateExecution.evidenceLabel || "执行凭证",
    evidenceAttachmentIds: [],
    status: "waiting",
    comment: "",
    executedAt: "",
    executedByAccountId: "",
    executedByName: "",
  };
}

// ---------------------------------------------------------------------------
// 发起
// ---------------------------------------------------------------------------

export function createOaRequest(db, account, input = {}) {
  ensureCollections(db);
  const template = findTemplate(db, String(input.templateKey || "").trim());
  if (!template) throw httpError(400, "审批类型无效");
  if (template.status === "disabled") throw httpError(400, `「${template.name}」已停用`);
  if (!template.applicantRoles.includes(account?.role || "")) {
    throw httpError(403, `当前角色无法发起「${template.name}」`);
  }
  if (template.key === "budget_confirm" && !isHeadquartersFinance(account)) {
    throw httpError(403, "仅总校财务可以发起学部薪酬预算确认");
  }
  if (template.key === "payroll_approval") divisionPayrollScopeForAccount(account);
  // 人数所属学部由当前主任的权限范围反查，不能信任客户端提交的名称。
  const rawFormData = { ...(input.formData || {}) };
  const classSizeStageId = template.key === "class_size_confirm" ? classSizeStageForAccount(account) : "";
  if (classSizeStageId) rawFormData.stageName = financeScopeLabel(classSizeStageId);
  let payrollSnapshot = null;
  if (template.key === "payroll_approval") {
    const scopeId = divisionPayrollScopeForAccount(account);
    // 展示值与明细快照全部由服务端从已复核工资单计算，客户端不能自行篡改。
    payrollSnapshot = payrollSnapshotForScope(db, {
      termId: rawFormData.termId,
      month: rawFormData.month,
      scopeId,
      strict: true,
    });
    rawFormData.stageName = payrollSnapshot.stageName;
    rawFormData.headcount = payrollSnapshot.headcount;
    rawFormData.totalAmount = payrollSnapshot.totalAmount;
  }
  const formData = validateFormData(template, rawFormData);
  validateBusinessRules(template.key, formData);
  if (template.key === "lesson_swap") prepareLessonSwapFormData(db, account, formData);
  if (template.key === "overtime_batch") prepareOvertimeBatchFormData(db, account, formData);
  const now = nowIso();
  let requestTerm = resolveRequestTerm(db, {
    termId: formData.termId,
    termName: formData.termName,
    createdAt: now,
  });
  // 预算、班级人数与月度工资确认都必须由 termId 精确定位；已完成或归档期间只读。
  // 不允许手写名称或回退到当前学期，避免课表、工资与审批三套期间错位。
  if (["budget_confirm", "division_budget_use", "class_size_confirm", "payroll_approval"].includes(template.key)) {
    const termId = String(formData.termId || "").trim();
    const exactTerm = (db.terms || []).find((term) => term.id === termId);
    if (!exactTerm) throw httpError(400, "请选择系统中已建立的正式学期");
    const today = new Date().toISOString().slice(0, 10);
    const completed = Boolean(exactTerm.endDate && exactTerm.endDate < today);
    if (exactTerm.status === "archived" || completed) {
      const actionName =
        template.key === "class_size_confirm"
          ? "班级学生人数确认"
          : template.key === "payroll_approval"
            ? "月度工资确认"
            : "预算审批";
      throw httpError(409, `「${exactTerm.name}」已${exactTerm.status === "archived" ? "归档" : "完成"}，不能再发起${actionName}`);
    }
    requestTerm = exactTerm;
    // 名称仅由服务器从 termId 回填，前端不再有机会提交不一致的组合。
    formData.termId = exactTerm.id;
    formData.termName = exactTerm.name;
  }
  if (template.key === "payroll_approval") {
    const scopeId = divisionPayrollScopeForAccount(account);
    // 按最终标准化的 termId 重新生成一次快照，名称与主键不一致时也不会串期间。
    payrollSnapshot = payrollSnapshotForScope(db, {
      termId: formData.termId,
      month: formData.month,
      scopeId,
      strict: true,
    });
    const existing = (db.oaRequests || []).find(
      (item) =>
        item.templateKey === "payroll_approval" &&
        ["pending", "executing"].includes(item.status) &&
        item.termId === payrollSnapshot.termId &&
        item.formData?.month === payrollSnapshot.month &&
        item.formData?.stageId === scopeId,
    );
    if (existing) {
      throw httpError(409, `该学部 ${payrollSnapshot.month} 的工资确认正在流程中，请勿重复提交`);
    }
    formData.stageId = scopeId;
    formData.stageName = payrollSnapshot.stageName;
    formData.headcount = payrollSnapshot.headcount;
    formData.totalAmount = payrollSnapshot.totalAmount;
  }
  // 学部预算使用一律归发起人唯一的学部，浏览器传来的 scope 不可信，服务端覆盖。
  if (template.key === "division_budget_use") {
    const budgetScope = divisionBudgetScopeForAccount(account);
    formData.budgetScope = budgetScope;
    formData.budgetScopeName = financeScopeLabel(budgetScope);
  }
  if (template.key === "class_size_confirm") {
    const existing = (db.oaRequests || []).find(
      (item) =>
        item.templateKey === "class_size_confirm" &&
        ["pending", "executing"].includes(item.status) &&
        item.termId === formData.termId &&
        item.formData?.stageId === classSizeStageId,
    );
    if (existing) throw httpError(409, "本学部该学期已有进行中的班级人数确认，请勿重复提交");
    prepareClassSizeConfirmationFormData(db, account, formData);
  }
  // 预算核定按所选学部路由给唯一的学部主任；把学部同时固化在单据上，
  // 后续待办、权限过滤和台账查询都与这一个内部主键保持一致。
  if (template.key === "budget_confirm") {
    const budgetScope = String(formData.budgetScope || "").trim();
    const approverAccountId = divisionHeadAccountIdForBudgetScope(budgetScope);
    if (!approverAccountId) throw httpError(400, "预算学部未配置对应的学部主任");
    formData.budgetScope = budgetScope;
    formData.budgetScopeName = financeScopeLabel(budgetScope);
    formData.stageId = budgetScope;
  }

  const request = {
    id: nextId("OA"),
    templateKey: template.key,
    templateName: template.name,
    templateIcon: template.icon,
    category: template.category,
    summary: buildSummary(template, formData),
    applicantAccountId: account.id,
    applicantName: account.displayName || account.username || "",
    applicantRole: account.role,
    termId: requestTerm?.id || "",
    termName: requestTerm?.name || "",
    schoolYear: requestTerm?.schoolYear || "",
    formData,
    // 审批人看的不是实时试算，而是发起时的工资明细快照；执行前会再核验。
    payrollSnapshot: payrollSnapshot || null,
    status: "pending",
    currentStepIndex: 0,
    execution: buildRequestExecution(db, template.execution, account),
    steps: template.steps.map((step, index) => {
      const dynamicApproverAccountId =
        template.key === "budget_confirm" && step.dynamicBudgetScopeApprover
          ? divisionHeadAccountIdForBudgetScope(formData.budgetScope)
          : template.key === "payroll_approval" && step.dynamicDivisionScopeApprover
            ? divisionHeadAccountIdForBudgetScope(formData.stageId)
            : "";
      const effectiveStep = dynamicApproverAccountId
        ? { ...step, approverAccountIds: [dynamicApproverAccountId] }
        : step;
      const approverAccounts = resolveStepApproverAccounts(db, effectiveStep, account);
      return {
        index,
        name: effectiveStep.name,
        // 指定人员时，将该次申请按发起人学部收敛为实际待办人；旧模板继续保留按角色流转。
        approverAccountIds: approverAccounts.map((item) => item.id),
        approverAccounts: approverAccounts.map((item) => ({
          accountId: item.id,
          name: item.name || item.username || "未命名",
          department: item.department || "未设置部门",
          title: item.title || roleLabelOf(item.role),
        })),
        approverRoles: approverAccounts.length ? [] : [...(effectiveStep.approverRoles || [])],
        approverMode: effectiveStep.approverMode || "any",
        // 审批人需填写的内容（如代课安排），由上级在审批时录入
        approverFields: (effectiveStep.approverFields || []).map((field) => ({ ...field })),
        approverData: {},
        status: index === 0 ? "pending" : "waiting",
        approvals: [],
        comment: "",
        actedAt: "",
      };
    }),
    timeline: [
      {
        action: "submitted",
        actionLabel: "提交申请",
        actorAccountId: account.id,
        actorName: account.displayName || account.username || "",
        comment: "",
        at: now,
      },
    ],
    ccRecipients: [],
    createdAt: now,
    updatedAt: now,
    completedAt: "",
  };
  db.oaRequests.push(request);

  // 模板声明的固定抄送角色（如薪资审批抄送人事），加在申请人自选之前
  const templateCcIds = [
    ...(template.ccAccountIds || []).map(String),
    ...(template.ccRoles || []).flatMap((role) =>
      db.accounts.filter((item) => item.role === role && item.status !== "disabled").map((item) => item.id),
    ),
  ];
  addCcRecipients(db, request, [...templateCcIds, ...(input.ccAccountIds || [])], account, template, "applicant");

  notifyCurrentApprovers(db, request);
  return request;
}

// ---------------------------------------------------------------------------
// 审批动作
// ---------------------------------------------------------------------------

function canActOnStep(step, account) {
  if (!step || step.status !== "pending") return false;
  return isStepApprover(step, account);
}

export function actOnOaRequest(db, requestId, action, account, input = {}) {
  ensureCollections(db);
  const request = db.oaRequests.find((item) => item.id === requestId);
  if (!request) throw httpError(404, "审批单不存在");
  if (!scopedAccountCanAccessRequest(db, request, account)) throw httpError(403, "只能审批本学部申请");
  if (request.status !== "pending") {
    const closedLabel = request.status === "approved" ? "通过" : statusLabel(request.status);
    throw httpError(400, `该审批单已${closedLabel}，无法再处理`);
  }

  // 审批人可在处理的同时抄送相关人员（验收 2.13）。放在动作校验之前执行，
  // 是为了让「被抄送人尝试审批」这种越权在抄送写入前就被 canActOnStep 拦掉——
  // 否则会留下一条抄送记录却没有对应的审批动作。
  if (Array.isArray(input.ccAccountIds) && input.ccAccountIds.length) {
    if (!canActOnStep(request.steps[request.currentStepIndex], account)) {
      throw httpError(403, "当前环节不由您审批，无法附带抄送");
    }
    addCcRecipients(db, request, input.ccAccountIds, account, findTemplate(db, request.templateKey), "approver");
  }

  const step = request.steps[request.currentStepIndex];
  if (!canActOnStep(step, account)) {
    throw httpError(403, "当前环节不由您处理");
  }
  // 会签场景下同一人不能重复投票
  if (step.approvals.some((item) => item.accountId === account.id)) {
    throw httpError(400, "您已处理过该环节");
  }

  const comment = String(input.comment || "").trim();
  const now = nowIso();
  const actorName = account.displayName || account.username || "";

  if (action === "reject") {
    if (!comment) throw httpError(400, "拒绝时必须填写理由");
    step.status = "rejected";
    step.comment = comment;
    step.actedAt = now;
    step.approvals.push({ accountId: account.id, accountName: actorName, decision: "reject", comment, at: now });
    request.status = "rejected";
    request.completedAt = now;
    request.updatedAt = now;
    request.timeline.push({
      action: "rejected",
      actionLabel: `${step.name} 拒绝`,
      actorAccountId: account.id,
      actorName,
      comment,
      at: now,
    });
    pushOaNotification(db, {
      accountIds: [request.applicantAccountId],
      title: `审批被拒绝：${request.templateName}`,
      text: `您提交的「${request.summary}」在「${step.name}」被拒绝：${comment}`,
      level: "danger",
    });
    return request;
  }

  if (action !== "approve") throw httpError(400, "审批动作无效");

  // 审批人需填写的内容（如代课安排）在通过时校验并留痕
  const approverFields = step.approverFields || [];
  const pendingSideEffects = [];
  if (approverFields.length) {
    const submitted = input.approverData || {};
    const collected = {};
    approverFields.forEach((field) => {
      const raw = submitted[field.key];
      // 课程安排是结构化数组，审批通过后要真正落到课表
      if (field.type === "lessonArrangement") {
        const list = Array.isArray(raw) ? raw.filter((entry) => entry && entry.lessonId) : [];
        if (field.required && !list.length && !submitted[`${field.key}__empty`]) {
          throw httpError(400, `请安排「${field.label}」：请假期间的每节课都需指定代课教师或取消`);
        }
        const missing = list.find((entry) => entry.action !== "cancel" && !String(entry.substituteTeacherId || "").trim());
        if (missing) {
          throw httpError(400, `${missing.date || ""} ${missing.time || ""} 的课程未指定代课教师`);
        }
        collected[field.key] = list;
        const isOutbound = request.templateKey === "outbound";
        pendingSideEffects.push({
          type: "applySubstitutes",
          arrangements: list.map((entry) => ({
            ...entry,
            // 外出不同于请假：原任课老师的正常课时工资照发，代课老师另按代课单价结算。
            preserveOriginalLessonPay: isOutbound,
            arrangementContext: isOutbound ? "outbound" : "leave",
          })),
        });
        return;
      }
      const value = typeof raw === "string" ? raw.trim() : raw;
      if (field.required && (value === undefined || value === null || value === "")) {
        throw httpError(400, `请填写「${field.label}」`);
      }
      collected[field.key] = value === undefined || value === null ? "" : String(value);
    });
    // 先执行课表变更：若冲突校验失败则整单不通过，避免"审批过了但课表没改"
    pendingSideEffects.forEach((effect) => {
      if (effect.type !== "applySubstitutes") return;
      const handler = sideEffectHandlers.applySubstitutes;
      if (!handler) return;
      const result = handler(db, effect.arrangements, account);
      collected.lessonArrangementResult = result;
    });
    step.approverData = { ...step.approverData, ...collected };
  }

  // 调课在排课负责人点击通过的这一刻才实际交换课表。放在步骤状态写入之前，
  // 冲突、锁薪或课表被其他人抢先修改时会直接阻断，绝不会留下“审批已通过、课表没改”的死单。
  if (request.templateKey === "lesson_swap") {
    const handler = sideEffectHandlers.applyLessonSwap;
    if (!handler) throw httpError(503, "调课服务暂未就绪，请稍后重试");
    request.appliedResult = handler(db, {
      requestId: request.id,
      applicantAccountId: request.applicantAccountId,
      formData: request.formData || {},
      actorName,
      account,
    });
  }

  step.approvals.push({
    accountId: account.id,
    accountName: actorName,
    approverRole: account.role,
    decision: "approve",
    comment,
    at: now,
  });
  request.timeline.push({
    action: "approved",
    actionLabel: `${step.name} 通过`,
    actorAccountId: account.id,
    actorName,
    comment,
    at: now,
  });

  // 会签：每个审批角色都要有人通过；或签：任一人通过即进入下一环节
  const approverAccountIds = Array.isArray(step.approverAccountIds) ? step.approverAccountIds : [];
  const passed =
    step.approverMode === "all"
      ? approverAccountIds.length
        ? approverAccountIds.every((accountId) => step.approvals.some((item) => item.decision === "approve" && item.accountId === accountId))
        : (step.approverRoles || []).every((role) => step.approvals.some((item) => item.decision === "approve" && item.approverRole === role))
      : true;

  if (!passed) {
    step.comment = comment;
    request.updatedAt = now;
    return request;
  }

  step.status = "approved";
  step.comment = comment;
  step.actedAt = now;

  const nextIndex = request.currentStepIndex + 1;
  if (nextIndex < request.steps.length) {
    request.currentStepIndex = nextIndex;
    request.steps[nextIndex].status = "pending";
    request.updatedAt = now;
    notifyCurrentApprovers(db, request);
    return request;
  }

  request.updatedAt = now;
  // 所有审批通过时先落地“批准”的业务结果。例如预算使用在此刻占用学期台账；
  // 后续执行环节记录实际拨款及凭证，二者在时间线上明确区分。
  applyApprovedRequestEffects(db, request, account, actorName);
  const template = findTemplate(db, request.templateKey);
  if (request.execution) {
    request.status = "executing";
    request.execution.status = "pending";
    request.timeline.push({
      action: "approval_completed",
      actionLabel: `审批通过，待${request.execution.name}`,
      actorAccountId: account.id,
      actorName,
      comment: "",
      at: now,
    });
    notifyExecutionAssignees(db, request);
    pushOaNotification(db, {
      accountIds: [request.applicantAccountId],
      title: `审批通过，待执行：${request.templateName}`,
      text: `您提交的「${request.summary}」已全部审批通过，正等待「${request.execution.name}」执行。`,
      level: "success",
    });
    return request;
  }

  request.status = "approved";
  request.completedAt = now;
  const completionCcAccountIds = [
    ...(template?.completionCcAccountIds || []),
    ...(request.templateKey === "overtime_batch" ? overtimeBatchCompletionCcAccountIds(db, request) : []),
  ];
  if (completionCcAccountIds.length) {
    addCcRecipients(db, request, completionCcAccountIds, account, template, "completed");
  }
  request.timeline.push({
    action: "completed",
    actionLabel: "审批完成",
    actorAccountId: account.id,
    actorName,
    comment: "",
    at: now,
  });
  pushOaNotification(db, {
    accountIds: [request.applicantAccountId],
    title: `审批通过：${request.templateName}`,
    text: `您提交的「${request.summary}」已全部审批通过。`,
    level: "success",
  });
  return request;
}

export function canExecuteOaRequest(request, account, db = null) {
  if (request?.status !== "executing" || request.execution?.status !== "pending") return false;
  if (!isExecutionAssignee(request.execution, account)) return false;
  return scopedAccountCanAccessRequest(db, request, account);
}

// 执行凭证可先上传、后点击“已执行”。文件本体由路由层使用统一加密附件存储保存，
// 这里仅把已保存附件的元数据 ID 写进审批单，避免审批单直接携带文件内容。
export function addOaExecutionEvidence(db, requestId, attachments, account) {
  ensureCollections(db);
  const request = db.oaRequests.find((item) => item.id === requestId);
  if (!request) throw httpError(404, "审批单不存在");
  if (!canExecuteOaRequest(request, account, db)) throw httpError(403, "当前执行环节不由您处理");
  const list = Array.isArray(attachments) ? attachments : [];
  if (!list.length) throw httpError(400, "请上传至少一份执行凭证");
  const ids = new Set(request.execution.evidenceAttachmentIds || []);
  list.forEach((attachment) => {
    const id = String(attachment?.id || "").trim();
    if (id) ids.add(id);
  });
  request.execution.evidenceAttachmentIds = [...ids];
  request.updatedAt = nowIso();
  request.timeline.push({
    action: "execution_evidence_uploaded",
    actionLabel: `上传${request.execution.evidenceLabel || "执行凭证"}`,
    actorAccountId: account.id,
    actorName: account.displayName || account.username || "",
    comment: list.map((item) => item.originalName || item.id).filter(Boolean).join("、"),
    at: request.updatedAt,
  });
  return request;
}

export function executeOaRequest(db, requestId, account, input = {}) {
  ensureCollections(db);
  const request = db.oaRequests.find((item) => item.id === requestId);
  if (!request) throw httpError(404, "审批单不存在");
  if (!canExecuteOaRequest(request, account, db)) throw httpError(403, "当前执行环节不由您处理");
  const execution = request.execution;
  if (execution.evidenceRequired && !(execution.evidenceAttachmentIds || []).length) {
    throw httpError(400, `请先上传${execution.evidenceLabel || "执行凭证"}`);
  }
  const now = nowIso();
  const actorName = account.displayName || account.username || "";
  // 月度工资确认的真实落账点在这里：先校验审批快照与当前工资单一致，
  // 再批量锁定本学部工资。任何一项不满足都不改变执行状态，执行人可修正后重试。
  if (request.templateKey === "payroll_approval") {
    applyExecutedPayrollApprovalEffect(db, request, account, actorName);
  }
  execution.status = "executed";
  execution.comment = String(input.comment || "").trim();
  execution.executedAt = now;
  execution.executedByAccountId = account.id;
  execution.executedByName = actorName;
  request.status = "approved";
  request.completedAt = now;
  request.updatedAt = now;
  request.timeline.push({
    action: "executed",
    actionLabel: `${execution.name} 已执行`,
    actorAccountId: account.id,
    actorName,
    comment: execution.comment,
    at: now,
  });
  pushOaNotification(db, {
    accountIds: [request.applicantAccountId],
    title: `已执行办结：${request.templateName}`,
    text: `您提交的「${request.summary}」已由${actorName}完成「${execution.name}」并留存凭证。`,
    level: "success",
  });
  return request;
}

export function withdrawOaRequest(db, requestId, account) {
  ensureCollections(db);
  const request = db.oaRequests.find((item) => item.id === requestId);
  if (!request) throw httpError(404, "审批单不存在");
  if (request.applicantAccountId !== account.id) throw httpError(403, "只能撤回本人发起的申请");
  if (request.status !== "pending") throw httpError(400, "已结束的审批单无法撤回");

  const now = nowIso();
  request.status = "withdrawn";
  request.completedAt = now;
  request.updatedAt = now;
  request.steps.forEach((step) => {
    if (step.status === "pending" || step.status === "waiting") step.status = "skipped";
  });
  request.timeline.push({
    action: "withdrawn",
    actionLabel: "撤回申请",
    actorAccountId: account.id,
    actorName: account.displayName || account.username || "",
    comment: "",
    at: now,
  });
  return request;
}

// 催办：审批中催当前审批人；待执行时催指定执行人。
export function urgeOaRequest(db, requestId, account) {
  ensureCollections(db);
  const request = db.oaRequests.find((item) => item.id === requestId);
  if (!request) throw httpError(404, "审批单不存在");
  if (request.applicantAccountId !== account.id) throw httpError(403, "只能催办本人发起的申请");
  if (!['pending', 'executing'].includes(request.status)) throw httpError(400, "该审批单已结束");
  if (request.status === "executing") {
    notifyExecutionAssignees(db, request, `催办执行：${request.templateName}`, "danger");
    request.timeline.push({
      action: "execution_urged",
      actionLabel: "催办执行",
      actorAccountId: account.id,
      actorName: account.displayName || account.username || "",
      comment: "",
      at: nowIso(),
    });
    request.updatedAt = nowIso();
    return request;
  }
  const step = request.steps[request.currentStepIndex];
  notifyStepApprovers(
    db,
    request,
    step,
    `催办：${request.templateName}`,
    `${request.applicantName} 催办「${request.summary}」，请尽快在「${step.name}」环节处理。`,
  );
  request.timeline.push({
    action: "urged",
    actionLabel: "催办",
    actorAccountId: account.id,
    actorName: account.displayName || account.username || "",
    comment: "",
    at: nowIso(),
  });
  return request;
}

// ---------------------------------------------------------------------------
// 查询
// ---------------------------------------------------------------------------

function statusLabel(status) {
  return { pending: "审批中", executing: "待执行", approved: "已办结", rejected: "拒绝", withdrawn: "撤回" }[status] || status;
}

function requestStageId(db, request) {
  const explicit = request?.formData?.stageId || request?.formData?.fromStageId || request?.formData?.toStageId || "";
  if (explicit) return String(explicit);
  const applicant = (db?.accounts || []).find((item) => item.id === request?.applicantAccountId);
  return stageIdForAccount(db || {}, applicant);
}

function scopedAccountCanAccessRequest(db, request, account) {
  if (!db) return true;
  const scope = Array.isArray(account.scopeStageIds) ? account.scopeStageIds.map(String) : [];
  if (!scope.length) return true;
  // 预算单的待办只给审批步骤明确列出的账号放行；新单还会按表单中的预算学部
  // 收敛，存量单仍可按已固化的步骤追溯和处理。
  if (
    request?.templateKey === "budget_confirm" &&
    (request.steps || []).some((step) => (step.approverAccountIds || []).includes(account.id))
  ) {
    return true;
  }
  return Boolean(requestStageId(db, request) && scope.includes(requestStageId(db, request)));
}

export function isPendingForAccount(request, account, db = null) {
  if (request.status !== "pending") return false;
  const step = request.steps[request.currentStepIndex];
  if (!step) return false;
  if (!isStepApprover(step, account)) return false;
  if (!scopedAccountCanAccessRequest(db, request, account)) return false;
  return !step.approvals.some((item) => item.accountId === account.id);
}

function isTodoForAccount(request, account, db = null) {
  return isPendingForAccount(request, account, db) || canExecuteOaRequest(request, account, db);
}

// scope=todo 待我审批 / mine 我发起的 / all 全部（管理角色可见）
export function queryOaRequests(db, query = {}, account = null) {
  ensureCollections(db);
  const scope = String(query.scope || "todo");
  const status = String(query.status || "");
  const templateKey = String(query.templateKey || "");
  const termId = String(query.termId || "");
  const keyword = String(query.search || "").trim().toLowerCase();
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize || "20", 10), 1), 100);

  let items = [...db.oaRequests];
  if (scope === "todo") {
    items = items.filter((item) => isTodoForAccount(item, account, db));
  } else if (scope === "mine") {
    items = items.filter((item) => item.applicantAccountId === account?.id);
  } else if (scope === "cc") {
    items = items.filter((item) => isCcRecipient(item, account));
  } else if (scope === "handled") {
    // 我处理过的（含已完成的）
    items = items.filter(
      (item) =>
        item.steps.some((step) => step.approvals.some((vote) => vote.accountId === account?.id)) ||
        item.execution?.executedByAccountId === account?.id,
    );
  } else if (!["hr", "system_admin", "division_head", "admin", "finance"].includes(account?.role || "")) {
    // 普通教师没有全局查看权限，退回到本人相关
    items = items.filter(
      (item) =>
        item.applicantAccountId === account?.id ||
        isTodoForAccount(item, account, db) ||
        isCcRecipient(item, account),
    );
  }

  if (Array.isArray(account?.scopeStageIds) && account.scopeStageIds.length) {
    items = items.filter((item) => scopedAccountCanAccessRequest(db, item, account));
  }

  if (status) items = items.filter((item) => item.status === status);
  if (templateKey) items = items.filter((item) => item.templateKey === templateKey);
  if (termId) items = items.filter((item) => requestTermForHistory(db, item)?.id === termId);
  if (keyword) {
    items = items.filter((item) =>
      `${item.summary} ${item.templateName} ${item.applicantName}`.toLowerCase().includes(keyword),
    );
  }

  items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize).map((item) => summarizeRequest(item, account, db)),
    meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

function summarizeRequest(request, account, db = null) {
  const step = request.steps[request.currentStepIndex];
  const term = db ? requestTermForHistory(db, request) : null;
  return {
    id: request.id,
    templateKey: request.templateKey,
    templateName: request.templateName,
    templateIcon: request.templateIcon,
    termId: request.termId || term?.id || "",
    termName: request.termName || term?.name || "",
    schoolYear: request.schoolYear || term?.schoolYear || "",
    category: request.category,
    summary: request.summary,
    applicantName: request.applicantName,
    applicantAccountId: request.applicantAccountId,
    status: request.status,
    statusLabel: statusLabel(request.status),
    currentStepName: request.status === "pending" ? step?.name || "" : request.status === "executing" ? request.execution?.name || "执行" : "",
    canAct: isPendingForAccount(request, account, db),
    canExecute: canExecuteOaRequest(request, account, db),
    canWithdraw: request.status === "pending" && request.applicantAccountId === account?.id,
    isCc: isCcRecipient(request, account),
    ccCount: (request.ccRecipients || []).length,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export function getOaRequestDetail(db, requestId, account) {
  ensureCollections(db);
  const request = db.oaRequests.find((item) => item.id === requestId);
  if (!request) throw httpError(404, "审批单不存在");
  if (!scopedAccountCanAccessRequest(db, request, account)) throw httpError(403, "只能查看本学部申请");
  const isRelated =
    request.applicantAccountId === account?.id ||
    request.steps.some((step) => isStepApprover(step, account)) ||
    isExecutionAssignee(request.execution, account) ||
    // 抄送只给看的权限：能进详情，但下面的 canAct 仍然为假
    isCcRecipient(request, account) ||
    ["hr", "system_admin"].includes(account?.role || "");
  if (!isRelated) throw httpError(403, "无权查看该审批单");

  const template = findTemplate(db, request.templateKey);
  const currentStep = request.steps[request.currentStepIndex];
  const term = requestTermForHistory(db, request);
  return {
    ...request,
    termId: request.termId || term?.id || "",
    termName: request.termName || term?.name || "",
    schoolYear: request.schoolYear || term?.schoolYear || "",
    statusLabel: statusLabel(request.status),
    canAct: isPendingForAccount(request, account, db),
    canExecute: canExecuteOaRequest(request, account, db),
    canWithdraw: request.status === "pending" && request.applicantAccountId === account?.id,
    canUrge: ["pending", "executing"].includes(request.status) && request.applicantAccountId === account?.id,
    ccRecipients: request.ccRecipients || [],
    isCc: isCcRecipient(request, account),
    canAddCc: canAddCc(request, account),
    ccAllowedRoles: ccAllowedRolesOf(template),
    formFields: template?.formFields || [],
    // 当前环节要求审批人填写的内容（如代课安排），供前端在审批弹层中渲染
    currentApproverFields: request.status === "pending" ? currentStep?.approverFields || [] : [],
  };
}

export function countOaTodos(db, account) {
  ensureCollections(db);
  return db.oaRequests.filter((item) => isTodoForAccount(item, account, db)).length;
}

// 超时扫描：停留超过 N 个工作日提醒当前审批人（与人事流程同口径）
export function scanOaTimeouts(db, workdays = OA_TIMEOUT_WORKDAYS) {
  ensureCollections(db);
  const now = Date.now();
  let reminded = 0;
  db.oaRequests.forEach((request) => {
    if (request.status !== "pending") return;
    const step = request.steps[request.currentStepIndex];
    if (!step) return;
    const since = new Date(request.updatedAt || request.createdAt).getTime();
    const elapsedDays = (now - since) / 86400000;
    if (elapsedDays < workdays) return;
    if (request.timeoutRemindedAt) {
      const remindedDays = (now - new Date(request.timeoutRemindedAt).getTime()) / 86400000;
      if (remindedDays < workdays) return;
    }
    request.timeoutRemindedAt = nowIso();
    reminded += 1;
    notifyStepApprovers(
      db,
      request,
      step,
      `审批超时提醒：${request.templateName}`,
      `${request.applicantName} 的「${request.summary}」已在「${step.name}」停留超过 ${workdays} 个工作日，请尽快处理。`,
      "danger",
    );
  });
  return { reminded };
}
