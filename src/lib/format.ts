export function formatPrice(amount: number): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${grouped}đ`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;

  return `${km.toFixed(1).replace('.', ',')}km`;
}

export function formatDiscount(price: number, originalPrice: number): string | null {
  if (originalPrice <= 0 || price >= originalPrice) return null;

  return `-${Math.round((1 - price / originalPrice) * 100)}%`;
}

export function formatRadius(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;

  return `${km}km`;
}

const WEEKDAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

const pad = (value: number) => value.toString().padStart(2, '0');

// "Chủ Nhật, 20/09/2026" — Intl trên Android/Hermes không có sẵn locale tiếng Việt nên tự dựng chuỗi.
export function formatFullDate(date: Date): string {
  const weekday = WEEKDAY_NAMES[date.getDay()] ?? '';

  return `${weekday}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// "20/09/2026" — dạng ngắn cho các dòng thông tin phụ.
export function formatShortDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
