import type { Ref } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { IndicatorColor, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const BUTTON_SIZE = 44;
const DOT_SIZE = 12;
const BADGE_SIZE = 20;

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
  /** `surface`: nút có nền và viền trên thẻ/màn; `hero`: nút tròn nền mờ trên dải xanh của header. */
  tone?: 'surface' | 'hero';
  badgeCount?: number;
  /** Tô nổi nút khi tính năng nó điều khiển đang bật (vd. bộ lọc đang áp dụng). */
  isActive?: boolean;
  /** Chấm trạng thái ở góc nút (vd. GPS bật/tắt): on là xanh, off là cam. */
  indicator?: 'on' | 'off';
  ref?: Ref<View>;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = 'surface',
  badgeCount = 0,
  isActive = false,
  indicator,
  ref,
}: IconButtonProps) {
  const theme = useTheme();
  const onHero = tone === 'hero';
  const iconColor = isActive ? theme.primary : onHero ? theme.onHero : theme.text;
  // Viền badge/chấm cùng màu nền phía sau để chúng trông như khoét vào nút.
  const ringColor = onHero ? theme.hero : theme.backgroundElement;
  const surface = isActive
    ? { backgroundColor: theme.primarySoft, borderColor: theme.primary }
    : { backgroundColor: theme.backgroundElement, borderColor: theme.border };
  const toneStyle = onHero ? [styles.heroButton, { backgroundColor: theme.heroButton }] : surface;

  return (
    <Pressable
      ref={ref}
      accessibilityLabel={
        badgeCount > 0 ? `${accessibilityLabel}, ${badgeCount} mục mới` : accessibilityLabel
      }
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      hitSlop={Spacing.xs}
      onPress={onPress}
      style={({ pressed }) => [styles.button, toneStyle, pressed && styles.pressed]}
    >
      <Icon name={icon} color={iconColor} size={onHero ? 24 : 20} />

      {indicator ? (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: indicator === 'on' ? IndicatorColor.on : IndicatorColor.off,
              borderColor: ringColor,
            },
          ]}
        />
      ) : null}

      {badgeCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: theme.danger, borderColor: ringColor }]}>
          <AppText tone="onDanger" variant="micro" weight="heavy">
            {badgeCount > 9 ? '9+' : badgeCount}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  heroButton: { borderColor: 'transparent', borderRadius: Radius.full },
  pressed: { opacity: 0.8 },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderWidth: 2,
    borderRadius: DOT_SIZE / 2,
  },
  badge: {
    position: 'absolute',
    top: Spacing.xxs,
    right: Spacing.xxs,
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: BADGE_SIZE / 2,
    paddingHorizontal: Spacing.xs,
  },
});
