// 运行环境配置与启动自检（验收 6.5）
//
// 这套检查的价值在于「早失败」：原先缺 HR_ENCRYPTION_KEY 要等到有人保存
// 人事档案才报错，缺 DATABASE_URL 要等第一次落库。生产上这类错误发现得越晚
// 代价越大——已经有老师在用了，数据写了一半才发现配错。
//
// 所以这里既测「该拦的拦住了」，也测「不该拦的别拦」：把开发环境也一并拒绝，
// 会让人为了跑起来去乱填配置，反而更糟。
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { PROFILES, inspectConfig } from "../server/config.js";

const run = promisify(execFile);

const BASE = {
  NODE_ENV: "production",
  PORT: "4173",
  HOST: "127.0.0.1",
  DATABASE_URL: "postgresql://school_app:pwd@127.0.0.1:5432/school_system",
  HR_ENCRYPTION_KEY: "0".repeat(64),
  SCHEDULER_PYTHON: "/opt/school-system/.venv-solver/bin/python",
  TRUST_PROXY: "1",
  FORCE_HTTPS: "1",
};

// ---------------------------------------------------------------------------
// 1. 完整的生产配置应当通过
// ---------------------------------------------------------------------------
{
  const result = inspectConfig(BASE);
  assert.equal(result.ok, true, `完整配置不应报错：${JSON.stringify(result.errors)}`);
  assert.equal(result.profile, "production");
  assert.equal(result.errors.length, 0);
}

