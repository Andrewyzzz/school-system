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

export function createToken() {
  return crypto.randomBytes(32).toString("hex");
}
