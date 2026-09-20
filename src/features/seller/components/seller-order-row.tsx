import { StyleSheet, Text, View } from 'react-native';

import { HomeIcon } from '@/features/home/components/home-icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import type { SellerOrder } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

// Một đơn trong danh sách "Đơn hàng đến": mã lấy hàng là thứ người bán đối chiếu với khách.
export function SellerOrderRow({ order }: { order: SellerOrder }) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
        <HomeIcon name={SellerIcons.bag} color={theme.primary} size={16} />
      </View>

      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
          {order.itemName} × {order.quantity}
        </Text>
        <Text numberOfLines={1} style={[styles.meta, { color: theme.textSecondary }]}>
          {order.customerName} · {order.pickupLabel}
        </Text>
      </View>

      <View style={styles.trailing}>
        <Text style={[styles.code, { color: theme.primary }]}>{order.code}</Text>
        <Text style={[styles.total, { color: theme.textSecondary }]}>
          {formatPrice(order.total)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
  },
  icon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '800' },
  meta: { fontSize: 12, fontWeight: '600' },
  trailing: { alignItems: 'flex-end', gap: 2 },
  code: { fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  total: { fontSize: 12, fontWeight: '700' },
});
