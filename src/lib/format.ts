/** "30000" → "30.000". Chỉ giữ chữ số nên dán cả "30.000đ" vẫn ra đúng. */
export function formatThousands(digits: string): string {
  return digits.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

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

// "19:58" theo giờ máy.
export function formatTimeOfDay(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Chuỗi thời gian ISO từ API → "19:58" theo giờ máy; chuỗi không hợp lệ thành "--:--".
export function formatTime(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '--:--' : formatTimeOfDay(date);
}

const startOfDayMs = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

// "Hôm nay · Chủ Nhật, 11/10/2026", "Hôm qua · …", các ngày trước chỉ có phần ngày đầy đủ.
export function formatDayLabel(date: Date, now: Date = new Date()): string {
  const full = formatFullDate(date);
  const daysAgo = Math.round((startOfDayMs(now) - startOfDayMs(date)) / 86_400_000);

  if (daysAgo === 0) return `Hôm nay · ${full}`;
  if (daysAgo === 1) return `Hôm qua · ${full}`;

  return full;
}

// "20/09/2026" — dạng ngắn cho các dòng thông tin phụ.
export function formatShortDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
