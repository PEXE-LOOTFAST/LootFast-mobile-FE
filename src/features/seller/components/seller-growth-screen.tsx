import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';

// Backend chưa có API chiến dịch nên trang chỉ có trạng thái rỗng, nói bằng lời của người bán;
// khi có danh sách thì mỗi chương trình là một thẻ cùng kiểu với thẻ bên dưới.
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
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Khi LootFast mở chiến dịch mới (giảm phí, đẩy deal lên đầu trang…), chương trình sẽ hiện
            ở đây kèm điều kiện tham gia. Bạn chưa cần làm gì lúc này.
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
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    boxShadow: Shadow.card,
  },
  copy: { flex: 1, gap: Spacing.sm },
  title: { fontSize: FontSize.bodyLg, fontWeight: FontWeight.heavy },
  description: { fontSize: FontSize.bodySm, lineHeight: 19 },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: 14,
  },
  noteText: { flex: 1, fontSize: FontSize.footnote, lineHeight: 18 },
  link: { alignSelf: 'center', padding: 6, fontSize: FontSize.body, fontWeight: FontWeight.bold },
});
