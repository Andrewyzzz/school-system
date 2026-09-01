// 监控与告警（合同第七条第 6 项「具备必要的错误处理、日志、监控和告警能力」）
//
// 这个模块的难点不是「怎么发现问题」，是**怎么让人愿意看告警**。
//
// 一个每分钟都在响的告警系统，两周之内就会被全体忽略，然后真出事那次也没人看。
// 所以这里有三条硬规矩：
//
//   1. 只在**状态翻转**时告警，不在每次检查时告警。数据库断开的那一刻报一次，
//      不是断开期间每分钟报一次。
//   2. 恢复了也要报。只报坏不报好，人就不知道现在到底行不行，
//      只能自己去查——那告警就白发了。
//   3. 持续异常按冷却期重播（默认 6 小时）。完全不重播的话，
//      凌晨断开的告警到早上就被翻页翻没了。
//
// 另外：告警本身绝不能把系统搞挂。所有检查都包在 try 里，
// 一个检查抛异常只让那一条变成「检查失败」，不影响其余的，更不影响业务。
import fs from "node:fs/promises";
import path from "node:path";

export const ALERT_LEVELS = { critical: "严重", warning: "警告", info: "提示" };

// 持续异常的重播间隔。太短会变成噪音，太长会让夜里发生的问题第二天没人知道。
const REPEAT_COOLDOWN_MS = Number(process.env.MONITOR_REPEAT_HOURS || 6) * 60 * 60 * 1000;

const MB = 1024 * 1024;

/**
 * 监控规则。
 *
 * 每条规则只回答一个问题：现在是不是不正常？规则的 check 返回：
 *   null / undefined  正常
 *   { detail, value } 异常，detail 是给人看的一句话
 *
 * detail 必须写清楚**接下来该干什么**。「内存告警」是废话，
 * 「内存 1850MB / 2048MB，请归档往年账套或重启服务」才是能行动的。
 */
