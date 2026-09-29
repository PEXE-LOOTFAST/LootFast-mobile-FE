import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { AdminIcons } from '@/features/admin/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type AdminSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function AdminSearchBar({ value, onChange, placeholder }: AdminSearchBarProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.bar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Icon name={AdminIcons.search} color={theme.textSecondary} size={17} />
      <TextInput
        accessibilityLabel={placeholder}
        autoCorrect={false}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        returnKeyType="search"
        style={[styles.input, { color: theme.text }]}
        value={value}
      />
      {value ? (
        <Pressable
          accessibilityLabel="Xoá từ khoá"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChange('')}
        >
          <Icon name={AdminIcons.clear} color={theme.textSecondary} size={17} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    boxShadow: '0px 4px 14px rgba(23, 33, 27, 0.06)',
  },
  // Trình duyệt tự vẽ viền focus riêng, chồng lên viền của ô tìm kiếm.
  input: { flex: 1, height: 46, fontSize: 14, fontWeight: '500', outlineWidth: 0 },
});
