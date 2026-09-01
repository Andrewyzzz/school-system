// 账套管理界面（验收 8.1 - 8.18）
//
// 第八章 18 项里有 12 项的验收方式写的是「现场执行」——现场新建学年账套、
// 现场走解锁审批、现场导出与恢复、现场跨年度检索。这些动作要由校方的人
// 自己在界面上点出来，只有后端接口是过不了验收的。
//
// 界面代码没有类型检查，最容易犯的两类错都是「静悄悄的」：
//   · 按钮拼了个后端不存在的路径 → 点下去 404，但代码本身完全合法
//   · 读了个后端不返回的字段     → 永远显示 0，看起来像「没数据」而不是「读错了」
// 这两类都不会让页面报错，所以只能靠把前端写的路径与字段跟后端对照来抓。
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { LEDGER_STATUSES, LEDGER_TYPES } from "../server/ledgers.js";

const app = await fs.readFile(new URL("../app.js", import.meta.url), "utf-8");
const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");

// ---------------------------------------------------------------------------
// 1. 菜单进得去，视图注册得上
// ---------------------------------------------------------------------------
{
  assert.match(html, /data-view="ledgers"/, "侧边栏应有账套管理入口");
  assert.match(html, /id="ledgersView"/, "应有账套管理视图容器");
  assert.match(app, /ledgers:\s*\{\s*role:/, "views 注册表里应有 ledgers");
  assert.match(app, /renderStep\("账套管理", renderLedgersView\)/, "应注册渲染函数，否则菜单点进去是空白");
  assert.match(app, /ledgers:\s*'<rect/, "应有导航图标，缺了会掉成占位符");
}

// ---------------------------------------------------------------------------
// 2. 菜单可见的角色必须与后端放行的角色一致
//
// 菜单里放了个后端会 403 的角色，用户点进去只会看到「加载失败」，
// 而他完全不知道是自己没权限还是系统坏了。
// ---------------------------------------------------------------------------
{
  const navRoles = new Set(
    (html.match(/data-view="ledgers" data-role="([^"]*)"/) || [, ""])[1].split(",").filter(Boolean),
  );
  assert.ok(navRoles.size > 0, "应能解析出菜单角色");

  // 后端 GET /api/ledgers 的放行角色
  const block = server.slice(server.indexOf('if (url.pathname === "/api/ledgers"'));
  const listAuth = block.slice(block.indexOf('if (req.method === "GET" && !type)'));
  const serverRoles = new Set(
    (listAuth.match(/requireAuth\(req, res, db, \[([^\]]*)\]/) || [, ""])[1]
      .split(",")
      .map((r) => r.trim().replace(/^"|"$/g, ""))
      .filter(Boolean),
  );
  assert.ok(serverRoles.size > 0, "应能解析出后端放行角色");

  const extra = [...navRoles].filter((r) => !serverRoles.has(r));
  assert.deepEqual(extra, [], `菜单对以下角色可见，但后端会拒绝，点进去只会看到加载失败：${extra.join("、")}`);

  // views 注册表的角色也要一致，否则菜单亮着但视图切不过去
  const viewRoles = new Set(
    (app.match(/ledgers:\s*\{\s*role:\s*"([^"]*)"/) || [, ""])[1].split(",").filter(Boolean),
  );
  assert.deepEqual([...viewRoles].sort(), [...navRoles].sort(), "views 注册表与导航的角色应一致");
}

// ---------------------------------------------------------------------------
// 3. 界面调用的每个账套接口，后端都要真的有
// ---------------------------------------------------------------------------
{
  // 直接扫路径字面量，不要绑在 apiRequest( 上：调用可能换行，路径也可能是普通字符串。
  // 用 apiRequest 开头的正则会漏掉这两种写法，然后「没扫到」被当成「没问题」。
  const called = new Set();
  for (const m of app.matchAll(/\/api\/(?:ledgers|reconciliation)[^`"']*/g)) called.add(m[0]);
  assert.ok(called.size >= 6, `应能解析出前端调用的账套接口，实际 ${called.size} 个：${[...called].join(" ")}`);

  const actions = [...called]
    // ${encodeURIComponent(type)} 这种插值整段折成 :x，剩下的固定段才是要核对的动作名
    .map((p) => p.replace(/\$\{[^}]*\}/g, ":x").replace(/\?.*$/, ""))
    .map((p) => p.split("/").filter(Boolean).slice(2).filter((seg) => seg !== ":x"));

  // 后端支持的动作段
  const backendActions = new Set(["backup", "transition", "carry-over", "import"]);
  actions.forEach((segs) => {
    segs.forEach((seg) => {
      assert.ok(
        backendActions.has(seg),
        `前端调用了 /api/ledgers/.../${seg}，但后端没有这个动作——点下去是 404`,
      );
    });
  });

  ["backup", "transition", "carry-over"].forEach((action) => {
    assert.ok(
      app.includes(`/${action}\``) || app.includes(`/${action}\`,`),
      `界面应能触发 ${action}，否则对应的验收项只能靠命令行演示`,
    );
  });
  assert.match(app, /apiRequest\("\/api\/ledgers\/import"/, "应有导入恢复入口（8.17）");
  assert.match(app, /\/api\/reconciliation\?month=/, "应有对账入口（8.12 - 8.14）");
}

// ---------------------------------------------------------------------------
// 4. 界面读的字段，后端要真的返回
//
// 这是最阴的一类错：字段名写错不会报错，只会永远显示 0 或空白，
// 看起来像「这个月没数据」。恢复了 300 条却显示「已恢复 0 条」，
// 操作的人会以为失败，再跑一遍。
// ---------------------------------------------------------------------------
{
  const ledgers = await import("../server/ledgers.js");
  const { createInitialData, normalizeDatabase } = await import("../server/storage.js");
  const db = createInitialData({ teacherCount: 5 });
  normalizeDatabase(db);

  const term = db.terms.find((t) => t.current) || db.terms[0];
  ledgers.initializeLedger(db, { type: "scheduling", period: term.id }, null);
  const roster = ledgers.carryOverRoster(db, "scheduling", term.id, null);
  const listed = ledgers.listLedgers(db)[0];
  const backup = ledgers.buildLedgerBackup(db, "scheduling", term.id);

  // 表格列读到的字段
  ["type", "typeLabel", "period", "periodLabel", "status", "statusLabel", "records", "writable", "loaded"].forEach(
    (f) => assert.ok(f in listed, `账套列表缺字段 ${f}，界面对应的列会是空的`),
  );
  assert.ok("unlockCount" in listed, "解锁次数是 8.10 的现场证据，列表必须返回");

  // 结转提示读的字段
  ["inServiceCount", "leftCount"].forEach((f) =>
    assert.ok(f in roster, `结转结果缺字段 ${f}，界面会显示「在职 0 人」`),
  );
  // 8.4「查看新账套是否已带入人员信息」与 8.6「查看在职与离职分列」都是看屏幕验收的。
  // 人事账套的「本期明细」按入职年份统计，新建的年度账套天然是 0——如果屏幕上只有这一个
  // 数字，校方看到 0 会判定结转失败，而实际上 1002 人都结转好了。结转人数必须单列出来。
  assert.match(app, /<th>结转在职<\/th>/, "列表应显示结转在职人数（8.4）");
  assert.match(app, /<th>结转离职<\/th>/, "列表应显示结转离职人数（8.6 要求在职与离职分列）");
  assert.match(app, /roster\?\.leftCount/, "离职人数应取自结转名册");
  assert.match(app, /roster\.inServiceCount/, "界面应读 inServiceCount");
  assert.ok(!/roster\.inService\?\.length/.test(app), "不应读不存在的 inService.length");

  // 恢复结果读的字段
  const restored = ledgers.importLedgerBackup(db, backup, { allowOverwrite: true }, null);
  ["total", "imported", "replaced"].forEach((f) =>
    assert.ok(f in restored, `恢复结果缺字段 ${f}`),
  );
  assert.match(app, /result\.total/, "界面应读 total 作为恢复条数");
  assert.ok(
    !/result\.restored/.test(app),
    "后端不返回 restored，读它会永远显示「已恢复 0 条」，操作的人以为失败会再跑一遍",
  );
}

// ---------------------------------------------------------------------------
// 5. 界面上的状态流转按钮不能是「点了必然报错」的
//
// 后端明确禁止 locked → active（解锁必须走审批，8.10）。界面上如果画了
// 一个「解锁」按钮，操作的人点下去只会拿到一个错误——这比没有按钮更糟，
// 因为他会以为系统坏了，而不是「这条路本来就得走审批」。
// ---------------------------------------------------------------------------
{
  const uiNext = (() => {
    const m = app.match(/const LEDGER_NEXT_STATUS = \{([^}]*)\}/);
    assert.ok(m, "应能解析出界面的状态流转表");
    const out = {};
    for (const entry of m[1].matchAll(/(\w+):\s*\[([^\]]*)\]/g)) {
      out[entry[1]] = entry[2].split(",").map((v) => v.trim().replace(/^"|"$/g, "")).filter(Boolean);
    }
    return out;
  })();

  Object.keys(LEDGER_STATUSES).forEach((status) => {
    assert.ok(status in uiNext, `界面的流转表缺少状态 ${status}`);
  });
  assert.deepEqual(uiNext.locked, ["archived"], "已锁定只能归档；界面不得出现直接解锁的按钮（8.10）");
  assert.deepEqual(uiNext.archived, [], "已归档是终态，不应再有操作按钮");
  assert.deepEqual(uiNext.active.sort(), ["archived", "locked"], "使用中可锁定或归档");

  // 按钮上必须写动作，不能写状态名。
  //
  // 第一版直接拿状态标签当按钮文案，按钮上写的是「已锁定」「已归档」——
  // 读起来像是在陈述当前状态，操作的人不知道点下去会发生什么，
  // 甚至会以为这一行「已经锁定了」。
  const actionLabels = (() => {
    const m = app.match(/const LEDGER_ACTION_LABELS = \{([^}]*)\}/);
    assert.ok(m, "应有独立的动作文案表，不要复用状态标签");
    const out = {};
    for (const e of m[1].matchAll(/(\w+):\s*"([^"]*)"/g)) out[e[1]] = e[2];
    return out;
  })();
  Object.entries(actionLabels).forEach(([status, label]) => {
    assert.ok(
      !label.startsWith("已"),
      `按钮文案「${label}」是状态名不是动作名——点之前它还没发生，写「已…」会让人以为已经做过了`,
    );
    assert.notEqual(label, LEDGER_STATUSES[status]?.label, `${status} 的按钮文案不应直接复用状态标签`);
  });
  assert.ok(
    app.includes("LEDGER_ACTION_LABELS[to]") && !app.includes("LEDGER_STATUS_LABELS[to] || to}</button>"),
    "按钮渲染应使用动作文案表",
  );

  // 界面的中文标签要与后端一致，不然界面写「已封存」而日志写「已归档」，对不上账
  Object.entries(LEDGER_STATUSES).forEach(([key, spec]) => {
    assert.ok(
      app.includes(`${key}: "${spec.label}"`),
      `状态 ${key} 的界面标签应与后端一致（后端是「${spec.label}」）`,
    );
  });
  Object.entries(LEDGER_TYPES).forEach(([key, spec]) => {
    assert.ok(
      app.includes(`${key}: "${spec.label}"`),
      `账套类型 ${key} 的界面标签应与后端一致（后端是「${spec.label}」）`,
    );
  });
}

