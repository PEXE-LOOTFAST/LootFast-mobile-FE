import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DetailCardProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function DetailCard({ title, action, children }: DetailCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      {title ? (
        <View style={styles.header}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: 14,
    boxShadow: Shadow.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold },
});
