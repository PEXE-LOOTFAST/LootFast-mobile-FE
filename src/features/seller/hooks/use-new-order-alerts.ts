import { useEffect, useMemo, useRef } from 'react';

import { useMerchantOrders } from '@/features/seller/api/use-merchant-orders';
import { useNow } from '@/hooks/use-now';
import { haptics } from '@/lib/haptics';
import { formatTime } from '@/lib/format';
import { showToast } from '@/lib/toast';

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDayMs = (ms: number) => {
  const date = new Date(ms);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

/**
 * Báo người bán khi có đơn mới đặt hôm nay, ở bất kỳ tab nào của khu người bán. Dùng chung truy
 * vấn đơn trong ngày với mục "Đơn hàng đến" (cùng khoá, tự làm mới 30 giây/lần) nên không gọi API
 * thêm. Lần tải đầu chỉ ghi nhận đơn đã có, không báo; chỉ đơn xuất hiện sau đó mới báo.
 *
 * Chỉ chạy khi app đang mở. Báo cả khi app đóng cần push notification từ backend.
 */
export function useNewOrderAlerts(enabled: boolean) {
  const { dayStart, orders, waitingCount } = useTodayOrders(enabled);

  // Đơn đã thấy, theo ngày: qua ngày mới thì bắt đầu lại để không báo dồn đơn của ngày mới.
  const seen = useRef<{ day: number; ids: Set<string> } | null>(null);

  useEffect(() => {
    if (!orders) return;

    if (seen.current?.day !== dayStart) {
      seen.current = { day: dayStart, ids: new Set(orders.map((order) => order.orderId)) };
      return;
    }

    const known = seen.current.ids;
    const fresh = orders.filter(
      (order) => order.orderStatus === 'RESERVED' && !known.has(order.orderId),
    );
    orders.forEach((order) => known.add(order.orderId));
    if (fresh.length === 0) return;

    haptics.success();
    const first = fresh[0]!;
    showToast(
      fresh.length === 1
        ? `Đơn mới: ${first.dealName} × ${first.quantity}, khách lấy lúc ${formatTime(first.pickupFrom)}`
        : `${fresh.length} đơn mới vừa đặt. Mở Đơn hàng để xem.`,
      { tone: 'info', durationMs: 6000 },
    );
  }, [orders, dayStart]);

  return { waitingCount };
}

/**
 * Đơn có giờ lấy trong hôm nay. Cùng khoá truy vấn ở mọi nơi gọi (thanh tab, Báo cáo, cảnh báo đơn
 * mới) nên chỉ một lần gọi API, tự làm mới 30 giây/lần.
 */
export function useTodayOrders(enabled = true) {
  const dayStart = startOfDayMs(useNow(60_000));
  const range = useMemo(
    () => ({ from: new Date(dayStart), to: new Date(dayStart + DAY_MS) }),
    [dayStart],
  );
  const ordersQuery = useMerchantOrders(enabled ? range : null);
  const orders = ordersQuery.data?.items;
  const waitingCount = (orders ?? []).filter((order) => order.orderStatus === 'RESERVED').length;

  return { dayStart, orders, waitingCount, isLoading: ordersQuery.isLoading };
}
