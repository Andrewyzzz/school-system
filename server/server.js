import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createToken, verifyPassword, verifyPasswordAsync } from "./auth.js";
import { assertConfigOrExit, inspectConfig } from "./config.js";
import { parseMultipart } from "./multipart.js";
import { canTeacherAccessPayrollMonth } from "./payrollVisibility.js";
import {
  ATTACHMENT_CATEGORIES,
  MAX_ATTACHMENT_BYTES,
  deleteAttachment,
  listAttachments,
  readAttachment,
  saveAttachment,
} from "./hrAttachments.js";
import { commitTeacherImport, previewTeacherImport } from "./importTeachers.js";
import { queryTermBudget } from "./budget.js";
import { buildScheduleGrid, exportSchedule } from "./scheduleExport.js";
import {
  buildAnnualSalary,
  buildWeeklyWorkload,
  exportAnnualSalary,
  exportPayrollSheet,
  exportWeeklyWorkload,
} from "./reports.js";
import {
  ENTITY_KEYS,
  buildResourceLedger,
  commitEntityImport,
  entitySpec,
  exportEntityCsv,
  exportEntityTemplate,
  exportResourceLedger,
  previewEntityImport,
} from "./dataPorting.js";
import {
  canExportAllPayrollDetails,
  canFinanceActOnTeacher,
  canFinanceReadTeacher,
  filterStageRowsByFinanceScope,
  filterTeachersByFinanceScope,
  financeScopeFor,
  financeReadScopeFor,
  financeScopeLabel,
  payrollScopeOfTeacher,
} from "./financeScope.js";
import { accountStageScopeIds, assertSchedulingAccess, stageIdForDivision } from "./accessScope.js";
import { accountHasRole, accountHasAnyRole } from "./accountRoles.js";
import {
  cancelScheduleGenerationJob,
  getScheduleGenerationJob,
  scheduleGenerationJobResponse,
  startScheduleGenerationJob,
} from "./schedulingJobs.js";
import {
  approveScheduleChangeRequest,
  adjustScheduleAssignment,
  autoAssignGradeTeachers,
  checkSolverAvailability,
  createScheduleChangeRequest,
  createScheduleConstraint,
  createGradeCourse,
  deleteScheduleConstraint,
  deleteGradeCourse,
  findScheduleDraft,
  generateScheduleDraft,
  listScheduleVersions,
  previewSchedulePrecheck,
  publishScheduleDraft,
  regenerateUnlockedScheduleAssignments,
  rollbackScheduleVersion,
  setScheduleAssignmentLock,
  updateSchedulePeriods,
  updateGradeClassStructure,
  updateGradeCourseRules,
  updateRoomResources,
  updateTeacherScheduleRule,
  listTeacherLessonsInRange,
  listSubstituteCandidates,
  applySubstituteArrangements,
  listLessonSwapOptions,
  applyApprovedLessonSwap,
} from "./scheduling.js";
import {
  appendAuditLog,
  confirmMonthlyWorkload,
  approveMonthlyWorkload,
  archiveAcademicTerm,
  changeOwnPassword,
  createAcademicTerm,
  createNotification,
  createSession,
  deleteAcademicTerm,
  confirmTeacherPayrollDetail,
  ensureDatabase,
  exportPayrollDetails,
  findActiveSession,
  findAccountByUsername,
  findTeacher,
  generatePayrollBatch,
  generateTeacherPayrollDetail,
  disputeTeacherPayrollDetail,
  lockTeacherPayrollDetail,
  lockPayrollBatch,
  markNotificationRead,
  publicAccount,
  queryNotifications,
  queryPayrollHistory,
  queryPersonnel,
  queryAcademicCalendar,
  queryTeacherLessonRecords,
  queryTeacherAssignments,
  queryTerms,
  queryTeachers,
  referenceCatalog,
  resetAccountPassword,
  revokeSession,
  reviewTeacherPayrollDetail,
  saveDatabase,
  saveAcademicCalendarEntry,
  setCurrentAcademicTerm,
  setAccountStatus,
  teacherLessonsForWeek,
  teacherScheduleWeeks,
  teacherMonthlyWorkload,
  teacherPayrollDetail,
  teacherPayrollPreview,
  unlockTeacherPayrollDetail,
  updatePayrollRules,
  updateTeacherSalaryProfile,
  updateTeacherAssignment,
  validatePhase1Readiness,
  storageHealth,
  DB_DRIVER,
  invalidateOpenPayrollDetailsForTeacher,
} from "./storage.js";
import {
  ensureSchemaConstraints,
  postgresHealth,
  postgresPing,
  queryArchivedRows,
} from "./db/postgresStore.js";
import {
  LEDGER_TYPES,
  autoArchiveEndedTerms,
  buildLedgerBackup,
  carryOverRoster,
  exportLedgerData,
  importLedgerBackup,
  ledgerBackupFilename,
  resolveLedgerRows,
  findLedger,
  initializeLedger,
  ledgerDetail,
  listLedgers,
  transitionLedger,
  unlockLedgerByApproval,
} from "./ledgers.js";
import { buildAuditReport } from "./auditReport.js";
import { createMonitor } from "./monitoring.js";
import { latestReconciliation, runReconciliation } from "./reconcile.js";
import { piiEncryptionReady } from "./security/pii.js";
import {
  addEmployeeContract,
  addSalaryTemplateVersion,
  applySalaryTemplate,
  createEmployee,
  createPersonnelTag,
  createOrgUnit,
  createPosition,
  createProfileChangeRequest,
  createSalaryTemplate,
  ensureHrData,
  exportEmployeesCsv,
  getEmployeeDetail,
  getMyHrProfile,
  queryEmployees,
  queryPersonnelTags,
  queryHrAuditLogs,
  queryOrgUnits,
  queryPositions,
  queryProfileChangeRequests,
  querySalaryTemplates,
  reviewProfileChangeRequest,
  revealSensitiveField,
  approveHrFlowStep,
  countHrTodos,
  createHrFlow,
  hrScopeFor,
  assertEmployeeInScope,
  queryHrFlows,
  scanHrFlowTimeouts,
  withdrawHrFlow,
  setEmployeeStatus,
  deletePersonnelTag,
  setOrgUnitStatus,
  updateEmployee,
  updateEmployeeContract,
  updateOrgUnit,
  updatePosition,
  withdrawProfileChangeRequest,
  queryMonthlyAssessments,
  upsertMonthlyAssessment,
  TITLE_GRADES,
  DEGREE_OPTIONS,
  TEACHER_ROLE_FIELDS,
} from "./hr.js";
import {
  addOaCcRecipients,
  listCcCandidates,
  registerOaSideEffect,
  listTemplatesForRole,
  listAllTemplates,
  listOaApproverAccounts,
  createOaTemplate,
  updateOaTemplate,
  setOaTemplateStatus,
  deleteOaTemplate,
  ensureOaTemplates,
  OA_APPROVER_ROLES,
  OA_FIELD_TYPES,
  createOaRequest,
  listPayrollApprovalOptions,
  actOnOaRequest,
  addOaExecutionEvidence,
  executeOaRequest,
  withdrawOaRequest,
  urgeOaRequest,
  queryOaRequests,
  getOaRequestDetail,
  countOaTodos,
  scanOaTimeouts,
} from "./oa.js";

// 薪资审批表单里的「适用范围」存的是中文标签，锁定时要换回内部 scopeId
const PAYROLL_SCOPE_BY_LABEL = {
  幼儿园: "kindergarten",
  小学部: "primary",
  初中部: "middle",
  高中部: "high",
  总校行政后勤: "headquarters",
};

const PORT = Number.parseInt(process.env.PORT || "4173", 10);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_ROOT = fileURLToPath(new URL("../", import.meta.url));
const MAX_OA_ATTACHMENTS = 3;

function oaAttachmentOwnerId(requestId) {
  // 复用已通过加密、魔数校验和备份验证的附件存储，但用独立命名空间
  // 隔离人员档案附件，避免 OA 单号与员工 ID 偶然重名。
  return `OA:${requestId}`;
}

function lessonIsInLeaveHalfRange(lesson, formData = {}) {
  const timeMatch = /^(\d{1,2}):/.exec(String(lesson.time || ""));
  const isMorning = timeMatch ? Number(timeMatch[1]) < 12 : true;
  if (lesson.date === formData.startDate && formData.startHalf === "下午" && isMorning) return false;
  if (lesson.date === formData.endDate && formData.endHalf === "上午" && !isMorning) return false;
  return true;
}

