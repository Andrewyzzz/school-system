import assert from "node:assert/strict";
import {
  createInitialData,
  queryTeacherLessonRecords,
  teacherLessonsForWeek,
  teacherPayrollPreview,
  updateTeacherAssignment,
} from "../server/storage.js";
import {
  buildSchedulingConfig,
  generateScheduleDraft,
  publishScheduleDraft,
  updateSchedulePeriods,
} from "../server/scheduling.js";
import { buildScheduleGrid, buildScheduleExcel } from "../server/scheduleExport.js";

function actor(db, username) {
  const account = db.accounts.find((item) => item.username === username);
  assert.ok(account, `missing account ${username}`);
  return account;
}

function configureClassTeachers(db, admin) {
  const config = buildSchedulingConfig(db, { divisionId: "elementary", gradeId: "elementary-g1" });
  config.subjects.forEach((subject) => {
    const teachers = db.teachers.filter(
      (teacher) =>
        teacher.status === "active" && teacher.stageId === "primary" && teacher.primarySubjectId === subject.id,
    );
    assert.ok(teachers.length, `小学部应有 ${subject.name} 任课老师`);
    const classTeacherIds = Object.fromEntries(
      config.classes.map((schoolClass, index) => [schoolClass.id, [teachers[index % teachers.length].id]]),
    );
    updateTeacherAssignment(db, { stageId: "primary", grade: 1, subjectId: subject.id, classTeacherIds }, admin);
  });
}

const db = createInitialData({ teacherCount: 1000 });
const admin = actor(db, "admin");
configureClassTeachers(db, admin);

const before = buildSchedulingConfig(db, { divisionId: "elementary", gradeId: "elementary-g1" });
const responsibleTeacher = before.nonRegularTeachers[0];
assert.ok(responsibleTeacher, "应能选择当前学部老师作为非正课负责人");
const lifeTeacher = db.teachers.find(
  (teacher) => teacher.stageId === "primary" && teacher.salaryProfile?.salaryCategory === "lifeTeacher",
);
assert.ok(lifeTeacher, "小学部应有生活老师，可接收周日固定日程");
assert.ok(before.nonRegularTeachers.some((teacher) => teacher.id === lifeTeacher.id), "固定日程负责人应可选择生活老师");

const periods = [
  ...before.periods.map((period) =>
    Number(period.period) === 3
      ? {
          ...period,
          type: "selfStudy",
          content: "午间阅读",
          responsibleTeacherId: responsibleTeacher.id,
          dayIndexes: [0, 1, 2, 3, 4],
        }
      : period,
  ),
  {
    period: before.periods.length + 1,
    label: "周日返校",
    startTime: before.periods[0].startTime,
    endTime: before.periods[0].endTime,
    type: "activity",
    content: "周日返校接待",
    responsibleTeacherId: lifeTeacher.id,
    dayIndexes: [6],
  },
];
const updated = updateSchedulePeriods(db, { stageId: "primary", grade: 1, periods }, admin);
const selfStudy = updated.config.periods.find((period) => period.type === "selfStudy");
assert.equal(selfStudy?.content, "午间阅读", "固定内容应保存到作息模板");
assert.equal(selfStudy?.responsibleTeacherId, responsibleTeacher.id, "负责人应保存到作息模板");
assert.equal(selfStudy?.responsibleTeacherName, responsibleTeacher.name, "配置返回时应带负责人姓名");
const sundayDuty = updated.config.periods.find((period) => period.content === "周日返校接待");
assert.deepEqual(sundayDuty?.dayIndexes, [6], "周日固定日程应保存周日生效范围");

const result = generateScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin);
assert.equal(result.draft.conflicts.length, 0, "正课草稿应无冲突");
assert.equal(result.draft.unassignedCount, 0, "正课草稿应排满");
assert.ok(
  result.draft.assignments.every(
    (assignment) => result.config.periods.find((period) => Number(period.period) === Number(assignment.period))?.type === "regular",
  ),
  "自动排课只能使用正课节次",
);

const published = publishScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin);
const nonRegular = published.lessons.filter((lesson) => lesson.nonRegular);
assert.equal(nonRegular.length, 6, "工作日固定时段发布五次，周日固定日程单独发布一次");
assert.ok(
  nonRegular.filter((lesson) => lesson.type === "selfStudy").every(
    (lesson) =>
      lesson.source === "backend-nonregular" &&
      lesson.type === "selfStudy" &&
      lesson.subjectName === "午间阅读" &&
      lesson.teacherId === responsibleTeacher.id &&
      lesson.nonPayable &&
      lesson.scheduleImpact === false,
  ),
  "非正课应作为固定、非计薪且不占用资源的课表事件发布",
);
const publishedSundayDuty = nonRegular.find((lesson) => lesson.subjectName === "周日返校接待");
assert.ok(publishedSundayDuty, "发布结果应包含周日固定日程");
assert.equal(new Date(`${publishedSundayDuty.date}T12:00:00`).getDay(), 0, "周日固定日程应落在该自然周周日");
assert.equal(publishedSundayDuty.teacherId, lifeTeacher.id, "周日固定日程应发送给所选生活老师");
assert.equal(publishedSundayDuty.units, 0, "周日固定日程不产生课时");
assert.equal(publishedSundayDuty.nonPayable, true, "周日固定日程不计薪");
const lifeTeacherTerminal = teacherLessonsForWeek(db, lifeTeacher.id, published.config.weekStart);
assert.ok(
  lifeTeacherTerminal.some((lesson) => lesson.id === publishedSundayDuty.id),
  "生活老师终端应能读取教务发布的周日固定日程",
);

