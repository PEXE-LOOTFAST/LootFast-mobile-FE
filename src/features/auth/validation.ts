import type { LoginValues, RegisterValues } from '@/features/auth/types';
import type { FormErrors } from '@/types/form';
import {
  MIN_PASSWORD_LENGTH,
  checkEmail,
  checkFullName,
  checkPasswordMatch,
  checkPhone,
} from '@/lib/validation';

export function validateLogin(values: LoginValues): FormErrors<LoginValues> {
  // Backend chỉ nhận email (POST /auth/signin), không có đăng nhập bằng username.
  return {
    email: checkEmail(values.email),
    // Không kiểm tra độ dài ở màn đăng nhập: tài khoản cũ có thể được tạo trước khi áp quy tắc mới.
    password: values.password ? undefined : 'Vui lòng nhập mật khẩu',
  };
}

export function validateRegister(values: RegisterValues): FormErrors<RegisterValues> {
  return {
    fullName: checkFullName(values.fullName),
    email: checkEmail(values.email),
    phone: checkPhone(values.phone),
    password:
      values.password.length >= MIN_PASSWORD_LENGTH
        ? undefined
        : `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`,
    confirmPassword: checkPasswordMatch(values.confirmPassword, values.password),
  };
}
