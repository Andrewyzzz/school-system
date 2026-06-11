const schedulingCatalog = {
  periods: [
    { period: 1, time: "08:00-08:40" },
    { period: 2, time: "08:50-09:30" },
    { period: 3, time: "10:10-10:50" },
    { period: 4, time: "11:00-11:40" },
    { period: 5, time: "14:20-15:00" },
    { period: 6, time: "15:20-16:00" },
  ],
  divisions: [
    {
      id: "elementary",
      name: "小学部",
      shortName: "小学",
      classCount: 10,
      roomPrefix: "P",
      weekStart: "2026-06-15",
      grades: [
        { id: "elementary-g1", name: "一年级", code: "P1" },
        { id: "elementary-g2", name: "二年级", code: "P2" },
        { id: "elementary-g3", name: "三年级", code: "P3" },
        { id: "elementary-g4", name: "四年级", code: "P4" },
        { id: "elementary-g5", name: "五年级", code: "P5" },
        { id: "elementary-g6", name: "六年级", code: "P6" },
      ],
      subjectIds: ["chinese", "math", "english", "pe", "science", "music", "art"],
    },
    {
      id: "middle",
      name: "初中部",
      shortName: "初中",
      classCount: 8,
      roomPrefix: "J",
      weekStart: "2026-06-22",
      grades: [
        { id: "middle-g1", name: "初一", code: "J1" },
        { id: "middle-g2", name: "初二", code: "J2" },
        { id: "middle-g3", name: "初三", code: "J3" },
      ],
      subjectIds: ["chinese", "math", "english", "physics", "chemistry", "biology", "history", "geography", "pe"],
    },
    {
      id: "high",
      name: "高中部",
      shortName: "高中",
      classCount: 6,
      roomPrefix: "H",
      weekStart: "2026-06-29",
      grades: [
        { id: "high-g1", name: "高一", code: "H1" },
        { id: "high-g2", name: "高二", code: "H2" },
        { id: "high-g3", name: "高三", code: "H3" },
      ],
      subjectIds: ["chinese", "math", "english", "physics", "chemistry", "biology", "history", "geography", "politics", "pe"],
    },
  ],
  subjects: {
    chinese: { id: "chinese", name: "语文", weeklyLessons: 5, teacherIds: ["SCH-CN01", "SCH-CN02", "SCH-CN03", "SCH-CN04", "SCH-CN05"] },
    math: { id: "math", name: "数学", weeklyLessons: 5, teacherIds: ["T001", "SCH-MA02", "SCH-MA03", "SCH-MA04", "SCH-MA05"] },
    english: { id: "english", name: "英语", weeklyLessons: 4, teacherIds: ["T002", "SCH-EN02", "SCH-EN03", "SCH-EN04", "SCH-EN05"] },
    pe: { id: "pe", name: "体育", weeklyLessons: 2, teacherIds: ["SCH-PE01", "SCH-PE02", "SCH-PE03", "SCH-PE04"] },
    science: { id: "science", name: "科学", weeklyLessons: 2, teacherIds: ["SCH-SC01", "SCH-SC02", "SCH-SC03", "SCH-SC04"] },
    music: { id: "music", name: "音乐", weeklyLessons: 1, teacherIds: ["SCH-MU01", "SCH-MU02", "SCH-MU03"] },
    art: { id: "art", name: "美术", weeklyLessons: 1, teacherIds: ["SCH-AR01", "SCH-AR02", "SCH-AR03"] },
    physics: { id: "physics", name: "物理", weeklyLessons: 3, teacherIds: ["T003", "SCH-PH02", "SCH-PH03", "SCH-PH04", "SCH-PH05"] },
    chemistry: { id: "chemistry", name: "化学", weeklyLessons: 2, teacherIds: ["SCH-CH01", "SCH-CH02", "SCH-CH03", "SCH-CH04"] },
    biology: { id: "biology", name: "生物", weeklyLessons: 2, teacherIds: ["SCH-BI01", "SCH-BI02", "SCH-BI03", "SCH-BI04"] },
    history: { id: "history", name: "历史", weeklyLessons: 2, teacherIds: ["SCH-HI01", "SCH-HI02", "SCH-HI03", "SCH-HI04"] },
    geography: { id: "geography", name: "地理", weeklyLessons: 2, teacherIds: ["SCH-GE01", "SCH-GE02", "SCH-GE03", "SCH-GE04"] },
    politics: { id: "politics", name: "政治", weeklyLessons: 2, teacherIds: ["SCH-PO01", "SCH-PO02", "SCH-PO03", "SCH-PO04"] },
  },
  teachers: [
    { id: "SCH-CN01", name: "赵雅", subject: "语文" },
    { id: "SCH-CN02", name: "孙悦", subject: "语文" },
    { id: "SCH-CN03", name: "高洁", subject: "语文" },
    { id: "SCH-CN04", name: "梁晨", subject: "语文" },
    { id: "SCH-CN05", name: "蒋琳", subject: "语文" },
    { id: "T001", name: "李明", subject: "数学" },
    { id: "SCH-MA02", name: "吴磊", subject: "数学" },
    { id: "SCH-MA03", name: "郑楠", subject: "数学" },
    { id: "SCH-MA04", name: "唐琪", subject: "数学" },
    { id: "SCH-MA05", name: "罗文", subject: "数学" },
    { id: "T002", name: "王敏", subject: "英语" },
    { id: "SCH-EN02", name: "沈妍", subject: "英语" },
    { id: "SCH-EN03", name: "周帆", subject: "英语" },
    { id: "SCH-EN04", name: "袁青", subject: "英语" },
    { id: "SCH-EN05", name: "秦璐", subject: "英语" },
    { id: "SCH-PE01", name: "马越", subject: "体育" },
    { id: "SCH-PE02", name: "丁强", subject: "体育" },
    { id: "SCH-PE03", name: "潘宇", subject: "体育" },
    { id: "SCH-PE04", name: "韩硕", subject: "体育" },
    { id: "SCH-SC01", name: "林安", subject: "科学" },
    { id: "SCH-SC02", name: "顾宁", subject: "科学" },
    { id: "SCH-SC03", name: "许晴", subject: "科学" },
    { id: "SCH-SC04", name: "戴舟", subject: "科学" },
    { id: "SCH-MU01", name: "叶宁", subject: "音乐" },
    { id: "SCH-MU02", name: "白珂", subject: "音乐" },
    { id: "SCH-MU03", name: "杜若", subject: "音乐" },
    { id: "SCH-AR01", name: "方绮", subject: "美术" },
    { id: "SCH-AR02", name: "沈璐", subject: "美术" },
    { id: "SCH-AR03", name: "陆遥", subject: "美术" },
    { id: "T003", name: "陈强", subject: "物理" },
    { id: "SCH-PH02", name: "陆然", subject: "物理" },
    { id: "SCH-PH03", name: "曹靖", subject: "物理" },
    { id: "SCH-PH04", name: "任宁", subject: "物理" },
    { id: "SCH-PH05", name: "魏航", subject: "物理" },
    { id: "SCH-CH01", name: "孟雪", subject: "化学" },
    { id: "SCH-CH02", name: "许博", subject: "化学" },
    { id: "SCH-CH03", name: "姜禾", subject: "化学" },
    { id: "SCH-CH04", name: "叶岚", subject: "化学" },
    { id: "SCH-BI01", name: "宋青", subject: "生物" },
    { id: "SCH-BI02", name: "韩霖", subject: "生物" },
    { id: "SCH-BI03", name: "俞岚", subject: "生物" },
    { id: "SCH-BI04", name: "邵羽", subject: "生物" },
    { id: "SCH-HI01", name: "秦川", subject: "历史" },
    { id: "SCH-HI02", name: "程越", subject: "历史" },
    { id: "SCH-HI03", name: "傅乔", subject: "历史" },
    { id: "SCH-HI04", name: "罗岑", subject: "历史" },
    { id: "SCH-GE01", name: "严澄", subject: "地理" },
    { id: "SCH-GE02", name: "唐溪", subject: "地理" },
    { id: "SCH-GE03", name: "何远", subject: "地理" },
    { id: "SCH-GE04", name: "夏澜", subject: "地理" },
    { id: "SCH-PO01", name: "周谨", subject: "政治" },
    { id: "SCH-PO02", name: "钟琪", subject: "政治" },
    { id: "SCH-PO03", name: "万晴", subject: "政治" },
    { id: "SCH-PO04", name: "金越", subject: "政治" },
  ],
};

function buildSchedulingConfig(divisionId = "elementary", gradeId = "elementary-g1") {
  const division =
    schedulingCatalog.divisions.find((item) => item.id === divisionId) ||
    schedulingCatalog.divisions[0];
  const grade =
    division.grades.find((item) => item.id === gradeId) ||
    division.grades[0];
  const subjects = division.subjectIds.map((subjectId) => ({ ...schedulingCatalog.subjects[subjectId] }));

  return {
    divisionId: division.id,
    divisionName: division.name,
    gradeId: grade.id,
    gradeName: grade.name,
    weekStart: division.weekStart,
    classCount: division.classCount,
    classes: Array.from({ length: division.classCount }, (_, index) => ({
      id: `${grade.code}C${String(index + 1).padStart(2, "0")}`,
      name: `${grade.name} ${index + 1} 班`,
      room: `${division.roomPrefix}${grade.code.slice(1)}-${String(index + 1).padStart(2, "0")}`,
    })),
    periods: schedulingCatalog.periods.map((period) => ({ ...period })),
    subjects,
    teachers: schedulingCatalog.teachers.map((teacher) => ({ ...teacher })),
    divisions: schedulingCatalog.divisions.map((item) => ({
      id: item.id,
      name: item.name,
      grades: item.grades.map((catalogGrade) => ({ ...catalogGrade })),
    })),
  };
}

const initialState = {
  currentAccountId: "teacher-li",
  activeView: "dashboard",
  taskFilter: "all",
  selectedFinanceTeacherId: "T001",
  financeGroupBy: "department",
  selectedNoticeId: "N001",
  selectedSchedulingDivisionId: "elementary",
  selectedSchedulingGradeId: "elementary-g1",
  selectedSchedulingClassId: "P1C01",
  selectedScheduleWeekStart: "2026-06-08",
  scannerLessonId: "L002",
  lastScanText: "",
  lastSecurityChecks: [],
  lastSecurityPassed: null,
  demoNow: "2026-06-09T10:05:00+08:00",
  notices: [
    {
      id: "N001",
      audience: "teacher",
      source: "教务处",
      title: "今日课表已分发",
      text: "请老师按课表到对应教室完成课前签入和课后签出，未完成项目暂不计薪。",
      time: "2026-06-09 07:40",
      level: "info",
    },
    {
      id: "N002",
      audience: "teacher",
      source: "总校",
      title: "月度工作量确认提醒",
      text: "本月工作量确认仅展示总工资和有效工作量，明细薪资由财务端留存复核。",
      time: "2026-06-09 09:00",
      level: "warning",
    },
    {
      id: "N003",
      audience: "finance",
      source: "总校",
      title: "工资结算口径",
      text: "财务首页新增全校工资汇总和分组统计，结算明细仍保留在薪资结算页面。",
      time: "2026-06-09 09:20",
      level: "info",
    },
    {
      id: "N004",
      audience: "all",
      source: "系统",
      title: "固定教室码试运行",
      text: "本 Demo 使用固定教室码模拟扫码，正式产品将由后端进行身份、设备、课表和时间窗口校验。",
      time: "2026-06-09 10:00",
      level: "info",
    },
    {
      id: "N005",
      audience: "admin",
      source: "教务处",
      title: "学部年级排课任务",
      text: "请行政账号先选择学部和年级，再生成自然周课表，校验老师同一时间无冲突后确认发布。",
      time: "2026-06-10 08:30",
      level: "warning",
    },
  ],
  accounts: [
    {
      id: "teacher-li",
      role: "teacher",
      name: "李明",
      title: "老师账号",
      teacherId: "T001",
      deviceId: "li-phone-001",
    },
    {
      id: "finance-zhang",
      role: "finance",
      name: "张会计",
      title: "财务账号",
      department: "财务部",
    },
    {
      id: "admin-zhou",
      role: "admin",
      name: "周主任",
      title: "行政账号",
      department: "教务行政",
    },
  ],
  teachers: [
    {
      id: "T001",
      name: "李明",
      department: "小学部",
      subject: "数学",
      grade: "小学三至六年级",
      position: "小学数学任课教师",
      boundDeviceId: "li-phone-001",
      salaryProfile: {
        baseSalary: 6200,
        positionSalary: 1800,
        homeroomAllowance: 800,
        famousTeacherReward: 500,
        approvedOvertimeHours: 3,
        attendanceDeduction: 120,
        socialInsurance: 1100,
      },
    },
    {
      id: "T002",
      name: "王敏",
      department: "初中部",
      subject: "英语",
      grade: "初中一至三年级",
      position: "初中英语任课教师",
      salaryProfile: {
        baseSalary: 6800,
        positionSalary: 2200,
        homeroomAllowance: 0,
        famousTeacherReward: 300,
        approvedOvertimeHours: 5,
        attendanceDeduction: 0,
        socialInsurance: 1250,
      },
    },
    {
      id: "T003",
      name: "陈强",
      department: "高中部",
      subject: "物理",
      grade: "高中一至三年级",
      position: "高中物理任课教师",
      salaryProfile: {
        baseSalary: 7200,
        positionSalary: 2600,
        homeroomAllowance: 1000,
        famousTeacherReward: 700,
        approvedOvertimeHours: 2,
        attendanceDeduction: 80,
        socialInsurance: 1380,
      },
    },
  ],
  confirmationStages: {
    T001: 0,
    T002: 1,
    T003: 0,
  },
  settlements: {
    T001: { status: "unsettled", settledAt: "" },
    T002: { status: "unsettled", settledAt: "" },
    T003: { status: "settled", settledAt: "2026-06-08 16:20" },
  },
  rules: {
    regularLessonRate: 80,
    selfStudyRate: 50,
    weekendRate: 120,
    overtimeRate: 60,
    taxThreshold: 5000,
    taxRate: 0.03,
  },
  schedulingConfig: buildSchedulingConfig("elementary", "elementary-g1"),
  schedulingDraft: {
    status: "empty",
    divisionId: "elementary",
    gradeId: "elementary-g1",
    generatedAt: "",
    confirmedAt: "",
    publishedAt: "",
    assignments: [],
    conflicts: [],
    publishedLessonIds: [],
  },
  lessons: [
    {
      id: "L001",
      teacherId: "T001",
      date: "2026-06-09",
      time: "08:00-08:40",
      className: "三年级 2 班",
      course: "数学",
      room: "A302",
      type: "regular",
      units: 1,
      status: "completed",
      scanTime: "08:03",
      note: "签入签出完成，计入本月薪资",
    },
    {
      id: "L002",
      teacherId: "T001",
      date: "2026-06-09",
      time: "10:10-10:50",
      className: "四年级 1 班",
      course: "数学",
      room: "A401",
      type: "regular",
      units: 1,
      status: "pending",
      scanTime: "",
      note: "等待老师课前签入",
    },
    {
      id: "L003",
      teacherId: "T001",
      date: "2026-06-09",
      time: "17:50-18:30",
      className: "五年级 3 班",
      course: "晚自习",
      room: "C203",
      type: "evening",
      units: 1,
      status: "pending",
      scanTime: "",
      note: "晚自习补贴",
    },
    {
      id: "L004",
      teacherId: "T001",
      date: "2026-06-10",
      time: "08:00-08:40",
      className: "三年级 2 班",
      course: "数学",
      room: "A302",
      type: "regular",
      units: 1,
      status: "completed",
      scanTime: "08:02",
      note: "签入签出完成，计入本月薪资",
    },
    {
      id: "L005",
      teacherId: "T001",
      date: "2026-06-10",
      time: "14:20-15:00",
      className: "四年级 1 班",
      course: "数学",
      room: "A401",
      type: "regular",
      units: 1,
      status: "completed",
      scanTime: "14:22",
      note: "调课已由教务审批",
    },
    {
      id: "L006",
      teacherId: "T001",
      date: "2026-06-11",
      time: "07:20-08:00",
      className: "六年级 1 班",
      course: "早自习",
      room: "B201",
      type: "morning",
      units: 1,
      status: "completed",
      scanTime: "07:21",
      note: "早自习补贴",
    },
    {
      id: "L007",
      teacherId: "T001",
      date: "2026-06-12",
      time: "07:20-08:00",
      className: "六年级 1 班",
      course: "早自习",
      room: "B201",
      type: "morning",
      units: 1,
      status: "exception",
      scanTime: "07:21",
      note: "同一时间段重复申报，待教务复核",
    },
    {
      id: "L008",
      teacherId: "T001",
      date: "2026-06-13",
      time: "09:00-10:30",
      className: "五年级 3 班",
      course: "周末补课",
      room: "C203",
      type: "weekend",
      units: 2,
      status: "completed",
      scanTime: "09:01",
      note: "周末补课已审批",
    },
    {
      id: "L009",
      teacherId: "T002",
      date: "2026-06-09",
      time: "08:00-08:40",
      className: "初一 1 班",
      course: "英语",
      room: "D101",
      type: "regular",
      units: 1,
      status: "completed",
      scanTime: "08:01",
      note: "签入签出完成，计入本月薪资",
    },
    {
      id: "L010",
      teacherId: "T002",
      date: "2026-06-09",
      time: "10:10-10:50",
      className: "初一 2 班",
      course: "英语",
      room: "D103",
      type: "regular",
      units: 1,
      status: "completed",
      scanTime: "10:12",
      note: "签入签出完成，计入本月薪资",
    },
    {
      id: "L011",
      teacherId: "T002",
      date: "2026-06-10",
      time: "18:00-19:20",
      className: "初二 3 班",
      course: "晚自习",
      room: "D205",
      type: "evening",
      units: 2,
      status: "pending",
      scanTime: "",
      note: "等待老师课前签入",
    },
    {
      id: "L012",
      teacherId: "T002",
      date: "2026-06-13",
      time: "09:00-10:30",
      className: "初三 1 班",
      course: "周末补课",
      room: "D301",
      type: "weekend",
      units: 2,
      status: "completed",
      scanTime: "09:04",
      note: "周末补课已审批",
    },
    {
      id: "L013",
      teacherId: "T003",
      date: "2026-06-09",
      time: "08:50-09:30",
      className: "高一 2 班",
      course: "物理",
      room: "E402",
      type: "regular",
      units: 1,
      status: "completed",
      scanTime: "08:51",
      note: "签入签出完成，计入本月薪资",
    },
    {
      id: "L014",
      teacherId: "T003",
      date: "2026-06-10",
      time: "15:20-16:00",
      className: "高二 1 班",
      course: "物理",
      room: "E305",
      type: "regular",
      units: 1,
      status: "completed",
      scanTime: "15:21",
      note: "签入签出完成，计入本月薪资",
    },
    {
      id: "L015",
      teacherId: "T003",
      date: "2026-06-11",
      time: "15:20-16:00",
      className: "高二 1 班",
      course: "物理",
      room: "E305",
      type: "regular",
      units: 1,
      status: "exception",
      scanTime: "15:21",
      note: "同一时间段存在重复课时记录，待教务复核",
    },
    {
      id: "L016",
      teacherId: "T003",
      date: "2026-06-13",
      time: "10:40-12:10",
      className: "高三 4 班",
      course: "周末补课",
      room: "E501",
      type: "weekend",
      units: 2,
      status: "completed",
      scanTime: "10:39",
      note: "周末补课已审批",
    },
  ],
};

