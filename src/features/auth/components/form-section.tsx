import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type FormSectionProps = {
  title: string;
  children: ReactNode;
};

export function FormSection({ title, children }: FormSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <View style={[styles.panel, { backgroundColor: theme.background }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  title: { fontSize: 13, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  panel: { gap: 18, borderRadius: 22, padding: 16 },
});
