import assert from "node:assert/strict";
import { canManageAttendance, readableAttendanceStageIds } from "../server/attendance.js";
import { createHrFlow, hrScopeFor } from "../server/hr.js";

const db = {
  stages: [
    { id: "primary", name: "小学部" },
    { id: "high", name: "高中部" },
  ],
  orgUnits: [
    { id: "ORG-PRIMARY", name: "小学部", type: "division", stageId: "primary", status: "active" },
    { id: "ORG-HIGH", name: "高中部", type: "division", stageId: "high", status: "active" },
  ],
  positions: [{ id: "POS-ADMIN-STAFF", name: "行政人员", series: "admin", status: "active" }],
  subjects: [],
  teachers: [],
  classes: [],
  employees: [],
  employeeContracts: [],
  hrFlows: [],
  hrFlowSteps: [],
  hrAuditLogs: [],
  notifications: [],
  auditLogs: [],
  meta: {},
};

const highAttendanceManager = {
  id: "ACC-HIGH-ATTENDANCE",
  role: "attendance_manager",
  scopeStageIds: ["high"],
};
const highHr = {
  id: "ACC-HIGH-HR",
  role: "division_hr",
  scopeStageIds: ["high"],
};

assert.equal(canManageAttendance(highAttendanceManager), true);
assert.deepEqual(readableAttendanceStageIds(db, highAttendanceManager), ["high"]);
assert.deepEqual([...hrScopeFor(db, highHr).stageIds], ["high"]);

assert.throws(
  () => createHrFlow(db, highHr, { flowType: "transfer", reason: "测试" }),
  /仅可发起本学部入职申请/,
);
assert.throws(
  () =>
    createHrFlow(db, highHr, {
      flowType: "onboard",
      reason: "测试",
      personName: "测试人员",
      orgUnitId: "ORG-PRIMARY",
      positionId: "POS-ADMIN-STAFF",
    }),
  /只能为本学部发起入职/,
);
const flow = createHrFlow(db, highHr, {
  flowType: "onboard",
  reason: "测试",
  personName: "测试人员",
  orgUnitId: "ORG-HIGH",
  positionId: "POS-ADMIN-STAFF",
});
assert.equal(flow.flowType, "onboard");
assert.equal(flow.payload.toStageId, "high");

console.log("division operations roles test passed");
