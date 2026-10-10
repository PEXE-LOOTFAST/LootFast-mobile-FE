import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import type { PagedResponse } from '@/types/api';

export type NotificationType =
  | 'MATCHING_DEAL'
  | 'ORDER_RESERVED'
  | 'TRANSFER_REPORTED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_REJECTED'
  | 'ORDER_CANCELLED'
  | 'ORDER_COMPLETED'
  | 'ORDER_NO_SHOW'
  | 'PICKUP_REMINDER'
  | 'PAYMENT_CONFIRMATION_REQUEST';

const BUYER_TYPES: ReadonlySet<NotificationType> = new Set([
  'MATCHING_DEAL',
  'PAYMENT_CONFIRMED',
  'PAYMENT_REJECTED',
  'ORDER_CANCELLED',
  'ORDER_COMPLETED',
  'ORDER_NO_SHOW',
  'PICKUP_REMINDER',
]);

const SELLER_TYPES: ReadonlySet<NotificationType> = new Set([
  'ORDER_RESERVED',
  'TRANSFER_REPORTED',
  'PAYMENT_CONFIRMATION_REQUEST',
  'ORDER_CANCELLED',
  'ORDER_COMPLETED',
  'ORDER_NO_SHOW',
]);

export function filterByRole(
  items: NotificationDto[],
  role: 'buyer' | 'seller',
): NotificationDto[] {
  const allowed = role === 'buyer' ? BUYER_TYPES : SELLER_TYPES;
  return items.filter((n) => allowed.has(n.type));
}

export type NotificationDto = {
  notificationId: string;
  type: NotificationType;
  matchReason: string | null;
  dealId: string | null;
  orderId: string | null;
  storeId: string | null;
  title: string;
  message: string;
  imageUrl: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
};

type UnreadCountDto = {
  unreadCount: number;
};

const KEYS = {
  list: ['notifications'] as const,
  unread: ['notifications', 'unread-count'] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: KEYS.list,
    queryFn: () => apiRequest<PagedResponse<NotificationDto>>('/notifications?size=50'),
    staleTime: 30_000,
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: KEYS.unread,
    queryFn: () => apiRequest<UnreadCountDto>('/notifications/unread-count'),
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRequest<void>(`/notifications/${id}/read`, { method: 'PUT' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.list });
      void qc.invalidateQueries({ queryKey: KEYS.unread });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<void>('/notifications/read-all', { method: 'PUT' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.list });
      void qc.invalidateQueries({ queryKey: KEYS.unread });
    },
  });
}
