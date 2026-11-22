import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import { PICKUP_CODE_PREFIX } from '@/features/seller/api/merchant-orders';
import { PICKUP_CODE_LENGTH } from '@/features/seller/constants/seller-order-tabs';
import { useTheme } from '@/hooks/use-theme';
import { formatFullDate } from '@/lib/format';

/** Bỏ tiền tố `LF-` nếu người bán dán cả mã, chỉ giữ chữ và số viết hoa, cắt đủ 6 ký tự. */
function normalizePickupCode(value: string): string {
  const withoutPrefix = value.replace(/^\s*LF-/i, '');

  return withoutPrefix
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .slice(0, PICKUP_CODE_LENGTH);
}

type IncomingOrderFiltersProps = {
  date: Date;
  onChangeDate: (date: Date) => void;
  onPressToday: () => void;
  isToday: boolean;
  code: string;
  onChangeCode: (code: string) => void;
  onSubmitCode: () => void;
  isSubmittingCode?: boolean;
  searchQuery: string;
  onChangeSearch: (query: string) => void;
};

export function IncomingOrderFilters({
  date,
  onChangeDate,
  onPressToday,
  isToday,
  code,
  onChangeCode,
  onSubmitCode,
  isSubmittingCode = false,
  searchQuery,
  onChangeSearch,
}: IncomingOrderFiltersProps) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const canDeliver = code.length === PICKUP_CODE_LENGTH && !isSubmittingCode;

  return (
    <View style={styles.container}>
      {/* Date row */}
      <View style={styles.dateRow}>
        <Pressable
          accessibilityLabel="Chọn ngày xem đơn"
          accessibilityRole="button"
          onPress={() => setShowPicker(true)}
          style={({ pressed }) => [
            styles.dateButton,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <Icon name={SellerIcons.calendar} color={theme.primary} size={18} />
          <Text numberOfLines={1} style={[styles.dateText, { color: theme.text }]}>
            {formatFullDate(date)}
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Xem đơn của hôm nay"
          accessibilityRole="button"
          accessibilityState={{ disabled: isToday }}
          disabled={isToday}
          onPress={onPressToday}
          style={({ pressed }) => [
            styles.todayButton,
            { backgroundColor: isToday ? theme.backgroundSelected : theme.primary },
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[styles.todayLabel, { color: isToday ? theme.textSecondary : theme.onPrimary }]}
          >
            Hôm nay
          </Text>
        </Pressable>
      </View>

      {showPicker && (
        <DateTimePicker
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          mode="date"
          onChange={(_event, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (selected) onChangeDate(selected);
          }}
          value={date}
        />
      )}

      {/* Search + pickup code row */}
      <View style={styles.inputRow}>
        <View
          style={[
            styles.searchInput,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <Icon name={SellerIcons.search} color={theme.textSecondary} size={18} />
          <TextInput
            accessibilityLabel="Tìm đơn theo tên món"
            autoCorrect={false}
            onChangeText={onChangeSearch}
            placeholder="Tìm đơn..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text }]}
            value={searchQuery}
          />
        </View>

        <View
          style={[
            styles.codeInput,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <Icon name={SellerIcons.code} color={theme.textSecondary} size={18} />
          <TextInput
            accessibilityLabel="Mã lấy hàng"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={PICKUP_CODE_LENGTH + PICKUP_CODE_PREFIX.length}
            onChangeText={(value) => onChangeCode(normalizePickupCode(value))}
            onSubmitEditing={() => canDeliver && onSubmitCode()}
            placeholder="LF-xxxxxx"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="done"
            style={[styles.input, { color: theme.text }]}
            value={code ? `${PICKUP_CODE_PREFIX}${code}` : ''}
          />
          <Pressable
            accessibilityLabel="Xác nhận khách đã nhận món theo mã lấy hàng"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canDeliver }}
            disabled={!canDeliver}
            onPress={onSubmitCode}
            style={[
              styles.deliverBadge,
              { backgroundColor: canDeliver ? theme.primary : theme.border },
            ]}
          >
            <Icon
              name={SellerIcons.check}
              color={canDeliver ? theme.onPrimary : theme.textSecondary}
              size={16}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  dateRow: { flexDirection: 'row', gap: Spacing.sm },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  dateText: { flex: 1, fontSize: FontSize.body, fontWeight: FontWeight.bold },
  todayButton: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
  },
  todayLabel: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  searchInput: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
  },
  codeInput: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
  },
  // minWidth 0: trên web ô nhập có bề rộng mặc định và không tự co, đẩy nút xác nhận ra ngoài
  // màn hình điện thoại.
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.medium,
    paddingVertical: 0,
    outlineWidth: 0,
  },
  deliverBadge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  pressed: { opacity: 0.85 },
});
