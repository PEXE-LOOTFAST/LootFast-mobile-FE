import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelOrder,
  createOrder,
  getOrder,
  getOrders,
  type CreateOrderPayload,
  type OrderListStatusDto,
} from '@/features/order/api/orders';

export const ORDER_QUERY_KEY = ['orders'];

/** Đơn theo trạng thái, tải thêm từng trang khi người dùng cuộn tới cuối danh sách. */
export function useOrders(status: OrderListStatusDto) {
  return useInfiniteQuery({
    // Có đoạn 'list' để không trùng khoá với useOrder (['orders', orderId]).
    queryKey: [...ORDER_QUERY_KEY, 'list', status],
    queryFn: ({ pageParam }) => getOrders(status, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}

/**
 * Đặt giữ deal. Đặt xong phải làm mới feed deal: số suất còn lại vừa giảm ở server, để nguyên
 * thì trang chủ và màn chi tiết vẫn hiện số cũ. Tab Đơn hàng luôn được giữ trong bộ nhớ nên cũng
 * phải làm mới danh sách đơn, không thì đơn vừa đặt chỉ hiện sau khi khách kéo để tải lại.
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY });
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
