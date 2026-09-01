// 数据库层的引用完整性与查询索引
//
// 背景：业务数据用文档式表存放（id / seq / data JSONB），字段都在 data 里，
// 数据库"看不见" data.teacherId 这类引用，因此原本无法建外键——引用完整性
// 全靠应用层保证。有库权限的人直接写 SQL 就能造出孤儿数据，且不留痕。
//
// 做法：用 PostgreSQL 的生成列把 data 里的引用字段提取成真实的列，再对生成列
// 建外键。这样既保留文档式存储（业务字段增删不需要 DDL 迁移），又拿到数据库层
// 的硬约束——删除仍被引用的教师、写入不存在的班级，都会被数据库直接拒绝。
//
// 生成列是 STORED 的，随行写入自动维护，应用层代码一行不用改。

// 引用关系：子集合的 data.<字段> → 父集合的 id
//
// onDelete 取值：
//   RESTRICT —— 存在引用时禁止删除父行。用于教师、学期这类"删了就丢历史"的主数据。
//   SET NULL —— 父行删除后把引用置空。用于教室这类可以缺失的可选引用。
export const FOREIGN_KEYS = [
  // 学期：删掉学期会让该学期的课表、工资全部失去归属，一律禁止
  { child: "classes", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "rooms", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "gradeCourseRules", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "scheduleConstraints", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "schedulePeriodTemplates", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "roomResourceOverrides", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "teacherAssignments", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "teacherScheduleRules", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "scheduleDrafts", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "scheduleVersions", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "scheduleChangeRequests", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "lessonInstances", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "payrollDetails", field: "termId", parent: "terms", onDelete: "RESTRICT" },
  { child: "termBudgets", field: "termId", parent: "terms", onDelete: "RESTRICT" },

  // 教师：验收清单 7.6 明确要求「删除教职工时配套课时、薪资数据有保护机制」。
  // 系统本身不做物理删除（离职走状态流转），这道约束是防止绕过应用层直接删库。
  { child: "lessonInstances", field: "teacherId", parent: "teachers", onDelete: "RESTRICT" },
  { child: "payrollDetails", field: "teacherId", parent: "teachers", onDelete: "RESTRICT" },
  { child: "workloadConfirmations", field: "teacherId", parent: "teachers", onDelete: "RESTRICT" },
  { child: "employees", field: "teacherId", parent: "teachers", onDelete: "RESTRICT" },

  // 班级：课次挂在班级上，删班级会让课次失去归属
  { child: "lessonInstances", field: "classId", parent: "classes", onDelete: "RESTRICT" },

  // 教室：本想用 SET NULL（教室可缺失），但生成列的值由 data 推导而来，
  // PostgreSQL 不允许对含生成列的外键使用 SET NULL——数据库没法单独把它置空。
  // 因此同样用 RESTRICT：要删教室，先由应用层把引用它的课次改掉。
  { child: "lessonInstances", field: "roomId", parent: "rooms", onDelete: "RESTRICT" },
  { child: "classes", field: "roomId", parent: "rooms", onDelete: "RESTRICT" },
];

// 高频查询字段索引（验收清单 7.7）。文档式存储需要建表达式索引，
// 普通 B-tree 索引对 data->>'x' 无效。
export const INDEXES = [
  { collection: "teachers", field: "employeeNo" },
  { collection: "teachers", field: "name" },
  { collection: "teachers", field: "stageId" },
  { collection: "teachers", field: "status" },
  { collection: "employees", field: "employeeNo" },
  { collection: "employees", field: "personName" },
  { collection: "employees", field: "status" },
  { collection: "lessonInstances", field: "date" },
  { collection: "lessonInstances", field: "status" },
  { collection: "payrollDetails", field: "month" },
  { collection: "payrollDetails", field: "status" },
  { collection: "workloadConfirmations", field: "month" },
  { collection: "classes", field: "stageId" },
  { collection: "oaRequests", field: "status" },
  { collection: "notifications", field: "createdAt" },
];

const IDENT = /^[a-zA-Z][a-zA-Z0-9_]*$/;
// 生成列外键只支持这两种：SET NULL / SET DEFAULT 会被 PostgreSQL 拒绝
const ALLOWED_ON_DELETE = new Set(["RESTRICT", "NO ACTION", "CASCADE"]);

function assertIdent(value, what) {
  if (!IDENT.test(value)) throw new Error(`非法${what}，拒绝执行 DDL：${value}`);
}

export function tableOf(collectionKey) {
  assertIdent(collectionKey, "集合名");
  return `"app_${collectionKey}"`;
}

// 生成列名：teacherId → fk_teacher_id，与 data 里的驼峰字段区分开
export function columnOf(field) {
  assertIdent(field, "字段名");
  return `fk_${field.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)}`;
}

export function constraintOf(child, field, parent) {
  return `fk_${child}_${field}_${parent}`.replace(/[A-Z]/g, (c) => c.toLowerCase());
}

export function indexOf(collection, field) {
  return `idx_${collection}_${field}`.replace(/[A-Z]/g, (c) => c.toLowerCase());
}

async function tableExists(client, collectionKey) {
  const { rows } = await client.query(
    "select 1 from information_schema.tables where table_schema='public' and table_name=$1",
    [`app_${collectionKey}`],
  );
  return rows.length > 0;
}

async function columnExists(client, collectionKey, column) {
  const { rows } = await client.query(
    "select 1 from information_schema.columns where table_schema='public' and table_name=$1 and column_name=$2",
    [`app_${collectionKey}`, column],
  );
  return rows.length > 0;
}

async function constraintExists(client, name) {
  const { rows } = await client.query(
    "select 1 from information_schema.table_constraints where table_schema='public' and constraint_name=$1",
    [name],
  );
  return rows.length > 0;
}

