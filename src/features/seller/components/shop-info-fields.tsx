import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { Icon, type IconName } from '@/components/ui/icon';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { LocationPickerModal } from '@/features/map/components/location-picker-modal';
import { useProfile } from '@/features/profile/api/use-profile';
import { toDisplayPhone } from '@/features/profile/profile-form';
import { findProvince, useProvinces, useWards } from '@/features/seller/api/administrative-units';
import { useShopCategories } from '@/features/seller/api/shop-categories';
import { AddressSuggestions } from '@/features/seller/components/address-suggestions';
import { OpeningHoursFields } from '@/features/seller/components/opening-hours-fields';
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
  const [addressQuery, setAddressQuery] = useState('');
  // Địa chỉ đã lấy từ gợi ý/bản đồ (hoặc đã lưu) thì khoá phường/quận/tỉnh, tránh sửa lệch địa chỉ thật.
  const [isAddressLocked, setIsAddressLocked] = useState(() =>
    Boolean(values.latitude.trim() && values.longitude.trim()),
  );
  // Ô liên hệ còn trống thì điền sẵn email/số điện thoại của tài khoản (người bán vẫn sửa được).
  const account = useProfile(true).data;
  const accountEmail = account?.email;
  const accountPhone = toDisplayPhone(account?.phoneNumber ?? null);
  useEffect(() => {
    if (accountEmail && !values.contactEmail.trim()) onChange('contactEmail', accountEmail);
    if (accountPhone && !values.contactPhone.trim()) onChange('contactPhone', accountPhone);
    // Chỉ điền một lần khi hồ sơ tải xong, không ghi đè lại khi người bán xoá ô.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountEmail, accountPhone]);
  const provinces = useProvinces();
  const province = findProvince(provinces.data, values.city);
  const wards = useWards(province?.code);

  return (
    <>
      <SectionTitle icon={SellerIcons.store} label="Hồ sơ cửa hàng" />
      <SellerFormCard compact>
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
                <Chip
                  key={category.code}
                  label={category.name}
                  onPress={() => onChange('businessCategory', category.code)}
                  role="radio"
                  selected={isSelected}
                />
              );
            })}
          </View>
          {errors.businessCategory ? (
            <Text style={[styles.error, { color: theme.danger }]}>{errors.businessCategory}</Text>
          ) : null}
        </View>
      </SellerFormCard>

      <SectionTitle icon={SellerIcons.person} label="Liên hệ" />
      <SellerFormCard compact>
        <View style={styles.row}>
          <View style={styles.rowWide}>
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
          </View>
          <View style={styles.rowItem}>
            <TextField
              size="compact"
              error={errors.contactPhone}
              keyboardType="phone-pad"
              label="Số điện thoại"
              maxLength={16}
              onChangeText={(text) => onChange('contactPhone', text)}
              placeholder="0901234567"
              value={values.contactPhone}
            />
          </View>
        </View>
      </SellerFormCard>

      <SectionTitle icon={SellerIcons.tag} label="Địa chỉ quán" />
      <SellerFormCard compact>
        <TextField
          size="compact"
          error={errors.addressLine}
          label="Số nhà, đường"
          maxLength={255}
          onChangeText={(text) => {
            onChange('addressLine', text);
            setAddressQuery(text);
            // Địa chỉ đã đổi thì toạ độ cũ không còn đúng: xoá để lúc lưu tra lại từ địa chỉ mới.
            onChange('latitude', '');
            onChange('longitude', '');
          }}
          placeholder="12 Nguyễn Huệ"
          value={values.addressLine}
        />
        <AddressSuggestions
          query={addressQuery}
          onSelect={({ coordinate, parts }) => {
            setAddressQuery('');
            setIsAddressLocked(true);
            onChange('addressLine', parts.addressLine);
            onChange('ward', parts.ward);
            onChange('district', parts.district);
            onChange('city', parts.city);
            onChange('latitude', coordinate.latitude.toFixed(6));
            onChange('longitude', coordinate.longitude.toFixed(6));
          }}
        />
        <View style={styles.stack}>
          <View>
            <SelectField
              error={errors.city}
              label="Tỉnh/Thành phố"
              loading={provinces.isLoading}
              onSelect={(option) => {
                onChange('city', option.label);
                onChange('ward', '');
                onChange('district', '');
                setIsAddressLocked(false);
                // Đổi tỉnh thì địa chỉ khác đi: xoá toạ độ để lúc lưu tra lại và kiểm tra.
                onChange('latitude', '');
                onChange('longitude', '');
              }}
              options={(provinces.data ?? []).map((item) => ({
                value: String(item.code),
                label: item.name,
              }))}
              placeholder="Chọn tỉnh/thành"
              value={values.city}
            />
          </View>
          <View>
            <SelectField
              disabled={!province}
              error={errors.ward}
              label="Phường/Xã"
              loading={wards.isLoading}
              onSelect={(option) => {
                onChange('ward', option.label);
                onChange('latitude', '');
                onChange('longitude', '');
              }}
              options={(wards.data ?? []).map((item) => ({
                value: String(item.code),
                label: item.name,
              }))}
              placeholder={province ? 'Chọn phường/xã' : 'Chọn tỉnh trước'}
              value={values.ward}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              size="compact"
              editable={!(isAddressLocked && values.district.trim())}
              error={errors.district}
              label="Quận/Huyện"
              maxLength={100}
              onChangeText={(text) => onChange('district', text)}
              value={values.district}
            />
          </View>
          <View style={styles.mapColumn}>
            <Text style={[styles.groupLabel, { color: theme.text }]}>Vị trí quán</Text>
            <Pressable
              accessibilityLabel="Chọn vị trí trên bản đồ"
              accessibilityRole="button"
              onPress={() => setIsPickerOpen(true)}
              style={({ pressed }) => [
                styles.mapButton,
                { backgroundColor: theme.primarySoft, borderColor: theme.primary },
                pressed && styles.pressed,
              ]}
            >
              <Icon name={SellerIcons.location} color={theme.primary} size={16} />
              <Text style={[styles.mapButtonLabel, { color: theme.primary }]}>Chọn bản đồ</Text>
            </Pressable>
          </View>
        </View>
        {/* Toạ độ chỉ hiển thị: lấy từ bản đồ hoặc tự tra từ địa chỉ khi lưu, người bán không nhập. */}
        <Text
          style={[
            styles.hint,
            { color: errors.latitude || errors.longitude ? theme.danger : theme.textSecondary },
          ]}
        >
          {values.latitude.trim() && values.longitude.trim()
            ? `Vĩ độ ${values.latitude.trim()} · Kinh độ ${values.longitude.trim()}`
            : (errors.latitude ??
              errors.longitude ??
              'Chưa có toạ độ — sẽ tự xác định từ địa chỉ khi lưu.')}
        </Text>
      </SellerFormCard>

      <SectionTitle icon={SellerIcons.clock} label="Giờ hoạt động" />
      <OpeningHoursFields errors={errors} onChange={onChange} values={values} />

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
            setIsAddressLocked(true);
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

const styles = StyleSheet.create({
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '900' },
  multiline: { minHeight: 64, textAlignVertical: 'top' },
  group: { gap: 8 },
  rowWide: { flex: 1.4 },
  mapColumn: { flex: 1, gap: 7 },
  mapButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 8,
  },
  mapButtonLabel: { fontSize: 13, fontWeight: '800' },
  groupLabel: { fontSize: 12, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowItem: { flex: 1 },
  stack: { gap: 10 },
  hint: { fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.8 },
});
