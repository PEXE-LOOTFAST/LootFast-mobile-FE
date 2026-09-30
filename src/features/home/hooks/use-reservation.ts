import { useEffect, useState } from 'react';

import { getDemoState, placeOrder } from '@/demo/store';

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
      // Deal lấy từ API không có trong kho demo; placeOrder sẽ ném lỗi nên chỉ ghi đơn cho deal demo.
      const isDemoDeal = getDemoState().deals.some((deal) => deal.id === dealId);
      setCode(isDemoDeal ? placeOrder(dealId) : undefined);
      setStatus('reserved');
    }, RESERVE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [status, dealId]);

  const reserve = () => {
    if (status === 'idle') setStatus('reserving');
  };

  return { status, code, reserve };
}
