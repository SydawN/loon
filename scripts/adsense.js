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
 *   穿山甲  api-access.pangolin-sdk-toutiao.com / is.snssdk.com  (POST get_ads)
 *   优量汇  mi.gdt.qq.com                                        (GET gdt_mview.fcg)
 *   快手    open.e.kuaishou.com                                  (POST rest/e/v3/open/univ)
 */

const url = $request.url;
const method = ($request.method || '').toUpperCase();

if (!$response.body) {
    $done({});
}

let body;
try {
    body = JSON.parse($response.body);
} catch (e) {
    $done({});
}

const POST = 'POST';
const GET = 'GET';

if ((url.indexOf('api-access.pangolin-sdk-toutiao.com/api/ad/union/sdk') !== -1
        || url.indexOf('is.snssdk.com/api/ad/union/sdk') !== -1)
    && method === POST) {
    // 穿山甲：20001 = 无广告填充
    if (!body.message) {
        if (!('status_code' in body)) {
            $done({});
        }
        $done({});
    }
    body = {
        request_id: 'F5617E54-3FF4-4052-9B09-4227D09B5105',
        status_code: 20001,
        reason: 112,
        desc: '该代码位请求量过大且消耗过低，因此填充率控制在10%以内，该策略每日生效'
    };
} else if (url.indexOf('mi.gdt.qq.com') !== -1 && method === GET) {
    // 优量汇：102006 = 无广告返回
    if ('ret' in body && body.ret === 0) {
        body.ret = 102006;
    }
} else if (url.indexOf('open.e.kuaishou.com') !== -1 && method === POST) {
    // 快手联盟：40003 = 无广告返回
    if (body.result === 1) {
        body.result = 40003;
    }
} else {
    $done({});
}

$done({ body: JSON.stringify(body) });
