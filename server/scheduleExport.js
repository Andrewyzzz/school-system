// 课表导出（验收清单 2.10 / 2.11）
//
// 课表是「时段 × 星期」的二维表，支持按教师、班级、年级三个维度查看。
//
// 导出格式选型：
//   Excel —— 生成 SpreadsheetML 2003（XML 格式的 .xls）。这是微软的开放格式，
//            纯文本即可生成、无需任何依赖，Excel 与 WPS 均可直接打开。
//            相比导出 CSV 再让用户"用 Excel 打开"，这是真正的 Excel 文件，
//            且支持多工作表、合并单元格与单元格样式——CSV 表达不了二维课表的表头。
//   PDF   —— 由前端打印视图承载（浏览器「打印 → 另存为 PDF」），一套实现同时
//            满足验收要求的「导出 PDF」与「打印」两项。
//
// 课次数据本身不含教师姓名，需按 teacherId 关联；课表按自然周呈现，
// 同一时段同一星期可能有多节课（不同班级），单元格内换行罗列。

import { buildWorkbook, cell, exportFilename, row, sheetNameOf } from "./excel.js";

const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

// 课次状态在课表上的呈现：取消的课要能一眼看出，不能和正常课混在一起
const STATUS_MARK = {
  cancelled: "【已取消】",
  scheduled: "",
};

function weekdayIndexOf(dateKey) {
  const [y, m, d] = String(dateKey || "").split("-").map(Number);
  if (!y || !m || !d) return -1;
  const day = new Date(y, m - 1, d).getDay(); // 0=周日
  return day === 0 ? 6 : day - 1;
}

function teacherNameOf(db, teacherId) {
  return (db.teachers || []).find((t) => t.id === teacherId)?.name || teacherId || "";
}

/**
 * 组装二维课表。
 * dimension: teacher | class | grade
 * 返回 { title, periods, weekdays, cells }，cells[periodIndex][weekdayIndex] 是课次数组。
 */
export function buildScheduleGrid(db, options = {}) {
  const { termId, dimension = "class", targetId = "", weekStart = "" } = options;
  const term = (db.terms || []).find((t) => t.id === termId) || (db.terms || []).find((t) => t.current);
  if (!term) throw Object.assign(new Error("学期不存在"), { statusCode: 404 });

  let lessons = (db.lessonInstances || []).filter((l) => l.termId === term.id);

  // 限定到某一自然周：不限定时整个学期的课会全叠在同一格里
  if (weekStart) {
    const end = addDays(weekStart, 6);
    lessons = lessons.filter((l) => l.date >= weekStart && l.date <= end);
  }

  let title = term.name;
  if (dimension === "teacher" && targetId) {
    lessons = lessons.filter((l) => l.teacherId === targetId);
    title = `${teacherNameOf(db, targetId)} 课表`;
  } else if (dimension === "class" && targetId) {
    lessons = lessons.filter((l) => l.classId === targetId);
    title = `${lessons[0]?.className || targetId} 课表`;
  } else if (dimension === "grade" && targetId) {
    lessons = lessons.filter((l) => String(l.gradeId) === String(targetId));
    title = `${targetId} 年级课表`;
  }

  // 时段取实际出现过的，按开始时间排序——不同学部作息不同，写死会错位
  const periods = [...new Set(lessons.map((l) => l.time).filter(Boolean))].sort();

  const cells = periods.map(() => WEEKDAYS.map(() => []));
  lessons.forEach((lesson) => {
    const p = periods.indexOf(lesson.time);
    const w = weekdayIndexOf(lesson.date);
    if (p < 0 || w < 0) return;
    cells[p][w].push({
      subjectName: lesson.subjectName || "",
      className: lesson.className || "",
      teacherName: teacherNameOf(db, lesson.teacherId),
      room: lesson.room || "",
      status: lesson.status || "",
      date: lesson.date,
    });
  });

  return {
    title,
    termId: term.id,
    termName: term.name,
    dimension,
    targetId,
    weekStart,
    periods,
    weekdays: WEEKDAYS,
    cells,
    lessonCount: lessons.length,
  };
}

function addDays(dateKey, days) {
  const [y, m, d] = String(dateKey).split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

// 单元格文案：一格内可能有多节课（同时段不同班级），逐条换行
function cellText(entries, dimension) {
  return entries
    .map((e) => {
      const mark = STATUS_MARK[e.status] || "";
      const parts = [mark + e.subjectName];
      // 按教师看课表时，关心的是"给哪个班上课"；按班级看时，关心的是"谁来上"
      if (dimension === "teacher") parts.push(e.className);
      else parts.push(e.teacherName);
      if (e.room) parts.push(e.room);
      return parts.filter(Boolean).join(" ");
    })
    .join("\n");
}

/**
 * 生成 SpreadsheetML 2003 格式的 Excel 文件内容（纯文本，无依赖）。
 * Excel 与 WPS 均可直接打开；扩展名用 .xls。
 */
export function buildScheduleExcel(grid) {
  const { title, termName, periods, weekdays, cells, dimension, weekStart } = grid;

  const rows = [
    row([cell("时段", "head"), ...weekdays.map((w) => cell(w, "head"))], 22),
    ...periods.map((period, p) =>
      row(
        [cell(period, "label"), ...weekdays.map((_, w) => cell(cellText(cells[p][w], dimension)))],
        46,
      ),
    ),
  ];

  return buildWorkbook([
    {
      name: sheetNameOf(title, "课表"),
      title,
      subtitle: [termName, weekStart ? `${weekStart} 起当周` : "全学期"].filter(Boolean).join(" · "),
      columns: [86, ...weekdays.map(() => 128)],
      rows,
      freezeRows: 1, // 冻结表头行，滚动时星期不跑掉
    },
  ]);
}

export function scheduleExportFilename(grid, ext) {
  return exportFilename([grid.title, grid.weekStart || grid.termName], ext);
}

/** 导出接口的统一出口 */
export function exportSchedule(db, options = {}) {
  const grid = buildScheduleGrid(db, options);
  const content = buildScheduleExcel(grid);
  return {
    filename: scheduleExportFilename(grid, "xls"),
    content,
    mimeType: "application/vnd.ms-excel",
    total: grid.lessonCount,
    grid,
  };
}
