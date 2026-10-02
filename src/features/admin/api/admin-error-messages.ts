import { ApiException } from '@/lib/api-client';

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang tiếng Việt ở đây.
const REVIEW_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCESS_DENIED: 'Tài khoản này không có quyền duyệt hồ sơ.',
  USER_NOT_FOUND: 'Không tìm thấy tài khoản quản trị.',
  VALIDATION_FAILED: 'Lý do từ chối không hợp lệ (tối đa 500 ký tự).',
  MERCHANT_APPLICATION_NOT_FOUND: 'Hồ sơ không còn tồn tại. Hãy tải lại danh sách.',
  MERCHANT_APPLICATION_NOT_PENDING:
    'Hồ sơ đã được quản trị viên khác xử lý. Hãy tải lại danh sách.',
  LICENSE_ACCESS_FAILED: 'Không mở được giấy phép lúc này. Thử lại sau ít phút.',
  RESOURCE_BUSY: 'Hồ sơ đang được xử lý. Thử lại sau giây lát.',
};

const DEAL_IMAGE_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCESS_DENIED: 'Tài khoản này không có quyền gỡ ảnh deal.',
  DEAL_IMAGE_NOT_FOUND: 'Không tìm thấy ảnh với mã này. Kiểm tra lại mã ảnh.',
  DEAL_IMAGE_REQUIRED: 'Không gỡ được ảnh cuối cùng của deal đang hiển thị.',
  VALIDATION_FAILED: 'Lý do gỡ ảnh không hợp lệ (tối đa 500 ký tự).',
};

const SIGNIN_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: 'Email hoặc mật khẩu không đúng định dạng.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  USER_NOT_FOUND: 'Email hoặc mật khẩu không đúng.',
  ACCOUNT_NOT_VERIFIED: 'Tài khoản chưa xác thực email.',
  ACCESS_DENIED: 'Tài khoản này không có quyền quản trị.',
};

// Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
const OFFLINE_MESSAGE = 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';

function toMessage(error: unknown, messages: Record<string, string>, fallback: string) {
  if (error instanceof ApiException) return messages[error.code] ?? fallback;

  return OFFLINE_MESSAGE;
}

/** Lỗi khi duyệt / từ chối / xem giấy phép của một hồ sơ. */
export function toAdminErrorMessage(error: unknown): string {
  return toMessage(error, REVIEW_MESSAGES, 'Thao tác không thành công. Vui lòng thử lại.');
}

/** Lỗi khi gỡ ảnh deal vi phạm. */
export function toDealImageErrorMessage(error: unknown): string {
  return toMessage(error, DEAL_IMAGE_MESSAGES, 'Gỡ ảnh không thành công. Vui lòng thử lại.');
}

/** Lỗi khi đăng nhập ở cổng quản trị. */
export function toAdminSigninErrorMessage(error: unknown): string {
  return toMessage(error, SIGNIN_MESSAGES, 'Đăng nhập không thành công. Vui lòng thử lại.');
}
