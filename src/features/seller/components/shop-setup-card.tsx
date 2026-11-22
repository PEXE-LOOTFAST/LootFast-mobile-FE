import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BrandButton } from '@/components/ui/brand-button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
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
      key: 'profile' as const,
      label: 'Thông tin cửa hàng',
      description: 'Tên quán, nhóm món, email và số điện thoại',
      done: Boolean(
        profile?.storeName &&
        profile.businessCategory &&
        profile.contactEmail &&
        profile.contactPhone,
      ),
    },
    {
      key: 'location' as const,
      label: 'Địa chỉ quán',
      description: 'Địa chỉ và vị trí trên bản đồ để khách tìm tới',
      done: Boolean(
        location?.addressLine &&
        location.city &&
        location.latitude != null &&
        location.longitude != null,
      ),
    },
    {
      key: 'hours' as const,
      label: 'Giờ mở cửa',
      description: 'Những ngày và khung giờ quán đón khách',
      done: (openingHours?.slots.length ?? 0) > 0,
    },
  ];
}

type SetupStepKey = ReturnType<typeof getShopSetupSteps>[number]['key'];

// Mở trang Cửa hàng và cuộn thẳng tới phần còn thiếu thay vì bắt người bán tự tìm.
const openShopInfo = (section?: SetupStepKey) =>
  router.navigate({ pathname: '/seller/shop-info', params: section ? { section } : {} });

/**
 * Danh sách việc cần làm trước khi đăng deal: thanh tiến độ cho biết còn bao xa, từng bước bấm
 * được để người bán mới biết chính xác phải điền gì thay vì chỉ thấy "0/3".
 */
export function ShopSetupCard(props: ShopSetupCardProps) {
  const theme = useTheme();
  const steps = getShopSetupSteps(props);
  const doneCount = steps.filter((step) => step.done).length;
  const remaining = steps.length - doneCount;

  if (remaining === 0) return null;

  return (
    <Card elevated gap="md">
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: theme.primarySoft }]}>
          <Icon name={SellerIcons.store} color={theme.primary} size={22} />
        </View>
        <View style={styles.headerCopy}>
          <AppText accessibilityRole="header" variant="subtitle" weight="heavy">
            Hoàn tất hồ sơ quán
          </AppText>
          <AppText tone="textSecondary" variant="footnote">
            {doneCount === 0
              ? `${steps.length} bước ngắn là đăng được deal đầu tiên`
              : `Còn ${remaining} bước nữa là đăng được deal`}
          </AppText>
        </View>
      </View>

      <View
        accessibilityLabel={`Đã xong ${doneCount} trên ${steps.length} bước`}
        accessibilityRole="progressbar"
        style={styles.progressRow}
      >
        <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: theme.primary,
                // Chưa xong bước nào vẫn để một vạch nhỏ, để thanh đọc ra là "tiến độ" chứ không phải ô trống.
                width: `${Math.max((doneCount / steps.length) * 100, 4)}%`,
              },
            ]}
          />
        </View>
        <AppText tone="primary" variant="footnote" weight="heavy">
          {doneCount}/{steps.length}
        </AppText>
      </View>

      <View style={[styles.steps, { borderColor: theme.border }]}>
        {steps.map((step, index) => (
          <Pressable
            key={step.key}
            accessibilityHint={step.done ? undefined : 'Mở trang Cửa hàng để điền'}
            accessibilityLabel={`${step.label}, ${step.done ? 'đã xong' : 'chưa xong'}`}
            accessibilityRole="button"
            onPress={() => openShopInfo(step.key)}
            style={({ pressed }) => [
              styles.step,
              index > 0 && {
                borderTopColor: theme.border,
                borderTopWidth: StyleSheet.hairlineWidth,
              },
              pressed && { backgroundColor: theme.backgroundSelected },
            ]}
          >
            <View
              style={[
                styles.stepMarker,
                step.done
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { borderColor: theme.border },
              ]}
            >
              {step.done ? (
                <Icon name={SellerIcons.check} color={theme.onPrimary} size={14} />
              ) : (
                <AppText tone="textSecondary" variant="footnote" weight="heavy">
                  {index + 1}
                </AppText>
              )}
            </View>

            <View style={styles.stepCopy}>
              <AppText
                tone={step.done ? 'textSecondary' : 'text'}
                variant="body"
                weight={step.done ? 'medium' : 'bold'}
              >
                {step.label}
              </AppText>
              {step.done ? null : (
                <AppText tone="textSecondary" variant="footnote">
                  {step.description}
                </AppText>
              )}
            </View>

            {step.done ? (
              <AppText tone="primary" variant="footnote" weight="bold">
                Đã xong
              </AppText>
            ) : (
              <Icon name={SellerIcons.chevronRight} color={theme.textSecondary} size={18} />
            )}
          </Pressable>
        ))}
      </View>

      <BrandButton onPress={() => openShopInfo(steps.find((step) => !step.done)?.key)}>
        {doneCount === 0 ? 'Bắt đầu điền thông tin quán' : 'Điền tiếp thông tin quán'}
      </BrandButton>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  headerCopy: { flex: 1, gap: Spacing.xxs },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  track: { flex: 1, height: 8, overflow: 'hidden', borderRadius: Radius.full },
  fill: { height: '100%', borderRadius: Radius.full },
  steps: { overflow: 'hidden', borderWidth: 1, borderRadius: Radius.lg },
  step: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  stepMarker: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: Radius.full,
  },
  stepCopy: { flex: 1, gap: Spacing.xxs },
});
