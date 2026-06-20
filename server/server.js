import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { issueClassroomQrToken, markMissingCheckOutExceptions, submitTeacherAttendance } from "./attendance.js";
import { createToken, verifyPassword } from "./auth.js";
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
  updateGradeClassStructure,
  updateGradeCourseRules,
  updateTeacherScheduleRule,
} from "./scheduling.js";
import {
  confirmMonthlyWorkload,
  approveMonthlyWorkload,
  changeOwnPassword,
  createNotification,
  createSession,
  ensureDatabase,
  exportPayrollDetails,
  findActiveSession,
  findAccountByUsername,
  findTeacher,
  generatePayrollBatch,
  generateTeacherPayrollDetail,
  lockTeacherPayrollDetail,
  markNotificationRead,
  publicAccount,
  queryNotifications,
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
} from "./storage.js";

const PORT = Number.parseInt(process.env.PORT || "4173", 10);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_ROOT = fileURLToPath(new URL("../", import.meta.url));

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

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf-8");
  return JSON.parse(raw);
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
  if (["admin", "finance", "system_admin"].includes(account.role)) return true;
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
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readJsonBody(req);
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      const account = findAccountByUsername(db, username);

      if (!account || account.status !== "active" || !verifyPassword(password, account.passwordHash)) {
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
      const auth = requireAuth(req, res, db, ["admin", "finance", "system_admin"]);
      if (!auth) return;
      sendJson(res, 200, { payrollRules: db.payrollRules });
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/api/payroll-rules") {
      const auth = requireAuth(req, res, db, ["admin", "finance", "system_admin"]);
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
      sendJson(res, 200, { rooms: db.rooms });
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
      const room = db.rooms.find((item) => item.id === roomId);
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
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
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
      const result = deleteScheduleConstraint(db, { constraintId: decodeURIComponent(parts[3]) }, auth.account);
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

    if (req.method === "POST" && url.pathname === "/api/scheduling/generate") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
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
      sendJson(res, 200, queryTeachers(db, Object.fromEntries(url.searchParams)));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/personnel") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      sendJson(res, 200, queryPersonnel(db, Object.fromEntries(url.searchParams)));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/teachers/import/preview") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const csvText = String(body.csvText || "");
      sendJson(res, 200, previewTeacherImport(db, csvText));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/teachers/import/commit") {
      const auth = requireAuth(req, res, db, ["admin", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const csvText = String(body.csvText || "");
      const result = commitTeacherImport(db, csvText, auth.account);
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
            : availableWeeks[0]?.weekStart || "2026-06-15";
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
        sendJson(res, 200, auth.account.role === "teacher" ? teacherPayrollSummaryOnly(payroll) : payroll);
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "generate") {
        if (!["admin", "finance", "system_admin"].includes(auth.account.role)) {
          sendError(res, 403, "只有财务或管理账号可以生成薪资明细");
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
        if (!["admin", "finance", "system_admin"].includes(auth.account.role)) {
          sendError(res, 403, "只有财务或管理账号可以复核薪资明细");
          return;
        }
        const body = await readJsonBody(req);
        const month = String(body.month || url.searchParams.get("month") || "2026-06");
        const result = reviewTeacherPayrollDetail(db, teacherId, month, auth.account);
        await saveDatabase(db);
        sendJson(res, 200, result);
        return;
      }

      if (req.method === "POST" && parts[3] === "payroll" && parts[4] === "lock") {
        if (!["admin", "finance", "system_admin"].includes(auth.account.role)) {
          sendError(res, 403, "只有财务或管理账号可以锁定薪资明细");
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
      const auth = requireAuth(req, res, db, ["admin", "finance", "system_admin"]);
      if (!auth) return;
      const body = await readJsonBody(req);
      const result = generatePayrollBatch(db, body, auth.account);
      await saveDatabase(db);
      sendJson(res, 200, result);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/payroll/export") {
      const auth = requireAuth(req, res, db, ["admin", "finance", "system_admin"]);
      if (!auth) return;
      sendJson(res, 200, exportPayrollDetails(db, Object.fromEntries(url.searchParams)));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/phase1/readiness") {
      const auth = requireAuth(req, res, db, ["admin", "finance", "system_admin"]);
      if (!auth) return;
      sendJson(res, 200, validatePhase1Readiness(db));
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
  server.listen(PORT, HOST, () => {
    console.log(`School system demo running at http://${HOST}:${PORT}/`);
    console.log(`Local URL: http://127.0.0.1:${PORT}/`);
    console.log(`API health: http://127.0.0.1:${PORT}/api/health`);
  });
}
