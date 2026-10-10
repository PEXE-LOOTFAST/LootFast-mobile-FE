import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import { PICKUP_CODE_PREFIX } from '@/features/seller/api/merchant-orders';
import { PICKUP_CODE_LENGTH } from '@/features/seller/constants/seller-order-tabs';
import { useTheme } from '@/hooks/use-theme';

/** Bỏ tiền tố `LF-` nếu người bán dán cả mã, chỉ giữ chữ và số viết hoa, cắt đủ 6 ký tự. */
function normalizePickupCode(value: string): string {
  // Ô nhập luôn hiện sẵn `LF-` nên chỉ cắt tiền tố khi có đủ cả dấu gạch; mã thật có thể bắt đầu bằng "LF".
  const withoutPrefix = value.replace(/^\s*LF-/i, '');

  return withoutPrefix
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .slice(0, PICKUP_CODE_LENGTH);
}

type IncomingOrderFiltersProps = {
  /** Ngày đang xem, dạng dd/mm/yyyy để người bán gõ tay được. */
  date: string;
  onChangeDate: (date: string) => void;
  onPressToday: () => void;
  isToday: boolean;
  code: string;
  onChangeCode: (code: string) => void;
  onSubmitCode: () => void;
  isSubmittingCode?: boolean;
};

// Hai bộ lọc của mục "Đơn hàng đến": xem đơn theo ngày và nhập tay mã lấy hàng của khách để giao.
export function IncomingOrderFilters({
  date,
  onChangeDate,
  onPressToday,
  isToday,
  code,
  onChangeCode,
  onSubmitCode,
  isSubmittingCode = false,
}: IncomingOrderFiltersProps) {
  const theme = useTheme();
  const canSearch = code.length === PICKUP_CODE_LENGTH && !isSubmittingCode;

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
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Mã lấy hàng (LF-xxxxxx)
          </Text>
          <TextInput
            accessibilityLabel="Mã lấy hàng"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={PICKUP_CODE_LENGTH + PICKUP_CODE_PREFIX.length}
            onChangeText={(value) => onChangeCode(normalizePickupCode(value))}
            onSubmitEditing={() => canSearch && onSubmitCode()}
            placeholder="VD: LF-7K2M9Q"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="done"
            style={[
              styles.input,
              { backgroundColor: theme.background, borderColor: theme.border, color: theme.text },
            ]}
            value={code ? `${PICKUP_CODE_PREFIX}${code}` : ''}
          />
        </View>

        <FilterAction
          disabled={!canSearch}
          label="Giao"
          accessibilityLabel="Xác nhận giao đơn theo mã lấy hàng"
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
