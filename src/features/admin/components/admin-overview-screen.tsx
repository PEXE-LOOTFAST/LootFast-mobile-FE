import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ApiPendingCard } from '@/components/ui/api-pending-card';
import { MaxContentWidth } from '@/constants/theme';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useTheme } from '@/hooks/use-theme';

/**
 * Tổng quan toàn sàn. Backend chưa có endpoint thống kê nào (chỉ có nhóm
 * /admin/merchant-applications), nên màn không hiển thị số liệu thay vì bịa dữ liệu mẫu.
 *
 * Giao diện các thẻ số liệu, biểu đồ 7 ngày và danh sách cảnh báo đã dựng sẵn ở
 * `admin-stat-card`, `platform-sales-chart-card` và `recent-alerts-card` — khi có API chỉ
 * cần đổ dữ liệu vào ba thành phần đó.
 */
export function AdminOverviewScreen() {
  const theme = useTheme();
  // Chốt ngày lúc mount để dòng ngày trên header không nhảy giữa các lần render.
  const [today] = useState(() => new Date());

  useLightStatusBar();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Trung tâm thông báo của admin sẽ làm ở nhánh riêng, tạm báo trước. */}
      <AdminHeader
        date={today}
        hasUnread={false}
        onPressNotifications={() => Alert.alert('Thông báo', 'Trung tâm thông báo sẽ sớm có.')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <ApiPendingCard feature="Số liệu toàn sàn, biểu đồ doanh thu và cảnh báo" />
        </View>
      </ScrollView>
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
});
