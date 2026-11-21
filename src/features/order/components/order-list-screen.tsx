import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { Chip } from '@/components/ui/chip';
import { EmptyCard } from '@/components/ui/empty-card';
import { QueryBoundary } from '@/components/ui/query-boundary';
import { Screen } from '@/components/ui/screen';
import { ScreenGutter, Spacing } from '@/constants/theme';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import { type OrderListStatusDto, toOrderErrorMessage } from '@/features/order/api/orders';
import { useOrders } from '@/features/order/api/use-orders';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice, formatTime } from '@/lib/format';

const STATUS_TABS: { value: OrderListStatusDto; label: string }[] = [
  { value: 'RESERVED', label: 'Đang giữ' },
  { value: 'COMPLETED', label: 'Hoàn tất' },
  { value: 'CANCELLED', label: 'Đã huỷ' },
  { value: 'NO_SHOW', label: 'Không đến lấy' },
];

const STATUS_LABELS: Record<OrderListStatusDto, string> = Object.fromEntries(
  STATUS_TABS.map((tab) => [tab.value, tab.label]),
) as Record<OrderListStatusDto, string>;

export function OrderListScreen() {
  const theme = useTheme();
  const [status, setStatus] = useState<OrderListStatusDto>('RESERVED');
  const [page, setPage] = useState(0);
  const ordersQuery = useOrders(status, page);

  return (
    <Screen
      gap="lg"
      header={<BuyerHeader subtitle="Theo dõi đơn và thời gian nhận món" title="Đơn hàng" />}
      onRefresh={() => void ordersQuery.refetch()}
      refreshing={ordersQuery.isRefetching}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {STATUS_TABS.map((tab) => {
          const active = tab.value === status;
          return (
            <Chip
              key={tab.value}
              label={tab.label}
              onPress={() => {
                setStatus(tab.value);
                setPage(0);
              }}
              role="tab"
              selected={active}
              size="md"
            />
          );
        })}
      </ScrollView>

      <QueryBoundary
        empty={
          <EmptyCard
            description={`Bạn chưa có đơn nào ở trạng thái “${STATUS_LABELS[status]}”.`}
            title="Chưa có đơn hàng"
          />
        }
        errorMessage={toOrderErrorMessage}
        isEmpty={(data) => data.items.length === 0}
        loadingLabel="Đang tải danh sách đơn..."
        query={ordersQuery}
      >
        {(data) => (
          <>
            {data.items.map((order) => (
              <Pressable
                key={order.orderId}
                accessibilityLabel={`Mở đơn ${order.orderId}`}
                accessibilityRole="button"
                onPress={() => router.push(`/order/${order.orderId}`)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text numberOfLines={1} style={[styles.dealName, { color: theme.text }]}>
                    {order.dealName}
                  </Text>
                  <Text style={[styles.status, { color: theme.primary }]}>
                    {STATUS_LABELS[status]}
                  </Text>
                </View>
                <Text style={[styles.orderId, { color: theme.textSecondary }]}>
                  Mã đơn: {order.orderId}
                </Text>
                <Text style={[styles.pickup, { color: theme.textSecondary }]}>
                  Hẹn lấy: {formatTime(order.pickupFrom)}–{formatTime(order.pickupTo)}
                </Text>
                <View style={styles.totalRow}>
                  <Text style={[styles.quantity, { color: theme.textSecondary }]}>
                    {order.quantity} phần
                  </Text>
                  <Text style={[styles.total, { color: theme.primary }]}>
                    {formatPrice(order.totalAmount)}
                  </Text>
                </View>
              </Pressable>
            ))}

            {data.totalPages > 1 ? (
              <View style={styles.pagination}>
                <BrandButton
                  disabled={page === 0}
                  onPress={() => setPage((current) => Math.max(current - 1, 0))}
                  variant="outline"
                >
                  Trang trước
                </BrandButton>
                <Text style={[styles.pageLabel, { color: theme.textSecondary }]}>
                  Trang {data.page + 1}/{data.totalPages}
                </Text>
                <BrandButton
                  disabled={page >= data.totalPages - 1}
                  onPress={() => setPage((current) => Math.min(current + 1, data.totalPages - 1))}
                  variant="outline"
                >
                  Trang sau
                </BrandButton>
              </View>
            ) : null}
          </>
        )}
      </QueryBoundary>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { gap: Spacing.sm, paddingRight: ScreenGutter },
  card: { gap: 8, borderWidth: 1, borderRadius: 18, padding: 16 },
  pressed: { opacity: 0.8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dealName: { flex: 1, fontSize: 16, fontWeight: '800' },
  status: { fontSize: 12, fontWeight: '800' },
  orderId: { fontSize: 11 },
  pickup: { fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantity: { fontSize: 13 },
  total: { fontSize: 15, fontWeight: '900' },
  pagination: { alignItems: 'center', gap: 10 },
  pageLabel: { fontSize: 13, fontWeight: '700' },
});
