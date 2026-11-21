import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Spacing } from '@/constants/theme';
import type { DealCategory, DealCategoryId } from '@/features/home/types';

type CategoryChipsProps = {
  categories: DealCategory[];
  selectedId: DealCategoryId;
  onSelect: (id: DealCategoryId) => void;
};

export function CategoryChips({ categories, selectedId, onSelect }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={category.label}
          onPress={() => onSelect(category.id)}
          selected={category.id === selectedId}
          variant="soft"
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm, paddingHorizontal: Spacing.sm + Spacing.xxs },
});
