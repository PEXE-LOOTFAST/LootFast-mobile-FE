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
  /** Mốc khách còn đặt được, dạng "19:35 · 11/10" (giờ VN); sau mốc này deal ẩn khỏi người mua. */
  saleEndsLabel: string;
  /** Vì sao deal dừng bán — chỉ có ở deal đã kết thúc. */
  endedReason?: 'sold-out' | 'expired';
};

/** 'no-show': khách đã đặt nhưng hết khung nhận vẫn không tới lấy, khác với đơn bị huỷ. */
export type SellerOrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

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

/** Người đứng tên tài khoản quán, tách khỏi thông tin hiển thị của cửa hàng. */
export type SellerOwner = {
  fullName: string;
  email: string;
  phone: string;
};

export type SellerNotificationSettings = {
  newOrders: boolean;
  dealAlerts: boolean;
};

/** Gói dịch vụ của quán, quyết định số lượt đăng deal mỗi ngày. */
export type SellerPlan = {
  name: string;
  dealPostsUsed: number;
  dealPostsLimit: number;
  /** Ngày gia hạn kế tiếp (ISO), chỉ có ở gói trả phí. */
  renewsAt?: string;
};

/** 'premium': đã có trong gói Cao cấp; 'backend': giao diện có sẵn nhưng chờ API. */
export type SellerPlanFeatureStatus = 'premium' | 'backend';

/** Ba mục lớn của trang Đơn hàng người bán. */
export type SellerOrderTab = 'incoming' | 'running' | 'ended';

/** Ba nhóm đơn trong mục "Đơn hàng đến", theo việc khách đã đến lấy hay chưa. */
export type SellerPickupBucket = 'waiting' | 'picked' | 'no-show';
