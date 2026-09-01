#!/usr/bin/env node
// 一键恢复（验收 7.10 / 7.11）。
//
//   node scripts/restore-db.js                       从最近一份备份恢复
//   node scripts/restore-db.js <文件名>              指定备份
//   node scripts/restore-db.js <文件名> --force      覆盖非空库
//   node scripts/restore-db.js <文件名> --ignore-key 忽略密钥不匹配（工资将无法解密）
//
// 恢复前会先把当前状态另存一份。恢复是不可逆的，而「恢复错了想退回去」
// 是真实会发生的事——多花一分钟备份，好过丢一天的数据。
import path from "node:path";
import { fileURLToPath } from "node:url";
import { backupDatabase, listBackups, readManifest, restoreDatabase } from "../server/db/backup.js";

const CONN =
  process.env.DATABASE_URL ||
  process.env.PG_CONNECTION_STRING ||
  "postgresql://localhost:5432/school_system_dev";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT_DIR = process.env.BACKUP_DIR || path.join(ROOT, "backups");

const args = process.argv.slice(2);
const force = args.includes("--force");
const ignoreKey = args.includes("--ignore-key");
const skipSafety = args.includes("--no-safety-backup");
const named = args.find((a) => !a.startsWith("--"));

const items = await listBackups(OUT_DIR);
if (!items.length) {
  console.error(`${OUT_DIR} 下没有可用备份。`);
  process.exit(1);
}
const chosen = named ? items.find((b) => b.name === named || b.file === named) : items[0];
if (!chosen) {
  console.error(`找不到备份 ${named}。可用：`);
  items.slice(0, 10).forEach((b) => console.error(`  ${b.name}`));
  process.exit(1);
}

const manifest = await readManifest(chosen.file);
console.log(`目标库：${CONN.replace(/:[^:@/]*@/, ":****@")}`);
console.log(`备份文件：${chosen.name}`);
console.log(`备份时间：${manifest?.createdAt || "未知"}`);
console.log(`备份来源库：${manifest?.database || "未知"}`);
console.log("");

if (!skipSafety) {
  try {
    const safety = await backupDatabase({
      connectionString: CONN,
      outputDir: OUT_DIR,
      label: "before-restore",
    });
    console.log(`已先备份当前状态：${path.basename(safety.file)}`);
  } catch (error) {
    // 目标库是空的时候备份会失败，那是正常的，不该因此拦住恢复
    console.log(`（当前状态未备份：${error.message}）`);
  }
  console.log("");
}

try {
  const result = await restoreDatabase({
    connectionString: CONN,
    file: chosen.file,
    allowOverwrite: force,
    ignoreKeyMismatch: ignoreKey,
  });
  console.log(`✓ 已恢复 ${result.tableCount} 张表（${(result.durationMs / 1000).toFixed(1)}s）`);
  if (result.keyMismatch) {
    console.warn("  ⚠ 密钥与备份时不一致：工资与人事的加密字段将无法解密");
  }
  console.log("");
  console.log("恢复后请执行：");
  console.log("  node scripts/provision-db-roles.js    重新配置数据库账号权限（恢复会覆盖 GRANT）");
  console.log("  npm run check                          确认应用可正常启动");
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
