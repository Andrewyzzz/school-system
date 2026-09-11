import { randomUUID } from "node:crypto";
import { accountHasRole } from "./accountRoles.js";

// 跟车路线是生活老师的独立工作排班。它不属于教学课表、不产生课时工资，
// 但已完成的整趟路线会作为生活老师接送补助的唯一计数来源。
export const TRANSPORT_DISTANCE_TIERS = [
  { id: "short", name: "短途", rate: 80 },
  { id: "medium", name: "中途", rate: 100 },
  { id: "long", name: "长途", rate: 120 },
  { id: "extraLong", name: "超长途", rate: 180 },
];

const WEEKDAY_LABELS = {
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
  7: "周日",
};

function routeError(message, statusCode = 400, details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

function text(value) {
  return String(value ?? "").trim();
}

function nowIso() {
  return new Date().toISOString();
}

function todayKey() {
  return nowIso().slice(0, 10);
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function parseMinutes(range) {
  const match = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(text(range));
  if (!match) return null;
  const [, startHour, startMinute, endHour, endMinute] = match.map(Number);
  if ([startHour, endHour].some((hour) => hour > 23) || [startMinute, endMinute].some((minute) => minute > 59)) return null;
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  return end > start ? { start, end } : null;
}

function overlap(left, right) {
  return left.start < right.end && right.start < left.end;
}

function weekdayOf(dateKey) {
  const day = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(start, end) {
  const rows = [];
  for (let date = start; date <= end; date = addDays(date, 1)) rows.push(date);
  return rows;
}

function ensureCollections(db) {
  if (!Array.isArray(db.transportRoutes)) db.transportRoutes = [];
  if (!Array.isArray(db.transportRouteRuns)) db.transportRouteRuns = [];
  if (!Array.isArray(db.transportRouteTransferRequests)) db.transportRouteTransferRequests = [];
}

function isSecurityManager(account) {
  return accountHasRole(account, "security_manager");
}

function isLifeTeacher(teacher) {
  return String(teacher?.salaryProfile?.salaryCategory || "") === "lifeTeacher";
}

function activeLifeTeachers(db) {
  return (db.teachers || [])
    .filter((teacher) => teacher.status !== "suspended" && isLifeTeacher(teacher))
    .sort((left, right) => `${left.stageName || left.department}:${left.name}`.localeCompare(`${right.stageName || right.department}:${right.name}`, "zh-CN"));
}

function lifeTeacherById(db, teacherId) {
  const teacher = activeLifeTeachers(db).find((item) => item.id === teacherId);
  if (!teacher) throw routeError("请选择在岗生活老师");
  return teacher;
}

function termById(db, termId) {
  const term = (db.terms || []).find((item) => item.id === termId);
  if (!term || term.status === "archived" || !isDate(term.startDate) || !isDate(term.endDate)) {
    throw routeError("请选择未归档的正式学期");
  }
  return term;
}

function routeDates(route, term, { fromDate = "" } = {}) {
  const firstDate = [term.startDate, text(route.startDate), text(fromDate)].filter(isDate).sort().at(-1) || term.startDate;
  const endDate = [term.endDate, text(route.endDate)].filter(isDate).sort()[0] || term.endDate;
  if (firstDate > endDate) return [];
  const weekdays = new Set(route.weekdays || []);
  return daysBetween(firstDate, endDate).filter((date) => weekdays.has(weekdayOf(date)));
}

function routeRunStatus(run) {
  if (run.cancelledAt) return "cancelled";
  const legs = [run.morning, run.afternoon];
  if (legs.every((leg) => leg?.status === "completed")) return "completed";
  if (legs.some((leg) => leg?.status === "checked_in")) return "in_progress";
  return "scheduled";
}

function routeRunDisplayStatus(run) {
  return {
    scheduled: "待执行",
    in_progress: "执行中",
    completed: "已完成",
    cancelled: "已取消",
  }[routeRunStatus(run)] || "待执行";
}

function publicTeacher(teacher) {
  return {
    id: teacher.id,
    name: teacher.name,
    stageId: teacher.stageId || "",
    stageName: teacher.stageName || teacher.department || "未设置学部",
    title: teacher.title || "生活老师",
  };
}

function publicRun(db, run, account = null) {
  const teacher = (db.teachers || []).find((item) => item.id === run.teacherId);
  const mine = Boolean(account?.teacherId && account.teacherId === run.teacherId && accountHasRole(account, "life_teacher"));
  const toLeg = (leg, key) => ({
    key,
    label: key === "morning" ? "早晨接" : "放学送",
    time: leg?.time || "",
    status: leg?.status || "scheduled",
    statusLabel: { scheduled: "待签到", checked_in: "已签到", completed: "已完成", cancelled: "已取消" }[leg?.status] || "待签到",
    checkInAt: leg?.checkInAt || "",
    completedAt: leg?.completedAt || "",
    // 签到、完成只允许在当天操作；调班则仍可在未来日期申请。
    canCheckIn: mine && !run.cancelledAt && leg?.status === "scheduled" && run.date === todayKey(),
    canComplete: mine && !run.cancelledAt && leg?.status === "checked_in" && run.date === todayKey(),
  });
  return {
    id: run.id,
    routeId: run.routeId,
    routeName: run.routeName,
    distanceTier: run.distanceTier,
    distanceLabel: TRANSPORT_DISTANCE_TIERS.find((tier) => tier.id === run.distanceTier)?.name || run.distanceTier,
    date: run.date,
    termId: run.termId,
    termName: run.termName,
    stops: run.stops || "",
    note: run.note || "",
    teacher: teacher ? publicTeacher(teacher) : { id: run.teacherId, name: run.teacherName || "生活老师" },
    status: routeRunStatus(run),
    statusLabel: routeRunDisplayStatus(run),
    morning: toLeg(run.morning, "morning"),
    afternoon: toLeg(run.afternoon, "afternoon"),
    canRequestTransfer: mine && !run.cancelledAt && routeRunStatus(run) === "scheduled" && run.date >= todayKey(),
  };
}

function publicRoute(db, route, account = null) {
  const teacher = (db.teachers || []).find((item) => item.id === route.lifeTeacherId);
  const runs = (db.transportRouteRuns || []).filter((run) => run.routeId === route.id);
  const completedRuns = runs.filter((run) => routeRunStatus(run) === "completed");
  return {
    id: route.id,
    name: route.name,
    termId: route.termId,
    termName: route.termName,
    distanceTier: route.distanceTier,
    distanceLabel: TRANSPORT_DISTANCE_TIERS.find((tier) => tier.id === route.distanceTier)?.name || route.distanceTier,
    morningTime: route.morningTime,
    afternoonTime: route.afternoonTime,
    stops: route.stops || "",
    note: route.note || "",
    weekdays: route.weekdays || [],
    weekdayLabel: (route.weekdays || []).map((day) => WEEKDAY_LABELS[day]).filter(Boolean).join("、"),
    startDate: route.startDate || "",
    endDate: route.endDate || "",
    status: route.status || "draft",
    statusLabel: route.status === "published" ? "已发布" : "草稿",
    version: Number(route.version || 0),
    lifeTeacher: teacher ? publicTeacher(teacher) : null,
    runs: {
      total: runs.length,
      completed: completedRuns.length,
      scheduled: runs.filter((run) => routeRunStatus(run) === "scheduled").length,
      inProgress: runs.filter((run) => routeRunStatus(run) === "in_progress").length,
    },
    canManage: isSecurityManager(account),
  };
}

function assertManager(account) {
  if (!isSecurityManager(account)) throw routeError("只有安全部主管可以维护跟车路线", 403);
}

function assertLifeTeacherAccount(account) {
  if (!accountHasRole(account, "life_teacher") || !account?.teacherId) throw routeError("只有生活老师可以操作本人跟车班次", 403);
}

function normalizedWeekdays(values) {
  const input = Array.isArray(values) ? values : [];
  const weekdayValues = [...new Set(input.map(Number).filter((value) => Number.isInteger(value) && value >= 1 && value <= 7))].sort((a, b) => a - b);
  if (!weekdayValues.length) throw routeError("请至少选择一个运行日");
  return weekdayValues;
}

function routeInput(db, input = {}, existing = null) {
  const term = termById(db, text(input.termId || existing?.termId));
  const name = text(input.name || existing?.name);
  const distanceTier = text(input.distanceTier || existing?.distanceTier);
  const morningTime = text(input.morningTime || existing?.morningTime);
  const afternoonTime = text(input.afternoonTime || existing?.afternoonTime);
  const lifeTeacherId = text(input.lifeTeacherId || existing?.lifeTeacherId);
  if (!name) throw routeError("请填写路线名称");
  if (!TRANSPORT_DISTANCE_TIERS.some((tier) => tier.id === distanceTier)) throw routeError("请选择短途、中途、长途或超长途");
  if (!parseMinutes(morningTime) || !parseMinutes(afternoonTime)) throw routeError("班次时间请按 HH:MM-HH:MM 填写，结束时间须晚于开始时间");
  if (overlap(parseMinutes(morningTime), parseMinutes(afternoonTime))) throw routeError("早晨接与放学送的时间不能重叠");
  const lifeTeacher = lifeTeacherById(db, lifeTeacherId);
  const startDate = text(input.startDate || existing?.startDate || term.startDate) || term.startDate;
  const endDate = text(input.endDate || existing?.endDate || term.endDate) || term.endDate;
  if (!isDate(startDate) || !isDate(endDate) || startDate < term.startDate || endDate > term.endDate || endDate < startDate) {
    throw routeError("路线生效日期必须在所选学期内");
  }
  return {
    name,
    termId: term.id,
    termName: term.name,
    distanceTier,
    morningTime,
    afternoonTime,
    lifeTeacherId: lifeTeacher.id,
    lifeTeacherName: lifeTeacher.name,
    weekdays: normalizedWeekdays(input.weekdays ?? existing?.weekdays),
    startDate,
    endDate,
    stops: text(input.stops || existing?.stops),
    note: text(input.note || existing?.note),
  };
}

function assertNoRunConflict(db, candidate, { excludingRouteId = "", fromDate = "" } = {}) {
  const candidateDates = routeDates(candidate, termById(db, candidate.termId), { fromDate });
  const candidateRanges = [parseMinutes(candidate.morningTime), parseMinutes(candidate.afternoonTime)];
  const conflicts = [];
  (db.transportRouteRuns || []).forEach((run) => {
    if (run.routeId === excludingRouteId || run.teacherId !== candidate.lifeTeacherId || run.cancelledAt || !candidateDates.includes(run.date)) return;
    const existingRanges = [parseMinutes(run.morning?.time), parseMinutes(run.afternoon?.time)].filter(Boolean);
    if (candidateRanges.some((range) => existingRanges.some((existing) => overlap(range, existing)))) {
      conflicts.push(`${run.date} ${run.routeName}`);
    }
  });
  if (conflicts.length) throw routeError(`生活老师在以下日期已有重叠跟车班次：${conflicts.slice(0, 3).join("、")}`, 409, conflicts);
}

function createRunsForRoute(db, route, { fromDate = todayKey() } = {}) {
  const term = termById(db, route.termId);
  const dates = routeDates(route, term, { fromDate });
  const now = nowIso();
  const runs = dates.map((date) => ({
    id: `TRUN-${randomUUID()}`,
    routeId: route.id,
    routeName: route.name,
    termId: route.termId,
    termName: route.termName,
    distanceTier: route.distanceTier,
    stops: route.stops,
    note: route.note,
    date,
    teacherId: route.lifeTeacherId,
    teacherName: route.lifeTeacherName,
    createdAt: now,
    morning: { time: route.morningTime, status: "scheduled", checkInAt: "", completedAt: "" },
    afternoon: { time: route.afternoonTime, status: "scheduled", checkInAt: "", completedAt: "" },
  }));
  db.transportRouteRuns.push(...runs);
  return runs;
}

export function ensureTransportRouteData(db) {
  ensureCollections(db);
  return db;
}

export function queryTransportRoutes(db, account, query = {}) {
  ensureCollections(db);
  const termId = text(query.termId);
  const canManage = isSecurityManager(account);
  const routes = (db.transportRoutes || [])
    .filter((route) => !termId || route.termId === termId)
    .filter((route) => canManage || route.lifeTeacherId === account?.teacherId)
    .sort((left, right) => String(right.termId).localeCompare(String(left.termId)) || String(left.name).localeCompare(String(right.name), "zh-CN"))
    .map((route) => publicRoute(db, route, account));
  return {
    canManage,
    termOptions: (db.terms || [])
      .filter((term) => term.status !== "archived")
      .map((term) => ({ id: term.id, name: term.name, startDate: term.startDate, endDate: term.endDate, current: Boolean(term.current) })),
    // 生活老师申请调班时也需要能选择一位在岗同事。
    lifeTeachers: (canManage || accountHasRole(account, "life_teacher")) ? activeLifeTeachers(db).map(publicTeacher) : [],
    distanceTiers: TRANSPORT_DISTANCE_TIERS,
    routes,
  };
}

export function saveTransportRoute(db, account, input = {}) {
  ensureCollections(db);
  assertManager(account);
  const existing = input.id ? db.transportRoutes.find((route) => route.id === text(input.id)) : null;
  if (input.id && !existing) throw routeError("路线不存在", 404);
  const payload = routeInput(db, input, existing);
  // 已发布路线改动后，当前和未来的班次将由下一次“发布路线表”替换；编辑草稿不改变老师端。
  assertNoRunConflict(db, payload, { excludingRouteId: existing?.id || "", fromDate: todayKey() });
  const now = nowIso();
  const route = existing || { id: `TROUTE-${randomUUID()}`, status: "draft", version: 0, createdAt: now, createdByAccountId: account.id };
  Object.assign(route, payload, { updatedAt: now, updatedByAccountId: account.id, updatedByName: account.name || account.username || "" });
  if (!existing) db.transportRoutes.push(route);
  return { route: publicRoute(db, route, account), created: !existing };
}

export function publishTransportRoute(db, account, routeId) {
  ensureCollections(db);
  assertManager(account);
  const route = db.transportRoutes.find((item) => item.id === routeId);
  if (!route) throw routeError("路线不存在", 404);
  assertNoRunConflict(db, route, { excludingRouteId: route.id, fromDate: todayKey() });
  const fromDate = todayKey();
  const retainedRuns = db.transportRouteRuns.filter((run) => !(run.routeId === route.id && run.date >= fromDate && !run.cancelledAt));
  db.transportRouteRuns = retainedRuns;
  const runs = createRunsForRoute(db, route, { fromDate });
  route.status = "published";
  route.version = Number(route.version || 0) + 1;
  route.publishedAt = nowIso();
  route.publishedByAccountId = account.id;
  route.publishedByName = account.name || account.username || "";
  return { route: publicRoute(db, route, account), runs, teacherId: route.lifeTeacherId };
}

export function routeRunsForTeacherWeek(db, teacherId, weekStart) {
  ensureCollections(db);
  const endDate = addDays(weekStart, 6);
  return db.transportRouteRuns
    .filter((run) => run.teacherId === teacherId && run.date >= weekStart && run.date <= endDate)
    .sort((left, right) => `${left.date}:${left.morning?.time || ""}`.localeCompare(`${right.date}:${right.morning?.time || ""}`));
}

export function transportRouteScheduleWeeks(db, teacherId, term) {
  ensureCollections(db);
  if (!term?.startDate || !term?.endDate) return [];
  const byWeek = new Map();
  (db.transportRouteRuns || [])
    .filter((run) => run.teacherId === teacherId && run.termId === term.id)
    .forEach((run) => {
      const date = new Date(`${run.date}T00:00:00Z`);
      const weekday = date.getUTCDay() || 7;
      const weekStart = addDays(run.date, -(weekday - 1));
      if (!byWeek.has(weekStart)) byWeek.set(weekStart, []);
      byWeek.get(weekStart).push(run);
    });
  return [...byWeek.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([weekStart, runs]) => ({
      weekStart,
      lessonCount: runs.length * 2,
      publishedCount: runs.length * 2,
      latestDate: runs.map((run) => run.date).sort().at(-1),
      isLifeDutySchedule: true,
    }));
}

export function routeDutyEventsForTeacherWeek(db, teacherId, weekStart) {
  return routeRunsForTeacherWeek(db, teacherId, weekStart).flatMap((run) => {
    const status = routeRunStatus(run);
    const base = {
      routeRunId: run.id,
      routeId: run.routeId,
      routeName: run.routeName,
      distanceTier: run.distanceTier,
      transportRunStatus: status,
      teacherId: run.teacherId,
      termId: run.termId,
      className: run.routeName,
      roomId: "transport-route",
      room: run.stops || "跟车路线",
      type: "lifeDuty",
      units: 0,
      status: status === "cancelled" ? "cancelled" : status === "completed" ? "completed" : "scheduled",
      nonPayable: true,
      isLifeDuty: true,
      source: "transport-route",
      note: `跟车路线：${TRANSPORT_DISTANCE_TIERS.find((tier) => tier.id === run.distanceTier)?.name || run.distanceTier}；接、送两段均完成才计一次补助。`,
      date: run.date,
    };
    return [
      {
        ...base,
        id: `${run.id}-morning`,
        time: run.morning?.time || "",
        subjectName: "早晨接送",
        dutyType: "arrival",
        routeLeg: "morning",
        checkInAt: run.morning?.checkInAt || "",
        completedAt: run.morning?.completedAt || "",
        routeLegStatus: run.morning?.status || "scheduled",
      },
      {
        ...base,
        id: `${run.id}-afternoon`,
        time: run.afternoon?.time || "",
        subjectName: "放学送达",
        dutyType: "departure",
        routeLeg: "afternoon",
        checkInAt: run.afternoon?.checkInAt || "",
        completedAt: run.afternoon?.completedAt || "",
        routeLegStatus: run.afternoon?.status || "scheduled",
      },
    ];
  });
}

export function operateTransportRouteLeg(db, account, input = {}) {
  ensureCollections(db);
  assertLifeTeacherAccount(account);
  const run = db.transportRouteRuns.find((item) => item.id === text(input.runId));
  if (!run) throw routeError("跟车班次不存在", 404);
  if (run.teacherId !== account.teacherId) throw routeError("只能操作本人跟车班次", 403);
  if (run.cancelledAt || run.date < todayKey()) throw routeError("已取消或已过期的班次不能操作", 409);
  const legKey = text(input.leg);
  if (!["morning", "afternoon"].includes(legKey)) throw routeError("请选择早晨接或放学送班次");
  const action = text(input.action);
  const leg = run[legKey];
  if (!leg) throw routeError("班次信息不完整", 409);
  const now = nowIso();
  if (action === "check_in") {
    if (leg.status !== "scheduled") throw routeError("该班次已签到或已完成", 409);
    leg.status = "checked_in";
    leg.checkInAt = now;
  } else if (action === "complete") {
    if (leg.status !== "checked_in") throw routeError("请先签到后再确认完成", 409);
    leg.status = "completed";
    leg.completedAt = now;
  } else {
    throw routeError("不支持的班次操作");
  }
  run.updatedAt = now;
  return { run: publicRun(db, run, account), teacherId: run.teacherId, month: run.date.slice(0, 7) };
}

export function createTransportTransferRequest(db, account, input = {}) {
  ensureCollections(db);
  assertLifeTeacherAccount(account);
  const run = db.transportRouteRuns.find((item) => item.id === text(input.runId));
  if (!run) throw routeError("跟车班次不存在", 404);
  if (run.teacherId !== account.teacherId) throw routeError("只能为本人班次申请调班", 403);
  if (routeRunStatus(run) !== "scheduled" || run.date < todayKey()) throw routeError("仅待执行的未来班次可申请调班", 409);
  const target = lifeTeacherById(db, text(input.toTeacherId));
  if (target.id === run.teacherId) throw routeError("调班对象不能是本人");
  const existingConflict = (db.transportRouteRuns || []).some((other) => {
    if (other.id === run.id || other.teacherId !== target.id || other.date !== run.date || other.cancelledAt) return false;
    const requestedRanges = [parseMinutes(run.morning?.time), parseMinutes(run.afternoon?.time)].filter(Boolean);
    const otherRanges = [parseMinutes(other.morning?.time), parseMinutes(other.afternoon?.time)].filter(Boolean);
    return requestedRanges.some((requested) => otherRanges.some((scheduled) => overlap(requested, scheduled)));
  });
  if (existingConflict) throw routeError("该生活老师在同一时段已有跟车任务", 409);
  const request = {
    id: `TTRANSFER-${randomUUID()}`,
    runId: run.id,
    routeId: run.routeId,
    routeName: run.routeName,
    date: run.date,
    fromTeacherId: run.teacherId,
    fromTeacherName: run.teacherName,
    toTeacherId: target.id,
    toTeacherName: target.name,
    status: "pending",
    createdAt: nowIso(),
    createdByAccountId: account.id,
  };
  db.transportRouteTransferRequests.push(request);
  return { request, securityManagerAccountIds: (db.accounts || []).filter(isSecurityManager).map((item) => item.id) };
}

export function reviewTransportTransferRequest(db, account, requestId, input = {}) {
  ensureCollections(db);
  assertManager(account);
  const request = db.transportRouteTransferRequests.find((item) => item.id === requestId);
  if (!request) throw routeError("调班申请不存在", 404);
  if (request.status !== "pending") throw routeError("该调班申请已处理", 409);
  const approved = input.approved === true;
  request.status = approved ? "approved" : "rejected";
  request.reviewedAt = nowIso();
  request.reviewedByAccountId = account.id;
  request.reviewedByName = account.name || account.username || "";
  if (!approved) return { request, run: null, affectedTeacherIds: [request.fromTeacherId] };
  const run = db.transportRouteRuns.find((item) => item.id === request.runId);
  if (!run || routeRunStatus(run) !== "scheduled" || run.date < todayKey()) {
    throw routeError("原跟车班次已变化，无法完成调班", 409);
  }
  const target = lifeTeacherById(db, request.toTeacherId);
  const conflicts = (db.transportRouteRuns || []).some((other) => {
    if (other.id === run.id || other.teacherId !== target.id || other.date !== run.date || other.cancelledAt) return false;
    const movedRanges = [parseMinutes(run.morning?.time), parseMinutes(run.afternoon?.time)].filter(Boolean);
    const otherRanges = [parseMinutes(other.morning?.time), parseMinutes(other.afternoon?.time)].filter(Boolean);
    return movedRanges.some((moved) => otherRanges.some((scheduled) => overlap(moved, scheduled)));
  });
  if (conflicts) throw routeError("调班对象当前已有重叠跟车任务", 409);
  run.originalTeacherId = run.teacherId;
  run.originalTeacherName = run.teacherName;
  run.teacherId = target.id;
  run.teacherName = target.name;
  run.transferredAt = nowIso();
  run.transferRequestId = request.id;
  return { request, run, affectedTeacherIds: [request.fromTeacherId, target.id] };
}

export function queryTransportTransferRequests(db, account) {
  ensureCollections(db);
  const canManage = isSecurityManager(account);
  const teacherId = account?.teacherId || "";
  const requests = db.transportRouteTransferRequests
    .filter((request) => canManage || request.fromTeacherId === teacherId || request.toTeacherId === teacherId)
    .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))
    .map((request) => ({
      ...request,
      statusLabel: { pending: "待安全部处理", approved: "已批准", rejected: "未批准" }[request.status] || request.status,
      canReview: canManage && request.status === "pending",
    }));
  return { canManage, requests };
}

export function completedTransportCountsForTeacherMonth(db, teacherId, month) {
  ensureCollections(db);
  const counts = { short: 0, medium: 0, long: 0, extraLong: 0 };
  db.transportRouteRuns
    .filter((run) => run.teacherId === teacherId && String(run.date || "").startsWith(`${month}-`) && routeRunStatus(run) === "completed")
    .forEach((run) => {
      if (Object.hasOwn(counts, run.distanceTier)) counts[run.distanceTier] += 1;
    });
  return counts;
}

export function transportRunSummariesForTeacher(db, teacherId, weekStart, account = null) {
  return routeRunsForTeacherWeek(db, teacherId, weekStart).map((run) => publicRun(db, run, account));
}
