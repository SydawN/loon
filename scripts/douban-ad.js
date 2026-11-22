/**
 * 豆瓣 App 去广告脚本
 * 适用：Loon / Surge / Quantumult X (http-response)
 *
 * 匹配接口：
 *   frodo.douban.com/api/v2/home_ads          首页广告位
 *   frodo.douban.com/api/v2/home_banner       首页横幅（含广告）
 *   frodo.douban.com/api/v2/erebor/feed_ad    信息流广告（小组话题流）
 *   frodo.douban.com/api/v2/group/{id}/ad     小组页广告位
 *   api.douban.com/v2/app_ads/splash_*        开屏竞价 / 预加载 / 展示上报
 *
 * 说明：以上接口实测返回体均为 JSON 对象，不是数组，
 *      因此回落空对象 {} 而不是 []，避免 App 解析异常。
 */

const EMPTY = '{}';

$done({
  body: EMPTY,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});
