import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Popover, type PopoverAnchor } from '@/components/ui/popover';
import { RADIUS_OPTIONS_KM } from '@/features/home/constants/deals';
import { useTheme } from '@/hooks/use-theme';
import { formatRadius } from '@/lib/format';

const MENU_WIDTH = 190;
const MENU_PADDING = 12;
const OPTION_GAP = 8;
// Trừ padding hai bên, viền 1px hai bên và khoảng cách giữa hai cột.
const OPTION_WIDTH = (MENU_WIDTH - MENU_PADDING * 2 - 2 - OPTION_GAP) / 2;

type RadiusMenuProps = {
  anchor: PopoverAnchor | null;
  onClose: () => void;
  valueKm: number;
  onChange: (km: number) => void;
};

export function RadiusMenu({ anchor, onClose, valueKm, onChange }: RadiusMenuProps) {
  const theme = useTheme();

  return (
    <Popover anchor={anchor} onClose={onClose} width={MENU_WIDTH}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>Bán kính tìm kiếm</Text>
      <View style={styles.grid}>
        {RADIUS_OPTIONS_KM.map((km) => {
          const isSelected = km === valueKm;

          return (
            <Pressable
              key={km}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                onChange(km);
                onClose();
              }}
              style={[
                styles.option,
                isSelected
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.background, borderColor: theme.border },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? theme.onPrimary : theme.textSecondary },
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {formatRadius(km)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Popover>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: OPTION_GAP },
  option: {
    width: OPTION_WIDTH,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 19,
  },
  optionText: { fontSize: 14, fontWeight: '600' },
  optionTextSelected: { fontWeight: '800' },
});
