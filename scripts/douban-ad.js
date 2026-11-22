// douban-ad.js — 豆瓣广告位应答改写
// https://github.com/SydawN/loon
//
// 全部结构来自 14 号包实测（豆瓣 7.138.0 iOS）：
//
//   frodo.douban.com/api/v2/home_ads           → {"cache_duration": 7200}   真实的无广告响应
//   frodo.douban.com/api/v2/home_banner        → {"ad_id":"271298","bg_img":"https://img3.doubanio.com/view/dale-online/dale_ad/public/..."}
//   frodo.douban.com/api/v2/erebor/feed_ad     → {"ad_info":{"ad_id":"267019","monitor_urls":["https://open.e.kuaishou.com/..."]}}  58688 字节
//   frodo.douban.com/api/v2/group/751504/ad    → {}   原样就是空对象
//   api.douban.com/v2/app_ads/splash_bid       → {}   开屏竞价
//   api.douban.com/v2/app_ads/splash_preload   → {}
//   api.douban.com/v2/app_ads/splash_show      → {}
//   api.douban.com/v2/app_ads/splash_statistics→ {}
//   amonsul.douban.com/check2                  → {"on":1,"num_limit":200,"time_limit":30}  广告总开关
//
// 上一版对 home_ads 也返回裸 {}，缺了 cache_duration，App 会当成非法缓存指令并丢掉整个首页块。
// 这是「正常内容打不开」的原因之一，另一个是 MITM 把 img*.doubanio.com 图片 CDN 也开了。

(function () {
  const url = $request.url;

  function reply(obj) {
    return $done({
      body: JSON.stringify(obj),
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  // ---- 首页广告位：必须带 cache_duration ----
  if (/\/api\/v2\/home_ads/.test(url)) {
    return reply({ cache_duration: 7200 });
  }

  // ---- 首页横幅：裸对象，置空即无横幅 ----
  if (/\/api\/v2\/home_banner/.test(url)) {
    return reply({});
  }

  // ---- 信息流广告：小组话题流里插的那一条 ----
  if (/\/api\/v2\/erebor\/feed_ad/.test(url)) {
    return reply({});
  }

  // ---- 小组页广告位 ----
  if (/\/api\/v2\/group\/[0-9]+\/ad/.test(url)) {
    return reply({});
  }

  // ---- 开屏四件套 ----
  if (/\/v2\/app_ads\//.test(url)) {
    return reply({});
  }

  // ---- amonsul 广告总开关 ----
  // check2 返回 {"on":1,"num_limit":200,"time_limit":30}，on=1 表示广告功能开启。
  // 置 0 让 SDK 认为广告关闭，广告接口可能整个不再请求。
  // 这条没有历史实测支撑（14 号包里只有 on=1 的样子），若发现首页模块缺失就删掉本段。
  if (/amonsul\.douban\.com\/check2/.test(url)) {
    return reply({ on: 0, num_limit: 0, time_limit: 0 });
  }

  $done({});
})();
