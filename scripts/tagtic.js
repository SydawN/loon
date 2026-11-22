// tagtic.js — 改写百度联盟 TagTic 的策略应答（NGA 开屏的真实上游）
// https://github.com/SydawN/loon
//
// 76/77 号包定位到的链路：
//   g1.tagtic.cn/v2/strategy/openscreen  → {"result":true}   服务器放行开屏
//   g1.tagtic.cn/sdk/v1/ios-init         → {"init":{"splashMaximumWaitingTime":3}}  开屏最多等 3 秒
//   g1.tagtic.cn/v3/ad/aggregation       → {"data":[{"unionInfo":{"positionId":"9089843431196082"}}]}  下发优量汇广告位
//   然后 App 才去 mi.gdt.qq.com?posid=9089843431196082 拉广告
//
// 为什么不用 REJECT-DICT 直接拦：
//   拦掉之后 App 拿不到 ios-init，会用内置默认的 3 秒超时继续等，
//   结果是「有广告」换成「白等 3 秒」，启动一样慢。必须改应答才能真跳过。
//
// 关键字段：
//   openscreen.result = false     服务器明确拒绝开屏
//   splashMaximumWaitingTime = 0  开屏最大等待时间归零，不等直接进首页
//   aggregation.data = []         聚合层不再下发任何广告位 ID，下游 mi.gdt.qq.com 不会被调用

(function () {
  const url = $request.url;

  function reply(obj, status) {
    return $done({
      status: status || 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(obj)
    });
  }

  // ---- 开屏策略：明确返回不放行 ----
  // 原始返回是 201 + {"code":0,"message":"success","result":true}
  if (/\/v2\/strategy\/openscreen/.test(url)) {
    return reply({ code: 0, message: "success", result: false });
  }

  // ---- 是否请求广告：同样置否 ----
  if (/\/v2\/strategy\/isrequest/.test(url)) {
    return reply({ code: 0, message: "success", result: false });
  }

  // ---- SDK 初始化：把开屏等待时间与超时时间归零 ----
  // 保留原始结构里的其余字段，避免 SDK 判配置不完整而回退默认值
  if (/\/sdk\/v1\/ios-init/.test(url)) {
    return reply({
      code: 0,
      data: {
        init: {
          gdtSplashTimeoutInterval: 0,
          isInitOPT: true,
          isShowlog: false,
          nativeFeedNoPicPlaceIds: [],
          partnerSplashTimeoutInterval: 0,
          splashMaximumWaitingTime: 0,
          timeoutInterval: 0
        },
        usecache: 0
      },
      msg: "OK"
    });
  }

  // ---- 聚合层：不再下发任何广告位 ----
  // 原始返回 result:1 + data 里带 unionInfo.positionId（就是优量汇的 posid）
  if (/\/v3\/ad\/aggregation/.test(url)) {
    return reply({ result: 1, message: "success", data: [] });
  }

  // ---- 视频预加载：本来就没队列，让它保持空 ----
  if (/\/v2\/ad\/pre\/video/.test(url)) {
    return reply({ result: 0, message: "no queue" });
  }

  $done({});
})();
