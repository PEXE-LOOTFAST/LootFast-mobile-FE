import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

// Thẻ số liệu gọn cho trang Báo cáo: chỉ nhãn và con số, hai thẻ một hàng.
export function ReportStatCard({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Text numberOfLines={2} style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text numberOfLines={1} style={[styles.value, { color: theme.text }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexShrink: 1,
    // 50% trừ nửa khoảng cách 12 giữa hai cột.
    flexBasis: '47%',
    minHeight: 88,
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  value: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
});
