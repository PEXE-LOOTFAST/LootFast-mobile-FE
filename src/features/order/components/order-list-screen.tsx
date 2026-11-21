import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyCard } from '@/components/ui/empty-card';
import { QueryListEmpty } from '@/components/ui/query-boundary';
import { ScreenList } from '@/components/ui/screen';
import { ScreenGutter, Spacing } from '@/constants/theme';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import {
  type OrderDto,
  type OrderListStatusDto,
  toOrderErrorMessage,
} from '@/features/order/api/orders';
import { useOrders } from '@/features/order/api/use-orders';
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
  const [status, setStatus] = useState<OrderListStatusDto>('RESERVED');
  const ordersQuery = useOrders(status);
  const orders = ordersQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const loadMore = () => {
    if (ordersQuery.hasNextPage && !ordersQuery.isFetchingNextPage) {
      void ordersQuery.fetchNextPage();
    }
  };

  return (
    <ScreenList
      data={orders}
      empty={
        <QueryListEmpty
          empty={
            <EmptyCard
              description={`Bạn chưa có đơn nào ở trạng thái “${STATUS_LABELS[status]}”.`}
              title="Chưa có đơn hàng"
            />
          }
          errorMessage={toOrderErrorMessage}
          loadingLabel="Đang tải danh sách đơn..."
          query={ordersQuery}
        />
      }
      gap="lg"
      header={<BuyerHeader subtitle="Theo dõi đơn và thời gian nhận món" title="Đơn hàng" />}
      keyExtractor={(order) => order.orderId}
      listHeader={
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {STATUS_TABS.map((tab) => (
            <Chip
              key={tab.value}
              label={tab.label}
              onPress={() => setStatus(tab.value)}
              role="tab"
              selected={tab.value === status}
              size="md"
            />
          ))}
        </ScrollView>
      }
      loadingMore={ordersQuery.isFetchingNextPage}
      onEndReached={loadMore}
      onRefresh={() => void ordersQuery.refetch()}
      refreshing={ordersQuery.isRefetching && !ordersQuery.isFetchingNextPage}
      renderItem={(order) => <OrderCard order={order} statusLabel={STATUS_LABELS[status]} />}
    />
  );
}

function OrderCard({ order, statusLabel }: { order: OrderDto; statusLabel: string }) {
  return (
    <Card
      accessibilityLabel={`Mở đơn ${order.orderId}`}
      gap="sm"
      onPress={() => router.push(`/order/${order.orderId}`)}
    >
      <View style={styles.cardHeader}>
        <AppText numberOfLines={1} style={styles.dealName} variant="subtitle" weight="bold">
          {order.dealName}
        </AppText>
        <AppText tone="primary" variant="footnote" weight="bold">
          {statusLabel}
        </AppText>
      </View>
      <AppText tone="textSecondary" variant="caption">
        Mã đơn: {order.orderId}
      </AppText>
      <AppText tone="textSecondary" variant="bodySm">
        Hẹn lấy: {formatTime(order.pickupFrom)}–{formatTime(order.pickupTo)}
      </AppText>
      <View style={styles.totalRow}>
        <AppText tone="textSecondary" variant="bodySm">
          {order.quantity} phần
        </AppText>
        <AppText tone="primary" variant="bodyLg" weight="heavy">
          {formatPrice(order.totalAmount)}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tabs: { gap: Spacing.sm, paddingRight: ScreenGutter },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dealName: { flex: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
