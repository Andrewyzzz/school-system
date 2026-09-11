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
assert.equal(duties.length, 0, "安全部未发布路线前，生活老师端不得自动虚构固定接送班次");

const publicSchedule = teacherLessonsForWeek(db, lifeTeacher.id, "2026-06-15");
assert.deepEqual(publicSchedule.map((item) => item.id), duties.map((item) => item.id), "老师端排班接口应只返回安全部发布的跟车任务");

const scheduleWeeks = teacherScheduleWeeks(db, lifeTeacher.id);
assert.equal(scheduleWeeks.length, 0, "未发布路线时不应提供没有实际班次的排班周");

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
assert.match(app, /function openLifeRouteTransferDialog\(/, "生活老师应能发起跟车调班申请");
assert.match(html, /id="lifeRouteRunList"/, "生活老师排班页应展示可操作的跟车班次");

console.log("生活老师排班与课时隔离测试通过");
