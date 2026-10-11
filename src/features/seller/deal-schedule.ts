import type { MerchantDealDto } from '@/features/seller/api/merchant-deals';
import type { DayOfWeek, MerchantOpeningHoursDto } from '@/features/seller/types/api';
import { TIME_PATTERN } from '@/lib/validation';

/** Backend bắt buộc chốt đơn trước giờ nhận ít nhất 15 phút (ORDER_CUTOFF). */
const ORDER_CUTOFF_MS = 15 * 60 * 1000;

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

export type DealSchedule = {
  saleStartsAt: string;
  saleEndsAt: string;
  pickupStartsAt: string;
  pickupEndsAt: string;
};

/** Cùng tập trạng thái mà backend tính là "đã đăng" khi kiểm tra lịch chung của quán. */
const PUBLISHED_STATUSES: MerchantDealDto['status'][] = ['ACTIVE', 'HIDDEN', 'SOLD_OUT'];

/**
 * Backend bắt mọi deal đã đăng của quán trong cùng một ngày dùng chung đúng bốn mốc thời gian
 * (STORE_SCHEDULE_CONFLICT). Nếu hôm nay quán đã có deal như vậy thì trả về khung giờ của nó để
 * deal mới dùng lại y nguyên; chưa có thì người bán tự chọn.
 */
export function findSharedDaySchedule(
  deals: MerchantDealDto[],
  excludeDealId?: string,
): DealSchedule | undefined {
  const today = vietnamDateKey(Date.now());
  const shared = deals.find(
    (deal) =>
      deal.dealId !== excludeDealId &&
      PUBLISHED_STATUSES.includes(deal.status) &&
      vietnamDateKey(deal.saleStartsAt) === today,
  );

  if (!shared) return undefined;

  return {
    saleStartsAt: shared.saleStartsAt,
    saleEndsAt: shared.saleEndsAt,
    pickupStartsAt: shared.pickupStartsAt,
    pickupEndsAt: shared.pickupEndsAt,
  };
}

/**
 * Giải thích giờ khách còn đặt được. Backend chốt đơn 15 phút trước giờ bắt đầu nhận và chỉ hiện
 * deal cho người mua khi còn trong khung bán, nên deal sẽ biến mất khỏi trang người mua đúng giờ
 * này dù còn suất; người bán cần biết trước điều đó.
 */
export function describeSaleCutoff(open: string, shared?: DealSchedule): string | null {
  const saleEnd = shared
    ? new Date(shared.saleEndsAt)
    : TIME_PATTERN.test(open)
      ? new Date(toTodayAt(open).getTime() - ORDER_CUTOFF_MS)
      : null;
  if (!saleEnd) return null;

  const time = toTimeInput(saleEnd.toISOString());
  const minutesLeft = Math.floor((saleEnd.getTime() - Date.now()) / 60_000);
  if (minutesLeft <= 0) return `Khung bán đã đóng lúc ${time}, khách không đặt được nữa.`;

  const remaining = minutesLeft <= 60 ? ` (còn ${minutesLeft} phút)` : '';

  return `Khách đặt giữ chỗ được đến ${time}${remaining}, sau đó deal ẩn khỏi trang người mua dù còn suất. Muốn bán lâu hơn, hãy chọn giờ nhận muộn hơn.`;
}

/** Khung giờ mở cửa của quán hôm nay ("08:00"–"22:00"), undefined nếu hôm nay quán không mở. */
export function todayOpeningSlot(openingHours: MerchantOpeningHoursDto | undefined) {
  const today = DAYS[toVietnamClock(Date.now()).getUTCDay()];

  return openingHours?.slots.find((slot) => slot.dayOfWeek === today);
}

/**
 * Dựng bốn mốc thời gian backend cần từ khung giờ nhận người bán nhập. Trả về chuỗi lỗi khi
 * khung giờ không hợp lệ, để màn hình hiện ngay thay vì để backend từ chối.
 *
 * `shared`: khung giờ chung của hôm nay (xem findSharedDaySchedule) — có thì dùng nguyên, bỏ
 * qua giờ nhập vì bốn mốc phải trùng khít từng mili giây với các deal đã đăng.
 * `openingHours`: giờ mở cửa của quán; giờ nhận món phải nằm gọn trong khung hôm nay.
 *
 * Dùng chung giữa màn đăng deal mới và màn sửa bản nháp, vì cả hai gửi cùng một payload.
 */
export function buildDealSchedule(
  open: string,
  close: string,
  options: { shared?: DealSchedule; openingHours?: MerchantOpeningHoursDto } = {},
): { schedule: DealSchedule } | { error: string } {
  if (options.shared) {
    if (Date.now() >= new Date(options.shared.saleEndsAt).getTime()) {
      return {
        error: 'Khung giờ chung của quán hôm nay đã hết hạn bán. Hãy đăng deal vào ngày mai.',
      };
    }

    return { schedule: options.shared };
  }

  const pickupStart = toTodayAt(open);
  const pickupEnd = toTodayAt(close);
  const saleEnd = new Date(pickupStart.getTime() - ORDER_CUTOFF_MS);
  // Làm tròn xuống phút để mốc bắt đầu bán gọn gàng, vẫn không vượt quá hiện tại.
  const saleStart = new Date(Math.floor(Date.now() / 60_000) * 60_000);

  if (pickupStart >= pickupEnd) {
    return { error: 'Giờ kết thúc nhận phải sau giờ bắt đầu nhận.' };
  }
  if (saleStart >= saleEnd) {
    return { error: 'Giờ bắt đầu nhận phải cách hiện tại ít nhất 15 phút.' };
  }

  if (options.openingHours) {
    const slot = todayOpeningSlot(options.openingHours);
    if (!slot) return { error: 'Hôm nay quán không mở cửa nên chưa đăng deal được.' };
    if (open < slot.opensAt || close > slot.closesAt) {
      return {
        error: `Giờ nhận món phải nằm trong giờ mở cửa hôm nay (${slot.opensAt}–${slot.closesAt}).`,
      };
    }
  }

  return {
    schedule: {
      saleStartsAt: saleStart.toISOString(),
      saleEndsAt: saleEnd.toISOString(),
      pickupStartsAt: pickupStart.toISOString(),
      pickupEndsAt: pickupEnd.toISOString(),
    },
  };
}