const klass = published.config.classes[0];
const grid = buildScheduleGrid(db, {
  termId: published.config.termId,
  dimension: "class",
  targetId: klass.id,
  weekStart: published.config.weekStart,
});
const gridEntries = grid.cells.flat().flat();
const displayed = gridEntries.filter((entry) => entry.nonRegular);
assert.equal(displayed.length, 6, "每个班的最终课表都应显示工作日与周日固定日程");
assert.ok(
  displayed.filter((entry) => entry.type === "selfStudy").every(
    (entry) => entry.type === "selfStudy" && entry.typeName === "自习" && entry.subjectName === "午间阅读",
  ),
  "最终课表应给非正课独立类型标记与内容",
);
assert.match(buildScheduleExcel(grid), /【自习】午间阅读/, "导出的课表应保留非正课类型和内容");
assert.match(buildScheduleExcel(grid), /周日返校接待/, "导出的七天课表应保留周日固定日程");

const payroll = teacherPayrollPreview(db, responsibleTeacher.id, published.config.weekStart.slice(0, 7));
assert.ok(
  payroll.lines.every((line) => !String(line.lessonId || "").startsWith("NONREG-")),
  "非正课负责人不应获得额外课时工资",
);
const records = queryTeacherLessonRecords(db, responsibleTeacher.id, published.config.weekStart.slice(0, 7));
assert.ok(
  records.records.every((record) => !String(record.lessonId || "").startsWith("NONREG-")),
  "非正课不应进入教师课时核对记录",
);

// 周日日程可以按岗位分发：各班班主任收到本班任务，所有生活老师收到年级公共生活任务。
const gradeClasses = db.classes.filter(
  (schoolClass) => schoolClass.stageId === "primary" && Number(schoolClass.grade) === 1 && schoolClass.active !== false,
);
const alternateHomeroom = db.teachers.find(
  (teacher) => teacher.stageId === "primary" && teacher.status === "active" && teacher.id !== responsibleTeacher.id,
);
assert.ok(alternateHomeroom, "岗位日程测试需要另一位小学部老师");
gradeClasses.forEach((schoolClass, index) => {
  const teacher = index === 0 ? responsibleTeacher : alternateHomeroom;
  schoolClass.homeroomTeacherId = teacher.id;
  schoolClass.homeroomTeacherName = teacher.name;
});
const secondLifeTeacher = {
  ...lifeTeacher,
  id: `${lifeTeacher.id}-SECOND`,
  employeeNo: `${lifeTeacher.employeeNo}-SECOND`,
  name: `${lifeTeacher.name}二`,
};
db.teachers.push(secondLifeTeacher);

const rolePeriods = [
  ...before.periods,
  {
    period: before.periods.length + 1,
    label: "周日返校",
    startTime: "14:00",
    endTime: "15:30",
    type: "activity",
    content: "学生返校进班",
    responsibleRole: "homeroom",
    dayIndexes: [6],
  },
  {
    period: before.periods.length + 2,
    label: "晚间生活",
    startTime: "20:20",
    endTime: "21:20",
    type: "activity",
    content: "夜宵/冲凉/晚间活动",
    responsibleRole: "life_teacher",
    dayIndexes: [6],
  },
];
const roleUpdated = updateSchedulePeriods(db, { stageId: "primary", grade: 1, periods: rolePeriods }, admin);
assert.equal(
  roleUpdated.config.periods.find((period) => period.content === "学生返校进班")?.responsibleTeacherName,
  "各班班主任",
  "岗位日程应向前端显示班主任责任口径",
);
generateScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin);
const rolePublished = publishScheduleDraft(db, { divisionId: "elementary", gradeId: "elementary-g1" }, admin);
const homeroomDuties = rolePublished.lessons.filter((lesson) => lesson.responsibleRole === "homeroom");
assert.equal(homeroomDuties.length, gradeClasses.length, "班主任日程应按班级分别生成");
assert.ok(
  homeroomDuties.every((lesson) => lesson.classId && lesson.teacherId),
  "每条班主任日程都应绑定具体班级和该班班主任",
);
const lifeDuty = rolePublished.lessons.find((lesson) => lesson.responsibleRole === "life_teacher");
assert.deepEqual(
  new Set(lifeDuty?.responsibleTeacherIds || []),
  new Set([lifeTeacher.id, secondLifeTeacher.id]),
  "生活环节应同步给本学部全部生活老师",
);
assert.ok(
  teacherLessonsForWeek(db, secondLifeTeacher.id, rolePublished.config.weekStart).some((lesson) => lesson.id === lifeDuty.id),
  "每位生活老师都应能在终端看到公共周日日程",
);
const firstClassRoleGrid = buildScheduleGrid(db, {
  termId: rolePublished.config.termId,
  dimension: "class",
  targetId: gradeClasses[0].id,
  weekStart: rolePublished.config.weekStart,
});
const firstClassRoleDuties = firstClassRoleGrid.cells.flat().flat().filter((entry) => entry.nonRegular);
assert.equal(firstClassRoleDuties.length, 2, "班级课表只显示本班班主任任务和年级公共生活任务，不应串入其他班级");

console.log("nonregular-periods tests passed");
