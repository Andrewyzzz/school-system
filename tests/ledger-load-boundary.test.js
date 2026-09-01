// 账套作为加载边界（验收 8.5 / 8.15，以及校方真正关心的「数据多了加载慢」）
//
// 这个改动有一个会毁掉数据的失败模式：**部分加载之后再保存，持久层可能把
// 没加载进来的行当成「被删除了」而真的删掉**。归档的正是往年的课表和工资，
// 一旦被抹掉就再也回不来。所以第一条测试就是它。
//
// 其余要守住的：
//   · 过滤必须发生在 SQL 里。读回来再在 JS 里筛，省的只是堆内存，
//     数据库那一趟该读的还是全读了，「加载慢」原样存在。
//   · 主数据（教师、员工、班级）不能卸。业务代码到处按 ID 查它们，
//     卸掉会让往年数据查出一堆没有名字的 ID。
import assert from "node:assert/strict";
import pg from "pg";

const ADMIN_URL = process.env.TEST_ADMIN_URL || "postgresql://localhost:5432/postgres";
const DB_NAME = `school_ledger_load_${process.pid}`;
const TEST_URL = `postgresql://localhost:5432/${DB_NAME}`;

async function available() {
  const c = new pg.Client({ connectionString: ADMIN_URL });
  try {
    await c.connect();
    await c.end();
    return true;
  } catch {
    return false;
  }
}
if (!(await available())) {
  console.log("ledger load boundary checks skipped（本机无 PostgreSQL）");
  process.exit(0);
}

const admin = new pg.Client({ connectionString: ADMIN_URL });
await admin.connect();
await admin.query(`DROP DATABASE IF EXISTS "${DB_NAME}"`);
await admin.query(`CREATE DATABASE "${DB_NAME}"`);
await admin.end();

process.env.DATABASE_URL = TEST_URL;
process.env.DB_DRIVER = "postgres";

const { archivedLoadFilter, UNLOADABLE_COLLECTIONS } = await import("../server/ledgers.js");
const { loadDatabaseFromPostgres, persistDatabaseToPostgres, closePostgresPool } = await import(
  "../server/db/postgresStore.js"
);

let failure = null;
const probe = new pg.Client({ connectionString: TEST_URL });
await probe.connect();

const countIn = async (table) => {
  const { rows } = await probe.query(`SELECT count(*)::int n FROM "${table}"`);
  return rows[0].n;
};

