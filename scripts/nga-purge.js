// nga-purge.js — 清空 NGA 的广告位配置与首页运营位
// https://github.com/SydawN/loon
//
// 目标接口：nuke.php?__lib=app_inter&__act=static_file_list
//   result[1].EXTRA_ADS_RULES  服务端下发的广告位规则（INTRO_INTVAL 开屏间隔 / FORUM_INTVAL 信息流）
//   result[2].intro001         开屏广告的直接配置
//
// 关键结构（33 号包原始值）：
//   intro001: [
//     { adid:'intro001', date:[{start:1735693201,end:1735833599},{start:1736006401,end:1767283199}],
//       rate:100, type:'com.bytedance', opt:0 },
//     { adid:'intro001', date:[{start:1735693201,end:1767283199}],
//       rate:100, type:'com.dn', resurl:'https://img.nga.178.com/...', targeturl:'...' }
//   ]
//
// 踩过的三个坑（按顺序）：
//   1. 把 intro001 清成 []      → App 判「无配置」，回退内置默认开屏（穿山甲），广告 3/3 恶化
//   2. 把 EXTRA_ADS_RULES 清成 [] → 同上，回退默认
//   3. 给一条没有 date 的假配置  → App 判「无时间限制」，照常展示、照常倒计时
//                              广告画面没了，但白等 4 秒（72 号包实测：827ms 业务请求全部完成，
//                              之后 3973ms 一片空白，就是开屏在那空转）
//
// 正确解：date 过期(start:0,end:0) + rate:0。App 判「当前时间不在窗口内」且「展示概率为零」，
// 双保险直接跳过开屏流程，不加载素材、不启动倒计时。

if (/__act=static_file_list/i.test($request.url)) {
  try {
    const obj = JSON.parse($response.body);

    if (obj && Array.isArray(obj.result)) {
      obj.result.forEach(function (item) {
        if (!item || typeof item !== 'object') return;

        // ---- 广告位规则：改成过去时间窗 ----
        // 保留 id 与结构，App 才会正常解析后判定「未生效」，而不是判「配置缺失」
        if (Array.isArray(item.EXTRA_ADS_RULES)) {
          item.EXTRA_ADS_RULES = [
            { id: 'INTRO_INTVAL', client: 'IOS', start: 0, end: 0, adsid: '0', value: '0' },
            { id: 'FORUM_INTVAL', client: 'IOS,>=10.1.36,ANDROID', start: 0, end: 0, adsid: '', value: '0' },
            { id: 'TOPIC_REWARDADFREE', client: 'IOS,ANDROID', start: 0, end: 0, img: '', value: '0' }
          ];
        }

        // ---- 开屏配置：date 过期 + rate 归零 ----
        // 必须带 adid/date/rate/type 四个字段，App 才会走完整解析流程并判定失效。
        // 少任何一个都可能被当成「配置异常」而回退默认。
        if (Array.isArray(item.intro001)) {
          item.intro001 = [
            {
              adid: 'intro001',
              date: [{ start: 0, end: 0 }],
              rate: 0,
              type: 'com.dn',
              resurl: 'https://img4.nga.cn/ngabbs/medal/260.gif',
              targeturl: ''
            },
            {
              adid: 'intro001',
              date: [{ start: 0, end: 0 }],
              rate: 0,
              type: 'com.bytedance',
              opt: 0
            }
          ];
        }
      });
    }

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    // 解析失败就原样放行。不要返回空 body，否则 App 判网络错误
    $done({});
  }
} else if (/__act=banner_list/i.test($request.url)) {
  // 首页顶部横幅位
  $done({ body: '{"code":0,"msg":"操作成功","result":[]}' });
} else if (/__act=recmd_topic/i.test($request.url)) {
  // 首页推荐主题流
  $done({ body: '{"code":0,"msg":"操作成功","result":[]}' });
} else if (/__act=get_event_app/i.test($request.url)) {
  // 活动入口
  $done({ body: '{"code":0,"msg":"","result":[]}' });
} else {
  $done({});
}
