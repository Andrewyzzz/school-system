const REQUIRED_COLUMNS = ["employeeNo", "name", "stageId", "department", "primarySubjectId", "username"];
const OPTIONAL_COLUMNS = ["title", "phone", "hiredAt", "defaultPassword", "status"];
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

export function previewTeacherImport(db, csvText = "") {
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
    rows: normalizedRows.slice(0, 20),
    errors,
    warnings,
  };
}
