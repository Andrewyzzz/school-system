import crypto from "node:crypto";
import pg from "pg";

// PostgreSQL 持久层引擎（第二阶段 M1）。
//
// 架构决策（见 docs/database-migration-plan.md）：
// - 业务逻辑继续操作内存中的 db 对象（一阶段已验证 3000 在线规模），本引擎只负责持久化；
// - 每个数组集合对应一张文档表 "app_<collectionKey>"（id/seq/data JSONB），
//   meta、payrollRules 等单例对象存入 app_singletons；
// - saveDatabase 时与影子快照做逐行 diff，只把变更行 upsert/delete 进事务，
//   替代 JSON 文件的全量重写；数组顺序通过 seq 列还原（terms/subjects 等顺序有语义）；
// - 行主键优先取业务 id，运行期缺 id 的行（如部分审计日志）由引擎补 _rowId；
// - 逐表列级规范化可在后续按表推进（引擎允许为单表挂自定义 mapper），不阻塞 M1。

const SINGLETON_TABLE = "app_singletons";
const REGISTRY_TABLE = "app_collections";
const UPSERT_CHUNK_SIZE = 500;

let pool = null;

export const postgresHealth = {
  configured: false,
  connected: false,
  lastPersistAt: "",
  lastPersistMs: 0,
  lastPersistUpserts: 0,
  lastPersistDeletes: 0,
  lastError: "",
};

export function postgresConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.PG_CONNECTION_STRING ||
    "postgresql://localhost:5432/school_system_dev"
  );
}

function getPool() {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: postgresConnectionString(),
      max: Number(process.env.PG_POOL_MAX || 10),
      idleTimeoutMillis: 30000,
    });
    pool.on("error", (error) => {
      postgresHealth.lastError = `${new Date().toISOString()} pool: ${error.message}`;
      console.error("[postgres] 连接池错误:", error.message);
    });
    postgresHealth.configured = true;
  }
  return pool;
}

function quotedTableFor(collectionKey) {
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(collectionKey)) {
    throw new Error(`非法集合名，拒绝建表: ${collectionKey}`);
  }
  return `"app_${collectionKey}"`;
}

function collectionKeys(db) {
  return Object.keys(db).filter((key) => Array.isArray(db[key]));
}

function singletonKeys(db) {
  return Object.keys(db).filter(
    (key) => !Array.isArray(db[key]) && db[key] !== null && typeof db[key] === "object",
  );
}

function rowIdFor(row) {
  if (row && typeof row === "object") {
    if (row.id !== undefined && row.id !== null && row.id !== "") return String(row.id);
    if (!row._rowId) row._rowId = crypto.randomUUID();
    return row._rowId;
  }
  throw new Error("集合行必须是对象");
}

// 影子快照：collection -> Map(rowId -> serialized)。serialized 含 seq，
// 行内容或数组位置变化都会触发该行重写。
const shadows = new WeakMap();

function shadowFor(db) {
  let shadow = shadows.get(db);
  if (!shadow) {
    shadow = { collections: new Map(), singletons: new Map(), knownTables: new Set() };
    shadows.set(db, shadow);
  }
  return shadow;
}

