// 账套体系（验收第八章）
//
// 账套里真正起作用的只有一件事：**边界挡不挡得住写入**。
// 状态字段、生命周期、统计数字都是给人看的；如果锁定后还能改数据，
// 那这些就只是几个好看的标签。所以这里的重点不是「状态转对了没」，
// 而是「锁定之后，那些写入路径是不是真的都被拦下了」。
//
// 验收 8.9 的原话是「审批完成后尝试修改，确认被拒」——现场会真的去改。
import assert from "node:assert/strict";
import {
  createInitialData,
  generatePayrollBatch,
  normalizeDatabase,
  generateTeacherPayrollDetail,
} from "../server/storage.js";
import {
  LEDGER_STATUSES,
  LEDGER_TYPES,
  assertLedgerWritable,
  exportLedgerData,
  findLedger,
  initializeLedger,
  ledgerDetail,
  ledgerContains,
  ledgerKeyFor,
  ledgerLoaded,
  ledgerTypeOfCollection,
  listLedgers,
  transitionLedger,
  unlockLedgerByApproval,
  buildRoster,
  carryOverRoster,
  buildLedgerBackup,
  ledgerBackupFilename,
  importLedgerBackup,
  autoArchiveEndedTerms,
  LEDGER_EXPORT_VERSION,
} from "../server/ledgers.js";

function freshDb() {
  const db = createInitialData({ teacherCount: 20 });
  normalizeDatabase(db);
  return db;
}
const actor = { id: "ACC-FIN", name: "小学部会计" };

// ---------------------------------------------------------------------------
// 1. 三类账套齐备（验收 8.1）
// ---------------------------------------------------------------------------
{
  assert.deepEqual(Object.keys(LEDGER_TYPES), ["hr", "scheduling", "payroll"], "验收 8.1 要求人事、排课课时、薪资财务三套");
  assert.equal(LEDGER_TYPES.hr.period, "year", "人事按年（8.6）");
  assert.equal(LEDGER_TYPES.scheduling.period, "term", "排课按学年（8.7）");
  assert.equal(LEDGER_TYPES.payroll.period, "month", "薪资按自然月（8.8）");

  // 集合归属不能重叠：一条数据同时属于两个账套的话，锁哪个都锁不干净
  const seen = new Map();
  Object.entries(LEDGER_TYPES).forEach(([type, spec]) => {
    spec.collections.forEach((c) => {
      assert.ok(!seen.has(c), `集合 ${c} 同时属于 ${seen.get(c)} 和 ${type}，边界会重叠`);
      seen.set(c, type);
    });
  });
  assert.equal(ledgerTypeOfCollection("payrollDetails"), "payroll");
  assert.equal(ledgerTypeOfCollection("lessonInstances"), "scheduling");
  assert.equal(ledgerTypeOfCollection("teachers"), "", "教师是跨账套的基础数据，不属于任何一个账套");
}

// ---------------------------------------------------------------------------
// 2. 归属判断：边界的定义所在
// ---------------------------------------------------------------------------
{
  assert.equal(ledgerKeyFor("payroll", { month: "2026-06" }), "2026-06");
  assert.equal(ledgerKeyFor("scheduling", { termId: "TERM-2026-PHASE1" }), "TERM-2026-PHASE1");
  assert.equal(ledgerKeyFor("hr", { hiredAt: "2025-09-01" }), "2025");
  assert.equal(ledgerKeyFor("payroll", {}), "", "没有期间字段的数据不归属任何账套，不能瞎归");
}

// ---------------------------------------------------------------------------
// 3. 初始化（8.3）与结转（8.4）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const first = initializeLedger(db, { type: "payroll", period: "2026-06" }, actor);
  assert.equal(first.created, true);
  assert.equal(first.ledger.status, "active");
  assert.equal(first.ledger.periodLabel, "2026 年 6 月", "期间要有可读的中文标签，现场演示看的是这个");
  assert.ok(first.ledger.carriedOver > 0, "8.4：初始化应结转在职人员基数");

  // 幂等：重复初始化不能把已有账套重置回 active
  transitionLedger(db, { type: "payroll", period: "2026-06", to: "locked" }, actor);
  const again = initializeLedger(db, { type: "payroll", period: "2026-06" }, actor);
  assert.equal(again.created, false);
  assert.equal(again.ledger.status, "locked", "重复初始化不得把已锁定的账套解开");

  assert.throws(() => initializeLedger(db, { type: "不存在", period: "x" }), /类型无效/);
  assert.throws(() => initializeLedger(db, { type: "payroll", period: "" }), /指定账套期间/);
}

