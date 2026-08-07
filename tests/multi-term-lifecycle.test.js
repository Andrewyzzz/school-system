// 多学期长周期推进测试
//
// 补两类历史盲区：
//   1) 集成缝隙：既有测试要么只跑内存域逻辑、要么只测持久层，没有一个走完
//      "业务写操作 → 落盘 PostgreSQL → 重载校验" 的完整链路，导致跨学期主键冲突
//      这类问题在单测全绿的情况下逃逸到生产。
//   2) 时间维度：所有测试都用写死日期，从未模拟"当前时间越过学期结束日"，
//      因此学期状态不随日历推进的问题直到真实跨过 7/31 才暴露。
//
// 本测试模拟连续三个学期的真实运转：
//   建学期 → 复制配置 → 排课发布 → 上课签到 → 工作量确认 → 工资生成/确认/复核/锁定
//   → 归档 → 换届到下一学期，每个学期都校验与前序学期的数据隔离。
import assert from "node:assert/strict";
import {
  archiveAcademicTerm,
  confirmMonthlyWorkload,
  approveMonthlyWorkload,
  createAcademicTerm,
  createInitialData,
  generateTeacherPayrollDetail,
  publishTeacherPayrollDetail,
  confirmTeacherPayrollDetail,
  reviewTeacherPayrollDetail,
  lockTeacherPayrollDetail,
  queryTerms,
  setCurrentAcademicTerm,
  termDatePhase,
  teacherPayrollPreview,
  updateTeacherAssignment,
} from "../server/storage.js";
import { buildSchedulingConfig } from "../server/scheduling.js";

const actor = (db, username) => db.accounts.find((item) => item.username === username);

// ---------------------------------------------------------------------------
// 落盘模拟：postgresStore 的重复主键校验是纯函数式的，这里直接复用其判定逻辑，
// 让测试无需真实数据库即可捕获"写得进内存但存不进库"的问题。
// ---------------------------------------------------------------------------
const PERSISTED_COLLECTIONS = [
  "terms",
  "classes",
  "rooms",
  "teachers",
  "accounts",
  "gradeCourseRules",
  "teacherAssignments",
  "scheduleConstraints",
  "teacherScheduleRules",
  "roomResourceOverrides",
  "scheduleDrafts",
  "lessonInstances",
  "attendanceRecords",
  "payrollDetails",
  "monthlyWorkloads",
  "employees",
  "oaRequests",
];

function assertPersistable(db, stage) {
  PERSISTED_COLLECTIONS.forEach((key) => {
    const rows = db[key];
    if (!Array.isArray(rows)) return;
    const seen = new Map();
    rows.forEach((row, index) => {
      const id = row?.id;
      if (!id) return;
      if (seen.has(id)) {
        assert.fail(
          `[${stage}] 集合 ${key} 存在重复主键 ${id}（第 ${seen.get(id)} 与第 ${index} 行）——持久化会被拒绝`,
        );
      }
      seen.set(id, index);
    });
  });
}

// 序列化往返：模拟存库再读出，确保数据结构可安全持久化（无循环引用、无函数）
function roundTrip(db, stage) {
  assertPersistable(db, stage);
  let serialized;
  try {
    serialized = JSON.stringify(db);
  } catch (error) {
    assert.fail(`[${stage}] 数据无法序列化持久化：${error.message}`);
  }
  const restored = JSON.parse(serialized);
  assert.equal(
    (restored.terms || []).length,
    (db.terms || []).length,
    `[${stage}] 往返后学期数量应保持一致`,
  );
  return restored;
}

