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
    pe: {
      id: "pe",
      name: "体育",
      weeklyLessons: 2,
      teacherIds: ["SCH-PE01", "SCH-PE02", "SCH-PE03", "SCH-PE04"],
      maxPerClassPerDay: 1,
      allowConsecutive: false,
      preferredDayPart: "afternoon",
    },
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
  const subjects = division.subjectIds.map((subjectId) => {
    const subject = schedulingCatalog.subjects[subjectId];
    const availableTeachers = schedulingCatalog.teachers
      .filter((teacher) => subject.teacherIds.includes(teacher.id))
      .map((teacher) => ({ ...teacher, title: "任课教师", department: division.name }));
    return { ...subject, durationMinutes: subject.durationMinutes || 40, availableTeachers };
  });
  const enabledSubjectIds = new Set(division.subjectIds);
  const courseRules = Object.values(schedulingCatalog.subjects).map((subject) => ({
    id: `CR-${division.id}-${grade.id}-${subject.id}`,
    stageId: division.id,
    grade: grade.id,
    subjectId: subject.id,
    subjectName: subject.name,
    enabled: enabledSubjectIds.has(subject.id),
    weeklyLessons: subject.weeklyLessons || 1,
    durationMinutes: subject.durationMinutes || 40,
    maxPerClassPerDay: subject.maxPerClassPerDay || 0,
    allowConsecutive: subject.allowConsecutive !== false,
    forbiddenPeriods: Array.isArray(subject.forbiddenPeriods) ? subject.forbiddenPeriods : [],
    preferredDayPart: subject.preferredDayPart || "any",
  }));
  const classes = Array.from({ length: division.classCount }, (_, index) => {
    const roomNumber = String(index + 1).padStart(2, "0");
    const roomName = `${division.roomPrefix}${grade.code.slice(1)}-${roomNumber}`;
    return {
      id: `${grade.code}C${roomNumber}`,
      name: `${grade.name} ${index + 1} 班`,
      room: roomName,
      roomId: `${grade.code}R${roomNumber}`,
    };
  });

  return {
    divisionId: division.id,
    divisionName: division.name,
    gradeId: grade.id,
    gradeName: grade.name,
    weekStart: division.weekStart,
    classCount: division.classCount,
    classes,
    rooms: classes.map((schoolClass) => ({
      id: schoolClass.roomId,
      name: schoolClass.room,
      sourceClassId: schoolClass.id,
    })),
    periods: schedulingCatalog.periods.map((period) => ({ ...period })),
    courseRules,
    constraints: [],
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
  selectedScheduleDate: "2026-06-09",
  selectedSchedulingDivisionId: "elementary",
  selectedSchedulingGradeId: "elementary-g1",
  selectedSchedulingClassId: "P1C01",
  selectedScheduleAssignmentId: "",
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
  backendNotices: [],
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
  { username: "teacher0003", password: "123456", accountId: "teacher-li" },
  { username: "finance", password: "123456", accountId: "finance-zhang" },
  { username: "admin", password: "123456", accountId: "admin-zhou" },
];