// ---------------------------------------------------------------------------
// 4. 边界：锁定后写入必须被拒（验收 8.9 的现场动作）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const teacher = db.teachers[0];

  // 账套未建时不应阻断——否则每个新月份都要先手工初始化才能录数据
  assert.doesNotThrow(() => assertLedgerWritable(db, "payroll", "2026-06", "保存"));

  initializeLedger(db, { type: "payroll", period: "2026-06" }, actor);
  assert.doesNotThrow(() => assertLedgerWritable(db, "payroll", "2026-06", "保存"), "使用中的账套应可写");

  transitionLedger(db, { type: "payroll", period: "2026-06", to: "locked", reason: "审批通过" }, actor);

  // 直接调边界检查
  assert.throws(
    () => assertLedgerWritable(db, "payroll", "2026-06", "保存工资"),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.match(error.message, /已锁定/);
      assert.ok(!/已已/.test(error.message), "statusLabel 自带「已」字，不要再拼一个");
      assert.match(error.message, /解锁审批/, "要告诉使用者下一步该怎么办，而不是只说不行");
      return true;
    },
  );

  // 真正的业务写入路径也必须被拦下——这才是 8.9 现场会做的动作
  assert.throws(
    () => generatePayrollBatch(db, { month: "2026-06" }, actor),
    /已锁定/,
    "账套锁定后批量生成工资必须被拒",
  );
  assert.throws(
    () => generateTeacherPayrollDetail(db, teacher.id, "2026-06", actor),
    /已锁定/,
    "账套锁定后生成单人工资明细必须被拒",
  );

  // 别的月份不受影响：锁 6 月不能把 7 月一起锁死
  assert.doesNotThrow(() => generatePayrollBatch(db, { month: "2026-07" }, actor), "锁定某月不应波及其他月份");
}

// ---------------------------------------------------------------------------
// 5. 状态流转规则
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  initializeLedger(db, { type: "scheduling", period: "TERM-A" }, actor);

  // 已锁定不能直接转回使用中——那样解锁审批就绕过去了
  transitionLedger(db, { type: "scheduling", period: "TERM-A", to: "locked" }, actor);
  assert.throws(
    () => transitionLedger(db, { type: "scheduling", period: "TERM-A", to: "active" }, actor),
    /解锁需经审批|不能直接转/,
    "锁定→使用中必须走审批，否则谁锁的谁就能解开",
  );

  // 锁定可以归档
  transitionLedger(db, { type: "scheduling", period: "TERM-A", to: "archived" }, actor);
  const archived = findLedger(db, "scheduling", "TERM-A");
  assert.equal(archived.status, "archived");
  assert.ok(archived.archivedAt);

  // 归档是终态
  assert.throws(
    () => transitionLedger(db, { type: "scheduling", period: "TERM-A", to: "active" }, actor),
    /不能直接转/,
    "已归档不应能被改回使用中",
  );
  assert.throws(() => transitionLedger(db, { type: "scheduling", period: "TERM-A", to: "locked" }, actor), /不能直接转/);

  // 不存在的状态
  assert.throws(
    () => transitionLedger(db, { type: "scheduling", period: "TERM-A", to: "whatever" }, actor),
    /状态无效/,
  );
}

// ---------------------------------------------------------------------------
// 6. 解锁必须经审批，且留痕（验收 8.10）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  initializeLedger(db, { type: "payroll", period: "2026-06" }, actor);
  transitionLedger(db, { type: "payroll", period: "2026-06", to: "locked", reason: "审批通过" }, actor);

  const unlocked = unlockLedgerByApproval(
    db,
    { type: "payroll", period: "2026-06", reason: "课时数录错需更正", requestId: "OA-123" },
    { id: "ACC-PRINCIPAL", name: "校领导" },
  );
  assert.equal(unlocked.status, "active");
  assert.equal(unlocked.unlockReason, "课时数录错需更正", "解锁原因必须留痕");
  assert.equal(unlocked.unlockRequestId, "OA-123", "要能追到是哪张审批单批的");
  assert.equal(unlocked.unlockedByName, "校领导");
  assert.equal(unlocked.unlockCount, 1, "解锁次数要计数——频繁解锁说明核算流程有问题");
  assert.equal(unlocked.lockedAt, "", "解锁后锁定信息应清空，否则下次看不出是不是又锁过");

  // 解锁后确实能写了
  assert.doesNotThrow(() => assertLedgerWritable(db, "payroll", "2026-06", "更正"));

  // 没锁的账套不需要解锁
  initializeLedger(db, { type: "payroll", period: "2026-07" }, actor);
  assert.throws(
    () => unlockLedgerByApproval(db, { type: "payroll", period: "2026-07" }, actor),
    /只有已锁定的账套需要解锁/,
  );
  assert.throws(() => unlockLedgerByApproval(db, { type: "payroll", period: "2099-01" }, actor), /账套不存在/);
}

