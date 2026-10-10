import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { Icon, type IconName } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { LocationPickerModal } from '@/features/map/components/location-picker-modal';
import { useShopCategories } from '@/features/seller/api/shop-categories';
import { SellerFormCard } from '@/features/seller/components/seller-form-card';
import { SellerIcons } from '@/features/seller/constants/icons';
import type { ShopInfoValues } from '@/features/seller/validation';
import { useTheme } from '@/hooks/use-theme';
import type { Coordinate } from '@/hooks/use-user-location';
import type { FormErrors } from '@/types/form';

type ShopInfoFieldsProps = {
  values: ShopInfoValues;
  errors: FormErrors<ShopInfoValues>;
  onChange: <K extends keyof ShopInfoValues>(field: K, value: ShopInfoValues[K]) => void;
  /** Ô giới thiệu quán không bắt buộc nên form đăng ký bán hàng bỏ qua cho gọn. */
  showDescription?: boolean;
};

/**
 * Các ô thông tin quán mà backend yêu cầu, dùng chung cho trang Thông tin quán (sửa hồ sơ đã có)
 * và form đăng ký bán hàng (nhập trước khi hồ sơ quán tồn tại).
 */
export function ShopInfoFields({
  values,
  errors,
  onChange,
  showDescription = true,
}: ShopInfoFieldsProps) {
  const theme = useTheme();
  const categories = useShopCategories();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <>
      <SectionTitle icon={SellerIcons.store} label="Hồ sơ cửa hàng" />
      <SellerFormCard>
        <TextField
          size="compact"
          error={errors.storeName}
          label="Tên cửa hàng"
          maxLength={120}
          onChangeText={(text) => onChange('storeName', text)}
          placeholder="Tên quán hiển thị với khách"
          value={values.storeName}
        />
        {showDescription ? (
          <TextField
            size="compact"
            error={errors.description}
            label="Giới thiệu quán (tuỳ chọn)"
            maxLength={1000}
            multiline
            onChangeText={(text) => onChange('description', text)}
            placeholder="Vài dòng giới thiệu về quán và món nổi bật"
            style={styles.multiline}
            value={values.description}
          />
        ) : null}

        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: theme.text }]}>Nhóm món</Text>
          {categories.isLoading ? <ActivityIndicator color={theme.primary} /> : null}
          {categories.isError ? (
            <Text style={[styles.error, { color: theme.danger }]}>
              Không tải được danh sách nhóm món.
            </Text>
          ) : null}
          <View style={styles.chips}>
            {(categories.data ?? []).map((category) => {
              const isSelected = values.businessCategory === category.code;

              return (
                <Pressable
                  key={category.code}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onChange('businessCategory', category.code)}
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
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.businessCategory ? (
            <Text style={[styles.error, { color: theme.danger }]}>{errors.businessCategory}</Text>
          ) : null}
        </View>
      </SellerFormCard>

      <SectionTitle icon={SellerIcons.person} label="Liên hệ" />
      <SellerFormCard>
        <TextField
          size="compact"
          autoCapitalize="none"
          error={errors.contactEmail}
          keyboardType="email-address"
          label="Email liên hệ"
          maxLength={254}
          onChangeText={(text) => onChange('contactEmail', text)}
          placeholder="quan@example.com"
          value={values.contactEmail}
        />
        <TextField
          size="compact"
          error={errors.contactPhone}
          keyboardType="phone-pad"
          label="Số điện thoại liên hệ"
          maxLength={16}
          onChangeText={(text) => onChange('contactPhone', text)}
          placeholder="0901234567"
          value={values.contactPhone}
        />
      </SellerFormCard>

      <SectionTitle icon={SellerIcons.tag} label="Địa chỉ quán" />
      <SellerFormCard>
        <TextField
          size="compact"
          error={errors.addressLine}
          label="Số nhà, đường"
          maxLength={255}
          onChangeText={(text) => onChange('addressLine', text)}
          placeholder="12 Nguyễn Huệ"
          value={values.addressLine}
        />
        <TextField
          size="compact"
          error={errors.ward}
          label="Phường/Xã"
          maxLength={100}
          onChangeText={(text) => onChange('ward', text)}
          value={values.ward}
        />
        <TextField
          size="compact"
          error={errors.district}
          label="Quận/Huyện"
          maxLength={100}
          onChangeText={(text) => onChange('district', text)}
          value={values.district}
        />
        <TextField
          size="compact"
          error={errors.city}
          label="Tỉnh/Thành phố"
          maxLength={100}
          onChangeText={(text) => onChange('city', text)}
          value={values.city}
        />
        <BrandButton onPress={() => setIsPickerOpen(true)} variant="secondary">
          Chọn vị trí trên bản đồ
        </BrandButton>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              size="compact"
              error={errors.latitude}
              keyboardType="numbers-and-punctuation"
              label="Vĩ độ"
              onChangeText={(text) => onChange('latitude', text)}
              placeholder="10.776889"
              value={values.latitude}
            />
          </View>
          <View style={styles.rowItem}>
            <TextField
              size="compact"
              error={errors.longitude}
              keyboardType="numbers-and-punctuation"
              label="Kinh độ"
              onChangeText={(text) => onChange('longitude', text)}
              placeholder="106.700806"
              value={values.longitude}
            />
          </View>
        </View>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Chọn vị trí trên bản đồ hoặc nhập tay. Khách sẽ thấy quán đúng chỗ này trên tab Bản đồ và
          dùng nó để tính khoảng cách.
        </Text>
      </SellerFormCard>

      <SectionTitle icon={SellerIcons.clock} label="Giờ hoạt động" />
      <SellerFormCard>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TimeField
              error={errors.open}
              label="Giờ mở cửa"
              onChange={(text) => onChange('open', text)}
              value={values.open}
            />
          </View>
          <Text style={[styles.dash, { color: theme.text }]}>-</Text>
          <View style={styles.rowItem}>
            <TimeField
              error={errors.close}
              label="Giờ đóng cửa"
              onChange={(text) => onChange('close', text)}
              value={values.close}
            />
          </View>
        </View>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Áp dụng cho cả tuần. Giờ đóng phải sau giờ mở trong cùng một ngày.
        </Text>
      </SellerFormCard>

      <LocationPickerModal
        addressHint={
          values.addressLine.trim()
            ? [values.addressLine, values.ward, values.district, values.city]
                .map((part) => part.trim())
                .filter(Boolean)
                .join(', ')
            : ''
        }
        initial={toCoordinate(values.latitude, values.longitude)}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={({ latitude, longitude }, address) => {
          // Backend nhận tối đa 6 chữ số thập phân.
          onChange('latitude', latitude.toFixed(6));
          onChange('longitude', longitude.toFixed(6));

          // Địa chỉ chỉ là gợi ý từ vị trí; các ô vẫn sửa tay được sau khi điền.
          if (address) {
            onChange('addressLine', address.addressLine);
            onChange('ward', address.ward);
            onChange('district', address.district);
            onChange('city', address.city);
          }
          setIsPickerOpen(false);
        }}
        visible={isPickerOpen}
      />
    </>
  );
}

