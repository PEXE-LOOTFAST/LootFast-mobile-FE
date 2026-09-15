import type { FormErrors, LoginValues, RegisterValues } from '@/features/auth/types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.]{3,30}$/;
const PHONE_PATTERN = /^0\d{9}$/;

export const MIN_PASSWORD_LENGTH = 8;

export function validateLogin(values: LoginValues): FormErrors<LoginValues> {
  const identifier = values.identifier.trim();

  return {
    identifier: !identifier
      ? 'Vui lòng nhập email hoặc tên đăng nhập'
      : EMAIL_PATTERN.test(identifier) || USERNAME_PATTERN.test(identifier)
        ? undefined
        : 'Email hoặc tên đăng nhập không hợp lệ',
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
