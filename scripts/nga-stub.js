// NGA 启动加速 · 请求阶段短路
// 原理：Loon 的 http-request 脚本可以在「请求发出之前」直接构造响应（$done({response})）
// 请求根本不出网，省掉 DNS + TCP + TLS + 服务端处理的全链路耗时（实测每条 400~700ms）
//
// 与 http-response 的本质区别：
//   http-response 是「先出网拿真响应，再改写」——省不了时间，只能省广告
//   http-request  是「根本不出网，本地编一个响应」——省时间也省广告
//
// 只短路「内容确定无用」的接口。凡是返回真实数据的（load_topic、iflogin、notify）一律不动。

(function () {
  const url = $request.url;

  // 统一构造 JSON 响应，status 固定 200
  // 注意：不能返回 404/空 body。SDK 会把 404 判成「网络故障」而降级读本地缓存，广告反而复活
  function json(obj) {
    return {
      response: {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(obj)
      }
    };
  }

  // ---- 1. 穿山甲：拉广告 + SDK 配置 ----
  // 实测 712ms / 457ms / 429ms。原响应"填充率控制在10%以内"本身就是无广告，
  // 我们只是把它搬到本地生成，SDK 收到的字段一模一样。
  if (/api-access\.pangolin-sdk-toutiao\.com\/api\/ad\/union\/sdk\/(get_ads|settings)/.test(url)) {
    return $done(json({
      request_id: "00000000-0000-0000-0000-000000000000",
      status_code: 20001,
      reason: 112,
      desc: "no fill"
    }));
  }

  // ---- 2. 优量汇：广告位请求 ----
  // 实测 412ms / 287ms
  if (/^https:\/\/mi\.gdt\.qq\.com\//.test(url)) {
    return $done(json({ ret: 102006, msg: "no ad" }));
  }

  // ---- 3. NGA 自有广告位接口 ----
  // get_event_app 524ms、banner_list 424+108ms、recmd_topic 353+203ms
  // 这三个原本就被 nga-purge.js 改写成空数组，现在提前到请求阶段直接编
  if (/ngabbs\.com\/nuke\.php/.test(url)) {
    if (/__act=get_event_app/.test(url)) {
      return $done(json({ code: 0, msg: "", result: [] }));
    }
    if (/__act=banner_list/.test(url)) {
      return $done(json({ code: 0, msg: "操作成功", result: [] }));
    }
    if (/__act=recmd_topic/.test(url)) {
      return $done(json({ code: 0, msg: "操作成功", result: [] }));
    }
  }

  // 其余全部放行，交给系统正常请求
  $done({});
})();
