import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type DealCardProps = {
  emoji: string;
  name: string;
  store: string;
  currentPrice: string;
  originalPrice: string;
  pickupTime: string;
  remaining: number;
};

export function DealCard({
  emoji,
  name,
  store,
  currentPrice,
  originalPrice,
  pickupTime,
  remaining,
}: DealCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.artwork, { backgroundColor: theme.primarySoft }]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={[styles.discountBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.discountText}>-50%</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
          {name}
        </Text>
        <Text numberOfLines={1} style={[styles.store, { color: theme.textSecondary }]}>
          {store}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.primary }]}>{currentPrice}</Text>
          <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
            {originalPrice}
          </Text>
        </View>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          🕒 {pickupTime} · Còn {remaining} phần
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 236,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 20,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  artwork: { height: 128, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 58 },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  discountText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  content: { padding: 14, gap: 5 },
  name: { fontSize: 17, fontWeight: '800' },
  store: { fontSize: 13 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 16, fontWeight: '800' },
  originalPrice: { fontSize: 12, textDecorationLine: 'line-through' },
  meta: { marginTop: 3, fontSize: 12 },
});
