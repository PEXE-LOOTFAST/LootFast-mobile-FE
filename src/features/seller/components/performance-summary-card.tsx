import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import type { MerchantPerformanceDto } from '@/features/seller/api/merchant-performance';
import {
  ORDER_STATUS_LABELS,
  countByStatus,
  formatReportPeriod,
} from '@/features/seller/report-metrics';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  data: MerchantPerformanceDto;
};

// Thứ tự cố định theo vòng đời đơn, để các khoảng thời gian dễ so với nhau.
const STATUS_ORDER = ['RESERVED', 'COMPLETED', 'NO_SHOW', 'CANCELLED', 'MERCHANT_CANCELLED'];

/**
 * Chia đơn theo trạng thái. Bốn con số tổng (doanh thu, đơn, phần, tiết kiệm) đã ở các ô phía
 * trên nên không lặp lại ở đây.
 */
export function PerformanceSummaryCard({ data }: Props) {
  const theme = useTheme();

  const dotColor: Record<string, string> = {
    RESERVED: theme.accent,
    COMPLETED: theme.primary,
    NO_SHOW: theme.danger,
    CANCELLED: theme.textSecondary,
    MERCHANT_CANCELLED: theme.textSecondary,
  };
  const entries = STATUS_ORDER.map(
    (status) => [status, countByStatus(data, status)] as const,
  ).filter(([, count]) => count > 0);

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        Đơn theo trạng thái
      </Text>
      <Text style={[styles.period, { color: theme.textSecondary }]}>
        {formatReportPeriod(data.from, data.to)} · {data.placedOrders} đơn
      </Text>

      {entries.map(([status, count]) => (
        <View key={status} style={styles.statusRow}>
          <View
            style={[styles.statusDot, { backgroundColor: dotColor[status] ?? theme.primary }]}
          />
          <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
            {ORDER_STATUS_LABELS[status] ?? status}
          </Text>
          <Text style={[styles.statusValue, { color: theme.text }]}>{count}</Text>
        </View>
      ))}
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