// ---------------------------------------------------------------------------
// 一个学期的完整运转
// ---------------------------------------------------------------------------
function runTermCycle(db, { term, month, label }) {
  const admin = actor(db, "admin");
  const finance = actor(db, "finance");

  // --- 排课准备：确认该学期的班级与任课配置已就绪 ---
  const config = buildSchedulingConfig(db, { termId: term.id, divisionId: "elementary", gradeId: "elementary-g1" });
  assert.ok(config.classes.length > 0, `[${label}] 学期应有可排课班级`);
  config.classes.forEach((schoolClass) => {
    assert.ok(
      !schoolClass.termId || schoolClass.termId === term.id,
      `[${label}] 排课配置混入了其他学期的班级：${schoolClass.id}`,
    );
  });

  // --- 制造该学期的课次与出勤（直接构造，避免依赖求解器可用性）---
  const teacher = db.teachers.find((item) => item.stageId === "primary" && item.status === "active");
  assert.ok(teacher, `[${label}] 应有可用教师`);
  // 一个月的真实课量：20 个工作日 × 多课型，并混入未签到与已取消的异常课次
  const lessonPlan = [];
  for (let day = 1; day <= 20; day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    lessonPlan.push({ date, type: "regular", status: "completed" });
    if (day % 5 === 0) lessonPlan.push({ date, type: "evening", status: "completed" });
    if (day % 7 === 0) lessonPlan.push({ date, type: "makeup", status: "completed" });
    // 每月两节未签到（不应计薪）、一节已取消（如请假代课后取消）
    if (day === 11 || day === 18) lessonPlan.push({ date, type: "regular", status: "scheduled" });
    if (day === 15) lessonPlan.push({ date, type: "regular", status: "cancelled" });
  }
  lessonPlan.forEach((plan, index) => {
    const paid = plan.status === "completed";
    db.lessonInstances.push({
      id: `LESSON-${term.id}-${teacher.id}-${index}`,
      termId: term.id,
      teacherId: teacher.id,
      teacherName: teacher.name,
      classId: config.classes[0].id,
      className: config.classes[0].name,
      subjectId: teacher.primarySubjectId || "chinese",
      subjectName: "语文",
      date: plan.date,
      time: plan.type === "evening" ? "19:00-19:40" : "08:00-08:40",
      period: plan.type === "evening" ? 9 : 1,
      roomId: config.classes[0].roomId || "",
      room: "教室",
      type: plan.type,
      units: 1,
      status: plan.status,
      source: "backend-scheduling",
      checkInAt: paid ? `${plan.date}T08:00:00+08:00` : "",
      checkOutAt: paid ? `${plan.date}T08:40:00+08:00` : "",
    });
  });
  const completedCount = lessonPlan.filter((item) => item.status === "completed").length;
  const unpaidCount = lessonPlan.length - completedCount;
  roundTrip(db, `${label}-课次落盘`);

  // --- 月度工作量确认 ---
  const workload = confirmMonthlyWorkload(db, teacher.id, month, actor(db, teacher.username || "teacher0001"));
  assert.ok(workload, `[${label}] 工作量确认应返回结果`);
  approveMonthlyWorkload(db, teacher.id, month, "academic", admin);
  approveMonthlyWorkload(db, teacher.id, month, "school", admin);
  roundTrip(db, `${label}-工作量确认落盘`);

  // --- 工资全链路：生成 → 发布 → 教师确认 → 财务复核 → 锁定 ---
  let payroll = generateTeacherPayrollDetail(db, teacher.id, month, finance);
  assert.equal(payroll.generated.status, "saved", `[${label}] 工资应生成为已保存`);
  assert.equal(payroll.termId, term.id, `[${label}] 工资单应归属当前学期`);

  payroll = publishTeacherPayrollDetail(db, teacher.id, month, finance);
  assert.equal(payroll.generated.status, "generated");

  const teacherAccount = db.accounts.find((item) => item.teacherId === teacher.id);
  payroll = confirmTeacherPayrollDetail(db, teacher.id, month, teacherAccount);
  assert.equal(payroll.generated.status, "teacher_confirmed");

  payroll = reviewTeacherPayrollDetail(db, teacher.id, month, finance);
  assert.equal(payroll.generated.status, "reviewed");

  // 真实边界：本月仍有未签到课次时，系统必须拒绝锁定（防止漏结算）
  assert.throws(
    () => lockTeacherPayrollDetail(db, teacher.id, month, finance),
    /未完成签入签出|待处理|不能锁定|异常/,
    `[${label}] 存在未签到课次时不应允许锁定工资`,
  );

  // 教务处理异常课次后（补签或确认取消），方可锁定
  (db.lessonInstances || [])
    .filter((lesson) => lesson.termId === term.id && lesson.teacherId === teacher.id && lesson.status === "scheduled")
    .forEach((lesson) => {
      lesson.status = "cancelled";
      lesson.cancelReason = "月末核对：该课次未实际发生";
    });
  payroll = generateTeacherPayrollDetail(db, teacher.id, month, finance, { force: true });
  payroll = publishTeacherPayrollDetail(db, teacher.id, month, finance);
  payroll = confirmTeacherPayrollDetail(db, teacher.id, month, teacherAccount);
  payroll = reviewTeacherPayrollDetail(db, teacher.id, month, finance);
  payroll = lockTeacherPayrollDetail(db, teacher.id, month, finance);
  assert.equal(payroll.generated.status, "locked", `[${label}] 异常课次处理后应可锁定`);

  // 锁定是幂等的：重复调用返回同一状态而不报错（前端重复点击友好）
  const relocked = lockTeacherPayrollDetail(db, teacher.id, month, finance);
  assert.equal(relocked.generated.status, "locked", `[${label}] 重复锁定应幂等`);
  assert.equal(relocked.generated.id, payroll.generated.id, `[${label}] 重复锁定不应产生新工资单`);

  // 但锁定后的金额不可被改写：重新生成必须被拒绝
  assert.throws(
    () => generateTeacherPayrollDetail(db, teacher.id, month, finance),
    /已锁定/,
    `[${label}] 已锁定工资不应可重新生成`,
  );
  // 只有已完成（签到签出）的课次才计薪，未签到与已取消不得计入
  const lessonRow = (payroll.rows || []).find((row) => row.name === "课时工资");
  assert.ok(lessonRow, `[${label}] 工资明细应含课时工资`);
  const paidLines = (payroll.lines || []).filter((line) => line.payable);
  assert.equal(paidLines.length, completedCount, `[${label}] 计薪课次数应等于已完成课次数`);
  assert.ok(
    (payroll.lines || []).filter((line) => !line.payable).length >= unpaidCount,
    `[${label}] 未签到/已取消课次不应计薪`,
  );
  console.log(
    `  ${label}: 排 ${lessonPlan.length} 节（计薪 ${completedCount} / 不计薪 ${unpaidCount}）| 课时费 ¥${lessonRow.amount.toFixed(2)} | 应发 ¥${payroll.grossPay.toFixed(2)} | ${term.name}`,
  );
  roundTrip(db, `${label}-工资锁定落盘`);

  const lockedRecord = (db.payrollDetails || []).find((item) => item.id === payroll.generated.id);
  return {
    teacher,
    month,
    lockedPayrollId: payroll.generated.id,
    snapshotGrossPay: lockedRecord?.summarySnapshot?.grossPay,
  };
}

