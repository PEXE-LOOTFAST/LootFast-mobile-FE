import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { TabHeader } from '@/components/ui/tab-header';
import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { useTheme } from '@/hooks/use-theme';

type SellerPageScaffoldProps = {
  title: string;
  subtitle: string;
  onPressBack: () => void;
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
      <TabHeader onBack={onPressBack} subtitle={subtitle} title={title} variant="seller" />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>{children}</View>
      </KeyboardAwareScrollView>

      <AssistantFab bottomOffset={96} />
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
    paddingHorizontal: 16,
  },
});
