import { router, type Href } from 'expo-router';

import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MenuSection, type MenuItem } from '@/components/ui/menu-section';
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

// Thứ tự các nhóm trên màn: thông tin cá nhân → hoạt động mua sắm → hỗ trợ.
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
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BuyerHeader subtitle="Quản lý tài khoản và hoạt động của bạn" title="Cài đặt" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.accountCard,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
            {profileImage ? (
              <Image contentFit="cover" source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: theme.primary }]}>{initials}</Text>
            )}
          </View>
          <View style={styles.accountCopy}>
            {profileQuery.isLoading ? (
              <ActivityIndicator color={theme.primary} size="small" />
            ) : (
              <>
                <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
                <Text style={[styles.email, { color: theme.textSecondary }]}>{email}</Text>
                <Text style={[styles.phone, { color: theme.textSecondary }]}>
                  {phoneNumber || 'Chưa cập nhật số điện thoại'}
                </Text>
              </>
            )}
          </View>
          <Pressable
            accessibilityLabel="Đổi ảnh đại diện"
            accessibilityRole="button"
            disabled={!user || avatar.isUploading}
            onPress={() => void avatar.pickAndUpload()}
            style={({ pressed }) => [
              styles.camera,
              { backgroundColor: theme.backgroundElement, borderColor: theme.primary },
              pressed && styles.pressed,
            ]}
          >
            {avatar.isUploading ? (
              <ActivityIndicator color={theme.primary} size="small" />
            ) : (
              <Icon name={ProfileIcons.camera} color={theme.primary} size={15} />
            )}
          </Pressable>
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
        <Pressable
          accessibilityRole="button"
          onPress={() => confirmSignOut()}
          style={styles.signOut}
        >
          <Text style={[styles.signOutText, { color: theme.danger }]}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: 12, paddingBottom: 110 },
  avatarImage: { borderRadius: 999, height: '100%', width: '100%' },
  accountCard: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 999,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  avatarText: { fontSize: 16, fontWeight: '900' },
  accountCopy: { flex: 1, gap: 4, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '900' },
  email: { fontSize: 13 },
  phone: { fontSize: 13 },
  camera: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  cameraText: { fontSize: 15, fontWeight: '900' },
  pressed: { opacity: 0.7 },
  sellerButton: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  sellerIcon: { marginRight: 10 },
  sellerText: { flex: 1, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  signOut: { alignItems: 'center', padding: 10 },
  signOutText: { fontSize: 14, fontWeight: '800' },
  errorBox: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  errorText: { flex: 1, fontSize: 12, lineHeight: 17 },
  retryButton: { padding: 4 },
  retryText: { fontSize: 13, fontWeight: '800' },
});
