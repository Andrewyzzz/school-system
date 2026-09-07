export const DEFAULT_TERM_ID = "TERM-2026-PHASE1";

// 学期是排课、课次、工资快照的既有业务主键；校历则是学部级的时间事实。
// 两者不能混在一起：寒暑假需要参与财务判断，但绝不能变成可供排课选择的“学期”。
export const CALENDAR_STAGE_IDS = ["kindergarten", "primary", "middle", "high"];
export const CALENDAR_ENTRY_TYPES = ["teaching", "winter_break", "summer_break"];

const STAGE_ID_ALIASES = { elementary: "primary" };

const DEFAULT_TERMS = [
  {
    id: DEFAULT_TERM_ID,
    name: "2026年第一阶段试运行学期",
    schoolYear: "2026",
    semester: "phase1",
    startDate: "2026-06-15",
    endDate: "2026-07-31",
    status: "active",
    current: true,
    divisionWeekStarts: {
      elementary: "2026-06-15",
      middle: "2026-06-22",
      high: "2026-06-29",
    },
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function calendarStageId(stageId = "") {
  return STAGE_ID_ALIASES[String(stageId || "")] || String(stageId || "");
}

function validDateKey(value = "") {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").slice(0, 10));
}

export function calendarPhaseForSemester(semester = "") {
  const text = String(semester || "").toLowerCase();
  if (/下学期|春季|spring|second/.test(text)) return "spring";
  if (/上学期|秋季|fall|autumn|first/.test(text)) return "fall";
  return "";
}

export function calendarEntryLabel(entry = {}) {
  if (entry.name) return String(entry.name);
  if (entry.type === "winter_break") return "寒假";
  if (entry.type === "summer_break") return "暑假";
  return entry.phase === "spring" ? "春季学期" : "秋季学期";
}

function addDays(dateKey, days) {
  const [year, month, day] = String(dateKey || "").split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function startOfNaturalWeek(dateKey) {
  const [year, month, day] = String(dateKey || DEFAULT_TERMS[0].startDate).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayIndex = date.getDay();
  const offset = dayIndex === 0 ? 6 : dayIndex - 1;
  return addDays(dateKey, -offset);
}

// 把早于开学日的周起点整周顺延回学期内，修正历史脏数据。
function clampWeekStartsToTerm(weekStarts, startDate, endDate) {
  const result = {};
  Object.entries(weekStarts || {}).forEach(([key, value]) => {
    let week = String(value || "");
    if (!week) return;
    let guard = 0;
    while (week < String(startDate) && guard < 60) {
      const next = addDays(week, 7);
      if (endDate && next > String(endDate)) break;
      week = next;
      guard += 1;
    }
    result[key] = week;
  });
  return result;
}

function normalizeTerm(term = {}, fallback = DEFAULT_TERMS[0]) {
  const startDate = String(term.startDate || fallback.startDate || "2026-06-15");
  const endDate = String(term.endDate || fallback.endDate || "2026-07-31");
  const rawWeekStarts =
    term.divisionWeekStarts && typeof term.divisionWeekStarts === "object" && !Array.isArray(term.divisionWeekStarts)
      ? term.divisionWeekStarts
      : fallback.divisionWeekStarts || {};
  return {
    id: String(term.id || fallback.id || DEFAULT_TERM_ID),
    name: String(term.name || fallback.name || "当前学期"),
    schoolYear: String(term.schoolYear || fallback.schoolYear || ""),
    semester: String(term.semester || fallback.semester || ""),
    startDate,
    endDate,
    settlementMonth: String(term.settlementMonth || fallback.settlementMonth || ""),
    status: String(term.status || fallback.status || "active"),
    current: Boolean(term.current),
    divisionWeekStarts: clampWeekStartsToTerm(rawWeekStarts, startDate, endDate),
  };
}

export function defaultTerms() {
  return clone(DEFAULT_TERMS);
}

export function ensureTerms(db) {
  let changed = false;
  if (!Array.isArray(db.terms) || !db.terms.length) {
    db.terms = defaultTerms();
    return true;
  }

  db.terms = db.terms.map((term, index) => {
    const normalized = normalizeTerm(term, DEFAULT_TERMS[index] || DEFAULT_TERMS[0]);
    if (JSON.stringify(normalized) !== JSON.stringify(term)) changed = true;
    return normalized;
  });

  if (!db.terms.some((term) => term.current)) {
    db.terms[0].current = true;
    changed = true;
  }

  const currentTermId = db.terms.find((term) => term.current)?.id;
  db.terms = db.terms.map((term) => {
    if (term.id === currentTermId) return term;
    if (!term.current) return term;
    changed = true;
    return { ...term, current: false };
  });

  return changed;
}

function defaultCalendarEntry(term, stageId) {
  return {
    id: `CAL-${term.id}-${stageId}-TEACHING`,
    type: "teaching",
    phase: calendarPhaseForSemester(term.semester) || "fall",
    stageId,
    schoolYear: String(term.schoolYear || ""),
    termId: term.id,
    name: term.name,
    startDate: term.startDate,
    endDate: term.endDate,
    status: "published",
    version: 1,
    source: "term_migration",
    updatedAt: term.createdAt || "",
    updatedByName: "系统迁移",
  };
}

function normalizeCalendarEntry(entry = {}) {
  const type = CALENDAR_ENTRY_TYPES.includes(entry.type) ? entry.type : "teaching";
  const stageId = calendarStageId(entry.stageId);
  return {
    id: String(entry.id || ""),
    type,
    phase: type === "teaching" ? String(entry.phase || "fall") : "",
    stageId,
    schoolYear: String(entry.schoolYear || ""),
    termId: String(entry.termId || ""),
    name: String(entry.name || ""),
    startDate: validDateKey(entry.startDate) ? String(entry.startDate).slice(0, 10) : "",
    endDate: validDateKey(entry.endDate) ? String(entry.endDate).slice(0, 10) : "",
    status: entry.status === "draft" ? "draft" : "published",
    version: Math.max(1, Number(entry.version) || 1),
    note: String(entry.note || ""),
    source: String(entry.source || ""),
    createdAt: String(entry.createdAt || ""),
    createdByAccountId: String(entry.createdByAccountId || ""),
    createdByName: String(entry.createdByName || ""),
    updatedAt: String(entry.updatedAt || ""),
    updatedByAccountId: String(entry.updatedByAccountId || ""),
    updatedByName: String(entry.updatedByName || ""),
  };
}

// 存量“学期”自动投影为四个学部的教学期校历记录。原 termId 和所有历史数据
// 一律不动；这一步只补充新的校历集合，保证旧库升级后仍可照常排课、查工资。
export function ensureAcademicCalendarPeriods(db) {
  ensureTerms(db);
  let changed = false;
  if (!Array.isArray(db.academicCalendarPeriods)) {
    db.academicCalendarPeriods = [];
    changed = true;
  }

  const normalized = db.academicCalendarPeriods
    .map((entry) => normalizeCalendarEntry(entry))
    .filter((entry) => entry.id && CALENDAR_STAGE_IDS.includes(entry.stageId));
  if (JSON.stringify(normalized) !== JSON.stringify(db.academicCalendarPeriods)) {
    db.academicCalendarPeriods = normalized;
    changed = true;
  }

  (db.terms || []).forEach((term) => {
    CALENDAR_STAGE_IDS.forEach((stageId) => {
      const exists = db.academicCalendarPeriods.some(
        (entry) => entry.type === "teaching" && entry.termId === term.id && entry.stageId === stageId,
      );
      if (exists) return;
      db.academicCalendarPeriods.push(defaultCalendarEntry(term, stageId));
      changed = true;
    });
  });
  return changed;
}

export function publicCalendarEntry(entry = {}) {
  return {
    id: entry.id,
    type: entry.type,
    phase: entry.phase || "",
    label: calendarEntryLabel(entry),
    stageId: entry.stageId,
    schoolYear: entry.schoolYear,
    termId: entry.termId || "",
    name: entry.name || "",
    startDate: entry.startDate,
    endDate: entry.endDate,
    status: entry.status || "published",
    version: Number(entry.version) || 1,
    note: entry.note || "",
    source: entry.source || "",
    updatedAt: entry.updatedAt || "",
    updatedByName: entry.updatedByName || "",
  };
}

export function termCalendarRangeForStage(db, termOrId, stageId = "") {
  const term =
    typeof termOrId === "object" && termOrId
      ? termOrId
      : (db?.terms || []).find((item) => item.id === String(termOrId || ""));
  if (!term) return { startDate: "", endDate: "", source: "missing" };
  ensureAcademicCalendarPeriods(db);
  const scopedStageId = calendarStageId(stageId);
  const entry = (db.academicCalendarPeriods || []).find(
    (item) =>
      item.type === "teaching" &&
      item.termId === term.id &&
      item.stageId === scopedStageId &&
      item.status === "published" &&
      item.startDate &&
      item.endDate,
  );
  return {
    startDate: entry?.startDate || term.startDate || "",
    endDate: entry?.endDate || term.endDate || "",
    source: entry ? "calendar" : "term",
    entryId: entry?.id || "",
  };
}

export function academicCalendarYears(db) {
  ensureAcademicCalendarPeriods(db);
  const years = new Set();
  (db.terms || []).forEach((term) => term.schoolYear && years.add(String(term.schoolYear)));
  (db.academicCalendarPeriods || []).forEach((entry) => entry.schoolYear && years.add(String(entry.schoolYear)));
  return [...years].sort((a, b) => b.localeCompare(a, "zh-CN", { numeric: true }));
}

export function currentTerm(db, termId = "") {
  ensureTerms(db);
  const requestedId = String(termId || "").trim();
  return (
    db.terms.find((term) => requestedId && term.id === requestedId) ||
    db.terms.find((term) => term.current) ||
    db.terms[0] ||
    DEFAULT_TERMS[0]
  );
}

export function termForDate(db, dateKey = "", stageId = "") {
  ensureTerms(db);
  const date = String(dateKey || "").slice(0, 10);
  return (
    db.terms.find((term) => {
      const range = stageId ? termCalendarRangeForStage(db, term, stageId) : term;
      return date && range.startDate <= date && date <= range.endDate;
    }) ||
    currentTerm(db)
  );
}

// 月份归属学期：取与该月重叠天数最多的学期（并列时取开始日期更晚的）。
// 不能只看月份第一天——学期常在月中开始（如 6 月 15 日开学），
// 否则“当前学期”切换后，历史月份的工作量和工资会被错误归到新学期。
export function termForMonth(db, month = "", stageId = "") {
  ensureTerms(db);
  const monthKey = String(month || "").slice(0, 7) || "2026-06";
  const [year, monthNumber] = monthKey.split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(monthNumber)) return currentTerm(db);
  const monthStartMs = Date.UTC(year, monthNumber - 1, 1);
  const monthEndMs = Date.UTC(year, monthNumber, 0);
  const overlapping = db.terms
    .map((term) => {
      const range = stageId ? termCalendarRangeForStage(db, term, stageId) : term;
      const termStartMs = Date.parse(`${range.startDate}T00:00:00Z`);
      const termEndMs = Date.parse(`${range.endDate}T00:00:00Z`);
      const overlapMs = Math.min(monthEndMs, termEndMs) - Math.max(monthStartMs, termStartMs);
      return { term, overlapMs };
    })
    .filter((item) => Number.isFinite(item.overlapMs) && item.overlapMs >= 0)
    .sort(
      (a, b) => b.overlapMs - a.overlapMs || String(b.term.startDate).localeCompare(String(a.term.startDate)),
    );
  return overlapping[0]?.term || currentTerm(db);
}

// 月度工资按校历时间段的标签结算。一个自然月可能跨教学期和假期，因而逐日统计
// 假期覆盖天数；未被校历覆盖的日期按正式学期处理，保证历史数据与尚未录入的后续
// 时间段不会被误判成假期。
export function calendarSettlementForMonth(db, month = "", stageId = "") {
  ensureAcademicCalendarPeriods(db);
  const monthKey = String(month || "").slice(0, 7);
  const [year, monthNumber] = monthKey.split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    return { month: monthKey, totalDays: 0, teachingDays: 0, holidayDays: 0, holidayEntries: [] };
  }
  const normalizedStageId = calendarStageId(stageId);
  const totalDays = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const startDate = `${monthKey}-01`;
  const endDate = `${monthKey}-${String(totalDays).padStart(2, "0")}`;
  const periods = (db.academicCalendarPeriods || [])
    .filter((entry) => entry.stageId === normalizedStageId && entry.status === "published")
    .filter((entry) => entry.startDate <= endDate && entry.endDate >= startDate);
  const holidayEntries = periods
    .filter((entry) => entry.type === "winter_break" || entry.type === "summer_break")
    .map((entry) => {
      const overlapStart = entry.startDate > startDate ? entry.startDate : startDate;
      const overlapEnd = entry.endDate < endDate ? entry.endDate : endDate;
      const startMs = Date.parse(`${overlapStart}T00:00:00Z`);
      const endMs = Date.parse(`${overlapEnd}T00:00:00Z`);
      const days = Number.isFinite(startMs) && Number.isFinite(endMs) ? Math.floor((endMs - startMs) / 86400000) + 1 : 0;
      return {
        id: entry.id,
        name: calendarEntryLabel(entry),
        type: entry.type,
        startDate: overlapStart,
        endDate: overlapEnd,
        days: Math.max(0, days),
      };
    });
  const holidayDays = Math.min(totalDays, holidayEntries.reduce((sum, entry) => sum + entry.days, 0));
  return {
    month: monthKey,
    totalDays,
    teachingDays: totalDays - holidayDays,
    holidayDays,
    holidayEntries,
  };
}

// 学期首个教学周的周一：自然周的周一有可能早于开学日（例如 8/1 是周六，
// 自然周周一会退到 7/27），那样排出来的课次会落在学期之外，导致月度结算
// 归属错乱。此时顺延到学期内的第一个完整周。
export function firstTeachingWeekStart(term) {
  const startDate = term?.startDate || DEFAULT_TERMS[0].startDate;
  const naturalStart = startOfNaturalWeek(startDate);
  if (naturalStart >= String(startDate)) return naturalStart;
  const nextWeek = addDays(naturalStart, 7);
  const endDate = term?.endDate ? String(term.endDate) : "";
  // 学期本身不足一周时退回自然周，避免算出超出学期结束日的周起点。
  if (endDate && nextWeek > endDate) return naturalStart;
  return nextWeek;
}

export function weekStartForDivision(term, division, db = null) {
  const divisionWeekStarts = term?.divisionWeekStarts || {};
  const range = db ? termCalendarRangeForStage(db, term, division?.stageId || division?.id) : term;
  const configured = divisionWeekStarts[division?.id] || divisionWeekStarts[division?.stageId] || "";
  // 旧库的 divisionWeekStarts 是按全校日期保存的。学部主任后来调整本学部
  // 开学日时，不能继续把旧周次带进新校历；超出有效教学期就回落到校历首周。
  if (configured && configured >= String(range.startDate || "") && configured <= String(range.endDate || "")) {
    return configured;
  }
  return firstTeachingWeekStart(range);
}

export function publicTerm(term) {
  return {
    id: term.id,
    name: term.name,
    schoolYear: term.schoolYear,
    semester: term.semester,
    startDate: term.startDate,
    endDate: term.endDate,
    settlementMonth: term.settlementMonth || "",
    status: term.status,
    current: Boolean(term.current),
    copiedFromTermId: term.copiedFromTermId || "",
    copiedConfigSummary: term.copiedConfigSummary || null,
    createdAt: term.createdAt || "",
    archivedAt: term.archivedAt || "",
    divisionWeekStarts: { ...(term.divisionWeekStarts || {}) },
  };
}

export function listTerms(db) {
  ensureTerms(db);
  return db.terms.map(publicTerm);
}

export function ensureEditableTerm(term, actionName = "修改") {
  if (term?.status === "archived") {
    const error = new Error(`该学期已归档，不能${actionName}`);
    error.statusCode = 409;
    error.details = { termId: term.id, termName: term.name, status: term.status };
    throw error;
  }
}

export function naturalWeekStart(dateKey = DEFAULT_TERMS[0].startDate) {
  return startOfNaturalWeek(dateKey);
}

// 入参兼容字符串（开学日）与学期对象；始终从学期内的首个教学周起算。
export function nextDivisionWeekStarts(termOrStartDate = DEFAULT_TERMS[0].startDate) {
  const term =
    termOrStartDate && typeof termOrStartDate === "object"
      ? termOrStartDate
      : { startDate: termOrStartDate };
  const elementary = firstTeachingWeekStart(term);
  return {
    elementary,
    middle: addDays(elementary, 7),
    high: addDays(elementary, 14),
  };
}
