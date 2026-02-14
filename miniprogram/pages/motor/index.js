// pages/motor/index.js
const config = require("../../config.js");

Page({
  data: {
    statusText: "点击按钮发送指令",
    manualTime: "3",
    dailyTime: "",
    dailyDuration: "3",
  },

  onUnload() {
    if (this._dailyTimer) {
      clearInterval(this._dailyTimer);
      this._dailyTimer = null;
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [field]: value });
  },

  onDailyTimeChange(e) {
    this.setData({ dailyTime: e.detail.value });
  },

  send(seconds) {
    const ms = Math.round(Number(seconds) * 1000);
    if (ms <= 0) {
      wx.showToast({ title: "请输入有效秒数", icon: "none" });
      return;
    }
    const url = config.motorApi;
    if (!url || url.includes("你的域名")) {
      this.setData({ statusText: "请在 miniprogram/config.js 中配置 motorApi 为你的服务器地址" });
      wx.showToast({ title: "请先配置服务器地址", icon: "none" });
      return;
    }
    this.setData({ statusText: "发送中…" });
    wx.request({
      url,
      method: "POST",
      header: { "content-type": "application/json" },
      data: { time: ms },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.setData({ statusText: "✅ 指令已发送" });
          wx.showToast({ title: "已发送", icon: "success" });
        } else {
          const msg = (res.data && res.data.errMsg) || `请求失败 ${res.statusCode}`;
          this.setData({ statusText: "❌ " + msg });
          wx.showToast({ title: msg, icon: "none" });
        }
      },
      fail: (err) => {
        const msg = err.errMsg || String(err);
        this.setData({ statusText: "❌ " + msg });
        wx.showToast({ title: "请求失败", icon: "none" });
      },
    });
  },

  onJog(e) {
    const sec = parseFloat(e.currentTarget.dataset.sec);
    this.send(sec);
  },

  onManualRun() {
    const sec = parseFloat(this.data.manualTime);
    if (!Number.isFinite(sec) || sec <= 0) {
      wx.showToast({ title: "请输入有效秒数", icon: "none" });
      return;
    }
    this.send(sec);
  },

  onSetDaily() {
    if (this._dailyTimer) {
      clearInterval(this._dailyTimer);
      this._dailyTimer = null;
    }
    const timeStr = this.data.dailyTime;
    const duration = parseFloat(this.data.dailyDuration);
    if (!timeStr || !Number.isFinite(duration) || duration <= 0) {
      wx.showToast({ title: "请选择时间并填写运行秒数", icon: "none" });
      return;
    }
    const [h, m] = timeStr.split(":").map(Number);
    this._dailyTimer = setInterval(() => {
      const now = new Date();
      if (
        now.getHours() === h &&
        now.getMinutes() === m &&
        now.getSeconds() === 0
      ) {
        this.send(duration);
      }
    }, 1000);
    this.setData({
      statusText: `⏰ 已设置：每天 ${timeStr} 运行 ${duration} 秒（需保持小程序在前台）`,
    });
    wx.showToast({ title: "定时已设置", icon: "success" });
  },
});
