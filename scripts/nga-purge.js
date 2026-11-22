// nga-purge.js — 清空 NGA 的广告位配置与首页运营位
// https://github.com/SydawN/loon
//
// 核心：nuke.php?__lib=app_inter&__act=static_file_list 的响应里，
//   result[1].EXTRA_ADS_RULES  服务端下发的广告位清单（INTRO_INTVAL 开屏 / FORUM_INTVAL 信息流）
//   result[2].intro001         开屏广告的直接配置（type=com.bytedance 穿山甲 / type=com.dn NGA自有）
// 把这两处清空，App 不会再去初始化广告 SDK 拉素材，开屏与信息流广告位一起消失。
//
// 附带：清空首页顶部横幅(banner_list)、推荐主题流(recmd_topic)、活动入口(get_event_app)。

const url = $request.url;
const EMPTY = '{"code":0,"msg":"操作成功","result":[]}';

if (/__act=static_file_list/i.test(url)) {
  try {
    const obj = JSON.parse($response.body);
    if (obj && Array.isArray(obj.result)) {
      obj.result.forEach(function (item) {
        if (!item || typeof item !== 'object') return;
        if (Array.isArray(item.EXTRA_ADS_RULES)) {
          // 原始结构（13~33 号包一致）：
          //   [{id:'INTRO_INTVAL', client:'IOS', start:1764345600, end:2076633801, adsid:'98231', value:'180'},
          //    {id:'FORUM_INTVAL', client:'IOS,>=10.1.36,ANDROID', ... adsid:'98336,...', value:'10,10'},
          //    {id:'TOPIC_REWARDADFREE', client:'IOS,ANDROID', ... img:'...appadfreeww.webp', value:'20,30'}]
          //
          // 之前清成 [] 是错的：App 视为「无配置」，回退内置默认开屏，广告照样播。
          // 正确做法是保留结构、把生效窗口(start/end)改成过去时间，
          // App 判断「当前时间不在窗口内」→ 直连跳过开屏，也不会去请求穿山甲。
          item.EXTRA_ADS_RULES = [
            { id: 'INTRO_INTVAL', client: 'IOS', start: 0, end: 0, adsid: '0', value: '0' },
            { id: 'FORUM_INTVAL', client: 'IOS,>=10.1.36,ANDROID', start: 0, end: 0, adsid: '', value: '0' },
            { id: 'TOPIC_REWARDADFREE', client: 'IOS,ANDROID', start: 0, end: 0, img: '', value: '0' }
          ];
        }
        if (Array.isArray(item.intro001)) {
          // 服务端实测返回 intro001: []
          // 空数组会让 App 回退到内置默认开屏（穿山甲），这就是开屏广告清不掉的原因
          // 所以给一个「假配置」：type=com.dn 是 App 识别的类型，resurl 指向一张 427 字节的勋章图
          // App 会正常走开屏流程、加载这张小图，放大后几乎空白，但不再是广告
          item.intro001 = [{
            type: 'com.dn',
            resurl: 'https://img4.nga.cn/ngabbs/medal/260.gif',
            targeturl: ''
          }];
        }
      });
    }
    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    $done({});
  }
} else if (/__act=banner_list/i.test(url)) {
  $done({ body: EMPTY });
} else if (/__act=recmd_topic/i.test(url)) {
  $done({ body: EMPTY });
} else if (/__act=get_event_app/i.test(url)) {
  $done({ body: '{"code":0,"msg":"","result":[]}' });
} else {
  $done({});
}