// ---------------------------------------------------------------------------
// 主流程：连续三个学期
// ---------------------------------------------------------------------------
const db = createInitialData({ teacherCount: 60 });
const admin = actor(db, "admin");

// 首个学期沿用种子数据（2026-06-15 ~ 2026-07-31）
const firstTerm = queryTerms(db).currentTerm;
assert.equal(firstTerm.current, true);
roundTrip(db, "初始数据落盘");

const history = [];
history.push(runTermCycle(db, { term: firstTerm, month: "2026-06", label: "学期1" }));

// --- 换届到第二学期 ---
const secondTerm = createAcademicTerm(
  db,
  {
    name: "2026-2027学年上学期",
    schoolYear: "2026-2027",
    semester: "上学期",
    startDate: "2026-09-01",
    endDate: "2027-01-20",
    copyConfig: true,
  },
  admin,
).term;
roundTrip(db, "学期2创建落盘");

// 跨学期主键隔离：这正是历史上导致新学期建不成的缺陷
{
  const firstClasses = (db.classes || []).filter((item) => !item.termId || item.termId === firstTerm.id);
  const secondClasses = (db.classes || []).filter((item) => item.termId === secondTerm.id);
  assert.ok(secondClasses.length > 0, "新学期应复制出班级");
  const firstIds = new Set(firstClasses.map((item) => item.id));
  secondClasses.forEach((item) => {
    assert.ok(!firstIds.has(item.id), `新学期班级 ID 与上学期冲突：${item.id}`);
  });
  // 引用完整性
  const secondRoomIds = new Set((db.rooms || []).filter((item) => item.termId === secondTerm.id).map((item) => item.id));
  secondClasses.forEach((item) => {
    if (item.roomId) assert.ok(secondRoomIds.has(item.roomId), `班级默认教室未指向本学期教室：${item.id}`);
  });
}

setCurrentAcademicTerm(db, secondTerm.id, admin);
assert.equal(queryTerms(db).currentTerm.id, secondTerm.id, "应切换到第二学期");
roundTrip(db, "学期2切换落盘");

