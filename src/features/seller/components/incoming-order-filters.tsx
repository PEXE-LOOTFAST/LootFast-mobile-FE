import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import { PICKUP_CODE_LENGTH } from '@/features/seller/constants/seller-order-tabs';
import { useTheme } from '@/hooks/use-theme';

type IncomingOrderFiltersProps = {
  /** Ngày đang xem, dạng dd/mm/yyyy để người bán gõ tay được. */
  date: string;
  onChangeDate: (date: string) => void;
  onPressToday: () => void;
  isToday: boolean;
  code: string;
  onChangeCode: (code: string) => void;
  onSubmitCode: () => void;
};

// Hai bộ lọc của mục "Đơn hàng đến": xem đơn theo ngày và tra nhanh một mã lấy hàng.
export function IncomingOrderFilters({
  date,
  onChangeDate,
  onPressToday,
  isToday,
  code,
  onChangeCode,
  onSubmitCode,
}: IncomingOrderFiltersProps) {
  const theme = useTheme();
  const canSearch = code.length === PICKUP_CODE_LENGTH;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.row}>
        <View style={[styles.iconBadge, { backgroundColor: theme.primarySoft }]}>
          <Icon name={SellerIcons.calendar} color={theme.primary} size={17} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Ngày xem đơn</Text>
          <TextInput
            accessibilityLabel="Ngày xem đơn"
            inputMode="numeric"
            onChangeText={onChangeDate}
            placeholder="dd/mm/yyyy"
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.input,
              { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
            ]}
            value={date}
          />
        </View>

        <FilterAction
          disabled={isToday}
          label="Hôm nay"
          accessibilityLabel="Xem đơn của hôm nay"
          onPress={onPressToday}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.row}>
        <View style={[styles.iconBadge, { backgroundColor: theme.primarySoft }]}>
          <Icon name={SellerIcons.code} color={theme.primary} size={17} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Mã lấy hàng</Text>
          <TextInput
            accessibilityLabel="Mã lấy hàng"
            inputMode="numeric"
            maxLength={PICKUP_CODE_LENGTH}
            onChangeText={(value) => onChangeCode(value.replace(/\D/g, ''))}
            onSubmitEditing={() => canSearch && onSubmitCode()}
            placeholder="6 số, VD: 482917"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="search"
            style={[
              styles.input,
              { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
            ]}
            value={code}
          />
        </View>

        <FilterAction
          disabled={!canSearch}
          label="Tìm"
          accessibilityLabel="Tìm đơn theo mã lấy hàng"
          onPress={onSubmitCode}
        />
      </View>
    </View>
  );
}

type FilterActionProps = {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
};

// Nút xám khi chưa bấm được (đang xem đúng hôm nay, hoặc mã chưa đủ 6 số).
function FilterAction({ label, accessibilityLabel, disabled, onPress }: FilterActionProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: disabled ? theme.border : theme.primary },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.actionLabel, { color: disabled ? theme.textSecondary : '#FFFFFF' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderWidth: 1, borderRadius: 20, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  iconBadge: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 6,
  },
  field: { flex: 1, gap: 4 },
  label: { fontSize: 11.5, fontWeight: '700' },
  // Trình duyệt tự vẽ viền focus riêng, chồng lên viền của input.
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    outlineWidth: 0,
  },
  action: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  actionLabel: { fontSize: 13, fontWeight: '800' },
  divider: { height: StyleSheet.hairlineWidth },
  pressed: { opacity: 0.85 },
});
