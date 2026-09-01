// 教学基础数据的批量导入导出（验收 2.1 班级/年级/课程、2.2 教室、2.4 教学资源台账）
//
// 学校的验收方式是「现场批量导入并导出核对」，所以最关键的性质是**往返一致**：
// 导出一份 CSV，原样导回去，系统里应当一条都不变。达不到这点，"导出核对"就核不了。
// 为此导出必带 id 列，导入按 id 更新、无 id 才新建。
//
// 三条硬约束：
//   1. 导入只做新建与更新，**不删除**。班级、教室被课次以 RESTRICT 外键引用，
//      删除会被数据库拒绝；更重要的是"CSV 里少了一行"通常是编辑失误，
//      不该被解读成"删掉这个班"。要停用请把 active 列置为否。
//   2. 已排课的班级不允许改学部或年级。课次上冗余存了 stageId/gradeId，
//      改了班级而课次不动，两边就对不上了。
//   3. 班级与教室按学期存放，新建的 ID 必须带学期后缀，否则新学期建同名班会
//      与上学期撞主键，整批写入被拒。后缀规则与排课侧的结构生成保持一致。
//
// 科目（课程）是全校共用、不按学期存放的，因此没有学期后缀。

import { appendAuditLog } from "./storage.js";
import { parseCsv } from "./importTeachers.js";
import { buildWorkbook, cell, exportFilename, row } from "./excel.js";

const STAGE_LABELS = { primary: "小学部", middle: "初中部", high: "高中部" };

const ROOM_TYPE_LABELS = {
  homeroom: "普通教室",
  lab: "实验室",
  computer: "计算机房",
  playground: "操场",
  art: "美术室",
  music: "音乐室",
};

const CLASS_TYPE_LABELS = {
  regular: "普通班",
  experimental: "实验班",
};

function text(value) {
  return String(value ?? "").trim();
}

function boolValue(value, fallback = true) {
  const raw = text(value).toLowerCase();
  if (!raw) return fallback;
  if (["1", "true", "yes", "y", "是", "启用"].includes(raw)) return true;
  if (["0", "false", "no", "n", "否", "停用"].includes(raw)) return false;
  return fallback;
}

function boolText(value) {
  return value === false ? "否" : "是";
}

function intValue(value, fallback = 0) {
  const n = Number(text(value));
  return Number.isFinite(n) ? n : fallback;
}

