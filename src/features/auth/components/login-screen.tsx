import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Shadow, Spacing } from '@/constants/theme';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { AuthBackdrop } from '@/features/auth/components/auth-backdrop';
import { AuthHeader } from '@/features/auth/components/auth-header';
import { AuthPanel } from '@/features/auth/components/auth-panel';
import { useTheme } from '@/hooks/use-theme';

export function LoginScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <AuthBackdrop />

      <KeyboardAwareScrollView
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
          <AuthPanel onAuthenticated={() => router.replace('/')} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, gap: 28, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Radius.xxl,
    boxShadow: Shadow.overlay,
  },
});
