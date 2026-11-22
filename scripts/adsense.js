/**
 * adsense.js — 广告联盟「喂假数据」脚本
 *
 * 思路来源：app2smile/rules 的 adsense.js（blockAds.plugin 内的联盟净化开关）
 *
 * 核心区别：
 *   REJECT 域名 = SDK 认为网络出错 → 降级播本地缓存
 *   改响应为「无填充」= SDK 认为服务端没广告 → 直接不播
 *
 * 覆盖三个联盟：
 *   穿山甲  api-access.pangolin-sdk-toutiao.com / is.snssdk.com
 *   优量汇  mi.gdt.qq.com                       （实测走 POST，不区分 GET/POST）
 *   快手    open.e.kuaishou.com
 */

const url = $request.url;

if (!$response || !$response.body) {
  $done({});
}

let body;
try {
  body = JSON.parse($response.body);
} catch (e) {
  $done({});
}

if (typeof body !== 'object' || body === null) {
  $done({});
}

// 穿山甲：20001 = 无广告填充
// 只认 get_ads / bidding 这类真正拉广告的路径，settings 之类的辅助接口不动
if (url.indexOf('pangolin-sdk-toutiao.com') !== -1 || url.indexOf('is.snssdk.com') !== -1) {
  if (url.indexOf('/api/ad/union/sdk') !== -1 || url.indexOf('get_ads') !== -1) {
    $done({
      body: JSON.stringify({
        request_id: 'F5617E54-3FF4-4052-9B09-4227D09B5105',
        status_code: 20001,
        reason: 112,
        desc: '该代码位请求量过大且消耗过低，因此填充率控制在10%以内，该策略每日生效'
      })
    });
  }
  $done({});
}

// 优量汇：102006 = 无广告返回
// 实测 49/50 号包全部是 POST，所以这里不判断 method
if (url.indexOf('mi.gdt.qq.com') !== -1) {
  if ('ret' in body) {
    body.ret = 102006;
  } else {
    body.ret = 102006;
  }
  $done({ body: JSON.stringify(body) });
}

// 快手联盟：40003 = 无广告返回
if (url.indexOf('open.e.kuaishou.com') !== -1) {
  body.result = 40003;
  $done({ body: JSON.stringify(body) });
}

$done({});
