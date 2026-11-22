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

  // ---- 开屏四件套改由策略层 REJECT-DICT 处理，本脚本不再接管 ----
  // api.douban.com 同时承载账号/登录接口，为降低「登录不上」的风险，
  // 本版不对该域名开启 MITM，也不在这里做任何改写。

  // ---- amonsul 广告总开关 ----
  // 本版原样放行、不改写、不拦截。上一版把它改成 {"on":0,...} 是唯一一条
  // 没有实测支撑的改动，已回滚。

  $done({});
})();
