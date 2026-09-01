// 周教学工作量台账（验收 2.18）与年度薪资汇总（验收 3.19）
//
// 这两张表会导出成文件流转到校外，所以除了算得对，还要保证：
//   · 数据范围裁剪在组装阶段生效（学部财务、学部负责人、教师本人）
//   · 金额与课时以 Number 写入 Excel，学校拿到后能直接求和
//   · 已结算与结算中的金额不能混在一个合计里
import assert from "node:assert/strict";
import { createInitialData, normalizeDatabase } from "../server/storage.js";
import {
  buildAnnualSalary,
  buildAnnualSalaryExcel,
  buildWeeklyWorkload,
  buildPayrollSheet,
  buildPayrollSheetExcel,
  buildWeeklyWorkloadExcel,
  exportAnnualSalary,
  exportPayrollSheet,
  exportWeeklyWorkload,
  mondayOf,
} from "../server/reports.js";

const db = createInitialData({ teacherCount: 40 });
normalizeDatabase(db);
const term = db.terms.find((t) => t.current) || db.terms[0];

const byStage = (stage) => db.teachers.filter((t) => t.stageId === stage);
const primary = byStage("primary")[0];
const middle = byStage("middle")[0];
const high = byStage("high")[0];
assert.ok(primary && middle && high, "三个学部都应有教师，否则隔离测不出来");

// 2026-06-15 是周一
const lesson = (over) => ({
  id: `L-${Math.random().toString(36).slice(2)}`,
  termId: term.id,
  date: "2026-06-15",
  time: "08:00-08:40",
  className: "一年级 1 班",
  subjectName: "语文",
  room: "教室01",
  type: "regular",
  units: 1,
  status: "scheduled",
  checkInAt: "",
  checkOutAt: "",
  ...over,
});

db.lessonInstances = [
  // 小学教师：周一 2 节（其中 1 节 1.5 课时）、周三 1 节、周日 1 节
  lesson({ teacherId: primary.id, stageId: "primary" }),
  lesson({ teacherId: primary.id, stageId: "primary", time: "08:50-09:30", units: 1.5 }),
  lesson({ teacherId: primary.id, stageId: "primary", date: "2026-06-17" }),
  lesson({ teacherId: primary.id, stageId: "primary", date: "2026-06-21" }),
  // 一节已取消：不计入工作量，但要单独报数
  lesson({ teacherId: primary.id, stageId: "primary", date: "2026-06-18", status: "cancelled" }),
  // 一节考勤异常：计入课时，但要单独报数
  lesson({ teacherId: primary.id, stageId: "primary", date: "2026-06-19", status: "scheduled" }),
  // 一节待上课
  lesson({ teacherId: primary.id, stageId: "primary", date: "2026-06-16", status: "scheduled" }),
  // 其他学部各 1 节，用于验证范围隔离
  lesson({ teacherId: middle.id, stageId: "middle", date: "2026-06-16" }),
  lesson({ teacherId: high.id, stageId: "high", date: "2026-06-16" }),
  // 落在下一周，不应进本周报表
  lesson({ teacherId: primary.id, stageId: "primary", date: "2026-06-22" }),
];

// ---------------------------------------------------------------------------
// 1. 周区间：任意日期都要归到所在周的周一
// ---------------------------------------------------------------------------
{
  assert.equal(mondayOf("2026-06-15"), "2026-06-15", "周一本身不动");
  assert.equal(mondayOf("2026-06-17"), "2026-06-15", "周三应回退到周一");
  assert.equal(mondayOf("2026-06-21"), "2026-06-15", "周日属于同一周，不能跳到下周");
  assert.equal(mondayOf("2026-06-22"), "2026-06-22", "下周一是新的一周");

  // 传周三，落在周日的课仍应算进本周——按"传入日期起 7 天"切会漏掉
  const r = buildWeeklyWorkload(db, { termId: term.id, weekStart: "2026-06-17" });
  assert.equal(r.weekStart, "2026-06-15");
  assert.equal(r.weekEnd, "2026-06-21");
  const row = r.rows.find((x) => x.teacherId === primary.id);
  assert.equal(row.daily[6], 1, "周日那节课必须计入本周");
  assert.equal(r.lessons.some((l) => l.date === "2026-06-22"), false, "下周的课不应出现");
}

