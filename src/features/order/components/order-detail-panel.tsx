import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { getOrderErrorMessage } from '@/features/order/api/orders';
import { useCancelOrder, useOrder } from '@/features/order/api/use-orders';
import { DetailCard } from '@/features/home/components/detail-card';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

const STATUS_LABELS: Record<string, string> = {
  RESERVED: 'Đang giữ chỗ',
  CONFIRMED: 'Đã xác nhận',
  READY: 'Sẵn sàng nhận món',
  COMPLETED: 'Đã hoàn tất',
  CANCELLED: 'Đã hủy',
};

type OrderDetailPanelProps = {
  orderId: string;
};

export function OrderDetailPanel({ orderId }: OrderDetailPanelProps) {
  const theme = useTheme();
  const orderQuery = useOrder(orderId);
  const cancelMutation = useCancelOrder(orderId);

  if (orderQuery.isPending) {
    return (
      <DetailCard title="Đơn vừa đặt">
        <ActivityIndicator color={theme.primary} />
      </DetailCard>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <DetailCard title="Đơn vừa đặt">
        <InlineAlert message={getOrderErrorMessage(orderQuery.error)} />
        <BrandButton loading={orderQuery.isRefetching} onPress={() => void orderQuery.refetch()}>
          Thử lại
        </BrandButton>
      </DetailCard>
    );
  }

  const order = orderQuery.data;
  const isCancellable = order.orderStatus === 'RESERVED';
  const pickupStart = new Date(order.pickupStart).toLocaleString('vi-VN');

  return (
    <DetailCard title="Đơn vừa đặt">
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Trạng thái</Text>
        <Text style={[styles.value, { color: theme.primary }]}>
          {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Mã đơn</Text>
        <Text style={[styles.value, { color: theme.text }]}>{order.orderId}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Nhận món</Text>
        <Text style={[styles.value, { color: theme.text }]}>{pickupStart}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Thanh toán</Text>
        <Text style={[styles.value, { color: theme.text }]}>
          {order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'} ·{' '}
          {formatPrice(order.totalAmount)}
        </Text>
      </View>
      {cancelMutation.isError ? (
        <InlineAlert message={getOrderErrorMessage(cancelMutation.error)} />
      ) : null}
      {isCancellable ? (
        <BrandButton
          loading={cancelMutation.isPending}
          onPress={() => cancelMutation.mutate()}
          variant="outline"
        >
          Hủy đơn
        </BrandButton>
      ) : null}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { fontSize: 13 },
  value: { flex: 1, fontSize: 13, fontWeight: '700', textAlign: 'right' },
});
