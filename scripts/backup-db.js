#!/usr/bin/env node
// 一键备份（验收 7.9 / 7.10，2.23 / 3.26）。
//
//   node scripts/backup-db.js                  备份到 backups/
//   node scripts/backup-db.js --list           列出现有备份
//   node scripts/backup-db.js --keep 30        保留最近 30 份（默认 14）
//   node scripts/backup-db.js --verify <文件>  只校验某份备份能不能恢复
//
// 定时备份把这条命令挂进 crontab 即可（Linux）：
//   0 2 * * *  cd /opt/school-system && /usr/bin/node scripts/backup-db.js >> /var/log/school-backup.log 2>&1
//
// 备份文件里的工资与人事字段是密文。**HR_ENCRYPTION_KEY 必须与数据库分开保管**：
// 密钥和备份放在同一台机器上，等于加密没做——拿到备份的人同时拿到了钥匙。
import path from "node:path";
import { fileURLToPath } from "node:url";
import { backupDatabase, listBackups, pruneBackups, verifyBackup } from "../server/db/backup.js";

const CONN =
  process.env.DATABASE_URL ||
  process.env.PG_CONNECTION_STRING ||
  "postgresql://localhost:5432/school_system_dev";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT_DIR = process.env.BACKUP_DIR || path.join(ROOT, "backups");

const args = process.argv.slice(2);
const keepArg = args.indexOf("--keep");
const KEEP = keepArg >= 0 ? Number(args[keepArg + 1]) || 14 : 14;

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

if (args.includes("--list")) {
  const items = await listBackups(OUT_DIR);
  if (!items.length) {
    console.log(`${OUT_DIR} 下没有备份。`);
    process.exit(0);
  }
  console.log(`${OUT_DIR}（共 ${items.length} 份，最新在前）：`);
  items.forEach((b) => {
    const m = b.manifest;
    console.log(
      `  ${b.name}  ${mb(b.bytes).padStart(10)}  ${m?.createdAt || "?"}  密钥指纹 ${m?.encryptionKeyFingerprint || "（未加密）"}`,
    );
  });
  process.exit(0);
}

const verifyArg = args.indexOf("--verify");
if (verifyArg >= 0) {
  const file = args[verifyArg + 1];
  if (!file) {
    console.error("请指定要校验的备份文件");
    process.exit(1);
  }
  const result = await verifyBackup(file);
  console.log(result.ok ? `✓ 备份可用，含 ${result.tableCount} 张表的数据` : `✗ 备份不可用：${result.error}`);
  process.exit(result.ok ? 0 : 1);
}

console.log(`数据库：${CONN.replace(/:[^:@/]*@/, ":****@")}`);
console.log(`输出目录：${OUT_DIR}`);
if (!process.env.HR_ENCRYPTION_KEY) {
  console.warn("  ⚠ 未配置 HR_ENCRYPTION_KEY：本次备份中的工资与人事字段可能是明文");
}
console.log("");

const result = await backupDatabase({ connectionString: CONN, outputDir: OUT_DIR });
console.log(`✓ 已备份 ${path.basename(result.file)}（${mb(result.bytes)}，${(result.durationMs / 1000).toFixed(1)}s）`);

// 备份完立刻校验一次。不校验的备份等于薛定谔的备份——
// 只有真要恢复的那天才知道它行不行，而那天已经没有退路了。
const verified = await verifyBackup(result.file);
if (!verified.ok) {
  console.error(`✗ 备份校验失败：${verified.error}`);
  process.exit(1);
}
console.log(`✓ 校验通过，含 ${verified.tableCount} 张表的数据`);

const removed = await pruneBackups(OUT_DIR, KEEP);
if (removed.length) console.log(`已清理 ${removed.length} 份过期备份（保留最近 ${KEEP} 份）`);

console.log("");
console.log("恢复命令：");
console.log(`  node scripts/restore-db.js ${path.basename(result.file)}`);
