import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { BrandButton } from '@/components/ui/brand-button';
import { EmptyCard } from '@/components/ui/empty-card';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { LoadingState } from '@/components/ui/loading-state';
import { OrderReviewCard } from '@/features/review/components/order-review-card';
import { MaxContentWidth } from '@/constants/theme';
import { HomeIcons } from '@/features/home/constants/icons';
import {
  toOrderErrorMessage,
  type OrderStatusDto,
  type PaymentMethodDto,
} from '@/features/order/api/orders';
import { toPaymentErrorMessage } from '@/features/order/api/payments';
import { useCancelOrder, useOrder } from '@/features/order/api/use-orders';
import { useChangePaymentMethod, usePaymentInstructions } from '@/features/order/api/use-payments';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import { formatPrice } from '@/lib/format';

const STATUS_LABELS: Record<OrderStatusDto, string> = {
  RESERVED: 'Đang giữ chỗ',
  COMPLETED: 'Đã nhận món',
  CANCELLED: 'Đã huỷ',
  NO_SHOW: 'Không đến nhận',
  MERCHANT_CANCELLED: 'Quán đã huỷ',
};

const METHOD_LABELS: Record<PaymentMethodDto, string> = {
  CASH: 'Trả tiền mặt khi nhận',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
};

// Backend trả `message` bằng tiếng Anh nên không hiển thị lại; lời nhắn do app tự viết theo phương thức.
const METHOD_NOTES: Record<PaymentMethodDto, string> = {
  CASH: 'Thanh toán cho cửa hàng khi nhận món.',
  BANK_TRANSFER: 'Chuyển khoản theo thông tin bên dưới, ghi đúng nội dung chuyển khoản.',
};

function toTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';

  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Chi tiết một đơn đã giữ, kèm hướng dẫn thanh toán. Mở từ màn deal ngay sau khi đặt — backend
 * chưa có endpoint liệt kê đơn nên chỉ vào được bằng mã đơn.
 */
