import type { FormErrors, LoginValues, RegisterValues } from '@/features/auth/types';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^0\d{9}$/;

export const MIN_PASSWORD_LENGTH = 8;

export function validateLogin(values: LoginValues): FormErrors<LoginValues> {
  const email = values.email.trim();

  // Backend chỉ nhận email (POST /auth/signin), không có đăng nhập bằng username.
  return {
    email: !email
      ? 'Vui lòng nhập email'
      : EMAIL_PATTERN.test(email)
        ? undefined
        : 'Email không hợp lệ',
    // Không kiểm tra độ dài ở màn đăng nhập: tài khoản cũ có thể được tạo trước khi áp quy tắc mới.
    password: values.password ? undefined : 'Vui lòng nhập mật khẩu',
  };
}

export function validateRegister(values: RegisterValues): FormErrors<RegisterValues> {
  const email = values.email.trim();
  const phone = values.phone.trim();

  return {
    fullName: values.fullName.trim().length >= 2 ? undefined : 'Vui lòng nhập họ và tên',
    email: !email
      ? 'Vui lòng nhập email'
      : EMAIL_PATTERN.test(email)
        ? undefined
        : 'Email không hợp lệ',
    phone: !phone
      ? 'Vui lòng nhập số điện thoại'
      : PHONE_PATTERN.test(phone)
        ? undefined
        : 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0',
    password:
      values.password.length >= MIN_PASSWORD_LENGTH
        ? undefined
        : `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`,
    confirmPassword:
      values.confirmPassword && values.confirmPassword === values.password
        ? undefined
        : 'Mật khẩu nhập lại không khớp',
  };
}