// ---------------------------------------------------------------------------
// 2. 课时统计：排给谁就算谁的，取消的不算，半课时可加
//
// 计薪口径从「已签到完成」改成「排了就算」之后，这张台账的两列跟着变：
// 原来的「已完成 / 考勤异常」没有了来源，现在是「计薪课次 / 未到时间」。
// 未到时间的课**也已经计薪**，单列只是让看的人分得清。
// ---------------------------------------------------------------------------
{
  const r = buildWeeklyWorkload(db, { termId: term.id, weekStart: "2026-06-15" });
  const row = r.rows.find((x) => x.teacherId === primary.id);

  assert.equal(row.daily[0], 2.5, "周一 1 + 1.5 课时应为 2.5");
  assert.equal(row.lessonCount, 6, "取消的课不计入课次（7 节中 1 节取消）");
  assert.equal(row.units, 6.5, "课时合计应为 6.5");
  assert.equal(row.cancelled, 1, "取消的课要单独报数");
  assert.equal(row.payable, 6, "除取消外全部计薪");
  assert.equal(
    row.payable,
    row.lessonCount,
    "计薪课次应等于课次合计——取消的已经在上面被排除了",
  );
  assert.equal(typeof row.pending, "number", "未到时间的课次要有计数");
  assert.ok(row.pending <= row.payable, "未到时间的课是计薪课次的子集");

  // 取消的课不能出现在任何一天的课时里
  assert.equal(row.daily[3], 0, "周四那节已取消，当天课时应为 0");

  // 合计行必须等于各行之和
  assert.equal(
    r.totals.units,
    r.rows.reduce((s, x) => s + x.units, 0),
    "合计课时应等于各行之和",
  );
}

// ---------------------------------------------------------------------------
// 3. 数据范围：学部财务、学部负责人、教师本人
// ---------------------------------------------------------------------------
{
  const full = buildWeeklyWorkload(db, { termId: term.id, weekStart: "2026-06-15" });
  assert.ok(
    full.rows.some((x) => x.teacherId === middle.id) && full.rows.some((x) => x.teacherId === high.id),
    "不加范围时应能看到各学部",
  );

  // 小学部财务：看不到初高中任何一节课
  const finance = buildWeeklyWorkload(db, {
    termId: term.id,
    weekStart: "2026-06-15",
    account: { role: "finance", financeScope: "primary" },
  });
  assert.ok(finance.rows.length > 0, "小学部财务应看到小学教师");
  assert.ok(
    finance.rows.every((x) => x.stageId === "primary"),
    "小学部财务不应看到其他学部的教师",
  );
  assert.ok(
    finance.lessons.every((l) => l.stageName === "小学部"),
    "明细里也不能混入他部课次",
  );
  assert.match(finance.scopeNote, /小学部/, "副标题必须写明范围，否则会被当成全校数据");

  // 总校财务管行政后勤，他们不上课——表应为空，而不是回落成全校
  const hq = buildWeeklyWorkload(db, {
    termId: term.id,
    weekStart: "2026-06-15",
    account: { role: "finance", financeScope: "headquarters" },
  });
  assert.equal(hq.totals.lessonCount, 0, "总校财务口径下不应出现任何教学课次");

  // 学部负责人：只看 scopeStageIds
  const head = buildWeeklyWorkload(db, {
    termId: term.id,
    weekStart: "2026-06-15",
    account: { role: "division_head", scopeStageIds: ["middle"] },
  });
  assert.ok(head.rows.length > 0);
  assert.ok(head.rows.every((x) => x.stageId === "middle"), "初中部负责人只能看初中部");

  // 教师：只看自己
  const self = buildWeeklyWorkload(db, {
    termId: term.id,
    weekStart: "2026-06-15",
    account: { role: "teacher", teacherId: primary.id },
  });
  assert.equal(self.rows.length, 1, "教师只应看到自己一行");
  assert.equal(self.rows[0].teacherId, primary.id);

  // 教师传别人的工号也越不过去——筛选叠加在权限之上，不能放宽
  const spoof = buildWeeklyWorkload(db, {
    termId: term.id,
    weekStart: "2026-06-15",
    account: { role: "teacher", teacherId: primary.id },
    teacherId: middle.id,
  });
  assert.equal(spoof.rows.length, 0, "教师指定他人工号应得到空表，而不是他人数据");
}

