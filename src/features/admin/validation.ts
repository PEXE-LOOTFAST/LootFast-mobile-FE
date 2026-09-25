import type { FormErrors } from '@/features/auth/types';
import { EMAIL_PATTERN } from '@/features/auth/validation';

export type AdminLoginValues = {
  email: string;
  password: string;
};

// Cổng quản trị chỉ nhận email công việc, không nhận tên đăng nhập như bên người mua.
export function validateAdminLogin(values: AdminLoginValues): FormErrors<AdminLoginValues> {
  const email = values.email.trim();

  return {
    email: !email
      ? 'Vui lòng nhập email quản trị'
      : EMAIL_PATTERN.test(email)
        ? undefined
        : 'Email không hợp lệ',
    password: values.password ? undefined : 'Vui lòng nhập mật khẩu',
  };
}
