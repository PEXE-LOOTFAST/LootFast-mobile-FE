export type DealCategoryId =
  'all' | 'rice-noodle' | 'banh-mi' | 'bakery' | 'drink' | 'vegetarian' | 'other';

export type DealCategory = {
  id: DealCategoryId;
  label: string;
};

export type Store = {
  name: string;
  rating: number;
  isVerified: boolean;
  address: string;
};

export type Deal = {
  id: string;
  name: string;
  categoryId: Exclude<DealCategoryId, 'all'>;
  store: Store;
  imageUrl: string;
  emoji: string;
  price: number;
  originalPrice: number;
  pickupWindow: { start: string; end: string };
  distanceKm: number;
  remaining: number;
};

export type DealReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
};

/** Mức giảm giá tối thiểu (%) của bộ lọc nâng cao. */
export type DiscountFilter = 30 | 40 | 50;

export type PickupFilter = 'any' | 'before-20' | 'after-20';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  isRead: boolean;
};

export type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};
