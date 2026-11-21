import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppearanceSection } from '@/components/settings/appearance-section';
import { Icon } from '@/components/ui/icon';
import { FontSize, FontWeight, MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { AdminIcons } from '@/features/admin/constants/icons';
import { useProfile } from '@/features/profile/api/use-profile';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { confirmSignOut } from '@/lib/confirm-sign-out';

// Lấy chữ cái đầu của hai từ đầu tiên, vd. "Nguyễn Quản Trị" → "NQ".
function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function AdminSettingsScreen() {
  const theme = useTheme();
  const [today] = useState(() => new Date());
  const { user } = useAuthSession();
  const profileQuery = useProfile(true);
  const profile = profileQuery.data;

  const accountName =
    profile?.displayName?.trim() ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const accountEmail = profile?.email ?? user?.email ?? '';
  // Nhãn vai trò lấy từ role backend trả về thay vì gán cứng.
  const accountRole = (profile?.roles ?? user?.roles ?? []).includes('ADMIN')
    ? 'Quản trị viên'
    : 'Tài khoản';

  // Đăng xuất xong quay lại cổng quản trị để người dùng tiếp theo đăng nhập lại.
  const handleSignOut = () =>
    confirmSignOut({
      message: 'Bạn muốn đăng xuất khỏi khu vực quản trị?',
      redirectTo: '/admin-login',
    });

  const cardStyle = [
    styles.card,
    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <AdminHeader date={today} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <View style={[cardStyle, styles.account]}>
            <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.initials, { color: theme.primary }]}>
                {getInitials(accountName)}
              </Text>
            </View>
            <View style={styles.accountCopy}>
              {profileQuery.isLoading ? (
                <ActivityIndicator color={theme.primary} size="small" />
              ) : (
                <>
                  <Text numberOfLines={1} style={[styles.accountName, { color: theme.text }]}>
                    {accountName}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.accountEmail, { color: theme.textSecondary }]}
                  >
                    {accountEmail}
                  </Text>
                  <View style={[styles.roleBadge, { backgroundColor: theme.primary }]}>
                    <Text style={[styles.roleLabel, { color: theme.onPrimary }]}>
                      {accountRole}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <AppearanceSection />

          <Pressable
            accessibilityLabel="Đăng xuất"
            accessibilityRole="button"
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOut,
              { backgroundColor: `${theme.danger}14` },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={AdminIcons.logout} color={theme.danger} size={16} />
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
    gap: Spacing.lg,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Radius.xxl,
    boxShadow: Shadow.card,
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 18,
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  initials: { fontSize: FontSize.title, fontWeight: FontWeight.heavy },
  accountCopy: { flex: 1, gap: 3 },
  accountName: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.heavy },
  accountEmail: { fontSize: FontSize.bodySm, fontWeight: FontWeight.medium },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs,
  },
  roleLabel: { fontSize: FontSize.caption, fontWeight: FontWeight.bold },
  signOut: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
  },
  signOutLabel: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  pressed: { opacity: 0.8 },
});
