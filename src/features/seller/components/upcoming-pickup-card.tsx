import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeIcon } from '@/features/home/components/home-icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import type { SellerOrder } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';

type UpcomingPickupCardProps = {
  orders: SellerOrder[];
  pendingConfirmCount: number;
  onPressSeeAll: () => void;
};

export function UpcomingPickupCard({
  orders,
  pendingConfirmCount,
  onPressSeeAll,
}: UpcomingPickupCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            Đơn sắp đến lấy
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {pendingConfirmCount} đơn chờ xác nhận
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Xem tất cả đơn hàng"
          accessibilityRole="button"
          onPress={onPressSeeAll}
          style={({ pressed }) => [
            styles.seeAll,
            { borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.seeAllLabel, { color: theme.text }]}>Xem tất cả</Text>
        </Pressable>
      </View>

      {orders.length > 0 ? (
        <View style={styles.list}>
          {orders.map((order) => (
            <Pressable
              key={order.id}
              accessibilityLabel={`Đơn ${order.code}`}
              accessibilityRole="button"
              onPress={onPressSeeAll}
              style={({ pressed }) => [
                styles.row,
                { borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.rowIcon, { backgroundColor: theme.primarySoft }]}>
                <HomeIcon name={SellerIcons.bag} color={theme.primary} size={16} />
              </View>
              <View style={styles.rowCopy}>
                <Text numberOfLines={1} style={[styles.rowTitle, { color: theme.text }]}>
                  {order.itemName} × {order.quantity}
                </Text>
                <Text numberOfLines={1} style={[styles.rowMeta, { color: theme.textSecondary }]}>
                  {order.code} · {order.pickupLabel}
                </Text>
              </View>
              <HomeIcon name={SellerIcons.chevronRight} color={theme.textSecondary} size={15} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={[styles.empty, { color: theme.textSecondary }]}>Không có đơn chờ lấy</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, borderWidth: 1, borderRadius: 20, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '600' },
  seeAll: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  seeAllLabel: { fontSize: 12, fontWeight: '800' },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
  },
  rowIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 14, fontWeight: '800' },
  rowMeta: { fontSize: 12, fontWeight: '600' },
  empty: { paddingVertical: 24, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: 0.85 },
});
