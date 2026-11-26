import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
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
  onPressDeleteDraft: () => void;
  onPressPause: () => void;
  onPressResume: () => void;
};

const ENDED_REASON_LABELS = {
  'sold-out': 'Hết hàng',
  expired: 'Hết giờ',
  paused: 'Tạm dừng',
  removed: 'Đã gỡ',
} as const;

/**
 * Thẻ deal của quán, trải hết chiều ngang để tên món, giá và giờ bán đọc được trọn một dòng.
 * Thanh "đã bán" cho thấy deal đi nhanh hay chậm; deal đang bán chỉnh nhanh số phần bằng nút +/-.
 */
export function SellerDealCard({
  deal,
  portionsLeft,
  onChangePortionsLeft,
  onPressDetail,
  onPressDeleteDraft,
  onPressPause,
  onPressResume,
}: SellerDealCardProps) {
  const theme = useTheme();
  const isRunning = deal.status === 'running';
  // Nháp nằm chung mục "đang chạy" để người bán thấy mà đăng tiếp, nhưng chưa bán gì nên không có
  // nút chỉnh số phần, và gọi đúng là "Bản nháp".
  const isSelling = isRunning && !deal.isDraft;
  const discount = formatDiscount(deal.price, deal.originalPrice);
  const sold = Math.max(deal.portionsTotal - portionsLeft, 0);
  const soldRatio = deal.portionsTotal > 0 ? sold / deal.portionsTotal : 0;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.top}>
        <DealImage emoji={deal.emoji} emojiSize={32} style={styles.image} uri={deal.imageUrl} />

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <AppText numberOfLines={2} style={styles.name} variant="body" weight="heavy">
              {deal.name}
            </AppText>
            <Badge
              label={
                deal.isDraft
                  ? 'Bản nháp'
                  : isRunning
                    ? 'Đang bán'
                    : ENDED_REASON_LABELS[deal.endedReason ?? 'expired']
              }
              size="sm"
              tone={isSelling ? 'primarySoft' : 'neutral'}
            />
          </View>

          <View style={styles.priceRow}>
            <AppText tone="primary" variant="bodyLg" weight="heavy">
              {formatPrice(deal.price)}
            </AppText>
            {discount ? (
              <>
                <AppText style={styles.strike} tone="textSecondary" variant="footnote">
                  {formatPrice(deal.originalPrice)}
                </AppText>
                <AppText tone="danger" variant="footnote" weight="bold">
                  {discount}
                </AppText>
              </>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <Icon name={SellerIcons.clock} color={theme.textSecondary} size={13} />
            <AppText numberOfLines={1} style={styles.meta} tone="textSecondary" variant="footnote">
              {deal.isDraft
                ? `Chưa đăng · bán đến ${deal.saleEndsLabel}`
                : isRunning
                  ? `Nhận đặt đến ${deal.saleEndsLabel}`
                  : deal.canResume
                    ? `Mở bán lại được đến ${deal.saleEndsLabel}`
                    : deal.endedReason === 'sold-out'
                      ? `Khung giờ ${deal.pickupWindow.start}–${deal.pickupWindow.end}`
                      : `Đã đóng từ ${deal.saleEndsLabel}`}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.progress}>
        <View style={styles.progressLabels}>
          <AppText tone="textSecondary" variant="footnote" weight="bold">
            Đã bán {sold}/{deal.portionsTotal} phần
          </AppText>
          {isRunning ? null : (
            <AppText tone="textSecondary" variant="footnote">
              Còn {portionsLeft}
            </AppText>
          )}
        </View>
        <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: isRunning ? theme.primary : theme.textSecondary,
                width: `${Math.round(soldRatio * 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      {isSelling ? (
        <View style={[styles.stepper, { backgroundColor: theme.primarySoft }]}>
          <View style={styles.stepperCopy}>
            <AppText variant="bodySm" weight="bold">
              Số phần còn lại
            </AppText>
            <AppText tone="textSecondary" variant="caption">
              Bán tại quán thì bấm −, nấu thêm thì bấm +
            </AppText>
          </View>

          <StepperButton
            accessibilityLabel={`Giảm số phần của ${deal.name}`}
            disabled={portionsLeft <= 0}
            icon={SellerIcons.minus}
            onPress={() => onChangePortionsLeft(portionsLeft - 1)}
          />
          <AppText align="center" style={styles.stepperValue} variant="title" weight="heavy">
            {portionsLeft}
          </AppText>
          <StepperButton
            accessibilityLabel={`Tăng số phần của ${deal.name}`}
            disabled={portionsLeft >= deal.portionsTotal}
            icon={SellerIcons.plus}
            onPress={() => onChangePortionsLeft(portionsLeft + 1)}
          />
        </View>
      ) : null}

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Pressable
          accessibilityLabel={`Xem chi tiết ${deal.name}`}
          accessibilityRole="button"
          onPress={onPressDetail}
          style={({ pressed }) => [
            styles.footerButton,
            { borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <AppText variant="bodySm" weight="bold">
            {deal.isDraft ? 'Thêm ảnh và đăng' : 'Ảnh và chi tiết'}
          </AppText>
        </Pressable>

        {deal.isDraft ? (
          <Pressable
            accessibilityLabel={`Xoá bản nháp ${deal.name}`}
            accessibilityRole="button"
            onPress={onPressDeleteDraft}
            style={({ pressed }) => [styles.footerLink, pressed && styles.pressed]}
          >
            <Icon name={SellerIcons.trash} color={theme.danger} size={16} />
            <AppText tone="danger" variant="bodySm" weight="bold">
              Xoá nháp
            </AppText>
          </Pressable>
        ) : null}

        {deal.canPause ? (
          <Pressable
            accessibilityLabel={`Tạm dừng ${deal.name}`}
            accessibilityRole="button"
            onPress={onPressPause}
            style={({ pressed }) => [styles.footerLink, pressed && styles.pressed]}
          >
            <Icon name={SellerIcons.pause} color={theme.danger} size={16} />
            <AppText tone="danger" variant="bodySm" weight="bold">
              Tạm dừng
            </AppText>
          </Pressable>
        ) : null}
        {deal.canResume ? (
          <Pressable
            accessibilityLabel={`Mở bán lại ${deal.name}`}
            accessibilityRole="button"
            onPress={onPressResume}
            style={({ pressed }) => [
              styles.footerButton,
              { backgroundColor: theme.primary, borderColor: theme.primary },
              pressed && styles.pressed,
            ]}
          >
            <AppText tone="onPrimary" variant="bodySm" weight="bold">
              Mở bán lại
            </AppText>
          </Pressable>
        ) : null}
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
      hitSlop={Spacing.xs}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepperButton,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} color={theme.text} size={18} />
    </Pressable>
  );
}

const IMAGE_SIZE = 84;

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexShrink: 1,
    // Điện thoại: một cột trọn chiều ngang. Màn rộng (máy tính bảng, web): hai cột.
    flexBasis: '47%',
    minWidth: 300,
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.md,
  },
  top: { flexDirection: 'row', gap: Spacing.md },
  image: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: Radius.lg },
  info: { flex: 1, minWidth: 0, gap: Spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  name: { flex: 1, letterSpacing: -0.2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.sm },
  strike: { textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  meta: { flexShrink: 1 },
  progress: { gap: Spacing.xs },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 6, overflow: 'hidden', borderRadius: Radius.full },
  fill: { height: '100%', borderRadius: Radius.full },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  stepperCopy: { flex: 1, gap: Spacing.xxs },
  stepperButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
  },
  stepperValue: { minWidth: 32 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
  },
  footerButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
  },
  footerLink: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
});
