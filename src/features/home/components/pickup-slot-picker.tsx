import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { HomeIcons } from '@/features/home/constants/icons';
import type { PickupSlot } from '@/features/home/pickup-slots';
import { useTheme } from '@/hooks/use-theme';

type PickupSlotPickerProps = {
  slots: PickupSlot[];
  selected: PickupSlot | undefined;
  onSelect: (slot: PickupSlot) => void;
  /** Khoá lại sau khi đặt xong để khách không tưởng là đổi được giờ của đơn đã giữ. */
  disabled?: boolean;
};

/** Khách chọn khoảng giờ sẽ đến lấy; backend bắt buộc gửi kèm khi đặt đơn. */
export function PickupSlotPicker({
  slots,
  selected,
  onSelect,
  disabled = false,
}: PickupSlotPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Icon name={HomeIcons.clock} color={theme.primary} size={16} />
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          Bạn đến lấy lúc nào?
        </Text>
      </View>

      {slots.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          Deal đã hết giờ nhận đặt hôm nay.
        </Text>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {slots.map((slot) => {
              const isSelected = slot.from === selected?.from && slot.to === selected?.to;

              return (
                <Pressable
                  key={`${slot.from}-${slot.to}`}
                  accessibilityLabel={`Đến lấy lúc ${slot.label}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected, disabled }}
                  disabled={disabled}
                  onPress={() => onSelect(slot)}
                  style={({ pressed }) => [
                    styles.chip,
                    isSelected
                      ? { backgroundColor: theme.primary, borderColor: theme.primary }
                      : { backgroundColor: theme.background, borderColor: theme.border },
                    (pressed || disabled) && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: isSelected ? theme.onPrimary : theme.text },
                      isSelected && styles.chipLabelSelected,
                    ]}
                  >
                    {slot.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Quán giữ phần của bạn trong khung giờ này. Huỷ đơn được đến trước giờ hẹn 30 phút.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 14, fontWeight: '800' },
  chips: { gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
  chipLabelSelected: { fontWeight: '800' },
  hint: { fontSize: 12, lineHeight: 17 },
  empty: { fontSize: 13, lineHeight: 19, fontWeight: '600' },
  pressed: { opacity: 0.8 },
});
