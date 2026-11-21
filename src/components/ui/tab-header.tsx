import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { UiIcons } from '@/constants/icons';
import { HeaderColors, Radius, Spacing, type HeaderVariant } from '@/constants/theme';

type TabHeaderProps = {
  title: string;
  /** Một dòng phụ; dài quá sẽ bị cắt để header luôn cùng chiều cao giữa các tab. */
  subtitle?: string;
  subtitleIcon?: IconName;
  /** Có thì hiện nút quay lại bên trái tiêu đề. */
  onBack?: () => void;
  /** Cụm nút hành động bên phải (vd. GPS, thông báo). */
  trailing?: ReactNode;
  variant?: HeaderVariant;
};

/**
 * Header xanh đậm dùng chung cho các tab của người mua: cùng chiều cao, cùng cấu trúc
 * (tiêu đề + dòng phụ bên trái, hành động bên phải) để chuyển tab không thấy khung nhảy.
 */
export function TabHeader({
  title,
  subtitle,
  subtitleIcon,
  onBack,
  trailing,
  variant = 'buyer',
}: TabHeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = HeaderColors[variant];

  // Nền xanh đậm cần icon status bar màu sáng. Trả về 'auto' khi rời màn,
  // nếu không các màn nền sáng khác sẽ bị icon trắng chìm mất.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.sm, backgroundColor: colors.background },
      ]}
    >
      <View style={styles.decorationLayer}>
        <View style={[styles.decoration, { backgroundColor: colors.decoration }]} />
      </View>

      <View style={styles.row}>
        {onBack ? (
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={Spacing.xs}
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.control },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={UiIcons.back} color={colors.text} size={18} />
          </Pressable>
        ) : null}

        <View style={styles.copy}>
          <AppText
            accessibilityRole="header"
            adjustsFontSizeToFit
            color={colors.text}
            minimumFontScale={0.8}
            numberOfLines={1}
            style={styles.title}
            variant="titleLg"
            weight="heavy"
          >
            {title}
          </AppText>
          {subtitle ? (
            <View style={styles.subtitleRow}>
              {subtitleIcon ? (
                <Icon name={subtitleIcon} color={colors.textMuted} size={13} />
              ) : null}
              <AppText
                color={colors.textMuted}
                numberOfLines={1}
                style={styles.subtitle}
                variant="footnote"
                weight="medium"
              >
                {subtitle}
              </AppText>
            </View>
          ) : null}
        </View>

        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  decorationLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  decoration: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: -50,
    right: -50,
    borderRadius: Radius.full,
    opacity: 0.5,
  },
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  pressed: { opacity: 0.8 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  copy: { flex: 1, minWidth: 0, gap: Spacing.xxs },
  title: { letterSpacing: -0.3 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  subtitle: { flexShrink: 1 },
});
