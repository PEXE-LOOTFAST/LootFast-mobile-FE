import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { SellerTabBar } from '@/components/navigation/seller-tab-bar';
import { useAuthSession } from '@/hooks/use-auth-session';

// Khu vực người bán có thanh tab riêng, tách hẳn khỏi (tabs) của người mua.
// Thêm tab mới = tạo thêm file trong src/app/seller, khai báo icon trong SellerTabIcons
// rồi thêm một Screen ở đây. Các trang con của Hồ sơ quán khai báo href: null nên không có nút
// trên thanh tab (SellerTabBar cũng bỏ qua route không có icon) nhưng vẫn giữ thanh tab ở dưới.
export default function SellerLayout() {
  const { isAuthenticated, user } = useAuthSession();

  if (!isAuthenticated) return <Redirect href="/" />;
  if (!user?.roles.includes('MERCHANT')) return <Redirect href="/merchant-application" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <SellerTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Tổng quan' }} />
      <Tabs.Screen name="orders" options={{ title: 'Đơn hàng' }} />
      <Tabs.Screen name="new-deal" options={{ title: 'Đăng deal' }} />
      <Tabs.Screen name="reports" options={{ title: 'Báo cáo' }} />
      <Tabs.Screen name="shop" options={{ title: 'Hồ sơ quán' }} />
      <Tabs.Screen name="shop-info" options={{ href: null }} />
      <Tabs.Screen name="plan" options={{ href: null }} />
      <Tabs.Screen name="growth" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="owner-info" options={{ href: null }} />
      <Tabs.Screen name="change-password" options={{ href: null }} />
      <Tabs.Screen name="language" options={{ href: null }} />
      <Tabs.Screen name="notification-settings" options={{ href: null }} />
    </Tabs>
  );
}
