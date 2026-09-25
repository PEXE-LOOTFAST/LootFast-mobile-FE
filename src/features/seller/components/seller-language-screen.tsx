import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { HomeIcon } from '@/features/home/components/home-icon';
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
          <HomeIcon name={SellerIcons.check} color="#FFFFFF" size={14} />
        </View>
      </View>
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    boxShadow: '0px 4px 12px rgba(23, 33, 27, 0.05)',
  },
  copy: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontWeight: '800' },
  subtitle: { fontSize: 12 },
  check: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
});
