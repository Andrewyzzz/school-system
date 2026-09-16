import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDirectory = new URL("../output/", import.meta.url);
const assetDirectory = new URL("../assets/", import.meta.url);
const filename = "全校统一月度考勤上传模板.xlsx";
const headers = [
  "教师工号*", "教师姓名*", "考勤日期*", "应出勤*",
  "上午上班打卡", "上午下班打卡", "下午上班打卡", "下午下班打卡",
  "迟到分钟", "早退分钟", "脱岗分钟", "旷课节数", "旷工天数", "免责认定", "备注",
];

const widths = [19, 15, 14, 11, 16, 16, 16, 16, 12, 12, 12, 12, 12, 18, 30];

function columnName(index) {
  let value = index;
  let name = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

const workbook = Workbook.create();
const detail = workbook.worksheets.add("考勤明细");
const guide = workbook.worksheets.add("填写说明");
const lastColumn = columnName(headers.length);

detail.showGridLines = false;
detail.tabColor = "#2457D6";
detail.getRange(`A1:${lastColumn}1`).merge();
detail.getRange("A1").values = [["深圳市富源学校统一月度考勤上传模板"]];
detail.getRange(`A1:${lastColumn}1`).format = {
  font: { name: "Arial", size: 16, bold: true, color: "#1F2937" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
};
detail.getRange("A1").format.rowHeight = 28;
detail.getRange(`A2:${lastColumn}2`).merge();
detail.getRange("A2").values = [["每行对应一位教师的一天考勤。请按本学部作息先判定分钟数；系统不自行判断应打卡日期。所有“*”列必填。"]];
detail.getRange(`A2:${lastColumn}2`).format = {
  font: { name: "Arial", size: 10, color: "#667085", italic: true },
  horizontalAlignment: "left",
  verticalAlignment: "center",
  wrapText: true,
};
detail.getRange("A2").format.rowHeight = 30;
detail.getRange(`A4:${lastColumn}4`).values = [headers];
detail.getRange(`A4:${lastColumn}4`).format = {
  fill: "#1F4E78",
  font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#FFFFFF" },
};
detail.getRange("A4").format.rowHeight = 34;
detail.getRange(`A5:${lastColumn}504`).format = {
  fill: "#FFF9E8",
  font: { name: "Arial", size: 10, color: "#1F2937" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "inside", style: "thin", color: "#E5E7EB" },
};
detail.getRange("A5").format.rowHeight = 20;
widths.forEach((width, index) => {
  detail.getRange(`${columnName(index + 1)}:${columnName(index + 1)}`).format.columnWidth = width;
});
detail.getRange("A5:B504").format.numberFormat = [["@", "@"]];
detail.getRange("C5:C504").setNumberFormat("yyyy-mm-dd");
["E", "F", "G", "H"].forEach((column) => detail.getRange(`${column}5:${column}504`).setNumberFormat("hh:mm"));
detail.getRange("A5:A504").dataValidation = { rule: { type: "textLength", operator: "greaterThan", formula1: 0 } };
detail.getRange("C5:C504").dataValidation = { rule: { type: "date", operator: "between", formula1: "DATE(2020,1,1)", formula2: "DATE(2100,12,31)" } };
detail.getRange("D5:D504").dataValidation = { rule: { type: "list", values: ["是", "否"] } };
["I", "J", "K", "L"].forEach((column) => {
  detail.getRange(`${column}5:${column}504`).dataValidation = { rule: { type: "whole", operator: "between", formula1: 0, formula2: 999 } };
  detail.getRange(`${column}5:${column}504`).setNumberFormat("0");
});
detail.getRange("M5:M504").dataValidation = { rule: { type: "decimal", operator: "between", formula1: 0, formula2: 31 } };
detail.getRange("M5:M504").setNumberFormat("0.0");
detail.getRange("N5:N504").dataValidation = {
  rule: { type: "list", values: ["正常", "免责", "已批准请假", "已批准外出", "学校公务", "专项培训", "临时工作调度"] },
};
detail.freezePanes.freezeRows(4);

guide.showGridLines = false;
guide.tabColor = "#98A2B3";
guide.getRange("A1:B1").merge();
guide.getRange("A1").values = [["统一月度考勤表填写说明"]];
guide.getRange("A1:B1").format = {
  font: { name: "Arial", size: 16, bold: true, color: "#1F2937" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
};
guide.getRange("A1").format.rowHeight = 28;
guide.getRange("A3:B3").values = [["填写项目", "要求"]];
guide.getRange("A3:B3").format = {
  fill: "#1F4E78",
  font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "all", style: "thin", color: "#FFFFFF" },
};
const guideRows = [
  ["适用范围", "四个学部使用同一张模板。上传时在系统中选择对应学部和考勤月份；系统校验教师归属与月份。"],
  ["一行代表什么", "一位教师在一个自然日的一条考勤记录。同一教师、同一天不可重复。"],
  ["应出勤", "填“是”代表需要纳入考勤；填“否”代表当天不考勤。学校自行确定哪些日期需要打卡，系统不据周末或节假日推断。"],
  ["四次打卡", "按实际情况填写 HH:MM；无原始打卡可留空。四次打卡用于留痕，不由系统直接套用统一作息。"],
  ["迟到／早退／脱岗分钟", "由各学部按本地作息核对后填写。填 0 表示无。≤10 分钟为轻微，11–30 分钟为一般，超过 30 分钟为较重。"],
  ["旷课／空堂与旷工", "据实填写节数和天数；旷工天数可填 0、0.5 或整数。已批准请假、外出或学校公务不要按旷工填写。"],
  ["免责认定", "无免责填“正常”。已批准请假、已批准外出、学校公务、专项培训或临时工作调度，选择对应项；系统不计入考勤违纪。"],
  ["工资处理", "考勤违纪仅从考核工资中扣减，月度最多 20%。考核工资为 0 时只留记录；扣减后税前应发不低于系统配置的最低工资标准。"],
  ["切换口径", "本表适用于 2026 年 9 月起未锁定的工资；已锁定历史工资单保留原结果，不自动回算。"],
  ["制度依据", "《深圳市富源学校考勤休假管理制度》（2026 年 9 月上传版本）。"],
];
guide.getRange(`A4:B${guideRows.length + 3}`).values = guideRows;
guide.getRange(`A4:A${guideRows.length + 3}`).format = {
  fill: "#F2F4F7",
  font: { name: "Arial", size: 10, bold: true, color: "#344054" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
  borders: { preset: "all", style: "thin", color: "#D0D5DD" },
};
guide.getRange(`B4:B${guideRows.length + 3}`).format = {
  font: { name: "Arial", size: 10, color: "#344054" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#D0D5DD" },
};
guide.getRange(`A4:B${guideRows.length + 3}`).format.rowHeight = 40;
guide.getRange("A:A").format.columnWidth = 20;
guide.getRange("B:B").format.columnWidth = 92;
guide.freezePanes.freezeRows(3);

await workbook.recalculate();
const inspection = await workbook.inspect({
  kind: "workbook,sheet,table",
  range: `考勤明细!A1:${lastColumn}8`,
  maxChars: 5000,
  tableMaxRows: 8,
  tableMaxCols: headers.length,
});
if (!inspection?.ndjson) throw new Error("统一考勤模板校验失败：无法读取工作簿结构");
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 50 },
  summary: "统一考勤模板公式错误检查",
});
if (/#[A-Z/!0-9?]+/.test(errors?.ndjson || "")) throw new Error("统一考勤模板存在公式错误");

await fs.mkdir(outputDirectory, { recursive: true });
await fs.mkdir(assetDirectory, { recursive: true });
const preview = await workbook.render({ sheetName: "考勤明细", autoCrop: "all", scale: 1.2, format: "png" });
await fs.writeFile(new URL("./全校统一月度考勤上传模板-预览.png", outputDirectory), new Uint8Array(await preview.arrayBuffer()));
const guidePreview = await workbook.render({ sheetName: "填写说明", autoCrop: "all", scale: 1.2, format: "png" });
await fs.writeFile(new URL("./全校统一月度考勤上传模板-说明预览.png", outputDirectory), new Uint8Array(await guidePreview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(fileURLToPath(new URL(`./${filename}`, assetDirectory)));
console.log(inspection.ndjson);
