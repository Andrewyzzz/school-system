const api = require("../../utils/request");
const config = require("../../utils/config");
const dateUtil = require("../../utils/date");

function confirmationText(status) {
  const map = {
    teacher_confirmed: "老师已确认，待教务审批",
    academic_approved: "教务已审批，待总校审批",
    school_approved: "总校已审批，待财务结算",
    locked: "已锁定",
  };
  return map[status] || "老师待确认";
}

Page({
  data: {
    confirming: false,
    summary: {},
    statusText: "读取中",
    confirmDisabled: false,
    payableLines: [],
    pendingLines: [],
    exceptionLines: [],
  },

  onShow() {
    if (!api.requireTeacherPage()) return;
    this.loadWorkload();
  },

  async loadWorkload() {
    try {
      const result = await api.request(`/api/teachers/${api.getTeacherId()}/workload?month=${config.defaultMonth}`);
      const status = result.confirmation ? result.confirmation.status : "";
      this.setData({
        summary: result.summary || {},
        statusText: confirmationText(status),
        confirmDisabled: Boolean(status),
        payableLines: (result.payableLines || []).map((line) => ({
          ...line,
          amountText: dateUtil.money(line.amount || 0),
        })),
        pendingLines: (result.pendingLines || []).map((line) => ({
          ...line,
          statusText: dateUtil.statusText(line.status),
        })),
        exceptionLines: result.exceptionLines || [],
      });
    } catch (error) {
      wx.showToast({ title: error.message || "工作量加载失败", icon: "none" });
    }
  },

  async confirmWorkload() {
    this.setData({ confirming: true });
    try {
      await api.request(`/api/teachers/${api.getTeacherId()}/workload/confirm`, {
        method: "POST",
        data: { month: config.defaultMonth },
      });
      wx.showToast({ title: "已确认", icon: "success" });
      await this.loadWorkload();
    } catch (error) {
      wx.showToast({ title: error.message || "确认失败", icon: "none" });
    } finally {
      this.setData({ confirming: false });
    }
  },
});
