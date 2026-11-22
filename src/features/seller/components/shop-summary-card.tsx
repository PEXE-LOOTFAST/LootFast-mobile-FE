import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useShopCategories } from '@/features/seller/api/shop-categories';
import type { ShopSection } from '@/features/seller/components/shop-info-fields';
import { getShopSetupSteps } from '@/features/seller/components/shop-setup-card';
import { SellerIcons } from '@/features/seller/constants/icons';
import type { useMerchantShop } from '@/features/seller/hooks/use-merchant-shop';
import { useTheme } from '@/hooks/use-theme';

type ShopSummaryCardProps = {
  shop: ReturnType<typeof useMerchantShop>;
  /** Bấm một mục trạng thái thì cuộn tới khối tương ứng của form. */
  onPressSection: (section: ShopSection) => void;
};

const AVATAR_SIZE = 56;

/**
 * Đầu trang Cửa hàng: quán đang hiện với khách ra sao (tên, nhóm món, xác minh) và ba phần hồ sơ
 * đã đủ hay còn thiếu. Lấy theo dữ liệu đã lưu, không theo form đang sửa dở.
 */
export function ShopSummaryCard({ shop, onPressSection }: ShopSummaryCardProps) {
  const theme = useTheme();
  const categories = useShopCategories();
  const profile = shop.profile;
  const storeName = profile?.storeName?.trim();
  const category = categories.data?.find((item) => item.code === profile?.businessCategory);
  const steps = getShopSetupSteps(shop);

  return (
    <Card elevated gap="md">
      <View style={styles.identity}>
        {profile?.logoUrl ? (
          <Image
            accessibilityIgnoresInvertColors
            contentFit="cover"
            source={{ uri: profile.logoUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.initial, { backgroundColor: theme.primarySoft }]}>
            {storeName ? (
              <AppText tone="primary" variant="headline" weight="heavy">
                {storeName.charAt(0).toUpperCase()}
              </AppText>
            ) : (
              <Icon name={SellerIcons.store} color={theme.primary} size={24} />
            )}
          </View>
        )}

        <View style={styles.identityCopy}>
          <AppText numberOfLines={2} variant="subtitle" weight="heavy">
            {storeName || 'Quán chưa có tên'}
          </AppText>
          <AppText numberOfLines={1} tone="textSecondary" variant="footnote">
            {category?.name ?? 'Chưa chọn nhóm món'}
          </AppText>
          {profile?.verified ? <Badge label="Đã xác minh" size="sm" tone="primarySoft" /> : null}
        </View>
      </View>

      <View style={styles.steps}>
        {steps.map((step) => (
          <Pressable
            key={step.key}
            accessibilityHint="Cuộn tới phần này"
            accessibilityLabel={`${step.label}, ${step.done ? 'đã đủ' : 'còn thiếu'}`}
            accessibilityRole="button"
            onPress={() => onPressSection(step.key)}
            style={({ pressed }) => [
              styles.step,
              step.done
                ? { backgroundColor: theme.primarySoft, borderColor: theme.primarySoft }
                : { borderColor: theme.danger },
              pressed && styles.pressed,
            ]}
          >
            <Icon
              name={step.done ? SellerIcons.check : SellerIcons.plus}
              color={step.done ? theme.primary : theme.danger}
              size={13}
            />
            <AppText
              numberOfLines={1}
              style={styles.stepLabel}
              tone={step.done ? 'primary' : 'danger'}
              variant="caption"
              weight="bold"
            >
              {STEP_SHORT_LABELS[step.key]}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

// Ba nút trạng thái xếp một hàng nên dùng nhãn ngắn.
const STEP_SHORT_LABELS: Record<ShopSection, string> = {
  contact: 'Liên hệ',
  profile: 'Thông tin',
  location: 'Địa chỉ',
  hours: 'Giờ mở cửa',
};

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: Radius.lg },
  initial: { alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1, gap: Spacing.xs },
  steps: { flexDirection: 'row', gap: Spacing.sm },
  step: {
    flex: 1,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxs,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xs,
  },
  stepLabel: { flexShrink: 1 },
  pressed: { opacity: 0.8 },
});
