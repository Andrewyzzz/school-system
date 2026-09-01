// 教学基础数据批量导入导出（验收 2.1 班级/课程、2.2 教室、2.4 教学资源台账）
//
// 学校的验收方式是「现场批量导入并导出核对」，所以第一等重要的性质是往返一致：
// 导出一份、原样导回去，系统里必须一条都不变。其次是那些数据库外键拦不住、
// 只能靠业务校验挡住的错误——跨学部占用教室、给已排课的班级改年级、
// 空单元格被当成"清空该字段"。
import assert from "node:assert/strict";
import { createInitialData, normalizeDatabase } from "../server/storage.js";
import {
  buildResourceLedger,
  buildResourceLedgerExcel,
  commitEntityImport,
  exportEntityCsv,
  exportEntityTemplate,
  exportResourceLedger,
  previewEntityImport,
} from "../server/dataPorting.js";

function freshDb() {
  const db = createInitialData({ teacherCount: 20 });
  normalizeDatabase(db);
  return db;
}

const db = freshDb();
const term = db.terms.find((t) => t.current) || db.terms[0];

// ---------------------------------------------------------------------------
// 1. 往返一致：导出 → 原样导入 → 零变化
// ---------------------------------------------------------------------------
{
  for (const entity of ["classes", "rooms", "subjects"]) {
    const out = exportEntityCsv(db, entity, { termId: term.id });
    assert.ok(out.total > 0, `${entity} 应有可导出的数据`);
    assert.match(out.filename, /\.csv$/);

    const preview = previewEntityImport(db, entity, out.content, {
      termId: term.id,
      includeAllRows: true,
    });
    assert.equal(preview.errors.length, 0, `${entity} 自己导出的文件必须能无错导回：${JSON.stringify(preview.errors[0])}`);
    assert.equal(preview.createCount, 0, `${entity} 往返不应新建任何记录`);
    assert.equal(preview.updateCount, 0, `${entity} 往返不应更新任何记录`);
    assert.equal(preview.unchangedCount, out.total, `${entity} 往返应全部识别为未变化`);
  }

  // 导出必须带 id 列，否则再导回去会变成整批新建
  const csv = exportEntityCsv(db, "classes", { termId: term.id }).content;
  assert.equal(csv.split("\n")[0].split(",")[0], "id", "首列应为 id");
}

// ---------------------------------------------------------------------------
// 2. 提交后数据库确实零变化（预检说"未变化"不代表提交不动数据）
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];
  const before = JSON.stringify(scratch.classes);
  const csv = exportEntityCsv(scratch, "classes", { termId: t.id }).content;
  const result = commitEntityImport(scratch, "classes", csv, { termId: t.id });
  assert.equal(result.createdCount, 0);
  assert.equal(result.updatedCount, 0);
  assert.equal(JSON.stringify(scratch.classes), before, "原样导回后班级集合应逐字节一致");
}

// ---------------------------------------------------------------------------
// 3. 新建：ID 自动生成且带学期后缀（跨学期不撞主键）
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];
  const before = scratch.classes.length;
  const csv = ["id,stageId,grade,name,classType,roomId,displayOrder,active", ",primary,3,三年级 99 班,regular,,9,是"].join("\n");

  const preview = previewEntityImport(scratch, "classes", csv, { termId: t.id, includeAllRows: true });
  assert.equal(preview.canImport, true, JSON.stringify(preview.errors));
  assert.equal(preview.createCount, 1);

  const result = commitEntityImport(scratch, "classes", csv, { termId: t.id });
  assert.equal(result.createdCount, 1);
  assert.equal(scratch.classes.length, before + 1);

  const created = scratch.classes.find((c) => c.name === "三年级 99 班");
  assert.ok(created, "新班级应已写入");
  assert.equal(created.termId, t.id, "新建记录必须落在指定学期");
  assert.equal(created.stageName, "小学部", "学部名称应从 stages 补全，而不是留空");
  assert.equal(created.classTypeLabel, "普通班", "班型中文标签应补全");
  assert.equal(created.grade, 3, "年级应转成数字");
  assert.equal(created.active, true);
  assert.ok(
    String(created.id).includes("@"),
    `新建 ID 必须带学期后缀，否则新学期建同名班会撞主键，实际为 ${created.id}`,
  );

  // ID 必须全局唯一
  const ids = scratch.classes.map((c) => c.id);
  assert.equal(ids.length, new Set(ids).size, "班级 ID 不得重复");
}