// ---------------------------------------------------------------------------
// 7. 归档账套不进内存——这是校方真正关心的那件事
//
// 校方提账套的动机是「数据多了加载慢」。这套系统启动时把整个数据库读进内存，
// 五年积累实测约 5.8 秒启动、3.9 GB 常驻。账套作为加载边界，归档的就不加载。
// ---------------------------------------------------------------------------
{
  assert.equal(LEDGER_STATUSES.active.loaded, true);
  assert.equal(LEDGER_STATUSES.locked.loaded, true, "锁定只是不可写，仍要能查——否则 8.15 跨年度检索做不到");
  assert.equal(LEDGER_STATUSES.archived.loaded, false, "归档账套不进内存，这是性能的关键");

  const db = freshDb();
  initializeLedger(db, { type: "scheduling", period: "TERM-OLD" }, actor);
  assert.equal(ledgerLoaded(findLedger(db, "scheduling", "TERM-OLD")), true);
  transitionLedger(db, { type: "scheduling", period: "TERM-OLD", to: "archived" }, actor);
  assert.equal(ledgerLoaded(findLedger(db, "scheduling", "TERM-OLD")), false);

  // 锁定与归档必须是两个状态：只有一种「不可写」的话，
  // 就没法既满足 8.9（锁定后不可改）又满足 8.15（往年数据仍可查）
  assert.notEqual(LEDGER_STATUSES.locked.loaded, LEDGER_STATUSES.archived.loaded);
  assert.equal(LEDGER_STATUSES.locked.writable, LEDGER_STATUSES.archived.writable);
}

// ---------------------------------------------------------------------------
// 8. 清单与详情：现场「查看三套账套的数据边界」（8.1）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const term = db.terms.find((t) => t.current) || db.terms[0];
  initializeLedger(db, { type: "scheduling", period: term.id }, actor);
  initializeLedger(db, { type: "payroll", period: "2026-06" }, actor);
  initializeLedger(db, { type: "hr", period: "2026" }, actor);

  const all = listLedgers(db);
  assert.equal(all.length, 3);
  assert.ok(all.every((l) => l.typeLabel && l.statusLabel), "清单要有中文标签，现场看的是这个");

  const scheduling = all.find((l) => l.type === "scheduling");
  assert.ok(scheduling.records > 0, "排课账套应统计到该学期的课次与班级");

  const byType = listLedgers(db, { type: "payroll" });
  assert.equal(byType.length, 1);
  assert.equal(byType[0].type, "payroll");

  // 详情要能拆到每个集合，才叫「看得到数据边界」
  const detail = ledgerDetail(db, "scheduling", term.id);
  assert.ok(Object.keys(detail.breakdown).length > 0);
  assert.ok(detail.breakdown.classes > 0, "该学期的班级应计入排课账套");
  assert.equal(
    detail.records,
    Object.values(detail.breakdown).reduce((s, n) => s + n, 0),
    "总数应等于各集合之和",
  );

  // 统计必须是现算的：存快照会和实际数据对不上，而对不上的统计比没有更糟
  const before = detail.breakdown.classes;
  db.classes.push({ id: "CLS-NEW", termId: term.id, name: "新班", stageId: "primary" });
  assert.equal(ledgerDetail(db, "scheduling", term.id).breakdown.classes, before + 1, "统计应反映当前数据");
}