export const MONITOR_RULES = [
  {
    key: "db_disconnected",
    name: "数据库连接",
    level: "critical",
    check: ({ postgres }) => {
      if (!postgres.configured) return null; // 文件模式不检查
      if (postgres.connected) return null;
      return { detail: `数据库连接已断开${postgres.lastError ? `：${postgres.lastError}` : ""}。业务写入会失败，请检查 PostgreSQL 服务与网络。` };
    },
  },
  {
    key: "persist_failed",
    name: "数据持久化",
    level: "critical",
    check: ({ storage, postgres }) => {
      // 数据库断开时不重复报：那条已经由 db_disconnected 报了，
      // 一个根因发两条通知，收到的人得自己判断是一件事还是两件事。
      if (postgres.configured && !postgres.connected) return null;
      // postgresHealth.lastError 带阶段前缀（pool: / ping: / persist:）。
      // 只认 persist: —— pool 和 ping 是连接问题，属于上一条规则的地盘。
      const pgPersistError = /\bpersist:/.test(postgres.lastError || "") ? postgres.lastError : "";
      const error = storage.lastSaveError || pgPersistError;
      if (!error) return null;
      // 这是最危险的一类：界面上一切正常，用户以为存下了，实际只在内存里，
      // 一重启就全没了
      return { detail: `最近一次数据保存失败：${error}。此时界面看起来正常，但改动只在内存里，重启会丢失。` };
    },
  },
  {
    key: "encryption_key_missing",
    name: "加密密钥",
    level: "critical",
    check: ({ env }) => {
      if (env.HR_ENCRYPTION_KEY) return null;
      return { detail: "HR_ENCRYPTION_KEY 未配置，身份证号、银行卡号、工资金额将拒绝写入。请检查服务配置后重启。" };
    },
  },
  {
    key: "disk_low",
    name: "磁盘空间",
    level: "critical",
    check: ({ disk }) => {
      if (!disk || !disk.totalBytes) return null;
      const freeGb = disk.freeBytes / 1e9;
      const ratio = disk.freeBytes / disk.totalBytes;
      if (freeGb > 2 && ratio > 0.05) return null;
      return {
        detail: `磁盘剩余 ${freeGb.toFixed(1)} GB（${(ratio * 100).toFixed(1)}%）。空间耗尽会导致数据保存失败，请清理旧备份或扩容。`,
        value: Number(freeGb.toFixed(1)),
      };
    },
  },
  {
    key: "memory_high",
    name: "内存占用",
    level: "warning",
    check: ({ memory }) => {
      const usedMb = memory.rss / MB;
      const limit = Number(process.env.MONITOR_MEMORY_LIMIT_MB || 1536);
      if (usedMb < limit) return null;
      return {
        detail: `进程内存 ${usedMb.toFixed(0)} MB，超过阈值 ${limit} MB。可在「账套管理」把往年账套归档以释放内存。`,
        value: Number(usedMb.toFixed(0)),
      };
    },
  },
  {
    key: "solver_unavailable",
    name: "排课求解器",
    level: "warning",
    check: ({ solver }) => {
      if (!solver || solver.available) return null;
      // 不是 critical：系统还能用，只是排课会回退到启发式，大年级排不满。
      // 但如果报成 critical，真正的 critical 就会被淹掉
      return { detail: `OR-Tools 求解器不可用（${solver.message || "未知原因"}）。排课将回退内置启发式算法，大年级可能排不满。请在服务器上安装 ortools 并检查 SCHEDULER_PYTHON 配置。` };
    },
  },
  {
    key: "backup_stale",
    name: "数据备份",
    level: "warning",
    check: ({ backup }) => {
      const maxDays = Number(process.env.MONITOR_BACKUP_MAX_DAYS || 2);
      if (!backup || !backup.checked) return null;
      if (backup.lastBackupAt && backup.ageDays <= maxDays) return null;
      return {
        detail: backup.lastBackupAt
          ? `最近一次备份在 ${backup.ageDays.toFixed(1)} 天前（${backup.lastBackupAt}），超过 ${maxDays} 天。请检查备份定时任务。`
          : `备份目录里没有任何备份文件。请检查备份定时任务是否在运行。`,
        value: backup.lastBackupAt ? Number(backup.ageDays.toFixed(1)) : null,
      };
    },
  },
  {
    key: "login_failures",
    name: "登录失败",
    level: "warning",
    check: ({ security }) => {
      const limit = Number(process.env.MONITOR_LOGIN_FAIL_LIMIT || 100);
      if (!security || security.failuresLastHour < limit) return null;
      return {
        detail: `最近一小时登录失败 ${security.failuresLastHour} 次，来自 ${security.distinctIps} 个 IP。可能是口令爆破，请检查访问日志。`,
        value: security.failuresLastHour,
      };
    },
  },
  {
    key: "reconciliation_unbalanced",
    name: "三方对账",
    level: "warning",
    check: ({ reconciliation }) => {
      if (!reconciliation || !reconciliation.ran) return null;
      if (reconciliation.balanced) return null;
      return {
        detail: `${reconciliation.month} 对账有 ${reconciliation.differenceCount} 处差异未处理。在「账套管理」查看差异台账，对不平不要发工资。`,
        value: reconciliation.differenceCount,
      };
    },
  },
  {
    key: "approval_backlog",
    name: "审批积压",
    level: "info",
    check: ({ approvals }) => {
      const limit = Number(process.env.MONITOR_APPROVAL_BACKLOG || 20);
      if (!approvals || approvals.overdue < limit) return null;
      return {
        detail: `有 ${approvals.overdue} 条审批停留超过 3 个工作日。请提醒相应审批人处理。`,
        value: approvals.overdue,
      };
    },
  },
];

/** 备份新鲜度。目录不存在不算异常——没配备份目录是部署选择，不是故障。 */
async function inspectBackups(dir) {
  if (!dir) return { checked: false };
  try {
    const entries = await fs.readdir(dir);
    const files = entries.filter((f) => /\.(sql|dump|tar|gz|json)$/i.test(f));
    if (!files.length) return { checked: true, lastBackupAt: "", ageDays: Infinity };
    let newest = 0;
    for (const f of files) {
      // 用 stat 而不是解析文件名里的日期：文件名格式改了，
      // 解析就悄悄失效，然后「备份过期」永远不会触发
      const s = await fs.stat(path.join(dir, f));
      if (s.mtimeMs > newest) newest = s.mtimeMs;
    }
    return {
      checked: true,
      lastBackupAt: new Date(newest).toISOString(),
      ageDays: (Date.now() - newest) / 86400000,
    };
  } catch {
    return { checked: false };
  }
}

