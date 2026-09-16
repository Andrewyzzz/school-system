import assert from "node:assert/strict";
import {
  canExportAllPayrollDetails,
  canManagePayrollConfig,
  canViewAllPayrollDetails,
  canViewDivisionPayrollDetails,
  divisionPayrollScopeFor,
} from "../server/financeScope.js";

const finance = { role: "finance", financeScope: "headquarters", financeReadAll: true };
const financeWithoutExport = { ...finance, payrollExportAll: false };
const readOnlyPrincipal = { role: "principal", payrollReadAll: true, payrollExportAll: false };
const hrAdminViewer = { role: "system_admin", payrollReadAll: true, payrollExportAll: false };
const unapprovedPrincipal = { role: "principal", payrollReadAll: false, payrollExportAll: true };
const payrollViewer = { role: "payroll_viewer", payrollReadAll: true, payrollExportAll: false };
const payrollExporter = { role: "payroll_exporter", payrollReadAll: true, payrollExportAll: true };
const divisionHead = { role: "division_head", payrollReadDivision: true, scopeStageIds: ["primary"] };
const unscopedDivisionHead = { role: "division_head", payrollReadDivision: true, scopeStageIds: [] };

assert.equal(canViewAllPayrollDetails(finance), true);
assert.equal(canExportAllPayrollDetails(finance), true);
assert.equal(canManagePayrollConfig(finance), true);
assert.equal(canViewAllPayrollDetails(financeWithoutExport), true);
assert.equal(canExportAllPayrollDetails(financeWithoutExport), false);
assert.equal(canManagePayrollConfig(financeWithoutExport), true);
assert.equal(canViewAllPayrollDetails(readOnlyPrincipal), true);
assert.equal(canExportAllPayrollDetails(readOnlyPrincipal), false);
assert.equal(canManagePayrollConfig(readOnlyPrincipal), false);
assert.equal(canViewAllPayrollDetails(hrAdminViewer), true);
assert.equal(canExportAllPayrollDetails(hrAdminViewer), false);
assert.equal(canViewAllPayrollDetails(unapprovedPrincipal), false);
assert.equal(canExportAllPayrollDetails(unapprovedPrincipal), false);
assert.equal(canViewAllPayrollDetails(payrollViewer), true);
assert.equal(canExportAllPayrollDetails(payrollViewer), false);
assert.equal(canViewAllPayrollDetails(payrollExporter), true);
assert.equal(canExportAllPayrollDetails(payrollExporter), true);
assert.equal(divisionPayrollScopeFor(divisionHead), "primary");
assert.equal(canViewDivisionPayrollDetails(divisionHead), true);
assert.equal(canExportAllPayrollDetails(divisionHead), false);
assert.equal(canManagePayrollConfig(divisionHead), false);
assert.equal(divisionPayrollScopeFor(unscopedDivisionHead), "");
assert.equal(canViewDivisionPayrollDetails(unscopedDivisionHead), false);

console.log("principal payroll access tests passed");
