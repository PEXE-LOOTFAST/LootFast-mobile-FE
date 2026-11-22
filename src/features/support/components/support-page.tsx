import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { TabHeader } from '@/components/ui/tab-header';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SupportPageProps = {
  title: string;
  /** Màn quay về khi mở thẳng bằng đường dẫn, không có màn trước trong ngăn xếp. */
  fallbackHref: Href;
  children: ReactNode;
};

/** Khung chung của màn Hỗ trợ và màn Chính sách: header chung có nút quay lại và vùng cuộn. */
export function SupportPage({ title, fallbackHref, children }: SupportPageProps) {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <TabHeader
        onBack={() => (router.canGoBack() ? router.back() : router.navigate(fallbackHref))}
        title={title}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
});
