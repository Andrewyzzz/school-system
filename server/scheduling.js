const PERIODS = [
  { period: 1, time: "08:00-08:40" },
  { period: 2, time: "08:50-09:30" },
  { period: 3, time: "10:10-10:50" },
  { period: 4, time: "11:00-11:40" },
  { period: 5, time: "14:20-15:00" },
  { period: 6, time: "15:20-16:00" },
];

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
      { subjectId: "pe", weeklyLessons: 2 },
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
      { subjectId: "pe", weeklyLessons: 2 },
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
      { subjectId: "pe", weeklyLessons: 2 },
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
}

function divisionById(divisionId = "elementary") {
  return DIVISIONS.find((division) => division.id === divisionId) || DIVISIONS[0];
}

function gradeById(division, gradeId = "") {
  return division.grades.find((grade) => grade.id === gradeId) || division.grades[0];
}

function subjectById(db, subjectId) {
  return db.subjects.find((subject) => subject.id === subjectId);
}

function activeSubjectTeachers(db, subjectId, limit = 5) {
  return db.teachers
    .filter((teacher) => teacher.status === "active" && teacher.primarySubjectId === subjectId)
    .slice(0, limit);
}

function schedulingTeacherRows(db, subjects) {
  const teacherIds = new Set(subjects.flatMap((subject) => subject.teacherIds));
  return db.teachers
    .filter((teacher) => teacherIds.has(teacher.id))
    .map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      subject: teacher.primarySubjectName,
      department: teacher.department,
    }));
}

