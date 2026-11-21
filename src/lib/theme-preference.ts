import { useSyncExternalStore } from 'react';
import { Appearance, Platform } from 'react-native';

import { preferenceStorage } from '@/lib/storage';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
// App mặc định nền sáng; giao diện tối chỉ bật khi người dùng tự chọn trong Cài đặt.
const DEFAULT_PREFERENCE: ThemePreference = 'light';

let current: ThemePreference = DEFAULT_PREFERENCE;
const listeners = new Set<() => void>();

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

// Đổi cả phần giao diện do hệ điều hành vẽ (bàn phím, hộp thoại hệ thống, chọn ngày) cho khớp
// với app. Web không có API này, ở đó chỉ cần màu của app.
function applyNative(preference: ThemePreference) {
  if (Platform.OS === 'web') return;
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}

function apply(preference: ThemePreference) {
  current = preference;
  applyNative(preference);
  listeners.forEach((listener) => listener());
}

// Áp ngay lúc nạp module để khung native không kịp hiện theo chế độ tối của máy trước khi đọc
// xong lựa chọn đã lưu.
applyNative(DEFAULT_PREFERENCE);

export function setThemePreference(preference: ThemePreference) {
  apply(preference);
  void preferenceStorage.set(STORAGE_KEY, preference);
}

/** Đọc lựa chọn đã lưu, gọi một lần lúc mở app. */
export async function restoreThemePreference() {
  const saved = await preferenceStorage.get(STORAGE_KEY);
  apply(isThemePreference(saved) ? saved : DEFAULT_PREFERENCE);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
}
