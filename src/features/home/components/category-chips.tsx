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
              { backgroundColor: isSelected ? theme.primary : theme.primarySoft },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? theme.onPrimary : theme.text },
                isSelected && styles.labelSelected,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingHorizontal: 10 },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  label: { fontSize: 13, fontWeight: '600' },
  labelSelected: { fontWeight: '800' },
});
