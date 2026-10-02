import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InlineAlert } from '@/components/ui/inline-alert';
import { AuthTabs } from '@/features/auth/components/auth-tabs';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { LoginForm } from '@/features/auth/components/login-form';
import { OtpForm } from '@/features/auth/components/otp-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import type { AuthStep, AuthTab } from '@/features/auth/types';
import { useTheme } from '@/hooks/use-theme';
import { dismissAuthPrompt } from '@/lib/auth-session';

type AuthPanelProps = {
  /** Chạy sau khi phiên đã mở — dùng để điều hướng. Modal không cần vì nó tự đóng. */
  onAuthenticated?: () => void;
};

/**
 * Khung đăng nhập/đăng ký, gồm bốn bước:
 *
 * - `form` — hai tab Đăng nhập và Đăng ký
 * - `verify-otp` — sau khi đăng ký, bắt buộc vì `signin` chặn tài khoản chưa xác thực
 * - `forgot-password` → `reset-password` — nhánh quên mật khẩu
 *
 * Email đi xuyên các bước nên giữ ở đây thay vì trong từng form con.
 */
export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const theme = useTheme();
  const [tab, setTab] = useState<AuthTab>('login');
  const [step, setStep] = useState<AuthStep>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [notice, setNotice] = useState<string>();

  const goToLogin = (message?: string) => {
    setStep('form');
    setTab('login');
    setNotice(message);
  };

  // Đóng modal trước khi rời đi, nếu không nó vẫn nằm đè lên màn đăng nhập quản trị.
  // Ở màn /login không có modal nào mở nên lệnh này không đổi gì.
  const goToAdminLogin = () => {
    dismissAuthPrompt();
    router.navigate('/admin-login');
  };

  if (step === 'verify-otp') {
    return (
      <View style={styles.body}>
        <OtpForm
          email={pendingEmail}
          onBack={() => goToLogin()}
          onVerified={() => goToLogin('Xác thực thành công. Đăng nhập để bắt đầu săn deal nhé!')}
        />
      </View>
    );
  }

  if (step === 'forgot-password') {
    return (
      <View style={styles.body}>
        <ForgotPasswordForm
          initialEmail={pendingEmail}
          onBack={() => goToLogin()}
          onSent={(email) => {
            setPendingEmail(email);
            setStep('reset-password');
          }}
        />
      </View>
    );
  }

  if (step === 'reset-password') {
    return (
      <View style={styles.body}>
        <ResetPasswordForm
          email={pendingEmail}
          onBack={() => goToLogin()}
          onDone={() => goToLogin('Đã đổi mật khẩu. Đăng nhập bằng mật khẩu mới nhé!')}
        />
      </View>
    );
  }

  return (
    <View>
      <AuthTabs value={tab} onChange={setTab} />

      <View style={styles.body}>
        {tab === 'login' ? (
          <>
            {notice ? <InlineAlert tone="success" message={notice} /> : null}
            <LoginForm
              initialEmail={pendingEmail}
              onForgotPassword={() => setStep('forgot-password')}
              onSuccess={() => onAuthenticated?.()}
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
          <RegisterForm
            onRegistered={(email) => {
              setPendingEmail(email);
              setStep('verify-otp');
            }}
          />
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
