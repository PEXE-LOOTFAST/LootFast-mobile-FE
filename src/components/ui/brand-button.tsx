import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type BrandButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
};

export function BrandButton({ children, onPress, variant = 'primary' }: BrandButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? theme.primary : theme.primarySoft,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: isPrimary ? '#FFFFFF' : theme.primary }]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  label: { fontSize: 16, fontWeight: '700' },
});
