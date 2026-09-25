import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeIcon } from '@/features/home/components/home-icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';

// Báo cáo nâng cao là quyền lợi Cao cấp; viền nét đứt để đọc như một khối còn khoá.
export function AdvancedReportCard({ onPressPlan }: { onPressPlan: () => void }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
      <HomeIcon name={SellerIcons.crown} color={theme.primary} size={20} />

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
          <HomeIcon name={SellerIcons.crown} color="#FFFFFF" size={14} />
          <Text style={styles.buttonLabel}>Xem gói Cao cấp</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 16,
  },
  copy: { flex: 1, gap: 8 },
  title: { fontSize: 15, fontWeight: '900', letterSpacing: -0.2 },
  description: { fontSize: 12.5, lineHeight: 19 },
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.85 },
});
