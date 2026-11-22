/*
 * 列表里的广告卡片不是 feed_ad 给的，是列表接口直接把广告当成一条内容塞进数组里：
 *
 *   /api/v2/group/<id>/topics       topics[4].is_ad = true, 带 ad_info（只有 7 个键的假帖子）
 *   /api/v2/elendil/recommend_feed  items[4] / items[10] 带 ad_info（31 键，伪装成普通条目）
 *   /api/v2/group/topic/<id>        帖子详情页顶部，顶层 ad_info + can_show_ad
 *
 * 所以只把 feed_ad 置空，App 已经按列表里的数据把广告位建好了，等 feed_ad 回来再撤，
 * 就出现「闪一下再消失」。这里在列表响应到达时就删掉广告条目，广告位根本不会被创建。
 */

var url = ($request && $request.url) || '';

function done(o) {
  $done({ body: JSON.stringify(o) });
}

if ($response.status === 200 && $response.body) {
  try {
    var o = JSON.parse($response.body);

    // 小组帖子列表：广告是一条 is_ad 为 true 的假帖子
    if (Array.isArray(o.topics)) {
      o.topics = o.topics.filter(function (t) { return !(t && t.is_ad); });
    }

    // 推荐流：广告是带 ad_info 的普通条目
    if (Array.isArray(o.items)) {
      o.items = o.items.filter(function (it) { return !(it && it.ad_info); });
    }

    // 帖子详情：顶部广告位
    if ('ad_info' in o) o.ad_info = null;
    if ('can_show_ad' in o) o.can_show_ad = false;

    done(o);
  } catch (e) {
    $done({});
  }
} else {
  $done({});
}
