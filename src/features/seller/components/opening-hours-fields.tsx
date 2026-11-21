import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Chip } from '@/components/ui/chip';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { TimeInputField } from '@/features/seller/components/time-input-field';
import {
  ALL_OPEN_DAYS,
  HOUR_PRESETS,
  WEEKDAYS_ONLY,
  WEEK_DAYS,
  formatDuration,
  parseOpenDays,
  toMinutes,
  toggleOpenDay,
} from '@/features/seller/opening-hours';
import type { ShopInfoValues } from '@/features/seller/validation';
import { useTheme } from '@/hooks/use-theme';
import type { FormErrors } from '@/types/form';

type HourField = 'open' | 'close';

type OpeningHoursFieldsProps = {
  values: Pick<ShopInfoValues, HourField | 'openDays'>;
  errors: FormErrors<ShopInfoValues>;
  onChange: (field: HourField | 'openDays', value: string) => void;
};

/**
 * Giờ mở/đóng cửa: gõ tay, bấm icon đồng hồ để chọn giờ, hoặc chọn nhanh theo khung có sẵn; kèm ngày
 * mở cửa trong tuần (ngày bỏ chọn là ngày nghỉ).
 */
export function OpeningHoursFields({ values, errors, onChange }: OpeningHoursFieldsProps) {
  const theme = useTheme();

  const openMinutes = toMinutes(values.open);
  const closeMinutes = toMinutes(values.close);
  const hasBoth = openMinutes !== null && closeMinutes !== null;
  const isReversed = hasBoth && closeMinutes <= openMinutes;
  const closeError = errors.close ?? (isReversed ? 'Giờ đóng phải sau giờ mở' : undefined);
  const openDays = parseOpenDays(values.openDays);

  const summary = hasBoth && !isReversed ? formatDuration(closeMinutes - openMinutes) : null;

  return (
    <SellerFormCard compact>
      <ScrollView
        accessibilityLabel="Chọn nhanh khung giờ"
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {HOUR_PRESETS.map((preset) => {
          const isSelected = values.open === preset.open && values.close === preset.close;

          return (
            <Chip
              key={preset.label}
              accessibilityLabel={`${preset.label}, ${preset.open} đến ${preset.close}`}
              label={`${preset.label} · ${preset.open}–${preset.close}`}
              onPress={() => {
                onChange('open', preset.open);
                onChange('close', preset.close);
              }}
              role="radio"
              selected={isSelected}
            />
          );
        })}
      </ScrollView>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <TimeInputField
            defaultTime="07:00"
            error={errors.open}
            label="Giờ mở cửa"
            onChange={(time) => onChange('open', time)}
            value={values.open}
          />
        </View>
        <Text style={[styles.dash, { color: theme.text }]}>-</Text>
        <View style={styles.rowItem}>
          <TimeInputField
            defaultTime="22:00"
            error={closeError}
            label="Giờ đóng cửa"
            onChange={(time) => onChange('close', time)}
            value={values.close}
          />
        </View>
      </View>

      {summary ? (
        <Text style={[styles.summary, { color: theme.primary }]}>
          Mở {summary} mỗi ngày · {openDays.length} ngày/tuần
        </Text>
      ) : null}

      <View style={styles.group}>
        <View style={styles.dayHeader}>
          <Text style={[styles.groupLabel, { color: theme.text }]}>Ngày mở cửa</Text>
          <View style={styles.shortcuts}>
            <ShortcutButton label="Cả tuần" onPress={() => onChange('openDays', ALL_OPEN_DAYS)} />
            <ShortcutButton label="T2–T6" onPress={() => onChange('openDays', WEEKDAYS_ONLY)} />
          </View>
        </View>

        <View style={styles.days}>
          {WEEK_DAYS.map((day) => {
            const isOpen = openDays.includes(day.id);

            return (
              <Pressable
                key={day.id}
                accessibilityLabel={`${day.label}, ${isOpen ? 'mở cửa' : 'nghỉ'}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isOpen }}
                onPress={() => onChange('openDays', toggleOpenDay(values.openDays, day.id))}
                style={({ pressed }) => [
                  styles.day,
                  isOpen
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.background, borderColor: theme.border },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    { color: isOpen ? theme.onPrimary : theme.textSecondary },
                  ]}
                >
                  {day.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {errors.openDays ? (
          <Text style={[styles.error, { color: theme.danger }]}>{errors.openDays}</Text>
        ) : null}
      </View>

      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        Áp dụng cho các ngày đã chọn, ngày bỏ chọn là ngày nghỉ. Mở qua nửa đêm thì đặt giờ đóng
        23:59.
      </Text>
    </SellerFormCard>
  );
}

function ShortcutButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable accessibilityRole="button" hitSlop={6} onPress={onPress}>
      <Text style={[styles.shortcut, { color: theme.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.sm },
  groupLabel: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  chips: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowItem: { flex: 1 },
  dash: { marginTop: Spacing.xxxl, fontSize: FontSize.subtitle, fontWeight: FontWeight.bold },
  summary: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shortcuts: { flexDirection: 'row', gap: 14 },
  shortcut: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  days: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  dayLabel: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  error: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  hint: { fontSize: FontSize.footnote, lineHeight: 17 },
  pressed: { opacity: 0.8 },
});
