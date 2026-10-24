/** Khớp SignupRequest của backend: đúng 9 chữ số, cho phép 0 đứng đầu. */
export const BACKEND_PHONE_PATTERN = /^\d{9}$/;

/** Giữ nguyên số 9 chữ số; chỉ bỏ 0 đầu của số nội địa có đúng 10 chữ số. */
export function toBackendPhone(phone: string): string {
  const trimmed = phone.trim();
  return /^0\d{9}$/.test(trimmed) ? trimmed.slice(1) : trimmed;
}

/**
 * Hiển thị số backend (9 chữ số) về dạng nội địa quen thuộc có số 0 đầu. Số không đúng 9 chữ số
 * thì giữ nguyên để không giấu dữ liệu lạ.
 */
export function toDisplayPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return BACKEND_PHONE_PATTERN.test(phone) ? `0${phone}` : phone;
}

/**
 * Chuẩn hoá từ khoá tìm kiếm cho admin: nếu người dùng gõ số điện thoại 10 chữ số có 0 đầu (hoặc
 * kèm dấu cách), đổi về dạng 9 chữ số mà backend lưu để khớp được. Chuỗi khác (tên, email) giữ
 * nguyên — chỉ động vào khi toàn bộ là chữ số.
 */
export function toSearchKeyword(keyword: string): string {
  const trimmed = keyword.trim();
  const digitsOnly = trimmed.replace(/\s+/g, '');
  return /^\d+$/.test(digitsOnly) ? toBackendPhone(digitsOnly) : trimmed;
}
