#!/usr/bin/env node
// 生成一套可以上手点的演示数据
//
//   node scripts/seed-demo-data.js            默认排 3 个年级
//   node scripts/seed-demo-data.js --grades=6 排 6 个年级（慢一些）
//
// 用途：本地试用与验收演练。种子库里只有人和班级，没有课表、没有工资、
// 没有账套，一大半页面点进去是空的，看不出对错。
//
// **调的是业务函数，不是直接写库**。直接往表里塞数据能塞得很快，但塞出来的
// 东西可能违反业务规则（教师时间冲突、课时与工资对不上），
// 拿它测出来的问题有一半是假的。
//
// 这个脚本要在**服务停止时**运行：服务在内存里持有整个库并按影子快照做增量
// 持久化，此时另一个进程写库，服务下一次保存会把它覆盖掉。
import { ensureDatabase, saveDatabase } from "../server/storage.js";
import {
  buildSchedulingConfig,
  generateScheduleDraft,
  publishScheduleDraft,
  updateRoomResources,
} from "../server/scheduling.js";
import {
  createAcademicTerm,
  generatePayrollBatch,
  setCurrentAcademicTerm,
  updateTeacherAssignment,
} from "../server/storage.js";
import { carryOverRoster, initializeLedger } from "../server/ledgers.js";
import { runReconciliation } from "../server/reconcile.js";
import { createOaRequest, actOnOaRequest, ensureOaTemplates } from "../server/oa.js";

const gradeCount = Number((process.argv.find((a) => a.startsWith("--grades=")) || "").split("=")[1] || 3);

const log = (msg) => console.log(msg);
const step = (n, msg) => console.log(`\n[${n}] ${msg}`);

const actor = (role, name) => ({ id: `DEMO-${role}`, username: role, name, displayName: name, role });
const admin = actor("admin", "演示教务");
const hr = actor("hr", "演示人事");
const finance = actor("finance", "演示财务");

const db = await ensureDatabase();

// ---------------------------------------------------------------------------
// 1. 学期
//
// 起始日定在 8 月 1 日而不是今天：要让「已上完的课」和「还没上的课」同时存在。
// 全是未来的课，考勤、课时、工资三块都是空的；全是过去的课，课表页又没东西看。
// ---------------------------------------------------------------------------
step(1, "建立学期");
const TERM_ID = "TERM-2026-2027-1";
let term = (db.terms || []).find((t) => t.id === TERM_ID);
if (!term) {
  const created = createAcademicTerm(
    db,
    {
      id: TERM_ID,
      name: "2026-2027学年上学期",
      schoolYear: "2026-2027",
      semester: "上学期",
      startDate: "2026-08-01",
      endDate: "2027-01-31",
    },
    admin,
  );
  term = created.term || created;
  log(`  已建立 ${term.name}（${term.startDate} ~ ${term.endDate}）`);
} else {
  log(`  ${term.name} 已存在`);
}
setCurrentAcademicTerm(db, TERM_ID, admin);
log(`  已设为当前学期`);

// ---------------------------------------------------------------------------
// 2. 排课
// ---------------------------------------------------------------------------
step(2, `为 ${gradeCount} 个年级排课并发布`);

function assignTeachers(stageId, grade) {
  const divisionId = stageId === "primary" ? "elementary" : stageId;
  const gradeId = stageId === "primary" ? `elementary-g${grade}` : `${stageId}-g${grade}`;
  const classes = buildSchedulingConfig(db, { divisionId, gradeId }).classes;
  db.subjects.forEach((subject) => {
    const teachers = db.teachers.filter(
      (t) => t.status === "active" && t.stageId === stageId && t.primarySubjectId === subject.id,
    );
    if (!teachers.length) return;
    updateTeacherAssignment(
      db,
      {
        stageId,
        grade,
        subjectId: subject.id,
        classTeacherIds: Object.fromEntries(
          classes.map((c, i) => [c.id, [teachers[i % teachers.length].id]]),
        ),
      },
      admin,
    );
  });
  return { divisionId, gradeId };
}

// 专用教室按学部共享，多个年级同时排会抢不过来，先扩容
updateRoomResources(db, { stageId: "primary", grade: 1, roomCounts: { playground: 3, lab: 4 } }, admin);