// ---------------------------------------------------------------------------
// 9. 单账套导出（验收 8.2 / 8.17）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const term = db.terms.find((t) => t.current) || db.terms[0];
  initializeLedger(db, { type: "scheduling", period: term.id }, actor);

  // 必须造出第二个学期的数据：样本默认只有一个学期，
  // 那样「过滤」和「不过滤」结果完全相同，夹带根本测不出来。
  db.classes.push({ id: "CLS-OTHER", termId: "TERM-OTHER", name: "他学期班级", stageId: "primary" });
  db.lessonInstances.push({
    id: "L-OTHER",
    termId: "TERM-OTHER",
    teacherId: db.teachers[0].id,
    classId: "CLS-OTHER",
    date: "2025-09-01",
    time: "08:00-08:40",
    status: "completed",
    units: 1,
  });

  const payload = exportLedgerData(db, "scheduling", term.id);
  assert.ok(payload.ledger, "导出应带账套元信息");
  assert.ok(payload.exportedAt);
  assert.ok(payload.records > 0);

  // 只导出属于这个账套的数据，不能把别的学期夹带出去
  Object.entries(payload.data).forEach(([collection, rows]) => {
    rows.forEach((row) => {
      assert.equal(
        ledgerKeyFor("scheduling", row),
        term.id,
        `${collection} 里混入了不属于本账套的数据`,
      );
    });
  });
  // 也不能把别类账套的集合带出来
  assert.ok(!("payrollDetails" in payload.data), "排课账套的导出里不该有工资单");

  // 他学期的数据一条都不能出现
  assert.ok(
    !payload.data.classes.some((c) => c.id === "CLS-OTHER"),
    "导出本学期账套时不得夹带其他学期的班级",
  );
  assert.ok(
    !payload.data.lessonInstances.some((l) => l.id === "L-OTHER"),
    "导出本学期账套时不得夹带其他学期的课次",
  );

  assert.throws(() => exportLedgerData(db, "scheduling", "TERM-NOPE"), /账套不存在/);
}


// ---------------------------------------------------------------------------
// 10. 结转与在职/离职台账（验收 8.4 / 8.6）
//
// 8.6 的验收方式是「查看在职与离职分列」——两者必须能分开看到，
// 只报一个总人数满足不了。
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const emps = db.employees;
  assert.ok(emps.length > 5, "样本应有足够的人事档案");

  // 造出三种情况：在职、试用、已离职
  emps[0].status = "active";
  emps[0].hiredAt = "2024-03-01";
  emps[1].status = "probation";
  emps[1].hiredAt = "2026-05-01";
  emps[2].status = "left";
  emps[2].hiredAt = "2020-09-01";
  emps[2].leftAt = "2026-03-15";
  // 还没入职的：不应算进在册
  emps[3].status = "active";
  emps[3].hiredAt = "2027-09-01";

  const roster = buildRoster(db, { asOfMonth: "2026-06" });
  assert.ok(roster.inService.some((r) => r.employeeId === emps[0].id), "在职应计入");
  assert.ok(roster.inService.some((r) => r.employeeId === emps[1].id), "试用期也算在岗");
  assert.ok(roster.left.some((r) => r.employeeId === emps[2].id), "已离职应单独分列（8.6）");
  assert.ok(
    !roster.inService.some((r) => r.employeeId === emps[3].id),
    "未来才入职的不算本期在册——否则对账时人事侧会凭空多出人",
  );
  assert.ok(roster.inServiceCount > 0 && roster.leftCount > 0, "在职与离职都要有计数");

  // 结转进账套
  initializeLedger(db, { type: "payroll", period: "2026-06" }, actor);
  const carried = carryOverRoster(db, "payroll", "2026-06", actor);
  assert.equal(carried.inServiceCount, roster.inServiceCount);
  assert.equal(carried.leftCount, roster.leftCount);
  assert.ok(carried.carriedAt);
  assert.ok(Array.isArray(carried.inServiceIds), "要记下具体是哪些人，不能只记个数");
  assert.equal(typeof carried.inServiceIds[0], "string", "只存 ID 字符串，不复制整份档案——复制会让账套跟着人事改动一起漂");

  // 幂等：重复结转覆盖而非累加
  const again = carryOverRoster(db, "payroll", "2026-06", actor);
  assert.equal(again.inServiceCount, carried.inServiceCount, "重复结转不应让人数翻倍");

  // 时点固定：结转后再改人事档案，快照不应跟着变
  const before = carried.inServiceCount;
  db.employees.push({ id: "EMP-NEW", personName: "新人", status: "active", hiredAt: "2026-06-20" });
  assert.equal(
    findLedger(db, "payroll", "2026-06").roster.inServiceCount,
    before,
    "结转是定格在那一刻的快照，不应跟着人事改动漂移",
  );
}