// Chỉ trả toạ độ khi cả hai ô đều hợp lệ; ngược lại bản đồ mở ở vị trí hiện tại, không đặt sẵn ghim.
function toCoordinate(latitude: string, longitude: string): Coordinate | null {
  const lat = Number(latitude.trim().replace(',', '.'));
  const lng = Number(longitude.trim().replace(',', '.'));

  if (!latitude.trim() || !longitude.trim()) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return { latitude: lat, longitude: lng };
}

function SectionTitle({ icon, label }: { icon: IconName; label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.sectionTitle}>
      <Icon name={icon} color={theme.text} size={14} />
      <Text accessibilityRole="header" style={[styles.sectionLabel, { color: theme.text }]}>
        {label}
      </Text>
    </View>
  );
}

// Chưa có thư viện chọn giờ gốc nên nhập tay dạng HH:mm; tự chèn dấu ":" sau hai số đầu.
function TimeField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
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
      onChangeText={handleChange}
      placeholder="HH:mm"
      trailing={<Icon name={SellerIcons.clock} color={theme.text} size={16} />}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '900' },
  multiline: { minHeight: 76, textAlignVertical: 'top' },
  group: { gap: 8 },
  groupLabel: { fontSize: 12, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
  chipLabelSelected: { fontWeight: '800' },
  error: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowItem: { flex: 1 },
  dash: { marginTop: 32, fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.8 },
});
