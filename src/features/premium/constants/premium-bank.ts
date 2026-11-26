import type { PlanAudience } from '@/features/premium/api/premium';

/**
 * Tài khoản nhận tiền gói Cao cấp. Gói thanh toán bằng chuyển khoản VietQR vào tài khoản này;
 * quản trị viên đối soát sao kê theo nội dung chuyển khoản rồi kích hoạt gói bằng tay
 * (`POST /admin/premium/entitlements`). Số tài khoản vốn đưa công khai cho người chuyển nên đặt ở
 * biến EXPO_PUBLIC_* (nằm trong bundle app) là được.
 */
export const PREMIUM_BANK = {
  bin: process.env.EXPO_PUBLIC_PREMIUM_BANK_BIN?.trim() ?? '',
  bankName: process.env.EXPO_PUBLIC_PREMIUM_BANK_NAME?.trim() ?? '',
  accountNumber: process.env.EXPO_PUBLIC_PREMIUM_ACCOUNT_NUMBER?.trim() ?? '',
  accountName: process.env.EXPO_PUBLIC_PREMIUM_ACCOUNT_NAME?.trim() ?? '',
};

/** Đủ thông tin dựng mã VietQR: BIN 6 chữ số, số tài khoản 6–19 chữ số và tên chủ tài khoản. */
export const isPremiumBankConfigured =
  /^\d{6}$/.test(PREMIUM_BANK.bin) &&
  /^\d{6,19}$/.test(PREMIUM_BANK.accountNumber) &&
  PREMIUM_BANK.accountName !== '';

/**
 * Nội dung chuyển khoản để quản trị viên nhận ra ai mua gói nào: "LF PREMIUM B|M" kèm mã tài
 * khoản (publicId bỏ dấu gạch, đúng id API cấp quyền cần). Chỉ chữ và số vì ngân hàng bỏ ký tự đặc
 * biệt; dài 45 ký tự, vẫn dưới giới hạn 50 ký tự của VietQR.
 */
export function premiumTransferNote(audience: PlanAudience, publicId: string) {
  return `LF PREMIUM ${audience === 'BUYER' ? 'B' : 'M'} ${publicId.replace(/-/g, '').toUpperCase()}`;
}

/** Ảnh mã VietQR có sẵn số tiền và nội dung, cùng dạng backend dùng cho đơn chuyển khoản. */
export function premiumQrImageUrl(amount: number, note: string) {
  const query = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: note,
    accountName: PREMIUM_BANK.accountName,
  });

  return `https://img.vietqr.io/image/${PREMIUM_BANK.bin}-${PREMIUM_BANK.accountNumber}-compact2.png?${query.toString()}`;
}
