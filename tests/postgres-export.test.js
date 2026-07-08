import assert from "node:assert/strict";
import { buildPostgresSeedSql } from "../server/exportPostgresData.js";
import { createInitialData } from "../server/storage.js";

const db = createInitialData({ teacherCount: 30 });
const { sql, summary } = buildPostgresSeedSql(db);

assert.ok(sql.startsWith("-- Generated data export"), "export should include deterministic header");
assert.ok(sql.includes("INSERT INTO academic_terms"), "terms should be exported");
assert.ok(sql.includes("INSERT INTO teachers"), "teachers should be exported");
assert.ok(sql.includes("INSERT INTO accounts"), "accounts should be exported");
assert.ok(sql.includes("INSERT INTO teacher_salary_profiles"), "salary profiles should be exported");
assert.ok(sql.includes("INSERT INTO payroll_rules"), "payroll rules should be exported");
assert.ok(sql.endsWith("COMMIT;\n"), "export should be transaction wrapped");

assert.equal(summary.teachers, 30);
assert.equal(summary.accounts, 39);
assert.ok(summary.statements > summary.teachers + summary.accounts, "export should include reference and payroll statements");

const duplicateTeacherAccountMatches = sql.match(/'T0003'/g) || [];
assert.equal(
  duplicateTeacherAccountMatches.length >= 2,
  true,
  "teacher T0003 should still appear in teacher/profile rows while duplicate account binding is deduped by SQL constraints",
);

console.log("postgres export checks passed");
