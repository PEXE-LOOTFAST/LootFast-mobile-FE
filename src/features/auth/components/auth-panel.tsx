import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InlineAlert } from '@/components/ui/inline-alert';
import { AuthTabs } from '@/features/auth/components/auth-tabs';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import type { AuthTab, DemoRole, RegisterValues } from '@/features/auth/types';
import { useTheme } from '@/hooks/use-theme';
import { dismissAuthPrompt, signIn } from '@/lib/auth-session';

type AuthPanelProps = {
  /** Chạy sau khi phiên đã mở — dùng để điều hướng. Modal không cần vì nó tự đóng. */
  onAuthenticated?: () => void;
};

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const theme = useTheme();
  const [tab, setTab] = useState<AuthTab>('login');
  const [registeredEmail, setRegisteredEmail] = useState<string>();

  const handleRegistered = ({ email }: RegisterValues) => {
    setRegisteredEmail(email.trim());
    setTab('login');
  };

  // Demo người mua đi như đăng nhập thường (modal còn chạy tiếp thao tác khách vừa bấm).
  // Người bán sang hẳn khu vực khác nên bỏ thao tác đang chờ của người mua đi.
  const handleTryDemo = (role: DemoRole) => {
    if (role === 'buyer') {
      signIn();
      onAuthenticated?.();
      return;
    }

    dismissAuthPrompt();
    signIn();
    router.replace('/seller');
  };

  // Đóng modal trước khi rời đi, nếu không nó vẫn nằm đè lên màn đăng nhập quản trị.
  // Ở màn /login không có modal nào mở nên lệnh này không đổi gì.
  const goToAdminLogin = () => {
    dismissAuthPrompt();
    router.navigate('/admin-login');
  };

  return (
    <View>
      <AuthTabs value={tab} onChange={setTab} />

      <View style={styles.body}>
        {tab === 'login' ? (
          <>
            {registeredEmail ? (
              <InlineAlert
                tone="success"
                message="Tạo tài khoản thành công. Đăng nhập để bắt đầu săn deal nhé!"
              />
            ) : null}
            <LoginForm
              initialEmail={registeredEmail}
              onSuccess={() => onAuthenticated?.()}
              onTryDemo={handleTryDemo}
            />

            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              onPress={goToAdminLogin}
              style={({ pressed }) => [styles.adminLink, pressed && styles.pressed]}
            >
              <Text style={[styles.adminLinkText, { color: theme.textSecondary }]}>
                Bạn là quản trị viên?{' '}
                <Text style={{ color: theme.primary }}>Đăng nhập quản trị</Text>
              </Text>
            </Pressable>
          </>
        ) : (
          <RegisterForm onSubmit={handleRegistered} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: 20, padding: 20 },
  adminLink: { alignSelf: 'center' },
  adminLinkText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: 0.7 },
});