const STORAGE_KEY = "schoolPayrollDemoStateV8";
const SESSION_KEY = "schoolPayrollDemoSessionV1";
const API_SESSION_KEY = "schoolPayrollApiSessionV1";
const SECURITY_SECRET = "school-demo-signing-key";
const loginUsers = [
  { username: "teacher", password: "123456", accountId: "teacher-li" },
  { username: "finance", password: "123456", accountId: "finance-zhang" },
  { username: "admin", password: "123456", accountId: "admin-zhou" },
];

let state = loadSavedState();
let sessionAccountId = loadSession();
let backendSession = loadBackendSession();
let qrScanner = null;
let financeTeacherPage = {
  items: [],
  meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  page: 1,
  pageSize: 20,
  search: "",
  loaded: false,
  loading: false,
  error: "",
};
let teacherImportState = {
  csvText: "",
  preview: null,
  previewCsvText: "",
  imported: null,
  committedCsvText: "",
  loading: false,
  error: "",
};
let schedulingBackendState = {
  loaded: false,
  loading: false,
  error: "",
};

if (backendSession?.account) {
  sessionAccountId = upsertBackendAccount(backendSession.account);
  state.currentAccountId = sessionAccountId;
} else if (sessionAccountId && state.accounts.some((account) => account.id === sessionAccountId)) {
  state.currentAccountId = sessionAccountId;
} else {
  sessionAccountId = "";
}

const views = {
  dashboard: {
    role: "teacher",
    title: "老师工作台",
    el: document.querySelector("#dashboardView"),
  },
  tasks: {
    role: "teacher",
    title: "我的课时任务",
    el: document.querySelector("#tasksView"),
  },
  schedule: {
    role: "teacher",
    title: "我的课表",
    el: document.querySelector("#scheduleView"),
  },
  adminScheduling: {
    role: "admin",
    title: "行政排课",
    el: document.querySelector("#adminSchedulingView"),
  },
  teacherImport: {
    role: "admin",
    title: "教师导入",
    el: document.querySelector("#teacherImportView"),
  },
  notifications: {
    role: "teacher,finance",
    title: "通知中心",
    el: document.querySelector("#notificationsView"),
  },
  scanner: {
    role: "teacher",
    title: "签入/签出入口",
    el: document.querySelector("#scannerView"),
  },
  records: {
    role: "teacher",
    title: "我的考勤记录",
    el: document.querySelector("#recordsView"),
  },
  confirm: {
    role: "teacher",
    title: "月度工作量确认",
    el: document.querySelector("#confirmView"),
  },
  finance: {
    role: "finance",
    title: "财务首页",
    el: document.querySelector("#financeView"),
  },
  financeRecords: {
    role: "finance",
    title: "老师考勤记录",
    el: document.querySelector("#financeRecordsView"),
  },
  settlement: {
    role: "finance",
    title: "薪资结算",
    el: document.querySelector("#settlementView"),
  },
  warnings: {
    role: "teacher,finance",
    title: "异常提醒",
    el: document.querySelector("#warningsView"),
  },
};

const defaultViewByRole = {
  teacher: "dashboard",
  finance: "finance",
  admin: "adminScheduling",
};

const lessonTypeLabel = {
  regular: "正常课时",
  morning: "早自习",
  evening: "晚自习",
  weekend: "周末补课",
};

const statusLabel = {
  pending: "待签入",
  checkedIn: "待签出",
  completed: "已完成",
  scheduled: "未到时间",
  exception: "异常",
};

const confirmSteps = [
  { label: "第 1 步", title: "系统生成月度工作量" },
  { label: "第 2 步", title: "老师确认课时与补贴" },
  { label: "第 3 步", title: "学部教务审批" },
  { label: "第 4 步", title: "总校审批锁定" },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildTeacherImportTemplate() {
  const seed = String(Date.now()).slice(-5);
  return `employeeNo,name,stageId,department,primarySubjectId,title,phone,hiredAt,username,defaultPassword,status
FY${seed}1,导入老师A,primary,小学部,chinese,任课教师,139${seed}001,2026-09-01,teacher${seed}1,123456,active
FY${seed}2,导入老师B,middle,初中部,math,骨干教师,139${seed}002,2026-09-01,teacher${seed}2,123456,active
FY${seed}3,导入老师C,high,高中部,english,高级教师,139${seed}003,2026-09-01,teacher${seed}3,123456,active`;
}

function loadSavedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(initialState);
    const saved = JSON.parse(raw);
    const selectedDivisionId = saved.selectedSchedulingDivisionId || initialState.selectedSchedulingDivisionId;
    const selectedGradeId = saved.selectedSchedulingGradeId || initialState.selectedSchedulingGradeId;
    const schedulingConfig = buildSchedulingConfig(selectedDivisionId, selectedGradeId);
    const nextState = {
      ...clone(initialState),
      ...saved,
      accounts: clone(initialState.accounts),
      teachers: clone(initialState.teachers),
      selectedSchedulingDivisionId: schedulingConfig.divisionId,
      selectedSchedulingGradeId: schedulingConfig.gradeId,
      schedulingConfig,
      schedulingDraft: {
        ...clone(initialState.schedulingDraft),
        ...(saved.schedulingDraft || {}),
      },
      rules: clone(initialState.rules),
    };
    if (!schedulingConfig.classes.some((schoolClass) => schoolClass.id === nextState.selectedSchedulingClassId)) {
      nextState.selectedSchedulingClassId = schedulingConfig.classes[0]?.id || "";
    }
    return nextState;
  } catch (error) {
    return clone(initialState);
  }
}

function saveState() {
  if (!sessionAccountId) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Local storage may be disabled in some browser privacy modes.
  }
}

function loadSession() {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch (error) {
    return "";
  }
}

function saveSession(accountId) {
  try {
    window.localStorage.setItem(SESSION_KEY, accountId);
  } catch (error) {
    // Session persistence is best-effort in this static demo.
  }
}

function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    // Nothing else to do.
  }
}

function apiEnabled() {
  return window.location.protocol === "http:" || window.location.protocol === "https:";
}

