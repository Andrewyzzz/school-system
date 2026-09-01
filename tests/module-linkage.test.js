// 三大模块联动（验收 4.1 - 4.5）
//
// 这五条的共同点是「跨模块」：改一处，另一处要跟着动。它们最容易在
// 加新功能时悄悄失效——因为每个模块单独测都是好的。
//
// 4.5 的推送尤其容易漏：新加一个写接口时忘了 broadcastEvent，功能本身
// 完全正常，只是别人要刷新页面才看得到。测出来的办法是把「所有会改
// 跨模块数据的写操作」列出来，逐个确认它们都广播了。
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";

const PORT = 4820 + (process.pid % 60);
const BASE = `http://127.0.0.1:${PORT}`;

const child = spawn(process.execPath, ["server/server.js"], {
  env: { ...process.env, PORT: String(PORT), HR_ENCRYPTION_KEY: "0".repeat(64), NODE_ENV: "test" },
  stdio: ["ignore", "pipe", "pipe"],
});
let log = "";
child.stdout.on("data", (d) => (log += d));
child.stderr.on("data", (d) => (log += d));

async function ready(timeoutMs = 40000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${BASE}/api/health`)).ok) return true;
    } catch {
      /* 还没起来 */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

const login = async (u, p = "123456") =>
  (
    await (
      await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      })
    ).json()
  ).token;

let failure = null;
try {
  assert.ok(await ready(), `服务未能启动：\n${log.slice(-1500)}`);

  const admin = (await login("sysadmin")) || (await login("admin"));
  const hr = await login("hr");
  const finance = await login("finance_primary");
  const teacher = await login("teacher");
  assert.ok(admin && hr && finance, "演示账号应能登录");

  const get = (path, token) =>
    fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const patch = (path, token, body) =>
    fetch(`${BASE}${path}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  // 找一个既有人事档案又有教师记录的人
  const employees = await (await get("/api/hr/employees?pageSize=50", hr)).json();
  const linked = (employees.items || employees.employees || []).find((e) => e.teacherId);
  assert.ok(linked, "样本里应有关联了教师的人事档案");

  // -------------------------------------------------------------------------
  // 4.1 人事→排课：教师信息实时同步
  // -------------------------------------------------------------------------
  {
    const marker = `联动${Date.now() % 100000}`;
    const res = await patch(`/api/hr/employees/${linked.id}`, hr, {
      personName: marker,
      reason: "验收 4.1 联动测试",
    });
    assert.equal(res.status, 200, "人事侧改姓名应成功");

    const teachers = await (await get(`/api/teachers?search=${linked.teacherId}`, admin)).json();
    const found = (teachers.items || teachers.teachers || []).find((t) => t.id === linked.teacherId);
    assert.ok(found, "排课侧应能查到该教师");
    assert.equal(found.name, marker, "人事改完姓名，排课侧应立即看到——不需要任何同步动作");
  }

  // -------------------------------------------------------------------------
  // 4.3 人事→工资：职称变动带入薪资标准
  //
  // 关键在「人事为准」：工资档案里的职称会被人事档案覆盖，所以改工资档案
  // 是没用的，必须从人事侧改。这一点不测出来，很容易在重构时被改反。
  // -------------------------------------------------------------------------
  {
    const readBase = async () => {
      const p = await (await get(`/api/teachers/${linked.teacherId}/payroll?month=2026-06`, finance)).json();
      const detail = p.payroll || p;
      const item = (detail.components || []).find((c) => c.name === "基本工资");
      return { amount: item?.amount, basis: item?.basis, gross: detail.grossPay };
    };

    await patch(`/api/hr/employees/${linked.id}`, hr, { titleGrade: "third", reason: "重置为三级" });
    const before = await readBase();

    await patch(`/api/hr/employees/${linked.id}`, hr, { titleGrade: "seniorTeacher", reason: "验收 4.3 职称晋升" });
    const after = await readBase();

    assert.ok(after.amount > before.amount, `职称晋升后基本工资应提高：${before.amount} → ${after.amount}`);
    assert.ok(after.gross > before.gross, "应发合计应随之提高");
    assert.match(after.basis, /高级教师/, "工资单的口径说明应写明新的职称档");
    assert.ok(!/三级教师/.test(after.basis), "不应还停留在旧档位");
  }

  // -------------------------------------------------------------------------
  // 4.4 三大模块共用一套权限，无冲突
  //
  // 只验「该拒的拒了」不够，还要验「该放的放了」——把权限收得太死同样是冲突，
  // 会让人干不了活。
  // -------------------------------------------------------------------------
  {
    const cases = [
      ["/api/hr/employees?pageSize=1", hr, 200, "人事应能读人事档案"],
      ["/api/hr/employees?pageSize=1", finance, 403, "财务不应读到人事档案"],
      ["/api/hr/employees?pageSize=1", teacher, 403, "教师不应读到他人档案"],
      ["/api/payroll/history?month=2026-06", finance, 200, "财务应能读工资记录"],
      ["/api/payroll/history?month=2026-06", hr, 403, "人事不应读工资记录"],
      ["/api/payroll/history?month=2026-06", teacher, 403, "教师不应读全量工资记录"],
      ["/api/teachers?pageSize=1", admin, 200, "教务应能读教师列表"],
      ["/api/teachers?pageSize=1", teacher, 403, "教师不应读全量教师列表"],
      ["/api/ledgers", finance, 200, "财务应能看账套"],
      ["/api/ledgers", teacher, 403, "教师不应看到账套"],
      ["/api/oa/requests?scope=todo", teacher, 200, "教师应能看自己的待办审批"],
    ];
    for (const [path, token, expected, why] of cases) {
      if (!token) continue;
      const res = await get(path, token);
      assert.equal(res.status, expected, `${why}（${path} 期望 ${expected}，实际 ${res.status}）`);
    }
  }

  // -------------------------------------------------------------------------
  // 4.5 跨模块数据修改实时推送（≤5 秒）
  //
  // SSE 的 token 走查询参数，不走 Authorization 头——浏览器原生 EventSource
  // 不支持自定义请求头。用错方式会得到 401，看起来像「推送坏了」。
  // -------------------------------------------------------------------------
  {
    const measure = async (trigger) => {
      const ctrl = new AbortController();
      const res = await fetch(`${BASE}/api/events?token=${encodeURIComponent(finance)}`, {
        signal: ctrl.signal,
      });
      assert.equal(res.status, 200, "SSE 连接应成功（token 走查询参数）");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let started = 0;
      let got = null;
      const listen = (async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          // 一个 chunk 里可能同时有 ready 和业务事件——只取第一个匹配会
          // 命中 ready 然后把真正的事件丢掉。要遍历这个 chunk 里的所有事件。
          for (const m of dec.decode(value).matchAll(/event:\s*([a-z-]+)/g)) {
            if (m[1] !== "ready" && started) {
              got = { ms: Date.now() - started, topic: m[1] };
              return;
            }
          }
        }
      })();
      await new Promise((r) => setTimeout(r, 500));
      started = Date.now();
      // 触发必须真的产生变化：系统对「没有任何变化」的更新会返回 400 且不广播。
      // 用固定值会让第二次运行时什么都没改，测试就变成随机通过。
      const res2 = await trigger();
      assert.ok(res2.ok, `触发写操作应成功，实际 HTTP ${res2.status}`);
      await Promise.race([listen, new Promise((r) => setTimeout(r, 6000))]);
      ctrl.abort();
      return got;
    };

    const hrPush = await measure(() =>
      patch(`/api/hr/employees/${linked.id}`, hr, {
        phone: `139${String(Date.now()).slice(-8)}`,
        reason: "4.5 推送计时",
      }),
    );
    assert.ok(hrPush, "人事档案修改必须推送——它是跨模块共享的主数据");
    assert.ok(hrPush.ms <= 5000, `推送延迟 ${hrPush.ms} ms，超过验收要求的 5 秒`);
    assert.equal(hrPush.topic, "hr-employee", "应按数据域分主题，便于前端按需订阅");

    const payrollPush = await measure(() =>
      patch(`/api/teachers/${linked.teacherId}/salary-profile`, finance, {
        // 在两个合法档位之间来回切，保证每次运行都真的产生变化
        assessmentBand: Date.now() % 2 ? "primaryCoreLow" : "primaryCoreHigh",
        reason: "4.5 推送计时",
      }),
    );
    assert.ok(payrollPush, "薪资档案变更必须推送——它直接改工资金额");
    assert.ok(payrollPush.ms <= 5000, `推送延迟 ${payrollPush.ms} ms`);
  }

  // -------------------------------------------------------------------------
  // 所有跨模块写操作都要广播
  //
  // 上面只抽测了两条路径。新加写接口时忘了 broadcastEvent 是最容易犯的错——
  // 功能完全正常，只是别人要刷新才看得到，而这正是 4.5 判不通过的原因。
  // -------------------------------------------------------------------------
  {
    const source = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
    const mustBroadcast = [
      "updateEmployee",
      "createEmployee",
      "setEmployeeStatus",
      "updateTeacherSalaryProfile",
      "generatePayrollBatch",
      "lockPayrollBatch",
      "commitEntityImport",
      "transitionLedger",
    ];
    for (const fn of mustBroadcast) {
      const at = source.indexOf(`${fn}(db`) >= 0 ? source.indexOf(`${fn}(db`) : source.indexOf(`${fn}(\n`);
      assert.ok(at > 0, `应能在路由里找到 ${fn} 的调用`);
      const block = source.slice(at, at + 700);
      assert.match(
        block,
        /broadcastEvent\(/,
        `${fn} 改的是跨模块数据，调用后必须 broadcastEvent，否则别的角色要刷新页面才看得到（验收 4.5）`,
      );
    }
  }
} catch (error) {
  failure = error;
} finally {
  child.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 300));
  if (!child.killed) child.kill("SIGKILL");
}

if (failure) {
  console.error(log.slice(-1200));
  throw failure;
}
console.log("module linkage checks passed");
