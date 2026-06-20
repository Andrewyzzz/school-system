import assert from "node:assert/strict";
import { createInitialData, updateTeacherAssignment } from "../server/storage.js";
import { buildSchedulingConfig, updateGradeClassStructure } from "../server/scheduling.js";
import {
  cancelScheduleGenerationJob,
  getScheduleGenerationJob,
  scheduleGenerationJobResponse,
  startScheduleGenerationJob,
} from "../server/schedulingJobs.js";

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
    updateTeacherAssignment(
      db,
      {
        stageId,
        grade,
        subjectId: subject.id,
        classTeacherIds: Object.fromEntries(activeClasses.map((schoolClass, index) => [schoolClass.id, [teachers[index % teachers.length].id]])),
      },
      actorAccount,
    );
  });
}

async function waitForJob(jobId, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const job = getScheduleGenerationJob(jobId);
    if (job && ["completed", "failed"].includes(job.status)) return job;
    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  }
  throw new Error(`job ${jobId} did not finish in time`);
}

const db = createInitialData({ teacherCount: 160 });
const admin = actor(db, "admin");

updateGradeClassStructure(
  db,
  {
    stageId: "primary",
    grade: 1,
    regularCount: 1,
    experimentalCount: 0,
  },
  admin,
);
configureClassTeachers(db, { stageId: "primary", grade: 1 }, admin);

let saved = false;
const { job, reused } = startScheduleGenerationJob(
  db,
  {
    divisionId: "elementary",
    gradeId: "elementary-g1",
  },
  admin,
  {
    saveDatabase: async () => {
      saved = true;
    },
  },
);

assert.equal(reused, false);
assert.ok(job.id.startsWith("SJOB-"));
assert.equal(job.status, "queued");

const completedJob = await waitForJob(job.id);
assert.equal(completedJob.status, "completed", completedJob.error?.message || "expected job to complete");
assert.equal(saved, true, "expected async job to persist database");

const response = scheduleGenerationJobResponse(completedJob, { includeResult: true });
assert.equal(response.status, "completed");
assert.ok(response.result?.draft, "expected completed job response to include draft");
assert.equal(response.summary.unassignedCount, 0);
assert.equal(response.summary.conflictCount, 0);
assert.ok(db.scheduleDrafts.some((draft) => draft.id === response.result.draft.id), "expected draft to be applied to main database");

const cancelDb = createInitialData({ teacherCount: 160 });
const cancelAdmin = actor(cancelDb, "admin");
updateGradeClassStructure(
  cancelDb,
  {
    stageId: "primary",
    grade: 1,
    regularCount: 1,
    experimentalCount: 0,
  },
  cancelAdmin,
);
configureClassTeachers(cancelDb, { stageId: "primary", grade: 1 }, cancelAdmin);

let cancelSaved = false;
const initialCancelDraftCount = cancelDb.scheduleDrafts.length;
const { job: cancellableJob } = startScheduleGenerationJob(
  cancelDb,
  {
    divisionId: "elementary",
    gradeId: "elementary-g1",
  },
  cancelAdmin,
  {
    saveDatabase: async () => {
      cancelSaved = true;
    },
  },
);
const cancelResult = await cancelScheduleGenerationJob(cancellableJob.id, cancelAdmin);
assert.equal(cancelResult.cancelled, true);
assert.equal(cancelResult.job.status, "cancelled");
assert.equal(cancelResult.job.cancelledByAccountId, cancelAdmin.id);

await new Promise((resolve) => {
  setTimeout(resolve, 50);
});

assert.equal(cancelSaved, false, "cancelled job should not persist database");
assert.equal(cancelDb.scheduleDrafts.length, initialCancelDraftCount, "cancelled job should not write schedule drafts");
assert.equal(scheduleGenerationJobResponse(cancelResult.job).status, "cancelled");

console.log("scheduling job checks passed");
