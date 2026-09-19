import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DealImage } from '@/features/home/components/deal-image';
import { DealMeta } from '@/features/home/components/deal-meta';
import { HomeIcon } from '@/features/home/components/home-icon';
import { RatingColor } from '@/features/home/constants/colors';
import { LOW_STOCK_THRESHOLD } from '@/features/home/constants/deals';
import { HomeIcons } from '@/features/home/constants/icons';
import type { Deal } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';
import { formatDiscount, formatDistance, formatPrice } from '@/lib/format';

const LOW_STOCK_TEXT = '#3B2400';

type DealCardProps = {
  deal: Deal;
  onPress?: () => void;
};

export function DealCard({ deal, onPress }: DealCardProps) {
  const theme = useTheme();
  const discount = formatDiscount(deal.price, deal.originalPrice);
  const isLowStock = deal.remaining <= LOW_STOCK_THRESHOLD;

  return (
    <Pressable
      accessibilityLabel={`${deal.name}, ${deal.store.name}, giá ${formatPrice(deal.price)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <View>
        <DealImage emoji={deal.emoji} emojiSize={64} style={styles.media} uri={deal.imageUrl} />

        {discount ? (
          <View style={[styles.discount, { backgroundColor: theme.danger }]}>
            <Text style={styles.discountText}>{discount}</Text>
          </View>
        ) : null}

        {/* Chỉ báo số phần khi sắp hết, tránh che ảnh món ở những deal còn nhiều. */}
        {isLowStock ? (
          <View style={[styles.stock, { backgroundColor: theme.accent }]}>
            <HomeIcon name={HomeIcons.flame} color={LOW_STOCK_TEXT} size={14} />
            <Text style={styles.stockText}>Còn {deal.remaining} phần</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.storeRow}>
          <View style={[styles.storeIcon, { backgroundColor: theme.primarySoft }]}>
            <HomeIcon name={HomeIcons.store} color={theme.primary} size={14} />
          </View>
          <Text numberOfLines={1} style={[styles.storeName, { color: theme.textSecondary }]}>
            {deal.store.name}
          </Text>
          {deal.store.isVerified ? (
            <HomeIcon name={HomeIcons.verified} color={theme.primary} size={15} />
          ) : null}
          <View style={styles.rating}>
            <HomeIcon name={HomeIcons.star} color={RatingColor} size={14} />
            <Text style={[styles.ratingText, { color: theme.text }]}>
              {deal.store.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text numberOfLines={2} style={[styles.name, { color: theme.text }]}>
          {deal.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.primary }]}>{formatPrice(deal.price)}</Text>
          <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
            {formatPrice(deal.originalPrice)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <DealMeta
            icon={HomeIcons.clock}
            label={`${deal.pickupWindow.start}–${deal.pickupWindow.end}`}
          />
          <DealMeta icon={HomeIcons.distance} label={formatDistance(deal.distanceKm)} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 20,
    boxShadow: '0px 8px 20px rgba(23, 33, 27, 0.06)',
  },
  pressed: { transform: [{ scale: 0.985 }] },
  media: { height: 170 },
  discount: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  discountText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  stock: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  stockText: { color: LOW_STOCK_TEXT, fontSize: 12, fontWeight: '800' },
  body: { gap: 6, padding: 14 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storeIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  storeName: { flexShrink: 1, fontSize: 13, fontWeight: '600' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' },
  ratingText: { fontSize: 13, fontWeight: '800' },
  name: { fontSize: 17, fontWeight: '800', lineHeight: 23 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { fontSize: 20, fontWeight: '900' },
  originalPrice: { fontSize: 13, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 4 },
});
