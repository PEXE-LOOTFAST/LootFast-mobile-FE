import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { InlineAlert } from '@/components/ui/inline-alert';
import {
  PICKUP_CODE_PREFIX,
  toMerchantOrderErrorMessage,
  type MerchantOrderDto,
} from '@/features/seller/api/merchant-orders';
import {
  useConfirmPayment,
  useConfirmPickup,
  useMerchantOrders,
  useRejectPayment,
} from '@/features/seller/api/use-merchant-orders';
import { IncomingOrderFilters } from '@/features/seller/components/incoming-order-filters';
import { IncomingOrdersPanel } from '@/features/seller/components/incoming-orders-panel';
import { RejectPaymentModal } from '@/features/seller/components/reject-payment-modal';
import { PICKUP_CODE_LENGTH } from '@/features/seller/constants/seller-order-tabs';
import type { SellerPickupBucket } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';

const BUCKET_STATUS: Record<SellerPickupBucket, MerchantOrderDto['orderStatus']> = {
  waiting: 'RESERVED',
  picked: 'COMPLETED',
  'no-show': 'NO_SHOW',
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function IncomingOrdersSection() {
  const theme = useTheme();
  const [date, setDate] = useState(() => startOfDay(new Date()));
  const [bucket, setBucket] = useState<SellerPickupBucket>('waiting');
  const [code, setCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveredMessage, setDeliveredMessage] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<MerchantOrderDto | null>(null);

  const range = useMemo(() => {
    const from = startOfDay(date);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    return { from, to };
  }, [date]);

  const ordersQuery = useMerchantOrders(range);
  const confirmPickup = useConfirmPickup();
  const confirmPayment = useConfirmPayment();
  const rejectPayment = useRejectPayment();

  const orders = ordersQuery.data?.items ?? [];
  const counts: Record<SellerPickupBucket, number> = {
    waiting: orders.filter((order) => order.orderStatus === BUCKET_STATUS.waiting).length,
    picked: orders.filter((order) => order.orderStatus === BUCKET_STATUS.picked).length,
    'no-show': orders.filter((order) => order.orderStatus === BUCKET_STATUS['no-show']).length,
  };

  const keyword = searchQuery.trim().toLowerCase();
  const visible = orders.filter(
    (order) =>
      order.orderStatus === BUCKET_STATUS[bucket] &&
      (!keyword || order.dealName.toLowerCase().includes(keyword)),
  );

  const busyOrderId =
    (confirmPayment.isPending ? confirmPayment.variables : null) ??
    (rejectPayment.isPending ? rejectPayment.variables.orderId : null);

  const error =
    confirmPickup.error ?? confirmPayment.error ?? rejectPayment.error ?? ordersQuery.error;

  const submitCode = () => {
    if (code.length !== PICKUP_CODE_LENGTH) return;

    confirmAction({
      title: 'Xác nhận khách đã nhận món',
      message: `Khách đã nhận đơn có mã ${PICKUP_CODE_PREFIX}${code} tại quán? Không hoàn tác được.`,
      confirmLabel: 'Đã nhận',
      onConfirm: () =>
        confirmPickup.mutate(code, {
          onSuccess: (order) => {
            setCode('');
            setDeliveredMessage(`Khách đã nhận ${order.dealName} × ${order.quantity}.`);
          },
          onError: () => setDeliveredMessage(null),
        }),
    });
  };

  const askConfirmPayment = (order: MerchantOrderDto) => {
    confirmAction({
      title: 'Xác nhận đã nhận tiền',
      message: `Bạn đã nhận đủ ${order.totalAmount.toLocaleString('vi-VN')}đ cho ${order.dealName} × ${order.quantity}?`,
      confirmLabel: 'Đã nhận tiền',
      onConfirm: () => confirmPayment.mutate(order.orderId),
    });
  };

  return (
    <View style={styles.container}>
      <IncomingOrderFilters
        code={code}
        date={date}
        isSubmittingCode={confirmPickup.isPending}
        isToday={isSameDay(date, new Date())}
        onChangeCode={(value) => {
          setCode(value);
          setDeliveredMessage(null);
        }}
        onChangeDate={setDate}
        onChangeSearch={setSearchQuery}
        onPressToday={() => setDate(startOfDay(new Date()))}
        onSubmitCode={submitCode}
        searchQuery={searchQuery}
      />

      {deliveredMessage ? (
        <Text style={[styles.success, { color: theme.primary }]}>{deliveredMessage}</Text>
      ) : null}
      {error ? <InlineAlert message={toMerchantOrderErrorMessage(error)} /> : null}

      {ordersQuery.isLoading ? (
        <ActivityIndicator color={theme.primary} size="large" style={styles.loader} />
      ) : (
        <IncomingOrdersPanel
          bucket={bucket}
          busyOrderId={busyOrderId}
          counts={counts}
          onChangeBucket={setBucket}
          onConfirmPayment={askConfirmPayment}
          onRejectPayment={setRejecting}
          orders={visible}
        />
      )}

      <RejectPaymentModal
        isSubmitting={rejectPayment.isPending}
        onCancel={() => setRejecting(null)}
        onSubmit={(reason) => {
          if (!rejecting) return;
          rejectPayment.mutate({ orderId: rejecting.orderId, reason });
          setRejecting(null);
        }}
        visible={rejecting !== null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  success: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  loader: { marginTop: 24 },
});
