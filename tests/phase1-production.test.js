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
  updateTeacherAssignment,
  validatePhase1Readiness,
} from "../server/storage.js";
import { generateScheduleDraft, publishScheduleDraft, updateGradeClassStructure } from "../server/scheduling.js";

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

function configureClassTeachers(db, { stageId, grade }, actorAccount) {
  const activeClasses = db.classes.filter(
    (schoolClass) => schoolClass.stageId === stageId && Number(schoolClass.grade) === Number(grade) && schoolClass.active,
  );
  db.subjects.forEach((subject) => {
    const teachers = db.teachers.filter(
      (item) => item.status === "active" && item.stageId === stageId && item.primarySubjectId === subject.id,
    );
    if (!teachers.length) return;
    const classTeacherIds = Object.fromEntries(
      activeClasses.map((schoolClass, index) => [schoolClass.id, [teachers[index % teachers.length].id]]),
    );
    updateTeacherAssignment(
      db,
      {
        stageId,
        grade,
        subjectId: subject.id,
        classTeacherIds,
      },
      actorAccount,
    );
  });
}

const db = createInitialData({ teacherCount: 1000 });
const teacher = db.teachers[0];
const teacherAccount = db.accounts.find((account) => account.teacherId === teacher.id);
const admin = actor(db, "admin");
const finance = actor(db, "finance");

assert.equal(db.accounts.filter((account) => account.role === "teacher").length >= 1000, true);

const classStructureResult = updateGradeClassStructure(
  db,
  {
    stageId: "primary",
    grade: 1,
    regularCount: 8,
    experimentalCount: 2,
  },
  admin,
);
assert.equal(classStructureResult.config.classStructure.regularCount, 8);
assert.equal(classStructureResult.config.classStructure.experimentalCount, 2);
assert.equal(classStructureResult.config.classes.length, 10);
assert.equal(
  classStructureResult.config.classes.filter((schoolClass) => schoolClass.classType === "experimental").length,
  2,
);

assert.throws(
  () =>
    generateScheduleDraft(
      db,
      {
        divisionId: "elementary",
        gradeId: "elementary-g1",
      },
      admin,
    ),
  /请先补齐任课老师配置/,
);

configureClassTeachers(db, { stageId: "primary", grade: 1 }, admin);

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
const peLessonsByClassDay = new Map();
published.lessons
  .filter((lesson) => lesson.subjectId === "pe")
  .forEach((lesson) => {
    const key = `${lesson.classId}:${lesson.date}`;
    peLessonsByClassDay.set(key, (peLessonsByClassDay.get(key) || 0) + 1);
  });
peLessonsByClassDay.forEach((count) => {
  assert.ok(count <= 1, "体育课应满足每班每天最多 1 节");
});

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
