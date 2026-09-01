// 数据库账号权限隔离（验收 7.12 / 7.13）与审计表只追加保护（验收 3.27）
//
// 验收方式是**直接用运维账号连库去读写薪资表，确认被拒**。所以隔离必须做在
// 数据库的 GRANT 层，而不是应用层——应用层的判断在 psql 面前一文不值。
//
// 三个角色：
//   school_app       程序账号。应用连库用它，对全部业务表有增删改查。
//   school_ops       运维账号。日常巡检、查排课、导数据用它，但对薪资与人事
//                    敏感表**一律无权**：连 SELECT 都拿不到。
//   school_readonly  只读账号。给报表工具或临时排查用，同样看不到敏感表。
//
// 关于「REVOKE 不够」这件事：PostgreSQL 里新建的表默认会从 PUBLIC 继承一些
// 权限，且未来新建的表不会自动套用旧的 GRANT。所以除了对现有表授权，还必须
// 用 ALTER DEFAULT PRIVILEGES 管住「以后再建的表」，否则加一张新的薪资表就
// 出现一个权限缺口，而且没人会发现。

// 敏感表：薪资与人事档案。运维账号对这些表没有任何权限。
export const SENSITIVE_COLLECTIONS = [
  "payrollDetails", // 工资单（金额已加密，但连密文也不该给运维看）
  "payrollBatches", // 批量生成/锁定记录
  "payrollRules", // 薪资制度参数
  "hrEmployees", // 人事档案（身份证、银行卡）
  "hrContracts", // 合同
  "hrSalaryRecords", // 薪资异动
  "accounts", // 口令散列
  "sessions", // 会话令牌
];

// 审计类表：只允许追加，任何人（含程序账号）都不能改和删
export const APPEND_ONLY_COLLECTIONS = ["auditLogs", "hrAuditLogs"];

export const DB_ROLES = {
  app: "school_app",
  ops: "school_ops",
  readonly: "school_readonly",
};

// 只追加保护的触发器函数。审计相关的两处都要用，所以提出来共用。
const APPEND_ONLY_TRIGGER_FN = `
  CREATE OR REPLACE FUNCTION audit_append_only() RETURNS trigger AS $$
  BEGIN
    RAISE EXCEPTION '审计日志表 % 只允许追加，不得修改或删除（操作：%）', TG_TABLE_NAME, TG_OP
      USING ERRCODE = 'raise_exception';
  END;
  $$ LANGUAGE plpgsql;
`;

const IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function quoteIdent(name) {
  if (!IDENT.test(name)) throw new Error(`非法标识符：${name}`);
  return `"${name}"`;
}

/** 与 postgresStore 一致的表名规则 */
export function tableNameOf(collectionKey) {
  return `app_${collectionKey}`;
}

function quotedTable(collectionKey) {
  return `"${tableNameOf(collectionKey)}"`;
}

async function roleExists(client, role) {
  const { rows } = await client.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [role]);
  return rows.length > 0;
}

