// 数据库层引用完整性（验收清单 7.5 / 7.6 / 7.7）
//
// 验收要求「教师主键在人事、排课、工资三类业务表中统一关联，建立数据库外键约束，
// 删除教职工时配套课时、薪资数据有保护机制」，且验收方式是**在数据库中直接执行
// 删除，确认被拒绝**——所以这里必须打真实数据库，而不是测应用层逻辑。
//
// 业务表是文档式的（id / seq / data JSONB），外键建在从 data 提取的生成列上。
// 本测试在一个临时库里从零建表、加约束、跑攻击场景，跑完即删。
//
// 需要本地 PostgreSQL：TEST_DATABASE_URL 可覆盖，默认连 localhost 的 postgres 库建临时库。
import assert from "node:assert/strict";
import pg from "pg";
import {
  FOREIGN_KEYS,
  INDEXES,
  ensureConstraintsAndIndexes,
  columnOf,
  constraintOf,
  indexOf,
} from "../server/db/constraints.js";

const ADMIN_URL = process.env.TEST_ADMIN_URL || "postgresql://localhost:5432/postgres";
const DB_NAME = `school_constraints_test_${process.pid}`;
const TEST_URL = `postgresql://localhost:5432/${DB_NAME}`;
const T = (name) => `"app_${name}"`;

// 数据库不可用时跳过而不是报错——CI 或他人机器上未必有 PostgreSQL
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
  console.log("[skip] 本地 PostgreSQL 不可用，跳过数据库约束测试");
  process.exit(0);
}

const admin = new pg.Client({ connectionString: ADMIN_URL });
await admin.connect();
await admin.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
await admin.query(`CREATE DATABASE ${DB_NAME}`);
await admin.end();

const db = new pg.Client({ connectionString: TEST_URL });
await db.connect();

