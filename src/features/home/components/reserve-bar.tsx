import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { BrandButton } from '@/components/ui/brand-button';
import type { ReservationStatus } from '@/features/home/hooks/use-reservation';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type ReserveBarProps = {
  total: number;
  status: ReservationStatus;
  onReserve: () => void;
  onViewOrder: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** Chưa chọn được giờ đến lấy thì không đặt được. */
  disabled?: boolean;
};

export function ReserveBar({
  total,
  status,
  onReserve,
  onViewOrder,
  onLayout,
  disabled = false,
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
      <View style={styles.total}>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
          {isReserved ? 'Đã giữ chỗ' : 'Tổng tạm'}
        </Text>
        <Text style={[styles.totalValue, { color: theme.primary }]}>{formatPrice(total)}</Text>
      </View>

      <BrandButton
        disabled={disabled && !isReserved}
        loading={status === 'reserving'}
        onPress={isReserved ? onViewOrder : onReserve}
        style={styles.button}
      >
        {isReserved ? 'Xem đơn đã giữ' : 'Đặt giữ ngay'}
      </BrandButton>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  total: { gap: Spacing.xxs },
  totalLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  totalValue: { fontSize: FontSize.titleLg, fontWeight: FontWeight.heavy },
  button: { flex: 1, minHeight: 50 },
});
