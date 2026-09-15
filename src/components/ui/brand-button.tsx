import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type BrandButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function BrandButton({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: BrandButtonProps) {
  const theme = useTheme();
  const isInactive = disabled || loading;

  const palette = {
    primary: { background: theme.primary, border: theme.primary, label: '#FFFFFF' },
    secondary: { background: theme.primarySoft, border: theme.primarySoft, label: theme.primary },
    outline: { background: theme.backgroundElement, border: theme.border, label: theme.text },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.background, borderColor: palette.border },
        variant === 'primary' && styles.elevated,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.label} />
      ) : (
        <Text style={[styles.label, { color: palette.label }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  elevated: { boxShadow: '0px 8px 18px rgba(22, 121, 75, 0.25)' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16, fontWeight: '800' },
});
