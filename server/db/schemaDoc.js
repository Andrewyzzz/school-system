// 数据库设计文档生成（验收 7.3 / 7.4 / 9.7）
//
// 7.3 要 ER 图与各业务表结构说明，7.4 要标注字段用途、数据类型、约束条件。
//
// 为什么是**生成**而不是手写：
//
// 这套系统用文档式存储（app_<集合> 表只有 id / seq / data jsonb 四列），
// 字段定义散在代码与数据里，没有列级 schema 可直接导出。手写一份字段字典，
// 下次加个字段就过时了——而校方查阅时看到过时的文档，比没有文档更糟：
// 他会以为那就是现状，然后按错误的理解去验收。
//
// 所以机械的部分（字段名、类型、出现率、约束、索引）从真实数据与
// constraints.js 推导，每次执行都反映当前状态；业务含义（这张表是干什么的、
// 这个字段代表什么）没法从数据推断，单独维护在下面的注解表里。
//
// 两者的分工是刻意的：注解漏了会明显看出来（字段旁边空着），
// 而机械部分永远不会说谎。

import { FOREIGN_KEYS, INDEXES, columnOf, indexOf, tableOf } from "./constraints.js";
import { LEDGER_TYPES, UNLOADABLE_COLLECTIONS } from "../ledgers.js";
import { SENSITIVE_COLLECTIONS, APPEND_ONLY_COLLECTIONS } from "./roles.js";

// ---------------------------------------------------------------------------
// 业务含义注解——这部分必须人工维护，数据里推断不出来
// ---------------------------------------------------------------------------

export const COLLECTION_NOTES = {
  // 人事域
  employees: { domain: "人事", label: "教职工档案", note: "全校教职工的主档案，含基础信息、组织归属、岗位、证件与银行卡（加密存储）" },
  employeeContracts: { domain: "人事", label: "劳动合同", note: "合同期限、类型与续签记录，一名员工可有多份" },
  hrFlows: { domain: "人事", label: "人事异动流程", note: "入职、调岗、离职等异动的审批实例" },
  hrFlowSteps: { domain: "人事", label: "异动流程节点", note: "异动流程的各审批环节与处理结果" },
  hrAuditLogs: { domain: "人事", label: "人事审计日志", note: "人事数据的变更留痕，只追加不可改删" },
  hrAttachments: { domain: "人事", label: "证件附件", note: "身份证、学历证等扫描件的元数据；文件本身加密存放在磁盘" },
  hrSalaryRecords: { domain: "人事", label: "薪资异动记录", note: "调薪、职称变动等对薪资标准的历史调整" },
  orgUnits: { domain: "人事", label: "组织架构", note: "总校—学部—处室的树形结构，决定数据可见范围" },
  positions: { domain: "人事", label: "岗位", note: "岗位定义与岗位序列，决定薪资标准的适用口径" },
  salaryTemplates: { domain: "人事", label: "薪资模板", note: "按岗位定义的薪资标准模板" },
  salaryTemplateVersions: { domain: "人事", label: "薪资模板版本", note: "模板的历史版本，保证往期工资可复算" },
  assessments: { domain: "人事", label: "考核记录", note: "月度/学期考核结果，影响考核绩效工资" },

  // 排课域
  teachers: { domain: "排课", label: "教师", note: "排课与工资共用的教师主数据，与人事档案通过 teacherId 关联" },
  classes: { domain: "排课", label: "班级", note: "按学期存放；跨学期的同名班级 ID 带学期后缀以避免主键冲突" },
  rooms: { domain: "排课", label: "教室", note: "按学期存放；二维码沿用不带学期后缀的物理编号，保证门牌贴纸跨学期可用" },
  subjects: { domain: "排课", label: "科目", note: "全校共用，不按学期划分" },
  stages: { domain: "排课", label: "学部", note: "小学部/初中部/高中部，是权限与薪资口径的划分依据" },
  terms: { domain: "排课", label: "学期", note: "学期起止与状态，是排课账套的期间标识" },
  lessonInstances: { domain: "排课", label: "课次", note: "每一节课的实例，含签到签退与状态；按年无界增长，是数据量最大的表" },
  scheduleDrafts: { domain: "排课", label: "排课草稿", note: "求解器生成的候选课表，确认后才发布" },
  scheduleVersions: { domain: "排课", label: "课表版本", note: "已发布课表的快照，支持回滚" },
  scheduleConstraints: { domain: "排课", label: "排课约束", note: "教师、教室、班级的不可用时段与偏好" },
  schedulePeriodTemplates: { domain: "排课", label: "作息模板", note: "各学部的节次时间安排" },
  gradeCourseRules: { domain: "排课", label: "年级课程规则", note: "各年级各科目的周课时数要求" },
  teacherAssignments: { domain: "排课", label: "任课安排", note: "教师与班级科目的对应关系" },
  teacherSchedulingRules: { domain: "排课", label: "教师排课规则", note: "单个教师的排课偏好与限制" },
  teacherScheduleRules: { domain: "排课", label: "教师排课约束", note: "教师维度的不可用时段与连堂限制，排课求解时作为硬约束" },
  roomResourceOverrides: { domain: "排课", label: "教室资源调整", note: "按学期覆盖教室的容量、类型或可用性，不改动教室主档" },
  scheduleChangeRequests: { domain: "排课", label: "调课申请", note: "已发布课表的调整申请，审批通过后由调课引擎更新课表" },

  // 薪资域
  payrollRules: { domain: "薪资", label: "薪资制度", note: "基本工资档、课时费率、津贴标准等全部计薪参数" },
  payrollDetails: { domain: "薪资", label: "工资单", note: "每人每月一条；金额字段加密存储，数据库中不可明文读取" },
  payrollBatches: { domain: "薪资", label: "批量操作记录", note: "批量生成与批量锁定的执行结果" },
  workloadConfirmations: { domain: "薪资", label: "工作量确认", note: "教师对月度课时的确认与异议" },
  termBudgets: { domain: "薪资", label: "学期薪酬预算", note: "由「薪酬总额预算确认」审批落地，按四个财务口径分列；仅作展示，不限制实际发放" },

  // 系统域
  accounts: { domain: "系统", label: "账号", note: "登录账号与角色，口令为散列存储" },
  sessions: { domain: "系统", label: "会话", note: "登录令牌，按 tokenHash 建索引" },
  auditLogs: { domain: "系统", label: "操作审计", note: "应用层操作留痕，只追加不可改删" },
  notifications: { domain: "系统", label: "通知", note: "站内通知，支持按角色广播与按账号定向" },
  oaTemplates: { domain: "系统", label: "审批模板", note: "审批类型定义，含表单字段与审批环节" },
  oaRequests: { domain: "系统", label: "审批单", note: "审批实例，含流转记录与抄送名单" },
  ledgers: { domain: "系统", label: "账套", note: "人事/排课/薪资三类账套的期间、状态与生命周期" },
  reconciliations: { domain: "系统", label: "对账台账", note: "人数与课时的三方对账结果及差异明细" },
};

