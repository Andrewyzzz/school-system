import assert from "node:assert/strict";
import {
  approveMonthlyWorkload,
  archiveAcademicTerm,
  confirmMonthlyWorkload,
  createAcademicTerm,
  createInitialData,
  createNotification,
  createSession,
  deleteAcademicTerm,
  exportPayrollDetails,
  findActiveSession,
  generateTeacherPayrollDetail,
  confirmTeacherPayrollDetail,
  lockTeacherPayrollDetail,
  markNotificationRead,
  publicAccount,
  publishTeacherPayrollDetail,
  queryTerms,
  queryNotifications,
  reviewTeacherPayrollDetail,
  revokeSession,
  setCurrentAcademicTerm,
  teacherLessonsForWeek,
  teacherScheduleWeeks,
  unlockTeacherPayrollDetail,
  updateTeacherAssignment,
  updateTeacherSalaryProfile,
  validatePhase1Readiness,
} from "../server/storage.js";
import {
  approveScheduleChangeRequest,
  adjustScheduleAssignment,
  buildSchedulingConfig,
  createScheduleChangeRequest,
  generateScheduleDraft,
  listScheduleVersions,
  publishScheduleDraft,
  previewSchedulePrecheck,
  regenerateUnlockedScheduleAssignments,
  rollbackScheduleVersion,
  updateGradeClassStructure,
  updateGradeCourseRules,
  updateRoomResources,
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

function schedulingScopeForStageGrade(stageId, grade) {
  const divisionId = stageId === "primary" ? "elementary" : stageId;
  const gradeId =
    stageId === "primary"
      ? `elementary-g${grade}`
      : stageId === "middle"
        ? `middle-g${Number(grade) - 6}`
        : `high-g${Number(grade) - 9}`;
  return { divisionId, gradeId };
}

function configureClassTeachers(db, { stageId, grade, termId = "" }, actorAccount) {
  const { divisionId, gradeId } = schedulingScopeForStageGrade(stageId, grade);
  const activeClasses = buildSchedulingConfig(db, { termId, divisionId, gradeId }).classes;
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

function addDays(dateKey, offset) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return date.toISOString().slice(0, 10);
}

function maxConsecutiveRun(periods = []) {
  const sorted = [...new Set(periods.map(Number).filter(Number.isFinite))].sort((a, b) => a - b);
  let current = 0;
  let best = 0;
  let previous = null;
  sorted.forEach((period) => {
    current = previous !== null && period === previous + 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = period;
  });
  return best;
}

function createFirstValidChangeRequest(db, config, lessons, actorAccount, reason) {
  const weekDates = Array.from({ length: 5 }, (_, index) => addDays(config.weekStart, index));
  const periods = config.periods || [];
  const rooms = config.rooms || [];
  for (const lesson of lessons) {
    const candidateRooms = [
      ...rooms.filter((room) => room.id === lesson.roomId),
      ...rooms.filter((room) => room.id !== lesson.roomId && room.roomType === lesson.roomType),
    ];
    for (const date of weekDates) {
      for (const period of periods) {
        if (date === lesson.date && Number(period.period) === Number(lesson.period)) continue;
        for (const room of candidateRooms) {
          try {
            const result = createScheduleChangeRequest(
              db,
              {
                divisionId: lesson.divisionId,
                gradeId: lesson.gradeId,
                assignmentId: lesson.scheduleAssignmentId,
                teacherId: lesson.teacherId,
                date,
                period: period.period,
                roomId: room.id,
                reason,
              },
              actorAccount,
            );
            return { lesson, result };
          } catch {
            // 该组合不满足生产校验（冲突/硬约束/课程分布规则），继续尝试下一个组合
          }
        }
      }
    }
  }
  return null;
}

const db = createInitialData({ teacherCount: 1000 });
const teacher = db.teachers[0];
const teacherAccount = db.accounts.find((account) => account.teacherId === teacher.id);
const admin = actor(db, "admin");
const finance = actor(db, "finance");
const termContext = queryTerms(db);
assert.equal(termContext.currentTerm.id, "TERM-2026-PHASE1");
assert.equal(termContext.currentTerm.current, true);

const termDb = createInitialData({ teacherCount: 1000 });
const termAdmin = actor(termDb, "admin");
const wrongTermDb = createInitialData({ teacherCount: 1000 });
const wrongTermAdmin = actor(wrongTermDb, "admin");
const wrongTerm = createAcademicTerm(
  wrongTermDb,
  {
    name: "误建学期",
    schoolYear: "2026-2027",
    semester: "测试学期",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    copyConfig: true,
  },
  wrongTermAdmin,
).term;
assert.ok(wrongTermDb.classes.some((schoolClass) => schoolClass.termId === wrongTerm.id));
const deletedWrongTermResult = deleteAcademicTerm(wrongTermDb, wrongTerm.id, wrongTermAdmin);
assert.equal(deletedWrongTermResult.terms.some((term) => term.id === wrongTerm.id), false);
assert.equal(wrongTermDb.classes.some((schoolClass) => schoolClass.termId === wrongTerm.id), false);

const usedTermDb = createInitialData({ teacherCount: 1000 });
const usedTermAdmin = actor(usedTermDb, "admin");
const usedTerm = createAcademicTerm(
  usedTermDb,
  {
    name: "已有业务数据学期",
    schoolYear: "2026-2027",
    semester: "测试学期",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    copyConfig: false,
  },
  usedTermAdmin,
).term;
usedTermDb.scheduleDrafts.push({
  id: "DRAFT-USED-TERM",
  termId: usedTerm.id,
  termName: usedTerm.name,
  assignments: [],
});
assert.throws(() => deleteAcademicTerm(usedTermDb, usedTerm.id, usedTermAdmin), /不能删除/);

const createdTermResult = createAcademicTerm(
  termDb,
  {
    name: "2026-2027 学年上学期",
    schoolYear: "2026-2027",
    semester: "上学期",
    startDate: "2026-09-01",
    endDate: "2027-01-20",
    copyConfig: true,
  },
  termAdmin,
);
assert.equal(createdTermResult.term.status, "planned");
assert.ok(createdTermResult.term.copiedConfigSummary, "新学期应记录复制配置摘要");
const switchedTermResult = setCurrentAcademicTerm(termDb, createdTermResult.term.id, termAdmin);
assert.equal(switchedTermResult.currentTerm.id, createdTermResult.term.id);
const oldTermConfigBefore = buildSchedulingConfig(termDb, {
  termId: "TERM-2026-PHASE1",
  divisionId: "elementary",
  gradeId: "elementary-g1",
});
const newTermConfigBefore = buildSchedulingConfig(termDb, {
  termId: createdTermResult.term.id,
  divisionId: "elementary",
  gradeId: "elementary-g1",
});
assert.equal(oldTermConfigBefore.classCount, 10);
assert.equal(newTermConfigBefore.classCount, 10);
updateGradeClassStructure(
  termDb,
  {
    termId: createdTermResult.term.id,
    stageId: "primary",
    grade: 1,
    regularCount: 6,
    experimentalCount: 1,
  },
  termAdmin,
);
const newTermClassConfig = buildSchedulingConfig(termDb, {
  termId: createdTermResult.term.id,
  divisionId: "elementary",
  gradeId: "elementary-g1",
});
const oldTermClassConfig = buildSchedulingConfig(termDb, {
  termId: "TERM-2026-PHASE1",
  divisionId: "elementary",
  gradeId: "elementary-g1",
});
assert.equal(newTermClassConfig.classCount, 7);
assert.equal(oldTermClassConfig.classCount, 10);
updateGradeCourseRules(
  termDb,
  {
    termId: createdTermResult.term.id,
    stageId: "primary",
    grade: 1,
    rules: newTermClassConfig.courseRules.map((rule) => ({
      ...rule,
      weeklyLessons: rule.subjectId === "pe" ? 1 : rule.weeklyLessons,
    })),
  },
  termAdmin,
);
assert.equal(
  buildSchedulingConfig(termDb, {
    termId: createdTermResult.term.id,
    divisionId: "elementary",
    gradeId: "elementary-g1",
  }).courseRules.find((rule) => rule.subjectId === "pe")?.weeklyLessons,
  1,
);
assert.equal(
  buildSchedulingConfig(termDb, {
    termId: "TERM-2026-PHASE1",
    divisionId: "elementary",
    gradeId: "elementary-g1",
  }).courseRules.find((rule) => rule.subjectId === "pe")?.weeklyLessons,
  2,
);
const archivedTermResult = archiveAcademicTerm(termDb, "TERM-2026-PHASE1", termAdmin);
assert.equal(archivedTermResult.terms.find((term) => term.id === "TERM-2026-PHASE1")?.status, "archived");
assert.throws(
  () =>
    generateScheduleDraft(
      termDb,
      {
        termId: "TERM-2026-PHASE1",
        divisionId: "elementary",
        gradeId: "elementary-g1",
      },
      termAdmin,
    ),
  /已归档/,
);

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
    classRoomCatalog: [
      { classType: "regular", index: 1, roomName: "小学一楼A101" },
      { classType: "regular", index: 2, roomName: "小学一楼A102" },
      { classType: "experimental", index: 1, roomName: "小学实验班教室E01" },
    ],
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
assert.equal(classStructureResult.config.classes.find((schoolClass) => schoolClass.name === "一年级 1 班")?.room, "小学一楼A101");
assert.equal(
  classStructureResult.config.classes.find((schoolClass) => schoolClass.name === "一年级实验1班")?.room,
  "小学实验班教室E01",
);
const roomResourceResult = updateRoomResources(
  db,
  {
    stageId: "primary",
    grade: 1,
    roomCounts: {
      lab: 3,
      computer: 2,
      playground: 1,
      art: 0,
      music: 1,
    },
    roomCatalog: [
      { roomType: "lab", name: "物理实验室A" },
      { roomType: "lab", name: "化学实验室B" },
      { roomType: "lab", name: "综合实验室C" },
      { roomType: "computer", name: "信息机房1" },
      { roomType: "computer", name: "信息机房2" },
      { roomType: "playground", name: "东操场" },
      { roomType: "music", name: "音乐教室" },
    ],
  },
  admin,
);
assert.equal(roomResourceResult.config.roomResourceCounts.lab, 3);
assert.equal(roomResourceResult.config.roomResourceCounts.computer, 2);
assert.equal(roomResourceResult.config.roomResourceCounts.art, 0);
assert.equal(roomResourceResult.config.rooms.filter((room) => room.roomType === "lab").length, 3);
assert.equal(roomResourceResult.config.rooms.filter((room) => room.roomType === "homeroom").length, 10);
assert.ok(roomResourceResult.config.rooms.some((room) => room.roomType === "lab" && room.name === "物理实验室A"));
assert.ok(roomResourceResult.config.rooms.some((room) => room.roomType === "computer" && room.name === "信息机房2"));
assert.ok(roomResourceResult.config.rooms.some((room) => room.roomType === "playground" && room.name === "东操场"));

const dynamicRoomDb = createInitialData({ teacherCount: 1000 });
const dynamicRoomResult = updateRoomResources(
  dynamicRoomDb,
  {
    stageId: "primary",
    grade: 1,
    roomResourceTypes: [
      { type: "lab", name: "实验室", unit: "间", max: 20 },
      { type: "dance-room", name: "舞蹈房", unit: "间", max: 5 },
    ],
    roomCounts: {
      lab: 2,
      "dance-room": 1,
    },
    roomCatalog: [
      { roomType: "lab", name: "物理实验室A" },
      { roomType: "lab", name: "化学实验室B" },
      { roomType: "dance-room", name: "舞蹈房A", roomTypeName: "舞蹈房" },
    ],
  },
  actor(dynamicRoomDb, "admin"),
);
assert.ok(dynamicRoomResult.config.roomResourceTypes.some((resource) => resource.type === "dance-room" && resource.name === "舞蹈房"));
assert.equal(dynamicRoomResult.config.roomResourceTypes.some((resource) => resource.type === "music"), false);
assert.equal(dynamicRoomResult.config.roomResourceCounts["dance-room"], 1);
assert.ok(dynamicRoomResult.config.rooms.some((room) => room.roomType === "dance-room" && room.name === "舞蹈房A"));

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

const missingTeacherPrecheck = previewSchedulePrecheck(db, {
  divisionId: "elementary",
  gradeId: "elementary-g1",
}).precheck;
assert.equal(missingTeacherPrecheck.status, "blocked");
assert.ok(
  missingTeacherPrecheck.checks.some((check) => check.key === "class_subject_teacher_missing"),
  "预检应提前提示班级任课老师未配置",
);

configureClassTeachers(db, { stageId: "primary", grade: 1 }, admin);
const primaryGradeConfig = buildSchedulingConfig(db, { divisionId: "elementary", gradeId: "elementary-g1" });
updateGradeCourseRules(
  db,
  {
    stageId: "primary",
    grade: 1,
    rules: primaryGradeConfig.courseRules.map((rule) => ({
      ...rule,
      ...(rule.subjectId === "chinese"
        ? {
            minPerClassPerDay: 1,
            maxPerClassPerDay: 1,
            minWeeklyDays: 5,
            maxConsecutivePerClass: 1,
            allowConsecutive: false,
          }
        : {}),
      ...(rule.subjectId === "math"
        ? {
            maxPerClassPerDay: 2,
            maxConsecutivePerClass: 2,
            allowConsecutive: true,
          }
        : {}),
      ...(rule.subjectId === "pe"
        ? {
            maxPerClassPerDay: 1,
            maxConsecutivePerClass: 1,
            allowConsecutive: false,
          }
        : {}),
    })),
  },
  admin,
);

const schedule = generateScheduleDraft(
  db,
  {
    divisionId: "elementary",
    gradeId: "elementary-g1",
  },
  admin,
);
assert.equal(schedule.config.termId, termContext.currentTerm.id);
assert.equal(schedule.draft.termId, termContext.currentTerm.id);
assert.equal(schedule.draft.conflicts.length, 0);
assert.notEqual(schedule.draft.precheck.status, "blocked");
assert.ok(schedule.draft.precheck.checks.length >= 1);
const scheduledChineseRule = schedule.config.subjects.find((subject) => (subject.id || subject.subjectId) === "chinese");
assert.equal(scheduledChineseRule?.minPerClassPerDay, 1);
assert.equal(scheduledChineseRule?.minWeeklyDays, 0, "每天至少规则存在时覆盖天数应自动归零，避免重复配置");
assert.ok(schedule.draft.solver.qualityReport, "expected schedule quality report");
assert.equal(schedule.draft.solver.qualityReport.maxScore, 100);
assert.ok(schedule.draft.solver.qualityReport.score >= 0 && schedule.draft.solver.qualityReport.score <= 100);
assert.ok(Array.isArray(schedule.draft.solver.qualityReport.deductions));
assert.ok(Array.isArray(schedule.draft.solver.qualityReport.resourceTension?.teachers));
assert.ok(Array.isArray(schedule.draft.solver.qualityReport.resourceTension?.rooms));
assert.ok(Array.isArray(schedule.draft.solver.qualityReport.resourceTension?.candidateTasks));
assert.ok(
  schedule.draft.solver.qualityReport.resourceTension.candidateTasks.every((item) => Number.isFinite(Number(item.candidateCount))),
  "质量诊断应返回候选数量",
);
const deductionWithLessons = schedule.draft.solver.qualityReport.deductions.find((item) => Array.isArray(item.lessons) && item.lessons.length);
if (deductionWithLessons) {
  assert.ok(deductionWithLessons.lessons[0].className);
  assert.ok(deductionWithLessons.lessons[0].subjectName);
}
assert.ok(
  schedule.draft.assignments.filter((assignment) => assignment.subjectId === "pe").every((assignment) => assignment.roomType === "playground"),
  "体育课应排到操场",
);
const scheduleWeekDates = Array.from({ length: 5 }, (_, index) => addDays(schedule.config.weekStart, index));
schedule.config.classes.forEach((schoolClass) => {
  scheduleWeekDates.forEach((date) => {
    const chineseCount = schedule.draft.assignments.filter(
      (assignment) =>
        assignment.classId === schoolClass.id && assignment.subjectId === "chinese" && assignment.date === date,
    ).length;
    assert.equal(chineseCount, 1, `${schoolClass.name} ${date} 语文应每天正好 1 节`);

    const peCount = schedule.draft.assignments.filter(
      (assignment) => assignment.classId === schoolClass.id && assignment.subjectId === "pe" && assignment.date === date,
    ).length;
    assert.ok(peCount <= 1, `${schoolClass.name} ${date} 体育每天最多 1 节`);

    const mathRun = maxConsecutiveRun(
      schedule.draft.assignments
        .filter((assignment) => assignment.classId === schoolClass.id && assignment.subjectId === "math" && assignment.date === date)
        .map((assignment) => assignment.period),
    );
    assert.ok(mathRun <= 2, `${schoolClass.name} ${date} 数学最多连续 2 节`);
  });
});
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
assert.equal(published.version.termId, termContext.currentTerm.id);
assert.ok(published.lessons.every((lesson) => lesson.termId === termContext.currentTerm.id));
assert.ok(published.version?.id, "发布后应生成正式版本快照");
assert.ok(published.lessons.every((lesson) => lesson.scheduleVersionId === published.version.id));
assert.ok(
  teacherScheduleWeeks(db, published.lessons[0].teacherId, { termId: termContext.currentTerm.id }).length >= 1,
  "老师端应能按当前学期读取已发布周次",
);
assert.ok(
  teacherLessonsForWeek(db, published.lessons[0].teacherId, published.config.weekStart, {
    termId: termContext.currentTerm.id,
  }).every((lesson) => lesson.termId === termContext.currentTerm.id),
  "老师端周课表应限定在当前学期",
);
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
const lessonsForChange = db.lessonInstances.filter(
  (lesson) => lesson.source === "backend-scheduling" && lesson.divisionId === "elementary" && lesson.gradeId === "elementary-g1",
);
assert.ok(lessonsForChange.length > 0, "expected current published lessons for schedule change request");
const changeAttempt = createFirstValidChangeRequest(
  db,
  rolledBack.config,
  lessonsForChange,
  admin,
  "生产验收：回滚后调课审批链路",
);
assert.ok(changeAttempt, "expected at least one lesson to have a valid schedule change candidate");
const { lesson: lessonForChange, result: changeRequestResult } = changeAttempt;
assert.equal(changeRequestResult.request.status, "pending");
assert.equal(changeRequestResult.request.from.date, lessonForChange.date);
const approvedChange = approveScheduleChangeRequest(db, { requestId: changeRequestResult.request.id }, admin);
assert.equal(approvedChange.request.status, "approved");
assert.equal(approvedChange.lesson.changeRequestId, changeRequestResult.request.id);
assert.equal(approvedChange.lesson.date, changeRequestResult.request.to.date);
assert.equal(approvedChange.lesson.period, changeRequestResult.request.to.period);
assert.ok(db.auditLogs.some((entry) => entry.action === "schedule_change_request_approve" && entry.requestId === changeRequestResult.request.id));

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
  /请先由财务生成本月工资明细/,
);

