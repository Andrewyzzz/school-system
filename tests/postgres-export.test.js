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

// 除传入的普通教师外，初始化数据还包含学部主任兼课账号、幼儿园教师和
// 生活老师。导出测试应核对真实数据源，不能把旧版的普通教师参数写死成总数。
assert.equal(summary.teachers, db.teachers.length, "导出的教师数应与数据源一致");
// 不写死账号总数：每新增一个系统账号（如财务按学部拆成四个）都要来改这里，
// 断言的本意是「导出条数与实际账号数一致」，直接比对数据源即可。
assert.equal(summary.accounts, db.accounts.length, "导出的账号数应与数据源一致");
assert.ok(summary.accounts > 30, "账号应包含教师账号与系统账号");
assert.ok(summary.statements > summary.teachers + summary.accounts, "export should include reference and payroll statements");

const duplicateTeacherAccountMatches = sql.match(/'T0003'/g) || [];
assert.equal(
  duplicateTeacherAccountMatches.length >= 2,
  true,
  "teacher T0003 should still appear in teacher/profile rows while duplicate account binding is deduped by SQL constraints",
);

console.log("postgres export checks passed");
