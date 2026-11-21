import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useThemePreference } from '@/lib/theme-preference';

/** Chế độ màu đang hiển thị: theo lựa chọn trong Cài đặt (mặc định sáng), hoặc theo máy. */
export function useColorScheme(): 'light' | 'dark' {
  const preference = useThemePreference();
  const system = useSystemColorScheme();

  if (preference !== 'system') return preference;
  return system === 'dark' ? 'dark' : 'light';
}
