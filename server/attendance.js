import crypto from "node:crypto";
import { currentTerm, ensureEditableTerm } from "./terms.js";
import { teacherEligibility } from "./hr.js";

const SECURITY_SECRET = "school-demo-signing-key";
const CHECK_WINDOW_MINUTES = 15;
const DYNAMIC_QR_TTL_SECONDS = 30;
const DYNAMIC_QR_CLOCK_SKEW_SECONDS = 5;

function parseJsonPayload(rawPayload) {
  if (typeof rawPayload === "object" && rawPayload) return rawPayload;
  if (!rawPayload) return null;
  return JSON.parse(String(rawPayload));
}

function signingBase(payload) {
  return [
    payload.app,
    payload.action,
    payload.room,
    payload.roomCode,
    SECURITY_SECRET,
  ].join("|");
}

function dynamicSigningBase(payload) {
  return [
    payload.app,
    payload.type,
    payload.roomId,
    payload.issuedAt,
    payload.expiresAt,
    payload.nonce,
  ].join("|");
}

function signDynamicPayload(payload) {
  return crypto
    .createHmac("sha256", SECURITY_SECRET)
    .update(dynamicSigningBase(payload))
    .digest("hex");
}

function signPayload(payload) {
  const text = signingBase(payload);
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(7, "0");
}

function roomDisplayKey(room) {
  return room.displayKey || `screen-${String(room.id).toLowerCase()}`;
}

