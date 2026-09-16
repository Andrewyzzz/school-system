import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createInitialData, normalizeDatabase, teacherPayrollPreview } from "../server/storage.js";
import {
  activeAttendanceRecords,
  attendanceSettlementForTeacher,
  canManageAttendance,
  parseAttendanceWorkbook,
  queryAttendanceUploads,
  replaceMonthlyAttendance,
  UNIFIED_ATTENDANCE_POLICY,
} from "../server/attendance.js";

const db = createInitialData({ teacherCount: 24 });
normalizeDatabase(db);

const primaryHead = db.accounts.find((account) => account.username === "head_primary");
const middleHead = db.accounts.find((account) => account.username === "head_middle");
const highHead = db.accounts.find((account) => account.username === "head_high");
const principal = db.accounts.find((account) => account.role === "principal");
const primaryTeacher = db.teachers.find((teacher) => teacher.stageId === "primary");
const middleTeacher = db.teachers.find((teacher) => teacher.stageId === "middle");
const highTeacher = db.teachers.find((teacher) => teacher.stageId === "high");
assert.ok(primaryHead && middleHead && highHead && principal && primaryTeacher && middleTeacher && highTeacher, "测试数据应包含必要账号与教师");

const month = "2026-09";
function record(teacher, date, unifiedAttendance = {}, overrides = {}) {
  return {
    employeeNo: teacher.employeeNo,
    teacherName: teacher.name,
    date,
    shouldAttend: true,
    morningIn: "08:00",
    morningOut: "12:00",
    afternoonIn: "14:00",
    afternoonOut: "17:30",
    unifiedAttendance: {
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      awayMinutes: 0,
      missedClassCount: 0,
      absenceDays: 0,
      exemptionStatus: "normal",
      ...unifiedAttendance,
    },
    note: "",
    sourceRow: 5,
    ...overrides,
  };
}

// 1. 上传权限和版本替换保持原有边界：仅主任维护本学部；历史版本和工资单不被导入动作改写。
const beforePayroll = JSON.stringify(db.payrollDetails);
const firstPrimaryUpload = replaceMonthlyAttendance(db, primaryHead, {
  month,
  stageId: "primary",
  filename: "小学部-2026年9月统一考勤.xlsx",
  records: [record(primaryTeacher, "2026-09-01", { lateMinutes: 10 })],
});
assert.equal(firstPrimaryUpload.upload.status, "active");
assert.equal(JSON.stringify(db.payrollDetails), beforePayroll, "上传考勤表不得直接修改已生成工资单");
assert.throws(
  () => replaceMonthlyAttendance(db, primaryHead, { month, stageId: "high", filename: "越权.xlsx", records: [record(highTeacher, "2026-09-01")] }),
  /只能上传本学部/,
);
assert.throws(
  () => replaceMonthlyAttendance(db, primaryHead, { month, stageId: "primary", filename: "错误姓名.xlsx", records: [record(primaryTeacher, "2026-09-01", {}, { teacherName: "错误姓名" })] }),
  /校验未通过/,
);
const replacement = replaceMonthlyAttendance(db, primaryHead, {
  month,
  stageId: "primary",
  filename: "小学部-2026年9月统一考勤-修订.xlsx",
  records: [record(primaryTeacher, "2026-09-01", { lateMinutes: 10 })],
});
assert.equal(replacement.replacedUploadCount, 1);
assert.equal(activeAttendanceRecords(db, { month, stageId: "primary" }).length, 1);
assert.equal(db.attendanceUploads.filter((upload) => upload.stageId === "primary" && upload.month === month && upload.status === "replaced").length, 1);

// 2. 全校同一边界：10 分钟是轻微，11–30 分钟是一般，超过 30 分钟为较重；
//    多类违纪相加后仍最多扣考核工资的 20%。
const primarySettlement = attendanceSettlementForTeacher(db, primaryTeacher.id, month);
assert.equal(primarySettlement.minorCount, 1, "10 分钟应纳入轻微违纪");
assert.equal(primarySettlement.generalCount, 0);
assert.equal(primarySettlement.performanceDeductionRate, 0.03);
assert.equal(primarySettlement.policyVersion, UNIFIED_ATTENDANCE_POLICY.version);

replaceMonthlyAttendance(db, middleHead, {
  month,
  stageId: "middle",
  filename: "初中部-2026年9月统一考勤.xlsx",
  records: [
    record(middleTeacher, "2026-09-01", { earlyLeaveMinutes: 11 }),
    record(middleTeacher, "2026-09-02", { awayMinutes: 20 }, { sourceRow: 6 }),
  ],
});
const middleSettlement = attendanceSettlementForTeacher(db, middleTeacher.id, month);
assert.equal(middleSettlement.generalCount, 2, "11 分钟及 20 分钟均应纳入一般违纪");
assert.equal(middleSettlement.performanceDeductionRate, 0.18, "一般违纪第 2 次按 18% 计");

