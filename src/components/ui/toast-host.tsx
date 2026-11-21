import { useEffect, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { UiIcons } from '@/constants/icons';
import { MaxContentWidth, Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { dismissToast, getToast, subscribeToast, type ToastTone } from '@/lib/toast';

const ICONS: Record<ToastTone, IconName> = {
  success: UiIcons.success,
  error: UiIcons.warning,
  info: UiIcons.info,
};

/** Nơi vẽ toast của toàn app, gắn một lần ở layout gốc. Gọi `showToast` trong `@/lib/toast`. */
export function ToastHost() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useSyncExternalStore(subscribeToast, getToast, getToast);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => dismissToast(toast.id), toast.durationMs);

    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const accent =
    toast.tone === 'success' ? theme.primary : toast.tone === 'error' ? theme.danger : theme.text;

  return (
    <Animated.View
      key={toast.id}
      entering={FadeInUp.duration(180)}
      exiting={FadeOutUp.duration(150)}
      pointerEvents="box-none"
      style={[styles.layer, { top: insets.top + Spacing.sm }]}
    >
      <Pressable
        accessibilityHint="Chạm để ẩn"
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        onPress={() => dismissToast(toast.id)}
        style={[
          styles.toast,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        <Icon name={ICONS[toast.tone]} color={accent} size={20} />
        <AppText style={styles.message} variant="body" weight="medium">
          {toast.message}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    right: 0,
    left: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  toast: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    boxShadow: Shadow.floating,
  },
  message: { flex: 1 },
});
