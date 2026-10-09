// Trang HTML cho WebView chọn vị trí: cùng nền Goong với bản đồ của người mua để toạ độ người bán
// chọn hiện đúng chỗ khi người mua xem. Ghim cố định ở giữa màn hình, người bán kéo bản đồ để căn
// ghim vào đúng chỗ (ngón tay không che ghim); vị trí chọn là tâm bản đồ khi dừng kéo.
const MAPLIBRE_VERSION = '4.7.1';

type PickerHtmlOptions = {
  styleUrl: string;
  center: { latitude: number; longitude: number };
  zoom: number;
  pinColor: string;
};

export function buildPickerHtml({ styleUrl, center, zoom, pinColor }: PickerHtmlOptions) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css" rel="stylesheet" />
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
  #pin { position: absolute; left: 50%; top: 50%; z-index: 5; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); transition: transform 0.15s; pointer-events: none; }
  #pin.moving { transform: translate(-50%, calc(-100% - 12px)); }
  #pin .head { width: 30px; height: 30px; box-sizing: border-box; border: 3px solid #fff; border-radius: 50%; background: ${pinColor}; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35); }
  #pin .tip { width: 0; height: 0; margin-top: -2px; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 11px solid ${pinColor}; }
  #dot { position: absolute; left: 50%; top: 50%; z-index: 4; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; background: rgba(0, 0, 0, 0.35); pointer-events: none; }
</style>
</head>
<body>
<div id="map"></div>
<div id="dot"></div>
<div id="pin"><div class="head"></div><div class="tip"></div></div>
<script src="https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js"></script>
<script>
(function () {
  function post(message) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
  window.onerror = function () { post({ type: 'error' }); };
  if (typeof maplibregl === 'undefined') { post({ type: 'error' }); return; }

  var map = new maplibregl.Map({
    container: 'map',
    style: ${JSON.stringify(styleUrl)},
    center: ${JSON.stringify([center.longitude, center.latitude])},
    zoom: ${zoom}
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  var pin = document.getElementById('pin');

  var loaded = false;
  map.on('load', function () { loaded = true; post({ type: 'ready' }); });
  // Lỗi tải ô bản đồ lẻ tẻ là bình thường; chỉ báo lỗi khi style chưa tải được (sai khoá, mất mạng).
  map.on('error', function () { if (!loaded) post({ type: 'error' }); });

  // Nhấc ghim lên khi đang kéo, hạ xuống và báo toạ độ tâm khi dừng.
  map.on('movestart', function () {
    pin.classList.add('moving');
    post({ type: 'moving' });
  });
  map.on('moveend', function () {
    pin.classList.remove('moving');
    var c = map.getCenter();
    post({ type: 'pick', lat: c.lat, lng: c.lng });
  });

  window.__setCenter = function (lng, lat) {
    map.flyTo({ center: [lng, lat], zoom: 17, duration: 600 });
  };
})();
</script>
</body>
</html>`;
}
