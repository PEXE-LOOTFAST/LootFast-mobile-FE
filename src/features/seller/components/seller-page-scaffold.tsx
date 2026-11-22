import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { TabHeader } from '@/components/ui/tab-header';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { SellerHeader } from '@/features/seller/components/seller-header';
import { useTheme } from '@/hooks/use-theme';

type SellerPageScaffoldProps = {
  title: string;
  subtitle: string;
  /**
   * Có thì là màn phụ: header hiện nút quay lại. Bỏ trống cho màn là một tab: header giống các tab
   * khác (logo + chuông), vì tab không có "màn trước" để quay về.
   */
  onPressBack?: () => void;
  children: ReactNode;
};

export function SellerPageScaffold({
  title,
  subtitle,
  onPressBack,
  children,
}: SellerPageScaffoldProps) {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {onPressBack ? (
        <TabHeader onBack={onPressBack} subtitle={subtitle} title={title} variant="seller" />
      ) : (
        <SellerHeader subtitle={subtitle} title={title} />
      )}

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>{children}</View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 120 },
  body: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    marginTop: 14,
    paddingHorizontal: Spacing.lg,
  },
});
