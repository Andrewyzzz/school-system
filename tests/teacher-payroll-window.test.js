import assert from "node:assert/strict";
import {
  canTeacherAccessPayrollMonth,
  teacherPayrollVisibleMonths,
} from "../server/payrollVisibility.js";

const autumnTerm = {
  id: "TERM-2026-AUTUMN",
  startDate: "2026-09-01",
  endDate: "2027-01-31",
};
const springTerm = {
  id: "TERM-2027-SPRING",
  startDate: "2027-02-01",
  endDate: "2027-07-15",
};

assert.deepEqual(
  teacherPayrollVisibleMonths(autumnTerm),
  ["2026-09", "2026-10", "2026-11", "2026-12", "2027-01"],
  "老师应能查看当前学期覆盖的全部月份",
);
assert.equal(canTeacherAccessPayrollMonth("2026-12", autumnTerm), true);
assert.equal(canTeacherAccessPayrollMonth("2026-08", autumnTerm), false, "学期开学前的工资必须隐藏");

assert.deepEqual(
  teacherPayrollVisibleMonths(springTerm),
  ["2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07"],
  "启用新学期后应自动换成新学期月份",
);
assert.equal(canTeacherAccessPayrollMonth("2027-01", springTerm), false, "新学期启用后上学期工资必须隐藏");
assert.deepEqual(teacherPayrollVisibleMonths(null), [], "缺少当前学期时不得放宽工资范围");

console.log("teacher payroll window checks passed");