let state = loadSavedState();
let sessionAccountId = loadSession();
let backendSession = loadBackendSession();
let qrScanner = null;
let courseRulesEditMode = false;
let teacherWorkloadState = {
  teacherId: "",
  month: "2026-06",
  loading: false,
  loaded: false,
  error: "",
  data: null,
};
let attendanceRecordState = {
  teacherId: "",
  month: "2026-06",
  loading: false,
  loaded: false,
  error: "",
  records: [],
  summary: null,
  teacher: null,
};
let teacherPayrollState = {
  teacherId: "",
  month: "2026-06",
  loading: false,
  loaded: false,
  error: "",
  data: null,
};
let payrollRuleState = {
  loading: false,
  loaded: false,
  error: "",
  rules: null,
};
let financeTeacherPage = {
  items: [],
  meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  page: 1,
  pageSize: 20,
  stageId: "",
  grade: "",
  search: "",
  loaded: false,
  loading: false,
  error: "",
};
const financeStageCatalog = [
  { id: "primary", name: "小学部", grades: [1, 2, 3, 4, 5, 6] },
  { id: "middle", name: "初中部", grades: [7, 8, 9] },
  { id: "high", name: "高中部", grades: [10, 11, 12] },
];
let personnelPage = {
  items: [],
  summary: { total: 0, active: 0, teachers: 0, adminFinance: 0, filtered: 0 },
  meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  page: 1,
  pageSize: 20,
  search: "",
  stageId: "",
  role: "all",
  status: "active",
  loaded: false,
  loading: false,
  error: "",
};
let financeTeacherDetailState = {
  teacherId: "",
  month: "2026-06",
  loading: false,
  loaded: false,
  error: "",
  workload: null,
  payroll: null,
  payrollGenerated: false,
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
let draggedScheduleAssignmentId = "";

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
  personnel: {
    role: "admin",
    title: "人员列表",
    el: document.querySelector("#personnelView"),
  },
  teacherImport: {
    role: "admin",
    title: "教师导入",
    el: document.querySelector("#teacherImportView"),
  },
  notifications: {
    role: "teacher,finance,admin",
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
  teacherPayroll: {
    role: "teacher",
    title: "薪资汇总",
    el: document.querySelector("#teacherPayrollView"),
  },
  finance: {
    role: "finance",
    title: "财务首页",
    el: document.querySelector("#financeView"),
  },
  financeRecords: {
    role: "finance,admin",
    title: "老师考勤记录",
    el: document.querySelector("#financeRecordsView"),
  },
  settlement: {
    role: "finance,admin",
    title: "薪资结算",
    el: document.querySelector("#settlementView"),
  },
  warnings: {
    role: "teacher,finance,admin",
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

function resetTeacherWorkloadState() {
  teacherWorkloadState = {
    teacherId: "",
    month: "2026-06",
    loading: false,
    loaded: false,
    error: "",
    data: null,
  };
}

function resetAttendanceRecordState() {
  attendanceRecordState = {
    teacherId: "",
    month: "2026-06",
    loading: false,
    loaded: false,
    error: "",
    records: [],
    summary: null,
    teacher: null,
  };
}

function resetTeacherPayrollState() {
  teacherPayrollState = {
    teacherId: "",
    month: "2026-06",
    loading: false,
    loaded: false,
    error: "",
    data: null,
  };
}

function resetFinanceTeacherDetailState() {
  financeTeacherDetailState = {
    teacherId: "",
    month: "2026-06",
    loading: false,
    loaded: false,
    error: "",
    workload: null,
    payroll: null,
    payrollGenerated: false,
  };
}

function resetPersonnelPage() {
  personnelPage = {
    ...personnelPage,
    items: [],
    summary: { total: 0, active: 0, teachers: 0, adminFinance: 0, filtered: 0 },
    meta: { page: 1, pageSize: personnelPage.pageSize, total: 0, totalPages: 1 },
    page: 1,
    loaded: false,
    loading: false,
    error: "",
  };
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
    grade: teacher.gradeText || teacher.stageName || teacher.department || "未设置年级",
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
    backendId: lesson.id,
    teacherId: lesson.teacherId,
    date: lesson.date,
    time: lesson.time,
    className: lesson.className,
    course: lesson.subjectName,
    roomId: lesson.roomId,
    room: lesson.room || lesson.roomId,
    type: lesson.type || "regular",
    units: lesson.units || 1,
    status: lesson.status,
    scanTime: lesson.checkInAt ? lesson.checkInAt.slice(11, 16) : "",
    checkInTime: lesson.checkInAt ? lesson.checkInAt.slice(11, 16) : "",
    checkOutTime: lesson.checkOutAt ? lesson.checkOutAt.slice(11, 16) : "",
    note:
      lesson.attendanceNote ||
      (lesson.status === "completed" ? "后端接口：签入签出完成" : "后端接口：等待后续签入签出"),
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
  const source = state.backendNotices?.length ? state.backendNotices : state.notices || [];
  return source
    .filter((notice) => notice.audience === role || notice.audience === "all")
    .sort((a, b) => b.time.localeCompare(a.time));
}

function backendNotificationToNotice(notification) {
  return {
    id: notification.id,
    audience: notification.audience,
    source: notification.source || "系统",
    title: notification.title,
    text: notification.text,
    time: String(notification.createdAt || "").replace("T", " ").slice(0, 16),
    level: notification.level || "info",
    read: Boolean(notification.read),
  };
}

async function loadBackendNotifications() {
  if (!backendMode()) return;
  try {
    const result = await apiRequest("/api/notifications");
    state.backendNotices = (result.items || []).map(backendNotificationToNotice);
  } catch (error) {
    console.warn("通知读取失败", error);
  }
}

async function markBackendNoticeRead(noticeId) {
  if (!backendMode() || !noticeId) return;
  try {
    const result = await apiRequest(`/api/notifications/${encodeURIComponent(noticeId)}/read`, {
      method: "POST",
    });
    const next = backendNotificationToNotice(result.notification);
    state.backendNotices = state.backendNotices.map((notice) => (notice.id === noticeId ? next : notice));
  } catch (error) {
    console.warn("通知已读失败", error);
  }
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

function scheduleSolverSummaryText(draft) {
  const solver = draft.solver || null;
  if (!solver?.algorithm) {
    return `已通过：当前课表无内部冲突，并已纳入 ${draft.globalBusyCount || 0} 个老师全局占用。`;
  }
  if (solver.algorithm === "ortools-cp-sat") {
    return `OR-Tools CP-SAT：${solver.generatedLessonCount || draft.generatedLessonCount || 0}/${solver.requiredLessonCount || draft.requiredLessonCount || 0} 节，未排 ${solver.unassignedCount || 0}，状态 ${solver.status || "UNKNOWN"}，目标值 ${solver.objectiveValue || 0}，求解 ${Number(solver.solveTimeSeconds || 0).toFixed(2)} 秒；已纳入 ${draft.globalBusyCount || 0} 个老师全局占用。`;
  }
  return `高级约束搜索：${solver.generatedLessonCount || draft.generatedLessonCount || 0}/${solver.requiredLessonCount || draft.requiredLessonCount || 0} 节，未排 ${solver.unassignedCount || 0}，搜索 ${solver.attemptsRun || 0} 轮/${solver.totalNodes || 0} 个节点，评分 ${solver.score || 0}；已纳入 ${draft.globalBusyCount || 0} 个老师全局占用。`;
}

function buildSubjectQueueFromCounters(classIndex, counters) {
  const targetCount = Array.from(counters.values()).reduce((sum, count) => sum + Math.max(count, 0), 0);
  const queue = [];
  let round = 0;
  while (queue.length < targetCount) {
    let pushed = 0;
    state.schedulingConfig.subjects.forEach((subject, subjectIndex) => {
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

function buildClassSubjectQueue(classIndex) {
  const counters = new Map(
    state.schedulingConfig.subjects.map((subject) => [subject.id, subject.weeklyLessons]),
  );
  return buildSubjectQueueFromCounters(classIndex, counters);
}

function countClassSubjectOnDay(assignments, classId, subjectId, date) {
  return assignments.filter(
    (assignment) =>
      assignment.classId === classId &&
      assignment.subjectId === subjectId &&
      assignment.date === date,
  ).length;
}

function normalizeCourseRuleMaxPerDay(value) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return 0;
  return Math.min(Math.max(number, 0), state.schedulingConfig.periods?.length || 6);
}

function normalizeCourseRulePeriods(value) {
  const raw = Array.isArray(value) ? value : String(value || "").split(/[,\s，、]+/);
  return Array.from(
    new Set(
      raw
        .map((item) => Number.parseInt(item, 10))
        .filter((number) => Number.isFinite(number) && number >= 1 && number <= (state.schedulingConfig.periods?.length || 6)),
    ),
  ).sort((a, b) => a - b);
}

function normalizePreferredDayPart(value) {
  return ["any", "morning", "afternoon"].includes(value) ? value : "any";
}

function periodDayPart(period) {
  return Number(period) <= 4 ? "morning" : "afternoon";
}

function localSubjectRuleFor(subjectId) {
  return (state.schedulingConfig.subjects || []).find((subject) => subject.id === subjectId) || null;
}

function subjectRulePreferencePenalty(subject, period) {
  if (!subject?.preferredDayPart || subject.preferredDayPart === "any") return 0;
  return periodDayPart(period) === subject.preferredDayPart ? -2 : 10;
}

function localSubjectRuleViolation(subjectId, slot, assignments = [], classId = "") {
  const subject = localSubjectRuleFor(subjectId);
  if (!subject) return null;
  const period = Number(slot.period);
  if ((subject.forbiddenPeriods || []).map(Number).includes(period)) {
    return {
      type: "subject-forbidden-period",
      title: `${subject.name} 命中课程禁排节次`,
      text: `${subject.name} 已设置禁排第 ${period} 节，${scheduleConstraintDayText([Number(slot.dayIndex)])}第 ${period} 节不可排。`,
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
      title: `${subject.name} 超过每日上限`,
      text: `${subject.name} 已设置每班每天最多 ${maxPerClassPerDay} 节，继续排入会超过上限。`,
    };
  }
  if (subject.allowConsecutive === false) {
    const adjacent = sameClassSubjectDayItems.find(
      (assignment) => Math.abs(Number(assignment.period) - period) === 1,
    );
    if (adjacent) {
      return {
        type: "subject-consecutive",
        title: `${subject.name} 不允许同班连堂`,
        text: `${subject.name} 已设置不允许同班连堂，第 ${adjacent.period} 节旁边不能再排第 ${period} 节。`,
      };
    }
  }
  return null;
}

function slotKeyFor(date, period) {
  return `${date}-${period}`;
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

function nextScheduleAssignmentId(usedIds, classId, subjectId, nextIndex) {
  let index = nextIndex;
  let id = `SCH-${classId}-${subjectId}-${index}`;
  while (usedIds.has(id)) {
    index += 1;
    id = `SCH-${classId}-${subjectId}-${index}`;
  }
  usedIds.add(id);
  return { id, index };
}

function normalizeLockedLocalAssignment(assignment) {
  const schoolClass = state.schedulingConfig.classes.find((item) => item.id === assignment.classId);
  const period = state.schedulingConfig.periods.find((item) => item.period === assignment.period);
  const room = roomById(assignment.roomId) || roomById(schoolClass?.roomId);
  return {
    ...assignment,
    className: assignment.className || schoolClass?.name || assignment.classId,
    teacherName: assignment.teacherName || schedulingTeacherName(assignment.teacherId),
    dayIndex: weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5).indexOf(assignment.date),
    time: assignment.time || period?.time || "",
    roomId: room?.id || assignment.roomId || schoolClass?.roomId || "",
    room: room?.name || assignment.room || schoolClass?.room || "",
    locked: true,
  };
}

function generateScheduleAssignments(options = {}) {
  const config = state.schedulingConfig;
  const slots = schedulingSlots();
  const assignments = (options.lockedAssignments || [])
    .filter((assignment) => assignment.locked)
    .map(normalizeLockedLocalAssignment);
  const teacherBusy = new Map();
  const classBusy = new Map();
  const roomBusy = new Map();
  const teacherLoad = new Map(config.teachers.map((teacher) => [teacher.id, 0]));
  const usedIds = new Set(assignments.map((assignment) => assignment.id));

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
    const subjectQueue = buildSubjectQueueFromCounters(classIndex, counters);

    subjectQueue.forEach((subject) => {
      let best = null;

      slots.forEach((slot) => {
        if (classBusy.get(schoolClass.id).has(slot.slotKey)) return;
        const busyRooms = roomBusy.get(schoolClass.roomId) || new Set();
        if (busyRooms.has(slot.slotKey)) return;
        if (localScheduleConstraintViolation(subject.id, slot)) return;
        if (localSubjectRuleViolation(subject.id, slot, assignments, schoolClass.id)) return;
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
      const nextId = nextScheduleAssignmentId(usedIds, schoolClass.id, subject.id, lessonNumber);
      existingCounts.set(countKey, nextId.index);
      const teacherNameText = schedulingTeacherName(best.teacherId);
      const assignment = {
        id: nextId.id,
        classId: schoolClass.id,
        className: schoolClass.name,
        subjectId: subject.id,
        subjectName: subject.name,
        durationMinutes: subject.durationMinutes || 40,
        teacherId: best.teacherId,
        teacherName: teacherNameText,
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

function validateScheduleConflicts(assignments) {
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

    const dayIndex = Number.isFinite(Number(assignment.dayIndex))
      ? Number(assignment.dayIndex)
      : weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5).indexOf(assignment.date);
    const violation = localScheduleConstraintViolation(assignment.subjectId, {
      ...assignment,
      dayIndex,
    });
    if (violation) {
      conflicts.push({
        type: "constraint",
        title: `${assignment.subjectName} 命中自定义硬约束`,
        text: `${formatDate(assignment.date)} 第 ${assignment.period} 节 ${assignment.time}：${assignment.className} ${violation.subjectName || assignment.subjectName} 不能出现在 ${scheduleConstraintDayText(violation.dayIndexes)} ${scheduleConstraintPeriodText(violation.periods)}`,
      });
    }
    const subjectRuleViolation = localSubjectRuleViolation(
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

function financeGradeLabel(grade) {
  const number = Number(grade);
  const names = ["", "一", "二", "三", "四", "五", "六"];
  if (number >= 10) return `高${names[number - 9] || number - 9}`;
  if (number >= 7) return `初${names[number - 6] || number - 6}`;
  if (number > 0) return `${names[number] || number}年级`;
  return "全部年级";
}

function financeStageOptions(selectedId = "") {
  return [
    `<option value="" ${selectedId ? "" : "selected"}>全部学部</option>`,
    ...financeStageCatalog.map(
      (stage) => `<option value="${stage.id}" ${stage.id === selectedId ? "selected" : ""}>${stage.name}</option>`,
    ),
  ].join("");
}

function financeGradeOptions(stageId = "", selectedGrade = "") {
  const stage = financeStageCatalog.find((item) => item.id === stageId);
  const grades = stage
    ? stage.grades
    : financeStageCatalog.flatMap((item) => item.grades);
  return [
    `<option value="" ${selectedGrade ? "" : "selected"}>${stage ? "全部年级" : "全部年级"}</option>`,
    ...grades.map(
      (grade) => `<option value="${grade}" ${String(grade) === String(selectedGrade) ? "selected" : ""}>${financeGradeLabel(grade)}</option>`,
    ),
  ].join("");
}

function financeFilteredTeacherItems() {
  if (backendMode() && financeTeacherPage.loaded) return financeTeacherPage.items;
  return state.teachers.filter((teacher) => {
    if (financeTeacherPage.stageId) {
      const stage = financeStageCatalog.find((item) => item.id === financeTeacherPage.stageId);
      if (stage && backendTeacherDepartment(teacher) !== stage.name) return false;
    }
    if (financeTeacherPage.search) {
      const text = [teacher.id, teacher.name, teacher.department, teacher.subject, teacher.grade].join(" ").toLowerCase();
      if (!text.includes(financeTeacherPage.search.toLowerCase())) return false;
    }
    return true;
  });
}

function financeTeacherSelectOptions(selectedId = "") {
  const teachers = financeFilteredTeacherItems();
  if (!teachers.length) return `<option value="">当前筛选下无老师</option>`;
  return teachers
    .map(
      (teacher) => `
        <option value="${teacher.id}" ${teacher.id === selectedId ? "selected" : ""}>
          ${teacher.name} · ${backendTeacherDepartment(teacher)} · ${financeTeacherPage.grade ? financeGradeLabel(financeTeacherPage.grade) : teacher.gradeText || teacher.grade || "年级未设置"} · ${backendTeacherSubject(teacher)}
        </option>
      `,
    )
    .join("");
}

function renderFinanceTeacherFilters(context = "overview") {
  const map = {
    overview: {
      stage: "#financeStageFilter",
      grade: "#financeGradeFilter",
      search: "#financeTeacherSearch",
      pageSize: "#financeTeacherPageSize",
    },
    records: {
      stage: "#financeRecordsStageFilter",
      grade: "#financeRecordsGradeFilter",
      search: "#financeRecordsSearch",
      teacher: "#financeTeacherSelect",
    },
    settlement: {
      stage: "#settlementStageFilter",
      grade: "#settlementGradeFilter",
      search: "#settlementTeacherSearch",
      teacher: "#settlementTeacherSelect",
    },
  }[context];
  if (!map) return;

  const stage = document.querySelector(map.stage);
  const grade = document.querySelector(map.grade);
  const search = document.querySelector(map.search);
  const teacher = map.teacher ? document.querySelector(map.teacher) : null;
  const pageSize = map.pageSize ? document.querySelector(map.pageSize) : null;

  if (stage) stage.innerHTML = financeStageOptions(financeTeacherPage.stageId);
  if (grade) grade.innerHTML = financeGradeOptions(financeTeacherPage.stageId, financeTeacherPage.grade);
  if (search) search.value = financeTeacherPage.search;
  if (pageSize) pageSize.value = String(financeTeacherPage.pageSize);
  if (teacher) teacher.innerHTML = financeTeacherSelectOptions(state.selectedFinanceTeacherId);
}

function financeReadFilterInputs(context = "overview") {
  const map = {
    overview: {
      stage: "#financeStageFilter",
      grade: "#financeGradeFilter",
      search: "#financeTeacherSearch",
      pageSize: "#financeTeacherPageSize",
    },
    records: {
      stage: "#financeRecordsStageFilter",
      grade: "#financeRecordsGradeFilter",
      search: "#financeRecordsSearch",
    },
    settlement: {
      stage: "#settlementStageFilter",
      grade: "#settlementGradeFilter",
      search: "#settlementTeacherSearch",
    },
  }[context];
  if (!map) return {};
  const stageId = document.querySelector(map.stage)?.value || "";
  const grade = stageId ? document.querySelector(map.grade)?.value || "" : "";
  const search = document.querySelector(map.search)?.value.trim() || "";
  const pageSizeValue = map.pageSize ? Number.parseInt(document.querySelector(map.pageSize)?.value || "", 10) : financeTeacherPage.pageSize;
  return {
    stageId,
    grade,
    search,
    pageSize: Number.isFinite(pageSizeValue) ? pageSizeValue : financeTeacherPage.pageSize,
  };
}

function backendFinanceGroupKey(teacher) {
  if (state.financeGroupBy === "subject") return backendTeacherSubject(teacher);
  if (state.financeGroupBy === "grade") return teacher.gradeText || teacher.grade || "未设置年级";
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
    const schedule = await apiRequest(`/api/teachers/${teacherId}/schedule?weekStart=${weekStart}`);
    state.selectedScheduleWeekStart = schedule.weekStart || weekStart;
    if (schedule.teacher) upsertTeacher(schedule.teacher);
    mergeBackendLessons(teacherId, schedule.lessons || []);
  } catch (error) {
    showToast(error.message || "老师课表加载失败");
  }
}

async function loadBackendWorkload(teacherId = currentTeacherId(), month = "2026-06") {
  if (!backendMode() || !teacherId) return;
  teacherWorkloadState = {
    ...teacherWorkloadState,
    teacherId,
    month,
    loading: true,
    error: "",
  };

  try {
    const data = await apiRequest(`/api/teachers/${teacherId}/workload?month=${month}`);
    teacherWorkloadState = {
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: "",
      data,
    };
  } catch (error) {
    teacherWorkloadState = {
      ...teacherWorkloadState,
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: error.message || "月度工作内容加载失败",
      data: null,
    };
  }

  if (state.activeView === "confirm") {
    render();
  }
}

async function loadBackendAttendanceRecords(teacherId = currentTeacherId(), month = "2026-06") {
  if (!backendMode() || !teacherId) return;
  attendanceRecordState = {
    ...attendanceRecordState,
    teacherId,
    month,
    loading: true,
    error: "",
  };

  try {
    const data = await apiRequest(`/api/teachers/${teacherId}/attendance-records?month=${month}`);
    attendanceRecordState = {
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: "",
      records: data.records || [],
      summary: data.summary || null,
      teacher: data.teacher || null,
    };
  } catch (error) {
    attendanceRecordState = {
      ...attendanceRecordState,
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: error.message || "考勤记录加载失败",
    };
  }

  if (["records", "financeRecords", "warnings"].includes(state.activeView)) {
    render();
  }
}

function ensureBackendAttendanceRecords(teacherId, month = "2026-06") {
  const needsRecords =
    attendanceRecordState.teacherId !== teacherId ||
    attendanceRecordState.month !== month ||
    !attendanceRecordState.loaded;
  if (!attendanceRecordState.loading && needsRecords) {
    loadBackendAttendanceRecords(teacherId, month);
  }
}

async function loadBackendTeacherPayroll(teacherId = currentTeacherId(), month = "2026-06") {
  if (!backendMode() || !teacherId) return;
  teacherPayrollState = {
    ...teacherPayrollState,
    teacherId,
    month,
    loading: true,
    error: "",
  };

  try {
    const data = await apiRequest(`/api/teachers/${teacherId}/payroll?month=${month}`);
    teacherPayrollState = {
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: "",
      data,
    };
  } catch (error) {
    teacherPayrollState = {
      ...teacherPayrollState,
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: error.message || "总薪资加载失败",
      data: null,
    };
  }

  if (["dashboard", "confirm", "teacherPayroll"].includes(state.activeView)) render();
}

function ensureBackendTeacherPayroll(teacherId, month = "2026-06") {
  const needsPayroll =
    teacherPayrollState.teacherId !== teacherId ||
    teacherPayrollState.month !== month ||
    !teacherPayrollState.loaded;
  if (!teacherPayrollState.loading && needsPayroll) {
    loadBackendTeacherPayroll(teacherId, month);
  }
}

async function loadPayrollRules() {
  if (!backendMode() || !["finance", "admin"].includes(currentRole())) return;
  payrollRuleState = { ...payrollRuleState, loading: true, error: "" };
  try {
    const data = await apiRequest("/api/payroll-rules");
    payrollRuleState = {
      loading: false,
      loaded: true,
      error: "",
      rules: data.payrollRules || null,
    };
  } catch (error) {
    payrollRuleState = {
      ...payrollRuleState,
      loading: false,
      loaded: true,
      error: error.message || "薪资规则加载失败",
    };
  }
  if (state.activeView === "settlement") renderSettlement();
}

function payrollRulesFromInputs() {
  return {
    baseSalary: Number(document.querySelector("#ruleBaseSalary").value || 0),
    positionSalary: Number(document.querySelector("#rulePositionSalary").value || 0),
    regular: Number(document.querySelector("#ruleRegular").value || 0),
    morning: Number(document.querySelector("#ruleMorning").value || 0),
    evening: Number(document.querySelector("#ruleEvening").value || 0),
    weekend: Number(document.querySelector("#ruleWeekend").value || 0),
    makeup: Number(document.querySelector("#ruleMakeup").value || 0),
    taxThreshold: Number(document.querySelector("#ruleTaxThreshold").value || 0),
    taxRate: Number(document.querySelector("#ruleTaxRate").value || 0),
  };
}

async function saveBackendPayrollRules() {
  if (!backendMode() || currentRole() !== "finance") {
    showToast("请使用后端财务账号保存薪资规则");
    return;
  }
  payrollRuleState = { ...payrollRuleState, loading: true, error: "" };
  renderSettlement();
  try {
    const data = await apiRequest("/api/payroll-rules", {
      method: "PATCH",
      body: { payrollRules: payrollRulesFromInputs() },
    });
    payrollRuleState = {
      loading: false,
      loaded: true,
      error: "",
      rules: data.payrollRules,
    };
    resetFinanceTeacherDetailState();
    teacherPayrollState.loaded = false;
    financeTeacherPage.loaded = false;
    showToast("薪资规则已保存，薪资试算会按新规则刷新");
  } catch (error) {
    payrollRuleState = {
      ...payrollRuleState,
      loading: false,
      loaded: true,
      error: error.message || "薪资规则保存失败",
    };
    showToast(payrollRuleState.error);
  }
  render();
}

async function reviewBackendPayroll() {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || currentRole() !== "finance" || !teacherId) return;
  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  renderSettlement();
  try {
    const payroll = await apiRequest(`/api/teachers/${teacherId}/payroll/review`, {
      method: "POST",
      body: { month: "2026-06" },
    });
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      loading: false,
      loaded: true,
      error: "",
      payroll,
      payrollGenerated: true,
    };
    financeTeacherPage.loaded = false;
    showToast("财务复核已通过，可以锁定该老师工资");
  } catch (error) {
    financeTeacherDetailState = { ...financeTeacherDetailState, loading: false, error: error.message || "财务复核失败" };
    showToast(financeTeacherDetailState.error);
  }
  render();
}

async function lockBackendPayroll() {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || currentRole() !== "finance" || !teacherId) return;
  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  renderSettlement();
  try {
    const payroll = await apiRequest(`/api/teachers/${teacherId}/payroll/lock`, {
      method: "POST",
      body: { month: "2026-06" },
    });
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      loading: false,
      loaded: true,
      error: "",
      payroll,
      payrollGenerated: true,
    };
    financeTeacherPage.loaded = false;
    showToast("该老师本月工资已锁定");
  } catch (error) {
    financeTeacherDetailState = { ...financeTeacherDetailState, loading: false, error: error.message || "工资锁定失败" };
    showToast(financeTeacherDetailState.error);
  }
  render();
}

async function batchGenerateBackendPayroll() {
  if (!backendMode() || currentRole() !== "finance") return;
  try {
    const result = await apiRequest("/api/payroll/batch-generate", {
      method: "POST",
      body: { month: "2026-06" },
    });
    financeTeacherPage.loaded = false;
    resetFinanceTeacherDetailState();
    showToast(`已批量生成 ${result.successCount} 份薪资明细，失败 ${result.failedCount} 份`);
    render();
  } catch (error) {
    showToast(error.message || "批量生成薪资失败");
  }
}

async function exportBackendPayrollCsv() {
  if (!backendMode() || currentRole() !== "finance") return;
  try {
    const params = new URLSearchParams({ month: "2026-06" });
    if (financeTeacherPage.stageId) params.set("stageId", financeTeacherPage.stageId);
    if (financeTeacherPage.grade) params.set("grade", financeTeacherPage.grade);
    if (financeTeacherPage.search) params.set("search", financeTeacherPage.search);
    const result = await apiRequest(`/api/payroll/export?${params.toString()}`);
    const blob = new Blob([result.content || ""], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename || "teacher-payroll-2026-06.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(`已导出 ${result.total || 0} 份工资明细`);
  } catch (error) {
    showToast(error.message || "工资明细导出失败");
  }
}

function backendWorkloadStage(data) {
  const status = data?.confirmation?.status || "";
  if (status === "locked") return 3;
  if (status === "school_approved") return 3;
  if (status === "academic_approved") return 2;
  if (status === "teacher_confirmed") return 1;
  return 0;
}

async function confirmBackendWorkload(teacherId = currentTeacherId(), month = "2026-06") {
  if (!backendMode() || currentRole() !== "teacher" || !teacherId) return;
  teacherWorkloadState = {
    ...teacherWorkloadState,
    teacherId,
    month,
    loading: true,
    error: "",
  };
  render();

  try {
    const data = await apiRequest(`/api/teachers/${teacherId}/workload/confirm`, {
      method: "POST",
      body: { month },
    });
    teacherWorkloadState = {
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: "",
      data,
    };
    state.confirmationStages[teacherId] = backendWorkloadStage(data);
    resetTeacherPayrollState();
    const pendingCount = data.summary?.pendingCount || 0;
    showToast(pendingCount > 0 ? "已确认，未完成考勤项目暂不计入工资" : "本月工作量已确认");
  } catch (error) {
    teacherWorkloadState = {
      ...teacherWorkloadState,
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: error.message || "月度工作量确认失败",
    };
    showToast(error.message || "月度工作量确认失败");
  }

  render();
}

async function approveBackendWorkload(step) {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || currentRole() !== "admin" || !teacherId) {
    showToast("请使用行政账号审批工作量");
    return;
  }
  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  renderSettlement();
  try {
    const workload = await apiRequest(`/api/teachers/${teacherId}/workload/approve`, {
      method: "POST",
      body: { month: "2026-06", step },
    });
    const payroll = await apiRequest(`/api/teachers/${teacherId}/payroll?month=2026-06`);
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      teacherId,
      month: "2026-06",
      loading: false,
      loaded: true,
      error: "",
      workload,
      payroll,
      payrollGenerated: Boolean(payroll.generated),
    };
    state.confirmationStages[teacherId] = backendWorkloadStage(workload);
    financeTeacherPage.loaded = false;
    showToast(step === "academic" ? "教务审批已通过" : "总校审批已通过");
  } catch (error) {
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      loading: false,
      loaded: true,
      error: error.message || "工作量审批失败",
    };
    showToast(financeTeacherDetailState.error);
  }
  render();
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
  if (financeTeacherPage.stageId) params.set("stageId", financeTeacherPage.stageId);
  if (financeTeacherPage.grade) params.set("grade", financeTeacherPage.grade);
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
      resetFinanceTeacherDetailState();
      resetAttendanceRecordState();
      state.selectedFinanceTeacherId = financeTeacherPage.items[0]?.id || "";
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

async function loadPersonnelPage(overrides = {}) {
  if (!backendMode()) return;
  personnelPage = {
    ...personnelPage,
    ...overrides,
    loading: true,
    error: "",
  };
  const params = new URLSearchParams({
    page: String(personnelPage.page),
    pageSize: String(personnelPage.pageSize),
    status: personnelPage.status,
    role: personnelPage.role,
  });
  if (personnelPage.search) params.set("search", personnelPage.search);
  if (personnelPage.stageId) params.set("stageId", personnelPage.stageId);

  try {
    const result = await apiRequest(`/api/personnel?${params.toString()}`);
    personnelPage = {
      ...personnelPage,
      items: result.items || [],
      summary: result.summary || personnelPage.summary,
      meta: result.meta || personnelPage.meta,
      page: result.meta?.page || personnelPage.page,
      pageSize: result.meta?.pageSize || personnelPage.pageSize,
      loaded: true,
      loading: false,
      error: "",
    };
  } catch (error) {
    personnelPage = {
      ...personnelPage,
      loaded: true,
      loading: false,
      error: error.message || "人员列表加载失败",
    };
  }

  if (state.activeView === "personnel") {
    render();
  }
}

async function loadFinanceTeacherDetail(
  teacherId = state.selectedFinanceTeacherId,
  { month = "2026-06", generatePayroll = false } = {},
) {
  if (!backendMode() || !["finance", "admin"].includes(currentRole()) || !teacherId) return;
  financeTeacherDetailState = {
    ...financeTeacherDetailState,
    teacherId,
    month,
    loading: true,
    error: "",
  };

  try {
    const workload = await apiRequest(`/api/teachers/${teacherId}/workload?month=${month}`);
    const payroll = generatePayroll
      ? await apiRequest(`/api/teachers/${teacherId}/payroll/generate`, {
          method: "POST",
          body: { month },
        })
      : await apiRequest(`/api/teachers/${teacherId}/payroll?month=${month}`);
    financeTeacherDetailState = {
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: "",
      workload,
      payroll,
      payrollGenerated: Boolean(payroll.generated),
    };
    state.confirmationStages[teacherId] = backendWorkloadStage(workload);
  } catch (error) {
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: error.message || "财务详情加载失败",
    };
  }

  if (["financeRecords", "settlement"].includes(state.activeView)) {
    render();
  }
}

function ensureFinanceTeacherDetail(teacherId, { generatePayroll = false } = {}) {
  const month = "2026-06";
  const needsDetail =
    financeTeacherDetailState.teacherId !== teacherId ||
    financeTeacherDetailState.month !== month ||
    !financeTeacherDetailState.loaded;
  const needsGeneratedPayroll = generatePayroll && !financeTeacherDetailState.payrollGenerated;

  if (!financeTeacherDetailState.loading && (needsDetail || needsGeneratedPayroll)) {
    loadFinanceTeacherDetail(teacherId, { month, generatePayroll });
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
        : `${result.draft?.solver?.algorithm === "ortools-cp-sat" ? "CP-SAT" : "高级算法"}已生成 ${result.draft?.generatedLessonCount || 0} 节无冲突课表`,
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
    await loadBackendNotifications();
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

function collectCourseRulesFromForm() {
  return Array.from(document.querySelectorAll("[data-course-rule-id]")).map((row) => {
    const subjectId = row.dataset.courseRuleId;
    return {
      subjectId,
      enabled: true,
      weeklyLessons: Number.parseInt(document.querySelector(`[data-course-rule-weekly="${subjectId}"]`)?.value || "0", 10),
      durationMinutes: Number.parseInt(document.querySelector(`[data-course-rule-duration="${subjectId}"]`)?.value || "40", 10),
      maxPerClassPerDay: normalizeCourseRuleMaxPerDay(
        document.querySelector(`[data-course-rule-max-day="${subjectId}"]`)?.value || "0",
      ),
      allowConsecutive:
        (document.querySelector(`[data-course-rule-consecutive="${subjectId}"]`)?.value || "true") === "true",
      forbiddenPeriods: normalizeCourseRulePeriods(
        document.querySelector(`[data-course-rule-forbidden-periods="${subjectId}"]`)?.value || "",
      ),
      preferredDayPart: normalizePreferredDayPart(
        document.querySelector(`[data-course-rule-preferred-day-part="${subjectId}"]`)?.value || "any",
      ),
    };
  });
}

function localSubjectFromCourseRule(rule) {
  const subject = schedulingCatalog.subjects[rule.subjectId];
  if (!subject || !rule.enabled || rule.weeklyLessons <= 0) return null;
  const availableTeachers = schedulingCatalog.teachers
    .filter((teacher) => subject.teacherIds.includes(teacher.id))
    .map((teacher) => ({ ...teacher, title: "任课教师", department: state.schedulingConfig.divisionName }));
  return {
    ...subject,
    weeklyLessons: rule.weeklyLessons,
    durationMinutes: rule.durationMinutes,
    maxPerClassPerDay: normalizeCourseRuleMaxPerDay(rule.maxPerClassPerDay || 0),
    allowConsecutive: rule.allowConsecutive !== false,
    forbiddenPeriods: normalizeCourseRulePeriods(rule.forbiddenPeriods || []),
    preferredDayPart: normalizePreferredDayPart(rule.preferredDayPart || "any"),
    availableTeachers,
  };
}

function applyLocalCourseRules(rules) {
  state.schedulingConfig.courseRules = state.schedulingConfig.courseRules.map((rule) => ({
    ...rule,
    ...(rules.find((item) => item.subjectId === rule.subjectId) || {}),
  }));
  state.schedulingConfig.subjects = state.schedulingConfig.courseRules
    .map(localSubjectFromCourseRule)
    .filter(Boolean);
  state.schedulingDraft = {
    ...clone(initialState.schedulingDraft),
    divisionId: state.schedulingConfig.divisionId,
    gradeId: state.schedulingConfig.gradeId,
  };
}

function resetCourseDraftAfterConfigChange() {
  state.schedulingDraft = {
    ...clone(initialState.schedulingDraft),
    divisionId: state.schedulingConfig.divisionId,
    gradeId: state.schedulingConfig.gradeId,
  };
}

async function saveAdminCourseRules() {
  const rules = collectCourseRulesFromForm();
  if (!rules.some((rule) => rule.enabled && rule.weeklyLessons > 0)) {
    showToast("请至少启用 1 门课程并设置周课时");
    return;
  }

  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const result = await apiRequest("/api/scheduling/course-rules", {
        method: "POST",
        body: {
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          rules,
        },
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { loaded: true, loading: false, error: "" };
      showToast("课程规则已保存，重新生成排课时生效");
    } catch (error) {
      schedulingBackendState = {
        loaded: true,
        loading: false,
        error: error.message || "课程规则保存失败",
      };
      showToast(schedulingBackendState.error);
    }
    render();
    return;
  }

  applyLocalCourseRules(rules);
  showToast("课程规则已保存到本地演示");
  render();
}

function createLocalSubjectId() {
  let id = `custom-${Date.now().toString(36)}`;
  let index = 1;
  while (schedulingCatalog.subjects[id]) {
    id = `custom-${Date.now().toString(36)}-${index}`;
    index += 1;
  }
  return id;
}

function applyLocalGradeCourse(subjectName, weeklyLessons, durationMinutes) {
  const normalizedName = subjectName.trim().replace(/\s+/g, "");
  const existingSubject =
    Object.values(schedulingCatalog.subjects).find((subject) => subject.name === normalizedName) || null;
  const subject =
    existingSubject ||
    {
      id: createLocalSubjectId(),
      name: normalizedName,
      weeklyLessons,
      durationMinutes,
      teacherIds: [],
      custom: true,
      maxPerClassPerDay: 0,
      allowConsecutive: true,
      forbiddenPeriods: [],
      preferredDayPart: "any",
    };
  if (!existingSubject) schedulingCatalog.subjects[subject.id] = subject;
  const existingRule = state.schedulingConfig.courseRules.find((rule) => rule.subjectId === subject.id);
  const nextRule = {
    id: `LOCAL-CR-${state.schedulingConfig.divisionId}-${state.schedulingConfig.gradeId}-${subject.id}`,
    stageId: state.schedulingConfig.divisionId,
    grade: state.schedulingConfig.gradeId,
    subjectId: subject.id,
    subjectName: subject.name,
    enabled: true,
    weeklyLessons,
    durationMinutes,
    maxPerClassPerDay: existingRule?.maxPerClassPerDay || subject.maxPerClassPerDay || 0,
    allowConsecutive: existingRule?.allowConsecutive ?? subject.allowConsecutive ?? true,
    forbiddenPeriods: existingRule?.forbiddenPeriods || subject.forbiddenPeriods || [],
    preferredDayPart: existingRule?.preferredDayPart || subject.preferredDayPart || "any",
  };
  if (existingRule) {
    Object.assign(existingRule, nextRule);
  } else {
    state.schedulingConfig.courseRules.push(nextRule);
  }
  applyLocalCourseRules([nextRule]);
}

async function addAdminGradeCourse() {
  const subjectName = document.querySelector("#newCourseName").value.trim();
  const weeklyLessons = Number.parseInt(document.querySelector("#newCourseWeekly").value || "0", 10);
  const durationMinutes = Number.parseInt(document.querySelector("#newCourseDuration").value || "40", 10);
  if (!subjectName) {
    showToast("请输入课程名称");
    return;
  }
  if (!Number.isFinite(weeklyLessons) || weeklyLessons <= 0) {
    showToast("每周节数必须大于 0");
    return;
  }

  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const result = await apiRequest("/api/scheduling/courses", {
        method: "POST",
        body: {
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          subjectName,
          weeklyLessons,
          durationMinutes,
        },
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { loaded: true, loading: false, error: "" };
      document.querySelector("#newCourseName").value = "";
      document.querySelector("#newCourseWeekly").value = "2";
      document.querySelector("#newCourseDuration").value = "40";
      showToast("课程已添加到当前年级");
    } catch (error) {
      schedulingBackendState = {
        loaded: true,
        loading: false,
        error: error.message || "课程添加失败",
      };
      showToast(schedulingBackendState.error);
    }
    render();
    return;
  }

  applyLocalGradeCourse(subjectName, weeklyLessons, durationMinutes);
  document.querySelector("#newCourseName").value = "";
  showToast("课程已添加到本地演示");
  render();
}

async function deleteAdminGradeCourse(subjectId) {
  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const params = new URLSearchParams({
        stageId: state.schedulingConfig.stageId,
        grade: String(state.schedulingConfig.grade),
      });
      const result = await apiRequest(`/api/scheduling/courses/${encodeURIComponent(subjectId)}?${params.toString()}`, {
        method: "DELETE",
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { loaded: true, loading: false, error: "" };
      showToast("课程已从当前年级删除");
    } catch (error) {
      schedulingBackendState = {
        loaded: true,
        loading: false,
        error: error.message || "课程删除失败",
      };
      showToast(schedulingBackendState.error);
    }
    render();
    return;
  }

  const rule = state.schedulingConfig.courseRules.find((item) => item.subjectId === subjectId);
  if (rule) rule.enabled = false;
  state.schedulingConfig.constraints = (state.schedulingConfig.constraints || []).filter(
    (constraint) => constraint.subjectId !== subjectId,
  );
  applyLocalCourseRules([]);
  resetCourseDraftAfterConfigChange();
  showToast("课程已从当前年级删除");
  render();
}

async function addAdminScheduleConstraint() {
  const subjectId = document.querySelector("#constraintSubjectSelect").value;
  const dayValue = document.querySelector("#constraintDaySelect").value;
  const periodValue = document.querySelector("#constraintPeriodSelect").value;
  const reason = document.querySelector("#constraintReasonInput").value.trim();
  const dayIndexes = dayValue === "all" ? [] : [Number.parseInt(dayValue, 10)];
  const periods = periodValue === "all" ? [] : [Number.parseInt(periodValue, 10)];
  if (!subjectId || (!dayIndexes.length && !periods.length)) {
    showToast("请选择课程，并至少选择禁排星期或禁排节次");
    return;
  }

  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const result = await apiRequest("/api/scheduling/constraints", {
        method: "POST",
        body: {
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          subjectId,
          dayIndexes,
          periods,
          reason,
        },
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { loaded: true, loading: false, error: "" };
      document.querySelector("#constraintReasonInput").value = "";
      showToast("硬约束已添加，重新生成排课时生效");
    } catch (error) {
      schedulingBackendState = {
        loaded: true,
        loading: false,
        error: error.message || "硬约束添加失败",
      };
      showToast(schedulingBackendState.error);
    }
    render();
    return;
  }

  const rule = state.schedulingConfig.courseRules.find((item) => item.subjectId === subjectId);
  state.schedulingConfig.constraints.push({
    id: `LOCAL-SC-${Date.now()}`,
    subjectId,
    subjectName: rule?.subjectName || subjectId,
    dayIndexes,
    periods,
    reason,
    active: true,
  });
  showToast("硬约束已添加到本地演示");
  render();
}

async function deleteAdminScheduleConstraint(constraintId) {
  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const result = await apiRequest(`/api/scheduling/constraints/${encodeURIComponent(constraintId)}`, {
        method: "DELETE",
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { loaded: true, loading: false, error: "" };
      showToast("硬约束已删除");
    } catch (error) {
      schedulingBackendState = {
        loaded: true,
        loading: false,
        error: error.message || "硬约束删除失败",
      };
      showToast(schedulingBackendState.error);
    }
    render();
    return;
  }

  state.schedulingConfig.constraints = (state.schedulingConfig.constraints || []).filter(
    (constraint) => constraint.id !== constraintId,
  );
  showToast("硬约束已删除");
  render();
}

function selectedAdminAssignments() {
  return (state.schedulingDraft.assignments || [])
    .filter((assignment) => assignment.classId === state.selectedSchedulingClassId)
    .sort((a, b) => `${a.date} ${a.period}`.localeCompare(`${b.date} ${b.period}`));
}

function scheduleWeekdayLabel(date) {
  const week = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5);
  const index = week.indexOf(date);
  return ["周一", "周二", "周三", "周四", "周五"][index] || date;
}

function teacherOptionsForAssignment(assignment) {
  if (!assignment) return [];
  const subject = state.schedulingConfig.subjects.find((item) => item.id === assignment.subjectId);
  return subjectClassTeacherIds(subject, assignment.classId).map((teacherId) => ({
    id: teacherId,
    name: schedulingTeacherName(teacherId),
  }));
}

function roomById(roomId) {
  return (state.schedulingConfig.rooms || []).find((room) => room.id === roomId) || null;
}

async function adjustBackendSchedule() {
  const assignmentId = document.querySelector("#adminAssignmentSelect").value;
  const teacherId = document.querySelector("#adminAssignmentTeacherSelect").value;
  const date = document.querySelector("#adminAssignmentDateSelect").value;
  const period = Number.parseInt(document.querySelector("#adminAssignmentPeriodSelect").value, 10);
  const roomId = document.querySelector("#adminAssignmentRoomSelect").value;

  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();

  try {
    const result = await apiRequest("/api/scheduling/adjust", {
      method: "POST",
      body: {
        ...backendSchedulingOptions(),
        assignmentId,
        teacherId,
        date,
        period,
        roomId,
      },
    });
    applyBackendScheduleResult(result);
    state.selectedScheduleAssignmentId = assignmentId;
    schedulingBackendState = { loaded: true, loading: false, error: "" };
    const conflicts = result.draft?.conflicts?.length || 0;
    showToast(conflicts ? `调整已保存，发现 ${conflicts} 个冲突` : "调整已保存，当前无冲突");
  } catch (error) {
    schedulingBackendState = {
      loaded: true,
      loading: false,
      error: error.message || "课节调整失败",
    };
    showToast(schedulingBackendState.error);
  }

  render();
}

function adjustLocalSchedule() {
  const assignmentId = document.querySelector("#adminAssignmentSelect").value;
  const assignment = (state.schedulingDraft.assignments || []).find((item) => item.id === assignmentId);
  if (!assignment) {
    showToast("请先选择要调整的课节");
    return;
  }

  const teacherId = document.querySelector("#adminAssignmentTeacherSelect").value;
  const date = document.querySelector("#adminAssignmentDateSelect").value;
  const periodValue = Number.parseInt(document.querySelector("#adminAssignmentPeriodSelect").value, 10);
  const roomId = document.querySelector("#adminAssignmentRoomSelect").value;
  const period = state.schedulingConfig.periods.find((item) => item.period === periodValue);
  const room = roomById(roomId);
  const teacherNameText = schedulingTeacherName(teacherId);
  const dayIndex = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5).indexOf(date);

  if (!period || !room) {
    showToast("请选择有效的节次和教室");
    return;
  }

  const violation = localScheduleConstraintViolation(assignment.subjectId, {
    date,
    dayIndex,
    period: period.period,
    time: period.time,
  });
  if (violation) {
    showToast(
      `该调整违反硬约束：${violation.subjectName || assignment.subjectName} 不能出现在 ${scheduleConstraintDayText(violation.dayIndexes)} ${scheduleConstraintPeriodText(violation.periods)}`,
    );
    return;
  }
  const subjectRuleViolation = localSubjectRuleViolation(
    assignment.subjectId,
    { date, dayIndex, period: period.period, time: period.time },
    (state.schedulingDraft.assignments || []).filter((item) => item.id !== assignment.id),
    assignment.classId,
  );
  if (subjectRuleViolation) {
    showToast(subjectRuleViolation.text || subjectRuleViolation.title);
    return;
  }

  assignment.teacherId = teacherId;
  assignment.teacherName = teacherNameText;
  assignment.date = date;
  assignment.dayIndex = dayIndex;
  assignment.period = period.period;
  assignment.time = period.time;
  assignment.roomId = room.id;
  assignment.room = room.name;
  assignment.adjustedAt = formatDateTimeMinute();
  state.schedulingDraft.conflicts = validateScheduleConflicts(state.schedulingDraft.assignments || []);
  state.selectedScheduleAssignmentId = assignmentId;
  showToast(
    state.schedulingDraft.conflicts.length
      ? `调整已保存，发现 ${state.schedulingDraft.conflicts.length} 个冲突`
      : "调整已保存，当前无冲突",
  );
  render();
}

async function applyScheduleAdjustment() {
  if (backendMode() && currentRole() === "admin") {
    await adjustBackendSchedule();
    return;
  }
  adjustLocalSchedule();
}

async function toggleBackendAssignmentLock() {
  const assignmentId = document.querySelector("#adminAssignmentSelect").value;
  const assignment = (state.schedulingDraft.assignments || []).find((item) => item.id === assignmentId);
  if (!assignment) {
    showToast("请先选择要锁定的课节");
    return;
  }

  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();

  try {
    const result = await apiRequest("/api/scheduling/lock", {
      method: "POST",
      body: {
        ...backendSchedulingOptions(),
        assignmentId,
        locked: !assignment.locked,
      },
    });
    applyBackendScheduleResult(result);
    state.selectedScheduleAssignmentId = assignmentId;
    schedulingBackendState = { loaded: true, loading: false, error: "" };
    showToast(result.assignment?.locked ? "课节已锁定，重排时会保留" : "课节已解锁，可参与重新排课");
  } catch (error) {
    schedulingBackendState = {
      loaded: true,
      loading: false,
      error: error.message || "锁定状态修改失败",
    };
    showToast(schedulingBackendState.error);
  }

  render();
}

function toggleLocalAssignmentLock() {
  const assignmentId = document.querySelector("#adminAssignmentSelect").value;
  const assignment = (state.schedulingDraft.assignments || []).find((item) => item.id === assignmentId);
  if (!assignment) {
    showToast("请先选择要锁定的课节");
    return;
  }

  assignment.locked = !assignment.locked;
  assignment.lockedAt = assignment.locked ? formatDateTimeMinute() : "";
  assignment.lockedByAccountId = assignment.locked ? currentAccount()?.id || "" : "";
  assignment.unlockedAt = assignment.locked ? "" : formatDateTimeMinute();
  state.schedulingDraft.lockedCount = (state.schedulingDraft.assignments || []).filter((item) => item.locked).length;
  state.schedulingDraft.conflicts = validateScheduleConflicts(state.schedulingDraft.assignments || []);
  state.selectedScheduleAssignmentId = assignmentId;
  showToast(assignment.locked ? "课节已锁定，重排时会保留" : "课节已解锁，可参与重新排课");
  render();
}

async function toggleScheduleAssignmentLock() {
  if (backendMode() && currentRole() === "admin") {
    await toggleBackendAssignmentLock();
    return;
  }
  toggleLocalAssignmentLock();
}

async function regenerateBackendUnlockedSchedule() {
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();

  try {
    const result = await apiRequest("/api/scheduling/regenerate-unlocked", {
      method: "POST",
      body: backendSchedulingOptions(),
    });
    applyBackendScheduleResult(result);
    schedulingBackendState = { loaded: true, loading: false, error: "" };
    const lockedCount = result.draft?.lockedCount || 0;
    const conflicts = result.draft?.conflicts?.length || 0;
    showToast(
      conflicts
        ? `已保留 ${lockedCount} 节锁定课并重排，发现 ${conflicts} 个冲突`
        : `已保留 ${lockedCount} 节锁定课并重排未锁定课程`,
    );
  } catch (error) {
    schedulingBackendState = {
      loaded: true,
      loading: false,
      error: error.message || "重排未锁定课程失败",
    };
    showToast(schedulingBackendState.error);
  }

  render();
}

function regenerateLocalUnlockedSchedule() {
  const draft = state.schedulingDraft;
  if (!schedulingDraftMatchesCurrent() || !draft.assignments?.length) {
    showToast("请先生成排课草稿");
    return;
  }
  const lockedAssignments = draft.assignments.filter((assignment) => assignment.locked);
  const assignments = generateScheduleAssignments({ lockedAssignments });
  const conflicts = validateScheduleConflicts(assignments);
  state.schedulingDraft = {
    ...draft,
    status: "draft",
    assignments,
    conflicts,
    generatedLessonCount: assignments.length,
    unassignedCount: Math.max(requiredScheduleLessonCount() - assignments.length, 0),
    lockedCount: lockedAssignments.length,
    updatedAt: formatDateTimeMinute(),
    replannedAt: formatDateTimeMinute(),
  };
  showToast(
    conflicts.length
      ? `已保留 ${lockedAssignments.length} 节锁定课并重排，发现 ${conflicts.length} 个冲突`
      : `已保留 ${lockedAssignments.length} 节锁定课并重排未锁定课程`,
  );
  render();
}

async function regenerateUnlockedSchedule() {
  if (backendMode() && currentRole() === "admin") {
    await regenerateBackendUnlockedSchedule();
    return;
  }
  regenerateLocalUnlockedSchedule();
}

async function saveTeacherScheduleRule() {
  if (!backendMode() || currentRole() !== "admin") {
    showToast("请使用后端行政账号保存老师时间规则");
    return;
  }
  const teacherId = document.querySelector("#teacherRuleTeacherSelect").value;
  if (!teacherId) {
    showToast("请先选择老师");
    return;
  }
  const existing = (state.schedulingConfig.teacherRules || []).find((rule) => rule.teacherId === teacherId);
  const unavailableSlots = existing?.unavailableSlots ? clone(existing.unavailableSlots) : [];
  const dayValue = document.querySelector("#teacherRuleUnavailableDay").value;
  const periodValue = document.querySelector("#teacherRuleUnavailablePeriod").value;
  const reason = document.querySelector("#teacherRuleReasonInput").value.trim();
  if (dayValue !== "" && periodValue !== "") {
    const nextSlot = {
      dayIndex: Number.parseInt(dayValue, 10),
      periods: [Number.parseInt(periodValue, 10)],
      reason,
    };
    const duplicate = unavailableSlots.some(
      (slot) => Number(slot.dayIndex) === nextSlot.dayIndex && (slot.periods || []).map(Number).includes(nextSlot.periods[0]),
    );
    if (!duplicate) unavailableSlots.push(nextSlot);
  }
  const avoidPeriod = document.querySelector("#teacherRuleAvoidPeriod").value;
  const preferPeriod = document.querySelector("#teacherRulePreferPeriod").value;
  const maxDailyLessons = Number.parseInt(document.querySelector("#teacherRuleMaxDaily").value || "4", 10);
  const maxConsecutiveLessons = Number.parseInt(document.querySelector("#teacherRuleMaxConsecutive").value || "3", 10);

  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();
  try {
    const result = await apiRequest("/api/scheduling/teacher-rules", {
      method: "POST",
      body: {
        stageId: state.schedulingConfig.stageId,
        gradeId: state.schedulingConfig.gradeId,
        grade: state.schedulingConfig.grade,
        teacherId,
        unavailableSlots,
        avoidPeriods: avoidPeriod ? [Number.parseInt(avoidPeriod, 10)] : existing?.avoidPeriods || [],
        preferPeriods: preferPeriod ? [Number.parseInt(preferPeriod, 10)] : existing?.preferPeriods || [],
        maxDailyLessons,
        maxConsecutiveLessons,
      },
    });
    applyBackendScheduleResult(result);
    schedulingBackendState = { loaded: true, loading: false, error: "" };
    showToast("老师时间规则已保存，重新生成排课时生效");
  } catch (error) {
    schedulingBackendState = { loaded: true, loading: false, error: error.message || "老师规则保存失败" };
    showToast(schedulingBackendState.error);
  }
  render();
}

async function submitScheduleChangeRequest() {
  if (!backendMode() || currentRole() !== "admin") {
    showToast("请使用后端行政账号发起调课申请");
    return;
  }
  const assignmentId = document.querySelector("#changeAssignmentSelect").value;
  if (!assignmentId) {
    showToast("请先选择已发布课节");
    return;
  }
  const teacherId = document.querySelector("#changeTeacherSelect").value;
  const date = document.querySelector("#changeDateSelect").value;
  const period = Number.parseInt(document.querySelector("#changePeriodSelect").value, 10);
  const roomId = document.querySelector("#changeRoomSelect").value;
  const reason = document.querySelector("#changeReasonInput").value.trim();
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();
  try {
    const result = await apiRequest("/api/scheduling/change-requests", {
      method: "POST",
      body: {
        ...backendSchedulingOptions(),
        assignmentId,
        teacherId,
        date,
        period,
        roomId,
        reason,
      },
    });
    applyBackendScheduleResult(result);
    schedulingBackendState = { loaded: true, loading: false, error: "" };
    showToast("调课/代课申请已提交，等待审批");
  } catch (error) {
    schedulingBackendState = { loaded: true, loading: false, error: error.message || "调课申请提交失败" };
    showToast(schedulingBackendState.error);
  }
  render();
}

async function approveScheduleChangeRequest(requestId) {
  if (!backendMode() || currentRole() !== "admin") return;
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();
  try {
    const result = await apiRequest(`/api/scheduling/change-requests/${encodeURIComponent(requestId)}/approve`, {
      method: "POST",
    });
    applyBackendScheduleResult(result);
    schedulingBackendState = { loaded: true, loading: false, error: "" };
    showToast("调课/代课已审批通过，并同步到老师端");
    await loadBackendSchedulingContext();
    await loadBackendNotifications();
  } catch (error) {
    schedulingBackendState = { loaded: true, loading: false, error: error.message || "调课审批失败" };
    showToast(schedulingBackendState.error);
  }
  render();
}

async function moveScheduleAssignmentToSlot(assignmentId, date, period) {
  const assignment = (state.schedulingDraft.assignments || []).find((item) => item.id === assignmentId);
  if (!assignment) return;
  if (state.schedulingDraft.status === "published") {
    showToast("已发布课表请走调课/代课审批");
    return;
  }
  if (assignment.locked) {
    showToast("该课节已锁定，先解锁再拖拽调整");
    return;
  }
  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const result = await apiRequest("/api/scheduling/adjust", {
        method: "POST",
        body: {
          ...backendSchedulingOptions(),
          assignmentId,
          teacherId: assignment.teacherId,
          date,
          period: Number.parseInt(period, 10),
          roomId: assignment.roomId,
        },
      });
      applyBackendScheduleResult(result);
      state.selectedScheduleAssignmentId = assignmentId;
      schedulingBackendState = { loaded: true, loading: false, error: "" };
      showToast("拖拽调整已保存并重新校验");
    } catch (error) {
      schedulingBackendState = { loaded: true, loading: false, error: error.message || "拖拽调整失败" };
      showToast(schedulingBackendState.error);
    }
    render();
    return;
  }
  document.querySelector("#adminAssignmentSelect").value = assignmentId;
  document.querySelector("#adminAssignmentDateSelect").value = date;
  document.querySelector("#adminAssignmentPeriodSelect").value = String(period);
  adjustLocalSchedule();
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
    personnelPage.loaded = false;
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
      text: "未完成签入和签出的项目当前不会计入月度工作量，财务结算时会自动剔除。",
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

function payrollStatusLabel(status = "preview") {
  if (status === "locked") return "已锁定";
  if (status === "reviewed") return "已复核";
  if (status === "generated") return "已生成";
  return "试算";
}

function payrollStatusTag(status = "preview") {
  const className = status === "locked" ? "locked" : status === "reviewed" ? "completed" : "pending";
  return `<span class="tag ${className}">${payrollStatusLabel(status)}</span>`;
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
  renderPersonnelList();
  renderTeacherImport();
  renderScanner();
  renderRecords();
  renderConfirmation();
  renderTeacherPayroll();
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

  document.body.dataset.activeView = state.activeView;
  document.body.dataset.accountRole = role;
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
  title.textContent = role === "teacher" ? "老师通知栏" : role === "admin" ? "行政通知栏" : "财务通知栏";
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
  title.textContent = role === "teacher" ? "老师通知中心" : role === "admin" ? "行政通知中心" : "财务通知中心";
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
  document.querySelector("#netPreview").textContent = formatCurrency(salary.net);
  const dashboardPayrollStatus = document.querySelector("#dashboardPayrollStatus");
  if (dashboardPayrollStatus) {
    dashboardPayrollStatus.textContent = settlementText(teacherId);
  }
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
        <div class="detail-cell"><span>签到要求</span>课前签入 · 课后签出</div>
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
    : `<tr><td colspan="8"><div class="empty-state">当前筛选条件下没有课时任务</div></td></tr>`;
}

function availableScheduleWeeks(lessons) {
  const weeks = Array.from(new Set(lessons.map((lesson) => startOfNaturalWeek(lesson.date)))).sort();
  const currentWeek = startOfNaturalWeek(todayKey());
  if (!weeks.includes(currentWeek)) weeks.unshift(currentWeek);
  return weeks;
}

function minutesFromClock(value = "00:00") {
  const [hour, minute] = String(value).split(":").map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
  return hour * 60 + minute;
}

function lessonTimeRange(lesson) {
  const [start = "00:00", end = start] = String(lesson.time || "").split("-");
  const startMinutes = minutesFromClock(start);
  const endMinutes = Math.max(minutesFromClock(end), startMinutes + 40);
  return { start, end, startMinutes, endMinutes };
}

function scheduleCalendarBounds(lessons) {
  let startHour = 8;
  let endHour = 18;

  lessons.forEach((lesson) => {
    const range = lessonTimeRange(lesson);
    startHour = Math.min(startHour, Math.floor(range.startMinutes / 60));
    endHour = Math.max(endHour, Math.ceil(range.endMinutes / 60));
  });

  return {
    startHour,
    endHour: Math.max(endHour, startHour + 1),
  };
}

function scheduleHourLabels(startHour, endHour) {
  return Array.from({ length: endHour - startHour + 1 }, (_, index) => {
    const hour = startHour + index;
    const offset = ((hour - startHour) / (endHour - startHour)) * 100;
    return `<span style="top: ${offset}%">${String(hour).padStart(2, "0")}:00</span>`;
  }).join("");
}

function scheduleDateMeta(dateKey, index) {
  const dayNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const [, month, day] = dateKey.split("-");
  return {
    dayName: dayNames[index] || "",
    month: Number(month),
    day: Number(day),
  };
}

function scheduleCalendarEventHtml(lesson, bounds) {
  const range = lessonTimeRange(lesson);
  const totalMinutes = (bounds.endHour - bounds.startHour) * 60;
  const top = ((range.startMinutes - bounds.startHour * 60) / totalMinutes) * 100;
  const height = ((range.endMinutes - range.startMinutes) / totalMinutes) * 100;
  const action = lesson.status === "pending" || lesson.status === "checkedIn" ? actionCell(lesson) : statusTag(lesson.status);

  return `
    <article class="weekly-calendar-event ${lesson.status}" style="top: ${top}%; height: ${height}%">
      <div class="weekly-calendar-event-time">${range.start}-${range.end}</div>
      <strong>${lesson.course}</strong>
      <span>${lesson.className}</span>
      <small>${lesson.room} · ${lessonTypeLabel[lesson.type]}</small>
      <div class="weekly-calendar-event-action">${action}</div>
    </article>
  `;
}

function scheduleWeeklyCalendarHtml(weekDates, grouped, selectedDate, weekLessons) {
  const bounds = scheduleCalendarBounds(weekLessons);
  const dayHeaders = weekDates
    .map((date, index) => {
      const meta = scheduleDateMeta(date, index);
      const count = grouped.get(date)?.length || 0;
      return `
        <button
          class="weekly-calendar-day-heading ${date === todayKey() ? "today" : ""} ${date === selectedDate ? "active" : ""}"
          data-schedule-date="${date}"
          style="grid-column: ${index + 2}; grid-row: 1"
          type="button"
        >
          <span>${meta.dayName}</span>
          <strong>${meta.day}</strong>
          <small>${count ? `${count} 节` : `${meta.month}月`}</small>
        </button>
      `;
    })
    .join("");

  const dayColumns = weekDates
    .map((date, index) => {
      const dayLessons = (grouped.get(date) || []).sort((a, b) => lessonTimeRange(a).startMinutes - lessonTimeRange(b).startMinutes);
      const events = dayLessons.map((lesson) => scheduleCalendarEventHtml(lesson, bounds)).join("");
      return `
        <section
          class="weekly-calendar-day-column ${date === todayKey() ? "today" : ""} ${date === selectedDate ? "active" : ""}"
          style="grid-column: ${index + 2}; grid-row: 2"
          aria-label="${formatDate(date)}日程"
        >
          ${events || `<div class="weekly-calendar-empty">无排班</div>`}
        </section>
      `;
    })
    .join("");

  return `
    <section class="weekly-calendar" aria-label="本周日程表">
      <div class="weekly-calendar-scroller" data-weekly-calendar-scroller>
        <div
          class="weekly-calendar-grid"
          style="grid-template-columns: var(--time-gutter) repeat(${weekDates.length}, var(--day-column-width)); --calendar-hours: ${bounds.endHour - bounds.startHour}"
        >
          <div class="weekly-calendar-timezone" style="grid-column: 1; grid-row: 1">GMT+8</div>
          ${dayHeaders}
          <div class="weekly-calendar-time-rail" style="grid-column: 1; grid-row: 2">
            ${scheduleHourLabels(bounds.startHour, bounds.endHour)}
          </div>
          ${dayColumns}
        </div>
      </div>
    </section>
  `;
}

function focusWeeklyCalendarDate(grid, selectedIndex) {
  const scroller = grid.querySelector("[data-weekly-calendar-scroller]");
  if (!scroller || selectedIndex < 0) return;

  requestAnimationFrame(() => {
    scroller.scrollLeft = 0;
  });
}

function scheduleTimelineHtml(dayLessons, selectedDate) {
  if (!dayLessons.length) {
    return `<div class="schedule-empty timeline-empty">这一天暂无课程</div>`;
  }

  const events = dayLessons
    .map((lesson) => {
      const range = lessonTimeRange(lesson);
      const action = lesson.status === "pending" || lesson.status === "checkedIn" ? actionCell(lesson) : statusTag(lesson.status);
      return `
        <article class="schedule-timeline-event ${lesson.status}">
          <div class="schedule-timeline-time">
            <strong>${range.start}</strong>
            <span>${range.end}</span>
          </div>
          <div class="schedule-timeline-main">
            <strong>${lesson.className} · ${lesson.course}</strong>
            <span>${lesson.room} · ${lessonTypeLabel[lesson.type]}</span>
          </div>
          <div class="schedule-timeline-action">${action}</div>
        </article>
      `;
    })
    .join("");

  return `
    <section class="schedule-day-timeline" aria-label="${formatDate(selectedDate)}日程时间线">
      ${events}
    </section>
  `;
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
  if (!weekDates.includes(state.selectedScheduleDate)) {
    state.selectedScheduleDate = weekDates.includes(todayKey()) ? todayKey() : weekDates[0];
  }
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

  const selectedIndex = weekDates.indexOf(state.selectedScheduleDate);

  grid.innerHTML = `
    ${scheduleWeeklyCalendarHtml(weekDates, grouped, state.selectedScheduleDate, weekLessons)}
  `;
  focusWeeklyCalendarDate(grid, selectedIndex);
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
  if (!selectedClassAssignments.some((assignment) => assignment.id === state.selectedScheduleAssignmentId)) {
    state.selectedScheduleAssignmentId = selectedClassAssignments[0]?.id || "";
  }
  const selectedAssignment =
    selectedClassAssignments.find((assignment) => assignment.id === state.selectedScheduleAssignmentId) ||
    selectedClassAssignments[0] ||
    null;

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
    `${config.divisionName}${config.gradeName}按班级逐科指定老师，输入老师姓名、工号或编号完成匹配后再生成排课。`;
  document.querySelector("#courseRulesHelp").textContent =
    `${config.divisionName}${config.gradeName}可配置开设课程、周课时和每节时长，保存后重新生成排课时生效。`;
  document.querySelector("#courseRulesStatus").textContent =
    `${(config.courseRules || []).filter((rule) => rule.enabled).length} 门课 · ${(config.constraints || []).length} 条硬约束`;
  document.querySelector("#courseRulesStatus").className = (config.constraints || []).length
    ? "status-pill warning"
    : "status-pill done";
  document.querySelector("#toggleCourseEditMode").textContent = courseRulesEditMode ? "完成编辑" : "编辑";
  document.querySelector("#adminSchedulePreviewHelp").textContent =
    `按${config.gradeName}班级查看生成结果，确认前为草稿，确认后同步到老师端 ${formatWeekRange(config.weekStart)} 课表。`;
  const enabledCourseRules = (config.courseRules || []).filter((rule) => rule.enabled);
  document.querySelector("#courseRuleList").innerHTML = enabledCourseRules.length
    ? enabledCourseRules.map(adminCourseRuleItem).join("")
    : `<div class="empty-state">当前年级还没有课程，请先新增课程</div>`;
  document.querySelector("#constraintSubjectSelect").innerHTML = scheduleConstraintSubjectOptions(config);
  document.querySelector("#constraintPeriodSelect").innerHTML = scheduleConstraintPeriodOptions(config);
  document.querySelector("#scheduleConstraintList").innerHTML = adminScheduleConstraintList(config);
  document.querySelector("#selectedTeacherPoolSummary").innerHTML = adminSelectedTeacherPoolSummary(config);
  document.querySelector("#subjectConfigList").innerHTML = adminSubjectConfigItem(config);
  renderTeacherRulePanel(config);
  const missingTeacherAssignments = missingClassSubjectTeacherAssignments(config);
  document.querySelector("#conflictList").innerHTML =
    assignments.length === 0
      ? `<div class="empty-state">点击“一键生成排课”后显示冲突校验结果</div>`
      : conflicts.length
        ? conflicts.map(conflictItem).join("")
        : `<div class="check-success"><strong>冲突 0</strong><span>${escapeHtml(scheduleSolverSummaryText(draft))}</span></div>${scheduleDiagnosticsHtml(draft)}`;
  document.querySelector("#adminClassSelect").innerHTML = config.classes
    .map(
      (schoolClass) => `
        <option value="${schoolClass.id}" ${schoolClass.id === selectedClassId ? "selected" : ""}>
          ${schoolClass.name} · ${schoolClass.room}
        </option>
      `,
    )
    .join("");
  renderScheduleAdjustmentPanel(selectedClassAssignments, selectedAssignment, draft);
  renderScheduleChangePanel(selectedClassAssignments, selectedAssignment, draft);
  document.querySelector("#adminScheduleGrid").innerHTML = adminScheduleGrid(selectedClassAssignments);

  document.querySelector("#generateSchedule").disabled = schedulingBackendState.loading || missingTeacherAssignments.length > 0;
  document.querySelector("#confirmSchedule").disabled =
    schedulingBackendState.loading || assignments.length === 0 || conflicts.length > 0 || draft.status === "published";
  document.querySelector("#saveCourseRules").disabled = schedulingBackendState.loading;
  document.querySelector("#addGradeCourse").disabled = schedulingBackendState.loading;
  document.querySelector("#toggleCourseEditMode").disabled = schedulingBackendState.loading;
  document.querySelector("#addScheduleConstraint").disabled =
    schedulingBackendState.loading || !(config.courseRules || []).some((rule) => rule.enabled);
  document.querySelector("#saveTeacherRule").disabled = schedulingBackendState.loading || !(config.teachers || []).length;
  document.querySelectorAll("[data-save-teacher-assignment-matrix]").forEach((button) => {
    button.disabled = schedulingBackendState.loading;
  });
}

function renderScheduleAdjustmentPanel(assignments, selectedAssignment, draft) {
  const assignmentSelect = document.querySelector("#adminAssignmentSelect");
  const teacherSelect = document.querySelector("#adminAssignmentTeacherSelect");
  const dateSelect = document.querySelector("#adminAssignmentDateSelect");
  const periodSelect = document.querySelector("#adminAssignmentPeriodSelect");
  const roomSelect = document.querySelector("#adminAssignmentRoomSelect");
  const applyButton = document.querySelector("#applyScheduleAdjustment");
  const lockButton = document.querySelector("#toggleScheduleAssignmentLock");
  const regenerateButton = document.querySelector("#regenerateUnlockedSchedule");
  const status = document.querySelector("#scheduleAdjustStatus");
  if (
    !assignmentSelect ||
    !teacherSelect ||
    !dateSelect ||
    !periodSelect ||
    !roomSelect ||
    !applyButton ||
    !lockButton ||
    !regenerateButton ||
    !status
  ) {
    return;
  }

  const hasDraft = assignments.length > 0;
  const isPublished = draft.status === "published";
  const canAdjust = hasDraft && !isPublished && !schedulingBackendState.loading;
  const lockedCount = (draft.assignments || []).filter((assignment) => assignment.locked).length;

  status.textContent = !hasDraft
    ? "等待草稿"
    : isPublished
      ? "已发布锁定"
      : draft.conflicts?.length
        ? `${draft.conflicts.length} 个冲突`
        : lockedCount
          ? `已锁定 ${lockedCount} 节`
          : "可调整";
  status.className = !hasDraft
    ? "status-pill"
    : isPublished
      ? "status-pill locked"
      : draft.conflicts?.length
        ? "status-pill warning"
        : "status-pill done";

  assignmentSelect.innerHTML = hasDraft
    ? assignments
        .map(
          (assignment) => `
            <option value="${assignment.id}" ${assignment.id === selectedAssignment?.id ? "selected" : ""}>
              ${assignment.locked ? "已锁定 · " : ""}${scheduleWeekdayLabel(assignment.date)} 第 ${assignment.period} 节 · ${assignment.subjectName} · ${assignment.teacherName} · ${assignment.room}
            </option>
          `,
        )
        .join("")
    : `<option value="">请先生成排课草稿</option>`;

  const teacherOptions = teacherOptionsForAssignment(selectedAssignment);
  teacherSelect.innerHTML = selectedAssignment
    ? teacherOptions
        .map(
          (teacher) => `
            <option value="${teacher.id}" ${teacher.id === selectedAssignment.teacherId ? "selected" : ""}>
              ${teacher.name}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无老师</option>`;

  const weekDates = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5);
  dateSelect.innerHTML = selectedAssignment
    ? weekDates
        .map(
          (date) => `
            <option value="${date}" ${date === selectedAssignment.date ? "selected" : ""}>
              ${scheduleWeekdayLabel(date)} · ${formatDate(date)}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无日期</option>`;

  periodSelect.innerHTML = selectedAssignment
    ? state.schedulingConfig.periods
        .map(
          (period) => `
            <option value="${period.period}" ${period.period === selectedAssignment.period ? "selected" : ""}>
              第 ${period.period} 节 · ${period.time}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无节次</option>`;

  roomSelect.innerHTML = selectedAssignment
    ? (state.schedulingConfig.rooms || [])
        .map(
          (room) => `
            <option value="${room.id}" ${room.id === selectedAssignment.roomId || room.name === selectedAssignment.room ? "selected" : ""}>
              ${room.name}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无教室</option>`;

  assignmentSelect.disabled = !hasDraft || schedulingBackendState.loading;
  teacherSelect.disabled = !canAdjust;
  dateSelect.disabled = !canAdjust;
  periodSelect.disabled = !canAdjust;
  roomSelect.disabled = !canAdjust;
  applyButton.disabled = !canAdjust || !selectedAssignment;
  lockButton.disabled = !canAdjust || !selectedAssignment;
  lockButton.textContent = selectedAssignment?.locked ? "解锁该课节" : "锁定该课节";
  regenerateButton.disabled = !canAdjust || !hasDraft;
}

function renderTeacherRulePanel(config) {
  const teacherSelect = document.querySelector("#teacherRuleTeacherSelect");
  const unavailablePeriodSelect = document.querySelector("#teacherRuleUnavailablePeriod");
  const avoidPeriodSelect = document.querySelector("#teacherRuleAvoidPeriod");
  const preferPeriodSelect = document.querySelector("#teacherRulePreferPeriod");
  const list = document.querySelector("#teacherRuleList");
  const status = document.querySelector("#teacherRuleStatus");
  if (!teacherSelect || !unavailablePeriodSelect || !avoidPeriodSelect || !preferPeriodSelect || !list || !status) return;

  const teachers = config.teachers || [];
  const selectedTeacherId = teacherSelect.value && teachers.some((teacher) => teacher.id === teacherSelect.value)
    ? teacherSelect.value
    : teachers[0]?.id || "";
  teacherSelect.innerHTML = teachers.length
    ? teachers
        .map(
          (teacher) => `
            <option value="${teacher.id}" ${teacher.id === selectedTeacherId ? "selected" : ""}>
              ${escapeHtml(teacher.name)} · ${escapeHtml(teacher.subject || teacher.subjectId || "")}
            </option>
          `,
        )
        .join("")
    : `<option value="">请先配置任课老师</option>`;
  unavailablePeriodSelect.innerHTML = schedulePeriodOptions(config, { emptyLabel: "不新增" });
  avoidPeriodSelect.innerHTML = schedulePeriodOptions(config, { emptyLabel: "不设置" });
  preferPeriodSelect.innerHTML = schedulePeriodOptions(config, { emptyLabel: "不设置" });
  list.innerHTML = adminTeacherRuleList(config);
  status.textContent = `${(config.teacherRules || []).length} 条规则`;
  status.className = (config.teacherRules || []).length ? "status-pill warning" : "status-pill";
}

function renderScheduleChangePanel(assignments, selectedAssignment, draft) {
  const assignmentSelect = document.querySelector("#changeAssignmentSelect");
  const teacherSelect = document.querySelector("#changeTeacherSelect");
  const dateSelect = document.querySelector("#changeDateSelect");
  const periodSelect = document.querySelector("#changePeriodSelect");
  const roomSelect = document.querySelector("#changeRoomSelect");
  const submitButton = document.querySelector("#submitScheduleChangeRequest");
  const list = document.querySelector("#scheduleChangeRequestList");
  const status = document.querySelector("#scheduleChangeStatus");
  if (!assignmentSelect || !teacherSelect || !dateSelect || !periodSelect || !roomSelect || !submitButton || !list || !status) {
    return;
  }

  const isPublished = draft.status === "published";
  const hasAssignments = assignments.length > 0;
  const selected = isPublished ? selectedAssignment : null;
  assignmentSelect.innerHTML = isPublished && hasAssignments
    ? assignments
        .map(
          (assignment) => `
            <option value="${assignment.id}" ${assignment.id === selected?.id ? "selected" : ""}>
              ${scheduleWeekdayLabel(assignment.date)} 第 ${assignment.period} 节 · ${assignment.subjectName} · ${assignment.teacherName}
            </option>
          `,
        )
        .join("")
    : `<option value="">课表发布后可申请调课</option>`;
  teacherSelect.innerHTML = selected
    ? teacherOptionsForAssignment(selected)
        .map(
          (teacher) => `
            <option value="${teacher.id}" ${teacher.id === selected.teacherId ? "selected" : ""}>
              ${teacher.name}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无老师</option>`;
  const weekDates = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5);
  dateSelect.innerHTML = selected
    ? weekDates
        .map(
          (date) => `
            <option value="${date}" ${date === selected.date ? "selected" : ""}>
              ${scheduleWeekdayLabel(date)} · ${formatDate(date)}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无日期</option>`;
  periodSelect.innerHTML = selected
    ? state.schedulingConfig.periods
        .map(
          (period) => `
            <option value="${period.period}" ${period.period === selected.period ? "selected" : ""}>
              第 ${period.period} 节 · ${period.time}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无节次</option>`;
  roomSelect.innerHTML = selected
    ? (state.schedulingConfig.rooms || [])
        .map(
          (room) => `
            <option value="${room.id}" ${room.id === selected.roomId || room.name === selected.room ? "selected" : ""}>
              ${room.name}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无教室</option>`;

  assignmentSelect.disabled = !isPublished || schedulingBackendState.loading;
  teacherSelect.disabled = !isPublished || schedulingBackendState.loading;
  dateSelect.disabled = !isPublished || schedulingBackendState.loading;
  periodSelect.disabled = !isPublished || schedulingBackendState.loading;
  roomSelect.disabled = !isPublished || schedulingBackendState.loading;
  submitButton.disabled = !isPublished || !selected || schedulingBackendState.loading;
  status.textContent = !isPublished ? "等待发布" : `${(state.schedulingConfig.changeRequests || []).filter((item) => item.status === "pending").length} 个待审批`;
  status.className = !isPublished ? "status-pill" : "status-pill warning";
  list.innerHTML = adminChangeRequestList(state.schedulingConfig);
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

function personnelRoleLabel(role) {
  if (role === "teacher") return "任课教师";
  if (role === "admin") return "行政";
  if (role === "finance") return "财务";
  if (role === "system_admin") return "系统管理员";
  return "账号";
}

function personnelRoleTag(role) {
  const className = role === "teacher" ? "completed" : role === "finance" ? "locked" : "pending";
  return `<span class="tag ${className}">${personnelRoleLabel(role)}</span>`;
}

function personnelStatusTag(status = "active") {
  const active = status === "active";
  return `<span class="tag ${active ? "completed" : "exception"}">${active ? "启用" : "停用"}</span>`;
}

function localPersonnelRows() {
  const teacherRows = state.teachers.map((teacher) => ({
    id: `local-teacher:${teacher.id}`,
    role: "teacher",
    roleName: "任课教师",
    name: teacher.name,
    username: "",
    usernames: [],
    employeeNo: teacher.id,
    teacherId: teacher.id,
    department: teacher.department,
    stageId: "",
    stageName: teacher.department,
    gradeText: teacher.grade || "未设置年级",
    subjectName: teacher.subject,
    title: teacher.position || "任课教师",
    phone: "",
    hiredAt: "",
    status: "active",
  }));
  const accountRows = state.accounts
    .filter((account) => account.role !== "teacher")
    .map((account) => ({
      id: `local-account:${account.id}`,
      role: account.role,
      roleName: personnelRoleLabel(account.role),
      name: account.name,
      username: account.id,
      usernames: [account.id],
      employeeNo: "",
      teacherId: "",
      department: account.department || "未设置部门",
      stageId: "",
      stageName: account.department || "未设置学部",
      gradeText: "不适用",
      subjectName: "不适用",
      title: account.title || personnelRoleLabel(account.role),
      phone: "",
      hiredAt: "",
      status: "active",
    }));
  return [...accountRows, ...teacherRows];
}

function filteredLocalPersonnelRows() {
  const search = personnelPage.search.trim().toLowerCase();
  return localPersonnelRows().filter((row) => {
    if (personnelPage.role !== "all" && row.role !== personnelPage.role) return false;
    if (personnelPage.status !== "all" && row.status !== personnelPage.status) return false;
    if (personnelPage.stageId && row.stageId !== personnelPage.stageId) return false;
    if (!search) return true;
    return [
      row.name,
      row.username,
      row.employeeNo,
      row.teacherId,
      row.department,
      row.stageName,
      row.gradeText,
      row.subjectName,
      row.title,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });
}

function personnelRow(row) {
  const usernames = row.usernames?.length ? row.usernames.join(" / ") : row.username || "未开通";
  const identifier = [row.employeeNo, row.teacherId].filter(Boolean).join(" · ") || row.accountId || row.id;
  const subjectAndTitle =
    row.subjectName && row.subjectName !== "不适用"
      ? `${escapeHtml(row.subjectName)}<span class="cell-subline">${escapeHtml(row.title || "")}</span>`
      : escapeHtml(row.title || row.subjectName || "未设置");
  return `
    <tr>
      <td class="row-title" data-label="人员">
        ${escapeHtml(row.name)}
        <span class="cell-subline">${escapeHtml(row.roleName || personnelRoleLabel(row.role))}</span>
      </td>
      <td data-label="账号/工号">
        ${escapeHtml(usernames)}
        <span class="cell-subline">${escapeHtml(identifier)}</span>
      </td>
      <td data-label="角色">${personnelRoleTag(row.role)}</td>
      <td data-label="学部/部门">${escapeHtml(row.stageName || row.department || "未设置")}</td>
      <td data-label="年级">${escapeHtml(row.gradeText || "未设置年级")}</td>
      <td data-label="学科/岗位">${subjectAndTitle}</td>
      <td data-label="状态">${personnelStatusTag(row.status)}</td>
      <td data-label="联系方式">${escapeHtml(row.phone || row.hiredAt || "-")}</td>
    </tr>
  `;
}

function renderPersonnelList() {
  if (backendMode() && currentRole() === "admin" && !personnelPage.loaded && !personnelPage.loading) {
    loadPersonnelPage();
  }

  const table = document.querySelector("#personnelTable");
  if (!table) return;

  const searchInput = document.querySelector("#personnelSearch");
  const stageFilter = document.querySelector("#personnelStageFilter");
  const roleFilter = document.querySelector("#personnelRoleFilter");
  const statusFilter = document.querySelector("#personnelStatusFilter");
  const pageSizeSelect = document.querySelector("#personnelPageSize");
  const status = document.querySelector("#personnelApiStatus");
  const pageInfo = document.querySelector("#personnelPageInfo");

  if (searchInput) searchInput.value = personnelPage.search;
  if (stageFilter) stageFilter.value = personnelPage.stageId;
  if (roleFilter) roleFilter.value = personnelPage.role;
  if (statusFilter) statusFilter.value = personnelPage.status;
  if (pageSizeSelect) pageSizeSelect.value = String(personnelPage.pageSize);

  if (backendMode()) {
    const summary = personnelPage.summary || {};
    const meta = personnelPage.meta || { page: 1, pageSize: 20, total: 0, totalPages: 1 };
    document.querySelector("#personnelTotalCount").textContent = summary.total || 0;
    document.querySelector("#personnelTeacherCount").textContent = summary.teachers || 0;
    document.querySelector("#personnelAdminFinanceCount").textContent = summary.adminFinance || 0;
    document.querySelector("#personnelFilteredCount").textContent = summary.filtered ?? meta.total ?? 0;
    if (status) {
      status.textContent = personnelPage.loading
        ? "正在加载人员名册"
        : personnelPage.error || "已连接后端人员接口";
      status.className = personnelPage.error ? "status-pill warning" : "status-pill done";
    }
    table.innerHTML = personnelPage.loading
      ? `<tr><td colspan="8"><div class="empty-state">正在加载全校人员列表...</div></td></tr>`
      : personnelPage.error
        ? `<tr><td colspan="8"><div class="empty-state">${escapeHtml(personnelPage.error)}</div></td></tr>`
        : personnelPage.items.length
          ? personnelPage.items.map(personnelRow).join("")
          : `<tr><td colspan="8"><div class="empty-state">没有符合条件的人员</div></td></tr>`;
    if (pageInfo) {
      pageInfo.textContent = `第 ${meta.page || 1} / ${meta.totalPages || 1} 页 · 共 ${meta.total || 0} 人`;
    }
    document.querySelector("#personnelPrevPage").disabled = personnelPage.loading || (meta.page || 1) <= 1;
    document.querySelector("#personnelNextPage").disabled =
      personnelPage.loading || (meta.page || 1) >= (meta.totalPages || 1);
    return;
  }

  const rows = filteredLocalPersonnelRows();
  const totalPages = Math.max(Math.ceil(rows.length / personnelPage.pageSize), 1);
  const currentPage = Math.min(Math.max(personnelPage.page, 1), totalPages);
  const pageRows = rows.slice((currentPage - 1) * personnelPage.pageSize, currentPage * personnelPage.pageSize);
  document.querySelector("#personnelTotalCount").textContent = localPersonnelRows().length;
  document.querySelector("#personnelTeacherCount").textContent = state.teachers.length;
  document.querySelector("#personnelAdminFinanceCount").textContent = state.accounts.filter(
    (account) => account.role !== "teacher",
  ).length;
  document.querySelector("#personnelFilteredCount").textContent = rows.length;
  if (status) {
    status.textContent = "文件模式演示数据";
    status.className = "status-pill";
  }
  table.innerHTML = pageRows.length
    ? pageRows.map(personnelRow).join("")
    : `<tr><td colspan="8"><div class="empty-state">没有符合条件的人员</div></td></tr>`;
  if (pageInfo) {
    pageInfo.textContent = `第 ${currentPage} / ${totalPages} 页 · 共 ${rows.length} 人`;
  }
  document.querySelector("#personnelPrevPage").disabled = currentPage <= 1;
  document.querySelector("#personnelNextPage").disabled = currentPage >= totalPages;
}

function subjectTeacherPool(subject) {
  const configuredIds = [
    ...(subject.teacherIds || []),
    ...Object.values(subject.classTeacherIds || {})
      .flat()
      .map(String),
  ];
  const pool = subject.availableTeachers?.length
    ? subject.availableTeachers
    : (subject.teacherIds || []).map((teacherId) => ({
        id: teacherId,
        name: schedulingTeacherName(teacherId),
        title: "任课教师",
        department: state.schedulingConfig.divisionName,
      }));
  const poolIds = new Set(pool.map((teacher) => teacher.id));
  const missingSelected = Array.from(new Set(configuredIds))
    .filter((teacherId) => !poolIds.has(teacherId))
    .map((teacherId) => ({
      id: teacherId,
      name: schedulingTeacherName(teacherId),
      title: "已配置老师",
      department: state.schedulingConfig.divisionName,
    }));
  return [...pool, ...missingSelected].sort((a, b) =>
    String(a.employeeNo || a.id).localeCompare(String(b.employeeNo || b.id), "zh-CN"),
  );
}

function subjectClassTeacherIds(subject, classId) {
  if (!subject) return [];
  const classIds = subject.classTeacherIds?.[classId];
  if (Array.isArray(classIds) && classIds.length) {
    return Array.from(new Set(classIds.map(String).filter(Boolean)));
  }
  return Array.from(new Set((subject.teacherIds || []).map(String).filter(Boolean)));
}

function teacherInputValue(teacher) {
  if (!teacher) return "";
  const code = teacher.employeeNo || teacher.id;
  return `${teacher.name} / ${code}`;
}

function teacherQueryKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\/\s·・,，。:：-]+/g, "");
}

function teacherSearchFields(teacher) {
  return [
    teacher.id,
    teacher.employeeNo,
    teacher.name,
    teacher.username,
    teacherInputValue(teacher),
    `${teacher.name}${teacher.employeeNo || teacher.id}`,
  ].filter(Boolean);
}

function findTeacherMatchForSubject(subject, value) {
  const query = teacherQueryKey(value);
  if (!query) return null;
  const pool = subjectTeacherPool(subject);
  return (
    pool.find((teacher) => teacherSearchFields(teacher).some((field) => teacherQueryKey(field) === query)) ||
    pool.find((teacher) => teacherSearchFields(teacher).some((field) => teacherQueryKey(field).includes(query)))
  );
}

function classSubjectTeacher(subject, classId) {
  const teacherId = subjectClassTeacherIds(subject, classId)[0];
  return subjectTeacherPool(subject).find((teacher) => teacher.id === teacherId) || null;
}

function missingClassSubjectTeacherAssignments(config) {
  return (config.classes || []).flatMap((schoolClass) =>
    (config.subjects || [])
      .filter((subject) => !classSubjectTeacher(subject, schoolClass.id))
      .map((subject) => ({
        classId: schoolClass.id,
        className: schoolClass.name,
        subjectId: subject.id,
        subjectName: subject.name,
      })),
  );
}

function syncClassSubjectTeacherInput(input, options = {}) {
  const subject = state.schedulingConfig.subjects.find((item) => item.id === input.dataset.subjectId);
  const stateNode = input
    .closest(".teacher-assignment-cell")
    ?.querySelector("[data-assignment-match-state]");
  const value = input.value.trim();
  if (!subject || !value) {
    input.dataset.teacherId = "";
    input.classList.remove("matched", "invalid");
    input.classList.add("missing");
    if (stateNode) {
      stateNode.textContent = "未配置";
      stateNode.className = "teacher-assignment-state missing";
    }
    return null;
  }

  const teacher = findTeacherMatchForSubject(subject, value);
  if (!teacher) {
    input.dataset.teacherId = "";
    input.classList.remove("matched", "missing");
    input.classList.add("invalid");
    if (stateNode) {
      stateNode.textContent = "未匹配";
      stateNode.className = "teacher-assignment-state invalid";
    }
    return null;
  }

  input.dataset.teacherId = teacher.id;
  input.classList.remove("missing", "invalid");
  input.classList.add("matched");
  if (options.commit) input.value = teacherInputValue(teacher);
  if (stateNode) {
    stateNode.textContent = `${teacher.name} · ${teacher.employeeNo || teacher.id}`;
    stateNode.className = "teacher-assignment-state matched";
  }
  return teacher;
}

function teacherAssignmentMatrixInputs() {
  return Array.from(document.querySelectorAll("[data-class-subject-teacher-input]"));
}

function collectClassSubjectTeacherAssignments() {
  const missing = [];
  const bySubject = new Map((state.schedulingConfig.subjects || []).map((subject) => [subject.id, {}]));

  teacherAssignmentMatrixInputs().forEach((input) => {
    const teacher = syncClassSubjectTeacherInput(input, { commit: true });
    const subject = state.schedulingConfig.subjects.find((item) => item.id === input.dataset.subjectId);
    const schoolClass = state.schedulingConfig.classes.find((item) => item.id === input.dataset.classId);
    if (!subject || !schoolClass) return;
    if (!teacher) {
      missing.push(`${schoolClass.name} ${subject.name}`);
      return;
    }
    bySubject.get(subject.id)[schoolClass.id] = [teacher.id];
  });

  if (missing.length) {
    const preview = missing.slice(0, 4).join("、");
    throw new Error(`还有 ${missing.length} 个任课格未匹配：${preview}`);
  }

  return Array.from(bySubject.entries()).map(([subjectId, classTeacherIds]) => ({
    subjectId,
    classTeacherIds,
  }));
}

async function saveClassSubjectTeacherAssignments() {
  if (!backendMode() || currentRole() !== "admin") {
    showToast("请使用后端行政账号保存任课配置");
    return;
  }
  try {
    const payloads = collectClassSubjectTeacherAssignments();
    if (!payloads.length) {
      showToast("当前没有可保存的任课配置");
      return;
    }
    await Promise.all(
      payloads.map((payload) =>
        apiRequest("/api/scheduling/teacher-assignments", {
          method: "POST",
          body: {
            stageId: state.schedulingConfig.stageId,
            grade: state.schedulingConfig.grade,
            subjectId: payload.subjectId,
            classTeacherIds: payload.classTeacherIds,
          },
        }),
      ),
    );
    showToast("任课配置已保存，重新生成排课时生效");
    await loadBackendSchedulingContext();
  } catch (error) {
    showToast(error.message || "任课配置保存失败");
  }
}

function selectedSubjectTeacherCount(subjectId) {
  return document.querySelectorAll(`[data-assignment-teacher-option="${subjectId}"]:checked`).length;
}

function updateSubjectTeacherSelectionCount(subjectId) {
  const count = selectedSubjectTeacherCount(subjectId);
  const countNode = document.querySelector(`[data-assignment-selected-count="${subjectId}"]`);
  if (countNode) countNode.textContent = `${count} 位已选`;
}

function courseRuleForbiddenPeriodsValue(rule) {
  return normalizeCourseRulePeriods(rule.forbiddenPeriods || []).join(",");
}

function courseRulePreferredDayPartText(value) {
  const map = { any: "不限", morning: "上午", afternoon: "下午" };
  return map[normalizePreferredDayPart(value || "any")] || "不限";
}

function courseRuleConstraintSummary(rule) {
  const parts = [];
  const maxPerClassPerDay = Number(rule.maxPerClassPerDay || 0);
  if (maxPerClassPerDay > 0) {
    parts.push(`每班每天最多 ${maxPerClassPerDay} 节`);
  } else {
    parts.push("每日节数不限");
  }
  parts.push(rule.allowConsecutive === false ? "不允许连堂" : "允许连堂");
  const forbiddenPeriods = normalizeCourseRulePeriods(rule.forbiddenPeriods || []);
  parts.push(forbiddenPeriods.length ? `禁排第 ${forbiddenPeriods.join("、")} 节` : "无禁排节次");
  const preferred = normalizePreferredDayPart(rule.preferredDayPart || "any");
  parts.push(preferred === "any" ? "时段不限" : `偏好${courseRulePreferredDayPartText(preferred)}`);
  return parts.join(" · ");
}

function adminCourseRuleItem(rule) {
  const subjectId = escapeHtml(rule.subjectId);
  const allowConsecutive = rule.allowConsecutive !== false;
  const preferredDayPart = normalizePreferredDayPart(rule.preferredDayPart || "any");
  return `
    <article class="course-rule-item ${courseRulesEditMode ? "editing" : ""}" data-course-rule-id="${escapeHtml(rule.subjectId)}">
      <div class="course-rule-top">
        <div class="course-rule-name">
          <strong>${escapeHtml(rule.subjectName)}</strong>
          <small>当前年级课程</small>
        </div>
        <label class="field-label compact-field" for="courseWeekly-${subjectId}">
          <span>每周节数</span>
          <input
            id="courseWeekly-${subjectId}"
            data-course-rule-weekly="${subjectId}"
            type="number"
            min="0"
            max="12"
            value="${Number(rule.weeklyLessons || 0)}"
          />
        </label>
        <label class="field-label compact-field" for="courseDuration-${subjectId}">
          <span>每节时长</span>
          <div class="input-with-unit">
            <input
              id="courseDuration-${subjectId}"
              data-course-rule-duration="${subjectId}"
              type="number"
              min="20"
              max="120"
              step="5"
              value="${Number(rule.durationMinutes || 40)}"
            />
            <em>分钟</em>
          </div>
        </label>
        ${
          courseRulesEditMode
            ? `<button class="mini-button danger" data-delete-grade-course="${subjectId}" type="button">删除</button>`
            : ""
        }
      </div>
      <p class="course-rule-summary">${escapeHtml(courseRuleConstraintSummary(rule))}</p>
      ${
        courseRulesEditMode
          ? `
            <div class="course-rule-constraint-grid" aria-label="${escapeHtml(rule.subjectName)}课程限制">
              <label class="field-label compact-field" for="courseMaxDay-${subjectId}">
                <span>每班每天最多</span>
                <div class="input-with-unit">
                  <input
                    id="courseMaxDay-${subjectId}"
                    data-course-rule-max-day="${subjectId}"
                    type="number"
                    min="0"
                    max="${state.schedulingConfig.periods?.length || 6}"
                    value="${Number(rule.maxPerClassPerDay || 0)}"
                  />
                  <em>节</em>
                </div>
              </label>
              <label class="field-label compact-field" for="courseConsecutive-${subjectId}">
                <span>同班连堂</span>
                <select
                  class="lesson-select"
                  id="courseConsecutive-${subjectId}"
                  data-course-rule-consecutive="${subjectId}"
                >
                  <option value="true" ${allowConsecutive ? "selected" : ""}>允许</option>
                  <option value="false" ${allowConsecutive ? "" : "selected"}>不允许</option>
                </select>
              </label>
              <label class="field-label compact-field" for="courseForbidden-${subjectId}">
                <span>禁排节次</span>
                <input
                  id="courseForbidden-${subjectId}"
                  data-course-rule-forbidden-periods="${subjectId}"
                  type="text"
                  placeholder="例如 1,6"
                  value="${escapeHtml(courseRuleForbiddenPeriodsValue(rule))}"
                />
              </label>
              <label class="field-label compact-field" for="coursePreferred-${subjectId}">
                <span>偏好时段</span>
                <select
                  class="lesson-select"
                  id="coursePreferred-${subjectId}"
                  data-course-rule-preferred-day-part="${subjectId}"
                >
                  <option value="any" ${preferredDayPart === "any" ? "selected" : ""}>不限</option>
                  <option value="morning" ${preferredDayPart === "morning" ? "selected" : ""}>上午</option>
                  <option value="afternoon" ${preferredDayPart === "afternoon" ? "selected" : ""}>下午</option>
                </select>
              </label>
            </div>
          `
          : `
            <input type="hidden" data-course-rule-max-day="${subjectId}" value="${Number(rule.maxPerClassPerDay || 0)}" />
            <input type="hidden" data-course-rule-consecutive="${subjectId}" value="${allowConsecutive ? "true" : "false"}" />
            <input type="hidden" data-course-rule-forbidden-periods="${subjectId}" value="${escapeHtml(courseRuleForbiddenPeriodsValue(rule))}" />
            <input type="hidden" data-course-rule-preferred-day-part="${subjectId}" value="${preferredDayPart}" />
          `
      }
    </article>
  `;
}

function scheduleConstraintSubjectOptions(config) {
  const enabledRules = (config.courseRules || []).filter((rule) => rule.enabled);
  return enabledRules.length
    ? enabledRules
        .map(
          (rule) => `
            <option value="${escapeHtml(rule.subjectId)}">${escapeHtml(rule.subjectName)}</option>
          `,
        )
        .join("")
    : `<option value="">请先新增课程</option>`;
}

function scheduleConstraintPeriodOptions(config) {
  return [
    `<option value="all">任意节次</option>`,
    ...config.periods.map(
      (period) => `
        <option value="${period.period}">第 ${period.period} 节 · ${escapeHtml(period.time)}</option>
      `,
    ),
  ].join("");
}

function scheduleConstraintDayText(dayIndexes = []) {
  const labels = ["周一", "周二", "周三", "周四", "周五"];
  return dayIndexes.length ? dayIndexes.map((dayIndex) => labels[Number(dayIndex)] || `第 ${Number(dayIndex) + 1} 天`).join("、") : "任意工作日";
}

function scheduleConstraintPeriodText(periods = []) {
  return periods.length ? periods.map((period) => `第 ${period} 节`).join("、") : "任意节次";
}

function scheduleConstraintPeriodDetailText(periods = [], config = {}) {
  const periodList = config.periods || [];
  if (!periods.length) {
    const first = periodList[0]?.period || 1;
    const last = periodList[periodList.length - 1]?.period || first;
    return `当天所有节次（第 ${first}-${last} 节）`;
  }
  return periods
    .map((period) => {
      const matched = periodList.find((item) => Number(item.period) === Number(period));
      return matched ? `第 ${matched.period} 节（${matched.time}）` : `第 ${period} 节`;
    })
    .join("、");
}

function scheduleConstraintEffectText(config, constraint) {
  const subjectName = constraint.subjectName || constraint.subjectId;
  const days = scheduleConstraintDayText(constraint.dayIndexes);
  const periods = constraint.periods?.length
    ? scheduleConstraintPeriodText(constraint.periods)
    : "全天任意节次";
  return `自动排课和手动调整时，系统会跳过 ${config.divisionName}${config.gradeName} ${subjectName} 在 ${days} ${periods} 的候选时段。`;
}

function localScheduleConstraintViolation(subjectId, slot) {
  return (state.schedulingConfig.constraints || []).find((constraint) => {
    if (constraint.active === false || constraint.subjectId !== subjectId) return false;
    const dayIndexes = Array.isArray(constraint.dayIndexes) ? constraint.dayIndexes.map(Number) : [];
    const periods = Array.isArray(constraint.periods) ? constraint.periods.map(Number) : [];
    if (dayIndexes.length && !dayIndexes.includes(Number(slot.dayIndex))) return false;
    if (periods.length && !periods.includes(Number(slot.period))) return false;
    return true;
  });
}

function adminScheduleConstraintList(config) {
  const constraints = config.constraints || [];
  return constraints.length
    ? constraints
        .map(
          (constraint) => `
            <article class="constraint-item ${courseRulesEditMode ? "editing" : ""}">
              <div class="constraint-item-content">
                <div class="constraint-item-head">
                  <span class="constraint-rule-tag">硬约束</span>
                  <strong>${escapeHtml(constraint.subjectName)}</strong>
                </div>
                <div class="constraint-detail-grid">
                  <span class="constraint-detail-card">
                    <em>禁排课程</em>
                    <strong>${escapeHtml(constraint.subjectName)}</strong>
                  </span>
                  <span class="constraint-detail-card">
                    <em>禁排日期</em>
                    <strong>${scheduleConstraintDayText(constraint.dayIndexes)}</strong>
                  </span>
                  <span class="constraint-detail-card">
                    <em>禁排节次</em>
                    <strong>${scheduleConstraintPeriodDetailText(constraint.periods, config)}</strong>
                  </span>
                </div>
                <p class="constraint-effect">${escapeHtml(scheduleConstraintEffectText(config, constraint))}</p>
                ${
                  constraint.reason
                    ? `<p class="constraint-reason">原因：${escapeHtml(constraint.reason)}</p>`
                    : ""
                }
              </div>
              ${
                courseRulesEditMode
                  ? `<button class="mini-button danger" data-delete-schedule-constraint="${escapeHtml(constraint.id)}" type="button">删除</button>`
                  : ""
              }
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">暂无自定义硬约束</div>`;
}

function adminSelectedTeacherPoolSummary(config) {
  const totalCells = (config.classes || []).length * (config.subjects || []).length;
  const missing = missingClassSubjectTeacherAssignments(config);
  const assignedCells = Math.max(totalCells - missing.length, 0);
  const rows = config.subjects
    .map((subject) => {
      const assignedClasses = (config.classes || []).filter((schoolClass) =>
        classSubjectTeacher(subject, schoolClass.id),
      );
      const selectedTeachers = Array.from(
        new Map(
          assignedClasses
            .map((schoolClass) => classSubjectTeacher(subject, schoolClass.id))
            .filter(Boolean)
            .map((teacher) => [teacher.id, teacher]),
        ).values(),
      );
      const missingClassNames = (config.classes || [])
        .filter((schoolClass) => !classSubjectTeacher(subject, schoolClass.id))
        .map((schoolClass) => schoolClass.name);
      const teacherTags = selectedTeachers.length
        ? selectedTeachers
            .map(
              (teacher) => `
                <span class="teacher-pool-summary-tag">
                  ${escapeHtml(teacher.name)}
                  <small>${escapeHtml(teacher.employeeNo || teacher.id)}</small>
                </span>
              `,
            )
            .join("")
        : `<span class="teacher-pool-summary-empty">暂无任课老师</span>`;

      return `
        <article class="teacher-pool-summary-row">
          <div class="teacher-pool-summary-subject">
            <strong>${escapeHtml(subject.name)}</strong>
            <span>已配置 ${assignedClasses.length}/${(config.classes || []).length} 个班 · ${selectedTeachers.length} 位老师</span>
            ${
              missingClassNames.length
                ? `<span class="teacher-pool-summary-warning">缺少：${escapeHtml(missingClassNames.slice(0, 4).join("、"))}${missingClassNames.length > 4 ? " 等" : ""}</span>`
                : ""
            }
          </div>
          <div class="teacher-pool-summary-tags">${teacherTags}</div>
        </article>
      `;
    })
    .join("");

  return `
    <div class="teacher-pool-summary-head">
      <strong>任课配置进度</strong>
      <span>${escapeHtml(config.divisionName)}${escapeHtml(config.gradeName)} · ${assignedCells}/${totalCells || 0} 个格子已匹配${missing.length ? ` · ${missing.length} 个待补齐` : " · 可生成排课"}</span>
    </div>
    <div class="teacher-pool-summary-list">${rows}</div>
  `;
}

function adminSubjectConfigItem(config) {
  const subjects = config.subjects || [];
  const classes = config.classes || [];
  if (!subjects.length || !classes.length) {
    return `<div class="empty-state">请先配置当前年级的课程和班级</div>`;
  }
  const datalists = subjects
    .map((subject) => {
      const teachers = subjectTeacherPool(subject);
      return `
        <datalist id="teacher-options-${escapeHtml(subject.id)}">
          ${teachers
            .map(
              (teacher) => `
                <option value="${escapeHtml(teacherInputValue(teacher))}" label="${escapeHtml(`${teacher.id} · ${teacher.title || teacher.subject || "任课教师"}`)}"></option>
              `,
            )
            .join("")}
        </datalist>
      `;
    })
    .join("");

  return `
    <article class="subject-config-item teacher-assignment-matrix-card">
      <div class="subject-config-head">
        <div>
          <strong>班级任课老师指定表</strong>
          <span>按班级逐科指定老师，输入姓名、工号或教师 ID 后自动匹配。</span>
        </div>
        <div class="subject-config-meta">
          <span>${classes.length} 个班级</span>
          <span>${subjects.length} 门课程</span>
        </div>
      </div>
      ${datalists}
      <div class="teacher-assignment-scroll">
        <table class="teacher-assignment-matrix">
          <thead>
            <tr>
              <th>班级</th>
              ${subjects
                .map(
                  (subject) => `
                    <th>
                      <strong>${escapeHtml(subject.name)}</strong>
                      <span>每周 ${Number(subject.weeklyLessons || 0)} 节</span>
                    </th>
                  `,
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${classes
              .map(
                (schoolClass) => `
                  <tr>
                    <th>
                      <strong>${escapeHtml(schoolClass.name)}</strong>
                      <span>${escapeHtml(schoolClass.room || "")}</span>
                    </th>
                    ${subjects
                      .map((subject) => {
                        const teacher = classSubjectTeacher(subject, schoolClass.id);
                        const value = teacher ? teacherInputValue(teacher) : "";
                        return `
                          <td>
                            <div class="teacher-assignment-cell">
                              <input
                                class="teacher-assignment-input ${teacher ? "matched" : "missing"}"
                                data-class-subject-teacher-input
                                data-class-id="${escapeHtml(schoolClass.id)}"
                                data-subject-id="${escapeHtml(subject.id)}"
                                data-teacher-id="${escapeHtml(teacher?.id || "")}"
                                list="teacher-options-${escapeHtml(subject.id)}"
                                value="${escapeHtml(value)}"
                                placeholder="姓名/工号"
                                autocomplete="off"
                              />
                              <span class="teacher-assignment-state ${teacher ? "matched" : "missing"}" data-assignment-match-state>
                                ${teacher ? `${escapeHtml(teacher.name)} · ${escapeHtml(teacher.employeeNo || teacher.id)}` : "未配置"}
                              </span>
                            </div>
                          </td>
                        `;
                      })
                      .join("")}
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="subject-config-actions">
        <span>排课时每个班级科目只使用该格子匹配到的老师。</span>
        <div class="subject-config-buttons">
          <button class="mini-button primary" data-save-teacher-assignment-matrix type="button">保存全部任课配置</button>
        </div>
      </div>
    </article>
  `;
}

function schedulePeriodOptions(config, options = {}) {
  const empty = options.emptyLabel ? [`<option value="">${escapeHtml(options.emptyLabel)}</option>`] : [];
  return [
    ...empty,
    ...config.periods.map(
      (period) => `
        <option value="${period.period}">第 ${period.period} 节 · ${escapeHtml(period.time)}</option>
      `,
    ),
  ].join("");
}

function teacherRuleDayText(slot) {
  return `${scheduleConstraintDayText([slot.dayIndex])} ${scheduleConstraintPeriodDetailText(slot.periods, state.schedulingConfig)}`;
}

function adminTeacherRuleList(config) {
  const rules = config.teacherRules || [];
  return rules.length
    ? rules
        .map((rule) => {
          const unavailableText = rule.unavailableSlots?.length
            ? rule.unavailableSlots.map(teacherRuleDayText).join("；")
            : "未设置不可用时间";
          const avoidText = rule.avoidPeriods?.length
            ? scheduleConstraintPeriodDetailText(rule.avoidPeriods, config)
            : "无";
          const preferText = rule.preferPeriods?.length
            ? scheduleConstraintPeriodDetailText(rule.preferPeriods, config)
            : "无";
          return `
            <article class="teacher-rule-item">
              <div>
                <strong>${escapeHtml(rule.teacherName)}</strong>
                <span>${escapeHtml(rule.teacherId)} · 每日最多 ${Number(rule.maxDailyLessons || 4)} 节 · 最多连续 ${Number(rule.maxConsecutiveLessons || 3)} 节</span>
              </div>
              <p>不可用：${escapeHtml(unavailableText)}</p>
              <p>尽量避开：${escapeHtml(avoidText)} · 优先安排：${escapeHtml(preferText)}</p>
            </article>
          `;
        })
        .join("")
    : `<div class="empty-state">暂无老师时间规则，默认每日最多 4 节、最多连续 3 节。</div>`;
}

function scheduleDiagnosticItem(diagnostic) {
  const label = diagnostic.severity === "error" ? "需处理" : diagnostic.severity === "warning" ? "提醒" : "正常";
  const tagClass = diagnostic.severity === "error" ? "exception" : diagnostic.severity === "warning" ? "scheduled" : "completed";
  return `
    <article class="warning-item diagnostic-item">
      <header>
        <strong>${escapeHtml(diagnostic.title)}</strong>
        <span class="tag ${tagClass}">${label}</span>
      </header>
      <p>${escapeHtml(diagnostic.text)}</p>
    </article>
  `;
}

function scheduleDiagnosticsHtml(draft) {
  const diagnostics = draft.solver?.diagnostics || [];
  return diagnostics.length ? diagnostics.map(scheduleDiagnosticItem).join("") : "";
}

function adminChangeRequestList(config) {
  const requests = config.changeRequests || [];
  return requests.length
    ? requests
        .map(
          (request) => `
            <article class="change-request-item">
              <div>
                <strong>${escapeHtml(request.className)} · ${escapeHtml(request.subjectName)}</strong>
                <span>${escapeHtml(request.from?.teacherName)} ${escapeHtml(request.from?.date)} 第 ${request.from?.period || "-"} 节 → ${escapeHtml(request.to?.teacherName)} ${escapeHtml(request.to?.date)} 第 ${request.to?.period || "-"} 节</span>
                ${request.reason ? `<p>原因：${escapeHtml(request.reason)}</p>` : ""}
              </div>
              <div class="change-request-actions">
                <span class="tag ${request.status === "approved" ? "completed" : "scheduled"}">
                  ${request.status === "approved" ? "已通过" : "待审批"}
                </span>
                ${
                  request.status === "pending"
                    ? `<button class="mini-button primary" data-approve-change-request="${escapeHtml(request.id)}" type="button">审批通过</button>`
                    : ""
                }
              </div>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">暂无调课/代课申请</div>`;
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
    map.set(date, new Map());
    return map;
  }, new Map());
  assignments.forEach((assignment) => {
    if (!grouped.has(assignment.date)) return;
    const dayMap = grouped.get(assignment.date);
    const periodKey = Number(assignment.period);
    if (!dayMap.has(periodKey)) dayMap.set(periodKey, []);
    dayMap.get(periodKey).push(assignment);
  });

  const dayNames = ["周一", "周二", "周三", "周四", "周五"];
  return weekDates
    .map((date, index) => {
      const dayMap = grouped.get(date);
      const dayCount = Array.from(dayMap.values()).reduce((sum, items) => sum + items.length, 0);
      return `
        <article class="schedule-column">
          <header>
            <span>${dayNames[index]}</span>
            <strong>${formatDate(date)}</strong>
            <small>${dayCount ? `${dayCount} 节课` : "未排课"}</small>
          </header>
          <div class="schedule-items admin-schedule-slots">
            ${state.schedulingConfig.periods
              .map((period) => {
                const periodAssignments = dayMap.get(Number(period.period)) || [];
                return `
                  <div
                    class="schedule-slot-drop"
                    data-schedule-drop-date="${date}"
                    data-schedule-drop-period="${period.period}"
                  >
                    <div class="schedule-slot-label">
                      <strong>第 ${period.period} 节</strong>
                      <span>${escapeHtml(period.time)}</span>
                    </div>
                    <div class="schedule-slot-content">
                      ${
                        periodAssignments.length
                          ? periodAssignments.map(adminScheduleItem).join("")
                          : `<span class="schedule-empty compact">空节</span>`
                      }
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function adminScheduleItem(assignment) {
  const canDrag =
    backendMode() &&
    currentRole() === "admin" &&
    state.schedulingDraft.status !== "published" &&
    !schedulingBackendState.loading &&
    !assignment.locked;
  return `
    <div class="schedule-item ${canDrag ? "draggable" : ""}" ${canDrag ? `draggable="true" data-drag-assignment="${escapeHtml(assignment.id)}"` : ""}>
      <div class="schedule-main">
        <strong>${assignment.subjectName} · ${assignment.teacherName}</strong>
        <span>${assignment.room}</span>
        ${assignment.locked ? `<span class="tag locked">已锁定</span>` : ""}
      </div>
    </div>
  `;
}

function renderScanner() {
  const select = document.querySelector("#qrLessonSelect");
  if (!select) return;

  const teacherId = currentRole() === "teacher" ? currentTeacherId() : state.selectedFinanceTeacherId;
  const lessons = teacherLessons(teacherId);
  const actionableLesson = lessons.find(
    (lesson) =>
      lesson.status === "pending" ||
      lesson.status === "checkedIn" ||
      lesson.status === "scheduled",
  );
  const selectedLesson = lessons.find((lesson) => lesson.id === state.scannerLessonId);
  if (!selectedLesson || !["pending", "checkedIn", "scheduled"].includes(selectedLesson.status)) {
    state.scannerLessonId = actionableLesson?.id || lessons[0]?.id || "";
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

  if (!lesson) {
    payloadText.textContent = "";
    qrBox.innerHTML = `<div class="empty-state">暂无可生成二维码的课时</div>`;
  } else if (backendMode() && lesson.source === "backend-api") {
    const screenPath = classroomScreenPathForLesson(lesson);
    payloadText.textContent = `${window.location.origin}/${screenPath}`;
    qrBox.innerHTML = `
      <div class="empty-state">
        教室电脑打开动态签到屏<br />
        <code>${screenPath}</code>
      </div>
    `;
  } else if (typeof qrcode === "function") {
    payloadText.textContent = payload;
    const qr = qrcode(0, "M");
    qr.addData(payload);
    qr.make();
    qrBox.innerHTML = qr.createSvgTag(6, 1);
  } else {
    payloadText.textContent = payload;
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
  if (backendMode() && currentRole() === "teacher") {
    renderBackendTeacherRecords();
    return;
  }

  const teacherId = currentTeacherId();
  const records = teacherLessons(teacherId).filter(
    (lesson) => lesson.status === "checkedIn" || lesson.status === "completed" || lesson.status === "exception",
  );
  document.querySelector("#teacherRecordTable").innerHTML = records.length
    ? records.map(recordRow).join("")
    : `<tr><td colspan="7"><div class="empty-state">暂无考勤记录</div></td></tr>`;
}

function attendanceRecordTag(record) {
  if (record.status === "accepted") {
    return `<span class="tag completed">${record.actionLabel || "通过"}</span>`;
  }
  if (record.status === "exception") {
    return `<span class="tag exception">异常</span>`;
  }
  return `<span class="tag exception">已拦截</span>`;
}

function backendTeacherRecordRow(record) {
  return `
    <tr>
      <td data-label="日期">${formatDate(record.date)}</td>
      <td data-label="时间">${record.time || "-"}</td>
      <td class="row-title" data-label="班级">${record.className || "-"}</td>
      <td data-label="课程">${record.subjectName || "-"}</td>
      <td data-label="教室">${record.room || "-"}</td>
      <td data-label="考勤状态">${attendanceRecordTag(record)}</td>
      <td class="muted" data-label="记录说明">${record.resultText || "-"}</td>
    </tr>
  `;
}

function renderBackendTeacherRecords() {
  const teacherId = currentTeacherId();
  ensureBackendAttendanceRecords(teacherId);
  const table = document.querySelector("#teacherRecordTable");
  const isCurrent = attendanceRecordState.teacherId === teacherId;

  if (attendanceRecordState.loading && (!isCurrent || !attendanceRecordState.loaded)) {
    table.innerHTML = `<tr><td colspan="7"><div class="empty-state">正在加载后端考勤记录...</div></td></tr>`;
    return;
  }

  if (attendanceRecordState.error && isCurrent) {
    table.innerHTML = `<tr><td colspan="7"><div class="empty-state">${attendanceRecordState.error}</div></td></tr>`;
    return;
  }

  const records = isCurrent ? attendanceRecordState.records : [];
  table.innerHTML = records.length
    ? records.map(backendTeacherRecordRow).join("")
    : `<tr><td colspan="7"><div class="empty-state">暂无后端考勤记录</div></td></tr>`;
}

function renderConfirmation() {
  if (backendMode() && currentRole() === "teacher") {
    renderBackendConfirmation();
    return;
  }

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
    ["正常课时", `${salary.regularUnits} 节`, "签入签出完成后计入月度工作量"],
    ["早晚自习", `${salary.selfStudyUnits} 节`, "签入签出完成后计入月度工作量"],
    ["周末补课", `${salary.weekendUnits} 节`, "签入签出完成后计入月度工作量"],
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

function renderBackendConfirmation() {
  const teacherId = currentTeacherId();
  const month = "2026-06";
  if (
    (!teacherWorkloadState.loaded && !teacherWorkloadState.loading) ||
    teacherWorkloadState.teacherId !== teacherId ||
    teacherWorkloadState.month !== month
  ) {
    loadBackendWorkload(teacherId, month);
  }
  const data =
    teacherWorkloadState.teacherId === teacherId && teacherWorkloadState.month === month
      ? teacherWorkloadState.data
      : null;
  const stage = backendWorkloadStage(data);

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

  const list = document.querySelector("#workloadList");
  if (teacherWorkloadState.loading && !data) {
    list.innerHTML = `<div class="empty-state">正在读取后端月度工作内容...</div>`;
  } else if (teacherWorkloadState.error) {
    list.innerHTML = `<div class="empty-state">${teacherWorkloadState.error}</div>`;
  } else if (!data) {
    list.innerHTML = `<div class="empty-state">暂无后端月度工作内容</div>`;
  } else {
    const categories = data.categories || [];
    const summary = data.summary || {};
    list.innerHTML = [
      ...categories.map((category) => [category.label, `${category.units} 节`, "签入签出完成后计入月度工作量"]),
      ["待处理考勤", `${summary.pendingCount || 0} 节`, "未完成签入和签出，暂不计入工资"],
      ["异常记录", `${summary.exceptionCount || 0} 条`, "待教务复核后处理"],
      ["可计薪课时", `${summary.payableUnits || 0} 节`, "已完成签入签出的课时数量"],
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
  }

  document.querySelector("#confirmWorkload").disabled = stage > 0 || teacherWorkloadState.loading || Boolean(teacherWorkloadState.error);
  document.querySelector("#simulateApproval").disabled = true;
}

function setTeacherPayrollSupport(teacherId) {
  const lessons = teacherLessons(teacherId);
  const payableUnits = lessons
    .filter((lesson) => lesson.status === "completed")
    .reduce((sum, lesson) => sum + (lesson.units || 0), 0);
  const pendingCount = lessons.filter((lesson) => lesson.status === "pending" || lesson.status === "checkedIn").length;
  const stage = state.confirmationStages[teacherId] || 0;
  const supportValues = [
    ["#teacherPayrollPayableUnits", `${payableUnits} 节`],
    ["#teacherPayrollPendingUnits", `${pendingCount} 节`],
    ["#teacherPayrollConfirmState", confirmationText(teacherId)],
  ];

  supportValues.forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  });

  const grid = document.querySelector("#teacherPayrollSupportGrid");
  if (grid) {
    grid.dataset.confirmationStage = String(stage);
  }
}

function setTeacherPayrollWidgets({ amountText, statusText, statusClass = "status-pill", noteText, summaryText }) {
  ["#teacherPayrollNet", "#confirmPayrollNet", "#netPreview"].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = amountText;
  });

  ["#teacherPayrollStatus", "#confirmPayrollStatus"].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = statusText;
      element.className = statusClass;
    }
  });

  const dashboardStatus = document.querySelector("#dashboardPayrollStatus");
  if (dashboardStatus) dashboardStatus.textContent = statusText;

  const confirmNote = document.querySelector("#confirmPayrollNote");
  if (confirmNote && noteText) confirmNote.textContent = noteText;

  const summaryNote = document.querySelector("#teacherPayrollSummaryNote");
  if (summaryNote && summaryText) summaryNote.textContent = summaryText;
}

function renderTeacherPayroll() {
  const teacherId = currentRole() === "teacher" ? currentTeacherId() : "";
  setTeacherPayrollSupport(teacherId);

  if (backendMode() && currentRole() === "teacher") {
    ensureBackendTeacherPayroll(teacherId);
    const isCurrent = teacherPayrollState.teacherId === teacherId;
    const payroll = isCurrent ? teacherPayrollState.data : null;

    if (teacherPayrollState.loading && (!isCurrent || !teacherPayrollState.loaded)) {
      setTeacherPayrollWidgets({
        amountText: "读取中",
        statusText: "正在读取后端总薪资",
        statusClass: "status-pill",
        noteText: "正在读取本人月度总薪资",
        summaryText: "正在读取本人月度总薪资...",
      });
      return;
    }

    if (teacherPayrollState.error && isCurrent) {
      setTeacherPayrollWidgets({
        amountText: "¥0",
        statusText: teacherPayrollState.error,
        statusClass: "status-pill warning",
        noteText: "总薪资读取失败",
        summaryText: teacherPayrollState.error,
      });
      return;
    }

    const payrollStatus = payroll?.generated ? payrollStatusLabel(payroll.generated.status) : "后端试算";
    setTeacherPayrollWidgets({
      amountText: formatCurrency(payroll?.netPay || 0),
      statusText: payrollStatus,
      statusClass: payroll?.generated?.status === "locked" ? "status-pill locked" : "status-pill done",
      noteText: "明细仅财务端可见",
      summaryText: "老师端只展示月度汇总，不展示逐课时核算和薪资项目拆分。需要核对工作量时，请到“月度确认”和“考勤记录”查看课时数量与签到状态。",
    });
    return;
  }

  const salary = calculateSalary(teacherId);
  setTeacherPayrollWidgets({
    amountText: formatCurrency(salary.net),
    statusText: settlementText(teacherId),
    statusClass: "status-pill",
    noteText: "明细仅财务端可见",
    summaryText: "老师端只展示月度汇总，不展示逐课时核算和薪资项目拆分。需要核对工作量时，请到“月度确认”和“考勤记录”查看课时数量与签到状态。",
  });
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
  const filteredTeachers = financeFilteredTeacherItems();

  renderFinanceTeacherFilters("overview");
  document.querySelector("#financeTeacherCount").textContent = filteredTeachers.length;
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
    financePageInfo.textContent = `本地演示 · 共 ${filteredTeachers.length} 位老师`;
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

  document.querySelector("#financeOverviewTable").innerHTML = filteredTeachers
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
  document.querySelector("#financeSettledCount").textContent = financeTeacherPage.items.filter(
    (teacher) => teacher.payrollDetail?.status === "locked" || teacher.payroll?.status === "locked",
  ).length;
  document.querySelector("#financeGrossTotal").textContent = formatCurrency(totals.gross);
  document.querySelector("#financeNetTotal").textContent = formatCurrency(totals.net);

  renderFinanceTeacherFilters("overview");
  const pageInfo = document.querySelector("#financeTeacherPageInfo");
  const status = document.querySelector("#financeApiStatus");
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
                <td data-label="结算状态">${payrollStatusTag(teacher.payrollDetail?.status || teacher.payroll?.status || "preview")}</td>
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
  if (backendMode() && ["finance", "admin"].includes(currentRole())) {
    renderBackendFinanceRecords();
    return;
  }

  const select = document.querySelector("#financeTeacherSelect");
  renderFinanceTeacherFilters("records");
  const teacherId = state.selectedFinanceTeacherId;
  const lessons = teacherLessons(teacherId);
  document.querySelector("#financeRecordTable").innerHTML = lessons.length
    ? lessons.map(financeRecordRow).join("")
    : `<tr><td colspan="8"><div class="empty-state">该老师暂无记录</div></td></tr>`;
}

function backendFinanceWorkloadRows(workload) {
  if (!workload) return [];
  return [
    ...(workload.payableLines || []).map((line) => ({
      ...line,
      status: "completed",
      note: `可计薪 ${line.units} 节 · 金额 ${formatCurrency(line.amount || 0)}`,
    })),
    ...(workload.pendingLines || []).map((line) => ({
      ...line,
      status: line.status || "scheduled",
      note: "未完成签入和签出，暂不计入工资",
    })),
    ...(workload.exceptionLines || []).map((line) => ({
      ...line,
      status: "exception",
      note: line.note || "待教务复核",
    })),
  ].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function backendFinanceRecordRow(row, teacher) {
  return `
    <tr>
      <td data-label="日期">${formatDate(row.date)}</td>
      <td data-label="时间">${row.time}</td>
      <td class="row-title" data-label="老师">${teacher?.name || row.teacherName || "未选择老师"}</td>
      <td data-label="班级">${row.className}</td>
      <td data-label="课程">${row.subjectName || row.course}</td>
      <td data-label="教室">${row.room}</td>
      <td data-label="考勤状态">${attendanceRecordTag(row)}</td>
      <td class="muted" data-label="说明">${row.note}</td>
    </tr>
  `;
}

function renderBackendFinanceRecords() {
  if (!financeTeacherPage.loaded && !financeTeacherPage.loading) {
    loadFinanceTeacherPage();
  }
  renderFinanceTeacherFilters("records");
  const teacherId = state.selectedFinanceTeacherId;
  if (!teacherId) {
    document.querySelector("#financeRecordTable").innerHTML = `<tr><td colspan="8"><div class="empty-state">当前筛选下暂无老师，请调整学部、年级或搜索条件。</div></td></tr>`;
    return;
  }
  ensureBackendAttendanceRecords(teacherId);

  const table = document.querySelector("#financeRecordTable");
  const isCurrent = attendanceRecordState.teacherId === teacherId;

  if (attendanceRecordState.loading && (!isCurrent || !attendanceRecordState.loaded)) {
    table.innerHTML = `<tr><td colspan="8"><div class="empty-state">正在加载该老师后端扫码记录...</div></td></tr>`;
    return;
  }

  if (attendanceRecordState.error && isCurrent) {
    table.innerHTML = `<tr><td colspan="8"><div class="empty-state">${attendanceRecordState.error}</div></td></tr>`;
    return;
  }

  const rows = isCurrent ? attendanceRecordState.records : [];
  const teacher = attendanceRecordState.teacher || teacherById(teacherId);
  table.innerHTML = rows.length
    ? rows
        .map((row) =>
          backendFinanceRecordRow(
            {
              ...row,
              note: row.resultText,
            },
            teacher,
          ),
        )
        .join("")
    : `<tr><td colspan="8"><div class="empty-state">该老师暂无后端扫码记录</div></td></tr>`;
}

function renderSettlement() {
  if (backendMode() && ["finance", "admin"].includes(currentRole())) {
    renderBackendSettlement();
    return;
  }

  const select = document.querySelector("#settlementTeacherSelect");
  renderFinanceTeacherFilters("settlement");
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
  document.querySelector("#reviewTeacherPayroll").disabled = true;
  document.querySelector("#approveAcademicWorkload").disabled = true;
  document.querySelector("#approveSchoolWorkload").disabled = true;
  document.querySelector("#batchGeneratePayroll").disabled = true;
  document.querySelector("#exportPayrollCsv").disabled = true;
  renderPayrollRulesPanel();
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

function renderBackendSettlement() {
  if (!financeTeacherPage.loaded && !financeTeacherPage.loading) {
    loadFinanceTeacherPage();
  }
  renderFinanceTeacherFilters("settlement");
  const teacherId = state.selectedFinanceTeacherId;
  if (!teacherId) {
    document.querySelector("#settlementGrossSalary").textContent = "¥0";
    document.querySelector("#settlementTaxSalary").textContent = "¥0";
    document.querySelector("#settlementNetSalary").textContent = "¥0";
    document.querySelector("#settlementStatus").textContent = "当前筛选无老师";
    document.querySelector("#settlementStatus").className = "status-pill warning";
    document.querySelector("#settleTeacherPayroll").disabled = true;
    document.querySelector("#reviewTeacherPayroll").disabled = true;
    document.querySelector("#approveAcademicWorkload").disabled = true;
    document.querySelector("#approveSchoolWorkload").disabled = true;
    document.querySelector("#batchGeneratePayroll").disabled = currentRole() !== "finance";
    document.querySelector("#exportPayrollCsv").disabled = currentRole() !== "finance";
    document.querySelector("#settlementSalaryTable").innerHTML = `<tr><td colspan="3"><div class="empty-state">当前筛选下暂无老师，请调整学部、年级或搜索条件。</div></td></tr>`;
    renderPayrollRulesPanel();
    return;
  }
  ensureFinanceTeacherDetail(teacherId, { generatePayroll: true });
  if (!payrollRuleState.loaded && !payrollRuleState.loading) {
    loadPayrollRules();
  }
  renderPayrollRulesPanel();

  const detail =
    financeTeacherDetailState.teacherId === teacherId && financeTeacherDetailState.loaded
      ? financeTeacherDetailState
      : null;
  const payroll = detail?.payroll;
  const status = document.querySelector("#settlementStatus");
  const button = document.querySelector("#settleTeacherPayroll");
  const reviewButton = document.querySelector("#reviewTeacherPayroll");
  const academicButton = document.querySelector("#approveAcademicWorkload");
  const schoolButton = document.querySelector("#approveSchoolWorkload");
  const batchButton = document.querySelector("#batchGeneratePayroll");
  const exportButton = document.querySelector("#exportPayrollCsv");
  const table = document.querySelector("#settlementSalaryTable");

  if (financeTeacherDetailState.loading && !payroll) {
    document.querySelector("#settlementGrossSalary").textContent = "读取中";
    document.querySelector("#settlementTaxSalary").textContent = "读取中";
    document.querySelector("#settlementNetSalary").textContent = "读取中";
    status.textContent = "正在生成薪资明细";
    status.className = "status-pill";
    button.disabled = true;
    reviewButton.disabled = true;
    academicButton.disabled = true;
    schoolButton.disabled = true;
    batchButton.disabled = true;
    exportButton.disabled = true;
    table.innerHTML = `<tr><td colspan="3"><div class="empty-state">正在从后端生成该老师薪资明细...</div></td></tr>`;
    return;
  }

  if (financeTeacherDetailState.error) {
    document.querySelector("#settlementGrossSalary").textContent = "¥0";
    document.querySelector("#settlementTaxSalary").textContent = "¥0";
    document.querySelector("#settlementNetSalary").textContent = "¥0";
    status.textContent = financeTeacherDetailState.error;
    status.className = "status-pill warning";
    button.disabled = true;
    reviewButton.disabled = true;
    academicButton.disabled = true;
    schoolButton.disabled = true;
    batchButton.disabled = false;
    exportButton.disabled = false;
    table.innerHTML = `<tr><td colspan="3"><div class="empty-state">${financeTeacherDetailState.error}</div></td></tr>`;
    return;
  }

  if (!payroll) {
    document.querySelector("#settlementGrossSalary").textContent = "¥0";
    document.querySelector("#settlementTaxSalary").textContent = "¥0";
    document.querySelector("#settlementNetSalary").textContent = "¥0";
    status.textContent = "暂无薪资明细";
    status.className = "status-pill";
    button.disabled = true;
    reviewButton.disabled = true;
    academicButton.disabled = true;
    schoolButton.disabled = true;
    batchButton.disabled = false;
    exportButton.disabled = false;
    table.innerHTML = `<tr><td colspan="3"><div class="empty-state">请选择老师生成薪资明细</div></td></tr>`;
    return;
  }

  document.querySelector("#settlementGrossSalary").textContent = formatCurrency(payroll.grossPay || 0);
  document.querySelector("#settlementTaxSalary").textContent = formatCurrency(payroll.tax || 0);
  document.querySelector("#settlementNetSalary").textContent = formatCurrency(payroll.netPay || 0);
  const payrollStatus = payroll.generated?.status || "generated";
  const confirmationStatus = financeTeacherDetailState.workload?.confirmation?.status || payroll.confirmation?.status || "unconfirmed";
  status.textContent = payroll.generated
    ? `${payrollStatusLabel(payrollStatus)} · 工作量${confirmationText(payroll.teacher?.id || state.selectedFinanceTeacherId)} ${payroll.generated.lockedAt?.slice(0, 10) || payroll.generated.reviewedAt?.slice(0, 10) || payroll.generated.generatedAt?.slice(0, 10) || ""}`
    : "后端试算";
  status.className = payrollStatus === "locked" ? "status-pill locked" : "status-pill done";
  academicButton.disabled = financeTeacherDetailState.loading || currentRole() !== "admin" || confirmationStatus !== "teacher_confirmed";
  schoolButton.disabled = financeTeacherDetailState.loading || currentRole() !== "admin" || confirmationStatus !== "academic_approved";
  reviewButton.disabled = financeTeacherDetailState.loading || currentRole() !== "finance" || payrollStatus !== "generated" || confirmationStatus !== "school_approved";
  button.disabled = financeTeacherDetailState.loading || currentRole() !== "finance" || payrollStatus !== "reviewed" || confirmationStatus !== "school_approved";
  batchButton.disabled = financeTeacherDetailState.loading || currentRole() !== "finance";
  exportButton.disabled = financeTeacherDetailState.loading || currentRole() !== "finance";
  table.innerHTML = (payroll.rows || [])
    .map(
      (row) => `
        <tr>
          <td class="row-title" data-label="薪资项目">${row.name}</td>
          <td class="muted" data-label="计算口径">${row.basis}</td>
          <td data-label="金额">${formatCurrency(row.amount || 0)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderPayrollRulesPanel() {
  const rules = payrollRuleState.rules || {
    baseSalary: 6500,
    positionSalary: 1500,
    regular: state.rules.regularLessonRate,
    morning: state.rules.selfStudyRate,
    evening: state.rules.selfStudyRate,
    weekend: state.rules.weekendRate,
    makeup: 100,
    taxThreshold: state.rules.taxThreshold,
    taxRate: state.rules.taxRate,
  };
  const fields = [
    ["#ruleBaseSalary", rules.baseSalary],
    ["#rulePositionSalary", rules.positionSalary],
    ["#ruleRegular", rules.regular],
    ["#ruleMorning", rules.morning],
    ["#ruleEvening", rules.evening],
    ["#ruleWeekend", rules.weekend],
    ["#ruleMakeup", rules.makeup],
    ["#ruleTaxThreshold", rules.taxThreshold],
    ["#ruleTaxRate", rules.taxRate],
  ];
  fields.forEach(([selector, value]) => {
    const input = document.querySelector(selector);
    if (input && document.activeElement !== input) input.value = value ?? 0;
  });
  const saveButton = document.querySelector("#savePayrollRules");
  if (saveButton) {
    saveButton.disabled = payrollRuleState.loading || !backendMode() || currentRole() !== "finance";
    saveButton.textContent = payrollRuleState.loading ? "保存中" : "保存规则";
  }
}

function renderWarnings() {
  if (backendMode()) {
    renderBackendWarnings();
    return;
  }

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

function renderBackendWarnings() {
  const role = currentRole();
  const teacherId = role === "teacher" ? currentTeacherId() : state.selectedFinanceTeacherId;
  ensureBackendAttendanceRecords(teacherId);
  const isCurrent = attendanceRecordState.teacherId === teacherId;
  document.querySelector("#warningsTitle").textContent = role === "teacher" ? "我的异常提醒" : "老师异常扫码记录";

  const list = document.querySelector("#warningList");
  if (attendanceRecordState.loading && (!isCurrent || !attendanceRecordState.loaded)) {
    list.innerHTML = `<div class="empty-state">正在加载后端异常记录...</div>`;
    return;
  }

  if (attendanceRecordState.error && isCurrent) {
    list.innerHTML = `<div class="empty-state">${attendanceRecordState.error}</div>`;
    return;
  }

  const warnings = (isCurrent ? attendanceRecordState.records : []).filter((record) => record.status !== "accepted");
  list.innerHTML = warnings.length
    ? warnings
        .map(
          (warning) => `
            <article class="warning-item">
              <header>
                <strong>${warning.actionLabel} · ${warning.className || "未匹配课次"}</strong>
                <span class="tag exception">${warning.status === "exception" ? "异常" : "拦截"}</span>
              </header>
              <p>${formatDate(warning.date)} ${warning.time || ""} · ${warning.room || "未知教室"} · ${warning.resultText}</p>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">暂无后端异常记录</div>`;
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

function backendFinanceTeacherOptions(selectedId) {
  const teachers = financeTeacherPage.items.length
    ? financeTeacherPage.items
    : state.teachers.filter((teacher) => teacher.id.startsWith("T"));
  return teachers
    .map(
      (teacher) => `
        <option value="${teacher.id}" ${teacher.id === selectedId ? "selected" : ""}>
          ${teacher.name} · ${backendTeacherDepartment(teacher)} · ${backendTeacherSubject(teacher)}
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
        <span>${lesson.room} · ${lessonTypeLabel[lesson.type]}</span>
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
  if (lesson.status === "pending" || lesson.status === "scheduled") {
    return `<button class="mini-button primary" data-attendance-action="checkIn" data-scan="${lesson.id}" type="button">签入</button>`;
  }
  if (lesson.status === "checkedIn") {
    return `<button class="mini-button primary" data-attendance-action="checkOut" data-scan="${lesson.id}" type="button">签出</button>`;
  }
  if (lesson.status === "completed") {
    return `<span class="muted">已完成</span>`;
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

function roomDisplayKeyForDevelopment(roomId) {
  return `screen-${String(roomId || "").toLowerCase()}`;
}

async function dynamicQrPayloadForLesson(lesson) {
  if (!backendMode() || !lesson?.roomId) return buildQrPayload(lesson);
  const result = await apiRequest(
    `/api/classrooms/${encodeURIComponent(lesson.roomId)}/dynamic-qr?displayKey=${encodeURIComponent(
      roomDisplayKeyForDevelopment(lesson.roomId),
    )}`,
  );
  return JSON.stringify(result.payload);
}

function classroomScreenPathForLesson(lesson) {
  if (!lesson?.roomId) return "";
  return `classroom.html?roomId=${encodeURIComponent(lesson.roomId)}&displayKey=${encodeURIComponent(
    roomDisplayKeyForDevelopment(lesson.roomId),
  )}`;
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

function lessonMatchesQrRoom(lesson, payload) {
  return (
    (payload.roomId && lesson.roomId === payload.roomId) ||
    (payload.roomName && lesson.room === payload.roomName) ||
    (payload.room && lesson.room === payload.room)
  );
}

function qrRoomLabel(payload) {
  return payload.roomName || payload.room || payload.roomId || "未知教室";
}

function findCurrentLessonForPayload(payload, action, targetLessonId, nowText = state.demoNow) {
  const teacherId = currentTeacherId();
  const now = new Date(nowText);
  return teacherLessons(teacherId).find((lesson) => {
    if (targetLessonId && lesson.id !== targetLessonId) return false;
    if (!lessonMatchesQrRoom(lesson, payload)) return false;
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

  const dynamicPayload = payload.app === "school-system" && payload.type === "classroom-dynamic-qr";
  const staticPayload = payload.app === "school-teacher-pay-demo" && payload.action === "classroom-checkin";
  const typePassed = backendMode() ? dynamicPayload : dynamicPayload || staticPayload;
  pushCheck(
    checks,
    "业务类型",
    typePassed,
    dynamicPayload
      ? "属于教室电脑实时二维码"
      : staticPayload
        ? "属于本地固定教室码"
        : "不是本系统教室二维码",
  );

  let signaturePassed = false;
  if (dynamicPayload) {
    signaturePassed = Boolean(payload.signature);
  } else {
    const expectedSignature = signPayload(payload);
    signaturePassed = Boolean(payload.signature) && payload.signature === expectedSignature;
  }
  pushCheck(
    checks,
    "教室码防伪",
    signaturePassed,
    dynamicPayload
      ? "动态码签名将由后端验签"
      : signaturePassed
        ? "固定教室码签名匹配"
        : "签名不匹配，疑似伪造或篡改",
  );

  if (dynamicPayload) {
    const expiresAt = new Date(payload.expiresAt);
    const freshnessPassed = !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() >= Date.now();
    pushCheck(checks, "动态码有效期", freshnessPassed, freshnessPassed ? "二维码未过期" : "二维码已过期，请扫教室屏幕新码");
  }

  const rolePassed = currentRole() === "teacher";
  pushCheck(checks, "账号角色", rolePassed, rolePassed ? "当前为老师账号" : "财务账号不能代替老师考勤");

  const teacher = teacherById(currentTeacherId());
  const devicePassed = currentAccount().deviceId && teacher?.boundDeviceId === currentAccount().deviceId;
  pushCheck(checks, "绑定设备", devicePassed, devicePassed ? "当前设备与老师账号绑定信息一致" : "非绑定设备，需重新认证");

  const roomExists = state.lessons.some((item) => lessonMatchesQrRoom(item, payload));
  pushCheck(checks, "教室存在", roomExists, roomExists ? `识别到教室 ${qrRoomLabel(payload)}` : "系统没有这个教室码");

  lesson = findCurrentLessonForPayload(payload, action, options.lessonId, nowText);
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
    ((action === "checkIn" && (lesson.status === "pending" || lesson.status === "scheduled")) ||
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
    list.innerHTML = `<div class="empty-state">扫码后会显示格式、动态教室码防伪、有效期、老师账号、绑定设备、签入/签出时间窗口、课时状态、重复计薪拦截等校验结果。</div>`;
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

async function handleDecodedScan(decodedText, options = {}) {
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
  await recordAttendance(validation.lesson.id, validation.action, validation.nowText, decodedText);
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

async function attemptSecureAttendance(id, action = null) {
  const lesson = state.lessons.find((item) => item.id === id);
  if (!lesson) return;
  const attendanceAction = action || actionForLesson(lesson);
  const qrPayload = await dynamicQrPayloadForLesson(lesson);
  await handleDecodedScan(qrPayload, {
    action: attendanceAction,
    lessonId: lesson.id,
    nowText: demoTimeForAction(lesson, attendanceAction),
  });
}

async function recordBackendAttendance(lesson, action, nowText, qrPayload) {
  try {
    const result = await apiRequest(`/api/teachers/${currentTeacherId()}/attendance`, {
      method: "POST",
      body: {
        lessonId: lesson.backendId || lesson.id,
        action,
        qrPayload,
        occurredAt: nowText,
      },
    });
    state.lastSecurityChecks = result.checks || state.lastSecurityChecks;
    state.lastSecurityPassed = true;
    const normalized = normalizeBackendLesson(result.lesson);
    const index = state.lessons.findIndex((item) => item.id === lesson.id);
    if (index >= 0) {
      state.lessons[index] = normalized;
    } else {
      state.lessons.push(normalized);
    }
    teacherWorkloadState.loaded = false;
    teacherWorkloadState.data = null;
    resetTeacherPayrollState();
    resetAttendanceRecordState();
    const label = action === "checkIn" ? "签入" : "签出";
    showToast(`${normalized.className} ${normalized.course} 后端${label}成功`);
    render();
  } catch (error) {
    state.lastSecurityChecks = error.details?.checks || state.lastSecurityChecks;
    state.lastSecurityPassed = false;
    resetTeacherPayrollState();
    resetAttendanceRecordState();
    showToast(error.message || "后端考勤提交失败");
    render();
  }
}

async function recordAttendance(id, action, nowText, qrPayload = "") {
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

  if (backendMode() && lesson.source === "backend-api") {
    await recordBackendAttendance(lesson, action, nowText, qrPayload || buildQrPayload(lesson));
    return;
  }

  if (action === "checkIn" && lesson.status !== "pending" && lesson.status !== "scheduled") {
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
    lockedCount: 0,
    publishedLessonIds: [],
  };
  showToast(
    conflicts.length
      ? `已生成${config.gradeName}草稿，发现 ${conflicts.length} 个冲突`
      : `已生成${config.gradeName}无冲突排课草稿`,
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
    showToast("存在老师、班级或教室冲突，不能发布");
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
    durationMinutes: assignment.durationMinutes || 40,
    room: assignment.room,
    roomId: assignment.roomId,
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
  if (!window.isSecureContext && window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost") {
    showToast("摄像头需要 HTTPS 或 localhost，请使用手动输入兜底");
    document.querySelector("#scannerStatus").textContent = "需要 HTTPS";
    document.querySelector("#scannerStatus").className = "status-pill warning";
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
    async (decodedText) => {
      await handleDecodedScan(decodedText, selectedScannerActionContext());
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
  resetTeacherWorkloadState();
  resetAttendanceRecordState();
  resetTeacherPayrollState();
  resetFinanceTeacherDetailState();
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
  resetPersonnelPage();
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
        await loadBackendTeacherContext(payload.account.teacherId, "auto");
      }
      if (payload.account.role === "finance") {
        financeTeacherPage = {
          ...financeTeacherPage,
          page: 1,
          loaded: false,
          error: "",
        };
        await loadFinanceTeacherPage({ page: 1 });
        await loadPayrollRules();
      }
      if (payload.account.role === "admin") {
        schedulingBackendState = { loaded: false, loading: false, error: "" };
        resetPersonnelPage();
        await loadBackendSchedulingContext();
        await loadFinanceTeacherPage({ page: 1 });
        await loadPayrollRules();
      }
      await loadBackendNotifications();
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
  resetPersonnelPage();
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

document.addEventListener("input", (event) => {
  const assignmentInput = event.target.closest("[data-class-subject-teacher-input]");
  if (assignmentInput) {
    syncClassSubjectTeacherInput(assignmentInput);
  }
});

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

  const scheduleDateButton = event.target.closest("[data-schedule-date]");
  if (scheduleDateButton) {
    state.selectedScheduleDate = scheduleDateButton.dataset.scheduleDate;
    renderSchedule();
    return;
  }

  const scanButton = event.target.closest("[data-scan]");
  if (scanButton) {
    await attemptSecureAttendance(scanButton.dataset.scan, scanButton.dataset.attendanceAction);
    return;
  }

  const noticeButton = event.target.closest("[data-notice-open]");
  if (noticeButton) {
    state.selectedNoticeId = noticeButton.dataset.noticeOpen;
    await markBackendNoticeRead(state.selectedNoticeId);
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
    resetAttendanceRecordState();
    resetFinanceTeacherDetailState();
    if (backendMode()) {
      await loadBackendAttendanceRecords(state.selectedFinanceTeacherId);
    }
    switchView("financeRecords");
    return;
  }

  const financeSettleButton = event.target.closest("[data-finance-settle]");
  if (financeSettleButton) {
    state.selectedFinanceTeacherId = financeSettleButton.dataset.financeSettle;
    resetFinanceTeacherDetailState();
    if (backendMode()) {
      await loadFinanceTeacherDetail(state.selectedFinanceTeacherId, { generatePayroll: true });
    }
    switchView("settlement");
    return;
  }

  if (event.target.closest("[data-save-teacher-assignment-matrix]")) {
    await saveClassSubjectTeacherAssignments();
    return;
  }

  const selectAllAssignmentButton = event.target.closest("[data-select-all-assignment]");
  if (selectAllAssignmentButton) {
    const subjectId = selectAllAssignmentButton.dataset.selectAllAssignment;
    document.querySelectorAll(`[data-assignment-teacher-option="${subjectId}"]`).forEach((input) => {
      input.checked = true;
    });
    updateSubjectTeacherSelectionCount(subjectId);
    return;
  }

  const clearAssignmentButton = event.target.closest("[data-clear-assignment]");
  if (clearAssignmentButton) {
    const subjectId = clearAssignmentButton.dataset.clearAssignment;
    document.querySelectorAll(`[data-assignment-teacher-option="${subjectId}"]`).forEach((input) => {
      input.checked = false;
    });
    updateSubjectTeacherSelectionCount(subjectId);
    return;
  }

  if (event.target.closest("#toggleCourseEditMode")) {
    courseRulesEditMode = !courseRulesEditMode;
    renderAdminScheduling();
    return;
  }

  const deleteScheduleConstraintButton = event.target.closest("[data-delete-schedule-constraint]");
  if (deleteScheduleConstraintButton) {
    await deleteAdminScheduleConstraint(deleteScheduleConstraintButton.dataset.deleteScheduleConstraint);
    return;
  }

  const deleteGradeCourseButton = event.target.closest("[data-delete-grade-course]");
  if (deleteGradeCourseButton) {
    await deleteAdminGradeCourse(deleteGradeCourseButton.dataset.deleteGradeCourse);
    return;
  }

  const saveAssignmentButton = event.target.closest("[data-save-assignment]");
  if (saveAssignmentButton) {
    if (!backendMode() || currentRole() !== "admin") {
      showToast("请使用后端行政账号保存任课关系");
      return;
    }
    const subjectId = saveAssignmentButton.dataset.saveAssignment;
    const teacherIds = Array.from(
      document.querySelectorAll(`[data-assignment-teacher-option="${subjectId}"]:checked`),
    ).map((input) => input.value);
    if (!teacherIds.length) {
      showToast("请至少选择 1 位任课老师");
      return;
    }
    try {
      await apiRequest("/api/scheduling/teacher-assignments", {
        method: "POST",
        body: {
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          subjectId,
          teacherIds,
        },
      });
      showToast("任课关系已保存，重新生成排课时生效");
      await loadBackendSchedulingContext();
    } catch (error) {
      showToast(error.message || "任课关系保存失败");
    }
    return;
  }

  const assignmentTeacherOption = event.target.closest("[data-assignment-teacher-option]");
  if (assignmentTeacherOption) {
    updateSubjectTeacherSelectionCount(assignmentTeacherOption.dataset.assignmentTeacherOption);
    return;
  }

  const approveChangeRequestButton = event.target.closest("[data-approve-change-request]");
  if (approveChangeRequestButton) {
    await approveScheduleChangeRequest(approveChangeRequestButton.dataset.approveChangeRequest);
    return;
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

document.querySelector("#scanNextLesson").addEventListener("click", async (event) => {
  const lesson = state.lessons.find((item) => item.id === event.currentTarget.dataset.id);
  await attemptSecureAttendance(event.currentTarget.dataset.id, lesson ? actionForLesson(lesson) : null);
});

document.querySelector("#quickScan").addEventListener("click", async (event) => {
  const lesson = state.lessons.find((item) => item.id === event.currentTarget.dataset.id);
  await attemptSecureAttendance(event.currentTarget.dataset.id, lesson ? actionForLesson(lesson) : null);
});

document.querySelector("#generateSchedule").addEventListener("click", generateAdminSchedule);
document.querySelector("#confirmSchedule").addEventListener("click", confirmAndPublishSchedule);
document.querySelector("#saveCourseRules").addEventListener("click", saveAdminCourseRules);
document.querySelector("#addGradeCourse").addEventListener("click", addAdminGradeCourse);
document.querySelector("#addScheduleConstraint").addEventListener("click", addAdminScheduleConstraint);
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

document.querySelector("#confirmWorkload").addEventListener("click", async () => {
  if (backendMode() && currentRole() === "teacher") {
    await confirmBackendWorkload();
    return;
  }

  const teacherId = currentTeacherId();
  const pendingCount = teacherLessons(teacherId).filter(
    (lesson) => lesson.status === "pending" || lesson.status === "checkedIn",
  ).length;
  state.confirmationStages[teacherId] = 1;
  showToast(pendingCount > 0 ? "已确认，未完成考勤项目暂不计入工资" : "本月工作量已确认");
  render();
});

document.querySelector("#simulateApproval").addEventListener("click", () => {
  if (backendMode()) {
    showToast("后端模式下需由教务和总校角色审批，当前先禁止老师端模拟审批");
    return;
  }

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

async function applyFinanceTeacherFilters(context = "overview", options = {}) {
  const next = financeReadFilterInputs(context);
  if (options.resetGrade) next.grade = "";
  financeTeacherPage = {
    ...financeTeacherPage,
    ...next,
    page: 1,
    loaded: backendMode() ? financeTeacherPage.loaded : true,
  };
  resetAttendanceRecordState();
  resetFinanceTeacherDetailState();

  if (backendMode()) {
    await loadFinanceTeacherPage({ page: 1, ...next, grade: options.resetGrade ? "" : next.grade });
    if (state.activeView === "financeRecords" && state.selectedFinanceTeacherId) {
      await loadBackendAttendanceRecords(state.selectedFinanceTeacherId);
    }
    if (state.activeView === "settlement" && state.selectedFinanceTeacherId) {
      await loadFinanceTeacherDetail(state.selectedFinanceTeacherId, { generatePayroll: true });
    }
    return;
  }

  const teachers = financeFilteredTeacherItems();
  state.selectedFinanceTeacherId = teachers.some((teacher) => teacher.id === state.selectedFinanceTeacherId)
    ? state.selectedFinanceTeacherId
    : teachers[0]?.id || "";
  render();
}

[
  ["#financeStageFilter", "overview"],
  ["#financeRecordsStageFilter", "records"],
  ["#settlementStageFilter", "settlement"],
].forEach(([selector, context]) => {
  document.querySelector(selector).addEventListener("change", () => {
    applyFinanceTeacherFilters(context, { resetGrade: true });
  });
});

[
  ["#financeGradeFilter", "overview"],
  ["#financeRecordsGradeFilter", "records"],
  ["#settlementGradeFilter", "settlement"],
  ["#financeTeacherPageSize", "overview"],
].forEach(([selector, context]) => {
  document.querySelector(selector).addEventListener("change", () => {
    applyFinanceTeacherFilters(context);
  });
});

[
  ["#financeTeacherSearchButton", "overview"],
  ["#financeRecordsSearchButton", "records"],
  ["#settlementTeacherSearchButton", "settlement"],
].forEach(([selector, context]) => {
  document.querySelector(selector).addEventListener("click", () => {
    applyFinanceTeacherFilters(context);
  });
});

[
  ["#financeTeacherSearch", "overview"],
  ["#financeRecordsSearch", "records"],
  ["#settlementTeacherSearch", "settlement"],
].forEach(([selector, context]) => {
  document.querySelector(selector).addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyFinanceTeacherFilters(context);
  });
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

function applyPersonnelFilters() {
  personnelPage.search = document.querySelector("#personnelSearch").value.trim();
  personnelPage.stageId = document.querySelector("#personnelStageFilter").value;
  personnelPage.role = document.querySelector("#personnelRoleFilter").value;
  personnelPage.status = document.querySelector("#personnelStatusFilter").value;
  personnelPage.pageSize = Number.parseInt(document.querySelector("#personnelPageSize").value, 10);
  if (backendMode()) {
    loadPersonnelPage({ page: 1 });
  } else {
    personnelPage.page = 1;
    renderPersonnelList();
  }
}

document.querySelector("#personnelSearchButton").addEventListener("click", applyPersonnelFilters);

document.querySelector("#personnelSearch").addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  applyPersonnelFilters();
});

document.querySelector("#personnelStageFilter").addEventListener("change", applyPersonnelFilters);
document.querySelector("#personnelRoleFilter").addEventListener("change", applyPersonnelFilters);
document.querySelector("#personnelStatusFilter").addEventListener("change", applyPersonnelFilters);
document.querySelector("#personnelPageSize").addEventListener("change", applyPersonnelFilters);

document.querySelector("#personnelPrevPage").addEventListener("click", () => {
  if (backendMode()) {
    const nextPage = Math.max((personnelPage.meta?.page || personnelPage.page) - 1, 1);
    loadPersonnelPage({ page: nextPage });
  } else {
    personnelPage.page = Math.max(personnelPage.page - 1, 1);
    renderPersonnelList();
  }
});

document.querySelector("#personnelNextPage").addEventListener("click", () => {
  if (backendMode()) {
    const meta = personnelPage.meta || { page: 1, totalPages: 1 };
    const nextPage = Math.min((meta.page || personnelPage.page || 1) + 1, meta.totalPages || 1);
    loadPersonnelPage({ page: nextPage });
  } else {
    const totalPages = Math.max(Math.ceil(filteredLocalPersonnelRows().length / personnelPage.pageSize), 1);
    personnelPage.page = Math.min(personnelPage.page + 1, totalPages);
    renderPersonnelList();
  }
});

document.querySelector("#qrLessonSelect").addEventListener("change", (event) => {
  state.scannerLessonId = event.target.value;
  renderScanner();
});

document.querySelector("#scheduleWeekSelect").addEventListener("change", async (event) => {
  state.selectedScheduleWeekStart = event.target.value;
  const weekDates = weekDateKeys(state.selectedScheduleWeekStart);
  state.selectedScheduleDate = weekDates.includes(todayKey()) ? todayKey() : weekDates[0];
  if (backendMode() && currentRole() === "teacher") {
    await loadBackendTeacherContext(currentTeacherId(), event.target.value);
  }
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
  state.selectedScheduleAssignmentId = "";
  renderAdminScheduling();
});

document.querySelector("#adminAssignmentSelect").addEventListener("change", (event) => {
  state.selectedScheduleAssignmentId = event.target.value;
  renderAdminScheduling();
});

document.querySelector("#changeAssignmentSelect").addEventListener("change", (event) => {
  state.selectedScheduleAssignmentId = event.target.value;
  renderAdminScheduling();
});

document.querySelector("#teacherRuleTeacherSelect").addEventListener("change", () => {
  const selectedRule = (state.schedulingConfig.teacherRules || []).find(
    (rule) => rule.teacherId === document.querySelector("#teacherRuleTeacherSelect").value,
  );
  document.querySelector("#teacherRuleMaxDaily").value = selectedRule?.maxDailyLessons || 4;
  document.querySelector("#teacherRuleMaxConsecutive").value = selectedRule?.maxConsecutiveLessons || 3;
});

document.querySelector("#applyScheduleAdjustment").addEventListener("click", () => {
  applyScheduleAdjustment();
});

document.querySelector("#toggleScheduleAssignmentLock").addEventListener("click", () => {
  toggleScheduleAssignmentLock();
});

document.querySelector("#regenerateUnlockedSchedule").addEventListener("click", () => {
  regenerateUnlockedSchedule();
});

document.querySelector("#saveTeacherRule").addEventListener("click", () => {
  saveTeacherScheduleRule();
});

document.querySelector("#submitScheduleChangeRequest").addEventListener("click", () => {
  submitScheduleChangeRequest();
});

document.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-drag-assignment]");
  if (!item) return;
  draggedScheduleAssignmentId = item.dataset.dragAssignment;
  event.dataTransfer?.setData("text/plain", draggedScheduleAssignmentId);
});

document.addEventListener("dragover", (event) => {
  if (!draggedScheduleAssignmentId || !event.target.closest("[data-schedule-drop-date]")) return;
  event.preventDefault();
});

document.addEventListener("drop", async (event) => {
  const zone = event.target.closest("[data-schedule-drop-date]");
  if (!zone || !draggedScheduleAssignmentId) return;
  event.preventDefault();
  const assignmentId = draggedScheduleAssignmentId;
  draggedScheduleAssignmentId = "";
  await moveScheduleAssignmentToSlot(assignmentId, zone.dataset.scheduleDropDate, zone.dataset.scheduleDropPeriod);
});

document.querySelector("#simulateQrRead").addEventListener("click", async () => {
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) return;
  const action = actionForLesson(lesson);
  await handleDecodedScan(await dynamicQrPayloadForLesson(lesson), {
    action,
    lessonId: lesson.id,
    nowText: demoTimeForAction(lesson, action),
  });
});

document.querySelector("#simulateOutOfWindowQr").addEventListener("click", async () => {
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) return;
  const originalNow = state.demoNow;
  state.demoNow = "2026-06-09T12:30:00+08:00";
  await handleDecodedScan(await dynamicQrPayloadForLesson(lesson), {
    action: actionForLesson(lesson),
    lessonId: lesson.id,
    nowText: state.demoNow,
  });
  state.demoNow = originalNow;
});

document.querySelector("#simulateTamperedQr").addEventListener("click", async () => {
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) return;
  const payload = JSON.parse(await dynamicQrPayloadForLesson(lesson));
  payload.roomId = "ROOM-tampered";
  payload.roomName = "伪造教室";
  await handleDecodedScan(JSON.stringify(payload), {
    action: actionForLesson(lesson),
    lessonId: lesson.id,
    nowText: demoTimeForAction(lesson, actionForLesson(lesson)),
  });
});

document.querySelector("#copyQrText").addEventListener("click", async () => {
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) return;
  const text = backendMode() && lesson.source === "backend-api" ? classroomScreenPathForLesson(lesson) : buildQrPayload(lesson);
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

document.querySelector("#financeTeacherSelect").addEventListener("change", async (event) => {
  state.selectedFinanceTeacherId = event.target.value;
  resetAttendanceRecordState();
  resetFinanceTeacherDetailState();
  if (backendMode() && ["finance", "admin"].includes(currentRole())) {
    await loadBackendAttendanceRecords(state.selectedFinanceTeacherId);
    return;
  }
  renderFinanceRecords();
});

document.querySelector("#settlementTeacherSelect").addEventListener("change", async (event) => {
  state.selectedFinanceTeacherId = event.target.value;
  resetFinanceTeacherDetailState();
  if (backendMode() && ["finance", "admin"].includes(currentRole())) {
    await loadFinanceTeacherDetail(state.selectedFinanceTeacherId, { generatePayroll: true });
    return;
  }
  renderSettlement();
});

document.querySelector("#settleTeacherPayroll").addEventListener("click", async () => {
  if (backendMode() && currentRole() === "finance") {
    await lockBackendPayroll();
    return;
  }
  const teacherId = state.selectedFinanceTeacherId;
  state.settlements[teacherId] = {
    status: "settled",
    settledAt: "2026-06-09 10:30",
  };
  showToast(`${teacherName(teacherId)} 本月工资已结算锁定`);
  render();
});

document.querySelector("#reviewTeacherPayroll").addEventListener("click", reviewBackendPayroll);
document.querySelector("#approveAcademicWorkload").addEventListener("click", () => approveBackendWorkload("academic"));
document.querySelector("#approveSchoolWorkload").addEventListener("click", () => approveBackendWorkload("school"));
document.querySelector("#batchGeneratePayroll").addEventListener("click", batchGenerateBackendPayroll);
document.querySelector("#exportPayrollCsv").addEventListener("click", exportBackendPayrollCsv);
document.querySelector("#savePayrollRules").addEventListener("click", saveBackendPayrollRules);

document.querySelector("#submitManualQr").addEventListener("click", async () => {
  const text = document.querySelector("#manualQrText").value.trim();
  if (!text) {
    showToast("请先粘贴二维码内容");
    return;
  }
  await handleDecodedScan(text, selectedScannerActionContext());
});

render();

if (backendMode()) {
  loadBackendNotifications().then(render);
  if (currentRole() === "teacher") {
    loadBackendTeacherContext(currentTeacherId(), "auto").then(render);
  }
  if (currentRole() === "finance") {
    loadFinanceTeacherPage({ page: financeTeacherPage.page });
    loadPayrollRules();
  }
  if (currentRole() === "admin") {
    loadBackendSchedulingContext();
    loadFinanceTeacherPage({ page: financeTeacherPage.page });
    loadPayrollRules();
  }
}
