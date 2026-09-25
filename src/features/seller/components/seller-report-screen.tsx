import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { AdvancedReportCard } from '@/features/seller/components/advanced-report-card';
import { ReportStatCard } from '@/features/seller/components/report-stat-card';
import { SellerReportHeader } from '@/features/seller/components/seller-report-header';
import { MOCK_SELLER_DEALS, MOCK_SELLER_ORDERS } from '@/features/seller/data/mock-seller-shop';
import { useSellerReport } from '@/features/seller/hooks/use-seller-report';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

export function SellerReportScreen() {
  const theme = useTheme();
  const report = useSellerReport(MOCK_SELLER_DEALS, MOCK_SELLER_ORDERS);

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
        {/* Mở thẳng tab Báo cáo thì không có lịch sử để lùi, quay về Tổng quan. */}
        <SellerReportHeader
          onPressBack={() => (router.canGoBack() ? router.back() : router.navigate('/seller'))}
        />

        <View style={styles.body}>
          {/* Số liệu đang tính từ dữ liệu mẫu trên máy, chưa đồng bộ với máy chủ. */}
          <Text style={[styles.storageNote, { color: theme.textSecondary }]}>
            Dữ liệu được lưu trên thiết bị này
          </Text>

          <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>
            Báo cáo cơ bản
          </Text>

          <View style={styles.stats}>
            <ReportStatCard label="Doanh thu từ deal" value={formatPrice(report.revenue)} />
            <ReportStatCard label="Đơn thành công" value={`${report.completedCount}`} />
            <ReportStatCard label="Đơn đã huỷ" value={`${report.cancelledCount}`} />
            <ReportStatCard
              label="Không đến nhận"
              value={`${Math.round(report.noShowRate * 100)}%`}
            />
            <ReportStatCard label="Số deal đã đăng" value={`${report.dealCount}`} />
            <ReportStatCard label="Số phần đã bán qua deal" value={`${report.portionsSold}`} />
          </View>

          <AdvancedReportCard
            onPressPlan={() =>
              router.navigate({ pathname: '/premium', params: { from: '/seller/reports' } })
            }
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
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
