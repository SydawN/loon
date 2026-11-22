/**
 * nga-adfree.js —— 让 NGA 客户端认为当前账号已免除广告
 * 原理：user&__act=detail 响应里 adfree 字段实测为 0，改成 1
 *
 * 适用：Loon / Surge (http-response)，需要 MITM ngabbs.com
 *
 * 限制：开屏 SDK 初始化可能早于本接口返回，对开屏未必有效；
 *      只改本地响应，不上传、不写回服务端，不影响账号数据。
 */

const url = $request.url;

// 只处理 user detail，其余 app_api.php 请求原样放行
if (!/__lib=user/.test(url) || !/__act=detail/.test(url)) {
  $done({});
} else {
  let body = $response.body;
  if (body) {
    try {
      const obj = JSON.parse(body);
      if (obj && obj.result && typeof obj.result.adfree !== 'undefined') {
        obj.result.adfree = 1;
        $done({ body: JSON.stringify(obj) });
      } else {
        $done({});
      }
    } catch (e) {
      $done({});
    }
  } else {
    $done({});
  }
}
