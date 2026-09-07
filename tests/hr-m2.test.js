import assert from "node:assert/strict";
import { generateEncryptionKey, maskIdCard } from "../server/security/pii.js";

// 加密密钥必须在 import storage/hr 之前就绪（模块级无副作用，此处仅保险）
process.env.HR_ENCRYPTION_KEY = generateEncryptionKey();

const { createInitialData, queryPersonnel } = await import("../server/storage.js");
const {
  addEmployeeContract,
  addSalaryTemplateVersion,
  applySalaryTemplate,
  createEmployee,
  createPersonnelTag,
  createOrgUnit,
  createPosition,
  createProfileChangeRequest,
  createSalaryTemplate,
  ensureHrData,
  exportEmployeesCsv,
  getEmployeeDetail,
  getMyHrProfile,
  queryEmployees,
  queryPersonnelTags,
  queryHrAuditLogs,
  queryOrgUnits,
  querySalaryTemplates,
  reviewProfileChangeRequest,
  revealSensitiveField,
  setEmployeeStatus,
  deletePersonnelTag,
  setOrgUnitStatus,
  updateEmployee,
  updateEmployeeContract,
  updateOrgUnit,
  withdrawProfileChangeRequest,
} = await import("../server/hr.js");

// 第二阶段 M2 验收：组织/岗位/档案/敏感字段/合同/模板/变更申请/审计/导出。

function actor(db, username) {
  const account = db.accounts.find((item) => item.username === username);
  assert.ok(account, `missing account ${username}`);
  return account;
}

const db = createInitialData({ teacherCount: 12 });
const hr = actor(db, "hr");
const systemAdmin = actor(db, "sysadmin");
const finance = actor(db, "finance");
const teacherAccount = actor(db, "teacher0001");
const context = { clientIp: "10.0.0.8", userAgent: "hr-m2-test" };

// ---- 1. seed / 回填 ----
assert.equal(hr.role, "hr", "hr 种子账号应存在");
const units = queryOrgUnits(db);
assert.equal(units.filter((unit) => unit.type === "school").length, 1);
const divisions = units.filter((unit) => unit.type === "division");
assert.deepEqual(
  divisions.map((unit) => unit.stageId).sort(),
  ["high", "kindergarten", "middle", "primary"],
  "四个教学学部应带排课 stageId 映射",
);
assert.ok(units.filter((unit) => unit.type === "department").length >= 4);
const personnelAccountCount = db.accounts.filter(
  (account) => !account.teacherId && ["system_admin", "admin", "finance", "hr", "division_head", "principal"].includes(account.role),
).length;
assert.equal(
  db.employees.length,
  db.teachers.length + personnelAccountCount,
  "教师及行政、财务、管理等全体人员都应回填为档案",
);
const systemAdminEmployee = db.employees.find((employee) => employee.accountId === systemAdmin.id);
assert.ok(systemAdminEmployee, "总校人事 + 行政账号应有对应人员档案");
assert.equal(systemAdminEmployee.managementLevel, "ordinary", "非教师人员默认应以普通层级展示");
assert.equal(systemAdminEmployee.workStatus, "employed", "存量人员默认应标记为就业");
const sampleEmployee = db.employees.find((employee) => employee.teacherId === "T0001");
assert.ok(sampleEmployee);
assert.equal(sampleEmployee.personName, db.teachers[0].name);
assert.equal(sampleEmployee.idCardEncrypted, "", "回填档案敏感字段应为空");
assert.ok(db.positions.some((position) => position.series === "teacher"));
assert.ok(db.positions.some((position) => position.series !== "teacher"));
assert.equal(
  queryEmployees(db, { search: sampleEmployee.personName }).items[0].managementLevel,
  "ordinary",
  "未维护层级的存量档案应以普通展示，不需要启动时批量改写数据",
);

// ---- 2. 回填幂等 ----
assert.equal(ensureHrData(db), false, "重复回填不应产生变化");
const employeeCountBefore = db.employees.length;
ensureHrData(db);
assert.equal(db.employees.length, employeeCountBefore);

