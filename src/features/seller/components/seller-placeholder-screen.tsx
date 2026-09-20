import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeIcon } from '@/features/home/components/home-icon';
import type { HomeIconName } from '@/features/home/constants/icons';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type SellerPlaceholderScreenProps = {
  title: string;
  description: string;
  icon?: HomeIconName;
};

// Các tab người bán còn lại sẽ được thiết kế ở nhánh riêng; màn tạm này giữ cho thanh tab
// điều hướng được đầy đủ thay vì bấm vào là lỗi route.
export function SellerPlaceholderScreen({
  title,
  description,
  icon = SellerIcons.trend,
}: SellerPlaceholderScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.body}>
        <View style={[styles.iconBadge, { backgroundColor: theme.primarySoft }]}>
          <HomeIcon name={icon} color={theme.primary} size={26} />
        </View>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
        <Text
          accessibilityRole="button"
          onPress={() => router.navigate('/seller')}
          style={[styles.link, { color: theme.primary }]}
        >
          Về Tổng quan
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  iconBadge: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  },
  title: { fontSize: 19, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  description: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  link: { marginTop: 6, fontSize: 14, fontWeight: '800' },
});
