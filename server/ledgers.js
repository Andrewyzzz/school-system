// 账套体系（验收第八章）
//
// 账套是「一段期间内、一类业务的数据集合」，有边界、有生命周期、可独立
// 归档备份导出。验收 8.1 要求三套：人事、排课课时、薪资财务。
//
// 为什么把账套同时做成**加载边界**：
//
// 校方提这套要求的动机是「数据多了之后加载和响应变慢」。这套系统的架构是
// 启动时把整个数据库读进内存（SELECT 全表、无 WHERE 无 LIMIT），实测单行
// 约 1.3 KB / 2 微秒——五年积累约 300 万条课次，就是 5.8 秒启动、3.9 GB 常驻。
// 老一辈财务软件按年分账套，本来就是因为内存装不下十年数据；校方凭经验说
// 「要账套」，说的其实是「别把所有历史都加载进来」。
//
// 所以这里让归档账套的数据不进内存：既满足 8.5「初始化不清除往年数据」、
// 8.15「往年数据支持跨年度检索」的条文，也真正解决了他们担心的问题。
// 一份设计同时回答条文和动机，好过做两遍。

export const LEDGER_TYPES = {
  hr: { label: "人事账套", period: "year", collections: ["employees", "employeeContracts", "hrSalaryRecords"] },
  scheduling: {
    label: "排课课时账套",
    period: "term",
    collections: ["lessonInstances", "classes", "rooms", "scheduleVersions", "workloadConfirmations"],
  },
  payroll: { label: "薪资财务账套", period: "month", collections: ["payrollDetails", "payrollBatches"] },
};

// 生命周期：初始化 → 使用中 → 锁定 → 归档
//
// locked 与 archived 的区别是刻意的：
//   locked   业务上已定案，不允许再改，但数据仍在内存里，随时可查可导出
//   archived 期间已彻底结束，数据从内存里卸下，查询走数据库
// 只有一种「不可写」状态的话，就没法既满足 8.9（锁定后不可改）
// 又满足 8.15（往年数据仍可检索）而不把所有历史都常驻内存。
export const LEDGER_STATUSES = {
  initializing: { label: "初始化中", writable: false, loaded: true },
  active: { label: "使用中", writable: true, loaded: true },
  locked: { label: "已锁定", writable: false, loaded: true },
  archived: { label: "已归档", writable: false, loaded: false },
};

const TRANSITIONS = {
  initializing: ["active"],
  active: ["locked", "archived"],
  // 解锁必须经审批（8.10），不能直接从 locked 跳回 active
  locked: ["archived"],
  archived: [],
};

