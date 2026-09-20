export type SellerDealStatus = 'running' | 'ended';

export type SellerDeal = {
  id: string;
  name: string;
  emoji: string;
  status: SellerDealStatus;
  /** Tổng số phần mở bán của deal. */
  portionsTotal: number;
  portionsSold: number;
  price: number;
};

export type SellerOrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type SellerOrder = {
  id: string;
  code: string;
  status: SellerOrderStatus;
  customerName: string;
  itemName: string;
  quantity: number;
  total: number;
  pickupLabel: string;
  /** Thời điểm đặt (ISO) — dùng để tách đơn hôm nay và dựng trục 7 ngày. */
  createdAt: string;
};

export type SellerShop = {
  name: string;
  isVerified: boolean;
};
