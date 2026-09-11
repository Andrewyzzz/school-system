import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createInitialData, normalizeDatabase, teacherPayrollPreview } from "../server/storage.js";
import {
  activeAttendanceRecords,
  canManageAttendance,
  attendanceSettlementForTeacher,
  parseAttendanceWorkbook,
  queryAttendanceUploads,
  replaceMonthlyAttendance,
} from "../server/attendance.js";

const db = createInitialData({ teacherCount: 24 });
normalizeDatabase(db);

const primaryHead = db.accounts.find((account) => account.username === "head_primary");
const highHead = db.accounts.find((account) => account.username === "head_high");
const middleHead = db.accounts.find((account) => account.username === "head_middle");
const principal = db.accounts.find((account) => account.role === "principal");
const primaryTeacher = db.teachers.find((teacher) => teacher.stageId === "primary");
const middleTeacher = db.teachers.find((teacher) => teacher.stageId === "middle");
const highTeacher = db.teachers.find((teacher) => teacher.stageId === "high");
assert.ok(primaryHead && highHead && middleHead && principal && primaryTeacher && middleTeacher && highTeacher, "测试数据应包含学部主任、校长与各学部教师");

const month = "2026-09";
const payload = {
  month,
  stageId: "primary",
  filename: "小学部-2026年9月考勤.xlsx",
  records: [
    {
      employeeNo: primaryTeacher.employeeNo,
      teacherName: primaryTeacher.name,
      date: "2026-09-01",
      morningIn: "08:12",
      morningOut: "12:03",
      afternoonIn: "14:08",
      afternoonOut: "17:31",
      note: "",
      sourceRow: 5,
    },
  ],
};

// 1. 主任只能上传自己学部、工号姓名和月份都必须对应，导入不会修改工资数据。
const beforePayroll = JSON.stringify(db.payrollDetails);
const first = replaceMonthlyAttendance(db, primaryHead, payload);
assert.equal(first.upload.status, "active");
assert.equal(first.upload.rowCount, 1);
assert.equal(activeAttendanceRecords(db, { month, stageId: "primary" }).length, 1);
assert.equal(JSON.stringify(db.payrollDetails), beforePayroll, "考勤导入阶段不得直接修改工资单");
assert.throws(
  () => replaceMonthlyAttendance(db, primaryHead, { ...payload, stageId: "high" }),
  /只能上传本学部/,
  "小学部主任不能上传高中部考勤",
);
assert.throws(
  () =>
    replaceMonthlyAttendance(db, primaryHead, {
      ...payload,
      records: [{ ...payload.records[0], teacherName: "错误姓名" }],
    }),
  /校验未通过/,
  "工号与姓名必须和人员档案一致",
);
assert.throws(
  () =>
    replaceMonthlyAttendance(db, primaryHead, {
      ...payload,
      records: [{ ...payload.records[0], date: "2026-10-01" }],
    }),
  /校验未通过/,
  "考勤日期必须属于所选月份",
);

// 2. 同一学部、同一月份重传替换当前版本，但历史版本与历史明细不删除。
const second = replaceMonthlyAttendance(db, primaryHead, {
  ...payload,
  filename: "小学部-2026年9月考勤-修订版.xlsx",
  records: [{ ...payload.records[0], afternoonOut: "17:42", sourceRow: 6 }],
});
assert.equal(second.replacedUploadCount, 1);
assert.equal(db.attendanceUploads.filter((upload) => upload.stageId === "primary" && upload.month === month && upload.status === "active").length, 1);
assert.equal(db.attendanceUploads.filter((upload) => upload.stageId === "primary" && upload.month === month && upload.status === "replaced").length, 1);
const active = activeAttendanceRecords(db, { month, stageId: "primary" });
assert.equal(active.length, 1);
assert.equal(active[0].afternoonOut, "17:42");

// 3. 主任仅看到本学部，校长只读全校；校长不能绕过服务端上传。
const headView = queryAttendanceUploads(db, primaryHead, { month });
assert.deepEqual(headView.stageOptions.map((stage) => stage.id), ["primary"]);
assert.equal(headView.uploads.length, 2, "历史版本应对主任可见");
const principalView = queryAttendanceUploads(db, principal, { month });
assert.equal(principalView.stageOptions.length, 4);
assert.equal(principalView.canUpload, false);
assert.equal(canManageAttendance(principal), false);
assert.equal(canManageAttendance(highHead), true);

