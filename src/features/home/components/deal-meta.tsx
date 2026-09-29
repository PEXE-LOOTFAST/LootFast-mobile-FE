import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

type DealMetaProps = {
  icon: IconName;
  label: string;
};

export function DealMeta({ icon, label }: DealMetaProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Icon name={icon} color={theme.textSecondary} size={15} />
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { fontSize: 13, fontWeight: '600' },
});
