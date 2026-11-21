import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useScrollFocusedIntoView } from '@/components/ui/keyboard-aware-scroll-view';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * `default` cho các màn đăng nhập/đăng ký (ô cao, nhãn in hoa);
 * `compact` cho form dài của người bán, để nhiều ô vẫn gọn trong một màn.
 */
export type TextFieldSize = 'default' | 'compact';

export type TextFieldProps = TextInputProps & {
  label?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  error?: string;
  size?: TextFieldSize;
};

export function TextField({
  label,
  leading,
  trailing,
  error,
  size = 'default',
  style,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const scrollFocusedIntoView = useScrollFocusedIntoView();

  const variant = size === 'compact' ? compact : comfortable;
  const borderColor = error ? theme.danger : isFocused ? theme.primary : theme.border;

  return (
    <View style={variant.container}>
      {label ? (
        <AppText style={variant.label} variant="footnote" weight="bold">
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          variant.field,
          { backgroundColor: theme.backgroundElement, borderColor },
          isFocused && { boxShadow: `0px 0px 0px 3px ${theme.primarySoft}` },
        ]}
      >
        {leading}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          {...inputProps}
          onFocus={(event) => {
            setIsFocused(true);
            // Chuyển sang ô khác khi bàn phím đang mở thì bàn phím không "hiện lại", nên tự gọi cuộn.
            scrollFocusedIntoView?.();
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          style={[variant.input, { color: theme.text }, style]}
        />
        {trailing}
      </View>

      {error ? (
        <AppText tone="danger" variant="footnote" weight="medium">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const comfortable = StyleSheet.create({
  container: { gap: Spacing.sm },
  label: { letterSpacing: 1, textTransform: 'uppercase' },
  field: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
  },
  // Trình duyệt tự vẽ viền focus riêng, chồng lên viền focus của field.
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.regular,
    outlineWidth: 0,
  },
});

const compact = StyleSheet.create({
  container: { gap: Spacing.sm },
  label: { textTransform: 'none' },
  field: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.regular,
    outlineWidth: 0,
  },
});
