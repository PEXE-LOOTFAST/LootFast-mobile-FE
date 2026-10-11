import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { AdminTabBar } from '@/components/navigation/admin-tab-bar';
import { useAuthSession } from '@/hooks/use-auth-session';

// Khu vực quản trị có thanh tab riêng, tách khỏi người mua (tabs) và người bán (seller).
// Thêm tab mới = tạo thêm file trong src/app/admin, khai báo icon trong AdminTabIcons
// rồi thêm một Screen ở đây.
export default function AdminLayout() {
  const { isAdmin } = useAuthSession();

  // Chặn ở layout để mọi tab con đều được bảo vệ, kể cả khi mở thẳng bằng URL.
  // Đây chỉ là chặn giao diện — quyền thật vẫn phải do API kiểm tra.
  if (!isAdmin) return <Redirect href="/admin-login" />;

  return (
    <Tabs
      initialRouteName="overview"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AdminTabBar {...props} />}
    >
      <Tabs.Screen name="overview" options={{ title: 'Tổng quan' }} />
      <Tabs.Screen name="index" options={{ title: 'Duyệt quán' }} />
      <Tabs.Screen name="moderation" options={{ title: 'Kiểm duyệt' }} />
      <Tabs.Screen name="manage" options={{ title: 'Quản lý' }} />
      <Tabs.Screen name="settings" options={{ title: 'Cài đặt' }} />
    </Tabs>
  );
}
