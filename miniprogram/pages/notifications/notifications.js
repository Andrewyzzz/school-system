const api = require("../../utils/request");

Page({
  data: {
    loading: false,
    items: [],
  },

  onShow() {
    if (!api.requireTeacherPage()) return;
    this.loadNotifications();
  },

  async loadNotifications() {
    this.setData({ loading: true });
    try {
      const result = await api.request("/api/notifications?limit=50");
      this.setData({ items: result.items || [] });
    } catch (error) {
      wx.showToast({ title: error.message || "通知加载失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },

  async markRead(event) {
    const id = event.currentTarget.dataset.id;
    if (!id) return;
    try {
      await api.request(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "POST" });
      this.loadNotifications();
    } catch (error) {
      wx.showToast({ title: error.message || "标记已读失败", icon: "none" });
    }
  },
});