function loadBackendSession() {
  try {
    const raw = window.localStorage.getItem(API_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function saveBackendSession(session) {
  backendSession = session;
  try {
    window.localStorage.setItem(API_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    // API session persistence is best-effort.
  }
}

function clearBackendSession() {
  backendSession = null;
  try {
    window.localStorage.removeItem(API_SESSION_KEY);
  } catch (error) {
    // Nothing else to do.
  }
}

async function apiRequest(path, options = {}) {
  if (!apiEnabled()) throw new Error("当前是文件模式，未连接后端 API");
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(backendSession?.token ? { Authorization: `Bearer ${backendSession.token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }
  if (!response.ok) {
    const message = payload?.error?.message || `API 请求失败：${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = payload?.error?.details || null;
    throw error;
  }
  return payload;
}

function roleTitle(role) {
  if (role === "teacher") return "老师账号";
  if (role === "finance") return "财务账号";
  if (role === "admin") return "行政账号";
  return "系统账号";
}

function normalizeBackendTeacher(teacher) {
  if (!teacher) return null;
  return {
    id: teacher.id,
    name: teacher.name,
    department: teacher.department || teacher.stageName || "未设置学部",
    subject: teacher.primarySubjectName || "未设置学科",
    grade: teacher.stageName || teacher.department || "未设置年级",
    position: teacher.title || "任课教师",
    boundDeviceId: "backend-web",
    salaryProfile: {
      baseSalary: 6500,
      positionSalary: 1500,
      homeroomAllowance: 0,
      masterTeacherBonus: teacher.title === "高级教师" ? 500 : 0,
      approvedOvertimeHours: 0,
    },
  };
}

function upsertTeacher(teacher) {
  if (!teacher) return;
  const normalized = normalizeBackendTeacher(teacher);
  const index = state.teachers.findIndex((item) => item.id === normalized.id);
  if (index >= 0) {
    state.teachers[index] = {
      ...state.teachers[index],
      ...normalized,
    };
  } else {
    state.teachers.push(normalized);
  }
}

function upsertBackendAccount(account) {
  const teacher = account.teacher || null;
  upsertTeacher(teacher);
  const accountId = `backend-${account.id}`;
  const nextAccount = {
    id: accountId,
    role: account.role,
    name: account.name,
    title: roleTitle(account.role),
    teacherId: account.teacherId || teacher?.id || null,
    department: account.department || teacher?.department || "",
    deviceId: "backend-web",
    source: "backend",
  };
  const index = state.accounts.findIndex((item) => item.id === accountId);
  if (index >= 0) {
    state.accounts[index] = {
      ...state.accounts[index],
      ...nextAccount,
    };
  } else {
    state.accounts.push(nextAccount);
  }
  return accountId;
}

function normalizeBackendLesson(lesson) {
  return {
    id: `API-${lesson.id}`,
    teacherId: lesson.teacherId,
    date: lesson.date,
    time: lesson.time,
    className: lesson.className,
    course: lesson.subjectName,
    room: lesson.roomId,
    type: lesson.type || "regular",
    units: lesson.units || 1,
    status: lesson.status,
    scanTime: lesson.checkInAt ? lesson.checkInAt.slice(11, 16) : "",
    checkInTime: lesson.checkInAt ? lesson.checkInAt.slice(11, 16) : "",
    checkOutTime: lesson.checkOutAt ? lesson.checkOutAt.slice(11, 16) : "",
    note: lesson.status === "completed" ? "后端接口：签入签出完成" : "后端接口：等待后续签入签出",
    source: "backend-api",
  };
}

function mergeBackendLessons(teacherId, lessons) {
  state.lessons = state.lessons.filter(
    (lesson) => !(lesson.source === "backend-api" && lesson.teacherId === teacherId),
  );
  state.lessons = state.lessons.concat(lessons.map(normalizeBackendLesson));
}

function backendMode() {
  return Boolean(backendSession?.token && apiEnabled());
}

function currentAccount() {
  return state.accounts.find((account) => account.id === state.currentAccountId) || state.accounts[0];
}

function currentRole() {
  return currentAccount().role;
}

function currentTeacherId() {
  const account = currentAccount();
  return account.role === "teacher" ? account.teacherId : state.selectedFinanceTeacherId;
}

function teacherById(teacherId) {
  return state.teachers.find((teacher) => teacher.id === teacherId);
}

function teacherLessons(teacherId) {
  return state.lessons.filter((lesson) => lesson.teacherId === teacherId);
}

function teacherName(teacherId) {
  return teacherById(teacherId)?.name || "未知老师";
}

function roleMatches(allowedRole, role) {
  if (allowedRole === "all") return true;
  return String(allowedRole)
    .split(",")
    .map((item) => item.trim())
    .includes(role);
}

function viewAllowed(viewName) {
  const view = views[viewName];
  const role = currentRole();
  return Boolean(view && roleMatches(view.role, role));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date) {
  const [, month, day] = date.split("-");
  return `${Number(month)}月${Number(day)}日`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfNaturalWeek(dateKey) {
  const date = parseDateKey(dateKey);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return formatDateKey(addDays(date, offset));
}

function weekDateKeys(weekStartKey) {
  const weekStart = parseDateKey(weekStartKey);
  return Array.from({ length: 7 }, (_, index) => formatDateKey(addDays(weekStart, index)));
}

function formatWeekRange(weekStartKey) {
  const dates = weekDateKeys(weekStartKey);
  return `${formatDate(dates[0])} - ${formatDate(dates[6])}`;
}

function roleNotices(role = currentRole()) {
  return (state.notices || [])
    .filter((notice) => notice.audience === role || notice.audience === "all")
    .sort((a, b) => b.time.localeCompare(a.time));
}

function schedulingDivisionOptions(selectedId) {
  return schedulingCatalog.divisions
    .map(
      (division) => `
        <option value="${division.id}" ${division.id === selectedId ? "selected" : ""}>
          ${division.name}
        </option>
      `,
    )
    .join("");
}

function schedulingGradeOptions(divisionId, selectedId) {
  const division =
    schedulingCatalog.divisions.find((item) => item.id === divisionId) ||
    schedulingCatalog.divisions[0];
  return division.grades
    .map(
      (grade) => `
        <option value="${grade.id}" ${grade.id === selectedId ? "selected" : ""}>
          ${grade.name}
        </option>
      `,
    )
    .join("");
}

function schedulingDraftMatchesCurrent() {
  return (
    state.schedulingDraft.divisionId === state.schedulingConfig.divisionId &&
    state.schedulingDraft.gradeId === state.schedulingConfig.gradeId
  );
}

function resetSchedulingDraftForSelection() {
  state.schedulingDraft = {
    ...clone(initialState.schedulingDraft),
    divisionId: state.schedulingConfig.divisionId,
    gradeId: state.schedulingConfig.gradeId,
  };
}

function applySchedulingSelection(divisionId, gradeId = "") {
  const nextConfig = buildSchedulingConfig(divisionId, gradeId);
  state.selectedSchedulingDivisionId = nextConfig.divisionId;
  state.selectedSchedulingGradeId = nextConfig.gradeId;
  state.selectedSchedulingClassId = nextConfig.classes[0]?.id || "";
  state.schedulingConfig = nextConfig;
  resetSchedulingDraftForSelection();
}

function schedulingTeacherName(teacherId) {
  return (
    state.schedulingConfig.teachers.find((teacher) => teacher.id === teacherId)?.name ||
    teacherName(teacherId)
  );
}

function schedulingSlots() {
  const weekDates = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5);
  return weekDates.flatMap((date, dayIndex) =>
    state.schedulingConfig.periods.map((period) => ({
      ...period,
      date,
      dayIndex,
      slotKey: `${date}-${period.period}`,
    })),
  );
}

function requiredScheduleLessonCount() {
  const weeklyPerClass = state.schedulingConfig.subjects.reduce(
    (sum, subject) => sum + subject.weeklyLessons,
    0,
  );
  return state.schedulingConfig.classes.length * weeklyPerClass;
}

function scheduleStatusText(status = state.schedulingDraft.status) {
  if (status === "draft") return "待确认";
  if (status === "published") return "已发布";
  return "未生成";
}

function buildClassSubjectQueue(classIndex) {
  const counters = new Map(
    state.schedulingConfig.subjects.map((subject) => [subject.id, subject.weeklyLessons]),
  );
  const queue = [];
  let round = 0;
  while (queue.length < state.schedulingConfig.subjects.reduce((sum, subject) => sum + subject.weeklyLessons, 0)) {
    state.schedulingConfig.subjects.forEach((subject, subjectIndex) => {
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

function generateScheduleAssignments() {
  const config = state.schedulingConfig;
  const slots = schedulingSlots();
  const assignments = [];
  const teacherBusy = new Map();
  const classBusy = new Map();
  const teacherLoad = new Map(config.teachers.map((teacher) => [teacher.id, 0]));

  config.classes.forEach((schoolClass, classIndex) => {
    classBusy.set(schoolClass.id, new Set());
    const subjectQueue = buildClassSubjectQueue(classIndex);

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

      const teacherNameText = schedulingTeacherName(best.teacherId);
      const assignment = {
        id: `SCH-${schoolClass.id}-${subject.id}-${lessonIndex + 1}`,
        classId: schoolClass.id,
        className: schoolClass.name,
        subjectId: subject.id,
        subjectName: subject.name,
        teacherId: best.teacherId,
        teacherName: teacherNameText,
        date: best.slot.date,
        dayIndex: best.slot.dayIndex,
        period: best.slot.period,
        time: best.slot.time,
        room: schoolClass.room,
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

function validateScheduleConflicts(assignments) {
  const conflicts = [];
  const teacherSlots = new Map();
  const classSlots = new Map();

  assignments.forEach((assignment) => {
    const teacherKey = `${assignment.teacherId}-${assignment.date}-${assignment.period}`;
    if (!teacherSlots.has(teacherKey)) teacherSlots.set(teacherKey, []);
    teacherSlots.get(teacherKey).push(assignment);

    const classKey = `${assignment.classId}-${assignment.date}-${assignment.period}`;
    if (!classSlots.has(classKey)) classSlots.set(classKey, []);
    classSlots.get(classKey).push(assignment);
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

  return conflicts;
}

function formatDateTimeMinute(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function todayKey() {
  return "2026-06-09";
}

function payableLessons(teacherId) {
  return teacherLessons(teacherId).filter((lesson) => lesson.status === "completed");
}

function countUnits(teacherId, type) {
  return payableLessons(teacherId)
    .filter((lesson) => lesson.type === type)
    .reduce((sum, lesson) => sum + lesson.units, 0);
}

function calculateSalary(teacherId) {
  const teacher = teacherById(teacherId);
  const profile = teacher?.salaryProfile || {};
  const rules = state.rules;
  const regularUnits = countUnits(teacherId, "regular");
  const morningUnits = countUnits(teacherId, "morning");
  const eveningUnits = countUnits(teacherId, "evening");
  const weekendUnits = countUnits(teacherId, "weekend");
  const selfStudyUnits = morningUnits + eveningUnits;
  const regularAllowance = regularUnits * rules.regularLessonRate;
  const selfStudyAllowance = selfStudyUnits * rules.selfStudyRate;
  const weekendAllowance = weekendUnits * rules.weekendRate;
  const overtimeAllowance = (profile.approvedOvertimeHours || 0) * rules.overtimeRate;
  const gross =
    (profile.baseSalary || 0) +
    (profile.positionSalary || 0) +
    regularAllowance +
    selfStudyAllowance +
    weekendAllowance +
    (profile.homeroomAllowance || 0) +
    (profile.famousTeacherReward || 0) +
    overtimeAllowance;
  const attendanceDeduction = profile.attendanceDeduction || 0;
  const socialInsurance = profile.socialInsurance || 0;
  const taxable = Math.max(0, gross - socialInsurance - attendanceDeduction - rules.taxThreshold);
  const tax = Math.round(taxable * rules.taxRate);
  const net = gross - attendanceDeduction - socialInsurance - tax;

  return {
    teacher,
    profile,
    regularUnits,
    selfStudyUnits,
    weekendUnits,
    regularAllowance,
    selfStudyAllowance,
    weekendAllowance,
    overtimeAllowance,
    attendanceDeduction,
    socialInsurance,
    gross,
    tax,
    net,
  };
}

function salaryRows(teacherId) {
  const salary = calculateSalary(teacherId);
  const rules = state.rules;
  const profile = salary.profile;
  const teacher = salary.teacher;
  return [
    ["基本工资", "固定项", profile.baseSalary || 0],
    ["岗位工资", teacher?.position || "任课教师", profile.positionSalary || 0],
    ["课时津贴", `${salary.regularUnits} 节 × ${rules.regularLessonRate} 元`, salary.regularAllowance],
    ["早晚自习补贴", `${salary.selfStudyUnits} 节 × ${rules.selfStudyRate} 元`, salary.selfStudyAllowance],
    ["周末补课补贴", `${salary.weekendUnits} 节 × ${rules.weekendRate} 元`, salary.weekendAllowance],
    ["班主任津贴", "月度固定津贴", profile.homeroomAllowance || 0],
    ["名师奖励", "月度奖励项", profile.famousTeacherReward || 0],
    ["合规加班", `${profile.approvedOvertimeHours || 0} 小时 × ${rules.overtimeRate} 元`, salary.overtimeAllowance],
    ["考勤扣款", "演示扣款项", -salary.attendanceDeduction],
    ["社保代扣", "演示固定值", -salary.socialInsurance],
    ["个税代扣", `起征点 ${rules.taxThreshold} 元，演示税率 3%`, -salary.tax],
  ];
}

function teacherLessonStats(teacherId) {
  const lessons = teacherLessons(teacherId);
  return {
    completedUnits: payableLessons(teacherId).reduce((sum, lesson) => sum + lesson.units, 0),
    pendingCount: lessons.filter((lesson) => lesson.status === "pending" || lesson.status === "checkedIn").length,
    exceptionCount: lessons.filter((lesson) => lesson.status === "exception").length,
  };
}

function financeSalaryTotals() {
  return state.teachers.reduce(
    (totals, teacher) => {
      const salary = calculateSalary(teacher.id);
      totals.gross += salary.gross;
      totals.net += salary.net;
      return totals;
    },
    { gross: 0, net: 0 },
  );
}

function financeGroupKey(teacher) {
  if (state.financeGroupBy === "subject") return teacher.subject;
  if (state.financeGroupBy === "grade") return teacher.grade || "未设置年级";
  return teacher.department;
}

function financeGroupRows() {
  const groups = new Map();
  state.teachers.forEach((teacher) => {
    const key = financeGroupKey(teacher);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        teacherCount: 0,
        completedUnits: 0,
        pendingCount: 0,
        exceptionCount: 0,
        gross: 0,
        net: 0,
      });
    }
    const group = groups.get(key);
    const salary = calculateSalary(teacher.id);
    const stats = teacherLessonStats(teacher.id);
    group.teacherCount += 1;
    group.completedUnits += stats.completedUnits;
    group.pendingCount += stats.pendingCount;
    group.exceptionCount += stats.exceptionCount;
    group.gross += salary.gross;
    group.net += salary.net;
  });
  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key, "zh-CN"));
}

function backendTeacherSubject(teacher) {
  return teacher.primarySubjectName || teacher.subject || "未设置学科";
}

function backendTeacherDepartment(teacher) {
  return teacher.department || teacher.stageName || "未设置学部";
}

function backendFinanceGroupKey(teacher) {
  if (state.financeGroupBy === "subject") return backendTeacherSubject(teacher);
  if (state.financeGroupBy === "grade") return teacher.stageName || teacher.grade || "未设置年级";
  return backendTeacherDepartment(teacher);
}

function backendFinanceGroupRows() {
  const groups = new Map();
  financeTeacherPage.items.forEach((teacher) => {
    const key = backendFinanceGroupKey(teacher);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        teacherCount: 0,
        completedUnits: 0,
        pendingCount: 0,
        exceptionCount: 0,
        gross: 0,
        net: 0,
      });
    }
    const group = groups.get(key);
    group.teacherCount += 1;
    group.completedUnits += teacher.summary?.completedUnits || 0;
    group.pendingCount += teacher.summary?.pendingCount || 0;
    group.exceptionCount += teacher.summary?.exceptionCount || 0;
    group.gross += teacher.payroll?.grossPay || 0;
    group.net += teacher.payroll?.netPay || 0;
  });
  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key, "zh-CN"));
}

function financePageTotals() {
  return financeTeacherPage.items.reduce(
    (totals, teacher) => {
      totals.pending += teacher.summary?.pendingCount || 0;
      totals.exception += teacher.summary?.exceptionCount || 0;
      totals.gross += teacher.payroll?.grossPay || 0;
      totals.net += teacher.payroll?.netPay || 0;
      return totals;
    },
    { pending: 0, exception: 0, gross: 0, net: 0 },
  );
}

async function loadBackendTeacherContext(teacherId, weekStart = state.selectedScheduleWeekStart || "2026-06-15") {
  if (!backendMode() || !teacherId) return;
  try {
    state.selectedScheduleWeekStart = weekStart;
    const schedule = await apiRequest(`/api/teachers/${teacherId}/schedule?weekStart=${weekStart}`);
    if (schedule.teacher) upsertTeacher(schedule.teacher);
    mergeBackendLessons(teacherId, schedule.lessons || []);
  } catch (error) {
    showToast(error.message || "老师课表加载失败");
  }
}

async function loadFinanceTeacherPage(overrides = {}) {
  if (!backendMode()) return;
  financeTeacherPage = {
    ...financeTeacherPage,
    ...overrides,
    loading: true,
    error: "",
  };
  const params = new URLSearchParams({
    page: String(financeTeacherPage.page),
    pageSize: String(financeTeacherPage.pageSize),
    month: "2026-06",
  });
  if (financeTeacherPage.search) params.set("search", financeTeacherPage.search);

  try {
    const result = await apiRequest(`/api/teachers?${params.toString()}`);
    financeTeacherPage = {
      ...financeTeacherPage,
      items: result.items || [],
      meta: result.meta || financeTeacherPage.meta,
      page: result.meta?.page || financeTeacherPage.page,
      pageSize: result.meta?.pageSize || financeTeacherPage.pageSize,
      loaded: true,
      loading: false,
      error: "",
    };
    financeTeacherPage.items.forEach(upsertTeacher);
    if (!financeTeacherPage.items.some((teacher) => teacher.id === state.selectedFinanceTeacherId)) {
      state.selectedFinanceTeacherId = financeTeacherPage.items[0]?.id || state.selectedFinanceTeacherId;
    }
  } catch (error) {
    financeTeacherPage = {
      ...financeTeacherPage,
      loaded: true,
      loading: false,
      error: error.message || "教师列表加载失败",
    };
  }

  if (["finance", "financeRecords", "settlement"].includes(state.activeView)) {
    render();
  }
}

function backendSchedulingOptions() {
  return {
    divisionId: state.selectedSchedulingDivisionId,
    gradeId: state.selectedSchedulingGradeId,
  };
}

function applyBackendScheduleResult(result) {
  if (result.config) {
    state.schedulingConfig = result.config;
    state.selectedSchedulingDivisionId = result.config.divisionId;
    state.selectedSchedulingGradeId = result.config.gradeId;
    state.selectedScheduleWeekStart = result.config.weekStart;
    if (!result.config.classes.some((schoolClass) => schoolClass.id === state.selectedSchedulingClassId)) {
      state.selectedSchedulingClassId = result.config.classes[0]?.id || "";
    }
  }

  if (result.draft) {
    state.schedulingDraft = result.draft;
  } else if (result.config) {
    state.schedulingDraft = {
      ...clone(initialState.schedulingDraft),
      divisionId: result.config.divisionId,
      gradeId: result.config.gradeId,
    };
  }
}

async function loadBackendSchedulingContext(options = backendSchedulingOptions()) {
  if (!backendMode() || currentRole() !== "admin") return;
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };

  try {
    const params = new URLSearchParams(options);
    const result = await apiRequest(`/api/scheduling/config?${params.toString()}`);
    applyBackendScheduleResult(result);
    schedulingBackendState = {
      loaded: true,
      loading: false,
      error: "",
    };
  } catch (error) {
    schedulingBackendState = {
      loaded: true,
      loading: false,
      error: error.message || "后端排课配置加载失败",
    };
    showToast(schedulingBackendState.error);
  }

  if (state.activeView === "adminScheduling") {
    render();
  }
}

async function generateBackendSchedule() {
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();

  try {
    const result = await apiRequest("/api/scheduling/generate", {
      method: "POST",
      body: backendSchedulingOptions(),
    });
    applyBackendScheduleResult(result);
    schedulingBackendState = { loaded: true, loading: false, error: "" };
    const conflicts = result.draft?.conflicts?.length || 0;
    showToast(
      conflicts
        ? `后端已生成草稿，发现 ${conflicts} 个冲突`
        : `后端已生成 ${result.draft?.generatedLessonCount || 0} 节无冲突课表`,
    );
  } catch (error) {
    schedulingBackendState = {
      loaded: true,
      loading: false,
      error: error.message || "后端生成排课失败",
    };
    showToast(schedulingBackendState.error);
  }

  render();
}

async function publishBackendSchedule() {
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();

  try {
    const result = await apiRequest("/api/scheduling/publish", {
      method: "POST",
      body: backendSchedulingOptions(),
    });
    applyBackendScheduleResult(result);
    schedulingBackendState = { loaded: true, loading: false, error: "" };
    showToast(`后端已发布 ${result.lessons?.length || 0} 节课到老师端`);
  } catch (error) {
    schedulingBackendState = {
      loaded: true,
      loading: false,
      error: error.message || "后端发布课表失败",
    };
    showToast(schedulingBackendState.error);
  }

  render();
}

function syncTeacherImportText() {
  const textarea = document.querySelector("#teacherImportCsv");
  if (!textarea) return;
  teacherImportState.csvText = textarea.value;
}

function resetTeacherImportPreviewForEdit() {
  teacherImportState.preview = null;
  teacherImportState.previewCsvText = "";
  teacherImportState.imported = null;
  teacherImportState.committedCsvText = "";
  teacherImportState.error = "";
}

async function previewTeacherImportCsv() {
  syncTeacherImportText();
  const csvText = teacherImportState.csvText;
  if (!backendMode() || currentRole() !== "admin") {
    showToast("请通过后端服务登录行政账号后再导入");
    return;
  }
  if (!csvText.trim()) {
    showToast("请先粘贴教师 CSV");
    return;
  }

  teacherImportState = {
    ...teacherImportState,
    loading: true,
    error: "",
    imported: null,
    committedCsvText: "",
  };
  renderTeacherImport();

  try {
    const preview = await apiRequest("/api/teachers/import/preview", {
      method: "POST",
      body: { csvText },
    });
    teacherImportState = {
      ...teacherImportState,
      preview,
      previewCsvText: csvText,
      loading: false,
      error: "",
    };
    showToast(preview.canImport ? `校验通过：${preview.validRows} 行可导入` : `发现 ${preview.errors.length} 条错误`);
  } catch (error) {
    teacherImportState = {
      ...teacherImportState,
      preview: error.details?.rows ? error.details : null,
      previewCsvText: error.details?.rows ? csvText : "",
      loading: false,
      error: error.message || "导入预览失败",
    };
    showToast(teacherImportState.error);
  }

  renderTeacherImport();
}

async function commitTeacherImportCsv() {
  syncTeacherImportText();
  const csvText = teacherImportState.csvText;
  if (!teacherImportState.preview?.canImport || teacherImportState.previewCsvText !== csvText) {
    showToast("请先完成当前 CSV 的预览校验");
    return;
  }

  teacherImportState = {
    ...teacherImportState,
    loading: true,
    error: "",
  };
  renderTeacherImport();

  try {
    const result = await apiRequest("/api/teachers/import/commit", {
      method: "POST",
      body: { csvText },
    });
    teacherImportState = {
      ...teacherImportState,
      preview: result.preview || teacherImportState.preview,
      previewCsvText: csvText,
      imported: result,
      committedCsvText: csvText,
      loading: false,
      error: "",
    };
    financeTeacherPage.loaded = false;
    showToast(`已导入 ${result.importedCount} 位老师账号`);
  } catch (error) {
    teacherImportState = {
      ...teacherImportState,
      preview: error.details?.rows ? error.details : teacherImportState.preview,
      previewCsvText: error.details?.rows ? csvText : teacherImportState.previewCsvText,
      loading: false,
      error: error.message || "确认导入失败",
    };
    showToast(teacherImportState.error);
  }

  renderTeacherImport();
}

function buildWarnings(teacherId = null) {
  const lessons = teacherId ? teacherLessons(teacherId) : state.lessons;
  const warnings = [];

  lessons
    .filter((lesson) => lesson.status === "exception")
    .forEach((lesson) => {
      warnings.push({
        level: "高",
        teacherId: lesson.teacherId,
        title: `${teacherName(lesson.teacherId)} · ${formatDate(lesson.date)} ${lesson.course}异常`,
        text: `${lesson.className} ${lesson.time} ${lesson.room}：${lesson.note}。复核前不进入薪资核算。`,
      });
    });

  const pendingByTeacher = lessons
    .filter((lesson) => lesson.status === "pending" || lesson.status === "checkedIn")
    .reduce((map, lesson) => {
      map.set(lesson.teacherId, (map.get(lesson.teacherId) || 0) + 1);
      return map;
    }, new Map());

  pendingByTeacher.forEach((count, pendingTeacherId) => {
    warnings.push({
      level: "中",
      teacherId: pendingTeacherId,
      title: `${teacherName(pendingTeacherId)} 有 ${count} 节课未完成考勤`,
      text: "未完成签入和签出的项目当前不会计入课时津贴，财务结算时会自动剔除。",
    });
  });

  return warnings;
}

function confirmationText(teacherId) {
  const stage = state.confirmationStages[teacherId] || 0;
  if (stage === 0) return "老师待确认";
  if (stage === 1) return "老师已确认";
  if (stage === 2) return "教务已审批";
  return "总校已审批";
}

function settlementText(teacherId) {
  const settlement = state.settlements[teacherId];
  return settlement?.status === "settled" ? "已结算" : "未结算";
}

function settlementTag(teacherId) {
  const settlement = state.settlements[teacherId];
  if (settlement?.status === "settled") {
    return `<span class="tag locked">已结算</span>`;
  }
  return `<span class="tag pending">未结算</span>`;
}

function render() {
  renderAuth();
  if (!sessionAccountId) return;

  if (!viewAllowed(state.activeView)) {
    state.activeView = defaultViewByRole[currentRole()];
  }

  renderShell();
  renderNotices();
  renderNotificationCenter();
  renderDashboard();
  renderTasks();
  renderSchedule();
  renderAdminScheduling();
  renderTeacherImport();
  renderScanner();
  renderRecords();
  renderConfirmation();
  renderFinanceDashboard();
  renderFinanceRecords();
  renderSettlement();
  renderWarnings();
  saveState();
}

function renderAuth() {
  const loggedIn = Boolean(sessionAccountId);
  document.querySelector("#loginScreen").classList.toggle("is-hidden", loggedIn);
  document.querySelector("#appShell").classList.toggle("is-hidden", !loggedIn);
}

function renderShell() {
  const account = currentAccount();
  const role = account.role;
  const teacher = role === "teacher" ? teacherById(account.teacherId) : null;

  document.querySelector("#viewTitle").textContent = views[state.activeView].title;
  document.querySelector("#accountRoleSide").textContent = account.title;
  document.querySelector("#teacherNameSide").textContent = account.name;
  document.querySelector("#teacherMetaSide").textContent =
    role === "teacher"
      ? `${teacher.department} · ${teacher.subject}`
      : role === "finance"
        ? `${account.department} · 薪资结算`
        : `${account.department} · 排课管理`;
  document.querySelector("#accountSummaryTitle").textContent = account.title;
  document.querySelector("#accountSummaryMeta").textContent =
    role === "teacher"
      ? `${account.name} · ${teacher.department} · ${teacher.subject}`
      : `${account.name} · ${account.department}`;

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.remove("is-active");
  });
  views[state.activeView].el.classList.add("is-active");

  document.querySelectorAll(".nav-item").forEach((button) => {
    const navRole = button.dataset.role;
    const allowed = roleMatches(navRole, role);
    button.classList.toggle("is-hidden", !allowed);
    button.classList.toggle("active", allowed && button.dataset.view === state.activeView);
  });

  document.querySelectorAll("[data-role-action]").forEach((button) => {
    button.classList.toggle("is-hidden", button.dataset.roleAction !== role);
  });

  const noticeBar = document.querySelector("#noticeBar");
  if (noticeBar) {
    noticeBar.classList.toggle("is-hidden", !["dashboard", "finance"].includes(state.activeView));
  }
}

function renderNotices() {
  const list = document.querySelector("#noticeList");
  const count = document.querySelector("#noticeCount");
  const title = document.querySelector("#noticeTitle");
  if (!list || !count || !title) return;

  const role = currentRole();
  const notices = roleNotices(role);
  title.textContent = role === "teacher" ? "老师通知栏" : "财务通知栏";
  count.textContent = `${notices.length} 条`;
  list.innerHTML = notices.length
    ? notices
        .map(
          (notice) => `
            <article class="notice-item ${notice.level === "warning" ? "warning" : ""}">
              <div>
                <strong>${notice.title}</strong>
                <span>${notice.source} · ${notice.time}</span>
              </div>
              <button class="mini-button" data-notice-open="${notice.id}" type="button">查看详情</button>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">暂无通知</div>`;
}

function renderNotificationCenter() {
  const list = document.querySelector("#notificationMailList");
  const count = document.querySelector("#notificationCenterCount");
  const title = document.querySelector("#notificationsTitle");
  if (!list || !count || !title) return;

  const role = currentRole();
  const notices = roleNotices(role);
  const candidateId = state.selectedNoticeId || notices[0]?.id || "";
  const selectedId = notices.some((notice) => notice.id === candidateId) ? candidateId : notices[0]?.id || "";
  title.textContent = role === "teacher" ? "老师通知中心" : "财务通知中心";
  count.textContent = `${notices.length} 条`;
  list.innerHTML = notices.length
    ? notices
        .map(
          (notice) => `
            <article class="mail-notice ${notice.id === selectedId ? "selected" : ""}">
              <div class="mail-notice-meta">
                <span class="tag ${notice.level === "warning" ? "pending" : "locked"}">${notice.level === "warning" ? "重要" : "通知"}</span>
                <span>${notice.source}</span>
                <time>${notice.time}</time>
              </div>
              <div class="mail-notice-body">
                <strong>${notice.title}</strong>
                <p>${notice.text}</p>
              </div>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">暂无通知</div>`;
}

function renderDashboard() {
  const teacherId = currentRole() === "teacher" ? currentTeacherId() : state.teachers[0].id;
  const salary = calculateSalary(teacherId);
  const lessons = teacherLessons(teacherId);
  const completedUnits = payableLessons(teacherId).reduce((sum, lesson) => sum + lesson.units, 0);
  const plannedUnits = lessons
    .filter((lesson) => lesson.status !== "exception")
    .reduce((sum, lesson) => sum + lesson.units, 0);
  const pendingLessons = lessons.filter((lesson) => lesson.status === "pending" || lesson.status === "checkedIn");
  const warnings = buildWarnings(teacherId);
  const nextLesson = pendingLessons[0];

  document.querySelector("#plannedLessons").textContent = plannedUnits;
  document.querySelector("#completedLessons").textContent = completedUnits;
  document.querySelector("#pendingLessons").textContent = pendingLessons.length;
  document.querySelector("#warningCount").textContent = warnings.length;
  document.querySelector("#grossPreview").textContent = formatCurrency(salary.gross);
  document.querySelector("#netPreview").textContent = formatCurrency(salary.net);
  document.querySelector("#confirmStatusText").textContent = confirmationText(teacherId);
  document.querySelector("#confirmProgressBar").style.width = `${25 + (state.confirmationStages[teacherId] || 0) * 25}%`;

  const nextStatus = document.querySelector("#nextLessonStatus");
  const detail = document.querySelector("#nextLessonDetail");
  const scanButton = document.querySelector("#scanNextLesson");
  const quickScanButton = document.querySelector("#quickScan");

  if (!nextLesson) {
    nextStatus.textContent = "今日完成";
    nextStatus.className = "status-pill done";
    detail.innerHTML = `
      <strong>暂无待处理课时</strong>
      <p class="muted">当前已完成课时已同步到薪资试算，月末可进入确认流程。</p>
    `;
    scanButton.disabled = true;
    quickScanButton.disabled = true;
  } else {
    nextStatus.textContent = statusLabel[nextLesson.status];
    nextStatus.className = nextLesson.status === "checkedIn" ? "status-pill locked" : "status-pill";
    detail.innerHTML = `
      <strong>${nextLesson.className} · ${nextLesson.course}</strong>
      <div class="detail-grid">
        <div class="detail-cell"><span>上课时间</span>${formatDate(nextLesson.date)} ${nextLesson.time}</div>
        <div class="detail-cell"><span>教室</span>${nextLesson.room}</div>
        <div class="detail-cell"><span>课时类型</span>${lessonTypeLabel[nextLesson.type]}</div>
        <div class="detail-cell"><span>计薪口径</span>${allowanceText(nextLesson)}</div>
      </div>
    `;
    scanButton.disabled = false;
    quickScanButton.disabled = false;
    scanButton.dataset.id = nextLesson.id;
    quickScanButton.dataset.id = nextLesson.id;
    scanButton.dataset.attendanceAction = actionForLesson(nextLesson);
    quickScanButton.dataset.attendanceAction = actionForLesson(nextLesson);
    scanButton.innerHTML = `<span aria-hidden="true">✓</span>${actionLabel(actionForLesson(nextLesson))}`;
  }

  const todayLessons = lessons.filter((lesson) => lesson.date === todayKey());
  document.querySelector("#todayTasksTable").innerHTML = todayLessons.length
    ? todayLessons.map(taskRow).join("")
    : `<tr><td colspan="7"><div class="empty-state">今天没有课时任务</div></td></tr>`;
}

function renderTasks() {
  const lessons = teacherLessons(currentTeacherId()).filter((lesson) => {
    if (state.taskFilter === "all") return true;
    return lesson.status === state.taskFilter;
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.taskFilter);
  });

  document.querySelector("#taskTable").innerHTML = lessons.length
    ? lessons.map(fullTaskRow).join("")
    : `<tr><td colspan="9"><div class="empty-state">当前筛选条件下没有课时任务</div></td></tr>`;
}

function availableScheduleWeeks(lessons) {
  const weeks = Array.from(new Set(lessons.map((lesson) => startOfNaturalWeek(lesson.date)))).sort();
  const currentWeek = startOfNaturalWeek(todayKey());
  if (!weeks.includes(currentWeek)) weeks.unshift(currentWeek);
  return weeks;
}

function renderSchedule() {
  const summary = document.querySelector("#scheduleSummary");
  const grid = document.querySelector("#scheduleWeekGrid");
  const select = document.querySelector("#scheduleWeekSelect");
  const title = document.querySelector("#scheduleWeekTitle");
  const range = document.querySelector("#scheduleWeekRange");
  if (!summary || !grid || !select || !title || !range) return;

  const lessons = teacherLessons(currentTeacherId()).sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
  const weeks = availableScheduleWeeks(lessons);
  if (!weeks.includes(state.selectedScheduleWeekStart)) {
    state.selectedScheduleWeekStart = weeks[0] || startOfNaturalWeek(todayKey());
  }
  const selectedWeek = state.selectedScheduleWeekStart;
  const weekDates = weekDateKeys(selectedWeek);
  const weekLessons = lessons.filter((lesson) => weekDates.includes(lesson.date));
  const pendingCount = weekLessons.filter((lesson) => lesson.status === "pending" || lesson.status === "checkedIn").length;
  const completedCount = weekLessons.filter((lesson) => lesson.status === "completed").length;
  const scheduledCount = weekLessons.filter((lesson) => lesson.status === "scheduled").length;
  const exceptionCount = weekLessons.filter((lesson) => lesson.status === "exception").length;

  select.innerHTML = weeks
    .map((week) => {
      const count = lessons.filter((lesson) => weekDateKeys(week).includes(lesson.date)).length;
      return `
        <option value="${week}" ${week === selectedWeek ? "selected" : ""}>
          ${formatWeekRange(week)} · ${count} 节
        </option>
      `;
    })
    .join("");
  title.textContent = `${formatWeekRange(selectedWeek)} 自然周`;
  range.textContent = "按周一到周日展示排班";

  summary.innerHTML = [
    ["本周课程", `${weekLessons.length} 节`, "当前自然周"],
    ["已完成", `${completedCount} 节`, "签入签出完成"],
    ["待处理", `${pendingCount} 节`, "需签入或签出"],
    ["未到时间", `${scheduledCount} 节`, "之后排班"],
    ["异常", `${exceptionCount} 条`, "待复核"],
  ]
    .map(
      ([label, value, desc]) => `
        <article class="schedule-stat">
          <span>${label}</span>
          <strong>${value}</strong>
          <small>${desc}</small>
        </article>
      `,
    )
    .join("");

  const grouped = weekDates.reduce((map, date) => {
    map.set(date, []);
    return map;
  }, new Map());
  weekLessons.forEach((lesson) => {
    grouped.get(lesson.date).push(lesson);
  });

  const dayNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  grid.innerHTML = weekDates
    .map(
      (date, index) => {
        const dayLessons = grouped.get(date);
        return `
        <article class="schedule-column ${date === todayKey() ? "today" : ""}">
          <header>
            <span>${dayNames[index]}</span>
            <strong>${formatDate(date)}</strong>
            <small>${dayLessons.length ? `${dayLessons.length} 节课` : "无排班"}</small>
          </header>
          <div class="schedule-items">
            ${dayLessons.length ? dayLessons.map(scheduleLessonItem).join("") : `<div class="schedule-empty">暂无课程</div>`}
          </div>
        </article>
      `;
      },
    )
    .join("");
}

function renderAdminScheduling() {
  const container = document.querySelector("#adminSchedulingView");
  if (!container) return;

  const config = state.schedulingConfig;
  const draft = schedulingDraftMatchesCurrent()
    ? state.schedulingDraft
    : {
        ...clone(initialState.schedulingDraft),
        divisionId: config.divisionId,
        gradeId: config.gradeId,
      };
  const assignments = draft.assignments || [];
  const conflicts = validateScheduleConflicts(assignments);
  draft.conflicts = conflicts;
  const selectedClassId =
    config.classes.some((schoolClass) => schoolClass.id === state.selectedSchedulingClassId)
      ? state.selectedSchedulingClassId
      : config.classes[0]?.id || "";
  state.selectedSchedulingClassId = selectedClassId;
  const selectedClassAssignments = assignments
    .filter((assignment) => assignment.classId === selectedClassId)
    .sort((a, b) => `${a.date} ${a.period}`.localeCompare(`${b.date} ${b.period}`));

  document.querySelector("#adminDivisionName").textContent = config.divisionName;
  document.querySelector("#adminGradeName").textContent = config.gradeName;
  document.querySelector("#adminClassCount").textContent = `${config.classCount} 个班`;
  document.querySelector("#adminRequiredLessons").textContent = requiredScheduleLessonCount();
  document.querySelector("#adminConflictCount").textContent = conflicts.length;
  document.querySelector("#adminPublishStatus").textContent = scheduleStatusText(draft.status);
  document.querySelector("#adminPublishTime").textContent =
    draft.status === "published"
      ? draft.publishedAt
      : draft.status === "draft"
        ? draft.generatedAt
        : "等待生成";
  document.querySelector("#adminScheduleStatus").textContent = scheduleStatusText(draft.status);
  document.querySelector("#adminScheduleStatus").className =
    draft.status === "published"
      ? "status-pill done"
      : draft.status === "draft"
        ? "status-pill warning"
        : "status-pill";
  if (backendMode() && currentRole() === "admin") {
    const status = document.querySelector("#adminScheduleStatus");
    if (schedulingBackendState.loading) {
      status.textContent = "后端处理中";
      status.className = "status-pill warning";
    } else if (schedulingBackendState.error) {
      status.textContent = "后端异常";
      status.className = "status-pill warning";
    } else if (schedulingBackendState.loaded) {
      status.textContent = `${scheduleStatusText(draft.status)} · 后端`;
    }
  }
  document.querySelector("#conflictStatus").textContent =
    assignments.length === 0 ? "等待生成" : conflicts.length === 0 ? "无冲突" : `${conflicts.length} 个冲突`;
  document.querySelector("#conflictStatus").className =
    assignments.length === 0 ? "status-pill" : conflicts.length === 0 ? "status-pill done" : "status-pill warning";

  document.querySelector("#adminDivisionSelect").innerHTML = schedulingDivisionOptions(config.divisionId);
  document.querySelector("#adminGradeSelect").innerHTML = schedulingGradeOptions(config.divisionId, config.gradeId);
  document.querySelector("#adminSchedulingTitle").textContent = `${config.divisionName}${config.gradeName}自动排课`;
  document.querySelector("#adminSchedulingIntro").textContent =
    `当前为${config.divisionName}${config.gradeName}，共 ${config.classCount} 个班，按自然周 ${formatWeekRange(config.weekStart)} 生成课表。`;
  document.querySelector("#adminScopeText").textContent =
    `${config.divisionName}${config.gradeName} ${config.classCount} 个班，${config.subjects
      .map((subject) => subject.name)
      .join("、")} ${config.subjects.length} 门课。`;
  document.querySelector("#subjectConfigHelp").textContent =
    `${config.divisionName}${config.gradeName}每门课配置多位老师，系统按老师空闲时段和课量自动均衡。`;
  document.querySelector("#adminSchedulePreviewHelp").textContent =
    `按${config.gradeName}班级查看生成结果，确认前为草稿，确认后同步到老师端 ${formatWeekRange(config.weekStart)} 课表。`;
  document.querySelector("#subjectConfigList").innerHTML = config.subjects
    .map(adminSubjectConfigItem)
    .join("");
  document.querySelector("#conflictList").innerHTML =
    assignments.length === 0
      ? `<div class="empty-state">点击“一键生成排课”后显示冲突校验结果</div>`
      : conflicts.length
        ? conflicts.map(conflictItem).join("")
        : `<div class="check-success"><strong>教师时间冲突 0</strong><span>已通过：同一老师同一时间没有被安排到多个班级。</span></div>`;
  document.querySelector("#adminClassSelect").innerHTML = config.classes
    .map(
      (schoolClass) => `
        <option value="${schoolClass.id}" ${schoolClass.id === selectedClassId ? "selected" : ""}>
          ${schoolClass.name} · ${schoolClass.room}
        </option>
      `,
    )
    .join("");
  document.querySelector("#adminScheduleGrid").innerHTML = adminScheduleGrid(selectedClassAssignments);

  document.querySelector("#generateSchedule").disabled = schedulingBackendState.loading;
  document.querySelector("#confirmSchedule").disabled =
    schedulingBackendState.loading || assignments.length === 0 || conflicts.length > 0 || draft.status === "published";
}

function renderTeacherImport() {
  const container = document.querySelector("#teacherImportView");
  if (!container) return;

  const textarea = document.querySelector("#teacherImportCsv");
  const status = document.querySelector("#teacherImportStatus");
  const preview = teacherImportState.preview;
  const imported = teacherImportState.imported;
  const connected = backendMode() && currentRole() === "admin";
  const currentCsv = teacherImportState.csvText.trim();
  const previewMatchesCsv = Boolean(preview) && teacherImportState.previewCsvText.trim() === currentCsv;
  const alreadyCommitted = Boolean(currentCsv) && teacherImportState.committedCsvText.trim() === currentCsv;

  if (textarea && document.activeElement !== textarea) {
    textarea.value = teacherImportState.csvText;
  }

  document.querySelector("#teacherImportTotalRows").textContent = preview?.totalRows || 0;
  document.querySelector("#teacherImportValidRows").textContent = preview?.validRows || 0;
  document.querySelector("#teacherImportErrorRows").textContent = preview?.errorRows || 0;
  document.querySelector("#teacherImportImportedCount").textContent = imported?.importedCount || 0;

  if (status) {
    status.textContent = teacherImportState.loading
      ? "处理中"
      : teacherImportState.error
        ? teacherImportState.error
        : connected
          ? "已连接后端导入接口"
          : "请通过后端服务登录行政账号";
    status.className = teacherImportState.error
      ? "status-pill warning"
      : connected
        ? "status-pill done"
        : "status-pill";
  }

  const previewButton = document.querySelector("#previewTeacherImport");
  const commitButton = document.querySelector("#commitTeacherImport");
  if (previewButton) {
    previewButton.disabled = teacherImportState.loading || !connected || !currentCsv;
  }
  if (commitButton) {
    commitButton.disabled =
      teacherImportState.loading ||
      !connected ||
      !currentCsv ||
      !previewMatchesCsv ||
      !preview?.canImport ||
      alreadyCommitted;
  }

  renderTeacherImportMessages(preview, previewMatchesCsv, alreadyCommitted);
  renderTeacherImportRows(preview);
}

function renderTeacherImportMessages(preview, previewMatchesCsv, alreadyCommitted) {
  const list = document.querySelector("#teacherImportMessages");
  if (!list) return;

  if (teacherImportState.error && !preview) {
    list.innerHTML = `
      <article class="import-message error">
        <strong>接口调用失败</strong>
        <span>${escapeHtml(teacherImportState.error)}</span>
      </article>
    `;
    return;
  }

  if (!preview) {
    list.innerHTML = `<div class="empty-state">先粘贴 CSV，再点击“预览校验”。</div>`;
    return;
  }

  const messages = [];
  if (!previewMatchesCsv) {
    messages.push({
      type: "warning",
      title: "CSV 已修改",
      text: "当前内容与上次预览不一致，请重新预览校验后再导入。",
    });
  }
  if (alreadyCommitted) {
    messages.push({
      type: "warning",
      title: "本批次已提交",
      text: "这份 CSV 已经确认导入，继续导入会产生重复账号，请修改内容后重新预览。",
    });
  }
  if (preview.canImport && previewMatchesCsv && !alreadyCommitted) {
    messages.push({
      type: "success",
      title: "校验通过",
      text: `共 ${preview.validRows} 行可导入，点击“确认导入”后会创建教师档案和老师账号。`,
    });
  }

  (preview.errors || []).slice(0, 12).forEach((item) => {
    messages.push({
      type: "error",
      title: `第 ${item.rowNumber} 行 · ${item.field}`,
      text: item.message,
    });
  });

  (preview.warnings || []).slice(0, 8).forEach((item) => {
    messages.push({
      type: "warning",
      title: `第 ${item.rowNumber} 行 · ${item.field}`,
      text: item.message,
    });
  });

  if ((preview.errors || []).length > 12) {
    messages.push({
      type: "warning",
      title: "错误较多",
      text: `还有 ${(preview.errors || []).length - 12} 条错误未展示，请优先修正前面的格式和重复项。`,
    });
  }

  list.innerHTML = messages.length
    ? messages
        .map(
          (message) => `
            <article class="import-message ${message.type === "error" ? "error" : message.type === "warning" ? "warning" : ""}">
              <strong>${escapeHtml(message.title)}</strong>
              <span>${escapeHtml(message.text)}</span>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">暂无校验信息</div>`;
}

function renderTeacherImportRows(preview) {
  const table = document.querySelector("#teacherImportPreviewTable");
  if (!table) return;

  if (!preview?.rows?.length) {
    table.innerHTML = `<tr><td colspan="8"><div class="empty-state">暂无导入预览</div></td></tr>`;
    return;
  }

  const errorRows = new Set((preview.errors || []).map((item) => item.rowNumber));
  table.innerHTML = preview.rows
    .map(
      (row) => `
        <tr>
          <td data-label="行号">${row.rowNumber}</td>
          <td data-label="工号">${escapeHtml(row.employeeNo)}</td>
          <td class="row-title" data-label="姓名">${escapeHtml(row.name)}</td>
          <td data-label="学部">${escapeHtml(row.stageId)}</td>
          <td data-label="部门">${escapeHtml(row.department)}</td>
          <td data-label="科目">${escapeHtml(row.primarySubjectId)}</td>
          <td data-label="用户名">${escapeHtml(row.username)}</td>
          <td data-label="状态">${
            errorRows.has(row.rowNumber)
              ? `<span class="tag exception">有错误</span>`
              : `<span class="tag completed">可导入</span>`
          }</td>
        </tr>
      `,
    )
    .join("");
}

function adminSubjectConfigItem(subject) {
  const teachers = subject.teacherIds.map(schedulingTeacherName).join("、");
  return `
    <article class="subject-config-item">
      <div>
        <strong>${subject.name}</strong>
        <span>每班每周 ${subject.weeklyLessons} 节</span>
      </div>
      <p>${teachers}</p>
    </article>
  `;
}

function conflictItem(conflict) {
  return `
    <article class="warning-item">
      <header>
        <strong>${conflict.title}</strong>
        <span class="tag exception">冲突</span>
      </header>
      <p>${conflict.text}</p>
    </article>
  `;
}

function adminScheduleGrid(assignments) {
  const weekDates = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5);
  const grouped = weekDates.reduce((map, date) => {
    map.set(date, []);
    return map;
  }, new Map());
  assignments.forEach((assignment) => {
    if (!grouped.has(assignment.date)) return;
    grouped.get(assignment.date).push(assignment);
  });

  const dayNames = ["周一", "周二", "周三", "周四", "周五"];
  return weekDates
    .map((date, index) => {
      const dayAssignments = grouped.get(date).sort((a, b) => a.period - b.period);
      return `
        <article class="schedule-column">
          <header>
            <span>${dayNames[index]}</span>
            <strong>${formatDate(date)}</strong>
            <small>${dayAssignments.length ? `${dayAssignments.length} 节课` : "未排课"}</small>
          </header>
          <div class="schedule-items">
            ${
              dayAssignments.length
                ? dayAssignments.map(adminScheduleItem).join("")
                : `<div class="schedule-empty">暂无课程</div>`
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function adminScheduleItem(assignment) {
  return `
    <div class="schedule-item">
      <div class="schedule-time">
        <strong>第 ${assignment.period} 节</strong>
        <span>${assignment.time}</span>
      </div>
      <div class="schedule-main">
        <strong>${assignment.subjectName} · ${assignment.teacherName}</strong>
        <span>${assignment.room}</span>
      </div>
    </div>
  `;
}

function renderScanner() {
  const select = document.querySelector("#qrLessonSelect");
  if (!select) return;

  const teacherId = currentRole() === "teacher" ? currentTeacherId() : state.selectedFinanceTeacherId;
  const lessons = teacherLessons(teacherId);
  if (!lessons.some((lesson) => lesson.id === state.scannerLessonId)) {
    state.scannerLessonId =
      lessons.find((lesson) => lesson.status === "pending" || lesson.status === "checkedIn")?.id ||
      lessons[0]?.id ||
      "";
  }

  select.innerHTML = lessons
    .map(
      (lesson) => `
        <option value="${lesson.id}" ${lesson.id === state.scannerLessonId ? "selected" : ""}>
          ${formatDate(lesson.date)} ${lesson.time} · ${lesson.room} · ${lesson.className} · ${statusLabel[lesson.status]}
        </option>
      `,
    )
    .join("");

  const lesson = lessons.find((item) => item.id === state.scannerLessonId);
  const payload = lesson ? buildQrPayload(lesson) : "";
  const qrBox = document.querySelector("#qrCodeBox");
  const payloadText = document.querySelector("#qrPayloadText");

  payloadText.textContent = payload;
  if (!lesson) {
    qrBox.innerHTML = `<div class="empty-state">暂无可生成二维码的课时</div>`;
  } else if (typeof qrcode === "function") {
    const qr = qrcode(0, "M");
    qr.addData(payload);
    qr.make();
    qrBox.innerHTML = qr.createSvgTag(6, 1);
  } else {
    qrBox.innerHTML = `<div class="empty-state">二维码生成库未加载</div>`;
  }

  document.querySelector("#lastScanResult").textContent = state.lastScanText || "暂无";
  document.querySelector("#scannerStatus").textContent = qrScanner ? "识别中" : "未启动";
  document.querySelector("#scannerStatus").className = qrScanner ? "status-pill done" : "status-pill";
  document.querySelector("#startScanner").disabled = Boolean(qrScanner);
  document.querySelector("#stopScanner").disabled = !qrScanner;
  renderSecurityChecks();
}

function renderRecords() {
  const teacherId = currentTeacherId();
  const records = teacherLessons(teacherId).filter(
    (lesson) => lesson.status === "checkedIn" || lesson.status === "completed" || lesson.status === "exception",
  );
  document.querySelector("#teacherRecordTable").innerHTML = records.length
    ? records.map(recordRow).join("")
    : `<tr><td colspan="7"><div class="empty-state">暂无考勤记录</div></td></tr>`;
}

function renderConfirmation() {
  const teacherId = currentTeacherId();
  const stage = state.confirmationStages[teacherId] || 0;
  document.querySelector("#confirmSteps").innerHTML = confirmSteps
    .map((step, index) => {
      const completed = index <= stage;
      return `
        <article class="confirm-step ${completed ? "active" : ""}">
          <span>${step.label}</span>
          <strong>${step.title}</strong>
          <small>${completed ? "已完成" : "待处理"}</small>
        </article>
      `;
    })
    .join("");

  const salary = calculateSalary(teacherId);
  const exceptionCount = teacherLessons(teacherId).filter((lesson) => lesson.status === "exception").length;
  const pendingCount = teacherLessons(teacherId).filter(
    (lesson) => lesson.status === "pending" || lesson.status === "checkedIn",
  ).length;

  document.querySelector("#workloadList").innerHTML = [
    ["正常课时", `${salary.regularUnits} 节`, "按每节 80 元计入课时津贴"],
    ["早晚自习", `${salary.selfStudyUnits} 节`, "按每节 50 元计入补贴"],
    ["周末补课", `${salary.weekendUnits} 节`, "按每节 120 元计入补贴"],
    ["审批加班", `${salary.profile.approvedOvertimeHours || 0} 小时`, "由主管发起并审批通过"],
    ["待处理考勤", `${pendingCount} 节`, "未完成签入和签出，暂不计入工资"],
    ["异常记录", `${exceptionCount} 条`, "待教务复核后处理"],
  ]
    .map(
      ([label, value, desc]) => `
        <div class="workload-item">
          <div>
            <span>${label}</span>
            <p class="muted">${desc}</p>
          </div>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");

  document.querySelector("#confirmWorkload").disabled = stage > 0;
  document.querySelector("#simulateApproval").disabled = stage === 0 || stage === 3;
}

function renderFinanceDashboard() {
  if (backendMode() && currentRole() === "finance") {
    renderBackendFinanceDashboard();
    return;
  }

  if (!state.financeGroupBy) state.financeGroupBy = "department";
  const allPending = state.lessons.filter(
    (lesson) => lesson.status === "pending" || lesson.status === "checkedIn",
  ).length;
  const allWarnings = buildWarnings().length;
  const settledCount = state.teachers.filter((teacher) => state.settlements[teacher.id]?.status === "settled").length;
  const totals = financeSalaryTotals();

  document.querySelector("#financeTeacherCount").textContent = state.teachers.length;
  document.querySelector("#financePendingCount").textContent = allPending;
  document.querySelector("#financeWarningCount").textContent = allWarnings;
  document.querySelector("#financeSettledCount").textContent = settledCount;
  document.querySelector("#financeGrossTotal").textContent = formatCurrency(totals.gross);
  document.querySelector("#financeNetTotal").textContent = formatCurrency(totals.net);
  const financeApiStatus = document.querySelector("#financeApiStatus");
  const financePageInfo = document.querySelector("#financeTeacherPageInfo");
  if (financeApiStatus) {
    financeApiStatus.textContent = "本地演示数据";
    financeApiStatus.className = "status-pill";
  }
  if (financePageInfo) {
    financePageInfo.textContent = `本地演示 · 共 ${state.teachers.length} 位老师`;
  }
  document.querySelector("#financePrevPage").disabled = true;
  document.querySelector("#financeNextPage").disabled = true;

  document.querySelectorAll("[data-finance-group]").forEach((button) => {
    button.classList.toggle("active", button.dataset.financeGroup === state.financeGroupBy);
  });

  document.querySelector("#financeGroupTable").innerHTML = financeGroupRows()
    .map(
      (group) => `
        <tr>
          <td class="row-title" data-label="分组">${group.key}</td>
          <td data-label="人数">${group.teacherCount} 人</td>
          <td data-label="已完成课时">${group.completedUnits} 节</td>
          <td data-label="待处理">${group.pendingCount} 节</td>
          <td data-label="异常">${group.exceptionCount} 条</td>
          <td data-label="应发合计">${formatCurrency(group.gross)}</td>
          <td data-label="实发合计">${formatCurrency(group.net)}</td>
        </tr>
      `,
    )
    .join("");

  document.querySelector("#financeOverviewTable").innerHTML = state.teachers
    .map((teacher) => {
      const stats = teacherLessonStats(teacher.id);
      const salary = calculateSalary(teacher.id);
      return `
        <tr>
          <td class="row-title" data-label="老师">${teacher.name}</td>
          <td data-label="学部/学科">${teacher.department} · ${teacher.subject}</td>
          <td data-label="已完成课时">${stats.completedUnits} 节</td>
          <td data-label="待处理">${stats.pendingCount} 节</td>
          <td data-label="异常">${stats.exceptionCount} 条</td>
          <td data-label="预计实发">${formatCurrency(salary.net)}</td>
          <td data-label="结算状态">${settlementTag(teacher.id)}</td>
          <td data-label="操作">
            <button class="mini-button" data-finance-records="${teacher.id}" type="button">看记录</button>
            <button class="mini-button primary" data-finance-settle="${teacher.id}" type="button">结算</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderBackendFinanceDashboard() {
  if (!financeTeacherPage.loaded && !financeTeacherPage.loading) {
    loadFinanceTeacherPage();
  }

  if (!state.financeGroupBy) state.financeGroupBy = "department";
  const totals = financePageTotals();
  const meta = financeTeacherPage.meta || { page: 1, pageSize: 20, total: 0, totalPages: 1 };

  document.querySelector("#financeTeacherCount").textContent = meta.total || 0;
  document.querySelector("#financePendingCount").textContent = totals.pending;
  document.querySelector("#financeWarningCount").textContent = totals.exception;
  document.querySelector("#financeSettledCount").textContent = "0";
  document.querySelector("#financeGrossTotal").textContent = formatCurrency(totals.gross);
  document.querySelector("#financeNetTotal").textContent = formatCurrency(totals.net);

  const searchInput = document.querySelector("#financeTeacherSearch");
  const pageSizeSelect = document.querySelector("#financeTeacherPageSize");
  const pageInfo = document.querySelector("#financeTeacherPageInfo");
  const status = document.querySelector("#financeApiStatus");
  if (searchInput) searchInput.value = financeTeacherPage.search;
  if (pageSizeSelect) pageSizeSelect.value = String(financeTeacherPage.pageSize);
  if (pageInfo) pageInfo.textContent = `第 ${meta.page || 1} / ${meta.totalPages || 1} 页 · 共 ${meta.total || 0} 位老师`;
  if (status) {
    status.textContent = financeTeacherPage.loading
      ? "正在读取后端教师分页"
      : financeTeacherPage.error || "已连接后端教师接口";
    status.className = financeTeacherPage.error ? "status-pill warning" : "status-pill done";
  }

  document.querySelector("#financePrevPage").disabled = financeTeacherPage.loading || (meta.page || 1) <= 1;
  document.querySelector("#financeNextPage").disabled =
    financeTeacherPage.loading || (meta.page || 1) >= (meta.totalPages || 1);

  document.querySelectorAll("[data-finance-group]").forEach((button) => {
    button.classList.toggle("active", button.dataset.financeGroup === state.financeGroupBy);
  });

  document.querySelector("#financeGroupTable").innerHTML = backendFinanceGroupRows()
    .map(
      (group) => `
        <tr>
          <td class="row-title" data-label="分组">${group.key}</td>
          <td data-label="人数">${group.teacherCount} 人</td>
          <td data-label="已完成课时">${group.completedUnits} 节</td>
          <td data-label="待处理">${group.pendingCount} 节</td>
          <td data-label="异常">${group.exceptionCount} 条</td>
          <td data-label="应发合计">${formatCurrency(group.gross)}</td>
          <td data-label="实发合计">${formatCurrency(group.net)}</td>
        </tr>
      `,
    )
    .join("");

  document.querySelector("#financeOverviewTable").innerHTML = financeTeacherPage.loading
    ? `<tr><td colspan="8"><div class="empty-state">正在加载后端教师列表...</div></td></tr>`
    : financeTeacherPage.error
      ? `<tr><td colspan="8"><div class="empty-state">${financeTeacherPage.error}</div></td></tr>`
      : financeTeacherPage.items
          .map(
            (teacher) => `
              <tr>
                <td class="row-title" data-label="老师">${teacher.name}</td>
                <td data-label="学部/学科">${backendTeacherDepartment(teacher)} · ${backendTeacherSubject(teacher)}</td>
                <td data-label="已完成课时">${teacher.summary?.completedUnits || 0} 节</td>
                <td data-label="待处理">${teacher.summary?.pendingCount || 0} 节</td>
                <td data-label="异常">${teacher.summary?.exceptionCount || 0} 条</td>
                <td data-label="预计实发">${formatCurrency(teacher.payroll?.netPay || 0)}</td>
                <td data-label="结算状态"><span class="tag">后端试算</span></td>
                <td data-label="操作">
                  <button class="mini-button" data-finance-records="${teacher.id}" type="button">看记录</button>
                  <button class="mini-button primary" data-finance-settle="${teacher.id}" type="button">结算</button>
                </td>
              </tr>
            `,
          )
          .join("");
}

function renderFinanceRecords() {
  const select = document.querySelector("#financeTeacherSelect");
  select.innerHTML = teacherOptions(state.selectedFinanceTeacherId);
  const teacherId = state.selectedFinanceTeacherId;
  const lessons = teacherLessons(teacherId);
  document.querySelector("#financeRecordTable").innerHTML = lessons.length
    ? lessons.map(financeRecordRow).join("")
    : `<tr><td colspan="8"><div class="empty-state">该老师暂无记录</div></td></tr>`;
}

function renderSettlement() {
  const select = document.querySelector("#settlementTeacherSelect");
  select.innerHTML = teacherOptions(state.selectedFinanceTeacherId);
  const teacherId = state.selectedFinanceTeacherId;
  const salary = calculateSalary(teacherId);
  const settlement = state.settlements[teacherId];
  const settled = settlement?.status === "settled";
  const status = document.querySelector("#settlementStatus");

  document.querySelector("#settlementGrossSalary").textContent = formatCurrency(salary.gross);
  document.querySelector("#settlementTaxSalary").textContent = formatCurrency(salary.tax);
  document.querySelector("#settlementNetSalary").textContent = formatCurrency(salary.net);
  status.textContent = settled ? `已结算 ${settlement.settledAt}` : "未结算";
  status.className = settled ? "status-pill locked" : "status-pill";
  document.querySelector("#settleTeacherPayroll").disabled = settled;
  document.querySelector("#settlementSalaryTable").innerHTML = salaryRows(teacherId)
    .map(
      ([name, basis, amount]) => `
        <tr>
          <td class="row-title" data-label="薪资项目">${name}</td>
          <td class="muted" data-label="计算口径">${basis}</td>
          <td data-label="金额">${formatCurrency(amount)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderWarnings() {
  const role = currentRole();
  const teacherId = role === "teacher" ? currentTeacherId() : null;
  const warnings = buildWarnings(teacherId);
  document.querySelector("#warningsTitle").textContent = role === "teacher" ? "我的异常提醒" : "全校异常提醒";
  document.querySelector("#warningList").innerHTML = warnings.length
    ? warnings
        .map(
          (warning) => `
            <article class="warning-item">
              <header>
                <strong>${warning.title}</strong>
                <span class="tag ${warning.level === "高" ? "exception" : "pending"}">${warning.level}风险</span>
              </header>
              <p>${warning.text}</p>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">暂无异常提醒</div>`;
}

function teacherOptions(selectedId) {
  return state.teachers
    .map(
      (teacher) => `
        <option value="${teacher.id}" ${teacher.id === selectedId ? "selected" : ""}>
          ${teacher.name} · ${teacher.department} · ${teacher.subject}
        </option>
      `,
    )
    .join("");
}

function scheduleLessonItem(lesson) {
  const action = lesson.status === "pending" || lesson.status === "checkedIn" ? actionCell(lesson) : statusTag(lesson.status);
  return `
    <div class="schedule-item">
      <div class="schedule-time">
        <strong>${lesson.time.split("-")[0]}</strong>
        <span>${lesson.time.split("-")[1]}</span>
      </div>
      <div class="schedule-main">
        <strong>${lesson.className} · ${lesson.course}</strong>
        <span>${lesson.room} · ${lessonTypeLabel[lesson.type]} · ${allowanceText(lesson)}</span>
      </div>
      <div class="schedule-action">${action}</div>
    </div>
  `;
}

function taskRow(lesson) {
  return `
    <tr>
      <td data-label="时间">${lesson.time}</td>
      <td class="row-title" data-label="班级">${lesson.className}</td>
      <td data-label="课程">${lesson.course}</td>
      <td data-label="教室">${lesson.room}</td>
      <td data-label="类型">${lessonTypeLabel[lesson.type]}</td>
      <td data-label="状态">${statusTag(lesson.status)}</td>
      <td data-label="操作">${actionCell(lesson)}</td>
    </tr>
  `;
}

function fullTaskRow(lesson) {
  return `
    <tr>
      <td data-label="日期">${formatDate(lesson.date)}</td>
      <td data-label="时间">${lesson.time}</td>
      <td class="row-title" data-label="班级">${lesson.className}</td>
      <td data-label="课程">${lesson.course}</td>
      <td data-label="教室">${lesson.room}</td>
      <td data-label="课时类型">${lessonTypeLabel[lesson.type]}</td>
      <td data-label="津贴">${allowanceText(lesson)}</td>
      <td data-label="状态">${statusTag(lesson.status)}</td>
      <td data-label="操作">${actionCell(lesson)}</td>
    </tr>
  `;
}

function recordRow(lesson) {
  return `
    <tr>
      <td data-label="日期">${formatDate(lesson.date)}</td>
      <td data-label="时间">${lesson.time}</td>
      <td class="row-title" data-label="班级">${lesson.className}</td>
      <td data-label="课程">${lesson.course}</td>
      <td data-label="教室">${lesson.room}</td>
      <td data-label="考勤状态">${statusTag(lesson.status)}</td>
      <td class="muted" data-label="记录说明">${attendanceNote(lesson)}</td>
    </tr>
  `;
}

function financeRecordRow(lesson) {
  return `
    <tr>
      <td data-label="日期">${formatDate(lesson.date)}</td>
      <td data-label="时间">${lesson.time}</td>
      <td class="row-title" data-label="老师">${teacherName(lesson.teacherId)}</td>
      <td data-label="班级">${lesson.className}</td>
      <td data-label="课程">${lesson.course}</td>
      <td data-label="教室">${lesson.room}</td>
      <td data-label="考勤状态">${statusTag(lesson.status)}</td>
      <td class="muted" data-label="说明">${attendanceNote(lesson)}</td>
    </tr>
  `;
}

function statusTag(status) {
  return `<span class="tag ${status}">${statusLabel[status]}</span>`;
}

function attendanceNote(lesson) {
  const checkIn = lesson.checkInTime || "";
  const checkOut = lesson.checkOutTime || "";
  const parts = [lesson.note];
  if (checkIn) parts.push(`签入 ${checkIn}`);
  if (checkOut) parts.push(`签出 ${checkOut}`);
  if (!checkIn && !checkOut && lesson.scanTime) parts.push(`历史记录 ${lesson.scanTime}`);
  return parts.filter(Boolean).join(" · ");
}

function allowanceText(lesson) {
  if (lesson.type === "regular") return `${lesson.units} 节 × ${state.rules.regularLessonRate} 元`;
  if (lesson.type === "morning" || lesson.type === "evening") return `${lesson.units} 节 × ${state.rules.selfStudyRate} 元`;
  return `${lesson.units} 节 × ${state.rules.weekendRate} 元`;
}

function actionCell(lesson) {
  if (currentRole() !== "teacher") {
    return `<span class="muted">财务只读</span>`;
  }
  if (lesson.teacherId !== currentTeacherId()) {
    return `<span class="muted">非本人任务</span>`;
  }
  if (lesson.status === "pending") {
    return `<button class="mini-button primary" data-attendance-action="checkIn" data-scan="${lesson.id}" type="button">签入</button>`;
  }
  if (lesson.status === "checkedIn") {
    return `<button class="mini-button primary" data-attendance-action="checkOut" data-scan="${lesson.id}" type="button">签出</button>`;
  }
  if (lesson.status === "completed") {
    return `<span class="muted">已完成</span>`;
  }
  if (lesson.status === "scheduled") {
    return `<span class="muted">未到时间</span>`;
  }
  return `<button class="mini-button" data-review="${lesson.id}" type="button">查看原因</button>`;
}

function signingBase(payload) {
  return [
    payload.app,
    payload.action,
    payload.room,
    payload.roomCode,
    SECURITY_SECRET,
  ].join("|");
}

function signPayload(payload) {
  const text = signingBase(payload);
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(7, "0");
}

function buildQrPayload(lesson, options = {}) {
  const room = options.room || lesson.room;
  const payload = {
    app: "school-teacher-pay-demo",
    action: "classroom-checkin",
    room,
    roomCode: options.roomCode || `ROOM-${room}`,
  };
  return JSON.stringify({
    ...payload,
    signature: options.signature || signPayload(payload),
  });
}

function lessonWindow(lesson) {
  const [startTime, endTime] = lesson.time.split("-");
  const start = new Date(`${lesson.date}T${startTime}:00+08:00`);
  const end = new Date(`${lesson.date}T${endTime}:00+08:00`);
  return {
    start,
    end,
    startsAt: new Date(start.getTime() - 15 * 60 * 1000),
    checkInEndsAt: start,
    checkOutStartsAt: end,
    endsAt: new Date(end.getTime() + 15 * 60 * 1000),
  };
}

function formatClock(date) {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  });
}

function demoTimeForAction(lesson, action) {
  const window = lessonWindow(lesson);
  if (action === "checkOut") {
    return new Date(window.end.getTime() + 5 * 60 * 1000).toISOString();
  }
  return new Date(window.start.getTime() - 5 * 60 * 1000).toISOString();
}

function actionForLesson(lesson) {
  return lesson.status === "checkedIn" ? "checkOut" : "checkIn";
}

function actionLabel(action) {
  return action === "checkOut" ? "签出" : "签入";
}

function findCurrentLessonForRoom(room, action, targetLessonId, nowText = state.demoNow) {
  const teacherId = currentTeacherId();
  const now = new Date(nowText);
  return teacherLessons(teacherId).find((lesson) => {
    if (targetLessonId && lesson.id !== targetLessonId) return false;
    if (lesson.room !== room) return false;
    const window = lessonWindow(lesson);
    if (action === "checkOut") {
      return now >= window.checkOutStartsAt && now <= window.endsAt;
    }
    return now >= window.startsAt && now <= window.checkInEndsAt;
  });
}

function pushCheck(checks, label, passed, detail) {
  checks.push({ label, passed, detail });
}

function validateQrPayload(decodedText, options = {}) {
  const checks = [];
  let payload;
  let lesson;
  const action = options.action || "checkIn";
  const nowText = options.nowText || state.demoNow;

  try {
    payload = JSON.parse(decodedText);
    pushCheck(checks, "二维码格式", true, "二维码内容可被系统解析");
  } catch (error) {
    pushCheck(checks, "二维码格式", false, "二维码内容不是合法 JSON");
    return { ok: false, checks };
  }

  const typePassed = payload.app === "school-teacher-pay-demo" && payload.action === "classroom-checkin";
  pushCheck(checks, "业务类型", typePassed, typePassed ? "属于固定教室考勤码" : "不是本系统教室二维码");

  const expectedSignature = signPayload(payload);
  const signaturePassed = Boolean(payload.signature) && payload.signature === expectedSignature;
  pushCheck(checks, "教室码防伪", signaturePassed, signaturePassed ? "固定教室码签名匹配" : "签名不匹配，疑似伪造或篡改");

  const rolePassed = currentRole() === "teacher";
  pushCheck(checks, "账号角色", rolePassed, rolePassed ? "当前为老师账号" : "财务账号不能代替老师考勤");

  const teacher = teacherById(currentTeacherId());
  const devicePassed = currentAccount().deviceId && teacher?.boundDeviceId === currentAccount().deviceId;
  pushCheck(checks, "绑定设备", devicePassed, devicePassed ? "当前设备与老师账号绑定信息一致" : "非绑定设备，需重新认证");

  const roomExists = state.lessons.some((item) => item.room === payload.room);
  pushCheck(checks, "教室存在", roomExists, roomExists ? `识别到教室 ${payload.room}` : "系统没有这个教室码");

  lesson = findCurrentLessonForRoom(payload.room, action, options.lessonId, nowText);
  pushCheck(
    checks,
    `${actionLabel(action)}时间匹配课表`,
    Boolean(lesson),
    lesson
      ? `当前时间可为 ${lesson.className} ${lesson.course}${actionLabel(action)}`
      : `当前老师此时间不能在该教室${actionLabel(action)}`,
  );

  const statusPassed =
    Boolean(lesson) &&
    ((action === "checkIn" && lesson.status === "pending") ||
      (action === "checkOut" && lesson.status === "checkedIn"));
  pushCheck(
    checks,
    "课时状态",
    statusPassed,
    statusPassed
      ? `该课时可${actionLabel(action)}`
      : action === "checkIn"
        ? lesson?.status === "scheduled"
          ? "该课时为之后排班，未到开放签入时间"
          : "该课时已签入、已完成或异常，不能重复签入"
        : "该课时尚未签入、已完成或异常，不能签出",
  );

  const ok = checks.every((check) => check.passed);
  return { ok, checks, payload, lesson, action, nowText };
}

function renderSecurityChecks() {
  const summary = document.querySelector("#securitySummary");
  const list = document.querySelector("#securityCheckList");
  if (!summary || !list) return;

  if (!state.lastSecurityChecks.length) {
    summary.textContent = "等待扫码";
    summary.className = "status-pill";
    list.innerHTML = `<div class="empty-state">扫码后会显示格式、固定教室码防伪、老师账号、绑定设备、签入/签出时间窗口、课时状态、重复计薪拦截等校验结果。</div>`;
    return;
  }

  const passed = state.lastSecurityPassed;
  summary.textContent = passed ? "全部通过" : "已拦截";
  summary.className = passed ? "status-pill done" : "status-pill warning";
  list.innerHTML = state.lastSecurityChecks
    .map(
      (check) => `
        <div class="security-check ${check.passed ? "pass" : "fail"}">
          <div>
            <strong>${check.label}</strong>
            <span>${check.detail}</span>
          </div>
          <span class="tag ${check.passed ? "completed" : "exception"}">${check.passed ? "通过" : "拦截"}</span>
        </div>
      `,
    )
    .join("");
}

function handleDecodedScan(decodedText, options = {}) {
  state.lastScanText = decodedText;
  const validation = validateQrPayload(decodedText, options);
  state.lastSecurityChecks = validation.checks;
  state.lastSecurityPassed = validation.ok;

  if (!validation.ok) {
    showToast("课程考勤被防作弊规则拦截");
    renderScanner();
    return;
  }

  state.scannerLessonId = validation.lesson.id;
  recordAttendance(validation.lesson.id, validation.action, validation.nowText);
}

function selectedScannerActionContext() {
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) {
    return { action: "checkIn", lessonId: "", nowText: state.demoNow };
  }
  const action = actionForLesson(lesson);
  return {
    action,
    lessonId: lesson.id,
    nowText: demoTimeForAction(lesson, action),
  };
}

function attemptSecureAttendance(id, action = null) {
  const lesson = state.lessons.find((item) => item.id === id);
  if (!lesson) return;
  const attendanceAction = action || actionForLesson(lesson);
  handleDecodedScan(buildQrPayload(lesson), {
    action: attendanceAction,
    lessonId: lesson.id,
    nowText: demoTimeForAction(lesson, attendanceAction),
  });
}

function recordAttendance(id, action, nowText) {
  if (currentRole() !== "teacher") {
    showToast("只有老师账号可以提交考勤");
    return;
  }

  const lesson = state.lessons.find((item) => item.id === id);
  if (!lesson) return;
  if (lesson.teacherId !== currentTeacherId()) {
    showToast("只能处理本人课时任务");
    render();
    return;
  }
  if (action === "checkIn" && lesson.status !== "pending") {
    showToast(`${lesson.className} ${lesson.course} 不能重复签入`);
    render();
    return;
  }
  if (action === "checkOut" && lesson.status !== "checkedIn") {
    showToast(`${lesson.className} ${lesson.course} 尚未签入或已完成`);
    render();
    return;
  }

  const clock = formatClock(new Date(nowText));
  if (action === "checkIn") {
    lesson.status = "checkedIn";
    lesson.checkInTime = clock;
    lesson.note = "已完成课前签入，待下课后签出";
    showToast(`${lesson.className} ${lesson.course} 已签入，下课后签出才计薪`);
  } else {
    lesson.status = "completed";
    lesson.checkOutTime = clock;
    lesson.note = "签入签出完成，计入本月薪资";
    showToast(`${lesson.className} ${lesson.course} 已签出，薪资试算已刷新`);
  }
  render();
}

async function generateAdminSchedule() {
  if (backendMode() && currentRole() === "admin") {
    await generateBackendSchedule();
    return;
  }

  const config = state.schedulingConfig;
  const assignments = generateScheduleAssignments();
  const conflicts = validateScheduleConflicts(assignments);
  state.schedulingDraft = {
    ...state.schedulingDraft,
    status: "draft",
    divisionId: config.divisionId,
    gradeId: config.gradeId,
    divisionName: config.divisionName,
    gradeName: config.gradeName,
    generatedAt: formatDateTimeMinute(),
    confirmedAt: "",
    publishedAt: "",
    assignments,
    conflicts,
    publishedLessonIds: [],
  };
  showToast(
    conflicts.length
      ? `已生成${config.gradeName}草稿，发现 ${conflicts.length} 个冲突`
      : `已生成${config.gradeName}无教师冲突排课草稿`,
  );
  render();
}

async function confirmAndPublishSchedule() {
  if (backendMode() && currentRole() === "admin") {
    await publishBackendSchedule();
    return;
  }

  const config = state.schedulingConfig;
  const draft = state.schedulingDraft;
  if (!schedulingDraftMatchesCurrent()) {
    showToast("请先为当前学部和年级生成排课草稿");
    return;
  }
  const assignments = draft.assignments || [];
  if (!assignments.length) {
    showToast("请先一键生成排课草稿");
    return;
  }

  const conflicts = validateScheduleConflicts(assignments);
  if (conflicts.length) {
    state.schedulingDraft.conflicts = conflicts;
    showToast("存在教师时间冲突，不能发布");
    render();
    return;
  }

  const publishedLessons = assignments.map((assignment) => ({
    id: `PUB-${assignment.id}`,
    teacherId: assignment.teacherId,
    date: assignment.date,
    time: assignment.time,
    className: assignment.className,
    course: assignment.subjectName,
    room: assignment.room,
    type: "regular",
    units: 1,
    status: "scheduled",
    scanTime: "",
    note: "行政排课已确认发布，暂未到签入时间",
    source: "admin-scheduling",
    schedulingDivisionId: config.divisionId,
    schedulingGradeId: config.gradeId,
    scheduleAssignmentId: assignment.id,
  }));

  const now = formatDateTimeMinute();
  state.lessons = state.lessons
    .filter(
      (lesson) =>
        !(
          lesson.source === "admin-scheduling" &&
          lesson.schedulingDivisionId === config.divisionId &&
          lesson.schedulingGradeId === config.gradeId
        ),
    )
    .concat(publishedLessons);
  state.schedulingDraft = {
    ...draft,
    status: "published",
    confirmedAt: now,
    publishedAt: now,
    conflicts: [],
    publishedLessonIds: publishedLessons.map((lesson) => lesson.id),
  };
  state.selectedScheduleWeekStart = config.weekStart;
  showToast(`${config.divisionName}${config.gradeName}排课已确认，并发布到老师端课表`);
  render();
}

function startCameraScanner() {
  if (typeof Html5QrcodeScanner !== "function") {
    showToast("扫码库未加载，无法启动摄像头");
    return;
  }

  const scannerConfig = {
    fps: 10,
    qrbox: { width: 240, height: 240 },
    rememberLastUsedCamera: true,
  };

  if (typeof Html5QrcodeScanType === "object") {
    scannerConfig.supportedScanTypes = [
      Html5QrcodeScanType.SCAN_TYPE_CAMERA,
      Html5QrcodeScanType.SCAN_TYPE_FILE,
    ];
  }

  qrScanner = new Html5QrcodeScanner("reader", scannerConfig, false);
  qrScanner.render(
    (decodedText) => {
      handleDecodedScan(decodedText, selectedScannerActionContext());
    },
    () => {},
  );
  showToast("扫码器已启动，请按浏览器提示授权摄像头");
  renderScanner();
}

function stopCameraScanner() {
  if (!qrScanner) return;
  qrScanner
    .clear()
    .catch(() => {})
    .finally(() => {
      qrScanner = null;
      showToast("扫码器已停止");
      renderScanner();
    });
}

function switchView(viewName) {
  if (!views[viewName]) return;
  if (!viewAllowed(viewName)) {
    showToast("当前账号无权访问该页面");
    return;
  }
  state.activeView = viewName;
  render();
}

function loginAccount(accountId) {
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return;
  if (qrScanner) stopCameraScanner();
  sessionAccountId = accountId;
  state.currentAccountId = accountId;
  state.activeView = defaultViewByRole[account.role];
  state.taskFilter = "all";
  state.lastScanText = "";
  state.lastSecurityChecks = [];
  state.lastSecurityPassed = null;
  if (account.role === "teacher") {
    state.scannerLessonId =
      teacherLessons(account.teacherId).find(
        (lesson) => lesson.status === "pending" || lesson.status === "checkedIn",
      )?.id ||
      teacherLessons(account.teacherId)[0]?.id ||
      "";
  }
  saveSession(accountId);
  showToast(`已登录：${account.title}`);
  render();
}

function authenticateDemo(username, password, fallbackMessage = "用户名或密码不正确") {
  const matched = loginUsers.find(
    (user) => user.username === username.trim() && user.password === password,
  );
  if (!matched) {
    document.querySelector("#loginError").textContent = fallbackMessage;
    return false;
  }
  document.querySelector("#loginError").textContent = "";
  clearBackendSession();
  loginAccount(matched.accountId);
  return true;
}

async function authenticate(username, password) {
  const loginButton = document.querySelector("#loginForm button[type='submit']");
  const trimmedUsername = username.trim();
  loginButton.disabled = true;
  document.querySelector("#loginError").textContent = "";

  if (apiEnabled()) {
    try {
      const payload = await apiRequest("/api/auth/login", {
        method: "POST",
        body: {
          username: trimmedUsername,
          password,
        },
      });
      saveBackendSession({
        token: payload.token,
        account: payload.account,
      });
      const accountId = upsertBackendAccount(payload.account);
      loginAccount(accountId);
      if (payload.account.role === "teacher") {
        await loadBackendTeacherContext(payload.account.teacherId, "2026-06-15");
      }
      if (payload.account.role === "finance") {
        financeTeacherPage = {
          ...financeTeacherPage,
          page: 1,
          loaded: false,
          error: "",
        };
        await loadFinanceTeacherPage({ page: 1 });
      }
      if (payload.account.role === "admin") {
        schedulingBackendState = { loaded: false, loading: false, error: "" };
        await loadBackendSchedulingContext();
      }
      render();
      loginButton.disabled = false;
      return;
    } catch (error) {
      const demoAccepted = authenticateDemo(trimmedUsername, password, error.message || "后端登录失败");
      loginButton.disabled = false;
      if (!demoAccepted && error.message) {
        document.querySelector("#loginError").textContent = error.message;
      }
      return;
    }
  }

  authenticateDemo(trimmedUsername, password);
  loginButton.disabled = false;
}

function logout() {
  if (qrScanner) stopCameraScanner();
  sessionAccountId = "";
  clearSession();
  if (backendMode()) {
    apiRequest("/api/auth/logout", { method: "POST" }).catch(() => {});
  }
  clearBackendSession();
  document.querySelector("#loginPassword").value = "";
  render();
}

function showToast(text) {
  const toast = document.querySelector("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

document.addEventListener("click", async (event) => {
  const demoLoginButton = event.target.closest("[data-demo-login]");
  if (demoLoginButton) {
    document.querySelector("#loginUsername").value = demoLoginButton.dataset.demoLogin;
    document.querySelector("#loginPassword").value = "123456";
    return;
  }

  const navButton = event.target.closest("[data-view]");
  if (navButton) {
    switchView(navButton.dataset.view);
    return;
  }

  const jumpButton = event.target.closest("[data-view-jump]");
  if (jumpButton) {
    switchView(jumpButton.dataset.viewJump);
    return;
  }

  const scanButton = event.target.closest("[data-scan]");
  if (scanButton) {
    attemptSecureAttendance(scanButton.dataset.scan, scanButton.dataset.attendanceAction);
    return;
  }

  const noticeButton = event.target.closest("[data-notice-open]");
  if (noticeButton) {
    state.selectedNoticeId = noticeButton.dataset.noticeOpen;
    switchView("notifications");
    return;
  }

  const reviewButton = event.target.closest("[data-review]");
  if (reviewButton) {
    const lesson = state.lessons.find((item) => item.id === reviewButton.dataset.review);
    showToast(lesson ? lesson.note : "未找到异常记录");
    return;
  }

  const financeRecordsButton = event.target.closest("[data-finance-records]");
  if (financeRecordsButton) {
    state.selectedFinanceTeacherId = financeRecordsButton.dataset.financeRecords;
    if (backendMode()) {
      await loadBackendTeacherContext(state.selectedFinanceTeacherId);
    }
    switchView("financeRecords");
    return;
  }

  const financeSettleButton = event.target.closest("[data-finance-settle]");
  if (financeSettleButton) {
    state.selectedFinanceTeacherId = financeSettleButton.dataset.financeSettle;
    if (backendMode()) {
      await loadBackendTeacherContext(state.selectedFinanceTeacherId);
    }
    switchView("settlement");
  }
});

document.querySelector("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  authenticate(
    document.querySelector("#loginUsername").value,
    document.querySelector("#loginPassword").value,
  ).catch((error) => {
    document.querySelector("#loginError").textContent = error.message || "登录失败";
  });
});

document.querySelector("#logoutButton").addEventListener("click", logout);
document.querySelector("#topLogoutButton").addEventListener("click", logout);

document.querySelector("#scanNextLesson").addEventListener("click", (event) => {
  const lesson = state.lessons.find((item) => item.id === event.currentTarget.dataset.id);
  attemptSecureAttendance(event.currentTarget.dataset.id, lesson ? actionForLesson(lesson) : null);
});

document.querySelector("#quickScan").addEventListener("click", (event) => {
  const lesson = state.lessons.find((item) => item.id === event.currentTarget.dataset.id);
  attemptSecureAttendance(event.currentTarget.dataset.id, lesson ? actionForLesson(lesson) : null);
});

document.querySelector("#generateSchedule").addEventListener("click", generateAdminSchedule);
document.querySelector("#confirmSchedule").addEventListener("click", confirmAndPublishSchedule);
document.querySelector("#loadTeacherImportTemplate").addEventListener("click", () => {
  teacherImportState = {
    ...teacherImportState,
    csvText: buildTeacherImportTemplate(),
    preview: null,
    previewCsvText: "",
    imported: null,
    committedCsvText: "",
    error: "",
  };
  renderTeacherImport();
});
document.querySelector("#teacherImportCsv").addEventListener("input", () => {
  syncTeacherImportText();
  resetTeacherImportPreviewForEdit();
  renderTeacherImport();
});
document.querySelector("#previewTeacherImport").addEventListener("click", previewTeacherImportCsv);
document.querySelector("#commitTeacherImport").addEventListener("click", commitTeacherImportCsv);

document.querySelector("#resetDemo").addEventListener("click", () => {
  if (qrScanner) stopCameraScanner();
  const activeAccountId = state.currentAccountId;
  state = clone(initialState);
  state.currentAccountId = activeAccountId;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Storage reset is best-effort.
  }
  showToast("演示数据已重置");
  render();
});

document.querySelector("#confirmWorkload").addEventListener("click", () => {
  const teacherId = currentTeacherId();
  const pendingCount = teacherLessons(teacherId).filter(
    (lesson) => lesson.status === "pending" || lesson.status === "checkedIn",
  ).length;
  state.confirmationStages[teacherId] = 1;
  showToast(pendingCount > 0 ? "已确认，未完成考勤项目暂不计入工资" : "本月工作量已确认");
  render();
});

document.querySelector("#simulateApproval").addEventListener("click", () => {
  const teacherId = currentTeacherId();
  if ((state.confirmationStages[teacherId] || 0) === 0) {
    showToast("请先由老师确认本月工作量");
    return;
  }
  state.confirmationStages[teacherId] = 3;
  showToast("教务和总校审批完成，已交财务结算");
  render();
});

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.financeGroup) return;
    state.taskFilter = button.dataset.filter;
    renderTasks();
  });
});

document.querySelectorAll("[data-finance-group]").forEach((button) => {
  button.addEventListener("click", () => {
    state.financeGroupBy = button.dataset.financeGroup;
    renderFinanceDashboard();
  });
});

document.querySelector("#financeTeacherSearchButton").addEventListener("click", () => {
  financeTeacherPage.search = document.querySelector("#financeTeacherSearch").value.trim();
  financeTeacherPage.pageSize = Number.parseInt(document.querySelector("#financeTeacherPageSize").value, 10);
  loadFinanceTeacherPage({ page: 1 });
});

document.querySelector("#financeTeacherSearch").addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  financeTeacherPage.search = event.currentTarget.value.trim();
  financeTeacherPage.pageSize = Number.parseInt(document.querySelector("#financeTeacherPageSize").value, 10);
  loadFinanceTeacherPage({ page: 1 });
});

document.querySelector("#financeTeacherPageSize").addEventListener("change", (event) => {
  financeTeacherPage.pageSize = Number.parseInt(event.target.value, 10);
  loadFinanceTeacherPage({ page: 1 });
});

document.querySelector("#financePrevPage").addEventListener("click", () => {
  const nextPage = Math.max((financeTeacherPage.meta?.page || financeTeacherPage.page) - 1, 1);
  loadFinanceTeacherPage({ page: nextPage });
});

document.querySelector("#financeNextPage").addEventListener("click", () => {
  const meta = financeTeacherPage.meta || { page: 1, totalPages: 1 };
  const nextPage = Math.min((meta.page || 1) + 1, meta.totalPages || 1);
  loadFinanceTeacherPage({ page: nextPage });
});

document.querySelector("#qrLessonSelect").addEventListener("change", (event) => {
  state.scannerLessonId = event.target.value;
  renderScanner();
});

document.querySelector("#scheduleWeekSelect").addEventListener("change", (event) => {
  state.selectedScheduleWeekStart = event.target.value;
  renderSchedule();
});

document.querySelector("#adminDivisionSelect").addEventListener("change", async (event) => {
  applySchedulingSelection(event.target.value);
  if (backendMode() && currentRole() === "admin") {
    await loadBackendSchedulingContext();
  } else {
    render();
  }
});

document.querySelector("#adminGradeSelect").addEventListener("change", async (event) => {
  applySchedulingSelection(state.selectedSchedulingDivisionId, event.target.value);
  if (backendMode() && currentRole() === "admin") {
    await loadBackendSchedulingContext();
  } else {
    render();
  }
});

document.querySelector("#adminClassSelect").addEventListener("change", (event) => {
  state.selectedSchedulingClassId = event.target.value;
  renderAdminScheduling();
});

document.querySelector("#simulateQrRead").addEventListener("click", () => {
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) return;
  const action = actionForLesson(lesson);
  handleDecodedScan(buildQrPayload(lesson), {
    action,
    lessonId: lesson.id,
    nowText: demoTimeForAction(lesson, action),
  });
});

