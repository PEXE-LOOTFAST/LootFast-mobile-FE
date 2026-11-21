import { Text, type TextProps } from 'react-native';

import {
  FontSize,
  FontWeight,
  type FontSizeToken,
  type FontWeightToken,
  type ThemeColor,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextTone = Extract<
  ThemeColor,
  'text' | 'textSecondary' | 'primary' | 'danger' | 'accent' | 'onPrimary' | 'onDanger'
>;

type AppTextProps = TextProps & {
  /** Cỡ chữ theo thang `FontSize`. */
  variant?: FontSizeToken;
  /** Bỏ trống thì tiêu đề lớn tự đậm, chữ nội dung để thường. */
  weight?: FontWeightToken;
  /** Màu theo vai trò, tự đổi theo dark mode. Dùng `color` khi chữ nằm trên nền cố định (header, ảnh). */
  tone?: TextTone;
  color?: string;
  align?: 'auto' | 'left' | 'center' | 'right';
};

const DEFAULT_WEIGHT: Record<FontSizeToken, FontWeightToken> = {
  micro: 'bold',
  caption: 'regular',
  footnote: 'regular',
  bodySm: 'regular',
  body: 'regular',
  bodyLg: 'regular',
  subtitle: 'regular',
  title: 'bold',
  titleLg: 'bold',
  headline: 'bold',
  display: 'heavy',
  hero: 'heavy',
};

// Cỡ chữ hệ thống quá lớn làm vỡ header một dòng, badge, thẻ ngang. Vẫn cho phóng to
// để dễ đọc nhưng chặn ở mức layout còn chịu được.
const MAX_FONT_SCALE = 1.4;

/**
 * Chữ dùng chung: cỡ, độ đậm và màu lấy từ design token thay vì viết số trong StyleSheet.
 * `style` truyền vào vẫn được áp sau cùng (vd. letterSpacing, lineHeight riêng).
 */
export function AppText({
  variant = 'body',
  weight,
  tone = 'text',
  color,
  align,
  style,
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  ...textProps
}: AppTextProps) {
  const theme = useTheme();

  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...textProps}
      style={[
        {
          color: color ?? theme[tone],
          fontSize: FontSize[variant],
          fontWeight: FontWeight[weight ?? DEFAULT_WEIGHT[variant]],
        },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
