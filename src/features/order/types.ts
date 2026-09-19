export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';

export type Order = {
  id: string;
  code: string;
  status: OrderStatus;
  storeName: string;
  storeAddress: string;
  emoji: string;
  itemName: string;
  quantity: number;
  price: number;
  originalPrice: number;
  pickupLabel: string;
  /** Ngày hoàn thành (ISO), chỉ có ở đơn đã hoàn thành — dùng để cộng tiết kiệm theo ngày. */
  completedAt?: string;
};

export type SavingsView = 'week' | 'category';
