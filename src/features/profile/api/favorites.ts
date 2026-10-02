import type { DealDetailResponse } from '@/features/home/api/deals';
import { ApiException, apiRequest } from '@/lib/api-client';
import type { PagedResponse } from '@/types/api';

export type FavoriteTypeDto = 'DEAL' | 'STORE';

export type FavoriteStoreDto = {
  merchantId: string;
  storeName: string;
  logoUrl: string | null;
  addressLine: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  verified: boolean;
};

/** Khớp FavoriteItemResponse: `deal` có khi type là DEAL, `store` có khi type là STORE. */
export type FavoriteItemDto = {
  type: FavoriteTypeDto;
  savedAt: string;
  deal: DealDetailResponse | null;
  store: FavoriteStoreDto | null;
};

const BASE_PATH = '/users/me/favorites';

export function listFavorites(page = 0, size = 50) {
  const query = new URLSearchParams({ page: String(page), size: String(size) });

  return apiRequest<PagedResponse<FavoriteItemDto>>(`${BASE_PATH}?${query.toString()}`);
}

export function saveFavoriteDeal(dealId: string) {
  return apiRequest<FavoriteItemDto>(`${BASE_PATH}/deals/${dealId}`, { method: 'PUT' });
}

/** Bỏ lưu trả 204 không có body. */
export function removeFavoriteDeal(dealId: string) {
  return apiRequest<void>(`${BASE_PATH}/deals/${dealId}`, { method: 'DELETE' });
}

export function saveFavoriteStore(merchantId: string) {
  return apiRequest<FavoriteItemDto>(`${BASE_PATH}/stores/${merchantId}`, { method: 'PUT' });
}

export function removeFavoriteStore(merchantId: string) {
  return apiRequest<void>(`${BASE_PATH}/stores/${merchantId}`, { method: 'DELETE' });
}

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang tiếng Việt ở đây.
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FAVORITE_LIMIT_REACHED: 'Bạn đã lưu tối đa số mục yêu thích. Bỏ bớt rồi lưu tiếp nhé.',
  DEAL_NOT_FOUND: 'Deal không còn tồn tại.',
  MERCHANT_PROFILE_NOT_FOUND: 'Cửa hàng không còn tồn tại.',
};

export function toFavoriteErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return MESSAGES[error.code] ?? 'Thao tác không thành công. Vui lòng thử lại.';
  }

  // Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
