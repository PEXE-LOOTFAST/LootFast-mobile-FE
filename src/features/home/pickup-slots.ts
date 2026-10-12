/**
 * Người mua chọn một khoảng giờ đến lấy nằm trong khung giờ của deal (backend bắt buộc gửi
 * pickupFrom/pickupTo khi đặt đơn). Khung deal được cắt thành các lát 30 phút cho dễ chọn; lát
 * cuối ngắn hơn nếu khung không chia hết.
 */
export type PickupSlot = {
  /** Mốc ISO gửi lên backend. */
  from: string;
  to: string;
  /** Nhãn "18:00 – 18:30" theo giờ máy. */
  label: string;
};

const SLOT_MINUTES = 30;
const SLOT_MS = SLOT_MINUTES * 60 * 1000;

const pad = (value: number) => value.toString().padStart(2, '0');
const toLabel = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/**
 * Cắt khung giờ deal thành các lát chọn được, bỏ lát đã kết thúc. Lát đang diễn ra vẫn giữ nhưng
 * bắt đầu từ hiện tại, vì khách đến ngay lúc này chứ không quay ngược về đầu lát.
 */
export function buildPickupSlots(
  windowStartIso: string,
  windowEndIso: string,
  now: number = Date.now(),
): PickupSlot[] {
  const windowStart = new Date(windowStartIso).getTime();
  const windowEnd = new Date(windowEndIso).getTime();
  if (Number.isNaN(windowStart) || Number.isNaN(windowEnd) || windowStart >= windowEnd) return [];

  const slots: PickupSlot[] = [];

  for (let start = windowStart; start < windowEnd; start += SLOT_MS) {
    const end = Math.min(start + SLOT_MS, windowEnd);
    if (end <= now) continue;

    // Lát đang diễn ra: dời điểm bắt đầu lên hiện tại, làm tròn phút cho gọn.
    const from = start > now ? start : Math.ceil(now / 60_000) * 60_000;
    if (from >= end) continue;

    slots.push({
      from: new Date(from).toISOString(),
      to: new Date(end).toISOString(),
      label: `${toLabel(new Date(from))} – ${toLabel(new Date(end))}`,
    });
  }

  return slots;
}
