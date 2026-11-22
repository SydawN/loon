/*
 * 帖子列表（信息流）广告：frodo.douban.com/api/v2/erebor/feed_ad
 *
 * 118 号包实测，该接口返回三个键：
 *   ad_info     { ad_id:267276, unit_name:dale_group_topic_ad ... 48 个字段 }
 *   sdk_ads     [ { ad_type: pangolinExpressSDK ... } ]
 *   blocked_cids [ ... ]
 * 148KB 的响应里绝大部分是广告素材与监控链接。
 *
 * 做法：保留三键结构（App 解析不会崩），把 ad_info 置 null、sdk_ads 清空。
 * 这样列表里不再插入广告卡片，其他内容原样保留。
 */

if ($response.status === 200 && $response.body) {
  try {
    var o = JSON.parse($response.body);
    if (o && typeof o === 'object') {
      if ('ad_info' in o) o.ad_info = null;
      if (Array.isArray(o.sdk_ads)) o.sdk_ads = [];
    }
    $done({ body: JSON.stringify(o) });
  } catch (e) {
    $done({});
  }
} else {
  $done({});
}
