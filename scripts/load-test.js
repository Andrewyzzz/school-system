// 3000 人同时在线压测脚本（零依赖，直接用 node:http）。
//
// 模型：每个虚拟用户是一个循环 —— 随机思考 3~7 秒后发一个真实业务请求
// （老师看课表 / 考勤记录 / 月度工作量 / 个人信息，行政财务看教师列表）。
// 3000 个用户按平均 5 秒一次操作换算约 600 请求/秒，比真实上下课高峰更严苛。
//
// 用法：
//   node server/server.js 先启动服务（注意 ulimit -n 至少 12000）
//   node scripts/load-test.js [BASE_URL] [USERS] [DURATION_S]
// 例如：
//   ulimit -n 12000 && node scripts/load-test.js http://127.0.0.1:4173 3000 30

import http from "node:http";
import { URL } from "node:url";

const BASE_URL = process.argv[2] || "http://127.0.0.1:4173";
const USERS = Number(process.argv[3] || 3000);
const DURATION_S = Number(process.argv[4] || 30);
const TEACHER_ACCOUNTS = 1000;

const agent = new http.Agent({ keepAlive: true, maxSockets: Infinity, maxFreeSockets: 4096 });

function request(method, path, { token, body } = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const payload = body ? JSON.stringify(body) : null;
    const startedAt = process.hrtime.bigint();
    const req = http.request(
      url,
      {
        method,
        agent,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
          let json = null;
          try {
            json = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
          } catch {
            // 非 JSON 响应按原样返回
          }
          resolve({ status: res.statusCode, elapsedMs, json });
        });
      },
    );
    req.on("error", (error) => {
      const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      resolve({ status: 0, elapsedMs, error: error.message });
    });
    if (payload) req.write(payload);
    req.end();
  });
}

const stats = new Map();

function record(label, result) {
  if (!stats.has(label)) stats.set(label, { count: 0, errors: 0, latencies: [] });
  const bucket = stats.get(label);
  bucket.count += 1;
  if (result.status !== 200) bucket.errors += 1;
  bucket.latencies.push(result.elapsedMs);
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(index, 0)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`目标 ${BASE_URL}，${USERS} 个在线用户，持续 ${DURATION_S} 秒`);

  const health = await request("GET", "/api/health");
  if (health.status !== 200) {
    console.error("服务不可用:", health.status, health.error || "");
    process.exit(1);
  }
  console.log("健康检查:", JSON.stringify(health.json).slice(0, 200));

  // 第一阶段：登录风暴。3000 个用户复用 1000 个教师账号（同一账号多端在线），
  // 外加行政/财务账号，分批并发登录并记录登录耗时。
  console.log("阶段 1：登录风暴 ...");
  const sessions = [];
  const LOGIN_BATCH = 200;
  for (let offset = 0; offset < USERS; offset += LOGIN_BATCH) {
    const batch = [];
    for (let i = offset; i < Math.min(offset + LOGIN_BATCH, USERS); i += 1) {
      const role = i % 100 === 0 ? (i % 200 === 0 ? "admin" : "finance") : "teacher";
      const username =
        role === "teacher" ? `teacher${String((i % TEACHER_ACCOUNTS) + 1).padStart(4, "0")}` : role;
      batch.push(
        request("POST", "/api/auth/login", { body: { username, password: "123456" } }).then((result) => {
          record("login", result);
          if (result.status === 200 && result.json?.token) {
            sessions.push({
              token: result.json.token,
              role,
              teacherId: result.json.account?.teacherId || null,
            });
          }
        }),
      );
    }
    await Promise.all(batch);
  }
  console.log(`登录完成：${sessions.length}/${USERS} 成功`);

  // 第二阶段：稳态在线负载
  console.log(`阶段 2：${DURATION_S} 秒稳态混合负载 ...`);
  const endAt = Date.now() + DURATION_S * 1000;
  let inflightPeak = 0;
  let inflight = 0;

  async function userLoop(session) {
    while (Date.now() < endAt) {
      await sleep(3000 + Math.random() * 4000);
      if (Date.now() >= endAt) break;
      inflight += 1;
      inflightPeak = Math.max(inflightPeak, inflight);
      const dice = Math.random();
      if (session.role === "teacher" && session.teacherId) {
        if (dice < 0.35) {
          record(
            "teacher_schedule",
            await request("GET", `/api/teachers/${session.teacherId}/schedule`, { token: session.token }),
          );
        } else if (dice < 0.6) {
          record(
            "attendance_records",
            await request("GET", `/api/teachers/${session.teacherId}/attendance-records`, {
              token: session.token,
            }),
          );
        } else if (dice < 0.8) {
          record(
            "monthly_workload",
            await request("GET", `/api/teachers/${session.teacherId}/workload?month=2026-06`, {
              token: session.token,
            }),
          );
        } else {
          record("me", await request("GET", "/api/me", { token: session.token }));
        }
      } else {
        if (dice < 0.7) {
          record(
            "teacher_list",
            await request("GET", `/api/teachers?page=${1 + Math.floor(Math.random() * 20)}&pageSize=50`, {
              token: session.token,
            }),
          );
        } else {
          record("terms", await request("GET", "/api/terms", { token: session.token }));
        }
      }
      inflight -= 1;
    }
  }

  const startedAt = Date.now();
  await Promise.all(sessions.map((session) => userLoop(session)));
  const elapsedS = (Date.now() - startedAt) / 1000;

  // 汇总报告
  console.log("\n===== 压测报告 =====");
  console.log(`稳态时长 ${elapsedS.toFixed(1)}s，瞬时并发峰值 ${inflightPeak}`);
  let totalCount = 0;
  let totalErrors = 0;
  const rows = [];
  stats.forEach((bucket, label) => {
    const sorted = [...bucket.latencies].sort((a, b) => a - b);
    totalCount += bucket.count;
    totalErrors += bucket.errors;
    rows.push({
      endpoint: label,
      count: bucket.count,
      errors: bucket.errors,
      p50: percentile(sorted, 50).toFixed(1),
      p95: percentile(sorted, 95).toFixed(1),
      p99: percentile(sorted, 99).toFixed(1),
      max: sorted.length ? sorted[sorted.length - 1].toFixed(1) : "0",
    });
  });
  console.table(rows);
  const steadyCount = totalCount - (stats.get("login")?.count || 0);
  console.log(
    `总请求 ${totalCount}（稳态 ${steadyCount}，约 ${(steadyCount / Math.max(elapsedS, 1)).toFixed(0)} req/s），错误 ${totalErrors}`,
  );
  if (totalErrors > 0) process.exitCode = 1;
}

main();
