// 工资金额加密存储（验收清单 3.25 / 7.16）
//
// 验收方式是「在数据库中查看工资金额字段为密文」，所以这里打真实数据库：
// 建临时库 → 落盘 → 直接查库确认是密文 → 应用层读回确认是明文，跑完即删。
//
// 同时守住两个容易破的性质：
//   1. AES-GCM 每次用随机 IV，密文每次都不同。若增量对比用密文，每次保存都会
//      全量重写整张表——本测试断言"数据没变时不产生写入"。
//   2. 密钥不对时必须明确报错，不能静默返回空工资单（那会让财务以为没工资）。
import assert from "node:assert/strict";
import pg from "pg";
import {
  CIPHER_FIELD,
  ENCRYPTED_BLOCKS,
  collectionNeedsEncryption,
  decryptRowFromStorage,
  encryptRowForStorage,
  isRowEncrypted,
} from "../server/security/payrollCrypto.js";

const ADMIN_URL = process.env.TEST_ADMIN_URL || "postgresql://localhost:5432/postgres";
const DB_NAME = `school_payroll_enc_test_${process.pid}`;
const TEST_URL = `postgresql://localhost:5432/${DB_NAME}`;

// 本测试自带密钥，不依赖外部环境
process.env.HR_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");

const SAMPLE = {
  id: "PAY-ENC-1",
  teacherId: "T-A",
  termId: "TERM-A",
  month: "2026-08",
  status: "locked",
  summarySnapshot: { grossPay: 12345.67, baseSalary: 3520, lessonAmount: 456 },
  rowsSnapshot: [
    { name: "基本工资", basis: "职称档：正高级教师", amount: 3520, category: "fixed" },
    { name: "课时工资", basis: "按实际完成课次汇总", amount: 456, category: "lesson" },
  ],
  lineSnapshots: [{ date: "2026-08-03", amount: 22.8, rate: 22.8, units: 1 }],
};

// ---------------------------------------------------------------------------
// 1. 纯函数层：加密 → 数据库形态 → 解密还原
// ---------------------------------------------------------------------------
{
  assert.equal(collectionNeedsEncryption("payrollDetails"), true);
  assert.equal(collectionNeedsEncryption("teachers"), false, "只加密工资单，其他集合不动");

  const cipher = encryptRowForStorage("payrollDetails", SAMPLE);
  assert.ok(isRowEncrypted(cipher), "加密后应带密文字段");

  // 金额块必须从行上消失，只剩密文
  ENCRYPTED_BLOCKS.payrollDetails.forEach((key) => {
    assert.equal(cipher[key], undefined, `${key} 不应以明文留在行上`);
  });
  // 非金额字段保持明文，便于按月份、状态查询
  assert.equal(cipher.month, "2026-08");
  assert.equal(cipher.teacherId, "T-A");
  assert.equal(cipher.status, "locked");

  // 序列化后不得能搜到任何明文金额或项目名
  const serialized = JSON.stringify(cipher);
  ["12345.67", "3520", "456", "22.8", "基本工资", "职称档"].forEach((needle) => {
    assert.ok(!serialized.includes(needle), `密文中不应出现明文 ${needle}`);
  });

  const restored = decryptRowFromStorage("payrollDetails", cipher);
  assert.deepEqual(restored.summarySnapshot, SAMPLE.summarySnapshot);
  assert.deepEqual(restored.rowsSnapshot, SAMPLE.rowsSnapshot);
  assert.deepEqual(restored.lineSnapshots, SAMPLE.lineSnapshots);
  assert.equal(restored[CIPHER_FIELD], undefined, "还原后应剥离密文字段");

  // 幂等：已加密的行再加密一次不应双重加密
  const twice = encryptRowForStorage("payrollDetails", cipher);
  assert.equal(twice[CIPHER_FIELD], cipher[CIPHER_FIELD], "重复加密不应改变密文");

  // 未加密的历史行原样返回，保证迁移期间新旧并存可读
  const legacy = decryptRowFromStorage("payrollDetails", SAMPLE);
  assert.deepEqual(legacy.summarySnapshot, SAMPLE.summarySnapshot);
}

// ---------------------------------------------------------------------------
// 2. 密文随机性：同一明文两次加密结果不同（IV 随机），但都能解回同一份数据
// ---------------------------------------------------------------------------
{
  const a = encryptRowForStorage("payrollDetails", SAMPLE);
  const b = encryptRowForStorage("payrollDetails", { ...SAMPLE });
  assert.notEqual(a[CIPHER_FIELD], b[CIPHER_FIELD], "AES-GCM 应使用随机 IV");
  assert.deepEqual(
    decryptRowFromStorage("payrollDetails", a).summarySnapshot,
    decryptRowFromStorage("payrollDetails", b).summarySnapshot,
    "两份密文应解回同一份数据",
  );
}

// ---------------------------------------------------------------------------
// 3. 密钥不匹配时必须报错，不能静默返回空工资单
// ---------------------------------------------------------------------------
{
  const cipher = encryptRowForStorage("payrollDetails", SAMPLE);
  const goodKey = process.env.HR_ENCRYPTION_KEY;
  process.env.HR_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
  assert.throws(
    () => decryptRowFromStorage("payrollDetails", cipher),
    (error) => {
      assert.equal(error.code, "PAYROLL_DECRYPT_FAILED");
      assert.match(error.message, /HR_ENCRYPTION_KEY/, "错误信息应指明密钥问题");
      return true;
    },
    "密钥不匹配必须抛错而非返回空数据",
  );
  process.env.HR_ENCRYPTION_KEY = goodKey;
}

