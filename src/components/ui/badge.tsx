import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing, type FontSizeToken } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BadgeTone = 'primary' | 'primarySoft' | 'danger' | 'accent' | 'neutral';

type BadgeProps = {
  label: string;
  /** `primary` nổi bật trạng thái đang áp dụng, `primarySoft` cho nhãn phân loại, `danger` cho % giảm giá. */
  tone?: BadgeTone;
  /** `sm` cho badge chồng lên ảnh nhỏ, `lg` cho badge trên ảnh lớn. */
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};

const SIZES: Record<
  NonNullable<BadgeProps['size']>,
  { paddingHorizontal: number; paddingVertical: number; text: FontSizeToken }
> = {
  sm: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xxs, text: 'caption' },
  md: { paddingHorizontal: Spacing.sm + Spacing.xxs, paddingVertical: Spacing.xs, text: 'caption' },
  lg: { paddingHorizontal: Spacing.sm + Spacing.xxs, paddingVertical: Spacing.xs, text: 'bodySm' },
};

// Nhãn viên thuốc nhỏ: trạng thái gói, % giảm giá, phân loại.
export function Badge({ label, tone = 'primarySoft', size = 'md', style }: BadgeProps) {
  const theme = useTheme();
  const { text, ...padding } = SIZES[size];

  const palette = {
    primary: { background: theme.primary, label: theme.onPrimary },
    primarySoft: { background: theme.primarySoft, label: theme.primary },
    danger: { background: theme.danger, label: theme.onDanger },
    accent: { background: theme.accent, label: theme.onAccent },
    neutral: { background: theme.backgroundSelected, label: theme.textSecondary },
  }[tone];

  return (
    <View style={[styles.badge, padding, { backgroundColor: palette.background }, style]}>
      <AppText color={palette.label} numberOfLines={1} variant={text} weight="heavy">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: Radius.full },
});
