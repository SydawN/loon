/**
 * adsense.js — 广告联盟「喂假数据」脚本（强制 200 版）
 *
 * 关键点：不能依赖原响应能 JSON.parse。
 * 服务端/拦截层返回 404 或 HTML 时，SDK 会判定「拉取失败」→ 降级播本地缓存。
 * 必须无条件返回 200 + 一份「服务端无广告填充」的应答，SDK 才会直接跳过。
 *
 *   穿山甲  status_code 20001 / reason 112
 *   优量汇  ret 102006
 *   快手    result 40003
 */

const url = $request.url;

// 穿山甲：只处理真正拉广告的路径，settings/mediation 这类辅助接口不动
if (url.indexOf('pangolin-sdk-toutiao.com') !== -1 || url.indexOf('is.snssdk.com') !== -1) {
  if (url.indexOf('/api/ad/union/sdk') !== -1 || url.indexOf('get_ads') !== -1) {
    $done({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
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

// 优量汇：无论原响应是什么（200/403/404），一律返回无广告
if (url.indexOf('mi.gdt.qq.com') !== -1) {
  $done({
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ret: 102006, msg: 'no ad' })
  });
}

// 快手联盟：同上
if (url.indexOf('open.e.kuaishou.com') !== -1) {
  $done({
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result: 40003, error_msg: 'no ad' })
  });
}

$done({});

// 穿山甲 Mediation 聚合竞价：exchange 会直接下发广告列表（实测 21537 字节）
// get_ads 被挡后 SDK 会绕道这里拿真广告，必须一并清空
if (url.indexOf('/api/ad/union/mediation/exchange') !== -1) {
  $done({
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 0, message: 'success', data: [], request_id: '' })
  });
}

// Mediation 配置：保留成功但把可用广告位清单清空
if (url.indexOf('/api/ad/union/mediation/config') !== -1) {
  $done({
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 0, message: 'success', data: {} })
  });
}