// ---------------------------------------------------------------------------
// 4. 更新：只改填了值的列，空单元格不清空原值
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];
  const target = scratch.classes.find((c) => c.termId === t.id);
  const originalRoom = target.roomId;
  assert.ok(originalRoom, "样本班级应有固定教室，否则测不出空值语义");

  // 只给 name，其余列留空
  const csv = [
    "id,stageId,grade,name,classType,roomId,displayOrder,active",
    `${target.id},${target.stageId},${target.grade},改名后的班级,,,,`,
  ].join("\n");

  const preview = previewEntityImport(scratch, "classes", csv, { termId: t.id, includeAllRows: true });
  assert.equal(preview.canImport, true, JSON.stringify(preview.errors));
  assert.equal(preview.updateCount, 1);
  assert.deepEqual(
    preview.rows[0].changes.map((c) => c.field),
    ["name"],
    "只有填了值的列才算变更，空单元格不应产生 diff",
  );

  commitEntityImport(scratch, "classes", csv, { termId: t.id });
  const after = scratch.classes.find((c) => c.id === target.id);
  assert.equal(after.name, "改名后的班级");
  assert.equal(after.roomId, originalRoom, "留空的 roomId 不能被清空——否则导出表里每个空格都会变成一次删除");
  assert.equal(after.active, true, "留空的 active 不能变成 false");
}

// ---------------------------------------------------------------------------
// 5. 导入不删除：文件里少了的行必须原样保留
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];
  const before = scratch.classes.filter((c) => c.termId === t.id).length;
  const full = exportEntityCsv(scratch, "classes", { termId: t.id }).content.split("\n");
  const partial = [full[0], full[1]].join("\n"); // 只保留一行数据

  commitEntityImport(scratch, "classes", partial, { termId: t.id });
  assert.equal(
    scratch.classes.filter((c) => c.termId === t.id).length,
    before,
    "CSV 里少了的行通常是编辑失误，不能被当成删除",
  );
}

// ---------------------------------------------------------------------------
// 6. 外键拦不住的错误：跨学期 ID、跨学部教室、已排课改年级
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];

  // 6a. 指定了不存在的 ID
  const ghost = previewEntityImport(
    scratch,
    "classes",
    "id,stageId,grade,name\nCLS-NOT-EXIST,primary,1,幽灵班",
    { termId: t.id, includeAllRows: true },
  );
  assert.equal(ghost.canImport, false);
  assert.match(ghost.errors[0].message, /不存在/, "指定不存在的 ID 应报错，而不是静默新建");

  // 6b. 跨学部占用教室：外键查得到这间教室，但它属于别的学部
  const primaryClass = scratch.classes.find((c) => c.termId === t.id && c.stageId === "primary");
  const highRoom = scratch.rooms.find((r) => r.termId === t.id && r.stageId === "high");
  assert.ok(primaryClass && highRoom, "样本数据应同时有小学班级与高中教室");
  const cross = previewEntityImport(
    scratch,
    "classes",
    `id,stageId,grade,name,roomId\n${primaryClass.id},${primaryClass.stageId},${primaryClass.grade},${primaryClass.name},${highRoom.id}`,
    { termId: t.id, includeAllRows: true },
  );
  assert.ok(
    cross.warnings.some((w) => /学部/.test(w.message)),
    "小学班级占用高中教室必须给出警示——数据库外键拦不住这种，教室确实存在",
  );

  // 6c. 教室 ID 根本不存在 → 直接报错（否则提交时外键会在 COMMIT 拒绝整批）
  const badRoom = previewEntityImport(
    scratch,
    "classes",
    `id,stageId,grade,name,roomId\n${primaryClass.id},${primaryClass.stageId},${primaryClass.grade},${primaryClass.name},ROOM-NOPE`,
    { termId: t.id, includeAllRows: true },
  );
  assert.equal(badRoom.canImport, false);
  assert.match(badRoom.errors[0].message, /教室/, "引用不存在的教室应在预检拦下");

  // 6d. 已排课的班级不能改年级
  scratch.lessonInstances = [
    { id: "L1", termId: t.id, classId: primaryClass.id, teacherId: "T0001", date: "2026-06-15", time: "08:00-08:40", status: "scheduled", units: 1 },
  ];
  const regrade = previewEntityImport(
    scratch,
    "classes",
    `id,stageId,grade,name\n${primaryClass.id},${primaryClass.stageId},6,${primaryClass.name}`,
    { termId: t.id, includeAllRows: true },
  );
  assert.equal(regrade.canImport, false);
  assert.match(regrade.errors[0].message, /已有排课/, "已排课的班级改年级会与课次上的冗余字段对不上，必须拦下");

  // 没排课的班级改年级则应放行
  const idleClass = scratch.classes.find((c) => c.termId === t.id && c.id !== primaryClass.id);
  const ok = previewEntityImport(
    scratch,
    "classes",
    `id,stageId,grade,name\n${idleClass.id},${idleClass.stageId},5,${idleClass.name}`,
    { termId: t.id, includeAllRows: true },
  );
  assert.equal(ok.canImport, true, "没排课的班级应允许调整年级");
}

