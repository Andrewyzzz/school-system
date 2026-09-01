// 证件附件上传与存储（验收 1.5）
//
// 验收方式是「现场上传一份证件并重新下载查看」，所以上传与下载都要真的能用。
//
// 三个设计取舍：
//
// 1. **文件落磁盘，不落数据库**。1000 名教师 × 4 类证件 × 约 1 MB ≈ 4 GB，
//    塞进 JSONB 会让每次全量加载都背上这个包袱。代价是 pg_dump 备份不含它们——
//    这一点必须在备份侧补上，否则「有备份」就成了假话（见 backupAttachments）。
//
// 2. **加密落盘**。附件里是身份证照片、银行卡正面，敏感程度不低于已经加密的
//    身份证号本身。只做目录权限的话，任何能读到磁盘的人（含拿到备份的人）
//    都能直接看图。用同一把 HR_ENCRYPTION_KEY，密钥管理不额外增加负担。
//
// 3. **文件名不参与路径**。存储名由内容哈希生成，原始文件名只作为元数据存在
//    数据库里。用用户提供的文件名拼路径，就是在给路径穿越开门——
//    一个叫 `../../server/data/phase1-db.json` 的上传能覆盖整个数据库。

import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decryptPii, encryptPii, piiEncryptionReady } from "./security/pii.js";

const DEFAULT_DIR = fileURLToPath(new URL("./data/attachments", import.meta.url));

export const MAX_ATTACHMENT_BYTES = Number(process.env.MAX_ATTACHMENT_BYTES || 10 * 1024 * 1024);

// 只收证件扫描件常见的三类。放开 zip/doc 等于允许上传可执行内容，
// 而学校的证件材料从来不需要那些格式。
export const ALLOWED_ATTACHMENT_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
};

export const ATTACHMENT_CATEGORIES = [
  { value: "idCard", label: "身份证" },
  { value: "diploma", label: "学历证书" },
  { value: "degree", label: "学位证书" },
  { value: "teacherLicense", label: "教师资格证" },
  { value: "titleCert", label: "职称证书" },
  { value: "contract", label: "劳动合同" },
  { value: "medical", label: "体检报告" },
  { value: "other", label: "其他" },
];

export function attachmentDir() {
  return process.env.ATTACHMENT_DIR || DEFAULT_DIR;
}

