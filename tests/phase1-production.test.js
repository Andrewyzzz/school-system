import assert from "node:assert/strict";
import {
  approveMonthlyWorkload,
  confirmMonthlyWorkload,
  createInitialData,
  createNotification,
  createSession,
  exportPayrollDetails,
  findActiveSession,
  generateTeacherPayrollDetail,
  lockTeacherPayrollDetail,
  markNotificationRead,
  publicAccount,
  queryNotifications,
  reviewTeacherPayrollDetail,
  revokeSession,
  unlockTeacherPayrollDetail,
  updateTeacherAssignment,
  updateTeacherSalaryProfile,
  validatePhase1Readiness,
} from "../server/storage.js";
import {
  adjustScheduleAssignment,
  generateScheduleDraft,
  listScheduleVersions,
  publishScheduleDraft,
  regenerateUnlockedScheduleAssignments,
  rollbackScheduleVersion,
  updateGradeClassStructure,
  updateGradeCourseRules,
} from "../server/scheduling.js";

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
const teacherPublicAccount = publicAccount(teacherAccount, db);
assert.equal("salaryProfile" in teacherPublicAccount.teacher, false);

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
assert.notEqual(schedule.draft.precheck.status, "blocked");
assert.ok(schedule.draft.precheck.checks.length >= 1);
assert.ok(
  schedule.draft.assignments.filter((assignment) => assignment.subjectId === "pe").every((assignment) => assignment.roomType === "playground"),
  "体育课应排到操场",
);
assert.ok(
  schedule.draft.assignments
    .filter((assignment) => assignment.subjectId === "physics" || assignment.subjectId === "chemistry")
    .every((assignment) => assignment.roomType === "lab"),
  "物理/化学应排到实验室",
);
if (schedule.draft.solver.algorithm === "ortools-cp-sat") {
  assert.ok(schedule.draft.solver.phase1Status, "CP-SAT 应返回硬约束阶段状态");
  assert.ok(schedule.draft.solver.phase === "optimized" || schedule.draft.solver.phase === "feasible_only");
}
const peAssignment = schedule.draft.assignments.find((assignment) => assignment.subjectId === "pe");
const homeroom = schedule.config.rooms.find((room) => room.roomType === "homeroom");
assert.ok(peAssignment && homeroom, "expected PE assignment and homeroom");
assert.throws(
  () =>
    adjustScheduleAssignment(
      db,
      {
        divisionId: "elementary",
        gradeId: "elementary-g1",
        assignmentId: peAssignment.id,
        teacherId: peAssignment.teacherId,
        date: peAssignment.date,
        period: peAssignment.period,
        roomId: homeroom.id,
      },
      admin,
    ),
  /教室类型不匹配|需要操场/,
);

const targetReplanClassId = peAssignment.classId;
const outsideClassBefore = new Map(
  schedule.draft.assignments
    .filter((assignment) => assignment.classId !== targetReplanClassId)
    .map((assignment) => [
      assignment.id,
      `${assignment.date}|${assignment.period}|${assignment.teacherId}|${assignment.roomId}|${Boolean(assignment.locked)}`,
    ]),
);
const scopedReplan = regenerateUnlockedScheduleAssignments(
  db,
  {
    divisionId: "elementary",
    gradeId: "elementary-g1",
    replanScope: { classId: targetReplanClassId },
  },
  admin,
);
assert.equal(scopedReplan.draft.conflicts.length, 0);
assert.equal(scopedReplan.draft.replanScope.classId, targetReplanClassId);
assert.ok(scopedReplan.draft.replannedScopeCount > 0);
outsideClassBefore.forEach((signature, assignmentId) => {
  const after = scopedReplan.draft.assignments.find((assignment) => assignment.id === assignmentId);
  assert.ok(after, `outside-scope assignment should remain: ${assignmentId}`);
  assert.equal(
    `${after.date}|${after.period}|${after.teacherId}|${after.roomId}|${Boolean(after.locked)}`,
    signature,
    "局部重排不能移动范围外课节，也不能把临时保留污染为锁定",
  );
});

