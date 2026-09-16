import { createHash, randomUUID } from "node:crypto";
import { inflateRawSync } from "node:zlib";
import { accountHasRole } from "./accountRoles.js";
import { accountStageScopeIds } from "./accessScope.js";

// 月度考勤导入：负责把主管上传的考勤结果规范化、校验和留存。
//
// 2026-09 起，四个学部统一适用《深圳市富源学校考勤休假管理制度》中的
// 违纪认定和绩效扣减口径。各学部、部门的作息时间仍可不同，因此导入表同时
// 留存原始四次打卡和按本部门作息换算后的迟到／早退／脱岗分钟数；统一引擎
// 只依据分钟数和旷工、旷课事实作出违纪等级判断，不再存在“小学/初中/高中
// 各扣各的”三套薪酬规则。
const MAX_ATTENDANCE_ROWS = 60000;
const MAX_XLSX_UNCOMPRESSED_BYTES = 32 * 1024 * 1024;
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);

const REQUIRED_HEADERS = {
  employeeNo: ["教师工号", "工号"],
  teacherName: ["教师姓名", "姓名"],
  date: ["考勤日期", "日期"],
  shouldAttend: ["应出勤", "是否应出勤"],
  morningIn: ["上午上班打卡"],
  morningOut: ["上午下班打卡"],
  afternoonIn: ["下午上班打卡"],
  afternoonOut: ["下午下班打卡"],
  note: ["备注"],
};

const UNIFIED_ATTENDANCE_HEADERS = {
  lateMinutes: ["迟到分钟"],
  earlyLeaveMinutes: ["早退分钟"],
  awayMinutes: ["脱岗分钟", "私自脱岗分钟"],
  missedClassCount: ["旷课节数", "空堂节数"],
  absenceDays: ["旷工天数"],
  exemptionStatus: ["免责认定", "考勤免责"],
};

const PUNCH_FIELDS = ["morningIn", "morningOut", "afternoonIn", "afternoonOut"];

function attendanceError(message, statusCode = 400, details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .trim();
}

function normalizeHeader(value) {
  return normalizeText(value).replace(/[\s*＊]/g, "");
}

function validMonth(value) {
  const month = normalizeText(value);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw attendanceError("请选择正确的考勤月份");
  }
  return month;
}

function stageName(db, stageId) {
  return (db.stages || []).find((stage) => stage.id === stageId)?.name || stageId;
}

function stageExists(db, stageId) {
  return Boolean((db.stages || []).some((stage) => stage.id === stageId));
}

function canReadAllStages(account) {
  return accountHasRole(account, "system_admin") || accountHasRole(account, "principal");
}

export function canManageAttendance(account) {
  // 学部主任默认可上传本学部考勤；学部可另行指定考勤负责人，且该负责人
  // 仍受 scopeStageIds 严格约束，不能代传其他学部的数据。
  return (
    accountHasRole(account, "division_head") ||
    accountHasRole(account, "attendance_manager") ||
    accountHasRole(account, "system_admin")
  );
}

export function readableAttendanceStageIds(db, account) {
  if (canReadAllStages(account)) return (db.stages || []).map((stage) => stage.id);
  const scope = accountStageScopeIds(account);
  return scope.filter((stageId) => stageExists(db, stageId));
}

export function assertAttendanceStageAccess(db, account, stageId, action = "查看") {
  const targetStageId = normalizeText(stageId);
  if (!stageExists(db, targetStageId)) throw attendanceError("学部不存在", 404);
  if (canReadAllStages(account)) return targetStageId;
  const scope = readableAttendanceStageIds(db, account);
  if (!scope.includes(targetStageId)) {
    throw attendanceError(`只能${action}本学部考勤数据`, 403);
  }
  return targetStageId;
}

export function ensureAttendanceCollections(db) {
  if (!Array.isArray(db.attendanceUploads)) db.attendanceUploads = [];
  if (!Array.isArray(db.attendancePunchRecords)) db.attendancePunchRecords = [];
  return db;
}

function decodeXml(value = "") {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function attrOf(source = "", name = "") {
  return new RegExp(`\\b${name}="([^"]*)"`, "i").exec(source)?.[1] || "";
}

function textNodes(source = "") {
  return [...String(source).matchAll(/<(?:\w+:)?t(?:\s[^>]*)?>([\s\S]*?)<\/(?:\w+:)?t>/gi)]
    .map((match) => decodeXml(match[1]))
    .join("");
}

function columnIndex(cellRef = "") {
  const letters = /^([A-Z]+)/i.exec(cellRef)?.[1]?.toUpperCase() || "";
  let index = 0;
  for (const letter of letters) index = index * 26 + (letter.charCodeAt(0) - 64);
  return index > 0 ? index - 1 : -1;
}

function zipEntries(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 22 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw attendanceError("上传文件不是有效的 .xlsx 工作簿");
  }
  const eocd = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  const start = Math.max(0, buffer.length - 65557);
  const eocdOffset = buffer.lastIndexOf(eocd, buffer.length - 22);
  if (eocdOffset < start) throw attendanceError("考勤表文件不完整或格式不受支持");
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const directorySize = buffer.readUInt32LE(eocdOffset + 12);
  const directoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  if (entryCount > 1000 || directoryOffset + directorySize > buffer.length) {
    throw attendanceError("考勤表文件结构异常");
  }

  const entries = new Map();
  let cursor = directoryOffset;
  let totalUncompressed = 0;
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > buffer.length || buffer.readUInt32LE(cursor) !== 0x02014b50) {
      throw attendanceError("考勤表文件目录损坏");
    }
    const flags = buffer.readUInt16LE(cursor + 8);
    const compression = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const filenameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const filenameStart = cursor + 46;
    const filenameEnd = filenameStart + filenameLength;
    if (filenameEnd > buffer.length || flags & 0x1 || ![0, 8].includes(compression)) {
      throw attendanceError("考勤表包含不支持的加密或压缩格式");
    }
    const filename = buffer.slice(filenameStart, filenameEnd).toString("utf8");
    totalUncompressed += uncompressedSize;
    if (totalUncompressed > MAX_XLSX_UNCOMPRESSED_BYTES) {
      throw attendanceError("考勤表解压后的内容过大，请拆分后上传");
    }
    if (localOffset + 30 > buffer.length || buffer.readUInt32LE(localOffset) !== 0x04034b50) {
      throw attendanceError("考勤表文件内容损坏");
    }
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const contentStart = localOffset + 30 + localNameLength + localExtraLength;
    const contentEnd = contentStart + compressedSize;
    if (contentEnd > buffer.length) throw attendanceError("考勤表文件内容不完整");
    entries.set(filename, { compression, compressedSize, uncompressedSize, data: buffer.slice(contentStart, contentEnd) });
    cursor = filenameEnd + extraLength + commentLength;
  }
  return entries;
}

