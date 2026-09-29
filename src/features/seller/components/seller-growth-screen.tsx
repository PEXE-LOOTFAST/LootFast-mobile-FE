import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SellerBadge } from '@/features/seller/components/seller-badge';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';

// Backend chưa có API chiến dịch nên trang chỉ có trạng thái rỗng; khi có danh sách thì
// mỗi chương trình là một thẻ cùng kiểu với thẻ bên dưới.
export function SellerGrowthScreen() {
  const theme = useTheme();
  const goToShop = () => router.navigate('/seller/shop');

  return (
    <SellerPageScaffold
      onPressBack={goToShop}
      subtitle="Các chương trình có điều kiện dành cho deal cuối ngày"
      title="Chương trình tăng trưởng"
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        <Icon name={SellerIcons.megaphone} color={theme.primary} size={20} />
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            Chưa có chương trình đang mở
          </Text>
          <SellerBadge label="Cần backend" />
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Backend chưa cung cấp danh sách chiến dịch, điều kiện, ngân sách hoặc luồng đăng ký.
          </Text>
          <Text style={[styles.eligibility, { color: theme.text }]}>
            Quyền đăng ký hiện tại: Chưa khả dụng
          </Text>
        </View>
      </View>

      <View
        style={[styles.note, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}
      >
        <Icon name={SellerIcons.shield} color={theme.primary} size={15} />
        <Text style={[styles.noteText, { color: theme.textSecondary }]}>
          Mỗi chương trình sẽ hiển thị rõ điều kiện mở khóa và nguồn tài trợ; không dùng dữ liệu
          nhạy cảm của người mua.
        </Text>
      </View>

      <Text
        accessibilityRole="button"
        onPress={goToShop}
        style={[styles.link, { color: theme.primary }]}
      >
        Quay về Hồ sơ quán
      </Text>
    </SellerPageScaffold>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    boxShadow: '0px 4px 12px rgba(23, 33, 27, 0.05)',
  },
  copy: { flex: 1, gap: 8 },
  title: { fontSize: 15, fontWeight: '900' },
  description: { fontSize: 13, lineHeight: 19 },
  eligibility: { fontSize: 12, fontWeight: '700' },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  link: { alignSelf: 'center', padding: 6, fontSize: 14, fontWeight: '800' },
});