// 4. 小学部按上传表处理迟到、明确未补卡和旷工：迟到 30 元／次，
//    未补卡 50 元／次，四次均未打卡且四项均标“未补卡”时旷工 200 元／天。
const primaryPolicyUpload = replaceMonthlyAttendance(db, primaryHead, {
  ...payload,
  filename: "小学部-2026年9月考勤-迟到核算版.xlsx",
  records: [
    { employeeNo: primaryTeacher.employeeNo, teacherName: primaryTeacher.name, date: "2026-09-01", shouldAttend: true, morningIn: "07:46", morningOut: "11:50", afternoonIn: "14:16", afternoonOut: "17:30", makeupStatuses: { morningIn: "normal", morningOut: "normal", afternoonIn: "normal", afternoonOut: "normal" }, note: "两次迟到", sourceRow: 5 },
    { employeeNo: primaryTeacher.employeeNo, teacherName: primaryTeacher.name, date: "2026-09-02", shouldAttend: true, morningIn: "07:45", morningOut: "11:50", afternoonIn: "14:15", afternoonOut: "17:30", makeupStatuses: { morningIn: "normal", morningOut: "normal", afternoonIn: "normal", afternoonOut: "normal" }, note: "临界时间正常", sourceRow: 6 },
    { employeeNo: primaryTeacher.employeeNo, teacherName: primaryTeacher.name, date: "2026-09-03", shouldAttend: true, morningIn: "07:40", morningOut: "", afternoonIn: "14:00", afternoonOut: "17:30", makeupStatuses: { morningIn: "normal", morningOut: "unmade", afternoonIn: "normal", afternoonOut: "normal" }, note: "一次未补卡", sourceRow: 7 },
    { employeeNo: primaryTeacher.employeeNo, teacherName: primaryTeacher.name, date: "2026-09-04", shouldAttend: true, morningIn: "", morningOut: "", afternoonIn: "", afternoonOut: "", makeupStatuses: { morningIn: "unmade", morningOut: "unmade", afternoonIn: "unmade", afternoonOut: "unmade" }, note: "全天未打卡", sourceRow: 8 },
    { employeeNo: primaryTeacher.employeeNo, teacherName: primaryTeacher.name, date: "2026-09-05", shouldAttend: true, morningIn: "", morningOut: "11:50", afternoonIn: "14:00", afternoonOut: "17:30", makeupStatuses: { morningIn: "madeUp", morningOut: "normal", afternoonIn: "normal", afternoonOut: "normal" }, note: "已补卡不扣款", sourceRow: 9 },
    { employeeNo: primaryTeacher.employeeNo, teacherName: primaryTeacher.name, date: "2026-09-06", shouldAttend: false, morningIn: "08:00", morningOut: "", afternoonIn: "15:00", afternoonOut: "", makeupStatuses: {}, note: "不应出勤不计入", sourceRow: 10 },
  ],
});
const primarySettlement = attendanceSettlementForTeacher(db, primaryTeacher.id, month);
assert.equal(primarySettlement.lateEarlyCount, 2, "小学部只累计导入记录里的上午、下午迟到");
assert.equal(primarySettlement.lateEarlyDeduction, 60);
assert.equal(primarySettlement.missingPunchCount, 1, "明确未补卡的单次缺卡应扣款，已补卡不扣款");
assert.equal(primarySettlement.missingPunchDeduction, 50);
assert.equal(primarySettlement.absenceDays, 1, "全天未打卡且四项均未补卡时按旷工处理");
assert.equal(primarySettlement.absenceDeduction, 200);
assert.equal(primarySettlement.totalDeduction, 310);
assert.equal(primaryPolicyUpload.upload.settlementSummary.totalDeduction, 310);
const primaryPayroll = teacherPayrollPreview(db, primaryTeacher.id, month);
assert.equal(primaryPayroll.components.find((component) => component.name === "小学部考勤扣款")?.amount, -310);

