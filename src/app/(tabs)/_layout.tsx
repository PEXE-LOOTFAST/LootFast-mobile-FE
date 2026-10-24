import { Redirect, router, type Href } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { useAuthSession } from '@/hooks/use-auth-session';
import { requireAuth } from '@/lib/auth-session';

// name="index" / name="orders" trỏ tới file cùng tên trong thư mục (tabs).
// Thêm tab mới = tạo thêm file trong (tabs), khai báo icon trong TabIcons rồi thêm một Screen ở đây.
export default function TabsLayout() {
  const { isAuthenticated, isAdmin } = useAuthSession();

  // Phiên quản trị (kể cả khi vừa khôi phục lúc mở lại app) luôn thuộc khu /admin, không ở
  // giao diện người mua. Chặn ở layout để cold start không dừng lại ở tab người mua.
  if (isAdmin) return <Redirect href="/admin/overview" />;

  // Khách chỉ được xem Trang chủ: chặn chuyển tab, mở modal đăng nhập và chỉ chuyển tab
  // sau khi đăng nhập xong.
  const guardTab = (href: Href) => ({
    tabPress: (event: { preventDefault: () => void }) => {
      if (isAuthenticated) return;
      event.preventDefault();
      requireAuth(() => router.navigate(href));
    },
  });

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name="orders" listeners={guardTab('/orders')} options={{ title: 'Đơn hàng' }} />
      <Tabs.Screen name="map" listeners={guardTab('/map')} options={{ title: 'Bản đồ' }} />
      <Tabs.Screen name="profile" listeners={guardTab('/profile')} options={{ title: 'Cài đặt' }} />
      <Tabs.Screen name="deal/[id]" options={{ href: null }} />
      <Tabs.Screen name="premium" options={{ href: null }} />
      <Tabs.Screen name="profile-info" options={{ href: null }} />
    </Tabs>
  );
}
