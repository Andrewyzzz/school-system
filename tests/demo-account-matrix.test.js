import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { changeOwnPassword, createInitialData, normalizeDatabase, publicAccount, queryPersonnel } from "../server/storage.js";
import { assertSchedulingAccess } from "../server/accessScope.js";
import { canFinanceActOnTeacher, canFinanceReadTeacher } from "../server/financeScope.js";
import { verifyPassword } from "../server/auth.js";

const db = createInitialData({ teacherCount: 40 });
const account = (username) => db.accounts.find((item) => item.username === username);

assert.ok(db.stages.some((item) => item.id === "kindergarten"), "基础学部应包含幼儿园");

const divisions = ["kindergarten", "primary", "middle", "high"];
const usernames = {
  kindergarten: ["head_kindergarten", "finance_kindergarten", "scheduler_kindergarten", "teacher_kindergarten"],
  primary: ["head_primary", "finance_primary", "scheduler_primary", "teacher_primary", "life_teacher_primary"],
  middle: ["head_middle", "finance_middle", "scheduler_middle", "teacher_middle", "life_teacher_middle"],
  high: ["head_high", "finance_high", "scheduler_high", "teacher_high", "life_teacher_high"],
};

divisions.forEach((stageId) => {
  usernames[stageId].forEach((username) => assert.ok(account(username), `缺少 demo 账号 ${username}`));
  assert.deepEqual(account(usernames[stageId][0]).scopeStageIds, [stageId]);
  assert.deepEqual(account(usernames[stageId][2]).scopeStageIds, [stageId]);
});

// 生活老师仅设在小学、初中、高中：三个演示账号都进入老师端，但工资档案必须使用
// 生活老师独立方案；幼儿园不能出现对应账号。
[
  ["life_teacher_primary", "primary"],
  ["life_teacher_middle", "middle"],
  ["life_teacher_high", "high"],
].forEach(([username, stageId]) => {
  const lifeAccount = account(username);
  assert.equal(lifeAccount.role, "teacher");
  assert.ok(lifeAccount.roles.includes("life_teacher"), `${username} 应有生活老师角色标识`);
  const lifeTeacher = db.teachers.find((item) => item.id === lifeAccount.teacherId);
  assert.equal(lifeTeacher.stageId, stageId);
  assert.equal(lifeTeacher.salaryProfile.salaryCategory, "lifeTeacher", "演示账号应走生活老师工资方案");
  assert.equal(lifeTeacher.primarySubjectId, "", "生活老师不应绑定任教学科");
});
assert.equal(account("life_teacher_kindergarten"), undefined, "幼儿园不应提供生活老师快捷账号");

// 学部主任应是一个兼岗账号：默认仍进入主任工作台，但同一账号可被排课并访问老师端。
divisions.forEach((stageId) => {
  const head = account(usernames[stageId][0]);
  assert.equal(head.role, "division_head", `${stageId} 主任的主岗位应保持学部主任`);
  assert.ok(head.roles?.includes("teacher"), `${stageId} 主任应具备任课教师能力`);
  assert.ok(head.teacherId, `${stageId} 主任应绑定一个教师档案`);
  const teacher = db.teachers.find((item) => item.id === head.teacherId);
  assert.equal(teacher?.stageId, stageId, `${stageId} 主任只能绑定本学部教师档案`);
  assert.ok(publicAccount(head, db).roles.includes("teacher"), "登录响应应传回兼岗能力，前端才能显示老师菜单");
});

// 升级已有库时，旧的“主任行政档案”要原位转成教师档案，不能留下重复人员。
const legacyDb = createInitialData({ teacherCount: 12 });
const legacyHead = legacyDb.accounts.find((item) => item.username === "head_primary");
const legacyHeadTeacherId = legacyHead.teacherId;
legacyHead.roles = undefined;
legacyHead.teacherId = "";
legacyDb.teachers = legacyDb.teachers.filter((item) => item.id !== legacyHeadTeacherId);
legacyDb.employees = legacyDb.employees.filter((item) => item.teacherId !== legacyHeadTeacherId);
legacyDb.employees.push({
  id: "EMP-ACCOUNT-ACC-HEAD-PRIMARY",
  accountId: legacyHead.id,
  teacherId: "",
  personName: legacyHead.name,
  employeeNo: legacyHead.id,
  orgUnitId: "ORG-ADMIN",
  positionId: "POS-ADMIN-STAFF",
  managementLevel: "middle",
  employmentType: "normal",
  agreementMonthlySalary: 0,
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
assert.equal(normalizeDatabase(legacyDb), true, "旧库应执行主任兼岗迁移");
const migratedHead = legacyDb.accounts.find((item) => item.username === "head_primary");
const migratedProfiles = legacyDb.employees.filter((item) => item.teacherId === migratedHead.teacherId);
assert.ok(migratedHead.roles.includes("teacher"));
assert.equal(migratedProfiles.length, 1, "旧主任档案迁移后只能保留一条教师档案");
assert.equal(migratedProfiles[0].accountId, migratedHead.id, "迁移应保留原账号与档案的绑定关系");
assert.equal(migratedProfiles[0].managementLevel, "middle", "迁移不得覆盖已维护的人员层级");

assert.equal(account("principal").title, "校长（总校领导）");
assert.equal(account("sysadmin").title, "总校人事 + 行政");
assert.equal(account("finance").financeReadAll, true);

const primaryScheduler = account("scheduler_primary");
assert.doesNotThrow(() => assertSchedulingAccess(db, primaryScheduler, { divisionId: "elementary" }));
assert.throws(() => assertSchedulingAccess(db, primaryScheduler, { divisionId: "middle" }), /本学部排课数据/);

const primaryTeacher = db.teachers.find((item) => item.stageId === "primary");
assert.equal(canFinanceReadTeacher(db, account("finance"), primaryTeacher.id), true, "总校财务应能看学部工资");
assert.equal(canFinanceActOnTeacher(db, account("finance"), primaryTeacher.id), false, "总校财务不能改学部工资");

const primaryPersonnel = queryPersonnel(db, { pageSize: 100 }, { teachersOnly: true, stageScopeIds: ["primary"] });
assert.ok(primaryPersonnel.items.length > 0);
assert.ok(primaryPersonnel.items.every((item) => item.personType === "teacher" && item.stageId === "primary"));

assert.deepEqual(publicAccount(account("principal"), db).scopeStageIds, []);

const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf8");
["principal", "finance", "sysadmin", ...Object.values(usernames).flat()].forEach((username) => {
  assert.match(html, new RegExp(`data-demo-login="${username}"`));
});
assert.doesNotMatch(html, /data-demo-login="hr"/, "人事与行政合并后不再单列人事 demo 入口");
assert.doesNotMatch(html, /data-demo-login="admin"/, "旧全校排课 demo 入口应隐藏");

// 改密是账号自助能力，不依赖老师、人事或财务等任一特定岗位。
["principal", "finance", "head_primary", "scheduler_primary", "teacher_primary", "sysadmin"].forEach((username, index) => {
  const self = account(username);
  const nextPassword = `School#${index + 2026}X`;
  changeOwnPassword(db, self, "123456", nextPassword);
  assert.ok(verifyPassword(nextPassword, self.passwordHash), `${username} 应能修改自己的密码`);
});

console.log("Demo 账号矩阵与权限范围测试通过");
