import { ApiException, apiRequest } from '@/lib/api-client';

export type CurrentUserResponse = {
  publicId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  roles: string[];
  displayName: string;
  avatarUrl: string | null;
  /** Khu vực nhận món người dùng đã lưu; null nếu chưa đặt. */
  pickupArea: string | null;
  /** Mã nhóm món yêu thích (code của /categories). */
  favoriteCategories: string[];
  createdAt: string;
};

export function getCurrentUser() {
  return apiRequest<CurrentUserResponse>('/users/me');
}

export function getProfileErrorMessage(error: unknown) {
  if (!(error instanceof ApiException)) {
    return 'Không thể tải thông tin hồ sơ. Kiểm tra kết nối và thử lại.';
  }

  const messages: Record<string, string> = {
    UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    USER_NOT_FOUND: 'Không tìm thấy thông tin tài khoản.',
    VALIDATION_FAILED: 'Thông tin tài khoản không hợp lệ.',
  };

  return messages[error.code] ?? 'Không thể tải thông tin hồ sơ. Vui lòng thử lại.';
}

/**
 * Cập nhật một phần (PUT /users/me/profile): trường không gửi thì backend giữ nguyên. Không có email
 * (đổi email sẽ có luồng OTP riêng). Số điện thoại phải đúng 9 chữ số, không số 0 đầu.
 */
export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
};

/** Trả về hồ sơ mới nhất, giống hệt GET /users/me. */
export function updateProfile(payload: UpdateProfilePayload) {
  return apiRequest<CurrentUserResponse>('/users/me/profile', { method: 'PUT', body: payload });
}

// Dùng error.code (enum ổn định), không hiển thị error.message của backend.
export function toUpdateProfileErrorMessage(error: unknown) {
  if (!(error instanceof ApiException)) {
    return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  }

  const messages: Record<string, string> = {
    VALIDATION_FAILED: 'Thông tin chưa hợp lệ. Kiểm tra lại họ tên và số điện thoại.',
    DUPLICATE_PHONE: 'Số điện thoại này đã được tài khoản khác sử dụng.',
    UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    USER_NOT_FOUND: 'Không tìm thấy tài khoản. Vui lòng đăng nhập lại.',
  };

  return messages[error.code] ?? 'Không lưu được thay đổi. Vui lòng thử lại.';
}
