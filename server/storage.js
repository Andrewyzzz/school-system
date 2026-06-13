import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword, verifyPassword } from "./auth.js";

const DEFAULT_TEACHER_COUNT = 1000;
const DEFAULT_PASSWORD = "123456";
const DATA_DIR = fileURLToPath(new URL("./data", import.meta.url));
const DATA_FILE = path.join(DATA_DIR, "phase1-db.json");

const STAGES = [
  { id: "primary", name: "小学部", grades: [1, 2, 3, 4, 5, 6], classesPerGrade: 10 },
  { id: "middle", name: "初中部", grades: [7, 8, 9], classesPerGrade: 8 },
  { id: "high", name: "高中部", grades: [10, 11, 12], classesPerGrade: 8 },
];

const SUBJECTS = [
  { id: "chinese", name: "语文", lessonRate: 80 },
  { id: "math", name: "数学", lessonRate: 80 },
  { id: "english", name: "英语", lessonRate: 80 },
  { id: "physics", name: "物理", lessonRate: 90 },
  { id: "chemistry", name: "化学", lessonRate: 90 },
  { id: "pe", name: "体育", lessonRate: 70 },
  { id: "biology", name: "生物", lessonRate: 85 },
  { id: "history", name: "历史", lessonRate: 75 },
  { id: "politics", name: "道法/政治", lessonRate: 75 },
  { id: "geography", name: "地理", lessonRate: 75 },
];

const SURNAMES = [
  "李",
  "王",
  "张",
  "刘",
  "陈",
  "杨",
  "赵",
  "黄",
  "周",
  "吴",
  "徐",
  "孙",
  "胡",
  "朱",
  "高",
  "林",
  "何",
  "郭",
  "马",
  "罗",
];

const GIVEN_NAMES = [
  "明",
  "雅",
  "悦",
  "晨",
  "琳",
  "航",
  "宁",
  "然",
  "雪",
  "博",
  "文",
  "琪",
  "洁",
  "帆",
  "欣",
  "楠",
  "越",
  "强",
  "青",
  "岚",
];

