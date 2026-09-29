import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { SlideInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthPanel } from '@/features/auth/components/auth-panel';
import { FieldIcon } from '@/features/auth/components/field-icon';
import { AuthIcons } from '@/features/auth/constants/icons';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { useTheme } from '@/hooks/use-theme';
import { dismissAuthPrompt } from '@/lib/auth-session';

const OUTER_PADDING = 16;
const KEYBOARD_GAP = 8;
// Chặn trần chiều cao để tab Đăng ký (nhiều ô hơn) không kéo dài gần kín màn hình:
// tấm thẻ giữ cỡ gần bằng tab Đăng nhập, phần dư cuộn bên trong.
const MAX_SHEET_HEIGHT = 600;

export function AuthModal() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight();
  const { isAuthPromptOpen } = useAuthSession();
  const [sheetHeight, setSheetHeight] = useState(0);

  // KeyboardAvoidingView co chiều cao khung chứa nên tấm thẻ bị bóp lại và nội dung bị cắt.
  // Ở đây giữ nguyên kích thước thẻ, chỉ đẩy nó lên đúng phần bị bàn phím che, và không đẩy
  // quá mép trên màn hình.
  const availableHeight = windowHeight - insets.top - insets.bottom - OUTER_PADDING * 2;
  const sheetTop = insets.top + OUTER_PADDING + Math.max(0, (availableHeight - sheetHeight) / 2);
  const hiddenByKeyboard =
    keyboardHeight > 0
      ? sheetTop + sheetHeight - (windowHeight - keyboardHeight - KEYBOARD_GAP)
      : 0;
  const maxShift = Math.max(0, sheetTop - insets.top - KEYBOARD_GAP);
  const shift = Math.min(Math.max(hiddenByKeyboard, 0), maxShift);

  const shiftStyle = useAnimatedStyle(
    () => ({ transform: [{ translateY: withTiming(-shift, { duration: 200 }) }] }),
    [shift],
  );

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={dismissAuthPrompt}
      statusBarTranslucent
      transparent
      visible={isAuthPromptOpen}
    >
      <View
        style={[styles.overlay, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
      >
        <Pressable
          accessibilityLabel="Đóng"
          accessibilityRole="button"
          onPress={dismissAuthPrompt}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        <Animated.View
          style={[
            styles.shifter,
            { maxHeight: Math.min(availableHeight, MAX_SHEET_HEIGHT) },
            shiftStyle,
          ]}
        >
          <Animated.View
            entering={SlideInDown.duration(280)}
            onLayout={(event) => setSheetHeight(event.nativeEvent.layout.height)}
            style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}
          >
            <View style={styles.header}>
              <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
                Đăng nhập để tiếp tục
              </Text>
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
              <AuthPanel />
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: OUTER_PADDING },
  backdrop: { backgroundColor: 'rgba(10, 20, 14, 0.55)' },
  shifter: { width: '100%' },
  sheet: {
    flexShrink: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 28,
    paddingBottom: 16,
  },
  // Tiêu đề căn giữa cả bề ngang tấm thẻ nên nút đóng phải nằm ngoài luồng, nếu không
  // nó sẽ đẩy tiêu đề lệch sang trái.
  header: { justifyContent: 'center', paddingHorizontal: 56, paddingTop: 20, paddingBottom: 4 },
  title: { fontSize: 20, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  scroll: { flexGrow: 0 },
});
