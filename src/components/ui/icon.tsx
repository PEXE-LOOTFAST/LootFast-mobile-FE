import {
  SymbolView,
  unstable_getMaterialSymbolSourceAsync,
  type SymbolViewProps,
} from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Image, Platform, View, type ImageSourcePropType } from 'react-native';

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

// Cùng icon/cỡ/màu chỉ vẽ một lần; mỗi lần vẽ là một lượt gọi native.
const glyphCache = new Map<string, Promise<ImageSourcePropType | null>>();

function loadGlyph(
  symbol: Parameters<typeof unstable_getMaterialSymbolSourceAsync>[0],
  size: number,
  color: string,
) {
  const key = `${symbol}|${size}|${color}`;
  let glyph = glyphCache.get(key);
  if (!glyph) {
    glyph = unstable_getMaterialSymbolSourceAsync(symbol, size, color).catch(() => null);
    glyphCache.set(key, glyph);
  }
  return glyph;
}

/**
 * SymbolView trên Android nhốt glyph vào một Text đúng bằng size nên nét ở mép bị cắt và
 * glyph lệch tâm. Vẽ glyph thành ảnh bằng bộ vẽ native rồi để layout tự canh giữa trong ô size×size.
 */
function AndroidIcon({ name, color, size }: { name: IconName; color: string; size: number }) {
  const [source, setSource] = useState<ImageSourcePropType | null>(null);

  useEffect(() => {
    let isCurrent = true;
    void loadGlyph(name.android ?? null, size, color).then((glyph) => {
      if (isCurrent) setSource(glyph);
    });
    return () => {
      isCurrent = false;
    };
  }, [name.android, size, color]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {source ? <Image source={source} /> : null}
    </View>
  );
}

export function Icon({ name, color, size = 18 }: IconProps) {
  const theme = useTheme();
  const tintColor = color ?? theme.textSecondary;

  if (Platform.OS === 'android') {
    return <AndroidIcon name={name} color={tintColor} size={size} />;
  }

  return <SymbolView name={name} size={size} tintColor={tintColor} />;
}
