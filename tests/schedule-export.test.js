// 课表导出（验收清单 2.10 Excel / 2.11 PDF 与打印）
//
// Excel 用 SpreadsheetML 2003 生成（纯文本、零依赖，Excel 与 WPS 直接可打开）；
// PDF 由前端打印视图承载，所以这里只测 Excel 与课表网格本身，打印视图另由
// 前端源码静态检查覆盖。
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialData, normalizeDatabase } from "../server/storage.js";
import {
  buildScheduleExcel,
  buildScheduleGrid,
  exportSchedule,
  scheduleExportFilename,
} from "../server/scheduleExport.js";

const db = createInitialData({ teacherCount: 20 });
normalizeDatabase(db);
const term = db.terms.find((t) => t.current) || db.terms[0];

// 造一周课次：周一到周五各一节，另加一节同时段不同班（验证一格多课）
const teacher = db.teachers[0];
const second = db.teachers[1];
const klass = db.classes.find((c) => c.termId === term.id) || db.classes[0];
const other = db.classes.filter((c) => c.termId === klass.termId && c.id !== klass.id)[0] || klass;

// 2026-06-15 是周一
const DATES = ["2026-06-15", "2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19"];
db.lessonInstances = DATES.map((date, i) => ({
  id: `L-${i}`,
  termId: term.id,
  date,
  time: "08:00-08:40",
  teacherId: teacher.id,
  classId: klass.id,
  className: klass.name,
  subjectName: "语文",
  room: "一年级教室",
  status: i === 4 ? "cancelled" : "completed",
}));
// 同一时段的另一个班：同格内应罗列两条
db.lessonInstances.push({
  id: "L-SAME-SLOT",
  termId: term.id,
  date: "2026-06-15",
  time: "08:00-08:40",
  teacherId: second.id,
  classId: other.id,
  className: other.name,
  subjectName: "数学",
  room: "二年级教室",
  status: "completed",
});
// 另一时段，验证时段排序
db.lessonInstances.push({
  id: "L-LATER",
  termId: term.id,
  date: "2026-06-16",
  time: "14:20-15:00",
  teacherId: teacher.id,
  classId: klass.id,
  className: klass.name,
  subjectName: "体育",
  room: "操场",
  status: "completed",
});

// ---------------------------------------------------------------------------
// 1. 课表网格：星期归位、时段排序、一格多课
// ---------------------------------------------------------------------------
{
  const grid = buildScheduleGrid(db, { termId: term.id, dimension: "class", targetId: klass.id });
  assert.equal(grid.weekdays.length, 7, "应为一周七天");
  assert.equal(grid.weekdays[0], "周一", "周一在首列——JS 的 getDay() 里周日是 0，需换算");
  assert.ok(grid.periods.includes("08:00-08:40"));
  assert.ok(grid.periods.includes("14:20-15:00"));
  assert.deepEqual([...grid.periods].sort(), grid.periods, "时段应按时间升序");

  const p0 = grid.periods.indexOf("08:00-08:40");
  // 2026-06-15 是周一
  assert.equal(grid.cells[p0][0].length, 1, "本班周一该时段应有一节课");
  assert.equal(grid.cells[p0][0][0].subjectName, "语文");
  assert.equal(grid.cells[p0][5].length, 0, "周六应无课");
  assert.equal(grid.cells[p0][6].length, 0, "周日应无课");

  // 按班级筛选时不应混入别班的课
  assert.ok(
    grid.cells[p0][0].every((e) => e.className === klass.name),
    "按班级维度不应出现其他班级的课",
  );
}

// ---------------------------------------------------------------------------
// 2. 维度切换：教师维度只出本人的课，且一格可多课
// ---------------------------------------------------------------------------
{
  const grid = buildScheduleGrid(db, { termId: term.id, dimension: "teacher", targetId: teacher.id });
  assert.match(grid.title, new RegExp(teacher.name), "标题应含教师姓名");
  const all = grid.cells.flat().flat();
  assert.ok(all.length > 0, "教师应有课");
  assert.ok(
    all.every((e) => e.teacherName === teacher.name),
    "教师维度不应出现他人的课",
  );

  // 全校维度（不限定目标）时，同一时段同一天的多个班级应同格罗列
  const allGrid = buildScheduleGrid(db, { termId: term.id, dimension: "class", targetId: "" });
  const p0 = allGrid.periods.indexOf("08:00-08:40");
  assert.equal(allGrid.cells[p0][0].length, 2, "同时段两个班的课应在同一格内罗列");
}

// ---------------------------------------------------------------------------
// 3. 按周筛选：不限定时整学期的课会全叠在同一格
// ---------------------------------------------------------------------------
{
  const week = buildScheduleGrid(db, {
    termId: term.id,
    dimension: "class",
    targetId: klass.id,
    weekStart: "2026-06-15",
  });
  assert.equal(week.lessonCount, 6, "本周应有 6 节（5 天 + 1 节下午）");

  const empty = buildScheduleGrid(db, {
    termId: term.id,
    dimension: "class",
    targetId: klass.id,
    weekStart: "2026-07-06",
  });
  assert.equal(empty.lessonCount, 0, "无课的周应为空");
  assert.equal(empty.periods.length, 0, "无课时不应有时段行");
}

