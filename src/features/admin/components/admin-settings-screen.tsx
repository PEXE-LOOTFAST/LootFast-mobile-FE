import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminIcons } from '@/features/admin/constants/icons';
import { MOCK_ADMIN_ACCOUNT } from '@/features/admin/data/mock-admin-account';
import { HomeIcon } from '@/features/home/components/home-icon';
import { useTheme } from '@/hooks/use-theme';
import { signOut } from '@/lib/auth-session';

// Tạm thời chỉ có thẻ tài khoản và nút đăng xuất; các cấu hình hệ thống làm ở nhánh riêng.
export function AdminSettingsScreen() {
  const theme = useTheme();

  // Đăng xuất xong quay lại cổng quản trị để người dùng tiếp theo đăng nhập lại.
  const handleSignOut = () => {
    Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi khu vực quản trị?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/admin-login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.body}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          Cài đặt
        </Text>

        <View
          style={[
            styles.account,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
            <HomeIcon name={AdminIcons.person} color={theme.primary} size={24} />
          </View>
          <View style={styles.accountCopy}>
            <Text style={[styles.accountName, { color: theme.text }]}>Quản trị viên</Text>
            <Text numberOfLines={1} style={[styles.accountEmail, { color: theme.textSecondary }]}>
              {MOCK_ADMIN_ACCOUNT.email}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel="Đăng xuất"
          accessibilityRole="button"
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOut,
            { backgroundColor: theme.backgroundElement, borderColor: theme.danger },
            pressed && styles.pressed,
          ]}
        >
          <HomeIcon name={AdminIcons.logout} color={theme.danger} size={16} />
          <Text style={[styles.signOutLabel, { color: theme.danger }]}>Đăng xuất</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { gap: 14, padding: 16 },
  title: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4, marginVertical: 6 },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
  },
  accountCopy: { flex: 1, gap: 2 },
  accountName: { fontSize: 15, fontWeight: '900' },
  accountEmail: { fontSize: 13, fontWeight: '600' },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 13,
  },
  signOutLabel: { fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.8 },
});
