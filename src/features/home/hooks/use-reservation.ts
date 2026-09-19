import { useEffect, useState } from 'react';

export type ReservationStatus = 'idle' | 'reserving' | 'reserved';

const RESERVE_DELAY_MS = 700;

// Chưa có API đặt giữ nên giả lập độ trễ mạng. Khi có API, thay bằng useMutation.
export function useReservation() {
  const [status, setStatus] = useState<ReservationStatus>('idle');

  useEffect(() => {
    if (status !== 'reserving') return;

    const timeout = setTimeout(() => setStatus('reserved'), RESERVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [status]);

  const reserve = () => {
    if (status === 'idle') setStatus('reserving');
  };

  return { status, reserve };
}
