// 监控与告警（合同第七条第 6 项「具备必要的错误处理、日志、监控和告警能力」）
//
// 一个告警系统最容易犯的错不是「漏报」，是**吵**。每五分钟响一次的告警，
// 两周之内就会被全体设为免打扰，然后真出事那次也没人看。
// 所以这里花最多篇幅测的是「同一个故障只报一次」和「恢复了要报」，
// 而不是「能不能发现故障」。
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  MONITOR_RULES,
  alertLine,
  collectMetrics,
  createMonitor,
  diffAlerts,
  dispatchAlerts,
  evaluateRules,
} from "../server/monitoring.js";
import { createInitialData, normalizeDatabase } from "../server/storage.js";

const healthy = {
  storageHealth: { lastSaveAt: "2026-09-01T00:00:00Z", lastSaveError: "" },
  postgresHealth: { configured: true, connected: true, lastError: "" },
  solverProbe: { available: true },
  security: { failuresLastHour: 0, distinctIps: 0 },
  env: { HR_ENCRYPTION_KEY: "x" },
};

function seed() {
  const db = createInitialData({ teacherCount: 5 });
  normalizeDatabase(db);
  return db;
}

// ---------------------------------------------------------------------------
// 1. 正常状态下不应该有任何告警
//
// 这条比看起来重要：一个「永远在报警」的监控等于没有监控。
// ---------------------------------------------------------------------------
{
  const metrics = await collectMetrics(seed(), healthy);
  const results = evaluateRules(metrics);
  const firing = results.filter((r) => !r.ok);
  assert.deepEqual(
    firing.map((r) => `${r.name}：${r.detail}`),
    [],
    "系统正常时不应有告警，否则真出事时没人会看",
  );
  assert.equal(results.length, MONITOR_RULES.length, "每条规则都要有结论");
}

// ---------------------------------------------------------------------------
// 2. 每条规则都能被触发，而且说的是人话
//
// 「内存告警」是废话。detail 必须写清楚现在什么情况、接下来该干什么。
// ---------------------------------------------------------------------------
{
  const cases = [
    ["db_disconnected", { postgres: { configured: true, connected: false, lastError: "ECONNREFUSED" } }],
    ["persist_failed", { storage: { lastSaveError: "磁盘写入失败" } }],
    ["encryption_key_missing", { env: { HR_ENCRYPTION_KEY: false } }],
    ["disk_low", { disk: { totalBytes: 100e9, freeBytes: 1e9 } }],
    ["memory_high", { memory: { rss: 4096 * 1024 * 1024 } }],
    ["solver_unavailable", { solver: { available: false, message: "未安装 ortools" } }],
    ["backup_stale", { backup: { checked: true, lastBackupAt: "2026-08-01T00:00:00Z", ageDays: 31 } }],
    ["login_failures", { security: { failuresLastHour: 500, distinctIps: 37 } }],
    ["reconciliation_unbalanced", { reconciliation: { ran: true, month: "2026-09", balanced: false, differenceCount: 12 } }],
    ["approval_backlog", { approvals: { overdue: 50 } }],
  ];
  assert.equal(cases.length, MONITOR_RULES.length, "每条规则都要有对应的触发用例，新增规则请补上");

  const base = await collectMetrics(seed(), healthy);
  cases.forEach(([key, override]) => {
    const rule = MONITOR_RULES.find((r) => r.key === key);
    assert.ok(rule, `规则 ${key} 不存在`);
    const hit = evaluateRules({ ...base, ...override }, [rule])[0];
    assert.equal(hit.ok, false, `${key} 在异常输入下应触发`);
    assert.ok(hit.detail.length >= 15, `${key} 的说明太短，看不出该干什么：${hit.detail}`);
    // 说明必须是「发生了什么 + 所以呢」两段，不能是一个光秃秃的标签。
    //
    // 判据用「至少两个子句」而不是「含数字」或「含『请』字」：后两者是在数
    // 关键词，每碰到一条写得好但没命中关键词的说明就得再往正则里塞一个词，
    // 最后变成什么都收的口袋。「内存告警」这种废话过不了两个子句这一关，
    // 而「剩余 1.0 GB，请清理旧备份」和「改动只在内存里，重启会丢失」都能过。
    const clauses = hit.detail.split(/[。，；]/).map((c) => c.trim()).filter((c) => c.length >= 4);
    assert.ok(
      clauses.length >= 2,
      `${key} 的说明只有一句「${hit.detail}」——要写清楚发生了什么、以及接下来会怎样或该做什么`,
    );
    // 也不能只是把规则名换个说法重复一遍
    assert.notEqual(hit.detail.replace(/[。！]/g, ""), rule.name, `${key} 的说明只是重复了规则名`);
    assert.ok(["critical", "warning", "info"].includes(hit.level), `${key} 的级别不合法`);
  });

  // 级别要有区分度。全设成 critical 等于没分级
  const levels = new Set(MONITOR_RULES.map((r) => r.level));
  assert.ok(levels.size >= 2, "告警级别应有区分，全是 critical 时真正的严重问题会被淹掉");
  // 求解器不可用不该是 critical：系统还能用，只是排课回退启发式
  assert.equal(
    MONITOR_RULES.find((r) => r.key === "solver_unavailable").level,
    "warning",
    "求解器不可用不影响系统运行，报成 critical 会稀释真正的严重告警",
  );
}

