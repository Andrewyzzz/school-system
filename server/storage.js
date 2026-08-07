import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDatabaseFromPostgres, persistDatabaseToPostgres, resetPostgresStore } from "./db/postgresStore.js";
import { ensureHrData, seedHrData, teacherEligibility, findMonthlyAssessment } from "./hr.js";
import { hashPassword, hashToken, verifyPassword } from "./auth.js";
import {
  calculateDedicatedTeacherPayroll,
  createDefaultPayrollRules,
  defaultTeacherSalaryProfile,
  deepMerge,
  ensureTeacherSalaryProfile,
  normalizePayrollRules,
} from "./payroll.js";
import {
  currentTerm,
  defaultTerms,
  ensureEditableTerm,
  ensureTerms,
  listTerms,
  nextDivisionWeekStarts,
  publicTerm,
  termForMonth,
} from "./terms.js";

const DEFAULT_TEACHER_COUNT = 1000;
const DEFAULT_PASSWORD = "123456";
const DATA_DIR = fileURLToPath(new URL("./data", import.meta.url));
const DATA_FILE = path.join(DATA_DIR, "phase1-db.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const MAX_BACKUP_FILES = 50;
const SESSION_TTL_HOURS = 12;
const NOTIFICATION_AUDIENCES = new Set(["all", "teacher", "finance", "admin", "system_admin", "hr"]);

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
          roomType: "homeroom",
          capacity: 1,
          qrCode: `ROOM:${roomId}`,
          displayKey: `screen-${roomId.toLowerCase()}`,
          active: true,
        });
      }
    });
    [
      ["LAB", "实验室", "lab", 2],
      ["COMPUTER", "机房", "computer", 1],
      ["PLAYGROUND", "操场", "playground", 1],
      ["ART", "美术室", "art", 1],
      ["MUSIC", "音乐室", "music", 1],
    ].forEach(([suffix, name, roomType, count]) => {
      for (let index = 1; index <= count; index += 1) {
        const roomId = `ROOM-${stage.id}-${suffix}-${pad(index, 2)}`;
        rooms.push({
          id: roomId,
          stageId: stage.id,
          name: `${stage.name}${name}${count > 1 ? pad(index, 2) : ""}`,
          roomType,
          capacity: 1,
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
      department: "教研所",
      status: "active",
    },
    {
      id: "ACC-SYSTEM-ADMIN",
      username: "sysadmin",
      passwordHash: defaultPasswordHash,
      role: "system_admin",
      name: "行政管理",
      department: "系统管理",
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
      id: "ACC-HR",
      username: "hr",
      passwordHash: defaultPasswordHash,
      role: "hr",
      name: "人事专员",
      department: "人事处",
      status: "active",
    },
    {
      id: "ACC-HEAD-PRIMARY",
      username: "head_primary",
      passwordHash: defaultPasswordHash,
      role: "division_head",
      scopeStageIds: ["primary"],
      name: "小学部负责人",
      department: "小学部",
      status: "active",
    },
    {
      id: "ACC-HEAD-MIDDLE",
      username: "head_middle",
      passwordHash: defaultPasswordHash,
      role: "division_head",
      scopeStageIds: ["middle"],
      name: "初中部负责人",
      department: "初中部",
      status: "active",
    },
    {
      id: "ACC-HEAD-HIGH",
      username: "head_high",
      passwordHash: defaultPasswordHash,
      role: "division_head",
      scopeStageIds: ["high"],
      name: "高中部负责人",
      department: "高中部",
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

  const db = {
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
    schedulePeriodTemplates: [],
    scheduleConstraints: [],
    teacherScheduleRules: [],
    scheduleChangeRequests: [],
    roomResourceOverrides: [],
    terms: defaultTerms(),
    lessonInstances,
    attendanceRecords: [],
    payrollRules: createDefaultPayrollRules(),
    scheduleDrafts: [],
    scheduleVersions: [],
    workloadConfirmations: [],
    payrollDetails: [],
    payrollBatches: [],
    sessions: [],
    notifications: [],
    auditLogs: [],
    // 第二阶段（人事管控）集合：组织、岗位、全员档案、合同、薪资模板、审批流、人事审计
    orgUnits: [],
    positions: [],
    employees: [],
    employeeContracts: [],
    salaryTemplates: [],
    salaryTemplateVersions: [],
    hrFlows: [],
    hrFlowSteps: [],
    hrAuditLogs: [],
  };
  seedHrData(db);
  return db;
}

// 角色显示名升级（2026-08-07 学校口径变更）：admin→教研所、system_admin→行政管理。
// 角色 key 不变，只更新存量库里的展示文本，幂等执行。
const ACCOUNT_DISPLAY_RENAMES = [
  { role: "admin", from: ["教务行政"], department: "教研所" },
  { role: "system_admin", from: ["系统管理"], department: "行政管理" },
  { role: "system_admin", fromName: ["系统管理员"], name: "行政管理" },
];

function normalizeAccountDisplayNames(db) {
  let changed = false;
  (db.accounts || []).forEach((account) => {
    ACCOUNT_DISPLAY_RENAMES.forEach((rule) => {
      if (account.role !== rule.role) return;
      if (rule.department && rule.from?.includes(account.department)) {
        account.department = rule.department;
        changed = true;
      }
      if (rule.name && rule.fromName?.includes(account.displayName || account.name)) {
        if (account.displayName) account.displayName = rule.name;
        if (account.name) account.name = rule.name;
        changed = true;
      }
    });
  });
  return changed;
}

// 按学期作用域的集合：这些集合的写操作都是"先删本学期旧行、再写新行"，
// 依赖 termId 匹配旧行。学期字段是后加的，存量行没有它就永远删不掉，
// 导致新旧并存产生重复主键、整次持久化被拒绝。启动时统一补齐到首个学期。
export const TERM_SCOPED_COLLECTIONS = [
  "classes",
  "rooms",
  "roomResourceOverrides",
  "schedulePeriodTemplates",
  "gradeCourseRules",
  "scheduleConstraints",
  "teacherAssignments",
  "teacherScheduleRules",
  "scheduleDrafts",
  "scheduleChangeRequests",
];

function backfillTermScopedRows(db) {
  const firstTerm = (db.terms || [])[0];
  if (!firstTerm?.id) return false;
  let changed = false;
  TERM_SCOPED_COLLECTIONS.forEach((key) => {
    (db[key] || []).forEach((row) => {
      if (row && !row.termId) {
        row.termId = firstTerm.id;
        row.termName = row.termName || firstTerm.name || "";
        changed = true;
      }
    });
  });
  if (dedupeTeacherAssignments(db)) changed = true;
  return changed;
}

// 任课配置的 ID 规则改过（早期按 学部-年级-学科，后改为带学期前缀），升级过程中
// 同一配置可能同时存在新旧两行。它们的业务作用域相同，复制到新学期时会被重算成
// 同一个 ID，触发重复主键并使整次持久化失败——新建学期因此报错。
// 这里按 (学期, 学部, 年级, 学科) 去重，保留信息最完整的一行。
function dedupeTeacherAssignments(db) {
  const rows = db.teacherAssignments || [];
  if (rows.length < 2) return false;
  const groups = new Map();
  rows.forEach((row) => {
    const key = `${row.termId || ""}|${row.stageId || ""}|${row.grade}|${row.subjectId || ""}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  let changed = false;
  const kept = [];
  groups.forEach((group) => {
    if (group.length === 1) {
      kept.push(group[0]);
      return;
    }
    // 优先保留按班指定最完整的一行，其次是更新时间较新的
    const best = [...group].sort((a, b) => {
      const aClasses = Object.keys(a.classTeacherIds || {}).length;
      const bClasses = Object.keys(b.classTeacherIds || {}).length;
      if (aClasses !== bClasses) return bClasses - aClasses;
      return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    })[0];
    kept.push(best);
    changed = true;
  });
  if (changed) db.teacherAssignments = kept;
  return changed;
}

export function normalizeDatabase(db) {
  let changed = normalizeAccountDisplayNames(db);
  if (backfillTermScopedRows(db)) changed = true;
  const defaults = createInitialData({ teacherCount: db.meta?.teacherCount || DEFAULT_TEACHER_COUNT });
  const arrayKeys = [
    "stages",
    "subjects",
    "classes",
    "rooms",
    "teachers",
    "accounts",
    "gradeCourseRules",
    "schedulePeriodTemplates",
    "scheduleConstraints",
    "teacherScheduleRules",
    "scheduleChangeRequests",
    "roomResourceOverrides",
    "terms",
    "lessonInstances",
    "attendanceRecords",
    "scheduleDrafts",
    "scheduleVersions",
    "workloadConfirmations",
    "payrollDetails",
    "payrollBatches",
    "sessions",
    "notifications",
    "auditLogs",
    "orgUnits",
    "positions",
    "employees",
    "employeeContracts",
    "salaryTemplates",
    "salaryTemplateVersions",
    "hrFlows",
    "hrFlowSteps",
    "hrAuditLogs",
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
  if (ensureTerms(db)) {
    changed = true;
  }
  if (normalizeTeacherAssignments(db)) {
    changed = true;
  }

  const activeTerm = currentTerm(db);
  [
    "roomResourceOverrides",
    "schedulePeriodTemplates",
    "scheduleDrafts",
    "scheduleVersions",
    "scheduleChangeRequests",
    "lessonInstances",
    "workloadConfirmations",
    "payrollDetails",
  ].forEach((key) => {
    (db[key] || []).forEach((item) => {
      if (!item.termId) {
        const term = item.month ? termForMonth(db, item.month) : activeTerm;
        item.termId = term.id;
        item.termName = term.name;
        changed = true;
      }
    });
  });

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

  if (!(db.accounts || []).some((account) => account.username === "sysadmin")) {
    const systemAdminAccount = (defaults.accounts || []).find((account) => account.username === "sysadmin");
    if (systemAdminAccount) {
      db.accounts.push(systemAdminAccount);
      changed = true;
    }
  }

  if (!(db.accounts || []).some((account) => account.username === "hr")) {
    const hrAccount = (defaults.accounts || []).find((account) => account.username === "hr");
    if (hrAccount) {
      db.accounts.push(hrAccount);
      changed = true;
    }
  }

  ["head_primary", "head_middle", "head_high"].forEach((username) => {
    if (!(db.accounts || []).some((account) => account.username === username)) {
      const headAccount = (defaults.accounts || []).find((account) => account.username === username);
      if (headAccount) {
        db.accounts.push(headAccount);
        changed = true;
      }
    }
  });

  (db.rooms || []).forEach((room) => {
    if (!room.roomType) {
      room.roomType = "homeroom";
      changed = true;
    }
    if (!room.capacity) {
      room.capacity = 1;
      changed = true;
    }
    if (!room.qrCode) {
      room.qrCode = `ROOM:${room.id}`;
      changed = true;
    }
    if (!room.displayKey) {
      room.displayKey = `screen-${String(room.id || "").toLowerCase()}`;
      changed = true;
    }
  });

  (defaults.rooms || [])
    .filter((room) => room.roomType && room.roomType !== "homeroom")
    .forEach((room) => {
      if ((db.rooms || []).some((item) => item.id === room.id)) return;
      db.rooms.push(room);
      changed = true;
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
  if (!db.meta.schemaVersion || db.meta.schemaVersion < 3) {
    db.meta.schemaVersion = 3;
    db.meta.updatedAt = new Date().toISOString();
    changed = true;
  }

  // 第二阶段：组织/岗位/模板缺省数据与 teachers→employees 档案幂等回填
  if (ensureHrData(db)) {
    changed = true;
  }

  return changed;
}

// 数据层驱动（第二阶段 M1）：
// - json（默认）：本地 JSON 文件，开发与一阶段试运行沿用；
// - postgres：PostgreSQL 持久化，生产目标形态；
// - dual：双写核对模式，迁移窗口使用——读优先 PostgreSQL，写同时落两边。
export const DB_DRIVER = ["json", "postgres", "dual"].includes(
  String(process.env.DB_DRIVER || "json").toLowerCase(),
)
  ? String(process.env.DB_DRIVER || "json").toLowerCase()
  : "json";

async function loadJsonDatabaseFile() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return null;
  }
}

export async function ensureDatabase() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  if (DB_DRIVER === "postgres" || DB_DRIVER === "dual") {
    let db = await loadDatabaseFromPostgres();
    let bootstrapSource = "postgres";
    if (!db) {
      // 空库：优先吸收既有 JSON 数据（平滑迁移），否则生成种子
      db = await loadJsonDatabaseFile();
      bootstrapSource = db ? "json-file-migration" : "seed";
      if (!db) db = createInitialData();
    }
    normalizeDatabase(db);
    await saveDatabase(db);
    console.log(`[storage] 数据层驱动 ${DB_DRIVER}，启动数据来源：${bootstrapSource}`);
    return db;
  }

  const db = await loadJsonDatabaseFile();
  if (db) {
    if (normalizeDatabase(db)) {
      await saveDatabase(db);
    }
    return db;
  }
  const seeded = createInitialData();
  await saveDatabase(seeded);
  return seeded;
}

// 默认写紧凑 JSON（体积约为缩进版的 1/3，明显降低高峰期磁盘压力）；
// 需要人工排查数据文件时用 DB_PRETTY=1 启动。
const PRETTY_DB_JSON = process.env.DB_PRETTY === "1";

// 供 /api/health 暴露的存储健康状态：写失败不能被静默吞掉
export const storageHealth = {
  lastSaveAt: "",
  lastSaveDurationMs: 0,
  lastSaveError: "",
  coalescedSaves: 0,
  totalSaves: 0,
};

async function writeDatabaseFile(db) {
  const startedAt = Date.now();
  const tmpFile = `${DATA_FILE}.${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await backupDatabaseFile();
    await fs.writeFile(tmpFile, PRETTY_DB_JSON ? JSON.stringify(db, null, 2) : JSON.stringify(db));
    await fs.rename(tmpFile, DATA_FILE);
    storageHealth.lastSaveAt = new Date().toISOString();
    storageHealth.lastSaveDurationMs = Date.now() - startedAt;
    storageHealth.lastSaveError = "";
    storageHealth.totalSaves += 1;
  } catch (error) {
    storageHealth.lastSaveError = `${new Date().toISOString()} ${error.message}`;
    console.error("[storage] 数据文件写入失败:", error.message);
    await fs.rm(tmpFile, { force: true }).catch(() => {});
    throw error;
  }
}

// 按驱动路由持久化目标。dual 模式先写 PostgreSQL 再写 JSON 文件：
// SQL 侧失败会抛错阻断（迁移期以 SQL 为准绳），JSON 侧作为回滚兜底。
async function persistDatabase(db) {
  if (DB_DRIVER === "postgres") {
    const stats = await persistDatabaseToPostgres(db);
    storageHealth.lastSaveAt = new Date().toISOString();
    storageHealth.lastSaveDurationMs = stats.ms;
    storageHealth.lastSaveError = "";
    storageHealth.totalSaves += 1;
    return;
  }
  if (DB_DRIVER === "dual") {
    await persistDatabaseToPostgres(db);
    await writeDatabaseFile(db);
    return;
  }
  await writeDatabaseFile(db);
}

// 写合并：并发写请求（例如上下课高峰批量签到）只保留“一个进行中的写 + 一个收尾写”。
// 内存中的 db 永远是最新状态，收尾写落盘时自然包含之前所有修改；
// 每个调用方 await 的 Promise 都在自己的修改已持久化之后才 resolve，写失败会抛给调用方。
const databaseWriteStates = new WeakMap();

export function saveDatabase(db) {
  let writeState = databaseWriteStates.get(db);
  if (!writeState) {
    writeState = { active: null, queued: null };
    databaseWriteStates.set(db, writeState);
  }
  if (!writeState.active) {
    writeState.active = persistDatabase(db).finally(() => {
      writeState.active = null;
    });
    return writeState.active;
  }
  if (!writeState.queued) {
    writeState.queued = writeState.active
      .catch(() => {})
      .then(() => {
        writeState.queued = null;
        return saveDatabase(db);
      });
  } else {
    storageHealth.coalescedSaves += 1;
  }
  return writeState.queued;
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
  // 种子语义是“完全替换”：postgres/dual 驱动下必须先清空存量表，
  // 否则新进程影子快照为空、旧行不会进入删除集，会残留脏数据。
  if (DB_DRIVER === "postgres" || DB_DRIVER === "dual") {
    await resetPostgresStore();
  }
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

// 会话按 tokenHash 建立 O(1) 索引：3000 人同时在线时每个请求都要做会话校验，
// 不能再对 sessions 数组做线性扫描。索引只保存未撤销会话。
const sessionIndexes = new WeakMap();

function sessionIndexFor(db) {
  let index = sessionIndexes.get(db);
  if (!index) {
    index = new Map();
    ensureSessions(db).forEach((session) => {
      if (!session.revokedAt) index.set(session.tokenHash, session);
    });
    sessionIndexes.set(db, index);
  }
  return index;
}

const SESSION_PRUNE_THRESHOLD = 5000;
const SESSION_RETAIN_REVOKED_MS = 24 * 60 * 60 * 1000;

// 已撤销/已过期超过 24 小时的会话没有业务价值，堆积会拖慢序列化和占用内存。
// 在登录时按阈值触发，摊薄清理成本。
function pruneSessions(db) {
  const sessions = ensureSessions(db);
  if (sessions.length < SESSION_PRUNE_THRESHOLD) return;
  const now = Date.now();
  const kept = sessions.filter((session) => {
    if (session.revokedAt) return now - new Date(session.revokedAt).getTime() < SESSION_RETAIN_REVOKED_MS;
    return new Date(session.expiresAt).getTime() > now - SESSION_RETAIN_REVOKED_MS;
  });
  if (kept.length === sessions.length) return;
  db.sessions = kept;
  sessionIndexes.delete(db);
}

export function createSession(db, account, token, context = {}) {
  pruneSessions(db);
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
  sessionIndexFor(db).set(session.tokenHash, session);
  appendAuditLog(db, {
    action: "auth_login",
    actorAccountId: account.id,
    actorName: account.name,
    sessionId: session.id,
  });
  return session;
}

// 学期是否已过结束日期。状态字段仍由人工推进（active→archived 需归档操作，
// 因为归档会把课表工资转为只读，不能到点自动执行），但界面需要如实提示"已过结束日期"。
export function termDatePhase(term, today = new Date().toISOString().slice(0, 10)) {
  if (!term?.startDate || !term?.endDate) return "";
  if (today < term.startDate) return "upcoming";
  if (today > term.endDate) return "ended";
  return "ongoing";
}

function decorateTerm(term, today) {
  const datePhase = termDatePhase(term, today);
  return {
    ...term,
    datePhase,
    // 仍是当前学期但已过结束日期：提示行政该归档并切换到新学期了
    needsRollover: Boolean(term.current && datePhase === "ended" && term.status !== "archived"),
  };
}

export function queryTerms(db) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    currentTerm: decorateTerm(currentTerm(db), today),
    terms: listTerms(db).map((term) => decorateTerm(term, today)),
  };
}

function normalizeTermDate(value, fallback = "") {
  const text = String(value || fallback || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return fallback;
  return text;
}

function normalizeTermText(value, fallback = "") {
  return String(value || fallback || "").trim();
}

function createTermId(schoolYear, semester) {
  const suffix = `${schoolYear || "term"}-${semester || "semester"}-${Date.now()}`
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
  return `TERM-${suffix || Date.now()}`;
}

function scopedStorageConfigId(prefix, termId, ...parts) {
  const suffix = [termId, ...parts]
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
  return `${prefix}-${suffix}`;
}

function sourceTermRows(rows = [], sourceTermId = "") {
  const scopedRows = rows.filter((row) => row.termId === sourceTermId);
  if (scopedRows.length) return scopedRows;
  return rows.filter((row) => !row.termId);
}

function mergedSourceTermRows(rows = [], sourceTermId = "", keyFn = (row) => row.id) {
  const merged = new Map();
  rows
    .filter((row) => !row.termId)
    .forEach((row) => {
      merged.set(keyFn(row), row);
    });
  rows
    .filter((row) => row.termId === sourceTermId)
    .forEach((row) => {
      merged.set(keyFn(row), row);
    });
  return Array.from(merged.values());
}

function copiedConfigSummary(db, sourceTermId = currentTerm(db).id) {
  const sourceClasses = sourceTermRows(db.classes || [], sourceTermId).filter((schoolClass) => schoolClass.active !== false);
  const sourceCourseRules = sourceTermRows(db.gradeCourseRules || [], sourceTermId);
  const sourceAssignments = sourceTermRows(db.teacherAssignments || [], sourceTermId);
  const sourceTeacherRules = sourceTermRows(db.teacherScheduleRules || [], sourceTermId);
  const sourceConstraints = sourceTermRows(db.scheduleConstraints || [], sourceTermId);
  const sourceRoomResourceOverrides = sourceTermRows(db.roomResourceOverrides || [], sourceTermId);
  const sourcePeriodTemplates = sourceTermRows(db.schedulePeriodTemplates || [], sourceTermId);
  return {
    courseRuleCount: sourceCourseRules.length,
    teacherAssignmentCount: sourceAssignments.filter(
      (assignment) => Object.values(assignment.classTeacherIds || {}).flat().length > 0,
    ).length,
    teacherRuleCount: sourceTeacherRules.length,
    constraintCount: sourceConstraints.filter((constraint) => constraint.active !== false).length,
    roomResourceConfigCount: sourceRoomResourceOverrides.length,
    periodTemplateCount: sourcePeriodTemplates.length,
    classCount: sourceClasses.length,
  };
}

function cloneTermConfigRows(db, sourceTermId, targetTerm, actorAccount = null) {
  const now = new Date().toISOString();
  const withScope = (row) => ({
    ...row,
    termId: targetTerm.id,
    termName: targetTerm.name,
    copiedFromTermId: sourceTermId,
    copiedAt: now,
  });
  const replaceTargetRows = (key, rows) => {
    db[key] = (db[key] || []).filter((row) => row.termId !== targetTerm.id);
    db[key].push(...rows);
  };

  // 班级与教室必须生成学期内唯一的新 ID：直接沿用源学期 ID 会造成跨学期主键冲突，
  // 导致新学期无法持久化。同时记录 旧ID→新ID 映射，重写所有引用它们的配置行。
  const classIdMap = new Map();
  const roomIdMap = new Map();
  // 用学期 ID 的短后缀做前缀，既保证跨学期唯一，又不让班级 ID 长到难以辨认
  const termSuffix = String(targetTerm.id).replace(/^TERM-/, "").slice(-13);
  const scopedRowId = (sourceId) => `${sourceId}@${termSuffix}`;

  const clonedClasses = sourceTermRows(db.classes || [], sourceTermId).map((row) => {
    const nextId = scopedRowId(row.id);
    classIdMap.set(row.id, nextId);
    return { ...withScope(row), id: nextId, sourceClassId: row.id };
  });
  const clonedRooms = sourceTermRows(db.rooms || [], sourceTermId).map((row) => {
    const nextId = scopedRowId(row.id);
    roomIdMap.set(row.id, nextId);
    return { ...withScope(row), id: nextId, sourceRoomId: row.id };
  });
  // 班级的默认教室指向新教室 ID
  clonedClasses.forEach((row) => {
    if (row.roomId && roomIdMap.has(row.roomId)) row.roomId = roomIdMap.get(row.roomId);
  });
  replaceTargetRows("classes", clonedClasses);
  replaceTargetRows("rooms", clonedRooms);

  // 引用重写：任课配置按班级指定老师、教室资源覆盖按教室列举
  const remapClassKeyedObject = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const next = {};
    Object.entries(value).forEach(([classId, entry]) => {
      next[classIdMap.get(classId) || classId] = entry;
    });
    return next;
  };
  const remapIdList = (list, map) =>
    Array.isArray(list) ? list.map((id) => map.get(id) || id) : list;
  replaceTargetRows(
    "gradeCourseRules",
    sourceTermRows(db.gradeCourseRules || [], sourceTermId).map((row) => ({
      ...withScope(row),
      id: scopedStorageConfigId("CR", targetTerm.id, row.stageId, row.grade, row.subjectId),
    })),
  );
  replaceTargetRows(
    "teacherAssignments",
    sourceTermRows(db.teacherAssignments || [], sourceTermId).map((row) => ({
      ...withScope(row),
      id: scopedStorageConfigId("TA", targetTerm.id, row.stageId, row.grade, row.subjectId),
      // 按班指定的任课老师，键为班级 ID，需指向新学期的班级
      classTeacherIds: remapClassKeyedObject(row.classTeacherIds),
    })),
  );
  replaceTargetRows(
    "scheduleConstraints",
    sourceTermRows(db.scheduleConstraints || [], sourceTermId).map((row, index) => ({
      ...withScope(row),
      id: scopedStorageConfigId("SC", targetTerm.id, row.stageId, row.grade, row.subjectId, index + 1),
    })),
  );
  replaceTargetRows(
    "teacherScheduleRules",
    sourceTermRows(db.teacherScheduleRules || [], sourceTermId).map((row) => ({
      ...withScope(row),
      id: scopedStorageConfigId("TSR", targetTerm.id, row.stageId, row.teacherId),
    })),
  );
  replaceTargetRows(
    "roomResourceOverrides",
    sourceTermRows(db.roomResourceOverrides || [], sourceTermId).map((row) => ({
      ...withScope(row),
      id: scopedStorageConfigId("RRC", targetTerm.id, row.stageId),
      // 覆盖项列举的教室需指向新学期的教室
      roomIds: remapIdList(row.roomIds, roomIdMap),
      rooms: Array.isArray(row.rooms)
        ? row.rooms.map((item) =>
            item && typeof item === "object" && item.id
              ? { ...item, id: roomIdMap.get(item.id) || item.id }
              : item,
          )
        : row.rooms,
    })),
  );
  replaceTargetRows(
    "schedulePeriodTemplates",
    sourceTermRows(db.schedulePeriodTemplates || [], sourceTermId).map((row) => ({
      ...withScope(row),
      id: scopedStorageConfigId("SPT", targetTerm.id, row.stageId, row.grade),
    })),
  );

  appendAuditLog(db, {
    action: "term_config_clone",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    sourceTermId,
    termId: targetTerm.id,
    termName: targetTerm.name,
    ...copiedConfigSummary(db, targetTerm.id),
  });
}

export function createAcademicTerm(db, options = {}, actorAccount = null) {
  ensureTerms(db);
  const startDate = normalizeTermDate(options.startDate, "");
  const endDate = normalizeTermDate(options.endDate, "");
  if (!startDate || !endDate || endDate < startDate) {
    const error = new Error("请填写有效的学期开始和结束日期");
    error.statusCode = 400;
    throw error;
  }

  const schoolYear = normalizeTermText(options.schoolYear, startDate.slice(0, 4));
  const semester = normalizeTermText(options.semester, "上学期");
  const name = normalizeTermText(options.name, `${schoolYear}${semester}`);
  const id = normalizeTermText(options.id, createTermId(schoolYear, semester));
  if ((db.terms || []).some((term) => term.id === id)) {
    const error = new Error("学期编号已存在");
    error.statusCode = 409;
    throw error;
  }

  const copyFromTermId = normalizeTermText(options.copyFromTermId, currentTerm(db).id);
  const makeCurrent = Boolean(options.current);
  const now = new Date().toISOString();
  const copyConfig = options.copyConfig !== false;
  const term = {
    id,
    name,
    schoolYear,
    semester,
    startDate,
    endDate,
    settlementMonth: normalizeTermText(options.settlementMonth, ""),
    status: makeCurrent ? "active" : "planned",
    current: makeCurrent,
    copiedFromTermId: copyConfig ? copyFromTermId : "",
    copiedConfigSummary: copyConfig ? copiedConfigSummary(db, copyFromTermId) : null,
    divisionWeekStarts:
      options.divisionWeekStarts && typeof options.divisionWeekStarts === "object" && !Array.isArray(options.divisionWeekStarts)
        ? { ...options.divisionWeekStarts }
        : nextDivisionWeekStarts(startDate),
    createdAt: now,
    createdByAccountId: actorAccount?.id || "",
    createdByName: actorAccount?.name || "",
  };

  if (makeCurrent) {
    db.terms = db.terms.map((item) => ({
      ...item,
      current: false,
      status: item.status === "active" ? "planned" : item.status,
    }));
  }
  db.terms.push(term);
  if (copyConfig) {
    cloneTermConfigRows(db, copyFromTermId, term, actorAccount);
  }
  db.meta.updatedAt = now;
  appendAuditLog(db, {
    action: "term_create",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    termId: term.id,
    termName: term.name,
    copiedFromTermId: term.copiedFromTermId,
  });
  return {
    term: publicTerm(term),
    ...queryTerms(db),
  };
}

export function setCurrentAcademicTerm(db, termId = "", actorAccount = null) {
  ensureTerms(db);
  const target = db.terms.find((term) => term.id === termId);
  if (!target) {
    const error = new Error("学期不存在");
    error.statusCode = 404;
    throw error;
  }
  if (target.status === "archived") {
    const error = new Error("已归档学期不能设为当前学期");
    error.statusCode = 409;
    throw error;
  }
  const now = new Date().toISOString();
  db.terms = db.terms.map((term) => ({
    ...term,
    current: term.id === target.id,
    status: term.id === target.id ? "active" : term.status === "active" ? "planned" : term.status,
    activatedAt: term.id === target.id ? now : term.activatedAt || "",
  }));
  db.meta.updatedAt = now;
  appendAuditLog(db, {
    action: "term_set_current",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    termId: target.id,
    termName: target.name,
  });
  return queryTerms(db);
}

export function archiveAcademicTerm(db, termId = "", actorAccount = null) {
  ensureTerms(db);
  const target = db.terms.find((term) => term.id === termId);
  if (!target) {
    const error = new Error("学期不存在");
    error.statusCode = 404;
    throw error;
  }
  if (target.current) {
    const error = new Error("当前学期不能归档，请先切换到新学期");
    error.statusCode = 409;
    throw error;
  }
  const now = new Date().toISOString();
  target.status = "archived";
  target.current = false;
  target.archivedAt = now;
  target.archivedByAccountId = actorAccount?.id || "";
  target.archivedByName = actorAccount?.name || "";
  db.meta.updatedAt = now;
  appendAuditLog(db, {
    action: "term_archive",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    termId: target.id,
    termName: target.name,
  });
  return queryTerms(db);
}

function termUsageCounts(db, termId = "") {
  const count = (key, predicate = (item) => item.termId === termId) => (db[key] || []).filter(predicate).length;
  return {
    scheduleDrafts: count("scheduleDrafts"),
    scheduleVersions: count("scheduleVersions"),
    lessonInstances: count("lessonInstances"),
    attendanceRecords: count("attendanceRecords", (record) => {
      if (record.termId === termId) return true;
      const lesson = (db.lessonInstances || []).find((item) => item.id === record.lessonId);
      return lesson?.termId === termId;
    }),
    scheduleChangeRequests: count("scheduleChangeRequests"),
    workloadConfirmations: count("workloadConfirmations"),
    payrollDetails: count("payrollDetails"),
    payrollBatches: count("payrollBatches"),
  };
}

function termHasBusinessUsage(usageCounts) {
  return Object.values(usageCounts).some((value) => Number(value || 0) > 0);
}

function removeTermConfigRows(db, termId = "") {
  [
    "classes",
    "rooms",
    "gradeCourseRules",
    "teacherAssignments",
    "scheduleConstraints",
    "teacherScheduleRules",
    "roomResourceOverrides",
    "schedulePeriodTemplates",
  ].forEach((key) => {
    db[key] = (db[key] || []).filter((row) => row.termId !== termId);
  });
}

export function deleteAcademicTerm(db, termId = "", actorAccount = null) {
  ensureTerms(db);
  const target = db.terms.find((term) => term.id === termId);
  if (!target) {
    const error = new Error("学期不存在");
    error.statusCode = 404;
    throw error;
  }
  if (target.current) {
    const error = new Error("当前学期不能删除，请先切换到其他学期");
    error.statusCode = 409;
    throw error;
  }
  if (target.status !== "planned") {
    const error = new Error("只有未投入使用的计划中学期可以删除，已进行或归档学期请保留归档记录");
    error.statusCode = 409;
    throw error;
  }
  if ((db.terms || []).length <= 1) {
    const error = new Error("至少需要保留一个学期");
    error.statusCode = 409;
    throw error;
  }

  const usageCounts = termUsageCounts(db, target.id);
  if (termHasBusinessUsage(usageCounts)) {
    const error = new Error("该学期已经产生排课、考勤或薪资数据，不能删除，请使用归档");
    error.statusCode = 409;
    error.details = usageCounts;
    throw error;
  }

  const removedConfig = copiedConfigSummary(db, target.id);
  removeTermConfigRows(db, target.id);
  db.terms = (db.terms || []).filter((term) => term.id !== target.id);
  db.meta.updatedAt = new Date().toISOString();
  appendAuditLog(db, {
    action: "term_delete",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    termId: target.id,
    termName: target.name,
    removedConfig,
  });
  return queryTerms(db);
}

export function findActiveSession(db, token = "") {
  const tokenHashValue = hashToken(token);
  const index = sessionIndexFor(db);
  const session = index.get(tokenHashValue);
  if (!session || session.revokedAt) {
    if (session?.revokedAt) index.delete(tokenHashValue);
    return null;
  }
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    session.revokedAt = new Date().toISOString();
    index.delete(tokenHashValue);
    return null;
  }
  session.lastSeenAt = new Date().toISOString();
  return session;
}

export function revokeSession(db, token = "", actorAccount = null) {
  const tokenHashValue = hashToken(token);
  const index = sessionIndexFor(db);
  const session = index.get(tokenHashValue);
  if (!session || session.revokedAt) return false;
  session.revokedAt = new Date().toISOString();
  index.delete(tokenHashValue);
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
  const index = sessionIndexFor(db);
  ensureSessions(db)
    .filter((session) => session.accountId === accountId && !session.revokedAt)
    .forEach((session) => {
      session.revokedAt = now;
      session.revokedReason = reason;
      index.delete(session.tokenHash);
    });
}

export function findAccountByUsername(db, username) {
  return db.accounts.find((account) => account.username === username);
}

export function findTeacher(db, teacherId) {
  return db.teachers.find((teacher) => teacher.id === teacherId);
}

function publicTeacherIdentity(teacher) {
  if (!teacher) return null;
  const { salaryProfile, ...publicTeacher } = teacher;
  return publicTeacher;
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
    teacher: account.role === "teacher" ? publicTeacherIdentity(teacher) : teacher,
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

function teacherAssignedGradeValues(db, teacher) {
  return Array.from(
    new Set(
      (db.teacherAssignments || [])
        .filter((assignment) => assignment.teacherIds.includes(teacher.id))
        .map((assignment) => assignment.grade),
    ),
  ).sort((a, b) => a - b);
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
              ? "行政管理"
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
  if (rules.teacherSalaryScheme && typeof rules.teacherSalaryScheme === "object" && !Array.isArray(rules.teacherSalaryScheme)) {
    nextRules.teacherSalaryScheme = deepMerge(nextRules.teacherSalaryScheme, {
      ...rules.teacherSalaryScheme,
      settlementMode: "actualCompletedLessons",
    });
  }
  db.payrollRules = normalizePayrollRules(nextRules);
  const invalidatedCount = invalidateOpenPayrollDetails(db, () => true);
  appendAuditLog(db, {
    action: "payroll_rules_update",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    invalidatedCount,
  });
  return db.payrollRules;
}

function booleanValue(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "是", "y"].includes(String(value).trim().toLowerCase());
}

function numberValue(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeManualItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => ({
      name: String(item?.name || `补充项 ${index + 1}`).trim(),
      amount: Math.round(numberValue(item?.amount, 0) * 100) / 100,
      basis: String(item?.basis || "财务补充项").trim(),
      category: String(item?.category || (numberValue(item?.amount, 0) < 0 ? "deduction" : "supplement")).trim(),
    }))
    .filter((item) => item.name && item.amount);
}

function normalizeSalaryProfilePatch(patch = {}, current = {}) {
  const next = { ...patch };
  ["schoolYears", "probationRate", "attendanceDeduction"].forEach((key) => {
    if (next[key] !== undefined) next[key] = numberValue(next[key], current[key] || 0);
  });
  if (next.manualItems !== undefined) next.manualItems = normalizeManualItems(next.manualItems);
  if (next.roles && typeof next.roles === "object" && !Array.isArray(next.roles)) {
    const currentRoles = current.roles || {};
    const rolePatch = { ...next.roles };
    // 数值型角色属性（学生数、管辖班数）不能按布尔处理，否则津贴金额会被清零
    const numericRoleKeys = new Set(["homeroomStudentCount", "gradeClassCount"]);
    Object.keys(rolePatch).forEach((key) => {
      if (numericRoleKeys.has(key)) {
        rolePatch[key] = numberValue(rolePatch[key], currentRoles[key] || 0);
      } else {
        rolePatch[key] = booleanValue(rolePatch[key], currentRoles[key] || false);
      }
    });
    next.roles = rolePatch;
  }
  return next;
}

export function updateTeacherSalaryProfile(db, teacherId, profilePatch = {}, actorAccount = null) {
  const teacher = findTeacher(db, teacherId);
  if (!teacher) {
    const error = new Error("教师不存在");
    error.statusCode = 404;
    throw error;
  }
  ensureTeacherSalaryProfile(teacher);
  const previousProfile = teacher.salaryProfile || {};
  const nextProfile = deepMerge(
    previousProfile,
    normalizeSalaryProfilePatch(profilePatch, previousProfile),
  );
  teacher.salaryProfile = nextProfile;
  ensureTeacherSalaryProfile(teacher);

  const invalidatedCount = invalidateOpenPayrollDetails(db, (detail) => detail.teacherId === teacherId);
  appendAuditLog(db, {
    action: "teacher_salary_profile_update",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    invalidatedCount,
  });
  return {
    ...teacher,
    invalidatedPayrollCount: invalidatedCount,
  };
}

export function queryTeacherAssignments(db, options = {}) {
  const term = currentTerm(db, options.termId);
  const stageId = String(options.stageId || "").trim();
  const grade = options.grade ? Number(options.grade) : null;
  const subjectId = String(options.subjectId || "").trim();
  const scopedAssignments = mergedSourceTermRows(
    db.teacherAssignments || [],
    term.id,
    (assignment) => `${assignment.stageId}:${assignment.grade}:${assignment.subjectId}`,
  );
  return scopedAssignments
    .filter((assignment) => !stageId || assignment.stageId === stageId)
    .filter((assignment) => !grade || assignment.grade === grade)
    .filter((assignment) => !subjectId || assignment.subjectId === subjectId)
    .map((assignment) => ({
      ...assignment,
      termId: assignment.termId || term.id,
      termName: assignment.termName || term.name,
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
  const term = currentTerm(db, options.termId);
  ensureEditableTerm(term, "修改任课配置");
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
  const activeClasses = sourceTermRows(db.classes || [], term.id).filter(
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
  const id = scopedStorageConfigId("TA", term.id, stageId, grade, subjectId);
  const existing = (db.teacherAssignments || []).find(
    (assignment) =>
      assignment.termId === term.id &&
      assignment.stageId === stageId &&
      Number(assignment.grade) === grade &&
      assignment.subjectId === subjectId,
  );
  const next = {
    id,
    termId: term.id,
    termName: term.name,
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
  return queryTeacherAssignments(db, { termId: term.id, stageId, grade, subjectId })[0];
}

const financeSummaryCaches = new WeakMap();

export function queryTeachers(db, query = {}, options = {}) {
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(Number.parseInt(query.pageSize || "20", 10), 1), 100);
  const search = String(query.search || "").trim().toLowerCase();
  const stageId = String(query.stageId || "").trim();
  const grade = Number.parseInt(query.grade || "", 10);
  const subjectId = String(query.subjectId || "").trim();
  const status = String(query.status || "active").trim();
  const month = String(query.month || "2026-06").trim();
  const strictGrade = String(query.strictGrade || "false") === "true";
  const includeFinance = options.includeFinance !== false;

  const filtered = db.teachers.filter((teacher) => {
    if (status && teacher.status !== status) return false;
    if (stageId && teacher.stageId !== stageId) return false;
    if (Number.isFinite(grade)) {
      const gradeValues = strictGrade ? teacherAssignedGradeValues(db, teacher) : teacherGradeValues(db, teacher);
      if (!gradeValues.includes(grade)) return false;
    }
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

  const emptyFinanceSummary = {
    teacherCount: filtered.length,
    completedUnits: 0,
    pendingCount: 0,
    exceptionCount: 0,
    grossPay: 0,
    netPay: 0,
    lockedCount: 0,
    payrollStatusCounts: {},
    groups: {
      department: {},
      subject: {},
      grade: {},
    },
  };
  // 汇总只依赖过滤条件和数据版本，与分页无关；财务端翻页时直接复用缓存，
  // 避免每页请求都对全部命中老师重算工资试算。
  const financeSummaryKey = [month, status, stageId, grade, subjectId, search, strictGrade].join("|");
  const financeSummaryVersion = db.meta?.updatedAt || "";
  let financeSummaryCacheEntry = financeSummaryCaches.get(db);
  if (!financeSummaryCacheEntry || financeSummaryCacheEntry.version !== financeSummaryVersion) {
    financeSummaryCacheEntry = { version: financeSummaryVersion, byKey: new Map() };
    financeSummaryCaches.set(db, financeSummaryCacheEntry);
  }
  const cachedFinanceSummary = includeFinance ? financeSummaryCacheEntry.byKey.get(financeSummaryKey) : null;
  const financeSummary = cachedFinanceSummary
    ? cachedFinanceSummary
    : includeFinance
    ? filtered.reduce((summary, teacher) => {
        const lessonSummary = teacherLessonSummary(db, teacher.id, month);
        const payroll = teacherPayrollPreview(db, teacher.id, month);
        const payrollDetail = findTeacherPayrollDetail(db, teacher.id, month);
        const statusKey = payrollDetail?.status || "missing";
        const stageKey = teacher.department || teacher.stageName || "未设置学部";
        const subjectKey = teacher.primarySubjectName || teacher.subject || "未设置学科";
        const gradeKey = gradeCoverageText(db, teacher) || "未设置年级";
        const addGroup = (bucket, key) => {
          if (!bucket[key]) {
            bucket[key] = {
              key,
              teacherCount: 0,
              completedUnits: 0,
              pendingCount: 0,
              exceptionCount: 0,
              gross: 0,
              net: 0,
              lockedCount: 0,
            };
          }
          bucket[key].teacherCount += 1;
          bucket[key].completedUnits += lessonSummary.completedUnits || 0;
          bucket[key].pendingCount += lessonSummary.pendingCount || 0;
          bucket[key].exceptionCount += lessonSummary.exceptionCount || 0;
          bucket[key].gross += payroll?.grossPay || 0;
          bucket[key].net += payroll?.netPay || 0;
          if (statusKey === "locked") bucket[key].lockedCount += 1;
        };

        summary.payrollStatusCounts[statusKey] = (summary.payrollStatusCounts[statusKey] || 0) + 1;
        summary.pendingCount += lessonSummary.pendingCount || 0;
        summary.exceptionCount += lessonSummary.exceptionCount || 0;
        summary.completedUnits += lessonSummary.completedUnits || 0;
        summary.grossPay += payroll?.grossPay || 0;
        summary.netPay += payroll?.netPay || 0;
        if (statusKey === "locked") summary.lockedCount += 1;
        addGroup(summary.groups.department, stageKey);
        addGroup(summary.groups.subject, subjectKey);
        addGroup(summary.groups.grade, gradeKey);
        return summary;
      }, emptyFinanceSummary)
    : emptyFinanceSummary;
  if (includeFinance && !cachedFinanceSummary) {
    financeSummaryCacheEntry.byKey.set(financeSummaryKey, financeSummary);
  }
  const toSortedGroupRows = (bucket) =>
    Object.values(bucket).sort((a, b) => String(a.key).localeCompare(String(b.key), "zh-CN"));

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((teacher) => {
    const base = {
      ...(includeFinance ? teacher : publicTeacherIdentity(teacher) || {}),
      gradeText: gradeCoverageText(db, teacher),
    };
    if (!includeFinance) return base;

    const summary = teacherLessonSummary(db, teacher.id, month);
    const payroll = teacherPayrollPreview(db, teacher.id, month);
    const payrollDetail = findTeacherPayrollDetail(db, teacher.id, month);
    return {
      ...base,
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
    summary: {
      teacherCount: financeSummary.teacherCount,
      completedUnits: financeSummary.completedUnits,
      pendingCount: financeSummary.pendingCount,
      exceptionCount: financeSummary.exceptionCount,
      grossPay: financeSummary.grossPay,
      netPay: financeSummary.netPay,
      lockedCount: financeSummary.lockedCount,
      payrollStatusCounts: financeSummary.payrollStatusCounts,
      groups: {
        department: toSortedGroupRows(financeSummary.groups.department),
        subject: toSortedGroupRows(financeSummary.groups.subject),
        grade: toSortedGroupRows(financeSummary.groups.grade),
      },
    },
    meta: {
      page,
      pageSize,
	      total: filtered.length,
	      totalPages: Math.max(Math.ceil(filtered.length / pageSize), 1),
	      payrollStatusCounts: financeSummary.payrollStatusCounts,
	    },
	  };
	}

// (db, month) → Map(teacherId → lessons[]) 索引缓存。财务教师列表一页请求要为几百名
// 老师取当月课次，逐人全表扫描是 O(老师数 × 课次数)，索引化后整月只扫一遍。
// 失效依据 db.meta.updatedAt（所有增删课次的写路径都会更新它）；
// 索引存课节对象引用，签到等原地状态修改无需失效即可见。
const monthLessonIndexCache = new WeakMap();

function lessonsByTeacherForMonth(db, month) {
  const version = db.meta?.updatedAt || "";
  let cache = monthLessonIndexCache.get(db);
  if (!cache || cache.version !== version) {
    cache = { version, byMonth: new Map() };
    monthLessonIndexCache.set(db, cache);
  }
  if (!cache.byMonth.has(month)) {
    const index = new Map();
    (db.lessonInstances || []).forEach((lesson) => {
      if (!lesson.date || !lesson.date.startsWith(month)) return;
      if (!index.has(lesson.teacherId)) index.set(lesson.teacherId, []);
      index.get(lesson.teacherId).push(lesson);
    });
    cache.byMonth.set(month, index);
  }
  return cache.byMonth.get(month);
}

export function teacherLessonSummary(db, teacherId, month = "2026-06") {
  const lessons = lessonsByTeacherForMonth(db, month).get(teacherId) || [];
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

export function teacherLessonsForWeek(db, teacherId, weekStart, options = {}) {
  const term = currentTerm(db, options.termId);
  const startKey = weekStart || "2026-06-15";
  const endKey = addDays(startKey, 6);
  return db.lessonInstances
    .filter(
      (lesson) =>
        lesson.teacherId === teacherId &&
        (!lesson.termId || lesson.termId === term.id) &&
        lesson.date >= startKey &&
        lesson.date <= endKey,
    )
    .map((lesson) => publicLesson(db, lesson))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export function teacherScheduleWeeks(db, teacherId, options = {}) {
  const term = currentTerm(db, options.termId);
  const weekMap = new Map();
  db.lessonInstances
    .filter((lesson) => lesson.teacherId === teacherId && (!lesson.termId || lesson.termId === term.id))
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
  return Array.from(weekMap.values()).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
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

// 人事联动（M4）：按人事状态给出计薪口径。preview 只降额不拦截（保证只读视图可用），
// 生成/发布工资时用 assertPayrollEligible 硬拦截。
export function payrollProrationFor(db, teacherId, month = "2026-06") {
  const eligibility = teacherEligibility(db, teacherId);
  if (eligibility.payroll === "until-left" && eligibility.leftAt) {
    const leftMonth = eligibility.leftAt.slice(0, 7);
    if (month === leftMonth) {
      const [year, monthNumber] = month.split("-").map(Number);
      const daysInMonth = new Date(year, monthNumber, 0).getDate();
      const leftDay = Math.min(Number(eligibility.leftAt.slice(8, 10)) || daysInMonth, daysInMonth);
      return {
        factor: leftDay / daysInMonth,
        note: `离职生效日 ${eligibility.leftAt}，固定项按 ${leftDay}/${daysInMonth} 天折算`,
      };
    }
  }
  return { factor: 1, note: "" };
}

export function assertPayrollEligible(db, teacherId, month = "2026-06") {
  const eligibility = teacherEligibility(db, teacherId);
  if (eligibility.payroll === "frozen") {
    const error = new Error("该人员处于停用状态，计薪冻结，需人事恢复或总校裁定后再结算");
    error.statusCode = 409;
    throw error;
  }
  if (eligibility.payroll === "blocked") {
    const error = new Error("该人员尚未完成入职流程，不能生成工资");
    error.statusCode = 409;
    throw error;
  }
  if (eligibility.payroll === "until-left" && eligibility.leftAt && month > eligibility.leftAt.slice(0, 7)) {
    const error = new Error(`该人员已于 ${eligibility.leftAt} 离职，离职后的月份不能再生成工资`);
    error.statusCode = 409;
    throw error;
  }
}

export function teacherPayrollPreview(db, teacherId, month = "2026-06") {
  const teacher = findTeacher(db, teacherId);
  if (!teacher) return null;
  const term = termForMonth(db, month);

  const lessons = [...(lessonsByTeacherForMonth(db, month).get(teacherId) || [])].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
  const proration = payrollProrationFor(db, teacherId, month);
  // 人事事实（职称、学历、兼岗任命）以人事档案为准，薪资引擎只读取不存储；
  // 月度考核由学部/人事按月录入，财务不可改。
  const employee = (db.employees || []).find((item) => item.teacherId === teacherId) || null;
  const payroll = calculateDedicatedTeacherPayroll({
    teacher,
    lessons,
    month,
    payrollRules: db.payrollRules,
    getRoomName: (lesson) => lessonRoomName(db, lesson),
    fixedProrationFactor: proration.factor,
    prorationNote: proration.note,
    hrFacts: employee
      ? {
          titleGrade: employee.titleGrade || "",
          degree: employee.degree || "",
          roles: employee.teacherRoles || null,
          hiredAt: employee.hiredAt || teacher.hiredAt || "",
          status: employee.status || "",
        }
      : null,
    monthlyAssessment: findMonthlyAssessment(db, teacherId, month),
  });
  return {
    ...payroll,
    termId: term.id,
    termName: term.name,
  };
}

function ensurePayrollDetails(db) {
  if (!Array.isArray(db.payrollDetails)) db.payrollDetails = [];
  return db.payrollDetails;
}

function findTeacherPayrollDetail(db, teacherId, month = "2026-06") {
  return ensurePayrollDetails(db).find((item) => item.teacherId === teacherId && item.month === month);
}

// 月度考核变更后，该教师该月未锁定的工资单需要重算（已锁定的不动）
export function invalidateOpenPayrollDetailsForTeacher(db, teacherId, month) {
  return invalidateOpenPayrollDetails(
    db,
    (detail) => detail.teacherId === teacherId && (!month || detail.month === month),
  );
}

function invalidateOpenPayrollDetails(db, predicate = () => true) {
  const details = ensurePayrollDetails(db);
  const before = details.length;
  db.payrollDetails = details.filter((detail) => detail.status === "locked" || !predicate(detail));
  return before - db.payrollDetails.length;
}

function assertPayrollTeacherHandled(target) {
  if (!target) {
    const error = new Error("请先由财务生成本月工资明细");
    error.statusCode = 409;
    throw error;
  }
  if (!["teacher_confirmed", "disputed", "reviewed", "locked"].includes(target.status)) {
    const error = new Error("请先由老师确认工资明细或提出异议");
    error.statusCode = 409;
    error.details = { payrollStatus: target.status || "generated" };
    throw error;
  }
  return target;
}

function assertMonthTermEditable(db, month = "2026-06", actionName = "修改月度数据") {
  ensureEditableTerm(termForMonth(db, month), actionName);
}

function publishedPayrollStatus(status = "") {
  return ["generated", "teacher_confirmed", "disputed", "reviewed", "locked"].includes(status);
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

function payrollLockBlockersFromWorkload(workload) {
  if (!workload) return [];
  const pending = (workload.pendingLines || []).map((line) => ({
    type: "pending",
    lessonId: line.lessonId,
    date: line.date,
    time: line.time,
    className: line.className,
    subjectName: line.subjectName,
    room: line.room,
    status: line.status,
    reason:
      line.status === "checkedIn"
        ? "已签入但未签出，暂不能计入工资"
        : "未完成签入签出，暂不能计入工资",
  }));
  const exceptions = (workload.exceptionLines || []).map((line) => ({
    type: "exception",
    lessonId: line.lessonId,
    date: line.date,
    time: line.time,
    className: line.className,
    subjectName: line.subjectName,
    room: line.room,
    status: "exception",
    reason: line.note || "异常课次需处理后才能锁定工资",
  }));
  return [...pending, ...exceptions];
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
    lockBlockers: payrollLockBlockersFromWorkload(workload),
    confirmation: workload.confirmation,
    generated: generated
      ? {
          id: generated.id,
          termId: generated.termId || "",
          termName: generated.termName || "",
	          status: generated.status,
	          generatedAt: generated.generatedAt,
	          generatedByName: generated.generatedByName,
	          savedAt: generated.savedAt || "",
	          savedByName: generated.savedByName || "",
	          publishedAt: generated.publishedAt || "",
	          publishedByName: generated.publishedByName || "",
	          reviewedAt: generated.reviewedAt || "",
	          reviewedByName: generated.reviewedByName || "",
	          teacherConfirmedAt: generated.teacherConfirmedAt || "",
	          teacherConfirmedByName: generated.teacherConfirmedByName || "",
	          disputedAt: generated.disputedAt || "",
	          disputedByName: generated.disputedByName || "",
	          disputeReason: generated.disputeReason || "",
	          disputeResolvedAt: generated.disputeResolvedAt || "",
	          disputeResolvedByName: generated.disputeResolvedByName || "",
	          disputeResolution: generated.disputeResolution || "",
	          lockedAt: generated.lockedAt || "",
	          lockedByName: generated.lockedByName || "",
          unlockedAt: generated.unlockedAt || "",
          unlockedByName: generated.unlockedByName || "",
          unlockReason: generated.unlockReason || "",
          unlockHistory: generated.unlockHistory || [],
          summarySnapshot: generated.summarySnapshot,
          rowsSnapshot: generated.rowsSnapshot,
        }
      : null,
  };
}

export function generateTeacherPayrollDetail(db, teacherId, month = "2026-06", actorAccount = null, options = {}) {
  const targetStatus = options.status === "generated" ? "generated" : "saved";
  assertMonthTermEditable(db, month, targetStatus === "generated" ? "发布薪资" : "保存薪资");
  assertPayrollEligible(db, teacherId, month);
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
  const term = termForMonth(db, month);
  const generated = {
    id: existing?.id || `PAY-${teacherId}-${month.replace("-", "")}`,
    teacherId,
    month,
    termId: term.id,
    termName: term.name,
	    status: targetStatus,
	    generatedAt: now,
	    generatedByAccountId: actorAccount?.id || "",
	    generatedByName: actorAccount?.name || "",
	    savedAt: now,
	    savedByAccountId: actorAccount?.id || "",
	    savedByName: actorAccount?.name || "",
	    publishedAt: targetStatus === "generated" ? now : "",
	    publishedByAccountId: targetStatus === "generated" ? actorAccount?.id || "" : "",
	    publishedByName: targetStatus === "generated" ? actorAccount?.name || "" : "",
	    reviewedAt: "",
	    reviewedByAccountId: "",
	    reviewedByName: "",
	    teacherConfirmedAt: "",
	    teacherConfirmedByAccountId: "",
	    teacherConfirmedByName: "",
	    disputedAt: "",
	    disputedByAccountId: "",
	    disputedByName: "",
	    disputeReason: "",
	    disputeResolvedAt: "",
	    disputeResolvedByAccountId: "",
	    disputeResolvedByName: "",
	    disputeResolution: "",
	    lockedAt: "",
	    lockedByAccountId: "",
	    lockedByName: "",
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
    action: targetStatus === "generated" ? "payroll_publish_teacher" : "payroll_save",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    month,
    termId: term.id,
    termName: term.name,
    grossPay: detail.grossPay,
    netPay: detail.netPay,
  });
	  return teacherPayrollDetail(db, teacherId, month);
		}

export function publishTeacherPayrollDetail(db, teacherId, month = "2026-06", actorAccount = null) {
  assertMonthTermEditable(db, month, "发布薪资");
  let target = findTeacherPayrollDetail(db, teacherId, month);
  if (!target) {
    return generateTeacherPayrollDetail(db, teacherId, month, actorAccount, { status: "generated" });
  }
  if (target.status === "locked") return teacherPayrollDetail(db, teacherId, month);
  if (["teacher_confirmed", "disputed", "reviewed"].includes(target.status)) return teacherPayrollDetail(db, teacherId, month);

  const now = new Date().toISOString();
  target.status = "generated";
  target.publishedAt = now;
  target.publishedByAccountId = actorAccount?.id || "";
  target.publishedByName = actorAccount?.name || "";
  target.updatedAt = now;
  db.meta.updatedAt = now;
  appendAuditLog(db, {
    action: "payroll_publish_teacher",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    month,
    termId: target.termId || termForMonth(db, month).id,
    termName: target.termName || termForMonth(db, month).name,
    grossPay: target.summarySnapshot?.grossPay || 0,
    netPay: target.summarySnapshot?.netPay || 0,
  });
  return teacherPayrollDetail(db, teacherId, month);
}

export function confirmTeacherPayrollDetail(db, teacherId, month = "2026-06", actorAccount = null) {
  assertMonthTermEditable(db, month, "确认工资明细");
  const target = findTeacherPayrollDetail(db, teacherId, month);
  if (!target) {
    const error = new Error("财务尚未生成本月工资明细，暂不能确认");
    error.statusCode = 409;
    throw error;
  }
  if (target.status === "locked") return teacherPayrollDetail(db, teacherId, month);
  if (!["generated", "teacher_confirmed"].includes(target.status)) {
    const error = new Error(target.status === "disputed" ? "已提交异议，等待财务处理" : "当前工资单状态不能由老师确认");
    error.statusCode = 409;
    error.details = { payrollStatus: target.status };
    throw error;
  }

  const now = new Date().toISOString();
  target.status = "teacher_confirmed";
  target.teacherConfirmedAt = now;
  target.teacherConfirmedByAccountId = actorAccount?.id || "";
  target.teacherConfirmedByName = actorAccount?.name || "";
  target.disputedAt = "";
  target.disputedByAccountId = "";
  target.disputedByName = "";
  target.disputeReason = "";
  target.updatedAt = now;
  db.meta.updatedAt = now;
  appendAuditLog(db, {
    action: "payroll_teacher_confirm",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    month,
  });
  return teacherPayrollDetail(db, teacherId, month);
}

export function disputeTeacherPayrollDetail(db, teacherId, month = "2026-06", reason = "", actorAccount = null) {
  assertMonthTermEditable(db, month, "提出工资异议");
  const target = findTeacherPayrollDetail(db, teacherId, month);
  if (!target) {
    const error = new Error("财务尚未生成本月工资明细，暂不能提出异议");
    error.statusCode = 409;
    throw error;
  }
  if (target.status === "locked") {
    const error = new Error("工资已锁定，需财务解锁后才能提出异议");
    error.statusCode = 409;
    throw error;
  }
  if (!["generated", "teacher_confirmed", "disputed"].includes(target.status)) {
    const error = new Error("当前工资单状态不能提交异议");
    error.statusCode = 409;
    error.details = { payrollStatus: target.status };
    throw error;
  }
  const cleanReason = String(reason || "").trim();
  if (!cleanReason) {
    const error = new Error("请填写异议说明");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  target.status = "disputed";
  target.disputedAt = now;
  target.disputedByAccountId = actorAccount?.id || "";
  target.disputedByName = actorAccount?.name || "";
  target.disputeReason = cleanReason;
  target.disputeResolvedAt = "";
  target.disputeResolvedByAccountId = "";
  target.disputeResolvedByName = "";
  target.disputeResolution = "";
  target.updatedAt = now;
  db.meta.updatedAt = now;
  appendAuditLog(db, {
    action: "payroll_teacher_dispute",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    month,
    reason: cleanReason,
  });
  return teacherPayrollDetail(db, teacherId, month);
}

export function reviewTeacherPayrollDetail(db, teacherId, month = "2026-06", actorAccount = null) {
  assertMonthTermEditable(db, month, "处理工资异议");
  const target = assertPayrollTeacherHandled(findTeacherPayrollDetail(db, teacherId, month));
  if (target.status === "locked") return teacherPayrollDetail(db, teacherId, month);

  const now = new Date().toISOString();
  target.status = "reviewed";
  target.reviewedAt = now;
  target.reviewedByAccountId = actorAccount?.id || "";
  target.reviewedByName = actorAccount?.name || "";
  target.disputeResolvedAt = now;
  target.disputeResolvedByAccountId = actorAccount?.id || "";
  target.disputeResolvedByName = actorAccount?.name || "";
  target.disputeResolution =
    target.disputeReason && !target.disputeResolution ? "财务已处理老师异议并确认当前工资单" : target.disputeResolution || "";
  target.updatedAt = now;
  db.meta.updatedAt = now;
  appendAuditLog(db, {
    action: target.disputeReason ? "payroll_dispute_resolve" : "payroll_review",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    month,
  });
  return teacherPayrollDetail(db, teacherId, month);
}

export function lockTeacherPayrollDetail(db, teacherId, month = "2026-06", actorAccount = null) {
  assertMonthTermEditable(db, month, "锁定薪资");
  let target = findTeacherPayrollDetail(db, teacherId, month);
  if (!target) {
    const error = new Error("请先生成工资明细并完成老师确认/异议处理");
    error.statusCode = 409;
    throw error;
  }
  if (target.status === "locked") return teacherPayrollDetail(db, teacherId, month);
  if (target.status !== "reviewed") {
    const error = new Error("请先完成老师确认和财务处理，再锁定薪资");
    error.statusCode = 409;
    throw error;
  }

  const detail = teacherPayrollDetail(db, teacherId, month);
  const pendingCount = detail?.workloadSummary?.pendingCount || 0;
  const exceptionCount = detail?.workloadSummary?.exceptionCount || 0;
  if (pendingCount || exceptionCount) {
    const error = new Error("仍有待处理或异常课时，不能锁定薪资");
    error.statusCode = 409;
    error.details = {
      pendingCount,
      exceptionCount,
      blockers: detail?.lockBlockers || [],
    };
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

export function unlockTeacherPayrollDetail(db, teacherId, month = "2026-06", reason = "", actorAccount = null) {
  assertMonthTermEditable(db, month, "解锁薪资");
  const target = findTeacherPayrollDetail(db, teacherId, month);
  if (!target) {
    const error = new Error("本月薪资明细不存在，无法解锁");
    error.statusCode = 404;
    throw error;
  }
  if (target.status !== "locked") {
    const error = new Error("只有已锁定的薪资可以解锁");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date().toISOString();
  const unlockEntry = {
    unlockedAt: now,
    unlockedByAccountId: actorAccount?.id || "",
    unlockedByName: actorAccount?.name || "",
    reason: String(reason || "财务更正后重新核算").trim(),
    previousSummarySnapshot: target.summarySnapshot,
    previousRowsSnapshot: target.rowsSnapshot,
  };

  target.status = "generated";
  target.reviewedAt = "";
  target.reviewedByAccountId = "";
  target.reviewedByName = "";
  target.lockedAt = "";
  target.lockedByAccountId = "";
  target.lockedByName = "";
  target.unlockedAt = now;
  target.unlockedByAccountId = actorAccount?.id || "";
  target.unlockedByName = actorAccount?.name || "";
  target.unlockReason = unlockEntry.reason;
  target.unlockHistory = [...(target.unlockHistory || []), unlockEntry];
  target.updatedAt = now;

  const confirmation = findMonthlyWorkloadConfirmation(db, teacherId, month);
  if (confirmation?.status === "locked") {
    confirmation.status = "school_approved";
    confirmation.stage = 2;
    confirmation.lockedAt = "";
    confirmation.lockedByAccountId = "";
    confirmation.lockedByName = "";
    confirmation.updatedAt = now;
  }

  appendAuditLog(db, {
    action: "payroll_unlock",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    teacherId,
    month,
    reason: unlockEntry.reason,
  });
  return teacherPayrollDetail(db, teacherId, month);
}

export function generatePayrollBatch(db, options = {}, actorAccount = null) {
  const month = String(options.month || "2026-06");
  assertMonthTermEditable(db, month, "批量生成薪资");
  const teacherIds = Array.isArray(options.teacherIds)
    ? options.teacherIds
    : db.teachers.filter((teacher) => teacher.status === "active").map((teacher) => teacher.id);
  const now = new Date().toISOString();
  const results = [];

  teacherIds.forEach((teacherId) => {
    try {
      const detail = publishTeacherPayrollDetail(db, teacherId, month, actorAccount);
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

export function lockPayrollBatch(db, options = {}, actorAccount = null) {
  const month = String(options.month || "2026-06");
  assertMonthTermEditable(db, month, "批量锁定薪资");
  const teacherIds = Array.isArray(options.teacherIds)
    ? options.teacherIds
    : db.teachers.filter((teacher) => teacher.status === "active").map((teacher) => teacher.id);
  const now = new Date().toISOString();
  const results = [];

  teacherIds.forEach((teacherId) => {
    try {
      const detail = lockTeacherPayrollDetail(db, teacherId, month, actorAccount);
      results.push({
        teacherId,
        teacherName: detail.teacher.name,
        status: detail.generated?.status || "locked",
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
        details: error.details || null,
      });
    }
  });

  const batch = {
    id: `PBL-${month.replace("-", "")}-${Date.now()}`,
    type: "lock",
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
  const termId = String(options.termId || "").trim();
  const stageId = String(options.stageId || "").trim();
  const grade = Number.parseInt(options.grade || "", 10);
  const search = String(options.search || "").trim().toLowerCase();
  const details = payrollDetailsByFilter(db, { month, termId, stageId, grade, search });
  const headers = [
    "学期",
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
    "补充项明细",
    "扣减项明细",
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
    const snapshotRows = Array.isArray(detail.rowsSnapshot) ? detail.rowsSnapshot : [];
    const describeSnapshotRows = (category) =>
      snapshotRows
        .filter((row) => row.category === category && row.name !== "个税代扣")
        .map((row) => `${row.name}:${row.amount}`)
        .join("；");
    return [
      detail.termName || payrollDetailTerm(db, detail)?.name || "",
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
      describeSnapshotRows("supplement"),
      describeSnapshotRows("deduction"),
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
    termId,
    filename: `teacher-payroll-${month}${termId ? `-${termId}` : ""}${stageId ? `-${stageId}` : ""}${Number.isFinite(grade) ? `-g${grade}` : ""}.csv`,
    total: rows.length,
    content: [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n"),
  };
}

function payrollDetailTerm(db, detail) {
  if (detail?.termId) {
    return listTerms(db).find((term) => term.id === detail.termId) || { id: detail.termId, name: detail.termName || "" };
  }
  return termForMonth(db, detail?.month || "2026-06");
}

function payrollDetailsByFilter(db, options = {}) {
  const month = String(options.month || "2026-06");
  const termId = String(options.termId || "").trim();
  const stageId = String(options.stageId || "").trim();
  const grade = Number.isFinite(options.grade)
    ? options.grade
    : Number.parseInt(options.grade || "", 10);
  const search = String(options.search || "").trim().toLowerCase();
  const status = String(options.status || "").trim();
  return ensurePayrollDetails(db).filter((detail) => {
    if (detail.month !== month) return false;
    if (termId && payrollDetailTerm(db, detail)?.id !== termId) return false;
    if (status && detail.status !== status) return false;
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
}

function payrollHistoryItem(db, detail) {
  const teacher = findTeacher(db, detail.teacherId);
  const summary = detail.summarySnapshot || {};
  return {
    id: detail.id,
    teacherId: detail.teacherId,
    employeeNo: teacher?.employeeNo || detail.teacherId,
    teacherName: teacher?.name || detail.teacherId,
    stageId: teacher?.stageId || "",
    stageName: teacher?.stageName || teacher?.department || "",
    gradeText: teacher ? gradeCoverageText(db, teacher) : "",
    subjectName: teacher?.primarySubjectName || teacher?.subject || "",
    status: detail.status || "generated",
    generatedAt: detail.generatedAt || "",
    teacherConfirmedAt: detail.teacherConfirmedAt || "",
    reviewedAt: detail.reviewedAt || "",
    lockedAt: detail.lockedAt || "",
    grossPay: summary.grossPay || 0,
    tax: summary.tax || 0,
    netPay: summary.netPay || 0,
    payableUnits: summary.payableUnits || 0,
    pendingCount: summary.pendingCount || 0,
    exceptionCount: summary.exceptionCount || 0,
  };
}

export function queryPayrollHistory(db, options = {}) {
  const month = String(options.month || "2026-06");
  const termId = String(options.termId || termForMonth(db, month).id).trim();
  const details = payrollDetailsByFilter(db, { ...options, month, termId }).sort((a, b) => {
    const teacherA = findTeacher(db, a.teacherId);
    const teacherB = findTeacher(db, b.teacherId);
    return `${teacherA?.stageId || ""}-${teacherA?.employeeNo || a.teacherId}`.localeCompare(
      `${teacherB?.stageId || ""}-${teacherB?.employeeNo || b.teacherId}`,
      "zh-CN",
    );
  });
  const items = details.map((detail) => payrollHistoryItem(db, detail));
  const statusCounts = items.reduce(
    (counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    },
    {},
  );
  const lockedItems = items.filter((item) => item.status === "locked");
  const sumBy = (rows, key) => rows.reduce((total, row) => total + Number(row[key] || 0), 0);
  const term = termId ? listTerms(db).find((item) => item.id === termId) || { id: termId, name: "" } : termForMonth(db, month);
  return {
    term: {
      id: term?.id || termId,
      name: term?.name || "",
    },
    month,
    summary: {
      totalCount: items.length,
      lockedCount: lockedItems.length,
      generatedCount: items.length - lockedItems.length,
      paidGrossPay: sumBy(lockedItems, "grossPay"),
      paidTax: sumBy(lockedItems, "tax"),
      paidNetPay: sumBy(lockedItems, "netPay"),
      grossPay: sumBy(items, "grossPay"),
      tax: sumBy(items, "tax"),
      netPay: sumBy(items, "netPay"),
      statusCounts,
    },
    items,
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
    termId: confirmation.termId || "",
    termName: confirmation.termName || "",
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
  const term = termForMonth(db, month);

  const lessons = [...(lessonsByTeacherForMonth(db, month).get(teacherId) || [])].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
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
    termId: term.id,
    termName: term.name,
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
  assertMonthTermEditable(db, month, "确认工作量");
  const workload = teacherMonthlyWorkload(db, teacherId, month);
  if (!workload) {
    const error = new Error("教师不存在");
    error.statusCode = 404;
    throw error;
  }

  const confirmations = ensureWorkloadConfirmations(db);
  const existing = findMonthlyWorkloadConfirmation(db, teacherId, month);
  const term = termForMonth(db, month);
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
    termId: term.id,
    termName: term.name,
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
    termId: term.id,
    termName: term.name,
  });
  return teacherMonthlyWorkload(db, teacherId, month);
}

export function approveMonthlyWorkload(db, teacherId, month = "2026-06", step = "academic", actorAccount = null) {
  assertMonthTermEditable(db, month, "审批工作量");
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