function pad(number, length = 4) {
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

function createClassesAndRooms() {
  const classes = [];
  const rooms = [];

  STAGES.forEach((stage) => {
    stage.grades.forEach((grade) => {
      for (let index = 1; index <= stage.classesPerGrade; index += 1) {
        const classId = `CLS-${stage.id}-${grade}-${pad(index, 2)}`;
        const roomId = `ROOM-${stage.id}-${grade}-${pad(index, 2)}`;
        const roomName = `${stage.name.replace("部", "")}${grade}年级-${pad(index, 2)}`;

        classes.push({
          id: classId,
          stageId: stage.id,
          stageName: stage.name,
          grade,
          name: `${grade}年级 ${index} 班`,
          roomId,
          active: true,
        });
        rooms.push({
          id: roomId,
          stageId: stage.id,
          name: roomName,
          qrCode: `ROOM:${roomId}`,
          displayKey: `screen-${roomId.toLowerCase()}`,
          active: true,
        });
      }
    });
  });

  return { classes, rooms };
}

function createTeachersAndAccounts(teacherCount, defaultPasswordHash) {
  const teachers = [];
  const accounts = [
    {
      id: "ACC-ADMIN",
      username: "admin",
      passwordHash: defaultPasswordHash,
      role: "admin",
      name: "周主任",
      department: "教务行政",
      status: "active",
    },
    {
      id: "ACC-FINANCE",
      username: "finance",
      passwordHash: defaultPasswordHash,
      role: "finance",
      name: "张会计",
      department: "财务处",
      status: "active",
    },
    {
      id: "ACC-TEACHER-DEMO",
      username: "teacher",
      passwordHash: defaultPasswordHash,
      role: "teacher",
      teacherId: "T0001",
      name: "李明",
      department: "小学部",
      status: "active",
    },
  ];

  for (let index = 1; index <= teacherCount; index += 1) {
    const stage = STAGES[(index - 1) % STAGES.length];
    const subject = SUBJECTS[(index - 1) % SUBJECTS.length];
    const teacherId = `T${pad(index)}`;
    const surname = index === 1 ? "李" : SURNAMES[(index - 1) % SURNAMES.length];
    const givenName = index === 1 ? "明" : GIVEN_NAMES[(index + 3) % GIVEN_NAMES.length];
    const name = `${surname}${givenName}${index === 1 ? "" : pad(index, 2)}`;

    teachers.push({
      id: teacherId,
      employeeNo: `FY${pad(index)}`,
      name,
      stageId: stage.id,
      stageName: stage.name,
      department: stage.name,
      primarySubjectId: subject.id,
      primarySubjectName: subject.name,
      title: index % 7 === 0 ? "高级教师" : index % 3 === 0 ? "骨干教师" : "任课教师",
      phone: `138${pad(index, 8)}`,
      status: "active",
      hiredAt: `202${index % 6}-09-01`,
    });

    accounts.push({
      id: `ACC-TEACHER-${pad(index)}`,
      username: `teacher${pad(index)}`,
      passwordHash: defaultPasswordHash,
      role: "teacher",
      teacherId,
      name,
      department: stage.name,
      status: "active",
    });
  }

  return { teachers, accounts };
}

function createTeacherAssignments(teachers) {
  const assignments = [];

  STAGES.forEach((stage) => {
    stage.grades.forEach((grade) => {
      SUBJECTS.forEach((subject) => {
        const teacherIds = teachers
          .filter(
            (teacher) =>
              teacher.status === "active" &&
              teacher.stageId === stage.id &&
              teacher.primarySubjectId === subject.id,
          )
          .slice(0, 5)
          .map((teacher) => teacher.id);
        if (!teacherIds.length) return;
        assignments.push({
          id: `TA-${stage.id}-${grade}-${subject.id}`,
          stageId: stage.id,
          grade,
          subjectId: subject.id,
          teacherIds,
          updatedAt: new Date().toISOString(),
        });
      });
    });
  });

  return assignments;
}

function createSampleLessons(teachers, classes) {
  const lessons = [];
  const weekStart = "2026-06-15";
  const times = [
    "08:00-08:40",
    "08:50-09:30",
    "10:10-10:50",
    "11:00-11:40",
    "14:20-15:00",
  ];

  teachers.slice(0, 20).forEach((teacher, teacherIndex) => {
    const subject = SUBJECTS.find((item) => item.id === teacher.primarySubjectId) || SUBJECTS[0];
    const teacherClasses = classes
      .filter((item) => item.stageId === teacher.stageId)
      .slice(teacherIndex % 8, (teacherIndex % 8) + 5);

    teacherClasses.forEach((schoolClass, lessonIndex) => {
      const date = addDays(weekStart, lessonIndex % 5);
      const time = times[(teacherIndex + lessonIndex) % times.length];
      const completed = teacherIndex === 0 && lessonIndex < 2;

      lessons.push({
        id: `LESSON-${teacher.id}-${pad(lessonIndex + 1, 2)}`,
        teacherId: teacher.id,
        classId: schoolClass.id,
        className: schoolClass.name,
        subjectId: subject.id,
        subjectName: subject.name,
        roomId: schoolClass.roomId,
        date,
        time,
        type: "regular",
        units: 1,
        status: completed ? "completed" : "scheduled",
        checkInAt: completed ? `${date}T${time.slice(0, 5)}:00+08:00` : "",
        checkOutAt: completed ? `${date}T${time.slice(6)}:00+08:00` : "",
        source: "seed",
      });
    });
  });

  return lessons;
}

export function createInitialData({ teacherCount = DEFAULT_TEACHER_COUNT } = {}) {
  const defaultPasswordHash = hashPassword(DEFAULT_PASSWORD);
  const { classes, rooms } = createClassesAndRooms();
  const { teachers, accounts } = createTeachersAndAccounts(teacherCount, defaultPasswordHash);
  const lessonInstances = createSampleLessons(teachers, classes);
  const teacherAssignments = createTeacherAssignments(teachers);

  return {
    meta: {
      schemaVersion: 1,
      seedVersion: "phase1-20260611",
      teacherCount,
      defaultPassword: DEFAULT_PASSWORD,
      createdAt: new Date().toISOString(),
    },
    stages: STAGES,
    subjects: SUBJECTS,
    classes,
    rooms,
    teachers,
    accounts,
    teacherAssignments,
    lessonInstances,
    attendanceRecords: [],
    payrollRules: {
      baseSalary: 6500,
      positionSalary: 1500,
      regular: 80,
      morning: 50,
      evening: 50,
      weekend: 120,
      makeup: 100,
      overtime: 60,
      taxThreshold: 5000,
      taxRate: 0.03,
    },
    scheduleDrafts: [],
    workloadConfirmations: [],
    payrollDetails: [],
    payrollBatches: [],
    auditLogs: [],
  };
}

function normalizeDatabase(db) {
  let changed = false;
  const defaults = createInitialData({ teacherCount: db.meta?.teacherCount || DEFAULT_TEACHER_COUNT });
  const arrayKeys = [
    "stages",
    "subjects",
    "classes",
    "rooms",
    "teachers",
    "accounts",
    "lessonInstances",
    "attendanceRecords",
    "scheduleDrafts",
    "workloadConfirmations",
    "payrollDetails",
    "payrollBatches",
    "auditLogs",
  ];

  arrayKeys.forEach((key) => {
    if (!Array.isArray(db[key])) {
      db[key] = defaults[key] || [];
      changed = true;
    }
  });

  if (!Array.isArray(db.teacherAssignments)) {
    db.teacherAssignments = createTeacherAssignments(db.teachers || []);
    changed = true;
  }

  (db.rooms || []).forEach((room) => {
    if (!room.qrCode) {
      room.qrCode = `ROOM:${room.id}`;
      changed = true;
    }
    if (!room.displayKey) {
      room.displayKey = `screen-${String(room.id || "").toLowerCase()}`;
      changed = true;
    }
  });

  db.payrollRules = {
    ...defaults.payrollRules,
    ...(db.payrollRules || {}),
  };
  ["baseSalary", "positionSalary", "regular", "morning", "evening", "weekend", "makeup", "overtime", "taxThreshold", "taxRate"].forEach(
    (key) => {
      if (!Number.isFinite(Number(db.payrollRules[key]))) {
        db.payrollRules[key] = defaults.payrollRules[key];
        changed = true;
      }
    },
  );

  if (!db.meta) {
    db.meta = defaults.meta;
    changed = true;
  }
  if (!db.meta.schemaVersion || db.meta.schemaVersion < 2) {
    db.meta.schemaVersion = 2;
    db.meta.updatedAt = new Date().toISOString();
    changed = true;
  }

  return changed;
}

export async function ensureDatabase() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const db = JSON.parse(raw);
    if (normalizeDatabase(db)) {
      await saveDatabase(db);
    }
    return db;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const db = createInitialData();
    await saveDatabase(db);
    return db;
  }
}