// ---------------------------------------------------------------------------
// 2.5 一个根因只发一条告警
//
// 数据库一断，连接检查和持久化检查会同时红——因为它们读的是同一个
// postgresHealth.lastError。收到两条通知的人得自己判断这是一件事还是两件事，
// 而这正是「告警太多所以不看了」的起点。
// ---------------------------------------------------------------------------
{
  const base = await collectMetrics(seed(), healthy);
  const disconnected = {
    ...base,
    postgres: { configured: true, connected: false, lastError: "2026-09-01 persist: ECONNREFUSED" },
  };
  const firing = evaluateRules(disconnected).filter((r) => !r.ok);
  assert.deepEqual(
    firing.map((r) => r.key),
    ["db_disconnected"],
    `数据库断开只应报一条「数据库连接」，实际报了：${firing.map((r) => r.name).join("、")}`,
  );

  // 但连接正常时的持久化失败必须报出来——这是另一回事（磁盘满、权限、约束冲突）
  const persistOnly = {
    ...base,
    postgres: { configured: true, connected: true, lastError: "2026-09-01 persist: 写入超时" },
  };
  const hit = evaluateRules(persistOnly).filter((r) => !r.ok);
  assert.deepEqual(hit.map((r) => r.key), ["persist_failed"], "连接正常时的持久化失败要单独报");

  // 连接期的抖动（pool / ping）不该被当成持久化失败
  const poolBlip = {
    ...base,
    postgres: { configured: true, connected: true, lastError: "2026-09-01 pool: 连接重建" },
  };
  assert.deepEqual(
    evaluateRules(poolBlip).filter((r) => !r.ok),
    [],
    "连接池抖动不是持久化失败，报出来只会让人去查一个不存在的问题",
  );
}

// ---------------------------------------------------------------------------
// 3. 同一个故障只报一次 —— 这是整个模块最重要的一条
// ---------------------------------------------------------------------------
{
  const bad = [{ key: "db_disconnected", name: "数据库连接", level: "critical", ok: false, detail: "断开了" }];
  const t0 = Date.parse("2026-09-01T10:00:00Z");

  const first = diffAlerts({}, bad, t0);
  assert.equal(first.alerts.length, 1, "首次异常应告警");
  assert.equal(first.alerts[0].kind, "raised");

  // 接下来一小时里每五分钟一轮，一条都不该再发
  let state = first.nextState;
  let extra = 0;
  for (let i = 1; i <= 12; i += 1) {
    const r = diffAlerts(state, bad, t0 + i * 5 * 60000);
    extra += r.alerts.length;
    state = r.nextState;
  }
  assert.equal(extra, 0, `故障持续期间不应重复告警，实际多发了 ${extra} 条——这正是监控被设为免打扰的原因`);
}

