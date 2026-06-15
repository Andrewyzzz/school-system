const api = require("../../utils/request");
const config = require("../../utils/config");

function normalizeRecord(record) {
  const accepted = record.status === "accepted";
  const exception = record.status === "exception";
  return {
    ...record,
    statusText: accepted ? "通过" : exception ? "异常" : "已拦截",
    statusClass: accepted ? "done" : exception ? "error" : "warn",
  };
}

Page({
  data: {
    loading: false,
    summary: {},
    records: [],
  },

  onShow() {
    if (!api.requireTeacherPage()) return;
    this.loadRecords();
  },

  async loadRecords() {
    this.setData({ loading: true });
    try {
      const teacherId = api.getTeacherId();
      const result = await api.request(`/api/teachers/${teacherId}/attendance-records?month=${config.defaultMonth}`);
      this.setData({
        summary: result.summary || {},
        records: (result.records || []).map(normalizeRecord).reverse(),
      });
    } catch (error) {
      wx.showToast({ title: error.message || "考勤记录加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },
});
