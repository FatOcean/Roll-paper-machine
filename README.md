# 电机控制小程序

打开即进入电机控制面板，通过自有服务器接口控制电机（点动 / 手动 / 每天定时）。

## 使用前配置

在 `miniprogram/config.js` 中填写你的服务器接口地址（需 HTTPS），并在微信公众平台配置该域名为 request 合法域名。

接口约定：POST 请求，body 为 `{ "time": number }`（运行时长，毫秒）。
# Roll-paper-machine
