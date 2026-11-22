import { router, useLocalSearchParams, type Href } from 'expo-router';

import { SellerApprovedOnly } from '@/features/seller/components/seller-approved-only';
import { SellerPlanScreen } from '@/features/seller/components/seller-plan-screen';

// Mở từ Cài đặt và từ khối Báo cáo nâng cao: router.back() trong tab navigator về tab
// đầu (Tổng quan), nên nơi mở truyền sẵn from để quay lại đúng chỗ.
export default function SellerPlanRoute() {
  const { from } = useLocalSearchParams<{ from?: string }>();

  return (
    <SellerApprovedOnly title="Gói Người bán Cao cấp">
      <SellerPlanScreen onBack={() => router.navigate((from ?? '/seller/settings') as Href)} />
    </SellerApprovedOnly>
  );
}