function csvCell(value) {
  const raw = String(value ?? "");
  if (/[",\n]/.test(raw)) return `"${raw.replaceAll('"', '""')}"`;
  return raw;
}

/** 与排课侧结构生成一致的学期后缀，保证新建行的 ID 跨学期不撞主键 */
function termSuffixOf(term) {
  return term?.id ? `@${String(term.id).replace(/^TERM-/, "").slice(-13)}` : "";
}

function resolveTerm(db, termId) {
  const term =
    (db.terms || []).find((t) => t.id === termId) || (db.terms || []).find((t) => t.current);
  if (!term) throw Object.assign(new Error("学期不存在"), { statusCode: 404 });
  return term;
}

// ---------------------------------------------------------------------------
// 三类实体的列定义
//
// key      CSV 列名（英文，保证 Excel/WPS 不因本地化改动而错位）
// label    表头中文说明，导出模板用
// required 缺列即拒绝导入
// ---------------------------------------------------------------------------

const CLASS_COLUMNS = [
  { key: "id", label: "班级ID（留空则新建）" },
  { key: "stageId", label: "学部", required: true },
  { key: "grade", label: "年级", required: true },
  { key: "name", label: "班级名称", required: true },
  { key: "classType", label: "班型" },
  { key: "roomId", label: "固定教室ID" },
  { key: "displayOrder", label: "排序" },
  { key: "active", label: "是否启用" },
];

const ROOM_COLUMNS = [
  { key: "id", label: "教室ID（留空则新建）" },
  { key: "stageId", label: "学部", required: true },
  { key: "name", label: "教室名称", required: true },
  { key: "roomType", label: "教室类型", required: true },
  { key: "capacity", label: "容量" },
  { key: "active", label: "是否启用" },
];

const SUBJECT_COLUMNS = [
  { key: "id", label: "科目ID", required: true },
  { key: "name", label: "科目名称", required: true },
  { key: "lessonRate", label: "课时参考单价" },
];

export const ENTITY_KEYS = ["classes", "rooms", "subjects"];

const ENTITIES = {
  classes: { label: "班级", collection: "classes", columns: CLASS_COLUMNS, termScoped: true },
  rooms: { label: "教室", collection: "rooms", columns: ROOM_COLUMNS, termScoped: true },
  // 科目用自然主键（chinese/math 由使用者指定），填一个新 ID 就是新建；
  // 班级与教室的 ID 由系统生成并带学期后缀，填了查不到的 ID 一定是填错了。
  subjects: {
    label: "课程科目",
    collection: "subjects",
    columns: SUBJECT_COLUMNS,
    termScoped: false,
    naturalKey: true,
  },
};

export function entitySpec(entity) {
  const spec = ENTITIES[entity];
  if (!spec) throw Object.assign(new Error(`不支持的导入类型：${entity}`), { statusCode: 400 });
  return spec;
}

// ---------------------------------------------------------------------------
// 导出
// ---------------------------------------------------------------------------

function classToRow(record) {
  return {
    id: record.id,
    stageId: record.stageId,
    grade: record.grade,
    name: record.name,
    classType: record.classType || "regular",
    roomId: record.roomId || "",
    displayOrder: record.displayOrder ?? "",
    active: boolText(record.active),
  };
}

function roomToRow(record) {
  return {
    id: record.id,
    stageId: record.stageId,
    name: record.name,
    roomType: record.roomType,
    capacity: record.capacity ?? "",
    active: boolText(record.active),
  };
}

function subjectToRow(record) {
  return { id: record.id, name: record.name, lessonRate: record.lessonRate ?? "" };
}

const TO_ROW = { classes: classToRow, rooms: roomToRow, subjects: subjectToRow };

/** 取某实体在指定范围内的记录（学部筛选用于台账与分学部导出） */
export function collectRecords(db, entity, options = {}) {
  const spec = entitySpec(entity);
  let rows = db[spec.collection] || [];
  if (spec.termScoped) {
    const term = resolveTerm(db, options.termId);
    rows = rows.filter((r) => r.termId === term.id);
  }
  if (options.stageId) rows = rows.filter((r) => String(r.stageId) === String(options.stageId));
  return rows;
}

export function exportEntityCsv(db, entity, options = {}) {
  const spec = entitySpec(entity);
  const records = collectRecords(db, entity, options);
  const toRow = TO_ROW[entity];
  const keys = spec.columns.map((c) => c.key);

  const lines = [
    keys.join(","),
    ...records.map((record) => {
      const row = toRow(record);
      return keys.map((k) => csvCell(row[k])).join(",");
    }),
  ];

  const scope = spec.termScoped ? resolveTerm(db, options.termId).name : "全校";
  return {
    filename: exportFilename([spec.label, scope, options.stageId ? STAGE_LABELS[options.stageId] : ""], "csv"),
    content: lines.join("\n"),
    mimeType: "text/csv",
    total: records.length,
  };
}

/** 空模板：只有表头 + 一行中文说明，给不熟悉字段的老师用 */
export function exportEntityTemplate(entity) {
  const spec = entitySpec(entity);
  const keys = spec.columns.map((c) => c.key);
  const notes = spec.columns.map((c) => `${c.label}${c.required ? "（必填）" : ""}`);
  return {
    filename: exportFilename([spec.label, "导入模板"], "csv"),
    // 第二行是说明行，导入时会被当作一行数据校验并报错——所以模板里注明请删除
    content: [keys.join(","), notes.map(csvCell).join(",")].join("\n"),
    mimeType: "text/csv",
    total: 0,
  };
}

// ---------------------------------------------------------------------------
// 导入：预检
// ---------------------------------------------------------------------------

function pushError(errors, rowNumber, field, message) {
  errors.push({ rowNumber, field, message });
}

/**
 * 逐行校验，返回可直接展示给使用者的结果。
 * 与教师导入一致：有任何一行报错就整批拒绝（canImport=false），
 * 避免"导进去一半"这种最难收拾的状态。
 */
export function previewEntityImport(db, entity, csvText = "", options = {}) {
  const spec = entitySpec(entity);
  const term = spec.termScoped ? resolveTerm(db, options.termId) : null;
  const { headers, rows } = parseCsv(csvText);

  const headerSet = new Set(headers);
  const known = spec.columns.map((c) => c.key);
  const missingColumns = spec.columns.filter((c) => c.required && !headerSet.has(c.key)).map((c) => c.key);
  const unknownColumns = headers.filter((h) => !known.includes(h));

  const errors = [];
  const warnings = [];

  if (missingColumns.length) {
    pushError(errors, 1, "header", `缺少必填列：${missingColumns.join("、")}`);
  }
  if (unknownColumns.length) {
    warnings.push({ rowNumber: 1, field: "header", message: `以下列将被忽略：${unknownColumns.join("、")}` });
  }

  const existing = new Map(collectRecords(db, entity, { termId: term?.id }).map((r) => [r.id, r]));
  const stageIds = new Set((db.stages || []).map((s) => s.id));
  const roomsInTerm = new Map(
    (spec.termScoped ? (db.rooms || []).filter((r) => r.termId === term.id) : db.rooms || []).map((r) => [r.id, r]),
  );
  // 已排课的班级不能改学部/年级：课次上冗余存了这两个字段，改一边会对不上
  const scheduledClassIds = new Set((db.lessonInstances || []).map((l) => l.classId));

  const seenIds = new Map();
  const seenNames = new Map();
  let createCount = 0;
  let updateCount = 0;
  let unchangedCount = 0;

  const parsed = rows.map((raw) => {
    const rowNumber = raw.rowNumber;
    const item = { rowNumber, action: "create", changes: [] };
    spec.columns.forEach((c) => {
      item[c.key] = text(raw[c.key]);
    });

    spec.columns
      .filter((c) => c.required)
      .forEach((c) => {
        if (!item[c.key]) pushError(errors, rowNumber, c.key, `${c.label} 不能为空`);
      });

    if (item.id) {
      if (seenIds.has(item.id)) {
        pushError(errors, rowNumber, "id", `ID ${item.id} 在第 ${seenIds.get(item.id)} 行已出现`);
      } else {
        seenIds.set(item.id, rowNumber);
      }
    }

    // 学部
    if (spec.columns.some((c) => c.key === "stageId") && item.stageId && !stageIds.has(item.stageId)) {
      pushError(errors, rowNumber, "stageId", `学部 ${item.stageId} 不存在（应为 ${[...stageIds].join("/")}）`);
    }

    const prior = item.id ? existing.get(item.id) : null;
    if (item.id && !prior && !spec.naturalKey) {
      // 指定了 ID 却查不到：可能是学期选错了，直接建一条同 ID 的记录会撞主键
      const elsewhere = (db[spec.collection] || []).find((r) => r.id === item.id);
      if (elsewhere) {
        pushError(
          errors,
          rowNumber,
          "id",
          `ID ${item.id} 属于其他学期（${elsewhere.termName || elsewhere.termId}），不能导入到本学期`,
        );
      } else {
        pushError(errors, rowNumber, "id", `ID ${item.id} 不存在；新建请留空 id 列`);
      }
    }
    item.action = prior ? "update" : "create";

    if (entity === "classes") validateClassRow(item, { prior, roomsInTerm, scheduledClassIds }, errors, warnings);
    if (entity === "rooms") validateRoomRow(item, errors);
    if (entity === "subjects") validateSubjectRow(item, { prior }, errors, warnings);

    // 同一学期内重名：班级、教室都是靠名字认人的，重名会让老师选错
    const nameKey = `${item.stageId || ""}::${item.name || ""}`;
    if (item.name) {
      if (seenNames.has(nameKey)) {
        pushError(errors, rowNumber, "name", `${item.name} 在第 ${seenNames.get(nameKey)} 行已出现`);
      } else {
        seenNames.set(nameKey, rowNumber);
      }
      const clash = [...existing.values()].find(
        (r) => r.id !== item.id && String(r.stageId) === item.stageId && String(r.name) === item.name,
      );
      if (clash) {
        pushError(errors, rowNumber, "name", `${item.name} 与已有记录 ${clash.id} 重名`);
      }
    }

    if (prior) {
      item.changes = diffAgainst(entity, item, prior);
      if (item.changes.length === 0) {
        item.action = "unchanged";
        unchangedCount += 1;
      } else {
        updateCount += 1;
      }
    } else {
      createCount += 1;
    }
    return item;
  });

  const errorRows = new Set(errors.filter((e) => e.rowNumber > 1).map((e) => e.rowNumber));
  return {
    entity,
    entityLabel: spec.label,
    termId: term?.id || "",
    termName: term?.name || "",
    headers,
    missingColumns,
    unknownColumns,
    totalRows: rows.length,
    createCount,
    updateCount,
    unchangedCount,
    errorRows: errorRows.size,
    validRows: parsed.filter((r) => !errorRows.has(r.rowNumber)).length,
    canImport: errors.length === 0 && rows.length > 0,
    // 只回有变化的行，且不按位置截断——按前 N 行截会把排在后面的新建行整个藏掉，
    // 摘要写着"新建 1 条"而差异表里一条都看不到，使用者只能盲签。
    // 无变化的行不带任何信息，没有回传的必要。
    rows: options.includeAllRows ? parsed : parsed.filter((r) => r.action !== "unchanged").slice(0, 200),
    errors,
    warnings,
  };
}

function validateClassRow(item, ctx, errors, warnings) {
  const { prior, roomsInTerm, scheduledClassIds } = ctx;

  const grade = Number(item.grade);
  if (item.grade && (!Number.isInteger(grade) || grade < 1 || grade > 12)) {
    pushError(errors, item.rowNumber, "grade", `年级 ${item.grade} 无效，应为 1-12 的整数`);
  }
  if (item.classType && !CLASS_TYPE_LABELS[item.classType]) {
    pushError(
      errors,
      item.rowNumber,
      "classType",
      `班型 ${item.classType} 无效（应为 ${Object.keys(CLASS_TYPE_LABELS).join("/")}）`,
    );
  }

  if (item.roomId) {
    const room = roomsInTerm.get(item.roomId);
    if (!room) {
      pushError(errors, item.rowNumber, "roomId", `教室 ${item.roomId} 在本学期不存在`);
    } else if (String(room.stageId) !== item.stageId) {
      // 外键拦不住这种：教室确实存在，只是属于别的学部。几乎必然是填错了。
      warnings.push({
        rowNumber: item.rowNumber,
        field: "roomId",
        message: `教室 ${room.name} 属于${STAGE_LABELS[room.stageId] || room.stageId}，与本班学部不一致`,
      });
    }
  }

  // 已排课的班级改学部/年级会与课次上的冗余字段对不上
  if (prior && scheduledClassIds.has(prior.id)) {
    if (item.stageId && item.stageId !== String(prior.stageId)) {
      pushError(errors, item.rowNumber, "stageId", `班级 ${prior.name} 已有排课，不能改学部；请先清空该班课表`);
    }
    if (item.grade && Number(item.grade) !== Number(prior.grade)) {
      pushError(errors, item.rowNumber, "grade", `班级 ${prior.name} 已有排课，不能改年级；请先清空该班课表`);
    }
  }
}

function validateRoomRow(item, errors) {
  if (item.roomType && !ROOM_TYPE_LABELS[item.roomType]) {
    pushError(
      errors,
      item.rowNumber,
      "roomType",
      `教室类型 ${item.roomType} 无效（应为 ${Object.keys(ROOM_TYPE_LABELS).join("/")}）`,
    );
  }
  if (item.capacity && !Number.isFinite(Number(item.capacity))) {
    pushError(errors, item.rowNumber, "capacity", `容量 ${item.capacity} 不是数字`);
  }
}

function validateSubjectRow(item, ctx, errors, warnings) {
  if (item.id && !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(item.id)) {
    // 科目 ID 会进课次、进课表、进工资明细，用中文或空格后续很难排查
    pushError(errors, item.rowNumber, "id", `科目ID ${item.id} 只能用英文字母、数字、下划线与连字符，且以字母开头`);
  }
  if (item.lessonRate && !Number.isFinite(Number(item.lessonRate))) {
    pushError(errors, item.rowNumber, "lessonRate", `课时参考单价 ${item.lessonRate} 不是数字`);
  }
  if (ctx.prior && item.lessonRate && Number(item.lessonRate) !== Number(ctx.prior.lessonRate)) {
    warnings.push({
      rowNumber: item.rowNumber,
      field: "lessonRate",
      message: `${item.name} 课时参考单价 ${ctx.prior.lessonRate} → ${item.lessonRate}；该值仅供参考，实际课时费按薪资配置中的学部课时规则计算`,
    });
  }
}

function diffAgainst(entity, item, prior) {
  const before = TO_ROW[entity](prior);
  const changes = [];
  entitySpec(entity).columns.forEach((c) => {
    if (c.key === "id") return;
    const next = item[c.key];
    // CSV 里留空表示"不改这一列"，而不是"清空这一列"——否则导出的表格里
    // 任何一个空单元格都会变成一次删除。
    if (next === "") return;
    if (String(before[c.key] ?? "") !== next) {
      changes.push({ field: c.key, from: String(before[c.key] ?? ""), to: next });
    }
  });
  return changes;
}

// ---------------------------------------------------------------------------
// 导入：提交
// ---------------------------------------------------------------------------

function nextEntityId(db, entity, item, term, taken) {
  const suffix = termSuffixOf(term);
  let base;
  if (entity === "classes") base = `CLS-${item.stageId}-${item.grade}-${text(item.name).replace(/\s+/g, "")}`;
  else if (entity === "rooms") base = `ROOM-${item.stageId}-${text(item.name).replace(/\s+/g, "")}`;
  else base = text(item.id);

  let candidate = entity === "subjects" ? base : `${base}${suffix}`;
  let n = 2;
  const all = new Set((db[entitySpec(entity).collection] || []).map((r) => r.id));
  while (all.has(candidate) || taken.has(candidate)) {
    candidate = entity === "subjects" ? `${base}-${n}` : `${base}-${n}${suffix}`;
    n += 1;
  }
  taken.add(candidate);
  return candidate;
}

function applyClass(db, item, prior, term, id) {
  const stage = (db.stages || []).find((s) => s.id === item.stageId);
  const room = item.roomId ? (db.rooms || []).find((r) => r.id === item.roomId) : null;
  const classType = item.classType || prior?.classType || "regular";
  return {
    ...(prior || {}),
    id,
    stageId: item.stageId || prior?.stageId,
    stageName: stage?.name || prior?.stageName || "",
    grade: item.grade ? Number(item.grade) : prior?.grade,
    name: item.name || prior?.name,
    classType,
    classTypeLabel: CLASS_TYPE_LABELS[classType] || classType,
    displayOrder: item.displayOrder ? intValue(item.displayOrder) : (prior?.displayOrder ?? 0),
    roomId: item.roomId || prior?.roomId || "",
    roomName: room?.name || prior?.roomName || "",
    active: item.active === "" ? (prior?.active ?? true) : boolValue(item.active, true),
    termId: term.id,
    termName: term.name,
    source: prior?.source || "import",
  };
}

function applyRoom(db, item, prior, term, id) {
  return {
    ...(prior || {}),
    id,
    stageId: item.stageId || prior?.stageId,
    name: item.name || prior?.name,
    roomType: item.roomType || prior?.roomType,
    capacity: item.capacity === "" ? (prior?.capacity ?? 1) : intValue(item.capacity, 1),
    // 二维码与门牌屏编号沿用物理编号：贴纸已经贴在门上了，导入不能把它换掉
    qrCode: prior?.qrCode || `ROOM:${id}`,
    displayKey: prior?.displayKey || `screen-${String(id).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    active: item.active === "" ? (prior?.active ?? true) : boolValue(item.active, true),
    termId: term.id,
    termName: term.name,
    source: prior?.source || "import",
  };
}

function applySubject(db, item, prior, term, id) {
  return {
    ...(prior || {}),
    id,
    name: item.name || prior?.name,
    lessonRate: item.lessonRate === "" ? (prior?.lessonRate ?? 0) : Number(item.lessonRate),
  };
}

const APPLY = { classes: applyClass, rooms: applyRoom, subjects: applySubject };

export function commitEntityImport(db, entity, csvText = "", options = {}, actorAccount = null) {
  const spec = entitySpec(entity);
  const preview = previewEntityImport(db, entity, csvText, { ...options, includeAllRows: true });
  if (!preview.canImport) {
    const error = new Error(preview.totalRows === 0 ? "文件中没有数据行" : "导入数据未通过校验");
    error.statusCode = 400;
    error.details = preview;
    throw error;
  }

  const term = spec.termScoped ? resolveTerm(db, options.termId) : null;
  const collection = (db[spec.collection] = db[spec.collection] || []);
  const byId = new Map(collection.map((r, i) => [r.id, i]));
  const taken = new Set();
  const apply = APPLY[entity];

  const created = [];
  const updated = [];

  preview.rows.forEach((item) => {
    if (item.action === "unchanged") return;
    const priorIndex = item.id ? byId.get(item.id) : undefined;
    const prior = priorIndex === undefined ? null : collection[priorIndex];
    const id = prior ? prior.id : nextEntityId(db, entity, item, term, taken);
    const record = apply(db, item, prior, term, id);

    if (prior) {
      collection[priorIndex] = record;
      updated.push({ id, name: record.name, changes: item.changes });
    } else {
      collection.push(record);
      byId.set(id, collection.length - 1);
      created.push({ id, name: record.name });
    }
  });

  const summary = {
    entity,
    entityLabel: spec.label,
    termId: term?.id || "",
    createdCount: created.length,
    updatedCount: updated.length,
    unchangedCount: preview.unchangedCount,
    created: created.slice(0, 50),
    updated: updated.slice(0, 50),
  };

  // 用系统统一的审计写入：自行拼 ID 极易重复（同一集合上连续两次"改 1 条"
  // 就会撞主键），而重复主键会让整批持久化失败。
  appendAuditLog(db, {
    action: `${entity}_import`,
    actorAccountId: actorAccount?.id || "",
    actorName: actorAccount?.name || "",
    termId: term?.id || "",
    createdCount: created.length,
    updatedCount: updated.length,
  });

  return summary;
}

// ---------------------------------------------------------------------------
// 教学资源台账（验收 2.4）
//
// 台账要回答的是"这间教室归谁用、这学期排了多少节课、有没有闲置"，
// 所以除了教室本身的属性，还要带上占用情况。
// ---------------------------------------------------------------------------

export function buildResourceLedger(db, options = {}) {
  const term = resolveTerm(db, options.termId);
  const { stageId = "", roomType = "", keyword = "", onlyIdle = false } = options;

  const classesByRoom = new Map();
  (db.classes || [])
    .filter((c) => c.termId === term.id && c.roomId)
    .forEach((c) => {
      if (!classesByRoom.has(c.roomId)) classesByRoom.set(c.roomId, []);
      classesByRoom.get(c.roomId).push(c);
    });

  const lessonCountByRoom = new Map();
  (db.lessonInstances || [])
    .filter((l) => l.termId === term.id && l.status !== "cancelled" && l.roomId)
    .forEach((l) => lessonCountByRoom.set(l.roomId, (lessonCountByRoom.get(l.roomId) || 0) + 1));

  const needle = keyword.trim().toLowerCase();
  let rows = (db.rooms || [])
    .filter((r) => r.termId === term.id)
    .map((r) => {
      const holders = classesByRoom.get(r.id) || [];
      const lessons = lessonCountByRoom.get(r.id) || 0;
      return {
        id: r.id,
        stageId: r.stageId,
        stageName: STAGE_LABELS[r.stageId] || r.stageId || "",
        name: r.name,
        roomType: r.roomType,
        roomTypeLabel: ROOM_TYPE_LABELS[r.roomType] || r.roomType || "",
        capacity: r.capacity ?? "",
        active: r.active !== false,
        qrCode: r.qrCode || "",
        holderNames: holders.map((c) => c.name).join("、"),
        holderCount: holders.length,
        lessonCount: lessons,
        idle: lessons === 0,
      };
    });

  if (stageId) rows = rows.filter((r) => String(r.stageId) === String(stageId));
  if (roomType) rows = rows.filter((r) => r.roomType === roomType);
  if (needle) {
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        r.id.toLowerCase().includes(needle) ||
        r.holderNames.toLowerCase().includes(needle),
    );
  }
  if (onlyIdle) rows = rows.filter((r) => r.idle);

  rows.sort((a, b) => String(a.id).localeCompare(String(b.id)));

  return {
    termId: term.id,
    termName: term.name,
    rows,
    totals: {
      roomCount: rows.length,
      idleCount: rows.filter((r) => r.idle).length,
      disabledCount: rows.filter((r) => !r.active).length,
      lessonCount: rows.reduce((s, r) => s + r.lessonCount, 0),
      byType: Object.fromEntries(
        Object.keys(ROOM_TYPE_LABELS).map((k) => [
          ROOM_TYPE_LABELS[k],
          rows.filter((r) => r.roomType === k).length,
        ]),
      ),
    },
  };
}

export function buildResourceLedgerExcel(ledger, filterNote = "") {
  const head = ["教室ID", "学部", "教室名称", "类型", "容量", "使用班级", "本学期课次", "状态"];
  const rows = [
    row(head.map((h) => cell(h, "head")), 30),
    ...ledger.rows.map((r) =>
      row([
        cell(r.id),
        cell(r.stageName),
        cell(r.name, "text"),
        cell(r.roomTypeLabel),
        cell(r.capacity === "" ? "" : r.capacity, "number"),
        cell(r.holderNames, "text"),
        // 闲置教室标红：台账的用处之一就是把没排上课的教室挑出来
        cell(r.lessonCount, r.idle ? "warn" : "number"),
        cell(r.active ? "启用" : "停用", r.active ? "cell" : "warn"),
      ]),
    ),
    row([
      cell("合计", "total", 5),
      cell(`${ledger.totals.roomCount} 间`, "total"),
      cell(ledger.totals.lessonCount, "totalNumber"),
      cell(`闲置 ${ledger.totals.idleCount} 间`, "total"),
    ]),
  ];

  return buildWorkbook([
    {
      name: "教学资源台账",
      title: "教学资源台账",
      subtitle: [ledger.termName, filterNote, `共 ${ledger.totals.roomCount} 间，其中闲置 ${ledger.totals.idleCount} 间`]
        .filter(Boolean)
        .join(" · "),
      columns: [190, 62, 150, 80, 52, 190, 84, 60],
      rows,
      freezeRows: 1,
    },
  ]);
}

export function exportResourceLedger(db, options = {}) {
  const ledger = buildResourceLedger(db, options);
  const notes = [];
  if (options.stageId) notes.push(STAGE_LABELS[options.stageId] || options.stageId);
  if (options.roomType) notes.push(ROOM_TYPE_LABELS[options.roomType] || options.roomType);
  if (options.keyword) notes.push(`关键字「${options.keyword}」`);
  if (options.onlyIdle) notes.push("仅闲置");
  return {
    filename: exportFilename(["教学资源台账", ledger.termName], "xls"),
    content: buildResourceLedgerExcel(ledger, notes.join(" / ")),
    mimeType: "application/vnd.ms-excel",
    total: ledger.rows.length,
    ledger,
  };
}

export { CLASS_TYPE_LABELS, ROOM_TYPE_LABELS, STAGE_LABELS };
