import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ApiPendingCard } from '@/components/ui/api-pending-card';
import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { SellerOverviewHeader } from '@/features/seller/components/seller-overview-header';
import { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import { useTheme } from '@/hooks/use-theme';

/**
 * Tổng quan của người bán. Doanh thu, số đơn và biểu đồ 7 ngày đều cần dữ liệu đơn hàng, mà
 * backend chưa có endpoint đơn cho người bán — chỉ người mua mới đặt và xem đơn của mình.
 *
 * Các thành phần hiển thị đã dựng sẵn: `metric-card`, `weekly-performance-card`,
 * `weekly-summary-card`, `upcoming-pickup-card`, `history-insight-card`, và `use-seller-overview`
 * lo phần tính toán khi có danh sách deal + đơn.
 */
export function SellerOverviewScreen() {
  const theme = useTheme();
  const [today] = useState(() => new Date());
  const { profile } = useMerchantShop();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SellerOverviewHeader
          date={today}
          isVerified={profile !== undefined}
          onPressCreateDeal={() => router.navigate('/seller/new-deal')}
          shopName={profile?.storeName ?? '—'}
        />

        <View style={styles.body}>
          <ApiPendingCard feature="Doanh thu, số đơn hôm nay và hiệu quả 7 ngày" />
        </View>
      </ScrollView>

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
});
