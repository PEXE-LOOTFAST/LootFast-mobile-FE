import { useCreateOrder } from '@/features/order/api/use-orders';
import { toOrderErrorMessage } from '@/features/order/api/orders';
import { getSessionState, requireAuth } from '@/lib/auth-session';

export type ReservationStatus = 'idle' | 'reserving' | 'reserved';

/**
 * Đặt giữ một deal qua `POST /orders`.
 *
 * Mặc định trả tiền mặt khi nhận: backend cũng nhận BANK_TRANSFER nhưng màn chi tiết chưa có
 * bước chọn phương thức, và đơn đã tạo vẫn đổi được bằng `PUT /orders/{id}/payment-method`.
 *
 * Khách chưa đăng nhập thì mở hộp đăng nhập rồi đặt tiếp ngay sau khi có phiên — không gọi API
 * để khỏi nhận 401.
 */
export function useReservation(dealId: string) {
  const createOrder = useCreateOrder();

  const status: ReservationStatus = createOrder.isPending
    ? 'reserving'
    : createOrder.isSuccess
      ? 'reserved'
      : 'idle';

  const submit = () => {
    if (createOrder.isPending || createOrder.isSuccess) return;

    createOrder.mutate({ dealId, quantity: 1, paymentMethod: 'CASH' });
  };

  const reserve = () => {
    if (getSessionState().status === 'authenticated') {
      submit();
      return;
    }

    requireAuth(submit);
  };

  return {
    status,
    order: createOrder.data,
    error: createOrder.error ? toOrderErrorMessage(createOrder.error) : null,
    reserve,
  };
}
