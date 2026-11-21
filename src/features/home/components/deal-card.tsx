import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { DealImage } from '@/features/home/components/deal-image';
import { DealMeta } from '@/features/home/components/deal-meta';
import { RatingColor } from '@/constants/theme';
import { LOW_STOCK_THRESHOLD } from '@/features/home/constants/deals';
import { HomeIcons } from '@/features/home/constants/icons';
import type { Deal } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';
import { formatDiscount, formatDistance, formatPrice } from '@/lib/format';

const LOW_STOCK_TEXT = '#3B2400';
const IMAGE_SIZE = 96;

type DealCardProps = {
  deal: Deal;
  onPress?: () => void;
};

// Thẻ ngang gọn (ảnh vuông bên trái, thông tin bên phải) để một màn hình xem được nhiều deal.
export function DealCard({ deal, onPress }: DealCardProps) {
  const theme = useTheme();
  const discount = formatDiscount(deal.price, deal.originalPrice);
  const isLowStock = deal.remaining <= LOW_STOCK_THRESHOLD;
  const hasRating = deal.store.rating > 0;

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
      <View style={styles.mediaWrap}>
        <DealImage emoji={deal.emoji} emojiSize={36} style={styles.media} uri={deal.imageUrl} />

        {discount ? (
          <View style={[styles.discount, { backgroundColor: theme.danger }]}>
            <Text style={[styles.discountText, { color: theme.onDanger }]}>{discount}</Text>
          </View>
        ) : null}

        {/* Chỉ báo số phần khi sắp hết, nằm sát đáy ảnh để không che món. */}
        {isLowStock ? (
          <View style={[styles.stock, { backgroundColor: theme.accent }]}>
            <Icon name={HomeIcons.flame} color={LOW_STOCK_TEXT} size={11} />
            <Text style={styles.stockText}>Còn {deal.remaining} phần</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.storeRow}>
          <Text numberOfLines={1} style={[styles.storeName, { color: theme.textSecondary }]}>
            {deal.store.name}
          </Text>
          {deal.store.isVerified ? (
            <Icon name={HomeIcons.verified} color={theme.primary} size={13} />
          ) : null}
          {/* Feed deal không kèm điểm đánh giá nên giá trị 0 nghĩa là "chưa biết", không phải 0 sao:
              ẩn đi thay vì hiện "0.0" mâu thuẫn với điểm thật ở trang chi tiết. */}
          {hasRating ? (
            <View style={styles.rating}>
              <Icon name={HomeIcons.star} color={RatingColor} size={12} />
              <Text style={[styles.ratingText, { color: theme.text }]}>
                {deal.store.rating.toFixed(1)}
              </Text>
            </View>
          ) : null}
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
            compact
            icon={HomeIcons.clock}
            label={`${deal.pickupWindow.start}–${deal.pickupWindow.end}`}
          />
          <DealMeta compact icon={HomeIcons.distance} label={formatDistance(deal.distanceKm)} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    boxShadow: '0px 4px 12px rgba(23, 33, 27, 0.05)',
  },
  pressed: { transform: [{ scale: 0.985 }] },
  mediaWrap: { width: IMAGE_SIZE, height: IMAGE_SIZE },
  media: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 12 },
  discount: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  discountText: { fontSize: 11, fontWeight: '900' },
  stock: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 2,
  },
  stockText: { color: LOW_STOCK_TEXT, fontSize: 10, fontWeight: '800' },
  body: { flex: 1, minWidth: 0, gap: 3 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storeName: { flexShrink: 1, fontSize: 12, fontWeight: '600' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto' },
  ratingText: { fontSize: 12, fontWeight: '800' },
  name: { fontSize: 15, fontWeight: '800', lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: { fontSize: 17, fontWeight: '900' },
  originalPrice: { fontSize: 12, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 2 },
});
