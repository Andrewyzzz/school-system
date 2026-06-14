import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

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

function ensureSchedulingStore(db) {
  if (!Array.isArray(db.scheduleDrafts)) db.scheduleDrafts = [];
  if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
  if (!Array.isArray(db.notifications)) db.notifications = [];
  if (!Array.isArray(db.gradeCourseRules)) db.gradeCourseRules = [];
  if (!Array.isArray(db.scheduleConstraints)) db.scheduleConstraints = [];
  if (!Array.isArray(db.teacherScheduleRules)) db.teacherScheduleRules = [];
  if (!Array.isArray(db.scheduleChangeRequests)) db.scheduleChangeRequests = [];
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

function clearScheduleDraftForScope(db, division, grade) {
  db.scheduleDrafts = (db.scheduleDrafts || []).filter(
    (draft) => !(draft.divisionId === division.id && draft.gradeId === grade.id),
  );
}

function assignmentTeachers(db, division, grade, subjectId) {
  const assignment = (db.teacherAssignments || []).find(
    (item) => item.stageId === division.stageId && item.grade === grade.grade && item.subjectId === subjectId,
  );
  if (!assignment?.teacherIds?.length) return [];
  return assignment.teacherIds
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
  };
}

function schedulingCourseRules(db, division, grade) {
  const savedRules = new Map(
    (db.gradeCourseRules || [])
      .filter((rule) => rule.stageId === division.stageId && Number(rule.grade) === grade.grade)
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

function publicScheduleConstraints(db, division, grade) {
  return (db.scheduleConstraints || [])
    .filter((constraint) => constraint.stageId === division.stageId && Number(constraint.grade) === grade.grade)
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

function publicTeacherScheduleRules(db, division, subjects) {
  const teacherIds = new Set(subjects.flatMap((subject) => subject.teacherIds || []));
  return (db.teacherScheduleRules || [])
    .filter((rule) => rule.stageId === division.stageId && teacherIds.has(rule.teacherId))
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

function publicScheduleChangeRequests(db, division, grade) {
  return (db.scheduleChangeRequests || [])
    .filter((request) => request.divisionId === division.id && request.gradeId === grade.id)
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 20);
}

function schedulingSubjects(db, division, grade) {
  return schedulingCourseRules(db, division, grade)
    .filter((rule) => rule.enabled && rule.weeklyLessons > 0)
    .map((rule) => {
      const subject = subjectById(db, rule.subjectId);
      const configuredTeachers = assignmentTeachers(db, division, grade, rule.subjectId);
      const availableTeachers = activeSubjectTeachers(db, division.stageId, rule.subjectId);
      const teachers = configuredTeachers.length ? configuredTeachers : availableTeachers.slice(0, 5);
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
            teacherIds: teachers.map((teacher) => teacher.id),
            availableTeachers: availableTeachers.map(publicSchedulingTeacher),
          }
        : null;
    })
    .filter(Boolean);
}

function schedulingClasses(db, division, grade) {
  return db.classes
    .filter((schoolClass) => schoolClass.stageId === division.stageId && schoolClass.grade === grade.grade && schoolClass.active)
    .map((schoolClass) => {
      const room = db.rooms.find((item) => item.id === schoolClass.roomId);
      return {
        id: schoolClass.id,
        name: schoolClass.name,
        room: room?.name || schoolClass.roomId,
        roomId: schoolClass.roomId,
      };
    });
}

export function buildSchedulingConfig(db, options = {}) {
  ensureSchedulingStore(db);
  const division = divisionById(options.divisionId);
  const grade = gradeById(division, options.gradeId);
  const courseRules = schedulingCourseRules(db, division, grade);
  const subjects = schedulingSubjects(db, division, grade);
  const classes = schedulingClasses(db, division, grade);
  const constraints = publicScheduleConstraints(db, division, grade);
  const teacherRules = publicTeacherScheduleRules(db, division, subjects);

  return {
    divisionId: division.id,
    divisionName: division.name,
    stageId: division.stageId,
    gradeId: grade.id,
    gradeName: grade.name,
    grade: grade.grade,
    weekStart: division.weekStart,
    classCount: division.stageId === "high" ? 8 : division.stageId === "middle" ? 8 : 10,
    classes,
    rooms: classes.map((schoolClass) => ({
      id: schoolClass.roomId,
      name: schoolClass.room,
      sourceClassId: schoolClass.id,
    })),
    periods: PERIODS.map((period) => ({ ...period })),
    courseRules,
    constraints,
    teacherRules,
    changeRequests: publicScheduleChangeRequests(db, division, grade),
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

export function updateGradeCourseRules(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const stageId = String(options.stageId || "").trim();
  const { division, grade } = schedulingScopeFromStageGrade(db, stageId, options.grade);
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
      id: `CR-${division.stageId}-${grade.grade}-${subjectId}`,
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
        rule.stageId === division.stageId &&
        Number(rule.grade) === grade.grade &&
        bySubject.has(rule.subjectId)
      ),
  );
  db.gradeCourseRules.push(...nextRules);
  clearScheduleDraftForScope(db, division, grade);
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

  return { config: buildSchedulingConfig(db, { divisionId: division.id, gradeId: grade.id }) };
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
  const defaultRule = defaultCourseRule(division, subjectId) || {};
  const next = {
    id: `CR-${division.stageId}-${grade.grade}-${subjectId}`,
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
  const existing = (db.gradeCourseRules || []).find((rule) => rule.id === next.id);
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

  const existingRule = schedulingCourseRules(db, division, grade).find((rule) => rule.subjectId === subject.id);
  upsertCourseRule(
    db,
    division,
    grade,
    subject.id,
    {
      enabled: true,
      weeklyLessons: options.weeklyLessons ?? existingRule?.weeklyLessons ?? 1,
      durationMinutes: options.durationMinutes ?? existingRule?.durationMinutes ?? DEFAULT_LESSON_DURATION_MINUTES,
    },
    actorAccount,
  );
  clearScheduleDraftForScope(db, division, grade);
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

  return { config: buildSchedulingConfig(db, { divisionId: division.id, gradeId: grade.id }), subject };
}

export function deleteGradeCourse(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const stageId = String(options.stageId || "").trim();
  const { division, grade } = schedulingScopeFromStageGrade(db, stageId, options.grade);
  const subjectId = String(options.subjectId || "").trim();
  const subject = subjectById(db, subjectId);
  if (!subject) {
    const error = new Error("课程不存在");
    error.statusCode = 404;
    throw error;
  }
  const currentRule = schedulingCourseRules(db, division, grade).find((rule) => rule.subjectId === subjectId);
  upsertCourseRule(
    db,
    division,
    grade,
    subjectId,
    {
      enabled: false,
      weeklyLessons: currentRule?.weeklyLessons || 1,
      durationMinutes: currentRule?.durationMinutes || DEFAULT_LESSON_DURATION_MINUTES,
    },
    actorAccount,
  );
  db.scheduleConstraints = (db.scheduleConstraints || []).filter(
    (constraint) =>
      !(
        constraint.stageId === division.stageId &&
        Number(constraint.grade) === grade.grade &&
        constraint.subjectId === subjectId
      ),
  );
  clearScheduleDraftForScope(db, division, grade);
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

  return { config: buildSchedulingConfig(db, { divisionId: division.id, gradeId: grade.id }), deletedSubjectId: subjectId };
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
    id: `SC-${division.stageId}-${grade.grade}-${subjectId}-${Date.now()}`,
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

  return { config: buildSchedulingConfig(db, { divisionId: division.id, gradeId: grade.id }), constraint };
}

export function deleteScheduleConstraint(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const constraintId = String(options.constraintId || "").trim();
  const existing = db.scheduleConstraints.find((constraint) => constraint.id === constraintId);
  if (!existing) {
    const error = new Error("未找到该硬约束");
    error.statusCode = 404;
    throw error;
  }
  db.scheduleConstraints = db.scheduleConstraints.filter((constraint) => constraint.id !== constraintId);
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
  const division = divisionByStageId(existing.stageId) || DIVISIONS[0];
  const grade = division.grades.find((item) => item.grade === Number(existing.grade)) || division.grades[0];
  return { config: buildSchedulingConfig(db, { divisionId: division.id, gradeId: grade.id }), deletedId: constraintId };
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
    id: `TSR-${division.stageId}-${teacherId}`,
    stageId: division.stageId,
    teacherId,
    teacherName: teacher.name,
    ...normalized,
    updatedAt: now,
    updatedByAccountId: actorAccount?.id || "",
  };
  const existing = db.teacherScheduleRules.find((rule) => rule.id === nextRule.id);
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
      divisionId: division.id,
      gradeId: options.gradeId || division.grades.find((item) => Number(item.grade) === Number(options.grade))?.id,
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

function teacherCanTeachSubject(config, teacherId, subjectId) {
  const subject = config.subjects.find((item) => item.id === subjectId);
  return Boolean(subject?.teacherIds.includes(teacherId));
}

function roomById(config, roomId) {
  return config.rooms?.find((room) => room.id === roomId) || null;
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

function currentScope(config, item) {
  return item.divisionId === config.divisionId && item.gradeId === config.gradeId;
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
    .filter((lesson) => weekDates.has(lesson.date))
    .filter((lesson) => !currentScope(config, lesson))
    .filter((lesson) => lesson.status !== "cancelled")
    .map((lesson) => lessonAsExternalAssignment(db, lesson))
    .filter(Boolean);

  const lockedDraftAssignments = (db.scheduleDrafts || [])
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
      for (let index = 0; index < remaining; index += 1) {
        const lessonNumber = (existingCounts.get(countKey) || 0) + 1;
        const nextId = nextAssignmentId(usedIds, schoolClass.id, subject.id, lessonNumber);
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
          teacherIds: subject.teacherIds || [],
          durationMinutes: subject.durationMinutes || DEFAULT_LESSON_DURATION_MINUTES,
          difficulty: 80 - Math.min((subject.teacherIds || []).length, 12) * 5 + Number(subject.weeklyLessons || 0) * 3,
        });
      }
    });
  });

  return tasks;
}

