import type { DiscountFilter, PickupFilter } from '@/features/home/types';

export const LOW_STOCK_THRESHOLD = 3;

// BE cho mọi buyer chọn bán kính 0,1–50 km, không gắn với gói Premium; danh sách này chỉ là các
// mức gợi ý trên giao diện.
export const RADIUS_OPTIONS_KM = [0.5, 1, 2, 3, 5, 10, 20];
export const DEFAULT_RADIUS_KM = 3;

export const DISCOUNT_OPTIONS: { value: DiscountFilter; label: string }[] = [
  { value: 0, label: 'Mọi mức giảm' },
  { value: 30, label: 'Giảm ≥30%' },
  { value: 40, label: 'Giảm ≥40%' },
  { value: 50, label: 'Giảm ≥50%' },
];
// Mặc định không lọc theo mức giảm: deal giảm ít vẫn phải hiện, người dùng tự siết khi cần.
export const DEFAULT_DISCOUNT: DiscountFilter = 0;

export const PICKUP_OPTIONS: { value: PickupFilter; label: string }[] = [
  { value: 'any', label: 'Giờ lấy' },
  { value: 'before-20', label: 'Trước 20h' },
  { value: 'after-20', label: 'Sau 20h' },
];

// Mốc chia "Trước 20h / Sau 20h". So sánh chuỗi "HH:mm" được vì cùng định dạng 2 chữ số.
export const PICKUP_SPLIT_TIME = '20:00';
