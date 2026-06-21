import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { currentTerm, ensureEditableTerm, weekStartForDivision } from "./terms.js";

const ORTOOLS_SOLVER_PATH = fileURLToPath(new URL("./solver/ortools_scheduler.py", import.meta.url));

const PERIODS = [
  { period: 1, time: "08:00-08:40" },
  { period: 2, time: "08:50-09:30" },
  { period: 3, time: "10:10-10:50" },
  { period: 4, time: "11:00-11:40" },
  { period: 5, time: "14:20-15:00" },
  { period: 6, time: "15:20-16:00" },
];

const DAY_LABELS = ["周一", "周二", "周三", "周四", "周五"];
const DEFAULT_LESSON_DURATION_MINUTES = 40;
const DAY_PARTS = {
  any: "不限",
  morning: "上午",
  afternoon: "下午",
};

const ROOM_TYPES = {
  homeroom: "普通教室",
  lab: "实验室",
  computer: "机房",
  playground: "操场",
  art: "美术室",
  music: "音乐室",
};

const SPECIAL_ROOM_RESOURCE_TYPES = [
  { type: "lab", code: "LAB", name: "实验室", defaultCount: 2, max: 20 },
  { type: "computer", code: "COMPUTER", name: "机房", defaultCount: 1, max: 20 },
  { type: "playground", code: "PLAYGROUND", name: "操场", defaultCount: 1, max: 10 },
  { type: "art", code: "ART", name: "美术室", defaultCount: 1, max: 20 },
  { type: "music", code: "MUSIC", name: "音乐室", defaultCount: 1, max: 20 },
];

const SUBJECT_DEFAULT_ROOM_TYPES = {
  pe: "playground",
  physics: "lab",
  chemistry: "lab",
};

const DIVISIONS = [
  {
    id: "elementary",
    stageId: "primary",
    name: "小学部",
    shortName: "小学",
    weekStart: "2026-06-15",
    grades: [
      { id: "elementary-g1", name: "一年级", grade: 1 },
      { id: "elementary-g2", name: "二年级", grade: 2 },
      { id: "elementary-g3", name: "三年级", grade: 3 },
      { id: "elementary-g4", name: "四年级", grade: 4 },
      { id: "elementary-g5", name: "五年级", grade: 5 },
      { id: "elementary-g6", name: "六年级", grade: 6 },
    ],
    subjectRules: [
      { subjectId: "chinese", weeklyLessons: 5 },
      { subjectId: "math", weeklyLessons: 5 },
      { subjectId: "english", weeklyLessons: 4 },
      { subjectId: "pe", weeklyLessons: 2, maxPerClassPerDay: 1, allowConsecutive: false, preferredDayPart: "afternoon" },
      { subjectId: "physics", weeklyLessons: 2 },
      { subjectId: "chemistry", weeklyLessons: 2 },
    ],
  },
  {
    id: "middle",
    stageId: "middle",
    name: "初中部",
    shortName: "初中",
    weekStart: "2026-06-22",
    grades: [
      { id: "middle-g1", name: "初一", grade: 7 },
      { id: "middle-g2", name: "初二", grade: 8 },
      { id: "middle-g3", name: "初三", grade: 9 },
    ],
    subjectRules: [
      { subjectId: "chinese", weeklyLessons: 5 },
      { subjectId: "math", weeklyLessons: 5 },
      { subjectId: "english", weeklyLessons: 4 },
      { subjectId: "physics", weeklyLessons: 3 },
      { subjectId: "chemistry", weeklyLessons: 2 },
      { subjectId: "pe", weeklyLessons: 2, maxPerClassPerDay: 1, allowConsecutive: false, preferredDayPart: "afternoon" },
    ],
  },
  {
    id: "high",
    stageId: "high",
    name: "高中部",
    shortName: "高中",
    weekStart: "2026-06-29",
    grades: [
      { id: "high-g1", name: "高一", grade: 10 },
      { id: "high-g2", name: "高二", grade: 11 },
      { id: "high-g3", name: "高三", grade: 12 },
    ],
    subjectRules: [
      { subjectId: "chinese", weeklyLessons: 5 },
      { subjectId: "math", weeklyLessons: 5 },
      { subjectId: "english", weeklyLessons: 4 },
      { subjectId: "physics", weeklyLessons: 3 },
      { subjectId: "chemistry", weeklyLessons: 3 },
      { subjectId: "pe", weeklyLessons: 2, maxPerClassPerDay: 1, allowConsecutive: false, preferredDayPart: "afternoon" },
    ],
  },
];

function pad(number, length = 2) {
  return String(number).padStart(length, "0");
}

function addDays(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(dateKey) {
  const [, month, day] = dateKey.split("-");
  return `${Number(month)}月${Number(day)}日`;
}

function formatDateTimeMinute(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureSchedulingStore(db) {
  if (!Array.isArray(db.scheduleDrafts)) db.scheduleDrafts = [];
  if (!Array.isArray(db.scheduleVersions)) db.scheduleVersions = [];
  if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
  if (!Array.isArray(db.notifications)) db.notifications = [];
  if (!Array.isArray(db.gradeCourseRules)) db.gradeCourseRules = [];
  if (!Array.isArray(db.scheduleConstraints)) db.scheduleConstraints = [];
  if (!Array.isArray(db.teacherScheduleRules)) db.teacherScheduleRules = [];
  if (!Array.isArray(db.scheduleChangeRequests)) db.scheduleChangeRequests = [];
  if (!Array.isArray(db.roomResourceOverrides)) db.roomResourceOverrides = [];
}

function pushScheduleNotification(db, options = {}, actorAccount = null) {
  const now = new Date().toISOString();
  db.notifications.push({
    id: `NTF-${Date.now()}-${db.notifications.length + 1}`,
    audience: options.audience || "teacher",
    teacherIds: Array.from(new Set(options.teacherIds || [])),
    accountIds: [],
    title: options.title,
    text: options.text,
    source: options.source || "教务处",
    level: options.level || "info",
    createdAt: now,
    createdByAccountId: actorAccount?.id || "SYSTEM",
    createdByName: actorAccount?.name || "系统",
    readByAccountIds: [],
    readReceipts: {},
  });
}

function divisionById(divisionId = "elementary") {
  return DIVISIONS.find((division) => division.id === divisionId) || DIVISIONS[0];
}

function gradeById(division, gradeId = "") {
  return division.grades.find((grade) => grade.id === gradeId) || division.grades[0];
}

function divisionByStageId(stageId = "") {
  return DIVISIONS.find((division) => division.stageId === stageId) || null;
}

function schedulingScopeFromStageGrade(db, stageId, gradeValue) {
  const division = divisionByStageId(stageId);
  const gradeNumber = Number(gradeValue);
  const grade = division?.grades.find((item) => item.grade === gradeNumber);
  const stage = db.stages?.find((item) => item.id === stageId);
  if (!division || !stage || !grade) {
    const error = new Error("学部或年级无效");
    error.statusCode = 400;
    throw error;
  }
  return { division, grade };
}

function subjectById(db, subjectId) {
  return db.subjects.find((subject) => subject.id === subjectId);
}

function clearScheduleDraftForScope(db, division, grade, term = currentTerm(db)) {
  db.scheduleDrafts = (db.scheduleDrafts || []).filter(
    (draft) => !(draft.termId === term.id && draft.divisionId === division.id && draft.gradeId === grade.id),
  );
}

function termScopedRows(rows = [], term, predicate = () => true) {
  const scopedRows = rows.filter((row) => row.termId === term.id && predicate(row));
  if (scopedRows.length) return scopedRows;
  return rows.filter((row) => !row.termId && predicate(row));
}

function termMergedRows(rows = [], term, predicate = () => true, keyFn = (row) => row.id) {
  const merged = new Map();
  rows
    .filter((row) => !row.termId && predicate(row))
    .forEach((row) => {
      merged.set(keyFn(row), row);
    });
  rows
    .filter((row) => row.termId === term.id && predicate(row))
    .forEach((row) => {
      merged.set(keyFn(row), row);
    });
  return Array.from(merged.values());
}

function itemMatchesTerm(item, term) {
  return !item.termId || item.termId === term.id;
}

function itemBelongsToTerm(item, term) {
  return item.termId === term.id;
}

function scopedConfigId(prefix, termId, ...parts) {
  const suffix = [termId, ...parts]
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
  return `${prefix}-${suffix}`;
}

function findScopedRoom(db, roomId, term) {
  return (
    (db.rooms || []).find((room) => room.id === roomId && room.termId === term.id) ||
    (db.rooms || []).find((room) => room.id === roomId && !room.termId) ||
    (db.rooms || []).find((room) => room.id === roomId)
  );
}

function activeRoomResourceOverride(db, term, division) {
  return (
    (db.roomResourceOverrides || []).find(
      (override) => override.termId === term.id && override.stageId === division.stageId && override.active !== false,
    ) || null
  );
}

function schedulingRooms(db, division, classes, term) {
  const roomBelongsToDivision = (room) => room.active !== false && room.stageId === division.stageId;
  const override = activeRoomResourceOverride(db, term, division);
  const termRows = (db.rooms || []).filter((room) => room.termId === term.id && roomBelongsToDivision(room));
  const fallbackRows = (db.rooms || []).filter((room) => !room.termId && roomBelongsToDivision(room));
  const rowsById = new Map();
  fallbackRows.forEach((room) => {
    const roomType = normalizeRoomType(room.roomType || room.type, "homeroom");
    if (override && roomType !== "homeroom") return;
    rowsById.set(room.id, room);
  });
  termRows.forEach((room) => rowsById.set(room.id, room));
  return Array.from(rowsById.values()).filter(
    (room) =>
      normalizeRoomType(room.roomType || room.type, "homeroom") !== "homeroom" ||
      classes.some((schoolClass) => schoolClass.roomId === room.id),
  );
}

function teacherIdsForAssignment(assignment, classId = "") {
  if (!assignment) return [];
  if (classId && Array.isArray(assignment.classTeacherIds?.[classId]) && assignment.classTeacherIds[classId].length) {
    return Array.from(new Set(assignment.classTeacherIds[classId].map(String)));
  }
  const classTeacherIds =
    assignment.classTeacherIds && typeof assignment.classTeacherIds === "object"
      ? Object.values(assignment.classTeacherIds).flat()
      : [];
  return Array.from(new Set([...(assignment.teacherIds || []), ...classTeacherIds].map(String).filter(Boolean)));
}

function assignmentTeachers(db, division, grade, subjectId, classId = "", term = currentTerm(db)) {
  const assignment = termMergedRows(
    db.teacherAssignments || [],
    term,
    (item) => item.stageId === division.stageId && item.grade === grade.grade && item.subjectId === subjectId,
    (item) => `${item.stageId}:${item.grade}:${item.subjectId}`,
  ).find(
    (item) => item.stageId === division.stageId && item.grade === grade.grade && item.subjectId === subjectId,
  );
  const teacherIds = teacherIdsForAssignment(assignment, classId);
  if (!teacherIds.length) return [];
  return teacherIds
    .map((teacherId) => db.teachers.find((teacher) => teacher.id === teacherId))
    .filter((teacher) => teacher?.status === "active");
}

function publicSchedulingTeacher(teacher) {
  return {
    id: teacher.id,
    employeeNo: teacher.employeeNo,
    name: teacher.name,
    subject: teacher.primarySubjectName,
    subjectId: teacher.primarySubjectId,
    department: teacher.department,
    stageId: teacher.stageId,
    title: teacher.title,
    phone: teacher.phone,
  };
}

function activeSubjectTeachers(db, stageId, subjectId) {
  return db.teachers
    .filter(
      (teacher) =>
        teacher.status === "active" &&
        teacher.stageId === stageId &&
        teacher.primarySubjectId === subjectId,
    )
    .sort((a, b) => a.employeeNo.localeCompare(b.employeeNo, "zh-CN"));
}

function schedulingTeacherRows(db, subjects) {
  const teacherIds = new Set(
    subjects.flatMap((subject) => [
      ...subject.teacherIds,
      ...(subject.availableTeachers || []).map((teacher) => teacher.id),
    ]),
  );
  return db.teachers
    .filter((teacher) => teacherIds.has(teacher.id))
    .map(publicSchedulingTeacher);
}

function defaultCourseRule(division, subjectId) {
  return division.subjectRules.find((rule) => rule.subjectId === subjectId) || null;
}

function normalizeWeeklyLessons(value, fallback = 1) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, 0), 12);
}

function normalizeDurationMinutes(value, fallback = DEFAULT_LESSON_DURATION_MINUTES) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, 20), 120);
}

function normalizeMaxPerClassPerDay(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, 0), PERIODS.length);
}

function normalizeAllowConsecutive(value, fallback = true) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value) === "true" || String(value) === "1";
}

function normalizePreferredDayPart(value, fallback = "any") {
  const text = String(value || fallback || "any").trim();
  return Object.hasOwn(DAY_PARTS, text) ? text : "any";
}

function normalizeRoomType(value, fallback = "homeroom") {
  const text = String(value || fallback || "homeroom").trim();
  return Object.hasOwn(ROOM_TYPES, text) ? text : "homeroom";
}

function normalizeSubjectForbiddenPeriods(value) {
  return normalizedConstraintNumbers(value, 1, PERIODS.length);
}

function courseRuleConstraintFields(rule = {}, fallbackRule = {}) {
  return {
    maxPerClassPerDay: normalizeMaxPerClassPerDay(
      rule.maxPerClassPerDay ?? fallbackRule.maxPerClassPerDay,
      fallbackRule.maxPerClassPerDay || 0,
    ),
    allowConsecutive: normalizeAllowConsecutive(
      rule.allowConsecutive ?? fallbackRule.allowConsecutive,
      fallbackRule.allowConsecutive !== undefined ? Boolean(fallbackRule.allowConsecutive) : true,
    ),
    forbiddenPeriods: normalizeSubjectForbiddenPeriods(rule.forbiddenPeriods ?? fallbackRule.forbiddenPeriods),
    preferredDayPart: normalizePreferredDayPart(
      rule.preferredDayPart ?? fallbackRule.preferredDayPart,
      fallbackRule.preferredDayPart || "any",
    ),
    requiredRoomType: normalizeRoomType(
      rule.requiredRoomType ?? fallbackRule.requiredRoomType,
      fallbackRule.requiredRoomType || SUBJECT_DEFAULT_ROOM_TYPES[rule.subjectId || fallbackRule.subjectId] || "homeroom",
    ),
  };
}

function schedulingCourseRules(db, division, grade, term = currentTerm(db)) {
  const savedRules = new Map(
    termMergedRows(
      db.gradeCourseRules || [],
      term,
      (rule) => rule.stageId === division.stageId && Number(rule.grade) === grade.grade,
      (rule) => rule.subjectId,
    )
      .map((rule) => [rule.subjectId, rule]),
  );

  return db.subjects.map((subject) => {
    const defaultRule = defaultCourseRule(division, subject.id);
    const savedRule = savedRules.get(subject.id);
    const enabled = savedRule ? Boolean(savedRule.enabled) : Boolean(defaultRule);
    const weeklyLessons = normalizeWeeklyLessons(
      savedRule?.weeklyLessons ?? defaultRule?.weeklyLessons,
      defaultRule?.weeklyLessons || 1,
    );
    const durationMinutes = normalizeDurationMinutes(
      savedRule?.durationMinutes ?? defaultRule?.durationMinutes,
      DEFAULT_LESSON_DURATION_MINUTES,
    );
    const constraintFields = courseRuleConstraintFields(savedRule || {}, defaultRule || {});
    return {
      id: `CR-${division.stageId}-${grade.grade}-${subject.id}`,
      termId: savedRule?.termId || term.id,
      termName: savedRule?.termName || term.name,
      stageId: division.stageId,
      grade: grade.grade,
      subjectId: subject.id,
      subjectName: subject.name,
      enabled,
      weeklyLessons,
      durationMinutes,
      ...constraintFields,
    };
  });
}

function publicScheduleConstraints(db, division, grade, term = currentTerm(db)) {
  return termScopedRows(
    db.scheduleConstraints || [],
    term,
    (constraint) => constraint.stageId === division.stageId && Number(constraint.grade) === grade.grade,
  )
    .filter((constraint) => constraint.active !== false)
    .map((constraint) => {
      const subject = subjectById(db, constraint.subjectId);
      return {
        ...constraint,
        subjectName: subject?.name || constraint.subjectId,
        dayIndexes: Array.isArray(constraint.dayIndexes) ? constraint.dayIndexes : [],
        periods: Array.isArray(constraint.periods) ? constraint.periods : [],
      };
    });
}

function publicTeacherScheduleRules(db, division, subjects, term = currentTerm(db)) {
  const teacherIds = new Set(subjects.flatMap((subject) => subject.teacherIds || []));
  return termMergedRows(
    db.teacherScheduleRules || [],
    term,
    (rule) => rule.stageId === division.stageId && teacherIds.has(rule.teacherId),
    (rule) => `${rule.stageId}:${rule.teacherId}`,
  )
    .map((rule) => {
      const teacher = teacherById(db, rule.teacherId);
      return {
        ...rule,
        teacherName: teacher?.name || rule.teacherName || rule.teacherId,
        unavailableSlots: Array.isArray(rule.unavailableSlots)
          ? rule.unavailableSlots.map((slot) => ({
              dayIndex: Number(slot.dayIndex),
              periods: Array.isArray(slot.periods) ? slot.periods.map(Number) : [],
              reason: String(slot.reason || "").trim(),
            }))
          : [],
        avoidPeriods: Array.isArray(rule.avoidPeriods) ? rule.avoidPeriods.map(Number) : [],
        preferPeriods: Array.isArray(rule.preferPeriods) ? rule.preferPeriods.map(Number) : [],
        maxDailyLessons: Number(rule.maxDailyLessons || 4),
        maxConsecutiveLessons: Number(rule.maxConsecutiveLessons || 3),
      };
    })
    .sort((a, b) => a.teacherName.localeCompare(b.teacherName, "zh-CN"));
}

function publicScheduleChangeRequests(db, division, grade, term) {
  return (db.scheduleChangeRequests || [])
    .filter((request) => request.termId === term.id && request.divisionId === division.id && request.gradeId === grade.id)
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 20);
}

function schedulingSubjects(db, division, grade, term = currentTerm(db)) {
  return schedulingCourseRules(db, division, grade, term)
    .filter((rule) => rule.enabled && rule.weeklyLessons > 0)
    .map((rule) => {
      const subject = subjectById(db, rule.subjectId);
      const assignment = termMergedRows(
        db.teacherAssignments || [],
        term,
        (item) =>
          item.stageId === division.stageId &&
          Number(item.grade) === Number(grade.grade) &&
          item.subjectId === rule.subjectId,
        (item) => `${item.stageId}:${item.grade}:${item.subjectId}`,
      ).find(
        (item) =>
          item.stageId === division.stageId &&
          Number(item.grade) === Number(grade.grade) &&
          item.subjectId === rule.subjectId,
      );
      const configuredTeachers = assignmentTeachers(db, division, grade, rule.subjectId, "", term);
      const availableTeachers = activeSubjectTeachers(db, division.stageId, rule.subjectId);
      const classTeacherIds = {};
      termScopedRows(
        db.classes || [],
        term,
        (schoolClass) =>
          schoolClass.stageId === division.stageId &&
          Number(schoolClass.grade) === Number(grade.grade) &&
          schoolClass.active,
      )
        .forEach((schoolClass, index) => {
          const configuredIds = teacherIdsForAssignment(assignment, schoolClass.id);
          classTeacherIds[schoolClass.id] = configuredIds;
        });
      const teacherIds = Array.from(new Set(Object.values(classTeacherIds).flat()));
      return subject
        ? {
            id: subject.id,
            name: subject.name,
            weeklyLessons: rule.weeklyLessons,
            durationMinutes: rule.durationMinutes,
            maxPerClassPerDay: rule.maxPerClassPerDay,
            allowConsecutive: rule.allowConsecutive,
            forbiddenPeriods: rule.forbiddenPeriods || [],
            preferredDayPart: rule.preferredDayPart,
            requiredRoomType: normalizeRoomType(rule.requiredRoomType, "homeroom"),
            requiredRoomTypeName: ROOM_TYPES[normalizeRoomType(rule.requiredRoomType, "homeroom")],
            teacherIds,
            classTeacherIds,
            availableTeachers: availableTeachers.map(publicSchedulingTeacher),
          }
        : null;
    })
    .filter(Boolean);
}

function schedulingClasses(db, division, grade, term = currentTerm(db)) {
  return termScopedRows(
    db.classes || [],
    term,
    (schoolClass) => schoolClass.stageId === division.stageId && schoolClass.grade === grade.grade && schoolClass.active,
  )
    .map((schoolClass) => {
      const room = findScopedRoom(db, schoolClass.roomId, term);
      return {
        id: schoolClass.id,
        name: schoolClass.name,
        classType: schoolClass.classType || (String(schoolClass.name || "").includes("实验") ? "experimental" : "regular"),
        displayOrder: Number(schoolClass.displayOrder || 0),
        room: room?.name || schoolClass.roomId,
        roomId: schoolClass.roomId,
        roomType: normalizeRoomType(room?.roomType || room?.type, "homeroom"),
      };
    });
}

function gradeClassStructure(classes = []) {
  const activeClasses = classes.filter((schoolClass) => schoolClass.active !== false);
  const regularCount = activeClasses.filter(
    (schoolClass) => (schoolClass.classType || (String(schoolClass.name || "").includes("实验") ? "experimental" : "regular")) !== "experimental",
  ).length;
  const experimentalCount = activeClasses.filter(
    (schoolClass) => (schoolClass.classType || (String(schoolClass.name || "").includes("实验") ? "experimental" : "regular")) === "experimental",
  ).length;
  return {
    regularCount,
    experimentalCount,
    totalCount: activeClasses.length,
  };
}

function specialRoomTypeSet() {
  return new Set(SPECIAL_ROOM_RESOURCE_TYPES.map((resource) => resource.type));
}

