const config = require("./config");

function getToken() {
  return wx.getStorageSync("schoolToken") || "";
}

function getAccount() {
  return wx.getStorageSync("schoolAccount") || null;
}

function getTeacherId() {
  const account = getAccount();
  return account && account.teacherId ? account.teacherId : "";
}

function clearSession() {
  wx.removeStorageSync("schoolToken");
  wx.removeStorageSync("schoolAccount");
}

function saveSession(token, account) {
  wx.setStorageSync("schoolToken", token);
  wx.setStorageSync("schoolAccount", account);
}

function request(path, options) {
  const opts = options || {};
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.apiBase}${path}`,
      method: opts.method || "GET",
      data: opts.data || {},
      header: headers,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }

        const data = res.data || {};
        const error = data.error || {};
        const message = error.message || `请求失败：${res.statusCode}`;
        const requestError = new Error(message);
        requestError.statusCode = res.statusCode;
        requestError.details = error.details || null;
        if (res.statusCode === 401) {
          clearSession();
          wx.reLaunch({ url: "/pages/login/login" });
        }
        reject(requestError);
      },
      fail(error) {
        reject(new Error(error.errMsg || "网络请求失败"));
      },
    });
  });
}

async function login(username, password) {
  const result = await request("/api/auth/login", {
    method: "POST",
    data: { username, password },
  });
  saveSession(result.token, result.account);
  return result.account;
}

function requireTeacherPage() {
  const token = getToken();
  const account = getAccount();
  if (!token || !account) {
    wx.reLaunch({ url: "/pages/login/login" });
    return null;
  }
  if (account.role !== "teacher") {
    wx.showToast({ title: "小程序 MVP 仅支持老师账号", icon: "none" });
    clearSession();
    wx.reLaunch({ url: "/pages/login/login" });
    return null;
  }
  return account;
}

module.exports = {
  request,
  login,
  getAccount,
  getTeacherId,
  getToken,
  clearSession,
  requireTeacherPage,
};
