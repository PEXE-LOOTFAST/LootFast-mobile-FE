import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { EmptyCard } from '@/components/ui/empty-card';
import { InlineAlert } from '@/components/ui/inline-alert';
import { MaxContentWidth } from '@/constants/theme';
import { toMerchantDealErrorMessage } from '@/features/seller/api/merchant-deals';
import { toMerchantOrderErrorMessage } from '@/features/seller/api/merchant-orders';
import { useConfirmPickup } from '@/features/seller/api/use-merchant-orders';
import {
  toSellerDeal,
  useMerchantDeals,
  useUpdateDealQuantity,
} from '@/features/seller/api/use-merchant-deals';
import { IncomingOrdersSection } from '@/features/seller/components/incoming-orders-section';
import { QrScannerModal } from '@/features/seller/components/qr-scanner-modal';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { SellerDealCard } from '@/features/seller/components/seller-deal-card';
import { SellerHeaderWithAction } from '@/features/seller/components/seller-header';
import { SellerIcons } from '@/features/seller/constants/icons';
import { SELLER_ORDER_TABS } from '@/features/seller/constants/seller-order-tabs';
import type { SellerOrderTab } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';

/**
 * Deal của quán đọc từ `GET /merchants/me/deals`, sửa số suất qua
 * `PATCH /merchants/me/deals/{id}/quantity`.
 *
 * Mục "Đơn hàng đến" đọc từ `GET /merchants/me/orders` — xem `incoming-orders-section`.
 */
export function SellerOrderScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<SellerOrderTab>('incoming');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const dealsQuery = useMerchantDeals();
  const updateQuantity = useUpdateDealQuantity();
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
            onPressPause={() =>
              Alert.alert('Tạm dừng deal', 'Backend chưa có API ẩn hoặc tạm dừng deal.')
            }
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
        onPressAction={() => setIsScannerOpen(true)}
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
                title: 'Chưa có deal đã kết thúc',
                description: 'Deal hết hàng hoặc hết hạn sẽ xuất hiện tại đây.',
              })
            : null}
        </View>
      </KeyboardAwareScrollView>

      <QrScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code) => {
          confirmPickup.mutate(code, {
            onSuccess: (order) => {
              Alert.alert('Xác nhận thành công', `Khách đã nhận món của đơn "${order.dealName}".`);
            },
            onError: (error) => {
              Alert.alert('Không xác nhận được', toMerchantOrderErrorMessage(error));
            },
          });
        }}
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
    marginTop: 16,
    paddingHorizontal: 16,
  },
  loader: { marginTop: 24 },
  deals: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
