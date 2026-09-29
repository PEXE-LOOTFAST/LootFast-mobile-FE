import { useEffect, useRef, useState } from 'react';

import {
  getOrderErrorMessage,
  type OrderResponse,
  type PaymentMethod,
} from '@/features/order/api/orders';
import { useCreateOrder } from '@/features/order/api/use-orders';
import { useAuthSession } from '@/hooks/use-auth-session';

export type ReservationStatus = 'idle' | 'reserving' | 'reserved' | 'error';

const RESERVE_DELAY_MS = 700;

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function useReservation(dealId: string, quantity = 1) {
  const [status, setStatus] = useState<ReservationStatus>('idle');
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const idempotencyKey = useRef<string | undefined>(undefined);
  const { user } = useAuthSession();
  const createOrderMutation = useCreateOrder();

  useEffect(() => {
    if (status !== 'reserving') return;

    if (user) return;

    const timeout = setTimeout(() => setStatus('reserved'), RESERVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [status, user]);

  const reserve = (paymentMethod: PaymentMethod) => {
    if (status === 'reserving' || status === 'reserved') return;

    if (!user) {
      setStatus('reserving');
      return;
    }

    idempotencyKey.current ??= createIdempotencyKey();
    setStatus('reserving');
    createOrderMutation.mutate(
      {
        idempotencyKey: idempotencyKey.current,
        request: { dealId, quantity, paymentMethod },
      },
      {
        onSuccess: (createdOrder) => {
          setOrder(createdOrder);
          setStatus('reserved');
        },
        onError: () => setStatus('error'),
      },
    );
  };

  return {
    status,
    order,
    error: createOrderMutation.error,
    errorMessage: createOrderMutation.error
      ? getOrderErrorMessage(createOrderMutation.error)
      : null,
    reserve,
  };
}
