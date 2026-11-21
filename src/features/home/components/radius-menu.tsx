import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { Chip } from '@/components/ui/chip';
import { Popover, type PopoverAnchor } from '@/components/ui/popover';
import { RADIUS_OPTIONS_KM } from '@/features/home/constants/deals';
import { useTheme } from '@/hooks/use-theme';
import { formatRadius } from '@/lib/format';

const MENU_WIDTH = 190;
// Khớp padding của Popover.
const MENU_PADDING = Spacing.md;
const OPTION_GAP = Spacing.sm;
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
            <Chip
              key={km}
              label={formatRadius(km)}
              onPress={() => {
                onChange(km);
                onClose();
              }}
              role="radio"
              selected={isSelected}
              size="md"
              style={styles.option}
            />
          );
        })}
      </View>
    </Popover>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: OPTION_GAP },
  option: { width: OPTION_WIDTH },
});
