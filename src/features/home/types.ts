export type DealCategoryId = 'all' | 'rice-noodle' | 'banh-mi' | 'bakery' | 'drink' | 'vegetarian';

export type DealCategory = {
  id: DealCategoryId;
  label: string;
};

export type Store = {
  name: string;
  rating: number;
  isVerified: boolean;
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
