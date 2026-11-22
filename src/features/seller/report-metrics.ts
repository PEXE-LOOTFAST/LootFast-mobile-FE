import type { MerchantPerformanceDto } from '@/features/seller/api/merchant-performance';

/** Nhãn tiếng Việt cho khoá trạng thái đơn trong `ordersByStatus` (tên enum OrderStatus ở backend). */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  RESERVED: 'Đang chờ lấy',
  COMPLETED: 'Đã giao',
  CANCELLED: 'Khách huỷ',
  NO_SHOW: 'Khách không đến',
  MERCHANT_CANCELLED: 'Quán huỷ',
};

export const countByStatus = (data: MerchantPerformanceDto, status: string) =>
  data.ordersByStatus[status] ?? 0;

/**
 * Tỷ lệ khách đến lấy trong các đơn đã tới hạn: đã giao / (đã giao + không đến). Đơn còn chờ và
 * đơn huỷ chưa nói lên gì nên không tính. Chưa có đơn tới hạn thì trả null.
 */
export function pickupRate(data: MerchantPerformanceDto): number | null {
  const completed = countByStatus(data, 'COMPLETED');
  const noShow = countByStatus(data, 'NO_SHOW');
  const total = completed + noShow;

  return total === 0 ? null : Math.round((completed / total) * 100);
}

/** "2026-11-22" → "22/11/2026"; hai mốc trùng nhau thì chỉ in một ngày. */
export function formatReportPeriod(from: string, to: string): string {
  const toVn = (iso: string) => iso.split('-').reverse().join('/');

  return from === to ? toVn(from) : `${toVn(from)} – ${toVn(to)}`;
}
