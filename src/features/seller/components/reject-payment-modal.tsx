import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { useTheme } from '@/hooks/use-theme';

const MAX_REASON_LENGTH = 500;

type RejectPaymentModalProps = {
  visible: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
};

// Backend bắt buộc có lý do khi từ chối báo chuyển khoản, và lý do này được gửi tới người mua.
export function RejectPaymentModal({
  visible,
  isSubmitting,
  onCancel,
  onSubmit,
}: RejectPaymentModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const canSubmit = trimmed.length > 0 && !isSubmitting;

  const cancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={cancel}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        // Chừa chỗ cho bàn phím để ô nhập lý do và các nút không bị che.
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + 16,
            paddingBottom: Math.max(insets.bottom, keyboardHeight) + 16,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Đóng"
          accessibilityRole="button"
          onPress={cancel}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            Chưa nhận được tiền
          </Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            Cho khách biết lý do để họ kiểm tra lại khoản chuyển.
          </Text>

          <TextInput
            accessibilityLabel="Lý do từ chối"
            maxLength={MAX_REASON_LENGTH}
            multiline
            onChangeText={setReason}
            placeholder="VD: Số tiền chuyển chưa đủ"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
            ]}
            value={reason}
          />

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={cancel}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.background, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.buttonLabel, { color: theme.text }]}>Huỷ</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
              disabled={!canSubmit}
              onPress={() => {
                onSubmit(trimmed);
                setReason('');
              }}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: canSubmit ? theme.danger : theme.border,
                  borderColor: canSubmit ? theme.danger : theme.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.buttonLabel, { color: theme.onDanger }]}>Gửi từ chối</Text>
            </Pressable>
          </View>
        </View>
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
  input: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    outlineWidth: 0,
  },
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
