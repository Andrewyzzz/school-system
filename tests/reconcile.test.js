// 三方对账与差异台账（验收 8.12 / 8.13 / 8.14）
//
// 这三条的价值全在一点上：**差异要落到具体的人和具体的课**。
// 报一句「相差 4 人」等于把活儿又推回给人工——财务还得自己去两张表里一行行比。
// 所以这里的断言几乎都在检查「有没有指出是谁」，而不只是「数字对不对」。
import assert from "node:assert/strict";
import { createInitialData, normalizeDatabase } from "../server/storage.js";
import {
  latestReconciliation,
  reconcileHeadcount,
  reconcileWorkload,
  runReconciliation,
} from "../server/reconcile.js";

function freshDb() {
  const db = createInitialData({ teacherCount: 10 });
  normalizeDatabase(db);
  db.payrollDetails = [];
  db.lessonInstances = [];
  db.notifications = db.notifications || [];
  return db;
}

const MONTH = "2026-06";
const actor = { id: "ACC-FIN", name: "小学部会计" };

const payroll = (teacherId, over = {}) => ({
  id: `PD-${teacherId}-${MONTH}`,
  teacherId,
  month: MONTH,
  status: "generated",
  summarySnapshot: { grossPay: 8500, payableUnits: 20, lessonAmount: 1600, ...over },
});

const lesson = (teacherId, over = {}) => ({
  id: `L-${teacherId}-${Math.random().toString(36).slice(2, 8)}`,
  teacherId,
  date: "2026-06-15",
  time: "08:00-08:40",
  units: 1,
  status: "completed",
  ...over,
});

// ---------------------------------------------------------------------------
// 1. 人数对账：必须指出是哪几个人（验收 8.12）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const emps = db.employees.slice(0, 4);
  emps.forEach((e) => {
    e.status = "active";
    e.hiredAt = "2024-09-01";
    e.leftAt = "";
  });

  // 三个人有工资单，第四个人在岗却漏了
  emps.slice(0, 3).forEach((e) => db.payrollDetails.push(payroll(e.teacherId)));

  const result = reconcileHeadcount(db, MONTH);
  assert.equal(result.balanced, false);
  assert.ok(result.hrInService >= 4);
  assert.equal(result.payrollCount, 3);

  const missing = result.differences.filter((d) => d.kind === "missing_payroll");
  assert.ok(missing.length >= 1, "在岗但没工资单的必须报出来");
  const target = missing.find((d) => d.employeeId === emps[3].id);
  assert.ok(target, "必须指出具体是哪个人，而不是只说「少 1 人」");
  assert.ok(target.name, "要带姓名，财务才能直接去找人");
  assert.equal(target.teacherId, emps[3].teacherId);
}

// ---------------------------------------------------------------------------
// 2. 已离职却仍在发工资，与查无此人要分开
//
// 前者是流程没跟上（离职手续走了但工资没停），后者是数据问题。
// 处理方式完全不同，混成一类会让财务无从下手。
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const emps = db.employees.slice(0, 3);
  emps.forEach((e) => {
    e.status = "active";
    e.hiredAt = "2024-09-01";
    e.leftAt = "";
    db.payrollDetails.push(payroll(e.teacherId));
  });
  // 第一个人已离职，工资单还在
  emps[0].status = "left";
  emps[0].leftAt = "2026-05-20";

  const result = reconcileHeadcount(db, MONTH);
  const extra = result.differences.filter((d) => d.kind === "extra_payroll");
  const leftOne = extra.find((d) => d.teacherId === emps[0].teacherId);
  assert.ok(leftOne, "已离职却仍有工资单必须报出来");
  assert.match(leftOne.detail, /已离职/, "要说明是「已离职仍在发」，而不是笼统的「不在岗」");
  assert.ok(leftOne.amount > 0, "要带上金额——这是可能已经多发出去的钱");

  // 查无此人的情况
  db.payrollDetails.push(payroll("T-GHOST"));
  const withGhost = reconcileHeadcount(db, MONTH);
  const ghost = withGhost.differences.find((d) => d.teacherId === "T-GHOST");
  assert.ok(ghost);
  assert.match(ghost.detail, /无在岗记录/, "查无此人应与已离职区分开");
}

