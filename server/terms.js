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

function normalizeTerm(term = {}, fallback = DEFAULT_TERMS[0]) {
  return {
    id: String(term.id || fallback.id || DEFAULT_TERM_ID),
    name: String(term.name || fallback.name || "当前学期"),
    schoolYear: String(term.schoolYear || fallback.schoolYear || ""),
    semester: String(term.semester || fallback.semester || ""),
    startDate: String(term.startDate || fallback.startDate || "2026-06-15"),
    endDate: String(term.endDate || fallback.endDate || "2026-07-31"),
    settlementMonth: String(term.settlementMonth || fallback.settlementMonth || ""),
    status: String(term.status || fallback.status || "active"),
    current: Boolean(term.current),
    divisionWeekStarts:
      term.divisionWeekStarts && typeof term.divisionWeekStarts === "object" && !Array.isArray(term.divisionWeekStarts)
        ? { ...term.divisionWeekStarts }
        : { ...(fallback.divisionWeekStarts || {}) },
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

export function termForMonth(db, month = "") {
  const date = `${String(month || "").slice(0, 7) || "2026-06"}-01`;
  return termForDate(db, date);
}

export function weekStartForDivision(term, division) {
  const divisionWeekStarts = term?.divisionWeekStarts || {};
  return (
    divisionWeekStarts[division?.id] ||
    divisionWeekStarts[division?.stageId] ||
    startOfNaturalWeek(term?.startDate || DEFAULT_TERMS[0].startDate)
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

export function nextDivisionWeekStarts(startDate = DEFAULT_TERMS[0].startDate) {
  const elementary = startOfNaturalWeek(startDate);
  return {
    elementary,
    middle: addDays(elementary, 7),
    high: addDays(elementary, 14),
  };
}
