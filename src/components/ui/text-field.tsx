import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = TextInputProps & {
  label: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  error?: string;
};

export function TextField({
  label,
  leading,
  trailing,
  error,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error ? theme.danger : isFocused ? theme.primary : theme.border;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <View
        style={[
          styles.field,
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
          style={[styles.input, { color: theme.text }, style]}
        />
        {trailing}
      </View>

      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  error: { fontSize: 12, fontWeight: '600' },
});
