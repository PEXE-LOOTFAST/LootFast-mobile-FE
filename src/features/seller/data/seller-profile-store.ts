import { MOCK_SELLER_OWNER, MOCK_SELLER_SHOP } from '@/features/seller/data/mock-seller-shop';
import type { SellerNotificationSettings, SellerOwner, SellerShop } from '@/features/seller/types';

export type SellerProfileState = {
  shop: SellerShop;
  owner: SellerOwner;
  notifications: SellerNotificationSettings;
};

// Chưa có API người bán nên hồ sơ chỉ nằm trong bộ nhớ, giống phiên đăng nhập: sửa ở trang
// Hồ sơ quán thì Tổng quan thấy ngay, tắt app là quay về dữ liệu mẫu.
let state: SellerProfileState = {
  shop: MOCK_SELLER_SHOP,
  owner: MOCK_SELLER_OWNER,
  notifications: { newOrders: true, dealAlerts: true },
};
const listeners = new Set<() => void>();

function setState(next: Partial<SellerProfileState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function getSellerProfile(): SellerProfileState {
  return state;
}

export function subscribeSellerProfile(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateSellerShop(shop: Partial<SellerShop>) {
  setState({ shop: { ...state.shop, ...shop } });
}

export function updateSellerOwner(owner: Partial<SellerOwner>) {
  setState({ owner: { ...state.owner, ...owner } });
}

export function updateSellerNotifications(notifications: Partial<SellerNotificationSettings>) {
  setState({ notifications: { ...state.notifications, ...notifications } });
}
