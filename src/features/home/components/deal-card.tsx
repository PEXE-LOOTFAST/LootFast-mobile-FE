import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { DealImage } from '@/features/home/components/deal-image';
import { DealMeta } from '@/features/home/components/deal-meta';
import { FontSize, FontWeight, Radius, RatingColor, Shadow, Spacing } from '@/constants/theme';
import { LOW_STOCK_THRESHOLD } from '@/features/home/constants/deals';
import { HomeIcons } from '@/features/home/constants/icons';
import type { Deal } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';
import { formatDiscount, formatDistance, formatPrice } from '@/lib/format';

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
          <Badge label={discount} size="sm" style={styles.discount} tone="danger" />
        ) : null}

        {/* Chỉ báo số phần khi sắp hết, nằm sát đáy ảnh để không che món. */}
        {isLowStock ? (
          <View style={[styles.stock, { backgroundColor: theme.accent }]}>
            <Icon name={HomeIcons.flame} color={theme.onAccent} size={11} />
            <Text style={[styles.stockText, { color: theme.onAccent }]}>
              Còn {deal.remaining} phần
            </Text>
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
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: 10,
    boxShadow: Shadow.card,
  },
  pressed: { transform: [{ scale: 0.985 }] },
  mediaWrap: { width: IMAGE_SIZE, height: IMAGE_SIZE },
  media: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: Radius.md },
  discount: { position: 'absolute', top: 6, left: 6 },
  stock: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    paddingVertical: Spacing.xxs,
  },
  stockText: { fontSize: FontSize.micro, fontWeight: FontWeight.bold },
  body: { flex: 1, minWidth: 0, gap: 3 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  storeName: { flexShrink: 1, fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  rating: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs, marginLeft: 'auto' },
  ratingText: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  name: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold, lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: { fontSize: FontSize.title, fontWeight: FontWeight.heavy },
  originalPrice: { fontSize: FontSize.footnote, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.md, rowGap: Spacing.xxs },
});
