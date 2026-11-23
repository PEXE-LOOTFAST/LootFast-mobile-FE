import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useOrders } from '@/features/order/api/use-orders';
import { useProfile } from '@/features/profile/api/use-profile';
import { useMyOrderReview } from '@/features/review/api/use-reviews';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useNow } from '@/hooks/use-now';
import { preferenceStorage } from '@/lib/storage';

// Quá một tuần thì khách khó nhớ bữa đó ra sao, nhắc nữa chỉ thành phiền.
const REMIND_WITHIN_MS = 7 * 24 * 60 * 60_000;

const dismissedKey = (email: string) => `review-dismissed.${email}`;

/**
 * Đơn gần nhất đã nhận món mà khách chưa đánh giá, để nhắc ở trang chủ. Chỉ nhắc một đơn, và khách
 * bấm "Để sau" thì không nhắc lại đơn đó trên máy này.
 */
export function usePendingReview() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthSession();
  const email = user?.email;
  const now = useNow(60 * 60_000);

  const completed = useOrders('COMPLETED', isAuthenticated);
  const latest = completed.data?.pages[0]?.items[0];
  const finishedAt = latest ? Date.parse(latest.finalizedAt ?? latest.createdAt) : NaN;
  const isRecent = now - finishedAt < REMIND_WITHIN_MS;

  // Tài khoản vừa mua vừa bán đặt ở chính quán mình thì backend không cho đánh giá.
  const profile = useProfile(isAuthenticated);
  const isOwnStore =
    latest != null && profile.data?.publicId.toLowerCase() === latest.storeId.toLowerCase();

  const dismissedQueryKey = ['review-dismissed', email] as const;
  const dismissed = useQuery({
    enabled: Boolean(email),
    queryKey: dismissedQueryKey,
    queryFn: () => preferenceStorage.get(dismissedKey(email as string)),
    staleTime: Infinity,
  });

  const candidate =
    latest && isRecent && profile.isSuccess && !isOwnStore && dismissed.isSuccess
      ? dismissed.data === latest.orderId
        ? undefined
        : latest
      : undefined;

  const review = useMyOrderReview(candidate?.orderId, Boolean(candidate));
  const order = candidate && review.isSuccess && review.data === null ? candidate : undefined;

  const dismiss = () => {
    if (!order || !email) return;
    queryClient.setQueryData(dismissedQueryKey, order.orderId);
    void preferenceStorage.set(dismissedKey(email), order.orderId);
  };

  return { order, dismiss };
}
