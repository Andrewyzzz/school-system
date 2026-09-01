// 报表：周教学工作量台账（验收 2.18）与年度薪资汇总（验收 3.19）
//
// 两张表的共同要求是「可导出、可打印」，且都必须遵守数据范围：
//   · 学部财务只看本学部教师，总校财务只看行政后勤（他们没有课，工作量表因此为空）
//   · 学部负责人只看 scopeStageIds 覆盖的学部
//   · 教师只看自己
// 范围裁剪放在数据组装阶段，不放在渲染阶段——渲染时才过滤，等于把全校数据
// 先取到内存里，一旦哪天加了个"导出原始 JSON"的口子就全漏了。
//
// 年度薪资汇总的口径问题：一年里通常既有已锁定（已结算）的月份，也有还在流程中
// 的月份。把两者加在一起报一个"全年合计"会让财务误以为都已发放，所以合计拆成
// 「已结算」与「结算中」两列分别给出，未结算的月份单元格另作标色。

import {
  ASSESSMENT_BAND_LABELS,
  QUALIFICATION_GRADE_LABELS,
} from "./payroll.js";
import { buildWorkbook, cell, exportFilename, row } from "./excel.js";
import { financeScopeFor, payrollScopeOfTeacher } from "./financeScope.js";
import { payrollDetailsByFilter } from "./storage.js";

const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const LESSON_TYPE_LABELS = {
  regular: "正常课时",
  morning: "早自习",
  evening: "晚自习",
  weekend: "周末补课",
  makeup: "补课",
};

const LESSON_STATUS_LABELS = {
  scheduled: "待上课",
  cancelled: "已取消",
};

const STAGE_LABELS = { primary: "小学部", middle: "初中部", high: "高中部" };

// 工资已发放的月份状态；结算中的月份也要出现在报表里，但要能与已结算区分
const LOCKED_STATUS = "locked";
const PUBLISHED_STATUSES = new Set([
  "generated",
  "teacher_confirmed",
  "disputed",
  "reviewed",
  "locked",
]);

const STATUS_LABELS = {
  generated: "待教师确认",
  teacher_confirmed: "教师已确认",
  disputed: "有异议",
  reviewed: "已复核",
  locked: "已结算",
};

function lessonTypeLabel(type) {
  return LESSON_TYPE_LABELS[type] || LESSON_TYPE_LABELS.regular;
}

function lessonStatusLabel(status) {
  return LESSON_STATUS_LABELS[status] || status || "";
}

function stageLabelOf(stageId) {
  return STAGE_LABELS[stageId] || stageId || "";
}

function weekdayIndexOf(dateKey) {
  const [y, m, d] = String(dateKey || "").split("-").map(Number);
  if (!y || !m || !d) return -1;
  const day = new Date(y, m - 1, d).getDay(); // 0=周日
  return day === 0 ? 6 : day - 1;
}

