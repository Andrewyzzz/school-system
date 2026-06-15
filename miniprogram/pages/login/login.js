const api = require("../../utils/request");

Page({
  data: {
    username: "teacher0001",
    password: "123456",
    loading: false,
  },

  onLoad() {
    const account = api.getAccount();
    if (api.getToken() && account && account.role === "teacher") {
      wx.reLaunch({ url: "/pages/home/home" });
    }
  },

  onUsernameInput(event) {
    this.setData({ username: event.detail.value });
  },

  onPasswordInput(event) {
    this.setData({ password: event.detail.value });
  },

  useDemoAccount() {
    this.setData({
      username: "teacher0001",
      password: "123456",
    });
  },

  async submitLogin() {
    if (!this.data.username || !this.data.password) {
      wx.showToast({ title: "请输入用户名和密码", icon: "none" });
      return;
    }

    this.setData({ loading: true });
    try {
      const account = await api.login(this.data.username, this.data.password);
      if (account.role !== "teacher") {
        api.clearSession();
        wx.showToast({ title: "小程序 MVP 仅支持老师账号", icon: "none" });
        return;
      }
      wx.reLaunch({ url: "/pages/home/home" });
    } catch (error) {
      wx.showToast({ title: error.message || "登录失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  },
});
