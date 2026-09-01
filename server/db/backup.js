// 数据库备份与恢复（验收 7.9 / 7.10 / 7.11，以及 2.23 / 3.26 定期备份）
//
// 一条容易被忽略但足以让整份备份作废的事：**工资金额、身份证、银行卡是加密
// 落库的**。把数据库备份恢复到一台没有同一把 HR_ENCRYPTION_KEY 的机器上，
// 拿到的是一库读不出来的密文——备份看起来完好，实际等于没有。
// 所以备份文件旁边要记一份密钥指纹（只记指纹，不记密钥），恢复时比对；
// 对不上就当场报出来，而不是等财务打开工资单才发现。
//
// 备份格式用 pg_dump 的 custom（-Fc）：自带压缩、可并行恢复、可选择性恢复
// 单表。纯 SQL 文本在几百 MB 后恢复会慢到无法接受。

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

export const BACKUP_MANIFEST_SUFFIX = ".manifest.json";

/**
 * 密钥指纹：HMAC 截断，用于判断「是不是同一把钥匙」。
 * 不能直接存密钥的散列——那等于给离线爆破一个靶子；加固定盐并截断到 16 位，
 * 足够区分不同密钥，又无法反推。
 */
export function encryptionKeyFingerprint(key = process.env.HR_ENCRYPTION_KEY || "") {
  if (!key) return "";
  return createHash("sha256").update(`school-system-key-fingerprint:${key}`).digest("hex").slice(0, 16);
}

export function backupFileName(now, label = "") {
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  return `school-${stamp}${label ? `-${label}` : ""}.dump`;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...(options.env || {}) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (error) => resolve({ code: -1, stdout, stderr: error.message }));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

/** 从连接串里拆出 pg 工具要的参数，并把口令放进环境变量（命令行会进 ps） */
export function connectionArgs(connectionString) {
  const url = new URL(connectionString);
  const args = [];
  if (url.hostname) args.push("-h", url.hostname);
  if (url.port) args.push("-p", url.port);
  if (url.username) args.push("-U", decodeURIComponent(url.username));
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  const env = {};
  if (url.password) env.PGPASSWORD = decodeURIComponent(url.password);
  return { args, database, env, host: url.hostname || "localhost" };
}

/**
 * 全量备份。
 * 返回 { file, manifestFile, bytes, durationMs, manifest }。
 */
export async function backupDatabase(options = {}) {
  const {
    connectionString,
    outputDir,
    label = "",
    now = new Date(),
    pgDumpBin = process.env.PG_DUMP_BIN || "pg_dump",
  } = options;

  await fs.mkdir(outputDir, { recursive: true });
  const { args, database, env } = connectionArgs(connectionString);
  const file = path.join(outputDir, backupFileName(now, label));

  const started = Date.now();
  const result = await runCommand(
    pgDumpBin,
    [...args, "-d", database, "-Fc", "--no-owner", "--no-acl", "-f", file],
    { env },
  );
  if (result.code !== 0) {
    throw new Error(`pg_dump 失败（退出码 ${result.code}）：${result.stderr.trim() || "无输出"}`);
  }

  const stat = await fs.stat(file);
  if (stat.size === 0) {
    // 空文件是最恶劣的情况：脚本报成功、监控看到文件、真要恢复时才发现是空的
    await fs.unlink(file).catch(() => {});
    throw new Error("备份文件为空，已删除。请检查数据库连接与权限。");
  }

  // 附件是文件，不在数据库里，pg_dump 拿不到。不一起备份的话，
  // 「已备份」就是假话：恢复回来数据库里有附件记录，磁盘上一个文件都没有。
  const attachments = await backupAttachments(options, file);

  const manifest = {
    file: path.basename(file),
    database,
    createdAt: now.toISOString(),
    bytes: stat.size,
    format: "pg_dump-custom",
    attachments,
    // 恢复到别的机器时用它判断密钥对不对
    encryptionKeyFingerprint: encryptionKeyFingerprint(),
    encryptionConfigured: Boolean(process.env.HR_ENCRYPTION_KEY),
    pgDumpVersion: (await runCommand(pgDumpBin, ["--version"])).stdout.trim(),
  };
  const manifestFile = `${file}${BACKUP_MANIFEST_SUFFIX}`;
  await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

  return { file, manifestFile, bytes: stat.size, durationMs: Date.now() - started, manifest };
}