function specialRoomCounts(rooms = []) {
  const counts = Object.fromEntries(SPECIAL_ROOM_RESOURCE_TYPES.map((resource) => [resource.type, 0]));
  const types = specialRoomTypeSet();
  rooms.forEach((room) => {
    if (room.active === false) return;
    const roomType = normalizeRoomType(room.roomType || room.type, "homeroom");
    if (!types.has(roomType)) return;
    counts[roomType] = (counts[roomType] || 0) + 1;
  });
  return counts;
}

function normalizeRoomResourceCounts(roomCounts = {}, fallback = {}) {
  return Object.fromEntries(
    SPECIAL_ROOM_RESOURCE_TYPES.map((resource) => [
      resource.type,
      normalizeClassCount(roomCounts[resource.type], Number(fallback[resource.type] ?? resource.defaultCount), {
        min: 0,
        max: resource.max,
      }),
    ]),
  );
}

function normalizeRoomName(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function defaultSpecialRoomName(division, resource, index, count) {
  return `${division.name}${resource.name}${count > 1 ? String(index).padStart(2, "0") : ""}`;
}

function roomCatalogFromRows(rooms = []) {
  const types = specialRoomTypeSet();
  return rooms
    .filter((room) => room.active !== false && types.has(normalizeRoomType(room.roomType || room.type, "homeroom")))
    .sort((a, b) => {
      const typeOrder =
        SPECIAL_ROOM_RESOURCE_TYPES.findIndex((resource) => resource.type === normalizeRoomType(a.roomType || a.type, "homeroom")) -
        SPECIAL_ROOM_RESOURCE_TYPES.findIndex((resource) => resource.type === normalizeRoomType(b.roomType || b.type, "homeroom"));
      if (typeOrder) return typeOrder;
      return String(a.id || a.name || "").localeCompare(String(b.id || b.name || ""));
    })
    .map((room) => ({
      id: room.id,
      name: normalizeRoomName(room.name),
      roomType: normalizeRoomType(room.roomType || room.type, "homeroom"),
    }));
}

function normalizeRoomResourceCatalog(roomCatalog = []) {
  if (!Array.isArray(roomCatalog)) return [];
  const types = specialRoomTypeSet();
  return roomCatalog
    .map((room) => ({
      id: String(room.id || "").trim(),
      name: normalizeRoomName(room.name),
      roomType: normalizeRoomType(room.roomType || room.type, "homeroom"),
    }))
    .filter((room) => types.has(room.roomType));
}

function buildSpecialRoomRows(division, term, roomCounts, roomCatalog = []) {
  const rows = [];
  const catalogByType = new Map();
  normalizeRoomResourceCatalog(roomCatalog).forEach((room) => {
    if (!catalogByType.has(room.roomType)) catalogByType.set(room.roomType, []);
    catalogByType.get(room.roomType).push(room);
  });
  SPECIAL_ROOM_RESOURCE_TYPES.forEach((resource) => {
    const count = normalizeClassCount(roomCounts[resource.type], resource.defaultCount, { min: 0, max: resource.max });
    for (let index = 1; index <= count; index += 1) {
      const roomId = `ROOM-${division.stageId}-${resource.code}-${String(index).padStart(2, "0")}`;
      const catalogRoom = (catalogByType.get(resource.type) || [])[index - 1] || null;
      rows.push({
        id: roomId,
        termId: term.id,
        termName: term.name,
        stageId: division.stageId,
        name: catalogRoom?.name || defaultSpecialRoomName(division, resource, index, count),
        roomType: resource.type,
        capacity: 1,
        qrCode: `ROOM:${roomId}`,
        displayKey: `screen-${roomId.toLowerCase()}`,
        active: true,
      });
    }
  });
  return rows;
}

export function buildSchedulingConfig(db, options = {}) {
  ensureSchedulingStore(db);
  const term = currentTerm(db, options.termId);
  const division = divisionById(options.divisionId);
  const grade = gradeById(division, options.gradeId);
  const courseRules = schedulingCourseRules(db, division, grade, term);
  const subjects = schedulingSubjects(db, division, grade, term);
  const classes = schedulingClasses(db, division, grade, term);
  const classStructure = gradeClassStructure(classes);
  const constraints = publicScheduleConstraints(db, division, grade, term);
  const teacherRules = publicTeacherScheduleRules(db, division, subjects, term);
  const scopedRooms = schedulingRooms(db, division, classes, term);

  return {
    divisionId: division.id,
    divisionName: division.name,
    termId: term.id,
    termName: term.name,
    termStartDate: term.startDate,
    termEndDate: term.endDate,
    termStatus: term.status,
    stageId: division.stageId,
    gradeId: grade.id,
    gradeName: grade.name,
    grade: grade.grade,
    weekStart: String(options.weekStart || "").trim() || weekStartForDivision(term, division) || division.weekStart || "2026-06-15",
    classCount: classes.length,
    classStructure,
    roomResourceCounts: specialRoomCounts(scopedRooms),
    classes,
    rooms: scopedRooms
      .map((room) => ({
        id: room.id,
        name: room.name,
        roomType: normalizeRoomType(room.roomType || room.type, "homeroom"),
        roomTypeName: ROOM_TYPES[normalizeRoomType(room.roomType || room.type, "homeroom")],
        sourceClassId: classes.find((schoolClass) => schoolClass.roomId === room.id)?.id || "",
        capacity: Number(room.capacity || 1),
      })),
    periods: PERIODS.map((period) => ({ ...period })),
    courseRules,
    constraints,
    teacherRules,
    changeRequests: publicScheduleChangeRequests(db, division, grade, term),
    subjects,
    teachers: schedulingTeacherRows(db, subjects),
    divisions: DIVISIONS.map((item) => ({
      id: item.id,
      name: item.name,
      grades: item.grades.map((catalogGrade) => ({
        id: catalogGrade.id,
        name: catalogGrade.name,
      })),
    })),
  };
}

function normalizeClassCount(value, fallback, options = {}) {
  const min = Number.isFinite(options.min) ? options.min : 0;
  const max = Number.isFinite(options.max) ? options.max : 30;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function classTypeLabel(classType) {
  return classType === "experimental" ? "实验班" : "普通班";
}

function normalizeClassRoomCatalog(classRoomCatalog = []) {
  if (!Array.isArray(classRoomCatalog)) return [];
  return classRoomCatalog
    .map((room) => ({
      classType: room.classType === "experimental" ? "experimental" : "regular",
      index: normalizeClassCount(room.index, 0, { min: 1, max: 40 }),
      roomName: normalizeRoomName(room.roomName || room.name),
    }))
    .filter((room) => room.index >= 1);
}

function classRoomCatalogFromClasses(classes = []) {
  const counters = { regular: 0, experimental: 0 };
  return classes
    .slice()
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
    .map((schoolClass) => {
      const classType = schoolClass.classType === "experimental" ? "experimental" : "regular";
      counters[classType] += 1;
      return {
        classType,
        index: counters[classType],
        roomName: normalizeRoomName(schoolClass.room),
      };
    });
}

function classRoomNameFromCatalog(classRoomCatalog, classType, index, fallback) {
  return (
    normalizeClassRoomCatalog(classRoomCatalog).find(
      (room) => room.classType === classType && Number(room.index) === Number(index),
    )?.roomName || fallback
  );
}

function buildClassAndRoomRows(division, grade, options = {}) {
  const term = options.term || null;
  const regularCount = normalizeClassCount(options.regularCount, 1, { min: 0, max: 30 });
  const experimentalCount = normalizeClassCount(options.experimentalCount, 0, { min: 0, max: 10 });
  const classRoomCatalog = normalizeClassRoomCatalog(options.classRoomCatalog || []);
  if (regularCount + experimentalCount < 1) {
    const error = new Error("当前年级至少保留 1 个班");
    error.statusCode = 400;
    throw error;
  }

  const classRows = [];
  const roomRows = [];
  const pushClass = (classType, index, displayOrder) => {
    const suffix = classType === "experimental" ? `E${pad(index)}` : pad(index);
    const classId = `CLS-${division.stageId}-${grade.grade}-${suffix}`;
    const roomId = `ROOM-${division.stageId}-${grade.grade}-${suffix}`;
    const className =
      classType === "experimental"
        ? `${grade.name}实验${index}班`
        : `${grade.name} ${index} 班`;
    const roomName =
      classType === "experimental"
        ? `${division.shortName || division.name}${grade.name}实验${index}班`
        : `${division.shortName || division.name}${grade.name}-${pad(index)}`;
    const catalogRoomName = classRoomNameFromCatalog(classRoomCatalog, classType, index, roomName);
    classRows.push({
      id: classId,
      termId: term?.id || "",
      termName: term?.name || "",
      stageId: division.stageId,
      stageName: division.name,
      grade: grade.grade,
      name: className,
      classType,
      classTypeLabel: classTypeLabel(classType),
      displayOrder,
      roomId,
      active: true,
    });
    roomRows.push({
      id: roomId,
      termId: term?.id || "",
      termName: term?.name || "",
      stageId: division.stageId,
      name: catalogRoomName,
      roomType: "homeroom",
      capacity: 1,
      qrCode: `ROOM:${roomId}`,
      displayKey: `screen-${roomId.toLowerCase()}`,
      active: true,
    });
  };

  for (let index = 1; index <= regularCount; index += 1) {
    pushClass("regular", index, index);
  }
  for (let index = 1; index <= experimentalCount; index += 1) {
    pushClass("experimental", index, regularCount + index);
  }

  return { classRows, roomRows, regularCount, experimentalCount };
}

export function updateRoomResources(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const stageId = String(options.stageId || "").trim();
  const { division, grade } = schedulingScopeFromStageGrade(db, stageId, options.grade);
  const scopeConfig = buildSchedulingConfig(db, { termId: options.termId, divisionId: division.id, gradeId: grade.id });
  const term = currentTerm(db, scopeConfig.termId);
  assertEditableScheduleTerm(scopeConfig, "修改教室资源");
  const classes = schedulingClasses(db, division, grade, term);
  const previousRooms = schedulingRooms(db, division, classes, term);
  const roomCounts = normalizeRoomResourceCounts(options.roomCounts || {}, specialRoomCounts(previousRooms));
  const submittedCatalog = normalizeRoomResourceCatalog(options.roomCatalog);
  const roomCatalog = submittedCatalog.length ? submittedCatalog : roomCatalogFromRows(previousRooms);
  const specialTypes = specialRoomTypeSet();

  db.rooms = (db.rooms || []).filter(
    (room) =>
      !(
        itemBelongsToTerm(room, term) &&
        room.stageId === division.stageId &&
        specialTypes.has(normalizeRoomType(room.roomType || room.type, "homeroom"))
      ),
  );
  const roomRows = buildSpecialRoomRows(division, term, roomCounts, roomCatalog);
  db.rooms.push(...roomRows);

  db.roomResourceOverrides = (db.roomResourceOverrides || []).filter(
    (override) => !(override.termId === term.id && override.stageId === division.stageId),
  );
  const now = new Date().toISOString();
  db.roomResourceOverrides.push({
    id: scopedConfigId("RRC", term.id, division.stageId),
    termId: term.id,
    termName: term.name,
    stageId: division.stageId,
    stageName: division.name,
    roomCounts,
    roomCatalog: roomCatalogFromRows(roomRows),
    active: true,
    updatedAt: now,
    updatedByAccountId: actorAccount?.id || "",
    updatedByName: actorAccount?.name || "",
  });

  db.scheduleDrafts = (db.scheduleDrafts || []).filter(
    (draft) => !(draft.termId === scopeConfig.termId && draft.divisionId === division.id),
  );
  db.scheduleChangeRequests = (db.scheduleChangeRequests || []).filter(
    (request) => !(request.termId === scopeConfig.termId && request.divisionId === division.id),
  );

  db.auditLogs.push({
    action: "room_resource_update",
    termId: term.id,
    stageId: division.stageId,
    roomCounts,
    roomCatalog: roomCatalogFromRows(roomRows),
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    createdAt: now,
  });
  db.meta.updatedAt = now;

  return {
    config: buildSchedulingConfig(db, { termId: scopeConfig.termId, divisionId: division.id, gradeId: grade.id }),
    draft: findScheduleDraft(db, { termId: scopeConfig.termId, divisionId: division.id, gradeId: grade.id }),
  };
}

function pruneTeacherAssignmentsForClassIds(db, division, grade, validClassIds, term = currentTerm(db)) {
  (db.teacherAssignments || [])
    .filter(
      (assignment) =>
        itemBelongsToTerm(assignment, term) &&
        assignment.stageId === division.stageId &&
        Number(assignment.grade) === Number(grade.grade),
    )
    .forEach((assignment) => {
      if (!assignment.classTeacherIds || typeof assignment.classTeacherIds !== "object" || Array.isArray(assignment.classTeacherIds)) {
        assignment.classTeacherIds = {};
      }
      Object.keys(assignment.classTeacherIds).forEach((classId) => {
        if (!validClassIds.has(classId)) delete assignment.classTeacherIds[classId];
      });
      assignment.teacherIds = Array.from(new Set(Object.values(assignment.classTeacherIds).flat().map(String).filter(Boolean)));
    });
}

export function updateGradeClassStructure(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const stageId = String(options.stageId || "").trim();
  const { division, grade } = schedulingScopeFromStageGrade(db, stageId, options.grade);
  const scopeConfig = buildSchedulingConfig(db, { termId: options.termId, divisionId: division.id, gradeId: grade.id });
  const term = currentTerm(db, scopeConfig.termId);
  assertEditableScheduleTerm(scopeConfig, "修改班级结构");
  const previousClasses = schedulingClasses(db, division, grade, term);
  const previousStructure = gradeClassStructure(previousClasses);
  const submittedClassRoomCatalog = normalizeClassRoomCatalog(options.classRoomCatalog);
  const classRoomCatalog = submittedClassRoomCatalog.length ? submittedClassRoomCatalog : classRoomCatalogFromClasses(previousClasses);
  const { classRows, roomRows, regularCount, experimentalCount } = buildClassAndRoomRows(division, grade, {
    term,
    regularCount: options.regularCount ?? previousStructure.regularCount,
    experimentalCount: options.experimentalCount ?? previousStructure.experimentalCount,
    classRoomCatalog,
  });
  const scopeClassIds = new Set(
    (db.classes || [])
      .filter(
        (schoolClass) =>
          itemBelongsToTerm(schoolClass, term) &&
          schoolClass.stageId === division.stageId &&
          Number(schoolClass.grade) === Number(grade.grade),
      )
      .map((schoolClass) => schoolClass.id),
  );
  const scopeRoomIds = new Set(
    (db.rooms || [])
      .filter((room) => itemBelongsToTerm(room, term) && room.stageId === division.stageId && scopeClassIds.has(String(room.id).replace(/^ROOM/, "CLS")))
      .map((room) => room.id),
  );
  classRows.forEach((schoolClass) => scopeRoomIds.add(schoolClass.roomId));
  db.classes = (db.classes || []).filter(
    (schoolClass) =>
      !(
        itemBelongsToTerm(schoolClass, term) &&
        schoolClass.stageId === division.stageId &&
        Number(schoolClass.grade) === Number(grade.grade)
      ),
  );
  db.rooms = (db.rooms || []).filter((room) => !(itemBelongsToTerm(room, term) && scopeRoomIds.has(room.id)));
  db.classes.push(...classRows);
  db.rooms.push(...roomRows);

  const validClassIds = new Set(classRows.map((schoolClass) => schoolClass.id));
  pruneTeacherAssignmentsForClassIds(db, division, grade, validClassIds, term);
  clearScheduleDraftForScope(db, division, grade, term);
  db.scheduleChangeRequests = (db.scheduleChangeRequests || []).filter(
    (request) => !(request.termId === scopeConfig.termId && request.divisionId === division.id && request.gradeId === grade.id),
  );

  const now = new Date().toISOString();
  db.auditLogs.push({
    action: "grade_class_structure_update",
    stageId: division.stageId,
    grade: grade.grade,
    regularCount,
    experimentalCount,
    actorAccountId: actorAccount?.id || "",
    createdAt: now,
  });
  db.meta.updatedAt = now;

  return {
    config: buildSchedulingConfig(db, { termId: scopeConfig.termId, divisionId: division.id, gradeId: grade.id }),
    draft: findScheduleDraft(db, { termId: scopeConfig.termId, divisionId: division.id, gradeId: grade.id }),
  };
}

export function updateGradeCourseRules(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const stageId = String(options.stageId || "").trim();
  const { division, grade } = schedulingScopeFromStageGrade(db, stageId, options.grade);
  const scopeConfig = buildSchedulingConfig(db, { termId: options.termId, divisionId: division.id, gradeId: grade.id });
  const term = currentTerm(db, scopeConfig.termId);
  assertEditableScheduleTerm(scopeConfig, "修改课程规则");
  const rules = Array.isArray(options.rules) ? options.rules : [];
  if (!rules.length) {
    const error = new Error("请至少提交 1 条课程规则");
    error.statusCode = 400;
    throw error;
  }

  const bySubject = new Map();
  rules.forEach((rule) => {
    const subjectId = String(rule.subjectId || "").trim();
    const subject = subjectById(db, subjectId);
    if (!subject) return;
    const defaultRule = defaultCourseRule(division, subjectId) || {};
    bySubject.set(subjectId, {
      id: scopedConfigId("CR", term.id, division.stageId, grade.grade, subjectId),
      termId: term.id,
      termName: term.name,
      stageId: division.stageId,
      grade: grade.grade,
      subjectId,
      enabled: Boolean(rule.enabled),
      weeklyLessons: normalizeWeeklyLessons(rule.weeklyLessons, 1),
      durationMinutes: normalizeDurationMinutes(rule.durationMinutes, DEFAULT_LESSON_DURATION_MINUTES),
      ...courseRuleConstraintFields(rule, defaultRule),
      updatedAt: new Date().toISOString(),
      updatedByAccountId: actorAccount?.id || "",
    });
  });

  if (!bySubject.size) {
    const error = new Error("课程规则里没有有效科目");
    error.statusCode = 400;
    throw error;
  }

  const nextRules = Array.from(bySubject.values());
  db.gradeCourseRules = (db.gradeCourseRules || []).filter(
    (rule) =>
      !(
        itemBelongsToTerm(rule, term) &&
        rule.stageId === division.stageId &&
        Number(rule.grade) === grade.grade &&
        bySubject.has(rule.subjectId)
      ),
  );
  db.gradeCourseRules.push(...nextRules);
  clearScheduleDraftForScope(db, division, grade, term);
  db.meta.updatedAt = new Date().toISOString();
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "grade_course_rules_update",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    stageId: division.stageId,
    grade: grade.grade,
    enabledSubjectCount: nextRules.filter((rule) => rule.enabled).length,
    createdAt: db.meta.updatedAt,
  });

  return { config: buildSchedulingConfig(db, { termId: scopeConfig.termId, divisionId: division.id, gradeId: grade.id }) };
}

function normalizeSubjectName(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function createSubjectId(db) {
  let id = `custom-${Date.now().toString(36)}`;
  let index = 1;
  while (db.subjects.some((subject) => subject.id === id)) {
    id = `custom-${Date.now().toString(36)}-${index}`;
    index += 1;
  }
  return id;
}

function upsertCourseRule(db, division, grade, subjectId, options = {}, actorAccount = null) {
  const now = new Date().toISOString();
  const term = options.term || currentTerm(db, options.termId);
  const defaultRule = defaultCourseRule(division, subjectId) || {};
  const next = {
    id: scopedConfigId("CR", term.id, division.stageId, grade.grade, subjectId),
    termId: term.id,
    termName: term.name,
    stageId: division.stageId,
    grade: grade.grade,
    subjectId,
    enabled: Boolean(options.enabled),
    weeklyLessons: normalizeWeeklyLessons(options.weeklyLessons, 1),
    durationMinutes: normalizeDurationMinutes(options.durationMinutes, DEFAULT_LESSON_DURATION_MINUTES),
    ...courseRuleConstraintFields(options, defaultRule),
    updatedAt: now,
    updatedByAccountId: actorAccount?.id || "",
  };
  const existing = (db.gradeCourseRules || []).find(
    (rule) =>
      rule.termId === term.id &&
      rule.stageId === division.stageId &&
      Number(rule.grade) === Number(grade.grade) &&
      rule.subjectId === subjectId,
  );
  if (existing) {
    Object.assign(existing, next);
  } else {
    db.gradeCourseRules.push(next);
  }
  return next;
}

export function createGradeCourse(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const stageId = String(options.stageId || "").trim();
  const { division, grade } = schedulingScopeFromStageGrade(db, stageId, options.grade);
  const scopeConfig = buildSchedulingConfig(db, { termId: options.termId, divisionId: division.id, gradeId: grade.id });
  const term = currentTerm(db, scopeConfig.termId);
  assertEditableScheduleTerm(scopeConfig, "新增课程");
  const subjectName = normalizeSubjectName(options.subjectName);
  if (!subjectName) {
    const error = new Error("课程名称不能为空");
    error.statusCode = 400;
    throw error;
  }
  if (subjectName.length > 20) {
    const error = new Error("课程名称不能超过 20 个字");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  let subject = db.subjects.find((item) => item.name === subjectName);
  if (!subject) {
    subject = {
      id: createSubjectId(db),
      name: subjectName,
      lessonRate: 80,
      custom: true,
      createdAt: now,
      createdByAccountId: actorAccount?.id || "",
    };
    db.subjects.push(subject);
  }

  const existingRule = schedulingCourseRules(db, division, grade, term).find((rule) => rule.subjectId === subject.id);
  upsertCourseRule(
    db,
    division,
    grade,
    subject.id,
    {
      enabled: true,
      term,
      weeklyLessons: options.weeklyLessons ?? existingRule?.weeklyLessons ?? 1,
      durationMinutes: options.durationMinutes ?? existingRule?.durationMinutes ?? DEFAULT_LESSON_DURATION_MINUTES,
      requiredRoomType: options.requiredRoomType ?? existingRule?.requiredRoomType ?? SUBJECT_DEFAULT_ROOM_TYPES[subject.id] ?? "homeroom",
    },
    actorAccount,
  );
  clearScheduleDraftForScope(db, division, grade, term);
  db.meta.updatedAt = now;
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "grade_course_create",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    stageId: division.stageId,
    grade: grade.grade,
    subjectId: subject.id,
    subjectName: subject.name,
    createdAt: now,
  });

  return { config: buildSchedulingConfig(db, { termId: scopeConfig.termId, divisionId: division.id, gradeId: grade.id }), subject };
}

