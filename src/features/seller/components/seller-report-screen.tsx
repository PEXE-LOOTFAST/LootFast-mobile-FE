import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { InlineAlert } from '@/components/ui/inline-alert';
import { useMerchantPerformance } from '@/features/seller/api/merchant-performance';
import { AdvancedReportCard } from '@/features/seller/components/advanced-report-card';
import { PerformanceChartCard } from '@/features/seller/components/performance-chart-card';
import { PerformanceSummaryCard } from '@/features/seller/components/performance-summary-card';
import { SegmentedTabs } from '@/features/seller/components/segmented-tabs';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { TopDealsCard } from '@/features/seller/components/top-deals-card';
import { useTheme } from '@/hooks/use-theme';

type RangeId = '7d' | '30d' | '90d';

const RANGE_TABS: { id: RangeId; label: string }[] = [
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
  { id: '90d', label: '90 ngày' },
];

const RANGE_DAYS: Record<RangeId, number> = { '7d': 6, '30d': 29, '90d': 89 };

export function SellerReportScreen() {
  const theme = useTheme();
  const [range, setRange] = useState<RangeId>('7d');
  const [today] = useState(() => new Date());

  const from = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - RANGE_DAYS[range]);
    return d;
  }, [today, range]);

  const query = useMerchantPerformance(from, today);
  const data = query.data;

  return (
    <SellerPageScaffold
      onPressBack={() => (router.canGoBack() ? router.back() : router.navigate('/seller'))}
      subtitle="Phân tích doanh thu và hiệu suất deal"
      title="Báo cáo"
    >
      <SegmentedTabs items={RANGE_TABS} onChange={setRange} value={range} />

      {query.isLoading ? (
        <ActivityIndicator color={theme.primary} size="large" style={styles.loader} />
      ) : null}

      {query.isError ? <InlineAlert message="Không tải được dữ liệu báo cáo." /> : null}

      {data ? (
        <>
          <PerformanceSummaryCard data={data} />

          {data.daily.length > 1 ? <PerformanceChartCard daily={data.daily} /> : null}

          <TopDealsCard deals={data.topDeals} />
        </>
      ) : null}

      <AdvancedReportCard
        onPressPlan={() =>
          router.navigate({ pathname: '/seller/plan', params: { from: '/seller/reports' } })
        }
      />
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 24 },
});
