import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type SavingsSummaryCardProps = {
  total: number;
};

export function SavingsSummaryCard({ total }: SavingsSummaryCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Text style={[styles.label, { color: theme.textSecondary }]}>TIẾT KIỆM</Text>
      <Text style={[styles.amount, { color: theme.primary }]}>{formatPrice(total)}</Text>
      <Text style={[styles.note, { color: theme.textSecondary }]}>
        Chỉ đơn đã hoàn thành mới được ghi nhận tiết kiệm và điểm thưởng.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    boxShadow: '0px 6px 18px rgba(23, 33, 27, 0.06)',
  },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  amount: { fontSize: 26, fontWeight: '900', letterSpacing: -0.4 },
  note: { fontSize: 12, lineHeight: 18 },
});
