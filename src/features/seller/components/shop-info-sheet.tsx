import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/ui/brand-button';
import { Icon, type IconName } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { SellerIcons } from '@/features/seller/constants/icons';
import { SHOP_CATEGORY_OPTIONS } from '@/features/seller/constants/shop-categories';
import type { SellerShop, SellerShopCategory } from '@/features/seller/types';
import { validateShopInfo, type ShopInfoValues } from '@/features/seller/validation';
import { useTheme } from '@/hooks/use-theme';
import type { FormErrors } from '@/types/form';

type ShopInfoSheetProps = {
  visible: boolean;
  shop: SellerShop;
  onClose: () => void;
  onSave: (shop: Partial<SellerShop>) => void;
};

const toFormValues = (shop: SellerShop): ShopInfoValues => ({
  name: shop.name,
  address: shop.address,
  categories: shop.categories,
  open: shop.openingHours.open,
  close: shop.openingHours.close,
});

// Form chỉ mount khi sheet mở nên mỗi lần mở đều bắt đầu từ dữ liệu đang lưu,
// đóng giữa chừng không giữ lại bản nháp.
export function ShopInfoSheet({ visible, shop, onClose, onSave }: ShopInfoSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable
          accessibilityLabel="Đóng thông tin quán"
          accessibilityRole="button"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />

        <Animated.View
          entering={SlideInDown.duration(260)}
          style={[
            styles.sheet,
            { backgroundColor: theme.background, paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: theme.primary }]}>
              <Icon name={SellerIcons.store} color="#FFFFFF" size={22} />
            </View>
            <View style={styles.headerCopy}>
              <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
                Thông tin quán
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Cập nhật hồ sơ cửa hàng và tài liệu xác minh
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Đóng"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <Icon name={SellerIcons.close} color={theme.text} size={16} />
            </Pressable>
          </View>

          {visible ? (
            <ShopInfoForm
              initialValues={toFormValues(shop)}
              onSave={(values) => {
                onSave({
                  name: values.name.trim(),
                  address: values.address.trim(),
                  categories: values.categories,
                  openingHours: { open: values.open, close: values.close },
                });
                onClose();
              }}
            />
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ShopInfoForm({
  initialValues,
  onSave,
}: {
  initialValues: ShopInfoValues;
  onSave: (values: ShopInfoValues) => void;
}) {
  const theme = useTheme();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors<ShopInfoValues>>({});

  function setField<K extends keyof ShopInfoValues>(field: K, value: ShopInfoValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }

  const toggleCategory = (category: SellerShopCategory) =>
    setField(
      'categories',
      values.categories.includes(category)
        ? values.categories.filter((item) => item !== category)
        : [...values.categories, category],
    );

  const submit = () => {
    const nextErrors = validateShopInfo(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    onSave(values);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.form}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      <TextField
        size="compact"
        error={errors.name}
        label="Tên cửa hàng"
        onChangeText={(text) => setField('name', text)}
        placeholder="Tên quán hiển thị với khách"
        value={values.name}
      />
      <TextField
        size="compact"
        error={errors.address}
        label="Địa chỉ"
        onChangeText={(text) => setField('address', text)}
        placeholder="Số nhà, đường, quận"
        value={values.address}
      />

      <View style={styles.group}>
        <GroupLabel icon={SellerIcons.tag} label="Danh mục món" />
        <View style={styles.chips}>
          {SHOP_CATEGORY_OPTIONS.map((option) => {
            const isSelected = values.categories.includes(option.value);

            return (
              <Pressable
                key={option.value}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                onPress={() => toggleCategory(option.value)}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
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
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {errors.categories ? (
          <Text style={[styles.error, { color: theme.danger }]}>{errors.categories}</Text>
        ) : null}
      </View>

      <View style={styles.group}>
        <GroupLabel icon={SellerIcons.clock} label="Giờ hoạt động" />
        <View style={styles.hoursRow}>
          <View style={styles.hourField}>
            <TimeField
              error={errors.open}
              label="Giờ mở cửa"
              onChange={(text) => setField('open', text)}
              value={values.open}
            />
          </View>
          <Text style={[styles.hoursDash, { color: theme.text }]}>-</Text>
          <View style={styles.hourField}>
            <TimeField
              error={errors.close}
              label="Giờ đóng cửa"
              onChange={(text) => setField('close', text)}
              value={values.close}
            />
          </View>
        </View>
      </View>

      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: theme.text }]}>
          Giấy phép kinh doanh{' '}
          <Text style={[styles.optional, { color: theme.textSecondary }]}>(tuỳ chọn)</Text>
        </Text>
        {/* Chưa có thư viện chọn tệp và API lưu giấy tờ, bấm vào chỉ báo tính năng sắp có. */}
        <Pressable
          accessibilityLabel="Tải lên giấy phép kinh doanh"
          accessibilityRole="button"
          onPress={() =>
            Alert.alert('Giấy phép kinh doanh', 'Tính năng tải giấy tờ đang được phát triển.')
          }
          style={({ pressed }) => [
            styles.upload,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
        >
          <Icon name={SellerIcons.upload} color={theme.text} size={16} />
          <Text style={[styles.uploadLabel, { color: theme.text }]}>
            Tải lên nếu đã có giấy phép
          </Text>
        </Pressable>
      </View>

      <BrandButton onPress={submit} style={styles.submit}>
        Lưu thay đổi
      </BrandButton>
    </ScrollView>
  );
}

function GroupLabel({ icon, label }: { icon: IconName; label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.groupLabelRow}>
      <Icon name={icon} color={theme.text} size={13} />
      <Text style={[styles.groupLabel, { color: theme.text }]}>{label}</Text>
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
      maxLength={5}
      onChangeText={handleChange}
      placeholder="HH:mm"
      trailing={<Icon name={SellerIcons.clock} color={theme.text} size={16} />}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: 'rgba(10, 20, 14, 0.45)' },
  sheet: {
    flexShrink: 1,
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, marginTop: 10, borderRadius: 3 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  headerCopy: { flex: 1, gap: 3 },
  title: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, lineHeight: 17 },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
  },
  scroll: { flexGrow: 0 },
  form: { gap: 16, paddingHorizontal: 20, paddingTop: 4 },
  group: { gap: 8 },
  groupLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  groupLabel: { fontSize: 12, fontWeight: '800' },
  optional: { fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
  chipLabelSelected: { fontWeight: '800' },
  error: { fontSize: 12, fontWeight: '600' },
  hoursRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  hourField: { flex: 1 },
  hoursDash: { marginTop: 11, fontSize: 16, fontWeight: '700' },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  uploadLabel: { fontSize: 12.5, fontWeight: '600' },
  submit: { marginTop: 4 },
  pressed: { opacity: 0.8 },
});
