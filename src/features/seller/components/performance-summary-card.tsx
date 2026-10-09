import { StyleSheet, Text, View } from 'react-native';

import type { MerchantPerformanceDto } from '@/features/seller/api/merchant-performance';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type Props = {
  data: MerchantPerformanceDto;
};

export function PerformanceSummaryCard({ data }: Props) {
  const theme = useTheme();

  const statusEntries = Object.entries(data.ordersByStatus).filter(([, count]) => count > 0);

  const rows = [
    { label: 'Tổng đơn đặt', value: `${data.placedOrders}` },
    { label: 'Doanh thu hoàn tất', value: formatPrice(data.completedRevenue) },
    { label: 'Số phần giảm giá', value: `${data.discountedPortions}` },
    { label: 'Tiết kiệm cho khách', value: formatPrice(data.customerSavings) },
  ];

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        Tổng quan
      </Text>
      <Text style={[styles.period, { color: theme.textSecondary }]}>
        {data.from} → {data.to}
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

      {statusEntries.length > 0 ? (
        <>
          <View style={[styles.sectionDivider, { backgroundColor: theme.border }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Đơn theo trạng thái</Text>
          {statusEntries.map(([status, count]) => (
            <View key={status} style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
              <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>{status}</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>{count}</Text>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14 },
  title: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  period: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
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
  sectionDivider: { height: 1, marginVertical: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  statusValue: { fontSize: 14, fontWeight: '800' },
});
