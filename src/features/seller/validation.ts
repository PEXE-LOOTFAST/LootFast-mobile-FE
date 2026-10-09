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

/** Giá trị form Thông tin quán, khớp ba API: hồ sơ, vị trí và giờ mở cửa. */
export type ShopInfoValues = {
  storeName: string;
  description: string;
  businessCategory: string;
  contactEmail: string;
  contactPhone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  latitude: string;
  longitude: string;
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

// Backend chỉ nhận số điện thoại 8–15 chữ số, có thể có dấu "+" ở đầu.
const SHOP_PHONE_PATTERN = /^\+?[0-9]{8,15}$/;

function checkCoordinate(value: string, limit: number, message: string) {
  const text = value.trim().replace(',', '.');
  const parsed = Number(text);

  if (!text || !Number.isFinite(parsed) || Math.abs(parsed) > limit) return message;

  // Backend giới hạn tối đa 6 chữ số thập phân.
  return /\.\d{7,}$/.test(text) ? 'Tối đa 6 chữ số thập phân' : undefined;
}

export function validateShopInfo(values: ShopInfoValues): FormErrors<ShopInfoValues> {
  const requireText = (value: string, max: number, message: string) =>
    !value.trim() ? message : value.trim().length > max ? `Tối đa ${max} ký tự` : undefined;

  return {
    storeName: requireText(values.storeName, 120, 'Vui lòng nhập tên cửa hàng'),
    description: values.description.trim().length > 1000 ? 'Tối đa 1000 ký tự' : undefined,
    businessCategory: values.businessCategory ? undefined : 'Chọn nhóm món của quán',
    contactEmail: checkEmail(values.contactEmail, 'Vui lòng nhập email liên hệ'),
    contactPhone: SHOP_PHONE_PATTERN.test(values.contactPhone.trim())
      ? undefined
      : 'Số điện thoại gồm 8–15 chữ số, có thể bắt đầu bằng +',
    addressLine: requireText(values.addressLine, 255, 'Vui lòng nhập số nhà, đường'),
    ward: requireText(values.ward, 100, 'Vui lòng nhập phường/xã'),
    district: requireText(values.district, 100, 'Vui lòng nhập quận/huyện'),
    city: requireText(values.city, 100, 'Vui lòng nhập tỉnh/thành phố'),
    latitude: checkCoordinate(values.latitude, 90, 'Vĩ độ từ -90 đến 90'),
    longitude: checkCoordinate(values.longitude, 180, 'Kinh độ từ -180 đến 180'),
    open: checkTime(values.open, 'Giờ mở cửa dạng HH:mm'),
    // Backend không nhận khung giờ qua nửa đêm: giờ đóng phải sau giờ mở trong cùng một ngày.
    close: !checkTime(values.close, '')
      ? !checkTime(values.open, '') && values.close <= values.open
        ? 'Giờ đóng phải sau giờ mở'
        : undefined
      : 'Giờ đóng cửa dạng HH:mm',
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