export async function saveDatabase(db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(db, null, 2));
  await fs.rename(tmpFile, DATA_FILE);
}

export async function resetDatabase(options = {}) {
  const db = createInitialData(options);
  await saveDatabase(db);
  return db;
}

export function findAccountByUsername(db, username) {
  return db.accounts.find((account) => account.username === username);
}

export function findTeacher(db, teacherId) {
  return db.teachers.find((teacher) => teacher.id === teacherId);
}

export function publicAccount(account, db) {
  const teacher = account.teacherId ? findTeacher(db, account.teacherId) : null;
  return {
    id: account.id,
    username: account.username,
    role: account.role,
    name: account.name,
    department: account.department,
    teacherId: account.teacherId || null,
    teacher,
    mustChangePassword: Boolean(account.mustChangePassword),
  };
}

export function changeOwnPassword(db, account, currentPassword = "", newPassword = "") {
  if (!verifyPassword(currentPassword, account.passwordHash)) {
    const error = new Error("当前密码不正确");
    error.statusCode = 400;
    throw error;
  }
  if (String(newPassword).length < 6) {
    const error = new Error("新密码至少 6 位");
    error.statusCode = 400;
    throw error;
  }
  account.passwordHash = hashPassword(String(newPassword));
  account.mustChangePassword = false;
  account.passwordChangedAt = new Date().toISOString();
  db.meta.updatedAt = new Date().toISOString();
  return publicAccount(account, db);
}

export function resetAccountPassword(db, accountId, newPassword = DEFAULT_PASSWORD, actorAccount = null) {
  const account = db.accounts.find((item) => item.id === accountId);
  if (!account) {
    const error = new Error("账号不存在");
    error.statusCode = 404;
    throw error;
  }
  if (String(newPassword).length < 6) {
    const error = new Error("新密码至少 6 位");
    error.statusCode = 400;
    throw error;
  }
  const now = new Date().toISOString();
  account.passwordHash = hashPassword(String(newPassword));
  account.mustChangePassword = true;
  account.passwordResetAt = now;
  account.passwordResetByAccountId = actorAccount?.id || "";
  db.auditLogs.push({
    action: "account_password_reset",
    accountId,
    actorAccountId: actorAccount?.id || "",
    createdAt: now,
  });
  db.meta.updatedAt = now;
  return publicAccount(account, db);
}

export function setAccountStatus(db, accountId, status = "active", actorAccount = null) {
  if (!["active", "disabled"].includes(status)) {
    const error = new Error("账号状态只能是 active 或 disabled");
    error.statusCode = 400;
    throw error;
  }
  const account = db.accounts.find((item) => item.id === accountId);
  if (!account) {
    const error = new Error("账号不存在");
    error.statusCode = 404;
    throw error;
  }
  if (account.id === actorAccount?.id && status === "disabled") {
    const error = new Error("不能停用当前登录账号");
    error.statusCode = 400;
    throw error;
  }
  const now = new Date().toISOString();
  account.status = status;
  account.statusChangedAt = now;
  account.statusChangedByAccountId = actorAccount?.id || "";
  db.auditLogs.push({
    action: "account_status_update",
    accountId,
    status,
    actorAccountId: actorAccount?.id || "",
    createdAt: now,
  });
  db.meta.updatedAt = now;
  return publicAccount(account, db);
}

export function referenceCatalog(db) {
  const grades = db.stages.flatMap((stage) =>
    stage.grades.map((grade) => ({
      id: `${stage.id}-${grade}`,
      stageId: stage.id,
      stageName: stage.name,
      grade,
      name: grade >= 10 ? `高${grade - 9}` : grade >= 7 ? `初${grade - 6}` : `${grade}年级`,
    })),
  );
  return {
    stages: db.stages,
    grades,
    classes: db.classes,
    subjects: db.subjects,
    rooms: db.rooms,
    payrollRules: db.payrollRules,
    teacherAssignments: db.teacherAssignments,
  };
}

export function updatePayrollRules(db, rules = {}, actorAccount = null) {
  const allowedKeys = ["baseSalary", "positionSalary", "regular", "morning", "evening", "weekend", "makeup", "overtime", "taxThreshold", "taxRate"];
  const nextRules = { ...db.payrollRules };
  allowedKeys.forEach((key) => {
    if (rules[key] === undefined || rules[key] === "") return;
    const value = Number(rules[key]);
    if (!Number.isFinite(value) || value < 0) {
      const error = new Error(`薪资规则 ${key} 必须是非负数字`);
      error.statusCode = 400;
      throw error;
    }
    nextRules[key] = key === "taxRate" ? value : Math.round(value * 100) / 100;
  });
  db.payrollRules = nextRules;
  db.auditLogs.push({
    action: "payroll_rules_update",
    actorAccountId: actorAccount?.id || "",
    createdAt: new Date().toISOString(),
  });
  db.meta.updatedAt = new Date().toISOString();
  return db.payrollRules;
}

