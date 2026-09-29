import type { SellerNotificationSettings } from '@/features/seller/types';

// Hồ sơ quán và thông tin chủ quán nằm trong kho dữ liệu demo dùng chung (`@/demo`), vì cả
// khu người mua và quản trị cũng đọc chúng. Riêng tuỳ chọn thông báo là cài đặt cục bộ của
// người bán, không ai khác quan tâm, nên giữ lại ở đây. Tắt app là quay về mặc định.
let notifications: SellerNotificationSettings = { newOrders: true, dealAlerts: true };
const listeners = new Set<() => void>();

export function getSellerNotifications(): SellerNotificationSettings {
  return notifications;
}

export function subscribeSellerNotifications(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateSellerNotifications(next: Partial<SellerNotificationSettings>) {
  notifications = { ...notifications, ...next };
  listeners.forEach((listener) => listener());
}