function readZipText(entries, filename, required = true) {
  const entry = entries.get(filename);
  if (!entry) {
    if (!required) return "";
    throw attendanceError(`考勤表缺少必要内容：${filename}`);
  }
  const data = entry.compression === 0 ? entry.data : inflateRawSync(entry.data);
  if (data.length !== entry.uncompressedSize || data.length > MAX_XLSX_UNCOMPRESSED_BYTES) {
    throw attendanceError("考勤表解压校验失败");
  }
  return data.toString("utf8");
}

function sharedStringsFrom(entries) {
  const xml = readZipText(entries, "xl/sharedStrings.xml", false);
  if (!xml) return [];
  return [...xml.matchAll(/<(?:\w+:)?si(?:\s[^>]*)?>([\s\S]*?)<\/(?:\w+:)?si>/gi)].map((match) => textNodes(match[1]));
}

function firstWorksheetPath(entries) {
  const workbook = readZipText(entries, "xl/workbook.xml");
  const firstSheet = /<(?:\w+:)?sheet\b([^>]*)\/?>(?:<\/(?:\w+:)?sheet>)?/i.exec(workbook)?.[1] || "";
  const relationId = attrOf(firstSheet, "r:id");
  const rels = readZipText(entries, "xl/_rels/workbook.xml.rels");
  const relation = [...rels.matchAll(/<Relationship\b([^>]*)\/?>(?:<\/Relationship>)?/gi)].find(
    (match) => attrOf(match[1], "Id") === relationId,
  )?.[1];
  const target = attrOf(relation || "", "Target");
  if (!target) throw attendanceError("无法读取考勤表的第一个工作表");
  const normalized = target.replace(/^\//, "").replace(/^xl\//, "");
  return `xl/${normalized.replace(/^\.\//, "")}`;
}

function xlsxRows(buffer) {
  const entries = zipEntries(buffer);
  const sharedStrings = sharedStringsFrom(entries);
  const worksheet = readZipText(entries, firstWorksheetPath(entries));
  const rows = [];
  for (const rowMatch of worksheet.matchAll(/<(?:\w+:)?row\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?row>/gi)) {
    const row = [];
    const cells = rowMatch[2];
    const cellPattern = /<(?:\w+:)?c\b([^>]*)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c>)/gi;
    for (const cellMatch of cells.matchAll(cellPattern)) {
      const attrs = cellMatch[1] || "";
      const content = cellMatch[2] || "";
      const col = columnIndex(attrOf(attrs, "r"));
      if (col < 0) continue;
      const type = attrOf(attrs, "t");
      const raw = /<(?:\w+:)?v(?:\s[^>]*)?>([\s\S]*?)<\/(?:\w+:)?v>/i.exec(content)?.[1] || "";
      let value = "";
      if (type === "s") value = sharedStrings[Number(raw)] ?? "";
      else if (type === "inlineStr") value = textNodes(content);
      else if (type === "b") value = raw === "1";
      else if (type === "str") value = decodeXml(raw);
      else if (raw !== "") value = Number.isFinite(Number(raw)) ? Number(raw) : decodeXml(raw);
      row[col] = value;
    }
    rows.push(row);
  }
  return rows;
}

