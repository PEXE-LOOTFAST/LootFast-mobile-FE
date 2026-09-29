import type { DealCategoryId } from '@/features/home/types';
import type { SellerShopCategory } from '@/features/seller/types';

/** Trạng thái hồ sơ đăng ký quán, do quản trị quyết định. */
export type DemoStoreApproval = 'pending' | 'approved' | 'rejected';

/**
 * Một quán trong thế giới demo. Đây là nguồn duy nhất: người mua thấy deal của quán,
 * người bán chính là một quán trong danh sách này, quản trị duyệt và khoá cũng chính nó.
 */
export type DemoStore = {
  id: string;
  name: string;
  /** Nhóm món chính, hiển thị nguyên văn trên thẻ hồ sơ bên quản trị. */
  categoryLabel: string;
  shopCategories: SellerShopCategory[];
  ownerName: string;
  ownerEmail: string;
  phone: string;
  address: string;
  /** Quận/huyện, hiển thị ở danh sách quản lý tài khoản. */
  district: string;
  rating: number;
  isVerified: boolean;
  /** Khoảng cách tới người mua demo, dùng cho bộ lọc bán kính. */
  distanceKm: number;
  hasFoodSafetyCert: boolean;
  approval: DemoStoreApproval;
  /** Số ngày trước hôm nay mà quán gửi hồ sơ — quy ra ngày thật lúc chạy. */
  submittedDaysAgo: number;
  /** Quán bị quản trị khoá thì deal rời khỏi sàn nhưng hồ sơ vẫn còn. */
  isLocked: boolean;
  openingHours: { open: string; close: string };
};

export type DemoDealStatus = 'running' | 'ended';

export type DemoDeal = {
  id: string;
  storeId: string;
  name: string;
  categoryId: Exclude<DealCategoryId, 'all'>;
  emoji: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  portionsTotal: number;
  portionsSold: number;
  pickupWindow: { start: string; end: string };
  status: DemoDealStatus;
  endedReason?: 'sold-out' | 'expired';
};

/**
 * Trạng thái đơn hợp nhất cho cả hai phía: người mua có thêm 'ready' (quán đã soạn xong),
 * người bán có thêm 'no-show' (hết giờ nhận mà khách không tới).
 */
export type DemoOrderStatus =
  'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled' | 'no-show';

export type DemoOrder = {
  id: string;
  code: string;
  dealId: string;
  /** Tên khách; `BUYER_NAME` là người mua đang đăng nhập ở phiên demo. */
  customerName: string;
  quantity: number;
  status: DemoOrderStatus;
  /** Thời điểm đặt, tính ngược từ lúc mở app để biểu đồ 7 ngày luôn có dữ liệu. */
  placedHoursAgo: number;
  /** Giờ khách hẹn đến lấy, dạng "HH:mm". */
  pickupAt: string;
};

export type DemoState = {
  stores: DemoStore[];
  deals: DemoDeal[];
  orders: DemoOrder[];
};
