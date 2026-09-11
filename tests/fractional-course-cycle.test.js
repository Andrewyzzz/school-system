import assert from "node:assert/strict";
import { buildSchedulingConfig, requiredScheduleLessonCount, updateGradeCourseRules } from "../server/scheduling.js";
import { createInitialData, updateTeacherAssignment } from "../server/storage.js";

const db = createInitialData({ teacherCount: 120 });
const actor = db.accounts.find((account) => account.role === "system_admin");
const scope = { divisionId: "elementary", gradeId: "elementary-g1" };
const initial = buildSchedulingConfig(db, scope);
const teacher = db.teachers.find((item) => item.stageId === "primary" && item.status === "active");
assert.ok(actor && teacher);

if (!db.subjects.some((subject) => subject.id === "psychology")) {
  db.subjects.push({ id: "psychology", name: "心理健康", lessonRate: 80 });
}
if (!db.subjects.some((subject) => subject.id === "labor")) {
  db.subjects.push({ id: "labor", name: "劳动", lessonRate: 80 });
}

teacher.teachableSubjectIds = Array.from(new Set([teacher.primarySubjectId, "psychology", "labor"]));
const classTeacherIds = Object.fromEntries(initial.classes.map((schoolClass) => [schoolClass.id, [teacher.id]]));
updateTeacherAssignment(db, { stageId: "primary", grade: 1, subjectId: "psychology", classTeacherIds }, actor);
updateTeacherAssignment(db, { stageId: "primary", grade: 1, subjectId: "labor", classTeacherIds }, actor);

const psychologyAssignment = db.teacherAssignments.find(
  (item) => item.stageId === "primary" && item.grade === 1 && item.subjectId === "psychology",
);
psychologyAssignment.classTeacherMeta = Object.fromEntries(
  initial.classes.map((schoolClass, index) => [
    schoolClass.id,
    { weekPattern: index % 2 === 0 ? "odd" : "even" },
  ]),
);

updateGradeCourseRules(
  db,
  {
    stageId: "primary",
    grade: 1,
    rules: [
      { subjectId: "psychology", enabled: true, weeklyLessons: 0.5 },
      { subjectId: "labor", enabled: true, weeklyLessons: 1.5 },
    ],
  },
  actor,
);

const odd = buildSchedulingConfig(db, { ...scope, weekStart: initial.termStartDate });
const evenStart = new Date(`${initial.termStartDate}T00:00:00Z`);
evenStart.setUTCDate(evenStart.getUTCDate() + 7);
const even = buildSchedulingConfig(db, { ...scope, weekStart: evenStart.toISOString().slice(0, 10) });
const oddPsychology = odd.subjects.find((subject) => subject.id === "psychology");
const oddLabor = odd.subjects.find((subject) => subject.id === "labor");
const evenLabor = even.subjects.find((subject) => subject.id === "labor");

assert.equal(oddPsychology.sourceWeeklyLessons, 0.5);
assert.equal(oddPsychology.weeklyLessons, 1, "心理课在班级所属单双周各排一节");
assert.equal(oddLabor.sourceWeeklyLessons, 1.5);
assert.equal(oddLabor.weeklyLessons, 2, "两周周期第一周劳动课排两节");
assert.equal(evenLabor.weeklyLessons, 1, "两周周期第二周劳动课排一节");
assert.equal(
  requiredScheduleLessonCount(odd) - requiredScheduleLessonCount(even),
  initial.classes.length,
  "两周课次差只来自每班劳动课多一节，心理课按单双周班级分流后总量稳定",
);

console.log("fractional course cycle test passed");
