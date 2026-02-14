// pages/motor/index.js
var config = require("../../config.js");

Page({
  data: {
    statusText: "点击按钮发送指令",
    manualTime: "3",
    dailyTime: "",
    dailyDuration: "3",
  },

  onUnload: function () {
    if (this._dailyTimer) {
      clearInterval(this._dailyTimer);
      this._dailyTimer = null;
    }
  },

  onInput: function (e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value;
    var update = {};
    update[field] = value;
    this.setData(update);
  },

  onDailyTimeChange: function (e) {
    this.setData({ dailyTime: e.detail.value });
  },

  send: function (seconds) {
    var ms = Math.round(Number(seconds) * 1000);
    if (ms <= 0) {
      wx.showToast({ title: "请输入有效秒数", icon: "none" });
      return;
    }
    var url = config.motorApi;
    if (!url || url.indexOf("你的域名") !== -1) {
      this.setData({ statusText: "请在 miniprogram/config.js 中配置 motorApi 为你的服务器地址" });
      wx.showToast({ title: "请先配置服务器地址", icon: "none" });
      return;
    }
    var that = this;
    this.setData({ statusText: "发送中…" });
    wx.request({
      url: url,
      method: "POST",
      header: { "content-type": "application/json" },
      data: { time: ms },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          that.setData({ statusText: "✅ 指令已发送" });
          wx.showToast({ title: "已发送", icon: "success" });
        } else {
          var msg = (res.data && res.data.errMsg) ? res.data.errMsg : ("请求失败 " + res.statusCode);
          that.setData({ statusText: "❌ " + msg });
          wx.showToast({ title: msg, icon: "none" });
        }
      },
      fail: function (err) {
        var msg = err.errMsg || String(err);
        that.setData({ statusText: "❌ " + msg });
        wx.showToast({ title: "请求失败", icon: "none" });
      },
    });
  },

  onJog: function (e) {
    var sec = parseFloat(e.currentTarget.dataset.sec);
    this.send(sec);
  },

  onManualRun: function () {
    var sec = parseFloat(this.data.manualTime);
    if (!Number.isFinite(sec) || sec <= 0) {
      wx.showToast({ title: "请输入有效秒数", icon: "none" });
      return;
    }
    this.send(sec);
  },

  onSetDaily: function () {
    if (this._dailyTimer) {
      clearInterval(this._dailyTimer);
      this._dailyTimer = null;
    }
    var timeStr = this.data.dailyTime;
    var duration = parseFloat(this.data.dailyDuration);
    if (!timeStr || !Number.isFinite(duration) || duration <= 0) {
      wx.showToast({ title: "请选择时间并填写运行秒数", icon: "none" });
      return;
    }
    var parts = timeStr.split(":");
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var that = this;
    this._dailyTimer = setInterval(function () {
      var now = new Date();
      if (
        now.getHours() === h &&
        now.getMinutes() === m &&
        now.getSeconds() === 0
      ) {
        that.send(duration);
      }
    }, 1000);
    this.setData({
      statusText: "⏰ 已设置：每天 " + timeStr + " 运行 " + duration + " 秒（需保持小程序在前台）",
    });
    wx.showToast({ title: "定时已设置", icon: "success" });
  },
});
