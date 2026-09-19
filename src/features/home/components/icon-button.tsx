import type { Ref } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeIcon } from '@/features/home/components/home-icon';
import { HomeHeaderColors } from '@/features/home/constants/colors';
import type { HomeIconName } from '@/features/home/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type IconButtonProps = {
  icon: HomeIconName;
  accessibilityLabel: string;
  onPress?: () => void;
  tone?: 'header' | 'surface';
  badgeCount?: number;
  /** Tô nổi nút khi tính năng nó điều khiển đang bật (vd. bộ lọc đang áp dụng). */
  isActive?: boolean;
  ref?: Ref<View>;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = 'surface',
  badgeCount = 0,
  isActive = false,
  ref,
}: IconButtonProps) {
  const theme = useTheme();
  const onHeader = tone === 'header';
  const iconColor = onHeader ? HomeHeaderColors.text : isActive ? theme.primary : theme.text;
  const surface = isActive
    ? { backgroundColor: theme.primarySoft, borderColor: theme.primary }
    : { backgroundColor: theme.backgroundElement, borderColor: theme.border };

  return (
    <Pressable
      ref={ref}
      accessibilityLabel={
        badgeCount > 0 ? `${accessibilityLabel}, ${badgeCount} mục mới` : accessibilityLabel
      }
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        onHeader ? styles.headerButton : surface,
        pressed && styles.pressed,
      ]}
    >
      <HomeIcon name={icon} color={iconColor} size={onHeader ? 24 : 20} />

      {badgeCount > 0 ? (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.danger,
              borderColor: onHeader ? HomeHeaderColors.background : theme.backgroundElement,
            },
          ]}
        >
          <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
  },
  headerButton: { backgroundColor: 'transparent', borderColor: 'transparent' },
  pressed: { opacity: 0.8 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
});
