// 工资金额加密存储（验收清单 3.25 / 7.16）
//
// 验收要求「工资金额加密存储，数据库中不可明文读取」，验收方式是**直接在数据库
// 里查询该字段确认为密文**。
//
// 与人事域敏感字段（身份证、银行卡）的做法不同：那些是单个字符串字段，用
// 「字段级加密 + 掩码展示」；工资金额散落在三层嵌套结构里——
//   summarySnapshot 的 9 个汇总金额、rowsSnapshot[].amount 每行明细、
//   lineSnapshots[].amount/.rate 每节课的金额
// 逐字段加密会让业务代码到处都是加解密调用，且数字变字符串会破坏计算。
//
// 因此在持久层做**透明加解密**：落库前把这三块打包加密成一个字段，读库后还原。
// 业务代码拿到的始终是明文对象，一行都不用改；数据库里则只有密文。
//
// 代价：金额不能再在数据库层做聚合查询（SUM/AVG），所有统计必须经应用层解密后
// 计算。这是加密的必然结果，已在验收清单 7.16 的影响提示中说明。

import { decryptPii, encryptPii, isPiiCiphertext, piiEncryptionReady } from "./pii.js";

// 需要加密的集合与其中的金额块
const ENCRYPTED_BLOCKS = {
  payrollDetails: ["summarySnapshot", "rowsSnapshot", "lineSnapshots"],
};

// 密文存放的字段名。原字段在落库时被删除，读回时还原。
const CIPHER_FIELD = "encryptedPayload";

export function payrollEncryptionEnabled() {
  // 未配置密钥时不加密：与人事域一致，读路径要能在无密钥环境下降级，
  // 但写路径由 requireKey 拦住，不会明文落库。
  return piiEncryptionReady();
}

export function collectionNeedsEncryption(collectionKey) {
  return Boolean(ENCRYPTED_BLOCKS[collectionKey]);
}

/**
 * 落库前：把金额块打包加密。返回新对象，不改动入参。
 * 已加密的行（含 CIPHER_FIELD）原样返回，避免重复加密。
 */
export function encryptRowForStorage(collectionKey, row) {
  const blocks = ENCRYPTED_BLOCKS[collectionKey];
  if (!blocks || !row || typeof row !== "object") return row;
  if (row[CIPHER_FIELD]) return row;

  const payload = {};
  let hasAny = false;
  blocks.forEach((key) => {
    if (row[key] !== undefined) {
      payload[key] = row[key];
      hasAny = true;
    }
  });
  if (!hasAny) return row;

  // 密钥缺失时 encryptPii 会抛错——宁可写入失败，也不能明文落库
  const next = { ...row, [CIPHER_FIELD]: encryptPii(JSON.stringify(payload)) };
  blocks.forEach((key) => delete next[key]);
  return next;
}

/**
 * 读库后：还原金额块。返回新对象，不改动入参。
 * 未加密的历史行原样返回，保证迁移期间新旧并存可读。
 */
export function decryptRowFromStorage(collectionKey, row) {
  const blocks = ENCRYPTED_BLOCKS[collectionKey];
  if (!blocks || !row || typeof row !== "object") return row;
  const cipher = row[CIPHER_FIELD];
  if (!cipher) return row;
  if (!isPiiCiphertext(cipher)) return row;

  const next = { ...row };
  delete next[CIPHER_FIELD];
  try {
    Object.assign(next, JSON.parse(decryptPii(cipher)));
  } catch (error) {
    // 解密失败通常是密钥换了或数据被篡改。不能静默返回空工资单——
    // 那会让财务以为这个人本月没工资。抛错让问题立刻暴露。
    const wrapped = new Error(
      `工资单 ${row.id || "(未知)"} 解密失败：${error.message}。请确认 HR_ENCRYPTION_KEY 与写入时一致。`,
    );
    wrapped.code = "PAYROLL_DECRYPT_FAILED";
    throw wrapped;
  }
  return next;
}

export function encryptRowsForStorage(collectionKey, rows) {
  if (!collectionNeedsEncryption(collectionKey) || !Array.isArray(rows)) return rows;
  return rows.map((row) => encryptRowForStorage(collectionKey, row));
}

export function decryptRowsFromStorage(collectionKey, rows) {
  if (!collectionNeedsEncryption(collectionKey) || !Array.isArray(rows)) return rows;
  return rows.map((row) => decryptRowFromStorage(collectionKey, row));
}

/** 供测试与迁移脚本判断某行是否已加密 */
export function isRowEncrypted(row) {
  return Boolean(row && typeof row === "object" && isPiiCiphertext(row[CIPHER_FIELD]));
}

export { CIPHER_FIELD, ENCRYPTED_BLOCKS };
