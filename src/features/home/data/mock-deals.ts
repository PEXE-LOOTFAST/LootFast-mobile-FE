import type { Deal, DealCategory } from '@/features/home/types';

// Dữ liệu mẫu cho tới khi có API deals. Giữ đúng shape của Deal để lúc thay bằng
// hook TanStack Query không phải sửa lại component.

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?w=800&q=70&auto=format&fit=crop`;

export const DEAL_CATEGORIES: DealCategory[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'rice-noodle', label: 'Cơm/Bún phở' },
  { id: 'banh-mi', label: 'Bánh mì' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'drink', label: 'Đồ uống' },
  { id: 'vegetarian', label: 'Đồ chay' },
];

export const MOCK_LOCATION = {
  address: 'Quận 7, TP. Hồ Chí Minh',
  radiusKm: 3,
};

export const MOCK_UNREAD_NOTIFICATIONS = 3;

export const MOCK_DEALS: Deal[] = [
  {
    id: 'deal-com-tam',
    name: 'Cơm tấm sườn bì chả',
    categoryId: 'rice-noodle',
    store: { name: 'Cơm Tấm Cô Ba', rating: 4.7, isVerified: true },
    imageUrl: unsplash('1555939594-58d7cb561ad1'),
    emoji: '🍛',
    price: 39000,
    originalPrice: 65000,
    pickupWindow: { start: '18:00', end: '21:00' },
    distanceKm: 0.4,
    remaining: 5,
  },
  {
    id: 'deal-pho-bo',
    name: 'Phở bò tái nạm',
    categoryId: 'rice-noodle',
    store: { name: 'Phở Gia Truyền 24', rating: 4.9, isVerified: true },
    imageUrl: unsplash('1582878826629-29b7ad1cdc43'),
    emoji: '🍜',
    price: 42000,
    originalPrice: 60000,
    pickupWindow: { start: '19:30', end: '22:00' },
    distanceKm: 1.5,
    remaining: 1,
  },
  {
    id: 'deal-banh-mi',
    name: 'Combo bánh mì cuối ngày',
    categoryId: 'banh-mi',
    store: { name: 'Lò Bánh Mì Hòa Mã', rating: 4.8, isVerified: true },
    imageUrl: unsplash('1509440159596-0249088772ff'),
    emoji: '🥖',
    price: 15000,
    originalPrice: 30000,
    pickupWindow: { start: '19:00', end: '21:30' },
    distanceKm: 0.8,
    remaining: 2,
  },
  {
    id: 'deal-bakery',
    name: 'Túi bánh ngọt bất ngờ',
    categoryId: 'bakery',
    store: { name: 'The Daily Bakery', rating: 4.6, isVerified: false },
    imageUrl: unsplash('1551024601-bec78aea704b'),
    emoji: '🍩',
    price: 45000,
    originalPrice: 90000,
    pickupWindow: { start: '20:00', end: '21:30' },
    distanceKm: 1.2,
    remaining: 3,
  },
  {
    id: 'deal-tra-trai-cay',
    name: 'Trà trái cây nhiệt đới',
    categoryId: 'drink',
    store: { name: 'Tiệm Trà Mát', rating: 4.5, isVerified: true },
    imageUrl: unsplash('1544145945-f90425340c7e'),
    emoji: '🧋',
    price: 22000,
    originalPrice: 35000,
    pickupWindow: { start: '17:30', end: '22:00' },
    distanceKm: 0.6,
    remaining: 8,
  },
  {
    id: 'deal-salad-chay',
    name: 'Salad rau củ sốt mè rang',
    categoryId: 'vegetarian',
    store: { name: 'Green Bowl', rating: 4.4, isVerified: true },
    imageUrl: unsplash('1512621776951-a57141f2eefd'),
    emoji: '🥗',
    price: 35000,
    originalPrice: 59000,
    pickupWindow: { start: '18:30', end: '21:00' },
    distanceKm: 2.1,
    remaining: 6,
  },
];
