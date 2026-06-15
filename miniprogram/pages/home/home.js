const api = require("../../utils/request");
const config = require("../../utils/config");
const dateUtil = require("../../utils/date");

Page({
  data: {
    account: {},
    teacher: {},
    summary: {},
    netPay: "¥0",
    notifications: [],
  },

  onShow() {
    const account = api.requireTeacherPage();
    if (!account) return;
    this.setData({ account });
    this.loadHome();
  },

  async loadHome() {
    try {
      const teacherId = api.getTeacherId();
      const teacherResult = await api.request("/api/teachers/me");
      const workload = await api.request(`/api/teachers/${teacherId}/workload?month=${config.defaultMonth}`);
      const notices = await api.request("/api/notifications?limit=3");
      this.setData({
        teacher: teacherResult.teacher || {},
        summary: workload.summary || {},
        netPay: dateUtil.money((workload.summary || {}).netPay),
        notifications: notices.items || notices.notifications || [],
      });
    } catch (error) {
      wx.showToast({ title: error.message || "首页加载失败", icon: "none" });
    }
  },

  goSchedule() {
    wx.navigateTo({ url: "/pages/schedule/schedule" });
  },

  goScanner() {
    wx.navigateTo({ url: "/pages/scanner/scanner" });
  },

  goRecords() {
    wx.navigateTo({ url: "/pages/records/records" });
  },

  goPayroll() {
    wx.navigateTo({ url: "/pages/payroll/payroll" });
  },

  goWorkload() {
    wx.navigateTo({ url: "/pages/workload/workload" });
  },

  goNotifications() {
    wx.navigateTo({ url: "/pages/notifications/notifications" });
  },

  async logout() {
    try {
      await api.request("/api/auth/logout", { method: "POST" });
    } catch (error) {
      // Ignore logout request failures and clear local session.
    }
    api.clearSession();
    wx.reLaunch({ url: "/pages/login/login" });
  },
});
