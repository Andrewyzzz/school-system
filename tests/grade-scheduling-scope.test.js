import assert from "node:assert/strict";
import { assertSchedulingAccess } from "../server/accessScope.js";

const db = {
  scheduleConstraints: [],
  scheduleVersions: [],
  scheduleDrafts: [],
  scheduleChangeRequests: [],
};

const primaryLow = {
  role: "admin",
  scopeStageIds: ["primary"],
  schedulingGradeIds: ["elementary-g1", "elementary-g2", "elementary-g3"],
};
const primaryHigh = {
  role: "admin",
  scopeStageIds: ["primary"],
  schedulingGradeIds: ["elementary-g4", "elementary-g5", "elementary-g6"],
};
const middleCoScheduler = {
  role: "admin",
  scopeStageIds: ["middle"],
  schedulingGradeIds: ["middle-g1", "middle-g2", "middle-g3"],
};

assert.doesNotThrow(() => assertSchedulingAccess(db, primaryLow, { divisionId: "elementary", gradeId: "elementary-g1" }, "查看"));
assert.doesNotThrow(() => assertSchedulingAccess(db, primaryLow, { stageId: "primary", grade: 3 }, "保存"));
assert.throws(
  () => assertSchedulingAccess(db, primaryLow, { divisionId: "elementary", gradeId: "elementary-g4" }, "生成"),
  /负责年级/,
);
assert.throws(
  () => assertSchedulingAccess(db, primaryHigh, { divisionId: "elementary", gradeId: "elementary-g2" }, "发布"),
  /负责年级/,
);
assert.doesNotThrow(() => assertSchedulingAccess(db, middleCoScheduler, { divisionId: "middle", gradeId: "middle-g1" }, "调整"));
assert.doesNotThrow(() => assertSchedulingAccess(db, middleCoScheduler, { divisionId: "middle", gradeId: "middle-g3" }, "发布"));
assert.throws(
  () => assertSchedulingAccess(db, middleCoScheduler, { divisionId: "high", gradeId: "high-g1" }, "查看"),
  /本学部/,
);
assert.throws(
  () => assertSchedulingAccess(db, primaryLow, { divisionId: "elementary" }, "查看"),
  /负责年级/,
);

console.log("grade scheduling scope checks passed");
