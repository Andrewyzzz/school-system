// 财务分权的隔离审计（黑盒）
//
// 前一版实现只在教师列表、工资单这几个"明显"的接口上做了范围过滤，
// 教室、组织架构、薪酬制度这些顺带能看到他部信息的接口全漏了；
// 前端各页面又各自缓存了一份数据、换账号不清，于是四个账号登进去长得一样。
//
// 这个测试不看实现，直接以四个财务账号的身份把它们有权访问的接口全部打一遍，
// 在原始响应体里搜他部关键词。新增接口若忘了收敛范围，这里就会红。
//
// 需要服务端在跑：SCHOOL_SYSTEM_BASE_URL 可覆盖，默认 http://127.0.0.1:4173
import assert from "node:assert/strict";

const BASE = process.env.SCHOOL_SYSTEM_BASE_URL || "http://127.0.0.1:4173";
const PASSWORD = process.env.SCHOOL_SYSTEM_TEST_PASSWORD || "123456";

// 每个账号「绝对不该出现」的关键词。学部之间互斥，总校财务三个学部都不该见。
const ACCOUNTS = [
  { username: "finance_primary", label: "小学部财务", forbidden: ["初中部", "高中部", '"middle"', '"high"'] },
  { username: "finance_middle", label: "初中部财务", forbidden: ["小学部", "高中部", '"primary"', '"high"'] },
  { username: "finance_high", label: "高中部财务", forbidden: ["小学部", "初中部", '"primary"', '"middle"'] },
  { username: "finance", label: "总校财务", forbidden: ["小学部", "初中部", "高中部", '"primary"', '"middle"', '"high"'] },
];

// 财务角色有权访问的读接口，逐个扫。新增财务可见接口请加到这里。
const ENDPOINTS = [
  { path: "/api/teachers?pageSize=100&month=2026-08", label: "教师列表" },
  { path: "/api/payroll/budget", label: "学期预算" },
  { path: "/api/payroll/history?month=2026-08", label: "工资记录" },
  { path: "/api/payroll/export?month=2026-08", label: "工资导出" },
  { path: "/api/payroll-rules", label: "薪酬制度" },
  { path: "/api/classrooms", label: "教室列表" },
  { path: "/api/hr/org-units", label: "组织架构" },
  { path: "/api/hr/positions", label: "岗位列表" },
  { path: "/api/hr/assessments?month=2026-08", label: "月度考核" },
  { path: "/api/hr/salary-templates", label: "薪资模板" },
  { path: "/api/notifications", label: "通知中心" },
  { path: "/api/oa/requests?scope=all", label: "审批单" },
];

async function login(username) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: PASSWORD }),
  });
  const payload = await res.json();
  assert.ok(payload.token, `${username} 登录失败：${payload.error?.message || res.status}`);
  return payload;
}

async function get(path, token) {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  return { status: res.status, text: await res.text() };
}

// 服务端没起时给出明确提示，而不是抛一堆 fetch failed
try {
  await fetch(`${BASE}/`);
} catch {
  console.error(`[skip] 服务端未运行（${BASE}），跳过隔离审计。启动后重跑：npm run test:finance-isolation`);
  process.exit(0);
}

let checked = 0;
const leaks = [];

for (const account of ACCOUNTS) {
  const session = await login(account.username);

  // 账号本身要带上范围标识，前端据此调整措辞
  assert.ok(session.account.financeScope, `${account.label} 应带 financeScope`);

  for (const endpoint of ENDPOINTS) {
    const { status, text } = await get(endpoint.path, session.token);
    // 403/404 说明这个接口本就不对该账号开放，不算泄露
    if (status === 403 || status === 404) continue;
    assert.equal(status, 200, `${account.label} 访问${endpoint.label}返回 ${status}`);
    checked += 1;
    const hits = account.forbidden.filter((word) => text.includes(word));
    if (hits.length) {
      leaks.push(`${account.label} 在「${endpoint.label}」看到了 ${hits.join("、")}`);
    }
  }
}

assert.deepEqual(leaks, [], `跨学部数据泄露：\n  ${leaks.join("\n  ")}`);

// 越权写操作同样要挡住：拿他部老师的 ID 去调本账号无权的接口
{
  const sys = await login("sysadmin");
  const middleList = await get("/api/teachers?stageId=middle&pageSize=1", sys.token);
  const middleTeacherId = JSON.parse(middleList.text).items[0]?.id;
  assert.ok(middleTeacherId, "应能取到一位初中部老师");

  const primary = await login("finance_primary");
  const denied = await get(`/api/teachers/${middleTeacherId}/payroll?month=2026-08`, primary.token);
  assert.equal(denied.status, 403, "小学部财务读初中部老师工资应被拒");

  const batch = await fetch(`${BASE}/api/payroll/batch-lock`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${primary.token}` },
    body: JSON.stringify({ month: "2026-08", teacherIds: [middleTeacherId] }),
  });
  assert.equal(batch.status, 403, "小学部财务批量锁定初中部老师工资应被拒");
}

// ---------------------------------------------------------------------------
// 前端写死的学段区块也要过滤
//
// 薪资配置页的「××部课时与自习补贴」「××部岗位津贴」是写死在 app.js 里的表单结构，
// 不由接口数据生成——服务端把他学段的数值摘掉后，标题和字段标签仍会留在页面上。
// 这里静态检查这类区块定义都带 stageId、且渲染时经过 stageGroupInFinanceScope 过滤。
// 没有浏览器自动化时，这是防止同类遗漏最省成本的一道闸。
{
  const { readFileSync } = await import("node:fs");
  const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");

  const STAGE_GROUP_CONSTANTS = ["stageLessonRuleGroups", "stageAllowanceGroups"];
  STAGE_GROUP_CONSTANTS.forEach((name) => {
    assert.ok(appSource.includes(`const ${name} = [`), `app.js 应存在 ${name} 定义`);
    // 渲染处必须挂上范围过滤
    const rendered = new RegExp(`${name}\\s*\\n?\\s*\\.filter\\(stageGroupInFinanceScope\\)`);
    assert.match(
      appSource,
      rendered,
      `${name} 渲染时必须经过 stageGroupInFinanceScope 过滤，否则学部财务会看到他部的计薪标准`,
    );
  });

  // 两组常量里的每个区块都要带 stageId，否则无从判断该不该给当前财务看。
  // 只检查这两个常量块内部，账号名、登录面板标题等其他含学段字样的文本不在此列。
  STAGE_GROUP_CONSTANTS.forEach((name) => {
    const start = appSource.indexOf(`const ${name} = [`);
    const end = appSource.indexOf("\n];", start);
    const block = appSource.slice(start, end);
    const titles = (block.match(/title: "(高中部|初中部|小学部)[^"]*"/g) || []).length;
    const tagged = (block.match(/stageId: "(high|middle|primary)"/g) || []).length;
    assert.equal(titles, 3, `${name} 应覆盖三个学段`);
    assert.equal(tagged, titles, `${name} 的每个区块都必须带 stageId，否则无法按财务范围裁剪`);
  });
}

console.log(`finance isolation checks passed（${ACCOUNTS.length} 个账号 × ${ENDPOINTS.length} 个接口，实际校验 ${checked} 次，含前端学段区块静态检查）`);
