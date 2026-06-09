const initialState = {
  currentAccountId: "teacher-li",
  activeView: "dashboard",
  taskFilter: "all",
  selectedFinanceTeacherId: "T001",
  scannerLessonId: "L002",
  lastScanText: "",
  accounts: [
    {
      id: "teacher-li",
      role: "teacher",
      name: "李明",
      title: "老师账号",
      teacherId: "T001",
    },
    {
      id: "finance-zhang",
      role: "finance",
      name: "张会计",
      title: "财务账号",
      department: "财务部",
    },
  ],
  teachers: [
    {
      id: "T001",
      name: "李明",
      department: "小学部",
      subject: "数学",
      position: "小学数学任课教师",
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
      note: "正常签到销课",
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
      note: "等待教师到教室扫码签到",
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
      note: "正常签到销课",
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
      note: "正常签到销课",
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
      note: "正常签到销课",
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
      note: "未完成扫码签到",
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
      note: "正常签到销课",
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
      note: "正常签到销课",
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
      note: "疑似重复扫码，财务结算时已剔除",
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

let state = clone(initialState);
let qrScanner = null;

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
  scanner: {
    role: "teacher",
    title: "签到入口",
    el: document.querySelector("#scannerView"),
  },
  records: {
    role: "teacher",
    title: "我的签到记录",
    el: document.querySelector("#recordsView"),
  },
  confirm: {
    role: "teacher",
    title: "月度工作量确认",
    el: document.querySelector("#confirmView"),
  },
  payroll: {
    role: "teacher",
    title: "我的薪资明细",
    el: document.querySelector("#payrollView"),
  },
  finance: {
    role: "finance",
    title: "财务首页",
    el: document.querySelector("#financeView"),
  },
  financeRecords: {
    role: "finance",
    title: "老师签到记录",
    el: document.querySelector("#financeRecordsView"),
  },
  settlement: {
    role: "finance",
    title: "薪资结算",
    el: document.querySelector("#settlementView"),
  },
  warnings: {
    role: "both",
    title: "异常提醒",
    el: document.querySelector("#warningsView"),
  },
};

const defaultViewByRole = {
  teacher: "dashboard",
  finance: "finance",
};

const lessonTypeLabel = {
  regular: "正常课时",
  morning: "早自习",
  evening: "晚自习",
  weekend: "周末补课",
};

const statusLabel = {
  pending: "待签到",
  completed: "已签到",
  exception: "异常",
};

const confirmSteps = [
  { label: "第 1 步", title: "系统生成月度工作量" },
  { label: "第 2 步", title: "老师确认课时与补贴" },
  { label: "第 3 步", title: "学部教务审批" },
  { label: "第 4 步", title: "总校审批并交财务" },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

function viewAllowed(viewName) {
  const view = views[viewName];
  const role = currentRole();
  return Boolean(view && (view.role === role || view.role === "both"));
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
    .filter((lesson) => lesson.status === "pending")
    .reduce((map, lesson) => {
      map.set(lesson.teacherId, (map.get(lesson.teacherId) || 0) + 1);
      return map;
    }, new Map());

  pendingByTeacher.forEach((count, pendingTeacherId) => {
    warnings.push({
      level: "中",
      teacherId: pendingTeacherId,
      title: `${teacherName(pendingTeacherId)} 有 ${count} 节课未签到`,
      text: "未签到项目当前不会计入课时津贴，财务结算时会自动剔除。",
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
  if (!viewAllowed(state.activeView)) {
    state.activeView = defaultViewByRole[currentRole()];
  }

  renderShell();
  renderDashboard();
  renderTasks();
  renderScanner();
  renderRecords();
  renderConfirmation();
  renderPayroll();
  renderFinanceDashboard();
  renderFinanceRecords();
  renderSettlement();
  renderWarnings();
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
      : `${account.department} · 薪资结算`;

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.remove("is-active");
  });
  views[state.activeView].el.classList.add("is-active");

  document.querySelectorAll(".account-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.account === state.currentAccountId);
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    const navRole = button.dataset.role;
    const allowed = navRole === role || navRole === "both";
    button.classList.toggle("is-hidden", !allowed);
    button.classList.toggle("active", allowed && button.dataset.view === state.activeView);
  });

  document.querySelectorAll("[data-role-action]").forEach((button) => {
    button.classList.toggle("is-hidden", button.dataset.roleAction !== role);
  });
}

function renderDashboard() {
  const teacherId = currentRole() === "teacher" ? currentTeacherId() : state.teachers[0].id;
  const salary = calculateSalary(teacherId);
  const lessons = teacherLessons(teacherId);
  const completedUnits = payableLessons(teacherId).reduce((sum, lesson) => sum + lesson.units, 0);
  const plannedUnits = lessons
    .filter((lesson) => lesson.status !== "exception")
    .reduce((sum, lesson) => sum + lesson.units, 0);
  const pendingLessons = lessons.filter((lesson) => lesson.status === "pending");
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
      <strong>暂无待签到课时</strong>
      <p class="muted">当前可计薪课时已同步到薪资试算，月末可进入确认流程。</p>
    `;
    scanButton.disabled = true;
    quickScanButton.disabled = true;
  } else {
    nextStatus.textContent = "待签到";
    nextStatus.className = "status-pill";
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

function renderScanner() {
  const select = document.querySelector("#qrLessonSelect");
  if (!select) return;

  const teacherId = currentRole() === "teacher" ? currentTeacherId() : state.selectedFinanceTeacherId;
  const lessons = teacherLessons(teacherId);
  if (!lessons.some((lesson) => lesson.id === state.scannerLessonId)) {
    state.scannerLessonId = lessons.find((lesson) => lesson.status === "pending")?.id || lessons[0]?.id || "";
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
}

function renderRecords() {
  const teacherId = currentTeacherId();
  const records = teacherLessons(teacherId).filter(
    (lesson) => lesson.status === "completed" || lesson.status === "exception",
  );
  document.querySelector("#teacherRecordTable").innerHTML = records.length
    ? records.map(recordRow).join("")
    : `<tr><td colspan="7"><div class="empty-state">暂无签到记录</div></td></tr>`;
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
  const pendingCount = teacherLessons(teacherId).filter((lesson) => lesson.status === "pending").length;

  document.querySelector("#workloadList").innerHTML = [
    ["正常课时", `${salary.regularUnits} 节`, "按每节 80 元计入课时津贴"],
    ["早晚自习", `${salary.selfStudyUnits} 节`, "按每节 50 元计入补贴"],
    ["周末补课", `${salary.weekendUnits} 节`, "按每节 120 元计入补贴"],
    ["审批加班", `${salary.profile.approvedOvertimeHours || 0} 小时`, "由主管发起并审批通过"],
    ["待签到", `${pendingCount} 节`, "暂不计入工资"],
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

function renderPayroll() {
  const teacherId = currentTeacherId();
  const salary = calculateSalary(teacherId);
  const stage = state.confirmationStages[teacherId] || 0;
  const settled = state.settlements[teacherId]?.status === "settled";
  const lock = document.querySelector("#payrollLockStatus");
  lock.textContent = settled ? "财务已结算" : stage === 3 ? "总校已审批" : "试算中";
  lock.className = settled || stage === 3 ? "status-pill locked" : "status-pill";

  document.querySelector("#grossSalary").textContent = formatCurrency(salary.gross);
  document.querySelector("#taxSalary").textContent = formatCurrency(salary.tax);
  document.querySelector("#netSalary").textContent = formatCurrency(salary.net);
  document.querySelector("#salaryTable").innerHTML = salaryRows(teacherId)
    .map(
      ([name, basis, amount]) => `
        <tr>
          <td class="row-title">${name}</td>
          <td class="muted">${basis}</td>
          <td>${formatCurrency(amount)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderFinanceDashboard() {
  const allPending = state.lessons.filter((lesson) => lesson.status === "pending").length;
  const allWarnings = buildWarnings().length;
  const settledCount = state.teachers.filter((teacher) => state.settlements[teacher.id]?.status === "settled").length;

  document.querySelector("#financeTeacherCount").textContent = state.teachers.length;
  document.querySelector("#financePendingCount").textContent = allPending;
  document.querySelector("#financeWarningCount").textContent = allWarnings;
  document.querySelector("#financeSettledCount").textContent = settledCount;

  document.querySelector("#financeOverviewTable").innerHTML = state.teachers
    .map((teacher) => {
      const lessons = teacherLessons(teacher.id);
      const completedUnits = payableLessons(teacher.id).reduce((sum, lesson) => sum + lesson.units, 0);
      const pendingCount = lessons.filter((lesson) => lesson.status === "pending").length;
      const exceptionCount = lessons.filter((lesson) => lesson.status === "exception").length;
      const salary = calculateSalary(teacher.id);
      return `
        <tr>
          <td class="row-title">${teacher.name}</td>
          <td>${teacher.department} · ${teacher.subject}</td>
          <td>${completedUnits} 节</td>
          <td>${pendingCount} 节</td>
          <td>${exceptionCount} 条</td>
          <td>${formatCurrency(salary.net)}</td>
          <td>${settlementTag(teacher.id)}</td>
          <td>
            <button class="mini-button" data-finance-records="${teacher.id}" type="button">看记录</button>
            <button class="mini-button primary" data-finance-settle="${teacher.id}" type="button">结算</button>
          </td>
        </tr>
      `;
    })
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
          <td class="row-title">${name}</td>
          <td class="muted">${basis}</td>
          <td>${formatCurrency(amount)}</td>
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

function taskRow(lesson) {
  return `
    <tr>
      <td>${lesson.time}</td>
      <td class="row-title">${lesson.className}</td>
      <td>${lesson.course}</td>
      <td>${lesson.room}</td>
      <td>${lessonTypeLabel[lesson.type]}</td>
      <td>${statusTag(lesson.status)}</td>
      <td>${actionCell(lesson)}</td>
    </tr>
  `;
}

function fullTaskRow(lesson) {
  return `
    <tr>
      <td>${formatDate(lesson.date)}</td>
      <td>${lesson.time}</td>
      <td class="row-title">${lesson.className}</td>
      <td>${lesson.course}</td>
      <td>${lesson.room}</td>
      <td>${lessonTypeLabel[lesson.type]}</td>
      <td>${allowanceText(lesson)}</td>
      <td>${statusTag(lesson.status)}</td>
      <td>${actionCell(lesson)}</td>
    </tr>
  `;
}

function recordRow(lesson) {
  return `
    <tr>
      <td>${formatDate(lesson.date)}</td>
      <td>${lesson.time}</td>
      <td class="row-title">${lesson.className}</td>
      <td>${lesson.course}</td>
      <td>${lesson.room}</td>
      <td>${statusTag(lesson.status)}</td>
      <td class="muted">${lesson.note}${lesson.scanTime ? ` · ${lesson.scanTime}` : ""}</td>
    </tr>
  `;
}

function financeRecordRow(lesson) {
  return `
    <tr>
      <td>${formatDate(lesson.date)}</td>
      <td>${lesson.time}</td>
      <td class="row-title">${teacherName(lesson.teacherId)}</td>
      <td>${lesson.className}</td>
      <td>${lesson.course}</td>
      <td>${lesson.room}</td>
      <td>${statusTag(lesson.status)}</td>
      <td class="muted">${lesson.note}${lesson.scanTime ? ` · ${lesson.scanTime}` : ""}</td>
    </tr>
  `;
}

function statusTag(status) {
  return `<span class="tag ${status}">${statusLabel[status]}</span>`;
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
    return `<button class="mini-button primary" data-scan="${lesson.id}" type="button">扫码签到</button>`;
  }
  if (lesson.status === "completed") {
    return `<span class="muted">已记录 ${lesson.scanTime}</span>`;
  }
  return `<button class="mini-button" data-review="${lesson.id}" type="button">查看原因</button>`;
}

function buildQrPayload(lesson) {
  return JSON.stringify({
    app: "school-teacher-pay-demo",
    action: "lesson-checkin",
    lessonId: lesson.id,
    teacherId: lesson.teacherId,
    room: lesson.room,
    date: lesson.date,
    time: lesson.time,
    token: `demo-${lesson.id}-${lesson.teacherId}-${lesson.room}-${lesson.date}`,
  });
}

function handleDecodedScan(decodedText) {
  state.lastScanText = decodedText;
  if (currentRole() !== "teacher") {
    showToast("财务账号没有老师签到权限");
    renderScanner();
    return;
  }

  let payload;
  try {
    payload = JSON.parse(decodedText);
  } catch (error) {
    showToast("二维码内容不是本系统课时凭证");
    renderScanner();
    return;
  }

  if (payload.app !== "school-teacher-pay-demo" || payload.action !== "lesson-checkin") {
    showToast("二维码类型不匹配");
    renderScanner();
    return;
  }

  if (payload.teacherId !== currentTeacherId()) {
    showToast("该二维码不属于当前老师账号，已拦截");
    renderScanner();
    return;
  }

  const lesson = state.lessons.find((item) => item.id === payload.lessonId);
  if (!lesson) {
    showToast("未找到对应课时任务");
    renderScanner();
    return;
  }

  if (lesson.room !== payload.room) {
    showToast("教室信息不一致，已拦截");
    renderScanner();
    return;
  }

  state.scannerLessonId = lesson.id;
  scanLesson(lesson.id, "扫码识别");
}

function scanLesson(id, source = "教师扫码") {
  if (currentRole() !== "teacher") {
    showToast("只有老师账号可以提交签到");
    return;
  }

  const lesson = state.lessons.find((item) => item.id === id);
  if (!lesson) return;
  if (lesson.teacherId !== currentTeacherId()) {
    showToast("只能处理本人课时任务");
    render();
    return;
  }
  if (lesson.status === "completed") {
    showToast(`${lesson.className} ${lesson.course} 已经签到，无需重复提交`);
    render();
    return;
  }
  if (lesson.status === "exception") {
    showToast("该课时已标记异常，需教务复核后处理");
    render();
    return;
  }

  lesson.status = "completed";
  lesson.scanTime = source === "扫码识别" ? "扫码识别" : "已扫码";
  lesson.note = `${source}完成签到，计入本月薪资`;
  showToast(`${lesson.className} ${lesson.course} 已签到，薪资试算已刷新`);
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
      handleDecodedScan(decodedText);
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

function switchAccount(accountId) {
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return;
  if (qrScanner) stopCameraScanner();
  state.currentAccountId = accountId;
  state.activeView = defaultViewByRole[account.role];
  state.taskFilter = "all";
  state.lastScanText = "";
  if (account.role === "teacher") {
    state.scannerLessonId =
      teacherLessons(account.teacherId).find((lesson) => lesson.status === "pending")?.id ||
      teacherLessons(account.teacherId)[0]?.id ||
      "";
  }
  showToast(`已切换为${account.title}`);
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

document.addEventListener("click", (event) => {
  const accountButton = event.target.closest("[data-account]");
  if (accountButton) {
    switchAccount(accountButton.dataset.account);
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
    scanLesson(scanButton.dataset.scan);
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
    switchView("financeRecords");
    return;
  }

  const financeSettleButton = event.target.closest("[data-finance-settle]");
  if (financeSettleButton) {
    state.selectedFinanceTeacherId = financeSettleButton.dataset.financeSettle;
    switchView("settlement");
  }
});

document.querySelector("#scanNextLesson").addEventListener("click", (event) => {
  scanLesson(event.currentTarget.dataset.id);
});

document.querySelector("#quickScan").addEventListener("click", (event) => {
  scanLesson(event.currentTarget.dataset.id);
});

document.querySelector("#resetDemo").addEventListener("click", () => {
  if (qrScanner) stopCameraScanner();
  state = clone(initialState);
  showToast("演示数据已重置");
  render();
});

document.querySelector("#confirmWorkload").addEventListener("click", () => {
  const teacherId = currentTeacherId();
  const pendingCount = teacherLessons(teacherId).filter((lesson) => lesson.status === "pending").length;
  state.confirmationStages[teacherId] = 1;
  showToast(pendingCount > 0 ? "已确认，待签到项目暂不计入工资" : "本月工作量已确认");
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
    state.taskFilter = button.dataset.filter;
    renderTasks();
  });
});

document.querySelector("#qrLessonSelect").addEventListener("change", (event) => {
  state.scannerLessonId = event.target.value;
  renderScanner();
});

document.querySelector("#simulateQrRead").addEventListener("click", () => {
  const lesson = state.lessons.find((item) => item.id === state.scannerLessonId);
  if (!lesson) return;
  handleDecodedScan(buildQrPayload(lesson));
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