// ---------------------------------------------------------------------------
// 4. 但持续异常要按冷却期重播
//
// 完全不重播的话，凌晨两点断开的告警到早上就被后来的通知翻没了。
// ---------------------------------------------------------------------------
{
  const bad = [{ key: "db_disconnected", name: "数据库连接", level: "critical", ok: false, detail: "断开了" }];
  const t0 = Date.parse("2026-09-01T02:00:00Z");
  const first = diffAlerts({}, bad, t0);

  const within = diffAlerts(first.nextState, bad, t0 + 5 * 3600000);
  assert.equal(within.alerts.length, 0, "冷却期内不重播");

  const after = diffAlerts(first.nextState, bad, t0 + 7 * 3600000);
  assert.equal(after.alerts.length, 1, "超过冷却期应重播一次");
  assert.equal(after.alerts[0].kind, "reminder", "重播要标成「持续」，不是新触发");
  assert.equal(
    after.alerts[0].firstSeenAt,
    new Date(t0).toISOString(),
    "重播要带上最初发生的时间——「已经持续 7 小时」和「刚刚发生」是两回事",
  );
}

// ---------------------------------------------------------------------------
// 5. 恢复了要报
//
// 只报坏不报好，人就不知道现在到底行不行，只能自己去查——那告警白发了。
// ---------------------------------------------------------------------------
{
  const bad = [{ key: "db_disconnected", name: "数据库连接", level: "critical", ok: false, detail: "断开了" }];
  const good = [{ key: "db_disconnected", name: "数据库连接", level: "critical", ok: true, detail: "" }];
  const t0 = Date.parse("2026-09-01T10:00:00Z");

  const first = diffAlerts({}, bad, t0);
  const recovered = diffAlerts(first.nextState, good, t0 + 600000);
  assert.equal(recovered.alerts.length, 1, "恢复应告警");
  assert.equal(recovered.alerts[0].kind, "resolved");
  assert.equal(recovered.alerts[0].level, "info", "恢复通知不该再是严重级别");
  assert.match(recovered.alerts[0].detail, /恢复/);

  // 恢复之后再检查，不该反复报「已恢复」
  const stable = diffAlerts(recovered.nextState, good, t0 + 1200000);
  assert.equal(stable.alerts.length, 0, "恢复通知也只发一次");

  // 一直正常的项从头到尾都不该发任何东西
  assert.equal(diffAlerts({}, good, t0).alerts.length, 0, "一直正常的项不应产生通知");
}

// ---------------------------------------------------------------------------
// 6. 一条规则炸了不能拖垮其余检查
// ---------------------------------------------------------------------------
{
  const boom = {
    key: "boom",
    name: "会炸的检查",
    level: "warning",
    check: () => {
      throw new Error("故意炸的");
    },
  };
  const ok = { key: "fine", name: "正常检查", level: "info", check: () => null };
  const results = evaluateRules({}, [boom, ok]);
  assert.equal(results.length, 2, "一条炸了，其余仍要有结论");
  assert.equal(results[0].ok, false, "检查自身失败也是需要知道的事实，不能当成正常吞掉");
  assert.match(results[0].detail, /监控检查执行失败/);
  assert.equal(results[1].ok, true, "其余检查不受影响");
}

// ---------------------------------------------------------------------------
// 7. 三个通道都要送到，而且互不牵连
//
// webhook 挂了不能让监控挂掉——那就成了「监控系统故障导致服务不可用」。
// ---------------------------------------------------------------------------
{
  const alerts = [{ key: "x", name: "数据库连接", level: "critical", kind: "raised", detail: "断开了" }];

  const logs = [];
  const log = { error: (m) => logs.push(m), warn: (m) => logs.push(m) };
  const db = seed();
  const notes = [];
  const createNotification = (_db, opts) => notes.push(opts);

  const delivered = await dispatchAlerts(alerts, {
    db,
    createNotification,
    log,
    env: { MONITOR_WEBHOOK_URL: "https://example.invalid/hook" },
    fetchImpl: async () => {
      throw new Error("网络不通");
    },
  });

  assert.equal(delivered.log, 1, "日志是运维唯一能翻历史的地方");
  assert.equal(delivered.notification, 1, "站内通知让管理员登录就能看到");
  assert.equal(delivered.webhook, 0, "webhook 失败应计 0");
  assert.equal(notes[0].audience, "system_admin", "监控告警只发给系统管理员");
  assert.equal(notes[0].source, "系统监控");
  assert.ok(
    logs.some((l) => /webhook/.test(l)),
    "webhook 失败要留下痕迹，静默失败会让人以为钉钉那边收到了",
  );

  // 没配 webhook 不算错误
  const noHook = await dispatchAlerts(alerts, { db, createNotification, log, env: {} });
  assert.equal(noHook.webhook, 0);

  // 站内通知发不出去也不能影响日志
  const brokenNotify = await dispatchAlerts(alerts, {
    db,
    createNotification: () => {
      throw new Error("通知模块坏了");
    },
    log,
    env: {},
  });
  assert.equal(brokenNotify.log, 1, "通知发不出去，日志仍要写");
}