export function deleteGradeCourse(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const stageId = String(options.stageId || "").trim();
  const { division, grade } = schedulingScopeFromStageGrade(db, stageId, options.grade);
  const scopeConfig = buildSchedulingConfig(db, { termId: options.termId, divisionId: division.id, gradeId: grade.id });
  const term = currentTerm(db, scopeConfig.termId);
  assertEditableScheduleTerm(scopeConfig, "删除课程");
  const subjectId = String(options.subjectId || "").trim();
  const subject = subjectById(db, subjectId);
  if (!subject) {
    const error = new Error("课程不存在");
    error.statusCode = 404;
    throw error;
  }
  const currentRule = schedulingCourseRules(db, division, grade, term).find((rule) => rule.subjectId === subjectId);
  upsertCourseRule(
    db,
    division,
    grade,
    subjectId,
    {
      enabled: false,
      term,
      weeklyLessons: currentRule?.weeklyLessons || 1,
      durationMinutes: currentRule?.durationMinutes || DEFAULT_LESSON_DURATION_MINUTES,
      requiredRoomType: currentRule?.requiredRoomType || SUBJECT_DEFAULT_ROOM_TYPES[subjectId] || "homeroom",
    },
    actorAccount,
  );
  db.scheduleConstraints = (db.scheduleConstraints || []).filter(
    (constraint) =>
      !(
        itemBelongsToTerm(constraint, term) &&
        constraint.stageId === division.stageId &&
        Number(constraint.grade) === grade.grade &&
        constraint.subjectId === subjectId
      ),
  );
  clearScheduleDraftForScope(db, division, grade, term);
  db.meta.updatedAt = new Date().toISOString();
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "grade_course_delete",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    stageId: division.stageId,
    grade: grade.grade,
    subjectId,
    subjectName: subject.name,
    createdAt: db.meta.updatedAt,
  });

  return { config: buildSchedulingConfig(db, { termId: scopeConfig.termId, divisionId: division.id, gradeId: grade.id }), deletedSubjectId: subjectId };
}

function normalizedConstraintNumbers(values, min, max) {
  const list = Array.isArray(values) ? values : values === undefined || values === "" ? [] : [values];
  return Array.from(
    new Set(
      list
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isFinite(value) && value >= min && value <= max),
    ),
  ).sort((a, b) => a - b);
}

export function createScheduleConstraint(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const stageId = String(options.stageId || "").trim();
  const { division, grade } = schedulingScopeFromStageGrade(db, stageId, options.grade);
  const scopeConfig = buildSchedulingConfig(db, { termId: options.termId, divisionId: division.id, gradeId: grade.id });
  const term = currentTerm(db, scopeConfig.termId);
  assertEditableScheduleTerm(scopeConfig, "新增硬约束");
  const subjectId = String(options.subjectId || "").trim();
  const subject = subjectById(db, subjectId);
  if (!subject) {
    const error = new Error("请选择有效课程");
    error.statusCode = 400;
    throw error;
  }

  const dayIndexes = normalizedConstraintNumbers(options.dayIndexes, 0, 4);
  const periods = normalizedConstraintNumbers(options.periods, 1, PERIODS.length);
  if (!dayIndexes.length && !periods.length) {
    const error = new Error("请至少选择禁排星期或禁排节次");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const constraint = {
    id: scopedConfigId("SC", term.id, division.stageId, grade.grade, subjectId, Date.now()),
    termId: term.id,
    termName: term.name,
    type: "subject_forbidden_slot",
    stageId: division.stageId,
    grade: grade.grade,
    subjectId,
    dayIndexes,
    periods,
    reason: String(options.reason || "").trim(),
    active: true,
    createdAt: now,
    createdByAccountId: actorAccount?.id || "",
  };
  db.scheduleConstraints.push(constraint);
  db.meta.updatedAt = now;
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "schedule_constraint_create",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    constraintId: constraint.id,
    stageId: division.stageId,
    grade: grade.grade,
    subjectId,
    createdAt: now,
  });

  return { config: buildSchedulingConfig(db, { termId: scopeConfig.termId, divisionId: division.id, gradeId: grade.id }), constraint };
}

export function deleteScheduleConstraint(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const constraintId = String(options.constraintId || "").trim();
  const term = currentTerm(db, options.termId);
  const existing = db.scheduleConstraints.find(
    (constraint) => constraint.id === constraintId && itemMatchesTerm(constraint, term),
  );
  if (!existing) {
    const error = new Error("未找到该硬约束");
    error.statusCode = 404;
    throw error;
  }
  const division = divisionByStageId(existing.stageId) || DIVISIONS[0];
  const grade = division.grades.find((item) => item.grade === Number(existing.grade)) || division.grades[0];
  const scopeConfig = buildSchedulingConfig(db, { termId: term.id, divisionId: division.id, gradeId: grade.id });
  assertEditableScheduleTerm(scopeConfig, "删除硬约束");
  db.scheduleConstraints = db.scheduleConstraints.filter(
    (constraint) => !(constraint.id === constraintId && itemMatchesTerm(constraint, term)),
  );
  db.meta.updatedAt = new Date().toISOString();
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "schedule_constraint_delete",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    constraintId,
    stageId: existing.stageId,
    grade: existing.grade,
    subjectId: existing.subjectId,
    createdAt: db.meta.updatedAt,
  });
  return { config: buildSchedulingConfig(db, { termId: scopeConfig.termId, divisionId: division.id, gradeId: grade.id }), deletedId: constraintId };
}

function normalizeUnavailableSlots(slots = []) {
  const normalized = [];
  (Array.isArray(slots) ? slots : []).forEach((slot) => {
    const dayIndex = Number.parseInt(slot.dayIndex, 10);
    const periods = normalizedConstraintNumbers(slot.periods, 1, PERIODS.length);
    if (!Number.isFinite(dayIndex) || dayIndex < 0 || dayIndex > 4 || !periods.length) return;
    normalized.push({
      dayIndex,
      periods,
      reason: String(slot.reason || "").trim(),
    });
  });
  return normalized;
}

function normalizeTeacherScheduleRuleInput(options = {}) {
  return {
    unavailableSlots: normalizeUnavailableSlots(options.unavailableSlots || []),
    avoidPeriods: normalizedConstraintNumbers(options.avoidPeriods, 1, PERIODS.length),
    preferPeriods: normalizedConstraintNumbers(options.preferPeriods, 1, PERIODS.length),
    maxDailyLessons: Math.min(Math.max(Number.parseInt(options.maxDailyLessons || 4, 10), 1), PERIODS.length),
    maxConsecutiveLessons: Math.min(
      Math.max(Number.parseInt(options.maxConsecutiveLessons || 3, 10), 1),
      PERIODS.length,
    ),
  };
}

export function updateTeacherScheduleRule(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const stageId = String(options.stageId || "").trim();
  const division = divisionByStageId(stageId);
  if (!division) {
    const error = new Error("请选择有效学部");
    error.statusCode = 400;
    throw error;
  }
  const scopeConfig = buildSchedulingConfig(db, {
    termId: options.termId,
    divisionId: division.id,
    gradeId: options.gradeId || division.grades.find((item) => Number(item.grade) === Number(options.grade))?.id,
  });
  const term = currentTerm(db, scopeConfig.termId);
  assertEditableScheduleTerm(scopeConfig, "修改老师时间规则");
  const teacherId = String(options.teacherId || "").trim();
  const teacher = teacherById(db, teacherId);
  if (!teacher || teacher.status !== "active" || teacher.stageId !== division.stageId) {
    const error = new Error("请选择当前学部内的有效老师");
    error.statusCode = 400;
    throw error;
  }

  const normalized = normalizeTeacherScheduleRuleInput(options);
  const now = new Date().toISOString();
  const nextRule = {
    id: scopedConfigId("TSR", term.id, division.stageId, teacherId),
    termId: term.id,
    termName: term.name,
    stageId: division.stageId,
    teacherId,
    teacherName: teacher.name,
    ...normalized,
    updatedAt: now,
    updatedByAccountId: actorAccount?.id || "",
  };
  const existing = db.teacherScheduleRules.find(
    (rule) => rule.termId === term.id && rule.stageId === division.stageId && rule.teacherId === teacherId,
  );
  if (existing) {
    Object.assign(existing, nextRule);
  } else {
    db.teacherScheduleRules.push(nextRule);
  }
  db.meta.updatedAt = now;
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "teacher_schedule_rule_update",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    stageId: division.stageId,
    teacherId,
    unavailableCount: nextRule.unavailableSlots.length,
    createdAt: now,
  });

  return {
    config: buildSchedulingConfig(db, {
      termId: scopeConfig.termId,
      divisionId: division.id,
      gradeId: scopeConfig.gradeId,
    }),
    rule: nextRule,
  };
}

function schedulingSlots(config) {
  return Array.from({ length: 5 }, (_, dayIndex) => addDays(config.weekStart, dayIndex)).flatMap((date, dayIndex) =>
    config.periods.map((period) => ({
      ...period,
      date,
      dayIndex,
      slotKey: `${date}-${period.period}`,
    })),
  );
}

function weekDateKeys(config) {
  return Array.from({ length: 5 }, (_, dayIndex) => addDays(config.weekStart, dayIndex));
}

export function requiredScheduleLessonCount(config) {
  const weeklyPerClass = config.subjects.reduce((sum, subject) => sum + subject.weeklyLessons, 0);
  return config.classes.length * weeklyPerClass;
}

function missingTeacherAssignmentCells(config) {
  return (config.classes || []).flatMap((schoolClass) =>
    (config.subjects || [])
      .filter((subject) => !Array.isArray(subject.classTeacherIds?.[schoolClass.id]) || !subject.classTeacherIds[schoolClass.id].length)
      .map((subject) => ({
        className: schoolClass.name,
        subjectName: subject.name,
      })),
  );
}

function assertTeacherAssignmentsComplete(config) {
  const missingCells = missingTeacherAssignmentCells(config);
  if (!missingCells.length) return;
  const preview = missingCells
    .slice(0, 4)
    .map((item) => `${item.className} ${item.subjectName}`)
    .join("、");
  const error = new Error(`请先补齐任课老师配置：${preview}${missingCells.length > 4 ? " 等" : ""}`);
  error.statusCode = 400;
  error.details = { missingTeacherAssignments: missingCells };
  throw error;
}

function buildSubjectQueueFromCounters(config, classIndex, counters) {
  const targetCount = Array.from(counters.values()).reduce((sum, count) => sum + Math.max(count, 0), 0);
  const queue = [];
  let round = 0;

  while (queue.length < targetCount) {
    let pushed = 0;
    config.subjects.forEach((subject, subjectIndex) => {
      if ((counters.get(subject.id) || 0) <= 0) return;
      if ((round + classIndex + subjectIndex) % 2 === 0 || counters.get(subject.id) > 2) {
        queue.push(subject);
        counters.set(subject.id, counters.get(subject.id) - 1);
        pushed += 1;
      }
    });
    if (pushed === 0) break;
    round += 1;
  }

  return queue;
}

function buildClassSubjectQueue(config, classIndex) {
  const counters = new Map(config.subjects.map((subject) => [subject.id, subject.weeklyLessons]));
  return buildSubjectQueueFromCounters(config, classIndex, counters);
}

function countClassSubjectOnDay(assignments, classId, subjectId, date) {
  return assignments.filter(
    (assignment) =>
      assignment.classId === classId &&
      assignment.subjectId === subjectId &&
      assignment.date === date,
  ).length;
}

function teacherName(config, teacherId) {
  return config.teachers.find((teacher) => teacher.id === teacherId)?.name || teacherId;
}

function teacherCanTeachSubject(config, teacherId, subjectId, classId = "") {
  const subject = config.subjects.find((item) => item.id === subjectId);
  if (classId && subject?.classTeacherIds?.[classId]?.length) {
    return subject.classTeacherIds[classId].includes(teacherId);
  }
  return Boolean(subject?.teacherIds.includes(teacherId));
}

function roomById(config, roomId) {
  return config.rooms?.find((room) => room.id === roomId) || null;
}

function roomTypeName(roomType = "homeroom") {
  return ROOM_TYPES[normalizeRoomType(roomType)] || ROOM_TYPES.homeroom;
}

function roomsForTask(config, task) {
  const requiredRoomType = normalizeRoomType(task.requiredRoomType || task.subject?.requiredRoomType, "homeroom");
  if (requiredRoomType === "homeroom") {
    const homeRoom = roomById(config, task.roomId);
    return homeRoom ? [homeRoom] : [];
  }
  return (config.rooms || []).filter((room) => normalizeRoomType(room.roomType || room.type, "homeroom") === requiredRoomType);
}

function roomRuleText(config, task) {
  const requiredRoomType = normalizeRoomType(task.requiredRoomType || task.subject?.requiredRoomType, "homeroom");
  return `${task.subjectName || task.subject?.name || "课程"} 需要${roomTypeName(requiredRoomType)}`;
}

function roomHardRuleViolation(config, subjectId, room) {
  const subject = scheduleSubjectRuleFor(config, subjectId);
  const requiredRoomType = normalizeRoomType(subject?.requiredRoomType, "homeroom");
  const actualRoomType = normalizeRoomType(room?.roomType || room?.type, "homeroom");
  if (requiredRoomType !== actualRoomType) {
    return {
      type: "room-type",
      title: `${subject?.name || subjectId} 教室类型不匹配`,
      text: `${subject?.name || subjectId} 需要${roomTypeName(requiredRoomType)}，不能安排到${room?.name || "该教室"}（${roomTypeName(actualRoomType)}）。`,
    };
  }
  return null;
}

function classById(config, classId) {
  return config.classes.find((schoolClass) => schoolClass.id === classId) || null;
}

function dayIndexForDate(config, date) {
  return weekDateKeys(config).indexOf(date);
}

function slotKeyFor(date, period) {
  return `${date}-${period}`;
}

function dayLabel(dayIndex) {
  return DAY_LABELS[dayIndex] || `第 ${dayIndex + 1} 天`;
}

function constraintAppliesToSlot(constraint, subjectId, slot) {
  if (!constraint || constraint.active === false || constraint.subjectId !== subjectId) return false;
  const dayIndexes = Array.isArray(constraint.dayIndexes) ? constraint.dayIndexes.map(Number) : [];
  const periods = Array.isArray(constraint.periods) ? constraint.periods.map(Number) : [];
  if (dayIndexes.length && !dayIndexes.includes(Number(slot.dayIndex))) return false;
  if (periods.length && !periods.includes(Number(slot.period))) return false;
  return true;
}

function firstScheduleConstraintViolation(config, subjectId, slot) {
  return (config.constraints || []).find((constraint) => constraintAppliesToSlot(constraint, subjectId, slot)) || null;
}

function scheduleConstraintText(config, constraint) {
  const days = constraint.dayIndexes?.length
    ? constraint.dayIndexes.map((dayIndex) => dayLabel(Number(dayIndex))).join("、")
    : "任意工作日";
  const periods = constraint.periods?.length
    ? constraint.periods.map((period) => `第 ${period} 节`).join("、")
    : "任意节次";
  const subjectName =
    constraint.subjectName ||
    config.subjects.find((subject) => subject.id === constraint.subjectId)?.name ||
    constraint.subjectId;
  return `${subjectName} 不能出现在 ${days} ${periods}${constraint.reason ? `：${constraint.reason}` : ""}`;
}

function scheduleSubjectRuleFor(config, subjectId) {
  return (config.subjects || []).find((subject) => subject.id === subjectId) || null;
}

function periodDayPart(period) {
  return Number(period) <= 4 ? "morning" : "afternoon";
}

function subjectRuleSummary(config, subjectId) {
  const subject = scheduleSubjectRuleFor(config, subjectId);
  const subjectName = subject?.name || subjectId;
  const rules = [];
  const maxPerClassPerDay = Number(subject?.maxPerClassPerDay || 0);
  if (maxPerClassPerDay > 0) rules.push(`每班每天最多 ${maxPerClassPerDay} 节`);
  if (subject?.allowConsecutive === false) rules.push("不允许同班连堂");
  if ((subject?.forbiddenPeriods || []).length) {
    rules.push(`禁排第 ${(subject.forbiddenPeriods || []).map(Number).join("、")} 节`);
  }
  if (subject?.preferredDayPart && subject.preferredDayPart !== "any") {
    rules.push(`偏好${DAY_PARTS[subject.preferredDayPart] || subject.preferredDayPart}`);
  }
  if (subject?.requiredRoomType && subject.requiredRoomType !== "homeroom") {
    rules.push(`需要${roomTypeName(subject.requiredRoomType)}`);
  }
  return `${subjectName}${rules.length ? `：${rules.join("，")}` : "无特殊课程规则"}`;
}

function subjectRulePreferencePenalty(subject, period) {
  if (!subject?.preferredDayPart || subject.preferredDayPart === "any") return 0;
  return periodDayPart(period) === subject.preferredDayPart ? -2 : 10;
}

function subjectHardRuleViolation(config, subjectId, slot, assignments = [], classId = "") {
  const subject = scheduleSubjectRuleFor(config, subjectId);
  if (!subject) return null;
  const subjectName = subject.name || subjectId;
  const period = Number(slot.period);
  if ((subject.forbiddenPeriods || []).map(Number).includes(period)) {
    return {
      type: "subject-forbidden-period",
      title: `${subjectName} 命中课程禁排节次`,
      text: `${subjectName} 已设置禁排第 ${period} 节，${dayLabel(Number(slot.dayIndex))}第 ${period} 节不可排。`,
    };
  }

  if (!classId) return null;
  const sameClassSubjectDayItems = assignments.filter(
    (assignment) =>
      assignment.classId === classId &&
      assignment.subjectId === subjectId &&
      assignment.date === slot.date,
  );
  const maxPerClassPerDay = Number(subject.maxPerClassPerDay || 0);
  if (maxPerClassPerDay > 0 && sameClassSubjectDayItems.length + 1 > maxPerClassPerDay) {
    return {
      type: "subject-max-per-day",
      title: `${subjectName} 超过每日上限`,
      text: `${subjectName} 已设置每班每天最多 ${maxPerClassPerDay} 节，${dayLabel(Number(slot.dayIndex))}再加入第 ${period} 节会超过上限。`,
    };
  }

  if (subject.allowConsecutive === false) {
    const adjacent = sameClassSubjectDayItems.find(
      (assignment) => Math.abs(Number(assignment.period) - period) === 1,
    );
    if (adjacent) {
      return {
        type: "subject-consecutive",
        title: `${subjectName} 不允许同班连堂`,
        text: `${subjectName} 已设置不允许同班连堂，第 ${adjacent.period} 节旁边不能再排第 ${period} 节。`,
      };
    }
  }

  return null;
}

function teacherScheduleRuleFor(config, teacherId) {
  return (config.teacherRules || []).find((rule) => rule.teacherId === teacherId) || null;
}

function teacherUnavailableSlot(rule, slot) {
  if (!rule) return null;
  return (
    (rule.unavailableSlots || []).find((item) => {
      if (Number(item.dayIndex) !== Number(slot.dayIndex)) return false;
      return (item.periods || []).map(Number).includes(Number(slot.period));
    }) || null
  );
}

function teacherRuleBlocksSlot(config, teacherId, slot) {
  return teacherUnavailableSlot(teacherScheduleRuleFor(config, teacherId), slot);
}

function teacherRuleText(config, teacherId, slot = null) {
  const rule = teacherScheduleRuleFor(config, teacherId);
  const teacher = teacherName(config, teacherId);
  const unavailable = slot ? teacherUnavailableSlot(rule, slot) : null;
  if (unavailable) {
    const reason = unavailable.reason ? `：${unavailable.reason}` : "";
    return `${teacher} ${dayLabel(Number(slot.dayIndex))}第 ${slot.period} 节不可用${reason}`;
  }
  return `${teacher} 时间规则`;
}

function teacherPeriodPreferencePenalty(config, teacherId, period) {
  const rule = teacherScheduleRuleFor(config, teacherId);
  if (!rule) return 0;
  const periodNumber = Number(period);
  let penalty = 0;
  if ((rule.avoidPeriods || []).map(Number).includes(periodNumber)) penalty += 12;
  if ((rule.preferPeriods || []).length && !(rule.preferPeriods || []).map(Number).includes(periodNumber)) penalty += 4;
  if ((rule.preferPeriods || []).map(Number).includes(periodNumber)) penalty -= 2;
  return penalty;
}

function maxConsecutiveRun(periods = []) {
  const sorted = Array.from(new Set(periods.map(Number))).sort((a, b) => a - b);
  let longest = 0;
  let current = 0;
  let previous = null;
  sorted.forEach((period) => {
    current = previous !== null && period === previous + 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = period;
  });
  return longest;
}

function projectedMaxConsecutive(periods = [], nextPeriod = null) {
  const next = nextPeriod === null ? periods : [...periods, Number(nextPeriod)];
  return maxConsecutiveRun(next);
}

