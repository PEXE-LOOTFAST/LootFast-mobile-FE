import { router } from 'expo-router';

import { ApiPendingCard } from '@/components/ui/api-pending-card';
import { AdvancedReportCard } from '@/features/seller/components/advanced-report-card';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';

/**
 * Báo cáo của quán. Mọi con số ở đây (doanh thu, đơn thành công, tỷ lệ không đến nhận) đều
 * cộng từ đơn hàng, mà backend chưa có endpoint đơn cho người bán.
 *
 * `report-stat-card` và `use-seller-report` đã sẵn sàng cho lúc có API.
 */
export function SellerReportScreen() {
  return (
    <SellerPageScaffold
      // Mở thẳng tab Báo cáo thì không có lịch sử để lùi, quay về Tổng quan.
      onPressBack={() => (router.canGoBack() ? router.back() : router.navigate('/seller'))}
      subtitle="Doanh thu từ deal và hiệu suất vận hành"
      title="Báo cáo"
    >
      <ApiPendingCard feature="Doanh thu, số đơn và hiệu suất vận hành" />

      <AdvancedReportCard
        onPressPlan={() =>
          router.navigate({ pathname: '/seller/plan', params: { from: '/seller/reports' } })
        }
      />
    </SellerPageScaffold>
  );
}
