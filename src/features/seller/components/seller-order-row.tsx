import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import type { MerchantOrderDto } from '@/features/seller/api/merchant-orders';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice, formatTime } from '@/lib/format';

type SellerOrderRowProps = {
  order: MerchantOrderDto;
  isBusy: boolean;
  onConfirmPayment: () => void;
  onRejectPayment: () => void;
};

/** Một dòng trạng thái thanh toán dễ hiểu cho người bán, dựa trên cặp phương thức và trạng thái. */
function describePayment(order: MerchantOrderDto) {
  if (order.paymentMethod === 'CASH') {
    return order.paymentStatus === 'CONFIRMED'
      ? 'Đã thu tiền mặt'
      : 'Thu tiền mặt khi khách nhận món';
  }
  if (order.paymentStatus === 'CONFIRMED') return 'Đã nhận chuyển khoản';
  if (order.paymentStatus === 'REVIEW_REQUIRED') return 'Khách báo đã chuyển — cần bạn kiểm tra';

  return 'Chờ khách chuyển khoản';
}

// Một đơn trong danh sách "Đơn hàng đến". Backend không trả tên khách và mã lấy hàng nên dòng
// chỉ có tên món, giờ nhận và thanh toán; việc đối chiếu khách làm qua mã/QR khi khách đến nhận món.
export function SellerOrderRow({
  order,
  isBusy,
  onConfirmPayment,
  onRejectPayment,
}: SellerOrderRowProps) {
  const theme = useTheme();
  const needsPaymentReview =
    order.orderStatus === 'RESERVED' &&
    order.paymentMethod === 'BANK_TRANSFER' &&
    order.paymentStatus === 'REVIEW_REQUIRED';

  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
          <Icon name={SellerIcons.bag} color={theme.primary} size={16} />
        </View>

        <View style={styles.copy}>
          <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
            {order.dealName} × {order.quantity}
          </Text>
          <Text numberOfLines={1} style={[styles.meta, { color: theme.textSecondary }]}>
            Khách hẹn {formatTime(order.pickupFrom)} – {formatTime(order.pickupTo)}
          </Text>
        </View>

        <Text style={[styles.total, { color: theme.primary }]}>
          {formatPrice(order.totalAmount)}
        </Text>
      </View>

      <Text
        style={[styles.payment, { color: needsPaymentReview ? theme.danger : theme.textSecondary }]}
      >
        {describePayment(order)}
        {order.paymentReference ? ` · ${order.paymentReference}` : ''}
      </Text>

      {needsPaymentReview ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={onRejectPayment}
            style={({ pressed }) => [
              styles.action,
              { borderColor: theme.border, backgroundColor: theme.background },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.actionLabel, { color: theme.text }]}>Chưa nhận được</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={onConfirmPayment}
            style={({ pressed }) => [
              styles.action,
              { borderColor: theme.primary, backgroundColor: theme.primary },
              pressed && styles.pressed,
            ]}
          >
            {isBusy ? (
              <ActivityIndicator color={theme.onPrimary} size="small" />
            ) : (
              <Text style={[styles.actionLabel, { color: theme.onPrimary }]}>Đã nhận tiền</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.lg, padding: 10 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  copy: { flex: 1, gap: Spacing.xxs },
  title: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  meta: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  total: { fontSize: FontSize.body, fontWeight: FontWeight.heavy },
  payment: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  action: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
  },
  actionLabel: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold },
  pressed: { opacity: 0.85 },
});