try {
  // -------------------------------------------------------------------------
  // 1. 卸载范围：只卸期间数据，不卸主数据
  // -------------------------------------------------------------------------
  {
    const unloadable = Object.keys(UNLOADABLE_COLLECTIONS);
    assert.ok(unloadable.includes("lessonInstances"), "课次按年无界增长，是加载慢的主因，必须可卸");
    assert.ok(unloadable.includes("payrollDetails"), "工资单同理");

    for (const master of ["teachers", "employees", "accounts", "classes", "rooms", "terms"]) {
      assert.ok(
        !unloadable.includes(master),
        `${master} 是主数据，卸掉会让业务代码按 ID 查不到人/班级，往年数据会显示成一堆裸 ID`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // 2. 过滤规则本身
  // -------------------------------------------------------------------------
  {
    const none = archivedLoadFilter([{ type: "scheduling", period: "TERM-A", status: "active" }]);
    assert.deepEqual(none, {}, "没有归档账套时不应产生任何过滤");

    const locked = archivedLoadFilter([{ type: "scheduling", period: "TERM-A", status: "locked" }]);
    assert.deepEqual(locked, {}, "锁定 ≠ 归档：锁定的账套仍要能查，所以仍要加载");

    const filter = archivedLoadFilter([
      { type: "scheduling", period: "TERM-OLD", status: "archived" },
      { type: "payroll", period: "2025-01", status: "archived" },
    ]);
    assert.deepEqual(filter.lessonInstances, { field: "termId", skipValues: ["TERM-OLD"] });
    assert.deepEqual(filter.payrollDetails, { field: "month", skipValues: ["2025-01"] });
    assert.ok(!filter.teachers, "主数据不应出现在过滤规则里");
  }

  // -------------------------------------------------------------------------
  // 3. 端到端：归档后不加载，但库里的数据一条不少
  // -------------------------------------------------------------------------
  const db = {
    meta: { version: 1, updatedAt: new Date().toISOString() },
    ledgers: [
      { id: "LDG-scheduling-TERM-OLD", type: "scheduling", period: "TERM-OLD", status: "active" },
      { id: "LDG-scheduling-TERM-NEW", type: "scheduling", period: "TERM-NEW", status: "active" },
    ],
    teachers: [
      { id: "T0001", name: "李明" },
      { id: "T0002", name: "王芳" },
    ],
    lessonInstances: [],
  };
  for (let i = 1; i <= 60; i += 1) {
    db.lessonInstances.push({
      id: `L-OLD-${i}`,
      termId: "TERM-OLD",
      teacherId: "T0001",
      date: "2025-09-01",
      status: "completed",
    });
  }
  for (let i = 1; i <= 40; i += 1) {
    db.lessonInstances.push({
      id: `L-NEW-${i}`,
      termId: "TERM-NEW",
      teacherId: "T0002",
      date: "2026-06-15",
      status: "completed",
    });
  }

  await persistDatabaseToPostgres(db);
  assert.equal(await countIn("app_lessonInstances"), 100, "应先落库 100 条");

  // 全部 active 时应全部加载
  const full = await loadDatabaseFromPostgres();
  assert.equal(full.lessonInstances.length, 100, "没有归档账套时应全量加载");

  // 归档旧学期
  full.ledgers.find((l) => l.period === "TERM-OLD").status = "archived";
  await persistDatabaseToPostgres(full);

  const partial = await loadDatabaseFromPostgres();
  assert.equal(partial.lessonInstances.length, 40, "归档学期的课次不应加载进内存");
  assert.ok(
    partial.lessonInstances.every((l) => l.termId === "TERM-NEW"),
    "内存里不应残留归档学期的数据",
  );
  assert.equal(partial.teachers.length, 2, "主数据不受账套归档影响");
  assert.equal(
    await countIn("app_lessonInstances"),
    100,
    "库里必须仍有 100 条——归档是不加载，不是删除（验收 8.5：初始化不清除往年数据）",
  );

  // -------------------------------------------------------------------------
  // 4. 最要命的一条：部分加载后保存，不能把没加载的数据删掉
  //
  // 持久层的删除是「shadow 里有、内存里没有」的差集。如果 shadow 记的是
  // 全量而内存只有部分，那 60 条往年课次会被当成删除操作抹掉——
  // 而那正是学校要保留的历史数据。
  // -------------------------------------------------------------------------
  {
    // 在部分加载的状态下做一次正常的业务改动并保存
    partial.lessonInstances.push({
      id: "L-NEW-41",
      termId: "TERM-NEW",
      teacherId: "T0002",
      date: "2026-06-16",
      status: "completed",
    });
    const result = await persistDatabaseToPostgres(partial);

    assert.equal(
      await countIn("app_lessonInstances"),
      101,
      "保存后应是 100 + 1 条。少于此说明归档数据被当成删除抹掉了——这是不可逆的数据丢失",
    );
    assert.equal(result.deletes, 0, "部分加载状态下的保存不应产生任何删除");

    // 归档的那 60 条要能逐条查到
    const { rows } = await probe.query(
      `SELECT count(*)::int n FROM "app_lessonInstances" WHERE data->>'termId' = 'TERM-OLD'`,
    );
    assert.equal(rows[0].n, 60, "归档学期的 60 条课次必须原封不动");
  }

  // -------------------------------------------------------------------------
  // 5. 真删除仍要正常工作
  //
  // 上一条如果做过头（比如干脆不算删除了），会让真正的删除也失效。
  // -------------------------------------------------------------------------
  {
    const current = await loadDatabaseFromPostgres();
    const before = current.lessonInstances.length;
    current.lessonInstances = current.lessonInstances.filter((l) => l.id !== "L-NEW-1");
    const result = await persistDatabaseToPostgres(current);
    assert.equal(result.deletes, 1, "已加载数据的正常删除必须仍然生效");
    assert.equal(await countIn("app_lessonInstances"), 100);
    assert.equal(current.lessonInstances.length, before - 1);

    // 但归档的仍然没被碰
    const { rows } = await probe.query(
      `SELECT count(*)::int n FROM "app_lessonInstances" WHERE data->>'termId' = 'TERM-OLD'`,
    );
    assert.equal(rows[0].n, 60);
  }

  // -------------------------------------------------------------------------
  // 6. 过滤发生在 SQL 里，不是读回来再筛
  //
  // 读回来再筛省的只是 JS 堆，数据库那一趟该读的还是全读了——
  // 而校方抱怨的正是「加载慢」。
  // -------------------------------------------------------------------------
  {
    const source = await import("node:fs").then((fs) =>
      fs.readFileSync(new URL("../server/db/postgresStore.js", import.meta.url), "utf8"),
    );
    const loadFn = source.slice(source.indexOf("export async function loadDatabaseFromPostgres"));
    const body = loadFn.slice(0, loadFn.indexOf("\nexport "));
    assert.match(body, /WHERE data->>/, "过滤必须写在 SQL 的 WHERE 里");
    assert.ok(
      !/rows\.rows\.filter\(/.test(body),
      "不应把全量读回来再用 JS filter——那样数据库那一趟没省下来",
    );
  }


  // -------------------------------------------------------------------------
  // 8. 归档的数据必须仍然查得到（验收 8.5 / 8.15）
  //
  // 这一条是补上一个我自己造成的窟窿：先做了「卸载」拿到 4 倍加载提速，
  // 却没做「按需读取」。数据还在库里，但业务代码只读内存，往年课表就查不到了——
  // 8.5「不清除往年数据」和 8.15「跨年度检索」原本是过的，被改成了不过。
  //
  // 只卸载不给读取路径，比不卸载更糟：占着磁盘，却谁也用不了。
  // -------------------------------------------------------------------------
  {
    const { resolveLedgerRows } = await import("../server/ledgers.js");
    const { queryArchivedRows } = await import("../server/db/postgresStore.js");

    const current = await loadDatabaseFromPostgres();
    assert.ok(
      !current.lessonInstances.some((l) => l.termId === "TERM-OLD"),
      "前提：归档学期的课次确实不在内存里",
    );

    // 直接从库里读归档数据
    const archived = await queryArchivedRows("lessonInstances", { termId: "TERM-OLD" });
    assert.equal(archived.length, 60, "归档学期的 60 条课次必须能从库中读出来");
    assert.ok(archived.every((l) => l.termId === "TERM-OLD"));
    assert.ok(archived[0].teacherId, "读出来的应是完整记录，不是只有 id");

    // 解析器：调用方不必知道那个学年归没归档
    const viaResolver = await resolveLedgerRows(
      current,
      "lessonInstances",
      { termId: "TERM-OLD" },
      { queryArchivedRows },
    );
    assert.equal(viaResolver.length, 60, "解析器应对归档账套走数据库");

    const loadedTerm = await resolveLedgerRows(
      current,
      "lessonInstances",
      { termId: "TERM-NEW" },
      { queryArchivedRows },
    );
    assert.ok(loadedTerm.length > 0, "未归档账套应直接用内存里的数据");
    assert.ok(loadedTerm.every((l) => l.termId === "TERM-NEW"), "不应混入其他学期");

    // 没注入读取器却要读归档数据：必须报错，不能悄悄返回空数组。
    // 返回空会让界面显示「这个学年没有课表」，而实际是有的——
    // 一个说谎的空结果比一个报错难查得多。
    await assert.rejects(
      () => resolveLedgerRows(current, "lessonInstances", { termId: "TERM-OLD" }, {}),
      /已归档.*读取器|未配置读取器/,
      "取不到归档数据时必须报错，不能返回空数组冒充「没有数据」",
    );

    // 按教师筛选也要能走归档
    const oneTeacher = await queryArchivedRows("lessonInstances", {
      termId: "TERM-OLD",
      teacherId: "T0001",
    });
    assert.equal(oneTeacher.length, 60, "跨年度按教师检索应可用（8.15）");

    // 字段名要防注入
    await assert.rejects(
      () => queryArchivedRows("lessonInstances", { "termId'; DROP TABLE x; --": "x" }),
      /非法字段名/,
    );
  }

  // -------------------------------------------------------------------------
  // 7. 老库兼容：没有 ledgers 表时退化成全量加载
  // -------------------------------------------------------------------------
  {
    await probe.query(`DELETE FROM "app_ledgers"`);
    await probe.query(`DELETE FROM app_collections WHERE key = 'ledgers'`).catch(() => {});
    const legacy = await loadDatabaseFromPostgres();
    assert.equal(
      legacy.lessonInstances.length,
      100,
      "没有账套记录时应全量加载，与改动前行为一致——否则升级上来的老库会突然少数据",
    );
  }
} catch (error) {
  failure = error;
} finally {
  await probe.end().catch(() => {});
  await closePostgresPool().catch(() => {});
  const cleanup = new pg.Client({ connectionString: ADMIN_URL });
  await cleanup.connect();
  await cleanup
    .query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid<>pg_backend_pid()`, [
      DB_NAME,
    ])
    .catch(() => {});
  await cleanup.query(`DROP DATABASE IF EXISTS "${DB_NAME}"`).catch((e) => {
    console.warn(`[cleanup] 临时库未能删除：${e.message}`);
  });
  await cleanup.end();
}

if (failure) throw failure;
console.log("ledger load boundary checks passed");
