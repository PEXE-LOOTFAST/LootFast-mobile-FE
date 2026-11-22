import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { EmptyCard } from '@/components/ui/empty-card';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { SlowLoadingHint } from '@/components/ui/slow-loading-hint';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  useMerchantPerformance,
  type MerchantPerformanceDto,
} from '@/features/seller/api/merchant-performance';
import { AdvancedReportCard } from '@/features/seller/components/advanced-report-card';
import { MetricCard } from '@/features/seller/components/metric-card';
import { PerformanceChartCard } from '@/features/seller/components/performance-chart-card';
import { PerformanceSummaryCard } from '@/features/seller/components/performance-summary-card';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { SellerHeader } from '@/features/seller/components/seller-header';
import { SellerTodayCard } from '@/features/seller/components/seller-today-card';
import { ShopSetupCard, getShopSetupSteps } from '@/features/seller/components/shop-setup-card';
import { TopDealsCard } from '@/features/seller/components/top-deals-card';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import { countByStatus, pickupRate } from '@/features/seller/report-metrics';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type RangeId = 'today' | '7d' | '30d';

const RANGE_TABS: { id: RangeId; label: string }[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
];

const RANGE_DAYS: Record<RangeId, number> = { today: 0, '7d': 6, '30d': 29 };

const RANGE_EMPTY_LABEL: Record<RangeId, string> = {
  today: 'hôm nay',
  '7d': 'trong 7 ngày qua',
  '30d': 'trong 30 ngày qua',
};

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
  const shop = useMerchantShop();
  const shopReady = !shop.isLoading && !shop.isError && !shop.profileMissing;
  const isSetupDone = getShopSetupSteps(shop).every((step) => step.done);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SellerHeader
        subtitle={shop.profile?.storeName || 'Doanh thu và hiệu suất deal'}
        subtitleIcon={shop.profile?.storeName ? SellerIcons.store : undefined}
        title="Báo cáo"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* Báo cáo là tab mở đầu của người bán: quán chưa đủ hồ sơ thì việc đầu tiên là điền. */}
          {shopReady && !isSetupDone ? (
            <ShopSetupCard
              location={shop.location}
              openingHours={shop.openingHours}
              profile={shop.profile}
            />
          ) : null}

          {shopReady && isSetupDone ? <SellerTodayCard /> : null}

          <AppText
            accessibilityRole="header"
            style={styles.sectionTitle}
            variant="bodyLg"
            weight="heavy"
          >
            Kết quả bán hàng
          </AppText>

          <SegmentedTabs items={RANGE_TABS} onChange={setRange} value={range} />

          {query.isLoading ? <ReportSkeleton /> : null}

          {query.isError ? (
            <ErrorState
              message="Không tải được số liệu báo cáo. Kiểm tra mạng rồi thử lại."
              onRetry={() => void query.refetch()}
              retrying={query.isRefetching}
            />
          ) : null}

          {data && data.placedOrders === 0 ? (
            <EmptyCard
              description="Số liệu sẽ hiện ở đây khi khách đặt deal của quán. Đăng deal cuối ngày để khách quanh đây thấy bạn."
              title={`Chưa có đơn nào ${RANGE_EMPTY_LABEL[range]}`}
            />
          ) : null}

          {data && data.placedOrders > 0 ? (
            <>
              <View style={styles.metricsRow}>
                <MetricCard
                  caption={`Từ ${countByStatus(data, 'COMPLETED')} đơn đã giao`}
                  hint="Tổng tiền của các đơn khách đã nhận món. Đơn còn chờ lấy chưa được tính."
                  icon={SellerIcons.revenue}
                  label="Doanh thu"
                  value={formatPrice(data.completedRevenue)}
                />
                <MetricCard
                  caption={
                    countByStatus(data, 'RESERVED') > 0
                      ? `${countByStatus(data, 'RESERVED')} đơn đang chờ lấy`
                      : 'Không còn đơn chờ lấy'
                  }
                  hint="Số đơn khách đã đặt trong khoảng thời gian này, kể cả đơn chưa lấy hoặc đã huỷ."
                  icon={SellerIcons.bag}
                  label="Đơn đặt"
                  value={`${data.placedOrders}`}
                />
              </View>

              <View style={styles.metricsRow}>
                <MetricCard
                  caption={`Khách tiết kiệm ${formatPrice(data.customerSavings)}`}
                  hint="Số phần ăn khách đã nhận qua deal, thay vì phải bỏ đi cuối ngày."
                  icon={SellerIcons.tag}
                  label="Phần đã bán"
                  value={`${data.discountedPortions}`}
                />
                <PickupRateCard data={data} />
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

function PickupRateCard({ data }: { data: MerchantPerformanceDto }) {
  const rate = pickupRate(data);
  const noShow = countByStatus(data, 'NO_SHOW');

  return (
    <MetricCard
      caption={
        rate === null
          ? 'Chưa có đơn tới giờ lấy'
          : noShow > 0
            ? `${noShow} đơn khách không đến`
            : 'Khách đến lấy đủ'
      }
      hint="Trong các đơn đã tới giờ lấy, bao nhiêu phần trăm khách đến nhận. Đơn còn chờ và đơn huỷ không tính."
      icon={SellerIcons.trend}
      label="Khách đến lấy"
      value={rate === null ? '—' : `${rate}%`}
    />
  );
}

// Bốn ô số liệu giữ chỗ cùng bố cục 2×2, để lần mở đầu thấy ngay khung báo cáo.
function ReportSkeleton() {
  return (
    <View
      accessibilityLabel="Đang tải báo cáo"
      accessibilityRole="progressbar"
      style={styles.skeleton}
    >
      {[0, 1].map((row) => (
        <View key={row} style={styles.metricsRow}>
          {[0, 1].map((col) => (
            <Card key={col} gap="sm" padding="md" style={styles.skeletonTile}>
              <Skeleton height={14} width="60%" />
              <Skeleton height={28} width="80%" />
              <Skeleton height={12} width="70%" />
            </Card>
          ))}
        </View>
      ))}
      <SlowLoadingHint />
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
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: { marginTop: Spacing.xs, marginBottom: -Spacing.xs },
  metricsRow: { flexDirection: 'row', gap: Spacing.md },
  skeleton: { gap: Spacing.md },
  skeletonTile: { flex: 1 },
});