// ---------------------------------------------------------------------------
// 7. 重复与枚举校验
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];

  // 文件内重名
  const dup = previewEntityImport(
    scratch,
    "classes",
    "id,stageId,grade,name\n,primary,1,重名班\n,primary,1,重名班",
    { termId: t.id, includeAllRows: true },
  );
  assert.equal(dup.canImport, false);
  assert.match(dup.errors[0].message, /已出现/, "同一文件内重名应报错");

  // 与已有记录重名
  const exist = scratch.classes.find((c) => c.termId === t.id && c.stageId === "primary");
  const clash = previewEntityImport(
    scratch,
    "classes",
    `id,stageId,grade,name\n,primary,${exist.grade},${exist.name}`,
    { termId: t.id, includeAllRows: true },
  );
  assert.equal(clash.canImport, false);
  assert.match(clash.errors[0].message, /重名/, "与已有班级重名应报错");

  // 非法学部
  const badStage = previewEntityImport(scratch, "classes", "id,stageId,grade,name\n,nowhere,1,X班", {
    termId: t.id,
    includeAllRows: true,
  });
  assert.equal(badStage.canImport, false);
  assert.match(badStage.errors[0].message, /学部/);

  // 非法年级
  const badGrade = previewEntityImport(scratch, "classes", "id,stageId,grade,name\n,primary,99,X班", {
    termId: t.id,
    includeAllRows: true,
  });
  assert.equal(badGrade.canImport, false);
  assert.match(badGrade.errors.map((e) => e.message).join(""), /年级/);

  // 非法教室类型
  const badType = previewEntityImport(scratch, "rooms", "id,stageId,name,roomType\n,primary,新教室,厕所", {
    termId: t.id,
    includeAllRows: true,
  });
  assert.equal(badType.canImport, false);
  assert.match(badType.errors[0].message, /教室类型/);

  // 缺必填列
  const noHeader = previewEntityImport(scratch, "rooms", "id,name\n,新教室", { termId: t.id, includeAllRows: true });
  assert.equal(noHeader.canImport, false);
  assert.match(noHeader.errors[0].message, /缺少必填列/);

  // 空文件不应被当成"成功导入 0 条"
  const empty = previewEntityImport(scratch, "rooms", "", { termId: t.id, includeAllRows: true });
  assert.equal(empty.canImport, false, "空文件应拒绝，而不是报告导入成功");
}

// ---------------------------------------------------------------------------
// 8. 全有或全无：一行有错，整批都不能落库
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];
  const before = scratch.classes.length;
  const csv = [
    "id,stageId,grade,name",
    ",primary,1,好的班级",
    ",nowhere,1,坏的班级", // 第 3 行学部非法
  ].join("\n");

  assert.throws(
    () => commitEntityImport(scratch, "classes", csv, { termId: t.id }),
    /未通过校验/,
    "有错行时应整批拒绝",
  );
  assert.equal(scratch.classes.length, before, "被拒绝的导入不能留下半截数据");
}

// ---------------------------------------------------------------------------
// 9. 教室导入：二维码与门牌屏编号不能被覆盖
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];
  const room = scratch.rooms.find((r) => r.termId === t.id);
  // 真实的跨学期教室：ID 带 @学期后缀，二维码却沿用不带后缀的物理编号——
  // 门牌贴纸是贴在墙上的实物，换学期不会重贴。造出这种分叉才测得出覆盖问题。
  room.id = `${room.id}@2027-PHASE1`;
  room.qrCode = "ROOM:ROOM-primary-1-01";
  room.displayKey = "screen-room-primary-1-01";
  const qr = room.qrCode;
  const key = room.displayKey;
  assert.notEqual(qr, `ROOM:${room.id}`, "样本必须是二维码与 ID 不同构的教室，否则覆盖与否看不出差别");

  commitEntityImport(
    scratch,
    "rooms",
    `id,stageId,name,roomType,capacity,active\n${room.id},${room.stageId},改名教室,${room.roomType},60,是`,
    { termId: t.id },
  );
  const after = scratch.rooms.find((r) => r.id === room.id);
  assert.equal(after.name, "改名教室");
  assert.equal(after.capacity, 60);
  assert.equal(after.qrCode, qr, "二维码贴纸已经贴在门上了，导入改名不能把它换掉");
  assert.equal(after.displayKey, key, "门牌屏编号同理，换了屏幕就点不亮");
}

