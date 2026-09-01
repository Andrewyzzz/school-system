// 数据库账号权限隔离（验收 7.12 / 7.13）与审计表只追加（验收 3.27）
//
// 验收方式写得很明确：「以运维账号尝试读写薪资表，确认被拒」。所以这里不查
// 权限表、不看 GRANT 语句——**真的用运维账号连一条连接过去 SELECT**，
// 看它是不是报权限不足。查权限表只能证明我们授权时的意图，证明不了实际效果。
//
// 同样地，审计表的只追加保护要分两层测：GRANT 挡普通角色，触发器挡库主。
// 只测前者的话，一个 superuser 就能把审计日志改干净，而验收 3.27 要的正是
// 「操作日志不可删除」。
import assert from "node:assert/strict";
import pg from "pg";
import {
  APPEND_ONLY_COLLECTIONS,
  DB_AUDIT_TABLE,
  DB_ROLES,
  SENSITIVE_COLLECTIONS,
  auditDatabaseRoles,
  ensureDatabaseAuditLog,
  provisionDatabaseRoles,
  queryDatabaseAudit,
  tableNameOf,
} from "../server/db/roles.js";

const ADMIN_URL = process.env.TEST_ADMIN_URL || "postgresql://localhost:5432/postgres";
const DB_NAME = `school_roles_test_${process.pid}`;
const TEST_URL = `postgresql://localhost:5432/${DB_NAME}`;
const APP_PWD = "app-test-pwd";
const OPS_PWD = "ops-test-pwd";
const RO_PWD = "ro-test-pwd";

async function pgAvailable() {
  const client = new pg.Client({ connectionString: ADMIN_URL });
  try {
    await client.connect();
    await client.end();
    return true;
  } catch {
    return false;
  }
}

if (!(await pgAvailable())) {
  console.log("db roles checks skipped（本机无 PostgreSQL）");
  process.exit(0);
}

const admin = new pg.Client({ connectionString: ADMIN_URL });
await admin.connect();
await admin.query(`DROP DATABASE IF EXISTS "${DB_NAME}"`);
await admin.query(`CREATE DATABASE "${DB_NAME}"`);
await admin.end();

const db = new pg.Client({ connectionString: TEST_URL });
await db.connect();

let failure = null;
const opened = [];
const connectAs = async (user, password) => {
  const c = new pg.Client({
    connectionString: `postgresql://${user}:${password}@localhost:5432/${DB_NAME}`,
  });
  await c.connect();
  opened.push(c);
  return c;
};

