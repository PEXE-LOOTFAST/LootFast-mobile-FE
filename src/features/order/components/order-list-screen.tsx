import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ApiPendingCard } from '@/components/ui/api-pending-card';
import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { OrderHeader } from '@/features/order/components/order-header';
import { useTheme } from '@/hooks/use-theme';

/**
 * Đơn của người mua. Backend mới có `POST /orders`, `GET /orders/{id}` và huỷ đơn — chưa có
 * endpoint liệt kê đơn theo người dùng, nên màn chưa dựng được danh sách.
 *
 * Phần giao diện đã sẵn sàng cho lúc có API: `order-card` (một đơn, kèm nút huỷ và mã nhận
 * món), `order-status-tabs` (lọc theo trạng thái), `savings-summary-card` / `savings-stats-card`
 * cùng `use-order-savings` (thống kê tiền tiết kiệm). Huỷ đơn đã có sẵn `useCancelOrder`
 * trong `@/features/order/api/use-orders`.
 */
export function OrderListScreen() {
  const theme = useTheme();

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
        <OrderHeader />

        <View style={styles.body}>
          <ApiPendingCard feature="Danh sách đơn đã đặt và thống kê tiết kiệm" />
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
});
