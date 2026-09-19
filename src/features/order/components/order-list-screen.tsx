import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { OrderCard } from '@/features/order/components/order-card';
import { OrderHeader } from '@/features/order/components/order-header';
import { OrderStatusTabs } from '@/features/order/components/order-status-tabs';
import { SavingsStatsCard } from '@/features/order/components/savings-stats-card';
import { SavingsSummaryCard } from '@/features/order/components/savings-summary-card';
import { MOCK_ORDERS } from '@/features/order/data/mock-orders';
import { useOrderSavings } from '@/features/order/hooks/use-order-savings';
import type { OrderStatus, SavingsView } from '@/features/order/types';
import { PremiumScreen } from '@/features/profile/components/premium-screen';
import { useTheme } from '@/hooks/use-theme';

export function OrderListScreen() {
  const theme = useTheme();
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [savingsView, setSavingsView] = useState<SavingsView>('week');
  const [showPremium, setShowPremium] = useState(false);
  const savings = useOrderSavings(MOCK_ORDERS);
  const orders = MOCK_ORDERS.filter((order) => order.status === status);

  // Header nền xanh đậm cần icon status bar màu sáng, trả về 'auto' khi rời màn.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  if (showPremium) {
    return <PremiumScreen onBack={() => setShowPremium(false)} />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OrderHeader />

        <View style={styles.body}>
          <SavingsSummaryCard total={savings.total} />
          <OrderStatusTabs onChange={setStatus} value={status} />

          {orders.length > 0 ? (
            <View style={styles.orders}>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPressCode={() => Alert.alert('Mã nhận món', order.code)}
                />
              ))}
            </View>
          ) : (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>Chưa có đơn nào.</Text>
          )}

          <SavingsStatsCard
            daily={savings.daily}
            onChangeView={setSavingsView}
            onPressBenefits={() => setShowPremium(true)}
            view={savingsView}
          />
        </View>
      </ScrollView>

      <AssistantFab />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  // Chừa chỗ để phần cuối không bị nút trợ lý nổi che mất.
  content: { paddingBottom: 96 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 16,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  orders: { gap: 14 },
  empty: { paddingVertical: 40, fontSize: 14, textAlign: 'center' },
});
