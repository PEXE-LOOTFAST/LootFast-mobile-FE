import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeIcon } from '@/features/home/components/home-icon';
import { OrderIcons } from '@/features/order/constants/icons';
import type { DailySaving } from '@/features/order/hooks/use-order-savings';
import type { SavingsView } from '@/features/order/types';
import { useTheme } from '@/hooks/use-theme';

type SavingsStatsCardProps = {
  daily: DailySaving[];
  view: SavingsView;
  onChangeView: (view: SavingsView) => void;
  onPressBenefits: () => void;
};

const VIEW_OPTIONS: { id: SavingsView; label: string }[] = [
  { id: 'week', label: 'Theo tuần' },
  { id: 'category', label: 'Theo danh mục' },
];

const CHART_HEIGHT = 170;
const GRID_LINES = 4;

const formatThousands = (amount: number) => `${Math.round(amount / 1000)}k`;

function BenefitsButton({ onPress, compact }: { onPress: () => void; compact?: boolean }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.benefitsButton,
        compact && styles.benefitsButtonCompact,
        { backgroundColor: theme.primary },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.benefitsLabel}>Xem quyền lợi</Text>
      <HomeIcon name={OrderIcons.arrowUpRight} color="#FFFFFF" size={13} />
    </Pressable>
  );
}

// Gói miễn phí chỉ xem được tổng tiết kiệm; biểu đồ chi tiết bị làm mờ và khoá sau lớp phủ
// mời nâng cấp lên Cao cấp.
export function SavingsStatsCard({
  daily,
  view,
  onChangeView,
  onPressBenefits,
}: SavingsStatsCardProps) {
  const theme = useTheme();
  const max = Math.max(...daily.map((day) => day.amount), 0);

  return (
    <View style={[styles.card, { borderColor: theme.primarySoft }]}>
      <View style={[styles.tint, { backgroundColor: theme.primarySoft }]} />

      <View style={styles.topRow}>
        <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>THỐNG KÊ TIẾT KIỆM</Text>
        <View
          style={[
            styles.freeBadge,
            { backgroundColor: theme.backgroundElement, borderColor: theme.primarySoft },
          ]}
        >
          <Text style={[styles.freeBadgeText, { color: theme.primary }]}>MIỄN PHÍ</Text>
        </View>
      </View>

      <View style={styles.headline}>
        <View style={styles.headlineCopy}>
          <Text style={[styles.title, { color: theme.text }]}>
            Miễn phí xem tổng, Cao cấp xem chi tiết
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Xem trước tổng tiết kiệm, mở khóa biểu đồ chi tiết khi nâng cấp.
          </Text>
        </View>
        <BenefitsButton onPress={onPressBenefits} />
      </View>

      <View style={styles.segments}>
        {VIEW_OPTIONS.map((option) => {
          const isActive = option.id === view;

          return (
            <Pressable
              key={option.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChangeView(option.id)}
              style={[
                styles.segment,
                { backgroundColor: isActive ? theme.primary : theme.backgroundSelected },
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  isActive ? styles.segmentLabelActive : { color: theme.textSecondary },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.chartCard,
          { backgroundColor: theme.backgroundElement, borderColor: theme.primarySoft },
        ]}
      >
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            {view === 'week' ? 'Xem trước biểu đồ 7 ngày' : 'Xem trước theo danh mục'}
          </Text>
          <View style={[styles.lockBadge, { backgroundColor: theme.backgroundSelected }]}>
            <HomeIcon name={OrderIcons.lock} color={theme.textSecondary} size={12} />
            <Text style={[styles.lockBadgeText, { color: theme.textSecondary }]}>
              Khóa chi tiết
            </Text>
          </View>
        </View>

        {/* Làm mờ để người dùng gói miễn phí chỉ thấy hình dạng xu hướng, không đọc được số. */}
        <View style={styles.chart}>
          <View style={styles.yAxis}>
            <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>
              {formatThousands(max)}
            </Text>
            <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>0k</Text>
          </View>

          <View style={styles.plot}>
            <View style={[styles.grid, { borderColor: theme.border }]}>
              {Array.from({ length: GRID_LINES }, (_, index) => (
                <View key={index} style={[styles.gridLine, { borderColor: theme.border }]} />
              ))}
            </View>

            <View style={styles.bars}>
              {daily.map((day) => (
                <View key={day.key} style={styles.barSlot}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: max > 0 ? (day.amount / max) * CHART_HEIGHT : 0,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            <View style={styles.xAxis}>
              {daily.map((day) => (
                <Text key={day.key} style={[styles.xLabel, { color: theme.textSecondary }]}>
                  {day.label}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.overlay}>
          <View
            style={[
              styles.unlockCard,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.unlockEyebrow, { color: theme.textSecondary }]}>
              MỞ KHÓA GÓI CAO CẤP
            </Text>
            <Text style={[styles.unlockTitle, { color: theme.text }]}>
              Xem chi tiết theo danh mục và xu hướng từng ngày
            </Text>
            <BenefitsButton compact onPress={onPressBenefits} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', gap: 14, borderWidth: 1, borderRadius: 24, padding: 16 },
  tint: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.45 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
  freeBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  freeBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  headline: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: -8 },
  headlineCopy: { flex: 1, gap: 6 },
  title: { fontSize: 17, fontWeight: '900', lineHeight: 22, letterSpacing: -0.3 },
  description: { fontSize: 12, lineHeight: 17 },
  benefitsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    boxShadow: '0px 6px 14px rgba(22, 121, 75, 0.25)',
  },
  benefitsButtonCompact: { alignSelf: 'center', marginTop: 4 },
  benefitsLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.85 },
  segments: { flexDirection: 'row', gap: 8 },
  segment: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  segmentLabel: { fontSize: 12, fontWeight: '700' },
  segmentLabelActive: { color: '#FFFFFF', fontWeight: '800' },
  chartCard: { overflow: 'hidden', gap: 12, borderWidth: 1, borderRadius: 20, padding: 12 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartTitle: { flexShrink: 1, fontSize: 12, fontWeight: '600' },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockBadgeText: { fontSize: 11, fontWeight: '700' },
  chart: { flexDirection: 'row', gap: 8, opacity: 0.55 },
  yAxis: { height: CHART_HEIGHT + 12, justifyContent: 'space-between' },
  axisLabel: { fontSize: 10, fontWeight: '600' },
  plot: { flex: 1 },
  grid: {
    position: 'absolute',
    top: 6,
    right: 0,
    left: 0,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
    borderLeftWidth: 1,
  },
  gridLine: { borderTopWidth: 1, borderStyle: 'dashed' },
  bars: { height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', marginTop: 6 },
  barSlot: { flex: 1, alignItems: 'center' },
  bar: { width: 14, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  xAxis: { flexDirection: 'row', marginTop: 6 },
  xLabel: { flex: 1, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  unlockCard: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    boxShadow: '0px 12px 28px rgba(23, 33, 27, 0.14)',
  },
  unlockEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  unlockTitle: { fontSize: 14, fontWeight: '800', lineHeight: 20, textAlign: 'center' },
});
