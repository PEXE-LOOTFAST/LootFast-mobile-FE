import { ApiException, apiRequest } from '@/lib/api-client';

/** Khớp MerchantBankAccountResponse — chỉ chính chủ quán đọc được nên số tài khoản không bị che. */
export type MerchantBankAccountDto = {
  bankBin: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  updatedAt: string;
};

export type UpdateBankAccountPayload = {
  /** Mã BIN ngân hàng, đúng 6 chữ số — backend cần để dựng mã VietQR. */
  bankBin: string;
  bankName: string;
  /** 6–19 chữ số, không chứa khoảng trắng hay dấu. */
  accountNumber: string;
  accountHolderName: string;
};

export function getBankAccount() {
  return apiRequest<MerchantBankAccountDto>('/merchants/me/bank-account');
}

export function updateBankAccount(payload: UpdateBankAccountPayload) {
  return apiRequest<MerchantBankAccountDto>('/merchants/me/bank-account', {
    method: 'PUT',
    body: payload,
  });
}

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang tiếng Việt ở đây.
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCESS_DENIED: 'Tài khoản chưa được cấp quyền Người bán.',
  BANK_ACCOUNT_NOT_FOUND: 'Chưa thiết lập tài khoản nhận tiền.',
  BANK_ACCOUNT_IN_USE: 'Tài khoản đang gắn với đơn chưa thanh toán nên chưa đổi được.',
  MERCHANT_PROFILE_NOT_FOUND: 'Chưa có hồ sơ quán. Điền thông tin quán trước đã.',
  VALIDATION_FAILED: 'Thông tin tài khoản chưa hợp lệ. Kiểm tra lại mã BIN và số tài khoản.',
};

export function toBankAccountErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return MESSAGES[error.code] ?? 'Thao tác không thành công. Vui lòng thử lại.';
  }

  // Không phải lỗi từ backend: mất mạng, sai EXPO_PUBLIC_API_URL, server chưa chạy...
  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
