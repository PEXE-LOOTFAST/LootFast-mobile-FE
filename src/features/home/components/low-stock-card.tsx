import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DealImage } from '@/features/home/components/deal-image';
import { HomeIcon } from '@/features/home/components/home-icon';
import { HomeIcons } from '@/features/home/constants/icons';
import type { Deal } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

type LowStockCardProps = {
  deal: Deal;
  onPress?: () => void;
};

export function LowStockCard({ deal, onPress }: LowStockCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={`${deal.name}, chỉ còn ${deal.remaining} phần`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <DealImage emoji={deal.emoji} emojiSize={32} style={styles.thumb} uri={deal.imageUrl} />

      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
          {deal.name}
        </Text>
        <Text numberOfLines={1} style={[styles.store, { color: theme.textSecondary }]}>
          {deal.store.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.primary }]}>{formatPrice(deal.price)}</Text>
          <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
            {formatPrice(deal.originalPrice)}
          </Text>
        </View>
        <View style={[styles.stock, { backgroundColor: theme.backgroundSelected }]}>
          <HomeIcon name={HomeIcons.flame} color={theme.danger} size={13} />
          <Text style={[styles.stockText, { color: theme.text }]}>
            Chỉ còn {deal.remaining} phần
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 284,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  thumb: { width: 92, height: 92, borderRadius: 16 },
  copy: { flex: 1, justifyContent: 'center', gap: 3 },
  name: { fontSize: 15, fontWeight: '800' },
  store: { fontSize: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: { fontSize: 16, fontWeight: '900' },
  originalPrice: { fontSize: 12, textDecorationLine: 'line-through' },
  stock: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stockText: { fontSize: 11, fontWeight: '800' },
});
