#!/usr/bin/env node
// 验收性能实测（验收 4.6：列表查询 ≤2 秒、报表导出 ≤10 秒；7.8：多条件查询与导出无卡顿）
//
//   node scripts/perf-acceptance.js [BASE_URL]
//
// 与 scripts/load-test.js 的分工：那个测的是**并发承载**（3000 人同时在线扛不扛得住），
// 这个测的是**单次响应时间**（点一下要等多久）。验收 4.6 现场会拿秒表掐的是后者。
//
// 两条口径上的讲究：
//
// 1. 报**中位数与 P95**，不报平均值。平均值会被一次慢请求带偏，也会被
//    一堆快请求掩盖掉真实的卡顿；验收现场是人点一下等一下，他感受到的是
//    「大多数时候多久」和「最慢的时候多久」。
//
// 2. 先热身再计时。首次请求要建连接、装载缓存、编译正则，那个数字既不代表
//    日常使用，报出去也只会让人以为系统慢。热身的请求不计入统计。

import http from "node:http";
import { URL } from "node:url";

const BASE = process.argv[2] || "http://127.0.0.1:4173";
const ROUNDS = Number(process.env.PERF_ROUNDS || 12);
const WARMUP = 3;

// 阈值直接来自验收条文，不自己定一个宽松的
const LIMITS = { list: 2000, export: 10000 };

function request(method, path, token, body) {
  const url = new URL(path, BASE);
  return new Promise((resolve, reject) => {
    const started = process.hrtime.bigint();
    const req = http.request(
      {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
      },
      (res) => {
        let size = 0;
        const chunks = [];
        res.on("data", (c) => {
          size += c.length;
          chunks.push(c);
        });
        res.on("end", () =>
          resolve({
            ms: Number(process.hrtime.bigint() - started) / 1e6,
            status: res.statusCode,
            bytes: size,
            head: Buffer.concat(chunks).toString("utf-8"),
          }),
        );
      },
    );
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function login(username, password = "123456") {
  const url = new URL("/api/auth/login", BASE);
  return new Promise((resolve, reject) => {
    const req = http.request(
      { method: "POST", hostname: url.hostname, port: url.port, path: url.pathname, headers: { "Content-Type": "application/json" } },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw).token || "");
          } catch {
            reject(new Error(`登录失败：${raw.slice(0, 120)}`));
          }
        });
      },
    );
    req.on("error", reject);
    req.write(JSON.stringify({ username, password }));
    req.end();
  });
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length * p) / 100))];
}

async function measure(name, kind, method, path, token, body) {
  // 热身：首次请求要建连接、装缓存，那个数字不代表日常使用
  for (let i = 0; i < WARMUP; i += 1) await request(method, path, token, body);

  const samples = [];
  let status = 0;
  let bytes = 0;
  let head = "";
  for (let i = 0; i < ROUNDS; i += 1) {
    const r = await request(method, path, token, body);
    samples.push(r.ms);
    status = r.status;
    bytes = r.bytes;
    head = r.head;
  }

  // 在空数据上计时没有意义：0 条记录的列表当然快，报「通过」是自欺欺人。
  // 验收现场是有数据的，所以这里要把「空」单独标出来，而不是混进通过项。
  const empty = isEmptyPayload(head);

  const median = percentile(samples, 50);
  const p95 = percentile(samples, 95);
  const limit = LIMITS[kind];
  // 用 P95 判定而不是中位数：验收现场点几下，碰上慢的那次就是慢的
  const pass = status < 400 && p95 <= limit && !empty;
  return { name, kind, status, bytes, median, p95, max: Math.max(...samples), limit, pass, empty };
}

/**
 * 响应里有没有实际数据。空列表、空网格都算没有。
 *
 * 必须拿完整响应来判：导出接口把 total 放在几 MB 的 content 之后，
 * 只截前几 KB 的话根本看不到它，所有导出都会被误判成「无数据」——
 * 而它们恰恰是数据量最大的那几项。（这个错我犯了两次：先是 JSON.parse
 * 截断失败落到按字节判断，改成正则后又因为字段排在 content 后面而失效。）
 */
function isEmptyPayload(text) {
  if (!text) return true;
  try {
    const body = JSON.parse(text);
    if (Array.isArray(body.items)) return body.items.length === 0;
    if (Array.isArray(body.rows)) return body.rows.length === 0;
    if (Array.isArray(body.ledgers)) return body.ledgers.length === 0;
    if (body.grid) return !body.grid.lessonCount;
    if (body.total !== undefined) return Number(body.total) === 0;
    if (body.meta?.total !== undefined) return Number(body.meta.total) === 0;
    return false;
  } catch {
    // 非 JSON 响应：按内容长度判断
    return text.length < 64;
  }
}

const results = [];

function fmt(r) {
  const mark = r.empty ? "?" : r.pass ? "✓" : "✗";
  const note = r.empty ? "   ← 无数据，本次计时不作数" : r.status >= 400 ? `   HTTP ${r.status}` : "";
  return `  ${mark} ${r.name.padEnd(24)} 中位 ${r.median.toFixed(0).padStart(5)} ms   P95 ${r.p95.toFixed(0).padStart(5)} ms   ${(r.bytes / 1024).toFixed(1).padStart(6)} KB${note}`;
}
const fail = (msg) => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

console.log(`验收性能实测：${BASE}`);
console.log(`每项热身 ${WARMUP} 次后取 ${ROUNDS} 次样本\n`);

