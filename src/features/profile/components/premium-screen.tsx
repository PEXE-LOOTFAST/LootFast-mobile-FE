import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { ProfileIcons } from '@/features/profile/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type PremiumScreenProps = {
  onBack: () => void;
};

type Benefit = {
  label: string;
  premiumLabel?: string;
};

const FREE_BENEFITS: Benefit[] = [
  { label: 'Gợi ý món cơ bản', premiumLabel: '5 gợi ý/ngày' },
  { label: 'Chat với quán', premiumLabel: '5 lượt/ngày' },
  { label: 'Gợi ý deal hồi sắp hết', premiumLabel: '3 deal/ngày' },
  { label: 'Xem deal cuối ngày gần bạn' },
  { label: 'Lưu món và quán yêu thích' },
  { label: 'Theo dõi đơn hàng' },
];

const PREMIUM_BENEFITS: Benefit[] = [
  { label: 'Gợi ý món cá nhân hoá', premiumLabel: 'Không giới hạn' },
  { label: 'Chat với quán', premiumLabel: 'Không giới hạn' },
  { label: 'Cảnh báo deal hồi sắp hết theo thời gian thực', premiumLabel: 'Không giới hạn' },
  { label: 'Nhận thông báo deal sớm' },
  { label: 'Theo dõi nhiều quán yêu thích hơn' },
  { label: 'Bộ lọc tìm deal nâng cao' },
  { label: 'Thông báo hành trình mua deal' },
  { label: 'Hỗ trợ ưu tiên' },
];

function BenefitRow({ benefit, accent }: { benefit: Benefit; accent: string }) {
  const theme = useTheme();

  return (
    <View style={styles.benefitRow}>
      <Icon name={ProfileIcons.check} color={accent} size={16} />
      <Text style={[styles.benefitLabel, { color: theme.text }]}>{benefit.label}</Text>
      {benefit.premiumLabel ? (
        <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.badgeText, { color: accent }]}>{benefit.premiumLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

function PlanCard({
  benefits,
  color,
  current,
  onPress,
  premium = false,
  price,
  title,
}: {
  benefits: Benefit[];
  color: string;
  current?: boolean;
  onPress?: () => void;
  premium?: boolean;
  price: string;
  title: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.planCard,
        { backgroundColor: color, borderColor: premium ? '#8BC8E8' : theme.textSecondary },
      ]}
    >
      <View style={styles.planHeader}>
        <View>
          <Text style={[styles.planTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.planPrice, { color: premium ? '#12659A' : theme.text }]}>
            {price}
          </Text>
        </View>
        <Icon
          name={ProfileIcons.check}
          color={premium ? '#12659A' : theme.textSecondary}
          size={22}
        />
      </View>
      <View style={styles.benefits}>
        {benefits.map((benefit) => (
          <BenefitRow
            accent={premium ? '#247EA9' : theme.textSecondary}
            benefit={benefit}
            key={benefit.label}
          />
        ))}
      </View>
      {current ? (
        <View style={[styles.currentButton, { borderColor: '#D4E2DC' }]}>
          <Text style={[styles.currentButtonText, { color: theme.text }]}>Đang dùng</Text>
        </View>
      ) : (
        <Pressable onPress={onPress} style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Mua Premium</Text>
        </Pressable>
      )}
    </View>
  );
}

export function PremiumScreen({ onBack }: PremiumScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            onPress={onBack}
            style={styles.backButton}
          >
            <Icon name={ProfileIcons.back} color="#FFFFFF" size={20} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Gói cao cấp</Text>
            <Text style={styles.headerSubtitle}>
              Quyền lợi thông minh cho trải nghiệm mua deal thuận tiện hơn
            </Text>
          </View>
          <Icon name={ProfileIcons.premium} color="#FFFFFF" size={28} />
        </View>

        <View style={styles.body}>
          <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>GÓI DỊCH VỤ</Text>
          <Text style={[styles.status, { color: theme.textSecondary }]}>
            Gói hạn mức AI hiện tại:{' '}
            <Text style={{ color: theme.text, fontWeight: '800' }}>Miễn phí</Text>
          </Text>

          <PlanCard
            benefits={FREE_BENEFITS}
            color={theme.backgroundElement}
            current
            price="Miễn phí"
            title="Miễn phí"
          />
          <PlanCard
            benefits={PREMIUM_BENEFITS}
            color="#DDF2FC"
            onPress={() => Alert.alert('Mua Premium', 'Tính năng thanh toán đang được phát triển.')}
            premium
            price="29.000 VND"
            title="Cao cấp"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingBottom: 110 },
  header: {
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    gap: 12,
    minHeight: 104,
    paddingHorizontal: 16,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerCopy: { flex: 1, gap: 4 },
  headerTitle: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' },
  headerSubtitle: { color: '#DDF2E5', fontSize: 12, lineHeight: 17 },
  body: { gap: 8, padding: 16 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 0.4, marginTop: 8 },
  status: { fontSize: 12, marginBottom: 2 },
  planCard: { borderRadius: 18, borderWidth: 1.5, gap: 14, marginTop: 8, padding: 16 },
  planHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  planTitle: { fontSize: 16, fontWeight: '900' },
  planPrice: { fontSize: 21, fontWeight: '900', marginTop: 4 },
  benefits: { gap: 9 },
  benefitRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  benefitLabel: { flexShrink: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  badge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '900' },
  currentButton: {
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 2,
  },
  currentButtonText: { fontSize: 14, fontWeight: '900' },
  buyButton: {
    alignItems: 'center',
    backgroundColor: '#126FA6',
    borderRadius: 11,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 2,
  },
  buyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