function assignmentFromCandidate(config, task, candidate) {
  const room = roomById(config, task.roomId);
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
    roomId: room?.id || task.roomId,
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

  slots.forEach((slot) => {
    if (state.classBusy.get(task.classId)?.has(slot.slotKey)) return;
    if ((state.roomBusy.get(task.roomId) || new Set()).has(slot.slotKey)) return;
    if (firstScheduleConstraintViolation(config, task.subjectId, slot)) return;
    if (subjectHardRuleViolation(config, task.subjectId, slot, state.assignments, task.classId)) return;

    task.teacherIds.forEach((teacherId) => {
      if ((state.teacherBusy.get(teacherId) || new Set()).has(slot.slotKey)) return;
      const teacherDayLoad = state.teacherDayLoad.get(teacherDayKey(teacherId, slot.date)) || 0;
      const teacherPeriods = state.teacherDayPeriods.get(teacherDayPeriodKey(teacherId, slot.date)) || [];
      if (teacherHardRuleViolation(config, teacherId, slot, teacherDayLoad, teacherPeriods)) return;
      candidates.push({
        slot,
        teacherId,
        score: candidateSoftScore(config, state, task, slot, teacherId, random),
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

function buildScheduleDiagnostics(config, options = {}) {
  const lockedAssignments = (options.lockedAssignments || [])
    .filter((assignment) => assignment.locked)
    .map((assignment) => normalizeLockedAssignment(config, assignment));
  const externalAssignments = options.externalAssignments || [];
  const slots = schedulingSlots(config);
  const diagnostics = [];

  config.subjects.forEach((subject) => {
    if (!subject.teacherIds?.length) {
      diagnostics.push({
        severity: "error",
        title: `${subject.name} 没有可排老师`,
        text: "请先在教师池里至少选择 1 位任课老师，否则该科目无法生成排课。",
      });
      return;
    }
    const demand = config.classes.length * Number(subject.weeklyLessons || 0);
    const weeklyCapacity = subject.teacherIds.reduce((sum, teacherId) => {
      const rule = teacherScheduleRuleFor(config, teacherId);
      return sum + Number(rule?.maxDailyLessons || 4) * 5;
    }, 0);
    if (weeklyCapacity > 0 && demand > weeklyCapacity) {
      diagnostics.push({
        severity: "warning",
        title: `${subject.name} 老师池容量偏紧`,
        text: `本年级需要 ${demand} 节，当前老师池按每日上限估算最多 ${weeklyCapacity} 节，建议增加老师或放宽课量上限。`,
      });
    }
  });

  const state = createSolverState(config, lockedAssignments, externalAssignments);
  const tasks = buildScheduleTasks(config, lockedAssignments);
  tasks.slice(0, 80).forEach((task) => {
    const candidates = buildCandidateList(config, state, task, slots, seededRandom(hashString(task.id)));
    if (candidates.length) return;
    diagnostics.push({
      severity: "error",
      title: `${task.className} ${task.subjectName} 没有可用候选`,
      text: "当前老师池、老师不可用时间、教室/班级占用或课程硬约束共同作用后，没有任何可排时段。",
    });
  });

  if (!diagnostics.length) {
    diagnostics.push({
      severity: "ok",
      title: "排课准备度正常",
      text: "老师池、硬约束和全校老师时间线具备可行候选，若仍然求解失败，优先检查锁定课过多或软约束过紧。",
    });
  }

  return diagnostics.slice(0, 12);
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
    hashString(`${config.divisionId}:${config.gradeId}:${config.weekStart}:${tasks.length}:${externalAssignments.length}`);
  const startedAt = Date.now();
  const deadline = startedAt + solverOptions.timeoutMs;
  const requiredCount = requiredScheduleLessonCount(config);
  let best = null;
  let attemptsRun = 0;
  let totalNodes = 0;

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
    if (best.unassignedCount === 0 && best.conflicts.length === 0 && Date.now() > startedAt + solverOptions.timeoutMs * 0.55) {
      break;
    }
  }

  const assignments = (best?.assignments || lockedAssignments).sort((a, b) =>
    `${a.classId} ${a.date} ${a.period}`.localeCompare(`${b.classId} ${b.date} ${b.period}`),
  );

  return {
    assignments,
    conflicts: best?.conflicts || validateScheduleConflicts(assignments, { externalAssignments, config }),
    meta: {
      algorithm: "advanced-constraint-search",
      description: "硬约束求解 + MRV 最难课节优先 + 多轮扰动搜索 + 有限回溯 + 软约束评分",
      attemptsRun,
      totalNodes,
      score: Math.round(best?.score || scheduleQualityScore(config, assignments)),
      unassignedCount: Math.max(requiredCount - assignments.length, 0),
      requiredLessonCount: requiredCount,
      generatedLessonCount: assignments.length,
      lockedCount: lockedAssignments.length,
      externalBusyCount: externalAssignments.length,
      diagnostics: buildScheduleDiagnostics(config, { lockedAssignments, externalAssignments }),
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
      timeLimitSeconds: Number(options.cpSatTimeLimitSeconds || options.solver?.cpSatTimeLimitSeconds || 10),
      workers: Number(options.cpSatWorkers || options.solver?.cpSatWorkers || 8),
      candidateLimit: Number(options.cpSatCandidateLimit || options.solver?.cpSatCandidateLimit || 120),
    },
  };

  const result = spawnSync(pythonBin, [ORTOOLS_SOLVER_PATH], {
    input: JSON.stringify(payload),
    encoding: "utf8",
    timeout: Number(options.cpSatProcessTimeoutMs || options.solver?.cpSatProcessTimeoutMs || 45000),
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
      message: parsed.message || "OR-Tools 求解器未返回可用课表",
    };
  }

  const requiredCount = requiredScheduleLessonCount(config);
  const diagnostics = buildScheduleDiagnostics(config, { lockedAssignments, externalAssignments });
  const assignments = (parsed.assignments || []).sort((a, b) =>
    `${a.classId} ${a.date} ${a.period}`.localeCompare(`${b.classId} ${b.date} ${b.period}`),
  );
  const conflicts = validateScheduleConflicts(assignments, { externalAssignments, config });

  return {
    ok: true,
    assignments,
    conflicts,
    meta: {
      algorithm: "ortools-cp-sat",
      description: "Google OR-Tools CP-SAT 约束规划求解器",
      status: parsed.status || "UNKNOWN",
      objectiveValue: Number(parsed.objectiveValue || 0),
      bestObjectiveBound: Number(parsed.bestObjectiveBound || 0),
      solveTimeSeconds: Number(parsed.solveTimeSeconds || 0),
      branches: Number(parsed.branches || 0),
      conflicts: Number(parsed.conflicts || 0),
      wallTimeMs: Number(parsed.wallTimeMs || 0),
      unassignedCount: Math.max(requiredCount - assignments.length, 0),
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
    fallback.meta.diagnostics = buildScheduleDiagnostics(config, options);
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

function draftKey(divisionId, gradeId) {
  return `${divisionId}:${gradeId}`;
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
    db.scheduleDrafts.find(
      (draft) => draft.divisionId === config.divisionId && draft.gradeId === config.gradeId,
    ) || null;
  return refreshDraftConflicts(db, config, draft);
}

export function generateScheduleDraft(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  const externalAssignments = globalTeacherBusyAssignments(db, config);
  const solution = generateScheduleSolution(config, { externalAssignments });
  const assignments = solution.assignments;
  const conflicts = solution.conflicts || validateScheduleConflicts(assignments, { externalAssignments, config });
  const now = formatDateTimeMinute();
  const requiredCount = requiredScheduleLessonCount(config);
  const draft = {
    id: `DRAFT-${draftKey(config.divisionId, config.gradeId)}-${Date.now()}`,
    status: "draft",
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
    solver: solution.meta,
    lockedCount: 0,
    publishedLessonIds: [],
    generatedByAccountId: actorAccount?.id || "",
  };

  db.scheduleDrafts = db.scheduleDrafts.filter(
    (item) => !(item.divisionId === config.divisionId && item.gradeId === config.gradeId),
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

function lessonFromAssignment(draft, assignment) {
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
    date: assignment.date,
    time: assignment.time,
    type: "regular",
    units: 1,
    status: "scheduled",
    checkInAt: "",
    checkOutAt: "",
    source: "backend-scheduling",
    schedulingDraftId: draft.id,
    scheduleAssignmentId: assignment.id,
    divisionId: draft.divisionId,
    gradeId: draft.gradeId,
    stageId: draft.stageId,
    grade: draft.grade,
    period: assignment.period,
  };
}

export function publishScheduleDraft(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
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

  const now = formatDateTimeMinute();
  const lessons = draft.assignments.map((assignment) => lessonFromAssignment(draft, assignment));
  db.lessonInstances = db.lessonInstances
    .filter(
      (lesson) =>
        !(
          lesson.source === "backend-scheduling" &&
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
  pushScheduleNotification(
    db,
    {
      teacherIds: lessons.map((lesson) => lesson.teacherId),
      title: `${draft.divisionName}${draft.gradeName}课表已发布`,
      text: `自然周 ${draft.weekStart} 起的课表已发布到老师端，请按课表完成签入签出。`,
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
    lessonCount: lessons.length,
    createdAt: db.meta.updatedAt,
  });

  return { config, draft, lessons };
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
  if (!teacherCanTeachSubject(config, next.teacherId, lesson.subjectId)) {
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
  const config = buildSchedulingConfig(db, { divisionId: request.divisionId, gradeId: request.gradeId });
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
  lesson.changeRequestId = request.id;
  lesson.changedAt = now;
  lesson.changedByAccountId = actorAccount?.id || "";

  const draft = findScheduleDraft(db, { divisionId: request.divisionId, gradeId: request.gradeId });
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
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    createdAt: now,
  });

  return { config: buildSchedulingConfig(db, { divisionId: request.divisionId, gradeId: request.gradeId }), draft, request, lesson };
}

export function adjustScheduleAssignment(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
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
  if (!teacherCanTeachSubject(config, nextTeacherId, assignment.subjectId)) {
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

export function regenerateUnlockedScheduleAssignments(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
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

  const lockedAssignments = (draft.assignments || []).filter((assignment) => assignment.locked);
  const externalAssignments = globalTeacherBusyAssignments(db, config);
  const solution = generateScheduleSolution(config, { lockedAssignments, externalAssignments });
  const assignments = solution.assignments;
  const conflicts = solution.conflicts || validateScheduleConflicts(assignments, { externalAssignments, config });
  const now = formatDateTimeMinute();

  draft.assignments = assignments;
  draft.conflicts = conflicts;
  draft.generatedLessonCount = assignments.length;
  draft.unassignedCount = Math.max((draft.requiredLessonCount || requiredScheduleLessonCount(config)) - assignments.length, 0);
  draft.lockedCount = lockedAssignments.length;
  draft.globalBusyCount = externalAssignments.length;
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
    lockedCount: lockedAssignments.length,
    assignmentCount: assignments.length,
    conflictCount: conflicts.length,
    solverAlgorithm: solution.meta.algorithm,
    solverScore: solution.meta.score,
    solverAttemptsRun: solution.meta.attemptsRun,
    createdAt: db.meta.updatedAt,
  });

  return { config, draft };
}