export function OrderDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const orderQuery = useOrder(id);
  const instructionsQuery = usePaymentInstructions(id);
  const changeMethod = useChangePaymentMethod(id);
  const cancelOrder = useCancelOrder();

  const order = orderQuery.data;
  const instructions = instructionsQuery.data;
  const canCancel = order?.orderStatus === 'RESERVED';

  const askToCancel = () =>
    confirmAction({
      title: 'Huỷ đơn',
      message: 'Huỷ đơn này? Suất sẽ được trả lại cho khách khác đặt.',
      confirmLabel: 'Huỷ đơn',
      cancelLabel: 'Giữ đơn',
      isDestructive: true,
      onConfirm: () => id && cancelOrder.mutate(id),
    });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Icon name={HomeIcons.chevronLeft} color={theme.text} size={22} />
        </Pressable>
        <Text accessibilityRole="header" style={[styles.headerTitle, { color: theme.text }]}>
          Đơn đã giữ
        </Text>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {orderQuery.isLoading ? <LoadingState /> : null}

        {orderQuery.error ? (
          <ErrorState
            message={toOrderErrorMessage(orderQuery.error)}
            onRetry={() => void orderQuery.refetch()}
            retrying={orderQuery.isRefetching}
          />
        ) : null}
        {cancelOrder.error ? (
          <InlineAlert message={toOrderErrorMessage(cancelOrder.error)} />
        ) : null}
        {changeMethod.error ? (
          <InlineAlert message={toPaymentErrorMessage(changeMethod.error)} />
        ) : null}

        {!orderQuery.isLoading && !order ? (
          <EmptyCard
            description="Mã đơn không hợp lệ hoặc đơn đã bị gỡ."
            title="Không tìm thấy đơn"
          />
        ) : null}

        {order ? (
          <>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.dealName, { color: theme.text }]}>{order.dealName}</Text>
              <View style={[styles.pill, { backgroundColor: theme.primarySoft }]}>
                <Text style={[styles.pillLabel, { color: theme.primary }]}>
                  {STATUS_LABELS[order.orderStatus]}
                </Text>
              </View>

              <Row label="Số lượng" value={`${order.quantity} phần`} />
              <Row label="Tổng tiền" value={formatPrice(order.totalAmount)} />
              <Row
                label="Giờ bạn hẹn lấy"
                value={`${toTimeLabel(order.pickupFrom)}–${toTimeLabel(order.pickupTo)}`}
              />
              <Row
                label="Khung giờ deal"
                value={`${toTimeLabel(order.pickupStart)}–${toTimeLabel(order.pickupEnd)}`}
              />
              {order.pickupCode ? (
                <View style={styles.pickupCodeSection}>
                  <Text accessibilityRole="header" style={[styles.section, { color: theme.text }]}>
                    Mã nhận món
                  </Text>
                  <Text style={[styles.pickupCode, { color: theme.primary }]}>
                    {order.pickupCode}
                  </Text>
                  {order.pickupQrPayload ? (
                    <View style={styles.pickupQr}>
                      <QRCode size={180} value={order.pickupQrPayload} />
                    </View>
                  ) : null}
                  <Text style={[styles.note, { color: theme.textSecondary }]}>
                    Đưa mã này cho cửa hàng khi nhận món.
                  </Text>
                </View>
              ) : null}
              {order.paymentReference ? (
                <Row label="Mã tham chiếu" value={order.paymentReference} />
              ) : null}
            </View>

            <OrderReviewCard
              isCompleted={order.orderStatus === 'COMPLETED'}
              orderId={order.orderId}
              dealName={order.dealName}
              storeId={order.storeId}
            />

            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              <Text accessibilityRole="header" style={[styles.section, { color: theme.text }]}>
                Thanh toán
              </Text>

              {instructionsQuery.isLoading ? <LoadingState size="small" /> : null}
              {instructionsQuery.error ? (
                <ErrorState
                  message={toPaymentErrorMessage(instructionsQuery.error)}
                  onRetry={() => void instructionsQuery.refetch()}
                  retrying={instructionsQuery.isRefetching}
                />
              ) : null}

              {instructions ? (
                <>
                  <Row label="Phương thức" value={METHOD_LABELS[instructions.method]} />
                  <Row label="Số tiền" value={formatPrice(instructions.amount)} />

                  <Text style={[styles.note, { color: theme.textSecondary }]}>
                    {METHOD_NOTES[instructions.method]}
                  </Text>

                  {instructions.qrImageUrl ? (
                    <Image
                      contentFit="contain"
                      source={{ uri: instructions.qrImageUrl }}
                      style={styles.qr}
                    />
                  ) : null}

                  {instructions.bank ? (
                    <View style={styles.bank}>
                      <Row label="Ngân hàng" value={instructions.bank.bankName} />
                      <Row label="Số tài khoản" value={instructions.bank.accountNumber} />
                      <Row label="Chủ tài khoản" value={instructions.bank.accountHolderName} />
                      {instructions.reference ? (
                        <Row label="Nội dung chuyển khoản" value={instructions.reference} />
                      ) : null}
                    </View>
                  ) : null}
                </>
              ) : !instructionsQuery.isLoading && !instructionsQuery.error ? (
                <EmptyCard
                  description="Chưa có hướng dẫn thanh toán cho đơn này."
                  title="Chưa có mã VietQR"
                />
              ) : null}

              {canCancel ? (
                <BrandButton
                  loading={changeMethod.isPending}
                  onPress={() =>
                    changeMethod.mutate(order.paymentMethod === 'CASH' ? 'BANK_TRANSFER' : 'CASH')
                  }
                  variant="outline"
                >
                  {order.paymentMethod === 'CASH'
                    ? 'Chuyển sang chuyển khoản'
                    : 'Chuyển sang trả tiền mặt'}
                </BrandButton>
              ) : null}
            </View>

            {canCancel ? (
              <BrandButton
                loading={cancelOrder.isPending}
                onPress={askToCancel}
                variant="secondary"
              >
                Huỷ đơn
              </BrandButton>
            ) : null}
          </>
        ) : null}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    padding: 16,
    paddingBottom: 48,
  },
  card: { gap: 10, borderWidth: 1, borderRadius: 18, padding: 16 },
  dealName: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  pillLabel: { fontSize: 12, fontWeight: '800' },
  section: { fontSize: 15, fontWeight: '900', letterSpacing: -0.2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowLabel: { fontSize: 13 },
  rowValue: { flexShrink: 1, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  note: { fontSize: 13, lineHeight: 19 },
  qr: { width: '100%', height: 220 },
  bank: { gap: 8 },
  pickupCodeSection: { gap: 10, alignItems: 'center', marginTop: 4 },
  pickupCode: { fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  pickupQr: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12 },
});
