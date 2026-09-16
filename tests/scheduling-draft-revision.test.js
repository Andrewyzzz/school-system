import assert from "node:assert/strict";
import { createInitialData, updateTeacherAssignment } from "../server/storage.js";
import { buildSchedulingConfig, generateScheduleDraft, publishScheduleDraft, updateGradeClassStructure } from "../server/scheduling.js";
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
assert.match(generated.draft.configurationFingerprint || "", /^schedule-config-v1:/, "新草稿应记录生成时的排课基础数据指纹");
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

// 任课关系变更后，旧草稿不得继续发布，避免把旧老师或旧课程关系带回新课表。
const currentConfig = buildSchedulingConfig(db, scope);
const chinese = currentConfig.subjects.find((subject) => subject.id === "chinese");
const currentChineseTeacherId = chinese.classTeacherIds?.[currentConfig.classes[0].id]?.[0];
const replacement = db.teachers.find(
  (item) =>
    item.status === "active" &&
    item.stageId === "primary" &&
    item.primarySubjectId === "chinese" &&
    item.id !== currentChineseTeacherId,
);
assert.ok(replacement, "应有可用于验证的另一位语文老师");
updateTeacherAssignment(
  db,
  {
    stageId: "primary",
    grade: 1,
    subjectId: "chinese",
    classTeacherIds: Object.fromEntries(currentConfig.classes.map((schoolClass) => [schoolClass.id, [replacement.id]])),
  },
  admin,
);
assert.throws(
  () => publishScheduleDraft(db, scope, admin),
  /排课基础数据已变更/,
  "任课关系更新后必须重新生成草稿才能发布",
);

console.log("scheduling draft revision checks passed");
