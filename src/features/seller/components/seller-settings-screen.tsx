import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SellerMenuList, type SellerMenuItem } from '@/features/seller/components/seller-menu-list';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';
import { confirmSignOut } from '@/lib/confirm-sign-out';

const SETTINGS_ITEMS: SellerMenuItem[] = [
  {
    key: 'owner',
    icon: SellerIcons.store,
    title: 'Thông tin chủ quán',
    onPress: () => router.navigate('/seller/owner-info'),
  },
  {
    key: 'password',
    icon: SellerIcons.lock,
    title: 'Mật khẩu',
    onPress: () => router.navigate('/seller/change-password'),
  },
  {
    key: 'language',
    icon: SellerIcons.language,
    title: 'Ngôn ngữ',
    onPress: () => router.navigate('/seller/language'),
  },
  {
    key: 'notifications',
    icon: SellerIcons.bell,
    title: 'Thông báo cửa hàng',
    onPress: () => router.navigate('/seller/notification-settings'),
  },
];

export function SellerSettingsScreen() {
  const theme = useTheme();

  return (
    <SellerPageScaffold
      onPressBack={() => router.navigate('/seller/shop')}
      subtitle="Quản lý tài khoản và vận hành cửa hàng"
      title="Cài đặt"
    >
      <SellerMenuList compact items={SETTINGS_ITEMS} />

      <Pressable
        accessibilityLabel="Đăng xuất"
        accessibilityRole="button"
        onPress={() => confirmSignOut()}
        style={({ pressed }) => [
          styles.signOut,
          { backgroundColor: theme.backgroundElement, borderColor: theme.danger },
          pressed && styles.pressed,
        ]}
      >
        <Icon name={SellerIcons.logout} color={theme.danger} size={16} />
        <Text style={[styles.signOutLabel, { color: theme.danger }]}>Đăng xuất</Text>
      </Pressable>
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  signOut: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  signOutLabel: { fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
