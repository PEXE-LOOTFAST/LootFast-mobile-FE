import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { BrandButton } from '@/components/ui/brand-button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyCard } from '@/components/ui/empty-card';
import { QueryListEmpty } from '@/components/ui/query-boundary';
import { ScreenList } from '@/components/ui/screen';
import { Skeleton } from '@/components/ui/skeleton';
import { SlowLoadingHint } from '@/components/ui/slow-loading-hint';
import { ScreenGutter, Spacing } from '@/constants/theme';
import { Icon, type IconName } from '@/components/ui/icon';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import { HomeIcons } from '@/features/home/constants/icons';
import {
  type OrderDto,
  type OrderListStatusDto,
  toOrderErrorMessage,
} from '@/features/order/api/orders';
import { useOrders } from '@/features/order/api/use-orders';
import { getPickupTiming } from '@/features/order/pickup-timing';
import { useProfile } from '@/features/profile/api/use-profile';
import { useMyOrderReview } from '@/features/review/api/use-reviews';
import { StarRating } from '@/features/review/components/star-rating';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice, formatShortDate, formatTime } from '@/lib/format';

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
  // Đếm ngược tới giờ lấy chỉ cần cho tab "Đang giữ"; nửa phút một lần là đủ mượt.
  const now = useNow(30_000);

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
          loading={<OrderListSkeleton />}
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
      renderItem={(order) =>
        status === 'RESERVED' ? (
          <ActiveOrderCard now={now} order={order} />
        ) : (
          <OrderCard order={order} statusLabel={STATUS_LABELS[status]} />
        )
      }
    />
  );
}

const openOrder = (orderId: string) => router.push(`/order/${orderId}`);

function paymentLine(order: OrderDto) {
  const total = formatPrice(order.totalAmount);
  if (order.paymentMethod === 'CASH') return `Trả ${total} tiền mặt khi nhận`;
  if (order.paymentStatus === 'CONFIRMED') return `Đã chuyển khoản ${total}`;
  if (order.paymentStatus === 'REVIEW_REQUIRED') return `Quán đang kiểm tra khoản chuyển ${total}`;

  return `Cần chuyển khoản ${total} trước khi đến`;
}

/**
 * Đơn đang giữ là việc khách cần làm tiếp, nên thẻ nói rõ còn bao lâu tới giờ lấy, trả tiền thế
 * nào, và có nút mở thẳng mã nhận món để đưa quán quét.
 */
function ActiveOrderCard({ order, now }: { order: OrderDto; now: number }) {
  const timing = getPickupTiming(order, now);

  return (
    <Card elevated gap="md">
      <Badge label={timing.label} tone={timing.tone} />
      <AppText numberOfLines={2} variant="subtitle" weight="bold">
        {order.dealName}
      </AppText>
      <View style={styles.lines}>
        <InfoLine
          icon={HomeIcons.clock}
          label={`Hẹn lấy ${formatTime(order.pickupFrom)}–${formatTime(order.pickupTo)} · ${order.quantity} phần`}
        />
        <InfoLine icon={HomeIcons.cash} label={paymentLine(order)} />
      </View>
      <BrandButton onPress={() => openOrder(order.orderId)}>Mở mã nhận món</BrandButton>
    </Card>
  );
}

function InfoLine({ icon, label }: { icon: IconName; label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.infoLine}>
      <Icon name={icon} color={theme.textSecondary} size={16} />
      <AppText style={styles.infoText} variant="bodySm">
        {label}
      </AppText>
    </View>
  );
}

function OrderCard({ order, statusLabel }: { order: OrderDto; statusLabel: string }) {
  return (
    <Card
      accessibilityLabel={`${order.dealName}, ${statusLabel}, ${formatPrice(order.totalAmount)}`}
      gap="sm"
      onPress={() => openOrder(order.orderId)}
    >
      <View style={styles.cardHeader}>
        <AppText numberOfLines={1} style={styles.dealName} variant="subtitle" weight="bold">
          {order.dealName}
        </AppText>
        <AppText tone="textSecondary" variant="footnote" weight="bold">
          {statusLabel}
        </AppText>
      </View>
      <AppText tone="textSecondary" variant="bodySm">
        Đặt ngày {formatShortDate(new Date(order.createdAt))} · hẹn lấy{' '}
        {formatTime(order.pickupFrom)}–{formatTime(order.pickupTo)}
      </AppText>
      <View style={styles.totalRow}>
        <AppText tone="textSecondary" variant="bodySm">
          {order.quantity} phần
        </AppText>
        <AppText variant="bodyLg" weight="heavy">
          {formatPrice(order.totalAmount)}
        </AppText>
      </View>
      {order.orderStatus === 'COMPLETED' ? <ReviewLine order={order} /> : null}
    </Card>
  );
}

/**
 * Đơn đã nhận món: chưa đánh giá thì mời chấm sao, đã đánh giá thì hiện lại số sao đã cho. Cả thẻ
 * đã bấm được để mở đơn (thẻ đánh giá nằm đầu trang), nên sao ở đây chỉ để nhìn, không lồng nút.
 */
function ReviewLine({ order }: { order: OrderDto }) {
  const theme = useTheme();
  const profile = useProfile(true);
  const isOwnStore = profile.data?.publicId.toLowerCase() === order.storeId.toLowerCase();
  const review = useMyOrderReview(order.orderId, profile.isSuccess && !isOwnStore);

  if (!review.isSuccess) return null;

  if (review.data) {
    return (
      <View style={[styles.reviewLine, { borderTopColor: theme.border }]}>
        <AppText tone="textSecondary" variant="footnote" weight="bold">
          Bạn đã đánh giá
        </AppText>
        <StarRating value={review.data.review.rating} />
      </View>
    );
  }

  return (
    <View style={[styles.reviewLine, { borderTopColor: theme.border }]}>
      <AppText tone="primary" variant="footnote" weight="bold">
        Chấm sao cho đơn này
      </AppText>
      <StarRating size={18} value={0} />
    </View>
  );
}

// Ba thẻ giữ chỗ cùng dáng thẻ đơn thật: tên món, mã đơn, giờ hẹn, tổng tiền.
function OrderListSkeleton() {
  return (
    <View
      accessibilityLabel="Đang tải danh sách đơn"
      accessibilityRole="progressbar"
      style={styles.skeletons}
    >
      {[0, 1, 2].map((index) => (
        <Card key={index} gap="sm">
          <Skeleton height={18} width="60%" />
          <Skeleton height={12} width="40%" />
          <Skeleton height={14} width="50%" />
          <View style={styles.totalRow}>
            <Skeleton height={14} width={60} />
            <Skeleton height={18} width={90} />
          </View>
        </Card>
      ))}
      <SlowLoadingHint />
    </View>
  );
}

const styles = StyleSheet.create({
  skeletons: { gap: Spacing.lg },
  tabs: { gap: Spacing.sm, paddingRight: ScreenGutter },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dealName: { flex: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lines: { gap: Spacing.xs },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { flex: 1 },
  reviewLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
  },
});
