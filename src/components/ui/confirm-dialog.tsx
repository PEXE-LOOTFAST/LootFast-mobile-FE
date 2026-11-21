import { useSyncExternalStore } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { acceptConfirm, dismissConfirm, getConfirmRequest, subscribeConfirm } from '@/lib/confirm';

/**
 * Hộp thoại xác nhận của toàn app, gắn một lần ở layout gốc. Mọi nơi cần hỏi lại thì gọi
 * `confirmAction` trong `@/lib/confirm` thay vì `Alert.alert`.
 */
export function ConfirmDialog() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const request = useSyncExternalStore(subscribeConfirm, getConfirmRequest, getConfirmRequest);

  const confirmColor = request?.isDestructive ? theme.danger : theme.primary;
  const confirmLabelColor = request?.isDestructive ? theme.onDanger : theme.onPrimary;

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={dismissConfirm}
      statusBarTranslucent
      transparent
      visible={request !== null}
    >
      <View
        style={[styles.overlay, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
      >
        <Pressable
          accessibilityLabel="Đóng"
          accessibilityRole="button"
          onPress={dismissConfirm}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        {request ? (
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
              {request.title}
            </Text>
            <Text style={[styles.message, { color: theme.textSecondary }]}>{request.message}</Text>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={dismissConfirm}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: theme.background, borderColor: theme.border },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.buttonLabel, { color: theme.text }]}>
                  {request.cancelLabel}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={acceptConfirm}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: confirmColor, borderColor: confirmColor },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.buttonLabel, { color: confirmLabelColor }]}>
                  {request.confirmLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  backdrop: { backgroundColor: 'rgba(10, 20, 14, 0.55)' },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 8,
    borderRadius: 24,
    padding: 22,
  },
  title: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  message: { fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  button: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  buttonLabel: { fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.85 },
});
