import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeIcon } from '@/features/home/components/home-icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import type { SellerPlan } from '@/features/seller/types';
import { useTheme } from '@/hooks/use-theme';

type DealQuotaCardProps = {
  plan: SellerPlan;
  onPressPlan: () => void;
};

// Gói hiện tại giới hạn số lượt đăng deal mỗi ngày, nên hạn mức nằm ngay trên danh sách deal.
export function DealQuotaCard({ plan, onPressPlan }: DealQuotaCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]}>Gói {plan.name}</Text>
        <Text style={[styles.quota, { color: theme.textSecondary }]}>
          {plan.dealPostsUsed}/{plan.dealPostsLimit} lượt đăng deal hôm nay
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Xem gói dịch vụ"
        accessibilityRole="button"
        onPress={onPressPlan}
        style={({ pressed }) => [
          styles.button,
          { borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <HomeIcon name={SellerIcons.crown} color={theme.primary} size={14} />
        <Text style={[styles.buttonLabel, { color: theme.text }]}>Xem gói</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '900', letterSpacing: -0.2 },
  quota: { fontSize: 12, fontWeight: '600' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  buttonLabel: { fontSize: 12.5, fontWeight: '800' },
  pressed: { opacity: 0.85 },
});
