import type { BadgeTone } from '@/components/ui/badge';
import type { OrderDto } from '@/features/order/api/orders';
import { formatTime } from '@/lib/format';

// Backend chuyển đơn chưa lấy sang "Không đến lấy" khi đã quá giờ hẹn 30 phút (NoShowSweeper).
const NO_SHOW_GRACE_MS = 30 * 60 * 1000;

/** "45 phút", "2 giờ", "1 giờ 20 phút". Làm tròn lên để không báo "0 phút" khi vẫn còn giờ. */
export function formatDuration(ms: number): string {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  if (minutes < 60) return `${minutes} phút`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}

export type PickupTiming = { label: string; tone: BadgeTone };

/**
 * Đơn đang giữ đang ở đâu so với giờ hẹn: chưa tới, đang trong giờ, hay đã trễ. Nói bằng thời gian
 * còn lại thay vì chỉ giờ đồng hồ, để khách biết ngay có cần đi chưa.
 */
export function getPickupTiming(
  order: Pick<OrderDto, 'pickupFrom' | 'pickupTo'>,
  now: number,
): PickupTiming {
  const from = new Date(order.pickupFrom).getTime();
  const to = new Date(order.pickupTo).getTime();

  if (Number.isNaN(from) || Number.isNaN(to)) {
    return { label: 'Xem giờ hẹn trong đơn', tone: 'neutral' };
  }
  if (now < from) {
    // Xa hơn nửa ngày thì đếm ngược không còn ý nghĩa, báo giờ là đủ.
    return from - now > 12 * 3600_000
      ? { label: `Lấy lúc ${formatTime(order.pickupFrom)}`, tone: 'primarySoft' }
      : { label: `Còn ${formatDuration(from - now)} tới giờ lấy`, tone: 'primarySoft' };
  }
  if (now <= to)
    return { label: `Đến lấy ngay · còn ${formatDuration(to - now)}`, tone: 'primary' };
  if (now <= to + NO_SHOW_GRACE_MS) {
    return {
      label: `Trễ hẹn · còn ${formatDuration(to + NO_SHOW_GRACE_MS - now)} để lấy`,
      tone: 'danger',
    };
  }

  return { label: 'Đã quá giờ lấy', tone: 'danger' };
}
