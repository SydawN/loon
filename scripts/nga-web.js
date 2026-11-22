/**
 * NGA 网页版广告模块删除脚本
 *
 * 原理：NGA 网页（ngabbs.com / bbs.nga.cn）的广告完全由三个静态 JS 驱动：
 *   - js_dslist_default.js  广告位清单 + loadGroup 分组加载
 *   - js_dscommon.js        cacheLoadByName 实际渲染入口
 *   - js_default.js         insAdsChk 全屏插页广告
 * 本脚本在响应末尾追加覆盖代码，把这三个入口函数打成空实现。
 *
 * 适用范围：Safari / 任意浏览器访问 ngabbs.com
 * 不适用：NGA iOS 客户端（App 内广告位在二进制里，与本 JS 无关）
 */

const url = $request.url;
let body = $response.body || '';

const PATCH = {
    'js_dslist_default.js':
        '\n;try{ngaAds.length=0;ngaAds.loadGroup=function(){};ngaAds.cacheLoadByName=function(){};}catch(e){}',
    'js_dscommon.js':
        '\n;try{ngaAds.cacheLoadByName=function(){};ngaAds.cacheLoadByNameOrg=function(){};}catch(e){}',
    'js_default.js':
        '\n;try{commonui.insAdsChk=function(){};}catch(e){}'
};

let hit = false;
for (const key of Object.keys(PATCH)) {
    if (url.indexOf(key) !== -1) {
        body += PATCH[key];
        hit = true;
        break;
    }
}

$done(hit ? { body } : {});
