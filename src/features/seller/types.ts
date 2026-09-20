export type SellerDealStatus = 'running' | 'ended';

export type SellerDeal = {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string;
  status: SellerDealStatus;
  /** Tổng số phần mở bán của deal. */
  portionsTotal: number;
  portionsSold: number;
  price: number;
  /** Giá gốc, dùng để tính mức giảm hiển thị trên thẻ deal. */
  originalPrice: number;
  /** Khung giờ khách đến lấy, hiển thị dạng "18:00–23:59". */
  pickupWindow: { start: string; end: string };
  /** Vì sao deal dừng bán — chỉ có ở deal đã kết thúc. */
  endedReason?: 'sold-out' | 'expired';
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

/** Gói dịch vụ của quán, quyết định số lượt đăng deal mỗi ngày. */
export type SellerPlan = {
  name: string;
  dealPostsUsed: number;
  dealPostsLimit: number;
};

/** Ba mục lớn của trang Đơn hàng người bán. */
export type SellerOrderTab = 'incoming' | 'running' | 'ended';

/** Ba nhóm đơn trong mục "Đơn hàng đến", theo việc khách đã đến lấy hay chưa. */
export type SellerPickupBucket = 'waiting' | 'picked' | 'no-show';
