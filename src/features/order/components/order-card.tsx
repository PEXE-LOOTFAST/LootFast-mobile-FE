import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { ORDER_STATUS_LABELS } from '@/features/order/constants/order-status';
import type { Order } from '@/features/order/types';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type OrderCardProps = {
  order: Order;
  onPressCode?: () => void;
};

export function OrderCard({ order, onPressCode }: OrderCardProps) {
  const theme = useTheme();
  const canPickUp = order.status === 'confirmed' || order.status === 'ready';

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.header}>
        <View style={[styles.storeIcon, { backgroundColor: theme.primarySoft }]}>
          <Text style={styles.storeEmoji}>{order.emoji}</Text>
        </View>
        <View style={styles.storeCopy}>
          <Text numberOfLines={1} style={[styles.storeName, { color: theme.text }]}>
            {order.storeName}
          </Text>
          <Text style={[styles.orderCode, { color: theme.textSecondary }]}>{order.code}</Text>
        </View>
        <View style={[styles.status, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.statusText, { color: theme.primary }]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.pickupRow}>
        <View style={[styles.timelineDot, { backgroundColor: theme.accent }]} />
        <View style={styles.pickupCopy}>
          <Text style={[styles.pickupLabel, { color: theme.textSecondary }]}>NHẬN MÓN TRƯỚC</Text>
          <Text style={[styles.pickupTime, { color: theme.text }]}>{order.pickupLabel}</Text>
          <Text style={[styles.address, { color: theme.textSecondary }]}>{order.storeAddress}</Text>
        </View>
      </View>

      <View style={[styles.summary, { backgroundColor: theme.background }]}>
        <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
          {order.quantity} × {order.itemName}
        </Text>
        <Text style={[styles.total, { color: theme.primary }]}>
          {formatPrice(order.price * order.quantity)}
        </Text>
      </View>

      {canPickUp ? <BrandButton onPress={onPressCode}>Xem mã nhận món</BrandButton> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 22, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center' },
  storeIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  storeEmoji: { fontSize: 23 },
  storeCopy: { flex: 1, gap: 3, marginHorizontal: 12 },
  storeName: { fontSize: 15, fontWeight: '800' },
  orderCode: { fontSize: 11 },
  status: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  divider: { height: 1, marginVertical: 16 },
  pickupRow: { flexDirection: 'row', gap: 12 },
  timelineDot: { width: 12, height: 12, marginTop: 4, borderRadius: 6 },
  pickupCopy: { flex: 1, gap: 4 },
  pickupLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  pickupTime: { fontSize: 19, fontWeight: '900' },
  address: { fontSize: 12 },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    borderRadius: 13,
    padding: 12,
  },
  summaryText: { flexShrink: 1, fontSize: 12 },
  total: { fontSize: 13, fontWeight: '900' },
});