// 已知枚举：这些字段的合法取值在代码里有定义，不该靠样本数据去猜。
// 样本里全是 active，不代表 status 只能是 active——按数据推断会漏掉
// 那些当前没出现的合法值，而验收要的正是「标注约束条件」。
export const KNOWN_ENUMS = {
  "employees.status": "active 在职 / probation 试用 / left 离职",
  "teachers.status": "active 在职 / archived 已归档",
  "accounts.status": "active 启用 / disabled 停用",
  "accounts.role": "teacher 教师 / admin 教务 / hr 人事 / finance 财务 / division_head 学部负责人 / principal 校领导 / system_admin 行政管理 / classroom 教室屏",
  "terms.status": "active 进行中 / archived 已归档",
  "lessonInstances.status": "scheduled 待上课 / cancelled 已取消（请假未安排代课，不计薪）",
  "lessonInstances.type": "regular 正常课时 / morning 早自习 / evening 晚自习 / weekend 周末补课 / makeup 补课",
  "payrollDetails.status": "generated 待教师确认 / teacher_confirmed 已确认 / disputed 有异议 / reviewed 已复核 / locked 已结算",
  "oaRequests.status": "pending 审批中 / approved 已通过 / rejected 已拒绝 / withdrawn 已撤回",
  "ledgers.status": "initializing 初始化中 / active 使用中 / locked 已锁定 / archived 已归档",
  "ledgers.type": "hr 人事账套 / scheduling 排课课时账套 / payroll 薪资财务账套",
  "rooms.roomType": "homeroom 普通教室 / lab 实验室 / computer 计算机房 / playground 操场 / art 美术室 / music 音乐室",
  "classes.classType": "regular 普通班 / experimental 实验班",
  "orgUnits.type": "school 总校 / division 学部 / department 处室",
};

