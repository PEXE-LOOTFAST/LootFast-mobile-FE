import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';
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
    primary: { background: theme.primary, border: theme.primary, label: theme.onPrimary },
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
        <AppText color={palette.label} variant="subtitle" weight="bold">
          {children}
        </AppText>
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
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
  },
  elevated: { boxShadow: Shadow.brand },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
});
