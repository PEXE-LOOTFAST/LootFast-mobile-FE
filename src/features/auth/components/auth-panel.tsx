import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthNotice } from '@/features/auth/components/auth-notice';
import { AuthTabs } from '@/features/auth/components/auth-tabs';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import type { AuthTab, RegisterValues } from '@/features/auth/types';

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
              onTryDemo={onAuthenticated}
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
