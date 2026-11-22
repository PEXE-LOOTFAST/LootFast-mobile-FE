import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { EmptyCard } from '@/components/ui/empty-card';
import { InlineAlert } from '@/components/ui/inline-alert';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { toMerchantDealErrorMessage } from '@/features/seller/api/merchant-deals';
import { toMerchantOrderErrorMessage } from '@/features/seller/api/merchant-orders';
import { useConfirmPickup } from '@/features/seller/api/use-merchant-orders';
import {
  toSellerDeal,
  useHideDeal,
  useMerchantDeals,
  useRestoreDeal,
  useUpdateDealQuantity,
} from '@/features/seller/api/use-merchant-deals';
import { IncomingOrdersSection } from '@/features/seller/components/incoming-orders-section';
import {
  PickupResultSheet,
  type PickupResult,
} from '@/features/seller/components/pickup-result-sheet';
import { QrScannerModal } from '@/features/seller/components/qr-scanner-modal';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { SellerDealCard } from '@/features/seller/components/seller-deal-card';
import { SellerHeaderWithAction } from '@/features/seller/components/seller-header';
import { SellerIcons } from '@/features/seller/constants/icons';
import { SELLER_ORDER_TABS } from '@/features/seller/constants/seller-order-tabs';
import type { SellerDeal, SellerOrderTab } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { showToast } from '@/lib/toast';

/**
 * Deal của quán đọc từ `GET /merchants/me/deals`, sửa số suất qua
 * `PATCH /merchants/me/deals/{id}/quantity`.
 *
 * Mục "Đơn hàng đến" đọc từ `GET /merchants/me/orders` — xem `incoming-orders-section`.
 */
