import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { SellerOrderRow } from '@/features/seller/components/seller-order-row';
import {
  PICKUP_EMPTY_MESSAGES,
  SELLER_PICKUP_BUCKETS,
} from '@/features/seller/constants/seller-order-tabs';
import type { MerchantOrderDto } from '@/features/seller/api/merchant-orders';
import type { SellerPickupBucket } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';

type IncomingOrdersPanelProps = {
  bucket: SellerPickupBucket;
  onChangeBucket: (bucket: SellerPickupBucket) => void;
  counts: Record<SellerPickupBucket, number>;
  orders: MerchantOrderDto[];
  busyOrderId: string | null;
  onConfirmPayment: (order: MerchantOrderDto) => void;
  onRejectPayment: (order: MerchantOrderDto) => void;
};

export function IncomingOrdersPanel({
  bucket,
  onChangeBucket,
  counts,
  orders,
  busyOrderId,
  onConfirmPayment,
  onRejectPayment,
}: IncomingOrdersPanelProps) {
  const theme = useTheme();
  // Số đơn nằm ngay trên nhãn để người bán thấy còn bao nhiêu khách chưa tới lấy.
  const items = SELLER_PICKUP_BUCKETS.map((item) => ({
    id: item.id,
    label: `${item.label} (${counts[item.id]})`,
  }));

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <SegmentedTabs items={items} onChange={onChangeBucket} size="small" value={bucket} />

      {orders.length > 0 ? (
        <View style={styles.list}>
          {orders.map((order) => (
            <SellerOrderRow
              key={order.orderId}
              isBusy={busyOrderId === order.orderId}
              onConfirmPayment={() => onConfirmPayment(order)}
              onRejectPayment={() => onRejectPayment(order)}
              order={order}
            />
          ))}
        </View>
      ) : (
        <Text style={[styles.empty, { color: theme.primary }]}>
          {PICKUP_EMPTY_MESSAGES[bucket]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, borderWidth: 1, borderRadius: Radius.xl, padding: 10 },
  list: { gap: 10 },
  empty: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 34,
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    lineHeight: 21,
    textAlign: 'center',
  },
});
