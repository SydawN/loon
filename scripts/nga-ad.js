/**
 * NGA App 去广告脚本
 * 适用：Loon / Surge / Quantumult X (http-response)
 *
 * 匹配接口（__lib=app_inter 下的三个广告相关 act）：
 *   banner_list      开屏 / 横幅广告
 *   recmd_topic      信息流推广帖
 *   get_event_app    活动入口图标
 *
 * 注意：static_file_list 不要动，它可能是正常静态资源清单，
 *      拦截后 App 会缺图或白屏。
 */

const url = $request.url;

if (/__act=(banner_list|recmd_topic|get_event_app)/.test(url)) {
  $done({
    body: JSON.stringify({ return: 1, result: [] }),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
} else {
  // 其他 app_inter 接口放行
  $done({});
}
