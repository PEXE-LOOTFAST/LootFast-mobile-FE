import { router, useLocalSearchParams, type Href } from 'expo-router';

import { SellerPlanScreen } from '@/features/seller/components/seller-plan-screen';

// Mở từ Hồ sơ quán và từ khối Báo cáo nâng cao: router.back() trong tab navigator về tab
// đầu (Tổng quan), nên nơi mở truyền sẵn from để quay lại đúng chỗ.
export default function SellerPlanRoute() {
  const { from } = useLocalSearchParams<{ from?: string }>();

  return <SellerPlanScreen onBack={() => router.navigate((from ?? '/seller/shop') as Href)} />;
}
