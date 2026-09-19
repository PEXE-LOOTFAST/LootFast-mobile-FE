import { useMemo, useState } from 'react';

import { WEEKDAY_LABELS } from '@/features/order/constants/order-status';
import type { Order } from '@/features/order/types';

export type DailySaving = { key: string; label: string; amount: number };

const DAY_MS = 24 * 60 * 60 * 1000;

const savingOf = (order: Order) => Math.max(order.originalPrice - order.price, 0) * order.quantity;

// Chỉ đơn đã hoàn thành mới được ghi nhận tiết kiệm (giá gốc - giá deal).
export function useOrderSavings(orders: Order[]) {
  // Chốt mốc thời gian lúc mount để trục 7 ngày không đổi giữa các lần render.
  const [now] = useState(() => Date.now());

  return useMemo(() => {
    const completed = orders.filter((order) => order.status === 'completed');
    const total = completed.reduce((sum, order) => sum + savingOf(order), 0);

    // 7 ngày gần nhất, ngày hôm nay nằm cuối trục.
    const daily: DailySaving[] = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now - (6 - index) * DAY_MS);
      const key = date.toDateString();
      const amount = completed
        .filter((order) => order.completedAt && new Date(order.completedAt).toDateString() === key)
        .reduce((sum, order) => sum + savingOf(order), 0);

      return { key, label: WEEKDAY_LABELS[date.getDay()] ?? '', amount };
    });

    return { total, daily };
  }, [orders, now]);
}
