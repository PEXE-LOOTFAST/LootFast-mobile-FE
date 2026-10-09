// Goong có hai loại khoá riêng, không thay thế được nhau (tạo tại https://account.goong.io/keys):
// - Maptiles Key: tải nền bản đồ.
// - API Key: dịch vụ dữ liệu như Geocode (đổi toạ độ ra địa chỉ).
// Cả hai nằm trong bundle app nên ai cũng đọc được: hãy giới hạn chúng theo ứng dụng ở trang quản lý.
const MAPTILES_KEY = process.env.EXPO_PUBLIC_GOONG_MAPTILES_KEY;
const API_KEY = process.env.EXPO_PUBLIC_GOONG_API_KEY;

export const isGoongConfigured = Boolean(MAPTILES_KEY);
export const isGoongApiConfigured = Boolean(API_KEY);

export function goongStyleUrl(scheme: 'light' | 'dark') {
  const style = scheme === 'dark' ? 'goong_map_dark.json' : 'goong_map_web.json';

  return `https://tiles.goong.io/assets/${style}?api_key=${MAPTILES_KEY}`;
}

export function goongApiUrl(path: string, params: Record<string, string>) {
  const query = new URLSearchParams({ ...params, api_key: API_KEY ?? '' });

  return `https://rsapi.goong.io${path}?${query.toString()}`;
}