// ---------------------------------------------------------------------------
// 3. 课时对账（验收 8.13）
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const t = db.teachers.slice(0, 3);
  db.employees.slice(0, 3).forEach((e, i) => {
    e.status = "active";
    e.hiredAt = "2024-09-01";
    e.leftAt = "";
    e.teacherId = t[i].id;
  });

  // 甲：排课 20 课时，计薪 20 —— 平
  for (let i = 0; i < 20; i += 1) db.lessonInstances.push(lesson(t[0].id));
  db.payrollDetails.push(payroll(t[0].id, { payableUnits: 20 }));

  // 乙：排课 18，计薪 20 —— 多算了 2
  for (let i = 0; i < 18; i += 1) db.lessonInstances.push(lesson(t[1].id));
  db.payrollDetails.push(payroll(t[1].id, { payableUnits: 20 }));

  // 丙：计薪 5 课时但课时费为 0
  for (let i = 0; i < 5; i += 1) db.lessonInstances.push(lesson(t[2].id));
  db.payrollDetails.push(payroll(t[2].id, { payableUnits: 5, lessonAmount: 0 }));

  const result = reconcileWorkload(db, MONTH);
  assert.equal(result.totalScheduledUnits, 43, "排课侧应只统计已完成的课次");
  assert.equal(result.totalPaidUnits, 45);
  assert.equal(result.gap, -2);
  assert.equal(result.balanced, false);

  const mismatch = result.differences.find((d) => d.kind === "unit_mismatch" && d.teacherId === t[1].id);
  assert.ok(mismatch, "课时不符必须指出是谁");
  assert.equal(mismatch.scheduledUnits, 18);
  assert.equal(mismatch.paidUnits, 20);
  assert.equal(mismatch.gap, -2);
  assert.match(mismatch.detail, /排课 18 课时，计薪 20 课时/, "要把两边的数字都写出来，便于直接核对");

  const zero = result.differences.find((d) => d.kind === "zero_pay" && d.teacherId === t[2].id);
  assert.ok(zero, "有课时却零课时费应报出来——多半是计薪规则没配到位");

  // 甲是平的，不应出现在差异里
  assert.ok(!result.differences.some((d) => d.teacherId === t[0].id), "对得平的人不应出现在差异清单里");
}

// ---------------------------------------------------------------------------
// 4. 排课侧与工资侧必须用同一个口径
//
// 计薪口径是「排给谁就算谁的，取消的不算」。对账的排课侧要用**完全相同**的
// 口径，否则这张表天天报差异，报的却是两边算法不同，不是真的对不平——
// 而一张天天报错的对账表，等于没有对账表。
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const t = db.teachers[0];
  db.employees[0].status = "active";
  db.employees[0].hiredAt = "2024-09-01";
  db.employees[0].teacherId = t.id;

  for (let i = 0; i < 10; i += 1) db.lessonInstances.push(lesson(t.id));
  db.lessonInstances.push(lesson(t.id, { status: "scheduled" }));
  db.lessonInstances.push(lesson(t.id, { status: "scheduled" }));
  // 取消的课两边都不算
  db.lessonInstances.push(lesson(t.id, { status: "cancelled" }));
  db.payrollDetails.push(payroll(t.id, { payableUnits: 12 }));

  const result = reconcileWorkload(db, MONTH);
  assert.equal(result.totalScheduledUnits, 12, "排给教师的 12 节都算，取消的那节不算");
  assert.equal(result.balanced, true, "两边口径一致时应对得平");

  // 取消的课如果被计了薪，必须报出来
  const db2 = freshDb();
  db2.employees[0].status = "active";
  db2.employees[0].hiredAt = "2024-09-01";
  db2.employees[0].teacherId = t.id;
  for (let i = 0; i < 10; i += 1) db2.lessonInstances.push(lesson(t.id));
  db2.lessonInstances.push(lesson(t.id, { status: "cancelled" }));
  db2.payrollDetails.push(payroll(t.id, { payableUnits: 11 }));
  const result2 = reconcileWorkload(db2, MONTH);
  assert.equal(result2.totalScheduledUnits, 10);
  assert.equal(result2.balanced, false, "取消的课被计了薪，必须报差异");
}

