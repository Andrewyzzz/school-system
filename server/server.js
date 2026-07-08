import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { issueClassroomQrToken, markMissingCheckOutExceptions, submitTeacherAttendance } from "./attendance.js";
import { createToken, verifyPasswordAsync } from "./auth.js";
import { commitTeacherImport, previewTeacherImport } from "./importTeachers.js";
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
} from "./scheduling.js";
import {
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
  queryTeacherAttendanceRecords,
  queryTeacherAssignments,
  queryTerms,
  queryTeachers,
  referenceCatalog,
  resetAccountPassword,
  revokeSession,
  reviewTeacherPayrollDetail,
  saveDatabase,
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
} from "./storage.js";
import { postgresHealth, postgresPing } from "./db/postgresStore.js";
import { piiEncryptionReady } from "./security/pii.js";
import {
  addEmployeeContract,
  addSalaryTemplateVersion,
  applySalaryTemplate,
  createEmployee,
  createOrgUnit,
  createPosition,
  createProfileChangeRequest,
  createSalaryTemplate,
  ensureHrData,
  exportEmployeesCsv,
  getEmployeeDetail,
  getMyHrProfile,
  queryEmployees,
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
  setOrgUnitStatus,
  updateEmployee,
  updateEmployeeContract,
  updateOrgUnit,
  updatePosition,
  withdrawProfileChangeRequest,
} from "./hr.js";

const PORT = Number.parseInt(process.env.PORT || "4173", 10);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_ROOT = fileURLToPath(new URL("../", import.meta.url));

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

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  });
  res.end(JSON.stringify(payload));
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
const LOGIN_MAX_PER_IP = 3000;
const loginFailBuckets = new Map();
const loginIpBuckets = new Map();

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

function loginUsernameLocked(username) {
  const bucket = loginFailBuckets.get(username);
  if (!bucket) return false;
  if (Date.now() - bucket.windowStart > LOGIN_RATE_WINDOW_MS) return false;
  return bucket.count >= LOGIN_FAIL_MAX_PER_USERNAME;
}

function recordLoginFailure(username) {
  slidingWindowHit(loginFailBuckets, username, LOGIN_RATE_WINDOW_MS);
}

function bearerToken(req) {
  const authorization = req.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

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

  if (allowedRoles.length && !allowedRoles.includes(account.role)) {
    sendError(res, 403, "当前账号无权访问该资源");
    return null;
  }

  return { account, token };
}

function canReadTeacher(account, teacherId) {
  if (["finance", "system_admin"].includes(account.role)) return true;
  return account.role === "teacher" && account.teacherId === teacherId;
}

