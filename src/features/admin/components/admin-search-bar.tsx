import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
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
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    boxShadow: Shadow.card,
  },
  // Trình duyệt tự vẽ viền focus riêng, chồng lên viền của ô tìm kiếm.
  input: {
    flex: 1,
    height: 46,
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    outlineWidth: 0,
  },
});
