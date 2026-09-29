import { checkEmail, checkRequired } from '@/lib/validation';
import type { FormErrors } from '@/types/form';

export type AdminLoginValues = {
  email: string;
  password: string;
};

// Cổng quản trị chỉ nhận email công việc, không nhận tên đăng nhập như bên người mua.
export function validateAdminLogin(values: AdminLoginValues): FormErrors<AdminLoginValues> {
  return {
    email: checkEmail(values.email, 'Vui lòng nhập email quản trị'),
    password: checkRequired(values.password, 'Vui lòng nhập mật khẩu'),
  };
}
