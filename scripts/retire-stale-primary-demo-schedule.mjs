import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 2026-07 的小学一年级演示排课。它不是本次导入的真实小学任课关系：
// 10 个一年级班被排入物理、化学等演示科目。此脚本刻意只处理这一条
// 可复核的草稿及其 1 个版本、200 个课次；不触碰人员、班级、校历、工资、
// 审批、任课关系或任何其他学期的数据。
export const STALE_PRIMARY_DEMO_DRAFT_ID = "DRAFT-TERM-2026-PHASE1:elementary:elementary-g1-1783428373646";
export const STALE_PRIMARY_DEMO_VERSION_ID = "SVER-TERM-2026-PHASE1:elementary:elementary-g1-1783428374037";
const EXPECTED_ASSIGNMENT_COUNT = 200;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function targetDrafts(db) {
  return asArray(db.scheduleDrafts).filter((draft) => draft.id === STALE_PRIMARY_DEMO_DRAFT_ID);
}

export function inspectStalePrimaryDemoSchedule(db) {
  const drafts = targetDrafts(db);
  const targetVersionIds = new Set(
    asArray(db.scheduleVersions)
      .filter((version) => version.draftId === STALE_PRIMARY_DEMO_DRAFT_ID)
      .map((version) => version.id),
  );
  const lessons = asArray(db.lessonInstances).filter(
    (lesson) =>
      lesson.schedulingDraftId === STALE_PRIMARY_DEMO_DRAFT_ID ||
      targetVersionIds.has(lesson.scheduleVersionId),
  );
  const changeRequests = asArray(db.scheduleChangeRequests).filter(
    (request) =>
      request.draftId === STALE_PRIMARY_DEMO_DRAFT_ID ||
      request.schedulingDraftId === STALE_PRIMARY_DEMO_DRAFT_ID ||
      targetVersionIds.has(request.scheduleVersionId),
  );
  return {
    draftCount: drafts.length,
    drafts: drafts.map((draft) => ({
      id: draft.id,
      status: draft.status,
      termId: draft.termId,
      divisionId: draft.divisionId,
      gradeId: draft.gradeId,
      assignmentCount: asArray(draft.assignments).length,
    })),
    versionIds: [...targetVersionIds],
    lessonCount: lessons.length,
    changeRequestCount: changeRequests.length,
  };
}

function assertExpectedLegacyDemoOnly(db, report) {
  const [draft] = targetDrafts(db);
  if (report.draftCount !== 1 || !draft) {
    throw new Error(`安全检查未通过：预期仅找到 1 条目标旧草稿，实际为 ${report.draftCount} 条；未执行清理。`);
  }
  if (
    draft.status !== "published" ||
    draft.termId !== "TERM-2026-PHASE1" ||
    draft.divisionId !== "elementary" ||
    draft.gradeId !== "elementary-g1" ||
    asArray(draft.assignments).length !== EXPECTED_ASSIGNMENT_COUNT
  ) {
    throw new Error("安全检查未通过：目标草稿的学期、范围或课次数量与已确认的旧演示数据不一致；未执行清理。");
  }
  if (report.versionIds.length !== 1 || report.versionIds[0] !== STALE_PRIMARY_DEMO_VERSION_ID) {
    throw new Error("安全检查未通过：关联课表版本与已确认的旧演示版本不一致；未执行清理。");
  }
  if (report.lessonCount !== EXPECTED_ASSIGNMENT_COUNT) {
    throw new Error(`安全检查未通过：预期 ${EXPECTED_ASSIGNMENT_COUNT} 条旧演示课次，实际为 ${report.lessonCount} 条；未执行清理。`);
  }
  if (report.changeRequestCount > 0) {
    throw new Error("安全检查未通过：旧演示课表存在调课申请，需人工复核；未执行清理。");
  }
}

export function retireStalePrimaryDemoSchedule(db, now = new Date().toISOString()) {
  const before = inspectStalePrimaryDemoSchedule(db);
  assertExpectedLegacyDemoOnly(db, before);
  const targetVersionIds = new Set(before.versionIds);

  db.scheduleDrafts = asArray(db.scheduleDrafts).filter((draft) => draft.id !== STALE_PRIMARY_DEMO_DRAFT_ID);
  db.scheduleVersions = asArray(db.scheduleVersions).filter((version) => !targetVersionIds.has(version.id));
  db.lessonInstances = asArray(db.lessonInstances).filter(
    (lesson) =>
      lesson.schedulingDraftId !== STALE_PRIMARY_DEMO_DRAFT_ID &&
      !targetVersionIds.has(lesson.scheduleVersionId),
  );
  if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
  db.auditLogs.push({
    id: `AUDIT-SCHEDULE-CLEANUP-${Date.now()}`,
    action: "schedule_cleanup_retire_stale_primary_demo",
    draftId: STALE_PRIMARY_DEMO_DRAFT_ID,
    scheduleVersionIds: [...targetVersionIds],
    removedAssignmentCount: EXPECTED_ASSIGNMENT_COUNT,
    removedLessonCount: before.lessonCount,
    createdAt: now,
  });
  if (!db.meta || typeof db.meta !== "object") db.meta = {};
  db.meta.updatedAt = now;

  return {
    ...before,
    removedDraftCount: 1,
    removedVersionCount: targetVersionIds.size,
    removedLessonCount: before.lessonCount,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dbPath = args.find((arg) => !arg.startsWith("--"));
  const apply = args.includes("--apply");
  if (!dbPath) {
    throw new Error("用法：node scripts/retire-stale-primary-demo-schedule.mjs <数据库 JSON 路径> [--apply]");
  }
  const resolvedDbPath = path.resolve(dbPath);
  const db = JSON.parse(await fs.readFile(resolvedDbPath, "utf8"));
  const report = inspectStalePrimaryDemoSchedule(db);
  if (!apply) {
    console.log(JSON.stringify({ mode: "dry-run", ...report }, null, 2));
    return;
  }

  assertExpectedLegacyDemoOnly(db, report);
  const backupDir = path.join(path.dirname(resolvedDbPath), "backups");
  const backupPath = path.join(backupDir, "phase1-db-before-stale-primary-demo-cleanup-2026-09-15.json");
  await fs.mkdir(backupDir, { recursive: true });
  try {
    await fs.access(backupPath);
    throw new Error(`安全检查未通过：备份已存在 ${backupPath}；为避免覆盖，未执行清理。`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  await fs.copyFile(resolvedDbPath, backupPath, fs.constants.COPYFILE_EXCL);
  const result = retireStalePrimaryDemoSchedule(db);
  const temporaryPath = `${resolvedDbPath}.cleanup-tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  await fs.rename(temporaryPath, resolvedDbPath);
  console.log(JSON.stringify({ mode: "applied", backupPath, ...result }, null, 2));
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}