// ---- 3. 组织 CRUD 留痕与环检测 ----
assert.throws(() => createOrgUnit(db, { name: "无原因节点", parentId: "ORG-ROOT" }, hr, context), /原因/);
const gradeGroup = createOrgUnit(
  db,
  { name: "小学一年级组", type: "grade_group", parentId: "ORG-STAGE-primary", reason: "M2 测试建组" },
  hr,
  context,
);
updateOrgUnit(db, gradeGroup.id, { name: "小学一年级年级组", reason: "更名规范化" }, hr, context);
const renameAudit = db.hrAuditLogs[db.hrAuditLogs.length - 1];
assert.equal(renameAudit.action, "org_unit_update");
assert.deepEqual(renameAudit.fieldDiffs[0], {
  field: "name",
  before: "小学一年级组",
  after: "小学一年级年级组",
});
assert.throws(
  () => updateOrgUnit(db, "ORG-STAGE-primary", { parentId: gradeGroup.id, reason: "制造环" }, hr, context),
  /环/,
  "把节点挂到自己的后代必须被拒绝",
);

// ---- 4. 停用拦截 ----
assert.throws(
  () => setOrgUnitStatus(db, "ORG-STAGE-primary", "disabled", "测试停用", hr, context),
  /非离职人员/,
  "有在职人员的节点不能停用",
);
assert.equal(setOrgUnitStatus(db, gradeGroup.id, "disabled", "空组停用", hr, context).status, "disabled");

// ---- 5. 人员层级：仅总校人事 + 行政可维护，修改留审计 ----
assert.throws(
  () => updateEmployee(db, sampleEmployee.id, { managementLevel: "senior", reason: "越权测试" }, hr, context),
  /仅总校人事 \+ 行政/,
  "旧人事角色不能维护人员层级",
);
const leveledEmployee = updateEmployee(
  db,
  sampleEmployee.id,
  { managementLevel: "middle", reason: "2026 秋季组织层级调整" },
  systemAdmin,
  context,
);
assert.equal(leveledEmployee.managementLevel, "middle");
assert.equal(leveledEmployee.managementLevelLabel, "中层");
const managementAudit = db.hrAuditLogs[db.hrAuditLogs.length - 1];
assert.deepEqual(
  managementAudit.fieldDiffs.find((item) => item.field === "managementLevel"),
  { field: "managementLevel", before: "ordinary", after: "middle" },
  "人员层级的变更应写入字段级审计",
);
assert.throws(
  () => updateEmployee(db, sampleEmployee.id, { managementLevel: "director", reason: "非法层级" }, systemAdmin, context),
  /高层、中层或普通/,
);

// ---- 5.05 就业／待岗：仅总校人事 + 行政维护，并进入教师列表 ----
assert.throws(
  () => updateEmployee(db, sampleEmployee.id, { workStatus: "standby", reason: "越权待岗" }, hr, context),
  /仅总校人事 \+ 行政/,
  "普通人事角色不能维护待岗状态",
);
const standbyEmployee = updateEmployee(
  db,
  sampleEmployee.id,
  { workStatus: "standby", reason: "本学期待岗安排" },
  systemAdmin,
  context,
);
assert.equal(standbyEmployee.workStatus, "standby");
assert.equal(standbyEmployee.workStatusLabel, "待岗");
assert.deepEqual(
  db.hrAuditLogs[db.hrAuditLogs.length - 1].fieldDiffs.find((item) => item.field === "workStatus"),
  { field: "workStatus", before: "employed", after: "standby" },
  "待岗状态变更应进入字段级审计",
);
assert.equal(
  queryPersonnel(db, { search: sampleEmployee.personName }).items.find((item) => item.teacherId === sampleEmployee.teacherId).workStatusLabel,
  "待岗",
  "教师列表应显示工作状态标签",
);
updateEmployee(db, sampleEmployee.id, { workStatus: "employed", reason: "恢复就业" }, systemAdmin, context);