// ---------------------------------------------------------------------------
// 5. 别的月份不应混进来
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const t = db.teachers[0];
  db.employees[0].status = "active";
  db.employees[0].hiredAt = "2024-09-01";
  db.employees[0].teacherId = t.id;

  for (let i = 0; i < 5; i += 1) db.lessonInstances.push(lesson(t.id));
  for (let i = 0; i < 8; i += 1) db.lessonInstances.push(lesson(t.id, { date: "2026-07-10" }));
  db.payrollDetails.push(payroll(t.id, { payableUnits: 5 }));
  db.payrollDetails.push({ ...payroll(t.id), id: "PD-JULY", month: "2026-07" });

  const result = reconcileWorkload(db, MONTH);
  assert.equal(result.totalScheduledUnits, 5, "7 月的课次不应算进 6 月的对账");
  assert.equal(result.totalPaidUnits, 5, "7 月的工资单同样不应混入");
  assert.equal(result.balanced, true);
}

// ---------------------------------------------------------------------------
// 6. 同一个问题不该在两张表里各报一次
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const t = db.teachers[0];
  db.employees[0].status = "active";
  db.employees[0].hiredAt = "2024-09-01";
  db.employees[0].teacherId = t.id;
  // 有课但完全没有工资单
  for (let i = 0; i < 6; i += 1) db.lessonInstances.push(lesson(t.id));

  const workload = reconcileWorkload(db, MONTH);
  const uncounted = workload.differences.filter((d) => d.teacherId === t.id);
  assert.equal(uncounted.length, 1, "没有工资单的人在课时对账里只该报一条，不该同时报课时不符");
  assert.equal(uncounted[0].kind, "uncounted_lesson");
}

// ---------------------------------------------------------------------------
// 7. 差异台账与提醒（验收 8.14）
//
// 8.14 要的是「自动生成差异台账提醒」——现场会去查那条记录。
// 跑完就丢的结果满足不了它。
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const emps = db.employees.slice(0, 3);
  emps.forEach((e) => {
    e.status = "active";
    e.hiredAt = "2024-09-01";
    e.leftAt = "";
  });
  db.payrollDetails.push(payroll(emps[0].teacherId, { payableUnits: 10 }));
  for (let i = 0; i < 8; i += 1) db.lessonInstances.push(lesson(emps[0].teacherId));

  const before = db.notifications.length;
  const report = runReconciliation(db, MONTH, {}, actor);

  assert.equal(report.balanced, false);
  assert.ok(report.errorCount > 0, "在岗无工资单属于必须处理的错误级");
  assert.ok(report.differences.every((d) => d.kindLabel), "每条差异要有中文类型名，现场看的是这个");
  assert.ok(report.differences.every((d) => d.severity), "要分错误与提示两级");

  // 台账要落库
  const saved = latestReconciliation(db, MONTH);
  assert.ok(saved, "差异台账必须落库，跑完就丢满足不了 8.14");
  assert.equal(saved.month, MONTH);
  assert.equal(saved.differences.length, report.differences.length);
  assert.ok(saved.ranAt && saved.ranByName);

  // 提醒
  const notes = db.notifications.slice(before);
  assert.equal(notes.length, 1, "有差异应推一条提醒");
  assert.match(notes[0].title, /对账发现/);
  assert.match(notes[0].text, /人事在岗/, "提醒里要有两侧的数字，不能只说「发现差异」");
  assert.equal(notes[0].level, "warning");

  // 重跑覆盖，不累积
  const second = runReconciliation(db, MONTH, {}, actor);
  assert.equal((db.reconciliations || []).filter((r) => r.month === MONTH).length, 1, "同月重跑应覆盖上一次");
  assert.ok(second.ranAt);
}

// ---------------------------------------------------------------------------
// 8. 全部对平时不应打扰人
// ---------------------------------------------------------------------------
{
  const db = freshDb();
  const t = db.teachers[0];
  db.employees.forEach((e) => {
    e.status = "left";
    e.leftAt = "2020-01-01";
  });
  db.employees[0].status = "active";
  db.employees[0].hiredAt = "2024-09-01";
  db.employees[0].leftAt = "";
  db.employees[0].teacherId = t.id;

  for (let i = 0; i < 12; i += 1) db.lessonInstances.push(lesson(t.id));
  db.payrollDetails.push(payroll(t.id, { payableUnits: 12 }));

  const before = db.notifications.length;
  const report = runReconciliation(db, MONTH, {}, actor);
  assert.equal(report.balanced, true, `应完全对平，实际差异：${JSON.stringify(report.differences)}`);
  assert.equal(report.differences.length, 0);
  assert.equal(
    db.notifications.length,
    before,
    "没差异不该推提醒——每月都推一条「一切正常」，人很快就学会忽略这类通知了",
  );
}

console.log("reconcile checks passed");
