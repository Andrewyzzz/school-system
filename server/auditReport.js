// 审计报表批量导出（验收 8.16「支持批量导出审计报表，归档文件可离线保存」）
//
// 验收方式是「现场导出并离线打开」，所以有两条硬要求：
//   · 打得开——不能是只有本系统认得的格式。用 SpreadsheetML，Excel 和 WPS
//     双击就开，不装任何东西。
//   · 看得懂——离线打开时没有系统可以查，列名、操作名、字段名必须是中文，
//     不能是 roster_export 这种键名。归档文件是给几年后的人看的，
//     那时候可能连这套系统都不在了。
//
// 三个来源分三张表，不合并：人事审计记的是「谁改了谁的档案」，系统审计记的是
// 「谁做了什么操作」，账套操作记的是「哪个账套什么时候被锁被解」。
// 三者的列完全不同，硬拼成一张表会有一半格子是空的。
import { buildWorkbook, cell, exportFilename, row } from "./excel.js";
import { LEDGER_STATUSES, LEDGER_TYPES, typeLabel } from "./ledgers.js";

// 操作名的中文对照。离线打开时没有系统可查，键名等于没写。
export const AUDIT_ACTION_LABELS = {
  employee_create: "新建人事档案",
  employee_update: "修改人事档案",
  employee_status: "变更人事状态",
  sensitive_view: "查看敏感字段",
  roster_export: "导出花名册",
  attachment_upload: "上传证件附件",
  attachment_download: "下载证件附件",
  contract_create: "新增合同",
  salary_template_create: "新建薪资模板",
  salary_template_version: "发布模板版本",
  salary_template_apply: "批量应用模板",
  org_unit_create: "新建组织单元",
  position_create: "新建岗位",
  flow_create: "发起人事流程",
  flow_approve: "审批人事流程",
  data_import: "批量导入基础数据",
  payroll_lock: "锁定工资",
  payroll_unlock: "解锁工资",
  ledger_transition: "账套状态变更",
  ledger_unlock: "账套解锁",
  ledger_import: "账套导入恢复",
};

export function actionLabel(action) {
  return AUDIT_ACTION_LABELS[action] || String(action || "");
}

// 字段名的中文对照，用于人事审计的「改了什么」一列
const FIELD_LABELS = {
  personName: "姓名",
  employeeNo: "工号",
  phone: "手机号",
  hiredAt: "入职日期",
  leftAt: "离职日期",
  status: "人事状态",
  orgUnitId: "组织单元",
  titleGrade: "职称档",
  educationLevel: "学历",
  idCardEncrypted: "身份证号",
  bankCardEncrypted: "银行卡号",
  teacherId: "关联教师",
};

function fieldLabel(field) {
  return FIELD_LABELS[field] || String(field || "");
}

/** 把字段级 diff 压成一段人能读的话 */
function describeDiffs(diffs = []) {
  if (!Array.isArray(diffs) || !diffs.length) return "";
  return diffs
    .map((d) => `${fieldLabel(d.field)}：${d.before === "" ? "（空）" : d.before} → ${d.after === "" ? "（空）" : d.after}`)
    .join("；");
}

function inRange(iso, from, to) {
  const at = String(iso || "");
  if (from && at < from) return false;
  // to 传的是日期（2026-08-31），要覆盖到当天 23:59:59，
  // 否则「导出 8 月」会把 8 月 31 日整天漏掉
  if (to && at > `${to}T23:59:59.999Z`) return false;
  return true;
}

/**
 * 汇总要导出的审计数据。
 *
 * scope 传学部负责人的可见范围时，人事审计按目标员工过滤——
 * 导出不能成为绕过数据权限的后门：界面上看不到的记录，导出也不能有。
 */
export function collectAuditReport(db, options = {}) {
  const { from = "", to = "", action = "", scope = null } = options;

  const scopedEmployeeIds = scope
    ? new Set((db.employees || []).filter((e) => scope.orgUnitIds.has(e.orgUnitId)).map((e) => e.id))
    : null;

  const employeeName = new Map((db.employees || []).map((e) => [e.id, e.personName || e.name || e.id]));

  const hr = (db.hrAuditLogs || [])
    .filter((entry) => {
      if (scopedEmployeeIds && (!entry.targetEmployeeId || !scopedEmployeeIds.has(entry.targetEmployeeId))) {
        return false;
      }
      if (action && entry.action !== action) return false;
      return inRange(entry.createdAt, from, to);
    })
    .map((entry) => ({
      时间: entry.createdAt,
      操作人: entry.actorName,
      操作: actionLabel(entry.action),
      对象类型: entry.targetType,
      对象: employeeName.get(entry.targetEmployeeId) || entry.targetId || "",
      改了什么: describeDiffs(entry.fieldDiffs),
      原因: entry.reason,
      来源IP: entry.clientIp,
    }));

  // 系统审计：学部负责人看不到（它记的是全校范围的系统操作）
  const system = scope
    ? []
    : (db.auditLogs || [])
        .filter((entry) => {
          if (action && entry.action !== action) return false;
          return inRange(entry.createdAt, from, to);
        })
        .map((entry) => ({
          时间: entry.createdAt,
          操作人: entry.actorName,
          操作: actionLabel(entry.action),
          对象: entry.targetId || entry.target || "",
          说明: entry.detail || entry.summary || entry.reason || "",
        }));

  // 账套操作史：8.10 要「查看日志」，这张表就是那份日志
  const ledgers = scope
    ? []
    : (db.ledgers || [])
        .filter((l) => inRange(l.lockedAt || l.archivedAt || l.createdAt, from, to))
        .map((l) => ({
          账套类型: typeLabel(l.type),
          期间: l.periodLabel || l.period,
          当前状态: LEDGER_STATUSES[l.status]?.label || l.status,
          建立时间: l.createdAt,
          建立人: l.createdByName,
          锁定时间: l.lockedAt || "",
          锁定人: l.lockedByName || "",
          归档时间: l.archivedAt || "",
          归档人: l.archivedByName || "",
          解锁次数: Number(l.unlockCount || 0),
          最近解锁时间: l.unlockedAt || "",
          最近解锁人: l.unlockedByName || "",
          最近解锁原因: l.unlockReason || "",
          解锁审批单: l.unlockRequestId || "",
        }));

  return { hr, system, ledgers };
}

