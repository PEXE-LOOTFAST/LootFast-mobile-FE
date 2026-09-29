import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useSellerDemo } from '@/demo/use-demo';
import { AdvancedReportCard } from '@/features/seller/components/advanced-report-card';
import { ReportStatCard } from '@/features/seller/components/report-stat-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { useSellerReport } from '@/features/seller/hooks/use-seller-report';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

export function SellerReportScreen() {
  const theme = useTheme();
  const { deals, orders } = useSellerDemo();
  const report = useSellerReport(deals, orders);

  return (
    <SellerPageScaffold
      // Mở thẳng tab Báo cáo thì không có lịch sử để lùi, quay về Tổng quan.
      onPressBack={() => (router.canGoBack() ? router.back() : router.navigate('/seller'))}
      subtitle="Doanh thu từ deal và hiệu suất vận hành"
      title="Báo cáo"
    >
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
        <ReportStatCard label="Không đến nhận" value={`${Math.round(report.noShowRate * 100)}%`} />
        <ReportStatCard label="Số deal đã đăng" value={`${report.dealCount}`} />
        <ReportStatCard label="Số phần đã bán qua deal" value={`${report.portionsSold}`} />
      </View>

      <AdvancedReportCard
        onPressPlan={() =>
          router.navigate({ pathname: '/seller/plan', params: { from: '/seller/reports' } })
        }
      />
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  storageNote: { fontSize: 11, fontWeight: '600', textAlign: 'right' },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
