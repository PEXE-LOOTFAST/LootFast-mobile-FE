import type { PickupSlot } from '@/features/home/pickup-slots';
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
 *
 * `pickupSlot` là khoảng giờ khách hẹn đến lấy; backend bắt buộc gửi kèm nên chưa chọn thì không
 * đặt được.
 */
export function useReservation(dealId: string, pickupSlot: PickupSlot | undefined) {
  const createOrder = useCreateOrder();

  const status: ReservationStatus = createOrder.isPending
    ? 'reserving'
    : createOrder.isSuccess
      ? 'reserved'
      : 'idle';

  const submit = () => {
    if (createOrder.isPending || createOrder.isSuccess || !pickupSlot) return;

    createOrder.mutate({
      dealId,
      quantity: 1,
      paymentMethod: 'CASH',
      pickupFrom: pickupSlot.from,
      pickupTo: pickupSlot.to,
    });
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
