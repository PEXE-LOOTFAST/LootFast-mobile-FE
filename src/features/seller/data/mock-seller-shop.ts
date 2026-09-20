import type { SellerDeal, SellerOrder, SellerShop } from '@/features/seller/types';

// Dữ liệu mẫu cho tới khi có API người bán. Giữ đúng shape của SellerDeal/SellerOrder để
// lúc thay bằng hook TanStack Query không phải sửa lại component.
export const MOCK_SELLER_SHOP: SellerShop = { name: 'Quán Ăn Tester', isVerified: true };

export const MOCK_SELLER_DEALS: SellerDeal[] = [
  {
    id: 'deal-1',
    name: 'Cơm tấm sườn cuối ngày',
    emoji: '🍛',
    status: 'running',
    portionsTotal: 12,
    portionsSold: 0,
    price: 39000,
  },
  {
    id: 'deal-2',
    name: 'Combo canh chua cá',
    emoji: '🍲',
    status: 'running',
    portionsTotal: 10,
    portionsSold: 0,
    price: 45000,
  },
  {
    id: 'deal-3',
    name: 'Bánh mì thịt nướng',
    emoji: '🥖',
    status: 'running',
    portionsTotal: 8,
    portionsSold: 0,
    price: 19000,
  },
];

export const MOCK_SELLER_ORDERS: SellerOrder[] = [];
