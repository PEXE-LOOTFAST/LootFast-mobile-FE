import { useSyncExternalStore } from 'react';

import { useSellerDemo } from '@/demo/use-demo';
import {
  getSellerNotifications,
  subscribeSellerNotifications,
} from '@/features/seller/data/seller-profile-store';

/** Hồ sơ quán, thông tin chủ quán và tuỳ chọn thông báo của tài khoản người bán demo. */
export function useSellerProfile() {
  const { shop, owner } = useSellerDemo();
  const notifications = useSyncExternalStore(
    subscribeSellerNotifications,
    getSellerNotifications,
    getSellerNotifications,
  );

  return { shop, owner, notifications };
}