// ---------------------------------------------------------------------------
// 8. 告警文案要能直接读懂
// ---------------------------------------------------------------------------
{
  const line = alertLine({ name: "数据库连接", level: "critical", kind: "raised", detail: "连接已断开" });
  assert.match(line, /\[monitor\]/, "要有统一前缀，运维才好 grep");
  assert.match(line, /触发/);
  assert.match(line, /严重/, "级别要用中文——看日志的是学校的人");
  assert.match(alertLine({ name: "x", level: "info", kind: "resolved", detail: "好了" }), /恢复/);
  assert.match(alertLine({ name: "x", level: "warning", kind: "reminder", detail: "还没好" }), /持续/);
}

// ---------------------------------------------------------------------------
// 9. 监控器端到端
// ---------------------------------------------------------------------------
{
  const db = seed();
  const notes = [];
  const monitor = createMonitor({
    createNotification: (_db, opts) => notes.push(opts),
    log: { error: () => {}, warn: () => {} },
    env: {},
  });

  const first = await monitor.run(db, healthy);
  assert.equal(first.healthy, true, "健康状态下应为 healthy");
  assert.equal(first.alerts.length, 0, "健康时不发通知");
  assert.equal(notes.length, 0);

  const broken = await monitor.run(db, {
    ...healthy,
    postgresHealth: { configured: true, connected: false, lastError: "ECONNREFUSED" },
  });
  assert.equal(broken.healthy, false);
  assert.equal(broken.alerts.length, 1, "故障应告警");
  assert.equal(notes.length, 1);

  // 再跑一轮，同一个故障不重复
  await monitor.run(db, { ...healthy, postgresHealth: { configured: true, connected: false, lastError: "ECONNREFUSED" } });
  assert.equal(notes.length, 1, "同一故障不应重复通知");

  // 恢复
  const fixed = await monitor.run(db, healthy);
  assert.equal(fixed.healthy, true);
  assert.equal(notes.length, 2, "恢复应通知一次");
  assert.match(notes[1].title, /已恢复/);

  assert.ok(monitor.latest(), "应能取到最近一轮结果，供 /api/monitoring 直接返回");
}

// ---------------------------------------------------------------------------
// 10. 文件模式不该报数据库断开
//
// 开发环境用 JSON 文件跑，没有数据库。这里报「数据库断开」就是纯噪音。
// ---------------------------------------------------------------------------
{
  const metrics = await collectMetrics(seed(), {
    ...healthy,
    postgresHealth: { configured: false, connected: false, lastError: "" },
  });
  const hit = evaluateRules(metrics, [MONITOR_RULES.find((r) => r.key === "db_disconnected")])[0];
  assert.equal(hit.ok, true, "没配数据库时不应报数据库断开");
}

