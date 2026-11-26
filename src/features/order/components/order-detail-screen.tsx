import { Image } from 'expo-image';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { StyleSheet, Text, View } from 'react-native';

import { TabHeader } from '@/components/ui/tab-header';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { BrandButton } from '@/components/ui/brand-button';
import { EmptyCard } from '@/components/ui/empty-card';
import { ErrorState } from '@/components/ui/error-state';
import { InlineAlert } from '@/components/ui/inline-alert';
import { LoadingState } from '@/components/ui/loading-state';
import { OrderReviewCard } from '@/features/review/components/order-review-card';
import {
  FontSize,
  FontWeight,
  MaxContentWidth,
  Radius,
  Spacing,
  StaticColors,
} from '@/constants/theme';
import {
  toOrderErrorMessage,
  type OrderDto,
  type OrderStatusDto,
  type PaymentMethodDto,
} from '@/features/order/api/orders';
import { toPaymentErrorMessage } from '@/features/order/api/payments';
import { ORDER_QUERY_KEY, useCancelOrder, useOrder } from '@/features/order/api/use-orders';
import { useChangePaymentMethod, usePaymentInstructions } from '@/features/order/api/use-payments';
import { useStore } from '@/features/home/api/use-store';
import { StoreDirections } from '@/features/map/components/store-directions';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import { formatPrice, formatTime, formatTimeOfDay } from '@/lib/format';

const STATUS_LABELS: Record<OrderStatusDto, string> = {
  RESERVED: 'Đang giữ chỗ',
  COMPLETED: 'Đã nhận món',
  CANCELLED: 'Đã huỷ',
  NO_SHOW: 'Không đến nhận',
  MERCHANT_CANCELLED: 'Quán đã huỷ',
};

// Đơn đã kết thúc (huỷ, không đến) tô đỏ để không bị nhầm là còn hiệu lực.
const ENDED_STATUSES = new Set<OrderStatusDto>(['CANCELLED', 'NO_SHOW', 'MERCHANT_CANCELLED']);

// Backend chỉ cho khách huỷ đơn chưa thanh toán và trước giờ hẹn lấy ít nhất 30 phút.
const CANCEL_CUTOFF_MS = 30 * 60_000;

type CancelBlock = 'paid' | 'late';

const CANCEL_BLOCK_NOTES: Record<CancelBlock, string> = {
  paid: 'Đơn đã chuyển khoản nên không tự huỷ được. Liên hệ quán nếu bạn cần huỷ.',
  late: 'Đã quá hạn huỷ: chỉ huỷ được trước giờ hẹn lấy 30 phút. Nếu không đến được, hãy liên hệ quán.',
};

/** Lời nhắn thay cho hướng dẫn thanh toán khi đơn không còn cần trả tiền. */
function paymentStateNote(order: OrderDto) {
  if (order.paymentStatus === 'CONFIRMED') return 'Quán đã xác nhận thanh toán của bạn.';
  if (order.paymentStatus === 'REVIEW_REQUIRED') {
    return 'Quán đang kiểm tra khoản chuyển của bạn. Bạn chưa cần làm gì thêm.';
  }
  if (order.orderStatus === 'COMPLETED') return 'Đơn đã hoàn tất.';

  return 'Đơn đã kết thúc nên không cần thanh toán.';
}

const METHOD_LABELS: Record<PaymentMethodDto, string> = {
  CASH: 'Trả tiền mặt khi nhận',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
};

// Backend trả `message` bằng tiếng Anh nên không hiển thị lại; lời nhắn do app tự viết theo phương thức.
const METHOD_NOTES: Record<PaymentMethodDto, string> = {
  CASH: 'Thanh toán cho cửa hàng khi nhận món.',
  BANK_TRANSFER: 'Chuyển khoản theo thông tin bên dưới, ghi đúng nội dung chuyển khoản.',
};

const NO_BANK_NOTE =
  'Quán chưa thêm tài khoản ngân hàng khi bạn đặt đơn này, nên đơn chỉ trả được bằng tiền mặt lúc đến lấy món.';

/**
 * Chi tiết một đơn đã giữ, kèm hướng dẫn thanh toán. Mở từ màn deal ngay sau khi đặt — backend
 * chưa có endpoint liệt kê đơn nên chỉ vào được bằng mã đơn.
 */
