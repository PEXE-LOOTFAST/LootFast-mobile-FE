import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type SellerFormFieldProps = TextInputProps & {
  label?: string;
  trailing?: ReactNode;
  error?: string;
};

// Ô nhập của các form người bán: nhãn thường (không in hoa như TextField của màn đăng nhập)
// và khung thấp hơn để form dài vẫn gọn trong một màn.
export function SellerFormField({
  label,
  trailing,
  error,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: SellerFormFieldProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error ? theme.danger : isFocused ? theme.primary : theme.border;

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.text }]}>{label}</Text> : null}

      <View
        style={[
          styles.field,
          { backgroundColor: theme.backgroundElement, borderColor },
          isFocused && { boxShadow: `0px 0px 0px 3px ${theme.primarySoft}` },
        ]}
      >
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
  // Trình duyệt tự vẽ viền focus riêng, chồng lên viền focus của field.
  input: { flex: 1, minWidth: 0, minHeight: 42, fontSize: 15, outlineWidth: 0 },
  error: { fontSize: 12, fontWeight: '600' },
});
