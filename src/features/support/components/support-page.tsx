import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { MaxContentWidth } from '@/constants/theme';
import { SupportIcons } from '@/features/support/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type SupportPageProps = {
  title: string;
  /** Màn quay về khi mở thẳng bằng đường dẫn, không có màn trước trong ngăn xếp. */
  fallbackHref: Href;
  children: ReactNode;
};

/** Khung chung của màn Hỗ trợ và màn Chính sách: thanh tiêu đề có nút quay lại và vùng cuộn. */
export function SupportPage({ title, fallbackHref, children }: SupportPageProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.navigate(fallbackHref))}
        >
          <Icon name={SupportIcons.back} color={theme.text} size={22} />
        </Pressable>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: 14,
    padding: 16,
    paddingBottom: 48,
  },
});
