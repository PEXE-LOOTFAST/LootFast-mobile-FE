import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/ui/brand-button';
import { useTheme } from '@/hooks/use-theme';

export function OrderListScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Đơn hàng của bạn</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Theo dõi thời gian đến nhận món
        </Text>

        <View style={[styles.tabs, { backgroundColor: theme.backgroundSelected }]}>
          <View style={[styles.activeTab, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.activeTabText, { color: theme.primary }]}>Đang xử lý</Text>
          </View>
          <Text style={[styles.tabText, { color: theme.textSecondary }]}>Lịch sử</Text>
        </View>

        <View
          style={[
            styles.orderCard,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <View style={styles.orderHeader}>
            <View style={[styles.storeIcon, { backgroundColor: theme.primarySoft }]}>
              <Text style={styles.storeEmoji}>🥐</Text>
            </View>
            <View style={styles.storeCopy}>
              <Text style={[styles.storeName, { color: theme.text }]}>The Daily Bakery</Text>
              <Text style={[styles.orderCode, { color: theme.textSecondary }]}>#LF24091401</Text>
            </View>
            <View style={[styles.status, { backgroundColor: theme.primarySoft }]}>
              <Text style={[styles.statusText, { color: theme.primary }]}>Đã xác nhận</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.pickupRow}>
            <View style={[styles.timelineDot, { backgroundColor: theme.accent }]} />
            <View style={styles.pickupCopy}>
              <Text style={[styles.pickupLabel, { color: theme.textSecondary }]}>
                NHẬN MÓN TRƯỚC
              </Text>
              <Text style={[styles.pickupTime, { color: theme.text }]}>20:30 hôm nay</Text>
              <Text style={[styles.address, { color: theme.textSecondary }]}>
                42 Nguyễn Thị Thập, Quận 7
              </Text>
            </View>
          </View>

          <View style={[styles.summary, { backgroundColor: theme.background }]}>
            <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
              1 × Túi bánh cuối ngày
            </Text>
            <Text style={[styles.total, { color: theme.primary }]}>39.000đ</Text>
          </View>

          <BrandButton>Xem mã nhận món</BrandButton>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteEmoji}>🛍️</Text>
          <Text style={[styles.noteText, { color: theme.textSecondary }]}>
            Hãy mang theo túi cá nhân và đến đúng khung giờ để cửa hàng phục vụ nhanh nhất.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  title: { marginTop: 10, fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { marginTop: 7, fontSize: 14 },
  tabs: { flexDirection: 'row', alignItems: 'center', marginTop: 24, borderRadius: 16, padding: 4 },
  activeTab: { flex: 1, alignItems: 'center', borderRadius: 13, paddingVertical: 11 },
  activeTabText: { fontSize: 13, fontWeight: '800' },
  tabText: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '700' },
  orderCard: { marginTop: 22, borderWidth: 1, borderRadius: 22, padding: 18 },
  orderHeader: { flexDirection: 'row', alignItems: 'center' },
  storeIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  storeEmoji: { fontSize: 24 },
  storeCopy: { flex: 1, marginLeft: 12, gap: 3 },
  storeName: { fontSize: 15, fontWeight: '800' },
  orderCode: { fontSize: 11 },
  status: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  statusText: { fontSize: 10, fontWeight: '800' },
  divider: { height: 1, marginVertical: 18 },
  pickupRow: { flexDirection: 'row', gap: 13 },
  timelineDot: { width: 12, height: 12, marginTop: 4, borderRadius: 6 },
  pickupCopy: { flex: 1, gap: 4 },
  pickupLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  pickupTime: { fontSize: 20, fontWeight: '900' },
  address: { fontSize: 12 },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 18,
    borderRadius: 13,
    padding: 13,
  },
  summaryText: { fontSize: 12 },
  total: { fontSize: 13, fontWeight: '900' },
  note: { flexDirection: 'row', gap: 12, marginTop: 24, paddingHorizontal: 10 },
  noteEmoji: { fontSize: 20 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 19 },
});
