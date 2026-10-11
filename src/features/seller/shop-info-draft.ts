import { ALL_OPEN_DAYS } from '@/features/seller/opening-hours';
import type { ShopInfoValues } from '@/features/seller/validation';
import { draftStorage } from '@/lib/storage';

export const EMPTY_SHOP_INFO: ShopInfoValues = {
  storeName: '',
  description: '',
  businessCategory: '',
  contactEmail: '',
  contactPhone: '',
  addressLine: '',
  ward: '',
  district: '',
  city: '',
  latitude: '',
  longitude: '',
  open: '',
  close: '',
  openDays: ALL_OPEN_DAYS,
};

/**
 * Backend chưa có hồ sơ quán trước khi admin duyệt đơn đăng ký, nên thông tin quán người bán nhập
 * lúc đăng ký chưa lưu lên server được. Giữ trên máy theo từng tài khoản, đến khi hồ sơ quán xuất
 * hiện thì tự gửi lên (xem `useApplyShopInfoDraft`).
 */
const draftKey = (email: string) => `shop_info_draft.${email.toLowerCase()}`;

export async function loadShopInfoDraft(email: string): Promise<ShopInfoValues | null> {
  try {
    const raw = await draftStorage.get(draftKey(email));
    if (!raw) return null;

    return { ...EMPTY_SHOP_INFO, ...(JSON.parse(raw) as Partial<ShopInfoValues>) };
  } catch {
    // Bản nháp hỏng hoặc không đọc được: coi như chưa có, người bán nhập lại được.
    return null;
  }
}

export async function saveShopInfoDraft(email: string, values: ShopInfoValues) {
  try {
    await draftStorage.set(draftKey(email), JSON.stringify(values));
  } catch {
    // Không lưu được bản nháp không được chặn việc gửi đơn đăng ký.
  }
}

export async function clearShopInfoDraft(email: string) {
  try {
    await draftStorage.clear(draftKey(email));
  } catch {
    // Bỏ qua: lần sau dựng form sẽ đè lên bản nháp cũ.
  }
}
