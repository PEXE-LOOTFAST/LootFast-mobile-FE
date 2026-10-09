import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import type {
  MerchantLocationDto,
  MerchantOpeningHoursDto,
  MerchantProfileDto,
} from '@/features/seller/types/api';
import { useTheme } from '@/hooks/use-theme';

type ShopSetupCardProps = {
  profile?: MerchantProfileDto;
  location?: MerchantLocationDto;
  openingHours?: MerchantOpeningHoursDto;
};

/**
 * Hồ sơ quán được backend tạo rỗng ngay khi admin duyệt đơn đăng ký, nên người bán mới luôn phải
 * tự điền. Khối này chỉ ra phần nào còn thiếu; deal chỉ đăng được khi đã có nhóm món.
 */
export function getShopSetupSteps({ profile, location, openingHours }: ShopSetupCardProps) {
  return [
    {
      key: 'profile',
      label: 'Thông tin cửa hàng',
      done: Boolean(
        profile?.storeName &&
        profile.businessCategory &&
        profile.contactEmail &&
        profile.contactPhone,
      ),
    },
    {
      key: 'location',
      label: 'Địa chỉ quán',
      done: Boolean(
        location?.addressLine &&
        location.city &&
        location.latitude != null &&
        location.longitude != null,
      ),
    },
    { key: 'hours', label: 'Giờ mở cửa', done: (openingHours?.slots.length ?? 0) > 0 },
  ];
}

export function ShopSetupCard(props: ShopSetupCardProps) {
  const theme = useTheme();
  const steps = getShopSetupSteps(props);
  const doneCount = steps.filter((step) => step.done).length;

  if (doneCount === steps.length) return null;

  return (
    <Pressable
      accessibilityLabel="Hoàn tất thông tin quán"
      accessibilityRole="button"
      onPress={() => router.navigate('/seller/shop-info')}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.primary },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
          <Icon name={SellerIcons.store} color={theme.primary} size={20} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>Hoàn tất hồ sơ quán</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Cần đủ thông tin mới đăng được deal · {doneCount}/{steps.length} bước
          </Text>
        </View>
        <Icon name={SellerIcons.chevronRight} color={theme.textSecondary} size={17} />
      </View>

      <View style={styles.steps}>
        {steps.map((step) => (
          <View key={step.key} style={styles.step}>
            <Icon
              name={step.done ? SellerIcons.check : SellerIcons.plus}
              color={step.done ? theme.primary : theme.textSecondary}
              size={14}
            />
            <Text
              style={[
                styles.stepLabel,
                { color: step.done ? theme.textSecondary : theme.text },
                step.done && styles.stepDone,
              ]}
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderWidth: 1.5, borderRadius: 20, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '900' },
  subtitle: { fontSize: 12, lineHeight: 17 },
  steps: { gap: 8, paddingLeft: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepLabel: { fontSize: 13, fontWeight: '700' },
  stepDone: { textDecorationLine: 'line-through', fontWeight: '500' },
  pressed: { opacity: 0.85 },
});
