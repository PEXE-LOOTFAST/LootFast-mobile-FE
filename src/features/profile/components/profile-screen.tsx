import { router, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { confirmSignOut } from '@/lib/confirm-sign-out';
import type { SymbolViewProps } from 'expo-symbols';

type ProfileIconName = Extract<SymbolViewProps['name'], object>;
// href: mục mở sang route/tab khác khi bấm (vd. Đơn hàng của tôi → tab Đơn hàng).
type ProfileItem = { icon: ProfileIconName; title: string; subtitle: string; href?: Href };

const ProfileIcons = {
  premium: { ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' },
  rewards: { ios: 'star.fill', android: 'stars', web: 'stars' },
  orders: { ios: 'bag.fill', android: 'shopping_bag', web: 'shopping_bag' },
  location: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  favorites: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  payment: { ios: 'creditcard.fill', android: 'credit_card', web: 'credit_card' },
  settings: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
  support: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
  seller: { ios: 'storefront.fill', android: 'storefront', web: 'storefront' },
  camera: { ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
} satisfies Record<string, ProfileIconName>;

const BENEFITS: ProfileItem[] = [
  {
    icon: ProfileIcons.premium,
    title: 'Gói Người mua Cao cấp',
    subtitle: 'Quản lý gói và quyền lợi Cao cấp',
    href: { pathname: '/premium', params: { from: '/profile' } },
  },
  {
    icon: ProfileIcons.rewards,
    title: 'Điểm thưởng và quyền lợi',
    subtitle: 'Theo dõi điểm thưởng và quyền lợi đã mở khóa',
  },
];

const ACCOUNT_ITEMS: ProfileItem[] = [
  { icon: ProfileIcons.orders, title: 'Đơn hàng của tôi', subtitle: '', href: '/orders' },
  { icon: ProfileIcons.location, title: 'Bản đồ và địa chỉ', subtitle: '' },
  { icon: ProfileIcons.favorites, title: 'Món yêu thích', subtitle: '' },
  { icon: ProfileIcons.payment, title: 'Phương thức thanh toán', subtitle: '' },
  { icon: ProfileIcons.settings, title: 'Cài đặt', subtitle: '' },
  { icon: ProfileIcons.support, title: 'Hỗ trợ', subtitle: '' },
];

function ProfileItemRow({ item, onPress }: { item: ProfileItem; onPress?: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={item.title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <View style={[styles.itemIcon, { backgroundColor: theme.primarySoft }]}>
        <SymbolView name={item.icon} size={19} tintColor={theme.primary} />
      </View>
      <View style={styles.itemCopy}>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
        ) : null}
      </View>
      <SymbolView name={ProfileIcons.chevronRight} size={17} tintColor={theme.textSecondary} />
    </Pressable>
  );
}

function ProfileSection({ items, title }: { items: ProfileItem[]; title: string }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      {items.map((item, index) => (
        <View key={item.title}>
          <ProfileItemRow
            item={item}
            onPress={item.href ? () => router.navigate(item.href as Href) : undefined}
          />
          {index < items.length - 1 ? (
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function ProfileScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: theme.primary }]}>
          <View
            style={[
              styles.decoration,
              styles.decorationLarge,
              { backgroundColor: theme.primarySoft },
            ]}
          />
          <View
            style={[
              styles.decoration,
              styles.decorationSmall,
              { backgroundColor: theme.primarySoft },
            ]}
          />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Hồ sơ người mua</Text>
            <Text style={styles.heroSubtitle}>
              Quản lý tài khoản, ưu đãi và quyền lợi{`\n`}của bạn
            </Text>
          </View>
          <View style={styles.heroAvatar}>
            <Text style={[styles.heroAvatarText, { color: theme.primary }]}>TT</Text>
            <View style={[styles.heroCamera, { backgroundColor: theme.backgroundElement }]}>
              <SymbolView name={ProfileIcons.camera} size={13} tintColor={theme.primary} />
            </View>
          </View>
        </View>

        <View
          style={[
            styles.accountCard,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>TT</Text>
          </View>
          <View style={styles.accountCopy}>
            <Text style={[styles.name, { color: theme.text }]}>test test</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>test@gmail.com</Text>
          </View>
          <View
            style={[
              styles.camera,
              { backgroundColor: theme.backgroundElement, borderColor: theme.primary },
            ]}
          >
            <SymbolView name={ProfileIcons.camera} size={15} tintColor={theme.primary} />
          </View>
        </View>
        <ProfileSection items={BENEFITS} title="QUYỀN LỢI CỦA BẠN" />
        <ProfileSection items={ACCOUNT_ITEMS} title="TÀI KHOẢN NGƯỜI MUA" />
        <Pressable
          accessibilityLabel="Chuyển sang người bán"
          accessibilityRole="button"
          onPress={() => router.navigate('/seller')}
          style={[
            styles.sellerButton,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <SymbolView name={ProfileIcons.seller} size={18} tintColor={theme.text} />
          <Text style={[styles.sellerText, { color: theme.text }]}>Chuyển sang người bán</Text>
          <SymbolView name={ProfileIcons.chevronRight} size={17} tintColor={theme.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => confirmSignOut()}
          style={styles.signOut}
        >
          <Text style={[styles.signOutText, { color: theme.danger }]}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { gap: 12, paddingBottom: 110 },
  hero: {
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 128,
    overflow: 'hidden',
    paddingHorizontal: 18,
  },
  decoration: { borderRadius: 999, opacity: 0.35, position: 'absolute' },
  decorationLarge: { height: 220, right: -84, top: -86, width: 220 },
  decorationSmall: { bottom: -76, height: 132, right: 106, width: 132 },
  heroCopy: { flex: 1, gap: 6 },
  heroTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' },
  heroSubtitle: { color: '#DDF2E5', fontSize: 12, lineHeight: 17 },
  heroAvatar: {
    alignItems: 'center',
    borderColor: '#B7E6C8',
    borderRadius: 999,
    borderWidth: 2,
    height: 70,
    justifyContent: 'center',
    marginLeft: 12,
    width: 70,
  },
  heroAvatarText: { fontSize: 16, fontWeight: '900' },
  heroCamera: {
    alignItems: 'center',
    borderColor: '#16794B',
    borderRadius: 999,
    borderWidth: 1,
    bottom: -4,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -3,
    width: 24,
  },
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
  camera: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  cameraText: { fontSize: 15, fontWeight: '900' },
  section: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: { opacity: 0.7 },
  itemIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  itemCopy: { flex: 1, gap: 3, marginLeft: 12 },
  itemTitle: { fontSize: 14, fontWeight: '800' },
  itemSubtitle: { fontSize: 12, lineHeight: 17 },
  chevron: { marginLeft: 8 },
  divider: { height: 1, marginLeft: 66 },
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
});
