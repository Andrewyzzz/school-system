import { Worker } from "node:worker_threads";

const JOB_TTL_MS = 1000 * 60 * 60;
const MAX_RETAINED_JOBS = 40;
const jobs = new Map();

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function scheduleJobId() {
  return `SJOB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeScheduleJobScope(options = {}) {
  return {
    divisionId: options.divisionId || "",
    gradeId: options.gradeId || "",
  };
}

function sameScheduleScope(left = {}, right = {}) {
  return left.divisionId === right.divisionId && left.gradeId === right.gradeId;
}

function scheduleJobMessage(job) {
  if (job.status === "queued") return "排课任务已进入队列";
  if (job.status === "running") return job.message || "正在生成排课草稿";
  if (job.status === "completed") return "排课草稿已生成";
  if (job.status === "cancelled") return "排课任务已取消";
  if (job.status === "failed") return job.error?.message || "排课任务失败";
  return job.message || "";
}

function pruneScheduleJobs() {
  const now = Date.now();
  Array.from(jobs.values()).forEach((job) => {
    if (["queued", "running"].includes(job.status)) return;
    if (now - new Date(job.updatedAt || job.createdAt).getTime() > JOB_TTL_MS) {
      jobs.delete(job.id);
    }
  });

  const sorted = Array.from(jobs.values()).sort(
    (a, b) => new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime(),
  );
  while (sorted.length > MAX_RETAINED_JOBS) {
    const job = sorted.shift();
    if (job && !["queued", "running"].includes(job.status)) jobs.delete(job.id);
  }
}

function applyScheduleGenerationResult(db, job, payload) {
  const result = payload.result;
  const config = result?.config || {};
  const draft = result?.draft || {};
  db.scheduleDrafts = (db.scheduleDrafts || []).filter(
    (item) => !(item.divisionId === config.divisionId && item.gradeId === config.gradeId),
  );
  db.scheduleDrafts.push(draft);
  db.meta = db.meta || {};
  db.meta.updatedAt = payload.metaUpdatedAt || nowIso();
  db.auditLogs = db.auditLogs || [];
  db.auditLogs.push(...(payload.auditLogs || []));
  job.result = result;
}

function publicScheduleGenerationJob(job, options = {}) {
  if (!job) return null;
  const includeResult = Boolean(options.includeResult);
  return {
    id: job.id,
    status: job.status,
    phase: job.phase,
    progress: job.progress,
    message: scheduleJobMessage(job),
    scope: job.scope,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
    failedAt: job.failedAt,
    cancelledAt: job.cancelledAt,
    cancelledByAccountId: job.cancelledByAccountId,
    createdByAccountId: job.createdByAccountId,
    error: job.error || null,
    summary: job.result?.draft
      ? {
          generatedLessonCount: job.result.draft.generatedLessonCount || 0,
          requiredLessonCount: job.result.draft.requiredLessonCount || 0,
          unassignedCount: job.result.draft.unassignedCount || 0,
          conflictCount: job.result.draft.conflicts?.length || 0,
          solverAlgorithm: job.result.draft.solver?.algorithm || "",
          solverScore: job.result.draft.solver?.qualityReport?.score ?? job.result.draft.solver?.score ?? null,
        }
      : null,
    result: includeResult ? job.result || null : null,
  };
}

function activeScheduleGenerationJob(scope) {
  return Array.from(jobs.values()).find(
    (job) => sameScheduleScope(job.scope, scope) && ["queued", "running"].includes(job.status),
  );
}

export function getScheduleGenerationJob(jobId) {
  pruneScheduleJobs();
  return jobs.get(jobId) || null;
}

export function scheduleGenerationJobResponse(job, options = {}) {
  return publicScheduleGenerationJob(job, options);
}

export function startScheduleGenerationJob(db, options = {}, actorAccount = null, callbacks = {}) {
  pruneScheduleJobs();
  const scope = normalizeScheduleJobScope(options);
  const existing = activeScheduleGenerationJob(scope);
  if (existing) {
    return {
      job: existing,
      reused: true,
    };
  }

  const now = nowIso();
  const job = {
    id: scheduleJobId(),
    type: "schedule_generation",
    status: "queued",
    phase: "queued",
    progress: 5,
    message: "排课任务已进入队列",
    scope,
    createdAt: now,
    updatedAt: now,
    startedAt: "",
    completedAt: "",
    failedAt: "",
    cancelledAt: "",
    cancelledByAccountId: "",
    createdByAccountId: actorAccount?.id || "",
    error: null,
    result: null,
  };
  jobs.set(job.id, job);

  job.startTimer = setTimeout(() => {
    delete job.startTimer;
    if (job.status === "cancelled") return;

    job.status = "running";
    job.phase = "starting";
    job.progress = 10;
    job.message = "正在启动排课求解器";
    job.startedAt = nowIso();
    job.updatedAt = job.startedAt;

    const worker = new Worker(new URL("./schedulingJobWorker.js", import.meta.url), {
      workerData: {
        db: clone(db),
        options: clone(options),
        account: actorAccount ? clone(actorAccount) : null,
      },
    });
    job.worker = worker;

    worker.on("message", async (message) => {
      if (job.status === "cancelled") return;

      if (message.type === "progress") {
        job.phase = message.phase || job.phase;
        job.progress = Number(message.progress || job.progress);
        job.message = message.message || job.message;
        job.updatedAt = nowIso();
        return;
      }

      if (message.type === "completed") {
        job.status = "completed";
        job.phase = "completed";
        job.progress = 100;
        job.message = "排课草稿已生成";
        job.completedAt = nowIso();
        job.updatedAt = job.completedAt;
        applyScheduleGenerationResult(db, job, message);
        try {
          if (callbacks.saveDatabase) await callbacks.saveDatabase();
        } catch (error) {
          job.status = "failed";
          job.phase = "save_failed";
          job.progress = 100;
          job.error = {
            message: error?.message || "排课草稿保存失败",
            details: null,
          };
          job.failedAt = nowIso();
          job.updatedAt = job.failedAt;
        }
        return;
      }

      if (message.type === "failed") {
        job.status = "failed";
        job.phase = "failed";
        job.progress = 100;
        job.error = message.error || { message: "排课任务失败" };
        job.failedAt = nowIso();
        job.updatedAt = job.failedAt;
      }
    });

    worker.on("error", (error) => {
      if (job.status === "cancelled") return;

      job.status = "failed";
      job.phase = "worker_error";
      job.progress = 100;
      job.error = {
        message: error?.message || "排课任务执行异常",
        details: null,
      };
      job.failedAt = nowIso();
      job.updatedAt = job.failedAt;
    });

    worker.on("exit", (code) => {
      delete job.worker;
      if (job.status === "cancelled") return;
      if (code !== 0 && !["completed", "failed"].includes(job.status)) {
        job.status = "failed";
        job.phase = "worker_exit";
        job.progress = 100;
        job.error = {
          message: `排课任务进程异常退出：${code}`,
          details: null,
        };
        job.failedAt = nowIso();
        job.updatedAt = job.failedAt;
      }
    });
  }, 0);

  return {
    job,
    reused: false,
  };
}

export async function cancelScheduleGenerationJob(jobId, actorAccount = null) {
  pruneScheduleJobs();
  const job = jobs.get(jobId) || null;
  if (!job) return { job: null, cancelled: false, reason: "missing" };
  if (!["queued", "running"].includes(job.status)) {
    return { job, cancelled: false, reason: "not_cancellable" };
  }

  if (job.startTimer) {
    clearTimeout(job.startTimer);
    delete job.startTimer;
  }

  const worker = job.worker || null;
  job.status = "cancelled";
  job.phase = "cancelled";
  job.progress = 100;
  job.message = "排课任务已取消";
  job.cancelledAt = nowIso();
  job.cancelledByAccountId = actorAccount?.id || "";
  job.updatedAt = job.cancelledAt;
  job.error = null;

  if (worker) {
    try {
      await worker.terminate();
    } catch (error) {
      job.error = {
        message: error?.message || "排课任务取消时终止 worker 失败",
        details: null,
      };
    }
  }

  return { job, cancelled: true, reason: "cancelled" };
}
