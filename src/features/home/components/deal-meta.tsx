import { StyleSheet, Text, View } from 'react-native';

import { HomeIcon } from '@/features/home/components/home-icon';
import type { HomeIconName } from '@/features/home/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type DealMetaProps = {
  icon: HomeIconName;
  label: string;
};

export function DealMeta({ icon, label }: DealMetaProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <HomeIcon name={icon} color={theme.textSecondary} size={15} />
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { fontSize: 13, fontWeight: '600' },
});
