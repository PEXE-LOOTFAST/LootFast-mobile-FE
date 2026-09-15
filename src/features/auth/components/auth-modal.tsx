import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthPanel } from '@/features/auth/components/auth-panel';
import { FieldIcon } from '@/features/auth/components/field-icon';
import { AuthIcons } from '@/features/auth/constants/icons';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { dismissAuthPrompt, signIn } from '@/lib/auth-session';

export function AuthModal() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthPromptOpen } = useAuthSession();

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={dismissAuthPrompt}
      statusBarTranslucent
      transparent
      visible={isAuthPromptOpen}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Đóng"
          accessibilityRole="button"
          onPress={dismissAuthPrompt}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          <Animated.View
            entering={SlideInDown.duration(280)}
            style={[
              styles.sheet,
              { backgroundColor: theme.backgroundElement, paddingBottom: insets.bottom + 12 },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: theme.border }]} />

            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
                  Đăng nhập để tiếp tục
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Bạn cần tài khoản LootFast để giữ deal, lọc món và theo dõi đơn hàng.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Đóng"
                accessibilityRole="button"
                hitSlop={8}
                onPress={dismissAuthPrompt}
                style={[styles.close, { backgroundColor: theme.background }]}
              >
                <FieldIcon name={AuthIcons.close} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
            >
              <AuthPanel onAuthenticated={signIn} />
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(10, 20, 14, 0.55)' },
  keyboard: { width: '100%', maxHeight: '92%' },
  sheet: {
    flexShrink: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, marginTop: 10, borderRadius: 3 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
  headerCopy: { flex: 1, gap: 4 },
  title: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, lineHeight: 19 },
  close: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  scroll: { flexGrow: 0 },
});
