import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type WeeklySummaryCardProps = {
  orderCount: number;
  revenue: number;
  portions: number;
};

export function WeeklySummaryCard({ orderCount, revenue, portions }: WeeklySummaryCardProps) {
  const theme = useTheme();

  const rows = [
    { label: 'Tổng đơn', value: `${orderCount}` },
    { label: 'Tổng doanh thu', value: formatPrice(revenue) },
    { label: 'Số phần đã bán qua deal', value: `${portions}` },
  ];

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        Tổng quan tuần
      </Text>

      {rows.map((row, index) => (
        <View key={row.label}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{row.label}</Text>
            <Text style={[styles.rowValue, { color: theme.text }]}>{row.value}</Text>
          </View>
          {index < rows.length - 1 ? (
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14 },
  title: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  rowLabel: { flexShrink: 1, fontSize: 13, fontWeight: '600' },
  rowValue: { fontSize: 15, fontWeight: '800' },
  divider: { height: StyleSheet.hairlineWidth },
});
