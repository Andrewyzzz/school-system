#!/usr/bin/env node
// 数据库账号权限隔离（验收 7.12 / 7.13）与审计表只追加（验收 3.27）。
//
//   node scripts/provision-db-roles.js --check     只体检，不改库
//   node scripts/provision-db-roles.js --dry-run   打印将执行的语句
//   node scripts/provision-db-roles.js             执行（幂等，可重复跑）
//
// 口令从环境变量读，不接受命令行参数——命令行会进 shell 历史和进程列表，
// 同一台机器上任何人 ps 一下就看见了：
//
//   DB_APP_PASSWORD=... DB_OPS_PASSWORD=... DB_READONLY_PASSWORD=... \
//     node scripts/provision-db-roles.js
//
// 首次执行后，把应用的 DATABASE_URL 换成 school_app 账号；运维日常连库用
// school_ops。验收现场用 --check 出示权限证据，或直接用 school_ops 连库
// SELECT 一次薪资表，看它被拒。
import pg from "pg";
import {
  APPEND_ONLY_COLLECTIONS,
  DB_ROLES,
  SENSITIVE_COLLECTIONS,
  auditDatabaseRoles,
  ensureDatabaseAuditLog,
  provisionDatabaseRoles,
  tableNameOf,
} from "../server/db/roles.js";

const CONN =
  process.env.DATABASE_URL ||
  process.env.PG_CONNECTION_STRING ||
  "postgresql://localhost:5432/school_system_dev";

const checkOnly = process.argv.includes("--check");
const dryRun = process.argv.includes("--dry-run");

const passwords = {
  appPassword: process.env.DB_APP_PASSWORD || "",
  opsPassword: process.env.DB_OPS_PASSWORD || "",
  readonlyPassword: process.env.DB_READONLY_PASSWORD || "",
};

function printFindings(result) {
  if (!result.findings.length) {
    console.log(`  ✓ 权限体检通过（核对 ${result.checked} 项）`);
    return;
  }
  result.findings.forEach((f) => {
    const mark = f.level === "error" ? "✗" : "!";
    console.log(`  ${mark} ${f.message}`);
  });
}

const client = new pg.Client({ connectionString: CONN });
await client.connect();

try {
  console.log(`数据库：${CONN.replace(/:[^:@/]*@/, ":****@")}`);
  console.log(
    `敏感表（运维账号无权访问）：${SENSITIVE_COLLECTIONS.map(tableNameOf).join("、")}`,
  );
  console.log(`只追加表：${APPEND_ONLY_COLLECTIONS.map(tableNameOf).join("、")}`);
  console.log("");

  if (checkOnly) {
    const result = await auditDatabaseRoles(client);
    printFindings(result);
    console.log("");
    console.log(result.ok ? "体检通过。" : "体检未通过，请执行不带 --check 的命令修复。");
    process.exitCode = result.ok ? 0 : 1;
  } else {
    const missing = Object.entries(passwords).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length === 3) {
      console.log("未提供任何口令，将只重新授权、不改动登录口令。");
      console.log("首次部署请设置 DB_APP_PASSWORD / DB_OPS_PASSWORD / DB_READONLY_PASSWORD。");
      console.log("");
    }

    const result = await provisionDatabaseRoles(client, { ...passwords, dryRun });
    if (!dryRun) {
      // 数据库层操作日志（验收 7.14 / 7.15）：记录谁在什么时候动了哪张敏感表，
      // 用来发现绕过应用的直连改库
      const audit = await ensureDatabaseAuditLog(client);
      console.log(`已启用数据库操作日志：${audit.table}（监控 ${audit.watchedTables.length} 张敏感表）`);
    }
    if (dryRun) {
      console.log(`将执行 ${result.statements.length} 条语句：`);
      result.statements.forEach((s) => console.log(`  ${s}`));
    } else {
      console.log(`已配置角色：${result.roles.join("、")}`);
      console.log(`覆盖表 ${result.tableCount} 张，其中敏感表 ${result.sensitiveTables.length} 张`);
      console.log("");
      const audit = await auditDatabaseRoles(client);
      printFindings(audit);
      process.exitCode = audit.ok ? 0 : 1;
    }
  }

  console.log("");
  console.log("验收 7.13 的现场动作：");
  console.log(
    `  psql "postgresql://${DB_ROLES.ops}:<口令>@<主机>/<库>" -c 'SELECT * FROM "app_payrollDetails" LIMIT 1;'`,
  );
  console.log("  预期输出：ERROR:  permission denied for table app_payrollDetails");
  console.log("");
  console.log("验收 7.14 / 7.15 的现场动作（用库主直连改一行工资，再查操作日志）：");
  console.log(`    UPDATE "app_payrollDetails" SET data = data WHERE id = '<某工资单>';`);
  console.log(`    SELECT occurred_at, db_user, app_actor, operation, row_id, changed_fields`);
  console.log(`      FROM db_audit_log ORDER BY occurred_at DESC LIMIT 10;`);
  console.log("  app_actor 为空的那几条，就是绕过应用直接改库的操作。");
} finally {
  await client.end();
}
