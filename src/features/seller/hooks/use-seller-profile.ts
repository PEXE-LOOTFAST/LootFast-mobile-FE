import { useSyncExternalStore } from 'react';

import {
  getSellerNotifications,
  subscribeSellerNotifications,
} from '@/features/seller/data/seller-profile-store';

/**
 * Tuỳ chọn thông báo của người bán. Backend chưa có endpoint lưu cài đặt này nên nó chỉ sống
 * trong bộ nhớ của phiên — đây là tuỳ chọn cục bộ chứ không phải dữ liệu giả của quán.
 */
export function useSellerProfile() {
  const notifications = useSyncExternalStore(
    subscribeSellerNotifications,
    getSellerNotifications,
    getSellerNotifications,
  );

  return { notifications };
}
