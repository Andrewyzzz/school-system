// 审计报表批量导出（验收 8.16「支持批量导出审计报表，归档文件可离线保存」）
//
// 验收方式是「现场导出并离线打开」。「离线打开」这四个字决定了两件事：
//   · 格式必须是通用的——离线的意思是没有本系统，只有 Excel 或 WPS
//   · 内容必须自解释——键名 roster_export 在系统里能翻译成「导出花名册」，
//     离线打开时没有东西可以翻译它
//
// 归档件是给几年后的人看的，那时候可能连这套系统都不在了。
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { AUDIT_ACTION_LABELS, buildAuditReport, collectAuditReport } from "../server/auditReport.js";
import { appendHrAuditLog } from "../server/hr.js";
import { initializeLedger, transitionLedger } from "../server/ledgers.js";
import { appendAuditLog, createInitialData, normalizeDatabase } from "../server/storage.js";

function seed() {
  const db = createInitialData({ teacherCount: 8 });
  normalizeDatabase(db);
  const target = db.employees[0];

  appendHrAuditLog(db, {
    actorName: "王人事",
    action: "employee_update",
    targetType: "employee",
    targetEmployeeId: target.id,
    fieldDiffs: [{ field: "phone", before: "139****1234", after: "138****5678" }],
    reason: "本人申请变更联系方式",
    context: { clientIp: "10.0.0.8" },
  });
  appendHrAuditLog(db, {
    actorName: "王人事",
    action: "sensitive_view",
    targetType: "employee",
    targetEmployeeId: target.id,
    reason: "核对社保申报材料",
    context: { clientIp: "10.0.0.8" },
  });
  appendAuditLog(db, { action: "data_import", actorName: "李教务", detail: "导入班级 42 条" });

  initializeLedger(db, { type: "payroll", period: "2026-06" }, { name: "陈财务" });
  transitionLedger(
    db,
    { type: "payroll", period: "2026-06", to: "locked", reason: "6 月工资审批通过" },
    { name: "陈财务" },
  );
  return { db, target };
}

