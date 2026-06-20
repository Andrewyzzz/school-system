import assert from "node:assert/strict";
import { createInitialData, updateTeacherAssignment } from "../server/storage.js";
import { updateGradeClassStructure } from "../server/scheduling.js";
import {
  getScheduleGenerationJob,
  scheduleGenerationJobResponse,
  startScheduleGenerationJob,
} from "../server/schedulingJobs.js";

function actor(db, username) {
  const account = db.accounts.find((item) => item.username === username);
  assert.ok(account, `missing account ${username}`);
  return account;
}

function configureClassTeachers(db, { stageId, grade }, actorAccount) {
  const activeClasses = db.classes.filter(
    (schoolClass) => schoolClass.stageId === stageId && Number(schoolClass.grade) === Number(grade) && schoolClass.active,
  );
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

console.log("scheduling job checks passed");
