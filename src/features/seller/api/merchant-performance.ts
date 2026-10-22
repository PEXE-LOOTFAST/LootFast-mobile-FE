import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';

export type DailyPerformance = {
  date: string;
  completedRevenue: number;
  discountedPortions: number;
  customerSavings: number;
};

export type TopDeal = {
  dealId: string;
  name: string;
  completedOrders: number;
  discountedPortions: number;
  completedRevenue: number;
};

export type MerchantPerformanceDto = {
  from: string;
  to: string;
  timezone: string;
  placedOrders: number;
  ordersByStatus: Record<string, number>;
  completedRevenue: number;
  discountedPortions: number;
  customerSavings: number;
  daily: DailyPerformance[];
  topDeals: TopDeal[];
};

export const MERCHANT_PERFORMANCE_QUERY_KEY = ['merchant', 'performance'];

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fetchPerformance(from: string, to: string) {
  return apiRequest<MerchantPerformanceDto>(
    `/merchants/me/reports/performance?from=${from}&to=${to}`,
  );
}

export function useMerchantPerformance(from: Date, to: Date) {
  const fromStr = toDateString(from);
  const toStr = toDateString(to);

  return useQuery({
    queryKey: [...MERCHANT_PERFORMANCE_QUERY_KEY, fromStr, toStr],
    queryFn: () => fetchPerformance(fromStr, toStr),
    staleTime: 60 * 1000,
  });
}
