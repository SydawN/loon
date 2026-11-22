if ($response.status === 200 && $response.body) {
  try {
    var o = JSON.parse($response.body);
    if (o && typeof o === 'object' && 'on' in o) {
      o.on = 0;
      if ('num_limit' in o) o.num_limit = 0;
      if ('time_limit' in o) o.time_limit = 0;
    }
    $done({ body: JSON.stringify(o) });
  } catch (e) {
    $done({});
  }
} else {
  $done({});
}
