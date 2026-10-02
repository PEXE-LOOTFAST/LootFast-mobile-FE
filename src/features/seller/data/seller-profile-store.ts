import type { SellerNotificationSettings } from '@/features/seller/types';

// Tuỳ chọn thông báo của người bán. Backend chưa có endpoint lưu cài đặt này, nên nó nằm
// trong bộ nhớ của phiên: tắt app là quay về mặc định.
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
