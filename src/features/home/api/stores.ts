import { DEFAULT_DEAL_LOCATION, type DealFeedItemResponse } from '@/features/home/api/deals';
import { ApiException, apiRequest } from '@/lib/api-client';
import type { PagedResponse } from '@/types/api';

export type OpeningHourSlot = {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  opensAt: string;
  closesAt: string;
};

/** Khớp PublicStoreProfileResponse của backend. */
export type PublicStoreResponse = {
  merchantId: string;
  storeName: string;
  description: string | null;
  businessCategory: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  address: {
    addressLine: string | null;
    ward: string | null;
    district: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  verified: boolean;
  rating: { averageRating: number | null; reviewCount: number } | null;
  openingHours: OpeningHourSlot[];
  activeDeals: PagedResponse<DealFeedItemResponse>;
};

export function getStore(merchantId: string) {
  // Gửi kèm vị trí để backend tính khoảng cách cho từng deal, giống feed trang chủ.
  const query = new URLSearchParams({
    latitude: String(DEFAULT_DEAL_LOCATION.latitude),
    longitude: String(DEFAULT_DEAL_LOCATION.longitude),
    dealPage: '0',
    dealSize: '50',
  });

  return apiRequest<PublicStoreResponse>(`/stores/${merchantId}?${query.toString()}`);
}

export function toStoreErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    const messages: Record<string, string> = {
      MERCHANT_PROFILE_NOT_FOUND: 'Cửa hàng không còn tồn tại hoặc đã ngừng hoạt động.',
    };

    return messages[error.code] ?? 'Không tải được thông tin cửa hàng. Vui lòng thử lại.';
  }

  // Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
