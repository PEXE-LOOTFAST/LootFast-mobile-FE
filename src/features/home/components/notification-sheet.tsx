import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeIcon } from '@/features/home/components/home-icon';
import { HomeIcons } from '@/features/home/constants/icons';
import type { AppNotification } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';

type NotificationSheetProps = {
  visible: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onPressItem: (id: string) => void;
};

export function NotificationSheet({
  visible,
  notifications,
  onClose,
  onPressItem,
}: NotificationSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Đóng thông báo"
          accessibilityRole="button"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        <Animated.View
          entering={SlideInDown.duration(260)}
          style={[
            styles.sheet,
            { backgroundColor: theme.backgroundElement, paddingBottom: insets.bottom + 8 },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
              Thông báo
            </Text>
            <Pressable
              accessibilityLabel="Đóng thông báo"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
            >
              <HomeIcon name={HomeIcons.close} color={theme.text} size={22} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {notifications.map((item, index) => (
              <Pressable
                key={item.id}
                accessibilityLabel={`${item.isRead ? '' : 'Chưa đọc. '}${item.title}. ${item.body}`}
                accessibilityRole="button"
                onPress={() => onPressItem(item.id)}
                style={[
                  styles.item,
                  !item.isRead && { backgroundColor: theme.primarySoft },
                  index > 0 && { borderTopWidth: StyleSheet.hairlineWidth },
                  { borderTopColor: theme.border },
                ]}
              >
                <View style={styles.itemTitleRow}>
                  {item.isRead ? null : (
                    <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                  )}
                  <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                </View>
                <Text style={[styles.itemBody, { color: theme.textSecondary }]}>{item.body}</Text>
                <Text style={[styles.itemTime, { color: theme.textSecondary }]}>
                  {item.timeLabel}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(10, 20, 14, 0.45)' },
  sheet: {
    flexShrink: 1,
    width: '100%',
    maxWidth: 520,
    maxHeight: '82%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, marginTop: 10, borderRadius: 3 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: { fontSize: 18, fontWeight: '800' },
  list: { flexGrow: 0 },
  item: { gap: 3, paddingHorizontal: 20, paddingVertical: 14 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  itemTitle: { flexShrink: 1, fontSize: 15, fontWeight: '700' },
  itemBody: { fontSize: 13, lineHeight: 19 },
  itemTime: { marginTop: 2, fontSize: 11 },
});
