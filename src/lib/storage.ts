import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'lootfast.access_token';
const REFRESH_TOKEN_KEY = 'lootfast.refresh_token';

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
  clear: async () => {
    await Promise.all([removeItem(ACCESS_TOKEN_KEY), removeItem(REFRESH_TOKEN_KEY)]);
  },
};
