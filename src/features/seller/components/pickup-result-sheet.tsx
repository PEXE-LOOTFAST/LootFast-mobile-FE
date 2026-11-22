import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { UiIcons } from '@/constants/icons';
import { Radius, Spacing, StaticColors } from '@/constants/theme';
import { PICKUP_CODE_PREFIX, type MerchantOrderDto } from '@/features/seller/api/merchant-orders';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

export type PickupResult =
  | { status: 'pending'; code: string }
  | { status: 'success'; code: string; order: MerchantOrderDto }
  | { status: 'error'; code: string; message: string };

type PickupResultSheetProps = {
  result: PickupResult | null;
  onClose: () => void;
  /** Có thì hiện nút quét tiếp / quét lại (luồng quét QR); nhập tay thì không cần. */
  onScanAgain?: () => void;
};

/**
 * Kết quả xác nhận nhận món hiện to giữa màn, ở lại tới khi người bán bấm đóng. Toast vài giây
 * không đủ: lúc quầy đông, người bán cần nhìn lại được phải giao món gì, mấy phần, có thu tiền
 * mặt hay không. Backend bắt đơn chuyển khoản xác nhận tiền trước khi giao, nên đơn giao được mà
 * trả chuyển khoản là đã thu xong.
 */
export function PickupResultSheet({ result, onClose, onScanAgain }: PickupResultSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isPending = result?.status === 'pending';

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={isPending ? undefined : onClose}
      statusBarTranslucent
      transparent
      visible={result !== null}
    >
      <View
        style={[
          styles.overlay,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        <View style={[StyleSheet.absoluteFill, styles.backdrop]} />

        {result ? (
          <View
            accessibilityLiveRegion="polite"
            style={[styles.card, { backgroundColor: theme.backgroundElement }]}
          >
            <AppText align="center" tone="textSecondary" variant="footnote" weight="bold">
              Mã {PICKUP_CODE_PREFIX}
              {result.code}
            </AppText>

            {result.status === 'pending' ? (
              <View style={styles.center}>
                <ActivityIndicator color={theme.primary} size="large" />
                <AppText align="center" variant="bodyLg" weight="bold">
                  Đang xác nhận…
                </AppText>
              </View>
            ) : null}

            {result.status === 'success' ? <SuccessBody order={result.order} /> : null}

            {result.status === 'error' ? (
              <View style={styles.center}>
                <View style={[styles.statusIcon, { backgroundColor: theme.danger }]}>
                  <Icon name={UiIcons.warning} color={theme.onDanger} size={30} />
                </View>
                <AppText accessibilityRole="header" align="center" variant="title" weight="heavy">
                  Chưa giao được
                </AppText>
                <AppText align="center" tone="textSecondary">
                  {result.message}
                </AppText>
              </View>
            ) : null}

            {isPending ? null : (
              <View style={styles.actions}>
                {onScanAgain ? (
                  <BrandButton onPress={onScanAgain}>
                    {result.status === 'success' ? 'Quét mã tiếp' : 'Quét lại'}
                  </BrandButton>
                ) : null}
                <BrandButton onPress={onClose} variant={onScanAgain ? 'outline' : 'primary'}>
                  {result.status === 'success' ? 'Xong' : 'Đóng'}
                </BrandButton>
              </View>
            )}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function SuccessBody({ order }: { order: MerchantOrderDto }) {
  const theme = useTheme();
  const isCash = order.paymentMethod === 'CASH';

  return (
    <View style={styles.center}>
      <View style={[styles.statusIcon, { backgroundColor: theme.primary }]}>
        <Icon name={UiIcons.success} color={theme.onPrimary} size={30} />
      </View>
      <AppText accessibilityRole="header" align="center" variant="title" weight="heavy">
        Giao cho khách
      </AppText>
      <AppText align="center" variant="headline" weight="heavy">
        {order.dealName} × {order.quantity}
      </AppText>

      <View
        style={[styles.payment, { backgroundColor: isCash ? theme.accent : theme.primarySoft }]}
      >
        <AppText
          align="center"
          tone={isCash ? 'onAccent' : 'primary'}
          variant="bodyLg"
          weight="heavy"
        >
          {isCash
            ? `Thu ${formatPrice(order.totalAmount)} tiền mặt`
            : `Đã chuyển khoản ${formatPrice(order.totalAmount)}, không thu thêm`}
        </AppText>
      </View>
    </View>
  );
}

// Nền mờ cố ý không bấm được để đóng: chạm nhầm lúc quầy đông sẽ làm mất kết quả chưa kịp đọc.
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  backdrop: { backgroundColor: StaticColors.backdrop },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: Spacing.lg,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
  },
  center: { alignItems: 'center', gap: Spacing.sm },
  statusIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  payment: {
    alignSelf: 'stretch',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  actions: { gap: Spacing.sm },
});
