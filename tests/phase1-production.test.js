import assert from "node:assert/strict";
import {
  approveMonthlyWorkload,
  confirmMonthlyWorkload,
  createInitialData,
  createNotification,
  createSession,
  findActiveSession,
  generateTeacherPayrollDetail,
  lockTeacherPayrollDetail,
  markNotificationRead,
  queryNotifications,
  reviewTeacherPayrollDetail,
  revokeSession,
  validatePhase1Readiness,
} from "../server/storage.js";
import { generateScheduleDraft, publishScheduleDraft } from "../server/scheduling.js";

function actor(db, username) {
  const account = db.accounts.find((item) => item.username === username);
  assert.ok(account, `missing account ${username}`);
  return account;
}

function prepareCompletedMonth(db, teacherId, month = "2026-06") {
  const lessons = db.lessonInstances.filter((lesson) => lesson.teacherId === teacherId && lesson.date.startsWith(month));
  assert.ok(lessons.length > 0, "expected seed lessons for teacher");
  lessons.forEach((lesson, index) => {
    lesson.status = "completed";
    lesson.checkInAt = `${lesson.date}T${lesson.time.slice(0, 5)}:00+08:00`;
    lesson.checkOutAt = `${lesson.date}T${lesson.time.slice(6)}:00+08:00`;
    lesson.attendanceNote = `生产验收模拟完成 ${index + 1}`;
  });
}

const db = createInitialData({ teacherCount: 1000 });
const teacher = db.teachers[0];
const teacherAccount = db.accounts.find((account) => account.teacherId === teacher.id);
const admin = actor(db, "admin");
const finance = actor(db, "finance");

assert.equal(db.accounts.filter((account) => account.role === "teacher").length >= 1000, true);

const schedule = generateScheduleDraft(
  db,
  {
    divisionId: "elementary",
    gradeId: "elementary-g1",
  },
  admin,
);
assert.equal(schedule.draft.conflicts.length, 0);
const published = publishScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin);
assert.ok(published.lessons.length > 0);

const token = "phase1-production-session-token";
createSession(db, admin, token, { userAgent: "phase1-test" });
assert.equal(findActiveSession(db, token)?.accountId, admin.id);
assert.equal(revokeSession(db, token, admin), true);
assert.equal(findActiveSession(db, token), null);

const notice = createNotification(
  db,
  {
    audience: "teacher",
    teacherIds: [teacher.id],
    title: "生产验收通知",
    text: "这条通知用于验证后端通知、定向接收和已读回执。",
    level: "warning",
  },
  admin,
);
const teacherNotices = queryNotifications(db, teacherAccount);
assert.equal(teacherNotices.items.some((item) => item.id === notice.id), true);
assert.equal(markNotificationRead(db, notice.id, teacherAccount).read, true);

prepareCompletedMonth(db, teacher.id);
assert.throws(
  () => reviewTeacherPayrollDetail(db, teacher.id, "2026-06", finance),
  /老师确认、教务审批和总校审批/,
);

let workload = confirmMonthlyWorkload(db, teacher.id, "2026-06", teacherAccount);
assert.equal(workload.confirmation.status, "teacher_confirmed");

workload = approveMonthlyWorkload(db, teacher.id, "2026-06", "academic", admin);
assert.equal(workload.confirmation.status, "academic_approved");

workload = approveMonthlyWorkload(db, teacher.id, "2026-06", "school", admin);
assert.equal(workload.confirmation.status, "school_approved");

let payroll = generateTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "generated");

payroll = reviewTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "reviewed");

payroll = lockTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "locked");
assert.equal(payroll.confirmation.status, "locked");

const readiness = validatePhase1Readiness(db);
assert.equal(readiness.passed, true, JSON.stringify(readiness.checks, null, 2));

console.log("phase1 production checks passed");
