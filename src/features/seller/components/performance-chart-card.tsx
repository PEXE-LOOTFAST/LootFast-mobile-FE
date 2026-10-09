import { StyleSheet, Text, View } from 'react-native';

import type { DailyPerformance } from '@/features/seller/api/merchant-performance';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

const CHART_HEIGHT = 150;
const GRID_LINES = 4;

const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return WEEKDAY_SHORT[d.getDay()] ?? '';
}

function shortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}`;
}

function pickLabelIndices(count: number, maxLabels: number): Set<number> {
  if (count <= maxLabels) return new Set(Array.from({ length: count }, (_, i) => i));
  const step = (count - 1) / (maxLabels - 1);
  const indices = new Set<number>();
  for (let i = 0; i < maxLabels; i++) {
    indices.add(Math.round(i * step));
  }
  return indices;
}

export function PerformanceChartCard({ daily }: { daily: DailyPerformance[] }) {
  const theme = useTheme();
  const max = Math.max(...daily.map((d) => d.completedRevenue), 1);
  const count = daily.length;
  const barWidth = count <= 10 ? 16 : count <= 20 ? 10 : 6;
  const labelIndices = pickLabelIndices(count, 7);

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            Doanh thu theo ngày
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Doanh thu từ đơn hoàn tất ·{' '}
            {formatPrice(daily.reduce((s, d) => s + d.completedRevenue, 0))}
          </Text>
        </View>
      </View>

      <View style={styles.plot}>
        <View style={styles.grid}>
          {Array.from({ length: GRID_LINES }, (_, i) => (
            <View key={i} style={[styles.gridLine, { borderColor: theme.border }]} />
          ))}
        </View>

        {daily.length > 0 ? (
          <View style={styles.bars}>
            {daily.map((d) => (
              <View key={d.date} style={styles.barSlot}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: barWidth,
                      height: Math.max((d.completedRevenue / max) * CHART_HEIGHT, 2),
                      backgroundColor: d.completedRevenue > 0 ? theme.primary : theme.border,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chưa có dữ liệu doanh thu
            </Text>
          </View>
        )}
      </View>

      <View style={styles.xAxis}>
        {daily.map((d, i) => (
          <View key={d.date} style={styles.xSlot}>
            {labelIndices.has(i) ? (
              <>
                <Text style={[styles.xLabel, { color: theme.textSecondary }]}>
                  {dayLabel(d.date)}
                </Text>
                <Text style={[styles.xDate, { color: theme.textSecondary }]}>
                  {shortDate(d.date)}
                </Text>
              </>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderWidth: 1, borderRadius: 20, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '600' },
  plot: { height: CHART_HEIGHT, justifyContent: 'flex-end' },
  grid: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'space-between',
  },
  gridLine: { borderTopWidth: 1, borderStyle: 'dashed' },
  bars: { height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end' },
  barSlot: { flex: 1, alignItems: 'center' },
  bar: { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  empty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  emptyText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  xAxis: { flexDirection: 'row' },
  xSlot: { flex: 1, alignItems: 'center', minHeight: 24 },
  xLabel: { fontSize: 10, fontWeight: '600' },
  xDate: { fontSize: 8, fontWeight: '500' },
});