replaceMonthlyAttendance(db, highHead, {
  month,
  stageId: "high",
  filename: "高中部-2026年9月统一考勤.xlsx",
  records: [
    record(highTeacher, "2026-09-01", { lateMinutes: 31 }),
    record(highTeacher, "2026-09-02", { missedClassCount: 1 }, { sourceRow: 6 }),
    record(highTeacher, "2026-09-03", { absenceDays: 0.5 }, { sourceRow: 7 }),
  ],
});
const highSettlement = attendanceSettlementForTeacher(db, highTeacher.id, month);
assert.equal(highSettlement.seriousCount, 3, "超过 30 分钟、旷课及半天旷工均为较重违纪");
assert.equal(highSettlement.absenceDays, 0.5);
assert.equal(highSettlement.performanceDeductionRate, 0.2, "较重违纪与其他项合并时按月度 20% 封顶");

// 3. 已批准手续或明确免责时，不从考勤表再认定为旷工；应出勤且全天无记录则留作全天旷工。
replaceMonthlyAttendance(db, primaryHead, {
  month,
  stageId: "primary",
  filename: "小学部-2026年9月统一考勤-免责核验.xlsx",
  records: [
    record(primaryTeacher, "2026-09-01", { exemptionStatus: "exempt", lateMinutes: 40, absenceDays: 1 }),
    record(primaryTeacher, "2026-09-02", {}, { morningIn: "", morningOut: "", afternoonIn: "", afternoonOut: "", sourceRow: 6 }),
  ],
});
const exemptSettlement = attendanceSettlementForTeacher(db, primaryTeacher.id, month);
assert.equal(exemptSettlement.severeCount, 1, "免责记录不得计入，全天无记录的应出勤日应保留为严重旷工");
assert.equal(exemptSettlement.absenceDays, 1);
assert.equal(exemptSettlement.performanceDeductionRate, 0.2);

// 4. 工资只从考核工资扣；考核工资为 0 时不扣款但违纪事实仍保留。
const payroll = teacherPayrollPreview(db, primaryTeacher.id, month);
const assessmentSalary = payroll.components.find((component) => component.name === "考核工资")?.amount || 0;
assert.ok(assessmentSalary > 0, "默认教师应有可核算的考核工资");
const attendanceComponent = payroll.components.find((component) => component.name === "全校统一考勤绩效扣减");
assert.ok(attendanceComponent, "违纪应形成统一考勤绩效扣减项");
assert.equal(attendanceComponent.amount, -Math.round(assessmentSalary * 0.2 * 100) / 100);
assert.match(attendanceComponent.basis, /考核工资/);

const zeroAssessmentDb = structuredClone(db);
const zeroAssessmentTeacher = zeroAssessmentDb.teachers.find((teacher) => teacher.id === primaryTeacher.id);
zeroAssessmentTeacher.salaryProfile.assessmentBand = "unsupported-assessment-band";
const zeroAssessmentPayroll = teacherPayrollPreview(zeroAssessmentDb, primaryTeacher.id, month);
assert.equal(zeroAssessmentPayroll.components.some((component) => component.name === "全校统一考勤绩效扣减"), false);
assert.equal(zeroAssessmentPayroll.attendanceSettlement.attendanceDeductionStatus, "考核工资为 0，仅保留考勤记录");
assert.equal(zeroAssessmentPayroll.attendanceSettlement.severeCount, 1, "考核工资为 0 不得删除违纪记录");

// 5. 最低工资保护以税前应发控制，而不是从基本工资、房补或课时费继续追扣。
const protectedDb = structuredClone(db);
const protectedPreviewBeforeFloor = teacherPayrollPreview(protectedDb, primaryTeacher.id, month);
const grossBeforeDeduction = protectedPreviewBeforeFloor.grossPay + Math.abs(
  protectedPreviewBeforeFloor.components.find((component) => component.name === "全校统一考勤绩效扣减")?.amount || 0,
);
protectedDb.payrollRules.teacherSalaryScheme.minimumWage = grossBeforeDeduction;
const protectedPayroll = teacherPayrollPreview(protectedDb, primaryTeacher.id, month);
assert.equal(protectedPayroll.components.some((component) => component.name === "全校统一考勤绩效扣减"), false);
assert.equal(protectedPayroll.attendanceSettlement.attendanceDeductionStatus, "税前应发已受最低工资保护，仅保留考勤记录");
assert.equal(protectedPayroll.grossPay, grossBeforeDeduction);

// 6. 权限和模板同步为统一口径。空模板不得被静默导入。
const headView = queryAttendanceUploads(db, primaryHead, { month });
assert.deepEqual(headView.stageOptions.map((stage) => stage.id), ["primary"]);
const principalView = queryAttendanceUploads(db, principal, { month });
assert.equal(principalView.stageOptions.length, 4);
assert.equal(principalView.canUpload, false);
assert.equal(canManageAttendance(principal), false);
const template = await fs.readFile(new URL("../assets/全校统一月度考勤上传模板.xlsx", import.meta.url));
assert.throws(() => parseAttendanceWorkbook(template), /没有可导入的记录/);

console.log("attendance upload checks passed");
