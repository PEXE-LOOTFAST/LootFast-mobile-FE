import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Radius, Shadow, Spacing, type RadiusToken, type SpacingToken } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = Pick<
  PressableProps,
  'accessibilityLabel' | 'accessibilityHint' | 'accessibilityRole' | 'accessibilityState'
> & {
  children: ReactNode;
  /** `soft` cho thẻ nhấn mạnh (nền xanh nhạt), `outline` cho thẻ phụ không nền. */
  tone?: 'default' | 'soft' | 'outline';
  padding?: SpacingToken;
  gap?: SpacingToken;
  radius?: RadiusToken;
  /** Đổ bóng nhẹ để thẻ tách khỏi nền màn hình. */
  elevated?: boolean;
  /** Có thì cả thẻ bấm được (hiệu ứng nhấn thu nhỏ nhẹ). */
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Khung thẻ dùng chung: nền, viền, bo góc, khoảng đệm theo token. Nội dung bên trong tự sắp.
 */
export function Card({
  children,
  tone = 'default',
  padding = 'lg',
  gap,
  radius = 'xl',
  elevated = false,
  onPress,
  disabled,
  style,
  accessibilityRole,
  ...accessibility
}: CardProps) {
  const theme = useTheme();

  const surface = {
    default: { backgroundColor: theme.backgroundElement, borderColor: theme.border },
    soft: { backgroundColor: theme.primarySoft, borderColor: theme.primarySoft },
    outline: { backgroundColor: 'transparent', borderColor: theme.border },
  }[tone];

  const cardStyle = [
    styles.card,
    surface,
    {
      borderRadius: Radius[radius],
      padding: Spacing[padding],
      gap: gap ? Spacing[gap] : undefined,
    },
    elevated && styles.elevated,
  ];

  if (!onPress) {
    return <View style={[cardStyle, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole={accessibilityRole ?? 'button'}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed, style]}
      {...accessibility}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  elevated: { boxShadow: Shadow.card },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
});
