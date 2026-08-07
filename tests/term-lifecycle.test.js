import assert from "node:assert/strict";
import {
  archiveAcademicTerm,
  confirmMonthlyWorkload,
  createAcademicTerm,
  createInitialData,
  generateTeacherPayrollDetail,
  queryTerms,
  termDatePhase,
  setCurrentAcademicTerm,
  teacherLessonsForWeek,
  teacherMonthlyWorkload,
  updateTeacherAssignment,
} from "../server/storage.js";
import {
  buildSchedulingConfig,
  generateScheduleDraft,
  publishScheduleDraft,
} from "../server/scheduling.js";
import { submitTeacherAttendance } from "../server/attendance.js";

// 学期生命周期验收：真实运转是“一个学期接一个学期”，
// 新旧学期的课表、签到、工作量、工资必须完全隔离，归档学期必须只读。

function actor(db, username) {
  const account = db.accounts.find((item) => item.username === username);
  assert.ok(account, `missing account ${username}`);
  return account;
}

function configureClassTeachers(db, { stageId, grade, termId = "" }, actorAccount) {
  const divisionId = stageId === "primary" ? "elementary" : stageId;
  const gradeId = stageId === "primary" ? `elementary-g${grade}` : `${stageId}-g${grade}`;
  const activeClasses = buildSchedulingConfig(db, { termId, divisionId, gradeId }).classes;
  db.subjects.forEach((subject) => {
    const teachers = db.teachers.filter(
      (item) => item.status === "active" && item.stageId === stageId && item.primarySubjectId === subject.id,
    );
    if (!teachers.length) return;
    const classTeacherIds = Object.fromEntries(
      activeClasses.map((schoolClass, index) => [schoolClass.id, [teachers[index % teachers.length].id]]),
    );
    updateTeacherAssignment(db, { termId, stageId, grade, subjectId: subject.id, classTeacherIds }, actorAccount);
  });
}

const db = createInitialData({ teacherCount: 1000 });
const admin = actor(db, "admin");
const scope = { divisionId: "elementary", gradeId: "elementary-g1" };
const OLD_TERM_ID = "TERM-2026-PHASE1";

// 1. 旧学期（当前学期）完成一轮排课发布
configureClassTeachers(db, { stageId: "primary", grade: 1 }, admin);
generateScheduleDraft(db, scope, admin);
publishScheduleDraft(db, scope, admin);
const oldTermLessons = db.lessonInstances.filter(
  (lesson) => lesson.source === "backend-scheduling" && lesson.termId === OLD_TERM_ID,
);
assert.ok(oldTermLessons.length > 0, "旧学期应有已发布课节");
assert.ok(
  oldTermLessons.every((lesson) => lesson.termId === OLD_TERM_ID),
  "旧学期课节必须全部带旧学期 termId",
);

// 2. 新建下学期（复制配置）、设为当前学期
const nextTermResult = createAcademicTerm(
  db,
  {
    name: "2026-2027 学年上学期",
    schoolYear: "2026-2027",
    semester: "上学期",
    startDate: "2026-09-01",
    endDate: "2027-01-20",
    copyConfig: true,
  },
  admin,
);
const nextTerm = nextTermResult.term;
setCurrentAcademicTerm(db, nextTerm.id, admin);

// 复制的任课配置应立即可用：新学期直接排课发布
const nextConfig = buildSchedulingConfig(db, { termId: nextTerm.id, ...scope });
assert.equal(nextConfig.termId, nextTerm.id);
assert.ok(
  nextConfig.subjects.every((subject) =>
    nextConfig.classes.every((schoolClass) => (subject.classTeacherIds?.[schoolClass.id] || []).length > 0),
  ),
  "新学期应复制旧学期任课配置",
);
generateScheduleDraft(db, { termId: nextTerm.id, ...scope }, admin);
publishScheduleDraft(db, { termId: nextTerm.id, ...scope }, admin);

const nextTermLessons = db.lessonInstances.filter(
  (lesson) => lesson.source === "backend-scheduling" && lesson.termId === nextTerm.id,
);
assert.ok(nextTermLessons.length > 0, "新学期应有已发布课节");

// 3. 两个学期的课表在老师端按学期隔离，不混线
const sampleTeacherId = oldTermLessons[0].teacherId;
const oldWeekStart = "2026-06-15";
const nextWeekStart = nextTermLessons[0] ? nextTermLessons[0].date : "2026-09-07";
const oldWeekLessons = teacherLessonsForWeek(db, sampleTeacherId, oldWeekStart, { termId: OLD_TERM_ID });
assert.ok(
  oldWeekLessons.every((lesson) => lesson.termId === OLD_TERM_ID),
  "旧学期周课表不应出现新学期课节",
);
const crossTermLeak = teacherLessonsForWeek(db, sampleTeacherId, oldWeekStart, { termId: nextTerm.id }).filter(
  (lesson) => lesson.termId === OLD_TERM_ID,
);
assert.equal(crossTermLeak.length, 0, "查询新学期时不应返回旧学期课节");

// 4. 月度工作量按月份归属到正确学期
const juneWorkload = teacherMonthlyWorkload(db, sampleTeacherId, "2026-06");
assert.equal(juneWorkload.termId, OLD_TERM_ID, "2026-06 工作量应归属旧学期");

