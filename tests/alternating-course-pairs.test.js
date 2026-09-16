import assert from "node:assert/strict";
import {
  buildSchedulingConfig,
  generateScheduleDraft,
  publishScheduleDraft,
  updateGradeClassStructure,
  updateGradeCourseRules,
} from "../server/scheduling.js";
import { createInitialData, teacherScheduleWeeks, updateTeacherAssignment } from "../server/storage.js";

const db = createInitialData({ teacherCount: 180 });
const admin = db.accounts.find((account) => account.role === "system_admin");
assert.ok(admin, "需要系统管理员账号");

// 把测试范围收敛到一个小学班级和两门课程：劳动 6.5 节 + 心理 0.5 节。
// 预期是劳动的 6 节固定在单双周，最后一个课位单周心理、双周劳动。
updateGradeClassStructure(db, { stageId: "primary", grade: 1, regularCount: 1, experimentalCount: 0 }, admin);
let config = buildSchedulingConfig(db, { divisionId: "elementary", gradeId: "elementary-g1" });
if (!db.subjects.some((subject) => subject.id === "psychology")) {
  db.subjects.push({ id: "psychology", name: "心理健康", lessonRate: 80 });
}
if (!db.subjects.some((subject) => subject.id === "labor")) {
  db.subjects.push({ id: "labor", name: "劳动", lessonRate: 80 });
}
const teacher = db.teachers.find((item) => item.stageId === "primary" && item.status === "active");
assert.ok(teacher, "需要小学部在职老师");
teacher.teachableSubjectIds = Array.from(new Set([...(teacher.teachableSubjectIds || []), "psychology", "labor"]));
const classTeacherIds = Object.fromEntries(config.classes.map((schoolClass) => [schoolClass.id, [teacher.id]]));
updateTeacherAssignment(db, { stageId: "primary", grade: 1, subjectId: "psychology", classTeacherIds }, admin);
updateTeacherAssignment(db, { stageId: "primary", grade: 1, subjectId: "labor", classTeacherIds }, admin);

config = buildSchedulingConfig(db, { divisionId: "elementary", gradeId: "elementary-g1" });
updateGradeCourseRules(
  db,
  {
    stageId: "primary",
    grade: 1,
    rules: config.courseRules.map((rule) => ({
      subjectId: rule.subjectId,
      enabled: rule.subjectId === "psychology" || rule.subjectId === "labor",
      weeklyLessons: rule.subjectId === "psychology" ? 0.5 : rule.subjectId === "labor" ? 6.5 : 0,
      durationMinutes: rule.durationMinutes,
    })),
    cyclePairs: [{ oddSubjectId: "psychology", evenSubjectId: "labor" }],
  },
  admin,
);

// 兼容升级前已经存有 0.5 课时、但尚未出现配对表的存量数据：应自动给出
// 稳定的单双周组合，而不是退回旧的“当前周取整”逻辑。
db.gradeCourseCyclePairs = [];
const migratedConfig = buildSchedulingConfig(db, { divisionId: "elementary", gradeId: "elementary-g1" });
assert.equal(migratedConfig.cyclePairs.length, 1, "存量半节课程应自动补出一组单双周配对");
assert.equal(migratedConfig.cyclePairs[0].oddSubjectId, "labor");
assert.equal(migratedConfig.cyclePairs[0].evenSubjectId, "psychology");

const generated = generateScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin);
assert.equal(generated.draft.cycle?.mode, "alternating-week", "半节课程应生成两周循环草稿");
assert.equal(generated.draft.unassignedCount, 0, "单双周课程都应排满");
assert.equal(generated.draft.conflicts.length, 0, "单双周课位不应产生冲突");

const schoolClass = generated.config.classes[0];
const odd = generated.draft.assignments.filter((item) => item.classId === schoolClass.id && item.cycleWeek === "odd");
const even = generated.draft.assignments.filter((item) => item.classId === schoolClass.id && item.cycleWeek === "even");
assert.equal(odd.filter((item) => item.subjectId === "labor").length, 7, "单周应把替换课位给劳动");
assert.equal(even.filter((item) => item.subjectId === "labor").length, 6, "双周应有 6 节劳动固定课");
assert.equal(odd.filter((item) => item.subjectId === "psychology").length, 0, "单周不应出现心理课");
assert.equal(even.filter((item) => item.subjectId === "psychology").length, 1, "双周应有 1 节心理课");

const oddReplacement = odd.find((item) => item.cyclePairId && item.subjectId === "labor");
const evenReplacement = even.find((item) => item.cyclePairId && item.subjectId === "psychology");
assert.ok(oddReplacement && evenReplacement, "替换课程必须带有配对标识");
assert.equal(oddReplacement.dayIndex, evenReplacement.dayIndex, "单双周替换课必须落在同一天");
assert.equal(oddReplacement.period, evenReplacement.period, "单双周替换课必须共用同一节次");
assert.equal(oddReplacement.time, evenReplacement.time, "单双周替换课必须共用同一时间段");

const published = publishScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin);
const regularLessons = published.lessons.filter((lesson) => lesson.source === "backend-scheduling");
assert.ok(regularLessons.some((lesson) => lesson.cycleWeek === "odd"));
assert.ok(regularLessons.some((lesson) => lesson.cycleWeek === "even"));
const weeks = teacherScheduleWeeks(db, teacher.id, { termId: generated.config.termId });
assert.ok(weeks.some((week) => week.cycleWeek === "odd"), "老师端应能看到单周课表");
assert.ok(weeks.some((week) => week.cycleWeek === "even"), "老师端应能看到双周课表");

console.log("alternating course pair checks passed");
