import assert from "node:assert/strict";
import { createInitialData, updateTeacherAssignment } from "../server/storage.js";
import {
  adjustScheduleAssignment,
  buildSchedulingConfig,
  generateScheduleDraft,
  previewSchedulePrecheck,
  publishScheduleDraft,
  updateRoomResources,
  validateScheduleConflicts,
} from "../server/scheduling.js";

// 跨年级共享资源验收：
// 同学期内多个年级先后排课时，老师和专用教室（操场等）是全校共享资源，
// 生成、冲突校验、发布各环节都必须感知其他年级的已发布课表。

function actor(db, username) {
  const account = db.accounts.find((item) => item.username === username);
  assert.ok(account, `missing account ${username}`);
  return account;
}

function configureClassTeachers(db, { stageId, grade }, actorAccount) {
  const divisionId = stageId === "primary" ? "elementary" : stageId;
  const gradeId = stageId === "primary" ? `elementary-g${grade}` : `${stageId}-g${grade}`;
  const activeClasses = buildSchedulingConfig(db, { divisionId, gradeId }).classes;
  db.subjects.forEach((subject) => {
    const teachers = db.teachers.filter(
      (item) => item.status === "active" && item.stageId === stageId && item.primarySubjectId === subject.id,
    );
    if (!teachers.length) return;
    const classTeacherIds = Object.fromEntries(
      activeClasses.map((schoolClass, index) => [schoolClass.id, [teachers[index % teachers.length].id]]),
    );
    updateTeacherAssignment(db, { stageId, grade, subjectId: subject.id, classTeacherIds }, actorAccount);
  });
}

const db = createInitialData({ teacherCount: 1000 });
const admin = actor(db, "admin");

// 两个年级共用同一批小学部老师（configureClassTeachers 对两个年级都取 teachers[index % n]，
// 前 10 位老师同时承担两个年级），操场等专用教室按学部共享。
configureClassTeachers(db, { stageId: "primary", grade: 1 }, admin);
configureClassTeachers(db, { stageId: "primary", grade: 2 }, admin);

// 专用教室按学部共享：一个操场 30 个课位放不下两个年级各 20 节体育课，
// 两间实验室 60 个课位也放不下两个年级各 40 节理化课，先扩容再验证共享冲突。
updateRoomResources(db, { stageId: "primary", grade: 1, roomCounts: { playground: 2, lab: 3 } }, admin);

const g1Scope = { divisionId: "elementary", gradeId: "elementary-g1" };
const g2Scope = { divisionId: "elementary", gradeId: "elementary-g2" };

// 1. 第一个年级正常生成并发布。
generateScheduleDraft(db, g1Scope, admin);
const g1Published = publishScheduleDraft(db, g1Scope, admin);
assert.equal(g1Published.lessons.length > 0, true, "一年级应发布出课节");

const g1Lessons = db.lessonInstances.filter(
  (lesson) => lesson.source === "backend-scheduling" && lesson.gradeId === "elementary-g1" && lesson.status !== "cancelled",
);

// 2. 第二个年级预检必须感知一年级的跨年级占用（老师容量扣除后仍可排）。
const g2Precheck = previewSchedulePrecheck(db, g2Scope);
assert.equal(
  g2Precheck.precheck.status === "blocked" ? g2Precheck.precheck.checks.map((c) => c.title).join("；") : "ok",
  "ok",
  "二年级预检不应被一年级已发布课表阻塞",
);

// 3. 第二个年级生成草稿：不允许与一年级产生老师/教室时间冲突。
const g2Draft = generateScheduleDraft(db, g2Scope, admin);
assert.equal(g2Draft.draft.conflicts.length, 0, "二年级草稿不应有冲突");
assert.equal(Number(g2Draft.draft.unassignedCount || 0), 0, "二年级草稿应排满");

const g1TeacherSlots = new Set(g1Lessons.map((lesson) => `${lesson.teacherId}|${lesson.date}|${lesson.time?.slice(0, 5)}`));
const g1RoomSlots = new Set(g1Lessons.map((lesson) => `${lesson.roomId}|${lesson.date}|${lesson.time?.slice(0, 5)}`));
(g2Draft.draft.assignments || []).forEach((assignment) => {
  const timeKey = assignment.time?.slice(0, 5);
  assert.equal(
    g1TeacherSlots.has(`${assignment.teacherId}|${assignment.date}|${timeKey}`),
    false,
    `老师 ${assignment.teacherName} 在 ${assignment.date} ${assignment.time} 已在一年级有课，二年级不应再排`,
  );
  assert.equal(
    g1RoomSlots.has(`${assignment.roomId}|${assignment.date}|${timeKey}`),
    false,
    `教室 ${assignment.room} 在 ${assignment.date} ${assignment.time} 已被一年级占用，二年级不应再排`,
  );
});

