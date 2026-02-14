// 电机控制接口：请改成你自己服务器的地址（需在微信公众平台配置 request 合法域名）
// 接口约定：POST 请求，body 为 JSON { time: number }（毫秒），成功返回可任意
module.exports = {
  motorApi: "http://106.52.3.29:8083/mqtt",
};
