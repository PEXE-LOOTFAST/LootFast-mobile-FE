import { useSyncExternalStore } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing, StaticColors } from '@/constants/theme';
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
        style={[
          styles.overlay,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        <Pressable
          accessibilityLabel="Đóng"
          accessibilityRole="button"
          onPress={dismissConfirm}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        {request ? (
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <AppText accessibilityRole="header" style={styles.title} variant="title" weight="heavy">
              {request.title}
            </AppText>
            <AppText style={styles.message} tone="textSecondary">
              {request.message}
            </AppText>

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
                <AppText weight="bold">{request.cancelLabel}</AppText>
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
                <AppText color={confirmLabelColor} weight="bold">
                  {request.confirmLabel}
                </AppText>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  backdrop: { backgroundColor: StaticColors.backdrop },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
  },
  title: { letterSpacing: -0.3 },
  message: { lineHeight: 20 },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  button: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  pressed: { opacity: 0.85 },
});
