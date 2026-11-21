import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing, StaticColors } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { SellerIcons } from '@/features/seller/constants/icons';
import { formatTimeTyping, normalizeTime, toMinutes } from '@/features/seller/opening-hours';
import { useTheme } from '@/hooks/use-theme';
import { formatTimeOfDay } from '@/lib/format';

// Thư viện chọn giờ gốc không có bản web nên trên web chỉ còn cách gõ tay.
const CAN_PICK_TIME = Platform.OS !== 'web';

function timeToDate(time: string, fallback: string): Date {
  const minutes = toMinutes(time) ?? toMinutes(fallback) ?? 0;
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);

  return date;
}

type TimeInputFieldProps = {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  editable?: boolean;
  /** Giờ bộ chọn hiện sẵn khi ô còn trống hoặc đang gõ dở. */
  defaultTime?: string;
  onChange: (time: string) => void;
};

/**
 * Ô nhập giờ HH:mm dùng chung cho mọi form của người bán: gõ số (tự chèn ":" và bù số 0 khi rời
 * ô) hoặc bấm icon đồng hồ để chọn giờ.
 */
export function TimeInputField({
  label,
  value,
  error,
  placeholder = 'HH:mm',
  editable = true,
  defaultTime = '07:00',
  onChange,
}: TimeInputFieldProps) {
  const theme = useTheme();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handlePick = (event: DateTimePickerEvent, selected?: Date) => {
    // Android hiện hộp thoại và tự đóng sau khi chọn; iOS giữ bánh xe giờ cho đến khi bấm "Xong".
    if (Platform.OS !== 'ios') setIsPickerOpen(false);
    if (event.type !== 'set' || !selected) return;

    onChange(formatTimeOfDay(selected));
  };

  const pickerValue = timeToDate(value, defaultTime);

  return (
    <>
      <TextField
        size="compact"
        accessibilityLabel={label}
        editable={editable}
        error={error}
        keyboardType="number-pad"
        label={label}
        maxLength={5}
        onBlur={() => onChange(normalizeTime(value))}
        onChangeText={(text) => onChange(formatTimeTyping(text))}
        placeholder={placeholder}
        trailing={
          CAN_PICK_TIME && editable ? (
            <Pressable
              accessibilityLabel={`Chọn ${label.toLowerCase()}`}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setIsPickerOpen(true)}
              style={({ pressed }) => [styles.pickerButton, pressed && styles.pressed]}
            >
              <Icon name={SellerIcons.clock} color={theme.primary} size={18} />
            </Pressable>
          ) : (
            <Icon name={SellerIcons.clock} color={theme.textSecondary} size={16} />
          )
        }
        value={value}
      />

      {isPickerOpen && Platform.OS === 'android' ? (
        <DateTimePicker is24Hour mode="time" onChange={handlePick} value={pickerValue} />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          animationType="slide"
          onRequestClose={() => setIsPickerOpen(false)}
          transparent
          visible={isPickerOpen}
        >
          <Pressable onPress={() => setIsPickerOpen(false)} style={styles.backdrop} />
          <View style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>{label}</Text>
            <DateTimePicker
              display="spinner"
              is24Hour
              mode="time"
              onChange={handlePick}
              value={pickerValue}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsPickerOpen(false)}
              style={styles.sheetDone}
            >
              <Text style={[styles.sheetDoneLabel, { color: theme.primary }]}>Xong</Text>
            </Pressable>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  pickerButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.8 },
  backdrop: { flex: 1, backgroundColor: StaticColors.backdrop },
  sheet: {
    alignItems: 'center',
    gap: Spacing.xs,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 28,
  },
  sheetTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  sheetDone: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.sm },
  sheetDoneLabel: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold },
});