async function inspectDisk(dir) {
  try {
    const s = await fs.statfs(dir || process.cwd());
    return { totalBytes: s.blocks * s.bsize, freeBytes: s.bavail * s.bsize };
  } catch {
    return null;
  }
}

/**
 * 采集当前指标。
 *
 * deps 里的东西都由调用方注入，这个模块不直接 import 业务模块——
 * 监控依赖业务、业务又依赖监控会绕成一个环。
 */
export async function collectMetrics(db, deps = {}) {
  const { storageHealth = {}, postgresHealth = {}, solverProbe = null, security = null, env = process.env } = deps;

  const now = new Date();
  const month = now.toISOString().slice(0, 7);
  const latest = (db?.reconciliations || []).find((r) => r.month === month);

  const overdue = (db?.oaRequests || []).filter((r) => {
    if (r.status !== "pending") return false;
    const at = Date.parse(r.currentStepAt || r.createdAt || "");
    return Number.isFinite(at) && now.getTime() - at > 3 * 86400000;
  }).length;

  return {
    at: now.toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    memory: process.memoryUsage(),
    storage: {
      lastSaveAt: storageHealth.lastSaveAt || "",
      lastSaveError: storageHealth.lastSaveError || "",
      totalSaves: storageHealth.totalSaves || 0,
    },
    postgres: {
      configured: Boolean(postgresHealth.configured),
      connected: Boolean(postgresHealth.connected),
      lastError: postgresHealth.lastError || "",
    },
    solver: solverProbe,
    security,
    env: { HR_ENCRYPTION_KEY: Boolean(env.HR_ENCRYPTION_KEY) },
    disk: await inspectDisk(env.BACKUP_DIR || process.cwd()),
    backup: await inspectBackups(env.BACKUP_DIR),
    reconciliation: latest
      ? {
          ran: true,
          month: latest.month,
          balanced: Boolean(latest.balanced),
          differenceCount: (latest.differences || []).length,
        }
      : { ran: false, month },
    approvals: { overdue },
    counts: {
      teachers: (db?.teachers || []).length,
      employees: (db?.employees || []).length,
      lessons: (db?.lessonInstances || []).length,
    },
  };
}

/** 逐条跑规则。一条规则抛异常只让它自己变成「检查失败」，不能拖垮其余检查。 */
export function evaluateRules(metrics, rules = MONITOR_RULES) {
  return rules.map((rule) => {
    try {
      const hit = rule.check(metrics);
      return hit
        ? { key: rule.key, name: rule.name, level: rule.level, ok: false, detail: hit.detail, value: hit.value ?? null }
        : { key: rule.key, name: rule.name, level: rule.level, ok: true, detail: "", value: null };
    } catch (error) {
      // 检查本身坏了也是个需要知道的事实，不能当作「正常」吞掉
      return {
        key: rule.key,
        name: rule.name,
        level: "warning",
        ok: false,
        detail: `监控检查执行失败：${error.message}`,
        value: null,
      };
    }
  });
}

/**
 * 与上一轮比对，决定这一轮要发哪些告警。
 *
 * 这是整个模块的核心。不做这一步，每分钟一轮检查就是每分钟一批通知，
 * 两周之内所有人都会把监控通知设为免打扰。
 */
