import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { DealImage } from '@/features/home/components/deal-image';
import { DealMeta } from '@/features/home/components/deal-meta';
import { HomeIcons } from '@/features/home/constants/icons';
import type { Deal } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';
import { formatDiscount, formatDistance, formatPrice } from '@/lib/format';

type DealQuickViewProps = {
  deal: Deal;
  onOpen: () => void;
  onClose: () => void;
};

// Thẻ xem nhanh nổi trên bản đồ khi chạm vào một ghim: đủ thông tin để quyết định có mở chi tiết.
export function DealQuickView({ deal, onOpen, onClose }: DealQuickViewProps) {
  const theme = useTheme();
  const discount = formatDiscount(deal.price, deal.originalPrice);

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Pressable
        accessibilityHint="Mở chi tiết deal"
        accessibilityLabel={`${deal.name}, ${deal.store.name}, giá ${formatPrice(deal.price)}`}
        accessibilityRole="button"
        onPress={onOpen}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
      >
        <DealImage emoji={deal.emoji} emojiSize={34} style={styles.image} uri={deal.imageUrl} />

        <View style={styles.copy}>
          <Text numberOfLines={1} style={[styles.store, { color: theme.textSecondary }]}>
            {deal.store.name}
          </Text>
          <Text numberOfLines={2} style={[styles.name, { color: theme.text }]}>
            {deal.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.primary }]}>{formatPrice(deal.price)}</Text>
            <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
              {formatPrice(deal.originalPrice)}
            </Text>
            {discount ? <Badge label={discount} size="sm" tone="danger" /> : null}
          </View>

          <View style={styles.meta}>
            <DealMeta
              icon={HomeIcons.clock}
              label={`${deal.pickupWindow.start}–${deal.pickupWindow.end}`}
            />
            <DealMeta icon={HomeIcons.distance} label={formatDistance(deal.distanceKm)} />
          </View>

          <Text style={[styles.stock, { color: theme.primary }]}>Còn {deal.remaining} phần</Text>
          <Text numberOfLines={1} style={[styles.address, { color: theme.textSecondary }]}>
            {deal.store.address}
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityLabel="Đóng xem nhanh"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onClose}
        style={styles.close}
      >
        <Icon name={HomeIcons.close} color={theme.textSecondary} size={14} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Lớp phủ bản đồ căn phải (flex-end) nên thẻ mặc định co vừa ảnh, chữ bị ép về 0 chiều rộng.
  card: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: Radius.xl,
    boxShadow: Shadow.overlay,
  },
  content: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md },
  pressed: { opacity: 0.85 },
  image: { width: 92, height: 92, borderRadius: Radius.lg },
  copy: { flex: 1, minWidth: 0, gap: 3, paddingRight: 18 },
  store: { fontSize: FontSize.footnote, fontWeight: FontWeight.medium },
  name: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold, lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  price: { fontSize: FontSize.subtitle, fontWeight: FontWeight.heavy },
  originalPrice: { fontSize: FontSize.footnote, textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', gap: Spacing.md },
  stock: { fontSize: FontSize.footnote, fontWeight: FontWeight.bold },
  address: { fontSize: FontSize.caption },
  close: { position: 'absolute', top: 10, right: 10, padding: Spacing.xs },
});
