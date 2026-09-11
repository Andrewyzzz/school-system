import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDirectory = new URL("../output/", import.meta.url);
const assetDirectory = new URL("../assets/", import.meta.url);

const STANDARD_HEADERS = ["教师工号*", "教师姓名*", "考勤日期*", "应出勤*", "上午上班打卡", "上午下班打卡", "下午上班打卡", "下午下班打卡", "备注"];
const PRIMARY_HEADERS = [
  "教师工号*", "教师姓名*", "考勤日期*", "应出勤*",
  "上午上班打卡", "上午上班补卡状态*",
  "上午下班打卡", "上午下班补卡状态*",
  "下午上班打卡", "下午上班补卡状态*",
  "下午下班打卡", "下午下班补卡状态*", "备注",
];
const HIGH_HEADERS = ["教师工号*", "教师姓名*", "考勤日期*", "应出勤*", "到岗状态*", "迟到分钟", "签退状态*", "早退分钟", "旷课节数", "旷工天数", "备注"];

const templates = [
  {
    id: "primary",
    filename: "小学部教师月度考勤上传模板.xlsx",
    title: "小学部教师月度考勤上传模板",
    subtitle: "每行对应一位教师的一天考勤。缺少某次打卡时，请在紧邻的“补卡状态”中明确填写“已补卡”或“未补卡”。",
    headers: PRIMARY_HEADERS,
    rows: [
      ["上传前", "在系统内选择“小学部”和对应考勤月份。考勤日期必须属于该月份。"],
      ["一行代表什么", "一位教师在一个自然日的四次打卡汇总。请勿把同一教师同一天拆成多行。"],
      ["应出勤", "填“是”表示该日需要纳入考勤；填“否”表示该日不纳入。系统不会自行判断周末、值班或其他应打卡日期。"],
      ["打卡与补卡状态", "有原始打卡时间时，补卡状态填“正常”；无原始打卡时，填“已补卡”或“未补卡”。"],
      ["迟到扣款", "上午上班晚于 07:45，或下午上班晚于 14:15，各计迟到 1 次，扣 30 元。临界时间不计迟到。"],
      ["未补卡扣款", "应出勤且某一次没有打卡，并明确填“未补卡”，每次扣 50 元。已补卡不扣款。"],
      ["旷工扣款", "应出勤且四次均无打卡、四项均填“未补卡”时，按旷工 200 元／天处理；已批准请假或外出不计旷工。"],
      ["不自动处理", "系统不自动处理早退、周五下午离校、周日值班或假打卡；如需处理，按学校后续规则另行确认。"],
      ["数据范围", "只填写小学部教师。系统会校验教师归属、月份、必填项与同一教师同一天的重复记录。"],
    ],
    primary: true,
  },
  {
    id: "middle",
    filename: "初中部教师月度考勤上传模板.xlsx",
    title: "初中部教师月度考勤上传模板",
    subtitle: "每行对应一位教师的一天考勤。请按初中部已确认的考勤制度填写四次打卡记录。",
    headers: STANDARD_HEADERS,
    rows: [
      ["上传前", "在系统内选择“初中部”和对应考勤月份。考勤日期必须属于该月份。"],
      ["一行代表什么", "一位教师在一个自然日的四次打卡汇总。请勿把同一教师同一天拆成多行。"],
      ["应出勤", "填“是”表示该教师当天应正常出勤；填“否”表示无需考勤。只对填“是”的全天无打卡记录检查旷工。"],
      ["打卡时间", "填写 HH:MM，例如 08:20、12:05、14:10、17:35。没有打卡记录可留空。"],
      ["初中部规则", "上午上班 7:50 后、下午上班 14:05 后计迟到；上午下班 11:25 前、下午下班 17:25 前计早退。本月第 1、2、3 次及以后分别扣 20、30、50 元；无故旷工 300 元／天。"],
      ["请假或外出", "已批准请假或外出的全天无打卡日期不会被系统计为旷工。假打卡由人工处理。"],
      ["数据范围", "只填写初中部教师。系统会校验教师归属、月份、必填项与同一教师同一天的重复记录。"],
    ],
  },
  {
    id: "high",
    filename: "高中部教师月度考勤上传模板.xlsx",
    title: "高中部教师月度考勤上传模板",
    subtitle: "每行对应一位教师的一天考勤。直接填写考勤结果，不需要填写四次精确打卡时间。",
    headers: HIGH_HEADERS,
    rows: [
      ["上传前", "在系统内选择“高中部”和对应考勤月份。考勤日期必须属于该月份。"],
      ["一行代表什么", "一位教师在一个自然日的一条考勤结果。请勿把同一教师同一天拆成多行。"],
      ["应出勤", "填“是”表示该日需要纳入考勤；填“否”表示该日不纳入。系统不会自行判断哪些日期需要打卡。"],
      ["到岗情况", "到岗状态填“准时”或“迟到”。准时时迟到分钟填 0；迟到时填写实际分钟数。1 至 10 分钟为轻微迟到，11 分钟及以上为超时迟到。"],
      ["签退情况", "签退状态填“准时”“早退”“未签退”或“已补签”。只有“早退”时填写早退分钟，其他状态填 0。"],
      ["轻微违纪", "10 分钟内迟到和未签退合并按月累计。第 1 至 2 次只提示；第 3 次起每次扣当月考核工资 2%。"],
      ["严重迟到或早退", "超时迟到和早退，每次扣当月考核工资 3%。"],
      ["旷课", "填写当日旷课节数。1 节扣当月考核工资 5%；当月累计 2 节及以上扣 15%。对应课次应在课表中标记取消，避免计入课时工资。"],
      ["旷工", "填写当日旷工天数，通常填 0 或 1。每旷工 1 天，扣当月工资总额的 1/22。"],
      ["制度依据", "《违纪处罚规定》“考勤违纪处理”。升旗、会议、教研活动缺勤只留人工处理，不由本表自动扣薪。"],
      ["数据范围", "只填写高中部教师。系统会校验教师归属、月份、必填项与同一教师同一天的重复记录。"],
    ],
    high: true,
  },
  {
    id: "kindergarten",
    filename: "幼儿园教师月度考勤上传模板.xlsx",
    title: "幼儿园教师月度考勤上传模板",
    subtitle: "每行对应一位教师的一天考勤。当前模板用于规范上传与留存，自动扣款规则待幼儿园制度确认后启用。",
    headers: STANDARD_HEADERS,
    rows: [
      ["上传前", "在系统内选择“幼儿园”和对应考勤月份。考勤日期必须属于该月份。"],
      ["一行代表什么", "一位教师在一个自然日的四次打卡汇总。请勿把同一教师同一天拆成多行。"],
      ["应出勤", "填“是”表示该教师当天应正常出勤；填“否”表示无需考勤。"],
      ["打卡时间", "填写 HH:MM，例如 08:20、12:05、14:10、17:35。没有打卡记录可留空。"],
      ["当前处理", "系统会校验并留存幼儿园考勤数据，暂不自动影响工资；扣款规则以幼儿园书面制度确认为准。"],
      ["数据范围", "只填写幼儿园教师。系统会校验教师归属、月份、必填项与同一教师同一天的重复记录。"],
    ],
  },
];

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

