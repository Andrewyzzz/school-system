// 账套解锁审批（验收 8.10「账套解锁需多级审批，解锁操作留完整日志」）
//
// 这一项的验收方式是「现场走一次解锁审批并查看日志」，所以真正要证明的是
// **这条路走得通**，不是「有个函数叫 unlockLedgerByApproval」。
//
// 补这个测试的直接原因：unlockLedgerByApproval 写好了、被 import 了，
// 但没有任何地方调用它——没有审批模板，也没有注册副作用。结果是账套接口上
// 根本没有解锁动作，界面上也没有入口，**账套一锁就是永久锁死**。
// 这比「解锁不需要审批」更糟，而且从代码上完全看不出来：函数在那儿，
// 导入语句也在那儿。
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { actOnOaRequest, createOaRequest, ensureOaTemplates, findTemplate } from "../server/oa.js";
// 用生产代码里那一份注册，不要在测试里自己注册一份一模一样的：
// 那样验证的是测试自己写的副本，server.js 里接错了照样通过——
// 而这个测试存在的原因恰恰就是「函数写好了但没人调用」。
import { registerApprovalSideEffects } from "../server/server.js";
import {
  findLedger,
  initializeLedger,
  transitionLedger,
  unlockLedgerByApproval,
} from "../server/ledgers.js";
import { createInitialData, normalizeDatabase } from "../server/storage.js";

registerApprovalSideEffects();

const account = (role, name) => ({ id: `ACC-${role}`, username: role, displayName: name, name, role });

function seed() {
  const db = createInitialData({ teacherCount: 5 });
  normalizeDatabase(db);
  ensureOaTemplates(db);
  initializeLedger(db, { type: "payroll", period: "2026-06" }, null);
  transitionLedger(db, { type: "payroll", period: "2026-06", to: "locked", reason: "月度结算定案" }, account("finance", "陈财务"));
  return db;
}

// ---------------------------------------------------------------------------
// 1. 解锁模板存在，且是多级审批
// ---------------------------------------------------------------------------
{
  const db = seed();
  const template = findTemplate(db, "ledger_unlock");
  assert.ok(template, "应有账套解锁审批模板——没有模板，锁定的账套永远解不开");
  assert.ok(
    template.steps.length >= 3,
    `8.10 要求「多级审批」，当前只有 ${template.steps.length} 级`,
  );

  // 审批人角色不能重复到「一个人从头批到尾」
  const roleSets = template.steps.map((s) => s.approverRoles.join(","));
  assert.equal(new Set(roleSets).size, roleSets.length, "各级审批人角色应不同，否则多级形同一级");
  assert.ok(
    template.steps.some((s) => s.approverRoles.includes("principal")),
    "最终应由校领导拍板——已锁定意味着钱已经发了",
  );

  // 教师不能发起
  assert.ok(!template.applicantRoles.includes("teacher"), "普通教师不应能发起账套解锁");
}

// ---------------------------------------------------------------------------
// 2. 走完三级审批，账套真的解开了
//
// 这是整个测试的重点。前面那些都只是在看配置，只有真的把单子批完、
// 再回头看账套状态，才知道副作用有没有接上。
// ---------------------------------------------------------------------------
{
  const db = seed();
  assert.equal(findLedger(db, "payroll", "2026-06").status, "locked", "前置：账套应是已锁定");

  const request = createOaRequest(db, account("finance", "陈财务"), {
    templateKey: "ledger_unlock",
    formData: {
      ledgerType: "薪资财务账套",
      period: "2026-06",
      reason: "6 月有两名教师的课时费漏计，需重算",
      impact: "涉及 2 人，合计约 3200 元",
    },
  });
  assert.equal(request.status, "pending");

  // 前两级批完，账套仍然是锁定的——半路解锁等于审批流形同虚设
  actOnOaRequest(db, request.id, "approve", account("finance", "李复核"), {});
  assert.equal(
    findLedger(db, "payroll", "2026-06").status,
    "locked",
    "财务复核通过后不应解锁——还没到校领导那一步",
  );
  actOnOaRequest(db, request.id, "approve", account("hr", "王人事"), {});
  assert.equal(
    findLedger(db, "payroll", "2026-06").status,
    "locked",
    "人事复核通过后仍不应解锁",
  );

  // 校领导批完才解锁
  const done = actOnOaRequest(db, request.id, "approve", account("principal", "张校长"), {});
  assert.equal(done.status, "approved", "三级批完应为已通过");

  const ledger = findLedger(db, "payroll", "2026-06");
  assert.equal(ledger.status, "active", "审批通过后账套应真的解开——否则这条路走不通，等于永久锁死");
  assert.equal(ledger.unlockCount, 1, "解锁次数要计数（8.10 的日志依据）");
  assert.ok(ledger.unlockedAt, "应记录解锁时间");
  assert.match(String(ledger.unlockedByName), /张校长|审批/, "应记录是谁批的");
  assert.equal(ledger.unlockRequestId, request.id, "应能从账套反查到审批单");
  assert.match(String(ledger.unlockReason), /课时费漏计/, "解锁原因应落到账套上");

  // 审批单上也要能看到结果，不用再去账套页找
  assert.equal(done.appliedResult?.type, "ledger_unlock");
  assert.equal(done.appliedResult?.unlockCount, 1);
}

