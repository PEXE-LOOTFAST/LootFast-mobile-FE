import type { Order } from '@/features/order/types';

// Dữ liệu mẫu cho tới khi có API đơn hàng. Giữ đúng shape của Order để lúc thay bằng
// hook TanStack Query không phải sửa lại component.
export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    code: '#LF24091401',
    status: 'confirmed',
    storeName: 'The Daily Bakery',
    storeAddress: '42 Nguyễn Thị Thập, Quận 7',
    emoji: '🥐',
    itemName: 'Túi bánh cuối ngày',
    quantity: 1,
    price: 39000,
    originalPrice: 80000,
    pickupLabel: '20:30 hôm nay',
  },
  {
    id: 'order-2',
    code: '#LF24091402',
    status: 'ready',
    storeName: 'Cơm Tấm Cô Ba',
    storeAddress: '3 Đường 53B, Tân Phong, Quận 7',
    emoji: '🍛',
    itemName: 'Cơm tấm sườn bì chả',
    quantity: 2,
    price: 78000,
    originalPrice: 130000,
    pickupLabel: '21:00 hôm nay',
  },
];