// ---------------------------------------------------------------------------
// 11. 单账套备份与导入恢复（验收 8.2 / 8.17）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const term = db.terms.find((t) => t.current) || db.terms[0];
  initializeLedger(db, { type: "scheduling", period: term.id }, actor);

  const backup = buildLedgerBackup(db, "scheduling", term.id);
  assert.equal(backup.version, LEDGER_EXPORT_VERSION);
  assert.ok(backup.records > 0);
  assert.ok(backup.counts.classes > 0, "应记录每个集合的条数，供导入时核对完整性");
  assert.match(ledgerBackupFilename("scheduling", term.id), /\.json$/);

  // 导入到一个空系统
  const target = freshDb();
  target.classes = [];
  target.rooms = [];
  target.lessonInstances = [];
  target.scheduleVersions = [];
  target.workloadConfirmations = [];
  const result = importLedgerBackup(target, backup, {}, actor);
  assert.equal(result.imported, backup.records, "所有记录都应导入");
  assert.equal(result.replaced, 0);
  assert.ok(findLedger(target, "scheduling", term.id), "账套本身也要恢复出来，否则导入的数据没有归属");
  assert.equal(
    target.classes.filter((c) => c.termId === term.id).length,
    backup.counts.classes,
    "班级应逐条恢复",
  );

  // 目标已有数据时必须先确认
  assert.throws(
    () => importLedgerBackup(target, backup, {}, actor),
    /已有 \d+ 条数据/,
    "覆盖已有数据必须要求确认，否则会产生分不清来源的重复行",
  );
  const overwrite = importLedgerBackup(target, backup, { allowOverwrite: true }, actor);
  assert.equal(overwrite.imported, 0, "同 ID 的记录应替换而非新增");
  assert.equal(overwrite.replaced, backup.records);

  // 被截断的文件必须识别出来
  const truncated = JSON.parse(JSON.stringify(backup));
  truncated.data.classes = truncated.data.classes.slice(0, 2);
  assert.throws(
    () => importLedgerBackup(freshDb(), truncated, { allowOverwrite: true }, actor),
    /备份文件不完整/,
    "截断在数组中间仍是合法 JSON，只解析不核对条数会悄悄导入半份数据",
  );

  // 版本不兼容
  assert.throws(
    () => importLedgerBackup(freshDb(), { ...backup, version: 99 }, {}, actor),
    /版本不兼容/,
  );
  assert.throws(() => importLedgerBackup(freshDb(), null, {}, actor), /内容无效/);

  // 文件里混进别类账套的集合，不应被收进来
  const tainted = JSON.parse(JSON.stringify(backup));
  tainted.data.payrollDetails = [{ id: "PD-X", month: "2026-06" }];
  tainted.counts.payrollDetails = 1;
  const clean = freshDb();
  clean.classes = [];
  clean.rooms = [];
  clean.lessonInstances = [];
  clean.scheduleVersions = [];
  clean.workloadConfirmations = [];
  const beforePayroll = clean.payrollDetails.length;
  importLedgerBackup(clean, tainted, { allowOverwrite: true }, actor);
  assert.equal(clean.payrollDetails.length, beforePayroll, "排课账套的备份里混进工资单，不应被导入");
}

// ---------------------------------------------------------------------------
// 12. 学年结束自动归档（验收 8.11）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const term = db.terms.find((t) => t.current) || db.terms[0];
  term.endDate = "2026-01-31";

  // 缓冲期内不应归档：期末的补录、异常处理都在这段时间做
  const early = autoArchiveEndedTerms(db, { asOf: "2026-02-10", graceDays: 30 }, actor);
  assert.equal(early.archived.length, 0, "学期刚结束就归档会让补录考勤做不了");
  assert.equal(findLedger(db, "scheduling", term.id)?.status, "locked", "但应先锁定（定案）");

  // 过了缓冲期才归档
  const late = autoArchiveEndedTerms(db, { asOf: "2026-03-10", graceDays: 30 }, actor);
  assert.deepEqual(late.archived, [term.id]);
  assert.equal(findLedger(db, "scheduling", term.id).status, "archived");
  assert.equal(term.status, "archived", "学期本身也应标记归档");

  // 幂等：再跑一次不应重复处理
  const again = autoArchiveEndedTerms(db, { asOf: "2026-04-10", graceDays: 30 }, actor);
  assert.equal(again.archived.length, 0, "已归档的不应被重复处理");

  // 未结束的学期不动
  const db2 = freshDb();
  const t2 = db2.terms.find((t) => t.current) || db2.terms[0];
  t2.endDate = "2099-12-31";
  const none = autoArchiveEndedTerms(db2, { asOf: "2026-06-01" }, actor);
  assert.equal(none.archived.length, 0);
  assert.equal(none.locked.length, 0, "未结束的学期不应被锁定");
}