// ---------------------------------------------------------------------------
// 2. 生产环境缺必填项必须拦下，且要说清缺的是哪一项
// ---------------------------------------------------------------------------
{
  for (const key of ["DATABASE_URL", "HR_ENCRYPTION_KEY", "SCHEDULER_PYTHON"]) {
    const env = { ...BASE };
    delete env[key];
    const result = inspectConfig(env);
    assert.equal(result.ok, false, `生产环境缺 ${key} 必须拦下`);
    assert.ok(
      result.errors.some((e) => e.includes(key)),
      `报错里必须点名 ${key}，否则运维不知道该配什么，实际：${result.errors.join(" / ")}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 3. 开发环境不该被同一套标准卡住
//
// 把开发也一并拒绝，结果是有人为了跑起来随便填一个密钥，
// 那比不检查更糟——假的配置会被复制到生产。
// ---------------------------------------------------------------------------
{
  const result = inspectConfig({ NODE_ENV: "development" });
  assert.equal(result.ok, true, "开发环境不应因缺少生产必填项而拒绝启动");
  assert.ok(result.warnings.length > 0, "但仍应给出提示");
}

// ---------------------------------------------------------------------------
// 4. 值本身非法要能识别，而不是只看有没有填
// ---------------------------------------------------------------------------
{
  const cases = [
    ["HR_ENCRYPTION_KEY", "太短了", /32 字节|64 位 hex/],
    ["HR_ENCRYPTION_KEY", "z".repeat(64), /32 字节|64 位 hex/], // 不是合法 hex
    ["DATABASE_URL", "mysql://x/y", /postgresql/],
    ["PORT", "99999", /端口号/],
    ["PORT", "abc", /端口号/],
    ["TRUST_PROXY", "yes", /0 或 1/],
    ["CORS_ALLOW_ORIGIN", "*", /不接受 \*/],
    ["NODE_ENV", "staging", /development|test|production/],
    ["LOGIN_FAIL_MAX_PER_IP", "0", /正整数/],
  ];
  for (const [key, value, pattern] of cases) {
    const result = inspectConfig({ ...BASE, [key]: value });
    assert.equal(result.ok, false, `${key}=${value} 应被判为无效`);
    assert.ok(
      result.errors.some((e) => e.includes(key) && pattern.test(e)),
      `${key}=${value} 的报错应说明原因，实际：${result.errors.join(" / ")}`,
    );
  }

  // 合法的密钥两种写法都要接受
  assert.equal(inspectConfig({ ...BASE, HR_ENCRYPTION_KEY: "a".repeat(64) }).ok, true, "64 位 hex 应通过");
  assert.equal(
    inspectConfig({ ...BASE, HR_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64") }).ok,
    true,
    "32 字节 base64 应通过",
  );
}

// ---------------------------------------------------------------------------
// 5. 跨项组合检查：单项都合法、配在一起却是错的
// ---------------------------------------------------------------------------
{
  // 启了 HTTPS 却没信任代理：限流拿到的都是代理 IP，全校算成一个来源
  const proxy = inspectConfig({ ...BASE, TRUST_PROXY: "0", FORCE_HTTPS: "1" });
  assert.equal(proxy.ok, true, "这是配置疏忽，不是致命错误，不该拒绝启动");
  assert.ok(
    proxy.warnings.some((w) => /TRUST_PROXY/.test(w)),
    "但必须提示——否则限流会把全校算成同一个来源，一次扫描全校受影响",
  );

  // 用超级用户连库
  const superuser = inspectConfig({ ...BASE, DATABASE_URL: "postgresql://postgres@127.0.0.1/school" });
  assert.ok(
    superuser.warnings.some((w) => /school_app|受限账号/.test(w)),
    "生产用超级用户连库应给出提示",
  );
  assert.equal(
    inspectConfig(BASE).warnings.some((w) => /school_app/.test(w)),
    false,
    "已用 school_app 时不应再提示",
  );

  // 备份与数据库同机
  const sameHost = inspectConfig({ ...BASE, BACKUP_DIR: "/var/backups/school" });
  assert.ok(
    sameHost.warnings.some((w) => /异机|同时丢失/.test(w)),
    "备份与数据库同机时应提示——磁盘坏了两者一起没",
  );
}

// ---------------------------------------------------------------------------
// 6. 自检输出不得泄露密钥
// ---------------------------------------------------------------------------
{
  const key = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
  const result = inspectConfig({ ...BASE, HR_ENCRYPTION_KEY: key });
  const dumped = JSON.stringify(result);
  assert.ok(!dumped.includes(key), "自检结果里绝不能出现完整密钥——它会被打进日志");

  const item = result.items.find((i) => i.key === "HR_ENCRYPTION_KEY");
  assert.match(item.value, /\*\*\*\*/, "密钥应打码");
  assert.ok(item.value.length < key.length, "打码后不应还原出原值");

  const dbItem = result.items.find((i) => i.key === "DATABASE_URL");
  assert.ok(!dumped.includes("pwd@"), "连接串里的口令同样不能出现在自检输出里");
  assert.ok(dbItem.value.includes("****"));
}

// ---------------------------------------------------------------------------
// 7. 配置模板本身要是完整且能用的
//
// 模板缺项会被原样复制到生产，然后在启动时才发现——那正是这套检查要避免的。
// ---------------------------------------------------------------------------
{
  const root = new URL("..", import.meta.url);
  for (const name of ["production", "test"]) {
    const text = await fs.readFile(new URL(`config/${name}.env.example`, root), "utf-8");
    assert.match(text, new RegExp(`NODE_ENV=${name}`), `${name} 模板应声明对应的 NODE_ENV`);

    // 把模板解析成环境，看是否满足该 profile 的必填项
    const env = Object.fromEntries(
      text
        .split("\n")
        .filter((l) => /^[A-Z_]+=/.test(l))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i), l.slice(i + 1)];
        }),
    );
    const required = ["DATABASE_URL", "HR_ENCRYPTION_KEY"];
    required.forEach((key) => {
      assert.ok(key in env, `${name} 模板缺少 ${key} 这一项，运维照着填会漏配`);
    });

    // 生产模板不得留下可用的默认密钥——照抄就上线是真实会发生的
    if (name === "production") {
      assert.match(env.HR_ENCRYPTION_KEY, /请填写/, "生产模板的密钥必须是占位符，不能给一个能用的值");
      assert.match(env.DATABASE_URL, /请填写/, "生产模板的数据库口令必须是占位符");
      assert.equal(env.HOST, "127.0.0.1", "生产应只监听本机，由反代转发");
      assert.equal(env.TRUST_PROXY, "1");
      assert.equal(env.CORS_ALLOW_ORIGIN, "", "生产模板不得预设跨域来源");
    }
    // 测试模板应当开箱可用，否则没人会去用它
    if (name === "test") {
      assert.equal(inspectConfig(env).ok, true, `test 模板应开箱可用：${JSON.stringify(inspectConfig(env).errors)}`);
      assert.ok(!/school_system(?!_test)/.test(env.DATABASE_URL), "测试库绝不能指向生产库");
      assert.notEqual(env.HR_ENCRYPTION_KEY, "", "测试也要有独立密钥");
    }
  }

  // 配置文件不能进版本库
  const gitignore = await fs.readFile(new URL(".gitignore", root), "utf-8");
  assert.match(gitignore, /config\/\*\.env/, "config/*.env 必须被忽略——里面有口令和密钥");
  assert.match(gitignore, /!config\/\*\.env\.example/, "但模板要保留在库里");
}

// ---------------------------------------------------------------------------
// 8. 配错时进程必须真的退出，而不是带病启动
// ---------------------------------------------------------------------------
{
  const root = path.resolve(new URL("..", import.meta.url).pathname);
  let exitCode = 0;
  try {
    await run(process.execPath, ["server/server.js"], {
      cwd: root,
      env: { ...process.env, NODE_ENV: "production", PORT: "4197", DATABASE_URL: "", HR_ENCRYPTION_KEY: "" },
      timeout: 30000,
    });
  } catch (error) {
    exitCode = error.code;
    assert.match(
      `${error.stderr || ""}${error.stdout || ""}`,
      /配置检查未通过/,
      "应打印清楚的配置错误，而不是抛一段栈",
    );
  }
  assert.equal(exitCode, 1, "配置有误时必须以非零码退出——否则 systemd 会以为启动成功");
}

// ---------------------------------------------------------------------------
// 9. profile 清单
// ---------------------------------------------------------------------------
{
  assert.deepEqual(PROFILES, ["development", "test", "production"]);
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "school-cfg-"));
  await fs.rm(tmp, { recursive: true, force: true });
}

console.log("config checks passed");
