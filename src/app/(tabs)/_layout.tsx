import { router } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { requireAuth } from '@/lib/auth-session';

// name="index" / name="orders" trỏ tới file cùng tên trong thư mục (tabs).
// Thêm tab mới = tạo thêm file trong (tabs) rồi thêm một Trigger ở đây.
export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { isAuthenticated } = useAuthSession();

  return (
    <NativeTabs
      backgroundColor={colors.background}
      iconColor={colors.textSecondary}
      indicatorColor={colors.background}
      labelStyle={{ selected: { color: colors.textSecondary } }}
      tintColor={colors.textSecondary}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Trang chủ</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* Khách chỉ được xem Trang chủ. Tab bị disabled vẫn phát tabPress với isPrevented = true,
          nên bắt ở đó để mở modal đăng nhập và chỉ chuyển tab sau khi đăng nhập xong. */}
      <NativeTabs.Trigger
        disabled={!isAuthenticated}
        listeners={{
          tabPress: (event) => {
            if (event.data?.isPrevented) requireAuth(() => router.navigate('/orders'));
          },
        }}
        name="orders"
      >
        <NativeTabs.Trigger.Label>Đơn hàng</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        disabled={!isAuthenticated}
        listeners={{
          tabPress: (event) => {
            if (event.data?.isPrevented) requireAuth(() => router.navigate('/profile'));
          },
        }}
        name="profile"
      >
        <NativeTabs.Trigger.Label>Hồ sơ</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.fill" md="person" renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
