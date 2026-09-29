import type { SellerShopCategory } from '@/features/seller/types';
import {
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  checkEmail,
  checkFullName,
  checkPasswordMatch,
  checkPhone,
  checkRequired,
  checkTime,
} from '@/lib/validation';
import type { FormErrors } from '@/types/form';

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

export type NewDealValues = {
  name: string;
  portions: string;
  price: string;
  originalPrice: string;
  open: string;
  close: string;
};

/** Số nguyên dương người bán gõ vào ô số phần hoặc ô giá; chuỗi rỗng và chữ đều không hợp lệ. */
function toPositiveInt(value: string): number | undefined {
  const parsed = Number(value.replace(/\D/g, ''));

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function validateNewDeal(values: NewDealValues): FormErrors<NewDealValues> {
  const price = toPositiveInt(values.price);
  const originalPrice = toPositiveInt(values.originalPrice);

  return {
    name: values.name.trim().length >= MIN_NAME_LENGTH ? undefined : 'Vui lòng nhập tên món',
    portions: toPositiveInt(values.portions) ? undefined : 'Số phần phải là số lớn hơn 0',
    price: price ? undefined : 'Giá deal phải là số lớn hơn 0',
    // Giá gốc phải cao hơn giá deal, nếu không thì không còn là deal giảm giá nữa.
    originalPrice: !originalPrice
      ? 'Giá gốc phải là số lớn hơn 0'
      : price && originalPrice <= price
        ? 'Giá gốc phải cao hơn giá deal'
        : undefined,
    open: checkTime(values.open, 'Giờ bắt đầu nhận dạng HH:mm'),
    close: checkTime(values.close, 'Giờ kết thúc nhận dạng HH:mm'),
  };
}

export function validateShopInfo(values: ShopInfoValues): FormErrors<ShopInfoValues> {
  return {
    name: values.name.trim().length >= MIN_NAME_LENGTH ? undefined : 'Vui lòng nhập tên cửa hàng',
    address: checkRequired(values.address, 'Vui lòng nhập địa chỉ nhận món'),
    categories: values.categories.length > 0 ? undefined : 'Chọn ít nhất một danh mục món',
    open: checkTime(values.open, 'Giờ mở cửa dạng HH:mm'),
    // Cho phép giờ đóng nhỏ hơn giờ mở: quán mở xuyên đêm, vd. 18:00 - 02:00.
    close: checkTime(values.close, 'Giờ đóng cửa dạng HH:mm'),
  };
}

export function validateOwnerInfo(values: OwnerInfoValues): FormErrors<OwnerInfoValues> {
  return {
    fullName: checkFullName(values.fullName),
    email: checkEmail(values.email),
    // Số điện thoại không bắt buộc với chủ quán, nhưng đã nhập thì phải đúng định dạng.
    phone: checkPhone(values.phone, { optional: true }),
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
    currentPassword: checkRequired(currentPassword, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: !isStrong
      ? `Từ ${MIN_PASSWORD_LENGTH} ký tự, có chữ hoa, chữ thường và số`
      : newPassword === currentPassword
        ? 'Mật khẩu mới phải khác mật khẩu hiện tại'
        : undefined,
    confirmPassword: checkPasswordMatch(confirmPassword, newPassword),
  };
}
