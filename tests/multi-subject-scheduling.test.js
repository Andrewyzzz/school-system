import assert from "node:assert/strict";
import { buildSchedulingConfig } from "../server/scheduling.js";
import { createInitialData, updateTeacherAssignment } from "../server/storage.js";

const db = createInitialData({ teacherCount: 120 });
const actor = db.accounts.find((account) => account.role === "system_admin");
const teacher = db.teachers.find(
  (item) => item.status === "active" && item.stageId === "primary" && item.primarySubjectId === "chinese",
);
assert.ok(actor && teacher, "测试数据应包含管理员和小学语文老师");

teacher.teachableSubjectIds = [teacher.primarySubjectId, "math"];
teacher.teachableSubjectNames = [teacher.primarySubjectName, "数学"];

const config = buildSchedulingConfig(db, { divisionId: "elementary", gradeId: "elementary-g1" });
const classTeacherIds = Object.fromEntries(config.classes.map((schoolClass) => [schoolClass.id, [teacher.id]]));

assert.doesNotThrow(() =>
  updateTeacherAssignment(
    db,
    { stageId: "primary", grade: 1, subjectId: "math", classTeacherIds },
    actor,
  ),
);

const refreshed = buildSchedulingConfig(db, { divisionId: "elementary", gradeId: "elementary-g1" });
const math = refreshed.subjects.find((subject) => subject.id === "math");
assert.ok(math, "排课配置应包含数学");
assert.ok(math.teacherIds.includes(teacher.id), "跨学科老师应保留在班级任课关系中");
assert.ok(
  math.availableTeachers.some((item) => item.id === teacher.id),
  "跨学科老师应进入该学科的可排课教师池",
);

console.log("multi-subject scheduling test passed");