// ---------------------------------------------------------------------------
// 6. 不可撤销的操作要先确认，且必须留下原因
//
// 锁定要走审批才能解，归档会把数据卸出内存，覆盖恢复不可撤销。
// 这三件事都不能一次误点就生效。
// ---------------------------------------------------------------------------
{
  const transition = app.slice(app.indexOf("async function transitionLedgerState"));
  const body = transition.slice(0, transition.indexOf("\n}\n"));
  assert.match(body, /window\.prompt/, "状态流转应要求填写原因");
  assert.match(body, /必须填写原因/, "原因为空时应拦下——这条要写进操作日志（8.10）");
  assert.ok(
    body.includes("reason === null") && body.indexOf("reason === null") < body.indexOf("apiRequest"),
    "用户取消输入时应直接返回，不能继续提交",
  );

  const restore = app.slice(app.indexOf("async function restoreLedgerBackup"));
  const restoreBody = restore.slice(0, restore.indexOf("\n}\n"));
  assert.match(restoreBody, /window\.confirm/, "覆盖恢复应二次确认");
  assert.ok(
    restoreBody.indexOf("window.confirm") < restoreBody.indexOf('apiRequest("/api/ledgers/import"'),
    "确认必须在请求之前",
  );
}

// ---------------------------------------------------------------------------
// 7. 只读角色不该看到操作面板
//
// 校领导、人事看得到账套边界（8.1），但建立与恢复不是他们的活。
// 按钮画出来点不动，比不画更让人困惑。
// ---------------------------------------------------------------------------
{
  assert.match(app, /function canManageLedger/, "应区分可操作角色");
  assert.match(app, /function canRestoreLedger/, "恢复权限应单列——它能覆盖现有数据");

  const manage = app.match(/function canManageLedger[^}]*\}/)[0];
  ["system_admin", "admin", "finance"].forEach((r) =>
    assert.ok(manage.includes(`"${r}"`), `${r} 应可操作账套`),
  );
  ["principal", "division_head", "teacher"].forEach((r) =>
    assert.ok(!manage.includes(`"${r}"`), `${r} 不应有账套操作权`),
  );

  const restore = app.match(/function canRestoreLedger[^}]*\}/)[0];
  assert.match(restore, /system_admin/, "只有系统管理员能导入恢复");
  assert.ok(!restore.includes("finance"), "财务不应能覆盖账套数据");

  assert.match(app, /ledgerCreatePanel[\s\S]{0,120}hidden = !canManageLedger\(\)/, "建立面板应按角色隐藏");
  assert.match(app, /ledgerRestorePanel[\s\S]{0,120}hidden = !canRestoreLedger\(\)/, "恢复面板应按角色隐藏");
}

