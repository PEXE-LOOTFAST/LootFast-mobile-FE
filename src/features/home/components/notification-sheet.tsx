import { router } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import {
  MATCH_REASON_LABELS,
  NOTIFICATION_TYPE_LABELS,
  useHiddenNotifications,
  useMarkAllRead,
  useMarkRead,
  useNotificationRole,
  useNotifications,
  type NotificationDto,
} from '@/api/notifications';
import { HomeIcons } from '@/features/home/constants/icons';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import { formatDayLabel, formatTimeOfDay } from '@/lib/format';

const ROLE_ICONS = {
  buyer: { ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' } as const,
  seller: { ios: 'storefront', android: 'storefront', web: 'storefront' } as const,
};

const ROLE_LABELS = {
  buyer: 'Mua',
  seller: 'Bán',
};

const UNKNOWN_TIME_LABEL = 'Không rõ thời gian';

const DELETE_NOTE = 'Thông báo chỉ bị xoá khỏi thiết bị này, các thiết bị khác không bị ảnh hưởng.';

type NotificationSection = { title: string; data: NotificationDto[] };

/** Gom thông báo (đã sắp mới nhất trước) theo ngày để người dùng thấy ngay thông báo xảy ra hôm nào. */
function groupByDay(items: NotificationDto[]): NotificationSection[] {
  const sections: NotificationSection[] = [];

  for (const item of items) {
    const date = new Date(item.createdAt);
    const title = Number.isNaN(date.getTime()) ? UNKNOWN_TIME_LABEL : formatDayLabel(date);
    const last = sections[sections.length - 1];

    if (last && last.title === title) last.data.push(item);
    else sections.push({ title, data: [item] });
  }

  return sections;
}

type NotificationSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function NotificationSheet({ visible, onClose }: NotificationSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const { hiddenIds, hide } = useHiddenNotifications();
  const getRole = useNotificationRole();
  const { user } = useAuthSession();
  // Tài khoản chỉ là người mua thì mọi thông báo đều của người mua, nhãn Mua/Bán chỉ gây rối.
  const showRoleBadge = user?.roles.includes('MERCHANT') ?? false;

  const items = (data?.items ?? []).filter((item) => !hiddenIds.has(item.notificationId));
  const sections = groupByDay(items);
  const hasUnread = items.some((n) => !n.read);

  const handlePress = (item: NotificationDto) => {
    if (!item.read) markRead.mutate(item.notificationId);

    onClose();

    const role = getRole(item);

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

  const deleteOne = (item: NotificationDto) =>
    confirmAction({
      title: 'Xoá thông báo',
      message: `${item.title}\n\n${DELETE_NOTE}`,
      confirmLabel: 'Xoá',
      isDestructive: true,
      onConfirm: () => {
        // Thông báo chưa đọc bị xoá phải được đánh dấu đã đọc để số trên chuông không còn đếm nó.
        if (!item.read) markRead.mutate(item.notificationId);
        hide([item.notificationId]);
      },
    });

  const deleteAll = () =>
    confirmAction({
      title: 'Xoá tất cả thông báo',
      message: `Xoá ${items.length} thông báo đang hiển thị? ${DELETE_NOTE}`,
      confirmLabel: 'Xoá tất cả',
      isDestructive: true,
      onConfirm: () => {
        if (hasUnread) markAllRead.mutate();
        hide(items.map((item) => item.notificationId));
      },
    });

  const renderItem = ({ item, index }: { item: NotificationDto; index: number }) => {
    const role = getRole(item);
    const badgeColor = role === 'seller' ? theme.accent : theme.primary;
    const badgeBg = role === 'seller' ? `${theme.accent}20` : theme.primarySoft;
    const date = new Date(item.createdAt);
    const time = Number.isNaN(date.getTime()) ? '' : formatTimeOfDay(date);
    const typeLabel = NOTIFICATION_TYPE_LABELS[item.type];
    const reason =
      item.type === 'MATCHING_DEAL' && item.matchReason
        ? MATCH_REASON_LABELS[item.matchReason]
        : undefined;

    return (
      <Pressable
        accessibilityLabel={`${item.read ? '' : 'Chưa đọc. '}${showRoleBadge ? `${ROLE_LABELS[role]}. ` : ''}${item.title}. ${item.message}${time ? `. Lúc ${time}` : ''}`}
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
          ) : (
            <View style={[styles.thumbPlaceholder, { backgroundColor: badgeBg }]}>
              <Icon name={ROLE_ICONS[role]} color={badgeColor} size={22} />
            </View>
          )}
          <View style={styles.itemContent}>
            <View style={styles.itemTitleRow}>
              <View style={styles.itemTitleLeft}>
                {item.read ? null : (
                  <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                )}
                <Text numberOfLines={2} style={[styles.itemTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
              </View>
              {showRoleBadge ? (
                <View style={[styles.roleBadge, { backgroundColor: badgeBg }]}>
                  <Icon name={ROLE_ICONS[role]} color={badgeColor} size={11} />
                  <Text style={[styles.roleLabel, { color: badgeColor }]}>{ROLE_LABELS[role]}</Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.itemBody, { color: theme.textSecondary }]}>{item.message}</Text>

            {reason ? (
              <Text style={[styles.itemReason, { color: theme.primary }]}>{reason}</Text>
            ) : null}

            {/* Nhận món xong là lúc dễ nhớ nhất để chấm sao; chạm thông báo mở đơn, thẻ đánh giá nằm đầu trang. */}
            {item.type === 'ORDER_COMPLETED' && role === 'buyer' ? (
              <View style={styles.reviewCta}>
                <Icon name={HomeIcons.star} color={theme.primary} size={14} />
                <Text style={[styles.itemReason, { color: theme.primary }]}>
                  Chấm sao cho đơn này
                </Text>
              </View>
            ) : null}

            <View style={styles.metaRow}>
              <Text style={[styles.itemDate, { color: theme.textSecondary }]}>
                {[typeLabel, time].filter(Boolean).join(' · ')}
              </Text>

              <Pressable
                accessibilityLabel={`Xoá thông báo ${item.title}`}
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => deleteOne(item)}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.itemPressed]}
              >
                <Icon name={HomeIcons.trash} color={theme.textSecondary} size={17} />
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

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
          <View style={styles.headerSide}>
            <Pressable
              accessibilityLabel="Quay lại"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={styles.headerButton}
            >
              <Icon name={HomeIcons.back} color={theme.text} size={22} />
            </Pressable>
          </View>

          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            Thông báo
          </Text>

          <View style={[styles.headerSide, styles.headerSideEnd]}>
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
            ) : null}
            {items.length > 0 ? (
              <Pressable
                accessibilityLabel="Xoá tất cả thông báo"
                accessibilityRole="button"
                hitSlop={8}
                onPress={deleteAll}
                style={styles.headerButton}
              >
                <Icon name={HomeIcons.trash} color={theme.text} size={21} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={styles.loader} />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.notificationId}
            renderItem={renderItem}
            renderSectionHeader={({ section }) => (
              <View style={[styles.sectionHeader, { backgroundColor: theme.background }]}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  {section.title}
                </Text>
              </View>
            )}
            stickySectionHeadersEnabled={false}
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerSide: { width: 88, flexDirection: 'row', alignItems: 'center' },
  headerSideEnd: { justifyContent: 'flex-end' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.title, fontWeight: FontWeight.bold },
  loader: { marginTop: 40 },
  empty: { fontSize: FontSize.body, lineHeight: 20, padding: Spacing.xxxl, textAlign: 'center' },
  sectionHeader: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 6 },
  sectionTitle: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold, letterSpacing: 0.3 },
  item: { paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  itemPressed: { opacity: 0.7 },
  itemRow: { flexDirection: 'row', gap: Spacing.md },
  thumb: { width: 48, height: 48, borderRadius: Radius.md },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flex: 1, gap: Spacing.xs },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  itemTitleLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: Radius.full, marginTop: 6 },
  itemTitle: { flex: 1, fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
  },
  roleLabel: { fontSize: FontSize.micro, fontWeight: FontWeight.bold },
  itemBody: { fontSize: FontSize.bodySm, lineHeight: 19 },
  reviewCta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  itemReason: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemDate: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  deleteButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