let admin;
let finance;
let teacher;
try {
  admin = (await login("sysadmin")) || (await login("admin"));
  finance = await login("finance_primary");
  teacher = await login("teacher");
} catch (error) {
  fail(`无法登录，服务是否已启动？${error.message}`);
}
if (!admin) fail("管理员登录失败");

// 取一个真实存在的班级，并找出它确实有课的那一周，用于按真实用法计时。
//
// 两个坑：/api/classrooms 返回的是**教室**不是班级（拿教室 ID 当班级用，
// 导出结果自然是空的）；以及随便挑一周可能那周就是没课。
// 在空数据上计时得出的「很快」毫无意义。
let sampleClassId = "";
let sampleWeek = "";
try {
  const csv = JSON.parse((await request("GET", "/api/data-porting/classes/export", admin)).head);
  sampleClassId = (csv.content || "").split("\n")[1]?.split(",")[0] || "";
} catch {
  /* 取不到就退化成不指定班级 */
}
if (sampleClassId) {
  const grid = JSON.parse(
    (await request("GET", `/api/schedule/grid?dimension=class&targetId=${sampleClassId}`, admin)).head || "{}",
  );
  const firstDate = grid.grid?.cells?.flat(2)?.[0]?.date || "";
  if (firstDate) {
    // 回退到该日期所在周的周一
    const [y, m, d] = firstDate.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
    sampleWeek = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  }
}
if (!sampleClassId) console.log("  ⚠ 未能取到班级，课表导出将按全校口径计时\n");

// --- 列表查询（验收 4.6：≤2 秒）---
const listCases = [
  ["教师列表（1000+ 人）", "GET", "/api/teachers?page=1&pageSize=50", admin],
  ["人事档案列表", "GET", "/api/hr/employees?page=1&pageSize=50", admin],
  ["人事多条件筛选", "GET", "/api/hr/employees?stageId=primary&status=active&page=1&pageSize=50", admin],
  ["教学资源台账", "GET", "/api/resource-ledger", admin],
  ["账套清单", "GET", "/api/ledgers", admin],
  ["审批单列表", "GET", "/api/oa/requests?scope=all&pageSize=20", admin],
  ["老师本人课表", "GET", "/api/schedule/grid", teacher],
  ["周教学工作量台账", "GET", "/api/reports/weekly-workload?weekStart=2026-06-15&includeIdle=false", finance],
  ["年度薪资汇总", "GET", "/api/reports/annual-salary?year=2026", finance],
];

console.log("列表查询（阈值 2 秒）");
for (const [name, method, path, token] of listCases) {
  if (!token) continue;
  const r = await measure(name, "list", method, path, token);
  results.push(r);
  console.log(
    fmt(r),
  );
}

// --- 报表导出（验收 4.6：≤10 秒）---
const exportCases = [
  // 用真实用法：界面上是「选一个班、看某一周」。不带 targetId 会导出
  // 全校整学年，那是没人会做的操作，拿它计时等于在测一个不存在的场景。
  ["课表 Excel 导出（单班单周）", "GET", `/api/schedule/export?dimension=class&targetId=${sampleClassId}${sampleWeek ? `&weekStart=${sampleWeek}` : ""}`, admin],
  ["课表 Excel 导出（单班整学期）", "GET", `/api/schedule/export?dimension=class&targetId=${sampleClassId}`, admin],
  ["周工作量台账导出", "GET", "/api/reports/weekly-workload?weekStart=2026-06-15&format=excel", finance],
  ["年度薪资汇总导出", "GET", "/api/reports/annual-salary?year=2026&format=excel", finance],
  ["应发工资明细表导出", "GET", "/api/payroll/export?month=2026-06&format=excel", finance],
  ["教学资源台账导出", "GET", "/api/resource-ledger?format=excel", admin],
  ["班级批量导出", "GET", "/api/data-porting/classes/export", admin],
  ["教室批量导出", "GET", "/api/data-porting/rooms/export", admin],
];

console.log("\n报表导出（阈值 10 秒）");
for (const [name, method, path, token] of exportCases) {
  if (!token) continue;
  const r = await measure(name, "export", method, path, token);
  results.push(r);
  console.log(
    fmt(r),
  );
}

// --- 汇总 ---
const empties = results.filter((r) => r.empty);
const failed = results.filter((r) => !r.pass && !r.empty);
const worst = results.reduce((a, b) => (b.p95 > a.p95 ? b : a), results[0]);

console.log("\n" + "─".repeat(72));
console.log(
  `共测 ${results.length} 项：通过 ${results.length - failed.length - empties.length} 项` +
    (failed.length ? `，未达标 ${failed.length} 项` : "") +
    (empties.length ? `，${empties.length} 项因无数据未能计时` : ""),
);
if (empties.length) {
  console.log("\n以下项目当前没有数据，计时结果不作数（验收现场是有数据的）：");
  empties.forEach((r) => console.log(`  ${r.name}`));
}
console.log(
  `最慢的一项：${worst.name}  P95 ${worst.p95.toFixed(0)} ms（阈值 ${worst.limit} ms，余量 ${(((worst.limit - worst.p95) / worst.limit) * 100).toFixed(0)}%）`,
);
if (failed.length) {
  console.log("\n未达标：");
  failed.forEach((r) =>
    console.log(`  ${r.name}：P95 ${r.p95.toFixed(0)} ms，超出阈值 ${r.limit} ms${r.status >= 400 ? `（HTTP ${r.status}）` : ""}`),
  );
}
console.log(
  `\n数据规模会影响结果。本次测的是当前库的数据量，` +
    `验收前应在接近真实体量的数据上重跑一次。`,
);

process.exitCode = failed.length ? 1 : 0;
