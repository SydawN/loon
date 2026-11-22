/**
 * adsense.js — 广告联盟「喂假数据」脚本
 *
 * 关键经验（每一条都踩过）：
 * 1. 不能依赖原响应能 JSON.parse。服务端返回 404/HTML/加密体时，SDK 判为「拉取失败」→ 降级播本地缓存
 * 2. 必须无条件返回 200 + 「服务端无广告填充」应答，SDK 才会跳过
 * 3. 分支顺序决定生死：某个前缀一旦命中就 $done({})，后面更具体的分支永远不会执行
 *    —— 所以先判最具体的路径，再判前缀
 *
 *   穿山甲  status_code 20001 / reason 112
 *   优量汇  ret 102006
 *   快手    result 40003
 *   一号联盟 result 40003
 */

const url = $request.url;

function noFill(obj) {
  $done({
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj)
  });
}

// ============ 穿山甲（巨量）============
if (url.indexOf('pangolin-sdk-toutiao.com') !== -1 || url.indexOf('is.snssdk.com') !== -1) {

  // Mediation 聚合竞价：exchange 直接下发广告列表（实测 21697 / 19553 字节真广告）
  // 必须放最前面，否则会被下面的 $done({}) 截断
  if (url.indexOf('/api/ad/union/mediation/exchange') !== -1) {
    noFill({ code: 0, message: 'success', data: [], request_id: '' });
  }

  // Mediation 配置
  if (url.indexOf('/api/ad/union/mediation/config') !== -1) {
    noFill({ code: 0, message: 'success', data: {} });
  }

  // 真正拉广告
  if (url.indexOf('/api/ad/union/sdk') !== -1 || url.indexOf('get_ads') !== -1) {
    noFill({
      request_id: 'F5617E54-3FF4-4052-9B09-4227D09B5105',
      status_code: 20001,
      reason: 112,
      desc: '该代码位请求量过大且消耗过低，因此填充率控制在10%以内，该策略每日生效'
    });
  }

  $done({});
}

// ============ 优量汇（腾讯）============
// 49~58 号包实测全部是 POST，不能判断 method
if (url.indexOf('mi.gdt.qq.com') !== -1) {
  noFill({ ret: 102006, msg: 'no ad' });
}

// ============ 快手联盟 ============
// 只改 univ；config / logBatch 不能动，否则 SDK 初始化会失败
if (url.indexOf('open.e.kuaishou.com') !== -1) {
  if (url.indexOf('/rest/e/v3/open/univ') !== -1) {
    noFill({ result: 40003, error_msg: 'no ad' });
  }
  $done({});
}

// ============ 一号联盟 / 360（1rtb）============
if (url.indexOf('1rtb.net') !== -1) {
  noFill({ code: 40003, msg: 'no ad', result: 40003 });
}

$done({});
