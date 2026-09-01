// 本测试会 DROP 掉所有 app_* 表，所以必须在**独立的临时库**里跑。
//
// 原先它直连默认的 school_system_dev——也就是开发与试运行正在用的那个库，
// 跑一次测试就把审批单、工资单全部清空。在学校服务器上任何人执行 npm test
// 都会抹掉生产数据。因此这里先建一个带进程号的临时库，把 DATABASE_URL 指过去，
// 用完删掉；连接串必须在 import postgresStore 之前设置，因为连接池是惰性建的，
// 一旦建好就固定在那个库上了。
import assert from "node:assert/strict";
import pg from "pg";

const ADMIN_URL = process.env.TEST_ADMIN_URL || "postgresql://localhost:5432/postgres";
const DB_NAME = `school_store_test_${process.pid}`;
const TEST_URL = process.env.TEST_DATABASE_URL || `postgresql://localhost:5432/${DB_NAME}`;
let createdTempDb = false;

if (!process.env.TEST_DATABASE_URL) {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS "${DB_NAME}"`);
  await admin.query(`CREATE DATABASE "${DB_NAME}"`);
  await admin.end();
  createdTempDb = true;
}
process.env.DATABASE_URL = TEST_URL;

const { createInitialData } = await import("../server/storage.js");
const {
  closePostgresPool,
  diffDatabaseAgainstPostgres,
  loadDatabaseFromPostgres,
  persistDatabaseToPostgres,
  postgresHealth,
  postgresPing,
  resetPostgresStore,
} = await import("../server/db/postgresStore.js");

async function dropTempDb() {
  if (!createdTempDb) return;
  await closePostgresPool();
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS "${DB_NAME}"`);
  await admin.end();
}
// 断言失败也要把临时库删掉，否则每跑一次失败的测试就留下一个库
process.on("exit", () => {});
process.on("uncaughtException", async (error) => {
  await dropTempDb().catch(() => {});
  console.error(error);
  process.exit(1);
});

// PostgreSQL 持久层验收（第二阶段 M1）：
// 差量写、删除同步、数组顺序还原、单例对象、重复主键拒绝、核对工具。
// 本测试需要可连接的 PostgreSQL（默认 school_system_dev）；连不上时显式失败，
// 因为二阶段起 SQL 层是主干路径，不允许静默跳过。

const reachable = await postgresPing();
assert.ok(
  reachable,
  `PostgreSQL 不可达（${postgresHealth.lastError}）。第二阶段测试要求本机数据库就绪：brew services start postgresql@16`,
);

await resetPostgresStore();

// 1. 全量首写 + 重载还原
const db = createInitialData({ teacherCount: 30 });
const firstPersist = await persistDatabaseToPostgres(db);
assert.ok(firstPersist.upserts > 0, "首写应有大量 upsert");
assert.equal(firstPersist.deletes, 0);

const reloaded = await loadDatabaseFromPostgres();
assert.ok(reloaded, "应能从空进程重载数据库");
assert.equal(reloaded.teachers.length, db.teachers.length);
assert.equal(reloaded.accounts.length, db.accounts.length);
assert.deepEqual(
  reloaded.stages.map((stage) => stage.id),
  db.stages.map((stage) => stage.id),
  "数组顺序必须按 seq 还原",
);
assert.equal(reloaded.meta.seedVersion, db.meta.seedVersion, "单例对象应还原");

// 2. 差量写：只改一行 → 只写一行 + meta 单例
db.teachers[5].phone = "13712345678";
db.meta.updatedAt = new Date().toISOString();
const incremental = await persistDatabaseToPostgres(db);
assert.ok(
  incremental.upserts <= 3,
  `差量写应只包含变更行，实际 upserts=${incremental.upserts}`,
);

// 3. 删除同步
const removedAccountId = db.accounts[db.accounts.length - 1].id;
db.accounts = db.accounts.filter((account) => account.id !== removedAccountId);
const afterDelete = await persistDatabaseToPostgres(db);
assert.equal(afterDelete.deletes, 1, "删除的行必须从库中移除");
const reloadedAfterDelete = await loadDatabaseFromPostgres();
assert.equal(
  reloadedAfterDelete.accounts.some((account) => account.id === removedAccountId),
  false,
);

// 4. 顺序变化会被持久化
const [firstStage, ...restStages] = db.stages;
db.stages = [...restStages, firstStage];
await persistDatabaseToPostgres(db);
const reloadedAfterReorder = await loadDatabaseFromPostgres();
assert.deepEqual(
  reloadedAfterReorder.stages.map((stage) => stage.id),
  db.stages.map((stage) => stage.id),
  "重排后的数组顺序应还原",
);

// 5. 缺 id 的行由引擎补 _rowId 并可往返
db.auditLogs.push({ action: "m1-test-no-id", createdAt: new Date().toISOString() });
await persistDatabaseToPostgres(db);
const reloadedAudit = await loadDatabaseFromPostgres();
const auditRow = reloadedAudit.auditLogs.find((entry) => entry.action === "m1-test-no-id");
assert.ok(auditRow, "无 id 行应被持久化");
assert.ok(auditRow._rowId, "无 id 行应带引擎生成的 _rowId");

// 6. 重复主键必须拒绝（防静默覆盖）
db.teachers.push({ ...db.teachers[0] });
await assert.rejects(() => persistDatabaseToPostgres(db), /重复主键/);
db.teachers.pop();
// 持久化失败后影子作废，下一次全量重比对仍能成功
await persistDatabaseToPostgres(db);

// 7. 核对工具：一致时 identical=true；内存改动未保存时能发现
const cleanDiff = await diffDatabaseAgainstPostgres(db);
assert.equal(cleanDiff.identical, true, `核对应一致：${JSON.stringify(cleanDiff.collections.teachers)}`);
db.teachers[0].name = "临时改名未保存";
const dirtyDiff = await diffDatabaseAgainstPostgres(db);
assert.equal(dirtyDiff.identical, false, "未持久化的内存改动必须被核对工具发现");
assert.equal(dirtyDiff.collections.teachers.mismatched, 1);

await resetPostgresStore();
await dropTempDb();
console.log("postgres store checks passed");