function addDays(dateKey, days) {
  const [y, m, d] = String(dateKey).split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** 把任意日期回退到所在周的周一，避免调用方传周三导致跨两个自然周 */
export function mondayOf(dateKey) {
  const idx = weekdayIndexOf(dateKey);
  if (idx < 0) return dateKey;
  return addDays(dateKey, -idx);
}

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// ---------------------------------------------------------------------------
// 数据范围
// ---------------------------------------------------------------------------

/**
 * 按账号裁剪教师集合。返回 { teachers, scopeNote }。
 * scopeNote 会印在报表副标题上——导出的文件会流转到校外，必须让拿到文件的人
 * 一眼看出这份表只覆盖了哪个范围，否则会被当成全校数据引用。
 */
export function scopeTeachers(db, account, { stageId = "", teacherId = "" } = {}) {
  let teachers = (db.teachers || []).filter((t) => t.status !== "archived");
  const notes = [];

  if (account?.role === "teacher") {
    teachers = teachers.filter((t) => t.id === account.teacherId);
    notes.push("仅本人");
  }

  const financeScope = financeScopeFor(account);
  if (financeScope) {
    teachers = teachers.filter((t) => payrollScopeOfTeacher(db, t.id) === financeScope);
    notes.push(financeScope === "headquarters" ? "总校行政后勤" : stageLabelOf(financeScope));
  }

  // 学部负责人：scopeStageIds 覆盖的学部
  const stageScope = Array.isArray(account?.scopeStageIds) ? account.scopeStageIds.map(String) : [];
  if (stageScope.length > 0) {
    teachers = teachers.filter((t) => stageScope.includes(String(t.stageId)));
    notes.push(stageScope.map(stageLabelOf).join("、"));
  }

  // 使用者自己再筛的学部/教师，叠加在权限范围之上，不能放宽
  if (stageId) {
    teachers = teachers.filter((t) => String(t.stageId) === String(stageId));
    notes.push(stageLabelOf(stageId));
  }
  if (teacherId) {
    teachers = teachers.filter((t) => t.id === teacherId);
  }

  return {
    teachers: teachers.slice().sort((a, b) => String(a.employeeNo || a.id).localeCompare(String(b.employeeNo || b.id))),
    scopeNote: notes.length ? `范围：${[...new Set(notes)].join(" / ")}` : "范围：全校",
  };
}

// ---------------------------------------------------------------------------
// 周教学工作量台账（验收 2.18）
// ---------------------------------------------------------------------------

/**
 * 组装一周的教学工作量。
 * 返回 { weekStart, weekEnd, rows, totals, lessons, ... }，
 * rows 每项对应一位教师，daily 是周一到周日的课时数。
 */
export function buildWeeklyWorkload(db, options = {}) {
  const { termId, weekStart, account = null, stageId = "", teacherId = "", includeIdle = true } = options;
  const term = (db.terms || []).find((t) => t.id === termId) || (db.terms || []).find((t) => t.current);
  if (!term) throw Object.assign(new Error("学期不存在"), { statusCode: 404 });

  const start = mondayOf(weekStart || term.startDate || "");
  if (!start) throw Object.assign(new Error("请指定周起始日期"), { statusCode: 400 });
  const end = addDays(start, 6);

  const { teachers, scopeNote } = scopeTeachers(db, account, { stageId, teacherId });
  const allowed = new Map(teachers.map((t) => [t.id, t]));

  const lessons = (db.lessonInstances || [])
    .filter((l) => l.termId === term.id && l.date >= start && l.date <= end && allowed.has(l.teacherId))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  // 每位教师一行；没有课的教师也要列出来，否则看表的人分不清
  // "这周没排课"和"这个人不在这张表的范围里"
  const byTeacher = new Map(
    teachers.map((t) => [
      t.id,
      {
        teacherId: t.id,
        employeeNo: t.employeeNo || t.id,
        name: t.name,
        stageId: t.stageId,
        stageName: stageLabelOf(t.stageId),
        subject: t.primarySubjectName || "",
        title: QUALIFICATION_GRADE_LABELS[t.salaryProfile?.qualificationGrade] || t.title || "",
        daily: WEEKDAYS.map(() => 0),
        lessonCount: 0,
        units: 0,
        payable: 0,
        pending: 0,
        cancelled: 0,
        byType: {},
      },
    ]),
  );

  lessons.forEach((lesson) => {
    const item = byTeacher.get(lesson.teacherId);
    if (!item) return;
    const w = weekdayIndexOf(lesson.date);

    // 已取消的课不计入工作量——它没有发生，计进去就会多算课时费
    if (lesson.status === "cancelled") {
      item.cancelled += 1;
      return;
    }

    const units = Number(lesson.units) || 1;
    if (w >= 0) item.daily[w] = round2(item.daily[w] + units);
    item.lessonCount += 1;
    item.units = round2(item.units + units);

    // 计薪口径：排给谁就算谁的。未到上课时间的单独计一列——
    // 台账用来核课时费，看的人要能分清「已经上过的」和「还没上但已计薪的」
    item.payable += 1;
    if (lesson.date > new Date().toISOString().slice(0, 10)) item.pending += 1;

    const typeLabel = lessonTypeLabel(lesson.type);
    item.byType[typeLabel] = round2((item.byType[typeLabel] || 0) + units);
  });

  const all = [...byTeacher.values()];
  const idleCount = all.filter((r) => r.lessonCount === 0 && r.cancelled === 0).length;

  // 无课教师默认保留：台账除了核课时费，也用来看工作量饱和度，
  // 谁这周一节课都没有本身就是要看的信息。但全校口径下会出几百行空白，
  // 所以留一个开关，导出全校时可以只看有课的人。
  const rows = includeIdle ? all : all.filter((r) => r.lessonCount > 0 || r.cancelled > 0);

  const totals = {
    idleCount,
    daily: WEEKDAYS.map((_, i) => round2(rows.reduce((s, r) => s + r.daily[i], 0))),
    lessonCount: rows.reduce((s, r) => s + r.lessonCount, 0),
    units: round2(rows.reduce((s, r) => s + r.units, 0)),
    payable: rows.reduce((s, r) => s + r.payable, 0),
    pending: rows.reduce((s, r) => s + r.pending, 0),
    cancelled: rows.reduce((s, r) => s + r.cancelled, 0),
    teacherCount: rows.length,
  };

  return {
    termId: term.id,
    termName: term.name,
    weekStart: start,
    weekEnd: end,
    weekdays: WEEKDAYS,
    scopeNote,
    rows,
    totals,
    lessons: lessons.map((l) => ({
      date: l.date,
      weekday: WEEKDAYS[weekdayIndexOf(l.date)] || "",
      time: l.time,
      employeeNo: allowed.get(l.teacherId)?.employeeNo || l.teacherId,
      teacherName: allowed.get(l.teacherId)?.name || l.teacherId,
      stageName: stageLabelOf(l.stageId),
      className: l.className || "",
      subjectName: l.subjectName || "",
      room: l.room || "",
      typeLabel: lessonTypeLabel(l.type),
      units: Number(l.units) || 1,
      statusLabel: lessonStatusLabel(l.status),
      status: l.status,
    })),
  };
}

export function buildWeeklyWorkloadExcel(report) {
  const { weekStart, weekEnd, weekdays, termName, scopeNote, rows, totals, lessons } = report;
  const idleNote = totals.idleCount ? `｜本周无课 ${totals.idleCount} 人` : "";
  const subtitle = `${termName} · ${weekStart} 至 ${weekEnd} · ${scopeNote}${idleNote}`;

  const summaryHead = [
    "工号", "姓名", "学部", "任教科目", "职称",
    ...weekdays,
    "课次合计", "课时合计", "计薪课次", "未到时间", "已取消",
  ];

  const summaryRows = [
    row(summaryHead.map((h) => cell(h, "head")), 30),
    ...rows.map((r) =>
      row([
        cell(r.employeeNo),
        cell(r.name),
        cell(r.stageName),
        cell(r.subject),
        cell(r.title),
        ...r.daily.map((v) => cell(v || "", "number")),
        cell(r.lessonCount || "", "number"),
        cell(r.units || "", "number"),
        cell(r.payable || "", "number"),
        cell(r.pending || "", "number"),
        // 已取消标红：这张表是给教务追人的，取消的课混在数字里就没人看，
        // 而取消意味着这节课的钱谁也没拿到，是要核实的
        cell(r.cancelled || "", r.cancelled ? "warn" : "number"),
      ]),
    ),
    row([
      cell("合计", "total", 4),
      ...totals.daily.map((v) => cell(v || "", "totalNumber")),
      cell(totals.lessonCount || "", "totalNumber"),
      cell(totals.units || "", "totalNumber"),
      cell(totals.payable || "", "totalNumber"),
      cell(totals.pending || "", "totalNumber"),
      cell(totals.cancelled || "", "totalNumber"),
    ]),
  ];

  const detailHead = [
    "日期", "星期", "时段", "工号", "姓名", "学部",
    "班级", "科目", "教室", "课时类型", "课时", "状态",
  ];

  const detailRows = [
    row(detailHead.map((h) => cell(h, "head")), 30),
    ...lessons.map((l) =>
      row([
        cell(l.date),
        cell(l.weekday),
        cell(l.time),
        cell(l.employeeNo),
        cell(l.teacherName),
        cell(l.stageName),
        cell(l.className),
        cell(l.subjectName),
        cell(l.room),
        cell(l.typeLabel),
        cell(l.units, "number"),
        cell(l.statusLabel, l.status === "cancelled" ? "warn" : "cell"),
      ]),
    ),
  ];

  return buildWorkbook([
    {
      name: "工作量汇总",
      title: "周教学工作量台账",
      subtitle,
      columns: [70, 70, 62, 76, 84, ...weekdays.map(() => 50), 62, 62, 58, 58, 62, 58],
      rows: summaryRows,
      freezeRows: 1,
    },
    {
      name: "课次明细",
      title: "周教学工作量台账 — 课次明细",
      subtitle,
      columns: [78, 48, 92, 70, 70, 62, 96, 68, 104, 72, 46, 68, 78, 78],
      rows: detailRows,
      freezeRows: 1,
    },
  ]);
}

export function exportWeeklyWorkload(db, options = {}) {
  const report = buildWeeklyWorkload(db, options);
  return {
    filename: exportFilename(["周教学工作量台账", report.weekStart], "xls"),
    content: buildWeeklyWorkloadExcel(report),
    mimeType: "application/vnd.ms-excel",
    total: report.totals.lessonCount,
    report,
  };
}

// ---------------------------------------------------------------------------
// 年度薪资汇总（验收 3.19）
// ---------------------------------------------------------------------------

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// 汇总口径与工资条一致：列到应发为止。个税、社保由学校财务线下处理，不进系统。
const COMPONENT_COLUMNS = [
  { key: "baseSalary", label: "基本工资" },
  { key: "positionSalary", label: "岗位工资" },
  { key: "assessmentSalary", label: "考核绩效" },
  { key: "senioritySalary", label: "校龄津贴" },
  { key: "housingAllowance", label: "住房补贴" },
  { key: "lessonAmount", label: "课时津贴" },
  { key: "supplementalAmount", label: "补发" },
  { key: "deductionAmount", label: "扣款" },
];

/**
 * 组装某自然年的薪资汇总。
 * 用自然年而非学年：财务对账、年终核算都按 1—12 月口径。
 */
export function buildAnnualSalary(db, options = {}) {
  const { year, account = null, stageId = "", teacherId = "" } = options;
  const y = Number(year) || new Date().getFullYear();

  const { teachers, scopeNote } = scopeTeachers(db, account, { stageId, teacherId });
  const allowed = new Map(teachers.map((t) => [t.id, t]));

  const details = (db.payrollDetails || []).filter(
    (d) => String(d.month || "").startsWith(`${y}-`) && PUBLISHED_STATUSES.has(d.status) && allowed.has(d.teacherId),
  );

  const byTeacher = new Map(
    teachers.map((t) => [
      t.id,
      {
        teacherId: t.id,
        employeeNo: t.employeeNo || t.id,
        name: t.name,
        stageName: stageLabelOf(t.stageId),
        title: QUALIFICATION_GRADE_LABELS[t.salaryProfile?.qualificationGrade] || t.title || "",
        band: ASSESSMENT_BAND_LABELS[t.salaryProfile?.assessmentBand] || "",
        monthly: MONTHS.map(() => null), // null 表示该月无工资单，与"发了 0 元"区分
        monthStatus: MONTHS.map(() => ""),
        settled: 0, // 已结算合计
        inProgress: 0, // 结算中合计
        settledMonths: 0,
        components: Object.fromEntries(COMPONENT_COLUMNS.map((c) => [c.key, 0])),
      },
    ]),
  );

  details.forEach((detail) => {
    const item = byTeacher.get(detail.teacherId);
    if (!item) return;
    const monthIndex = Number(String(detail.month).split("-")[1]) - 1;
    if (monthIndex < 0 || monthIndex > 11) return;

    const snapshot = detail.summarySnapshot || {};
    const gross = round2(snapshot.grossPay);
    item.monthly[monthIndex] = gross;
    item.monthStatus[monthIndex] = STATUS_LABELS[detail.status] || detail.status || "";

    if (detail.status === LOCKED_STATUS) {
      item.settled = round2(item.settled + gross);
      item.settledMonths += 1;
      // 项目分解只统计已结算月份——结算中的金额还会变，计进去下次导出对不上
      COMPONENT_COLUMNS.forEach(({ key }) => {
        item.components[key] = round2(item.components[key] + (Number(snapshot[key]) || 0));
      });
    } else {
      item.inProgress = round2(item.inProgress + gross);
    }
  });

  const rows = [...byTeacher.values()];
  const totals = {
    monthly: MONTHS.map((_, i) =>
      round2(rows.reduce((s, r) => s + (r.monthly[i] || 0), 0)),
    ),
    settled: round2(rows.reduce((s, r) => s + r.settled, 0)),
    inProgress: round2(rows.reduce((s, r) => s + r.inProgress, 0)),
    teacherCount: rows.length,
    components: Object.fromEntries(
      COMPONENT_COLUMNS.map(({ key }) => [key, round2(rows.reduce((s, r) => s + r.components[key], 0))]),
    ),
  };

  const unsettledMonths = [
    ...new Set(details.filter((d) => d.status !== LOCKED_STATUS).map((d) => d.month)),
  ].sort();

  return {
    year: y,
    scopeNote,
    months: MONTHS.map((m) => `${m}月`),
    componentColumns: COMPONENT_COLUMNS,
    rows,
    totals,
    unsettledMonths,
  };
}

export function buildAnnualSalaryExcel(report) {
  const { year, scopeNote, months, rows, totals, componentColumns, unsettledMonths } = report;

  // 副标题必须写清口径。这张表会被拿去做年终核算，"合计"到底含不含
  // 还没锁定的月份，看表的人必须知道。
  const caveat = unsettledMonths.length
    ? `｜${unsettledMonths.join("、")} 尚未结算，金额可能变动，未计入"已结算合计"`
    : "";
  const subtitle = `${year} 年度 · ${scopeNote}${caveat}`;

  const monthlyHead = [
    "工号", "姓名", "学部", "职称",
    ...months,
    "已结算合计", "结算中合计", "已结算月数",
  ];

  const monthlyRows = [
    row(monthlyHead.map((h) => cell(h, "head")), 30),
    ...rows.map((r) =>
      row([
        cell(r.employeeNo),
        cell(r.name),
        cell(r.stageName),
        cell(r.title),
        ...r.monthly.map((v, i) =>
          // 未锁定月份标色，避免被当成已发放金额直接引用
          cell(v === null ? "" : v, r.monthStatus[i] && r.monthStatus[i] !== "已结算" ? "warn" : "money"),
        ),
        cell(r.settled, "totalMoney"),
        cell(r.inProgress || "", "money"),
        cell(r.settledMonths, "number"),
      ]),
    ),
    row([
      cell("合计", "total", 3),
      ...totals.monthly.map((v) => cell(v || "", "totalMoney")),
      cell(totals.settled, "totalMoney"),
      cell(totals.inProgress || "", "totalMoney"),
      cell("", "total"),
    ]),
  ];

  const componentHead = ["工号", "姓名", "学部", "考核档次", ...componentColumns.map((c) => c.label), "应发合计"];

  const componentRows = [
    row(componentHead.map((h) => cell(h, "head")), 30),
    ...rows.map((r) =>
      row([
        cell(r.employeeNo),
        cell(r.name),
        cell(r.stageName),
        cell(r.band),
        ...componentColumns.map((c) => cell(r.components[c.key] || "", "money")),
        cell(r.settled, "totalMoney"),
      ]),
    ),
    row([
      cell("合计", "total", 3),
      ...componentColumns.map((c) => cell(totals.components[c.key] || "", "totalMoney")),
      cell(totals.settled, "totalMoney"),
    ]),
  ];

  return buildWorkbook([
    {
      name: "按月汇总",
      title: `${year} 年度薪资汇总表`,
      subtitle,
      columns: [70, 70, 62, 84, ...months.map(() => 76), 92, 88, 76],
      rows: monthlyRows,
      freezeRows: 1,
    },
    {
      name: "按项目汇总",
      title: `${year} 年度薪资汇总表 — 项目分解`,
      subtitle: `${subtitle}｜仅统计已结算月份`,
      columns: [70, 70, 62, 84, ...componentColumns.map(() => 80), 92],
      rows: componentRows,
      freezeRows: 1,
    },
  ]);
}

export function exportAnnualSalary(db, options = {}) {
  const report = buildAnnualSalary(db, options);
  return {
    filename: exportFilename(["年度薪资汇总表", report.year], "xls"),
    content: buildAnnualSalaryExcel(report),
    mimeType: "application/vnd.ms-excel",
    total: report.rows.length,
    report,
  };
}

export { COMPONENT_COLUMNS, LESSON_STATUS_LABELS, LESSON_TYPE_LABELS, STATUS_LABELS };

// ---------------------------------------------------------------------------
// 应发工资明细表（验收 3.15）
//
// 这张表是交给财务、供其线下办理个税与社保申报的依据，所以口径必须一眼可辨：
// 只列到「应发」为止，不含任何代扣项。表头、合计行与签字栏都是财务归档的
// 常规要求——一张没有合计、没有制表人的工资表，财务不会收。
//
// 银行卡号只给掩码（末四位）。完整卡号在学校财务自己的系统里，导出全量卡号
// 会把一份工资表变成一份可直接转账的名单，风险与收益不成比例。
// ---------------------------------------------------------------------------

const PAYROLL_SHEET_COLUMNS = [
  { key: "baseSalary", label: "基本工资" },
  { key: "positionSalary", label: "岗位工资" },
  { key: "assessmentSalary", label: "考核绩效" },
  { key: "senioritySalary", label: "校龄津贴" },
  { key: "housingAllowance", label: "住房补贴" },
  { key: "lessonAmount", label: "课时津贴" },
  { key: "supplementalAmount", label: "补发" },
  { key: "deductionAmount", label: "扣款" },
];

const PAYROLL_STATUS_LABELS = {
  generated: "待教师确认",
  teacher_confirmed: "教师已确认",
  disputed: "有异议",
  reviewed: "已复核",
  locked: "已结算",
};

export function buildPayrollSheet(db, options = {}) {
  const month = String(options.month || "");
  const details = payrollDetailsByFilter(db, options);
  const teachers = new Map((db.teachers || []).map((t) => [t.id, t]));
  const employees = new Map((db.hrEmployees || []).map((e) => [e.teacherId || e.id, e]));

  const rows = details.map((detail, index) => {
    const teacher = teachers.get(detail.teacherId) || {};
    const employee = employees.get(detail.teacherId) || {};
    const snapshot = detail.summarySnapshot || {};
    const amounts = {};
    PAYROLL_SHEET_COLUMNS.forEach(({ key }) => {
      amounts[key] = round2(snapshot[key]);
    });
    return {
      seq: index + 1,
      employeeNo: teacher.employeeNo || detail.teacherId,
      name: teacher.name || detail.teacherId,
      stageName: stageLabelOf(teacher.stageId),
      title: QUALIFICATION_GRADE_LABELS[teacher.salaryProfile?.qualificationGrade] || teacher.title || "",
      bankCardMasked: employee.bankCardMasked || "",
      amounts,
      grossPay: round2(snapshot.grossPay),
      payableUnits: Number(snapshot.payableUnits) || 0,
      status: detail.status,
      statusLabel: PAYROLL_STATUS_LABELS[detail.status] || detail.status || "",
    };
  });

  const totals = {
    headcount: rows.length,
    grossPay: round2(rows.reduce((s, r) => s + r.grossPay, 0)),
    payableUnits: round2(rows.reduce((s, r) => s + r.payableUnits, 0)),
    amounts: Object.fromEntries(
      PAYROLL_SHEET_COLUMNS.map(({ key }) => [key, round2(rows.reduce((s, r) => s + r.amounts[key], 0))]),
    ),
    // 未结算的要单独报数：财务据此判断这张表能不能直接拿去付款
    unsettledCount: rows.filter((r) => r.status !== "locked").length,
  };

  return { month, columns: PAYROLL_SHEET_COLUMNS, rows, totals };
}

export function buildPayrollSheetExcel(sheet, meta = {}) {
  const { month, columns, rows, totals } = sheet;
  const head = [
    "序号", "工号", "姓名", "学部", "职称", "银行卡号",
    ...columns.map((c) => c.label),
    "应发合计", "计薪课时", "状态",
  ];

  const body = [
    row(head.map((h) => cell(h, "head")), 32),
    ...rows.map((r) =>
      row([
        cell(r.seq, "number"),
        cell(r.employeeNo),
        cell(r.name),
        cell(r.stageName),
        cell(r.title),
        cell(r.bankCardMasked, "text"),
        ...columns.map((c) => cell(r.amounts[c.key] || "", "money")),
        cell(r.grossPay, "totalMoney"),
        cell(r.payableUnits || "", "number"),
        // 未结算的标出来：这张表若直接拿去付款，这些行是不该付的
        cell(r.statusLabel, r.status === "locked" ? "cell" : "warn"),
      ]),
    ),
    row([
      cell(`合计（${totals.headcount} 人）`, "total", 5),
      ...columns.map((c) => cell(totals.amounts[c.key] || "", "totalMoney")),
      cell(totals.grossPay, "totalMoney"),
      cell(totals.payableUnits || "", "totalNumber"),
      cell("", "total"),
    ]),
    row([]),
    // 签字栏：财务归档要求，缺了这行表退回来重出
    row([cell("制表：", "text", 3), cell("复核：", "text", 3), cell("审批：", "text", 3), cell("日期：", "text", 3)], 28),
  ];

  const caveat = totals.unsettledCount
    ? `｜其中 ${totals.unsettledCount} 人尚未结算，付款前须先完成审批`
    : "";

  return buildWorkbook([
    {
      name: `${month} 应发工资明细`,
      title: `${meta.schoolName || "深圳市富源学校"} ${month} 应发工资明细表`,
      subtitle: [
        meta.scopeNote || "",
        `共 ${totals.headcount} 人，应发合计 ${totals.grossPay.toLocaleString("zh-CN", { minimumFractionDigits: 2 })} 元`,
        "本表为应发口径，个人所得税与社会保险等代扣项由财务线下处理",
      ]
        .filter(Boolean)
        .join(" · ") + caveat,
      columns: [46, 70, 70, 62, 84, 96, ...columns.map(() => 78), 92, 66, 76],
      rows: body,
      freezeRows: 1,
    },
  ]);
}

export function exportPayrollSheet(db, options = {}, meta = {}) {
  const sheet = buildPayrollSheet(db, options);
  return {
    filename: exportFilename(["应发工资明细表", sheet.month, meta.scopeNote || ""], "xls"),
    content: buildPayrollSheetExcel(sheet, meta),
    mimeType: "application/vnd.ms-excel",
    total: sheet.rows.length,
    sheet,
  };
}
