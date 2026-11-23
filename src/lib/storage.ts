import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'lootfast.access_token';
const REFRESH_TOKEN_KEY = 'lootfast.refresh_token';
// Đánh dấu phiên đã đăng nhập qua cổng quản trị, để mở lại app vẫn khôi phục được khu /admin.
const ADMIN_GATE_KEY = 'lootfast.admin_gate';
// Tên, email và quyền của tài khoản đang đăng nhập (không có token), để mở app hiện tài khoản ngay.
const SESSION_USER_KEY = 'lootfast.session_user';

const isWeb = Platform.OS === 'web';

// SecureStore không có bản cho web — gọi thẳng sẽ làm `npm run web` crash.
// localStorage KHÔNG được mã hoá, nên nhánh web chỉ dùng để xem nhanh lúc dev.
async function getItem(key: string): Promise<string | null> {
  if (isWeb) return globalThis.localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
  getAccessToken: () => getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getItem(REFRESH_TOKEN_KEY),
  save: async (accessToken: string, refreshToken: string) => {
    await Promise.all([
      setItem(ACCESS_TOKEN_KEY, accessToken),
      setItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },
  // Phiên admin: lưu riêng khỏi token vì chỉ phiên qua cổng quản trị mới được bật `isAdmin`.
  setAdminGate: (isAdmin: boolean) =>
    isAdmin ? setItem(ADMIN_GATE_KEY, '1') : removeItem(ADMIN_GATE_KEY),
  isAdminGate: async () => (await getItem(ADMIN_GATE_KEY)) === '1',
  getSessionUser: () => getItem(SESSION_USER_KEY),
  setSessionUser: (json: string) => setItem(SESSION_USER_KEY, json),
  clear: async () => {
    await Promise.all([
      removeItem(ACCESS_TOKEN_KEY),
      removeItem(REFRESH_TOKEN_KEY),
      removeItem(ADMIN_GATE_KEY),
      removeItem(SESSION_USER_KEY),
    ]);
  },
};

/**
 * Lưu một chuỗi nhỏ theo khoá tự đặt (vd. bản nháp form). SecureStore chỉ nhận khoá gồm chữ, số
 * và ". - _" nên mọi ký tự khác (vd. "@" trong email) được đổi thành "_".
 */
const toSafeKey = (key: string) => `lootfast.${key.replace(/[^A-Za-z0-9._-]/g, '_')}`;

export const draftStorage = {
  get: (key: string) => getItem(toSafeKey(key)),
  set: (key: string, value: string) => setItem(toSafeKey(key), value),
  clear: (key: string) => removeItem(toSafeKey(key)),
};

/** Tuỳ chọn nhỏ của người dùng trên máy này (vd. giao diện sáng/tối), không gắn với tài khoản. */
export const preferenceStorage = {
  get: (key: string) => getItem(toSafeKey(`pref.${key}`)),
  set: (key: string, value: string) => setItem(toSafeKey(`pref.${key}`), value),
};