try {
  // 造出与生产同构的表：两张敏感表、一张普通表、一张审计表
  const mk = async (collection) =>
    db.query(`
      CREATE TABLE "${tableNameOf(collection)}" (
        id text PRIMARY KEY,
        seq bigint NOT NULL DEFAULT 0,
        data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  await mk("payrollDetails");
  await mk("hrEmployees");
  await mk("teachers");
  await mk("lessonInstances");
  await mk("auditLogs");

  await db.query(
    `INSERT INTO "app_payrollDetails" (id, data) VALUES ($1, $2)`,
    ["PD-1", JSON.stringify({ id: "PD-1", grossPay: 8500 })],
  );
  await db.query(`INSERT INTO "app_teachers" (id, data) VALUES ($1, $2)`, [
    "T0001",
    JSON.stringify({ id: "T0001", name: "李明" }),
  ]);
  await db.query(`INSERT INTO "app_auditLogs" (id, data) VALUES ($1, $2)`, [
    "AUD-1",
    JSON.stringify({ id: "AUD-1", action: "payroll_lock" }),
  ]);

  // -------------------------------------------------------------------------
  // 1. 授权：幂等
  // -------------------------------------------------------------------------
  const first = await provisionDatabaseRoles(db, {
    appPassword: APP_PWD,
    opsPassword: OPS_PWD,
    readonlyPassword: RO_PWD,
  });
  assert.deepEqual(first.roles, [DB_ROLES.app, DB_ROLES.ops, DB_ROLES.readonly]);
  assert.ok(first.sensitiveTables.includes("app_payrollDetails"));
  assert.ok(first.appendOnlyTables.includes("app_auditLogs"));

  // 重复执行不应报错，也不该改变结果
  const second = await provisionDatabaseRoles(db, {
    appPassword: APP_PWD,
    opsPassword: OPS_PWD,
    readonlyPassword: RO_PWD,
  });
  assert.deepEqual(second.sensitiveTables, first.sensitiveTables, "重复授权结果应一致");

  // -------------------------------------------------------------------------
  // 2. 运维账号读薪资表 → 必须被数据库拒绝（验收 7.13 的原话）
  // -------------------------------------------------------------------------
  const ops = await connectAs(DB_ROLES.ops, OPS_PWD);

  await assert.rejects(
    () => ops.query(`SELECT * FROM "app_payrollDetails"`),
    (error) => {
      // 42501 = insufficient_privilege
      assert.equal(error.code, "42501", `应是权限错误，实际 ${error.code}：${error.message}`);
      return true;
    },
    "运维账号 SELECT 薪资表必须被拒——这是验收 7.13 现场要做的动作",
  );

  await assert.rejects(
    () => ops.query(`INSERT INTO "app_payrollDetails" (id, data) VALUES ('X', '{}')`),
    (error) => error.code === "42501",
    "运维账号写薪资表必须被拒",
  );
  await assert.rejects(
    () => ops.query(`UPDATE "app_payrollDetails" SET data = '{}'`),
    (error) => error.code === "42501",
  );
  await assert.rejects(
    () => ops.query(`DELETE FROM "app_payrollDetails"`),
    (error) => error.code === "42501",
  );

  // 人事档案同理（身份证、银行卡在里面）
  await assert.rejects(
    () => ops.query(`SELECT * FROM "app_hrEmployees"`),
    (error) => error.code === "42501",
    "运维账号不得读人事档案",
  );

  // 但运维该能干的活得能干：非敏感表可读写
  const teacherRead = await ops.query(`SELECT id FROM "app_teachers"`);
  assert.equal(teacherRead.rows.length, 1, "运维账号应能读教师表，否则日常巡检没法做");
  await ops.query(`INSERT INTO "app_lessonInstances" (id, data) VALUES ('L-1', '{}')`);

  // -------------------------------------------------------------------------
  // 3. 程序账号该读得到
  // -------------------------------------------------------------------------
  const app = await connectAs(DB_ROLES.app, APP_PWD);
  const appRead = await app.query(`SELECT data->>'grossPay' AS pay FROM "app_payrollDetails"`);
  assert.equal(appRead.rows[0].pay, "8500", "程序账号必须能读薪资表，否则应用跑不起来");
  await app.query(`INSERT INTO "app_payrollDetails" (id, data) VALUES ('PD-2', '{}')`);
  await app.query(`DELETE FROM "app_payrollDetails" WHERE id = 'PD-2'`);

  // -------------------------------------------------------------------------
  // 4. 只读账号：非敏感表能读，什么都不能写，敏感表看不到
  // -------------------------------------------------------------------------
  const ro = await connectAs(DB_ROLES.readonly, RO_PWD);
  const roRead = await ro.query(`SELECT id FROM "app_teachers"`);
  assert.equal(roRead.rows.length, 1);
  await assert.rejects(
    () => ro.query(`INSERT INTO "app_teachers" (id, data) VALUES ('T9', '{}')`),
    (error) => error.code === "42501",
    "只读账号不得写入",
  );
  await assert.rejects(
    () => ro.query(`SELECT * FROM "app_payrollDetails"`),
    (error) => error.code === "42501",
    "只读账号也不得读薪资表",
  );

  // -------------------------------------------------------------------------
  // 5. 审计表只追加（验收 3.27）
  // -------------------------------------------------------------------------
  // 程序账号可以追加
  await app.query(`INSERT INTO "app_auditLogs" (id, data) VALUES ('AUD-2', '{}')`);
  // 但不能改、不能删
  await assert.rejects(
    () => app.query(`UPDATE "app_auditLogs" SET data = '{}' WHERE id = 'AUD-1'`),
    (error) => error.code === "42501",
    "程序账号也不该有改写审计日志的权限",
  );
  await assert.rejects(
    () => app.query(`DELETE FROM "app_auditLogs" WHERE id = 'AUD-1'`),
    (error) => error.code === "42501",
  );

  // 库主（本连接是 owner/superuser）不受 GRANT 约束，必须靠触发器挡住
  await assert.rejects(
    () => db.query(`UPDATE "app_auditLogs" SET data = '{"tampered":true}' WHERE id = 'AUD-1'`),
    (error) => {
      assert.match(error.message, /只允许追加/, `应被触发器拒绝，实际：${error.message}`);
      return true;
    },
    "库主改审计日志必须被触发器拒绝——只靠 REVOKE 挡不住 superuser",
  );
  await assert.rejects(
    () => db.query(`DELETE FROM "app_auditLogs" WHERE id = 'AUD-1'`),
    (error) => /只允许追加/.test(error.message),
    "库主删审计日志必须被拒",
  );

  // 记录仍在，内容未被篡改
  const audit = await db.query(`SELECT data FROM "app_auditLogs" WHERE id = 'AUD-1'`);
  assert.equal(audit.rows.length, 1, "审计记录不得消失");
  assert.equal(audit.rows[0].data.action, "payroll_lock", "审计内容不得被改写");

  // -------------------------------------------------------------------------
  // 6. 新建的表默认不给运维（否则加一张表就多一个缺口）
  // -------------------------------------------------------------------------
  await db.query(`CREATE TABLE "app_newSensitiveThing" (id text PRIMARY KEY, data jsonb NOT NULL)`);
  await assert.rejects(
    () => ops.query(`SELECT * FROM "app_newSensitiveThing"`),
    (error) => error.code === "42501",
    "后建的表不应自动对运维账号开放——宁可要显式补授权，也不能默认放行",
  );
  // 程序账号则应自动拿到权限，否则每加一张表应用就挂
  await app.query(`INSERT INTO "app_newSensitiveThing" (id, data) VALUES ('N1', '{}')`);

  // -------------------------------------------------------------------------
  // 7. 体检工具：正常时通过，人为放权后能发现
  // -------------------------------------------------------------------------
  const clean = await auditDatabaseRoles(db);
  assert.equal(clean.ok, true, `体检应通过，实际发现：${JSON.stringify(clean.findings)}`);
  assert.ok(clean.checked > 0, "应确实检查了若干条权限");

  // 人为把薪资表读权限授给运维，体检必须报出来
  await db.query(`GRANT SELECT ON "app_payrollDetails" TO ${DB_ROLES.ops}`);
  const dirty = await auditDatabaseRoles(db);
  assert.equal(dirty.ok, false, "被违规放权后体检必须失败");
  assert.ok(
    dirty.findings.some((f) => f.role === DB_ROLES.ops && f.table === "app_payrollDetails" && f.priv === "SELECT"),
    "应准确指出是哪个角色、哪张表、哪项权限出了问题",
  );

  // 重新执行授权应把违规放权收回去
  await provisionDatabaseRoles(db, {});
  const repaired = await auditDatabaseRoles(db);
  assert.equal(repaired.ok, true, "重新授权应能修复被人为放开的权限");

  // 触发器被删掉也要能发现
  await db.query(`DROP TRIGGER trg_audit_append_only ON "app_auditLogs"`);
  const noTrigger = await auditDatabaseRoles(db);
  assert.equal(noTrigger.ok, false);
  assert.ok(
    noTrigger.findings.some((f) => /只追加触发器/.test(f.message)),
    "触发器缺失必须报出来，否则库主可以静默改写审计",
  );


  // -------------------------------------------------------------------------
  // 9. 数据库层操作日志（验收 7.14 / 7.15）
  //
  // 应用层审计答不了最要紧的那个问题：有没有人绕过应用直接改库。
  // 所以这里模拟的正是那个动作——用 psql 那样的直连去改工资表，
  // 看数据库自己有没有把它记下来。
  // -------------------------------------------------------------------------
  {
    const setup = await ensureDatabaseAuditLog(db);
    assert.ok(setup.watchedTables.includes("app_payrollDetails"), "工资表必须在监控之列");

    // 直接改库（不经应用，也不设 app.actor）
    await db.query(`UPDATE "app_payrollDetails" SET data = jsonb_set(data, '{grossPay}', '99999') WHERE id = 'PD-1'`);
    await db.query(`INSERT INTO "app_payrollDetails" (id, data) VALUES ('PD-SNEAK', '{"grossPay":1}')`);
    await db.query(`DELETE FROM "app_payrollDetails" WHERE id = 'PD-SNEAK'`);

    const trail = await queryDatabaseAudit(db, { table: "payrollDetails" });
    // 不要叫 ops——外层的运维连接就叫这个名字，遮蔽掉后面就用不上了
    const operations = trail.map((r) => r.operation);
    assert.ok(operations.includes("UPDATE"), "直接改库必须被记录");
    assert.ok(operations.includes("INSERT"), "直接插入必须被记录");
    assert.ok(operations.includes("DELETE"), "直接删除必须被记录");

    const update = trail.find((r) => r.operation === "UPDATE" && r.row_id === "PD-1");
    assert.ok(update, "应能按行 ID 查到改动");
    assert.ok(update.db_user, "必须记下是哪个数据库账号动的手");
    assert.deepEqual(update.changed_fields, ["grossPay"], "应指出改了哪个字段");
    assert.equal(update.app_actor, null, "绕过应用的操作没有业务操作人——这正是识别特征");

    // 经应用的操作会带上业务操作人
    await db.query(`SET LOCAL app.actor = 'finance_primary'`).catch(() => {});
    await db.query("BEGIN");
    await db.query(`SET LOCAL app.actor = 'finance_primary'`);
    await db.query(`UPDATE "app_payrollDetails" SET data = jsonb_set(data, '{month}', '"2026-07"') WHERE id = 'PD-1'`);
    await db.query("COMMIT");

    const withActor = (await queryDatabaseAudit(db, { table: "payrollDetails", rowId: "PD-1" })).find(
      (r) => r.app_actor === "finance_primary",
    );
    assert.ok(withActor, "应用侧带入的操作人应被记录，用于与直连操作区分");
    assert.deepEqual(withActor.changed_fields, ["month"]);

    // 审计表本身不可篡改，否则改完库把痕迹删掉就行了
    await assert.rejects(
      () => db.query(`DELETE FROM "${DB_AUDIT_TABLE}" WHERE true`),
      /只允许追加/,
      "数据库操作日志必须不可删除，否则等于没记",
    );
    await assert.rejects(
      () => db.query(`UPDATE "${DB_AUDIT_TABLE}" SET db_user = 'nobody'`),
      /只允许追加/,
    );

    // 运维账号不该能往审计表里写——否则他可以伪造记录混淆视听
    await assert.rejects(
      () => ops.query(`INSERT INTO "${DB_AUDIT_TABLE}" (db_user, table_name, operation) VALUES ('x','y','z')`),
      (error) => error.code === "42501",
      "运维账号不得写入数据库操作日志",
    );
  }

  // -------------------------------------------------------------------------
  // 8. 敏感表清单本身
  // -------------------------------------------------------------------------
  ["payrollDetails", "hrEmployees", "accounts", "sessions"].forEach((key) => {
    assert.ok(SENSITIVE_COLLECTIONS.includes(key), `${key} 必须在敏感表清单里`);
  });
  assert.ok(APPEND_ONLY_COLLECTIONS.includes("auditLogs"));
} catch (error) {
  failure = error;
} finally {
  for (const c of opened) await c.end().catch(() => {});
  await db.end().catch(() => {});
  const cleanup = new pg.Client({ connectionString: ADMIN_URL });
  await cleanup.connect();
  await cleanup
    .query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`, [
      DB_NAME,
    ])
    .catch(() => {});
  try {
    await cleanup.query(`DROP DATABASE IF EXISTS "${DB_NAME}"`);
    // 角色是集群级对象，不随库删除，必须显式清理
    for (const role of Object.values(DB_ROLES)) {
      await cleanup.query(`DROP ROLE IF EXISTS ${role}`).catch(() => {});
    }
  } catch (error) {
    console.warn(`[cleanup] 临时库 ${DB_NAME} 未能删除：${error.message}`);
  }
  await cleanup.end();
}

if (failure) throw failure;
console.log("db roles checks passed");
