import { useMemo } from 'react';

import type { SellerDeal, SellerOrder } from '@/features/seller/types';

const countsAsSale = (order: SellerOrder) =>
  order.status === 'confirmed' || order.status === 'completed';

// Báo cáo cơ bản cộng dồn trên toàn bộ deal và đơn của quán, tính tại chỗ, chưa gọi API.
export function useSellerReport(deals: SellerDeal[], orders: SellerOrder[]) {
  return useMemo(() => {
    const completedCount = orders.filter((order) => order.status === 'completed').length;
    const noShowCount = orders.filter((order) => order.status === 'no-show').length;
    // Tỷ lệ chỉ xét các đơn đã tới hạn nhận: hoặc khách đã lấy, hoặc khách không tới.
    const settledCount = completedCount + noShowCount;

    return {
      revenue: orders.filter(countsAsSale).reduce((sum, order) => sum + order.total, 0),
      completedCount,
      cancelledCount: orders.filter((order) => order.status === 'cancelled').length,
      noShowRate: settledCount > 0 ? noShowCount / settledCount : 0,
      dealCount: deals.length,
      portionsSold: deals.reduce((sum, deal) => sum + deal.portionsSold, 0),
    };
  }, [deals, orders]);
}