// ---------------------------------------------------------------------------
// 10. 科目导入：ID 规范，单价变动给出提示但不阻断
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();

  const badId = previewEntityImport(scratch, "subjects", "id,name,lessonRate\n语文,语文,80", {
    includeAllRows: true,
  });
  assert.equal(badId.canImport, false);
  assert.match(badId.errors[0].message, /英文字母/, "科目 ID 会进课次与工资明细，必须限制为英文标识");

  const chinese = scratch.subjects.find((s) => s.id === "chinese");
  const rate = previewEntityImport(scratch, "subjects", `id,name,lessonRate\nchinese,${chinese.name},999`, {
    includeAllRows: true,
  });
  assert.equal(rate.canImport, true, "单价变动不应阻断导入");
  assert.ok(
    rate.warnings.some((w) => /薪资配置/.test(w.message)),
    "应说明该字段仅供参考、实际课时费另有出处，否则会被当成改了工资",
  );

  // 科目是全校共用的，不带学期后缀
  commitEntityImport(scratch, "subjects", "id,name,lessonRate\nastronomy,天文,60", {});
  const created = scratch.subjects.find((s) => s.id === "astronomy");
  assert.ok(created, "新科目应已写入");
  assert.equal(created.id, "astronomy", "科目 ID 不应被加学期后缀");
  assert.equal(created.lessonRate, 60);
}

// ---------------------------------------------------------------------------
// 11. 导入模板：表头齐全，说明行标注了必填
// ---------------------------------------------------------------------------
{
  for (const entity of ["classes", "rooms", "subjects"]) {
    const tpl = exportEntityTemplate(entity);
    const [header, note] = tpl.content.split("\n");
    assert.ok(header.includes("stageId") || header.includes("id"), `${entity} 模板应含字段名`);
    assert.match(note, /必填/, `${entity} 模板说明行应标出必填字段`);
    assert.equal(header.split(",").length, note.split(",").length, "说明行列数应与表头一致");
  }
}

// ---------------------------------------------------------------------------
// 12. 教学资源台账（验收 2.4）：筛选、闲置识别、导出
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];
  const rooms = scratch.rooms.filter((r) => r.termId === t.id);
  const used = rooms[0];
  scratch.lessonInstances = [
    { id: "L1", termId: t.id, roomId: used.id, classId: "C", teacherId: "T0001", date: "2026-06-15", time: "08:00-08:40", status: "completed", units: 1 },
    { id: "L2", termId: t.id, roomId: used.id, classId: "C", teacherId: "T0001", date: "2026-06-16", time: "08:00-08:40", status: "completed", units: 1 },
    // 已取消的课不算占用
    { id: "L3", termId: t.id, roomId: rooms[1].id, classId: "C", teacherId: "T0001", date: "2026-06-17", time: "08:00-08:40", status: "cancelled", units: 1 },
  ];

  const ledger = buildResourceLedger(scratch, { termId: t.id });
  assert.equal(ledger.rows.length, rooms.length);
  const usedRow = ledger.rows.find((r) => r.id === used.id);
  assert.equal(usedRow.lessonCount, 2);
  assert.equal(usedRow.idle, false);
  const cancelledRow = ledger.rows.find((r) => r.id === rooms[1].id);
  assert.equal(cancelledRow.lessonCount, 0, "已取消的课不应算作教室占用");
  assert.equal(cancelledRow.idle, true);
  assert.ok(ledger.totals.idleCount > 0);

  // 使用班级要能看出来
  assert.ok(
    ledger.rows.some((r) => r.holderNames),
    "台账应显示教室归哪个班使用",
  );

  // 筛选
  const primaryOnly = buildResourceLedger(scratch, { termId: t.id, stageId: "primary" });
  assert.ok(primaryOnly.rows.length > 0);
  assert.ok(primaryOnly.rows.every((r) => r.stageId === "primary"), "按学部筛选不应混入他部教室");

  const labs = buildResourceLedger(scratch, { termId: t.id, roomType: "lab" });
  assert.ok(labs.rows.every((r) => r.roomType === "lab"), "按类型筛选应生效");

  const idleOnly = buildResourceLedger(scratch, { termId: t.id, onlyIdle: true });
  assert.ok(idleOnly.rows.every((r) => r.idle), "仅闲置筛选应生效");
  assert.ok(!idleOnly.rows.some((r) => r.id === used.id), "已排课的教室不应出现在闲置清单");

  const kw = buildResourceLedger(scratch, { termId: t.id, keyword: used.name.slice(0, 4) });
  assert.ok(kw.rows.some((r) => r.id === used.id), "关键字检索应能命中");

  // 导出
  const xls = buildResourceLedgerExcel(ledger, "小学部");
  assert.ok(xls.startsWith("<?xml version"));
  assert.match(xls, /ss:Name="教学资源台账"/);
  assert.match(xls, /<Data ss:Type="Number">2<\/Data>/, "课次应以数值写入，便于学校自行汇总");
  assert.match(xls, /闲置/, "副标题应报告闲置数量");

  const result = exportResourceLedger(scratch, { termId: t.id, stageId: "primary", onlyIdle: true });
  assert.match(result.filename, /\.xls$/);
  assert.equal(result.mimeType, "application/vnd.ms-excel");
  assert.match(result.content, /小学部/, "筛选条件应写在导出的文件上，否则拿到文件的人不知道这是筛过的");
  assert.match(result.content, /仅闲置/);
}