/**
 * 把附件目录打成 tar 放在 dump 旁边。
 * 用 tar 而不是逐文件复制：几千个小文件逐个 copy 慢，且中途失败会留下半份。
 */
async function backupAttachments(options, dumpFile) {
  const dir = options.attachmentDir || process.env.ATTACHMENT_DIR || "";
  if (!dir) return { included: false, reason: "未配置附件目录" };

  const entries = await fs.readdir(dir).catch(() => null);
  if (entries === null) return { included: false, reason: "附件目录不存在" };
  if (entries.length === 0) return { included: true, files: 0, file: "" };

  const target = `${dumpFile}.attachments.tar`;
  const result = await runCommand("tar", ["-cf", target, "-C", dir, "."]);
  if (result.code !== 0) {
    // 附件打包失败不能当作没事发生：数据库备份看着成功，
    // 恢复时才发现附件全没了，那时已经晚了
    throw new Error(`附件打包失败：${result.stderr.trim() || "tar 返回非零"}`);
  }
  const stat = await fs.stat(target);
  const count = await countFiles(dir);
  return { included: true, files: count, file: path.basename(target), bytes: stat.size };
}

async function countFiles(dir) {
  let n = 0;
  const walk = async (current) => {
    const entries = await fs.readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.isDirectory()) await walk(path.join(current, entry.name));
      else n += 1;
    }
  };
  await walk(dir);
  return n;
}

/** 恢复附件：与数据库恢复配套，缺一不可 */
export async function restoreAttachments(dumpFile, targetDir) {
  const tarFile = `${dumpFile}.attachments.tar`;
  try {
    await fs.access(tarFile);
  } catch {
    return { restored: false, reason: "该备份不含附件" };
  }
  await fs.mkdir(targetDir, { recursive: true });
  const result = await runCommand("tar", ["-xf", tarFile, "-C", targetDir]);
  if (result.code !== 0) throw new Error(`附件恢复失败：${result.stderr.trim()}`);
  return { restored: true, files: await countFiles(targetDir), directory: targetDir };
}

/**
 * 校验备份可读，并报告里面有哪些表、各多少行。
 * 只看文件存在、大小不为零是不够的——被截断的 dump 也有大小。
 */
export async function verifyBackup(file, options = {}) {
  const { pgRestoreBin = process.env.PG_RESTORE_BIN || "pg_restore" } = options;
  const result = await runCommand(pgRestoreBin, ["-l", file]);
  if (result.code !== 0) {
    return { ok: false, error: result.stderr.trim() || "pg_restore -l 失败", tableCount: 0 };
  }
  const tables = result.stdout
    .split("\n")
    .filter((line) => / TABLE DATA /.test(line))
    .map((line) => line.trim().split(/\s+/).pop());
  return { ok: tables.length > 0, tableCount: tables.length, tables, error: tables.length ? "" : "备份中没有任何表数据" };
}

export async function readManifest(file) {
  try {
    return JSON.parse(await fs.readFile(`${file}${BACKUP_MANIFEST_SUFFIX}`, "utf-8"));
  } catch {
    return null;
  }
}

/**
 * 恢复。默认拒绝覆盖非空库——恢复是不可逆的，误操作会把当天的数据抹掉。
 * 调用方必须显式 allowOverwrite。
 */
