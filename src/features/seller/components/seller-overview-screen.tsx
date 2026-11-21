import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { MaxContentWidth } from '@/constants/theme';
import { useMerchantPerformance } from '@/features/seller/api/merchant-performance';
import { MetricCard } from '@/features/seller/components/metric-card';
import { SellerOverviewHeader } from '@/features/seller/components/seller-overview-header';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MINI_CHART_HEIGHT = 80;

export function SellerOverviewScreen() {
  const theme = useTheme();
  const [today] = useState(() => new Date());
  const { profile } = useMerchantShop();

  const todayPerf = useMerchantPerformance(today, today);

  const weekAgo = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return d;
  }, [today]);
  const weekPerf = useMerchantPerformance(weekAgo, today);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  const data = todayPerf.data;
  const weekData = weekPerf.data;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SellerOverviewHeader
        date={today}
        isVerified={profile !== undefined}
        onPressCreateDeal={() => router.navigate('/seller/new-deal')}
        shopName={profile?.storeName ?? '—'}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {todayPerf.isLoading ? <ActivityIndicator color={theme.primary} /> : null}

          {todayPerf.isError ? <InlineAlert message="Không tải được dữ liệu hôm nay." /> : null}

          {data ? (
            <>
              <View style={styles.metricsRow}>
                <MetricCard
                  icon={SellerIcons.revenue}
                  label="Doanh thu hôm nay"
                  value={formatPrice(data.completedRevenue)}
                  hint="Doanh thu từ đơn hoàn tất hôm nay."
                />
                <MetricCard
                  icon={SellerIcons.bag}
                  label="Đơn hôm nay"
                  value={`${data.placedOrders}`}
                  hint="Số đơn đặt trong ngày hôm nay."
                />
              </View>

              <View style={styles.metricsRow}>
                <MetricCard
                  icon={SellerIcons.tag}
                  label="Phần đã bán"
                  value={`${data.discountedPortions}`}
                  hint="Số phần ăn bán qua deal giảm giá hôm nay."
                />
                <MetricCard
                  icon={SellerIcons.trend}
                  label="Tiết kiệm cho khách"
                  value={formatPrice(data.customerSavings)}
                  hint="Tiền khách tiết kiệm so với giá gốc hôm nay."
                />
              </View>

              {Object.keys(data.ordersByStatus).length > 0 ? (
                <View
                  style={[
                    styles.statusCard,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.statusTitle, { color: theme.text }]}>
                    Đơn theo trạng thái
                  </Text>
                  <View style={styles.statusRow}>
                    {Object.entries(data.ordersByStatus).map(([status, count]) => (
                      <View key={status} style={styles.statusItem}>
                        <Text style={[styles.statusCount, { color: theme.text }]}>{count}</Text>
                        <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>
                          {status}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}

          {/* Mini chart 7 ngày */}
          {weekData && weekData.daily.length > 1 ? (
            <View
              style={[
                styles.miniChartCard,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              <View style={styles.miniChartHeader}>
                <Text style={[styles.miniChartTitle, { color: theme.text }]}>Doanh thu 7 ngày</Text>
                <Text style={[styles.miniChartTotal, { color: theme.primary }]}>
                  {formatPrice(weekData.completedRevenue)}
                </Text>
              </View>

              <View style={styles.miniChart}>
                {(() => {
                  const max = Math.max(...weekData.daily.map((d) => d.completedRevenue), 1);
                  return weekData.daily.map((d) => (
                    <View key={d.date} style={styles.miniBarSlot}>
                      <View
                        style={[
                          styles.miniBar,
                          {
                            height: Math.max((d.completedRevenue / max) * MINI_CHART_HEIGHT, 3),
                            backgroundColor: d.completedRevenue > 0 ? theme.primary : theme.border,
                          },
                        ]}
                      />
                      <Text style={[styles.miniBarLabel, { color: theme.textSecondary }]}>
                        {WEEKDAY_SHORT[new Date(d.date + 'T00:00:00').getDay()]}
                      </Text>
                    </View>
                  ));
                })()}
              </View>
            </View>
          ) : null}

          {/* Link sang Báo cáo */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate('/seller/reports')}
            style={({ pressed }) => [
              styles.reportLink,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={SellerIcons.report} color={theme.primary} size={18} />
            <View style={styles.reportLinkCopy}>
              <Text style={[styles.reportLinkTitle, { color: theme.text }]}>
                Xem báo cáo chi tiết
              </Text>
              <Text style={[styles.reportLinkDesc, { color: theme.textSecondary }]}>
                Phân tích doanh thu, top deal và so sánh theo khoảng thời gian
              </Text>
            </View>
            <Icon name={SellerIcons.chevronRight} color={theme.textSecondary} size={16} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 120 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    marginTop: 14,
    paddingHorizontal: 16,
  },
  metricsRow: { flexDirection: 'row', gap: 12 },
  statusCard: { borderWidth: 1, borderRadius: 20, padding: 14 },
  statusTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statusItem: { alignItems: 'center', minWidth: 60 },
  statusCount: { fontSize: 20, fontWeight: '900' },
  statusLabel: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  miniChartCard: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 10 },
  miniChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniChartTitle: { fontSize: 14, fontWeight: '800' },
  miniChartTotal: { fontSize: 15, fontWeight: '900' },
  miniChart: {
    height: MINI_CHART_HEIGHT + 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  miniBarSlot: { flex: 1, alignItems: 'center', gap: 4 },
  miniBar: { width: 14, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  miniBarLabel: { fontSize: 10, fontWeight: '600' },
  reportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  reportLinkCopy: { flex: 1, gap: 2 },
  reportLinkTitle: { fontSize: 14, fontWeight: '800' },
  reportLinkDesc: { fontSize: 12, fontWeight: '600' },
  pressed: { opacity: 0.85 },
});