// 5. 归档旧学期后全部写路径只读
archiveAcademicTerm(db, OLD_TERM_ID, admin);

assert.throws(
  () => generateScheduleDraft(db, { termId: OLD_TERM_ID, ...scope }, admin),
  /已归档/,
  "归档学期不能再生成排课",
);

const teacherAccount = db.accounts.find((account) => account.teacherId === sampleTeacherId);
const archivedLesson = oldTermLessons.find((lesson) => lesson.teacherId === sampleTeacherId);
assert.throws(
  () =>
    submitTeacherAttendance(
      db,
      { lessonId: archivedLesson.id, action: "checkIn", qrPayload: "{}" },
      teacherAccount,
    ),
  /已归档/,
  "归档学期的课次不能再签到",
);

assert.throws(
  () => confirmMonthlyWorkload(db, sampleTeacherId, "2026-06", teacherAccount),
  /已归档/,
  "归档学期的月度工作量不能再确认",
);
const finance = actor(db, "finance");
assert.throws(
  () => generateTeacherPayrollDetail(db, sampleTeacherId, "2026-06", finance),
  /已归档/,
  "归档学期的月份不能再生成工资",
);

// 6. 归档旧学期不影响新学期正常使用：签到走到业务校验而不是被“归档”拦截
const nextTermLesson = nextTermLessons.find((lesson) => lesson.teacherId === sampleTeacherId) || nextTermLessons[0];
const nextTermTeacherAccount = db.accounts.find((account) => account.teacherId === nextTermLesson.teacherId);
try {
  submitTeacherAttendance(
    db,
    { lessonId: nextTermLesson.id, action: "checkIn", qrPayload: "{}" },
    nextTermTeacherAccount,
  );
} catch (error) {
  assert.ok(
    !/已归档/.test(error.message),
    `新学期课次签到不应被归档拦截，实际错误：${error.message}`,
  );
}

console.log("term lifecycle checks passed");

// ---------------- 学期换届：跨学期主键隔离与到期提示（2026-08 修复）
{
  const rolloverDb = createInitialData({ teacherCount: 20 });
  const rolloverAdmin = rolloverDb.accounts.find((item) => item.username === "admin");
  const sourceTerm = queryTerms(rolloverDb).currentTerm;
  const sourceClassIds = new Set(
    (rolloverDb.classes || []).filter((item) => !item.termId || item.termId === sourceTerm.id).map((item) => item.id),
  );

  const created = createAcademicTerm(
    rolloverDb,
    {
      name: "下一学年上学期",
      schoolYear: "2027-2028",
      semester: "上学期",
      startDate: "2027-09-01",
      endDate: "2028-01-20",
      copyConfig: true,
    },
    rolloverAdmin,
  ).term;

  const copiedClasses = (rolloverDb.classes || []).filter((item) => item.termId === created.id);
  const copiedRooms = (rolloverDb.rooms || []).filter((item) => item.termId === created.id);
  assert.ok(copiedClasses.length > 0, "复制配置应生成新学期班级");
  assert.ok(copiedRooms.length > 0, "复制配置应生成新学期教室");

  // 关键：新学期的班级/教室 ID 不得与源学期重复，否则持久化会因主键冲突失败
  copiedClasses.forEach((item) => {
    assert.ok(!sourceClassIds.has(item.id), `班级 ID 与源学期冲突：${item.id}`);
  });
  const allClassIds = (rolloverDb.classes || []).map((item) => item.id);
  assert.equal(new Set(allClassIds).size, allClassIds.length, "班级 ID 全局唯一");
  const allRoomIds = (rolloverDb.rooms || []).map((item) => item.id);
  assert.equal(new Set(allRoomIds).size, allRoomIds.length, "教室 ID 全局唯一");

  // 引用完整性：班级默认教室、任课配置的按班指定都要指向新学期的实体
  const copiedRoomIds = new Set(copiedRooms.map((item) => item.id));
  copiedClasses.forEach((item) => {
    if (item.roomId) assert.ok(copiedRoomIds.has(item.roomId), `班级默认教室未重映射：${item.id}`);
  });
  const copiedClassIds = new Set(copiedClasses.map((item) => item.id));
  (rolloverDb.teacherAssignments || [])
    .filter((item) => item.termId === created.id && item.classTeacherIds)
    .forEach((item) => {
      Object.keys(item.classTeacherIds).forEach((classId) => {
        assert.ok(copiedClassIds.has(classId), `任课配置引用了非本学期班级：${classId}`);
      });
    });

  // 到期提示：已过结束日期的当前学期应被标记为需换届
  const endedTerm = { id: "T-ENDED", startDate: "2026-06-15", endDate: "2026-07-31", current: true, status: "active" };
  assert.equal(termDatePhase(endedTerm, "2026-08-07"), "ended", "已过结束日期应为 ended");
  assert.equal(termDatePhase(endedTerm, "2026-07-01"), "ongoing");
  assert.equal(termDatePhase(endedTerm, "2026-06-01"), "upcoming");

  const decorated = queryTerms(rolloverDb).terms.find((item) => item.id === created.id);
  assert.equal(decorated.datePhase, "upcoming", "未来学期应标记为 upcoming");
  assert.equal(decorated.needsRollover, false, "非当前学期不提示换届");
}

console.log("term rollover checks passed");