let workload = confirmMonthlyWorkload(db, teacher.id, "2026-06", teacherAccount);
assert.equal(workload.confirmation.status, "teacher_confirmed");

workload = approveMonthlyWorkload(db, teacher.id, "2026-06", "academic", admin);
assert.equal(workload.confirmation.status, "academic_approved");

workload = approveMonthlyWorkload(db, teacher.id, "2026-06", "school", admin);
assert.equal(workload.confirmation.status, "school_approved");

let payroll = generateTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "saved");
assert.equal(payroll.generated.publishedAt, "");

assert.throws(
  () => reviewTeacherPayrollDetail(db, teacher.id, "2026-06", finance),
  /请先由老师确认工资明细或提出异议/,
);

payroll = publishTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "generated");
assert.ok(payroll.generated.publishedAt);
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

payroll = confirmTeacherPayrollDetail(db, teacher.id, "2026-06", teacherAccount);
assert.equal(payroll.generated.status, "teacher_confirmed");

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
assert.equal(payroll.generated.status, "saved");

payroll = publishTeacherPayrollDetail(db, teacher.id, "2026-06", finance);
assert.equal(payroll.generated.status, "generated");
assert.ok(payroll.rows.some((row) => row.name === "班主任津贴"), "expected updated salary profile to affect payroll");
assert.ok(payroll.rows.some((row) => row.name === "测试补充项"), "expected manual salary item to affect payroll");

payroll = confirmTeacherPayrollDetail(db, teacher.id, "2026-06", teacherAccount);
assert.equal(payroll.generated.status, "teacher_confirmed");

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