// ---------------------------------------------------------------------------
// 4. Excel 文件：格式合法、内容完整、取消课有标记
// ---------------------------------------------------------------------------
{
  const grid = buildScheduleGrid(db, { termId: term.id, dimension: "class", targetId: klass.id });
  const xml = buildScheduleExcel(grid);

  assert.ok(xml.startsWith("<?xml version"), "应为 XML 文档");
  assert.match(xml, /mso-application progid="Excel\.Sheet"/, "应带 Excel 处理指令，否则双击不会用 Excel 打开");
  assert.match(xml, /<Worksheet ss:Name=/, "应有工作表");
  assert.match(xml, /语文/, "应含课程名");
  assert.match(xml, new RegExp(teacher.name), "按班级看课表时应显示授课教师");
  assert.match(xml, /【已取消】/, "已取消的课必须有明显标记，不能和正常课混在一起");
  grid.weekdays.forEach((w) => assert.ok(xml.includes(w), `应含表头 ${w}`));

  // XML 转义：课程名或教室名里的 & < > 会破坏文件结构
  const tricky = buildScheduleGrid(
    { ...db, lessonInstances: [{ ...db.lessonInstances[0], subjectName: "语文 & <数学>", room: 'A"B' }] },
    { termId: term.id, dimension: "class", targetId: klass.id },
  );
  const trickyXml = buildScheduleExcel(tricky);
  assert.ok(!trickyXml.includes("语文 & <数学>"), "特殊字符必须转义");
  assert.match(trickyXml, /语文 &amp; &lt;数学&gt;/, "应正确转义为实体");

  // 工作表名不得含 Excel 禁用字符，且不超过 31 字符
  const longName = buildScheduleGrid(db, { termId: term.id, dimension: "class", targetId: "" });
  longName.title = "含非法字符:/\\?*[]的超长课表名称超过三十一个字符的情况测试";
  const nameXml = buildScheduleExcel(longName);
  const sheetName = nameXml.match(/<Worksheet ss:Name="([^"]*)"/)[1];
  assert.ok(sheetName.length <= 31, `工作表名不得超过 31 字符，实为 ${sheetName.length}`);
  assert.ok(!/[:\\/?*[\]]/.test(sheetName), "工作表名不得含 Excel 禁用字符");
}

// ---------------------------------------------------------------------------
// 5. 导出出口：文件名、MIME、条数
// ---------------------------------------------------------------------------
{
  const result = exportSchedule(db, { termId: term.id, dimension: "class", targetId: klass.id });
  assert.match(result.filename, /\.xls$/, "扩展名应为 .xls");
  assert.equal(result.mimeType, "application/vnd.ms-excel");
  assert.ok(result.total > 0, "应报告课次数");
  assert.ok(result.content.length > 500, "内容不应为空");

  // 文件名不得含路径分隔符或空格
  const name = scheduleExportFilename({ title: "一年级 1 班 课表", termName: "某学期", weekStart: "" }, "xls");
  assert.ok(!name.includes(" "), "文件名不应含空格");
  assert.ok(!name.includes("/"), "文件名不应含路径分隔符");
}

// ---------------------------------------------------------------------------
// 6. 前端打印视图（验收 2.11 的 PDF 与打印）
// ---------------------------------------------------------------------------
{
  const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const cssSource = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  const htmlSource = readFileSync(new URL("../index.html", import.meta.url), "utf8");

  assert.match(appSource, /function printSchedule\(/, "应有打印入口");
  assert.match(appSource, /function renderSchedulePrintTable\(/, "应单独渲染打印表格，而非直接打印页面");
  assert.match(appSource, /window\.print\(\)/, "应调用浏览器打印");

  // 打印不能依赖 requestAnimationFrame：标签页不在前台时浏览器会暂停 rAF，
  // 回调不执行，打印就静默失效
  const printFn = appSource.slice(appSource.indexOf("async function printSchedule("));
  const printBody = printFn.slice(0, printFn.indexOf("\nfunction "));
  // 只看代码，不看注释——注释里正解释着"为什么不用 rAF"，连注释一起匹配会误报
  const printCode = printBody.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(
    !/requestAnimationFrame/.test(printCode),
    "打印不应依赖 requestAnimationFrame（后台标签页会被暂停，导致打印静默失效）",
  );

  assert.match(cssSource, /@media print/, "应有打印样式");
  assert.match(cssSource, /schedule-print-table/, "应有打印表格样式");
  assert.match(cssSource, /display: table-header-group/, "跨页时表头应重复，否则第二页读不懂");
  assert.match(cssSource, /@page \{[^}]*landscape/, "课表七列，应设为横向打印");

  assert.match(htmlSource, /id="schedulePrintHost"/, "应有打印表格宿主容器");
  assert.match(htmlSource, /id="exportScheduleExcel"/, "应有 Excel 导出按钮");
  assert.match(htmlSource, /id="printSchedule"/, "应有打印按钮");
}

console.log("schedule export checks passed");
