import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { DealQuotaCard } from '@/features/seller/components/deal-quota-card';
import { IncomingOrderFilters } from '@/features/seller/components/incoming-order-filters';
import { IncomingOrdersPanel } from '@/features/seller/components/incoming-orders-panel';
import { SegmentedTabs } from '@/features/seller/components/segmented-tabs';
import { SellerDealCard } from '@/features/seller/components/seller-deal-card';
import { SellerEmptyCard } from '@/features/seller/components/seller-empty-card';
import { SellerOrderHeader } from '@/features/seller/components/seller-order-header';
import { SELLER_ORDER_TABS } from '@/features/seller/constants/seller-order-tabs';
import {
  MOCK_SELLER_DEALS,
  MOCK_SELLER_ORDERS,
  MOCK_SELLER_PLAN,
} from '@/features/seller/data/mock-seller-shop';
import { useSellerOrderBoard } from '@/features/seller/hooks/use-seller-order-board';
import type { SellerOrderTab } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';

export function SellerOrderScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<SellerOrderTab>('incoming');
  const board = useSellerOrderBoard(MOCK_SELLER_DEALS, MOCK_SELLER_ORDERS);
  const runningDeals = MOCK_SELLER_DEALS.filter((deal) => deal.status === 'running');
  const endedDeals = MOCK_SELLER_DEALS.filter((deal) => deal.status === 'ended');

  // Header nền xanh đậm cần icon status bar màu sáng, trả về 'auto' khi rời màn.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Máy quét QR sẽ được nối ở nhánh riêng, tạm báo cho người bán biết. */}
        <SellerOrderHeader
          onPressScan={() => Alert.alert('Quét QR', 'Tính năng quét mã sẽ sớm có.')}
        />

        <View style={styles.body}>
          <SegmentedTabs items={SELLER_ORDER_TABS} onChange={setTab} value={tab} />

          {tab === 'incoming' ? (
            <>
              <IncomingOrderFilters
                code={board.code}
                date={board.date}
                isToday={board.isToday}
                onChangeCode={board.setCode}
                onChangeDate={board.setDate}
                onPressToday={board.resetToToday}
                onSubmitCode={() =>
                  Alert.alert('Mã lấy hàng', `Chưa tìm thấy đơn với mã ${board.code}.`)
                }
              />
              <IncomingOrdersPanel
                bucket={board.bucket}
                counts={board.counts}
                onChangeBucket={board.setBucket}
                orders={board.visibleOrders}
              />
            </>
          ) : null}

          {tab === 'running' ? (
            <>
              <DealQuotaCard
                onPressPlan={() =>
                  router.navigate({ pathname: '/premium', params: { from: '/seller/orders' } })
                }
                plan={MOCK_SELLER_PLAN}
              />

              {runningDeals.length > 0 ? (
                <View style={styles.deals}>
                  {runningDeals.map((deal) => (
                    <SellerDealCard
                      key={deal.id}
                      deal={deal}
                      onChangePortionsLeft={(value) => board.setPortionsLeftOf(deal.id, value)}
                      onPressDetail={() =>
                        Alert.alert('Chi tiết deal', `Màn chi tiết "${deal.name}" sẽ sớm có.`)
                      }
                      onPressPause={() =>
                        Alert.alert('Tạm dừng deal', `Tạm dừng "${deal.name}" sẽ sớm có.`)
                      }
                      portionsLeft={board.portionsLeftOf(deal)}
                    />
                  ))}
                </View>
              ) : (
                <SellerEmptyCard
                  description="Đăng deal đầu tiên để khách quanh đây thấy quán của bạn."
                  title="Chưa có deal đang chạy"
                />
              )}
            </>
          ) : null}

          {tab === 'ended' ? (
            endedDeals.length > 0 ? (
              <View style={styles.deals}>
                {endedDeals.map((deal) => (
                  <SellerDealCard
                    key={deal.id}
                    deal={deal}
                    onChangePortionsLeft={(value) => board.setPortionsLeftOf(deal.id, value)}
                    onPressDetail={() =>
                      Alert.alert('Chi tiết deal', `Màn chi tiết "${deal.name}" sẽ sớm có.`)
                    }
                    onPressPause={() => undefined}
                    portionsLeft={board.portionsLeftOf(deal)}
                  />
                ))}
              </View>
            ) : (
              <SellerEmptyCard
                description="Deal hết hàng hoặc hết hạn sẽ xuất hiện tại đây."
                title="Chưa có deal đã kết thúc"
              />
            )
          ) : null}
        </View>
      </ScrollView>

      {/* Nâng lên trên thanh tab người bán để nút trợ lý không đè lên nút Đăng deal. */}
      <AssistantFab bottomOffset={96} />
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
    marginTop: 14,
    paddingHorizontal: 16,
  },
  deals: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