function teacherHardRuleViolation(config, teacherId, slot, teacherDayLoad = 0, teacherDayPeriods = []) {
  const rule = teacherScheduleRuleFor(config, teacherId);
  if (!rule) return null;
  const unavailable = teacherUnavailableSlot(rule, slot);
  if (unavailable) {
    return {
      type: "teacher-unavailable",
      title: `${teacherName(config, teacherId)} 不可用`,
      text: teacherRuleText(config, teacherId, slot),
    };
  }
  const maxDailyLessons = Number(rule.maxDailyLessons || 4);
  if (teacherDayLoad + 1 > maxDailyLessons) {
    return {
      type: "teacher-max-daily",
      title: `${teacherName(config, teacherId)} 当日课量超上限`,
      text: `${dayLabel(Number(slot.dayIndex))}第 ${slot.period} 节会使当日课量达到 ${teacherDayLoad + 1} 节，超过上限 ${maxDailyLessons} 节`,
    };
  }
  const maxConsecutiveLessons = Number(rule.maxConsecutiveLessons || 3);
  if (projectedMaxConsecutive(teacherDayPeriods, slot.period) > maxConsecutiveLessons) {
    return {
      type: "teacher-consecutive",
      title: `${teacherName(config, teacherId)} 连堂超上限`,
      text: `${dayLabel(Number(slot.dayIndex))}加入第 ${slot.period} 节后连续课超过 ${maxConsecutiveLessons} 节`,
    };
  }
  return null;
}

function periodForLesson(lesson) {
  if (lesson.period) return Number.parseInt(lesson.period, 10);
  return PERIODS.find((period) => period.time === lesson.time)?.period || null;
}

function termScopeMatches(config, item) {
  return !item.termId || item.termId === config.termId;
}

function currentScope(config, item) {
  return termScopeMatches(config, item) && item.divisionId === config.divisionId && item.gradeId === config.gradeId;
}

function assertEditableScheduleTerm(config, actionName = "修改排课") {
  ensureEditableTerm(
    {
      id: config.termId,
      name: config.termName,
      status: config.termStatus,
    },
    actionName,
  );
}

function teacherById(db, teacherId) {
  return db.teachers.find((teacher) => teacher.id === teacherId);
}

function externalAssignmentLabel(item) {
  const scope = [item.divisionName, item.gradeName].filter(Boolean).join("");
  const classSubject = [item.className, item.subjectName].filter(Boolean).join(" ");
  return [scope, classSubject].filter(Boolean).join(" · ") || item.sourceLabel || "外部课表";
}

function lessonAsExternalAssignment(db, lesson) {
  const period = periodForLesson(lesson);
  if (!lesson.teacherId || !lesson.date || !period) return null;
  const periodMeta = PERIODS.find((item) => item.period === period);
  const teacher = teacherById(db, lesson.teacherId);
  return {
    id: lesson.id,
    external: true,
    sourceType: "published",
    sourceLabel: "已发布课表",
    teacherId: lesson.teacherId,
    teacherName: teacher?.name || lesson.teacherName || lesson.teacherId,
    classId: lesson.classId,
    className: lesson.className,
    subjectId: lesson.subjectId,
    subjectName: lesson.subjectName,
    roomId: lesson.roomId,
    room: lesson.room,
    date: lesson.date,
    period,
    time: lesson.time || periodMeta?.time || "",
    divisionId: lesson.divisionId,
    gradeId: lesson.gradeId,
    termId: lesson.termId,
    termName: lesson.termName,
    stageId: lesson.stageId,
    grade: lesson.grade,
  };
}

function draftAssignmentAsExternal(draft, assignment) {
  return {
    ...assignment,
    external: true,
    sourceType: "locked-draft",
    sourceLabel: "其他年级锁定草稿",
    divisionId: draft.divisionId,
    gradeId: draft.gradeId,
    termId: draft.termId,
    termName: draft.termName,
    stageId: draft.stageId,
    grade: draft.grade,
    divisionName: draft.divisionName,
    gradeName: draft.gradeName,
    time: assignment.time || PERIODS.find((item) => item.period === assignment.period)?.time || "",
  };
}

function globalTeacherBusyAssignments(db, config) {
  const weekDates = new Set(weekDateKeys(config));
  const publishedAssignments = (db.lessonInstances || [])
    .filter((lesson) => termScopeMatches(config, lesson))
    .filter((lesson) => weekDates.has(lesson.date))
    .filter((lesson) => !currentScope(config, lesson))
    .filter((lesson) => lesson.status !== "cancelled")
    .map((lesson) => lessonAsExternalAssignment(db, lesson))
    .filter(Boolean);

  const lockedDraftAssignments = (db.scheduleDrafts || [])
    .filter((draft) => termScopeMatches(config, draft))
    .filter((draft) => !currentScope(config, draft))
    .filter((draft) => draft.status !== "published")
    .flatMap((draft) =>
      (draft.assignments || [])
        .filter((assignment) => assignment.locked)
        .filter((assignment) => weekDates.has(assignment.date))
        .map((assignment) => draftAssignmentAsExternal(draft, assignment)),
    );

  return [...publishedAssignments, ...lockedDraftAssignments];
}

function markBusy(map, ownerId, slotKey) {
  if (!map.has(ownerId)) map.set(ownerId, new Set());
  map.get(ownerId).add(slotKey);
}

