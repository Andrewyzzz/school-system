import assert from "node:assert/strict";
import {
  decryptPii,
  encryptPii,
  generateEncryptionKey,
  isPiiCiphertext,
  maskBankCard,
  maskIdCard,
  maskPhone,
  piiEncryptionReady,
} from "../server/security/pii.js";

// PII 加密模块验收：密钥缺失必须失败（不允许明文落库）、加解密往返、
// 篡改检测（GCM authTag）、掩码规则。

// 1. 无密钥：加密与解密都必须显式失败
delete process.env.HR_ENCRYPTION_KEY;
assert.equal(piiEncryptionReady(), false);
assert.throws(() => encryptPii("440301199001011234"), /HR_ENCRYPTION_KEY/);

// 2. 非法密钥格式同样拒绝
process.env.HR_ENCRYPTION_KEY = "too-short";
assert.equal(piiEncryptionReady(), false);
assert.throws(() => encryptPii("x"), /HR_ENCRYPTION_KEY/);

// 3. 合法密钥：加解密往返
process.env.HR_ENCRYPTION_KEY = generateEncryptionKey();
assert.equal(piiEncryptionReady(), true);

const idCard = "440301199001011234";
const encrypted = encryptPii(idCard);
assert.ok(isPiiCiphertext(encrypted), "密文应带版本前缀");
assert.notEqual(encrypted, idCard);
assert.equal(decryptPii(encrypted), idCard);

// 同一明文两次加密产生不同密文（随机 IV），但都能解回
const encryptedAgain = encryptPii(idCard);
assert.notEqual(encrypted, encryptedAgain);
assert.equal(decryptPii(encryptedAgain), idCard);

// 已是密文的值不会二次加密
assert.equal(encryptPii(encrypted), encrypted);

// 空值直通
assert.equal(encryptPii(""), "");
assert.equal(decryptPii(""), "");

// 4. 篡改检测：改动密文任何一段都必须解密失败
const [prefixA, prefixB, iv, tag, data] = encrypted.split(":");
const tampered = [prefixA, prefixB, iv, tag, Buffer.from("hacked-data").toString("base64")].join(":");
assert.throws(() => decryptPii(tampered), /解密失败|格式损坏/);

// 5. 换密钥后旧密文解密失败（密钥轮换需先解密再重加密，直接换密钥必须报错而不是返回乱码）
const oldCiphertext = encryptPii("6222020200112233445");
process.env.HR_ENCRYPTION_KEY = generateEncryptionKey();
assert.throws(() => decryptPii(oldCiphertext), /解密失败/);

// 6. 明文当密文解报格式错误
assert.throws(() => decryptPii("not-a-ciphertext"), /不是合法的加密密文/);

// 7. 掩码规则
assert.equal(maskIdCard("440301199001011234"), "4403**********1234");
assert.equal(maskIdCard(""), "");
assert.equal(maskBankCard("6222 0202 0011 2233 445"), "***************3445");
assert.equal(maskPhone("13800138000"), "138****8000");

console.log("pii encryption checks passed");
