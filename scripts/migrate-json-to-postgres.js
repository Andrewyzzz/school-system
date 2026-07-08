// JSON 数据文件 → PostgreSQL 一次性迁移脚本（第二阶段 M1）。
//
// 用法：
//   node scripts/migrate-json-to-postgres.js            # 试跑：只做核对，不写库
//   node scripts/migrate-json-to-postgres.js --commit   # 正式迁移：清库 → 导入 → 核对
//
// 连接串来自 DATABASE_URL / PG_CONNECTION_STRING，默认 postgresql://localhost:5432/school_system_dev。
// 迁移窗口操作顺序（见 docs/database-migration-plan.md）：
//   1) 停服 → 2) --commit 迁移并确认核对报告全绿 → 3) DB_DRIVER=dual 起服双写观察 →
//   4) 核对稳定后切 DB_DRIVER=postgres → 5) JSON 文件保留为回滚兜底。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  closePostgresPool,
  diffDatabaseAgainstPostgres,
  persistDatabaseToPostgres,
  postgresConnectionString,
  postgresPing,
  resetPostgresStore,
} from "../server/db/postgresStore.js";

const DATA_FILE = path.join(fileURLToPath(new URL("../server/data", import.meta.url)), "phase1-db.json");
const COMMIT = process.argv.includes("--commit");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

console.log(`目标数据库: ${postgresConnectionString()}`);
console.log(`模式: ${COMMIT ? "正式迁移（--commit）" : "试跑（不写库，加 --commit 执行）"}`);

if (!(await postgresPing())) fail("PostgreSQL 不可达");

let raw;
try {
  raw = await fs.readFile(DATA_FILE, "utf-8");
} catch {
  fail(`JSON 数据文件不存在: ${DATA_FILE}`);
}
const db = JSON.parse(raw);

const collections = Object.entries(db).filter(([, value]) => Array.isArray(value));
const totalRows = collections.reduce((sum, [, rows]) => sum + rows.length, 0);
console.log(`\n源数据概览：${collections.length} 个集合，共 ${totalRows} 行`);
collections
  .filter(([, rows]) => rows.length)
  .forEach(([key, rows]) => console.log(`  - ${key}: ${rows.length}`));

if (COMMIT) {
  console.log("\n清空目标库并导入 ...");
  await resetPostgresStore();
  const startedAt = Date.now();
  const stats = await persistDatabaseToPostgres(db);
  console.log(`导入完成：${stats.upserts} 行，耗时 ${Date.now() - startedAt}ms`);
}

console.log("\n===== 核对报告 =====");
const report = await diffDatabaseAgainstPostgres(db);
let allGreen = true;
Object.entries(report.collections).forEach(([key, item]) => {
  const ok = item.memoryCount === item.dbCount && !item.mismatched && !item.onlyInDb;
  if (!ok) allGreen = false;
  console.log(
    `${ok ? "✓" : "✗"} ${key}: 源 ${item.memoryCount} / 库 ${item.dbCount}` +
      (item.mismatched ? ` 内容不一致 ${item.mismatched}` : "") +
      (item.onlyInDb ? ` 库中多出 ${item.onlyInDb}` : ""),
  );
});
Object.entries(report.singletons).forEach(([key, status]) => {
  if (status !== "match") allGreen = false;
  console.log(`${status === "match" ? "✓" : "✗"} 单例 ${key}: ${status}`);
});

await closePostgresPool();

if (COMMIT && !allGreen) fail("迁移后核对存在差异，请勿切换驱动，检查后重试");
if (!COMMIT) {
  console.log(allGreen ? "\n库内数据与 JSON 文件一致。" : "\n库内数据与 JSON 文件存在差异（试跑模式未写库）。");
}
console.log(COMMIT && allGreen ? "\n✓ 迁移完成且核对全绿，可进入双写观察（DB_DRIVER=dual）。" : "");
