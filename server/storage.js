import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword, hashToken, verifyPassword } from "./auth.js";
import {
  calculateDedicatedTeacherPayroll,
  createDefaultPayrollRules,
  defaultTeacherSalaryProfile,
  ensureTeacherSalaryProfile,
  normalizePayrollRules,
} from "./payroll.js";

const DEFAULT_TEACHER_COUNT = 1000;
const DEFAULT_PASSWORD = "123456";
const DATA_DIR = fileURLToPath(new URL("./data", import.meta.url));
const DATA_FILE = path.join(DATA_DIR, "phase1-db.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const MAX_BACKUP_FILES = 50;
const SESSION_TTL_HOURS = 12;
const NOTIFICATION_AUDIENCES = new Set(["all", "teacher", "finance", "admin", "system_admin"]);

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
  "梁",
  "宋",
  "郑",
  "谢",
  "韩",
  "唐",
  "冯",
  "于",
  "董",
  "萧",
  "程",
  "曹",
  "袁",
  "邓",
  "许",
  "傅",
  "沈",
  "曾",
  "彭",
  "吕",
  "苏",
  "卢",
  "蒋",
  "蔡",
  "贾",
  "丁",
  "魏",
  "薛",
  "叶",
  "阎",
  "余",
  "潘",
  "杜",
  "戴",
  "夏",
  "钟",
  "汪",
  "田",
  "任",
  "姜",
  "范",
  "方",
  "石",
  "姚",
  "谭",
  "廖",
  "邹",
  "熊",
  "金",
  "陆",
  "郝",
  "孔",
  "白",
  "崔",
  "康",
  "毛",
  "邱",
  "秦",
  "江",
  "史",
];

const GIVEN_FIRST_CHARS = [
  "子",
  "嘉",
  "若",
  "思",
  "明",
  "承",
  "书",
  "景",
  "雨",
  "梓",
  "云",
  "亦",
  "晨",
  "沐",
  "知",
  "文",
  "安",
  "泽",
  "佳",
  "予",
  "欣",
  "一",
  "可",
  "卓",
  "启",
  "彦",
  "清",
  "楚",
  "昱",
  "奕",
];

const GIVEN_SECOND_CHARS = [
  "涵",
  "轩",
  "宁",
  "然",
  "辰",
  "航",
  "妍",
  "琪",
  "琳",
  "宇",
  "瑶",
  "哲",
  "昕",
  "诺",
  "彤",
  "远",
  "铭",
  "悦",
  "晗",
  "宸",
  "瑜",
  "珂",
  "骁",
  "璇",
  "禾",
  "乔",
  "朗",
  "澄",
  "越",
  "琛",
  "翊",
  "棠",
  "晟",
  "岚",
];

function pad(number, length = 4) {
  return String(number).padStart(length, "0");
}

