import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { DealImage } from '@/features/home/components/deal-image';
import { SellerIcons } from '@/features/seller/constants/icons';
import type { SellerDeal } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';
import { formatDiscount, formatPrice } from '@/lib/format';

type SellerDealCardProps = {
  deal: SellerDeal;
  /** Số phần còn lại đang sửa tại chỗ, có thể khác portionsTotal - portionsSold. */
  portionsLeft: number;
  onChangePortionsLeft: (portionsLeft: number) => void;
  onPressDetail: () => void;
  onPressPause: () => void;
};

const ENDED_REASON_LABELS = {
  'sold-out': 'Hết hàng',
  expired: 'Hết hạn',
  'sale-closed': 'Ngừng nhận đặt',
} as const;

// Thẻ deal nửa chiều ngang: ảnh món, giá deal, số suất còn lại chỉnh nhanh bằng nút +/-.
export function SellerDealCard({
  deal,
  portionsLeft,
  onChangePortionsLeft,
  onPressDetail,
  onPressPause,
}: SellerDealCardProps) {
  const theme = useTheme();
  const isRunning = deal.status === 'running';
  const discount = formatDiscount(deal.price, deal.originalPrice);
  const badgeLabel = isRunning
    ? 'Đang bán'
    : (ENDED_REASON_LABELS[deal.endedReason ?? 'expired'] ?? 'Đã kết thúc');

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <DealImage emoji={deal.emoji} emojiSize={40} style={styles.image} uri={deal.imageUrl} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
            {deal.name}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isRunning ? theme.primarySoft : theme.backgroundSelected },
            ]}
          >
            <Text
              style={[
                styles.badgeLabel,
                { color: isRunning ? theme.primary : theme.textSecondary },
              ]}
            >
              {badgeLabel}
            </Text>
          </View>
        </View>

        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          Giá deal {formatPrice(deal.price)}
          {discount ? ` · Giảm ${discount.replace('-', '')}` : ''}
        </Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          Còn {portionsLeft}/{deal.portionsTotal} suất · {deal.pickupWindow.start}–
          {deal.pickupWindow.end}
        </Text>
        {deal.endedReason === 'sold-out' ? null : (
          <Text
            style={[
              styles.meta,
              { color: isRunning ? theme.primary : theme.textSecondary, fontWeight: '700' },
            ]}
          >
            {isRunning
              ? `Hiện với khách đến ${deal.saleEndsLabel}`
              : `Đã ẩn khỏi khách từ ${deal.saleEndsLabel}`}
          </Text>
        )}

        {isRunning ? (
          <View style={[styles.stepper, { backgroundColor: theme.primarySoft }]}>
            <Text style={[styles.stepperLabel, { color: theme.text }]}>Số phần còn lại</Text>

            <StepperButton
              accessibilityLabel={`Giảm số phần của ${deal.name}`}
              disabled={portionsLeft <= 0}
              icon={SellerIcons.minus}
              onPress={() => onChangePortionsLeft(portionsLeft - 1)}
            />
            <Text style={[styles.stepperValue, { color: theme.text }]}>{portionsLeft}</Text>
            <StepperButton
              accessibilityLabel={`Tăng số phần của ${deal.name}`}
              disabled={portionsLeft >= deal.portionsTotal}
              icon={SellerIcons.plus}
              onPress={() => onChangePortionsLeft(portionsLeft + 1)}
            />
          </View>
        ) : null}

        <View style={styles.footer}>
          <Pressable
            accessibilityLabel={`Xem chi tiết ${deal.name}`}
            accessibilityRole="button"
            onPress={onPressDetail}
            style={({ pressed }) => [
              styles.detailButton,
              { borderColor: theme.border },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.detailLabel, { color: theme.text }]}>Chi tiết</Text>
          </Pressable>

          {isRunning ? (
            <Pressable
              accessibilityLabel={`Tạm dừng ${deal.name}`}
              accessibilityRole="button"
              hitSlop={6}
              onPress={onPressPause}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={[styles.pauseLabel, { color: theme.danger }]}>Tạm dừng</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

type StepperButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
};

function StepperButton({ icon, accessibilityLabel, disabled, onPress }: StepperButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepperButton,
        { backgroundColor: theme.backgroundElement },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} color={theme.text} size={14} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexShrink: 1,
    // 50% trừ nửa khoảng cách 12 giữa hai cột.
    flexBasis: '47%',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 20,
  },
  image: { height: 118, width: '100%' },
  body: { gap: 5, padding: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, fontSize: 14, fontWeight: '900', letterSpacing: -0.2 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeLabel: { fontSize: 10.5, fontWeight: '800' },
  meta: { fontSize: 12, fontWeight: '600', lineHeight: 17 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    borderRadius: 14,
    padding: 8,
  },
  stepperLabel: { flex: 1, fontSize: 11.5, fontWeight: '700', lineHeight: 15 },
  stepperButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  stepperValue: { minWidth: 20, fontSize: 15, fontWeight: '900', textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
  },
  detailButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  detailLabel: { fontSize: 12.5, fontWeight: '800' },
  pauseLabel: { fontSize: 12.5, fontWeight: '800' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
});
