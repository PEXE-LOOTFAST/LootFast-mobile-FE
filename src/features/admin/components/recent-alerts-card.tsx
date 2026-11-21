import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { AdminIcons } from '@/features/admin/constants/icons';
import type { AdminAlert } from '@/features/admin/types';
import { useTheme } from '@/hooks/use-theme';

// Danh sách sự kiện gần đây cần admin để ý: cảnh báo tô cam, thông tin thường tô xanh.
export function RecentAlertsCard({ alerts }: { alerts: AdminAlert[] }) {
  const theme = useTheme();
  const warningSoft = `${theme.accent}33`;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        Cảnh báo gần đây
      </Text>

      {alerts.length > 0 ? (
        alerts.map((alert) => {
          const isWarning = alert.kind === 'warning';

          return (
            <View key={alert.id} style={styles.row}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isWarning ? warningSoft : theme.primarySoft },
                ]}
              >
                <Icon
                  name={isWarning ? AdminIcons.warning : AdminIcons.shieldCheck}
                  color={isWarning ? theme.accent : theme.primary}
                  size={16}
                />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.message, { color: theme.text }]}>{alert.message}</Text>
                <Text style={[styles.time, { color: theme.textSecondary }]}>{alert.timeLabel}</Text>
              </View>
            </View>
          );
        })
      ) : (
        <Text style={[styles.empty, { color: theme.textSecondary }]}>Chưa có cảnh báo nào.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    borderWidth: 1,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    boxShadow: Shadow.card,
  },
  title: { fontSize: FontSize.subtitle, fontWeight: FontWeight.heavy, letterSpacing: -0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBadge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  copy: { flex: 1, gap: Spacing.xxs },
  message: { fontSize: FontSize.body, fontWeight: FontWeight.medium, lineHeight: 19 },
  time: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  empty: { fontSize: FontSize.bodySm, fontWeight: FontWeight.medium },
});