// ---------------------------------------------------------------------------
// 4. 无课教师开关：合计不受影响
// ---------------------------------------------------------------------------
{
  const withIdle = buildWeeklyWorkload(db, { termId: term.id, weekStart: "2026-06-15", includeIdle: true });
  const noIdle = buildWeeklyWorkload(db, { termId: term.id, weekStart: "2026-06-15", includeIdle: false });
  assert.ok(withIdle.rows.length > noIdle.rows.length, "应有无课教师被过滤掉");
  assert.equal(noIdle.totals.units, withIdle.totals.units, "过滤无课教师不应改变课时合计");
  assert.ok(noIdle.rows.every((x) => x.lessonCount > 0 || x.cancelled > 0), "过滤后不应留下空行");
  assert.equal(withIdle.totals.idleCount, noIdle.totals.idleCount, "无课人数两种口径下应一致");
}

// ---------------------------------------------------------------------------
// 5. 工作量 Excel：两张表、数值可求和、异常标色
// ---------------------------------------------------------------------------
{
  const report = buildWeeklyWorkload(db, { termId: term.id, weekStart: "2026-06-15", includeIdle: false });
  const xml = buildWeeklyWorkloadExcel(report);

  assert.ok(xml.startsWith("<?xml version"), "应为 XML 文档");
  assert.match(xml, /mso-application progid="Excel\.Sheet"/, "缺处理指令则双击不会用 Excel 打开");
  assert.match(xml, /ss:Name="工作量汇总"/, "应有汇总表");
  assert.match(xml, /ss:Name="课次明细"/, "应有明细表");
  assert.match(xml, new RegExp(primary.name), "应含教师姓名");
  assert.match(xml, /已取消|考勤异常/, "异常与取消状态应在明细中体现");

  // 课时必须是 Number，否则学校在 Excel 里无法求和
  assert.match(xml, /<Data ss:Type="Number">6\.5<\/Data>/, "课时合计应以数值写入");
  assert.ok(!/<Data ss:Type="String">6\.5<\/Data>/.test(xml), "课时不得写成字符串");

  // 副标题必须带范围，导出的文件流转出去后要能自证口径
  assert.match(xml, /范围：/, "副标题应写明数据范围");

  const scoped = buildWeeklyWorkloadExcel(
    buildWeeklyWorkload(db, {
      termId: term.id,
      weekStart: "2026-06-15",
      account: { role: "finance", financeScope: "primary" },
      includeIdle: false,
    }),
  );
  assert.ok(!scoped.includes(middle.name), "小学部导出的文件里不得出现初中教师姓名");
  assert.ok(!scoped.includes(high.name), "小学部导出的文件里不得出现高中教师姓名");

  const result = exportWeeklyWorkload(db, { termId: term.id, weekStart: "2026-06-15" });
  assert.match(result.filename, /\.xls$/);
  assert.equal(result.mimeType, "application/vnd.ms-excel");
  assert.ok(!result.filename.includes(" "), "文件名不应含空格");
}

// ---------------------------------------------------------------------------
// 6. 年度薪资：已结算与结算中必须分开合计
// ---------------------------------------------------------------------------
const detail = (teacherId, month, status, gross, parts = {}) => ({
  id: `PD-${teacherId}-${month}`,
  teacherId,
  month,
  termId: term.id,
  status,
  summarySnapshot: {
    baseSalary: parts.baseSalary ?? 4000,
    positionSalary: parts.positionSalary ?? 500,
    assessmentSalary: parts.assessmentSalary ?? 1000,
    senioritySalary: parts.senioritySalary ?? 200,
    housingAllowance: parts.housingAllowance ?? 300,
    lessonAmount: parts.lessonAmount ?? 800,
    supplementalAmount: parts.supplementalAmount ?? 0,
    deductionAmount: parts.deductionAmount ?? 0,
    grossPay: gross,
  },
  rowsSnapshot: [],
  lineSnapshots: [],
});