// ---------------------------------------------------------------------------
// 13. 审计日志 ID 必须唯一
//
// 自行按"集合长度 + 变更条数"拼 ID 看着够用，实则连续两次改同样条数就会撞。
// 重复主键会让整批持久化被拒——错在导入，倒下的是整个保存。
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];
  const rooms = scratch.rooms.filter((r) => r.termId === t.id).slice(0, 2);

  // 两次导入，每次都只改 1 条、集合长度不变 —— 拼接式 ID 在这里必然重复
  rooms.forEach((room, i) => {
    commitEntityImport(
      scratch,
      "rooms",
      `id,stageId,name,roomType\n${room.id},${room.stageId},第${i + 1}次改名,${room.roomType}`,
      { termId: t.id },
    );
  });

  const logs = (scratch.auditLogs || []).filter((l) => l.action === "rooms_import");
  assert.equal(logs.length, 2, "两次导入应各留一条审计");
  assert.equal(
    new Set(logs.map((l) => l.id)).size,
    2,
    "审计日志 ID 必须唯一，重复主键会让整批持久化失败",
  );
  assert.ok(logs.every((l) => l.createdAt), "审计应带写入时间，字段名与系统其他审计一致");
  assert.equal(logs[1].updatedCount, 1);
}

// ---------------------------------------------------------------------------
// 14. 预检必须让使用者看见每一条将要发生的变更
//
// 按位置截断（只回前 N 行）会把排在后面的新建行整个藏掉：摘要写着"新建 1 条"，
// 差异表里却一条也没有，教务只能盲签。
// ---------------------------------------------------------------------------
{
  const scratch = freshDb();
  const t = scratch.terms.find((x) => x.current) || scratch.terms[0];
  const full = exportEntityCsv(scratch, "classes", { termId: t.id }).content.split("\n");
  assert.ok(full.length > 30, "样本班级数应远超默认截断行数，否则测不出问题");

  // 新增行故意放在文件末尾
  const csv = [...full, ",primary,6,六年级 88 班,regular,,88,是"].join("\n");
  const preview = previewEntityImport(scratch, "classes", csv, { termId: t.id });

  assert.equal(preview.createCount, 1);
  assert.equal(
    preview.rows.length,
    1,
    "无变化的行不该占用回传名额，只回变更行",
  );
  assert.equal(preview.rows[0].action, "create");
  assert.equal(
    preview.rows[0].name,
    "六年级 88 班",
    "排在最后的新建行也必须出现在差异里，否则摘要与明细对不上",
  );

  // 变更行数与摘要必须一致
  const shown = preview.rows.filter((r) => r.action !== "unchanged").length;
  assert.equal(shown, preview.createCount + preview.updateCount, "差异行数应等于新建数 + 更新数");
}

console.log("data porting checks passed");
