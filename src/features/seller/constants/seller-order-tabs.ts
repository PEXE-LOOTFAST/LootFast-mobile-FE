import type { SellerOrderTab, SellerPickupBucket } from '@/features/seller/types';

export const SELLER_ORDER_TABS: { id: SellerOrderTab; label: string }[] = [
  { id: 'incoming', label: 'Đơn hàng đến' },
  { id: 'running', label: 'Deal đang chạy' },
  { id: 'ended', label: 'Đã dừng bán' },
];

export const SELLER_PICKUP_BUCKETS: { id: SellerPickupBucket; label: string }[] = [
  { id: 'waiting', label: 'Chờ lấy' },
  { id: 'picked', label: 'Đã lấy' },
  { id: 'no-show', label: 'Không đến nhận' },
];

/** Lời nhắn khi nhóm đơn rỗng — mỗi nhóm cần một câu hướng dẫn riêng. */
export const PICKUP_EMPTY_MESSAGES: Record<SellerPickupBucket, string> = {
  waiting: 'Chưa có đơn chờ lấy – hãy đăng deal đầu tiên!',
  picked: 'Chưa có đơn nào được lấy trong ngày này.',
  'no-show': 'Không có đơn nào khách bỏ lỡ. Quá tốt!',
};

/** Mã lấy hàng khách đọc cho quán là `LF-` cộng 6 ký tự chữ hoa hoặc số; đây là độ dài phần sau `LF-`. */
export const PICKUP_CODE_LENGTH = 6;
