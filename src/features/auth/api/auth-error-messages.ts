import { ApiException } from '@/lib/api-client';

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang câu tiếng Việt ở đây.
const SIGNIN_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: 'Email hoặc mật khẩu không đúng định dạng.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  ACCOUNT_NOT_VERIFIED:
    'Tài khoản chưa xác thực email. Kiểm tra hộp thư để xác thực trước khi đăng nhập.',
  USER_NOT_FOUND: 'Email hoặc mật khẩu không đúng.',
};

const SIGNUP_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: 'Thông tin đăng ký chưa hợp lệ. Kiểm tra lại các ô đã nhập.',
  DUPLICATE_EMAIL: 'Email này đã có tài khoản. Hãy đăng nhập hoặc dùng email khác.',
  DUPLICATE_PHONE: 'Số điện thoại này đã có tài khoản.',
  PASSWORD_MISMATCH: 'Hai lần nhập mật khẩu chưa khớp nhau.',
  CONSENT_REQUIRED: 'Cần đồng ý điều khoản sử dụng và chính sách bảo mật.',
};

const OTP_MESSAGES: Record<string, string> = {
  OTP_INVALID: 'Mã xác thực không đúng. Kiểm tra lại mã trong email.',
  OTP_EXPIRED: 'Mã xác thực đã hết hạn. Bấm "Gửi lại mã" để nhận mã mới.',
  VALIDATION_FAILED: 'Mã xác thực gồm 6 chữ số.',
  USER_NOT_FOUND: 'Không tìm thấy tài khoản ứng với email này.',
};

const PASSWORD_RESET_MESSAGES: Record<string, string> = {
  ...OTP_MESSAGES,
  PASSWORD_MISMATCH: 'Hai lần nhập mật khẩu mới chưa khớp nhau.',
  VALIDATION_FAILED: 'Mật khẩu mới phải từ 8 ký tự và mã xác thực gồm 6 chữ số.',
};

// Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
const OFFLINE_MESSAGE = 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';

function toMessage(error: unknown, messages: Record<string, string>, fallback: string) {
  if (error instanceof ApiException) return messages[error.code] ?? fallback;

  return OFFLINE_MESSAGE;
}

export function toAuthErrorMessage(error: unknown): string {
  return toMessage(error, SIGNIN_MESSAGES, 'Đăng nhập không thành công. Vui lòng thử lại.');
}

export function toSignupErrorMessage(error: unknown): string {
  return toMessage(error, SIGNUP_MESSAGES, 'Tạo tài khoản không thành công. Vui lòng thử lại.');
}

export function toOtpErrorMessage(error: unknown): string {
  return toMessage(error, OTP_MESSAGES, 'Xác thực không thành công. Vui lòng thử lại.');
}

export function toPasswordResetErrorMessage(error: unknown): string {
  return toMessage(
    error,
    PASSWORD_RESET_MESSAGES,
    'Đặt lại mật khẩu không thành công. Vui lòng thử lại.',
  );
}
