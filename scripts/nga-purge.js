// nga-purge.js — 清空 NGA 首页运营位
// https://github.com/SydawN/loon
// 作用：把 NGA 服务端下发的顶部横幅轮播(banner_list)、推荐主题流(recmd_topic)、
//       活动入口(get_event_app) 的 result 全部清空，App 收到空数组后不渲染这些模块。
// 不影响帖子列表(subject/list)、首页板块树(home/category)、用户信息(user/detail)。

const url = $request.url;
const EMPTY_ARR  = '{"code":0,"msg":"操作成功","result":[]}';

if (/__act=banner_list/i.test(url)) {
  $done({ body: EMPTY_ARR });
} else if (/__act=recmd_topic/i.test(url)) {
  $done({ body: EMPTY_ARR });
} else if (/__act=get_event_app/i.test(url)) {
  $done({ body: '{"code":0,"msg":"","result":[]}' });
} else {
  $done({});
}