const published = [];
for (let grade = 1; grade <= gradeCount; grade += 1) {
  const scope = assignTeachers("primary", grade);
  const startedAt = Date.now();
  try {
    const draft = generateScheduleDraft(db, scope, admin);
    const conflicts = draft.draft?.conflicts?.length || 0;
    const unassigned = Number(draft.draft?.unassignedCount || 0);
    const result = publishScheduleDraft(db, scope, admin);
    published.push({ grade, lessons: result.lessons.length, conflicts, unassigned });
    log(
      `  ${grade} 年级：发布 ${result.lessons.length} 节课` +
        `${conflicts ? `，冲突 ${conflicts}` : ""}${unassigned ? `，未排 ${unassigned}` : ""}` +
        `（${((Date.now() - startedAt) / 1000).toFixed(1)}s）`,
    );
  } catch (error) {
    log(`  ${grade} 年级排课失败：${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// 3. 请假与代课
//
// 计薪口径是「排给谁就算谁的」，所以不需要回填考勤。但要造出两种真实情形，
// 否则「已取消」和「代课」这两条路径在界面上永远是空的：
//   · 请假未安排代课 → 课次取消，谁也不计薪
//   · 请假安排了代课 → 课次改派给代课教师，钱跟着课走
// ---------------------------------------------------------------------------
step(3, "造出请假取消与代课两种情形");
const termLessons = (db.lessonInstances || []).filter((l) => l.termId === TERM_ID);
let cancelledCount = 0;
let substitutedCount = 0;

// 每 25 节取消一节（请假未安排代课）
termLessons.forEach((lesson, i) => {
  if (i % 25 !== 0) return;
  lesson.status = "cancelled";
  lesson.cancelledAt = new Date().toISOString();
  lesson.cancelReason = "教师请假，未安排代课";
  cancelledCount += 1;
});

// 每 30 节改派给同学科的另一位教师（代课）
termLessons.forEach((lesson, i) => {
  if (i % 30 !== 0 || lesson.status === "cancelled") return;
  const peer = db.teachers.find(
    (t) => t.id !== lesson.teacherId && t.status === "active" && t.primarySubjectId === lesson.subjectId,
  );
  if (!peer) return;
  lesson.teacherId = peer.id;
  lesson.teacherName = peer.name;
  lesson.substituteNote = "代课（演示数据）";
  substitutedCount += 1;
});
log(`  请假取消 ${cancelledCount} 节，代课改派 ${substitutedCount} 节`);

// ---------------------------------------------------------------------------
// 4. 账套
// ---------------------------------------------------------------------------
step(4, "建立账套");
const PAYROLL_MONTH = "2026-08";
for (const spec of [
  { type: "hr", period: "2026" },
  { type: "scheduling", period: TERM_ID },
  { type: "payroll", period: PAYROLL_MONTH },
  { type: "payroll", period: "2026-09" },
]) {
  const { created } = initializeLedger(db, spec, finance);
  carryOverRoster(db, spec.type, spec.period, hr);
  log(`  ${spec.type} / ${spec.period}${created ? "" : "（已存在）"}`);
}

// ---------------------------------------------------------------------------
// 5. 工资
// ---------------------------------------------------------------------------
step(5, `生成 ${PAYROLL_MONTH} 工资`);
const batch = generatePayrollBatch(db, { month: PAYROLL_MONTH }, { ...finance, financeScope: "primary" });
log(`  共 ${batch.total} 人：成功 ${batch.successCount}，失败 ${batch.failedCount}`);
if (batch.failedCount) {
  const reasons = [...new Set(batch.results.filter((r) => !r.ok).map((r) => r.error))].slice(0, 2);
  log(`  失败原因：${reasons.join("；")}`);
}

// ---------------------------------------------------------------------------
// 6. 对账
// ---------------------------------------------------------------------------
step(6, "运行三方对账");
const report = runReconciliation(db, PAYROLL_MONTH, {}, finance);
log(
  `  人事在岗 ${report.headcount.hrInService}，工资单 ${report.headcount.payrollCount}，` +
    `排课课时 ${report.workload.totalScheduledUnits}，计薪课时 ${report.workload.totalPaidUnits}`,
);
log(`  差异 ${report.differences.length} 处（严重 ${report.errorCount}）`);

// ---------------------------------------------------------------------------
// 7. 审批单
//
// 三种状态各来一点：待办的能点进去审，已通过的能看流转记录，
// 全是待办的话「我处理过」页签永远是空的。
// ---------------------------------------------------------------------------
step(7, "生成审批单");
ensureOaTemplates(db);
const teacherAccount = { ...actor("teacher", "演示教师"), id: (db.accounts.find((a) => a.role === "teacher") || {}).id || "DEMO-teacher" };

const leaveRequests = [
  { leaveType: "事假", startDate: "2026-09-03", endDate: "2026-09-04", days: 2, reason: "家中有事" },
  { leaveType: "病假", startDate: "2026-09-10", endDate: "2026-09-10", days: 1, reason: "感冒发烧" },
  { leaveType: "年假", startDate: "2026-09-20", endDate: "2026-09-24", days: 5, reason: "年假休息" },
];
let created = 0;
leaveRequests.forEach((formData, i) => {
  try {
    const req = createOaRequest(db, teacherAccount, { templateKey: "leave", formData });
    created += 1;
    // 第一条走完审批，留下一条「已处理」的记录
    if (i === 0) {
      try {
        actOnOaRequest(db, req.id, "approve", { ...admin, role: "division_head" }, {});
      } catch {
        /* 审批人角色对不上就留成待办，不影响演示 */
      }
    }
  } catch (error) {
    log(`  跳过一条请假单：${error.message}`);
  }
});
log(`  已生成 ${created} 条请假申请`);

// ---------------------------------------------------------------------------
await saveDatabase(db);

console.log("\n─────────────────────────────────────────");
console.log("演示数据已写入。各模块现在都有东西可看：");
console.log(`  课表      ${published.reduce((s, p) => s + p.lessons, 0)} 节课（${published.length} 个年级）`);
console.log(`  请假代课  取消 ${cancelledCount} 节，代课 ${substitutedCount} 节`);
console.log(`  工资      ${PAYROLL_MONTH} 共 ${batch.successCount} 份`);
console.log(`  账套      4 个（人事 / 排课 / 薪资 ×2）`);
console.log(`  对账      ${report.differences.length} 处差异`);
console.log(`  审批      ${created} 条请假申请`);
console.log("─────────────────────────────────────────");
process.exit(0);
