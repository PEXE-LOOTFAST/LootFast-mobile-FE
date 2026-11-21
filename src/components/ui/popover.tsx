import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type PopoverAnchor = { x: number; y: number; width: number; height: number };

type PopoverProps = {
  /** Vị trí phần tử neo (toạ độ cửa sổ). `null` = đang đóng. Lấy từ hook useAnchor. */
  anchor: PopoverAnchor | null;
  onClose: () => void;
  width: number;
  align?: 'left' | 'right';
  children: ReactNode;
};

const ANCHOR_GAP = Spacing.sm;
const SCREEN_EDGE = Spacing.md;

export function Popover({ anchor, onClose, width, align = 'left', children }: PopoverProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  const preferredLeft = anchor
    ? align === 'left'
      ? anchor.x
      : anchor.x + anchor.width - width
    : 0;
  const left = Math.min(Math.max(preferredLeft, SCREEN_EDGE), screenWidth - width - SCREEN_EDGE);

  // Modal trong suốt thay vì View absolute: menu phải nổi trên cả ScrollView, tab bar
  // và bắt được cú chạm ra ngoài để đóng.
  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={anchor !== null}
    >
      <Pressable
        accessibilityLabel="Đóng"
        accessibilityRole="button"
        onPress={onClose}
        style={StyleSheet.absoluteFill}
      />
      {anchor ? (
        <View
          style={[
            styles.card,
            {
              top: anchor.y + anchor.height + ANCHOR_GAP,
              left,
              width,
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}
        >
          {children}
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    boxShadow: Shadow.overlay,
  },
});
