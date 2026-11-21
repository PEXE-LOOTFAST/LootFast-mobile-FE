import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { AdminIcons } from '@/features/admin/constants/icons';
import { useTheme } from '@/hooks/use-theme';
import { formatFullDate } from '@/lib/format';

type AdminHeaderProps = {
  date: Date;
  hasUnread: boolean;
  onPressNotifications: () => void;
};

// Cùng kiểu header với khu người mua và người bán, thêm nhãn "Quản trị" để admin luôn biết mình
// đang ở khu vực có quyền cao.
export function AdminHeader({ date, hasUnread, onPressNotifications }: AdminHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.background },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              style={[styles.title, { color: theme.text }]}
            >
              LootFast Admin
            </Text>
            <Badge label="Quản trị" size="sm" tone="primarySoft" />
          </View>
          <Text style={[styles.date, { color: theme.textSecondary }]}>{formatFullDate(date)}</Text>
        </View>

        <Pressable
          accessibilityLabel={hasUnread ? 'Thông báo, có mục mới' : 'Thông báo'}
          accessibilityRole="button"
          hitSlop={4}
          onPress={onPressNotifications}
          style={({ pressed }) => [
            styles.bellButton,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <Icon name={AdminIcons.bell} color={theme.text} size={20} />
          {hasUnread ? (
            <View
              style={[
                styles.unreadDot,
                { backgroundColor: theme.danger, borderColor: theme.backgroundElement },
              ]}
            />
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  copy: { flex: 1, gap: Spacing.xxs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: {
    flexShrink: 1,
    fontSize: FontSize.titleLg,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.3,
  },
  date: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  bellButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
  },
  unreadDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderRadius: Radius.full,
  },
  pressed: { opacity: 0.8 },
});
