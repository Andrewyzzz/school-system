const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function formatDate(dateKey) {
  if (!dateKey) return "";
  const parts = String(dateKey).split("-");
  return `${Number(parts[1])}月${Number(parts[2])}日`;
}

function weekday(dateKey) {
  const date = new Date(`${dateKey}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return "";
  return WEEKDAYS[date.getDay()];
}

function groupByDate(lessons) {
  const grouped = {};
  (lessons || []).forEach((lesson) => {
    if (!grouped[lesson.date]) grouped[lesson.date] = [];
    grouped[lesson.date].push(lesson);
  });
  return Object.keys(grouped)
    .sort()
    .map((date) => ({
      date,
      label: `${weekday(date)} · ${formatDate(date)}`,
      lessons: grouped[date].sort((a, b) => Number(a.period || 0) - Number(b.period || 0)),
    }));
}

function statusText(status) {
  const map = {
    scheduled: "未到时间",
    pending: "待签入",
    checkedIn: "待签出",
    completed: "已完成",
    exception: "异常",
  };
  return map[status] || status || "未知";
}

function actionForLesson(lesson) {
  return lesson && lesson.status === "checkedIn" ? "checkOut" : "checkIn";
}

function actionText(action) {
  return action === "checkOut" ? "签出" : "签入";
}

function demoOccurredAt(lesson, action) {
  if (!lesson || !lesson.date || !lesson.time) return new Date().toISOString();
  const times = String(lesson.time).split("-");
  const clock = action === "checkOut" ? times[1] : times[0];
  const date = new Date(`${lesson.date}T${clock}:00+08:00`);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  const offset = action === "checkOut" ? 5 : -5;
  return new Date(date.getTime() + offset * 60 * 1000).toISOString();
}

function money(value) {
  return `¥${Number(value || 0).toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

module.exports = {
  formatDate,
  weekday,
  groupByDate,
  statusText,
  actionForLesson,
  actionText,
  demoOccurredAt,
  money,
};
