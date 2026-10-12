import { ApiException, apiRequest } from '@/lib/api-client';

/** Khớp DiscoveryPreferencesResponse của backend (PUT /users/me/discovery-preferences). */
export type DiscoveryPreferences = {
  pickupArea: string | null;
  favoriteCategories: string[];
};

// Backend giới hạn: khu vực tối đa 255 ký tự, tối đa 20 nhóm món.
export const PICKUP_AREA_MAX_LENGTH = 255;
export const FAVORITE_CATEGORIES_MAX = 20;

export function updateDiscoveryPreferences(preferences: DiscoveryPreferences) {
  return apiRequest<DiscoveryPreferences>('/users/me/discovery-preferences', {
    method: 'PUT',
    body: preferences,
  });
}

export function toPreferencesErrorMessage(error: unknown) {
  if (!(error instanceof ApiException)) {
    return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  }

  const messages: Record<string, string> = {
    UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    VALIDATION_FAILED: 'Thông tin chưa hợp lệ. Kiểm tra khu vực và nhóm món rồi thử lại.',
  };

  return messages[error.code] ?? 'Không lưu được thay đổi. Vui lòng thử lại.';
}