// ---------------------------------------------------------------------------
// 3. 期间格式在发起时就要拦，不能等三级批完才发现
// ---------------------------------------------------------------------------
{
  const db = seed();
  assert.throws(
    () =>
      createOaRequest(db, account("finance", "陈财务"), {
        templateKey: "ledger_unlock",
        formData: { ledgerType: "薪资财务账套", period: "2026-6", reason: "x", impact: "y" },
      }),
    /YYYY-MM/,
    "薪资账套期间格式错误应在发起时就拦下，等三级批完才炸是浪费三个人的时间",
  );
  assert.throws(
    () =>
      createOaRequest(db, account("finance", "陈财务"), {
        templateKey: "ledger_unlock",
        formData: { ledgerType: "人事账套", period: "2026-06", reason: "x", impact: "y" },
      }),
    /年份/,
    "人事账套期间应为年份",
  );
}

// ---------------------------------------------------------------------------
// 4. 没锁的账套不能解锁
// ---------------------------------------------------------------------------
{
  const db = createInitialData({ teacherCount: 5 });
  normalizeDatabase(db);
  initializeLedger(db, { type: "payroll", period: "2026-07" }, null);
  assert.throws(
    () => unlockLedgerByApproval(db, { type: "payroll", period: "2026-07", reason: "x" }, null),
    /只有已锁定的账套需要解锁/,
    "使用中的账套不该被「解锁」——那是个无意义的状态变更",
  );
}

// ---------------------------------------------------------------------------
// 5. 解锁必须是唯一入口：账套路由上不能有直接解锁的动作
//
// 只要 HTTP 上开一个「改成 active」的口子，前面三级审批就全白做了。
// ---------------------------------------------------------------------------
{
  const server = await fs.readFile(new URL("../server/server.js", import.meta.url), "utf-8");
  const app = await fs.readFile(new URL("../app.js", import.meta.url), "utf-8");

  assert.match(
    server,
    /registerOaSideEffect\("unlockApprovedLedger"/,
    "必须注册解锁副作用，否则 unlockLedgerByApproval 是死代码，账套永久锁死",
  );

  // 账套路由块里不能出现「to: active」这种直接改回去的写法
  const start = server.indexOf('if (url.pathname === "/api/ledgers"');
  const block = server.slice(start, server.indexOf('if (url.pathname === "/api/reconciliation"'));
  assert.ok(
    !/"active"/.test(block),
    "账套路由里不应出现把状态改回 active 的路径——解锁只能走审批",
  );

  // 界面上给的是「申请解锁」而不是「解锁」
  assert.match(app, /申请解锁/, "已锁定的账套要有申请解锁的入口，否则操作的人会以为系统坏了");
  assert.match(app, /data-ledger-unlock/, "申请解锁按钮应有对应的点击处理");
  assert.match(app, /openOaCreateDialog\("ledger_unlock"/, "应跳到审批流程发起申请");
  assert.ok(
    !/LEDGER_ACTION_LABELS\s*=\s*\{[^}]*"解锁"/.test(app),
    "界面不得提供直接「解锁」的动作按钮",
  );
}

// ---------------------------------------------------------------------------
// 6. 副作用没注册时要报出来，不能静默跳过
//
// 上一版就是这么坏的：handler 不存在就 return，审批照样显示「已通过」，
// 而账套还锁着。屏幕上是绿的，事情没做——这种失败最难查。
// ---------------------------------------------------------------------------
{
  const oa = await fs.readFile(new URL("../server/oa.js", import.meta.url), "utf-8");
  const fn = oa.slice(oa.indexOf("function applyLedgerUnlockEffect"));
  const body = fn.slice(0, fn.indexOf("\n}\n"));
  assert.match(body, /sideEffectHandlers\.unlockApprovedLedger/, "应查找已注册的副作用");
  assert.match(body, /无法识别/, "账套类型对不上时要报错，不能默默什么都不做");
}

console.log("ledger unlock checks passed");
