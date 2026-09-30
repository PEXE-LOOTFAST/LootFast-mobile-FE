import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { useAdminDemo } from '@/demo/use-demo';
import { MaxContentWidth } from '@/constants/theme';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { AdminStatCard } from '@/features/admin/components/admin-stat-card';
import { PlatformSalesChartCard } from '@/features/admin/components/platform-sales-chart-card';
import { RecentAlertsCard } from '@/features/admin/components/recent-alerts-card';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useTheme } from '@/hooks/use-theme';

export function AdminOverviewScreen() {
  const theme = useTheme();
  // Chốt ngày lúc mount để dòng ngày trên header không nhảy giữa các lần render.
  const [today] = useState(() => new Date());
  // Số liệu tính thẳng từ dữ liệu demo: duyệt hay khoá một quán là các ô này đổi ngay.
  const { stats, dailySales, salesGrowth, alerts } = useAdminDemo();

  useLightStatusBar();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trung tâm thông báo của admin sẽ làm ở nhánh riêng, tạm báo trước. */}
        <AdminHeader
          date={today}
          hasUnread={alerts.length > 0}
          onPressNotifications={() => Alert.alert('Thông báo', 'Trung tâm thông báo sẽ sớm có.')}
        />

        <View style={styles.body}>
          <View style={styles.stats}>
            {stats.map((stat) => (
              <AdminStatCard key={stat.id} stat={stat} />
            ))}
          </View>

          <PlatformSalesChartCard daily={dailySales} growth={salesGrowth} />
          <RecentAlertsCard alerts={alerts} />
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
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
