import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/ui/text-field';
import { useTheme } from '@/hooks/use-theme';

export type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
};

const MAX_VISIBLE = 6;

/**
 * Ô chọn một giá trị trong danh sách có sẵn: bấm vào là gõ để lọc, danh sách hiện ngay bên dưới ô
 * (không popup) nên không bao giờ bị bàn phím che; gõ tự do không chọn thì giữ nguyên giá trị cũ.
 */
export function SelectField({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Chọn',
  error,
  disabled,
  loading,
}: SelectFieldProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const keyword = search.trim().toLowerCase();
  const matches = keyword
    ? options.filter((option) => option.label.toLowerCase().includes(keyword))
    : options;

  return (
    <View style={styles.container}>
      <TextField
        size="compact"
        editable={!disabled}
        error={error}
        label={label}
        onBlur={() => {
          setIsOpen(false);
          setSearch('');
        }}
        onChangeText={(text) => {
          setSearch(text);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={loading ? 'Đang tải…' : value || placeholder}
        style={disabled ? styles.disabled : undefined}
        // Đang gõ thì hiện chữ lọc; không gõ thì hiện giá trị đã chọn.
        value={isOpen ? search : value}
      />

      {isOpen ? (
        <View
          style={[
            styles.list,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          {matches.slice(0, MAX_VISIBLE).map((option) => (
            <Pressable
              accessibilityRole="button"
              key={option.value}
              onPress={() => {
                onSelect(option);
                setIsOpen(false);
                setSearch('');
                Keyboard.dismiss();
              }}
              style={({ pressed }) => [
                styles.option,
                pressed && { backgroundColor: theme.primarySoft },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: theme.text },
                  option.label === value && { color: theme.primary, fontWeight: '800' },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
          {!matches.length ? (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>Không có kết quả</Text>
          ) : matches.length > MAX_VISIBLE ? (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              Gõ thêm để thu hẹp {matches.length - MAX_VISIBLE} kết quả còn lại
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  disabled: { opacity: 0.5 },
  list: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  option: { paddingHorizontal: 14, paddingVertical: 11 },
  optionText: { fontSize: 14, fontWeight: '600' },
  empty: { paddingHorizontal: 14, paddingVertical: 10, fontSize: 12 },
});
