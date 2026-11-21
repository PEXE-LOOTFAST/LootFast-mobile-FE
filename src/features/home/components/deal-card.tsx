import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Radius, RatingColor, Shadow, Spacing } from '@/constants/theme';
import { DealImage } from '@/features/home/components/deal-image';
import { DealMeta } from '@/features/home/components/deal-meta';
import { LOW_STOCK_THRESHOLD } from '@/features/home/constants/deals';
import { HomeIcons } from '@/features/home/constants/icons';
import type { Deal } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';
import { formatDiscount, formatDistance, formatPrice } from '@/lib/format';

const IMAGE_HEIGHT = 148;

type DealCardProps = {
  deal: Deal;
  onPress?: () => void;
};

/**
 * Thẻ deal ảnh lớn phía trên: món ăn là thứ khiến người ta bấm vào, nên ảnh chiếm phần lớn thẻ.
 * Trên ảnh chỉ đặt % giảm, khoảng cách và cảnh báo sắp hết; tên, quán, giá và giờ lấy nằm dưới.
 */
export function DealCard({ deal, onPress }: DealCardProps) {
  const theme = useTheme();
  const discount = formatDiscount(deal.price, deal.originalPrice);
  const isLowStock = deal.remaining <= LOW_STOCK_THRESHOLD;
  const hasRating = deal.store.rating > 0;

  return (
    <Pressable
      accessibilityLabel={`${deal.name}, ${deal.store.name}, giá ${formatPrice(deal.price)}, lấy từ ${deal.pickupWindow.start} đến ${deal.pickupWindow.end}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.media}>
        <DealImage emoji={deal.emoji} emojiSize={48} style={styles.image} uri={deal.imageUrl} />

        <View style={styles.overlayTop}>
          {discount ? <Badge label={discount} size="lg" tone="danger" /> : <View />}
          <View style={[styles.pill, { backgroundColor: theme.backgroundElement }]}>
            <Icon name={HomeIcons.distance} color={theme.text} size={12} />
            <AppText variant="footnote" weight="bold">
              {formatDistance(deal.distanceKm)}
            </AppText>
          </View>
        </View>

        {isLowStock ? (
          <View style={[styles.pill, styles.stock, { backgroundColor: theme.accent }]}>
            <Icon name={HomeIcons.flame} color={theme.onAccent} size={12} />
            <AppText tone="onAccent" variant="footnote" weight="bold">
              Chỉ còn {deal.remaining} phần
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <AppText numberOfLines={2} variant="subtitle" weight="bold">
          {deal.name}
        </AppText>

        <View style={styles.storeRow}>
          <AppText numberOfLines={1} style={styles.storeName} tone="textSecondary" variant="bodySm">
            {deal.store.name}
          </AppText>
          {deal.store.isVerified ? (
            <Icon name={HomeIcons.verified} color={theme.primary} size={14} />
          ) : null}
          {/* Feed deal không kèm điểm đánh giá nên 0 nghĩa là "chưa biết", không phải 0 sao. */}
          {hasRating ? (
            <View style={styles.rating}>
              <Icon name={HomeIcons.star} color={RatingColor} size={13} />
              <AppText variant="bodySm" weight="bold">
                {deal.store.rating.toFixed(1)}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <View style={styles.priceRow}>
            <AppText tone="primary" variant="title" weight="heavy">
              {formatPrice(deal.price)}
            </AppText>
            <AppText style={styles.originalPrice} tone="textSecondary" variant="footnote">
              {formatPrice(deal.originalPrice)}
            </AppText>
          </View>
          <DealMeta
            compact
            icon={HomeIcons.clock}
            label={`Lấy ${deal.pickupWindow.start}–${deal.pickupWindow.end}`}
          />
        </View>
      </View>
    </Pressable>
  );
}

/** Thẻ giữ chỗ cùng dáng `DealCard`, hiện lúc feed đang tải lần đầu. */
export function DealCardSkeleton() {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Skeleton height={IMAGE_HEIGHT} radius="none" />
      <View style={styles.body}>
        <Skeleton height={18} width="70%" />
        <Skeleton height={14} width="45%" />
        <View style={styles.footer}>
          <Skeleton height={20} width={90} />
          <Skeleton height={14} width={110} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Radius.lg,
    boxShadow: Shadow.card,
  },
  pressed: { transform: [{ scale: 0.985 }] },
  media: { height: IMAGE_HEIGHT },
  image: { width: '100%', height: IMAGE_HEIGHT },
  overlayTop: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  stock: { position: 'absolute', bottom: Spacing.sm, left: Spacing.sm },
  body: { gap: Spacing.xs, padding: Spacing.md },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  storeName: { flexShrink: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs, marginLeft: 'auto' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.xxs,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.xs },
  originalPrice: { textDecorationLine: 'line-through' },
});