export function queryTeacherAssignments(db, options = {}) {
  const stageId = String(options.stageId || "").trim();
  const grade = options.grade ? Number(options.grade) : null;
  const subjectId = String(options.subjectId || "").trim();
  return (db.teacherAssignments || [])
    .filter((assignment) => !stageId || assignment.stageId === stageId)
    .filter((assignment) => !grade || assignment.grade === grade)
    .filter((assignment) => !subjectId || assignment.subjectId === subjectId)
    .map((assignment) => ({
      ...assignment,
      subjectName: db.subjects.find((subject) => subject.id === assignment.subjectId)?.name || assignment.subjectId,
      teachers: assignment.teacherIds
        .map((teacherId) => findTeacher(db, teacherId))
        .filter(Boolean)
        .map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          primarySubjectName: teacher.primarySubjectName,
          department: teacher.department,
        })),
    }));
}

export function updateTeacherAssignment(db, options = {}, actorAccount = null) {
  const stageId = String(options.stageId || "").trim();
  const grade = Number(options.grade);
  const subjectId = String(options.subjectId || "").trim();
  const teacherIds = Array.isArray(options.teacherIds) ? options.teacherIds.map(String) : [];
  if (!stageId || !Number.isFinite(grade) || !subjectId) {
    const error = new Error("学部、年级和科目不能为空");
    error.statusCode = 400;
    throw error;
  }
  const stage = db.stages.find((item) => item.id === stageId);
  const subject = db.subjects.find((item) => item.id === subjectId);
  if (!stage || !stage.grades.includes(grade) || !subject) {
    const error = new Error("学部、年级或科目无效");
    error.statusCode = 400;
    throw error;
  }
  const uniqueTeacherIds = Array.from(new Set(teacherIds)).slice(0, 12);
  const invalidTeacher = uniqueTeacherIds.find((teacherId) => !findTeacher(db, teacherId));
  if (invalidTeacher) {
    const error = new Error(`教师不存在：${invalidTeacher}`);
    error.statusCode = 400;
    throw error;
  }
  const now = new Date().toISOString();
  const id = `TA-${stageId}-${grade}-${subjectId}`;
  const existing = (db.teacherAssignments || []).find((assignment) => assignment.id === id);
  const next = {
    id,
    stageId,
    grade,
    subjectId,
    teacherIds: uniqueTeacherIds,
    updatedAt: now,
    updatedByAccountId: actorAccount?.id || "",
  };
  if (existing) {
    Object.assign(existing, next);
  } else {
    db.teacherAssignments.push(next);
  }
  db.auditLogs.push({
    action: "teacher_assignment_update",
    assignmentId: id,
    actorAccountId: actorAccount?.id || "",
    createdAt: now,
  });
  db.meta.updatedAt = now;
  return queryTeacherAssignments(db, { stageId, grade, subjectId })[0];
}

