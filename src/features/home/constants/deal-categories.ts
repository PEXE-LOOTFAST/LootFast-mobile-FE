import type { DealCategory } from '@/features/home/types';

// Nhóm món để khách lọc deal ở trang chủ. Khớp với `categoryCode` backend trả về cho deal.
export const DEAL_CATEGORIES: DealCategory[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'rice-noodle', label: 'Cơm/Bún phở' },
  { id: 'banh-mi', label: 'Bánh mì' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'drink', label: 'Đồ uống' },
  { id: 'vegetarian', label: 'Đồ chay' },
];