function countAssignmentsByClassSubject(assignments) {
  return assignments.reduce((map, assignment) => {
    const key = `${assignment.classId}:${assignment.subjectId}`;
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());
}

function nextAssignmentId(usedIds, classId, subjectId, nextIndex) {
  let index = nextIndex;
  let id = `SCH-${classId}-${subjectId}-${pad(index)}`;
  while (usedIds.has(id)) {
    index += 1;
    id = `SCH-${classId}-${subjectId}-${pad(index)}`;
  }
  usedIds.add(id);
  return { id, index };
}

function normalizeLockedAssignment(config, assignment) {
  const schoolClass = classById(config, assignment.classId);
  const period = config.periods.find((item) => item.period === assignment.period);
  const room = roomById(config, assignment.roomId) || roomById(config, schoolClass?.roomId);
  const subject = config.subjects.find((item) => item.id === assignment.subjectId);
  return {
    ...assignment,
    className: assignment.className || schoolClass?.name || assignment.classId,
    teacherName: assignment.teacherName || teacherName(config, assignment.teacherId),
    durationMinutes: assignment.durationMinutes || subject?.durationMinutes || DEFAULT_LESSON_DURATION_MINUTES,
    dayIndex: dayIndexForDate(config, assignment.date),
    time: assignment.time || period?.time || "",
    roomId: room?.id || assignment.roomId || schoolClass?.roomId || "",
    room: room?.name || assignment.room || schoolClass?.room || "",
    locked: true,
  };
}

const ADVANCED_SOLVER_DEFAULTS = {
  attempts: 18,
  greedyAttempts: 10,
  greedyCandidateWindow: 4,
  candidateLimit: 10,
  maxNodesPerAttempt: 26000,
  timeoutMs: 4500,
};

function hashString(value = "") {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function incrementMap(map, key, delta = 1) {
  const next = (map.get(key) || 0) + delta;
  if (next <= 0) {
    map.delete(key);
  } else {
    map.set(key, next);
  }
}

function removeBusy(map, ownerId, slotKey) {
  const slots = map.get(ownerId);
  if (!slots) return;
  slots.delete(slotKey);
  if (!slots.size) map.delete(ownerId);
}

function teacherDayKey(teacherId, date) {
  return `${teacherId}:${date}`;
}

function classDayKey(classId, date) {
  return `${classId}:${date}`;
}

function classSubjectDayKey(classId, subjectId, date) {
  return `${classId}:${subjectId}:${date}`;
}

function teacherDayPeriodKey(teacherId, date) {
  return `${teacherId}:${date}`;
}

function mapValues(map) {
  return Array.from(map.values());
}

function standardDeviation(values) {
  if (!values.length) return 0;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function projectedGapCount(periods = [], nextPeriod = null) {
  const unique = new Set(periods);
  if (nextPeriod !== null) unique.add(Number(nextPeriod));
  const sorted = Array.from(unique).sort((a, b) => a - b);
  if (sorted.length <= 1) return 0;
  return sorted[sorted.length - 1] - sorted[0] + 1 - sorted.length;
}

function isCoreSubject(subject) {
  return ["chinese", "math", "english", "physics", "chemistry"].includes(subject.id) || subject.weeklyLessons >= 3;
}

function isActivitySubject(subject) {
  return ["pe", "music", "art"].includes(subject.id);
}

function periodSoftPenalty(subject, period) {
  if (isActivitySubject(subject)) {
    if (period <= 2) return 5;
    if (period >= 5) return 0;
    return 2;
  }
  if (isCoreSubject(subject)) {
    if (period >= 5) return 6;
    if (period === 4) return 2;
    return 0;
  }
  return period >= 5 ? 2 : 1;
}

function weeklyLessonsPerClass(config) {
  return config.subjects.reduce((sum, subject) => sum + Number(subject.weeklyLessons || 0), 0);
}

function createSolverState(config, lockedAssignments = [], externalAssignments = []) {
  const state = {
    assignments: lockedAssignments.map((assignment) => ({ ...assignment })),
    teacherBusy: new Map(),
    classBusy: new Map(),
    roomBusy: new Map(),
    teacherLoad: new Map(config.teachers.map((teacher) => [teacher.id, 0])),
    teacherDayLoad: new Map(),
    classDayLoad: new Map(),
    classSubjectDay: new Map(),
    teacherDayPeriods: new Map(),
  };

  externalAssignments.forEach((assignment) => markSolverAssignment(state, assignment, { external: true }));
  state.assignments.forEach((assignment) => markSolverAssignment(state, assignment));

  return state;
}

function markSolverAssignment(state, assignment, options = {}) {
  const busySlotKey = slotKeyFor(assignment.date, assignment.period);
  if (!options.external) {
    markBusy(state.classBusy, assignment.classId, busySlotKey);
    incrementMap(state.classDayLoad, classDayKey(assignment.classId, assignment.date));
    incrementMap(state.classSubjectDay, classSubjectDayKey(assignment.classId, assignment.subjectId, assignment.date));
  }
  markBusy(state.teacherBusy, assignment.teacherId, busySlotKey);
  if (assignment.roomId || assignment.room) markBusy(state.roomBusy, assignment.roomId || assignment.room, busySlotKey);
  incrementMap(state.teacherLoad, assignment.teacherId);
  incrementMap(state.teacherDayLoad, teacherDayKey(assignment.teacherId, assignment.date));
  const periodKey = teacherDayPeriodKey(assignment.teacherId, assignment.date);
  if (!state.teacherDayPeriods.has(periodKey)) state.teacherDayPeriods.set(periodKey, []);
  state.teacherDayPeriods.get(periodKey).push(Number(assignment.period));
}

function unmarkSolverAssignment(state, assignment) {
  const busySlotKey = slotKeyFor(assignment.date, assignment.period);
  removeBusy(state.classBusy, assignment.classId, busySlotKey);
  removeBusy(state.teacherBusy, assignment.teacherId, busySlotKey);
  if (assignment.roomId || assignment.room) removeBusy(state.roomBusy, assignment.roomId || assignment.room, busySlotKey);
  incrementMap(state.teacherLoad, assignment.teacherId, -1);
  incrementMap(state.teacherDayLoad, teacherDayKey(assignment.teacherId, assignment.date), -1);
  incrementMap(state.classDayLoad, classDayKey(assignment.classId, assignment.date), -1);
  incrementMap(state.classSubjectDay, classSubjectDayKey(assignment.classId, assignment.subjectId, assignment.date), -1);
  const periodKey = teacherDayPeriodKey(assignment.teacherId, assignment.date);
  const periods = state.teacherDayPeriods.get(periodKey) || [];
  const index = periods.indexOf(Number(assignment.period));
  if (index >= 0) periods.splice(index, 1);
  if (!periods.length) state.teacherDayPeriods.delete(periodKey);
}

function buildScheduleTasks(config, lockedAssignments = []) {
  const usedIds = new Set(lockedAssignments.map((assignment) => assignment.id));
  const existingCounts = countAssignmentsByClassSubject(lockedAssignments);
  const tasks = [];

  config.classes.forEach((schoolClass, classIndex) => {
    config.subjects.forEach((subject, subjectIndex) => {
      const countKey = `${schoolClass.id}:${subject.id}`;
      const remaining = Math.max(Number(subject.weeklyLessons || 0) - (existingCounts.get(countKey) || 0), 0);
      const taskTeacherIds = Array.isArray(subject.classTeacherIds?.[schoolClass.id]) && subject.classTeacherIds[schoolClass.id].length
        ? subject.classTeacherIds[schoolClass.id]
        : subject.teacherIds || [];
      for (let index = 0; index < remaining; index += 1) {
        const lessonNumber = (existingCounts.get(countKey) || 0) + 1;
        const nextId = nextAssignmentId(usedIds, schoolClass.id, subject.id, lessonNumber);
        const requiredRoomType = normalizeRoomType(subject.requiredRoomType, "homeroom");
        const roomConstraintWeight = requiredRoomType === "homeroom" ? 0 : 100;
        const dailyCapWeight = Number(subject.maxPerClassPerDay || 0) > 0 ? 70 : 0;
        const noConsecutiveWeight = subject.allowConsecutive === false ? 50 : 0;
        const preferredSlotWeight = Array.isArray(subject.preferredPeriods) && subject.preferredPeriods.length ? 20 : 0;
        existingCounts.set(countKey, nextId.index);
        tasks.push({
          id: nextId.id,
          classId: schoolClass.id,
          className: schoolClass.name,
          classIndex,
          room: schoolClass.room,
          roomId: schoolClass.roomId,
          subjectId: subject.id,
          subjectName: subject.name,
          subjectIndex,
          subject,
          teacherIds: taskTeacherIds,
          durationMinutes: subject.durationMinutes || DEFAULT_LESSON_DURATION_MINUTES,
          requiredRoomType,
          difficulty:
            100 +
            roomConstraintWeight +
            dailyCapWeight +
            noConsecutiveWeight +
            preferredSlotWeight -
            Math.min(taskTeacherIds.length, 12) * 5 +
            Number(subject.weeklyLessons || 0) * 3,
        });
      }
    });
  });

  return tasks;
}

function assignmentFromCandidate(config, task, candidate) {
  const room = roomById(config, candidate.roomId || task.roomId);
  return {
    id: task.id,
    classId: task.classId,
    className: task.className,
    subjectId: task.subjectId,
    subjectName: task.subjectName,
    durationMinutes: task.durationMinutes,
    teacherId: candidate.teacherId,
    teacherName: teacherName(config, candidate.teacherId),
    date: candidate.slot.date,
    dayIndex: candidate.slot.dayIndex,
    period: candidate.slot.period,
    time: candidate.slot.time,
    room: room?.name || task.room,
    roomId: room?.id || candidate.roomId || task.roomId,
    roomType: room?.roomType || task.requiredRoomType || "homeroom",
  };
}

function candidateSoftScore(config, state, task, slot, teacherId, random) {
  const teacherLoad = state.teacherLoad.get(teacherId) || 0;
  const teacherDayLoad = state.teacherDayLoad.get(teacherDayKey(teacherId, slot.date)) || 0;
  const classDayLoad = state.classDayLoad.get(classDayKey(task.classId, slot.date)) || 0;
  const sameSubjectDay = state.classSubjectDay.get(classSubjectDayKey(task.classId, task.subjectId, slot.date)) || 0;
  const periods = state.teacherDayPeriods.get(teacherDayPeriodKey(teacherId, slot.date)) || [];
  const targetClassDayLoad = Math.ceil(weeklyLessonsPerClass(config) / 5);
  const classOverload = Math.max(0, classDayLoad + 1 - targetClassDayLoad);
  const compactnessPenalty = projectedGapCount(periods, slot.period);

  return (
    teacherLoad * 18 +
    teacherDayLoad * 7 +
    classDayLoad * 5 +
    classOverload * 18 +
    sameSubjectDay * 24 +
    compactnessPenalty * 4 +
    teacherPeriodPreferencePenalty(config, teacherId, slot.period) +
    subjectRulePreferencePenalty(task.subject, slot.period) +
    periodSoftPenalty(task.subject, slot.period) +
    slot.dayIndex * 0.35 +
    random() * 2.5
  );
}

function buildCandidateList(config, state, task, slots, random) {
  if (!task.teacherIds.length) return [];
  const candidates = [];

  const candidateRooms = roomsForTask(config, task);
  if (!candidateRooms.length) return [];

  slots.forEach((slot) => {
    if (state.classBusy.get(task.classId)?.has(slot.slotKey)) return;
    if (firstScheduleConstraintViolation(config, task.subjectId, slot)) return;
    if (subjectHardRuleViolation(config, task.subjectId, slot, state.assignments, task.classId)) return;

    candidateRooms.forEach((room) => {
      if ((state.roomBusy.get(room.id) || new Set()).has(slot.slotKey)) return;
      task.teacherIds.forEach((teacherId) => {
        if ((state.teacherBusy.get(teacherId) || new Set()).has(slot.slotKey)) return;
        const teacherDayLoad = state.teacherDayLoad.get(teacherDayKey(teacherId, slot.date)) || 0;
        const teacherPeriods = state.teacherDayPeriods.get(teacherDayPeriodKey(teacherId, slot.date)) || [];
        if (teacherHardRuleViolation(config, teacherId, slot, teacherDayLoad, teacherPeriods)) return;
        candidates.push({
          slot,
          teacherId,
          roomId: room.id,
          score: candidateSoftScore(config, state, task, slot, teacherId, random),
        });
      });
    });
  });

  return candidates.sort((a, b) => a.score - b.score);
}

function scheduleQualityScore(config, assignments) {
  const teacherLoad = new Map(config.teachers.map((teacher) => [teacher.id, 0]));
  const teacherDayLoad = new Map();
  const classDayLoad = new Map();
  const classSubjectDay = new Map();
  const teacherDayPeriods = new Map();
  let score = 0;

  assignments.forEach((assignment) => {
    const subject = config.subjects.find((item) => item.id === assignment.subjectId) || {};
    incrementMap(teacherLoad, assignment.teacherId);
    incrementMap(teacherDayLoad, teacherDayKey(assignment.teacherId, assignment.date));
    incrementMap(classDayLoad, classDayKey(assignment.classId, assignment.date));
    incrementMap(classSubjectDay, classSubjectDayKey(assignment.classId, assignment.subjectId, assignment.date));
    const periodKey = teacherDayPeriodKey(assignment.teacherId, assignment.date);
    if (!teacherDayPeriods.has(periodKey)) teacherDayPeriods.set(periodKey, []);
    teacherDayPeriods.get(periodKey).push(Number(assignment.period));
    score += periodSoftPenalty(subject, Number(assignment.period));
    score += teacherPeriodPreferencePenalty(config, assignment.teacherId, Number(assignment.period));
    score += subjectRulePreferencePenalty(subject, Number(assignment.period));
  });

  const targetClassDayLoad = Math.ceil(weeklyLessonsPerClass(config) / 5);
  classDayLoad.forEach((count) => {
    score += Math.abs(count - targetClassDayLoad) * 4;
    score += Math.max(0, count - targetClassDayLoad) * 12;
  });
  classSubjectDay.forEach((count) => {
    score += Math.max(0, count - 1) * 18;
    score += Math.max(0, count - 2) * 1000;
  });
  teacherDayLoad.forEach((count) => {
    score += Math.max(0, count - 4) * 10;
  });
  teacherDayPeriods.forEach((periods) => {
    score += projectedGapCount(periods) * 3;
  });

  score += standardDeviation(mapValues(teacherLoad)) * 40;
  return score;
}

function buildScheduleQualityReport(config, assignments = [], conflicts = [], meta = {}) {
  const deductions = [];
  const addDeduction = (key, title, impact, text, lessonIds = []) => {
    if (impact <= 0) return;
    const lessonRefs = lessonIds
      .slice(0, 8)
      .map((lessonId) => assignments.find((assignment) => assignment.id === lessonId))
      .filter(Boolean)
      .map((assignment) => ({
        id: assignment.id,
        className: assignment.className,
        subjectName: assignment.subjectName,
        teacherName: assignment.teacherName,
        room: assignment.room,
        date: assignment.date,
        period: assignment.period,
        time: assignment.time,
      }));
    deductions.push({
      key,
      title,
      impact: Math.round(impact * 10) / 10,
      text,
      lessonIds: lessonIds.slice(0, 12),
      lessons: lessonRefs,
    });
  };

  const teacherLoad = new Map(config.teachers.map((teacher) => [teacher.id, 0]));
  const teacherDayLoad = new Map();
  const teacherDayPeriods = new Map();
  const classDayLoad = new Map();
  const classSubjectDay = new Map();
  const lateMainSubjectLessons = [];
  const avoidPeriodLessons = [];
  const nonPreferredLessons = [];

  assignments.forEach((assignment) => {
    const subject = config.subjects.find((item) => item.id === assignment.subjectId) || {};
    const period = Number(assignment.period);
    incrementMap(teacherLoad, assignment.teacherId);
    incrementMap(teacherDayLoad, teacherDayKey(assignment.teacherId, assignment.date));
    incrementMap(classDayLoad, classDayKey(assignment.classId, assignment.date));
    incrementMap(classSubjectDay, classSubjectDayKey(assignment.classId, assignment.subjectId, assignment.date));
    const periodKey = teacherDayPeriodKey(assignment.teacherId, assignment.date);
    if (!teacherDayPeriods.has(periodKey)) teacherDayPeriods.set(periodKey, []);
    teacherDayPeriods.get(periodKey).push(period);

    if (["chinese", "math", "english"].includes(assignment.subjectId) && period > 4) {
      lateMainSubjectLessons.push(assignment.id);
    }
    const rule = teacherScheduleRuleFor(config, assignment.teacherId);
    if ((rule?.avoidPeriods || []).map(Number).includes(period)) {
      avoidPeriodLessons.push(assignment.id);
    }
    if ((subject.preferredPeriods || []).length && !subject.preferredPeriods.map(Number).includes(period)) {
      nonPreferredLessons.push(assignment.id);
    }
  });

  const hardConflictCount = conflicts.length + Number(meta.unassignedCount || 0);
  addDeduction(
    "hard_conflicts",
    "硬冲突或未排课",
    hardConflictCount * 25,
    hardConflictCount ? `存在 ${conflicts.length} 个硬冲突，未排 ${Number(meta.unassignedCount || 0)} 节。` : "",
  );

  const teacherLoads = mapValues(teacherLoad);
  const teacherLoadGap = teacherLoads.length ? Math.max(...teacherLoads) - Math.min(...teacherLoads) : 0;
  addDeduction(
    "teacher_weekly_balance",
    "老师周课量不均衡",
    Math.min(12, teacherLoadGap * 1.5),
    `老师周课量最高和最低相差 ${teacherLoadGap} 节。`,
  );

  let teacherDailyOverload = 0;
  const dailyOverloadLessons = [];
  teacherDayLoad.forEach((count, key) => {
    const [teacherId] = key.split(":");
    const rule = teacherScheduleRuleFor(config, teacherId);
    const maxDailyLessons = Number(rule?.maxDailyLessons || 4);
    if (count > maxDailyLessons) {
      teacherDailyOverload += count - maxDailyLessons;
      dailyOverloadLessons.push(...assignments.filter((assignment) => teacherDayKey(assignment.teacherId, assignment.date) === key).map((assignment) => assignment.id));
    }
  });
  addDeduction(
    "teacher_daily_overload",
    "老师日课量偏高",
    Math.min(12, teacherDailyOverload * 2),
    `有 ${teacherDailyOverload} 节超过老师每日课量上限。`,
    dailyOverloadLessons,
  );

  let consecutiveOverage = 0;
  const consecutiveLessons = [];
  teacherDayPeriods.forEach((periods, key) => {
    const [teacherId, date] = key.split(":");
    const rule = teacherScheduleRuleFor(config, teacherId);
    const maxConsecutiveLessons = Number(rule?.maxConsecutiveLessons || 3);
    const run = maxConsecutiveRun(periods);
    if (run > maxConsecutiveLessons) {
      consecutiveOverage += run - maxConsecutiveLessons;
      consecutiveLessons.push(
        ...assignments
          .filter((assignment) => assignment.teacherId === teacherId && assignment.date === date)
          .map((assignment) => assignment.id),
      );
    }
  });
  addDeduction(
    "teacher_consecutive",
    "老师连续上课偏多",
    Math.min(10, consecutiveOverage * 2),
    `存在 ${consecutiveOverage} 节连续上课超出建议上限。`,
    consecutiveLessons,
  );

  let teacherGapCount = 0;
  const fragmentedLessons = [];
  teacherDayPeriods.forEach((periods, key) => {
    const [teacherId, date] = key.split(":");
    const gapCount = projectedGapCount(periods);
    if (gapCount > 0) {
      teacherGapCount += gapCount;
      fragmentedLessons.push(
        ...assignments
          .filter((assignment) => assignment.teacherId === teacherId && assignment.date === date)
          .map((assignment) => assignment.id),
      );
    }
  });
  addDeduction(
    "teacher_fragmentation",
    "老师课表碎片化",
    Math.min(8, teacherGapCount * 1.2),
    `老师当天课表中间空档累计 ${teacherGapCount} 个。`,
    fragmentedLessons,
  );

  const targetClassDayLoad = Math.ceil(weeklyLessonsPerClass(config) / 5);
  let classDailyGap = 0;
  classDayLoad.forEach((count) => {
    classDailyGap += Math.abs(count - targetClassDayLoad);
  });
  addDeduction(
    "class_daily_balance",
    "班级每日课量不均衡",
    Math.min(10, classDailyGap * 0.4),
    `班级每日课量与建议值累计偏差 ${Math.round(classDailyGap)}。`,
  );

  let sameSubjectSameDay = 0;
  const concentratedLessons = [];
  classSubjectDay.forEach((count, key) => {
    if (count > 1) {
      sameSubjectSameDay += count - 1;
      const [classId, subjectId, date] = key.split(":");
      concentratedLessons.push(
        ...assignments
          .filter((assignment) => assignment.classId === classId && assignment.subjectId === subjectId && assignment.date === date)
          .map((assignment) => assignment.id),
      );
    }
  });
  addDeduction(
    "subject_concentration",
    "同班同科过度集中",
    Math.min(10, sameSubjectSameDay * 1.5),
    `同一班同一科同日重复 ${sameSubjectSameDay} 次。`,
    concentratedLessons,
  );

  addDeduction(
    "main_subject_morning",
    "主科上午分布不足",
    Math.min(8, lateMainSubjectLessons.length * 0.6),
    `语文/数学/英语有 ${lateMainSubjectLessons.length} 节排在下午或较晚节次。`,
    lateMainSubjectLessons,
  );
  addDeduction(
    "teacher_avoid_period",
    "命中老师避开时段",
    Math.min(8, avoidPeriodLessons.length * 1.5),
    `有 ${avoidPeriodLessons.length} 节课落在老师尽量避免的时段。`,
    avoidPeriodLessons,
  );
  addDeduction(
    "subject_preference",
    "课程偏好时段未满足",
    Math.min(6, nonPreferredLessons.length * 0.8),
    `有 ${nonPreferredLessons.length} 节课未落在课程偏好时段。`,
    nonPreferredLessons,
  );

  const totalDeduction = deductions.reduce((sum, item) => sum + item.impact, 0);
  const score = Math.max(0, Math.round(100 - totalDeduction));
  return {
    score,
    maxScore: 100,
    hardConflictCount,
    unmetPreferenceCount: deductions.filter((item) => item.key !== "hard_conflicts").length,
    totalDeduction: Math.round(totalDeduction * 10) / 10,
    resourceTension: buildScheduleResourceTension(config, assignments, meta),
    deductions: deductions.sort((a, b) => b.impact - a.impact),
  };
}

function buildScheduleResourceTension(config, assignments = [], meta = {}) {
  const slots = schedulingSlots(config);
  const externalAssignments = meta.externalAssignments || [];
  const teacherRows = (config.teachers || [])
    .map((teacher) => {
      const assignedLessons = assignments.filter((assignment) => assignment.teacherId === teacher.id).length;
      const capacity = Math.max(1, teacherWeeklyCapacity(config, teacher.id));
      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        subject: teacher.subject || teacher.primarySubjectName || "",
        assignedLessons,
        capacity,
        utilization: Math.round((assignedLessons / capacity) * 100),
      };
    })
    .filter((item) => item.assignedLessons > 0)
    .sort((a, b) => b.utilization - a.utilization || b.assignedLessons - a.assignedLessons)
    .slice(0, 6);

  const allRoomRows = (config.rooms || []).map((room) => {
    const assignedLessons = assignments.filter((assignment) => assignment.roomId === room.id).length;
    const capacity = Math.max(1, slots.length * Number(room.capacity || 1));
    return {
      roomId: room.id,
      roomName: room.name,
      roomType: normalizeRoomType(room.roomType || room.type, "homeroom"),
      roomTypeName: room.roomTypeName || roomTypeName(room.roomType || room.type),
      assignedLessons,
      capacity,
      utilization: Math.round((assignedLessons / capacity) * 100),
    };
  });
  const roomRows = allRoomRows
    .filter((item) => item.assignedLessons > 0 || item.roomType !== "homeroom")
    .sort((a, b) => b.utilization - a.utilization || b.assignedLessons - a.assignedLessons)
    .slice(0, 6);

  const roomTypeRows = Array.from(
    allRoomRows.reduce((map, room) => {
      const existing = map.get(room.roomType) || {
        roomType: room.roomType,
        roomTypeName: room.roomTypeName,
        assignedLessons: 0,
        capacity: 0,
        roomCount: 0,
      };
      existing.assignedLessons += room.assignedLessons;
      existing.capacity += room.capacity;
      existing.roomCount += 1;
      map.set(room.roomType, existing);
      return map;
    }, new Map()).values(),
  )
    .map((row) => ({
      ...row,
      utilization: Math.round((row.assignedLessons / Math.max(1, row.capacity)) * 100),
    }))
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 6);

  const candidateState = createSolverState(config, [], externalAssignments);
  const candidateTasks = buildScheduleTasks(config, [])
    .map((task) => {
      const candidates = buildCandidateList(
        config,
        candidateState,
        task,
        slots,
        seededRandom(hashString(`${config.termId}:${config.divisionId}:${config.gradeId}:${task.id}:diagnostic`)),
      );
      return {
        taskId: task.id,
        className: task.className,
        subjectName: task.subjectName,
        teacherPoolSize: task.teacherIds.length,
        requiredRoomType: task.requiredRoomType,
        requiredRoomTypeName: roomTypeName(task.requiredRoomType),
        candidateCount: candidates.length,
        risk: candidates.length === 0 ? "blocked" : candidates.length <= 3 ? "tight" : candidates.length <= 8 ? "watch" : "ok",
      };
    })
    .sort((a, b) => a.candidateCount - b.candidateCount || a.className.localeCompare(b.className, "zh-CN"))
    .slice(0, 8);

  return {
    teachers: teacherRows,
    rooms: roomRows,
    roomTypes: roomTypeRows,
    candidateTasks,
  };
}

function solveScheduleAttempt(config, tasks, options, attemptIndex, deadline) {
  const random = seededRandom(options.seed + attemptIndex * 9973);
  const slots = [...options.slots].sort(() => random() - 0.5);
  const state = createSolverState(config, options.lockedAssignments, options.externalAssignments);
  const remaining = [...tasks].sort((a, b) => b.difficulty - a.difficulty || random() - 0.5);
  let nodes = 0;
  let stoppedByLimit = false;
  let bestAssignments = state.assignments.map((assignment) => ({ ...assignment }));

  function rememberBest() {
    if (state.assignments.length > bestAssignments.length) {
      bestAssignments = state.assignments.map((assignment) => ({ ...assignment }));
    }
  }

  function chooseTask() {
    let selected = null;
    for (let index = 0; index < remaining.length; index += 1) {
      const task = remaining[index];
      const candidates = buildCandidateList(config, state, task, slots, random);
      const weight = candidates.length * 100 - task.difficulty;
      if (!selected || weight < selected.weight) {
        selected = { index, task, candidates, weight };
        if (candidates.length === 0) break;
      }
    }
    return selected;
  }

  function search() {
    if (!remaining.length) return true;
    if (Date.now() > deadline || nodes >= options.maxNodesPerAttempt) {
      stoppedByLimit = true;
      return false;
    }
    nodes += 1;

    const selected = chooseTask();
    if (!selected || selected.candidates.length === 0) return false;

    const [task] = remaining.splice(selected.index, 1);
    const branchLimit = Math.min(
      selected.candidates.length,
      options.candidateLimit + (remaining.length < 24 ? 6 : 0),
    );

    for (let index = 0; index < branchLimit; index += 1) {
      const assignment = assignmentFromCandidate(config, task, selected.candidates[index]);
      state.assignments.push(assignment);
      markSolverAssignment(state, assignment);
      rememberBest();

      if (search()) return true;

      unmarkSolverAssignment(state, assignment);
      state.assignments.pop();
      if (stoppedByLimit) break;
    }

    remaining.splice(selected.index, 0, task);
    return false;
  }

  const success = search();
  const assignments = (success ? state.assignments : bestAssignments).map((assignment) => ({ ...assignment }));
  return {
    assignments,
    success,
    nodes,
    stoppedByLimit,
    score: scheduleQualityScore(config, assignments),
  };
}

function solveGreedyScheduleConstruction(config, tasks, options, attemptIndex, deadline) {
  const random = seededRandom(options.seed + 0x9e3779b9 + attemptIndex * 7919);
  const slots = [...options.slots].sort(() => random() - 0.5);
  const state = createSolverState(config, options.lockedAssignments, options.externalAssignments);
  const remaining = [...tasks].sort((a, b) => b.difficulty - a.difficulty || random() - 0.5);
  let nodes = 0;
  let stoppedByLimit = false;
  let skippedCount = 0;

  while (remaining.length) {
    if (Date.now() > deadline || nodes >= options.maxNodesPerAttempt) {
      stoppedByLimit = true;
      break;
    }
    nodes += 1;

    let selected = null;
    for (let index = 0; index < remaining.length; index += 1) {
      const task = remaining[index];
      const candidates = buildCandidateList(config, state, task, slots, random);
      const zeroCandidatePenalty = candidates.length ? 0 : 100000;
      const weight = zeroCandidatePenalty + candidates.length * 100 - task.difficulty + random() * 1.5;
      if (!selected || weight < selected.weight) {
        selected = { index, task, candidates, weight };
        if (candidates.length === 1) break;
      }
    }

    if (!selected) break;

    remaining.splice(selected.index, 1);
    if (!selected.candidates.length) {
      skippedCount += 1;
      continue;
    }

    const candidateWindow = Math.min(
      selected.candidates.length,
      Math.max(1, Number(options.greedyCandidateWindow || 1)),
    );
    const candidateIndex = attemptIndex === 0 ? 0 : Math.floor(random() * candidateWindow);
    const assignment = assignmentFromCandidate(config, selected.task, selected.candidates[candidateIndex]);
    state.assignments.push(assignment);
    markSolverAssignment(state, assignment);
  }

  const success = remaining.length === 0 && skippedCount === 0 && !stoppedByLimit;
  return {
    assignments: state.assignments.map((assignment) => ({ ...assignment })),
    success,
    nodes,
    stoppedByLimit,
    skippedCount,
    score: scheduleQualityScore(config, state.assignments),
  };
}

function buildScheduleDiagnostics(config, options = {}) {
  return buildSchedulePrecheck(config, options).checks.slice(0, 12);
}

function precheckItem(severity, key, title, text, details = {}) {
  return { severity, key, title, text, details };
}

function teacherWeeklyCapacity(config, teacherId) {
  const rule = teacherScheduleRuleFor(config, teacherId);
  return Number(rule?.maxDailyLessons || 4) * 5;
}

export function buildSchedulePrecheck(config, options = {}) {
  const lockedAssignments = (options.lockedAssignments || [])
    .filter((assignment) => assignment.locked)
    .map((assignment) => normalizeLockedAssignment(config, assignment));
  const externalAssignments = options.externalAssignments || [];
  const slots = schedulingSlots(config);
  const checks = [];

  if (!(config.classes || []).length) {
    checks.push(
      precheckItem(
        "error",
        "class_empty",
        "当前年级没有可排班级",
        "请先维护年级班级结构，至少保留 1 个有效班级。",
      ),
    );
  }

  if (!(config.subjects || []).length) {
    checks.push(
      precheckItem(
        "error",
        "subject_empty",
        "当前年级没有启用课程",
        "请先维护年级课程，并确认每门课周课时大于 0。",
      ),
    );
  }

  const missingTeacherCells = missingTeacherAssignmentCells(config);
  if (missingTeacherCells.length) {
    checks.push(
      precheckItem(
        "error",
        "class_subject_teacher_missing",
        "存在班级任课老师未配置",
        `还有 ${missingTeacherCells.length} 个班级课程没有指定任课老师，请先在“班级任课老师”中补齐。`,
        { missingTeacherAssignments: missingTeacherCells.slice(0, 20), missingCount: missingTeacherCells.length },
      ),
    );
  }

  const weeklyPerClass = weeklyLessonsPerClass(config);
  if (weeklyPerClass > slots.length) {
    checks.push(
      precheckItem(
        "error",
        "class_weekly_capacity",
        "班级周课时超过可用时段",
        `当前每班每周需要 ${weeklyPerClass} 节，但一周只有 ${slots.length} 个可排时段，请减少课程课时或增加时段。`,
        { weeklyPerClass, availableSlots: slots.length },
      ),
    );
  }

  const lockedConflicts = validateScheduleConflicts(lockedAssignments, { externalAssignments, config });
  lockedConflicts.slice(0, 5).forEach((conflict, index) => {
    checks.push(
      precheckItem(
        "error",
        `locked_conflict_${index + 1}`,
        `已锁定课节存在冲突：${conflict.title}`,
        conflict.text,
        { conflict },
      ),
    );
  });

  config.subjects.forEach((subject) => {
    if (!subject.teacherIds?.length) {
      checks.push(
        precheckItem(
          "error",
          `subject_teacher_empty_${subject.id}`,
          `${subject.name} 没有可排老师`,
          "请先为当前年级各班配置该科目的任课老师，否则该科目无法生成排课。",
          { subjectId: subject.id },
        ),
      );
      return;
    }

    const maxPerClassPerDay = Number(subject.maxPerClassPerDay || 0);
    if (maxPerClassPerDay > 0 && Number(subject.weeklyLessons || 0) > maxPerClassPerDay * 5) {
      checks.push(
        precheckItem(
          "error",
          `subject_daily_capacity_${subject.id}`,
          `${subject.name} 周课时超过每日上限容量`,
          `${subject.name} 每班每周需要 ${subject.weeklyLessons} 节，但设置为每班每天最多 ${maxPerClassPerDay} 节，5 天最多只能排 ${maxPerClassPerDay * 5} 节。`,
          { subjectId: subject.id, weeklyLessons: subject.weeklyLessons, maxPerClassPerDay },
        ),
      );
    }

    const demand = config.classes.length * Number(subject.weeklyLessons || 0);
    const requiredRoomType = normalizeRoomType(subject.requiredRoomType, "homeroom");
    const candidateRooms =
      requiredRoomType === "homeroom"
        ? config.classes.map((schoolClass) => roomById(config, schoolClass.roomId)).filter(Boolean)
        : (config.rooms || []).filter((room) => normalizeRoomType(room.roomType || room.type, "homeroom") === requiredRoomType);
    if (!candidateRooms.length) {
      checks.push(
        precheckItem(
          "error",
          `subject_room_empty_${subject.id}`,
          `${subject.name} 缺少${roomTypeName(requiredRoomType)}`,
          `${subject.name} 已设置需要${roomTypeName(requiredRoomType)}，但当前学部没有可用教室，请新增或调整课程教室要求。`,
          { subjectId: subject.id, requiredRoomType },
        ),
      );
    } else if (requiredRoomType === "homeroom" && candidateRooms.length < config.classes.length) {
      checks.push(
        precheckItem(
          "error",
          `subject_homeroom_missing_${subject.id}`,
          `${subject.name} 有班级缺少普通教室`,
          `${subject.name} 需要普通教室，但当前只有 ${candidateRooms.length}/${config.classes.length} 个班级绑定了可用教室，请先维护班级教室。`,
          { subjectId: subject.id, requiredRoomType, roomCount: candidateRooms.length, classCount: config.classes.length },
        ),
      );
    } else if (requiredRoomType !== "homeroom" && demand > candidateRooms.length * slots.length) {
      checks.push(
        precheckItem(
          "error",
          `subject_room_capacity_${subject.id}`,
          `${subject.name} ${roomTypeName(requiredRoomType)}容量不足`,
          `${subject.name} 本周需要 ${demand} 节，当前 ${candidateRooms.length} 间${roomTypeName(requiredRoomType)}最多提供 ${candidateRooms.length * slots.length} 个课位，请增加教室或减少课时。`,
          { subjectId: subject.id, requiredRoomType, demand, roomCount: candidateRooms.length, availableRoomSlots: candidateRooms.length * slots.length },
        ),
      );
    } else if (requiredRoomType !== "homeroom" && demand > candidateRooms.length * slots.length * 0.75) {
      checks.push(
        precheckItem(
          "warning",
          `subject_room_capacity_tight_${subject.id}`,
          `${subject.name} ${roomTypeName(requiredRoomType)}容量偏紧`,
          `${subject.name} 本周需要 ${demand} 节，当前 ${candidateRooms.length} 间${roomTypeName(requiredRoomType)}可用容量约 ${candidateRooms.length * slots.length} 个课位，排课可能较紧。`,
          { subjectId: subject.id, requiredRoomType, demand, roomCount: candidateRooms.length },
        ),
      );
    }

    const weeklyCapacity = Array.from(new Set(subject.teacherIds)).reduce(
      (sum, teacherId) => sum + teacherWeeklyCapacity(config, teacherId),
      0,
    );
    if (weeklyCapacity > 0 && demand > weeklyCapacity) {
      checks.push(
        precheckItem(
          "error",
          `subject_teacher_capacity_${subject.id}`,
          `${subject.name} 任课老师容量不足`,
          `本年级需要 ${demand} 节，当前任课老师按每日上限估算最多 ${weeklyCapacity} 节，请增加老师或放宽课量上限。`,
          { subjectId: subject.id, demand, weeklyCapacity },
        ),
      );
    } else if (weeklyCapacity > 0 && demand > weeklyCapacity * 0.85) {
      checks.push(
        precheckItem(
          "warning",
          `subject_teacher_capacity_tight_${subject.id}`,
          `${subject.name} 任课老师容量偏紧`,
          `本年级需要 ${demand} 节，当前任课老师容量约 ${weeklyCapacity} 节，排课可能较慢且质量分偏低。`,
          { subjectId: subject.id, demand, weeklyCapacity },
        ),
      );
    }
  });

  const roomTypeDemand = new Map();
  config.subjects.forEach((subject) => {
    const requiredRoomType = normalizeRoomType(subject.requiredRoomType, "homeroom");
    if (requiredRoomType === "homeroom") return;
    const demand = config.classes.length * Number(subject.weeklyLessons || 0);
    roomTypeDemand.set(requiredRoomType, (roomTypeDemand.get(requiredRoomType) || 0) + demand);
  });

  roomTypeDemand.forEach((demand, requiredRoomType) => {
    const candidateRooms = (config.rooms || []).filter(
      (room) => normalizeRoomType(room.roomType || room.type, "homeroom") === requiredRoomType,
    );
    const capacity = candidateRooms.length * slots.length;
    if (demand > capacity) {
      checks.push(
        precheckItem(
          "error",
          `room_type_capacity_${requiredRoomType}`,
          `${roomTypeName(requiredRoomType)}总容量不足`,
          `所有需要${roomTypeName(requiredRoomType)}的课程本周合计 ${demand} 节，当前 ${candidateRooms.length} 间${roomTypeName(requiredRoomType)}最多提供 ${capacity} 个课位，请增加教室、减少课时或调整课程教室要求。`,
          { requiredRoomType, demand, roomCount: candidateRooms.length, availableRoomSlots: capacity },
        ),
      );
    } else if (demand > capacity * 0.8) {
      checks.push(
        precheckItem(
          "warning",
          `room_type_capacity_tight_${requiredRoomType}`,
          `${roomTypeName(requiredRoomType)}总容量偏紧`,
          `所有需要${roomTypeName(requiredRoomType)}的课程本周合计 ${demand} 节，当前容量 ${capacity} 个课位，排课会更依赖算法质量和禁排配置。`,
          { requiredRoomType, demand, roomCount: candidateRooms.length, availableRoomSlots: capacity },
        ),
      );
    }
  });

  const state = createSolverState(config, lockedAssignments, externalAssignments);
  const tasks = buildScheduleTasks(config, lockedAssignments);
  let zeroCandidateCount = 0;
  let tightCandidateCount = 0;
  tasks.forEach((task) => {
    const candidates = buildCandidateList(config, state, task, slots, seededRandom(hashString(task.id)));
    if (!candidates.length) {
      zeroCandidateCount += 1;
      if (zeroCandidateCount <= 8) {
        checks.push(
          precheckItem(
            "error",
            `task_candidate_empty_${task.id}`,
            `${task.className} ${task.subjectName} 没有可用候选`,
            "当前任课老师、老师不可用时间、教室/班级占用或课程硬约束共同作用后，没有任何可排时段。",
            { taskId: task.id, classId: task.classId, subjectId: task.subjectId },
          ),
        );
      }
    } else if (candidates.length <= 3) {
      tightCandidateCount += 1;
      if (tightCandidateCount <= 5) {
        checks.push(
          precheckItem(
            "warning",
            `task_candidate_tight_${task.id}`,
            `${task.className} ${task.subjectName} 可选位置偏少`,
            `当前只剩 ${candidates.length} 个可用候选，建议放宽禁排或增加老师池，避免后续排课质量较低。`,
            { taskId: task.id, classId: task.classId, subjectId: task.subjectId, candidateCount: candidates.length },
          ),
        );
      }
    }
  });

  if (zeroCandidateCount > 8) {
    checks.push(
      precheckItem(
        "error",
        "task_candidate_empty_more",
        `还有 ${zeroCandidateCount - 8} 个课时任务没有可用候选`,
        "请优先检查老师池、课程禁排、老师不可用时间和锁定课节。",
        { zeroCandidateCount },
      ),
    );
  }

  if (!checks.length) {
    checks.push(
      precheckItem(
        "ok",
        "schedule_precheck_ok",
        "排课准备度正常",
        "任课配置、硬约束和全校老师时间线具备可行候选，若仍然求解失败，优先检查锁定课过多或软约束过紧。",
        { taskCount: tasks.length, requiredLessonCount: requiredScheduleLessonCount(config) },
      ),
    );
  }

  const blockingCount = checks.filter((check) => check.severity === "error").length;
  const warningCount = checks.filter((check) => check.severity === "warning").length;
  return {
    status: blockingCount ? "blocked" : warningCount ? "warning" : "ok",
    blockingCount,
    warningCount,
    taskCount: tasks.length,
    requiredLessonCount: requiredScheduleLessonCount(config),
    checks,
  };
}

export function previewSchedulePrecheck(db, options = {}) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  const externalAssignments = globalTeacherBusyAssignments(db, config);
  return {
    config,
    precheck: buildSchedulePrecheck(config, { externalAssignments }),
  };
}

