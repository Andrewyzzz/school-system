// 三份模块操作手册（验收 9.1 / 9.2 / 9.3）与账套操作手册（9.8）
//
// 操作手册唯一真正会害人的错误是**描述一个不存在的按钮**。校方培训时照着做，
// 找不到那个按钮，第一反应是「系统坏了」或「我不会用」，而不是「手册过时了」。
// 而界面改名、挪位置、删按钮都不会让手册报错——它就是一份 Markdown。
//
// 所以这里把手册里写到的每个菜单名和按钮名，拿去界面代码里逐个核对。
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const docsDir = new URL("../docs/", import.meta.url);
const app = await fs.readFile(new URL("../app.js", import.meta.url), "utf-8");
const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf-8");
const ui = `${html}\n${app}`;

const MANUALS = [
  { file: "操作手册-人事模块.md", item: "9.1", label: "人事模块" },
  { file: "操作手册-排课模块.md", item: "9.2", label: "排课模块" },
  { file: "操作手册-工资结算模块.md", item: "9.3", label: "工资结算模块" },
  { file: "操作手册-账套.md", item: "9.8", label: "账套" },
];

const texts = new Map();
for (const m of MANUALS) {
  texts.set(m.file, await fs.readFile(new URL(m.file, docsDir), "utf-8"));
}

// ---------------------------------------------------------------------------
// 1. 手册里用反引号标出的控件名，界面上必须真的有
//
// 约定：手册中的按钮、页签、输入框一律写成 `控件名`。这个约定的意义就是
// 让它可以被机械核对——没有约定，手册里的按钮名就没法和界面对上。
// ---------------------------------------------------------------------------
{
  // 界面上真实存在的可点击文案
  const controls = new Set();
  for (const m of html.matchAll(/<button[^>]*>\s*(?:<span[^>]*>[^<]*<\/span>\s*)?([^<\n]+)/g)) {
    const t = m[1].trim();
    if (t && !t.startsWith("<")) controls.add(t);
  }
  // app.js 里动态渲染的按钮
  for (const m of app.matchAll(/>([^<>{}$\n]{2,16})<\/button>/g)) controls.add(m[1].trim());
  // 三元表达式生成的按钮文案：${isDisabled ? "启用账号" : "停用账号"}
  for (const m of app.matchAll(/\?\s*"([^"\n]{2,16})"\s*:\s*"([^"\n]{2,16})"/g)) {
    controls.add(m[1].trim());
    controls.add(m[2].trim());
  }
  // 查表得到的按钮文案：${LEDGER_ACTION_LABELS[to]}。
  // 不把这类算进来，会把「界面上确实有这个按钮」误报成「手册写错了」——
  // 而误报比漏报更糟：它会逼着人去改本来正确的手册。
  for (const m of app.matchAll(/const \w*LABELS\w* = \{([^}]*)\}/g)) {
    for (const e of m[1].matchAll(/"([^"\n]{2,16})"/g)) controls.add(e[1].trim());
  }
  // placeholder 也算控件提示（例如「状态变更原因（必填）」）
  for (const m of ui.matchAll(/placeholder="([^"]{2,40})"/g)) controls.add(m[1].trim());
  // 表头也是手册要指给人看的界面文案（「看清单的可写列」），
  // 而且列改名了手册同样会失效——和按钮一样要核对
  for (const m of ui.matchAll(/<th>([^<\n{}$]{2,16})<\/th>/g)) controls.add(m[1].trim());
  assert.ok(controls.size > 80, `应能从界面解析出足够多的控件，实际 ${controls.size} 个`);

  // 不是控件的反引号内容：命令、文件路径、期间示例、英文标识符。
  // 文件路径要按「以已知扩展名结尾」判断，不能用 [\w./-]+ ——
  // \w 不含中文，docs/运维手册.md 会漏网，然后被当成「手册写了个不存在的按钮」。
  const NOT_A_CONTROL = /^(npm |node )|\.(js|md|json|csv|xls|xlsx|pdf|sh)$|^\d{4}[-\d]*$|^[a-z_]+$/;

  const missing = [];
  for (const { file, label } of MANUALS.map((m) => ({ ...m }))) {
    const text = texts.get(file);
    for (const m of text.matchAll(/`([^`\n]+)`/g)) {
      const name = m[1].trim();
      if (NOT_A_CONTROL.test(name)) continue;
      if (!controls.has(name)) missing.push(`${label}：\`${name}\``);
    }
  }
  assert.deepEqual(
    missing,
    [],
    `以下控件在手册里写着，界面上却找不到——校方照着做会以为系统坏了：\n  ${missing.join("\n  ")}`,
  );
}