async function ensureBaseTables(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${REGISTRY_TABLE} (
      key text PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${SINGLETON_TABLE} (
      key text PRIMARY KEY,
      data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function ensureCollectionTable(client, shadow, collectionKey) {
  if (shadow.knownTables.has(collectionKey)) return;
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${quotedTableFor(collectionKey)} (
      id text PRIMARY KEY,
      seq bigint NOT NULL DEFAULT 0,
      data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await client.query(
    `INSERT INTO ${REGISTRY_TABLE} (key) VALUES ($1) ON CONFLICT (key) DO NOTHING;`,
    [collectionKey],
  );
  shadow.knownTables.add(collectionKey);
}

export async function postgresPing() {
  try {
    await getPool().query("SELECT 1");
    postgresHealth.connected = true;
    return true;
  } catch (error) {
    postgresHealth.connected = false;
    postgresHealth.lastError = `${new Date().toISOString()} ping: ${error.message}`;
    return false;
  }
}

// 启动加载：还原完整 db 对象；空库返回 null（由调用方决定种子或迁移）。
export async function loadDatabaseFromPostgres() {
  const client = await getPool().connect();
  try {
    await ensureBaseTables(client);
    const registry = await client.query(`SELECT key FROM ${REGISTRY_TABLE} ORDER BY key`);
    if (!registry.rows.length) return null;

    const db = {};
    const shadow = { collections: new Map(), singletons: new Map(), knownTables: new Set() };
    for (const { key } of registry.rows) {
      const rows = await client.query(
        `SELECT id, seq, data FROM ${quotedTableFor(key)} ORDER BY seq, id`,
      );
      db[key] = rows.rows.map((row) => row.data);
      const collectionShadow = new Map();
      rows.rows.forEach((row, index) => {
        collectionShadow.set(String(row.id), `${index}:${JSON.stringify(row.data)}`);
      });
      shadow.collections.set(key, collectionShadow);
      shadow.knownTables.add(key);
    }
    const singles = await client.query(`SELECT key, data FROM ${SINGLETON_TABLE}`);
    singles.rows.forEach((row) => {
      db[row.key] = row.data;
      shadow.singletons.set(row.key, JSON.stringify(row.data));
    });
    if (!db.meta) return null;
    shadows.set(db, shadow);
    postgresHealth.connected = true;
    return db;
  } finally {
    client.release();
  }
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

// 差量持久化：只写变更行。由 storage.js 的写合并层保证同一 db 不并发进入。
export async function persistDatabaseToPostgres(db) {
  const startedAt = Date.now();
  const shadow = shadowFor(db);
  const client = await getPool().connect();
  let upsertCount = 0;
  let deleteCount = 0;
  try {
    await ensureBaseTables(client);
    await client.query("BEGIN");

    for (const collectionKey of collectionKeys(db)) {
      await ensureCollectionTable(client, shadow, collectionKey);
      const rows = db[collectionKey];
      const previous = shadow.collections.get(collectionKey) || new Map();
      const next = new Map();
      const upserts = [];
      const seenIds = new Set();

      rows.forEach((row, index) => {
        const rowId = rowIdFor(row);
        if (seenIds.has(rowId)) {
          throw new Error(`集合 ${collectionKey} 存在重复主键 ${rowId}，拒绝持久化以避免数据覆盖`);
        }
        seenIds.add(rowId);
        const serializedData = JSON.stringify(row);
        const serialized = `${index}:${serializedData}`;
        next.set(rowId, serialized);
        if (previous.get(rowId) !== serialized) {
          upserts.push({ rowId, seq: index, serializedData });
        }
      });

      const deletions = [];
      previous.forEach((_, rowId) => {
        if (!next.has(rowId)) deletions.push(rowId);
      });

      for (const batch of chunk(upserts, UPSERT_CHUNK_SIZE)) {
        const values = [];
        const params = [];
        batch.forEach((item, index) => {
          const base = index * 3;
          values.push(`($${base + 1}, $${base + 2}, $${base + 3}::jsonb, now())`);
          params.push(item.rowId, item.seq, item.serializedData);
        });
        await client.query(
          `INSERT INTO ${quotedTableFor(collectionKey)} (id, seq, data, updated_at)
           VALUES ${values.join(", ")}
           ON CONFLICT (id) DO UPDATE SET seq = EXCLUDED.seq, data = EXCLUDED.data, updated_at = now();`,
          params,
        );
        upsertCount += batch.length;
      }
      for (const batch of chunk(deletions, UPSERT_CHUNK_SIZE)) {
        await client.query(
          `DELETE FROM ${quotedTableFor(collectionKey)} WHERE id = ANY($1::text[]);`,
          [batch],
        );
        deleteCount += batch.length;
      }

      shadow.collections.set(collectionKey, next);
    }

    for (const key of singletonKeys(db)) {
      const serialized = JSON.stringify(db[key]);
      if (shadow.singletons.get(key) !== serialized) {
        await client.query(
          `INSERT INTO ${SINGLETON_TABLE} (key, data, updated_at)
           VALUES ($1, $2::jsonb, now())
           ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now();`,
          [key, serialized],
        );
        shadow.singletons.set(key, serialized);
        upsertCount += 1;
      }
    }

    await client.query("COMMIT");
    postgresHealth.connected = true;
    postgresHealth.lastPersistAt = new Date().toISOString();
    postgresHealth.lastPersistMs = Date.now() - startedAt;
    postgresHealth.lastPersistUpserts = upsertCount;
    postgresHealth.lastPersistDeletes = deleteCount;
    return { upserts: upsertCount, deletes: deleteCount, ms: postgresHealth.lastPersistMs };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    // 回滚后影子快照与库内状态可能不一致，直接作废，下次全量重比对
    shadows.delete(db);
    postgresHealth.lastError = `${new Date().toISOString()} persist: ${error.message}`;
    console.error("[postgres] 持久化失败:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

// 规范化序列化：递归按键名排序。JSONB 存储会重排对象键序，
// 跨侧内容对比必须先规范化，否则同内容不同键序会误报差异。
function stableStringify(value) {
  if (Array.isArray(value)) {
    // JSON 语义：数组中的 undefined 序列化为 null
    return `[${value.map((item) => (item === undefined ? "null" : stableStringify(item))).join(",")}]`;
  }
  if (value && typeof value === "object") {
    // JSON 语义：值为 undefined 的键会被丢弃，必须与 JSONB 往返结果保持一致
    const keys = Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

// 双写核对 / 迁移核对：逐集合行数与逐行内容哈希对比
export async function diffDatabaseAgainstPostgres(db) {
  const client = await getPool().connect();
  try {
    await ensureBaseTables(client);
    const report = { collections: {}, singletons: {}, identical: true };
    for (const collectionKey of collectionKeys(db)) {
      const memoryRows = new Map(db[collectionKey].map((row) => [rowIdFor(row), stableStringify(row)]));
      let dbRows = new Map();
      try {
        const result = await client.query(`SELECT id, data FROM ${quotedTableFor(collectionKey)}`);
        dbRows = new Map(result.rows.map((row) => [String(row.id), stableStringify(row.data)]));
      } catch {
        // 表不存在按空表处理
      }
      let mismatched = 0;
      memoryRows.forEach((serialized, id) => {
        if (dbRows.get(id) !== serialized) mismatched += 1;
      });
      const onlyInDb = [...dbRows.keys()].filter((id) => !memoryRows.has(id)).length;
      report.collections[collectionKey] = {
        memoryCount: memoryRows.size,
        dbCount: dbRows.size,
        mismatched,
        onlyInDb,
      };
      if (mismatched || onlyInDb || memoryRows.size !== dbRows.size) report.identical = false;
    }
    for (const key of singletonKeys(db)) {
      const result = await client.query(`SELECT data FROM ${SINGLETON_TABLE} WHERE key = $1`, [key]);
      const matches = result.rows.length
        ? stableStringify(result.rows[0].data) === stableStringify(db[key])
        : false;
      report.singletons[key] = matches ? "match" : "mismatch";
      if (!matches) report.identical = false;
    }
    return report;
  } finally {
    client.release();
  }
}

// 测试/迁移辅助：清空全部应用表
export async function resetPostgresStore() {
  const client = await getPool().connect();
  try {
    await ensureBaseTables(client);
    const registry = await client.query(`SELECT key FROM ${REGISTRY_TABLE}`);
    await client.query("BEGIN");
    for (const { key } of registry.rows) {
      await client.query(`DROP TABLE IF EXISTS ${quotedTableFor(key)};`);
    }
    await client.query(`TRUNCATE ${REGISTRY_TABLE};`);
    await client.query(`TRUNCATE ${SINGLETON_TABLE};`);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function closePostgresPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
