import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/ui/brand-button';
import type { ManagedAccount } from '@/features/admin/types';
import { useTheme } from '@/hooks/use-theme';

const KIND_LABELS: Record<ManagedAccount['kind'], string> = {
  store: 'Quán',
  user: 'Người dùng',
};

type AccountDetailDialogProps = {
  /** Tài khoản đang xem; null là hộp thoại đang đóng. */
  account: ManagedAccount | null;
  onClose: () => void;
  /** Bấm nút khoá / mở khoá; nơi dùng tự mở hộp thoại nhập lý do. */
  onToggleLock: (account: ManagedAccount) => void;
};

/** Chi tiết một tài khoản trong màn Quản lý, kèm lối vào khoá / mở khoá. */
export function AccountDetailDialog({ account, onClose, onToggleLock }: AccountDetailDialogProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isLocked = account?.status === 'locked';

  const rows: [string, string][] = account
    ? [
        ['Email', account.detail],
        ['Loại tài khoản', KIND_LABELS[account.kind]],
        ['Trạng thái', isLocked ? 'Đã khóa' : 'Đang hoạt động'],
        ...(isLocked && account.lockReason
          ? [['Lý do khoá', account.lockReason] as [string, string]]
          : []),
      ]
    : [];

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={account !== null}
    >
      <View
        style={[styles.overlay, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
      >
        <Pressable
          accessibilityLabel="Đóng"
          accessibilityRole="button"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            {account?.name}
          </Text>

          {rows.map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
              <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
            </View>
          ))}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.close,
                { backgroundColor: theme.background, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.closeLabel, { color: theme.text }]}>Đóng</Text>
            </Pressable>

            <View style={styles.toggle}>
              <BrandButton onPress={() => account && onToggleLock(account)}>
                {isLocked ? 'Mở khoá' : 'Khoá tài khoản'}
              </BrandButton>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  backdrop: { backgroundColor: 'rgba(10, 20, 14, 0.55)' },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 12,
    borderRadius: 24,
    padding: 22,
  },
  title: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  row: { gap: 2 },
  label: { fontSize: 12, fontWeight: '600' },
  value: { fontSize: 14, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  close: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
  },
  closeLabel: { fontSize: 14, fontWeight: '800' },
  toggle: { flex: 1 },
  pressed: { opacity: 0.85 },
});
