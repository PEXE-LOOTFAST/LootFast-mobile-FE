import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CategoryChips } from '@/features/home/components/category-chips';
import { HomeIcon } from '@/features/home/components/home-icon';
import { HomeIcons } from '@/features/home/constants/icons';
import type { DealCategory, DealCategoryId } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';

type SearchPanelProps = {
  radiusKm: number;
  query: string;
  onChangeQuery: (query: string) => void;
  categories: DealCategory[];
  selectedCategoryId: DealCategoryId;
  onSelectCategory: (id: DealCategoryId) => void;
  onPressRadius?: () => void;
};

export function SearchPanel({
  radiusKm,
  query,
  onChangeQuery,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onPressRadius,
}: SearchPanelProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <View style={styles.row}>
        <Pressable
          accessibilityLabel={`Bán kính tìm kiếm ${radiusKm} km`}
          accessibilityRole="button"
          onPress={onPressRadius}
          style={[styles.radius, { backgroundColor: theme.primarySoft }]}
        >
          <HomeIcon name={HomeIcons.location} color={theme.primary} size={16} />
          <Text style={[styles.radiusText, { color: theme.text }]}>{radiusKm}km</Text>
          <HomeIcon name={HomeIcons.chevronDown} color={theme.textSecondary} size={16} />
        </Pressable>

        <View
          style={[styles.search, { backgroundColor: theme.background, borderColor: theme.border }]}
        >
          <HomeIcon name={HomeIcons.search} color={theme.textSecondary} />
          <TextInput
            accessibilityLabel="Tìm món hoặc quán"
            autoCorrect={false}
            onChangeText={onChangeQuery}
            placeholder="Tìm món hoặc quán"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="search"
            style={[styles.input, { color: theme.text }]}
            value={query}
          />
          {query ? (
            <Pressable
              accessibilityLabel="Xoá từ khoá"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => onChangeQuery('')}
            >
              <HomeIcon name={HomeIcons.clear} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <CategoryChips
        categories={categories}
        onSelect={onSelectCategory}
        selectedId={selectedCategoryId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 14,
    boxShadow: '0px 12px 30px rgba(23, 33, 27, 0.10)',
  },
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 14 },
  radius: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 23,
    paddingHorizontal: 12,
  },
  radiusText: { fontSize: 14, fontWeight: '700' },
  search: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 23,
    paddingHorizontal: 14,
  },
  // Trình duyệt tự vẽ viền focus riêng, lệch khỏi khung bo tròn của ô tìm kiếm.
  input: { flex: 1, minWidth: 0, height: 44, fontSize: 14, outlineWidth: 0 },
});
