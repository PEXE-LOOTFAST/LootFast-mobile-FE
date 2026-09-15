import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { DealCategory, DealCategoryId } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';

type CategoryChipsProps = {
  categories: DealCategory[];
  selectedId: DealCategoryId;
  onSelect: (id: DealCategoryId) => void;
};

export function CategoryChips({ categories, selectedId, onSelect }: CategoryChipsProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => {
        const isSelected = category.id === selectedId;

        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(category.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? theme.primary : theme.background,
                borderColor: isSelected ? theme.primary : theme.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: isSelected ? theme.background : theme.text }]}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingHorizontal: 14 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 },
  label: { fontSize: 14, fontWeight: '700' },
});