// ---- 5.1 教师雇佣类型：仅总校人事 + 行政维护，协议价必须留痕 ----
assert.throws(
  () => updateEmployee(db, sampleEmployee.id, { employmentType: "agreement", agreementMonthlySalary: 8800, reason: "越权协议" }, hr, context),
  /仅总校人事 \+ 行政/,
  "旧人事角色不能维护协议雇佣与协议月薪",
);
assert.throws(
  () => updateEmployee(db, sampleEmployee.id, { employmentType: "agreement", agreementMonthlySalary: 0, reason: "漏填协议价" }, systemAdmin, context),
  /必须填写大于 0/,
  "协议教师必须配置正数协议月薪",
);
const agreementEmployee = updateEmployee(
  db,
  sampleEmployee.id,
  { employmentType: "agreement", agreementMonthlySalary: 8800, reason: "退休返聘协议续签" },
  systemAdmin,
  context,
);
assert.equal(agreementEmployee.employmentType, "agreement");
assert.equal(agreementEmployee.employmentTypeLabel, "协议");
assert.equal(agreementEmployee.agreementMonthlySalary, undefined, "列表/普通返回不应携带协议具体金额");
const agreementAudit = db.hrAuditLogs[db.hrAuditLogs.length - 1];
assert.deepEqual(
  agreementAudit.fieldDiffs.filter((item) => ["employmentType", "agreementMonthlySalary"].includes(item.field)),
  [
    { field: "employmentType", before: "normal", after: "agreement" },
    { field: "agreementMonthlySalary", before: "0", after: "8800" },
  ],
  "协议类型与月薪都必须进入字段级审计",
);
assert.equal(
  getEmployeeDetail(db, sampleEmployee.id, { includeAgreementMonthlySalary: true }).employee.agreementMonthlySalary,
  8800,
  "总校人事 + 行政详情应读取协议月薪",
);
const personnelTeacher = queryPersonnel(db, { search: sampleEmployee.personName }).items.find(
  (item) => item.teacherId === sampleEmployee.teacherId,
);
assert.equal(personnelTeacher.managementLevel, "middle", "教师列表应带出人员层级");
assert.equal(personnelTeacher.managementLevelLabel, "中层");
assert.equal(personnelTeacher.employmentType, "agreement", "教师列表应带出雇佣类型");
assert.equal(personnelTeacher.employmentTypeLabel, "协议");
assert.ok(!JSON.stringify(personnelTeacher).includes("8800"), "教师列表不得透出协议月薪");
const seniorSystemAdmin = updateEmployee(
  db,
  systemAdminEmployee.id,
  { managementLevel: "senior", reason: "全员层级标签验证" },
  systemAdmin,
  context,
);
assert.equal(seniorSystemAdmin.managementLevelLabel, "高层");
const personnelAdmin = queryPersonnel(db, { search: systemAdmin.name }).items.find(
  (item) => item.accountId === systemAdmin.id,
);
assert.equal(personnelAdmin.managementLevel, "senior", "非教师人员列表也应带出层级");
assert.equal(personnelAdmin.managementLevelLabel, "高层");
assert.equal(personnelAdmin.employmentType, undefined, "非教师人员列表不应出现教师雇佣类型");
updateEmployee(db, sampleEmployee.id, { employmentType: "normal", reason: "协议到期转正常用工" }, systemAdmin, context);
assert.equal(sampleEmployee.agreementMonthlySalary, 0, "切回正常雇佣必须清空历史协议价");

