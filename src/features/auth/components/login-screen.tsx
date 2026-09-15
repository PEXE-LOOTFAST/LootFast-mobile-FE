import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBackdrop } from '@/features/auth/components/auth-backdrop';
import { AuthHeader } from '@/features/auth/components/auth-header';
import { AuthNotice } from '@/features/auth/components/auth-notice';
import { AuthTabs } from '@/features/auth/components/auth-tabs';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import type { AuthTab, RegisterValues } from '@/features/auth/types';
import { useTheme } from '@/hooks/use-theme';

export function LoginScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<AuthTab>('login');
  const [registeredEmail, setRegisteredEmail] = useState<string>();

  // Chưa có API xác thực: tạm vào thẳng app để các màn phía sau phát triển song song được.
  const enterApp = () => router.replace('/');

  const handleRegistered = ({ email }: RegisterValues) => {
    setRegisteredEmail(email.trim());
    setTab('login');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <AuthBackdrop />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader onBack={router.canGoBack() ? () => router.back() : undefined} />

          <View
            style={[
              styles.card,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}
          >
            <AuthTabs value={tab} onChange={setTab} />

            <View style={styles.cardBody}>
              {tab === 'login' ? (
                <>
                  {registeredEmail ? (
                    <AuthNotice message="Tạo tài khoản thành công. Đăng nhập để bắt đầu săn deal nhé!" />
                  ) : null}
                  <LoginForm
                    initialIdentifier={registeredEmail}
                    onSubmit={enterApp}
                    onTryDemo={enterApp}
                  />
                </>
              ) : (
                <RegisterForm onSubmit={handleRegistered} />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, gap: 28, paddingHorizontal: 20, paddingBottom: 32 },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 28,
    boxShadow: '0px 18px 40px rgba(23, 33, 27, 0.08)',
  },
  cardBody: { gap: 20, padding: 20 },
});
