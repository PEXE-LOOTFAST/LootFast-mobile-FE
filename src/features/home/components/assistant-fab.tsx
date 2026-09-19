import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AssistantPanel } from '@/features/home/components/assistant-panel';
import { HomeIcon } from '@/features/home/components/home-icon';
import { HomeIcons } from '@/features/home/constants/icons';
import { useAssistantChat } from '@/features/home/hooks/use-assistant-chat';
import { useAnchor } from '@/hooks/use-anchor';
import { useTheme } from '@/hooks/use-theme';

type AssistantFabProps = {
  /** Khoảng cách tới đáy màn, tăng lên khi màn có thanh cố định ở đáy (vd. thanh đặt giữ). */
  bottomOffset?: number;
};

export function AssistantFab({ bottomOffset = 16 }: AssistantFabProps) {
  const theme = useTheme();
  const chat = useAssistantChat();
  const { ref, anchor, open, close } = useAnchor();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Thu gọn thành tab nhỏ sát mép phải để nút không che nội dung khi người dùng đang xem.
  if (isCollapsed) {
    return (
      <Pressable
        accessibilityLabel="Hiện trợ lý LootFast"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => setIsCollapsed(false)}
        style={[styles.handle, { bottom: bottomOffset + 2, backgroundColor: theme.primary }]}
      >
        <HomeIcon name={HomeIcons.chevronLeft} color="#FFFFFF" size={20} />
      </Pressable>
    );
  }

  return (
    <>
      <View style={[styles.dock, { bottom: bottomOffset }]}>
        <Pressable
          accessibilityLabel="Thu gọn trợ lý"
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => setIsCollapsed(true)}
          style={[
            styles.collapse,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <HomeIcon name={HomeIcons.chevronRight} color={theme.text} size={18} />
        </Pressable>

        <Pressable
          ref={ref}
          accessibilityLabel="Mở trợ lý LootFast"
          accessibilityRole="button"
          onPress={open}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
          ]}
        >
          <HomeIcon name={HomeIcons.chat} color="#FFFFFF" size={26} />
        </Pressable>
      </View>

      <AssistantPanel
        anchor={anchor}
        isReplying={chat.isReplying}
        messages={chat.messages}
        onClose={close}
        onReset={chat.reset}
        onSend={chat.send}
      />
    </>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    pointerEvents: 'box-none',
  },
  collapse: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    boxShadow: '0px 4px 12px rgba(23, 33, 27, 0.12)',
  },
  fab: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    boxShadow: '0px 10px 24px rgba(22, 121, 75, 0.35)',
  },
  pressed: { transform: [{ scale: 0.95 }] },
  handle: {
    position: 'absolute',
    right: 0,
    width: 30,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
    boxShadow: '0px 6px 16px rgba(22, 121, 75, 0.3)',
  },
});
