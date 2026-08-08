export const DEFAULT_TERM_ID = "TERM-2026-PHASE1";

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

export function termForDate(db, dateKey = "") {
  ensureTerms(db);
  const date = String(dateKey || "").slice(0, 10);
  return (
    db.terms.find((term) => date && term.startDate <= date && date <= term.endDate) ||
    currentTerm(db)
  );
}

// 月份归属学期：取与该月重叠天数最多的学期（并列时取开始日期更晚的）。
// 不能只看月份第一天——学期常在月中开始（如 6 月 15 日开学），
// 否则“当前学期”切换后，历史月份的工作量和工资会被错误归到新学期。
export function termForMonth(db, month = "") {
  ensureTerms(db);
  const monthKey = String(month || "").slice(0, 7) || "2026-06";
  const [year, monthNumber] = monthKey.split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(monthNumber)) return currentTerm(db);
  const monthStartMs = Date.UTC(year, monthNumber - 1, 1);
  const monthEndMs = Date.UTC(year, monthNumber, 0);
  const overlapping = db.terms
    .map((term) => {
      const termStartMs = Date.parse(`${term.startDate}T00:00:00Z`);
      const termEndMs = Date.parse(`${term.endDate}T00:00:00Z`);
      const overlapMs = Math.min(monthEndMs, termEndMs) - Math.max(monthStartMs, termStartMs);
      return { term, overlapMs };
    })
    .filter((item) => Number.isFinite(item.overlapMs) && item.overlapMs >= 0)
    .sort(
      (a, b) => b.overlapMs - a.overlapMs || String(b.term.startDate).localeCompare(String(a.term.startDate)),
    );
  return overlapping[0]?.term || currentTerm(db);
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

export function weekStartForDivision(term, division) {
  const divisionWeekStarts = term?.divisionWeekStarts || {};
  return (
    divisionWeekStarts[division?.id] ||
    divisionWeekStarts[division?.stageId] ||
    firstTeachingWeekStart(term)
  );
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
