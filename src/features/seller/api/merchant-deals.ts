import { ApiException, apiRequest, apiUpload } from '@/lib/api-client';
import type { PagedResponse } from '@/types/api';

export type DealStatusDto = 'DRAFT' | 'ACTIVE' | 'HIDDEN' | 'SOLD_OUT' | 'REMOVED';

export type DealImageDto = {
  imageId: string;
  imageUrl: string;
  displayOrder: number;
  createdAt: string;
};

/** Khớp MerchantDealResponse của backend. */
export type MerchantDealDto = {
  dealId: string;
  name: string;
  categoryCode: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  totalQuantity: number;
  remainingQuantity: number;
  committedQuantity: number;
  primaryImageUrl: string | null;
  images: DealImageDto[];
  preparationMinutes: number;
  saleStartsAt: string;
  saleEndsAt: string;
  /** Backend vẫn trả hai mốc này nhưng nay luôn bằng saleStartsAt/saleEndsAt (một khung duy nhất). */
  pickupStartsAt: string;
  pickupEndsAt: string;
  status: DealStatusDto;
  /** Khoá lạc quan: `PATCH .../quantity` bắt gửi kèm đúng version đang giữ. */
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateMerchantDealPayload = {
  name: string;
  categoryCode: string;
  originalPrice: number;
  discountedPrice: number;
  totalQuantity: number;
  preparationMinutes: number;
  /**
   * Khung giờ duy nhất của deal (ISO-8601 có múi giờ): vừa là lúc deal nhận đặt, vừa là phạm vi
   * người mua chọn giờ đến lấy.
   */
  saleStartsAt: string;
  saleEndsAt: string;
};

const BASE_PATH = '/merchants/me/deals';

export function listMerchantDeals(page = 0, size = 50) {
  const query = new URLSearchParams({ page: String(page), size: String(size) });

  return apiRequest<PagedResponse<MerchantDealDto>>(`${BASE_PATH}?${query.toString()}`);
}

export function getMerchantDeal(dealId: string) {
  return apiRequest<MerchantDealDto>(`${BASE_PATH}/${dealId}`);
}

/**
 * Sửa bản nháp. Backend chỉ cho sửa deal còn ở trạng thái DRAFT — deal đã đăng sẽ trả
 * DEAL_NOT_EDITABLE, lúc đó chỉ đổi được số lượng qua `updateMerchantDealQuantity`.
 */
export function updateMerchantDeal(dealId: string, payload: CreateMerchantDealPayload) {
  return apiRequest<MerchantDealDto>(`${BASE_PATH}/${dealId}`, { method: 'PUT', body: payload });
}

/** Tạo bản nháp. Deal chỉ lên sàn sau khi thêm ảnh rồi gọi `publishMerchantDeal`. */
export function createMerchantDeal(payload: CreateMerchantDealPayload) {
  return apiRequest<MerchantDealDto>(BASE_PATH, { method: 'POST', body: payload });
}

export function publishMerchantDeal(dealId: string) {
  return apiRequest<MerchantDealDto>(`${BASE_PATH}/${dealId}/publish`, { method: 'POST' });
}

export function updateMerchantDealQuantity(
  dealId: string,
  totalQuantity: number,
  expectedVersion: number,
) {
  return apiRequest<MerchantDealDto>(`${BASE_PATH}/${dealId}/quantity`, {
    method: 'PATCH',
    body: { totalQuantity, expectedVersion },
  });
}

/** Backend giới hạn 5 ảnh mỗi deal (ReorderDealImagesRequest @Size(max = 5)). */
export const MAX_DEAL_IMAGES = 5;

export function uploadDealImage(dealId: string, imageUri: string) {
  return apiUpload<MerchantDealDto>(`${BASE_PATH}/${dealId}/images`, {
    files: { file: { uri: imageUri } },
  });
}

export function removeDealImage(dealId: string, imageId: string) {
  return apiRequest<MerchantDealDto>(`${BASE_PATH}/${dealId}/images/${imageId}`, {
    method: 'DELETE',
  });
}

/** Thứ tự truyền vào quyết định ảnh chính: phần tử đầu tiên trở thành ảnh đại diện của deal. */
export function reorderDealImages(dealId: string, imageIds: string[]) {
  return apiRequest<MerchantDealDto>(`${BASE_PATH}/${dealId}/images/order`, {
    method: 'PUT',
    body: { imageIds },
  });
}

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang tiếng Việt ở đây.
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCESS_DENIED: 'Tài khoản chưa được cấp quyền Người bán.',
  MERCHANT_PROFILE_NOT_FOUND: 'Chưa có hồ sơ quán. Điền thông tin quán trước khi đăng deal.',
  MERCHANT_NOT_APPROVED: 'Hồ sơ người bán chưa được duyệt.',
  MERCHANT_PROFILE_INCOMPLETE: 'Hồ sơ quán còn thiếu thông tin bắt buộc.',
  DEAL_NOT_FOUND: 'Deal không còn tồn tại.',
  DEAL_NOT_EDITABLE: 'Deal đã đăng nên không sửa được nữa.',
  DEAL_NOT_PUBLISHABLE: 'Deal chưa đủ điều kiện đăng — kiểm tra ảnh, giá và lịch bán.',
  DEAL_IMAGE_REQUIRED: 'Deal cần ít nhất một ảnh trước khi đăng.',
  INVALID_DEAL_PRICE: 'Giá deal phải nhỏ hơn giá gốc.',
  INVALID_DEAL_SCHEDULE:
    'Khung giờ deal không hợp lệ — giờ đóng phải sau giờ mở và trong cùng ngày.',
  DEAL_OUTSIDE_OPENING_HOURS: 'Khung giờ deal nằm ngoài giờ mở cửa của quán.',
  DEAL_QUANTITY_CONFLICT: 'Số lượng mới nhỏ hơn số suất khách đã đặt.',
  DEAL_VERSION_CONFLICT: 'Deal vừa được cập nhật ở nơi khác. Tải lại rồi thử lại.',
  VALIDATION_FAILED: 'Thông tin deal không hợp lệ. Kiểm tra lại các ô đã nhập.',
  DEAL_IMAGE_NOT_FOUND: 'Ảnh không còn tồn tại. Tải lại danh sách ảnh.',
  DEAL_IMAGE_LIMIT_REACHED: `Mỗi deal chỉ đăng được tối đa ${MAX_DEAL_IMAGES} ảnh.`,
  INVALID_DEAL_IMAGE: 'Ảnh không hợp lệ. Chỉ nhận JPEG hoặc PNG.',
  DEAL_IMAGE_TOO_LARGE: 'Ảnh vượt quá dung lượng cho phép. Chọn ảnh nhỏ hơn.',
  DEAL_IMAGE_UPLOAD_FAILED: 'Không tải được ảnh lên. Vui lòng thử lại.',
};

export function toMerchantDealErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return MESSAGES[error.code] ?? `Thao tác không thành công (${error.code}). Vui lòng thử lại.`;
  }

  // Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
