const api = require("../../utils/request");
const config = require("../../utils/config");
const dateUtil = require("../../utils/date");

function normalizeLine(line) {
  const status = line.status || "scheduled";
  return {
    ...line,
    amountText: dateUtil.money(line.amount || 0),
    statusText: dateUtil.statusText(status),
    statusClass: status === "completed" ? "done" : status === "exception" ? "error" : "warn",
  };
}

Page({
  data: {
    loading: false,
    grossPay: "¥0",
    tax: "¥0",
    lessonAmount: "¥0",
    netPay: "¥0",
    rows: [],
    lines: [],
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
        grossPay: dateUtil.money(result.grossPay || 0),
        tax: dateUtil.money(result.tax || 0),
        lessonAmount: dateUtil.money(result.lessonAmount || 0),
        netPay: dateUtil.money(result.netPay || 0),
        rows: (result.rows || []).map((row) => ({
          ...row,
          amountText: dateUtil.money(row.amount || 0),
        })),
        lines: (result.lines || []).map(normalizeLine),
      });
    } catch (error) {
      wx.showToast({ title: error.message || "薪资明细加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },
});
