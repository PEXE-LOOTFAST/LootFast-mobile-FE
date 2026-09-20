import type { SellerDeal, SellerOrder, SellerPlan, SellerShop } from '@/features/seller/types';

// Dữ liệu mẫu cho tới khi có API người bán. Giữ đúng shape của SellerDeal/SellerOrder để
// lúc thay bằng hook TanStack Query không phải sửa lại component.
export const MOCK_SELLER_SHOP: SellerShop = { name: 'Quán Ăn Tester', isVerified: true };

export const MOCK_SELLER_PLAN: SellerPlan = {
  name: 'Miễn phí',
  dealPostsUsed: 0,
  dealPostsLimit: 10,
};

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?w=800&q=70&auto=format&fit=crop`;

export const MOCK_SELLER_DEALS: SellerDeal[] = [
  {
    id: 'deal-1',
    name: 'Cơm tấm sườn cuối ngày',
    emoji: '🍛',
    imageUrl: unsplash('1555939594-58d7cb561ad1'),
    status: 'running',
    portionsTotal: 12,
    portionsSold: 0,
    price: 39000,
    originalPrice: 65000,
    pickupWindow: { start: '18:00', end: '23:59' },
  },
  {
    id: 'deal-2',
    name: 'Combo canh chua cá',
    emoji: '🍲',
    imageUrl: unsplash('1569718212165-3a8278d5f624'),
    status: 'running',
    portionsTotal: 10,
    portionsSold: 0,
    price: 45000,
    originalPrice: 75000,
    pickupWindow: { start: '18:00', end: '22:30' },
  },
  {
    id: 'deal-3',
    name: 'Bánh mì thịt nướng',
    emoji: '🥖',
    imageUrl: unsplash('1600688640154-9619e002df30'),
    status: 'running',
    portionsTotal: 8,
    portionsSold: 0,
    price: 19000,
    originalPrice: 32000,
    pickupWindow: { start: '17:00', end: '21:00' },
  },
];

export const MOCK_SELLER_ORDERS: SellerOrder[] = [];
