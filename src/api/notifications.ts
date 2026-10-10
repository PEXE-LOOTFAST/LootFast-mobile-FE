import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api-client';
import type { PagedResponse } from '@/types/api';

export type NotificationDto = {
  notificationId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
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