// ---------------------------------------------------------------------------
// 11. 接线：定时跑、接口在、不空转写库
// ---------------------------------------------------------------------------
{
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");

  assert.match(server, /createMonitor\(\)/, "应创建监控器实例");
  assert.match(server, /setInterval\(runMonitor/, "应定时执行，只在启动时跑一次等于没有监控");
  assert.match(server, /url\.pathname === "\/api\/monitoring"/, "应有监控状态接口");
  assert.match(server, /loginSecurityMetrics/, "登录失败统计应接进监控");

  // 每轮无条件写库，一天就是 288 次没有任何改动的持久化
  const block = server.slice(server.indexOf("const runMonitor = async"));
  const body = block.slice(0, block.indexOf("setInterval(runMonitor"));
  assert.match(body, /!==\s*before/, "只有真产生了通知才落盘，不能每轮都写库");
  assert.match(body, /catch/, "监控轮次要包异常，监控自己挂掉不能影响业务");

  // 监控接口只给系统管理员
  const route = server.slice(server.indexOf('url.pathname === "/api/monitoring"'));
  const routeBody = route.slice(0, route.indexOf("\n    // 审计报表"));
  assert.match(routeBody, /requireAuth\(req, res, db, \["system_admin"\]\)/, "监控数据只给系统管理员");
  assert.match(routeBody, /monitor\.latest\(\) \|\|/, "还没跑过时应现跑一轮，不要回空让界面白屏");
}

// ---------------------------------------------------------------------------
// 12. postgres 模式下持久化失败必须记进 storageHealth
//
// persistDatabaseToPostgres 失败时只写 postgresHealth.lastError 然后抛出，
// storageHealth.lastSaveError 一直是空的——而 /api/health 正把它当作
// 「最近一次保存有没有失败」对外报。运维看健康检查，看到的是一个假的「没问题」。
//
// 这条用源码断言而不是跑一次真实的失败持久化：要造出真实失败得起一个坏掉的
// 数据库，成本远高于它能多抓到的东西。
// ---------------------------------------------------------------------------
{
  const storage = await fs.readFile(new URL("../server/storage.js", import.meta.url), "utf-8");
  const fn = storage.slice(storage.indexOf("async function persistDatabase(db)"));
  const body = fn.slice(0, fn.indexOf("\nasync function ") > 0 ? fn.indexOf("\nasync function ") : 2000);
  const pgBranch = body.slice(body.indexOf('if (DB_DRIVER === "postgres")'), body.indexOf('if (DB_DRIVER === "dual")'));

  assert.match(pgBranch, /catch\s*\(/, "postgres 分支的持久化要捕获失败");
  assert.match(
    pgBranch,
    /storageHealth\.lastSaveError\s*=\s*`/,
    "失败时必须写 storageHealth.lastSaveError，否则 /api/health 会报一个假的「保存正常」",
  );
  assert.match(pgBranch, /throw error/, "记录之后仍要抛出，调用方要知道保存失败了");

  // 顺序：先记录再抛，反了的话记录那行永远执行不到
  assert.ok(
    pgBranch.indexOf("storageHealth.lastSaveError") < pgBranch.lastIndexOf("throw error"),
    "要先记录再抛出",
  );
}

// ---------------------------------------------------------------------------
// 13. 界面接得上
// ---------------------------------------------------------------------------
{
  const app = await fs.readFile(new URL("../app.js", import.meta.url), "utf-8");
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");

  assert.match(html, /data-view="monitoring" data-role="system_admin"/, "监控只对系统管理员开放");
  assert.match(html, /id="monitoringView"/, "应有监控视图容器");
  assert.match(app, /renderStep\("系统监控", renderMonitoringView\)/, "应注册渲染函数，否则菜单点进去空白");
  assert.match(app, /apiRequest\("\/api\/monitoring"\)/, "界面应调用监控接口");

  // 视图注册表与导航的角色要一致
  const viewRole = (app.match(/monitoring:\s*\{\s*role:\s*"([^"]*)"/) || [, ""])[1];
  assert.equal(viewRole, "system_admin", "views 注册表的角色应与导航一致");

  // 正常项也要列出来
  const fn = app.slice(app.indexOf("function renderMonitoring()"));
  const body = fn.slice(0, fn.indexOf("\nfunction renderMonitoringView"));
  assert.match(
    body,
    /\.filter\(\(c\) => c\.ok\)/,
    "正常项也要显示——只列异常的话，空列表分不清是「都正常」还是「检查根本没跑」",
  );
  assert.ok(
    body.indexOf("failing") < body.indexOf("filter((c) => c.ok)"),
    "异常项要排在前面",
  );
}

console.log("monitoring checks passed");
