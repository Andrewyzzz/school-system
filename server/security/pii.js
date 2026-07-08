import crypto from "node:crypto";

// 人事敏感字段（证件号、银行卡号等）应用层加密：AES-256-GCM。
// 密文格式：pii:v1:<iv_base64>:<authTag_base64>:<cipher_base64>
// 密钥来自环境变量 HR_ENCRYPTION_KEY（32 字节的 base64 或 64 位 hex）。
// 生产红线：密钥不入库、不入仓库、不写日志；缺失密钥时写路径必须失败而不是明文落库。

const CIPHER_ALGORITHM = "aes-256-gcm";
const CIPHERTEXT_PREFIX = "pii:v1:";

let cachedKey = null;
let cachedKeySource = "";

function decodeKey(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;
  if (/^[0-9a-fA-F]{64}$/.test(text)) return Buffer.from(text, "hex");
  const decoded = Buffer.from(text, "base64");
  if (decoded.length === 32) return decoded;
  return null;
}

export function piiEncryptionReady() {
  const raw = process.env.HR_ENCRYPTION_KEY || "";
  if (raw !== cachedKeySource) {
    cachedKey = decodeKey(raw);
    cachedKeySource = raw;
  }
  return Boolean(cachedKey);
}

function requireKey(action) {
  if (!piiEncryptionReady()) {
    const error = new Error(
      `HR_ENCRYPTION_KEY 未配置或格式错误（需要 32 字节的 base64 或 64 位 hex），拒绝${action}敏感字段`,
    );
    error.statusCode = 500;
    error.code = "PII_KEY_MISSING";
    throw error;
  }
  return cachedKey;
}

export function isPiiCiphertext(value) {
  return typeof value === "string" && value.startsWith(CIPHERTEXT_PREFIX);
}

export function encryptPii(plaintext) {
  const text = String(plaintext ?? "");
  if (!text) return "";
  if (isPiiCiphertext(text)) return text;
  const key = requireKey("加密");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${CIPHERTEXT_PREFIX}${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptPii(ciphertext) {
  const text = String(ciphertext ?? "");
  if (!text) return "";
  if (!isPiiCiphertext(text)) {
    const error = new Error("字段不是合法的加密密文");
    error.statusCode = 500;
    error.code = "PII_CIPHERTEXT_INVALID";
    throw error;
  }
  const key = requireKey("解密");
  const [ivPart, tagPart, dataPart] = text.slice(CIPHERTEXT_PREFIX.length).split(":");
  const iv = Buffer.from(ivPart || "", "base64");
  const authTag = Buffer.from(tagPart || "", "base64");
  const data = Buffer.from(dataPart || "", "base64");
  if (iv.length !== 12 || authTag.length !== 16) {
    const error = new Error("加密字段格式损坏");
    error.statusCode = 500;
    error.code = "PII_CIPHERTEXT_INVALID";
    throw error;
  }
  const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  try {
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    const error = new Error("加密字段解密失败（密钥不匹配或数据被篡改）");
    error.statusCode = 500;
    error.code = "PII_DECRYPT_FAILED";
    throw error;
  }
}

// 掩码工具：列表/详情默认展示掩码值，完整值必须走二次确认接口并记审计。
export function maskIdCard(value) {
  const text = String(value || "");
  if (text.length < 8) return text ? "****" : "";
  return `${text.slice(0, 4)}${"*".repeat(Math.max(text.length - 8, 4))}${text.slice(-4)}`;
}

export function maskBankCard(value) {
  const text = String(value || "").replace(/\s/g, "");
  if (text.length < 8) return text ? "****" : "";
  return `${"*".repeat(Math.max(text.length - 4, 4))}${text.slice(-4)}`;
}

export function maskPhone(value) {
  const text = String(value || "");
  if (text.length < 7) return text ? "****" : "";
  return `${text.slice(0, 3)}****${text.slice(-4)}`;
}

export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString("base64");
}
