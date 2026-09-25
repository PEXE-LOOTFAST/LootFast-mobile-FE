import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthNotice } from '@/features/auth/components/auth-notice';
import { AuthTabs } from '@/features/auth/components/auth-tabs';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import type { AuthTab, DemoRole, RegisterValues } from '@/features/auth/types';
import { dismissAuthPrompt, signIn, signInAsAdmin } from '@/lib/auth-session';

type AuthPanelProps = {
  onAuthenticated: () => void;
};

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
  const [tab, setTab] = useState<AuthTab>('login');
  const [registeredEmail, setRegisteredEmail] = useState<string>();

  const handleRegistered = ({ email }: RegisterValues) => {
    setRegisteredEmail(email.trim());
    setTab('login');
  };

  // Demo người mua đi như đăng nhập thường (modal còn chạy tiếp thao tác khách vừa bấm).
  // Người bán và quản lý sang hẳn khu vực khác nên bỏ thao tác đang chờ của người mua đi.
  const handleTryDemo = (role: DemoRole) => {
    if (role === 'buyer') {
      onAuthenticated();
      return;
    }

    dismissAuthPrompt();
    if (role === 'seller') {
      signIn();
      router.replace('/seller');
    } else {
      signInAsAdmin();
      router.replace('/admin');
    }
  };

  return (
    <View>
      <AuthTabs value={tab} onChange={setTab} />

      <View style={styles.body}>
        {tab === 'login' ? (
          <>
            {registeredEmail ? (
              <AuthNotice message="Tạo tài khoản thành công. Đăng nhập để bắt đầu săn deal nhé!" />
            ) : null}
            <LoginForm
              initialIdentifier={registeredEmail}
              onSubmit={onAuthenticated}
              onTryDemo={handleTryDemo}
            />
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
});
