import { apiRequest, ApiException } from '@/lib/api-client';
import type { Deal, DealCategoryId } from '@/features/home/types';

export type DealFeedItemResponse = {
  dealId: string;
  name: string;
  categoryCode: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  remainingQuantity: number;
  primaryImageUrl: string | null;
  preparationMinutes: number;
  pickupStart: string;
  pickupEnd: string;
  distanceKm: number;
  merchant: {
    merchantId: string;
    storeName: string;
    addressLine: string;
    ward: string | null;
    district: string | null;
    city: string | null;
    verified: boolean;
  };
};

export type DealDetailResponse = DealFeedItemResponse & {
  availableFrom: string;
  availableUntil: string;
  status: string;
  inventoryVersion: number;
  updatedAt: string;
  rating: {
    averageRating: number | null;
    reviewCount: number;
  } | null;
  merchant: DealFeedItemResponse['merchant'] & { logoUrl: string | null };
};

type PagedResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type DealQuery = {
  latitude?: number;
  longitude?: number;
  radiusKm: number;
  keyword?: string;
  categoryCode?: string;
};

// Toạ độ dự phòng (trung tâm TP.HCM) khi chưa có GPS của người dùng.
export const DEFAULT_DEAL_LOCATION = {
  latitude: 10.7769,
  longitude: 106.7009,
};

function toTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';

  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

function toAddress(merchant: DealFeedItemResponse['merchant']) {
  return [merchant.addressLine, merchant.ward, merchant.district, merchant.city]
    .filter(Boolean)
    .join(', ');
}

function toCategoryId(categoryCode: string): Exclude<DealCategoryId, 'all'> {
  const normalized = categoryCode.trim().toLowerCase();
  const aliases: Record<string, Exclude<DealCategoryId, 'all'>> = {
    'rice-noodle': 'rice-noodle',
    rice_noodle: 'rice-noodle',
    'banh-mi': 'banh-mi',
    banh_mi: 'banh-mi',
    bakery: 'bakery',
    drink: 'drink',
    vegetarian: 'vegetarian',
  };

  return aliases[normalized] ?? 'other';
}

export function toDeal(response: DealFeedItemResponse | DealDetailResponse): Deal {
  return {
    id: response.dealId,
    name: response.name,
    categoryId: toCategoryId(response.categoryCode),
    store: {
      merchantId: response.merchant.merchantId,
      name: response.merchant.storeName,
      rating:
        'rating' in response && response.rating?.averageRating != null
          ? response.rating.averageRating
          : 0,
      reviewCount: 'rating' in response ? (response.rating?.reviewCount ?? 0) : 0,
      isVerified: response.merchant.verified,
      address: toAddress(response.merchant),
    },
    imageUrl: response.primaryImageUrl ?? '',
    // BE chưa trả emoji; DealImage sẽ dùng fallback hiện có khi URI rỗng.
    emoji: '🍱',
    price: response.discountedPrice,
    originalPrice: response.originalPrice,
    pickupWindow: {
      start: toTimeLabel(response.pickupStart),
      end: toTimeLabel(response.pickupEnd),
    },
    distanceKm: response.distanceKm,
    remaining: response.remainingQuantity,
  };
}

function buildQuery(params: DealQuery) {
  const location = {
    ...DEFAULT_DEAL_LOCATION,
    ...params,
  };
  const query = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    radiusKm: String(params.radiusKm),
    page: '0',
    size: '50',
  });

  if (params.keyword?.trim()) query.set('keyword', params.keyword.trim());
  if (params.categoryCode) query.set('categoryCode', params.categoryCode);

  return query.toString();
}

export async function getDeals(params: DealQuery) {
  const response = await apiRequest<PagedResponse<DealFeedItemResponse>>(
    `/deals?${buildQuery(params)}`,
  );

  return response.items.map(toDeal);
}

export async function getDeal(dealId: string) {
  const response = await apiRequest<DealDetailResponse>(`/deals/${dealId}`);
  return toDeal(response);
}

export function getDealErrorMessage(error: unknown) {
  if (!(error instanceof ApiException))
    return 'Không thể tải dữ liệu deal. Kiểm tra kết nối và thử lại.';

  const messages: Record<string, string> = {
    DEAL_NOT_FOUND: 'Deal này không còn tồn tại hoặc đã được gỡ xuống.',
    DEAL_INACTIVE: 'Deal này hiện không còn hoạt động.',
    VALIDATION_FAILED: 'Thông tin tìm kiếm chưa hợp lệ.',
  };

  return messages[error.code] ?? 'Không thể tải dữ liệu deal. Vui lòng thử lại.';
}