export function categoryLabel(value) {
  return ATTACHMENT_CATEGORIES.find((c) => c.value === value)?.label || value || "";
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * 按内容嗅探真实类型。
 * 只信 Content-Type 是不够的——它由客户端提供，改成 image/png 就能把
 * 任意文件传进来。魔数是文件自己带的。
 */
export function sniffMimeType(buffer) {
  if (buffer.length < 8) return "";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer.slice(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  return "";
}

export function ensureAttachments(db) {
  if (!Array.isArray(db.hrAttachments)) db.hrAttachments = [];
  return db.hrAttachments;
}

function storageKeyFor(sha256, ext) {
  // 用哈希前两位分目录：同一目录下几千个文件会让 ls 和备份都变慢
  return path.join(sha256.slice(0, 2), `${sha256}${ext}`);
}

/**
 * 保存一个附件。
 * 返回写入的元数据记录（不含文件内容）。
 */
export async function saveAttachment(db, options = {}) {
  const { employeeId, category = "other", filename = "", contentType = "", data, actorAccount = null } = options;

  if (!Buffer.isBuffer(data) || data.length === 0) throw httpError(400, "文件内容为空");
  if (data.length > MAX_ATTACHMENT_BYTES) {
    throw httpError(413, `文件过大，上限 ${MAX_ATTACHMENT_BYTES / 1024 / 1024} MB`);
  }
  if (!ATTACHMENT_CATEGORIES.some((c) => c.value === category)) {
    throw httpError(400, `证件类型无效：${category}`);
  }

  // 声明的类型与实际内容都要过关：只看声明能被伪造，只看内容会把
  // 一个正常的 PDF 因为客户端填了 application/octet-stream 而拒掉
  const sniffed = sniffMimeType(data);
  if (!sniffed) {
    throw httpError(400, "只支持 JPG、PNG、PDF 三种格式的证件扫描件");
  }
  if (contentType && ALLOWED_ATTACHMENT_TYPES[contentType] && contentType !== sniffed) {
    throw httpError(400, `文件内容与声明的类型不符（声明 ${contentType}，实际 ${sniffed}）`);
  }

  if (!piiEncryptionReady()) {
    // 宁可拒绝上传，也不能把身份证照片明文写进磁盘
    throw httpError(503, "未配置 HR_ENCRYPTION_KEY，拒绝以明文保存证件附件");
  }

  const sha256 = createHash("sha256").update(data).digest("hex");
  const list = ensureAttachments(db);

  // 同一员工同一类型重复上传同一份文件：不再存一遍，直接返回已有记录
  const duplicate = list.find(
    (item) => item.employeeId === employeeId && item.category === category && item.sha256 === sha256 && !item.deletedAt,
  );
  if (duplicate) return { ...duplicate, duplicated: true };

  const ext = ALLOWED_ATTACHMENT_TYPES[sniffed];
  const storageKey = storageKeyFor(sha256, ext);
  const target = path.join(attachmentDir(), storageKey);

  await fs.mkdir(path.dirname(target), { recursive: true });
  // 加密后再落盘。encryptPii 产出的是文本，直接写文件即可。
  await fs.writeFile(target, encryptPii(data.toString("base64")), { mode: 0o600 });

  const now = new Date().toISOString();
  const record = {
    id: `ATT-${randomUUID()}`,
    employeeId,
    category,
    categoryLabel: categoryLabel(category),
    // 原始文件名只做展示，绝不参与路径拼接
    originalName: String(filename).slice(0, 200),
    mimeType: sniffed,
    bytes: data.length,
    sha256,
    storageKey,
    encrypted: true,
    uploadedByAccountId: actorAccount?.id || "",
    uploadedByName: actorAccount?.name || actorAccount?.username || "",
    uploadedAt: now,
    deletedAt: "",
  };
  list.push(record);
  return record;
}

/** 读取附件内容（解密后的原始字节） */
export async function readAttachment(db, attachmentId) {
  const record = ensureAttachments(db).find((item) => item.id === attachmentId && !item.deletedAt);
  if (!record) throw httpError(404, "附件不存在");

  const target = path.join(attachmentDir(), record.storageKey);
  let raw;
  try {
    raw = await fs.readFile(target, "utf-8");
  } catch {
    // 元数据在、文件没了：多半是恢复数据库时没把附件目录一起带过来
    throw httpError(
      410,
      `附件文件缺失（${record.originalName}）。若刚做过数据库恢复，请确认附件目录也已一并恢复。`,
    );
  }

  const data = Buffer.from(decryptPii(raw), "base64");
  // 落盘后被改动过的话，哈希对不上。证件材料是要拿去核验的，
  // 给出一个被篡改的文件比给不出更糟。
  const actual = createHash("sha256").update(data).digest("hex");
  if (actual !== record.sha256) {
    throw httpError(500, `附件内容校验失败（${record.originalName}），文件可能已损坏或被篡改`);
  }
  return { record, data };
}

/**
 * 删除附件。只标记不抹盘：同一份文件可能被多条记录引用（内容相同则共享存储），
 * 直接删文件会让另一条记录取不到内容。
 */
export function deleteAttachment(db, attachmentId, actorAccount = null) {
  const record = ensureAttachments(db).find((item) => item.id === attachmentId && !item.deletedAt);
  if (!record) throw httpError(404, "附件不存在");
  record.deletedAt = new Date().toISOString();
  record.deletedByAccountId = actorAccount?.id || "";
  record.deletedByName = actorAccount?.name || actorAccount?.username || "";
  return record;
}

export function listAttachments(db, employeeId, options = {}) {
  const { includeDeleted = false } = options;
  return ensureAttachments(db)
    .filter((item) => item.employeeId === employeeId && (includeDeleted || !item.deletedAt))
    .map((item) => ({
      id: item.id,
      category: item.category,
      categoryLabel: item.categoryLabel || categoryLabel(item.category),
      originalName: item.originalName,
      mimeType: item.mimeType,
      bytes: item.bytes,
      uploadedByName: item.uploadedByName,
      uploadedAt: item.uploadedAt,
      deletedAt: item.deletedAt || "",
    }))
    .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));
}

/**
 * 清理没有任何记录引用的孤儿文件。
 * 删除只标记不抹盘，所以磁盘上的文件要靠这个回收。
 */
export async function pruneOrphanFiles(db, options = {}) {
  const { dryRun = false } = options;
  const referenced = new Set(ensureAttachments(db).filter((i) => !i.deletedAt).map((i) => i.storageKey));
  const dir = attachmentDir();
  const removed = [];

  const walk = async (relative = "") => {
    const abs = path.join(dir, relative);
    const entries = await fs.readdir(abs, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const rel = path.join(relative, entry.name);
      if (entry.isDirectory()) {
        await walk(rel);
      } else if (!referenced.has(rel)) {
        removed.push(rel);
        if (!dryRun) await fs.unlink(path.join(dir, rel)).catch(() => {});
      }
    }
  };
  await walk();
  return removed;
}

/** 统计，供运维体检与备份核对 */
export async function attachmentStats(db) {
  const list = ensureAttachments(db).filter((i) => !i.deletedAt);
  let onDisk = 0;
  let missing = 0;
  for (const item of list) {
    try {
      await fs.access(path.join(attachmentDir(), item.storageKey));
      onDisk += 1;
    } catch {
      missing += 1;
    }
  }
  return {
    directory: attachmentDir(),
    records: list.length,
    onDisk,
    missing,
    bytes: list.reduce((sum, i) => sum + Number(i.bytes || 0), 0),
  };
}
