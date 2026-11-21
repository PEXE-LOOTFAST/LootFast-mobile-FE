import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
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
  card: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  title: { fontSize: FontSize.subtitle, fontWeight: FontWeight.heavy, letterSpacing: -0.3 },
  period: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: 10,
  },
  rowLabel: { flexShrink: 1, fontSize: FontSize.bodySm, fontWeight: FontWeight.medium },
  rowValue: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold },
  divider: { height: StyleSheet.hairlineWidth },
  sectionDivider: { height: 1, marginVertical: Spacing.sm },
  sectionTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: Radius.full },
  statusLabel: { flex: 1, fontSize: FontSize.bodySm, fontWeight: FontWeight.medium },
  statusValue: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
});
