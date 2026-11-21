import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
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
  card: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  title: { fontSize: FontSize.subtitle, fontWeight: FontWeight.heavy, letterSpacing: -0.3 },
  subtitle: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
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
    borderRadius: Radius.full,
  },
  rankText: { fontSize: FontSize.bodySm, fontWeight: FontWeight.heavy },
  info: { flex: 1, gap: Spacing.xxs },
  name: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  detail: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  revenue: { fontSize: FontSize.body, fontWeight: FontWeight.heavy },
  divider: { height: StyleSheet.hairlineWidth },
});
