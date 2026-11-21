import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { HomeIcons } from '@/features/home/constants/icons';
import type { PickupSlot } from '@/features/home/pickup-slots';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice, formatTimeOfDay } from '@/lib/format';

// Khớp luật của backend (OrderService): huỷ phải trước giờ lấy 30 phút; quá giờ lấy 30 phút chưa
// nhận thì tính là bỏ lỡ; bỏ lỡ 3 lần trong 30 ngày thì 14 ngày sau đó không đặt trả tiền mặt được.
const CANCEL_LEAD_MS = 30 * 60 * 1000;

type ReservationInfoCardProps = {
  total: number;
  slot: PickupSlot | undefined;
  now: number;
};

/**
 * Nói rõ trước khi bấm đặt: trả tiền thế nào, huỷ tới lúc nào, không đến thì sao. Người mới thường
 * ngại đặt vì không biết mình bị ràng buộc gì.
 */
export function ReservationInfoCard({ total, slot, now }: ReservationInfoCardProps) {
  const cancelDeadline = slot ? new Date(slot.from).getTime() - CANCEL_LEAD_MS : null;
  const canCancel = cancelDeadline !== null && cancelDeadline > now;

  return (
    <Card elevated gap="md" radius="lg">
      <AppText accessibilityRole="header" variant="bodyLg" weight="bold">
        Nhận món thế nào?
      </AppText>

      <InfoRow
        description={`Không cần trả trước. Đưa mã nhận món ở quầy rồi trả ${formatPrice(total)}.`}
        icon={HomeIcons.cash}
        title="Trả tiền mặt khi đến lấy"
      />
      <InfoRow
        description={
          canCancel
            ? 'Sau mốc này đơn không huỷ được nữa, vì quán đã để phần cho bạn.'
            : 'Giờ lấy đã gần nên đơn này sẽ không huỷ được sau khi đặt.'
        }
        icon={HomeIcons.cancelWindow}
        title={
          canCancel && cancelDeadline !== null
            ? `Huỷ miễn phí tới ${formatTimeOfDay(new Date(cancelDeadline))}`
            : 'Không huỷ được'
        }
      />
      <InfoRow
        description="Quá giờ lấy 30 phút mà chưa nhận, đơn bị tính là bỏ lỡ. Bỏ lỡ 3 lần trong 30 ngày thì 2 tuần sau đó cần chuyển khoản trước khi đặt."
        icon={HomeIcons.clock}
        title="Nhớ đến đúng giờ"
      />
    </Card>
  );
}

function InfoRow({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
        <Icon name={icon} color={theme.primary} size={18} />
      </View>
      <View style={styles.copy}>
        <AppText variant="body" weight="bold">
          {title}
        </AppText>
        <AppText tone="textSecondary" variant="bodySm">
          {description}
        </AppText>
      </View>
    </View>
  );
}

type ReservedNoticeProps = {
  storeName: string;
  slotLabel: string | undefined;
  total: number;
};

/** Báo đặt thành công ngay trên thanh đặt, kèm việc cần làm tiếp để khách khỏi phải đoán. */
export function ReservedNotice({ storeName, slotLabel, total }: ReservedNoticeProps) {
  const theme = useTheme();

  return (
    <View accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Card gap="xs" padding="md" radius="lg" tone="soft">
        <View style={styles.noticeTitle}>
          <Icon name={HomeIcons.success} color={theme.primary} size={22} />
          <AppText variant="bodyLg" weight="heavy">
            Đã giữ chỗ cho bạn!
          </AppText>
        </View>
        <AppText variant="bodySm">
          {slotLabel ? `Đến ${storeName} lúc ${slotLabel}` : `Đến ${storeName} trong giờ lấy`}, mở
          mã nhận món cho quán quét và trả {formatPrice(total)}.
        </AppText>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  copy: { flex: 1, gap: Spacing.xxs },
  noticeTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
