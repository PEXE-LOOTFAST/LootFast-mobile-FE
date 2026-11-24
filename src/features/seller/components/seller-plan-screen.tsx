import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { usePremiumStatus, usePublishedPlan } from '@/features/premium/api/premium';
import {
  CurrentPlanBox,
  PlanCard,
  formatPlanPeriod,
  type PlanBenefit,
} from '@/features/premium/components/plan-card';
import { PremiumCheckout } from '@/features/premium/components/premium-checkout';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import {
  PLAN_FEATURE_STATUS_LABEL,
  SELLER_PLAN_FEATURES,
  SELLER_PREMIUM_PRICE,
} from '@/features/seller/constants/seller-plan';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

// Những gì mọi quán đã được duyệt đều dùng được, không cần gói.
const FREE_BENEFITS: PlanBenefit[] = [
  { label: 'Đăng deal và nhận đơn đặt giữ' },
  { label: 'Xác nhận chuyển khoản và giao món' },
  { label: 'Thống kê doanh thu và số đơn cơ bản' },
  { label: 'Hỗ trợ qua email' },
];

const PREMIUM_BENEFITS: PlanBenefit[] = [
  { label: 'Toàn bộ quyền lợi gói Miễn phí' },
  ...SELLER_PLAN_FEATURES.filter((feature) => feature.status === 'premium').map((feature) => ({
    label: feature.title,
  })),
];

const FALLBACK_DURATION_DAYS = 30;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN');
}

/**
 * Gói dịch vụ của người bán: so sánh gói Miễn phí với Cao cấp và đăng ký qua VNPay. Giá và thời
 * hạn lấy từ gói backend đang công bố; chưa công bố thì hiện giá dự kiến và khoá nút thanh toán.
 */
export function SellerPlanScreen({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const { user } = useAuthSession();
  const planQuery = usePublishedPlan('MERCHANT');
  const statusQuery = usePremiumStatus('MERCHANT', Boolean(user));
  const plan = planQuery.data;
  const isPremium = statusQuery.data?.isPremium === true;
  const paidEndsAt = statusQuery.data?.paidEndsAt;
  const price = plan?.priceVnd ?? SELLER_PREMIUM_PRICE;
  const durationDays = plan?.durationDays ?? FALLBACK_DURATION_DAYS;

  return (
    <SellerPageScaffold
      onPressBack={onBack}
      subtitle="Chọn gói phù hợp với quán của bạn"
      title="Gói dành cho người bán"
    >
      <PlanCard
        benefits={FREE_BENEFITS}
        price="0đ"
        ribbon={isPremium || statusQuery.isPending ? undefined : 'Đang dùng'}
        title="Miễn phí"
      />
      <PlanCard
        benefits={PREMIUM_BENEFITS}
        period={formatPlanPeriod(durationDays)}
        premium
        price={formatPrice(price)}
        ribbon={isPremium ? 'Đang dùng' : 'Đề xuất'}
        title="Cao cấp"
      >
        {isPremium ? (
          <CurrentPlanBox
            note={paidEndsAt ? `Hiệu lực đến ${formatDate(paidEndsAt)}` : undefined}
          />
        ) : (
          <PremiumCheckout
            durationDays={durationDays}
            plan={plan}
            planLoading={planQuery.isPending}
            planName={plan?.name ?? 'Người bán Cao cấp'}
            price={price}
          />
        )}
      </PlanCard>

      <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>CHI TIẾT QUYỀN LỢI</Text>
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
  eyebrow: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.4,
    marginTop: Spacing.md,
  },
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