document.querySelector("#simulateOutOfWindowQr").addEventListener("click", () => {
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) return;
  const originalNow = state.demoNow;
  state.demoNow = "2026-06-09T12:30:00+08:00";
  handleDecodedScan(buildQrPayload(lesson), {
    action: actionForLesson(lesson),
    lessonId: lesson.id,
    nowText: state.demoNow,
  });
  state.demoNow = originalNow;
});

document.querySelector("#simulateTamperedQr").addEventListener("click", () => {
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) return;
  const payload = JSON.parse(buildQrPayload(lesson));
  payload.room = "X999";
  handleDecodedScan(JSON.stringify(payload), {
    action: actionForLesson(lesson),
    lessonId: lesson.id,
    nowText: demoTimeForAction(lesson, actionForLesson(lesson)),
  });
});

document.querySelector("#copyQrText").addEventListener("click", async () => {
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) return;
  const text = buildQrPayload(lesson);
  try {
    await navigator.clipboard.writeText(text);
    showToast("二维码内容已复制");
  } catch (error) {
    state.lastScanText = text;
    showToast("浏览器不允许复制，已显示在最近识别结果");
    renderScanner();
  }
});

document.querySelector("#startScanner").addEventListener("click", startCameraScanner);
document.querySelector("#stopScanner").addEventListener("click", stopCameraScanner);

document.querySelector("#financeTeacherSelect").addEventListener("change", (event) => {
  state.selectedFinanceTeacherId = event.target.value;
  renderFinanceRecords();
});

document.querySelector("#settlementTeacherSelect").addEventListener("change", (event) => {
  state.selectedFinanceTeacherId = event.target.value;
  renderSettlement();
});

document.querySelector("#settleTeacherPayroll").addEventListener("click", () => {
  const teacherId = state.selectedFinanceTeacherId;
  state.settlements[teacherId] = {
    status: "settled",
    settledAt: "2026-06-09 10:30",
  };
  showToast(`${teacherName(teacherId)} 本月工资已结算锁定`);
  render();
});

render();

if (backendMode()) {
  if (currentRole() === "teacher") {
    loadBackendTeacherContext(currentTeacherId(), "2026-06-15").then(render);
  }
  if (currentRole() === "finance") {
    loadFinanceTeacherPage({ page: financeTeacherPage.page });
  }
  if (currentRole() === "admin") {
    loadBackendSchedulingContext();
  }
}