// ---- 5.2 自定义人员标签：总校人事 + 行政配置并分配，删除时同步解除关联 ----
assert.throws(
  () => createPersonnelTag(db, { name: "骨干教师" }, hr, context),
  /仅总校人事 \+ 行政可以配置人员标签/,
  "普通人事角色不能绕过权限新建人员标签",
);
const backboneTag = createPersonnelTag(db, { name: "骨干教师", color: "purple" }, systemAdmin, context);
assert.equal(backboneTag.name, "骨干教师");
assert.equal(backboneTag.color, "purple");
assert.equal(queryPersonnelTags(db).length, 1, "标签配置应集中保存");
assert.throws(
  () => createPersonnelTag(db, { name: "骨干教师" }, systemAdmin, context),
  /同名/,
  "不允许重复建立同名标签",
);
const taggedEmployee = updateEmployee(
  db,
  sampleEmployee.id,
  { tagIds: [backboneTag.id], reason: "标记为教学骨干" },
  systemAdmin,
  context,
);
assert.deepEqual(taggedEmployee.tags, [backboneTag], "档案详情应返回已分配的标签");
assert.deepEqual(
  queryPersonnel(db, { search: sampleEmployee.personName }).items.find((item) => item.teacherId === sampleEmployee.teacherId).tags,
  [backboneTag],
  "教师列表也应展示自定义标签",
);
assert.throws(
  () => updateEmployee(db, sampleEmployee.id, { tagIds: [], reason: "越权移除标签" }, hr, context),
  /仅总校人事 \+ 行政可以维护人员标签/,
  "普通人事角色不能绕过权限分配人员标签",
);
const deleteTagResult = deletePersonnelTag(db, backboneTag.id, systemAdmin, context);
assert.equal(deleteTagResult.affectedEmployeeCount, 1, "删除标签时应统计并解除关联人员");
assert.deepEqual(sampleEmployee.tagIds, [], "删除标签必须同步清除人员档案关联");
assert.equal(queryPersonnelTags(db).length, 0);

// ---- 6. 档案更新 + 加密 ----
const idCardPlain = "440301199001011234";
updateEmployee(db, sampleEmployee.id, { idCard: idCardPlain, gender: "男", reason: "补录证件" }, hr, context);
assert.ok(sampleEmployee.idCardEncrypted.startsWith("pii:v1:"), "证件号应加密存储");
assert.equal(sampleEmployee.idCardMasked, maskIdCard(idCardPlain));
const listSerialized = JSON.stringify(queryEmployees(db, { search: sampleEmployee.personName }));
assert.ok(!listSerialized.includes(idCardPlain), "列表输出不能含明文证件号");
assert.ok(!listSerialized.includes("pii:v1:"), "列表输出不能含密文");
assert.ok(!listSerialized.includes("salaryProfile"), "档案输出结构上不能带薪资档案");
const updateAudit = db.hrAuditLogs[db.hrAuditLogs.length - 1];
const idCardDiff = updateAudit.fieldDiffs.find((diff) => diff.field === "idCard");
assert.equal(idCardDiff.after, maskIdCard(idCardPlain), "审计 diff 中敏感字段只能是掩码值");
updateEmployee(db, systemAdminEmployee.id, { managementLevel: "middle" }, systemAdmin, context);
const automaticReasonAudit = db.hrAuditLogs[db.hrAuditLogs.length - 1];
assert.equal(automaticReasonAudit.reason, "常规档案维护（系统自动留痕）", "档案保存不应要求逐人填写修改原因");
assert.deepEqual(
  automaticReasonAudit.fieldDiffs,
  [{ field: "managementLevel", before: "senior", after: "middle" }],
  "免填写原因后仍须保留字段级审计",
);
assert.throws(
  () => updateEmployee(db, sampleEmployee.id, { gender: "男", reason: "重复保存" }, hr, context),
  /没有任何变化/,
);

// ---- 7. 敏感读取审计 + 无密钥拒绝 ----
const revealed = revealSensitiveField(db, sampleEmployee.id, "idCard", "入职背景核查", hr, context);
assert.equal(revealed.value, idCardPlain);
const sensitiveAudit = db.hrAuditLogs[db.hrAuditLogs.length - 1];
assert.equal(sensitiveAudit.action, "sensitive_view");
assert.equal(sensitiveAudit.clientIp, "10.0.0.8");
assert.equal(sensitiveAudit.reason, "入职背景核查");

const savedKey = process.env.HR_ENCRYPTION_KEY;
delete process.env.HR_ENCRYPTION_KEY;
assert.throws(
  () => revealSensitiveField(db, sampleEmployee.id, "idCard", "无密钥读取", hr, context),
  /HR_ENCRYPTION_KEY/,
);
assert.throws(
  () => updateEmployee(db, sampleEmployee.id, { bankCard: "6222020200112233445", reason: "无密钥写入" }, hr, context),
  /HR_ENCRYPTION_KEY/,
  "密钥缺失时必须拒绝写入敏感字段，不允许明文落库",
);
process.env.HR_ENCRYPTION_KEY = savedKey;