async function listAppTables(client) {
  const { rows } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'app\\_%'`,
  );
  return rows.map((r) => r.tablename);
}

/**
 * 建角色 + 授权。幂等，可重复执行。
 *
 * passwords 为空时只建角色不设口令（适合已有角色、只想重新授权的场景）；
 * 生产环境必须显式传入，绝不在代码里写死默认口令。
 */
export async function provisionDatabaseRoles(client, options = {}) {
  const { appPassword = "", opsPassword = "", readonlyPassword = "", dryRun = false } = options;
  const statements = [];
  const exec = async (sql, params) => {
    statements.push(sql.trim().replace(/\s+/g, " ").slice(0, 160));
    if (!dryRun) await client.query(sql, params);
  };

  const dbName = (await client.query("SELECT current_database() AS db")).rows[0].db;
  const tables = await listAppTables(client);
  const sensitive = new Set(SENSITIVE_COLLECTIONS.map(tableNameOf));
  const nonSensitive = tables.filter((t) => !sensitive.has(t));
  const presentSensitive = tables.filter((t) => sensitive.has(t));

  // --- 角色 ---
  for (const [key, role] of Object.entries(DB_ROLES)) {
    const password = { app: appPassword, ops: opsPassword, readonly: readonlyPassword }[key];
    const exists = await roleExists(client, role);
    if (!exists) {
      // NOLOGIN 时先建后授权；有口令才允许登录
      await exec(
        `CREATE ROLE ${quoteIdent(role)} ${password ? "LOGIN PASSWORD " + literal(password) : "NOLOGIN"}`,
      );
    } else if (password) {
      await exec(`ALTER ROLE ${quoteIdent(role)} WITH LOGIN PASSWORD ${literal(password)}`);
    }
    await exec(`GRANT CONNECT ON DATABASE ${quoteIdent(dbName)} TO ${quoteIdent(role)}`);
    await exec(`GRANT USAGE ON SCHEMA public TO ${quoteIdent(role)}`);
  }

  // --- 先全部收回，再按角色发放 ---
  // 不先收回的话，之前多授出去的权限会一直留着；把某张表加进敏感清单时，
  // 运维账号原有的读写权限不会自动消失，等于改了清单却没生效。
  for (const role of Object.values(DB_ROLES)) {
    await exec(`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM ${quoteIdent(role)}`);
  }
  // PUBLIC 也要收：默认权限会让任何能连库的角色摸到表
  await exec(`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC`);

  // 程序账号：全部业务表可读写
  await exec(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${quoteIdent(DB_ROLES.app)}`,
  );

  // 运维账号：只给非敏感表；敏感表一条权限都不给
  for (const table of nonSensitive) {
    await exec(`GRANT SELECT, INSERT, UPDATE, DELETE ON "${table}" TO ${quoteIdent(DB_ROLES.ops)}`);
    await exec(`GRANT SELECT ON "${table}" TO ${quoteIdent(DB_ROLES.readonly)}`);
  }

  // --- 未来新建的表 ---
  // 只对 app 设默认授权。ops 与 readonly 故意不设：新表默认无权，
  // 需要时显式跑一次授权脚本。宁可少给了要补，也不能多给了没人知道。
  await exec(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${quoteIdent(DB_ROLES.app)}`,
  );
  await exec(`ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC`);

  // --- 审计表只追加（验收 3.27）---
  // 无条件创建，不放在循环里：它是 ensureDatabaseAuditLog 也要用的公共依赖，
  // 挂在「恰好存在某张审计表」这个条件上，换个调用顺序就报「函数不存在」。
  await exec(APPEND_ONLY_TRIGGER_FN);

  const appendOnly = APPEND_ONLY_COLLECTIONS.map(tableNameOf).filter((t) => tables.includes(t));
  for (const table of appendOnly) {
    // 连程序账号也只给 INSERT/SELECT：应用没有任何改写审计的正当理由
    await exec(`REVOKE UPDATE, DELETE, TRUNCATE ON "${table}" FROM ${quoteIdent(DB_ROLES.app)}`);
    await exec(`REVOKE ALL ON "${table}" FROM ${quoteIdent(DB_ROLES.ops)}`);
    await exec(`GRANT SELECT, INSERT ON "${table}" TO ${quoteIdent(DB_ROLES.app)}`);
    await exec(`GRANT SELECT ON "${table}" TO ${quoteIdent(DB_ROLES.readonly)}`);
    // 权限之外再加一层触发器：库主（superuser/owner）不受 GRANT 约束，
    // 只靠 REVOKE 挡不住他。触发器对所有人生效。
    await exec(`DROP TRIGGER IF EXISTS trg_audit_append_only ON "${table}"`);
    await exec(`
      CREATE TRIGGER trg_audit_append_only
      BEFORE UPDATE OR DELETE ON "${table}"
      FOR EACH ROW EXECUTE FUNCTION audit_append_only();
    `);
  }

  return {
    database: dbName,
    roles: Object.values(DB_ROLES),
    tableCount: tables.length,
    sensitiveTables: presentSensitive,
    appendOnlyTables: appendOnly,
    statements,
  };
}

// pg 不支持给 CREATE ROLE 的口令用占位符，只能自己转义
function literal(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

/**
 * 体检：逐条核对权限是否符合预期，返回不合规项。
 * 验收现场用这个出示证据，比口头说「已经隔离了」有用。
 */
export async function auditDatabaseRoles(client) {
  const findings = [];
  const tables = await listAppTables(client);
  const sensitive = SENSITIVE_COLLECTIONS.map(tableNameOf).filter((t) => tables.includes(t));
  const appendOnly = APPEND_ONLY_COLLECTIONS.map(tableNameOf).filter((t) => tables.includes(t));

  for (const role of Object.values(DB_ROLES)) {
    if (!(await roleExists(client, role))) {
      findings.push({ level: "error", role, message: `角色 ${role} 不存在` });
    }
  }
  if (findings.length) return { ok: false, findings, checked: 0 };

  let checked = 0;
  const has = async (role, table, priv) => {
    checked += 1;
    // 表名必须带引号传入：app_payrollDetails 含大写字母，不加引号会被
    // PostgreSQL 折叠成 app_payrolldetails，然后报「表不存在」。
    const { rows } = await client.query("SELECT has_table_privilege($1, $2, $3) AS ok", [
      role,
      `"${table}"`,
      priv,
    ]);
    return rows[0].ok;
  };

  // 敏感表：ops 与 readonly 必须一条权限都没有
  for (const table of sensitive) {
    for (const role of [DB_ROLES.ops, DB_ROLES.readonly]) {
      for (const priv of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
        if (await has(role, table, priv)) {
          findings.push({ level: "error", role, table, priv, message: `${role} 不应对敏感表 ${table} 有 ${priv} 权限` });
        }
      }
    }
    if (!(await has(DB_ROLES.app, table, "SELECT"))) {
      findings.push({ level: "error", role: DB_ROLES.app, table, message: `程序账号缺少 ${table} 的读权限，应用会跑不起来` });
    }
  }

  // 审计表：任何角色都不得有 UPDATE / DELETE
  for (const table of appendOnly) {
    for (const role of Object.values(DB_ROLES)) {
      for (const priv of ["UPDATE", "DELETE"]) {
        if (await has(role, table, priv)) {
          findings.push({ level: "error", role, table, priv, message: `审计表 ${table} 不得授予 ${priv}` });
        }
      }
    }
    const { rows } = await client.query(
      `SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_append_only' AND tgrelid = $1::regclass`,
      [`"${table}"`],
    );
    if (!rows.length) {
      findings.push({ level: "error", table, message: `审计表 ${table} 缺少只追加触发器，库主仍可改写` });
    }
  }

  // 非敏感表：ops 应当能读，否则运维没法干活
  const nonSensitive = tables.filter((t) => !sensitive.includes(t) && !appendOnly.includes(t));
  for (const table of nonSensitive.slice(0, 5)) {
    if (!(await has(DB_ROLES.ops, table, "SELECT"))) {
      findings.push({ level: "warn", role: DB_ROLES.ops, table, message: `运维账号读不到 ${table}，日常巡检会受阻` });
    }
  }

  return {
    ok: findings.filter((f) => f.level === "error").length === 0,
    findings,
    checked,
    sensitiveTables: sensitive,
    appendOnlyTables: appendOnly,
  };
}

