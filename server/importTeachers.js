import { hashPassword } from "./auth.js";
import { deepMerge, defaultTeacherSalaryProfile } from "./payroll.js";

const REQUIRED_COLUMNS = ["employeeNo", "name", "stageId", "department", "primarySubjectId", "username"];
const OPTIONAL_COLUMNS = [
  "title",
  "phone",
  "hiredAt",
  "defaultPassword",
  "status",
  "qualificationGrade",
  "schoolYears",
  "assessmentBand",
  "housingTier",
  "probationRate",
  "homeroom",
  "homeroomStudentCount",
  "gradeHead",
  "deputyGradeHead",
  "teachingResearchLeader",
  "lessonPrepLeader",
  "graduatingClass",
  "eliteClass",
  "qingbeiClass",
  "attendanceDeduction",
  "manualItemsJson",
];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && quoted && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseCsv(text = "") {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    return headers.reduce(
      (row, header, headerIndex) => {
        row[header] = cells[headerIndex] || "";
        return row;
      },
      { rowNumber: index + 2 },
    );
  });

  return { headers, rows };
}

function normalizeText(value) {
  return String(value || "").trim();
}

function uniqueValues(values) {
  return new Set(values.map(normalizeText).filter(Boolean));
}

function validateDate(value) {
  if (!value) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function booleanValue(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return ["1", "true", "yes", "是", "y"].includes(String(value).trim().toLowerCase());
}

function numberValue(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function parseManualItemsJson(value, row, errors) {
  const text = normalizeText(value);
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error("manualItemsJson 必须是数组");
    return parsed;
  } catch (error) {
    errors.push({
      rowNumber: row.rowNumber,
      field: "manualItemsJson",
      message: `manualItemsJson 必须是 JSON 数组：${error.message}`,
    });
    return [];
  }
}

function salaryProfileFromRow(row, baseTeacher, errors) {
  const defaults = defaultTeacherSalaryProfile(baseTeacher);
  const patch = {
    qualificationGrade: normalizeText(row.qualificationGrade) || defaults.qualificationGrade,
    schoolYears: numberValue(row.schoolYears, defaults.schoolYears),
    assessmentBand: normalizeText(row.assessmentBand) || defaults.assessmentBand,
    housingTier: normalizeText(row.housingTier) || defaults.housingTier,
    probationRate: numberValue(row.probationRate, defaults.probationRate),
    attendanceDeduction: numberValue(row.attendanceDeduction, defaults.attendanceDeduction),
    roles: {
      homeroom: booleanValue(row.homeroom, defaults.roles.homeroom),
      homeroomStudentCount: numberValue(row.homeroomStudentCount, defaults.roles.homeroomStudentCount),
      gradeHead: booleanValue(row.gradeHead, defaults.roles.gradeHead),
      deputyGradeHead: booleanValue(row.deputyGradeHead, defaults.roles.deputyGradeHead),
      teachingResearchLeader: booleanValue(row.teachingResearchLeader, defaults.roles.teachingResearchLeader),
      lessonPrepLeader: booleanValue(row.lessonPrepLeader, defaults.roles.lessonPrepLeader),
      graduatingClass: booleanValue(row.graduatingClass, defaults.roles.graduatingClass),
      eliteClass: booleanValue(row.eliteClass, defaults.roles.eliteClass),
      qingbeiClass: booleanValue(row.qingbeiClass, defaults.roles.qingbeiClass),
    },
    manualItems: parseManualItemsJson(row.manualItemsJson, row, errors),
  };
  return deepMerge(defaults, patch);
}

function pad(number, length = 4) {
  return String(number).padStart(length, "0");
}

function nextTeacherNumber(db) {
  return db.teachers.reduce((max, teacher) => {
    const matched = String(teacher.id || "").match(/^T(\d+)$/);
    return matched ? Math.max(max, Number.parseInt(matched[1], 10)) : max;
  }, 0) + 1;
}

function stageById(db, stageId) {
  return db.stages.find((stage) => stage.id === stageId);
}

function subjectById(db, subjectId) {
  return db.subjects.find((subject) => subject.id === subjectId);
}

function uniqueAccountId(db, teacherId) {
  const baseId = `ACC-TEACHER-${teacherId.replace(/^T/, "")}`;
  if (!db.accounts.some((account) => account.id === baseId)) return baseId;
  let suffix = 1;
  while (db.accounts.some((account) => account.id === `${baseId}-${suffix}`)) {
    suffix += 1;
  }
  return `${baseId}-${suffix}`;
}

function publicImportedAccount(account) {
  return {
    id: account.id,
    username: account.username,
    role: account.role,
    teacherId: account.teacherId,
    name: account.name,
    department: account.department,
    status: account.status,
    mustChangePassword: account.mustChangePassword,
  };
}

export function previewTeacherImport(db, csvText = "", options = {}) {
  const { headers, rows } = parseCsv(csvText);
  const headerSet = new Set(headers);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headerSet.has(column));
  const unknownColumns = headers.filter((column) => !ALL_COLUMNS.includes(column));
  const stageIds = new Set(db.stages.map((stage) => stage.id));
  const subjectIds = new Set(db.subjects.map((subject) => subject.id));
  const existingEmployeeNos = uniqueValues(db.teachers.map((teacher) => teacher.employeeNo));
  const existingUsernames = uniqueValues(db.accounts.map((account) => account.username));
  const seenEmployeeNos = new Map();
  const seenUsernames = new Map();
  const errors = [];
  const warnings = [];

  if (!headers.length) {
    errors.push({
      rowNumber: 1,
      field: "file",
      message: "CSV 文件为空",
    });
  }

  missingColumns.forEach((column) => {
    errors.push({
      rowNumber: 1,
      field: column,
      message: `缺少必填列 ${column}`,
    });
  });

  unknownColumns.forEach((column) => {
    warnings.push({
      rowNumber: 1,
      field: column,
      message: `未识别列 ${column}，导入时会忽略`,
    });
  });

  const normalizedRows = rows.map((row) => {
    const normalized = {
      rowNumber: row.rowNumber,
      employeeNo: normalizeText(row.employeeNo),
      name: normalizeText(row.name),
      stageId: normalizeText(row.stageId),
      department: normalizeText(row.department),
      primarySubjectId: normalizeText(row.primarySubjectId),
      title: normalizeText(row.title) || "任课教师",
      phone: normalizeText(row.phone),
      hiredAt: normalizeText(row.hiredAt),
      username: normalizeText(row.username),
      defaultPassword: normalizeText(row.defaultPassword) || "123456",
      status: normalizeText(row.status) || "active",
      qualificationGrade: normalizeText(row.qualificationGrade),
      schoolYears: normalizeText(row.schoolYears),
      assessmentBand: normalizeText(row.assessmentBand),
      housingTier: normalizeText(row.housingTier),
      probationRate: normalizeText(row.probationRate),
      homeroom: normalizeText(row.homeroom),
      homeroomStudentCount: normalizeText(row.homeroomStudentCount),
      gradeHead: normalizeText(row.gradeHead),
      deputyGradeHead: normalizeText(row.deputyGradeHead),
      teachingResearchLeader: normalizeText(row.teachingResearchLeader),
      lessonPrepLeader: normalizeText(row.lessonPrepLeader),
      graduatingClass: normalizeText(row.graduatingClass),
      eliteClass: normalizeText(row.eliteClass),
      qingbeiClass: normalizeText(row.qingbeiClass),
      attendanceDeduction: normalizeText(row.attendanceDeduction),
      manualItemsJson: normalizeText(row.manualItemsJson),
    };

    REQUIRED_COLUMNS.forEach((column) => {
      if (!normalized[column]) {
        errors.push({
          rowNumber: normalized.rowNumber,
          field: column,
          message: `${column} 不能为空`,
        });
      }
    });

    if (normalized.employeeNo && existingEmployeeNos.has(normalized.employeeNo)) {
      errors.push({
        rowNumber: normalized.rowNumber,
        field: "employeeNo",
        message: `工号 ${normalized.employeeNo} 已存在`,
      });
    }

    if (normalized.username && existingUsernames.has(normalized.username)) {
      errors.push({
        rowNumber: normalized.rowNumber,
        field: "username",
        message: `用户名 ${normalized.username} 已存在`,
      });
    }

    if (normalized.stageId && !stageIds.has(normalized.stageId)) {
      errors.push({
        rowNumber: normalized.rowNumber,
        field: "stageId",
        message: `学部 ${normalized.stageId} 不存在`,
      });
    }

    if (normalized.primarySubjectId && !subjectIds.has(normalized.primarySubjectId)) {
      errors.push({
        rowNumber: normalized.rowNumber,
        field: "primarySubjectId",
        message: `科目 ${normalized.primarySubjectId} 不存在`,
      });
    }

    if (normalized.status && !["active", "disabled"].includes(normalized.status)) {
      errors.push({
        rowNumber: normalized.rowNumber,
        field: "status",
        message: "状态只能是 active 或 disabled",
      });
    }

    if (!validateDate(normalized.hiredAt)) {
      errors.push({
        rowNumber: normalized.rowNumber,
        field: "hiredAt",
        message: "入职日期格式必须是 YYYY-MM-DD",
      });
    }

    if (normalized.employeeNo) {
      if (seenEmployeeNos.has(normalized.employeeNo)) {
        errors.push({
          rowNumber: normalized.rowNumber,
          field: "employeeNo",
          message: `工号 ${normalized.employeeNo} 在第 ${seenEmployeeNos.get(normalized.employeeNo)} 行已出现`,
        });
      } else {
        seenEmployeeNos.set(normalized.employeeNo, normalized.rowNumber);
      }
    }

    if (normalized.username) {
      if (seenUsernames.has(normalized.username)) {
        errors.push({
          rowNumber: normalized.rowNumber,
          field: "username",
          message: `用户名 ${normalized.username} 在第 ${seenUsernames.get(normalized.username)} 行已出现`,
        });
      } else {
        seenUsernames.set(normalized.username, normalized.rowNumber);
      }
    }

    normalized.salaryProfile = salaryProfileFromRow(
      normalized,
      {
        id: "",
        stageId: normalized.stageId,
        primarySubjectId: normalized.primarySubjectId,
        title: normalized.title,
        hiredAt: normalized.hiredAt || "2026-09-01",
      },
      errors,
    );

    return normalized;
  });

  const errorRows = new Set(errors.filter((error) => error.rowNumber > 1).map((error) => error.rowNumber));
  return {
    headers,
    missingColumns,
    unknownColumns,
    totalRows: rows.length,
    validRows: normalizedRows.filter((row) => !errorRows.has(row.rowNumber)).length,
    errorRows: errorRows.size,
    canImport: errors.length === 0,
    rows: options.includeAllRows ? normalizedRows : normalizedRows.slice(0, 20),
    errors,
    warnings,
  };
}