const impossibleDb = createInitialData({ teacherCount: 1000 });
const impossibleAdmin = actor(impossibleDb, "admin");
updateGradeClassStructure(
  impossibleDb,
  {
    stageId: "primary",
    grade: 1,
    regularCount: 8,
    experimentalCount: 2,
  },
  impossibleAdmin,
);
configureClassTeachers(impossibleDb, { stageId: "primary", grade: 1 }, impossibleAdmin);
updateGradeCourseRules(
  impossibleDb,
  {
    stageId: "primary",
    grade: 1,
    rules: [{ subjectId: "pe", enabled: true, weeklyLessons: 6, maxPerClassPerDay: 1 }],
  },
  impossibleAdmin,
);
assert.throws(
  () =>
    generateScheduleDraft(
      impossibleDb,
      {
        divisionId: "elementary",
        gradeId: "elementary-g1",
      },
      impossibleAdmin,
    ),
  /排课前预检未通过/,
);
const draftToProtect = db.scheduleDrafts.find(
  (draft) => draft.divisionId === "elementary" && draft.gradeId === "elementary-g1",
);
assert.ok(draftToProtect, "expected schedule draft");
const originalAssignments = draftToProtect.assignments.slice();
const originalGeneratedCount = draftToProtect.generatedLessonCount;
const originalUnassignedCount = draftToProtect.unassignedCount;
draftToProtect.assignments = draftToProtect.assignments.slice(0, -1);
draftToProtect.generatedLessonCount = draftToProtect.assignments.length;
draftToProtect.unassignedCount = 1;
assert.throws(
  () => publishScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin),
  /未排完/,
);
draftToProtect.assignments = originalAssignments;
draftToProtect.generatedLessonCount = originalGeneratedCount;
draftToProtect.unassignedCount = originalUnassignedCount;
const published = publishScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin);
assert.ok(published.lessons.length > 0);
assert.ok(published.version?.id, "发布后应生成正式版本快照");
assert.ok(published.lessons.every((lesson) => lesson.scheduleVersionId === published.version.id));
assert.ok(
  published.lessons.filter((lesson) => lesson.subjectId === "pe").every((lesson) => lesson.roomType === "playground"),
  "发布后的体育课应保留操场类型",
);
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
const firstPublishedVersionId = published.version.id;
generateScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin);
const secondPublished = publishScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin);
assert.equal(listScheduleVersions(db, { divisionId: "elementary", gradeId: "elementary-g1" }).length, 2);
assert.ok(secondPublished.versions.find((version) => version.id === secondPublished.version.id && version.current));
const rolledBack = rollbackScheduleVersion(
  db,
  { divisionId: "elementary", gradeId: "elementary-g1", versionId: firstPublishedVersionId },
  admin,
);
assert.equal(rolledBack.version.id, firstPublishedVersionId);
assert.ok(rolledBack.versions.find((version) => version.id === firstPublishedVersionId && version.current));
assert.ok(
  db.lessonInstances
    .filter((lesson) => lesson.source === "backend-scheduling" && lesson.divisionId === "elementary" && lesson.gradeId === "elementary-g1")
    .every((lesson) => lesson.scheduleVersionId === firstPublishedVersionId),
  "回滚后老师端课表、签到和薪资数据源应切换到目标版本",
);

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
assert.equal(payroll.salarySchemeVersion, "fuyuan-dedicated-teacher-2026-v1");
assert.ok(payroll.rows.some((row) => row.name === "考核工资"), "expected assessment salary row");
assert.ok(payroll.rows.some((row) => row.name === "校龄工资"), "expected seniority salary row");
assert.ok(payroll.rows.some((row) => row.name === "住房补贴"), "expected housing allowance row");
assert.ok(payroll.rows.some((row) => row.name === "课时工资"), "expected lesson salary row");
assert.ok(
  payroll.rows.find((row) => row.name === "课时工资")?.basis.includes("实际完成课次"),
  "lesson salary should use actual completed lessons",
);
assert.ok(payroll.lines.every((line) => line.basis), "expected every lesson line to explain basis");

payroll = reviewTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "reviewed");

payroll = lockTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "locked");
assert.equal(payroll.confirmation.status, "locked");
assert.throws(
  () => generateTeacherPayrollDetail(db, teacher.id, "2026-06", finance),
  /本月薪资已锁定/,
);

payroll = unlockTeacherPayrollDetail(db, teacher.id, "2026-06", "生产验收：更正教师工资档案", finance);
assert.equal(payroll.generated.status, "generated");
assert.equal(payroll.confirmation.status, "school_approved");
assert.ok(payroll.generated.unlockHistory.length >= 1);

const profileUpdate = updateTeacherSalaryProfile(
  db,
  teacher.id,
  {
    schoolYears: 6,
    roles: {
      homeroom: true,
      homeroomStudentCount: 40,
    },
    manualItems: [
      {
        name: "测试补充项",
        amount: 100,
        basis: "生产验收补充项",
        category: "supplement",
      },
    ],
  },
  finance,
);
assert.equal(profileUpdate.invalidatedPayrollCount, 1);

payroll = generateTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "generated");
assert.ok(payroll.rows.some((row) => row.name === "班主任津贴"), "expected updated salary profile to affect payroll");
assert.ok(payroll.rows.some((row) => row.name === "测试补充项"), "expected manual salary item to affect payroll");

payroll = reviewTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "reviewed");

payroll = lockTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "locked");
assert.equal(payroll.confirmation.status, "locked");

const exportResult = exportPayrollDetails(db, { month: "2026-06" });
assert.ok(exportResult.content.includes("规则版本"));
assert.ok(exportResult.content.includes("考核工资"));
assert.ok(exportResult.content.includes("测试补充项"));

const readiness = validatePhase1Readiness(db);
assert.equal(readiness.passed, true, JSON.stringify(readiness.checks, null, 2));

console.log("phase1 production checks passed");
