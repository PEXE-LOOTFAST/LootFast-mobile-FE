import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { AdminIcons } from '@/features/admin/constants/icons';
import type { AdminStat } from '@/features/admin/types';
import { useTheme } from '@/hooks/use-theme';

// Thẻ số liệu toàn sàn, hai thẻ một hàng: icon tròn ở trên, con số lớn, nhãn và chú thích.
export function AdminStatCard({ stat }: { stat: AdminStat }) {
  const theme = useTheme();
  const isAccent = stat.tone === 'accent';
  const color = isAccent ? theme.accent : theme.primary;
  // Nền nhạt dựng từ màu theme + độ trong suốt để tự khớp cả light lẫn dark mode.
  const softColor = isAccent ? `${theme.accent}33` : theme.primarySoft;

  return (
    <View
      accessible
      accessibilityLabel={`${stat.label}: ${stat.value} ${stat.caption}`}
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={[styles.iconBadge, { backgroundColor: softColor }]}>
        <Icon name={AdminIcons[stat.icon]} color={color} size={18} />
      </View>

      <Text numberOfLines={1} style={[styles.value, { color }]}>
        {stat.value}
      </Text>

      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.label, { color: theme.text }]}>
          {stat.label}
        </Text>
        <Text numberOfLines={1} style={[styles.caption, { color: theme.textSecondary }]}>
          {stat.caption}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexShrink: 1,
    // 50% trừ nửa khoảng cách 12 giữa hai cột.
    flexBasis: '47%',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xxl,
    padding: Spacing.lg,
    boxShadow: Shadow.card,
  },
  iconBadge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  value: { fontSize: FontSize.display, fontWeight: FontWeight.heavy, letterSpacing: -0.8 },
  copy: { gap: Spacing.xxs },
  label: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  caption: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
});
