// 运行环境配置与启动自检（验收 6.5）
//
// 配置本身走 Node 22 原生的 --env-file，不引任何依赖：
//   node --env-file=config/production.env server/server.js
//
// 这里做的是**启动自检**。原先所有配置都是「用到才发现没配」：
// 缺 HR_ENCRYPTION_KEY 要等到有人保存人事档案时才报错，缺 DATABASE_URL 要等
// 第一次落库。生产环境上这种错误发现得越晚代价越大——已经有老师在用了，
// 数据写了一半才发现配错。所以启动时一次性全查，缺的直接拒绝启动。
//
// 「拒绝启动」是刻意的：一个连不上库、或者没有加密密钥却在收人事数据的服务，
// 跑起来比不跑更糟。

const PROFILES = ["development", "test", "production"];

/**
 * 配置项声明。
 *   required  在哪些 profile 下必填
 *   validate  返回错误说明；返回空串表示通过
 *   secret    出现在自检输出里时要打码
 */
const SPEC = [
  {
    key: "NODE_ENV",
    label: "运行环境",
    default: "development",
    validate: (v) => (PROFILES.includes(v) ? "" : `只能是 ${PROFILES.join(" / ")}`),
  },
  {
    key: "PORT",
    label: "服务端口",
    default: "4173",
    validate: (v) => (Number(v) > 0 && Number(v) < 65536 ? "" : "必须是 1-65535 的端口号"),
  },
  { key: "HOST", label: "监听地址", default: "0.0.0.0" },
  {
    key: "DATABASE_URL",
    label: "数据库连接串",
    required: ["production"],
    secret: true,
    validate: (v) => (!v || /^postgres(ql)?:\/\//.test(v) ? "" : "必须是 postgresql:// 开头的连接串"),
  },
  {
    key: "HR_ENCRYPTION_KEY",
    label: "人事与薪资加密密钥",
    required: ["production"],
    secret: true,
    // 与 pii.js 的解析口径保持一致：32 字节的 base64 或 64 位 hex
    validate: (v) => {
      if (!v) return "";
      if (/^[0-9a-fA-F]{64}$/.test(v)) return "";
      try {
        if (Buffer.from(v, "base64").length === 32) return "";
      } catch {
        /* 下面统一报错 */
      }
      return "需要 32 字节的 base64 或 64 位 hex；可用 openssl rand -hex 32 生成";
    },
  },
  {
    key: "SCHEDULER_PYTHON",
    label: "排课求解器 Python",
    required: ["production"],
    hint: "指向装了 ortools 的 python，缺失时排课会退化成启发式算法",
  },
  {
    key: "TRUST_PROXY",
    label: "信任反向代理",
    default: "0",
    validate: (v) => (["0", "1"].includes(v) ? "" : "只能是 0 或 1"),
    hint: "部署在 Nginx 后面必须设为 1，否则限流按代理 IP 计算，等于对所有人共用一个额度",
  },
  {
    key: "FORCE_HTTPS",
    label: "启用 HSTS",
    default: "0",
    required: ["production"],
    validate: (v) => (["0", "1"].includes(v) ? "" : "只能是 0 或 1"),
  },
  {
    key: "CORS_ALLOW_ORIGIN",
    label: "允许的跨域来源",
    validate: (v) => (v === "*" ? "不接受 *，请指定具体来源" : ""),
  },
  { key: "BACKUP_DIR", label: "备份目录", hint: "定时备份的输出位置，建议放在与数据库不同的磁盘" },
  {
    key: "LOGIN_MAX_PER_IP",
    label: "单 IP 登录总量上限",
    default: "3000",
    validate: (v) => (Number(v) > 0 ? "" : "必须为正整数"),
  },
  {
    key: "LOGIN_FAIL_MAX_PER_IP",
    label: "单 IP 失败次数上限",
    default: "60",
    validate: (v) => (Number(v) > 0 ? "" : "必须为正整数"),
  },
];

function maskSecret(value) {
  if (!value) return "";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

/**
 * 检查当前环境变量。返回 { profile, ok, errors, warnings, items }。
 * 不抛错——调用方决定是拒绝启动还是只提示。
 */
export function inspectConfig(env = process.env) {
  const profile = env.NODE_ENV || "development";
  const errors = [];
  const warnings = [];
  const items = [];

  SPEC.forEach((spec) => {
    const raw = env[spec.key];
    const value = raw === undefined || raw === "" ? spec.default || "" : raw;
    const isRequired = Array.isArray(spec.required) && spec.required.includes(profile);
    const missing = !value;

    if (missing && isRequired) {
      errors.push(`${spec.key}（${spec.label}）未配置${spec.hint ? `：${spec.hint}` : ""}`);
    } else if (missing && spec.hint) {
      warnings.push(`${spec.key}（${spec.label}）未配置：${spec.hint}`);
    }

    if (value && spec.validate) {
      const message = spec.validate(value);
      if (message) errors.push(`${spec.key}（${spec.label}）配置无效：${message}`);
    }

    items.push({
      key: spec.key,
      label: spec.label,
      value: spec.secret ? maskSecret(value) : value,
      configured: Boolean(raw),
      usingDefault: !raw && Boolean(spec.default),
      required: isRequired,
    });
  });

  // 跨项检查：单项都合法、组合起来却是错的
  if (profile === "production") {
    if (env.TRUST_PROXY !== "1" && env.FORCE_HTTPS === "1") {
      warnings.push(
        "已启用 HTTPS 但 TRUST_PROXY 不为 1：反向代理后拿到的都是代理 IP，登录限流会把全校算成同一个来源",
      );
    }
    if (env.DATABASE_URL && /localhost|127\.0\.0\.1/.test(env.DATABASE_URL) && env.BACKUP_DIR) {
      // 备份和数据库同机同盘时，磁盘坏了两者一起没
      warnings.push("备份目录与数据库在同一台机器：磁盘故障会让数据与备份同时丢失，建议同步到异机");
    }
    if (env.DATABASE_URL && !/school_app/.test(env.DATABASE_URL)) {
      warnings.push(
        "应用似乎未使用 school_app 程序账号连库：生产环境请用受限账号，不要用超级用户（见 scripts/provision-db-roles.js）",
      );
    }
  }

  return { profile, ok: errors.length === 0, errors, warnings, items };
}

/** 启动自检：生产环境下配置有误直接拒绝启动 */
export function assertConfigOrExit(env = process.env, { exit = true, log = console } = {}) {
  const result = inspectConfig(env);
  if (result.errors.length) {
    log.error("");
    log.error(`  ✗ 配置检查未通过（NODE_ENV=${result.profile}）：`);
    result.errors.forEach((text, i) => log.error(`    ${i + 1}. ${text}`));
    log.error("");
    log.error("  配置文件模板见 config/production.env.example");
    log.error("  启动方式：node --env-file=config/production.env server/server.js");
    log.error("");
    // 配错了就不启动：一个连不上库、或没有加密密钥却在收人事数据的服务，
    // 跑起来比不跑更糟——等发现时数据已经写进去了。
    if (exit) process.exit(1);
  }
  result.warnings.forEach((text) => log.warn(`  ⚠ ${text}`));
  return result;
}

export { PROFILES, SPEC };
