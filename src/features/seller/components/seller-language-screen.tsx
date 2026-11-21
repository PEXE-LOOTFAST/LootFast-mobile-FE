import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';

// App mới có tiếng Việt; khi thêm ngôn ngữ khác thì mỗi ngôn ngữ là một hàng chọn được.
export function SellerLanguageScreen() {
  const theme = useTheme();

  return (
    <SellerPageScaffold
      onPressBack={() => router.navigate('/seller/settings')}
      subtitle="Chọn ngôn ngữ hiển thị của ứng dụng"
      title="Đổi ngôn ngữ"
    >
      <View
        accessibilityRole="radio"
        accessibilityState={{ checked: true }}
        accessible
        style={[
          styles.row,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.text }]}>Tiếng Việt</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Ngôn ngữ đang sử dụng
          </Text>
        </View>
        <View style={[styles.check, { backgroundColor: theme.primary }]}>
          <Icon name={SellerIcons.check} color={theme.onPrimary} size={14} />
        </View>
      </View>
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    boxShadow: Shadow.card,
  },
  copy: { flex: 1, gap: 3 },
  title: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.bold },
  subtitle: { fontSize: FontSize.footnote },
  check: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
});
