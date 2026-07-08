import crypto from "node:crypto";

const HASH_ITERATIONS = 80000;
const HASH_LENGTH = 32;
const HASH_DIGEST = "sha256";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_LENGTH, HASH_DIGEST)
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash = "") {
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) return false;

  const actualHash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_LENGTH, HASH_DIGEST)
    .toString("hex");
  const expected = Buffer.from(expectedHash, "hex");
  const actual = Buffer.from(actualHash, "hex");

  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

// 登录热路径专用：pbkdf2 80000 轮约 30ms，同步版本会独占事件循环，
// 早高峰集中登录时把全站请求一起拖慢；异步版本在 libuv 线程池执行。
export function verifyPasswordAsync(password, storedHash = "") {
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) return Promise.resolve(false);
  return new Promise((resolve) => {
    crypto.pbkdf2(password, salt, HASH_ITERATIONS, HASH_LENGTH, HASH_DIGEST, (error, derived) => {
      if (error) return resolve(false);
      const expected = Buffer.from(expectedHash, "hex");
      if (expected.length !== derived.length) return resolve(false);
      resolve(crypto.timingSafeEqual(expected, derived));
    });
  });
}

export function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token = "") {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}