// ---------------------------------------------------------------------------
// 2. 手册里提到的菜单名必须与侧边栏一致
// ---------------------------------------------------------------------------
{
  const navLabels = new Set();
  for (const m of html.matchAll(/data-view="\w+" data-role="[^"]*"[^>]*>\s*<span[^>]*>[^<]*<\/span>\s*([^\n<]+)/g)) {
    navLabels.add(m[1].trim());
  }
  assert.ok(navLabels.size >= 20, `应能解析出侧边栏菜单，实际 ${navLabels.size} 个`);

  const missing = [];
  for (const { file, label } of MANUALS) {
    const text = texts.get(file);
    // 约定：手册中写成「菜单：xxx」
    for (const m of text.matchAll(/菜单：([^）)，,、\n]+)/g)) {
      const name = m[1].trim().replace(/[，,].*$/, "");
      if (!navLabels.has(name)) missing.push(`${label}：菜单「${name}」`);
    }
  }
  assert.deepEqual(missing, [], `手册提到了不存在的菜单：\n  ${missing.join("\n  ")}`);
}

// ---------------------------------------------------------------------------
// 3. 每份手册都要覆盖该模块的主要菜单
//
// 只写「怎么点一个按钮」不算操作手册。校方培训要照着它把一个月的活干完，
// 模块的主要入口一个都不能漏。
// ---------------------------------------------------------------------------
{
  const REQUIRED = {
    "操作手册-人事模块.md": ["人员档案", "组织与岗位", "人事审批", "人事审计", "审批中心"],
    "操作手册-排课模块.md": ["行政排课", "课表总览", "基础数据", "我的课表", "课时任务", "我的课时"],
    "操作手册-工资结算模块.md": ["薪资结算", "财务首页", "工资记录", "薪资配置", "工资确认", "账套管理", "统计报表"],
    "操作手册-账套.md": ["账套管理", "审批中心"],
  };
  Object.entries(REQUIRED).forEach(([file, menus]) => {
    const text = texts.get(file);
    const missing = menus.filter((menu) => !text.includes(menu));
    assert.deepEqual(missing, [], `${file} 没有覆盖这些菜单：${missing.join("、")}`);
  });
}

// ---------------------------------------------------------------------------
// 4. 不可逆操作必须在手册里被标成不可逆
//
// 手册漏掉这些，培训完的人会在真实数据上试出来。
// ---------------------------------------------------------------------------
{
  const warnings = [
    ["操作手册-人事模块.md", /不物理删除|不提供物理删除/, "必须说明员工档案不会被物理删除"],
    ["操作手册-人事模块.md", /只能追加|不能修改和删除/, "必须说明人事审计只追加"],
    ["操作手册-排课模块.md", /发布/, "必须说明发布是分水岭"],
    ["操作手册-排课模块.md", /草稿/, "必须说明发布前是草稿"],
    ["操作手册-工资结算模块.md", /锁定后.*不可再写入|锁定后当月薪资账套不可再写入/, "必须说明锁定后不可写"],
    ["操作手册-工资结算模块.md", /覆盖不可撤销|不可撤销/, "必须说明覆盖恢复不可撤销"],
    ["操作手册-工资结算模块.md", /归档是终态|不可逆/, "必须说明归档不可逆"],
    ["操作手册-工资结算模块.md", /对不平不要发钱|对账/, "必须说明发钱前要对账"],
    ["操作手册-账套.md", /归档是终态，不可逆|归档不可逆/, "必须说明归档不可逆"],
    ["操作手册-账套.md", /覆盖不可撤销/, "必须说明覆盖恢复不可撤销"],
    ["操作手册-账套.md", /界面上没有直接解锁的按钮|不要试图找直接解锁的按钮/, "必须说明解锁只能走审批"],
    ["操作手册-账套.md", /不提供删除账套|不能。系统不提供删除账套/, "必须说明账套不能删除"],
  ];
  warnings.forEach(([file, pattern, why]) => {
    assert.match(texts.get(file), pattern, `${file}：${why}`);
  });
}

