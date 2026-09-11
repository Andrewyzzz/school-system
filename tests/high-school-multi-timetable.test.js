import assert from "node:assert/strict";
import { createInitialData, queryTeacherLessonRecords, updateTeacherAssignment } from "../server/storage.js";
import {
  buildSchedulingConfig,
  generateScheduleDraft,
  publishScheduleDraft,
  updateGradeClassStructure,
  updateSchedulePeriods,
  validateScheduleConflicts,
} from "../server/scheduling.js";

function actor(db, username) {
  const account = db.accounts.find((item) => item.username === username);
  assert.ok(account, `missing account ${username}`);
  return account;
}

function template(startTimes) {
  return startTimes.map(([startTime, endTime], index) => ({
    period: index + 1,
    label: `第 ${index + 1} 节`,
    startTime,
    endTime,
    time: `${startTime}-${endTime}`,
    type: "regular",
    active: true,
  }));
}

function configureSharedSubjectTeachers(db, admin, config) {
  config.subjects.forEach((subject) => {
    const teacher = db.teachers.find(
      (item) => item.status === "active" && item.stageId === "high" && item.primarySubjectId === subject.id,
    );
    assert.ok(teacher, `高中部应有 ${subject.name} 任课老师`);
    updateTeacherAssignment(
      db,
      {
        stageId: "high",
        grade: 11,
        subjectId: subject.id,
        classTeacherIds: Object.fromEntries(config.classes.map((schoolClass) => [schoolClass.id, [teacher.id]])),
      },
      admin,
    );
  });
}

const db = createInitialData({ teacherCount: 1000 });
const admin = actor(db, "admin");
const scope = { divisionId: "high", gradeId: "high-g2" };

// 首次接入时，旧的高中“实验班/普通班”分别平滑映射为 B/C，班级 ID 不应变化。
const legacyClasses = buildSchedulingConfig(db, scope).classes;
const legacyCounts = {
  a: 0,
  b: legacyClasses.filter((schoolClass) => schoolClass.classType === "experimental").length,
  c: legacyClasses.filter((schoolClass) => schoolClass.classType !== "experimental").length,
};
updateGradeClassStructure(db, { stageId: "high", grade: 11, highClassCounts: legacyCounts }, admin);
const migratedClasses = buildSchedulingConfig(db, scope).classes;
assert.deepEqual(
  migratedClasses.map((schoolClass) => schoolClass.id).sort(),
  legacyClasses.map((schoolClass) => schoolClass.id).sort(),
  "旧高中 B/C 班首次接入独立作息时必须保留原班级 ID",
);

// 仅高中部使用 A/B/C 班级类别；不触及其他学部的班级和作息结构。
updateGradeClassStructure(
  db,
  { stageId: "high", grade: 11, highClassCounts: { a: 1, b: 1, c: 1 } },
  admin,
);

// 三类班级的“第 1 节”分别是 08:00、09:00、08:20。
// A 与 B 同为第 1 节但不重叠；A 与 C 则真实时间重叠。
const aPeriods = template([
  ["08:00", "08:40"], ["08:50", "09:30"], ["09:40", "10:20"],
  ["10:30", "11:10"], ["14:00", "14:40"], ["14:50", "15:30"],
]);
const bPeriods = template([
  ["09:00", "09:40"], ["09:50", "10:30"], ["10:40", "11:20"],
  ["11:30", "12:10"], ["14:20", "15:00"], ["15:10", "15:50"],
]);
const cPeriods = template([
  ["08:20", "09:00"], ["09:10", "09:50"], ["10:00", "10:40"],
  ["10:50", "11:30"], ["14:10", "14:50"], ["15:00", "15:40"],
]);
updateSchedulePeriods(db, { stageId: "high", grade: 11, highClassCategory: "a", periods: aPeriods }, admin);
updateSchedulePeriods(db, { stageId: "high", grade: 11, highClassCategory: "b", periods: bPeriods }, admin);
updateSchedulePeriods(db, { stageId: "high", grade: 11, highClassCategory: "c", periods: cPeriods }, admin);

