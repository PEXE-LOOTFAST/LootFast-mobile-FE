import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import {
  filterByRole,
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  type NotificationDto,
} from '@/api/notifications';
import { HomeIcons } from '@/features/home/constants/icons';
import { useTheme } from '@/hooks/use-theme';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

type NotificationSheetProps = {
  visible: boolean;
  onClose: () => void;
  role?: 'buyer' | 'seller';
};

export function NotificationSheet({ visible, onClose, role = 'buyer' }: NotificationSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const items = filterByRole(data?.items ?? [], role);
  const hasUnread = items.some((n) => !n.read);

  const handlePress = (item: NotificationDto) => {
    if (!item.read) markRead.mutate(item.notificationId);

    onClose();

    if (item.type === 'MATCHING_DEAL' && item.dealId) {
      router.push(`/deal/${item.dealId}`);
    } else if (item.orderId) {
      if (role === 'seller') {
        router.navigate('/seller/orders');
      } else {
        router.push(`/order/${item.orderId}`);
      }
    }
  };

  const renderItem = ({ item, index }: { item: NotificationDto; index: number }) => (
    <Pressable
      accessibilityLabel={`${item.read ? '' : 'Chưa đọc. '}${item.title}. ${item.message}`}
      accessibilityRole="button"
      onPress={() => handlePress(item)}
      style={({ pressed }) => [
        styles.item,
        !item.read && { backgroundColor: theme.primarySoft },
        index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
        pressed && styles.itemPressed,
      ]}
    >
      <View style={styles.itemRow}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={[styles.thumb, { backgroundColor: theme.border }]}
          />
        ) : null}
        <View style={styles.itemContent}>
          <View style={styles.itemTitleRow}>
            <View style={styles.itemTitleLeft}>
              {item.read ? null : <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
              <Text numberOfLines={1} style={[styles.itemTitle, { color: theme.text }]}>
                {item.title}
              </Text>
            </View>
            <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <Text numberOfLines={2} style={[styles.itemBody, { color: theme.textSecondary }]}>
            {item.message}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Modal
      animationType="slide"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      visible={visible}
    >
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <View
          style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: theme.border }]}
        >
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
            style={styles.headerButton}
          >
            <Icon name={HomeIcons.back} color={theme.text} size={22} />
          </Pressable>

          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            Thông báo
          </Text>

          {hasUnread ? (
            <Pressable
              accessibilityLabel="Đánh dấu tất cả đã đọc"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => markAllRead.mutate()}
              style={styles.headerButton}
            >
              <Icon name={HomeIcons.doneAll} color={theme.text} size={22} />
            </Pressable>
          ) : (
            <View style={styles.headerButton} />
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.notificationId}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: theme.textSecondary }]}>
                Chưa có thông báo nào.
              </Text>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '800' },
  loader: { marginTop: 40 },
  empty: { fontSize: 14, lineHeight: 20, padding: 32, textAlign: 'center' },
  item: { paddingHorizontal: 16, paddingVertical: 14 },
  itemPressed: { opacity: 0.7 },
  itemRow: { flexDirection: 'row', gap: 12 },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  itemContent: { flex: 1, gap: 4 },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemTitleLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  itemTitle: { flex: 1, fontSize: 15, fontWeight: '700' },
  itemDate: { fontSize: 13 },
  itemBody: { fontSize: 13, lineHeight: 19 },
});
