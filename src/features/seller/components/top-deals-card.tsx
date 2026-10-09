import { StyleSheet, Text, View } from 'react-native';

import type { TopDeal } from '@/features/seller/api/merchant-performance';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

export function TopDealsCard({ deals }: { deals: TopDeal[] }) {
  const theme = useTheme();

  if (deals.length === 0) return null;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        Top deal nổi bật
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Deal có doanh thu cao nhất trong khoảng thời gian
      </Text>

      {deals.map((deal, index) => (
        <View key={deal.dealId}>
          <View style={styles.row}>
            <View style={[styles.rank, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.rankText, { color: theme.primary }]}>{index + 1}</Text>
            </View>
            <View style={styles.info}>
              <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
                {deal.name}
              </Text>
              <Text style={[styles.detail, { color: theme.textSecondary }]}>
                {deal.completedOrders} đơn · {deal.discountedPortions} phần
              </Text>
            </View>
            <Text style={[styles.revenue, { color: theme.text }]}>
              {formatPrice(deal.completedRevenue)}
            </Text>
          </View>
          {index < deals.length - 1 ? (
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14 },
  title: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  rank: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  rankText: { fontSize: 13, fontWeight: '900' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '700' },
  detail: { fontSize: 12, fontWeight: '600' },
  revenue: { fontSize: 14, fontWeight: '900' },
  divider: { height: StyleSheet.hairlineWidth },
});