db.payrollDetails = [
  detail(primary.id, "2026-01", "locked", 6800),
  detail(primary.id, "2026-02", "locked", 6800),
  detail(primary.id, "2026-03", "reviewed", 7000), // 结算中
  detail(primary.id, "2025-12", "locked", 5000), // 上一年，不应进 2026 报表
  detail(middle.id, "2026-01", "locked", 9000),
  detail(high.id, "2026-01", "locked", 9500),
  // 高中部有个月尚未结算：用于验证"未结算月份"这类汇总信息也不能跨学部泄漏
  detail(high.id, "2026-05", "generated", 9500),
];

{
  const r = buildAnnualSalary(db, { year: 2026 });
  const row = r.rows.find((x) => x.teacherId === primary.id);

  assert.equal(row.monthly[0], 6800, "1 月");
  assert.equal(row.monthly[2], 7000, "3 月（结算中也要显示金额）");
  assert.equal(row.monthly[3], null, "4 月无工资单应为 null，不能写成 0");
  assert.equal(row.settled, 13600, "已结算合计只含 1、2 月");
  assert.equal(row.inProgress, 7000, "结算中合计单列");
  assert.equal(row.settledMonths, 2);
  assert.notEqual(row.settled, 20600, "结算中的金额绝不能并进已结算合计");

  // 上一年的账套不能混进来
  assert.ok(!row.monthly.includes(5000), "2025 年 12 月的工资不应出现在 2026 报表");

  // 项目分解只统计已结算月份
  assert.equal(row.components.baseSalary, 8000, "基本工资 = 2 个已结算月 × 4000");
  assert.equal(row.components.lessonAmount, 1600, "课时津贴 = 2 个已结算月 × 800");

  assert.deepEqual(r.unsettledMonths, ["2026-03", "2026-05"], "应报告哪些月份尚未结算");

  // 合计行
  assert.equal(r.totals.monthly[0], 6800 + 9000 + 9500, "1 月全校合计");
  assert.equal(r.totals.settled, 13600 + 9000 + 9500, "已结算合计不含高中部 5 月的结算中金额");
  assert.equal(r.totals.monthly[4], 9500, "5 月只有高中部一笔");
}

// ---------------------------------------------------------------------------
// 7. 年度薪资的数据范围：财务只看本学部的工资
// ---------------------------------------------------------------------------
{
  const finance = buildAnnualSalary(db, {
    year: 2026,
    account: { role: "finance", financeScope: "primary" },
  });
  assert.ok(finance.rows.some((x) => x.teacherId === primary.id));
  assert.ok(
    !finance.rows.some((x) => x.teacherId === middle.id || x.teacherId === high.id),
    "小学部财务不得看到他部教师",
  );
  assert.equal(finance.totals.settled, 13600, "合计只能是本学部的，不能是全校的 32100");
  // 汇总信息同样不能越界：小学部不该知道高中部哪个月还没结算
  assert.deepEqual(
    finance.unsettledMonths,
    ["2026-03"],
    "未结算月份清单不得包含他部的月份（2026-05 是高中部的）",
  );

  const self = buildAnnualSalary(db, {
    year: 2026,
    account: { role: "teacher", teacherId: primary.id },
  });
  assert.equal(self.rows.length, 1, "教师只看自己");
  assert.equal(self.rows[0].teacherId, primary.id);
}

