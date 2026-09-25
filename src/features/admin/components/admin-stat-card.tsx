import { StyleSheet, Text, View } from 'react-native';

import { AdminIcons } from '@/features/admin/constants/icons';
import type { AdminStat } from '@/features/admin/types';
import { HomeIcon } from '@/features/home/components/home-icon';
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
        <HomeIcon name={AdminIcons[stat.icon]} color={color} size={18} />
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
    gap: 12,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    boxShadow: '0px 4px 14px rgba(23, 33, 27, 0.06)',
  },
  iconBadge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  value: { fontSize: 26, fontWeight: '900', letterSpacing: -0.8 },
  copy: { gap: 2 },
  label: { fontSize: 14, fontWeight: '800' },
  caption: { fontSize: 12, fontWeight: '600' },
});
