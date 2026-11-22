# loon

Loon 去广告插件合集。规则来自 iOS 客户端真实抓包（Loon 1.0 导出 HAR），不是凭猜测堆域名。

## 插件列表

| 文件 | 适用 | 依赖 MITM |
|---|---|---|
| `douban-ad.plugin` | 豆瓣 App | 是 |
| `nga-ad.plugin` | NGA 官方 App | 是 |
| `rules/ad-domains.snippet` | 任意 App，纯分流 | 否 |

## 安装

### 订阅（推荐，可自动更新）

Loon → 配置 → 插件 → 右上角 `+` → 添加：

```
https://raw.githubusercontent.com/SydawN/loon/main/douban-ad.plugin
https://raw.githubusercontent.com/SydawN/loon/main/nga-ad.plugin
```

### 手动

下载 `.plugin` 文件到 Loon 的 `Plugin` 目录，插件内的 `script-path` 已指向本仓库 raw 地址，无需额外配置。

## 各自做了什么

### douban-ad.plugin

**分流拦截（8 条）**

- `erebor.douban.com` — 豆瓣广告点击跳转中间页 + 曝光计数
- `img*.doubanio.com/view/dale-online/` — 豆瓣广告图床路径（`dale_ad`），与正常头像 `icon/`、帖子图 `view/group_topic/` 不重叠，不会误删正文图
- `webcast-open.douyin.com` — 穿山甲配置拉取
- `lf-cdn-tos.bytescm.com/obj/static/ad/` — 字节 playable 广告 SDK
- `unet.quark.cn` — 穿山甲广告展示监测
- `open.e.kuaishou.com` — 快手联盟曝光监测
- `h-adashx4bc.ut.taobao.com`、`userlink.alicdn.com` — 阿里 adash 埋点与 deeplink
- `dg.k.jd.com`、`orbit.jd.com` — 京东京准通 / 开普勒落地

**接口改写（2 条脚本）**

拦截上述域名只能去掉素材和跳转，信息流里那张广告卡片还在（显示灰块）。所以用 `http-response` 脚本把下面接口的返回体改成 `{}`：

- `frodo.douban.com/api/v2/home_ads`
- `frodo.douban.com/api/v2/home_banner`
- `frodo.douban.com/api/v2/erebor/feed_ad`
- `frodo.douban.com/api/v2/group/{id}/ad`
- `api.douban.com/v2/app_ads/splash_*`（statistics / preload / bid / show）

实测依据：一次开屏竞价里豆瓣同时向穿山甲（site 5003518）、优量汇（app 1106295950）、京准通（site 147296）询价，信息流广告 `unit_name` 为 `dale_group_topics_feed`，曝光监测走快手联盟。

### nga-ad.plugin

NGA 的广告不走独立域名，而是自家 `nuke.php?__lib=app_inter` 下发，所以分流只能挡住第三方追踪，真正的广告位必须改接口返回：

- `__act=banner_list` — 开屏 / 横幅
- `__act=recmd_topic` — 信息流推广帖
- `__act=get_event_app` — 活动入口

`static_file_list` 故意未处理，它可能是正常静态资源清单。

## 注意事项

1. **必须开启 MITM 并安装证书**，否则 HTTPS 的 URL 规则与脚本都不会生效。
2. `img*.doubanio.com` 是前缀通配。若 Loon 不识别，改成逐个列 `img1.doubanio.com` 到 `img9.doubanio.com`。
3. 只 MITM 图床，别写成 `*.doubanio.com`，否则豆瓣所有图片都解密，耗电和延迟明显上升。
4. 如果首页顶部某个**官方**运营位消失，把 `home_banner` 从 `douban-ad-feed` 的 pattern 里去掉，只留 `home_ads` 与 `feed_ad`。
5. `apiVersion` / `date` 字段用于识别版本，改动插件后请同步更新 `date`。
6. GitHub raw 在国内可能不稳定，加载慢或失败时改用镜像加速地址，或手动导入插件文件。
7. 这些域名属于**会被下架/更换**类型，广告 SDK 域名两三个月就可能变一轮，失效属于正常现象，重新抓包即可。

## 明确不拦截的域名

| 域名 | 原因 |
|---|---|
| `amonsul.douban.com` | 豆瓣监控/风控上报，拦截可能触发异常监测 |
| `dypnsapi-dualstack.aliyuncs.com` | 阿里云一键登录 |
| `1253747176.trtcube-license.cn` | 腾讯视频云 license |
| `119.29.29.90` / `.96` | DNSPod HTTPDNS，拦截后整机解析变慢 |
| `www.jd.com/error2.aspx` | 广告跳转失败的错误页，被动结果，reject 无意义 |
| `img*.doubanio.com` 非 `dale-online` 路径 | 头像、帖子正文图 |

## 免责

仅供个人学习与自用。规则会改动客户端接口返回体，不排除未来 App 更新后出现异常。出问题先停用对应插件，定位到具体接口再逐条放开。
