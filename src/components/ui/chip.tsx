import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing, type FontSizeToken } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * `outline`: chưa chọn thì nền màn hình + viền (lựa chọn trong form).
   * `soft`: chưa chọn thì nền xanh nhạt, không viền (bộ lọc danh mục).
   */
  variant?: 'outline' | 'soft';
  size?: 'sm' | 'md';
  /**
   * Vai trò cho trình đọc màn hình: `radio` chọn một, `checkbox` chọn nhiều, `tab` dải tab.
   * `checkbox` báo trạng thái bằng `checked`, các vai trò khác bằng `selected`.
   */
  role?: 'button' | 'radio' | 'checkbox' | 'tab';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const SIZES: Record<
  NonNullable<ChipProps['size']>,
  { minHeight: number; paddingHorizontal: number; text: FontSizeToken }
> = {
  sm: { minHeight: 32, paddingHorizontal: Spacing.md, text: 'footnote' },
  md: { minHeight: 40, paddingHorizontal: Spacing.lg, text: 'body' },
};

// Lựa chọn dạng viên thuốc: khung giờ, nhóm món, bán kính, trạng thái đơn.
export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  role = 'button',
  accessibilityLabel,
  style,
}: ChipProps) {
  const theme = useTheme();
  const { text, ...box } = SIZES[size];

  const surface = selected
    ? { backgroundColor: theme.primary, borderColor: theme.primary }
    : variant === 'soft'
      ? { backgroundColor: theme.primarySoft, borderColor: theme.primarySoft }
      : { backgroundColor: theme.background, borderColor: theme.border };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={role}
      accessibilityState={
        role === 'checkbox' ? { checked: selected, disabled } : { selected, disabled }
      }
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        box,
        surface,
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
    >
      <AppText
        numberOfLines={1}
        tone={selected ? 'onPrimary' : 'text'}
        variant={text}
        weight={selected ? 'bold' : 'medium'}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
  },
  dimmed: { opacity: 0.7 },
});
