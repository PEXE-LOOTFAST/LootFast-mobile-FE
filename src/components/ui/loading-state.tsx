import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { SlowLoadingHint } from '@/components/ui/slow-loading-hint';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type LoadingStateProps = {
  label?: string;
  size?: 'small' | 'large';
  /** Chiếm cả vùng cha và căn giữa; dùng cho màn tải toàn trang. */
  fill?: boolean;
};

// Trạng thái đang tải dùng chung: một vòng xoay, tuỳ chọn kèm dòng chữ.
export function LoadingState({ label, size = 'large', fill = false }: LoadingStateProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={label ?? 'Đang tải'}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={[styles.container, fill && styles.fill]}
    >
      <ActivityIndicator color={theme.primary} size={size} />
      {label ? (
        <AppText align="center" tone="textSecondary" variant="bodySm">
          {label}
        </AppText>
      ) : null}
      {/* Chỉ các vùng tải lớn mới giải thích chờ lâu; vòng xoay nhỏ trong nút thì không. */}
      {size === 'large' ? <SlowLoadingHint /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxl,
  },
  fill: { flex: 1, paddingHorizontal: Spacing.xxl },
});
