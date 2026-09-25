import type { SellerShopCategory } from '@/features/seller/types';

// Thứ tự hiển thị trong form Thông tin quán.
export const SHOP_CATEGORY_OPTIONS: { value: SellerShopCategory; label: string }[] = [
  { value: 'rice-noodle', label: 'Cơm/Bún phở' },
  { value: 'banh-mi', label: 'Bánh mì/Xôi' },
  { value: 'bakery', label: 'Bánh ngọt/Lò bánh' },
  { value: 'fast-food', label: 'Gà rán/Đồ ăn nhanh' },
  { value: 'drinks', label: 'Trà sữa/Nước' },
  { value: 'fruit', label: 'Trái cây/Sinh tố' },
  { value: 'dessert', label: 'Tráng miệng' },
  { value: 'international', label: 'Đồ nước ngoài' },
];