export function OrderDetailScreen() {
  const theme = useTheme();
  const { id, rating } = useLocalSearchParams<{ id?: string; rating?: string }>();
  // Mở từ thẻ nhắc đánh giá: khách đã chạm sẵn số sao ở đó.
  const initialRating = Math.min(Math.max(Number(rating) || 0, 0), 5);
  const orderQuery = useOrder(id, { live: true });
  const instructionsQuery = usePaymentInstructions(id);
  const changeMethod = useChangePaymentMethod(id);
  const cancelOrder = useCancelOrder();

  const order = orderQuery.data;
  const instructions = instructionsQuery.data;
  const now = useNow(30_000);
  const isReserved = order?.orderStatus === 'RESERVED';
  // Chỉ đơn đang giữ và chưa trả tiền mới cần hướng dẫn thanh toán và đổi phương thức được.
  const isPayable = isReserved && order?.paymentStatus === 'UNPAID';
  const cancelDeadline = order ? new Date(order.pickupFrom).getTime() - CANCEL_CUTOFF_MS : 0;
  const cancelBlock: CancelBlock | null = !isReserved
    ? null
    : !isPayable
      ? 'paid'
      : now >= cancelDeadline
        ? 'late'
        : null;
  const canCancel = isReserved && cancelBlock === null;

  // Đơn vừa đổi trạng thái ở phía quán (tải lại định kỳ phát hiện): làm mới danh sách đơn và hướng
  // dẫn thanh toán theo, để quay ra tab Đơn hàng không còn thấy trạng thái cũ.
  const queryClient = useQueryClient();
  const orderState = order ? `${order.orderStatus}/${order.paymentStatus}` : undefined;
  const lastOrderState = useRef(orderState);
  useEffect(() => {
    if (!orderState) return;
    if (lastOrderState.current && lastOrderState.current !== orderState) {
      void queryClient.invalidateQueries({ queryKey: [...ORDER_QUERY_KEY, 'list'] });
      void queryClient.invalidateQueries({ queryKey: ['payment-instructions', id] });
    }
    lastOrderState.current = orderState;
  }, [orderState, id, queryClient]);

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
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <TabHeader onBack={() => router.back()} title="Chi tiết đơn" />

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
        {!orderQuery.isLoading && !order ? (
          <EmptyCard
            description="Mã đơn không hợp lệ hoặc đơn đã bị gỡ."
            title="Không tìm thấy đơn"
          />
        ) : null}

        {order ? (
          <>
            {/* Đơn đã nhận món thì việc còn lại là đánh giá, nên đưa lên đầu thay vì nằm dưới mã nhận món. */}
            <OrderReviewCard
              dealName={order.dealName}
              initialRating={initialRating}
              isCompleted={order.orderStatus === 'COMPLETED'}
              orderId={order.orderId}
              storeId={order.storeId}
            />

            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.dealName, { color: theme.text }]}>{order.dealName}</Text>
              <View
                style={[
                  styles.pill,
                  {
                    backgroundColor: ENDED_STATUSES.has(order.orderStatus)
                      ? `${theme.danger}1F`
                      : theme.primarySoft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillLabel,
                    {
                      color: ENDED_STATUSES.has(order.orderStatus) ? theme.danger : theme.primary,
                    },
                  ]}
                >
                  {STATUS_LABELS[order.orderStatus]}
                </Text>
              </View>

              {/* Ra quầy là mở màn này để đưa mã, nên mã nằm ngay đầu, không phải cuộn tìm. */}
              {/* Mã chỉ dùng khi ra quầy lấy món: đơn đã huỷ hay đã nhận thì ẩn đi cho khỏi nhầm. */}
              {isReserved && order.pickupCode ? (
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

              <Row label="Số lượng" value={`${order.quantity} phần`} />
              <Row label="Tổng tiền" value={formatPrice(order.totalAmount)} />
              <Row
                label="Giờ bạn hẹn lấy"
                value={`${formatTime(order.pickupFrom)}–${formatTime(order.pickupTo)}`}
              />
              <Row
                label="Khung giờ deal"
                value={`${formatTime(order.pickupStart)}–${formatTime(order.pickupEnd)}`}
              />
              {order.paymentReference ? (
                <Row label="Mã tham chiếu" value={order.paymentReference} />
              ) : null}

              {isReserved ? <OrderStoreDirections storeId={order.storeId} /> : null}
            </View>

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
                    {isPayable ? METHOD_NOTES[instructions.method] : paymentStateNote(order)}
                  </Text>

                  {/* Đơn đã huỷ hay đã trả tiền mà vẫn hiện mã QR thì dễ khiến khách chuyển nhầm. */}
                  {isPayable && instructions.qrImageUrl ? (
                    <Image
                      contentFit="contain"
                      source={{ uri: instructions.qrImageUrl }}
                      style={styles.qr}
                    />
                  ) : null}

                  {isPayable && instructions.bank ? (
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

              {/* Backend chép tài khoản ngân hàng của quán vào đơn lúc đặt. Đơn không có thì không đổi
                  sang chuyển khoản được, nên báo trước thay vì để khách bấm rồi nhận lỗi. */}
              {isPayable && order.paymentMethod === 'CASH' && instructions && !instructions.bank ? (
                <Text style={[styles.note, { color: theme.textSecondary }]}>{NO_BANK_NOTE}</Text>
              ) : isPayable ? (
                <>
                  {changeMethod.error ? (
                    <InlineAlert message={toPaymentErrorMessage(changeMethod.error)} />
                  ) : null}
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
                </>
              ) : null}
            </View>

            {/* Lỗi và kết quả huỷ nằm ngay cạnh nút, chỗ khách vừa bấm, thay vì ở đầu màn. */}
            {isReserved || cancelOrder.isSuccess ? (
              <View style={styles.cancelSection}>
                {cancelOrder.error ? (
                  <InlineAlert message={toOrderErrorMessage(cancelOrder.error)} />
                ) : null}
                {cancelOrder.isSuccess && !isReserved ? (
                  <InlineAlert
                    message="Đã huỷ đơn. Suất đã được trả lại để khách khác đặt."
                    tone="success"
                  />
                ) : null}
                {canCancel ? (
                  <>
                    <BrandButton
                      loading={cancelOrder.isPending}
                      onPress={askToCancel}
                      variant="danger"
                    >
                      Huỷ đơn
                    </BrandButton>
                    <Text style={[styles.cancelNote, { color: theme.textSecondary }]}>
                      Bạn có thể huỷ đến {formatTimeOfDay(new Date(cancelDeadline))}, trước giờ hẹn
                      lấy 30 phút.
                    </Text>
                  </>
                ) : cancelBlock ? (
                  <Text style={[styles.cancelNote, { color: theme.textSecondary }]}>
                    {CANCEL_BLOCK_NOTES[cancelBlock]}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
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

// Đơn đang giữ thì khách sắp phải đến quán: chỉ đường ngay trong đơn thay vì phải mở lại deal.
function OrderStoreDirections({ storeId }: { storeId: string }) {
  const store = useStore(storeId).data;
  if (!store) return null;

  const { addressLine, ward, district, city, latitude, longitude } = store.address;
  const address = [addressLine, ward, district, city].filter(Boolean).join(', ');
  if (!address && latitude == null) return null;

  return <StoreDirections address={address} latitude={latitude} longitude={longitude} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  card: { gap: 10, borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.lg },
  dealName: { fontSize: FontSize.title, fontWeight: FontWeight.heavy, letterSpacing: -0.3 },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  pillLabel: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  section: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.heavy, letterSpacing: -0.2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  rowLabel: { fontSize: FontSize.bodySm },
  rowValue: {
    flexShrink: 1,
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  note: { fontSize: FontSize.bodySm, lineHeight: 19 },
  cancelSection: { gap: Spacing.sm },
  cancelNote: { fontSize: FontSize.footnote, lineHeight: 17, textAlign: 'center' },
  qr: { width: '100%', height: 220 },
  bank: { gap: Spacing.sm },
  pickupCodeSection: { gap: 10, alignItems: 'center', marginTop: Spacing.xs },
  pickupCode: { fontSize: FontSize.display, fontWeight: FontWeight.heavy, letterSpacing: 2 },
  pickupQr: {
    alignItems: 'center',
    backgroundColor: StaticColors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
});
