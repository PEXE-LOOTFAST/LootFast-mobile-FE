import { ApiException, apiRequest, apiUpload, type UploadFile } from '@/lib/api-client';

export type MerchantApplicationStatusDto =
  'UPLOADING' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'UPLOAD_FAILED';

/** Khớp MerchantApplicationResponse của backend — cùng DTO mà khu quản trị đọc. */
export type MyMerchantApplicationDto = {
  applicationId: string;
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  userRoles: string[];
  businessLicenseNumber: string;
  status: MerchantApplicationStatusDto;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedByAdminId: string | null;
};

/**
 * Nộp hồ sơ đăng ký bán hàng. Backend nhận multipart gồm số giấy phép và ảnh giấy phép
 * (JPEG/PNG, tối đa 5 MB), và chỉ cho tài khoản BUYER gửi.
 */
export function submitMerchantApplication(businessLicenseNumber: string, license: UploadFile) {
  return apiUpload<MyMerchantApplicationDto>('/merchant-applications', {
    fields: { businessLicenseNumber: businessLicenseNumber.trim() },
    files: { file: license },
  });
}

export function getMyMerchantApplication() {
  return apiRequest<MyMerchantApplicationDto>('/merchant-applications/me');
}

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang tiếng Việt ở đây.
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCESS_DENIED: 'Tài khoản này không gửi được hồ sơ đăng ký bán hàng.',
  VALIDATION_FAILED: 'Thông tin hồ sơ chưa hợp lệ. Kiểm tra lại số giấy phép.',
  MERCHANT_APPLICATION_ALREADY_PENDING: 'Bạn đã có hồ sơ đang chờ duyệt.',
  MERCHANT_ALREADY_APPROVED:
    'Tài khoản đã được duyệt làm người bán nên không đăng ký lại được. Nếu hồ sơ quán còn trống, hãy liên hệ quản trị viên.',
  INVALID_LICENSE_DOCUMENT: 'Ảnh giấy phép không hợp lệ. Chỉ nhận JPEG hoặc PNG.',
  LICENSE_DOCUMENT_TOO_LARGE: 'Ảnh giấy phép vượt quá 5 MB. Chọn ảnh nhỏ hơn.',
  LICENSE_UPLOAD_FAILED: 'Không tải được ảnh giấy phép. Vui lòng thử lại.',
  MERCHANT_APPLICATION_NOT_FOUND: 'Bạn chưa gửi hồ sơ đăng ký nào.',
};

export function toMerchantApplicationErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    if (error.code === 'NETWORK_ERROR') {
      return 'Không gửi được ảnh giấy phép. Kiểm tra mạng, hoặc chọn ảnh khác nhỏ hơn.';
    }
    if (error.code === 'INVALID_RESPONSE') {
      return 'Máy chủ đang gặp sự cố. Thử lại sau ít phút, hoặc chọn ảnh nhỏ hơn.';
    }

    return MESSAGES[error.code] ?? 'Gửi hồ sơ không thành công. Vui lòng thử lại.';
  }

  // Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
