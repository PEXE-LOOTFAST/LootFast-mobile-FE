import { ApiException } from '@/lib/api-client';

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang câu tiếng Việt ở đây.
const MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: 'Email hoặc mật khẩu không đúng định dạng.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  ACCOUNT_NOT_VERIFIED:
    'Tài khoản chưa xác thực email. Kiểm tra hộp thư để xác thực trước khi đăng nhập.',
  USER_NOT_FOUND: 'Email hoặc mật khẩu không đúng.',
};

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return MESSAGES[error.code] ?? 'Đăng nhập không thành công. Vui lòng thử lại.';
  }

  // Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
