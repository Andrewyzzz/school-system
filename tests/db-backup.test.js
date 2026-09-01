// 备份与恢复（验收 7.9 / 7.10 / 7.11，2.23 / 3.26）
//
// 验收方式是「现场执行备份与恢复」，所以这里必须走完整条链：
// 真的 pg_dump → 真的把库毁掉 → 真的 pg_restore → 逐条比对数据回来了没有。
// 只断言「备份文件存在且大小不为零」是没有意义的——被截断的 dump 也有大小，
// 而它恢复不出来。一份恢复不了的备份比没有备份更糟：它给人虚假的安全感。
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import pg from "pg";
import {
  BACKUP_MANIFEST_SUFFIX,
  backupDatabase,
  encryptionKeyFingerprint,
  listBackups,
  pruneBackups,
  readManifest,
  restoreDatabase,
  verifyBackup,
} from "../server/db/backup.js";

const ADMIN_URL = process.env.TEST_ADMIN_URL || "postgresql://localhost:5432/postgres";
const SRC_DB = `school_backup_src_${process.pid}`;
const DST_DB = `school_backup_dst_${process.pid}`;
const SRC_URL = `postgresql://localhost:5432/${SRC_DB}`;
const DST_URL = `postgresql://localhost:5432/${DST_DB}`;

async function available() {
  const c = new pg.Client({ connectionString: ADMIN_URL });
  try {
    await c.connect();
    await c.end();
    return true;
  } catch {
    return false;
  }
}

if (!(await available())) {
  console.log("db backup checks skipped（本机无 PostgreSQL）");
  process.exit(0);
}

const admin = new pg.Client({ connectionString: ADMIN_URL });
await admin.connect();
for (const name of [SRC_DB, DST_DB]) {
  await admin.query(`DROP DATABASE IF EXISTS "${name}"`);
  await admin.query(`CREATE DATABASE "${name}"`);
}
await admin.end();

const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "school-backup-"));
let failure = null;
const clients = [];