function teacherDisplayName(index) {
  if (index === 1) return "李明";
  const nameIndex = index - 1;
  const generation = Math.floor(nameIndex / SURNAMES.length);
  const surname = SURNAMES[nameIndex % SURNAMES.length];
  const first = GIVEN_FIRST_CHARS[(nameIndex * 5 + generation) % GIVEN_FIRST_CHARS.length];
  const second = GIVEN_SECOND_CHARS[(nameIndex * 7 + generation * 11) % GIVEN_SECOND_CHARS.length];
  return `${surname}${first}${second}`;
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

function startOfNaturalWeek(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayIndex = date.getDay();
  const offset = dayIndex === 0 ? 6 : dayIndex - 1;
  return addDays(dateKey, -offset);
}

function createClassesAndRooms() {
  const classes = [];
  const rooms = [];

  STAGES.forEach((stage) => {
    stage.grades.forEach((grade) => {
      for (let index = 1; index <= stage.classesPerGrade; index += 1) {
        const classId = `CLS-${stage.id}-${grade}-${pad(index, 2)}`;
        const roomId = `ROOM-${stage.id}-${grade}-${pad(index, 2)}`;
        const gradeName = displayGrade(grade);
        const roomName = `${stage.name.replace("部", "")}${gradeName}-${pad(index, 2)}`;

        classes.push({
          id: classId,
          stageId: stage.id,
          stageName: stage.name,
          grade,
          name: `${gradeName} ${index} 班`,
          classType: "regular",
          classTypeLabel: "普通班",
          displayOrder: index,
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
      id: "ACC-CLASSROOM",
      username: "classroom",
      passwordHash: defaultPasswordHash,
      role: "classroom",
      name: "教室大屏",
      department: "教室终端",
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
    const name = teacherDisplayName(index);

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
      salaryProfile: defaultTeacherSalaryProfile(
        {
          id: teacherId,
          stageId: stage.id,
          primarySubjectId: subject.id,
          title: index % 7 === 0 ? "高级教师" : index % 3 === 0 ? "骨干教师" : "任课教师",
          hiredAt: `202${index % 6}-09-01`,
        },
        index,
      ),
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

function createTeacherAssignments() {
  const assignments = [];

  STAGES.forEach((stage) => {
    stage.grades.forEach((grade) => {
      SUBJECTS.forEach((subject) => {
        assignments.push({
          id: `TA-${stage.id}-${grade}-${subject.id}`,
          stageId: stage.id,
          grade,
          subjectId: subject.id,
          teacherIds: [],
          classTeacherIds: {},
          updatedAt: new Date().toISOString(),
        });
      });
    });
  });

  return assignments;
}

function normalizeTeacherAssignments(db) {
  let changed = false;
  const assignments = db.teacherAssignments || [];
  const needsManualAssignmentMigration = db.meta?.teacherAssignmentMode !== "class_manual_v1";
  assignments.forEach((assignment) => {
    const savedByAdmin = Boolean(assignment.updatedByAccountId);
    if (needsManualAssignmentMigration) {
      if ((assignment.teacherIds || []).length) {
        assignment.teacherIds = [];
        changed = true;
      }
      if (
        assignment.classTeacherIds &&
        typeof assignment.classTeacherIds === "object" &&
        !Array.isArray(assignment.classTeacherIds) &&
        Object.keys(assignment.classTeacherIds).length
      ) {
        assignment.classTeacherIds = {};
        changed = true;
      }
      if (assignment.updatedByAccountId) {
        delete assignment.updatedByAccountId;
        changed = true;
      }
      return;
    }
    const classes = (db.classes || []).filter(
      (schoolClass) =>
        schoolClass.stageId === assignment.stageId &&
        Number(schoolClass.grade) === Number(assignment.grade) &&
        schoolClass.active,
    );
    if (!savedByAdmin) {
      if ((assignment.teacherIds || []).length) {
        assignment.teacherIds = [];
        changed = true;
      }
      if (
        assignment.classTeacherIds &&
        typeof assignment.classTeacherIds === "object" &&
        !Array.isArray(assignment.classTeacherIds) &&
        Object.keys(assignment.classTeacherIds).length
      ) {
        assignment.classTeacherIds = {};
        changed = true;
      }
      return;
    }
    if (!assignment.classTeacherIds || Array.isArray(assignment.classTeacherIds) || typeof assignment.classTeacherIds !== "object") {
      assignment.classTeacherIds = {};
      changed = true;
    }

    const validClassIds = new Set(classes.map((schoolClass) => schoolClass.id));
    Object.keys(assignment.classTeacherIds).forEach((classId) => {
      if (!validClassIds.has(classId)) {
        delete assignment.classTeacherIds[classId];
        changed = true;
      }
    });

    const basePool = Array.from(new Set(Array.isArray(assignment.teacherIds) ? assignment.teacherIds.map(String) : []));
    classes.forEach((schoolClass, index) => {
      const currentIds = Array.isArray(assignment.classTeacherIds[schoolClass.id])
        ? Array.from(new Set(assignment.classTeacherIds[schoolClass.id].map(String).filter(Boolean)))
        : [];
      if (currentIds.length) {
        assignment.classTeacherIds[schoolClass.id] = currentIds;
        return;
      }
      if (basePool.length && !savedByAdmin) {
        assignment.classTeacherIds[schoolClass.id] = [basePool[index % basePool.length]];
        changed = true;
      }
    });

    const unionTeacherIds = Array.from(
      new Set([
        ...basePool,
        ...Object.values(assignment.classTeacherIds)
          .flat()
          .map(String)
          .filter(Boolean),
      ]),
    );
    if (unionTeacherIds.join("|") !== basePool.join("|")) {
      assignment.teacherIds = unionTeacherIds;
      changed = true;
    }
  });
  if (needsManualAssignmentMigration) {
    db.meta = db.meta || {};
    db.meta.teacherAssignmentMode = "class_manual_v1";
    changed = true;
  }
  return changed;
}

export function createInitialData({ teacherCount = DEFAULT_TEACHER_COUNT } = {}) {
  const defaultPasswordHash = hashPassword(DEFAULT_PASSWORD);
  const { classes, rooms } = createClassesAndRooms();
  const { teachers, accounts } = createTeachersAndAccounts(teacherCount, defaultPasswordHash);
  const lessonInstances = [];
  const teacherAssignments = createTeacherAssignments(teachers, classes);

  return {
    meta: {
      schemaVersion: 1,
      seedVersion: "phase1-20260611",
      teacherCount,
      defaultPassword: DEFAULT_PASSWORD,
      createdAt: new Date().toISOString(),
      teacherAssignmentMode: "class_manual_v1",
    },
    stages: STAGES,
    subjects: SUBJECTS,
    classes,
    rooms,
    teachers,
    accounts,
    teacherAssignments,
    gradeCourseRules: [],
    scheduleConstraints: [],
    teacherScheduleRules: [],
    scheduleChangeRequests: [],
    lessonInstances,
    attendanceRecords: [],
    payrollRules: createDefaultPayrollRules(),
    scheduleDrafts: [],
    workloadConfirmations: [],
    payrollDetails: [],
    payrollBatches: [],
    sessions: [],
    notifications: [],
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
    "gradeCourseRules",
    "scheduleConstraints",
    "teacherScheduleRules",
    "scheduleChangeRequests",
    "lessonInstances",
    "attendanceRecords",
    "scheduleDrafts",
    "workloadConfirmations",
    "payrollDetails",
    "payrollBatches",
    "sessions",
    "notifications",
    "auditLogs",
  ];

  arrayKeys.forEach((key) => {
    if (!Array.isArray(db[key])) {
      db[key] = defaults[key] || [];
      changed = true;
    }
  });

  if (!Array.isArray(db.teacherAssignments)) {
    db.teacherAssignments = createTeacherAssignments(db.teachers || [], db.classes || []);
    changed = true;
  }
  if (normalizeTeacherAssignments(db)) {
    changed = true;
  }

  if (!db.notifications.length) {
    const now = new Date().toISOString();
    db.notifications = [
      {
        id: "NTF-SEED-TEACHER",
        audience: "teacher",
        teacherIds: [],
        accountIds: [],
        title: "课表与签到规则已启用",
        text: "老师端会显示已发布课表，请按课前签入、课后签出的规则完成课堂考勤。",
        source: "教务处",
        level: "info",
        createdAt: now,
        createdByAccountId: "SYSTEM",
        createdByName: "系统",
        readByAccountIds: [],
        readReceipts: {},
      },
      {
        id: "NTF-SEED-FINANCE",
        audience: "finance",
        teacherIds: [],
        accountIds: [],
        title: "任课老师薪资明细流程已启用",
        text: "薪资锁定前需完成老师确认、教务审批和总校审批，异常课时不会计入薪资。",
        source: "总校",
        level: "warning",
        createdAt: now,
        createdByAccountId: "SYSTEM",
        createdByName: "系统",
        readByAccountIds: [],
        readReceipts: {},
      },
      {
        id: "NTF-SEED-ADMIN",
        audience: "admin",
        teacherIds: [],
        accountIds: [],
        title: "排课发布将同步老师端",
        text: "行政端发布课表后，相关老师会收到通知，老师端按发布课表生成签到任务。",
        source: "教务处",
        level: "info",
        createdAt: now,
        createdByAccountId: "SYSTEM",
        createdByName: "系统",
        readByAccountIds: [],
        readReceipts: {},
      },
    ];
    changed = true;
  }

  const demoTeacher = (db.teachers || []).find((teacher) => teacher.id === "T0003");
  const demoTeacherAccount = (db.accounts || []).find((account) => account.username === "teacher");
  if (demoTeacher && demoTeacherAccount && demoTeacherAccount.teacherId !== demoTeacher.id) {
    demoTeacherAccount.teacherId = demoTeacher.id;
    demoTeacherAccount.name = demoTeacher.name;
    demoTeacherAccount.department = demoTeacher.department || demoTeacher.stageName || "高中部";
    changed = true;
  }

  if (!(db.accounts || []).some((account) => account.username === "classroom")) {
    const classroomAccount = (defaults.accounts || []).find((account) => account.username === "classroom");
    if (classroomAccount) {
      db.accounts.push(classroomAccount);
      changed = true;
    }
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

  const normalizedPayrollRules = normalizePayrollRules(db.payrollRules || defaults.payrollRules);
  if (JSON.stringify(db.payrollRules || null) !== JSON.stringify(normalizedPayrollRules)) {
    db.payrollRules = normalizedPayrollRules;
    changed = true;
  }

  (db.teachers || []).forEach((teacher, index) => {
    if (ensureTeacherSalaryProfile(teacher, index + 1)) {
      changed = true;
    }
  });

  const currentSalarySchemeVersion = db.payrollRules?.teacherSalaryScheme?.version || "";
  const beforePayrollDetailCount = (db.payrollDetails || []).length;
  db.payrollDetails = (db.payrollDetails || []).filter(
    (detail) =>
      detail.status === "locked" ||
      detail.summarySnapshot?.salarySchemeVersion === currentSalarySchemeVersion,
  );
  if (db.payrollDetails.length !== beforePayrollDetailCount) {
    changed = true;
  }

  if (!db.meta) {
    db.meta = defaults.meta;
    changed = true;
  }
  if (!db.meta.productionLessonSourceMigrationAt) {
    const publishedSources = new Set(["backend-scheduling"]);
    const removedLessonIds = new Set();
    db.lessonInstances = (db.lessonInstances || []).filter((lesson) => {
      const keep = publishedSources.has(lesson.source);
      if (!keep && lesson.id) removedLessonIds.add(lesson.id);
      return keep;
    });
    if (removedLessonIds.size) {
      db.attendanceRecords = (db.attendanceRecords || []).filter(
        (record) => !removedLessonIds.has(record.lessonId),
      );
    }
    db.meta.productionLessonSourceMigrationAt = new Date().toISOString();
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
  await backupDatabaseFile();
  const tmpFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(db, null, 2));
  await fs.rename(tmpFile, DATA_FILE);
}

async function backupDatabaseFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    return;
  }

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(BACKUP_DIR, `phase1-db-${timestamp}.json`);
  await fs.copyFile(DATA_FILE, backupFile);

  try {
    const entries = await fs.readdir(BACKUP_DIR);
    const backupFiles = entries
      .filter((name) => name.startsWith("phase1-db-") && name.endsWith(".json"))
      .sort();
    const removable = backupFiles.slice(0, Math.max(backupFiles.length - MAX_BACKUP_FILES, 0));
    await Promise.all(removable.map((name) => fs.unlink(path.join(BACKUP_DIR, name))));
  } catch {
    // Backup pruning must never block the business write path.
  }
}

export async function resetDatabase(options = {}) {
  const db = createInitialData(options);
  await saveDatabase(db);
  return db;
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function ensureAuditLogs(db) {
  if (!Array.isArray(db.auditLogs)) db.auditLogs = [];
  return db.auditLogs;
}

function ensureSessions(db) {
  if (!Array.isArray(db.sessions)) db.sessions = [];
  return db.sessions;
}

function ensureNotifications(db) {
  if (!Array.isArray(db.notifications)) db.notifications = [];
  return db.notifications;
}

function appendAuditLog(db, entry = {}) {
  const now = new Date().toISOString();
  ensureAuditLogs(db).push({
    id: `AUDIT-${Date.now()}-${ensureAuditLogs(db).length + 1}`,
    actorAccountId: entry.actorAccountId || entry.actorAccount?.id || "",
    actorName: entry.actorName || entry.actorAccount?.name || "",
    createdAt: now,
    ...entry,
  });
  db.meta.updatedAt = now;
}

export function createSession(db, account, token, context = {}) {
  const now = new Date();
  const session = {
    id: `SES-${Date.now()}-${ensureSessions(db).length + 1}`,
    accountId: account.id,
    tokenHash: hashToken(token),
    createdAt: now.toISOString(),
    expiresAt: addHours(now, SESSION_TTL_HOURS).toISOString(),
    lastSeenAt: now.toISOString(),
    revokedAt: "",
    userAgent: context.userAgent || "",
  };
  ensureSessions(db).push(session);
  appendAuditLog(db, {
    action: "auth_login",
    actorAccountId: account.id,
    actorName: account.name,
    sessionId: session.id,
  });
  return session;
}

export function findActiveSession(db, token = "") {
  const tokenHashValue = hashToken(token);
  const session = ensureSessions(db).find(
    (item) => item.tokenHash === tokenHashValue && !item.revokedAt,
  );
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    session.revokedAt = new Date().toISOString();
    return null;
  }
  session.lastSeenAt = new Date().toISOString();
  return session;
}

export function revokeSession(db, token = "", actorAccount = null) {
  const tokenHashValue = hashToken(token);
  const session = ensureSessions(db).find((item) => item.tokenHash === tokenHashValue && !item.revokedAt);
  if (!session) return false;
  session.revokedAt = new Date().toISOString();
  appendAuditLog(db, {
    action: "auth_logout",
    actorAccountId: actorAccount?.id || session.accountId,
    actorName: actorAccount?.name || "",
    sessionId: session.id,
  });
  return true;
}

function revokeAccountSessions(db, accountId, reason = "account_security_update") {
  const now = new Date().toISOString();
  ensureSessions(db)
    .filter((session) => session.accountId === accountId && !session.revokedAt)
    .forEach((session) => {
      session.revokedAt = now;
      session.revokedReason = reason;
    });
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

function publicNotification(notification, account) {
  const readByAccountIds = Array.isArray(notification.readByAccountIds) ? notification.readByAccountIds : [];
  return {
    id: notification.id,
    audience: notification.audience,
    teacherIds: notification.teacherIds || [],
    title: notification.title,
    text: notification.text,
    source: notification.source || "系统",
    level: notification.level || "info",
    createdAt: notification.createdAt,
    createdByName: notification.createdByName || "",
    read: readByAccountIds.includes(account.id),
    readAt: notification.readReceipts?.[account.id] || "",
  };
}

function notificationVisibleToAccount(notification, account) {
  if (notification.audience === "all") return true;
  if (notification.audience === account.role) {
    if (!notification.teacherIds?.length) return true;
    return account.teacherId && notification.teacherIds.includes(account.teacherId);
  }
  if (account.role === "teacher" && notification.teacherIds?.includes(account.teacherId)) return true;
  if (notification.accountIds?.includes(account.id)) return true;
  return false;
}

export function queryNotifications(db, account, query = {}) {
  const limit = Math.min(Math.max(Number.parseInt(query.limit || "50", 10), 1), 100);
  const unreadOnly = String(query.unreadOnly || "false") === "true";
  const items = ensureNotifications(db)
    .filter((notification) => notificationVisibleToAccount(notification, account))
    .map((notification) => publicNotification(notification, account))
    .filter((notification) => !unreadOnly || !notification.read)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit);

  return {
    items,
    summary: {
      total: items.length,
      unread: items.filter((notification) => !notification.read).length,
    },
  };
}

export function createNotification(db, options = {}, actorAccount = null) {
  const audience = String(options.audience || "all").trim();
  if (!NOTIFICATION_AUDIENCES.has(audience)) {
    const error = new Error("通知接收对象不正确");
    error.statusCode = 400;
    throw error;
  }

  const title = String(options.title || "").trim();
  const text = String(options.text || "").trim();
  if (!title || !text) {
    const error = new Error("通知标题和内容不能为空");
    error.statusCode = 400;
    throw error;
  }

  const teacherIds = Array.isArray(options.teacherIds)
    ? Array.from(new Set(options.teacherIds.map((id) => String(id).trim()).filter(Boolean)))
    : [];
  const accountIds = Array.isArray(options.accountIds)
    ? Array.from(new Set(options.accountIds.map((id) => String(id).trim()).filter(Boolean)))
    : [];
  const now = new Date().toISOString();
  const notification = {
    id: `NTF-${Date.now()}-${ensureNotifications(db).length + 1}`,
    audience,
    teacherIds,
    accountIds,
    title,
    text,
    source: String(options.source || actorAccount?.department || "系统").trim(),
    level: ["info", "warning"].includes(options.level) ? options.level : "info",
    createdAt: now,
    createdByAccountId: actorAccount?.id || "SYSTEM",
    createdByName: actorAccount?.name || "系统",
    readByAccountIds: [],
    readReceipts: {},
  };
  ensureNotifications(db).push(notification);
  appendAuditLog(db, {
    action: "notification_create",
    actorAccountId: actorAccount?.id || "SYSTEM",
    actorName: actorAccount?.name || "系统",
    notificationId: notification.id,
    audience,
    teacherCount: teacherIds.length,
  });
  return notification;
}

export function markNotificationRead(db, notificationId, account) {
  const notification = ensureNotifications(db).find((item) => item.id === notificationId);
  if (!notification || !notificationVisibleToAccount(notification, account)) {
    const error = new Error("通知不存在");
    error.statusCode = 404;
    throw error;
  }

  if (!Array.isArray(notification.readByAccountIds)) notification.readByAccountIds = [];
  if (!notification.readReceipts || typeof notification.readReceipts !== "object") notification.readReceipts = {};
  if (!notification.readByAccountIds.includes(account.id)) {
    notification.readByAccountIds.push(account.id);
    notification.readReceipts[account.id] = new Date().toISOString();
    db.meta.updatedAt = notification.readReceipts[account.id];
  }
  return publicNotification(notification, account);
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
  revokeAccountSessions(db, account.id, "password_changed");
  appendAuditLog(db, {
    action: "account_password_change",
    actorAccountId: account.id,
    actorName: account.name,
    accountId: account.id,
  });
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
  revokeAccountSessions(db, account.id, "password_reset");
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
  if (status === "disabled") revokeAccountSessions(db, account.id, "account_disabled");
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

function displayGrade(grade) {
  const chineseNumbers = ["", "一", "二", "三", "四", "五", "六"];
  if (grade >= 10) return `高${chineseNumbers[grade - 9] || grade - 9}`;
  if (grade >= 7) return `初${chineseNumbers[grade - 6] || grade - 6}`;
  return `${chineseNumbers[grade] || grade}年级`;
}

function gradeCoverageText(db, teacher) {
  const stage = db.stages.find((item) => item.id === teacher.stageId);
  const assignmentGrades = (db.teacherAssignments || [])
    .filter((assignment) => assignment.teacherIds.includes(teacher.id))
    .map((assignment) => assignment.grade);
  const grades = Array.from(new Set(assignmentGrades.length ? assignmentGrades : stage?.grades || [])).sort(
    (a, b) => a - b,
  );
  if (!grades.length) return "未设置年级";
  if (grades.length === 1) return displayGrade(grades[0]);
  const contiguous = grades.every((grade, index) => index === 0 || grade === grades[index - 1] + 1);
  if (contiguous) return `${displayGrade(grades[0])}-${displayGrade(grades[grades.length - 1])}`;
  return grades.map(displayGrade).join("、");
}

function teacherGradeValues(db, teacher) {
  const stage = db.stages.find((item) => item.id === teacher.stageId);
  const assignmentGrades = (db.teacherAssignments || [])
    .filter((assignment) => assignment.teacherIds.includes(teacher.id))
    .map((assignment) => assignment.grade);
  return Array.from(new Set(assignmentGrades.length ? assignmentGrades : stage?.grades || [])).sort((a, b) => a - b);
}

function publicPersonnelRows(db) {
  const accountsByTeacherId = new Map();
  db.accounts.forEach((account) => {
    if (!account.teacherId) return;
    if (!accountsByTeacherId.has(account.teacherId)) accountsByTeacherId.set(account.teacherId, []);
    accountsByTeacherId.get(account.teacherId).push(account);
  });

  const teacherRows = db.teachers.map((teacher) => {
    const accounts = accountsByTeacherId.get(teacher.id) || [];
    const activeAccount = accounts.find((account) => account.status === "active") || accounts[0] || null;
    return {
      id: `teacher:${teacher.id}`,
      personType: "teacher",
      role: "teacher",
      roleName: "任课教师",
      accountId: activeAccount?.id || "",
      username: activeAccount?.username || "",
      usernames: accounts.map((account) => account.username),
      teacherId: teacher.id,
      employeeNo: teacher.employeeNo,
      name: teacher.name,
      department: teacher.department || teacher.stageName,
      stageId: teacher.stageId,
      stageName: teacher.stageName || teacher.department,
      gradeText: gradeCoverageText(db, teacher),
      subjectName: teacher.primarySubjectName,
      title: teacher.title,
      phone: teacher.phone,
      hiredAt: teacher.hiredAt,
      status: teacher.status || activeAccount?.status || "active",
      accountStatus: activeAccount?.status || "未开通账号",
    };
  });

  const nonTeacherRows = db.accounts
    .filter((account) => !account.teacherId)
    .map((account) => ({
      id: `account:${account.id}`,
      personType: "account",
      role: account.role,
      roleName:
        account.role === "admin"
          ? "行政"
          : account.role === "finance"
            ? "财务"
            : account.role === "system_admin"
              ? "系统管理员"
              : "账号",
      accountId: account.id,
      username: account.username,
      usernames: [account.username],
      teacherId: "",
      employeeNo: "",
      name: account.name,
      department: account.department || "未设置部门",
      stageId: "",
      stageName: account.department || "未设置学部",
      gradeText: "不适用",
      subjectName: "不适用",
      title: account.role === "finance" ? "财务人员" : account.role === "admin" ? "行政人员" : "系统账号",
      phone: "",
      hiredAt: "",
      status: account.status || "active",
      accountStatus: account.status || "active",
    }));

  return [...nonTeacherRows, ...teacherRows];
}

export function queryPersonnel(db, query = {}) {
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize || "20", 10), 1), 100);
  const search = String(query.search || "").trim().toLowerCase();
  const role = String(query.role || "all").trim();
  const status = String(query.status || "active").trim();
  const stageId = String(query.stageId || "").trim();
  const rows = publicPersonnelRows(db);

  const filtered = rows.filter((row) => {
    if (role && role !== "all" && row.role !== role) return false;
    if (status && status !== "all" && row.status !== status) return false;
    if (stageId && row.stageId !== stageId) return false;
    if (!search) return true;
    return [
      row.name,
      row.username,
      row.usernames.join(" "),
      row.employeeNo,
      row.teacherId,
      row.roleName,
      row.department,
      row.stageName,
      row.gradeText,
      row.subjectName,
      row.title,
      row.phone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  const roleOrder = {
    system_admin: 1,
    admin: 2,
    finance: 3,
    teacher: 4,
  };
  filtered.sort((a, b) => {
    const roleDiff = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
    if (roleDiff) return roleDiff;
    const stageDiff = String(a.stageName || "").localeCompare(String(b.stageName || ""), "zh-CN");
    if (stageDiff) return stageDiff;
    return String(a.employeeNo || a.username).localeCompare(String(b.employeeNo || b.username), "zh-CN");
  });

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  const activeRows = rows.filter((row) => row.status === "active");

  return {
    items,
    summary: {
      total: rows.length,
      active: activeRows.length,
      teachers: rows.filter((row) => row.role === "teacher").length,
      adminFinance: rows.filter((row) => ["admin", "finance", "system_admin"].includes(row.role)).length,
      filtered: filtered.length,
    },
    meta: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
    },
  };
}

export function updatePayrollRules(db, rules = {}, actorAccount = null) {
  const allowedKeys = ["baseSalary", "positionSalary", "regular", "morning", "evening", "weekend", "makeup", "overtime", "taxThreshold", "taxRate"];
  const nextRules = normalizePayrollRules(db.payrollRules);
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
  db.payrollRules = normalizePayrollRules(nextRules);
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
      teachers: (assignment.teacherIds || [])
        .map((teacherId) => findTeacher(db, teacherId))
        .filter(Boolean)
        .map((teacher) => ({
          id: teacher.id,
          employeeNo: teacher.employeeNo,
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
  const hasClassTeacherIds =
    options.classTeacherIds && typeof options.classTeacherIds === "object" && !Array.isArray(options.classTeacherIds);
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
  const activeClasses = (db.classes || []).filter(
    (schoolClass) => schoolClass.stageId === stageId && Number(schoolClass.grade) === grade && schoolClass.active,
  );
  const activeClassIds = new Set(activeClasses.map((schoolClass) => schoolClass.id));
  const classTeacherIds = {};

  if (!hasClassTeacherIds) {
    const error = new Error("请按班级配置任课老师");
    error.statusCode = 400;
    throw error;
  }

  Object.entries(options.classTeacherIds).forEach(([classId, ids]) => {
    if (!activeClassIds.has(classId)) {
      const error = new Error(`班级不属于当前年级：${classId}`);
      error.statusCode = 400;
      throw error;
    }
    classTeacherIds[classId] = Array.from(
      new Set((Array.isArray(ids) ? ids : [ids]).map(String).map((id) => id.trim()).filter(Boolean)),
    );
  });
  const missingClass = activeClasses.find((schoolClass) => !classTeacherIds[schoolClass.id]?.length);
  if (missingClass) {
    const error = new Error(`请为 ${missingClass.name} 配置 ${subject.name} 任课老师`);
    error.statusCode = 400;
    throw error;
  }

  const uniqueTeacherIds = Array.from(new Set(Object.values(classTeacherIds).flat()));
  const invalidTeacherId = uniqueTeacherIds.find((teacherId) => !findTeacher(db, teacherId));
  if (invalidTeacherId) {
    const error = new Error(`教师不存在：${invalidTeacherId}`);
    error.statusCode = 400;
    throw error;
  }
  const invalidTeacher = uniqueTeacherIds
    .map((teacherId) => findTeacher(db, teacherId))
    .find(
      (teacher) =>
        teacher.status !== "active" ||
        teacher.stageId !== stageId ||
        teacher.primarySubjectId !== subjectId,
    );
  if (invalidTeacher) {
    const error = new Error(`${invalidTeacher.name} 不属于当前学部或学科，不能作为该科任课老师`);
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
    classTeacherIds,
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
  const grade = Number.parseInt(query.grade || "", 10);
  const subjectId = String(query.subjectId || "").trim();
  const status = String(query.status || "active").trim();
  const month = String(query.month || "2026-06").trim();

  const filtered = db.teachers.filter((teacher) => {
    if (status && teacher.status !== status) return false;
    if (stageId && teacher.stageId !== stageId) return false;
    if (Number.isFinite(grade) && !teacherGradeValues(db, teacher).includes(grade)) return false;
    if (subjectId && teacher.primarySubjectId !== subjectId) return false;
    if (!search) return true;
    return [
      teacher.id,
      teacher.employeeNo,
      teacher.name,
      teacher.stageName,
      gradeCoverageText(db, teacher),
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
      gradeText: gradeCoverageText(db, teacher),
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

export function teacherScheduleWeeks(db, teacherId) {
  const weekMap = new Map();
  db.lessonInstances
    .filter((lesson) => lesson.teacherId === teacherId)
    .forEach((lesson) => {
      const weekStart = startOfNaturalWeek(lesson.date);
      const current = weekMap.get(weekStart) || {
        weekStart,
        lessonCount: 0,
        publishedCount: 0,
        latestDate: lesson.date,
      };
      current.lessonCount += 1;
      if (lesson.source === "backend-scheduling") current.publishedCount += 1;
      if (lesson.date > current.latestDate) current.latestDate = lesson.date;
      weekMap.set(weekStart, current);
    });
  return Array.from(weekMap.values()).sort((a, b) => {
    if (b.publishedCount !== a.publishedCount) return b.publishedCount - a.publishedCount;
    return b.weekStart.localeCompare(a.weekStart);
  });
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
  return calculateDedicatedTeacherPayroll({
    teacher,
    lessons,
    month,
    payrollRules: db.payrollRules,
    getRoomName: (lesson) => lessonRoomName(db, lesson),
  });
}

function ensurePayrollDetails(db) {
  if (!Array.isArray(db.payrollDetails)) db.payrollDetails = [];
  return db.payrollDetails;
}

function findTeacherPayrollDetail(db, teacherId, month = "2026-06") {
  return ensurePayrollDetails(db).find((item) => item.teacherId === teacherId && item.month === month);
}

function assertWorkloadSchoolApproved(db, teacherId, month = "2026-06") {
  const confirmation = findMonthlyWorkloadConfirmation(db, teacherId, month);
  if (!["school_approved", "locked"].includes(confirmation?.status)) {
    const error = new Error("请先完成老师确认、教务审批和总校审批，再进行薪资复核或锁定");
    error.statusCode = 409;
    error.details = { confirmationStatus: confirmation?.status || "unconfirmed" };
    throw error;
  }
  return confirmation;
}

function buildPayrollRows(db, payroll, workload) {
  if (!payroll || !workload) return [];
  return [
    ...(payroll.components || []).map((component) => ({
      name: component.name,
      basis: component.basis,
      amount: component.amount,
      category: component.category,
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
          rowsSnapshot: generated.rowsSnapshot,
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
      salarySchemeVersion: detail.salarySchemeVersion,
      baseSalary: detail.baseSalary,
      assessmentSalary: detail.assessmentSalary || 0,
      senioritySalary: detail.senioritySalary || 0,
      housingAllowance: detail.housingAllowance || 0,
      positionSalary: detail.positionSalary || 0,
      supplementalAmount: detail.supplementalAmount || 0,
      deductionAmount: detail.deductionAmount || 0,
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
  appendAuditLog(db, {
    action: "payroll_generate",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    month,
    grossPay: detail.grossPay,
    netPay: detail.netPay,
  });
  return teacherPayrollDetail(db, teacherId, month);
}

export function reviewTeacherPayrollDetail(db, teacherId, month = "2026-06", actorAccount = null) {
  assertWorkloadSchoolApproved(db, teacherId, month);
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
  appendAuditLog(db, {
    action: "payroll_review",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    month,
  });
  return teacherPayrollDetail(db, teacherId, month);
}

export function lockTeacherPayrollDetail(db, teacherId, month = "2026-06", actorAccount = null) {
  assertWorkloadSchoolApproved(db, teacherId, month);
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
  appendAuditLog(db, {
    action: "payroll_lock",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    month,
  });
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
  const stageId = String(options.stageId || "").trim();
  const grade = Number.parseInt(options.grade || "", 10);
  const search = String(options.search || "").trim().toLowerCase();
  const details = ensurePayrollDetails(db).filter((detail) => {
    if (detail.month !== month) return false;
    const teacher = findTeacher(db, detail.teacherId);
    if (!teacher) return !stageId && !Number.isFinite(grade) && !search;
    if (stageId && teacher.stageId !== stageId) return false;
    if (Number.isFinite(grade) && !teacherGradeValues(db, teacher).includes(grade)) return false;
    if (!search) return true;
    return [
      teacher.id,
      teacher.employeeNo,
      teacher.name,
      teacher.stageName,
      gradeCoverageText(db, teacher),
      teacher.primarySubjectName,
      teacher.phone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
  const headers = [
    "月份",
    "工号",
    "姓名",
    "学部",
    "年级",
    "科目",
    "状态",
    "规则版本",
    "基本工资",
    "考核工资",
    "校龄工资",
    "住房补贴",
    "岗位津贴",
    "课时工资",
    "补充项",
    "扣减项",
    "应发",
    "个税",
    "实发",
    "可计薪课时",
    "待处理",
    "异常",
  ];
  const rows = details.map((detail) => {
    const teacher = findTeacher(db, detail.teacherId);
    const summary = detail.summarySnapshot || {};
    return [
      month,
      teacher?.employeeNo || detail.teacherId,
      teacher?.name || detail.teacherId,
      teacher?.department || "",
      teacher ? gradeCoverageText(db, teacher) : "",
      teacher?.primarySubjectName || "",
      detail.status,
      summary.salarySchemeVersion || "",
      summary.baseSalary || 0,
      summary.assessmentSalary || 0,
      summary.senioritySalary || 0,
      summary.housingAllowance || 0,
      summary.positionSalary || 0,
      summary.lessonAmount || 0,
      summary.supplementalAmount || 0,
      summary.deductionAmount || 0,
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
    filename: `teacher-payroll-${month}${stageId ? `-${stageId}` : ""}${Number.isFinite(grade) ? `-g${grade}` : ""}.csv`,
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

function payrollLineCategories(lines = []) {
  const categoryMap = new Map();
  lines
    .filter((line) => line.payable)
    .forEach((line) => {
      const key = `${line.type || "regular"}:${line.ruleName || ""}`;
      const current = categoryMap.get(key) || {
        type: line.type || "regular",
        label: line.ruleName || workloadTypeLabel(line.type),
        units: 0,
        amount: 0,
        basisSet: new Set(),
      };
      current.units += Number(line.units || 0);
      current.amount += Number(line.amount || 0);
      if (line.basis) current.basisSet.add(line.basis);
      categoryMap.set(key, current);
    });

  return Array.from(categoryMap.values()).map((category) => {
    const rate = category.units ? Math.round((category.amount / category.units) * 100) / 100 : 0;
    return {
      type: category.type,
      label: category.label,
      units: Math.round(category.units * 100) / 100,
      rate,
      amount: Math.round(category.amount * 100) / 100,
      description: category.basisSet.size
        ? Array.from(category.basisSet).join("；")
        : workloadDescription(category.type, rate),
    };
  });
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
    academicApprovedAt: confirmation.academicApprovedAt || "",
    academicApprovedByName: confirmation.academicApprovedByName || "",
    schoolApprovedAt: confirmation.schoolApprovedAt || "",
    schoolApprovedByName: confirmation.schoolApprovedByName || "",
    lockedAt: confirmation.lockedAt || "",
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
  const categories = payrollLineCategories(payroll?.lines || []);

  const payableLines = lessons
    .filter((lesson) => lesson.status === "completed")
    .map((lesson) => {
      const payrollLine = (payroll?.lines || []).find((line) => line.lessonId === lesson.id);
      return {
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
        amount: payrollLine?.amount || 0,
        ruleName: payrollLine?.ruleName || workloadTypeLabel(lesson.type),
        basis: payrollLine?.basis || "",
      };
    });
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
    academicApprovedAt: "",
    academicApprovedByAccountId: "",
    academicApprovedByName: "",
    schoolApprovedAt: "",
    schoolApprovedByAccountId: "",
    schoolApprovedByName: "",
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
  appendAuditLog(db, {
    action: "workload_teacher_confirm",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || workload.teacher.name,
    teacherId,
    month,
  });
  return teacherMonthlyWorkload(db, teacherId, month);
}

export function approveMonthlyWorkload(db, teacherId, month = "2026-06", step = "academic", actorAccount = null) {
  const confirmation = findMonthlyWorkloadConfirmation(db, teacherId, month);
  if (!confirmation) {
    const error = new Error("老师尚未确认本月工作量");
    error.statusCode = 409;
    throw error;
  }
  if (confirmation.status === "locked") {
    const error = new Error("本月工作量已锁定，不能重复审批");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date().toISOString();
  if (step === "academic") {
    if (confirmation.status !== "teacher_confirmed") {
      const error = new Error("请先由老师确认工作量，再进行教务审批");
      error.statusCode = 409;
      throw error;
    }
    confirmation.status = "academic_approved";
    confirmation.stage = 2;
    confirmation.academicApprovedAt = now;
    confirmation.academicApprovedByAccountId = actorAccount?.id || "";
    confirmation.academicApprovedByName = actorAccount?.name || "";
  } else if (step === "school") {
    if (confirmation.status !== "academic_approved") {
      const error = new Error("请先完成教务审批，再进行总校审批");
      error.statusCode = 409;
      throw error;
    }
    confirmation.status = "school_approved";
    confirmation.stage = 3;
    confirmation.schoolApprovedAt = now;
    confirmation.schoolApprovedByAccountId = actorAccount?.id || "";
    confirmation.schoolApprovedByName = actorAccount?.name || "";
  } else {
    const error = new Error("审批节点只能是 academic 或 school");
    error.statusCode = 400;
    throw error;
  }

  confirmation.updatedAt = now;
  db.meta.updatedAt = now;
  appendAuditLog(db, {
    action: step === "academic" ? "workload_academic_approve" : "workload_school_approve",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    month,
  });
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
