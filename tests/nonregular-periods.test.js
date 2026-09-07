import assert from "node:assert/strict";
import {
  createInitialData,
  queryTeacherLessonRecords,
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

const periods = before.periods.map((period) =>
  Number(period.period) === 3
    ? {
        ...period,
        type: "selfStudy",
        content: "午间阅读",
        responsibleTeacherId: responsibleTeacher.id,
      }
    : period,
);
const updated = updateSchedulePeriods(db, { stageId: "primary", grade: 1, periods }, admin);
const selfStudy = updated.config.periods.find((period) => period.type === "selfStudy");
assert.equal(selfStudy?.content, "午间阅读", "固定内容应保存到作息模板");
assert.equal(selfStudy?.responsibleTeacherId, responsibleTeacher.id, "负责人应保存到作息模板");
assert.equal(selfStudy?.responsibleTeacherName, responsibleTeacher.name, "配置返回时应带负责人姓名");

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
assert.equal(nonRegular.length, 5, "一个固定非正课时段应按周一至周五各发布一次");
assert.ok(
  nonRegular.every(
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

const klass = published.config.classes[0];
const grid = buildScheduleGrid(db, {
  termId: published.config.termId,
  dimension: "class",
  targetId: klass.id,
  weekStart: published.config.weekStart,
});
const gridEntries = grid.cells.flat().flat();
const displayed = gridEntries.filter((entry) => entry.nonRegular);
assert.equal(displayed.length, 5, "每个班的最终课表都应显示本年级固定非正课时段");
assert.ok(
  displayed.every(
    (entry) => entry.type === "selfStudy" && entry.typeName === "自习" && entry.subjectName === "午间阅读",
  ),
  "最终课表应给非正课独立类型标记与内容",
);
assert.match(buildScheduleExcel(grid), /【自习】午间阅读/, "导出的课表应保留非正课类型和内容");

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

console.log("nonregular-periods tests passed");