export function diffAlerts(previousState = {}, results = [], nowMs = Date.now()) {
  const alerts = [];
  const nextState = {};

  results.forEach((r) => {
    const prev = previousState[r.key];

    if (!r.ok) {
      const firstSeenAt = prev && !prev.ok ? prev.firstSeenAt : nowMs;
      const lastNotifiedAt = prev && !prev.ok ? prev.lastNotifiedAt : 0;
      const isNew = !prev || prev.ok;
      // 持续异常按冷却期重播：完全不重播，凌晨发生的问题到早上就被翻没了
      const shouldRepeat = !isNew && nowMs - lastNotifiedAt >= REPEAT_COOLDOWN_MS;

      if (isNew || shouldRepeat) {
        alerts.push({
          key: r.key,
          name: r.name,
          level: r.level,
          kind: isNew ? "raised" : "reminder",
          detail: r.detail,
          firstSeenAt: new Date(firstSeenAt).toISOString(),
        });
        nextState[r.key] = { ok: false, firstSeenAt, lastNotifiedAt: nowMs };
      } else {
        nextState[r.key] = { ok: false, firstSeenAt, lastNotifiedAt };
      }
      return;
    }

    // 恢复也要报：只报坏不报好，人不知道现在到底行不行
    if (prev && !prev.ok) {
      alerts.push({
        key: r.key,
        name: r.name,
        level: "info",
        kind: "resolved",
        detail: `${r.name}已恢复正常。`,
        firstSeenAt: new Date(prev.firstSeenAt).toISOString(),
      });
    }
    nextState[r.key] = { ok: true, firstSeenAt: 0, lastNotifiedAt: 0 };
  });

  return { alerts, nextState };
}

export function alertLine(alert) {
  const tag = alert.kind === "resolved" ? "恢复" : alert.kind === "reminder" ? "持续" : "触发";
  return `[monitor] ${tag} ${ALERT_LEVELS[alert.level] || alert.level} ${alert.name}：${alert.detail}`;
}

/**
 * 推送告警。
 *
 * 三个通道各有各的用处，缺一不可：
 *   日志   运维排查时唯一能翻历史的地方
 *   站内   管理员登录就能看到，不用装任何东西
 *   webhook 学校要接钉钉/企业微信时用；没配就跳过，不是错误
 *
 * 任何一个通道失败都不能影响其他通道，更不能影响业务。
 */
export async function dispatchAlerts(alerts, deps = {}) {
  const { db, createNotification, log = console, fetchImpl = globalThis.fetch, env = process.env } = deps;
  const delivered = { log: 0, notification: 0, webhook: 0 };
  if (!alerts.length) return delivered;

  alerts.forEach((a) => {
    (a.level === "critical" && a.kind !== "resolved" ? log.error : log.warn)(alertLine(a));
    delivered.log += 1;
  });

  if (db && typeof createNotification === "function") {
    for (const a of alerts) {
      try {
        createNotification(
          db,
          {
            audience: "system_admin",
            title: `${a.kind === "resolved" ? "已恢复" : ALERT_LEVELS[a.level]}：${a.name}`,
            text: a.detail,
            source: "系统监控",
            level: a.level === "info" ? "info" : "warning",
          },
          null,
        );
        delivered.notification += 1;
      } catch (error) {
        log.error(`[monitor] 站内通知发送失败：${error.message}`);
      }
    }
  }

  const webhook = String(env.MONITOR_WEBHOOK_URL || "").trim();
  if (webhook && typeof fetchImpl === "function") {
    for (const a of alerts) {
      try {
        const res = await fetchImpl(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ msgtype: "text", text: { content: alertLine(a) } }),
          signal: AbortSignal.timeout(5000),
        });
        if (res?.ok) delivered.webhook += 1;
        else log.warn(`[monitor] webhook 返回 ${res?.status}`);
      } catch (error) {
        // webhook 挂了不能让监控本身挂掉——那就成了「监控系统故障导致服务不可用」
        log.warn(`[monitor] webhook 推送失败：${error.message}`);
      }
    }
  }

  return delivered;
}

/** 监控器：持有状态，被定时调用。 */
export function createMonitor(deps = {}) {
  let state = {};
  let last = null;

  return {
    async run(db, runtimeDeps = {}) {
      const metrics = await collectMetrics(db, { ...deps, ...runtimeDeps });
      const results = evaluateRules(metrics);
      const { alerts, nextState } = diffAlerts(state, results);
      state = nextState;
      const delivered = await dispatchAlerts(alerts, { ...deps, ...runtimeDeps, db });
      last = {
        at: metrics.at,
        healthy: results.every((r) => r.ok),
        checks: results,
        metrics,
        alerts,
        delivered,
      };
      return last;
    },
    latest() {
      return last;
    },
    // 测试用：注入一个已知的历史状态
    _setState(next) {
      state = next;
    },
  };
}
