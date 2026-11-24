import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getCurrentUser } from '@/features/profile/api/profile';
import { useAuthSession } from '@/hooks/use-auth-session';
import { apiRequest } from '@/lib/api-client';
import { draftStorage } from '@/lib/storage';
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

/** Tiêu đề backend đặt cho bản thông báo gửi chủ quán khi có đơn mới (bản của người mua khác tiêu đề). */
const MERCHANT_NEW_ORDER_TITLE = 'Có đơn đặt mới';

/**
 * Backend gửi gần như mọi thông báo đơn hàng cho cả người mua lẫn chủ quán với cùng một `type`,
 * nên không thể suy ra vai trò từ loại thông báo. Hai bản phân biệt được qua `storeId`: bản của
 * chủ quán mang `storeId` đúng bằng `publicId` của chính tài khoản đó.
 */
export function resolveNotificationRole(
  notification: NotificationDto,
  myPublicId: string | undefined,
): 'buyer' | 'seller' {
  if (notification.type === 'MATCHING_DEAL' || notification.type === 'PICKUP_REMINDER') {
    return 'buyer';
  }
  if (notification.type === 'PAYMENT_CONFIRMATION_REQUEST') return 'seller';
  // Người mua tự đặt ở quán của mình chỉ nhận bản người mua dù storeId trùng publicId.
  if (notification.type === 'ORDER_RESERVED') {
    return notification.title === MERCHANT_NEW_ORDER_TITLE ? 'seller' : 'buyer';
  }

  return myPublicId && notification.storeId === myPublicId ? 'seller' : 'buyer';
}

/** Nhãn ngắn nói rõ thông báo thuộc nhóm nào, hiện cạnh giờ. */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  MATCHING_DEAL: 'Deal gợi ý',
  ORDER_RESERVED: 'Đặt đơn',
  TRANSFER_REPORTED: 'Chuyển khoản',
  PAYMENT_CONFIRMED: 'Thanh toán',
  PAYMENT_REJECTED: 'Thanh toán',
  ORDER_CANCELLED: 'Đơn hàng',
  ORDER_COMPLETED: 'Đơn hàng',
  ORDER_NO_SHOW: 'Đơn hàng',
  PICKUP_REMINDER: 'Nhắc nhận món',
  PAYMENT_CONFIRMATION_REQUEST: 'Nhắc xác nhận',
};

/** Vì sao deal được gợi ý cho người dùng (chỉ có ở thông báo MATCHING_DEAL). */
export const MATCH_REASON_LABELS: Record<string, string> = {
  FAVORITE_STORE: 'Vì bạn đã lưu quán này',
  FAVORITE_ITEM: 'Vì bạn đã lưu món này',
  FAVORITE_CATEGORY: 'Vì đúng nhóm món bạn yêu thích',
  ORDER_HISTORY: 'Vì bạn hay đặt món kiểu này',
  NEARBY_AREA: 'Vì quán ở gần khu vực của bạn',
  BIG_DISCOUNT: 'Vì deal đang giảm giá mạnh',
  SAVED_FILTER: 'Vì khớp bộ lọc bạn đã lưu',
};

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

/**
 * Thông báo thuộc về từng tài khoản nên khoá cache luôn kèm email người đang đăng nhập: dữ liệu của
 * tài khoản trước (kể cả request đang chạy dở lúc đăng xuất) không thể bị tài khoản mới đọc nhầm.
 */
function useNotificationScope() {
  const { user, isAuthenticated } = useAuthSession();
  const userKey = user?.email.toLowerCase() ?? null;

  return {
    userKey,
    isReady: isAuthenticated && userKey !== null,
    keys: {
      scope: ['notifications', userKey] as const,
      list: ['notifications', userKey, 'list'] as const,
      unread: ['notifications', userKey, 'unread-count'] as const,
    },
  };
}

