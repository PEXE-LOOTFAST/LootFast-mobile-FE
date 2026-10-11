import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  confirmMerchantPayment,
  confirmMerchantPickup,
  listMerchantOrders,
  PICKUP_CODE_PREFIX,
  rejectMerchantPayment,
} from '@/features/seller/api/merchant-orders';

export const MERCHANT_ORDERS_QUERY_KEY = ['merchant', 'orders'];

/** `range` null nghĩa là ngày đang gõ chưa hợp lệ: chưa gọi API. */
export function useMerchantOrders(range: { from: Date; to: Date } | null) {
  return useQuery({
    queryKey: [...MERCHANT_ORDERS_QUERY_KEY, range?.from.getTime() ?? null],
    queryFn: () => listMerchantOrders(range!.from, range!.to),
    enabled: range !== null,
    // Đơn mới đến khi quán đang mở màn này nên làm mới đều thay vì chờ người bán kéo.
    refetchInterval: 30 * 1000,
  });
}

function useInvalidateOrders() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: MERCHANT_ORDERS_QUERY_KEY });
}

export function useConfirmPickup() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: (code: string) => confirmMerchantPickup(`${PICKUP_CODE_PREFIX}${code}`),
    onSuccess: invalidate,
  });
}

export function useConfirmPayment() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: (orderId: string) => confirmMerchantPayment(orderId),
    onSuccess: invalidate,
  });
}

export function useRejectPayment() {
  const invalidate = useInvalidateOrders();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      rejectMerchantPayment(orderId, reason),
    onSuccess: invalidate,
  });
}
