// 上线前安全加固（E-4）：响应头、跨域、登录限流
//
// 这些都是「不测就没人知道有没有生效」的东西——CSP 写错一个字母浏览器
// 只会静默忽略，CORS 多一个星号就是任何站点都能调本系统接口。所以这里
// 起一个真实服务，用真实 HTTP 请求去看响应头，而不是读源码里的字符串。
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const PORT = 4791 + (process.pid % 100);
const BASE = `http://127.0.0.1:${PORT}`;

// 撞库检测的阈值调低，否则要发 60 次请求才测得出来
const child = spawn(process.execPath, ["server/server.js"], {
  env: {
    ...process.env,
    PORT: String(PORT),
    LOGIN_FAIL_MAX_PER_IP: "5",
    NODE_ENV: "test",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverLog = "";
child.stdout.on("data", (d) => (serverLog += d));
child.stderr.on("data", (d) => (serverLog += d));

async function waitForServer(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return true;
    } catch {
      /* 还没起来 */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

let failure = null;
try {
  assert.ok(await waitForServer(), `服务未能启动：\n${serverLog}`);

  // -------------------------------------------------------------------------
  // 1. API 响应头
  // -------------------------------------------------------------------------
  {
    const res = await fetch(`${BASE}/api/health`);
    const h = res.headers;

    assert.equal(h.get("x-content-type-options"), "nosniff", "缺 nosniff，浏览器会按内容猜类型");
    assert.equal(h.get("x-frame-options"), "DENY", "缺 X-Frame-Options，页面可被套进 iframe 做点击劫持");
    assert.equal(h.get("referrer-policy"), "same-origin");

    const csp = h.get("content-security-policy");
    assert.ok(csp, "必须有 CSP");
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /object-src 'none'/, "禁用 object/embed，堵住老式插件注入");
    assert.match(csp, /frame-ancestors 'none'/, "防点击劫持：替人确认工资单");
    assert.match(csp, /base-uri 'self'/, "限制 <base>，否则相对路径可被劫持到外部");
    assert.ok(!/unsafe-eval/.test(csp), "前端不需要 eval，留着只是给 XSS 多一条路");

    // 未配 FORCE_HTTPS 时不得下发 HSTS：明文 HTTP 下发会把整站锁到 https
    assert.equal(h.get("strict-transport-security"), null, "未启用 HTTPS 时不应下发 HSTS");
  }

  // -------------------------------------------------------------------------
  // 2. 跨域：默认不对任意来源开放
  // -------------------------------------------------------------------------
  {
    const res = await fetch(`${BASE}/api/health`, { headers: { Origin: "https://evil.example" } });
    const allow = res.headers.get("access-control-allow-origin");
    assert.notEqual(allow, "*", "Access-Control-Allow-Origin: * 意味着任何站点都能调本系统接口");
    assert.equal(allow, null, "未配置 CORS_ALLOW_ORIGIN 时不应下发跨域头");

    // 预检也一样
    const pre = await fetch(`${BASE}/api/health`, { method: "OPTIONS" });
    assert.notEqual(pre.headers.get("access-control-allow-origin"), "*");
    assert.equal(pre.headers.get("x-content-type-options"), "nosniff", "预检响应也要带安全头");
  }

  // -------------------------------------------------------------------------
  // 3. 静态资源也要带安全头（XSS 是在页面里发生的，不是在 API 里）
  // -------------------------------------------------------------------------
  {
    const res = await fetch(`${BASE}/`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.ok(res.headers.get("content-security-policy"), "页面本身必须有 CSP，否则 CSP 等于没配");
    assert.equal(res.headers.get("x-frame-options"), "DENY");
  }

  // -------------------------------------------------------------------------
  // 4. 跨账号撞库：每个账号只试一次，靠按 IP 的失败计数拦下
  // -------------------------------------------------------------------------
  {
    const attempt = (username) =>
      fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: "wrong-password" }),
      });

    const codes = [];
    for (let i = 0; i < 8; i += 1) {
      const res = await attempt(`victim_${i}`); // 每次换账号，绕开单账号锁定
      codes.push(res.status);
    }

    assert.ok(
      codes.slice(0, 5).every((c) => c === 401),
      `前 5 次应是正常的认证失败，实际 ${codes.join(",")}`,
    );
    assert.ok(
      codes.slice(5).some((c) => c === 429),
      `超过阈值后必须限流——跨账号撞库时单账号锁定和总量上限都不会触发，实际 ${codes.join(",")}`,
    );


    // 关键：凭据正确的用户不能被这道闸误伤。校园网上千人共用出口 IP，
    // 一次扫描就把全校挡在门外，是拿可用性换来的假安全。
    const legit = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "sysadmin", password: "123456" }),
    });
    assert.equal(legit.status, 200, "同一 IP 触发限流后，凭据正确的用户仍应能登录");

    // 限流提示不能泄露触发了哪条规则
    const blocked = await attempt("victim_x");
    if (blocked.status === 429) {
      const body = await blocked.json();
      assert.ok(
        !/失败次数/.test(body.error.message),
        "限流提示不应说明是按失败次数触发的，那等于告诉扫描方怎么绕",
      );
    }
  }

  // -------------------------------------------------------------------------
  // 5. 限流不应误伤正常登录（换个 IP 的效果用重启窗口近似不了，
  //    这里退而验证：被限流的是登录接口，其他接口不受影响）
  // -------------------------------------------------------------------------
  {
    const res = await fetch(`${BASE}/api/health`);
    assert.equal(res.status, 200, "登录限流不应波及其他接口");
  }

  // -------------------------------------------------------------------------
  // 6. 口令强度：旧规则「至少 6 位」连 123456 本身都拦不住
  //
  // 直接调校验函数，不走接口改真实账号的口令——测试一旦真的把 sysadmin
  // 的口令改掉，现场演示就登不上了，而且下一次跑测试还会连锁失败。
  // （这一条是被自己踩出来的：变异测试放行了弱口令，测试就真把口令改了。）
  // -------------------------------------------------------------------------
  {
    const { validatePasswordStrength } = await import("../server/storage.js");
    const account = { username: "sysadmin" };

    const cases = [
      ["1234567", /8 位/, "7 位应被拒"],
      ["12345678", /常见/, "8 位但是常见弱口令，应被拒"],
      ["88888888", /两类/, "纯数字应被拒——8 位纯数字离线爆破以秒计"],
      ["abcdefgh", /两类/, "纯字母应被拒"],
      ["sysadmin2026", /用户名/, "包含用户名应被拒"],
      ["123456", /8 位/, "默认口令本身必须被拒"],
    ];
    for (const [pwd, pattern, why] of cases) {
      const message = validatePasswordStrength(pwd, account);
      assert.ok(message, `${why}（${pwd}）应返回拒绝原因`);
      assert.match(message, pattern, `${why}：提示应说明原因，实际「${message}」`);
    }

    // 合规口令应通过
    assert.equal(validatePasswordStrength("Fy2026#school", account), "", "合规口令不应被拒");
    assert.equal(validatePasswordStrength("k7Rm-2Qw9Xz", account), "");
  }

  // 接口层确实接上了这套校验（只验被拒的路径，不真的改口令）
  {
    const login = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "sysadmin", password: "123456" }),
    });
    assert.equal(login.status, 200, "演示账号应仍可登录——现场验收要用");
    const { token } = await login.json();

    const res = await fetch(`${BASE}/api/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: "123456", newPassword: "12345678" }),
    });
    assert.equal(res.status, 400, "改密接口必须接上强度校验");
    const body = await res.json();
    assert.match(body.error.message, /常见/);
  }

  // -------------------------------------------------------------------------
  // 7. 强制改密必须挡在服务端
  //
  // 只在登录响应里回一个 mustChangePassword 标记是拦不住人的：
  // 前端大可不理，直接调业务接口。
  // -------------------------------------------------------------------------
  {
    const login = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "importtest01", password: "123456" }),
    });
    if (login.status === 200) {
      const { token, account } = await login.json();
      assert.equal(account.mustChangePassword, true, "该账号应带首次登录须改密标记");

      const blocked = await fetch(`${BASE}/api/me/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.ok(
        blocked.status === 403 || blocked.status === 404,
        `未改密前业务接口应被拒，实际 ${blocked.status}`,
      );
      if (blocked.status === 403) {
        const body = await blocked.json();
        assert.equal(body.error.details?.code, "MUST_CHANGE_PASSWORD", "应返回可供前端识别的错误码");
      }

      // 但改密接口本身必须放行，否则账号直接锁死
      const allowed = await fetch(`${BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: "123456", newPassword: "x" }),
      });
      assert.equal(allowed.status, 400, "改密接口应放行并给出强度校验错误，而不是 403 锁死");
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
  console.error(serverLog.slice(-2000));
  throw failure;
}
console.log("security headers checks passed");
