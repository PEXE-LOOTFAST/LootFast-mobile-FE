import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FontSize, FontWeight, MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { MenuSection, type MenuItem } from '@/components/ui/menu-section';
import { MerchantRegistrationRequired } from '@/features/seller/components/merchant-registration-required';
import { ShopSetupCard, getShopSetupSteps } from '@/features/seller/components/shop-setup-card';
import { SellerHeader } from '@/features/seller/components/seller-header';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import { useTheme } from '@/hooks/use-theme';
import { confirmSignOut } from '@/lib/confirm-sign-out';

export function SellerShopScreen() {
  const theme = useTheme();
  useLightStatusBar();

  const { profile, location, openingHours, profileMissing, isLoading, isError, refetch } =
    useMerchantShop();
  const setupDone = getShopSetupSteps({ profile, location, openingHours }).every((s) => s.done);

  const menuItems: MenuItem[] = [
    {
      key: 'info',
      icon: SellerIcons.store,
      title: 'Thông tin quán',
      subtitle: isLoading
        ? undefined
        : setupDone
          ? 'Hồ sơ, địa chỉ và giờ mở cửa'
          : 'Chưa hoàn tất — bấm để cập nhật',
      onPress: () => router.navigate('/seller/shop-info'),
    },
    {
      key: 'plan',
      icon: SellerIcons.crown,
      title: 'Gói Người bán Cao cấp',
      onPress: () =>
        router.navigate({ pathname: '/seller/plan', params: { from: '/seller/shop' } }),
    },
    {
      key: 'reports',
      icon: SellerIcons.report,
      title: 'Báo cáo',
      onPress: () => router.navigate('/seller/reports'),
    },
    {
      key: 'growth',
      icon: SellerIcons.megaphone,
      title: 'Chương trình tăng trưởng',
      onPress: () => router.navigate('/seller/growth'),
    },
    {
      key: 'settings',
      icon: SellerIcons.settings,
      title: 'Cài đặt',
      onPress: () => router.navigate('/seller/settings'),
    },
    {
      key: 'support',
      icon: SellerIcons.support,
      title: 'Hỗ trợ đối tác',
      onPress: () => router.navigate('/support'),
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SellerHeader
        onBack={() => (router.canGoBack() ? router.back() : router.navigate('/seller/reports'))}
        subtitle={isLoading ? '' : (profile?.contactEmail ?? '')}
        title="Hồ sơ quán"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <View style={styles.body}>
          {isError ? (
            <InlineAlert message="Không tải được hồ sơ quán. Kéo xuống để thử lại." />
          ) : null}

          {profileMissing ? <MerchantRegistrationRequired /> : null}

          {isLoading || isError || profileMissing ? null : (
            <ShopSetupCard location={location} openingHours={openingHours} profile={profile} />
          )}

          <MenuSection items={menuItems} title="QUẢN LÝ CỬA HÀNG" />

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
    marginTop: 34,
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