export function commitTeacherImport(db, csvText = "", actorAccount = null) {
  const preview = previewTeacherImport(db, csvText, { includeAllRows: true });
  if (!preview.canImport) {
    const error = new Error("导入数据未通过校验");
    error.statusCode = 400;
    error.details = preview;
    throw error;
  }

  let teacherNumber = nextTeacherNumber(db);
  const createdAt = new Date().toISOString();
  const createdTeachers = [];
  const createdAccounts = [];

  preview.rows.forEach((row) => {
    const teacherId = `T${pad(teacherNumber)}`;
    teacherNumber += 1;
    const stage = stageById(db, row.stageId);
    const subject = subjectById(db, row.primarySubjectId);
    const teacher = {
      id: teacherId,
      employeeNo: row.employeeNo,
      name: row.name,
      stageId: row.stageId,
      stageName: stage?.name || row.department,
      department: row.department || stage?.name || "",
      primarySubjectId: row.primarySubjectId,
      primarySubjectName: subject?.name || "",
      title: row.title || "任课教师",
      phone: row.phone,
      status: row.status,
      hiredAt: row.hiredAt || "2026-09-01",
      salaryProfile: row.salaryProfile,
      source: "import",
      createdAt,
    };
    const account = {
      id: uniqueAccountId(db, teacherId),
      username: row.username,
      passwordHash: hashPassword(row.defaultPassword),
      role: "teacher",
      teacherId,
      name: row.name,
      department: teacher.department,
      status: row.status,
      mustChangePassword: true,
      createdAt,
    };

    db.teachers.push(teacher);
    db.accounts.push(account);
    createdTeachers.push(teacher);
    createdAccounts.push(publicImportedAccount(account));
  });

  db.meta.teacherCount = db.teachers.length;
  db.meta.updatedAt = createdAt;
  db.auditLogs.push({
    id: `AUDIT-${Date.now()}`,
    action: "teacher_import_commit",
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    importedCount: createdTeachers.length,
    createdAt,
  });

  return {
    importedCount: createdTeachers.length,
    totalTeachers: db.teachers.length,
    totalAccounts: db.accounts.length,
    teachers: createdTeachers.slice(0, 20),
    accounts: createdAccounts.slice(0, 20),
    preview: {
      ...preview,
      rows: preview.rows.slice(0, 20),
    },
  };
}
