import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Popover } from '@/components/ui/popover';
import { IconButton } from '@/features/home/components/icon-button';
import { DISCOUNT_OPTIONS, PICKUP_OPTIONS } from '@/features/home/constants/deals';
import { HomeIcons } from '@/features/home/constants/icons';
import type { DiscountFilter, PickupFilter } from '@/features/home/types';
import { useAnchor } from '@/hooks/use-anchor';
import { useTheme } from '@/hooks/use-theme';

type DealFilterButtonProps = {
  minDiscount: DiscountFilter;
  onChangeDiscount: (value: DiscountFilter) => void;
  pickup: PickupFilter;
  onChangePickup: (value: PickupFilter) => void;
  isActive: boolean;
  isLocked: boolean;
  onPressLocked: () => void;
};

export function DealFilterButton({
  minDiscount,
  onChangeDiscount,
  pickup,
  onChangePickup,
  isActive,
  isLocked,
  onPressLocked,
}: DealFilterButtonProps) {
  const { ref, anchor, open, close } = useAnchor();

  return (
    <>
      <IconButton
        ref={ref}
        accessibilityLabel="Bộ lọc nâng cao"
        icon={HomeIcons.filter}
        isActive={isActive}
        onPress={isLocked ? onPressLocked : open}
      />

      {/* Không tự đóng khi chọn để người dùng chỉnh cả hai nhóm lọc trong một lần mở. */}
      <Popover align="right" anchor={anchor} onClose={close} width={220}>
        <FilterSection
          onChange={onChangeDiscount}
          options={DISCOUNT_OPTIONS}
          title="Mức giảm giá"
          value={minDiscount}
        />
        <FilterSection
          onChange={onChangePickup}
          options={PICKUP_OPTIONS}
          title="Khung giờ lấy"
          value={pickup}
        />
      </Popover>
    </>
  );
}

type FilterSectionProps<T extends string | number> = {
  title: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

function FilterSection<T extends string | number>({
  title,
  options,
  value,
  onChange,
}: FilterSectionProps<T>) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              { backgroundColor: isSelected ? theme.primary : theme.background },
            ]}
          >
            <Text
              style={[
                styles.optionText,
                { color: isSelected ? '#FFFFFF' : theme.text },
                isSelected && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
            {isSelected ? <Icon name={HomeIcons.check} color="#FFFFFF" size={16} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6 },
  title: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  option: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 19,
    paddingHorizontal: 14,
  },
  optionText: { fontSize: 14, fontWeight: '600' },
  optionTextSelected: { fontWeight: '800' },
});
