/** Khớp SignupRequest của backend: đúng 9 chữ số, cho phép 0 đứng đầu. */
export const BACKEND_PHONE_PATTERN = /^\d{9}$/;

/** Giữ nguyên số 9 chữ số; chỉ bỏ 0 đầu của số nội địa có đúng 10 chữ số. */
export function toBackendPhone(phone: string): string {
  const trimmed = phone.trim();
  return /^0\d{9}$/.test(trimmed) ? trimmed.slice(1) : trimmed;
}
