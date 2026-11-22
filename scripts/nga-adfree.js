/**
 * nga-adfree.js —— 让 NGA 客户端认为当前账号已免除广告
 *
 * 原理：app_api.php?__lib=user&__act=detail 的响应里有一个 adfree 字段，
 *      实测返回 "adfree": 0（不免广告）。本脚本把它改成 1。
 *
 * 适用：Loon / Surge (http-response)，需要 MITM ngabbs.com
 *
 * 重要限制：
 *   1. 开屏广告的 SDK 初始化可能早于本接口返回，脚本对开屏未必有效；
 *   2. adfree 也许是只控制站内广告位，不控制第三方联盟广告；
 *   3. 只改本地收到的响应，不上传、不写回服务端，不影响账号数据。
 *
 * 若无效，说明 NGA 的广告展示完全由本地 SDK 决定，没有服务端开关可钻。
 */

let body = $response.body;

if (body) {
  try {
    const obj = JSON.parse(body);
    if (obj && obj.result && typeof obj.result.adfree !== 'undefined') {
      obj.result.adfree = 1;
      $done({ body: JSON.stringify(obj) });
    }
  } catch (e) {
    // 解析失败则原样返回
  }
}

$done({});
