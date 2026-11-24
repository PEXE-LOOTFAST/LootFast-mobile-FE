import { router, type Href } from 'expo-router';

import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppearanceSection } from '@/components/settings/appearance-section';
import { AppText } from '@/components/ui/app-text';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MenuSection, type MenuItem } from '@/components/ui/menu-section';
import { Screen } from '@/components/ui/screen';
import { Icon, type IconName } from '@/components/ui/icon';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import { getProfileErrorMessage } from '@/features/profile/api/profile';
import { useAvatarUpload } from '@/features/profile/api/use-avatar';
import { useProfile } from '@/features/profile/api/use-profile';
import { ProfileIcons } from '@/features/profile/constants/icons';
import { getInitials } from '@/features/profile/get-initials';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { confirmSignOut } from '@/lib/confirm-sign-out';

// href: mục mở sang route/tab khác khi bấm (vd. Đơn hàng của tôi → tab Đơn hàng).
type ProfileItem = { icon: IconName; title: string; subtitle: string; href?: Href };

// Thứ tự các nhóm trên màn: thông tin cá nhân → hoạt động mua sắm → gói dịch vụ → hỗ trợ.
const ACCOUNT_ITEMS: ProfileItem[] = [
  {
    icon: ProfileIcons.profile,
    title: 'Hồ sơ',
    subtitle: 'Thông tin tài khoản và gợi ý cho bạn',
    href: '/profile-info',
  },
];

const ACTIVITY_ITEMS: ProfileItem[] = [
  { icon: ProfileIcons.orders, title: 'Đơn hàng của tôi', subtitle: '', href: '/orders' },
  { icon: ProfileIcons.favorites, title: 'Món yêu thích', subtitle: '', href: '/favorites' },
];

const BENEFIT_ITEMS: ProfileItem[] = [
  {
    icon: ProfileIcons.premium,
    title: 'Gói Người mua Cao cấp',
    subtitle: 'Lưu bộ lọc và nhận thông báo deal phù hợp',
    href: { pathname: '/premium', params: { from: '/profile' } },
  },
];

const SUPPORT_ITEMS: ProfileItem[] = [
  {
    icon: ProfileIcons.support,
    title: 'Hỗ trợ',
    subtitle: 'Liên hệ, xóa tài khoản và chính sách quyền riêng tư',
    href: '/support',
  },
];

function toMenuItems(items: ProfileItem[]): MenuItem[] {
  return items.map((item) => ({
    key: item.title,
    icon: item.icon,
    title: item.title,
    subtitle: item.subtitle || undefined,
    onPress: item.href ? () => router.navigate(item.href as Href) : undefined,
  }));
}

