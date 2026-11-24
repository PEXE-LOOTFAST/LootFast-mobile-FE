import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  NOTIFICATION_TYPE_LABELS,
  resolveNotificationRole,
  type NotificationDto,
} from '@/api/notifications';
import { ORDER_QUERY_KEY } from '@/features/order/api/use-orders';
import { getCurrentUser } from '@/features/profile/api/profile';
import { MERCHANT_PERFORMANCE_QUERY_KEY } from '@/features/seller/api/merchant-performance';
import { MERCHANT_DEALS_QUERY_KEY } from '@/features/seller/api/use-merchant-deals';
import { MERCHANT_ORDERS_QUERY_KEY } from '@/features/seller/api/use-merchant-orders';
import { useAuthSession } from '@/hooks/use-auth-session';
import { refreshSession } from '@/lib/api-client';
import { StompConnection } from '@/lib/stomp-client';
import { tokenStorage } from '@/lib/storage';
import { showToast } from '@/lib/toast';

/** Kênh realtime nằm ở gốc server, ngoài tiền tố /api/v1 của REST. */
function realtimeUrl() {
  const explicit = process.env.EXPO_PUBLIC_WS_URL;
  if (explicit) return explicit;
  const api = process.env.EXPO_PUBLIC_API_URL;
  if (!api) return null;
  return `${api.replace(/\/api\/v\d+\/?$/, '').replace(/^http/, 'ws')}/ws`;
}

const DESTINATION = '/user/queue/notifications';

type Envelope =
  | { event: 'NOTIFICATION_CREATED'; data: NotificationDto }
  | { event: 'UNREAD_COUNT_CHANGED'; data: { unreadCount: number } };

// Người mua đang mở app thì báo ngay những thay đổi về đơn của họ. Đơn mới phía người bán đã có
// thông báo riêng (useNewOrderAlerts), deal gợi ý thì chỉ cần lên chuông, không chen ngang.
const BUYER_TOAST_TYPES = new Set<NotificationDto['type']>([
  'PAYMENT_CONFIRMED',
  'PAYMENT_REJECTED',
  'ORDER_COMPLETED',
  'ORDER_CANCELLED',
  'ORDER_NO_SHOW',
  'PICKUP_REMINDER',
]);

function useAppActive() {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setActive(state === 'active'),
    );
    return () => subscription.remove();
  }, []);
  return active;
}

/**
 * Giữ kết nối realtime (STOMP qua WebSocket) khi đã đăng nhập và app đang mở; chạy nền hoặc đăng
 * xuất thì ngắt. Mỗi sự kiện chỉ là tín hiệu để tải lại đúng phần dữ liệu liên quan qua REST,
 * nên lỡ sự kiện nào thì lần kết nối lại sẽ tải lại hết. Polling cũ vẫn giữ làm dự phòng.
 */
export function RealtimeSync() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthSession();
  const userKey = user?.email.toLowerCase();
  const appActive = useAppActive();

  useEffect(() => {
    const url = realtimeUrl();
    if (!isAuthenticated || !userKey || !appActive || !url) return;

    const notificationScope = ['notifications', userKey];
    const refreshOrders = (orderId?: string | null) => {
      void queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MERCHANT_ORDERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MERCHANT_PERFORMANCE_QUERY_KEY });
      // Đặt hay huỷ đơn làm đổi số phần còn lại của deal.
      void queryClient.invalidateQueries({ queryKey: MERCHANT_DEALS_QUERY_KEY });
      if (orderId) {
        void queryClient.invalidateQueries({ queryKey: ['payment-instructions', orderId] });
      } else {
        void queryClient.invalidateQueries({ queryKey: ['payment-instructions'] });
      }
    };

    const handle = (body: string) => {
      let envelope: Envelope;
      try {
        envelope = JSON.parse(body) as Envelope;
      } catch {
        return;
      }

      if (envelope.event === 'UNREAD_COUNT_CHANGED') {
        queryClient.setQueryData([...notificationScope, 'unread-count'], {
          unreadCount: envelope.data.unreadCount,
        });
        return;
      }
      if (envelope.event !== 'NOTIFICATION_CREATED') return;

      const notification = envelope.data;
      void queryClient.invalidateQueries({ queryKey: notificationScope });
      if (notification.orderId) refreshOrders(notification.orderId);

      if (BUYER_TOAST_TYPES.has(notification.type)) void toastIfBuyer(notification);
    };

    // Cùng một tài khoản có thể vừa mua vừa bán: chỉ báo bản thông báo dành cho người mua.
    const toastIfBuyer = async (notification: NotificationDto) => {
      try {
        const me = await queryClient.fetchQuery({
          queryKey: ['current-user', userKey],
          queryFn: getCurrentUser,
          staleTime: Infinity,
        });
        if (resolveNotificationRole(notification, me.publicId) !== 'buyer') return;
        showToast(notification.title || NOTIFICATION_TYPE_LABELS[notification.type]);
      } catch {
        // Không biết vai trò thì bỏ qua toast; chuông vẫn cập nhật.
      }
    };

    const connection = new StompConnection({
      url,
      destination: DESTINATION,
      getToken: () => tokenStorage.getAccessToken(),
      onAuthRejected: () => refreshSession(),
      onMessage: handle,
      // Trong lúc mất kết nối có thể đã lỡ sự kiện: tải lại thông báo và đơn một lần.
      onConnected: (isReconnect) => {
        if (!isReconnect) return;
        void queryClient.invalidateQueries({ queryKey: notificationScope });
        refreshOrders();
      },
    });
    connection.start();

    return () => connection.stop();
  }, [isAuthenticated, userKey, appActive, queryClient]);

  return null;
}
