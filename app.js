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
      id: "kindergarten",
      name: "幼儿园",
      shortName: "幼儿园",
      classCount: 6,
      roomPrefix: "K",
      weekStart: "2026-06-15",
      grades: [
        { id: "kindergarten-g1", name: "小班", code: "K1" },
        { id: "kindergarten-g2", name: "中班", code: "K2" },
        { id: "kindergarten-g3", name: "大班", code: "K3" },
      ],
      subjectIds: ["chinese", "math", "english", "pe", "music", "art"],
    },
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
    nonRegularTeachers: schedulingCatalog.teachers.map((teacher) => ({ ...teacher, department: division.name })),
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
  selectedSchedulingTermId: "",
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
  demoNow: "2026-06-09T10:05:00+08:00",
  notices: [
    {
      id: "N001",
      audience: "teacher",
      source: "教务处",
      title: "今日课表已分发",
      text: "请老师按课表到对应教室上课。排给你的课都计入课时费，请假请提前走审批。",
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
      text: "课时费按课表计算：排给教师的课直接计薪，代课由审批改派，请假未安排代课的课次取消。",
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
    // 财务分四摊，与服务端种子账号一一对应。本地演示模式也要有这四个，
    // 否则后端不可达时快捷登录会退回这里、找不到账号而报"用户名或密码不正确"。
    {
      id: "finance-zhang",
      role: "finance",
      financeScope: "headquarters",
      financeScopeName: "总校行政后勤",
      financeReadAll: true,
      name: "张会计",
      title: "总校财务",
      department: "财务处 · 总校",
    },
    {
      id: "finance-primary",
      role: "finance",
      financeScope: "primary",
      financeScopeName: "小学部",
      name: "小学部会计",
      title: "小学部财务",
      department: "财务处 · 小学部",
    },
    {
      id: "finance-middle",
      role: "finance",
      financeScope: "middle",
      financeScopeName: "初中部",
      name: "初中部会计",
      title: "初中部财务",
      department: "财务处 · 初中部",
    },
    {
      id: "finance-high",
      role: "finance",
      financeScope: "high",
      financeScopeName: "高中部",
      name: "高中部会计",
      title: "高中部财务",
      department: "财务处 · 高中部",
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
      note: "计入本月薪资",
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
      note: "尚未到上课时间",
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
      note: "计入本月薪资",
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
      note: "计入本月薪资",
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
      note: "计入本月薪资",
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
      note: "尚未到上课时间",
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
      note: "计入本月薪资",
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
      note: "计入本月薪资",
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
const PUBLISHED_LESSON_SOURCES = new Set(["admin-scheduling", "admin-nonregular", "backend-scheduling", "backend-nonregular"]);
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
  { username: "finance_primary", password: "123456", accountId: "finance-primary" },
  { username: "finance_middle", password: "123456", accountId: "finance-middle" },
  { username: "finance_high", password: "123456", accountId: "finance-high" },
  { username: "admin", password: "123456", accountId: "admin-zhou" },
  { username: "sysadmin", password: "123456", accountId: "system-admin" },
];

let state = loadSavedState();
let sessionAccountId = loadSession();
let backendSession = loadBackendSession();
let eventStream = null; // SSE 连接（在 saveBackendSession 中使用，需先于其声明避免 TDZ）
let backendAuthExpiredHandled = false;
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
function initialTeacherWorkloadState() {
  return { teacherId: "", month: "2026-06", loading: false, loaded: false, error: "", data: null };
}
let teacherWorkloadState = initialTeacherWorkloadState();
let teacherWorkloadRequestId = 0;
function initialAttendanceRecordState() {
  return {
    teacherId: "", month: "2026-06", loading: false, loaded: false,
    error: "", records: [], summary: null, teacher: null,
  };
}
let attendanceRecordState = initialAttendanceRecordState();
function initialTeacherPayrollState() {
  return { teacherId: "", month: "2026-06", loading: false, loaded: false, error: "", data: null };
}
let teacherPayrollState = initialTeacherPayrollState();
let teacherPayrollRequestId = 0;
// 工资确认页只提供当前启用学期覆盖的月份。空串表示使用当前学期默认月份，切账号后也不会
// 把上一位老师选过的月份带给下一位老师。
let teacherConfirmationMonth = "";
function initialPayrollRuleState() {
  return { loading: false, loaded: false, error: "", rules: null };
}
let payrollRuleState = initialPayrollRuleState();
// ---- 学期薪酬预算 ----------------------------------------------------------
// 学部财务只拿到本学部一条，总校财务拿到行政后勤一条，行政管理拿到全部四条。
// 服务端按登录账号收敛范围，前端不做二次过滤。
function initialTermBudgetState() {
  return { termId: "", loadedTermId: "", loaded: false, loading: false, error: "", data: null };
}
let termBudgetState = initialTermBudgetState();
// 当前展开的预算使用明细；以「学期 + 卡片」定位，切换学期或登录账号时会清空。
let budgetUsageExpandedKey = "";

function initialFinanceTeacherPage() {
  return {
    items: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, summary: null,
    page: 1, pageSize: 20, stageId: "", grade: "", search: "",
    loaded: false, loading: false, error: "",
  };
}
let financeTeacherPage = initialFinanceTeacherPage();
const financeStageCatalog = [
  { id: "kindergarten", name: "幼儿园", grades: [1, 2, 3] },
  { id: "primary", name: "小学部", grades: [1, 2, 3, 4, 5, 6] },
  { id: "middle", name: "初中部", grades: [7, 8, 9] },
  { id: "high", name: "高中部", grades: [10, 11, 12] },
];

// 学段枚举的中文名。界面任何位置都不应出现 primary/middle/high 这类内部标识，
// 需要展示学段时一律走这里；查无对应时返回空串，宁可不显示也不漏出英文。
function stageLabel(stageId) {
  return financeStageCatalog.find((item) => item.id === String(stageId || ""))?.name || "";
}
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
function initialFinanceTeacherDetailState() {
  return {
    teacherId: "", month: "2026-06", loading: false, loaded: false, error: "",
    workload: null, payroll: null, assessment: null, payrollGenerated: false, lockBlockers: [],
  };
}
let financeTeacherDetailState = initialFinanceTeacherDetailState();
function initialPayrollHistoryState() {
  return {
    termId: "", month: "2026-06", loadedTermId: "", loadedMonth: "",
    loading: false, loaded: false, error: "", data: null,
  };
}
let payrollHistoryState = initialPayrollHistoryState();
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
function initialAcademicCalendarState() {
  return {
    periodTagFilter: "all",
    entries: [],
    terms: [],
    loaded: false,
    loading: false,
    error: "",
  };
}
let academicCalendarState = initialAcademicCalendarState();
function initialAttendanceUploadState() {
  return {
    month: "",
    stageId: "",
    stageOptions: [],
    uploads: [],
    canUpload: false,
    loaded: false,
    loading: false,
    error: "",
  };
}
let attendanceUploadState = initialAttendanceUploadState();
function initialTransportRouteState() {
  return {
    termId: "", loaded: false, loading: false, error: "", canManage: false,
    termOptions: [], lifeTeachers: [], distanceTiers: [], routes: [], transfers: [],
  };
}
let transportRouteState = initialTransportRouteState();
let schedulingJobPollTimer = null;
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
  schedule: {
    role: "teacher",
    title: "我的课表",
    el: document.querySelector("#scheduleView"),
  },
  adminScheduling: {
    role: "admin",
    title: "排课管理",
    el: document.querySelector("#adminSchedulingView"),
  },
  adminScheduleOverview: {
    role: "admin,division_head,principal",
    title: "课表总览",
    el: document.querySelector("#adminScheduleOverviewView"),
  },
  academicCalendar: {
    role: "system_admin,division_head,principal",
    title: "学部校历",
    el: document.querySelector("#academicCalendarView"),
  },
  attendanceManagement: {
    role: "division_head,system_admin,principal",
    title: "考勤管理",
    el: document.querySelector("#attendanceManagementView"),
  },
  transportRoutes: {
    role: "security_manager",
    title: "跟车路线",
    el: document.querySelector("#transportRoutesView"),
  },
  budgetOverview: {
    role: "division_head,principal",
    title: "费用预算",
    el: document.querySelector("#budgetOverviewView"),
  },
  reports: {
    role: "admin,finance,hr,division_head,system_admin",
    title: "统计报表",
    el: document.querySelector("#reportsView"),
  },
  dataPorting: {
    role: "admin,system_admin,hr,division_head",
    title: "基础数据",
    el: document.querySelector("#dataPortingView"),
  },
  personnel: {
    role: "system_admin,division_head,principal",
    title: "教师列表",
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
  personnelTagConfig: {
    role: "system_admin",
    title: "人员标签",
    el: document.querySelector("#personnelTagConfigView"),
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
    role: "teacher,admin,finance,hr,division_head,principal,system_admin",
    title: "审批中心",
    el: document.querySelector("#approvalsView"),
  },
  approvalSettings: {
    role: "system_admin",
    title: "审批流程设置",
    el: document.querySelector("#approvalSettingsView"),
  },
  hrAudit: {
    role: "system_admin",
    title: "人事审计",
    el: document.querySelector("#hrAuditView"),
  },
  myHrProfile: {
    role: "all",
    title: "我的账户",
    el: document.querySelector("#myHrProfileView"),
  },
  ledgers: {
    role: "system_admin",
    title: "账套管理",
    el: document.querySelector("#ledgersView"),
  },
  monitoring: {
    role: "system_admin",
    title: "系统监控",
    el: document.querySelector("#monitoringView"),
  },
  notifications: {
    role: "teacher,finance,admin,system_admin,hr,principal,security_manager",
    title: "通知中心",
    el: document.querySelector("#notificationsView"),
  },
  confirm: {
    role: "teacher",
    title: "工资确认",
    el: document.querySelector("#confirmView"),
  },
  finance: {
    role: "finance",
    title: "薪资总览",
    el: document.querySelector("#financeView"),
  },
  financeRecords: {
    role: "finance",
    title: "老师课时记录",
    el: document.querySelector("#financeRecordsView"),
  },
  settlement: {
    role: "finance",
    title: "薪资结算",
    el: document.querySelector("#settlementView"),
  },
  // 总校人事行政不得查看工资；对应接口同样返回 403，避免出现“菜单看得到、点开没权限”。
  payrollHistory: {
    role: "finance,division_head,principal,payroll_viewer,payroll_exporter",
    title: "工资记录",
    el: document.querySelector("#payrollHistoryView"),
  },
  payrollConfig: {
    role: "finance",
    title: "薪资配置",
    el: document.querySelector("#payrollConfigView"),
  },
};

const defaultViewByRole = {
  teacher: "dashboard",
  finance: "finance",
  admin: "adminScheduling",
  system_admin: "personnel",
  hr: "hrEmployees",
  division_head: "adminScheduleOverview",
  principal: "adminScheduleOverview",
  security_manager: "transportRoutes",
  payroll_viewer: "payrollHistory",
  payroll_exporter: "payrollHistory",
};

const lessonTypeLabel = {
  regular: "正常课时",
  selfStudy: "自习",
  activity: "活动",
  morning: "早自习",
  evening: "晚自习",
  weekend: "周末补课",
  lifeDuty: "学生接送排班",
};

// 课次状态只剩两种：正常（排了就计薪）和已取消（请假未安排代课）。
// pending / completed 这些是签到时代的中间态，历史数据里可能还有，
// 统一按「计薪」显示——它们本来就都上过课
const statusLabel = {
  scheduled: "未到时间",
  cancelled: "已取消",
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

// 换账号必须丢掉所有按登录身份取回的数据。四个财务账号各管一摊，
// 沿用上一个账号的缓存会把别人的名单、工资汇总、预算显示给现在这个人——
// 表现就是"四个账号登进去看到的东西完全一样"。
//
// 新增任何按账号取数的缓存，都必须在这里登记，并把初始值抽成 initialXxx()
// 工厂函数，让声明和重置共用同一份定义。
function resetScopedCaches() {
  termBudgetState = initialTermBudgetState();
  budgetUsageExpandedKey = "";
  financeTeacherPage = initialFinanceTeacherPage();
  financeTeacherDetailState = initialFinanceTeacherDetailState();
  payrollHistoryState = initialPayrollHistoryState();
  teacherWorkloadState = initialTeacherWorkloadState();
  attendanceRecordState = initialAttendanceRecordState();
  teacherPayrollState = initialTeacherPayrollState();
  payrollRuleState = initialPayrollRuleState();
  weeklyWorkloadState = initialWeeklyWorkloadState();
  annualSalaryState = initialAnnualSalaryState();
  dataPortingState = initialDataPortingState();
  resourceLedgerState = initialResourceLedgerState();
  academicCalendarState = initialAcademicCalendarState();
  attendanceUploadState = initialAttendanceUploadState();
  transportRouteState = initialTransportRouteState();
  // 选中的老师也要清：上一个账号选中的老师往往不在本账号范围内
  state.selectedFinanceTeacherId = "";
}

function saveBackendSession(session) {
  backendAuthExpiredHandled = false;
  backendSession = session;
  resetScopedCaches();
  try {
    window.localStorage.setItem(API_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    // API session persistence is best-effort.
  }
  connectEventStream();
}

function clearBackendSession() {
  backendSession = null;
  resetScopedCaches();
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
  // 预算审批或学部预算使用办结：保留用户当前选择的 termId，只使该期缓存失效。
  eventStream.addEventListener("term-budget", () => {
    if (!backendMode()) return;
    termBudgetState = { ...initialTermBudgetState(), termId: termBudgetState.termId };
    if (["budgetOverview", "finance", "settlement"].includes(state.activeView)) loadTermBudget();
  });
  // 工资生成、复核或总校财务执行发放后，相关角色正在看的工资页也必须立即失效重载。
  // 只广播事件但不监听会造成“审批已办结，另一端仍显示旧金额，刷新后才正常”的假故障。
  eventStream.addEventListener("payroll", async () => {
    if (!backendMode()) return;
    const selectedTermId = payrollHistoryState.termId;
    const selectedMonth = payrollHistoryState.month;
    payrollHistoryState = {
      ...initialPayrollHistoryState(),
      termId: selectedTermId,
      month: selectedMonth,
    };
    teacherPayrollRequestId += 1;
    resetTeacherPayrollState();
    resetFinanceTeacherDetailState();

    if (state.activeView === "payrollHistory" && canViewPayrollHistory()) {
      await loadPayrollHistory({ termId: selectedTermId, month: selectedMonth });
      return;
    }
    if (isTeacherAccount() && ["dashboard", "confirm", "teacherPayroll"].includes(state.activeView)) {
      const month = teacherConfirmationMonth || defaultTeacherPayrollMonth();
      await loadBackendTeacherPayroll(currentTeacherId(), month, { detail: state.activeView === "confirm" });
      return;
    }
    if (isFinanceRole() && ["finance", "financeRecords", "settlement"].includes(state.activeView)) {
      await loadFinanceTeacherPage({ page: financeTeacherPage.page });
      if (state.selectedFinanceTeacherId && ["financeRecords", "settlement"].includes(state.activeView)) {
        await loadFinanceTeacherDetail(state.selectedFinanceTeacherId, {
          month: currentSettlementMonth(),
          generatePayroll: false,
        });
      }
    }
  });
  // 新通知：刷新通知中心与角标
  eventStream.addEventListener("notification", () => {
    if (backendMode()) loadBackendNotifications().then(render);
  });
  // 当前学期一经切换，老师端立即丢弃旧学期工资缓存并重建月份筛选。
  eventStream.addEventListener("term", async () => {
    if (!backendMode()) return;
    await loadTermContext();
    academicCalendarState = { ...academicCalendarState, loaded: false, loading: false };
    teacherConfirmationMonth = "";
    teacherWorkloadRequestId += 1;
    teacherPayrollRequestId += 1;
    resetTeacherWorkloadState();
    resetTeacherPayrollState();
    if (isTeacherAccount()) {
      await loadBackendTeacherContext(currentTeacherId(), "auto");
    }
    render();
  });
  eventStream.addEventListener("academic-calendar", () => {
    if (!backendMode()) return;
    academicCalendarState = { ...academicCalendarState, loaded: false, loading: false };
    if (state.activeView === "academicCalendar") render();
  });
  eventStream.addEventListener("attendance-upload", () => {
    if (!backendMode()) return;
    attendanceUploadState = { ...attendanceUploadState, loaded: false, loading: false };
    if (state.activeView === "attendanceManagement") loadAttendanceUploads();
  });
  eventStream.addEventListener("transport-route", async () => {
    if (!backendMode()) return;
    transportRouteState = { ...transportRouteState, loaded: false, loading: false };
    if (currentRole() === "security_manager" && state.activeView === "transportRoutes") {
      await loadTransportRoutes({ termId: transportRouteState.termId });
    }
    if (isLifeTeacherAccount()) {
      await loadBackendTeacherContext(currentTeacherId(), state.selectedScheduleWeekStart || "auto");
      if (state.activeView === "schedule") renderSchedule();
    }
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
    month: defaultTeacherPayrollMonth(),
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
    month: defaultTeacherPayrollMonth(),
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
    assessment: null,
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
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...(backendSession?.token ? { Authorization: `Bearer ${backendSession.token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined,
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
  if (role === "admin") return "学部排课负责人";
  if (role === "system_admin") return "总校人事 + 行政";
  if (role === "hr") return "人事账号";
  if (role === "division_head") return "学部主任";
  if (role === "principal") return "校长（总校领导）";
  if (role === "security_manager") return "安全部主管";
  if (role === "payroll_viewer") return "全校薪资查看";
  if (role === "payroll_exporter") return "薪资导出专员";
  return "系统账号";
}

function normalizeBackendTeacher(teacher) {
  if (!teacher) return null;
  return {
    id: teacher.id,
    name: teacher.name,
    stageId: teacher.stageId || "",
    payrollScope: teacher.payrollScope || teacher.stageId || "headquarters",
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
    username: account.username || "",
    role: account.role,
    roles: Array.isArray(account.roles) ? account.roles.map(String) : [account.role],
    name: account.name,
    title: account.title || roleTitle(account.role),
    teacherId: account.teacherId || teacher?.id || null,
    department: account.department || teacher?.department || "",
    deviceId: "backend-web",
    source: "backend",
    financeScope: account.financeScope || "",
    financeScopeName: account.financeScopeName || "",
    financeReadAll: Boolean(account.financeReadAll),
    scopeStageIds: Array.isArray(account.scopeStageIds) ? account.scopeStageIds.map(String) : [],
    schedulingGradeIds: Array.isArray(account.schedulingGradeIds) ? account.schedulingGradeIds.map(String) : [],
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
    units: Number.isFinite(Number(lesson.units)) ? Number(lesson.units) : 1,
    status: lesson.status,
    isLifeDuty: Boolean(lesson.isLifeDuty),
    nonRegular: Boolean(lesson.nonRegular),
    nonPayable: Boolean(lesson.nonPayable),
    dutyType: lesson.dutyType || "",
    studentCount: Number(lesson.studentCount || 0),
    routeRunId: lesson.routeRunId || "",
    routeId: lesson.routeId || "",
    routeName: lesson.routeName || "",
    distanceTier: lesson.distanceTier || "",
    transportRunStatus: lesson.transportRunStatus || "",
    routeLeg: lesson.routeLeg || "",
    routeLegStatus: lesson.routeLegStatus || "",
    scanTime: lesson.checkInAt ? lesson.checkInAt.slice(11, 16) : "",
    checkInTime: lesson.checkInAt ? lesson.checkInAt.slice(11, 16) : "",
    checkOutTime: lesson.checkOutAt ? lesson.checkOutAt.slice(11, 16) : "",
    note:
      lesson.nonPayable
        ? lesson.note || "固定非正课时段，不计入课时或工资"
        : lesson.attendanceNote ||
          (lesson.status === "completed" ? "后端接口：已计薪" : "后端接口：尚未上课"),
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

// role 是账号的主岗位（决定默认工作台）；roles 表示可叠加的业务能力。
// 学部主任任课时保留 division_head 主岗位，并同时拥有 teacher 能力。
function accountRoles(account = currentAccount()) {
  const roles = Array.isArray(account?.roles) ? account.roles : [];
  return [...new Set([account?.role, ...roles].filter(Boolean).map(String))];
}

function hasAccountRole(role, account = currentAccount()) {
  return accountRoles(account).includes(String(role));
}

function isTeacherAccount(account = currentAccount()) {
  return hasAccountRole("teacher", account) && Boolean(account?.teacherId);
}

function isLifeTeacherAccount(account = currentAccount()) {
  if (!isTeacherAccount(account)) return false;
  return hasAccountRole("life_teacher", account) || teacherById(account.teacherId)?.salaryProfile?.salaryCategory === "lifeTeacher";
}

function setTeacherSurfaceCopy(lifeTeacher = false) {
  const copy = lifeTeacher
    ? {
        scheduleNav: "我的排班",
        plannedLabel: "本周接送班次",
        plannedHint: "正式学期工作日排班",
        completedLabel: "早晨接送",
        completedHint: "本周到校接送安排",
        pendingLabel: "放学接送",
        pendingHint: "本周离校接送安排",
        warningLabel: "负责学生",
        warningHint: "人事档案维护的人数",
        dashboardIntro: "按生活老师排班完成学生到校、放学接送。接送班次不属于课时，不计入课时工资。",
        scheduleButton: "打开我的排班",
        scheduleTitle: "我的排班",
        scheduleIntro: "按自然周查看学生到校、放学接送安排；排班仅在正式学期生成，不参与教务排课。",
        tasksTitle: "今日接送安排",
        tasksIntro: "学生接送排班仅用于生活服务安排，不计入课时或课时工资。",
        taskHeads: ["服务对象", "接送任务", "服务地点", "排班类型", "状态", "说明"],
      }
    : {
        scheduleNav: "我的课表",
        plannedLabel: "本月计划课时",
        plannedHint: "来自期初课表",
        completedLabel: "计薪课时",
        completedHint: "排给你的课都计薪",
        pendingLabel: "未到时间",
        pendingHint: "本月还没上的课",
        warningLabel: "已取消",
        warningHint: "请假未安排代课，不计薪",
        dashboardIntro: "按课表安排上课。排给你的课都计入课时费，无需签到；请假请走审批。",
        scheduleButton: "打开我的课表",
        scheduleTitle: "我的课表",
        scheduleIntro: "按自然周查看教务排班，老师可切换每一周确认之后的课程安排。",
        tasksTitle: "今日课时任务",
        tasksIntro: "当前范围：计划课表、课时统计、调课代课、薪资联动。",
        taskHeads: ["班级", "课程", "教室", "类型", "状态", "操作"],
      };
  const values = [
    ["#scheduleNavLabel", copy.scheduleNav],
    ["#plannedLessonsLabel", copy.plannedLabel],
    ["#plannedLessonsHint", copy.plannedHint],
    ["#completedLessonsLabel", copy.completedLabel],
    ["#completedLessonsHint", copy.completedHint],
    ["#pendingLessonsLabel", copy.pendingLabel],
    ["#pendingLessonsHint", copy.pendingHint],
    ["#warningCountLabel", copy.warningLabel],
    ["#warningCountHint", copy.warningHint],
    ["#dashboardIntro", copy.dashboardIntro],
    ["#openScheduleButton", copy.scheduleButton],
    ["#scheduleTitle", copy.scheduleTitle],
    ["#scheduleIntro", copy.scheduleIntro],
    ["#todayTasksTitle", copy.tasksTitle],
    ["#todayTasksIntro", copy.tasksIntro],
  ];
  values.forEach(([selector, text]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  });
  ["#todayTaskTargetHead", "#todayTaskWorkHead", "#todayTaskPlaceHead", "#todayTaskTypeHead", "#todayTaskStatusHead", "#todayTaskActionHead"].forEach((selector, index) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = copy.taskHeads[index];
  });
}

function isFinanceRole(role = currentRole()) {
  return role === "finance";
}

function isPersonnelRole(role = currentRole()) {
  // 角色收敛（2026-07-08）：账号管理是技术操作，收归行政管理；教务(admin)专注排课
  return ["system_admin", "division_head", "principal"].includes(role);
}

function canViewSchedulingOverview(role = currentRole()) {
  return ["admin", "division_head", "principal"].includes(role);
}

function currentTeacherId() {
  const account = currentAccount();
  return isTeacherAccount(account) ? account.teacherId : state.selectedFinanceTeacherId;
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

function roleMatches(allowedRole, account = currentAccount()) {
  if (allowedRole === "all") return true;
  const allowedRoles = String(allowedRole)
    .split(",")
    .map((item) => item.trim());
  return allowedRoles.some((role) => hasAccountRole(role, account));
}

function viewAllowed(viewName) {
  const view = views[viewName];
  const role = currentRole();
  if (!view || !roleMatches(view.role)) return false;
  // 组织岗位和全校统一薪资规则属于总校财务的配置职责。
  // 学部财务仍可在自己的范围内核算与查看工资，但不应看到这两个入口。
  if (role === "finance" && ["hrOrg", "payrollConfig"].includes(viewName) && !canExportAllPayrollDetails()) {
    return false;
  }
  if (["system_admin", "principal", "payroll_viewer", "payroll_exporter"].includes(role) && viewName === "payrollHistory" && !canViewAllPayrollDetails()) {
    return false;
  }
  if (role === "division_head" && viewName === "payrollHistory" && !canViewDivisionPayrollDetails()) {
    return false;
  }
  const scopedScheduler = role === "admin" && (currentAccount()?.scopeStageIds || []).length > 0;
  if (scopedScheduler) {
    const schedulerViews = ["adminScheduling", "adminScheduleOverview", "approvals", "notifications", "myHrProfile"];
    const teacherViews = ["dashboard", "schedule", "confirm"];
    if (!schedulerViews.includes(viewName) && !(isTeacherAccount() && teacherViews.includes(viewName))) return false;
  }
  return true;
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

function teacherPayrollTermMonths(term = termManagementState.currentTerm) {
  if (!term?.startDate || !term?.endDate) return [currentSettlementMonth()];
  return monthKeysBetween(term.startDate, term.endDate);
}

function defaultTeacherPayrollMonth() {
  const months = teacherPayrollTermMonths();
  const calendarMonth = formatDateKey(new Date()).slice(0, 7);
  if (months.includes(calendarMonth)) return calendarMonth;
  const settlementMonth = currentSettlementMonth();
  if (months.includes(settlementMonth)) return settlementMonth;
  return months[0] || settlementMonth;
}

function selectedTeacherConfirmationMonth() {
  const months = teacherPayrollTermMonths();
  if (!months.includes(teacherConfirmationMonth)) teacherConfirmationMonth = defaultTeacherPayrollMonth();
  return teacherConfirmationMonth;
}

function renderTeacherPayrollMonthSelect() {
  const select = document.querySelector("#teacherPayrollMonthSelect");
  if (!select) return selectedTeacherConfirmationMonth();
  const months = teacherPayrollTermMonths();
  const selected = selectedTeacherConfirmationMonth();
  select.innerHTML = months
    .map(
      (month) => `<option value="${escapeHtml(month)}">${escapeHtml(formatMonthLabel(month))}</option>`,
    )
    .join("");
  select.value = selected;
  const handleSelection = () => changeTeacherPayrollMonth(select.value);
  select.oninput = handleSelection;
  select.onchange = handleSelection;
  return selected;
}

function runtimeEnvironmentName() {
  const host = window.location.hostname;
  if (host === "127.0.0.1" || host === "localhost" || host === "") return "本地开发";
  // 校内测试通常就是 10.x / 172.16-31.x / 192.168.x。不能把“内网”误判成
  // 本机开发，否则部署到学校服务器后所有默认口令快捷入口和重置数据按钮都会露出。
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
  const isTeacher = isTeacherAccount();
  const month = isTeacher ? defaultTeacherPayrollMonth() : currentSettlementMonth();
  if (!term?.name) {
    return healthTermName
      ? `${runtimeEnvironmentName()} · ${healthTermName}`
      : `${runtimeEnvironmentName()} · 等待读取学期`;
  }
  return `${runtimeEnvironmentName()} · ${term.name} · ${isTeacher ? "当前工资月" : "当前结算月"}：${formatMonthLabel(month)}`;
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
  // 后端已按当前登录账号完成可见范围过滤，其中包含 audience 为空、仅定向给某个
  // accountId 的审批抄送通知。这里不能再按角色二次筛选，否则总校财务虽收到
  // 「抄送给您」通知，前端却会把它过滤掉。
  if (backendMode()) return [...source].sort((a, b) => b.time.localeCompare(a.time));
  return source
    .filter((notice) => notice.audience === role || notice.audience === "all")
    .sort((a, b) => b.time.localeCompare(a.time));
}

function unreadNoticeCount() {
  return roleNotices().filter((notice) => !notice.read).length;
}

function unreadOaCcNoticeCount() {
  return roleNotices().filter((notice) => !notice.read && String(notice.title || "").startsWith("抄送给您：")).length;
}

// “抄送我的”是知悉消息而不是待办。打开该栏目（或打开其中任一单据）即视为已读，
// 红点只提示尚未查看的抄送，不能要求用户再去通知中心逐条手动清除。
async function markUnreadOaCcNoticesRead() {
  if (!backendMode()) return;
  const unread = roleNotices().filter(
    (notice) => !notice.read && String(notice.title || "").startsWith("抄送给您："),
  );
  if (!unread.length) return;
  await Promise.all(unread.map((notice) => markBackendNoticeRead(notice.id)));
  // markBackendNoticeRead 只更新通知角标；审批页的页签红点也需即时重绘。
  if (state.activeView === "approvals") renderApprovalsView();
}

function refreshNotificationBadge() {
  const navBtn = document.querySelector('.nav-item[data-view="notifications"]');
  if (!navBtn) return;
  const unread = unreadNoticeCount();
  let badge = navBtn.querySelector(".nav-badge");
  if (unread > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "nav-badge";
      navBtn.appendChild(badge);
    }
    badge.textContent = unread > 99 ? "99+" : String(unread);
    badge.setAttribute("aria-label", `${unread} 条未读通知`);
  } else if (badge) {
    badge.remove();
  }
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
    refreshNotificationBadge();
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
    refreshNotificationBadge();
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
  const scopeStageIds = currentAccount()?.scopeStageIds || backendSession?.account?.scopeStageIds || [];
  const scopedDivisions = scopeStageIds.length
    ? schedulingCatalog.divisions.filter((division) => scopeStageIds.includes(stageIdForDivisionId(division.id)))
    : schedulingCatalog.divisions;
  return scopedDivisions
    .map(
      (division) => `
        <option value="${division.id}" ${division.id === selectedId ? "selected" : ""}>
          ${division.name}
        </option>
      `,
    )
    .join("");
}

function stageIdForDivisionId(divisionId) {
  return divisionId === "elementary" ? "primary" : String(divisionId || "");
}

function divisionIdForStageId(stageId) {
  return stageId === "primary" ? "elementary" : String(stageId || "");
}

function applySchedulingScopeForAccount(account = currentAccount()) {
  const stageId = account?.scopeStageIds?.[0] || "";
  const divisionId = divisionIdForStageId(stageId);
  if (!divisionId || !schedulingCatalog.divisions.some((item) => item.id === divisionId)) return;
  const grades = schedulingGradesForDivision(divisionId, account);
  applySchedulingSelection(divisionId, grades[0]?.id || "");
}

function schedulingGradesForDivision(divisionId, account = currentAccount()) {
  const division =
    schedulingCatalog.divisions.find((item) => item.id === divisionId) ||
    schedulingCatalog.divisions[0];
  const gradeScope = account?.schedulingGradeIds || backendSession?.account?.schedulingGradeIds || [];
  if (!gradeScope.length) return division.grades;
  return division.grades.filter((grade) => gradeScope.includes(grade.id));
}

function schedulingGradeOptions(divisionId, selectedId) {
  const grades = schedulingGradesForDivision(divisionId);
  const resolvedSelectedId = grades.some((grade) => grade.id === selectedId) ? selectedId : grades[0]?.id;
  return grades
    .map(
      (grade) => `
        <option value="${grade.id}" ${grade.id === resolvedSelectedId ? "selected" : ""}>
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

function isRegularSchedulePeriod(period) {
  return period?.type === "regular" && period.active !== false;
}

function regularSchedulePeriods(config = state.schedulingConfig) {
  return (config?.periods || []).filter(isRegularSchedulePeriod);
}

const DEFAULT_SCHEDULE_DAY_INDEXES = [0, 1, 2, 3, 4];
const SCHEDULE_DAY_OPTIONS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function normalizeScheduleDayIndexes(value) {
  const source = Array.isArray(value) && value.length ? value : DEFAULT_SCHEDULE_DAY_INDEXES;
  const normalized = Array.from(
    new Set(source.map((dayIndex) => Number.parseInt(dayIndex, 10)).filter((dayIndex) => dayIndex >= 0 && dayIndex <= 6)),
  ).sort((left, right) => left - right);
  return normalized.length ? normalized : [...DEFAULT_SCHEDULE_DAY_INDEXES];
}

function schedulePeriodAppliesOnDay(period, dayIndex) {
  return normalizeScheduleDayIndexes(period?.dayIndexes).includes(Number(dayIndex));
}

function schedulePeriodDayText(period) {
  const days = normalizeScheduleDayIndexes(period?.dayIndexes);
  if (days.join(",") === "0,1,2,3") return "周一至周四";
  if (days.join(",") === "0,1,2,3,4") return "周一至周五";
  return days.map((dayIndex) => SCHEDULE_DAY_OPTIONS[dayIndex]).join("、");
}

function schedulingClassById(config, classId = "") {
  return (config?.classes || []).find((schoolClass) => schoolClass.id === classId) || null;
}

function schedulePeriodsForSchedulingClass(config = state.schedulingConfig, classId = "") {
  const schoolClass = schedulingClassById(config, classId);
  const templateKey = schoolClass?.scheduleTemplateKey || schoolClass?.highClassCategory || activeScheduleTemplateKey(config);
  return (config?.periodTemplates?.[templateKey] || config?.periods || []).map((period) => ({ ...period }));
}

function schedulingSlots() {
  const weekDates = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5);
  return weekDates.flatMap((date, dayIndex) =>
    regularSchedulePeriods().filter((period) => schedulePeriodAppliesOnDay(period, dayIndex)).map((period) => ({
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
    const teacherKey = `${assignment.teacherId}-${assignment.date}`;
    if (!teacherSlots.has(teacherKey)) teacherSlots.set(teacherKey, []);
    teacherSlots.get(teacherKey).push(assignment);

    const classKey = `${assignment.classId}-${assignment.date}`;
    if (!classSlots.has(classKey)) classSlots.set(classKey, []);
    classSlots.get(classKey).push(assignment);

    const classSubjectDateKey = `${assignment.classId}:${assignment.subjectId}:${assignment.date}`;
    if (!classSubjectDateItems.has(classSubjectDateKey)) classSubjectDateItems.set(classSubjectDateKey, []);
    classSubjectDateItems.get(classSubjectDateKey).push(assignment);

    const roomKey = `${assignment.roomId || assignment.room}-${assignment.date}`;
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

  const overlappingPairs = (items) => {
    const pairs = [];
    for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
        const left = lessonTimeRange(items[leftIndex]);
        const right = lessonTimeRange(items[rightIndex]);
        if (left.startMinutes < right.endMinutes && right.startMinutes < left.endMinutes) {
          pairs.push([items[leftIndex], items[rightIndex]]);
        }
      }
    }
    return pairs;
  };
  teacherSlots.forEach((items) => {
    overlappingPairs(items).forEach(([left, right]) => {
      conflicts.push({
        type: "teacher",
        title: `${left.teacherName} 上课时间重叠`,
        text: `${formatDate(left.date)} ${left.time} 与 ${right.time} 重叠：${left.className}${left.subjectName}、${right.className}${right.subjectName}`,
      });
    });
  });

  classSlots.forEach((items) => {
    overlappingPairs(items).forEach(([left, right]) => {
      conflicts.push({
        type: "class",
        title: `${left.className} 上课时间重叠`,
        text: `${formatDate(left.date)} ${left.time} 与 ${right.time} 重叠：${left.subjectName}、${right.subjectName}`,
      });
    });
  });

  roomSlots.forEach((items) => {
    overlappingPairs(items).forEach(([left, right]) => {
      conflicts.push({
        type: "room",
        title: `${left.room} 上课时间重叠`,
        text: `${formatDate(left.date)} ${left.time} 与 ${right.time} 重叠：${left.className}${left.subjectName}、${right.className}${right.subjectName}`,
      });
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

// 计薪课次：固定日程（含周日值班、自习、活动）会显示在终端，但不进入课时工资。
function payableLessons(teacherId) {
  return teacherLessons(teacherId).filter((lesson) => lesson.status !== "cancelled" && !lesson.nonPayable);
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
  // 系统结算至应发为止：个税、社保由学校财务线下处理，不进系统
  const attendanceDeduction = profile.attendanceDeduction || 0;

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
    gross,
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
    return { gross: Number(fallback.gross || 0) };
  }
  // 系统结算至应发为止，明细行本身已不含个税与社保
  const gross = normalizedRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  return { gross };
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
    <tr class="settlement-summary-row final-total">
      <td class="row-title" data-label="薪资项目">应发合计</td>
      <td class="muted" data-label="计算口径">明细各项合计。个税、社保由学校财务线下处理</td>
      <td data-label="金额">${formatCurrency(totals.gross)}</td>
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
    pendingCount: lessons.filter((lesson) => lesson.status !== "cancelled" && lesson.date > todayKey()).length,
    exceptionCount: lessons.filter((lesson) => lesson.status === "exception").length,
  };
}

function financeSalaryTotals() {
  return state.teachers.reduce(
    (totals, teacher) => {
      const salary = calculateSalary(teacher.id);
      totals.gross += salary.gross;
      totals.net += salary.gross;
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
    group.net += salary.gross;
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
  // 学部财务只管一个学部，列出其他学部只会让人误以为能查——按范围收敛。
  // 总校财务可只读查看全校，因此保留全部工资归属筛选；写操作仍按 financeScope 拦截。
  const scope = currentFinanceScopeId();
  const scopeName = currentFinanceScopeName();
  if (scope === "headquarters" && currentFinanceCanReadAll()) {
    return [
      `<option value="" ${selectedId ? "" : "selected"}>全部工资（只读汇总）</option>`,
      `<option value="headquarters" ${selectedId === "headquarters" ? "selected" : ""}>${escapeHtml(scopeName || "总校行政后勤")}</option>`,
      ...financeStageCatalog.map(
        (stage) => `<option value="${stage.id}" ${stage.id === selectedId ? "selected" : ""}>${stage.name}（只读）</option>`,
      ),
    ].join("");
  }
  if (scope === "headquarters") {
    return `<option value="headquarters" selected>${escapeHtml(scopeName || "总校行政后勤")}</option>`;
  }
  const catalog = scope ? financeStageCatalog.filter((stage) => stage.id === scope) : financeStageCatalog;
  return [
    ...(scope ? [] : [`<option value="" ${selectedId ? "" : "selected"}>全部学部</option>`]),
    ...catalog.map(
      (stage) => `<option value="${stage.id}" ${stage.id === selectedId ? "selected" : ""}>${stage.name}</option>`,
    ),
  ].join("");
}

function financeGradeOptions(stageId = "", selectedGrade = "") {
  // 未显式选学部时，学部财务的年级也要收敛到本学部：
  // 否则小学部会计会看到初一、高三这些永远查不出人的年级选项。
  const scope = currentFinanceScopeId();
  const effectiveStageId = stageId || (scope && scope !== "headquarters" ? scope : "");
  const stage = financeStageCatalog.find((item) => item.id === effectiveStageId);
  // 总校行政后勤没有年级；总校财务切到某个学部只读查看时仍可按年级筛选。
  const grades = effectiveStageId === "headquarters" || (scope === "headquarters" && !currentFinanceCanReadAll())
    ? []
    : stage
      ? stage.grades
      : financeStageCatalog.flatMap((item) => item.grades);
  return [
    `<option value="" ${selectedGrade ? "" : "selected"}>全部年级</option>`,
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

function renderFinanceTeacherFilters(context = "settlement") {
  const map = {
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

function financeReadFilterInputs(context = "settlement") {
  const map = {
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
    group.net += teacher.payroll?.grossPay || 0;
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
      net: summary.grossPay || 0,
      locked: summary.lockedCount || 0,
    };
  }
  return financeTeacherPage.items.reduce(
    (totals, teacher) => {
      totals.pending += teacher.summary?.pendingCount || 0;
      totals.exception += teacher.summary?.exceptionCount || 0;
      totals.gross += teacher.payroll?.grossPay || 0;
      totals.net += teacher.payroll?.grossPay || 0;
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
      const previousTermId = termManagementState.currentTerm?.id || "";
      termManagementState.currentTerm = schedule.currentTerm;
      if (!termManagementState.terms.some((term) => term.id === schedule.currentTerm.id)) {
        termManagementState.terms = [schedule.currentTerm, ...termManagementState.terms];
      }
      if (previousTermId !== schedule.currentTerm.id) {
        teacherConfirmationMonth = "";
        teacherWorkloadRequestId += 1;
        teacherPayrollRequestId += 1;
        resetTeacherWorkloadState();
        resetTeacherPayrollState();
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

async function loadBackendWorkload(teacherId = currentTeacherId(), month = defaultTeacherPayrollMonth()) {
  if (!backendMode() || !teacherId) return;
  const requestId = ++teacherWorkloadRequestId;
  const keepData = teacherWorkloadState.teacherId === teacherId && teacherWorkloadState.month === month;
  teacherWorkloadState = {
    ...teacherWorkloadState,
    teacherId,
    month,
    loading: true,
    error: "",
    data: keepData ? teacherWorkloadState.data : null,
  };

  try {
    const data = await apiRequest(`/api/teachers/${teacherId}/workload?month=${month}`);
    if (requestId !== teacherWorkloadRequestId) return;
    teacherWorkloadState = {
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: "",
      data,
    };
  } catch (error) {
    if (requestId !== teacherWorkloadRequestId) return;
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
    const data = await apiRequest(`/api/teachers/${teacherId}/lesson-records?month=${month}`);
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
      error: error.message || "课时记录加载失败",
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

async function loadBackendTeacherPayroll(teacherId = currentTeacherId(), month = defaultTeacherPayrollMonth(), options = {}) {
  if (!backendMode() || !teacherId) return;
  const detail = Boolean(options.detail);
  const requestId = ++teacherPayrollRequestId;
  const keepData =
    teacherPayrollState.teacherId === teacherId &&
    teacherPayrollState.month === month &&
    (!detail || teacherPayrollState.detail);
  teacherPayrollState = {
    ...teacherPayrollState,
    teacherId,
    month,
    detail,
    loading: true,
    error: "",
    data: keepData ? teacherPayrollState.data : null,
  };

  try {
    const params = new URLSearchParams({ month });
    if (detail) params.set("detail", "confirmation");
    const data = await apiRequest(`/api/teachers/${teacherId}/payroll?${params.toString()}`);
    if (requestId !== teacherPayrollRequestId) return;
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
    if (requestId !== teacherPayrollRequestId) return;
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

function ensureBackendTeacherPayroll(teacherId, month = defaultTeacherPayrollMonth(), options = {}) {
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
  if (!backendMode() || !canExportAllPayrollDetails()) return;
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

async function saveBackendTeacherAssessmentScore() {
  const teacherId = state.selectedFinanceTeacherId;
  const month = financeTeacherDetailState.month || currentSettlementMonth();
  const scoreInput = document.querySelector("#salaryAssessmentScore");
  const noteInput = document.querySelector("#salaryAssessmentNote");
  const rawScore = scoreInput?.value.trim() || "";
  if (!backendMode() || !isFinanceRole() || !teacherId || !canOperateFinanceTeacher(teacherId)) {
    showToast("请使用对应范围的财务账号录入考核分数");
    return;
  }
  if (!rawScore || !Number.isFinite(Number(rawScore)) || Number(rawScore) < 0) {
    showToast("请输入不小于 0 的考核分数");
    return;
  }
  if (financeTeacherDetailState.payroll?.generated?.status === "locked") {
    showToast("本月工资已锁定，请先解锁后再修改考核分数");
    return;
  }
  const isLifeTeacher = financeTeacherDetailState.payroll?.salaryProfile?.salaryCategory === "lifeTeacher";
  const lifeTeacherTransport = {
    short: Number(document.querySelector("#lifeTeacherTransportShort")?.value || 0),
    medium: Number(document.querySelector("#lifeTeacherTransportMedium")?.value || 0),
    long: Number(document.querySelector("#lifeTeacherTransportLong")?.value || 0),
    extraLong: Number(document.querySelector("#lifeTeacherTransportExtraLong")?.value || 0),
  };
  if (isLifeTeacher && Object.values(lifeTeacherTransport).some((value) => !Number.isInteger(value) || value < 0)) {
    showToast("接送次数必须是非负整数");
    return;
  }

  financeTeacherDetailState = { ...financeTeacherDetailState, loading: true, error: "" };
  render();
  try {
    await apiRequest("/api/hr/assessments", {
      method: "POST",
      body: {
        teacherId,
        month,
        score: Number(rawScore),
        note: noteInput?.value.trim() || "",
        ...(isLifeTeacher ? { lifeTeacherTransport } : {}),
      },
    });
    financeTeacherPage.loaded = false;
    await loadFinanceTeacherDetail(teacherId, { month, generatePayroll: false });
    showToast(`已保存 ${rawScore} 分；考核工资将按 ${rawScore}% 重新试算`);
  } catch (error) {
    financeTeacherDetailState = {
      ...financeTeacherDetailState,
      loading: false,
      error: error.message || "考核分数保存失败",
    };
    showToast(financeTeacherDetailState.error);
    render();
  }
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
    termBudgetState.loaded = false; // 解锁会退回已使用预算
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
    termBudgetState.loaded = false; // 锁定会改变已使用预算
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
  if (currentFinanceScopeId() === "headquarters") {
    showToast("总校财务负责执行已批准的工资发放，不发起学部工资确认");
    return;
  }
  if (!oaState.templates.length) await loadOaTemplates();
  const template = oaState.templates.find((item) => item.key === "payroll_approval");
  if (!template) {
    showToast("当前账号无权发起本学部工资确认");
    return;
  }
  await openOaCreateDialog("payroll_approval");
}

// ---- 课表导出与打印（验收 2.10 / 2.11）------------------------------------
// Excel 走后端生成的 SpreadsheetML；PDF 复用浏览器打印（打印 → 另存为 PDF），
// 一套实现同时覆盖「导出 PDF」与「打印」两项验收要求。

// 通用文件下载：后端返回文本内容，这里包成 Blob 触发浏览器下载
function downloadTextFile(content, filename, mimeType) {
  // BOM 让 Excel 正确识别 UTF-8，否则中文会乱码
  const blob = new Blob([`\uFEFF${content}`], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
}

// 当前课表总览选中的维度与目标
function currentScheduleScope() {
  const classId = state.selectedScheduleOverviewClassId || "";
  return { dimension: classId ? "class" : "grade", targetId: classId };
}

async function exportScheduleExcel() {
  if (!backendMode()) {
    showToast("导出课表需要连接后端");
    return;
  }
  const { dimension, targetId } = currentScheduleScope();
  if (!targetId) {
    showToast("请先选择要导出的班级");
    return;
  }
  try {
    const params = new URLSearchParams({ dimension, targetId });
    const result = await apiRequest(`/api/schedule/export?${params.toString()}`);
    if (!result?.content || !result.total) {
      showToast("当前课表没有可导出的课次");
      return;
    }
    downloadTextFile(result.content, result.filename, result.mimeType || "application/vnd.ms-excel");
    showToast(`已导出 ${result.total} 节课`);
  } catch (error) {
    showToast(error.message || "课表导出失败");
  }
}

// 打印：先把课表渲染成一张独立的打印表格（屏幕上不可见，只在 @media print 显示），
// 再调 window.print()。直接打印页面上的课表会带上筛选器、侧栏等无关内容。
async function printSchedule() {
  if (!backendMode()) {
    showToast("打印课表需要连接后端");
    return;
  }
  const { dimension, targetId } = currentScheduleScope();
  if (!targetId) {
    showToast("请先选择要打印的班级");
    return;
  }
  try {
    const params = new URLSearchParams({ dimension, targetId });
    const { grid } = await apiRequest(`/api/schedule/grid?${params.toString()}`);
    if (!grid || !grid.lessonCount) {
      showToast("当前课表没有可打印的课次");
      return;
    }
    renderSchedulePrintTable(grid);
    // 不用 requestAnimationFrame 等布局：标签页不在前台时浏览器会暂停 rAF，
    // 回调永远不执行，打印就静默失效了。window.print() 本身会强制同步布局，
    // innerHTML 赋值后直接调用即可。
    window.print();
  } catch (error) {
    showToast(error.message || "课表打印失败");
  }
}

function renderSchedulePrintTable(grid) {
  const host = document.querySelector("#schedulePrintHost");
  if (!host) return;
  const subtitle = [grid.termName, grid.weekStart ? `${grid.weekStart} 起当周` : "全学期"]
    .filter(Boolean)
    .join(" · ");
  const head = grid.weekdays.map((w) => `<th>${escapeHtml(w)}</th>`).join("");
  const body = grid.periods
    .map((period, p) => {
      const cols = grid.weekdays
        .map((_, w) => {
          const entries = grid.cells[p][w] || [];
          if (!entries.length) return "<td></td>";
          const text = entries
            .map((e) => {
              const mark = e.status === "cancelled" ? "【已取消】" : "";
              // 按教师看课表关心「给哪个班上」，按班级看关心「谁来上」
              const who = grid.dimension === "teacher" ? e.className : e.nonRegular ? (e.teacherName ? `负责人：${e.teacherName}` : "") : e.teacherName;
              const subject = e.nonRegular ? `【${e.typeName || schedulePeriodTypeText(e.type)}】${e.subjectName}` : e.subjectName;
              return [mark + subject, who, e.room].filter(Boolean).map(escapeHtml).join("<br>");
            })
            .join("<hr>");
          return `<td>${text}</td>`;
        })
        .join("");
      return `<tr><th>${escapeHtml(period)}</th>${cols}</tr>`;
    })
    .join("");
  host.innerHTML = `
    <div class="schedule-print-title">${escapeHtml(grid.title)}</div>
    <div class="schedule-print-subtitle">${escapeHtml(subtitle)}</div>
    <table class="schedule-print-table">
      <thead><tr><th>时段</th>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}


// ---------------------------------------------------------------------------
// 统计报表：周教学工作量台账（验收 2.18）与年度薪资汇总（验收 3.19）
//
// 状态用工厂函数初始化，并挂进 resetScopedCaches()——切换账号时必须清空。
// 学部财务之间切换如果留着上一个账号的报表数据，屏幕上就会显示他部的教师
// 姓名和工资，这是越权展示，不是"刷新一下就好"的显示问题。
// ---------------------------------------------------------------------------

function initialWeeklyWorkloadState() {
  return { loading: false, error: "", report: null, weekStart: "", stageId: "", includeIdle: false };
}
function initialAnnualSalaryState() {
  return { loading: false, error: "", report: null, year: 0, stageId: "" };
}

let weeklyWorkloadState = initialWeeklyWorkloadState();
let annualSalaryState = initialAnnualSalaryState();

// 学部下拉：财务与学部负责人本身就只有一个学部，选项由后端范围决定，
// 这里只提供"全部 + 三个学部"，越权的选择在服务端会被裁掉。
const REPORT_STAGE_OPTIONS = [
  { value: "", label: "全部（按账号权限）" },
  { value: "kindergarten", label: "幼儿园" },
  { value: "primary", label: "小学部" },
  { value: "middle", label: "初中部" },
  { value: "high", label: "高中部" },
];

function reportStageOptionsForAccount() {
  const account = backendSession?.account || currentAccount() || {};
  const financeScope = currentFinanceScopeId();
  if (currentRole() === "finance" && financeScope && financeScope !== "headquarters") {
    return [{ value: "", label: `${stageLabel(financeScope) || currentFinanceScopeName() || "本学部"}（账号范围）` }];
  }
  const scopedStages = Array.isArray(account.scopeStageIds)
    ? [...new Set(account.scopeStageIds.map(String).filter(Boolean))]
    : [];
  if (scopedStages.length) {
    const names = scopedStages.map(stageLabel).filter(Boolean).join("、") || "负责学部";
    return [{ value: "", label: `${names}（账号范围）` }];
  }
  return REPORT_STAGE_OPTIONS;
}

function defaultReportWeek() {
  const term = termManagementState.currentTerm;
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  // 今天若不在学期内（如假期、学期尚未开始），回落到学期首周，
  // 否则打开报表就是一张空表，看的人会以为是系统没数据。
  if (term?.startDate && term?.endDate && (iso < term.startDate || iso > term.endDate)) {
    return term.startDate;
  }
  // 学期信息尚未加载时交给服务端定（它会回落到学期开始日），再用返回值回填
  return term?.startDate ? iso : "";
}

function reportYearOptions() {
  const current = new Date().getFullYear();
  const years = new Set([current, current - 1, current + 1]);
  (termManagementState.terms || []).forEach((t) => {
    const y = Number(String(t.startDate || "").slice(0, 4));
    if (y) years.add(y);
  });
  return [...years].sort((a, b) => b - a);
}

function canViewAnnualSalaryReport() {
  return currentRole() === "finance" || canViewDivisionPayrollDetails() || canViewAllPayrollDetails();
}

// 学部财务可查看本学部台账，但不能把台账导出为 Excel 或打印为 PDF。
// 非财务管理角色的工作量报表导出权限保持原有口径。
function canExportWeeklyWorkloadReport() {
  return currentRole() !== "finance" || canExportAllPayrollDetails();
}

function fillSelect(selector, options, selected) {
  const el = document.querySelector(selector);
  if (!el) return;
  const next = options
    .map((o) => `<option value="${escapeHtml(String(o.value))}">${escapeHtml(o.label)}</option>`)
    .join("");
  if (el.innerHTML !== next) el.innerHTML = next;
  el.value = String(selected ?? "");
}

async function loadWeeklyWorkload() {
  if (!backendMode()) {
    weeklyWorkloadState = { ...initialWeeklyWorkloadState(), error: "统计报表需要连接后端" };
    renderWeeklyWorkload();
    return;
  }
  const weekStart = weeklyWorkloadState.weekStart || defaultReportWeek();
  weeklyWorkloadState = { ...weeklyWorkloadState, loading: true, error: "" };
  renderWeeklyWorkload();
  try {
    const params = new URLSearchParams({
      weekStart,
      stageId: weeklyWorkloadState.stageId || "",
      includeIdle: weeklyWorkloadState.includeIdle ? "true" : "false",
    });
    const report = await apiRequest(`/api/reports/weekly-workload?${params.toString()}`);
    // 用服务端归一化后的周一回填：用户可能选的是周三，服务端会退到周一
    weeklyWorkloadState = { ...weeklyWorkloadState, loading: false, report, weekStart: report.weekStart };
  } catch (error) {
    weeklyWorkloadState = {
      ...weeklyWorkloadState,
      loading: false,
      report: null,
      error: error.message || "工作量台账加载失败",
    };
  }
  renderWeeklyWorkload();
}

async function loadAnnualSalary() {
  if (!backendMode()) {
    annualSalaryState = { ...initialAnnualSalaryState(), error: "统计报表需要连接后端" };
    renderAnnualSalary();
    return;
  }
  const year = annualSalaryState.year || new Date().getFullYear();
  annualSalaryState = { ...annualSalaryState, loading: true, error: "", year };
  renderAnnualSalary();
  try {
    const params = new URLSearchParams({ year: String(year), stageId: annualSalaryState.stageId || "" });
    const report = await apiRequest(`/api/reports/annual-salary?${params.toString()}`);
    annualSalaryState = { ...annualSalaryState, loading: false, report };
  } catch (error) {
    annualSalaryState = {
      ...annualSalaryState,
      loading: false,
      report: null,
      error: error.message || "年度薪资汇总加载失败",
    };
  }
  renderAnnualSalary();
}

function renderReportsView() {
  const reportStageOptions = reportStageOptionsForAccount();
  fillSelect("#weeklyWorkloadStage", reportStageOptions, weeklyWorkloadState.stageId);
  const weeklyReportExportAllowed = canExportWeeklyWorkloadReport();
  ["#exportWeeklyWorkload", "#printWeeklyWorkload"].forEach((selector) => {
    const button = document.querySelector(selector);
    if (button) button.hidden = !weeklyReportExportAllowed;
  });
  const annualPanel = document.querySelector("#annualSalaryPanel");
  if (annualPanel) annualPanel.hidden = !canViewAnnualSalaryReport();
  const annualReportExportAllowed = canExportAllPayrollDetails();
  ["#exportAnnualSalary", "#printAnnualSalary"].forEach((selector) => {
    const button = document.querySelector(selector);
    if (button) button.hidden = !annualReportExportAllowed;
  });
  if (!canViewAnnualSalaryReport()) {
    renderWeeklyWorkload();
    return;
  }
  fillSelect(
    "#annualSalaryYear",
    reportYearOptions().map((y) => ({ value: y, label: `${y} 年` })),
    annualSalaryState.year || new Date().getFullYear(),
  );
  fillSelect("#annualSalaryStage", reportStageOptions, annualSalaryState.stageId);

  const week = document.querySelector("#weeklyWorkloadWeek");
  if (week) week.value = weeklyWorkloadState.weekStart || defaultReportWeek();
  const idle = document.querySelector("#weeklyWorkloadIdle");
  if (idle) idle.checked = Boolean(weeklyWorkloadState.includeIdle);

  renderWeeklyWorkload();
  renderAnnualSalary();
}

function setReportStatus(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function renderWeeklyWorkload() {
  const wrap = document.querySelector("#weeklyWorkloadTable");
  const summary = document.querySelector("#weeklyWorkloadSummary");
  if (!wrap || !summary) return;
  const { loading, error, report } = weeklyWorkloadState;

  if (loading) {
    setReportStatus("#weeklyWorkloadStatus", "读取中");
    wrap.innerHTML = '<p class="empty-hint">正在统计本周工作量…</p>';
    summary.innerHTML = "";
    return;
  }
  if (error) {
    setReportStatus("#weeklyWorkloadStatus", "加载失败");
    wrap.innerHTML = `<p class="empty-hint">${escapeHtml(error)}</p>`;
    summary.innerHTML = "";
    return;
  }
  if (!report) {
    setReportStatus("#weeklyWorkloadStatus", "待加载");
    wrap.innerHTML = '<p class="empty-hint">选择周次后点击刷新。</p>';
    summary.innerHTML = "";
    return;
  }

  const t = report.totals;
  setReportStatus("#weeklyWorkloadStatus", `${report.weekStart} 至 ${report.weekEnd}`);
  summary.innerHTML = [
    { label: "教师", value: `${report.rows.length} 人` },
    { label: "课次合计", value: t.lessonCount },
    { label: "课时合计", value: t.units },
    { label: "计薪课次", value: t.payable },
    { label: "已取消", value: t.cancelled },
  ]
    .map(
      (m) =>
        `<article class="metric"><p class="metric-label">${escapeHtml(m.label)}</p><p class="metric-value">${escapeHtml(String(m.value))}</p></article>`,
    )
    .join("");

  if (!report.rows.length) {
    wrap.innerHTML = `<p class="empty-hint">${escapeHtml(report.scopeNote)}：本周没有可统计的教师。</p>`;
    return;
  }

  const head = ["工号", "姓名", "学部", "科目", ...report.weekdays, "课次", "课时", "异常"]
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join("");
  const body = report.rows
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.employeeNo)}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.stageName)}</td>
        <td>${escapeHtml(r.subject)}</td>
        ${r.daily.map((v) => `<td>${v || ""}</td>`).join("")}
        <td>${r.lessonCount || ""}</td>
        <td>${r.units || ""}</td>
        <td class="${r.exception ? "report-warn" : ""}">${r.exception || ""}</td>
      </tr>`,
    )
    .join("");
  const foot = `<tr class="report-total">
      <th colspan="4">合计（${escapeHtml(report.scopeNote)}）</th>
      ${t.daily.map((v) => `<td>${v || ""}</td>`).join("")}
      <td>${t.lessonCount || ""}</td><td>${t.units || ""}</td><td>${t.exception || ""}</td>
    </tr>`;

  wrap.innerHTML = `<table class="report-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody><tfoot>${foot}</tfoot></table>`;
}

function renderAnnualSalary() {
  const wrap = document.querySelector("#annualSalaryTable");
  const summary = document.querySelector("#annualSalarySummary");
  if (!wrap || !summary) return;
  const { loading, error, report } = annualSalaryState;

  if (loading) {
    setReportStatus("#annualSalaryStatus", "读取中");
    wrap.innerHTML = '<p class="empty-hint">正在汇总年度薪资…</p>';
    summary.innerHTML = "";
    return;
  }
  if (error) {
    setReportStatus("#annualSalaryStatus", "加载失败");
    wrap.innerHTML = `<p class="empty-hint">${escapeHtml(error)}</p>`;
    summary.innerHTML = "";
    return;
  }
  if (!report) {
    setReportStatus("#annualSalaryStatus", "待加载");
    wrap.innerHTML = '<p class="empty-hint">选择年度后点击刷新。</p>';
    summary.innerHTML = "";
    return;
  }

  const t = report.totals;
  // 一张工资单都没有时不能说"全部已结算"——那会被读成"工资都发完了"
  const hasPayroll = t.settled > 0 || t.inProgress > 0;
  setReportStatus(
    "#annualSalaryStatus",
    report.unsettledMonths.length
      ? `${report.unsettledMonths.length} 个月结算中`
      : hasPayroll
        ? "全部已结算"
        : "暂无工资单",
  );
  summary.innerHTML = [
    { label: "教师", value: `${report.rows.length} 人` },
    { label: "已结算合计", value: formatCurrency(t.settled) },
    { label: "结算中合计", value: formatCurrency(t.inProgress) },
    { label: "结算中月份", value: report.unsettledMonths.join("、") || "无" },
  ]
    .map(
      (m) =>
        `<article class="metric"><p class="metric-label">${escapeHtml(m.label)}</p><p class="metric-value">${escapeHtml(String(m.value))}</p></article>`,
    )
    .join("");

  if (!report.rows.length || !hasPayroll) {
    wrap.innerHTML = `<p class="empty-hint">${escapeHtml(report.scopeNote)}：${report.year} 年还没有已生成的工资单，请先在「薪资结算」中生成。</p>`;
    return;
  }

  const money = (v) => (v === null || v === undefined || v === "" ? "" : formatCurrency(v));
  const head = ["工号", "姓名", "学部", ...report.months, "已结算合计", "结算中"]
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join("");
  const body = report.rows
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.employeeNo)}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.stageName)}</td>
        ${r.monthly
          .map((v, i) => {
            // 结算中的月份标注出来，避免被当成已发放金额引用
            const pending = r.monthStatus[i] && r.monthStatus[i] !== "已结算";
            return `<td class="${pending ? "report-warn" : ""}" title="${escapeHtml(r.monthStatus[i] || "")}">${money(v)}</td>`;
          })
          .join("")}
        <td>${money(r.settled)}</td>
        <td class="${r.inProgress ? "report-warn" : ""}">${money(r.inProgress || "")}</td>
      </tr>`,
    )
    .join("");
  const foot = `<tr class="report-total">
      <th colspan="3">合计（${escapeHtml(report.scopeNote)}）</th>
      ${t.monthly.map((v) => `<td>${money(v || "")}</td>`).join("")}
      <td>${money(t.settled)}</td><td>${money(t.inProgress || "")}</td>
    </tr>`;

  wrap.innerHTML = `<table class="report-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody><tfoot>${foot}</tfoot></table>`;
}

// --- 导出与打印 ---------------------------------------------------------------

async function exportReport(kind) {
  if (
    (kind === "annual" && !canExportAllPayrollDetails()) ||
    (kind === "weekly" && !canExportWeeklyWorkloadReport())
  ) return;
  if (!backendMode()) {
    showToast("导出报表需要连接后端");
    return;
  }
  const isWeekly = kind === "weekly";
  const params = isWeekly
    ? new URLSearchParams({
        weekStart: weeklyWorkloadState.weekStart || defaultReportWeek(),
        stageId: weeklyWorkloadState.stageId || "",
        includeIdle: weeklyWorkloadState.includeIdle ? "true" : "false",
        format: "excel",
      })
    : new URLSearchParams({
        year: String(annualSalaryState.year || new Date().getFullYear()),
        stageId: annualSalaryState.stageId || "",
        format: "excel",
      });
  const path = isWeekly ? "weekly-workload" : "annual-salary";
  try {
    const result = await apiRequest(`/api/reports/${path}?${params.toString()}`);
    if (!result?.content || !result.total) {
      showToast("当前筛选没有可导出的数据");
      return;
    }
    downloadTextFile(result.content, result.filename, result.mimeType || "application/vnd.ms-excel");
    showToast(`已导出 ${result.total} 条`);
  } catch (error) {
    showToast(error.message || "报表导出失败");
  }
}

// 打印：与课表一致，先渲染一张独立的打印表格再调 window.print()。
// 不用 requestAnimationFrame——标签页不在前台时 rAF 会被暂停，回调不执行，
// 打印会静默失效。innerHTML 赋值后 window.print() 自身会强制同步布局。
function printReport(kind) {
  if (
    (kind === "annual" && !canExportAllPayrollDetails()) ||
    (kind === "weekly" && !canExportWeeklyWorkloadReport())
  ) return;
  const host = document.querySelector("#reportPrintHost");
  if (!host) return;
  const source = kind === "weekly" ? weeklyWorkloadState.report : annualSalaryState.report;
  if (!source || !source.rows?.length) {
    showToast("当前没有可打印的内容");
    return;
  }
  const table = document.querySelector(kind === "weekly" ? "#weeklyWorkloadTable table" : "#annualSalaryTable table");
  if (!table) {
    showToast("当前没有可打印的内容");
    return;
  }
  const title = kind === "weekly" ? "周教学工作量台账" : `${source.year} 年度薪资汇总表`;
  const subtitle =
    kind === "weekly"
      ? `${source.termName} · ${source.weekStart} 至 ${source.weekEnd} · ${source.scopeNote}`
      : `${source.year} 年度 · ${source.scopeNote}${
          source.unsettledMonths.length
            ? `｜${source.unsettledMonths.join("、")} 尚未结算，未计入已结算合计`
            : ""
        }`;
  host.innerHTML = `
    <div class="schedule-print-title">${escapeHtml(title)}</div>
    <div class="schedule-print-subtitle">${escapeHtml(subtitle)}</div>
    ${table.outerHTML}`;
  window.print();
}


// ---------------------------------------------------------------------------
// 基础数据批量导入导出（验收 2.1 / 2.2）与教学资源台账（验收 2.4）
//
// 导入是两段式：先预检、看清"新建几条改几条改了哪些字段"，确认后才提交。
// 直接导入不给看差异，等于让教务闭着眼睛改全校班级表。
// ---------------------------------------------------------------------------

function initialDataPortingState() {
  return {
    entity: "classes",
    stageId: "",
    csvText: "",
    fileName: "",
    preview: null,
    loading: false,
    error: "",
  };
}
function initialResourceLedgerState() {
  return { loading: false, error: "", ledger: null, stageId: "", roomType: "", keyword: "", onlyIdle: false };
}

// ---------------------------------------------------------------------------
// 账套管理与系统监控的模块级状态
//
// 声明必须放在 renderStep(...) 注册之前。这两块的渲染函数写在文件末尾，
// 状态原本也跟着写在末尾——但 let 不提升，首次渲染跑到时变量还在暂时性死区，
// 直接抛 "Cannot access 'ledgerState' before initialization"，
// 整个视图渲染不出来。函数声明会提升，所以函数留在末尾没问题，状态不行。
// ---------------------------------------------------------------------------
const LEDGER_TYPE_LABELS = { hr: "人事账套", scheduling: "排课课时账套", payroll: "薪资财务账套" };
const LEDGER_STATUS_LABELS = { initializing: "初始化中", active: "使用中", locked: "已锁定", archived: "已归档" };
// 按钮上写的是「要做什么」，不是「做完会变成什么状态」。
// 状态名当按钮文案，用户看到「已锁定」会以为那是个标签而不是一个动作。
const LEDGER_ACTION_LABELS = { active: "启用", locked: "锁定", archived: "归档" };
// 状态流转规则要与后端 TRANSITIONS 一致：界面上不该出现一个点了必然报错的按钮
const LEDGER_NEXT_STATUS = { initializing: ["active"], active: ["locked", "archived"], locked: ["archived"], archived: [] };

let ledgerState = {
  loaded: false,
  loading: false,
  error: "",
  type: "",
  status: "",
  ledgers: [],
};

let ledgerReconcileState = { month: "", loading: false, error: "", report: null };

const MONITOR_LEVEL_LABELS = { critical: "严重", warning: "警告", info: "提示" };

let monitoringState = { loaded: false, loading: false, error: "", data: null };

let dataPortingState = initialDataPortingState();
let resourceLedgerState = initialResourceLedgerState();

const PORTING_ENTITY_LABELS = { classes: "班级", rooms: "教室", subjects: "课程科目" };
const LEDGER_ROOM_TYPES = [
  { value: "", label: "全部类型" },
  { value: "homeroom", label: "普通教室" },
  { value: "lab", label: "实验室" },
  { value: "computer", label: "计算机房" },
  { value: "playground", label: "操场" },
  { value: "art", label: "美术室" },
  { value: "music", label: "音乐室" },
];

async function downloadPortingFile(kind) {
  if (!backendMode()) {
    showToast("导出需要连接后端");
    return;
  }
  const entity = dataPortingState.entity;
  const path = kind === "template" ? "template" : "export";
  const params = new URLSearchParams();
  if (kind !== "template" && dataPortingState.stageId) params.set("stageId", dataPortingState.stageId);
  try {
    const suffix = params.toString() ? `?${params.toString()}` : "";
    const result = await apiRequest(`/api/data-porting/${entity}/${path}${suffix}`);
    downloadTextFile(result.content, result.filename, result.mimeType || "text/csv");
    showToast(kind === "template" ? "已下载导入模板" : `已导出 ${result.total} 条`);
  } catch (error) {
    showToast(error.message || "导出失败");
  }
}

async function previewPortingImport() {
  if (!backendMode()) {
    showToast("导入需要连接后端");
    return;
  }
  const csvText = dataPortingState.csvText.trim();
  if (!csvText) {
    showToast("请先选择或粘贴 CSV 内容");
    return;
  }
  dataPortingState = { ...dataPortingState, loading: true, error: "", preview: null };
  renderDataPorting();
  try {
    const preview = await apiRequest(`/api/data-porting/${dataPortingState.entity}/preview`, {
      method: "POST",
      body: { csvText },
    });
    dataPortingState = { ...dataPortingState, loading: false, preview };
  } catch (error) {
    // 校验不通过时后端把逐行错误放在 details 里，这才是使用者要看的东西
    dataPortingState = {
      ...dataPortingState,
      loading: false,
      preview: error.details || null,
      error: error.details ? "" : error.message || "预检失败",
    };
  }
  renderDataPorting();
}

async function commitPortingImport() {
  const preview = dataPortingState.preview;
  if (!preview?.canImport) {
    showToast("请先通过预检");
    return;
  }
  const label = PORTING_ENTITY_LABELS[dataPortingState.entity] || "数据";
  const confirmed = await confirmDialog({
    title: `确认导入${label}`,
    message: `将新建 ${preview.createCount} 条、更新 ${preview.updateCount} 条（${preview.unchangedCount} 条无变化）。导入不会删除任何数据。`,
    confirmText: "确认导入",
  });
  if (!confirmed) return;

  dataPortingState = { ...dataPortingState, loading: true };
  renderDataPorting();
  try {
    const result = await apiRequest(`/api/data-porting/${dataPortingState.entity}/commit`, {
      method: "POST",
      body: { csvText: dataPortingState.csvText.trim() },
    });
    showToast(`已导入：新建 ${result.createdCount} 条，更新 ${result.updatedCount} 条`);
    // 导入后清空，避免同一份文件被重复提交
    dataPortingState = { ...initialDataPortingState(), entity: dataPortingState.entity, stageId: dataPortingState.stageId };
    // 台账就在同一页上，导入后立刻重算；排课等其他视图各自加载时会拿到新数据。
    await loadResourceLedger();
  } catch (error) {
    dataPortingState = {
      ...dataPortingState,
      loading: false,
      preview: error.details || dataPortingState.preview,
      error: error.details ? "" : error.message || "导入失败",
    };
    showToast(error.message || "导入失败");
  }
  renderDataPorting();
}

function renderDataPorting() {
  const entitySelect = document.querySelector("#dataPortingEntity");
  if (entitySelect && entitySelect.value !== dataPortingState.entity) entitySelect.value = dataPortingState.entity;
  fillSelect("#dataPortingStage", REPORT_STAGE_OPTIONS, dataPortingState.stageId);

  const textarea = document.querySelector("#dataPortingCsv");
  if (textarea && textarea.value !== dataPortingState.csvText) textarea.value = dataPortingState.csvText;

  const commit = document.querySelector("#commitPortingImport");
  const preview = dataPortingState.preview;
  if (commit) commit.disabled = !preview?.canImport || dataPortingState.loading;

  const summary = document.querySelector("#dataPortingSummary");
  const result = document.querySelector("#dataPortingResult");
  if (!summary || !result) return;

  setReportStatus("#dataPortingStatus", dataPortingState.loading ? "处理中" : preview ? (preview.canImport ? "预检通过" : "预检未通过") : "就绪");

  if (dataPortingState.error) {
    summary.innerHTML = "";
    result.innerHTML = `<p class="empty-hint">${escapeHtml(dataPortingState.error)}</p>`;
    return;
  }
  if (!preview) {
    summary.innerHTML = "";
    result.innerHTML = '<p class="empty-hint">选择文件后点「预检」，确认变更内容再导入。</p>';
    return;
  }

  summary.innerHTML = [
    { label: "总行数", value: preview.totalRows },
    { label: "新建", value: preview.createCount },
    { label: "更新", value: preview.updateCount },
    { label: "无变化", value: preview.unchangedCount },
    { label: "错误行", value: preview.errorRows },
  ]
    .map(
      (m) =>
        `<article class="metric"><p class="metric-label">${escapeHtml(m.label)}</p><p class="metric-value">${escapeHtml(String(m.value))}</p></article>`,
    )
    .join("");

  const blocks = [];

  if (preview.errors?.length) {
    blocks.push(`
      <div class="porting-messages porting-errors">
        <h4>必须先修正以下 ${preview.errors.length} 处错误</h4>
        <ul>${preview.errors
          .slice(0, 30)
          .map((e) => `<li>第 ${escapeHtml(String(e.rowNumber))} 行 · ${escapeHtml(e.field)}：${escapeHtml(e.message)}</li>`)
          .join("")}</ul>
        ${preview.errors.length > 30 ? `<p>另有 ${preview.errors.length - 30} 处未列出。</p>` : ""}
      </div>`);
  }
  if (preview.warnings?.length) {
    blocks.push(`
      <div class="porting-messages porting-warnings">
        <h4>提示（不影响导入，请确认是否符合预期）</h4>
        <ul>${preview.warnings
          .slice(0, 20)
          .map((w) => `<li>第 ${escapeHtml(String(w.rowNumber))} 行：${escapeHtml(w.message)}</li>`)
          .join("")}</ul>
      </div>`);
  }

  const changed = (preview.rows || []).filter((r) => r.action !== "unchanged");
  if (changed.length) {
    blocks.push(`
      <table class="report-table porting-diff">
        <thead><tr><th>行号</th><th>操作</th><th>名称</th><th>变更内容</th></tr></thead>
        <tbody>${changed
          .map(
            (r) => `<tr>
              <td>${escapeHtml(String(r.rowNumber))}</td>
              <td class="${r.action === "create" ? "porting-create" : "porting-update"}">${r.action === "create" ? "新建" : "更新"}</td>
              <td>${escapeHtml(r.name || "")}</td>
              <td class="porting-changes">${
                r.action === "create"
                  ? "—"
                  : (r.changes || [])
                      .map((c) => `${escapeHtml(c.field)}：${escapeHtml(c.from || "空")} → <strong>${escapeHtml(c.to)}</strong>`)
                      .join("<br>")
              }</td>
            </tr>`,
          )
          .join("")}</tbody>
      </table>`);
    const changedTotal = preview.createCount + preview.updateCount;
    if (changedTotal > changed.length) {
      blocks.push(
        `<p class="empty-hint">变更共 ${changedTotal} 条，此处展示前 ${changed.length} 条；导入将处理全部变更。</p>`,
      );
    }
  } else if (!preview.errors?.length) {
    blocks.push('<p class="empty-hint">与系统现有数据完全一致，无需导入。</p>');
  }

  result.innerHTML = blocks.join("");
}

// --- 教学资源台账 -------------------------------------------------------------

async function loadResourceLedger() {
  if (!backendMode()) {
    resourceLedgerState = { ...initialResourceLedgerState(), error: "教学资源台账需要连接后端" };
    renderResourceLedger();
    return;
  }
  resourceLedgerState = { ...resourceLedgerState, loading: true, error: "" };
  renderResourceLedger();
  try {
    const params = new URLSearchParams({
      stageId: resourceLedgerState.stageId || "",
      roomType: resourceLedgerState.roomType || "",
      keyword: resourceLedgerState.keyword || "",
      onlyIdle: resourceLedgerState.onlyIdle ? "true" : "false",
    });
    const ledger = await apiRequest(`/api/resource-ledger?${params.toString()}`);
    resourceLedgerState = { ...resourceLedgerState, loading: false, ledger };
  } catch (error) {
    resourceLedgerState = {
      ...resourceLedgerState,
      loading: false,
      ledger: null,
      error: error.message || "教学资源台账加载失败",
    };
  }
  renderResourceLedger();
}

async function exportResourceLedgerFile() {
  if (!backendMode()) {
    showToast("导出需要连接后端");
    return;
  }
  try {
    const params = new URLSearchParams({
      stageId: resourceLedgerState.stageId || "",
      roomType: resourceLedgerState.roomType || "",
      keyword: resourceLedgerState.keyword || "",
      onlyIdle: resourceLedgerState.onlyIdle ? "true" : "false",
      format: "excel",
    });
    const result = await apiRequest(`/api/resource-ledger?${params.toString()}`);
    if (!result?.content || !result.total) {
      showToast("当前筛选没有可导出的教室");
      return;
    }
    downloadTextFile(result.content, result.filename, result.mimeType);
    showToast(`已导出 ${result.total} 间教室`);
  } catch (error) {
    showToast(error.message || "台账导出失败");
  }
}

function renderResourceLedger() {
  fillSelect("#ledgerStage", REPORT_STAGE_OPTIONS, resourceLedgerState.stageId);
  fillSelect("#ledgerRoomType", LEDGER_ROOM_TYPES, resourceLedgerState.roomType);
  const kw = document.querySelector("#ledgerKeyword");
  if (kw && kw.value !== resourceLedgerState.keyword) kw.value = resourceLedgerState.keyword;
  const idle = document.querySelector("#ledgerOnlyIdle");
  if (idle) idle.checked = Boolean(resourceLedgerState.onlyIdle);

  const summary = document.querySelector("#resourceLedgerSummary");
  const wrap = document.querySelector("#resourceLedgerTable");
  if (!summary || !wrap) return;
  const { loading, error, ledger } = resourceLedgerState;

  if (loading) {
    setReportStatus("#resourceLedgerStatus", "读取中");
    wrap.innerHTML = '<p class="empty-hint">正在统计教室占用…</p>';
    summary.innerHTML = "";
    return;
  }
  if (error) {
    setReportStatus("#resourceLedgerStatus", "加载失败");
    wrap.innerHTML = `<p class="empty-hint">${escapeHtml(error)}</p>`;
    summary.innerHTML = "";
    return;
  }
  if (!ledger) {
    setReportStatus("#resourceLedgerStatus", "待加载");
    wrap.innerHTML = '<p class="empty-hint">点击刷新查看台账。</p>';
    summary.innerHTML = "";
    return;
  }

  const t = ledger.totals;
  setReportStatus("#resourceLedgerStatus", `${t.roomCount} 间`);
  summary.innerHTML = [
    { label: "教室总数", value: `${t.roomCount} 间` },
    { label: "本学期课次", value: t.lessonCount },
    { label: "闲置", value: `${t.idleCount} 间` },
    { label: "停用", value: `${t.disabledCount} 间` },
  ]
    .map(
      (m) =>
        `<article class="metric"><p class="metric-label">${escapeHtml(m.label)}</p><p class="metric-value">${escapeHtml(String(m.value))}</p></article>`,
    )
    .join("");

  if (!ledger.rows.length) {
    wrap.innerHTML = '<p class="empty-hint">当前筛选没有匹配的教室。</p>';
    return;
  }

  const head = ["教室ID", "学部", "教室名称", "类型", "容量", "使用班级", "本学期课次", "状态"]
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join("");
  const body = ledger.rows
    .map(
      (r) => `<tr>
        <td>${escapeHtml(r.id)}</td>
        <td>${escapeHtml(r.stageName)}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.roomTypeLabel)}</td>
        <td>${escapeHtml(String(r.capacity ?? ""))}</td>
        <td>${escapeHtml(r.holderNames || "—")}</td>
        <td class="${r.idle ? "report-warn" : ""}">${r.lessonCount}</td>
        <td class="${r.active ? "" : "report-warn"}">${r.active ? "启用" : "停用"}</td>
      </tr>`,
    )
    .join("");
  wrap.innerHTML = `<table class="report-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderDataPortingView() {
  renderDataPorting();
  renderResourceLedger();
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
  if (!backendMode() || !canExportAllPayrollDetails()) return;
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
  if (!backendMode() || !canViewPayrollHistory()) return;
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
  if (!backendMode() || !canExportAllPayrollDetails()) return;
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

async function confirmBackendWorkload(teacherId = currentTeacherId(), month = defaultTeacherPayrollMonth()) {
  if (!backendMode() || !isTeacherAccount() || !teacherId) return;
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

async function disputeBackendPayroll(teacherId = currentTeacherId(), month = defaultTeacherPayrollMonth()) {
  if (!backendMode() || !isTeacherAccount() || !teacherId) return;
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

// 预算、审批、工资和课表共用同一批正式学期主键。这里不从文字名称推断，
// 一律由 /api/terms 返回的 termId 驱动，历史学期也能稳定回看。
function allBudgetTerms() {
  const terms = termManagementState.terms.length
    ? termManagementState.terms
    : termManagementState.currentTerm
      ? [termManagementState.currentTerm]
      : [];
  return [...terms].sort((a, b) => String(b.startDate || "").localeCompare(String(a.startDate || "")));
}

function budgetTermLabel(term) {
  if (!term) return "";
  const status = term.current ? "当前" : term.status === "archived" ? "已归档" : term.datePhase === "ended" ? "已完成" : "";
  return `${term.name} · ${term.startDate} 至 ${term.endDate}${status ? ` · ${status}` : ""}`;
}

// 查看预算可回看所有历史学期；但新建预算或预算使用申请只能落在尚未结束的学期。
// 同时按日期兜底，兼容旧接口尚未回传 datePhase 的数据。
function canUseBudgetTerm(term) {
  if (!term || term.status === "archived" || term.datePhase === "ended") return false;
  return !term.endDate || String(term.endDate) >= todayKey();
}

function selectedBudgetTerm() {
  const terms = allBudgetTerms();
  const selectedId = termBudgetState.termId || termManagementState.currentTerm?.id || state.schedulingConfig.termId || "";
  return terms.find((term) => term.id === selectedId) || termManagementState.currentTerm || terms[0] || null;
}

function selectedBudgetTermId() {
  const term = selectedBudgetTerm();
  return term?.id || "";
}

function renderBudgetTermSelectors() {
  const selects = document.querySelectorAll("[data-budget-term-select]");
  if (!selects.length) return;
  const terms = allBudgetTerms();
  const selectedId = selectedBudgetTermId();
  selects.forEach((select) => {
    if (!terms.length) {
      select.innerHTML = `<option value="">正在读取正式学期…</option>`;
      select.disabled = true;
      return;
    }
    select.innerHTML = terms
      .map((term) => `<option value="${escapeHtml(term.id)}">${escapeHtml(budgetTermLabel(term))}</option>`)
      .join("");
    select.value = selectedId;
    select.disabled = Boolean(termBudgetState.loading);
  });
}

async function loadTermBudget(force = false) {
  if (!backendMode()) return;
  if (termBudgetState.loading) return;
  // 财务和主任登录时不会预先加载排课上下文；进入预算页再获取正式学期即可。
  if (!termManagementState.loaded && !termManagementState.loading) await loadTermContext();
  const termId = selectedBudgetTermId();
  if (!termId) {
    termBudgetState = { ...termBudgetState, loaded: true, loading: false, error: "暂无可用正式学期", data: null };
    return;
  }
  if (termBudgetState.loaded && termBudgetState.loadedTermId === termId && !force) return;
  termBudgetState = { ...termBudgetState, termId, loading: true, error: "" };
  renderBudgetTermSelectors();
  try {
    const data = await apiRequest(`/api/payroll/budget?termId=${encodeURIComponent(termId)}`);
    termBudgetState = { termId, loadedTermId: termId, loaded: true, loading: false, error: "", data };
  } catch (error) {
    termBudgetState = {
      ...termBudgetState,
      termId,
      loadedTermId: termId,
      loaded: true,
      loading: false,
      error: error.message || "预算读取失败",
      data: null,
    };
  }
  render();
}

// 财务账号看到的是自己那一摊，页面上"全校"的措辞要跟着范围走，
// 否则学部会计会以为看到的是全校数字。
function currentFinanceScopeId() {
  // 后端会话优先；本地演示模式下 backendSession 为 null，退回当前登录的本地账号
  return backendSession?.account?.financeScope || currentAccount()?.financeScope || "";
}

function currentFinanceScopeName() {
  return backendSession?.account?.financeScopeName || currentAccount()?.financeScopeName || "";
}

function currentFinanceCanReadAll() {
  return Boolean(backendSession?.account?.financeReadAll || currentAccount()?.financeReadAll);
}

function canViewAllPayrollDetails() {
  const account = backendSession?.account || currentAccount() || {};
  return Boolean(
    (currentRole() === "finance" && currentFinanceScopeId() === "headquarters" && currentFinanceCanReadAll()) ||
      (["system_admin", "principal", "payroll_viewer", "payroll_exporter"].includes(currentRole()) && account.payrollReadAll),
  );
}

function divisionPayrollScope() {
  const account = backendSession?.account || currentAccount() || {};
  if (currentRole() !== "division_head" || !account.payrollReadDivision) return "";
  const scopes = Array.isArray(account.scopeStageIds) ? [...new Set(account.scopeStageIds.map(String).filter(Boolean))] : [];
  return scopes.length === 1 && ["kindergarten", "primary", "middle", "high"].includes(scopes[0]) ? scopes[0] : "";
}

function canViewDivisionPayrollDetails() {
  return Boolean(divisionPayrollScope());
}

function canViewPayrollHistory() {
  return canViewAllPayrollDetails() || canViewDivisionPayrollDetails();
}

function isDivisionFinanceAccount() {
  return isFinanceRole() && Boolean(currentFinanceScopeId()) && currentFinanceScopeId() !== "headquarters";
}

// 导出会形成可离线留存的工资文件，权限必须独立于页面查看权限。
// 只有带全校读取权限的总校财务可以导出；学部财务仍可核算、查看本学部工资。
function canExportAllPayrollDetails() {
  const account = backendSession?.account || currentAccount() || {};
  return Boolean(
    (currentRole() === "finance" && currentFinanceScopeId() === "headquarters" && currentFinanceCanReadAll() && account.payrollExportAll !== false) ||
      (["principal", "payroll_exporter"].includes(currentRole()) && account.payrollReadAll && account.payrollExportAll),
  );
}

// 学部财务没有跨部门对比需求，分组汇总只保留给总校财务。
function setFinanceGroupSummaryVisibility() {
  const panel = document.querySelector("#financeGroupPanel");
  const visible = canExportAllPayrollDetails();
  if (panel) panel.hidden = !visible;
  return visible;
}

function applyPayrollExportAccess() {
  const visible = canExportAllPayrollDetails();
  ["#exportPayrollCsv", "#exportPayrollHistoryCsv"].forEach((selector) => {
    const button = document.querySelector(selector);
    if (button) button.hidden = !visible;
  });
}

function canOperateFinanceTeacher(teacherId) {
  if (currentRole() !== "finance") return false;
  const scope = currentFinanceScopeId();
  const teacher = teacherById(teacherId);
  return Boolean(scope && teacher && teacher.payrollScope === scope);
}

function applyFinanceScopeLabels() {
  const scopeName = currentFinanceScopeName();
  const readAll = currentFinanceCanReadAll();
  const prefix = readAll ? "全校" : scopeName || "全校";
  const grossLabel = document.querySelector("#financeGrossLabel");
  const grossHint = document.querySelector("#financeGrossHint");
  if (grossLabel) grossLabel.textContent = `${prefix}应发`;
  // 口径说明常驻：系统只结算到应发，避免老师拿这个数字对实际到账
  if (grossHint) {
    grossHint.textContent = readAll
      ? "全校工资只读汇总 · 仅可操作总校行政后勤工资"
      : `${scopeName || "全校"}工资总额 · 个税社保线下处理`;
  }
}

function budgetBarClass(ratio) {
  if (ratio === null || ratio === undefined) return "budget-bar";
  if (ratio > 1) return "budget-bar is-over";
  if (ratio >= 0.9) return "budget-bar is-warning";
  return "budget-bar";
}

function budgetUsageDetailMarkup(usageDetails = {}) {
  const salaryMonths = Array.isArray(usageDetails.salaryMonths) ? usageDetails.salaryMonths : [];
  const budgetUses = Array.isArray(usageDetails.budgetUses) ? usageDetails.budgetUses : [];
  if (!salaryMonths.length && !budgetUses.length) {
    return `<p class="budget-usage-empty">本学期暂未产生已锁定的工资或已审批的预算使用。</p>`;
  }
  const list = (rows, type) =>
    rows
      .map((row) => {
        const helper =
          type === "salary"
            ? `${row.lockedCount || 0} 份已锁定工资单`
            : [
                row.scopeName,
                String(row.approvedAt || "").slice(0, 10),
                row.applicantName ? `发起人：${row.applicantName}` : "",
              ]
                .filter(Boolean)
                .join(" · ");
        return `
          <div class="budget-usage-row">
            <span class="budget-usage-type ${type === "salary" ? "salary" : "expense"}">${type === "salary" ? "工资" : "预算使用"}</span>
            <div><strong>${escapeHtml(row.label || "—")}</strong><small>${escapeHtml(helper || "已审批")}</small></div>
            <b>${formatCurrency(row.amount || 0)}</b>
          </div>`;
      })
      .join("");
  return `
    ${salaryMonths.length ? `<section class="budget-usage-section"><h4>工资（按月）</h4>${list(salaryMonths, "salary")}</section>` : ""}
    ${budgetUses.length ? `<section class="budget-usage-section"><h4>其他预算使用</h4>${list(budgetUses, "expense")}</section>` : ""}
  `;
}

function budgetDetailKey(item) {
  return `${selectedBudgetTermId()}:${item.scope || "scope"}`;
}

function budgetCardMarkup(item, { expandable = false } = {}) {
  const ratioText = item.usedRatio === null || item.usedRatio === undefined
    ? "未编制预算"
    : `执行率 ${(item.usedRatio * 100).toFixed(1)}%`;
  // 进度条最多画满，超支时靠颜色提示；这里不拦截任何发放动作
  const width = item.usedRatio ? Math.min(item.usedRatio, 1) * 100 : 0;
  const detailKey = budgetDetailKey(item);
  const expanded = expandable && budgetUsageExpandedKey === detailKey;
  const cardContent = `
    <div class="budget-card-head">
      <strong>${escapeHtml(item.scopeName || "合计")}</strong>
      <em>${escapeHtml(ratioText)}</em>
    </div>
    <div class="budget-amount">${formatCurrency(item.budget)}</div>
    <div class="${budgetBarClass(item.usedRatio)}"><i style="width:${width.toFixed(1)}%"></i></div>
    <div class="budget-meta">
      <span>已使用<b>${formatCurrency(item.used)}</b></span>
      <span>其中工资<b>${formatCurrency(item.salaryUsed || 0)}</b></span>
      <span>预算申请<b>${formatCurrency(item.approvedUse || 0)}</b></span>
      <span>剩余<b>${formatCurrency(item.remaining)}</b></span>
      <span>结算中<b>${formatCurrency(item.pending)}</b></span>
      <span>已锁定<b>${item.lockedCount ?? 0} 人</b></span>
    </div>`;
  return `
    <article class="budget-card">
      ${
        expandable
          ? `<button class="budget-card-summary" type="button" data-budget-details-toggle="${escapeHtml(detailKey)}" aria-expanded="${expanded}" aria-controls="budget-usage-${escapeHtml(detailKey)}">${cardContent}<span class="budget-detail-toggle-hint">${expanded ? "收起已使用明细" : "查看已使用明细"}<i aria-hidden="true">⌄</i></span></button>
             <div class="budget-usage-details${expanded ? "" : " is-hidden"}" id="budget-usage-${escapeHtml(detailKey)}">${budgetUsageDetailMarkup(item.usageDetails)}</div>`
          : cardContent
      }
    </article>`;
}

function renderBudgetPanel(panelId, gridId, sourceId) {
  const panel = document.querySelector(`#${panelId}`);
  const grid = document.querySelector(`#${gridId}`);
  const source = document.querySelector(`#${sourceId}`);
  if (!panel || !grid) return;
  if (!backendMode() || !["finance", "system_admin", "division_head", "principal"].includes(currentRole())) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  // 先拿到正式学期清单再查预算，不能让前端演示态残留的旧 termId 抢先发请求。
  if (!termManagementState.loaded) {
    if (!termManagementState.loading) loadTermContext().then(render);
    renderBudgetTermSelectors();
    grid.innerHTML = `<p class="budget-empty">正在读取正式学期…</p>`;
    return;
  }
  const selectedTerm = selectedBudgetTerm();
  if (!selectedTerm) {
    grid.innerHTML = `<p class="budget-empty">暂无可用正式学期，暂不能查看预算。</p>`;
    if (source) {
      source.textContent = "暂无学期";
      source.className = "status-pill";
    }
    return;
  }
  const title = panel.querySelector("h2");
  if (title) {
    const noun = panelId === "leadershipBudgetPanel" ? "费用预算" : "薪酬预算";
    title.textContent = selectedTerm ? `${selectedTerm.name}${noun}` : `正式学期${noun}`;
  }
  renderBudgetTermSelectors();
  loadTermBudget();

  if (termBudgetState.loading && !termBudgetState.data) {
    grid.innerHTML = `<p class="budget-empty">正在读取本学期预算…</p>`;
    return;
  }
  if (termBudgetState.error) {
    grid.innerHTML = `<p class="budget-empty">预算读取失败：${escapeHtml(termBudgetState.error)}</p>`;
    return;
  }
  const data = termBudgetState.loadedTermId === selectedBudgetTermId() ? termBudgetState.data : null;
  const items = data?.items || [];
  if (!items.length) {
    grid.innerHTML = `<p class="budget-empty">本学期尚未编制薪酬预算。</p>`;
    return;
  }
  // 预算按学部独立控制，不做全校合计卡；总校财务与校长可逐一展开四个学部的明细。
  grid.innerHTML = items.map((item) => budgetCardMarkup(item, { expandable: true })).join("");

  if (source) {
    const hasBudget = items.some((item) => item.hasBudget);
    if (!hasBudget) {
      source.textContent = "未编制";
      source.className = "status-pill";
    } else {
      const approvedAt = String(data.approvedAt || "").slice(0, 10);
      source.textContent = approvedAt ? `审批确定 ${approvedAt}` : "审批确定";
      source.className = "status-pill done";
    }
  }
}

function renderLeadershipBudget() {
  renderBudgetPanel("leadershipBudgetPanel", "leadershipBudgetGrid", "leadershipBudgetSource");
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
    const [workload, payroll, assessmentResult] = await Promise.all([
      apiRequest(`/api/teachers/${teacherId}/workload?month=${month}`),
      generatePayroll
        ? apiRequest(`/api/teachers/${teacherId}/payroll/generate`, {
            method: "POST",
            body: { month },
          })
        : apiRequest(`/api/teachers/${teacherId}/payroll?month=${month}`),
      apiRequest(`/api/hr/assessments?teacherId=${encodeURIComponent(teacherId)}&month=${encodeURIComponent(month)}`),
    ]);
    financeTeacherDetailState = {
      teacherId,
      month,
      loading: false,
      loaded: true,
      error: "",
      workload,
      payroll,
      assessment: assessmentResult.assessments?.[0] || null,
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
    termId: selectedSchedulingTermId(),
    divisionId: state.selectedSchedulingDivisionId,
    gradeId: state.selectedSchedulingGradeId,
    expectedDraftRevision: Number(state.schedulingDraft?.revision || 0),
  };
}

function currentSchedulingTermId() {
  return selectedSchedulingTermId();
}

// 排课负责人只从学部主任已发布的正式学期中选择。寒暑假没有 termId，
// 已归档学期也不能再生成或修改课表，因此不进入排课下拉框。
function selectableSchedulingTerms() {
  const terms = termManagementState.terms || [];
  const selectable = terms.filter((term) => term.status !== "archived" && term.datePhase !== "ended");
  if (selectable.length) return selectable;
  return termManagementState.currentTerm ? [termManagementState.currentTerm] : [];
}

function selectedSchedulingTermId() {
  const terms = selectableSchedulingTerms();
  return (
    terms.find((term) => term.id === state.selectedSchedulingTermId)?.id ||
    termManagementState.currentTerm?.id ||
    terms[0]?.id ||
    state.schedulingConfig.termId ||
    ""
  );
}

function renderSchedulingTermSelector(config = state.schedulingConfig) {
  const select = document.querySelector("#adminSchedulingTermSelect");
  if (!select) return;
  const current = config?.termId || selectedSchedulingTermId();
  const terms = selectableSchedulingTerms();
  const visibleTerms = terms.some((term) => term.id === current)
    ? terms
    : [
        ...terms,
        ...(config?.termId
          ? [{
              id: config.termId,
              name: config.termName || "当前正式学期",
              startDate: config.termStartDate || "",
              endDate: config.termEndDate || "",
              status: config.termStatus || "active",
            }]
          : []),
      ];
  select.innerHTML = visibleTerms.length
    ? visibleTerms
        .map(
          (term) =>
            `<option value="${escapeHtml(term.id)}" ${term.id === current ? "selected" : ""}>${escapeHtml(budgetTermLabel(term))}</option>`,
        )
        .join("")
    : '<option value="">暂无可排课的正式学期</option>';
  select.disabled = termManagementState.loading || !visibleTerms.length;
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
  const selectableIds = new Set(selectableSchedulingTerms().map((term) => term.id));
  if (!selectableIds.has(state.selectedSchedulingTermId)) {
    state.selectedSchedulingTermId = termManagementState.currentTerm?.id || selectableSchedulingTerms()[0]?.id || "";
  }
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

const ACADEMIC_CALENDAR_STAGES = [
  { value: "kindergarten", label: "幼儿园" },
  { value: "primary", label: "小学部" },
  { value: "middle", label: "初中部" },
  { value: "high", label: "高中部" },
];

const ACADEMIC_CALENDAR_TYPE_LABELS = {
  teaching: "正式学期",
  winter_break: "寒假",
  summer_break: "暑假",
};

const ACADEMIC_CALENDAR_PERIOD_TAGS = [
  { value: "teaching:fall", label: "正式学期 · 秋季学期", type: "teaching", phase: "fall" },
  { value: "teaching:spring", label: "正式学期 · 春季学期", type: "teaching", phase: "spring" },
  { value: "winter_break", label: "假期 · 寒假", type: "winter_break", phase: "" },
  { value: "summer_break", label: "假期 · 暑假", type: "summer_break", phase: "" },
];

function canEditAcademicCalendar() {
  // 时间段由对应学部主任维护；总校人事 + 行政只读取全校校历并管理教学期启用/归档，
  // 避免总校账号替某一学部覆盖了尚未确认的寒暑假安排。
  return currentRole() === "division_head";
}

function academicCalendarStageOptions() {
  const scope = currentAccount()?.scopeStageIds || [];
  return ACADEMIC_CALENDAR_STAGES.filter((item) => currentRole() === "system_admin" || scope.includes(item.value));
}

async function loadAcademicCalendar() {
  if (!backendMode()) return;
  academicCalendarState = { ...academicCalendarState, loading: true, error: "" };
  if (state.activeView === "academicCalendar") renderAcademicCalendar();
  try {
    const result = await apiRequest("/api/academic-calendar?allYears=1");
    academicCalendarState = {
      ...academicCalendarState,
      entries: result.entries || [],
      terms: result.terms || [],
      loaded: true,
      loading: false,
      error: "",
    };
  } catch (error) {
    academicCalendarState = { ...academicCalendarState, loaded: true, loading: false, error: error.message || "校历加载失败" };
  }
  if (state.activeView === "academicCalendar") renderAcademicCalendar();
}

function calendarEntryClass(type = "") {
  if (type === "winter_break") return "winter";
  if (type === "summer_break") return "summer";
  return "teaching";
}

function calendarPeriodTag(entry = {}) {
  // 新增时没有既有时间段，调用方会传入 null；统一按空对象处理。
  const period = entry || {};
  if (period.type === "teaching") return period.phase === "spring" ? "teaching:spring" : "teaching:fall";
  return period.type === "winter_break" ? "winter_break" : "summer_break";
}

function calendarPeriodTagOption(entry = {}) {
  return ACADEMIC_CALENDAR_PERIOD_TAGS.find((item) => item.value === calendarPeriodTag(entry)) || ACADEMIC_CALENDAR_PERIOD_TAGS[0];
}

function calendarPeriodTagLabel(entry = {}) {
  return entry.type === "teaching" ? "正式学期" : "假期";
}

function calendarEntryDateStatus(entry = {}) {
  const today = formatDateKey(new Date());
  if (entry.endDate && entry.endDate < today) return { label: "已完成", className: "locked" };
  if (entry.startDate && entry.startDate > today) return { label: "待开始", className: "warning" };
  return { label: "进行中", className: "done" };
}

function canManageAcademicTermLifecycle() {
  // 校历的日期由各学部主任维护；“设为当前/归档”会影响全校 termId 写入边界，
  // 因而统一由总校人事 + 行政执行。
  return currentRole() === "system_admin";
}

function renderAcademicCalendarTermLedger(container) {
  if (!container) return;
  const terms = academicCalendarState.terms || [];
  const canManage = canManageAcademicTermLifecycle();
  container.innerHTML = terms.length
    ? terms
        .map((term) => {
          const status = termStatusText(term.status, term);
          const archived = term.status === "archived";
          const data = term.dataSummary || {};
          const historySummary = [
            `课表 ${Number(data.scheduleVersions || data.scheduleDrafts || 0)}`,
            `课次 ${Number(data.lessonInstances || 0)}`,
            `工资单 ${Number(data.payrollDetails || 0)}`,
            `审批 ${Number(data.oaRequests || 0)}`,
          ].join(" · ");
          return `
            <article class="calendar-term-ledger-row">
              <div>
                <strong>${escapeHtml(term.name || term.id)}</strong>
                <small>${escapeHtml(term.startDate || "")} 至 ${escapeHtml(term.endDate || "")}</small>
                <small>历史数据：${escapeHtml(historySummary)}</small>
              </div>
              <div class="calendar-term-ledger-meta">
                <span class="${termStatusClass(term.status, term)}">${escapeHtml(status)}</span>
                ${canManage && !term.current && !archived ? `<button class="mini-button primary" type="button" data-calendar-set-current="${escapeHtml(term.id)}">设为当前学期</button>` : ""}
                ${canManage && !term.current && !archived ? `<button class="mini-button danger" type="button" data-calendar-archive-term="${escapeHtml(term.id)}">归档本学期</button>` : ""}
              </div>
            </article>
          `;
        })
        .join("")
    : '<div class="empty-state">尚未创建正式学期。新增一个带“正式学期”标签的时间段后，排课、课时和工资会自动按对应 termId 归档。</div>';
}

function renderAcademicCalendar() {
  if (state.activeView !== "academicCalendar") return;
  const tagFilter = document.querySelector("#academicCalendarTypeFilter");
  const timeline = document.querySelector("#academicCalendarTimeline");
  const termLedger = document.querySelector("#academicCalendarTermLedger");
  const termLedgerSection = document.querySelector("#academicCalendarTermLedgerSection");
  const scopeNote = document.querySelector("#academicCalendarScopeNote");
  const footnote = document.querySelector("#academicCalendarFootnote");
  const addButton = document.querySelector("#addAcademicCalendarEntry");
  if (!tagFilter || !timeline || !termLedger || !termLedgerSection || !scopeNote || !footnote || !addButton) return;
  if (!backendMode()) {
    timeline.innerHTML = '<div class="empty-state">请登录后端模式后维护学部校历。</div>';
    return;
  }
  if (!academicCalendarState.loaded && !academicCalendarState.loading) {
    loadAcademicCalendar();
  }

  tagFilter.value = academicCalendarState.periodTagFilter || "all";
  const scopes = academicCalendarStageOptions();
  scopeNote.textContent = currentRole() === "division_head"
    ? `仅维护 ${scopes.map((item) => item.label).join("、")} 的时间段。正式学期进入排课选择；假期不进入排课。`
    : "可查看全校各学部的时间段；学部主任维护时间和标签，总校人事 + 行政负责启用、归档正式学期。";
  // 新增时间段只依赖当前登录账号的学部范围，不依赖时间段列表是否已读取完成。
  // 不能因为列表请求尚未返回而把主任的唯一新增入口锁住。
  addButton.hidden = !canEditAcademicCalendar();
  addButton.disabled = false;

  if (academicCalendarState.loading && !academicCalendarState.loaded) {
    timeline.innerHTML = '<div class="empty-state">正在读取校历…</div>';
    return;
  }
  if (academicCalendarState.error) {
    timeline.innerHTML = `<div class="empty-state">${escapeHtml(academicCalendarState.error)}</div>`;
    return;
  }
  // 对学部主任而言，下方台账与上方正式学期时间段重复，而且没有可操作项；
  // 仅总校人事 + 行政需要它来切换当前教学期、归档并核验历史数据。
  termLedgerSection.hidden = !canManageAcademicTermLifecycle();
  if (!termLedgerSection.hidden) renderAcademicCalendarTermLedger(termLedger);
  const groups = new Map();
  (academicCalendarState.entries || [])
    .filter((entry) => {
      const filter = academicCalendarState.periodTagFilter || "all";
      return filter === "all" || (filter === "teaching" ? entry.type === "teaching" : entry.type !== "teaching");
    })
    .forEach((entry) => {
    if (!groups.has(entry.stageId)) groups.set(entry.stageId, { name: entry.stageName || entry.stageId, entries: [] });
    groups.get(entry.stageId).entries.push(entry);
  });
  timeline.innerHTML = groups.size
    ? [...groups.entries()]
        .sort(([leftStageId], [rightStageId]) => ACADEMIC_CALENDAR_STAGES.findIndex((item) => item.value === leftStageId) - ACADEMIC_CALENDAR_STAGES.findIndex((item) => item.value === rightStageId))
        .map(([stageId, group]) => `
          <section class="calendar-stage-group">
            <div class="calendar-stage-heading"><h3>${escapeHtml(group.name)}</h3><span>${group.entries.length} 个时间段</span></div>
            <div class="calendar-entry-list">
              ${group.entries
                .sort((left, right) => String(right.startDate || "").localeCompare(String(left.startDate || "")))
                .map(
                  (entry) => {
                    const status = calendarEntryDateStatus(entry);
                    const settlementHint = entry.type === "teaching"
                      ? "排课可选 · 按教学期口径核算工资"
                      : "不可排课 · 中层及以上按 100% 假期工资，普通人员按 80%，不核算考核考勤";
                    return `
                    <article class="calendar-entry ${calendarEntryClass(entry.type)}">
                      <div class="calendar-entry-copy">
                        <span class="calendar-entry-type">${escapeHtml(calendarPeriodTagLabel(entry))}</span>
                        <strong>${escapeHtml(entry.label)}</strong>
                        <small>${escapeHtml(entry.startDate)} 至 ${escapeHtml(entry.endDate)} · ${escapeHtml(settlementHint)}${entry.note ? ` · ${escapeHtml(entry.note)}` : ""}</small>
                      </div>
                      <div class="calendar-entry-meta">
                        <span class="status-pill ${escapeHtml(status.className)}">${escapeHtml(status.label)} · v${Number(entry.version) || 1}</span>
                        ${canEditAcademicCalendar() && status.label !== "已完成" ? `<button class="mini-button" type="button" data-edit-academic-calendar="${escapeHtml(entry.id)}">更新</button>` : ""}
                      </div>
                    </article>
                  `;
                  },
                )
                .join("")}
            </div>
          </section>
        `,
        )
        .join("")
    : '<div class="empty-state">当前筛选下没有时间段。请新增正式学期或假期时间段。</div>';
  footnote.textContent = "不需要维护学年：系统仅从时间段名称和日期推导内部归档索引。历史课表、课时、工资单和审批单继续按既有 termId 保留；只有“正式学期”会出现在排课选择中。";
}

async function openAcademicCalendarDialog(existing = null) {
  if (!canEditAcademicCalendar()) {
    showToast("只有对应学部主任可以新增或更新时间段");
    return;
  }
  const stages = academicCalendarStageOptions();
  if (!stages.length) {
    showToast("当前账号没有可维护的学部范围");
    return;
  }
  const defaultStage = existing?.stageId || stages[0].value;
  const tagOption = calendarPeriodTagOption(existing);
  const values = await openDialog({
    title: existing ? "更新时间段" : "新增时间段",
    description: existing
      ? "更新将保留版本与修改人。涉及已锁定工资的日期范围将被系统拦截。"
      : "填写名称、标签和日期即可。标签为“正式学期”的时间段可排课；“假期”只影响对应日期的薪资结算。",
    fields: [
      {
        name: "periodName",
        label: "时间段名称",
        type: "text",
        value: existing?.name || "",
        placeholder: "例如 26-27 春季学期、26-27 暑假",
        required: true,
      },
      {
        name: "stageId",
        label: "学部",
        type: "select",
        value: defaultStage,
        options: stages,
        required: true,
      },
      ...(existing
        ? [{ name: "periodTagLabel", label: "标签", type: "text", value: tagOption.label, readonly: true, hint: "已发布时间段的标签不可变更；如需调整，请新增正确时间段。" }]
        : [{ name: "periodTag", label: "标签", type: "select", value: tagOption.value, options: ACADEMIC_CALENDAR_PERIOD_TAGS, hint: "正式学期可排课；假期仅按假期薪资口径结算。" }]),
      { name: "startDate", label: "开始日期", type: "date", value: existing?.startDate || "", required: true },
      { name: "endDate", label: "结束日期", type: "date", value: existing?.endDate || "", required: true },
      { name: "note", label: "调整说明", type: "textarea", value: existing?.note || "", placeholder: "例如：根据学校通知确定寒假安排", rows: 2 },
    ],
    confirmText: existing ? "发布更新" : "发布校历",
    validate: (form) => (form.endDate < form.startDate ? "结束日期不能早于开始日期" : ""),
    onConfirm: async (form) => {
      const periodTag = existing ? calendarPeriodTagOption(existing) : ACADEMIC_CALENDAR_PERIOD_TAGS.find((item) => item.value === form.periodTag);
      const result = await apiRequest("/api/academic-calendar", {
        method: "POST",
        body: {
          id: existing?.id || "",
          periodName: form.periodName,
          stageId: form.stageId,
          type: periodTag?.type || "teaching",
          phase: periodTag?.phase || "",
          startDate: form.startDate,
          endDate: form.endDate,
          note: form.note,
        },
      });
      academicCalendarState = {
        ...academicCalendarState,
        entries: result.entries || [],
        terms: result.terms || [],
        loaded: true,
        loading: false,
        error: "",
      };
      await loadTermContext();
      showToast(existing ? "校历已更新并发布" : "校历已发布");
      render();
    },
  });
  return values;
}

async function setAcademicCalendarCurrentTerm(termId) {
  if (!backendMode() || !canManageAcademicTermLifecycle()) return;
  const term = (academicCalendarState.terms || []).find((item) => item.id === termId);
  if (!term) return;
  if (!(await confirmDialog("切换当前学期", {
    description: `将“${term.name}”设为全校当前教学期。此后新排课、课时确认和薪资结算都会归入该学期；上一当前学期将保留，等待完成结算后归档。`,
    confirmText: "设为当前",
  }))) return;
  try {
    const result = await apiRequest(`/api/terms/${encodeURIComponent(termId)}/current`, { method: "POST" });
    applyTermContext(result);
    academicCalendarState = { ...academicCalendarState, loaded: false, loading: false };
    await loadAcademicCalendar();
    showToast("已切换当前学期");
  } catch (error) {
    showToast(error.message || "切换当前学期失败");
  }
}

async function archiveAcademicCalendarTerm(termId) {
  if (!backendMode() || !canManageAcademicTermLifecycle()) return;
  const term = (academicCalendarState.terms || []).find((item) => item.id === termId);
  if (!term) return;
  if (!(await confirmDialog("归档本学期", {
    description: `归档“${term.name}”后，该学期停止新增或修改排课、调课、工作量和工资；既有课表、课时、工资单和审批记录会完整保留，仍可按学年/学期查阅。`,
    confirmText: "归档",
    danger: true,
  }))) return;
  try {
    const result = await apiRequest(`/api/terms/${encodeURIComponent(termId)}/archive`, { method: "POST" });
    applyTermContext(result);
    academicCalendarState = { ...academicCalendarState, loaded: false, loading: false };
    await loadAcademicCalendar();
    showToast("本学期已归档，历史数据继续保留");
  } catch (error) {
    showToast(error.message || "归档学期失败");
  }
}

function selectedAttendanceMonth() {
  const month = attendanceUploadState.month || currentSettlementMonth();
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : currentSettlementMonth();
}

function attendanceStageOptionsHtml(options = [], selectedStageId = "") {
  return options
    .map(
      (stage) =>
        `<option value="${escapeHtml(stage.id)}" ${stage.id === selectedStageId ? "selected" : ""}>${escapeHtml(stage.name)}</option>`,
    )
    .join("");
}

function attendanceTemplateForStage(stageId) {
  const templates = {
    kindergarten: { filename: "幼儿园教师月度考勤上传模板.xlsx", label: "幼儿园" },
    primary: { filename: "小学部教师月度考勤上传模板.xlsx", label: "小学部" },
    middle: { filename: "初中部教师月度考勤上传模板.xlsx", label: "初中部" },
    high: { filename: "高中部教师月度考勤上传模板.xlsx", label: "高中部" },
  };
  return templates[stageId] || { filename: "教师月度考勤上传模板.xlsx", label: "当前学部" };
}

async function loadAttendanceUploads({ month = selectedAttendanceMonth(), stageId = attendanceUploadState.stageId } = {}) {
  if (!backendMode()) return;
  attendanceUploadState = { ...attendanceUploadState, month, stageId, loading: true, error: "" };
  if (state.activeView === "attendanceManagement") renderAttendanceManagement();
  try {
    const params = new URLSearchParams({ month });
    if (stageId) params.set("stageId", stageId);
    const result = await apiRequest(`/api/attendance/uploads?${params.toString()}`);
    const stageOptions = result.stageOptions || [];
    const resolvedStageId = stageOptions.some((stage) => stage.id === stageId)
      ? stageId
      : stageOptions[0]?.id || "";
    attendanceUploadState = {
      month: result.month || month,
      stageId: resolvedStageId,
      stageOptions,
      uploads: result.uploads || [],
      canUpload: Boolean(result.canUpload),
      loaded: true,
      loading: false,
      error: "",
    };
  } catch (error) {
    attendanceUploadState = {
      ...attendanceUploadState,
      month,
      stageId,
      loaded: true,
      loading: false,
      error: error.message || "考勤记录加载失败",
    };
  }
  if (state.activeView === "attendanceManagement") renderAttendanceManagement();
}

function renderAttendanceManagement() {
  if (state.activeView !== "attendanceManagement") return;
  const monthInput = document.querySelector("#attendanceMonthInput");
  const stageSelect = document.querySelector("#attendanceStageSelect");
  const fileInput = document.querySelector("#attendanceUploadFile");
  const uploadButton = document.querySelector("#attendanceUploadButton");
  const templateDownload = document.querySelector("#attendanceTemplateDownload");
  const list = document.querySelector("#attendanceUploadList");
  const note = document.querySelector("#attendanceManagementNote");
  if (!monthInput || !stageSelect || !fileInput || !uploadButton || !list || !note) return;

  if (!backendMode()) {
    list.innerHTML = '<div class="empty-state">请登录系统后使用月度考勤管理。</div>';
    return;
  }

  if (!attendanceUploadState.loaded && !attendanceUploadState.loading) {
    loadAttendanceUploads();
  }

  const month = selectedAttendanceMonth();
  monthInput.value = month;
  const stageOptions = attendanceUploadState.stageOptions || [];
  const selectedStageId = stageOptions.some((stage) => stage.id === attendanceUploadState.stageId)
    ? attendanceUploadState.stageId
    : stageOptions[0]?.id || "";
  if (selectedStageId && selectedStageId !== attendanceUploadState.stageId && !attendanceUploadState.loading) {
    attendanceUploadState = { ...attendanceUploadState, stageId: selectedStageId };
  }
  stageSelect.innerHTML = stageOptions.length
    ? attendanceStageOptionsHtml(stageOptions, selectedStageId)
    : '<option value="">暂无可用学部</option>';
  stageSelect.disabled = attendanceUploadState.loading || !stageOptions.length;
  const template = attendanceTemplateForStage(selectedStageId);
  if (templateDownload) {
    templateDownload.href = `assets/${encodeURIComponent(template.filename)}`;
    templateDownload.download = template.filename;
    templateDownload.textContent = `下载${template.label} Excel 模板`;
  }
  monthInput.disabled = attendanceUploadState.loading;
  const allowUpload = attendanceUploadState.canUpload && Boolean(selectedStageId);
  fileInput.disabled = !allowUpload || attendanceUploadState.loading;
  uploadButton.hidden = !attendanceUploadState.canUpload;
  uploadButton.disabled = !allowUpload || attendanceUploadState.loading;
  uploadButton.textContent = attendanceUploadState.loading ? "正在处理…" : "上传并校验";

  if (attendanceUploadState.loading && !attendanceUploadState.loaded) {
    note.textContent = "正在读取考勤上传记录…";
    list.innerHTML = '<div class="empty-state">正在读取…</div>';
    return;
  }
  if (attendanceUploadState.error) {
    note.textContent = "未能读取考勤记录，请稍后重试。";
    list.innerHTML = `<div class="empty-state">${escapeHtml(attendanceUploadState.error)}</div>`;
    return;
  }
  const appliesPrimaryPolicy = selectedStageId === "primary";
  const appliesMiddlePolicy = selectedStageId === "middle";
  const appliesHighPolicy = selectedStageId === "high";
  note.textContent = attendanceUploadState.canUpload
    ? appliesPrimaryPolicy
      ? "小学部已启用考勤扣款：上午 7:45 后、下午 14:15 后打卡各扣 30 元；应出勤且明确“未补卡”的缺卡每次扣 50 元；四次均无打卡、四项均填“未补卡”时按旷工 200 元／天处理。系统不判断应打卡日期，不自动处理早退、周五下午离校、周日值班或假打卡。上传或重传会使本月尚未锁定的工资单重新核算；已锁定工资不会被改动。"
      : appliesMiddlePolicy
      ? "初中部已启用迟到／早退、旷工考勤规则：上传或重传会使本月尚未锁定的工资单重新核算；已锁定工资不会被改动。请只填写应出勤日，并在“应出勤”列明确填写“是”或“否”。"
      : appliesHighPolicy
      ? "高中部请使用专用考勤结果表：直接填写准时／迟到及分钟数、签退情况、旷课节数和旷工天数。10 分钟内迟到或未签退累计第 3 次起，每次扣考核工资 2%；超时迟到或早退每次扣 3%；旷课、旷工按制度计算。上传或重传会使本月尚未锁定的工资单重新核算；已锁定工资不会被改动。"
      : "同一学部同一月份再次上传会覆盖当前考勤版本，旧版本会保留为历史记录。除小学部、初中部、高中部外，当前仅校验和留存，不会自动扣薪。"
    : appliesPrimaryPolicy
      ? "小学部考勤会在工资预览／重新生成时，按导入记录中的迟到、明确未补卡与旷工自动扣款；上传与覆盖由对应学部主任完成。"
      : appliesMiddlePolicy
      ? "初中部考勤会在工资预览／重新生成时自动计算迟到、早退与旷工扣款；上传与覆盖由对应学部主任完成。"
      : appliesHighPolicy
      ? "高中部考勤会在工资预览／重新生成时按专用考勤结果表计算考核工资扣款与旷工扣款；上传与覆盖由对应学部主任完成。"
      : "您可查看各学部已上传的考勤版本；上传与覆盖由对应学部主任完成。";
  const uploads = attendanceUploadState.uploads || [];
  list.innerHTML = uploads.length
    ? uploads
        .map((upload) => {
          const active = upload.status === "active";
          const settlement = upload.settlementSummary || {};
          const policyLine = settlement.applies
            ? settlement.requiresPayrollContext
              ? `<small>${escapeHtml(settlement.componentName || "考勤违纪扣款")}：${escapeHtml(settlement.attendanceLabel || "轻微迟到／未签退")} ${Number(settlement.lateEarlyCount || 0)} 次${Number(settlement.seriousOccurrenceCount || 0) ? ` · 超时迟到／早退 ${Number(settlement.seriousOccurrenceCount || 0)} 次` : ""}${Number(settlement.missedClassCount || 0) ? ` · 旷课 ${Number(settlement.missedClassCount || 0)} 节` : ""}${Number(settlement.absenceDays || 0) ? ` · 旷工 ${Number(settlement.absenceDays || 0)} 天` : ""} · 工资生成时按考核工资和当月工资总额计算</small>`
              : `<small>${escapeHtml(settlement.componentName || "考勤扣款")}：${escapeHtml(settlement.attendanceLabel || "迟到／早退")} ${Number(settlement.lateEarlyCount || 0)} 次${Number(settlement.missingPunchCount || 0) ? ` · 未补卡 ${Number(settlement.missingPunchCount || 0)} 次` : ""}${Number(settlement.absenceDays || 0) ? ` · 旷工 ${Number(settlement.absenceDays || 0)} 天` : ""} · 暂计扣款 ¥${Number(settlement.totalDeduction || 0).toLocaleString()}</small>`
            : "";
          return `
            <article class="attendance-upload-entry ${active ? "" : "is-replaced"}">
              <div class="attendance-upload-copy">
                <strong>${escapeHtml(upload.stageName)} · ${escapeHtml(upload.month)} 考勤表</strong>
                <small>${escapeHtml(upload.filename || "教师月度考勤表.xlsx")} · ${Number(upload.rowCount || 0).toLocaleString()} 条日记录 · ${Number(upload.teacherCount || 0).toLocaleString()} 位教师${Number(upload.noPunchDays || 0) ? ` · ${Number(upload.noPunchDays).toLocaleString()} 天无打卡记录` : ""}</small>
                ${policyLine}
                <small>上传人：${escapeHtml(upload.uploadedByName || "未记录")} · ${escapeHtml(formatDateTimeShort(upload.uploadedAt))}</small>
              </div>
              <div class="attendance-upload-meta">
                <span class="status-pill ${active ? "done" : "locked"}">${active ? "当前版本" : "已被覆盖"}</span>
              </div>
            </article>
          `;
        })
        .join("")
    : '<div class="empty-state">该月份、该学部尚未上传考勤表。</div>';
}

async function uploadAttendanceWorkbook() {
  if (!backendMode() || !attendanceUploadState.canUpload) return;
  const fileInput = document.querySelector("#attendanceUploadFile");
  const file = fileInput?.files?.[0];
  const month = selectedAttendanceMonth();
  const stageId = attendanceUploadState.stageId;
  if (!stageId) {
    showToast("请先选择学部");
    return;
  }
  if (!file) {
    showToast("请选择已填写的 .xlsx 考勤表");
    return;
  }
  const payload = new FormData();
  payload.append("month", month);
  payload.append("stageId", stageId);
  payload.append("attendanceFile", file, file.name);
  attendanceUploadState = { ...attendanceUploadState, loading: true, error: "" };
  renderAttendanceManagement();
  try {
    const result = await apiRequest("/api/attendance/uploads", { method: "POST", body: payload });
    if (fileInput) fileInput.value = "";
    await loadAttendanceUploads({ month, stageId });
    const payrollNotice = result.invalidatedPayrollCount
      ? `；${result.invalidatedPayrollCount} 份未锁定工资单将按新考勤重算`
      : "";
    showToast(`${result.replacedUploadCount ? "考勤表已更新，上一版本已保留为历史记录" : "考勤表已上传并完成校验"}${payrollNotice}`);
  } catch (error) {
    attendanceUploadState = { ...attendanceUploadState, loading: false, error: error.message || "考勤表上传失败" };
    renderAttendanceManagement();
    const details = error.details;
    showToast(Array.isArray(details) && details.length ? `${error.message}：${details[0]}` : attendanceUploadState.error);
  }
}

// ---------------------------------------------------------------------------
// 跟车路线：由安全部主管统一发布，生活老师端只展示本人已发布的路线班次。
// 一趟路线由早晨接、放学送两段组成；服务端只在两段均完成后统计接送补助。
// ---------------------------------------------------------------------------
function transportTierLabel(tierId, tiers = transportRouteState.distanceTiers) {
  return (tiers || []).find((tier) => tier.id === tierId)?.name || {
    short: "短途", medium: "中途", long: "长途", extraLong: "超长途",
  }[tierId] || tierId || "未设置";
}

function transportRouteStatusTag(status = "draft") {
  return `<span class="status-pill ${status === "published" ? "done" : "warning"}">${status === "published" ? "已发布" : "草稿"}</span>`;
}

async function loadTransportRoutes({ termId = transportRouteState.termId } = {}) {
  if (!backendMode() || !["security_manager", "life_teacher"].some((role) => hasAccountRole(role))) return;
  transportRouteState = { ...transportRouteState, termId, loading: true, error: "" };
  if (state.activeView === "transportRoutes") renderTransportRoutes();
  try {
    const suffix = termId ? `?termId=${encodeURIComponent(termId)}` : "";
    const [result, transferResult] = await Promise.all([
      apiRequest(`/api/transport-routes${suffix}`),
      apiRequest("/api/transport-transfers"),
    ]);
    const termOptions = result.termOptions || [];
    const resolvedTermId = termOptions.some((term) => term.id === termId)
      ? termId
      : termOptions.find((term) => term.current)?.id || termOptions[0]?.id || "";
    transportRouteState = {
      ...transportRouteState,
      termId: resolvedTermId,
      canManage: Boolean(result.canManage),
      termOptions,
      lifeTeachers: result.lifeTeachers || [],
      distanceTiers: result.distanceTiers || [],
      routes: result.routes || [],
      transfers: transferResult.requests || [],
      loaded: true,
      loading: false,
      error: "",
    };
  } catch (error) {
    transportRouteState = {
      ...transportRouteState,
      loaded: true,
      loading: false,
      error: error.message || "跟车路线加载失败",
    };
  }
  if (state.activeView === "transportRoutes") renderTransportRoutes();
}

function renderTransportRoutes() {
  if (state.activeView !== "transportRoutes") return;
  const list = document.querySelector("#transportRouteList");
  const transferList = document.querySelector("#transportTransferList");
  const termSelect = document.querySelector("#transportRouteTermSelect");
  const hint = document.querySelector("#transportRouteHint");
  const addButton = document.querySelector("#addTransportRoute");
  if (!list || !transferList || !termSelect || !hint || !addButton) return;
  if (!backendMode()) {
    list.innerHTML = '<div class="empty-state">请登录系统后维护跟车路线。</div>';
    transferList.innerHTML = "";
    return;
  }
  if (!transportRouteState.loaded && !transportRouteState.loading) {
    loadTransportRoutes();
  }
  addButton.hidden = !transportRouteState.canManage;
  addButton.disabled = transportRouteState.loading;
  termSelect.innerHTML = (transportRouteState.termOptions || []).length
    ? transportRouteState.termOptions.map((term) => `<option value="${escapeHtml(term.id)}" ${term.id === transportRouteState.termId ? "selected" : ""}>${escapeHtml(term.name)} · ${escapeHtml(term.startDate)} 至 ${escapeHtml(term.endDate)}${term.current ? " · 当前" : ""}</option>`).join("")
    : '<option value="">暂无可用正式学期</option>';
  termSelect.disabled = transportRouteState.loading || !(transportRouteState.termOptions || []).length;
  hint.textContent = transportRouteState.canManage
    ? "创建后先保存为草稿；确认生活老师、时间与运行日无冲突后，再发布路线表。重新发布只替换今天及以后的未执行班次。"
    : "只显示本人已被发布的路线；路线、补助档位和老师安排均由安全部主管维护。";

  if (transportRouteState.loading && !transportRouteState.loaded) {
    list.innerHTML = '<div class="empty-state">正在读取路线…</div>';
    transferList.innerHTML = "";
    return;
  }
  if (transportRouteState.error) {
    list.innerHTML = `<div class="empty-state">${escapeHtml(transportRouteState.error)}</div>`;
    transferList.innerHTML = "";
    return;
  }
  const routes = transportRouteState.routes || [];
  list.innerHTML = routes.length
    ? routes.map((route) => `
      <article class="transport-route-card">
        <div class="transport-route-title">
          <div>
            <strong>${escapeHtml(route.name)}</strong>
            <p>${escapeHtml(route.termName)} · ${escapeHtml(route.weekdayLabel || "未设置运行日")}</p>
          </div>
          ${transportRouteStatusTag(route.status)}
        </div>
        <div class="transport-route-meta">
          <span><b>${escapeHtml(route.distanceLabel || transportTierLabel(route.distanceTier))}</b> · 每趟按对应档位计补助</span>
          <span>早晨接：${escapeHtml(route.morningTime)} · 放学送：${escapeHtml(route.afternoonTime)}</span>
          <span>生活老师：${escapeHtml(route.lifeTeacher?.name || "未安排")}${route.lifeTeacher?.stageName ? ` · ${escapeHtml(route.lifeTeacher.stageName)}` : ""}</span>
          <span>生效：${escapeHtml(route.startDate)} 至 ${escapeHtml(route.endDate)}</span>
          ${route.stops ? `<span>路线说明：${escapeHtml(route.stops)}</span>` : ""}
        </div>
        <div class="transport-route-footer">
          <small>班次 ${Number(route.runs?.total || 0)} 趟 · 已完成 ${Number(route.runs?.completed || 0)} 趟 · 待执行 ${Number(route.runs?.scheduled || 0)} 趟${Number(route.runs?.inProgress || 0) ? ` · 执行中 ${Number(route.runs.inProgress)} 趟` : ""}</small>
          ${transportRouteState.canManage ? `<div class="inline-actions"><button class="ghost-button compact-button" data-edit-transport-route="${escapeHtml(route.id)}" type="button">修改</button><button class="primary-button compact-button" data-publish-transport-route="${escapeHtml(route.id)}" type="button">${route.status === "published" ? "重新发布" : "发布路线表"}</button></div>` : ""}
        </div>
      </article>
    `).join("")
    : '<div class="empty-state">该学期尚未建立跟车路线。请先新建路线并发布，生活老师端才会出现排班。</div>';

  const transfers = transportRouteState.transfers || [];
  transferList.innerHTML = transfers.length
    ? transfers.map((request) => `
      <article class="transport-transfer-entry">
        <div>
          <strong>${escapeHtml(request.routeName)} · ${escapeHtml(request.date)}</strong>
          <p>${escapeHtml(request.fromTeacherName)} → ${escapeHtml(request.toTeacherName)} · ${escapeHtml(request.statusLabel || request.status)}</p>
          <small>申请时间：${escapeHtml(formatDateTimeShort(request.createdAt))}${request.reviewedByName ? ` · 处理人：${escapeHtml(request.reviewedByName)}` : ""}</small>
        </div>
        ${request.canReview ? `<div class="inline-actions"><button class="ghost-button compact-button" data-review-transport-transfer="${escapeHtml(request.id)}" data-approved="false" type="button">不批准</button><button class="primary-button compact-button" data-review-transport-transfer="${escapeHtml(request.id)}" data-approved="true" type="button">批准调班</button></div>` : ""}
      </article>
    `).join("")
    : '<div class="empty-state">暂无调班申请。</div>';
}

async function openTransportRouteDialog(route = null) {
  if (!transportRouteState.canManage) return;
  if (!transportRouteState.loaded) await loadTransportRoutes();
  const terms = transportRouteState.termOptions || [];
  const selectedTermId = route?.termId || transportRouteState.termId || terms.find((term) => term.current)?.id || terms[0]?.id || "";
  const selectedTerm = terms.find((term) => term.id === selectedTermId) || {};
  const lifeTeachers = transportRouteState.lifeTeachers || [];
  if (!terms.length || !lifeTeachers.length) {
    showToast(!terms.length ? "请先维护至少一个未归档正式学期" : "当前没有可安排的在岗生活老师");
    return;
  }
  await openDialog({
    title: route ? "修改跟车路线" : "新建跟车路线",
    description: "同一位生活老师在同一时段不可重复排班。路线发布后才会发送到生活老师端。",
    confirmText: "保存路线",
    fields: [
      { name: "name", label: "路线名称", value: route?.name || "", placeholder: "例如：小学部南线 1 号", required: true },
      { name: "termId", label: "适用学期", type: "select", value: selectedTermId, required: true, options: terms.map((term) => ({ value: term.id, label: `${term.name} · ${term.startDate} 至 ${term.endDate}` })) },
      { name: "distanceTier", label: "路线档位", type: "select", value: route?.distanceTier || "short", required: true, options: (transportRouteState.distanceTiers || []).map((tier) => ({ value: tier.id, label: `${tier.name} · ¥${Number(tier.rate || 0)}/趟` })) },
      { name: "lifeTeacherId", label: "跟车生活老师", type: "select", value: route?.lifeTeacher?.id || "", required: true, options: lifeTeachers.map((teacher) => ({ value: teacher.id, label: `${teacher.name} · ${teacher.stageName} · ${teacher.title}` })) },
      { name: "morningTime", label: "早晨接时间", value: route?.morningTime || "06:50-08:20", placeholder: "HH:MM-HH:MM", required: true, hint: "例如 06:50-08:20" },
      { name: "afternoonTime", label: "放学送时间", value: route?.afternoonTime || "16:30-18:00", placeholder: "HH:MM-HH:MM", required: true, hint: "例如 16:30-18:00" },
      { name: "weekdays", label: "运行日", type: "multiselect", value: route?.weekdays || ["1", "2", "3", "4", "5"], required: true, options: [["1", "周一"], ["2", "周二"], ["3", "周三"], ["4", "周四"], ["5", "周五"], ["6", "周六"], ["7", "周日"]].map(([value, label]) => ({ value, label })) },
      { name: "startDate", label: "开始日期", type: "date", value: route?.startDate || selectedTerm.startDate || "", required: true },
      { name: "endDate", label: "结束日期", type: "date", value: route?.endDate || selectedTerm.endDate || "", required: true },
      { name: "stops", label: "路线／接送点说明", type: "textarea", value: route?.stops || "", placeholder: "例如：学校北门—XX小区—YY小区", rows: 2 },
      { name: "note", label: "备注", type: "textarea", value: route?.note || "", placeholder: "可填写特殊安排", rows: 2 },
    ],
    onConfirm: async (values) => {
      await apiRequest("/api/transport-routes", { method: "POST", body: { ...values, ...(route ? { id: route.id } : {}) } });
      transportRouteState = { ...transportRouteState, termId: values.termId, loaded: false };
      await loadTransportRoutes({ termId: values.termId });
      showToast(route ? "路线已保存；如需同步新安排，请重新发布" : "路线草稿已保存，请核对后发布");
    },
  });
}

async function publishTransportRoute(routeId) {
  const route = (transportRouteState.routes || []).find((item) => item.id === routeId);
  if (!route || !transportRouteState.canManage) return;
  const confirmed = await confirmDialog(route.status === "published" ? "重新发布路线表" : "发布路线表", {
    description: `发布“${route.name}”后，将通知${route.lifeTeacher?.name || "对应生活老师"}，并生成今天及以后所有运行日的早、晚跟车班次。未执行的旧班次将按本次路线表替换。`,
    confirmText: "确认发布",
  });
  if (!confirmed) return;
  try {
    const result = await apiRequest(`/api/transport-routes/${encodeURIComponent(routeId)}/publish`, { method: "POST" });
    await loadTransportRoutes({ termId: transportRouteState.termId });
    showToast(`路线已发布，已生成 ${Number(result.generatedRunCount || 0)} 趟跟车班次`);
  } catch (error) {
    showToast(error.message || "发布路线失败");
  }
}

async function operateLifeRouteLeg(lesson, action) {
  if (!lesson?.routeRunId) return;
  try {
    await apiRequest(`/api/transport-runs/${encodeURIComponent(lesson.routeRunId)}/leg`, {
      method: "POST",
      body: { leg: lesson.routeLeg, action },
    });
    await loadBackendTeacherContext(currentTeacherId(), state.selectedScheduleWeekStart || "auto");
    renderSchedule();
    showToast(action === "check_in" ? "已完成签到" : "已确认该班次执行完成");
  } catch (error) {
    showToast(error.message || "班次操作失败");
  }
}

async function openLifeRouteTransferDialog(lesson) {
  if (!lesson?.routeRunId || !backendMode()) return;
  try {
    const result = await apiRequest("/api/transport-routes");
    const candidates = (result.lifeTeachers || []).filter((teacher) => teacher.id !== currentTeacherId());
    if (!candidates.length) {
      showToast("暂无可选择的其他在岗生活老师");
      return;
    }
    await openDialog({
      title: "申请跟车调班",
      description: `${lesson.date}「${lesson.routeName || lesson.className}」将提交给安全部主管核验冲突并处理。`,
      confirmText: "提交申请",
      fields: [{ name: "toTeacherId", label: "调给哪位生活老师", type: "select", required: true, options: candidates.map((teacher) => ({ value: teacher.id, label: `${teacher.name} · ${teacher.stageName} · ${teacher.title}` })) }],
      onConfirm: async (values) => {
        await apiRequest("/api/transport-transfers", { method: "POST", body: { runId: lesson.routeRunId, toTeacherId: values.toTeacherId } });
        showToast("调班申请已提交，等待安全部主管处理");
      },
    });
  } catch (error) {
    showToast(error.message || "无法发起调班申请");
  }
}

async function reviewTransportTransfer(requestId, approved) {
  try {
    await apiRequest(`/api/transport-transfers/${encodeURIComponent(requestId)}/review`, { method: "POST", body: { approved } });
    await loadTransportRoutes({ termId: transportRouteState.termId });
    showToast(approved ? "已批准调班，生活老师排班已同步" : "已处理为不批准");
  } catch (error) {
    showToast(error.message || "处理调班申请失败");
  }
}

function applyBackendScheduleResult(result) {
  if (result.config) {
    state.schedulingConfig = result.config;
    state.selectedSchedulingTermId = result.config.termId || state.selectedSchedulingTermId;
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
  if (!backendMode() || !canViewSchedulingOverview()) return;
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
    note: "排课已确认发布，课时按已发布课表计薪",
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
      weeklyLessons: Number(document.querySelector(`[data-course-rule-weekly="${subjectId}"]`)?.value || "0"),
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

function defaultNonRegularPeriodContent(type = "selfStudy") {
  if (type === "activity") return "活动";
  if (type === "evening") return "晚自习";
  return "自习";
}

function nonRegularTeacherOptions(config, selectedTeacherId = "", selectedRole = "") {
  const teachers = config.nonRegularTeachers || config.teachers || [];
  return [
    `<option value="">不指定（不影响课表发布）</option>`,
    `<option value="role:homeroom" ${selectedRole === "homeroom" ? "selected" : ""}>各班班主任（按班级自动匹配）</option>`,
    `<option value="role:life_teacher" ${selectedRole === "life_teacher" ? "selected" : ""}>本学部生活老师（自动同步全部在职人员）</option>`,
    ...teachers.map(
      (teacher) =>
        `<option value="${escapeHtml(teacher.id)}" ${teacher.id === selectedTeacherId ? "selected" : ""}>${escapeHtml(teacher.name)} · ${escapeHtml(teacher.department || config.divisionName || "")} · ${escapeHtml(teacher.title || teacher.subject || "老师")}</option>`,
    ),
  ].join("");
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

function isHighSchedulingConfig(config = state.schedulingConfig) {
  return config?.stageId === "high" || config?.divisionId === "high";
}

function activeScheduleTemplateKey(config = state.schedulingConfig) {
  return config?.activeScheduleTemplateKey || (isHighSchedulingConfig(config) ? "c" : "default");
}

function activeScheduleTemplatePeriods(config = state.schedulingConfig) {
  const key = activeScheduleTemplateKey(config);
  return config?.periodTemplates?.[key] || config?.periods || schedulingCatalog.periods;
}

function applyActiveScheduleTemplatePeriods(config, key) {
  const nextKey = isHighSchedulingConfig(config) ? key || "c" : "default";
  const nextPeriods = (config?.periodTemplates?.[nextKey] || config?.periods || schedulingCatalog.periods).map((period) => ({ ...period }));
  return {
    ...config,
    activeScheduleTemplateKey: nextKey,
    periods: nextPeriods,
  };
}

function setActiveScheduleTemplate(key) {
  state.schedulingConfig = applyActiveScheduleTemplatePeriods(state.schedulingConfig, key);
  renderAdminScheduling();
}

function saveActiveScheduleTemplatePeriods(periods) {
  const config = state.schedulingConfig;
  const key = activeScheduleTemplateKey(config);
  config.periodTemplates = {
    ...(config.periodTemplates || {}),
    [key]: periods.map((period) => ({ ...period })),
  };
  config.periods = config.periodTemplates[key].map((period) => ({ ...period }));
}

function schedulePeriodsFromConfig(config = state.schedulingConfig) {
  return (activeScheduleTemplatePeriods(config)?.length ? activeScheduleTemplatePeriods(config) : schedulingCatalog.periods).map((period, index) => {
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
      content: period.type === "regular" ? "" : period.content || "",
      responsibleTeacherId: period.type === "regular" ? "" : period.responsibleTeacherId || "",
      responsibleRole: period.type === "regular" ? "" : period.responsibleRole || "",
      responsibleTeacherName: period.responsibleTeacherName || "",
      dayIndexes: normalizeScheduleDayIndexes(period.dayIndexes),
    };
  });
}

function schedulePeriodDayOptions(period, index) {
  const selectedDays = normalizeScheduleDayIndexes(period.dayIndexes);
  return SCHEDULE_DAY_OPTIONS.map(
    (label, dayIndex) => `
      <label class="period-day-chip ${dayIndex === 6 ? "sunday" : ""}">
        <input
          type="checkbox"
          data-schedule-period-day
          data-day-index="${dayIndex}"
          ${selectedDays.includes(dayIndex) ? "checked" : ""}
          aria-label="第 ${index + 1} 个时段在${label}生效"
        />
        <span>${label}</span>
      </label>
    `,
  ).join("");
}

function schedulePeriodTemplateHtml(config = state.schedulingConfig) {
  return schedulePeriodsFromConfig(config)
    .map((period, index) => {
      const isNonRegular = period.type !== "regular";
      return `
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
        <fieldset class="period-template-days">
          <legend>生效星期</legend>
          <div class="period-day-options">${schedulePeriodDayOptions(period, index)}</div>
          <small>周日可显示并同步老师端，但只能作为固定日程，不参与自动排课或计薪。</small>
        </fieldset>
        <div class="period-template-nonregular-fields" data-schedule-nonregular-fields ${isNonRegular ? "" : "hidden"}>
          <label class="field-label" for="periodContent-${index}">
            <span>固定内容</span>
            <input id="periodContent-${index}" data-schedule-period-content maxlength="80" value="${escapeHtml(period.content)}" placeholder="例如 ${escapeHtml(defaultNonRegularPeriodContent(period.type))}" />
          </label>
          <label class="field-label" for="periodResponsible-${index}">
            <span>负责岗位 / 老师（周日时段必选）</span>
            <select id="periodResponsible-${index}" data-schedule-period-responsible class="lesson-select">
              ${nonRegularTeacherOptions(config, period.responsibleTeacherId, period.responsibleRole)}
            </select>
          </label>
          <span class="period-template-nonregular-note">固定显示在最终课表中，不参与自动排课、冲突检测、课时或工资计算。</span>
        </div>
      </div>
    `;
    })
    .join("");
}

function readSchedulePeriodsFromForm(options = {}) {
  const validate = options.validate !== false;
  const rows = Array.from(document.querySelectorAll("[data-schedule-period-row]"));
  const periods = rows.map((row, index) => {
    const startTime = row.querySelector("[data-schedule-period-start]")?.value || "";
    const endTime = row.querySelector("[data-schedule-period-end]")?.value || "";
    const type = row.querySelector("[data-schedule-period-type]")?.value || "regular";
    const content = row.querySelector("[data-schedule-period-content]")?.value?.trim() || "";
    const responsibleSelection = row.querySelector("[data-schedule-period-responsible]")?.value || "";
    const responsibleRole = responsibleSelection.startsWith("role:") ? responsibleSelection.slice(5) : "";
    const responsibleTeacherId = responsibleRole ? "" : responsibleSelection;
    const dayIndexes = Array.from(row.querySelectorAll("[data-schedule-period-day]:checked"))
      .map((input) => Number.parseInt(input.dataset.dayIndex, 10))
      .filter((dayIndex) => Number.isInteger(dayIndex));
    return {
      period: index + 1,
      label: `第 ${index + 1} 节`,
      startTime,
      endTime,
      time: `${startTime}-${endTime}`,
      type,
      typeName: schedulePeriodTypeText(type),
      active: true,
      content: type === "regular" ? "" : content,
      responsibleTeacherId: type === "regular" ? "" : responsibleTeacherId,
      responsibleRole: type === "regular" ? "" : responsibleRole,
      dayIndexes,
    };
  });

  if (!validate) return periods.length ? periods : schedulePeriodsFromConfig();
  if (!periods.length) throw new Error("请至少保留 1 个可排课节次");
  if (!periods.some((period) => period.type === "regular")) {
    throw new Error("请至少保留 1 个正课节次用于自动排课");
  }
  periods.forEach((period, index) => {
    const startMinutes = timeTextToMinutes(period.startTime);
    const endMinutes = timeTextToMinutes(period.endTime);
    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      throw new Error(`第 ${index + 1} 节时间无效，请确认开始和结束时间`);
    }
    if (!period.dayIndexes.length) throw new Error(`第 ${index + 1} 个时段请至少选择一个生效星期`);
    if (period.type === "regular" && period.dayIndexes.some((dayIndex) => dayIndex > 4)) {
      throw new Error(`第 ${index + 1} 个时段包含周末；周六、周日只能设置为固定非正课日程`);
    }
    if (period.type !== "regular" && period.dayIndexes.includes(6) && !period.responsibleTeacherId && !period.responsibleRole) {
      throw new Error(`第 ${index + 1} 个周日日程必须选择负责岗位或老师，发布后系统才能同步到老师终端`);
    }
    const overlappingIndex = periods.slice(0, index).findIndex((previous) => {
      const previousStart = timeTextToMinutes(previous.startTime);
      const previousEnd = timeTextToMinutes(previous.endTime);
      const sharedDays = period.dayIndexes.some((dayIndex) => previous.dayIndexes.includes(dayIndex));
      return sharedDays && previousStart !== null && previousEnd !== null && startMinutes < previousEnd && endMinutes > previousStart;
    });
    if (overlappingIndex >= 0) {
      throw new Error(`第 ${index + 1} 个时段与第 ${overlappingIndex + 1} 个时段在同一生效日重叠`);
    }
  });
  return periods;
}

function addSchedulePeriodRow() {
  const periods = readSchedulePeriodsFromForm({ validate: false });
  if (periods.length >= 48) {
    showToast("每套作息最多配置 48 个日程时段");
    return;
  }
  const last = periods[periods.length - 1] || { endTime: "08:40" };
  const lastEnd = timeTextToMinutes(last.endTime) ?? 8 * 60 + 40;
  const startTime = minutesToTimeText(Math.min(lastEnd + 10, 23 * 60 + 10));
  const endTime = minutesToTimeText(Math.min((timeTextToMinutes(startTime) ?? lastEnd + 10) + 40, 23 * 60 + 59));
  saveActiveScheduleTemplatePeriods([
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
      dayIndexes: [...DEFAULT_SCHEDULE_DAY_INDEXES],
    },
  ]);
  renderAdminScheduling();
}

function deleteSchedulePeriodRow(index) {
  const periods = readSchedulePeriodsFromForm({ validate: false }).filter((_, rowIndex) => rowIndex !== Number(index));
  if (!periods.length) {
    showToast("请至少保留 1 个可排课节次");
    return;
  }
  saveActiveScheduleTemplatePeriods(periods.map((period, rowIndex) => ({
    ...period,
    period: rowIndex + 1,
    label: `第 ${rowIndex + 1} 节`,
  })));
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
          highClassCategory: isHighSchedulingConfig() ? activeScheduleTemplateKey() : "",
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

  saveActiveScheduleTemplatePeriods(periods);
  resetCourseDraftAfterConfigChange();
  showToast("作息时间已保存到试运行数据");
  render();
}

function classStructureFromConfig(config = state.schedulingConfig) {
  const classRows = config.classes || [];
  if (isHighSchedulingConfig(config)) {
    const highClassCounts = { a: 0, b: 0, c: 0 };
    classRows.forEach((schoolClass) => {
      const category = ["a", "b", "c"].includes(schoolClass.highClassCategory) ? schoolClass.highClassCategory : schoolClass.classType === "experimental" ? "b" : "c";
      highClassCounts[category] += 1;
    });
    return {
      highClassCounts: {
        a: Number(config.classStructure?.highClassCounts?.a ?? highClassCounts.a),
        b: Number(config.classStructure?.highClassCounts?.b ?? highClassCounts.b),
        c: Number(config.classStructure?.highClassCounts?.c ?? highClassCounts.c),
      },
      totalCount: Number(config.classStructure?.totalCount ?? classRows.length),
      regularCount: highClassCounts.c,
      experimentalCount: highClassCounts.b,
    };
  }
  const inferredRegularCount = classRows.filter((schoolClass) => schoolClass.classType !== "experimental").length;
  const inferredExperimentalCount = classRows.filter((schoolClass) => schoolClass.classType === "experimental").length;
  return {
    regularCount: Number(config.classStructure?.regularCount ?? inferredRegularCount),
    experimentalCount: Number(config.classStructure?.experimentalCount ?? inferredExperimentalCount),
    totalCount: Number(config.classStructure?.totalCount ?? classRows.length),
  };
}

function classStructurePreviewHtml(config, regularCount, experimentalCount) {
  if (isHighSchedulingConfig(config)) {
    const counts = typeof regularCount === "object" ? regularCount : classStructureFromConfig(config).highClassCounts;
    const tags = [];
    [
      ["a", "A", "清北班"],
      ["b", "B", "实验班"],
      ["c", "C", "普通班"],
    ].forEach(([key, code, label]) => {
      for (let index = 1; index <= Number(counts[key] || 0); index += 1) {
        tags.push(`<span class="class-structure-tag ${key === "a" ? "advanced" : key === "b" ? "experimental" : ""}">${escapeHtml(`${config.gradeName}${code}${index}班 · ${label}`)}</span>`);
      }
    });
    return tags.length ? tags.join("") : `<span>至少保留 1 个高中班级</span>`;
  }
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
  const highCounters = { a: 0, b: 0, c: 0 };
  return (config.classes || [])
    .slice()
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
    .map((schoolClass) => {
      const highClassCategory = isHighSchedulingConfig(config)
        ? (["a", "b", "c"].includes(schoolClass.highClassCategory) ? schoolClass.highClassCategory : schoolClass.classType === "experimental" ? "b" : "c")
        : "";
      const classType = highClassCategory ? (highClassCategory === "b" ? "experimental" : "regular") : schoolClass.classType === "experimental" ? "experimental" : "regular";
      counters[classType] += 1;
      if (highClassCategory) highCounters[highClassCategory] += 1;
      return {
        classType,
        highClassCategory,
        index: highClassCategory ? highCounters[highClassCategory] : counters[classType],
        className: schoolClass.name || "",
        roomName: schoolClass.room || "",
      };
    });
}

function defaultClassRoomName(config, classType, index, highClassCategory = "") {
  if (isHighSchedulingConfig(config) && highClassCategory) {
    return `${config.divisionName}${config.gradeName}${String(highClassCategory).toUpperCase()}${index}班`;
  }
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
  if (isHighSchedulingConfig(config)) {
    const counts = regularCount && typeof regularCount === "object" ? regularCount : classStructureFromConfig(config).highClassCounts;
    const byKey = new Map(sourceCatalog.map((room) => [`${room.highClassCategory || ""}:${room.index}`, room]));
    return [
      ["a", "A", "清北班", "regular"],
      ["b", "B", "实验班", "experimental"],
      ["c", "C", "普通班", "regular"],
    ].flatMap(([highClassCategory, code, label, classType]) =>
      Array.from({ length: Number(counts[highClassCategory] || 0) }, (_, offset) => {
        const index = offset + 1;
        const existing = byKey.get(`${highClassCategory}:${index}`) || {};
        return {
          classType,
          highClassCategory,
          index,
          className: `${config.gradeName}${code}${index}班 · ${label}`,
          roomName: existing.roomName || defaultClassRoomName(config, classType, index, highClassCategory),
        };
      }),
    );
  }
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
            data-high-class-category="${escapeHtml(room.highClassCategory || "")}"
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
  if (isHighSchedulingConfig(config)) {
    const highClassCounts = {
      a: Math.max(Number.parseInt(document.querySelector("#highAClassCountInput")?.value || "0", 10) || 0, 0),
      b: Math.max(Number.parseInt(document.querySelector("#highBClassCountInput")?.value || "0", 10) || 0, 0),
      c: Math.max(Number.parseInt(document.querySelector("#highCClassCountInput")?.value || "0", 10) || 0, 0),
    };
    const preview = document.querySelector("#classStructurePreview");
    if (preview) preview.innerHTML = classStructurePreviewHtml(config, highClassCounts);
    const catalog = document.querySelector("#classRoomCatalog");
    if (catalog) {
      catalog.innerHTML = classRoomCatalogHtml(config, highClassCounts, 0, collectClassRoomCatalogFromForm());
    }
    return;
  }
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

function applyLocalClassStructure(regularCount, experimentalCount, classRoomCatalog = collectClassRoomCatalogFromForm(), highClassCounts = null) {
  const config = state.schedulingConfig;
  const currentRoomCounts = roomResourceSummary(config).counts;
  const classes = [];
  const rooms = [];
  const roomCatalogByKey = new Map(classRoomCatalog.map((room) => [`${room.highClassCategory || room.classType}:${room.index}`, room]));
  const pushClass = (classType, index, displayOrder, highClassCategory = "") => {
    const code = highClassCategory ? String(highClassCategory).toUpperCase() : "";
    const suffix = highClassCategory ? `${code}${String(index).padStart(2, "0")}` : classType === "experimental" ? `E${String(index).padStart(2, "0")}` : String(index).padStart(2, "0");
    const classId = `${config.gradeId}-${suffix}`;
    const roomId = `${config.gradeId}-room-${suffix}`;
    const name = highClassCategory
      ? `${config.gradeName}${code}${index}班`
      : classType === "experimental" ? `${config.gradeName}实验${index}班` : `${config.gradeName} ${index} 班`;
    const room =
      roomCatalogByKey.get(`${highClassCategory || classType}:${index}`)?.roomName ||
      defaultClassRoomName(config, classType, index, highClassCategory);
    classes.push({
      id: classId,
      name,
      classType,
      highClassCategory,
      scheduleTemplateKey: highClassCategory || "default",
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
  if (isHighSchedulingConfig(config) && highClassCounts) {
    let displayOrder = 0;
    [["a", "regular"], ["b", "experimental"], ["c", "regular"]].forEach(([highClassCategory, classType]) => {
      for (let index = 1; index <= Number(highClassCounts[highClassCategory] || 0); index += 1) {
        displayOrder += 1;
        pushClass(classType, index, displayOrder, highClassCategory);
      }
    });
  } else {
    for (let index = 1; index <= regularCount; index += 1) pushClass("regular", index, index);
    for (let index = 1; index <= experimentalCount; index += 1) {
      pushClass("experimental", index, regularCount + index);
    }
  }
  rooms.push(...buildLocalSpecialRooms(config, currentRoomCounts));
  config.classes = classes;
  config.rooms = rooms;
  config.classCount = classes.length;
  config.classStructure = {
    regularCount: highClassCounts ? Number(highClassCounts.c || 0) : regularCount,
    experimentalCount: highClassCounts ? Number(highClassCounts.b || 0) : experimentalCount,
    highClassCounts: highClassCounts || undefined,
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
  if (isHighSchedulingConfig()) {
    const highClassCounts = {
      a: Number.parseInt(document.querySelector("#highAClassCountInput")?.value || "0", 10),
      b: Number.parseInt(document.querySelector("#highBClassCountInput")?.value || "0", 10),
      c: Number.parseInt(document.querySelector("#highCClassCountInput")?.value || "0", 10),
    };
    if (Object.values(highClassCounts).some((count) => !Number.isFinite(count) || count < 0 || count > 20)) {
      showToast("清北班、实验班和普通班数量均需在 0-20 之间");
      return;
    }
    if (highClassCounts.a + highClassCounts.b + highClassCounts.c < 1) {
      showToast("当前年级至少保留 1 个高中班级");
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
            highClassCounts,
            classRoomCatalog: collectClassRoomCatalogFromForm(),
          },
        });
        applyBackendScheduleResult(result);
        schedulingBackendState = { ...schedulingBackendState, loaded: true, loading: false, error: "" };
        showToast("高中 A/B/C 班级已保存，请重新配置老师并生成排课");
      } catch (error) {
        schedulingBackendState = { loaded: true, loading: false, error: error.message || "高中班级保存失败" };
        showToast(schedulingBackendState.error);
      }
      render();
      return;
    }
    applyLocalClassStructure(0, 0, collectClassRoomCatalogFromForm(), highClassCounts);
    showToast("高中 A/B/C 班级已保存到试运行数据");
    render();
    return;
  }
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
    highClassCategory: input.dataset.highClassCategory || "",
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

  if (!period || !isRegularSchedulePeriod(period) || !room) {
    showToast("请选择有效的正课节次和教室");
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
    showToast("调课申请已提交，等待审批");
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
    showToast("调课已审批通过，并同步到老师端");
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
    showToast("已发布课表请前往审批中心发起调课申请");
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
    return { ok: false, message: "已发布课表请前往审批中心发起调课申请" };
  }
  if (assignment.locked) {
    return { ok: false, message: "该课节已锁定，先解锁再拖拽调整" };
  }

  const periodNumber = Number.parseInt(periodValue, 10);
  const period = state.schedulingConfig.periods.find((item) => Number(item.period) === periodNumber);
  const dayIndex = weekDateKeys(state.schedulingConfig.weekStart).slice(0, 5).indexOf(date);
  const room = roomById(assignment.roomId);
  if (!period || !isRegularSchedulePeriod(period) || dayIndex < 0) {
    return { ok: false, message: "目标日期或正课节次无效" };
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
      regularSchedulePeriods().map((period) => ({
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
    return `<div class="empty-state compact-empty">已发布课表请前往审批中心发起调课申请</div>`;
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
    .filter((lesson) => lesson.status !== "cancelled" && lesson.date > todayKey())
    .reduce((map, lesson) => {
      map.set(lesson.teacherId, (map.get(lesson.teacherId) || 0) + 1);
      return map;
    }, new Map());

  pendingByTeacher.forEach((count, pendingTeacherId) => {
    warnings.push({
      level: "中",
      teacherId: pendingTeacherId,
      title: `${teacherName(pendingTeacherId)} 有 ${count} 节课尚未上课`,
      text: "这些课尚未到上课时间，但已按课表计入月度工作量。",
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
  renderStep("我的课表", renderSchedule);
  renderStep("排课管理", renderAdminScheduling);
  renderStep("课表总览", renderAdminScheduleOverview);
  renderStep("学部校历", renderAcademicCalendar);
  renderStep("考勤管理", renderAttendanceManagement);
  renderStep("跟车路线", renderTransportRoutes);
  renderStep("费用预算", renderLeadershipBudget);
  renderStep("人员列表", renderPersonnelList);
  renderStep("教师导入", renderTeacherImport);
  renderStep("人员档案", renderHrEmployees);
  renderStep("人员标签", renderPersonnelTagConfig);
  renderStep("组织与岗位", renderHrOrg);
  renderStep("人事审批", renderHrFlows);
  renderStep("审批中心", renderApprovalsView);
  renderStep("审批流程设置", renderApprovalSettingsView);
  renderStep("人事审计", renderHrAudit);
  renderStep("我的档案", renderMyHrProfile);
  renderStep("工资确认", renderConfirmation);
  renderStep("老师总薪资", renderTeacherPayroll);
  renderStep("财务首页", renderFinanceDashboard);
  renderStep("老师记录", renderFinanceRecords);
  renderStep("薪资结算", renderSettlement);
  renderStep("工资记录", renderPayrollHistory);
  renderStep("薪资配置", renderPayrollConfig);
  renderStep("统计报表", renderReportsView);
  renderStep("基础数据", renderDataPortingView);
  renderStep("账套管理", renderLedgersView);
  renderStep("系统监控", renderMonitoringView);
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
  const isTeaching = isTeacherAccount(account);
  const isLifeTeacher = isLifeTeacherAccount(account);
  const teacher = isTeaching ? teacherById(account.teacherId) : null;
  const baseAccountTitle = account.title || roleTitle(role);
  const accountTitle = role === "division_head" ? `${baseAccountTitle} · 任课教师`
    : isLifeTeacher
      ? "生活老师"
      : baseAccountTitle;

  document.body.dataset.activeView = state.activeView;
  document.body.dataset.accountRole = role;
  document.body.dataset.teacherWorkType = isLifeTeacher ? "life" : isTeaching ? "teaching" : "";
  setTeacherSurfaceCopy(isLifeTeacher);
  renderEnvironmentLabels();
  document.querySelector("#viewTitle").textContent =
    state.activeView === "dashboard" && isLifeTeacher
      ? "生活老师工作台"
      : state.activeView === "schedule" && isLifeTeacher
        ? "我的排班"
        : views[state.activeView].title;
  document.querySelector("#accountRoleSide").textContent = accountTitle;
  document.querySelector("#teacherNameSide").textContent = account.name;
  document.querySelector("#teacherMetaSide").textContent =
    isTeaching && role === "teacher"
      ? isLifeTeacher
        ? `${teacher.department} · 学生接送服务`
        : `${teacher.department} · ${teacher.subject}`
      : role === "finance"
        ? `${account.department} · 薪资结算`
        : role === "system_admin"
          ? `${account.department} · 账号管理`
          : role === "hr"
            ? `${account.department} · 档案管理`
            : role === "division_head"
              ? `${account.department} · ${isTeaching ? `${teacher?.subject || "任课"} · 主任兼任课` : "人事审批"}`
              : role === "security_manager"
                ? `${account.department} · 跟车路线与生活老师排班`
              : `${account.department} · 排课管理`;
  document.querySelector("#accountSummaryTitle").textContent = accountTitle;
  document.querySelector("#accountSummaryMeta").textContent =
    isTeaching
      ? isLifeTeacher
        ? `${account.name} · ${teacher.department} · 生活老师`
        : `${account.name} · ${teacher.department} · ${teacher.subject}`
        : `${account.name} · ${account.department}`;

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.remove("is-active");
  });
  views[state.activeView].el.classList.add("is-active");

  document.querySelectorAll(".nav-item").forEach((button) => {
    const allowed = viewAllowed(button.dataset.view);
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
          : role === "security_manager"
            ? "安全部通知栏"
          : "财务通知栏";
  const unread = notices.filter((notice) => !notice.read).length;
  count.textContent = unread ? `${unread} 条未读 · 共 ${notices.length} 条` : `${notices.length} 条`;
  list.innerHTML = notices.length
    ? notices
        .map(
          (notice) => `
            <article class="notice-item ${notice.level === "warning" ? "warning" : ""} ${notice.read ? "" : "unread"}">
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
  const unread = notices.filter((notice) => !notice.read).length;
  count.textContent = unread ? `${unread} 条未读 · 共 ${notices.length} 条` : `${notices.length} 条`;
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
            <article class="mail-notice ${notice.id === selectedId ? "selected" : ""} ${notice.read ? "" : "unread"}">
              <div class="mail-notice-meta">
                <span class="tag ${notice.level === "warning" ? "pending" : "locked"}">${notice.level === "warning" ? "重要" : "通知"}</span>
                <span>${notice.source}</span>
                <time>${notice.time}</time>
              </div>
              <div class="mail-notice-body">
                <strong>${notice.title}</strong>
                <p>${notice.text}</p>
              </div>
              ${notice.read ? "" : `<button class="mini-button" data-notice-open="${escapeHtml(notice.id)}" type="button">标为已读</button>`}
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">暂无通知</div>`;
}

function renderDashboard() {
  if (state.activeView !== "dashboard") return;
  if (isLifeTeacherAccount()) {
    renderLifeTeacherDashboard();
    return;
  }
  const todayPanel = document.querySelector("#todayTasksPanel");
  if (todayPanel) todayPanel.hidden = true;
  const dashboardTitle = document.querySelector("#dashboardTitle");
  if (dashboardTitle) dashboardTitle.textContent = "下一项日程";
  const teacherId = isTeacherAccount() ? currentTeacherId() : state.teachers[0].id;
  const month = isTeacherAccount() ? defaultTeacherPayrollMonth() : currentSettlementMonth();
  if (backendMode() && isTeacherAccount()) {
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
  const pendingLessons = lessons.filter((lesson) => lesson.status !== "cancelled" && lesson.date > todayKey());
  const warnings = buildWarnings(teacherId);
  const nextLesson = pendingLessons[0];

  document.querySelector("#plannedLessons").textContent = plannedUnits;
  document.querySelector("#completedLessons").textContent = completedUnits;
  document.querySelector("#pendingLessons").textContent = pendingLessons.length;
  document.querySelector("#warningCount").textContent = warnings.length;
  document.querySelector("#netPreview").textContent = backendMode()
    ? backendPayroll?.generated
      ? formatCurrency(backendPayroll.grossPay || 0)
      : "—"
    : formatCurrency(salary.gross);
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
    : backendMode()
      ? "财务尚未生成"
      : confirmationText(teacherId);
  document.querySelector("#confirmProgressBar").style.width = backendMode() && !backendPayrollStatus
    ? "0%"
    : `${25 + confirmationStage * 25}%`;

  const nextStatus = document.querySelector("#nextLessonStatus");
  const detail = document.querySelector("#nextLessonDetail");

  if (!lessons.length) {
    nextStatus.textContent = "未发布";
    nextStatus.className = "status-pill warning";
    detail.innerHTML = `
      <strong>暂无课程任务</strong>
      <p class="muted">教务或行政发布课表后，这里才会显示你的课程。</p>
    `;
  } else if (!nextLesson) {
    nextStatus.textContent = "今日完成";
    nextStatus.className = "status-pill done";
    detail.innerHTML = `
      <strong>暂无待处理课时</strong>
      <p class="muted">本月课时已同步到薪资试算，月末可进入确认流程。</p>
    `;
  } else {
    nextStatus.textContent = statusLabel[nextLesson.status];
    nextStatus.className = "status-pill";
    detail.innerHTML = `
      <strong>${nextLesson.className} · ${nextLesson.course}</strong>
      <div class="detail-grid">
        <div class="detail-cell"><span>时间</span>${formatDate(nextLesson.date)} ${nextLesson.time}</div>
        <div class="detail-cell"><span>地点</span>${nextLesson.room || "按日程执行"}</div>
        <div class="detail-cell"><span>日程类型</span>${lessonTypeLabel[nextLesson.type]}</div>
        <div class="detail-cell"><span>计薪</span>${nextLesson.nonPayable ? "固定日程，不计入课时工资" : "排给你的课自动计入课时费"}</div>
      </div>
    `;
  }

  const todayLessons = lessons.filter((lesson) => lesson.date === todayKey());
  document.querySelector("#todayTasksTable").innerHTML = todayLessons.length
    ? todayLessons.map(taskRow).join("")
    : `<tr><td colspan="7"><div class="empty-state">今天没有课时任务</div></td></tr>`;
}

function lifeDutyStatusTag(duty) {
  if (duty.date < todayKey()) return `<span class="tag locked">已排班</span>`;
  if (duty.date === todayKey()) return `<span class="tag pending">今日待执行</span>`;
  return `<span class="tag scheduled">待执行</span>`;
}

function lifeDutyTaskRow(duty) {
  const fixedDuty = duty.nonRegular && !duty.isLifeDuty;
  return `
    <tr>
      <td data-label="时间">${escapeHtml(duty.time)}</td>
      <td class="row-title" data-label="服务对象">${escapeHtml(duty.className)}</td>
      <td data-label="接送任务">${escapeHtml(duty.course)}</td>
      <td data-label="服务地点">${escapeHtml(duty.room || "按日程执行")}</td>
      <td data-label="排班类型">${fixedDuty ? "固定日程" : "学生接送"}</td>
      <td data-label="状态">${lifeDutyStatusTag(duty)}</td>
      <td class="muted" data-label="说明">非课时工作，不计入课时工资</td>
    </tr>
  `;
}

function renderLifeTeacherDashboard() {
  const teacherId = currentTeacherId();
  const teacher = teacherById(teacherId);
  const month = defaultTeacherPayrollMonth();
  if (backendMode()) ensureBackendTeacherPayroll(teacherId, month);
  const backendPayroll =
    backendMode() &&
    teacherPayrollState.teacherId === teacherId &&
    teacherPayrollState.month === month &&
    teacherPayrollState.loaded
      ? teacherPayrollState.data
      : null;
  const duties = teacherLessons(teacherId)
    .filter((item) => item.isLifeDuty || item.type === "lifeDuty" || item.nonRegular)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const arrivalCount = duties.filter((item) => item.dutyType === "arrival").length;
  const departureCount = duties.filter((item) => item.dutyType === "departure").length;
  const studentCount = Math.max(0, Number(teacher?.salaryProfile?.roles?.lifeTeacherStudentCount || 0));
  const nextDuty = duties.find((item) => item.date >= todayKey());

  document.querySelector("#plannedLessons").textContent = duties.length;
  document.querySelector("#completedLessons").textContent = arrivalCount;
  document.querySelector("#pendingLessons").textContent = departureCount;
  document.querySelector("#warningCount").textContent = studentCount;
  document.querySelector("#netPreview").textContent = backendMode()
    ? backendPayroll?.generated
      ? formatCurrency(backendPayroll.grossPay || 0)
      : "—"
    : "—";
  const payrollStatus = backendPayroll?.generated?.status || "";
  const dashboardPayrollStatus = document.querySelector("#dashboardPayrollStatus");
  if (dashboardPayrollStatus) {
    dashboardPayrollStatus.textContent = payrollStatus ? payrollStatusLabel(payrollStatus) : "财务尚未生成";
  }
  document.querySelector("#confirmStatusText").textContent = payrollStatus ? payrollStatusLabel(payrollStatus) : "财务尚未生成";
  document.querySelector("#confirmProgressBar").style.width = payrollStatus ? `${25 + payrollFlowStage(payrollStatus) * 25}%` : "0%";

  const title = document.querySelector("#dashboardTitle");
  const status = document.querySelector("#nextLessonStatus");
  const detail = document.querySelector("#nextLessonDetail");
  if (title) title.textContent = "下一项排班任务";
  if (!nextDuty) {
    status.textContent = "本周已结束";
    status.className = "status-pill done";
    detail.innerHTML = `
      <strong>本周暂无待执行接送班次</strong>
      <p class="muted">安全部主管发布路线表后，早晨接与放学送班次会自动同步到这里。</p>
    `;
  } else {
    status.textContent = nextDuty.date === todayKey() ? "今日待执行" : "待执行";
    status.className = "status-pill";
    detail.innerHTML = `
      <strong>${escapeHtml(nextDuty.course)}</strong>
      <div class="detail-grid">
        <div class="detail-cell"><span>时间</span>${formatDate(nextDuty.date)} ${escapeHtml(nextDuty.time)}</div>
        <div class="detail-cell"><span>服务对象</span>${escapeHtml(nextDuty.className)}</div>
        <div class="detail-cell"><span>服务地点</span>${escapeHtml(nextDuty.room)}</div>
        <div class="detail-cell"><span>工作口径</span>非课时工作，不计入课时工资</div>
      </div>
    `;
  }

  const todayPanel = document.querySelector("#todayTasksPanel");
  if (todayPanel) todayPanel.hidden = false;
  const todayDuties = duties.filter((item) => item.date === todayKey());
  document.querySelector("#todayTasksTable").innerHTML = todayDuties.length
    ? todayDuties.map(lifeDutyTaskRow).join("")
    : `<tr><td colspan="7"><div class="empty-state">今天没有学生接送安排</div></td></tr>`;
}

function renderTasks() {
  const lessons = teacherLessons(currentTeacherId()).filter((lesson) => {
    if (state.taskFilter === "all") return true;
    // pending 不是一个课次状态，是「日期在今天之后」——排了就计薪，
    // 未到时间只是还没上，不是另一种状态
    if (state.taskFilter === "pending") return lesson.status !== "cancelled" && lesson.date > todayKey();
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
  const action = lesson.status === "cancelled" ? statusTag(lesson.status) : "";

  return `
    <article class="weekly-calendar-event ${lesson.status}" style="top: ${top}%; height: ${height}%">
      <div class="weekly-calendar-event-time">${range.start}-${range.end}</div>
      <strong>${lesson.course}</strong>
      <span>${lesson.className}</span>
      <small>${lesson.room} · ${lessonTypeLabel[lesson.type]}</small>
      ${action ? `<div class="weekly-calendar-event-action">${action}</div>` : ""}
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
      const action = lesson.status === "cancelled" ? statusTag(lesson.status) : "";
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
          ${action ? `<div class="schedule-timeline-action">${action}</div>` : ""}
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
  if (isLifeTeacherAccount()) {
    renderLifeTeacherSchedule({ summary, grid, select, termTitle, termRange, range, syncStatus });
    return;
  }
  const lifeRouteRunList = document.querySelector("#lifeRouteRunList");
  if (lifeRouteRunList) {
    lifeRouteRunList.hidden = true;
    lifeRouteRunList.innerHTML = "";
  }

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
  const payableCount = weekLessons
    .filter((lesson) => lesson.status !== "cancelled" && !lesson.nonPayable)
    .reduce((sum, lesson) => sum + Number(lesson.units || 0), 0);
  const cancelledCount = weekLessons.filter((lesson) => lesson.status === "cancelled").length;

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
    ["本周日程", `${weekLessons.length} 项`, "课程与固定安排"],
    ["计薪课时", `${payableCount} 节`, "排给你的课都计薪"],
    ["已取消", `${cancelledCount} 节`, "请假未安排代课"],
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

function renderLifeTeacherSchedule({ summary, grid, select, termTitle, termRange, range, syncStatus }) {
  const teacherId = currentTeacherId();
  const teacher = teacherById(teacherId);
  const duties = teacherLessons(teacherId)
    .filter((item) => item.isLifeDuty || item.type === "lifeDuty" || item.nonRegular)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const weekOptions = availableScheduleWeeks(duties, teacherId);
  const weeks = weekOptions.map((week) => week.weekStart);
  if (!weeks.includes(state.selectedScheduleWeekStart)) {
    state.selectedScheduleWeekStart = weeks[0] || startOfNaturalWeek(todayKey());
  }
  const selectedWeek = state.selectedScheduleWeekStart;
  const weekDates = weekDateKeys(selectedWeek);
  if (!weekDates.includes(state.selectedScheduleDate)) {
    state.selectedScheduleDate = weekDates.includes(todayKey()) ? todayKey() : weekDates[0];
  }
  const weekDuties = duties.filter((item) => weekDates.includes(item.date));
  const routeRunList = document.querySelector("#lifeRouteRunList");
  const arrivalCount = weekDuties.filter((item) => item.dutyType === "arrival").length;
  const departureCount = weekDuties.filter((item) => item.dutyType === "departure").length;
  const fixedCount = weekDuties.filter((item) => item.nonRegular && !item.isLifeDuty).length;
  const studentCount = Math.max(0, Number(teacher?.salaryProfile?.roles?.lifeTeacherStudentCount || 0));

  if (syncStatus) {
    syncStatus.textContent = weekDuties.length ? "排班已生成" : "等待排班";
    syncStatus.className = weekDuties.length ? "status-pill done" : "status-pill warning";
  }
  select.innerHTML = weeks
    .map((week) => {
      const count =
        weekOptions.find((option) => option.weekStart === week)?.lessonCount ??
        duties.filter((item) => weekDateKeys(week).includes(item.date)).length;
      return `
        <option value="${week}" ${week === selectedWeek ? "selected" : ""}>
          ${formatWeekRange(week)} · ${count} 个班次
        </option>
      `;
    })
    .join("");
  const term = termManagementState.currentTerm || {};
  termTitle.textContent = term.name || "当前正式学期";
  termRange.textContent = term.startDate && term.endDate ? `${term.startDate} 至 ${term.endDate}` : "未设置正式学期日期";
  range.textContent = `${formatWeekRange(selectedWeek)} · 学生接送排班`;
  summary.innerHTML = [
    ["本周接送班次", `${weekDuties.length} 个`, "工作日早晨、放学各一班"],
    ["早晨接送", `${arrivalCount} 个`, "学生到校接送"],
    ["放学接送", `${departureCount} 个`, "学生离校接送"],
    ["固定日程", `${fixedCount} 项`, "含周日非课时安排"],
    ["负责学生", `${studentCount} 名`, "人事档案维护"],
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
  weekDuties.forEach((duty) => {
    grouped.get(duty.date).push(duty);
  });
  const selectedIndex = weekDates.indexOf(state.selectedScheduleDate);
  grid.innerHTML = scheduleWeeklyCalendarHtml(weekDates, grouped, state.selectedScheduleDate, weekDuties);
  focusWeeklyCalendarDate(grid, selectedIndex);

  if (!routeRunList) return;
  routeRunList.hidden = false;
  const routeRuns = [...weekDuties.reduce((rows, duty) => {
    if (!duty.routeRunId) return rows;
    const run = rows.get(duty.routeRunId) || {
      id: duty.routeRunId,
      routeName: duty.routeName || duty.className,
      date: duty.date,
      distanceTier: duty.distanceTier,
      status: duty.transportRunStatus || "scheduled",
      morning: null,
      afternoon: null,
    };
    run[duty.routeLeg] = duty;
    rows.set(duty.routeRunId, run);
    return rows;
  }, new Map()).values()].sort((left, right) => `${left.date}:${left.routeName}`.localeCompare(`${right.date}:${right.routeName}`, "zh-CN"));
  const legHtml = (duty, label) => {
    if (!duty) return "";
    const status = duty.routeLegStatus || "scheduled";
    const statusLabel = { scheduled: "待签到", checked_in: "已签到", completed: "已完成", cancelled: "已取消" }[status] || status;
    const canCheckIn = duty.date === todayKey() && status === "scheduled";
    const canComplete = duty.date === todayKey() && status === "checked_in";
    return `
      <div class="life-route-leg">
        <div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(duty.time)} · ${escapeHtml(statusLabel)}</span></div>
        ${canCheckIn ? `<button class="ghost-button compact-button" data-life-route-leg="${escapeHtml(duty.backendId)}" data-life-route-action="check_in" type="button">签到</button>` : ""}
        ${canComplete ? `<button class="primary-button compact-button" data-life-route-leg="${escapeHtml(duty.backendId)}" data-life-route-action="complete" type="button">确认完成</button>` : ""}
      </div>
    `;
  };
  routeRunList.innerHTML = routeRuns.length
    ? `
      <div class="life-route-run-heading"><strong>本周跟车班次</strong><span>每趟路线需完成早晨接与放学送，才计入接送补助。</span></div>
      <div class="life-route-run-grid">
        ${routeRuns.map((run) => {
          const canTransfer = run.date >= todayKey() && run.status === "scheduled";
          const statusLabel = { scheduled: "待执行", in_progress: "执行中", completed: "已完成", cancelled: "已取消" }[run.status] || run.status;
          return `
            <article class="life-route-run-card">
              <div class="life-route-run-title"><div><strong>${escapeHtml(run.routeName)}</strong><span>${escapeHtml(run.date)} · ${escapeHtml(transportTierLabel(run.distanceTier))}</span></div><span class="status-pill ${run.status === "completed" ? "done" : run.status === "in_progress" ? "warning" : "locked"}">${escapeHtml(statusLabel)}</span></div>
              ${legHtml(run.morning, "早晨接")}
              ${legHtml(run.afternoon, "放学送")}
              ${canTransfer ? `<div class="life-route-run-actions"><button class="ghost-button compact-button" data-life-route-transfer="${escapeHtml(run.morning?.backendId || run.afternoon?.backendId || "")}" type="button">申请调班</button></div>` : ""}
            </article>
          `;
        }).join("")}
      </div>
    `
    : '<div class="empty-state">本周暂无已发布的跟车班次。请等待安全部主管发布路线表。</div>';
}

function termStatusText(status = "planned", term = null) {
  if (status === "archived") return "已归档";
  // 日期结束即自动显示“已完成”；是否归档仍由总校人事 + 行政确认，避免自动冻结业务。
  if (term?.datePhase === "ended") return status === "active" ? "已完成待归档" : "已完成";
  if (status === "active") return term?.datePhase === "upcoming" ? "未开始" : "进行中";
  return "计划中";
}

function termStatusClass(status = "planned", term = null) {
  if (status === "archived") return "status-pill locked";
  if (term?.datePhase === "ended") return "status-pill warning";
  if (status === "active") return "status-pill done";
  return "status-pill warning";
}

function groupTermsByAcademicYear(terms = []) {
  const groups = new Map();
  terms.forEach((term) => {
    const year = term.schoolYear || String(term.startDate || "").slice(0, 4) || "未归类学年";
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(term);
  });
  return [...groups.entries()]
    .sort(([a], [b]) => String(b).localeCompare(String(a), "zh-CN", { numeric: true }))
    .map(([year, rows]) => [year, rows.sort((a, b) => String(a.startDate || "").localeCompare(String(b.startDate || "")))]);
}

function renderTermManagement() {
  const status = document.querySelector("#termManagementStatus");
  if (!status) return;
  const canManageTerms = currentRole() === "admin" && !(currentAccount()?.scopeStageIds || []).length;
  const currentTerm = termManagementState.currentTerm || {
    id: state.schedulingConfig.termId,
    name: state.schedulingConfig.termName || "当前学期",
    startDate: state.schedulingConfig.termStartDate || "",
    endDate: state.schedulingConfig.termEndDate || "",
    status: state.schedulingConfig.termStatus || "active",
    current: true,
  };
  status.textContent = termManagementState.loading ? "处理中" : termStatusText(currentTerm.status, currentTerm);
  status.className = termStatusClass(currentTerm.status, currentTerm);
  document.querySelector("#currentTermName").textContent = currentTerm.name || "当前学期";
  document.querySelector("#currentTermRange").textContent =
    currentTerm.startDate && currentTerm.endDate ? `${currentTerm.startDate} 至 ${currentTerm.endDate}` : "未设置日期";
  document.querySelector("#currentTermMeta").textContent =
    currentTerm.status === "archived"
      ? "该学期已归档，排课、调课、工作量和工资写操作均只读。"
      : currentTerm.needsRollover
        ? `该学期已于 ${currentTerm.endDate} 结束。请新建下一学期并切换为当前学期，完成结算后再归档本学期。`
        : "排课、签到、工作量和工资均归属当前学期。";

  const terms = termManagementState.terms.length ? termManagementState.terms : [currentTerm];
  document.querySelector("#termList").innerHTML = groupTermsByAcademicYear(terms)
    .map(([schoolYear, yearTerms]) => `
      <section class="term-year-group">
        <h3>${escapeHtml(schoolYear)} 学年</h3>
        ${yearTerms.map((term) => {
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
            <span class="${termStatusClass(term.status, term)}">${termStatusText(term.status, term)}</span>
            <span>${escapeHtml(copiedSummary)}</span>
          </div>
          <div class="term-row-actions">
            ${
              canManageTerms && !isCurrent && !archived
                ? `<button class="mini-button primary" data-set-current-term="${escapeHtml(term.id)}" type="button">设为当前</button>`
                : ""
            }
            ${
              canManageTerms && !isCurrent && !archived
                ? `<button class="mini-button danger" data-archive-term="${escapeHtml(term.id)}" type="button">归档</button>`
                : ""
            }
            ${
              canManageTerms && !isCurrent && !archived
                ? `<button class="mini-button danger" data-delete-term="${escapeHtml(term.id)}" type="button">删除</button>`
                : ""
            }
          </div>
        </div>
      `;
        }).join("")}
      </section>
    `)
    .join("");

  const createButton = document.querySelector("#createTermButton");
  if (createButton) {
    createButton.disabled = termManagementState.loading || !backendMode() || !canManageTerms;
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
  const selectedClassDisplayAssignments = [
    ...selectedClassAssignments,
    ...configuredNonRegularScheduleItems(config, selectedClassId),
  ];
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
  renderSchedulingTermSelector(config);
  const classStructure = classStructureFromConfig(config);
  const highScheduling = isHighSchedulingConfig(config);
  document.querySelector("#standardClassStructureControls").hidden = highScheduling;
  document.querySelector("#highClassStructureControls").hidden = !highScheduling;
  if (highScheduling) {
    const highClassCounts = classStructure.highClassCounts || { a: 0, b: 0, c: 0 };
    document.querySelector("#highAClassCountInput").value = highClassCounts.a;
    document.querySelector("#highBClassCountInput").value = highClassCounts.b;
    document.querySelector("#highCClassCountInput").value = highClassCounts.c;
    document.querySelector("#classStructureHelp").textContent =
      `${config.divisionName}${config.gradeName}当前 ${classStructure.totalCount} 个班；A 类为清北班、B 类为实验班、C 类为普通班，每类可绑定独立作息表。`;
    document.querySelector("#classStructurePreview").innerHTML = classStructurePreviewHtml(config, highClassCounts);
    document.querySelector("#classRoomCatalog").innerHTML = classRoomCatalogHtml(config, highClassCounts, 0);
  } else {
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
  }
  const templateWrap = document.querySelector("#scheduleTemplateSelectorWrap");
  templateWrap.hidden = !highScheduling;
  if (highScheduling) {
    const activeKey = activeScheduleTemplateKey(config);
    document.querySelector("#scheduleTemplateSelect").innerHTML = (config.scheduleTemplateOptions || [])
      .map((template) => `<option value="${escapeHtml(template.key)}" ${template.key === activeKey ? "selected" : ""}>${escapeHtml(template.label)} · ${Number(template.classCount || 0)} 个班</option>`)
      .join("");
  }
  const activeTemplate = (config.scheduleTemplateOptions || []).find((item) => item.key === activeScheduleTemplateKey(config));
  document.querySelector("#periodTemplateHelp").textContent =
    `${highScheduling ? `${activeTemplate?.label || "当前班级类别"}：` : ""}${config.divisionName}${config.gradeName}当前正课 ${regularSchedulePeriods(config).length} 个自动排课节次，非正课 ${(schedulePeriodsFromConfig(config).filter((period) => period.type !== "regular")).length} 个固定显示时段；午休、大课间通过相邻节次之间的空档体现。高中共享老师和专用教室按实际钟点校验冲突。`;
  document.querySelector("#periodTemplateList").innerHTML = schedulePeriodTemplateHtml(config);
  document.querySelector("#roomResourceHelp").textContent =
    `${config.divisionName}当前有 ${roomSummary.homeroomCount} 间普通教室，另有 ${roomSummary.specialCount} 间专用教室；下方目录名称会用于排课、换教室和教室二维码。`;
  document.querySelector("#roomResourceTypeControls").innerHTML = roomResourceTypeControlsHtml(config, roomSummary.counts);
  document.querySelector("#roomResourcePreview").innerHTML = roomResourcePreviewHtml(config, roomSummary.counts);
  document.querySelector("#roomResourceCatalog").innerHTML = roomResourceCatalogHtml(config, roomSummary.counts);
  document.querySelector("#adminSchedulingTitle").textContent = `${config.divisionName}${config.gradeName}自动排课`;
  document.querySelector("#adminSchedulingIntro").textContent =
    `当前为${config.termName || "当前学期"} · ${config.divisionName}${config.gradeName}，共 ${config.classCount} 个班，按自然周 ${formatWeekRange(config.weekStart)} 生成课表。`;
  // 教学学期由学部主任在“学部校历”维护。排课页只保留已有正式学期的选择器，
  // 不再展示旧的学期新建、切换或归档入口。
  document.querySelector("#termManagementPanel").hidden = true;
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
  document.querySelector("#adminScheduleGrid").innerHTML = adminScheduleGrid(selectedClassDisplayAssignments, {
    readonly: false,
    periods: schedulePeriodsForSchedulingClass(config, selectedClassId),
  });

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
  document.querySelector("#saveHighClassStructure").disabled = termReadOnly || schedulingBackendState.loading;
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
      <small>${schedulePeriodsForSchedulingClass(config, selectedClassId).length} 个节次</small>
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
    ? adminScheduleGrid(selectedClassAssignments, {
        readonly: true,
        periods: schedulePeriodsForSchedulingClass(config, selectedClassId),
      })
    : currentVersion
      ? `<div class="empty-state schedule-overview-empty">当前学部年级已有发布版本 V${escapeHtml(currentVersion.versionNumber)}，但课表明细暂未载入。请回到“排课管理”重新读取当前学部年级。</div>`
      : `<div class="empty-state schedule-overview-empty">当前学部年级还没有课表，请先到“排课管理”生成草稿或发布正式课表。</div>`;
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
    ? schedulePeriodsForSchedulingClass(state.schedulingConfig, selectedAssignment.classId)
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
    ? regularSchedulePeriods(state.schedulingConfig)
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

function personnelCompactTags(row) {
  const managementLevel = HR_MANAGEMENT_LEVELS.some(([value]) => value === row.managementLevel)
    ? row.managementLevel
    : "ordinary";
  const managementLabel =
    row.managementLevelLabel || HR_MANAGEMENT_LEVELS.find(([value]) => value === managementLevel)?.[1] || "普通";
  const isTeacher = row.personType === "teacher" || row.role === "teacher";
  const employmentType = HR_EMPLOYMENT_TYPES.some(([value]) => value === row.employmentType)
    ? row.employmentType
    : "normal";
  const employmentLabel =
    row.employmentTypeLabel || HR_EMPLOYMENT_TYPES.find(([value]) => value === employmentType)?.[1] || "正常";
  const workStatus = HR_WORK_STATUSES.some(([value]) => value === row.workStatus) ? row.workStatus : "employed";
  const workStatusLabel =
    row.workStatusLabel || HR_WORK_STATUSES.find(([value]) => value === workStatus)?.[1] || "就业";
  const customTags = Array.isArray(row.tags) ? row.tags : [];
  const customTagText = customTags.map((tag) => tag.name).filter(Boolean).join("、");
  const ariaLabel = isTeacher
    ? `人员层级：${managementLabel}；雇佣类型：${employmentLabel}；工作状态：${workStatusLabel}${customTagText ? `；自定义标签：${customTagText}` : ""}`
    : `人员层级：${managementLabel}；工作状态：${workStatusLabel}${customTagText ? `；自定义标签：${customTagText}` : ""}`;
  return `
    <span class="personnel-identity-tags" aria-label="${escapeHtml(ariaLabel)}">
      <span class="personnel-identity-tag management ${managementLevel}">${escapeHtml(managementLabel)}</span>
      ${
        isTeacher
          ? `<span class="personnel-identity-tag employment ${employmentType}">${escapeHtml(employmentLabel)}</span>`
          : ""
      }
      <span class="personnel-identity-tag work-status ${workStatus}">${escapeHtml(workStatusLabel)}</span>
      ${customTags.map((tag) => `<span class="personnel-identity-tag custom ${escapeHtml(tag.color || "blue")}">${escapeHtml(tag.name)}</span>`).join("")}
    </span>
  `;
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
    managementLevel: "ordinary",
    managementLevelLabel: "普通",
    employmentType: "normal",
    employmentTypeLabel: "正常",
    workStatus: "employed",
    workStatusLabel: "就业",
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
      managementLevel: "ordinary",
      managementLevelLabel: "普通",
      workStatus: "employed",
      workStatusLabel: "就业",
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
        <span class="personnel-name-line">${escapeHtml(row.name)}${personnelCompactTags(row)}</span>
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
            step="0.5"
            value="${Number(rule.sourceWeeklyLessons ?? rule.weeklyLessons ?? 0)}"
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
    ...regularSchedulePeriods(config).map(
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
                      <span>每周 ${Number(subject.sourceWeeklyLessons ?? subject.weeklyLessons ?? 0)} 节</span>
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
    ...regularSchedulePeriods(config).map(
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
    : `<div class="empty-state">暂无调课申请</div>`;
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

function configuredNonRegularScheduleItems(config, classId = "") {
  const className = (config.classes || []).find((schoolClass) => schoolClass.id === classId)?.name || "";
  const teachers = config.nonRegularTeachers || config.teachers || [];
  return schedulePeriodsForSchedulingClass(config, classId)
    .filter((period) => period.type !== "regular" && period.active !== false)
    .flatMap((period) =>
      normalizeScheduleDayIndexes(period.dayIndexes)
        .map((dayIndex) => {
          const date = weekDateKeys(config.weekStart)[dayIndex];
          const teacher = teachers.find((item) => item.id === period.responsibleTeacherId);
          const roleName =
            period.responsibleRole === "homeroom"
              ? "各班班主任"
              : period.responsibleRole === "life_teacher"
                ? "本学部生活老师"
                : "";
          return {
            id: `NONREG-PREVIEW-${classId}-${date}-${period.period}`,
            nonRegular: true,
            classId,
            className,
            date,
            period: Number(period.period),
            time: period.time,
            type: period.type,
            typeName: schedulePeriodTypeText(period.type),
            subjectName: period.content || defaultNonRegularPeriodContent(period.type),
            teacherName: teacher?.name || roleName || period.responsibleTeacherName || "未指定负责人",
            room: "固定非正课时段",
          };
        }),
    );
}

function adminScheduleGrid(assignments, options = {}) {
  const weekDates = weekDateKeys(state.schedulingConfig.weekStart);
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

  const dayNames = SCHEDULE_DAY_OPTIONS;
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
            ${(options.periods || state.schedulingConfig.periods || [])
              .filter((period) => schedulePeriodAppliesOnDay(period, index))
              .map((period) => {
                const periodAssignments = dayMap.get(Number(period.period)) || [];
                return `
                  <div
                    class="schedule-slot-drop"
                    data-schedule-drop-date="${date}"
                    data-schedule-drop-period="${period.period}"
                  >
                    <div class="schedule-slot-label">
                      <strong>${period.type === "regular" ? `第 ${period.period} 节` : escapeHtml(period.typeName || schedulePeriodTypeText(period.type))}</strong>
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
              .join("") || `<div class="schedule-empty compact">当天无日程时段</div>`}
          </div>
        </article>
      `;
    })
    .join("");
}

function adminScheduleItem(assignment, options = {}) {
  if (assignment.nonRegular) {
    return `
      <div class="schedule-item nonregular">
        <div class="schedule-main">
          <strong>【${escapeHtml(assignment.typeName || schedulePeriodTypeText(assignment.type))}】${escapeHtml(assignment.subjectName)}</strong>
          <span>负责人：${escapeHtml(assignment.teacherName || "未指定")} · 固定非正课时段</span>
        </div>
      </div>
    `;
  }
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

function renderRecords() {
  if (backendMode() && isTeacherAccount()) {
    renderBackendTeacherRecords();
    return;
  }

  const teacherId = currentTeacherId();
  const records = teacherLessons(teacherId);
  document.querySelector("#teacherRecordTable").innerHTML = records.length
    ? records.map(recordRow).join("")
    : `<tr><td colspan="8"><div class="empty-state">本月暂无课程</div></td></tr>`;
}

// 计薪与否只有两种，用颜色区分开：教师扫这张表是在找「我这个月哪些课被算了」，
// 取消的那几行要一眼能挑出来
function lessonPayableTag(record) {
  return record.payable
    ? `<span class="tag completed">计薪</span>`
    : `<span class="tag exception">已取消</span>`;
}

function backendTeacherRecordRow(record) {
  return `
    <tr>
      <td data-label="日期">${formatDate(record.date)}</td>
      <td data-label="时间">${record.time || "-"}</td>
      <td class="row-title" data-label="班级">${record.className || "-"}</td>
      <td data-label="课程">${record.subjectName || "-"}</td>
      <td data-label="教室">${record.room || "-"}</td>
      <td data-label="课时">${record.units ?? "-"}</td>
      <td data-label="计薪">${lessonPayableTag(record)}</td>
      <td class="muted" data-label="说明">${record.resultText || "-"}</td>
    </tr>
  `;
}

function renderBackendTeacherRecords() {
  // 月份选择器：默认落在当前结算月，但教师核对上个月工资时要能往回翻。
  // 没有这个选择器，当月还没排课时页面只会说「本月暂无课程」，
  // 看的人分不清是没排课还是系统坏了。
  const monthInput = document.querySelector("#recordsMonth");
  if (monthInput && !monthInput.value) monthInput.value = attendanceRecordState.month || currentSettlementMonth();

  const teacherId = currentTeacherId();
  ensureBackendAttendanceRecords(teacherId, monthInput?.value || attendanceRecordState.month || currentSettlementMonth());
  const table = document.querySelector("#teacherRecordTable");
  const isCurrent = attendanceRecordState.teacherId === teacherId;

  if (attendanceRecordState.loading && (!isCurrent || !attendanceRecordState.loaded)) {
    table.innerHTML = `<tr><td colspan="7"><div class="empty-state">正在加载课时记录...</div></td></tr>`;
    return;
  }

  if (attendanceRecordState.error && isCurrent) {
    table.innerHTML = `<tr><td colspan="7"><div class="empty-state">${attendanceRecordState.error}</div></td></tr>`;
    return;
  }

  const records = isCurrent ? attendanceRecordState.records : [];
  const summary = attendanceRecordState.summary;
  setReportStatus(
    "#recordsSummary",
    summary
      ? `计薪 ${summary.payableCount} 节 / ${summary.payableUnits} 课时　已取消 ${summary.cancelledCount} 节`
      : "—",
  );
  table.innerHTML = records.length
    ? records.map(backendTeacherRecordRow).join("")
    : `<tr><td colspan="7"><div class="empty-state">本月暂无课程</div></td></tr>`;
}

function renderConfirmation() {
  if (state.activeView !== "confirm") return;
  if (backendMode() && isTeacherAccount()) {
    renderBackendConfirmation();
    return;
  }

  teacherConfirmationMonth = defaultTeacherPayrollMonth();
  renderTeacherPayrollMonthSelect();
  const monthSelect = document.querySelector("#teacherPayrollMonthSelect");
  if (monthSelect) monthSelect.disabled = true;
  document.querySelector("#teacherPayrollUnavailable").hidden = true;
  document.querySelector("#teacherPayrollGeneratedContent").hidden = false;
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
  document.querySelector("#confirmPayrollMonthLabel").textContent = "本月总薪资";
  document.querySelector("#confirmPayrollNet").textContent = formatCurrency(salary.gross);
  document.querySelector("#confirmPayrollStatus").textContent = settlementText(teacherId);
  const exceptionCount = teacherLessons(teacherId).filter((lesson) => lesson.status === "exception").length;
  const pendingCount = teacherLessons(teacherId).filter(
    (lesson) => lesson.status !== "cancelled" && lesson.date > todayKey(),
  ).length;

  const localSalaryRows = salaryRows(teacherId);
  document.querySelector("#workloadList").innerHTML = [
    ["正常课时", `${salary.regularUnits} 节`, "已计入月度工作量"],
    ["早晚自习", `${salary.selfStudyUnits} 节`, "已计入月度工作量"],
    ["周末补课", `${salary.weekendUnits} 节`, "已计入月度工作量"],
    ["审批加班", `${salary.profile.approvedOvertimeHours || 0} 小时`, "由主管发起并审批通过"],
    ["未到时间", `${pendingCount} 节`, "尚未上课，已计入工资"],
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
  const month = renderTeacherPayrollMonthSelect();
  const currentMonth = defaultTeacherPayrollMonth();
  const isCurrentMonth = month === currentMonth;
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
  const unavailable = document.querySelector("#teacherPayrollUnavailable");
  const generatedContent = document.querySelector("#teacherPayrollGeneratedContent");
  const confirmNote = document.querySelector("#confirmPayrollNote");
  const confirmStatus = document.querySelector("#confirmPayrollStatus");
  const confirmNet = document.querySelector("#confirmPayrollNet");
  const confirmMonthLabel = document.querySelector("#confirmPayrollMonthLabel");
  const actionHint = document.querySelector("#teacherConfirmActionHint");
  const list = document.querySelector("#workloadList");
  const loading =
    (teacherWorkloadState.loading && !data) ||
    (teacherPayrollState.loading &&
      !(teacherPayrollState.teacherId === teacherId && teacherPayrollState.month === month && teacherPayrollState.loaded));
  const error = teacherWorkloadState.error || teacherPayrollState.error;

  const showUnavailable = (message) => {
    unavailable.hidden = false;
    unavailable.textContent = message;
    generatedContent.hidden = true;
    // 切换月份或学期时必须把原月份金额从 DOM 一并清掉，
    // 不能只把容器藏起来，否则脚本或辅助技术仍能读到旧工资。
    if (confirmNet) confirmNet.textContent = "—";
    if (confirmStatus) {
      confirmStatus.textContent = "未生成";
      confirmStatus.className = "status-pill";
    }
    if (list) list.innerHTML = "";
    document.querySelector("#confirmSteps").innerHTML = "";
    ["#teacherPayrollPayableUnits", "#teacherPayrollPendingUnits", "#teacherPayrollConfirmState"].forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = "—";
    });
    document.querySelector("#confirmWorkload").disabled = true;
    document.querySelector("#submitPayrollDispute").disabled = true;
    if (actionHint) actionHint.textContent = "";
  };

  if (loading) {
    showUnavailable(`正在读取${formatMonthLabel(month)}工资确认单…`);
    return;
  }
  if (error) {
    showUnavailable(error);
    return;
  }
  if (!payroll?.generated) {
    showUnavailable(
      isCurrentMonth
        ? "财务尚未生成本月工资明细。生成后这里会展示完整工资确认单。"
        : `财务尚未生成${formatMonthLabel(month)}工资明细。`,
    );
    return;
  }

  unavailable.hidden = true;
  generatedContent.hidden = false;
  if (confirmMonthLabel) {
    confirmMonthLabel.textContent = isCurrentMonth ? "本月总薪资" : `${formatMonthLabel(month)}总薪资`;
  }

  if (confirmNet) confirmNet.textContent = formatCurrency(payroll.grossPay || 0);
  if (confirmStatus) {
    confirmStatus.textContent = payrollStatusLabel(payrollStatus);
    confirmStatus.className = isLockedPayroll ? "status-pill locked" : "status-pill done";
  }
  if (confirmNote) {
    confirmNote.textContent = isLockedPayroll
      ? `${formatMonthLabel(month)}工资已锁定，可随时查阅。`
      : `请核对${formatMonthLabel(month)}工资明细，确认后财务才能进入锁定发放。`;
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

  const categories = data?.categories || [];
  const summary = data?.summary || payroll.workloadSummary || {};
  const rows = normalizeSettlementRows(payroll.rows || []);
  const disputeReason = payroll.generated?.disputeReason || "";
  const stateNote = isLockedPayroll
    ? `
        <div class="payroll-confirm-state-note">
          <strong>${escapeHtml(formatMonthLabel(month))}工资已锁定</strong>
          <p>这里仍展示 ${summary.pendingCount || 0} 节未完成课次，是为了留痕说明这些课次未进入本月工资；老师不需要再确认或提交异议。如确需调整，请联系财务解锁重算。</p>
        </div>
      `
    : "";
  list.innerHTML =
    stateNote +
    [
      ...categories.map((category) => [category.label, `${category.units} 节`, "已计入月度工作量"]),
      [
        "未到时间",
        `${summary.pendingCount || 0} 节`,
        isLockedPayroll ? "已作为未计薪记录归档，不影响已锁定工资" : "尚未上课，已计入工资",
      ],
      [
        "异常记录",
        `${summary.exceptionCount || 0} 条`,
        isLockedPayroll ? "已按锁定前处理结果归档留痕" : "异常课次不会进入本次工资，需财务处理后重算",
      ],
      ["可计薪课时", `${summary.payableUnits || 0} 节`, "排给你的课都计薪"],
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

  setTeacherPayrollSupport(teacherId, payroll);
  const actionDisabled =
    payrollStatus !== "generated" || teacherPayrollState.loading || teacherWorkloadState.loading || Boolean(teacherPayrollState.error);
  document.querySelector("#confirmWorkload").disabled = actionDisabled;
  document.querySelector("#submitPayrollDispute").disabled = actionDisabled;
  if (actionHint) {
    if (payrollStatus === "missing") {
      actionHint.textContent = `财务尚未发布${formatMonthLabel(month)}工资明细，暂不能确认。`;
    } else if (payrollStatus === "generated") {
      actionHint.textContent = "请核对工资明细，确认无误后点击确认；如有问题可提交异议。";
    } else if (payrollStatus === "locked") {
      actionHint.textContent = `${formatMonthLabel(month)}工资已锁定，当前页面只保留明细和未计薪记录供查看。`;
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
  const pendingCount = lessons.filter((lesson) => lesson.status !== "cancelled" && lesson.date > todayKey()).length;
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
  ["#teacherPayrollNet", "#netPreview"].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = amountText;
  });

  ["#teacherPayrollStatus"].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = statusText;
      element.className = statusClass;
    }
  });

  const dashboardStatus = document.querySelector("#dashboardPayrollStatus");
  if (dashboardStatus) dashboardStatus.textContent = statusText;

  const summaryNote = document.querySelector("#teacherPayrollSummaryNote");
  if (summaryNote && summaryText) summaryNote.textContent = summaryText;
}

function renderTeacherPayroll() {
  // 当前只服务老师工作台的工资汇总；工资确认页有自己的月份状态，不能在
  // 选择“上月”后又被这里发起的“本月”请求覆盖。
  if (state.activeView !== "dashboard") return;
  const teacherId = isTeacherAccount() ? currentTeacherId() : "";
  const month = defaultTeacherPayrollMonth();

  if (backendMode() && isTeacherAccount()) {
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
        amountText: "—",
        statusText: teacherPayrollState.error,
        statusClass: "status-pill warning",
        noteText: "总薪资读取失败",
        summaryText: teacherPayrollState.error,
      });
      return;
    }

	    const backendPayrollStatus = payroll?.generated?.status || "";
	    if (!payroll?.generated) {
	      setTeacherPayrollWidgets({
	        amountText: "—",
	        statusText: "财务尚未生成",
	        statusClass: "status-pill",
	        noteText: "财务生成后展示本月工资",
	        summaryText: "财务尚未生成本月工资明细。",
	      });
	      return;
	    }
	    const payrollStatus = payrollStatusLabel(backendPayrollStatus);
	    setTeacherPayrollWidgets({
	      amountText: formatCurrency(payroll?.grossPay || 0),
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
	    amountText: formatCurrency(salary.gross),
	    statusText: settlementText(teacherId),
	    statusClass: "status-pill",
	    noteText: "结算期到月度确认查看明细",
	    summaryText: "老师端平时只展示月度汇总；结算期打开“月度确认”核对工资明细。",
	  });
}

function renderFinanceDashboard() {
  // 范围文案两条渲染路径都要刷新：只在后端分支里刷的话，
  // 切到本地演示模式后 DOM 会留着上一个账号的"××部应发"字样。
  applyFinanceScopeLabels();
  if (backendMode() && isFinanceRole()) {
    renderBackendFinanceDashboard();
    return;
  }

  if (!state.financeGroupBy) state.financeGroupBy = "department";
  const allPending = state.lessons.filter(
    (lesson) => lesson.status !== "cancelled" && lesson.date > todayKey(),
  ).length;
  const allWarnings = buildWarnings().length;
  const settledCount = state.teachers.filter((teacher) => state.settlements[teacher.id]?.status === "settled").length;
  const totals = financeSalaryTotals();

  document.querySelector("#financeTeacherCount").textContent = state.teachers.length;
  document.querySelector("#financePendingCount").textContent = allPending;
  document.querySelector("#financeWarningCount").textContent = allWarnings;
  document.querySelector("#financeSettledCount").textContent = settledCount;
  document.querySelector("#financeGrossTotal").textContent = formatCurrency(totals.gross);
  if (!setFinanceGroupSummaryVisibility()) return;
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
        </tr>
      `,
    )
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
  renderBudgetPanel("financeBudgetPanel", "financeBudgetGrid", "financeBudgetSource");
  if (!setFinanceGroupSummaryVisibility()) return;

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
  // 未到时间的课次已经计薪了，只是还没上。它同时出现在 payableLines 和
  // pendingLines 里，所以这里按 lessonId 去重，否则财务会看到同一节课两行、
  // 以为课时被算了两遍。
  const pendingIds = new Set((workload.pendingLines || []).map((line) => line.lessonId));
  return [
    ...(workload.payableLines || []).map((line) => ({
      ...line,
      payable: true,
      note: pendingIds.has(line.lessonId)
        ? `尚未上课，已计薪 ${line.units} 节 · ${formatCurrency(line.amount || 0)}`
        : `计薪 ${line.units} 节 · ${formatCurrency(line.amount || 0)}`,
    })),
    ...(workload.cancelledLines || []).map((line) => ({
      ...line,
      payable: false,
      note: line.note || "已取消，不计薪",
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
      <td data-label="计薪状态">${lessonPayableTag(row)}</td>
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
    table.innerHTML = `<tr><td colspan="8"><div class="empty-state">正在加载该老师课时记录...</div></td></tr>`;
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
    : `<tr><td colspan="8"><div class="empty-state">该老师本月暂无课程</div></td></tr>`;
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

// 当前老师卡片上的状态标签。
// 确认状态与工资单状态在后端模式下同源（都取自工资单 status），两个标签会出现
// 一模一样的文字（例如并排两个「老师已确认」）。文案相同时只保留一个。
function settlementTeacherTags({
  confirmationLabel,
  confirmationStage,
  payrollLabel,
  payrollStatus,
  hasPayrollSnapshot,
}) {
  const confirmationClass =
    payrollStatus === "disputed" ? "exception" : confirmationStage > 0 ? "completed" : "pending";
  const payrollClass =
    payrollStatus === "locked" ? "locked" : hasPayrollSnapshot ? "completed" : "pending";
  const tags = [`<span class="tag ${confirmationClass}">${confirmationLabel}</span>`];
  if (payrollLabel !== confirmationLabel) {
    tags.push(`<span class="tag ${payrollClass}">${payrollLabel}</span>`);
  }
  return tags.join("");
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
  if (payrollStatus === "reviewed") return "该老师工资已复核；全学部完成复核后可提交月度工资确认。";
  if (payrollStatus === "locked") return "这位老师本月工资已锁定，老师端保留总薪资和确认记录。";
  return "薪资已试算，请按流程生成、老师确认、财务处理，并提交学部工资确认。";
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
	        <div class="settlement-teacher-state">${settlementTeacherTags({
	          confirmationLabel,
	          confirmationStage,
	          payrollLabel,
	          payrollStatus,
	          hasPayrollSnapshot,
	        })}</div>
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
		      settlementStepHtml(1, "保存草稿", payrollStatus === "saved" ? "该老师工资已保存，待本月统一发布" : hasPayrollSnapshot ? "该老师工资快照已保存" : "核对工作量、津贴与奖扣", savedState),
		      settlementStepHtml(2, "发布确认", ["teacher_confirmed", "reviewed", "locked"].includes(payrollStatus) ? "老师已确认工资明细" : payrollStatus === "disputed" ? "老师已提出异议" : payrollStatus === "generated" ? "已发布，等待老师确认" : "发布后老师端才可确认", publishState),
		      settlementStepHtml(3, "财务处理", ["reviewed", "locked"].includes(payrollStatus) ? "财务已处理完成" : "处理老师异议或确认无误", reviewState),
      settlementStepHtml(4, "学部确认与发放", payrollStatus === "locked" ? "总校财务已执行发放并锁定工资" : "全员复核后由主任、校长确认，再由总校财务执行", lockState),
	    ].join("");
  }
}

// 档位中文名沿用《深圳市富源学校薪酬制度》的措辞，与 server/payroll.js 里的
// QUALIFICATION_GRADE_LABELS / ASSESSMENT_BAND_LABELS / HOUSING_TIER_LABELS 保持一致。
// 界面上不出现 third、primaryCoreHigh 这类内部枚举。
const salaryQualificationLabels = {
  seniorProfessor: "正高级教师",
  seniorTeacher: "高级教师",
  first: "一级教师",
  second: "二级教师",
  third: "三级教师",
  ungraded: "未评级",
};

// 旧库遗留键：职称曾与学历绑定（一级/博士），现已拆开——职称归职称，学历另发补贴。
// 只用于把历史数据译成中文，不参与薪资配置表单，否则配置页会多出一套重复档位。
const legacyQualificationLabels = {
  firstOrDoctor: "一级教师",
  secondOrMaster: "二级教师",
  thirdOrBachelor: "三级教师",
  ungradedOrJuniorCollege: "未评级",
};

// 展示用：现行档位查不到时回退到遗留键
function qualificationLabelOf(key) {
  return salaryQualificationLabels[key] || legacyQualificationLabels[key] || key;
}

// 学历补贴（制度：硕士 500 元/月、博士 800 元/月），与职称档并行发放
const salaryDegreeLabels = {
  master: "硕士",
  doctor: "博士",
};

const salaryAssessmentLabels = {
  kindergarten: "幼儿园专任",
  high: "高中专任",
  middle: "初中专任",
  primaryCoreHigh: "小学高段核心",
  primaryCoreLow: "小学低段核心",
  primarySpecial: "小学艺体信息心理",
};

const salaryHousingLabels = {
  teacher: "专任教师",
  chief: "首席",
  backboneOrGradeHead: "骨干/年级主任",
  middleManager: "中层干部",
  otherAdmin: "其他行政人员",
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
    title: "职称档基本工资",
    description: "老师人事档案里的职称档命中这里对应的基本工资金额。职称与学历互不绑定，学历另按下方标准发补贴。",
    path: "baseSalaryByQualification",
    labels: salaryQualificationLabels,
  },
  {
    title: "学历补贴",
    description: "按最高学历发放，与职称档基本工资并行计发。本科及以下不发。",
    path: "degreeAllowance",
    labels: salaryDegreeLabels,
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
  // 校龄津贴按岗位类别取不同公式，参数与 server/payroll.js 的 seniorityRules 一一对应。
  // 早先这里配的是一张 1-6 年的阶梯表（seniorityAllowance），但计算侧读的是公式，
  // 改了阶梯表根本不生效——现在直接配公式参数。
  {
    title: "校龄津贴 · 专任教师、校医",
    description:
      "制度：3 年及以内按 校龄×单价；3 年以上按 基数+(校龄-3)×单价。校龄取实数，进校满一年才算一年，按封顶金额封顶。",
    fields: {
      "seniorityRules.teacher.tier1Years": "分段年限（年）",
      "seniorityRules.teacher.tier1Rate": "分段内单价（元/年）",
      "seniorityRules.teacher.tier2Base": "超出分段的基数（元）",
      "seniorityRules.teacher.tier2Rate": "超出部分单价（元/年）",
      "seniorityRules.teacher.cap": "封顶（元/月）",
    },
  },
  {
    title: "校龄津贴 · 生活教师、司机",
    description: "制度：校龄×单价，按封顶金额封顶。后勤职工制度未设校龄津贴，故不在此列。",
    fields: {
      "seniorityRules.lifeTeacher.flatRate": "生活教师单价（元/年）",
      "seniorityRules.lifeTeacher.cap": "生活教师封顶（元/月）",
      "seniorityRules.driver.flatRate": "司机单价（元/年）",
      "seniorityRules.driver.cap": "司机封顶（元/月）",
    },
  },
];

// 生活老师只设置在小学、初中和高中。人数、类别与兼岗由人事在档案中按学期确认；
// 这里集中维护所有可变的计薪标准，避免把固定金额散落在人员档案里。
const lifeTeacherSalaryGroups = [
  {
    title: "生活老师 · 通用标准",
    description: "适用于小学、初中、高中生活老师：基本工资、住房及接送补贴。接送补贴按月度考核页录入的实际次数计发。",
    fields: {
      "lifeTeacher.baseSalary": "基本工资（元/月）",
      "lifeTeacher.housingAllowance": "住房补贴（元/月）",
      "lifeTeacher.transportAllowance.short": "短途接送（元/次）",
      "lifeTeacher.transportAllowance.medium": "中途接送（元/次）",
      "lifeTeacher.transportAllowance.long": "长途接送（元/次）",
      "lifeTeacher.transportAllowance.extraLong": "超长途接送（元/次）",
      "lifeTeacher.transportAllowance.phone": "话费补助（元/月）",
    },
  },
  {
    title: "小学部生活老师",
    description: "工作量按负责人事确认的学生总数计算；低段、高段和门岗／夜班分别按对应考核标准计发。",
    fields: {
      "lifeTeacher.workloadByStage.primary.perStudent": "工作量（元/生）",
      "lifeTeacher.workloadByStage.primary.cap": "工作量封顶（元/月）",
      "lifeTeacher.assessmentByStage.primary.lower": "低段考核工资基准（元）",
      "lifeTeacher.assessmentByStage.primary.upper": "高段考核工资基准（元）",
      "lifeTeacher.assessmentByStage.primary.night": "门岗／夜班考核工资基准（元）",
      "lifeTeacher.postAllowancesByStage.primary.lifeManager": "生活主管津贴（元/月）",
      "lifeTeacher.postAllowancesByStage.primary.buildingLead": "栋长津贴（元/月）",
      "lifeTeacher.postAllowancesByStage.primary.nightShiftLead": "夜班组长津贴（元/月）",
      "lifeTeacher.postAllowancesByStage.primary.primaryDayShift": "一年级／六年级白班津贴（元/月）",
    },
  },
  {
    title: "初中部生活老师",
    description: "工作量按负责人事确认的学生总数计算；生活老师和门岗／夜班按不同考核标准计发。",
    fields: {
      "lifeTeacher.workloadByStage.middle.perStudent": "工作量（元/生）",
      "lifeTeacher.workloadByStage.middle.cap": "工作量封顶（元/月）",
      "lifeTeacher.assessmentByStage.middle.standard": "生活老师考核工资基准（元）",
      "lifeTeacher.assessmentByStage.middle.night": "门岗／夜班考核工资基准（元）",
      "lifeTeacher.postAllowancesByStage.middle.lifeManager": "生活主管津贴（元/月）",
      "lifeTeacher.postAllowancesByStage.middle.buildingLead": "栋长津贴（元/月）",
      "lifeTeacher.postAllowancesByStage.middle.nightShiftLead": "夜班组长津贴（元/月）",
    },
  },
  {
    title: "高中部生活老师",
    description: "工作量按负责人事确认的学生总数计算；生活老师和门岗／夜班按不同考核标准计发。",
    fields: {
      "lifeTeacher.workloadByStage.high.perStudent": "工作量（元/生）",
      "lifeTeacher.workloadByStage.high.cap": "工作量封顶（元/月）",
      "lifeTeacher.assessmentByStage.high.standard": "生活老师考核工资基准（元）",
      "lifeTeacher.assessmentByStage.high.night": "门岗／夜班考核工资基准（元）",
      "lifeTeacher.postAllowancesByStage.high.lifeManager": "生活主管津贴（元/月）",
      "lifeTeacher.postAllowancesByStage.high.buildingLead": "栋长津贴（元/月）",
      "lifeTeacher.postAllowancesByStage.high.nightShiftLead": "夜班组长津贴（元/月）",
    },
  },
];

// 薪资配置里的学段区块（岗位津贴、课时档位）按财务范围裁剪：
// 小学部会计不该看到初中、高中的计薪标准。这些区块是写死的表单结构，
// 服务端把数据摘掉后标签仍会留在页面上，必须在渲染时一并滤掉。
function stageGroupInFinanceScope(group) {
  const scope = currentFinanceScopeId();
  if (!scope) return true; // 行政管理等不受限角色看全部
  if (scope === "headquarters") return false; // 总校财务管行政后勤，没有教学档位
  return group.stageId === scope;
}

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
    stageId: "high",
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
    stageId: "middle",
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
    stageId: "primary",
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
  const minimumWage = Number(scheme.minimumWage || scheme.minimumWageByYear?.["2026"] || 2700);
  const minimumWageCard = `
    <section class="payroll-scheme-card">
      <div>
        <h4>最低工资标准</h4>
        <p>全校统一维护。待岗人员按该标准的 80% 加住房补贴结算；试用期最低工资兜底也取同一标准。</p>
      </div>
      <label class="field-label">最低工资标准（元/月）<input id="schemeMinimumWage" type="number" min="1" step="1" value="${minimumWage}" /></label>
    </section>
  `;
  const fixedGroups = salarySchemeMoneyGroups
    .map((group) => {
      // 两种写法：{path, labels} 用同一前缀拼子键；{fields} 直接给完整路径，
      // 供校龄公式这类参数不在同一层级的区块使用
      const entries = group.fields
        ? Object.entries(group.fields)
        : Object.entries(group.labels).map(([key, label]) => [`${group.path}.${key}`, label]);
      const fields = entries
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
  const lifeTeacherGroups = lifeTeacherSalaryGroups
    .map((group) => {
      const fields = Object.entries(group.fields)
        .map(([pathValue, label]) => schemeNumberInput(pathValue, label, getNestedValue(scheme, pathValue, 0)))
        .join("");
      return `
        <section class="payroll-scheme-card life-teacher-scheme-card">
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
    .filter(stageGroupInFinanceScope)
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
    .filter(stageGroupInFinanceScope)
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
    ${minimumWageCard}
    ${fixedGroups}
    ${lifeTeacherGroups}
    ${lessonRuleGroups}
    ${allowanceGroups}
  `;
}

function applyPayrollSchemeEditorInputs(teacherSalaryScheme = {}) {
  const next = clone(teacherSalaryScheme || {});
  document.querySelectorAll("#payrollSchemeEditor [data-scheme-path]").forEach((input) => {
    setNestedNumber(next, input.dataset.schemePath, input.value);
  });
  const minimumWage = Number(document.querySelector("#schemeMinimumWage")?.value || 0);
  if (!Number.isFinite(minimumWage) || minimumWage <= 0) {
    throw new Error("最低工资标准必须大于 0");
  }
  next.minimumWage = minimumWage;
  delete next.minimumWageByYear;
  return next;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 历史工资单文案里可能还留着枚举，展示前兜底译成中文。
// 遗留职称键也要带上——旧数据里就是 firstOrDoctor 这类写法。
function humanizePayrollBasis(basis = "") {
  const replacements = {
    ...salaryQualificationLabels,
    ...legacyQualificationLabels,
    ...salaryAssessmentLabels,
    ...salaryHousingLabels,
    ...salaryDegreeLabels,
  };
  return Object.entries(replacements)
    .sort((a, b) => b[0].length - a[0].length)
    .reduce((text, [key, label]) => {
      const pattern = new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(key)}(?=$|[^A-Za-z0-9_])`, "g");
      return text.replace(pattern, `$1${label}`);
    }, String(basis || ""));
}

function renderSettlement() {
  applyPayrollExportAccess();
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
  const totals = settlementTotalsFromRows(localRows, { gross: salary.gross });
  const settlement = state.settlements[teacherId];
  const settled = settlement?.status === "settled";
  const status = document.querySelector("#settlementStatus");

  document.querySelector("#settlementGrossSalary").textContent = formatCurrency(totals.gross);
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
	  renderBudgetPanel("settlementBudgetPanel", "settlementBudgetGrid", "settlementBudgetSource");
		  renderFinanceTeacherFilters("settlement");
		  renderSettlementStatusBoard();
	  renderSettlementMonthProgress();
		  const teacherId = state.selectedFinanceTeacherId;
  const canOperateTeacher = canOperateFinanceTeacher(teacherId);
  if (!teacherId) {
    document.querySelector("#settlementGrossSalary").textContent = "¥0";
	    document.querySelector("#settlementStatus").textContent = "当前筛选无老师";
	    document.querySelector("#settlementStatus").className = "status-pill warning";
	    document.querySelector("#saveTeacherPayrollDraft").disabled = true;
	    document.querySelector("#settleTeacherPayroll").disabled = true;
    document.querySelector("#reviewTeacherPayroll").disabled = true;
    document.querySelector("#batchGeneratePayroll").disabled = !isFinanceRole();
    document.querySelector("#batchLockPayroll").disabled = !isDivisionFinanceAccount();
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
	    status.textContent = financeTeacherDetailState.error;
	    status.className = "status-pill warning";
	    saveButton.disabled = !canOperateTeacher;
	    button.disabled = true;
    reviewButton.disabled = true;
    batchButton.disabled = false;
    batchLockButton.disabled = !isDivisionFinanceAccount();
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
	    status.textContent = "暂无薪资明细";
	    status.className = "status-pill";
	    saveButton.disabled = !canOperateTeacher;
	    button.disabled = true;
    reviewButton.disabled = true;
    batchButton.disabled = false;
    batchLockButton.disabled = !isDivisionFinanceAccount();
    exportButton.disabled = false;
    unlockButton.disabled = true;
    if (lockHint) lockHint.textContent = canOperateTeacher
      ? "请先保存或发布该老师工资明细。"
      : "当前为跨学部只读查看；请由对应学部财务处理该工资。";
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

  });
  document.querySelector("#settlementGrossSalary").textContent = formatCurrency(totals.gross);
	  const payrollStatus = payroll.generated?.status || "preview";
  const lockBlockers = payroll.lockBlockers || financeTeacherDetailState.lockBlockers || [];
  const hasLockBlockers = payrollStatus === "reviewed" && lockBlockers.length > 0;
	  status.textContent = payroll.generated
	    ? `${payrollStatusLabel(payrollStatus)} ${payroll.generated.lockedAt?.slice(0, 10) || payroll.generated.reviewedAt?.slice(0, 10) || payroll.generated.teacherConfirmedAt?.slice(0, 10) || payroll.generated.disputedAt?.slice(0, 10) || payroll.generated.publishedAt?.slice(0, 10) || payroll.generated.savedAt?.slice(0, 10) || payroll.generated.generatedAt?.slice(0, 10) || ""}`
	    : "后端试算";
	  status.className = payrollStatus === "locked" ? "status-pill locked" : "status-pill done";
	  saveButton.disabled =
	    financeTeacherDetailState.loading ||
	    !canOperateTeacher ||
	    ["teacher_confirmed", "disputed", "reviewed", "locked"].includes(payrollStatus);
  reviewButton.disabled =
    financeTeacherDetailState.loading || !canOperateTeacher || !["teacher_confirmed", "disputed"].includes(payrollStatus);
  button.disabled = financeTeacherDetailState.loading || !canOperateTeacher || payrollStatus !== "reviewed" || hasLockBlockers;
  button.title = hasLockBlockers ? `还有 ${lockBlockers.length} 条待处理/异常课次，处理后才能锁定` : "";
  batchButton.disabled = financeTeacherDetailState.loading || !isFinanceRole();
  batchLockButton.disabled = financeTeacherDetailState.loading || !isDivisionFinanceAccount();
  exportButton.disabled = financeTeacherDetailState.loading || !isFinanceRole();
  unlockButton.disabled = financeTeacherDetailState.loading || !canOperateTeacher || payrollStatus !== "locked";
  if (lockHint) {
    if (!canOperateTeacher) {
      lockHint.textContent = "当前为跨学部只读查看；请由对应学部财务处理该工资。";
    } else if (hasLockBlockers) {
      lockHint.textContent = `不能锁定：仍有 ${lockBlockers.length} 条待处理或异常课次，请先处理后重新生成/复核。`;
    } else if (payrollStatus === "reviewed") {
      lockHint.textContent = "该老师工资已复核；全部老师复核完成后，请提交本学部工资确认。";
    } else if (payrollStatus === "locked") {
      lockHint.textContent = "该老师本月工资已锁定，如需调整请先解锁重算。";
    } else {
      lockHint.textContent = "需老师确认并由财务处理完成后，才能提交学部工资确认。";
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
  termSelect.innerHTML = groupTermsByAcademicYear(terms)
    .map(
      ([schoolYear, yearTerms]) => `
        <optgroup label="${escapeHtml(schoolYear)} 学年">
          ${yearTerms
            .map(
              (term) => `<option value="${escapeHtml(term.id)}">${escapeHtml(term.semester || term.name)} · ${escapeHtml(term.startDate)} 至 ${escapeHtml(term.endDate)}</option>`,
            )
            .join("")}
        </optgroup>
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
  document.querySelector("#payrollHistoryPaidGross").textContent = formatCurrency(summary.paidGrossPay || 0);
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
          <td data-label="应发"><strong>${formatCurrency(item.grossPay || 0)}</strong></td>
          <td data-label="锁定时间">${escapeHtml(item.lockedAt ? item.lockedAt.slice(0, 10) : "未锁定")}</td>
        </tr>
      `,
    )
    .join("");
}

function renderPayrollHistory() {
  if (!canViewPayrollHistory()) return;
  applyPayrollExportAccess();
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
  if (!canExportAllPayrollDetails()) return;
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

  };
  const fields = [
    ["#ruleBaseSalary", rules.baseSalary],
    ["#rulePositionSalary", rules.positionSalary],
    ["#ruleRegular", rules.regular],
    ["#ruleMorning", rules.morning],
    ["#ruleEvening", rules.evening],
    ["#ruleWeekend", rules.weekend],
    ["#ruleMakeup", rules.makeup],

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
  const isLifeTeacher = profile?.salaryCategory === "lifeTeacher";
  // 生活老师的计薪依据全部由人事档案（类别、负责学生数、兼岗）和总校财务的
  // 全校配置维护，不开放专任教师的考核档／住房档编辑入口。
  if (isLifeTeacher) salaryProfileEditMode = false;
  const editable = !isLifeTeacher && canEditSalaryProfile(profile);
  const hasProfile = Boolean(profile);

  if (panel) {
    panel.classList.toggle("is-editing", editable);
    panel.classList.toggle("is-readonly", !editable);
  }
  if (saveButton) {
    saveButton.hidden = isLifeTeacher;
    saveButton.disabled = isLifeTeacher || !backendMode() || !isFinanceRole() || !hasProfile || financeTeacherDetailState.loading;
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

  const profileFields = document.querySelector("#salaryProfileFields");
  const description = document.querySelector("#salaryProfileDescription");
  const profileHint = document.querySelector("#salaryProfileHint");
  const title = document.querySelector("#salaryProfileTitle");
  if (profileFields) profileFields.hidden = isLifeTeacher;
  if (title) title.textContent = isLifeTeacher ? "生活老师工资依据" : "本学期工资档案";
  if (description) {
    description.textContent = isLifeTeacher
      ? "基本工资、工作量、考核、兼岗、接送与住房补贴均按统一生活老师方案核算；个人计薪事实由人事维护。"
      : "维护本学期稳定生效的职级、考核工资基准档、住房档和岗位角色；默认只读，确需调整时由财务点击编辑。";
  }
  if (profileHint) {
    profileHint.textContent = isLifeTeacher
      ? "生活老师类别、负责学生总数和兼岗由人事在「人员档案」确认；金额标准由总校财务在「薪资配置」维护。"
      : "兼岗任命（班主任、年级主任等）与学生数由人事在「人员档案」维护，此处仅按其结果计算津贴。";
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

function renderMonthlyAssessmentScore() {
  const scoreInput = document.querySelector("#salaryAssessmentScore");
  const noteInput = document.querySelector("#salaryAssessmentNote");
  const saveButton = document.querySelector("#saveAssessmentScore");
  const hint = document.querySelector("#assessmentScoreHint");
  if (!scoreInput || !noteInput || !saveButton || !hint) return;

  const teacherId = state.selectedFinanceTeacherId;
  const detail =
    financeTeacherDetailState.teacherId === teacherId && financeTeacherDetailState.loaded
      ? financeTeacherDetailState
      : null;
  const assessment = detail?.assessment || null;
  const payrollStatus = detail?.payroll?.generated?.status || "";
  const isLifeTeacher = detail?.payroll?.salaryProfile?.salaryCategory === "lifeTeacher";
  const editable = Boolean(
    backendMode() && isFinanceRole() && teacherId && canOperateFinanceTeacher(teacherId) && payrollStatus !== "locked",
  );

  scoreInput.value = assessment?.score ?? "";
  noteInput.value = assessment?.note || "";
  scoreInput.disabled = !editable;
  noteInput.disabled = !editable;
  saveButton.disabled = !editable || financeTeacherDetailState.loading;
  const transportFields = document.querySelector("#lifeTeacherTransportFields");
  if (transportFields) {
    transportFields.hidden = !isLifeTeacher;
    const transport = assessment?.lifeTeacherTransport || {};
    [
      ["#lifeTeacherTransportShort", "short"],
      ["#lifeTeacherTransportMedium", "medium"],
      ["#lifeTeacherTransportLong", "long"],
      ["#lifeTeacherTransportExtraLong", "extraLong"],
    ].forEach(([selector, key]) => {
      const input = document.querySelector(selector);
      if (input) {
        input.value = Number(transport[key] || 0);
        input.disabled = !editable || !isLifeTeacher;
      }
    });
  }

  if (!teacherId) {
    hint.textContent = "选择老师后录入本月考核分数。";
  } else if (!backendMode()) {
    hint.textContent = "本地演示模式不保存考核分数。";
  } else if (!canOperateFinanceTeacher(teacherId)) {
    hint.textContent = "当前为跨范围只读查看，仅对应范围的财务可以录入。";
  } else if (payrollStatus === "locked") {
    hint.textContent = "本月工资已锁定；请先解锁，再修改考核分数。";
  } else if (assessment) {
    hint.textContent = `${detail?.month || "本月"}已录入 ${assessment.score} 分，考核工资按 ${assessment.score}% 计发。${isLifeTeacher ? "接送次数会按生活老师单价自动计入。" : ""}`;
  } else {
    hint.textContent = `${detail?.month || "本月"}尚未录入，试算暂按 100 分（100%）计发。`;
  }
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
    renderMonthlyAssessmentScore();
    return;
  }

  // 学段取自当前工资单携带的老师信息；本地演示模式回退到 state 里的老师
  const profileStageId =
    payroll?.teacher?.stageId || teacherById(state.selectedFinanceTeacherId)?.stageId || "";
  renderAssessmentBandSelect(profileStageId, profile.assessmentBand || "");
  setInputValue("#salaryHousingTier", profile.housingTier || "teacher");
  setInputValue("#salaryProbationRate", profile.probationRate ?? 1);
  setInputValue("#salaryManualItemsJson", JSON.stringify(profile.manualItems || [], null, 2));
  renderSalaryManualItemsEditor(profile.manualItems || []);
  syncSalaryProfileEditState(profile);
  renderMonthlyAssessmentScore();
}

// 考核档与学段绑定（与 server/payroll.js 的 ASSESSMENT_BANDS_BY_STAGE 一致）：
// 小学老师只能选小学三档，初中、高中各自只有一档。学段未知时不限制，
// 交由后端按同一规则校验——行政后勤等无学段人员不该被这条挡住。
const assessmentBandsByStage = {
  high: ["high"],
  middle: ["middle"],
  primary: ["primaryCoreHigh", "primaryCoreLow", "primarySpecial"],
};

function assessmentBandOptionsFor(stageId, selected = "") {
  const allowed = assessmentBandsByStage[String(stageId || "")] || Object.keys(salaryAssessmentLabels);
  return allowed
    .map(
      (band) =>
        `<option value="${band}" ${band === selected ? "selected" : ""}>${escapeHtml(salaryAssessmentLabels[band] || band)}</option>`,
    )
    .join("");
}

// 学段变了要重建下拉，否则会留着上一位老师学段的选项
function renderAssessmentBandSelect(stageId, selected) {
  const select = document.querySelector("#salaryAssessmentBand");
  if (!select) return;
  const allowed = assessmentBandsByStage[String(stageId || "")] || Object.keys(salaryAssessmentLabels);
  // 档位与学段不匹配时（老数据）保留原值并置顶，避免静默改档
  const value = allowed.includes(selected) ? selected : allowed[0] || "";
  select.innerHTML = assessmentBandOptionsFor(stageId, value);
  select.value = value;
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
  const agreement = components.find((item) => item.name === "协议工资");
  if (agreement) {
    grid.innerHTML = `
      <div class="hr-owned-row">
        <span>协议聘用</span>
        <strong>${escapeHtml(agreement.basis)}</strong>
        <em>${formatCurrency(agreement.amount)}</em>
      </div>
    `;
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


function backendWarningItems({ records = [], workload = null, payroll = null } = {}) {
  const items = [];
  const seen = new Set();
  const addItem = (item) => {
    const key = item.key || `${item.type}-${item.lessonId || item.title}-${item.detail}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };

  // 取消的课次要提醒：教师核对工资时会问「我这周怎么少了两节」
  records
    .filter((record) => record.payable === false)
    .forEach((record) => {
      addItem({
        key: `record-${record.lessonId || `${record.date}-${record.time}`}`,
        type: "cancelled",
        title: `${record.className || "未匹配课次"} · ${record.subjectName || ""}`,
        tag: "已取消",
        detail: `${formatDate(record.date)} ${record.time || ""} · ${record.room || "未知教室"} · ${record.resultText || "不计薪"}`,
      });
    });

  (workload?.pendingLines || []).forEach((line) => {
    addItem({
      key: `pending-${line.lessonId}`,
      type: "pending",
      lessonId: line.lessonId,
      title: `${line.className || "未设置班级"} · ${line.subjectName || "未设置课程"}`,
      tag: "待处理",
      detail: `${formatDate(line.date)} ${line.time || ""} · ${line.room || "未设置教室"} · 尚未上课，已计入工资`,
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
  const month = role === "teacher" ? defaultTeacherPayrollMonth() : currentSettlementMonth();
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
  const action = lesson.status !== "cancelled" ? statusTag(lesson.status) : statusTag(lesson.status);
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
  const cancelled = lesson.status === "cancelled";
  return `
    <tr>
      <td data-label="日期">${formatDate(lesson.date)}</td>
      <td data-label="时间">${lesson.time}</td>
      <td class="row-title" data-label="班级">${lesson.className}</td>
      <td data-label="课程">${lesson.course}</td>
      <td data-label="教室">${lesson.room}</td>
      <td data-label="课时">${lesson.units ?? 1}</td>
      <td data-label="计薪">${lessonPayableTag({ payable: !cancelled })}</td>
      <td class="muted" data-label="说明">${cancelled ? lesson.cancelReason || "已取消，不计薪" : "计入课时费"}</td>
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
  if (lesson.status === "cancelled") return lesson.cancelReason || "已取消，不计薪";
  return lesson.note || "计入课时费";
}

function allowanceText(lesson) {
  if (lesson.type === "regular") return `${lesson.units} 节 × ${state.rules.regularLessonRate} 元`;
  if (lesson.type === "morning" || lesson.type === "evening") return `${lesson.units} 节 × ${state.rules.selfStudyRate} 元`;
  return `${lesson.units} 节 × ${state.rules.weekendRate} 元`;
}

// 课次不再有需要教师操作的动作：排了就计薪，请假走审批。
// 这一列改成显示计薪结果——留一个点不动的按钮比没有按钮更让人困惑。
function actionCell(lesson) {
  if (lesson.status === "cancelled") {
    return `<span class="muted">${escapeHtml(lesson.cancelReason || "已取消，不计薪")}</span>`;
  }
  if (lesson.nonPayable) return `<span class="muted">固定日程，不计课时工资</span>`;
  return `<span class="muted">计入课时费</span>`;
}

function switchView(viewName) {
  if (!views[viewName]) return;
  if (!viewAllowed(viewName)) {
    showToast("当前账号无权访问该页面");
    return;
  }
  state.activeView = viewName;
  // 长页面之间切换时回到页面顶部；否则手机端从报表/排课页切到另一个模块会停在
  // 上一页的滚动高度，看起来像新页面缺了标题和上半部分内容。
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  render();
  // 审批中心首次进入时按需加载模板与列表
  if (viewName === "approvalSettings" && backendMode() && !oaAdminState.templates.length) {
    loadOaAdminTemplates();
  }
  if (viewName === "dataPorting" && backendMode()) {
    if (!resourceLedgerState.ledger && !resourceLedgerState.loading) loadResourceLedger();
  }
  if (viewName === "academicCalendar" && backendMode()) {
    if (!academicCalendarState.loaded && !academicCalendarState.loading) loadAcademicCalendar();
  }
  if (viewName === "attendanceManagement" && backendMode()) {
    if (!attendanceUploadState.loaded && !attendanceUploadState.loading) loadAttendanceUploads();
  }
  if (viewName === "transportRoutes" && backendMode()) {
    if (!transportRouteState.loaded && !transportRouteState.loading) loadTransportRoutes();
  }
  // 统计报表首次进入时按需加载，避免每次 render 都打接口
  if (viewName === "reports" && backendMode()) {
    if (!weeklyWorkloadState.report && !weeklyWorkloadState.loading) loadWeeklyWorkload();
    if (canViewAnnualSalaryReport() && !annualSalaryState.report && !annualSalaryState.loading) loadAnnualSalary();
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
      if (Array.isArray(payload.account.roles) ? payload.account.roles.includes("teacher") : payload.account.role === "teacher") {
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
        if (canExportAllPayrollDetails()) await loadPayrollRules();
      }
      if (["admin", "division_head", "principal"].includes(payload.account.role)) {
        schedulingBackendState = { loaded: false, loading: false, error: "", job: null, precheck: null };
        termManagementState = { terms: [], currentTerm: null, loaded: false, loading: false, error: "" };
        resetPersonnelPage();
        applySchedulingScopeForAccount(currentAccount());
        await loadTermContext();
        await loadBackendSchedulingContext();
      }
      if (payload.account.role === "system_admin") {
        resetPersonnelPage();
        await loadPersonnelPage({ page: 1 });
      }
      await loadBackendNotifications();
      render();
      loginButton.disabled = false;
      return;
    } catch (error) {
      loginButton.disabled = false;
      // 通过 http(s) 打开时，登录必须以服务端认证结果为准。过去这里会在 401 后
      // 悄悄切回内置 Demo 账号，造成“页面能进去、实际却在看浏览器假数据”的假成功。
      // 纯文件模式仍由下方的离线账号逻辑支持演示。
      document.querySelector("#loginError").textContent = error.message || "后端登录失败";
      return;
    }
  }

  authenticateDemo(trimmedUsername, password);
  loginButton.disabled = false;
}

async function quickLoginDemo(username) {
  // 总校财务已由真实名册人员接管，继续提交旧 finance / 123456 既会失败，
  // 更不能把真实临时口令写进浏览器代码。点击时只帮用户填入正式用户名，
  // 密码仍由本人输入；学校内网环境会整体隐藏这一开发区。
  if (apiEnabled() && username === "finance") {
    document.querySelector("#loginUsername").value = "fy260907-0019";
    document.querySelector("#loginPassword").value = "";
    document.querySelector("#loginError").textContent = "总校财务账号已由诸新龙接管，请输入本人当前密码";
    document.querySelector("#loginPassword").focus();
    return;
  }
  const password = "123456";
  document.querySelector("#loginUsername").value = username;
  document.querySelector("#loginPassword").value = password;
  await authenticate(username, password);
}

function logout() {
  sessionAccountId = "";
  teacherConfirmationMonth = "";
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
//   fields: [{ name, label, type='text'|'textarea'|'select'|'file', value, placeholder,
//              required, readonly, multiple, accept, options:[{value,label}], rows, hint }]
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
    onChange = null,
    validate = null,
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
        } else if (field.type === "multiselect") {
          // 多选用勾选列表而非 <select multiple>：后者要按住 Ctrl 才能多选，
          // 教务不会知道这一点，最后只抄送出去一个人。
          const selectedValues = new Set((Array.isArray(field.value) ? field.value : []).map((value) => String(value)));
          control = `<div class="dialog-checklist" data-dialog-field="${escapeHtml(field.name)}" data-multi="1">${(field.options || [])
            .map(
              (opt, i) =>
                `<label class="dialog-check"><input type="checkbox" value="${escapeHtml(opt.value)}" ${
                  selectedValues.has(String(opt.value)) || (!selectedValues.size && i === 0 && field.autoFirst) ? "checked" : ""
                } /><span>${escapeHtml(opt.label)}</span></label>`,
            )
            .join("")}</div>`;
        } else if (field.type === "select") {
          control = `<select id="${id}" data-dialog-field="${escapeHtml(field.name)}">${(field.options || [])
            .map((opt) => `<option value="${escapeHtml(opt.value)}" ${opt.value === field.value ? "selected" : ""}>${escapeHtml(opt.label)}</option>`)
            .join("")}</select>`;
        } else if (field.type === "file") {
          control = `<input id="${id}" data-dialog-field="${escapeHtml(field.name)}" type="file" ${
            field.accept ? `accept="${escapeHtml(field.accept)}"` : ""
          } ${field.multiple ? "multiple" : ""} />`;
        } else {
          control = `<input id="${id}" data-dialog-field="${escapeHtml(field.name)}" type="${field.type || "text"}" value="${escapeHtml(field.value ?? "")}" placeholder="${escapeHtml(field.placeholder || "")}" ${
            field.readonly ? 'readonly aria-readonly="true"' : ""
          } ${field.step !== undefined ? `step="${escapeHtml(field.step)}"` : ""} />`;
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
        if (el.dataset.multi) {
          values[el.dataset.dialogField] = [...el.querySelectorAll("input:checked")].map((box) => box.value);
          return;
        }
        if (el.type === "file") {
          values[el.dataset.dialogField] = [...(el.files || [])];
          return;
        }
        values[el.dataset.dialogField] = String(el.value || "").trim();
      });
      return values;
    };

    if (onChange) {
      const emitChange = (event) => onChange({ values: collect(), root, event });
      root.querySelector(".dialog-body")?.addEventListener("input", emitChange);
      root.querySelector(".dialog-body")?.addEventListener("change", emitChange);
      onChange({ values: collect(), root, event: null });
    }

    const submit = async () => {
      const values = collect();
      const validationMessage = validate ? validate(values) : "";
      if (validationMessage) {
        errorEl.textContent = validationMessage;
        return;
      }
      const missing = fields.find((field) => {
        if (!field.required) return false;
        const value = values[field.name];
        // 多选返回数组，[] 是假值判断不出来的
        return Array.isArray(value) ? value.length === 0 : !value;
      });
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
      } else if (
        event.key === "Enter" &&
        !event.shiftKey &&
        event.target.tagName !== "TEXTAREA" &&
        event.target.type !== "file"
      ) {
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
});

document.addEventListener("change", (event) => {
  if (event.target.matches("#hrNew-orgUnitId")) {
    syncLifeTeacherPositionChoices("#hrNew-orgUnitId", "#hrNew-positionId");
  } else if (event.target.matches("#hrEmp-orgUnitId")) {
    syncLifeTeacherPositionChoices("#hrEmp-orgUnitId", "#hrEmp-positionId");
  } else if (event.target.matches("#hrFlow-orgUnitId")) {
    syncLifeTeacherPositionChoices("#hrFlow-orgUnitId", "#hrFlow-positionId");
  } else if (event.target.matches("#hrFlow-targetOrgUnitId")) {
    syncLifeTeacherPositionChoices("#hrFlow-targetOrgUnitId", "#hrFlow-targetPositionId");
  }
});

document.addEventListener("click", async (event) => {
  const demoLoginButton = event.target.closest("[data-demo-login]");
  if (demoLoginButton) {
    await quickLoginDemo(demoLoginButton.dataset.demoLogin);
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

  const editTransportRouteButton = event.target.closest("[data-edit-transport-route]");
  if (editTransportRouteButton) {
    const route = (transportRouteState.routes || []).find((item) => item.id === editTransportRouteButton.dataset.editTransportRoute);
    if (route) await openTransportRouteDialog(route);
    return;
  }

  const publishTransportRouteButton = event.target.closest("[data-publish-transport-route]");
  if (publishTransportRouteButton) {
    await publishTransportRoute(publishTransportRouteButton.dataset.publishTransportRoute);
    return;
  }

  const reviewTransportTransferButton = event.target.closest("[data-review-transport-transfer]");
  if (reviewTransportTransferButton) {
    await reviewTransportTransfer(
      reviewTransportTransferButton.dataset.reviewTransportTransfer,
      reviewTransportTransferButton.dataset.approved === "true",
    );
    return;
  }

  const lifeRouteLegButton = event.target.closest("[data-life-route-leg]");
  if (lifeRouteLegButton) {
    const lesson = state.lessons.find((item) => item.backendId === lifeRouteLegButton.dataset.lifeRouteLeg);
    if (lesson) await operateLifeRouteLeg(lesson, lifeRouteLegButton.dataset.lifeRouteAction);
    return;
  }

  const lifeRouteTransferButton = event.target.closest("[data-life-route-transfer]");
  if (lifeRouteTransferButton) {
    const lesson = state.lessons.find((item) => item.backendId === lifeRouteTransferButton.dataset.lifeRouteTransfer);
    if (lesson) await openLifeRouteTransferDialog(lesson);
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

// 登录页快捷键：Alt/Option + T 直接登录演示老师账号。
// 使用 event.code 避免 macOS Option+T 产生特殊字符后 event.key 不再是 "t"。
document.addEventListener("keydown", (event) => {
  if (event.repeat || !event.altKey || event.ctrlKey || event.metaKey || event.code !== "KeyT") return;
  const loginScreen = document.querySelector("#loginScreen");
  if (!loginScreen || loginScreen.classList.contains("is-hidden")) return;
  event.preventDefault();
  quickLoginDemo("teacher_primary").catch((error) => {
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
  transportRoutes: '<path d="M3 18h18"/><path d="M5 18V9l7-5 7 5v9"/><path d="M9 18v-5h6v5"/><path d="M3 9h18"/>',
  adminScheduleOverview: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  academicCalendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3M8 18h8"/>',
  attendanceManagement: '<path d="M7 3h10l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M17 3v5h5M9 13l2 2 4-4M9 18h6"/>',
  personnel: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16.5 4.9a3.5 3.5 0 0 1 0 6.2M17.8 14.3c2 .8 3.2 2.6 3.2 5.7"/>',
  teacherImport: '<path d="M12 15V4m0 0 4 4m-4-4L8 8"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  notifications: '<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
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
  ledgers: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11M15 9v11"/>',
  monitoring: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
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

const HR_MANAGEMENT_LEVELS = [
  ["senior", "高层"],
  ["middle", "中层"],
  ["ordinary", "普通"],
];

const HR_EMPLOYMENT_TYPES = [
  ["normal", "正常"],
  ["agreement", "协议"],
];

const HR_WORK_STATUSES = [
  ["employed", "就业"],
  ["standby", "待岗"],
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
  { key: "homeroomStudentCount", label: "班主任负责学生总数", type: "number" },
  { key: "gradeClassCount", label: "年级主任负责班级数", type: "number" },
  { key: "lifeTeacherKind", label: "生活老师类别", type: "select" },
  { key: "lifeTeacherStudentCount", label: "生活老师负责学生总数", type: "number" },
  { key: "lifeManager", label: "生活主管", type: "boolean" },
  { key: "buildingLead", label: "栋长", type: "boolean" },
  { key: "nightShiftLead", label: "夜班组长", type: "boolean" },
  { key: "primaryDayShift", label: "一年级／六年级白班", type: "boolean" },
];

const LIFE_TEACHER_ROLE_KEYS = new Set(["lifeTeacherKind", "lifeTeacherStudentCount", "lifeManager", "buildingLead", "nightShiftLead", "primaryDayShift"]);

function lifeTeacherKindOptions(stageId = "", selected = "") {
  const options = stageId === "primary"
    ? [["lower", "低段生活老师"], ["upper", "高段生活老师"], ["night", "门岗／夜班生活老师"]]
    : [["standard", "生活老师"], ["night", "门岗／夜班生活老师"]];
  const fallback = options.some(([value]) => value === selected) ? selected : options[0]?.[0] || "";
  return options.map(([value, label]) => `<option value="${value}" ${value === fallback ? "selected" : ""}>${label}</option>`).join("");
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

function hrManagementLevelOptions(selected = "ordinary") {
  const normalized = HR_MANAGEMENT_LEVELS.some(([value]) => value === selected) ? selected : "ordinary";
  return HR_MANAGEMENT_LEVELS.map(
    ([value, label]) => `<option value="${value}" ${value === normalized ? "selected" : ""}>${label}</option>`,
  ).join("");
}

function hrManagementLevelTag(level = "ordinary", label = "") {
  const normalized = HR_MANAGEMENT_LEVELS.some(([value]) => value === level) ? level : "ordinary";
  const text = label || HR_MANAGEMENT_LEVELS.find(([value]) => value === normalized)?.[1] || "普通";
  return `<span class="management-level-tag ${normalized}">${escapeHtml(text)}</span>`;
}

function hrEmploymentTypeOptions(selected = "normal") {
  const normalized = HR_EMPLOYMENT_TYPES.some(([value]) => value === selected) ? selected : "normal";
  return HR_EMPLOYMENT_TYPES.map(
    ([value, label]) => `<option value="${value}" ${value === normalized ? "selected" : ""}>${label}</option>`,
  ).join("");
}

function hrEmploymentTypeTag(type = "normal", label = "") {
  const normalized = HR_EMPLOYMENT_TYPES.some(([value]) => value === type) ? type : "normal";
  const text = label || HR_EMPLOYMENT_TYPES.find(([value]) => value === normalized)?.[1] || "正常";
  return `<span class="employment-type-tag ${normalized}">雇佣 · ${escapeHtml(text)}</span>`;
}

function hrWorkStatusOptions(status = "employed") {
  const normalized = HR_WORK_STATUSES.some(([value]) => value === status) ? status : "employed";
  return HR_WORK_STATUSES.map(
    ([value, label]) => `<option value="${value}" ${value === normalized ? "selected" : ""}>${label}</option>`,
  ).join("");
}

function hrWorkStatusTag(status = "employed", label = "") {
  const normalized = HR_WORK_STATUSES.some(([value]) => value === status) ? status : "employed";
  const text = label || HR_WORK_STATUSES.find(([value]) => value === normalized)?.[1] || "就业";
  return `<span class="work-status-tag ${normalized}">工作 · ${escapeHtml(text)}</span>`;
}

function canManagePersonnelTags() {
  return currentRole() === "system_admin";
}

function hrPersonnelTagsHtml(tags = [], { compact = false } = {}) {
  const values = Array.isArray(tags) ? tags.filter((tag) => tag?.name) : [];
  if (!values.length) return compact ? "" : `<span class="muted">未设置</span>`;
  return values
    .map(
      (tag) =>
        `<span class="personnel-custom-tag ${escapeHtml(tag.color || "blue")} ${compact ? "compact" : ""}">${escapeHtml(tag.name)}</span>`,
    )
    .join("");
}

// 收集兼岗任命勾选结果，随档案保存一并提交
function hrTeacherRolesFromInputs() {
  const roles = {};
  HR_TEACHER_ROLE_FIELDS.forEach((field) => {
    if (field.type === "number") {
      const input = document.querySelector(`[data-hr-role-number="${field.key}"]`);
      roles[field.key] = Number(input?.value || 0);
    } else if (field.type === "select") {
      const input = document.querySelector(`[data-hr-role-select="${field.key}"]`);
      roles[field.key] = input?.value || "";
    } else {
      const input = document.querySelector(`[data-hr-role="${field.key}"]`);
      roles[field.key] = Boolean(input?.checked);
    }
  });
  return roles;
}

function syncHrAppointmentDependentFields(container = document) {
  const homeroom = container.querySelector('[data-hr-role="homeroom"]');
  const gradeHead = container.querySelector('[data-hr-role="gradeHead"]');
  const homeroomField = container.querySelector('[data-hr-homeroom-students]');
  const gradeHeadField = container.querySelector('[data-hr-grade-head-classes]');
  if (homeroomField) homeroomField.hidden = !homeroom?.checked;
  if (gradeHeadField) gradeHeadField.hidden = !gradeHead?.checked;
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
  personnel_tag_create: "新增人员标签",
  personnel_tag_delete: "删除人员标签",
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
let personnelTagState = { tags: [], loaded: false, loading: false, error: "" };
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

async function loadPersonnelTags() {
  if (!canManagePersonnelTags() || !backendMode()) return;
  personnelTagState = { ...personnelTagState, loading: true, error: "" };
  render();
  try {
    const result = await apiRequest("/api/hr/personnel-tags");
    personnelTagState = { tags: result.tags || [], loaded: true, loading: false, error: "" };
  } catch (error) {
    personnelTagState = { ...personnelTagState, loaded: true, loading: false, error: error.message || "加载失败" };
  }
  render();
}

async function loadHrOrgData() {
  hrOrgState = { ...hrOrgState, loading: true, error: "" };
  render();
  try {
    // 学部负责人和总校人事行政均无薪资模板权限，避免 403 拖垮整个组织数据加载。
    const canSeeTemplates = ["hr", "finance"].includes(currentRole());
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
        `<option value="${escapeHtml(position.id)}" data-life-teacher="${position.id === "POS-LIFE-TEACHER" || position.lifeTeacher ? "1" : "0"}" ${position.id === selected ? "selected" : ""}>${escapeHtml(position.name)}</option>`,
    )
    .join("");
}

function hrStageIdForOrgUnit(orgUnitId = "") {
  const byId = new Map((hrOrgState.units || []).map((unit) => [unit.id, unit]));
  let unit = byId.get(orgUnitId);
  const seen = new Set();
  while (unit && !seen.has(unit.id)) {
    if (unit.stageId) return unit.stageId;
    seen.add(unit.id);
    unit = byId.get(unit.parentId);
  }
  return "";
}

function syncLifeTeacherPositionChoices(orgSelector, positionSelector) {
  const orgSelect = document.querySelector(orgSelector);
  const positionSelect = document.querySelector(positionSelector);
  if (!orgSelect || !positionSelect) return;
  const allowLifeTeacher = ["primary", "middle", "high"].includes(hrStageIdForOrgUnit(orgSelect.value));
  Array.from(positionSelect.options).forEach((option) => {
    if (option.dataset.lifeTeacher !== "1") return;
    option.hidden = !allowLifeTeacher;
    option.disabled = !allowLifeTeacher;
  });
  if (!allowLifeTeacher && positionSelect.selectedOptions[0]?.dataset.lifeTeacher === "1") {
    const fallback = Array.from(positionSelect.options).find((option) => !option.disabled);
    if (fallback) positionSelect.value = fallback.value;
  }
}

function hrCanViewEmployees() {
  return isHrManagerRole() || currentRole() === "division_head";
}

function renderPersonnelTagConfig() {
  if (state.activeView !== "personnelTagConfig" || !canManagePersonnelTags()) return;
  if (!backendMode()) return;
  const listEl = document.querySelector("#personnelTagConfigList");
  if (!personnelTagState.loaded && !personnelTagState.loading) {
    loadPersonnelTags();
    return;
  }
  if (personnelTagState.error) {
    listEl.innerHTML = loadErrorHtml(personnelTagState.error, "personnelTags");
    return;
  }
  if (personnelTagState.loading && !personnelTagState.tags.length) {
    listEl.innerHTML = skeletonListHtml(3);
    return;
  }
  if (!personnelTagState.tags.length) {
    listEl.innerHTML = `<div class="empty-state">还没有自定义标签。可新增如“骨干教师”“返聘”“外籍教师”等标签。</div>`;
    return;
  }
  listEl.innerHTML = personnelTagState.tags
    .map(
      (tag) => `
        <div class="personnel-tag-config-row">
          <span class="personnel-custom-tag ${escapeHtml(tag.color || "blue")}">${escapeHtml(tag.name)}</span>
          <button class="mini-button danger" data-personnel-tag-delete="${escapeHtml(tag.id)}" data-personnel-tag-name="${escapeHtml(tag.name)}" type="button">删除</button>
        </div>
      `,
    )
    .join("");
}

function renderHrEmployees() {
  if (state.activeView !== "hrEmployees" || !hrCanViewEmployees()) return;
  if (!backendMode()) return;
  if (!hrEmployeePage.loaded && !hrEmployeePage.loading) {
    loadHrEmployeePage();
    return;
  }
  if (!hrOrgState.loaded && !hrOrgState.loading) loadHrOrgData();
  if (canManagePersonnelTags() && !personnelTagState.loaded && !personnelTagState.loading) loadPersonnelTags();

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
            <div class="hr-employee-tags">
              ${hrManagementLevelTag(employee.managementLevel, employee.managementLevelLabel)}
              ${employee.teacherId ? hrEmploymentTypeTag(employee.employmentType, employee.employmentTypeLabel) : ""}
              ${hrWorkStatusTag(employee.workStatus, employee.workStatusLabel)}
              ${hrPersonnelTagsHtml(employee.tags, { compact: true })}
              <span class="${hrStatusPillClass(employee.status)}">${escapeHtml(employee.statusLabel)}</span>
            </div>
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
  syncLifeTeacherPositionChoices("#hrNew-orgUnitId", "#hrNew-positionId");
  syncLifeTeacherPositionChoices("#hrEmp-orgUnitId", "#hrEmp-positionId");
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
          ${currentRole() === "system_admin" ? `<label class="field-label">人员层级<select id="hrNew-managementLevel">${hrManagementLevelOptions()}</select></label>` : ""}
          ${currentRole() === "system_admin" ? `<label class="field-label">工作状态<select id="hrNew-workStatus">${hrWorkStatusOptions()}</select><small>待岗人员按最低工资标准的 80% 加住房补贴结算。</small></label>` : ""}
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
  const canManageManagementLevel = currentRole() === "system_admin";
  const canManageEmployment = currentRole() === "system_admin" && Boolean(employee.teacherId);
  if (canManagePersonnelTags() && !personnelTagState.loaded && !personnelTagState.loading) loadPersonnelTags();
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
          <div class="hr-field"><span>人员层级</span>${hrManagementLevelTag(employee.managementLevel, employee.managementLevelLabel)}</div>
          ${employee.teacherId ? `<div class="hr-field"><span>雇佣类型</span>${hrEmploymentTypeTag(employee.employmentType, employee.employmentTypeLabel)}</div>` : ""}
          ${employee.isLifeTeacher ? `<div class="hr-field"><span>生活老师类别</span><strong>${escapeHtml((employee.teacherRoles?.lifeTeacherKind === "lower" ? "低段生活老师" : employee.teacherRoles?.lifeTeacherKind === "upper" ? "高段生活老师" : employee.teacherRoles?.lifeTeacherKind === "night" ? "门岗／夜班生活老师" : "生活老师"))}</strong></div>
          <div class="hr-field"><span>负责学生数</span><strong>${Number(employee.teacherRoles?.lifeTeacherStudentCount || 0)} 人</strong></div>` : ""}
          <div class="hr-field"><span>工作状态</span>${hrWorkStatusTag(employee.workStatus, employee.workStatusLabel)}</div>
          <div class="hr-field"><span>自定义标签</span><div class="hr-custom-tag-list">${hrPersonnelTagsHtml(employee.tags)}</div></div>
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
        <div class="hr-detail-tags">
          ${hrManagementLevelTag(employee.managementLevel, employee.managementLevelLabel)}
          ${employee.teacherId ? hrEmploymentTypeTag(employee.employmentType, employee.employmentTypeLabel) : ""}
          ${hrWorkStatusTag(employee.workStatus, employee.workStatusLabel)}
          ${hrPersonnelTagsHtml(employee.tags, { compact: true })}
          <span class="${hrStatusPillClass(employee.status)}">${escapeHtml(employee.statusLabel)}</span>
        </div>
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
        ${
          canManageManagementLevel
            ? `<label class="field-label">人员层级<select id="hrEmp-managementLevel">${hrManagementLevelOptions(employee.managementLevel)}</select></label>`
            : `<div class="hr-field"><span>人员层级</span>${hrManagementLevelTag(employee.managementLevel, employee.managementLevelLabel)}</div>`
        }
        ${
          employee.teacherId
            ? canManageEmployment
              ? `<label class="field-label">雇佣类型<select id="hrEmp-employmentType">${hrEmploymentTypeOptions(employee.employmentType)}</select></label>
                 <label class="field-label">协议月薪（元／月）<input id="hrEmp-agreementMonthlySalary" type="number" min="0" step="0.01" value="${Number(employee.agreementMonthlySalary || 0)}" /><small>仅协议教师填写；正常教师按现有薪资规则结算。</small></label>`
              : `<div class="hr-field"><span>雇佣类型</span>${hrEmploymentTypeTag(employee.employmentType, employee.employmentTypeLabel)}</div>`
            : ""
        }
        ${
          currentRole() === "system_admin"
            ? `<label class="field-label">工作状态<select id="hrEmp-workStatus">${hrWorkStatusOptions(employee.workStatus)}</select><small>待岗按最低工资标准的 80% 加住房补贴结算。</small></label>`
            : `<div class="hr-field"><span>工作状态</span>${hrWorkStatusTag(employee.workStatus, employee.workStatusLabel)}</div>`
        }
        <label class="field-label">证件号（填写即更新，加密存储）<input id="hrEmp-idCard" placeholder="${employee.hasIdCard ? "已录入，填写新值可替换" : "未录入"}" /></label>
        <label class="field-label">银行卡号（填写即更新，加密存储）<input id="hrEmp-bankCard" placeholder="${employee.hasBankCard ? "已录入，填写新值可替换" : "未录入"}" /></label>
      </div>
      <p class="action-hint">职称与学历是人事评定/证书事实，决定基本工资档与学历补贴；财务不可修改。</p>

      ${
        canManagePersonnelTags()
          ? `<div class="hr-detail-section">
              <div class="hr-section-heading">
                <div>
                  <h3>自定义标签</h3>
                  <p class="action-hint">可多选，仅用于人员识别，不参与薪资、排课和审批计算。</p>
                </div>
                <button class="mini-button" data-personnel-tag-config-open type="button">配置标签</button>
              </div>
              ${
                personnelTagState.loading && !personnelTagState.loaded
                  ? `<p class="muted">标签加载中…</p>`
                  : personnelTagState.error
                    ? `<p class="muted">${escapeHtml(personnelTagState.error)}</p>`
                    : personnelTagState.tags.length
                      ? `<div class="checkbox-grid hr-personnel-tag-grid">
                          ${personnelTagState.tags
                            .map(
                              (tag) => `
                                <label>
                                  <input data-hr-employee-tag="${escapeHtml(tag.id)}" type="checkbox" ${employee.tagIds?.includes(tag.id) ? "checked" : ""} />
                                  <span class="personnel-custom-tag ${escapeHtml(tag.color || "blue")}">${escapeHtml(tag.name)}</span>
                                </label>
                              `,
                            )
                            .join("")}
                        </div>`
                      : `<p class="muted">暂无标签，请先配置。</p>`
              }
            </div>`
          : `<div class="hr-detail-section"><h3>自定义标签</h3><div class="hr-custom-tag-list">${hrPersonnelTagsHtml(employee.tags)}</div></div>`
      }

      <div class="hr-detail-section hr-appointment-section">
        <div class="hr-appointment-heading">
          <div>
            <h3>兼岗任命</h3>
            <p class="action-hint">由人事任命并直接带入兼岗津贴；财务只读。</p>
          </div>
          <span class="hr-appointment-note">可多选</span>
        </div>

        ${
          employee.isLifeTeacher
            ? `<section class="hr-appointment-card homeroom">
                <div class="hr-appointment-card-head">
                  <div>
                    <h4>生活老师工资依据</h4>
                    <p>负责学生人数由人事确认，和班主任人数一样直接作为本学期工资计算依据。</p>
                  </div>
                  <span class="hr-appointment-note">小学／初中／高中</span>
                </div>
                <div class="hr-form-grid">
                  <label class="field-label">生活老师类别
                    <select data-hr-role-select="lifeTeacherKind">${lifeTeacherKindOptions(employee.stageId, employee.teacherRoles?.lifeTeacherKind)}</select>
                    <small>决定对应学部的考核工资基准。</small>
                  </label>
                  <label class="field-label">生活老师负责学生总数
                    <input data-hr-role-number="lifeTeacherStudentCount" type="number" min="0" value="${Number(employee.teacherRoles?.lifeTeacherStudentCount || 0)}" />
                    <small>如负责多个楼层、宿舍或班级，请填写实际负责学生合计。</small>
                  </label>
                </div>
                <p>此人数仅用于生活老师工作量工资；标准、封顶额均由总校财务在“薪资配置”统一维护。</p>
              </section>
              <section class="hr-appointment-card">
                <div class="hr-appointment-card-head compact"><div><h4>生活老师兼岗</h4><p>勾选实际任命的兼岗，系统按所属学部标准计算津贴。</p></div></div>
                <div class="hr-appointment-role-grid">
                  ${HR_TEACHER_ROLE_FIELDS.filter((field) => field.type === "boolean" && LIFE_TEACHER_ROLE_KEYS.has(field.key)).map((field) => `
                    <label class="hr-appointment-toggle"><input data-hr-role="${escapeHtml(field.key)}" type="checkbox" ${employee.teacherRoles?.[field.key] ? "checked" : ""} /><span>${escapeHtml(field.label)}</span></label>
                  `).join("")}
                </div>
              </section>`
            : `<section class="hr-appointment-card homeroom">
          <div class="hr-appointment-card-head">
            <div>
              <h4>班主任</h4>
              <p>勾选后，系统按该班主任负责的学生总数计算班主任津贴。</p>
            </div>
            <label class="hr-appointment-toggle featured">
              <input data-hr-role="homeroom" type="checkbox" ${employee.teacherRoles?.homeroom ? "checked" : ""} />
              <span>任命为班主任</span>
            </label>
          </div>
          <div class="hr-appointment-dependent" data-hr-homeroom-students ${employee.teacherRoles?.homeroom ? "" : "hidden"}>
            <label class="field-label">班主任负责学生总数
              <input data-hr-role-number="homeroomStudentCount" type="number" min="0" value="${Number(employee.teacherRoles?.homeroomStudentCount || 0)}" />
              <small>如负责多个班级，请填写所有负责班级的学生合计。</small>
            </label>
            <p>此人数仅用于班主任津贴，不会影响教师、年级主任或其他岗位的核算。</p>
          </div>
        </section>

        <section class="hr-appointment-card">
          <div class="hr-appointment-card-head compact">
            <div>
              <h4>其他教学与管理职务</h4>
              <p>选择实际任命的岗位；可同时兼任多个职务。</p>
            </div>
          </div>
          <div class="hr-appointment-role-grid">
            ${HR_TEACHER_ROLE_FIELDS.filter((field) => field.type === "boolean" && field.key !== "homeroom" && !LIFE_TEACHER_ROLE_KEYS.has(field.key))
              .map(
                (field) => `
                  <label class="hr-appointment-toggle">
                    <input data-hr-role="${escapeHtml(field.key)}" type="checkbox" ${employee.teacherRoles?.[field.key] ? "checked" : ""} />
                    <span>${escapeHtml(field.label)}</span>
                  </label>
                `,
              )
              .join("")}
          </div>
          <div class="hr-appointment-dependent" data-hr-grade-head-classes ${employee.teacherRoles?.gradeHead ? "" : "hidden"}>
            <label class="field-label">年级主任负责班级数
              <input data-hr-role-number="gradeClassCount" type="number" min="0" value="${Number(employee.teacherRoles?.gradeClassCount || 0)}" />
              <small>仅在任命为年级主任时填写，用于按班级数计算年级主任津贴。</small>
            </label>
            <p>未任命年级主任时，该数字不会参与薪资计算。</p>
          </div>
        </section>`
        }
      </div>

      ${hrSensitiveRow("证件号", employee.idCardMasked, employee.hasIdCard, "idCard")}
      ${hrSensitiveRow("银行卡号", employee.bankCardMasked, employee.hasBankCard, "bankCard")}
      <p class="action-hint" id="hrSensitiveReveal"></p>

      <div class="action-row">
        <button class="primary-button compact-button" data-hr-emp-save type="button">保存档案</button>
      </div>

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
              ${stageLabel(unit.stageId) ? `<span class="hr-badge stage">排课学段：${escapeHtml(stageLabel(unit.stageId))}</span>` : ""}
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

  const canSeePayload = currentRole() === "finance";
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

function myAccountSecurityHtml() {
  if (!backendMode()) {
    return `
      <section class="my-account-security">
        <div class="my-account-security-head"><h3>登录安全</h3></div>
        <p>当前未连接账户服务，暂不能修改密码。</p>
      </section>
    `;
  }
  return `
    <section class="my-account-security">
      <div class="my-account-security-head">
        <div>
          <h3>登录安全</h3>
          <p>修改密码后，当前账号会退出登录，需使用新密码重新登录。</p>
        </div>
        <button class="mini-button" id="myAccountChangePassword" type="button">修改密码</button>
      </div>
    </section>
  `;
}

async function changeOwnPasswordFromAccount() {
  if (!backendMode()) {
    showToast("当前未连接账户服务，暂不能修改密码");
    return;
  }
  const result = await openDialog({
    title: "修改密码",
    description: "为保障账户安全，请先验证当前密码。新密码至少 8 位，且需包含两类字符。",
    confirmText: "确认修改",
    fields: [
      { name: "currentPassword", label: "当前密码", type: "password", required: true, autocomplete: "current-password" },
      { name: "newPassword", label: "新密码", type: "password", required: true, autocomplete: "new-password" },
      { name: "confirmPassword", label: "确认新密码", type: "password", required: true, autocomplete: "new-password" },
    ],
    validate: (values) => {
      if (values.newPassword !== values.confirmPassword) return "两次输入的新密码不一致";
      if (values.newPassword === values.currentPassword) return "新密码不能与当前密码相同";
      return "";
    },
    onConfirm: async (values) => {
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: { currentPassword: values.currentPassword, newPassword: values.newPassword },
      });
    },
  });
  if (!result) return;

  // 服务端已撤销该账号的全部会话；前端同步退出，避免页面继续带着失效 token。
  const username = currentAccount().username || "";
  sessionAccountId = "";
  teacherConfirmationMonth = "";
  clearSession();
  resetOaState();
  resetTeacherWorkloadState();
  resetAttendanceRecordState();
  resetTeacherPayrollState();
  resetFinanceTeacherDetailState();
  resetPersonnelPage();
  resetHrFrontendStates();
  clearBackendSession();
  document.querySelector("#loginUsername").value = username;
  document.querySelector("#loginPassword").value = "";
  render();
  showToast("密码已修改，请使用新密码重新登录");
}

function renderMyHrProfile() {
  if (state.activeView !== "myHrProfile") return;
  const account = currentAccount();
  const cardEl = document.querySelector("#myHrProfileCard");
  const changeFormEl = document.querySelector("#myHrChangeForm");
  const requestListEl = document.querySelector("#myHrRequestList");
  const accountTitle = account.title || roleTitle(account.role);
  const accountRolesText = accountRoles(account).map(roleTitle).join(" · ");
  cardEl.innerHTML = `
    <div class="my-hr-hero">
      <div class="my-hr-avatar">${escapeHtml((account.name || "?").slice(0, 1))}</div>
      <div>
        <h3>${escapeHtml(account.name || accountTitle)}</h3>
        <span>${escapeHtml(account.username || account.id)} · ${escapeHtml(accountTitle)}</span>
      </div>
      <span class="status-pill done">当前登录</span>
    </div>
    <div class="hr-form-grid readonly">
      <div class="hr-field"><span>登录账号</span><strong>${escapeHtml(account.username || "—")}</strong></div>
      <div class="hr-field"><span>主岗位</span><strong>${escapeHtml(accountTitle)}</strong></div>
      <div class="hr-field"><span>账号权限</span><strong>${escapeHtml(accountRolesText || roleTitle(account.role))}</strong></div>
      <div class="hr-field"><span>所属部门</span><strong>${escapeHtml(account.department || "未设置")}</strong></div>
    </div>
  `;

  // 所有账号都可以在账户页修改自己的登录密码；人事档案内容只对任课教师显示。
  if (!isTeacherAccount()) {
    changeFormEl.innerHTML = myAccountSecurityHtml();
    requestListEl.innerHTML = "";
    return;
  }
  if (!backendMode()) {
    changeFormEl.innerHTML = myAccountSecurityHtml();
    requestListEl.innerHTML = "";
    return;
  }
  if (!myHrProfileState.loaded && !myHrProfileState.loading) {
    changeFormEl.innerHTML = `${myAccountSecurityHtml()}<div class="empty-state">正在读取人事档案...</div>`;
    requestListEl.innerHTML = "";
    loadMyHrProfile();
    return;
  }
  if (myHrProfileState.error) {
    changeFormEl.innerHTML = `${myAccountSecurityHtml()}<div class="empty-state">${escapeHtml(myHrProfileState.error)}</div>`;
    requestListEl.innerHTML = "";
    return;
  }
  const employee = myHrProfileState.data?.employee;
  if (!employee) {
    changeFormEl.innerHTML = `${myAccountSecurityHtml()}<div class="empty-state">暂未建立人事档案，请联系人事专员。</div>`;
    requestListEl.innerHTML = "";
    return;
  }

  cardEl.insertAdjacentHTML(
    "beforeend",
    `
      <div class="hr-form-grid readonly">
        <div class="hr-field"><span>人事状态</span><strong>${escapeHtml(employee.statusLabel)}</strong></div>
        <div class="hr-field"><span>入职日期</span><strong>${escapeHtml(employee.hiredAt || "—")}</strong></div>
        <div class="hr-field"><span>证件号</span><strong>${escapeHtml(employee.idCardMasked || "未录入")}</strong></div>
        <div class="hr-field"><span>银行卡</span><strong>${escapeHtml(employee.bankCardMasked || "未录入")}</strong></div>
      </div>
    `,
  );

  const editing = Boolean(myHrProfileState.editing);
  changeFormEl.innerHTML = `
    ${myAccountSecurityHtml()}
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
  const requests = myHrProfileState.data?.changeRequests || [];
  requestListEl.innerHTML = `
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
  oaAdminState = { templates: [], approverRoles: [], approverAccounts: [], fieldTypes: [], loading: false, error: "" };
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
  executing: "warning",
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
          ${item.canAct || item.canExecute ? `<span class="approval-row-flag">${item.canExecute ? "待执行" : "待处理"}</span>` : ""}
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
  const todoTab = document.querySelector('[data-oa-scope="todo"]');
  if (todoTab) {
    const todoCount = Number(oaState.todoCount || 0);
    todoTab.innerHTML = `待我处理${todoCount ? ` <span class="approval-tab-badge" aria-label="${todoCount} 项待我处理">${todoCount > 99 ? "99+" : todoCount}</span>` : ""}`;
    todoTab.classList.toggle("has-unread", todoCount > 0);
  }
  const ccTab = document.querySelector('[data-oa-scope="cc"]');
  if (ccTab) {
    const unreadCc = unreadOaCcNoticeCount();
    ccTab.innerHTML = `抄送我的${unreadCc ? ` <span class="approval-tab-badge" aria-label="${unreadCc} 条新抄送">${unreadCc > 99 ? "99+" : unreadCc}</span>` : ""}`;
    ccTab.classList.toggle("has-unread", unreadCc > 0);
  }
  const search = document.querySelector("#oaSearch");
  if (search && document.activeElement !== search) search.value = oaState.search;
  const statusFilter = document.querySelector("#oaStatusFilter");
  if (statusFilter) statusFilter.value = oaState.status;
}

function leavePeriodCalculation(values = {}) {
  const { startDate, startHalf, endDate, endHalf } = values;
  if (!startDate || !startHalf || !endDate || !endHalf) return { days: "", error: "" };
  const parseDay = (dateKey) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey));
    if (!match) return null;
    const timestamp = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const date = new Date(timestamp);
    if (date.toISOString().slice(0, 10) !== dateKey) return null;
    return Math.floor(timestamp / 86400000);
  };
  const startDay = parseDay(startDate);
  const endDay = parseDay(endDate);
  if (startDay === null || endDay === null) return { days: "", error: "请选择有效的起止日期" };
  const startSlot = startDay * 2 + (startHalf === "下午" ? 1 : 0);
  const endSlot = endDay * 2 + (endHalf === "下午" ? 1 : 0);
  if (endSlot < startSlot) return { days: "", error: "结束时间不能早于开始时间" };
  return { days: String((endSlot - startSlot + 1) / 2), error: "" };
}

function syncLeaveDuration(root, event = null) {
  const startInput = root.querySelector('[data-dialog-field="startDate"]');
  const endInput = root.querySelector('[data-dialog-field="endDate"]');
  const daysInput = root.querySelector('[data-dialog-field="days"]');
  if (!startInput || !endInput) return;
  // 第一次选开始日期时，结束日期默认同一天，常用的一天/半天申请少点一次。
  if (event?.target === startInput && startInput.value && !endInput.value) endInput.value = startInput.value;
  // 外出申请不填写请假天数，但同样需要使用同一套起止日期联动。
  if (!daysInput) return;
  const values = {
    startDate: startInput.value,
    startHalf: root.querySelector('[data-dialog-field="startHalf"]')?.value || "",
    endDate: endInput.value,
    endHalf: root.querySelector('[data-dialog-field="endHalf"]')?.value || "",
  };
  daysInput.value = leavePeriodCalculation(values).days;
}

// 发起申请：按模板字段动态生成表单
async function openOaCreateDialog(templateKey, prefill = {}) {
  const template = oaState.templates.find((item) => item.key === templateKey);
  if (!template) return;
  const hasHalfDayRange = ["leave", "outbound"].includes(templateKey);
  let lessonSwapOptions = null;
  let payrollApprovalOptions = null;
  if (templateKey === "payroll_approval") {
    try {
      payrollApprovalOptions = await apiRequest("/api/oa/payroll-approval-options");
    } catch (error) {
      showToast(error.message || "读取可提交的工资期间失败");
      return;
    }
    if (!(payrollApprovalOptions.periods || []).length) {
      showToast("暂无可提交的工资期间：请先完成本学部所有老师的确认与财务复核");
      return;
    }
  }
  if (templateKey === "lesson_swap") {
    const result = await apiRequest("/api/oa/lesson-swap-options");
    lessonSwapOptions = {
      sourceLessons: result.sourceLessons || [],
      counterpartLessons: result.counterpartLessons || [],
    };
    if (!lessonSwapOptions.sourceLessons.length) {
      showToast("暂无可调整的已发布课程");
      return;
    }
    if (!lessonSwapOptions.counterpartLessons.length) {
      showToast("当前学期暂无可与其他老师交换的已发布课程");
      return;
    }
  }
  // 使用“正式学期”字段的审批一律选择系统 termId，不能手输名称。
  // 已完成、归档学期可回看，但不能再新增会改变台账或人数口径的确认单。
  if (template.formFields.some((field) => field.type === "term") && !termManagementState.loaded) {
    await loadTermContext();
  }
  const selectableTerms = allBudgetTerms().filter(canUseBudgetTerm);
  const selectableBudgetScopes = financeStageCatalog.map((stage) => ({ value: stage.id, label: stage.name }));
  const payrollPeriods = payrollApprovalOptions?.periods || [];
  const payrollTerms = [...new Map(payrollPeriods.map((period) => [period.termId, period])).values()];
  const firstPayrollTermId = payrollTerms[0]?.termId || "";
  const payrollPeriodsFor = (termId) => payrollPeriods.filter((period) => period.termId === termId);
  const firstPayrollPeriod = payrollPeriodsFor(firstPayrollTermId)[0] || null;
  const counterpartTeachers = lessonSwapOptions
    ? [...new Map(lessonSwapOptions.counterpartLessons.map((lesson) => [lesson.teacherId, lesson.teacherName])).entries()].map(
        ([value, label]) => ({ value, label }),
      )
    : [];
  const firstCounterpartTeacherId = counterpartTeachers[0]?.value || "";
  const counterpartLessonsFor = (teacherId) =>
    lessonSwapOptions?.counterpartLessons.filter((lesson) => lesson.teacherId === teacherId) || [];
  const fields = template.formFields.map((field) => ({
    name: field.key,
    label: field.label,
    type:
      templateKey === "lesson_swap" && ["sourceLessonId", "counterpartTeacherId", "counterpartLessonId"].includes(field.key)
        ? "select"
        : field.type === "textarea"
        ? "textarea"
        : field.type === "select" || field.type === "radio" || field.type === "term" || field.type === "budget_scope" || field.type === "payroll_month"
          ? "select"
          : field.type,
    required: field.required,
    placeholder: field.placeholder || "",
    hint: field.hint || "",
    readonly: Boolean(field.readonly),
    step: field.step,
    multiple: Boolean(field.multiple),
    accept: field.accept || "",
    options:
      templateKey === "lesson_swap" && field.key === "sourceLessonId"
        ? lessonSwapOptions.sourceLessons.map((lesson) => ({ value: lesson.lessonId, label: lesson.label }))
        : templateKey === "lesson_swap" && field.key === "counterpartTeacherId"
          ? counterpartTeachers
        : templateKey === "lesson_swap" && field.key === "counterpartLessonId"
          ? counterpartLessonsFor(firstCounterpartTeacherId).map((lesson) => ({ value: lesson.lessonId, label: lesson.label }))
        : field.type === "term"
        ? templateKey === "payroll_approval"
          ? payrollTerms.map((period) => ({ value: period.termId, label: period.termName }))
          : selectableTerms.map((term) => ({ value: term.id, label: budgetTermLabel(term) }))
        : field.type === "payroll_month"
          ? payrollPeriodsFor(firstPayrollTermId).map((period) => ({ value: period.month, label: formatMonthLabel(period.month) }))
        : field.type === "budget_scope"
          ? selectableBudgetScopes
        : (field.options || []).map((option) => ({ value: option, label: option })),
    // 从账套页带过来的类型与期间直接填好：让人再手抄一遍「2026-06」，
    // 抄错了要等三级审批全走完才发现解错了账套
    value:
      prefill[field.key] !== undefined && prefill[field.key] !== ""
        ? prefill[field.key]
        : templateKey === "lesson_swap" && field.key === "sourceLessonId"
          ? lessonSwapOptions.sourceLessons[0]?.lessonId || ""
          : templateKey === "lesson_swap" && field.key === "counterpartTeacherId"
            ? firstCounterpartTeacherId
        : templateKey === "lesson_swap" && field.key === "counterpartLessonId"
          ? counterpartLessonsFor(firstCounterpartTeacherId)[0]?.lessonId || ""
        : field.type === "term"
          ? templateKey === "payroll_approval"
            ? firstPayrollTermId
            : selectableTerms.find((term) => term.current)?.id || selectableTerms[0]?.id || ""
          : templateKey === "payroll_approval" && field.type === "payroll_month"
            ? firstPayrollPeriod?.month || ""
          : templateKey === "payroll_approval" && field.key === "stageName"
            ? firstPayrollPeriod?.stageName || payrollApprovalOptions?.scopeName || ""
          : templateKey === "payroll_approval" && field.key === "headcount"
            ? String(firstPayrollPeriod?.headcount || "")
          : templateKey === "payroll_approval" && field.key === "totalAmount"
            ? String(firstPayrollPeriod?.totalAmount || "")
          : field.type === "budget_scope"
            ? selectableBudgetScopes[0]?.value || ""
          : field.type === "select" || field.type === "radio"
          ? hasHalfDayRange && field.key === "endHalf"
            ? "下午"
            : field.options?.[0] || ""
          : "",
  }));
  await openDialog({
    title: `发起${template.name}`,
    description: `流程：${template.steps.map((step) => step.name).join(" → ")}${template.execution ? ` → ${template.execution.name}` : ""}`,
    confirmText: "提交申请",
    fields,
    onChange: hasHalfDayRange
      ? ({ root, event }) => {
          syncLeaveDuration(root, event);
        }
      : templateKey === "lesson_swap"
        ? ({ root, event }) => {
            if (event && event.target?.dataset.dialogField !== "counterpartTeacherId") return;
            const teacherId = root.querySelector('[data-dialog-field="counterpartTeacherId"]')?.value || "";
            const lessonSelect = root.querySelector('[data-dialog-field="counterpartLessonId"]');
            if (!lessonSelect) return;
            lessonSelect.innerHTML = counterpartLessonsFor(teacherId)
              .map((lesson) => `<option value="${escapeHtml(lesson.lessonId)}">${escapeHtml(lesson.label)}</option>`)
              .join("");
          }
        : templateKey === "payroll_approval"
          ? ({ root }) => {
              const termId = root.querySelector('[data-dialog-field="termId"]')?.value || "";
              const monthSelect = root.querySelector('[data-dialog-field="month"]');
              if (!monthSelect) return;
              const priorMonth = monthSelect.value;
              const options = payrollPeriodsFor(termId);
              monthSelect.innerHTML = options
                .map((period) => `<option value="${escapeHtml(period.month)}">${escapeHtml(formatMonthLabel(period.month))}</option>`)
                .join("");
              monthSelect.value = options.some((period) => period.month === priorMonth)
                ? priorMonth
                : options[0]?.month || "";
              const period = options.find((item) => item.month === monthSelect.value) || options[0];
              const setValue = (key, value) => {
                const input = root.querySelector(`[data-dialog-field="${key}"]`);
                if (input) input.value = value ?? "";
              };
              setValue("stageName", period?.stageName || payrollApprovalOptions?.scopeName || "");
              setValue("headcount", period?.headcount || "");
              setValue("totalAmount", period?.totalAmount || "");
            }
        : null,
    validate:
      hasHalfDayRange
        ? (values) => leavePeriodCalculation(values).error
        : null,
    onConfirm: async (values) => {
      const formData = {};
      const files = [];
      template.formFields.forEach((field) => {
        if (field.type === "file") {
          (Array.isArray(values[field.key]) ? values[field.key] : []).forEach((file) =>
            files.push({ fieldKey: field.key, file }),
          );
          formData[field.key] = "";
        } else {
          formData[field.key] = values[field.key];
        }
      });
      if (templateKey === "leave") formData.days = leavePeriodCalculation(values).days;

      if (files.length) {
        const multipart = new FormData();
        multipart.append("payload", JSON.stringify({ templateKey, formData }));
        files.forEach(({ fieldKey, file }) => multipart.append(fieldKey, file, file.name));
        await apiRequest("/api/oa/requests", { method: "POST", body: multipart });
      } else {
        await apiRequest("/api/oa/requests", { method: "POST", body: { templateKey, formData } });
      }
      showToast("申请已提交");
      loadOaRequests({ scope: "mine", page: 1 });
    },
  });
}

// 请假／外出审批专用：逐节课安排代课教师或取消，通过后直接写入课表
async function openLessonArrangementDialog(detail, approverFields) {
  const isOutbound = detail.templateKey === "outbound";
  const absenceLabel = isOutbound ? "外出" : "请假";
  let data;
  try {
    data = await apiRequest(`/api/oa/lesson-arrangements?requestId=${encodeURIComponent(detail.id)}`);
  } catch (error) {
    showToast(error.message || `无法读取${absenceLabel}期间的课程`);
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
          <p>${escapeHtml(detail.applicantName)} ${absenceLabel} ${escapeHtml(data.startDate)} ${escapeHtml(data.startHalf || "")} 至 ${escapeHtml(data.endDate)} ${escapeHtml(data.endHalf || "")}，共 ${lessons.length} 节课。安排通过后课表立即更新，代课教师会收到通知。${isOutbound ? "原任课老师该节正常课时工资照发，代课老师按代课单价计薪。" : ""}</p>
        </div>
        <div class="arrange-body">
          ${lessons.length ? lessonRows : `<div class="empty-state compact">${escapeHtml(absenceLabel)}期间没有已排课程，可直接通过</div>`}
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
    // 请假／外出期间无课时显式标记，避免被必填校验拦下
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

// 抄送名单：谁抄的、什么时候抄的都要写出来，事后追责要靠这个
function renderCcSection(detail) {
  const list = detail.ccRecipients || [];
  if (!list.length && !detail.canAddCc) return "";
  const items = list.length
    ? list
        .map(
          (item) =>
            `<li><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(oaRoleLabel(item.role))}</span>` +
            `<small>由 ${escapeHtml(item.addedByName || "系统")} 抄送</small></li>`,
        )
        .join("")
    : '<li class="empty-state compact">暂无抄送</li>';
  return `<div class="approval-cc-section">
      <h4>抄送（仅知悉，不参与审批）</h4>
      <ul class="approval-cc-list">${items}</ul>
    </div>`;
}

// 执行不是抄送：审批通过后由指定人员完成业务动作，并上传可下载的凭证。
function renderExecutionSection(detail) {
  const execution = detail.execution;
  if (!execution) return "";
  const assignees = (execution.executorAccounts || []).map((item) => item.name).filter(Boolean);
  const evidenceIds = new Set(execution.evidenceAttachmentIds || []);
  const evidence = (detail.attachments || []).filter((item) => evidenceIds.has(item.id));
  const statusText = execution.status === "executed" ? "已执行" : execution.status === "pending" ? "待执行" : "等待审批完成";
  const evidenceButtons = evidence.length
    ? evidence
        .map(
          (attachment) => `
            <button class="approval-attachment-button" type="button" data-oa-attachment-id="${escapeHtml(attachment.id)}">
              <span>📎 ${escapeHtml(attachment.originalName)}</span>
              <small>${escapeHtml(formatAttachmentBytes(attachment.bytes))} · 下载</small>
            </button>`,
        )
        .join("")
    : `<small>${execution.evidenceRequired ? `尚未上传${escapeHtml(execution.evidenceLabel || "执行凭证")}` : "无需上传凭证"}</small>`;
  return `
    <div class="approval-cc-section approval-execution-section">
      <h4>执行环节 <span class="status-pill ${execution.status === "executed" ? "done" : "warning"}">${statusText}</span></h4>
      <ul class="approval-cc-list">
        <li><strong>${escapeHtml(execution.name || "执行")}</strong><span>执行人：${escapeHtml(assignees.join("、") || "按岗位分配")}</span>
          ${execution.executedByName ? `<small>${escapeHtml(execution.executedByName)} 于 ${escapeHtml(formatDateTimeShort(execution.executedAt))} 标记已执行${execution.comment ? `：${escapeHtml(execution.comment)}` : ""}</small>` : ""}
        </li>
      </ul>
      <div class="approval-execution-evidence"><b>${escapeHtml(execution.evidenceLabel || "执行凭证")}</b><div class="approval-attachment-list">${evidenceButtons}</div></div>
    </div>`;
}

function oaRoleLabel(role) {
  return (
    {
      teacher: "教师",
      admin: "教务",
      hr: "人事",
      finance: "财务",
      division_head: "学部负责人",
      principal: "校领导",
      system_admin: "行政管理",
    }[role] || role
  );
}

// 抄送选择器：候选范围由服务端按模板给出——薪资类单据里没有教师，
// 前端不能自己拼一份全量名单，否则界面上选得到、提交却被拒。
async function openCcPicker(detail) {
  let candidates = [];
  try {
    const result = await apiRequest(
      `/api/oa/cc-candidates?templateKey=${encodeURIComponent(detail.templateKey)}`,
    );
    candidates = result.candidates || [];
  } catch (error) {
    showToast(error.message || "加载抄送候选人失败");
    return null;
  }
  const already = new Set((detail.ccRecipients || []).map((item) => item.accountId));
  const options = candidates
    .filter((item) => !already.has(item.accountId) && item.accountId !== detail.applicantAccountId)
    .map((item) => ({ value: item.accountId, label: `${item.name}（${item.roleLabel}）` }));

  if (!options.length) {
    showToast("没有可添加的抄送对象");
    return null;
  }
  const values = await openDialog({
    title: "添加抄送",
    description: "被抄送人可以查看这张单子，但不能审批。",
    confirmText: "抄送",
    fields: [
      {
        name: "accountIds",
        label: "抄送给",
        type: "multiselect",
        options,
        required: true,
      },
    ],
  });
  if (!values) return null;
  const picked = values.accountIds;
  return Array.isArray(picked) ? picked : [picked].filter(Boolean);
}

function formatAttachmentBytes(bytes) {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

// 月度工资确认不是普通文本审批：主任、校长和总校财务必须在同一张单里看到
// 发起时冻结的逐人绩效分与工资金额，不能再另开财务页面猜“这笔总额从哪来”。
function renderPayrollApprovalSnapshot(detail) {
  const snapshot = detail.payrollSnapshot;
  if (detail.templateKey !== "payroll_approval" || !snapshot) return "";
  const rows = snapshot.rows || [];
  const componentText = (row) =>
    (row.components || [])
      .map((item) => `${item.name} ${formatCurrency(item.amount || 0)}`)
      .join(" · ");
  return `
    <section class="payroll-approval-snapshot">
      <div class="payroll-approval-snapshot-head">
        <div>
          <h4>工资明细快照</h4>
          <p>${escapeHtml(snapshot.termName || detail.termName || "")} · ${escapeHtml(formatMonthLabel(snapshot.month || detail.formData?.month || ""))} · ${escapeHtml(snapshot.stageName || detail.formData?.stageName || "")}</p>
        </div>
        <div class="payroll-approval-snapshot-total">
          <span>${rows.length} 人</span>
          <strong>${formatCurrency(snapshot.totalAmount || 0)}</strong>
        </div>
      </div>
      <p class="payroll-approval-snapshot-note">以下明细在提交时已冻结；审批期间如绩效分或工资金额变化，执行发放会被拦截并要求重新核算。</p>
      <div class="payroll-approval-table-wrap">
        <table class="payroll-approval-table">
          <thead><tr><th>人员</th><th>部门 / 岗位</th><th>绩效分</th><th>基本工资</th><th>考核工资</th><th>房补</th><th>课时工资</th><th>其他调整</th><th>应发合计</th><th>工资组成</th></tr></thead>
          <tbody>${rows
            .map(
              (row) => `
                <tr>
                  <td><strong>${escapeHtml(row.teacherName)}</strong><small>${escapeHtml(row.employeeNo || row.teacherId)}</small></td>
                  <td>${escapeHtml([row.department, row.subjectName].filter(Boolean).join(" · ") || "-")}</td>
                  <td><span class="payroll-score-pill">${escapeHtml(String(row.performanceScore ?? 100))} 分</span></td>
                  <td>${formatCurrency(row.baseSalary || 0)}</td>
                  <td>${formatCurrency(row.assessmentSalary || 0)}</td>
                  <td>${formatCurrency(row.housingAllowance || 0)}</td>
                  <td>${formatCurrency(row.lessonAmount || 0)}</td>
                  <td>${formatCurrency(Number(row.positionSalary || 0) + Number(row.supplementalAmount || 0) - Number(row.deductionAmount || 0))}</td>
                  <td><strong>${formatCurrency(row.grossPay || 0)}</strong></td>
                  <td class="payroll-component-cell">${escapeHtml(componentText(row) || "-")}</td>
                </tr>`,
            )
            .join("")}</tbody>
        </table>
      </div>
    </section>
  `;
}

async function downloadOaAttachment(requestId, attachment) {
  const response = await fetch(
    `/api/oa/requests/${encodeURIComponent(requestId)}/attachments/${encodeURIComponent(attachment.id)}/content`,
    { headers: backendSession?.token ? { Authorization: `Bearer ${backendSession.token}` } : {} },
  );
  if (!response.ok) {
    let message = `附件下载失败：${response.status}`;
    try {
      const payload = await response.json();
      message = payload?.error?.message || message;
    } catch {
      // 下载接口可能返回非 JSON 错误页，沿用状态码提示。
    }
    if (response.status === 401) handleBackendAuthExpired();
    throw new Error(message);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.originalName || "证明材料";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
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
  // 被抄送人实际查看单据后，清除“抄送我的”未读提示；待办不会因此消失。
  if (detail.isCc) markUnreadOaCcNoticesRead().catch(() => {});
  const executionEvidenceIds = new Set(detail.execution?.evidenceAttachmentIds || []);
  const fieldRows = (detail.formFields || [])
    .map((field) => {
      let value = detail.formData?.[field.key];
      // 调课单存的是课次 ID，详情中必须展示双方确认的课程信息，不能让老师和
      // 排课负责人对着一串内部编号判断是不是要调的那节课。
      if (detail.templateKey === "lesson_swap" && field.key === "sourceLessonId") {
        value = detail.formData?.sourceLessonLabel || value;
      }
      if (detail.templateKey === "lesson_swap" && field.key === "counterpartLessonId") {
        value = detail.formData?.counterpartLessonLabel || value;
      }
      if (field.type === "file") {
        // 申请材料与执行凭证分别展示，避免凭证被误显示在“证明材料”字段下。
        const attachments = (detail.attachments || []).filter((item) => !executionEvidenceIds.has(item.id));
        if (attachments.length) {
          const buttons = attachments
            .map(
              (attachment) => `
                <button class="approval-attachment-button" type="button"
                  data-oa-attachment-id="${escapeHtml(attachment.id)}">
                  <span>📎 ${escapeHtml(attachment.originalName)}</span>
                  <small>${escapeHtml(formatAttachmentBytes(attachment.bytes))} · 下载</small>
                </button>
              `,
            )
            .join("");
          return `<div class="approval-detail-row approval-detail-attachment-row"><span>${escapeHtml(field.label)}</span><div class="approval-attachment-list">${buttons}</div></div>`;
        }
        // 兼容升级前“证明材料”里保存的文字说明。
        return value
          ? `<div class="approval-detail-row"><span>${escapeHtml(field.label)}</span><strong>${escapeHtml(String(value))}</strong></div>`
          : "";
      }
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
          ${renderPayrollApprovalSnapshot(detail)}
          ${renderCcSection(detail)}
          <ol class="approval-steps">${stepRows}</ol>
          ${renderExecutionSection(detail)}
        </div>
        <p class="dialog-error" data-dialog-error></p>
        <div class="dialog-actions">
          <button class="ghost-button" data-dialog-cancel type="button">关闭</button>
          ${detail.canAddCc ? `<button class="ghost-button" data-oa-cc="${escapeHtml(detail.id)}" type="button">抄送</button>` : ""}
          ${detail.canUrge ? `<button class="ghost-button" data-oa-urge="${escapeHtml(detail.id)}" type="button">催办</button>` : ""}
          ${detail.canWithdraw ? `<button class="ghost-button" data-oa-withdraw="${escapeHtml(detail.id)}" type="button">撤回</button>` : ""}
          ${detail.canAct ? `<button class="danger-button" data-oa-reject="${escapeHtml(detail.id)}" type="button">拒绝</button>` : ""}
          ${detail.canAct ? `<button class="primary-button" data-oa-approve="${escapeHtml(detail.id)}" type="button">通过</button>` : ""}
          ${detail.canExecute ? `<button class="primary-button" data-oa-execute="${escapeHtml(detail.id)}" type="button">上传凭证并标记已执行</button>` : ""}
        </div>
      </div>
    </div>
  `;
  root.setAttribute("aria-hidden", "false");
  document.body.classList.add("dialog-open");

  root.querySelectorAll("[data-oa-attachment-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const attachment = (detail.attachments || []).find((item) => item.id === button.dataset.oaAttachmentId);
      if (!attachment) return;
      button.disabled = true;
      try {
        await downloadOaAttachment(detail.id, attachment);
        showToast("附件已开始下载");
      } catch (error) {
        showToast(error.message || "附件下载失败");
      } finally {
        button.disabled = false;
      }
    });
  });

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
  root.querySelector("[data-oa-execute]")?.addEventListener("click", async () => {
    const execution = detail.execution || {};
    const hasEvidence = (execution.evidenceAttachmentIds || []).length > 0;
    const values = await openDialog({
      title: `完成执行：${execution.name || detail.templateName}`,
      description: hasEvidence
        ? "已上传执行凭证；确认完成后将正式办结该审批单。"
        : `请先上传${execution.evidenceLabel || "执行凭证"}，再标记已执行。`,
      confirmText: "已执行，办结流程",
      fields: [
        {
          name: "evidence",
          label: execution.evidenceLabel || "执行凭证",
          type: "file",
          multiple: true,
          accept: ".jpg,.jpeg,.png,.pdf",
          required: Boolean(execution.evidenceRequired) && !hasEvidence,
          hint: hasEvidence ? "如有补充凭证可继续上传 JPG、PNG 或 PDF。" : "支持 JPG、PNG 或 PDF，最多 3 个文件。",
        },
        { name: "comment", label: "执行说明", type: "textarea", required: false, placeholder: "例如：已于 9 月 8 日完成拨款" },
      ],
      onConfirm: async (form) => {
        const files = form.evidence || [];
        if (files.length) {
          const payload = new FormData();
          files.forEach((file) => payload.append("evidence", file));
          await apiRequest(`/api/oa/requests/${detail.id}/execution/evidence`, { method: "POST", body: payload });
        }
        await apiRequest(`/api/oa/requests/${detail.id}/execute`, { method: "POST", body: { comment: form.comment || "" } });
      },
    });
    if (!values) return;
    close();
    showToast("已执行并完成留痕");
    loadOaRequests();
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
  root.querySelector("[data-oa-cc]")?.addEventListener("click", async () => {
    const picked = await openCcPicker(detail);
    if (!picked?.length) return;
    try {
      const result = await apiRequest(`/api/oa/requests/${detail.id}/cc`, {
        method: "POST",
        body: { accountIds: picked },
      });
      // 已在名单上的人会被服务端跳过，这里如实报数，避免"选了 3 个却只加了 1 个"没人发现
      showToast(result.added.length ? `已抄送 ${result.added.length} 人` : "所选人员均已在抄送名单中");
      close();
      openOaDetail(detail.id);
    } catch (error) {
      showToast(error.message || "抄送失败");
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
let oaAdminState = { templates: [], approverRoles: [], approverAccounts: [], fieldTypes: [], loading: false, error: "" };

// 角色和字段类型通常由接口下发；接口尚未加载完成时，也要把配置器完整展示出来，
// 不能让行政只看到“老师”而无法选择其他发起人或审批人。
const APPROVAL_BUILDER_APPROVER_ROLE_FALLBACK = [
  { value: "division_head", label: "学部主任" },
  { value: "admin", label: "学部排课负责人" },
  { value: "hr", label: "人事" },
  { value: "finance", label: "财务" },
  { value: "principal", label: "校长（总校领导）" },
  { value: "system_admin", label: "总校人事 + 行政" },
];

const APPROVAL_BUILDER_FIELD_TYPE_FALLBACK = [
  { value: "text", label: "单行文本" },
  { value: "textarea", label: "多行文本" },
  { value: "number", label: "数字" },
  { value: "date", label: "日期" },
  { value: "select", label: "下拉选择" },
  { value: "radio", label: "单选" },
  { value: "file", label: "文件附件" },
];

// 演示环境还未连上接口时，仍显示当前 Demo 人员；正式环境优先使用接口返回的在职人员。
const APPROVAL_BUILDER_APPROVER_ACCOUNT_FALLBACK = [
  { accountId: "ACC-SYSTEM-ADMIN", name: "总校人事行政", department: "总校人事行政处", title: "总校人事 + 行政", role: "system_admin", scopeStageIds: [] },
  { accountId: "ACC-PRINCIPAL", name: "校长", department: "校办", title: "校长（总校领导）", role: "principal", scopeStageIds: [] },
  { accountId: "ACC-HR", name: "人事专员", department: "人事处", title: "人事专员", role: "hr", scopeStageIds: [] },
  { accountId: "ACC-FINANCE", name: "张会计", department: "财务处 · 总校", title: "总校财务", role: "finance", scopeStageIds: [] },
  { accountId: "ACC-FINANCE-KINDERGARTEN", name: "幼儿园会计", department: "财务处 · 幼儿园", title: "幼儿园财务", role: "finance", scopeStageIds: ["kindergarten"] },
  { accountId: "ACC-FINANCE-PRIMARY", name: "小学部会计", department: "财务处 · 小学部", title: "小学部财务", role: "finance", scopeStageIds: ["primary"] },
  { accountId: "ACC-FINANCE-MIDDLE", name: "初中部会计", department: "财务处 · 初中部", title: "初中部财务", role: "finance", scopeStageIds: ["middle"] },
  { accountId: "ACC-FINANCE-HIGH", name: "高中部会计", department: "财务处 · 高中部", title: "高中部财务", role: "finance", scopeStageIds: ["high"] },
  { accountId: "ACC-HEAD-KINDERGARTEN", name: "幼儿园主任", department: "幼儿园", title: "幼儿园主任", role: "division_head", scopeStageIds: ["kindergarten"] },
  { accountId: "ACC-HEAD-PRIMARY", name: "小学部负责人", department: "小学部", title: "小学部主任", role: "division_head", scopeStageIds: ["primary"] },
  { accountId: "ACC-HEAD-MIDDLE", name: "初中部负责人", department: "初中部", title: "初中部主任", role: "division_head", scopeStageIds: ["middle"] },
  { accountId: "ACC-HEAD-HIGH", name: "高中部负责人", department: "高中部", title: "高中部主任", role: "division_head", scopeStageIds: ["high"] },
  { accountId: "ACC-SCHEDULER-KINDERGARTEN", name: "幼儿园排课负责人", department: "幼儿园", title: "幼儿园排课负责人", role: "admin", scopeStageIds: ["kindergarten"] },
  { accountId: "ACC-SCHEDULER-PRIMARY", name: "小学部排课负责人（高段）", department: "小学部", title: "小学部排课负责人（4-6年级）", role: "admin", scopeStageIds: ["primary"], schedulingGradeIds: ["elementary-g4", "elementary-g5", "elementary-g6"] },
  { accountId: "ACC-SCHEDULER-PRIMARY-LOW", name: "小学部排课负责人（低段）", department: "小学部", title: "小学部排课负责人（1-3年级）", role: "admin", scopeStageIds: ["primary"], schedulingGradeIds: ["elementary-g1", "elementary-g2", "elementary-g3"] },
  { accountId: "ACC-SCHEDULER-MIDDLE", name: "初中部排课负责人（一）", department: "初中部", title: "初中部排课负责人", role: "admin", scopeStageIds: ["middle"], schedulingGradeIds: ["middle-g1", "middle-g2", "middle-g3"] },
  { accountId: "ACC-SCHEDULER-MIDDLE-CO", name: "初中部排课负责人（二）", department: "初中部", title: "初中部排课负责人", role: "admin", scopeStageIds: ["middle"], schedulingGradeIds: ["middle-g1", "middle-g2", "middle-g3"] },
  { accountId: "ACC-SCHEDULER-HIGH", name: "高中部排课负责人", department: "高中部", title: "高中部排课负责人", role: "admin", scopeStageIds: ["high"] },
];

async function loadOaAdminTemplates() {
  if (!backendMode()) return;
  oaAdminState = { ...oaAdminState, loading: true, error: "" };
  render();
  try {
    const result = await apiRequest("/api/oa/admin/templates");
    oaAdminState = {
      templates: result.templates || [],
      approverRoles: result.approverRoles || [],
      approverAccounts: result.approverAccounts || [],
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
  return approvalBuilderRoleOptions({ includeTeacher: true }).find((item) => item.value === value)?.label || value;
}

function approvalBuilderApproverAccounts() {
  return oaAdminState.approverAccounts.length ? oaAdminState.approverAccounts : APPROVAL_BUILDER_APPROVER_ACCOUNT_FALLBACK;
}

function approvalBuilderApproverName(accountId) {
  const person = approvalBuilderApproverAccounts().find((item) => item.accountId === accountId);
  return person ? `${person.name}（${person.department} · ${person.title}）` : accountId;
}

function approvalStepAssigneeLabel(step) {
  const accounts = Array.isArray(step.approverAccountIds) ? step.approverAccountIds : [];
  return accounts.length ? accounts.map(approvalBuilderApproverName).join(" / ") : (step.approverRoles || []).map(roleLabelOf).join(" / ");
}

function approvalExecutionAssigneeLabel(execution) {
  const accounts = Array.isArray(execution?.executorAccountIds) ? execution.executorAccountIds : [];
  return accounts.length
    ? accounts.map(approvalBuilderApproverName).join(" / ")
    : (execution?.executorRoles || []).map(roleLabelOf).join(" / ");
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
      const approvalChain = template.steps
        .map(
          (step, index) => `
            <span class="approval-chain-node">
              <b>${index + 1}. ${escapeHtml(step.name)}</b>
              <small>${escapeHtml(approvalStepAssigneeLabel(step))}${step.approverMode === "all" ? " · 会签" : ""}</small>
              ${(step.approverFields || []).length ? `<small class="approval-chain-extra">需填写：${step.approverFields.map((f) => escapeHtml(f.label)).join("、")}</small>` : ""}
            </span>
          `,
        )
        .join('<span class="approval-chain-arrow">→</span>');
      const executionChain = template.execution
        ? `<span class="approval-chain-arrow">→</span><span class="approval-chain-node"><b>执行：${escapeHtml(template.execution.name || "执行")}</b><small>${escapeHtml(approvalExecutionAssigneeLabel(template.execution))}${template.execution.evidenceRequired === false ? " · 无需凭证" : ` · 上传${escapeHtml(template.execution.evidenceLabel || "执行凭证")}`}</small></span>`
        : "";
      const chain = `${approvalChain}${executionChain}`;
      return `
        <div class="approval-template-card ${template.status === "disabled" ? "is-disabled" : ""}">
          <div class="approval-template-head">
            <span class="approval-entry-icon">${escapeHtml(template.icon)}</span>
            <div class="approval-template-title">
              <strong>${escapeHtml(template.name)}</strong>
              <small>${escapeHtml(template.category)} · ${template.formFields.length} 个表单字段 · ${template.steps.length} 级审批${template.execution ? " · 含执行环节" : ""}${template.builtIn ? " · 内置" : ""}</small>
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

// 审批类型可视化配置器。字段标识与模板标识由系统生成，行政只需要处理屏幕上
// 真正有业务含义的名称、角色、字段类型和审批顺序。
let approvalBuilderSequence = 0;

function nextApprovalBuilderKey(prefix = "field") {
  approvalBuilderSequence += 1;
  return `${prefix}_${Date.now().toString(36)}_${approvalBuilderSequence}`;
}

function nextOaTemplateKey() {
  const existing = new Set(oaAdminState.templates.map((item) => item.key));
  let key = `custom_${Date.now().toString(36)}`;
  let suffix = 1;
  while (existing.has(key)) {
    key = `custom_${Date.now().toString(36)}_${suffix}`;
    suffix += 1;
  }
  return key;
}

function approvalBuilderRoleOptions({ includeTeacher = false } = {}) {
  const loadedRoles = oaAdminState.approverRoles.length ? oaAdminState.approverRoles : APPROVAL_BUILDER_APPROVER_ROLE_FALLBACK;
  const options = [
    ...(includeTeacher ? [{ value: "teacher", label: "老师" }] : []),
    ...loadedRoles,
  ];
  return options.filter((item, index) => options.findIndex((candidate) => candidate.value === item.value) === index);
}

function approvalBuilderFieldTypes() {
  return oaAdminState.fieldTypes.length ? oaAdminState.fieldTypes : APPROVAL_BUILDER_FIELD_TYPE_FALLBACK;
}

function approvalBuilderDraft(template = null) {
  if (template) {
    return {
      name: template.name || "",
      icon: template.icon || "📝",
      category: template.category || "其他",
      description: template.description || "",
      applicantRoles: [...(template.applicantRoles || [])],
      formFields: (template.formFields || []).map((field) => ({ ...clone(field) })),
      steps: (template.steps || []).map((step) => ({
        ...clone(step),
        approverAccountIds: [...(step.approverAccountIds || [])],
        approverMode: step.approverMode || "any",
        approverFields: (step.approverFields || []).map((field) => ({ ...clone(field) })),
      })),
      execution: template.execution
        ? {
            enabled: true,
            name: template.execution.name || "执行",
            executorAccountIds: [...(template.execution.executorAccountIds || [])],
            evidenceRequired: template.execution.evidenceRequired !== false,
            evidenceLabel: template.execution.evidenceLabel || "执行凭证",
          }
        : { enabled: false, name: "执行", executorAccountIds: [], evidenceRequired: true, evidenceLabel: "执行凭证" },
    };
  }
  return {
    name: "",
    icon: "📝",
    category: "行政",
    description: "",
    applicantRoles: ["teacher"],
    formFields: [
      { key: nextApprovalBuilderKey(), label: "", type: "text", required: true, hint: "", options: [] },
    ],
    steps: [
      { name: "部门负责人审批", approverAccountIds: [], approverRoles: [], approverMode: "any", approverFields: [] },
    ],
    execution: { enabled: false, name: "执行", executorAccountIds: [], evidenceRequired: true, evidenceLabel: "执行凭证" },
  };
}

function approvalBuilderRoleChecks(roles, selected, dataAttribute) {
  return roles
    .map(
      (role) => `
        <label class="approval-builder-check">
          <input type="checkbox" ${dataAttribute} value="${escapeHtml(role.value)}" ${selected.includes(role.value) ? "checked" : ""} />
          <span>${escapeHtml(role.label)}</span>
        </label>
      `,
    )
    .join("");
}

function renderApprovalBuilderFields(root, draft) {
  const list = root.querySelector("[data-approval-builder-fields]");
  if (!list) return;
  list.innerHTML = draft.formFields
    .map((field, index) => {
      const choiceType = field.type === "select" || field.type === "radio";
      const fileType = field.type === "file";
      return `
        <article class="approval-builder-item" data-builder-field-row="${index}">
          <div class="approval-builder-item-head">
            <strong>申请字段 ${index + 1}</strong>
            <div class="approval-builder-item-actions">
              <button class="mini-button" data-builder-field-move="up" data-index="${index}" type="button" ${index === 0 ? "disabled" : ""}>上移</button>
              <button class="mini-button" data-builder-field-move="down" data-index="${index}" type="button" ${index === draft.formFields.length - 1 ? "disabled" : ""}>下移</button>
              <button class="mini-button danger-text" data-builder-field-remove data-index="${index}" type="button" ${draft.formFields.length === 1 ? "disabled" : ""}>删除</button>
            </div>
          </div>
          <div class="approval-builder-grid">
            <label class="dialog-field">
              <span>字段名称<span class="dialog-required">*</span></span>
              <input data-builder-field-label value="${escapeHtml(field.label || "")}" placeholder="例如：用章事由" />
            </label>
            <label class="dialog-field">
              <span>填写方式</span>
              <select data-builder-field-type>
                ${approvalBuilderFieldTypes().map((type) => `<option value="${escapeHtml(type.value)}" ${type.value === field.type ? "selected" : ""}>${escapeHtml(type.label)}</option>`).join("")}
              </select>
            </label>
            <label class="approval-builder-check approval-builder-required-check">
              <input data-builder-field-required type="checkbox" ${field.required ? "checked" : ""} />
              <span>申请人必须填写</span>
            </label>
            <label class="dialog-field approval-builder-wide">
              <span>填写提示</span>
              <input data-builder-field-hint value="${escapeHtml(field.hint || field.placeholder || "")}" placeholder="显示在输入框下方，帮助申请人填写" />
            </label>
            ${choiceType ? `
              <label class="dialog-field approval-builder-wide">
                <span>选项<span class="dialog-required">*</span></span>
                <textarea data-builder-field-options rows="2" placeholder="每行一个选项，例如：&#10;公章&#10;合同章">${escapeHtml((field.options || []).join("\n"))}</textarea>
                <small>每行填写一个选项，也可以用逗号分隔。</small>
              </label>
            ` : ""}
            ${fileType ? `
              <label class="approval-builder-check">
                <input data-builder-field-multiple type="checkbox" ${field.multiple ? "checked" : ""} />
                <span>允许上传多个文件</span>
              </label>
              <label class="dialog-field">
                <span>允许的文件类型</span>
                <input data-builder-field-accept value="${escapeHtml(field.accept || ".pdf,.doc,.docx,.jpg,.jpeg,.png")}" placeholder=".pdf,.doc,.docx,.jpg,.png" />
              </label>
            ` : ""}
          </div>
        </article>
      `;
    })
    .join("");
  root.querySelector("[data-builder-add-field]").disabled = draft.formFields.length >= 20;
}

function renderApprovalBuilderSteps(root, draft) {
  const list = root.querySelector("[data-approval-builder-steps]");
  if (!list) return;
  const approverAccounts = approvalBuilderApproverAccounts();
  list.innerHTML = draft.steps
    .map((step, index) => {
      const selectedAccountIds = new Set(step.approverAccountIds || []);
      const personOptions = approverAccounts
        .map((person) => {
          const searchText = `${person.name} ${person.department} ${person.title} ${person.roleLabel || ""}`.toLowerCase();
          return `
            <label class="approval-builder-person" data-builder-approver-option="${index}" data-builder-person-search="${escapeHtml(searchText)}">
              <input data-builder-step-account="${index}" type="checkbox" value="${escapeHtml(person.accountId)}" ${selectedAccountIds.has(person.accountId) ? "checked" : ""} />
              <span class="approval-builder-person-main"><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.department)} · ${escapeHtml(person.title)}</small></span>
            </label>
          `;
        })
        .join("");
      return `
      <article class="approval-builder-item approval-builder-step" data-builder-step-row="${index}">
        <div class="approval-builder-item-head">
          <strong><span class="approval-builder-step-number">${index + 1}</span> 第 ${index + 1} 级审批</strong>
          <div class="approval-builder-item-actions">
            <button class="mini-button" data-builder-step-move="up" data-index="${index}" type="button" ${index === 0 ? "disabled" : ""}>上移</button>
            <button class="mini-button" data-builder-step-move="down" data-index="${index}" type="button" ${index === draft.steps.length - 1 ? "disabled" : ""}>下移</button>
            <button class="mini-button danger-text" data-builder-step-remove data-index="${index}" type="button" ${draft.steps.length === 1 ? "disabled" : ""}>删除</button>
          </div>
        </div>
        <div class="approval-builder-grid">
          <label class="dialog-field">
            <span>环节名称<span class="dialog-required">*</span></span>
            <input data-builder-step-name value="${escapeHtml(step.name || "")}" placeholder="例如：部门主任审批" />
          </label>
          <label class="dialog-field">
            <span>多人审批方式</span>
            <select data-builder-step-mode>
              <option value="any" ${step.approverMode !== "all" ? "selected" : ""}>任一角色通过即可</option>
              <option value="all" ${step.approverMode === "all" ? "selected" : ""}>所选角色全部通过</option>
            </select>
          </label>
          <div class="approval-builder-wide">
            <div class="approval-builder-person-picker-head">
              <div>
                <span class="approval-builder-label">选择审批人<span class="dialog-required">*</span></span>
                <small class="approval-builder-role-help">只向这里选定的人发送待办。已选 <b data-builder-approver-selected-count>${selectedAccountIds.size}</b> 人。</small>
              </div>
              <label class="approval-builder-person-search-wrap">
                <span aria-hidden="true">⌕</span>
                <input class="approval-builder-person-search" data-builder-approver-search="${index}" type="search" placeholder="输入姓名、部门或岗位，立即筛选" aria-label="搜索第 ${index + 1} 级审批人" autocomplete="off" />
              </label>
            </div>
            <small class="approval-builder-person-result" data-builder-approver-result>显示全部 ${approverAccounts.length} 人</small>
            <div class="approval-builder-person-list">
              ${personOptions}
              <div class="approval-builder-person-empty" data-builder-approver-empty hidden>没有找到匹配的审批人，请换一个关键词。</div>
            </div>
          </div>
          <div class="approval-builder-wide approval-builder-subsection">
            <div class="approval-builder-subhead">
              <div>
                <strong>审批人补充填写</strong>
                <small>可选，例如审批时登记编号或填写处理意见。</small>
              </div>
              <button class="ghost-button compact-button" data-builder-add-approver-field data-step-index="${index}" type="button">+ 添加填写项</button>
            </div>
            <div class="approval-builder-approver-fields">
              ${(step.approverFields || []).map((field, fieldIndex) => `
                <div class="approval-builder-inline-row" data-builder-approver-field-row="${fieldIndex}">
                  <input data-builder-approver-label value="${escapeHtml(field.label || "")}" placeholder="填写项名称" aria-label="第 ${index + 1} 级审批填写项名称" />
                  <select data-builder-approver-type aria-label="第 ${index + 1} 级审批填写方式">
                    ${approvalBuilderFieldTypes().filter((type) => type.value !== "select" && type.value !== "radio" && type.value !== "file").map((type) => `<option value="${escapeHtml(type.value)}" ${type.value === field.type ? "selected" : ""}>${escapeHtml(type.label)}</option>`).join("")}
                  </select>
                  <label class="approval-builder-check"><input data-builder-approver-required type="checkbox" ${field.required ? "checked" : ""} /><span>必填</span></label>
                  <button class="mini-button danger-text" data-builder-approver-remove data-step-index="${index}" data-field-index="${fieldIndex}" type="button">删除</button>
                </div>
              `).join("") || '<small class="approval-builder-empty">无需审批人额外填写</small>'}
            </div>
          </div>
        </div>
      </article>
    `;
    })
    .join("");
  root.querySelector("[data-builder-add-step]").disabled = draft.steps.length >= 8;
}

function renderApprovalBuilderExecution(root, draft) {
  const target = root.querySelector("[data-approval-builder-execution]");
  if (!target) return;
  const execution = draft.execution || { enabled: false, name: "执行", executorAccountIds: [], evidenceRequired: true, evidenceLabel: "执行凭证" };
  const selectedIds = new Set(execution.executorAccountIds || []);
  const people = approvalBuilderApproverAccounts();
  const options = people
    .map((person) => {
      const searchText = `${person.name} ${person.department} ${person.title} ${person.roleLabel || ""}`.toLowerCase();
      return `<label class="approval-builder-person" data-builder-executor-option data-builder-person-search="${escapeHtml(searchText)}">
        <input data-builder-execution-account type="checkbox" value="${escapeHtml(person.accountId)}" ${selectedIds.has(person.accountId) ? "checked" : ""} />
        <span class="approval-builder-person-main"><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.department)} · ${escapeHtml(person.title)}</small></span>
      </label>`;
    })
    .join("");
  target.innerHTML = `
    <label class="approval-builder-check">
      <input data-builder-execution-enabled type="checkbox" ${execution.enabled ? "checked" : ""} />
      <span>所有审批通过后增加执行环节</span>
    </label>
    <small class="approval-builder-role-help">执行人收到的是“待执行”事项，不是只读抄送；上传凭证并点击已执行后，审批单才办结。</small>
    <div class="approval-builder-grid ${execution.enabled ? "" : "is-hidden"}" data-builder-execution-config>
      <label class="dialog-field">
        <span>执行环节名称<span class="dialog-required">*</span></span>
        <input data-builder-execution-name value="${escapeHtml(execution.name || "")}" placeholder="例如：总校财务拨款" />
      </label>
      <label class="dialog-field">
        <span>凭证名称</span>
        <input data-builder-execution-evidence-label value="${escapeHtml(execution.evidenceLabel || "执行凭证")}" placeholder="例如：拨款凭证" />
      </label>
      <label class="approval-builder-check">
        <input data-builder-execution-evidence-required type="checkbox" ${execution.evidenceRequired !== false ? "checked" : ""} />
        <span>执行办结前必须上传凭证</span>
      </label>
      <div class="approval-builder-wide">
        <div class="approval-builder-person-picker-head">
          <div>
            <span class="approval-builder-label">选择执行人<span class="dialog-required">*</span></span>
            <small class="approval-builder-role-help">已选 <b data-builder-executor-selected-count>${selectedIds.size}</b> 人。</small>
          </div>
          <label class="approval-builder-person-search-wrap"><span aria-hidden="true">⌕</span><input class="approval-builder-person-search" data-builder-executor-search type="search" placeholder="输入姓名、部门或岗位，立即筛选" autocomplete="off" /></label>
        </div>
        <small class="approval-builder-person-result" data-builder-executor-result>显示全部 ${people.length} 人</small>
        <div class="approval-builder-person-list">${options}<div class="approval-builder-person-empty" data-builder-executor-empty hidden>没有找到匹配的执行人，请换一个关键词。</div></div>
      </div>
    </div>`;
}

function splitApprovalBuilderOptions(value) {
  return String(value || "")
    .split(/[\n,，、]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function syncApprovalBuilderDraft(root, draft) {
  draft.name = root.querySelector("[data-builder-name]")?.value.trim() || "";
  draft.icon = root.querySelector("[data-builder-icon]")?.value || "📝";
  draft.category = root.querySelector("[data-builder-category]")?.value.trim() || "其他";
  draft.description = root.querySelector("[data-builder-description]")?.value.trim() || "";
  draft.applicantRoles = [...root.querySelectorAll("[data-builder-applicant-role]:checked")].map((input) => input.value);

  draft.formFields = draft.formFields.map((field, index) => {
    const row = root.querySelector(`[data-builder-field-row="${index}"]`);
    if (!row) return field;
    const type = row.querySelector("[data-builder-field-type]")?.value || "text";
    const options = type === "select" || type === "radio"
      ? splitApprovalBuilderOptions(row.querySelector("[data-builder-field-options]")?.value)
      : [];
    return {
      ...field,
      label: row.querySelector("[data-builder-field-label]")?.value.trim() || "",
      type,
      required: Boolean(row.querySelector("[data-builder-field-required]")?.checked),
      hint: row.querySelector("[data-builder-field-hint]")?.value.trim() || "",
      options,
      multiple: type === "file" && Boolean(row.querySelector("[data-builder-field-multiple]")?.checked),
      accept: type === "file" ? row.querySelector("[data-builder-field-accept]")?.value.trim() || "" : "",
    };
  });

  draft.steps = draft.steps.map((step, index) => {
    const row = root.querySelector(`[data-builder-step-row="${index}"]`);
    if (!row) return step;
    return {
      ...step,
      name: row.querySelector("[data-builder-step-name]")?.value.trim() || "",
      approverMode: row.querySelector("[data-builder-step-mode]")?.value === "all" ? "all" : "any",
      approverAccountIds: [...row.querySelectorAll(`[data-builder-step-account="${index}"]:checked`)].map((input) => input.value),
      // 新建/编辑后的流程均按具体人员路由；角色数组只保留给未编辑过的历史模板兼容使用。
      approverRoles: [],
      approverFields: (step.approverFields || []).map((field, fieldIndex) => {
        const fieldRow = row.querySelector(`[data-builder-approver-field-row="${fieldIndex}"]`);
        if (!fieldRow) return field;
        return {
          ...field,
          label: fieldRow.querySelector("[data-builder-approver-label]")?.value.trim() || "",
          type: fieldRow.querySelector("[data-builder-approver-type]")?.value || "text",
          required: Boolean(fieldRow.querySelector("[data-builder-approver-required]")?.checked),
        };
      }),
    };
  });

  const executionEnabled = Boolean(root.querySelector("[data-builder-execution-enabled]")?.checked);
  draft.execution = {
    enabled: executionEnabled,
    name: root.querySelector("[data-builder-execution-name]")?.value.trim() || "",
    executorAccountIds: [...root.querySelectorAll("[data-builder-execution-account]:checked")].map((input) => input.value),
    evidenceRequired: Boolean(root.querySelector("[data-builder-execution-evidence-required]")?.checked),
    evidenceLabel: root.querySelector("[data-builder-execution-evidence-label]")?.value.trim() || "执行凭证",
  };
}

function validateApprovalBuilderDraft(draft) {
  if (!draft.name) return "请填写审批类型名称";
  if (!draft.applicantRoles.length) return "请至少选择一个可发起角色";
  if (!draft.formFields.length) return "请至少添加一个申请字段";
  for (let index = 0; index < draft.formFields.length; index += 1) {
    const field = draft.formFields[index];
    if (!field.label) return `请填写申请字段 ${index + 1} 的名称`;
    if (["select", "radio"].includes(field.type) && !field.options.length) {
      return `请为「${field.label}」填写至少一个选项`;
    }
  }
  if (!draft.steps.length) return "请至少添加一个审批环节";
  for (let index = 0; index < draft.steps.length; index += 1) {
    const step = draft.steps[index];
    if (!step.name) return `请填写第 ${index + 1} 级审批的环节名称`;
    if (!step.approverAccountIds?.length) return `请为「${step.name}」选择至少一名具体审批人`;
    const emptyApproverField = (step.approverFields || []).find((field) => !field.label);
    if (emptyApproverField) return `请填写「${step.name}」中的审批人填写项名称`;
  }
  if (draft.execution?.enabled) {
    if (!draft.execution.name) return "请填写执行环节名称";
    if (!draft.execution.executorAccountIds?.length) return `请为「${draft.execution.name}」选择至少一名执行人`;
  }
  return "";
}

function moveApprovalBuilderItem(items, index, direction) {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return;
  [items[index], items[target]] = [items[target], items[index]];
}

function openApprovalTemplateBuilder(template = null) {
  const draft = approvalBuilderDraft(template);
  const root = document.querySelector("#dialogRoot");
  const applicantRoles = approvalBuilderRoleOptions({ includeTeacher: true });
  const iconOptions = ["📝", "📄", "📅", "💰", "🏫", "🔖", "🧾", "📦", "🔧", "🔓"];
  if (!iconOptions.includes(draft.icon)) iconOptions.push(draft.icon);

  root.innerHTML = `
    <div class="dialog-overlay" data-dialog-overlay>
      <div class="dialog-card approval-builder-card" role="dialog" aria-modal="true" aria-label="${template ? "编辑审批流程" : "新建审批类型"}">
        <div class="dialog-head approval-builder-head">
          <div>
            <h3>${template ? `编辑「${escapeHtml(template.name)}」` : "新建审批类型"}</h3>
            <p>按业务顺序配置即可，系统会自动生成内部标识，无需填写代码或 JSON。</p>
          </div>
          <span class="approval-builder-progress">基本信息 → 申请表单 → 审批流程 → 执行留痕</span>
        </div>
        <div class="approval-builder-body">
          <section class="approval-builder-section">
            <div class="approval-builder-section-title"><span>1</span><div><strong>基本信息</strong><small>申请人会在审批中心看到这些内容</small></div></div>
            <div class="approval-builder-grid">
              <label class="dialog-field">
                <span>审批类型名称<span class="dialog-required">*</span></span>
                <input data-builder-name value="${escapeHtml(draft.name)}" placeholder="例如：用章申请" />
              </label>
              <div class="approval-builder-icon-category">
                <label class="dialog-field">
                  <span>图标</span>
                  <select data-builder-icon>${iconOptions.map((icon) => `<option value="${escapeHtml(icon)}" ${icon === draft.icon ? "selected" : ""}>${escapeHtml(icon)}</option>`).join("")}</select>
                </label>
                <label class="dialog-field">
                  <span>分类</span>
                  <input data-builder-category value="${escapeHtml(draft.category)}" placeholder="例如：行政" />
                </label>
              </div>
              <label class="dialog-field approval-builder-wide">
                <span>用途说明</span>
                <textarea data-builder-description rows="2" placeholder="简要说明这个审批用于什么场景">${escapeHtml(draft.description)}</textarea>
              </label>
              <div class="approval-builder-wide">
                <span class="approval-builder-label">谁可以发起<span class="dialog-required">*</span></span>
                <div class="approval-builder-check-grid">
                  ${approvalBuilderRoleChecks(applicantRoles, draft.applicantRoles, "data-builder-applicant-role")}
                </div>
              </div>
            </div>
          </section>

          <section class="approval-builder-section">
            <div class="approval-builder-section-title">
              <span>2</span>
              <div><strong>申请表单</strong><small>申请人提交时需要填写的内容</small></div>
              <button class="ghost-button compact-button" data-builder-add-field type="button">+ 添加字段</button>
            </div>
            <div class="approval-builder-list" data-approval-builder-fields></div>
          </section>

          <section class="approval-builder-section">
            <div class="approval-builder-section-title">
              <span>3</span>
              <div><strong>审批流程</strong><small>按从上到下的顺序逐级流转，最多 8 级</small></div>
              <button class="ghost-button compact-button" data-builder-add-step type="button">+ 添加审批环节</button>
            </div>
            <div class="approval-builder-list" data-approval-builder-steps></div>
          </section>

          <section class="approval-builder-section">
            <div class="approval-builder-section-title">
              <span>4</span>
              <div><strong>执行环节（可选）</strong><small>审批全部通过后，指定人员执行并留存凭证</small></div>
            </div>
            <div data-approval-builder-execution></div>
          </section>
        </div>
        <p class="dialog-error" data-dialog-error></p>
        <div class="dialog-actions approval-builder-actions">
          <button class="ghost-button" data-dialog-cancel type="button">取消</button>
          <button class="primary-button" data-builder-submit type="button">${template ? "保存修改" : "创建审批类型"}</button>
        </div>
      </div>
    </div>
  `;
  root.setAttribute("aria-hidden", "false");
  document.body.classList.add("dialog-open");
  renderApprovalBuilderFields(root, draft);
  renderApprovalBuilderSteps(root, draft);
  renderApprovalBuilderExecution(root, draft);

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    root.innerHTML = "";
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("dialog-open");
    document.removeEventListener("keydown", onKey, true);
    activeDialogClose = null;
  };
  const onKey = (event) => {
    if (event.key === "Escape") close();
  };
  activeDialogClose = close;
  document.addEventListener("keydown", onKey, true);
  root.querySelector("[data-dialog-cancel]").addEventListener("click", close);
  root.querySelector("[data-dialog-overlay]").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) close();
  });

  root.addEventListener("change", (event) => {
    const person = event.target.closest("[data-builder-step-account]");
    if (person) {
      const stepRow = person.closest("[data-builder-step-row]");
      const count = stepRow?.querySelectorAll("[data-builder-step-account]:checked").length || 0;
      const countTarget = stepRow?.querySelector("[data-builder-approver-selected-count]");
      if (countTarget) countTarget.textContent = String(count);
      return;
    }
    const executor = event.target.closest("[data-builder-execution-account]");
    if (executor) {
      const count = root.querySelectorAll("[data-builder-execution-account]:checked").length;
      const countTarget = root.querySelector("[data-builder-executor-selected-count]");
      if (countTarget) countTarget.textContent = String(count);
      return;
    }
    if (event.target.closest("[data-builder-execution-enabled]")) {
      syncApprovalBuilderDraft(root, draft);
      renderApprovalBuilderExecution(root, draft);
      return;
    }
    if (!event.target.closest("[data-builder-field-type]")) return;
    syncApprovalBuilderDraft(root, draft);
    renderApprovalBuilderFields(root, draft);
  });

  root.addEventListener("input", (event) => {
    const search = event.target.closest("[data-builder-approver-search]");
    const executorSearch = event.target.closest("[data-builder-executor-search]");
    if (executorSearch) {
      const needle = executorSearch.value.trim().toLowerCase();
      const options = [...root.querySelectorAll("[data-builder-executor-option]")];
      let matched = 0;
      options.forEach((option) => {
        const visible = !needle || String(option.dataset.builderPersonSearch || "").includes(needle);
        option.hidden = !visible;
        if (visible) matched += 1;
      });
      const result = root.querySelector("[data-builder-executor-result]");
      if (result) result.textContent = needle ? `匹配到 ${matched} / ${options.length} 人` : `显示全部 ${options.length} 人`;
      const empty = root.querySelector("[data-builder-executor-empty]");
      if (empty) empty.hidden = matched > 0;
      return;
    }
    if (!search) return;
    const needle = search.value.trim().toLowerCase();
    const stepRow = search.closest("[data-builder-step-row]");
    const options = [...(stepRow?.querySelectorAll("[data-builder-approver-option]") || [])];
    let matched = 0;
    options.forEach((option) => {
      const visible = !needle || String(option.dataset.builderPersonSearch || "").includes(needle);
      option.hidden = !visible;
      if (visible) matched += 1;
    });
    const result = stepRow?.querySelector("[data-builder-approver-result]");
    if (result) result.textContent = needle ? `匹配到 ${matched} / ${options.length} 人` : `显示全部 ${options.length} 人`;
    const empty = stepRow?.querySelector("[data-builder-approver-empty]");
    if (empty) empty.hidden = matched > 0;
  });

  root.addEventListener("click", (event) => {
    const addField = event.target.closest("[data-builder-add-field]");
    if (addField) {
      syncApprovalBuilderDraft(root, draft);
      if (draft.formFields.length < 20) {
        draft.formFields.push({ key: nextApprovalBuilderKey(), label: "", type: "text", required: true, hint: "", options: [] });
        renderApprovalBuilderFields(root, draft);
        root.querySelector(`[data-builder-field-row="${draft.formFields.length - 1}"]`)?.scrollIntoView({ block: "nearest" });
      }
      return;
    }
    const removeField = event.target.closest("[data-builder-field-remove]");
    if (removeField) {
      syncApprovalBuilderDraft(root, draft);
      if (draft.formFields.length > 1) draft.formFields.splice(Number(removeField.dataset.index), 1);
      renderApprovalBuilderFields(root, draft);
      return;
    }
    const moveField = event.target.closest("[data-builder-field-move]");
    if (moveField) {
      syncApprovalBuilderDraft(root, draft);
      moveApprovalBuilderItem(draft.formFields, Number(moveField.dataset.index), moveField.dataset.builderFieldMove);
      renderApprovalBuilderFields(root, draft);
      return;
    }
    const addStep = event.target.closest("[data-builder-add-step]");
    if (addStep) {
      syncApprovalBuilderDraft(root, draft);
      if (draft.steps.length < 8) {
        draft.steps.push({ name: "审批", approverAccountIds: [], approverRoles: [], approverMode: "any", approverFields: [] });
        renderApprovalBuilderSteps(root, draft);
        root.querySelector(`[data-builder-step-row="${draft.steps.length - 1}"]`)?.scrollIntoView({ block: "nearest" });
      }
      return;
    }
    const removeStep = event.target.closest("[data-builder-step-remove]");
    if (removeStep) {
      syncApprovalBuilderDraft(root, draft);
      if (draft.steps.length > 1) draft.steps.splice(Number(removeStep.dataset.index), 1);
      renderApprovalBuilderSteps(root, draft);
      return;
    }
    const moveStep = event.target.closest("[data-builder-step-move]");
    if (moveStep) {
      syncApprovalBuilderDraft(root, draft);
      moveApprovalBuilderItem(draft.steps, Number(moveStep.dataset.index), moveStep.dataset.builderStepMove);
      renderApprovalBuilderSteps(root, draft);
      return;
    }
    const addApproverField = event.target.closest("[data-builder-add-approver-field]");
    if (addApproverField) {
      syncApprovalBuilderDraft(root, draft);
      const step = draft.steps[Number(addApproverField.dataset.stepIndex)];
      step.approverFields.push({ key: nextApprovalBuilderKey("approval"), label: "", type: "text", required: false, hint: "" });
      renderApprovalBuilderSteps(root, draft);
      return;
    }
    const removeApproverField = event.target.closest("[data-builder-approver-remove]");
    if (removeApproverField) {
      syncApprovalBuilderDraft(root, draft);
      const step = draft.steps[Number(removeApproverField.dataset.stepIndex)];
      step.approverFields.splice(Number(removeApproverField.dataset.fieldIndex), 1);
      renderApprovalBuilderSteps(root, draft);
    }
  });

  root.querySelector("[data-builder-submit]").addEventListener("click", async () => {
    const submitButton = root.querySelector("[data-builder-submit]");
    const errorEl = root.querySelector("[data-dialog-error]");
    syncApprovalBuilderDraft(root, draft);
    const validationMessage = validateApprovalBuilderDraft(draft);
    if (validationMessage) {
      errorEl.textContent = validationMessage;
      return;
    }
    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    errorEl.textContent = "";
    try {
      if (template) {
        await apiRequest(`/api/oa/admin/templates/${encodeURIComponent(template.key)}`, { method: "PATCH", body: draft });
      } else {
        await apiRequest("/api/oa/admin/templates", { method: "POST", body: { ...draft, key: nextOaTemplateKey() } });
      }
      close();
      showToast(template ? "流程已更新" : "审批类型已创建");
      await loadOaAdminTemplates();
    } catch (error) {
      errorEl.textContent = error.message || "保存失败，请重试";
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
    }
  });

  root.querySelector("[data-builder-name]")?.focus();
}

async function openOaTemplateEditor(templateKey) {
  const template = oaAdminState.templates.find((item) => item.key === templateKey);
  if (!template) return;
  openApprovalTemplateBuilder(template);
}

async function openOaTemplateCreator() {
  openApprovalTemplateBuilder();
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
          <label class="field-label">任教学科（任课教师必填；生活老师无需选择）<select id="hrFlow-subjectId"><option value="">—</option>${(state.schedulingConfig?.subjects?.length ? state.schedulingConfig.subjects : Object.values(state.subjects || {})).map((subject) => `<option value="${subject.id}">${escapeHtml(subject.name)}</option>`).join("")}</select></label>
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
  syncLifeTeacherPositionChoices("#hrFlow-orgUnitId", "#hrFlow-positionId");
  syncLifeTeacherPositionChoices("#hrFlow-targetOrgUnitId", "#hrFlow-targetPositionId");
}

function resetHrFrontendStates() {
  hrEmployeePage = { ...hrEmployeePage, loaded: false, error: "", page: 1 };
  hrEmployeeDetailState = { id: "", detail: null, loading: false, error: "", creating: false };
  hrOrgState = { ...hrOrgState, loaded: false, error: "" };
  personnelTagState = { tags: [], loaded: false, loading: false, error: "" };
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
    if (scopeTab.dataset.oaScope === "cc") await markUnreadOaCcNoticesRead();
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
  if (event.target.closest("#downloadPortingTemplate")) {
    downloadPortingFile("template");
    return;
  }
  if (event.target.closest("#exportPortingCsv")) {
    downloadPortingFile("export");
    return;
  }
  if (event.target.closest("#previewPortingImport")) {
    previewPortingImport();
    return;
  }
  if (event.target.closest("#commitPortingImport")) {
    commitPortingImport();
    return;
  }
  if (event.target.closest("#clearPortingCsv")) {
    dataPortingState = { ...initialDataPortingState(), entity: dataPortingState.entity, stageId: dataPortingState.stageId };
    const fileInput = document.querySelector("#dataPortingFile");
    if (fileInput) fileInput.value = "";
    renderDataPorting();
    return;
  }
  if (event.target.closest("#refreshResourceLedger")) {
    loadResourceLedger();
    return;
  }
  if (event.target.closest("#exportResourceLedger")) {
    exportResourceLedgerFile();
    return;
  }
  if (event.target.closest("#refreshWeeklyWorkload")) {
    loadWeeklyWorkload();
    return;
  }
  if (event.target.closest("#exportWeeklyWorkload")) {
    exportReport("weekly");
    return;
  }
  if (event.target.closest("#printWeeklyWorkload")) {
    printReport("weekly");
    return;
  }
  if (event.target.closest("#refreshAnnualSalary")) {
    loadAnnualSalary();
    return;
  }
  if (event.target.closest("#exportAnnualSalary")) {
    exportReport("annual");
    return;
  }
  if (event.target.closest("#printAnnualSalary")) {
    printReport("annual");
    return;
  }
  if (event.target.closest("#exportScheduleExcel")) {
    exportScheduleExcel();
  }
  if (event.target.closest("#printSchedule")) {
    printSchedule();
  }
});

document.addEventListener("change", (event) => {
  const appointmentToggle = event.target.closest("[data-hr-role]");
  if (!appointmentToggle) return;
  syncHrAppointmentDependentFields(appointmentToggle.closest(".hr-appointment-section") || document);
});

document.addEventListener("click", (event) => {
  const budgetDetailsToggle = event.target.closest("[data-budget-details-toggle]");
  if (!budgetDetailsToggle) return;
  const key = budgetDetailsToggle.dataset.budgetDetailsToggle || "";
  budgetUsageExpandedKey = budgetUsageExpandedKey === key ? "" : key;
  render();
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-budget-term-select]")) {
    const termId = String(event.target.value || "");
    if (!termId || termId === selectedBudgetTermId()) return;
    termBudgetState = { ...initialTermBudgetState(), termId };
    budgetUsageExpandedKey = "";
    loadTermBudget(true);
    return;
  }
  if (event.target.id === "oaStatusFilter") {
    loadOaRequests({ status: event.target.value, page: 1 });
    return;
  }
  if (event.target.id === "dataPortingEntity") {
    // 换数据类型必须丢掉上一份预检结果，否则会拿班级的预检去导教室
    dataPortingState = { ...initialDataPortingState(), entity: event.target.value, stageId: dataPortingState.stageId };
    const f = document.querySelector("#dataPortingFile");
    if (f) f.value = "";
    renderDataPorting();
    return;
  }
  if (event.target.id === "dataPortingStage") {
    dataPortingState = { ...dataPortingState, stageId: event.target.value };
    return;
  }
  if (event.target.id === "dataPortingCsv") {
    // 内容改了，之前的预检结果就作废了，不能还允许点「确认导入」
    dataPortingState = { ...dataPortingState, csvText: event.target.value, preview: null, error: "" };
    renderDataPorting();
    return;
  }
  if (event.target.id === "dataPortingFile") {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((textContent) => {
      dataPortingState = { ...dataPortingState, csvText: textContent, fileName: file.name, preview: null, error: "" };
      renderDataPorting();
      showToast(`已读取 ${file.name}`);
    });
    return;
  }
  if (event.target.id === "ledgerStage") {
    resourceLedgerState = { ...resourceLedgerState, stageId: event.target.value };
    loadResourceLedger();
    return;
  }
  if (event.target.id === "ledgerRoomType") {
    resourceLedgerState = { ...resourceLedgerState, roomType: event.target.value };
    loadResourceLedger();
    return;
  }
  if (event.target.id === "ledgerKeyword") {
    resourceLedgerState = { ...resourceLedgerState, keyword: event.target.value };
    loadResourceLedger();
    return;
  }
  if (event.target.id === "ledgerOnlyIdle") {
    resourceLedgerState = { ...resourceLedgerState, onlyIdle: event.target.checked };
    loadResourceLedger();
    return;
  }
  // 统计报表的筛选器：改动即重查，不用再点刷新
  if (event.target.id === "weeklyWorkloadWeek") {
    weeklyWorkloadState = { ...weeklyWorkloadState, weekStart: event.target.value };
    loadWeeklyWorkload();
    return;
  }
  if (event.target.id === "weeklyWorkloadStage") {
    weeklyWorkloadState = { ...weeklyWorkloadState, stageId: event.target.value };
    loadWeeklyWorkload();
    return;
  }
  if (event.target.id === "weeklyWorkloadIdle") {
    weeklyWorkloadState = { ...weeklyWorkloadState, includeIdle: event.target.checked };
    loadWeeklyWorkload();
    return;
  }
  if (event.target.id === "annualSalaryYear") {
    annualSalaryState = { ...annualSalaryState, year: Number(event.target.value) };
    loadAnnualSalary();
    return;
  }
  if (event.target.id === "annualSalaryStage") {
    annualSalaryState = { ...annualSalaryState, stageId: event.target.value };
    loadAnnualSalary();
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
    else if (key === "personnelTags") loadPersonnelTags();
    else if (key === "financeTeachers") loadFinanceTeacherPage({ page: financeTeacherPage.page });
    return;
  }

  const employeeRow = event.target.closest("[data-hr-employee]");
  if (employeeRow) {
    loadHrEmployeeDetail(employeeRow.dataset.hrEmployee);
    return;
  }

  if (event.target.closest("#personnelTagCreate")) {
    const values = await openDialog({
      title: "新增人员标签",
      description: "标签可在人员档案中多选分配，仅用于人员识别。",
      confirmText: "新增",
      fields: [
        { name: "name", label: "标签名称", placeholder: "例如：骨干教师", required: true },
        {
          name: "color",
          label: "标签颜色",
          type: "select",
          value: "blue",
          options: [
            { value: "blue", label: "蓝色" },
            { value: "green", label: "绿色" },
            { value: "orange", label: "橙色" },
            { value: "purple", label: "紫色" },
            { value: "gray", label: "灰色" },
          ],
        },
      ],
    });
    if (!values) return;
    try {
      await apiRequest("/api/hr/personnel-tags", { method: "POST", body: values });
      personnelTagState = { ...personnelTagState, loaded: false };
      showToast("人员标签已新增");
      render();
    } catch (error) {
      showToast(error.message || "新增标签失败");
    }
    return;
  }

  const personnelTagDeleteButton = event.target.closest("[data-personnel-tag-delete]");
  if (personnelTagDeleteButton) {
    const tagName = personnelTagDeleteButton.dataset.personnelTagName || "该标签";
    if (
      !(await confirmDialog(`删除“${tagName}”`, {
        description: "删除后会同步从所有人员档案中移除该标签，不能恢复。",
        confirmText: "删除标签",
        danger: true,
      }))
    ) {
      return;
    }
    try {
      const result = await apiRequest(`/api/hr/personnel-tags/${encodeURIComponent(personnelTagDeleteButton.dataset.personnelTagDelete)}`, {
        method: "DELETE",
      });
      personnelTagState = { ...personnelTagState, loaded: false };
      hrEmployeePage.loaded = false;
      if (hrEmployeeDetailState.id) loadHrEmployeeDetail(hrEmployeeDetailState.id);
      else render();
      showToast(`标签已删除，并从 ${result.affectedEmployeeCount || 0} 人档案中移除`);
    } catch (error) {
      showToast(error.message || "删除标签失败");
    }
    return;
  }

  if (event.target.closest("[data-personnel-tag-config-open]")) {
    switchView("personnelTagConfig");
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
          ...(document.querySelector("#hrNew-managementLevel")
            ? { managementLevel: document.querySelector("#hrNew-managementLevel").value }
            : {}),
          ...(document.querySelector("#hrNew-workStatus")
            ? { workStatus: document.querySelector("#hrNew-workStatus").value }
            : {}),
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
      const body = {};
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
        // 高层/中层/普通仅在总校人事 + 行政的详情页中存在，其他角色不提交该字段。
        "managementLevel",
        // 协议雇佣类型和协议月薪同样仅由总校人事 + 行政维护。
        "employmentType",
        "agreementMonthlySalary",
        // 就业／待岗同样由总校人事 + 行政维护。
        "workStatus",
      ].forEach((field) => {
        const input = document.querySelector(`#hrEmp-${field}`);
        if (input) body[field] = input.value;
      });
      // 兼岗任命随档案一并保存
      body.teacherRoles = hrTeacherRolesFromInputs();
      // 只在标签定义已加载成功时提交；加载失败或仍在加载中不能误清空已有标签。
      if (canManagePersonnelTags() && personnelTagState.loaded && !personnelTagState.error) {
        body.tagIds = [...document.querySelectorAll("[data-hr-employee-tag]:checked")].map((input) => input.dataset.hrEmployeeTag);
      }
      const idCard = document.querySelector("#hrEmp-idCard").value.trim();
      const bankCard = document.querySelector("#hrEmp-bankCard").value.trim();
      if (idCard) body.idCard = idCard;
      if (bankCard) body.bankCard = bankCard;
      await apiRequest(`/api/hr/employees/${employeeId}`, { method: "PATCH", body });
    }, "档案已保存");
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

  if (event.target.closest("#myAccountChangePassword")) {
    await changeOwnPasswordFromAccount();
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
  // 左下角/顶部账户卡：所有账号均可进入「我的账户」修改自己的密码。
  if (event.target.closest("#accountSummary") || event.target.closest(".teacher-card")) {
    if (viewAllowed("myHrProfile")) {
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
  // 隐藏的面板不能生成跳转项。教学期创建面板已经从排课账号界面移除；若仍把它
  // 收进目录，就会留下一个写着“教学学期管理”却点不到任何内容的假入口。
  const panels = [...view.querySelectorAll("section.panel")].filter(
    (panel) => !panel.hidden && panel.querySelector(".panel-heading h2"),
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

document.querySelector("#generateSchedule").addEventListener("click", generateAdminSchedule);
document.querySelector("#confirmSchedule").addEventListener("click", confirmAndPublishSchedule);
document.querySelector("#refreshSchedulePrecheck").addEventListener("click", refreshBackendSchedulePrecheck);
document.querySelector("#saveClassStructure").addEventListener("click", saveAdminClassStructure);
document.querySelector("#saveHighClassStructure").addEventListener("click", saveAdminClassStructure);
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
  if (backendMode() && isTeacherAccount()) {
    await confirmBackendWorkload(currentTeacherId(), selectedTeacherConfirmationMonth());
    return;
  }

  const teacherId = currentTeacherId();
  const pendingCount = teacherLessons(teacherId).filter(
    (lesson) => lesson.status !== "cancelled" && lesson.date > todayKey(),
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
  if (backendMode() && isTeacherAccount()) {
    await disputeBackendPayroll(currentTeacherId(), selectedTeacherConfirmationMonth());
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
  ["#financeRecordsStageFilter", "records"],
  ["#settlementStageFilter", "settlement"],
].forEach(([selector, context]) => {
  document.querySelector(selector).addEventListener("change", () => {
    applyFinanceTeacherFilters(context, { resetGrade: true });
  });
});

[
  ["#financeRecordsGradeFilter", "records"],
  ["#settlementGradeFilter", "settlement"],
].forEach(([selector, context]) => {
  document.querySelector(selector).addEventListener("change", () => {
    applyFinanceTeacherFilters(context);
  });
});

[
  ["#financeRecordsSearchButton", "records"],
  ["#settlementTeacherSearchButton", "settlement"],
].forEach(([selector, context]) => {
  document.querySelector(selector).addEventListener("click", () => {
    applyFinanceTeacherFilters(context);
  });
});

[
  ["#financeRecordsSearch", "records"],
  ["#settlementTeacherSearch", "settlement"],
].forEach(([selector, context]) => {
  document.querySelector(selector).addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyFinanceTeacherFilters(context);
  });
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

document.querySelector("#scheduleWeekSelect").addEventListener("change", async (event) => {
  state.selectedScheduleWeekStart = event.target.value;
  const weekDates = weekDateKeys(state.selectedScheduleWeekStart);
  state.selectedScheduleDate = weekDates.includes(todayKey()) ? todayKey() : weekDates[0];
  if (backendMode() && isTeacherAccount()) {
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

document.querySelector("#adminSchedulingTermSelect").addEventListener("change", async (event) => {
  state.selectedSchedulingTermId = event.target.value;
  state.selectedSchedulingClassId = "";
  state.selectedScheduleAssignmentId = "";
  state.scheduleReplanScope = emptyScheduleReplanScope();
  schedulingBackendState = { ...schedulingBackendState, loaded: false, loading: false, error: "", job: null, precheck: null };
  if (backendMode() && currentRole() === "admin") {
    await loadBackendSchedulingContext();
  } else {
    render();
  }
});

document.querySelector("#overviewDivisionSelect").addEventListener("change", async (event) => {
  applySchedulingSelection(event.target.value);
  if (backendMode() && canViewSchedulingOverview()) {
    await loadBackendSchedulingContext();
  } else {
    render();
  }
});

document.querySelector("#overviewGradeSelect").addEventListener("change", async (event) => {
  applySchedulingSelection(state.selectedSchedulingDivisionId, event.target.value);
  if (backendMode() && canViewSchedulingOverview()) {
    await loadBackendSchedulingContext();
  } else {
    render();
  }
});

document.querySelector("#createTermButton").addEventListener("click", createBackendTerm);

document.querySelector("#addAcademicCalendarEntry").addEventListener("click", () => {
  openAcademicCalendarDialog();
});

document.querySelector("#academicCalendarTypeFilter").addEventListener("change", (event) => {
  academicCalendarState = { ...academicCalendarState, periodTagFilter: event.target.value || "all" };
  renderAcademicCalendar();
});

document.querySelector("#attendanceMonthInput").addEventListener("change", (event) => {
  attendanceUploadState = { ...attendanceUploadState, month: event.target.value || currentSettlementMonth(), loaded: false, error: "" };
  loadAttendanceUploads({ month: attendanceUploadState.month, stageId: attendanceUploadState.stageId });
});

document.querySelector("#attendanceStageSelect").addEventListener("change", (event) => {
  attendanceUploadState = { ...attendanceUploadState, stageId: event.target.value || "", loaded: false, error: "" };
  loadAttendanceUploads({ month: selectedAttendanceMonth(), stageId: attendanceUploadState.stageId });
});

document.querySelector("#attendanceUploadButton").addEventListener("click", () => {
  uploadAttendanceWorkbook();
});

document.querySelector("#addTransportRoute")?.addEventListener("click", () => {
  openTransportRouteDialog();
});

document.querySelector("#transportRouteTermSelect")?.addEventListener("change", (event) => {
  loadTransportRoutes({ termId: event.target.value || "" });
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-edit-academic-calendar]");
  if (button) {
    const entry = (academicCalendarState.entries || []).find((item) => item.id === button.dataset.editAcademicCalendar);
    if (entry) openAcademicCalendarDialog(entry);
    return;
  }
  const setCurrentButton = event.target.closest("[data-calendar-set-current]");
  if (setCurrentButton) {
    await setAcademicCalendarCurrentTerm(setCurrentButton.dataset.calendarSetCurrent);
    return;
  }
  const archiveButton = event.target.closest("[data-calendar-archive-term]");
  if (archiveButton) await archiveAcademicCalendarTerm(archiveButton.dataset.calendarArchiveTerm);
});

document.querySelector("#regularClassCountInput").addEventListener("input", updateClassStructurePreview);
document.querySelector("#experimentalClassCountInput").addEventListener("input", updateClassStructurePreview);
["#highAClassCountInput", "#highBClassCountInput", "#highCClassCountInput"].forEach((selector) => {
  document.querySelector(selector).addEventListener("input", updateClassStructurePreview);
});
document.querySelector("#scheduleTemplateSelect").addEventListener("change", (event) => {
  setActiveScheduleTemplate(event.target.value);
});
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

document.querySelector("#changeAssignmentSelect")?.addEventListener("change", (event) => {
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

document.addEventListener("change", (event) => {
  const typeSelect = event.target.closest("[data-schedule-period-type]");
  if (!typeSelect) return;
  const row = typeSelect.closest("[data-schedule-period-row]");
  const fields = row?.querySelector("[data-schedule-nonregular-fields]");
  if (!fields) return;
  const isNonRegular = typeSelect.value !== "regular";
  fields.hidden = !isNonRegular;
  if (!isNonRegular) {
    const contentInput = row.querySelector("[data-schedule-period-content]");
    const responsibleSelect = row.querySelector("[data-schedule-period-responsible]");
    if (contentInput) contentInput.value = "";
    if (responsibleSelect) responsibleSelect.value = "";
  }
});

document.querySelector("#submitScheduleChangeRequest")?.addEventListener("click", () => {
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
document.querySelector("#saveAssessmentScore")?.addEventListener("click", saveBackendTeacherAssessmentScore);

render();

if (backendMode()) {
  loadBackendNotifications().then(render);
  if (isTeacherAccount()) {
    loadBackendTeacherContext(currentTeacherId(), "auto").then(render);
  }
  if (isFinanceRole()) {
    loadFinanceTeacherPage({ page: financeTeacherPage.page });
    if (canExportAllPayrollDetails()) loadPayrollRules();
  }
  if (currentRole() === "admin") {
    loadTermContext().then(() => loadBackendSchedulingContext());
  }
  if (currentRole() === "system_admin") {
    loadPersonnelPage({ page: personnelPage.page });
  }
  if (currentRole() === "security_manager") {
    loadTransportRoutes();
  }
}

// ---------------------------------------------------------------------------
// 账套管理（验收 8.1 - 8.18）
//
// 第八章 18 项里有 12 项的验收方式是「现场执行」——现场新建学年账套、现场走
// 解锁审批、现场导出恢复。这些动作必须由校方的人自己点得出来，只有后端接口
// 是过不了的。
// ---------------------------------------------------------------------------

function canManageLedger(role = currentRole()) {
  return role === "system_admin";
}
function canRestoreLedger(role = currentRole()) {
  return role === "system_admin";
}
function canExportAudit(role = currentRole()) {
  return ["hr", "system_admin", "division_head", "principal"].includes(role);
}

async function loadLedgers(overrides = {}) {
  if (!backendMode()) return;
  ledgerState = { ...ledgerState, ...overrides, loading: true, error: "" };
  renderLedgers();
  try {
    const params = new URLSearchParams();
    if (ledgerState.type) params.set("type", ledgerState.type);
    if (ledgerState.status) params.set("status", ledgerState.status);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    const result = await apiRequest(`/api/ledgers${suffix}`);
    ledgerState = { ...ledgerState, ledgers: result.ledgers || [], loaded: true, loading: false };
  } catch (error) {
    ledgerState = { ...ledgerState, loading: false, loaded: true, error: error.message || "加载失败" };
  }
  renderLedgers();
}

async function createLedger() {
  const type = document.querySelector("#ledgerNewType")?.value || "";
  const period = String(document.querySelector("#ledgerNewPeriod")?.value || "").trim();
  const carryOver = Boolean(document.querySelector("#ledgerNewCarryOver")?.checked);
  const hint = document.querySelector("#ledgerCreateHint");
  if (!period) {
    if (hint) hint.textContent = "请填写期间";
    showToast("请填写期间");
    return;
  }
  try {
    const result = await apiRequest(`/api/ledgers/${encodeURIComponent(type)}/${encodeURIComponent(period)}`, {
      method: "POST",
      body: { carryOver },
    });
    const carried = Number(result.ledger?.carriedOver || 0);
    const message = result.created
      ? `已建立${LEDGER_TYPE_LABELS[type] || type} ${period}${carried ? `，结转 ${carried} 名教职工` : ""}`
      : `${LEDGER_TYPE_LABELS[type] || type} ${period} 已存在，未重复建立`;
    if (hint) hint.textContent = message;
    showToast(message);
    await loadLedgers();
  } catch (error) {
    if (hint) hint.textContent = error.message || "建立失败";
    showToast(error.message || "建立失败");
  }
}

async function transitionLedgerState(type, period, to) {
  const label = LEDGER_STATUS_LABELS[to] || to;
  // 锁定与归档都不能靠一次误点就生效：锁了要走审批才能解，归档会把数据卸出内存
  const reason = window.prompt(`将「${LEDGER_TYPE_LABELS[type] || type} ${period}」置为${label}，请填写原因：`, "");
  if (reason === null) return;
  if (!String(reason).trim()) {
    showToast("必须填写原因——这条会写进操作日志");
    return;
  }
  try {
    await apiRequest(`/api/ledgers/${encodeURIComponent(type)}/${encodeURIComponent(period)}/transition`, {
      method: "POST",
      body: { to, reason: String(reason).trim() },
    });
    showToast(`已${label}`);
    await loadLedgers();
  } catch (error) {
    showToast(error.message || "操作失败");
  }
}

async function carryOverLedger(type, period) {
  try {
    const result = await apiRequest(`/api/ledgers/${encodeURIComponent(type)}/${encodeURIComponent(period)}/carry-over`, {
      method: "POST",
    });
    const roster = result.roster || {};
    showToast(`已结转：在职 ${roster.inServiceCount ?? 0} 人、离职 ${roster.leftCount ?? 0} 人`);
    await loadLedgers();
  } catch (error) {
    showToast(error.message || "结转失败");
  }
}

async function downloadLedgerBackup(type, period) {
  try {
    const result = await apiRequest(
      `/api/ledgers/${encodeURIComponent(type)}/${encodeURIComponent(period)}/backup`,
    );
    downloadTextFile(result.content, result.filename, result.mimeType || "application/json");
    showToast(`已导出 ${result.total} 条记录`);
  } catch (error) {
    showToast(error.message || "导出失败");
  }
}

async function restoreLedgerBackup() {
  const input = document.querySelector("#ledgerRestoreFile");
  const hint = document.querySelector("#ledgerRestoreHint");
  const file = input?.files?.[0];
  if (!file) {
    if (hint) hint.textContent = "请先选择备份文件";
    showToast("请先选择备份文件");
    return;
  }
  let backup = null;
  try {
    backup = JSON.parse(await file.text());
  } catch (error) {
    if (hint) hint.textContent = "文件不是有效的 JSON 备份";
    showToast("文件不是有效的 JSON 备份");
    return;
  }
  const force = Boolean(document.querySelector("#ledgerRestoreForce")?.checked);
  if (force && !window.confirm("覆盖会用备份内容替换现有账套数据，且不可撤销。确定继续？")) return;
  try {
    const result = await apiRequest("/api/ledgers/import", { method: "POST", body: { backup, force } });
    // 字段名是 total（imported + replaced），不是 restored——写错了会一直显示「已恢复 0 条」，
    // 而恢复其实成功了，操作的人会以为失败又跑一遍
    const message = `已恢复 ${result.total ?? 0} 条记录（新增 ${result.imported ?? 0}、覆盖 ${result.replaced ?? 0}）`;
    if (hint) hint.textContent = message;
    showToast(message);
    if (input) input.value = "";
    await loadLedgers();
  } catch (error) {
    if (hint) hint.textContent = error.message || "恢复失败";
    showToast(error.message || "恢复失败");
  }
}

/**
 * 导出审计报表（验收 8.16「现场导出并离线打开」）。
 *
 * 空报表也照样下载，只是提示里写清楚是 0 条：「导出后发现是空的」和
 * 「导出失败了」是两件事，不给文件的话操作的人分不清是哪一种。
 */
async function exportAuditReport() {
  const hint = document.querySelector("#auditReportHint");
  const params = new URLSearchParams();
  const from = document.querySelector("#auditReportFrom")?.value || "";
  const to = document.querySelector("#auditReportTo")?.value || "";
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (from && to && from > to) {
    if (hint) hint.textContent = "起始日期不能晚于截止日期";
    showToast("起始日期不能晚于截止日期");
    return;
  }
  try {
    const suffix = params.toString() ? `?${params.toString()}` : "";
    const result = await apiRequest(`/api/audit-report${suffix}`);
    downloadTextFile(result.content, result.filename, result.mimeType || "application/vnd.ms-excel");
    const c = result.counts || {};
    const message = `已导出 ${result.total} 条：人事审计 ${c.hr ?? 0}、系统审计 ${c.system ?? 0}、账套操作 ${c.ledgers ?? 0}`;
    if (hint) hint.textContent = message;
    showToast(message);
  } catch (error) {
    if (hint) hint.textContent = error.message || "导出失败";
    showToast(error.message || "导出失败");
  }
}

async function loadReconciliation(run = false) {
  if (!backendMode()) return;
  const month = document.querySelector("#ledgerReconcileMonth")?.value || ledgerReconcileState.month;
  if (!month) {
    showToast("请选择核算月份");
    return;
  }
  ledgerReconcileState = { ...ledgerReconcileState, month, loading: true, error: "" };
  renderLedgerReconcile();
  try {
    const result = await apiRequest(`/api/reconciliation?month=${encodeURIComponent(month)}`, {
      method: run ? "POST" : "GET",
    });
    ledgerReconcileState = { ...ledgerReconcileState, report: result.report || null, loading: false };
  } catch (error) {
    ledgerReconcileState = { ...ledgerReconcileState, loading: false, error: error.message || "对账失败" };
  }
  renderLedgerReconcile();
}

function renderLedgers() {
  if (state.activeView !== "ledgers") return;
  const table = document.querySelector("#ledgerTable");
  const summary = document.querySelector("#ledgerSummary");
  if (!table || !summary) return;

  // 只有能操作的角色才看得到建立/恢复面板——看得到点不动比看不到更让人困惑
  const createPanel = document.querySelector("#ledgerCreatePanel");
  if (createPanel) createPanel.hidden = !canManageLedger();
  const restorePanel = document.querySelector("#ledgerRestorePanel");
  if (restorePanel) restorePanel.hidden = !canRestoreLedger();
  // 审计导出的可见范围比账套操作宽：校领导和学部负责人不能建账套，
  // 但要能导出审计报表——那正是他们要看的东西
  const auditPanel = document.querySelector("#ledgerAuditExportPanel");
  if (auditPanel) auditPanel.hidden = !canExportAudit();

  if (!ledgerState.loaded && !ledgerState.loading) {
    loadLedgers();
    return;
  }
  setReportStatus("#ledgerStatus", ledgerState.loading ? "加载中" : ledgerState.error ? "加载失败" : "就绪");

  if (ledgerState.error) {
    summary.innerHTML = "";
    table.innerHTML = `<p class="empty-hint">${escapeHtml(ledgerState.error)}</p>`;
    return;
  }

  const list = ledgerState.ledgers;
  summary.innerHTML = [
    { label: "账套总数", value: list.length },
    { label: "使用中", value: list.filter((l) => l.status === "active").length },
    { label: "已锁定", value: list.filter((l) => l.status === "locked").length },
    { label: "已归档（不占内存）", value: list.filter((l) => l.status === "archived").length },
  ]
    .map(
      (m) =>
        `<article class="metric"><p class="metric-label">${escapeHtml(m.label)}</p><p class="metric-value">${escapeHtml(String(m.value))}</p></article>`,
    )
    .join("");

  if (!list.length) {
    table.innerHTML = '<p class="empty-hint">还没有账套。新建学年或新核算月份时在下方建立。</p>';
    return;
  }

  const manage = canManageLedger();
  table.innerHTML = `
    <table class="report-table">
      <thead>
        <tr>
          <th>类型</th><th>期间</th><th>状态</th><th>本期明细</th>
          <th>结转在职</th><th>结转离职</th><th>可写</th><th>已加载</th><th>解锁次数</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${list
          .map((l) => {
            const actions = [];
            if (manage) {
              // 已锁定的账套没有「解锁」按钮，只有「申请解锁」——解锁必须走三级审批（8.10）。
              // 但也不能什么入口都不给：那样账套一锁就是永久锁死，操作的人
              // 只会以为系统坏了，而不是「这里要走审批」。
              if (l.status === "locked") {
                actions.push(
                  `<button class="ghost-button compact-button" data-ledger-unlock="1" data-ledger-type="${escapeHtml(l.type)}" data-ledger-period="${escapeHtml(l.period)}" type="button">申请解锁</button>`,
                );
              }
              (LEDGER_NEXT_STATUS[l.status] || []).forEach((to) => {
                actions.push(
                  `<button class="ghost-button compact-button" data-ledger-to="${escapeHtml(to)}" data-ledger-type="${escapeHtml(l.type)}" data-ledger-period="${escapeHtml(l.period)}" type="button">${escapeHtml(LEDGER_ACTION_LABELS[to] || to)}</button>`,
                );
              });
              if (l.writable) {
                actions.push(
                  `<button class="ghost-button compact-button" data-ledger-carry="1" data-ledger-type="${escapeHtml(l.type)}" data-ledger-period="${escapeHtml(l.period)}" type="button">结转名册</button>`,
                );
              }
              actions.push(
                `<button class="ghost-button compact-button" data-ledger-backup="1" data-ledger-type="${escapeHtml(l.type)}" data-ledger-period="${escapeHtml(l.period)}" type="button">导出备份</button>`,
              );
            }
            return `<tr>
              <td>${escapeHtml(l.typeLabel || LEDGER_TYPE_LABELS[l.type] || l.type)}</td>
              <td>${escapeHtml(l.periodLabel || l.period)}</td>
              <td><span class="status-pill">${escapeHtml(l.statusLabel || LEDGER_STATUS_LABELS[l.status] || l.status)}</span></td>
              <td>${escapeHtml(String(l.records ?? 0))}</td>
              <td>${escapeHtml(String(l.roster?.inServiceCount ?? "—"))}</td>
              <td>${escapeHtml(String(l.roster?.leftInPeriodCount ?? l.roster?.leftCount ?? "—"))}</td>
              <td>${l.writable ? "是" : "否"}</td>
              <td>${l.loaded ? "是" : "否（归档）"}</td>
              <td>${escapeHtml(String(l.unlockCount ?? 0))}</td>
              <td class="ledger-actions">${actions.join(" ") || "—"}</td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>`;
}

function renderLedgerReconcile() {
  if (state.activeView !== "ledgers") return;
  const monthInput = document.querySelector("#ledgerReconcileMonth");
  if (monthInput && !monthInput.value) {
    monthInput.value = ledgerReconcileState.month || currentSettlementMonth();
  }
  const summary = document.querySelector("#ledgerReconcileSummary");
  const table = document.querySelector("#ledgerReconcileTable");
  if (!summary || !table) return;

  const { loading, error, report } = ledgerReconcileState;
  setReportStatus("#ledgerReconcileStatus", loading ? "对账中" : error ? "对账失败" : report ? (report.balanced ? "已对平" : `${report.differences?.length || 0} 处差异`) : "未运行");

  if (error) {
    summary.innerHTML = "";
    table.innerHTML = `<p class="empty-hint">${escapeHtml(error)}</p>`;
    return;
  }
  if (!report) {
    summary.innerHTML = "";
    table.innerHTML = '<p class="empty-hint">选择月份后点「运行对账」。</p>';
    return;
  }

  summary.innerHTML = [
    { label: "人事在岗", value: report.headcount?.hrInService ?? 0 },
    { label: "本月工资单", value: report.headcount?.payrollCount ?? 0 },
    { label: "排课课时", value: report.workload?.totalScheduledUnits ?? 0 },
    { label: "计薪课时", value: report.workload?.totalPaidUnits ?? 0 },
    { label: "差异", value: report.differences?.length ?? 0 },
  ]
    .map(
      (m) =>
        `<article class="metric"><p class="metric-label">${escapeHtml(m.label)}</p><p class="metric-value">${escapeHtml(String(m.value))}</p></article>`,
    )
    .join("");

  const diffs = report.differences || [];
  if (!diffs.length) {
    table.innerHTML = `<p class="empty-hint">${escapeHtml(report.month)} 三方已对平，无差异。</p>`;
    return;
  }
  // 还没生成工资单的月份会一口气报出全校一千多条同样的差异。全渲染进 DOM 页面会卡，
  // 而且一千条一模一样的「在岗但无工资单」对人没有任何可操作性。
  // 截断，但必须写清楚截断了多少——不说的话看起来就像「只有 200 处差异」。
  const DIFF_DISPLAY_LIMIT = 200;
  const shown = diffs.slice(0, DIFF_DISPLAY_LIMIT);
  const omitted = diffs.length - shown.length;
  table.innerHTML = `
    ${omitted > 0 ? `<p class="empty-hint">共 ${diffs.length} 处差异，下面只列出前 ${DIFF_DISPLAY_LIMIT} 处，另有 ${omitted} 处未显示；完整清单请导出账套备份或查看通知中心。</p>` : ""}
    <table class="report-table">
      <thead><tr><th>严重度</th><th>类型</th><th>工号</th><th>姓名</th><th>说明</th></tr></thead>
      <tbody>
        ${shown
          .map(
            (d) => `<tr>
              <td>${d.severity === "error" ? "严重" : "提示"}</td>
              <td>${escapeHtml(d.kindLabel || d.kind || "")}</td>
              <td>${escapeHtml(d.employeeNo || "")}</td>
              <td>${escapeHtml(d.name || "")}</td>
              <td>${escapeHtml(d.detail || "")}</td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>`;
}

function renderLedgersView() {
  renderLedgers();
  renderLedgerReconcile();
}

document.addEventListener("click", async (event) => {
  if (event.target.closest("#ledgerRefresh")) {
    loadLedgers();
    return;
  }
  if (event.target.closest("#ledgerCreate")) {
    createLedger();
    return;
  }
  if (event.target.closest("#ledgerReconcileRun")) {
    loadReconciliation(true);
    return;
  }
  if (event.target.closest("#ledgerReconcileLoad")) {
    loadReconciliation(false);
    return;
  }
  if (event.target.closest("#ledgerRestoreRun")) {
    restoreLedgerBackup();
    return;
  }
  if (event.target.closest("#auditReportExport")) {
    exportAuditReport();
    return;
  }
  const toButton = event.target.closest("[data-ledger-to]");
  if (toButton) {
    transitionLedgerState(toButton.dataset.ledgerType, toButton.dataset.ledgerPeriod, toButton.dataset.ledgerTo);
    return;
  }
  const carryButton = event.target.closest("[data-ledger-carry]");
  if (carryButton) {
    carryOverLedger(carryButton.dataset.ledgerType, carryButton.dataset.ledgerPeriod);
    return;
  }
  const backupButton = event.target.closest("[data-ledger-backup]");
  if (backupButton) {
    downloadLedgerBackup(backupButton.dataset.ledgerType, backupButton.dataset.ledgerPeriod);
    return;
  }
  const unlockButton = event.target.closest("[data-ledger-unlock]");
  if (unlockButton) {
    requestLedgerUnlock(unlockButton.dataset.ledgerType, unlockButton.dataset.ledgerPeriod);
  }
});

/**
 * 发起账套解锁申请（验收 8.10）。
 *
 * 跳到审批中心再开弹层，而不是就地开一个：申请提交后要在审批中心跟进度、
 * 看谁批到哪一步了。就地弹一个框、提交完人还留在账套页，
 * 他不知道下一步该去哪看。
 */
async function requestLedgerUnlock(type, period) {
  switchView("approvals");
  await loadOaTemplates();
  const template = oaState.templates.find((t) => t.key === "ledger_unlock");
  if (!template) {
    showToast("当前账号无权发起账套解锁申请，请联系总校人事行政");
    return;
  }
  await openOaCreateDialog("ledger_unlock", {
    ledgerType: LEDGER_TYPE_LABELS[type] || "",
    period,
  });
}

document.addEventListener("change", (event) => {
  if (event.target.closest("#ledgerFilterType")) {
    loadLedgers({ type: event.target.value });
    return;
  }
  if (event.target.closest("#ledgerFilterStatus")) {
    loadLedgers({ status: event.target.value });
  }
});

// ---------------------------------------------------------------------------
// 系统监控（合同第七条第 6 项）
// ---------------------------------------------------------------------------

async function loadMonitoring() {
  if (!backendMode()) return;
  monitoringState = { ...monitoringState, loading: true, error: "" };
  renderMonitoring();
  try {
    const data = await apiRequest("/api/monitoring");
    monitoringState = { loaded: true, loading: false, error: "", data };
  } catch (error) {
    monitoringState = { ...monitoringState, loading: false, loaded: true, error: error.message || "加载失败" };
  }
  renderMonitoring();
}

function formatUptime(seconds) {
  const s = Number(seconds || 0);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d ? `${d} 天 ${h} 小时` : h ? `${h} 小时 ${m} 分` : `${m} 分`;
}

function renderMonitoring() {
  if (state.activeView !== "monitoring") return;
  const summary = document.querySelector("#monitoringSummary");
  const table = document.querySelector("#monitoringChecks");
  if (!summary || !table) return;

  if (!monitoringState.loaded && !monitoringState.loading) {
    loadMonitoring();
    return;
  }

  const { loading, error, data } = monitoringState;
  const failing = (data?.checks || []).filter((c) => !c.ok);
  setReportStatus(
    "#monitoringStatus",
    loading ? "检查中" : error ? "加载失败" : data?.healthy ? "一切正常" : `${failing.length} 项异常`,
  );

  if (error) {
    summary.innerHTML = "";
    table.innerHTML = `<p class="empty-hint">${escapeHtml(error)}</p>`;
    return;
  }
  if (!data) return;

  summary.innerHTML = [
    { label: "运行时长", value: formatUptime(data.uptimeSeconds) },
    { label: "内存占用", value: `${data.memoryMb} MB` },
    { label: "数据库", value: data.postgres?.configured ? (data.postgres.connected ? "已连接" : "已断开") : "文件模式" },
    { label: "异常项", value: String(failing.length) },
  ]
    .map(
      (m) =>
        `<article class="metric"><p class="metric-label">${escapeHtml(m.label)}</p><p class="metric-value">${escapeHtml(String(m.value))}</p></article>`,
    )
    .join("");

  // 异常排在最前面。正常项也要列出来——只显示异常的话，
  // 一个空列表分不清是「都正常」还是「检查根本没跑」
  const rows = [...failing, ...(data.checks || []).filter((c) => c.ok)];
  table.innerHTML = `
    <table class="report-table">
      <thead><tr><th>检查项</th><th>级别</th><th>状态</th><th>说明</th></tr></thead>
      <tbody>
        ${rows
          .map(
            (c) => `<tr>
              <td>${escapeHtml(c.name)}</td>
              <td>${escapeHtml(MONITOR_LEVEL_LABELS[c.level] || c.level)}</td>
              <td>${c.ok ? "正常" : "<strong>异常</strong>"}</td>
              <td>${escapeHtml(c.detail || "—")}</td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>
    <p class="empty-hint">最近检查时间：${escapeHtml(data.at || "")}</p>`;
}

function renderMonitoringView() {
  renderMonitoring();
}

document.addEventListener("click", (event) => {
  if (event.target.closest("#monitoringRefresh")) {
    loadMonitoring();
  }
});

function changeTeacherPayrollMonth(month) {
  if (!month) return;
  if (!teacherPayrollTermMonths().includes(month)) return;
  const alreadySelected =
    teacherConfirmationMonth === month &&
    teacherWorkloadState.month === month &&
    teacherPayrollState.month === month;
  if (alreadySelected) return;

  teacherConfirmationMonth = month;
  // 清空上一个月份的敏感数据，再触发新月份读取；不能让旧金额在请求期间
  // 短暂显示到新月份名下。
  teacherWorkloadRequestId += 1;
  teacherPayrollRequestId += 1;
  teacherWorkloadState = {
    teacherId: currentTeacherId(),
    month,
    loading: false,
    loaded: false,
    error: "",
    data: null,
  };
  teacherPayrollState = {
    teacherId: currentTeacherId(),
    month,
    detail: true,
    loading: false,
    loaded: false,
    error: "",
    data: null,
  };
  document.querySelector(".dispute-field")?.classList.remove("is-open");
  const reason = document.querySelector("#payrollDisputeReason");
  if (reason) reason.value = "";
  render();
}

document.addEventListener("change", (event) => {
  if (event.target.closest("#recordsMonth")) {
    const month = event.target.value;
    if (!month) return;
    // 直接调加载函数，不靠改状态再让 render 里的「需不需要重新拉」去推断——
    // 那条路要同时满足三个条件，中间任何一个不成立就静默什么都不做，
    // 表现出来就是「点了月份没反应」
    loadBackendAttendanceRecords(currentTeacherId(), month);
  }
});