export function ProfileScreen() {
  const theme = useTheme();
  const { user } = useAuthSession();
  // Đăng ký bán hàng thuộc về phía người bán nên gộp chung nút chuyển sang người bán: chưa được
  // duyệt thì nút dẫn sang màn đăng ký, được duyệt rồi mới vào khu người bán.
  const isMerchant = Boolean(user?.roles.includes('MERCHANT'));
  const profileQuery = useProfile(Boolean(user));
  const avatar = useAvatarUpload();
  const profile = profileQuery.data;
  const displayName =
    profile?.displayName ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const email = profile?.email ?? user?.email ?? '';
  const phoneNumber = profile?.phoneNumber ?? '';
  const initials = getInitials(displayName || '');
  const profileImage = profile?.avatarUrl ?? null;

  return (
    <Screen
      gap="md"
      header={<BuyerHeader subtitle="Hồ sơ, đơn hàng, giao diện và hỗ trợ" title="Tài khoản" />}
    >
      <View
        style={[
          styles.accountCard,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        <View>
          <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
            {profileImage ? (
              <Image contentFit="cover" source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <AppText tone="primary" variant="title" weight="heavy">
                {initials}
              </AppText>
            )}
          </View>
          <Pressable
            accessibilityLabel="Đổi ảnh đại diện"
            accessibilityRole="button"
            disabled={!user || avatar.isUploading}
            hitSlop={Spacing.sm}
            onPress={() => void avatar.pickAndUpload()}
            style={({ pressed }) => [
              styles.camera,
              { backgroundColor: theme.primary, borderColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}
          >
            {avatar.isUploading ? (
              <ActivityIndicator color={theme.onPrimary} size="small" />
            ) : (
              <Icon name={ProfileIcons.camera} color={theme.onPrimary} size={14} />
            )}
          </Pressable>
        </View>

        <View style={styles.accountCopy}>
          {profileQuery.isLoading ? (
            <ActivityIndicator color={theme.primary} size="small" />
          ) : (
            <>
              <AppText numberOfLines={1} variant="subtitle" weight="heavy">
                {displayName || 'Bạn'}
              </AppText>
              <AppText numberOfLines={1} tone="textSecondary" variant="bodySm">
                {email}
              </AppText>
              {phoneNumber ? (
                <AppText tone="textSecondary" variant="bodySm">
                  {phoneNumber}
                </AppText>
              ) : (
                <Pressable
                  accessibilityRole="link"
                  hitSlop={Spacing.sm}
                  onPress={() => router.navigate('/profile-info')}
                >
                  <AppText tone="primary" variant="bodySm" weight="bold">
                    + Thêm số điện thoại
                  </AppText>
                </Pressable>
              )}
            </>
          )}
        </View>
      </View>
      {profileQuery.isError ? (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.errorText, { color: theme.danger }]}>
            {getProfileErrorMessage(profileQuery.error)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Thử lại tải hồ sơ"
            onPress={() => void profileQuery.refetch()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={[styles.retryText, { color: theme.primary }]}>Thử lại</Text>
          </Pressable>
        </View>
      ) : null}
      <MenuSection items={toMenuItems(ACCOUNT_ITEMS)} title="TÀI KHOẢN" />
      <MenuSection items={toMenuItems(ACTIVITY_ITEMS)} title="HOẠT ĐỘNG CỦA BẠN" />
      <MenuSection items={toMenuItems(BENEFIT_ITEMS)} title="QUYỀN LỢI CỦA BẠN" />
      <AppearanceSection />
      <MenuSection items={toMenuItems(SUPPORT_ITEMS)} title="HỖ TRỢ" />
      <Pressable
        accessibilityLabel={isMerchant ? 'Chuyển sang người bán' : 'Đăng ký bán hàng'}
        accessibilityRole="button"
        onPress={() =>
          // Chưa được duyệt làm người bán thì khu /seller chỉ trả lỗi quyền, nên dẫn sang đăng ký.
          router.navigate(isMerchant ? '/seller' : '/merchant-application')
        }
        style={[
          styles.sellerButton,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        <Icon name={ProfileIcons.seller} color={theme.text} size={18} />
        <Text style={[styles.sellerText, { color: theme.text }]}>
          {isMerchant ? 'Chuyển sang người bán' : 'Đăng ký bán hàng'}
        </Text>
        <Icon name={ProfileIcons.chevronRight} color={theme.textSecondary} size={17} />
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => confirmSignOut()} style={styles.signOut}>
        <Text style={[styles.signOutText, { color: theme.danger }]}>Đăng xuất</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarImage: { borderRadius: Radius.full, height: '100%', width: '100%' },
  accountCard: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: Radius.full,
    height: 68,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 68,
  },
  accountCopy: { flex: 1, gap: Spacing.xxs, marginLeft: Spacing.lg },
  // Nút máy ảnh nhỏ gắn góc ảnh đại diện; hitSlop nới vùng chạm cho đủ ngón tay.
  camera: {
    position: 'absolute',
    right: -Spacing.xxs,
    bottom: -Spacing.xxs,
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  pressed: { opacity: 0.7 },
  sellerButton: {
    alignItems: 'center',
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
  },
  sellerIcon: { marginRight: 10 },
  sellerText: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  signOut: { alignItems: 'center', padding: 10 },
  signOutText: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  errorBox: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  errorText: { flex: 1, fontSize: FontSize.footnote, lineHeight: 17 },
  retryButton: { padding: Spacing.xs },
  retryText: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold },
});