// ---------------------------------------------------------------------------
// 人事账套按「该年度在册」归属，不是按「当年入职」
//
// 一开始按入职年份归属，结果 2026 年的人事账套里只有当年新招的几个人：
//   · 8.4「查看新账套是否已带入人员信息」——屏幕上是 0，看起来像结转失败
//   · 8.2 / 8.17「现场执行单账套备份 / 恢复」——导出一个几乎空的文件
// 8.6 要的是「每年结转教职工档案」，一个 2021 年入职至今在职的老师，
// 2021 到 2026 每一年的账套里都该有他。
// ---------------------------------------------------------------------------
{
  const db = createInitialData({ teacherCount: 60 });
  normalizeDatabase(db);
  // 一个 2023 年中离职、一个 2026 年离职
  db.employees[0].status = "left";
  db.employees[0].leftAt = "2023-06-30";
  db.employees[1].status = "left";
  db.employees[1].leftAt = "2026-03-15";

  const years = ["2022", "2023", "2024", "2026"];
  years.forEach((y) => {
    initializeLedger(db, { type: "hr", period: y }, null);
    carryOverRoster(db, "hr", y, null);
  });
  const byPeriod = new Map(listLedgers(db, { type: "hr" }).map((l) => [l.period, l]));

  years.forEach((y) => {
    const l = byPeriod.get(y);
    assert.ok(l.records > 1, `${y} 年人事账套不能只有个位数记录——8.4 要在屏幕上看到人`);
    // 明细条数与结转名册必须对得平。两处是各算各的，最容易一边改了另一边没跟上，
    // 而校方现场就是拿这两个数字对照看的。
    assert.equal(
      l.records,
      l.roster.inServiceCount + l.roster.leftInPeriodCount,
      `${y} 年：本期明细 ${l.records} 应等于在职 ${l.roster.inServiceCount} + 本期离职 ${l.roster.leftInPeriodCount}`,
    );
  });

  // 逐年在册人数应随入职累积而递增
  assert.ok(byPeriod.get("2024").records > byPeriod.get("2022").records, "在册人数应逐年累积");

  // 时点判定：2023 年离职的人，2022 年底还在岗
  const leaver = db.employees[0];
  assert.equal(ledgerContains("hr", "2022", leaver), true, "2023 年离职的人属于 2022 年账套");
  assert.equal(ledgerContains("hr", "2023", leaver), true, "离职当年仍属于该年账套——离职台账也是账套的一部分");
  assert.equal(ledgerContains("hr", "2024", leaver), false, "离职之后的年份不应再收录");
  assert.equal(
    byPeriod.get("2022").roster.leftInPeriodCount,
    0,
    "2022 年没人离职；按当前 status 判会把 2023 年离职的人错算进来",
  );
  assert.equal(byPeriod.get("2023").roster.leftInPeriodCount, 1, "2023 年应有 1 人离职");
  assert.equal(
    byPeriod.get("2024").roster.leftInPeriodCount,
    0,
    "2023 年离职的人属于 2023 年台账，不应逐年累积到之后每一年",
  );
  // 累计口径仍要保留：对账要靠它区分「已离职仍在发」与「查无此人」
  assert.equal(byPeriod.get("2024").roster.leftCount, 1, "累计离职口径不能丢，对账依赖它");

  // 备份必须有内容，否则 8.2 / 8.17 现场导出的是个空文件
  const backup = buildLedgerBackup(db, "hr", "2026");
  assert.ok(backup.records > 1, `2026 年人事账套备份应有内容，实际 ${backup.records} 条`);
  assert.equal(backup.counts.employees, byPeriod.get("2026").records, "备份条数应与列表显示一致");
}

console.log("ledgers checks passed");
