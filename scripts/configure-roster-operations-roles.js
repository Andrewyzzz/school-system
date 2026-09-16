#!/usr/bin/env node

// 将已导入教师的账号授予限定学部的业务兼岗能力。
// 仅修改既有教师账号：不重置密码、不新建人员、不触碰课表或薪资流水。
// 用法：
//   node scripts/configure-roster-operations-roles.js --input /private/tmp/operations-roles.json --dry-run
//   node scripts/configure-roster-operations-roles.js --input /private/tmp/operations-roles.json --commit

import fs from "node:fs/promises";
import process from "node:process";
import pg from "pg";
import { hashPassword } from "../server/auth.js";

const { Pool } = pg;
const PG_URL = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING || "postgresql://localhost:5432/school_system_dev";
const ALLOWED_ROLES = new Set(["admin", "finance", "division_hr", "attendance_manager"]);
const PERSONNEL_ORG_BY_STAGE = {
  primary: "ORG-PRIMARY",
  middle: "ORG-MIDDLE",
  high: "ORG-HIGH",
  kindergarten: "ORG-KINDERGARTEN",
};
const DEFAULT_INITIAL_PASSWORD = "123456";

function options(argv = []) {
  const inputIndex = argv.indexOf("--input");
  const input = inputIndex >= 0 ? String(argv[inputIndex + 1] || "").trim() : "";
  const commit = argv.includes("--commit");
  const dryRun = argv.includes("--dry-run");
  if (!input || commit === dryRun) {
    throw new Error("请指定 --input，并且二选一使用 --dry-run 或 --commit");
  }
  return { input, commit };
}

function uniqueStrings(values = []) {
  return [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))];
}

function requireArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} 必须是数组`);
  return value;
}

function validatePlan(plan) {
  const users = requireArray(plan?.users, "users");
  const teacherPatches = requireArray(plan?.teacherPatches || [], "teacherPatches");
  if (!users.length) throw new Error("users 不能为空");
  const userNos = new Set();
  users.forEach((user) => {
    const employeeNo = String(user?.employeeNo || "").trim();
    const name = String(user?.name || "").trim();
    const role = String(user?.role || "").trim();
    const mode = String(user?.mode || "existing_teacher").trim();
    const stageIds = uniqueStrings(user?.scopeStageIds || []);
    if (!employeeNo || !name || !ALLOWED_ROLES.has(role) || !["existing_teacher", "existing_personnel", "create_personnel"].includes(mode) || stageIds.length !== 1) {
      throw new Error("业务岗位计划包含无效的工号、姓名、角色或学部范围");
    }
    if (userNos.has(employeeNo)) throw new Error(`业务岗位计划工号重复：${employeeNo}`);
    userNos.add(employeeNo);
    if (role === "finance" && !["primary", "middle", "high", "kindergarten"].includes(String(user.financeScope || ""))) {
      throw new Error(`财务岗位必须设置有效财务范围：${employeeNo}`);
    }
    if (mode === "create_personnel" && !String(user.username || "").trim()) {
      throw new Error(`新增人员账号缺少用户名：${employeeNo}`);
    }
  });
  const teacherNos = new Set();
  teacherPatches.forEach((patch) => {
    const employeeNo = String(patch?.employeeNo || "").trim();
    const name = String(patch?.name || "").trim();
    const stageId = String(patch?.stageId || "").trim();
    const grade = Number(patch?.grade);
    if (!employeeNo || !name || !stageId || !Number.isInteger(grade) || grade <= 0) {
      throw new Error("教师年级补充计划包含无效字段");
    }
    if (teacherNos.has(employeeNo)) throw new Error(`教师年级补充工号重复：${employeeNo}`);
    teacherNos.add(employeeNo);
  });
  return { users, teacherPatches };
}

function accountPatch(user) {
  const patch = {
    role: user.role,
    roles: uniqueStrings([...((user.mode || "existing_teacher") === "existing_teacher" ? ["teacher"] : []), user.role]),
    scopeStageIds: uniqueStrings(user.scopeStageIds),
    title: String(user.title || "").trim(),
    department: String(user.department || "").trim(),
    payrollReadAll: false,
    payrollExportAll: false,
  };
  if (user.role === "finance") {
    patch.financeScope = String(user.financeScope);
    patch.financeReadAll = false;
  }
  return patch;
}

async function nextAuditSequence(client) {
  const result = await client.query('SELECT COALESCE(MAX(seq), -1)::bigint + 1 AS value FROM "app_auditLogs"');
  return Number(result.rows[0].value);
}

async function nextSequence(client, table) {
  const result = await client.query(`SELECT COALESCE(MAX(seq), -1)::bigint + 1 AS value FROM "app_${table}"`);
  return Number(result.rows[0].value);
}

function personnelAccountId(user) {
  return `ACC-ROSTER-OPERATIONS-${String(user.employeeNo).replace(/\D/g, "").slice(-4)}`;
}

function personnelEmployeeData(user, accountId, now) {
  return {
    id: `EMP-ACCOUNT-${accountId}`,
    employeeNo: user.employeeNo,
    personName: user.name,
    gender: "",
    birthDate: "",
    idCardEncrypted: "",
    idCardMasked: "",
    phone: "",
    emergencyContact: "",
    emergencyPhone: "",
    bankCardEncrypted: "",
    bankCardMasked: "",
    orgUnitId: PERSONNEL_ORG_BY_STAGE[user.scopeStageIds[0]],
    positionId: user.role === "finance" ? "POS-FINANCE-STAFF" : "POS-ADMIN-STAFF",
    reportsTo: "",
    teacherId: "",
    accountId,
    status: "active",
    managementLevel: "ordinary",
    employmentType: "normal",
    agreementMonthlySalary: 0,
    workStatus: "employed",
    hiredAt: "",
    regularizedAt: "",
    leftAt: "",
    salaryTemplateId: "",
    salaryTemplateVer: 0,
    titleGrade: "",
    degree: "",
    teacherRoles: {},
    tagIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

async function main() {
  const { input, commit } = options(process.argv.slice(2));
  const plan = validatePlan(JSON.parse(await fs.readFile(input, "utf8")));
  const userNos = plan.users.map((user) => String(user.employeeNo));
  const existingUsers = plan.users.filter((user) => user.mode !== "create_personnel");
  const existingTeacherUsers = existingUsers.filter((user) => (user.mode || "existing_teacher") === "existing_teacher");
  const createdPersonnelUsers = plan.users.filter((user) => user.mode === "create_personnel");
  const teacherNos = plan.teacherPatches.map((patch) => String(patch.employeeNo));
  const pool = new Pool({ connectionString: PG_URL, max: 1 });
  const client = await pool.connect();
  try {
    const accountRows = await client.query(
      `SELECT id, data
       FROM app_accounts
       WHERE data->>'employeeNo' = ANY($1::text[])`,
      [userNos],
    );
    const accountByNo = new Map(accountRows.rows.map((row) => [String(row.data.employeeNo || ""), row]));
    const missingAccounts = existingUsers
      .map((user) => String(user.employeeNo))
      .filter((employeeNo) => !accountByNo.has(employeeNo));
    if (missingAccounts.length) {
      const missing = missingAccounts;
      throw new Error(`待配置人员账号不完整，已拒绝变更：${missing.join("、")}`);
    }
    existingTeacherUsers.forEach((user) => {
      const row = accountByNo.get(String(user.employeeNo));
      if (!row?.data?.teacherId || row.data.name !== user.name) {
        throw new Error(`账号身份或教师关联不符合预期：${user.employeeNo}`);
      }
    });
    createdPersonnelUsers.forEach((user) => {
      if (accountByNo.has(String(user.employeeNo))) {
        throw new Error(`新增人员账号工号已存在，已拒绝变更：${user.employeeNo}`);
      }
    });
    const createUsernames = createdPersonnelUsers.map((user) => String(user.username));
    const createAccountIds = createdPersonnelUsers.map(personnelAccountId);
    if (createUsernames.length) {
      // 同一个 PostgreSQL client 在一个事务上下文中必须串行发请求，避免连接池
      // 将并发 query 视为未定义行为而产生弃用警告。
      const duplicateUsernames = await client.query(
        "SELECT id FROM app_accounts WHERE data->>'username' = ANY($1::text[])",
        [createUsernames],
      );
      const duplicateAccountIds = await client.query("SELECT id FROM app_accounts WHERE id = ANY($1::text[])", [createAccountIds]);
      const duplicateEmployees = await client.query(
        "SELECT id FROM app_employees WHERE data->>'employeeNo' = ANY($1::text[])",
        [createdPersonnelUsers.map((user) => user.employeeNo)],
      );
      if (duplicateUsernames.rows.length || duplicateAccountIds.rows.length || duplicateEmployees.rows.length) {
        throw new Error("新增人员账号、用户名或人员档案已存在，已拒绝变更");
      }
    }

    const teacherRows = teacherNos.length
      ? await client.query(
          `SELECT id, data
           FROM app_teachers
           WHERE data->>'employeeNo' = ANY($1::text[])`,
          [teacherNos],
        )
      : { rows: [] };
    const teacherByNo = new Map(teacherRows.rows.map((row) => [String(row.data.employeeNo || ""), row]));
    if (teacherByNo.size !== plan.teacherPatches.length) {
      const missing = teacherNos.filter((employeeNo) => !teacherByNo.has(employeeNo));
      throw new Error(`待补充年级的教师档案不完整，已拒绝变更：${missing.join("、")}`);
    }
    plan.teacherPatches.forEach((patch) => {
      const row = teacherByNo.get(String(patch.employeeNo));
      if (!row || row.data.name !== patch.name || row.data.stageId !== patch.stageId) {
        throw new Error(`教师身份或学部不符合预期：${patch.employeeNo}`);
      }
    });

    const summary = {
      mode: commit ? "commit" : "dry-run",
      updatedExistingOperationAccounts: existingUsers.length,
      createdPersonnelOperationAccounts: createdPersonnelUsers.length,
      patchedTeacherGrades: plan.teacherPatches.length,
    };
    if (!commit) {
      process.stdout.write(`${JSON.stringify(summary)}\n`);
      return;
    }

    const now = new Date().toISOString();
    const auditSeq = await nextAuditSequence(client);
    const accountSeq = await nextSequence(client, "accounts");
    const employeeSeq = await nextSequence(client, "employees");
    const auditId = `AUDIT-ROSTER-OPERATIONS-ROLES-${Date.now()}`;
    await client.query("BEGIN");
    for (const user of existingUsers) {
      const row = accountByNo.get(String(user.employeeNo));
      const accountUpdate = await client.query(
        `UPDATE app_accounts
         SET data = ${user.role === "finance" ? "(data - 'schedulingGradeIds')" : "data"} || $2::jsonb,
             updated_at = now()
         WHERE id = $1`,
        [row.id, JSON.stringify(accountPatch(user))],
      );
      if (accountUpdate.rowCount !== 1) throw new Error(`无法更新岗位账号：${user.employeeNo}`);
      if (user.role === "finance") {
        const employeeUpdate = await client.query(
          `UPDATE app_employees
           SET data = data || $2::jsonb, updated_at = now()
           WHERE data->>'accountId' = $1`,
          [
            row.id,
            JSON.stringify({
              orgUnitId: PERSONNEL_ORG_BY_STAGE[user.scopeStageIds[0]],
              positionId: "POS-FINANCE-STAFF",
              updatedAt: now,
            }),
          ],
        );
        if (employeeUpdate.rowCount !== 1) throw new Error(`财务人员档案不完整：${user.employeeNo}`);
      }
    }
    for (const [index, user] of createdPersonnelUsers.entries()) {
      const accountId = personnelAccountId(user);
      const account = {
        id: accountId,
        username: String(user.username),
        passwordHash: hashPassword(String(user.defaultPassword || DEFAULT_INITIAL_PASSWORD)),
        name: user.name,
        employeeNo: user.employeeNo,
        status: "active",
        mustChangePassword: true,
        createdAt: now,
        ...accountPatch(user),
      };
      await client.query(
        'INSERT INTO "app_accounts" (id, seq, data, updated_at) VALUES ($1, $2, $3::jsonb, now())',
        [accountId, accountSeq + index, JSON.stringify(account)],
      );
      const employee = personnelEmployeeData(user, accountId, now);
      await client.query(
        'INSERT INTO "app_employees" (id, seq, data, updated_at) VALUES ($1, $2, $3::jsonb, now())',
        [employee.id, employeeSeq + index, JSON.stringify(employee)],
      );
    }
    for (const patch of plan.teacherPatches) {
      const row = teacherByNo.get(String(patch.employeeNo));
      await client.query(
        `UPDATE app_teachers
         SET data = data || $2::jsonb, updated_at = now()
         WHERE id = $1`,
        [row.id, JSON.stringify({ grade: Number(patch.grade), updatedAt: now })],
      );
    }
    await client.query(
      'INSERT INTO "app_auditLogs" (id, seq, data, updated_at) VALUES ($1, $2, $3::jsonb, now())',
      [
        auditId,
        auditSeq,
        JSON.stringify({
          id: auditId,
          action: "roster_operations_roles_configured",
          actorAccountId: "SYSTEM-ROSTER-IMPORT",
          actorName: "本地名册导入",
          operationAccountIds: plan.users.map((user) =>
            user.mode === "create_personnel" ? personnelAccountId(user) : accountByNo.get(String(user.employeeNo)).id,
          ),
          gradeTeacherIds: plan.teacherPatches.map((patch) => teacherByNo.get(String(patch.employeeNo)).id),
          createdAt: now,
        }),
      ],
    );
    await client.query("COMMIT");
    process.stdout.write(`${JSON.stringify(summary)}\n`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
