import type { PickupSlot } from '@/features/home/pickup-slots';
import { useCreateOrder, useOrder } from '@/features/order/api/use-orders';
import { toOrderErrorMessage } from '@/features/order/api/orders';
import { getSessionState, requireAuth } from '@/lib/auth-session';

export type ReservationStatus = 'idle' | 'reserving' | 'reserved';

/**
 * Đặt giữ một deal qua `POST /orders`, với số phần khách đã chọn (backend nhận 1–5).
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
export function useReservation(
  dealId: string,
  pickupSlot: PickupSlot | undefined,
  quantity: number,
) {
  const createOrder = useCreateOrder();
  const createdOrder = createOrder.data;

  // Màn deal nằm trong tab nên vẫn sống khi khách sang màn đơn hàng để huỷ. Theo dõi trạng thái thật
  // của đơn vừa tạo: huỷ (hoặc hoàn tất, quá hạn) ở nơi khác thì đơn không còn "đang giữ" và khách
  // phải đặt lại được. Huỷ đơn đã làm mới ['orders'] nên truy vấn này tự cập nhật.
  const trackedOrder = useOrder(createdOrder?.orderId);
  const isStillReserved =
    createOrder.isSuccess &&
    (trackedOrder.data?.orderStatus ?? createdOrder?.orderStatus) === 'RESERVED';

  const status: ReservationStatus = createOrder.isPending
    ? 'reserving'
    : isStillReserved
      ? 'reserved'
      : 'idle';

  const submit = () => {
    if (createOrder.isPending || isStillReserved || !pickupSlot) return;

    createOrder.mutate({
      dealId,
      quantity,
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
    order: isStillReserved ? createdOrder : undefined,
    error: createOrder.error ? toOrderErrorMessage(createOrder.error) : null,
    reserve,
  };
}