export function issueClassroomQrToken(db, roomId, displayKey = "") {
  const room = db.rooms.find((item) => item.id === roomId);
  if (!room || room.active === false) {
    const error = new Error("教室不存在或已停用");
    error.statusCode = 404;
    throw error;
  }

  if (displayKey !== roomDisplayKey(room)) {
    const error = new Error("教室大屏密钥不正确");
    error.statusCode = 403;
    throw error;
  }

  const issuedAt = new Date();
  const expiresAt = addMinutes(issuedAt, DYNAMIC_QR_TTL_SECONDS / 60);
  const payload = {
    app: "school-system",
    type: "classroom-dynamic-qr",
    roomId: room.id,
    roomName: room.name,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    nonce: crypto.randomBytes(8).toString("hex"),
  };

  return {
    room: {
      id: room.id,
      name: room.name,
      stageId: room.stageId,
    },
    ttlSeconds: DYNAMIC_QR_TTL_SECONDS,
    refreshInSeconds: Math.max(DYNAMIC_QR_TTL_SECONDS - 5, 10),
    payload: {
      ...payload,
      signature: signDynamicPayload(payload),
    },
  };
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function lessonWindow(lesson) {
  const [startTime, endTime] = lesson.time.split("-");
  const start = new Date(`${lesson.date}T${startTime}:00+08:00`);
  const end = new Date(`${lesson.date}T${endTime}:00+08:00`);
  return {
    start,
    end,
    checkInStartsAt: addMinutes(start, -CHECK_WINDOW_MINUTES),
    checkInEndsAt: start,
    checkOutStartsAt: end,
    checkOutEndsAt: addMinutes(end, CHECK_WINDOW_MINUTES),
  };
}

function chinaDateTimeKey(date) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`;
}

function normalizeOccurredAt(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    const error = new Error("考勤时间格式错误");
    error.statusCode = 400;
    throw error;
  }
  return date;
}

function lessonRoomName(db, lesson) {
  return lesson.room || db.rooms.find((room) => room.id === lesson.roomId)?.name || lesson.roomId;
}

function pushCheck(checks, label, passed, detail) {
  checks.push({ label, passed, detail });
}

function recordAttendanceAttempt(db, lesson, actorAccount, action, occurredAt, passed, checks, payload) {
  if (!Array.isArray(db.attendanceRecords)) db.attendanceRecords = [];
  const timestamp = chinaDateTimeKey(occurredAt);
  const record = {
    id: `ATT-${Date.now()}-${db.attendanceRecords.length + 1}`,
    lessonId: lesson?.id || "",
    teacherId: actorAccount.teacherId || lesson?.teacherId || "",
    action,
    status: passed ? "accepted" : "rejected",
    occurredAt: timestamp,
    roomId: lesson?.roomId || "",
    room: lesson ? lessonRoomName(db, lesson) : payload?.room || "",
    checks,
    createdByAccountId: actorAccount.id,
    createdAt: new Date().toISOString(),
  };
  db.attendanceRecords.push(record);
  return record;
}

export function markMissingCheckOutExceptions(db, asOf = new Date()) {
  if (!Array.isArray(db.lessonInstances)) return false;
  let changed = false;

  db.lessonInstances
    .filter((lesson) => lesson.status === "checkedIn")
    .forEach((lesson) => {
      const window = lessonWindow(lesson);
      if (asOf <= window.checkOutEndsAt) return;

      lesson.status = "exception";
      lesson.attendanceNote = "只签入未签出，系统自动标记异常，暂不计入薪资";

      const hasRecord = (db.attendanceRecords || []).some(
        (record) => record.lessonId === lesson.id && record.action === "missingCheckOut",
      );
      if (!hasRecord) {
        recordAttendanceAttempt(
          db,
          lesson,
          { id: "SYSTEM", teacherId: lesson.teacherId },
          "missingCheckOut",
          window.checkOutEndsAt,
          false,
          [
            {
              label: "签出完成",
              passed: false,
              detail: "课程已签入但超过签出窗口仍未签出",
            },
          ],
          { roomId: lesson.roomId },
        );
      }
      changed = true;
    });

  if (changed) db.meta.updatedAt = new Date().toISOString();
  return changed;
}

function validateAttendance(db, lesson, actorAccount, action, payload, occurredAt) {
  const checks = [];
  const roomName = lessonRoomName(db, lesson);

  pushCheck(
    checks,
    "账号角色",
    actorAccount.role === "teacher",
    actorAccount.role === "teacher" ? "当前为老师账号" : "只有老师本人可以提交考勤",
  );
  pushCheck(
    checks,
    "本人课时",
    lesson.teacherId === actorAccount.teacherId,
    lesson.teacherId === actorAccount.teacherId ? "课时属于当前老师" : "不能代签其他老师课时",
  );

  const typePassed = payload?.app === "school-system" && payload?.type === "classroom-dynamic-qr";
  pushCheck(checks, "动态二维码类型", typePassed, typePassed ? "属于教室大屏动态考勤码" : "不是本系统动态教室码");

  const signaturePassed = typePassed && Boolean(payload?.signature) && payload.signature === signDynamicPayload(payload);
  pushCheck(checks, "动态码防伪", signaturePassed, signaturePassed ? "后端签名匹配" : "签名不匹配或缺失");

  const issuedAt = payload?.issuedAt ? new Date(payload.issuedAt) : null;
  const expiresAt = payload?.expiresAt ? new Date(payload.expiresAt) : null;
  const serverNow = new Date();
  const freshnessPassed =
    typePassed &&
    issuedAt &&
    expiresAt &&
    !Number.isNaN(issuedAt.getTime()) &&
    !Number.isNaN(expiresAt.getTime()) &&
    issuedAt.getTime() <= serverNow.getTime() + DYNAMIC_QR_CLOCK_SKEW_SECONDS * 1000 &&
    expiresAt.getTime() >= serverNow.getTime() - DYNAMIC_QR_CLOCK_SKEW_SECONDS * 1000;
  pushCheck(
    checks,
    "动态码有效期",
    freshnessPassed,
    freshnessPassed ? "二维码仍在有效期内" : "二维码已过期或时间异常",
  );

  const roomPassed = payload?.roomId === lesson.roomId;
  pushCheck(checks, "指定教室", roomPassed, roomPassed ? `匹配 ${roomName}` : "扫码教室与课表教室不一致");

  const window = lessonWindow(lesson);
  const timePassed =
    action === "checkOut"
      ? occurredAt >= window.checkOutStartsAt && occurredAt <= window.checkOutEndsAt
      : occurredAt >= window.checkInStartsAt && occurredAt <= window.checkInEndsAt;
  pushCheck(
    checks,
    action === "checkOut" ? "签出时间窗口" : "签入时间窗口",
    timePassed,
    timePassed ? "当前时间命中课表窗口" : "当前时间不在允许窗口内",
  );

  const statusPassed =
    action === "checkOut"
      ? lesson.status === "checkedIn"
      : (lesson.status === "scheduled" || lesson.status === "pending") && !lesson.checkInAt;
  pushCheck(
    checks,
    "重复计薪拦截",
    statusPassed,
    statusPassed ? "课时状态允许本次操作" : "课时已处理或尚不满足本次操作条件",
  );

  return {
    checks,
    passed: checks.every((check) => check.passed),
  };
}

export function submitTeacherAttendance(db, options = {}, actorAccount = null) {
  if (!actorAccount?.teacherId) {
    const error = new Error("只有老师账号可以提交考勤");
    error.statusCode = 403;
    throw error;
  }

  // 人事联动（PRD 4.5）：已离职/停用/待入职人员不能产生签到记录
  if (!teacherEligibility(db, actorAccount.teacherId).canAttend) {
    const error = new Error("当前人事状态不允许签到，请联系人事专员");
    error.statusCode = 403;
    throw error;
  }

  const lessonId = String(options.lessonId || "").replace(/^API-/, "");
  const action = String(options.action || "checkIn");
  if (!["checkIn", "checkOut"].includes(action)) {
    const error = new Error("考勤动作不正确");
    error.statusCode = 400;
    throw error;
  }

  const lesson = db.lessonInstances.find((item) => item.id === lessonId);
  if (!lesson) {
    const error = new Error("课次不存在");
    error.statusCode = 404;
    throw error;
  }

  // 归档学期只读：历史学期的课次不允许再产生签到/签出，避免污染已结算数据
  const lessonTerm = lesson.termId ? (db.terms || []).find((term) => term.id === lesson.termId) : null;
  ensureEditableTerm(lessonTerm || currentTerm(db), "提交签到签出");

  let payload = null;
  try {
    payload = parseJsonPayload(options.qrPayload);
  } catch (error) {
    const occurredAt = normalizeOccurredAt(options.occurredAt);
    const checks = [{ label: "二维码格式", passed: false, detail: "二维码内容不是合法 JSON" }];
    const record = recordAttendanceAttempt(db, lesson, actorAccount, action, occurredAt, false, checks, payload);
    const responseError = new Error("二维码格式错误");
    responseError.statusCode = 400;
    responseError.details = { checks, record };
    throw responseError;
  }

  const occurredAt = normalizeOccurredAt(options.occurredAt);
  const validation = validateAttendance(db, lesson, actorAccount, action, payload, occurredAt);
  const record = recordAttendanceAttempt(
    db,
    lesson,
    actorAccount,
    action,
    occurredAt,
    validation.passed,
    validation.checks,
    payload,
  );

  if (!validation.passed) {
    const error = new Error("课程考勤被防作弊规则拦截");
    error.statusCode = 400;
    error.details = { checks: validation.checks, record };
    throw error;
  }

  const occurredAtText = chinaDateTimeKey(occurredAt);
  if (action === "checkIn") {
    lesson.status = "checkedIn";
    lesson.checkInAt = occurredAtText;
    lesson.attendanceNote = "已完成课前签入，待下课后签出";
  } else {
    lesson.status = "completed";
    lesson.checkOutAt = occurredAtText;
    lesson.attendanceNote = "签入签出完成，计入本月薪资";
  }

  db.meta.updatedAt = new Date().toISOString();
  return {
    lesson: {
      ...lesson,
      room: lessonRoomName(db, lesson),
    },
    record,
    checks: validation.checks,
  };
}