// 4. 人为制造跨年级教室冲突：把二年级一节操场课调整到一年级已占用的同一操场同一时段，
//    草稿冲突里必须出现 room-global，且发布必须被硬阻断。
//    挑目标时段时必须避开「每班每天最多 1 节体育」这条学科规则：如果二年级
//    那个班当天已经有体育课，调课会先被学科规则拦下来抛 400，根本走不到教室
//    冲突这一步。日期是排课排出来的，每次运行都不一样——随手取第一条会让这个
//    测试大约六次挂一次，而挂的原因跟它要验的东西毫无关系。
const g2Assignments = g2Draft.draft.assignments || [];
const g1Config = buildSchedulingConfig(db, g1Scope);
const periodOfTime = (time) => g1Config.periods.find((item) => item.time === time)?.period;

const clash = (() => {
  for (const assignment of g2Assignments.filter((a) => String(a.roomId || "").includes("PLAYGROUND"))) {
    for (const lesson of g1Lessons.filter((l) => String(l.roomId || "").includes("PLAYGROUND"))) {
      const period = periodOfTime(lesson.time);
      if (!period) continue;
      const sameDaySameSubject = g2Assignments.some(
        (other) =>
          other.id !== assignment.id &&
          other.classId === assignment.classId &&
          other.date === lesson.date &&
          other.subjectId === assignment.subjectId,
      );
      if (sameDaySameSubject) continue;
      return { assignment, lesson, period };
    }
  }
  return null;
})();
assert.ok(clash, "应能找到一对不触发学科规则的操场课节用于制造教室冲突");

const g1PlaygroundLesson = clash.lesson;
const g2PlaygroundAssignment = clash.assignment;
const g1PlaygroundPeriod = clash.period;

const adjusted = adjustScheduleAssignment(
  db,
  {
    ...g2Scope,
    assignmentId: g2PlaygroundAssignment.id,
    date: g1PlaygroundLesson.date,
    period: g1PlaygroundPeriod,
    roomId: g1PlaygroundLesson.roomId,
  },
  admin,
);
const roomGlobalConflict = (adjusted.draft.conflicts || []).find((conflict) => conflict.type === "room-global");
assert.ok(
  roomGlobalConflict,
  `跨年级教室占用必须被识别为 room-global 冲突，实际冲突：${JSON.stringify(adjusted.draft.conflicts)}`,
);
assert.throws(
  () => publishScheduleDraft(db, g2Scope, admin),
  /冲突/,
  "存在跨年级教室冲突时发布必须被阻断",
);

// 5. 重新生成后二年级可以正常发布，两个年级课表共存互不混乱。
const g2Regenerated = generateScheduleDraft(db, g2Scope, admin);
assert.equal(g2Regenerated.draft.conflicts.length, 0);
const g2Published = publishScheduleDraft(db, g2Scope, admin);
assert.equal(g2Published.lessons.length > 0, true);

const allLessons = db.lessonInstances.filter(
  (lesson) => lesson.source === "backend-scheduling" && lesson.status !== "cancelled",
);
const teacherSlotMap = new Map();
const roomSlotMap = new Map();
allLessons.forEach((lesson) => {
  const teacherKey = `${lesson.teacherId}|${lesson.date}|${lesson.time}`;
  teacherSlotMap.set(teacherKey, (teacherSlotMap.get(teacherKey) || 0) + 1);
  const roomKey = `${lesson.roomId}|${lesson.date}|${lesson.time}`;
  roomSlotMap.set(roomKey, (roomSlotMap.get(roomKey) || 0) + 1);
});
teacherSlotMap.forEach((count, key) => {
  assert.equal(count, 1, `发布后老师时间线出现重叠：${key}`);
});
roomSlotMap.forEach((count, key) => {
  assert.equal(count, 1, `发布后教室时间线出现重叠：${key}`);
});

// 6. validateScheduleConflicts 单元级验证：外部教室占用必须参与判定（回归 room-global 死代码问题）。
const unitConfig = buildSchedulingConfig(db, g2Scope);
const sample = allLessons.find((lesson) => lesson.gradeId === "elementary-g2");
const externalSample = {
  ...sample,
  id: "EXT-SAMPLE",
  external: true,
  classId: "CLS-other-grade",
  className: "外部班级",
  teacherId: "T-EXTERNAL-OTHER",
  sourceLabel: "已发布课表",
};
const unitConflicts = validateScheduleConflicts(
  [
    {
      id: "OWN-SAMPLE",
      classId: sample.classId,
      className: sample.className,
      subjectId: sample.subjectId,
      subjectName: sample.subjectName,
      teacherId: sample.teacherId,
      teacherName: sample.teacherName,
      roomId: sample.roomId,
      room: sample.room,
      date: sample.date,
      period: 1,
      time: sample.time,
    },
  ],
  { externalAssignments: [{ ...externalSample, period: 1 }] },
);
assert.ok(
  unitConflicts.some((conflict) => conflict.type === "room-global"),
  "validateScheduleConflicts 必须识别外部课节的教室占用冲突",
);

console.log("cross-grade scheduling checks passed");