let config = buildSchedulingConfig(db, scope);
assert.deepEqual(
  config.scheduleTemplateOptions.map((item) => item.key),
  ["a", "b", "c"],
  "高中排课配置应暴露 A/B/C 三套作息模板",
);
assert.equal(config.classes.filter((item) => item.highClassCategory === "a").length, 1);
assert.equal(config.classes.filter((item) => item.highClassCategory === "b").length, 1);
assert.equal(config.classes.filter((item) => item.highClassCategory === "c").length, 1);

const [aClass] = config.classes.filter((item) => item.highClassCategory === "a");
const [bClass] = config.classes.filter((item) => item.highClassCategory === "b");
const [cClass] = config.classes.filter((item) => item.highClassCategory === "c");
const sharedTeacher = config.teachers[0];
const probe = (schoolClass, time, id) => ({
  id,
  classId: schoolClass.id,
  className: schoolClass.name,
  teacherId: sharedTeacher.id,
  teacherName: sharedTeacher.name,
  subjectId: "chinese",
  subjectName: "语文",
  roomId: schoolClass.roomId,
  room: schoolClass.room,
  date: config.weekStart,
  period: 1,
  time,
});
assert.equal(
  validateScheduleConflicts([probe(aClass, "08:00-08:40", "A"), probe(bClass, "09:00-09:40", "B")], { config }).some(
    (item) => item.type === "teacher",
  ),
  false,
  "不同作息下同为第 1 节但实际不重叠的共享老师不应被误判冲突",
);
assert.equal(
  validateScheduleConflicts([probe(aClass, "08:00-08:40", "A"), probe(cClass, "08:20-09:00", "C")], { config }).some(
    (item) => item.type === "teacher",
  ),
  true,
  "不同作息下真实时间重叠的共享老师必须被识别为冲突",
);

configureSharedSubjectTeachers(db, admin, config);
config = buildSchedulingConfig(db, scope);
const generated = generateScheduleDraft(db, scope, admin);
assert.equal(generated.draft.unassignedCount, 0, "A/B/C 三类班级应能自动排满");
assert.equal(generated.draft.conflicts.length, 0, "自动排课后不应有真实时间冲突");
assert.equal(generated.draft.solver.algorithm, "high-school-multi-timetable-search");
generated.draft.assignments.forEach((assignment) => {
  const periods = generated.config.periodTemplates[assignment.scheduleTemplateKey];
  const expected = periods.find((period) => Number(period.period) === Number(assignment.period));
  assert.equal(assignment.time, expected?.time, `${assignment.className} 应使用所属班级类别的作息时间`);
});

const published = publishScheduleDraft(db, scope, admin);
const regularLessons = published.lessons.filter((lesson) => lesson.source === "backend-scheduling");
assert.ok(regularLessons.length > 0, "高中 A/B/C 排课应能正常发布");
assert.ok(
  regularLessons.every((lesson) => ["a", "b", "c"].includes(lesson.scheduleTemplateKey) && lesson.highClassCategory === lesson.scheduleTemplateKey),
  "发布到教师课表与薪资的数据应保留所属作息模板和班级类别",
);
const payrollTeacherId = regularLessons[0].teacherId;
const lessonRecords = queryTeacherLessonRecords(db, payrollTeacherId, published.config.weekStart.slice(0, 7));
assert.ok(
  lessonRecords.records.some((record) => regularLessons.some((lesson) => lesson.id === record.lessonId && record.payable)),
  "发布后的高中课次应继续进入教师课时记录与薪资核算口径",
);
assert.throws(
  () => updateGradeClassStructure(db, { stageId: "high", grade: 11, highClassCounts: { a: 0, b: 1, c: 1 } }, admin),
  /已有已发布课表/,
  "已发布课表中的班级不能被班级结构调整直接删除",
);

console.log("high-school multi-timetable checks passed");