let failure = null;
try {
  // ------------------------------------------------------------------
  // 建最小可用的表集：本测试只关心 terms / teachers / classes / rooms /
  // lessonInstances 这条主链路
  // ------------------------------------------------------------------
  const COLLECTIONS = ["terms", "teachers", "classes", "rooms", "lessonInstances", "payrollDetails"];
  for (const name of COLLECTIONS) {
    await db.query(`
      CREATE TABLE ${T(name)} (
        id text PRIMARY KEY,
        seq bigint NOT NULL DEFAULT 0,
        data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`);
  }

  const insert = (name, id, data) =>
    db.query(`INSERT INTO ${T(name)} (id, seq, data) VALUES ($1, 0, $2::jsonb)`, [id, JSON.stringify(data)]);

  await insert("terms", "TERM-A", { id: "TERM-A", name: "测试学期" });
  await insert("teachers", "T-A", { id: "T-A", name: "张三" });
  await insert("rooms", "ROOM-A", { id: "ROOM-A", termId: "TERM-A" });
  await insert("classes", "CLS-A", { id: "CLS-A", termId: "TERM-A", roomId: "ROOM-A" });
  await insert("lessonInstances", "L-A", {
    id: "L-A", termId: "TERM-A", teacherId: "T-A", classId: "CLS-A", roomId: "ROOM-A",
  });

  // ------------------------------------------------------------------
  // 1. 建约束
  // ------------------------------------------------------------------
  const result = await ensureConstraintsAndIndexes(db);
  assert.ok(result.foreignKeys.applied.length > 0, "应建立外键");

  const { rows: fkRows } = await db.query(
    `select count(*)::int n from information_schema.table_constraints
     where constraint_type='FOREIGN KEY' and table_schema='public'`,
  );
  assert.ok(fkRows[0].n >= 8, `外键数量偏少：${fkRows[0].n}`);

  // 生成列必须是 STORED，否则无法建外键
  const { rows: genRows } = await db.query(
    `select count(*)::int n from information_schema.columns
     where is_generated='ALWAYS' and table_schema='public'`,
  );
  assert.ok(genRows[0].n > 0, "应生成引用列");

  // ------------------------------------------------------------------
  // 2. 幂等：重复执行不报错、不重复建
  // ------------------------------------------------------------------
  const again = await ensureConstraintsAndIndexes(db);
  assert.equal(again.foreignKeys.applied.length, 0, "重复执行不应重复建外键");
  const { rows: fkRows2 } = await db.query(
    `select count(*)::int n from information_schema.table_constraints
     where constraint_type='FOREIGN KEY' and table_schema='public'`,
  );
  assert.equal(fkRows2[0].n, fkRows[0].n, "重复执行后外键数量应不变");

  // ------------------------------------------------------------------
  // 3. 生成列随 data 自动维护
  // ------------------------------------------------------------------
  {
    const { rows } = await db.query(
      `select ${columnOf("teacherId")} col, data->>'teacherId' raw from ${T("lessonInstances")} where id='L-A'`,
    );
    assert.equal(rows[0].col, rows[0].raw, "生成列应与 data 内的值一致");

    // 改 data，生成列要跟着变
    await db.query(
      `UPDATE ${T("lessonInstances")} SET data = jsonb_set(data, '{teacherId}', '"T-A"') WHERE id='L-A'`,
    );
    const { rows: after } = await db.query(
      `select ${columnOf("teacherId")} col from ${T("lessonInstances")} where id='L-A'`,
    );
    assert.equal(after[0].col, "T-A", "改 data 后生成列应同步");
  }

  // ------------------------------------------------------------------
  // 4. 攻击场景：绕过应用层直接操作数据库（验收 7.6 的现场演示项）
  // ------------------------------------------------------------------
  await assert.rejects(
    () => db.query(`DELETE FROM ${T("teachers")} WHERE id='T-A'`),
    /foreign key constraint/,
    "删除仍有课次的教师必须被数据库拒绝",
  );

  await assert.rejects(
    () => db.query(`DELETE FROM ${T("terms")} WHERE id='TERM-A'`),
    /foreign key constraint/,
    "删除仍被引用的学期必须被拒绝",
  );

  await assert.rejects(
    () => insert("lessonInstances", "L-BAD", { id: "L-BAD", termId: "TERM-A", teacherId: "T-NOBODY" }),
    /foreign key constraint/,
    "引用不存在的教师必须被拒绝",
  );

  await assert.rejects(
    () => insert("lessonInstances", "L-BAD2", { id: "L-BAD2", termId: "TERM-A", classId: "CLS-NOBODY" }),
    /foreign key constraint/,
    "引用不存在的班级必须被拒绝",
  );

  // 合法数据必须放行——约束不能误伤正常业务
  await insert("lessonInstances", "L-OK", {
    id: "L-OK", termId: "TERM-A", teacherId: "T-A", classId: "CLS-A", roomId: "ROOM-A",
  });
  await db.query(`DELETE FROM ${T("lessonInstances")} WHERE id='L-OK'`);

  // 空引用不应被外键拦（教室可缺失）
  await insert("lessonInstances", "L-NULLROOM", {
    id: "L-NULLROOM", termId: "TERM-A", teacherId: "T-A", classId: "CLS-A", roomId: "",
  });
  await db.query(`DELETE FROM ${T("lessonInstances")} WHERE id='L-NULLROOM'`);

  // ------------------------------------------------------------------
  // 5. 延迟约束：同一事务内先写子行后写父行必须放行
  //
  // 持久化按集合逐个写入，「新建学期 + 新建引用该学期的班级」时 classes 可能
  // 先于 terms 落库。若外键立即检查，这个正常业务会被误拦。
  // ------------------------------------------------------------------
  {
    await db.query("BEGIN");
    await insert("classes", "CLS-DEFER", { id: "CLS-DEFER", termId: "TERM-DEFER" }); // 父行还不存在
    await insert("terms", "TERM-DEFER", { id: "TERM-DEFER", name: "延迟验证" });
    await db.query("COMMIT");
    const { rows } = await db.query(`select count(*)::int n from ${T("classes")} where id='CLS-DEFER'`);
    assert.equal(rows[0].n, 1, "同事务内先子后父应能提交");
  }

  // 但整个事务结束时仍然不一致的，必须在提交时失败
  await assert.rejects(async () => {
    await db.query("BEGIN");
    await insert("classes", "CLS-ORPHAN", { id: "CLS-ORPHAN", termId: "TERM-NOBODY" });
    await db.query("COMMIT");
  }, /foreign key constraint/, "提交时仍是孤儿引用必须失败");
  await db.query("ROLLBACK").catch(() => {});

  // ------------------------------------------------------------------
  // 6. 索引确实建在表达式上
  // ------------------------------------------------------------------
  {
    const { rows } = await db.query(
      `select indexdef from pg_indexes where schemaname='public' and indexname='idx_teachers_name'`,
    );
    assert.ok(rows.length === 1, "应建立 teachers.name 索引");
    assert.match(rows[0].indexdef, /data ->> 'name'/, "应为 JSONB 表达式索引");
  }

  // ------------------------------------------------------------------
  // 7. 配置自检：命名不冲突、ON DELETE 取值合法
  // ------------------------------------------------------------------
  {
    const names = FOREIGN_KEYS.map((fk) => constraintOf(fk.child, fk.field, fk.parent));
    assert.equal(new Set(names).size, names.length, "外键约束名不得重复");

    // 生成列外键不支持 SET NULL / SET DEFAULT
    FOREIGN_KEYS.forEach((fk) => {
      assert.ok(
        ["RESTRICT", "NO ACTION", "CASCADE"].includes(fk.onDelete),
        `${fk.child}.${fk.field} 的 ON DELETE ${fk.onDelete} 在生成列外键上不被支持`,
      );
    });

    const idxNames = INDEXES.map((i) => `${i.collection}.${i.field}`);
    assert.equal(new Set(idxNames).size, idxNames.length, "索引定义不得重复");

    // 教师、学期这两类主数据必须用 RESTRICT——验收要求删除时有保护
    FOREIGN_KEYS.filter((fk) => ["teachers", "terms"].includes(fk.parent)).forEach((fk) => {
      assert.equal(fk.onDelete, "RESTRICT", `${fk.child}.${fk.field} → ${fk.parent} 必须为 RESTRICT`);
    });
  }

// ---------------------------------------------------------------------------
// 体检工具必须真的在查，且约束丢失后要能自动补回
//
// 这两条都是被真实事故打出来的：
//   1. 一次测试用例对工作库执行了 DROP TABLE CASCADE，外键与索引全部消失，
//      而应用重启只重建裸表——约束悄无声息地没了，直到「现场删一行确认被拒」
//      时才会发现删得掉。
//   2. 体检工具当时报「全部干净」。它只查了孤儿引用，没查约束在不在；
//      后来补的版本又因为表名带引号比对不上，把每张表都当成「还没建出来」
//      跳过，于是报「一个都不缺」——报通过、其实什么都没查，是这类工具
//      最坏的失败方式。
// ---------------------------------------------------------------------------
{
  const { auditConstraintsAndIndexes } = await import("../server/db/constraints.js");

  // 齐备状态下应通过
  const healthy = await auditConstraintsAndIndexes(db);
  assert.equal(
    healthy.ok,
    true,
    `刚建完约束就应体检通过，实际缺外键 ${JSON.stringify(healthy.missingForeignKeys)}、缺索引 ${JSON.stringify(healthy.missingIndexes)}`,
  );
  assert.ok(healthy.expectedForeignKeys > 0, "应确实核对了外键，而不是零条通过");
  assert.ok(healthy.expectedIndexes > 0, "应确实核对了索引");

  // 人为删掉一个外键，必须被发现并准确指出是哪一个
  const victim = FOREIGN_KEYS.find((fk) => fk.child === "classes" && fk.field === "termId");
  const conName = constraintOf(victim.child, victim.field, victim.parent);
  await db.query(`ALTER TABLE ${T(victim.child)} DROP CONSTRAINT ${conName}`);

  const broken = await auditConstraintsAndIndexes(db);
  assert.equal(broken.ok, false, "外键被删后体检必须失败——报通过等于给了虚假的安心");
  assert.equal(broken.missingForeignKeys.length, 1);
  assert.match(broken.missingForeignKeys[0], /classes\.termId/, "应指出是哪一条外键没了");

  // 补回来
  await ensureConstraintsAndIndexes(db, { log: () => {} });
  const repaired = await auditConstraintsAndIndexes(db);
  assert.equal(repaired.ok, true, "重新执行应能补齐");
  assert.equal(repaired.missingForeignKeys.length, 0);

  // 删索引同样要能发现
  await db.query(`DROP INDEX IF EXISTS ${indexOf("teachers", "name")}`);
  const noIndex = await auditConstraintsAndIndexes(db);
  assert.equal(noIndex.ok, false, "索引缺失也必须报出来");
  assert.ok(
    noIndex.missingIndexes.some((i) => /teachers\.name/.test(i)),
    `应指出缺的是哪个索引，实际 ${JSON.stringify(noIndex.missingIndexes)}`,
  );
  await ensureConstraintsAndIndexes(db, { log: () => {} });
  assert.equal((await auditConstraintsAndIndexes(db)).ok, true);
}

} catch (error) {
  failure = error;
} finally {
  await db.end().catch(() => {});
  const cleanup = new pg.Client({ connectionString: ADMIN_URL });
  await cleanup.connect();
  await cleanup.query(`DROP DATABASE IF EXISTS ${DB_NAME}`).catch(() => {});
  await cleanup.end();
}

if (failure) throw failure;

console.log("db constraints checks passed");
