import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontSize, FontWeight, Radius, Spacing, StaticColors } from '@/constants/theme';
import { BrandButton } from '@/components/ui/brand-button';
import { TextField } from '@/components/ui/text-field';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { useTheme } from '@/hooks/use-theme';

/** Backend giới hạn lý do từ chối 500 ký tự (RejectMerchantApplicationRequest). */
const MAX_REASON_LENGTH = 500;

type RejectApplicationDialogProps = {
  /** Tên hồ sơ đang bị từ chối; null là hộp thoại đang đóng. */
  applicationTitle: string | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  /** Mặc định là nội dung từ chối hồ sơ; màn khác (vd. khoá tài khoản) ghi đè cho đúng ngữ cảnh. */
  title?: string;
  message?: string;
  confirmLabel?: string;
  placeholder?: string;
};

/**
 * API bắt buộc kèm lý do khi từ chối hồ sơ, nên không dùng được hộp thoại xác nhận hai nút
 * dùng chung. Tự vẽ bằng Modal thay vì `Alert.prompt` vì prompt chỉ có trên iOS.
 *
 * Nơi dùng phải gắn `key` theo hồ sơ đang từ chối để mỗi lần mở là một ô trống mới, không sót
 * lý do gõ dở của hồ sơ trước.
 */
export function RejectApplicationDialog({
  applicationTitle,
  isSubmitting,
  onCancel,
  onConfirm,
  title = 'Từ chối hồ sơ',
  message = 'Người đăng ký sẽ nhận được lý do này, hãy ghi rõ để họ biết cần bổ sung gì.',
  confirmLabel = 'Từ chối',
  placeholder = 'Vd. Ảnh giấy phép kinh doanh bị mờ, không đọc được số.',
}: RejectApplicationDialogProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const [reason, setReason] = useState('');
  const isOpen = applicationTitle !== null;
  const trimmed = reason.trim();

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onCancel}
      statusBarTranslucent
      transparent
      visible={isOpen}
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
          onPress={onCancel}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

          <TextField
            autoFocus
            label={applicationTitle ?? ''}
            maxLength={MAX_REASON_LENGTH}
            multiline
            numberOfLines={3}
            onChangeText={setReason}
            placeholder={placeholder}
            size="compact"
            value={reason}
          />
          <Text style={[styles.counter, { color: theme.textSecondary }]}>
            {trimmed.length}/{MAX_REASON_LENGTH}
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancel,
                { backgroundColor: theme.background, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.cancelLabel, { color: theme.text }]}>Huỷ</Text>
            </Pressable>

            <View style={styles.confirm}>
              <BrandButton
                disabled={trimmed.length === 0}
                loading={isSubmitting}
                onPress={() => onConfirm(trimmed)}
              >
                {confirmLabel}
              </BrandButton>
            </View>
          </View>
        </View>
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
    gap: 10,
    borderRadius: Radius.xxl,
    padding: 22,
  },
  title: { fontSize: FontSize.title, fontWeight: FontWeight.heavy, letterSpacing: -0.3 },
  message: { fontSize: FontSize.body, lineHeight: 20 },
  counter: { alignSelf: 'flex-end', fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: Spacing.xs },
  cancel: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.lg,
  },
  cancelLabel: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  confirm: { flex: 1 },
  pressed: { opacity: 0.85 },
});