// 字段级注解：只标注需要解释的字段，通用字段（id/createdAt 等）由推断兜底
export const FIELD_NOTES = {
  id: "主键",
  createdAt: "创建时间",
  updatedAt: "最后更新时间",
  termId: "所属学期，排课账套的期间标识",
  termName: "学期名称（冗余，便于导出时免联表）",
  teacherId: "教师主键，人事/排课/薪资三域的统一关联键（验收 7.5）",
  employeeId: "人事档案主键",
  month: "结算月份 YYYY-MM，薪资账套的期间标识",
  stageId: "学部：primary 小学 / middle 初中 / high 高中",
  status: "状态，取值随业务而定",
  idCardEncrypted: "身份证号密文（AES-256-GCM）",
  idCardMasked: "身份证号掩码，用于展示",
  bankCardEncrypted: "银行卡号密文（AES-256-GCM）",
  bankCardMasked: "银行卡号掩码，用于展示",
  encryptedPayload: "工资金额密文，含汇总、明细与逐课时快照",
  passwordHash: "口令散列，不可逆",
  tokenHash: "会话令牌散列",
  financeScope: "财务管辖范围：primary/middle/high/headquarters",
  scopeStageIds: "数据可见的学部范围",
  qualificationGrade: "职称档，决定基本工资标准",
  assessmentBand: "考核档，决定考核绩效标准",
  hiredAt: "入职日期，用于推算校龄",
  leftAt: "离职日期",
  seq: "行序，用于还原数组顺序",
};

// ---------------------------------------------------------------------------
// 从真实数据推断字段
// ---------------------------------------------------------------------------

function inferType(values) {
  const kinds = new Set();
  values.forEach((v) => {
    if (v === null || v === undefined) return;
    if (Array.isArray(v)) kinds.add("数组");
    else if (typeof v === "object") kinds.add("对象");
    else if (typeof v === "boolean") kinds.add("布尔");
    else if (typeof v === "number") kinds.add("数字");
    else if (typeof v === "string") {
      if (/^\d{4}-\d{2}-\d{2}T/.test(v)) kinds.add("时间戳");
      else if (/^\d{4}-\d{2}-\d{2}$/.test(v)) kinds.add("日期");
      else if (/^\d{4}-\d{2}$/.test(v)) kinds.add("月份");
      else kinds.add("字符串");
    }
  });
  if (kinds.size === 0) return "（无样本）";
  // 日期/月份都是字符串的特化，同时出现时报更具体的那个
  if (kinds.size > 1 && kinds.has("字符串")) {
    const specific = [...kinds].filter((k) => k !== "字符串");
    if (specific.every((k) => ["日期", "月份", "时间戳"].includes(k))) return specific.join(" / ");
  }
  return [...kinds].join(" / ");
}

function sampleOf(values) {
  const v = values.find((x) => x !== null && x !== undefined && x !== "");
  if (v === undefined) return "";
  if (typeof v === "object") return Array.isArray(v) ? `[${v.length} 项]` : "{…}";
  const text = String(v);
  return text.length > 28 ? `${text.slice(0, 28)}…` : text;
}

/**
 * 枚举值：取值少且都是短字符串时列出来，这对验收「标注约束条件」很关键。
 *
 * 但要防一类误导：日期、月份、ID 这些字段在小样本里也只有几个不同的值，
 * 列出来会让读者以为「这个字段只能取这几个」。样本数据是几天的课次，
 * 不代表 date 字段只有那五天。所以按类型排除掉这类字段。
 */
function enumOf(values, type) {
  if (/日期|月份|时间戳|数字/.test(type)) return "";
  const strings = values.filter((v) => typeof v === "string" && v && v.length <= 24);
  if (strings.length < values.length * 0.8) return "";
  const distinct = [...new Set(strings)];
  if (distinct.length === 0 || distinct.length > 8) return "";
  // 每行都不同 → 是标识符不是枚举
  if (distinct.length === values.filter(Boolean).length && distinct.length > 3) return "";
  // 样本太小时不足以判断是不是枚举：3 行数据里有 3 个值，说明不了任何事
  if (values.length < 10) return "";
  return distinct.join(" / ");
}

const SENSITIVE_FIELD_HINT = /Encrypted$|passwordHash|tokenHash|encryptedPayload/;

