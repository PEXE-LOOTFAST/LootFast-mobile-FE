import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight } from '@/constants/theme';
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
  label: { fontSize: FontSize.bodySm, fontWeight: FontWeight.medium },
  labelCompact: { fontSize: FontSize.footnote },
});
