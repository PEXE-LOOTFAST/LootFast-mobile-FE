import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import type { PagedResponse } from '@/types/api';

export type PlanAudience = 'BUYER' | 'MERCHANT';

// Khớp PlanResponse của backend (GET /api/v1/premium/plans, không cần đăng nhập).
export type PremiumPlanDto = {
  id: string;
  code: string;
  audience: PlanAudience;
  name: string;
  description: string | null;
  priceVnd: number;
  currency: string;
  durationDays: number;
  benefits: string[];
  termsDocumentId: string | null;
  termsVersion: string | null;
};

// Khớp SubscriptionResponse (GET /api/v1/premium/me/benefits?audience=...).
type SubscriptionDto = {
  audience: PlanAudience;
  status: 'NONE' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | string;
  eligible: boolean;
  paidEndsAt: string | null;
  benefits: { benefit: string; enabled: boolean; effectiveUntil: string | null }[];
};

const PREMIUM_QUERY_KEY = ['premium'] as const;

/**
 * Gói đang công bố cho từng phía. Backend có thể công bố nhiều phiên bản; app lấy gói rẻ nhất để
 * giới thiệu. `null` nghĩa là chưa công bố gói nào, khi đó màn gói chỉ hiện giá dự kiến.
 */
export function usePublishedPlan(audience: PlanAudience) {
  return useQuery({
    queryKey: [...PREMIUM_QUERY_KEY, 'plans', audience],
    queryFn: () =>
      apiRequest<PagedResponse<PremiumPlanDto>>(`/premium/plans?audience=${audience}&size=10`),
    select: (page) =>
      [...page.items].sort((a, b) => a.priceVnd - b.priceVnd).find((plan) => plan.priceVnd > 0) ??
      null,
    staleTime: 5 * 60_000,
  });
}

/** Quyền Premium thực tế của tài khoản ở một phía (gồm cả quyền admin cấp tay). */
export function usePremiumStatus(audience: PlanAudience, enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: [...PREMIUM_QUERY_KEY, 'status', audience],
    queryFn: () => apiRequest<SubscriptionDto>(`/premium/me/benefits?audience=${audience}`),
    select: (data) => ({
      isPremium: data.benefits.some((benefit) => benefit.enabled),
      paidEndsAt: data.paidEndsAt,
    }),
  });
}
