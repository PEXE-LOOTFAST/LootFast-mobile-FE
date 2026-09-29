import { useEffect, useState } from 'react';

import type { PaymentMethod } from '@/constants/payments';
import { placeOrder } from '@/demo/store';

export type ReservationStatus = 'idle' | 'reserving' | 'reserved';

const RESERVE_DELAY_MS = 700;

/**
 * Đặt giữ một deal. Chưa có API nên giả lập độ trễ mạng rồi ghi đơn vào kho dữ liệu demo:
 * đơn hiện ngay ở tab Đơn hàng của người mua và ở khu người bán của quán bán deal đó,
 * đồng thời số phần còn lại giảm trên trang chủ. Khi có API, thay bằng useMutation.
 */
export type ReservationRequest = { quantity: number; paymentMethod: PaymentMethod };

export function useReservation(dealId: string) {
  const [status, setStatus] = useState<ReservationStatus>('idle');
  const [code, setCode] = useState<string>();
  const [request, setRequest] = useState<ReservationRequest>();

  useEffect(() => {
    if (status !== 'reserving' || !request) return;

    const timeout = setTimeout(() => {
      setCode(placeOrder(dealId, request.quantity, request.paymentMethod));
      setStatus('reserved');
    }, RESERVE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [status, dealId, request]);

  const reserve = (next: ReservationRequest) => {
    if (status !== 'idle') return;
    setRequest(next);
    setStatus('reserving');
  };

  // Số phần đã giữ để thanh dưới đổi từ giá một phần sang tổng tiền của đơn.
  return { status, code, reserve, quantity: request?.quantity ?? 1 };
}