function excelSerialDate(value) {
  const milliseconds = Math.round(Number(value) * 86400000);
  const date = new Date(EXCEL_EPOCH_UTC + milliseconds);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function canonicalDate(value) {
  if (typeof value === "number" && Number.isFinite(value)) return excelSerialDate(value);
  const source = normalizeText(value);
  const match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(source);
  if (!match) return "";
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function canonicalTime(value) {
  if (value === "" || value === null || value === undefined) return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    const fraction = ((value % 1) + 1) % 1;
    const minutes = Math.round(fraction * 24 * 60);
    if (minutes >= 24 * 60) return "00:00";
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }
  const source = normalizeText(value);
  if (!source) return "";
  const match = /(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(source);
  if (!match) return "";
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return "";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function canonicalShouldAttend(value) {
  const source = normalizeText(value).toLowerCase();
  if (["是", "y", "yes", "1", "应出勤"].includes(source)) return true;
  if (["否", "n", "no", "0", "不出勤", "休息"].includes(source)) return false;
  return null;
}

function canonicalNonNegativeNumber(value, { halfDay = false } = {}) {
  if (value === "" || value === null || value === undefined) return 0;
  const source = normalizeText(value);
  if (!/^\d+(?:\.5)?$/.test(source)) return null;
  const number = Number(source);
  if (!halfDay && !Number.isInteger(number)) return null;
  return number;
}

function canonicalExemptionStatus(value) {
  const source = normalizeText(value).toLowerCase();
  if (["", "无", "正常", "否", "n", "no", "0"].includes(source)) return "normal";
  if (["免责", "免于认定", "已批准请假", "已批准外出", "学校公务", "专项培训", "临时工作调度", "是", "y", "yes", "1"].includes(source)) return "exempt";
  return "";
}

function headerMap(rows) {
  const headerIndex = rows.findIndex((row) => {
    const values = row.map(normalizeHeader);
    return REQUIRED_HEADERS.employeeNo.some((header) => values.includes(normalizeHeader(header))) &&
      REQUIRED_HEADERS.date.some((header) => values.includes(normalizeHeader(header)));
  });
  if (headerIndex < 0) {
    throw attendanceError("未找到表头。请使用系统下载的“教师月度考勤上传模板”填写后上传");
  }
  const headers = rows[headerIndex].map(normalizeHeader);
  const map = {};
  const requiredKeys = Object.keys(REQUIRED_HEADERS);
  for (const key of requiredKeys) {
    const candidates = REQUIRED_HEADERS[key];
    const column = headers.findIndex((header) => candidates.map(normalizeHeader).includes(header));
    if (column < 0) throw attendanceError(`缺少“${candidates[0]}”列，请下载最新模板后填写`);
    map[key] = column;
  }
  const unifiedMap = {};
  for (const [key, candidates] of Object.entries(UNIFIED_ATTENDANCE_HEADERS)) {
    const column = headers.findIndex((header) => candidates.map(normalizeHeader).includes(header));
    if (column < 0) throw attendanceError(`缺少“${candidates[0]}”列，请下载最新的“全校统一月度考勤模板”后填写`);
    unifiedMap[key] = column;
  }
  return { headerIndex, map, unifiedMap };
}

function hasRowContent(row = []) {
  return row.some((value) => normalizeText(value) !== "");
}

export function parseAttendanceWorkbook(buffer, { stageId = "" } = {}) {
  const rows = xlsxRows(buffer);
  const { headerIndex, map, unifiedMap } = headerMap(rows);
  const records = [];
  const problems = [];
  for (let index = headerIndex + 1; index < rows.length; index += 1) {
    const row = rows[index] || [];
    if (!hasRowContent(row)) continue;
    const excelRow = index + 1;
    const employeeNo = normalizeText(row[map.employeeNo]);
    const teacherName = normalizeText(row[map.teacherName]);
    const date = canonicalDate(row[map.date]);
    const shouldAttend = canonicalShouldAttend(row[map.shouldAttend]);
    const rawTimes = {
      morningIn: row[map.morningIn],
      morningOut: row[map.morningOut],
      afternoonIn: row[map.afternoonIn],
      afternoonOut: row[map.afternoonOut],
    };
    const times = Object.fromEntries(Object.entries(rawTimes).map(([key, value]) => [key, canonicalTime(value)]));
    const unifiedAttendance = {
      lateMinutes: canonicalNonNegativeNumber(row[unifiedMap.lateMinutes]),
      earlyLeaveMinutes: canonicalNonNegativeNumber(row[unifiedMap.earlyLeaveMinutes]),
      awayMinutes: canonicalNonNegativeNumber(row[unifiedMap.awayMinutes]),
      missedClassCount: canonicalNonNegativeNumber(row[unifiedMap.missedClassCount]),
      absenceDays: canonicalNonNegativeNumber(row[unifiedMap.absenceDays], { halfDay: true }),
      exemptionStatus: canonicalExemptionStatus(row[unifiedMap.exemptionStatus]),
    };
    if (!employeeNo || !teacherName || !date || shouldAttend === null) {
      problems.push(`第 ${excelRow} 行：教师工号、教师姓名、考勤日期和应出勤均为必填；应出勤请填“是”或“否”`);
      continue;
    }
    for (const [field, raw] of Object.entries(rawTimes)) {
      if (normalizeText(raw) && !times[field]) problems.push(`第 ${excelRow} 行：${REQUIRED_HEADERS[field][0]}格式应为 HH:MM`);
    }
    ["lateMinutes", "earlyLeaveMinutes", "awayMinutes", "missedClassCount", "absenceDays"].forEach((field) => {
      if (unifiedAttendance[field] === null) {
        problems.push(`第 ${excelRow} 行：${UNIFIED_ATTENDANCE_HEADERS[field][0]}应为不小于 0 的${field === "absenceDays" ? "整数或 0.5" : "整数"}`);
      }
    });
    if (!unifiedAttendance.exemptionStatus) {
      problems.push(`第 ${excelRow} 行：${UNIFIED_ATTENDANCE_HEADERS.exemptionStatus[0]}请填“正常”或制度认可的免责事由`);
    }
    records.push({
      employeeNo,
      teacherName,
      date,
      shouldAttend,
      ...times,
      unifiedAttendance,
      note: normalizeText(row[map.note]),
      sourceRow: excelRow,
    });
  }
  if (problems.length) throw attendanceError("考勤表存在格式问题", 400, problems.slice(0, 50));
  if (!records.length) throw attendanceError("考勤表没有可导入的记录");
  if (records.length > MAX_ATTENDANCE_ROWS) throw attendanceError(`单次最多导入 ${MAX_ATTENDANCE_ROWS.toLocaleString()} 条考勤记录`);
  return records;
}

function validateAttendanceRecords(db, { month, stageId, records }) {
  const errors = [];
  const teachers = (db.teachers || []).filter((teacher) => teacher.stageId === stageId);
  const byEmployeeNo = new Map();
  teachers.forEach((teacher) => {
    const key = normalizeText(teacher.employeeNo);
    if (key) byEmployeeNo.set(key, teacher);
  });
  const seen = new Set();
  const normalized = [];
  records.forEach((record) => {
    const teacher = byEmployeeNo.get(record.employeeNo);
    if (!teacher) {
      errors.push(`第 ${record.sourceRow} 行：工号“${record.employeeNo}”不属于${stageName(db, stageId)}教师`);
      return;
    }
    if (normalizeText(teacher.name) !== record.teacherName) {
      errors.push(`第 ${record.sourceRow} 行：工号“${record.employeeNo}”对应教师应为“${teacher.name}”`);
      return;
    }
    if (!record.date.startsWith(`${month}-`)) {
      errors.push(`第 ${record.sourceRow} 行：考勤日期“${record.date}”不属于所选月份 ${month}`);
      return;
    }
    const key = `${teacher.id}:${record.date}`;
    if (seen.has(key)) {
      errors.push(`第 ${record.sourceRow} 行：${teacher.name} 在 ${record.date} 有重复记录`);
      return;
    }
    seen.add(key);
    normalized.push({
      ...record,
      // 兼容规则上线前的旧导入记录：旧表没有“应出勤”时不能据此推断旷工，
      // 但手工调用／测试传入的记录仍默认视为应出勤日。
      shouldAttend: record.shouldAttend !== false,
      teacherId: teacher.id,
      teacherName: teacher.name,
      stageId,
      month,
    });
  });
  if (errors.length) throw attendanceError("考勤表校验未通过", 400, errors.slice(0, 50));
  return normalized;
}

function publicUpload(db, upload = {}) {
  return {
    id: upload.id,
    stageId: upload.stageId,
    stageName: upload.stageName,
    month: upload.month,
    filename: upload.filename,
    rowCount: upload.rowCount,
    teacherCount: upload.teacherCount,
    noPunchDays: upload.noPunchDays,
    uploadedAt: upload.uploadedAt,
    uploadedByName: upload.uploadedByName,
    status: upload.status || "active",
    replacedAt: upload.replacedAt || "",
    settlementSummary: attendanceSettlementForUpload(db, upload),
  };
}

export function queryAttendanceUploads(db, account, query = {}) {
  ensureAttendanceCollections(db);
  const month = query.month ? validMonth(query.month) : "";
  const allowedStageIds = readableAttendanceStageIds(db, account);
  const stageId = normalizeText(query.stageId);
  if (stageId) assertAttendanceStageAccess(db, account, stageId, "查看");
  return {
    month,
    canUpload: canManageAttendance(account),
    stageOptions: (db.stages || [])
      .filter((stage) => allowedStageIds.includes(stage.id))
      .map((stage) => ({ id: stage.id, name: stage.name })),
    uploads: (db.attendanceUploads || [])
      .filter((upload) => (!month || upload.month === month) && (!stageId || upload.stageId === stageId) && allowedStageIds.includes(upload.stageId))
      .sort((left, right) => String(right.uploadedAt).localeCompare(String(left.uploadedAt)))
      .map((upload) => publicUpload(db, upload)),
  };
}

export function replaceMonthlyAttendance(db, account, input = {}) {
  ensureAttendanceCollections(db);
  if (!canManageAttendance(account)) throw attendanceError("只有学部主任可以上传考勤表", 403);
  const month = validMonth(input.month);
  const stageId = assertAttendanceStageAccess(db, account, input.stageId, "上传");
  const records = validateAttendanceRecords(db, {
    month,
    stageId,
    records: Array.isArray(input.records) ? input.records : [],
  });
  const now = new Date().toISOString();
  const previousUploads = db.attendanceUploads.filter(
    (upload) => upload.stageId === stageId && upload.month === month && upload.status === "active",
  );
  previousUploads.forEach((upload) => {
    upload.status = "replaced";
    upload.replacedAt = now;
    upload.replacedByAccountId = account.id;
  });
  const teacherCount = new Set(records.map((record) => record.teacherId)).size;
  const noPunchDays = records.filter(
    (record) => record.shouldAttend && !record.morningIn && !record.morningOut && !record.afternoonIn && !record.afternoonOut,
  ).length;
  const upload = {
    id: `ATT-UPLOAD-${randomUUID()}`,
    stageId,
    stageName: stageName(db, stageId),
    month,
    filename: normalizeText(input.filename) || "教师月度考勤表.xlsx",
    sha256: normalizeText(input.sha256),
    rowCount: records.length,
    teacherCount,
    noPunchDays,
    uploadedAt: now,
    uploadedByAccountId: account.id,
    uploadedByName: account.name || account.username || "",
    status: "active",
  };
  db.attendanceUploads.push(upload);
  db.attendancePunchRecords.push(
    ...records.map((record) => ({
      id: `ATT-RECORD-${randomUUID()}`,
      uploadId: upload.id,
      ...record,
      createdAt: now,
    })),
  );
  return { upload: publicUpload(db, upload), replacedUploadCount: previousUploads.length };
}

export function importAttendanceWorkbook(db, account, input = {}) {
  const data = input.data;
  if (!Buffer.isBuffer(data) || !data.length) throw attendanceError("请选择要上传的考勤表");
  const records = parseAttendanceWorkbook(data, { stageId: input.stageId });
  return replaceMonthlyAttendance(db, account, {
    ...input,
    records,
    sha256: createHash("sha256").update(data).digest("hex"),
  });
}

export function activeAttendanceRecords(db, { month, stageId, teacherId = "" } = {}) {
  ensureAttendanceCollections(db);
  const activeUploadIds = new Set(
    db.attendanceUploads
      .filter((upload) => upload.status === "active" && (!month || upload.month === month) && (!stageId || upload.stageId === stageId))
      .map((upload) => upload.id),
  );
  return db.attendancePunchRecords.filter(
    (record) => activeUploadIds.has(record.uploadId) && (!teacherId || record.teacherId === teacherId),
  );
}

/*
 * 历史三学部独立规则保留在源码中仅供已归档记录的字段兼容说明。
 * 自 2026-09 起不再执行；统一引擎位于本文件末尾。
 *
 * 旧逻辑曾按学部设置固定金额／固定比例扣款，与全校制度“仅扣考核工资、
 * 月度上限 20%、最低工资保护”的口径不一致，不能再作为薪资依据。
 */
/* legacy-attendance-policies
// 小学部按导入表中的迟到、明确未补卡和全天旷工计费；不推断应打卡日，也不处理早退或特殊值班日。
const PRIMARY_ATTENDANCE_POLICY = {
  stageId: "primary",
  name: "小学部教师考勤制度（2026-2027学年第一学期）",
  componentName: "小学部考勤扣款",
  attendanceLabel: "迟到",
  thresholds: {
    morningIn: { limit: "07:45", label: "上午上班", type: "迟到", comparison: "after" },
    afternoonIn: { limit: "14:15", label: "下午上班", type: "迟到", comparison: "after" },
  },
  lateRate: 30,
  missingPunchRate: 50,
  absenceRate: 200,
};

const MIDDLE_ATTENDANCE_POLICY = {
  stageId: "middle",
  name: "初中部考勤打卡通知（2026.4.19）",
  componentName: "初中部考勤扣款",
  attendanceLabel: "迟到／早退",
  thresholds: {
    morningIn: { limit: "07:50", label: "上午上班", type: "迟到", comparison: "after" },
    morningOut: { limit: "11:25", label: "上午下班", type: "早退", comparison: "before" },
    afternoonIn: { limit: "14:05", label: "下午上班", type: "迟到", comparison: "after" },
    afternoonOut: { limit: "17:25", label: "下午下班", type: "早退", comparison: "before" },
  },
  absenceRate: 300,
};

const HIGH_ATTENDANCE_POLICY = {
  stageId: "high",
  name: "高中部违纪处罚规定 考勤违纪处理",
  componentName: "高中部考勤违纪扣款",
  attendanceLabel: "轻微迟到／未签退",
  minorOccurrenceRate: 0.02,
  seriousOccurrenceRate: 0.03,
  oneMissedClassRate: 0.05,
  multipleMissedClassRate: 0.15,
  absenceWorkDailyFraction: 1 / 22,
};

function leaveDatesForTeacher(db, teacherId, month) {
  const accountIds = new Set(
    (db.accounts || []).filter((account) => account.teacherId === teacherId).map((account) => account.id),
  );
  const dates = new Set();
  const [year, monthNumber] = String(month || "").split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(monthNumber)) return dates;
  const monthStart = `${month}-01`;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const monthEnd = `${month}-${String(daysInMonth).padStart(2, "0")}`;
  (db.oaRequests || []).forEach((request) => {
    // 请假和已备案外出都是正式手续，全天无打卡时不能直接按无故旷工处理。
    if (request.status !== "approved" || !["leave", "outbound"].includes(request.templateKey) || !accountIds.has(request.applicantAccountId)) return;
    const start = normalizeText(request.formData?.startDate);
    const end = normalizeText(request.formData?.endDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end < start) return;
    const first = start > monthStart ? start : monthStart;
    const last = end < monthEnd ? end : monthEnd;
    if (first > last) return;
    const cursor = new Date(`${first}T00:00:00Z`);
    const until = new Date(`${last}T00:00:00Z`);
    while (cursor <= until) {
      dates.add(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  });
  return dates;
}

function lateOrEarlyDeduction(index) {
  if (index === 0) return 20;
  if (index === 1) return 30;
  return 50;
}

function noPunch(record) {
  return !record.morningIn && !record.morningOut && !record.afternoonIn && !record.afternoonOut;
}

function noAttendanceSettlement() {
  return {
    applies: false,
    policyName: "",
    componentName: "",
    attendanceLabel: "",
    lateEarlyCount: 0,
    lateEarlyDeduction: 0,
    missingPunchCount: 0,
    missingPunchDeduction: 0,
    seriousOccurrenceCount: 0,
    missedClassCount: 0,
    absenceDays: 0,
    absenceDeduction: 0,
    totalDeduction: 0,
    events: [],
    absenceDates: [],
  };
}

function attendancePolicyForStage(stageId) {
  if (stageId === PRIMARY_ATTENDANCE_POLICY.stageId) return PRIMARY_ATTENDANCE_POLICY;
  if (stageId === MIDDLE_ATTENDANCE_POLICY.stageId) return MIDDLE_ATTENDANCE_POLICY;
  if (stageId === HIGH_ATTENDANCE_POLICY.stageId) return HIGH_ATTENDANCE_POLICY;
  return null;
}

function primaryAttendanceSettlement(db, teacherId, month) {
  const records = activeAttendanceRecords(db, { month, stageId: PRIMARY_ATTENDANCE_POLICY.stageId, teacherId })
    .filter((record) => record.shouldAttend !== false)
    .sort((left, right) => String(left.date).localeCompare(String(right.date)));
  const lateEvents = [];
  records.forEach((record) => {
    Object.entries(PRIMARY_ATTENDANCE_POLICY.thresholds).forEach(([field, rule]) => {
      const time = record[field];
      if (time && time > rule.limit) {
        lateEvents.push({ date: record.date, field, label: rule.label, type: rule.type, time, limit: rule.limit, deduction: PRIMARY_ATTENDANCE_POLICY.lateRate });
      }
    });
  });
  lateEvents.sort((left, right) => `${left.date}:${left.field}`.localeCompare(`${right.date}:${right.field}`));
  const leaveDates = leaveDatesForTeacher(db, teacherId, month);
  const absenceDates = records
    .filter((record) => noPunch(record) && PUNCH_FIELDS.every((field) => record.makeupStatuses?.[field] === "unmade") && !leaveDates.has(record.date))
    .map((record) => record.date);
  const absenceDateSet = new Set(absenceDates);
  const missingPunchEvents = [];
  records.forEach((record) => {
    if (absenceDateSet.has(record.date)) return;
    PUNCH_FIELDS.forEach((field) => {
      if (!record[field] && record.makeupStatuses?.[field] === "unmade") {
        missingPunchEvents.push({
          date: record.date,
          field,
          label: REQUIRED_HEADERS[field][0],
          type: "未补卡",
          deduction: PRIMARY_ATTENDANCE_POLICY.missingPunchRate,
        });
      }
    });
  });
  const lateEarlyDeduction = lateEvents.reduce((sum, event) => sum + event.deduction, 0);
  const missingPunchDeduction = missingPunchEvents.reduce((sum, event) => sum + event.deduction, 0);
  const absenceDeduction = absenceDates.length * PRIMARY_ATTENDANCE_POLICY.absenceRate;
  return {
    applies: true,
    policyName: PRIMARY_ATTENDANCE_POLICY.name,
    componentName: PRIMARY_ATTENDANCE_POLICY.componentName,
    attendanceLabel: PRIMARY_ATTENDANCE_POLICY.attendanceLabel,
    lateEarlyCount: lateEvents.length,
    lateEarlyDeduction,
    missingPunchCount: missingPunchEvents.length,
    missingPunchDeduction,
    seriousOccurrenceCount: 0,
    missedClassCount: 0,
    absenceDays: absenceDates.length,
    absenceRate: PRIMARY_ATTENDANCE_POLICY.absenceRate,
    absenceDeduction,
    totalDeduction: lateEarlyDeduction + missingPunchDeduction + absenceDeduction,
    events: [...lateEvents, ...missingPunchEvents],
    absenceDates,
  };
}

function middleAttendanceSettlement(db, teacherId, month) {
  const records = activeAttendanceRecords(db, { month, stageId: MIDDLE_ATTENDANCE_POLICY.stageId, teacherId })
    .filter((record) => record.shouldAttend !== false)
    .sort((left, right) => String(left.date).localeCompare(String(right.date)));
  const events = [];
  records.forEach((record) => {
    Object.entries(MIDDLE_ATTENDANCE_POLICY.thresholds).forEach(([field, rule]) => {
      const time = record[field];
      const breach = time && (rule.comparison === "after" ? time > rule.limit : time < rule.limit);
      if (breach) events.push({ date: record.date, field, label: rule.label, type: rule.type, time, limit: rule.limit });
    });
  });
  events.sort((left, right) => `${left.date}:${left.field}`.localeCompare(`${right.date}:${right.field}`));
  const breachEvents = events.map((event, index) => ({
    ...event,
    sequence: index + 1,
    deduction: lateOrEarlyDeduction(index),
  }));
  const leaveDates = leaveDatesForTeacher(db, teacherId, month);
  const absenceDates = [...new Set(
    // 旧模板没有“应出勤”列，不能拿历史空行倒推旷工；新模板填“是”后才可自动处理。
    records.filter((record) => record.shouldAttend === true && noPunch(record) && !leaveDates.has(record.date)).map((record) => record.date),
  )].sort();
  const lateEarlyDeduction = breachEvents.reduce((sum, event) => sum + event.deduction, 0);
  const absenceDeduction = absenceDates.length * MIDDLE_ATTENDANCE_POLICY.absenceRate;
  return {
    applies: true,
    policyName: MIDDLE_ATTENDANCE_POLICY.name,
    componentName: MIDDLE_ATTENDANCE_POLICY.componentName,
    attendanceLabel: MIDDLE_ATTENDANCE_POLICY.attendanceLabel,
    lateEarlyCount: breachEvents.length,
    lateEarlyDeduction,
    missingPunchCount: 0,
    missingPunchDeduction: 0,
    seriousOccurrenceCount: 0,
    missedClassCount: 0,
    absenceDays: absenceDates.length,
    absenceRate: MIDDLE_ATTENDANCE_POLICY.absenceRate,
    absenceDeduction,
    totalDeduction: lateEarlyDeduction + absenceDeduction,
    events: breachEvents,
    absenceDates,
  };
}

function highAttendanceSettlement(db, teacherId, month) {
  const leaveDates = leaveDatesForTeacher(db, teacherId, month);
  const records = activeAttendanceRecords(db, { month, stageId: HIGH_ATTENDANCE_POLICY.stageId, teacherId })
    .filter((record) => record.shouldAttend !== false)
    .sort((left, right) => String(left.date).localeCompare(String(right.date)));
  const minorEvents = [];
  const seriousEvents = [];
  let missedClassCount = 0;
  let absenceWorkDays = 0;
  records.forEach((record) => {
    const item = record.highAttendance || {};
    const lateMinutes = Math.max(0, Number(item.lateMinutes || 0));
    const earlyLeaveMinutes = Math.max(0, Number(item.earlyLeaveMinutes || 0));
    if (lateMinutes > 0 && lateMinutes <= 10) {
      minorEvents.push({ date: record.date, type: "迟到 10 分钟内", minutes: lateMinutes });
    } else if (lateMinutes > 10) {
      seriousEvents.push({ date: record.date, type: "超时迟到", minutes: lateMinutes });
    }
    if (item.checkoutStatus === "unsigned") minorEvents.push({ date: record.date, type: "未签退", minutes: 0 });
    if (earlyLeaveMinutes > 0) seriousEvents.push({ date: record.date, type: "早退", minutes: earlyLeaveMinutes });
    missedClassCount += Math.max(0, Number(item.missedClassCount || 0));
    if (!leaveDates.has(record.date)) {
      absenceWorkDays += Math.max(0, Number(item.absenceWorkDays || 0));
    }
  });
  const minorOccurrenceCount = minorEvents.length;
  // 按制度“累计达到 3 次及以上”的字面口径，第 3 次起每次计 2%。
  const minorPerformanceRate = Math.max(0, minorOccurrenceCount - 2) * HIGH_ATTENDANCE_POLICY.minorOccurrenceRate;
  const seriousPerformanceRate = seriousEvents.length * HIGH_ATTENDANCE_POLICY.seriousOccurrenceRate;
  const missedClassPerformanceRate = missedClassCount === 1
    ? HIGH_ATTENDANCE_POLICY.oneMissedClassRate
    : missedClassCount >= 2
      ? HIGH_ATTENDANCE_POLICY.multipleMissedClassRate
      : 0;
  const performanceDeductionRate = Number(Math.min(1, minorPerformanceRate + seriousPerformanceRate + missedClassPerformanceRate).toFixed(6));
  return {
    applies: true,
    requiresPayrollContext: true,
    policyName: HIGH_ATTENDANCE_POLICY.name,
    componentName: HIGH_ATTENDANCE_POLICY.componentName,
    attendanceLabel: HIGH_ATTENDANCE_POLICY.attendanceLabel,
    lateEarlyCount: minorOccurrenceCount,
    lateEarlyDeduction: 0,
    missingPunchCount: 0,
    missingPunchDeduction: 0,
    seriousOccurrenceCount: seriousEvents.length,
    missedClassCount,
    absenceDays: absenceWorkDays,
    absenceDailyFraction: HIGH_ATTENDANCE_POLICY.absenceWorkDailyFraction,
    absenceDeduction: 0,
    performanceDeductionRate,
    totalDeduction: 0,
    events: [...minorEvents, ...seriousEvents],
    absenceDates: [],
  };
}

export function attendanceSettlementForTeacher(db, teacherId, month) {
  const teacher = (db.teachers || []).find((item) => item.id === teacherId);
  if (!teacher) return noAttendanceSettlement();
  if (teacher.stageId === PRIMARY_ATTENDANCE_POLICY.stageId) return primaryAttendanceSettlement(db, teacherId, month);
  if (teacher.stageId === MIDDLE_ATTENDANCE_POLICY.stageId) return middleAttendanceSettlement(db, teacherId, month);
  if (teacher.stageId === HIGH_ATTENDANCE_POLICY.stageId) return highAttendanceSettlement(db, teacherId, month);
  return noAttendanceSettlement();
}

export function attendanceSettlementForUpload(db, upload = {}) {
  const policy = attendancePolicyForStage(upload.stageId);
  if (!policy || upload.status !== "active") {
    return { applies: false, lateEarlyCount: 0, absenceDays: 0, totalDeduction: 0 };
  }
  const teacherIds = new Set(
    activeAttendanceRecords(db, { month: upload.month, stageId: upload.stageId }).map((record) => record.teacherId),
  );
  const settlements = [...teacherIds].map((teacherId) => attendanceSettlementForTeacher(db, teacherId, upload.month));
  return {
    applies: true,
    requiresPayrollContext: settlements.some((settlement) => settlement.requiresPayrollContext),
    policyName: policy.name,
    componentName: policy.componentName,
    attendanceLabel: policy.attendanceLabel,
    lateEarlyCount: settlements.reduce((sum, settlement) => sum + settlement.lateEarlyCount, 0),
    missingPunchCount: settlements.reduce((sum, settlement) => sum + settlement.missingPunchCount, 0),
    missingPunchDeduction: settlements.reduce((sum, settlement) => sum + settlement.missingPunchDeduction, 0),
    absenceDays: settlements.reduce((sum, settlement) => sum + settlement.absenceDays, 0),
    seriousOccurrenceCount: settlements.reduce((sum, settlement) => sum + Number(settlement.seriousOccurrenceCount || 0), 0),
    missedClassCount: settlements.reduce((sum, settlement) => sum + Number(settlement.missedClassCount || 0), 0),
    totalDeduction: settlements.reduce((sum, settlement) => sum + settlement.totalDeduction, 0),
  };
}
*/

// ---------------------------------------------------------------------------
// 全校统一考勤制度（2026-09 起直接切换）
// ---------------------------------------------------------------------------

export const UNIFIED_ATTENDANCE_POLICY = {
  version: "SZFY-ATTENDANCE-2026-09",
  name: "深圳市富源学校考勤休假管理制度",
  componentName: "全校统一考勤绩效扣减",
  effectiveFrom: "2026-09-01",
  // 迟到、早退、私自脱岗：≤10 分钟为轻微，>10 且 ≤30 分钟为一般，>30 分钟为较重。
  minuteBoundaries: { minorMax: 10, generalMax: 30 },
  // 同一类型在当月内按最高匹配档位计；多类违纪相加后，月度绩效扣款仍封顶 20%。
  deductionRates: {
    minor: { 1: 0.03, 2: 0.08 },
    general: { 1: 0.1, 2: 0.18, 3: 0.2 },
    serious: 0.2,
    severe: 0.2,
    monthlyCap: 0.2,
  },
};

function noAttendanceSettlement() {
  return {
    applies: false,
    requiresPayrollContext: true,
    policyVersion: UNIFIED_ATTENDANCE_POLICY.version,
    policyName: UNIFIED_ATTENDANCE_POLICY.name,
    componentName: UNIFIED_ATTENDANCE_POLICY.componentName,
    attendanceLabel: "考勤违纪",
    minorCount: 0,
    generalCount: 0,
    seriousCount: 0,
    severeCount: 0,
    lateEarlyCount: 0,
    seriousOccurrenceCount: 0,
    missedClassCount: 0,
    absenceDays: 0,
    performanceDeductionRate: 0,
    requestedPerformanceDeductionRate: 0,
    totalDeduction: 0,
    events: [],
    absenceDates: [],
    reviewFlags: [],
  };
}

function leaveDatesForTeacher(db, teacherId, month) {
  const accountIds = new Set(
    (db.accounts || []).filter((account) => account.teacherId === teacherId).map((account) => account.id),
  );
  const dates = new Set();
  const [year, monthNumber] = String(month || "").split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(monthNumber)) return dates;
  const monthStart = `${month}-01`;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const monthEnd = `${month}-${String(daysInMonth).padStart(2, "0")}`;
  (db.oaRequests || []).forEach((request) => {
    // 已通过的请假与外出属于正式手续，不能再被推断为旷工。
    if (request.status !== "approved" || !["leave", "outbound"].includes(request.templateKey) || !accountIds.has(request.applicantAccountId)) return;
    const start = normalizeText(request.formData?.startDate);
    const end = normalizeText(request.formData?.endDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end < start) return;
    const first = start > monthStart ? start : monthStart;
    const last = end < monthEnd ? end : monthEnd;
    if (first > last) return;
    const cursor = new Date(`${first}T00:00:00Z`);
    const until = new Date(`${last}T00:00:00Z`);
    while (cursor <= until) {
      dates.add(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  });
  return dates;
}

function noPunch(record) {
  return !record.morningIn && !record.morningOut && !record.afternoonIn && !record.afternoonOut;
}

function boundedNumber(value, { halfDay = false } = {}) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number < 0) return 0;
  if (halfDay) return Math.round(number * 2) / 2;
  return Math.floor(number);
}

function legacyUnifiedInput(record = {}) {
  const declared = record.unifiedAttendance || {};
  const high = record.highAttendance || {};
  // 已存入的高中旧表可继续读取，但从切换日起新导入一律使用 unifiedAttendance。
  return {
    lateMinutes: boundedNumber(declared.lateMinutes || high.lateMinutes),
    earlyLeaveMinutes: boundedNumber(declared.earlyLeaveMinutes || high.earlyLeaveMinutes),
    awayMinutes: boundedNumber(declared.awayMinutes),
    missedClassCount: boundedNumber(declared.missedClassCount || high.missedClassCount),
    absenceDays: boundedNumber(declared.absenceDays || high.absenceWorkDays, { halfDay: true }),
    exemptionStatus: declared.exemptionStatus === "exempt" ? "exempt" : "normal",
  };
}

function violationLevelForMinutes(minutes) {
  if (minutes <= 0) return "";
  if (minutes <= UNIFIED_ATTENDANCE_POLICY.minuteBoundaries.minorMax) return "minor";
  if (minutes <= UNIFIED_ATTENDANCE_POLICY.minuteBoundaries.generalMax) return "general";
  return "serious";
}

function minuteEvents(record, input) {
  const sources = [
    ["迟到", input.lateMinutes],
    ["早退", input.earlyLeaveMinutes],
    ["私自脱岗", input.awayMinutes],
  ];
  return sources
    .filter(([, minutes]) => minutes > 0)
    .map(([label, minutes]) => ({
      date: record.date,
      type: `${label} ${minutes} 分钟`,
      category: violationLevelForMinutes(minutes),
      minutes,
      source: label,
    }));
}

function rateForCount(rules, count) {
  if (count <= 0) return 0;
  if (count >= 3 && rules[3] !== undefined) return Number(rules[3]);
  if (count >= 2 && rules[2] !== undefined) return Number(rules[2]);
  return Number(rules[1] || 0);
}

function rollingReviewFlags(db, teacherId, month, settlement) {
  // 先把当月事实完整结构化保存。跨月、跨学期、12 个月的处分流程由人事在
  // 人事审批中复核，系统只给出提示，绝不自动执行处分或停用账号。
  const twelveMonthFlags = [];
  const currentSerious = settlement.seriousCount + settlement.severeCount;
  if (currentSerious >= 1) twelveMonthFlags.push("本月存在较重或严重考勤违纪，需人事复核处置材料");
  if (settlement.severeCount >= 1) twelveMonthFlags.push("本月存在全天旷工，需核对违规课时及后续处置");
  // 预留 db 参数，后续累积台账上线后在此合并连续 12 个月的正式已确认记录。
  void db;
  void teacherId;
  void month;
  return twelveMonthFlags;
}

export function attendanceSettlementForTeacher(db, teacherId, month) {
  const teacher = (db.teachers || []).find((item) => item.id === teacherId);
  if (!teacher) return noAttendanceSettlement();
  const leaveDates = leaveDatesForTeacher(db, teacherId, month);
  const records = activeAttendanceRecords(db, { month, stageId: teacher.stageId, teacherId })
    .filter((record) => record.shouldAttend !== false)
    .sort((left, right) => String(left.date).localeCompare(String(right.date)));
  if (!records.length) return noAttendanceSettlement();

  const events = [];
  const absenceDates = [];
  let absenceDays = 0;
  let missedClassCount = 0;
  records.forEach((record) => {
    const input = legacyUnifiedInput(record);
    const formallyExcused = input.exemptionStatus === "exempt" || leaveDates.has(record.date);
    if (formallyExcused) return;
    events.push(...minuteEvents(record, input));
    const classCount = boundedNumber(input.missedClassCount);
    if (classCount > 0) {
      missedClassCount += classCount;
      events.push({ date: record.date, type: `旷课／空堂 ${classCount} 节`, category: "serious", count: classCount, source: "旷课" });
    }
    let days = boundedNumber(input.absenceDays, { halfDay: true });
    // 表内明确应出勤且四次均无打卡、又没有已批准手续时，作为全天旷工待认定；
    // 这样不会把“缺一条打卡”误作旷工，也不会依赖旧的“未补卡扣钱”规则。
    if (!days && noPunch(record)) days = 1;
    if (days >= 1) {
      absenceDays += days;
      absenceDates.push(record.date);
      events.push({ date: record.date, type: `全天旷工 ${days} 天`, category: "severe", days, source: "旷工" });
    } else if (days === 0.5) {
      absenceDays += days;
      absenceDates.push(record.date);
      events.push({ date: record.date, type: "半天旷工", category: "serious", days, source: "旷工" });
    }
  });

  const minorCount = events.filter((item) => item.category === "minor").length;
  const generalCount = events.filter((item) => item.category === "general").length;
  const seriousCount = events.filter((item) => item.category === "serious").length;
  const severeCount = events.filter((item) => item.category === "severe").length;
  const requestedPerformanceDeductionRate = Math.min(
    UNIFIED_ATTENDANCE_POLICY.deductionRates.monthlyCap,
    rateForCount(UNIFIED_ATTENDANCE_POLICY.deductionRates.minor, minorCount) +
      rateForCount(UNIFIED_ATTENDANCE_POLICY.deductionRates.general, generalCount) +
      (seriousCount ? UNIFIED_ATTENDANCE_POLICY.deductionRates.serious : 0) +
      (severeCount ? UNIFIED_ATTENDANCE_POLICY.deductionRates.severe : 0),
  );
  const settlement = {
    applies: true,
    requiresPayrollContext: true,
    policyVersion: UNIFIED_ATTENDANCE_POLICY.version,
    policyName: UNIFIED_ATTENDANCE_POLICY.name,
    componentName: UNIFIED_ATTENDANCE_POLICY.componentName,
    attendanceLabel: "迟到、早退、脱岗、旷课或旷工",
    minorCount,
    generalCount,
    seriousCount,
    severeCount,
    lateEarlyCount: minorCount + generalCount + seriousCount,
    seriousOccurrenceCount: seriousCount,
    missedClassCount,
    absenceDays,
    performanceDeductionRate: Number(requestedPerformanceDeductionRate.toFixed(6)),
    requestedPerformanceDeductionRate: Number(requestedPerformanceDeductionRate.toFixed(6)),
    totalDeduction: 0,
    events,
    absenceDates: [...new Set(absenceDates)].sort(),
  };
  settlement.reviewFlags = rollingReviewFlags(db, teacherId, month, settlement);
  return settlement;
}

export function attendanceSettlementForUpload(db, upload = {}) {
  if (upload.status !== "active") return { applies: false, lateEarlyCount: 0, absenceDays: 0, totalDeduction: 0 };
  const teacherIds = new Set(
    activeAttendanceRecords(db, { month: upload.month, stageId: upload.stageId }).map((record) => record.teacherId),
  );
  const settlements = [...teacherIds].map((teacherId) => attendanceSettlementForTeacher(db, teacherId, upload.month));
  return {
    applies: true,
    requiresPayrollContext: true,
    policyVersion: UNIFIED_ATTENDANCE_POLICY.version,
    policyName: UNIFIED_ATTENDANCE_POLICY.name,
    componentName: UNIFIED_ATTENDANCE_POLICY.componentName,
    attendanceLabel: "全校统一考勤违纪",
    minorCount: settlements.reduce((sum, settlement) => sum + settlement.minorCount, 0),
    generalCount: settlements.reduce((sum, settlement) => sum + settlement.generalCount, 0),
    seriousOccurrenceCount: settlements.reduce((sum, settlement) => sum + settlement.seriousCount, 0),
    severeCount: settlements.reduce((sum, settlement) => sum + settlement.severeCount, 0),
    lateEarlyCount: settlements.reduce((sum, settlement) => sum + settlement.lateEarlyCount, 0),
    missedClassCount: settlements.reduce((sum, settlement) => sum + settlement.missedClassCount, 0),
    absenceDays: settlements.reduce((sum, settlement) => sum + settlement.absenceDays, 0),
    totalDeduction: 0,
  };
}