try {
  const src = new pg.Client({ connectionString: SRC_URL });
  await src.connect();
  clients.push(src);

  // 造数据：教师、加密的工资单、审计日志
  await src.query(`CREATE TABLE "app_teachers" (id text PRIMARY KEY, seq bigint DEFAULT 0, data jsonb NOT NULL)`);
  await src.query(`CREATE TABLE "app_payrollDetails" (id text PRIMARY KEY, seq bigint DEFAULT 0, data jsonb NOT NULL)`);
  await src.query(`CREATE TABLE "app_auditLogs" (id text PRIMARY KEY, seq bigint DEFAULT 0, data jsonb NOT NULL)`);
  for (let i = 1; i <= 50; i += 1) {
    await src.query(`INSERT INTO "app_teachers" (id, data) VALUES ($1, $2)`, [
      `T${String(i).padStart(4, "0")}`,
      JSON.stringify({ id: `T${String(i).padStart(4, "0")}`, name: `教师${i}` }),
    ]);
  }
  await src.query(`INSERT INTO "app_payrollDetails" (id, data) VALUES ($1, $2)`, [
    "PD-1",
    JSON.stringify({ id: "PD-1", encryptedPayload: "v1:abc:def", month: "2026-06" }),
  ]);
  await src.query(`INSERT INTO "app_auditLogs" (id, data) VALUES ($1, $2)`, [
    "AUD-1",
    JSON.stringify({ id: "AUD-1", action: "payroll_lock" }),
  ]);

  // -------------------------------------------------------------------------
  // 1. 备份：文件、清单、可读性
  // -------------------------------------------------------------------------
  process.env.HR_ENCRYPTION_KEY = "0".repeat(64); // 64 位 hex
  const backup = await backupDatabase({
    connectionString: SRC_URL,
    outputDir: workDir,
    label: "test",
  });

  assert.ok(backup.bytes > 0, "备份文件不应为空");
  assert.match(backup.file, /\.dump$/);
  await fs.access(backup.manifestFile);

  const manifest = await readManifest(backup.file);
  assert.equal(manifest.database, SRC_DB);
  assert.equal(manifest.format, "pg_dump-custom");
  assert.ok(manifest.pgDumpVersion, "应记录 pg_dump 版本——跨版本恢复会失败，出问题时要能查");

  // 清单里只能有指纹，绝不能有密钥本身
  assert.equal(manifest.encryptionKeyFingerprint, encryptionKeyFingerprint("0".repeat(64)));
  const manifestText = await fs.readFile(backup.manifestFile, "utf-8");
  assert.ok(!manifestText.includes("0".repeat(64)), "清单里绝不能出现密钥明文");
  assert.equal(manifest.encryptionKeyFingerprint.length, 16);

  // 备份可读，且确实含三张表的数据
  const verified = await verifyBackup(backup.file);
  assert.equal(verified.ok, true, verified.error);
  assert.equal(verified.tableCount, 3, `应含 3 张表的数据，实际 ${verified.tableCount}`);

  // -------------------------------------------------------------------------
  // 2. 恢复到空库：数据必须逐条回来
  // -------------------------------------------------------------------------
  const restored = await restoreDatabase({ connectionString: DST_URL, file: backup.file });
  assert.equal(restored.tableCount, 3);

  const dst = new pg.Client({ connectionString: DST_URL });
  await dst.connect();
  clients.push(dst);

  const teacherCount = await dst.query(`SELECT count(*)::int n FROM "app_teachers"`);
  assert.equal(teacherCount.rows[0].n, 50, "50 位教师应全部恢复");

  const payroll = await dst.query(`SELECT data FROM "app_payrollDetails" WHERE id = 'PD-1'`);
  assert.equal(payroll.rows.length, 1, "工资单应恢复");
  assert.equal(payroll.rows[0].data.encryptedPayload, "v1:abc:def", "密文应原样恢复");

  const audit = await dst.query(`SELECT data FROM "app_auditLogs"`);
  assert.equal(audit.rows.length, 1);
  assert.equal(audit.rows[0].data.action, "payroll_lock");

  // 表名大小写要保住：app_payrollDetails 不加引号会被折叠成小写，
  // 恢复后应用会到处报「表不存在」
  const names = await dst.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`,
  );
  assert.ok(
    names.rows.some((r) => r.tablename === "app_payrollDetails"),
    `表名大小写应保持原样，实际：${names.rows.map((r) => r.tablename).join(", ")}`,
  );

  // -------------------------------------------------------------------------
  // 3. 恢复非空库必须先拦一道
  // -------------------------------------------------------------------------
  await assert.rejects(
    () => restoreDatabase({ connectionString: DST_URL, file: backup.file }),
    /已有 \d+ 张表/,
    "覆盖非空库必须要求显式确认——恢复不可逆，误操作会抹掉当天的数据",
  );
  // 显式确认后才允许
  const overwrite = await restoreDatabase({
    connectionString: DST_URL,
    file: backup.file,
    allowOverwrite: true,
  });
  assert.equal(overwrite.tableCount, 3);
  const afterOverwrite = await dst.query(`SELECT count(*)::int n FROM "app_teachers"`);
  assert.equal(afterOverwrite.rows[0].n, 50, "覆盖恢复后数据仍应完整");

  // -------------------------------------------------------------------------
  // 4. 密钥不匹配必须拦下
  //
  // 这是最容易被忽略、后果又最难挽回的一条：备份恢复到一台钥匙不同的机器上，
  // 数据库看着满满当当，工资单却一条都解不开。等财务发现时已经过去很久了。
  // -------------------------------------------------------------------------
  {
    const admin2 = new pg.Client({ connectionString: ADMIN_URL });
    await admin2.connect();
    await admin2.query(`DROP DATABASE IF EXISTS "${DST_DB}_k"`);
    await admin2.query(`CREATE DATABASE "${DST_DB}_k"`);
    await admin2.end();
    const kUrl = `postgresql://localhost:5432/${DST_DB}_k`;

    process.env.HR_ENCRYPTION_KEY = "f".repeat(64); // 换一把钥匙
    await assert.rejects(
      () => restoreDatabase({ connectionString: kUrl, file: backup.file }),
      /密钥|HR_ENCRYPTION_KEY/,
      "密钥不一致必须在恢复前拦下，而不是等财务打开工资单才发现",
    );

    // 完全没配密钥同样要拦
    delete process.env.HR_ENCRYPTION_KEY;
    await assert.rejects(
      () => restoreDatabase({ connectionString: kUrl, file: backup.file }),
      /HR_ENCRYPTION_KEY/,
      "备份含加密字段而当前环境没有密钥时，必须拦下",
    );

    // 确实知道自己在做什么时可以强制通过（例如只想恢复课表）
    process.env.HR_ENCRYPTION_KEY = "f".repeat(64);
    const forced = await restoreDatabase({
      connectionString: kUrl,
      file: backup.file,
      ignoreKeyMismatch: true,
    });
    assert.equal(forced.keyMismatch, true, "强制恢复时仍要如实报告密钥不匹配");

    const cleanup = new pg.Client({ connectionString: ADMIN_URL });
    await cleanup.connect();
    await cleanup
      .query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid<>pg_backend_pid()`, [
        `${DST_DB}_k`,
      ])
      .catch(() => {});
    await cleanup.query(`DROP DATABASE IF EXISTS "${DST_DB}_k"`).catch(() => {});
    await cleanup.end();
    process.env.HR_ENCRYPTION_KEY = "0".repeat(64);
  }

  // -------------------------------------------------------------------------
  // 5. 损坏的备份必须被识别，而不是恢复出半个库
  // -------------------------------------------------------------------------
  {
    const broken = path.join(workDir, "broken.dump");
    const good = await fs.readFile(backup.file);
    await fs.writeFile(broken, good.subarray(0, Math.floor(good.length / 3))); // 截断
    const check = await verifyBackup(broken);
    assert.equal(check.ok, false, "被截断的备份必须被判为不可用——它有大小，但恢复不出来");

    await assert.rejects(
      () => restoreDatabase({ connectionString: DST_URL, file: broken, allowOverwrite: true }),
      /备份文件不可用/,
      "损坏的备份不能拿去恢复，否则会把好库覆盖成半个",
    );
    // 好库没被动过
    const still = await dst.query(`SELECT count(*)::int n FROM "app_teachers"`);
    assert.equal(still.rows[0].n, 50, "失败的恢复不能破坏目标库");
  }

  // -------------------------------------------------------------------------
  // 6. 保留策略与清单
  // -------------------------------------------------------------------------
  {
    for (let i = 0; i < 4; i += 1) {
      await backupDatabase({
        connectionString: SRC_URL,
        outputDir: workDir,
        now: new Date(Date.UTC(2026, 0, i + 1)),
      });
    }
    const before = await listBackups(workDir);
    assert.ok(before.length >= 5, `应有多份备份，实际 ${before.length}`);
    assert.ok(before[0].manifest, "列表应带出清单信息");

    const removed = await pruneBackups(workDir, 2);
    assert.equal(removed.length, before.length - 2, "应只保留最近 2 份");
    const after = await listBackups(workDir);
    assert.equal(after.length, 2);

    // 清单文件要跟着删，不能留下一堆孤儿 manifest
    const leftovers = (await fs.readdir(workDir)).filter((n) => n.endsWith(BACKUP_MANIFEST_SUFFIX));
    assert.equal(leftovers.length, 2, "清单应与备份文件同进同退");

    // 保留的必须是最新的那几份
    assert.ok(
      after.every((b) => before.slice(0, 2).some((x) => x.name === b.name)),
      "保留的应是最新的备份，不能把新的删了留旧的",
    );
  }
} catch (error) {
  failure = error;
} finally {
  for (const c of clients) await c.end().catch(() => {});
  await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  const cleanup = new pg.Client({ connectionString: ADMIN_URL });
  await cleanup.connect();
  for (const name of [SRC_DB, DST_DB]) {
    await cleanup
      .query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid<>pg_backend_pid()`, [name])
      .catch(() => {});
    await cleanup.query(`DROP DATABASE IF EXISTS "${name}"`).catch((e) => {
      console.warn(`[cleanup] 临时库 ${name} 未能删除：${e.message}`);
    });
  }
  await cleanup.end();
}

if (failure) throw failure;
console.log("db backup checks passed");