/** Trả hàm xác định thông báo là bản của người mua hay chủ quán, theo đúng tài khoản đang đăng nhập. */
export function useNotificationRole() {
  const { userKey, isReady } = useNotificationScope();
  const me = useQuery({
    queryKey: ['current-user', userKey],
    queryFn: getCurrentUser,
    staleTime: Infinity,
    enabled: isReady,
  });
  const myPublicId = me.data?.publicId;

  return (notification: NotificationDto) => resolveNotificationRole(notification, myPublicId);
}

/**
 * Backend chưa có API xoá thông báo nên "xoá" chỉ ẩn thông báo trên thiết bị này, theo từng tài
 * khoản. Danh sách ẩn lưu cục bộ dạng id ghép liền (32 ký tự mỗi id, bỏ dấu gạch) để vừa giới hạn
 * dung lượng của SecureStore: tối đa bằng số thông báo một trang tải về.
 */
const MAX_HIDDEN = 50;
const COMPACT_ID_LENGTH = 32;
const hiddenStorageKey = (userKey: string) => `hidden_notifications.${userKey}`;
const compactId = (id: string) => id.replace(/-/g, '');
const expandId = (id: string) =>
  `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;

async function loadHiddenIds(userKey: string): Promise<string[]> {
  try {
    const raw = await draftStorage.get(hiddenStorageKey(userKey));

    return raw?.match(new RegExp(`.{${COMPACT_ID_LENGTH}}`, 'g'))?.map(expandId) ?? [];
  } catch {
    return [];
  }
}

async function saveHiddenIds(userKey: string, ids: string[]) {
  try {
    await draftStorage.set(hiddenStorageKey(userKey), ids.map(compactId).join(''));
  } catch {
    // Không lưu được thì thông báo chỉ hiện lại ở lần mở app sau, không ảnh hưởng dữ liệu thật.
  }
}

export function useHiddenNotifications() {
  const qc = useQueryClient();
  const { userKey, isReady, keys } = useNotificationScope();
  const hiddenKey = ['notification-hidden', userKey] as const;

  const query = useQuery({
    queryKey: hiddenKey,
    queryFn: () => loadHiddenIds(userKey as string),
    staleTime: Infinity,
    enabled: isReady,
  });
  const hiddenIds = useMemo(() => new Set(query.data ?? []), [query.data]);

  const hide = (ids: string[]) => {
    if (!userKey) return;

    // Chỉ giữ id còn nằm trong danh sách đang tải: thông báo đã trôi khỏi trang đầu sẽ không quay lại.
    const listed = new Set(
      qc
        .getQueryData<PagedResponse<NotificationDto>>(keys.list)
        ?.items.map((n) => n.notificationId),
    );
    const next = [...new Set([...(query.data ?? []), ...ids])]
      .filter((id) => listed.has(id))
      .slice(-MAX_HIDDEN);

    qc.setQueryData(hiddenKey, next);
    void saveHiddenIds(userKey, next);
  };

  return { hiddenIds, hide };
}

export function useNotifications() {
  const { isReady, keys } = useNotificationScope();

  return useQuery({
    queryKey: keys.list,
    queryFn: () => apiRequest<PagedResponse<NotificationDto>>('/notifications?size=50'),
    staleTime: 30_000,
    enabled: isReady,
  });
}

export function useUnreadCount(enabled = true) {
  const { isReady, keys } = useNotificationScope();

  return useQuery({
    queryKey: keys.unread,
    queryFn: () => apiRequest<UnreadCountDto>('/notifications/unread-count'),
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: enabled && isReady,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  const { keys } = useNotificationScope();

  return useMutation({
    mutationFn: (id: string) => apiRequest<void>(`/notifications/${id}/read`, { method: 'PUT' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.scope }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  const { keys } = useNotificationScope();

  return useMutation({
    mutationFn: () => apiRequest<void>('/notifications/read-all', { method: 'PUT' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.scope }),
  });
}
