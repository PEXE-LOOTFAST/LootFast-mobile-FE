import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { Icon } from '@/components/ui/icon';
import { AdminLoginForm } from '@/features/admin/components/admin-login-form';
import { AdminIcons } from '@/features/admin/constants/icons';
import { AuthBackdrop } from '@/features/auth/components/auth-backdrop';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';

// Cổng đăng nhập riêng cho quản trị: không có tab đăng ký vì tài khoản admin do hệ thống cấp.
export function AdminLoginScreen() {
  const theme = useTheme();
  const { isAdmin } = useAuthSession();

  // Đã đăng nhập quản trị rồi thì vào thẳng, không bắt nhập lại.
  if (isAdmin) return <Redirect href="/admin/overview" />;

  // Đăng nhập thật: useAdminSignin đã mở phiên quản trị, ở đây chỉ còn việc điều hướng.
  const enterAdmin = () => router.replace('/admin/overview');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <AuthBackdrop />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.logo, { backgroundColor: theme.primary }]}>
            <Icon name={AdminIcons.shield} color={theme.onPrimary} size={34} />
          </View>

          <View style={styles.brandRow}>
            <Text accessibilityRole="header" style={[styles.brand, { color: theme.text }]}>
              Loot<Text style={{ color: theme.primary }}>Fast</Text> Admin
            </Text>
          </View>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Khu vực dành riêng cho quản trị viên
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <AdminLoginForm onAuthenticated={enterAdmin} />
        </View>

        <Pressable
          accessibilityRole="link"
          hitSlop={8}
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={[styles.backText, { color: theme.primary }]}>Về trang người mua</Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  header: { alignItems: 'center' },
  logo: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xxl,
    boxShadow: Shadow.brandStrong,
  },
  brandRow: { marginTop: 18 },
  brand: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  tagline: { marginTop: Spacing.sm, fontSize: FontSize.body, fontWeight: FontWeight.medium },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    boxShadow: Shadow.overlay,
  },
  back: { alignSelf: 'center' },
  backText: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  pressed: { opacity: 0.7 },
});
