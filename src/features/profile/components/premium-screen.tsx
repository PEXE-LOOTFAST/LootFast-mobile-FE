import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, PremiumColors, Radius, Spacing } from '@/constants/theme';
import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { BuyerHeader } from '@/features/home/components/buyer-header';
import { RADIUS_OPTIONS_KM } from '@/features/home/constants/deals';
import { useBuyerBenefits } from '@/features/profile/api/use-buyer-benefits';
import { ProfileIcons } from '@/features/profile/constants/icons';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type PremiumScreenProps = {
  onBack: () => void;
};

type Benefit = {
  label: string;
  badge?: string;
};

// Quyền lợi chỉ gồm những gì backend thật sự cấp: tìm/lọc deal, đặt giữ, yêu thích và thông báo
// cơ bản là miễn phí; Premium của người mua hiện là bộ lọc đã lưu (BUYER_SAVED_FILTERS).
const FREE_BENEFITS: Benefit[] = [
  { label: 'Tìm và lọc deal quanh bạn', badge: `Tới ${Math.max(...RADIUS_OPTIONS_KM)}km` },
  { label: 'Đặt giữ deal và theo dõi đơn hàng' },
  { label: 'Lưu món và quán yêu thích' },
  { label: 'Thông báo deal cơ bản' },
];

function buildPremiumBenefits(filterLimit: number): Benefit[] {
  return [
    { label: 'Toàn bộ quyền lợi gói miễn phí' },
    { label: 'Lưu bộ lọc deal để dùng lại', badge: `Tối đa ${filterLimit} bộ lọc` },
    { label: 'Tìm nhanh deal theo bộ lọc đã lưu' },
    { label: 'Thông báo khi có deal mới khớp bộ lọc đã lưu' },
  ];
}

// Số bộ lọc tối đa BE trả kèm quyền; dùng giá trị này khi chưa tải xong.
const DEFAULT_FILTER_LIMIT = 10;

function BenefitRow({
  benefit,
  accent,
  badgeBg,
}: {
  benefit: Benefit;
  accent: string;
  badgeBg?: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.benefitRow}>
      <Icon name={ProfileIcons.check} color={accent} size={16} />
      <Text style={[styles.benefitLabel, { color: theme.text }]}>{benefit.label}</Text>
      {benefit.badge ? (
        <View style={[styles.badge, { backgroundColor: badgeBg ?? theme.backgroundElement }]}>
          <Text style={[styles.badgeText, { color: accent }]}>{benefit.badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

// current: gói người dùng đang có; available: chưa có, sắp mở đăng ký (app chưa nối thanh toán
// VNPay của backend nên không đặt nút mua dẫn vào ngõ cụt); included: đã nằm trong gói cao hơn
// người dùng đang có nên không cần nút.
type PlanStatus = 'current' | 'available' | 'included';

function PlanCard({
  benefits,
  color,
  premium = false,
  price,
  status,
  title,
}: {
  benefits: Benefit[];
  color: string;
  premium?: boolean;
  price: string;
  status: PlanStatus;
  title: string;
}) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const mode = scheme === 'dark' ? 'dark' : 'light';
  const pc = PremiumColors[mode];

  return (
    <View
      style={[
        styles.planCard,
        {
          backgroundColor: premium ? pc.cardBg : color,
          borderColor: premium ? pc.cardBorder : theme.textSecondary,
        },
      ]}
    >
      <View style={styles.planHeader}>
        <View>
          <Text style={[styles.planTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.planPrice, { color: premium ? pc.accent : theme.text }]}>
            {price}
          </Text>
        </View>
        <Icon
          name={ProfileIcons.check}
          color={premium ? pc.accent : theme.textSecondary}
          size={22}
        />
      </View>
      <View style={styles.benefits}>
        {benefits.map((benefit) => (
          <BenefitRow
            accent={premium ? pc.accentSoft : theme.textSecondary}
            badgeBg={premium ? pc.badgeBg : undefined}
            benefit={benefit}
            key={benefit.label}
          />
        ))}
      </View>
      {status === 'current' ? (
        <View style={[styles.currentButton, { borderColor: theme.border }]}>
          <Text style={[styles.currentButtonText, { color: theme.text }]}>Đang dùng</Text>
        </View>
      ) : null}
      {status === 'available' ? (
        <View style={[styles.soonBox, { borderColor: pc.cardBorder }]}>
          <Text style={[styles.currentButtonText, { color: pc.accent }]}>Sắp mở đăng ký</Text>
          <Text style={[styles.soonNote, { color: theme.textSecondary }]}>
            Gói Cao cấp sẽ mở đăng ký trong bản cập nhật tới. Bạn chưa cần làm gì lúc này.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function PremiumScreen({ onBack }: PremiumScreenProps) {
  const theme = useTheme();
  const { user } = useAuthSession();
  const benefitsQuery = useBuyerBenefits(Boolean(user));
  const isPremium = benefitsQuery.data?.savedFilters === true;
  const isChecking = Boolean(user) && benefitsQuery.isPending;
  const currentPlan = isChecking ? 'Đang kiểm tra…' : isPremium ? 'Cao cấp' : 'Miễn phí';

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
            color={theme.backgroundElement}
            price="Miễn phí"
            status={isPremium ? 'included' : 'current'}
            title="Miễn phí"
          />
          <PlanCard
            benefits={buildPremiumBenefits(
              benefitsQuery.data?.savedFilterLimit ?? DEFAULT_FILTER_LIMIT,
            )}
            color={theme.backgroundElement}
            premium
            price="29.000 VND"
            status={isPremium ? 'current' : 'available'}
            title="Cao cấp"
          />
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
  planCard: {
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    gap: 14,
    marginTop: Spacing.sm,
    padding: Spacing.lg,
  },
  planHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  planTitle: { fontSize: FontSize.subtitle, fontWeight: FontWeight.heavy },
  planPrice: { fontSize: FontSize.headline, fontWeight: FontWeight.heavy, marginTop: Spacing.xs },
  benefits: { gap: 9 },
  benefitRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  benefitLabel: {
    flexShrink: 1,
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
  badge: { borderRadius: Radius.sm, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: FontSize.micro, fontWeight: FontWeight.heavy },
  currentButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: Spacing.xxs,
  },
  currentButtonText: { fontSize: FontSize.body, fontWeight: FontWeight.heavy },
  soonBox: {
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: Spacing.md,
  },
  soonNote: { fontSize: FontSize.footnote, lineHeight: 17, textAlign: 'center' },
});
