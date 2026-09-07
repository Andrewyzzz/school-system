import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  createInitialData,
  lifeTeacherDutyEventsForWeek,
  teacherLessonsForWeek,
  teacherScheduleWeeks,
} from "../server/storage.js";

const db = createInitialData({ teacherCount: 40 });
const lifeTeacher = db.teachers.find((teacher) => teacher.id === "T-LIFE-PRIMARY");
const regularTeacher = db.teachers.find((teacher) => teacher.id === "T0001");

assert.ok(lifeTeacher, "应有小学生活老师演示档案");

const duties = lifeTeacherDutyEventsForWeek(db, lifeTeacher.id, "2026-06-15");
assert.equal(duties.length, 10, "正式学期完整工作周应生成 5 天 × 早晚 2 班接送任务");
assert.deepEqual(
  duties.filter((item) => item.dutyType === "arrival").map((item) => item.time),
  Array(5).fill("06:50-08:20"),
  "早晨接送的时间应一致",
);
assert.deepEqual(
  duties.filter((item) => item.dutyType === "departure").map((item) => item.time),
  Array(5).fill("16:30-18:00"),
  "放学接送的时间应一致",
);
assert.ok(duties.every((item) => item.isLifeDuty && item.nonPayable && item.units === 0), "接送班次不得成为课时或工资数据");
assert.ok(duties.every((item) => item.className.includes("56 名学生")), "排班应展示人事档案维护的负责学生人数");

const publicSchedule = teacherLessonsForWeek(db, lifeTeacher.id, "2026-06-15");
assert.deepEqual(publicSchedule.map((item) => item.id), duties.map((item) => item.id), "老师端排班接口应返回生活老师接送任务");

const scheduleWeeks = teacherScheduleWeeks(db, lifeTeacher.id);
assert.ok(scheduleWeeks.length > 0, "生活老师正式学期内应有可选择的排班周");
assert.ok(scheduleWeeks.every((item) => item.lessonCount > 0 && item.isLifeDutySchedule), "排班周应是生活服务班次而非教学课次");

const regularSchedule = teacherLessonsForWeek(db, regularTeacher.id, "2026-06-15");
assert.ok(regularSchedule.every((item) => !item.isLifeDuty), "普通任课老师课表不得混入生活老师排班");

const [app, html] = await Promise.all([
  fs.readFile(new URL("../app.js", import.meta.url), "utf8"),
  fs.readFile(new URL("../index.html", import.meta.url), "utf8"),
]);
assert.match(html, /id="scheduleNavLabel">我的课表/, "导航应预留按账号切换课表／排班的文案位置");
assert.match(app, /function isLifeTeacherAccount\(/, "前端应能识别生活老师账号");
assert.match(app, /scheduleNav: "我的排班"/, "生活老师导航应显示“我的排班”");
assert.match(app, /function renderLifeTeacherDashboard\(/, "生活老师应有独立工作台口径");
assert.match(app, /function renderLifeTeacherSchedule\(/, "生活老师应有独立排班渲染");

console.log("生活老师排班与课时隔离测试通过");
