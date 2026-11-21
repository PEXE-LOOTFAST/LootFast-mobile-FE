import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import type { ManagedAccount } from '@/features/admin/types';
import { useTheme } from '@/hooks/use-theme';

const KIND_LABELS: Record<ManagedAccount['kind'], string> = {
  store: 'Quán',
  user: 'Người dùng',
};

type ManagedAccountRowProps = {
  account: ManagedAccount;
  onPress: () => void;
};

// Một dòng trong danh sách Quản lý: chữ cái đầu, tên, loại tài khoản và nhãn trạng thái.
export function ManagedAccountRow({ account, onPress }: ManagedAccountRowProps) {
  const theme = useTheme();
  const isLocked = account.status === 'locked';
  const statusColor = isLocked ? theme.danger : theme.primary;

  return (
    <Pressable
      accessibilityHint="Xem chi tiết tài khoản"
      accessibilityLabel={`${account.name}, ${KIND_LABELS[account.kind]}, ${isLocked ? 'đã khóa' : 'đang hoạt động'}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.background }]}
    >
      <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
        <Text style={[styles.initial, { color: theme.primary }]}>
          {account.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
          {account.name}
        </Text>
        <Text numberOfLines={1} style={[styles.detail, { color: theme.textSecondary }]}>
          {KIND_LABELS[account.kind]} · {account.detail}
        </Text>
      </View>

      <View
        style={[
          styles.badge,
          { backgroundColor: isLocked ? `${theme.danger}1F` : theme.primarySoft },
        ]}
      >
        <Text style={[styles.badgeLabel, { color: statusColor }]}>
          {isLocked ? 'Đã khóa' : 'Đang hoạt động'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: Spacing.lg,
  },
  avatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  initial: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  copy: { flex: 1, gap: 3 },
  name: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  detail: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  badge: { borderRadius: Radius.full, paddingHorizontal: 11, paddingVertical: 6 },
  badgeLabel: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
});