function teacherIdFromPath(parts) {
  return parts.length >= 3 ? parts[2] : "";
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
    netPay: payroll.netPay || 0,
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
    tax: payroll.tax || 0,
    netPay: payroll.netPay || 0,
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
  if (!payroll?.generated || payroll.generated.status !== "saved") return payroll;
  return {
    ...payroll,
    generated: null,
  };
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

      if (!account || account.status !== "active" || !(await verifyPasswordAsync(password, account.passwordHash))) {
        recordLoginFailure(username);
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
      const body = await readJsonBody(req);
      const notification = createNotification(db, body, auth.account);
      await saveDatabase(db);
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

    if (req.method === "POST" && url.pathname === "/api/terms") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = createAcademicTerm(db, body, auth.account);
      await saveDatabase(db);
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
      const result = setCurrentAcademicTerm(db, decodeURIComponent(parts[2]), auth.account);
      await saveDatabase(db);
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
      const result = archiveAcademicTerm(db, decodeURIComponent(parts[2]), auth.account);
      await saveDatabase(db);
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
      const auth = requireAuth(req, res, db, ["finance", "system_admin"]);
      if (!auth) return;
      sendJson(res, 200, { payrollRules: db.payrollRules });
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/api/payroll-rules") {
      const auth = requireAuth(req, res, db, ["finance", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const payrollRules = updatePayrollRules(db, body.payrollRules || body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, { payrollRules });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/classrooms") {
      const auth = requireAuth(req, res, db, ["admin", "finance", "system_admin", "classroom"]);
      if (!auth) return;
      const termId = url.searchParams.get("termId") || queryTerms(db).currentTerm.id;
      sendJson(res, 200, { rooms: roomsForTerm(db, termId), termId });
      return;
    }

    if (parts[0] === "api" && parts[1] === "classrooms" && parts[3] === "dynamic-qr") {
      if (req.method !== "GET") {
        sendError(res, 405, "接口方法不支持");
        return;
      }
      const roomId = decodeURIComponent(parts[2] || "");
      const displayKey = url.searchParams.get("displayKey") || "";
      sendJson(res, 200, issueClassroomQrToken(db, roomId, displayKey));
      return;
    }

    if (parts[0] === "api" && parts[1] === "classrooms" && parts[3] === "qrcode") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const roomId = decodeURIComponent(parts[2] || "");
      const termId = url.searchParams.get("termId") || queryTerms(db).currentTerm.id;
      const room = roomsForTerm(db, termId).find((item) => item.id === roomId);
      if (!room) {
        sendError(res, 404, "教室不存在");
        return;
      }
      sendJson(res, 200, {
        room,
        classroomUrl: `/classroom.html?roomId=${encodeURIComponent(room.id)}&displayKey=${encodeURIComponent(room.displayKey)}`,
      });
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
      sendJson(res, 200, { assignments: queryTeacherAssignments(db, Object.fromEntries(url.searchParams)) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/scheduling/teacher-assignments") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
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
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const options = Object.fromEntries(url.searchParams);
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
        includeFinance: ["finance", "system_admin"].includes(auth.account.role),
      }));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/personnel") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      sendJson(res, 200, queryPersonnel(db, Object.fromEntries(url.searchParams)));
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

      const teacher = findTeacher(db, teacherId);
      if (!teacher) {
        sendError(res, 404, "教师不存在");
        return;
      }

      if (req.method === "GET" && parts.length === 3) {
        sendJson(res, 200, { teacher: auth.account.role === "teacher" ? teacherIdentityOnly(teacher) : teacher });
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
          teacher: auth.account.role === "teacher" ? teacherIdentityOnly(teacher) : teacher,
          currentTerm: termContext.currentTerm,
          weekStart,
          availableWeeks,
          lessons: teacherLessonsForWeek(db, teacherId, weekStart, { termId: activeTermId }),
        });
        return;
      }

      if (req.method === "GET" && parts[3] === "attendance-records") {
        if (markMissingCheckOutExceptions(db)) {
          await saveDatabase(db);
        }
        const month = url.searchParams.get("month") || "2026-06";
        sendJson(res, 200, queryTeacherAttendanceRecords(db, teacherId, month));
        return;
      }

      if (req.method === "GET" && parts[3] === "workload") {
        if (markMissingCheckOutExceptions(db)) {
          await saveDatabase(db);
        }
        const month = url.searchParams.get("month") || "2026-06";
        const workload = teacherMonthlyWorkload(db, teacherId, month);
        sendJson(
          res,
          200,
          auth.account.role === "teacher" ? teacherWorkloadWithoutSalaryDetails(workload) : workload,
        );
        return;
      }

      if (req.method === "POST" && parts[3] === "workload" && parts[4] === "confirm") {
        if (auth.account.role !== "teacher" || auth.account.teacherId !== teacherId) {
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
        sendJson(res, 200, result);
        return;
      }

      if (req.method === "POST" && parts[3] === "attendance") {
        if (auth.account.role !== "teacher" || auth.account.teacherId !== teacherId) {
          sendError(res, 403, "只能由老师本人提交考勤");
          return;
        }
        const body = await readJsonBody(req);
        try {
          const result = submitTeacherAttendance(db, body, auth.account);
          await saveDatabase(db);
          sendJson(res, 200, result);
        } catch (error) {
          if (error.details?.record) {
            await saveDatabase(db);
          }
          throw error;
        }
        return;
      }

      if (req.method === "PATCH" && parts[3] === "salary-profile") {
        if (!["finance", "system_admin"].includes(auth.account.role)) {
          sendError(res, 403, "只有财务或系统管理员可以维护教师工资档案");
          return;
        }
        const body = await readJsonBody(req);
        const teacher = updateTeacherSalaryProfile(db, teacherId, body.salaryProfile || body, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, { teacher });
        return;
      }

      if (req.method === "GET" && parts[3] === "payroll") {
        if (markMissingCheckOutExceptions(db)) {
          await saveDatabase(db);
        }
        const month = url.searchParams.get("month") || "2026-06";
	        const payroll = teacherPayrollDetail(db, teacherId, month) || teacherPayrollPreview(db, teacherId, month);
	        const visiblePayroll = auth.account.role === "teacher" ? teacherVisiblePayroll(payroll) : payroll;
	        const wantsConfirmationDetail = url.searchParams.get("detail") === "confirmation";
	        sendJson(
	          res,
	          200,
	          auth.account.role === "teacher"
	            ? wantsConfirmationDetail
	              ? teacherPayrollForConfirmation(visiblePayroll)
	              : teacherPayrollSummaryOnly(visiblePayroll)
	            : visiblePayroll,
	        );
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "generate") {
        if (!["finance", "system_admin"].includes(auth.account.role)) {
          sendError(res, 403, "只有财务或系统管理员可以生成薪资明细");
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
        if (!["finance", "system_admin"].includes(auth.account.role)) {
          sendError(res, 403, "只有财务或系统管理员可以复核薪资明细");
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
        if (auth.account.role !== "teacher" || auth.account.teacherId !== teacherId) {
          sendError(res, 403, "只能由老师本人确认工资明细");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        const result = confirmTeacherPayrollDetail(db, teacherId, month, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, teacherPayrollForConfirmation(result));
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "dispute") {
        if (auth.account.role !== "teacher" || auth.account.teacherId !== teacherId) {
          sendError(res, 403, "只能由老师本人提出工资异议");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        const reason = String(body.reason || "").trim();
        const result = disputeTeacherPayrollDetail(db, teacherId, month, reason, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, teacherPayrollForConfirmation(result));
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "lock") {
        if (!["finance", "system_admin"].includes(auth.account.role)) {
          sendError(res, 403, "只有财务或系统管理员可以锁定薪资明细");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        const result = lockTeacherPayrollDetail(db, teacherId, month, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, result);
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "unlock") {
        if (!["finance", "system_admin"].includes(auth.account.role)) {
          sendError(res, 403, "只有财务或系统管理员可以解锁薪资");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        const reason = String(body.reason || "").trim();
        const result = unlockTeacherPayrollDetail(db, teacherId, month, reason, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, result);
        return;
      }
    }

    if (req.method === "POST" && url.pathname === "/api/payroll/batch-generate") {
      const auth = requireAuth(req, res, db, ["finance", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = generatePayrollBatch(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/payroll/batch-lock") {
      const auth = requireAuth(req, res, db, ["finance", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = lockPayrollBatch(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/payroll/export") {
      const auth = requireAuth(req, res, db, ["finance", "system_admin"]);
      if (!auth) return;
      sendJson(res, 200, exportPayrollDetails(db, Object.fromEntries(url.searchParams)));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/payroll/history") {
      const auth = requireAuth(req, res, db, ["finance", "system_admin"]);
      if (!auth) return;
      sendJson(res, 200, queryPayrollHistory(db, Object.fromEntries(url.searchParams)));
      return;
    }

    // ---- 第二阶段：人事管控 /api/hr/* ----

    if (url.pathname.startsWith("/api/hr/")) {
      const hrContext = { clientIp: clientIpFor(req), userAgent: req.headers["user-agent"] || "" };

      if (req.method === "GET" && url.pathname === "/api/hr/org-units") {
        const auth = requireAuth(req, res, db, ["hr", "system_admin", "finance", "admin", "division_head"]);
        if (!auth) return;
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

      const employeeMatch = url.pathname.match(
        /^\/api\/hr\/employees\/([^/]+)(?:\/(status|sensitive-view|contracts))?$/,
      );
      if (employeeMatch) {
        const employeeId = employeeMatch[1];
        const subPath = employeeMatch[2] || "";
        if (req.method === "GET" && !subPath) {
          const auth = requireAuth(req, res, db, ["hr", "system_admin", "division_head"]);
          if (!auth) return;
          const detail = getEmployeeDetail(db, employeeId);
          assertEmployeeInScope(db, auth.account, db.employees.find((item) => item.id === employeeId));
          sendJson(res, 200, detail);
          return;
        }
        const auth = requireAuth(req, res, db, ["hr", "system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        if (req.method === "PATCH" && !subPath) {
          const employee = updateEmployee(db, employeeId, body, auth.account, hrContext);
          await saveDatabase(db);
          sendJson(res, 200, { employee });
          return;
        }
        if (req.method === "POST" && subPath === "status") {
          const employee = setEmployeeStatus(db, employeeId, String(body.status || ""), body.reason, auth.account, hrContext);
          await saveDatabase(db);
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

      if (req.method === "GET" && url.pathname === "/api/hr/salary-templates") {
        const auth = requireAuth(req, res, db, ["hr", "finance", "system_admin"]);
        if (!auth) return;
        // 金额权限：hr 只能看到绑定关系与版本号，payload 只发给财务与总校
        const includePayload = auth.account.role === "finance" || auth.account.role === "system_admin";
        sendJson(res, 200, { templates: querySalaryTemplates(db, { includePayload }) });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/hr/salary-templates") {
        const auth = requireAuth(req, res, db, ["finance", "system_admin"]);
        if (!auth) return;
        const body = await readJsonBody(req);
        const result = createSalaryTemplate(db, body, auth.account, hrContext);
        await saveDatabase(db);
        sendJson(res, 200, result);
        return;
      }

      const templateMatch = url.pathname.match(/^\/api\/hr\/salary-templates\/([^/]+)\/(versions|apply)$/);
      if (templateMatch && req.method === "POST") {
        const auth = requireAuth(req, res, db, ["finance", "system_admin"]);
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
        const auth = requireAuth(req, res, db, ["hr", "system_admin", "division_head"]);
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
        sendJson(res, 200, { flow });
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

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    res.end(content);
  } catch (error) {
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("Not found");
  }
}

export async function createServer() {
  const db = await ensureDatabase();

  // M3：人事审批超时扫描（每小时一次，停留超 3 个工作日提醒；启动即扫一次）
  const runHrTimeoutScan = async () => {
    try {
      const notified = scanHrFlowTimeouts(db);
      db.meta.hrTimeoutScanAt = new Date().toISOString();
      if (notified) await saveDatabase(db);
    } catch (error) {
      console.error("[hr] 审批超时扫描失败:", error.message);
    }
  };
  runHrTimeoutScan();
  setInterval(runHrTimeoutScan, 60 * 60 * 1000).unref();

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
  const server = await createServer();
  server.on("error", (error) => {
    console.error("[server] HTTP 服务错误:", error.message);
    if (error.code === "EADDRINUSE") process.exit(1);
  });
  server.listen(PORT, HOST, () => {
    const solverProbe = checkSolverAvailability();
    console.log(`School system demo running at http://${HOST}:${PORT}/`);
    console.log(`Local URL: http://127.0.0.1:${PORT}/`);
    console.log(`API health: http://127.0.0.1:${PORT}/api/health`);
    console.log(
      solverProbe.available
        ? `[scheduler] OR-Tools CP-SAT 可用（${solverProbe.pythonBin}）`
        : `[scheduler] 警告：${solverProbe.message}，排课将回退内置启发式算法`,
    );
  });
}
