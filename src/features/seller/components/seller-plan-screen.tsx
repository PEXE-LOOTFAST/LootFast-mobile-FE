import { Alert, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { ApiPendingCard } from '@/components/ui/api-pending-card';
import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import {
  PENDING_PLAN_POLICIES,
  PLAN_FEATURE_STATUS_LABEL,
  SELLER_PLAN_FEATURES,
  SELLER_PREMIUM_PRICE,
} from '@/features/seller/constants/seller-plan';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

/**
 * Gói dịch vụ của người bán. Backend chưa có endpoint gói, hạn mức đăng deal hay thanh toán,
 * nên thẻ "Gói hiện tại" chưa có số liệu thật. Danh sách quyền lợi bên dưới là mô tả sản phẩm
 * viết sẵn, không phải dữ liệu tài khoản.
 */
export function SellerPlanScreen({ onBack }: { onBack: () => void }) {
  const theme = useTheme();

  return (
    <SellerPageScaffold
      onPressBack={onBack}
      subtitle="Quyền lợi vận hành và trạng thái khả dụng thực tế"
      title="Gói dành cho người bán"
    >
      <ApiPendingCard feature="Gói hiện tại, hạn mức đăng deal và ngày gia hạn" />

      <BrandButton
        onPress={() =>
          Alert.alert('Nâng cấp Premium', 'Tính năng thanh toán đang được phát triển.')
        }
        style={styles.upgrade}
      >
        {`Nâng cấp Premium · ${formatPrice(SELLER_PREMIUM_PRICE)}`}
      </BrandButton>

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
              <Badge label={PLAN_FEATURE_STATUS_LABEL[feature.status]} />
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

const styles = StyleSheet.create({
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
