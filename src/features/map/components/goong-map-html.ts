// Trang HTML chạy trong WebView: vẽ nền Goong bằng MapLibre GL JS (Goong cung cấp style tương thích)
// và nhận trạng thái từ app qua window.__apply. Dùng WebView thay vì thư viện bản đồ native để
// chạy được trong Expo Go mà không phải build lại ứng dụng.
const MAPLIBRE_VERSION = '4.7.1';

type MapHtmlOptions = {
  styleUrl: string;
  center: { latitude: number; longitude: number };
  zoom: number;
};

export function buildMapHtml({ styleUrl, center, zoom }: MapHtmlOptions) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css" rel="stylesheet" />
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
  .pin { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.12s; }
  .pin.selected { transform: scale(1.2); z-index: 2; }
  .bubble { min-width: 44px; box-sizing: border-box; text-align: center; padding: 4px 8px; border: 2px solid #fff; border-radius: 14px; background: var(--pin); color: #fff; font: 900 13px sans-serif; }
  .tip { width: 0; height: 0; margin-top: -1px; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid var(--pin); }
  .pin.selected .bubble { background: var(--sel); color: #3b2400; }
  .pin.selected .tip { border-top-color: var(--sel); }
  .user { width: 18px; height: 18px; box-sizing: border-box; border: 3px solid #fff; border-radius: 50%; background: var(--user); box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.25); }
</style>
</head>
<body>
<div id="map"></div>
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

  var loaded = false;
  map.on('load', function () { loaded = true; post({ type: 'ready' }); });
  // Lỗi tải ô bản đồ lẻ tẻ là bình thường; chỉ báo lỗi khi style chưa tải được (sai khoá, mất mạng).
  map.on('error', function () { if (!loaded) post({ type: 'error' }); });
  map.on('click', function () { post({ type: 'deselect' }); });

  var markers = {};
  var pinsKey = '';
  var userMarker = null;
  var lastCenter = '';
  var lastRecenter = -1;

  window.__apply = function (state) {
    var root = document.documentElement.style;
    root.setProperty('--pin', state.colors.pin);
    root.setProperty('--sel', state.colors.selected);
    root.setProperty('--user', state.colors.user);

    var key = state.pins.map(function (p) { return [p.id, p.lng, p.lat, p.label].join(':'); }).join('|');
    if (key !== pinsKey) {
      pinsKey = key;
      Object.keys(markers).forEach(function (id) { markers[id].marker.remove(); });
      markers = {};
      state.pins.forEach(function (pin) {
        var el = document.createElement('div');
        el.className = 'pin';
        var bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = pin.label;
        var tip = document.createElement('div');
        tip.className = 'tip';
        el.appendChild(bubble);
        el.appendChild(tip);
        el.addEventListener('click', function (event) {
          event.stopPropagation();
          post({ type: 'select', id: pin.id });
        });
        var marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([pin.lng, pin.lat])
          .addTo(map);
        markers[pin.id] = { marker: marker, el: el };
      });
    }
    Object.keys(markers).forEach(function (id) {
      markers[id].el.classList.toggle('selected', id === state.selectedId);
    });

    if (state.user) {
      if (!userMarker) {
        var dot = document.createElement('div');
        dot.className = 'user';
        userMarker = new maplibregl.Marker({ element: dot }).setLngLat(state.user).addTo(map);
      } else {
        userMarker.setLngLat(state.user);
      }
    } else if (userMarker) {
      userMarker.remove();
      userMarker = null;
    }

    var centerKey = state.center.join(',');
    if (centerKey !== lastCenter || state.recenterKey !== lastRecenter) {
      lastCenter = centerKey;
      lastRecenter = state.recenterKey;
      map.flyTo({ center: state.center, zoom: ${zoom}, duration: 800 });
    }
  };
})();
</script>
</body>
</html>`;
}
