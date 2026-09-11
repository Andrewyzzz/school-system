import assert from "node:assert/strict";
import { createInitialData, updateTeacherAssignment } from "../server/storage.js";
import { buildSchedulingConfig, generateScheduleDraft, updateGradeClassStructure } from "../server/scheduling.js";
import { startScheduleGenerationJob } from "../server/schedulingJobs.js";

const db = createInitialData({ teacherCount: 160 });
const admin = db.accounts.find((account) => account.username === "admin");
assert.ok(admin, "missing admin account");

updateGradeClassStructure(db, { stageId: "primary", grade: 1, regularCount: 1, experimentalCount: 0 }, admin);
const config = buildSchedulingConfig(db, { divisionId: "elementary", gradeId: "elementary-g1" });
db.subjects.forEach((subject) => {
  const teacher = db.teachers.find(
    (item) => item.status === "active" && item.stageId === "primary" && item.primarySubjectId === subject.id,
  );
  if (!teacher) return;
  updateTeacherAssignment(
    db,
    {
      stageId: "primary",
      grade: 1,
      subjectId: subject.id,
      classTeacherIds: Object.fromEntries(config.classes.map((schoolClass) => [schoolClass.id, [teacher.id]])),
    },
    admin,
  );
});

const scope = { divisionId: "elementary", gradeId: "elementary-g1" };
const generated = generateScheduleDraft(db, scope, admin);
assert.equal(generated.draft.revision, 1, "首次生成应创建版本 1");
assert.throws(
  () => generateScheduleDraft(db, { ...scope, expectedDraftRevision: 0 }, admin),
  /另一位负责人更新/,
  "过期客户端不能覆盖已有草稿",
);
assert.throws(
  () => startScheduleGenerationJob(db, { ...scope, expectedDraftRevision: 0 }, admin),
  /另一位负责人更新/,
  "过期客户端不能创建会覆盖已有草稿的异步任务",
);

console.log("scheduling draft revision checks passed");