function assertSchedulePrecheckPasses(precheck) {
  if (!precheck?.blockingCount) return;
  const firstError = (precheck.checks || []).find((check) => check.severity === "error");
  const error = new Error(`排课前预检未通过：${firstError?.title || "存在阻塞项"}`);
  error.statusCode = 400;
  error.details = { precheck };
  throw error;
}

function normalizeScheduleDiagnostic(diagnostic, index = 0, prefix = "diagnostic") {
  const severity = ["error", "warning", "info", "ok"].includes(diagnostic?.severity)
    ? diagnostic.severity
    : "warning";
  return {
    severity,
    key: diagnostic?.key || `${prefix}_${index}`,
    title: diagnostic?.title || "排课诊断",
    text: diagnostic?.text || diagnostic?.message || "求解器返回了一条排课诊断信息。",
    details: diagnostic?.details || {},
  };
}

function mergeScheduleDiagnostics(...diagnosticGroups) {
  const merged = [];
  const seen = new Set();
  diagnosticGroups.flat().filter(Boolean).forEach((diagnostic, index) => {
    const normalized = normalizeScheduleDiagnostic(diagnostic, index);
    const key = normalized.key || `${normalized.title}:${normalized.text}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(normalized);
  });
  return merged;
}

function generateHeuristicScheduleSolution(config, options = {}) {
  const lockedAssignments = (options.lockedAssignments || [])
    .filter((assignment) => assignment.locked)
    .map((assignment) => normalizeLockedAssignment(config, assignment));
  const externalAssignments = options.externalAssignments || [];
  const tasks = buildScheduleTasks(config, lockedAssignments);
  const solverOptions = {
    ...ADVANCED_SOLVER_DEFAULTS,
    ...(options.solver || {}),
  };
  const seed =
    options.seed ||
    hashString(`${config.termId}:${config.divisionId}:${config.gradeId}:${config.weekStart}:${tasks.length}:${externalAssignments.length}`);
  const startedAt = Date.now();
  const deadline = startedAt + solverOptions.timeoutMs;
  const requiredCount = requiredScheduleLessonCount(config);
  let best = null;
  let attemptsRun = 0;
  let greedyAttemptsRun = 0;
  let backtrackingAttemptsRun = 0;
  let totalNodes = 0;

  function recordAttempt(attempt) {
    attemptsRun += 1;
    totalNodes += attempt.nodes;
    const conflicts = validateScheduleConflicts(attempt.assignments, { externalAssignments, config });
    const unassignedCount = Math.max(requiredCount - attempt.assignments.length, 0);
    const quality = unassignedCount * 100000 + conflicts.length * 25000 + attempt.score;
    if (!best || quality < best.quality) {
      best = {
        ...attempt,
        conflicts,
        unassignedCount,
        quality,
      };
    }
  }

  const greedyAttemptLimit = Math.max(1, Number(solverOptions.greedyAttempts || 0));
  for (let attemptIndex = 0; attemptIndex < greedyAttemptLimit; attemptIndex += 1) {
    if (Date.now() > deadline && best) break;
    const attempt = solveGreedyScheduleConstruction(
      config,
      tasks,
      {
        ...solverOptions,
        lockedAssignments,
        externalAssignments,
        slots: schedulingSlots(config),
        seed,
      },
      attemptIndex,
      deadline,
    );
    greedyAttemptsRun += 1;
    recordAttempt(attempt);
    if (best.unassignedCount === 0 && best.conflicts.length === 0 && Date.now() > startedAt + solverOptions.timeoutMs * 0.35) {
      break;
    }
  }

  for (let attemptIndex = 0; attemptIndex < solverOptions.attempts; attemptIndex += 1) {
    if (Date.now() > deadline && best) break;
    const attempt = solveScheduleAttempt(
      config,
      tasks,
      {
        ...solverOptions,
        lockedAssignments,
        externalAssignments,
        slots: schedulingSlots(config),
        seed,
      },
      attemptIndex,
      deadline,
    );
    backtrackingAttemptsRun += 1;
    recordAttempt(attempt);
    if (best.unassignedCount === 0 && best.conflicts.length === 0 && Date.now() > startedAt + solverOptions.timeoutMs * 0.55) {
      break;
    }
  }

  const assignments = (best?.assignments || lockedAssignments).sort((a, b) =>
    `${a.classId} ${a.date} ${a.period}`.localeCompare(`${b.classId} ${b.date} ${b.period}`),
  );
  const conflicts = best?.conflicts || validateScheduleConflicts(assignments, { externalAssignments, config });
  const unassignedCount = Math.max(requiredCount - assignments.length, 0);
  const qualityReport = buildScheduleQualityReport(config, assignments, conflicts, { unassignedCount, externalAssignments });

  return {
    assignments,
    conflicts,
    meta: {
      algorithm: "advanced-constraint-search",
      description: "硬约束求解 + MRV 最难课节优先 + 多轮扰动搜索 + 有限回溯 + 软约束评分",
      attemptsRun,
      greedyAttemptsRun,
      backtrackingAttemptsRun,
      totalNodes,
      score: Math.round(best?.score || scheduleQualityScore(config, assignments)),
      qualityReport,
      unassignedCount,
      requiredLessonCount: requiredCount,
      generatedLessonCount: assignments.length,
      lockedCount: lockedAssignments.length,
      externalBusyCount: externalAssignments.length,
      diagnostics: options.precheck?.checks || buildScheduleDiagnostics(config, { lockedAssignments, externalAssignments }),
      timeoutMs: Date.now() - startedAt,
    },
  };
}

function solveScheduleWithOrTools(config, options = {}) {
  const lockedAssignments = (options.lockedAssignments || [])
    .filter((assignment) => assignment.locked)
    .map((assignment) => normalizeLockedAssignment(config, assignment));
  const externalAssignments = options.externalAssignments || [];
  const pythonBin = process.env.SCHEDULER_PYTHON || "python3";
  const payload = {
    config,
    lockedAssignments,
    externalAssignments,
    options: {
      timeLimitSeconds: Number(options.cpSatTimeLimitSeconds || options.solver?.cpSatTimeLimitSeconds || 30),
      workers: Number(options.cpSatWorkers || options.solver?.cpSatWorkers || 8),
      candidateLimit: Number(options.cpSatCandidateLimit || options.solver?.cpSatCandidateLimit || 300),
      twoStage: options.cpSatTwoStage ?? options.solver?.cpSatTwoStage ?? true,
      feasibilityTimeLimitSeconds: Number(
        options.cpSatFeasibilityTimeLimitSeconds ||
          options.solver?.cpSatFeasibilityTimeLimitSeconds ||
          0,
      ),
    },
  };

  const result = spawnSync(pythonBin, [ORTOOLS_SOLVER_PATH], {
    input: JSON.stringify(payload),
    encoding: "utf8",
    timeout: Number(options.cpSatProcessTimeoutMs || options.solver?.cpSatProcessTimeoutMs || 90000),
    maxBuffer: 1024 * 1024 * 8,
  });

  if (result.error) {
    return {
      ok: false,
      error: result.error.code === "ETIMEDOUT" ? "CP_SAT_TIMEOUT" : "CP_SAT_PROCESS_ERROR",
      message: result.error.message,
    };
  }

  if (result.status !== 0) {
    return {
      ok: false,
      error: "CP_SAT_PROCESS_FAILED",
      message: result.stderr || `Python solver exited with status ${result.status}`,
    };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout || "{}");
  } catch (error) {
    return {
      ok: false,
      error: "CP_SAT_INVALID_OUTPUT",
      message: error.message,
    };
  }

  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.error || "CP_SAT_FAILED",
      status: parsed.status || "UNKNOWN",
      phase: parsed.phase || "",
      diagnostics: parsed.diagnostics || [],
      message: parsed.message || "OR-Tools 求解器未返回可用课表",
    };
  }

  const requiredCount = requiredScheduleLessonCount(config);
  const diagnostics = mergeScheduleDiagnostics(
    options.precheck?.checks || buildScheduleDiagnostics(config, { lockedAssignments, externalAssignments }),
    parsed.diagnostics || [],
  );
  const assignments = (parsed.assignments || []).sort((a, b) =>
    `${a.classId} ${a.date} ${a.period}`.localeCompare(`${b.classId} ${b.date} ${b.period}`),
  );
  const conflicts = validateScheduleConflicts(assignments, { externalAssignments, config });
  const unassignedCount = Math.max(requiredCount - assignments.length, 0);
  const qualityReport = buildScheduleQualityReport(config, assignments, conflicts, { unassignedCount, externalAssignments });

  return {
    ok: true,
    assignments,
    conflicts,
    meta: {
      algorithm: "ortools-cp-sat",
      description: "Google OR-Tools CP-SAT 约束规划求解器",
      status: parsed.status || "UNKNOWN",
      phase: parsed.phase || "single_stage",
      phase1Status: parsed.phase1Status || "",
      phase2Status: parsed.phase2Status || "",
      objectiveValue: Number(parsed.objectiveValue || 0),
      bestObjectiveBound: Number(parsed.bestObjectiveBound || 0),
      score: qualityReport.score,
      solveTimeSeconds: Number(parsed.solveTimeSeconds || 0),
      phase1SolveTimeSeconds: Number(parsed.phase1SolveTimeSeconds || 0),
      phase2SolveTimeSeconds: Number(parsed.phase2SolveTimeSeconds || 0),
      branches: Number(parsed.branches || 0),
      conflicts: Number(parsed.conflicts || 0),
      wallTimeMs: Number(parsed.wallTimeMs || 0),
      qualityReport,
      unassignedCount,
      requiredLessonCount: requiredCount,
      generatedLessonCount: assignments.length,
      lockedCount: lockedAssignments.length,
      externalBusyCount: externalAssignments.length,
      diagnostics,
      python: pythonBin,
    },
  };
}

export function generateScheduleSolution(config, options = {}) {
  const shouldUseOrTools = options.engine !== "heuristic" && process.env.SCHEDULER_ENGINE !== "heuristic";
  const cpSatResult = shouldUseOrTools ? solveScheduleWithOrTools(config, options) : null;

  if (cpSatResult?.ok) {
    return {
      assignments: cpSatResult.assignments,
      conflicts: cpSatResult.conflicts,
      meta: cpSatResult.meta,
    };
  }

  const fallback = generateHeuristicScheduleSolution(config, options);
  if (cpSatResult && !cpSatResult.ok) {
    fallback.meta.fallbackFrom = "ortools-cp-sat";
    fallback.meta.fallbackReason = cpSatResult.error;
    fallback.meta.fallbackMessage = cpSatResult.message;
    fallback.meta.fallbackStatus = cpSatResult.status || "";
    fallback.meta.fallbackPhase = cpSatResult.phase || "";
    fallback.meta.diagnostics = mergeScheduleDiagnostics(
      options.precheck?.checks || buildScheduleDiagnostics(config, options),
      cpSatResult.diagnostics || [],
    );
  }
  return fallback;
}

export function generateScheduleAssignments(config, options = {}) {
  return generateScheduleSolution(config, options).assignments;
}

function generateGreedyScheduleAssignments(config, options = {}) {
  const slots = schedulingSlots(config);
  const externalAssignments = options.externalAssignments || [];
  const assignments = (options.lockedAssignments || [])
    .filter((assignment) => assignment.locked)
    .map((assignment) => normalizeLockedAssignment(config, assignment));
  const teacherBusy = new Map();
  const classBusy = new Map();
  const roomBusy = new Map();
  const teacherLoad = new Map(config.teachers.map((teacher) => [teacher.id, 0]));
  const usedIds = new Set(assignments.map((assignment) => assignment.id));

  externalAssignments.forEach((assignment) => {
    const busySlotKey = slotKeyFor(assignment.date, assignment.period);
    markBusy(teacherBusy, assignment.teacherId, busySlotKey);
    if (assignment.roomId || assignment.room) markBusy(roomBusy, assignment.roomId || assignment.room, busySlotKey);
    teacherLoad.set(assignment.teacherId, (teacherLoad.get(assignment.teacherId) || 0) + 1);
  });

  assignments.forEach((assignment) => {
    const busySlotKey = slotKeyFor(assignment.date, assignment.period);
    markBusy(classBusy, assignment.classId, busySlotKey);
    markBusy(teacherBusy, assignment.teacherId, busySlotKey);
    markBusy(roomBusy, assignment.roomId || assignment.room, busySlotKey);
    teacherLoad.set(assignment.teacherId, (teacherLoad.get(assignment.teacherId) || 0) + 1);
  });

  config.classes.forEach((schoolClass, classIndex) => {
    if (!classBusy.has(schoolClass.id)) classBusy.set(schoolClass.id, new Set());
    const existingCounts = countAssignmentsByClassSubject(assignments);
    const counters = new Map(
      config.subjects.map((subject) => [
        subject.id,
        Math.max(subject.weeklyLessons - (existingCounts.get(`${schoolClass.id}:${subject.id}`) || 0), 0),
      ]),
    );
    const subjectQueue = buildSubjectQueueFromCounters(config, classIndex, counters);

    subjectQueue.forEach((subject, lessonIndex) => {
      let best = null;

      slots.forEach((slot) => {
        if (classBusy.get(schoolClass.id).has(slot.slotKey)) return;
        const busyRooms = roomBusy.get(schoolClass.roomId) || new Set();
        if (busyRooms.has(slot.slotKey)) return;
        if (firstScheduleConstraintViolation(config, subject.id, slot)) return;
        if (subjectHardRuleViolation(config, subject.id, slot, assignments, schoolClass.id)) return;
        const sameSubjectDayCount = countClassSubjectOnDay(assignments, schoolClass.id, subject.id, slot.date);

        subject.teacherIds.forEach((teacherId) => {
          const busySlots = teacherBusy.get(teacherId) || new Set();
          if (busySlots.has(slot.slotKey)) return;

          const load = teacherLoad.get(teacherId) || 0;
          const score =
            load * 12 +
            sameSubjectDayCount * 8 +
            subjectRulePreferencePenalty(subject, slot.period) +
            slot.period +
            slot.dayIndex * 0.25;
          if (!best || score < best.score) {
            best = { slot, teacherId, score };
          }
        });
      });

      if (!best) return;

      const countKey = `${schoolClass.id}:${subject.id}`;
      const lessonNumber = (existingCounts.get(countKey) || 0) + 1;
      const nextId = nextAssignmentId(usedIds, schoolClass.id, subject.id, lessonNumber);
      existingCounts.set(countKey, nextId.index);
      const assignment = {
        id: nextId.id,
        classId: schoolClass.id,
        className: schoolClass.name,
        subjectId: subject.id,
        subjectName: subject.name,
        durationMinutes: subject.durationMinutes || DEFAULT_LESSON_DURATION_MINUTES,
        teacherId: best.teacherId,
        teacherName: teacherName(config, best.teacherId),
        date: best.slot.date,
        dayIndex: best.slot.dayIndex,
        period: best.slot.period,
        time: best.slot.time,
        room: schoolClass.room,
        roomId: schoolClass.roomId,
      };

      assignments.push(assignment);
      classBusy.get(schoolClass.id).add(best.slot.slotKey);
      if (!teacherBusy.has(best.teacherId)) teacherBusy.set(best.teacherId, new Set());
      teacherBusy.get(best.teacherId).add(best.slot.slotKey);
      markBusy(roomBusy, schoolClass.roomId, best.slot.slotKey);
      teacherLoad.set(best.teacherId, (teacherLoad.get(best.teacherId) || 0) + 1);
    });
  });

  return assignments.sort((a, b) =>
    `${a.classId} ${a.date} ${a.period}`.localeCompare(`${b.classId} ${b.date} ${b.period}`),
  );
}

export function validateScheduleConflicts(assignments, options = {}) {
  const conflicts = [];
  const teacherSlots = new Map();
  const teacherDayItems = new Map();
  const classSlots = new Map();
  const roomSlots = new Map();
  const externalAssignments = options.externalAssignments || [];
  const config = options.config || null;
  const allAssignments = [
    ...assignments.map((assignment) => ({ ...assignment, external: false })),
    ...externalAssignments.map((assignment) => ({ ...assignment, external: true })),
  ];

  allAssignments.forEach((assignment) => {
    const teacherKey = `${assignment.teacherId}-${assignment.date}-${assignment.period}`;
    if (!teacherSlots.has(teacherKey)) teacherSlots.set(teacherKey, []);
    teacherSlots.get(teacherKey).push(assignment);
    const teacherDay = teacherDayKey(assignment.teacherId, assignment.date);
    if (!teacherDayItems.has(teacherDay)) teacherDayItems.set(teacherDay, []);
    teacherDayItems.get(teacherDay).push(assignment);

    if (assignment.external) return;

    const classKey = `${assignment.classId}-${assignment.date}-${assignment.period}`;
    if (!classSlots.has(classKey)) classSlots.set(classKey, []);
    classSlots.get(classKey).push(assignment);

    const roomKey = `${assignment.roomId || assignment.room}-${assignment.date}-${assignment.period}`;
    if (!roomSlots.has(roomKey)) roomSlots.set(roomKey, []);
    roomSlots.get(roomKey).push(assignment);

    if (config) {
      const dayIndex = Number.isFinite(Number(assignment.dayIndex))
        ? Number(assignment.dayIndex)
        : dayIndexForDate(config, assignment.date);
      const violation = firstScheduleConstraintViolation(config, assignment.subjectId, {
        ...assignment,
        dayIndex,
      });
      if (violation) {
        conflicts.push({
          type: "constraint",
          title: `${assignment.subjectName} 命中自定义硬约束`,
          text: `${formatDate(assignment.date)} 第 ${assignment.period} 节 ${assignment.time}：${assignment.className} ${scheduleConstraintText(config, violation)}`,
        });
      }
      const subjectRuleViolation = subjectHardRuleViolation(
        config,
        assignment.subjectId,
        { ...assignment, dayIndex },
        assignments.filter((item) => item.id !== assignment.id),
        assignment.classId,
      );
      if (subjectRuleViolation) {
        conflicts.push({
          type: subjectRuleViolation.type,
          title: subjectRuleViolation.title,
          text: `${formatDate(assignment.date)} 第 ${assignment.period} 节 ${assignment.time}：${assignment.className} ${subjectRuleViolation.text}`,
        });
      }
      const room = roomById(config, assignment.roomId);
      const roomRuleViolation = roomHardRuleViolation(config, assignment.subjectId, room);
      if (roomRuleViolation) {
        conflicts.push({
          type: roomRuleViolation.type,
          title: roomRuleViolation.title,
          text: `${formatDate(assignment.date)} 第 ${assignment.period} 节 ${assignment.time}：${assignment.className} ${roomRuleViolation.text}`,
        });
      }
      const unavailable = teacherRuleBlocksSlot(config, assignment.teacherId, {
        ...assignment,
        dayIndex,
      });
      if (unavailable) {
        conflicts.push({
          type: "teacher-unavailable",
          title: `${assignment.teacherName} 命中老师不可用时间`,
          text: `${formatDate(assignment.date)} 第 ${assignment.period} 节 ${assignment.time}：${assignment.className} ${assignment.subjectName}，${teacherRuleText(config, assignment.teacherId, { ...assignment, dayIndex })}`,
        });
      }
    }
  });

  teacherSlots.forEach((items) => {
    if (items.length <= 1) return;
    if (!items.some((item) => !item.external)) return;
    const currentItems = items.filter((item) => !item.external);
    const externalItems = items.filter((item) => item.external);
    const conflictType = externalItems.length ? "teacher-global" : "teacher";
    conflicts.push({
      type: conflictType,
      title: externalItems.length
        ? `${items[0].teacherName} 已在其他年级同一时间有课`
        : `${items[0].teacherName} 同一时间被安排 ${items.length} 节课`,
      text: `${formatDate(items[0].date)} 第 ${items[0].period} 节 ${items[0].time}：${[
        ...currentItems.map((item) => `当前草稿 ${item.className}${item.subjectName}`),
        ...externalItems.map((item) => `${item.sourceLabel || "外部课表"} ${externalAssignmentLabel(item)}`),
      ].join("、")}`,
    });
  });

  if (config) {
    teacherDayItems.forEach((items) => {
      if (!items.some((item) => !item.external)) return;
      const teacherId = items[0].teacherId;
      const rule = teacherScheduleRuleFor(config, teacherId);
      if (!rule) return;
      const periods = items.map((item) => Number(item.period)).filter(Number.isFinite);
      const maxDailyLessons = Number(rule.maxDailyLessons || 4);
      if (items.length > maxDailyLessons) {
        conflicts.push({
          type: "teacher-max-daily",
          title: `${items[0].teacherName} 当日课量超过上限`,
          text: `${formatDate(items[0].date)}：已安排 ${items.length} 节，超过上限 ${maxDailyLessons} 节`,
        });
      }
      const maxConsecutiveLessons = Number(rule.maxConsecutiveLessons || 3);
      if (maxConsecutiveRun(periods) > maxConsecutiveLessons) {
        conflicts.push({
          type: "teacher-consecutive",
          title: `${items[0].teacherName} 连续上课超过上限`,
          text: `${formatDate(items[0].date)}：第 ${Array.from(new Set(periods)).sort((a, b) => a - b).join("、")} 节中存在超过 ${maxConsecutiveLessons} 节连堂`,
        });
      }
    });
  }

  classSlots.forEach((items) => {
    if (items.length <= 1) return;
    if (!items.some((item) => !item.external)) return;
    conflicts.push({
      type: "class",
      title: `${items[0].className} 同一时间有 ${items.length} 节课`,
      text: `${formatDate(items[0].date)} 第 ${items[0].period} 节 ${items[0].time}：${items
        .filter((item) => !item.external)
        .map((item) => item.subjectName)
        .join("、")}`,
    });
  });

  roomSlots.forEach((items) => {
    if (items.length <= 1) return;
    if (!items.some((item) => !item.external)) return;
    const currentItems = items.filter((item) => !item.external);
    const externalItems = items.filter((item) => item.external);
    conflicts.push({
      type: externalItems.length ? "room-global" : "room",
      title: externalItems.length
        ? `${items[0].room} 已被其他年级同一时间占用`
        : `${items[0].room} 同一时间被安排 ${items.length} 节课`,
      text: `${formatDate(items[0].date)} 第 ${items[0].period} 节 ${items[0].time}：${[
        ...currentItems.map((item) => `当前草稿 ${item.className}${item.subjectName}`),
        ...externalItems.map((item) => `${item.sourceLabel || "外部课表"} ${externalAssignmentLabel(item)}`),
      ].join("、")}`,
    });
  });

  return conflicts;
}

function draftKey(config) {
  return `${config.termId}:${config.divisionId}:${config.gradeId}`;
}

function scheduleScopeMatches(item, config) {
  return (
    termScopeMatches(config, item) &&
    item.divisionId === config.divisionId &&
    item.gradeId === config.gradeId &&
    (!item.weekStart || item.weekStart === config.weekStart)
  );
}

function refreshDraftConflicts(db, config, draft) {
  if (!draft) return null;
  const externalAssignments = globalTeacherBusyAssignments(db, config);
  draft.conflicts = validateScheduleConflicts(draft.assignments || [], { externalAssignments, config });
  draft.globalBusyCount = externalAssignments.length;
  draft.updatedAt = draft.updatedAt || "";
  return draft;
}

export function findScheduleDraft(db, options = {}) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  const draft =
    db.scheduleDrafts.find((draft) => scheduleScopeMatches(draft, config)) || null;
  return refreshDraftConflicts(db, config, draft);
}

export function generateScheduleDraft(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  assertEditableScheduleTerm(config, "生成排课");
  assertTeacherAssignmentsComplete(config);
  const externalAssignments = globalTeacherBusyAssignments(db, config);
  const precheck = buildSchedulePrecheck(config, { externalAssignments });
  assertSchedulePrecheckPasses(precheck);
  const solution = generateScheduleSolution(config, { externalAssignments, precheck });
  const assignments = solution.assignments;
  const conflicts = solution.conflicts || validateScheduleConflicts(assignments, { externalAssignments, config });
  const now = formatDateTimeMinute();
  const requiredCount = requiredScheduleLessonCount(config);
  const draft = {
    id: `DRAFT-${draftKey(config)}-${Date.now()}`,
    status: "draft",
    termId: config.termId,
    termName: config.termName,
    termStartDate: config.termStartDate,
    termEndDate: config.termEndDate,
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    stageId: config.stageId,
    grade: config.grade,
    divisionName: config.divisionName,
    gradeName: config.gradeName,
    weekStart: config.weekStart,
    requiredLessonCount: requiredCount,
    generatedLessonCount: assignments.length,
    unassignedCount: Math.max(requiredCount - assignments.length, 0),
    generatedAt: now,
    confirmedAt: "",
    publishedAt: "",
    assignments,
    conflicts,
    globalBusyCount: externalAssignments.length,
    precheck,
    solver: solution.meta,
    lockedCount: 0,
    publishedLessonIds: [],
    generatedByAccountId: actorAccount?.id || "",
  };

  db.scheduleDrafts = db.scheduleDrafts.filter(
    (item) => !scheduleScopeMatches(item, config),
  );
  db.scheduleDrafts.push(draft);
  db.meta.updatedAt = new Date().toISOString();
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "schedule_generate",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    assignmentCount: assignments.length,
    conflictCount: conflicts.length,
    solverAlgorithm: solution.meta.algorithm,
    solverScore: solution.meta.score,
    solverAttemptsRun: solution.meta.attemptsRun,
    createdAt: db.meta.updatedAt,
  });

  return { config, draft };
}

function lessonFromAssignment(draft, assignment, scheduleVersionId = "") {
  return {
    id: `LESSON-${draft.id}-${assignment.id}`,
    teacherId: assignment.teacherId,
    classId: assignment.classId,
    className: assignment.className,
    subjectId: assignment.subjectId,
    subjectName: assignment.subjectName,
    durationMinutes: assignment.durationMinutes || DEFAULT_LESSON_DURATION_MINUTES,
    roomId: assignment.roomId,
    room: assignment.room,
    roomType: assignment.roomType || "homeroom",
    date: assignment.date,
    time: assignment.time,
    type: "regular",
    units: 1,
    status: "scheduled",
    checkInAt: "",
    checkOutAt: "",
    source: "backend-scheduling",
    schedulingDraftId: draft.id,
    scheduleVersionId,
    scheduleAssignmentId: assignment.id,
    termId: draft.termId,
    termName: draft.termName,
    divisionId: draft.divisionId,
    gradeId: draft.gradeId,
    stageId: draft.stageId,
    grade: draft.grade,
    period: assignment.period,
  };
}

function assignmentVersionSignature(assignment) {
  return [
    assignment.classId,
    assignment.subjectId,
    assignment.teacherId,
    assignment.date,
    assignment.period,
    assignment.roomId || assignment.room,
  ].join("|");
}

function scheduleVersionDiff(previousVersion, assignments = []) {
  if (!previousVersion) {
    return {
      added: assignments.length,
      removed: 0,
      changed: 0,
      samples: assignments.slice(0, 8).map((assignment) => ({
        type: "added",
        className: assignment.className,
        subjectName: assignment.subjectName,
        date: assignment.date,
        period: assignment.period,
        teacherName: assignment.teacherName,
      })),
    };
  }
  const previousAssignments = previousVersion.assignments || [];
  const previousById = new Map(previousAssignments.map((assignment) => [assignment.id, assignment]));
  const nextById = new Map(assignments.map((assignment) => [assignment.id, assignment]));
  const added = assignments.filter((assignment) => !previousById.has(assignment.id));
  const removed = previousAssignments.filter((assignment) => !nextById.has(assignment.id));
  const changed = assignments.filter((assignment) => {
    const previous = previousById.get(assignment.id);
    return previous && assignmentVersionSignature(previous) !== assignmentVersionSignature(assignment);
  });
  const samples = [
    ...added.slice(0, 4).map((assignment) => ({ type: "added", className: assignment.className, subjectName: assignment.subjectName, date: assignment.date, period: assignment.period, teacherName: assignment.teacherName })),
    ...removed.slice(0, 4).map((assignment) => ({ type: "removed", className: assignment.className, subjectName: assignment.subjectName, date: assignment.date, period: assignment.period, teacherName: assignment.teacherName })),
    ...changed.slice(0, 4).map((assignment) => ({ type: "changed", className: assignment.className, subjectName: assignment.subjectName, date: assignment.date, period: assignment.period, teacherName: assignment.teacherName })),
  ].slice(0, 8);
  return {
    added: added.length,
    removed: removed.length,
    changed: changed.length,
    samples,
  };
}

function scheduleVersionScopeMatches(version, config) {
  return scheduleScopeMatches(version, config);
}

function currentScheduleVersion(db, config) {
  return (db.scheduleVersions || []).find((version) => scheduleVersionScopeMatches(version, config) && version.current) || null;
}

function scheduleVersionSummariesForConfig(db, config) {
  return (db.scheduleVersions || [])
    .filter((version) => scheduleVersionScopeMatches(version, config))
    .sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")) || Number(b.versionNumber || 0) - Number(a.versionNumber || 0))
    .map((version) => ({
      id: version.id,
      versionNumber: version.versionNumber,
      current: Boolean(version.current),
      status: version.current ? "current" : "history",
      termId: version.termId,
      termName: version.termName,
      divisionId: version.divisionId,
      gradeId: version.gradeId,
      weekStart: version.weekStart,
      publishedAt: version.publishedAt,
      publishedByName: version.publishedByName || "",
      rolledBackAt: version.rolledBackAt || "",
      rolledBackByName: version.rolledBackByName || "",
      assignmentCount: version.assignmentCount || 0,
      lessonCount: version.lessonCount || 0,
      diff: version.diff || { added: 0, removed: 0, changed: 0, samples: [] },
    }));
}

export function listScheduleVersions(db, options = {}) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  return scheduleVersionSummariesForConfig(db, config);
}

function createPublishedScheduleVersion(db, config, draft, lessons, actorAccount = null, versionId = "") {
  const versions = (db.scheduleVersions || []).filter((version) => scheduleVersionScopeMatches(version, config));
  const previousVersion = currentScheduleVersion(db, config);
  const versionNumber = Math.max(0, ...versions.map((version) => Number(version.versionNumber || 0))) + 1;
  const now = draft.publishedAt || formatDateTimeMinute();
  const version = {
    id: versionId || `SVER-${draftKey(config)}-${Date.now()}`,
    versionNumber,
    current: true,
    termId: config.termId,
    termName: config.termName,
    termStartDate: config.termStartDate,
    termEndDate: config.termEndDate,
    divisionId: config.divisionId,
    divisionName: config.divisionName,
    gradeId: config.gradeId,
    gradeName: config.gradeName,
    stageId: config.stageId,
    grade: config.grade,
    weekStart: config.weekStart,
    draftId: draft.id,
    publishedAt: now,
    publishedByAccountId: actorAccount?.id || "",
    publishedByName: actorAccount?.name || "",
    assignmentCount: draft.assignments?.length || 0,
    lessonCount: lessons.length,
    assignments: clone(draft.assignments || []),
    lessons: clone(lessons),
    previousVersionId: previousVersion?.id || "",
    diff: scheduleVersionDiff(previousVersion, draft.assignments || []),
  };
  db.scheduleVersions = (db.scheduleVersions || []).map((existing) =>
    scheduleVersionScopeMatches(existing, config) ? { ...existing, current: false } : existing,
  );
  db.scheduleVersions.push(version);
  return version;
}

export function publishScheduleDraft(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  assertEditableScheduleTerm(config, "发布课表");
  const draft = findScheduleDraft(db, options);

  if (!draft) {
    const error = new Error("请先生成排课草稿");
    error.statusCode = 400;
    throw error;
  }

  const externalAssignments = globalTeacherBusyAssignments(db, config);
  const conflicts = validateScheduleConflicts(draft.assignments || [], { externalAssignments, config });
  if (conflicts.length) {
    draft.conflicts = conflicts;
    draft.globalBusyCount = externalAssignments.length;
    const error = new Error("存在教师、班级或教室时间冲突，不能发布");
    error.statusCode = 400;
    error.details = { conflicts };
    throw error;
  }

  if (!draft.assignments?.length) {
    const error = new Error("排课草稿为空，不能发布");
    error.statusCode = 400;
    throw error;
  }

  const requiredCount = requiredScheduleLessonCount(config);
  if (Number(draft.requiredLessonCount || 0) !== requiredCount) {
    const error = new Error("课程规则已变更，请重新生成排课草稿后再发布");
    error.statusCode = 400;
    throw error;
  }

  const unassignedCount = Math.max(
    Number(draft.unassignedCount || 0),
    requiredCount - Number(draft.assignments?.length || 0),
  );
  if (unassignedCount > 0) {
    const error = new Error(`排课草稿还有 ${unassignedCount} 节未排完，不能发布`);
    error.statusCode = 400;
    error.details = { unassignedCount };
    throw error;
  }

  const now = formatDateTimeMinute();
  const scheduleVersionId = `SVER-${draftKey(config)}-${Date.now()}`;
  const lessons = draft.assignments.map((assignment) => lessonFromAssignment(draft, assignment, scheduleVersionId));
  db.lessonInstances = db.lessonInstances
    .filter(
      (lesson) =>
        !(
          lesson.source === "backend-scheduling" &&
          termScopeMatches(config, lesson) &&
          lesson.divisionId === draft.divisionId &&
          lesson.gradeId === draft.gradeId &&
          lesson.date >= draft.weekStart &&
          lesson.date <= addDays(draft.weekStart, 6)
        ),
    )
    .concat(lessons);

  draft.status = "published";
  draft.confirmedAt = now;
  draft.publishedAt = now;
  draft.conflicts = [];
  draft.globalBusyCount = externalAssignments.length;
  draft.publishedLessonIds = lessons.map((lesson) => lesson.id);
  draft.publishedByAccountId = actorAccount?.id || "";
  draft.scheduleVersionId = scheduleVersionId;
  const version = createPublishedScheduleVersion(db, config, draft, lessons, actorAccount, scheduleVersionId);
  pushScheduleNotification(
    db,
    {
      teacherIds: lessons.map((lesson) => lesson.teacherId),
      title: `${draft.termName}${draft.divisionName}${draft.gradeName}课表已发布`,
      text: `${draft.termName}自然周 ${draft.weekStart} 起的课表已发布到老师端，请按课表完成签入签出。`,
      level: "info",
    },
    actorAccount,
  );
  db.meta.updatedAt = new Date().toISOString();
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "schedule_publish",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    termId: config.termId,
    termName: config.termName,
    lessonCount: lessons.length,
    scheduleVersionId,
    versionNumber: version.versionNumber,
    createdAt: db.meta.updatedAt,
  });

  return { config, draft, lessons, versions: scheduleVersionSummariesForConfig(db, config), version };
}

export function rollbackScheduleVersion(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  assertEditableScheduleTerm(config, "回滚课表");
  const versionId = String(options.versionId || "").trim();
  const targetVersion = (db.scheduleVersions || []).find(
    (version) => scheduleVersionScopeMatches(version, config) && version.id === versionId,
  );
  if (!targetVersion) {
    const error = new Error("未找到要回滚的课表版本");
    error.statusCode = 404;
    throw error;
  }

  const now = formatDateTimeMinute();
  const lessons = clone(targetVersion.lessons || []).map((lesson) => ({
    ...lesson,
    source: "backend-scheduling",
    termId: targetVersion.termId,
    termName: targetVersion.termName,
    scheduleVersionId: targetVersion.id,
    rolledBackAt: now,
  }));
  db.lessonInstances = (db.lessonInstances || [])
    .filter(
      (lesson) =>
        !(
          lesson.source === "backend-scheduling" &&
          termScopeMatches(config, lesson) &&
          lesson.divisionId === targetVersion.divisionId &&
          lesson.gradeId === targetVersion.gradeId &&
          lesson.date >= targetVersion.weekStart &&
          lesson.date <= addDays(targetVersion.weekStart, 6)
        ),
    )
    .concat(lessons);

  db.scheduleVersions = (db.scheduleVersions || []).map((version) =>
    scheduleVersionScopeMatches(version, config)
      ? {
          ...version,
          current: version.id === targetVersion.id,
          rolledBackAt: version.id === targetVersion.id ? now : version.rolledBackAt || "",
          rolledBackByAccountId: version.id === targetVersion.id ? actorAccount?.id || "" : version.rolledBackByAccountId || "",
          rolledBackByName: version.id === targetVersion.id ? actorAccount?.name || "" : version.rolledBackByName || "",
        }
      : version,
  );

  const draft = {
    id: targetVersion.draftId || `DRAFT-ROLLBACK-${draftKey(config)}-${Date.now()}`,
    status: "published",
    termId: targetVersion.termId || config.termId,
    termName: targetVersion.termName || config.termName,
    termStartDate: targetVersion.termStartDate || config.termStartDate,
    termEndDate: targetVersion.termEndDate || config.termEndDate,
    divisionId: targetVersion.divisionId,
    gradeId: targetVersion.gradeId,
    stageId: targetVersion.stageId,
    grade: targetVersion.grade,
    divisionName: targetVersion.divisionName,
    gradeName: targetVersion.gradeName,
    weekStart: targetVersion.weekStart,
    requiredLessonCount: requiredScheduleLessonCount(config),
    generatedLessonCount: targetVersion.assignmentCount,
    unassignedCount: 0,
    generatedAt: targetVersion.publishedAt,
    confirmedAt: now,
    publishedAt: now,
    assignments: clone(targetVersion.assignments || []),
    conflicts: [],
    globalBusyCount: 0,
    solver: { algorithm: "rollback", status: "restored", scheduleVersionId: targetVersion.id },
    lockedCount: (targetVersion.assignments || []).filter((assignment) => assignment.locked).length,
    publishedLessonIds: lessons.map((lesson) => lesson.id),
    publishedByAccountId: targetVersion.publishedByAccountId || "",
    scheduleVersionId: targetVersion.id,
    rollbackFromVersionId: targetVersion.id,
    rollbackAt: now,
    rollbackByAccountId: actorAccount?.id || "",
  };
  db.scheduleDrafts = (db.scheduleDrafts || []).filter(
    (item) => !scheduleScopeMatches(item, config),
  );
  db.scheduleDrafts.push(draft);

  pushScheduleNotification(
    db,
    {
      teacherIds: lessons.map((lesson) => lesson.teacherId),
      title: `${targetVersion.termName || config.termName}${targetVersion.divisionName}${targetVersion.gradeName}课表已回滚`,
      text: `已回滚到 V${targetVersion.versionNumber}，老师端课表、签入签出和薪资工作量将按该版本执行。`,
      level: "warning",
    },
    actorAccount,
  );
  db.meta.updatedAt = new Date().toISOString();
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "schedule_version_rollback",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    termId: config.termId,
    termName: config.termName,
    scheduleVersionId: targetVersion.id,
    versionNumber: targetVersion.versionNumber,
    lessonCount: lessons.length,
    createdAt: db.meta.updatedAt,
  });

  return { config, draft, lessons, versions: scheduleVersionSummariesForConfig(db, config), version: targetVersion };
}

function monthKey(dateKey = "") {
  return String(dateKey || "").slice(0, 7);
}

function payrollLocked(db, teacherId, month) {
  return (db.payrollDetails || []).some(
    (detail) => detail.teacherId === teacherId && detail.month === month && detail.status === "locked",
  );
}

function lessonAsScheduleAssignment(db, lesson) {
  const assignment = lessonAsExternalAssignment(db, lesson);
  return assignment
    ? {
        ...assignment,
        external: false,
        id: lesson.scheduleAssignmentId || assignment.id,
      }
    : null;
}

function findPublishedLessonForChange(db, draft, assignmentId) {
  return (db.lessonInstances || []).find(
    (lesson) =>
      lesson.source === "backend-scheduling" &&
      lesson.schedulingDraftId === draft.id &&
      (lesson.scheduleAssignmentId === assignmentId || lesson.id === `LESSON-${draft.id}-${assignmentId}`),
  );
}

function validatePublishedLessonChange(db, config, lesson, next) {
  if (!lesson || lesson.status === "completed" || lesson.status === "checkedIn") {
    const error = new Error("已签到或已完成的课程不能调课/代课");
    error.statusCode = 400;
    throw error;
  }
  if ((db.attendanceRecords || []).some((record) => record.lessonId === lesson.id)) {
    const error = new Error("该课程已有签到记录，不能再变更排课");
    error.statusCode = 400;
    throw error;
  }
  if (payrollLocked(db, lesson.teacherId, monthKey(lesson.date)) || payrollLocked(db, next.teacherId, monthKey(next.date))) {
    const error = new Error("原老师或新老师对应月份薪资已锁定，不能调课");
    error.statusCode = 409;
    throw error;
  }
  if (!teacherCanTeachSubject(config, next.teacherId, lesson.subjectId, lesson.classId)) {
    const error = new Error("目标老师不属于该科目的可排老师");
    error.statusCode = 400;
    throw error;
  }
  const dayIndex = dayIndexForDate(config, next.date);
  if (dayIndex < 0) {
    const error = new Error("调课日期必须在当前自然周的周一到周五内");
    error.statusCode = 400;
    throw error;
  }
  const period = config.periods.find((item) => item.period === Number(next.period));
  if (!period) {
    const error = new Error("调课节次不在当前排课时段内");
    error.statusCode = 400;
    throw error;
  }
  const room = roomById(config, next.roomId);
  if (!room) {
    const error = new Error("调课教室不在当前年级可用教室范围内");
    error.statusCode = 400;
    throw error;
  }
  const roomRuleViolation = roomHardRuleViolation(config, lesson.subjectId, room);
  if (roomRuleViolation) {
    const error = new Error(roomRuleViolation.text || roomRuleViolation.title);
    error.statusCode = 400;
    throw error;
  }
  const constraintViolation = firstScheduleConstraintViolation(config, lesson.subjectId, {
    date: next.date,
    dayIndex,
    period: period.period,
    time: period.time,
  });
  if (constraintViolation) {
    const error = new Error(`该调课违反硬约束：${scheduleConstraintText(config, constraintViolation)}`);
    error.statusCode = 400;
    throw error;
  }

  const weekDates = new Set(weekDateKeys(config));
  const currentScopeLessons = (db.lessonInstances || [])
    .filter((item) => item.id !== lesson.id)
    .filter((item) => item.source === "backend-scheduling")
    .filter((item) => termScopeMatches(config, item))
    .filter((item) => item.divisionId === config.divisionId && item.gradeId === config.gradeId)
    .filter((item) => weekDates.has(item.date))
    .filter((item) => item.status !== "cancelled")
    .map((item) => lessonAsScheduleAssignment(db, item))
    .filter(Boolean);
  const proposed = {
    id: lesson.scheduleAssignmentId || lesson.id,
    classId: lesson.classId,
    className: lesson.className,
    subjectId: lesson.subjectId,
    subjectName: lesson.subjectName,
    durationMinutes: lesson.durationMinutes || DEFAULT_LESSON_DURATION_MINUTES,
    teacherId: next.teacherId,
    teacherName: teacherName(config, next.teacherId),
    date: next.date,
    dayIndex,
    period: period.period,
    time: period.time,
    room: room.name,
    roomId: room.id,
  };
  const subjectRuleViolation = subjectHardRuleViolation(
    config,
    lesson.subjectId,
    proposed,
    currentScopeLessons,
    lesson.classId,
  );
  if (subjectRuleViolation) {
    const error = new Error(subjectRuleViolation.text || subjectRuleViolation.title);
    error.statusCode = 400;
    throw error;
  }
  const teacherDayItems = [
    ...currentScopeLessons,
    ...globalTeacherBusyAssignments(db, config),
  ].filter((item) => item.teacherId === next.teacherId && item.date === next.date);
  const teacherRuleViolation = teacherHardRuleViolation(
    config,
    next.teacherId,
    proposed,
    teacherDayItems.length,
    teacherDayItems.map((item) => item.period),
  );
  if (teacherRuleViolation) {
    const error = new Error(teacherRuleViolation.text || teacherRuleViolation.title);
    error.statusCode = 400;
    throw error;
  }
  const conflicts = validateScheduleConflicts([...currentScopeLessons, proposed], {
    externalAssignments: globalTeacherBusyAssignments(db, config),
    config,
  });
  if (conflicts.length) {
    const error = new Error("调课后会产生教师、班级或教室冲突");
    error.statusCode = 400;
    error.details = { conflicts };
    throw error;
  }

  return { dayIndex, period, room, proposed };
}

export function createScheduleChangeRequest(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  assertEditableScheduleTerm(config, "发起调课");
  const draft = findScheduleDraft(db, options);
  if (!draft || draft.status !== "published") {
    const error = new Error("请先发布课表，再发起调课/代课申请");
    error.statusCode = 400;
    throw error;
  }
  const assignmentId = String(options.assignmentId || "").trim();
  const lesson = findPublishedLessonForChange(db, draft, assignmentId);
  if (!lesson) {
    const error = new Error("未找到已发布的课程实例");
    error.statusCode = 404;
    throw error;
  }
  const next = {
    teacherId: String(options.teacherId || lesson.teacherId),
    date: String(options.date || lesson.date),
    period: Number.parseInt(options.period || lesson.period || periodForLesson(lesson), 10),
    roomId: String(options.roomId || lesson.roomId || ""),
  };
  const validated = validatePublishedLessonChange(db, config, lesson, next);
  const now = new Date().toISOString();
  const request = {
    id: `SCR-${Date.now()}`,
    status: "pending",
    changeType: next.teacherId === lesson.teacherId ? "reschedule" : "substitute",
    lessonId: lesson.id,
    assignmentId,
    termId: config.termId,
    termName: config.termName,
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    stageId: config.stageId,
    grade: config.grade,
    classId: lesson.classId,
    className: lesson.className,
    subjectId: lesson.subjectId,
    subjectName: lesson.subjectName,
    from: {
      teacherId: lesson.teacherId,
      teacherName: teacherById(db, lesson.teacherId)?.name || lesson.teacherName || lesson.teacherId,
      date: lesson.date,
      period: periodForLesson(lesson),
      time: lesson.time,
      roomId: lesson.roomId,
      room: lesson.room,
    },
    to: {
      teacherId: next.teacherId,
      teacherName: teacherName(config, next.teacherId),
      date: next.date,
      period: validated.period.period,
      time: validated.period.time,
      roomId: validated.room.id,
      room: validated.room.name,
    },
    reason: String(options.reason || "").trim(),
    createdAt: now,
    createdByAccountId: actorAccount?.id || "",
    createdByName: actorAccount?.name || "",
    approvedAt: "",
    approvedByAccountId: "",
    approvedByName: "",
  };
  db.scheduleChangeRequests.push(request);
  db.meta.updatedAt = now;
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "schedule_change_request_create",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    requestId: request.id,
    termId: config.termId,
    termName: config.termName,
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    createdAt: now,
  });

  return { config: buildSchedulingConfig(db, options), draft: findScheduleDraft(db, options), request };
}

export function approveScheduleChangeRequest(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const requestId = String(options.requestId || "").trim();
  const request = (db.scheduleChangeRequests || []).find((item) => item.id === requestId);
  if (!request) {
    const error = new Error("未找到调课/代课申请");
    error.statusCode = 404;
    throw error;
  }
  if (request.status !== "pending") {
    const error = new Error("该申请已处理，不能重复审批");
    error.statusCode = 409;
    throw error;
  }
  const config = buildSchedulingConfig(db, { termId: request.termId, divisionId: request.divisionId, gradeId: request.gradeId });
  assertEditableScheduleTerm(config, "审批调课");
  const lesson = (db.lessonInstances || []).find((item) => item.id === request.lessonId);
  const validated = validatePublishedLessonChange(db, config, lesson, {
    teacherId: request.to.teacherId,
    date: request.to.date,
    period: request.to.period,
    roomId: request.to.roomId,
  });
  const now = new Date().toISOString();

  lesson.teacherId = request.to.teacherId;
  lesson.teacherName = request.to.teacherName;
  lesson.date = request.to.date;
  lesson.time = validated.period.time;
  lesson.period = validated.period.period;
  lesson.roomId = validated.room.id;
  lesson.room = validated.room.name;
  lesson.roomType = validated.room.roomType || "homeroom";
  lesson.changeRequestId = request.id;
  lesson.changedAt = now;
  lesson.changedByAccountId = actorAccount?.id || "";

  const draft = findScheduleDraft(db, { termId: request.termId, divisionId: request.divisionId, gradeId: request.gradeId });
  const assignment = (draft?.assignments || []).find((item) => item.id === request.assignmentId);
  if (assignment) {
    Object.assign(assignment, {
      teacherId: request.to.teacherId,
      teacherName: request.to.teacherName,
      date: request.to.date,
      dayIndex: validated.dayIndex,
      period: validated.period.period,
      time: validated.period.time,
      roomId: validated.room.id,
      room: validated.room.name,
      roomType: validated.room.roomType || "homeroom",
      changedAt: formatDateTimeMinute(),
      changeRequestId: request.id,
    });
  }

  request.status = "approved";
  request.approvedAt = now;
  request.approvedByAccountId = actorAccount?.id || "";
  request.approvedByName = actorAccount?.name || "";
  pushScheduleNotification(
    db,
    {
      teacherIds: [request.from.teacherId, request.to.teacherId],
      title: "调课审批已通过",
      text: `${request.from.className || lesson.className} ${lesson.subjectName} 已调整为 ${request.to.date} 第 ${request.to.period} 节，任课老师 ${request.to.teacherName}。`,
      level: "warning",
    },
    actorAccount,
  );
  db.meta.updatedAt = now;
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "schedule_change_request_approve",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    requestId,
    lessonId: lesson.id,
    termId: config.termId,
    termName: config.termName,
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    createdAt: now,
  });

  return { config: buildSchedulingConfig(db, { termId: request.termId, divisionId: request.divisionId, gradeId: request.gradeId }), draft, request, lesson };
}

export function adjustScheduleAssignment(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  assertEditableScheduleTerm(config, "调整课表");
  const draft = findScheduleDraft(db, options);

  if (!draft) {
    const error = new Error("请先生成排课草稿");
    error.statusCode = 400;
    throw error;
  }

  if (draft.status === "published") {
    const error = new Error("已发布课表暂不允许直接调整，请重新生成草稿或走调课流程");
    error.statusCode = 400;
    throw error;
  }

  const assignment = (draft.assignments || []).find((item) => item.id === options.assignmentId);
  if (!assignment) {
    const error = new Error("未找到要调整的课节");
    error.statusCode = 404;
    throw error;
  }

  const nextTeacherId = String(options.teacherId || assignment.teacherId);
  if (!teacherCanTeachSubject(config, nextTeacherId, assignment.subjectId, assignment.classId)) {
    const error = new Error("选择的老师不属于该科目的可排老师");
    error.statusCode = 400;
    throw error;
  }

  const nextDate = String(options.date || assignment.date);
  const nextDayIndex = dayIndexForDate(config, nextDate);
  if (nextDayIndex < 0) {
    const error = new Error("调整日期必须在当前自然周的周一到周五内");
    error.statusCode = 400;
    throw error;
  }

  const nextPeriod = Number.parseInt(options.period || assignment.period, 10);
  const period = config.periods.find((item) => item.period === nextPeriod);
  if (!period) {
    const error = new Error("调整节次不在当前排课时段内");
    error.statusCode = 400;
    throw error;
  }

  const constraintViolation = firstScheduleConstraintViolation(config, assignment.subjectId, {
    date: nextDate,
    dayIndex: nextDayIndex,
    period: period.period,
    time: period.time,
  });
  if (constraintViolation) {
    const error = new Error(`该调整违反硬约束：${scheduleConstraintText(config, constraintViolation)}`);
    error.statusCode = 400;
    throw error;
  }

  const nextRoomId = String(options.roomId || assignment.roomId || "");
  const nextRoom = roomById(config, nextRoomId);
  if (!nextRoom) {
    const error = new Error("调整教室不在当前年级可用教室范围内");
    error.statusCode = 400;
    throw error;
  }
  const roomRuleViolation = roomHardRuleViolation(config, assignment.subjectId, nextRoom);
  if (roomRuleViolation) {
    const error = new Error(roomRuleViolation.text || roomRuleViolation.title);
    error.statusCode = 400;
    throw error;
  }

  const subjectRuleViolation = subjectHardRuleViolation(
    config,
    assignment.subjectId,
    { date: nextDate, dayIndex: nextDayIndex, period: period.period, time: period.time },
    (draft.assignments || []).filter((item) => item.id !== assignment.id),
    assignment.classId,
  );
  if (subjectRuleViolation) {
    const error = new Error(subjectRuleViolation.text || subjectRuleViolation.title);
    error.statusCode = 400;
    throw error;
  }

  const externalAssignments = globalTeacherBusyAssignments(db, config);
  const teacherDayItems = [
    ...(draft.assignments || []).filter((item) => item.id !== assignment.id),
    ...externalAssignments,
  ].filter((item) => item.teacherId === nextTeacherId && item.date === nextDate);
  const teacherRuleViolation = teacherHardRuleViolation(
    config,
    nextTeacherId,
    { date: nextDate, dayIndex: nextDayIndex, period: period.period, time: period.time },
    teacherDayItems.length,
    teacherDayItems.map((item) => item.period),
  );
  if (teacherRuleViolation) {
    const error = new Error(teacherRuleViolation.text || teacherRuleViolation.title);
    error.statusCode = 400;
    throw error;
  }

  const before = {
    teacherId: assignment.teacherId,
    teacherName: assignment.teacherName,
    date: assignment.date,
    period: assignment.period,
    time: assignment.time,
    roomId: assignment.roomId,
    room: assignment.room,
  };

  assignment.teacherId = nextTeacherId;
  assignment.teacherName = teacherName(config, nextTeacherId);
  assignment.durationMinutes =
    config.subjects.find((subject) => subject.id === assignment.subjectId)?.durationMinutes ||
    assignment.durationMinutes ||
    DEFAULT_LESSON_DURATION_MINUTES;
  assignment.date = nextDate;
  assignment.dayIndex = nextDayIndex;
  assignment.period = period.period;
  assignment.time = period.time;
  assignment.roomId = nextRoom.id;
  assignment.room = nextRoom.name;
  assignment.roomType = nextRoom.roomType || "homeroom";
  assignment.adjustedAt = formatDateTimeMinute();
  assignment.adjustedByAccountId = actorAccount?.id || "";

  draft.conflicts = validateScheduleConflicts(draft.assignments || [], { externalAssignments, config });
  draft.globalBusyCount = externalAssignments.length;
  draft.generatedLessonCount = draft.assignments?.length || 0;
  draft.unassignedCount = Math.max((draft.requiredLessonCount || 0) - draft.generatedLessonCount, 0);
  draft.updatedAt = formatDateTimeMinute();
  draft.adjustedAt = draft.updatedAt;
  db.meta.updatedAt = new Date().toISOString();
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "schedule_adjust",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    assignmentId: assignment.id,
    conflictCount: draft.conflicts.length,
    before,
    after: {
      teacherId: assignment.teacherId,
      teacherName: assignment.teacherName,
      date: assignment.date,
      period: assignment.period,
      time: assignment.time,
      roomId: assignment.roomId,
      room: assignment.room,
    },
    createdAt: db.meta.updatedAt,
  });

  return { config, draft, assignment };
}

export function setScheduleAssignmentLock(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  assertEditableScheduleTerm(config, "修改课节锁定状态");
  const draft = findScheduleDraft(db, options);

  if (!draft) {
    const error = new Error("请先生成排课草稿");
    error.statusCode = 400;
    throw error;
  }

  if (draft.status === "published") {
    const error = new Error("已发布课表不能修改锁定状态");
    error.statusCode = 400;
    throw error;
  }

  const assignment = (draft.assignments || []).find((item) => item.id === options.assignmentId);
  if (!assignment) {
    const error = new Error("未找到要锁定的课节");
    error.statusCode = 404;
    throw error;
  }

  assignment.locked = Boolean(options.locked);
  assignment.lockedAt = assignment.locked ? formatDateTimeMinute() : "";
  assignment.lockedByAccountId = assignment.locked ? actorAccount?.id || "" : "";
  assignment.unlockedAt = assignment.locked ? "" : formatDateTimeMinute();

  draft.updatedAt = formatDateTimeMinute();
  draft.lockedCount = (draft.assignments || []).filter((item) => item.locked).length;
  const externalAssignments = globalTeacherBusyAssignments(db, config);
  draft.conflicts = validateScheduleConflicts(draft.assignments || [], { externalAssignments, config });
  draft.globalBusyCount = externalAssignments.length;
  db.meta.updatedAt = new Date().toISOString();
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: assignment.locked ? "schedule_assignment_lock" : "schedule_assignment_unlock",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    assignmentId: assignment.id,
    locked: assignment.locked,
    lockedCount: draft.lockedCount,
    createdAt: db.meta.updatedAt,
  });

  return { config, draft, assignment };
}

function normalizeReplanScope(config, options = {}) {
  const source = options.replanScope || {};
  const weekDates = weekDateKeys(config).slice(0, 5);
  const scope = {
    classId: String(source.classId || "").trim(),
    teacherId: String(source.teacherId || "").trim(),
    date: String(source.date || "").trim(),
    subjectId: String(source.subjectId || "").trim(),
  };
  if (!config.classes.some((schoolClass) => schoolClass.id === scope.classId)) scope.classId = "";
  if (!config.teachers.some((teacher) => teacher.id === scope.teacherId)) scope.teacherId = "";
  if (!config.subjects.some((subject) => subject.id === scope.subjectId)) scope.subjectId = "";
  if (!weekDates.includes(scope.date)) scope.date = "";
  return scope;
}

function replanScopeIsEmpty(scope) {
  return !scope.classId && !scope.teacherId && !scope.date && !scope.subjectId;
}

function assignmentMatchesReplanScope(assignment, scope) {
  if (scope.classId && assignment.classId !== scope.classId) return false;
  if (scope.teacherId && assignment.teacherId !== scope.teacherId) return false;
  if (scope.date && assignment.date !== scope.date) return false;
  if (scope.subjectId && assignment.subjectId !== scope.subjectId) return false;
  return true;
}

function temporaryLockedAssignmentsForScope(assignments = [], scope = {}) {
  return assignments
    .filter((assignment) => assignment.locked || !assignmentMatchesReplanScope(assignment, scope))
    .map((assignment) => ({
      ...assignment,
      locked: true,
      temporaryReplanLock: !assignment.locked,
    }));
}

function restoreTemporaryReplanLocks(assignments = [], originalAssignments = []) {
  const originalById = new Map(originalAssignments.map((assignment) => [assignment.id, assignment]));
  return assignments.map((assignment) => {
    const original = originalById.get(assignment.id);
    const { temporaryReplanLock, ...cleanAssignment } = assignment;
    if (!original) return cleanAssignment;
    return {
      ...cleanAssignment,
      locked: Boolean(original.locked),
      lockedAt: original.lockedAt || "",
      lockedByAccountId: original.lockedByAccountId || "",
      unlockedAt: original.unlockedAt || "",
    };
  });
}

export function regenerateUnlockedScheduleAssignments(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  assertEditableScheduleTerm(config, "重排课程");
  assertTeacherAssignmentsComplete(config);
  const draft = findScheduleDraft(db, options);

  if (!draft) {
    const error = new Error("请先生成排课草稿");
    error.statusCode = 400;
    throw error;
  }

  if (draft.status === "published") {
    const error = new Error("已发布课表不能重新排未锁定课程");
    error.statusCode = 400;
    throw error;
  }

  const replanScope = normalizeReplanScope(config, options);
  const scopeTargetCount = (draft.assignments || []).filter(
    (assignment) => !assignment.locked && assignmentMatchesReplanScope(assignment, replanScope),
  ).length;
  if (!scopeTargetCount) {
    const error = new Error(
      replanScopeIsEmpty(replanScope)
        ? "当前没有可重排的未锁定课程"
        : "当前局部范围内没有可重排的未锁定课程",
    );
    error.statusCode = 400;
    throw error;
  }

  const lockedAssignments = temporaryLockedAssignmentsForScope(draft.assignments || [], replanScope);
  const externalAssignments = globalTeacherBusyAssignments(db, config);
  const precheck = buildSchedulePrecheck(config, { lockedAssignments, externalAssignments });
  assertSchedulePrecheckPasses(precheck);
  const solution = generateScheduleSolution(config, { lockedAssignments, externalAssignments, precheck });
  const assignments = restoreTemporaryReplanLocks(solution.assignments, draft.assignments || []);
  const conflicts = solution.conflicts || validateScheduleConflicts(assignments, { externalAssignments, config });
  const now = formatDateTimeMinute();

  draft.assignments = assignments;
  draft.conflicts = conflicts;
  draft.generatedLessonCount = assignments.length;
  draft.unassignedCount = Math.max((draft.requiredLessonCount || requiredScheduleLessonCount(config)) - assignments.length, 0);
  draft.lockedCount = assignments.filter((assignment) => assignment.locked).length;
  draft.preservedCount = lockedAssignments.length;
  draft.replanScope = replanScope;
  draft.replannedScopeCount = scopeTargetCount;
  draft.globalBusyCount = externalAssignments.length;
  draft.precheck = precheck;
  draft.solver = solution.meta;
  draft.updatedAt = now;
  draft.replannedAt = now;
  draft.replannedByAccountId = actorAccount?.id || "";
  db.meta.updatedAt = new Date().toISOString();
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "schedule_regenerate_unlocked",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    replanScope,
    replannedScopeCount: scopeTargetCount,
    lockedCount: draft.lockedCount,
    preservedCount: lockedAssignments.length,
    assignmentCount: assignments.length,
    conflictCount: conflicts.length,
    solverAlgorithm: solution.meta.algorithm,
    solverScore: solution.meta.score,
    solverAttemptsRun: solution.meta.attemptsRun,
    createdAt: db.meta.updatedAt,
  });

  return { config, draft };
}