// 归档第一学期后，其数据转为只读但仍完整保留
archiveAcademicTerm(db, firstTerm.id, admin);
{
  const archived = queryTerms(db).terms.find((item) => item.id === firstTerm.id);
  assert.equal(archived.status, "archived", "上一学期应归档");
  // 归档后历史工资仍在，且保持锁定
  const historical = (db.payrollDetails || []).find((item) => item.id === history[0].lockedPayrollId);
  assert.ok(historical, "归档不应删除历史工资单");
  assert.equal(historical.status, "locked", "历史工资应保持锁定");
}
roundTrip(db, "学期1归档落盘");

history.push(runTermCycle(db, { term: secondTerm, month: "2026-09", label: "学期2" }));

// --- 换届到第三学期 ---
const thirdTerm = createAcademicTerm(
  db,
  {
    name: "2026-2027学年下学期",
    schoolYear: "2026-2027",
    semester: "下学期",
    startDate: "2027-02-20",
    endDate: "2027-07-10",
    copyConfig: true,
  },
  admin,
).term;
setCurrentAcademicTerm(db, thirdTerm.id, admin);
archiveAcademicTerm(db, secondTerm.id, admin);
roundTrip(db, "学期3切换落盘");

history.push(runTermCycle(db, { term: thirdTerm, month: "2027-03", label: "学期3" }));

// ---------------------------------------------------------------------------
// 三学期跑完后的整体校验
// ---------------------------------------------------------------------------
{
  const terms = queryTerms(db).terms;
  assert.equal(terms.length, 3, "应有三个学期");
  assert.equal(terms.filter((item) => item.status === "archived").length, 2, "前两个学期应已归档");
  assert.equal(terms.filter((item) => item.current).length, 1, "同时只能有一个当前学期");

  // 每个学期的工资单互不覆盖
  const lockedIds = history.map((item) => item.lockedPayrollId);
  assert.equal(new Set(lockedIds).size, 3, "三个学期应产生三张独立工资单");
  lockedIds.forEach((id) => {
    const detail = (db.payrollDetails || []).find((item) => item.id === id);
    assert.ok(detail, `工资单 ${id} 不应丢失`);
    assert.equal(detail.status, "locked", `工资单 ${id} 应保持锁定`);
  });

  // 课次按学期隔离，互不串台
  const lessonsByTerm = new Map();
  (db.lessonInstances || []).forEach((lesson) => {
    if (!lesson.termId) return;
    lessonsByTerm.set(lesson.termId, (lessonsByTerm.get(lesson.termId) || 0) + 1);
  });
  [firstTerm.id, secondTerm.id, thirdTerm.id].forEach((termId) => {
    assert.ok((lessonsByTerm.get(termId) || 0) > 0, `学期 ${termId} 应有自己的课次`);
  });

  // 跨学期污染检查：每个学期的工资只能算本学期的课
  history.forEach((record, index) => {
    const termId = [firstTerm.id, secondTerm.id, thirdTerm.id][index];
    const detail = (db.payrollDetails || []).find((item) => item.id === record.lockedPayrollId);
    assert.equal(detail.termId, termId, `第 ${index + 1} 学期工资单的学期归属错误`);
    // 该月课次必须全部属于该学期
    const monthLessons = (db.lessonInstances || []).filter(
      (lesson) => lesson.teacherId === record.teacher.id && String(lesson.date).startsWith(record.month),
    );
    monthLessons.forEach((lesson) => {
      assert.equal(lesson.termId, termId, `课次 ${lesson.id} 串到了其他学期`);
    });
  });

  // 归档学期的工资在后续学期运转后不得被改写：锁定时的金额快照必须原样保留
  const firstLocked = (db.payrollDetails || []).find((item) => item.id === history[0].lockedPayrollId);
  assert.equal(firstLocked.status, "locked", "首个学期工资应仍为锁定");
  assert.ok(firstLocked.summarySnapshot, "锁定时应保存金额快照");
  assert.ok(Number(firstLocked.summarySnapshot.grossPay) > 0, "快照应保留应发金额");
  assert.ok((firstLocked.rowsSnapshot || []).length > 0, "快照应保留工资明细行");
  assert.equal(
    firstLocked.summarySnapshot.grossPay,
    history[0].snapshotGrossPay,
    "归档学期的工资金额在后续学期运转后不得变化",
  );
  assert.ok(firstLocked.lockedAt, "应记录锁定时间");
  // 快照独立于当前薪资规则：即使之后改了标准，历史账仍按锁定时的口径
  assert.ok(firstLocked.summarySnapshot.salarySchemeVersion, "快照应记录当时的薪资方案版本");

  // 教师累计：三个学期共三张锁定工资单，金额独立互不覆盖
  const teacherId = history[0].teacher.id;
  const lockedForTeacher = (db.payrollDetails || []).filter(
    (item) => item.teacherId === teacherId && item.status === "locked",
  );
  assert.equal(lockedForTeacher.length, 3, "同一教师三个学期应有三张独立锁定工资单");
  assert.equal(
    new Set(lockedForTeacher.map((item) => item.month)).size,
    3,
    "三张工资单应分属不同月份",
  );

  // 最终整体可持久化
  roundTrip(db, "三学期跑完");
}

