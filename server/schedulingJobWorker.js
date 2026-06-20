import { parentPort, workerData } from "node:worker_threads";
import { generateScheduleDraft } from "./scheduling.js";

function serializeError(error) {
  return {
    message: error?.message || "排课任务执行失败",
    statusCode: error?.statusCode || 500,
    details: error?.details || null,
    stack: error?.stack || "",
  };
}

try {
  const db = workerData.db;
  const initialAuditLogCount = db.auditLogs?.length || 0;
  parentPort.postMessage({
    type: "progress",
    phase: "solving",
    progress: 18,
    message: "正在执行排课求解",
  });

  const result = generateScheduleDraft(db, workerData.options, workerData.account);

  parentPort.postMessage({
    type: "completed",
    result,
    auditLogs: (db.auditLogs || []).slice(initialAuditLogCount),
    metaUpdatedAt: db.meta?.updatedAt || new Date().toISOString(),
  });
} catch (error) {
  parentPort.postMessage({
    type: "failed",
    error: serializeError(error),
  });
}
