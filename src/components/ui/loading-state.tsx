import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

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
      {label ? <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 24 },
  fill: { flex: 1, paddingHorizontal: 24 },
  label: { fontSize: 13, textAlign: 'center' },
});