// ---------------------------------------------------------------------------
// 4. 无密钥时写入必须失败，不能明文落库
// ---------------------------------------------------------------------------
{
  const goodKey = process.env.HR_ENCRYPTION_KEY;
  process.env.HR_ENCRYPTION_KEY = "";
  assert.throws(
    () => encryptRowForStorage("payrollDetails", SAMPLE),
    /HR_ENCRYPTION_KEY/,
    "无密钥时宁可写入失败，也不能明文落库",
  );
  process.env.HR_ENCRYPTION_KEY = goodKey;
}

// ---------------------------------------------------------------------------
// 5. 真实数据库：落库是密文、读回是明文、重复保存不产生写入
// ---------------------------------------------------------------------------
async function pgAvailable() {
  const c = new pg.Client({ connectionString: ADMIN_URL });
  try {
    await c.connect();
    await c.end();
    return true;
  } catch {
    return false;
  }
}

if (!(await pgAvailable())) {
  console.log("[skip] 本地 PostgreSQL 不可用，跳过落库部分");
  console.log("payroll encryption checks passed");
  process.exit(0);
}

const admin = new pg.Client({ connectionString: ADMIN_URL });
await admin.connect();
await admin.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
await admin.query(`CREATE DATABASE ${DB_NAME}`);
await admin.end();

let failure = null;
try {
  process.env.DATABASE_URL = TEST_URL;
  process.env.DB_DRIVER = "postgres";
  const storage = await import("../server/storage.js");

  const db = storage.createInitialData({ teacherCount: 3 });
  storage.normalizeDatabase(db);
  const term = db.terms.find((t) => t.current) || db.terms[0];
  db.payrollDetails = [{ ...SAMPLE, teacherId: db.teachers[0].id, termId: term.id }];
  await storage.saveDatabase(db);

  // 直接查库：必须是密文
  const probe = new pg.Client({ connectionString: TEST_URL });
  await probe.connect();
  const { rows } = await probe.query(`SELECT data FROM "app_payrollDetails" WHERE id = $1`, [SAMPLE.id]);
  assert.equal(rows.length, 1, "工资单应已落库");
  const stored = rows[0].data;
  assert.ok(isRowEncrypted(stored), "库中工资单必须是密文");
  const raw = JSON.stringify(stored);
  ["12345.67", "3520", "基本工资"].forEach((needle) => {
    assert.ok(!raw.includes(needle), `库中不应出现明文 ${needle}`);
  });
  await probe.end();

  // 应用层读回：必须是明文
  const reloaded = await storage.ensureDatabase();
  const detail = (reloaded.payrollDetails || []).find((d) => d.id === SAMPLE.id);
  assert.ok(detail, "应能读回工资单");
  assert.equal(detail.summarySnapshot.grossPay, 12345.67);
  assert.equal(detail.rowsSnapshot[0].name, "基本工资");
  assert.equal(detail.lineSnapshots[0].amount, 22.8);
  assert.equal(detail[CIPHER_FIELD], undefined, "读回后不应残留密文字段");

  // 数据未变时重复保存不应产生写入——若增量对比用了密文，这里会失败
  const before = await (async () => {
    const c = new pg.Client({ connectionString: TEST_URL });
    await c.connect();
    const r = await c.query(`SELECT updated_at FROM "app_payrollDetails" WHERE id = $1`, [SAMPLE.id]);
    await c.end();
    return r.rows[0].updated_at;
  })();
  await storage.saveDatabase(reloaded);
  const after = await (async () => {
    const c = new pg.Client({ connectionString: TEST_URL });
    await c.connect();
    const r = await c.query(`SELECT updated_at FROM "app_payrollDetails" WHERE id = $1`, [SAMPLE.id]);
    await c.end();
    return r.rows[0].updated_at;
  })();
  assert.deepEqual(after, before, "数据未变时不应重写（否则说明增量对比用了密文）");

  // 改金额后应正确写入并读回
  reloaded.payrollDetails[0].summarySnapshot.grossPay = 99999.99;
  await storage.saveDatabase(reloaded);
  const again = await storage.ensureDatabase();
  assert.equal(
    again.payrollDetails.find((d) => d.id === SAMPLE.id).summarySnapshot.grossPay,
    99999.99,
    "改动后的金额应能正确读回",
  );
} catch (error) {
  failure = error;
} finally {
  // 必须先关掉连接池：DROP DATABASE 在还有活动连接时会失败，
  // 而失败被吞掉的话每跑一次测试就在服务器上留下一个临时库。
  await import("../server/db/postgresStore.js")
    .then((mod) => mod.closePostgresPool())
    .catch(() => {});
  const cleanup = new pg.Client({ connectionString: ADMIN_URL });
  await cleanup.connect();
  // 兜底：仍有连接残留时强制断开（例如上面的断言中途抛错）
  await cleanup
    .query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`, [
      DB_NAME.replace(/^"|"$/g, ""),
    ])
    .catch(() => {});
  try {
    await cleanup.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
  } catch (error) {
    // 不再静默：删不掉要说出来，否则临时库会一直堆积
    console.warn(`[cleanup] 临时库 ${DB_NAME} 未能删除：${error.message}`);
  }
  await cleanup.end();
}

if (failure) throw failure;
console.log("payroll encryption checks passed");
