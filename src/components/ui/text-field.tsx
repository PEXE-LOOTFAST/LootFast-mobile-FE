import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

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

  const variant = size === 'compact' ? compact : comfortable;
  const borderColor = error ? theme.danger : isFocused ? theme.primary : theme.border;

  return (
    <View style={variant.container}>
      {label ? <Text style={[variant.label, { color: theme.text }]}>{label}</Text> : null}

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

      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 12, fontWeight: '600' },
});

const comfortable = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  field: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 8,
  },
  // Trình duyệt tự vẽ viền focus riêng, chồng lên viền focus của field.
  input: { flex: 1, minWidth: 0, minHeight: 54, fontSize: 15, outlineWidth: 0 },
});

const compact = StyleSheet.create({
  container: { gap: 7 },
  label: { fontSize: 12, fontWeight: '800' },
  field: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 8,
  },
  input: { flex: 1, minWidth: 0, minHeight: 42, fontSize: 15, outlineWidth: 0 },
});
