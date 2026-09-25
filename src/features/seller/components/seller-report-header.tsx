import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeIcon } from '@/features/home/components/home-icon';
import { HomeHeaderColors } from '@/features/home/constants/colors';
import { SellerIcons } from '@/features/seller/constants/icons';

// Cùng nền xanh đậm với các tab người bán khác, thêm nút quay lại cạnh tiêu đề.
export function SellerReportHeader({ onPressBack }: { onPressBack: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.decorationLayer}>
        <View style={styles.decoration} />
      </View>

      <Pressable
        accessibilityLabel="Quay lại"
        accessibilityRole="button"
        hitSlop={6}
        onPress={onPressBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <HomeIcon name={SellerIcons.back} color={HomeHeaderColors.text} size={18} />
      </Pressable>

      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>
          Báo cáo
        </Text>
        <Text style={styles.subtitle}>Doanh thu từ deal và hiệu suất vận hành</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  copy: { flex: 1, gap: 4 },
  title: { color: HomeHeaderColors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  subtitle: { color: HomeHeaderColors.textMuted, fontSize: 13, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
