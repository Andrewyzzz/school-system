import assert from "node:assert/strict";
import { createInitialData, updateTeacherAssignment } from "../server/storage.js";
import {
  buildSchedulePrecheck,
  buildSchedulingConfig,
  generateScheduleDraft,
  updateGradeClassStructure,
} from "../server/scheduling.js";

function actor(db, username) {
  const account = db.accounts.find((item) => item.username === username);
  assert.ok(account, `missing account ${username}`);
  return account;
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

function runScenario(definition) {
  const db = createInitialData({ teacherCount: definition.teacherCount });
  const admin = actor(db, "admin");
  updateGradeClassStructure(
    db,
    {
      stageId: definition.stageId,
      grade: definition.grade,
      regularCount: definition.regularCount,
      experimentalCount: definition.experimentalCount || 0,
    },
    admin,
  );
  (definition.extraRooms || []).forEach((room, index) => {
    db.rooms.push({
      id: `BENCH-${definition.stageId}-${room.roomType}-${index + 1}`,
      name: room.name,
      stageId: definition.stageId,
      roomType: room.roomType,
      active: true,
    });
  });
  configureClassTeachers(db, { stageId: definition.stageId, grade: definition.grade }, admin);

  const startedAt = Date.now();
  const result = generateScheduleDraft(
    db,
    {
      divisionId: definition.divisionId,
      gradeId: definition.gradeId,
    },
    admin,
  );
  const elapsedMs = Date.now() - startedAt;
  const solver = result.draft.solver || {};
  const quality = solver.qualityReport || {};
  const fallbackTriggered = Boolean(solver.fallbackFrom || solver.algorithm !== "ortools-cp-sat");
  const summary = {
    scenario: definition.name,
    classes: result.config.classCount,
    requiredLessons: result.draft.requiredLessonCount,
    generatedLessons: result.draft.generatedLessonCount,
    unassigned: result.draft.unassignedCount,
    conflicts: result.draft.conflicts.length,
    algorithm: solver.algorithm,
    fallbackTriggered,
    score: quality.score,
    unmetPreferenceCount: quality.unmetPreferenceCount,
    elapsedMs,
  };
  assert.equal(summary.conflicts, 0, `${definition.name} should not have hard conflicts`);
  if (!definition.allowPartial) {
    assert.equal(summary.unassigned, 0, `${definition.name} should not have unassigned lessons`);
  }
  assert.ok(Number(summary.score) >= 0 && Number(summary.score) <= 100, `${definition.name} should have quality score`);
  return summary;
}

function assertAggregatedRoomCapacityPrecheck() {
  const db = createInitialData({ teacherCount: 1500 });
  const admin = actor(db, "admin");
  updateGradeClassStructure(
    db,
    {
      stageId: "high",
      grade: 11,
      regularCount: 14,
      experimentalCount: 2,
    },
    admin,
  );
  db.rooms.push({
    id: "BENCH-high-playground-only",
    name: "高中备用操场",
    stageId: "high",
    roomType: "playground",
    active: true,
  });
  configureClassTeachers(db, { stageId: "high", grade: 11 }, admin);

  const config = buildSchedulingConfig(db, { divisionId: "high", gradeId: "high-g2" });
  const precheck = buildSchedulePrecheck(config);
  assert.equal(precheck.status, "blocked", "insufficient shared room capacity should block scheduling");
  assert.ok(
    precheck.checks.some((item) => item.key === "room_type_capacity_lab"),
    "lab capacity should be checked across physics and chemistry together",
  );
}

const scenarios = [
  {
    name: "small-primary-10-classes",
    teacherCount: 1000,
    divisionId: "elementary",
    stageId: "primary",
    gradeId: "elementary-g1",
    grade: 1,
    regularCount: 8,
    experimentalCount: 2,
  },
  {
    name: "medium-middle-12-classes",
    teacherCount: 1200,
    divisionId: "middle",
    stageId: "middle",
    gradeId: "middle-g2",
    grade: 8,
    regularCount: 10,
    experimentalCount: 2,
  },
  {
    name: "large-high-16-classes",
    teacherCount: 1500,
    divisionId: "high",
    stageId: "high",
    gradeId: "high-g2",
    grade: 11,
    regularCount: 14,
    experimentalCount: 2,
    extraRooms: [
      { name: "高中物理备用实验室", roomType: "lab" },
      { name: "高中化学备用实验室", roomType: "lab" },
      { name: "高中备用操场", roomType: "playground" },
    ],
  },
];

const summaries = scenarios.map(runScenario);
assertAggregatedRoomCapacityPrecheck();
const cpSatRuns = summaries.filter((item) => item.algorithm === "ortools-cp-sat").length;
const fallbackRuns = summaries.filter((item) => item.fallbackTriggered).length;
const averageElapsedMs = Math.round(summaries.reduce((sum, item) => sum + item.elapsedMs, 0) / summaries.length);
const averageScore = Math.round(summaries.reduce((sum, item) => sum + Number(item.score || 0), 0) / summaries.length);

console.table(summaries);
console.log(
  JSON.stringify(
    {
      scenarios: summaries.length,
      cpSatRuns,
      fallbackRuns,
      averageElapsedMs,
      averageScore,
    },
    null,
    2,
  ),
);