function inputColumnWidth(header) {
  if (header.includes("补卡状态")) return 16;
  if (header.includes("教师工号")) return 19;
  if (header.includes("教师姓名")) return 15;
  if (header.includes("考勤日期")) return 14;
  if (header.includes("应出勤")) return 11;
  if (header.includes("状态")) return 14;
  if (header.includes("分钟")) return 12;
  if (header.includes("节数") || header.includes("天数")) return 12;
  if (header.includes("打卡")) return 16;
  return 28;
}

async function buildTemplate(config) {
  const workbook = Workbook.create();
  const detail = workbook.worksheets.add("考勤明细");
  const guide = workbook.worksheets.add("填写说明");
  const lastColumn = columnName(config.headers.length);
  const headerRange = `A4:${lastColumn}4`;
  const inputRange = `A5:${lastColumn}504`;

  detail.showGridLines = false;
  guide.showGridLines = false;
  detail.tabColor = "#2457D6";
  guide.tabColor = "#98A2B3";
  detail.getRange(`A1:${lastColumn}1`).merge();
  detail.getRange("A1").values = [[config.title]];
  detail.getRange(`A1:${lastColumn}1`).format = { font: { name: "Arial", size: 16, bold: true, color: "#1F2937" }, horizontalAlignment: "left", verticalAlignment: "center" };
  detail.getRange("A1").format.rowHeight = 28;
  detail.getRange(`A2:${lastColumn}2`).merge();
  detail.getRange("A2").values = [[config.subtitle]];
  detail.getRange(`A2:${lastColumn}2`).format = { font: { name: "Arial", size: 10, color: "#667085", italic: true }, horizontalAlignment: "left", verticalAlignment: "center", wrapText: true };
  detail.getRange("A2").format.rowHeight = 30;
  detail.getRange(headerRange).values = [config.headers];
  detail.getRange(headerRange).format = { fill: "#1F4E78", font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true, borders: { preset: "all", style: "thin", color: "#FFFFFF" } };
  detail.getRange("A4").format.rowHeight = 32;
  detail.getRange(inputRange).format = { fill: "#FFF9E8", font: { name: "Arial", size: 10, color: "#1F2937" }, horizontalAlignment: "left", verticalAlignment: "center", borders: { preset: "inside", style: "thin", color: "#E5E7EB" } };
  detail.getRange("A5").format.rowHeight = 20;
  detail.getRange("A5:A504").format.horizontalAlignment = "center";
  detail.getRange(`C5:${lastColumn}504`).format.horizontalAlignment = "center";
  detail.getRange("C5:C504").setNumberFormat("yyyy-mm-dd");
  detail.getRange("A5:B504").format.numberFormat = [["@", "@"]];
  config.headers.forEach((header, index) => {
    const column = columnName(index + 1);
    detail.getRange(`${column}:${column}`).format.columnWidth = inputColumnWidth(header);
    if (header.includes("打卡") && !header.includes("状态")) detail.getRange(`${column}5:${column}504`).setNumberFormat("hh:mm");
  });
  detail.getRange("A5:A504").dataValidation = { rule: { type: "textLength", operator: "greaterThan", formula1: 0 } };
  detail.getRange("C5:C504").dataValidation = { rule: { type: "date", operator: "between", formula1: "DATE(2020,1,1)", formula2: "DATE(2100,12,31)" } };
  detail.getRange("D5:D504").dataValidation = { rule: { type: "list", values: ["是", "否"] } };
  if (config.primary) ["F", "H", "J", "L"].forEach((column) => {
    detail.getRange(`${column}5:${column}504`).dataValidation = { rule: { type: "list", values: ["正常", "已补卡", "未补卡"] } };
  });
  if (config.high) {
    detail.getRange("E5:E504").dataValidation = { rule: { type: "list", values: ["准时", "迟到"] } };
    detail.getRange("G5:G504").dataValidation = { rule: { type: "list", values: ["准时", "早退", "未签退", "已补签"] } };
    ["F", "H", "I", "J"].forEach((column) => {
      detail.getRange(`${column}5:${column}504`).dataValidation = { rule: { type: "whole", operator: "between", formula1: 0, formula2: 999 } };
      detail.getRange(`${column}5:${column}504`).setNumberFormat("0");
    });
  }
  detail.freezePanes.freezeRows(4);

  guide.getRange("A1:B1").merge();
  guide.getRange("A1").values = [[`${config.title}填写说明`]];
  guide.getRange("A1:B1").format = { font: { name: "Arial", size: 16, bold: true, color: "#1F2937" }, horizontalAlignment: "left", verticalAlignment: "center" };
  guide.getRange("A1").format.rowHeight = 28;
  guide.getRange("A3:B3").values = [["填写项目", "要求"]];
  guide.getRange("A3:B3").format = { fill: "#1F4E78", font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "all", style: "thin", color: "#FFFFFF" } };
  const lastGuideRow = config.rows.length + 3;
  guide.getRange(`A4:B${lastGuideRow}`).values = config.rows;
  guide.getRange(`A4:A${lastGuideRow}`).format = { fill: "#F2F4F7", font: { name: "Arial", size: 10, bold: true, color: "#344054" }, horizontalAlignment: "left", verticalAlignment: "center", borders: { preset: "all", style: "thin", color: "#D0D5DD" } };
  guide.getRange(`B4:B${lastGuideRow}`).format = { font: { name: "Arial", size: 10, color: "#344054" }, horizontalAlignment: "left", verticalAlignment: "center", wrapText: true, borders: { preset: "all", style: "thin", color: "#D0D5DD" } };
  guide.getRange(`A4:B${lastGuideRow}`).format.rowHeight = 42;
  guide.getRange("A:A").format.columnWidth = 19;
  guide.getRange("B:B").format.columnWidth = 82;
  guide.freezePanes.freezeRows(3);

  await workbook.recalculate();
  const inspection = await workbook.inspect({ kind: "workbook,sheet,table", range: `考勤明细!A1:${lastColumn}8`, maxChars: 4000, tableMaxRows: 8, tableMaxCols: config.headers.length });
  if (!inspection?.ndjson) throw new Error(`${config.id} 模板校验失败：无法读取工作簿结构`);
  const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 50 }, summary: `${config.id} 模板公式错误检查` });
  if (/#[A-Z/!0-9?]+/.test(errors?.ndjson || "")) throw new Error(`${config.id} 模板存在公式错误`);

  await fs.mkdir(outputDirectory, { recursive: true });
  await fs.mkdir(assetDirectory, { recursive: true });
  const preview = await workbook.render({ sheetName: "考勤明细", autoCrop: "all", scale: 1.2, format: "png" });
  await fs.writeFile(new URL(`./${config.id}-考勤模板预览.png`, outputDirectory), new Uint8Array(await preview.arrayBuffer()));
  const guidePreview = await workbook.render({ sheetName: "填写说明", autoCrop: "all", scale: 1.2, format: "png" });
  await fs.writeFile(new URL(`./${config.id}-考勤模板说明预览.png`, outputDirectory), new Uint8Array(await guidePreview.arrayBuffer()));
  const output = await SpreadsheetFile.exportXlsx(workbook);
  await output.save(fileURLToPath(new URL(`./${config.filename}`, assetDirectory)));
  console.log(`${config.id}: ${inspection.ndjson}`);
}

const targetId = process.argv[2] || "";
const selectedTemplates = targetId ? templates.filter((config) => config.id === targetId) : templates;
if (!selectedTemplates.length) throw new Error(`未找到考勤模板：${targetId}`);
for (const config of selectedTemplates) await buildTemplate(config);
