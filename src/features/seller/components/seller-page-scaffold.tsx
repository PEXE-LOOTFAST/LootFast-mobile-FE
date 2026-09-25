import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MaxContentWidth } from '@/constants/theme';
import { AssistantFab } from '@/features/home/components/assistant-fab';
import { SellerPageHeader } from '@/features/seller/components/seller-page-header';
import { useLightStatusBar } from '@/features/seller/hooks/use-light-status-bar';
import { useTheme } from '@/hooks/use-theme';

type SellerPageScaffoldProps = {
  title: string;
  subtitle: string;
  onPressBack: () => void;
  children: ReactNode;
};

// Khung chung của các trang con người bán: header xanh có nút quay lại, nội dung cuộn và
// nút trợ lý nổi trên thanh tab.
export function SellerPageScaffold({
  title,
  subtitle,
  onPressBack,
  children,
}: SellerPageScaffoldProps) {
  const theme = useTheme();
  useLightStatusBar();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SellerPageHeader onPressBack={onPressBack} subtitle={subtitle} title={title} />
        <View style={styles.body}>{children}</View>
      </ScrollView>

      {/* Nâng lên trên thanh tab người bán để nút trợ lý không đè lên nút Đăng deal. */}
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
