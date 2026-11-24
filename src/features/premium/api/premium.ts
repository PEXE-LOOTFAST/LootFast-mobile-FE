import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';

import { ApiException, apiRequest } from '@/lib/api-client';
import { createIdempotencyKey } from '@/lib/idempotency';
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

type PremiumOrderDto = { id: string; status: string };
type PaymentDto = { orderId: string; paymentUrl: string };

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

const CHECKOUT_ERRORS: Record<string, string> = {
  PREMIUM_CHECKOUT_CONFLICT: 'Bạn đang có một đơn gói chờ thanh toán. Hãy hoàn tất đơn đó trước.',
  PREMIUM_SUBSCRIPTION_CONFLICT: 'Tài khoản đã có gói Cao cấp đang hiệu lực.',
  PREMIUM_PLAN_NOT_FOUND: 'Gói này vừa được cập nhật. Hãy tải lại trang và thử lại.',
  CONSENT_VERSION_OUTDATED: 'Điều khoản gói vừa được cập nhật. Hãy tải lại trang và đồng ý lại.',
  PAYMENT_NOT_CONFIGURED: 'Cổng thanh toán VNPay đang bảo trì. Vui lòng thử lại sau.',
  PAYMENT_RETRY_LATER: 'Bạn đã tạo quá nhiều đơn trong một giờ. Vui lòng thử lại sau.',
  MERCHANT_NOT_APPROVED: 'Quán cần được duyệt trước khi đăng ký gói Người bán.',
  ACCOUNT_NOT_VERIFIED: 'Hãy xác minh email trước khi đăng ký gói.',
};

export function getCheckoutErrorMessage(error: unknown) {
  const known = error instanceof ApiException ? CHECKOUT_ERRORS[error.code] : undefined;

  return known ?? 'Chưa mở được trang thanh toán. Vui lòng thử lại.';
}

/**
 * Tạo đơn gói rồi mở trang thanh toán VNPay. Quyền lợi chỉ bật khi backend nhận IPN từ VNPay,
 * nên khi người dùng đóng trình duyệt app chỉ tải lại trạng thái gói, không tự coi là đã mua.
 */
export function usePremiumCheckout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (plan: PremiumPlanDto) => {
      const order = await apiRequest<PremiumOrderDto>('/premium/orders', {
        method: 'POST',
        body: { planRevisionId: plan.id, termsDocumentId: plan.termsDocumentId, acceptTerms: true },
        headers: { 'Idempotency-Key': createIdempotencyKey() },
      });
      const payment = await apiRequest<PaymentDto>(`/premium/orders/${order.id}/payment-attempts`, {
        method: 'POST',
      });
      await WebBrowser.openBrowserAsync(payment.paymentUrl);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: PREMIUM_QUERY_KEY }),
  });
}