// ---------------------------------------------------------------------------
// 8. 年度薪资 Excel：金额可求和、口径写在表上
// ---------------------------------------------------------------------------
{
  const report = buildAnnualSalary(db, { year: 2026 });
  const xml = buildAnnualSalaryExcel(report);

  assert.match(xml, /ss:Name="按月汇总"/);
  assert.match(xml, /ss:Name="按项目汇总"/);
  assert.match(xml, /2026 年度薪资汇总表/);
  assert.match(xml, /已结算合计/);
  assert.match(xml, /结算中合计/);

  // 金额必须是 Number 且带千分位格式，否则财务没法在 Excel 里核账
  assert.match(xml, /<Data ss:Type="Number">6800<\/Data>/, "月度金额应以数值写入");
  assert.match(xml, /ss:Format="#,##0\.00"/, "金额应有两位小数格式");

  // 未结算月份必须在表上写清楚，不能让人把"结算中"当成已发放
  assert.match(xml, /2026-03、2026-05 尚未结算/, "副标题应逐一点名未结算的月份");
  assert.match(xml, /仅统计已结算月份/, "项目分解表应声明口径");

  // 无工资单的月份应是空单元格，而不是 0
  assert.match(xml, /<Cell ss:StyleID="money"\/>/, "缺月应为空格，写 0 会被当成已核算");

  const scoped = buildAnnualSalaryExcel(
    buildAnnualSalary(db, { year: 2026, account: { role: "finance", financeScope: "primary" } }),
  );
  assert.ok(!scoped.includes(middle.name), "小学部导出的年度表不得含初中教师");
  assert.ok(!scoped.includes("9500"), "他部金额不得出现在小学部导出的文件里");

  const result = exportAnnualSalary(db, { year: 2026 });
  assert.match(result.filename, /2026/, "文件名应含年份");
  assert.match(result.filename, /\.xls$/);
  assert.equal(result.mimeType, "application/vnd.ms-excel");
}

// ---------------------------------------------------------------------------
// 9. 应发工资明细表（验收 3.15）
//
// 这张表交给财务去办个税与社保，所以：口径必须写在表上、合计必须有、
// 未结算的行必须能一眼认出（否则会被直接拿去付款）。
// ---------------------------------------------------------------------------
{
  const sheet = buildPayrollSheet(db, { month: "2026-01" });
  assert.ok(sheet.rows.length > 0, "应有明细行");

  const one = sheet.rows.find((r) => r.name === primary.name);
  assert.ok(one, "应含样本教师");
  assert.equal(one.grossPay, 6800);
  assert.equal(one.amounts.baseSalary, 4000);
  assert.equal(one.statusLabel, "已结算");
  assert.ok(!("bankCard" in one), "不得输出完整银行卡号");

  // 合计
  assert.equal(
    sheet.totals.grossPay,
    sheet.rows.reduce((s, r) => s + r.grossPay, 0),
    "合计应等于各行之和",
  );
  assert.equal(sheet.totals.headcount, sheet.rows.length);

  const xml = buildPayrollSheetExcel(sheet, { scopeNote: "小学部" });
  assert.match(xml, /应发工资明细表/);
  assert.match(xml, /代扣项由财务线下处理/, "口径必须印在表上，否则财务会以为这是实发数");
  assert.match(xml, /制表：/, "缺签字栏财务不收");
  assert.match(xml, /复核：/);
  assert.match(xml, /审批：/);
  assert.match(xml, /合计（\d+ 人）/, "必须有合计行");
  assert.match(xml, /<Data ss:Type="Number">6800<\/Data>/, "金额应可求和");

  // 未结算的要标出来并在副标题点名
  const mixed = buildPayrollSheet(db, { month: "2026-03" }); // 该月是 reviewed
  assert.ok(mixed.totals.unsettledCount > 0);
  const mixedXml = buildPayrollSheetExcel(mixed, {});
  assert.match(mixedXml, /尚未结算，付款前须先完成审批/, "未结算的必须提示，否则会被直接拿去付款");

  const result = exportPayrollSheet(db, { month: "2026-01" }, { scopeNote: "小学部" });
  assert.match(result.filename, /应发工资明细表/);
  assert.match(result.filename, /\.xls$/);
  assert.ok(!result.filename.includes(" "));
}

console.log("reports checks passed");