export function SellerOrderScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<SellerOrderTab>('incoming');
  // Mở từ ô "Ngay lúc này" ở Báo cáo thì nhảy thẳng tới mục đó. Xoá tham số sau khi dùng để lần sau
  // bấm thanh tab vẫn giữ mục người bán đang xem.
  const { view } = useLocalSearchParams<{ view?: SellerOrderTab }>();
  useFocusEffect(
    useCallback(() => {
      if (!view) return;
      setTab(view);
      router.setParams({ view: undefined });
    }, [view]),
  );
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  // Đổi key mỗi lần mở để máy quét bắt đầu lại từ đầu, không mang trạng thái "đã quét" của lần trước.
  const [scannerKey, setScannerKey] = useState(0);
  const [pickupResult, setPickupResult] = useState<PickupResult | null>(null);
  const dealsQuery = useMerchantDeals();
  const updateQuantity = useUpdateDealQuantity();
  const hideDeal = useHideDeal();
  const restoreDeal = useRestoreDeal();
  const confirmPickup = useConfirmPickup();

  const dealDtos = dealsQuery.data?.items ?? [];
  const deals = dealDtos.map(toSellerDeal);
  const runningDeals = deals.filter((deal) => deal.status === 'running');
  const endedDeals = deals.filter((deal) => deal.status === 'ended');

  // Backend nhận tổng số suất chứ không nhận số còn lại, và bắt gửi kèm version đang giữ để
  // không ghi đè thay đổi của phiên khác.
  const changePortionsLeft = (dealId: string, portionsLeft: number) => {
    const dto = dealDtos.find((item) => item.dealId === dealId);
    if (!dto) return;

    const sold = dto.totalQuantity - dto.remainingQuantity;
    updateQuantity.mutate({
      dealId,
      totalQuantity: Math.max(sold + portionsLeft, sold),
      expectedVersion: dto.version,
    });
  };

  // Tạm dừng = ẩn khỏi người mua; đơn khách đã đặt vẫn giữ nguyên nên quán vẫn phải giao.
  const pauseDeal = (deal: SellerDeal) =>
    confirmAction({
      title: 'Tạm dừng deal này?',
      message: `Khách sẽ không thấy “${deal.name}” nữa. Đơn đã đặt vẫn giữ, quán vẫn giao như bình thường. Bạn mở bán lại được trong giờ bán.`,
      confirmLabel: 'Tạm dừng',
      isDestructive: true,
      onConfirm: () =>
        hideDeal.mutate(deal.id, {
          onSuccess: () => showToast('Đã tạm dừng deal', { tone: 'success' }),
          onError: (error) => showToast(toMerchantDealErrorMessage(error), { tone: 'error' }),
        }),
    });

  const resumeDeal = (deal: SellerDeal) =>
    restoreDeal.mutate(deal.id, {
      onSuccess: () => showToast('Deal đã mở bán lại', { tone: 'success' }),
      onError: (error) => showToast(toMerchantDealErrorMessage(error), { tone: 'error' }),
    });

  const openScanner = () => {
    setPickupResult(null);
    setScannerKey((key) => key + 1);
    setIsScannerOpen(true);
  };

  // Mã QR của khách đã là bằng chứng nhận món nên xác nhận luôn, rồi hiện kết quả to để người bán
  // biết giao món gì và có phải thu tiền không.
  const confirmScannedCode = (code: string) => {
    setPickupResult({ status: 'pending', code });
    confirmPickup.mutate(code, {
      onSuccess: (order) => {
        haptics.success();
        setPickupResult({ status: 'success', code, order });
      },
      onError: (error) => {
        haptics.error();
        setPickupResult({ status: 'error', code, message: toMerchantOrderErrorMessage(error) });
      },
    });
  };

  const renderDeals = (list: typeof deals, empty: { title: string; description: string }) => {
    if (dealsQuery.isLoading) {
      return <ActivityIndicator color={theme.primary} size="large" style={styles.loader} />;
    }
    if (dealsQuery.error) {
      return <InlineAlert message={toMerchantDealErrorMessage(dealsQuery.error)} />;
    }
    if (list.length === 0) return <EmptyCard {...empty} />;

    return (
      <View style={styles.deals}>
        {list.map((deal) => (
          <SellerDealCard
            key={deal.id}
            deal={deal}
            onChangePortionsLeft={(value) => changePortionsLeft(deal.id, value)}
            onPressDetail={() =>
              router.navigate({ pathname: '/seller/deal-images', params: { dealId: deal.id } })
            }
            onPressPause={() => pauseDeal(deal)}
            onPressResume={() => resumeDeal(deal)}
            portionsLeft={Math.max(deal.portionsTotal - deal.portionsSold, 0)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SellerHeaderWithAction
        actionIcon={SellerIcons.qrCode}
        actionLabel="Quét QR"
        onPressAction={openScanner}
        subtitle="Deal đang chạy và đơn đến"
        title="Đơn hàng"
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <SegmentedTabs items={SELLER_ORDER_TABS} onChange={setTab} value={tab} />

          {updateQuantity.error ? (
            <InlineAlert message={toMerchantDealErrorMessage(updateQuantity.error)} />
          ) : null}

          {tab === 'incoming' ? <IncomingOrdersSection /> : null}

          {tab === 'running'
            ? renderDeals(runningDeals, {
                title: 'Chưa có deal đang chạy',
                description: 'Đăng deal đầu tiên để khách quanh đây thấy quán của bạn.',
              })
            : null}

          {tab === 'ended'
            ? renderDeals(endedDeals, {
                title: 'Chưa có deal nào dừng bán',
                description: 'Deal hết hàng, hết giờ hoặc bạn tạm dừng sẽ nằm ở đây.',
              })
            : null}
        </View>
      </KeyboardAwareScrollView>

      <QrScannerModal
        key={scannerKey}
        onClose={() => setIsScannerOpen(false)}
        onScan={confirmScannedCode}
        visible={isScannerOpen}
      />

      <PickupResultSheet
        onClose={() => setPickupResult(null)}
        onScanAgain={openScanner}
        result={pickupResult}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 120 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  loader: { marginTop: Spacing.xxl },
  deals: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
});
