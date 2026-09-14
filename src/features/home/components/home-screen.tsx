import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DealCard } from '@/features/home/components/deal-card';
import { useTheme } from '@/hooks/use-theme';

const categories = ['Tất cả', 'Cơm', 'Bánh ngọt', 'Đồ uống', 'Đồ chay'];

const deals = [
  {
    emoji: '🥐',
    name: 'Túi bánh cuối ngày',
    store: 'The Daily Bakery · 0,8 km',
    currentPrice: '39.000đ',
    originalPrice: '78.000đ',
    pickupTime: '19:00–20:30',
    remaining: 4,
  },
  {
    emoji: '🍱',
    name: 'Hộp cơm bất ngờ',
    store: 'Bếp Nhà An · 1,2 km',
    currentPrice: '45.000đ',
    originalPrice: '90.000đ',
    pickupTime: '20:00–21:00',
    remaining: 2,
  },
];

export function HomeScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>VỊ TRÍ HIỆN TẠI</Text>
            <Text style={[styles.location, { color: theme.text }]}>📍 Quận 7, TP.HCM⌄</Text>
          </View>
          <Pressable
            accessibilityLabel="Mở màn hình đăng nhập"
            onPress={() => router.push('/login')}
            style={[styles.avatar, { backgroundColor: theme.primarySoft }]}
          >
            <Text style={styles.avatarText}>👤</Text>
          </Pressable>
        </View>

        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>Cứu món ngon,</Text>
          <Text style={[styles.greetingAccent, { color: theme.primary }]}>tiết kiệm mỗi ngày.</Text>
        </View>

        <View style={[styles.search, { backgroundColor: theme.backgroundElement }]}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            placeholder="Tìm món ăn hoặc cửa hàng"
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
          />
          <View style={[styles.filter, { backgroundColor: theme.primary }]}>
            <Text style={styles.filterText}>☷</Text>
          </View>
        </View>

        <View style={[styles.impactCard, { backgroundColor: theme.primary }]}>
          <View style={styles.impactCopy}>
            <Text style={styles.impactEyebrow}>TÁC ĐỘNG CỦA BẠN</Text>
            <Text style={styles.impactTitle}>Mỗi phần ăn được cứu{`\n`}là một lựa chọn xanh.</Text>
          </View>
          <View style={styles.impactNumber}>
            <Text style={styles.leaf}>🌱</Text>
            <Text style={styles.saved}>0</Text>
            <Text style={styles.savedLabel}>phần đã cứu</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category, index) => (
            <Pressable
              key={category}
              style={[
                styles.category,
                {
                  backgroundColor: index === 0 ? theme.primary : theme.backgroundElement,
                  borderColor: index === 0 ? theme.primary : theme.border,
                },
              ]}
            >
              <Text style={{ color: index === 0 ? '#FFFFFF' : theme.text, fontWeight: '700' }}>
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sắp hết giờ nhận</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Deal tốt gần bạn hôm nay
            </Text>
          </View>
          <Text style={[styles.seeAll, { color: theme.primary }]}>Xem tất cả</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deals}
        >
          {deals.map((deal) => (
            <DealCard key={deal.name} {...deal} />
          ))}
        </ScrollView>

        <View style={[styles.tip, { backgroundColor: theme.primarySoft }]}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={styles.tipCopy}>
            <Text style={[styles.tipTitle, { color: theme.text }]}>Mẹo săn deal</Text>
            <Text style={[styles.tipText, { color: theme.textSecondary }]}>
              Ghé lại sau 18:00, nhiều cửa hàng sẽ mở thêm suất ăn cuối ngày.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 120, gap: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  location: { marginTop: 5, fontSize: 15, fontWeight: '700' },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  avatarText: { fontSize: 19 },
  greeting: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  greetingAccent: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  search: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 7,
  },
  searchIcon: { fontSize: 25 },
  searchInput: { flex: 1, paddingHorizontal: 12, fontSize: 14 },
  filter: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  filterText: { color: '#FFFFFF', fontSize: 20 },
  impactCard: {
    minHeight: 146,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  impactCopy: { flex: 1, gap: 8 },
  impactEyebrow: { color: '#C8F1D7', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  impactTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', lineHeight: 24 },
  impactNumber: { alignItems: 'center', minWidth: 94 },
  leaf: { fontSize: 30 },
  saved: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },
  savedLabel: { color: '#C8F1D7', fontSize: 11 },
  categories: { gap: 9 },
  category: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 17, paddingVertical: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 21, fontWeight: '800' },
  sectionSubtitle: { marginTop: 4, fontSize: 13 },
  seeAll: { fontSize: 13, fontWeight: '800' },
  deals: { gap: 14, paddingRight: 8 },
  tip: { flexDirection: 'row', gap: 14, borderRadius: 18, padding: 17 },
  tipEmoji: { fontSize: 24 },
  tipCopy: { flex: 1, gap: 4 },
  tipTitle: { fontSize: 14, fontWeight: '800' },
  tipText: { fontSize: 12, lineHeight: 18 },
});