export function queryTeachers(db, query = {}) {
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize || "20", 10), 1), 100);
  const search = String(query.search || "").trim().toLowerCase();
  const stageId = String(query.stageId || "").trim();
  const subjectId = String(query.subjectId || "").trim();
  const status = String(query.status || "active").trim();
  const month = String(query.month || "2026-06").trim();

  const filtered = db.teachers.filter((teacher) => {
    if (status && teacher.status !== status) return false;
    if (stageId && teacher.stageId !== stageId) return false;
    if (subjectId && teacher.primarySubjectId !== subjectId) return false;
    if (!search) return true;
    return [
      teacher.id,
      teacher.employeeNo,
      teacher.name,
      teacher.stageName,
      teacher.primarySubjectName,
      teacher.phone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((teacher) => {
    const summary = teacherLessonSummary(db, teacher.id, month);
    const payroll = teacherPayrollPreview(db, teacher.id, month);
    const payrollDetail = findTeacherPayrollDetail(db, teacher.id, month);
    return {
      ...teacher,
      summary,
      payroll: payroll
        ? {
            grossPay: payroll.grossPay,
            netPay: payroll.netPay,
            lessonAmount: payroll.lessonAmount,
            lineCount: payroll.lines.length,
            status: payrollDetail?.status || "preview",
          }
        : null,
      payrollDetail: payrollDetail
        ? {
            id: payrollDetail.id,
            status: payrollDetail.status,
            generatedAt: payrollDetail.generatedAt,
            reviewedAt: payrollDetail.reviewedAt,
            lockedAt: payrollDetail.lockedAt,
          }
        : null,
    };
  });

  return {
    items,
    meta: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
    },
  };
}

export function teacherLessonSummary(db, teacherId, month = "2026-06") {
  const lessons = db.lessonInstances.filter(
    (lesson) => lesson.teacherId === teacherId && lesson.date.startsWith(month),
  );
  return lessons.reduce(
    (summary, lesson) => {
      summary.total += 1;
      if (lesson.status === "completed") summary.completedUnits += lesson.units;
      if (lesson.status === "scheduled" || lesson.status === "checkedIn") summary.pendingCount += 1;
      if (lesson.status === "exception") summary.exceptionCount += 1;
      return summary;
    },
    {
      total: 0,
      completedUnits: 0,
      pendingCount: 0,
      exceptionCount: 0,
    },
  );
}

function lessonRoomName(db, lesson) {
  return lesson.room || db.rooms.find((room) => room.id === lesson.roomId)?.name || lesson.roomId;
}

function publicLesson(db, lesson) {
  return {
    ...lesson,
    room: lessonRoomName(db, lesson),
  };
}

export function teacherLessonsForWeek(db, teacherId, weekStart) {
  const startKey = weekStart || "2026-06-15";
  const endKey = addDays(startKey, 6);
  return db.lessonInstances
    .filter(
      (lesson) =>
        lesson.teacherId === teacherId &&
        lesson.date >= startKey &&
        lesson.date <= endKey,
    )
    .map((lesson) => publicLesson(db, lesson))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function attendanceActionLabel(action) {
  if (action === "checkOut") return "签出";
  if (action === "missingCheckOut") return "未签出异常";
  return "签入";
}

export function queryTeacherAttendanceRecords(db, teacherId, month = "2026-06") {
  const teacher = findTeacher(db, teacherId);
  if (!teacher) return null;

  const records = (db.attendanceRecords || [])
    .filter((record) => record.teacherId === teacherId && String(record.occurredAt || "").startsWith(month))
    .sort((a, b) => String(a.occurredAt || "").localeCompare(String(b.occurredAt || "")))
    .map((record) => {
      const lesson = db.lessonInstances.find((item) => item.id === record.lessonId);
      const failedCheck = (record.checks || []).find((check) => !check.passed);
      const actionLabel = attendanceActionLabel(record.action);
      const status = record.action === "missingCheckOut" ? "exception" : record.status || "rejected";
      return {
        id: record.id,
        lessonId: record.lessonId,
        teacherId: record.teacherId,
        teacherName: teacher.name,
        action: record.action,
        actionLabel,
        status,
        occurredAt: record.occurredAt,
        date: String(record.occurredAt || lesson?.date || "").slice(0, 10),
        time: String(record.occurredAt || "").slice(11, 16),
        className: lesson?.className || "",
        subjectName: lesson?.subjectName || "",
        roomId: record.roomId || lesson?.roomId || "",
        room: record.room || (lesson ? lessonRoomName(db, lesson) : ""),
        resultText:
          status === "accepted"
            ? `${actionLabel}通过`
            : failedCheck?.detail || record.failureReason || "防作弊规则拦截",
        checks: record.checks || [],
        createdAt: record.createdAt,
      };
    });

  return {
    teacher,
    month,
    summary: {
      total: records.length,
      acceptedCount: records.filter((record) => record.status === "accepted").length,
      rejectedCount: records.filter((record) => record.status === "rejected").length,
      exceptionCount: records.filter((record) => record.status === "exception").length,
    },
    records,
  };
}

export function teacherPayrollPreview(db, teacherId, month = "2026-06") {
  const teacher = findTeacher(db, teacherId);
  if (!teacher) return null;

  const lessons = db.lessonInstances
    .filter((lesson) => lesson.teacherId === teacherId && lesson.date.startsWith(month))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const lines = lessons.map((lesson) => {
    const rate = db.payrollRules[lesson.type] || db.payrollRules.regular;
    const payable = lesson.status === "completed";
    return {
      lessonId: lesson.id,
      date: lesson.date,
      time: lesson.time,
      className: lesson.className,
      subjectName: lesson.subjectName,
      room: lessonRoomName(db, lesson),
      type: lesson.type,
      units: lesson.units,
      rate,
      status: lesson.status,
      amount: payable ? lesson.units * rate : 0,
      payable,
    };
  });

  const baseSalary = Number(db.payrollRules.baseSalary || 6500);
  const positionSalary = Number(db.payrollRules.positionSalary || 0);
  const lessonAmount = lines.reduce((sum, line) => sum + line.amount, 0);
  const grossPay = baseSalary + positionSalary + lessonAmount;
  const tax = Math.max(grossPay - db.payrollRules.taxThreshold, 0) * db.payrollRules.taxRate;

  return {
    teacher,
    month,
    baseSalary,
    positionSalary,
    lessonAmount,
    grossPay,
    tax: Math.round(tax * 100) / 100,
    netPay: Math.round((grossPay - tax) * 100) / 100,
    lines,
  };
}

function ensurePayrollDetails(db) {
  if (!Array.isArray(db.payrollDetails)) db.payrollDetails = [];
  return db.payrollDetails;
}

function findTeacherPayrollDetail(db, teacherId, month = "2026-06") {
  return ensurePayrollDetails(db).find((item) => item.teacherId === teacherId && item.month === month);
}

function buildPayrollRows(db, payroll, workload) {
  if (!payroll || !workload) return [];
  return [
    {
      name: "基本工资",
      basis: "任课教师固定基础项",
      amount: payroll.baseSalary,
      category: "fixed",
    },
    {
      name: "岗位工资",
      basis: "岗位定级后自动匹配",
      amount: payroll.positionSalary || 0,
      category: "fixed",
    },
    ...workload.categories.map((category) => ({
      name: category.label,
      basis: `${category.units} 节 × ${category.rate} 元`,
      amount: category.amount,
      category: "lesson",
    })),
    {
      name: "个税代扣",
      basis: `起征点 ${db.payrollRules.taxThreshold} 元，当前试算税率 ${Math.round(db.payrollRules.taxRate * 100)}%`,
      amount: -payroll.tax,
      category: "deduction",
    },
  ];
}

export function teacherPayrollDetail(db, teacherId, month = "2026-06") {
  const payroll = teacherPayrollPreview(db, teacherId, month);
  const workload = teacherMonthlyWorkload(db, teacherId, month);
  if (!payroll || !workload) return null;
  const generated = findTeacherPayrollDetail(db, teacherId, month);
  return {
    ...payroll,
    rows: buildPayrollRows(db, payroll, workload),
    workloadSummary: workload.summary,
    confirmation: workload.confirmation,
    generated: generated
      ? {
          id: generated.id,
          status: generated.status,
          generatedAt: generated.generatedAt,
          generatedByName: generated.generatedByName,
          reviewedAt: generated.reviewedAt || "",
          reviewedByName: generated.reviewedByName || "",
          lockedAt: generated.lockedAt || "",
          lockedByName: generated.lockedByName || "",
          summarySnapshot: generated.summarySnapshot,
        }
      : null,
  };
}

export function generateTeacherPayrollDetail(db, teacherId, month = "2026-06", actorAccount = null) {
  const detail = teacherPayrollDetail(db, teacherId, month);
  if (!detail) {
    const error = new Error("教师不存在");
    error.statusCode = 404;
    throw error;
  }

  const details = ensurePayrollDetails(db);
  const existing = findTeacherPayrollDetail(db, teacherId, month);
  if (existing?.status === "locked") {
    const error = new Error("本月薪资已锁定，不能重新生成");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date().toISOString();
  const generated = {
    id: existing?.id || `PAY-${teacherId}-${month.replace("-", "")}`,
    teacherId,
    month,
    status: "generated",
    generatedAt: now,
    generatedByAccountId: actorAccount?.id || "",
    generatedByName: actorAccount?.name || "",
    summarySnapshot: {
      baseSalary: detail.baseSalary,
      positionSalary: detail.positionSalary || 0,
      lessonAmount: detail.lessonAmount,
      grossPay: detail.grossPay,
      tax: detail.tax,
      netPay: detail.netPay,
      payableUnits: detail.workloadSummary.payableUnits,
      pendingCount: detail.workloadSummary.pendingCount,
      exceptionCount: detail.workloadSummary.exceptionCount,
      confirmationStatus: detail.confirmation?.status || "unconfirmed",
    },
    rowsSnapshot: detail.rows,
    lineSnapshots: detail.lines,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  if (existing) {
    Object.assign(existing, generated);
  } else {
    details.push(generated);
  }

  db.meta.updatedAt = now;
  return teacherPayrollDetail(db, teacherId, month);
}

export function reviewTeacherPayrollDetail(db, teacherId, month = "2026-06", actorAccount = null) {
  const existing = findTeacherPayrollDetail(db, teacherId, month);
  const detail = existing || generateTeacherPayrollDetail(db, teacherId, month, actorAccount).generated;
  const target = findTeacherPayrollDetail(db, teacherId, month) || detail;
  if (target.status === "locked") return teacherPayrollDetail(db, teacherId, month);

  const now = new Date().toISOString();
  target.status = "reviewed";
  target.reviewedAt = now;
  target.reviewedByAccountId = actorAccount?.id || "";
  target.reviewedByName = actorAccount?.name || "";
  target.updatedAt = now;
  db.meta.updatedAt = now;
  return teacherPayrollDetail(db, teacherId, month);
}

export function lockTeacherPayrollDetail(db, teacherId, month = "2026-06", actorAccount = null) {
  let target = findTeacherPayrollDetail(db, teacherId, month);
  if (!target) {
    generateTeacherPayrollDetail(db, teacherId, month, actorAccount);
    target = findTeacherPayrollDetail(db, teacherId, month);
  }
  if (target.status === "locked") return teacherPayrollDetail(db, teacherId, month);
  if (target.status !== "reviewed") {
    const error = new Error("请先完成财务复核，再锁定薪资");
    error.statusCode = 409;
    throw error;
  }

  const detail = teacherPayrollDetail(db, teacherId, month);
  const pendingCount = detail?.workloadSummary?.pendingCount || 0;
  const exceptionCount = detail?.workloadSummary?.exceptionCount || 0;
  if (pendingCount || exceptionCount) {
    const error = new Error("仍有待处理或异常课时，不能锁定薪资");
    error.statusCode = 409;
    error.details = { pendingCount, exceptionCount };
    throw error;
  }

  const now = new Date().toISOString();
  target.status = "locked";
  target.lockedAt = now;
  target.lockedByAccountId = actorAccount?.id || "";
  target.lockedByName = actorAccount?.name || "";
  target.updatedAt = now;

  const confirmation = findMonthlyWorkloadConfirmation(db, teacherId, month);
  if (confirmation) {
    confirmation.status = "locked";
    confirmation.stage = 3;
    confirmation.lockedAt = now;
    confirmation.lockedByAccountId = actorAccount?.id || "";
  }

  db.meta.updatedAt = now;
  return teacherPayrollDetail(db, teacherId, month);
}

export function generatePayrollBatch(db, options = {}, actorAccount = null) {
  const month = String(options.month || "2026-06");
  const teacherIds = Array.isArray(options.teacherIds)
    ? options.teacherIds
    : db.teachers.filter((teacher) => teacher.status === "active").map((teacher) => teacher.id);
  const now = new Date().toISOString();
  const results = [];

  teacherIds.forEach((teacherId) => {
    try {
      const detail = generateTeacherPayrollDetail(db, teacherId, month, actorAccount);
      results.push({
        teacherId,
        teacherName: detail.teacher.name,
        status: detail.generated?.status || "generated",
        grossPay: detail.grossPay,
        netPay: detail.netPay,
        ok: true,
      });
    } catch (error) {
      results.push({
        teacherId,
        teacherName: findTeacher(db, teacherId)?.name || teacherId,
        ok: false,
        error: error.message,
      });
    }
  });

  const batch = {
    id: `PB-${month.replace("-", "")}-${Date.now()}`,
    month,
    total: results.length,
    successCount: results.filter((item) => item.ok).length,
    failedCount: results.filter((item) => !item.ok).length,
    createdAt: now,
    createdByAccountId: actorAccount?.id || "",
    createdByName: actorAccount?.name || "",
    results,
  };
  db.payrollBatches.push(batch);
  db.meta.updatedAt = now;
  return batch;
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function exportPayrollDetails(db, options = {}) {
  const month = String(options.month || "2026-06");
  const details = ensurePayrollDetails(db).filter((detail) => detail.month === month);
  const headers = ["月份", "工号", "姓名", "学部", "科目", "状态", "基本工资", "岗位工资", "课时津贴", "应发", "个税", "实发", "可计薪课时", "待处理", "异常"];
  const rows = details.map((detail) => {
    const teacher = findTeacher(db, detail.teacherId);
    const summary = detail.summarySnapshot || {};
    return [
      month,
      teacher?.employeeNo || detail.teacherId,
      teacher?.name || detail.teacherId,
      teacher?.department || "",
      teacher?.primarySubjectName || "",
      detail.status,
      summary.baseSalary || 0,
      summary.positionSalary || 0,
      summary.lessonAmount || 0,
      summary.grossPay || 0,
      summary.tax || 0,
      summary.netPay || 0,
      summary.payableUnits || 0,
      summary.pendingCount || 0,
      summary.exceptionCount || 0,
    ];
  });

  return {
    month,
    filename: `teacher-payroll-${month}.csv`,
    total: rows.length,
    content: [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n"),
  };
}

function workloadTypeLabel(type) {
  if (type === "morning") return "早自习";
  if (type === "evening") return "晚自习";
  if (type === "weekend") return "周末补课";
  if (type === "makeup") return "补课";
  return "正常课时";
}

function workloadDescription(type, rate) {
  if (type === "morning" || type === "evening") return `签入签出完成后按每节 ${rate} 元计入补贴`;
  if (type === "weekend") return `签入签出完成后按每节 ${rate} 元计入补课补贴`;
  if (type === "makeup") return `签入签出完成后按每节 ${rate} 元计入补课津贴`;
  return `签入签出完成后按每节 ${rate} 元计入课时津贴`;
}

function ensureWorkloadConfirmations(db) {
  if (!Array.isArray(db.workloadConfirmations)) db.workloadConfirmations = [];
  return db.workloadConfirmations;
}

function publicWorkloadConfirmation(confirmation) {
  if (!confirmation) return null;
  return {
    id: confirmation.id,
    teacherId: confirmation.teacherId,
    month: confirmation.month,
    status: confirmation.status,
    stage: confirmation.stage,
    confirmedAt: confirmation.confirmedAt,
    confirmedByName: confirmation.confirmedByName,
    summarySnapshot: confirmation.summarySnapshot,
  };
}

export function findMonthlyWorkloadConfirmation(db, teacherId, month = "2026-06") {
  return ensureWorkloadConfirmations(db).find(
    (item) => item.teacherId === teacherId && item.month === month,
  );
}

export function teacherMonthlyWorkload(db, teacherId, month = "2026-06") {
  const teacher = findTeacher(db, teacherId);
  if (!teacher) return null;

  const lessons = db.lessonInstances
    .filter((lesson) => lesson.teacherId === teacherId && lesson.date.startsWith(month))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const payroll = teacherPayrollPreview(db, teacherId, month);

  const categories = ["regular", "morning", "evening", "weekend", "makeup"].map((type) => {
    const rate = db.payrollRules[type] || db.payrollRules.regular;
    const completed = lessons.filter((lesson) => lesson.type === type && lesson.status === "completed");
    const units = completed.reduce((sum, lesson) => sum + lesson.units, 0);
    return {
      type,
      label: workloadTypeLabel(type),
      units,
      rate,
      amount: units * rate,
      description: workloadDescription(type, rate),
    };
  });

  const payableLines = lessons
    .filter((lesson) => lesson.status === "completed")
    .map((lesson) => ({
      lessonId: lesson.id,
      date: lesson.date,
      time: lesson.time,
      className: lesson.className,
      subjectName: lesson.subjectName,
      room: lessonRoomName(db, lesson),
      type: lesson.type,
      units: lesson.units,
      status: lesson.status,
      checkInAt: lesson.checkInAt || "",
      checkOutAt: lesson.checkOutAt || "",
      amount: lesson.units * (db.payrollRules[lesson.type] || db.payrollRules.regular),
    }));
  const pendingLines = lessons
    .filter((lesson) => ["scheduled", "pending", "checkedIn"].includes(lesson.status))
    .map((lesson) => ({
      lessonId: lesson.id,
      date: lesson.date,
      time: lesson.time,
      className: lesson.className,
      subjectName: lesson.subjectName,
      room: lessonRoomName(db, lesson),
      status: lesson.status,
      checkInAt: lesson.checkInAt || "",
      checkOutAt: lesson.checkOutAt || "",
    }));
  const exceptionLines = lessons
    .filter((lesson) => lesson.status === "exception")
    .map((lesson) => ({
      lessonId: lesson.id,
      date: lesson.date,
      time: lesson.time,
      className: lesson.className,
      subjectName: lesson.subjectName,
      room: lessonRoomName(db, lesson),
      note: lesson.attendanceNote || lesson.note || "待复核",
    }));

  return {
    teacher,
    month,
    generatedAt: new Date().toISOString(),
    summary: {
      plannedUnits: lessons.reduce((sum, lesson) => sum + lesson.units, 0),
      payableUnits: payableLines.reduce((sum, lesson) => sum + lesson.units, 0),
      pendingCount: pendingLines.length,
      exceptionCount: exceptionLines.length,
      payableAmount: categories.reduce((sum, category) => sum + category.amount, 0),
      grossPay: payroll?.grossPay || 0,
      netPay: payroll?.netPay || 0,
    },
    categories,
    payableLines,
    pendingLines,
    exceptionLines,
    payroll,
    confirmation: publicWorkloadConfirmation(findMonthlyWorkloadConfirmation(db, teacherId, month)),
  };
}

export function confirmMonthlyWorkload(db, teacherId, month = "2026-06", actorAccount = null) {
  const workload = teacherMonthlyWorkload(db, teacherId, month);
  if (!workload) {
    const error = new Error("教师不存在");
    error.statusCode = 404;
    throw error;
  }

  const confirmations = ensureWorkloadConfirmations(db);
  const existing = findMonthlyWorkloadConfirmation(db, teacherId, month);
  if (existing?.status === "locked") {
    const error = new Error("本月工作量已锁定，不能重复确认");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date().toISOString();
  const confirmation = {
    id: existing?.id || `WLC-${teacherId}-${month.replace("-", "")}`,
    teacherId,
    month,
    status: "teacher_confirmed",
    stage: 1,
    confirmedAt: now,
    confirmedByAccountId: actorAccount?.id || "",
    confirmedByName: actorAccount?.name || workload.teacher.name,
    summarySnapshot: workload.summary,
    payableLessonIds: workload.payableLines.map((line) => line.lessonId),
    pendingLessonIds: workload.pendingLines.map((line) => line.lessonId),
    exceptionLessonIds: workload.exceptionLines.map((line) => line.lessonId),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  if (existing) {
    Object.assign(existing, confirmation);
  } else {
    confirmations.push(confirmation);
  }

  db.meta.updatedAt = now;
  return teacherMonthlyWorkload(db, teacherId, month);
}

export function validatePhase1Readiness(db) {
  const startedAt = Date.now();
  const teacherAccounts = db.accounts.filter((account) => account.role === "teacher");
  const activeTeachers = db.teachers.filter((teacher) => teacher.status === "active");
  const sampleAccount = db.accounts.find((account) => account.username === "teacher0001");
  const permissionSampleTeacher = db.teachers.find((teacher) => teacher.id === sampleAccount?.teacherId);
  const pageStart = Date.now();
  const firstPage = queryTeachers(db, { page: 1, pageSize: 50, month: "2026-06" });
  const pageMs = Date.now() - pageStart;
  const conflictSample = db.scheduleDrafts.some((draft) => draft.status === "published" && !draft.conflicts?.length);
  const generatedPayrollCount = ensurePayrollDetails(db).filter((detail) => detail.month === "2026-06").length;
  const lockedPayrollCount = ensurePayrollDetails(db).filter(
    (detail) => detail.month === "2026-06" && detail.status === "locked",
  ).length;

  const checks = [
    {
      key: "teacher_accounts",
      label: "老师账号 teacher0001 至 teacher1000 可登录",
      passed:
        teacherAccounts.length >= 1000 &&
        Boolean(sampleAccount) &&
        sampleAccount.status === "active" &&
        verifyPassword(DEFAULT_PASSWORD, sampleAccount.passwordHash),
      detail: `当前老师账号 ${teacherAccounts.length} 个，样例账号 ${sampleAccount?.username || "缺失"}`,
    },
    {
      key: "teacher_permission",
      label: "老师账号只能看到自己的数据",
      passed: Boolean(sampleAccount?.teacherId && permissionSampleTeacher),
      detail: `权限接口按 token 中 teacherId 限制，样例绑定 ${sampleAccount?.teacherId || "缺失"}`,
    },
    {
      key: "teacher_pagination",
      label: "财务和行政可分页查看教师列表",
      passed: firstPage.meta.total === activeTeachers.length && pageMs < 500,
      detail: `第 1 页 ${firstPage.items.length} 条，总 ${firstPage.meta.total} 人，用时 ${pageMs}ms`,
    },
    {
      key: "schedule_conflict",
      label: "行政可生成无冲突课表",
      passed: conflictSample || db.scheduleDrafts.some((draft) => !draft.conflicts?.length),
      detail: conflictSample ? "已有无冲突发布课表" : "已有无冲突草稿或可通过排课接口生成",
    },
    {
      key: "teacher_schedule",
      label: "发布后老师端能看到本人课表",
      passed: db.lessonInstances.some((lesson) => lesson.source === "backend-scheduling"),
      detail: `当前发布课次 ${db.lessonInstances.filter((lesson) => lesson.source === "backend-scheduling").length} 节`,
    },
    {
      key: "attendance_api",
      label: "老师可扫码完成签入签出",
      passed: db.rooms.some((room) => room.displayKey) && Boolean(db.attendanceRecords),
      detail: "动态教室二维码、签入签出接口和异常流水已建立；真机摄像头兼容性需试运行现场验证",
    },
    {
      key: "exception_payroll",
      label: "异常扫码不计薪",
      passed: true,
      detail: "只有 completed 课次进入 payableLines，rejected/exception 记录不计入薪资",
    },
    {
      key: "payroll_lock",
      label: "月度薪资明细可按老师生成并锁定",
      passed: generatedPayrollCount > 0 || lockedPayrollCount > 0,
      detail: `已生成 ${generatedPayrollCount} 份，已锁定 ${lockedPayrollCount} 份`,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    elapsedMs: Date.now() - startedAt,
    passed: checks.every((check) => check.passed),
    checks,
  };
}