export async function restoreDatabase(options = {}) {
  const {
    connectionString,
    file,
    allowOverwrite = false,
    ignoreKeyMismatch = false,
    pgRestoreBin = process.env.PG_RESTORE_BIN || "pg_restore",
  } = options;

  const verify = await verifyBackup(file, options);
  if (!verify.ok) throw new Error(`备份文件不可用：${verify.error}`);

  const manifest = await readManifest(file);
  const currentFingerprint = encryptionKeyFingerprint();
  const keyMismatch =
    manifest?.encryptionKeyFingerprint &&
    currentFingerprint &&
    manifest.encryptionKeyFingerprint !== currentFingerprint;
  const keyMissing = manifest?.encryptionConfigured && !currentFingerprint;

  if ((keyMismatch || keyMissing) && !ignoreKeyMismatch) {
    throw new Error(
      keyMissing
        ? "该备份中的工资与人事字段是加密的，但当前环境没有配置 HR_ENCRYPTION_KEY，恢复后将无法读取。请先配置密钥。"
        : "当前 HR_ENCRYPTION_KEY 与备份时不一致，恢复后工资与人事字段将无法解密。请确认密钥，或明确要求忽略此检查。",
    );
  }

  const { args, database, env } = connectionArgs(connectionString);

  // 恢复前先看目标库是否为空
  const probe = await runCommand(
    "psql",
    [...args, "-d", database, "-tAc", `SELECT count(*) FROM pg_tables WHERE schemaname='public'`],
    { env },
  );
  const existingTables = Number(String(probe.stdout).trim()) || 0;
  if (existingTables > 0 && !allowOverwrite) {
    throw new Error(
      `目标库 ${database} 中已有 ${existingTables} 张表。恢复会覆盖现有数据，请显式确认（--force），并先做一次当前状态的备份。`,
    );
  }

  const started = Date.now();
  const result = await runCommand(
    pgRestoreBin,
    [...args, "-d", database, "--clean", "--if-exists", "--no-owner", "--no-acl", file],
    { env },
  );
  // pg_restore 对「DROP 一个不存在的对象」之类会给非零退出码但实际成功，
  // 所以不能只看退出码，要看有没有真正的错误行。
  const realErrors = result.stderr
    .split("\n")
    .filter((line) => /^pg_restore: error:/.test(line))
    .filter((line) => !/does not exist/.test(line));
  if (realErrors.length) {
    throw new Error(`恢复失败：\n${realErrors.slice(0, 5).join("\n")}`);
  }

  return {
    database,
    file,
    durationMs: Date.now() - started,
    tableCount: verify.tableCount,
    keyMismatch: Boolean(keyMismatch),
    warnings: result.stderr
      .split("\n")
      .filter((l) => /warning/i.test(l))
      .slice(0, 5),
  };
}

/** 清理过期备份，返回被删除的文件名。保留最近 keep 份。 */
export async function pruneBackups(outputDir, keep = 14) {
  const entries = await fs.readdir(outputDir).catch(() => []);
  const dumps = entries.filter((n) => n.endsWith(".dump")).sort();
  const removable = dumps.slice(0, Math.max(0, dumps.length - keep));
  for (const name of removable) {
    await fs.unlink(path.join(outputDir, name)).catch(() => {});
    await fs.unlink(path.join(outputDir, `${name}${BACKUP_MANIFEST_SUFFIX}`)).catch(() => {});
    await fs.unlink(path.join(outputDir, `${name}.attachments.tar`)).catch(() => {});
  }
  return removable;
}

/** 列出可用备份，最新在前 */
export async function listBackups(outputDir) {
  const entries = await fs.readdir(outputDir).catch(() => []);
  const dumps = entries.filter((n) => n.endsWith(".dump")).sort().reverse();
  const out = [];
  for (const name of dumps) {
    const file = path.join(outputDir, name);
    const stat = await fs.stat(file).catch(() => null);
    if (!stat) continue;
    out.push({ name, file, bytes: stat.size, manifest: await readManifest(file) });
  }
  return out;
}
