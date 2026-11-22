/*
 * 豆瓣开屏广告真正的来源：feature_switch
 *
 * 106 号包实测，frodo.douban.com/api/v2/feature_switch 的 46KB 配置里带着 splash_sdk_info，
 * 内容是一条京准通开屏：
 *   id         = jztSplashSDK|147296|2033281326|267175
 *   ad_type    = jztSplashSDK
 *   duration   = 5000        <- 正好对上截图里的「跳过 4」
 *   unit       = dale_dacp_douban
 *   render_type= template
 *
 * 这意味着开屏广告根本不走 splash_bid：配置接口每次冷启动直接把广告塞进 feature_switch，
 * 所以 bid 返回 {} 也没用、删 App 也没用、断网也能播（配置是磁盘缓存的）。
 *
 * 这个脚本只做一件事：把 splash_sdk_info 清成空数组，其余 94 个配置项原样返回。
 */

if ($response.status === 200 && $response.body) {
  try {
    var o = JSON.parse($response.body);
    var changed = false;

    if (Array.isArray(o.splash_sdk_info) && o.splash_sdk_info.length > 0) {
      o.splash_sdk_info = [];
      changed = true;
    } else if (o.splash_sdk_info === undefined) {
      o.splash_sdk_info = [];
      changed = true;
    }

    // 开屏已经拿不到广告了，这些超时只是让启动页白等，全部清零
    var fast = {
      enable_splash_client_bid: false,
      splash_client_bid_use_preload: false,
      splash_bid_timeout: 0,
      splash_ad_fetch_timeout: 0,
      splash_show_timeout: 0,
      splash_mi_timeout: 0,
      enable_sdk_ad: false
    };
    for (var k in fast) { if (o[k] !== fast[k]) { o[k] = fast[k]; changed = true; } }

    // 顺手兜住可能出现的其他开屏配置键
    if (o.splash_ad) { o.splash_ad = null; changed = true; }
    if (Array.isArray(o.splash_ads) && o.splash_ads.length > 0) { o.splash_ads = []; changed = true; }

    $done({ body: JSON.stringify(o) });
  } catch (e) {
    // 解析失败就原样放行，绝不因为脚本报错把整个配置接口搞坏
    $done({});
  }
} else {
  $done({});
}