// 5. 初中部已确认规则：迟到／早退按当月第 1、2、3 次及以后扣 20、30、50 元；
//    “应出勤且全天无打卡”并且没有已批准请假时，才按旷工扣 300 元／天。
const middleAccount = db.accounts.find((account) => account.teacherId === middleTeacher.id) || {
  id: "ACC-MIDDLE-ATTENDANCE-TEACHER",
  teacherId: middleTeacher.id,
};
if (!db.accounts.some((account) => account.id === middleAccount.id)) db.accounts.push(middleAccount);
if (!Array.isArray(db.oaRequests)) db.oaRequests = [];
db.oaRequests.push({
  id: "OA-MIDDLE-LEAVE",
  templateKey: "leave",
  applicantAccountId: middleAccount.id,
  status: "approved",
  formData: { startDate: "2026-09-03", startHalf: "上午", endDate: "2026-09-03", endHalf: "下午" },
});
const middleUpload = replaceMonthlyAttendance(db, middleHead, {
  month,
  stageId: "middle",
  filename: "初中部-2026年9月考勤.xlsx",
  records: [
    { employeeNo: middleTeacher.employeeNo, teacherName: middleTeacher.name, date: "2026-09-01", shouldAttend: true, morningIn: "07:51", morningOut: "11:24", afternoonIn: "14:06", afternoonOut: "17:24", note: "", sourceRow: 5 },
    { employeeNo: middleTeacher.employeeNo, teacherName: middleTeacher.name, date: "2026-09-02", shouldAttend: true, morningIn: "", morningOut: "", afternoonIn: "", afternoonOut: "", note: "", sourceRow: 6 },
    { employeeNo: middleTeacher.employeeNo, teacherName: middleTeacher.name, date: "2026-09-03", shouldAttend: true, morningIn: "", morningOut: "", afternoonIn: "", afternoonOut: "", note: "已批准请假", sourceRow: 7 },
    { employeeNo: middleTeacher.employeeNo, teacherName: middleTeacher.name, date: "2026-09-04", shouldAttend: true, morningIn: "07:50", morningOut: "11:25", afternoonIn: "14:05", afternoonOut: "17:25", note: "临界时间正常", sourceRow: 8 },
    { employeeNo: middleTeacher.employeeNo, teacherName: middleTeacher.name, date: "2026-09-05", shouldAttend: false, morningIn: "", morningOut: "", afternoonIn: "", afternoonOut: "", note: "休息", sourceRow: 9 },
  ],
});
const middleSettlement = attendanceSettlementForTeacher(db, middleTeacher.id, month);
assert.equal(middleSettlement.lateEarlyCount, 4);
assert.equal(middleSettlement.lateEarlyDeduction, 150);
assert.equal(middleSettlement.absenceDays, 1, "有已批准请假的全天无记录不得按旷工处理");
assert.equal(middleSettlement.absenceDeduction, 300);
assert.equal(middleSettlement.totalDeduction, 450);
assert.equal(middleUpload.upload.settlementSummary.totalDeduction, 450);
const payroll = teacherPayrollPreview(db, middleTeacher.id, month);
assert.equal(payroll.attendanceSettlement.totalDeduction, 450);
assert.equal(payroll.components.find((component) => component.name === "初中部考勤扣款")?.amount, -450);