function schedulingSubjects(db, division) {
  return division.subjectRules
    .map((rule) => {
      const subject = subjectById(db, rule.subjectId);
      const teachers = activeSubjectTeachers(db, rule.subjectId);
      return subject
        ? {
            id: subject.id,
            name: subject.name,
            weeklyLessons: rule.weeklyLessons,
            teacherIds: teachers.map((teacher) => teacher.id),
          }
        : null;
    })
    .filter(Boolean)
    .filter((subject) => subject.teacherIds.length > 0);
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
  const subjects = schedulingSubjects(db, division);
  const classes = schedulingClasses(db, division, grade);

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

function buildClassSubjectQueue(config, classIndex) {
  const counters = new Map(config.subjects.map((subject) => [subject.id, subject.weeklyLessons]));
  const targetCount = config.subjects.reduce((sum, subject) => sum + subject.weeklyLessons, 0);
  const queue = [];
  let round = 0;

  while (queue.length < targetCount) {
    config.subjects.forEach((subject, subjectIndex) => {
      if ((counters.get(subject.id) || 0) <= 0) return;
      if ((round + classIndex + subjectIndex) % 2 === 0 || counters.get(subject.id) > 2) {
        queue.push(subject);
        counters.set(subject.id, counters.get(subject.id) - 1);
      }
    });
    round += 1;
  }

  return queue;
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

function dayIndexForDate(config, date) {
  return weekDateKeys(config).indexOf(date);
}

export function generateScheduleAssignments(config) {
  const slots = schedulingSlots(config);
  const assignments = [];
  const teacherBusy = new Map();
  const classBusy = new Map();
  const teacherLoad = new Map(config.teachers.map((teacher) => [teacher.id, 0]));

  config.classes.forEach((schoolClass, classIndex) => {
    classBusy.set(schoolClass.id, new Set());
    const subjectQueue = buildClassSubjectQueue(config, classIndex);

    subjectQueue.forEach((subject, lessonIndex) => {
      let best = null;

      slots.forEach((slot) => {
        if (classBusy.get(schoolClass.id).has(slot.slotKey)) return;
        const sameSubjectDayCount = countClassSubjectOnDay(assignments, schoolClass.id, subject.id, slot.date);
        if (sameSubjectDayCount >= 2) return;

        subject.teacherIds.forEach((teacherId) => {
          const busySlots = teacherBusy.get(teacherId) || new Set();
          if (busySlots.has(slot.slotKey)) return;

          const load = teacherLoad.get(teacherId) || 0;
          const score = load * 12 + sameSubjectDayCount * 8 + slot.period + slot.dayIndex * 0.25;
          if (!best || score < best.score) {
            best = { slot, teacherId, score };
          }
        });
      });

      if (!best) return;

      const assignment = {
        id: `SCH-${schoolClass.id}-${subject.id}-${pad(lessonIndex + 1)}`,
        classId: schoolClass.id,
        className: schoolClass.name,
        subjectId: subject.id,
        subjectName: subject.name,
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
      teacherLoad.set(best.teacherId, (teacherLoad.get(best.teacherId) || 0) + 1);
    });
  });

  return assignments.sort((a, b) =>
    `${a.classId} ${a.date} ${a.period}`.localeCompare(`${b.classId} ${b.date} ${b.period}`),
  );
}

export function validateScheduleConflicts(assignments) {
  const conflicts = [];
  const teacherSlots = new Map();
  const classSlots = new Map();
  const roomSlots = new Map();

  assignments.forEach((assignment) => {
    const teacherKey = `${assignment.teacherId}-${assignment.date}-${assignment.period}`;
    if (!teacherSlots.has(teacherKey)) teacherSlots.set(teacherKey, []);
    teacherSlots.get(teacherKey).push(assignment);

    const classKey = `${assignment.classId}-${assignment.date}-${assignment.period}`;
    if (!classSlots.has(classKey)) classSlots.set(classKey, []);
    classSlots.get(classKey).push(assignment);

    const roomKey = `${assignment.roomId || assignment.room}-${assignment.date}-${assignment.period}`;
    if (!roomSlots.has(roomKey)) roomSlots.set(roomKey, []);
    roomSlots.get(roomKey).push(assignment);
  });

  teacherSlots.forEach((items) => {
    if (items.length <= 1) return;
    conflicts.push({
      type: "teacher",
      title: `${items[0].teacherName} 同一时间被安排 ${items.length} 节课`,
      text: `${formatDate(items[0].date)} 第 ${items[0].period} 节 ${items[0].time}：${items
        .map((item) => `${item.className}${item.subjectName}`)
        .join("、")}`,
    });
  });

  classSlots.forEach((items) => {
    if (items.length <= 1) return;
    conflicts.push({
      type: "class",
      title: `${items[0].className} 同一时间有 ${items.length} 节课`,
      text: `${formatDate(items[0].date)} 第 ${items[0].period} 节 ${items[0].time}：${items
        .map((item) => item.subjectName)
        .join("、")}`,
    });
  });

  roomSlots.forEach((items) => {
    if (items.length <= 1) return;
    conflicts.push({
      type: "room",
      title: `${items[0].room} 同一时间被安排 ${items.length} 节课`,
      text: `${formatDate(items[0].date)} 第 ${items[0].period} 节 ${items[0].time}：${items
        .map((item) => `${item.className}${item.subjectName}`)
        .join("、")}`,
    });
  });

  return conflicts;
}

function draftKey(divisionId, gradeId) {
  return `${divisionId}:${gradeId}`;
}

export function findScheduleDraft(db, options = {}) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  return (
    db.scheduleDrafts.find(
      (draft) => draft.divisionId === config.divisionId && draft.gradeId === config.gradeId,
    ) || null
  );
}

export function generateScheduleDraft(db, options = {}, actorAccount = null) {
  ensureSchedulingStore(db);
  const config = buildSchedulingConfig(db, options);
  const assignments = generateScheduleAssignments(config);
  const conflicts = validateScheduleConflicts(assignments);
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

  const conflicts = validateScheduleConflicts(draft.assignments || []);
  if (conflicts.length) {
    draft.conflicts = conflicts;
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
  draft.publishedLessonIds = lessons.map((lesson) => lesson.id);
  draft.publishedByAccountId = actorAccount?.id || "";
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

  const nextRoomId = String(options.roomId || assignment.roomId || "");
  const nextRoom = roomById(config, nextRoomId);
  if (!nextRoom) {
    const error = new Error("调整教室不在当前年级可用教室范围内");
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
  assignment.date = nextDate;
  assignment.dayIndex = nextDayIndex;
  assignment.period = period.period;
  assignment.time = period.time;
  assignment.roomId = nextRoom.id;
  assignment.room = nextRoom.name;
  assignment.adjustedAt = formatDateTimeMinute();
  assignment.adjustedByAccountId = actorAccount?.id || "";

  draft.conflicts = validateScheduleConflicts(draft.assignments || []);
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
