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
        if (Array.isArray(item.EXTRA_ADS_RULES)) item.EXTRA_ADS_RULES = [];
        if (Array.isArray(item.intro001)) {
          // 关键：不能把 intro001 清成 []，那会让 App 认为「服务端无配置」而回退内置默认开屏
          // 正确做法是只保留穿山甲类型，穿山甲接口已被 404 拦住，开屏拿不到素材
          // 必须摘掉 type=com.dn 那条：它走 NGA 自有图床 img.nga.178.com，不走任何联盟
          const kept = item.intro001.filter(function (x) {
            return x && typeof x === 'object' && x.type !== 'com.dn';
          });
          item.intro001 = kept.length ? kept : [{ type: 'com.bytedance' }];
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
