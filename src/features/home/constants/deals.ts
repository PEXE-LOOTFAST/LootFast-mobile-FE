import type { DiscountFilter, PickupFilter } from '@/features/home/types';

export const LOW_STOCK_THRESHOLD = 3;

export const RADIUS_OPTIONS_KM = [0.2, 0.4, 0.6, 0.8, 1, 1.5, 2];
export const DEFAULT_RADIUS_KM = 1;

export const DISCOUNT_OPTIONS: { value: DiscountFilter; label: string }[] = [
  { value: 30, label: 'Giảm ≥30%' },
  { value: 40, label: 'Giảm ≥40%' },
  { value: 50, label: 'Giảm ≥50%' },
];
export const DEFAULT_DISCOUNT: DiscountFilter = 30;

export const PICKUP_OPTIONS: { value: PickupFilter; label: string }[] = [
  { value: 'any', label: 'Giờ lấy' },
  { value: 'before-20', label: 'Trước 20h' },
  { value: 'after-20', label: 'Sau 20h' },
];

// Mốc chia "Trước 20h / Sau 20h". So sánh chuỗi "HH:mm" được vì cùng định dạng 2 chữ số.
export const PICKUP_SPLIT_TIME = '20:00';
