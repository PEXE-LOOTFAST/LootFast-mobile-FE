import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Bảng màu của chế độ đang hiển thị. */
export function useTheme() {
  return Colors[useColorScheme()];
}