// ---- 8. 姓名/电话镜像 ----
updateEmployee(db, sampleEmployee.id, { personName: "李明远", phone: "13911112222", reason: "更名与换号" }, hr, context);
const mirroredTeacher = db.teachers.find((teacher) => teacher.id === "T0001");
assert.equal(mirroredTeacher.name, "李明远");
assert.equal(mirroredTeacher.phone, "13911112222");

// ---- 9. 状态双写 ----
setEmployeeStatus(db, sampleEmployee.id, "left", "离职测试", hr, { ...context, effectiveDate: "2026-07-31" });
assert.equal(sampleEmployee.leftAt, "2026-07-31");
assert.equal(mirroredTeacher.status, "disabled", "已离职应冻结教学侧状态");
setEmployeeStatus(db, sampleEmployee.id, "active", "恢复在职", hr, context);
assert.equal(mirroredTeacher.status, "active");
assert.equal(sampleEmployee.leftAt, "");
assert.throws(() => setEmployeeStatus(db, sampleEmployee.id, "unknown", "非法", hr, context), /无效/);

// ---- 10. 合同 ----
const contract = addEmployeeContract(
  db,
  sampleEmployee.id,
  { type: "fixed_term", startDate: "2026-09-01", endDate: "2029-08-31", reason: "续签三年" },
  hr,
  context,
);
addEmployeeContract(
  db,
  sampleEmployee.id,
  { type: "fixed_term", startDate: "2023-09-01", endDate: "2026-08-31", reason: "补录历史合同" },
  hr,
  context,
);
const detail = getEmployeeDetail(db, sampleEmployee.id);
assert.equal(detail.contracts.length, 2);
assert.equal(detail.contracts[0].startDate, "2026-09-01", "合同应按开始日期倒序");
updateEmployeeContract(db, contract.id, { fileRef: "SCAN-2026-001", reason: "补扫描件编号" }, hr, context);
assert.throws(
  () => addEmployeeContract(db, sampleEmployee.id, { type: "fixed_term", startDate: "2026-01-01", endDate: "2025-01-01", reason: "x" }, hr, context),
  /结束日期/,
);

// ---- 11. 模板版本化与批量应用 ----
const created = createSalaryTemplate(
  db,
  {
    name: "骨干教师模板",
    positionId: "POS-TEACHER-LEAD",
    payload: { assessmentBand: "backbone", housingTier: "backboneOrGradeHead" },
    reason: "新设骨干模板",
  },
  finance,
  context,
);
assert.equal(created.version.version, 1);
const v2 = addSalaryTemplateVersion(
  db,
  created.template.id,
  { payload: { assessmentBand: "backbone", housingTier: "backboneOrGradeHead", schoolYears: 5 }, reason: "调整校龄默认值" },
  finance,
  context,
);
assert.equal(v2.version, 2);
const targets = db.employees.filter((employee) => employee.teacherId && employee.id !== sampleEmployee.id).slice(0, 3);
const applyResult = applySalaryTemplate(
  db,
  created.template.id,
  { versionId: v2.id, employeeIds: [...targets.map((employee) => employee.id), "EMP-NOT-EXIST"], reason: "骨干批量套用" },
  finance,
  context,
);
assert.equal(applyResult.applied.length, 3);
assert.equal(applyResult.skipped.length, 1);
targets.forEach((employee) => {
  assert.equal(employee.salaryTemplateVer, 2);
  const teacher = db.teachers.find((item) => item.id === employee.teacherId);
  assert.equal(teacher.salaryProfile.assessmentBand, "backbone", "模板 payload 应深合并进教师工资档案");
});
const untouched = db.employees.find((employee) => !applyResult.applied.includes(employee.id) && employee.teacherId);
assert.notEqual(untouched.salaryTemplateVer, 2, "未选中员工不受影响");
const hrView = JSON.stringify(querySalaryTemplates(db, { includePayload: false }));
assert.ok(!hrView.includes("assessmentBand"), "hr 视图不能包含模板金额内容");
assert.ok(JSON.stringify(querySalaryTemplates(db, { includePayload: true })).includes("assessmentBand"));

