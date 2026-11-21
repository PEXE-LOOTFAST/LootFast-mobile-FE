import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppearanceSection } from '@/components/settings/appearance-section';
import { Icon } from '@/components/ui/icon';
import { FontSize, FontWeight, MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { MenuSection, type MenuItem } from '@/components/ui/menu-section';
import { SellerHeader } from '@/features/seller/components/seller-header';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';
import { confirmSignOut } from '@/lib/confirm-sign-out';

const SETTINGS_ITEMS: MenuItem[] = [
  {
    key: 'owner',
    icon: SellerIcons.store,
    title: 'Thông tin chủ quán',
    onPress: () => router.navigate('/seller/owner-info'),
  },
  {
    key: 'bank-account',
    icon: SellerIcons.wallet,
    title: 'Tài khoản nhận tiền',
    onPress: () => router.navigate('/seller/bank-account'),
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
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SellerHeader subtitle="Tài khoản và vận hành cửa hàng" title="Cài đặt" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <MenuSection compact items={SETTINGS_ITEMS} />

          <AppearanceSection />

          <Pressable
            accessibilityLabel="Chuyển sang người mua"
            accessibilityRole="button"
            onPress={() => router.navigate('/profile')}
            style={({ pressed }) => [
              styles.switchButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={SellerIcons.person} color={theme.text} size={16} />
            <Text style={[styles.switchLabel, { color: theme.text }]}>Chuyển sang người mua</Text>
          </Pressable>

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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 120 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    marginTop: 14,
    paddingHorizontal: Spacing.lg,
  },
  switchButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.xxl,
    boxShadow: Shadow.card,
  },
  switchLabel: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  signOut: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.xxl,
  },
  signOutLabel: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  pressed: { opacity: 0.8 },
});