export function describeCollection(collectionKey, rows, options = {}) {
  const { sampleSize = 500 } = options;
  const sample = rows.slice(0, sampleSize);
  const total = sample.length;

  const fieldValues = new Map();
  sample.forEach((row) => {
    Object.entries(row || {}).forEach(([key, value]) => {
      if (!fieldValues.has(key)) fieldValues.set(key, []);
      fieldValues.get(key).push(value);
    });
  });

  const fkByField = new Map(
    FOREIGN_KEYS.filter((fk) => fk.child === collectionKey).map((fk) => [fk.field, fk]),
  );
  const indexedFields = new Set(
    INDEXES.filter((i) => i.collection === collectionKey).map((i) => i.field),
  );

  const fields = [...fieldValues.entries()]
    .map(([name, values]) => {
      const present = values.filter((v) => v !== null && v !== undefined && v !== "").length;
      const fk = fkByField.get(name);
      const constraints = [];
      if (name === "id") constraints.push("主键");
      if (fk) constraints.push(`外键 → ${fk.parent}（${fk.onDelete}）`);
      if (indexedFields.has(name)) constraints.push("已建索引");
      if (present === total && total > 0) constraints.push("必填");
      if (SENSITIVE_FIELD_HINT.test(name)) constraints.push("加密存储");

      return {
        name,
        type: inferType(values),
        presence: total ? Math.round((present / total) * 100) : 0,
        note: FIELD_NOTES[name] || "",
        enumValues: SENSITIVE_FIELD_HINT.test(name)
          ? ""
          : KNOWN_ENUMS[`${collectionKey}.${name}`] || enumOf(values, inferType(values)),
        // 敏感字段不出样例——设计文档会被打印、传阅、附在验收材料里
        sample: SENSITIVE_FIELD_HINT.test(name) ? "（敏感，略）" : sampleOf(values),
        constraints,
      };
    })
    .sort((a, b) => {
      // id 在最前，其余按出现率降序——常用字段排前面更好读
      if (a.name === "id") return -1;
      if (b.name === "id") return 1;
      return b.presence - a.presence || a.name.localeCompare(b.name);
    });

  const meta = COLLECTION_NOTES[collectionKey] || {};
  return {
    key: collectionKey,
    table: tableOf(collectionKey).replace(/^"|"$/g, ""),
    domain: meta.domain || "其他",
    label: meta.label || collectionKey,
    note: meta.note || "",
    rowCount: rows.length,
    sampled: total,
    fields,
    sensitive: SENSITIVE_COLLECTIONS.includes(collectionKey),
    appendOnly: APPEND_ONLY_COLLECTIONS.includes(collectionKey),
    unloadable: Boolean(UNLOADABLE_COLLECTIONS[collectionKey]),
    ledgerType: Object.entries(LEDGER_TYPES).find(([, spec]) => spec.collections.includes(collectionKey))?.[0] || "",
  };
}

/** Mermaid ER 图。只画有外键关系的表，全画会糊成一团没法看 */
export function buildErDiagram(descriptions) {
  const involved = new Set();
  FOREIGN_KEYS.forEach((fk) => {
    involved.add(fk.child);
    involved.add(fk.parent);
  });

  const lines = ["erDiagram"];
  [...involved].sort().forEach((key) => {
    const desc = descriptions.find((d) => d.key === key);
    const label = desc ? `${desc.label}` : key;
    // 只列关键字段：ER 图上塞 30 个字段没人看得清
    const keyFields = (desc?.fields || [])
      .filter((f) => f.name === "id" || f.constraints.some((c) => c.startsWith("外键")))
      .slice(0, 6);
    lines.push(`  ${key} {`);
    lines.push(`    string id PK "${label}"`);
    keyFields
      .filter((f) => f.name !== "id")
      .forEach((f) => lines.push(`    string ${f.name} FK`));
    lines.push("  }");
  });

  FOREIGN_KEYS.forEach((fk) => {
    // 一对多：一个学期有多个班级
    lines.push(`  ${fk.parent} ||--o{ ${fk.child} : "${fk.field}"`);
  });
  return lines.join("\n");
}

export function buildSchemaDoc(db, options = {}) {
  const { generatedAt = new Date().toISOString() } = options;
  const keys = Object.keys(db)
    .filter((k) => Array.isArray(db[k]))
    .sort();
  const descriptions = keys.map((k) => describeCollection(k, db[k], options));
  return { generatedAt, descriptions, foreignKeys: FOREIGN_KEYS, indexes: INDEXES };
}
