import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorState } from '@/components/ui/error-state';
import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import { RADIUS_OPTIONS_KM } from '@/features/home/constants/deals';
import { usePublishedPlan } from '@/features/premium/api/premium';
import {
  CurrentPlanBox,
  PlanCard,
  formatPlanPeriod,
  type PlanBenefit,
} from '@/features/premium/components/plan-card';
import { PremiumCheckout } from '@/features/premium/components/premium-checkout';
import { useBuyerBenefits } from '@/features/profile/api/use-buyer-benefits';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type PremiumScreenProps = {
  onBack: () => void;
};

// Quyền lợi chỉ gồm những gì backend thật sự cấp: tìm/lọc deal, đặt giữ, yêu thích và thông báo
// cơ bản là miễn phí; Premium của người mua hiện là bộ lọc đã lưu (BUYER_SAVED_FILTERS).
const FREE_BENEFITS: PlanBenefit[] = [
  { label: 'Tìm và lọc deal quanh bạn', badge: `Tới ${Math.max(...RADIUS_OPTIONS_KM)}km` },
  { label: 'Đặt giữ deal và theo dõi đơn hàng' },
  { label: 'Lưu món và quán yêu thích' },
  { label: 'Thông báo deal cơ bản' },
];

function buildPremiumBenefits(filterLimit: number): PlanBenefit[] {
  return [
    { label: 'Toàn bộ quyền lợi gói Miễn phí' },
    { label: 'Lưu bộ lọc deal để dùng lại', badge: `Tối đa ${filterLimit} bộ lọc` },
    { label: 'Tìm nhanh deal theo bộ lọc đã lưu' },
    { label: 'Thông báo khi có deal mới khớp bộ lọc đã lưu' },
  ];
}

// Số bộ lọc tối đa BE trả kèm quyền; dùng giá trị này khi chưa tải xong.
const DEFAULT_FILTER_LIMIT = 10;
// Giá dự kiến hiện khi backend chưa công bố gói người mua nào.
const FALLBACK_PRICE = 29_000;
const FALLBACK_DURATION_DAYS = 30;

export function PremiumScreen({ onBack }: PremiumScreenProps) {
  const theme = useTheme();
  const { user } = useAuthSession();
  const benefitsQuery = useBuyerBenefits(Boolean(user));
  const planQuery = usePublishedPlan('BUYER');
  const plan = planQuery.data;
  const isPremium = benefitsQuery.data?.savedFilters === true;
  const isChecking = Boolean(user) && benefitsQuery.isPending;
  const currentPlan = isChecking ? 'Đang kiểm tra…' : isPremium ? 'Cao cấp' : 'Miễn phí';
  const price = plan?.priceVnd ?? FALLBACK_PRICE;
  const durationDays = plan?.durationDays ?? FALLBACK_DURATION_DAYS;
  const planName = plan?.name ?? 'Người mua Cao cấp';

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <BuyerHeader
        onBack={onBack}
        subtitle="Lưu bộ lọc và nhận thông báo deal phù hợp"
        title="Gói cao cấp"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>GÓI DỊCH VỤ</Text>
          <Text style={[styles.status, { color: theme.textSecondary }]}>
            Gói hiện tại:{' '}
            <Text style={{ color: theme.text, fontWeight: FontWeight.bold }}>{currentPlan}</Text>
          </Text>

          {benefitsQuery.isError ? (
            <ErrorState
              message="Không kiểm tra được gói hiện tại. Vui lòng thử lại."
              onRetry={() => void benefitsQuery.refetch()}
              retrying={benefitsQuery.isRefetching}
            />
          ) : null}

          <PlanCard
            benefits={FREE_BENEFITS}
            price="0đ"
            ribbon={isPremium || isChecking ? undefined : 'Đang dùng'}
            title="Miễn phí"
          />
          <PlanCard
            benefits={buildPremiumBenefits(
              benefitsQuery.data?.savedFilterLimit ?? DEFAULT_FILTER_LIMIT,
            )}
            period={formatPlanPeriod(durationDays)}
            premium
            price={formatPrice(price)}
            ribbon={isPremium ? 'Đang dùng' : 'Đề xuất'}
            title="Cao cấp"
          >
            {isPremium ? (
              <CurrentPlanBox note="Cảm ơn bạn đã ủng hộ LootFast" />
            ) : (
              <PremiumCheckout
                durationDays={durationDays}
                plan={plan}
                planLoading={planQuery.isPending}
                planName={planName}
                price={price}
              />
            )}
          </PlanCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingBottom: 110 },
  body: { gap: Spacing.sm, padding: Spacing.lg },
  eyebrow: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.4,
    marginTop: Spacing.sm,
  },
  status: { fontSize: FontSize.footnote, marginBottom: Spacing.xxs },
});
