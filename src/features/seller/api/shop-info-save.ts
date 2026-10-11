import { openCloseToSlots, slotsToOpenClose } from '@/features/seller/hooks/use-merchant-shop';
import { parseOpenDays } from '@/features/seller/opening-hours';
import type {
  MerchantLocationDto,
  MerchantOpeningHoursDto,
  MerchantProfileDto,
  UpdateMerchantLocationPayload,
  UpdateMerchantProfilePayload,
  UpdateOpeningHoursPayload,
} from '@/features/seller/types/api';
import type { ShopInfoValues } from '@/features/seller/validation';
import { ApiException } from '@/lib/api-client';

/** Giá trị đang lưu ở server (dữ liệu của ba API hồ sơ, vị trí, giờ mở cửa) dưới dạng ô nhập. */
export function toShopInfoValues(shop: {
  profile?: MerchantProfileDto;
  location?: MerchantLocationDto;
  openingHours?: MerchantOpeningHoursDto;
}): ShopInfoValues {
  const { profile, location } = shop;
  const hours = slotsToOpenClose(shop.openingHours);

  return {
    storeName: profile?.storeName ?? '',
    description: profile?.description ?? '',
    businessCategory: profile?.businessCategory ?? '',
    contactEmail: profile?.contactEmail ?? '',
    contactPhone: profile?.contactPhone ?? '',
    addressLine: location?.addressLine ?? '',
    ward: location?.ward ?? '',
    district: location?.district ?? '',
    city: location?.city ?? '',
    latitude: location?.latitude != null ? String(location.latitude) : '',
    longitude: location?.longitude != null ? String(location.longitude) : '',
    open: hours.open,
    close: hours.close,
    openDays: hours.openDays,
  };
}

type ShopInfoApi = {
  updateProfile: (payload: UpdateMerchantProfilePayload) => Promise<MerchantProfileDto>;
  updateLocation: (payload: UpdateMerchantLocationPayload) => Promise<MerchantLocationDto>;
  updateOpeningHours: (payload: UpdateOpeningHoursPayload) => Promise<MerchantOpeningHoursDto>;
};

const PROFILE_FIELDS: (keyof ShopInfoValues)[] = [
  'storeName',
  'description',
  'businessCategory',
  'contactEmail',
  'contactPhone',
];
const LOCATION_FIELDS: (keyof ShopInfoValues)[] = [
  'addressLine',
  'ward',
  'district',
  'city',
  'latitude',
  'longitude',
];
const HOURS_FIELDS: (keyof ShopInfoValues)[] = ['open', 'close', 'openDays'];

const toCoordinate = (value: string) => Number(value.trim().replace(',', '.'));

/**
 * Lưu thông tin quán qua ba API của backend. Chỉ gửi phần khác với `initial` (giá trị đang lưu ở
 * server): mỗi phần có API riêng, và riêng giờ mở cửa còn tránh ghi đè lịch từng ngày khác nhau
 * nếu người bán không đụng tới ô giờ.
 */
export async function saveShopInfo(
  api: ShopInfoApi,
  values: ShopInfoValues,
  initial: ShopInfoValues,
) {
  const changed = (fields: (keyof ShopInfoValues)[]) =>
    fields.some((field) => values[field].trim() !== initial[field].trim());

  if (changed(PROFILE_FIELDS)) {
    await api.updateProfile({
      storeName: values.storeName.trim(),
      description: values.description.trim() || undefined,
      businessCategory: values.businessCategory,
      contactEmail: values.contactEmail.trim(),
      contactPhone: values.contactPhone.trim(),
    });
  }

  if (changed(LOCATION_FIELDS)) {
    await api.updateLocation({
      addressLine: values.addressLine.trim(),
      ward: values.ward.trim(),
      district: values.district.trim(),
      city: values.city.trim(),
      latitude: toCoordinate(values.latitude),
      longitude: toCoordinate(values.longitude),
    });
  }

  if (changed(HOURS_FIELDS)) {
    await api.updateOpeningHours(
      openCloseToSlots(values.open, values.close, parseOpenDays(values.openDays)),
    );
  }
}

// Backend trả message tiếng Anh, chỉ error.code là enum ổn định — map sang tiếng Việt ở đây.
const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCESS_DENIED: 'Tài khoản chưa được cấp quyền Người bán.',
  MERCHANT_PROFILE_NOT_FOUND: 'Tài khoản chưa có hồ sơ quán. Hãy hoàn tất đăng ký người bán trước.',
  VALIDATION_FAILED: 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại các ô nhập.',
  INVALID_OPENING_HOURS: 'Giờ mở cửa chưa hợp lệ: giờ đóng phải sau giờ mở.',
};

export function toShopErrorMessage(
  error: unknown,
  fallback = 'Không lưu được thông tin. Vui lòng thử lại.',
) {
  if (error instanceof ApiException) {
    return ERROR_MESSAGES[error.code] ?? `${fallback} (${error.code})`;
  }

  return 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
}
