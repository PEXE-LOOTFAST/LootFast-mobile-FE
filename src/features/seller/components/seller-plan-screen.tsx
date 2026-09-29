import { Alert, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { SellerBadge } from '@/features/seller/components/seller-badge';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import {
  PENDING_PLAN_POLICIES,
  PLAN_FEATURE_STATUS_LABEL,
  SELLER_PLAN_FEATURES,
  SELLER_PREMIUM_PRICE,
} from '@/features/seller/constants/seller-plan';
import { MOCK_SELLER_PLAN } from '@/features/seller/data/mock-seller-shop';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

const pad = (value: number) => value.toString().padStart(2, '0');

function formatRenewal(iso?: string) {
  if (!iso) return 'Chưa có dữ liệu';
  const date = new Date(iso);

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function SellerPlanScreen({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const plan = MOCK_SELLER_PLAN;

  return (
    <SellerPageScaffold
      onPressBack={onBack}
      subtitle="Quyền lợi vận hành và trạng thái khả dụng thực tế"
      title="Gói dành cho người bán"
    >
      <View
        style={[
          styles.currentCard,
          { backgroundColor: theme.primarySoft, borderColor: theme.primary },
        ]}
      >
        <View style={styles.currentHeader}>
          <View style={styles.currentCopy}>
            <Text style={[styles.caption, { color: theme.textSecondary }]}>Gói hiện tại</Text>
            <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
          </View>
          <SellerBadge label="Đang dùng" tone="solid" />
        </View>

        <View style={styles.facts}>
          <PlanFact label="Ngày gia hạn" value={formatRenewal(plan.renewsAt)} />
          <PlanFact label="Deal hôm nay" value={`${plan.dealPostsUsed}`} />
          <PlanFact label="Giới hạn mỗi ngày" value={`${plan.dealPostsLimit} lượt đăng deal`} />
        </View>

        <BrandButton
          onPress={() =>
            Alert.alert('Nâng cấp Premium', 'Tính năng thanh toán đang được phát triển.')
          }
          style={styles.upgrade}
        >
          {`Nâng cấp Premium · ${formatPrice(SELLER_PREMIUM_PRICE)}`}
        </BrandButton>
      </View>

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
            {/* Nhãn "Cần backend" ngắn nên đứng cùng hàng tiêu đề, nhãn gói xuống dòng riêng. */}
            <View style={[styles.featureTitleRow, feature.status === 'premium' && styles.stacked]}>
              <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
              <SellerBadge label={PLAN_FEATURE_STATUS_LABEL[feature.status]} />
            </View>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              {feature.description}
            </Text>
          </View>
        </View>
      ))}

      <View
        style={[
          styles.policyCard,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        <Text accessibilityRole="header" style={[styles.policyTitle, { color: theme.text }]}>
          Chính sách cần Product Owner xác nhận
        </Text>
        {PENDING_PLAN_POLICIES.map((policy) => (
          <Text key={policy} style={[styles.policyItem, { color: theme.text }]}>
            {`• ${policy}`}
          </Text>
        ))}
      </View>
    </SellerPageScaffold>
  );
}

function PlanFact({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.fact}>
      <Text style={[styles.caption, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.factValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  currentCard: { gap: 14, borderWidth: 1, borderRadius: 20, padding: 16 },
  currentHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  currentCopy: { flex: 1, gap: 2 },
  caption: { fontSize: 12, fontWeight: '600' },
  planName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  fact: { flexBasis: '50%', gap: 4 },
  factValue: { fontSize: 14, fontWeight: '800' },
  upgrade: { minHeight: 46, borderRadius: 12 },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    boxShadow: '0px 4px 12px rgba(23, 33, 27, 0.05)',
  },
  featureIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  featureCopy: { flex: 1, gap: 8 },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  stacked: { flexDirection: 'column', alignItems: 'flex-start' },
  featureTitle: { flexShrink: 1, fontSize: 15, fontWeight: '800' },
  featureDescription: { fontSize: 12.5, lineHeight: 19 },
  policyCard: {
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 16,
  },
  policyTitle: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
  policyItem: { fontSize: 12.5, lineHeight: 19 },
});