function addDays(dateKey, days) {
  const [year, month, day] = String(dateKey || "").split("-").map(Number);
  const date = new Date(year || 2026, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfNaturalWeek(dateKey) {
  const [year, month, day] = String(dateKey || "").split("-").map(Number);
  const date = new Date(year || 2026, (month || 1) - 1, day || 1);
  const dayIndex = date.getDay();
  const offset = dayIndex === 0 ? -6 : 1 - dayIndex;
  return addDays(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`, offset);
}

function teacherDivisionId(teacher) {
  if (teacher?.stageId === "primary") return "elementary";
  if (teacher?.stageId === "middle") return "middle";
  if (teacher?.stageId === "high") return "high";
  return "";
}

function preferredTeacherScheduleWeek(term, teacher, availableWeeks) {
  const weekStarts = new Set(availableWeeks.map((week) => week.weekStart));
  // 生活老师的排班以当前自然周为首选，避免因教务的学部开课周设置而打开历史周。
  if (teacher?.salaryProfile?.salaryCategory === "lifeTeacher") {
    const currentWeek = startOfNaturalWeek(new Date().toISOString().slice(0, 10));
    if (weekStarts.has(currentWeek)) return currentWeek;
  }
  const divisionWeek = term?.divisionWeekStarts?.[teacherDivisionId(teacher)];
  if (divisionWeek && weekStarts.has(divisionWeek)) return divisionWeek;
  const settlementMonth = String(term?.settlementMonth || "").slice(0, 7);
  if (settlementMonth) {
    const middleOfMonthWeek = startOfNaturalWeek(`${settlementMonth}-15`);
    if (weekStarts.has(middleOfMonthWeek)) return middleOfMonthWeek;
    const monthFirstWeek = startOfNaturalWeek(`${settlementMonth}-01`);
    const monthCandidate = availableWeeks.find((week) => week.weekStart >= monthFirstWeek);
    if (monthCandidate) return monthCandidate.weekStart;
  }
  return availableWeeks[0]?.weekStart || "2026-06-15";
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

// 安全响应头（验收 E-4）。
//
// CSP 里没有 'unsafe-eval'：前端是单文件原生 JS，不需要 eval，留着只是给
// XSS 多一条路。'unsafe-inline' 暂时保留——index.html 里有内联事件与样式，
// 去掉会直接白屏；要彻底移除得先把内联脚本抽出去，那是独立的一次改动。
//
// frame-ancestors 'none' 防点击劫持：教师工资页面被套进 iframe 诱导点击，
// 后果是替人确认工资单。
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "same-origin",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};

// 跨域：默认不发 CORS 头——前后端同源（服务端自己托管 index.html），
// 原先的 Access-Control-Allow-Origin: * 是任何站点都能调本系统接口。
// 确有跨域需求时用 CORS_ALLOW_ORIGIN 显式指定来源，不接受 *。
const CORS_ORIGIN = String(process.env.CORS_ALLOW_ORIGIN || "").trim();
if (CORS_ORIGIN === "*") {
  throw new Error("CORS_ALLOW_ORIGIN 不接受 *，请指定具体来源");
}

function securityHeaders(extra = {}) {
  const headers = { ...SECURITY_HEADERS, ...extra };
  // HSTS 只在确实跑在 HTTPS 后面时才发：明文 HTTP 下发 HSTS 会把浏览器
  // 锁到 https，而学校若还没配证书就会整站打不开。
  if (process.env.FORCE_HTTPS === "1") {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }
  if (CORS_ORIGIN) {
    headers["Access-Control-Allow-Origin"] = CORS_ORIGIN;
    headers.Vary = "Origin";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS";
  }
  return headers;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(
    statusCode,
    securityHeaders({ "Content-Type": "application/json; charset=utf-8" }),
  );
  res.end(JSON.stringify(payload));
}

// SSE 实时推送（P1）：维护活跃连接，写操作后广播主题，客户端据此刷新
// 单实例内广播；多实例部署需接 Redis pub/sub（见 docs/deployment-and-acceptance-guide 运维章节）
const sseClients = new Set();

function broadcastEvent(topic, payload = {}) {
  const data = JSON.stringify({ topic, ...payload, at: Date.now() });
  for (const client of sseClients) {
    try {
      client.write(`event: ${topic}\ndata: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, {
    error: {
      message,
      details,
    },
  });
}

function roomsForTerm(db, termId = "") {
  const scopedRooms = (db.rooms || []).filter((room) => room.termId === termId);
  if (scopedRooms.length) return scopedRooms;
  return (db.rooms || []).filter((room) => !room.termId);
}

// 请求体上限：教师 CSV 导入约几百 KB，5MB 足够；无上限时恶意大包会直接把进程内存打爆
const MAX_JSON_BODY_BYTES = 5 * 1024 * 1024;

async function readJsonBody(req) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_JSON_BODY_BYTES) {
      req.destroy();
      const error = new Error("请求体过大，最大支持 5MB");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf-8");
  return JSON.parse(raw);
}

// 登录保护：
// - 按用户名限“失败”次数（防口令爆破，成功登录不占额度）；
// - 按来源 IP 设高水位总量上限（防单源洪泛）。上限必须放得足够高：
//   全校师生在校园网 NAT 后共享同一个出口 IP，早高峰 3000 人集中登录是正常流量。
// 部署在反向代理后时设 TRUST_PROXY=1，用 X-Forwarded-For 还原真实来源。
const LOGIN_RATE_WINDOW_MS = 60 * 1000;
const LOGIN_FAIL_MAX_PER_USERNAME = 10;
const LOGIN_MAX_PER_IP = Number(process.env.LOGIN_MAX_PER_IP || 3000);
// 按 IP 的**失败**次数上限。上面两条都拦不住跨账号撞库：
// 拿一份账号表、每个账号只试一次口令，既不触发单账号 10 次失败的锁定，
// 总量也远在 3000 之下。但正常用户不会在一分钟内失败几十次——
// 同一出口 IP 一分钟失败 60 次，几乎必然是在扫。
const LOGIN_FAIL_MAX_PER_IP = Number(process.env.LOGIN_FAIL_MAX_PER_IP || 60);
const loginFailBuckets = new Map();
const loginIpBuckets = new Map();
const loginIpFailBuckets = new Map();

function slidingWindowHit(map, key, windowMs, increment = 1) {
  const now = Date.now();
  if (map.size > 20000) {
    map.forEach((bucket, bucketKey) => {
      if (now - bucket.windowStart > windowMs) map.delete(bucketKey);
    });
  }
  const bucket = map.get(key);
  if (!bucket || now - bucket.windowStart > windowMs) {
    map.set(key, { windowStart: now, count: increment });
    return increment;
  }
  bucket.count += increment;
  return bucket.count;
}

function clientIpFor(req) {
  if (process.env.TRUST_PROXY === "1") {
    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    if (forwarded) return forwarded;
  }
  return req.socket?.remoteAddress || "unknown";
}

function loginIpLimited(ip) {
  return slidingWindowHit(loginIpBuckets, ip, LOGIN_RATE_WINDOW_MS) > LOGIN_MAX_PER_IP;
}

// 监控用的登录失败统计。与上面的限流桶分开：限流桶是按 IP 分的滑动窗口，
// 回答「这个 IP 该不该锁」；监控要回答的是「全站最近一小时失败了多少次、
// 来自几个 IP」——爆破往往是很多 IP 各试几次，每个都不触发限流。
const loginFailWindow = [];
function noteLoginFailureForMonitor(ip) {
  const now = Date.now();
  loginFailWindow.push({ at: now, ip: ip || "unknown" });
  // 只留一小时，顺手裁掉旧的，不需要另起定时器
  while (loginFailWindow.length && now - loginFailWindow[0].at > 3600000) loginFailWindow.shift();
}
export function loginSecurityMetrics() {
  const now = Date.now();
  const recent = loginFailWindow.filter((e) => now - e.at <= 3600000);
  return { failuresLastHour: recent.length, distinctIps: new Set(recent.map((e) => e.ip)).size };
}

function loginIpFailLocked(ip) {
  const bucket = loginIpFailBuckets.get(ip);
  if (!bucket) return false;
  if (Date.now() - bucket.windowStart > LOGIN_RATE_WINDOW_MS) return false;
  return bucket.count >= LOGIN_FAIL_MAX_PER_IP;
}

function loginUsernameLocked(username) {
  const bucket = loginFailBuckets.get(username);
  if (!bucket) return false;
  if (Date.now() - bucket.windowStart > LOGIN_RATE_WINDOW_MS) return false;
  return bucket.count >= LOGIN_FAIL_MAX_PER_USERNAME;
}

function recordLoginFailure(username, ip) {
  slidingWindowHit(loginFailBuckets, username, LOGIN_RATE_WINDOW_MS);
  if (ip) slidingWindowHit(loginIpFailBuckets, ip, LOGIN_RATE_WINDOW_MS);
  noteLoginFailureForMonitor(ip);
}

function bearerToken(req) {
  const authorization = req.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

// 必须先改密才能用的账号，只放行这几个接口，其余一律拦下。
// 只在登录响应里回一个 mustChangePassword 标记是拦不住人的——
// 前端可以不理，直接调业务接口照样能用。
const PASSWORD_CHANGE_EXEMPT = new Set([
  "/api/auth/change-password",
  "/api/auth/logout",
  "/api/me",
  "/api/health",
]);

function requireAuth(req, res, db, allowedRoles = []) {
  const token = bearerToken(req);
  const session = token ? findActiveSession(db, token) : null;
  if (!session) {
    sendError(res, 401, "请先登录");
    return null;
  }

  const account = db.accounts.find((item) => item.id === session.accountId);
  if (!account || account.status !== "active") {
    if (token) revokeSession(db, token, account || null);
    sendError(res, 401, "账号不可用，请重新登录");
    return null;
  }

  if (account.mustChangePassword) {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (!PASSWORD_CHANGE_EXEMPT.has(pathname)) {
      sendError(res, 403, "首次登录请先修改密码", { code: "MUST_CHANGE_PASSWORD" });
      return null;
    }
  }

  if (allowedRoles.length && !accountHasAnyRole(account, allowedRoles)) {
    sendError(res, 403, "当前账号无权访问该资源");
    return null;
  }

  return { account, token };
}

function canReadTeacher(account, teacherId) {
  if (["finance", "system_admin"].includes(account.role)) return true;
  return accountHasRole(account, "teacher") && account.teacherId === teacherId;
}

function teacherIdFromPath(parts) {
  return parts.length >= 3 ? parts[2] : "";
}

function assertScheduleQueryScope(db, account, params = {}) {
  const scope = accountStageScopeIds(account);
  if (!scope.length || account.role === "teacher") return;
  const dimension = String(params.dimension || "class");
  const targetId = String(params.targetId || "");
  let stageId = "";
  if (dimension === "class") {
    stageId = String((db.classes || []).find((item) => item.id === targetId)?.stageId || "");
  } else if (dimension === "teacher") {
    stageId = String((db.teachers || []).find((item) => item.id === targetId)?.stageId || "");
  } else if (dimension === "grade") {
    stageId = stageIdForDivision(targetId.split("-g")[0]) || String(params.stageId || "");
  }
  if (stageId && scope.includes(stageId)) return;
  const error = new Error("只能查看本学部课表");
  error.statusCode = 403;
  throw error;
}

function rejectScopedAdmin(res, account, message = "学部排课负责人无权执行总校级操作") {
  if (account?.role !== "admin" || !accountStageScopeIds(account).length) return false;
  sendError(res, 403, message);
  return true;
}

function teacherIdentityOnly(teacher) {
  if (!teacher) return null;
  const { salaryProfile, ...publicTeacher } = teacher;
  return publicTeacher;
}

function teacherPayrollSummaryOnly(payroll) {
  if (!payroll) return null;
  return {
    teacher: teacherIdentityOnly(payroll.teacher),
    month: payroll.month,
    // 锁定后老师端只看总额；系统结算至应发为止，税与社保由财务线下处理
    grossPay: payroll.grossPay || 0,
    generated: payroll.generated
      ? {
          id: payroll.generated.id,
          status: payroll.generated.status,
          generatedAt: payroll.generated.generatedAt,
          reviewedAt: payroll.generated.reviewedAt,
          lockedAt: payroll.generated.lockedAt,
        }
      : null,
    confirmation: payroll.confirmation
      ? {
          id: payroll.confirmation.id,
          teacherId: payroll.confirmation.teacherId,
          month: payroll.confirmation.month,
          status: payroll.confirmation.status,
          stage: payroll.confirmation.stage,
          confirmedAt: payroll.confirmation.confirmedAt,
          academicApprovedAt: payroll.confirmation.academicApprovedAt,
          schoolApprovedAt: payroll.confirmation.schoolApprovedAt,
          lockedAt: payroll.confirmation.lockedAt,
        }
      : null,
  };
}

function teacherPayrollForConfirmation(payroll) {
  if (!payroll) return null;
  return {
    teacher: teacherIdentityOnly(payroll.teacher),
    month: payroll.month,
    grossPay: payroll.grossPay || 0,
    rows: payroll.rows || [],
    workloadSummary: payroll.workloadSummary || null,
    generated: payroll.generated
      ? {
          id: payroll.generated.id,
          status: payroll.generated.status,
          generatedAt: payroll.generated.generatedAt,
          reviewedAt: payroll.generated.reviewedAt,
          teacherConfirmedAt: payroll.generated.teacherConfirmedAt,
          disputedAt: payroll.generated.disputedAt,
          disputeReason: payroll.generated.disputeReason,
          disputeResolvedAt: payroll.generated.disputeResolvedAt,
          lockedAt: payroll.generated.lockedAt,
        }
      : null,
	  };
	}

function teacherVisiblePayroll(payroll) {
  // 财务预览和已保存草稿都不是发给老师的数据。之前这里只把 saved 的
  // generated 标记抹掉，却仍把 grossPay/rows 一并返回，老师可以在财务
  // 发布前看到试算金额。未发布时直接返回 null，金额和明细都不出服务端。
  const status = payroll?.generated?.status || "";
  if (!["generated", "teacher_confirmed", "disputed", "reviewed", "locked"].includes(status)) return null;
  return payroll;
}

function requireTeacherPayrollMonth(res, db, account, month) {
  if (!accountHasRole(account, "teacher")) return true;
  const activeTerm = queryTerms(db).currentTerm;
  if (canTeacherAccessPayrollMonth(month, activeTerm)) return true;
  sendError(res, 403, "老师端仅可查看当前学期工资");
  return false;
}

function teacherWorkloadWithoutSalaryDetails(workload) {
  if (!workload) return null;
  return {
    teacher: teacherIdentityOnly(workload.teacher),
    month: workload.month,
    generatedAt: workload.generatedAt,
    summary: {
      plannedUnits: workload.summary?.plannedUnits || 0,
      payableUnits: workload.summary?.payableUnits || 0,
      pendingCount: workload.summary?.pendingCount || 0,
      exceptionCount: workload.summary?.exceptionCount || 0,
    },
    categories: (workload.categories || []).map((category) => ({
      type: category.type,
      label: category.label,
      units: category.units,
    })),
    payableLines: (workload.payableLines || []).map((line) => ({
      lessonId: line.lessonId,
      date: line.date,
      time: line.time,
      className: line.className,
      subjectName: line.subjectName,
      room: line.room,
      type: line.type,
      units: line.units,
      status: line.status,
      checkInAt: line.checkInAt,
      checkOutAt: line.checkOutAt,
    })),
    pendingLines: workload.pendingLines || [],
    exceptionLines: workload.exceptionLines || [],
    confirmation: workload.confirmation || null,
  };
}

function attachSchedulingPrecheck(db, result) {
  if (!result?.config) return result;
  const precheckResult = previewSchedulePrecheck(db, {
    divisionId: result.config.divisionId,
    gradeId: result.config.gradeId,
  });
  return {
    ...result,
    config: precheckResult.config,
    precheck: precheckResult.precheck,
  };
}

async function handleApi(req, res, db, url) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  const parts = url.pathname.split("/").filter(Boolean);

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        status: "ok",
        service: "school-system-phase1-api",
        teacherCount: db.teachers.length,
        accountCount: db.accounts.length,
        seedVersion: db.meta.seedVersion,
        currentTermName: (db.terms || []).find((term) => term.current)?.name || "",
        schedulingSolver: checkSolverAvailability().available ? "ortools-cp-sat" : "fallback-heuristic",
        storage: {
          driver: DB_DRIVER,
          lastSaveAt: storageHealth.lastSaveAt,
          lastSaveDurationMs: storageHealth.lastSaveDurationMs,
          lastSaveError: storageHealth.lastSaveError || null,
          coalescedSaves: storageHealth.coalescedSaves,
          totalSaves: storageHealth.totalSaves,
          ...(DB_DRIVER !== "json"
            ? {
                postgres: {
                  connected: postgresHealth.connected,
                  lastPersistAt: postgresHealth.lastPersistAt,
                  lastPersistMs: postgresHealth.lastPersistMs,
                  lastPersistUpserts: postgresHealth.lastPersistUpserts,
                  lastError: postgresHealth.lastError || null,
                },
              }
            : {}),
        },
      });
      return;
    }

    // SSE 事件流：EventSource 无法设置 Authorization 头，token 走查询参数
    if (req.method === "GET" && url.pathname === "/api/events") {
      const token = url.searchParams.get("token") || "";
      const session = token ? findActiveSession(db, token) : null;
      if (!session) {
        sendError(res, 401, "请先登录");
        return;
      }
      // SSE 与其他响应同口径：不再对任意来源开放
      res.writeHead(
        200,
        securityHeaders({
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        }),
      );
      res.write("retry: 5000\n\n");
      res.write(`event: ready\ndata: {"topic":"ready"}\n\n`);
      sseClients.add(res);
      const keepAlive = setInterval(() => {
        try {
          res.write(": keep-alive\n\n");
        } catch {
          clearInterval(keepAlive);
        }
      }, 25000);
      req.on("close", () => {
        clearInterval(keepAlive);
        sseClients.delete(res);
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const clientIp = clientIpFor(req);
      if (loginIpLimited(clientIp)) {
        sendError(res, 429, "登录请求过于频繁，请 1 分钟后再试");
        return;
      }
      const body = await readJsonBody(req);
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      if (loginUsernameLocked(username)) {
        sendError(res, 429, "该账号短时间内失败次数过多，请 1 分钟后再试");
        return;
      }

      const account = findAccountByUsername(db, username);
      const credentialsOk =
        account &&
        account.status === "active" &&
        (await verifyPasswordAsync(password, account.passwordHash));

      // 按 IP 的失败限流放在验证之后：校园网上千人共用一个出口 IP，
      // 把这道闸放在验证之前，一次扫描就会连带把凭据正确的老师一起挡在门外。
      // 凭据正确一律放行；扫描方按定义拿不出正确凭据，仍被限在阈值内。
      if (!credentialsOk) {
        if (loginIpFailLocked(clientIp)) {
          // 措辞刻意不提「失败次数」：告诉扫描方触发了哪条规则，等于教他怎么绕
          sendError(res, 429, "登录请求过于频繁，请 1 分钟后再试");
          return;
        }
        recordLoginFailure(username, clientIp);
        sendError(res, 401, "用户名或密码错误");
        return;
      }

      const token = createToken();
      createSession(db, account, token, {
        userAgent: req.headers["user-agent"] || "",
      });
      await saveDatabase(db);

      sendJson(res, 200, {
        token,
        account: publicAccount(account, db),
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/logout") {
      const token = bearerToken(req);
      if (token && revokeSession(db, token)) await saveDatabase(db);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/change-password") {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      const body = await readJsonBody(req);
      const account = changeOwnPassword(
        db,
        auth.account,
        String(body.currentPassword || ""),
        String(body.newPassword || ""),
      );
      await saveDatabase(db);
      sendJson(res, 200, { account });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      sendJson(res, 200, {
        account: publicAccount(auth.account, db),
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/notifications") {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      sendJson(res, 200, queryNotifications(db, auth.account, Object.fromEntries(url.searchParams)));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/notifications") {
      const auth = requireAuth(req, res, db, ["admin", "finance", "system_admin"]);
      if (!auth) return;
      if (rejectScopedAdmin(res, auth.account, "学部排课负责人不能发布全校通知")) return;
      const body = await readJsonBody(req);
      const notification = createNotification(db, body, auth.account);
      await saveDatabase(db);
      broadcastEvent("notification");
      sendJson(res, 200, { notification });
      return;
    }

    if (
      req.method === "POST" &&
      parts[0] === "api" &&
      parts[1] === "notifications" &&
      parts[2] &&
      parts[3] === "read"
    ) {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      const notification = markNotificationRead(db, decodeURIComponent(parts[2]), auth.account);
      await saveDatabase(db);
      sendJson(res, 200, { notification });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/reference") {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      sendJson(res, 200, referenceCatalog(db));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/terms") {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      sendJson(res, 200, queryTerms(db));
      return;
    }

    // 校历读写与学期主键分开：/api/terms 只服务教学学期选择，
    // 寒暑假通过本接口维护，不会被排课页误当成一个“学期”。
    if (req.method === "GET" && url.pathname === "/api/academic-calendar") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin", "division_head", "principal", "finance", "hr"]);
      if (!auth) return;
      // 总校财务拥有跨学部工资查看权限，因此校历也必须完整可见；学部财务仍只读
      // 自己负责的学部。其他没有显式学部范围的总校角色沿用全校只读。
      const calendarStageScope = auth.account.role === "finance" && auth.account.financeReadAll
        ? []
        : accountStageScopeIds(auth.account);
      sendJson(
        res,
        200,
        queryAcademicCalendar(db, {
          schoolYear: url.searchParams.get("schoolYear") || "",
          allYears: url.searchParams.get("allYears") === "1",
          stageIds: calendarStageScope,
        }),
      );
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/academic-calendar") {
      const auth = requireAuth(req, res, db, ["division_head"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = saveAcademicCalendarEntry(db, body, auth.account);
      await saveDatabase(db);
      // 新建教学期或更新学部起止日后，排课、工资月份和在线页面都要重新读取。
      broadcastEvent("academic-calendar");
      broadcastEvent("term");
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/terms") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      if (rejectScopedAdmin(res, auth.account)) return;
      const body = await readJsonBody(req);
      const result = createAcademicTerm(db, body, auth.account);
      await saveDatabase(db);
      broadcastEvent("term");
      sendJson(res, 200, result);
      return;
    }

    if (
      req.method === "POST" &&
      parts[0] === "api" &&
      parts[1] === "terms" &&
      parts[2] &&
      parts[3] === "current"
    ) {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      if (rejectScopedAdmin(res, auth.account)) return;
      const result = setCurrentAcademicTerm(db, decodeURIComponent(parts[2]), auth.account);
      await saveDatabase(db);
      broadcastEvent("term");
      sendJson(res, 200, result);
      return;
    }

    if (
      req.method === "POST" &&
      parts[0] === "api" &&
      parts[1] === "terms" &&
      parts[2] &&
      parts[3] === "archive"
    ) {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      if (rejectScopedAdmin(res, auth.account)) return;
      const result = archiveAcademicTerm(db, decodeURIComponent(parts[2]), auth.account);
      await saveDatabase(db);
      broadcastEvent("term");
      sendJson(res, 200, result);
      return;
    }

    if (
      req.method === "DELETE" &&
      parts[0] === "api" &&
      parts[1] === "terms" &&
      parts[2] &&
      parts.length === 3
    ) {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      if (rejectScopedAdmin(res, auth.account)) return;
      const result = deleteAcademicTerm(db, decodeURIComponent(parts[2]), auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (parts[0] === "api" && parts[1] === "reference" && parts.length === 3) {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      const catalog = referenceCatalog(db);
      const key = parts[2];
      if (!Object.prototype.hasOwnProperty.call(catalog, key)) {
        sendError(res, 404, "基础配置不存在");
        return;
      }
      sendJson(res, 200, { [key]: catalog[key] });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/payroll-rules") {
      const auth = requireAuth(req, res, db, ["finance"]);
      if (!auth) return;
      if (!canExportAllPayrollDetails(auth.account)) {
        sendError(res, 403, "仅总校财务可以查看薪资配置");
        return;
      }
      sendJson(res, 200, { payrollRules: db.payrollRules });
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/api/payroll-rules") {
      const auth = requireAuth(req, res, db, ["finance"]);
      if (!auth) return;
      if (!canExportAllPayrollDetails(auth.account)) {
        sendError(res, 403, "仅总校财务可以维护薪资配置");
        return;
      }
      const body = await readJsonBody(req);
      const payrollRules = updatePayrollRules(db, body.payrollRules || body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, { payrollRules });
      return;
    }

    if (parts[0] === "api" && parts[1] === "accounts" && parts.length >= 4) {
      const auth = requireAuth(req, res, db, ["system_admin"]);
      if (!auth) return;
      const accountId = decodeURIComponent(parts[2] || "");
      if (req.method === "POST" && parts[3] === "reset-password") {
        const body = await readJsonBody(req);
        const account = resetAccountPassword(db, accountId, String(body.newPassword || "123456"), auth.account);
        await saveDatabase(db);
        sendJson(res, 200, { account, defaultPassword: body.newPassword || "123456" });
        return;
      }
      if (req.method === "POST" && parts[3] === "status") {
        const body = await readJsonBody(req);
        const account = setAccountStatus(db, accountId, String(body.status || "active"), auth.account);
        await saveDatabase(db);
        sendJson(res, 200, { account });
        return;
      }
    }

    if (req.method === "GET" && url.pathname === "/api/scheduling/teacher-assignments") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const options = Object.fromEntries(url.searchParams);
      assertSchedulingAccess(db, auth.account, options, "查看");
      sendJson(res, 200, { assignments: queryTeacherAssignments(db, options) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/teacher-assignments") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      assertSchedulingAccess(db, auth.account, body, "维护");
      const assignment = updateTeacherAssignment(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, { assignment });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/teacher-assignments/auto") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = autoAssignGradeTeachers(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, attachSchedulingPrecheck(db, result));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/course-rules") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = updateGradeCourseRules(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, attachSchedulingPrecheck(db, result));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/courses") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = createGradeCourse(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, attachSchedulingPrecheck(db, result));
      return;
    }

    if (req.method === "DELETE" && parts[0] === "api" && parts[1] === "scheduling" && parts[2] === "courses" && parts[3]) {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const result = deleteGradeCourse(
        db,
        {
          termId: url.searchParams.get("termId"),
          subjectId: decodeURIComponent(parts[3]),
          stageId: url.searchParams.get("stageId"),
          grade: url.searchParams.get("grade"),
        },
        auth.account,
      );
      await saveDatabase(db);
      sendJson(res, 200, attachSchedulingPrecheck(db, result));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/constraints") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = createScheduleConstraint(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, attachSchedulingPrecheck(db, result));
      return;
    }

    if (req.method === "DELETE" && parts[0] === "api" && parts[1] === "scheduling" && parts[2] === "constraints" && parts[3]) {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const result = deleteScheduleConstraint(
        db,
        { termId: url.searchParams.get("termId"), constraintId: decodeURIComponent(parts[3]) },
        auth.account,
      );
      await saveDatabase(db);
      sendJson(res, 200, attachSchedulingPrecheck(db, result));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/teacher-rules") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = updateTeacherScheduleRule(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, attachSchedulingPrecheck(db, result));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/scheduling/config") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin", "division_head", "principal"]);
      if (!auth) return;
      const options = Object.fromEntries(url.searchParams);
      assertSchedulingAccess(db, auth.account, options, "查看");
      const precheckResult = previewSchedulePrecheck(db, options);
      sendJson(res, 200, {
        config: precheckResult.config,
        draft: findScheduleDraft(db, options),
        versions: listScheduleVersions(db, options),
        precheck: precheckResult.precheck,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/scheduling/precheck") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const options = Object.fromEntries(url.searchParams);
      const result = previewSchedulePrecheck(db, options);
      sendJson(res, 200, {
        config: result.config,
        precheck: result.precheck,
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/class-structure") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = updateGradeClassStructure(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, attachSchedulingPrecheck(db, result));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/periods") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = updateSchedulePeriods(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, attachSchedulingPrecheck(db, result));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/rooms") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = updateRoomResources(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, attachSchedulingPrecheck(db, result));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/generate") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      // 同步生成会在主事件循环内阻塞式运行 CP-SAT（最长 90 秒），期间所有请求都会被卡住。
      // 正式页面走 /api/scheduling/generate-jobs（Worker 线程）；此接口仅保留给开发调试。
      if (process.env.ALLOW_SYNC_SCHEDULING !== "1") {
        sendError(
          res,
          410,
          "同步排课接口已停用：请改用 POST /api/scheduling/generate-jobs 异步生成（开发调试可用 ALLOW_SYNC_SCHEDULING=1 临时开启）",
        );
        return;
      }
      const body = await readJsonBody(req);
      const result = generateScheduleDraft(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/generate-jobs") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      assertSchedulingAccess(db, auth.account, body, "生成");
      const { job, reused } = startScheduleGenerationJob(db, body, auth.account, {
        saveDatabase: () => saveDatabase(db),
      });
      sendJson(res, reused ? 200 : 202, {
        job: scheduleGenerationJobResponse(job),
      });
      return;
    }

    if (req.method === "POST" && parts[0] === "api" && parts[1] === "scheduling" && parts[2] === "generate-jobs" && parts[3] && parts[4] === "cancel") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const result = await cancelScheduleGenerationJob(decodeURIComponent(parts[3]), auth.account);
      if (!result.job) {
        sendError(res, 404, "排课任务不存在或已过期");
        return;
      }
      sendJson(res, 200, {
        job: scheduleGenerationJobResponse(result.job),
        cancelled: result.cancelled,
        reason: result.reason,
      });
      return;
    }

    if (req.method === "GET" && parts[0] === "api" && parts[1] === "scheduling" && parts[2] === "generate-jobs" && parts[3]) {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const job = getScheduleGenerationJob(decodeURIComponent(parts[3]));
      if (!job) {
        sendError(res, 404, "排课任务不存在或已过期");
        return;
      }
      sendJson(res, 200, {
        job: scheduleGenerationJobResponse(job, { includeResult: job.status === "completed" }),
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/publish") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = publishScheduleDraft(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/rollback") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = rollbackScheduleVersion(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/adjust") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = adjustScheduleAssignment(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/change-requests") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = createScheduleChangeRequest(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (
      req.method === "POST" &&
      parts[0] === "api" &&
      parts[1] === "scheduling" &&
      parts[2] === "change-requests" &&
      parts[3] &&
      parts[4] === "approve"
    ) {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const result = approveScheduleChangeRequest(db, { requestId: decodeURIComponent(parts[3]) }, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/lock") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = setScheduleAssignmentLock(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/regenerate-unlocked") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = regenerateUnlockedScheduleAssignments(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/teachers") {
      const auth = requireAuth(req, res, db, ["admin", "finance", "system_admin"]);
      if (!auth) return;
      sendJson(res, 200, queryTeachers(db, Object.fromEntries(url.searchParams), {
        // 人事行政需要教师名册，但不应借名册读取工资试算、工资状态或工资档案。
        includeFinance: auth.account.role === "finance",
        financeScope: financeReadScopeFor(auth.account),
        stageScopeIds: accountStageScopeIds(auth.account),
      }));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/personnel") {
      const auth = requireAuth(req, res, db, ["system_admin", "division_head", "principal"]);
      if (!auth) return;
      sendJson(res, 200, queryPersonnel(db, Object.fromEntries(url.searchParams), {
        teachersOnly: ["division_head", "principal"].includes(auth.account.role),
        stageScopeIds: accountStageScopeIds(auth.account),
      }));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/teachers/import/preview") {
      const auth = requireAuth(req, res, db, ["system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const csvText = String(body.csvText || "");
      sendJson(res, 200, previewTeacherImport(db, csvText));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/teachers/import/commit") {
      const auth = requireAuth(req, res, db, ["system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const csvText = String(body.csvText || "");
      const result = commitTeacherImport(db, csvText, auth.account);
      // 新导入教师自动补建人事档案，避免教学侧与档案侧人数漂移
      ensureHrData(db);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/teachers/me") {
      const auth = requireAuth(req, res, db, ["teacher"]);
      if (!auth) return;
      const teacher = findTeacher(db, auth.account.teacherId);
      sendJson(res, 200, { teacher: teacherIdentityOnly(teacher) });
      return;
    }

    if (parts[0] === "api" && parts[1] === "teachers" && parts.length >= 3) {
      const auth = requireAuth(req, res, db);
      if (!auth) return;
      const teacherId = teacherIdFromPath(parts);

      if (!canReadTeacher(auth.account, teacherId)) {
        sendError(res, 403, "只能访问本人教师数据");
        return;
      }

      // 财务分权：学部财务只能碰本学部任课老师，总校财务只能碰行政后勤人员。
      // 放在教师子路由的唯一入口处，读和写一并拦住，避免逐个分支各写一遍。
      const financeCanAccessTeacher = req.method === "GET"
        ? canFinanceReadTeacher(db, auth.account, teacherId)
        : canFinanceActOnTeacher(db, auth.account, teacherId);
      if (!financeCanAccessTeacher) {
        sendError(res, 403, `只能处理${financeScopeLabel(financeScopeFor(auth.account))}的薪资数据`);
        return;
      }

      const teacher = findTeacher(db, teacherId);
      if (!teacher) {
        sendError(res, 404, "教师不存在");
        return;
      }

      if (req.method === "GET" && parts.length === 3) {
        sendJson(res, 200, {
          teacher: (accountHasRole(auth.account, "teacher") || auth.account.role === "system_admin")
            ? teacherIdentityOnly(teacher)
            : teacher,
        });
        return;
      }

      if (req.method === "GET" && parts[3] === "schedule") {
        const termId = url.searchParams.get("termId") || "";
        const termContext = queryTerms(db);
        const activeTermId = termId || termContext.currentTerm.id;
        const availableWeeks = teacherScheduleWeeks(db, teacherId, { termId: activeTermId });
        const requestedWeekStart = url.searchParams.get("weekStart");
        const weekStart =
          requestedWeekStart && requestedWeekStart !== "auto"
            ? requestedWeekStart
            : preferredTeacherScheduleWeek(termContext.currentTerm, teacher, availableWeeks);
        sendJson(res, 200, {
          teacher: (accountHasRole(auth.account, "teacher") || auth.account.role === "system_admin")
            ? teacherIdentityOnly(teacher)
            : teacher,
          currentTerm: termContext.currentTerm,
          weekStart,
          availableWeeks,
          lessons: teacherLessonsForWeek(db, teacherId, weekStart, { termId: activeTermId }),
        });
        return;
      }

      // 教师的课时记录（原「考勤记录」）。签到取消后这里列的是
      // 「这个月排给我的课、哪些计薪、哪些因请假取消」
      if (req.method === "GET" && parts[3] === "lesson-records") {
        const month = url.searchParams.get("month") || "2026-06";
        sendJson(res, 200, queryTeacherLessonRecords(db, teacherId, month));
        return;
      }

      if (req.method === "GET" && parts[3] === "workload") {
        const month = url.searchParams.get("month") || "2026-06";
        const workload = teacherMonthlyWorkload(db, teacherId, month);
        sendJson(
          res,
          200,
          (accountHasRole(auth.account, "teacher") || auth.account.role === "system_admin")
            ? teacherWorkloadWithoutSalaryDetails(workload)
            : workload,
        );
        return;
      }

      if (req.method === "POST" && parts[3] === "workload" && parts[4] === "confirm") {
        if (!accountHasRole(auth.account, "teacher") || auth.account.teacherId !== teacherId) {
          sendError(res, 403, "只能由老师本人确认月度工作量");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        const result = confirmMonthlyWorkload(db, teacherId, month, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, teacherWorkloadWithoutSalaryDetails(result));
        return;
      }

      if (req.method === "POST" && parts[3] === "workload" && parts[4] === "approve") {
        if (!["admin", "system_admin"].includes(auth.account.role)) {
          sendError(res, 403, "只有教务或总校管理账号可以审批月度工作量");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        const step = String(body.step || "academic");
        const result = approveMonthlyWorkload(db, teacherId, month, step, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, auth.account.role === "system_admin" ? teacherWorkloadWithoutSalaryDetails(result) : result);
        return;
      }

      if (req.method === "PATCH" && parts[3] === "salary-profile") {
        if (auth.account.role !== "finance") {
          sendError(res, 403, "只有财务可以维护教师工资档案");
          return;
        }
        const body = await readJsonBody(req);
        const teacher = updateTeacherSalaryProfile(db, teacherId, body.salaryProfile || body, auth.account);
        await saveDatabase(db);
        // 职称档、考核档一改，工资金额跟着变，老师端要立刻看到
        broadcastEvent("payroll");
        sendJson(res, 200, { teacher });
        return;
      }

      if (req.method === "GET" && parts[3] === "payroll") {
        if (!["finance", "teacher"].includes(auth.account.role)) {
          sendError(res, 403, "当前账号无权查看工资数据");
          return;
        }
        const month = url.searchParams.get("month") || "2026-06";
	        if (!requireTeacherPayrollMonth(res, db, auth.account, month)) return;
	        const payroll = teacherPayrollDetail(db, teacherId, month) || teacherPayrollPreview(db, teacherId, month);
	        const teacherPersonalView = accountHasRole(auth.account, "teacher") && auth.account.teacherId === teacherId;
	        const visiblePayroll = teacherPersonalView ? teacherVisiblePayroll(payroll) : payroll;
	        const wantsConfirmationDetail = url.searchParams.get("detail") === "confirmation";
	        sendJson(
	          res,
	          200,
	          teacherPersonalView
	            ? wantsConfirmationDetail
	              ? teacherPayrollForConfirmation(visiblePayroll)
	              : teacherPayrollSummaryOnly(visiblePayroll)
	            : visiblePayroll,
	        );
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "generate") {
        if (auth.account.role !== "finance") {
          sendError(res, 403, "只有财务可以生成薪资明细");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        const result = generateTeacherPayrollDetail(db, teacherId, month, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, result);
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "review") {
        if (auth.account.role !== "finance") {
          sendError(res, 403, "只有财务可以复核薪资明细");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        const result = reviewTeacherPayrollDetail(db, teacherId, month, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, result);
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "teacher-confirm") {
        if (!accountHasRole(auth.account, "teacher") || auth.account.teacherId !== teacherId) {
          sendError(res, 403, "只能由老师本人确认工资明细");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        if (!requireTeacherPayrollMonth(res, db, auth.account, month)) return;
        const result = confirmTeacherPayrollDetail(db, teacherId, month, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, teacherPayrollForConfirmation(result));
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "dispute") {
        if (!accountHasRole(auth.account, "teacher") || auth.account.teacherId !== teacherId) {
          sendError(res, 403, "只能由老师本人提出工资异议");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        if (!requireTeacherPayrollMonth(res, db, auth.account, month)) return;
        const reason = String(body.reason || "").trim();
        const result = disputeTeacherPayrollDetail(db, teacherId, month, reason, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, teacherPayrollForConfirmation(result));
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "lock") {
        if (auth.account.role !== "finance") {
          sendError(res, 403, "只有财务可以锁定薪资明细");
          return;
        }
        sendError(res, 409, "工资需经学部主任、校长确认后，由总校财务在执行环节锁定发放");
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "unlock") {
        if (auth.account.role !== "finance") {
          sendError(res, 403, "只有财务可以解锁薪资");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        const reason = String(body.reason || "").trim();
        const result = unlockTeacherPayrollDetail(db, teacherId, month, reason, auth.account);
        await saveDatabase(db);
        broadcastEvent("payroll");
        broadcastEvent("term-budget");
        sendJson(res, 200, result);
        return;
      }
    }

    if (req.method === "POST" && url.pathname === "/api/payroll/batch-generate") {
      const auth = requireAuth(req, res, db, ["finance"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = generatePayrollBatch(db, body, auth.account);
      await saveDatabase(db);
      // 工资单一批出来，老师端的「我的工资」立刻要能看到
      broadcastEvent("payroll");
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/payroll/batch-lock") {
      const auth = requireAuth(req, res, db, ["finance"]);
      if (!auth) return;
      sendError(res, 409, "批量锁定已纳入月度工资确认流程，请提交学部工资确认并等待总校财务执行");
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/payroll/export") {
      const auth = requireAuth(req, res, db, ["finance"]);
      if (!auth) return;
      if (!canExportAllPayrollDetails(auth.account)) {
        sendError(res, 403, "仅总校财务可以导出全校工资明细");
        return;
      }
      const scope = financeReadScopeFor(auth.account);
      const options = { ...Object.fromEntries(url.searchParams), financeScope: scope };
      // Excel 版是给财务归档与线下办税用的（验收 3.15）：带表头、合计行与签字栏；
      // CSV 版保留给需要机器导入的场景。
      if (url.searchParams.get("format") === "excel") {
        sendJson(res, 200, exportPayrollSheet(db, options, {
          scopeNote: scope ? financeScopeLabel(scope) : "全校",
        }));
        return;
      }
      sendJson(res, 200, exportPayrollDetails(db, options));
      return;
    }

    // 课表：二维网格数据，供前端渲染与打印视图使用
    if (req.method === "GET" && url.pathname === "/api/schedule/grid") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin", "finance", "hr", "division_head", "teacher"]);
      if (!auth) return;
      const params = Object.fromEntries(url.searchParams);
      // 教师只能看本人课表，不能通过改参数看别人的
      if (auth.account.role === "teacher") {
        params.dimension = "teacher";
        params.targetId = auth.account.teacherId || "";
      }
      assertScheduleQueryScope(db, auth.account, params);
      sendJson(res, 200, {
        grid: buildScheduleGrid(db, {
          termId: params.termId || queryTerms(db).currentTerm.id,
          dimension: params.dimension || "class",
          targetId: params.targetId || "",
          weekStart: params.weekStart || "",
        }),
      });
      return;
    }

    // 归档学年的课次不在内存里（见 ledgers.js 的加载边界），查往年课表时
    // 要从库里取。把结果塞进 db 的浅副本，现有的同步函数无需改动。
    const withLessonsOf = async (termId) => {
      const rows = await resolveLedgerRows(db, "lessonInstances", { termId }, { queryArchivedRows });
      return { ...db, lessonInstances: rows };
    };

    // 课表导出（Excel）。PDF 由前端打印视图承载，一套实现覆盖导出与打印两项验收。
    if (req.method === "GET" && url.pathname === "/api/schedule/export") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin", "finance", "hr", "division_head", "teacher"]);
      if (!auth) return;
      const params = Object.fromEntries(url.searchParams);
      if (auth.account.role === "teacher") {
        params.dimension = "teacher";
        params.targetId = auth.account.teacherId || "";
      }
      assertScheduleQueryScope(db, auth.account, params);
      const scopedDb = await withLessonsOf(params.termId || queryTerms(db).currentTerm.id);
      const result = exportSchedule(scopedDb, {
        termId: params.termId || queryTerms(db).currentTerm.id,
        dimension: params.dimension || "class",
        targetId: params.targetId || "",
        weekStart: params.weekStart || "",
      });
      sendJson(res, 200, {
        filename: result.filename,
        content: result.content,
        mimeType: result.mimeType,
        total: result.total,
      });
      return;
    }

    // 教学基础数据批量导入导出（验收 2.1 班级/课程、2.2 教室）。
    // 属教务与系统维护范畴，财务不参与——工资只读教师与课次，不改基础结构。
    if (url.pathname.startsWith("/api/data-porting/")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const entity = parts[2] || "";
      const action = parts[3] || "";
      if (!ENTITY_KEYS.includes(entity)) {
        sendJson(res, 404, { error: { message: `不支持的导入类型：${entity}`, details: null } });
        return;
      }

      // 导出与模板：只读，教务与学部负责人也要用
      if (req.method === "GET" && (action === "export" || action === "template")) {
        const auth = requireAuth(req, res, db, ["admin", "system_admin", "hr", "division_head"]);
        if (!auth) return;
        const result =
          action === "template"
            ? exportEntityTemplate(entity)
            : exportEntityCsv(db, entity, {
                termId: url.searchParams.get("termId") || queryTerms(db).currentTerm.id,
                stageId: url.searchParams.get("stageId") || "",
              });
        sendJson(res, 200, result);
        return;
      }

      // 预检与提交：会改基础结构，限行政与系统管理
      if (req.method === "POST" && (action === "preview" || action === "commit")) {
        const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
        if (!auth) return;
        if (rejectScopedAdmin(res, auth.account, "学部排课负责人不能批量改动全校基础数据")) return;
        const body = await readJsonBody(req);
        const options = {
          termId: body.termId || queryTerms(db).currentTerm.id,
          includeAllRows: Boolean(body.includeAllRows),
        };
        if (action === "preview") {
          sendJson(res, 200, previewEntityImport(db, entity, body.csvText || "", options));
          return;
        }
        const result = commitEntityImport(db, entity, body.csvText || "", options, auth.account);
        await saveDatabase(db);
        broadcastEvent("base-data");
        sendJson(res, 200, result);
        return;
      }

      sendJson(res, 404, { error: { message: "接口不存在", details: null } });
      return;
    }

    // 教学资源台账（验收 2.4）：查询、筛选、导出
    if (req.method === "GET" && url.pathname === "/api/resource-ledger") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin", "hr", "division_head"]);
      if (!auth) return;
      const options = {
        termId: url.searchParams.get("termId") || queryTerms(db).currentTerm.id,
        stageId: url.searchParams.get("stageId") || "",
        roomType: url.searchParams.get("roomType") || "",
        keyword: url.searchParams.get("keyword") || "",
        onlyIdle: url.searchParams.get("onlyIdle") === "true",
      };
      // 学部负责人只看自己学部的资源
      const scope = Array.isArray(auth.account.scopeStageIds) ? auth.account.scopeStageIds : [];
      if (scope.length === 1 && !options.stageId) options.stageId = String(scope[0]);

      if (url.searchParams.get("format") === "excel") {
        sendJson(res, 200, exportResourceLedger(db, options));
        return;
      }
      sendJson(res, 200, buildResourceLedger(db, options));
      return;
    }

    // --- 账套（验收第八章）---
    if (url.pathname === "/api/ledgers" || url.pathname.startsWith("/api/ledgers/")) {
      const parts = url.pathname.split("/").filter(Boolean); // api ledgers [type] [period] [action]
      const type = parts[2] || "";
      const period = parts[3] ? decodeURIComponent(parts[3]) : "";
      const action = parts[4] || "";

      // 账套统一由总校人事行政维护。不能只在前端隐藏菜单；所有直连接口也要收口。
      if (req.method === "GET" && !type) {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        sendJson(res, 200, {
          types: Object.entries(LEDGER_TYPES).map(([key, spec]) => ({ key, label: spec.label, period: spec.period })),
          ledgers: listLedgers(db, {
            type: url.searchParams.get("type") || "",
            status: url.searchParams.get("status") || "",
          }),
        });
        return;
      }

      if (req.method === "GET" && type && period && !action) {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        sendJson(res, 200, { ledger: ledgerDetail(db, type, period) });
        return;
      }

      // 单账套备份下载（8.2 / 8.17）
      if (req.method === "GET" && type && period && action === "backup") {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        const backup = buildLedgerBackup(db, type, period);
        sendJson(res, 200, {
          filename: ledgerBackupFilename(type, period),
          content: JSON.stringify(backup, null, 2),
          mimeType: "application/json",
          total: backup.records,
        });
        return;
      }

      // 初始化（8.3）
      if (req.method === "POST" && type && period && !action) {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const result = initializeLedger(db, { type, period, carryOver: body.carryOver !== false }, auth.account);
        // 8.4：初始化时结转人员名册
        if (result.created && body.carryOver !== false) carryOverRoster(db, type, period, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, { ...result, ledger: ledgerDetail(db, type, period) });
        return;
      }

      // 状态流转：锁定 / 归档（8.9 / 8.11）
      if (req.method === "POST" && type && period && action === "transition") {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const ledger = transitionLedger(
          db,
          { type, period, to: String(body.to || ""), reason: String(body.reason || "") },
          auth.account,
        );
        await saveDatabase(db);
        // 账套一锁，财务端的「可编辑」状态就变了，要立刻反映出来
        broadcastEvent("ledger");
        sendJson(res, 200, { ledger });
        return;
      }

      // 结转（8.4 / 8.6）
      if (req.method === "POST" && type && period && action === "carry-over") {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        const roster = carryOverRoster(db, type, period, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, { roster });
        return;
      }

      // 导入恢复（8.17）
      if (req.method === "POST" && url.pathname === "/api/ledgers/import") {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const result = importLedgerBackup(db, body.backup, { allowOverwrite: Boolean(body.force) }, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, result);
        return;
      }

      sendError(res, 404, "接口不存在");
      return;
    }

    // 监控状态（合同第七条第 6 项）
    if (req.method === "GET" && url.pathname === "/api/monitoring") {
      const auth = requireAuth(req, res, db, ["system_admin"]);
      if (!auth) return;
      // 没跑过就现跑一轮，不要回一个 null 让界面显示空白——
      // 刚重启就打开监控页是最常见的场景
      const latest =
        monitor.latest() ||
        (await monitor.run(db, {
          storageHealth,
          postgresHealth,
          solverProbe: checkSolverAvailability(),
          security: loginSecurityMetrics(),
          createNotification,
        }));
      sendJson(res, 200, {
        at: latest.at,
        healthy: latest.healthy,
        checks: latest.checks,
        uptimeSeconds: latest.metrics.uptimeSeconds,
        memoryMb: Math.round(latest.metrics.memory.rss / 1048576),
        counts: latest.metrics.counts,
        storage: latest.metrics.storage,
        postgres: latest.metrics.postgres,
        backup: latest.metrics.backup,
        reconciliation: latest.metrics.reconciliation,
      });
      return;
    }

    // 审计报表批量导出（验收 8.16）
    if (req.method === "GET" && url.pathname === "/api/audit-report") {
      const auth = requireAuth(req, res, db, ["hr", "system_admin", "division_head", "principal"]);
      if (!auth) return;
      // 学部负责人导出要按其可见范围裁剪：导出不能成为绕过数据权限的后门，
      // 界面上看不到的记录，导出文件里也不能有
      const scope = auth.account.role === "division_head" ? hrScopeFor(db, auth.account) : null;
      const report = buildAuditReport(db, {
        from: url.searchParams.get("from") || "",
        to: url.searchParams.get("to") || "",
        action: url.searchParams.get("action") || "",
        actorName: auth.account.name || auth.account.username || "",
        exportedAt: new Date().toISOString(),
        scope,
      });
      // 导出审计报表本身也要留痕——审计报表里有全校的操作记录
      appendAuditLog(db, {
        action: "audit_report_export",
        actorAccountId: auth.account.id,
        actorName: auth.account.name || auth.account.username || "",
        detail: `导出审计报表 ${report.total} 条（人事 ${report.counts.hr}、系统 ${report.counts.system}、账套 ${report.counts.ledgers}）`,
      });
      await saveDatabase(db);
      sendJson(res, 200, report);
      return;
    }

    // 对账（验收 8.12 / 8.13 / 8.14）
    if (url.pathname === "/api/reconciliation") {
      const auth = requireAuth(req, res, db, ["system_admin"]);
      if (!auth) return;
      const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
      if (req.method === "GET") {
        sendJson(res, 200, { month, report: latestReconciliation(db, month) });
        return;
      }
      if (req.method === "POST") {
        // 归档学年的课次不在内存里，对账要把它们取回来
        // 归档学年的课次不在内存里，对账要把它们取回来，否则会把
        // 「往年数据没加载」误报成「这些课没计薪」
        const term = (db.terms || []).find(
          (t) => t.startDate && t.endDate && `${month}-01` >= t.startDate.slice(0, 7) + "-01" && `${month}-01` <= t.endDate,
        );
        const lessons = term
          ? await resolveLedgerRows(db, "lessonInstances", { termId: term.id }, { queryArchivedRows })
          : undefined;
        const report = runReconciliation(db, month, { lessons }, auth.account);
        await saveDatabase(db);
        broadcastEvent("notification");
        sendJson(res, 200, { report });
        return;
      }
      sendError(res, 405, "方法不支持");
      return;
    }

    // 周教学工作量台账（验收 2.18）。范围裁剪在 reports.js 内按账号完成，
    // 这里只负责把账号透传下去——不要在这里先取全量再过滤。
    if (req.method === "GET" && url.pathname === "/api/reports/weekly-workload") {
      const auth = requireAuth(req, res, db, [
        "admin", "system_admin", "finance", "hr", "division_head", "teacher",
      ]);
      if (!auth) return;
      const params = Object.fromEntries(url.searchParams);
      const options = {
        termId: params.termId || queryTerms(db).currentTerm.id,
        weekStart: params.weekStart || "",
        stageId: params.stageId || "",
        teacherId: params.teacherId || "",
        includeIdle: params.includeIdle !== "false",
        account: auth.account,
      };
      const workloadDb = await withLessonsOf(options.termId);
      if (params.format === "excel") {
        if (auth.account.role === "finance" && !canExportAllPayrollDetails(auth.account)) {
          sendError(res, 403, "学部财务只能查看工作量台账，不能导出");
          return;
        }
        const result = exportWeeklyWorkload(workloadDb, options);
        sendJson(res, 200, {
          filename: result.filename,
          content: result.content,
          mimeType: result.mimeType,
          total: result.total,
        });
        return;
      }
      sendJson(res, 200, buildWeeklyWorkload(workloadDb, options));
      return;
    }

    // 年度薪资汇总（验收 3.19）属于管理报表。老师端只允许查看当前学期，
    // 因此不能从年度报表接口绕过当前学期的可见窗口。
    if (req.method === "GET" && url.pathname === "/api/reports/annual-salary") {
      const auth = requireAuth(req, res, db, [
        "admin", "finance", "hr", "division_head",
      ]);
      if (!auth) return;
      const params = Object.fromEntries(url.searchParams);
      const options = {
        year: Number(params.year) || new Date().getFullYear(),
        stageId: params.stageId || "",
        teacherId: params.teacherId || "",
        account: auth.account,
      };
      if (params.format === "excel") {
        if (!canExportAllPayrollDetails(auth.account)) {
          sendError(res, 403, "仅总校财务可以导出薪资报表");
          return;
        }
        const result = exportAnnualSalary(db, options);
        sendJson(res, 200, {
          filename: result.filename,
          content: result.content,
          mimeType: result.mimeType,
          total: result.total,
        });
        return;
      }
      sendJson(res, 200, buildAnnualSalary(db, options));
      return;
    }

    // 学期薪酬预算：仅展示，不对发放做限制。财务只看本人口径，行政管理看全部四个。
    if (req.method === "GET" && url.pathname === "/api/payroll/budget") {
      const auth = requireAuth(req, res, db, ["finance", "system_admin", "admin", "hr", "division_head", "principal"]);
      if (!auth) return;
      const termId = String(url.searchParams.get("termId") || queryTerms(db).currentTerm.id);
      const stageScope = accountStageScopeIds(auth.account);
      const budgetScope = stageScope.length === 1 ? stageScope[0] : financeReadScopeFor(auth.account) || "";
      sendJson(res, 200, queryTermBudget(db, termId, budgetScope));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/payroll/history") {
      const auth = requireAuth(req, res, db, ["finance"]);
      if (!auth) return;
      sendJson(res, 200, queryPayrollHistory(db, {
        ...Object.fromEntries(url.searchParams),
        financeScope: financeReadScopeFor(auth.account),
      }));
      return;
    }

    // ---- 第二阶段：人事管控 /api/hr/* ----

    if (url.pathname.startsWith("/api/hr/")) {
      const hrContext = { clientIp: clientIpFor(req), userAgent: req.headers["user-agent"] || "" };

      if (req.method === "GET" && url.pathname === "/api/hr/org-units") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin", "finance", "admin", "division_head"]);
        if (!auth) return;
        if (auth.account.role === "finance" && !canExportAllPayrollDetails(auth.account)) {
          sendError(res, 403, "仅总校财务可以查看组织与岗位");
          return;
        }
        sendJson(res, 200, { units: queryOrgUnits(db) });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/hr/org-units") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const unit = createOrgUnit(db, body, auth.account, hrContext);
        await saveDatabase(db);
        sendJson(res, 200, { unit });
        return;
      }

      const orgUnitMatch = url.pathname.match(/^\/api\/hr\/org-units\/([^/]+)(?:\/(status))?$/);
      if (orgUnitMatch) {
        const auth = requireAuth(req, res, db, ["hr", "system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        if (req.method === "POST" && orgUnitMatch[2] === "status") {
          const unit = setOrgUnitStatus(db, orgUnitMatch[1], String(body.status || ""), body.reason, auth.account, hrContext);
          await saveDatabase(db);
          sendJson(res, 200, { unit });
          return;
        }
        if (req.method === "PATCH" && !orgUnitMatch[2]) {
          const unit = updateOrgUnit(db, orgUnitMatch[1], body, auth.account, hrContext);
          await saveDatabase(db);
          sendJson(res, 200, { unit });
          return;
        }
      }

      if (req.method === "GET" && url.pathname === "/api/hr/positions") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin", "finance", "admin", "division_head"]);
        if (!auth) return;
        if (auth.account.role === "finance" && !canExportAllPayrollDetails(auth.account)) {
          sendError(res, 403, "仅总校财务可以查看组织与岗位");
          return;
        }
        sendJson(res, 200, { positions: queryPositions(db, Object.fromEntries(url.searchParams)) });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/hr/positions") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const position = createPosition(db, body, auth.account, hrContext);
        await saveDatabase(db);
        sendJson(res, 200, { position });
        return;
      }

      const positionMatch = url.pathname.match(/^\/api\/hr\/positions\/([^/]+)$/);
      if (positionMatch && req.method === "PATCH") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const position = updatePosition(db, positionMatch[1], body, auth.account, hrContext);
        await saveDatabase(db);
        sendJson(res, 200, { position });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/hr/personnel-tags") {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        sendJson(res, 200, { tags: queryPersonnelTags(db) });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/hr/personnel-tags") {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const tag = createPersonnelTag(db, body, auth.account, hrContext);
        await saveDatabase(db);
        broadcastEvent("hr-employee");
        sendJson(res, 200, { tag });
        return;
      }

      const personnelTagMatch = url.pathname.match(/^\/api\/hr\/personnel-tags\/([^/]+)$/);
      if (personnelTagMatch && req.method === "DELETE") {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        const result = deletePersonnelTag(db, personnelTagMatch[1], auth.account, hrContext);
        await saveDatabase(db);
        broadcastEvent("hr-employee");
        sendJson(res, 200, result);
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/hr/employees") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin", "division_head"]);
        if (!auth) return;
        sendJson(res, 200, queryEmployees(db, Object.fromEntries(url.searchParams), hrScopeFor(db, auth.account)));
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/hr/employees") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const employee = createEmployee(db, body, auth.account, hrContext);
        await saveDatabase(db);
        broadcastEvent("hr-employee");
        sendJson(res, 200, { employee });
        return;
      }

      // export 必须先于 /:id 匹配
      if (req.method === "GET" && url.pathname === "/api/hr/employees/export") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin"]);
        if (!auth) return;
        const result = exportEmployeesCsv(db, Object.fromEntries(url.searchParams), auth.account, hrContext);
        await saveDatabase(db);
        sendJson(res, 200, result);
        return;
      }

      // --- 证件附件（验收 1.5）---
      // 必须排在 employeeMatch 之前：那个分支对非 GET 请求一律先 readJsonBody，
      // 会把 multipart 的请求流读掉，之后再解析就只剩空的。
      const attachmentMatch = url.pathname.match(
        /^\/api\/hr\/employees\/([^/]+)\/attachments(?:\/([^/]+)(?:\/(content))?)?$/,
      );
      if (attachmentMatch) {
        const [, employeeId, attachmentId, sub] = attachmentMatch;
        // 附件里是身份证与银行卡正面，与档案本身同一套可见范围
        const auth = requireAuth(req, res, db, ["hr", "system_admin", "division_head"]);
        if (!auth) return;
        const employee = (db.employees || []).find((item) => item.id === employeeId);
        if (!employee) {
          sendError(res, 404, "人员档案不存在");
          return;
        }
        assertEmployeeInScope(db, auth.account, employee);

        if (req.method === "GET" && !attachmentId) {
          sendJson(res, 200, { attachments: listAttachments(db, employeeId) });
          return;
        }

        if (req.method === "POST" && !attachmentId) {
          if (!["hr", "system_admin"].includes(auth.account.role)) {
            sendError(res, 403, "只有人事与行政管理可以上传证件");
            return;
          }
          const { fields, files } = await parseMultipart(req, { maxBytes: MAX_ATTACHMENT_BYTES });
          if (!files.length) {
            sendError(res, 400, "请选择要上传的文件");
            return;
          }
          const saved = [];
          for (const file of files) {
            saved.push(
              await saveAttachment(db, {
                employeeId,
                category: fields.category || "other",
                filename: file.filename,
                contentType: file.contentType,
                data: file.data,
                actorAccount: auth.account,
              }),
            );
          }
          await saveDatabase(db);
          sendJson(res, 200, {
            uploaded: saved.map((r) => ({ id: r.id, originalName: r.originalName, bytes: r.bytes, duplicated: Boolean(r.duplicated) })),
            attachments: listAttachments(db, employeeId),
          });
          return;
        }

        if (req.method === "GET" && attachmentId && sub === "content") {
          const { record, data } = await readAttachment(db, attachmentId);
          if (record.employeeId !== employeeId) {
            // 附件 ID 属于另一个人：范围校验是按 URL 里的员工做的，
            // 不比对这一步就能拿 A 的档案路径去下 B 的证件
            sendError(res, 404, "附件不存在");
            return;
          }
          res.writeHead(
            200,
            securityHeaders({
              "Content-Type": record.mimeType,
              // 一律 attachment：证件是 PDF/图片，inline 打开等于在浏览器里
              // 直接渲染用户上传的内容，多一条 XSS 面
              "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(record.originalName)}`,
              "Content-Length": data.length,
              "Cache-Control": "no-store",
            }),
          );
          res.end(data);
          return;
        }

        if (req.method === "DELETE" && attachmentId) {
          if (!["hr", "system_admin"].includes(auth.account.role)) {
            sendError(res, 403, "只有人事与行政管理可以删除证件");
            return;
          }
          const record = deleteAttachment(db, attachmentId, auth.account);
          if (record.employeeId !== employeeId) {
            sendError(res, 404, "附件不存在");
            return;
          }
          await saveDatabase(db);
          sendJson(res, 200, { ok: true, attachments: listAttachments(db, employeeId) });
          return;
        }

        sendError(res, 404, "接口不存在");
        return;
      }

      const employeeMatch = url.pathname.match(
        /^\/api\/hr\/employees\/([^/]+)(?:\/(status|sensitive-view|contracts))?$/,
      );
      if (employeeMatch) {
        const employeeId = employeeMatch[1];
        const subPath = employeeMatch[2] || "";
        if (req.method === "GET" && !subPath) {
          const auth = requireAuth(req, res, db, ["hr", "system_admin", "division_head"]);
          if (!auth) return;
          const detail = getEmployeeDetail(db, employeeId, {
            includeAgreementMonthlySalary: auth.account.role === "system_admin",
          });
          assertEmployeeInScope(db, auth.account, db.employees.find((item) => item.id === employeeId));
          sendJson(res, 200, detail);
          return;
        }
        const auth = requireAuth(req, res, db, ["hr", "system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        if (req.method === "PATCH" && !subPath) {
          const existing = (db.employees || []).find((item) => item.id === employeeId);
          const workStatusChanged =
            body.workStatus !== undefined && String(body.workStatus || "") !== String(existing?.workStatus || "employed");
          const employee = updateEmployee(db, employeeId, body, auth.account, hrContext);
          const invalidatedCount = workStatusChanged && employee.teacherId
            ? invalidateOpenPayrollDetailsForTeacher(db, employee.teacherId)
            : 0;
          await saveDatabase(db);
          // 人事档案是跨模块共享的主数据：改了职称、任教科目，排课与工资侧
          // 立刻就跟着变（验收 4.1/4.3）。不广播的话，别的角色要刷新页面才看得到，
          // 而 4.5 要的是「实时推送」。
          broadcastEvent("hr-employee");
          if (workStatusChanged) broadcastEvent("payroll");
          sendJson(res, 200, { employee, invalidatedCount });
          return;
        }
        if (req.method === "POST" && subPath === "status") {
          const employee = setEmployeeStatus(db, employeeId, String(body.status || ""), body.reason, auth.account, hrContext);
          await saveDatabase(db);
          // 入离职直接影响当月核算人数（8.12 对账的人事侧基数）
          broadcastEvent("hr-employee");
          sendJson(res, 200, { employee });
          return;
        }
        if (req.method === "POST" && subPath === "sensitive-view") {
          const result = revealSensitiveField(db, employeeId, String(body.field || ""), body.reason, auth.account, hrContext);
          await saveDatabase(db);
          sendJson(res, 200, result);
          return;
        }
        if (req.method === "POST" && subPath === "contracts") {
          const contract = addEmployeeContract(db, employeeId, body, auth.account, hrContext);
          await saveDatabase(db);
          sendJson(res, 200, { contract });
          return;
        }
      }

      const contractMatch = url.pathname.match(/^\/api\/hr\/contracts\/([^/]+)$/);
      if (contractMatch && req.method === "PATCH") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const contract = updateEmployeeContract(db, contractMatch[1], body, auth.account, hrContext);
        await saveDatabase(db);
        sendJson(res, 200, { contract });
        return;
      }

      // ---- 月度考核分数（对应范围的工资核算员录入）----
      if (req.method === "GET" && url.pathname === "/api/hr/assessments") {
        const auth = requireAuth(req, res, db, ["finance"]);
        if (!auth) return;
        sendJson(res, 200, {
          assessments: queryMonthlyAssessments(db, Object.fromEntries(url.searchParams), auth.account),
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/hr/assessments") {
        const auth = requireAuth(req, res, db, ["finance"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const teacherId = String(body.teacherId || "");
        const month = String(body.month || "");
        if (teacherId && /^\d{4}-\d{2}$/.test(month)) {
          const currentPayroll = teacherPayrollDetail(db, teacherId, month);
          if (currentPayroll?.generated?.status === "locked") {
            sendError(res, 409, "本月工资已锁定，请先解锁后再修改考核分数");
            return;
          }
        }
        const assessment = upsertMonthlyAssessment(db, body, auth.account);
        invalidateOpenPayrollDetailsForTeacher(db, assessment.teacherId, assessment.month);
        await saveDatabase(db);
        // 考核分数会改变未锁定工资的试算金额，在线财务与老师端都应立即刷新。
        broadcastEvent("payroll");
        sendJson(res, 200, { assessment });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/hr/salary-templates") {
        const auth = requireAuth(req, res, db, ["hr", "finance"]);
        if (!auth) return;
        // 人事只看绑定关系与版本号；薪资规则的金额仅发给财务。
        const includePayload = auth.account.role === "finance";
        sendJson(res, 200, { templates: querySalaryTemplates(db, { includePayload }) });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/hr/salary-templates") {
        const auth = requireAuth(req, res, db, ["finance"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const result = createSalaryTemplate(db, body, auth.account, hrContext);
        await saveDatabase(db);
        sendJson(res, 200, result);
        return;
      }

      const templateMatch = url.pathname.match(/^\/api\/hr\/salary-templates\/([^/]+)\/(versions|apply)$/);
      if (templateMatch && req.method === "POST") {
        const auth = requireAuth(req, res, db, ["finance"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        if (templateMatch[2] === "versions") {
          const version = addSalaryTemplateVersion(db, templateMatch[1], body, auth.account, hrContext);
          await saveDatabase(db);
          sendJson(res, 200, { version });
          return;
        }
        const result = applySalaryTemplate(db, templateMatch[1], body, auth.account, hrContext);
        await saveDatabase(db);
        sendJson(res, 200, result);
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/hr/my-profile") {
        const auth = requireAuth(req, res, db, ["teacher"]);
        if (!auth) return;
        sendJson(res, 200, getMyHrProfile(db, auth.account));
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/hr/profile-change-requests") {
        const auth = requireAuth(req, res, db, ["teacher"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const flow = createProfileChangeRequest(db, auth.account, body.changes || {}, body.reason);
        await saveDatabase(db);
        broadcastEvent("hr-flow");
        sendJson(res, 200, { request: flow });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/hr/profile-change-requests") {
        const auth = requireAuth(req, res, db, ["teacher", "hr", "system_admin"]);
        if (!auth) return;
        sendJson(res, 200, {
          requests: queryProfileChangeRequests(db, Object.fromEntries(url.searchParams), auth.account),
        });
        return;
      }

      const changeRequestMatch = url.pathname.match(
        /^\/api\/hr\/profile-change-requests\/([^/]+)\/(approve|reject|withdraw)$/,
      );
      if (changeRequestMatch && req.method === "POST") {
        const action = changeRequestMatch[2];
        if (action === "withdraw") {
          const auth = requireAuth(req, res, db, ["teacher"]);
          if (!auth) return;
          const flow = withdrawProfileChangeRequest(db, changeRequestMatch[1], auth.account);
          await saveDatabase(db);
          sendJson(res, 200, { request: flow });
          return;
        }
        const auth = requireAuth(req, res, db, ["hr", "system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const flow = reviewProfileChangeRequest(db, changeRequestMatch[1], action, body.comment, auth.account, hrContext);
        await saveDatabase(db);
        sendJson(res, 200, { request: flow });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/hr/audit-logs") {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        sendJson(res, 200, queryHrAuditLogs(db, Object.fromEntries(url.searchParams), hrScopeFor(db, auth.account)));
        return;
      }

      // ---- M3 审批流 ----

      if (req.method === "GET" && url.pathname === "/api/hr/todos") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin", "division_head"]);
        if (!auth) return;
        sendJson(res, 200, { count: countHrTodos(db, auth.account) });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/hr/flows") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin", "division_head"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const flow = createHrFlow(db, auth.account, body, hrContext);
        await saveDatabase(db);
        broadcastEvent("hr-flow");
        broadcastEvent("notification");
        sendJson(res, 200, { flow });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/hr/flows") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin", "division_head"]);
        if (!auth) return;
        sendJson(res, 200, { flows: queryHrFlows(db, Object.fromEntries(url.searchParams), auth.account) });
        return;
      }

      const flowMatch = url.pathname.match(/^\/api\/hr\/flows\/([^/]+)\/(approve|reject|withdraw)$/);
      if (flowMatch && req.method === "POST") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin", "division_head"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const action = flowMatch[2];
        const flow =
          action === "withdraw"
            ? withdrawHrFlow(db, flowMatch[1], auth.account)
            : approveHrFlowStep(db, flowMatch[1], action, body.comment, auth.account, hrContext);
        await saveDatabase(db);
        broadcastEvent("hr-flow");
        broadcastEvent("notification");
        sendJson(res, 200, { flow });
        return;
      }
    }

    // ---------------------------------------------------------------- 通用审批（OA）
    if (parts[0] === "api" && parts[1] === "oa") {
      const ALL_ROLES = ["teacher", "admin", "finance", "hr", "division_head", "principal", "system_admin"];

      // 可发起的审批类型（按角色过滤）
      if (req.method === "GET" && url.pathname === "/api/oa/templates") {
        const auth = requireAuth(req, res, db, ALL_ROLES);
        if (!auth) return;
        sendJson(res, 200, { templates: listTemplatesForRole(db, auth.account) });
        return;
      }

      // 学部财务发起月度工资确认时，只能选择“本学部、已完成复核”的工资期间。
      // 人数和应发金额由服务端从工资快照回填，避免手填金额与实际明细不一致。
      if (req.method === "GET" && url.pathname === "/api/oa/payroll-approval-options") {
        const auth = requireAuth(req, res, db, ["finance"]);
        if (!auth) return;
        sendJson(res, 200, listPayrollApprovalOptions(db, auth.account));
        return;
      }

      // ---- 审批流程配置（行政管理自定义）----
      if (req.method === "GET" && url.pathname === "/api/oa/admin/templates") {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        sendJson(res, 200, {
          templates: listAllTemplates(db),
          approverRoles: OA_APPROVER_ROLES,
          approverAccounts: listOaApproverAccounts(db),
          fieldTypes: OA_FIELD_TYPES,
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/oa/admin/templates") {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const template = createOaTemplate(db, body, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, { template });
        return;
      }

      const templateMatch = url.pathname.match(/^\/api\/oa\/admin\/templates\/([^/]+)$/);
      if (templateMatch && (req.method === "PATCH" || req.method === "DELETE")) {
        const auth = requireAuth(req, res, db, ["system_admin"]);
        if (!auth) return;
        if (req.method === "DELETE") {
          const result = deleteOaTemplate(db, templateMatch[1]);
          await saveDatabase(db);
          sendJson(res, 200, result);
          return;
        }
        const body = await readJsonBody(req);
        const template = body.status
          ? setOaTemplateStatus(db, templateMatch[1], body.status, auth.account)
          : updateOaTemplate(db, templateMatch[1], body, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, { template });
        return;
      }

      // 请假审批用：列出申请人在请假期间的课次 + 每节课的可代课教师
      if (req.method === "GET" && url.pathname === "/api/oa/lesson-arrangements") {
        const auth = requireAuth(req, res, db, ["admin", "division_head", "hr", "system_admin"]);
        if (!auth) return;
        const requestId = url.searchParams.get("requestId") || "";
        const request = db.oaRequests?.find((item) => item.id === requestId);
        if (!request) {
          sendError(res, 404, "审批单不存在");
          return;
        }
        // 申请人账号 → 教师
        const applicantAccount = db.accounts.find((item) => item.id === request.applicantAccountId);
        const teacherId = applicantAccount?.teacherId || "";
        const startDate = request.formData?.startDate || "";
        const endDate = request.formData?.endDate || startDate;
        const lessons = teacherId
          ? listTeacherLessonsInRange(db, teacherId, startDate, endDate).filter((lesson) =>
              lessonIsInLeaveHalfRange(lesson, request.formData),
            )
          : [];
        sendJson(res, 200, {
          teacherId,
          startDate,
          endDate,
          startHalf: request.formData?.startHalf || "",
          endHalf: request.formData?.endHalf || "",
          lessons: lessons.map((lesson) => ({
            ...lesson,
            candidates: lesson.changeable ? listSubstituteCandidates(db, lesson.lessonId) : [],
          })),
        });
        return;
      }

      // 调课申请用：老师选择自己的已发布课程，以及线下协商好的另一位老师的课程。
      // 返回课程主键而非让老师手输日期/节次，审批通过时才能可靠地修改真实课表。
      if (req.method === "GET" && url.pathname === "/api/oa/lesson-swap-options") {
        const auth = requireAuth(req, res, db, ["teacher", "division_head"]);
        if (!auth) return;
        sendJson(res, 200, listLessonSwapOptions(db, auth.account.teacherId));
        return;
      }

      // 待办数（前端角标）
      if (req.method === "GET" && url.pathname === "/api/oa/todos") {
        const auth = requireAuth(req, res, db, ALL_ROLES);
        if (!auth) return;
        sendJson(res, 200, { count: countOaTodos(db, auth.account) });
        return;
      }

      // 列表：scope=todo|mine|handled|all
      if (req.method === "GET" && url.pathname === "/api/oa/requests") {
        const auth = requireAuth(req, res, db, ALL_ROLES);
        if (!auth) return;
        sendJson(res, 200, queryOaRequests(db, Object.fromEntries(url.searchParams), auth.account));
        return;
      }

      // 发起申请
      if (req.method === "POST" && url.pathname === "/api/oa/requests") {
        const auth = requireAuth(req, res, db, ALL_ROLES);
        if (!auth) return;
        const isMultipart = String(req.headers["content-type"] || "").toLowerCase().includes("multipart/form-data");
        let body;
        let files = [];
        if (isMultipart) {
          const parsed = await parseMultipart(req, {
            maxBytes: MAX_ATTACHMENT_BYTES * MAX_OA_ATTACHMENTS + 1024 * 1024,
            maxFiles: MAX_OA_ATTACHMENTS,
          });
          files = parsed.files;
          try {
            body = JSON.parse(parsed.fields.payload || "{}");
          } catch {
            sendError(res, 400, "申请数据格式错误");
            return;
          }
          body.formData = body.formData && typeof body.formData === "object" ? body.formData : {};
          // 先把文件名写进对应表单字段，使必传附件模板也能通过表单校验；
          // 文件本体随后经魔数识别、加密落盘，不能只相信这个文件名。
          const namesByField = new Map();
          files.forEach((file) => {
            const key = String(file.name || "attachment");
            namesByField.set(key, [...(namesByField.get(key) || []), file.filename]);
          });
          namesByField.forEach((names, key) => {
            body.formData[key] = names.join("、");
          });
        } else {
          body = await readJsonBody(req);
        }

        // createOaRequest 会同时产生审批通知；若任一附件保存失败，内存里的
        // 申请、通知和附件元数据都必须回滚，不能留下“申请成功但材料丢了”的半成品。
        const requestCount = (db.oaRequests || []).length;
        const notificationCount = (db.notifications || []).length;
        const attachmentCount = (db.hrAttachments || []).length;
        try {
          const request = createOaRequest(db, auth.account, body);
          const allowedFileFields = new Set(
            getOaRequestDetail(db, request.id, auth.account)
              .formFields.filter((field) => field.type === "file")
              .map((field) => field.key),
          );
          const invalidFile = files.find((file) => !allowedFileFields.has(String(file.name || "")));
          if (invalidFile) {
            const error = new Error("该审批类型不接受此附件字段");
            error.statusCode = 400;
            throw error;
          }
          for (const file of files) {
            await saveAttachment(db, {
              employeeId: oaAttachmentOwnerId(request.id),
              category: "other",
              filename: file.filename,
              contentType: file.contentType,
              data: file.data,
              actorAccount: auth.account,
            });
          }
          const attachments = listAttachments(db, oaAttachmentOwnerId(request.id));
          await saveDatabase(db);
          broadcastEvent("oa-request");
          broadcastEvent("notification");
          sendJson(res, 200, { request: { ...request, attachments } });
        } catch (error) {
          if (Array.isArray(db.oaRequests)) db.oaRequests.splice(requestCount);
          if (Array.isArray(db.notifications)) db.notifications.splice(notificationCount);
          if (Array.isArray(db.hrAttachments)) db.hrAttachments.splice(attachmentCount);
          throw error;
        }
        return;
      }

      // 可抄送人候选清单：候选范围与提交时的校验口径一致，
      // 否则界面上选得到、点提交却报错
      if (req.method === "GET" && url.pathname === "/api/oa/cc-candidates") {
        const auth = requireAuth(req, res, db, ALL_ROLES);
        if (!auth) return;
        sendJson(res, 200, {
          candidates: listCcCandidates(
            db,
            url.searchParams.get("templateKey") || "",
            url.searchParams.get("keyword") || "",
          ),
        });
        return;
      }

      // 给已存在的单子补抄送人
      const ccMatch = url.pathname.match(/^\/api\/oa\/requests\/([^/]+)\/cc$/);
      if (ccMatch && req.method === "POST") {
        const auth = requireAuth(req, res, db, ALL_ROLES);
        if (!auth) return;
        const body = await readJsonBody(req);
        const result = addOaCcRecipients(db, ccMatch[1], body.accountIds || [], auth.account);
        await saveDatabase(db);
        broadcastEvent("oa-request");
        broadcastEvent("notification");
        sendJson(res, 200, result);
        return;
      }

      // 执行环节凭证：审批人和执行人完全分离。只有审批全部通过后被指定的
      // 执行人才可以上传拨款回单、截图等，并由下一个 execute 动作正式办结。
      const executionEvidenceMatch = url.pathname.match(/^\/api\/oa\/requests\/([^/]+)\/execution\/evidence$/);
      if (executionEvidenceMatch && req.method === "POST") {
        const auth = requireAuth(req, res, db, ALL_ROLES);
        if (!auth) return;
        const parsed = await parseMultipart(req, {
          maxBytes: MAX_ATTACHMENT_BYTES * MAX_OA_ATTACHMENTS + 1024 * 1024,
          maxFiles: MAX_OA_ATTACHMENTS,
        });
        if (!parsed.files.length) {
          sendError(res, 400, "请至少选择一份执行凭证");
          return;
        }
        const requestId = executionEvidenceMatch[1];
        const request = db.oaRequests?.find((item) => item.id === requestId);
        const attachmentCount = (db.hrAttachments || []).length;
        const beforeExecution = request?.execution ? JSON.parse(JSON.stringify(request.execution)) : null;
        const beforeTimelineLength = request?.timeline?.length || 0;
        const beforeUpdatedAt = request?.updatedAt || "";
        try {
          const saved = [];
          for (const file of parsed.files) {
            saved.push(
              await saveAttachment(db, {
                employeeId: oaAttachmentOwnerId(requestId),
                category: "other",
                filename: file.filename,
                contentType: file.contentType,
                data: file.data,
                actorAccount: auth.account,
              }),
            );
          }
          const updated = addOaExecutionEvidence(db, requestId, saved, auth.account);
          await saveDatabase(db);
          broadcastEvent("oa-request");
          sendJson(res, 200, {
            request: {
              ...updated,
              attachments: listAttachments(db, oaAttachmentOwnerId(requestId)),
            },
          });
        } catch (error) {
          if (Array.isArray(db.hrAttachments)) db.hrAttachments.splice(attachmentCount);
          if (request?.execution && beforeExecution) request.execution = beforeExecution;
          if (Array.isArray(request?.timeline)) request.timeline.splice(beforeTimelineLength);
          if (request) request.updatedAt = beforeUpdatedAt;
          throw error;
        }
        return;
      }

      // 审批动作：approve / reject / withdraw / urge；execute 仅执行人可操作。
      const actionMatch = url.pathname.match(/^\/api\/oa\/requests\/([^/]+)\/(approve|reject|withdraw|urge|execute)$/);
      if (actionMatch && req.method === "POST") {
        const auth = requireAuth(req, res, db, ALL_ROLES);
        if (!auth) return;
        const body = await readJsonBody(req);
        const [, requestId, action] = actionMatch;
        let request;
        if (action === "withdraw") request = withdrawOaRequest(db, requestId, auth.account);
        else if (action === "urge") request = urgeOaRequest(db, requestId, auth.account);
        else if (action === "execute") request = executeOaRequest(db, requestId, auth.account, body);
        else request = actOnOaRequest(db, requestId, action, auth.account, body);
        await saveDatabase(db);
        broadcastEvent("oa-request");
        broadcastEvent("notification");
        // 薪酬预算确认、学部预算使用申请办结后会改写预算台账；主任和财务
        // 正在查看的同一 termId 面板必须自动失效重载，不能还停留在旧余额。
        if (["term_budget", "division_budget_usage", "payroll_ledger"].includes(request?.appliedResult?.type)) {
          broadcastEvent("term-budget");
        }
        if (["leave_payroll", "payroll_ledger"].includes(request?.appliedResult?.type)) broadcastEvent("payroll");
        sendJson(res, 200, { request });
        return;
      }

      // OA 证明材料下载：先用审批详情的同一套规则验证“与该单相关”，
      // 再核对附件所有者，防止拿别人的附件 ID 越权下载。
      const oaAttachmentMatch = url.pathname.match(
        /^\/api\/oa\/requests\/([^/]+)\/attachments\/([^/]+)\/content$/,
      );
      if (oaAttachmentMatch && req.method === "GET") {
        const auth = requireAuth(req, res, db, ALL_ROLES);
        if (!auth) return;
        const [, requestId, attachmentId] = oaAttachmentMatch;
        getOaRequestDetail(db, requestId, auth.account);
        const { record, data } = await readAttachment(db, attachmentId);
        if (record.employeeId !== oaAttachmentOwnerId(requestId)) {
          sendError(res, 404, "附件不存在");
          return;
        }
        res.writeHead(
          200,
          securityHeaders({
            "Content-Type": record.mimeType,
            "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(record.originalName)}`,
            "Content-Length": data.length,
            "Cache-Control": "no-store",
          }),
        );
        res.end(data);
        return;
      }

      // 详情
      const detailMatch = url.pathname.match(/^\/api\/oa\/requests\/([^/]+)$/);
      if (detailMatch && req.method === "GET") {
        const auth = requireAuth(req, res, db, ALL_ROLES);
        if (!auth) return;
        const request = getOaRequestDetail(db, detailMatch[1], auth.account);
        sendJson(res, 200, {
          request: {
            ...request,
            attachments: listAttachments(db, oaAttachmentOwnerId(detailMatch[1])),
          },
        });
        return;
      }
    }

    if (req.method === "GET" && url.pathname === "/api/phase1/readiness") {
      const auth = requireAuth(req, res, db, ["finance", "system_admin"]);
      if (!auth) return;
      const readiness = validatePhase1Readiness(db);
      const solverProbe = checkSolverAvailability();
      readiness.checks.push({
        key: "scheduling_solver",
        label: "OR-Tools CP-SAT 排课求解器可用（生产必装）",
        passed: solverProbe.available,
        detail: `${solverProbe.message}（python: ${solverProbe.pythonBin}）`,
      });
      if (DB_DRIVER !== "json") {
        const pgReachable = await postgresPing();
        readiness.checks.push({
          key: "postgres_connection",
          label: `PostgreSQL 数据层可用（当前驱动 ${DB_DRIVER}）`,
          passed: pgReachable && !postgresHealth.lastError.includes("persist:"),
          detail: pgReachable
            ? `连接正常，最近持久化 ${postgresHealth.lastPersistAt || "尚未发生"}（${postgresHealth.lastPersistMs}ms）`
            : `连接失败：${postgresHealth.lastError}`,
        });
      }
      // 第二阶段检查组
      readiness.checks.push({
        key: "hr_encryption_key",
        label: "人事敏感字段加密密钥已配置（HR_ENCRYPTION_KEY）",
        passed: piiEncryptionReady(),
        detail: piiEncryptionReady()
          ? "密钥格式正确，证件/银行卡将加密落库"
          : "未配置或格式错误：人事敏感字段的写入与完整读取会被拒绝（不会明文落库）",
      });
      readiness.checks.push({
        key: "hr_timeout_scanner",
        label: "人事审批超时扫描任务存活",
        passed: Boolean(db.meta.hrTimeoutScanAt),
        detail: db.meta.hrTimeoutScanAt
          ? `最近扫描 ${db.meta.hrTimeoutScanAt}`
          : "尚未执行过扫描（服务启动后每小时一次）",
      });
      readiness.checks.push({
        key: "hr_backfill",
        label: "全员档案与教师数量一致",
        passed:
          (db.employees || []).filter((employee) => employee.teacherId).length >= (db.teachers || []).length,
        detail: `教师 ${(db.teachers || []).length} 人，教师档案 ${(db.employees || []).filter((employee) => employee.teacherId).length} 份`,
      });
      readiness.passed = readiness.checks.every((check) => check.passed);
      sendJson(res, 200, readiness);
      return;
    }

    sendError(res, 404, "接口不存在");
  } catch (error) {
    const isBadJson = error instanceof SyntaxError;
    const statusCode = isBadJson ? 400 : error.statusCode || 500;
    sendError(
      res,
      statusCode,
      isBadJson ? "请求 JSON 格式错误" : error.statusCode ? error.message : "服务端错误",
      error.details || error.message,
    );
  }
}

async function serveStatic(req, res, url) {
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const absolutePath = path.normalize(path.join(PUBLIC_ROOT, requestedPath));

  if (!absolutePath.startsWith(PUBLIC_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(absolutePath);
    const filePath = stat.isDirectory() ? path.join(absolutePath, "index.html") : absolutePath;
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const content = await fs.readFile(filePath);

    res.writeHead(
      200,
      securityHeaders({ "Content-Type": contentType, "Cache-Control": "no-store" }),
    );
    res.end(content);
  } catch (error) {
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("Not found");
  }
}

/**
 * 审批通过后要落地的业务动作。
 *
 * 抽成独立函数是为了能被测试调用：这些注册原本埋在 createServer() 里，
 * 想验证「审批通过后账套真的解开了」就得先起一个 HTTP 服务。
 * 于是测试往往退而求其次，在测试里自己注册一份一模一样的 handler——
 * 那验证的是测试自己写的副本，生产代码里那份错了也照样通过。
 */
function monthsBetween(startMonth, endMonth) {
  const start = /^(\d{4})-(\d{2})$/.exec(String(startMonth || ""));
  const end = /^(\d{4})-(\d{2})$/.exec(String(endMonth || ""));
  if (!start || !end) return [];
  const startIndex = Number(start[1]) * 12 + Number(start[2]) - 1;
  const endIndex = Number(end[1]) * 12 + Number(end[2]) - 1;
  if (
    startIndex > endIndex ||
    Number(start[2]) < 1 ||
    Number(start[2]) > 12 ||
    Number(end[2]) < 1 ||
    Number(end[2]) > 12
  ) return [];
  const months = [];
  for (let index = startIndex; index <= endIndex; index += 1) {
    const year = Math.floor(index / 12);
    const month = (index % 12) + 1;
    months.push(`${year}-${String(month).padStart(2, "0")}`);
  }
  return months;
}

export function registerApprovalSideEffects() {
  // 请假审批通过后由调课引擎真正更新课表（含全部冲突与锁定校验）
  registerOaSideEffect("applySubstitutes", (database, arrangements, account) =>
    applySubstituteArrangements(database, arrangements, account),
  );

  // 调课审批通过后，双方已协商的两节课程原子地互换上课时间。
  registerOaSideEffect("applyLessonSwap", (database, payload, account) =>
    applyApprovedLessonSwap(database, payload, account),
  );

  // 请假最终备案后，已生成但尚未锁定的工资单必须丢弃并按实际请假日重算。
  // 锁定工资不会被这一动作改写，仍须按账套解锁/更正的受控流程处理。
  registerOaSideEffect("invalidateLeavePayroll", (database, payload) => {
    const applicant = (database.accounts || []).find((item) => item.id === payload.applicantAccountId);
    const teacherId = applicant?.teacherId || "";
    const startMonth = String(payload.formData?.startDate || "").slice(0, 7);
    const endMonth = String(payload.formData?.endDate || "").slice(0, 7);
    const months = monthsBetween(startMonth, endMonth);
    const invalidated = teacherId
      ? months.map((month) => ({ month, count: invalidateOpenPayrollDetailsForTeacher(database, teacherId, month) }))
      : [];
    return {
      type: "leave_payroll",
      teacherId,
      months,
      invalidatedCount: invalidated.reduce((sum, item) => sum + item.count, 0),
      lockedMonths: teacherId
        ? months.filter((month) =>
            (database.payrollDetails || []).some(
              (item) => item.teacherId === teacherId && item.month === month && item.status === "locked",
            ),
          )
        : [],
    };
  });

  // 账套解锁三级通过后才真的解锁（验收 8.10）。
  //
  // unlockLedgerByApproval 是唯一的解锁入口——账套路由上没有解锁动作，
  // 界面上也不画解锁按钮。这里不注册的话，函数就是死代码，
  // 而账套一旦锁上就再也解不开了。
  registerOaSideEffect("unlockApprovedLedger", (database, payload) => {
    const ledger = unlockLedgerByApproval(
      database,
      { type: payload.type, period: payload.period, reason: payload.reason, requestId: payload.requestId },
      { id: "SYSTEM-OA", name: `${payload.actorName}（审批 ${payload.requestId}）` },
    );
    broadcastEvent("ledger");
    return {
      type: "ledger_unlock",
      ledgerType: ledger.type,
      period: ledger.period,
      status: ledger.status,
      // 解锁次数带进审批结果：翻这张单子就能看到「这是第几次解锁」，
      // 不用再去账套列表里找
      unlockCount: ledger.unlockCount,
    };
  });

  // 薪资审批三级通过后才锁定工资、生成台账（验收 3.13 / 3.14）。
  // 走 lockPayrollBatch 而不是自己改状态：批量锁定里带着"老师是否已确认、
  // 异议是否已处理"等前置校验，绕过去等于把这些校验一起绕过了。
  registerOaSideEffect("lockApprovedPayroll", (database, payload) => {
    const scopeId = PAYROLL_SCOPE_BY_LABEL[payload.scope] || "";
    if (!scopeId) throw new Error(`薪资审批的适用范围无法识别：${payload.scope}`);
    // 范围必须挂在「操作账号」上：batchTeacherIdsInScope 是按账号的
    // financeScope 圈定人员的，传个没有范围的账号会锁掉全校，
    // 等于批了小学部却把初高中的工资一起发了。
    const batch = lockPayrollBatch(
      database,
      { month: payload.month },
      {
        id: "SYSTEM-OA",
        role: "finance",
        financeScope: scopeId,
        name: `${payload.actorName}（审批 ${payload.requestId}）`,
      },
    );
    // 把没锁上的原因带出来。一张"审批通过但 0 人锁定"的单子若和
    // "335 人全部锁定"长得一样，财务会以为工资已经发了。
    const reasons = [...new Set(batch.results.filter((item) => !item.ok).map((item) => item.error))].slice(0, 3);

    // 账套级锁定（验收 8.9）：逐条锁工资单还答不了「2026-06 这个账套锁没锁」，
    // 半锁半不锁是个查不出来的状态。账套状态才是那个能一眼看到的答案。
    // 注意顺序：先锁完工资单再锁账套，反过来会被账套边界把自己的锁定动作挡下。
    initializeLedger(database, { type: "payroll", period: payload.month }, payload.account);
    const ledgerBefore = findLedger(database, "payroll", payload.month);
    if (ledgerBefore?.status === "active") {
      transitionLedger(
        database,
        { type: "payroll", period: payload.month, to: "locked", reason: `薪资审批 ${payload.requestId} 通过` },
        payload.account,
      );
    }
    return {
      month: payload.month,
      scope: payload.scope,
      lockedCount: batch.successCount,
      skippedCount: batch.failedCount,
      failureReasons: reasons,
      ledgerStatus: findLedger(database, "payroll", payload.month)?.status || "",
      totalAmount: batch.results
        .filter((item) => item.ok)
        .reduce((sum, item) => sum + Number(item.grossPay || 0), 0),
    };
  });

  // 新版“月度工资确认”不在校长签字时锁定，而是在总校财务上传发放凭证并确认
  // 执行时锁定。先预检所有人员，确保不会出现“一半已发、一半失败”的半完成状态。
  // 这里刻意不锁全校的 payroll 账套：四个学部会分别走确认流程，先完成的小学部
  // 不能把同月其他学部的正常核算一并封死；每一份工资明细本身仍会锁定且不可改写。
  registerOaSideEffect("executeApprovedPayroll", (database, payload) => {
    const scopeId = String(payload.scopeId || "").trim();
    const month = String(payload.month || "").trim();
    const termId = String(payload.termId || "").trim();
    const expectedCount = Number(payload.headcount || 0);
    const scoped = (database.payrollDetails || []).filter(
      (detail) =>
        detail.month === month &&
        detail.termId === termId &&
        payrollScopeOfTeacher(database, detail.teacherId) === scopeId,
    );
    if (!scoped.length || scoped.length !== expectedCount) {
      const error = new Error("本学部工资明细数量与审批快照不一致，请重新核算后发起确认");
      error.statusCode = 409;
      throw error;
    }
    const notReviewable = scoped.filter((detail) => detail.status !== "reviewed");
    if (notReviewable.length) {
      const error = new Error(`仍有 ${notReviewable.length} 人工资未保持“财务已复核”状态，不能执行发放`);
      error.statusCode = 409;
      throw error;
    }
    const withPendingLessons = scoped
      .map((detail) => ({ detail, blockers: teacherPayrollDetail(database, detail.teacherId, month)?.lockBlockers || [] }))
      .filter((item) => item.blockers.length);
    if (withPendingLessons.length) {
      const error = new Error(`仍有 ${withPendingLessons.length} 人存在未上课但已计薪的课程，不能执行发放`);
      error.statusCode = 409;
      throw error;
    }
    const batch = lockPayrollBatch(
      database,
      { month, teacherIds: scoped.map((detail) => detail.teacherId) },
      {
        id: "SYSTEM-OA",
        role: "finance",
        financeScope: scopeId,
        name: `${payload.actorName}（工资确认 ${payload.requestId}）`,
      },
    );
    if (batch.failedCount) {
      // 正常情况下上方预检已经覆盖所有失败条件；保留这道防线，避免业务规则日后
      // 新增后悄悄出现部分锁定。当前请求会报错，需由管理员按解锁流程更正。
      const error = new Error(`工资锁定未完成：${batch.results.filter((item) => !item.ok).map((item) => item.error).filter(Boolean).join("；")}`);
      error.statusCode = 409;
      throw error;
    }
    return {
      month,
      scopeId,
      scopeName: String(payload.scopeName || financeScopeLabel(scopeId)),
      lockedCount: batch.successCount,
      ledgerStatus: "学部工资已锁定",
      totalAmount: batch.results.reduce((sum, item) => sum + Number(item.grossPay || 0), 0),
    };
  });
}

// 监控器持有「上一轮各项检查是不是正常」的状态，用来只在状态翻转时告警。
// 放在模块级而不是 createServer 里：重启会丢状态是可以接受的
// （重启后第一轮把当前所有异常重报一遍，正是想要的行为）。
const monitor = createMonitor();

export async function createServer() {
  const db = await ensureDatabase();

  // 外键与索引随表走：一次 DROP TABLE 就全没了，而重启只会重建裸表。
  // 靠人记得跑脚本是不行的——它已经这样悄无声息地消失过一次。
  if (postgresHealth.connected) await ensureSchemaConstraints();

  // M3：人事审批超时扫描（每小时一次，停留超 3 个工作日提醒；启动即扫一次）
  // 审批模板首次运行时播种（幂等，已有模板不会被覆盖）
  if (ensureOaTemplates(db)) await saveDatabase(db);

  registerApprovalSideEffects();


  const runHrTimeoutScan = async () => {
    try {
      const notified = scanHrFlowTimeouts(db);
      // 通用审批与人事流程同口径：停留超 3 个工作日提醒当前审批人
      const oaResult = scanOaTimeouts(db);
      db.meta.hrTimeoutScanAt = new Date().toISOString();
      if (notified || oaResult.reminded) await saveDatabase(db);
    } catch (error) {
      console.error("[hr] 审批超时扫描失败:", error.message);
    }
  };
  runHrTimeoutScan();
  setInterval(runHrTimeoutScan, 60 * 60 * 1000).unref();

  // 监控与告警（合同第七条第 6 项）。
  // 五分钟一轮：一分钟太密（磁盘与备份检查要读文件系统），
  // 十五分钟又太稀——数据库断开十五分钟才知道，业务早就报错一片了。
  const runMonitor = async () => {
    try {
      const before = (db.notifications || []).length;
      await monitor.run(db, {
        storageHealth,
        postgresHealth,
        solverProbe: checkSolverAvailability(),
        security: loginSecurityMetrics(),
        createNotification,
      });
      // 只有真发了通知才落盘。每五分钟无条件写一次库，
      // 一天就是 288 次没有任何改动的持久化
      if ((db.notifications || []).length !== before) {
        await saveDatabase(db);
        broadcastEvent("notification");
      }
    } catch (error) {
      console.error("[monitor] 监控轮次执行失败:", error.message);
    }
  };
  runMonitor();
  setInterval(runMonitor, 5 * 60 * 1000).unref();

  return http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, db, url);
      return;
    }

    await serveStatic(req, res, url);
  });
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  // 配置自检要在建服务之前：连不上库、没有加密密钥的服务，
  // 跑起来比不跑更糟——等发现时数据已经写进去一半了。
  assertConfigOrExit();
  const server = await createServer();
  // 上线前的硬性前提（E-4）：默认口令、未配 HTTPS、未配加密密钥。
  // 只在文档里写"记得改"是没用的——每次启动都吼一遍才不会被忘掉。
  const warnInsecureDefaults = async () => {
    // 这里在 createServer 之外，拿不到它内部的 db；自己取一次
    // （ensureDatabase 有缓存，不会重复加载）
    const database = await ensureDatabase();
    const issues = [];
    // 只探管理类账号：一千多个教师账号逐个验散列会拖慢启动，
    // 而真正致命的是管理账号还留着默认口令。
    const MGMT = ["admin", "system_admin", "finance", "hr", "division_head", "principal"];
    const weakMgmt = (database.accounts || []).filter(
      (a) => a.status === "active" && MGMT.includes(a.role) && verifyPassword("123456", a.passwordHash),
    );
    if (weakMgmt.length) {
      issues.push(
        `${weakMgmt.length} 个管理类账号仍在使用默认口令 123456（${weakMgmt
          .slice(0, 3)
          .map((a) => a.username)
          .join("、")}${weakMgmt.length > 3 ? " 等" : ""}）→ node scripts/rotate-passwords.js --admins`,
      );
    }
    if (process.env.FORCE_HTTPS !== "1") {
      issues.push("未启用 HTTPS：工资与身份证信息在网络上是明文传输 → 配置反向代理证书后设 FORCE_HTTPS=1");
    }
    if (!process.env.HR_ENCRYPTION_KEY) {
      issues.push("未配置 HR_ENCRYPTION_KEY：身份证、银行卡、工资金额将无法加密落库");
    }
    if (!issues.length) return;
    console.warn("");
    console.warn("  ⚠ 上线前必须处理的安全事项：");
    issues.forEach((text, i) => console.warn(`    ${i + 1}. ${text}`));
    console.warn("");
  };

  server.on("error", (error) => {
    console.error("[server] HTTP 服务错误:", error.message);
    if (error.code === "EADDRINUSE") process.exit(1);
  });
  server.listen(PORT, HOST, () => {
    const solverProbe = checkSolverAvailability();
    console.log(`School system running at http://${HOST}:${PORT}/  [${inspectConfig().profile}]`);
    console.log(`Local URL: http://127.0.0.1:${PORT}/`);
    console.log(`API health: http://127.0.0.1:${PORT}/api/health`);
    console.log(
      solverProbe.available
        ? `[scheduler] OR-Tools CP-SAT 可用（${solverProbe.pythonBin}）`
        : `[scheduler] 警告：${solverProbe.message}，排课将回退内置启发式算法`,
    );
    warnInsecureDefaults().catch((error) =>
      console.warn(`[security] 安全自检失败：${error.message}`),
    );
  });
}