/**
 * 建生成列 + 外键。幂等：已存在的跳过。
 * 存量数据若有孤儿引用，ALTER TABLE 会失败——这是有意的，先清洗再加约束，
 * 不能用 NOT VALID 绕过，否则约束形同虚设。
 */
export async function ensureForeignKeys(client, { log = () => {} } = {}) {
  const applied = [];
  const skipped = [];
  for (const fk of FOREIGN_KEYS) {
    const { child, field, parent, onDelete } = fk;
    if (!(await tableExists(client, child)) || !(await tableExists(client, parent))) {
      skipped.push(`${child}.${field}（表不存在）`);
      continue;
    }
    if (!ALLOWED_ON_DELETE.has(onDelete)) {
      throw new Error(`生成列外键不支持 ON DELETE ${onDelete}（${child}.${field}）`);
    }
    const col = columnOf(field);
    const name = constraintOf(child, field, parent);
    if (await constraintExists(client, name)) continue;

    if (!(await columnExists(client, child, col))) {
      await client.query(
        `ALTER TABLE ${tableOf(child)} ADD COLUMN ${col} text
         GENERATED ALWAYS AS (NULLIF(data->>'${field}', '')) STORED`,
      );
    }
    // DEFERRABLE INITIALLY DEFERRED：约束在事务提交时统一检查，而不是每条语句立即检查。
    // 持久化是按集合逐个写入的，同一次保存里「新建学期 + 新建引用该学期的班级」时，
    // 若 classes 先于 terms 写入，立即检查会误判为违反外键。延迟到提交时，
    // 中间状态不再被拦，最终一致性照样有保障——脏数据仍然提交不进去。
    await client.query(
      `ALTER TABLE ${tableOf(child)} ADD CONSTRAINT ${name}
       FOREIGN KEY (${col}) REFERENCES ${tableOf(parent)}(id) ON DELETE ${onDelete}
       DEFERRABLE INITIALLY DEFERRED`,
    );
    // 外键列必须建索引，否则父表删除时要全表扫子表
    await client.query(
      `CREATE INDEX IF NOT EXISTS ${name}_idx ON ${tableOf(child)} (${col})`,
    );
    applied.push(`${child}.${field} → ${parent}`);
    log(`  外键 ${child}.${field} → ${parent} (${onDelete})`);
  }
  return { applied, skipped };
}

/** 高频查询字段的表达式索引。幂等。 */
export async function ensureIndexes(client, { log = () => {} } = {}) {
  const applied = [];
  for (const { collection, field } of INDEXES) {
    if (!(await tableExists(client, collection))) continue;
    assertIdent(field, "字段名");
    const name = indexOf(collection, field);
    await client.query(
      `CREATE INDEX IF NOT EXISTS ${name} ON ${tableOf(collection)} ((data->>'${field}'))`,
    );
    applied.push(`${collection}.${field}`);
    log(`  索引 ${collection}.${field}`);
  }
  return { applied };
}

export async function ensureConstraintsAndIndexes(client, options = {}) {
  const fk = await ensureForeignKeys(client, options);
  const idx = await ensureIndexes(client, options);
  return { foreignKeys: fk, indexes: idx };
}

/**
 * 体检：逐条核对外键与索引**是否真的在库里**。
 *
 * 原先的 --check 只查孤儿引用，然后报「21 个引用关系全部干净」——
 * 数据干净和约束存在是两回事。一次 DROP TABLE 之后约束全没了，
 * 体检照样报干净，等于给了虚假的安心。
 */
export async function auditConstraintsAndIndexes(client) {
  const missingForeignKeys = [];
  const missingIndexes = [];
  const missingColumns = [];

  const { rows: tables } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname='public'`,
  );
  const present = new Set(tables.map((r) => r.tablename));

  // tableOf() 返回的是带引号的标识符（"app_classes"），而 pg_tables.tablename
  // 是裸名（app_classes）。直接拿来比对永远不相等，于是每张表都被当成
  // 「还没建出来」跳过，最后报「一个都不缺」——正是这类工具最坏的失败方式：
  // 报通过，其实什么都没查。
  const bare = (collectionKey) => tableOf(collectionKey).replace(/^"|"$/g, "");

  for (const fk of FOREIGN_KEYS) {
    const child = bare(fk.child);
    // 表还没建出来的不算缺失：新库在应用首次写入前本来就没有这些表
    if (!present.has(child)) continue;

    const column = columnOf(fk.field);
    const { rows: col } = await client.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema='public' AND table_name=$1 AND column_name=$2`,
      [child, column],
    );
    if (!col.length) missingColumns.push(`${child}.${column}`);

    const { rows: con } = await client.query(
      `SELECT 1 FROM pg_constraint WHERE conname=$1 AND connamespace='public'::regnamespace`,
      [constraintOf(fk.child, fk.field, fk.parent)],
    );
    if (!con.length) missingForeignKeys.push(`${fk.child}.${fk.field} → ${fk.parent}`);
  }

  for (const index of INDEXES) {
    if (!present.has(bare(index.collection))) continue;
    const { rows } = await client.query(
      `SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname=$1`,
      [indexOf(index.collection, index.field)],
    );
    if (!rows.length) missingIndexes.push(`${index.collection}.${index.field}`);
  }

  return {
    ok: missingForeignKeys.length === 0 && missingIndexes.length === 0 && missingColumns.length === 0,
    expectedForeignKeys: FOREIGN_KEYS.length,
    expectedIndexes: INDEXES.length,
    missingForeignKeys,
    missingIndexes,
    missingColumns,
  };
}
