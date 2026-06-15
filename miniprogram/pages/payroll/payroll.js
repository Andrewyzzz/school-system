const api = require("../../utils/request");
const config = require("../../utils/config");
const dateUtil = require("../../utils/date");

Page({
  data: {
    loading: false,
    netPay: "¥0",
  },

  onShow() {
    if (!api.requireTeacherPage()) return;
    this.loadPayroll();
  },

  async loadPayroll() {
    this.setData({ loading: true });
    try {
      const result = await api.request(`/api/teachers/${api.getTeacherId()}/payroll?month=${config.defaultMonth}`);
      this.setData({
        netPay: dateUtil.money(result.netPay || 0),
      });
    } catch (error) {
      wx.showToast({ title: error.message || "总薪资加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },
});
