import { useMemo, useState } from 'react';

import { WEEKDAY_LABELS } from '@/features/order/constants/order-status';
import type { SellerDeal, SellerOrder } from '@/features/seller/types';

export type DailySale = { key: string; label: string; portions: number };

const DAY_MS = 24 * 60 * 60 * 1000;

const isRunning = (deal: SellerDeal) => deal.status === 'running';
const isSoldOut = (deal: SellerDeal) => deal.portionsSold >= deal.portionsTotal;
const countsAsSale = (order: SellerOrder) =>
  order.status === 'confirmed' || order.status === 'completed';

// Toàn bộ số liệu trang Tổng quan được tính tại chỗ từ deal và đơn của quán, chưa gọi API.
export function useSellerOverview(deals: SellerDeal[], orders: SellerOrder[]) {
  // Chốt mốc thời gian lúc mount để trục 7 ngày không đổi giữa các lần render.
  const [now] = useState(() => Date.now());

  return useMemo(() => {
    const today = new Date(now).toDateString();
    const runningDeals = deals.filter(isRunning);
    const ordersToday = orders.filter(
      (order) => new Date(order.createdAt).toDateString() === today,
    );
    const paidToday = ordersToday.filter(countsAsSale);

    const portionsTotal = runningDeals.reduce((sum, deal) => sum + deal.portionsTotal, 0);
    const portionsSold = deals.reduce((sum, deal) => sum + deal.portionsSold, 0);
    const soldOutCount = runningDeals.filter(isSoldOut).length;

    // 7 ngày gần nhất, ngày hôm nay nằm cuối trục.
    const weekly: DailySale[] = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now - (6 - index) * DAY_MS);
      const key = date.toDateString();
      const portions = orders
        .filter((order) => countsAsSale(order) && new Date(order.createdAt).toDateString() === key)
        .reduce((sum, order) => sum + order.quantity, 0);

      return { key, label: WEEKDAY_LABELS[date.getDay()] ?? '', portions };
    });

    const weekKeys = new Set(weekly.map((day) => day.key));
    const weekOrders = orders.filter((order) =>
      weekKeys.has(new Date(order.createdAt).toDateString()),
    );
    const weekPaidOrders = weekOrders.filter(countsAsSale);

    return {
      revenueToday: paidToday.reduce((sum, order) => sum + order.total, 0),
      orderCountToday: ordersToday.length,
      pendingPickupCount: ordersToday.filter((order) => order.status === 'confirmed').length,
      pendingConfirmCount: orders.filter((order) => order.status === 'pending').length,
      runningDealCount: runningDeals.length,
      portionsLeft: Math.max(portionsTotal - portionsSold, 0),
      portionsSold,
      soldOutCount,
      soldOutRate: runningDeals.length > 0 ? soldOutCount / runningDeals.length : 0,
      weekly,
      weekOrderCount: weekOrders.length,
      weekRevenue: weekPaidOrders.reduce((sum, order) => sum + order.total, 0),
      weekPortions: weekPaidOrders.reduce((sum, order) => sum + order.quantity, 0),
      upcomingOrders: orders.filter((order) => order.status === 'confirmed'),
    };
  }, [deals, orders, now]);
}