// ---------------------------------------------------------------------------
// 1. 三类记录都要在，而且分表
// ---------------------------------------------------------------------------
{
  const { db } = seed();
  const data = collectAuditReport(db);
  assert.equal(data.hr.length, 2, "人事审计应有 2 条");
  assert.equal(data.system.length, 1, "系统审计应有 1 条");
  assert.equal(data.ledgers.length, 1, "账套操作应有 1 条");

  const report = buildAuditReport(db, { actorName: "张管理员", exportedAt: "2026-08-31T10:00:00.000Z" });
  const sheetNames = [...report.content.matchAll(/<Worksheet ss:Name="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(
    sheetNames,
    ["说明", "人事审计", "系统审计", "账套操作"],
    "四张表：说明 + 三类记录。合并成一张会有一半格子是空的",
  );
  assert.equal(report.total, 4);
}

// ---------------------------------------------------------------------------
// 2. 离线打得开：必须是 Excel 认的格式
// ---------------------------------------------------------------------------
{
  const { db } = seed();
  const report = buildAuditReport(db, { exportedAt: "2026-08-31T10:00:00.000Z" });
  assert.match(report.content, /^<\?xml/, "应为 XML 声明开头的 SpreadsheetML");
  assert.match(report.content, /xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"/, "缺命名空间 Excel 打不开");
  assert.match(report.filename, /\.xls$/, "扩展名要让系统认得出用什么打开");
  assert.equal(report.mimeType, "application/vnd.ms-excel");
  // 文件名里不能有 Windows 不允许的字符，否则下载下来就打不开
  assert.ok(!/[\\/:*?"<>|]/.test(report.filename), `文件名含非法字符：${report.filename}`);
}

// ---------------------------------------------------------------------------
// 3. 离线看得懂：不能出现只有系统认得的键名
//
// 这是「离线打开」真正的考验。roster_export、employee_update、personName
// 这些在界面上会被翻译，但导出的文件里没有翻译器。
// ---------------------------------------------------------------------------
{
  const { db } = seed();
  const report = buildAuditReport(db, { exportedAt: "2026-08-31T10:00:00.000Z" });

  assert.match(report.content, /修改人事档案/, "操作名应译成中文");
  assert.match(report.content, /查看敏感字段/, "查看敏感字段的记录应译成中文");
  assert.match(report.content, /手机号/, "字段名应译成中文");
  assert.ok(!/employee_update/.test(report.content), "导出文件里不应出现 employee_update 这样的键名");
  assert.ok(!/sensitive_view/.test(report.content), "不应出现 sensitive_view");
  assert.ok(!/>personName</.test(report.content), "不应出现 personName");

  // 对象列要写人名，不是内部 ID
  const { target } = seed();
  const data = collectAuditReport(seed().db);
  assert.equal(data.hr[0].对象, target.personName || target.name, "对象列应显示姓名而不是员工 ID");

  // 改了什么要能读
  assert.match(data.hr[0].改了什么, /手机号：139\*{4}1234 → 138\*{4}5678/, "字段变更要写成人能读的一句话");
}

// ---------------------------------------------------------------------------
// 4. 说明页：归档件要能自证是什么
//
// 几年后从档案柜里翻出一个 xls，得知道它是什么范围、谁导的、什么时候导的。
// 没有这一页，它跟一堆行号没区别。
// ---------------------------------------------------------------------------
{
  const { db } = seed();
  const report = buildAuditReport(db, {
    actorName: "张管理员",
    from: "2026-06-01",
    to: "2026-08-31",
    exportedAt: "2026-08-31T10:00:00.000Z",
  });
  ["8.16", "张管理员", "2026-06-01", "2026-08-31", "只可追加"].forEach((needle) => {
    assert.ok(report.content.includes(needle), `说明页应包含「${needle}」`);
  });
}

// ---------------------------------------------------------------------------
// 5. 时间范围：截止日期要覆盖当天，不能把当天整天漏掉
//
// createdAt 是 ISO 时间戳（2026-08-31T14:20:00Z），to 传的是日期（2026-08-31）。
// 直接比大小会把 8 月 31 日当天的记录全部排除——而用户以为自己导的是「到 8 月底」。
// ---------------------------------------------------------------------------
{
  const db = createInitialData({ teacherCount: 3 });
  normalizeDatabase(db);
  appendHrAuditLog(db, { actorName: "甲", action: "employee_update", targetEmployeeId: db.employees[0].id });
  // 手工把时间改成当天下午
  db.hrAuditLogs[0].createdAt = "2026-08-31T14:20:00.000Z";

  assert.equal(
    collectAuditReport(db, { to: "2026-08-31" }).hr.length,
    1,
    "截止日期 2026-08-31 应包含当天下午的记录，否则「导出到 8 月底」会漏掉整个 31 号",
  );
  assert.equal(collectAuditReport(db, { to: "2026-08-30" }).hr.length, 0, "8-30 截止不应包含 8-31 的记录");
  assert.equal(collectAuditReport(db, { from: "2026-09-01" }).hr.length, 0, "起始日期之后的才算");
  assert.equal(collectAuditReport(db, { from: "2026-08-01" }).hr.length, 1);
}

// ---------------------------------------------------------------------------
// 6. 导出不能成为绕过数据权限的后门
//
// 学部负责人在界面上只看得到本学部的人事审计。如果导出给的是全校，
// 那这个权限控制就只是界面上的装饰。
// ---------------------------------------------------------------------------
{
  const { db } = seed();
  const target = db.employees[0];
  // 造一个只包含别的学部的 scope
  const otherUnit = (db.orgUnits || []).find((u) => u.id !== target.orgUnitId) || { id: "OTHER" };
  const scope = { orgUnitIds: new Set([otherUnit.id]) };

  const scoped = collectAuditReport(db, { scope });
  assert.equal(scoped.hr.length, 0, "范围外的人事审计不应出现在导出里");
  assert.equal(scoped.system.length, 0, "学部负责人不应导出全校范围的系统审计");
  assert.equal(scoped.ledgers.length, 0, "学部负责人不应导出账套操作记录");

  // 本学部的能看到
  const own = collectAuditReport(db, { scope: { orgUnitIds: new Set([target.orgUnitId]) } });
  assert.equal(own.hr.length, 2, "本学部的人事审计应能导出");
}

// ---------------------------------------------------------------------------
// 7. 空报表也要出文件
// ---------------------------------------------------------------------------
{
  const db = createInitialData({ teacherCount: 3 });
  normalizeDatabase(db);
  const report = buildAuditReport(db, { exportedAt: "2026-08-31T10:00:00.000Z" });
  assert.equal(report.total, 0);
  assert.match(report.content, /没有记录/, "空表要写明「没有记录」，而不是给一张空白表让人以为坏了");
  const sheetNames = [...report.content.matchAll(/<Worksheet ss:Name="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(sheetNames.length, 4, "没有数据时四张表仍然都要在");
}

// ---------------------------------------------------------------------------
// 8. 接口与界面接得上
// ---------------------------------------------------------------------------
{
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  const app = await fs.readFile(new URL("../app.js", import.meta.url), "utf-8");
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");

  assert.match(server, /url\.pathname === "\/api\/audit-report"/, "应有审计报表导出接口");
  assert.match(app, /\/api\/audit-report/, "界面应能调用它，否则 8.16 只能靠命令行演示");
  assert.match(html, /id="auditReportExport"/, "应有导出按钮");
  assert.match(app, /导出审计报表/, "导出动作应有中文提示");

  // 导出这个动作本身要留痕——报表里有全校的操作记录
  const block = server.slice(server.indexOf('url.pathname === "/api/audit-report"'));
  const route = block.slice(0, block.indexOf("\n    // 对账"));
  assert.match(route, /appendAuditLog/, "导出审计报表本身也要写进审计");
  assert.match(route, /division_head.*hrScopeFor|hrScopeFor/s, "学部负责人导出要按可见范围裁剪");

  // 每个已知操作都有中文对照
  Object.entries(AUDIT_ACTION_LABELS).forEach(([key, label]) => {
    assert.ok(label && !/[a-z_]{4,}/.test(label), `${key} 的中文对照不合法：${label}`);
  });
}

console.log("audit report checks passed");
