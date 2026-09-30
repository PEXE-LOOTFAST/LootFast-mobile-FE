import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import type { PopoverAnchor } from '@/components/ui/popover';
import { HomeIcons } from '@/features/home/constants/icons';
import type { ChatMessage } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';

const PANEL_MAX_WIDTH = 320;
const PANEL_MAX_HEIGHT = 440;
const PANEL_GAP = 12;

type AssistantPanelProps = {
  /** Vị trí nút trợ lý nổi; panel mở ngay phía trên nút. `null` = đang đóng. */
  anchor: PopoverAnchor | null;
  messages: ChatMessage[];
  isReplying: boolean;
  /** false khi backend chưa có API trợ lý: ẩn ô nhập thay vì để người dùng gõ vào hư không. */
  isAvailable: boolean;
  onSend: (text: string) => void;
  onReset: () => void;
  onClose: () => void;
};

export function AssistantPanel({
  anchor,
  messages,
  isReplying,
  isAvailable,
  onSend,
  onReset,
  onClose,
}: AssistantPanelProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');

  const canSend = isAvailable && draft.trim().length > 0 && !isReplying;

  const handleSend = () => {
    if (!canSend) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={anchor !== null}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}
      >
        <Pressable
          accessibilityLabel="Đóng trợ lý"
          accessibilityRole="button"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        {anchor ? (
          <>
            <View
              style={[
                styles.panel,
                {
                  right: dimensions.width - anchor.x - anchor.width,
                  bottom: dimensions.height - anchor.y + PANEL_GAP,
                  width: Math.min(PANEL_MAX_WIDTH, dimensions.width - 32),
                  height: Math.min(PANEL_MAX_HEIGHT, anchor.y - insets.top - PANEL_GAP * 2),
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Icon name={HomeIcons.sparkles} color="#FFFFFF" size={18} />
                <Text accessibilityRole="header" style={styles.headerTitle}>
                  Trợ lý LootFast
                </Text>
                <Pressable
                  accessibilityLabel="Bắt đầu cuộc trò chuyện mới"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={onReset}
                >
                  <Icon name={HomeIcons.refresh} color="#FFFFFF" size={20} />
                </Pressable>
                <Pressable
                  accessibilityLabel="Đóng trợ lý"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={onClose}
                >
                  <Icon name={HomeIcons.close} color="#FFFFFF" size={22} />
                </Pressable>
              </View>

              <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.messages}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                style={styles.fill}
              >
                {messages.map((message) => {
                  const isUser = message.role === 'user';

                  return (
                    <View
                      key={message.id}
                      style={[
                        styles.bubble,
                        isUser ? styles.userBubble : styles.assistantBubble,
                        { backgroundColor: isUser ? theme.primary : theme.primarySoft },
                      ]}
                    >
                      <Text style={[styles.bubbleText, { color: isUser ? '#FFFFFF' : theme.text }]}>
                        {message.text}
                      </Text>
                    </View>
                  );
                })}

                {isReplying ? (
                  <View
                    style={[
                      styles.bubble,
                      styles.assistantBubble,
                      { backgroundColor: theme.primarySoft },
                    ]}
                  >
                    <Text style={[styles.typing, { color: theme.textSecondary }]}>
                      Đang trả lời…
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

              {isAvailable ? (
                <View style={[styles.inputRow, { borderTopColor: theme.border }]}>
                  <TextInput
                    accessibilityLabel="Câu hỏi cho trợ lý"
                    onChangeText={setDraft}
                    onSubmitEditing={handleSend}
                    placeholder="Hỏi về deal hoặc đơn hàng..."
                    placeholderTextColor={theme.textSecondary}
                    returnKeyType="send"
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    value={draft}
                  />
                  <Pressable
                    accessibilityLabel="Gửi câu hỏi"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !canSend }}
                    disabled={!canSend}
                    onPress={handleSend}
                    style={[
                      styles.send,
                      { backgroundColor: theme.primary },
                      !canSend && styles.disabled,
                    ]}
                  >
                    <Icon name={HomeIcons.send} color="#FFFFFF" size={18} />
                  </Pressable>
                </View>
              ) : null}
            </View>

            {/* Nút nổi hoá thành nút đóng, nằm đúng vị trí nút gốc bên dưới lớp Modal. */}
            <Pressable
              accessibilityLabel="Đóng trợ lý"
              accessibilityRole="button"
              onPress={onClose}
              style={[
                styles.closeFab,
                {
                  left: anchor.x,
                  top: anchor.y,
                  width: anchor.width,
                  height: anchor.height,
                  borderRadius: anchor.width / 2,
                  backgroundColor: theme.primary,
                },
              ]}
            >
              <Icon name={HomeIcons.close} color="#FFFFFF" size={26} />
            </Pressable>
          </>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  panel: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 20,
    boxShadow: '0px 18px 40px rgba(23, 33, 27, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  messages: { gap: 8, padding: 12 },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 9 },
  assistantBubble: { alignSelf: 'flex-start', borderTopLeftRadius: 4 },
  userBubble: { alignSelf: 'flex-end', borderTopRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  typing: { fontSize: 13, fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 13,
    outlineWidth: 0,
  },
  send: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  disabled: { opacity: 0.5 },
  closeFab: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 10px 24px rgba(22, 121, 75, 0.35)',
  },
});
