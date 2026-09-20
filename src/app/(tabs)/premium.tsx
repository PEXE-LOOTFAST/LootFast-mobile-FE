import { router, useLocalSearchParams, type Href } from 'expo-router';

import { PremiumScreen } from '@/features/profile/components/premium-screen';

// Màn phụ trong (tabs): mở từ Hồ sơ và từ nút "Xem quyền lợi" của trang Đơn hàng,
// nên vẫn giữ thanh tab ở dưới. options={{ href: null }} trong _layout ẩn nó khỏi thanh tab.
// router.back() trong tab navigator quay về tab gốc (Trang chủ), nên nơi mở truyền sẵn
// tham số from để nút quay lại trả người dùng đúng chỗ họ vừa rời đi.
export default function PremiumRoute() {
  const { from } = useLocalSearchParams<{ from?: string }>();

  return <PremiumScreen onBack={() => router.navigate((from ?? '/profile') as Href)} />;
}
