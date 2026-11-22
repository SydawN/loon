# loon

Loon 去广告插件合集。规则来自 iOS 客户端真实抓包（Loon 1.0 导出 HAR），不是凭猜测堆域名。

## 插件列表

| 文件 | 适用 | 依赖 MITM |
|---|---|---|
| `douban-ad.plugin` | 豆瓣 App | 是（图床 + 接口脚本） |
| `nga-ad.plugin` | NGA 官方 App | 仅字节 SDK 一条 |
| `rules/ad-domains.snippet` | 任意 App，纯分流 | 否 |

两个插件都**自包含完整联盟清单**，订一个就能挡住大部分广告 SDK。同时订阅不冲突，重复规则命中第一条即停。

## 安装

### 订阅（推荐，可自动更新）

Loon → 配置 → 插件 → 右上角 `+` → 添加：

```
https://raw.githubusercontent.com/SydawN/loon/main/douban-ad.plugin
https://raw.githubusercontent.com/SydawN/loon/main/nga-ad.plugin
```

### 手动

下载 `.plugin` 文件到 Loon 的 `Plugin` 目录即可，`script-path` 已指向本仓库 raw 地址。

## 版本修正（v1.1，2026-11-22）

v1.0 的 `nga-ad.plugin` 用脚本清空了 `app_inter` 的三个接口，**这是错的**。对 129 条真实抓包逐条解析后发现：

| 接口 | v1.0 以为是 | 实际是 |
|---|---|---|
| `__act=banner_list` | 开屏横幅广告 | BLG 夺冠、使命召唤、鬼武者评测等**官方运营轮播**，全部指向站内 tid |
| `__act=recmd_topic` | 信息流推广帖 | 站内推荐话题（`type=3`），指向站内 tid |
| `__act=get_event_app` | 活动入口广告 | 原神 7.2 签到等**官方活动** |

清空它们只会让官方运营位消失，对商业广告毫无作用。真正的广告走穿山甲 SDK 和百度联盟，不经过 `app_inter`。v1.1 已下线该脚本，只保留域名分流（`scripts/nga-ad.js` 留存但已停用，仅防旧地址 404）。

## 各自做了什么

### douban-ad.plugin

**豆瓣专属**

- `erebor.douban.com` — 广告点击跳转中间页与曝光计数
- `img*.doubanio.com/view/dale-online/` — 广告图床路径 `dale_ad`，与头像 `icon/`、帖子图 `view/group_topic/` 不重叠

**接口改写（脚本）**

把下列接口返回体改成 `{}`，这是去掉信息流广告卡片的唯一办法，因为它们的数据来自豆瓣自家 API：

- `frodo.douban.com/api/v2/home_ads`、`home_banner`、`erebor/feed_ad`、`group/{id}/ad`
- `api.douban.com/v2/app_ads/splash_*`

实测依据：开屏竞价里同时出现穿山甲（site 5003518）、优量汇（app 1106295950）、京准通（site 147296）；信息流广告 `unit_name` 为 `dale_group_topics_feed`，曝光监测走快手联盟。

### nga-ad.plugin

纯分流，不含脚本。拦截百度联盟、穿山甲、优量汇、快手联盟、京准通、阿里妈妈，外加 NGA 实测到的优酷 DSP、腾讯设备 ID、UC 广告策略。

`m.baidu.com/baidu.php` 这条特别重要：实测广告点击会经它 302 到 App Store，而它是**明文 http**，所以 `URL-REGEX` 不需要 MITM 就能生效。

## 开屏与插屏广告为什么挡不住（重要）

2026-11-22 第三次抓包（95 条，含冷启动）给出了决定性证据：**整份 HAR 只有一条广告相关请求**——

```
https://sigcdn.oss-cn-beijing.aliyuncs.com/icon/ylg_logo.png   1.2 KB
```

这是优量汇的联盟角标（开屏右下角那个「G 广告」标识里的 G 就是广点通/GDT）。除此之外，`pangle.io`、`gdt.qq.com`、百度联盟全部**零请求**。

结论：**域名规则已经生效，广告素材不再下载了。你看到的开屏广告是优量汇 SDK 从本地缓存里读出来直接渲染的，不经过网络。**

SDK 缓存的有效期通常是几天到几周，期间无论怎么改规则都会继续展示。三个解法按性价比排序：

1. **清缓存**：iOS 设置 → 通用 → iPhone 储存空间 → NGA → 删除 App，重装。重装后第一次打开时保持 Loon 规则开启，让新素材拉取失败。
2. **走非大陆节点**：NGA 的第三方联盟广告只投大陆流量，走海外代理打开时广告位直接不出。这是社区里验证过的土办法，代价是 NGA 访问速度。
3. **买会员**：NGA 付费会员声明可免除第三方联盟广告（Android 9.6.7+ / PC / H5）。iOS 端是否生效存在争议，有用户反馈仍能看到开屏，谨慎看待。

`nga-ad.plugin` 里那条 `sigcdn.oss-cn-beijing.aliyuncs.com` 只能让角标裂图，去不掉广告画面，属于聊胜于无。如果发现某处正常图片裂了，把这条去掉。

## 排查：规则到底有没有生效

最容易被忽略的两点：

1. **`URL-REGEX` 匹配 https 必须 MITM**。没开 MITM 或证书未信任时，所有 https 的 URL 规则静默失效，表现就是"插件装了但没用"。
2. **验证方法**：抓包看目标域名返回码。如果 `lf-cdn-tos.bytescm.com/obj/static/ad/...` 还能返回 200/404，说明请求真的发出去了，规则没命中；被 REJECT 时请求根本不会出现在 HAR 里。

如果域名规则和脚本都不生效，先检查是不是被前面的 `GEOIP,CN,DIRECT` 或 `FINAL` 规则抢了匹配，Loon 是从上往下第一条命中为止。

## 明确不拦截的域名

| 域名 | 原因 |
|---|---|
| `amonsul.douban.com` | 豆瓣监控/风控上报，拦截可能触发异常监测 |
| `dypnsapi-dualstack.aliyuncs.com` | 阿里云一键登录 |
| `1253747176.trtcube-license.cn` | 腾讯视频云 license |
| `119.29.29.90` / `.96` / `.98` | DNSPod HTTPDNS，拦截后整机解析变慢 |
| `frodo.douban.com` 非广告接口 | 豆瓣正常业务 API |
| `img*.doubanio.com` 非 `dale-online` 路径 | 头像、帖子正文图 |
| `ngabbs.com` 的 `app_inter` 接口 | 官方运营内容，见上文修正说明 |

## 已知限制

1. `pangle.io`、`pangolin-sdk-toutiao.com`、`pglstatp-toutiao.com` 在海外 DNS 下解析不到记录，本机无法验证其存活。域名规则为空转，写进去无副作用，境内网络下若存在则立即生效。
2. 广告 SDK 域名两三个月会换一轮，尤其字节系。失效属于正常现象，重新抓包即可。
3. 穿山甲 SDK 会**缓存**已下发的广告素材与配置，刚装规则后开屏可能还会出现几次，等缓存过期。
4. 广告域名清单里的联盟域名来自行业通用集合 + 本次实测交叉验证，未逐一在 NGA/豆瓣客户端里复现。

## 免责

仅供个人学习与自用。规则会改动客户端接口返回体，不排除未来 App 更新后出现异常。出问题先停用对应插件，定位到具体接口再逐条放开。
