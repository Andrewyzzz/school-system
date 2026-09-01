#!/usr/bin/env node
// 上线前口令轮换（E-4）。
//
//   node scripts/rotate-passwords.js --check          体检：还有多少账号在用弱口令
//   node scripts/rotate-passwords.js --force-change   标记为「首次登录须改密」（不改口令，最温和）
//   node scripts/rotate-passwords.js --admins         为管理类账号生成强口令并输出交接清单
//   node scripts/rotate-passwords.js --all            所有账号（含 1000+ 教师）
//
// 为什么默认只动管理类账号：教师账号有一千多个，一次性全部改掉意味着一千多个人
// 同一天登不上，学校的服务台会被打爆。教师侧用 --force-change 更稳——口令不变，
// 但下次登录必须自己改，改不完也不影响别人。
//
// 生成的口令只在标准输出打印一次，不落盘、不进数据库明文。请当场保存交接。
import { randomInt } from "node:crypto";
import { ensureDatabase, saveDatabase } from "../server/storage.js";
import { hashPassword, verifyPasswordAsync } from "../server/auth.js";
import { validatePasswordStrength } from "../server/storage.js";

const MANAGEMENT_ROLES = ["admin", "system_admin", "finance", "hr", "division_head", "principal"];

// 去掉了形近字符 0/O、1/l/I：口令要靠人抄到纸上再输进去，抄错一次就得重来
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const SYMBOLS = "!@#%^&*-_=+";

function generatePassword(length = 14) {
  let out = "";
  for (let i = 0; i < length - 2; i += 1) out += ALPHABET[randomInt(ALPHABET.length)];
  // 保证至少含一个数字与一个符号，避免随机出一串纯字母
  out += String(randomInt(10));
  out += SYMBOLS[randomInt(SYMBOLS.length)];
  return out;
}

// 与登录时同口径的弱口令样本：逐个试一遍代价太高，这里只探最常见的几个
const PROBES = ["123456", "12345678", "password", "abc123", "111111", "000000", "admin123"];

async function weakPasswordOf(account) {
  for (const probe of PROBES) {
    if (await verifyPasswordAsync(probe, account.passwordHash)) return probe;
  }
  return "";
}

const args = process.argv.slice(2);
const mode = args.includes("--all")
  ? "all"
  : args.includes("--admins")
    ? "admins"
    : args.includes("--force-change")
      ? "force"
      : "check";

const db = await ensureDatabase();
const accounts = db.accounts.filter((a) => a.status === "active");

console.log(`账号总数：${db.accounts.length}（启用 ${accounts.length}）`);
console.log("");

if (mode === "check") {
  const weak = [];
  for (const account of accounts) {
    const probe = await weakPasswordOf(account);
    if (probe) weak.push({ account, probe });
  }
  const byRole = {};
  weak.forEach(({ account }) => {
    byRole[account.role] = (byRole[account.role] || 0) + 1;
  });

  if (!weak.length) {
    console.log("✓ 未发现使用常见弱口令的账号");
  } else {
    console.log(`✗ ${weak.length} 个账号仍在使用常见弱口令：`);
    Object.entries(byRole).forEach(([role, n]) => console.log(`    ${role.padEnd(16)} ${n} 个`));
    const mgmt = weak.filter(({ account }) => MANAGEMENT_ROLES.includes(account.role));
    if (mgmt.length) {
      console.log("");
      console.log(`  其中 ${mgmt.length} 个是管理类账号，风险最高：`);
      mgmt.slice(0, 20).forEach(({ account, probe }) =>
        console.log(`    ${account.username.padEnd(20)} ${account.role.padEnd(14)} 口令为 ${probe}`),
      );
    }
    console.log("");
    console.log("处理建议：");
    console.log("  管理类账号  node scripts/rotate-passwords.js --admins        （生成强口令，当场交接）");
    console.log("  教师账号    node scripts/rotate-passwords.js --force-change  （口令不变，下次登录须自改）");
  }
  const pending = accounts.filter((a) => a.mustChangePassword).length;
  console.log("");
  console.log(`已标记「首次登录须改密」：${pending} 个账号`);
  process.exitCode = weak.length ? 1 : 0;
} else if (mode === "force") {
  let changed = 0;
  for (const account of accounts) {
    if (account.mustChangePassword) continue;
    if (await weakPasswordOf(account)) {
      account.mustChangePassword = true;
      changed += 1;
    }
  }
  await saveDatabase(db);
  console.log(`已标记 ${changed} 个弱口令账号为「首次登录须改密」。`);
  console.log("这些账号下次登录后，除修改密码外的接口一律拒绝访问，直到口令改完。");
} else {
  const targets =
    mode === "admins" ? accounts.filter((a) => MANAGEMENT_ROLES.includes(a.role)) : accounts;

  console.log(`将为 ${targets.length} 个账号生成新口令（${mode === "admins" ? "仅管理类" : "全部"}）。`);
  console.log("");
  console.log("以下清单只显示这一次，请立即保存并当面交接：");
  console.log("");
  console.log("用户名,姓名,角色,新口令");

  const rows = [];
  for (const account of targets) {
    let password = generatePassword();
    // 生成的口令也要过一遍强度校验，避免随机出被判弱的组合
    let guard = 0;
    while (validatePasswordStrength(password, account) && guard < 10) {
      password = generatePassword();
      guard += 1;
    }
    account.passwordHash = hashPassword(password);
    // 交接口令是明文流转的，收到后必须自己再改一次
    account.mustChangePassword = true;
    account.passwordResetAt = new Date().toISOString();
    rows.push([account.username, account.name || "", account.role, password]);
  }

  // 先落库再打印：打印到一半崩了的话，已改的口令没人知道，账号就锁死了
  await saveDatabase(db);
  rows.forEach((r) => console.log(r.map((v) => (/[",]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v)).join(",")));

  console.log("");
  console.log(`已轮换 ${rows.length} 个账号，全部标记为「首次登录须改密」。`);
  console.log("所有在线会话已在下次请求时失效，需重新登录。");
}
