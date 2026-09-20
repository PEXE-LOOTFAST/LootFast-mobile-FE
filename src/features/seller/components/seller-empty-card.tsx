import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type SellerEmptyCardProps = {
  title: string;
  description: string;
};

// Thẻ trống dùng chung cho các mục chưa có dữ liệu của trang Đơn hàng.
export function SellerEmptyCard({ title, description }: SellerEmptyCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: { fontSize: 15, fontWeight: '900', letterSpacing: -0.2, textAlign: 'center' },
  description: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
