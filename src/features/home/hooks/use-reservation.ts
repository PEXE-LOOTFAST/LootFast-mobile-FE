import { useEffect, useState } from 'react';

import { placeOrder } from '@/demo/store';

export type ReservationStatus = 'idle' | 'reserving' | 'reserved';

const RESERVE_DELAY_MS = 700;

/**
 * Đặt giữ một deal. Chưa có API nên giả lập độ trễ mạng rồi ghi đơn vào kho dữ liệu demo:
 * đơn hiện ngay ở tab Đơn hàng của người mua và ở khu người bán của quán bán deal đó,
 * đồng thời số phần còn lại giảm trên trang chủ. Khi có API, thay bằng useMutation.
 */
export function useReservation(dealId: string) {
  const [status, setStatus] = useState<ReservationStatus>('idle');
  const [code, setCode] = useState<string>();

  useEffect(() => {
    if (status !== 'reserving') return;

    const timeout = setTimeout(() => {
      setCode(placeOrder(dealId));
      setStatus('reserved');
    }, RESERVE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [status, dealId]);

  const reserve = () => {
    if (status === 'idle') setStatus('reserving');
  };

  return { status, code, reserve };
}
