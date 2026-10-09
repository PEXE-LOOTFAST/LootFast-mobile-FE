import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelOrder,
  createOrder,
  getOrder,
  getOrders,
  type CreateOrderPayload,
  type OrderListStatusDto,
} from '@/features/order/api/orders';

export const ORDER_QUERY_KEY = ['orders'];

export function useOrders(status: OrderListStatusDto, page: number) {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEY, status, page],
    queryFn: () => getOrders(status, page),
  });
}

/**
 * Đặt giữ deal. Đặt xong phải làm mới feed deal: số suất còn lại vừa giảm ở server, để nguyên
 * thì trang chủ và màn chi tiết vẫn hiện số cũ.
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['deals'] });
      void queryClient.invalidateQueries({ queryKey: ['deal'] });
    },
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    enabled: Boolean(orderId),
    queryKey: [...ORDER_QUERY_KEY, orderId],
    queryFn: () => getOrder(orderId as string),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    // Huỷ đơn trả suất lại cho deal, nên feed deal cũng phải tải lại.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['deals'] });
      void queryClient.invalidateQueries({ queryKey: ['deal'] });
    },
  });
}