// ---------------------------------------------------------------------------
// 8. 差异清单截断了必须说明截断了多少
//
// 还没生成工资单的月份会一次报出全校一千多条同样的差异。截断是对的——
// 一千条一模一样的记录对人没有可操作性，全渲染还会卡页面。但**静默**截断不行：
// 屏幕上写着 200 条，看起来就是「只有 200 处差异」，实际有 1002 处。
// ---------------------------------------------------------------------------
{
  const fn = app.slice(app.indexOf("function renderLedgerReconcile"));
  const body = fn.slice(0, fn.indexOf("\nfunction "));
  assert.match(body, /DIFF_DISPLAY_LIMIT/, "差异清单应有显示上限");
  assert.match(body, /\.slice\(0, DIFF_DISPLAY_LIMIT\)/, "应按上限截断");
  assert.match(body, /omitted/, "应算出被省略的条数");
  assert.ok(
    /共 \$\{diffs\.length\} 处差异/.test(body),
    "截断时必须写出差异总数，否则看起来像「只有这么多」",
  );
  assert.ok(
    body.indexOf("omitted > 0 ?") < body.indexOf("<table"),
    "省略说明要放在表格之前——放在一屏之外等于没写",
  );
  // 汇总卡片读的是总数而不是截断后的条数，否则两处数字对不上
  assert.match(app, /value: report\.differences\?\.length \?\? 0/, "汇总里的差异数应取总数");
}

console.log("ledger UI checks passed");
