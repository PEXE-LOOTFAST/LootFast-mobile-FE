import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import type { ReservationStatus } from '@/features/home/hooks/use-reservation';
import type { PaymentMethod } from '@/features/order/api/orders';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type ReserveBarProps = {
  total: number;
  status: ReservationStatus;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  errorMessage?: string | null;
  onReserve: (method: PaymentMethod) => void;
  onViewOrder: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function ReserveBar({
  total,
  status,
  paymentMethod,
  onPaymentMethodChange,
  errorMessage,
  onReserve,
  onViewOrder,
  onLayout,
}: ReserveBarProps) {
  const theme = useTheme();
  const isReserved = status === 'reserved';

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.bar,
        { backgroundColor: theme.backgroundElement, borderTopColor: theme.border },
      ]}
    >
      <View style={styles.paymentMethods}>
        {(['BANK_TRANSFER', 'CASH'] as const).map((method) => (
          <Pressable
            key={method}
            accessibilityRole="radio"
            accessibilityState={{
              checked: paymentMethod === method,
              disabled: status === 'reserving',
            }}
            disabled={status === 'reserving' || status === 'reserved'}
            onPress={() => onPaymentMethodChange(method)}
            style={[
              styles.paymentMethod,
              {
                backgroundColor:
                  paymentMethod === method ? theme.primarySoft : theme.backgroundElement,
                borderColor: paymentMethod === method ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={[styles.paymentMethodText, { color: theme.text }]}>
              {method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
            </Text>
          </Pressable>
        ))}
      </View>
      {errorMessage ? (
        <Text style={[styles.error, { color: theme.danger }]}>{errorMessage}</Text>
      ) : null}
      <View style={styles.total}>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
          {isReserved ? 'Đã giữ chỗ' : 'Tổng tạm'}
        </Text>
        <Text style={[styles.totalValue, { color: theme.primary }]}>{formatPrice(total)}</Text>
      </View>

      <BrandButton
        loading={status === 'reserving'}
        onPress={isReserved ? onViewOrder : () => onReserve(paymentMethod)}
        style={styles.button}
      >
        {isReserved ? 'Xem đơn đã giữ' : status === 'error' ? 'Thử lại' : 'Đặt giữ ngay'}
      </BrandButton>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  paymentMethods: { flexDirection: 'row', gap: 6 },
  paymentMethod: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6 },
  paymentMethodText: { fontSize: 10, fontWeight: '700' },
  error: { flex: 1, fontSize: 11, lineHeight: 15 },
  total: { gap: 2 },
  totalLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  totalValue: { fontSize: 20, fontWeight: '900' },
  button: { flex: 1, minHeight: 50 },
});
