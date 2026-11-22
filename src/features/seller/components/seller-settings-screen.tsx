import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppearanceSection } from '@/components/settings/appearance-section';
import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { MenuSection, type MenuItem } from '@/components/ui/menu-section';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { SellerHeader } from '@/features/seller/components/seller-header';
import { getShopSetupSteps } from '@/features/seller/components/shop-setup-card';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { confirmSignOut } from '@/lib/confirm-sign-out';

const SHOP_ITEMS: MenuItem[] = [
  {
    key: 'owner',
    icon: SellerIcons.person,
    title: 'Thông tin chủ quán',
    subtitle: 'Họ tên, email và số điện thoại của bạn',
    onPress: () => router.navigate('/seller/owner-info'),
  },
  {
    key: 'bank-account',
    icon: SellerIcons.wallet,
    title: 'Tài khoản nhận tiền',
    subtitle: 'Nơi nhận tiền bán deal của quán',
    onPress: () => router.navigate('/seller/bank-account'),
  },
  {
    key: 'notifications',
    icon: SellerIcons.bell,
    title: 'Thông báo cửa hàng',
    subtitle: 'Đơn hàng mới và cảnh báo vận hành deal',
    onPress: () => router.navigate('/seller/notification-settings'),
  },
];

const GROWTH_ITEMS: MenuItem[] = [
  {
    key: 'plan',
    icon: SellerIcons.crown,
    title: 'Gói Người bán Cao cấp',
    subtitle: 'Tự động hoá deal, báo cáo nâng cao, hỗ trợ ưu tiên',
    onPress: () =>
      router.navigate({ pathname: '/seller/plan', params: { from: '/seller/settings' } }),
  },
  {
    key: 'growth',
    icon: SellerIcons.megaphone,
    title: 'Chương trình tăng trưởng',
    subtitle: 'Chương trình có điều kiện cho deal cuối ngày',
    onPress: () => router.navigate('/seller/growth'),
  },
];

const ACCOUNT_ITEMS: MenuItem[] = [
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
    subtitle: 'Tiếng Việt',
    onPress: () => router.navigate('/seller/language'),
  },
];

const SUPPORT_ITEMS: MenuItem[] = [
  {
    key: 'support',
    icon: SellerIcons.support,
    title: 'Hỗ trợ đối tác',
    subtitle: 'Liên hệ LootFast, xoá tài khoản, chính sách',
    onPress: () => router.navigate('/support'),
  },
];

/**
 * Cài đặt của người bán theo cùng bố cục với tab Tài khoản bên người mua: thẻ quán ở đầu, các nhóm
 * có tiêu đề, giao diện, rồi nút chuyển chế độ và đăng xuất ở cuối.
 */
export function SellerSettingsScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SellerHeader subtitle="Tài khoản và vận hành cửa hàng" title="Cài đặt" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <ShopCard />

          <MenuSection items={SHOP_ITEMS} title="CỬA HÀNG" />
          <MenuSection items={GROWTH_ITEMS} title="PHÁT TRIỂN" />
          <MenuSection items={ACCOUNT_ITEMS} title="TÀI KHOẢN" />
          <AppearanceSection />
          <MenuSection items={SUPPORT_ITEMS} title="HỖ TRỢ" />

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
            <Icon name={SellerIcons.person} color={theme.text} size={18} />
            <AppText align="center" style={styles.switchLabel} variant="body" weight="bold">
              Chuyển sang người mua
            </AppText>
            <Icon name={SellerIcons.chevronRight} color={theme.textSecondary} size={17} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => confirmSignOut()}
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
          >
            <AppText tone="danger" variant="body" weight="bold">
              Đăng xuất
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const AVATAR_SIZE = 60;

// Thẻ quán ở đầu trang: người bán thấy ngay mình đang quản lý quán nào và hồ sơ đã đủ chưa.
function ShopCard() {
  const theme = useTheme();
  const { user } = useAuthSession();
  const shop = useMerchantShop();
  const profile = shop.profile;
  const storeName = profile?.storeName?.trim();
  const isSetupDone = getShopSetupSteps(shop).every((step) => step.done);

  return (
    <Card
      accessibilityLabel={`${storeName || 'Quán chưa có tên'}. Mở trang Cửa hàng`}
      elevated
      onPress={() => router.navigate('/seller/shop-info')}
      style={styles.shopCard}
    >
      {profile?.logoUrl ? (
        <Image
          accessibilityIgnoresInvertColors
          contentFit="cover"
          source={{ uri: profile.logoUrl }}
          style={styles.avatar}
        />
      ) : (
        <View style={[styles.avatar, styles.initial, { backgroundColor: theme.primarySoft }]}>
          {storeName ? (
            <AppText tone="primary" variant="headline" weight="heavy">
              {storeName.charAt(0).toUpperCase()}
            </AppText>
          ) : (
            <Icon name={SellerIcons.store} color={theme.primary} size={26} />
          )}
        </View>
      )}

      <View style={styles.shopCopy}>
        <AppText numberOfLines={1} variant="subtitle" weight="heavy">
          {shop.isLoading ? 'Đang tải…' : storeName || 'Quán chưa có tên'}
        </AppText>
        {user?.email ? (
          <AppText numberOfLines={1} tone="textSecondary" variant="bodySm">
            {user.email}
          </AppText>
        ) : null}
        {shop.isLoading || shop.profileMissing ? null : isSetupDone ? (
          profile?.verified ? (
            <Badge label="Đã xác minh" size="sm" tone="primarySoft" />
          ) : null
        ) : (
          <Badge label="Hồ sơ quán còn thiếu" size="sm" tone="accent" />
        )}
      </View>

      <Icon name={SellerIcons.chevronRight} color={theme.textSecondary} size={18} />
    </Card>
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
  shopCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: Radius.lg },
  initial: { alignItems: 'center', justifyContent: 'center' },
  shopCopy: { flex: 1, minWidth: 0, gap: Spacing.xs },
  switchButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.xxl,
    paddingHorizontal: Spacing.lg,
  },
  switchLabel: { flex: 1 },
  signOut: { alignItems: 'center', padding: 10 },
  pressed: { opacity: 0.7 },
});
