import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

type DealMetaProps = {
  icon: IconName;
  label: string;
  /** Cỡ nhỏ cho thẻ deal dạng danh sách gọn. */
  compact?: boolean;
};

export function DealMeta({ icon, label, compact = false }: DealMetaProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Icon name={icon} color={theme.textSecondary} size={compact ? 13 : 15} />
      <Text style={[styles.label, { color: theme.textSecondary }, compact && styles.labelCompact]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { fontSize: 13, fontWeight: '600' },
  labelCompact: { fontSize: 12 },
});
