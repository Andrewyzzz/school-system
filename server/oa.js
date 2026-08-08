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
import { BUDGET_SCOPE_FIELDS, applyTermBudgetFromApproval, ensureBudgetStore } from "./budget.js";

function httpError(statusCode, message, details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

// 审批单指定的学期：按学期名精确匹配，匹配不到落到当前学期。
// 学期初编预算时申请单上写的就是即将开始的那个学期，通常已经建好。
function resolveRequestTerm(db, termName) {
  const terms = db.terms || [];
  const wanted = String(termName || "").trim();
  return terms.find((item) => item.name === wanted) || terms.find((item) => item.current) || terms[0] || null;
}

// 整单通过后落地的业务数据。目前只有预算；后续新增按 templateKey 分支。
function applyApprovedRequestEffects(db, request, account, actorName) {
  if (request.templateKey !== "budget_confirm") return;
  const term = resolveRequestTerm(db, request.formData?.termName);
  if (!term) return;
  const amounts = {};
  BUDGET_SCOPE_FIELDS.forEach((field) => {
    amounts[field.scopeId] = Number(request.formData?.[field.key] || 0);
  });
  const written = applyTermBudgetFromApproval(db, {
    termId: term.id,
    termName: term.name,
    amounts,
    requestId: request.id,
    actorName,
  });
  request.appliedResult = {
    type: "term_budget",
    termId: term.id,
    termName: term.name,
    scopes: written.map((row) => ({ scope: row.scope, scopeName: row.scopeName, amount: row.amount })),
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
// 因此内置模板提升 schemaVersion 时强制同步 formFields，但不动 steps ——
// 审批流程是学校可以 DIY 的，升级不该把人家改过的审批线路重置掉。
function upgradeTemplateSchema(existing, seed) {
  const seedVersion = Number(seed.schemaVersion || 1);
  const currentVersion = Number(existing.schemaVersion || 1);
  if (seedVersion <= currentVersion) return false;
  existing.formFields = JSON.parse(JSON.stringify(seed.formFields || []));
  existing.schemaVersion = seedVersion;
  existing.updatedAt = nowIso();
  existing.updatedByName = "系统升级";
  return true;
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
      { key: "endDate", label: "结束日期", type: "date", required: true },
      { key: "days", label: "请假天数", type: "number", required: true, hint: "含起止日，半天填 0.5" },
      { key: "reason", label: "请假事由", type: "textarea", required: true, placeholder: "请说明请假原因" },
      { key: "attachment", label: "证明材料", type: "text", required: false, hint: "病假需附就诊证明，可填写材料说明或提交纸质件" },
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
    key: "overtime",
    name: "加班申请",
    icon: "🌙",
    category: "考勤",
    description: "周末、节假日及日常超时加班申请",
    applicantRoles: ["teacher", "admin", "finance", "hr", "division_head", "system_admin"],
    formFields: [
      { key: "overtimeDate", label: "加班日期", type: "date", required: true },
      { key: "startTime", label: "开始时间", type: "text", required: true, placeholder: "如 18:00" },
      { key: "endTime", label: "结束时间", type: "text", required: true, placeholder: "如 21:00" },
      { key: "hours", label: "加班时长（小时）", type: "number", required: true },
      { key: "overtimeType", label: "加班类型", type: "select", required: true, options: ["日常超时", "周末加班", "节假日加班", "夜班"] },
      { key: "reason", label: "加班事由", type: "textarea", required: true },
    ],
    steps: [{ name: "部门负责人确认", approverRoles: ["division_head", "admin", "hr", "system_admin"], approverMode: "any" }],
  },
  {
    key: "attendance_fix",
    name: "补卡申请",
    icon: "⏱️",
    category: "考勤",
    description: "漏打卡、设备异常等情况的考勤补记",
    applicantRoles: ["teacher", "admin", "finance", "hr", "division_head", "system_admin"],
    formFields: [
      { key: "fixDate", label: "补卡日期", type: "date", required: true },
      { key: "fixType", label: "补卡类型", type: "select", required: true, options: ["上班卡", "下班卡", "全天"] },
      { key: "reason", label: "补卡原因", type: "textarea", required: true, placeholder: "请说明未正常打卡的原因" },
    ],
    steps: [{ name: "部门负责人审批", approverRoles: ["division_head", "admin", "hr", "system_admin"], approverMode: "any" }],
  },
  {
    key: "lesson_swap",
    name: "调课申请",
    icon: "🔄",
    category: "教学",
    description: "教师发起调课或代课，教务审批后执行",
    applicantRoles: ["teacher", "admin", "division_head", "system_admin"],
    formFields: [
      { key: "lessonDate", label: "原课程日期", type: "date", required: true },
      { key: "lessonInfo", label: "原课程信息", type: "text", required: true, placeholder: "班级 / 科目 / 节次" },
      { key: "swapType", label: "希望的调课方式", type: "radio", required: true, options: ["调换时间", "他人代课"] },
      { key: "reason", label: "调课原因", type: "textarea", required: true },
    ],
    steps: [
      {
        name: "教务审批",
        approverRoles: ["admin", "system_admin"],
        approverMode: "any",
        // 具体调到哪节、由谁代课，由教务统筹安排
        approverFields: [
          {
            key: "arrangement",
            label: "调课安排",
            type: "textarea",
            required: true,
            hint: "写明调整后的时间或代课教师，通过后按此执行",
          },
        ],
      },
    ],
  },
  {
    key: "class_size_confirm",
    name: "班级学生人数确认",
    icon: "👥",
    category: "学期事项",
    description: "学期初确认各班学生人数，作为班主任、生活教师津贴的计算依据",
    applicantRoles: ["admin", "division_head", "hr", "system_admin"],
    formFields: [
      { key: "termName", label: "适用学期", type: "text", required: true, placeholder: "如 2026学年第一学期" },
      { key: "effectiveMonth", label: "生效月份", type: "text", required: true, placeholder: "如 2026-09" },
      { key: "scopeInfo", label: "确认范围", type: "text", required: true, placeholder: "如 小学部全部班级" },
      { key: "classDetail", label: "班级与人数明细", type: "textarea", required: true, hint: "每行一条，格式：班级名称,学生人数" },
      { key: "reason", label: "说明", type: "textarea", required: false, hint: "人数变动原因等" },
    ],
    steps: [
      { name: "学部负责人核对", approverRoles: ["division_head", "admin"], approverMode: "any" },
      { name: "财务确认", approverRoles: ["finance"], approverMode: "any" },
      { name: "总校审批", approverRoles: ["system_admin"], approverMode: "any" },
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
    name: "薪酬总额预算确认",
    icon: "📊",
    category: "学期事项",
    description: "学期初薪酬总额预算方案的审议与审批",
    // v2：分部门明细由自由文本改为四个结构化口径，审批通过后自动落地为学期预算
    schemaVersion: 2,
    applicantRoles: ["finance", "hr", "system_admin"],
    // 分部门明细拆成四个结构化口径，与四个财务账号的管辖范围一一对应：
    // 审批通过后直接写入本学期预算，财务侧只读展示，无需人工再录一遍。
    formFields: [
      { key: "termName", label: "适用学期", type: "text", required: true },
      { key: "totalBudget", label: "薪酬总额预算（元）", type: "number", required: true },
      { key: "payoutRatio", label: "发放比例（%）", type: "number", required: true, hint: "制度规定原则上 90% 用于薪酬发放" },
      { key: "reserveRatio", label: "预留比例（%）", type: "number", required: true, hint: "预留作学期专项奖金" },
      { key: "budget_primary", label: "小学部预算（元）", type: "number", required: true },
      { key: "budget_middle", label: "初中部预算（元）", type: "number", required: true },
      { key: "budget_high", label: "高中部预算（元）", type: "number", required: true },
      { key: "budget_headquarters", label: "总校行政后勤预算（元）", type: "number", required: true, hint: "行政、后勤、教辅职员工薪酬" },
      { key: "reason", label: "编制说明", type: "textarea", required: true },
    ],
    steps: [
      { name: "人事复核", approverRoles: ["hr"], approverMode: "any" },
      { name: "总校审批", approverRoles: ["system_admin"], approverMode: "any" },
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
export function listTemplatesForRole(db, role = "") {
  ensureOaTemplates(db);
  return db.oaTemplates
    .filter((template) => template.status !== "disabled" && template.applicantRoles.includes(role))
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
    .map((template) => ({
      key: template.key,
      name: template.name,
      icon: template.icon,
      category: template.category,
      description: template.description,
      formFields: template.formFields,
      steps: template.steps.map((step) => ({ name: step.name, approverRoles: step.approverRoles })),
    }));
}

// ---------------------------------------------------------------------------
// 模板配置（行政管理自定义审批流程）
// ---------------------------------------------------------------------------

export const OA_APPROVER_ROLES = [
  { value: "division_head", label: "学部负责人" },
  { value: "admin", label: "教务" },
  { value: "hr", label: "人事专员" },
  { value: "finance", label: "财务" },
  { value: "system_admin", label: "行政管理" },
];

export const OA_FIELD_TYPES = [
  { value: "text", label: "单行文本" },
  { value: "textarea", label: "多行文本" },
  { value: "number", label: "数字" },
  { value: "date", label: "日期" },
  { value: "select", label: "下拉选择" },
  { value: "radio", label: "单选" },
];

export function listAllTemplates(db) {
  ensureOaTemplates(db);
  return [...db.oaTemplates].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
}

function validateTemplateInput(input, { requireKey = true } = {}) {
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
      placeholder: String(field.placeholder || ""),
      hint: String(field.hint || ""),
      options,
    };
  });

  const steps = Array.isArray(input.steps) ? input.steps : [];
  if (!steps.length) throw httpError(400, "至少配置一个审批环节");
  if (steps.length > 8) throw httpError(400, "审批环节最多 8 级");
  const normalizedSteps = steps.map((step, index) => {
    const stepName = String(step.name || "").trim();
    if (!stepName) throw httpError(400, `第 ${index + 1} 个环节缺少名称`);
    const approverRoles = Array.isArray(step.approverRoles) ? step.approverRoles.filter(Boolean) : [];
    if (!approverRoles.length) throw httpError(400, `环节「${stepName}」必须指定审批角色`);
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
      approverRoles,
      approverMode: step.approverMode === "all" ? "all" : "any",
      approverFields: normalizedApproverFields,
    };
  });

  return {
    key,
    name,
    icon: String(input.icon || "📝").slice(0, 4),
    category: String(input.category || "其他").trim() || "其他",
    description: String(input.description || "").trim(),
    applicantRoles,
    formFields: normalizedFields,
    steps: normalizedSteps,
  };
}

export function createOaTemplate(db, input, account) {
  ensureOaTemplates(db);
  const data = validateTemplateInput(input);
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
  const data = validateTemplateInput({ ...input, key }, { requireKey: false });
  Object.assign(template, {
    name: data.name,
    icon: data.icon,
    category: data.category,
    description: data.description,
    applicantRoles: data.applicantRoles,
    formFields: data.formFields,
    steps: data.steps,
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
    const value = typeof raw === "string" ? raw.trim() : raw;
    const isEmpty = value === undefined || value === null || value === "";
    if (field.required && isEmpty) {
      throw httpError(400, `请填写「${field.label}」`);
    }
    if (isEmpty) {
      clean[field.key] = "";
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

// 请假等带日期区间的模板做基本合理性校验
function validateBusinessRules(templateKey, formData) {
  if (templateKey === "leave") {
    if (formData.endDate < formData.startDate) {
      throw httpError(400, "结束日期不能早于开始日期");
    }
    if (Number(formData.days) <= 0) throw httpError(400, "请假天数必须大于 0");
  }
  if (templateKey === "budget_confirm") {
    const total = Number(formData.payoutRatio) + Number(formData.reserveRatio);
    if (Math.abs(total - 100) > 0.01) {
      throw httpError(400, `发放比例与预留比例之和应为 100%，当前为 ${total}%`);
    }
    // 四个口径之和必须等于总额，否则预算落地后各部合计对不上总校报的数
    const parts = BUDGET_SCOPE_FIELDS.map((field) => Number(formData[field.key] || 0));
    const partsSum = parts.reduce((sum, value) => sum + value, 0);
    const totalBudget = Number(formData.totalBudget || 0);
    if (Math.abs(partsSum - totalBudget) > 0.01) {
      throw httpError(
        400,
        `各口径预算之和应等于薪酬总额预算 ${totalBudget.toLocaleString("zh-CN")} 元，当前为 ${partsSum.toLocaleString("zh-CN")} 元`,
      );
    }
  }
}

// 摘要标题：列表中一眼看清是什么申请（Lark 的列表也是这么呈现的）
function buildSummary(template, formData) {
  switch (template.key) {
    case "leave":
      return `${formData.leaveType} ${formData.days} 天（${formData.startDate} 至 ${formData.endDate}）`;
    case "overtime":
      return `${formData.overtimeType} ${formData.overtimeDate} ${formData.hours} 小时`;
    case "attendance_fix":
      return `${formData.fixDate} ${formData.fixType}`;
    case "lesson_swap":
      return `${formData.lessonDate} ${formData.lessonInfo} · ${formData.swapType}`;
    case "class_size_confirm":
      return `${formData.termName} · ${formData.scopeInfo}`;
    case "lesson_rule_confirm":
      return `${formData.termName} · ${formData.ruleScope}`;
    case "budget_confirm":
      return `${formData.termName} · 总额 ${Number(formData.totalBudget).toLocaleString("zh-CN")} 元（分 ${BUDGET_SCOPE_FIELDS.length} 个口径）`;
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

function notifyCurrentApprovers(db, request) {
  const step = request.steps[request.currentStepIndex];
  if (!step) return;
  step.approverRoles.forEach((role) => {
    pushOaNotification(db, {
      audience: role,
      title: `待审批：${request.templateName}`,
      text: `${request.applicantName} 提交的「${request.summary}」等待您在「${step.name}」环节处理。`,
      level: "warning",
    });
  });
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
  const formData = validateFormData(template, input.formData || {});
  validateBusinessRules(template.key, formData);

  const now = nowIso();
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
    formData,
    status: "pending",
    currentStepIndex: 0,
    steps: template.steps.map((step, index) => ({
      index,
      name: step.name,
      approverRoles: [...step.approverRoles],
      approverMode: step.approverMode || "any",
      // 审批人需填写的内容（如代课安排），由上级在审批时录入
      approverFields: (step.approverFields || []).map((field) => ({ ...field })),
      approverData: {},
      status: index === 0 ? "pending" : "waiting",
      approvals: [],
      comment: "",
      actedAt: "",
    })),
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
    createdAt: now,
    updatedAt: now,
    completedAt: "",
  };
  db.oaRequests.push(request);
  notifyCurrentApprovers(db, request);
  return request;
}

// ---------------------------------------------------------------------------
// 审批动作
// ---------------------------------------------------------------------------

function canActOnStep(step, account) {
  if (!step || step.status !== "pending") return false;
  return step.approverRoles.includes(account?.role || "");
}

export function actOnOaRequest(db, requestId, action, account, input = {}) {
  ensureCollections(db);
  const request = db.oaRequests.find((item) => item.id === requestId);
  if (!request) throw httpError(404, "审批单不存在");
  if (request.status !== "pending") throw httpError(400, `该审批单已${statusLabel(request.status)}，无法再处理`);

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
        pendingSideEffects.push({ type: "applySubstitutes", arrangements: list });
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
  const passed =
    step.approverMode === "all"
      ? step.approverRoles.every((role) =>
          step.approvals.some((item) => item.decision === "approve" && item.approverRole === role),
        )
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

  request.status = "approved";
  request.completedAt = now;
  request.updatedAt = now;
  // 整单通过才落地业务数据：预算写入放在这里而不是某一步通过时，
  // 避免人事复核过了但总校还没批就已经改了预算。
  applyApprovedRequestEffects(db, request, account, actorName);
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

// 催办：给当前环节审批人再推一次通知
export function urgeOaRequest(db, requestId, account) {
  ensureCollections(db);
  const request = db.oaRequests.find((item) => item.id === requestId);
  if (!request) throw httpError(404, "审批单不存在");
  if (request.applicantAccountId !== account.id) throw httpError(403, "只能催办本人发起的申请");
  if (request.status !== "pending") throw httpError(400, "该审批单已结束");
  const step = request.steps[request.currentStepIndex];
  step.approverRoles.forEach((role) => {
    pushOaNotification(db, {
      audience: role,
      title: `催办：${request.templateName}`,
      text: `${request.applicantName} 催办「${request.summary}」，请尽快在「${step.name}」环节处理。`,
      level: "warning",
    });
  });
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
  return { pending: "审批中", approved: "通过", rejected: "拒绝", withdrawn: "撤回" }[status] || status;
}

export function isPendingForAccount(request, account) {
  if (request.status !== "pending") return false;
  const step = request.steps[request.currentStepIndex];
  if (!step) return false;
  if (!step.approverRoles.includes(account?.role || "")) return false;
  return !step.approvals.some((item) => item.accountId === account.id);
}

// scope=todo 待我审批 / mine 我发起的 / all 全部（管理角色可见）
export function queryOaRequests(db, query = {}, account = null) {
  ensureCollections(db);
  const scope = String(query.scope || "todo");
  const status = String(query.status || "");
  const templateKey = String(query.templateKey || "");
  const keyword = String(query.search || "").trim().toLowerCase();
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize || "20", 10), 1), 100);

  let items = [...db.oaRequests];
  if (scope === "todo") {
    items = items.filter((item) => isPendingForAccount(item, account));
  } else if (scope === "mine") {
    items = items.filter((item) => item.applicantAccountId === account?.id);
  } else if (scope === "handled") {
    // 我处理过的（含已完成的）
    items = items.filter((item) =>
      item.steps.some((step) => step.approvals.some((vote) => vote.accountId === account?.id)),
    );
  } else if (!["hr", "system_admin", "division_head", "admin", "finance"].includes(account?.role || "")) {
    // 普通教师没有全局查看权限，退回到本人相关
    items = items.filter(
      (item) => item.applicantAccountId === account?.id || isPendingForAccount(item, account),
    );
  }

  if (status) items = items.filter((item) => item.status === status);
  if (templateKey) items = items.filter((item) => item.templateKey === templateKey);
  if (keyword) {
    items = items.filter((item) =>
      `${item.summary} ${item.templateName} ${item.applicantName}`.toLowerCase().includes(keyword),
    );
  }

  items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize).map((item) => summarizeRequest(item, account)),
    meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

function summarizeRequest(request, account) {
  const step = request.steps[request.currentStepIndex];
  return {
    id: request.id,
    templateKey: request.templateKey,
    templateName: request.templateName,
    templateIcon: request.templateIcon,
    category: request.category,
    summary: request.summary,
    applicantName: request.applicantName,
    applicantAccountId: request.applicantAccountId,
    status: request.status,
    statusLabel: statusLabel(request.status),
    currentStepName: request.status === "pending" ? step?.name || "" : "",
    canAct: isPendingForAccount(request, account),
    canWithdraw: request.status === "pending" && request.applicantAccountId === account?.id,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export function getOaRequestDetail(db, requestId, account) {
  ensureCollections(db);
  const request = db.oaRequests.find((item) => item.id === requestId);
  if (!request) throw httpError(404, "审批单不存在");
  const isRelated =
    request.applicantAccountId === account?.id ||
    request.steps.some((step) => step.approverRoles.includes(account?.role || "")) ||
    ["hr", "system_admin"].includes(account?.role || "");
  if (!isRelated) throw httpError(403, "无权查看该审批单");

  const template = findTemplate(db, request.templateKey);
  const currentStep = request.steps[request.currentStepIndex];
  return {
    ...request,
    statusLabel: statusLabel(request.status),
    canAct: isPendingForAccount(request, account),
    canWithdraw: request.status === "pending" && request.applicantAccountId === account?.id,
    canUrge: request.status === "pending" && request.applicantAccountId === account?.id,
    formFields: template?.formFields || [],
    // 当前环节要求审批人填写的内容（如代课安排），供前端在审批弹层中渲染
    currentApproverFields: request.status === "pending" ? currentStep?.approverFields || [] : [],
  };
}

export function countOaTodos(db, account) {
  ensureCollections(db);
  return db.oaRequests.filter((item) => isPendingForAccount(item, account)).length;
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
    step.approverRoles.forEach((role) => {
      pushOaNotification(db, {
        audience: role,
        title: `审批超时提醒：${request.templateName}`,
        text: `${request.applicantName} 的「${request.summary}」已在「${step.name}」停留超过 ${workdays} 个工作日，请尽快处理。`,
        level: "danger",
      });
    });
  });
  return { reminded };
}
