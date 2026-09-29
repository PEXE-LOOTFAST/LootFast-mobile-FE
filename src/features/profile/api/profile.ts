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
