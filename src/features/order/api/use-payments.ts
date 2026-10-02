import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ORDER_QUERY_KEY } from '@/features/order/api/use-orders';
import type { PaymentMethodDto } from '@/features/order/api/orders';
import { changePaymentMethod, getPaymentInstructions } from '@/features/order/api/payments';

export function usePaymentInstructions(orderId: string | undefined) {
  return useQuery({
    enabled: Boolean(orderId),
    queryKey: ['payment-instructions', orderId],
    queryFn: () => getPaymentInstructions(orderId as string),
  });
}

export function useChangePaymentMethod(orderId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethod: PaymentMethodDto) =>
      changePaymentMethod(orderId as string, paymentMethod),
    // Đổi phương thức làm hướng dẫn thanh toán khác hẳn (có QR hay không), nên tải lại cả hai.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['payment-instructions', orderId] });
    },
  });
}
