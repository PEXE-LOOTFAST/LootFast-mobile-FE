import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBackdrop } from '@/features/auth/components/auth-backdrop';
import { AuthHeader } from '@/features/auth/components/auth-header';
import { AuthPanel } from '@/features/auth/components/auth-panel';
import { useTheme } from '@/hooks/use-theme';
import { signIn } from '@/lib/auth-session';

export function LoginScreen() {
  const theme = useTheme();

  const enterApp = () => {
    signIn();
    router.replace('/');
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
            <AuthPanel onAuthenticated={enterApp} />
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
});
