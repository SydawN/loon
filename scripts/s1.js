if ($response.status === 200 && $response.body) {
  try {
    var o = JSON.parse($response.body);
    if (Array.isArray(o.splash_sdk_info)) o.splash_sdk_info = [];
    else if (o.splash_sdk_info === undefined) o.splash_sdk_info = [];
    if (o.splash_ad) o.splash_ad = null;
    if (Array.isArray(o.splash_ads)) o.splash_ads = [];
    $done({ body: JSON.stringify(o) });
  } catch (e) {
    $done({});
  }
} else {
  $done({});
}
