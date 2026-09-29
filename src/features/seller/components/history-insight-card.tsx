import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';

// Gói miễn phí chỉ thấy lời mời; gợi ý số lượng và mức giảm theo lịch sử bán là quyền lợi Cao cấp.
export function HistoryInsightCard({ onPressUpgrade }: { onPressUpgrade: () => void }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
      <View style={styles.headline}>
        <Icon name={SellerIcons.crown} color={theme.primary} size={18} />
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          Mở khoá gợi ý dựa trên lịch sử
        </Text>
      </View>

      <Text style={[styles.description, { color: theme.textSecondary }]}>
        Nhận gợi ý có giải thích về số lượng, mức giảm và khung nhận phù hợp.
      </Text>

      <Pressable
        accessibilityLabel="Nâng cấp gói Cao cấp"
        accessibilityRole="button"
        onPress={onPressUpgrade}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.primary },
          pressed && styles.pressed,
        ]}
      >
        <Icon name={SellerIcons.crown} color="#FFFFFF" size={14} />
        <Text style={styles.buttonLabel}>Nâng cấp gói Cao cấp</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, borderWidth: 1, borderRadius: 20, padding: 16 },
  headline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flexShrink: 1, fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  description: { fontSize: 12.5, lineHeight: 18 },
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    boxShadow: '0px 6px 14px rgba(22, 121, 75, 0.25)',
  },
  buttonLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.85 },
});
