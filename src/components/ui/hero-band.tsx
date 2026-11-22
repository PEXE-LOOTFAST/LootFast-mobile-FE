import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocusedStatusBar } from '@/components/ui/focused-status-bar';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const DECOR_SIZE = 220;

/**
 * Dải thương hiệu xanh đầu màn: tràn lên dưới status bar (nên status bar chữ sáng khi màn đang
 * hiện), bo hai góc dưới, có vòng tròn sáng hơn ở góc phải lặp lại hình tròn trong icon app.
 * Dùng chung cho header Trang chủ và header của mọi tab ở cả ba khu người mua, bán, quản trị.
 */
export function HeroBand({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <FocusedStatusBar style="light" />
      <View
        style={[styles.band, { backgroundColor: theme.hero, paddingTop: insets.top + Spacing.md }]}
      >
        <View style={[styles.decor, { backgroundColor: theme.heroDecor }]} />
        <View style={styles.content}>{children}</View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  band: {
    overflow: 'hidden',
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    paddingBottom: Spacing.lg,
  },
  decor: {
    position: 'absolute',
    top: -DECOR_SIZE / 2,
    right: -DECOR_SIZE / 4,
    width: DECOR_SIZE,
    height: DECOR_SIZE,
    borderRadius: Radius.full,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
