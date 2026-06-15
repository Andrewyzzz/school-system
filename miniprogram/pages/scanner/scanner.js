const api = require("../../utils/request");
const config = require("../../utils/config");
const dateUtil = require("../../utils/date");

function roomDisplayKey(roomId) {
  return `screen-${String(roomId || "").toLowerCase()}`;
}

function normalizeLesson(lesson) {
  const status = lesson.status || "scheduled";
  return {
    ...lesson,
    statusText: dateUtil.statusText(status),
    statusClass: status === "completed" ? "done" : status === "exception" ? "error" : status === "checkedIn" ? "warn" : "",
  };
}

function canOperate(lesson) {
  return lesson && ["scheduled", "pending", "checkedIn"].indexOf(lesson.status) >= 0;
}

Page({
  data: {
    loading: false,
    submitting: false,
    lessons: [],
    lessonLabels: [],
    lessonIndex: 0,
    selectedLesson: {},
    checks: [],
    screenUrl: "",
  },

  onShow() {
    if (!api.requireTeacherPage()) return;
    this.loadLessons();
  },

  async loadLessons() {
    this.setData({ loading: true });
    try {
      const teacherId = api.getTeacherId();
      const result = await api.request(`/api/teachers/${teacherId}/schedule?weekStart=auto`);
      const lessons = (result.lessons || []).map(normalizeLesson).filter(canOperate);
      const selectedLesson = lessons[this.data.lessonIndex] || lessons[0] || {};
      this.setData({
        lessons,
        lessonIndex: Math.min(this.data.lessonIndex, Math.max(lessons.length - 1, 0)),
        lessonLabels: lessons.map(
          (lesson) => `${lesson.date} 第${lesson.period}节 · ${lesson.subjectName} · ${lesson.statusText}`,
        ),
        selectedLesson,
        screenUrl: selectedLesson.roomId
          ? `${config.apiBase}/classroom.html?roomId=${encodeURIComponent(selectedLesson.roomId)}&displayKey=${encodeURIComponent(
              roomDisplayKey(selectedLesson.roomId),
            )}`
          : "",
      });
    } catch (error) {
      wx.showToast({ title: error.message || "课时加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  onLessonChange(event) {
    const index = Number(event.detail.value || 0);
    const selectedLesson = this.data.lessons[index] || {};
    this.setData({
      lessonIndex: index,
      selectedLesson,
      checks: [],
      screenUrl: selectedLesson.roomId
        ? `${config.apiBase}/classroom.html?roomId=${encodeURIComponent(selectedLesson.roomId)}&displayKey=${encodeURIComponent(
            roomDisplayKey(selectedLesson.roomId),
          )}`
        : "",
    });
  },

  scanCode() {
    const lesson = this.data.selectedLesson;
    if (!lesson.id) {
      wx.showToast({ title: "请选择课时", icon: "none" });
      return;
    }
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ["qrCode"],
      success: (result) => {
        this.submitAttendance(result.result, new Date().toISOString());
      },
      fail: (error) => {
        wx.showToast({ title: error.errMsg || "扫码失败", icon: "none" });
      },
    });
  },

  async submitDemo() {
    const lesson = this.data.selectedLesson;
    if (!lesson.id || !lesson.roomId) {
      wx.showToast({ title: "请选择有教室的课时", icon: "none" });
      return;
    }

    try {
      const result = await api.request(
        `/api/classrooms/${encodeURIComponent(lesson.roomId)}/dynamic-qr?displayKey=${encodeURIComponent(
          roomDisplayKey(lesson.roomId),
        )}`,
      );
      const action = dateUtil.actionForLesson(lesson);
      await this.submitAttendance(JSON.stringify(result.payload), dateUtil.demoOccurredAt(lesson, action));
    } catch (error) {
      wx.showToast({ title: error.message || "演示二维码获取失败", icon: "none" });
    }
  },

  async submitAttendance(qrPayload, occurredAt) {
    const lesson = this.data.selectedLesson;
    const action = dateUtil.actionForLesson(lesson);
    this.setData({ submitting: true, checks: [] });
    try {
      const result = await api.request(`/api/teachers/${api.getTeacherId()}/attendance`, {
        method: "POST",
        data: {
          lessonId: lesson.id,
          action,
          qrPayload,
          occurredAt,
        },
      });
      this.setData({ checks: result.checks || [] });
      wx.showToast({ title: `${dateUtil.actionText(action)}成功`, icon: "success" });
      await this.loadLessons();
    } catch (error) {
      if (error.details && error.details.checks) {
        this.setData({ checks: error.details.checks });
      }
      wx.showToast({ title: error.message || "考勤提交失败", icon: "none" });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
