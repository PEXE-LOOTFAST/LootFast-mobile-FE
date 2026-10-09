import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { SellerTabBar } from '@/components/navigation/seller-tab-bar';
import { useAuthSession } from '@/hooks/use-auth-session';

export default function SellerLayout() {
  const { isAuthenticated, user } = useAuthSession();

  if (!isAuthenticated) return <Redirect href="/" />;
  if (!user?.roles.includes('MERCHANT')) return <Redirect href="/merchant-application" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <SellerTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ title: 'Báo cáo' }} />
      <Tabs.Screen name="orders" options={{ title: 'Đơn hàng' }} />
      <Tabs.Screen name="new-deal" options={{ title: 'Đăng deal' }} />
      <Tabs.Screen name="shop-info" options={{ title: 'Thông tin quán' }} />
      <Tabs.Screen name="settings" options={{ title: 'Cài đặt' }} />
      <Tabs.Screen name="shop" options={{ href: null }} />
      <Tabs.Screen name="plan" options={{ href: null }} />
      <Tabs.Screen name="growth" options={{ href: null }} />
      <Tabs.Screen name="owner-info" options={{ href: null }} />
      <Tabs.Screen name="change-password" options={{ href: null }} />
      <Tabs.Screen name="language" options={{ href: null }} />
      <Tabs.Screen name="notification-settings" options={{ href: null }} />
      <Tabs.Screen name="bank-account" options={{ href: null }} />
      <Tabs.Screen name="deal-images" options={{ href: null }} />
      <Tabs.Screen name="edit-deal" options={{ href: null }} />
    </Tabs>
  );
}
