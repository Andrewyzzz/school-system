import assert from "node:assert/strict";
import { createInitialData, normalizeDatabase } from "../server/storage.js";
import { hashPassword } from "../server/auth.js";

// 真实名册接管后，启动规整不能悄悄复活演示账号；这是避免权限落到虚拟人员的
// 最小回归测试。真实账号本身仍要完整保留。
const db = createInitialData({ teacherCount: 8 });
db.meta.personnelSource = "real_roster";
db.teachers = [
  {
    id: "T-ROSTER-0001",
    employeeNo: "FY260907-0001",
    name: "真实教师",
    stageId: "primary",
    stageName: "小学部",
    department: "小学部",
    primarySubjectId: "chinese",
    primarySubjectName: "语文",
    title: "小学教师",
    status: "active",
    hiredAt: "2026-09-01",
  },
];
db.accounts = [
  {
    id: "ACC-ROSTER-0001",
    username: "fy260907-0001",
    passwordHash: hashPassword("123456"),
    role: "teacher",
    teacherId: "T-ROSTER-0001",
    name: "真实教师",
    department: "小学部",
    status: "active",
    mustChangePassword: true,
  },
];
db.employees = [];
db.sessions = [];

normalizeDatabase(db);

assert.ok(db.accounts.some((account) => account.username === "fy260907-0001"), "真实账号必须保留");
[
  "sysadmin",
  "principal",
  "finance",
  "finance_primary",
  "head_primary",
  "teacher_primary",
  "life_teacher_primary",
].forEach((username) => {
  assert.equal(db.accounts.some((account) => account.username === username), false, `不应补回演示账号 ${username}`);
});
assert.equal(db.employees.filter((employee) => employee.teacherId === "T-ROSTER-0001").length, 1, "真实教师应建立档案");

console.log("真实名册模式不会补回演示账号");