// ---------------------------------------------------------------------------
// 数据库层操作日志（验收 7.14 / 7.15）
//
// 应用层已有审计（谁在界面上做了什么），但它答不了最要紧的那个问题：
// **有没有人绕过应用直接改库**。所以这一层记的是数据库自己看到的事实——
// 哪个数据库账号、在什么时候、动了哪张表的哪一行。
//
// 与 pgaudit 的分工：
//   pgaudit  能记 SELECT（触发器做不到），但只写到服务器日志文件里，
//            要查得去翻日志，且日志会轮转丢失。
//   本方案   只记增删改，但落在可查询的表里，且受只追加保护。
// 两者互补，7.14 要求「增删改查」全覆盖，所以两个都要配。
//
// 不记录字段的完整前后值，只记变更的字段名：工资表的 data 列是密文，
// 把它复制一份进审计表只是让密文多存一遍；而真正要回答的
// 「谁动了这一行」，有表名、行 ID、账号、时间就够了。

export const DB_AUDIT_TABLE = "db_audit_log";

export async function ensureDatabaseAuditLog(client, collections = SENSITIVE_COLLECTIONS) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "${DB_AUDIT_TABLE}" (
      id bigserial PRIMARY KEY,
      occurred_at timestamptz NOT NULL DEFAULT now(),
      db_user text NOT NULL,
      app_actor text,
      table_name text NOT NULL,
      operation text NOT NULL,
      row_id text,
      changed_fields text[],
      client_addr inet
    )
  `);
  await client.query(
    `CREATE INDEX IF NOT EXISTS idx_db_audit_table_time ON "${DB_AUDIT_TABLE}" (table_name, occurred_at DESC)`,
  );
  await client.query(
    `CREATE INDEX IF NOT EXISTS idx_db_audit_row ON "${DB_AUDIT_TABLE}" (row_id)`,
  );

  await client.query(`
    CREATE OR REPLACE FUNCTION record_db_audit() RETURNS trigger AS $$
    DECLARE
      changed text[];
      target text;
    BEGIN
      IF TG_OP = 'UPDATE' THEN
        -- 只比 data 列的顶层键，逐个字段展开在大 JSON 上代价太高
        SELECT array_agg(key) INTO changed
        FROM jsonb_each(NEW.data)
        WHERE OLD.data -> key IS DISTINCT FROM NEW.data -> key;
        target := NEW.id;
      ELSIF TG_OP = 'DELETE' THEN
        target := OLD.id;
      ELSE
        target := NEW.id;
      END IF;

      INSERT INTO "${DB_AUDIT_TABLE}"
        (db_user, app_actor, table_name, operation, row_id, changed_fields, client_addr)
      VALUES (
        session_user,
        -- 应用可通过 SET LOCAL app.actor 把业务操作人带进来；
        -- 直接用 psql 改库的人不会去设它，这恰好成了区分特征。
        current_setting('app.actor', true),
        TG_TABLE_NAME,
        TG_OP,
        target,
        changed,
        inet_client_addr()
      );
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  const tables = await listAppTables(client);
  const targets = collections.map(tableNameOf).filter((t) => tables.includes(t));
  for (const table of targets) {
    await client.query(`DROP TRIGGER IF EXISTS trg_db_audit ON "${table}"`);
    await client.query(`
      CREATE TRIGGER trg_db_audit
      AFTER INSERT OR UPDATE OR DELETE ON "${table}"
      FOR EACH ROW EXECUTE FUNCTION record_db_audit();
    `);
  }

  // 审计表本身也必须只追加，否则改完库再把痕迹删掉就行了
  // 自己也建一次：本函数可以独立调用，不该假定 provisionDatabaseRoles 先跑过
  await client.query(APPEND_ONLY_TRIGGER_FN);
  await client.query(`DROP TRIGGER IF EXISTS trg_db_audit_append_only ON "${DB_AUDIT_TABLE}"`);
  await client.query(`
    CREATE TRIGGER trg_db_audit_append_only
    BEFORE UPDATE OR DELETE ON "${DB_AUDIT_TABLE}"
    FOR EACH ROW EXECUTE FUNCTION audit_append_only();
  `);
  // 程序账号只能写入与查看
  for (const role of Object.values(DB_ROLES)) {
    await client.query(`REVOKE ALL ON "${DB_AUDIT_TABLE}" FROM ${quoteIdent(role)}`);
  }
  await client.query(`GRANT SELECT, INSERT ON "${DB_AUDIT_TABLE}" TO ${quoteIdent(DB_ROLES.app)}`);
  await client.query(`GRANT SELECT ON "${DB_AUDIT_TABLE}" TO ${quoteIdent(DB_ROLES.readonly)}`);
  // 触发器以 SECURITY DEFINER 运行，所以即便某个角色对审计表无写权限，
  // 它的增删改仍然会被记录下来——这正是我们要的。
  await client.query(`GRANT USAGE, SELECT ON SEQUENCE "${DB_AUDIT_TABLE}_id_seq" TO ${quoteIdent(DB_ROLES.app)}`);

  return { table: DB_AUDIT_TABLE, watchedTables: targets };
}

/** 查询某一行的改动历史，供 7.15「修改可溯源」现场演示 */
export async function queryDatabaseAudit(client, options = {}) {
  const { table = "", rowId = "", limit = 50 } = options;
  const where = [];
  const params = [];
  if (table) {
    params.push(table.startsWith("app_") ? table : tableNameOf(table));
    where.push(`table_name = $${params.length}`);
  }
  if (rowId) {
    params.push(rowId);
    where.push(`row_id = $${params.length}`);
  }
  params.push(Math.min(Number(limit) || 50, 500));
  const { rows } = await client.query(
    `SELECT occurred_at, db_user, app_actor, table_name, operation, row_id, changed_fields, host(client_addr) AS client_addr
     FROM "${DB_AUDIT_TABLE}"
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY occurred_at DESC, id DESC
     LIMIT $${params.length}`,
    params,
  );
  return rows;
}
