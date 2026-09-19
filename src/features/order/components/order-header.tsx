import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeaderColors } from '@/features/home/constants/colors';

// Cùng kiểu header xanh đậm với Trang chủ để các tab chính đồng bộ.
export function OrderHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.decorationLayer}>
        <View style={styles.decoration} />
      </View>

      <Text accessibilityRole="header" style={styles.title}>
        Đơn hàng của tôi
      </Text>
      <Text style={styles.subtitle}>Theo dõi xác nhận, thời gian nhận món và lịch sử đơn</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    gap: 4,
    backgroundColor: HomeHeaderColors.background,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  decorationLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  decoration: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -40,
    right: -60,
    borderRadius: 100,
    backgroundColor: HomeHeaderColors.decoration,
    opacity: 0.5,
  },
  title: { color: HomeHeaderColors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  subtitle: { color: HomeHeaderColors.textMuted, fontSize: 13, fontWeight: '600' },
});
