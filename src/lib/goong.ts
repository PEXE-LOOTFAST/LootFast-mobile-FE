// Khoá "Maptiles" của Goong (https://account.goong.io/keys), dùng để tải nền bản đồ. Khoá này nằm
// trong bundle app nên ai cũng đọc được: hãy giới hạn nó theo ứng dụng trong trang quản lý Goong.
const MAPTILES_KEY = process.env.EXPO_PUBLIC_GOONG_MAPTILES_KEY;

export const isGoongConfigured = Boolean(MAPTILES_KEY);

export function goongStyleUrl(scheme: 'light' | 'dark') {
  const style = scheme === 'dark' ? 'goong_map_dark.json' : 'goong_map_web.json';

  return `https://tiles.goong.io/assets/${style}?api_key=${MAPTILES_KEY}`;
}
