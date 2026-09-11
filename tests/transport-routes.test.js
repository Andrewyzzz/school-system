import assert from "node:assert/strict";
import {
  createInitialData,
  lifeTeacherDutyEventsForWeek,
  teacherPayrollPreview,
  teacherScheduleWeeks,
} from "../server/storage.js";
import {
  completedTransportCountsForTeacherMonth,
  createTransportTransferRequest,
  operateTransportRouteLeg,
  publishTransportRoute,
  reviewTransportTransferRequest,
  saveTransportRoute,
} from "../server/transportRoutes.js";

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function weekday(dateKey) {
  const day = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

function weekStart(dateKey) {
  return addDays(dateKey, -(weekday(dateKey) - 1));
}

const db = createInitialData({ teacherCount: 40 });
const today = new Date().toISOString().slice(0, 10);
const term = db.terms[0];
term.name = "跟车路线测试学期";
term.startDate = addDays(today, -2);
term.endDate = addDays(today, 28);
term.current = true;

const manager = db.accounts.find((account) => account.username === "security_manager");
const primaryLifeAccount = db.accounts.find((account) => account.username === "life_teacher_primary");
const middleLifeAccount = db.accounts.find((account) => account.username === "life_teacher_middle");
assert.ok(manager && primaryLifeAccount && middleLifeAccount, "应有安全部主管与生活老师账号");

const first = saveTransportRoute(db, manager, {
  name: "小学部北线",
  termId: term.id,
  distanceTier: "short",
  lifeTeacherId: primaryLifeAccount.teacherId,
  morningTime: "06:50-08:20",
  afternoonTime: "16:30-18:00",
  weekdays: [weekday(today)],
  startDate: today,
  endDate: addDays(today, 7),
  stops: "北门—教师公寓",
});
assert.equal(first.route.status, "draft", "新路线应先保存为草稿");
const published = publishTransportRoute(db, manager, first.route.id);
assert.ok(published.runs.length >= 1, "发布后应生成逐日跟车班次");

const todayRun = published.runs.find((run) => run.date === today);
assert.ok(todayRun, "应生成今天可执行的路线班次");
const duties = lifeTeacherDutyEventsForWeek(db, primaryLifeAccount.teacherId, weekStart(today));
assert.equal(duties.filter((duty) => duty.routeRunId === todayRun.id).length, 2, "一趟路线必须拆为早接、晚送两段");
assert.ok(duties.every((duty) => duty.nonPayable && duty.units === 0), "跟车班次不可混入教学课时");
assert.ok(teacherScheduleWeeks(db, primaryLifeAccount.teacherId).some((week) => week.weekStart === weekStart(today)), "生活老师应能在排班表选择已发布周次");

// 同一生活老师在重叠时段不能再被排另一条路线。
assert.throws(
  () => saveTransportRoute(db, manager, {
    name: "冲突路线",
    termId: term.id,
    distanceTier: "medium",
    lifeTeacherId: primaryLifeAccount.teacherId,
    morningTime: "07:30-08:40",
    afternoonTime: "17:00-18:20",
    weekdays: [weekday(today)],
    startDate: today,
    endDate: today,
  }),
  /重叠跟车班次/,
  "安全部不能把同一生活老师排进时间冲突的路线",
);

operateTransportRouteLeg(db, primaryLifeAccount, { runId: todayRun.id, leg: "morning", action: "check_in" });
operateTransportRouteLeg(db, primaryLifeAccount, { runId: todayRun.id, leg: "morning", action: "complete" });
operateTransportRouteLeg(db, primaryLifeAccount, { runId: todayRun.id, leg: "afternoon", action: "check_in" });
operateTransportRouteLeg(db, primaryLifeAccount, { runId: todayRun.id, leg: "afternoon", action: "complete" });
assert.deepEqual(completedTransportCountsForTeacherMonth(db, primaryLifeAccount.teacherId, today.slice(0, 7)), { short: 1, medium: 0, long: 0, extraLong: 0 }, "早晚两段都完成才算一趟短途接送");
const payroll = teacherPayrollPreview(db, primaryLifeAccount.teacherId, today.slice(0, 7));
assert.equal(payroll.components.find((item) => item.name === "接送补助")?.amount, 80, "已完成短途路线应按制度计入 80 元补助");

// 调班只在未执行的未来路线生效，安全部审批后才真正修改班次归属。
const tomorrow = addDays(today, 1);
const future = saveTransportRoute(db, manager, {
  name: "小学部东线",
  termId: term.id,
  distanceTier: "medium",
  lifeTeacherId: primaryLifeAccount.teacherId,
  morningTime: "09:00-10:00",
  afternoonTime: "15:00-16:00",
  weekdays: [weekday(tomorrow)],
  startDate: tomorrow,
  endDate: tomorrow,
});
const futurePublished = publishTransportRoute(db, manager, future.route.id);
const futureRun = futurePublished.runs.find((run) => run.date === tomorrow);
assert.ok(futureRun, "未来路线应生成调班对象");
const request = createTransportTransferRequest(db, primaryLifeAccount, { runId: futureRun.id, toTeacherId: middleLifeAccount.teacherId });
const reviewed = reviewTransportTransferRequest(db, manager, request.request.id, { approved: true });
assert.equal(reviewed.run.teacherId, middleLifeAccount.teacherId, "安全部批准后，跟车班次应转给目标生活老师");
assert.equal(lifeTeacherDutyEventsForWeek(db, primaryLifeAccount.teacherId, weekStart(tomorrow)).filter((duty) => duty.routeRunId === futureRun.id).length, 0, "原生活老师排班应移除该路线");
assert.equal(lifeTeacherDutyEventsForWeek(db, middleLifeAccount.teacherId, weekStart(tomorrow)).filter((duty) => duty.routeRunId === futureRun.id).length, 2, "接班生活老师应收到早、晚两个班次");

console.log("transport route workflow checks passed");