// ---------------------------------------------------------------------------
// 5. 手册之间不能互相矛盾
//
// 三份手册分给三个岗位，同一件事在两份里写法不一致，两个岗位就会各做各的。
// 「职称以人事为准」是最典型的：人事手册说改这里，工资手册说改那里，
// 结果谁也改不动，还互相怪对方。
// ---------------------------------------------------------------------------
{
  const hr = texts.get("操作手册-人事模块.md");
  const payroll = texts.get("操作手册-工资结算模块.md");
  const scheduling = texts.get("操作手册-排课模块.md");

  assert.match(payroll, /职称以人事档案为准|职称必须在\*\*人事档案\*\*里改/, "工资手册要写明职称在人事侧改");
  assert.ok(
    !/在工资侧(修改|改)职称/.test(payroll) || /改不动|不要也不能/.test(payroll),
    "工资手册不能给出「在工资侧改职称」的做法",
  );
  assert.match(hr, /排课.*立刻|立刻就是新的/, "人事手册要写明改动会实时同步到排课");
  assert.match(scheduling, /读人事档案|读的是人事档案/, "排课手册要写明老师信息来自人事档案");

  // 三份手册都要说明「不要绕过系统改数据库」——这是最容易造成不可查问题的操作
  [hr, payroll].forEach((text, i) => {
    assert.match(text, /不要绕过系统改库|不要绕过系统改数据库/, `第 ${i + 1} 份手册应劝阻直接改库`);
  });
}

// ---------------------------------------------------------------------------
// 5.5 账套手册要能当现场验收脚本用
//
// 第八章 18 项里有 12 项的验收方式是「现场执行」。验收当天校方多半就是照着
// 这份手册走流程——漏掉一项，那一项现场就没人知道该点哪里。
// ---------------------------------------------------------------------------
{
  const ledger = texts.get("操作手册-账套.md");
  const missing = [];
  for (let i = 1; i <= 18; i += 1) {
    if (!ledger.includes(`8.${i}`)) missing.push(`8.${i}`);
  }
  assert.deepEqual(missing, [], `账套手册的现场演示脚本漏了这些验收项：${missing.join("、")}`);

  // 每一项都要给出「怎么做」，不能只列编号
  assert.match(ledger, /## .*现场验收演示脚本/, "应有现场演示脚本一节");
  const script = ledger.slice(ledger.indexOf("现场验收演示脚本"));
  const rows = script.split("\n").filter((l) => /^\| 8\.\d+ \|/.test(l));
  assert.ok(rows.length >= 18, `演示脚本应逐项给出步骤，当前只有 ${rows.length} 行`);
  rows.forEach((line) => {
    const cells = line.split("|").map((c) => c.trim());
    assert.ok(cells[3] && cells[3].length >= 8, `${cells[1]} 的现场步骤太简略：${cells[3]}`);
  });
}

// ---------------------------------------------------------------------------
// 6. 手册要有基本的完整性
// ---------------------------------------------------------------------------
{
  MANUALS.forEach(({ file, item, label }) => {
    const text = texts.get(file);
    assert.ok(text.includes(item), `${label}手册应标注对应的验收编号 ${item}`);
    assert.match(text, /适用岗位/, `${label}手册应写明适用岗位`);
    assert.match(text, /## .*常见问题/, `${label}手册应有常见问题`);
    assert.match(text, /## .*注意事项/, `${label}手册应有注意事项`);
    assert.ok(text.length > 3000, `${label}手册太短（${text.length} 字），撑不起一次培训`);
  });
}

console.log("manual checks passed");
