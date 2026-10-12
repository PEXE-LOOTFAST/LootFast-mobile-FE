import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { DealImage } from '@/features/home/components/deal-image';
import { HomeIcons } from '@/features/home/constants/icons';
import type { Deal } from '@/features/home/types';
import { useTheme } from '@/hooks/use-theme';
import { formatDiscount } from '@/lib/format';

const HERO_HEIGHT = 180;

type DealDetailHeroProps = {
  deal: Deal;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
};

export function DealDetailHero({
  deal,
  isFavorite,
  onBack,
  onToggleFavorite,
  onShare,
}: DealDetailHeroProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const discount = formatDiscount(deal.price, deal.originalPrice);

  return (
    <View>
      <DealImage
        emoji={deal.emoji}
        emojiSize={80}
        style={{ height: HERO_HEIGHT + insets.top }}
        uri={deal.imageUrl}
      />

      <View style={[styles.actions, { top: insets.top + 12 }]}>
        <HeroButton accessibilityLabel="Quay lại" icon={HomeIcons.back} onPress={onBack} />
        <View style={styles.actionGroup}>
          {/* Material Symbols trên Android/web không có bản tô đặc, nên trạng thái "đã thích"
              thể hiện bằng nền đỏ thay vì đổi sang icon trái tim đặc. */}
          <HeroButton
            accessibilityLabel={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            activeColor={isFavorite ? theme.danger : undefined}
            icon={HomeIcons.heart}
            onPress={onToggleFavorite}
          />
          <HeroButton accessibilityLabel="Chia sẻ deal" icon={HomeIcons.share} onPress={onShare} />
        </View>
      </View>

      {discount ? (
        <View style={[styles.discount, { backgroundColor: theme.danger }]}>
          <Text style={styles.discountText}>{discount}</Text>
        </View>
      ) : null}
    </View>
  );
}

type HeroButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  activeColor?: string;
};

function HeroButton({ icon, accessibilityLabel, onPress, activeColor }: HeroButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: activeColor !== undefined }}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.heroButton,
        activeColor ? { backgroundColor: activeColor } : null,
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} color="#FFFFFF" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionGroup: { flexDirection: 'row', gap: 10 },
  heroButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(23, 33, 27, 0.4)',
  },
  pressed: { opacity: 0.8 },
  discount: {
    position: 'absolute',
    left: 16,
    bottom: 14,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});
