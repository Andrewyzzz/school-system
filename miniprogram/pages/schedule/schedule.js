const api = require("../../utils/request");
const dateUtil = require("../../utils/date");

function normalizeLesson(lesson) {
  const status = lesson.status || "scheduled";
  return {
    ...lesson,
    statusText: dateUtil.statusText(status),
    statusClass: status === "completed" ? "done" : status === "exception" ? "error" : status === "checkedIn" ? "warn" : "",
  };
}

Page({
  data: {
    loading: false,
    weekIndex: 0,
    weeks: [],
    weekLabels: [],
    groups: [],
  },

  onShow() {
    if (!api.requireTeacherPage()) return;
    this.loadSchedule("auto");
  },

  async loadSchedule(weekStart) {
    this.setData({ loading: true });
    try {
      const teacherId = api.getTeacherId();
      const result = await api.request(`/api/teachers/${teacherId}/schedule?weekStart=${weekStart || "auto"}`);
      const weeks = result.availableWeeks || [];
      const weekIndex = Math.max(
        weeks.findIndex((item) => item.weekStart === result.weekStart),
        0,
      );
      const lessons = (result.lessons || []).map(normalizeLesson);
      this.setData({
        weeks,
        weekIndex,
        weekLabels: weeks.map((item) => `${item.label || item.weekStart} · ${item.lessonCount || 0} 节`),
        groups: dateUtil.groupByDate(lessons),
      });
    } catch (error) {
      wx.showToast({ title: error.message || "课表加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  onWeekChange(event) {
    const index = Number(event.detail.value || 0);
    const week = this.data.weeks[index];
    this.setData({ weekIndex: index });
    if (week) this.loadSchedule(week.weekStart);
  },
});
