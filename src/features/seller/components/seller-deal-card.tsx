import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
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
  onPressResume: () => void;
};

const ENDED_REASON_LABELS = {
  'sold-out': 'Hết hàng',
  expired: 'Hết hạn',
  paused: 'Tạm dừng',
} as const;

// Thẻ deal nửa chiều ngang: ảnh món, giá deal, số suất còn lại chỉnh nhanh bằng nút +/-.
export function SellerDealCard({
  deal,
  portionsLeft,
  onChangePortionsLeft,
  onPressDetail,
  onPressPause,
  onPressResume,
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
              {
                color: isRunning ? theme.primary : theme.textSecondary,
                fontWeight: FontWeight.bold,
              },
            ]}
          >
            {isRunning ? `Nhận đặt đến ${deal.saleEndsLabel}` : `Đã đóng từ ${deal.saleEndsLabel}`}
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

          {deal.canPause ? (
            <Pressable
              accessibilityLabel={`Tạm dừng ${deal.name}`}
              accessibilityRole="button"
              hitSlop={Spacing.sm}
              onPress={onPressPause}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={[styles.pauseLabel, { color: theme.danger }]}>Tạm dừng</Text>
            </Pressable>
          ) : null}
          {deal.canResume ? (
            <Pressable
              accessibilityLabel={`Mở bán lại ${deal.name}`}
              accessibilityRole="button"
              hitSlop={Spacing.sm}
              onPress={onPressResume}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={[styles.pauseLabel, { color: theme.primary }]}>Mở bán lại</Text>
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
    borderRadius: Radius.xl,
  },
  image: { height: 118, width: '100%' },
  body: { gap: 5, padding: Spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    flexShrink: 1,
    fontSize: FontSize.body,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.2,
  },
  badge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  badgeLabel: { fontSize: FontSize.caption, fontWeight: FontWeight.bold },
  meta: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium, lineHeight: 17 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
  },
  stepperLabel: {
    flex: 1,
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.bold,
    lineHeight: 15,
  },
  stepperButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  stepperValue: {
    minWidth: 20,
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.heavy,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: 6,
  },
  detailButton: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
  },
  detailLabel: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold },
  pauseLabel: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
});
