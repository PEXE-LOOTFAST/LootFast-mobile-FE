import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { InlineAlert } from '@/components/ui/inline-alert';
import { MaxContentWidth } from '@/constants/theme';
import { toAdminErrorMessage } from '@/features/admin/api/admin-error-messages';
import {
  REPORT_PERIODS,
  useSystemReport,
  type ReportPeriod,
  type SystemReportDto,
} from '@/features/admin/api/system-report';
import { AdminHeader } from '@/features/admin/components/admin-header';
import { AdminStatCard } from '@/features/admin/components/admin-stat-card';
import { PlatformSalesChartCard } from '@/features/admin/components/platform-sales-chart-card';
import { RecentAlertsCard } from '@/features/admin/components/recent-alerts-card';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import type { AdminAlert, AdminStat } from '@/features/admin/types';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

// Mô tả khoảng thời gian trong caption các ô số liệu theo kỳ admin đang chọn.
const PERIOD_CAPTION: Record<ReportPeriod, { newAccounts: string; range: string }> = {
  week: { newAccounts: 'mới trong tuần', range: '7 ngày gần nhất' },
  month: { newAccounts: 'mới trong tháng', range: '30 ngày gần nhất' },
  year: { newAccounts: 'mới trong năm', range: '365 ngày gần nhất' },
};

function toStats(report: SystemReportDto, period: ReportPeriod): AdminStat[] {
  const caption = PERIOD_CAPTION[period];

  return [
    {
      id: 'stores',
      label: 'Quán đã duyệt',
      value: String(report.stores.approvedStores),
      caption: `Tổng ${report.stores.totalStores} quán`,
      icon: 'store',
      tone: 'primary',
    },
    {
      id: 'accounts',
      label: 'Tài khoản',
      value: String(report.accounts.totalAccounts),
      caption: `${report.accounts.newAccounts} ${caption.newAccounts}`,
      icon: 'people',
      tone: 'accent',
    },
    {
      id: 'orders',
      label: 'Đơn hoàn thành',
      value: String(report.completedOrders),
      caption: caption.range,
      icon: 'food',
      tone: 'primary',
    },
    {
      id: 'value',
      label: 'Giá trị giao dịch',
      value: formatPrice(report.completedTransactionValue),
      caption: 'Của các quán, không phải doanh thu sàn',
      icon: 'wallet',
      tone: 'accent',
    },
  ];
}

// Backend không có danh sách cảnh báo, nên chỉ nêu hai việc admin còn phải xử lý.
function toAlerts(report: SystemReportDto): AdminAlert[] {
  const alerts: AdminAlert[] = [];

  if (report.stores.pendingApplications > 0) {
    alerts.push({
      id: 'pending',
      kind: 'warning',
      message: `${report.stores.pendingApplications} hồ sơ quán đang chờ duyệt`,
      timeLabel: 'Hiện tại',
    });
  }
  if (report.accounts.lockedAccounts > 0) {
    alerts.push({
      id: 'locked',
      kind: 'info',
      message: `${report.accounts.lockedAccounts} tài khoản đang bị khoá`,
      timeLabel: 'Hiện tại',
    });
  }

  return alerts;
}

// Mức tăng của 3 ngày gần nhất so với 3 ngày liền trước; trước đó bằng 0 thì coi như không đổi.
function toGrowth(counts: number[]) {
  const recent = sum(counts.slice(-3));
  const before = sum(counts.slice(-6, -3));

  return before > 0 ? Math.round(((recent - before) / before) * 100) : 0;
}

// Kỳ năm gộp theo tháng (365 cột li ti thì không đọc được); tuần/tháng giữ nguyên theo ngày.
function toChartPoints(daily: SystemReportDto['daily'], period: ReportPeriod) {
  if (period !== 'year') {
    return daily.map((day) => ({
      key: day.date,
      label: `${day.date.slice(8, 10)}/${day.date.slice(5, 7)}`,
      count: day.discountedPortions,
    }));
  }

  const byMonth = new Map<string, number>();
  for (const day of daily) {
    const month = day.date.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + day.discountedPortions);
  }

  return [...byMonth].map(([month, count]) => ({
    key: month,
    label: `T${Number(month.slice(5, 7))}`,
    count,
  }));
}

/** Tổng quan toàn sàn, đọc từ GET /admin/reports/overview của 7 ngày gần nhất. */
export function AdminOverviewScreen() {
  const theme = useTheme();
  // Chốt ngày lúc mount để dòng ngày trên header không nhảy giữa các lần render.
  const [today] = useState(() => new Date());
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const report = useSystemReport(period);

  useLightStatusBar();

  const data = report.data;
  const points = data ? toChartPoints(data.daily, period) : [];
  const unit = period === 'year' ? 'tháng' : 'ngày';

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
          <SegmentedTabs items={REPORT_PERIODS} onChange={setPeriod} value={period} />

          {report.isLoading ? (
            <ActivityIndicator color={theme.primary} size="large" style={styles.loader} />
          ) : report.error || !data ? (
            <View style={styles.errorBlock}>
              <InlineAlert message={toAdminErrorMessage(report.error)} />
              <Pressable
                accessibilityRole="button"
                onPress={() => void report.refetch()}
                style={[styles.retry, { borderColor: theme.border }]}
              >
                <Text style={[styles.retryLabel, { color: theme.primary }]}>Thử lại</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.stats}>
                {toStats(data, period).map((stat) => (
                  <AdminStatCard key={stat.id} stat={stat} />
                ))}
              </View>
              <PlatformSalesChartCard
                daily={points}
                growth={toGrowth(points.map((point) => point.count))}
                range={PERIOD_CAPTION[period].range}
                unit={unit}
              />
              <RecentAlertsCard alerts={toAlerts(data)} />
            </>
          )}
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
  loader: { marginTop: 24 },
  errorBlock: { gap: 10 },
  retry: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryLabel: { fontSize: 14, fontWeight: '800' },
});
