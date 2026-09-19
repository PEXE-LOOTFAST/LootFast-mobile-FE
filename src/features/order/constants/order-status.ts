import type { OrderStatus } from '@/features/order/types';

export const ORDER_STATUS_TABS: { id: OrderStatus; label: string }[] = [
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'confirmed', label: 'Đã xác nhận' },
  { id: 'ready', label: 'Sẵn sàng nhận' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export const ORDER_STATUS_LABELS = Object.fromEntries(
  ORDER_STATUS_TABS.map((tab) => [tab.id, tab.label]),
) as Record<OrderStatus, string>;

/** Nhãn trục ngang biểu đồ 7 ngày, theo thứ tự Date.getDay() (0 = Chủ nhật). */
export const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
