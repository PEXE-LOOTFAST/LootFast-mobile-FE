import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { HistoryInsightCard } from '@/features/seller/components/history-insight-card';
import { MetricCard } from '@/features/seller/components/metric-card';
import { SectionLabel } from '@/features/seller/components/section-label';
import { SellerOverviewHeader } from '@/features/seller/components/seller-overview-header';
import { UpcomingPickupCard } from '@/features/seller/components/upcoming-pickup-card';
import { WeeklyPerformanceCard } from '@/features/seller/components/weekly-performance-card';
import { WeeklySummaryCard } from '@/features/seller/components/weekly-summary-card';
import { SellerIcons } from '@/features/seller/constants/icons';
import {
  MOCK_SELLER_DEALS,
  MOCK_SELLER_ORDERS,
  MOCK_SELLER_SHOP,
} from '@/features/seller/data/mock-seller-shop';
import { useSellerOverview } from '@/features/seller/hooks/use-seller-overview';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

export function SellerOverviewScreen() {
  const theme = useTheme();
  // Chốt ngày lúc mount để dòng ngày trên header không nhảy giữa các lần render.
  const [today] = useState(() => new Date());
  const overview = useSellerOverview(MOCK_SELLER_DEALS, MOCK_SELLER_ORDERS);

  // Header nền xanh đậm cần icon status bar màu sáng, trả về 'auto' khi rời màn.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SellerOverviewHeader
          date={today}
          isVerified={MOCK_SELLER_SHOP.isVerified}
          onPressCreateDeal={() => router.navigate('/seller/new-deal')}
          shopName={MOCK_SELLER_SHOP.name}
        />

        <View style={styles.body}>
          {/* Số liệu đang tính từ dữ liệu mẫu trên máy, chưa đồng bộ với máy chủ. */}
          <Text style={[styles.storageNote, { color: theme.textSecondary }]}>
            Dữ liệu được lưu trên thiết bị này
          </Text>

          <SectionLabel title="HÔM NAY" />

          <View style={styles.metrics}>
            <MetricCard
              caption="Hôm nay"
              hint="Tổng tiền của các đơn deal đã xác nhận hoặc hoàn thành trong ngày hôm nay."
              icon={SellerIcons.revenue}
              label="Doanh thu từ deal"
              value={formatPrice(overview.revenueToday)}
            />
            <MetricCard
              caption={`${overview.pendingPickupCount} đơn chờ lấy`}
              hint="Số đơn khách đặt trong hôm nay, tính cả đơn chưa xác nhận."
              icon={SellerIcons.bag}
              label="Số đơn hôm nay"
              value={`${overview.orderCountToday}`}
            />
            <MetricCard
              caption="Đang mở bán"
              hint="Số deal còn hiệu lực và khách vẫn đặt được."
              icon={SellerIcons.trend}
              label="Deal đang chạy"
              value={`${overview.runningDealCount}`}
            />
            <MetricCard
              caption="Trong deal đang chạy"
              hint="Tổng số phần chưa bán của các deal đang chạy."
              icon={SellerIcons.bag}
              label="Số phần còn lại"
              value={`${overview.portionsLeft}`}
            />
            <MetricCard
              caption="Từ dữ liệu deal hiện có"
              hint="Tổng số phần đã bán, cộng từ tất cả deal của quán."
              icon={SellerIcons.bag}
              label="Số phần đã bán"
              value={`${overview.portionsSold}`}
            />
            <MetricCard
              caption={`${overview.soldOutCount}/${overview.runningDealCount} deal`}
              hint="Tỷ lệ deal đang chạy đã bán hết phần."
              icon={SellerIcons.trend}
              label="Tỷ lệ bán hết"
              value={`${Math.round(overview.soldOutRate * 100)}%`}
            />
          </View>

          <SectionLabel title="7 NGÀY QUA" />
          <WeeklyPerformanceCard daily={overview.weekly} />
          <WeeklySummaryCard
            orderCount={overview.weekOrderCount}
            portions={overview.weekPortions}
            revenue={overview.weekRevenue}
          />

          <SectionLabel title="GỢI Ý DỰA TRÊN LỊCH SỬ" />
          <HistoryInsightCard
            onPressUpgrade={() =>
              router.navigate({ pathname: '/premium', params: { from: '/seller' } })
            }
          />

          <SectionLabel title="ĐƠN SẮP ĐẾN LẤY" />
          <UpcomingPickupCard
            onPressSeeAll={() => router.navigate('/seller/orders')}
            orders={overview.upcomingOrders}
            pendingConfirmCount={overview.pendingConfirmCount}
          />
        </View>
      </ScrollView>

      {/* Nâng lên trên thanh tab người bán để nút trợ lý không đè lên nút Đăng deal. */}
      <AssistantFab bottomOffset={96} />
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
  storageNote: { fontSize: 11, fontWeight: '600', textAlign: 'right' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
