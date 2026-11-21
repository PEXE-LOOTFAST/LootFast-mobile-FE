import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';

// Báo cáo nâng cao là quyền lợi Cao cấp; viền nét đứt để đọc như một khối còn khoá.
export function AdvancedReportCard({ onPressPlan }: { onPressPlan: () => void }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
      <Icon name={SellerIcons.crown} color={theme.primary} size={20} />

      <View style={styles.copy}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.primary }]}>
          Báo cáo nâng cao
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Xem tỷ lệ bán hết, món bán chạy, khung nhận hiệu quả và các chỉ số tổng hợp khác.
        </Text>

        <Pressable
          accessibilityLabel="Xem gói Cao cấp"
          accessibilityRole="button"
          onPress={onPressPlan}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary },
            pressed && styles.pressed,
          ]}
        >
          <Icon name={SellerIcons.crown} color={theme.onPrimary} size={14} />
          <Text style={[styles.buttonLabel, { color: theme.onPrimary }]}>Xem gói Cao cấp</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  copy: { flex: 1, gap: Spacing.sm },
  title: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.heavy, letterSpacing: -0.2 },
  description: { fontSize: FontSize.bodySm, lineHeight: 19 },
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: Spacing.xs,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonLabel: { fontSize: FontSize.bodySm, fontWeight: FontWeight.bold },
  pressed: { opacity: 0.85 },
});
