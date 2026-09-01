#!/usr/bin/env node
// 为文档式表补齐数据库层的外键与索引。
//
//   node scripts/apply-db-constraints.js --check   只体检，不改库
//   node scripts/apply-db-constraints.js           执行（幂等，可重复跑）
//
// 加约束前会先做全量引用体检：存在孤儿引用时直接中止，不做任何修改——
// 带着脏数据强加约束只会失败在半路，留下一半有约束一半没有的状态。
import pg from "pg";
import {
  FOREIGN_KEYS,
  auditConstraintsAndIndexes,
  columnOf,
  ensureConstraintsAndIndexes,
  tableOf,
} from "../server/db/constraints.js";

const CONN =
  process.env.DATABASE_URL ||
  process.env.PG_CONNECTION_STRING ||
  "postgresql://localhost:5432/school_system_dev";

const checkOnly = process.argv.includes("--check");

async function auditOrphans(client) {
  const findings = [];
  for (const { child, field, parent } of FOREIGN_KEYS) {
    const { rows: exists } = await client.query(
      `select
         (select count(*) from information_schema.tables where table_schema='public' and table_name=$1) c,
         (select count(*) from information_schema.tables where table_schema='public' and table_name=$2) p`,
      [`app_${child}`, `app_${parent}`],
    );
    if (Number(exists[0].c) === 0 || Number(exists[0].p) === 0) continue;

    const { rows } = await client.query(
      `select count(*)::int n from ${tableOf(child)} c
       where NULLIF(c.data->>'${field}', '') is not null
         and not exists (select 1 from ${tableOf(parent)} p where p.id = c.data->>'${field}')`,
    );
    const n = rows[0].n;
    if (n > 0) {
      const { rows: samples } = await client.query(
        `select distinct c.data->>'${field}' v from ${tableOf(child)} c
         where NULLIF(c.data->>'${field}', '') is not null
           and not exists (select 1 from ${tableOf(parent)} p where p.id = c.data->>'${field}')
         limit 3`,
      );
      findings.push({ child, field, parent, count: n, samples: samples.map((r) => r.v) });
    }
  }
  return findings;
}

async function main() {
  const client = new pg.Client({ connectionString: CONN });
  await client.connect();
  console.log(`数据库: ${CONN.replace(/:[^:@/]*@/, ":****@")}`);
  console.log("");

  console.log("【1/2】引用完整性体检");
  const orphans = await auditOrphans(client);
  if (orphans.length) {
    console.log(`  ✗ 发现 ${orphans.length} 处孤儿引用，不能加外键：`);
    orphans.forEach((o) =>
      console.log(`     ${o.child}.${o.field} → ${o.parent}：${o.count} 行  例 ${o.samples.join(", ")}`),
    );
    console.log("");
    console.log("  请先清洗数据。加约束会失败在半路，留下不一致的状态。");
    await client.end();
    process.exit(1);
  }
  console.log(`  ✓ ${FOREIGN_KEYS.length} 个引用关系全部干净`);
  console.log("");

  // 数据干净 ≠ 约束存在。原先只查孤儿引用就报「全部干净」，
  // 一次 DROP TABLE 之后约束全没了，体检照样通过。
  console.log("【2/2】约束与索引在位情况");
  const audit = await auditConstraintsAndIndexes(client);
  console.log(`  外键 ${audit.expectedForeignKeys - audit.missingForeignKeys.length}/${audit.expectedForeignKeys} 在位`);
  console.log(`  索引 ${audit.expectedIndexes - audit.missingIndexes.length}/${audit.expectedIndexes} 在位`);
  if (audit.missingColumns.length) {
    console.log(`  缺生成列 ${audit.missingColumns.length} 个：${audit.missingColumns.slice(0, 5).join("、")}${audit.missingColumns.length > 5 ? " …" : ""}`);
  }
  if (audit.missingForeignKeys.length) {
    console.log(`  缺外键：${audit.missingForeignKeys.slice(0, 5).join("、")}${audit.missingForeignKeys.length > 5 ? ` … 共 ${audit.missingForeignKeys.length} 个` : ""}`);
  }
  if (audit.missingIndexes.length) {
    console.log(`  缺索引：${audit.missingIndexes.slice(0, 5).join("、")}${audit.missingIndexes.length > 5 ? ` … 共 ${audit.missingIndexes.length} 个` : ""}`);
  }
  console.log("");

  if (checkOnly) {
    if (audit.ok) {
      console.log("  ✓ 约束与索引齐备");
    } else {
      console.log("  ✗ 存在缺失，请执行不带 --check 的命令补齐");
    }
    console.log("");
    console.log("（--check 模式，未修改数据库）");
    await client.end();
    process.exitCode = audit.ok ? 0 : 1;
    return;
  }

  console.log("【3/3】建生成列、外键与索引");
  const result = await ensureConstraintsAndIndexes(client, { log: (m) => console.log(m) });
  console.log("");
  console.log(`  外键新增 ${result.foreignKeys.applied.length} 个，跳过 ${result.foreignKeys.skipped.length} 个`);
  console.log(`  索引确保 ${result.indexes.applied.length} 个`);

  const { rows: fkCount } = await client.query(
    "select count(*)::int n from information_schema.table_constraints where constraint_type='FOREIGN KEY' and table_schema='public'",
  );
  const { rows: genCount } = await client.query(
    "select count(*)::int n from information_schema.columns where is_generated='ALWAYS' and table_schema='public'",
  );
  console.log("");
  console.log(`  当前库外键总数 ${fkCount[0].n}，生成列 ${genCount[0].n}`);
  await client.end();
}

main().catch((error) => {
  console.error("执行失败:", error.message);
  process.exit(1);
});
