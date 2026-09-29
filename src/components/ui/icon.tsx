import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useTheme } from '@/hooks/use-theme';

// SF Symbols chỉ có trên iOS, Android và web dùng Material Symbols — mỗi icon phải khai báo
// đủ cả hai tên, nên tên icon luôn là object chứ không phải chuỗi.
export type IconName = Extract<SymbolViewProps['name'], object>;

/** Bảng icon của một feature: key là tên gọi trong app, value là tên icon của từng nền tảng. */
export type IconMap = Record<string, IconName>;

type IconProps = {
  name: IconName;
  /** Bỏ trống để dùng màu chữ phụ của theme — hợp với icon phụ trợ trong ô nhập, nhãn, chip. */
  color?: string;
  size?: number;
};

export function Icon({ name, color, size = 18 }: IconProps) {
  const theme = useTheme();

  return <SymbolView name={name} size={size} tintColor={color ?? theme.textSecondary} />;
}
