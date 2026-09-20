import { StyleSheet, Text, View } from 'react-native';

import type { DailySale } from '@/features/seller/hooks/use-seller-overview';
import { useTheme } from '@/hooks/use-theme';

const CHART_HEIGHT = 150;
const GRID_LINES = 4;

// Biểu đồ số phần bán ra mỗi ngày trong 7 ngày gần nhất. Quán chưa có đơn thì chỉ còn
// lưới kẻ và một dòng trống — cố ý giữ khung để người bán thấy chỗ dữ liệu sẽ xuất hiện.
export function WeeklyPerformanceCard({ daily }: { daily: DailySale[] }) {
  const theme = useTheme();
  const max = Math.max(...daily.map((day) => day.portions), 0);

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            Hiệu suất 7 ngày
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Deal bán mỗi ngày</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.badgeText, { color: theme.primary }]}>Tuần này</Text>
        </View>
      </View>

      <View style={styles.plot}>
        <View style={styles.grid}>
          {Array.from({ length: GRID_LINES }, (_, index) => (
            <View key={index} style={[styles.gridLine, { borderColor: theme.border }]} />
          ))}
        </View>

        {max > 0 ? (
          <View style={styles.bars}>
            {daily.map((day) => (
              <View key={day.key} style={styles.barSlot}>
                <View
                  style={[
                    styles.bar,
                    { height: (day.portions / max) * CHART_HEIGHT, backgroundColor: theme.primary },
                  ]}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Chưa có phần nào bán ra trong 7 ngày qua
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
  card: { gap: 12, borderWidth: 1, borderRadius: 20, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '600' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 11, fontWeight: '800' },
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
  bar: { width: 16, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  empty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  emptyText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  xAxis: { flexDirection: 'row' },
  xLabel: { flex: 1, fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