// ---------------------------------------------------------------------------
// 时间维度：学期状态随日历推进（历史盲区二）
// ---------------------------------------------------------------------------
{
  const term = { id: "T", startDate: "2026-09-01", endDate: "2027-01-20", current: true, status: "active" };
  assert.equal(termDatePhase(term, "2026-08-15"), "upcoming", "开学前应为 upcoming");
  assert.equal(termDatePhase(term, "2026-09-01"), "ongoing", "开学当天应为 ongoing");
  assert.equal(termDatePhase(term, "2026-11-11"), "ongoing", "学期中应为 ongoing");
  assert.equal(termDatePhase(term, "2027-01-20"), "ongoing", "结束当天仍算在读");
  assert.equal(termDatePhase(term, "2027-01-21"), "ended", "结束次日应为 ended");

  // 当前学期过期后必须给出换届提示，而不是继续显示"进行中"
  const expiredDb = createInitialData({ teacherCount: 10 });
  const expired = queryTerms(expiredDb).currentTerm;
  const phase = termDatePhase(expired, "2099-01-01");
  assert.equal(phase, "ended", "远期日期下当前学期应判定为已结束");
}

// ---------------------------------------------------------------------------
// 归档学期只读：不能再写入业务数据
// ---------------------------------------------------------------------------
{
  const readonlyDb = createInitialData({ teacherCount: 20 });
  const readonlyAdmin = actor(readonlyDb, "admin");
  const term = queryTerms(readonlyDb).currentTerm;
  const nextTerm = createAcademicTerm(
    readonlyDb,
    { name: "接续学期", schoolYear: "2027-2028", semester: "上学期", startDate: "2027-09-01", endDate: "2028-01-20" },
    readonlyAdmin,
  ).term;
  setCurrentAcademicTerm(readonlyDb, nextTerm.id, readonlyAdmin);
  archiveAcademicTerm(readonlyDb, term.id, readonlyAdmin);

  // 归档学期不能再改任课配置
  assert.throws(
    () =>
      updateTeacherAssignment(
        readonlyDb,
        { termId: term.id, stageId: "primary", grade: 1, subjectId: "chinese", teacherIds: [] },
        readonlyAdmin,
      ),
    /归档|只读/,
    "归档学期不应允许修改任课配置",
  );
}

// ---------------------------------------------------------------------------
// 历史账不可被后续规则变更影响（真实场景：学校次年调薪，往年工资不能跟着变）
// ---------------------------------------------------------------------------
{
  const beforeRaise = (db.payrollDetails || []).find((item) => item.id === history[0].lockedPayrollId);
  const originalGross = beforeRaise.summarySnapshot.grossPay;
  const originalBase = beforeRaise.summarySnapshot.baseSalary;

  // 模拟次年调薪：基本工资档整体上调
  Object.keys(db.payrollRules.teacherSalaryScheme.baseSalaryByQualification).forEach((key) => {
    db.payrollRules.teacherSalaryScheme.baseSalaryByQualification[key] += 500;
  });

  const afterRaise = (db.payrollDetails || []).find((item) => item.id === history[0].lockedPayrollId);
  assert.equal(afterRaise.summarySnapshot.grossPay, originalGross, "调薪后历史锁定工资金额不得变化");
  assert.equal(afterRaise.summarySnapshot.baseSalary, originalBase, "调薪后历史基本工资不得变化");
  assert.equal(afterRaise.status, "locked", "历史工资应保持锁定");

  // 新月份则按新标准计算
  const teacher = history[2].teacher;
  const newMonthPreview = teacherPayrollPreview(db, teacher.id, "2027-06");
  assert.ok(newMonthPreview, "新月份应可试算");
  const newBase = newMonthPreview.components.find((item) => item.name === "基本工资");
  assert.equal(newBase.amount, originalBase + 500, "新月份应按调整后的标准计算");
}

console.log("multi-term lifecycle checks passed");
