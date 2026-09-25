import type { FormErrors } from '@/features/auth/types';
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH, PHONE_PATTERN } from '@/features/auth/validation';
import type { SellerShopCategory } from '@/features/seller/types';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export type ShopInfoValues = {
  name: string;
  address: string;
  categories: SellerShopCategory[];
  open: string;
  close: string;
};

export type OwnerInfoValues = {
  fullName: string;
  email: string;
  phone: string;
};

export type ChangePasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function validateShopInfo(values: ShopInfoValues): FormErrors<ShopInfoValues> {
  return {
    name: values.name.trim().length >= 2 ? undefined : 'Vui lòng nhập tên cửa hàng',
    address: values.address.trim() ? undefined : 'Vui lòng nhập địa chỉ nhận món',
    categories: values.categories.length > 0 ? undefined : 'Chọn ít nhất một danh mục món',
    open: TIME_PATTERN.test(values.open) ? undefined : 'Giờ mở cửa dạng HH:mm',
    // Cho phép giờ đóng nhỏ hơn giờ mở: quán mở xuyên đêm, vd. 18:00 - 02:00.
    close: TIME_PATTERN.test(values.close) ? undefined : 'Giờ đóng cửa dạng HH:mm',
  };
}

export function validateOwnerInfo(values: OwnerInfoValues): FormErrors<OwnerInfoValues> {
  const email = values.email.trim();
  const phone = values.phone.trim();

  return {
    fullName: values.fullName.trim().length >= 2 ? undefined : 'Vui lòng nhập họ và tên',
    email: !email
      ? 'Vui lòng nhập email'
      : EMAIL_PATTERN.test(email)
        ? undefined
        : 'Email không hợp lệ',
    // Số điện thoại không bắt buộc với chủ quán, nhưng đã nhập thì phải đúng định dạng.
    phone:
      !phone || PHONE_PATTERN.test(phone)
        ? undefined
        : 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0',
  };
}

export function validateChangePassword(
  values: ChangePasswordValues,
): FormErrors<ChangePasswordValues> {
  const { currentPassword, newPassword, confirmPassword } = values;
  const isStrong =
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    /[a-z]/.test(newPassword) &&
    /[A-Z]/.test(newPassword) &&
    /\d/.test(newPassword);

  return {
    currentPassword: currentPassword ? undefined : 'Vui lòng nhập mật khẩu hiện tại',
    newPassword: !isStrong
      ? `Từ ${MIN_PASSWORD_LENGTH} ký tự, có chữ hoa, chữ thường và số`
      : newPassword === currentPassword
        ? 'Mật khẩu mới phải khác mật khẩu hiện tại'
        : undefined,
    confirmPassword:
      confirmPassword && confirmPassword === newPassword
        ? undefined
        : 'Mật khẩu nhập lại không khớp',
  };
}
