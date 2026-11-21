import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { InlineAlert } from '@/components/ui/inline-alert';
import { MaxContentWidth } from '@/constants/theme';
import { useMerchantPerformance } from '@/features/seller/api/merchant-performance';
import { AdvancedReportCard } from '@/features/seller/components/advanced-report-card';
import { MetricCard } from '@/features/seller/components/metric-card';
import { PerformanceChartCard } from '@/features/seller/components/performance-chart-card';
import { PerformanceSummaryCard } from '@/features/seller/components/performance-summary-card';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { SellerHeader } from '@/features/seller/components/seller-header';
import { TopDealsCard } from '@/features/seller/components/top-deals-card';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type RangeId = 'today' | '7d' | '30d';

const RANGE_TABS: { id: RangeId; label: string }[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
];

const RANGE_DAYS: Record<RangeId, number> = { today: 0, '7d': 6, '30d': 29 };

export function SellerReportScreen() {
  const theme = useTheme();
  const [range, setRange] = useState<RangeId>('today');
  const [today] = useState(() => new Date());

  const from = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - RANGE_DAYS[range]);
    return d;
  }, [today, range]);

  const query = useMerchantPerformance(from, today);
  const data = query.data;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SellerHeader subtitle="Doanh thu và hiệu suất deal" title="Báo cáo" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <SegmentedTabs items={RANGE_TABS} onChange={setRange} value={range} />

          {query.isLoading ? (
            <ActivityIndicator color={theme.primary} size="large" style={styles.loader} />
          ) : null}

          {query.isError ? <InlineAlert message="Không tải được dữ liệu báo cáo." /> : null}

          {data ? (
            <>
              <View style={styles.metricsRow}>
                <MetricCard
                  icon={SellerIcons.revenue}
                  label="Doanh thu"
                  value={formatPrice(data.completedRevenue)}
                  hint="Doanh thu từ đơn hoàn tất."
                />
                <MetricCard
                  icon={SellerIcons.bag}
                  label="Tổng đơn"
                  value={`${data.placedOrders}`}
                  hint="Số đơn đặt trong khoảng thời gian."
                />
              </View>

              <View style={styles.metricsRow}>
                <MetricCard
                  icon={SellerIcons.tag}
                  label="Phần đã bán"
                  value={`${data.discountedPortions}`}
                  hint="Số phần ăn bán qua deal giảm giá."
                />
                <MetricCard
                  icon={SellerIcons.trend}
                  label="Tiết kiệm cho khách"
                  value={formatPrice(data.customerSavings)}
                  hint="Tiền khách tiết kiệm so với giá gốc."
                />
              </View>

              {data.daily.length > 1 ? <PerformanceChartCard daily={data.daily} /> : null}

              <PerformanceSummaryCard data={data} />

              <TopDealsCard deals={data.topDeals} />
            </>
          ) : null}

          <AdvancedReportCard
            onPressPlan={() =>
              router.navigate({ pathname: '/seller/plan', params: { from: '/seller/reports' } })
            }
          />
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
  loader: { marginTop: 24 },
});
