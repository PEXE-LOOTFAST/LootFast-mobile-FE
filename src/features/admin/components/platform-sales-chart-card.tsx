import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { AdminIcons } from '@/features/admin/constants/icons';
import type { DailyPlatformSales } from '@/features/admin/types';
import { useTheme } from '@/hooks/use-theme';

const CHART_HEIGHT = 130;

type PlatformSalesChartCardProps = {
  daily: DailyPlatformSales[];
  /** Phần trăm tăng/giảm của ba ngày gần nhất so với ba ngày trước đó. */
  growth: number;
};

// Biểu đồ cột số suất deal bán ra mỗi ngày trên toàn sàn, kèm mức tăng gần đây.
export function PlatformSalesChartCard({ daily, growth }: PlatformSalesChartCardProps) {
  const theme = useTheme();
  const max = Math.max(...daily.map((day) => day.count), 0);
  const isUp = growth >= 0;
  const growthColor = isUp ? theme.primary : theme.danger;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          Suất deal bán ra theo ngày
        </Text>
        <View style={styles.growth}>
          {isUp ? <Icon name={AdminIcons.trendUp} color={growthColor} size={14} /> : null}
          <Text style={[styles.growthText, { color: growthColor }]}>
            {`${isUp ? '+' : ''}${growth}%`}
          </Text>
        </View>
      </View>

      <View style={styles.plot}>
        {max > 0 ? (
          daily.map((day) => (
            <View
              key={day.key}
              accessible
              accessibilityLabel={`${day.label}: ${day.count} suất`}
              style={styles.barSlot}
            >
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((day.count / max) * CHART_HEIGHT, 4),
                    // Cột cao nhất tô đậm, các cột còn lại dùng màu nhạt để làm nổi ngày đỉnh.
                    backgroundColor: day.count === max ? theme.primary : theme.primarySoft,
                  },
                ]}
              />
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chưa có suất nào bán ra trong tuần này
            </Text>
          </View>
        )}
      </View>

      <View style={styles.xAxis}>
        {daily.map((day) => (
          <Text key={day.key} style={[styles.xLabel, { color: theme.textSecondary }]}>
            {day.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    boxShadow: '0px 4px 14px rgba(23, 33, 27, 0.06)',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  growth: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  growthText: { fontSize: 12, fontWeight: '800' },
  plot: { height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 },
  barSlot: { flex: 1, alignItems: 'center' },
  bar: { width: 22, borderRadius: 6 },
  empty: { flex: 1, height: CHART_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  xAxis: { flexDirection: 'row' },
  xLabel: { flex: 1, fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
