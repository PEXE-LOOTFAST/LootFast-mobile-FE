import type { DayOfWeek, MerchantOpeningHoursDto } from '@/features/seller/types/api';

// Backend tính "ngày" theo giờ Việt Nam (UTC+7, không có giờ mùa hè) bất kể múi giờ của máy, nên
// mọi phép so sánh ngày và giờ ở đây cũng phải theo giờ VN chứ không theo giờ máy.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Dời mốc sang giờ VN: đọc bằng getUTC* hoặc toISOString sẽ ra giờ trên đồng hồ ở VN. */
const toVietnamClock = (value: Date | string | number) =>
  new Date(new Date(value).getTime() + VN_OFFSET_MS);

/** Ngày theo lịch VN, dạng "2026-10-09". */
export const vietnamDateKey = (value: Date | string | number) =>
  toVietnamClock(value).toISOString().slice(0, 10);

const DAYS: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export const toDealNumber = (value: string) => Number(value.replace(/\D/g, ''));

/** Mốc thời gian ISO → "18:00" theo giờ VN, để đổ ngược vào ô nhập. */
export function toTimeInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return toVietnamClock(date).toISOString().slice(11, 16);
}

/** "18:00" → mốc thời gian hôm nay (theo ngày VN). */
function toTodayAt(value: string) {
  return new Date(`${vietnamDateKey(Date.now())}T${value}:00+07:00`);
}

/**
 * Một deal chỉ có một khung giờ: vừa là lúc deal hiển thị và nhận đặt, vừa là phạm vi người mua
 * được chọn giờ đến lấy. Backend không còn nhận pickupStartsAt/pickupEndsAt riêng.
 */
export type DealSchedule = {
  saleStartsAt: string;
  saleEndsAt: string;
};

/** Khung giờ mở cửa của quán hôm nay ("08:00"–"22:00"), undefined nếu hôm nay quán không mở. */
export function todayOpeningSlot(openingHours: MerchantOpeningHoursDto | undefined) {
  const today = DAYS[toVietnamClock(Date.now()).getUTCDay()];

  return openingHours?.slots.find((slot) => slot.dayOfWeek === today);
}

/**
 * Dựng hai mốc thời gian backend cần từ khung giờ người bán nhập. Trả về chuỗi lỗi khi khung giờ
 * không hợp lệ, để màn hình hiện ngay thay vì để backend từ chối.
 *
 * `openingHours`: giờ mở cửa của quán; khung giờ deal phải nằm gọn trong khung hôm nay, nếu không
 * backend chặn lúc đăng (DEAL_OUTSIDE_OPENING_HOURS).
 *
 * Dùng chung giữa màn đăng deal mới và màn sửa bản nháp, vì cả hai gửi cùng một payload.
 */
export function buildDealSchedule(
  open: string,
  close: string,
  options: { openingHours?: MerchantOpeningHoursDto } = {},
): { schedule: DealSchedule } | { error: string } {
  const saleStart = toTodayAt(open);
  const saleEnd = toTodayAt(close);

  if (saleStart >= saleEnd) {
    return { error: 'Giờ đóng deal phải sau giờ mở bán.' };
  }
  // Backend chặn đăng deal mà giờ đóng đã trôi qua; báo sớm để người bán sửa ngay tại form.
  if (Date.now() >= saleEnd.getTime()) {
    return { error: 'Giờ đóng deal đã qua. Chọn giờ muộn hơn hoặc đăng vào ngày mai.' };
  }

  if (options.openingHours) {
    const slot = todayOpeningSlot(options.openingHours);
    if (!slot) return { error: 'Hôm nay quán không mở cửa nên chưa đăng deal được.' };
    if (open < slot.opensAt || close > slot.closesAt) {
      return {
        error: `Khung giờ deal phải nằm trong giờ mở cửa hôm nay (${slot.opensAt}–${slot.closesAt}).`,
      };
    }
  }

  return {
    schedule: { saleStartsAt: saleStart.toISOString(), saleEndsAt: saleEnd.toISOString() },
  };
}