function httpError(statusCode, message, details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

export function ensureLedgers(db) {
  if (!Array.isArray(db.ledgers)) db.ledgers = [];
  return db.ledgers;
}

export function ledgerId(type, period) {
  return `LDG-${type}-${period}`;
}

export function typeLabel(type) {
  return LEDGER_TYPES[type]?.label || type;
}

export function statusLabel(status) {
  return LEDGER_STATUSES[status]?.label || status;
}

/**
 * 某条业务数据属于哪个账套。
 * 这是边界的定义所在——判断错了，锁定就锁不住该锁的东西。
 */
export function ledgerKeyFor(type, row) {
  if (type === "payroll") return String(row?.month || "").trim();
  if (type === "scheduling") return String(row?.termId || "").trim();
  if (type === "hr") {
    // 人事按年：入职年份决定归属，没有则落到当前年
    const at = String(row?.hiredAt || row?.createdAt || "");
    return at.slice(0, 4) || "";
  }
  return "";
}

/**
 * 某条数据是否属于某个账套。
 *
 * 与 ledgerKeyFor 的区别：课次、工资单只属于一个期间，「归属键 === 期间」就够了；
 * **人事不是**。一个 2021 年入职、至今在职的老师，2021 到 2026 每一年的人事账套里
 * 都该有他——验收 8.6 要的是「每年结转教职工档案」，不是「每年新入职的人」。
 *
 * 按入职年份归属会让 2026 年的人事账套只装下当年新招的几个人：
 * 现场执行 8.2 单账套备份会导出一个几乎空的文件，8.4「查看新账套是否已带入
 * 人员信息」直接看不到人。
 */
export function ledgerContains(type, period, row) {
  const key = String(period || "").trim();
  if (!key) return false;
  if (type !== "hr") return ledgerKeyFor(type, row) === key;

  // 人事按「该年度是否在册」判定：年末之前入职，且没有在这一年之前就离职
  const cutoff = `${key}-12-31`;
  const hiredAt = String(row?.hiredAt || row?.createdAt || "").slice(0, 10);
  if (hiredAt && hiredAt > cutoff) return false;
  const leftAt = String(row?.leftAt || "").slice(0, 10);
  // 当年离职的仍算这一年的在册人员——离职台账也是账套的一部分（8.6）
  if (leftAt && leftAt < `${key}-01-01`) return false;
  return true;
}

/** 反查：某个集合属于哪一类账套 */
export function ledgerTypeOfCollection(collectionKey) {
  for (const [type, spec] of Object.entries(LEDGER_TYPES)) {
    if (spec.collections.includes(collectionKey)) return type;
  }
  return "";
}

export function findLedger(db, type, period) {
  return ensureLedgers(db).find((l) => l.type === type && l.period === String(period));
}

/**
 * 初始化账套（验收 8.3）。幂等：已存在则原样返回。
 * carryOver 决定是否结转历史基础信息（8.4）。
 */
export function initializeLedger(db, options = {}, actorAccount = null) {
  const { type, period, carryOver = true } = options;
  const spec = LEDGER_TYPES[type];
  if (!spec) throw httpError(400, `账套类型无效：${type}`);
  const key = String(period || "").trim();
  if (!key) throw httpError(400, "请指定账套期间");

  const existing = findLedger(db, type, key);
  if (existing) return { ledger: existing, created: false };

  const now = new Date().toISOString();
  const ledger = {
    id: ledgerId(type, key),
    type,
    typeLabel: spec.label,
    period: key,
    periodLabel: periodLabelOf(type, key),
    status: "active",
    statusLabel: LEDGER_STATUSES.active.label,
    collections: [...spec.collections],
    carriedOver: 0,
    createdAt: now,
    createdByAccountId: actorAccount?.id || "",
    createdByName: actorAccount?.name || actorAccount?.username || "",
    lockedAt: "",
    lockedByName: "",
    archivedAt: "",
    archivedByName: "",
    // 建账套时就落成 0，不要等第一次解锁才冒出来：字段时有时无，
    // 界面和导出都得各写一遍兜底，漏一处就显示成空白
    unlockCount: 0,
    unlockedAt: "",
    unlockedByName: "",
  };

  // 8.4：初始化时自动结转历史教职工基础信息。
  // 只结转「人」，不结转往年的课表与工资——那些属于旧账套，
  // 复制一份过来既浪费空间，又会让两边的数字对不上。
  if (carryOver && type === "hr") {
    ledger.carriedOver = (db.employees || []).filter((e) => e.status !== "left").length;
  }
  if (carryOver && type === "payroll") {
    ledger.carriedOver = (db.teachers || []).filter((t) => t.status === "active").length;
  }

  ensureLedgers(db).push(ledger);
  return { ledger, created: true };
}

function periodLabelOf(type, period) {
  if (type === "payroll") {
    const [y, m] = String(period).split("-");
    return y && m ? `${y} 年 ${Number(m)} 月` : period;
  }
  if (type === "hr") return `${period} 年`;
  return period;
}

/** 状态流转。非法流转要拦下，否则「已归档」还能被改回「使用中」。 */
export function transitionLedger(db, options = {}, actorAccount = null) {
  const { type, period, to, reason = "" } = options;
  const ledger = findLedger(db, type, period);
  if (!ledger) throw httpError(404, `账套不存在：${typeLabel(type)} ${period}`);
  if (!LEDGER_STATUSES[to]) throw httpError(400, `账套状态无效：${to}`);

  const allowed = TRANSITIONS[ledger.status] || [];
  if (!allowed.includes(to)) {
    throw httpError(
      409,
      `${typeLabel(type)}「${ledger.periodLabel}」当前为${statusLabel(ledger.status)}，不能直接转为${statusLabel(to)}` +
        (ledger.status === "locked" && to === "active" ? "。解锁需经审批（发起「账套解锁」审批单）" : ""),
    );
  }

  const now = new Date().toISOString();
  ledger.status = to;
  ledger.statusLabel = LEDGER_STATUSES[to].label;
  if (to === "locked") {
    ledger.lockedAt = now;
    ledger.lockedByName = actorAccount?.name || actorAccount?.username || "";
    ledger.lockReason = reason;
  }
  if (to === "archived") {
    ledger.archivedAt = now;
    ledger.archivedByName = actorAccount?.name || actorAccount?.username || "";
  }
  if (to === "active") {
    ledger.lockedAt = "";
    ledger.lockedByName = "";
    ledger.unlockedAt = now;
    ledger.unlockedByName = actorAccount?.name || actorAccount?.username || "";
    ledger.unlockReason = reason;
  }
  return ledger;
}

/**
 * 解锁（8.10）。只能由审批流调用——直接给个 API 让财务自己解，
 * 等于锁定形同虚设：谁锁的谁就能解开。
 */
export function unlockLedgerByApproval(db, options = {}, actorAccount = null) {
  const { type, period, reason = "", requestId = "" } = options;
  const ledger = findLedger(db, type, period);
  if (!ledger) throw httpError(404, `账套不存在：${typeLabel(type)} ${period}`);
  if (ledger.status !== "locked") {
    throw httpError(409, `只有已锁定的账套需要解锁，当前为${statusLabel(ledger.status)}`);
  }
  ledger.status = "active";
  ledger.statusLabel = LEDGER_STATUSES.active.label;
  ledger.lockedAt = "";
  ledger.lockedByName = "";
  ledger.unlockedAt = new Date().toISOString();
  ledger.unlockedByName = actorAccount?.name || actorAccount?.username || "";
  ledger.unlockReason = reason;
  ledger.unlockRequestId = requestId;
  // 解锁次数是要盯的指标：频繁解锁说明核算流程有问题
  ledger.unlockCount = Number(ledger.unlockCount || 0) + 1;
  return ledger;
}

/**
 * 写入前的边界检查（验收 8.9「审批完成后尝试修改，确认被拒」）。
 *
 * 这是账套体系里唯一真正起作用的一环——前面那些状态字段如果没有这道检查，
 * 就只是几个好看的标签。
 */
export function assertLedgerWritable(db, type, period, actionName = "修改") {
  const ledger = findLedger(db, type, String(period || ""));
  // 账套还没建：视为可写。否则每个新月份都要先手工初始化才能录数据，
  // 而 8.3 说的是「可一键初始化」，不是「必须先初始化」。
  if (!ledger) return null;
  if (LEDGER_STATUSES[ledger.status]?.writable) return ledger;

  throw httpError(
    409,
    // statusLabel 本身已经带「已」字（已锁定 / 已归档），再拼一个「已」
    // 就成了「已已锁定」
    `${typeLabel(type)}「${ledger.periodLabel}」${statusLabel(ledger.status)}，不能${actionName}` +
      (ledger.status === "locked" ? "。如需更正请先发起账套解锁审批" : ""),
    { ledgerId: ledger.id, status: ledger.status, lockedAt: ledger.lockedAt, lockedByName: ledger.lockedByName },
  );
}

/** 账套是否需要加载进内存（归档的不加载，这是性能的关键） */
export function ledgerLoaded(ledger) {
  return LEDGER_STATUSES[ledger?.status]?.loaded !== false;
}

/**
 * 列出账套，附带每套的数据量统计。
 * 统计是现算的：存一份快照会和实际数据对不上，而对不上的统计比没有更糟。
 */
export function listLedgers(db, options = {}) {
  const { type = "", status = "" } = options;
  const counts = new Map();
  Object.entries(LEDGER_TYPES).forEach(([ledgerType, spec]) => {
    spec.collections.forEach((collection) => {
      (db[collection] || []).forEach((row) => {
        if (ledgerType === "hr") {
          // 人事是一对多：同一个人出现在他在册的每一年里，不能只记一个键
          ensureLedgers(db).forEach((l) => {
            if (l.type !== "hr" || !ledgerContains("hr", l.period, row)) return;
            const mapKey = `hr::${l.period}`;
            counts.set(mapKey, (counts.get(mapKey) || 0) + 1);
          });
          return;
        }
        const key = ledgerKeyFor(ledgerType, row);
        if (!key) return;
        const mapKey = `${ledgerType}::${key}`;
        counts.set(mapKey, (counts.get(mapKey) || 0) + 1);
      });
    });
  });

  return ensureLedgers(db)
    .filter((l) => (!type || l.type === type) && (!status || l.status === status))
    .map((l) => ({
      ...l,
      records: counts.get(`${l.type}::${l.period}`) || 0,
      loaded: ledgerLoaded(l),
      writable: Boolean(LEDGER_STATUSES[l.status]?.writable),
    }))
    .sort((a, b) => `${a.type} ${b.period}`.localeCompare(`${b.type} ${a.period}`));
}

/** 账套详情：含各集合的明细条数，供 8.1「查看数据边界」现场演示 */
export function ledgerDetail(db, type, period) {
  const ledger = findLedger(db, type, period);
  if (!ledger) throw httpError(404, `账套不存在：${typeLabel(type)} ${period}`);
  const breakdown = {};
  (LEDGER_TYPES[type]?.collections || []).forEach((collection) => {
    breakdown[collection] = (db[collection] || []).filter((row) =>
      ledgerContains(type, ledger.period, row),
    ).length;
  });
  return {
    ...ledger,
    loaded: ledgerLoaded(ledger),
    writable: Boolean(LEDGER_STATUSES[ledger.status]?.writable),
    breakdown,
    records: Object.values(breakdown).reduce((s, n) => s + n, 0),
  };
}

/** 导出单个账套的数据（验收 8.2 / 8.17） */
export function exportLedgerData(db, type, period) {
  const ledger = findLedger(db, type, period);
  if (!ledger) throw httpError(404, `账套不存在：${typeLabel(type)} ${period}`);
  const payload = { ledger: { ...ledger }, exportedAt: new Date().toISOString(), data: {} };
  (LEDGER_TYPES[type]?.collections || []).forEach((collection) => {
    payload.data[collection] = (db[collection] || []).filter((row) =>
      ledgerContains(type, ledger.period, row),
    );
  });
  payload.records = Object.values(payload.data).reduce((s, rows) => s + rows.length, 0);
  return payload;
}

// ---------------------------------------------------------------------------
// 加载边界：哪些集合可以在账套归档后不加载进内存
//
// 不是「账套归档就把它的所有集合都卸掉」。要区分两类数据：
//
//   期间数据  课次、工资单、课表版本——按年无界增长，五年 300 万条课次，
//             这才是「加载慢」的来源。归档后卸掉。
//   主数据    教师、员工、账号、班级、教室——数量由学校规模封顶，不随时间涨。
//             而且业务代码到处按 ID 查它们（"这节课的班级叫什么"），
//             卸掉会让往年数据查出一堆查不到名字的 ID。
//
// 所以只卸期间数据，主数据始终常驻。这也决定了收益上限：
// 卸掉课次能省下绝大部分内存，卸掉班级省不了多少还会惹麻烦。
export const UNLOADABLE_COLLECTIONS = {
  lessonInstances: { type: "scheduling", field: "termId" },
  scheduleVersions: { type: "scheduling", field: "termId" },
  scheduleDrafts: { type: "scheduling", field: "termId" },
  workloadConfirmations: { type: "payroll", field: "month" },
  payrollDetails: { type: "payroll", field: "month" },
  payrollBatches: { type: "payroll", field: "month" },
};

/**
 * 计算加载时要跳过的期间。
 * 返回 { 集合名: { field, skipValues: [...] } }，供持久层拼 WHERE 用。
 *
 * 在 SQL 里过滤而不是读回来再筛：读回来再筛省的只是 JS 堆，
 * 数据库那一趟该读的还是全读了，「加载慢」照旧。
 */
export function archivedLoadFilter(ledgers = []) {
  const archivedByType = new Map();
  ledgers
    .filter((l) => l && l.status === "archived")
    .forEach((l) => {
      if (!archivedByType.has(l.type)) archivedByType.set(l.type, []);
      archivedByType.get(l.type).push(l.period);
    });

  const filter = {};
  Object.entries(UNLOADABLE_COLLECTIONS).forEach(([collection, spec]) => {
    const skipValues = archivedByType.get(spec.type) || [];
    if (skipValues.length) filter[collection] = { field: spec.field, skipValues };
  });
  return filter;
}

/**
 * 取某个账套期间的数据，不管它加载了没有（验收 8.5 / 8.15）。
 *
 * 业务代码原先直接读 db.lessonInstances，归档卸载后就查不到往年数据了。
 * 这个解析器把「在内存里」和「在库里」这两种情况统一起来：调用方只管要数据，
 * 不必知道那个学年归没归档。
 *
 * 返回的是数组，可以原样塞回 db 的副本里交给现有的同步函数处理——
 * 不必为了这件事把整条调用链改成异步。
 */
export async function resolveLedgerRows(db, collectionKey, filters = {}, deps = {}) {
  const spec = UNLOADABLE_COLLECTIONS[collectionKey];
  const inMemory = db[collectionKey] || [];
  if (!spec) return inMemory;

  const period = String(filters[spec.field] || "");
  if (!period) return inMemory;

  const ledger = findLedger(db, spec.type, period);
  // 未归档：数据就在内存里，直接筛
  if (!ledger || ledger.status !== "archived") {
    return inMemory.filter((row) => String(row?.[spec.field] || "") === period);
  }

  const query = deps.queryArchivedRows;
  if (!query) {
    // 没注入读取器却要读归档数据：宁可报错，也不能悄悄返回空数组——
    // 那会让界面显示「这个学年没有课表」，而实际是有的。
    throw Object.assign(
      new Error(`${typeLabel(spec.type)}「${ledger.periodLabel}」已归档，需要从数据库读取，但未配置读取器`),
      { statusCode: 500 },
    );
  }
  return query(collectionKey, filters);
}

// ---------------------------------------------------------------------------
// 结转（验收 8.4 / 8.6）
//
// 8.4「初始化时自动结转历史教职工基础信息」、8.6「人事账套每年自动结转教职工
// 档案，区分在职/离职台账」。
//
// 结转的是**名册快照**，不是把人复制一份。复制会产生两份会各自漂移的档案；
// 快照记的是「这个账套期间，在册的是这些人、其中在职多少离职多少」，
// 这既是 8.6 要的在职/离职分列，也是 8.12 对账时的人事侧基数。
// ---------------------------------------------------------------------------

const IN_SERVICE_STATUSES = ["active", "probation"];

/** 某一期间的人员名册快照 */
export function buildRoster(db, options = {}) {
  const { asOfYear = "", asOfMonth = "" } = options;
  // 期末时点：按年结转看年末，按月看月末。用时点而不是"当前"，
  // 否则同一个账套今天算和明天算得出不同的人数，对账就永远对不平。
  const cutoff = asOfMonth ? `${asOfMonth}-31` : asOfYear ? `${asOfYear}-12-31` : "9999-12-31";
  // 期初：用来区分「本期离职」与「以前就离职了」。
  //
  // 这两个口径都要，而且不能合成一个：
  //   对账（8.12）要问「这个人是不是**曾经**离职」——已离职却还在发工资，
  //     和查无此人是两回事，处理方式完全不同；
  //   台账（8.6）要问「这个人是不是**本期**离职」——2023 年离职的人属于
  //     2023 年的离职台账，混进 2026 年只会让台账逐年膨胀。
  const periodStart = asOfMonth ? `${asOfMonth}-01` : asOfYear ? `${asOfYear}-01-01` : "";

  const inService = [];
  const left = [];
  const leftInPeriod = [];
  (db.employees || []).forEach((e) => {
    const hiredAt = String(e.hiredAt || "");
    // 还没入职的不算在册
    if (hiredAt && hiredAt > cutoff) return;
    const leftAt = String(e.leftAt || "");
    // 知道离职日期就按日期判，不知道才退回看当前状态。
    // 反过来先看 status 会短路掉时点判断：2023 年离职的人在 2022 年的账套里
    // 也被算成离职，而他 2022 年底明明还在岗——这正是上面那句「用时点而不是
    // 当前」要避免的事。
    const hasLeft = leftAt ? leftAt <= cutoff : e.status === "left";
    const entry = {
      employeeId: e.id,
      teacherId: e.teacherId || "",
      name: e.personName || e.name || "",
      employeeNo: e.employeeNo || "",
      orgUnitId: e.orgUnitId || "",
      hiredAt,
      leftAt,
    };
    if (hasLeft) {
      left.push(entry);
      if (!periodStart || (leftAt && leftAt >= periodStart)) leftInPeriod.push(entry);
    }
    // 已知离职日期且晚于时点 → 那个时点他在岗，哪怕现在的 status 是 left
    else if (leftAt || IN_SERVICE_STATUSES.includes(e.status) || !e.status) inService.push(entry);
  });

  return {
    cutoff,
    periodStart,
    inServiceCount: inService.length,
    leftCount: left.length,
    leftInPeriodCount: leftInPeriod.length,
    inService,
    left,
    leftInPeriod,
  };
}

/**
 * 把名册结转进账套。幂等：重复结转覆盖同一份快照，不累加。
 */
export function carryOverRoster(db, type, period, actorAccount = null) {
  const ledger = findLedger(db, type, period);
  if (!ledger) throw httpError(404, `账套不存在：${typeLabel(type)} ${period}`);

  const roster =
    type === "payroll"
      ? buildRoster(db, { asOfMonth: period })
      : buildRoster(db, { asOfYear: String(period).slice(0, 4) });

  ledger.roster = {
    cutoff: roster.cutoff,
    periodStart: roster.periodStart,
    inServiceCount: roster.inServiceCount,
    // leftCount 是累计离职（对账用），leftInPeriodCount 才是本期离职台账（8.6）。
    // 两个都存：只存累计的话，2026 年的离职台账里会躺着 2020 年就走的人
    leftCount: roster.leftCount,
    leftInPeriodCount: roster.leftInPeriodCount,
    // 只存 ID 与姓名：存整份档案会让账套跟着人事改动一起漂，
    // 而结转的意义恰恰是「定格在那一刻」
    inServiceIds: roster.inService.map((r) => r.employeeId),
    leftIds: roster.left.map((r) => r.employeeId),
    leftInPeriodIds: roster.leftInPeriod.map((r) => r.employeeId),
    carriedAt: new Date().toISOString(),
    carriedByName: actorAccount?.name || actorAccount?.username || "",
  };
  ledger.carriedOver = roster.inServiceCount;
  return ledger.roster;
}

// ---------------------------------------------------------------------------
// 单账套备份与导入恢复（验收 8.2 / 8.17）
//
// 与整库备份的分工：整库备份用于灾难恢复，单账套用于「把 2025 学年的课表
// 交给档案室离线保存」这类场景。两者都要有——只有整库备份，想单独取一个
// 学年的数据就得先恢复整个库。
// ---------------------------------------------------------------------------

export const LEDGER_EXPORT_VERSION = 1;

/** 导出成可离线保存的文件内容（JSON，自带校验信息） */
export function buildLedgerBackup(db, type, period) {
  const payload = exportLedgerData(db, type, period);
  return {
    version: LEDGER_EXPORT_VERSION,
    exportedAt: payload.exportedAt,
    ledger: payload.ledger,
    records: payload.records,
    // 记下每个集合的条数：导入时用它核对文件有没有被截断。
    // 只看 JSON 能不能解析是不够的——截断在数组中间同样是合法 JSON。
    counts: Object.fromEntries(Object.entries(payload.data).map(([k, v]) => [k, v.length])),
    data: payload.data,
  };
}

export function ledgerBackupFilename(type, period) {
  return `账套-${typeLabel(type)}-${String(period).replace(/[^\w-]/g, "")}.json`;
}

/**
 * 导入恢复（8.17）。
 *
 * 默认拒绝覆盖已有数据：导入是把文件里的记录写回系统，如果目标账套里已经
 * 有数据，不加确认地合并会产生一堆分不清来源的重复行。
 */
export function importLedgerBackup(db, backup, options = {}, actorAccount = null) {
  const { allowOverwrite = false } = options;
  if (!backup || typeof backup !== "object") throw httpError(400, "备份文件内容无效");
  if (Number(backup.version) !== LEDGER_EXPORT_VERSION) {
    throw httpError(400, `备份文件版本不兼容（文件 ${backup.version}，当前 ${LEDGER_EXPORT_VERSION}）`);
  }
  const meta = backup.ledger;
  if (!meta?.type || !meta?.period) throw httpError(400, "备份文件缺少账套信息");
  const spec = LEDGER_TYPES[meta.type];
  if (!spec) throw httpError(400, `备份文件中的账套类型无效：${meta.type}`);

  // 条数核对：截断的文件在数组中间断开仍是合法 JSON，只解析不核对就会
  // 悄悄导入半份数据，而且没人会发现
  Object.entries(backup.counts || {}).forEach(([collection, expected]) => {
    const actual = (backup.data?.[collection] || []).length;
    if (actual !== expected) {
      throw httpError(400, `备份文件不完整：${collection} 应有 ${expected} 条，实际 ${actual} 条`);
    }
  });

  const existing = findLedger(db, meta.type, meta.period);
  const existingRecords = existing
    ? spec.collections.reduce(
        (sum, c) => sum + (db[c] || []).filter((r) => ledgerContains(meta.type, meta.period, r)).length,
        0,
      )
    : 0;
  if (existingRecords > 0 && !allowOverwrite) {
    throw httpError(
      409,
      `${typeLabel(meta.type)}「${meta.period}」中已有 ${existingRecords} 条数据。` +
        `导入会与现有数据合并，请确认后重试。`,
    );
  }

  let imported = 0;
  let replaced = 0;
  Object.entries(backup.data || {}).forEach(([collection, rows]) => {
    if (!spec.collections.includes(collection)) return; // 文件里混进别的集合，不收
    if (!Array.isArray(db[collection])) db[collection] = [];
    const byId = new Map(db[collection].map((r, i) => [r.id, i]));
    rows.forEach((row) => {
      const at = byId.get(row.id);
      if (at === undefined) {
        db[collection].push(row);
        imported += 1;
      } else {
        db[collection][at] = row;
        replaced += 1;
      }
    });
  });

  // 账套本身也要恢复出来，否则导入的数据没有归属
  if (!existing) {
    ensureLedgers(db).push({
      ...meta,
      restoredAt: new Date().toISOString(),
      restoredByName: actorAccount?.name || actorAccount?.username || "",
    });
  }

  return { type: meta.type, period: meta.period, imported, replaced, total: imported + replaced };
}

// ---------------------------------------------------------------------------
// 学年结束自动归档（验收 8.11）
// ---------------------------------------------------------------------------

/**
 * 扫描已结束的学期，把对应的排课账套归档。
 * 只处理已结束且已锁定的——直接把刚结束的学期归档会让补录考勤、
 * 处理遗留异常都做不了。要先锁定（定案），再归档（卸载）。
 */
export function autoArchiveEndedTerms(db, options = {}, actorAccount = null) {
  const { asOf = new Date().toISOString().slice(0, 10), graceDays = 30 } = options;
  const archived = [];
  const locked = [];

  (db.terms || []).forEach((term) => {
    const endDate = String(term.endDate || "");
    if (!endDate || endDate >= asOf) return;
    // 学期一结束就锁定：定案，不再产生新的课时与考勤。
    const { ledger } = initializeLedger(db, { type: "scheduling", period: term.id }, actorAccount);
    if (ledger.status === "active") {
      transitionLedger(
        db,
        { type: "scheduling", period: term.id, to: "locked", reason: `学期于 ${endDate} 结束，自动锁定` },
        actorAccount,
      );
      locked.push(term.id);
    }

    // 但归档要再等一段缓冲：归档会把数据从内存卸下，而期末的补录、
    // 异常处理、工资复核都还要读这些课次。锁定与归档分两步，
    // 正是为了这段既要定案、又要能查的时间。
    const graceEnd = addDaysTo(endDate, graceDays);
    if (asOf < graceEnd) return;

    const current = findLedger(db, "scheduling", term.id);
    if (current.status === "locked") {
      transitionLedger(
        db,
        { type: "scheduling", period: term.id, to: "archived", reason: `学期结束满 ${graceDays} 天，自动归档` },
        actorAccount,
      );
      archived.push(term.id);
      if (term.status !== "archived") term.status = "archived";
    }
  });

  return { asOf, locked, archived };
}

function addDaysTo(dateKey, days) {
  const [y, m, d] = String(dateKey).split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
