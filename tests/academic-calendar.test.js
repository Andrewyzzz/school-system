import assert from "node:assert/strict";
import {
  createInitialData,
  normalizeDatabase,
  queryAcademicCalendar,
  queryTerms,
  saveAcademicCalendarEntry,
} from "../server/storage.js";
import { buildSchedulingConfig } from "../server/scheduling.js";
import { calendarSettlementForMonth } from "../server/terms.js";

const db = createInitialData({ teacherCount: 30 });
normalizeDatabase(db);

const primaryHead = db.accounts.find((account) => account.username === "head_primary");
const highHead = db.accounts.find((account) => account.username === "head_high");
assert.ok(primaryHead && highHead, "应存在各学部主任演示账号");

// 1. 旧库没有校历集合时，启动迁移只补齐校历投影，不改 termId 主数据。
const originalTerms = db.terms.map((term) => term.id);
assert.equal(
  db.academicCalendarPeriods.filter((entry) => entry.type === "teaching").length,
  originalTerms.length * 4,
  "每个既有教学学期应自动补齐四个学部校历区间",
);
assert.deepEqual(db.terms.map((term) => term.id), originalTerms, "校历迁移不得改变既有学期主键");

const currentTerm = db.terms.find((term) => term.current) || db.terms[0];
const primaryTeaching = db.academicCalendarPeriods.find(
  (entry) => entry.type === "teaching" && entry.termId === currentTerm.id && entry.stageId === "primary",
);
assert.ok(primaryTeaching, "小学部应有当前教学期校历");

// 2. 已完成时间段不可再修改；后续正式学期仍可由本学部主任调整，排课读取新日期。
assert.throws(
  () =>
    saveAcademicCalendarEntry(
      db,
      {
        id: primaryTeaching.id,
        periodName: "试图改写已完成学期",
        stageId: "primary",
        type: "teaching",
        phase: "fall",
        startDate: "2026-06-22",
        endDate: "2026-07-24",
      },
      primaryHead,
    ),
  /已完成，不能再修改/,
  "已完成时间段必须在服务端锁定，不能仅隐藏界面按钮",
);
const futureTeaching = saveAcademicCalendarEntry(
  db,
  {
    periodName: "27-28 秋季学期",
    stageId: "primary",
    type: "teaching",
    phase: "fall",
    startDate: "2027-08-20",
    endDate: "2028-01-20",
  },
  primaryHead,
).entry;
saveAcademicCalendarEntry(
  db,
  {
    id: futureTeaching.id,
    periodName: "27-28 秋季学期",
    stageId: "primary",
    type: "teaching",
    phase: "fall",
    startDate: "2027-08-22",
    endDate: "2028-01-22",
    note: "小学部开学日调整",
  },
  primaryHead,
);
const primaryConfig = buildSchedulingConfig(db, {
  termId: futureTeaching.termId,
  divisionId: "elementary",
  gradeId: "elementary-g1",
});
assert.equal(primaryConfig.termStartDate, "2027-08-22", "小学部排课应读取本学部校历开学日");
assert.equal(primaryConfig.termEndDate, "2028-01-22", "小学部排课应读取本学部校历结课日");

assert.throws(
  () =>
    saveAcademicCalendarEntry(
      db,
      {
        periodName: "26-27 暑假",
        stageId: "high",
        type: "summer_break",
        startDate: "2026-08-01",
        endDate: "2026-08-31",
      },
      primaryHead,
    ),
  /学部主任/,
  "小学部主任不能维护高中部校历",
);

// 3. 寒暑假是校历区间，不会新建 term，也不会混入排课/工资历史的教学学期列表。
const termCountBeforeHoliday = db.terms.length;
saveAcademicCalendarEntry(
  db,
  {
    periodName: "26-27 暑假",
    stageId: "primary",
    type: "summer_break",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    note: "待教育主管部门通知后发布",
  },
  primaryHead,
);
assert.equal(db.terms.length, termCountBeforeHoliday, "寒暑假不能创建可排课学期");
assert.ok(
  db.academicCalendarPeriods.some((entry) => entry.stageId === "primary" && entry.type === "summer_break"),
  "暑假应作为小学部独立校历区间保存",
);
assert.ok(queryTerms(db).terms.every((term) => !/寒假|暑假/.test(term.name)), "教学学期列表不得出现寒暑假");
const augustSettlement = calendarSettlementForMonth(db, "2026-08", "primary");
assert.equal(augustSettlement.holidayDays, 31, "薪资应能读取小学部暑假标签覆盖的天数");
assert.equal(augustSettlement.teachingDays, 0, "完整暑假月份不应按正式学期结算");

// 4. 主任只填写时间段名称、标签和日期。内部从“27-28”推导学年，正式学期才创建 term。
assert.ok(db.terms.some((term) => term.schoolYear === "2027-2028" && term.semester === "上学期"));
assert.ok(db.terms.some((term) => term.name === "27-28 秋季学期"), "正式学期名称应直接采用主任维护的时间段名称");

// 5. 校历直接列出所有历史时间段，且学部主任读取到的结果只能包含自己的学部。
const calendar = queryAcademicCalendar(db, { allYears: true, stageIds: ["primary"] });
assert.equal(calendar.allYears, true, "时间段视图应一次读取全部历史记录，不要求维护学年档案");
assert.ok(calendar.entries.length > 0 && calendar.entries.every((entry) => entry.stageId === "primary"));
assert.ok(calendar.entries.some((entry) => entry.type === "summer_break"), "校历时间线应展示暑假");
assert.ok(calendar.entries.some((entry) => entry.name === "27-28 秋季学期"), "时间段视图应保留主任维护的名称");
assert.ok(calendar.terms.some((term) => term.datePhase === "ended"), "结束日期已过的教学期应向界面暴露完成状态");

console.log("academic calendar checks passed");
