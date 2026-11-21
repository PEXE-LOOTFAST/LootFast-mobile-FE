import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { Badge } from '@/components/ui/badge';
import { EmptyCard } from '@/components/ui/empty-card';
import { Icon } from '@/components/ui/icon';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import {
  PLAN_FEATURE_STATUS_LABEL,
  SELLER_PLAN_FEATURES,
  SELLER_PREMIUM_PRICE,
} from '@/features/seller/constants/seller-plan';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

/**
 * Gói dịch vụ của người bán. App chưa nối luồng thanh toán gói (backend đã có checkout VNPay ở
 * /premium/orders), nên màn này chỉ giới thiệu quyền lợi và báo sắp mở đăng ký, không có nút
 * bấm vào ngõ cụt. Danh sách quyền lợi là mô tả sản phẩm viết sẵn, không phải dữ liệu tài khoản.
 */
export function SellerPlanScreen({ onBack }: { onBack: () => void }) {
  const theme = useTheme();

  return (
    <SellerPageScaffold
      onPressBack={onBack}
      subtitle="Quyền lợi của từng gói dành cho quán"
      title="Gói dành cho người bán"
    >
      <EmptyCard
        description={`Gói Cao cấp (${formatPrice(SELLER_PREMIUM_PRICE)}) sẽ mở đăng ký trong bản cập nhật tới. Bạn chưa cần làm gì lúc này.`}
        title="Sắp mở đăng ký gói Cao cấp"
      />

      {SELLER_PLAN_FEATURES.map((feature) => (
        <View
          key={feature.key}
          style={[
            styles.featureCard,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <View style={[styles.featureIcon, { backgroundColor: theme.primarySoft }]}>
            <Icon name={feature.icon} color={theme.primary} size={18} />
          </View>
          <View style={styles.featureCopy}>
            {/* Nhãn "Sắp có" ngắn nên đứng cùng hàng tiêu đề, nhãn gói xuống dòng riêng. */}
            <View style={[styles.featureTitleRow, feature.status === 'premium' && styles.stacked]}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
              <Badge label={PLAN_FEATURE_STATUS_LABEL[feature.status]} />
            </View>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              {feature.description}
            </Text>
          </View>
        </View>
      ))}
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    boxShadow: Shadow.card,
  },
  featureIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  featureCopy: { flex: 1, gap: Spacing.sm },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  featureTitle: { flexShrink: 1, fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold },
  featureDescription: { fontSize: FontSize.bodySm, lineHeight: 19 },
});