// 6. 高中部只按考勤结果处理：轻微迟到／未签退从第 3 次起每次扣考核工资 2%，
//    超过 10 分钟迟到／早退每次 3%，旷课 1 节 5%、2 节及以上 15%，
//    旷工按当月工资总额 1/22。与课表有关的旷课课次需另行标为“已取消”。
const highUpload = replaceMonthlyAttendance(db, highHead, {
  month,
  stageId: "high",
  filename: "高中部-2026年9月考勤结果表.xlsx",
  records: [
    { employeeNo: highTeacher.employeeNo, teacherName: highTeacher.name, date: "2026-09-01", shouldAttend: true, highAttendance: { arrivalStatus: "late", lateMinutes: 5, checkoutStatus: "normal", earlyLeaveMinutes: 0, missedClassCount: 0, absenceWorkDays: 0 }, note: "轻微迟到 1", sourceRow: 5 },
    { employeeNo: highTeacher.employeeNo, teacherName: highTeacher.name, date: "2026-09-02", shouldAttend: true, highAttendance: { arrivalStatus: "late", lateMinutes: 10, checkoutStatus: "normal", earlyLeaveMinutes: 0, missedClassCount: 0, absenceWorkDays: 0 }, note: "轻微迟到 2", sourceRow: 6 },
    { employeeNo: highTeacher.employeeNo, teacherName: highTeacher.name, date: "2026-09-03", shouldAttend: true, highAttendance: { arrivalStatus: "onTime", lateMinutes: 0, checkoutStatus: "unsigned", earlyLeaveMinutes: 0, missedClassCount: 0, absenceWorkDays: 0 }, note: "第 3 次轻微违纪", sourceRow: 7 },
    { employeeNo: highTeacher.employeeNo, teacherName: highTeacher.name, date: "2026-09-04", shouldAttend: true, highAttendance: { arrivalStatus: "late", lateMinutes: 11, checkoutStatus: "normal", earlyLeaveMinutes: 0, missedClassCount: 0, absenceWorkDays: 0 }, note: "超时迟到", sourceRow: 8 },
    { employeeNo: highTeacher.employeeNo, teacherName: highTeacher.name, date: "2026-09-05", shouldAttend: true, highAttendance: { arrivalStatus: "onTime", lateMinutes: 0, checkoutStatus: "early", earlyLeaveMinutes: 5, missedClassCount: 0, absenceWorkDays: 0 }, note: "早退", sourceRow: 9 },
    { employeeNo: highTeacher.employeeNo, teacherName: highTeacher.name, date: "2026-09-06", shouldAttend: true, highAttendance: { arrivalStatus: "onTime", lateMinutes: 0, checkoutStatus: "normal", earlyLeaveMinutes: 0, missedClassCount: 2, absenceWorkDays: 0 }, note: "旷课两节", sourceRow: 10 },
    { employeeNo: highTeacher.employeeNo, teacherName: highTeacher.name, date: "2026-09-07", shouldAttend: true, highAttendance: { arrivalStatus: "onTime", lateMinutes: 0, checkoutStatus: "normal", earlyLeaveMinutes: 0, missedClassCount: 0, absenceWorkDays: 1 }, note: "旷工一天", sourceRow: 11 },
  ],
});
const highSettlement = attendanceSettlementForTeacher(db, highTeacher.id, month);
assert.equal(highSettlement.lateEarlyCount, 3);
assert.equal(highSettlement.seriousOccurrenceCount, 2);
assert.equal(highSettlement.missedClassCount, 2);
assert.equal(highSettlement.absenceDays, 1);
assert.equal(highSettlement.performanceDeductionRate, 0.23, "第 3 次轻微违纪 2% + 两次严重违纪 6% + 两节旷课 15%");
assert.equal(highUpload.upload.settlementSummary.requiresPayrollContext, true);
const highPayroll = teacherPayrollPreview(db, highTeacher.id, month);
const highAttendanceComponent = highPayroll.components.find((component) => component.name === "高中部考勤违纪扣款");
assert.ok(highAttendanceComponent, "高中部考勤结果应进入工资组成项");
const assessmentSalary = highPayroll.components.find((component) => component.name === "考核工资")?.amount || 0;
const grossBeforeAttendance = highPayroll.components
  .filter((component) => component.name !== "高中部考勤违纪扣款")
  .reduce((sum, component) => sum + Number(component.amount || 0), 0);
const expectedHighDeduction = Math.round((assessmentSalary * 0.23 + grossBeforeAttendance / 22) * 100) / 100;
assert.equal(highAttendanceComponent.amount, -expectedHighDeduction);
assert.match(highAttendanceComponent.basis, /对应课次须标为已取消/, "旷课课时工资应由课表取消状态控制");

// 7. 系统模板本身是可读取的标准 xlsx；未填数据时应明确拒绝而不是静默导入空表。
const template = await fs.readFile(new URL("../assets/教师月度考勤上传模板.xlsx", import.meta.url));
assert.throws(() => parseAttendanceWorkbook(template), /没有可导入的记录/);
const primaryTemplate = await fs.readFile(new URL("../assets/小学部教师月度考勤上传模板.xlsx", import.meta.url));
assert.throws(() => parseAttendanceWorkbook(primaryTemplate, { stageId: "primary" }), /没有可导入的记录/, "小学部模板应包含补卡状态列并可被识别");
const highTemplate = await fs.readFile(new URL("../assets/高中部教师月度考勤上传模板.xlsx", import.meta.url));
assert.throws(() => parseAttendanceWorkbook(highTemplate, { stageId: "high" }), /没有可导入的记录/, "高中部模板应包含考勤结果列并可被识别");

console.log("attendance upload checks passed");
