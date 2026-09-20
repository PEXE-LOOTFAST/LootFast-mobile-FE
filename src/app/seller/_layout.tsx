import { Tabs } from 'expo-router/js-tabs';

import { SellerTabBar } from '@/components/navigation/seller-tab-bar';

// Khu vực người bán có thanh tab riêng, tách hẳn khỏi (tabs) của người mua.
// Thêm tab mới = tạo thêm file trong src/app/seller, khai báo icon trong SellerTabIcons
// rồi thêm một Screen ở đây.
export default function SellerLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <SellerTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Tổng quan' }} />
      <Tabs.Screen name="orders" options={{ title: 'Đơn hàng' }} />
      <Tabs.Screen name="new-deal" options={{ title: 'Đăng deal' }} />
      <Tabs.Screen name="reports" options={{ title: 'Báo cáo' }} />
      <Tabs.Screen name="shop" options={{ title: 'Hồ sơ quán' }} />
    </Tabs>
  );
}
