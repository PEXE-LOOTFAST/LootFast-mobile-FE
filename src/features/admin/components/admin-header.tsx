import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { AdminIcons } from '@/features/admin/constants/icons';
import { HomeHeaderColors } from '@/features/home/constants/colors';
import { useTheme } from '@/hooks/use-theme';
import { formatFullDate } from '@/lib/format';

type AdminHeaderProps = {
  date: Date;
  hasUnread: boolean;
  onPressNotifications: () => void;
};

// Cùng kiểu header xanh đậm với khu người mua và người bán, thêm nhãn "Quản trị"
// để admin luôn biết mình đang ở khu vực có quyền cao.
export function AdminHeader({ date, hasUnread, onPressNotifications }: AdminHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.decorationLayer}>
        <View style={styles.decoration} />
      </View>

      <View style={styles.row}>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>
              LootFast Admin
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleLabel}>Quản trị</Text>
            </View>
          </View>
          <Text style={styles.date}>{formatFullDate(date)}</Text>
        </View>

        <Pressable
          accessibilityLabel={hasUnread ? 'Thông báo, có mục mới' : 'Thông báo'}
          accessibilityRole="button"
          hitSlop={4}
          onPress={onPressNotifications}
          style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}
        >
          <Icon name={AdminIcons.bell} color={HomeHeaderColors.text} size={20} />
          {hasUnread ? (
            <View
              style={[
                styles.unreadDot,
                { backgroundColor: theme.accent, borderColor: HomeHeaderColors.background },
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
    overflow: 'hidden',
    backgroundColor: HomeHeaderColors.background,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  decorationLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  decoration: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -40,
    right: -60,
    borderRadius: 100,
    backgroundColor: HomeHeaderColors.decoration,
    opacity: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: {
    flexShrink: 1,
    color: HomeHeaderColors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleLabel: { color: HomeHeaderColors.text, fontSize: 11, fontWeight: '800' },
  date: { color: HomeHeaderColors.textMuted, fontSize: 14, fontWeight: '600' },
  bellButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderRadius: 5,
  },
  pressed: { opacity: 0.8 },
});
