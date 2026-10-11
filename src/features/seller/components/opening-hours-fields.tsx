import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerIcons } from '@/features/seller/constants/icons';
import {
  ALL_OPEN_DAYS,
  HOUR_PRESETS,
  WEEKDAYS_ONLY,
  WEEK_DAYS,
  formatDuration,
  normalizeTime,
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

const pad = (value: number) => value.toString().padStart(2, '0');

// Thư viện chọn giờ gốc không có bản web nên trên web chỉ còn cách gõ tay.
const CAN_PICK_TIME = Platform.OS !== 'web';

function timeToDate(time: string, fallback: string): Date {
  const minutes = toMinutes(time) ?? toMinutes(fallback) ?? 0;
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

  return date;
}

function dateToTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Giờ mở/đóng cửa: gõ tay, bấm icon đồng hồ để chọn giờ, hoặc chọn nhanh theo khung có sẵn; kèm ngày
 * mở cửa trong tuần (ngày bỏ chọn là ngày nghỉ).
 */
export function OpeningHoursFields({ values, errors, onChange }: OpeningHoursFieldsProps) {
  const theme = useTheme();
  const [picking, setPicking] = useState<HourField | null>(null);

  const openMinutes = toMinutes(values.open);
  const closeMinutes = toMinutes(values.close);
  const hasBoth = openMinutes !== null && closeMinutes !== null;
  const isReversed = hasBoth && closeMinutes <= openMinutes;
  const closeError = errors.close ?? (isReversed ? 'Giờ đóng phải sau giờ mở' : undefined);
  const openDays = parseOpenDays(values.openDays);

  const handlePick = (event: DateTimePickerEvent, selected?: Date) => {
    // Android hiện hộp thoại và tự đóng sau khi chọn; iOS giữ bánh xe giờ cho đến khi bấm "Xong".
    if (Platform.OS !== 'ios') setPicking(null);
    if (event.type !== 'set' || !selected || !picking) return;

    onChange(picking, dateToTime(selected));
  };

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
            <Pressable
              key={preset.label}
              accessibilityLabel={`${preset.label}, ${preset.open} đến ${preset.close}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                onChange('open', preset.open);
                onChange('close', preset.close);
              }}
              style={({ pressed }) => [
                styles.chip,
                isSelected
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.background, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: isSelected ? '#FFFFFF' : theme.text },
                  isSelected && styles.chipLabelSelected,
                ]}
              >
                {preset.label} · {preset.open}–{preset.close}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <TimeField
            error={errors.open}
            label="Giờ mở cửa"
            onChange={(text) => onChange('open', text)}
            onPressPicker={() => setPicking('open')}
            value={values.open}
          />
        </View>
        <Text style={[styles.dash, { color: theme.text }]}>-</Text>
        <View style={styles.rowItem}>
          <TimeField
            error={closeError}
            label="Giờ đóng cửa"
            onChange={(text) => onChange('close', text)}
            onPressPicker={() => setPicking('close')}
            value={values.close}
          />
        </View>
      </View>

      {picking ? (
        <View style={styles.picker}>
          <DateTimePicker
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour
            mode="time"
            onChange={handlePick}
            value={timeToDate(values[picking], picking === 'open' ? '07:00' : '22:00')}
          />
          {Platform.OS === 'ios' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setPicking(null)}
              style={styles.pickerDone}
            >
              <Text style={[styles.pickerDoneLabel, { color: theme.primary }]}>Xong</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

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
                  style={[styles.dayLabel, { color: isOpen ? '#FFFFFF' : theme.textSecondary }]}
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

type TimeFieldProps = {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onPressPicker: () => void;
};

function TimeField({ label, value, error, onChange, onPressPicker }: TimeFieldProps) {
  const theme = useTheme();

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    onChange(digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits);
  };

  return (
    <TextField
      size="compact"
      accessibilityLabel={label}
      error={error}
      keyboardType="number-pad"
      label={label}
      maxLength={5}
      onBlur={() => onChange(normalizeTime(value))}
      onChangeText={handleChange}
      placeholder="HH:mm"
      trailing={
        CAN_PICK_TIME ? (
          <Pressable
            accessibilityLabel={`Chọn ${label.toLowerCase()}`}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onPressPicker}
            style={({ pressed }) => [styles.pickerButton, pressed && styles.pressed]}
          >
            <Icon name={SellerIcons.clock} color={theme.primary} size={18} />
          </Pressable>
        ) : (
          <Icon name={SellerIcons.clock} color={theme.text} size={16} />
        )
      }
      value={value}
    />
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
  group: { gap: 8 },
  groupLabel: { fontSize: 12, fontWeight: '800' },
  chips: { gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
  chipLabelSelected: { fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowItem: { flex: 1 },
  dash: { marginTop: 32, fontSize: 16, fontWeight: '700' },
  pickerButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  picker: { alignItems: 'center' },
  pickerDone: { paddingHorizontal: 16, paddingVertical: 8 },
  pickerDoneLabel: { fontSize: 14, fontWeight: '800' },
  summary: { fontSize: 12, fontWeight: '700' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shortcuts: { flexDirection: 'row', gap: 14 },
  shortcut: { fontSize: 12, fontWeight: '800' },
  days: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  dayLabel: { fontSize: 12, fontWeight: '800' },
  error: { fontSize: 12, fontWeight: '600' },
  hint: { fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.8 },
});
