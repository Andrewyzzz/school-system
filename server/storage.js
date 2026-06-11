import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./auth.js";

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
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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
    lessonInstances,
    attendanceRecords: [],
    payrollRules: {
      regular: 80,
      morning: 50,
      evening: 50,
      weekend: 120,
      taxThreshold: 5000,
      taxRate: 0.03,
    },
    scheduleDrafts: [],
    payrollBatches: [],
    auditLogs: [],
  };
}

export async function ensureDatabase() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
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
  };
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
    return {
      ...teacher,
      summary,
      payroll: payroll
        ? {
            grossPay: payroll.grossPay,
            netPay: payroll.netPay,
            lessonAmount: payroll.lessonAmount,
            lineCount: payroll.lines.length,
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
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
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
      type: lesson.type,
      units: lesson.units,
      rate,
      status: lesson.status,
      amount: payable ? lesson.units * rate : 0,
      payable,
    };
  });

  const baseSalary = 6500;
  const lessonAmount = lines.reduce((sum, line) => sum + line.amount, 0);
  const grossPay = baseSalary + lessonAmount;
  const tax = Math.max(grossPay - db.payrollRules.taxThreshold, 0) * db.payrollRules.taxRate;

  return {
    teacher,
    month,
    baseSalary,
    lessonAmount,
    grossPay,
    tax: Math.round(tax * 100) / 100,
    netPay: Math.round((grossPay - tax) * 100) / 100,
    lines,
  };
}