const HR_COLUMNS = [
  { key: "时间", width: 160 },
  { key: "操作人", width: 90 },
  { key: "操作", width: 120 },
  { key: "对象类型", width: 80 },
  { key: "对象", width: 100 },
  { key: "改了什么", width: 320 },
  { key: "原因", width: 200 },
  { key: "来源IP", width: 110 },
];

const SYSTEM_COLUMNS = [
  { key: "时间", width: 160 },
  { key: "操作人", width: 90 },
  { key: "操作", width: 140 },
  { key: "对象", width: 140 },
  { key: "说明", width: 320 },
];

const LEDGER_COLUMNS = [
  { key: "账套类型", width: 120 },
  { key: "期间", width: 110 },
  { key: "当前状态", width: 80 },
  { key: "建立时间", width: 160 },
  { key: "建立人", width: 90 },
  { key: "锁定时间", width: 160 },
  { key: "锁定人", width: 90 },
  { key: "归档时间", width: 160 },
  { key: "归档人", width: 90 },
  { key: "解锁次数", width: 70, type: "number" },
  { key: "最近解锁时间", width: 160 },
  { key: "最近解锁人", width: 90 },
  { key: "最近解锁原因", width: 240 },
  { key: "解锁审批单", width: 120 },
];

function sheet(name, title, columns, records, subtitle) {
  const header = row(columns.map((c) => cell(c.key, "head")));
  const body = records.map((record) =>
    row(columns.map((c) => cell(record[c.key] ?? "", c.type === "number" ? "number" : "cell"))),
  );
  // 一条都没有时也要出这张表，并且写清楚是「没有记录」而不是表坏了
  const rows = body.length ? [header, ...body] : [header, row([cell("（此范围内没有记录）", "cell")])];
  return { name, title, subtitle, columns: columns.map((c) => c.width), rows, freezeRows: 1 };
}

/**
 * 生成审计报表工作簿（8.16）。
 *
 * 空表也要出：导出后发现是空的，和「导出失败」是两件事，
 * 但如果直接不给文件，操作的人分不清是哪一种。
 */
export function buildAuditReport(db, options = {}) {
  const { from = "", to = "" } = options;
  const data = collectAuditReport(db, options);

  const subtitle = `范围：${from || "最早"} 至 ${to || "最新"}　导出时间：${options.exportedAt || new Date().toISOString()}`;
  const sheets = [
    sheet("人事审计", "人事审计记录", HR_COLUMNS, data.hr, subtitle),
    sheet("系统审计", "系统操作审计", SYSTEM_COLUMNS, data.system, subtitle),
    sheet("账套操作", "账套操作与解锁记录", LEDGER_COLUMNS, data.ledgers, subtitle),
  ];

  // 说明页：归档文件几年后被翻出来，得知道它是什么、什么范围、谁导的。
  // 没有这一页，一个叫「审计报表.xls」的文件跟一堆行号没区别。
  const meta = [
    ["报表名称", "审计报表"],
    ["对应验收项", "8.16 批量导出审计报表，归档文件可离线保存"],
    ["导出时间", options.exportedAt || new Date().toISOString()],
    ["导出人", options.actorName || ""],
    ["时间范围", from || to ? `${from || "最早"} 至 ${to || "最新"}` : "全部"],
    ["操作类型筛选", options.action ? actionLabel(options.action) : "全部"],
    ["人事审计条数", String(data.hr.length)],
    ["系统审计条数", String(data.system.length)],
    ["账套记录条数", String(data.ledgers.length)],
    ["说明", "本报表为只读归档件。审计记录在系统中只可追加，不可修改或删除。"],
  ];
  sheets.unshift({
    name: "说明",
    title: "审计报表",
    columns: [140, 420],
    rows: meta.map(([k, v]) => row([cell(k, "head"), cell(v, "cell")])),
    freezeRows: 0,
  });

  return {
    content: buildWorkbook(sheets),
    filename: exportFilename(["审计报表", from || "全部", to || ""], "xls"),
    mimeType: "application/vnd.ms-excel",
    total: data.hr.length + data.system.length + data.ledgers.length,
    counts: { hr: data.hr.length, system: data.system.length, ledgers: data.ledgers.length },
  };
}

export const AUDIT_REPORT_TYPES = Object.keys(LEDGER_TYPES);
