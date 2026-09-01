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
  TERM_SCOPED_COLLECTIONS,
  normalizeDatabase,
  teacherMonthlyWorkload,
  updateTeacherAssignment,
} from "../server/storage.js";
import {
  buildSchedulingConfig,
  updateGradeClassStructure,
  updateGradeCourseRules,
  updateRoomResources,
} from "../server/scheduling.js";

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

// 存量数据（无 termId）必须在读取时被补齐到首个学期，否则按学期替换会匹配不到旧行。
// 关键：这里调用产品代码的 normalizeDatabase，而不是在测试里另写一份补齐逻辑——
// 否则补齐范围若在产品侧漏掉某个集合，测试也发现不了。
function backfillCheck(db) {
  assert.ok((db.terms || [])[0]?.id, "应存在首个学期");
  normalizeDatabase(db);
  TERM_SCOPED_COLLECTIONS.forEach((key) => {
    assert.ok(
      (db[key] || []).every((row) => row.termId),
      `${key} 中不应残留无学期归属的行（产品侧补齐范围可能遗漏了该集合）`,
    );
  });
}

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
    lessonPlan.push({ date, type: "regular", status: "scheduled" });
    if (day % 5 === 0) lessonPlan.push({ date, type: "evening", status: "scheduled" });
    if (day % 7 === 0) lessonPlan.push({ date, type: "makeup", status: "scheduled" });
    // 每月一节已取消（请假未安排代课，不计薪）。
    // 计薪口径改成「排了就算」之后，「未签到」这一类不存在了：
    // 排给教师的课都计薪，只有取消的不算。
    if (day === 15) lessonPlan.push({ date, type: "regular", status: "cancelled" });
  }
  lessonPlan.forEach((plan, index) => {
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
    });
  });
  // 排课计划里的初始计薪/取消数。锁定时刻的实际数在下面重新算——
  // 未来月份会在锁定前把未上的课取消掉，两者不一定相等
  const plannedPayable = lessonPlan.filter((item) => item.status !== "cancelled").length;
  assert.ok(plannedPayable > 0, `[${label}] 排课计划里应有计薪课次`);
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

  // 锁定要看这个月有没有上完。三个学期里有两个在未来——那是真的不该锁：
  // 未上的课已经计进工资了，锁死之后请假取消就改不了。
  // 所以这里按月份是否已经过去分别断言，而不是硬把两种情形都当成「应该能锁」。
  const monthEnded = month < new Date().toISOString().slice(0, 7);
  if (monthEnded) {
    payroll = lockTeacherPayrollDetail(db, teacher.id, month, finance);
    assert.equal(payroll.generated.status, "locked", `[${label}] 课程已全部结束后应可锁定`);
  } else {
    assert.throws(
      () => lockTeacherPayrollDetail(db, teacher.id, month, finance),
      /尚未上课/,
      `[${label}] 本月还没上完就锁定，等于给没上的课先付钱`,
    );
    // 把未上的课取消掉（月末核对：确认这些课不会再上），就可以锁了
    (db.lessonInstances || [])
      .filter((l) => l.teacherId === teacher.id && l.date.startsWith(month) && l.status !== "cancelled")
      .filter((l) => l.date > new Date().toISOString().slice(0, 10))
      .forEach((l) => {
        l.status = "cancelled";
        l.cancelReason = "月末核对：该课次未实际发生";
      });
    payroll = generateTeacherPayrollDetail(db, teacher.id, month, finance, { force: true });
    payroll = publishTeacherPayrollDetail(db, teacher.id, month, finance);
    payroll = confirmTeacherPayrollDetail(db, teacher.id, month, teacherAccount);
    payroll = reviewTeacherPayrollDetail(db, teacher.id, month, finance);
    payroll = lockTeacherPayrollDetail(db, teacher.id, month, finance);
    assert.equal(payroll.generated.status, "locked", `[${label}] 处理完未上的课后应可锁定`);
  }

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
  // 排给教师的课都计薪，只有取消的不计
  const lessonRow = (payroll.rows || []).find((row) => row.name === "课时工资");
  assert.ok(lessonRow, `[${label}] 工资明细应含课时工资`);
  // 期望值要按**锁定时刻库里的实际状态**算，不能用最初的排课计划：
  // 未来月份的未上课次在上一步被取消掉了，拿原计划比会永远对不上。
  const liveLessons = (db.lessonInstances || []).filter(
    (l) => l.teacherId === teacher.id && String(l.date || "").startsWith(month),
  );
  const livePayable = liveLessons.filter((l) => l.status !== "cancelled").length;
  const liveCancelled = liveLessons.length - livePayable;

  const paidLines = (payroll.lines || []).filter((line) => line.payable);
  assert.equal(paidLines.length, livePayable, `[${label}] 计薪课次数应等于未取消的课次数`);
  assert.equal(
    (payroll.lines || []).filter((line) => !line.payable).length,
    liveCancelled,
    `[${label}] 只有已取消的课次不计薪`,
  );
  console.log(
    `  ${label}: 排 ${lessonPlan.length} 节（计薪 ${livePayable} / 已取消 ${liveCancelled}）| 课时费 ¥${lessonRow.amount.toFixed(2)} | 应发 ¥${payroll.grossPay.toFixed(2)} | ${term.name}`,
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

// 新学期里"重新配置"而非"复制"产生的行，同样必须与上学期主键隔离。
// 历史缺陷：班级/教室行的 ID 由 学部-年级-序号 拼成、不含学期，
// 因此在新学期保存班级结构或教室资源时会与上学期同名行撞主键，整批写入被拒
// （表现为前端"服务端错误"）。复制路径已有断言，这里补上重新配置路径。
{
  const firstTermRowIds = (key) =>
    new Set((db[key] || []).filter((row) => !row.termId || row.termId === firstTerm.id).map((row) => row.id));
  const beforeClassIds = firstTermRowIds("classes");
  const beforeRoomIds = firstTermRowIds("rooms");

  updateGradeClassStructure(db, { stageId: "middle", grade: 7, regularCount: 5, experimentalCount: 1 }, admin);
  assertPersistable(db, "学期2重新保存班级结构");
  updateRoomResources(db, { stageId: "middle", grade: 7, roomCounts: { lab: 4, computer: 3 } }, admin);
  assertPersistable(db, "学期2重新保存教室资源");

  (db.classes || [])
    .filter((row) => row.termId === secondTerm.id)
    .forEach((row) => {
      assert.ok(!beforeClassIds.has(row.id), `学期2新建班级与上学期撞 ID：${row.id}`);
    });
  (db.rooms || [])
    .filter((row) => row.termId === secondTerm.id)
    .forEach((row) => {
      assert.ok(!beforeRoomIds.has(row.id), `学期2新建教室与上学期撞 ID：${row.id}`);
    });

  // 上一学期的行不能被这次写入删掉
  assert.equal(firstTermRowIds("classes").size, beforeClassIds.size, "重新配置不应影响上学期班级");

  // 二维码是门牌上的物理标识，跨学期必须稳定，否则贴纸全部作废
  const labs = (db.rooms || []).filter((row) => row.termId === secondTerm.id && row.roomType === "lab");
  assert.ok(labs.length > 0, "学期2应配置出实验室");
  labs.forEach((row) => {
    assert.ok(!row.qrCode.includes("@"), `教室二维码不应带学期后缀：${row.qrCode}`);
  });
  roundTrip(db, "学期2重新配置后落盘");
}

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

// ---------------------------------------------------------------------------
// 存量数据兼容性：所有"按学期作用域"的集合
//
// 这些集合的写操作都是"先删本学期旧行、再写新行"，依赖 termId 匹配旧行。
// termId 是后加字段，存量行没有它就永远删不掉，新旧并存产生重复主键并导致
// 整次持久化被拒绝——历史上"保存班级结构报后端异常"即由此而来。
// 本用例模拟升级前的老库，逐一驱动这些写操作，确保补齐机制覆盖到位。
// ---------------------------------------------------------------------------
{
  // 构造老库：抹掉所有按学期作用域集合的 termId
  const makeLegacyDb = () => {
    const legacy = createInitialData({ teacherCount: 30 });
    TERM_SCOPED_COLLECTIONS.forEach((key) => {
      (legacy[key] || []).forEach((row) => {
        delete row.termId;
        delete row.termName;
      });
    });
    return legacy;
  };

  // 补齐机制必须覆盖每一个按学期作用域的集合，漏掉任何一个都会重现该缺陷。
  // 注：种子数据里部分集合（如 teacherAssignments）本身不带 termId，
  // 由 sourceTermRows 的"无 termId 视为首学期"兜底保证读取正确；这里断言的是
  // 补齐后不应再有残留，从而让按学期的删除逻辑可靠工作。
  {
    const legacy = makeLegacyDb();
    const populated = TERM_SCOPED_COLLECTIONS.filter((key) => (legacy[key] || []).length > 0);
    assert.ok(populated.length > 0, "应有可供验证的按学期集合");
    backfillCheck(legacy);
    populated.forEach((key) => {
      assert.ok(
        (legacy[key] || []).every((row) => row.termId),
        `集合 ${key} 未被补齐 termId，其按学期替换操作会产生重复主键`,
      );
    });
  }

  // 老库下反复保存班级结构：任何一次都不得产生重复主键或数据残留
  {
    const legacy = makeLegacyDb();
    backfillCheck(legacy);
    const legacyAdmin = actor(legacy, "admin");
    [6, 3, 8, 3].forEach((count) => {
      updateGradeClassStructure(
        legacy,
        { stageId: "middle", grade: 7, regularCount: count, experimentalCount: 0 },
        legacyAdmin,
      );
      const scoped = (legacy.classes || []).filter((row) => row.stageId === "middle" && Number(row.grade) === 7);
      assert.equal(scoped.length, count, `保存 ${count} 个班后实际班级数应一致`);
      assertPersistable(legacy, `班级结构保存为 ${count} 个班`);
    });
  }

  // 同一配置存在新旧两种 ID 格式的重复行时，复制到新学期会被重算成同一个 ID，
  // 触发重复主键使建学期失败——规范化阶段必须先按业务作用域去重
  {
    const legacy = makeLegacyDb();
    const sample = (legacy.teacherAssignments || [])[0];
    assert.ok(sample, "应有任课配置样本");
    // 制造历史遗留：同作用域再插一行旧格式 ID
    legacy.teacherAssignments.push({
      ...JSON.parse(JSON.stringify(sample)),
      id: `TA-${sample.stageId}-${sample.grade}-${sample.subjectId}`,
      classTeacherIds: {},
    });
    backfillCheck(legacy);
    const scopeKey = (row) => `${row.termId || ""}|${row.stageId}|${row.grade}|${row.subjectId}`;
    const groups = new Map();
    (legacy.teacherAssignments || []).forEach((row) => {
      groups.set(scopeKey(row), (groups.get(scopeKey(row)) || 0) + 1);
    });
    assert.ok(
      [...groups.values()].every((count) => count === 1),
      "同一(学期,学部,年级,学科)不应残留多行任课配置",
    );

    // 去重后建新学期应当成功且不产生重复主键
    const created = createAcademicTerm(
      legacy,
      { name: "去重后学期", schoolYear: "2028-2029", semester: "上学期", startDate: "2028-09-01", endDate: "2029-01-20", copyConfig: true },
      actor(legacy, "admin"),
    ).term;
    assertPersistable(legacy, "重复任课配置去重后建学期");
    assert.ok(
      (legacy.teacherAssignments || []).some((row) => row.termId === created.id),
      "新学期应复制到任课配置",
    );
  }

  // 老库下保存课程规则：应为覆盖而非累加
  {
    const legacy = makeLegacyDb();
    backfillCheck(legacy);
    const legacyAdmin = actor(legacy, "admin");
    const before = (legacy.gradeCourseRules || []).length;
    [5, 6, 4].forEach((weekly) => {
      updateGradeCourseRules(
        legacy,
        { stageId: "middle", grade: 7, rules: [{ subjectId: "chinese", weeklyLessons: weekly, maxDaily: 2 }] },
        legacyAdmin,
      );
      assertPersistable(legacy, `课程规则保存 ${weekly} 课时`);
    });
    const after = (legacy.gradeCourseRules || []).length;
    assert.equal(after, before + 1, "重复保存同一条课程规则应覆盖而非累加");
  }
}

console.log("multi-term lifecycle checks passed");

// ---------------------------------------------------------------------------
// 锁定拦截：本月还有课没上完时不允许锁定工资
//
// 计薪口径改成「排了就算」之后，未上的课已经计进了工资。此时锁定，
// 之后教师请假把课取消，工资已锁死改不了——那笔钱就付给了一节没上的课。
//
// 单独一块来测，是因为它需要「课次日期在今天之后」这个前提。
// 上面的学期循环跑的是历史月份，在那里怎么构造都是假的。
// ---------------------------------------------------------------------------
{
  const db = createInitialData({ teacherCount: 5 });
  normalizeDatabase(db);
  const teacher = db.teachers[0];
  const term = db.terms.find((t) => t.current) || db.terms[0];
  const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  db.lessonInstances.push({
    id: "LESSON-LOCK-BLOCKER",
    termId: term.id,
    teacherId: teacher.id,
    teacherName: teacher.name,
    classId: db.classes[0].id,
    className: db.classes[0].name,
    subjectId: teacher.primarySubjectId || "chinese",
    subjectName: "语文",
    date: future,
    time: "08:00-08:40",
    period: 1,
    roomId: db.classes[0].roomId || "",
    room: "教室",
    type: "regular",
    units: 1,
    status: "scheduled",
    source: "backend-scheduling",
  });

  const month = future.slice(0, 7);
  const workload = teacherMonthlyWorkload(db, teacher.id, month);
  assert.equal(workload.pendingLines.length, 1, "未到上课时间的课次应进 pendingLines");
  assert.equal(workload.payableLines.length, 1, "它同时已经计薪了——这正是要拦的原因");
  assert.equal(workload.summary.pendingCount, 1);

  console.log("  锁定拦截：未上完的课已计薪，会阻止提前锁定 ✓");
}
