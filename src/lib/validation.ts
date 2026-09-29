export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^0\d{9}$/;
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_NAME_LENGTH = 2;

/** Bắt buộc nhập và phải đúng định dạng email. `emptyMessage` cho phép đổi lời nhắc theo màn. */
export function checkEmail(value: string, emptyMessage = 'Vui lòng nhập email') {
  const email = value.trim();

  if (!email) return emptyMessage;

  return EMAIL_PATTERN.test(email) ? undefined : 'Email không hợp lệ';
}

/** `optional` cho các form mà số điện thoại không bắt buộc, nhưng đã nhập thì phải đúng. */
export function checkPhone(value: string, { optional = false } = {}) {
  const phone = value.trim();

  if (!phone) return optional ? undefined : 'Vui lòng nhập số điện thoại';

  return PHONE_PATTERN.test(phone) ? undefined : 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0';
}

export function checkFullName(value: string) {
  return value.trim().length >= MIN_NAME_LENGTH ? undefined : 'Vui lòng nhập họ và tên';
}

export function checkRequired(value: string, message: string) {
  return value.trim() ? undefined : message;
}

export function checkTime(value: string, message: string) {
  return TIME_PATTERN.test(value) ? undefined : message;
}

/** Hai ô mật khẩu phải khớp nhau và không được bỏ trống. */
export function checkPasswordMatch(confirmPassword: string, password: string) {
  return confirmPassword && confirmPassword === password
    ? undefined
    : 'Mật khẩu nhập lại không khớp';
}