// ---- 12. 变更申请闭环 ----
assert.throws(
  () => createProfileChangeRequest(db, teacherAccount, { personName: "改名" }, "非法字段"),
  /不支持本人申请修改/,
);
const flow = createProfileChangeRequest(db, teacherAccount, { phone: "13800009999" }, "换了新手机号");
assert.equal(flow.status, "pending");
assert.throws(
  () => createProfileChangeRequest(db, teacherAccount, { emergencyContact: "李父" }, "再来一单"),
  /已有待审核/,
);
const myProfile = getMyHrProfile(db, teacherAccount);
assert.equal(myProfile.changeRequests[0].id, flow.id);
reviewProfileChangeRequest(db, flow.id, "approve", "核实通过", hr, context);
assert.equal(sampleEmployee.phone, "13800009999", "审批通过后档案应生效");
assert.equal(mirroredTeacher.phone, "13800009999", "镜像同步教学侧电话");
assert.equal(flow.status, "approved");

const flow2 = createProfileChangeRequest(db, teacherAccount, { emergencyContact: "李父" }, "补紧急联系人");
reviewProfileChangeRequest(db, flow2.id, "reject", "信息不完整，请补充关系", hr, context);
assert.equal(flow2.status, "rejected");
assert.equal(sampleEmployee.emergencyContact, "", "拒绝后档案不应变化");
assert.throws(() => reviewProfileChangeRequest(db, flow2.id, "approve", "重复处理", hr, context), /已处理/);

const flow3 = createProfileChangeRequest(db, teacherAccount, { emergencyPhone: "13600001111" }, "补紧急电话");
withdrawProfileChangeRequest(db, flow3.id, teacherAccount);
assert.equal(flow3.status, "withdrawn");

// ---- 13. 花名册导出安全 ----
createEmployee(
  db,
  {
    personName: "=1+1注入测试",
    orgUnitId: "ORG-ADMIN",
    positionId: "POS-ADMIN-STAFF",
    idCard: "110101199205083456",
    reason: "建非教师档案",
  },
  hr,
  context,
);
const exported = exportEmployeesCsv(db, {}, hr, context);
assert.equal(exported.rowCount, db.employees.length);
assert.ok(!exported.csv.includes(idCardPlain), "导出不能含明文证件号");
assert.ok(!exported.csv.includes("pii:v1:"), "导出不能含密文");
assert.ok(exported.csv.includes("'=1+1注入测试"), "公式前缀必须转义防 CSV 注入");
const exportAudit = db.hrAuditLogs[db.hrAuditLogs.length - 1];
assert.equal(exportAudit.action, "roster_export");
assert.ok(exportAudit.reason.includes(`${exported.rowCount} 行`));

// ---- 13. 审计查询过滤 ----
const byTarget = queryHrAuditLogs(db, { targetEmployeeId: sampleEmployee.id, pageSize: 50 });
assert.ok(byTarget.items.length >= 4);
assert.ok(byTarget.items.every((entry) => entry.targetEmployeeId === sampleEmployee.id));
const byAction = queryHrAuditLogs(db, { action: "sensitive_view" });
assert.equal(byAction.items.length, 1);
const byActor = queryHrAuditLogs(db, { actorAccountId: finance.id });
assert.ok(byActor.items.every((entry) => entry.actorAccountId === finance.id));
const paged = queryHrAuditLogs(db, { page: 1, pageSize: 5 });
assert.equal(paged.items.length, 5);
assert.ok(paged.meta.totalPages >= 2);

// ---- 14. 档案分页与过滤 ----
const searched = queryEmployees(db, { search: "李明远" });
assert.equal(searched.items[0].id, sampleEmployee.id);
const byOrg = queryEmployees(db, { orgUnitId: "ORG-STAGE-primary", status: "active" });
assert.ok(byOrg.items.every((employee) => employee.status === "active"));
assert.ok(byOrg.summary.active >= 1);
const capped = queryEmployees(db, { pageSize: "500" });
assert.ok(capped.meta.pageSize <= 100, "pageSize 上限 100");

console.log("hr m2 checks passed");
