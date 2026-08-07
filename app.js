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

const SCHEDULE_ROOM_TYPES = {
  homeroom: "普通教室",
  lab: "实验室",
  computer: "机房",
  playground: "操场",
  art: "美术室",
  music: "音乐室",
};

const DEFAULT_SCHEDULE_ROOM_RESOURCES = [
  { type: "lab", label: "实验室", unit: "间", max: 20 },
  { type: "computer", label: "机房", unit: "间", max: 20 },
  { type: "playground", label: "操场", unit: "个", max: 10 },
  { type: "art", label: "美术室", unit: "间", max: 20 },
  { type: "music", label: "音乐室", unit: "间", max: 20 },
];

const SUBJECT_DEFAULT_ROOM_TYPES = {
  pe: "playground",
  physics: "lab",
  chemistry: "lab",
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
    return {
      ...subject,
      durationMinutes: subject.durationMinutes || 40,
      requiredRoomType: normalizeScheduleRoomType(subject.requiredRoomType || SUBJECT_DEFAULT_ROOM_TYPES[subject.id] || "homeroom"),
      availableTeachers,
    };
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
    minPerClassPerDay: subject.minPerClassPerDay || 0,
    maxPerClassPerDay: subject.maxPerClassPerDay || 0,
    minWeeklyDays: Number(subject.minPerClassPerDay || 0) > 0 ? 0 : subject.minWeeklyDays || 0,
    maxConsecutivePerClass: subject.maxConsecutivePerClass || (subject.allowConsecutive === false ? 1 : 0),
    allowConsecutive: subject.allowConsecutive !== false,
    forbiddenPeriods: Array.isArray(subject.forbiddenPeriods) ? subject.forbiddenPeriods : [],
    preferredDayPart: subject.preferredDayPart || "any",
    requiredRoomType: normalizeScheduleRoomType(subject.requiredRoomType || SUBJECT_DEFAULT_ROOM_TYPES[subject.id] || "homeroom"),
  }));
  const classes = Array.from({ length: division.classCount }, (_, index) => {
    const roomNumber = String(index + 1).padStart(2, "0");
    const roomName = `${division.roomPrefix}${grade.code.slice(1)}-${roomNumber}`;
    return {
      id: `${grade.code}C${roomNumber}`,
      name: `${grade.name} ${index + 1} 班`,
      classType: "regular",
      displayOrder: index + 1,
      room: roomName,
      roomId: `${grade.code}R${roomNumber}`,
      roomType: "homeroom",
    };
  });
  const specialRooms = [
    ["LAB", "实验室01", "lab"],
    ["LAB2", "实验室02", "lab"],
    ["COMPUTER", "机房", "computer"],
    ["PLAYGROUND", "操场", "playground"],
    ["ART", "美术室", "art"],
    ["MUSIC", "音乐室", "music"],
  ].map(([suffix, name, roomType]) => ({
    id: `${grade.code}-${suffix}`,
    name: `${division.shortName}${grade.name}${name}`,
    roomType,
    roomTypeName: SCHEDULE_ROOM_TYPES[roomType],
    sourceClassId: "",
  }));

  return {
    termId: "TERM-2026-PHASE1",
    termName: "2026年第一阶段试运行学期",
    termStartDate: "2026-06-15",
    termEndDate: "2026-07-31",
    divisionId: division.id,
    divisionName: division.name,
    gradeId: grade.id,
    gradeName: grade.name,
    weekStart: division.weekStart,
    classCount: division.classCount,
    classStructure: {
      regularCount: classes.length,
      experimentalCount: 0,
      totalCount: classes.length,
    },
    classes,
    rooms: [
      ...classes.map((schoolClass) => ({
        id: schoolClass.roomId,
        name: schoolClass.room,
        roomType: "homeroom",
        roomTypeName: SCHEDULE_ROOM_TYPES.homeroom,
        sourceClassId: schoolClass.id,
      })),
      ...specialRooms,
    ],
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
  selectedScheduleOverviewClassId: "",
  selectedScheduleAssignmentId: "",
  scheduleReplanScope: {
    classId: "",
    teacherId: "",
    date: "",
    subjectId: "",
  },
  scheduleVersions: [],
  teacherScheduleWeeks: {},
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
      title: "教室动态码试运行",
      text: "系统使用教室大屏动态二维码完成扫码考勤，由后端进行身份、设备、课表和时间窗口校验。",
      time: "2026-06-09 10:00",
      level: "info",
    },
    {
      id: "N005",
      audience: "admin",
      source: "教务处",
      title: "学部年级排课任务",
      text: "请教研所账号先选择学部和年级，再生成自然周课表，校验老师同一时间无冲突后确认发布。",
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
      title: "教研所账号",
      department: "教研所",
    },
    {
      id: "system-admin",
      role: "system_admin",
      name: "行政管理",
      title: "行政管理",
      department: "系统管理",
    },
    {
      id: "classroom-screen",
      role: "classroom",
      name: "教室大屏",
      title: "教室屏账号",
      department: "教室终端",
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
const TERM_START_WEEK = "2026-06-15";
const TERM_WEEK_COUNT = 20;
const PUBLISHED_LESSON_SOURCES = new Set(["admin-scheduling", "backend-scheduling"]);
const ELEMENTARY_SCHEDULED_TEACHER_LOGIN_FALLBACK = [
  { teacherId: "T0871", teacherName: "郝云昕", subjectName: "语文", username: "teacher0871" },
  { teacherId: "T0892", teacherName: "孙清涵", subjectName: "数学", username: "teacher0892" },
  { teacherId: "T0793", teacherName: "白梓岚", subjectName: "英语", username: "teacher0793" },
  { teacherId: "T0754", teacherName: "邓启晟", subjectName: "物理", username: "teacher0754" },
  { teacherId: "T0874", teacherName: "崔彦岚", subjectName: "物理", username: "teacher0874" },
  { teacherId: "T0844", teacherName: "蔡彦澄", subjectName: "物理", username: "teacher0844" },
  { teacherId: "T0865", teacherName: "谭云辰", subjectName: "化学", username: "teacher0865" },
  { teacherId: "T0826", teacherName: "唐彦然", subjectName: "体育", username: "teacher0826" },
  { teacherId: "T0856", teacherName: "钟彦宇", subjectName: "体育", username: "teacher0856" },
  { teacherId: "T0733", teacherName: "胡梓珂", subjectName: "英语", username: "teacher0733" },
];
const loginUsers = [
  { username: "teacher0003", password: "123456", accountId: "teacher-li" },
  { username: "finance", password: "123456", accountId: "finance-zhang" },
  { username: "admin", password: "123456", accountId: "admin-zhou" },
  { username: "sysadmin", password: "123456", accountId: "system-admin" },
  { username: "classroom", password: "123456", accountId: "classroom-screen" },
];

let state = loadSavedState();
let sessionAccountId = loadSession();
let backendSession = loadBackendSession();
let eventStream = null; // SSE 连接（在 saveBackendSession 中使用，需先于其声明避免 TDZ）
let backendAuthExpiredHandled = false;
let qrScanner = null;
let courseRulesEditMode = false;
let notificationComposerState = {
  sending: false,
  message: "",
  error: "",
};
let notificationRecipientState = {
  mode: "teacher",
  stageId: "",
  grade: "",
  search: "",
  teachers: [],
  selectedTeacherIds: [],
  loading: false,
  loaded: false,
  error: "",
};
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
  summary: null,
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
  lockBlockers: [],
};
let payrollHistoryState = {
  termId: "",
  month: "2026-06",
  loadedTermId: "",
  loadedMonth: "",
  loading: false,
  loaded: false,
  error: "",
  data: null,
};
let salaryProfileEditMode = false;
let salaryProfilePanelCurrentProfile = null;
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
  job: null,
  precheck: null,
};
let termManagementState = {
  terms: [],
  currentTerm: null,
  loaded: false,
  loading: false,
  error: "",
};
let schedulingJobPollTimer = null;
let classroomScreenState = {
  rooms: [],
  loading: false,
  loaded: false,
  error: "",
  search: "",
};
let draggedScheduleAssignmentId = "";

if (backendSession?.account) {
  sessionAccountId = upsertBackendAccount(backendSession.account);
  state.currentAccountId = sessionAccountId;
  connectEventStream();
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
  adminScheduleOverview: {
    role: "admin",
    title: "课表总览",
    el: document.querySelector("#adminScheduleOverviewView"),
  },
  personnel: {
    role: "system_admin",
    title: "人员列表",
    el: document.querySelector("#personnelView"),
  },
  teacherImport: {
    role: "system_admin",
    title: "教师导入",
    el: document.querySelector("#teacherImportView"),
  },
  hrEmployees: {
    role: "hr,system_admin,division_head",
    title: "人员档案",
    el: document.querySelector("#hrEmployeesView"),
  },
  hrOrg: {
    role: "hr,finance,system_admin",
    title: "组织与岗位",
    el: document.querySelector("#hrOrgView"),
  },
  hrFlows: {
    role: "hr,system_admin,division_head",
    title: "人事审批",
    el: document.querySelector("#hrFlowsView"),
  },
  approvals: {
    role: "teacher,admin,finance,hr,division_head,system_admin",
    title: "审批中心",
    el: document.querySelector("#approvalsView"),
  },
  approvalSettings: {
    role: "system_admin",
    title: "审批流程设置",
    el: document.querySelector("#approvalSettingsView"),
  },
  hrAudit: {
    role: "hr,system_admin,division_head",
    title: "人事审计",
    el: document.querySelector("#hrAuditView"),
  },
  myHrProfile: {
    role: "teacher",
    title: "我的账户",
    el: document.querySelector("#myHrProfileView"),
  },
  notifications: {
    role: "teacher,finance,admin,system_admin,hr",
    title: "通知中心",
    el: document.querySelector("#notificationsView"),
  },
  scanner: {
    role: "teacher",
    title: "扫码签到",
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
    role: "finance,system_admin",
    title: "老师考勤记录",
    el: document.querySelector("#financeRecordsView"),
  },
  settlement: {
    role: "finance,system_admin",
    title: "薪资结算",
    el: document.querySelector("#settlementView"),
  },
  payrollHistory: {
    role: "finance,system_admin",
    title: "工资记录",
    el: document.querySelector("#payrollHistoryView"),
  },
  payrollConfig: {
    role: "finance,system_admin",
    title: "薪资配置",
    el: document.querySelector("#payrollConfigView"),
  },
  warnings: {
    role: "teacher,finance",
    title: "异常提醒",
    el: document.querySelector("#warningsView"),
  },
  classroomScreens: {
    role: "classroom",
    title: "教室二维码库",
    el: document.querySelector("#classroomScreensView"),
  },
};

const defaultViewByRole = {
  teacher: "dashboard",
  finance: "finance",
  admin: "adminScheduling",
  system_admin: "personnel",
  classroom: "classroomScreens",
  hr: "hrEmployees",
  division_head: "hrFlows",
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
  { label: "第 1 步", title: "财务生成工资明细" },
  { label: "第 2 步", title: "老师确认或提出异议" },
  { label: "第 3 步", title: "财务处理异议" },
  { label: "第 4 步", title: "锁定发放" },
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

function isPublishedLessonSource(lesson) {
  return PUBLISHED_LESSON_SOURCES.has(lesson?.source);
}

function sanitizeProductionState(nextState) {
  nextState.lessons = (nextState.lessons || []).filter(isPublishedLessonSource);
  if (!nextState.lessons.some((lesson) => lesson.id === nextState.scannerLessonId)) {
    nextState.scannerLessonId = nextState.lessons[0]?.id || "";
  }
  return nextState;
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
    if (!raw) return sanitizeProductionState(clone(initialState));
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
    if (!schedulingConfig.classes.some((schoolClass) => schoolClass.id === nextState.selectedScheduleOverviewClassId)) {
      nextState.selectedScheduleOverviewClassId = nextState.selectedSchedulingClassId;
    }
    return sanitizeProductionState(nextState);
  } catch (error) {
    return sanitizeProductionState(clone(initialState));
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
  backendAuthExpiredHandled = false;
  backendSession = session;
  try {
    window.localStorage.setItem(API_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    // API session persistence is best-effort.
  }
  connectEventStream();
}

function clearBackendSession() {
  backendSession = null;
  disconnectEventStream();
  try {
    window.localStorage.removeItem(API_SESSION_KEY);
  } catch (error) {
    // Nothing else to do.
  }
}

// SSE 实时推送（P1）：订阅后端事件，待办/通知无需刷新即时更新
function connectEventStream() {
  disconnectEventStream();
  if (!backendSession?.token || typeof EventSource === "undefined") return;
  try {
    eventStream = new EventSource(`/api/events?token=${encodeURIComponent(backendSession.token)}`);
  } catch (error) {
    return;
  }
  // 审批流变化：刷新待办数（若在审批页则重载列表）
  eventStream.addEventListener("hr-flow", () => {
    if (!backendMode()) return;
    if (["hr", "system_admin", "division_head"].includes(currentRole())) {
      if (state.activeView === "hrFlows") {
        loadHrFlows({ status: hrFlowsState.status, todoOnly: hrFlowsState.todoOnly });
      } else {
        refreshHrTodoBadge();
      }
    }
  });
  // 审批单变化：在审批中心时重载列表，否则只刷新待办角标
  eventStream.addEventListener("oa-request", () => {
    if (!backendMode()) return;
    if (state.activeView === "approvals") loadOaRequests();
    else refreshOaTodoBadge();
  });
  // 新通知：刷新通知中心与角标
  eventStream.addEventListener("notification", () => {
    if (backendMode()) loadBackendNotifications().then(render);
  });
  // 连接后先拉一次待办角标（HR 系角色）
  if (["hr", "system_admin", "division_head"].includes(currentRole())) refreshHrTodoBadge();
  refreshOaTodoBadge();
}

// 审批中心导航角标（全角色都可能有待办）
async function refreshOaTodoBadge() {
  if (!backendMode()) return;
  try {
    const result = await apiRequest("/api/oa/todos");
    oaState = { ...oaState, todoCount: result.count || 0 };
    const navBtn = document.querySelector('.nav-item[data-view="approvals"]');
    if (!navBtn) return;
    let badge = navBtn.querySelector(".nav-badge");
    if (result.count > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "nav-badge";
        navBtn.appendChild(badge);
      }
      badge.textContent = result.count > 99 ? "99+" : String(result.count);
    } else if (badge) {
      badge.remove();
    }
  } catch (error) {
    // 角标刷新失败静默
  }
}

function disconnectEventStream() {
  if (eventStream) {
    eventStream.close();
    eventStream = null;
  }
}

// 侧栏导航「人事审批」项的实时待办角标
async function refreshHrTodoBadge() {
  try {
    const result = await apiRequest("/api/hr/todos");
    const navBtn = document.querySelector('.nav-item[data-view="hrFlows"]');
    if (!navBtn) return;
    let badge = navBtn.querySelector(".nav-badge");
    if (result.count > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "nav-badge";
        navBtn.appendChild(badge);
      }
      badge.textContent = result.count > 99 ? "99+" : String(result.count);
    } else if (badge) {
      badge.remove();
    }
  } catch (error) {
    // 角标刷新失败静默
  }
}

function handleBackendAuthExpired() {
  if (backendAuthExpiredHandled) return;
  backendAuthExpiredHandled = true;
  sessionAccountId = "";
  clearSession();
  clearBackendSession();
  resetOaState();
  resetTeacherWorkloadState();
  resetAttendanceRecordState();
  resetTeacherPayrollState();
  resetFinanceTeacherDetailState();
  resetPersonnelPage();
  showToast("登录状态已失效，请重新登录");
  window.setTimeout(() => {
    backendAuthExpiredHandled = false;
    render();
  }, 0);
}

function resetTeacherWorkloadState() {
  teacherWorkloadState = {
    teacherId: "",
    month: currentSettlementMonth(),
    loading: false,
    loaded: false,
    error: "",
    data: null,
  };
}

function resetAttendanceRecordState() {
  attendanceRecordState = {
    teacherId: "",
    month: currentSettlementMonth(),
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
    month: currentSettlementMonth(),
    loading: false,
    loaded: false,
    error: "",
    data: null,
  };
}

function resetFinanceTeacherDetailState() {
  salaryProfileEditMode = false;
  financeTeacherDetailState = {
    teacherId: "",
    month: currentSettlementMonth(),
    loading: false,
    loaded: false,
    error: "",
    workload: null,
    payroll: null,
    payrollGenerated: false,
    lockBlockers: [],
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
    if (response.status === 401 && !String(path).includes("/api/auth/login")) {
      handleBackendAuthExpired();
    }
    throw error;
  }
  return payload;
}

function roleTitle(role) {
  if (role === "teacher") return "老师账号";
  if (role === "finance") return "财务账号";
  if (role === "admin") return "教研所账号";
  if (role === "system_admin") return "行政管理";
  if (role === "classroom") return "教室屏账号";
  if (role === "hr") return "人事账号";
  if (role === "division_head") return "学部负责人";
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

function mergeBackendLessons(teacherId, lessons, options = {}) {
  const replaceWeeks = new Set(
    options.replaceWeekStart
      ? [options.replaceWeekStart]
      : lessons.map((lesson) => startOfNaturalWeek(lesson.date)),
  );
  state.lessons = state.lessons.filter(
    (lesson) =>
      !(
        lesson.source === "backend-api" &&
        lesson.teacherId === teacherId &&
        (replaceWeeks.size === 0 || replaceWeeks.has(startOfNaturalWeek(lesson.date)))
      ),
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

function isFinanceRole(role = currentRole()) {
  return role === "finance" || role === "system_admin";
}

function isPersonnelRole(role = currentRole()) {
  // 角色收敛（2026-07-08）：账号管理是技术操作，收归行政管理；教务(admin)专注排课
  return role === "system_admin";
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

function teacherLoginUsername(teacherId = "") {
  const numericId = String(teacherId).replace(/^T/i, "");
  return numericId ? `teacher${numericId.padStart(4, "0")}` : "";
}

function elementaryScheduledTeacherLoginOptions() {
  const draft = state.schedulingDraft || {};
  const assignments =
    draft.divisionId === "elementary" && Array.isArray(draft.assignments) ? draft.assignments : [];
  const byTeacher = new Map();

  assignments.forEach((assignment) => {
    if (!assignment.teacherId) return;
    if (!byTeacher.has(assignment.teacherId)) {
      byTeacher.set(assignment.teacherId, {
        teacherId: assignment.teacherId,
        teacherName: assignment.teacherName || teacherName(assignment.teacherId),
        subjectName: assignment.subjectName || teacherById(assignment.teacherId)?.subject || "任课",
        username: teacherLoginUsername(assignment.teacherId),
        lessonCount: 0,
      });
    }
    const row = byTeacher.get(assignment.teacherId);
    row.lessonCount += 1;
  });

  const rows = Array.from(byTeacher.values()).filter((row) => row.username);
  if (!rows.length) {
    return ELEMENTARY_SCHEDULED_TEACHER_LOGIN_FALLBACK.map((row) => ({
      ...row,
      lessonCount: 0,
    }));
  }

  return rows.sort((a, b) => {
    const subjectCompare = String(a.subjectName).localeCompare(String(b.subjectName), "zh-CN");
    if (subjectCompare) return subjectCompare;
    return String(a.teacherName).localeCompare(String(b.teacherName), "zh-CN");
  });
}

function ensureLocalScheduledTeacherAccount(option) {
  const teacherId = option.teacherId;
  if (!teacherById(teacherId)) {
    state.teachers.push({
      id: teacherId,
      name: option.teacherName,
      department: "小学部",
      subject: option.subjectName || "任课",
      grade: "小学部已排课",
      position: "小学部任课教师",
      boundDeviceId: "scheduled-login",
      salaryProfile: {
        baseSalary: 6500,
        positionSalary: 1500,
        homeroomAllowance: 0,
        famousTeacherReward: 0,
        approvedOvertimeHours: 0,
      },
    });
  }

  const accountId = `scheduled-${teacherId}`;
  if (!state.accounts.some((account) => account.id === accountId)) {
    state.accounts.push({
      id: accountId,
      role: "teacher",
      name: option.teacherName,
      title: "小学部排课老师",
      teacherId,
      department: "小学部",
      deviceId: "scheduled-login",
      source: "scheduled-login",
    });
  }
  return accountId;
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

function formatMonthLabel(monthKey = "") {
  const [year, month] = String(monthKey || "").split("-");
  if (!year || !month) return "未选择月份";
  return `${year}年${Number(month)}月`;
}

function monthKeysBetween(startDate = "", endDate = "") {
  const startMonth = String(startDate || "2026-06-01").slice(0, 7);
  const endMonth = String(endDate || startDate || "2026-06-01").slice(0, 7);
  const [startYear, startIndex] = startMonth.split("-").map(Number);
  const [endYear, endIndex] = endMonth.split("-").map(Number);
  if (!startYear || !startIndex || !endYear || !endIndex) return ["2026-06"];
  const months = [];
  const cursor = new Date(startYear, startIndex - 1, 1);
  const end = new Date(endYear, endIndex - 1, 1);
  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months.length ? months : [startMonth];
}

function defaultMonthForTerm(term = null) {
  const months = monthKeysBetween(term?.startDate, term?.endDate);
  const settlementMonth = String(term?.settlementMonth || "").slice(0, 7);
  if (months.includes(settlementMonth)) return settlementMonth;
  const currentMonth = formatDateKey(new Date()).slice(0, 7);
  return months.includes(currentMonth) ? currentMonth : months[0] || "2026-06";
}

function currentSettlementMonth() {
  return defaultMonthForTerm(termManagementState.currentTerm);
}

function runtimeEnvironmentName() {
  const host = window.location.hostname;
  if (host === "127.0.0.1" || host === "localhost" || host === "") return "本地开发";
  // 私有网段（局域网调试、手机真机预览）也视为本地开发环境
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return "本地开发";
  return "正式环境";
}

let healthTermName = "";

// 登录页（未认证）也能显示当前学期：从公开的 /api/health 读取
async function loadHealthTermName() {
  try {
    const health = await apiRequest("/api/health");
    healthTermName = health.currentTermName || "";
    renderEnvironmentLabels();
  } catch (error) {
    // 后端不可用时保持默认文案
  }
}

function runtimeContextLabel() {
  const term = termManagementState.currentTerm;
  const month = currentSettlementMonth();
  if (!term?.name) {
    return healthTermName
      ? `${runtimeEnvironmentName()} · ${healthTermName}`
      : `${runtimeEnvironmentName()} · 等待读取学期`;
  }
  return `${runtimeEnvironmentName()} · ${term.name} · 当前结算月：${formatMonthLabel(month)}`;
}

function renderEnvironmentLabels() {
  const label = runtimeContextLabel();
  document.querySelectorAll("#loginEnvironmentLabel, #appEnvironmentLabel").forEach((node) => {
    node.textContent = label;
  });
}

// 交付环境收敛：正式环境隐藏演示账号区、排课老师快捷登录、重置数据按钮，
// 并清空登录页预填的演示账号。样式侧通过 body[data-env] 控制。
function applyEnvironmentMode() {
  const isLocal = runtimeEnvironmentName() === "本地开发";
  document.body.dataset.env = isLocal ? "local" : "production";
  if (!isLocal) {
    const username = document.querySelector("#loginUsername");
    if (username && username.value.startsWith("teacher0")) username.value = "";
  }
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
  const source = backendMode() ? state.backendNotices || [] : state.notices || [];
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

function canPublishNotifications() {
  return ["admin", "finance", "system_admin"].includes(currentRole());
}

function notificationTeacherTargetModes() {
  return new Set(["stage", "grade", "teachers"]);
}

function notificationTargetMode() {
  return document.querySelector("#notificationAudienceSelect")?.value || notificationRecipientState.mode || "teacher";
}

function notificationRecipientQueryReady(mode = notificationRecipientState.mode) {
  if (mode === "stage") return Boolean(notificationRecipientState.stageId);
  if (mode === "grade") return Boolean(notificationRecipientState.stageId && notificationRecipientState.grade);
  if (mode === "teachers") return true;
  return false;
}

function notificationTeacherLabel(teacher) {
  return `${teacher.name} · ${backendTeacherDepartment(teacher)} · ${teacher.gradeText || teacher.grade || "年级未设置"} · ${backendTeacherSubject(teacher)} · ${teacher.id}`;
}

function notificationSelectedTeacherIdsFromControl() {
  const select = document.querySelector("#notificationTeacherSelect");
  if (!select) return notificationRecipientState.selectedTeacherIds || [];
  return Array.from(select.selectedOptions || []).map((option) => option.value).filter(Boolean);
}

function notificationRecipientSummaryText(mode = notificationRecipientState.mode) {
  if (!notificationTeacherTargetModes().has(mode)) return "";
  if (!backendMode()) return "生产后端登录后可按学部、年级或指定老师发布。";
  if (!notificationRecipientQueryReady(mode)) {
    if (mode === "stage") return "请选择学部后刷新名单。";
    if (mode === "grade") return "请选择学部和年级后刷新名单。";
  }
  if (notificationRecipientState.loading) return "正在读取老师名单…";
  if (notificationRecipientState.error) return notificationRecipientState.error;
  const count = notificationRecipientState.teachers.length;
  if (mode === "teachers") {
    const selectedCount = notificationRecipientState.selectedTeacherIds.length;
    return `当前候选 ${count} 人，已选择 ${selectedCount} 人；可输入姓名、工号或科目后刷新名单。`;
  }
  return `当前范围匹配 ${count} 位老师，发布时会精准发送给这些老师。`;
}

function resetNotificationRecipientList({ keepSelection = false } = {}) {
  notificationRecipientState = {
    ...notificationRecipientState,
    teachers: [],
    selectedTeacherIds: keepSelection ? notificationRecipientState.selectedTeacherIds : [],
    loading: false,
    loaded: false,
    error: "",
  };
}

function readNotificationRecipientControls() {
  const mode = notificationTargetMode();
  const stageId = document.querySelector("#notificationStageSelect")?.value || "";
  const grade = document.querySelector("#notificationGradeSelect")?.value || "";
  const search = document.querySelector("#notificationTeacherSearch")?.value.trim() || "";
  notificationRecipientState = {
    ...notificationRecipientState,
    mode,
    stageId,
    grade,
    search,
    selectedTeacherIds: notificationSelectedTeacherIdsFromControl(),
  };
}

async function loadNotificationRecipientTeachers({ force = false, keepSelection = true } = {}) {
  if (!backendMode() || !notificationTeacherTargetModes().has(notificationRecipientState.mode)) return;
  if (!notificationRecipientQueryReady(notificationRecipientState.mode)) {
    resetNotificationRecipientList({ keepSelection: false });
    renderNotificationCenter();
    return;
  }
  if (notificationRecipientState.loading || (notificationRecipientState.loaded && !force)) return;

  notificationRecipientState = { ...notificationRecipientState, loading: true, error: "" };
  renderNotificationCenter();
  try {
    const allItems = [];
    const baseParams = new URLSearchParams({
      pageSize: "100",
      status: "active",
    });
    if (notificationRecipientState.stageId) baseParams.set("stageId", notificationRecipientState.stageId);
    if (notificationRecipientState.grade) baseParams.set("grade", notificationRecipientState.grade);
    if (notificationRecipientState.mode === "grade") baseParams.set("strictGrade", "true");
    if (notificationRecipientState.search) baseParams.set("search", notificationRecipientState.search);

    let page = 1;
    let totalPages = 1;
    const broadTeacherSearch =
      notificationRecipientState.mode === "teachers" &&
      !notificationRecipientState.stageId &&
      !notificationRecipientState.grade &&
      !notificationRecipientState.search;
    do {
      const params = new URLSearchParams(baseParams);
      params.set("page", String(page));
      const result = await apiRequest(`/api/teachers?${params.toString()}`);
      const items = result.items || [];
      items.forEach(upsertTeacher);
      allItems.push(...items);
      totalPages = broadTeacherSearch ? 1 : Number(result.meta?.totalPages || 1);
      page += 1;
    } while (page <= totalPages);

    const availableIds = new Set(allItems.map((teacher) => teacher.id));
    const selectedTeacherIds = keepSelection
      ? (notificationRecipientState.selectedTeacherIds || []).filter((id) => availableIds.has(id))
      : [];
    notificationRecipientState = {
      ...notificationRecipientState,
      teachers: allItems,
      selectedTeacherIds,
      loading: false,
      loaded: true,
      error: "",
    };
  } catch (error) {
    notificationRecipientState = {
      ...notificationRecipientState,
      teachers: [],
      loading: false,
      loaded: true,
      error: error.message || "老师名单读取失败",
    };
  }
  renderNotificationCenter();
}

function renderNotificationRecipientControls(canPublish) {
  const mode = notificationTargetMode();
  notificationRecipientState.mode = mode;
  const panel = document.querySelector("#notificationTargetPanel");
  const picker = document.querySelector("#notificationTeacherPicker");
  const stageSelect = document.querySelector("#notificationStageSelect");
  const gradeSelect = document.querySelector("#notificationGradeSelect");
  const searchInput = document.querySelector("#notificationTeacherSearch");
  const teacherSelect = document.querySelector("#notificationTeacherSelect");
  const help = document.querySelector("#notificationTargetHelp");
  const refreshButton = document.querySelector("#refreshNotificationRecipients");
  if (!panel || !picker || !stageSelect || !gradeSelect || !searchInput || !teacherSelect || !help || !refreshButton) {
    return;
  }

  const targetModes = notificationTeacherTargetModes();
  const showTargetPanel = canPublish && targetModes.has(mode);
  panel.classList.toggle("is-hidden", !showTargetPanel);
  if (!showTargetPanel) return;

  stageSelect.innerHTML = financeStageOptions(notificationRecipientState.stageId);
  gradeSelect.innerHTML = financeGradeOptions(notificationRecipientState.stageId, notificationRecipientState.grade);
  stageSelect.value = notificationRecipientState.stageId;
  gradeSelect.value = notificationRecipientState.grade;
  searchInput.value = notificationRecipientState.search;
  gradeSelect.disabled = mode === "stage" || !notificationRecipientState.stageId;
  searchInput.disabled = mode !== "teachers";
  refreshButton.disabled = notificationRecipientState.loading || !backendMode() || !notificationRecipientQueryReady(mode);

  const pickerVisible = mode === "teachers" || notificationRecipientState.teachers.length > 0 || notificationRecipientState.loading;
  picker.classList.toggle("is-hidden", !pickerVisible);
  teacherSelect.disabled = mode !== "teachers" || notificationRecipientState.loading;
  teacherSelect.innerHTML = notificationRecipientState.teachers.length
    ? notificationRecipientState.teachers
        .map(
          (teacher) => `
            <option value="${teacher.id}" ${notificationRecipientState.selectedTeacherIds.includes(teacher.id) ? "selected" : ""}>
              ${escapeHtml(notificationTeacherLabel(teacher))}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无老师</option>`;
  help.textContent = notificationRecipientSummaryText(mode);

  if (backendMode() && !notificationRecipientState.loaded && !notificationRecipientState.loading && notificationRecipientQueryReady(mode)) {
    loadNotificationRecipientTeachers({ keepSelection: true });
  }
}

function clearNotificationComposer() {
  const titleInput = document.querySelector("#notificationTitleInput");
  const textInput = document.querySelector("#notificationTextInput");
  if (titleInput) titleInput.value = "";
  if (textInput) textInput.value = "";
  notificationComposerState = { sending: false, message: "", error: "" };
  renderNotificationCenter();
}

async function publishNotificationFromComposer() {
  if (!canPublishNotifications()) {
    showToast("当前账号没有发布通知权限");
    return;
  }
  if (!backendMode()) {
    showToast("请在生产后端登录后发布通知");
    return;
  }

  readNotificationRecipientControls();
  const mode = notificationRecipientState.mode;
  let audience = mode;
  let teacherIds = [];
  if (notificationTeacherTargetModes().has(mode)) {
    audience = "teacher";
    if (mode !== "teachers") {
      await loadNotificationRecipientTeachers({ force: true, keepSelection: false });
      teacherIds = notificationRecipientState.teachers.map((teacher) => teacher.id);
    } else {
      teacherIds = notificationRecipientState.selectedTeacherIds;
    }
    if (!teacherIds.length) {
      notificationComposerState = {
        sending: false,
        message: "",
        error: mode === "teachers" ? "请至少选择一位老师" : "当前范围没有匹配老师",
      };
      renderNotificationCenter();
      return;
    }
  }
  const level = document.querySelector("#notificationLevelSelect")?.value || "info";
  const title = document.querySelector("#notificationTitleInput")?.value.trim() || "";
  const text = document.querySelector("#notificationTextInput")?.value.trim() || "";
  if (!title || !text) {
    notificationComposerState = {
      sending: false,
      message: "",
      error: "标题和正文不能为空",
    };
    renderNotificationCenter();
    return;
  }

  notificationComposerState = { sending: true, message: "发送中", error: "" };
  renderNotificationCenter();
  try {
    await apiRequest("/api/notifications", {
      method: "POST",
      body: {
        audience,
        level,
        title,
        text,
        teacherIds,
      },
    });
    document.querySelector("#notificationTitleInput").value = "";
    document.querySelector("#notificationTextInput").value = "";
    notificationComposerState = {
      sending: false,
      message: audience === currentRole() || audience === "all" ? "已发布" : "已发布给接收端",
      error: "",
    };
    await loadBackendNotifications();
    showToast("通知已发布");
    render();
  } catch (error) {
    notificationComposerState = {
      sending: false,
      message: "",
      error: error.message || "通知发布失败",
    };
    showToast(notificationComposerState.error);
    renderNotificationCenter();
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

function emptyScheduleReplanScope() {
  return { classId: "", teacherId: "", date: "", subjectId: "" };
}

function currentScheduleReplanScope() {
  const config = state.schedulingConfig;
  const scope = {
    ...emptyScheduleReplanScope(),
    ...(state.scheduleReplanScope || {}),
  };
  if (!config.classes.some((schoolClass) => schoolClass.id === scope.classId)) scope.classId = "";
  if (!config.teachers.some((teacher) => teacher.id === scope.teacherId)) scope.teacherId = "";
  if (!config.subjects.some((subject) => subject.id === scope.subjectId)) scope.subjectId = "";
  if (!weekDateKeys(config.weekStart).slice(0, 5).includes(scope.date)) scope.date = "";
  state.scheduleReplanScope = scope;
  return scope;
}

function scheduleReplanScopeIsEmpty(scope = currentScheduleReplanScope()) {
  return !scope.classId && !scope.teacherId && !scope.date && !scope.subjectId;
}

function scheduleReplanScopeText(scope = currentScheduleReplanScope()) {
  if (scheduleReplanScopeIsEmpty(scope)) return "全部未锁定课程";
  const parts = [];
  const schoolClass = state.schedulingConfig.classes.find((item) => item.id === scope.classId);
  const teacher = state.schedulingConfig.teachers.find((item) => item.id === scope.teacherId);
  const subject = state.schedulingConfig.subjects.find((item) => item.id === scope.subjectId);
  if (schoolClass) parts.push(schoolClass.name);
  if (teacher) parts.push(teacher.name);
  if (scope.date) parts.push(scheduleWeekdayLabel(scope.date));
  if (subject) parts.push(subject.name);
  return parts.join(" / ");
}

function updateScheduleReplanScopeFromControls() {
  state.scheduleReplanScope = {
    classId: document.querySelector("#scheduleReplanClassSelect")?.value || "",
    teacherId: document.querySelector("#scheduleReplanTeacherSelect")?.value || "",
    date: document.querySelector("#scheduleReplanDateSelect")?.value || "",
    subjectId: document.querySelector("#scheduleReplanSubjectSelect")?.value || "",
  };
  return currentScheduleReplanScope();
}

function scheduleAssignmentMatchesReplanScope(assignment, scope = currentScheduleReplanScope()) {
  if (scope.classId && assignment.classId !== scope.classId) return false;
  if (scope.teacherId && assignment.teacherId !== scope.teacherId) return false;
  if (scope.date && assignment.date !== scope.date) return false;
  if (scope.subjectId && assignment.subjectId !== scope.subjectId) return false;
  return true;
}

function temporaryLockedAssignmentsForReplan(assignments, scope = currentScheduleReplanScope()) {
  return (assignments || [])
    .filter((assignment) => assignment.locked || !scheduleAssignmentMatchesReplanScope(assignment, scope))
    .map((assignment) => ({ ...assignment, locked: true, temporaryReplanLock: !assignment.locked }));
}

function restoreTemporaryReplanLocks(assignments, originalAssignments) {
  const originalById = new Map((originalAssignments || []).map((assignment) => [assignment.id, assignment]));
  return (assignments || []).map((assignment) => {
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

function applySchedulingSelection(divisionId, gradeId = "") {
  const nextConfig = buildSchedulingConfig(divisionId, gradeId);
  state.selectedSchedulingDivisionId = nextConfig.divisionId;
  state.selectedSchedulingGradeId = nextConfig.gradeId;
  state.selectedSchedulingClassId = nextConfig.classes[0]?.id || "";
  state.selectedScheduleOverviewClassId = nextConfig.classes[0]?.id || "";
  state.schedulingConfig = nextConfig;
  state.scheduleReplanScope = emptyScheduleReplanScope();
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
  const quality = solver?.qualityReport || null;
  const qualityText = quality
    ? `质量评分 ${quality.score}/${quality.maxScore || 100}，未满足偏好 ${quality.unmetPreferenceCount || 0} 条`
    : `评分 ${solver?.score || 0}`;
  if (!solver?.algorithm) {
    return `已通过：当前课表无内部冲突，并已纳入 ${draft.globalBusyCount || 0} 个老师全局占用。`;
  }
  if (solver.algorithm === "ortools-cp-sat") {
    const stageText =
      solver.phase1Status || solver.phase2Status
        ? `，硬约束 ${solver.phase1Status || "UNKNOWN"} / 优化 ${solver.phase2Status || "未执行"}`
        : "";
    return `OR-Tools CP-SAT：${solver.generatedLessonCount || draft.generatedLessonCount || 0}/${solver.requiredLessonCount || draft.requiredLessonCount || 0} 节，未排 ${solver.unassignedCount || 0}，${qualityText}，状态 ${solver.status || "UNKNOWN"}${stageText}，求解 ${Number(solver.solveTimeSeconds || 0).toFixed(2)} 秒；已纳入 ${draft.globalBusyCount || 0} 个老师全局占用。`;
  }
  const fallbackText = solver.fallbackFrom
    ? `，由 ${solver.fallbackFrom} 兜底，原因 ${solver.fallbackReason || "未返回"}`
    : "";
  return `高级约束搜索：${solver.generatedLessonCount || draft.generatedLessonCount || 0}/${solver.requiredLessonCount || draft.requiredLessonCount || 0} 节，未排 ${solver.unassignedCount || 0}，${qualityText}，搜索 ${solver.attemptsRun || 0} 轮/${solver.totalNodes || 0} 个节点${fallbackText}；已纳入 ${draft.globalBusyCount || 0} 个老师全局占用。`;
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

function normalizeCourseRuleMinPerDay(value) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return 0;
  return Math.min(Math.max(number, 0), state.schedulingConfig.periods?.length || 6);
}

function normalizeCourseRuleMinWeeklyDays(value) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return 0;
  return Math.min(Math.max(number, 0), 5);
}

function normalizeCourseRuleMaxConsecutive(value) {
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

function normalizeScheduleRoomType(value) {
  const raw = String(value || "homeroom").trim();
  if (Object.hasOwn(SCHEDULE_ROOM_TYPES, raw)) return raw;
  const normalized = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "homeroom";
}

function roomResourceTypes(config = state.schedulingConfig) {
  const byType = new Map();
  const addResource = (resource) => {
    const type = normalizeScheduleRoomType(resource.type);
    if (!type || type === "homeroom") return;
    byType.set(type, {
      type,
      label: resource.label || resource.name || SCHEDULE_ROOM_TYPES[type] || type,
      unit: resource.unit || (type === "playground" ? "个" : "间"),
      max: Number(resource.max || 30),
      defaultCount: Number(resource.defaultCount || 0),
      custom: Boolean(resource.custom || !Object.hasOwn(SCHEDULE_ROOM_TYPES, type)),
    });
  };
  (Array.isArray(config.roomResourceTypes) ? config.roomResourceTypes : DEFAULT_SCHEDULE_ROOM_RESOURCES).forEach((resource) => {
    addResource({
      ...resource,
      label: resource.label || resource.name,
    });
  });
  (config.rooms || []).forEach((room) => {
    const type = normalizeScheduleRoomType(room.roomType || room.type);
    if (type === "homeroom" || byType.has(type)) return;
    addResource({
      type,
      label: room.roomTypeName || SCHEDULE_ROOM_TYPES[type] || type,
      unit: room.unit || "间",
      max: 30,
      custom: true,
    });
  });
  return Array.from(byType.values());
}

function scheduleRoomTypeText(value, config = state.schedulingConfig) {
  const type = normalizeScheduleRoomType(value);
  if (type === "homeroom") return SCHEDULE_ROOM_TYPES.homeroom;
  return roomResourceTypes(config).find((resource) => resource.type === type)?.label || SCHEDULE_ROOM_TYPES[type] || type;
}

function periodDayPart(period) {
  return Number(period) <= 4 ? "morning" : "afternoon";
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
  const maxConsecutive =
    Number(subject.maxConsecutivePerClass || 0) || (subject.allowConsecutive === false ? 1 : 0);
  if (maxConsecutive > 0) {
    const projectedPeriods = [...sameClassSubjectDayItems.map((assignment) => Number(assignment.period)), period];
    if (maxConsecutiveRun(projectedPeriods) > maxConsecutive) {
      return {
        type: "subject-consecutive",
        title: `${subject.name} 同班连堂超上限`,
        text: `${subject.name} 已设置同班最多连续 ${maxConsecutive} 节，加入第 ${period} 节会超过上限。`,
      };
    }
  }
  return null;
}

function localRoomRuleViolation(subjectId, room) {
  const subject = localSubjectRuleFor(subjectId);
  const requiredRoomType = normalizeScheduleRoomType(subject?.requiredRoomType || "homeroom");
  const actualRoomType = normalizeScheduleRoomType(room?.roomType || "homeroom");
  if (requiredRoomType !== actualRoomType) {
    return {
      type: "room-type",
      title: `${subject?.name || subjectId} 教室类型不匹配`,
      text: `${subject?.name || subjectId} 需要${scheduleRoomTypeText(requiredRoomType)}，不能安排到${room?.name || "该教室"}（${scheduleRoomTypeText(actualRoomType)}）。`,
    };
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
    roomType: room?.roomType || assignment.roomType || "homeroom",
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
      const candidateRooms = localRoomsForSubject(subject, schoolClass);
      if (!candidateRooms.length) return;

      slots.forEach((slot) => {
        if (classBusy.get(schoolClass.id).has(slot.slotKey)) return;
        if (localScheduleConstraintViolation(subject.id, slot)) return;
        if (localSubjectRuleViolation(subject.id, slot, assignments, schoolClass.id)) return;
        const sameSubjectDayCount = countClassSubjectOnDay(assignments, schoolClass.id, subject.id, slot.date);

        candidateRooms.forEach((room) => {
          const busyRooms = roomBusy.get(room.id) || new Set();
          if (busyRooms.has(slot.slotKey)) return;
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
              best = { slot, teacherId, room, score };
            }
          });
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
        room: best.room.name,
        roomId: best.room.id,
        roomType: best.room.roomType || "homeroom",
      };

      assignments.push(assignment);
      classBusy.get(schoolClass.id).add(best.slot.slotKey);
      if (!teacherBusy.has(best.teacherId)) teacherBusy.set(best.teacherId, new Set());
      teacherBusy.get(best.teacherId).add(best.slot.slotKey);
      markBusy(roomBusy, best.room.id, best.slot.slotKey);
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
  const classSubjectDateItems = new Map();

  assignments.forEach((assignment) => {
    const teacherKey = `${assignment.teacherId}-${assignment.date}-${assignment.period}`;
    if (!teacherSlots.has(teacherKey)) teacherSlots.set(teacherKey, []);
    teacherSlots.get(teacherKey).push(assignment);

    const classKey = `${assignment.classId}-${assignment.date}-${assignment.period}`;
    if (!classSlots.has(classKey)) classSlots.set(classKey, []);
    classSlots.get(classKey).push(assignment);

    const classSubjectDateKey = `${assignment.classId}:${assignment.subjectId}:${assignment.date}`;
    if (!classSubjectDateItems.has(classSubjectDateKey)) classSubjectDateItems.set(classSubjectDateKey, []);
    classSubjectDateItems.get(classSubjectDateKey).push(assignment);

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
    const roomRuleViolation = localRoomRuleViolation(assignment.subjectId, roomById(assignment.roomId));
    if (roomRuleViolation) {
      conflicts.push({
        type: roomRuleViolation.type,
        title: roomRuleViolation.title,
        text: `${formatDate(assignment.date)} 第 ${assignment.period} 节 ${assignment.time}：${assignment.className} ${roomRuleViolation.text}`,
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

  const weekDates = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5);
  (state.schedulingConfig.classes || []).forEach((schoolClass) => {
    (state.schedulingConfig.subjects || []).forEach((subject) => {
      const minPerClassPerDay = Number(subject.minPerClassPerDay || 0);
      const maxPerClassPerDay = Number(subject.maxPerClassPerDay || 0);
      const minWeeklyDays = minPerClassPerDay > 0 ? 0 : Number(subject.minWeeklyDays || 0);
      const maxConsecutive =
        Number(subject.maxConsecutivePerClass || 0) || (subject.allowConsecutive === false ? 1 : 0);
      let coveredDays = 0;
      weekDates.forEach((date) => {
        const items = classSubjectDateItems.get(`${schoolClass.id}:${subject.id}:${date}`) || [];
        if (items.length) coveredDays += 1;
        if (minPerClassPerDay > 0 && items.length < minPerClassPerDay) {
          conflicts.push({
            type: "subject-min-per-day",
            title: `${schoolClass.name} ${subject.name} 未满足每日最低节数`,
            text: `${formatDate(date)}：${subject.name} 已设置每天至少 ${minPerClassPerDay} 节，当前只有 ${items.length} 节。`,
          });
        }
        if (maxPerClassPerDay > 0 && items.length > maxPerClassPerDay) {
          conflicts.push({
            type: "subject-max-per-day",
            title: `${schoolClass.name} ${subject.name} 超过每日上限`,
            text: `${formatDate(date)}：${subject.name} 已设置每天最多 ${maxPerClassPerDay} 节，当前有 ${items.length} 节。`,
          });
        }
        const longestRun = maxConsecutiveRun(items.map((item) => item.period));
        if (maxConsecutive > 0 && longestRun > maxConsecutive) {
          conflicts.push({
            type: "subject-consecutive",
            title: `${schoolClass.name} ${subject.name} 连堂超过上限`,
            text: `${formatDate(date)}：${subject.name} 已设置最多连续 ${maxConsecutive} 节，当前最长连续 ${longestRun} 节。`,
          });
        }
      });
      if (minWeeklyDays > 0 && coveredDays < minWeeklyDays) {
        conflicts.push({
          type: "subject-min-weekly-days",
          title: `${schoolClass.name} ${subject.name} 覆盖天数不足`,
          text: `${subject.name} 已设置每周至少覆盖 ${minWeeklyDays} 天，当前只覆盖 ${coveredDays} 天。`,
        });
      }
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
    ["考勤扣款", "当前扣款项", -salary.attendanceDeduction],
    ["社保代扣", "固定代扣", -salary.socialInsurance],
    ["个税代扣", `起征点 ${rules.taxThreshold} 元，试运行税率 3%`, -salary.tax],
  ];
}

function normalizeSettlementRows(rows = []) {
  return rows.map((row) =>
    Array.isArray(row)
      ? { name: row[0], basis: row[1], amount: row[2] || 0, category: "preview" }
      : { ...row, amount: Number(row.amount || 0) },
  );
}

function settlementTotalsFromRows(rows = [], fallback = {}) {
  const normalizedRows = normalizeSettlementRows(rows);
  if (!normalizedRows.length) {
    return {
      gross: Number(fallback.gross || 0),
      tax: Number(fallback.tax || 0),
      net: Number(fallback.net || 0),
    };
  }
  const taxRows = normalizedRows.filter((row) => row.name === "个税代扣");
  const gross = normalizedRows
    .filter((row) => row.name !== "个税代扣")
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const tax = Math.abs(taxRows.reduce((sum, row) => sum + Number(row.amount || 0), 0));
  const net = normalizedRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  return { gross, tax, net };
}

function settlementSalaryRowsHtml(rows = [], fallback = {}) {
  const normalizedRows = normalizeSettlementRows(rows);
  if (!normalizedRows.length) return "";
  const totals = settlementTotalsFromRows(normalizedRows, fallback);
  const lineRows = normalizedRows
    .map(
      (row) => `
        <tr>
          <td class="row-title" data-label="薪资项目">${row.name}</td>
          <td class="muted" data-label="计算口径">${humanizePayrollBasis(row.basis)}</td>
          <td data-label="金额">${formatCurrency(row.amount || 0)}</td>
        </tr>
      `,
    )
    .join("");
  return `
    ${lineRows}
    <tr class="settlement-summary-row">
      <td class="row-title" data-label="薪资项目">应发合计</td>
      <td class="muted" data-label="计算口径">明细中除个税代扣外的项目合计，包含特殊奖扣</td>
      <td data-label="金额">${formatCurrency(totals.gross)}</td>
    </tr>
    <tr class="settlement-summary-row">
      <td class="row-title" data-label="薪资项目">代扣个税</td>
      <td class="muted" data-label="计算口径">按当前个税规则从应发合计中试算</td>
      <td data-label="金额">-${formatCurrency(totals.tax)}</td>
    </tr>
    <tr class="settlement-summary-row final-total">
      <td class="row-title" data-label="薪资项目">实发合计</td>
      <td class="muted" data-label="计算口径">应发合计 - 代扣个税</td>
      <td data-label="金额">${formatCurrency(totals.net)}</td>
    </tr>
  `;
}

function payrollLockBlockersTableRows(blockers = []) {
  if (!Array.isArray(blockers) || !blockers.length) return "";
  return `
    <tr class="payroll-lock-blocker-row">
      <td colspan="3">
        <div class="payroll-lock-blockers">
          <strong>锁定前需处理的课次</strong>
          <p>以下课次仍未完成或存在异常，处理后重新生成/复核工资，再执行锁定。</p>
          <div class="payroll-lock-blocker-list">
            ${blockers
              .slice(0, 12)
              .map(
                (item) => `
                  <article>
                    <span class="tag ${item.type === "exception" ? "exception" : "pending"}">${item.type === "exception" ? "异常" : "待处理"}</span>
                    <div>
                      <strong>${escapeHtml(item.date || "-")} ${escapeHtml(item.time || "")}</strong>
                      <small>${escapeHtml([item.className, item.subjectName, item.room].filter(Boolean).join(" · "))}</small>
                      <p>${escapeHtml(item.reason || "需处理后才能锁定工资")}</p>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
          ${blockers.length > 12 ? `<small>另有 ${blockers.length - 12} 条未展示，请先处理前 12 条。</small>` : ""}
        </div>
      </td>
    </tr>
  `;
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
          ${teacher.name} · ${backendTeacherDepartment(teacher)} · ${financeTeacherPage.grade ? financeGradeLabel(financeTeacherPage.grade) : teacher.gradeText || teacher.grade || "年级未设置"} · ${backendTeacherSubject(teacher)} · ${settlementTeacherStatusLabel(teacher)}
        </option>
      `,
    )
    .join("");
}

const settlementStatusGroups = [
  { key: "missing", label: "未保存工资", hint: "财务还没有保存该老师本月工资草稿" },
  { key: "saved", label: "已保存", hint: "财务已保存草稿，尚未发布给老师确认" },
  { key: "generated", label: "等待确认", hint: "已发布，等待老师确认或提出异议" },
  { key: "teacher_confirmed", label: "老师已确认", hint: "老师已确认工资明细，等待财务处理" },
  { key: "disputed", label: "有异议", hint: "老师已提交异议，财务需要处理" },
  { key: "reviewed", label: "待锁定", hint: "财务已处理，等待锁定发放" },
  { key: "locked", label: "已完成", hint: "工资已锁定发放" },
];

function settlementTeacherStatusKey(teacher = {}) {
  return teacher.payrollDetail?.status || (teacher.payroll?.status && teacher.payroll.status !== "preview" ? teacher.payroll.status : "missing");
}

function settlementTeacherStatusLabel(teacher = {}) {
  const key = settlementTeacherStatusKey(teacher);
  return settlementStatusGroups.find((group) => group.key === key)?.label || payrollStatusLabel(key);
}

function renderSettlementStatusBoard() {
  const board = document.querySelector("#settlementStatusBoard");
  if (!board) return;

  if (financeTeacherPage.loading && !financeTeacherPage.items.length) {
    board.innerHTML = skeletonListHtml(5);
    return;
  }

  if (financeTeacherPage.error) {
    board.innerHTML = loadErrorHtml(financeTeacherPage.error, "financeTeachers");
    return;
  }

  const teachers = financeFilteredTeacherItems();
  if (!teachers.length) {
    board.innerHTML = `<div class="empty-state compact">当前筛选下暂无老师，换个学部、年级或搜索条件试试。</div>`;
    return;
  }

  const groups = settlementStatusGroups.map((group) => ({
    ...group,
    teachers: teachers.filter((teacher) => settlementTeacherStatusKey(teacher) === group.key),
  }));
  const orderedTeachers = groups.flatMap((group) => group.teachers.map((teacher) => ({ teacher, group })));
  const totalText = financeTeacherPage.meta?.total
    ? `当前显示 ${teachers.length} 位 / 筛选结果 ${financeTeacherPage.meta.total} 位`
    : `当前筛选 ${teachers.length} 位老师`;

  board.innerHTML = `
    <div class="settlement-status-heading">
      <div>
        <strong>老师工资状态</strong>
        <span>${escapeHtml(totalText)}</span>
      </div>
      <small>点击任意老师行，直接切换到对应工资单</small>
    </div>
    <div class="settlement-status-counts" aria-label="工资状态人数">
      ${groups
        .map(
          (group) => `
            <span class="settlement-status-count status-${group.key}">
              ${escapeHtml(group.label)}
              <strong>${group.teachers.length}</strong>
            </span>
          `,
        )
        .join("")}
    </div>
    <div class="settlement-status-list" aria-label="当前筛选老师工资状态列表">
      ${orderedTeachers
        .map(({ teacher, group }) => {
          const teacherMeta = [
            backendTeacherDepartment(teacher),
            financeTeacherPage.grade ? financeGradeLabel(financeTeacherPage.grade) : teacher.gradeText || teacher.grade || "年级未设置",
            backendTeacherSubject(teacher),
            teacher.id,
          ]
            .filter(Boolean)
            .join(" · ");
          return `
            <button
              class="settlement-status-row status-${group.key} ${teacher.id === state.selectedFinanceTeacherId ? "active" : ""}"
              data-settlement-status-teacher="${escapeHtml(teacher.id)}"
              title="${escapeHtml(group.hint)}"
              type="button"
            >
              <span class="settlement-status-row-state">${escapeHtml(group.label)}</span>
              <strong>${escapeHtml(teacher.name)}</strong>
              <small>${escapeHtml(teacherMeta)}</small>
              <em>${escapeHtml(group.hint)}</em>
            </button>
          `;
        })
        .join("")}
    </div>
	  `;
	}

function settlementMonthStatusCounts() {
  const counts = financeTeacherPage.meta?.payrollStatusCounts || {};
  const total = financeTeacherPage.meta?.total || financeFilteredTeacherItems().length || 0;
  const saved = counts.saved || 0;
  const published = (counts.generated || 0) + (counts.teacher_confirmed || 0) + (counts.disputed || 0) + (counts.reviewed || 0) + (counts.locked || 0);
  const completed = counts.locked || 0;
  const notSaved = Math.max(total - saved - published, 0);
  return { total, saved, notSaved, published, completed };
}

function renderSettlementMonthProgress() {
  const container = document.querySelector("#settlementMonthProgress");
  if (!container) return;
  if (financeTeacherPage.loading && !financeTeacherPage.loaded) {
    container.innerHTML = `<span class="settlement-progress-pill muted">读取中</span>`;
    return;
  }
  const counts = settlementMonthStatusCounts();
  container.innerHTML = [
    ["已保存", counts.saved, "saved"],
    ["未保存", counts.notSaved, "missing"],
    ["已发布", counts.published, "published"],
    ["已完成", counts.completed, "locked"],
  ]
    .map(
      ([label, value, key]) => `
        <span class="settlement-progress-pill status-${key}">
          ${label}
          <strong>${value}</strong>
        </span>
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
  const serverGroups = financeTeacherPage.summary?.groups?.[state.financeGroupBy];
  if (Array.isArray(serverGroups)) return serverGroups;

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
  const summary = financeTeacherPage.summary;
  if (summary) {
    return {
      pending: summary.pendingCount || 0,
      exception: summary.exceptionCount || 0,
      gross: summary.grossPay || 0,
      net: summary.netPay || 0,
      locked: summary.lockedCount || 0,
    };
  }
  return financeTeacherPage.items.reduce(
    (totals, teacher) => {
      totals.pending += teacher.summary?.pendingCount || 0;
      totals.exception += teacher.summary?.exceptionCount || 0;
      totals.gross += teacher.payroll?.grossPay || 0;
      totals.net += teacher.payroll?.netPay || 0;
      if (teacher.payrollDetail?.status === "locked" || teacher.payroll?.status === "locked") totals.locked += 1;
      return totals;
    },
    { pending: 0, exception: 0, gross: 0, net: 0, locked: 0 },
  );
}

async function loadBackendTeacherContext(teacherId, weekStart = state.selectedScheduleWeekStart || "2026-06-15") {
  if (!backendMode() || !teacherId) return;
  try {
    const schedule = await apiRequest(`/api/teachers/${teacherId}/schedule?weekStart=${weekStart}`);
    const nextWeekStart = schedule.weekStart || weekStart;
    if (schedule.currentTerm) {
      termManagementState.currentTerm = schedule.currentTerm;
      if (!termManagementState.terms.some((term) => term.id === schedule.currentTerm.id)) {
        termManagementState.terms = [schedule.currentTerm, ...termManagementState.terms];
      }
    }
    state.selectedScheduleWeekStart = nextWeekStart;
    state.teacherScheduleWeeks[teacherId] = Array.isArray(schedule.availableWeeks) ? schedule.availableWeeks : [];
    const weekDates = weekDateKeys(nextWeekStart);
    if (!weekDates.includes(state.selectedScheduleDate)) {
      state.selectedScheduleDate = weekDates.includes(todayKey()) ? todayKey() : weekDates[0];
    }
    if (schedule.teacher) upsertTeacher(schedule.teacher);
    mergeBackendLessons(teacherId, schedule.lessons || [], { replaceWeekStart: nextWeekStart });
  } catch (error) {
    showToast(error.message || "老师课表加载失败");
  }
}

async function loadBackendWorkload(teacherId = currentTeacherId(), month = currentSettlementMonth()) {
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

  if (["confirm", "warnings"].includes(state.activeView)) {
    render();
  }
}

async function loadBackendAttendanceRecords(teacherId = currentTeacherId(), month = currentSettlementMonth()) {
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

function ensureBackendAttendanceRecords(teacherId, month = currentSettlementMonth()) {
  const needsRecords =
    attendanceRecordState.teacherId !== teacherId ||
    attendanceRecordState.month !== month ||
    !attendanceRecordState.loaded;
  if (!attendanceRecordState.loading && needsRecords) {
    loadBackendAttendanceRecords(teacherId, month);
  }
}

async function loadBackendTeacherPayroll(teacherId = currentTeacherId(), month = currentSettlementMonth(), options = {}) {
  if (!backendMode() || !teacherId) return;
  const detail = Boolean(options.detail);
  teacherPayrollState = {
    ...teacherPayrollState,
    teacherId,
    month,
    detail,
    loading: true,
    error: "",
  };

  try {
    const params = new URLSearchParams({ month });
    if (detail) params.set("detail", "confirmation");
    const data = await apiRequest(`/api/teachers/${teacherId}/payroll?${params.toString()}`);
    teacherPayrollState = {
      teacherId,
      month,
      detail,
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
      detail,
      loading: false,
      loaded: true,
      error: error.message || "总薪资加载失败",
      data: null,
    };
  }

  if (["dashboard", "confirm", "teacherPayroll"].includes(state.activeView)) render();
}

function ensureBackendTeacherPayroll(teacherId, month = currentSettlementMonth(), options = {}) {
  const detail = Boolean(options.detail);
  const needsPayroll =
    teacherPayrollState.teacherId !== teacherId ||
    teacherPayrollState.month !== month ||
    !teacherPayrollState.loaded ||
    (detail && !teacherPayrollState.detail);
  if (!teacherPayrollState.loading && needsPayroll) {
    loadBackendTeacherPayroll(teacherId, month, { detail });
  }
}

async function loadPayrollRules() {
  if (!backendMode() || !isFinanceRole()) return;
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
  let teacherSalaryScheme = null;
  const schemeInput = document.querySelector("#ruleTeacherSchemeJson");
  if (schemeInput?.value?.trim()) {
    try {
      teacherSalaryScheme = JSON.parse(schemeInput.value);
    } catch (error) {
      throw new Error(`专任教师工资规则 JSON 格式错误：${error.message}`);
    }
  }
  teacherSalaryScheme = applyPayrollSchemeEditorInputs(
    teacherSalaryScheme || payrollRuleState.rules?.teacherSalaryScheme || {},
  );
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
    ...(teacherSalaryScheme ? { teacherSalaryScheme } : {}),
  };
}

async function saveBackendPayrollRules() {
  if (!backendMode() || !isFinanceRole()) {
    showToast("请使用后端财务或行政管理账号保存薪资规则");
    return;
  }
  let payrollRules;
  try {
    payrollRules = payrollRulesFromInputs();
  } catch (error) {
    showToast(error.message || "薪资规则填写有误");
    return;
  }
  payrollRuleState = { ...payrollRuleState, loading: true, error: "" };
  renderPayrollConfig();
  try {
    const data = await apiRequest("/api/payroll-rules", {
      method: "PATCH",
      body: { payrollRules },
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

function salaryProfileFromInputs() {
  // 财务只维护金额相关项：考核档位、住房档、补充奖扣。
  // 职称、学历、兼岗任命、校龄、试用期比例均由人事档案决定，此处不再提交。
  return {
    assessmentBand: document.querySelector("#salaryAssessmentBand")?.value || "high",
    housingTier: document.querySelector("#salaryHousingTier")?.value || "teacher",
    attendanceDeduction: 0,
  };
}

function handleTeacherSalaryProfileAction() {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || !isFinanceRole() || !teacherId) {
    showToast("请使用后端财务或行政管理账号维护教师工资档案");
    return;
  }
  if (!salaryProfileEditMode) {
    salaryProfileEditMode = true;
    showToast("已进入编辑模式，本学期档案调整后会影响未锁定工资");
    render();
    return;
  }
  saveBackendTeacherSalaryProfile();
}

function cancelTeacherSalaryProfileEdit() {
  salaryProfileEditMode = false;
  render();
}

async function saveBackendTeacherSalaryProfile() {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || !isFinanceRole() || !teacherId) {
    showToast("请使用后端财务或行政管理账号维护教师工资档案");
    return;
  }
  let salaryProfile;
  try {
    salaryProfile = salaryProfileFromInputs();
  } catch (error) {
    showToast(error.message || "工资档案填写有误");
    return;
  }
  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  render();
  try {
    await apiRequest(`/api/teachers/${teacherId}/salary-profile`, {
      method: "PATCH",
      body: { salaryProfile },
    });
    resetFinanceTeacherDetailState();
    financeTeacherPage.loaded = false;
    await loadFinanceTeacherDetail(teacherId, { generatePayroll: false });
    salaryProfileEditMode = false;
    showToast("教师工资档案已保存，未锁定薪资需重新生成");
  } catch (error) {
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      loading: false,
      error: error.message || "工资档案保存失败",
    };
    showToast(financeTeacherDetailState.error);
  }
  render();
}

async function saveBackendTeacherMonthlyAdjustments() {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || !isFinanceRole() || !teacherId) {
    showToast("请使用后端财务或行政管理账号维护本月奖扣");
    return;
  }
  let manualItems;
  try {
    manualItems = salaryManualItemsFromInput();
  } catch (error) {
    showToast(error.message || "本月奖扣填写有误");
    return;
  }
  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  render();
  try {
    await apiRequest(`/api/teachers/${teacherId}/salary-profile`, {
      method: "PATCH",
      body: { salaryProfile: { manualItems } },
    });
    financeTeacherPage.loaded = false;
    await loadFinanceTeacherDetail(teacherId, { generatePayroll: false });
    showToast("本月特殊奖扣已保存，未锁定薪资需重新生成");
  } catch (error) {
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      loading: false,
      error: error.message || "本月奖扣保存失败",
    };
    showToast(financeTeacherDetailState.error);
  }
  render();
}

async function unlockBackendPayroll() {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || !isFinanceRole() || !teacherId) return;
  const month = financeTeacherDetailState.month || currentSettlementMonth();
  const reason = await promptDialog("解锁工资明细", {
    label: "解锁原因",
    value: "财务更正后重新核算",
    textarea: true,
    description: "系统会保留原锁定快照和操作记录。",
    confirmText: "确认解锁",
  });
  if (reason === null) return;
  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  renderSettlement();
  try {
    const payroll = await apiRequest(`/api/teachers/${teacherId}/payroll/unlock`, {
      method: "POST",
      body: { month, reason },
    });
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      loading: false,
      loaded: true,
      error: "",
      payroll,
      payrollGenerated: true,
      lockBlockers: payroll.lockBlockers || [],
    };
    financeTeacherPage.loaded = false;
    showToast("工资已解锁，请重新生成、复核并锁定");
  } catch (error) {
    financeTeacherDetailState = { ...financeTeacherDetailState, loading: false, error: error.message || "工资解锁失败", lockBlockers: error.details?.blockers || [] };
    showToast(financeTeacherDetailState.error);
  }
  render();
}

async function reviewBackendPayroll() {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || !isFinanceRole() || !teacherId) return;
  const month = financeTeacherDetailState.month || currentSettlementMonth();
  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  renderSettlement();
  try {
    const payroll = await apiRequest(`/api/teachers/${teacherId}/payroll/review`, {
      method: "POST",
      body: { month },
    });
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      loading: false,
      loaded: true,
      error: "",
      payroll,
      payrollGenerated: true,
      lockBlockers: payroll.lockBlockers || [],
    };
    financeTeacherPage.loaded = false;
    showToast("工资异议已处理/确认无误，可以锁定该老师工资");
  } catch (error) {
    financeTeacherDetailState = { ...financeTeacherDetailState, loading: false, error: error.message || "财务处理失败", lockBlockers: error.details?.blockers || [] };
    showToast(financeTeacherDetailState.error);
  }
  render();
}

async function lockBackendPayroll() {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || !isFinanceRole() || !teacherId) return;
  const month = financeTeacherDetailState.month || currentSettlementMonth();
  const payrollStatus = financeTeacherDetailState.payroll?.generated?.status || "";
  const blockers = financeTeacherDetailState.payroll?.lockBlockers || financeTeacherDetailState.lockBlockers || [];
  if (payrollStatus === "reviewed" && blockers.length) {
    showToast(`仍有 ${blockers.length} 条待处理或异常课次，不能锁定`);
    return;
  }
  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  renderSettlement();
  try {
    const payroll = await apiRequest(`/api/teachers/${teacherId}/payroll/lock`, {
      method: "POST",
      body: { month },
    });
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      loading: false,
      loaded: true,
      error: "",
      payroll,
      payrollGenerated: true,
      lockBlockers: payroll.lockBlockers || [],
    };
    financeTeacherPage.loaded = false;
    showToast("该老师本月工资已锁定");
  } catch (error) {
    financeTeacherDetailState = { ...financeTeacherDetailState, loading: false, error: error.message || "工资锁定失败", lockBlockers: error.details?.blockers || [] };
    showToast(financeTeacherDetailState.error);
  }
  render();
}

async function saveBackendTeacherPayrollDraft() {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || !isFinanceRole() || !teacherId) return;
  const month = financeTeacherDetailState.month || currentSettlementMonth();
  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  renderSettlement();
  try {
    const payroll = await apiRequest(`/api/teachers/${teacherId}/payroll/generate`, {
      method: "POST",
      body: { month },
    });
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      loading: false,
      loaded: true,
      error: "",
      payroll,
      payrollGenerated: true,
      lockBlockers: payroll.lockBlockers || [],
    };
    financeTeacherPage.loaded = false;
    showToast("该老师工资已保存为财务草稿");
  } catch (error) {
    financeTeacherDetailState = { ...financeTeacherDetailState, loading: false, error: error.message || "工资保存失败", lockBlockers: error.details?.blockers || [] };
    showToast(financeTeacherDetailState.error);
  }
  render();
}

async function batchGenerateBackendPayroll() {
  if (!backendMode() || !isFinanceRole()) return;
  const month = currentSettlementMonth();
  const confirmed = await confirmDialog("发布本月工资明细", {
    description: "会把所有在职老师的已保存工资单发布到老师端；未保存的老师会按当前规则自动生成并发布。",
    confirmText: "发布",
  });
  if (!confirmed) return;
  try {
    const result = await apiRequest("/api/payroll/batch-generate", {
      method: "POST",
      body: { month },
    });
    financeTeacherPage.loaded = false;
    resetFinanceTeacherDetailState();
    showToast(`已发布 ${result.successCount} 份工资明细，失败 ${result.failedCount} 份`);
    render();
  } catch (error) {
    showToast(error.message || "发布本月工资失败");
  }
}

async function batchLockBackendPayroll() {
  if (!backendMode() || !isFinanceRole()) return;
  const month = currentSettlementMonth();
  const confirmed = await confirmDialog("批量锁定工资", {
    description: "只处理已由老师确认、财务处理完成、且没有待处理/异常课次的工资单；不符合条件的老师会保留失败原因。",
    confirmText: "批量锁定",
  });
  if (!confirmed) return;
  try {
    const result = await apiRequest("/api/payroll/batch-lock", {
      method: "POST",
      body: { month },
    });
    financeTeacherPage.loaded = false;
    resetFinanceTeacherDetailState();
    showToast(`已锁定 ${result.successCount} 份工资，未锁定 ${result.failedCount} 份`);
    const status = document.querySelector("#payrollExportStatus");
    if (status) {
      status.textContent = `批量锁定完成：成功 ${result.successCount} 份，未锁定 ${result.failedCount} 份；未锁定的老师请按状态逐个处理。`;
    }
    render();
  } catch (error) {
    showToast(error.message || "批量锁定工资失败");
    const status = document.querySelector("#payrollExportStatus");
    if (status) status.textContent = error.message || "批量锁定工资失败";
  }
}

function downloadCsvResult(result, fallbackFilename, options = {}) {
  const content = result?.content || "";
  const total = Number(result?.total || 0);
  const filename = result?.filename || fallbackFilename;
  const status = options.statusSelector ? document.querySelector(options.statusSelector) : null;
  if (!content || total <= 0) {
    if (status) status.textContent = "当前筛选没有可导出的工资明细。";
    showToast("当前筛选没有可导出的工资明细");
    return false;
  }
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = result.filename || fallbackFilename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
  if (status) {
    const dataUrl = `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(content)}`;
    status.innerHTML = `已准备 ${total} 份工资明细 CSV；如浏览器未自动下载，<a href="${dataUrl}" download="${escapeHtml(filename)}">点击这里下载</a>。`;
  }
  showToast(`已导出 ${total} 份工资明细`);
  return true;
}

async function exportBackendPayrollCsv() {
  if (!backendMode() || !isFinanceRole()) return;
  try {
    const month = currentSettlementMonth();
    const params = new URLSearchParams({ month });
    if (financeTeacherPage.stageId) params.set("stageId", financeTeacherPage.stageId);
    if (financeTeacherPage.grade) params.set("grade", financeTeacherPage.grade);
    if (financeTeacherPage.search) params.set("search", financeTeacherPage.search);
    const result = await apiRequest(`/api/payroll/export?${params.toString()}`);
    downloadCsvResult(result, `teacher-payroll-${month}.csv`, { statusSelector: "#payrollExportStatus" });
  } catch (error) {
    const status = document.querySelector("#payrollExportStatus");
    if (status) status.textContent = error.message || "工资明细导出失败";
    showToast(error.message || "工资明细导出失败");
  }
}

function payrollHistorySelectedTerm() {
  return (
    termManagementState.terms.find((term) => term.id === payrollHistoryState.termId) ||
    termManagementState.currentTerm ||
    termManagementState.terms[0] ||
    null
  );
}

function ensurePayrollHistorySelection() {
  const term = payrollHistorySelectedTerm();
  if (!term) return;
  const termChanged = payrollHistoryState.termId !== term.id;
  const months = monthKeysBetween(term.startDate, term.endDate);
  const month = months.includes(payrollHistoryState.month)
    ? payrollHistoryState.month
    : defaultMonthForTerm(term);
  payrollHistoryState = {
    ...payrollHistoryState,
    termId: term.id,
    month,
    loaded: termChanged ? false : payrollHistoryState.loaded,
  };
}

async function loadPayrollHistory(options = {}) {
  if (!backendMode() || !isFinanceRole()) return;
  const termId = options.termId || payrollHistoryState.termId || termManagementState.currentTerm?.id || "";
  const month = options.month || payrollHistoryState.month || "2026-06";
  if (!termId || !month) return;
  payrollHistoryState = {
    ...payrollHistoryState,
    termId,
    month,
    loading: true,
    error: "",
  };
  if (state.activeView === "payrollHistory") render();
  try {
    const params = new URLSearchParams({ termId, month });
    const data = await apiRequest(`/api/payroll/history?${params.toString()}`);
    payrollHistoryState = {
      ...payrollHistoryState,
      loadedTermId: termId,
      loadedMonth: month,
      loading: false,
      loaded: true,
      error: "",
      data,
    };
  } catch (error) {
    payrollHistoryState = {
      ...payrollHistoryState,
      loadedTermId: termId,
      loadedMonth: month,
      loading: false,
      loaded: true,
      error: error.message || "历史工资记录读取失败",
      data: null,
    };
    showToast(payrollHistoryState.error);
  }
  if (state.activeView === "payrollHistory") render();
}

async function exportPayrollHistoryCsv() {
  if (!backendMode() || !isFinanceRole()) return;
  ensurePayrollHistorySelection();
  const termId = payrollHistoryState.termId;
  const month = payrollHistoryState.month;
  if (!termId || !month) {
    showToast("请先选择学期和月份");
    return;
  }
  try {
    const params = new URLSearchParams({ termId, month });
    const result = await apiRequest(`/api/payroll/export?${params.toString()}`);
    downloadCsvResult(result, `teacher-payroll-${month}.csv`, { statusSelector: "#payrollHistoryExportStatus" });
  } catch (error) {
    const status = document.querySelector("#payrollHistoryExportStatus");
    if (status) status.textContent = error.message || "历史工资导出失败";
    showToast(error.message || "历史工资导出失败");
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

function payrollFlowStage(status = "") {
  if (status === "locked") return 3;
  if (status === "reviewed") return 2;
  if (status === "teacher_confirmed" || status === "disputed") return 1;
  if (status === "saved" || status === "generated") return 0;
  return 0;
}

async function confirmBackendWorkload(teacherId = currentTeacherId(), month = currentSettlementMonth()) {
  if (!backendMode() || currentRole() !== "teacher" || !teacherId) return;
  teacherPayrollState = {
    ...teacherPayrollState,
    teacherId,
    month,
    detail: true,
    loading: true,
    error: "",
  };
  render();

  try {
    const data = await apiRequest(`/api/teachers/${teacherId}/payroll/teacher-confirm`, {
      method: "POST",
      body: { month },
    });
    teacherPayrollState = {
      teacherId,
      month,
      detail: true,
      loading: false,
      loaded: true,
      error: "",
      data,
    };
    state.confirmationStages[teacherId] = payrollFlowStage(data.generated?.status);
    resetTeacherPayrollState();
    teacherPayrollState = {
      teacherId,
      month,
      detail: true,
      loading: false,
      loaded: true,
      error: "",
      data,
    };
    showToast("本月工资明细已确认");
  } catch (error) {
    teacherPayrollState = {
      ...teacherPayrollState,
      teacherId,
      month,
      detail: true,
      loading: false,
      loaded: true,
      error: error.message || "工资明细确认失败",
    };
    showToast(error.message || "工资明细确认失败");
  }

  render();
}

async function disputeBackendPayroll(teacherId = currentTeacherId(), month = currentSettlementMonth()) {
  if (!backendMode() || currentRole() !== "teacher" || !teacherId) return;
  const reason = document.querySelector("#payrollDisputeReason")?.value.trim() || "";
  if (!reason) {
    showToast("请先填写异议说明");
    return;
  }
  teacherPayrollState = {
    ...teacherPayrollState,
    teacherId,
    month,
    detail: true,
    loading: true,
    error: "",
  };
  render();

  try {
    const data = await apiRequest(`/api/teachers/${teacherId}/payroll/dispute`, {
      method: "POST",
      body: { month, reason },
    });
    teacherPayrollState = {
      teacherId,
      month,
      detail: true,
      loading: false,
      loaded: true,
      error: "",
      data,
    };
    state.confirmationStages[teacherId] = payrollFlowStage(data.generated?.status);
    showToast("工资异议已提交，等待财务处理");
  } catch (error) {
    teacherPayrollState = {
      ...teacherPayrollState,
      teacherId,
      month,
      detail: true,
      loading: false,
      loaded: true,
      error: error.message || "工资异议提交失败",
    };
    showToast(error.message || "工资异议提交失败");
  }

  render();
}

async function approveBackendWorkload(step) {
  const teacherId = state.selectedFinanceTeacherId;
  if (!backendMode() || currentRole() !== "admin" || !teacherId) {
    showToast("请使用教研所账号审批工作量");
    return;
  }
  const month = financeTeacherDetailState.month || currentSettlementMonth();
  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  renderSettlement();
  try {
    const workload = await apiRequest(`/api/teachers/${teacherId}/workload/approve`, {
      method: "POST",
      body: { month, step },
    });
    const payroll = await apiRequest(`/api/teachers/${teacherId}/payroll?month=${month}`);
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: "",
      workload,
      payroll,
      payrollGenerated: Boolean(payroll.generated),
      lockBlockers: payroll.lockBlockers || [],
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
    month: currentSettlementMonth(),
  });
  if (financeTeacherPage.stageId) params.set("stageId", financeTeacherPage.stageId);
  if (financeTeacherPage.grade) params.set("grade", financeTeacherPage.grade);
  if (financeTeacherPage.search) params.set("search", financeTeacherPage.search);

  try {
    const result = await apiRequest(`/api/teachers?${params.toString()}`);
    financeTeacherPage = {
      ...financeTeacherPage,
      items: result.items || [],
      summary: result.summary || null,
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

async function resetBackendAccountPassword(accountId) {
  if (!backendMode() || currentRole() !== "system_admin" || !accountId) return;
  const confirmed = await confirmDialog("重置密码", {
    description: "将该账号密码重置为 123456，账号下次登录后应立即修改密码。",
    confirmText: "重置",
    danger: true,
  });
  if (!confirmed) return;
  try {
    const result = await apiRequest(`/api/accounts/${encodeURIComponent(accountId)}/reset-password`, {
      method: "POST",
      body: { newPassword: "123456" },
    });
    showToast(`${result.account?.username || "账号"} 密码已重置为 123456`);
    await loadPersonnelPage({ page: personnelPage.page });
  } catch (error) {
    showToast(error.message || "账号密码重置失败");
  }
}

async function updateBackendAccountStatus(accountId, nextStatus) {
  if (!backendMode() || currentRole() !== "system_admin" || !accountId) return;
  const actionText = nextStatus === "disabled" ? "停用" : "启用";
  const confirmed = await confirmDialog(`${actionText}账号`, {
    description: `确认${actionText}该账号？`,
    confirmText: actionText,
    danger: nextStatus === "disabled",
  });
  if (!confirmed) return;
  try {
    const result = await apiRequest(`/api/accounts/${encodeURIComponent(accountId)}/status`, {
      method: "POST",
      body: { status: nextStatus },
    });
    showToast(`${result.account?.username || "账号"} 已${actionText}`);
    await loadPersonnelPage({ page: personnelPage.page });
  } catch (error) {
    showToast(error.message || `${actionText}账号失败`);
  }
}

async function loadFinanceTeacherDetail(
  teacherId = state.selectedFinanceTeacherId,
  { month = currentSettlementMonth(), generatePayroll = false } = {},
) {
  if (!backendMode() || !isFinanceRole() || !teacherId) return;
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
      lockBlockers: error.details?.blockers || [],
    };
  }

  if (["financeRecords", "settlement", "warnings"].includes(state.activeView)) {
    render();
  }
}

function ensureFinanceTeacherDetail(teacherId, { generatePayroll = false } = {}) {
  const month = currentSettlementMonth();
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
    termId: termManagementState.currentTerm?.id || state.schedulingConfig.termId || "",
    divisionId: state.selectedSchedulingDivisionId,
    gradeId: state.selectedSchedulingGradeId,
  };
}

function currentSchedulingTermId() {
  return termManagementState.currentTerm?.id || state.schedulingConfig.termId || "";
}

function applyTermContext(result = {}) {
  termManagementState = {
    ...termManagementState,
    terms: Array.isArray(result.terms) ? result.terms : termManagementState.terms,
    currentTerm: result.currentTerm || termManagementState.currentTerm,
    loaded: true,
    loading: false,
    error: "",
  };
  if (termManagementState.currentTerm) {
    state.schedulingConfig = {
      ...state.schedulingConfig,
      termId: termManagementState.currentTerm.id,
      termName: termManagementState.currentTerm.name,
      termStartDate: termManagementState.currentTerm.startDate,
      termEndDate: termManagementState.currentTerm.endDate,
      termStatus: termManagementState.currentTerm.status,
    };
  }
}

async function loadTermContext() {
  if (!backendMode()) return null;
  termManagementState = { ...termManagementState, loading: true, error: "" };
  try {
    const result = await apiRequest("/api/terms");
    applyTermContext(result);
    return result;
  } catch (error) {
    termManagementState = {
      ...termManagementState,
      loaded: true,
      loading: false,
      error: error.message || "学期信息加载失败",
    };
    showToast(termManagementState.error);
    return null;
  }
}

async function createBackendTerm() {
  if (!backendMode() || currentRole() !== "admin") return;
  const name = document.querySelector("#newTermName")?.value.trim();
  const schoolYear = document.querySelector("#newTermSchoolYear")?.value.trim();
  const semester = document.querySelector("#newTermSemester")?.value.trim();
  const startDate = document.querySelector("#newTermStartDate")?.value;
  const endDate = document.querySelector("#newTermEndDate")?.value;
  const copyConfig = Boolean(document.querySelector("#copyTermConfig")?.checked);
  termManagementState = { ...termManagementState, loading: true, error: "" };
  renderAdminScheduling();
  try {
    const result = await apiRequest("/api/terms", {
      method: "POST",
      body: {
        name,
        schoolYear,
        semester,
        startDate,
        endDate,
        copyConfig,
        copyFromTermId: termManagementState.currentTerm?.id || "",
      },
    });
    applyTermContext(result);
    ["#newTermName", "#newTermSchoolYear", "#newTermSemester", "#newTermStartDate", "#newTermEndDate"].forEach(
      (selector) => {
        const input = document.querySelector(selector);
        if (input) input.value = "";
      },
    );
    showToast("新学期已创建");
  } catch (error) {
    termManagementState = {
      ...termManagementState,
      loaded: true,
      loading: false,
      error: error.message || "新建学期失败",
    };
    showToast(termManagementState.error);
  }
  render();
}

async function setBackendCurrentTerm(termId) {
  if (!backendMode() || currentRole() !== "admin") return;
  termManagementState = { ...termManagementState, loading: true, error: "" };
  renderAdminScheduling();
  try {
    const result = await apiRequest(`/api/terms/${encodeURIComponent(termId)}/current`, { method: "POST" });
    applyTermContext(result);
    state.schedulingDraft = {
      ...clone(initialState.schedulingDraft),
      divisionId: state.schedulingConfig.divisionId,
      gradeId: state.schedulingConfig.gradeId,
    };
    schedulingBackendState = { ...schedulingBackendState, loaded: false, loading: false, error: "", job: null, precheck: null };
    await loadBackendSchedulingContext();
    showToast("当前学期已切换");
  } catch (error) {
    termManagementState = {
      ...termManagementState,
      loaded: true,
      loading: false,
      error: error.message || "切换当前学期失败",
    };
    showToast(termManagementState.error);
  }
  render();
}

async function archiveBackendTerm(termId) {
  if (!backendMode() || currentRole() !== "admin") return;
  const term = termManagementState.terms.find((item) => item.id === termId);
  if (!term) return;
  if (!(await confirmDialog("归档学期", {
    description: `归档“${term.name}”后，该学期课表、调课和工资操作将只读。`,
    confirmText: "归档",
    danger: true,
  }))) return;
  termManagementState = { ...termManagementState, loading: true, error: "" };
  renderAdminScheduling();
  try {
    const result = await apiRequest(`/api/terms/${encodeURIComponent(termId)}/archive`, { method: "POST" });
    applyTermContext(result);
    showToast("学期已归档");
  } catch (error) {
    termManagementState = {
      ...termManagementState,
      loaded: true,
      loading: false,
      error: error.message || "归档学期失败",
    };
    showToast(termManagementState.error);
  }
  render();
}

async function deleteBackendTerm(termId) {
  if (!backendMode() || currentRole() !== "admin") return;
  const term = termManagementState.terms.find((item) => item.id === termId);
  if (!term) return;
  if (!(await confirmDialog("删除学期", {
    description: `删除误建学期“${term.name}”？仅未投入使用的计划学期可以删除，已产生业务数据的学期会被系统拦截。`,
    confirmText: "删除",
    danger: true,
  }))) return;
  termManagementState = { ...termManagementState, loading: true, error: "" };
  renderAdminScheduling();
  try {
    const result = await apiRequest(`/api/terms/${encodeURIComponent(termId)}`, { method: "DELETE" });
    applyTermContext(result);
    showToast("误建学期已删除");
  } catch (error) {
    termManagementState = {
      ...termManagementState,
      loaded: true,
      loading: false,
      error: error.message || "删除学期失败",
    };
    showToast(termManagementState.error);
  }
  render();
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

  if (Array.isArray(result.versions)) {
    state.scheduleVersions = result.versions;
  }

  if (result.precheck) {
    schedulingBackendState = {
      ...schedulingBackendState,
      precheck: result.precheck,
    };
  } else if (result.draft?.precheck) {
    schedulingBackendState = {
      ...schedulingBackendState,
      precheck: result.draft.precheck,
    };
  }
}

async function loadBackendSchedulingContext(options = backendSchedulingOptions()) {
  if (!backendMode() || currentRole() !== "admin") return;
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "", job: null };

  try {
    const params = new URLSearchParams(options);
    const result = await apiRequest(`/api/scheduling/config?${params.toString()}`);
    applyBackendScheduleResult(result);
    schedulingBackendState = {
      ...schedulingBackendState,
      loaded: true,
      loading: false,
      error: "",
      job: null,
    };
  } catch (error) {
    schedulingBackendState = {
      ...schedulingBackendState,
      loaded: true,
      loading: false,
      error: error.message || "后端排课配置加载失败",
      job: null,
    };
    showToast(schedulingBackendState.error);
  }

  if (state.activeView === "adminScheduling" || state.activeView === "adminScheduleOverview") {
    render();
  }
}

async function refreshBackendSchedulePrecheck() {
  if (!backendMode() || currentRole() !== "admin") return;
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();

  try {
    const params = new URLSearchParams(backendSchedulingOptions());
    const result = await apiRequest(`/api/scheduling/precheck?${params.toString()}`);
    applyBackendScheduleResult(result);
    schedulingBackendState = {
      ...schedulingBackendState,
      loaded: true,
      loading: false,
      error: "",
    };
    showToast(result.precheck?.blockingCount ? "预检发现阻塞项" : "排课预检已通过");
  } catch (error) {
    schedulingBackendState = {
      ...schedulingBackendState,
      loaded: true,
      loading: false,
      error: error.message || "排课预检失败",
    };
    showToast(schedulingBackendState.error);
  }

  render();
}

function clearSchedulingJobPolling() {
  if (schedulingJobPollTimer) {
    window.clearTimeout(schedulingJobPollTimer);
    schedulingJobPollTimer = null;
  }
}

function schedulingJobProgressText(job) {
  if (!job) return "";
  const progress = Number(job.progress || 0);
  if (job.status === "queued") return `排队中 · ${progress}%`;
  if (job.status === "running") return `${job.message || "正在生成排课草稿"} · ${progress}%`;
  if (job.status === "completed") {
    const summary = job.summary;
    return summary
      ? `已完成 · ${summary.generatedLessonCount}/${summary.requiredLessonCount} 节 · 冲突 ${summary.conflictCount}`
      : "已完成";
  }
  if (job.status === "cancelled") return "已取消";
  if (job.status === "failed") return job.error?.message || "排课任务失败";
  return job.message || "";
}

function schedulingJobIsActive(job) {
  return job && ["queued", "running"].includes(job.status);
}

async function pollBackendScheduleJob(jobId) {
  if (!jobId) return;

  try {
    const result = await apiRequest(`/api/scheduling/generate-jobs/${encodeURIComponent(jobId)}`);
    const job = result.job || null;
    schedulingBackendState = {
      ...schedulingBackendState,
      loading: schedulingJobIsActive(job),
      error: job?.status === "failed" ? job.error?.message || "后端生成排课失败" : "",
      job,
    };

    if (job?.status === "completed") {
      clearSchedulingJobPolling();
      if (job.result) applyBackendScheduleResult(job.result);
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "", job };
      const summary = job.summary || {};
      showToast(
        `${summary.solverAlgorithm === "ortools-cp-sat" ? "CP-SAT" : "高级算法"}已生成 ${summary.generatedLessonCount || 0} 节课表`,
      );
      render();
      return;
    }

    if (job?.status === "failed") {
      clearSchedulingJobPolling();
      showToast(schedulingBackendState.error);
      render();
      return;
    }

    if (job?.status === "cancelled") {
      clearSchedulingJobPolling();
      showToast("排课任务已取消");
      render();
      return;
    }

    if (schedulingJobIsActive(job)) {
      renderAdminScheduling();
      schedulingJobPollTimer = window.setTimeout(() => pollBackendScheduleJob(jobId), 1200);
    }
  } catch (error) {
    clearSchedulingJobPolling();
    schedulingBackendState = {
      ...schedulingBackendState,
      loaded: true,
      loading: false,
      error: error.message || "排课任务状态查询失败",
      job: null,
    };
    showToast(schedulingBackendState.error);
    render();
  }
}

async function cancelBackendScheduleJob() {
  const jobId = schedulingBackendState.job?.id;
  if (!jobId || !schedulingJobIsActive(schedulingBackendState.job)) {
    showToast("当前没有可取消的排课任务");
    return;
  }

  clearSchedulingJobPolling();
  schedulingBackendState = {
    ...schedulingBackendState,
    loading: true,
    error: "",
  };
  renderAdminScheduling();

  try {
    const result = await apiRequest(`/api/scheduling/generate-jobs/${encodeURIComponent(jobId)}/cancel`, {
      method: "POST",
    });
    const job = result.job || null;
    schedulingBackendState = {
      ...schedulingBackendState,
      loaded: true,
      loading: schedulingJobIsActive(job),
      error: "",
      job,
    };
    showToast(result.cancelled ? "排课任务已取消" : "排课任务当前不能取消");
  } catch (error) {
    schedulingBackendState = {
      ...schedulingBackendState,
      loaded: true,
      loading: false,
      error: error.message || "取消排课任务失败",
      job: schedulingBackendState.job || null,
    };
    showToast(schedulingBackendState.error);
  }

  render();
}

async function generateBackendSchedule() {
  clearSchedulingJobPolling();
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "", job: null };
  renderAdminScheduling();

  try {
    const result = await apiRequest("/api/scheduling/generate-jobs", {
      method: "POST",
      body: backendSchedulingOptions(),
    });
    const job = result.job || null;
    schedulingBackendState = {
      ...schedulingBackendState,
      loaded: true,
      loading: true,
      error: "",
      job,
    };
    showToast(job?.message || "排课任务已创建");
    renderAdminScheduling();
    if (job?.id) {
      schedulingJobPollTimer = window.setTimeout(() => pollBackendScheduleJob(job.id), 900);
    }
  } catch (error) {
    schedulingBackendState = {
      ...schedulingBackendState,
      loaded: true,
      loading: false,
      error: error.message || "后端生成排课失败",
      job: null,
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
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
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

async function rollbackBackendScheduleVersion(versionId) {
  if (!versionId || !backendMode() || currentRole() !== "admin") return;
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();

  try {
    const result = await apiRequest("/api/scheduling/rollback", {
      method: "POST",
      body: {
        ...backendSchedulingOptions(),
        versionId,
      },
    });
    applyBackendScheduleResult(result);
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
    await loadBackendNotifications();
    showToast(`已回滚到 V${result.version?.versionNumber || ""}，老师端课表已同步`);
  } catch (error) {
    schedulingBackendState = {
      loaded: true,
      loading: false,
      error: error.message || "课表版本回滚失败",
    };
    showToast(schedulingBackendState.error);
  }

  render();
}

function collectCourseRulesFromForm() {
  return Array.from(document.querySelectorAll("[data-course-rule-id]")).map((row) => {
    const subjectId = row.dataset.courseRuleId;
    const minPerClassPerDay = normalizeCourseRuleMinPerDay(
      document.querySelector(`[data-course-rule-min-day="${subjectId}"]`)?.value || "0",
    );
    const maxConsecutivePerClass = normalizeCourseRuleMaxConsecutive(
      document.querySelector(`[data-course-rule-max-consecutive="${subjectId}"]`)?.value || "0",
    );
    return {
      subjectId,
      enabled: true,
      weeklyLessons: Number.parseInt(document.querySelector(`[data-course-rule-weekly="${subjectId}"]`)?.value || "0", 10),
      durationMinutes: Number.parseInt(document.querySelector(`[data-course-rule-duration="${subjectId}"]`)?.value || "40", 10),
      minPerClassPerDay,
      maxPerClassPerDay: normalizeCourseRuleMaxPerDay(
        document.querySelector(`[data-course-rule-max-day="${subjectId}"]`)?.value || "0",
      ),
      minWeeklyDays:
        minPerClassPerDay > 0
          ? 0
          : normalizeCourseRuleMinWeeklyDays(
              document.querySelector(`[data-course-rule-min-weekly-days="${subjectId}"]`)?.value || "0",
            ),
      maxConsecutivePerClass,
      allowConsecutive: maxConsecutivePerClass === 1 ? false : true,
      forbiddenPeriods: normalizeCourseRulePeriods(
        document.querySelector(`[data-course-rule-forbidden-periods="${subjectId}"]`)?.value || "",
      ),
      preferredDayPart: normalizePreferredDayPart(
        document.querySelector(`[data-course-rule-preferred-day-part="${subjectId}"]`)?.value || "any",
      ),
      requiredRoomType: normalizeScheduleRoomType(
        document.querySelector(`[data-course-rule-room-type="${subjectId}"]`)?.value || "homeroom",
      ),
    };
  });
}

function syncCourseRuleCoverageInput(subjectId) {
  if (!subjectId) return;
  const minDayInput = document.querySelector(`[data-course-rule-min-day="${subjectId}"]`);
  const coverageInput = document.querySelector(`[data-course-rule-min-weekly-days="${subjectId}"]`);
  const hint = document.querySelector(`[data-course-rule-coverage-hint="${subjectId}"]`);
  if (!minDayInput || !coverageInput) return;
  const minPerClassPerDay = normalizeCourseRuleMinPerDay(minDayInput.value || "0");
  const autoCovered = minPerClassPerDay > 0;
  coverageInput.disabled = autoCovered;
  if (autoCovered) coverageInput.value = "0";
  const label = coverageInput.closest(".field-label");
  if (label) label.classList.toggle("disabled-field", autoCovered);
  if (hint) {
    hint.classList.toggle("active", autoCovered);
    hint.textContent = autoCovered
      ? "已由每天至少规则自动覆盖 5 个教学日"
      : "覆盖天数用于避免课程集中在少数几天；不填则不限。";
  }
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
    minPerClassPerDay: normalizeCourseRuleMinPerDay(rule.minPerClassPerDay || 0),
    maxPerClassPerDay: normalizeCourseRuleMaxPerDay(rule.maxPerClassPerDay || 0),
    minWeeklyDays:
      normalizeCourseRuleMinPerDay(rule.minPerClassPerDay || 0) > 0
        ? 0
        : normalizeCourseRuleMinWeeklyDays(rule.minWeeklyDays || 0),
    maxConsecutivePerClass: normalizeCourseRuleMaxConsecutive(rule.maxConsecutivePerClass || 0),
    allowConsecutive: rule.allowConsecutive !== false,
    forbiddenPeriods: normalizeCourseRulePeriods(rule.forbiddenPeriods || []),
    preferredDayPart: normalizePreferredDayPart(rule.preferredDayPart || "any"),
    requiredRoomType: normalizeScheduleRoomType(rule.requiredRoomType || SUBJECT_DEFAULT_ROOM_TYPES[rule.subjectId] || "homeroom"),
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

function splitSchedulePeriodTime(period = {}) {
  const [startTime = "", endTime = ""] = String(period.time || "").split("-");
  return {
    startTime: period.startTime || startTime || "08:00",
    endTime: period.endTime || endTime || "08:40",
  };
}

function schedulePeriodTypeText(type = "regular") {
  if (type === "selfStudy") return "自习";
  if (type === "activity") return "活动";
  if (type === "evening") return "晚自习";
  return "正课";
}

function schedulePeriodTypeOptions(selected = "regular") {
  return [
    ["regular", "正课"],
    ["selfStudy", "自习"],
    ["activity", "活动"],
    ["evening", "晚自习"],
  ]
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`)
    .join("");
}

function timeTextToMinutes(value) {
  const text = String(value || "").trim();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) return null;
  const [hour, minute] = text.split(":").map(Number);
  return hour * 60 + minute;
}

function minutesToTimeText(value) {
  const minutes = Math.min(Math.max(Number(value || 0), 0), 23 * 60 + 59);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function schedulePeriodsFromConfig(config = state.schedulingConfig) {
  return (config.periods?.length ? config.periods : schedulingCatalog.periods).map((period, index) => {
    const { startTime, endTime } = splitSchedulePeriodTime(period);
    return {
      period: index + 1,
      label: period.label || `第 ${index + 1} 节`,
      startTime,
      endTime,
      time: `${startTime}-${endTime}`,
      type: period.type || "regular",
      typeName: schedulePeriodTypeText(period.type || "regular"),
      active: period.active !== false,
    };
  });
}

function schedulePeriodTemplateHtml(config = state.schedulingConfig) {
  return schedulePeriodsFromConfig(config)
    .map((period, index) => `
      <div class="period-template-row" data-schedule-period-row>
        <div class="period-template-index">第 ${index + 1} 节</div>
        <label class="field-label" for="periodStart-${index}">
          <span>开始时间</span>
          <input id="periodStart-${index}" data-schedule-period-start type="time" value="${escapeHtml(period.startTime)}" />
        </label>
        <label class="field-label" for="periodEnd-${index}">
          <span>结束时间</span>
          <input id="periodEnd-${index}" data-schedule-period-end type="time" value="${escapeHtml(period.endTime)}" />
        </label>
        <label class="field-label" for="periodType-${index}">
          <span>节次类型</span>
          <select id="periodType-${index}" data-schedule-period-type class="lesson-select">
            ${schedulePeriodTypeOptions(period.type)}
          </select>
        </label>
        <button class="ghost-button icon-danger" data-delete-schedule-period="${index}" type="button">删除</button>
      </div>
    `)
    .join("");
}

function readSchedulePeriodsFromForm(options = {}) {
  const validate = options.validate !== false;
  const rows = Array.from(document.querySelectorAll("[data-schedule-period-row]"));
  const periods = rows.map((row, index) => {
    const startTime = row.querySelector("[data-schedule-period-start]")?.value || "";
    const endTime = row.querySelector("[data-schedule-period-end]")?.value || "";
    const type = row.querySelector("[data-schedule-period-type]")?.value || "regular";
    return {
      period: index + 1,
      label: `第 ${index + 1} 节`,
      startTime,
      endTime,
      time: `${startTime}-${endTime}`,
      type,
      typeName: schedulePeriodTypeText(type),
      active: true,
    };
  });

  if (!validate) return periods.length ? periods : schedulePeriodsFromConfig();
  if (!periods.length) throw new Error("请至少保留 1 个可排课节次");
  periods.forEach((period, index) => {
    const startMinutes = timeTextToMinutes(period.startTime);
    const endMinutes = timeTextToMinutes(period.endTime);
    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      throw new Error(`第 ${index + 1} 节时间无效，请确认开始和结束时间`);
    }
    if (index > 0) {
      const previousEnd = timeTextToMinutes(periods[index - 1].endTime);
      if (previousEnd !== null && startMinutes < previousEnd) {
        throw new Error(`第 ${index + 1} 节与上一节时间重叠`);
      }
    }
  });
  return periods;
}

function addSchedulePeriodRow() {
  const periods = readSchedulePeriodsFromForm({ validate: false });
  if (periods.length >= 12) {
    showToast("每天最多配置 12 个可排课节次");
    return;
  }
  const last = periods[periods.length - 1] || { endTime: "08:40" };
  const lastEnd = timeTextToMinutes(last.endTime) ?? 8 * 60 + 40;
  const startTime = minutesToTimeText(Math.min(lastEnd + 10, 23 * 60 + 10));
  const endTime = minutesToTimeText(Math.min((timeTextToMinutes(startTime) ?? lastEnd + 10) + 40, 23 * 60 + 59));
  state.schedulingConfig.periods = [
    ...periods,
    {
      period: periods.length + 1,
      label: `第 ${periods.length + 1} 节`,
      startTime,
      endTime,
      time: `${startTime}-${endTime}`,
      type: "regular",
      typeName: schedulePeriodTypeText("regular"),
      active: true,
    },
  ];
  renderAdminScheduling();
}

function deleteSchedulePeriodRow(index) {
  const periods = readSchedulePeriodsFromForm({ validate: false }).filter((_, rowIndex) => rowIndex !== Number(index));
  if (!periods.length) {
    showToast("请至少保留 1 个可排课节次");
    return;
  }
  state.schedulingConfig.periods = periods.map((period, rowIndex) => ({
    ...period,
    period: rowIndex + 1,
    label: `第 ${rowIndex + 1} 节`,
  }));
  renderAdminScheduling();
}

async function saveSchedulePeriods() {
  let periods;
  try {
    periods = readSchedulePeriodsFromForm();
  } catch (error) {
    showToast(error.message || "作息时间无效");
    return;
  }

  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const result = await apiRequest("/api/scheduling/periods", {
        method: "POST",
        body: {
          termId: currentSchedulingTermId(),
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          periods,
        },
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
      showToast("作息时间已保存，请重新生成受影响年级的课表");
    } catch (error) {
      schedulingBackendState = {
        loaded: true,
        loading: false,
        error: error.message || "作息时间保存失败",
      };
      showToast(schedulingBackendState.error);
    }
    render();
    return;
  }

  state.schedulingConfig.periods = periods;
  resetCourseDraftAfterConfigChange();
  showToast("作息时间已保存到试运行数据");
  render();
}

function classStructureFromConfig(config = state.schedulingConfig) {
  const classRows = config.classes || [];
  const inferredRegularCount = classRows.filter((schoolClass) => schoolClass.classType !== "experimental").length;
  const inferredExperimentalCount = classRows.filter((schoolClass) => schoolClass.classType === "experimental").length;
  return {
    regularCount: Number(config.classStructure?.regularCount ?? inferredRegularCount),
    experimentalCount: Number(config.classStructure?.experimentalCount ?? inferredExperimentalCount),
    totalCount: Number(config.classStructure?.totalCount ?? classRows.length),
  };
}

function classStructurePreviewHtml(config, regularCount, experimentalCount) {
  const tags = [];
  for (let index = 1; index <= regularCount; index += 1) {
    tags.push(`<span class="class-structure-tag">${escapeHtml(`${config.gradeName} ${index} 班`)}</span>`);
  }
  for (let index = 1; index <= experimentalCount; index += 1) {
    tags.push(`<span class="class-structure-tag experimental">${escapeHtml(`${config.gradeName}实验${index}班`)}</span>`);
  }
  return tags.length ? tags.join("") : `<span>至少保留 1 个普通班或实验班</span>`;
}

function classRoomCatalogFromConfig(config = state.schedulingConfig) {
  const counters = { regular: 0, experimental: 0 };
  return (config.classes || [])
    .slice()
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
    .map((schoolClass) => {
      const classType = schoolClass.classType === "experimental" ? "experimental" : "regular";
      counters[classType] += 1;
      return {
        classType,
        index: counters[classType],
        className: schoolClass.name || "",
        roomName: schoolClass.room || "",
      };
    });
}

function defaultClassRoomName(config, classType, index) {
  return classType === "experimental"
    ? `${config.divisionName}${config.gradeName}实验${index}班教室`
    : `${config.divisionName}${config.gradeName}-${String(index).padStart(2, "0")}`;
}

function classRoomCatalogRows(
  config = state.schedulingConfig,
  regularCount = classStructureFromConfig(config).regularCount,
  experimentalCount = classStructureFromConfig(config).experimentalCount,
  sourceCatalog = classRoomCatalogFromConfig(config),
) {
  const byKey = new Map(sourceCatalog.map((room) => [`${room.classType}:${room.index}`, room]));
  const rows = [];
  for (let index = 1; index <= regularCount; index += 1) {
    const existing = byKey.get(`regular:${index}`) || {};
    rows.push({
      classType: "regular",
      index,
      className: `${config.gradeName} ${index} 班`,
      roomName: existing.roomName || defaultClassRoomName(config, "regular", index),
    });
  }
  for (let index = 1; index <= experimentalCount; index += 1) {
    const existing = byKey.get(`experimental:${index}`) || {};
    rows.push({
      classType: "experimental",
      index,
      className: `${config.gradeName}实验${index}班`,
      roomName: existing.roomName || defaultClassRoomName(config, "experimental", index),
    });
  }
  return rows;
}

function classRoomCatalogHtml(
  config = state.schedulingConfig,
  regularCount = classStructureFromConfig(config).regularCount,
  experimentalCount = classStructureFromConfig(config).experimentalCount,
  sourceCatalog = classRoomCatalogFromConfig(config),
) {
  const rows = classRoomCatalogRows(config, regularCount, experimentalCount, sourceCatalog);
  if (!rows.length) return `<div class="empty-state">当前年级至少需要 1 个班级教室。</div>`;
  return rows
    .map(
      (room) => `
        <label class="room-catalog-row">
          <span>${escapeHtml(room.className)}</span>
          <input
            data-class-room-name
            data-class-type="${escapeHtml(room.classType)}"
            data-class-index="${room.index}"
            type="text"
            value="${escapeHtml(room.roomName)}"
            placeholder="例如 A301"
          />
        </label>
      `,
    )
    .join("");
}

function roomResourceSummary(config = state.schedulingConfig) {
  const rooms = config.rooms || [];
  const resources = roomResourceTypes(config);
  const counts = Object.fromEntries(resources.map((resource) => [resource.type, 0]));
  let homeroomCount = 0;
  rooms.forEach((room) => {
    const roomType = normalizeScheduleRoomType(room.roomType || room.type);
    if (roomType === "homeroom") {
      homeroomCount += 1;
      return;
    }
    if (Object.hasOwn(counts, roomType)) counts[roomType] += 1;
  });
  const specialCount = Object.values(counts).reduce((sum, count) => sum + Number(count || 0), 0);
  return {
    counts,
    homeroomCount,
    specialCount,
    totalCount: homeroomCount + specialCount,
  };
}

function roomResourcePreviewHtml(config = state.schedulingConfig, counts = roomResourceSummary(config).counts) {
  const summary = roomResourceSummary(config);
  const resources = roomResourceTypes(config);
  const tags = [
    `<span class="class-structure-tag">普通教室 ${summary.homeroomCount} 间</span>`,
    ...resources.map((resource) => {
      const count = Number(counts[resource.type] || 0);
      return `<span class="class-structure-tag">${escapeHtml(resource.label)} ${count} ${escapeHtml(resource.unit)}</span>`;
    }),
  ];
  return tags.join("");
}

function defaultRoomCatalogName(config, resource, index, count) {
  return `${config.divisionName}${resource.label}${count > 1 ? String(index).padStart(2, "0") : ""}`;
}

function roomResourceCatalogFromConfig(config = state.schedulingConfig) {
  const order = new Map(roomResourceTypes(config).map((resource, index) => [resource.type, index]));
  return (config.rooms || [])
    .filter((room) => normalizeScheduleRoomType(room.roomType || room.type) !== "homeroom")
    .sort((a, b) => {
      const typeOrder =
        (order.get(normalizeScheduleRoomType(a.roomType || a.type)) ?? 99) -
        (order.get(normalizeScheduleRoomType(b.roomType || b.type)) ?? 99);
      if (typeOrder) return typeOrder;
      return String(a.id || a.name || "").localeCompare(String(b.id || b.name || ""));
    })
    .map((room) => ({
      id: room.id || "",
      name: room.name || "",
      roomType: normalizeScheduleRoomType(room.roomType || room.type),
      roomTypeName: room.roomTypeName || scheduleRoomTypeText(room.roomType || room.type, config),
      unit: room.unit || "",
    }));
}

function roomResourceCatalogRows(
  config = state.schedulingConfig,
  counts = roomResourceSummary(config).counts,
  sourceCatalog = roomResourceCatalogFromConfig(config),
) {
  const existingByType = new Map();
  sourceCatalog.forEach((room) => {
    if (!existingByType.has(room.roomType)) existingByType.set(room.roomType, []);
    existingByType.get(room.roomType).push(room);
  });
  return roomResourceTypes(config).flatMap((resource) => {
    const count = Math.max(Number(counts[resource.type] || 0), 0);
    return Array.from({ length: count }, (_, index) => {
      const existing = (existingByType.get(resource.type) || [])[index] || {};
      return {
        id: existing.id || "",
        name: existing.name || defaultRoomCatalogName(config, resource, index + 1, count),
        roomType: resource.type,
        roomTypeName: resource.label,
        index: index + 1,
      };
    });
  });
}

function roomResourceCatalogHtml(
  config = state.schedulingConfig,
  counts = roomResourceSummary(config).counts,
  sourceCatalog = roomResourceCatalogFromConfig(config),
) {
  const rows = roomResourceCatalogRows(config, counts, sourceCatalog);
  if (!rows.length) {
    return `<div class="empty-state">当前没有专用教室。需要实验室、机房、操场等资源时，先在上方填写数量。</div>`;
  }
  return rows
    .map(
      (room) => `
        <label class="room-catalog-row">
          <span>${escapeHtml(room.roomTypeName)} ${room.index}</span>
          <input
            data-room-catalog-name
            data-room-id="${escapeHtml(room.id)}"
            data-room-type="${escapeHtml(room.roomType)}"
            type="text"
            value="${escapeHtml(room.name)}"
            placeholder="例如 物理实验室A"
          />
        </label>
      `,
    )
    .join("");
}

function roomResourceTypeControlsHtml(config = state.schedulingConfig, counts = roomResourceSummary(config).counts) {
  const resources = roomResourceTypes(config);
  if (!resources.length) {
    return `<div class="empty-state">当前没有专用教室类型。需要资源教室时，先添加类型。</div>`;
  }
  return resources
    .map(
      (resource) => `
        <label class="room-resource-type-row" data-room-resource-type-row data-room-resource-type="${escapeHtml(resource.type)}">
          <span>${escapeHtml(resource.label)}</span>
          <div class="input-with-unit">
            <input
              data-room-resource-count
              data-room-type="${escapeHtml(resource.type)}"
              data-room-type-name="${escapeHtml(resource.label)}"
              data-room-unit="${escapeHtml(resource.unit)}"
              type="number"
              min="0"
              max="${Number(resource.max || 30)}"
              step="1"
              value="${Number(counts[resource.type] || 0)}"
            />
            <em>${escapeHtml(resource.unit)}</em>
          </div>
          <button class="ghost-button icon-danger" data-delete-room-resource-type="${escapeHtml(resource.type)}" type="button">删除</button>
        </label>
      `,
    )
    .join("");
}

function updateRoomResourcePreview() {
  const counts = collectRoomResourceCountsFromForm({ validate: false });
  const currentCatalog = collectRoomCatalogFromForm();
  const preview = document.querySelector("#roomResourcePreview");
  if (preview) preview.innerHTML = roomResourcePreviewHtml(state.schedulingConfig, counts);
  const catalog = document.querySelector("#roomResourceCatalog");
  if (catalog) catalog.innerHTML = roomResourceCatalogHtml(state.schedulingConfig, counts, currentCatalog);
}

function updateClassStructurePreview() {
  const config = state.schedulingConfig;
  const regularCount = Number.parseInt(document.querySelector("#regularClassCountInput")?.value || "0", 10);
  const experimentalCount = Number.parseInt(document.querySelector("#experimentalClassCountInput")?.value || "0", 10);
  const safeRegularCount = Number.isFinite(regularCount) ? Math.max(regularCount, 0) : 0;
  const safeExperimentalCount = Number.isFinite(experimentalCount) ? Math.max(experimentalCount, 0) : 0;
  const preview = document.querySelector("#classStructurePreview");
  if (preview) {
    preview.innerHTML = classStructurePreviewHtml(config, safeRegularCount, safeExperimentalCount);
  }
  const catalog = document.querySelector("#classRoomCatalog");
  if (catalog) {
    catalog.innerHTML = classRoomCatalogHtml(config, safeRegularCount, safeExperimentalCount, collectClassRoomCatalogFromForm());
  }
}

function buildLocalSpecialRooms(config, roomCounts, roomCatalog = roomResourceCatalogFromConfig(config)) {
  const catalogByType = new Map();
  roomCatalog.forEach((room) => {
    const roomType = normalizeScheduleRoomType(room.roomType || room.type);
    if (roomType === "homeroom") return;
    if (!catalogByType.has(roomType)) catalogByType.set(roomType, []);
    catalogByType.get(roomType).push(room);
  });
  return roomResourceTypes(config).flatMap((resource) => {
    const count = Math.max(Number(roomCounts[resource.type] || 0), 0);
    return Array.from({ length: count }, (_, index) => {
      const catalogRoom = (catalogByType.get(resource.type) || [])[index] || {};
      const roomId = `${config.gradeId}-${resource.type}-${String(index + 1).padStart(2, "0")}`;
      return {
        id: roomId,
        name: String(catalogRoom.name || "").trim() || defaultRoomCatalogName(config, resource, index + 1, count),
        roomType: resource.type,
        roomTypeName: resource.label,
        unit: resource.unit,
        sourceClassId: "",
      };
    });
  });
}

function applyLocalClassStructure(regularCount, experimentalCount, classRoomCatalog = collectClassRoomCatalogFromForm()) {
  const config = state.schedulingConfig;
  const currentRoomCounts = roomResourceSummary(config).counts;
  const classes = [];
  const rooms = [];
  const roomCatalogByKey = new Map(classRoomCatalog.map((room) => [`${room.classType}:${room.index}`, room]));
  const pushClass = (classType, index, displayOrder) => {
    const suffix = classType === "experimental" ? `E${String(index).padStart(2, "0")}` : String(index).padStart(2, "0");
    const classId = `${config.gradeId}-${suffix}`;
    const roomId = `${config.gradeId}-room-${suffix}`;
    const name = classType === "experimental" ? `${config.gradeName}实验${index}班` : `${config.gradeName} ${index} 班`;
    const room =
      roomCatalogByKey.get(`${classType}:${index}`)?.roomName ||
      (classType === "experimental" ? `${config.gradeName}实验${index}班教室` : `${config.gradeName}-${suffix}`);
    classes.push({
      id: classId,
      name,
      classType,
      displayOrder,
      room,
      roomId,
    });
    rooms.push({
      id: roomId,
      name: room,
      roomType: "homeroom",
      roomTypeName: SCHEDULE_ROOM_TYPES.homeroom,
      sourceClassId: classId,
    });
  };
  for (let index = 1; index <= regularCount; index += 1) pushClass("regular", index, index);
  for (let index = 1; index <= experimentalCount; index += 1) {
    pushClass("experimental", index, regularCount + index);
  }
  rooms.push(...buildLocalSpecialRooms(config, currentRoomCounts));
  config.classes = classes;
  config.rooms = rooms;
  config.classCount = classes.length;
  config.classStructure = {
    regularCount,
    experimentalCount,
    totalCount: classes.length,
  };
  config.subjects = (config.subjects || []).map((subject) => ({
    ...subject,
    teacherIds: [],
    classTeacherIds: {},
  }));
  state.selectedSchedulingClassId = classes[0]?.id || "";
  resetCourseDraftAfterConfigChange();
}

async function saveAdminClassStructure() {
  const regularCount = Number.parseInt(document.querySelector("#regularClassCountInput").value || "0", 10);
  const experimentalCount = Number.parseInt(document.querySelector("#experimentalClassCountInput").value || "0", 10);
  if (!Number.isFinite(regularCount) || regularCount < 0 || regularCount > 30) {
    showToast("普通班数量需在 0-30 之间");
    return;
  }
  if (!Number.isFinite(experimentalCount) || experimentalCount < 0 || experimentalCount > 10) {
    showToast("实验班数量需在 0-10 之间");
    return;
  }
  if (regularCount + experimentalCount < 1) {
    showToast("当前年级至少保留 1 个班");
    return;
  }

  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const result = await apiRequest("/api/scheduling/class-structure", {
        method: "POST",
        body: {
          termId: currentSchedulingTermId(),
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          regularCount,
          experimentalCount,
          classRoomCatalog: collectClassRoomCatalogFromForm(),
        },
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
      showToast("班级结构已保存，请重新配置老师并生成排课");
    } catch (error) {
      schedulingBackendState = {
        loaded: true,
        loading: false,
        error: error.message || "班级结构保存失败",
      };
      showToast(schedulingBackendState.error);
    }
    render();
    return;
  }

  applyLocalClassStructure(regularCount, experimentalCount);
  showToast("班级结构已保存到试运行数据");
  render();
}

function collectClassRoomCatalogFromForm() {
  return Array.from(document.querySelectorAll("[data-class-room-name]")).map((input) => ({
    classType: input.dataset.classType === "experimental" ? "experimental" : "regular",
    index: Number.parseInt(input.dataset.classIndex || "0", 10),
    roomName: input.value.trim(),
  }));
}

function collectRoomResourceCountsFromForm(options = {}) {
  const validate = options.validate !== false;
  const counts = {};
  roomResourceTypes().forEach((resource) => {
    const input = document.querySelector(`[data-room-resource-count][data-room-type="${resource.type}"]`);
    const value = Number.parseInt(input?.value || "0", 10);
    if (validate && (!Number.isFinite(value) || value < 0 || value > resource.max)) {
      throw new Error(`${resource.label}数量需在 0-${resource.max} 之间`);
    }
    counts[resource.type] = Number.isFinite(value) ? Math.min(Math.max(value, 0), resource.max) : 0;
  });
  return counts;
}

function collectRoomCatalogFromForm() {
  return Array.from(document.querySelectorAll("[data-room-catalog-name]"))
    .map((input) => ({
      id: input.dataset.roomId || "",
      roomType: normalizeScheduleRoomType(input.dataset.roomType || ""),
      name: input.value.trim(),
      roomTypeName: scheduleRoomTypeText(input.dataset.roomType || ""),
    }))
    .filter((room) => room.roomType !== "homeroom");
}

function collectRoomResourceTypesFromForm() {
  return Array.from(document.querySelectorAll("[data-room-resource-type-row]")).map((row) => ({
    type: normalizeScheduleRoomType(row.dataset.roomResourceType || ""),
    name: row.querySelector("[data-room-resource-count]")?.dataset.roomTypeName || scheduleRoomTypeText(row.dataset.roomResourceType || ""),
    unit: row.querySelector("[data-room-resource-count]")?.dataset.roomUnit || "间",
    max: Number(row.querySelector("[data-room-resource-count]")?.max || 30),
  }));
}

function applyLocalRoomResources(roomCounts, roomCatalog = collectRoomCatalogFromForm()) {
  const config = state.schedulingConfig;
  const homeroomRooms = (config.rooms || []).filter((room) => normalizeScheduleRoomType(room.roomType || room.type) === "homeroom");
  config.roomResourceTypes = collectRoomResourceTypesFromForm();
  config.rooms = [...homeroomRooms, ...buildLocalSpecialRooms(config, roomCounts, roomCatalog)];
  resetCourseDraftAfterConfigChange();
}

function createRoomResourceTypeId(name) {
  const ascii = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  let id = ascii || `custom-${Date.now().toString(36)}`;
  const existing = new Set(roomResourceTypes().map((resource) => resource.type));
  let index = 1;
  while (existing.has(id) || id === "homeroom") {
    id = `${ascii || `custom-${Date.now().toString(36)}`}-${index}`;
    index += 1;
  }
  return id;
}

function addRoomResourceType() {
  const input = document.querySelector("#newRoomResourceTypeName");
  const name = input?.value.trim() || "";
  if (!name) {
    showToast("请输入要新增的教室资源类型");
    return;
  }
  const exists = roomResourceTypes().some((resource) => resource.label === name);
  if (exists) {
    showToast("该教室资源类型已存在");
    return;
  }
  const nextType = {
    type: createRoomResourceTypeId(name),
    label: name,
    name,
    unit: "间",
    max: 30,
    defaultCount: 0,
    custom: true,
  };
  state.schedulingConfig.roomResourceTypes = [...roomResourceTypes(), nextType];
  if (input) input.value = "";
  renderAdminScheduling();
}

function deleteRoomResourceType(type) {
  const normalized = normalizeScheduleRoomType(type);
  if (!normalized || normalized === "homeroom") return;
  const usedByCourse = (state.schedulingConfig.courseRules || []).some(
    (rule) => rule.enabled && normalizeScheduleRoomType(rule.requiredRoomType || "homeroom") === normalized,
  );
  if (usedByCourse) {
    showToast("已有课程要求这个教室类型，请先在课程规则里调整所需教室");
    return;
  }
  state.schedulingConfig.roomResourceTypes = roomResourceTypes().filter((resource) => resource.type !== normalized);
  state.schedulingConfig.rooms = (state.schedulingConfig.rooms || []).filter(
    (room) => normalizeScheduleRoomType(room.roomType || room.type) !== normalized,
  );
  renderAdminScheduling();
}

async function saveAdminRoomResources() {
  let roomCounts;
  try {
    roomCounts = collectRoomResourceCountsFromForm();
  } catch (error) {
    showToast(error.message || "教室资源数量无效");
    return;
  }

  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const roomCatalog = collectRoomCatalogFromForm();
      const result = await apiRequest("/api/scheduling/rooms", {
        method: "POST",
        body: {
          termId: currentSchedulingTermId(),
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          roomCounts,
          roomResourceTypes: collectRoomResourceTypesFromForm(),
          roomCatalog,
        },
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
      showToast("教室资源已保存，请重新生成受影响年级的课表");
    } catch (error) {
      schedulingBackendState = {
        loaded: true,
        loading: false,
        error: error.message || "教室资源保存失败",
      };
      showToast(schedulingBackendState.error);
    }
    render();
    return;
  }

  applyLocalRoomResources(roomCounts);
  showToast("教室资源已保存到试运行数据");
  render();
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
          termId: currentSchedulingTermId(),
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          rules,
        },
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
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
  showToast("课程规则已保存到试运行数据");
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

function applyLocalGradeCourse(subjectName, weeklyLessons, durationMinutes, requiredRoomType = "homeroom") {
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
      minPerClassPerDay: 0,
      maxPerClassPerDay: 0,
      minWeeklyDays: 0,
      maxConsecutivePerClass: 0,
      allowConsecutive: true,
      forbiddenPeriods: [],
      preferredDayPart: "any",
      requiredRoomType,
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
    minPerClassPerDay: existingRule?.minPerClassPerDay || subject.minPerClassPerDay || 0,
    maxPerClassPerDay: existingRule?.maxPerClassPerDay || subject.maxPerClassPerDay || 0,
    minWeeklyDays:
      Number(existingRule?.minPerClassPerDay || subject.minPerClassPerDay || 0) > 0
        ? 0
        : existingRule?.minWeeklyDays || subject.minWeeklyDays || 0,
    maxConsecutivePerClass: existingRule?.maxConsecutivePerClass || subject.maxConsecutivePerClass || 0,
    allowConsecutive: existingRule?.allowConsecutive ?? subject.allowConsecutive ?? true,
    forbiddenPeriods: existingRule?.forbiddenPeriods || subject.forbiddenPeriods || [],
    preferredDayPart: existingRule?.preferredDayPart || subject.preferredDayPart || "any",
    requiredRoomType: normalizeScheduleRoomType(
      existingRule?.requiredRoomType || requiredRoomType || subject.requiredRoomType || SUBJECT_DEFAULT_ROOM_TYPES[subject.id] || "homeroom",
    ),
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
  const requiredRoomType = normalizeScheduleRoomType(document.querySelector("#newCourseRoomType")?.value || "homeroom");
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
          termId: currentSchedulingTermId(),
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          subjectName,
          weeklyLessons,
          durationMinutes,
          requiredRoomType,
        },
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
      document.querySelector("#newCourseName").value = "";
      document.querySelector("#newCourseWeekly").value = "2";
      document.querySelector("#newCourseDuration").value = "40";
      document.querySelector("#newCourseRoomType").value = "homeroom";
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

  applyLocalGradeCourse(subjectName, weeklyLessons, durationMinutes, requiredRoomType);
  document.querySelector("#newCourseName").value = "";
  document.querySelector("#newCourseWeekly").value = "2";
  document.querySelector("#newCourseDuration").value = "40";
  document.querySelector("#newCourseRoomType").value = "homeroom";
  showToast("课程已添加到试运行数据");
  render();
}

async function deleteAdminGradeCourse(subjectId) {
  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const params = new URLSearchParams({
        termId: currentSchedulingTermId(),
        stageId: state.schedulingConfig.stageId,
        grade: String(state.schedulingConfig.grade),
      });
      const result = await apiRequest(`/api/scheduling/courses/${encodeURIComponent(subjectId)}?${params.toString()}`, {
        method: "DELETE",
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
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
          termId: currentSchedulingTermId(),
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          subjectId,
          dayIndexes,
          periods,
          reason,
        },
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
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
  showToast("硬约束已添加到试运行数据");
  render();
}

async function deleteAdminScheduleConstraint(constraintId) {
  if (backendMode() && currentRole() === "admin") {
    schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
    renderAdminScheduling();
    try {
      const params = new URLSearchParams({ termId: currentSchedulingTermId() });
      const result = await apiRequest(`/api/scheduling/constraints/${encodeURIComponent(constraintId)}?${params.toString()}`, {
        method: "DELETE",
      });
      applyBackendScheduleResult(result);
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
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

function localRoomsForSubject(subject, schoolClass) {
  const requiredRoomType = normalizeScheduleRoomType(subject?.requiredRoomType || "homeroom");
  if (requiredRoomType === "homeroom") {
    const room = roomById(schoolClass?.roomId);
    return room ? [room] : [];
  }
  return (state.schedulingConfig.rooms || []).filter(
    (room) => normalizeScheduleRoomType(room.roomType || "homeroom") === requiredRoomType,
  );
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
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
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
  const roomRuleViolation = localRoomRuleViolation(assignment.subjectId, room);
  if (roomRuleViolation) {
    showToast(roomRuleViolation.text || roomRuleViolation.title);
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
  assignment.roomType = room.roomType || "homeroom";
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
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
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
  const replanScope = updateScheduleReplanScopeFromControls();
  schedulingBackendState = { ...schedulingBackendState, loading: true, error: "" };
  renderAdminScheduling();

  try {
    const result = await apiRequest("/api/scheduling/regenerate-unlocked", {
      method: "POST",
      body: {
        ...backendSchedulingOptions(),
        replanScope,
      },
    });
    applyBackendScheduleResult(result);
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
    const preservedCount = result.draft?.preservedCount ?? result.draft?.lockedCount ?? 0;
    const conflicts = result.draft?.conflicts?.length || 0;
    const scopeText = scheduleReplanScopeText(result.draft?.replanScope || replanScope);
    showToast(
      conflicts
        ? `${scopeText}已重排，保留 ${preservedCount} 节，发现 ${conflicts} 个冲突`
        : `${scopeText}已重排，保留 ${preservedCount} 节`,
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
  const replanScope = updateScheduleReplanScopeFromControls();
  const scopeTargetCount = draft.assignments.filter(
    (assignment) => !assignment.locked && scheduleAssignmentMatchesReplanScope(assignment, replanScope),
  ).length;
  if (!scopeTargetCount) {
    showToast(`${scheduleReplanScopeText(replanScope)}没有可重排的未锁定课程`);
    return;
  }
  const lockedAssignments = temporaryLockedAssignmentsForReplan(draft.assignments, replanScope);
  const assignments = restoreTemporaryReplanLocks(
    generateScheduleAssignments({ lockedAssignments }),
    draft.assignments,
  );
  const conflicts = validateScheduleConflicts(assignments);
  state.schedulingDraft = {
    ...draft,
    status: "draft",
    assignments,
    conflicts,
    generatedLessonCount: assignments.length,
    unassignedCount: Math.max(requiredScheduleLessonCount() - assignments.length, 0),
    lockedCount: draft.assignments.filter((assignment) => assignment.locked).length,
    preservedCount: lockedAssignments.length,
    replanScope,
    replannedScopeCount: scopeTargetCount,
    updatedAt: formatDateTimeMinute(),
    replannedAt: formatDateTimeMinute(),
  };
  showToast(
    conflicts.length
      ? `${scheduleReplanScopeText(replanScope)}已重排，保留 ${lockedAssignments.length} 节，发现 ${conflicts.length} 个冲突`
      : `${scheduleReplanScopeText(replanScope)}已重排，保留 ${lockedAssignments.length} 节`,
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
    showToast("请使用后端教研所账号保存老师时间规则");
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
        termId: currentSchedulingTermId(),
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
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
    showToast("老师时间规则已保存，重新生成排课时生效");
  } catch (error) {
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: error.message || "老师规则保存失败" };
    showToast(schedulingBackendState.error);
  }
  render();
}

async function submitScheduleChangeRequest() {
  if (!backendMode() || currentRole() !== "admin") {
    showToast("请使用后端教研所账号发起调课申请");
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
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
    showToast("调课/代课申请已提交，等待审批");
  } catch (error) {
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: error.message || "调课申请提交失败" };
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
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
    showToast("调课/代课已审批通过，并同步到老师端");
    await loadBackendSchedulingContext();
    await loadBackendNotifications();
  } catch (error) {
    schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: error.message || "调课审批失败" };
    showToast(schedulingBackendState.error);
  }
  render();
}

async function moveScheduleAssignmentToSlot(assignmentId, date, period) {
  const assignment = (state.schedulingDraft.assignments || []).find((item) => item.id === assignmentId);
  if (!assignment) return;
  const preview = previewScheduleDrop(assignmentId, date, period);
  if (!preview.ok) {
    const suggestions = scheduleDropSuggestions(assignmentId, 3);
    state.selectedScheduleAssignmentId = assignmentId;
    showToast(
      suggestions.length
        ? `${preview.message}；可试 ${scheduleWeekdayLabel(suggestions[0].date)}第 ${suggestions[0].period} 节`
        : preview.message,
    );
    renderAdminScheduling();
    return;
  }
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
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
      showToast("拖拽调整已保存并重新校验");
    } catch (error) {
      schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: error.message || "拖拽调整失败" };
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

function previewScheduleDrop(assignmentId, date, periodValue) {
  const assignment = (state.schedulingDraft.assignments || []).find((item) => item.id === assignmentId);
  if (!assignment) {
    return { ok: false, message: "未找到要移动的课节" };
  }
  if (state.schedulingDraft.status === "published") {
    return { ok: false, message: "已发布课表请走调课/代课审批" };
  }
  if (assignment.locked) {
    return { ok: false, message: "该课节已锁定，先解锁再拖拽调整" };
  }

  const periodNumber = Number.parseInt(periodValue, 10);
  const period = state.schedulingConfig.periods.find((item) => Number(item.period) === periodNumber);
  const dayIndex = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5).indexOf(date);
  const room = roomById(assignment.roomId);
  if (!period || dayIndex < 0) {
    return { ok: false, message: "目标日期或节次无效" };
  }
  if (!room) {
    return { ok: false, message: "当前课节教室无效，请先在调整面板选择教室" };
  }

  const slot = { date, dayIndex, period: period.period, time: period.time };
  const constraintViolation = localScheduleConstraintViolation(assignment.subjectId, slot);
  if (constraintViolation) {
    return {
      ok: false,
      message: `${constraintViolation.subjectName || assignment.subjectName} 不能出现在 ${scheduleConstraintDayText(constraintViolation.dayIndexes)} ${scheduleConstraintPeriodText(constraintViolation.periods)}`,
    };
  }
  const subjectRuleViolation = localSubjectRuleViolation(
    assignment.subjectId,
    slot,
    (state.schedulingDraft.assignments || []).filter((item) => item.id !== assignment.id),
    assignment.classId,
  );
  if (subjectRuleViolation) {
    return { ok: false, message: subjectRuleViolation.text || subjectRuleViolation.title };
  }
  const roomRuleViolation = localRoomRuleViolation(assignment.subjectId, room);
  if (roomRuleViolation) {
    return { ok: false, message: roomRuleViolation.text || roomRuleViolation.title };
  }

  const proposedAssignments = (state.schedulingDraft.assignments || []).map((item) =>
    item.id === assignment.id
      ? {
          ...item,
          date,
          dayIndex,
          period: period.period,
          time: period.time,
          roomType: room.roomType || item.roomType || "homeroom",
        }
      : item,
  );
  const conflicts = validateScheduleConflicts(proposedAssignments).filter((conflict) =>
    String(conflict.text || conflict.title || "").includes(assignment.className) ||
    String(conflict.text || conflict.title || "").includes(assignment.teacherName) ||
    String(conflict.text || conflict.title || "").includes(assignment.room),
  );
  if (conflicts.length) {
    return {
      ok: false,
      message: conflicts[0].title || "目标时段存在冲突",
      conflicts,
    };
  }

  return {
    ok: true,
    message: `${assignment.subjectName} 可移动到 ${scheduleWeekdayLabel(date)} 第 ${period.period} 节`,
  };
}

function scheduleDropSuggestions(assignmentId, limit = 5) {
  const assignment = (state.schedulingDraft.assignments || []).find((item) => item.id === assignmentId);
  if (!assignment || assignment.locked || state.schedulingDraft.status === "published") return [];
  const weekDates = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5);
  return weekDates
    .flatMap((date) =>
      (state.schedulingConfig.periods || []).map((period) => ({
        date,
        period: Number(period.period),
        time: period.time,
      })),
    )
    .filter((slot) => !(slot.date === assignment.date && Number(slot.period) === Number(assignment.period)))
    .map((slot) => {
      const preview = previewScheduleDrop(assignmentId, slot.date, slot.period);
      const dayDistance = Math.abs(weekDates.indexOf(slot.date) - weekDates.indexOf(assignment.date));
      const periodDistance = Math.abs(Number(slot.period) - Number(assignment.period));
      return {
        ...slot,
        ...preview,
        score: dayDistance * 10 + periodDistance,
      };
    })
    .filter((item) => item.ok)
    .sort((a, b) => a.score - b.score || `${a.date} ${a.period}`.localeCompare(`${b.date} ${b.period}`))
    .slice(0, limit);
}

function scheduleAdjustmentSuggestionsHtml(selectedAssignment, draft) {
  if (!selectedAssignment || !draft.assignments?.length) {
    return `<div class="empty-state compact-empty">选择一节课后显示推荐可用位置</div>`;
  }
  if (draft.status === "published") {
    return `<div class="empty-state compact-empty">已发布课表请通过调课/代课审批调整</div>`;
  }
  if (selectedAssignment.locked) {
    return `<div class="empty-state compact-empty">该课节已锁定，解锁后可查看推荐位置</div>`;
  }
  const suggestions = scheduleDropSuggestions(selectedAssignment.id);
  if (!suggestions.length) {
    return `<div class="empty-state compact-empty">暂未找到同老师、同教室可直接移动的位置；可尝试换老师、换教室或重排未锁定课程。</div>`;
  }
  return `
    <div class="schedule-suggestions-head">
      <strong>推荐可用位置</strong>
      <span>按同一天、相近节次优先排序</span>
    </div>
    <div class="schedule-suggestion-list">
      ${suggestions
        .map(
          (item) => `
            <button
              class="schedule-suggestion-item"
              data-apply-schedule-suggestion="${escapeHtml(selectedAssignment.id)}"
              data-suggestion-date="${escapeHtml(item.date)}"
              data-suggestion-period="${item.period}"
              type="button"
            >
              <strong>${escapeHtml(scheduleWeekdayLabel(item.date))} · 第 ${item.period} 节</strong>
              <span>${escapeHtml(item.time)} · ${escapeHtml(selectedAssignment.room)}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function scheduleVersionDiffText(diff = {}) {
  const parts = [];
  if (Number(diff.added || 0)) parts.push(`新增 ${diff.added}`);
  if (Number(diff.removed || 0)) parts.push(`删除 ${diff.removed}`);
  if (Number(diff.changed || 0)) parts.push(`变更 ${diff.changed}`);
  return parts.length ? parts.join(" · ") : "与上一版本无结构差异";
}

function scheduleVersionListHtml(versions = []) {
  if (!versions.length) {
    return `<div class="empty-state compact-empty">暂无正式发布版本。发布课表后会在这里形成可追溯快照。</div>`;
  }
  return versions
    .map(
      (version) => `
        <article class="schedule-version-item ${version.current ? "current" : ""}">
          <header>
            <div>
              <strong>V${version.versionNumber} · ${escapeHtml(version.weekStart || "")}</strong>
              <span>${escapeHtml(version.publishedAt || "")} · ${escapeHtml(version.publishedByName || "系统")}</span>
            </div>
            <span class="tag ${version.current ? "completed" : "locked"}">${version.current ? "当前正式版" : "历史版本"}</span>
          </header>
          <p>${escapeHtml(scheduleVersionDiffText(version.diff))} · ${Number(version.lessonCount || 0)} 节课</p>
          <div class="schedule-version-actions">
            ${
              version.current
                ? `<span class="muted">老师端、签到和薪资当前读取此版本</span>`
                : `<button class="mini-button" data-rollback-schedule-version="${escapeHtml(version.id)}" type="button">回滚到此版本</button>`
            }
          </div>
        </article>
      `,
    )
    .join("");
}

function clearScheduleDropPreview() {
  document.querySelectorAll(".schedule-slot-drop.is-drop-ok, .schedule-slot-drop.is-drop-blocked").forEach((zone) => {
    zone.classList.remove("is-drop-ok", "is-drop-blocked");
    zone.removeAttribute("title");
    const hint = zone.querySelector("[data-schedule-drop-hint]");
    if (hint) hint.textContent = "";
  });
}

function updateScheduleDropPreview(zone) {
  if (!zone || !draggedScheduleAssignmentId) return null;
  clearScheduleDropPreview();
  const preview = previewScheduleDrop(
    draggedScheduleAssignmentId,
    zone.dataset.scheduleDropDate,
    zone.dataset.scheduleDropPeriod,
  );
  zone.classList.add(preview.ok ? "is-drop-ok" : "is-drop-blocked");
  zone.setAttribute("title", preview.message);
  const hint = zone.querySelector("[data-schedule-drop-hint]");
  if (hint) hint.textContent = preview.ok ? "可放置" : "不可放置";
  return preview;
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
  if (!backendMode() || currentRole() !== "system_admin") {
    showToast("请通过后端服务登录行政管理账号后再导入");
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
  if (!backendMode() || currentRole() !== "system_admin") {
    showToast("请通过后端服务登录行政管理账号后再导入");
    return;
  }
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
  if (stage === 0) return "工资待确认";
  if (stage === 1) return "老师已确认";
  if (stage === 2) return "财务处理中";
  return "已锁定";
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
  if (status === "reviewed") return "财务已处理";
  if (status === "disputed") return "老师有异议";
  if (status === "teacher_confirmed") return "老师已确认";
  if (status === "generated") return "等待老师确认";
  if (status === "saved") return "已保存";
  return "试算";
}

function payrollStatusTag(status = "preview") {
  const className =
    status === "locked" ? "locked" : status === "reviewed" || status === "teacher_confirmed" || status === "saved" ? "completed" : status === "disputed" ? "exception" : "pending";
  return `<span class="tag ${className}">${payrollStatusLabel(status)}</span>`;
}

function renderStep(name, renderFn) {
  try {
    renderFn();
  } catch (error) {
    console.error(`渲染失败：${name}`, error);
  }
}

function render() {
  renderAuth();
  if (!sessionAccountId) return;

  if (!viewAllowed(state.activeView)) {
    state.activeView = defaultViewByRole[currentRole()];
  }

  renderShell();
  renderStep("通知栏", renderNotices);
  renderStep("通知中心", renderNotificationCenter);
  renderStep("老师工作台", renderDashboard);
  renderStep("课时任务", renderTasks);
  renderStep("我的课表", renderSchedule);
  renderStep("行政排课", renderAdminScheduling);
  renderStep("课表总览", renderAdminScheduleOverview);
  renderStep("人员列表", renderPersonnelList);
  renderStep("教师导入", renderTeacherImport);
  renderStep("人员档案", renderHrEmployees);
  renderStep("组织与岗位", renderHrOrg);
  renderStep("人事审批", renderHrFlows);
  renderStep("审批中心", renderApprovalsView);
  renderStep("审批流程设置", renderApprovalSettingsView);
  renderStep("人事审计", renderHrAudit);
  renderStep("我的档案", renderMyHrProfile);
  renderStep("签入签出", renderScanner);
  renderStep("考勤记录", renderRecords);
  renderStep("月度确认", renderConfirmation);
  renderStep("老师总薪资", renderTeacherPayroll);
  renderStep("财务首页", renderFinanceDashboard);
  renderStep("老师记录", renderFinanceRecords);
  renderStep("薪资结算", renderSettlement);
  renderStep("工资记录", renderPayrollHistory);
  renderStep("薪资配置", renderPayrollConfig);
  renderStep("异常提醒", renderWarnings);
  renderStep("教室二维码库", renderClassroomScreens);
  saveState();
}

function renderAuth() {
  const loggedIn = Boolean(sessionAccountId);
  document.querySelector("#loginScreen").classList.toggle("is-hidden", loggedIn);
  document.querySelector("#appShell").classList.toggle("is-hidden", !loggedIn);
  renderEnvironmentLabels();
  renderScheduledTeacherLoginShortcuts();
}

function renderScheduledTeacherLoginShortcuts() {
  const container = document.querySelector("#scheduledTeacherLoginList");
  if (!container) return;
  const rows = elementaryScheduledTeacherLoginOptions();
  container.innerHTML = rows
    .map(
      (row) => `
        <button class="scheduled-login-button" data-demo-login="${escapeHtml(row.username)}" type="button">
          <strong>${escapeHtml(row.teacherName)}</strong>
          <span>${escapeHtml(row.subjectName)} · ${escapeHtml(row.username)}</span>
          <small>${row.lessonCount ? `${row.lessonCount} 节课` : "小学部排课老师"}</small>
        </button>
      `,
    )
    .join("");
}

function renderShell() {
  const account = currentAccount();
  const role = account.role;
  const teacher = role === "teacher" ? teacherById(account.teacherId) : null;

  document.body.dataset.activeView = state.activeView;
  document.body.dataset.accountRole = role;
  renderEnvironmentLabels();
  document.querySelector("#viewTitle").textContent = views[state.activeView].title;
  document.querySelector("#accountRoleSide").textContent = account.title;
  document.querySelector("#teacherNameSide").textContent = account.name;
  document.querySelector("#teacherMetaSide").textContent =
    role === "teacher"
      ? `${teacher.department} · ${teacher.subject}`
      : role === "finance"
        ? `${account.department} · 薪资结算`
        : role === "system_admin"
          ? `${account.department} · 账号管理`
        : role === "classroom"
          ? `${account.department} · 动态二维码`
          : role === "hr"
            ? `${account.department} · 档案管理`
            : role === "division_head"
              ? `${account.department} · 人事审批`
              : `${account.department} · 排课管理`;
  document.querySelector("#accountSummaryTitle").textContent = account.title;
  document.querySelector("#accountSummaryMeta").textContent =
    role === "teacher"
      ? `${account.name} · ${teacher.department} · ${teacher.subject}`
      : role === "classroom"
        ? `${account.name} · 教室二维码库`
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
  title.textContent =
    role === "teacher"
      ? "老师通知栏"
      : role === "admin"
        ? "行政通知栏"
        : role === "system_admin"
          ? "系统通知栏"
          : "财务通知栏";
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
  const composer = document.querySelector("#notificationComposerForm");
  const composerStatus = document.querySelector("#notificationComposerStatus");
  const sendButton = document.querySelector("#sendNotificationButton");
  const clearButton = document.querySelector("#clearNotificationDraft");
  const canPublish = canPublishNotifications();
  const candidateId = state.selectedNoticeId || notices[0]?.id || "";
  const selectedId = notices.some((notice) => notice.id === candidateId) ? candidateId : notices[0]?.id || "";
  title.textContent =
    role === "teacher"
      ? "老师通知中心"
      : role === "admin"
        ? "行政通知中心"
        : role === "system_admin"
          ? "系统通知中心"
          : "财务通知中心";
  count.textContent = `${notices.length} 条`;
  if (composer && composerStatus && sendButton && clearButton) {
    composer.classList.toggle("is-hidden", !canPublish);
    const canSend = canPublish && backendMode() && !notificationComposerState.sending;
    composerStatus.textContent = !canPublish
      ? "只读"
      : notificationComposerState.sending
        ? "发送中"
        : notificationComposerState.error
          ? notificationComposerState.error
          : notificationComposerState.message || (backendMode() ? "可发送" : "需后端登录");
    composerStatus.className = notificationComposerState.error
      ? "status-pill warning"
      : notificationComposerState.message
        ? "status-pill done"
        : "status-pill";
    sendButton.disabled = !canSend;
    clearButton.disabled = notificationComposerState.sending;
    renderNotificationRecipientControls(canPublish);
  }
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
  const month = currentSettlementMonth();
  if (backendMode() && currentRole() === "teacher") {
    ensureBackendTeacherPayroll(teacherId, month);
  }
  const backendPayroll =
    backendMode() &&
    teacherPayrollState.teacherId === teacherId &&
    teacherPayrollState.month === month &&
    teacherPayrollState.loaded
      ? teacherPayrollState.data
      : null;
  const backendPayrollStatus = backendPayroll?.generated?.status || "";
  const salary = calculateSalary(teacherId);
  const lessons = teacherLessons(teacherId);
  const completedUnits = payableLessons(teacherId).reduce((sum, lesson) => sum + lesson.units, 0);
  const plannedUnits = lessons
    .filter((lesson) => lesson.status !== "exception")
    .reduce((sum, lesson) => sum + lesson.units, 0);
  const pendingLessons = lessons.filter((lesson) => ["scheduled", "pending", "checkedIn"].includes(lesson.status));
  const warnings = buildWarnings(teacherId);
  const nextLesson = pendingLessons[0];

  document.querySelector("#plannedLessons").textContent = plannedUnits;
  document.querySelector("#completedLessons").textContent = completedUnits;
  document.querySelector("#pendingLessons").textContent = pendingLessons.length;
  document.querySelector("#warningCount").textContent = warnings.length;
  document.querySelector("#netPreview").textContent = backendPayroll
    ? formatCurrency(backendPayroll.netPay || 0)
    : formatCurrency(salary.net);
  const dashboardPayrollStatus = document.querySelector("#dashboardPayrollStatus");
  if (dashboardPayrollStatus) {
    dashboardPayrollStatus.textContent = backendPayrollStatus
      ? payrollStatusLabel(backendPayrollStatus)
      : backendMode()
        ? "财务尚未生成"
        : settlementText(teacherId);
  }
  const confirmationStage = backendPayrollStatus ? payrollFlowStage(backendPayrollStatus) : state.confirmationStages[teacherId] || 0;
  document.querySelector("#confirmStatusText").textContent = backendPayrollStatus
    ? payrollStatusLabel(backendPayrollStatus)
    : confirmationText(teacherId);
  document.querySelector("#confirmProgressBar").style.width = `${25 + confirmationStage * 25}%`;

  const nextStatus = document.querySelector("#nextLessonStatus");
  const detail = document.querySelector("#nextLessonDetail");
  const scanButton = document.querySelector("#scanNextLesson");

  if (!lessons.length) {
    nextStatus.textContent = "未发布";
    nextStatus.className = "status-pill warning";
    detail.innerHTML = `
      <strong>暂无课程任务</strong>
      <p class="muted">教务或行政发布课表后，这里才会显示需要签入/签出的课程。</p>
    `;
    scanButton.disabled = true;
    scanButton.innerHTML = `<span aria-hidden="true">✓</span>签入`;
  } else if (!nextLesson) {
    nextStatus.textContent = "今日完成";
    nextStatus.className = "status-pill done";
    detail.innerHTML = `
      <strong>暂无待处理课时</strong>
      <p class="muted">当前已完成课时已同步到薪资试算，月末可进入确认流程。</p>
    `;
    scanButton.disabled = true;
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
    scanButton.dataset.id = nextLesson.id;
    scanButton.innerHTML = `<span aria-hidden="true">⌖</span>去${actionLabel(actionForLesson(nextLesson))}`;
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
    : `<tr><td colspan="8"><div class="empty-state">暂无课程任务，行政发布课表后自动同步到这里</div></td></tr>`;
}

function availableScheduleWeeks(lessons, teacherId = currentTeacherId()) {
  const backendWeeks = state.teacherScheduleWeeks?.[teacherId] || [];
  if (backendMode() && backendWeeks.length) {
    const weekMap = new Map();
    backendWeeks.forEach((week) => {
      if (!week?.weekStart) return;
      weekMap.set(week.weekStart, {
        weekStart: week.weekStart,
        lessonCount: Number(week.lessonCount) || 0,
      });
    });
    lessons.forEach((lesson) => {
      const weekStart = startOfNaturalWeek(lesson.date);
      if (!weekMap.has(weekStart)) {
        weekMap.set(weekStart, { weekStart, lessonCount: 0 });
      }
    });
    return Array.from(weekMap.values()).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  }
  const baseWeek = startOfNaturalWeek(TERM_START_WEEK);
  const baseDate = parseDateKey(baseWeek);
  const termWeeks = Array.from({ length: TERM_WEEK_COUNT }, (_, index) => formatDateKey(addDays(baseDate, index * 7)));
  const weeks = Array.from(
    new Set([
      ...termWeeks,
      ...lessons.map((lesson) => startOfNaturalWeek(lesson.date)),
    ]),
  ).sort();
  const currentWeek = startOfNaturalWeek(todayKey());
  if (!weeks.includes(currentWeek)) weeks.unshift(currentWeek);
  return weeks.map((weekStart) => ({
    weekStart,
    lessonCount: lessons.filter((lesson) => weekDateKeys(weekStart).includes(lesson.date)).length,
  }));
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
  const termTitle = document.querySelector("#scheduleTermTitle");
  const termRange = document.querySelector("#scheduleTermRange");
  const range = document.querySelector("#scheduleWeekRange");
  const syncStatus = document.querySelector("#scheduleSyncStatus");
  if (!summary || !grid || !select || !termTitle || !termRange || !range) return;

  const lessons = teacherLessons(currentTeacherId()).sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
  );
  if (syncStatus) {
    syncStatus.textContent = lessons.length ? "教务已分发" : "等待发布";
    syncStatus.className = lessons.length ? "status-pill done" : "status-pill warning";
  }
  const weekOptions = availableScheduleWeeks(lessons, currentTeacherId());
  const weeks = weekOptions.map((week) => week.weekStart);
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
      const count =
        weekOptions.find((option) => option.weekStart === week)?.lessonCount ??
        lessons.filter((lesson) => weekDateKeys(week).includes(lesson.date)).length;
      return `
        <option value="${week}" ${week === selectedWeek ? "selected" : ""}>
          ${formatWeekRange(week)} · ${count} 节
        </option>
      `;
    })
    .join("");
  const term = termManagementState.currentTerm || {};
  termTitle.textContent = term.name || "当前学期";
  termRange.textContent =
    term.startDate && term.endDate ? `${term.startDate} 至 ${term.endDate}` : "未设置学期日期";
  range.textContent = `${formatWeekRange(selectedWeek)} · 自然周排班`;

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

function termStatusText(status = "planned") {
  if (status === "active") return "进行中";
  if (status === "archived") return "已归档";
  return "计划中";
}

function termStatusClass(status = "planned") {
  if (status === "active") return "status-pill done";
  if (status === "archived") return "status-pill locked";
  return "status-pill warning";
}

function renderTermManagement() {
  const status = document.querySelector("#termManagementStatus");
  if (!status) return;
  const currentTerm = termManagementState.currentTerm || {
    id: state.schedulingConfig.termId,
    name: state.schedulingConfig.termName || "当前学期",
    startDate: state.schedulingConfig.termStartDate || "",
    endDate: state.schedulingConfig.termEndDate || "",
    status: state.schedulingConfig.termStatus || "active",
    current: true,
  };
  status.textContent = termManagementState.loading ? "处理中" : termStatusText(currentTerm.status);
  status.className = termStatusClass(currentTerm.status);
  document.querySelector("#currentTermName").textContent = currentTerm.name || "当前学期";
  document.querySelector("#currentTermRange").textContent =
    currentTerm.startDate && currentTerm.endDate ? `${currentTerm.startDate} 至 ${currentTerm.endDate}` : "未设置日期";
  document.querySelector("#currentTermMeta").textContent =
    currentTerm.status === "archived"
      ? "该学期已归档，排课、调课、工作量和工资写操作均只读。"
      : "排课、签到、工作量和工资均归属当前学期。";

  const terms = termManagementState.terms.length ? termManagementState.terms : [currentTerm];
  document.querySelector("#termList").innerHTML = terms
    .map((term) => {
      const copiedSummary = term.copiedConfigSummary
        ? `复制配置：课程 ${term.copiedConfigSummary.courseRuleCount || 0}，作息 ${term.copiedConfigSummary.periodTemplateCount || 0}，任课 ${term.copiedConfigSummary.teacherAssignmentCount || 0}，约束 ${term.copiedConfigSummary.constraintCount || 0}`
        : "未记录复制配置";
      const isCurrent = Boolean(term.current);
      const archived = term.status === "archived";
      return `
        <div class="term-row">
          <div class="term-row-main">
            <strong>${escapeHtml(term.name || term.id)}</strong>
            <span>${escapeHtml(term.startDate || "")} 至 ${escapeHtml(term.endDate || "")}</span>
          </div>
          <div class="term-row-meta">
            <span class="${termStatusClass(term.status)}">${termStatusText(term.status)}</span>
            <span>${escapeHtml(copiedSummary)}</span>
          </div>
          <div class="term-row-actions">
            ${
              !isCurrent && !archived
                ? `<button class="mini-button primary" data-set-current-term="${escapeHtml(term.id)}" type="button">设为当前</button>`
                : ""
            }
            ${
              !isCurrent && !archived
                ? `<button class="mini-button danger" data-archive-term="${escapeHtml(term.id)}" type="button">归档</button>`
                : ""
            }
            ${
              !isCurrent && !archived
                ? `<button class="mini-button danger" data-delete-term="${escapeHtml(term.id)}" type="button">删除</button>`
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");

  const createButton = document.querySelector("#createTermButton");
  if (createButton) {
    createButton.disabled = termManagementState.loading || !backendMode() || currentRole() !== "admin";
    createButton.textContent = termManagementState.loading ? "处理中" : "新建学期";
  }
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
  const scheduleVersions = state.scheduleVersions || [];
  const currentVersion = scheduleVersions.find((version) => version.current);
  const effectiveScheduleStatus = draft.status === "empty" && currentVersion ? "published" : draft.status;
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
  const enabledCourseRules = (config.courseRules || []).filter((rule) => rule.enabled);
  const hardConstraintCount = (config.constraints || []).length;
  const teacherCount = (config.teachers || []).length;
  const roomSummary = roomResourceSummary(config);

  document.querySelector("#adminDivisionName").textContent = config.divisionName;
  document.querySelector("#adminGradeName").textContent = config.gradeName;
  document.querySelector("#adminClassCount").textContent = `${config.classCount} 个班`;
  document.querySelector("#adminRequiredLessons").textContent = requiredScheduleLessonCount();
  document.querySelector("#adminRuleCount").textContent = `${enabledCourseRules.length} 门`;
  document.querySelector("#adminRuleHelp").textContent = `课程 · ${hardConstraintCount} 条硬约束`;
  document.querySelector("#adminResourceCount").textContent = `${teacherCount} 名`;
  document.querySelector("#adminResourceHelp").textContent =
    `老师池 · ${roomSummary.totalCount} 间教室（${roomSummary.homeroomCount} 间普通 + ${roomSummary.specialCount} 间专用）`;
  document.querySelector("#adminConflictCount").textContent = conflicts.length;
  document.querySelector("#adminPublishStatus").textContent = scheduleStatusText(effectiveScheduleStatus);
  document.querySelector("#adminPublishTime").textContent =
    effectiveScheduleStatus === "published"
      ? draft.publishedAt || currentVersion?.publishedAt || "已发布"
      : draft.status === "draft"
        ? draft.generatedAt
        : "等待生成";
  document.querySelector("#adminScheduleStatus").textContent = scheduleStatusText(effectiveScheduleStatus);
  document.querySelector("#adminScheduleStatus").className =
    effectiveScheduleStatus === "published"
      ? "status-pill done"
      : draft.status === "draft"
        ? "status-pill warning"
        : "status-pill";
  if (backendMode() && currentRole() === "admin") {
    const status = document.querySelector("#adminScheduleStatus");
    if (schedulingBackendState.loading) {
      status.textContent = schedulingBackendState.job
        ? schedulingJobProgressText(schedulingBackendState.job)
        : "后端处理中";
      status.className = "status-pill warning";
    } else if (schedulingBackendState.error) {
      status.textContent = "后端异常";
      status.className = "status-pill warning";
    } else if (schedulingBackendState.job?.status === "cancelled") {
      status.textContent = "排课已取消";
      status.className = "status-pill warning";
    } else if (schedulingBackendState.loaded) {
      status.textContent = `${scheduleStatusText(effectiveScheduleStatus)} · 后端`;
    }
  }
  document.querySelector("#conflictStatus").textContent =
    assignments.length === 0 ? "等待生成" : conflicts.length === 0 ? "无冲突" : `${conflicts.length} 个冲突`;
  document.querySelector("#conflictStatus").className =
    assignments.length === 0 ? "status-pill" : conflicts.length === 0 ? "status-pill done" : "status-pill warning";

  document.querySelector("#adminDivisionSelect").innerHTML = schedulingDivisionOptions(config.divisionId);
  document.querySelector("#adminGradeSelect").innerHTML = schedulingGradeOptions(config.divisionId, config.gradeId);
  const classStructure = classStructureFromConfig(config);
  document.querySelector("#regularClassCountInput").value = classStructure.regularCount;
  document.querySelector("#experimentalClassCountInput").value = classStructure.experimentalCount;
  document.querySelector("#classStructureHelp").textContent =
    `${config.divisionName}${config.gradeName}当前 ${classStructure.totalCount} 个班；下方普通教室目录会用于班级课表、签到教室和换教室。`;
  document.querySelector("#classStructurePreview").innerHTML = classStructurePreviewHtml(
    config,
    classStructure.regularCount,
    classStructure.experimentalCount,
  );
  document.querySelector("#classRoomCatalog").innerHTML = classRoomCatalogHtml(
    config,
    classStructure.regularCount,
    classStructure.experimentalCount,
  );
  document.querySelector("#periodTemplateHelp").textContent =
    `${config.divisionName}${config.gradeName}当前 ${schedulePeriodsFromConfig(config).length} 个可排课节次；午休、大课间通过相邻节次之间的空档体现。`;
  document.querySelector("#periodTemplateList").innerHTML = schedulePeriodTemplateHtml(config);
  document.querySelector("#roomResourceHelp").textContent =
    `${config.divisionName}当前有 ${roomSummary.homeroomCount} 间普通教室，另有 ${roomSummary.specialCount} 间专用教室；下方目录名称会用于排课、换教室和教室二维码。`;
  document.querySelector("#roomResourceTypeControls").innerHTML = roomResourceTypeControlsHtml(config, roomSummary.counts);
  document.querySelector("#roomResourcePreview").innerHTML = roomResourcePreviewHtml(config, roomSummary.counts);
  document.querySelector("#roomResourceCatalog").innerHTML = roomResourceCatalogHtml(config, roomSummary.counts);
  document.querySelector("#adminSchedulingTitle").textContent = `${config.divisionName}${config.gradeName}自动排课`;
  document.querySelector("#adminSchedulingIntro").textContent =
    `当前为${config.termName || "当前学期"} · ${config.divisionName}${config.gradeName}，共 ${config.classCount} 个班，按自然周 ${formatWeekRange(config.weekStart)} 生成课表。`;
  renderTermManagement();
  document.querySelector("#adminScopeText").textContent =
    `${config.divisionName}${config.gradeName} ${config.classCount} 个班，${config.subjects
      .map((subject) => subject.name)
      .join("、")} ${config.subjects.length} 门课。`;
  document.querySelector("#subjectConfigHelp").textContent =
    `${config.divisionName}${config.gradeName}直接按班级逐科指定老师，空格子不会参与排课，全部匹配后才能生成。`;
  document.querySelector("#courseRulesHelp").textContent =
    `${config.divisionName}${config.gradeName}可配置课程、周课时、每日分布、连堂上限和教室要求，保存后重新生成排课时生效。`;
  document.querySelector("#newCourseRoomType").innerHTML = scheduleRoomTypeOptions(
    document.querySelector("#newCourseRoomType")?.value || "homeroom",
  );
  document.querySelector("#courseRulesStatus").textContent =
    `${(config.courseRules || []).filter((rule) => rule.enabled).length} 门课 · ${(config.constraints || []).length} 条硬约束`;
  document.querySelector("#courseRulesStatus").className = (config.constraints || []).length
    ? "status-pill warning"
    : "status-pill done";
  document.querySelector("#scheduleVersionStatus").textContent = currentVersion
    ? `当前 V${currentVersion.versionNumber}`
    : "暂无版本";
  document.querySelector("#scheduleVersionStatus").className = currentVersion ? "status-pill done" : "status-pill";
  document.querySelector("#scheduleVersionList").innerHTML = scheduleVersionListHtml(scheduleVersions);
  document.querySelector("#toggleCourseEditMode").textContent = courseRulesEditMode ? "完成编辑" : "编辑";
  document.querySelector("#adminSchedulePreviewHelp").textContent =
    `按${config.gradeName}班级查看生成结果，确认前为草稿，确认后同步到老师端 ${formatWeekRange(config.weekStart)} 课表。`;
  document.querySelector("#courseRuleList").innerHTML = enabledCourseRules.length
    ? enabledCourseRules.map(adminCourseRuleItem).join("")
    : `<div class="empty-state">当前年级还没有课程，请先新增课程</div>`;
  document.querySelector("#constraintSubjectSelect").innerHTML = scheduleConstraintSubjectOptions(config);
  document.querySelector("#constraintPeriodSelect").innerHTML = scheduleConstraintPeriodOptions(config);
  document.querySelector("#scheduleConstraintList").innerHTML = adminScheduleConstraintList(config);
  document.querySelector("#subjectConfigList").innerHTML = adminSubjectConfigItem(config);
  renderTeacherRulePanel(config);
  const missingTeacherAssignments = missingClassSubjectTeacherAssignments(config);
  const precheck = schedulingBackendState.precheck || draft.precheck || null;
  const precheckBlocked = Number(precheck?.blockingCount || 0) > 0;
  const termReadOnly = config.termStatus === "archived";
  const unassignedCount = Math.max(
    Number(draft.unassignedCount || 0),
    Number(draft.requiredLessonCount || requiredScheduleLessonCount()) - Number(assignments.length || 0),
  );
  const readiness = scheduleReadinessState({
    config,
    draft,
    assignments,
    conflicts,
    missingTeacherAssignments,
    precheck,
    termReadOnly,
    unassignedCount,
  });
  document.querySelector("#schedulePrecheckStatus").textContent = schedulePrecheckStatusText(precheck);
  document.querySelector("#schedulePrecheckStatus").className = schedulePrecheckStatusClass(precheck);
  document.querySelector("#schedulePrecheckBlockingCount").textContent = Number(precheck?.blockingCount || 0);
  document.querySelector("#schedulePrecheckWarningCount").textContent = Number(precheck?.warningCount || 0);
  document.querySelector("#schedulePrecheckTaskCount").textContent = Number(precheck?.taskCount || 0);
  document.querySelector("#schedulePrecheckLessonCount").textContent = precheck
    ? `${Number(precheck.requiredLessonCount || 0)} 节课时任务`
    : "等待读取";
  document.querySelector("#schedulePrecheckList").innerHTML = schedulePrecheckListHtml(precheck);
  document.querySelector("#scheduleReadinessPanel").innerHTML = scheduleReadinessHtml(readiness);
  const completionWarningHtml =
    assignments.length > 0 && unassignedCount > 0
      ? `<article class="warning-item diagnostic-item">
          <header>
            <strong>课表尚未排完</strong>
            <span class="tag exception">禁止发布</span>
          </header>
          <p>当前还有 ${unassignedCount} 节课未排入课表，请调整课程、老师或硬约束后重新生成。</p>
        </article>`
      : "";
  const schedulingJobHtml =
    schedulingBackendState.job && (schedulingJobIsActive(schedulingBackendState.job) || schedulingBackendState.job.status === "cancelled")
      ? `<div class="check-success schedule-job-progress">
          <strong>${escapeHtml(schedulingJobProgressText(schedulingBackendState.job))}</strong>
          <span>任务号 ${escapeHtml(schedulingBackendState.job.id)}${schedulingJobIsActive(schedulingBackendState.job) ? "，页面会自动刷新排课结果。" : "，可重新发起排课。"}</span>
          ${
            schedulingJobIsActive(schedulingBackendState.job)
              ? `<button class="ghost-button" data-cancel-schedule-job type="button">取消排课</button>`
              : ""
          }
        </div>`
      : "";
  document.querySelector("#conflictList").innerHTML =
    schedulingJobHtml ||
    (assignments.length === 0
      ? `<div class="empty-state">点击“一键生成排课”后显示冲突校验结果</div>`
      : conflicts.length
        ? conflicts.map(conflictItem).join("")
        : `<div class="check-success"><strong>冲突 0</strong><span>${escapeHtml(scheduleSolverSummaryText(draft))}</span></div>${completionWarningHtml}${scheduleQualityHtml(draft)}${scheduleDiagnosticsHtml(draft)}`);
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
  document.querySelector("#adminScheduleGrid").innerHTML = adminScheduleGrid(selectedClassAssignments, { readonly: false });

  const generateButton = document.querySelector("#generateSchedule");
  generateButton.disabled = schedulingBackendState.loading || !readiness.canGenerate;
  generateButton.title = readiness.generateReason || "";
  generateButton.innerHTML = schedulingBackendState.loading
    ? `<span aria-hidden="true">…</span>生成中`
    : `<span aria-hidden="true">✓</span>一键生成排课`;
  const confirmButton = document.querySelector("#confirmSchedule");
  confirmButton.disabled = schedulingBackendState.loading || !readiness.canPublish;
  confirmButton.title = readiness.publishReason || "";
  document.querySelector("#saveCourseRules").disabled = termReadOnly || schedulingBackendState.loading;
  document.querySelector("#saveClassStructure").disabled = termReadOnly || schedulingBackendState.loading;
  document.querySelector("#saveSchedulePeriods").disabled = termReadOnly || schedulingBackendState.loading;
  document.querySelector("#addSchedulePeriod").disabled = termReadOnly || schedulingBackendState.loading;
  document.querySelector("#saveRoomResources").disabled = termReadOnly || schedulingBackendState.loading;
  document.querySelector("#addGradeCourse").disabled = termReadOnly || schedulingBackendState.loading;
  document.querySelector("#toggleCourseEditMode").disabled = termReadOnly || schedulingBackendState.loading;
  document.querySelector("#addScheduleConstraint").disabled =
    termReadOnly || schedulingBackendState.loading || !(config.courseRules || []).some((rule) => rule.enabled);
  document.querySelector("#saveTeacherRule").disabled = termReadOnly || schedulingBackendState.loading || !(config.teachers || []).length;
  document.querySelector("#refreshSchedulePrecheck").disabled = schedulingBackendState.loading;
  document.querySelectorAll("[data-save-teacher-assignment-matrix]").forEach((button) => {
    button.disabled = termReadOnly || schedulingBackendState.loading;
  });
  document
    .querySelectorAll("[data-auto-assign-teachers], [data-auto-assign-teachers-overwrite]")
    .forEach((button) => {
      button.disabled = termReadOnly || schedulingBackendState.loading;
    });
  document.querySelectorAll("[data-delete-schedule-period]").forEach((button) => {
    button.disabled = termReadOnly || schedulingBackendState.loading;
  });
}

function renderAdminScheduleOverview() {
  const container = document.querySelector("#adminScheduleOverviewView");
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
  const currentVersion = (state.scheduleVersions || []).find((version) => version.current);
  const effectiveScheduleStatus = draft.status === "empty" && currentVersion ? "published" : draft.status;
  const selectedClassId =
    config.classes.some((schoolClass) => schoolClass.id === state.selectedScheduleOverviewClassId)
      ? state.selectedScheduleOverviewClassId
      : config.classes.some((schoolClass) => schoolClass.id === state.selectedSchedulingClassId)
        ? state.selectedSchedulingClassId
        : config.classes[0]?.id || "";
  state.selectedScheduleOverviewClassId = selectedClassId;
  const selectedClass = config.classes.find((schoolClass) => schoolClass.id === selectedClassId) || config.classes[0] || null;
  const selectedClassAssignments = assignments
    .filter((assignment) => assignment.classId === selectedClassId)
    .sort((a, b) => `${a.date} ${a.period}`.localeCompare(`${b.date} ${b.period}`));
  const conflicts = validateScheduleConflicts(assignments);
  const selectedClassConflicts = conflicts.filter((conflict) => {
    const text = `${conflict.title || ""} ${conflict.text || ""}`;
    return selectedClass ? text.includes(selectedClass.name) : false;
  });
  const status = document.querySelector("#adminScheduleOverviewStatus");
  const summary = document.querySelector("#adminScheduleOverviewSummary");
  const grid = document.querySelector("#adminScheduleOverviewGrid");
  const divisionSelect = document.querySelector("#overviewDivisionSelect");
  const gradeSelect = document.querySelector("#overviewGradeSelect");
  const classSelect = document.querySelector("#overviewClassSelect");

  document.querySelector("#adminScheduleOverviewTitle").textContent = `${config.divisionName}${config.gradeName}课表总览`;
  document.querySelector("#adminScheduleOverviewIntro").textContent =
    `查看${config.termName || "当前学期"} · ${config.divisionName}${config.gradeName} ${formatWeekRange(config.weekStart)} 的班级课表。`;
  divisionSelect.innerHTML = schedulingDivisionOptions(config.divisionId);
  gradeSelect.innerHTML = schedulingGradeOptions(config.divisionId, config.gradeId);
  classSelect.innerHTML = config.classes
    .map(
      (schoolClass) => `
        <option value="${schoolClass.id}" ${schoolClass.id === selectedClassId ? "selected" : ""}>
          ${schoolClass.name} · ${schoolClass.room}
        </option>
      `,
    )
    .join("");

  if (schedulingBackendState.loading) {
    status.textContent = schedulingBackendState.job
      ? schedulingJobProgressText(schedulingBackendState.job)
      : "后端读取中";
    status.className = "status-pill warning";
  } else if (schedulingBackendState.error) {
    status.textContent = "后端异常";
    status.className = "status-pill warning";
  } else if (assignments.length === 0 && !currentVersion) {
    status.textContent = "未生成";
    status.className = "status-pill";
  } else {
    status.textContent = scheduleStatusText(effectiveScheduleStatus);
    status.className = effectiveScheduleStatus === "published" ? "status-pill done" : "status-pill warning";
  }

  summary.innerHTML = `
    <article class="metric">
      <span>学部年级</span>
      <strong>${escapeHtml(config.divisionName)}${escapeHtml(config.gradeName)}</strong>
      <small>${config.classCount} 个班</small>
    </article>
    <article class="metric">
      <span>当前班级</span>
      <strong>${escapeHtml(selectedClass?.name || "未选择")}</strong>
      <small>${escapeHtml(selectedClass?.room || "暂无教室")}</small>
    </article>
    <article class="metric">
      <span>课表状态</span>
      <strong>${escapeHtml(scheduleStatusText(effectiveScheduleStatus))}</strong>
      <small>${draft.publishedAt || currentVersion?.publishedAt || draft.generatedAt || "等待生成"}</small>
    </article>
    <article class="metric">
      <span>自然周</span>
      <strong>${escapeHtml(formatWeekRange(config.weekStart))}</strong>
      <small>${config.periods.length} 个节次</small>
    </article>
    <article class="metric">
      <span>本班课时</span>
      <strong>${selectedClassAssignments.length}</strong>
      <small>全级 ${assignments.length} 节</small>
    </article>
    <article class="metric">
      <span>冲突</span>
      <strong>${selectedClassConflicts.length}</strong>
      <small>全级 ${conflicts.length} 个</small>
    </article>
  `;
  grid.innerHTML = selectedClassAssignments.length
    ? adminScheduleGrid(selectedClassAssignments, { readonly: true })
    : currentVersion
      ? `<div class="empty-state schedule-overview-empty">当前学部年级已有发布版本 V${escapeHtml(currentVersion.versionNumber)}，但课表明细暂未载入。请回到“行政排课”重新读取当前学部年级。</div>`
      : `<div class="empty-state schedule-overview-empty">当前学部年级还没有课表，请先到“行政排课”生成草稿或发布正式课表。</div>`;
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
  const suggestions = document.querySelector("#scheduleAdjustmentSuggestions");
  const replanClassSelect = document.querySelector("#scheduleReplanClassSelect");
  const replanTeacherSelect = document.querySelector("#scheduleReplanTeacherSelect");
  const replanDateSelect = document.querySelector("#scheduleReplanDateSelect");
  const replanSubjectSelect = document.querySelector("#scheduleReplanSubjectSelect");
  const replanScopeStatus = document.querySelector("#scheduleReplanScopeStatus");
  if (
    !assignmentSelect ||
    !teacherSelect ||
    !dateSelect ||
    !periodSelect ||
    !roomSelect ||
    !applyButton ||
    !lockButton ||
    !regenerateButton ||
    !status ||
    !suggestions ||
    !replanClassSelect ||
    !replanTeacherSelect ||
    !replanDateSelect ||
    !replanSubjectSelect ||
    !replanScopeStatus
  ) {
    return;
  }

  const hasDraft = assignments.length > 0;
  const isPublished = draft.status === "published";
  const termReadOnly = state.schedulingConfig.termStatus === "archived";
  const canAdjust = hasDraft && !isPublished && !termReadOnly && !schedulingBackendState.loading;
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
              ${room.name} · ${scheduleRoomTypeText(room.roomType || "homeroom")}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无教室</option>`;

  const replanScope = currentScheduleReplanScope();
  const replanDates = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5);
  replanClassSelect.innerHTML = `<option value="">全部班级</option>${state.schedulingConfig.classes
    .map(
      (schoolClass) => `
        <option value="${escapeHtml(schoolClass.id)}" ${schoolClass.id === replanScope.classId ? "selected" : ""}>
          ${escapeHtml(schoolClass.name)}
        </option>
      `,
    )
    .join("")}`;
  replanTeacherSelect.innerHTML = `<option value="">全部老师</option>${state.schedulingConfig.teachers
    .map(
      (teacher) => `
        <option value="${escapeHtml(teacher.id)}" ${teacher.id === replanScope.teacherId ? "selected" : ""}>
          ${escapeHtml(teacher.name)} · ${escapeHtml(teacher.subject || teacher.subjectId || "")}
        </option>
      `,
    )
    .join("")}`;
  replanDateSelect.innerHTML = `<option value="">全部日期</option>${replanDates
    .map(
      (date) => `
        <option value="${escapeHtml(date)}" ${date === replanScope.date ? "selected" : ""}>
          ${escapeHtml(scheduleWeekdayLabel(date))} · ${escapeHtml(formatDate(date))}
        </option>
      `,
    )
    .join("")}`;
  replanSubjectSelect.innerHTML = `<option value="">全部科目</option>${state.schedulingConfig.subjects
    .map(
      (subject) => `
        <option value="${escapeHtml(subject.id)}" ${subject.id === replanScope.subjectId ? "selected" : ""}>
          ${escapeHtml(subject.name)}
        </option>
      `,
    )
    .join("")}`;
  const scopeText = scheduleReplanScopeText(replanScope);
  replanScopeStatus.textContent = scheduleReplanScopeIsEmpty(replanScope)
    ? "默认重排全部未锁定课程"
    : `仅重排：${scopeText}`;

  assignmentSelect.disabled = !hasDraft || termReadOnly || schedulingBackendState.loading;
  teacherSelect.disabled = !canAdjust;
  dateSelect.disabled = !canAdjust;
  periodSelect.disabled = !canAdjust;
  roomSelect.disabled = !canAdjust;
  applyButton.disabled = !canAdjust || !selectedAssignment;
  lockButton.disabled = !canAdjust || !selectedAssignment;
  lockButton.textContent = selectedAssignment?.locked ? "解锁该课节" : "锁定该课节";
  regenerateButton.disabled = !canAdjust || !hasDraft;
  regenerateButton.textContent = scheduleReplanScopeIsEmpty(replanScope) ? "重排未锁定课程" : "按范围局部重排";
  replanClassSelect.disabled = !canAdjust || !hasDraft;
  replanTeacherSelect.disabled = !canAdjust || !hasDraft;
  replanDateSelect.disabled = !canAdjust || !hasDraft;
  replanSubjectSelect.disabled = !canAdjust || !hasDraft;
  suggestions.innerHTML = scheduleAdjustmentSuggestionsHtml(selectedAssignment, draft);
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
  const termReadOnly = state.schedulingConfig.termStatus === "archived";
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
              ${room.name} · ${scheduleRoomTypeText(room.roomType || "homeroom")}
            </option>
          `,
        )
        .join("")
    : `<option value="">暂无教室</option>`;

  assignmentSelect.disabled = !isPublished || termReadOnly || schedulingBackendState.loading;
  teacherSelect.disabled = !isPublished || termReadOnly || schedulingBackendState.loading;
  dateSelect.disabled = !isPublished || termReadOnly || schedulingBackendState.loading;
  periodSelect.disabled = !isPublished || termReadOnly || schedulingBackendState.loading;
  roomSelect.disabled = !isPublished || termReadOnly || schedulingBackendState.loading;
  submitButton.disabled = !isPublished || termReadOnly || !selected || schedulingBackendState.loading;
  status.textContent = termReadOnly
    ? "已归档只读"
    : !isPublished
      ? "等待发布"
      : `${(state.schedulingConfig.changeRequests || []).filter((item) => item.status === "pending").length} 个待审批`;
  status.className = termReadOnly ? "status-pill locked" : !isPublished ? "status-pill" : "status-pill warning";
  list.innerHTML = adminChangeRequestList(state.schedulingConfig);
}

function renderTeacherImport() {
  const container = document.querySelector("#teacherImportView");
  if (!container) return;

  const textarea = document.querySelector("#teacherImportCsv");
  const status = document.querySelector("#teacherImportStatus");
  const preview = teacherImportState.preview;
  const imported = teacherImportState.imported;
  const connected = backendMode() && currentRole() === "system_admin";
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
          : "请通过后端服务登录行政管理账号";
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
  if (role === "system_admin") return "行政管理";
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
  const canManageAccount = backendMode() && currentRole() === "system_admin" && row.accountId;
  const isDisabled = row.accountStatus === "disabled" || row.status === "disabled";
  const accountActions = canManageAccount
    ? `
      <div class="personnel-actions">
        <button class="mini-button" data-account-reset="${escapeHtml(row.accountId)}" type="button">重置密码</button>
        <button class="mini-button ${isDisabled ? "primary" : ""}" data-account-status="${escapeHtml(row.accountId)}" data-next-status="${isDisabled ? "active" : "disabled"}" type="button">
          ${isDisabled ? "启用账号" : "停用账号"}
        </button>
      </div>
    `
    : `<span class="muted">${row.accountId ? "仅行政管理可操作" : "未开通账号"}</span>`;
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
      <td data-label="账号操作">${accountActions}</td>
    </tr>
  `;
}

function renderPersonnelList() {
  if (backendMode() && isPersonnelRole() && !personnelPage.loaded && !personnelPage.loading) {
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
      ? `<tr><td colspan="9"><div class="empty-state">正在加载全校人员列表...</div></td></tr>`
      : personnelPage.error
        ? `<tr><td colspan="9"><div class="empty-state">${escapeHtml(personnelPage.error)}</div></td></tr>`
        : personnelPage.items.length
          ? personnelPage.items.map(personnelRow).join("")
          : `<tr><td colspan="9"><div class="empty-state">没有符合条件的人员</div></td></tr>`;
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
    status.textContent = "文件模式试运行数据";
    status.className = "status-pill";
  }
  table.innerHTML = pageRows.length
    ? pageRows.map(personnelRow).join("")
    : `<tr><td colspan="9"><div class="empty-state">没有符合条件的人员</div></td></tr>`;
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
  return [];
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

async function autoAssignClassSubjectTeachers(overwrite = false) {
  if (!backendMode() || currentRole() !== "admin") {
    showToast("请使用后端教研所账号执行自动分配");
    return;
  }
  if (
    overwrite &&
    !(await confirmDialog("全部重新分配", {
      description: "会覆盖当前已保存的任课老师配置（含手工指定），确定继续吗？",
      confirmText: "重新分配",
      danger: true,
    }))
  ) {
    return;
  }
  try {
    const result = await apiRequest("/api/scheduling/teacher-assignments/auto", {
      method: "POST",
      body: {
        termId: currentSchedulingTermId(),
        divisionId: state.schedulingConfig.divisionId,
        gradeId: state.schedulingConfig.gradeId,
        overwrite,
      },
    });
    const assigned = (result.summary || []).filter((item) => item.status === "assigned");
    const skipped = (result.summary || []).filter((item) => item.status === "skipped");
    const warnings = (result.summary || []).flatMap((item) => item.warnings || []);
    const parts = [`已自动分配 ${assigned.length} 门课程的任课老师`];
    if (skipped.length) parts.push(`${skipped.length} 门课程缺老师池被跳过`);
    if (warnings.length) parts.push(warnings[0]);
    showToast(parts.join("；"));
    await loadBackendSchedulingContext();
  } catch (error) {
    showToast(error.message || "自动分配任课老师失败");
  }
}

async function saveClassSubjectTeacherAssignments() {
  if (!backendMode() || currentRole() !== "admin") {
    showToast("请使用后端教研所账号保存任课配置");
    return;
  }
  try {
    const payloads = collectClassSubjectTeacherAssignments();
    if (!payloads.length) {
      showToast("当前没有可保存的任课配置");
      return;
    }
    for (const payload of payloads) {
      await apiRequest("/api/scheduling/teacher-assignments", {
        method: "POST",
        body: {
          termId: currentSchedulingTermId(),
          stageId: state.schedulingConfig.stageId,
          grade: state.schedulingConfig.grade,
          subjectId: payload.subjectId,
          classTeacherIds: payload.classTeacherIds,
        },
      });
    }
    showToast("任课配置已保存，重新生成排课时生效");
    await loadBackendSchedulingContext();
  } catch (error) {
    showToast(error.message || "任课配置保存失败");
  }
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
  const minPerClassPerDay = Number(rule.minPerClassPerDay || 0);
  if (minPerClassPerDay > 0) {
    parts.push(`每天至少 ${minPerClassPerDay} 节（自动覆盖 5 天）`);
  }
  const maxPerClassPerDay = Number(rule.maxPerClassPerDay || 0);
  if (maxPerClassPerDay > 0) {
    parts.push(`每天最多 ${maxPerClassPerDay} 节`);
  } else {
    parts.push("每日上限不限");
  }
  const minWeeklyDays = minPerClassPerDay > 0 ? 0 : Number(rule.minWeeklyDays || 0);
  if (minWeeklyDays > 0) {
    parts.push(`至少覆盖 ${minWeeklyDays} 天`);
  }
  const maxConsecutive = Number(rule.maxConsecutivePerClass || 0) || (rule.allowConsecutive === false ? 1 : 0);
  parts.push(maxConsecutive > 0 ? `最多连续 ${maxConsecutive} 节` : "连堂不限");
  const forbiddenPeriods = normalizeCourseRulePeriods(rule.forbiddenPeriods || []);
  parts.push(forbiddenPeriods.length ? `禁排第 ${forbiddenPeriods.join("、")} 节` : "无禁排节次");
  const preferred = normalizePreferredDayPart(rule.preferredDayPart || "any");
  parts.push(preferred === "any" ? "时段不限" : `偏好${courseRulePreferredDayPartText(preferred)}`);
  parts.push(`教室：${scheduleRoomTypeText(rule.requiredRoomType || "homeroom")}`);
  return parts.join(" · ");
}

function scheduleRoomTypeOptions(selected = "homeroom") {
  const normalized = normalizeScheduleRoomType(selected);
  const options = [
    { value: "homeroom", label: SCHEDULE_ROOM_TYPES.homeroom },
    ...roomResourceTypes().map((resource) => ({ value: resource.type, label: resource.label })),
  ];
  if (!options.some((option) => option.value === normalized)) {
    options.push({ value: normalized, label: scheduleRoomTypeText(normalized) });
  }
  return options
    .map(
      ({ value, label }) => `
        <option value="${value}" ${normalized === value ? "selected" : ""}>${label}</option>
      `,
    )
    .join("");
}

function adminCourseRuleItem(rule) {
  const subjectId = escapeHtml(rule.subjectId);
  const allowConsecutive = rule.allowConsecutive !== false;
  const minPerClassPerDay = Number(rule.minPerClassPerDay || 0);
  const minWeeklyDays = minPerClassPerDay > 0 ? 0 : Number(rule.minWeeklyDays || 0);
  const maxConsecutive = Number(rule.maxConsecutivePerClass || 0) || (allowConsecutive ? 0 : 1);
  const preferredDayPart = normalizePreferredDayPart(rule.preferredDayPart || "any");
  const requiredRoomType = normalizeScheduleRoomType(rule.requiredRoomType || "homeroom");
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
      ${courseRulesEditMode ? "" : `<p class="course-rule-summary">${escapeHtml(courseRuleConstraintSummary(rule))}</p>`}
      ${
        courseRulesEditMode
          ? `
            <div class="course-rule-editor" aria-label="${escapeHtml(rule.subjectName)}课程限制">
              <section class="course-rule-section">
                <div class="course-rule-section-title">
                  <strong>分布规则</strong>
                  <span>填 0 表示不限制</span>
                </div>
                <div class="course-rule-constraint-grid">
                  <label class="field-label compact-field" for="courseMinDay-${subjectId}">
                    <span>每天至少</span>
                    <div class="input-with-unit">
                      <input
                        id="courseMinDay-${subjectId}"
                        data-course-rule-min-day="${subjectId}"
                        type="number"
                        min="0"
                        max="${state.schedulingConfig.periods?.length || 6}"
                        value="${Number(rule.minPerClassPerDay || 0)}"
                      />
                      <em>节</em>
                    </div>
                  </label>
                  <label class="field-label compact-field" for="courseMaxDay-${subjectId}">
                    <span>每天最多</span>
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
                  <label class="field-label compact-field ${minPerClassPerDay > 0 ? "disabled-field" : ""}" for="courseMinWeeklyDays-${subjectId}">
                    <span>覆盖天数</span>
                    <div class="input-with-unit">
                      <input
                        id="courseMinWeeklyDays-${subjectId}"
                        data-course-rule-min-weekly-days="${subjectId}"
                        type="number"
                        min="0"
                        max="5"
                        value="${minWeeklyDays}"
                        ${minPerClassPerDay > 0 ? "disabled" : ""}
                      />
                      <em>天</em>
                    </div>
                  </label>
                  <label class="field-label compact-field" for="courseMaxConsecutive-${subjectId}">
                    <span>最多连续</span>
                    <div class="input-with-unit">
                      <input
                        id="courseMaxConsecutive-${subjectId}"
                        data-course-rule-max-consecutive="${subjectId}"
                        type="number"
                        min="0"
                        max="${state.schedulingConfig.periods?.length || 6}"
                        value="${maxConsecutive}"
                      />
                      <em>节</em>
                    </div>
                  </label>
                </div>
                <div
                  class="course-rule-auto-note ${minPerClassPerDay > 0 ? "active" : ""}"
                  data-course-rule-coverage-hint="${subjectId}"
                >
                  ${minPerClassPerDay > 0 ? "已由每天至少规则自动覆盖 5 个教学日" : "覆盖天数用于避免课程集中在少数几天；不填则不限。"}
                </div>
              </section>
              <section class="course-rule-section">
                <div class="course-rule-section-title">
                  <strong>排课偏好</strong>
                  <span>禁排会作为硬约束执行</span>
                </div>
                <div class="course-rule-preference-grid">
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
                  <label class="field-label compact-field" for="courseRoomType-${subjectId}">
                    <span>教室要求</span>
                    <select
                      class="lesson-select"
                      id="courseRoomType-${subjectId}"
                      data-course-rule-room-type="${subjectId}"
                    >
                      ${scheduleRoomTypeOptions(requiredRoomType)}
                    </select>
                  </label>
                </div>
              </section>
              <input type="hidden" data-course-rule-consecutive="${subjectId}" value="${maxConsecutive === 1 ? "false" : "true"}" />
            </div>
          `
          : `
            <input type="hidden" data-course-rule-min-day="${subjectId}" value="${Number(rule.minPerClassPerDay || 0)}" />
            <input type="hidden" data-course-rule-max-day="${subjectId}" value="${Number(rule.maxPerClassPerDay || 0)}" />
            <input type="hidden" data-course-rule-min-weekly-days="${subjectId}" value="${minWeeklyDays}" />
            <input type="hidden" data-course-rule-max-consecutive="${subjectId}" value="${maxConsecutive}" />
            <input type="hidden" data-course-rule-consecutive="${subjectId}" value="${maxConsecutive === 1 ? "false" : "true"}" />
            <input type="hidden" data-course-rule-forbidden-periods="${subjectId}" value="${escapeHtml(courseRuleForbiddenPeriodsValue(rule))}" />
            <input type="hidden" data-course-rule-preferred-day-part="${subjectId}" value="${preferredDayPart}" />
            <input type="hidden" data-course-rule-room-type="${subjectId}" value="${requiredRoomType}" />
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
          <strong>班级老师指定表</strong>
          <span>每个格子代表一个班的一门课，默认留空；输入姓名、工号或教师 ID 后自动匹配。</span>
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
        <span>排课时只使用每个格子里保存的老师；空格子会阻止生成。可先“自动分配”补齐空格子（按老师全校课量均衡），再手工微调。</span>
        <div class="subject-config-buttons">
          <button class="mini-button" data-auto-assign-teachers type="button">自动分配空缺</button>
          <button class="mini-button" data-auto-assign-teachers-overwrite type="button">全部重新分配</button>
          <button class="mini-button primary" data-save-teacher-assignment-matrix type="button">保存班级老师</button>
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

function schedulePrecheckStatusText(precheck) {
  if (!precheck) return "等待预检";
  if (precheck.status === "blocked") return "存在阻塞项";
  if (precheck.status === "warning") return "可生成但需关注";
  return "预检通过";
}

function schedulePrecheckStatusClass(precheck) {
  if (!precheck) return "status-pill";
  if (precheck.status === "blocked") return "status-pill warning";
  if (precheck.status === "warning") return "status-pill warning";
  return "status-pill done";
}

function scheduleReadinessTagClass(stateName) {
  if (stateName === "blocked") return "exception";
  if (stateName === "warning") return "scheduled";
  if (stateName === "done" || stateName === "ready") return "completed";
  return "pending";
}

function scheduleReadinessLabel(stateName) {
  if (stateName === "blocked") return "需处理";
  if (stateName === "warning") return "提醒";
  if (stateName === "done") return "完成";
  if (stateName === "ready") return "可继续";
  return "待处理";
}

function scheduleReadinessState({
  config,
  draft,
  assignments,
  conflicts,
  missingTeacherAssignments,
  precheck,
  termReadOnly,
  unassignedCount,
}) {
  const requiresPrecheck = backendMode() && currentRole() === "admin";
  const missingCount = missingTeacherAssignments.length;
  const precheckBlocked = Number(precheck?.blockingCount || 0) > 0;
  const warningCount = Number(precheck?.warningCount || 0);
  const hasDraft = assignments.length > 0;
  const published = draft.status === "published";
  const hasIncompleteDraft = hasDraft && unassignedCount > 0;
  const hasConflicts = conflicts.length > 0;
  const items = [
    {
      state: termReadOnly ? "blocked" : "done",
      title: termReadOnly ? "学期已归档" : "学期可编辑",
      text: termReadOnly ? "历史学期只读，不能生成或发布课表。" : `${config.termName || "当前学期"}正在编辑。`,
      target: "#termManagementStatus",
    },
    {
      state: missingCount ? "blocked" : "done",
      title: missingCount ? "班级老师未配齐" : "班级老师已配齐",
      text: missingCount ? `还有 ${missingCount} 个班级课程缺任课老师。` : "所有班级课程已有明确任课老师。",
      target: "#subjectConfigList",
    },
    {
      state: !requiresPrecheck ? "done" : !precheck ? "pending" : precheckBlocked ? "blocked" : warningCount ? "warning" : "done",
      title: !requiresPrecheck
        ? "本地模式可生成"
        : !precheck
          ? "等待排课预检"
          : precheckBlocked
            ? "预检存在阻塞项"
            : warningCount
              ? "预检通过但需关注"
              : "预检已通过",
      text: !requiresPrecheck
        ? "当前演示模式不强制后端预检。"
        : !precheck
          ? "先执行预检，确认老师、教室和硬约束具备可行条件。"
          : precheckBlocked
            ? `${Number(precheck.blockingCount || 0)} 个阻塞项必须先处理。`
            : warningCount
              ? `${warningCount} 个提醒项不会阻止生成，但可能影响质量。`
              : `${Number(precheck.requiredLessonCount || 0)} 节课时任务已通过预检。`,
      target: "#schedulePrecheckList",
    },
    {
      state: !hasDraft ? "pending" : hasConflicts || hasIncompleteDraft ? "blocked" : "done",
      title: !hasDraft ? "尚未生成草稿" : hasConflicts ? "草稿存在冲突" : hasIncompleteDraft ? "草稿尚未排完" : "草稿可发布",
      text: !hasDraft
        ? "预检和老师配置完成后，可生成本周排课草稿。"
        : hasConflicts
          ? `当前草稿有 ${conflicts.length} 个硬冲突。`
          : hasIncompleteDraft
            ? `当前草稿还有 ${unassignedCount} 节未排入课表。`
            : "当前草稿无硬冲突，课节已全部排入课表。",
      target: "#conflictList",
    },
  ];
  const canGenerate = !termReadOnly && !missingCount && (!requiresPrecheck || (precheck && !precheckBlocked));
  const canPublish = !termReadOnly && hasDraft && !published && !hasConflicts && !hasIncompleteDraft;
  let status = "ready";
  let title = "可以生成排课草稿";
  let text = "配置已经满足生成条件，可以进入自动排课。";
  let action = { label: "生成草稿", clickTarget: "#generateSchedule" };

  if (termReadOnly) {
    status = "blocked";
    title = "当前学期已归档";
    text = "历史学期不能继续生成、调整或发布课表。";
    action = { label: "查看学期状态", scrollTarget: "#termManagementStatus" };
  } else if (missingCount) {
    status = "blocked";
    title = "先补齐班级任课老师";
    text = `还有 ${missingCount} 个班级课程没有指定老师，补齐后才能生成。`;
    action = { label: "去补老师", scrollTarget: "#subjectConfigList" };
  } else if (requiresPrecheck && !precheck) {
    status = "pending";
    title = "先执行排课预检";
    text = "预检会提前发现老师池、教室和硬约束问题，避免长时间无效求解。";
    action = { label: "重新预检", clickTarget: "#refreshSchedulePrecheck" };
  } else if (precheckBlocked) {
    status = "blocked";
    title = "预检有阻塞项";
    text = `${Number(precheck.blockingCount || 0)} 个阻塞项需要处理后才能生成排课。`;
    action = { label: "查看阻塞项", scrollTarget: "#schedulePrecheckList" };
  } else if (published) {
    status = "done";
    title = "课表已发布";
    text = "老师端已读取当前正式版本，如需变更请走调课或新版本发布。";
    action = { label: "查看版本", scrollTarget: "#scheduleVersionList" };
  } else if (hasConflicts) {
    status = "blocked";
    title = "先处理草稿冲突";
    text = `当前草稿有 ${conflicts.length} 个冲突，处理后才能发布。`;
    action = { label: "查看冲突", scrollTarget: "#conflictList" };
  } else if (hasIncompleteDraft) {
    status = "blocked";
    title = "草稿尚未排完";
    text = `还有 ${unassignedCount} 节课未排入课表，需要放宽规则或补充资源。`;
    action = { label: "查看诊断", scrollTarget: "#conflictList" };
  } else if (hasDraft) {
    status = warningCount ? "warning" : "ready";
    title = warningCount ? "可以发布，但建议先看提醒" : "可以发布到老师端";
    text = warningCount ? `${warningCount} 个提醒项不会阻止发布，但建议发布前确认。` : "当前草稿无硬冲突，发布后会同步到老师端课表、签到和薪资。";
    action = { label: "发布到老师端", clickTarget: "#confirmSchedule" };
  }

  return {
    status,
    title,
    text,
    items,
    action,
    canGenerate,
    canPublish,
    generateReason: canGenerate
      ? ""
      : termReadOnly
        ? "当前学期已归档，不能生成。"
        : missingCount
          ? `还有 ${missingCount} 个班级课程缺任课老师。`
          : requiresPrecheck && !precheck
            ? "请先执行排课预检。"
            : precheckBlocked
              ? "预检存在阻塞项。"
              : "当前状态不能生成排课。",
    publishReason: canPublish
      ? ""
      : termReadOnly
        ? "当前学期已归档，不能发布。"
        : !hasDraft
          ? "请先生成排课草稿。"
          : published
            ? "当前课表已经发布。"
            : hasConflicts
              ? `当前草稿有 ${conflicts.length} 个冲突。`
              : hasIncompleteDraft
                ? `当前草稿还有 ${unassignedCount} 节未排。`
                : "当前状态不能发布。",
  };
}

function scheduleReadinessHtml(readiness) {
  const action = readiness.action || {};
  const actionAttr = action.clickTarget
    ? `data-click-target="${escapeHtml(action.clickTarget)}"`
    : action.scrollTarget
      ? `data-scroll-target="${escapeHtml(action.scrollTarget)}"`
      : "";
  return `
    <article class="schedule-readiness ${readiness.status}">
      <header>
        <div>
          <span>生成前状态</span>
          <strong>${escapeHtml(readiness.title)}</strong>
          <p>${escapeHtml(readiness.text)}</p>
        </div>
        <span class="tag ${scheduleReadinessTagClass(readiness.status)}">${scheduleReadinessLabel(readiness.status)}</span>
      </header>
      <div class="schedule-readiness-steps">
        ${readiness.items
          .map(
            (item) => `
              <button class="schedule-readiness-step ${item.state}" data-scroll-target="${escapeHtml(item.target)}" type="button">
                <span class="tag ${scheduleReadinessTagClass(item.state)}">${scheduleReadinessLabel(item.state)}</span>
                <strong>${escapeHtml(item.title)}</strong>
                <small>${escapeHtml(item.text)}</small>
              </button>
            `,
          )
          .join("")}
      </div>
      ${actionAttr ? `<button class="mini-button primary" ${actionAttr} type="button">${escapeHtml(action.label || "查看")}</button>` : ""}
    </article>
  `;
}

function schedulePrecheckListHtml(precheck) {
  const checks = precheck?.checks || [];
  if (!precheck) return `<div class="empty-state">排课配置加载后会自动执行预检。</div>`;
  if (!checks.length) return `<div class="empty-state">暂无预检结果。</div>`;
  const priority = { error: 0, warning: 1, ok: 2, info: 3 };
  return checks
    .slice()
    .sort((a, b) => (priority[a.severity] ?? 4) - (priority[b.severity] ?? 4))
    .map(scheduleDiagnosticItem)
    .join("");
}

function scheduleQualityHtml(draft) {
  const quality = draft.solver?.qualityReport;
  if (!quality) return "";
  const scoreClass = quality.score >= 90 ? "completed" : quality.score >= 75 ? "scheduled" : "exception";
  const deductions = (quality.deductions || []).filter((item) => item.impact > 0).slice(0, 6);
  const tension = quality.resourceTension || {};
  return `
    <article class="quality-report-card">
      <header>
        <div>
          <strong>排课质量评分 ${Number(quality.score || 0)}/${Number(quality.maxScore || 100)}</strong>
          <span>硬冲突 ${Number(quality.hardConflictCount || 0)} · 未满足偏好 ${Number(quality.unmetPreferenceCount || 0)} 条 · 扣分 ${Number(quality.totalDeduction || 0)}</span>
        </div>
        <span class="tag ${scoreClass}">${quality.score >= 90 ? "优秀" : quality.score >= 75 ? "可用" : "需优化"}</span>
      </header>
      <div class="quality-deduction-list">
        ${
          deductions.length
            ? deductions
                .map(
                  (item) => `
                    <div class="quality-deduction-item">
                      <strong>${escapeHtml(item.title)} <span>-${Number(item.impact || 0)}</span></strong>
                      <p>${escapeHtml(item.text || "")}</p>
                      ${qualityLessonRefsHtml(item.lessons || [])}
                    </div>
                  `,
                )
                .join("")
            : `<div class="quality-deduction-item"><strong>无明显扣分项</strong><p>当前课表满足主要偏好约束。</p></div>`
        }
      </div>
      ${qualityResourceTensionHtml(tension)}
    </article>
  `;
}

function qualityLessonRefsHtml(lessons = []) {
  const rows = lessons.slice(0, 3);
  return rows.length
    ? `<ul class="quality-lesson-ref-list">
        ${rows
          .map(
            (lesson) => `
              <li>${escapeHtml(lesson.className || "")} · ${escapeHtml(lesson.subjectName || "")} · ${escapeHtml(lesson.teacherName || "")} · ${escapeHtml(lesson.date || "")} 第 ${Number(lesson.period || 0)} 节</li>
            `,
          )
          .join("")}
      </ul>`
    : "";
}

function qualityResourceTensionHtml(tension = {}) {
  const teachers = tension.teachers || [];
  const rooms = tension.rooms || [];
  const candidateTasks = tension.candidateTasks || [];
  if (!teachers.length && !rooms.length && !candidateTasks.length) return "";
  const teacherHtml = teachers.length
    ? teachers
        .slice(0, 4)
        .map(
          (item) => `
            <li>
              <strong>${escapeHtml(item.teacherName)}</strong>
              <span>${Number(item.assignedLessons || 0)}/${Number(item.capacity || 0)} 节 · ${Number(item.utilization || 0)}%</span>
            </li>
          `,
        )
        .join("")
    : `<li><span>暂无紧张老师</span></li>`;
  const roomHtml = rooms.length
    ? rooms
        .slice(0, 4)
        .map(
          (item) => `
            <li>
              <strong>${escapeHtml(item.roomName)}</strong>
              <span>${escapeHtml(item.roomTypeName || "")} · ${Number(item.assignedLessons || 0)}/${Number(item.capacity || 0)} 节 · ${Number(item.utilization || 0)}%</span>
            </li>
          `,
        )
        .join("")
    : `<li><span>暂无紧张教室</span></li>`;
  const candidateHtml = candidateTasks.length
    ? candidateTasks
        .slice(0, 4)
        .map(
          (item) => `
            <li>
              <strong>${escapeHtml(item.className)} · ${escapeHtml(item.subjectName)}</strong>
              <span>${Number(item.candidateCount || 0)} 个候选 · ${escapeHtml(item.requiredRoomTypeName || "")} · 老师池 ${Number(item.teacherPoolSize || 0)}</span>
            </li>
          `,
        )
        .join("")
    : `<li><span>暂无候选紧张课程</span></li>`;
  return `
    <div class="quality-tension-grid" aria-label="排课资源紧张度">
      <section>
        <h4>紧张老师</h4>
        <ul>${teacherHtml}</ul>
      </section>
      <section>
        <h4>紧张教室</h4>
        <ul>${roomHtml}</ul>
      </section>
      <section>
        <h4>候选最少课程</h4>
        <ul>${candidateHtml}</ul>
      </section>
    </div>
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

function adminScheduleGrid(assignments, options = {}) {
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
                      <em data-schedule-drop-hint></em>
                    </div>
                    <div class="schedule-slot-content">
                      ${
                        periodAssignments.length
                          ? periodAssignments.map((assignment) => adminScheduleItem(assignment, options)).join("")
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

function adminScheduleItem(assignment, options = {}) {
  const canDrag =
    !options.readonly &&
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

  select.disabled = !lessons.length;
  select.innerHTML = lessons.length
    ? lessons
        .map(
          (lesson) => `
        <option value="${lesson.id}" ${lesson.id === state.scannerLessonId ? "selected" : ""}>
          ${formatDate(lesson.date)} ${lesson.time} · ${lesson.room} · ${lesson.className} · ${statusLabel[lesson.status]}
        </option>
      `,
        )
        .join("")
    : `<option value="">暂无课程任务</option>`;

  const lesson = lessons.find((item) => item.id === state.scannerLessonId);
  const lessonCard = document.querySelector("#scannerLessonCard");
  const startButton = document.querySelector("#startScanner");

  const scanIconSvg =
    '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M4 12h16"/></svg>';
  if (!lesson) {
    lessonCard.innerHTML = `<div class="empty-state">暂无可扫码处理的课时</div>`;
    if (startButton) {
      startButton.disabled = true;
      startButton.innerHTML = `${scanIconSvg}扫码签入`;
    }
  } else {
    const action = actionForLesson(lesson);
    if (startButton) {
      startButton.disabled = Boolean(qrScanner);
      startButton.innerHTML = `${scanIconSvg}扫码${escapeHtml(actionLabel(action))}`;
    }
    lessonCard.innerHTML = `
      <strong>${escapeHtml(actionLabel(action))} · ${escapeHtml(lesson.className)} · ${escapeHtml(lesson.course)}</strong>
      <div class="detail-grid">
        <div class="detail-cell"><span>上课时间</span>${escapeHtml(formatDate(lesson.date))} ${escapeHtml(lesson.time)}</div>
        <div class="detail-cell"><span>教室</span>${escapeHtml(lesson.room)}</div>
        <div class="detail-cell"><span>当前状态</span>${escapeHtml(statusLabel[lesson.status] || lesson.status)}</div>
        <div class="detail-cell"><span>扫码要求</span>扫描教室电脑实时二维码</div>
      </div>
    `;
  }

  document.querySelector("#scannerStatus").textContent = qrScanner ? "扫码中" : "待扫码";
  document.querySelector("#scannerStatus").className = qrScanner ? "status-pill done" : "status-pill";
  if (startButton && lesson) startButton.disabled = Boolean(qrScanner);
  // 停止按钮只在扫码进行中出现，避免闲置状态多余控件
  document.querySelector("#stopScanner").classList.toggle("is-hidden", !qrScanner);
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

  const localSalaryRows = salaryRows(teacherId);
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
    .join("") +
    `
      <div class="teacher-payroll-confirm-list">
        <h3>工资明细</h3>
        ${localSalaryRows
          .map(
            (row) => `
              <div class="workload-item payroll-line-item">
                <div>
                  <span>${escapeHtml(row.name)}</span>
                  <p class="muted">${escapeHtml(humanizePayrollBasis(row.basis))}</p>
                </div>
                <strong>${formatCurrency(row.amount)}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    `;

  document.querySelector("#confirmWorkload").disabled = stage > 0;
  document.querySelector("#submitPayrollDispute").disabled = stage > 0;
}

function renderBackendConfirmation() {
  const teacherId = currentTeacherId();
  const month = currentSettlementMonth();
  if (
    (!teacherWorkloadState.loaded && !teacherWorkloadState.loading) ||
    teacherWorkloadState.teacherId !== teacherId ||
    teacherWorkloadState.month !== month
  ) {
    loadBackendWorkload(teacherId, month);
  }
  ensureBackendTeacherPayroll(teacherId, month, { detail: true });
  const data =
    teacherWorkloadState.teacherId === teacherId && teacherWorkloadState.month === month
      ? teacherWorkloadState.data
      : null;
  const payroll =
    teacherPayrollState.teacherId === teacherId && teacherPayrollState.month === month && teacherPayrollState.detail
      ? teacherPayrollState.data
      : null;
  const payrollStatus = payroll?.generated?.status || "missing";
  const stage = payrollFlowStage(payrollStatus);
  const isLockedPayroll = payrollStatus === "locked";
  const confirmNote = document.querySelector("#confirmPayrollNote");
  const confirmStatus = document.querySelector("#confirmPayrollStatus");
  const confirmNet = document.querySelector("#confirmPayrollNet");
  const actionHint = document.querySelector("#teacherConfirmActionHint");

  if (payroll?.generated) {
    if (confirmNet) confirmNet.textContent = formatCurrency(payroll.netPay || 0);
    if (confirmStatus) {
      confirmStatus.textContent = payrollStatusLabel(payrollStatus);
      confirmStatus.className = isLockedPayroll ? "status-pill locked" : "status-pill done";
    }
    if (confirmNote) {
      confirmNote.textContent = isLockedPayroll
        ? "本月工资已锁定；未完成课次已按未计薪记录归档。"
        : "请核对本月工资明细，确认后财务才能进入锁定发放。";
    }
  }

  document.querySelector("#confirmSteps").innerHTML = confirmSteps
    .map((step, index) => {
      const completed = index === 0 ? Boolean(payroll?.generated) : index <= stage;
      const current =
        (index === 0 && !payroll?.generated) ||
        (index === 1 && payrollStatus === "generated") ||
        (index === 2 && ["teacher_confirmed", "disputed"].includes(payrollStatus)) ||
        (index === 3 && payrollStatus === "reviewed");
      return `
        <article class="confirm-step ${completed ? "active" : current ? "current" : ""}">
          <span>${step.label}</span>
          <strong>${step.title}</strong>
          <small>${completed ? "已完成" : current ? "当前步骤" : "待处理"}</small>
        </article>
      `;
    })
    .join("");

  const list = document.querySelector("#workloadList");
  if ((teacherWorkloadState.loading && !data) || (teacherPayrollState.loading && !payroll)) {
    list.innerHTML = `<div class="empty-state">正在读取本月工资确认单...</div>`;
  } else if (teacherWorkloadState.error || teacherPayrollState.error) {
    list.innerHTML = `<div class="empty-state">${teacherWorkloadState.error || teacherPayrollState.error}</div>`;
  } else if (!payroll?.generated) {
    list.innerHTML = `<div class="empty-state">财务尚未生成本月工资明细。生成后这里会展示完整工资确认单。</div>`;
  } else {
    const categories = data.categories || [];
    const summary = data.summary || {};
    const rows = normalizeSettlementRows(payroll.rows || []);
    const disputeReason = payroll.generated?.disputeReason || "";
    const stateNote = isLockedPayroll
      ? `
        <div class="payroll-confirm-state-note">
          <strong>本月工资已锁定</strong>
          <p>这里仍展示 ${summary.pendingCount || 0} 节未完成课次，是为了留痕说明这些课次未进入本月工资；老师不需要再确认或提交异议。如确需调整，请联系财务解锁重算。</p>
        </div>
      `
      : "";
    list.innerHTML =
      stateNote +
      [
      ...categories.map((category) => [category.label, `${category.units} 节`, "签入签出完成后计入月度工作量"]),
      [
        "待处理考勤",
        `${summary.pendingCount || 0} 节`,
        isLockedPayroll ? "已作为未计薪记录归档，不影响已锁定工资" : "未完成签入和签出，暂不计入工资",
      ],
      [
        "异常记录",
        `${summary.exceptionCount || 0} 条`,
        isLockedPayroll ? "已按锁定前处理结果归档留痕" : "异常课次不会进入本次工资，需财务处理后重算",
      ],
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
      .join("") +
      `
        <div class="teacher-payroll-confirm-list">
          <h3>工资明细</h3>
          ${rows
            .map(
              (row) => `
                <div class="workload-item payroll-line-item">
                  <div>
                    <span>${escapeHtml(row.name)}</span>
                    <p class="muted">${escapeHtml(humanizePayrollBasis(row.basis))}</p>
                  </div>
                  <strong>${formatCurrency(row.amount)}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
        ${
          disputeReason
            ? `<div class="empty-state dispute-note"><strong>已提交异议：</strong>${escapeHtml(disputeReason)}</div>`
            : ""
        }
      `;
  }

  setTeacherPayrollSupport(teacherId, payroll);
  const actionDisabled =
    payrollStatus !== "generated" || teacherPayrollState.loading || teacherWorkloadState.loading || Boolean(teacherPayrollState.error);
  document.querySelector("#confirmWorkload").disabled = actionDisabled;
  document.querySelector("#submitPayrollDispute").disabled = actionDisabled;
  if (actionHint) {
    if (payrollStatus === "missing") {
      actionHint.textContent = "财务尚未发布本月工资明细，暂不能确认。";
    } else if (payrollStatus === "generated") {
      actionHint.textContent = "请核对工资明细，确认无误后点击确认；如有问题可提交异议。";
    } else if (payrollStatus === "locked") {
      actionHint.textContent = "本月工资已锁定，当前页面只保留明细和未计薪记录供查看。";
    } else {
      actionHint.textContent = `当前状态：${payrollStatusLabel(payrollStatus)}，无需重复确认。`;
    }
  }
}

function setTeacherPayrollSupport(teacherId, payroll = null) {
  const lessons = teacherLessons(teacherId);
  const payableUnits = lessons
    .filter((lesson) => lesson.status === "completed")
    .reduce((sum, lesson) => sum + (lesson.units || 0), 0);
  const pendingCount = lessons.filter((lesson) => lesson.status === "pending" || lesson.status === "checkedIn").length;
  const payrollStatus = payroll?.generated?.status || "";
  const stage = payrollStatus ? payrollFlowStage(payrollStatus) : state.confirmationStages[teacherId] || 0;
  const supportPayableUnits = payroll?.workloadSummary?.payableUnits ?? payableUnits;
  const supportPendingCount = payroll?.workloadSummary?.pendingCount ?? pendingCount;
  const statusText = payrollStatus ? payrollStatusLabel(payrollStatus) : confirmationText(teacherId);
  const supportValues = [
    ["#teacherPayrollPayableUnits", `${supportPayableUnits} 节`],
    ["#teacherPayrollPendingUnits", `${supportPendingCount} 节`],
    ["#teacherPayrollConfirmState", statusText],
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
  const month = currentSettlementMonth();
  setTeacherPayrollSupport(teacherId);

  if (backendMode() && currentRole() === "teacher") {
    ensureBackendTeacherPayroll(teacherId, month);
    const isCurrent = teacherPayrollState.teacherId === teacherId && teacherPayrollState.month === month;
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

	    const backendPayrollStatus = payroll?.generated?.status || "";
	    const payrollStatus = payroll?.generated ? payrollStatusLabel(backendPayrollStatus) : "后端试算";
	    setTeacherPayrollSupport(teacherId, payroll);
	    setTeacherPayrollWidgets({
	      amountText: formatCurrency(payroll?.netPay || 0),
	      statusText: payrollStatus,
	      statusClass: backendPayrollStatus === "locked" ? "status-pill locked" : "status-pill done",
	      noteText:
	        backendPayrollStatus === "locked"
	          ? "本月工资已锁定，月度确认页保留明细和未计薪记录"
	          : "结算期到月度确认查看明细",
	      summaryText:
	        backendPayrollStatus === "locked"
	          ? "本月工资已锁定；未完成课次只作为未计薪留痕展示，不需要老师继续操作。"
	          : "老师端平时只展示月度汇总；财务生成工资后，请到“月度确认”查看完整工资明细并确认或提出异议。",
	    });
    return;
  }

  const salary = calculateSalary(teacherId);
	  setTeacherPayrollWidgets({
	    amountText: formatCurrency(salary.net),
	    statusText: settlementText(teacherId),
	    statusClass: "status-pill",
	    noteText: "结算期到月度确认查看明细",
	    summaryText: "老师端平时只展示月度汇总；结算期打开“月度确认”核对工资明细。",
	  });
}

function renderFinanceDashboard() {
  if (backendMode() && isFinanceRole()) {
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
    financeApiStatus.textContent = "试运行数据";
    financeApiStatus.className = "status-pill";
  }
  if (financePageInfo) {
    financePageInfo.textContent = `试运行数据 · 共 ${filteredTeachers.length} 位老师`;
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
  document.querySelector("#financeSettledCount").textContent = totals.locked || 0;
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
  if (backendMode() && isFinanceRole()) {
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

function selectedFinanceTeacherRecord(teacherId = state.selectedFinanceTeacherId) {
  return (
    financeTeacherPage.items.find((teacher) => teacher.id === teacherId) ||
    financeTeacherDetailState.payroll?.teacher ||
    teacherById(teacherId) ||
    null
  );
}

function settlementSalaryProfileSource(teacherId = state.selectedFinanceTeacherId, payroll = null) {
  const teacher = payroll?.teacher || selectedFinanceTeacherRecord(teacherId);
  if (!teacher && !payroll?.salaryProfile) return null;
  return {
    teacher,
    salaryProfile: payroll?.salaryProfile || teacher?.salaryProfile || {},
    // 带上明细行，供只读展示人事维护的事实（职称/学历/校龄/兼岗/考核）
    rows: payroll?.rows || payroll?.components || [],
  };
}

function backendConfirmationLabel(status = "", teacherId = "") {
  if (status) return payrollStatusLabel(status);
  return teacherId ? "工资待生成" : "未选择老师";
}

function confirmationStageValue(status = "", teacherId = "") {
  if (status) return payrollFlowStage(status);
  return teacherId ? state.confirmationStages[teacherId] || 0 : 0;
}

function settlementStepState({ complete = false, current = false, blocked = false } = {}) {
  if (complete) return "done";
  if (current) return "current";
  if (blocked) return "blocked";
  return "waiting";
}

function settlementStepHtml(index, title, text, stepState) {
  return `
    <article class="settlement-step ${stepState}">
      <span>${String(index).padStart(2, "0")}</span>
      <strong>${title}</strong>
      <p>${text}</p>
    </article>
  `;
}

function settlementNextActionText({ teacherId = "", payroll = null, confirmationStatus = "", loading = false, error = "" } = {}) {
  if (!teacherId) return "先选择一位老师，再查看本月工资快照和可执行动作。";
  if (loading) return "正在读取这位老师的工作量和薪资快照。";
  if (error) return error;
  const hasPayrollSnapshot = Boolean(payroll?.generated || (!backendMode() && payroll?.rows?.length));
  const hasPayrollPreview = Boolean(payroll?.rows?.length || payroll);
  const payrollStatus = payroll?.generated?.status || (hasPayrollPreview ? "preview" : "missing");
  if (!hasPayrollSnapshot) {
    return hasPayrollPreview
      ? "当前仅为后端试算明细，财务可先保存该老师工资草稿。"
      : "还没有本月工资明细，财务可先保存该老师工资草稿。";
  }
  if (payrollStatus === "saved") return "该老师工资已保存为财务草稿，统一发布本月工资后老师才会看到。";
  if (payrollStatus === "generated") return "工资明细已发布，等待老师确认或提出异议。";
  if (payrollStatus === "teacher_confirmed") return "老师已确认工资明细，财务可标记确认无误后锁定发放。";
  if (payrollStatus === "disputed") return "老师已提出异议，财务处理后可重新生成或标记异议已处理。";
  if (payrollStatus === "reviewed") return "财务已处理完成，可以锁定工资并进入发放口径。";
  if (payrollStatus === "locked") return "这位老师本月工资已锁定，老师端保留总薪资和确认记录。";
  return "薪资已试算，请按流程生成、老师确认、财务处理并锁定。";
}

function renderSettlementWorkspaceState({
  teacherId = state.selectedFinanceTeacherId,
  teacher = null,
  payroll = null,
  confirmationStatus = "",
  loading = false,
  error = "",
} = {}) {
  const teacherCard = document.querySelector("#settlementTeacherCard");
  const workflow = document.querySelector("#settlementWorkflowSteps");
  const nextAction = document.querySelector("#settlementNextAction");
  const listTeacher = selectedFinanceTeacherRecord(teacherId);
  const selectedTeacher = teacher || listTeacher;
  const hasPayrollSnapshot = Boolean(payroll?.generated || (!backendMode() && payroll?.rows?.length));
  const hasPayrollPreview = Boolean(payroll?.rows?.length || payroll);
  const payrollStatus = payroll?.generated?.status || (hasPayrollPreview ? "preview" : "missing");
  const confirmationLabel = backendConfirmationLabel(payrollStatus === "missing" || payrollStatus === "preview" ? "" : payrollStatus, teacherId);
  const confirmationStage = confirmationStageValue(payrollStatus === "missing" || payrollStatus === "preview" ? "" : payrollStatus, teacherId);
  const payrollLabel = hasPayrollSnapshot ? payrollStatusLabel(payrollStatus) : hasPayrollPreview ? "试算" : "未生成";
  const teacherDepartment = backendTeacherDepartment(selectedTeacher || listTeacher || {});
  const teacherGradeText =
    selectedTeacher?.gradeText ||
    listTeacher?.gradeText ||
    selectedTeacher?.grade ||
    listTeacher?.grade ||
    (financeTeacherPage.grade ? financeGradeLabel(financeTeacherPage.grade) : "年级未设置");
  const teacherSubject = backendTeacherSubject(selectedTeacher || listTeacher || {});
  const teacherMeta = selectedTeacher
    ? [teacherDepartment, teacherGradeText, teacherSubject, selectedTeacher.id || listTeacher?.id]
        .filter(Boolean)
        .join(" · ")
    : "";

  if (teacherCard) {
    teacherCard.innerHTML = teacherId
      ? `
        <div>
          <span>当前老师</span>
          <strong>${selectedTeacher?.name || teacherName(teacherId)}</strong>
          <small>${teacherMeta}</small>
        </div>
	        <div class="settlement-teacher-state">
	          <span class="tag ${payrollStatus === "disputed" ? "exception" : confirmationStage > 0 ? "completed" : "pending"}">${confirmationLabel}</span>
	          <span class="tag ${payrollStatus === "locked" ? "locked" : hasPayrollSnapshot ? "completed" : "pending"}">${payrollLabel}</span>
	        </div>
      `
      : `
        <div>
          <span>当前老师</span>
          <strong>请选择老师</strong>
          <small>支持按学部、年级、姓名、工号或手机号筛选</small>
        </div>
        <p>选择老师后查看工作量状态、薪资快照和可执行动作。</p>
      `;
  }

  if (nextAction) {
    nextAction.textContent = settlementNextActionText({
      teacherId,
      payroll,
      confirmationStatus,
      loading,
      error,
    });
  }

  if (workflow) {
		    const savedState = settlementStepState({
		      complete: hasPayrollSnapshot && payrollStatus !== "preview" && payrollStatus !== "missing",
		      current: Boolean(teacherId) && (!hasPayrollSnapshot || payrollStatus === "preview") && !loading,
		      blocked: !teacherId || loading || Boolean(error),
		    });
		    const publishState = settlementStepState({
		      complete: ["generated", "teacher_confirmed", "disputed", "reviewed", "locked"].includes(payrollStatus),
		      current: payrollStatus === "saved",
		      blocked: !hasPayrollSnapshot || payrollStatus === "preview" || loading || Boolean(error),
		    });
		    const reviewState = settlementStepState({
		      complete: ["reviewed", "locked"].includes(payrollStatus),
		      current: ["teacher_confirmed", "disputed"].includes(payrollStatus),
		      blocked: !hasPayrollSnapshot || ["saved", "generated"].includes(payrollStatus) || loading || Boolean(error),
		    });
    const lockState = settlementStepState({
      complete: payrollStatus === "locked",
      current: payrollStatus === "reviewed",
      blocked: payrollStatus !== "reviewed" || loading || Boolean(error),
    });
		    workflow.innerHTML = [
		      settlementStepHtml(1, "保存草稿", payrollStatus === "saved" ? "该老师工资已保存，待本月统一发布" : hasPayrollSnapshot ? "该老师工资快照已保存" : "核对工作量、津贴、奖扣和个税", savedState),
		      settlementStepHtml(2, "发布确认", ["teacher_confirmed", "reviewed", "locked"].includes(payrollStatus) ? "老师已确认工资明细" : payrollStatus === "disputed" ? "老师已提出异议" : payrollStatus === "generated" ? "已发布，等待老师确认" : "发布后老师端才可确认", publishState),
		      settlementStepHtml(3, "财务处理", ["reviewed", "locked"].includes(payrollStatus) ? "财务已处理完成" : "处理老师异议或确认无误", reviewState),
	      settlementStepHtml(4, "锁定发放", payrollStatus === "locked" ? "工资已锁定并可发放" : "锁定后老师端只看总薪资", lockState),
	    ].join("");
  }
}

const salaryQualificationLabels = {
  seniorProfessor: "正高",
  seniorTeacher: "高级",
  firstOrDoctor: "一级/博士",
  secondOrMaster: "二级/硕士",
  thirdOrBachelor: "三级/本科",
  ungradedOrJuniorCollege: "未评级/大专",
};

const salaryAssessmentLabels = {
  high: "高中专任",
  middle: "初中专任",
  primaryCoreHigh: "小学高段核心",
  primaryCoreLow: "小学低段核心",
  primarySpecial: "小学艺体信息心理",
};

const salaryHousingLabels = {
  chief: "首席",
  backboneOrGradeHead: "骨干/年级主任",
  teacher: "普通教师",
};

const salaryRoleLabels = {
  homeroom: "班主任",
  gradeHead: "年级主任",
  deputyGradeHead: "年级副主任",
  teachingResearchLeader: "教研组长",
  teachingResearchDeputy: "教研副组长",
  lessonPrepLeader: "备课组长",
  lessonPrepLargeGroup: "大备课组",
  lessonPrepDeputy: "备课副组长",
  subjectCenterDirector: "学科中心主任",
  graduateDegree: "研究生学历",
  graduatingClass: "毕业班",
  eliteClass: "特优班",
  qingbeiClass: "清北班",
  busDuty: "跟车老师",
  firstGrade: "一年级",
  doubleChinese: "双班语文",
  standardizedExam: "统考科目",
  olympiadHomeroom: "奥数班主任",
};

const salarySchemeMoneyGroups = [
  {
    title: "职称/学历档基本工资",
    description: "老师工资档案选择哪个职称/学历档，就命中这里对应的基本工资金额。",
    path: "baseSalaryByQualification",
    labels: salaryQualificationLabels,
  },
  {
    title: "考核工资档位",
    description: "老师工资档案中的考核档命中这里的固定考核工资。",
    path: "assessmentSalary",
    labels: salaryAssessmentLabels,
  },
  {
    title: "住房补贴档位",
    description: "老师工资档案中的住房档命中这里的住房补贴。",
    path: "housingAllowance",
    labels: salaryHousingLabels,
  },
  {
    title: "校龄工资阶梯",
    description: "按校龄年限取值，6 年及以上按 6 年档封顶。",
    path: "seniorityAllowance",
    labels: {
      1: "1 年",
      2: "2 年",
      3: "3 年",
      4: "4 年",
      5: "5 年",
      6: "6 年及以上",
    },
  },
];

const stageAllowanceGroups = [
  {
    stageId: "high",
    title: "高中部岗位津贴",
    fields: {
      gradeHead: "年级主任",
      deputyGradeHead: "年级副主任",
      homeroomPerStudent: "班主任每生",
      teachingResearchLeader: "教研组长",
      lessonPrepLeader: "备课组长",
      lessonPrepLargeGroup: "大备课组长",
      graduateDegree: "研究生学历",
      graduatingClass: "毕业班",
      eliteClass: "特优班",
      qingbeiClass: "清北班",
      busDuty: "跟车老师",
    },
  },
  {
    stageId: "middle",
    title: "初中部岗位津贴",
    fields: {
      gradeHead: "年级主任",
      deputyGradeHead: "年级副主任",
      subjectCenterDirector: "学科中心主任",
      lessonPrepLeader: "备课组长",
      homeroomPerStudent: "班主任每生",
      graduatingClass: "毕业班",
      busDuty: "跟车老师",
    },
  },
  {
    stageId: "primary",
    title: "小学部岗位津贴",
    fields: {
      gradeHead: "年级主任",
      teachingResearchLeader: "教研组长",
      teachingResearchDeputy: "教研副组长",
      lessonPrepHigh: "高段备课组长",
      lessonPrepLow: "低段备课组长",
      lessonPrepDeputy: "备课副组长",
      homeroomBase: "班主任固定",
      homeroomPerStudent: "班主任每生",
      firstGrade: "一年级",
      doubleChinese: "双班语文",
      graduatingClass: "毕业班",
      standardizedExam: "统考科目",
      olympiadHomeroom: "奥数班主任",
      busDuty: "跟车老师",
    },
  },
];

const stageLessonRuleGroups = [
  {
    title: "高中部课时与自习补贴",
    description: "高中正课、早晚自习、补课、周末课和代课的计薪标准。",
    fields: {
      "stageLessonRules.high.regularBaseRate": "正课基础/节",
      "stageLessonRules.high.regularExcessRate": "超课时/节",
      "stageLessonRules.high.morning": "早自习/节",
      "stageLessonRules.high.evening": "晚自习/节",
      "stageLessonRules.high.makeupByGrade.10": "高一补课/节",
      "stageLessonRules.high.makeupByGrade.11": "高二补课/节",
      "stageLessonRules.high.makeupByGrade.12": "高三补课/节",
      "stageLessonRules.high.weekendByGrade.10": "高一周末/节",
      "stageLessonRules.high.weekendByGrade.11": "高二周末/节",
      "stageLessonRules.high.weekendByGrade.12": "高三周末/节",
      "stageLessonRules.high.substitute": "代课/节",
    },
  },
  {
    title: "初中部课时与自习补贴",
    description: "初中正课、晚自习、活动课、补课、周末课和代课的计薪标准。",
    fields: {
      "stageLessonRules.middle.regularBaseRate": "正课基础/节",
      "stageLessonRules.middle.evening": "晚自习/节",
      "stageLessonRules.middle.activity": "活动课/节",
      "stageLessonRules.middle.makeupByGrade.7": "初一补课/节",
      "stageLessonRules.middle.makeupByGrade.8": "初二补课/节",
      "stageLessonRules.middle.makeupByGrade.9": "初三补课/节",
      "stageLessonRules.middle.weekendByGrade.7": "初一周末/节",
      "stageLessonRules.middle.weekendByGrade.8": "初二周末/节",
      "stageLessonRules.middle.weekendByGrade.9": "初三周末/节",
      "stageLessonRules.middle.substitute": "代课/节",
    },
  },
  {
    title: "小学部课时与自习补贴",
    description: "小学正课、晚自习、非正课、补课、周末课和代课的计薪标准。",
    fields: {
      "stageLessonRules.primary.regularBaseRate": "正课基础/节",
      "stageLessonRules.primary.evening": "晚自习/节",
      "stageLessonRules.primary.nonRegular": "非正课/节",
      "stageLessonRules.primary.makeup": "补课/节",
      "stageLessonRules.primary.weekend": "周末课/节",
      "stageLessonRules.primary.substitute": "代课/节",
    },
  },
];

function getNestedValue(source, pathValue, fallback = 0) {
  return String(pathValue)
    .split(".")
    .reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), source) ?? fallback;
}

function setNestedNumber(target, pathValue, value) {
  const keys = String(pathValue).split(".");
  let cursor = target;
  keys.slice(0, -1).forEach((key) => {
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key];
  });
  cursor[keys[keys.length - 1]] = Number(value || 0);
}

function schemeNumberInput(pathValue, label, value) {
  return `
    <label class="field-label">
      ${escapeHtml(label)}
      <input type="number" min="0" step="1" value="${Number(value || 0)}" data-scheme-path="${escapeHtml(pathValue)}" />
    </label>
  `;
}

function renderPayrollSchemeEditor(rules = {}) {
  const editor = document.querySelector("#payrollSchemeEditor");
  if (!editor) return;
  if (editor.contains(document.activeElement)) return;
  const scheme = rules.teacherSalaryScheme || {};
  const fixedGroups = salarySchemeMoneyGroups
    .map((group) => {
      const fields = Object.entries(group.labels)
        .map(([key, label]) => schemeNumberInput(`${group.path}.${key}`, label, getNestedValue(scheme, `${group.path}.${key}`, 0)))
        .join("");
      return `
        <section class="payroll-scheme-card">
          <div>
            <h4>${escapeHtml(group.title)}</h4>
            <p>${escapeHtml(group.description)}</p>
          </div>
          <div class="payroll-scheme-grid">${fields}</div>
        </section>
      `;
    })
    .join("");
  const allowanceGroups = stageAllowanceGroups
    .map((group) => {
      const fields = Object.entries(group.fields)
        .map(([key, label]) =>
          schemeNumberInput(`postAllowances.${group.stageId}.${key}`, label, getNestedValue(scheme, `postAllowances.${group.stageId}.${key}`, 0)),
        )
        .join("");
      return `
        <section class="payroll-scheme-card">
          <div>
            <h4>${escapeHtml(group.title)}</h4>
            <p>老师工资档案勾选对应岗位角色后，系统按这里的标准自动计算岗位津贴。</p>
          </div>
          <div class="payroll-scheme-grid">${fields}</div>
        </section>
      `;
    })
    .join("");
  const lessonRuleGroups = stageLessonRuleGroups
    .map((group) => {
      const fields = Object.entries(group.fields)
        .map(([pathValue, label]) => schemeNumberInput(pathValue, label, getNestedValue(scheme, pathValue, 0)))
        .join("");
      return `
        <section class="payroll-scheme-card">
          <div>
            <h4>${escapeHtml(group.title)}</h4>
            <p>${escapeHtml(group.description)}</p>
          </div>
          <div class="payroll-scheme-grid">${fields}</div>
        </section>
      `;
    })
    .join("");
  editor.innerHTML = `
    <div class="payroll-scheme-note">这些金额是全校统一规则，不需要先选择老师；老师个人命中哪个档位，在“薪资结算工作台”的教师工资档案里设置。</div>
    ${fixedGroups}
    ${lessonRuleGroups}
    ${allowanceGroups}
  `;
}

function applyPayrollSchemeEditorInputs(teacherSalaryScheme = {}) {
  const next = clone(teacherSalaryScheme || {});
  document.querySelectorAll("#payrollSchemeEditor [data-scheme-path]").forEach((input) => {
    setNestedNumber(next, input.dataset.schemePath, input.value);
  });
  return next;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function humanizePayrollBasis(basis = "") {
  const replacements = {
    ...salaryQualificationLabels,
    ...salaryAssessmentLabels,
    ...salaryHousingLabels,
  };
  return Object.entries(replacements)
    .sort((a, b) => b[0].length - a[0].length)
    .reduce((text, [key, label]) => {
      const pattern = new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(key)}(?=$|[^A-Za-z0-9_])`, "g");
      return text.replace(pattern, `$1${label}`);
    }, String(basis || ""));
}

function renderSettlement() {
  if (backendMode() && isFinanceRole()) {
    renderBackendSettlement();
    return;
  }

	  const select = document.querySelector("#settlementTeacherSelect");
		  renderFinanceTeacherFilters("settlement");
		  renderSettlementStatusBoard();
	  renderSettlementMonthProgress();
		  const teacherId = state.selectedFinanceTeacherId;
  const salary = calculateSalary(teacherId);
  const localRows = salaryRows(teacherId);
  const totals = settlementTotalsFromRows(localRows, { gross: salary.gross, tax: salary.tax, net: salary.net });
  const settlement = state.settlements[teacherId];
  const settled = settlement?.status === "settled";
  const status = document.querySelector("#settlementStatus");

  document.querySelector("#settlementGrossSalary").textContent = formatCurrency(totals.gross);
  document.querySelector("#settlementTaxSalary").textContent = formatCurrency(totals.tax);
  document.querySelector("#settlementNetSalary").textContent = formatCurrency(totals.net);
	  status.textContent = settled ? `已结算 ${settlement.settledAt}` : "未结算";
	  status.className = settled ? "status-pill locked" : "status-pill";
	  document.querySelector("#saveTeacherPayrollDraft").disabled = true;
	  document.querySelector("#settleTeacherPayroll").disabled = settled;
  document.querySelector("#reviewTeacherPayroll").disabled = true;
  document.querySelector("#batchGeneratePayroll").disabled = true;
  document.querySelector("#batchLockPayroll").disabled = true;
  document.querySelector("#exportPayrollCsv").disabled = true;
  document.querySelector("#unlockTeacherPayroll").disabled = true;
  document.querySelector("#settleTeacherPayrollHint").textContent = "";
  renderSettlementWorkspaceState({
    teacherId,
    teacher: teacherById(teacherId),
    payroll: {
      generated: settled ? { status: "locked" } : { status: "generated" },
      rows: normalizeSettlementRows(localRows),
    },
    confirmationStatus: settled ? "locked" : "",
  });
  renderSalaryProfilePanel({
    teacher: teacherById(teacherId),
    salaryProfile: teacherById(teacherId)?.salaryProfile || {},
  });
  document.querySelector("#settlementSalaryTable").innerHTML = settlementSalaryRowsHtml(localRows, totals);
}

function renderBackendSettlement() {
	  if (!financeTeacherPage.loaded && !financeTeacherPage.loading) {
	    loadFinanceTeacherPage();
	  }
		  renderFinanceTeacherFilters("settlement");
		  renderSettlementStatusBoard();
	  renderSettlementMonthProgress();
		  const teacherId = state.selectedFinanceTeacherId;
  if (!teacherId) {
    document.querySelector("#settlementGrossSalary").textContent = "¥0";
    document.querySelector("#settlementTaxSalary").textContent = "¥0";
    document.querySelector("#settlementNetSalary").textContent = "¥0";
	    document.querySelector("#settlementStatus").textContent = "当前筛选无老师";
	    document.querySelector("#settlementStatus").className = "status-pill warning";
	    document.querySelector("#saveTeacherPayrollDraft").disabled = true;
	    document.querySelector("#settleTeacherPayroll").disabled = true;
    document.querySelector("#reviewTeacherPayroll").disabled = true;
    document.querySelector("#batchGeneratePayroll").disabled = !isFinanceRole();
    document.querySelector("#batchLockPayroll").disabled = !isFinanceRole();
    document.querySelector("#exportPayrollCsv").disabled = !isFinanceRole();
    document.querySelector("#unlockTeacherPayroll").disabled = true;
    document.querySelector("#settleTeacherPayrollHint").textContent = "请先选择老师。";
    document.querySelector("#settlementSalaryTable").innerHTML = `<tr><td colspan="3"><div class="empty-state">当前筛选下暂无老师，请调整学部、年级或搜索条件。</div></td></tr>`;
    renderSettlementWorkspaceState({ teacherId: "", payroll: null });
    renderSalaryProfilePanel(null);
    return;
  }
  ensureFinanceTeacherDetail(teacherId, { generatePayroll: false });

  const detail =
    financeTeacherDetailState.teacherId === teacherId && financeTeacherDetailState.loaded
      ? financeTeacherDetailState
      : null;
  const payroll = detail?.payroll;
	  const status = document.querySelector("#settlementStatus");
	  const saveButton = document.querySelector("#saveTeacherPayrollDraft");
	  const button = document.querySelector("#settleTeacherPayroll");
  const reviewButton = document.querySelector("#reviewTeacherPayroll");
  const batchButton = document.querySelector("#batchGeneratePayroll");
  const batchLockButton = document.querySelector("#batchLockPayroll");
  const exportButton = document.querySelector("#exportPayrollCsv");
  const unlockButton = document.querySelector("#unlockTeacherPayroll");
  const lockHint = document.querySelector("#settleTeacherPayrollHint");
  const table = document.querySelector("#settlementSalaryTable");

  if (financeTeacherDetailState.loading && !payroll) {
    document.querySelector("#settlementGrossSalary").textContent = "读取中";
    document.querySelector("#settlementTaxSalary").textContent = "读取中";
    document.querySelector("#settlementNetSalary").textContent = "读取中";
	    status.textContent = "正在读取薪资明细";
	    status.className = "status-pill";
	    saveButton.disabled = true;
	    button.disabled = true;
    reviewButton.disabled = true;
    batchButton.disabled = true;
    batchLockButton.disabled = true;
    exportButton.disabled = true;
    unlockButton.disabled = true;
    if (lockHint) lockHint.textContent = "薪资明细读取中。";
    table.innerHTML = `<tr><td colspan="3"><div class="empty-state">正在从后端读取该老师薪资明细...</div></td></tr>`;
    renderSettlementWorkspaceState({
      teacherId,
      teacher: selectedFinanceTeacherRecord(teacherId),
      payroll,
      loading: true,
    });
    renderSalaryProfilePanel(null);
    return;
  }

  if (financeTeacherDetailState.error) {
    const blockerRows = payrollLockBlockersTableRows(financeTeacherDetailState.lockBlockers || []);
    document.querySelector("#settlementGrossSalary").textContent = "¥0";
    document.querySelector("#settlementTaxSalary").textContent = "¥0";
    document.querySelector("#settlementNetSalary").textContent = "¥0";
	    status.textContent = financeTeacherDetailState.error;
	    status.className = "status-pill warning";
	    saveButton.disabled = !isFinanceRole();
	    button.disabled = true;
    reviewButton.disabled = true;
    batchButton.disabled = false;
    batchLockButton.disabled = false;
    exportButton.disabled = false;
    unlockButton.disabled = true;
    if (lockHint) lockHint.textContent = "当前老师详情异常，不能锁定。";
    table.innerHTML = `<tr><td colspan="3"><div class="empty-state">${financeTeacherDetailState.error}</div></td></tr>${blockerRows}`;
    renderSettlementWorkspaceState({
      teacherId,
      teacher: selectedFinanceTeacherRecord(teacherId),
      payroll: null,
      error: financeTeacherDetailState.error,
    });
    renderSalaryProfilePanel(settlementSalaryProfileSource(teacherId, null));
    return;
  }

  if (!payroll) {
    document.querySelector("#settlementGrossSalary").textContent = "¥0";
    document.querySelector("#settlementTaxSalary").textContent = "¥0";
    document.querySelector("#settlementNetSalary").textContent = "¥0";
	    status.textContent = "暂无薪资明细";
	    status.className = "status-pill";
	    saveButton.disabled = !isFinanceRole();
	    button.disabled = true;
    reviewButton.disabled = true;
    batchButton.disabled = false;
    batchLockButton.disabled = false;
    exportButton.disabled = false;
    unlockButton.disabled = true;
    if (lockHint) lockHint.textContent = "请先保存或发布该老师工资明细。";
	    table.innerHTML = `<tr><td colspan="3"><div class="empty-state">暂无该老师薪资明细，可先保存该老师工资草稿。</div></td></tr>`;
    renderSettlementWorkspaceState({
      teacherId,
      teacher: selectedFinanceTeacherRecord(teacherId),
      payroll: null,
      confirmationStatus: financeTeacherDetailState.workload?.confirmation?.status || "",
    });
    renderSalaryProfilePanel(settlementSalaryProfileSource(teacherId, null));
    return;
  }

  const totals = settlementTotalsFromRows(payroll.rows || [], {
    gross: payroll.grossPay || 0,
    tax: payroll.tax || 0,
    net: payroll.netPay || 0,
  });
  document.querySelector("#settlementGrossSalary").textContent = formatCurrency(totals.gross);
  document.querySelector("#settlementTaxSalary").textContent = formatCurrency(totals.tax);
  document.querySelector("#settlementNetSalary").textContent = formatCurrency(totals.net);
	  const payrollStatus = payroll.generated?.status || "preview";
  const lockBlockers = payroll.lockBlockers || financeTeacherDetailState.lockBlockers || [];
  const hasLockBlockers = payrollStatus === "reviewed" && lockBlockers.length > 0;
	  status.textContent = payroll.generated
	    ? `${payrollStatusLabel(payrollStatus)} ${payroll.generated.lockedAt?.slice(0, 10) || payroll.generated.reviewedAt?.slice(0, 10) || payroll.generated.teacherConfirmedAt?.slice(0, 10) || payroll.generated.disputedAt?.slice(0, 10) || payroll.generated.publishedAt?.slice(0, 10) || payroll.generated.savedAt?.slice(0, 10) || payroll.generated.generatedAt?.slice(0, 10) || ""}`
	    : "后端试算";
	  status.className = payrollStatus === "locked" ? "status-pill locked" : "status-pill done";
	  saveButton.disabled =
	    financeTeacherDetailState.loading ||
	    !isFinanceRole() ||
	    ["teacher_confirmed", "disputed", "reviewed", "locked"].includes(payrollStatus);
  reviewButton.disabled =
    financeTeacherDetailState.loading || !isFinanceRole() || !["teacher_confirmed", "disputed"].includes(payrollStatus);
  button.disabled = financeTeacherDetailState.loading || !isFinanceRole() || payrollStatus !== "reviewed" || hasLockBlockers;
  button.title = hasLockBlockers ? `还有 ${lockBlockers.length} 条待处理/异常课次，处理后才能锁定` : "";
  batchButton.disabled = financeTeacherDetailState.loading || !isFinanceRole();
  batchLockButton.disabled = financeTeacherDetailState.loading || !isFinanceRole();
  exportButton.disabled = financeTeacherDetailState.loading || !isFinanceRole();
  unlockButton.disabled = financeTeacherDetailState.loading || !isFinanceRole() || payrollStatus !== "locked";
  if (lockHint) {
    if (hasLockBlockers) {
      lockHint.textContent = `不能锁定：仍有 ${lockBlockers.length} 条待处理或异常课次，请先处理后重新生成/复核。`;
    } else if (payrollStatus === "reviewed") {
      lockHint.textContent = "该老师工资已满足锁定条件。";
    } else if (payrollStatus === "locked") {
      lockHint.textContent = "该老师本月工资已锁定，如需调整请先解锁重算。";
    } else {
      lockHint.textContent = "需老师确认并由财务处理完成后，才能锁定。";
    }
  }
  renderSettlementWorkspaceState({
    teacherId,
    teacher: payroll.teacher || selectedFinanceTeacherRecord(teacherId),
    payroll,
    confirmationStatus: payrollStatus,
    loading: financeTeacherDetailState.loading,
  });
  renderSalaryProfilePanel(settlementSalaryProfileSource(teacherId, payroll));
  table.innerHTML =
    settlementSalaryRowsHtml(payroll.rows || [], totals) +
    (payrollStatus === "reviewed" ? payrollLockBlockersTableRows(lockBlockers) : "");
}

function renderPayrollHistoryControls() {
  const termSelect = document.querySelector("#payrollHistoryTermSelect");
  const monthSelect = document.querySelector("#payrollHistoryMonthSelect");
  if (!termSelect || !monthSelect) return;
  const terms = termManagementState.terms.length
    ? termManagementState.terms
    : termManagementState.currentTerm
      ? [termManagementState.currentTerm]
      : [];
  if (!terms.length) {
    termSelect.innerHTML = `<option value="">暂无学期</option>`;
    monthSelect.innerHTML = `<option value="">暂无月份</option>`;
    return;
  }
  termSelect.innerHTML = terms
    .map(
      (term) => `
        <option value="${escapeHtml(term.id)}">${escapeHtml(term.name)} · ${escapeHtml(term.startDate)} 至 ${escapeHtml(term.endDate)}</option>
      `,
    )
    .join("");
  termSelect.value = payrollHistoryState.termId || terms[0].id;
  const term = payrollHistorySelectedTerm() || terms[0];
  const months = monthKeysBetween(term.startDate, term.endDate);
  monthSelect.innerHTML = months
    .map((month) => `<option value="${escapeHtml(month)}">${escapeHtml(formatMonthLabel(month))}</option>`)
    .join("");
  monthSelect.value = months.includes(payrollHistoryState.month) ? payrollHistoryState.month : months[0] || "";
}

function renderPayrollHistorySummary(data = null) {
  const summary = data?.summary || {};
  document.querySelector("#payrollHistoryPaidNet").textContent = formatCurrency(summary.paidNetPay || 0);
  document.querySelector("#payrollHistoryPaidGross").textContent = formatCurrency(summary.paidGrossPay || 0);
  document.querySelector("#payrollHistoryPaidTax").textContent = formatCurrency(summary.paidTax || 0);
  document.querySelector("#payrollHistoryCount").textContent = `${summary.lockedCount || 0} / ${summary.totalCount || 0}`;
  const note = document.querySelector("#payrollHistoryNote");
  if (payrollHistoryState.loading) {
    note.textContent = "正在读取历史工资记录...";
    return;
  }
  if (payrollHistoryState.error) {
    note.textContent = payrollHistoryState.error;
    return;
  }
  if (!data) {
    note.textContent = "选择学期和月份后查看工资记录。";
    return;
  }
  const counts = summary.statusCounts || {};
  note.textContent = `${data.term?.name || "当前学期"} · ${formatMonthLabel(data.month)}：已锁定 ${counts.locked || 0} 份，待确认/处理中 ${Math.max((summary.totalCount || 0) - (counts.locked || 0), 0)} 份。`;
}

function renderPayrollHistoryTable(data = null) {
  const table = document.querySelector("#payrollHistoryTable");
  if (!table) return;
  if (payrollHistoryState.loading && !data) {
    table.innerHTML = `<tr><td colspan="9"><div class="empty-state">正在读取该月份工资记录...</div></td></tr>`;
    return;
  }
  if (payrollHistoryState.error) {
    table.innerHTML = `<tr><td colspan="9"><div class="empty-state">${escapeHtml(payrollHistoryState.error)}</div></td></tr>`;
    return;
  }
  const items = data?.items || [];
  if (!items.length) {
    table.innerHTML = `<tr><td colspan="9"><div class="empty-state">该学期月份暂无工资快照。先在“薪资结算”生成并锁定工资后，这里会形成历史记录。</div></td></tr>`;
    return;
  }
  table.innerHTML = items
    .map(
      (item) => `
        <tr>
          <td data-label="工号">${escapeHtml(item.employeeNo || item.teacherId)}</td>
          <td data-label="老师"><strong>${escapeHtml(item.teacherName)}</strong></td>
          <td data-label="学部/年级">${escapeHtml(item.stageName || "-")} · ${escapeHtml(item.gradeText || "-")}</td>
          <td data-label="科目">${escapeHtml(item.subjectName || "-")}</td>
          <td data-label="状态">${payrollStatusTag(item.status)}</td>
          <td data-label="应发">${formatCurrency(item.grossPay || 0)}</td>
          <td data-label="个税">${formatCurrency(item.tax || 0)}</td>
          <td data-label="实发"><strong>${formatCurrency(item.netPay || 0)}</strong></td>
          <td data-label="锁定时间">${escapeHtml(item.lockedAt ? item.lockedAt.slice(0, 10) : "未锁定")}</td>
        </tr>
      `,
    )
    .join("");
}

function renderPayrollHistory() {
  if (!isFinanceRole()) return;
  if (!backendMode()) {
    renderPayrollHistoryControls();
    renderPayrollHistorySummary(null);
    document.querySelector("#payrollHistoryNote").textContent = "本地演示模式暂不生成历史工资库，请使用后端模式查看。";
    document.querySelector("#payrollHistoryTable").innerHTML = `<tr><td colspan="9"><div class="empty-state">后端开启后可按学期和月份查询历史工资。</div></td></tr>`;
    document.querySelector("#exportPayrollHistoryCsv").disabled = true;
    return;
  }
  if (!termManagementState.loaded && !termManagementState.loading) {
    loadTermContext().then(() => {
      ensurePayrollHistorySelection();
      loadPayrollHistory();
    });
  }
  ensurePayrollHistorySelection();
  renderPayrollHistoryControls();
  const needsLoad =
    payrollHistoryState.termId &&
    payrollHistoryState.month &&
    !payrollHistoryState.loading &&
    (!payrollHistoryState.loaded ||
      payrollHistoryState.loadedTermId !== payrollHistoryState.termId ||
      payrollHistoryState.loadedMonth !== payrollHistoryState.month);
  if (needsLoad) {
    loadPayrollHistory();
  }
  const data =
    payrollHistoryState.loadedTermId === payrollHistoryState.termId &&
    payrollHistoryState.loadedMonth === payrollHistoryState.month
      ? payrollHistoryState.data
      : null;
  renderPayrollHistorySummary(data);
  renderPayrollHistoryTable(data);
  document.querySelector("#exportPayrollHistoryCsv").disabled =
    payrollHistoryState.loading || !payrollHistoryState.termId || !payrollHistoryState.month;
}

function renderPayrollConfig() {
  if (!isFinanceRole()) return;
  if (!payrollRuleState.loaded && !payrollRuleState.loading) {
    loadPayrollRules();
  }
  renderPayrollRulesPanel();
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
  const schemeInput = document.querySelector("#ruleTeacherSchemeJson");
  if (schemeInput && document.activeElement !== schemeInput) {
    schemeInput.value = JSON.stringify(rules.teacherSalaryScheme || {}, null, 2);
  }
  renderPayrollSchemeEditor(rules);
  const saveButton = document.querySelector("#savePayrollRules");
  if (saveButton) {
    saveButton.disabled = payrollRuleState.loading || !backendMode() || !isFinanceRole();
    saveButton.textContent = payrollRuleState.loading ? "保存中" : "保存规则";
  }
}

function setInputValue(selector, value) {
  const input = document.querySelector(selector);
  if (input && document.activeElement !== input) input.value = value ?? "";
}

function setCheckboxValue(selector, value) {
  const input = document.querySelector(selector);
  if (input) input.checked = Boolean(value);
}

function salaryManualCategoryLabel(category) {
  if (category === "attendanceDeduction") return "考勤扣减";
  return category === "deduction" ? "其他扣减" : "奖励/补发";
}

function salaryManualItemIsDeduction(item = {}) {
  return ["deduction", "attendanceDeduction"].includes(item.category) || Number(item.amount || 0) < 0;
}

function salaryProfileEditContextAllowsInput() {
  return Boolean(
    salaryProfileEditMode &&
      backendMode() &&
      isFinanceRole() &&
      state.selectedFinanceTeacherId &&
      !financeTeacherDetailState.loading,
  );
}

function monthlyAdjustmentContextAllowsInput(profile = null) {
  const hasProfile = Boolean(profile && typeof profile === "object");
  return Boolean(
    backendMode() &&
      isFinanceRole() &&
      state.selectedFinanceTeacherId &&
      hasProfile &&
      !financeTeacherDetailState.loading,
  );
}

function canEditSalaryProfile(profile = null) {
  return Boolean(salaryProfileEditContextAllowsInput() && profile);
}

function syncSalaryProfileEditState(profile) {
  const panel = document.querySelector(".settlement-profile-panel");
  const saveButton = document.querySelector("#saveTeacherSalaryProfile");
  const cancelButton = document.querySelector("#cancelTeacherSalaryProfileEdit");
  const editable = canEditSalaryProfile(profile);
  const hasProfile = Boolean(profile);

  if (panel) {
    panel.classList.toggle("is-editing", editable);
    panel.classList.toggle("is-readonly", !editable);
  }
  if (saveButton) {
    saveButton.disabled = !backendMode() || !isFinanceRole() || !hasProfile || financeTeacherDetailState.loading;
    saveButton.textContent = financeTeacherDetailState.loading
      ? "保存中"
      : salaryProfileEditMode && hasProfile
        ? "保存学期档案"
        : "编辑档案";
  }
  if (cancelButton) {
    cancelButton.hidden = !editable;
    cancelButton.disabled = financeTeacherDetailState.loading;
  }

  ["#salaryAssessmentBand", "#salaryHousingTier"].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.disabled = !editable;
  });

  [
    "#salaryRoleHomeroom",
    "#salaryRoleGradeHead",
    "#salaryRoleDeputyGradeHead",
    "#salaryRoleTeachingResearchLeader",
    "#salaryRoleLessonPrepLeader",
    "#salaryRoleGraduatingClass",
    "#salaryRoleEliteClass",
    "#salaryRoleQingbeiClass",
    "#salaryRoleBusDuty",
  ].forEach((selector) => {
    const input = document.querySelector(selector);
    if (input) input.disabled = !editable;
  });

  const canEditMonthlyAdjustment = monthlyAdjustmentContextAllowsInput(profile);
  [
    "#salaryManualItemsJson",
    "#salaryManualItemName",
    "#salaryManualItemCategory",
    "#salaryManualItemAmount",
    "#salaryManualItemBasis",
    "#addSalaryManualItem",
    "#saveSalaryManualItems",
  ].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.disabled = !canEditMonthlyAdjustment;
  });

}

function renderSalaryProfilePanel(payroll) {
  const profile = payroll?.teacher?.salaryProfile || payroll?.salaryProfile || null;
  salaryProfilePanelCurrentProfile = profile;

  // 人事维护的事实只读展示：让财务看得到依据，但改不了
  renderSalaryHrFacts(payroll);

  if (!profile) {
    ["#salaryAssessmentBand", "#salaryHousingTier", "#salaryProbationRate", "#salaryManualItemsJson"].forEach(
      (selector) => setInputValue(selector, selector === "#salaryManualItemsJson" ? "[]" : ""),
    );
    renderSalaryManualItemsEditor([]);
    syncSalaryProfileEditState(null);
    return;
  }

  setInputValue("#salaryAssessmentBand", profile.assessmentBand || "high");
  setInputValue("#salaryHousingTier", profile.housingTier || "teacher");
  setInputValue("#salaryProbationRate", profile.probationRate ?? 1);
  setInputValue("#salaryManualItemsJson", JSON.stringify(profile.manualItems || [], null, 2));
  renderSalaryManualItemsEditor(profile.manualItems || []);
  syncSalaryProfileEditState(profile);
}

// 从工资单反推人事事实并展示（数据源是人事档案，财务侧只读）
const SALARY_HR_FACT_ROWS = [
  { name: "基本工资", label: "职称档", from: "basis" },
  { name: "学历补贴", label: "学历", from: "basis" },
  { name: "校龄工资", label: "校龄", from: "basis" },
];

function renderSalaryHrFacts(payroll) {
  const grid = document.querySelector("#salaryHrFactsGrid");
  if (!grid) return;
  // 工资明细在不同调用处分别以 components / rows / payroll.rows 提供，统一取用
  const components =
    payroll?.components || payroll?.rows || payroll?.payroll?.rows || payroll?.payroll?.components || [];
  if (!components.length) {
    grid.innerHTML = `<span class="hr-owned-empty">选择老师后显示</span>`;
    return;
  }
  const rows = SALARY_HR_FACT_ROWS.map((row) => {
    const component = components.find((item) => item.name === row.name);
    if (!component) return "";
    return `
      <div class="hr-owned-row">
        <span>${escapeHtml(row.label)}</span>
        <strong>${escapeHtml(component.basis)}</strong>
        <em>${formatCurrency(component.amount)}</em>
      </div>
    `;
  }).join("");
  // 兼岗津贴逐项列出，来源同样是人事的任命
  const allowanceRows = components
    .filter((item) => item.category === "allowance" && item.name !== "住房补贴")
    .map(
      (item) => `
        <div class="hr-owned-row">
          <span>兼岗</span>
          <strong>${escapeHtml(item.name)}：${escapeHtml(item.basis)}</strong>
          <em>${formatCurrency(item.amount)}</em>
        </div>
      `,
    )
    .join("");
  const assessment = components.find((item) => item.name === "考核工资");
  const assessmentRow = assessment
    ? `
      <div class="hr-owned-row">
        <span>本月考核</span>
        <strong>${escapeHtml(assessment.basis)}</strong>
        <em>${formatCurrency(assessment.amount)}</em>
      </div>
    `
    : "";
  grid.innerHTML = rows + assessmentRow + allowanceRows || `<span class="hr-owned-empty">暂无数据</span>`;
}

function currentSalaryManualItemsFromInput() {
  const input = document.querySelector("#salaryManualItemsJson");
  if (!input?.value?.trim()) return [];
  try {
    const parsed = JSON.parse(input.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeSalaryManualItems(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const category = item.category === "attendanceDeduction"
        ? "attendanceDeduction"
        : item.category === "deduction" || Number(item.amount || 0) < 0
          ? "deduction"
          : "supplement";
      const isDeduction = ["deduction", "attendanceDeduction"].includes(category);
      return {
        name: String(item.name || "").trim(),
        amount: isDeduction ? -Math.abs(Number(item.amount || 0)) : Math.abs(Number(item.amount || 0)),
        basis: String(item.basis || "").trim(),
        category,
      };
    })
    .filter((item) => item.name && item.amount);
}

function salaryManualItemsFromInput() {
  const input = document.querySelector("#salaryManualItemsJson");
  if (!input?.value?.trim()) return [];
  try {
    const parsed = JSON.parse(input.value);
    if (!Array.isArray(parsed)) throw new Error("本月奖扣必须是数组");
    return normalizeSalaryManualItems(parsed);
  } catch (error) {
    throw new Error(`本月奖扣数据异常：${error.message}`);
  }
}

function setSalaryManualItems(items = []) {
  const normalizedItems = normalizeSalaryManualItems(items);
  const input = document.querySelector("#salaryManualItemsJson");
  if (input) input.value = JSON.stringify(normalizedItems, null, 2);
  renderSalaryManualItemsEditor(normalizedItems);
}

function renderSalaryManualItemsEditor(items = currentSalaryManualItemsFromInput()) {
  const list = document.querySelector("#salaryManualItemsList");
  if (!list) return;
  if (!items.length) {
    list.innerHTML = `<div class="empty-state">暂无特殊奖扣。常规岗位津贴请通过岗位角色和规则自动计算。</div>`;
    return;
  }
  list.innerHTML = items
    .map(
      (item, index) => {
        const isDeduction = salaryManualItemIsDeduction(item);
        return `
        <article class="manual-item-row">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${salaryManualCategoryLabel(item.category)} · ${escapeHtml(item.basis || "未填写说明")}</span>
          </div>
          <strong class="${isDeduction ? "deduction" : "supplement"}">
            ${isDeduction ? "-" : "+"}${formatCurrency(Math.abs(Number(item.amount || 0)))}
          </strong>
          <button class="mini-button danger" data-remove-manual-item="${index}" type="button" ${monthlyAdjustmentContextAllowsInput(salaryProfilePanelCurrentProfile) ? "" : "disabled"}>删除</button>
        </article>
      `;
      },
    )
    .join("");
}

function addSalaryManualItemFromInputs() {
  const nameInput = document.querySelector("#salaryManualItemName");
  const categoryInput = document.querySelector("#salaryManualItemCategory");
  const amountInput = document.querySelector("#salaryManualItemAmount");
  const basisInput = document.querySelector("#salaryManualItemBasis");
  const name = nameInput?.value.trim() || "";
  const amount = Number(amountInput?.value || 0);
  const category = categoryInput?.value === "attendanceDeduction"
    ? "attendanceDeduction"
    : categoryInput?.value === "deduction"
      ? "deduction"
      : "supplement";
  const basis = basisInput?.value.trim() || "";
  if (!monthlyAdjustmentContextAllowsInput(salaryProfilePanelCurrentProfile)) {
    showToast("当前无法维护本月特殊奖扣，请先选择老师并等待薪资信息加载完成");
    return;
  }
  if (!name || amount <= 0) {
    showToast("请填写奖扣名称和大于 0 的金额");
    return;
  }
  const signedAmount = category === "supplement" ? Math.abs(amount) : -Math.abs(amount);
  setSalaryManualItems([
    ...currentSalaryManualItemsFromInput(),
    {
      name,
      amount: signedAmount,
      basis: basis || (category === "attendanceDeduction" ? "本月考勤扣减" : "财务特殊奖扣项"),
      category,
    },
  ]);
  if (nameInput) nameInput.value = "";
  if (amountInput) amountInput.value = "";
  if (basisInput) basisInput.value = "";
}

function removeSalaryManualItem(index) {
  if (!monthlyAdjustmentContextAllowsInput(salaryProfilePanelCurrentProfile)) {
    showToast("当前无法删除本月特殊奖扣，请先选择老师并等待薪资信息加载完成");
    return;
  }
  const items = currentSalaryManualItemsFromInput();
  items.splice(index, 1);
  setSalaryManualItems(items);
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

function backendWarningItems({ records = [], workload = null, payroll = null } = {}) {
  const items = [];
  const seen = new Set();
  const addItem = (item) => {
    const key = item.key || `${item.type}-${item.lessonId || item.title}-${item.detail}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  records
    .filter((record) => record.status !== "accepted")
    .forEach((record) => {
      addItem({
        key: `record-${record.id || record.lessonId || `${record.date}-${record.time}-${record.actionLabel}`}`,
        type: record.status === "exception" ? "exception" : "rejected",
        title: `${record.actionLabel || "扫码"} · ${record.className || "未匹配课次"}`,
        tag: record.status === "exception" ? "异常" : "拦截",
        detail: `${formatDate(record.date)} ${record.time || ""} · ${record.room || "未知教室"} · ${record.resultText || "需要复核"}`,
      });
    });

  (workload?.pendingLines || []).forEach((line) => {
    addItem({
      key: `pending-${line.lessonId}`,
      type: "pending",
      lessonId: line.lessonId,
      title: `${line.className || "未设置班级"} · ${line.subjectName || "未设置课程"}`,
      tag: "待处理",
      detail: `${formatDate(line.date)} ${line.time || ""} · ${line.room || "未设置教室"} · 未完成签入/签出，暂不计入工资`,
    });
  });

  (workload?.exceptionLines || []).forEach((line) => {
    addItem({
      key: `exception-line-${line.lessonId}`,
      type: "exception",
      lessonId: line.lessonId,
      title: `${line.className || "未设置班级"} · ${line.subjectName || "未设置课程"}`,
      tag: "异常",
      detail: `${formatDate(line.date)} ${line.time || ""} · ${line.room || "未设置教室"} · ${line.note || "异常课次需处理后重算"}`,
    });
  });

  (payroll?.lockBlockers || []).forEach((blocker) => {
    addItem({
      key: `blocker-${blocker.lessonId || `${blocker.date}-${blocker.time}-${blocker.reason}`}`,
      type: blocker.type === "exception" ? "exception" : "pending",
      lessonId: blocker.lessonId,
      title: `${blocker.className || "未设置班级"} · ${blocker.subjectName || "未设置课程"}`,
      tag: blocker.type === "exception" ? "异常" : "待处理",
      detail: `${formatDate(blocker.date)} ${blocker.time || ""} · ${blocker.room || "未设置教室"} · ${blocker.reason || "锁定前需处理"}`,
    });
  });

  return items.sort((a, b) => {
    const typeWeight = { exception: 0, rejected: 1, pending: 2 };
    return (typeWeight[a.type] ?? 9) - (typeWeight[b.type] ?? 9) || a.detail.localeCompare(b.detail);
  });
}

function renderBackendWarnings() {
  const role = currentRole();
  const teacherId = role === "teacher" ? currentTeacherId() : state.selectedFinanceTeacherId;
  const month = currentSettlementMonth();
  document.querySelector("#warningsTitle").textContent = role === "teacher" ? "我的异常与待处理课次" : "老师异常与锁定阻断";

  const list = document.querySelector("#warningList");
  if (!teacherId) {
    list.innerHTML = `<div class="empty-state">请先选择老师后查看异常和待处理课次。</div>`;
    return;
  }

  ensureBackendAttendanceRecords(teacherId, month);
  if (role === "teacher") {
    if (
      (!teacherWorkloadState.loaded && !teacherWorkloadState.loading) ||
      teacherWorkloadState.teacherId !== teacherId ||
      teacherWorkloadState.month !== month
    ) {
      loadBackendWorkload(teacherId, month);
    }
    ensureBackendTeacherPayroll(teacherId, month, { detail: true });
  } else if (isFinanceRole()) {
    ensureFinanceTeacherDetail(teacherId, { generatePayroll: false });
  }

  const attendanceCurrent = attendanceRecordState.teacherId === teacherId && attendanceRecordState.month === month;
  const teacherWorkloadCurrent = teacherWorkloadState.teacherId === teacherId && teacherWorkloadState.month === month;
  const teacherPayrollCurrent =
    teacherPayrollState.teacherId === teacherId && teacherPayrollState.month === month && teacherPayrollState.detail;
  const financeDetailCurrent =
    financeTeacherDetailState.teacherId === teacherId && financeTeacherDetailState.month === month;
  const workload = role === "teacher" ? (teacherWorkloadCurrent ? teacherWorkloadState.data : null) : financeDetailCurrent ? financeTeacherDetailState.workload : null;
  const payroll = role === "teacher" ? (teacherPayrollCurrent ? teacherPayrollState.data : null) : financeDetailCurrent ? financeTeacherDetailState.payroll : null;

  const loading =
    (attendanceRecordState.loading && !attendanceCurrent) ||
    (role === "teacher" && teacherWorkloadState.loading && !teacherWorkloadCurrent) ||
    (role === "teacher" && teacherPayrollState.loading && !teacherPayrollCurrent) ||
    (role !== "teacher" && financeTeacherDetailState.loading && !financeDetailCurrent);
  if (loading) {
    list.innerHTML = `<div class="empty-state">正在加载异常、待处理考勤和工资锁定阻断...</div>`;
    return;
  }

  const error =
    (attendanceCurrent && attendanceRecordState.error) ||
    (role === "teacher" && teacherWorkloadCurrent && teacherWorkloadState.error) ||
    (role === "teacher" && teacherPayrollCurrent && teacherPayrollState.error) ||
    (role !== "teacher" && financeDetailCurrent && financeTeacherDetailState.error);
  if (error) {
    list.innerHTML = `<div class="empty-state">${escapeHtml(error)}</div>`;
    return;
  }

  const warnings = backendWarningItems({
    records: attendanceCurrent ? attendanceRecordState.records : [],
    workload,
    payroll,
  });
  list.innerHTML = warnings.length
    ? warnings
        .map(
          (warning) => `
            <article class="warning-item">
              <header>
                <strong>${escapeHtml(warning.title)}</strong>
                <span class="tag ${warning.type === "pending" ? "pending" : "exception"}">${escapeHtml(warning.tag)}</span>
              </header>
              <p>${escapeHtml(warning.detail)}</p>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">暂无异常、待处理课次或工资锁定阻断。</div>`;
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
    return `<button class="mini-button primary" data-open-scanner="${lesson.id}" type="button">去签入</button>`;
  }
  if (lesson.status === "checkedIn") {
    return `<button class="mini-button primary" data-open-scanner="${lesson.id}" type="button">去签出</button>`;
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
        ? "属于授权教室码"
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
        ? "教室码签名匹配"
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
    list.innerHTML = `<div class="empty-state">完成扫码后，这里会显示每一项校验结果</div>`;
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

function classroomDisplayKey(room) {
  return room.displayKey || roomDisplayKeyForDevelopment(room.id);
}

function classroomScreenUrl(room) {
  return `/classroom.html?roomId=${encodeURIComponent(room.id)}&displayKey=${encodeURIComponent(classroomDisplayKey(room))}`;
}

function localClassroomRooms() {
  return (state.schedulingConfig.rooms || []).map((room) => ({
    ...room,
    stageId: state.schedulingConfig.stageId || state.schedulingConfig.divisionId || "",
    displayKey: classroomDisplayKey(room),
  }));
}

async function loadClassroomRooms() {
  if (!backendMode() || currentRole() !== "classroom") return;
  classroomScreenState = { ...classroomScreenState, loading: true, error: "" };
  renderClassroomScreens();
  try {
    const result = await apiRequest("/api/classrooms");
    classroomScreenState = {
      ...classroomScreenState,
      rooms: result.rooms || [],
      loading: false,
      loaded: true,
      error: "",
    };
  } catch (error) {
    classroomScreenState = {
      ...classroomScreenState,
      loading: false,
      loaded: true,
      error: error.message || "教室列表读取失败",
    };
    showToast(classroomScreenState.error);
  }
  renderClassroomScreens();
}

function classroomScreenCard(room) {
  const url = classroomScreenUrl(room);
  return `
    <article class="classroom-screen-card">
      <header>
        <div>
          <strong>${escapeHtml(room.name || room.id)}</strong>
          <span class="muted">${escapeHtml(room.stageId || "教室")} · ${escapeHtml(room.id)}</span>
        </div>
        <span class="tag ${room.active === false ? "exception" : "completed"}">${room.active === false ? "停用" : "可用"}</span>
      </header>
      <code>${escapeHtml(url)}</code>
      <div class="classroom-screen-actions">
        <a class="mini-button primary" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">打开大屏</a>
        <button class="mini-button" data-copy-classroom-url="${escapeHtml(url)}" type="button">复制地址</button>
      </div>
    </article>
  `;
}

function renderClassroomScreens() {
  const grid = document.querySelector("#classroomScreenGrid");
  if (!grid || currentRole() !== "classroom") return;

  if (backendMode() && !classroomScreenState.loaded && !classroomScreenState.loading) {
    loadClassroomRooms();
  }

  const rooms = backendMode() ? classroomScreenState.rooms : localClassroomRooms();
  const search = classroomScreenState.search.trim().toLowerCase();
  const filteredRooms = rooms.filter((room) => {
    if (!search) return true;
    return [room.id, room.name, room.stageId, room.displayKey]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
  });

  const status = document.querySelector("#classroomScreenStatus");
  if (status) {
    if (classroomScreenState.loading) {
      status.textContent = "读取中";
      status.className = "status-pill warning";
    } else if (classroomScreenState.error) {
      status.textContent = "读取失败";
      status.className = "status-pill warning";
    } else {
      status.textContent = `${filteredRooms.length}/${rooms.length} 间教室`;
      status.className = "status-pill done";
    }
  }

  const searchInput = document.querySelector("#classroomRoomSearch");
  if (searchInput && searchInput.value !== classroomScreenState.search) {
    searchInput.value = classroomScreenState.search;
  }

  if (classroomScreenState.loading) {
    grid.innerHTML = `<div class="empty-state">正在读取教室二维码库...</div>`;
    return;
  }
  if (classroomScreenState.error) {
    grid.innerHTML = `<div class="empty-state">${escapeHtml(classroomScreenState.error)}</div>`;
    return;
  }
  grid.innerHTML = filteredRooms.length
    ? filteredRooms.map(classroomScreenCard).join("")
    : `<div class="empty-state">没有匹配的教室</div>`;
}

async function handleDecodedScan(decodedText, options = {}) {
  state.lastScanText = decodedText;
  const backendLesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (backendMode() && currentRole() === "teacher" && backendLesson?.source === "backend-api") {
    await recordAttendance(
      backendLesson.id,
      options.action || actionForLesson(backendLesson),
      options.nowText || new Date().toISOString(),
      decodedText,
    );
    return;
  }

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
    return { action: "checkIn", lessonId: "", nowText: new Date().toISOString() };
  }
  const action = actionForLesson(lesson);
  return {
    action,
    lessonId: lesson.id,
    nowText: new Date().toISOString(),
  };
}

function openScannerForLesson(id) {
  const lesson = state.lessons.find((item) => item.id === id);
  if (!lesson) return;
  state.scannerLessonId = lesson.id;
  switchView("scanner");
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
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) {
    showToast("暂无可签入或签出的课程任务");
    return;
  }
  if (typeof Html5QrcodeScanner !== "function") {
    showToast("扫码库未加载，无法启动摄像头");
    return;
  }
  if (!window.isSecureContext && window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost") {
    showToast("摄像头需要 HTTPS 安全环境，请联系管理员检查系统访问地址");
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
    // 只允许实时摄像头扫码：图片上传识别和手动输入一样可以用照片代打卡，一并关闭
    scannerConfig.supportedScanTypes = [Html5QrcodeScanType.SCAN_TYPE_CAMERA];
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
  // 审批中心首次进入时按需加载模板与列表
  if (viewName === "approvalSettings" && backendMode() && !oaAdminState.templates.length) {
    loadOaAdminTemplates();
  }
  if (viewName === "approvals" && backendMode()) {
    loadOaTemplates().then(() => {
      renderApprovalsView();
      if (!oaState.meta) loadOaRequests();
    });
  }
}

function loginAccount(accountId) {
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return;
  if (qrScanner) stopCameraScanner();
  // 切换账号时强制收起弹层与命令面板，避免残留到新账号界面
  if (activeDialogClose) activeDialogClose();
  if (commandState.open) closeCommandPalette();
  resetOaState();
  resetTeacherWorkloadState();
  resetAttendanceRecordState();
  resetTeacherPayrollState();
  resetFinanceTeacherDetailState();
  resetHrFrontendStates();
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
  const trimmedUsername = username.trim();
  const matched = loginUsers.find(
    (user) => user.username === trimmedUsername && user.password === password,
  );
  const scheduledTeacher = !matched
    ? elementaryScheduledTeacherLoginOptions().find(
        (option) => option.username === trimmedUsername && password === "123456",
      )
    : null;
  if (!matched) {
    if (!scheduledTeacher) {
      document.querySelector("#loginError").textContent = fallbackMessage;
      return false;
    }
    document.querySelector("#loginError").textContent = "";
    clearBackendSession();
    resetPersonnelPage();
    loginAccount(ensureLocalScheduledTeacherAccount(scheduledTeacher));
    return true;
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
        schedulingBackendState = { loaded: false, loading: false, error: "", job: null, precheck: null };
        termManagementState = { terms: [], currentTerm: null, loaded: false, loading: false, error: "" };
        resetPersonnelPage();
        await loadTermContext();
        await loadBackendSchedulingContext();
      }
      if (payload.account.role === "system_admin") {
        resetPersonnelPage();
        await loadPersonnelPage({ page: 1 });
      }
      if (payload.account.role === "classroom") {
        classroomScreenState = { rooms: [], loading: false, loaded: false, error: "", search: "" };
        await loadClassroomRooms();
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

// ===========================================================================
// 通用弹层组件（P0）：promise-based，替代原生 window.prompt / window.confirm
// openDialog({ title, description, fields, confirmText, cancelText, danger, onConfirm })
//   fields: [{ name, label, type='text'|'textarea'|'select', value, placeholder,
//              required, options:[{value,label}], rows, hint }]
//   返回：确认时 resolve(valuesObject)；取消时 resolve(null)
//   onConfirm(values) 可返回 Promise —— 期间确认按钮进入 loading，抛错则就地提示且不关闭
// ===========================================================================
let activeDialogClose = null;

function openDialog(config = {}) {
  const {
    title = "",
    description = "",
    fields = [],
    confirmText = "确认",
    cancelText = "取消",
    danger = false,
    onConfirm = null,
  } = config;

  return new Promise((resolve) => {
    const root = document.querySelector("#dialogRoot");
    const fieldHtml = fields
      .map((field) => {
        const id = `dialogField-${field.name}`;
        const required = field.required ? '<span class="dialog-required">*</span>' : "";
        let control;
        if (field.type === "textarea") {
          control = `<textarea id="${id}" data-dialog-field="${escapeHtml(field.name)}" rows="${field.rows || 3}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(field.value || "")}</textarea>`;
        } else if (field.type === "select") {
          control = `<select id="${id}" data-dialog-field="${escapeHtml(field.name)}">${(field.options || [])
            .map((opt) => `<option value="${escapeHtml(opt.value)}" ${opt.value === field.value ? "selected" : ""}>${escapeHtml(opt.label)}</option>`)
            .join("")}</select>`;
        } else {
          control = `<input id="${id}" data-dialog-field="${escapeHtml(field.name)}" type="${field.type || "text"}" value="${escapeHtml(field.value || "")}" placeholder="${escapeHtml(field.placeholder || "")}" />`;
        }
        return `
          <label class="dialog-field">
            <span>${escapeHtml(field.label || "")}${required}</span>
            ${control}
            ${field.hint ? `<small>${escapeHtml(field.hint)}</small>` : ""}
          </label>
        `;
      })
      .join("");

    root.innerHTML = `
      <div class="dialog-overlay" data-dialog-overlay>
        <div class="dialog-card" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
          <div class="dialog-head">
            <h3>${escapeHtml(title)}</h3>
            ${description ? `<p>${escapeHtml(description)}</p>` : ""}
          </div>
          ${fieldHtml ? `<div class="dialog-body">${fieldHtml}</div>` : ""}
          <p class="dialog-error" data-dialog-error></p>
          <div class="dialog-actions">
            <button class="ghost-button" data-dialog-cancel type="button">${escapeHtml(cancelText)}</button>
            <button class="${danger ? "danger-button" : "primary-button"}" data-dialog-confirm type="button">${escapeHtml(confirmText)}</button>
          </div>
        </div>
      </div>
    `;
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("dialog-open");

    const overlay = root.querySelector("[data-dialog-overlay]");
    const confirmButton = root.querySelector("[data-dialog-confirm]");
    const errorEl = root.querySelector("[data-dialog-error]");
    const firstControl = root.querySelector("[data-dialog-field]");
    (firstControl || confirmButton).focus();

    let closed = false;
    const cleanup = (result) => {
      if (closed) return;
      closed = true;
      root.innerHTML = "";
      root.setAttribute("aria-hidden", "true");
      document.body.classList.remove("dialog-open");
      document.removeEventListener("keydown", onKey, true);
      activeDialogClose = null;
      resolve(result);
    };
    activeDialogClose = () => cleanup(null);

    const collect = () => {
      const values = {};
      root.querySelectorAll("[data-dialog-field]").forEach((el) => {
        values[el.dataset.dialogField] = el.value.trim();
      });
      return values;
    };

    const submit = async () => {
      const values = collect();
      const missing = fields.find((field) => field.required && !values[field.name]);
      if (missing) {
        errorEl.textContent = `请填写「${missing.label}」`;
        root.querySelector(`[data-dialog-field="${missing.name}"]`)?.focus();
        return;
      }
      if (!onConfirm) {
        cleanup(values);
        return;
      }
      confirmButton.disabled = true;
      confirmButton.classList.add("is-loading");
      errorEl.textContent = "";
      try {
        await onConfirm(values);
        cleanup(values);
      } catch (error) {
        errorEl.textContent = error.message || "操作失败，请重试";
        confirmButton.disabled = false;
        confirmButton.classList.remove("is-loading");
      }
    };

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cleanup(null);
      } else if (event.key === "Enter" && !event.shiftKey && event.target.tagName !== "TEXTAREA") {
        event.preventDefault();
        submit();
      }
    };
    document.addEventListener("keydown", onKey, true);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) cleanup(null);
    });
    root.querySelector("[data-dialog-cancel]").addEventListener("click", () => cleanup(null));
    confirmButton.addEventListener("click", submit);
  });
}

// ===========================================================================
// 全局命令面板 / 搜索（P1）：⌘K / Ctrl+K 或顶栏搜索入口唤起
//   - 功能页：按当前角色可见的视图，输入即过滤
//   - 人员：hr 系角色搜档案、财务搜教师；键盘上下选择、回车直达
// ===========================================================================
let commandState = { open: false, query: "", items: [], activeIndex: 0, reqId: 0 };

function commandNavItems() {
  const items = [];
  document.querySelectorAll(".nav-item[data-view]").forEach((btn) => {
    const view = btn.dataset.view;
    if (!views[view] || !viewAllowed(view)) return;
    items.push({
      kind: "page",
      label: views[view].title || view,
      sub: "功能页",
      run: () => switchView(view),
    });
  });
  return items;
}

function renderCommandResults() {
  const root = document.querySelector("#commandRoot");
  const results = root.querySelector("[data-command-results]");
  if (!results) return;
  if (!commandState.items.length) {
    results.innerHTML = `<div class="command-empty">${commandState.query ? "没有匹配结果" : "输入关键词搜索功能或人员"}</div>`;
    return;
  }
  results.innerHTML = commandState.items
    .map(
      (item, index) => `
        <button class="command-item ${index === commandState.activeIndex ? "active" : ""}" data-command-index="${index}" type="button">
          <span class="command-item-icon">${item.kind === "page" ? "▦" : "☷"}</span>
          <span class="command-item-body">
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(item.sub || "")}</small>
          </span>
        </button>
      `,
    )
    .join("");
  const active = results.querySelector(".command-item.active");
  if (active) active.scrollIntoView({ block: "nearest" });
}

function computeCommandItems() {
  const query = commandState.query.trim().toLowerCase();
  const pages = commandNavItems().filter((item) => !query || item.label.toLowerCase().includes(query));
  commandState.items = pages;
  commandState.activeIndex = 0;
  renderCommandResults();
  if (query.length >= 1 && backendMode()) fetchCommandPeople(query);
}

async function fetchCommandPeople(query) {
  const role = currentRole();
  const reqId = ++commandState.reqId;
  let people = [];
  try {
    if (["hr", "system_admin", "division_head"].includes(role)) {
      const result = await apiRequest(`/api/hr/employees?search=${encodeURIComponent(query)}&pageSize=6`);
      people = (result.items || []).map((emp) => ({
        kind: "person",
        label: emp.personName,
        sub: `${emp.employeeNo} · ${emp.orgUnitName || "未分配"} · ${emp.statusLabel}`,
        run: () => {
          switchView("hrEmployees");
          loadHrEmployeeDetail(emp.id);
        },
      }));
    } else if (role === "finance") {
      const result = await apiRequest(`/api/teachers?page=1&pageSize=6&search=${encodeURIComponent(query)}`);
      people = (result.items || []).map((teacher) => ({
        kind: "person",
        label: teacher.name,
        sub: `${teacher.employeeNo || teacher.id} · ${teacher.department || teacher.stageName || ""}`,
        run: () => {
          state.selectedFinanceTeacherId = teacher.id;
          switchView("financeRecords");
          if (typeof loadBackendAttendanceRecords === "function") loadBackendAttendanceRecords(teacher.id);
        },
      }));
    }
  } catch (error) {
    // 搜人失败不影响功能页结果
  }
  if (reqId !== commandState.reqId || !commandState.open) return;
  // 功能页在前、人员在后
  commandState.items = [...commandNavItems().filter((item) => item.label.toLowerCase().includes(query)), ...people];
  if (commandState.activeIndex >= commandState.items.length) commandState.activeIndex = 0;
  renderCommandResults();
}

function closeCommandPalette() {
  const root = document.querySelector("#commandRoot");
  root.innerHTML = "";
  root.setAttribute("aria-hidden", "true");
  document.body.classList.remove("command-open");
  commandState.open = false;
}

function openCommandPalette() {
  if (commandState.open) return;
  if (document.querySelector("#appShell").classList.contains("is-hidden")) return; // 未登录不开
  commandState = { open: true, query: "", items: [], activeIndex: 0, reqId: 0 };
  const root = document.querySelector("#commandRoot");
  root.innerHTML = `
    <div class="command-overlay" data-command-overlay>
      <div class="command-panel" role="dialog" aria-modal="true" aria-label="全局搜索">
        <input class="command-input" data-command-input type="text" placeholder="搜索功能页、人员…" autocomplete="off" />
        <div class="command-results" data-command-results></div>
        <div class="command-hint">↑↓ 选择 · ↵ 打开 · Esc 关闭</div>
      </div>
    </div>
  `;
  root.setAttribute("aria-hidden", "false");
  document.body.classList.add("command-open");
  const input = root.querySelector("[data-command-input]");
  input.focus();
  computeCommandItems();

  input.addEventListener("input", () => {
    commandState.query = input.value;
    computeCommandItems();
  });
  root.querySelector("[data-command-overlay]").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeCommandPalette();
  });
  root.querySelector("[data-command-results]").addEventListener("click", (event) => {
    const item = event.target.closest("[data-command-index]");
    if (!item) return;
    const chosen = commandState.items[Number(item.dataset.commandIndex)];
    closeCommandPalette();
    chosen?.run();
  });
}

// 骨架屏：加载态占位，替代"加载中…"文字
function skeletonListHtml(rows = 4) {
  return `<div class="skeleton-list">${Array.from({ length: rows }, () => `<div class="skeleton-row"></div>`).join("")}</div>`;
}

// 加载失败态：常驻 + 重试按钮（data-retry-action 由委托捕获）
function loadErrorHtml(message, retryKey) {
  return `
    <div class="load-error">
      <p>${escapeHtml(message || "加载失败")}</p>
      <button class="ghost-button compact-button" data-retry-action="${escapeHtml(retryKey)}" type="button">重试</button>
    </div>
  `;
}

// 便捷封装：确认框（危险操作用 danger:true）
function confirmDialog(title, options = {}) {
  return openDialog({
    title,
    description: options.description || "",
    confirmText: options.confirmText || "确认",
    cancelText: options.cancelText || "取消",
    danger: options.danger || false,
  }).then((result) => result !== null);
}

// 便捷封装：单字段输入框，返回 string 或 null（取消）
function promptDialog(title, options = {}) {
  return openDialog({
    title,
    description: options.description || "",
    confirmText: options.confirmText || "提交",
    danger: options.danger || false,
    fields: [
      {
        name: "value",
        label: options.label || title,
        type: options.textarea ? "textarea" : "text",
        value: options.value || "",
        placeholder: options.placeholder || "",
        required: options.required !== false,
        rows: options.rows,
        hint: options.hint,
      },
    ],
  }).then((result) => (result === null ? null : result.value));
}

document.addEventListener("input", (event) => {
  const assignmentInput = event.target.closest("[data-class-subject-teacher-input]");
  if (assignmentInput) {
    syncClassSubjectTeacherInput(assignmentInput);
  }
  const minDayInput = event.target.closest("[data-course-rule-min-day]");
  if (minDayInput) {
    syncCourseRuleCoverageInput(minDayInput.dataset.courseRuleMinDay);
  }
  if (event.target.closest("#classroomRoomSearch")) {
    classroomScreenState.search = event.target.value;
    renderClassroomScreens();
  }
});

document.addEventListener("click", async (event) => {
  const demoLoginButton = event.target.closest("[data-demo-login]");
  if (demoLoginButton) {
    document.querySelector("#loginUsername").value = demoLoginButton.dataset.demoLogin;
    document.querySelector("#loginPassword").value = "123456";
    await authenticate(demoLoginButton.dataset.demoLogin, "123456");
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

  const scrollTargetButton = event.target.closest("[data-scroll-target]");
  if (scrollTargetButton) {
    const target = document.querySelector(scrollTargetButton.dataset.scrollTarget);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  const clickTargetButton = event.target.closest("[data-click-target]");
  if (clickTargetButton) {
    const target = document.querySelector(clickTargetButton.dataset.clickTarget);
    if (target && !target.disabled) {
      target.click();
    } else if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  const resetAccountButton = event.target.closest("[data-account-reset]");
  if (resetAccountButton) {
    await resetBackendAccountPassword(resetAccountButton.dataset.accountReset);
    return;
  }

  const accountStatusButton = event.target.closest("[data-account-status]");
  if (accountStatusButton) {
    await updateBackendAccountStatus(
      accountStatusButton.dataset.accountStatus,
      accountStatusButton.dataset.nextStatus || "active",
    );
    return;
  }

  if (event.target.closest("#addSalaryManualItem")) {
    addSalaryManualItemFromInputs();
    return;
  }

  const removeManualItemButton = event.target.closest("[data-remove-manual-item]");
  if (removeManualItemButton) {
    removeSalaryManualItem(Number(removeManualItemButton.dataset.removeManualItem));
    return;
  }

  const scheduleDateButton = event.target.closest("[data-schedule-date]");
  if (scheduleDateButton) {
    state.selectedScheduleDate = scheduleDateButton.dataset.scheduleDate;
    renderSchedule();
    return;
  }

  const scheduleSuggestionButton = event.target.closest("[data-apply-schedule-suggestion]");
  if (scheduleSuggestionButton) {
    const assignmentId = scheduleSuggestionButton.dataset.applyScheduleSuggestion;
    const assignment = (state.schedulingDraft.assignments || []).find((item) => item.id === assignmentId);
    const assignmentSelect = document.querySelector("#adminAssignmentSelect");
    const teacherSelect = document.querySelector("#adminAssignmentTeacherSelect");
    const dateSelect = document.querySelector("#adminAssignmentDateSelect");
    const periodSelect = document.querySelector("#adminAssignmentPeriodSelect");
    const roomSelect = document.querySelector("#adminAssignmentRoomSelect");
    state.selectedScheduleAssignmentId = assignmentId;
    if (assignmentSelect) assignmentSelect.value = assignmentId;
    if (teacherSelect && assignment) teacherSelect.value = assignment.teacherId;
    if (roomSelect && assignment) roomSelect.value = assignment.roomId;
    if (dateSelect) dateSelect.value = scheduleSuggestionButton.dataset.suggestionDate;
    if (periodSelect) periodSelect.value = scheduleSuggestionButton.dataset.suggestionPeriod;
    await applyScheduleAdjustment();
    return;
  }

  const rollbackVersionButton = event.target.closest("[data-rollback-schedule-version]");
  if (rollbackVersionButton) {
    await rollbackBackendScheduleVersion(rollbackVersionButton.dataset.rollbackScheduleVersion);
    return;
  }

  const cancelScheduleJobButton = event.target.closest("[data-cancel-schedule-job]");
  if (cancelScheduleJobButton) {
    await cancelBackendScheduleJob();
    return;
  }

  const setCurrentTermButton = event.target.closest("[data-set-current-term]");
  if (setCurrentTermButton) {
    await setBackendCurrentTerm(setCurrentTermButton.dataset.setCurrentTerm);
    return;
  }

  const archiveTermButton = event.target.closest("[data-archive-term]");
  if (archiveTermButton) {
    await archiveBackendTerm(archiveTermButton.dataset.archiveTerm);
    return;
  }

  const deleteTermButton = event.target.closest("[data-delete-term]");
  if (deleteTermButton) {
    await deleteBackendTerm(deleteTermButton.dataset.deleteTerm);
    return;
  }

  const scannerButton = event.target.closest("[data-open-scanner]");
  if (scannerButton) {
    openScannerForLesson(scannerButton.dataset.openScanner);
    return;
  }

  const copyClassroomUrlButton = event.target.closest("[data-copy-classroom-url]");
  if (copyClassroomUrlButton) {
    const url = `${window.location.origin}${copyClassroomUrlButton.dataset.copyClassroomUrl}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("教室大屏地址已复制");
    } catch (error) {
      showToast(url);
    }
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
      await loadFinanceTeacherDetail(state.selectedFinanceTeacherId, { generatePayroll: false });
    }
    switchView("settlement");
    return;
  }

  if (event.target.closest("[data-save-teacher-assignment-matrix]")) {
    await saveClassSubjectTeacherAssignments();
    return;
  }

  if (event.target.closest("[data-auto-assign-teachers]")) {
    await autoAssignClassSubjectTeachers(false);
    return;
  }

  if (event.target.closest("[data-auto-assign-teachers-overwrite]")) {
    await autoAssignClassSubjectTeachers(true);
    return;
  }

  if (event.target.closest("#toggleCourseEditMode")) {
    courseRulesEditMode = !courseRulesEditMode;
    renderAdminScheduling();
    return;
  }

  const deleteRoomTypeButton = event.target.closest("[data-delete-room-resource-type]");
  if (deleteRoomTypeButton) {
    deleteRoomResourceType(deleteRoomTypeButton.dataset.deleteRoomResourceType);
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

document.querySelector("#notificationComposerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  publishNotificationFromComposer();
});

document.querySelector("#clearNotificationDraft").addEventListener("click", () => {
  clearNotificationComposer();
});

document.querySelector("#notificationAudienceSelect").addEventListener("change", () => {
  readNotificationRecipientControls();
  notificationRecipientState = {
    ...notificationRecipientState,
    selectedTeacherIds: [],
    loaded: false,
    teachers: [],
    error: "",
  };
  renderNotificationCenter();
});

document.querySelector("#notificationStageSelect").addEventListener("change", (event) => {
  notificationRecipientState = {
    ...notificationRecipientState,
    stageId: event.target.value,
    grade: "",
    selectedTeacherIds: [],
    loaded: false,
    teachers: [],
    error: "",
  };
  renderNotificationCenter();
});

document.querySelector("#notificationGradeSelect").addEventListener("change", (event) => {
  notificationRecipientState = {
    ...notificationRecipientState,
    grade: event.target.value,
    selectedTeacherIds: [],
    loaded: false,
    teachers: [],
    error: "",
  };
  renderNotificationCenter();
});

document.querySelector("#notificationTeacherSearch").addEventListener("change", (event) => {
  notificationRecipientState = {
    ...notificationRecipientState,
    search: event.target.value.trim(),
    selectedTeacherIds: [],
    loaded: false,
    teachers: [],
    error: "",
  };
  renderNotificationCenter();
});

document.querySelector("#notificationTeacherSelect").addEventListener("change", () => {
  notificationRecipientState = {
    ...notificationRecipientState,
    selectedTeacherIds: notificationSelectedTeacherIdsFromControl(),
  };
  renderNotificationCenter();
});

document.querySelector("#refreshNotificationRecipients").addEventListener("click", () => {
  readNotificationRecipientControls();
  notificationRecipientState = {
    ...notificationRecipientState,
    loaded: false,
    teachers: [],
    error: "",
  };
  loadNotificationRecipientTeachers({ force: true, keepSelection: true });
});

// 导航图标：按 data-view 注入线性 SVG（16px / stroke currentColor），
// 替换原先的 ASCII 占位字符，桌面侧边栏和移动端底部导航共用。
const NAV_ICON_PATHS = {
  dashboard: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  tasks: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  schedule: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  adminScheduling: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4"/>',
  adminScheduleOverview: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  personnel: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16.5 4.9a3.5 3.5 0 0 1 0 6.2M17.8 14.3c2 .8 3.2 2.6 3.2 5.7"/>',
  teacherImport: '<path d="M12 15V4m0 0 4 4m-4-4L8 8"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  notifications: '<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  scanner: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M4 12h16"/>',
  records: '<path d="M5 4h14a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2-3-2V5a1 1 0 0 1 1-1z"/><path d="M9 9h6M9 13h4"/>',
  confirm: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5.5"/>',
  teacherPayroll: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M7 15h4"/>',
  finance: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
  financeRecords: '<path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  settlement: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
  payrollHistory: '<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>',
  payrollConfig: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.3L14 3h-4l-.5 2.6a7 7 0 0 0-2.1 1.3l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.3L10 21h4l.5-2.6a7 7 0 0 0 2.1-1.3l2.3 1 2-3.4-2-1.5c.06-.4.1-.8.1-1.2z"/>',
  warnings: '<path d="M12 3 2.5 19.5a1 1 0 0 0 .9 1.5h17.2a1 1 0 0 0 .9-1.5z"/><path d="M12 10v4M12 17.5h.01"/>',
  hrEmployees: '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/><path d="M17 10.5h4M19 8.5v4"/>',
  hrOrg: '<rect x="9" y="3" width="6" height="5" rx="1.5"/><rect x="3" y="16" width="6" height="5" rx="1.5"/><rect x="15" y="16" width="6" height="5" rx="1.5"/><path d="M12 8v4M12 12H6v4M12 12h6v4"/>',
  hrAudit: '<path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><circle cx="11" cy="14" r="2.5"/><path d="m13 16 2.5 2.5"/>',
  myHrProfile: '<rect x="4" y="4" width="16" height="17" rx="3"/><circle cx="12" cy="10" r="2.5"/><path d="M7.5 17.5c.8-2 2.5-3 4.5-3s3.7 1 4.5 3"/>',
  hrFlows: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="m3 5.5 1.2 1.2L6.5 4.4M3 11.5l1.2 1.2 2.3-2.3M3 17.5l1.2 1.2 2.3-2.3"/>',
  classroomScreens: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
};

function applyNavIcons() {
  document.querySelectorAll(".nav-item[data-view]").forEach((button) => {
    const paths = NAV_ICON_PATHS[button.dataset.view];
    const span = button.querySelector("span");
    if (!paths || !span) return;
    span.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  });
}

// ===========================================================================
// 第二阶段 M2：人事管控前端（人员档案 / 组织与岗位 / 人事审计 / 我的档案）
// ===========================================================================

const HR_STATUS_OPTIONS = [
  ["pending_onboard", "待入职"],
  ["probation", "试用期"],
  ["active", "在职"],
  ["transferring", "调岗中"],
  ["offboarding", "离职中"],
  ["left", "已离职"],
  ["suspended", "停用"],
];

// 职称与学历：人事评定/证书事实，决定基本工资档与学历补贴
const HR_TITLE_GRADES = [
  ["", "未设置"],
  ["seniorProfessor", "正高级教师"],
  ["seniorTeacher", "高级教师"],
  ["first", "一级教师"],
  ["second", "二级教师"],
  ["third", "三级教师"],
  ["ungraded", "未评级"],
];

const HR_DEGREES = [
  ["", "本科及以下"],
  ["master", "硕士"],
  ["doctor", "博士"],
];

// 兼岗任命：由人事维护的职务，直接决定兼岗津贴
const HR_TEACHER_ROLE_FIELDS = [
  { key: "homeroom", label: "班主任", type: "boolean" },
  { key: "gradeHead", label: "年级主任", type: "boolean" },
  { key: "teachingResearchLeader", label: "教研组长", type: "boolean" },
  { key: "teachingResearchDeputy", label: "教研副组长", type: "boolean" },
  { key: "lessonPrepLeader", label: "备课组长", type: "boolean" },
  { key: "lessonPrepLargeGroup", label: "备课组长(语数外)", type: "boolean" },
  { key: "lessonPrepStandardizedGrade", label: "备课组长(统考年级)", type: "boolean" },
  { key: "graduatingClass", label: "毕业班任课", type: "boolean" },
  { key: "eliteClass", label: "特优班任课", type: "boolean" },
  { key: "qingbeiClass", label: "清北班任课", type: "boolean" },
  { key: "firstGrade", label: "一年级任课", type: "boolean" },
  { key: "doubleChinese", label: "双班语文", type: "boolean" },
  { key: "standardizedExam", label: "统考科目", type: "boolean" },
  { key: "olympiadHomeroom", label: "奥数班主任", type: "boolean" },
  { key: "busDuty", label: "跟车老师", type: "boolean" },
  { key: "homeroomStudentCount", label: "班级学生数", type: "number" },
  { key: "gradeClassCount", label: "年级管辖班级数", type: "number" },
];

// 月度考核：学部负责人与人事录入，财务只读。等级驱动考核工资浮动。
const HR_ASSESSMENT_GRADES = [
  ["excellent", "优秀（上浮）"],
  ["good", "良好（上浮）"],
  ["default", "合格（全额）"],
  ["warning", "基本合格（扣减）"],
  ["unqualified", "不合格（扣减）"],
];

let hrAssessmentState = { teacherId: "", month: "", record: null, loading: false };

function currentAssessmentMonth() {
  return hrAssessmentState.month || new Date().toISOString().slice(0, 7);
}

function hrAssessmentSection(employee) {
  const month = currentAssessmentMonth();
  const record = hrAssessmentState.teacherId === employee.teacherId ? hrAssessmentState.record : null;
  return `
    <div class="hr-detail-section" data-hr-assessment-section>
      <h3>月度考核</h3>
      <p class="action-hint">线下评审结果录入后驱动考核工资浮动；财务只读，不可修改。修改会使该月未锁定工资单重算。</p>
      <div class="hr-inline-form">
        <input id="hrAssessMonth" type="month" value="${escapeHtml(month)}" />
        <select id="hrAssessGrade">
          ${HR_ASSESSMENT_GRADES.map(
            ([value, label]) =>
              `<option value="${value}" ${record?.grade === value ? "selected" : ""}>${label}</option>`,
          ).join("")}
        </select>
        <input id="hrAssessAmount" type="number" min="0" placeholder="核定金额（选填，留空按等级浮动）" value="${record?.amount ?? ""}" />
        <button class="ghost-button compact-button" data-hr-assess-load type="button">查询</button>
        <button class="primary-button compact-button" data-hr-assess-save type="button">保存考核</button>
      </div>
      <input class="hr-assess-note" id="hrAssessNote" placeholder="评语（选填）" value="${escapeHtml(record?.note || "")}" />
      ${
        record
          ? `<p class="action-hint">当前记录：${escapeHtml(record.month)} · ${escapeHtml(HR_ASSESSMENT_GRADES.find(([v]) => v === record.grade)?.[1] || record.grade)}${record.amount != null ? ` · 核定 ${record.amount} 元` : ""} · 录入人 ${escapeHtml(record.updatedByName || "")}</p>`
          : `<p class="action-hint">该月尚未录入考核，计薪按“合格”全额发放。</p>`
      }
    </div>
  `;
}

async function loadHrAssessment(teacherId, month) {
  try {
    const result = await apiRequest(`/api/hr/assessments?teacherId=${encodeURIComponent(teacherId)}&month=${encodeURIComponent(month)}`);
    hrAssessmentState = { teacherId, month, record: result.assessments?.[0] || null, loading: false };
  } catch (error) {
    hrAssessmentState = { teacherId, month, record: null, loading: false };
  }
  renderHrEmployeeDetail();
}

function hrTitleGradeOptions(selected = "") {
  return HR_TITLE_GRADES.map(
    ([value, label]) => `<option value="${value}" ${value === (selected || "") ? "selected" : ""}>${label}</option>`,
  ).join("");
}

function hrDegreeOptions(selected = "") {
  return HR_DEGREES.map(
    ([value, label]) => `<option value="${value}" ${value === (selected || "") ? "selected" : ""}>${label}</option>`,
  ).join("");
}

// 收集兼岗任命勾选结果，随档案保存一并提交
function hrTeacherRolesFromInputs() {
  const roles = {};
  HR_TEACHER_ROLE_FIELDS.forEach((field) => {
    if (field.type === "number") {
      const input = document.querySelector(`[data-hr-role-number="${field.key}"]`);
      roles[field.key] = Number(input?.value || 0);
    } else {
      const input = document.querySelector(`[data-hr-role="${field.key}"]`);
      roles[field.key] = Boolean(input?.checked);
    }
  });
  return roles;
}

const HR_ACTION_LABELS = {
  org_unit_create: "新增组织节点",
  org_unit_update: "修改组织节点",
  org_unit_status: "组织节点启停",
  position_create: "新增岗位",
  position_update: "修改岗位",
  employee_create: "新建档案",
  employee_update: "修改档案",
  employee_status: "人事状态变更",
  contract_create: "新增合同",
  contract_update: "修改合同",
  sensitive_view: "查看敏感信息",
  roster_export: "导出花名册",
  salary_template_create: "新建薪资模板",
  salary_template_version: "发布模板版本",
  salary_template_apply: "批量应用模板",
  profile_change_submit: "提交变更申请",
  profile_change_approve: "变更申请通过",
  profile_change_reject: "变更申请拒绝",
  profile_change_withdraw: "变更申请撤回",
};

function hrStatusPillClass(status) {
  if (status === "active" || status === "probation") return "status-pill done";
  if (status === "left" || status === "suspended") return "status-pill warning";
  return "status-pill";
}

function isHrManagerRole() {
  return currentRole() === "hr" || currentRole() === "system_admin";
}

let hrEmployeePage = {
  items: [],
  summary: null,
  meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  page: 1,
  pageSize: 20,
  search: "",
  orgUnitId: "",
  status: "",
  loaded: false,
  loading: false,
  error: "",
};
let hrEmployeeDetailState = { id: "", detail: null, loading: false, error: "", creating: false };
let hrOrgState = { units: [], positions: [], templates: [], loaded: false, loading: false, error: "" };
let hrAuditPage = {
  items: [],
  meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  page: 1,
  action: "",
  search: "",
  loaded: false,
  loading: false,
  error: "",
};
let myHrProfileState = { data: null, loaded: false, loading: false, error: "" };

async function loadHrEmployeePage(overrides = {}) {
  hrEmployeePage = { ...hrEmployeePage, ...overrides, loading: true, error: "" };
  render();
  try {
    const params = new URLSearchParams({
      page: String(hrEmployeePage.page),
      pageSize: String(hrEmployeePage.pageSize),
    });
    if (hrEmployeePage.search) params.set("search", hrEmployeePage.search);
    if (hrEmployeePage.orgUnitId) params.set("orgUnitId", hrEmployeePage.orgUnitId);
    if (hrEmployeePage.status) params.set("status", hrEmployeePage.status);
    const result = await apiRequest(`/api/hr/employees?${params.toString()}`);
    hrEmployeePage = {
      ...hrEmployeePage,
      items: result.items,
      summary: result.summary,
      meta: result.meta,
      loaded: true,
      loading: false,
    };
  } catch (error) {
    hrEmployeePage = { ...hrEmployeePage, loading: false, loaded: true, error: error.message || "加载失败" };
  }
  render();
}

async function loadHrEmployeeDetail(employeeId) {
  hrEmployeeDetailState = { id: employeeId, detail: null, loading: true, error: "", creating: false };
  render();
  try {
    const detail = await apiRequest(`/api/hr/employees/${employeeId}`);
    hrEmployeeDetailState = { id: employeeId, detail, loading: false, error: "", creating: false };
  } catch (error) {
    hrEmployeeDetailState = { id: employeeId, detail: null, loading: false, error: error.message || "加载失败", creating: false };
  }
  render();
}

async function loadHrOrgData() {
  hrOrgState = { ...hrOrgState, loading: true, error: "" };
  render();
  try {
    // 学部负责人无薪资模板权限，避免 403 拖垮整个组织数据加载
    const canSeeTemplates = ["hr", "finance", "system_admin"].includes(currentRole());
    const [unitsResult, positionsResult, templatesResult] = await Promise.all([
      apiRequest("/api/hr/org-units"),
      apiRequest("/api/hr/positions"),
      canSeeTemplates ? apiRequest("/api/hr/salary-templates") : Promise.resolve({ templates: [] }),
    ]);
    hrOrgState = {
      units: unitsResult.units,
      positions: positionsResult.positions,
      templates: templatesResult.templates,
      loaded: true,
      loading: false,
      error: "",
    };
  } catch (error) {
    hrOrgState = { ...hrOrgState, loading: false, loaded: true, error: error.message || "加载失败" };
  }
  render();
}

async function loadHrAuditPage(overrides = {}) {
  hrAuditPage = { ...hrAuditPage, ...overrides, loading: true, error: "" };
  render();
  try {
    const params = new URLSearchParams({ page: String(hrAuditPage.page), pageSize: "20" });
    if (hrAuditPage.action) params.set("action", hrAuditPage.action);
    if (hrAuditPage.search) params.set("search", hrAuditPage.search);
    const result = await apiRequest(`/api/hr/audit-logs?${params.toString()}`);
    hrAuditPage = { ...hrAuditPage, items: result.items, meta: result.meta, loaded: true, loading: false };
  } catch (error) {
    hrAuditPage = { ...hrAuditPage, loading: false, loaded: true, error: error.message || "加载失败" };
  }
  render();
}

async function loadMyHrProfile() {
  myHrProfileState = { ...myHrProfileState, loading: true, error: "" };
  render();
  try {
    const data = await apiRequest("/api/hr/my-profile");
    myHrProfileState = { data, loaded: true, loading: false, error: "" };
  } catch (error) {
    myHrProfileState = { data: null, loaded: true, loading: false, error: error.message || "加载失败" };
  }
  render();
}

function hrOrgUnitOptions(selected = "", { activeOnly = true } = {}) {
  return hrOrgState.units
    .filter((unit) => !activeOnly || unit.status === "active")
    .map(
      (unit) =>
        `<option value="${escapeHtml(unit.id)}" ${unit.id === selected ? "selected" : ""}>${escapeHtml(unit.name)}</option>`,
    )
    .join("");
}

function hrPositionOptions(selected = "") {
  return hrOrgState.positions
    .filter((position) => position.status === "active")
    .map(
      (position) =>
        `<option value="${escapeHtml(position.id)}" ${position.id === selected ? "selected" : ""}>${escapeHtml(position.name)}</option>`,
    )
    .join("");
}

function hrCanViewEmployees() {
  return isHrManagerRole() || currentRole() === "division_head";
}

function renderHrEmployees() {
  if (state.activeView !== "hrEmployees" || !hrCanViewEmployees()) return;
  if (!backendMode()) return;
  if (!hrEmployeePage.loaded && !hrEmployeePage.loading) {
    loadHrEmployeePage();
    return;
  }
  if (!hrOrgState.loaded && !hrOrgState.loading) loadHrOrgData();

  const readOnly = !isHrManagerRole();
  document.querySelector("#hrExportRoster").classList.toggle("is-hidden", readOnly);
  document.querySelector("#hrCreateEmployee").classList.toggle("is-hidden", readOnly);

  const summaryEl = document.querySelector("#hrEmployeeSummary");
  const summary = hrEmployeePage.summary || {};
  summaryEl.innerHTML = [
    ["在职", summary.active || 0],
    ["试用期", summary.probation || 0],
    ["已离职", summary.left || 0],
    ["停用", summary.suspended || 0],
  ]
    .map(
      ([label, count]) => `
        <article class="metric">
          <span>${label}</span>
          <strong>${count}</strong>
          <small>共 ${summary.total || 0} 份档案</small>
        </article>
      `,
    )
    .join("");

  document.querySelector("#hrEmployeeToolbar").innerHTML = `
    <input id="hrEmpSearch" type="search" placeholder="搜索姓名 / 工号 / 电话" value="${escapeHtml(hrEmployeePage.search)}" />
    <select id="hrEmpOrgFilter">
      <option value="">全部组织</option>
      ${hrOrgUnitOptions(hrEmployeePage.orgUnitId, { activeOnly: false })}
    </select>
    <select id="hrEmpStatusFilter">
      <option value="">全部状态</option>
      ${HR_STATUS_OPTIONS.map(([value, label]) => `<option value="${value}" ${hrEmployeePage.status === value ? "selected" : ""}>${label}</option>`).join("")}
    </select>
    <button class="ghost-button compact-button" id="hrEmpQuery" type="button">查询</button>
  `;

  const listEl = document.querySelector("#hrEmployeeList");
  if (hrEmployeePage.error) {
    listEl.innerHTML = loadErrorHtml(hrEmployeePage.error, "hrEmployees");
  } else if (hrEmployeePage.loading && !hrEmployeePage.items.length) {
    listEl.innerHTML = skeletonListHtml(5);
  } else if (!hrEmployeePage.items.length) {
    listEl.innerHTML = `<div class="empty-state">没有匹配的档案</div>`;
  } else {
    listEl.innerHTML = hrEmployeePage.items
      .map(
        (employee) => `
          <button class="hr-employee-row ${employee.id === hrEmployeeDetailState.id ? "active" : ""}" data-hr-employee="${escapeHtml(employee.id)}" type="button">
            <div>
              <strong>${escapeHtml(employee.personName)}</strong>
              <span>${escapeHtml(employee.employeeNo)} · ${escapeHtml(employee.orgUnitName || "未分配")} · ${escapeHtml(employee.positionName || "未定岗")}</span>
            </div>
            <span class="${hrStatusPillClass(employee.status)}">${escapeHtml(employee.statusLabel)}</span>
          </button>
        `,
      )
      .join("");
  }

  const meta = hrEmployeePage.meta;
  document.querySelector("#hrEmployeePagination").innerHTML = `
    <button class="mini-button" id="hrEmpPrevPage" type="button" ${meta.page <= 1 ? "disabled" : ""}>上一页</button>
    <span>第 ${meta.page} / ${meta.totalPages} 页 · 共 ${meta.total} 人</span>
    <button class="mini-button" id="hrEmpNextPage" type="button" ${meta.page >= meta.totalPages ? "disabled" : ""}>下一页</button>
  `;

  renderHrEmployeeDetail();
}

function hrSensitiveRow(label, masked, has, field) {
  return `
    <div class="hr-field">
      <span>${label}</span>
      <div class="hr-sensitive-line">
        <strong>${has ? escapeHtml(masked) : "未录入"}</strong>
        ${has ? `<button class="mini-button" data-hr-sensitive="${field}" type="button">查看完整</button>` : ""}
      </div>
    </div>
  `;
}

function renderHrEmployeeDetail() {
  const detailEl = document.querySelector("#hrEmployeeDetail");
  if (hrEmployeeDetailState.creating) {
    detailEl.innerHTML = `
      <div class="hr-detail-card">
        <h3>新建档案</h3>
        <div class="hr-form-grid">
          <label class="field-label">姓名<input id="hrNew-personName" /></label>
          <label class="field-label">工号（留空自动生成）<input id="hrNew-employeeNo" /></label>
          <label class="field-label">组织<select id="hrNew-orgUnitId">${hrOrgUnitOptions()}</select></label>
          <label class="field-label">岗位<select id="hrNew-positionId">${hrPositionOptions()}</select></label>
          <label class="field-label">入职日期<input id="hrNew-hiredAt" type="date" /></label>
          <label class="field-label">电话<input id="hrNew-phone" /></label>
          <label class="field-label">证件号（可选，加密存储）<input id="hrNew-idCard" /></label>
          <label class="field-label">初始状态<select id="hrNew-status">${HR_STATUS_OPTIONS.slice(0, 3).map(([value, label]) => `<option value="${value}" ${value === "probation" ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        </div>
        <label class="field-label">建档原因（必填）<input id="hrNew-reason" placeholder="例如 2026 秋季入职批次" /></label>
        <div class="action-row">
          <button class="primary-button compact-button" id="hrNewSubmit" type="button">创建档案</button>
          <button class="ghost-button compact-button" id="hrNewCancel" type="button">取消</button>
        </div>
      </div>
    `;
    return;
  }
  if (hrEmployeeDetailState.loading) {
    detailEl.innerHTML = `<div class="empty-state">档案加载中…</div>`;
    return;
  }
  if (hrEmployeeDetailState.error) {
    detailEl.innerHTML = `<div class="empty-state">${escapeHtml(hrEmployeeDetailState.error)}</div>`;
    return;
  }
  const detail = hrEmployeeDetailState.detail;
  if (!detail) {
    detailEl.innerHTML = `<div class="empty-state">从左侧选择一份档案查看${isHrManagerRole() ? "和编辑" : ""}</div>`;
    return;
  }
  const employee = detail.employee;
  if (!isHrManagerRole()) {
    // 学部负责人只读视图（不含敏感完整值与编辑操作）
    detailEl.innerHTML = `
      <div class="hr-detail-card">
        <div class="hr-detail-head">
          <div>
            <h3>${escapeHtml(employee.personName)}</h3>
            <span>${escapeHtml(employee.employeeNo)} · ${escapeHtml(employee.orgUnitName || "未分配")} · ${escapeHtml(employee.positionName || "未定岗")}</span>
          </div>
          <span class="${hrStatusPillClass(employee.status)}">${escapeHtml(employee.statusLabel)}</span>
        </div>
        <div class="hr-form-grid readonly">
          <div class="hr-field"><span>电话</span><strong>${escapeHtml(employee.phone || "—")}</strong></div>
          <div class="hr-field"><span>入职日期</span><strong>${escapeHtml(employee.hiredAt || "—")}</strong></div>
          <div class="hr-field"><span>证件号</span><strong>${escapeHtml(employee.idCardMasked || "未录入")}</strong></div>
          <div class="hr-field"><span>合同数量</span><strong>${detail.contracts.length}</strong></div>
        </div>
        <p class="action-hint">学部负责人为只读视图；档案编辑与敏感信息查看请联系人事专员。</p>
      </div>
    `;
    return;
  }
  detailEl.innerHTML = `
    <div class="hr-detail-card">
      <div class="hr-detail-head">
        <div>
          <h3>${escapeHtml(employee.personName)}</h3>
          <span>${escapeHtml(employee.employeeNo)} · ${escapeHtml(employee.orgUnitName || "未分配")} · ${escapeHtml(employee.positionName || "未定岗")}</span>
        </div>
        <span class="${hrStatusPillClass(employee.status)}">${escapeHtml(employee.statusLabel)}</span>
      </div>

      <div class="hr-form-grid">
        <label class="field-label">姓名<input id="hrEmp-personName" value="${escapeHtml(employee.personName)}" /></label>
        <label class="field-label">性别<input id="hrEmp-gender" value="${escapeHtml(employee.gender)}" /></label>
        <label class="field-label">电话<input id="hrEmp-phone" value="${escapeHtml(employee.phone)}" /></label>
        <label class="field-label">紧急联系人<input id="hrEmp-emergencyContact" value="${escapeHtml(employee.emergencyContact)}" /></label>
        <label class="field-label">紧急联系电话<input id="hrEmp-emergencyPhone" value="${escapeHtml(employee.emergencyPhone)}" /></label>
        <label class="field-label">入职日期<input id="hrEmp-hiredAt" type="date" value="${escapeHtml(employee.hiredAt)}" /></label>
        <label class="field-label">组织<select id="hrEmp-orgUnitId">${hrOrgUnitOptions(employee.orgUnitId)}</select></label>
        <label class="field-label">岗位<select id="hrEmp-positionId">${hrPositionOptions(employee.positionId)}</select></label>
        <label class="field-label">职称<select id="hrEmp-titleGrade">${hrTitleGradeOptions(employee.titleGrade)}</select></label>
        <label class="field-label">学历<select id="hrEmp-degree">${hrDegreeOptions(employee.degree)}</select></label>
        <label class="field-label">证件号（填写即更新，加密存储）<input id="hrEmp-idCard" placeholder="${employee.hasIdCard ? "已录入，填写新值可替换" : "未录入"}" /></label>
        <label class="field-label">银行卡号（填写即更新，加密存储）<input id="hrEmp-bankCard" placeholder="${employee.hasBankCard ? "已录入，填写新值可替换" : "未录入"}" /></label>
      </div>
      <p class="action-hint">职称与学历是人事评定/证书事实，决定基本工资档与学历补贴；财务不可修改。</p>

      <div class="hr-detail-section">
        <h3>兼岗任命</h3>
        <p class="action-hint">班主任、年级主任等职务由人事任命，直接决定兼岗津贴；财务侧只读。</p>
        <div class="checkbox-grid hr-role-grid">
          ${HR_TEACHER_ROLE_FIELDS.filter((field) => field.type === "boolean")
            .map(
              (field) => `
                <label><input data-hr-role="${escapeHtml(field.key)}" type="checkbox" ${employee.teacherRoles?.[field.key] ? "checked" : ""} /><span>${escapeHtml(field.label)}</span></label>
              `,
            )
            .join("")}
        </div>
        <div class="hr-form-grid">
          ${HR_TEACHER_ROLE_FIELDS.filter((field) => field.type === "number")
            .map(
              (field) => `
                <label class="field-label">${escapeHtml(field.label)}<input data-hr-role-number="${escapeHtml(field.key)}" type="number" min="0" value="${Number(employee.teacherRoles?.[field.key] || 0)}" /></label>
              `,
            )
            .join("")}
        </div>
      </div>

      ${hrSensitiveRow("证件号", employee.idCardMasked, employee.hasIdCard, "idCard")}
      ${hrSensitiveRow("银行卡号", employee.bankCardMasked, employee.hasBankCard, "bankCard")}
      <p class="action-hint" id="hrSensitiveReveal"></p>

      <label class="field-label">修改原因（必填）<input id="hrEmp-reason" placeholder="每次保存必须说明原因" /></label>
      <div class="action-row">
        <button class="primary-button compact-button" data-hr-emp-save type="button">保存档案</button>
      </div>

      ${employee.teacherId ? hrAssessmentSection(employee) : ""}

      <div class="hr-detail-section">
        <h3>人事状态</h3>
        <div class="hr-inline-form">
          <select id="hrEmp-nextStatus">
            ${HR_STATUS_OPTIONS.map(([value, label]) => `<option value="${value}" ${value === employee.status ? "selected" : ""}>${label}</option>`).join("")}
          </select>
          <input id="hrEmp-statusReason" placeholder="状态变更原因（必填）" />
          <button class="ghost-button compact-button" data-hr-emp-status type="button">变更状态</button>
        </div>
        <p class="action-hint">离职/停用会同步冻结教学侧账号资格；完整业务联动在 M4 交付。</p>
      </div>

      <div class="hr-detail-section">
        <h3>合同（${detail.contracts.length}）</h3>
        ${
          detail.contracts.length
            ? detail.contracts
                .map(
                  (contract) => `
                    <div class="hr-contract-row">
                      <strong>${contract.type === "fixed_term" ? "固定期限" : contract.type === "open_term" ? "无固定期限" : "实习"}</strong>
                      <span>${escapeHtml(contract.startDate)} ~ ${escapeHtml(contract.endDate || "长期")}</span>
                      <span>${escapeHtml(contract.fileRef || "无扫描件编号")}</span>
                    </div>
                  `,
                )
                .join("")
            : `<div class="empty-state">暂无合同记录</div>`
        }
        <div class="hr-inline-form">
          <select id="hrContract-type">
            <option value="fixed_term">固定期限</option>
            <option value="open_term">无固定期限</option>
            <option value="internship">实习</option>
          </select>
          <input id="hrContract-start" type="date" />
          <input id="hrContract-end" type="date" />
          <input id="hrContract-reason" placeholder="登记原因（必填）" />
          <button class="ghost-button compact-button" data-hr-contract-add type="button">登记合同</button>
        </div>
      </div>

      ${
        detail.pendingChangeRequests.length
          ? `
            <div class="hr-detail-section">
              <h3>待审核变更申请</h3>
              ${detail.pendingChangeRequests
                .map(
                  (flow) => `
                    <div class="hr-request-row">
                      <div>
                        <strong>${Object.entries(flow.payload.changes)
                          .map(([field, value]) => `${field === "phone" ? "电话" : field === "emergencyContact" ? "紧急联系人" : "紧急联系电话"} → ${escapeHtml(value)}`)
                          .join("；")}</strong>
                        <span>${escapeHtml(flow.payload.reason)}</span>
                      </div>
                      <div class="hr-inline-actions">
                        <button class="mini-button primary" data-hr-pcr-approve="${escapeHtml(flow.id)}" type="button">通过</button>
                        <button class="mini-button" data-hr-pcr-reject="${escapeHtml(flow.id)}" type="button">拒绝</button>
                      </div>
                    </div>
                  `,
                )
                .join("")}
            </div>
          `
          : ""
      }
    </div>
  `;
}

function hrOrgTreeRows(units) {
  const byParent = new Map();
  units.forEach((unit) => {
    const key = unit.parentId || "";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(unit);
  });
  const rows = [];
  const walk = (parentId, depth) => {
    (byParent.get(parentId) || []).forEach((unit) => {
      rows.push({ unit, depth });
      walk(unit.id, depth + 1);
    });
  };
  walk("", 0);
  return rows;
}

const ORG_TYPE_LABELS = { school: "总校", division: "学部", department: "部门", grade_group: "年级组" };

function renderHrOrg() {
  if (state.activeView !== "hrOrg") return;
  if (!backendMode()) return;
  if (!hrOrgState.loaded && !hrOrgState.loading) {
    loadHrOrgData();
    return;
  }
  const manager = isHrManagerRole();

  const treeEl = document.querySelector("#hrOrgTree");
  if (hrOrgState.error) {
    treeEl.innerHTML = `<div class="empty-state">${escapeHtml(hrOrgState.error)}</div>`;
  } else {
    treeEl.innerHTML = hrOrgTreeRows(hrOrgState.units)
      .map(
        ({ unit, depth }) => `
          <div class="hr-org-node ${unit.status === "disabled" ? "disabled" : ""}" style="--depth: ${depth}">
            <div class="hr-org-node-main">
              <strong>${escapeHtml(unit.name)}</strong>
              <span class="hr-badge">${ORG_TYPE_LABELS[unit.type] || unit.type}</span>
              ${unit.stageId ? `<span class="hr-badge stage">排课:${escapeHtml(unit.stageId)}</span>` : ""}
              <span class="hr-org-count">${unit.activeEmployeeCount} 人</span>
            </div>
            ${
              manager && unit.type !== "school"
                ? `
                  <div class="hr-inline-actions">
                    <button class="mini-button" data-hr-org-rename="${escapeHtml(unit.id)}" type="button">改名</button>
                    <button class="mini-button" data-hr-org-status="${escapeHtml(unit.id)}" data-next-status="${unit.status === "active" ? "disabled" : "active"}" type="button">${unit.status === "active" ? "停用" : "启用"}</button>
                  </div>
                `
                : ""
            }
          </div>
        `,
      )
      .join("");
  }

  document.querySelector("#hrOrgForm").innerHTML = manager
    ? `
      <div class="hr-inline-form">
        <input id="hrOrgNew-name" placeholder="新节点名称" />
        <select id="hrOrgNew-type">
          <option value="department">部门</option>
          <option value="grade_group">年级组</option>
          <option value="division">学部</option>
        </select>
        <select id="hrOrgNew-parent">${hrOrgUnitOptions()}</select>
        <input id="hrOrgNew-reason" placeholder="新增原因（必填）" />
        <button class="ghost-button compact-button" id="hrOrgNewSubmit" type="button">新增节点</button>
      </div>
    `
    : "";

  const positionEl = document.querySelector("#hrPositionTable");
  positionEl.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>编码</th><th>岗位</th><th>序列</th><th>任职</th><th>状态</th></tr></thead>
        <tbody>
          ${hrOrgState.positions
            .map(
              (position) => `
                <tr>
                  <td>${escapeHtml(position.code)}</td>
                  <td>${escapeHtml(position.name)}</td>
                  <td>${escapeHtml(position.series)}</td>
                  <td>${position.activeHolderCount}</td>
                  <td><span class="${position.status === "active" ? "status-pill done" : "status-pill warning"}">${position.status === "active" ? "启用" : "停用"}</span></td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  const canSeePayload = currentRole() === "finance" || currentRole() === "system_admin";
  document.querySelector("#hrTemplateList").innerHTML = hrOrgState.templates
    .map(
      (template) => `
        <div class="hr-template-card">
          <div class="hr-detail-head">
            <div>
              <strong>${escapeHtml(template.name)}</strong>
              <span>绑定岗位：${escapeHtml(template.positionName || template.positionId)} · 最新 v${template.latestVersion}</span>
            </div>
            ${
              canSeePayload
                ? `<div class="hr-inline-actions">
                    <button class="mini-button" data-hr-tpl-version="${escapeHtml(template.id)}" type="button">发布新版本</button>
                    <button class="mini-button primary" data-hr-tpl-apply="${escapeHtml(template.id)}" type="button">批量应用</button>
                  </div>`
                : `<span class="hr-badge">金额仅财务可见</span>`
            }
          </div>
          ${
            canSeePayload && template.versions[0]?.payload
              ? `<details class="hr-payload-details"><summary>v${template.versions[0].version} 内容（${escapeHtml(template.versions[0].effectiveFrom)} 生效）</summary><pre>${escapeHtml(JSON.stringify(template.versions[0].payload, null, 2))}</pre></details>`
              : ""
          }
        </div>
      `,
    )
    .join("");
}

function renderHrAudit() {
  if (state.activeView !== "hrAudit" || !isHrManagerRole()) return;
  if (!backendMode()) return;
  if (!hrAuditPage.loaded && !hrAuditPage.loading) {
    loadHrAuditPage();
    return;
  }

  document.querySelector("#hrAuditToolbar").innerHTML = `
    <select id="hrAuditAction">
      <option value="">全部操作</option>
      ${Object.entries(HR_ACTION_LABELS)
        .map(([value, label]) => `<option value="${value}" ${hrAuditPage.action === value ? "selected" : ""}>${label}</option>`)
        .join("")}
    </select>
    <input id="hrAuditSearch" type="search" placeholder="搜索操作人 / 原因 / 目标" value="${escapeHtml(hrAuditPage.search)}" />
    <button class="ghost-button compact-button" id="hrAuditQuery" type="button">查询</button>
  `;

  const listEl = document.querySelector("#hrAuditList");
  if (hrAuditPage.error) {
    listEl.innerHTML = `<div class="empty-state">${escapeHtml(hrAuditPage.error)}</div>`;
  } else if (!hrAuditPage.items.length) {
    listEl.innerHTML = `<div class="empty-state">暂无审计记录</div>`;
  } else {
    listEl.innerHTML = hrAuditPage.items
      .map(
        (entry) => `
          <div class="hr-audit-row">
            <div class="hr-audit-main">
              <span class="hr-badge">${escapeHtml(HR_ACTION_LABELS[entry.action] || entry.action)}</span>
              <strong>${escapeHtml(entry.actorName || entry.actorAccountId)}</strong>
              <span>${escapeHtml(entry.createdAt.replace("T", " ").slice(0, 19))}</span>
              ${entry.targetEmployeeId ? `<span>档案 ${escapeHtml(entry.targetEmployeeId)}</span>` : ""}
            </div>
            ${entry.reason ? `<p class="hr-audit-reason">${escapeHtml(entry.reason)}</p>` : ""}
            ${
              entry.fieldDiffs.length
                ? `
                  <details class="hr-diff-details">
                    <summary>${entry.fieldDiffs.length} 个字段变化</summary>
                    <table class="hr-diff-table">
                      <thead><tr><th>字段</th><th>前值</th><th>后值</th></tr></thead>
                      <tbody>
                        ${entry.fieldDiffs
                          .map(
                            (diff) => `<tr><td>${escapeHtml(diff.field)}</td><td>${escapeHtml(diff.before || "（空）")}</td><td>${escapeHtml(diff.after || "（空）")}</td></tr>`,
                          )
                          .join("")}
                      </tbody>
                    </table>
                  </details>
                `
                : ""
            }
          </div>
        `,
      )
      .join("");
  }

  const meta = hrAuditPage.meta;
  document.querySelector("#hrAuditPagination").innerHTML = `
    <button class="mini-button" id="hrAuditPrevPage" type="button" ${meta.page <= 1 ? "disabled" : ""}>上一页</button>
    <span>第 ${meta.page} / ${meta.totalPages} 页 · 共 ${meta.total} 条</span>
    <button class="mini-button" id="hrAuditNextPage" type="button" ${meta.page >= meta.totalPages ? "disabled" : ""}>下一页</button>
  `;
}

const PROFILE_FIELD_LABELS = { phone: "电话", emergencyContact: "紧急联系人", emergencyPhone: "紧急联系电话" };
const FLOW_STATUS_LABELS = { pending: "待审核", approved: "已通过", rejected: "已拒绝", withdrawn: "已撤回" };

function renderMyHrProfile() {
  if (state.activeView !== "myHrProfile" || currentRole() !== "teacher") return;
  if (!backendMode()) {
    document.querySelector("#myHrProfileCard").innerHTML = `<div class="empty-state">请使用后端模式登录查看账户信息</div>`;
    return;
  }
  if (!myHrProfileState.loaded && !myHrProfileState.loading) {
    loadMyHrProfile();
    return;
  }
  const cardEl = document.querySelector("#myHrProfileCard");
  if (myHrProfileState.error) {
    cardEl.innerHTML = `<div class="empty-state">${escapeHtml(myHrProfileState.error)}</div>`;
    document.querySelector("#myHrChangeForm").innerHTML = "";
    document.querySelector("#myHrRequestList").innerHTML = "";
    return;
  }
  const employee = myHrProfileState.data.employee;
  cardEl.innerHTML = `
    <div class="my-hr-hero">
      <div class="my-hr-avatar">${escapeHtml((employee.personName || "?").slice(0, 1))}</div>
      <div>
        <h3>${escapeHtml(employee.personName)}</h3>
        <span>${escapeHtml(employee.employeeNo)} · ${escapeHtml(employee.orgUnitName || "未分配")} · ${escapeHtml(employee.positionName || "未定岗")}</span>
      </div>
      <span class="${hrStatusPillClass(employee.status)}">${escapeHtml(employee.statusLabel)}</span>
    </div>
    <div class="hr-form-grid readonly">
      <div class="hr-field"><span>人事状态</span><strong>${escapeHtml(employee.statusLabel)}</strong></div>
      <div class="hr-field"><span>入职日期</span><strong>${escapeHtml(employee.hiredAt || "—")}</strong></div>
      <div class="hr-field"><span>证件号</span><strong>${escapeHtml(employee.idCardMasked || "未录入")}</strong></div>
      <div class="hr-field"><span>银行卡</span><strong>${escapeHtml(employee.bankCardMasked || "未录入")}</strong></div>
    </div>
  `;

  const editing = Boolean(myHrProfileState.editing);
  document.querySelector("#myHrChangeForm").innerHTML = `
    <div class="my-hr-contact-head">
      <h3>联系方式</h3>
      ${
        editing
          ? ""
          : `<button class="mini-button" data-myhr-edit type="button" title="申请修改联系方式">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m13.5 6.5 4 4"/></svg>
              修改
            </button>`
      }
    </div>
    <div class="hr-form-grid readonly">
      <div class="hr-field"><span>电话</span><strong>${escapeHtml(employee.phone || "未录入")}</strong></div>
      <div class="hr-field"><span>紧急联系人</span><strong>${escapeHtml(employee.emergencyContact || "未录入")}</strong></div>
      <div class="hr-field"><span>紧急联系电话</span><strong>${escapeHtml(employee.emergencyPhone || "未录入")}</strong></div>
    </div>
    ${
      editing
        ? `
          <div class="my-hr-edit-form">
            <div class="hr-form-grid">
              <label class="field-label">电话<input id="myHr-phone" value="${escapeHtml(employee.phone || "")}" /></label>
              <label class="field-label">紧急联系人<input id="myHr-emergencyContact" value="${escapeHtml(employee.emergencyContact || "")}" /></label>
              <label class="field-label">紧急联系电话<input id="myHr-emergencyPhone" value="${escapeHtml(employee.emergencyPhone || "")}" /></label>
            </div>
            <label class="field-label">申请原因（必填）<input id="myHr-reason" placeholder="例如 更换手机号" /></label>
            <div class="action-row">
              <button class="primary-button compact-button" id="myHrSubmitChange" type="button">提交申请</button>
              <button class="ghost-button compact-button" data-myhr-edit-cancel type="button">取消</button>
            </div>
            <p class="action-hint">只有与当前值不同的字段会进入申请；人事专员审核通过后生效。</p>
          </div>
        `
        : ""
    }
  `;
  const requests = myHrProfileState.data.changeRequests || [];
  document.querySelector("#myHrRequestList").innerHTML = `
    <h3>我的申请</h3>
    ${
      requests.length
        ? requests
            .map(
              (flow) => `
                <div class="hr-request-row">
                  <div>
                    <strong>${Object.entries(flow.payload.changes)
                      .map(([field, value]) => `${PROFILE_FIELD_LABELS[field] || field} → ${escapeHtml(value)}`)
                      .join("；")}</strong>
                    <span>${escapeHtml(flow.createdAt.replace("T", " ").slice(0, 16))} · ${escapeHtml(flow.payload.reason)}</span>
                  </div>
                  <div class="hr-inline-actions">
                    <span class="${flow.status === "approved" ? "status-pill done" : flow.status === "pending" ? "status-pill" : "status-pill warning"}">${FLOW_STATUS_LABELS[flow.status]}</span>
                    ${flow.status === "pending" ? `<button class="mini-button" data-hr-pcr-withdraw="${escapeHtml(flow.id)}" type="button">撤回</button>` : ""}
                  </div>
                </div>
              `,
            )
            .join("")
        : `<div class="empty-state">暂无申请记录</div>`
    }
  `;
}

// ===========================================================================
// 审批中心（通用 OA）：模板驱动，表单与流程由后端模板定义，前端动态渲染
// ===========================================================================
let oaState = {
  templates: [],
  templatesLoaded: false,
  scope: "todo",
  status: "",
  search: "",
  page: 1,
  items: [],
  meta: null,
  todoCount: 0,
  loading: false,
  error: "",
};

function resetOaState() {
  oaAdminState = { templates: [], approverRoles: [], fieldTypes: [], loading: false, error: "" };
  oaState = { ...oaState, templates: [], templatesLoaded: false, items: [], meta: null, page: 1, todoCount: 0, error: "" };
}

async function loadOaTemplates() {
  if (!backendMode() || oaState.templatesLoaded) return;
  try {
    const result = await apiRequest("/api/oa/templates");
    oaState = { ...oaState, templates: result.templates || [], templatesLoaded: true };
  } catch (error) {
    oaState = { ...oaState, templates: [], templatesLoaded: true };
  }
}

async function loadOaRequests(overrides = {}) {
  if (!backendMode()) return;
  oaState = { ...oaState, ...overrides, loading: true, error: "" };
  render();
  try {
    const params = new URLSearchParams({
      scope: oaState.scope,
      page: String(oaState.page),
      pageSize: "20",
    });
    if (oaState.status) params.set("status", oaState.status);
    if (oaState.search) params.set("search", oaState.search);
    const [list, todos] = await Promise.all([
      apiRequest(`/api/oa/requests?${params.toString()}`),
      apiRequest("/api/oa/todos"),
    ]);
    oaState = {
      ...oaState,
      items: list.items || [],
      meta: list.meta || null,
      todoCount: todos.count || 0,
      loading: false,
    };
  } catch (error) {
    oaState = { ...oaState, items: [], loading: false, error: error.message || "加载失败" };
  }
  render();
}

// 审批类型图标网格（Lark 审批首页的选择方式）
function renderOaTemplateGrid() {
  const grid = document.querySelector("#oaTemplateGrid");
  if (!grid) return;
  if (!oaState.templates.length) {
    grid.innerHTML = `<div class="empty-state compact">当前角色暂无可发起的审批类型</div>`;
    return;
  }
  const groups = new Map();
  oaState.templates.forEach((template) => {
    if (!groups.has(template.category)) groups.set(template.category, []);
    groups.get(template.category).push(template);
  });
  grid.innerHTML = [...groups.entries()]
    .map(
      ([category, templates]) => `
        <div class="approval-entry-group">
          <p class="approval-entry-category">${escapeHtml(category)}</p>
          <div class="approval-entry-items">
            ${templates
              .map(
                (template) => `
                  <button class="approval-entry" data-oa-new="${escapeHtml(template.key)}" type="button">
                    <span class="approval-entry-icon">${escapeHtml(template.icon)}</span>
                    <span class="approval-entry-body">
                      <strong>${escapeHtml(template.name)}</strong>
                      <small>${escapeHtml(template.description)}</small>
                    </span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
      `,
    )
    .join("");
}

const OA_STATUS_CLASS = {
  pending: "warning",
  approved: "done",
  rejected: "danger",
  withdrawn: "muted",
};

function renderOaRequestList() {
  const list = document.querySelector("#oaRequestList");
  if (!list) return;
  if (oaState.error) {
    list.innerHTML = loadErrorHtml(oaState.error, "oaRequests");
    return;
  }
  if (oaState.loading && !oaState.items.length) {
    list.innerHTML = skeletonListHtml(4);
    return;
  }
  if (!oaState.items.length) {
    const emptyText =
      oaState.scope === "todo"
        ? "当前没有需要您处理的审批"
        : oaState.scope === "mine"
          ? "您还没有发起过审批，可从上方选择类型发起"
          : "暂无记录";
    list.innerHTML = `<div class="empty-state">${emptyText}</div>`;
    return;
  }
  list.innerHTML = oaState.items
    .map(
      (item) => `
        <button class="approval-row" data-oa-detail="${escapeHtml(item.id)}" type="button">
          <span class="approval-row-icon">${escapeHtml(item.templateIcon || "📄")}</span>
          <span class="approval-row-body">
            <span class="approval-row-head">
              <strong>${escapeHtml(item.templateName)}</strong>
              <span class="status-pill ${OA_STATUS_CLASS[item.status] || ""}">${escapeHtml(item.statusLabel)}</span>
            </span>
            <span class="approval-row-summary">${escapeHtml(item.summary)}</span>
            <span class="approval-row-meta">
              ${escapeHtml(item.applicantName)}
              ${item.currentStepName ? ` · 当前：${escapeHtml(item.currentStepName)}` : ""}
              · ${escapeHtml(formatDateTimeShort(item.updatedAt))}
            </span>
          </span>
          ${item.canAct ? `<span class="approval-row-flag">待处理</span>` : ""}
        </button>
      `,
    )
    .join("");
}

function formatDateTimeShort(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16).replace("T", " ");
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function renderOaPager() {
  const pager = document.querySelector("#oaPager");
  if (!pager) return;
  const meta = oaState.meta;
  if (!meta || meta.totalPages <= 1) {
    pager.innerHTML = "";
    return;
  }
  pager.innerHTML = `
    <button class="ghost-button compact-button" data-oa-page="${Math.max(1, meta.page - 1)}" ${meta.page <= 1 ? "disabled" : ""} type="button">上一页</button>
    <span>第 ${meta.page} / ${meta.totalPages} 页 · 共 ${meta.total} 条</span>
    <button class="ghost-button compact-button" data-oa-page="${Math.min(meta.totalPages, meta.page + 1)}" ${meta.page >= meta.totalPages ? "disabled" : ""} type="button">下一页</button>
  `;
}

function renderApprovalsView() {
  if (state.activeView !== "approvals") return;
  renderOaTemplateGrid();
  renderOaRequestList();
  renderOaPager();
  const pill = document.querySelector("#oaTodoPill");
  if (pill) {
    pill.textContent = `待办 ${oaState.todoCount}`;
    pill.className = oaState.todoCount ? "status-pill warning" : "status-pill done";
  }
  document.querySelectorAll("[data-oa-scope]").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.oaScope === oaState.scope);
  });
  const search = document.querySelector("#oaSearch");
  if (search && document.activeElement !== search) search.value = oaState.search;
  const statusFilter = document.querySelector("#oaStatusFilter");
  if (statusFilter) statusFilter.value = oaState.status;
}

// 发起申请：按模板字段动态生成表单
async function openOaCreateDialog(templateKey) {
  const template = oaState.templates.find((item) => item.key === templateKey);
  if (!template) return;
  const fields = template.formFields.map((field) => ({
    name: field.key,
    label: field.label,
    type: field.type === "textarea" ? "textarea" : field.type === "select" || field.type === "radio" ? "select" : field.type,
    required: field.required,
    placeholder: field.placeholder || "",
    hint: field.hint || "",
    options: (field.options || []).map((option) => ({ value: option, label: option })),
    value: field.type === "select" || field.type === "radio" ? field.options?.[0] || "" : "",
  }));
  await openDialog({
    title: `发起${template.name}`,
    description: `流程：${template.steps.map((step) => step.name).join(" → ")}`,
    confirmText: "提交申请",
    fields,
    onConfirm: async (values) => {
      await apiRequest("/api/oa/requests", { method: "POST", body: { templateKey, formData: values } });
      showToast("申请已提交");
      loadOaRequests({ scope: "mine", page: 1 });
    },
  });
}

// 请假审批专用：逐节课安排代课教师或取消，通过后直接写入课表
async function openLessonArrangementDialog(detail, approverFields) {
  let data;
  try {
    data = await apiRequest(`/api/oa/lesson-arrangements?requestId=${encodeURIComponent(detail.id)}`);
  } catch (error) {
    showToast(error.message || "无法读取请假期间的课程");
    return;
  }
  const lessons = data.lessons || [];
  const otherFields = approverFields.filter((field) => field.type !== "lessonArrangement");

  const lessonRows = lessons
    .map((lesson, index) => {
      if (!lesson.changeable) {
        return `
          <div class="arrange-row is-blocked">
            <div class="arrange-lesson">
              <strong>${escapeHtml(lesson.date)} ${escapeHtml(lesson.time)}</strong>
              <small>${escapeHtml(lesson.className)} · ${escapeHtml(lesson.subjectName)}</small>
            </div>
            <div class="arrange-blocked">${escapeHtml(lesson.blockedReason)}</div>
          </div>
        `;
      }
      const available = (lesson.candidates || []).filter((item) => item.available);
      const busy = (lesson.candidates || []).filter((item) => !item.available);
      const options = available
        .map((item) => `<option value="${escapeHtml(item.teacherId)}">${escapeHtml(item.name)}（${escapeHtml(item.stageName || "")}）</option>`)
        .join("");
      return `
        <div class="arrange-row" data-arrange-index="${index}" data-lesson-id="${escapeHtml(lesson.lessonId)}">
          <div class="arrange-lesson">
            <strong>${escapeHtml(lesson.date)} ${escapeHtml(lesson.time)}</strong>
            <small>${escapeHtml(lesson.className)} · ${escapeHtml(lesson.subjectName)} · ${escapeHtml(lesson.room || "")}</small>
          </div>
          <div class="arrange-controls">
            <select class="lesson-select" data-arrange-action="${index}">
              <option value="substitute">安排代课</option>
              <option value="cancel">取消该课</option>
            </select>
            <select class="lesson-select" data-arrange-teacher="${index}" ${available.length ? "" : "disabled"}>
              ${options || '<option value="">无可用代课教师</option>'}
            </select>
          </div>
          ${busy.length ? `<div class="arrange-busy">${busy.length} 位同学科教师该时段已有课</div>` : ""}
        </div>
      `;
    })
    .join("");

  const otherFieldRows = otherFields
    .map(
      (field) => `
        <label class="dialog-field">
          <span>${escapeHtml(field.label)}${field.required ? '<span class="dialog-required">*</span>' : ""}</span>
          <input data-arrange-extra="${escapeHtml(field.key)}" type="text" placeholder="${escapeHtml(field.hint || "")}" />
        </label>
      `,
    )
    .join("");

  const root = document.querySelector("#dialogRoot");
  root.innerHTML = `
    <div class="dialog-overlay" data-dialog-overlay>
      <div class="dialog-card arrange-card" role="dialog" aria-modal="true">
        <div class="dialog-head">
          <h3>安排课程后通过</h3>
          <p>${escapeHtml(detail.applicantName)} 请假 ${escapeHtml(data.startDate)} 至 ${escapeHtml(data.endDate)}，共 ${lessons.length} 节课。安排通过后课表立即更新，代课教师会收到通知。</p>
        </div>
        <div class="arrange-body">
          ${lessons.length ? lessonRows : '<div class="empty-state compact">请假期间没有已排课程，可直接通过</div>'}
          ${otherFieldRows}
          <label class="dialog-field">
            <span>审批意见</span>
            <input data-arrange-comment type="text" value="同意" />
          </label>
        </div>
        <p class="dialog-error" data-dialog-error></p>
        <div class="dialog-actions">
          <button class="ghost-button" data-dialog-cancel type="button">取消</button>
          <button class="primary-button" data-arrange-submit type="button">确认并通过</button>
        </div>
      </div>
    </div>
  `;
  root.setAttribute("aria-hidden", "false");
  document.body.classList.add("dialog-open");

  const close = () => {
    root.innerHTML = "";
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("dialog-open");
    activeDialogClose = null;
  };
  activeDialogClose = close;
  root.querySelector("[data-dialog-cancel]").addEventListener("click", close);
  root.querySelector("[data-dialog-overlay]").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) close();
  });

  // 选择"取消该课"时隐藏代课教师下拉
  root.querySelectorAll("[data-arrange-action]").forEach((select) => {
    select.addEventListener("change", () => {
      const index = select.dataset.arrangeAction;
      const teacherSelect = root.querySelector(`[data-arrange-teacher="${index}"]`);
      if (teacherSelect) teacherSelect.style.display = select.value === "cancel" ? "none" : "";
    });
  });

  const errorEl = root.querySelector("[data-dialog-error]");
  const submitButton = root.querySelector("[data-arrange-submit]");
  submitButton.addEventListener("click", async () => {
    const arrangements = [];
    let invalid = "";
    root.querySelectorAll("[data-arrange-index]").forEach((row) => {
      const index = row.dataset.arrangeIndex;
      const action = root.querySelector(`[data-arrange-action="${index}"]`)?.value || "substitute";
      const lessonId = row.dataset.lessonId;
      if (action === "cancel") {
        arrangements.push({ lessonId, action: "cancel" });
        return;
      }
      const teacherId = root.querySelector(`[data-arrange-teacher="${index}"]`)?.value || "";
      if (!teacherId) {
        const lesson = lessons.find((item) => item.lessonId === lessonId);
        invalid = `${lesson?.date || ""} ${lesson?.time || ""} 没有可用代课教师，请改为取消该课`;
        return;
      }
      arrangements.push({ lessonId, substituteTeacherId: teacherId });
    });
    if (invalid) {
      errorEl.textContent = invalid;
      return;
    }
    const approverData = { lessonArrangements: arrangements };
    // 请假期间无课时显式标记，避免被必填校验拦下
    if (!lessons.length) approverData.lessonArrangements__empty = true;
    root.querySelectorAll("[data-arrange-extra]").forEach((input) => {
      approverData[input.dataset.arrangeExtra] = input.value.trim();
    });
    const comment = root.querySelector("[data-arrange-comment]")?.value.trim() || "";

    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    errorEl.textContent = "";
    try {
      const result = await apiRequest(`/api/oa/requests/${detail.id}/approve`, {
        method: "POST",
        body: { comment, approverData },
      });
      const applied = result.request?.steps?.[0]?.approverData?.lessonArrangementResult;
      close();
      const appliedCount = applied?.applied?.length || 0;
      const cancelledCount = applied?.cancelled?.length || 0;
      showToast(
        appliedCount || cancelledCount
          ? `已通过：${appliedCount} 节安排代课、${cancelledCount} 节取消，课表已更新`
          : "已通过",
      );
      loadOaRequests();
    } catch (error) {
      errorEl.textContent = error.message || "操作失败";
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
    }
  });
}

// 详情：表单内容 + 流程进度时间线 + 操作
async function openOaDetail(requestId) {
  let detail;
  try {
    const result = await apiRequest(`/api/oa/requests/${requestId}`);
    detail = result.request;
  } catch (error) {
    showToast(error.message || "加载详情失败");
    return;
  }
  const fieldRows = (detail.formFields || [])
    .map((field) => {
      const value = detail.formData?.[field.key];
      if (value === undefined || value === "") return "";
      return `<div class="approval-detail-row"><span>${escapeHtml(field.label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
    })
    .join("");
  const stepRows = detail.steps
    .map((step) => {
      const stateClass =
        step.status === "approved" ? "done" : step.status === "rejected" ? "danger" : step.status === "pending" ? "current" : "";
      const votes = step.approvals
        .map((vote) => `${escapeHtml(vote.accountName)}${vote.comment ? `：${escapeHtml(vote.comment)}` : ""}`)
        .join("；");
      // 上级在该环节安排的内容（如代课安排），申请人与后续审批人都能看到
      const arrangements = (step.approverFields || [])
        .map((field) => {
          const value = step.approverData?.[field.key];
          // 课程安排展示实际执行结果：哪节课由谁代、哪节课取消
          if (field.type === "lessonArrangement") {
            const result = step.approverData?.lessonArrangementResult;
            if (!result) return "";
            const rows = [
              ...(result.applied || []).map(
                (item) =>
                  `${escapeHtml(item.date)} ${escapeHtml(item.time)} ${escapeHtml(item.className)}${escapeHtml(item.subjectName)} → ${escapeHtml(item.substituteTeacherName)} 代课`,
              ),
              ...(result.cancelled || []).map(
                (item) => `${escapeHtml(item.date)} ${escapeHtml(item.time)} ${escapeHtml(item.className)}${escapeHtml(item.subjectName)} → 已取消`,
              ),
            ];
            if (!rows.length) return "";
            return `<small class="approval-step-arrangement"><b>${escapeHtml(field.label)}（课表已更新）：</b><br>${rows.join("<br>")}</small>`;
          }
          return value ? `<small class="approval-step-arrangement"><b>${escapeHtml(field.label)}：</b>${escapeHtml(value)}</small>` : "";
        })
        .join("");
      return `
        <li class="approval-step ${stateClass}">
          <span class="approval-step-dot"></span>
          <div>
            <strong>${escapeHtml(step.name)}</strong>
            <small>${votes || (step.status === "pending" ? "等待处理" : "未开始")}</small>
            ${arrangements}
            ${step.actedAt ? `<small>${escapeHtml(formatDateTimeShort(step.actedAt))}</small>` : ""}
          </div>
        </li>
      `;
    })
    .join("");

  const root = document.querySelector("#dialogRoot");
  root.innerHTML = `
    <div class="dialog-overlay" data-dialog-overlay>
      <div class="dialog-card approval-detail-card" role="dialog" aria-modal="true">
        <div class="dialog-head">
          <h3>${escapeHtml(detail.templateIcon || "")} ${escapeHtml(detail.templateName)}</h3>
          <p>${escapeHtml(detail.summary)} · 申请人 ${escapeHtml(detail.applicantName)} · <span class="status-pill ${OA_STATUS_CLASS[detail.status] || ""}">${escapeHtml(detail.statusLabel)}</span></p>
        </div>
        <div class="approval-detail-body">
          <div class="approval-detail-fields">${fieldRows || '<p class="empty-state compact">无表单内容</p>'}</div>
          <ol class="approval-steps">${stepRows}</ol>
        </div>
        <p class="dialog-error" data-dialog-error></p>
        <div class="dialog-actions">
          <button class="ghost-button" data-dialog-cancel type="button">关闭</button>
          ${detail.canUrge ? `<button class="ghost-button" data-oa-urge="${escapeHtml(detail.id)}" type="button">催办</button>` : ""}
          ${detail.canWithdraw ? `<button class="ghost-button" data-oa-withdraw="${escapeHtml(detail.id)}" type="button">撤回</button>` : ""}
          ${detail.canAct ? `<button class="danger-button" data-oa-reject="${escapeHtml(detail.id)}" type="button">拒绝</button>` : ""}
          ${detail.canAct ? `<button class="primary-button" data-oa-approve="${escapeHtml(detail.id)}" type="button">通过</button>` : ""}
        </div>
      </div>
    </div>
  `;
  root.setAttribute("aria-hidden", "false");
  document.body.classList.add("dialog-open");

  const close = () => {
    root.innerHTML = "";
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("dialog-open");
    activeDialogClose = null;
  };
  activeDialogClose = close;
  root.querySelector("[data-dialog-cancel]").addEventListener("click", close);
  root.querySelector("[data-dialog-overlay]").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) close();
  });

  const act = async (action, comment) => {
    await apiRequest(`/api/oa/requests/${detail.id}/${action}`, { method: "POST", body: { comment } });
    close();
    showToast(action === "approve" ? "已通过" : action === "reject" ? "已拒绝" : "操作完成");
    loadOaRequests();
  };

  root.querySelector("[data-oa-approve]")?.addEventListener("click", async () => {
    const approverFields = detail.currentApproverFields || [];
    // 课程安排是结构化的，需要单独的逐节课界面
    if (approverFields.some((field) => field.type === "lessonArrangement")) {
      close();
      openLessonArrangementDialog(detail, approverFields);
      return;
    }
    const dialogFields = [
      ...approverFields.map((field) => ({
        name: field.key,
        label: field.label,
        type: field.type === "textarea" ? "textarea" : field.type,
        required: field.required,
        hint: field.hint || "",
      })),
      { name: "comment", label: "审批意见", value: "同意", required: false },
    ];
    const values = await openDialog({
      title: "通过审批",
      description: approverFields.length ? "以下安排将随审批单留痕，申请人可见。" : "",
      confirmText: "通过",
      fields: dialogFields,
    });
    if (!values) return;
    const { comment, ...approverData } = values;
    try {
      await apiRequest(`/api/oa/requests/${detail.id}/approve`, {
        method: "POST",
        body: { comment, approverData },
      });
      close();
      showToast("已通过");
      loadOaRequests();
    } catch (error) {
      showToast(error.message || "操作失败");
    }
  });
  root.querySelector("[data-oa-reject]")?.addEventListener("click", async () => {
    const comment = await promptDialog("拒绝审批", { label: "拒绝原因", placeholder: "请说明理由", confirmText: "拒绝", danger: true });
    if (!comment) return;
    try {
      await act("reject", comment);
    } catch (error) {
      showToast(error.message || "操作失败");
    }
  });
  root.querySelector("[data-oa-withdraw]")?.addEventListener("click", async () => {
    if (!(await confirmDialog("撤回申请", { description: "撤回后该申请作废，如需继续请重新发起。", confirmText: "撤回", danger: true }))) return;
    try {
      await act("withdraw", "");
    } catch (error) {
      showToast(error.message || "操作失败");
    }
  });
  root.querySelector("[data-oa-urge]")?.addEventListener("click", async () => {
    try {
      await apiRequest(`/api/oa/requests/${detail.id}/urge`, { method: "POST", body: {} });
      showToast("已催办当前审批人");
    } catch (error) {
      showToast(error.message || "催办失败");
    }
  });
}

// ===========================================================================
// 审批流程设置（行政管理自定义审批链路与表单）
// ===========================================================================
let oaAdminState = { templates: [], approverRoles: [], fieldTypes: [], loading: false, error: "" };

async function loadOaAdminTemplates() {
  if (!backendMode()) return;
  oaAdminState = { ...oaAdminState, loading: true, error: "" };
  render();
  try {
    const result = await apiRequest("/api/oa/admin/templates");
    oaAdminState = {
      templates: result.templates || [],
      approverRoles: result.approverRoles || [],
      fieldTypes: result.fieldTypes || [],
      loading: false,
      error: "",
    };
  } catch (error) {
    oaAdminState = { ...oaAdminState, loading: false, error: error.message || "加载失败" };
  }
  render();
}

function roleLabelOf(value) {
  return oaAdminState.approverRoles.find((item) => item.value === value)?.label || value;
}

function renderApprovalSettingsView() {
  if (state.activeView !== "approvalSettings") return;
  const list = document.querySelector("#oaTemplateAdminList");
  if (!list) return;
  if (oaAdminState.error) {
    list.innerHTML = loadErrorHtml(oaAdminState.error, "oaAdminTemplates");
    return;
  }
  if (oaAdminState.loading && !oaAdminState.templates.length) {
    list.innerHTML = skeletonListHtml(4);
    return;
  }
  if (!oaAdminState.templates.length) {
    list.innerHTML = `<div class="empty-state">暂无审批类型，点击右上角新建</div>`;
    return;
  }
  list.innerHTML = oaAdminState.templates
    .map((template) => {
      const chain = template.steps
        .map(
          (step, index) => `
            <span class="approval-chain-node">
              <b>${index + 1}. ${escapeHtml(step.name)}</b>
              <small>${step.approverRoles.map(roleLabelOf).map(escapeHtml).join(" / ")}${step.approverMode === "all" ? " · 会签" : ""}</small>
              ${(step.approverFields || []).length ? `<small class="approval-chain-extra">需填写：${step.approverFields.map((f) => escapeHtml(f.label)).join("、")}</small>` : ""}
            </span>
          `,
        )
        .join('<span class="approval-chain-arrow">→</span>');
      return `
        <div class="approval-template-card ${template.status === "disabled" ? "is-disabled" : ""}">
          <div class="approval-template-head">
            <span class="approval-entry-icon">${escapeHtml(template.icon)}</span>
            <div class="approval-template-title">
              <strong>${escapeHtml(template.name)}</strong>
              <small>${escapeHtml(template.category)} · ${template.formFields.length} 个表单字段 · ${template.steps.length} 级审批${template.builtIn ? " · 内置" : ""}</small>
            </div>
            <span class="status-pill ${template.status === "disabled" ? "muted" : "done"}">${template.status === "disabled" ? "已停用" : "启用中"}</span>
          </div>
          <p class="approval-template-desc">${escapeHtml(template.description || "")}</p>
          <div class="approval-template-applicants">可发起：${template.applicantRoles.map((r) => escapeHtml(r === "teacher" ? "老师" : roleLabelOf(r))).join("、")}</div>
          <div class="approval-chain">${chain}</div>
          <div class="approval-template-actions">
            <button class="ghost-button compact-button" data-oa-tpl-edit="${escapeHtml(template.key)}" type="button">编辑流程</button>
            <button class="ghost-button compact-button" data-oa-tpl-toggle="${escapeHtml(template.key)}" data-next-status="${template.status === "disabled" ? "active" : "disabled"}" type="button">${template.status === "disabled" ? "启用" : "停用"}</button>
            ${template.builtIn ? "" : `<button class="ghost-button compact-button" data-oa-tpl-delete="${escapeHtml(template.key)}" type="button">删除</button>`}
          </div>
        </div>
      `;
    })
    .join("");
}

// 用 JSON 编辑流程定义：兼顾灵活性与实现成本，字段含义在弹层里写清楚
function templateEditorPayload(template) {
  return JSON.stringify(
    {
      name: template.name,
      icon: template.icon,
      category: template.category,
      description: template.description,
      applicantRoles: template.applicantRoles,
      formFields: template.formFields.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: Boolean(field.required),
        ...(field.options?.length ? { options: field.options } : {}),
        ...(field.hint ? { hint: field.hint } : {}),
      })),
      steps: template.steps.map((step) => ({
        name: step.name,
        approverRoles: step.approverRoles,
        approverMode: step.approverMode || "any",
        ...(step.approverFields?.length
          ? {
              approverFields: step.approverFields.map((field) => ({
                key: field.key,
                label: field.label,
                type: field.type,
                required: Boolean(field.required),
                ...(field.hint ? { hint: field.hint } : {}),
              })),
            }
          : {}),
      })),
    },
    null,
    2,
  );
}

const OA_EDITOR_HINT = [
  "applicantRoles：可发起角色，取值 teacher / admin / finance / hr / division_head / system_admin",
  "formFields：申请人填写的字段，type 支持 text / textarea / number / date / select / radio；select 与 radio 必须给 options",
  "steps：审批环节，按顺序执行；approverMode 填 any（任一人通过）或 all（每个角色都要通过）",
  "approverFields：该环节要求审批人填写的内容，例如代课安排，由上级在审批时录入",
].join("\n");

async function openOaTemplateEditor(templateKey) {
  const template = oaAdminState.templates.find((item) => item.key === templateKey);
  if (!template) return;
  const result = await openDialog({
    title: `编辑「${template.name}」流程`,
    description: OA_EDITOR_HINT,
    confirmText: "保存",
    fields: [
      {
        name: "payload",
        label: "流程定义（JSON）",
        type: "textarea",
        rows: 16,
        value: templateEditorPayload(template),
        required: true,
      },
    ],
    onConfirm: async (values) => {
      let payload;
      try {
        payload = JSON.parse(values.payload);
      } catch {
        throw new Error("JSON 格式有误，请检查括号与引号");
      }
      await apiRequest(`/api/oa/admin/templates/${templateKey}`, { method: "PATCH", body: payload });
    },
  });
  if (result) {
    showToast("流程已更新");
    loadOaAdminTemplates();
  }
}

async function openOaTemplateCreator() {
  const sample = {
    name: "用章申请",
    icon: "🔖",
    category: "行政",
    description: "公章、合同章使用申请",
    applicantRoles: ["teacher", "admin", "hr"],
    formFields: [
      { key: "sealType", label: "印章类型", type: "select", required: true, options: ["公章", "合同章"] },
      { key: "purpose", label: "用途说明", type: "textarea", required: true },
    ],
    steps: [
      { name: "部门负责人审批", approverRoles: ["division_head", "admin"], approverMode: "any" },
      { name: "总校批准", approverRoles: ["system_admin"], approverMode: "any" },
    ],
  };
  const result = await openDialog({
    title: "新建审批类型",
    description: OA_EDITOR_HINT,
    confirmText: "创建",
    fields: [
      { name: "key", label: "模板标识", required: true, placeholder: "小写字母/数字/下划线，如 seal_use", hint: "创建后不可修改" },
      {
        name: "payload",
        label: "流程定义（JSON）",
        type: "textarea",
        rows: 16,
        value: JSON.stringify(sample, null, 2),
        required: true,
      },
    ],
    onConfirm: async (values) => {
      let payload;
      try {
        payload = JSON.parse(values.payload);
      } catch {
        throw new Error("JSON 格式有误，请检查括号与引号");
      }
      await apiRequest("/api/oa/admin/templates", { method: "POST", body: { ...payload, key: values.key } });
    },
  });
  if (result) {
    showToast("审批类型已创建");
    loadOaAdminTemplates();
  }
}

document.addEventListener("click", async (event) => {
  if (event.target.closest("#oaTemplateCreate")) {
    openOaTemplateCreator();
    return;
  }
  const editButton = event.target.closest("[data-oa-tpl-edit]");
  if (editButton) {
    openOaTemplateEditor(editButton.dataset.oaTplEdit);
    return;
  }
  const toggleButton = event.target.closest("[data-oa-tpl-toggle]");
  if (toggleButton) {
    const nextStatus = toggleButton.dataset.nextStatus;
    try {
      await apiRequest(`/api/oa/admin/templates/${toggleButton.dataset.oaTplToggle}`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      showToast(nextStatus === "disabled" ? "已停用" : "已启用");
      loadOaAdminTemplates();
    } catch (error) {
      showToast(error.message || "操作失败");
    }
    return;
  }
  const deleteButton = event.target.closest("[data-oa-tpl-delete]");
  if (deleteButton) {
    if (!(await confirmDialog("删除审批类型", { description: "删除后该类型不再可用，已完成的历史单据仍可查看。", confirmText: "删除", danger: true }))) return;
    try {
      await apiRequest(`/api/oa/admin/templates/${deleteButton.dataset.oaTplDelete}`, { method: "DELETE" });
      showToast("已删除");
      loadOaAdminTemplates();
    } catch (error) {
      showToast(error.message || "删除失败");
    }
  }
});

let hrFlowsState = {
  flows: [],
  todoCount: 0,
  status: "",
  todoOnly: true,
  createType: "",
  loaded: false,
  loading: false,
  error: "",
};

async function loadHrFlows(overrides = {}) {
  hrFlowsState = { ...hrFlowsState, ...overrides, loading: true, error: "" };
  render();
  try {
    const params = new URLSearchParams();
    if (hrFlowsState.todoOnly) params.set("todo", "1");
    if (hrFlowsState.status) params.set("status", hrFlowsState.status);
    const [flowsResult, todosResult] = await Promise.all([
      apiRequest(`/api/hr/flows?${params.toString()}`),
      apiRequest("/api/hr/todos"),
    ]);
    hrFlowsState = {
      ...hrFlowsState,
      flows: flowsResult.flows,
      todoCount: todosResult.count,
      loaded: true,
      loading: false,
    };
  } catch (error) {
    hrFlowsState = { ...hrFlowsState, loading: false, loaded: true, error: error.message || "加载失败" };
  }
  render();
}

const HR_FLOW_TYPE_LABELS = { onboard: "入职", transfer: "调岗", offboard: "离职" };

function hrFlowCreateFormHtml() {
  const type = hrFlowsState.createType;
  if (!type) {
    return `
      <div class="hr-inline-form">
        <span>发起流程：</span>
        <button class="ghost-button compact-button" data-hr-flow-new="onboard" type="button">入职申请</button>
        <button class="ghost-button compact-button" data-hr-flow-new="transfer" type="button">调岗申请</button>
        <button class="ghost-button compact-button" data-hr-flow-new="offboard" type="button">离职申请</button>
      </div>
    `;
  }
  if (type === "onboard") {
    const teacherSubjects = (hrOrgState.units.length ? "" : "");
    return `
      <div class="hr-detail-card">
        <h3>发起入职</h3>
        <div class="hr-form-grid">
          <label class="field-label">姓名<input id="hrFlow-personName" /></label>
          <label class="field-label">电话<input id="hrFlow-phone" /></label>
          <label class="field-label">组织节点<select id="hrFlow-orgUnitId">${hrOrgUnitOptions()}</select></label>
          <label class="field-label">岗位<select id="hrFlow-positionId">${hrPositionOptions()}</select></label>
          <label class="field-label">任教学科（教师岗必填）<select id="hrFlow-subjectId"><option value="">—</option>${(state.schedulingConfig?.subjects?.length ? state.schedulingConfig.subjects : Object.values(state.subjects || {})).map((subject) => `<option value="${subject.id}">${escapeHtml(subject.name)}</option>`).join("")}</select></label>
          <label class="field-label">拟入职日期<input id="hrFlow-hiredAt" type="date" /></label>
        </div>
        <label class="field-label">发起原因（必填）<input id="hrFlow-reason" placeholder="例如 高一扩班补充数学教师" /></label>
        <div class="action-row">
          <button class="primary-button compact-button" data-hr-flow-submit="onboard" type="button">提交入职申请</button>
          <button class="ghost-button compact-button" data-hr-flow-cancel type="button">取消</button>
        </div>
      </div>
    `;
  }
  const isTransfer = type === "transfer";
  return `
    <div class="hr-detail-card">
      <h3>发起${isTransfer ? "调岗" : "离职"}</h3>
      <div class="hr-form-grid">
        <label class="field-label">员工工号<input id="hrFlow-employeeNo" placeholder="例如 FY0001" /></label>
        <label class="field-label">生效日期<input id="hrFlow-effectiveDate" type="date" /></label>
        ${
          isTransfer
            ? `
              <label class="field-label">目标组织节点<select id="hrFlow-targetOrgUnitId">${hrOrgUnitOptions()}</select></label>
              <label class="field-label">目标岗位<select id="hrFlow-targetPositionId">${hrPositionOptions()}</select></label>
            `
            : ""
        }
      </div>
      <label class="field-label">${isTransfer ? "调岗" : "离职"}原因（必填）<input id="hrFlow-reason" /></label>
      <div class="action-row">
        <button class="primary-button compact-button" data-hr-flow-submit="${type}" type="button">提交申请</button>
        <button class="ghost-button compact-button" data-hr-flow-cancel type="button">取消</button>
      </div>
    </div>
  `;
}

function hrFlowRowHtml(flow) {
  const statusPill =
    flow.status === "approved"
      ? "status-pill done"
      : flow.status === "pending"
        ? "status-pill"
        : "status-pill warning";
  const subject =
    flow.flowType === "onboard"
      ? `${flow.payload.personName} · ${flow.payload.orgUnitName} · ${flow.payload.positionName}`
      : flow.flowType === "transfer"
        ? `${flow.payload.employeeName} · ${flow.payload.fromOrgUnitName} → ${flow.payload.targetOrgUnitName}（${flow.payload.effectiveDate} 生效）`
        : `${flow.payload.employeeName} · ${flow.payload.fromOrgUnitName}（${flow.payload.effectiveDate} 生效）`;
  return `
    <div class="hr-audit-row">
      <div class="hr-audit-main">
        <span class="hr-badge stage">${HR_FLOW_TYPE_LABELS[flow.flowType] || flow.flowType}</span>
        <strong>${escapeHtml(subject)}</strong>
        <span class="${statusPill}">${FLOW_STATUS_LABELS[flow.status] || flow.status}${flow.status === "pending" ? ` · ${escapeHtml(flow.currentStepName)}` : ""}</span>
      </div>
      <p class="hr-audit-reason">${escapeHtml(flow.payload.reason || "")} · ${escapeHtml(flow.createdByName || "")} ${escapeHtml(flow.createdAt.replace("T", " ").slice(0, 16))}</p>
      ${
        flow.payload.handover
          ? `<p class="hr-audit-reason">交接：生效日后课程 ${flow.payload.handover.futureLessonCount ?? 0} 节${flow.payload.cancelledLessonCount ? `，已自动取消 ${flow.payload.cancelledLessonCount} 节` : ""}</p>`
          : ""
      }
      ${
        flow.payload.result?.username
          ? `<p class="hr-audit-reason">已生成教师账号 ${escapeHtml(flow.payload.result.username)}（默认密码 123456，首登改密）</p>`
          : ""
      }
      <details class="hr-diff-details">
        <summary>审批链（${flow.steps.filter((step) => step.actedAt).length}/${flow.steps.length}）</summary>
        <table class="hr-diff-table">
          <thead><tr><th>步骤</th><th>处理</th><th>意见</th><th>时间</th></tr></thead>
          <tbody>
            ${flow.steps
              .map(
                (step) => `
                  <tr>
                    <td>${escapeHtml(step.stepName)}</td>
                    <td>${step.action === "approve" ? "通过" : step.action === "reject" ? "拒绝" : "待处理"}</td>
                    <td>${escapeHtml(step.comment || "—")}</td>
                    <td>${step.actedAt ? escapeHtml(step.actedAt.replace("T", " ").slice(0, 16)) : "—"}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </details>
      <div class="hr-inline-actions">
        ${flow.canAct ? `<button class="mini-button primary" data-hr-flow-approve="${escapeHtml(flow.id)}" type="button">通过</button><button class="mini-button" data-hr-flow-reject="${escapeHtml(flow.id)}" type="button">拒绝</button>` : ""}
        ${flow.canWithdraw ? `<button class="mini-button" data-hr-flow-withdraw="${escapeHtml(flow.id)}" type="button">撤回</button>` : ""}
      </div>
    </div>
  `;
}

function renderHrFlows() {
  if (state.activeView !== "hrFlows") return;
  if (!backendMode()) return;
  if (!hrFlowsState.loaded && !hrFlowsState.loading) {
    loadHrFlows();
    return;
  }
  if (!hrOrgState.loaded && !hrOrgState.loading) loadHrOrgData();

  document.querySelector("#hrTodoPill").textContent = `待办 ${hrFlowsState.todoCount}`;
  document.querySelector("#hrTodoPill").className = hrFlowsState.todoCount ? "status-pill warning" : "status-pill done";
  document.querySelector("#hrFlowCreate").innerHTML = hrFlowCreateFormHtml();
  document.querySelector("#hrFlowToolbar").innerHTML = `
    <select id="hrFlowScope">
      <option value="todo" ${hrFlowsState.todoOnly ? "selected" : ""}>我的待办</option>
      <option value="all" ${!hrFlowsState.todoOnly ? "selected" : ""}>全部流程</option>
    </select>
    <select id="hrFlowStatus">
      <option value="">全部状态</option>
      ${Object.entries(FLOW_STATUS_LABELS)
        .map(([value, label]) => `<option value="${value}" ${hrFlowsState.status === value ? "selected" : ""}>${label}</option>`)
        .join("")}
    </select>
    <button class="ghost-button compact-button" id="hrFlowQuery" type="button">刷新</button>
  `;

  const listEl = document.querySelector("#hrFlowList");
  if (hrFlowsState.error) {
    listEl.innerHTML = loadErrorHtml(hrFlowsState.error, "hrFlows");
  } else if (hrFlowsState.loading && !hrFlowsState.flows.length) {
    listEl.innerHTML = skeletonListHtml(4);
  } else if (!hrFlowsState.flows.length) {
    listEl.innerHTML = `<div class="empty-state">${hrFlowsState.todoOnly ? "当前没有需要您处理的审批" : "暂无流程记录"}</div>`;
  } else {
    listEl.innerHTML = hrFlowsState.flows.map((flow) => hrFlowRowHtml(flow)).join("");
  }
}

function resetHrFrontendStates() {
  hrEmployeePage = { ...hrEmployeePage, loaded: false, error: "", page: 1 };
  hrEmployeeDetailState = { id: "", detail: null, loading: false, error: "", creating: false };
  hrOrgState = { ...hrOrgState, loaded: false, error: "" };
  hrAuditPage = { ...hrAuditPage, loaded: false, error: "", page: 1 };
  hrFlowsState = { ...hrFlowsState, loaded: false, error: "", createType: "", todoOnly: true, status: "" };
  myHrProfileState = { data: null, loaded: false, loading: false, error: "" };
}

function hrRefreshAfterMutation() {
  hrEmployeePage.loaded = false;
  hrOrgState.loaded = false;
  hrAuditPage.loaded = false;
  hrFlowsState.loaded = false;
  if (hrEmployeeDetailState.id) loadHrEmployeeDetail(hrEmployeeDetailState.id);
  else render();
}

async function hrApiAction(fn, successText) {
  try {
    await fn();
    if (successText) showToast(successText);
    hrRefreshAfterMutation();
  } catch (error) {
    showToast(error.message || "操作失败");
  }
}

// ---- 审批中心交互 ----
document.addEventListener("click", async (event) => {
  const newRequest = event.target.closest("[data-oa-new]");
  if (newRequest) {
    openOaCreateDialog(newRequest.dataset.oaNew);
    return;
  }
  const detailRow = event.target.closest("[data-oa-detail]");
  if (detailRow) {
    openOaDetail(detailRow.dataset.oaDetail);
    return;
  }
  const scopeTab = event.target.closest("[data-oa-scope]");
  if (scopeTab) {
    loadOaRequests({ scope: scopeTab.dataset.oaScope, page: 1 });
    return;
  }
  const pageButton = event.target.closest("[data-oa-page]");
  if (pageButton && !pageButton.disabled) {
    loadOaRequests({ page: Number(pageButton.dataset.oaPage) });
    return;
  }
  if (event.target.closest("#oaRefresh")) {
    loadOaRequests();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "oaStatusFilter") {
    loadOaRequests({ status: event.target.value, page: 1 });
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target.id === "oaSearch" && event.key === "Enter") {
    event.preventDefault();
    loadOaRequests({ search: event.target.value.trim(), page: 1 });
  }
});

document.addEventListener("click", async (event) => {
  // 加载失败重试（骨架屏错误态）
  const retryButton = event.target.closest("[data-retry-action]");
  if (retryButton) {
    const key = retryButton.dataset.retryAction;
    if (key === "oaRequests") loadOaRequests();
    else if (key === "oaAdminTemplates") loadOaAdminTemplates();
    else if (key === "hrEmployees") loadHrEmployeePage();
    else if (key === "hrFlows") loadHrFlows();
    else if (key === "hrOrg") loadHrOrgData();
    else if (key === "hrAudit") loadHrAuditPage();
    else if (key === "financeTeachers") loadFinanceTeacherPage({ page: financeTeacherPage.page });
    return;
  }

  const employeeRow = event.target.closest("[data-hr-employee]");
  if (employeeRow) {
    loadHrEmployeeDetail(employeeRow.dataset.hrEmployee);
    return;
  }

  if (event.target.closest("#hrEmpQuery")) {
    loadHrEmployeePage({
      page: 1,
      search: document.querySelector("#hrEmpSearch").value.trim(),
      orgUnitId: document.querySelector("#hrEmpOrgFilter").value,
      status: document.querySelector("#hrEmpStatusFilter").value,
    });
    return;
  }
  if (event.target.closest("#hrEmpPrevPage")) {
    loadHrEmployeePage({ page: Math.max(hrEmployeePage.meta.page - 1, 1) });
    return;
  }
  if (event.target.closest("#hrEmpNextPage")) {
    loadHrEmployeePage({ page: hrEmployeePage.meta.page + 1 });
    return;
  }

  if (event.target.closest("#hrCreateEmployee")) {
    hrEmployeeDetailState = { id: "", detail: null, loading: false, error: "", creating: true };
    if (!hrOrgState.loaded) await loadHrOrgData();
    render();
    return;
  }
  if (event.target.closest("#hrNewCancel")) {
    hrEmployeeDetailState = { id: "", detail: null, loading: false, error: "", creating: false };
    render();
    return;
  }
  if (event.target.closest("#hrNewSubmit")) {
    await hrApiAction(async () => {
      await apiRequest("/api/hr/employees", {
        method: "POST",
        body: {
          personName: document.querySelector("#hrNew-personName").value.trim(),
          employeeNo: document.querySelector("#hrNew-employeeNo").value.trim(),
          orgUnitId: document.querySelector("#hrNew-orgUnitId").value,
          positionId: document.querySelector("#hrNew-positionId").value,
          hiredAt: document.querySelector("#hrNew-hiredAt").value,
          phone: document.querySelector("#hrNew-phone").value.trim(),
          idCard: document.querySelector("#hrNew-idCard").value.trim(),
          status: document.querySelector("#hrNew-status").value,
          reason: document.querySelector("#hrNew-reason").value.trim(),
        },
      });
      hrEmployeeDetailState = { id: "", detail: null, loading: false, error: "", creating: false };
    }, "档案已创建");
    return;
  }

  if (event.target.closest("[data-hr-emp-save]")) {
    const employeeId = hrEmployeeDetailState.id;
    await hrApiAction(async () => {
      const body = { reason: document.querySelector("#hrEmp-reason").value.trim() };
      [
        "personName",
        "gender",
        "phone",
        "emergencyContact",
        "emergencyPhone",
        "hiredAt",
        "orgUnitId",
        "positionId",
        // 职称与学历：人事事实，决定基本工资档与学历补贴
        "titleGrade",
        "degree",
      ].forEach((field) => {
        const input = document.querySelector(`#hrEmp-${field}`);
        if (input) body[field] = input.value;
      });
      // 兼岗任命随档案一并保存
      body.teacherRoles = hrTeacherRolesFromInputs();
      const idCard = document.querySelector("#hrEmp-idCard").value.trim();
      const bankCard = document.querySelector("#hrEmp-bankCard").value.trim();
      if (idCard) body.idCard = idCard;
      if (bankCard) body.bankCard = bankCard;
      await apiRequest(`/api/hr/employees/${employeeId}`, { method: "PATCH", body });
    }, "档案已保存");
    return;
  }

  // 月度考核：查询与保存
  if (event.target.closest("[data-hr-assess-load]")) {
    const teacherId = hrEmployeeDetailState.detail?.employee?.teacherId;
    const month = document.querySelector("#hrAssessMonth")?.value || "";
    if (teacherId && month) loadHrAssessment(teacherId, month);
    return;
  }
  if (event.target.closest("[data-hr-assess-save]")) {
    const teacherId = hrEmployeeDetailState.detail?.employee?.teacherId;
    const month = document.querySelector("#hrAssessMonth")?.value || "";
    const grade = document.querySelector("#hrAssessGrade")?.value || "default";
    const amountRaw = document.querySelector("#hrAssessAmount")?.value ?? "";
    const note = document.querySelector("#hrAssessNote")?.value.trim() || "";
    if (!teacherId) {
      showToast("该档案未关联教师，无法录入考核");
      return;
    }
    await hrApiAction(async () => {
      await apiRequest("/api/hr/assessments", {
        method: "POST",
        body: { teacherId, month, grade, amount: amountRaw === "" ? null : Number(amountRaw), note },
      });
      await loadHrAssessment(teacherId, month);
    }, "考核已保存，该月未锁定工资单将重算");
    return;
  }

  const sensitiveButton = event.target.closest("[data-hr-sensitive]");
  if (sensitiveButton) {
    const field = sensitiveButton.dataset.hrSensitive;
    const reason = await promptDialog("查看完整敏感信息", {
      label: "查看原因",
      placeholder: "将记入人事审计",
      description: "本次查看会记入审计（含操作人、时间和 IP）。",
      confirmText: "查看",
    });
    if (reason === null) return;
    try {
      const result = await apiRequest(`/api/hr/employees/${hrEmployeeDetailState.id}/sensitive-view`, {
        method: "POST",
        body: { field, reason },
      });
      const hint = document.querySelector("#hrSensitiveReveal");
      if (hint) hint.textContent = `${result.label}：${result.value}（本次查看已记入审计）`;
    } catch (error) {
      showToast(error.message || "查看失败");
    }
    return;
  }

  if (event.target.closest("[data-hr-emp-status]")) {
    await hrApiAction(
      () =>
        apiRequest(`/api/hr/employees/${hrEmployeeDetailState.id}/status`, {
          method: "POST",
          body: {
            status: document.querySelector("#hrEmp-nextStatus").value,
            reason: document.querySelector("#hrEmp-statusReason").value.trim(),
          },
        }),
      "人事状态已变更",
    );
    return;
  }

  if (event.target.closest("[data-hr-contract-add]")) {
    await hrApiAction(
      () =>
        apiRequest(`/api/hr/employees/${hrEmployeeDetailState.id}/contracts`, {
          method: "POST",
          body: {
            type: document.querySelector("#hrContract-type").value,
            startDate: document.querySelector("#hrContract-start").value,
            endDate: document.querySelector("#hrContract-end").value,
            reason: document.querySelector("#hrContract-reason").value.trim(),
          },
        }),
      "合同已登记",
    );
    return;
  }

  if (event.target.closest("#hrExportRoster")) {
    try {
      const result = await apiRequest("/api/hr/employees/export");
      downloadCsvResult(
        { content: result.csv, total: result.rowCount, filename: result.filename },
        result.filename,
        { statusSelector: "#hrExportStatus" },
      );
      hrAuditPage.loaded = false;
    } catch (error) {
      showToast(error.message || "导出失败");
    }
    return;
  }

  const approveButton = event.target.closest("[data-hr-pcr-approve]");
  if (approveButton) {
    const comment = await promptDialog("通过变更申请", {
      label: "审核意见",
      value: "核实通过",
      required: false,
      confirmText: "通过",
    });
    if (comment === null) return;
    await hrApiAction(
      () =>
        apiRequest(`/api/hr/profile-change-requests/${approveButton.dataset.hrPcrApprove}/approve`, {
          method: "POST",
          body: { comment },
        }),
      "已通过并生效",
    );
    return;
  }
  const rejectButton = event.target.closest("[data-hr-pcr-reject]");
  if (rejectButton) {
    const comment = await promptDialog("拒绝变更申请", {
      label: "拒绝原因",
      placeholder: "请说明拒绝理由",
      confirmText: "拒绝",
      danger: true,
    });
    if (!comment) return;
    await hrApiAction(
      () =>
        apiRequest(`/api/hr/profile-change-requests/${rejectButton.dataset.hrPcrReject}/reject`, {
          method: "POST",
          body: { comment },
        }),
      "已拒绝",
    );
    return;
  }
  const withdrawButton = event.target.closest("[data-hr-pcr-withdraw]");
  if (withdrawButton) {
    try {
      await apiRequest(`/api/hr/profile-change-requests/${withdrawButton.dataset.hrPcrWithdraw}/withdraw`, {
        method: "POST",
        body: {},
      });
      showToast("已撤回");
      myHrProfileState.loaded = false;
      render();
    } catch (error) {
      showToast(error.message || "撤回失败");
    }
    return;
  }

  const renameButton = event.target.closest("[data-hr-org-rename]");
  if (renameButton) {
    const result = await openDialog({
      title: "重命名节点",
      confirmText: "保存",
      fields: [
        { name: "name", label: "新的节点名称", required: true },
        { name: "reason", label: "修改原因", required: true },
      ],
    });
    if (!result) return;
    await hrApiAction(
      () =>
        apiRequest(`/api/hr/org-units/${renameButton.dataset.hrOrgRename}`, {
          method: "PATCH",
          body: { name: result.name, reason: result.reason },
        }),
      "节点已更新",
    );
    return;
  }
  const orgStatusButton = event.target.closest("[data-hr-org-status]");
  if (orgStatusButton) {
    const nextStatus = orgStatusButton.dataset.nextStatus;
    const reason = await promptDialog(`${nextStatus === "disabled" ? "停用" : "启用"}节点`, {
      label: "原因",
      required: true,
      confirmText: nextStatus === "disabled" ? "停用" : "启用",
      danger: nextStatus === "disabled",
    });
    if (!reason) return;
    await hrApiAction(
      () =>
        apiRequest(`/api/hr/org-units/${orgStatusButton.dataset.hrOrgStatus}/status`, {
          method: "POST",
          body: { status: nextStatus, reason },
        }),
      "节点状态已变更",
    );
    return;
  }
  if (event.target.closest("#hrOrgNewSubmit")) {
    await hrApiAction(
      () =>
        apiRequest("/api/hr/org-units", {
          method: "POST",
          body: {
            name: document.querySelector("#hrOrgNew-name").value.trim(),
            type: document.querySelector("#hrOrgNew-type").value,
            parentId: document.querySelector("#hrOrgNew-parent").value,
            reason: document.querySelector("#hrOrgNew-reason").value.trim(),
          },
        }),
      "节点已新增",
    );
    return;
  }

  const versionButton = event.target.closest("[data-hr-tpl-version]");
  if (versionButton) {
    const template = hrOrgState.templates.find((item) => item.id === versionButton.dataset.hrTplVersion);
    const result = await openDialog({
      title: "发布模板新版本",
      confirmText: "发布",
      fields: [
        {
          name: "payloadText",
          label: "新版本内容（JSON，基于最新版修改）",
          type: "textarea",
          rows: 6,
          value: JSON.stringify(template?.versions?.[0]?.payload || {}, null, 2),
          required: true,
        },
        { name: "reason", label: "发布原因", required: true },
      ],
    });
    if (!result) return;
    await hrApiAction(async () => {
      let payload;
      try {
        payload = JSON.parse(result.payloadText);
      } catch {
        throw new Error("JSON 格式错误，未提交");
      }
      await apiRequest(`/api/hr/salary-templates/${versionButton.dataset.hrTplVersion}/versions`, {
        method: "POST",
        body: { payload, reason: result.reason },
      });
    }, "新版本已发布");
    return;
  }
  const applyButton = event.target.closest("[data-hr-tpl-apply]");
  if (applyButton) {
    const dialogResult = await openDialog({
      title: "批量应用模板",
      confirmText: "应用",
      fields: [
        { name: "nos", label: "员工工号（逗号分隔）", placeholder: "如 FY0001,FY0002", required: true },
        { name: "reason", label: "应用原因", required: true },
      ],
    });
    if (!dialogResult) return;
    await hrApiAction(async () => {
      const result = await apiRequest(`/api/hr/salary-templates/${applyButton.dataset.hrTplApply}/apply`, {
        method: "POST",
        body: { employeeNos: dialogResult.nos.split(/[，,]/), reason: dialogResult.reason },
      });
      showToast(`已应用 ${result.applied.length} 人，跳过 ${result.skipped.length} 人`);
    });
    return;
  }

  if (event.target.closest("#hrAuditQuery")) {
    loadHrAuditPage({
      page: 1,
      action: document.querySelector("#hrAuditAction").value,
      search: document.querySelector("#hrAuditSearch").value.trim(),
    });
    return;
  }
  if (event.target.closest("#hrAuditPrevPage")) {
    loadHrAuditPage({ page: Math.max(hrAuditPage.meta.page - 1, 1) });
    return;
  }
  if (event.target.closest("#hrAuditNextPage")) {
    loadHrAuditPage({ page: hrAuditPage.meta.page + 1 });
    return;
  }

  if (event.target.closest("[data-myhr-edit]")) {
    myHrProfileState.editing = true;
    render();
    return;
  }
  if (event.target.closest("[data-myhr-edit-cancel]")) {
    myHrProfileState.editing = false;
    render();
    return;
  }
  if (event.target.closest("#myHrSubmitChange")) {
    try {
      const current = myHrProfileState.data?.employee || {};
      const changes = {};
      ["phone", "emergencyContact", "emergencyPhone"].forEach((field) => {
        const value = document.querySelector(`#myHr-${field}`).value.trim();
        if (value !== String(current[field] || "")) changes[field] = value;
      });
      await apiRequest("/api/hr/profile-change-requests", {
        method: "POST",
        body: { changes, reason: document.querySelector("#myHr-reason").value.trim() },
      });
      showToast("申请已提交，等待人事审核");
      myHrProfileState.loaded = false;
      myHrProfileState.editing = false;
      render();
    } catch (error) {
      showToast(error.message || "提交失败");
    }
    return;
  }
  // 左下角/顶部账户卡：老师点击进入我的账户
  if (event.target.closest("#accountSummary") || event.target.closest(".teacher-card")) {
    if (currentRole() === "teacher" && viewAllowed("myHrProfile")) {
      switchView("myHrProfile");
    }
    return;
  }
});

document.addEventListener("click", async (event) => {
  const newFlowButton = event.target.closest("[data-hr-flow-new]");
  if (newFlowButton) {
    hrFlowsState.createType = newFlowButton.dataset.hrFlowNew;
    if (!hrOrgState.loaded) await loadHrOrgData();
    render();
    return;
  }
  if (event.target.closest("[data-hr-flow-cancel]")) {
    hrFlowsState.createType = "";
    render();
    return;
  }
  const submitButton = event.target.closest("[data-hr-flow-submit]");
  if (submitButton) {
    const flowType = submitButton.dataset.hrFlowSubmit;
    try {
      const body = { flowType, reason: document.querySelector("#hrFlow-reason").value.trim() };
      if (flowType === "onboard") {
        body.personName = document.querySelector("#hrFlow-personName").value.trim();
        body.phone = document.querySelector("#hrFlow-phone").value.trim();
        body.orgUnitId = document.querySelector("#hrFlow-orgUnitId").value;
        body.positionId = document.querySelector("#hrFlow-positionId").value;
        body.primarySubjectId = document.querySelector("#hrFlow-subjectId").value;
        body.hiredAt = document.querySelector("#hrFlow-hiredAt").value;
      } else {
        body.employeeNo = document.querySelector("#hrFlow-employeeNo").value.trim();
        body.effectiveDate = document.querySelector("#hrFlow-effectiveDate").value;
        if (flowType === "transfer") {
          body.targetOrgUnitId = document.querySelector("#hrFlow-targetOrgUnitId").value;
          body.targetPositionId = document.querySelector("#hrFlow-targetPositionId").value;
        }
      }
      await apiRequest("/api/hr/flows", { method: "POST", body });
      showToast("流程已发起");
      hrFlowsState.createType = "";
      hrFlowsState.loaded = false;
      hrEmployeePage.loaded = false;
      render();
    } catch (error) {
      showToast(error.message || "发起失败");
    }
    return;
  }
  const approveFlow = event.target.closest("[data-hr-flow-approve]");
  const rejectFlow = event.target.closest("[data-hr-flow-reject]");
  if (approveFlow || rejectFlow) {
    const isApprove = Boolean(approveFlow);
    const comment = isApprove
      ? await promptDialog("通过审批", { label: "审批意见", value: "同意", required: false, confirmText: "通过" })
      : await promptDialog("拒绝审批", { label: "拒绝原因", placeholder: "请说明拒绝理由", confirmText: "拒绝", danger: true });
    if (comment === null || (!isApprove && !comment)) return;
    try {
      await apiRequest(
        `/api/hr/flows/${(approveFlow || rejectFlow).dataset[isApprove ? "hrFlowApprove" : "hrFlowReject"]}/${isApprove ? "approve" : "reject"}`,
        { method: "POST", body: { comment } },
      );
      showToast(isApprove ? "已通过" : "已拒绝");
      hrRefreshAfterMutation();
    } catch (error) {
      showToast(error.message || "操作失败");
    }
    return;
  }
  const withdrawFlow = event.target.closest("[data-hr-flow-withdraw]");
  if (withdrawFlow) {
    try {
      await apiRequest(`/api/hr/flows/${withdrawFlow.dataset.hrFlowWithdraw}/withdraw`, { method: "POST", body: {} });
      showToast("已撤回");
      hrRefreshAfterMutation();
    } catch (error) {
      showToast(error.message || "撤回失败");
    }
    return;
  }
  if (event.target.closest("#hrFlowQuery")) {
    loadHrFlows({
      todoOnly: document.querySelector("#hrFlowScope").value === "todo",
      status: document.querySelector("#hrFlowStatus").value,
    });
    return;
  }
});

// 全局快捷键：⌘K / Ctrl+K 唤起命令面板；面板内上下选择、回车打开、Esc 关闭
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && (event.key === "k" || event.key === "K")) {
    event.preventDefault();
    if (commandState.open) closeCommandPalette();
    else openCommandPalette();
    return;
  }
  if (!commandState.open) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeCommandPalette();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (commandState.items.length) {
      commandState.activeIndex = (commandState.activeIndex + 1) % commandState.items.length;
      renderCommandResults();
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (commandState.items.length) {
      commandState.activeIndex = (commandState.activeIndex - 1 + commandState.items.length) % commandState.items.length;
      renderCommandResults();
    }
  } else if (event.key === "Enter") {
    event.preventDefault();
    const chosen = commandState.items[commandState.activeIndex];
    if (chosen) {
      closeCommandPalette();
      chosen.run();
    }
  }
});

// 顶栏搜索入口
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-open-command]")) openCommandPalette();
});

applyNavIcons();
applyEnvironmentMode();
if (apiEnabled()) loadHealthTermName();

// 行政排课页是超长配置页：自动收集各 panel 的标题，生成吸顶分节导航，
// 点击平滑滚动定位，滚动时高亮当前分节。
function buildSectionNav(viewSelector) {
  const view = document.querySelector(viewSelector);
  if (!view || view.querySelector(".section-nav")) return;
  const panels = [...view.querySelectorAll("section.panel")].filter((panel) =>
    panel.querySelector(".panel-heading h2"),
  );
  if (panels.length < 4) return;
  const nav = document.createElement("nav");
  nav.className = "section-nav";
  nav.setAttribute("aria-label", "页面分节导航");
  panels.forEach((panel, index) => {
    if (!panel.id) panel.id = `${view.id}-section-${index}`;
    const title = panel.querySelector(".panel-heading h2").textContent.trim();
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "section-nav-chip";
    chip.textContent = title;
    chip.addEventListener("click", (event) => {
      // 阻断全局点击委托，避免触发其它 handler 引起重渲染打断滚动
      event.stopPropagation();
      // 即时跳转：页面存在异步重渲染，平滑滚动动画期间布局变化会导致落点漂移
      const stickyOffset = nav.getBoundingClientRect().height + (window.innerWidth <= 900 ? 72 : 24);
      const targetY = window.scrollY + panel.getBoundingClientRect().top - stickyOffset;
      window.scrollTo(0, Math.max(targetY, 0));
      chips.forEach((item, itemIndex) => item.classList.toggle("active", itemIndex === index));
    });
    nav.appendChild(chip);
  });
  view.prepend(nav);

  const chips = [...nav.children];
  const highlight = () => {
    if (!view.classList.contains("is-active")) return;
    const anchorY = nav.getBoundingClientRect().bottom + 40;
    let activeIndex = 0;
    panels.forEach((panel, index) => {
      if (panel.getBoundingClientRect().top <= anchorY) activeIndex = index;
    });
    chips.forEach((chip, index) => chip.classList.toggle("active", index === activeIndex));
  };
  let highlightScheduled = false;
  window.addEventListener(
    "scroll",
    () => {
      if (highlightScheduled) return;
      highlightScheduled = true;
      requestAnimationFrame(() => {
        highlightScheduled = false;
        highlight();
      });
    },
    { passive: true },
  );
  highlight();
}

buildSectionNav("#adminSchedulingView");

document.querySelector("#logoutButton").addEventListener("click", logout);
document.querySelector("#topLogoutButton").addEventListener("click", logout);

document.querySelector("#scanNextLesson").addEventListener("click", async (event) => {
  openScannerForLesson(event.currentTarget.dataset.id);
});

document.querySelector("#generateSchedule").addEventListener("click", generateAdminSchedule);
document.querySelector("#confirmSchedule").addEventListener("click", confirmAndPublishSchedule);
document.querySelector("#refreshSchedulePrecheck").addEventListener("click", refreshBackendSchedulePrecheck);
document.querySelector("#saveClassStructure").addEventListener("click", saveAdminClassStructure);
document.querySelector("#saveRoomResources").addEventListener("click", saveAdminRoomResources);
document.querySelector("#addRoomResourceType").addEventListener("click", addRoomResourceType);
document.querySelector("#roomResourceTypeControls").addEventListener("input", updateRoomResourcePreview);
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
// 教师导入：支持直接上传 CSV 文件（读入文本框并自动预览校验，仍可手工修改后重新预览）
document.querySelector("#teacherImportFile").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showToast("CSV 文件超过 5MB，请拆分后导入");
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const textarea = document.querySelector("#teacherImportCsv");
    textarea.value = String(reader.result || "").replace(/^\uFEFF/, "");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    showToast(`已读入 ${file.name}，正在预览校验`);
    document.querySelector("#previewTeacherImport").click();
  };
  reader.onerror = () => showToast("文件读取失败，请重试或改用粘贴");
  reader.readAsText(file, "utf-8");
  event.target.value = "";
});

document.querySelector("#teacherImportCsv").addEventListener("input", () => {
  syncTeacherImportText();
  resetTeacherImportPreviewForEdit();
  renderTeacherImport();
});
document.querySelector("#previewTeacherImport").addEventListener("click", previewTeacherImportCsv);
document.querySelector("#commitTeacherImport").addEventListener("click", commitTeacherImportCsv);

document.querySelector("#resetDemo").addEventListener("click", async () => {
  if (!(await confirmDialog("重置演示数据", {
    description: "会清空当前浏览器里的演示状态，不影响后端数据。",
    confirmText: "重置",
    danger: true,
  }))) return;
  if (qrScanner) stopCameraScanner();
  const activeAccountId = state.currentAccountId;
  state = clone(initialState);
  state.currentAccountId = activeAccountId;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Storage reset is best-effort.
  }
  showToast("试运行数据已重置");
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

document.querySelector("#submitPayrollDispute").addEventListener("click", async () => {
  // 渐进式交互：第一次点击先展开异议说明输入框，填写后再次点击才真正提交
  const disputeField = document.querySelector(".dispute-field");
  if (disputeField && !disputeField.classList.contains("is-open")) {
    disputeField.classList.add("is-open");
    document.querySelector("#payrollDisputeReason")?.focus();
    return;
  }
  if (backendMode() && currentRole() === "teacher") {
    await disputeBackendPayroll();
    return;
  }

  const teacherId = currentTeacherId();
  state.confirmationStages[teacherId] = 1;
  showToast("工资异议已提交，等待财务处理");
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
      await loadFinanceTeacherDetail(state.selectedFinanceTeacherId, { generatePayroll: false });
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

document.querySelector("#overviewDivisionSelect").addEventListener("change", async (event) => {
  applySchedulingSelection(event.target.value);
  if (backendMode() && currentRole() === "admin") {
    await loadBackendSchedulingContext();
  } else {
    render();
  }
});

document.querySelector("#overviewGradeSelect").addEventListener("change", async (event) => {
  applySchedulingSelection(state.selectedSchedulingDivisionId, event.target.value);
  if (backendMode() && currentRole() === "admin") {
    await loadBackendSchedulingContext();
  } else {
    render();
  }
});

document.querySelector("#createTermButton").addEventListener("click", createBackendTerm);

document.querySelector("#regularClassCountInput").addEventListener("input", updateClassStructurePreview);
document.querySelector("#experimentalClassCountInput").addEventListener("input", updateClassStructurePreview);
document.querySelector("#addSchedulePeriod").addEventListener("click", addSchedulePeriodRow);
document.querySelector("#saveSchedulePeriods").addEventListener("click", saveSchedulePeriods);

document.querySelector("#adminClassSelect").addEventListener("change", (event) => {
  state.selectedSchedulingClassId = event.target.value;
  state.selectedScheduleAssignmentId = "";
  renderAdminScheduling();
});

document.querySelector("#overviewClassSelect").addEventListener("change", (event) => {
  state.selectedScheduleOverviewClassId = event.target.value;
  state.selectedSchedulingClassId = event.target.value;
  renderAdminScheduleOverview();
});

document.querySelector("#adminAssignmentSelect").addEventListener("change", (event) => {
  state.selectedScheduleAssignmentId = event.target.value;
  renderAdminScheduling();
});

["#scheduleReplanClassSelect", "#scheduleReplanTeacherSelect", "#scheduleReplanDateSelect", "#scheduleReplanSubjectSelect"].forEach(
  (selector) => {
    document.querySelector(selector).addEventListener("change", () => {
      updateScheduleReplanScopeFromControls();
      renderAdminScheduling();
    });
  },
);

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

document.addEventListener("click", (event) => {
  const deletePeriodButton = event.target.closest("[data-delete-schedule-period]");
  if (!deletePeriodButton) return;
  deleteSchedulePeriodRow(deletePeriodButton.dataset.deleteSchedulePeriod);
});

document.querySelector("#submitScheduleChangeRequest").addEventListener("click", () => {
  submitScheduleChangeRequest();
});

document.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-drag-assignment]");
  if (!item) return;
  draggedScheduleAssignmentId = item.dataset.dragAssignment;
  event.dataTransfer?.setData("text/plain", draggedScheduleAssignmentId);
  event.dataTransfer?.setDragImage?.(item, 12, 12);
});

document.addEventListener("dragover", (event) => {
  const zone = event.target.closest("[data-schedule-drop-date]");
  if (!draggedScheduleAssignmentId || !zone) return;
  event.preventDefault();
  updateScheduleDropPreview(zone);
});

document.addEventListener("dragleave", (event) => {
  if (!draggedScheduleAssignmentId) return;
  const zone = event.target.closest("[data-schedule-drop-date]");
  if (!zone || zone.contains(event.relatedTarget)) return;
  zone.classList.remove("is-drop-ok", "is-drop-blocked");
  zone.removeAttribute("title");
  const hint = zone.querySelector("[data-schedule-drop-hint]");
  if (hint) hint.textContent = "";
});

document.addEventListener("dragend", () => {
  draggedScheduleAssignmentId = "";
  clearScheduleDropPreview();
});

document.addEventListener("drop", async (event) => {
  const zone = event.target.closest("[data-schedule-drop-date]");
  if (!zone || !draggedScheduleAssignmentId) return;
  event.preventDefault();
  const assignmentId = draggedScheduleAssignmentId;
  const preview = updateScheduleDropPreview(zone);
  draggedScheduleAssignmentId = "";
  clearScheduleDropPreview();
  if (preview && !preview.ok) {
    showToast(preview.message);
    return;
  }
  await moveScheduleAssignmentToSlot(assignmentId, zone.dataset.scheduleDropDate, zone.dataset.scheduleDropPeriod);
});

document.querySelector("#startScanner").addEventListener("click", startCameraScanner);
document.querySelector("#stopScanner").addEventListener("click", stopCameraScanner);
document.querySelector("#refreshClassroomRooms").addEventListener("click", () => {
  if (backendMode() && currentRole() === "classroom") {
    loadClassroomRooms();
  } else {
    renderClassroomScreens();
  }
});

document.querySelector("#financeTeacherSelect").addEventListener("change", async (event) => {
  state.selectedFinanceTeacherId = event.target.value;
  resetAttendanceRecordState();
  resetFinanceTeacherDetailState();
  if (backendMode() && isFinanceRole()) {
    await loadBackendAttendanceRecords(state.selectedFinanceTeacherId);
    return;
  }
  renderFinanceRecords();
});

document.querySelector("#settlementTeacherSelect").addEventListener("change", async (event) => {
  state.selectedFinanceTeacherId = event.target.value;
  resetFinanceTeacherDetailState();
  if (backendMode() && isFinanceRole()) {
    await loadFinanceTeacherDetail(state.selectedFinanceTeacherId, { generatePayroll: false });
    return;
  }
  renderSettlement();
});

document.addEventListener("click", async (event) => {
  const statusTeacherButton = event.target.closest("[data-settlement-status-teacher]");
  if (!statusTeacherButton) return;
  const teacherId = statusTeacherButton.dataset.settlementStatusTeacher;
  if (!teacherId || teacherId === state.selectedFinanceTeacherId) return;
  state.selectedFinanceTeacherId = teacherId;
  resetFinanceTeacherDetailState();
  resetAttendanceRecordState();
  const select = document.querySelector("#settlementTeacherSelect");
  if (select) select.value = teacherId;
  if (backendMode() && isFinanceRole()) {
    await loadFinanceTeacherDetail(teacherId, { generatePayroll: false });
    return;
  }
  renderSettlement();
});

document.querySelector("#settleTeacherPayroll").addEventListener("click", async () => {
  if (backendMode() && isFinanceRole()) {
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
document.querySelector("#approveAcademicWorkload")?.addEventListener("click", () => approveBackendWorkload("academic"));
document.querySelector("#approveSchoolWorkload")?.addEventListener("click", () => approveBackendWorkload("school"));
document.querySelector("#saveTeacherPayrollDraft").addEventListener("click", saveBackendTeacherPayrollDraft);
document.querySelector("#batchGeneratePayroll").addEventListener("click", batchGenerateBackendPayroll);
document.querySelector("#batchLockPayroll").addEventListener("click", batchLockBackendPayroll);
document.querySelector("#exportPayrollCsv").addEventListener("click", exportBackendPayrollCsv);
document.querySelector("#queryPayrollHistory").addEventListener("click", () => {
  loadPayrollHistory({ termId: payrollHistoryState.termId, month: payrollHistoryState.month });
});
document.querySelector("#exportPayrollHistoryCsv").addEventListener("click", exportPayrollHistoryCsv);
document.querySelector("#payrollHistoryTermSelect").addEventListener("change", (event) => {
  const term = termManagementState.terms.find((item) => item.id === event.target.value);
  payrollHistoryState = {
    ...payrollHistoryState,
    termId: event.target.value,
    month: defaultMonthForTerm(term),
    loaded: false,
    data: null,
    error: "",
  };
  loadPayrollHistory();
});
document.querySelector("#payrollHistoryMonthSelect").addEventListener("change", (event) => {
  payrollHistoryState = {
    ...payrollHistoryState,
    month: event.target.value,
    loaded: false,
    data: null,
    error: "",
  };
  loadPayrollHistory();
});
document.querySelector("#savePayrollRules").addEventListener("click", saveBackendPayrollRules);
document.querySelector("#unlockTeacherPayroll").addEventListener("click", unlockBackendPayroll);
document.querySelector("#saveTeacherSalaryProfile").addEventListener("click", handleTeacherSalaryProfileAction);
document.querySelector("#cancelTeacherSalaryProfileEdit")?.addEventListener("click", cancelTeacherSalaryProfileEdit);
document.querySelector("#saveSalaryManualItems")?.addEventListener("click", saveBackendTeacherMonthlyAdjustments);

render();

if (backendMode()) {
  loadBackendNotifications().then(render);
  if (currentRole() === "teacher") {
    loadBackendTeacherContext(currentTeacherId(), "auto").then(render);
  }
  if (isFinanceRole()) {
    loadFinanceTeacherPage({ page: financeTeacherPage.page });
    loadPayrollRules();
  }
  if (currentRole() === "admin") {
    loadTermContext().then(() => loadBackendSchedulingContext());
  }
  if (currentRole() === "system_admin") {
    loadPersonnelPage({ page: personnelPage.page });
  }
  if (currentRole() === "classroom") {
    loadClassroomRooms();
  }
}
