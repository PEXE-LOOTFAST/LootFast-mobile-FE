/** Backend bắt buộc chốt đơn trước giờ nhận ít nhất 15 phút (ORDER_CUTOFF). */
const ORDER_CUTOFF_MS = 15 * 60 * 1000;

export const toDealNumber = (value: string) => Number(value.replace(/\D/g, ''));

/** Mốc thời gian ISO → "18:00" theo giờ máy, để đổ ngược vào ô nhập. */
export function toTimeInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

/**
 * "18:00" → mốc thời gian hôm nay. Backend bắt cả bốn mốc (bán và nhận) nằm trong cùng một
 * ngày theo lịch Việt Nam, nên chỉ đăng được deal trong ngày và máy phải để đúng múi giờ VN.
 */
function toTodayAt(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);

  return date;
}

export type DealSchedule = {
  saleStartsAt: string;
  saleEndsAt: string;
  pickupStartsAt: string;
  pickupEndsAt: string;
};

/**
 * Dựng bốn mốc thời gian backend cần từ khung giờ nhận người bán nhập. Trả về chuỗi lỗi khi
 * khung giờ không hợp lệ, để màn hình hiện ngay thay vì để backend từ chối.
 *
 * Dùng chung giữa màn đăng deal mới và màn sửa bản nháp, vì cả hai gửi cùng một payload.
 */
export function buildDealSchedule(
  open: string,
  close: string,
): { schedule: DealSchedule } | { error: string } {
  const pickupStart = toTodayAt(open);
  const pickupEnd = toTodayAt(close);
  const saleEnd = new Date(pickupStart.getTime() - ORDER_CUTOFF_MS);
  const saleStart = new Date();

  if (pickupStart >= pickupEnd) {
    return { error: 'Giờ kết thúc nhận phải sau giờ bắt đầu nhận.' };
  }
  if (saleStart >= saleEnd) {
    return { error: 'Giờ bắt đầu nhận phải cách hiện tại ít nhất 15 phút.' };
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
