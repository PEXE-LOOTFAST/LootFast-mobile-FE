import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelOrder,
  createOrder,
  getOrder,
  type CreateOrderRequest,
} from '@/features/order/api/orders';

export function useOrder(orderId: string | undefined) {
  return useQuery({
    enabled: Boolean(orderId),
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId as string),
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({
      request,
      idempotencyKey,
    }: {
      request: CreateOrderRequest;
      idempotencyKey: string;
    }) => createOrder(request, idempotencyKey),
  });
}

export function useCancelOrder(orderId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelOrder(orderId as string),
    onSuccess: (order) => {
      queryClient.setQueryData(['order', orderId], order);
    },
  });
}
