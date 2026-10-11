import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { SellerHeaderColors } from '@/features/home/constants/colors';
import { SellerIcons } from '@/features/seller/constants/icons';

// Cùng kiểu header xanh đậm với Tổng quan; nút quét QR để ngay đây vì đó là thao tác
// người bán làm mỗi lần khách tới lấy hàng.
export function SellerOrderHeader({ onPressScan }: { onPressScan: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.decorationLayer}>
        <View style={styles.decoration} />
      </View>

      <Text accessibilityRole="header" style={styles.title}>
        Đơn hàng
      </Text>
      <Text style={styles.subtitle}>Quản lý đơn đến, deal đang chạy và lịch sử</Text>

      <Pressable
        accessibilityLabel="Quét mã QR của khách"
        accessibilityRole="button"
        onPress={onPressScan}
        style={({ pressed }) => [styles.scanButton, pressed && styles.pressed]}
      >
        <Icon name={SellerIcons.qrCode} color={SellerHeaderColors.background} size={18} />
        <Text style={styles.scanLabel}>Quét QR</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    gap: 4,
    backgroundColor: SellerHeaderColors.background,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    backgroundColor: SellerHeaderColors.decoration,
    opacity: 0.5,
  },
  title: { color: SellerHeaderColors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  subtitle: { color: SellerHeaderColors.textMuted, fontSize: 13, fontWeight: '600' },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    backgroundColor: SellerHeaderColors.text,
    borderRadius: 16,
    paddingVertical: 14,
  },
  scanLabel: { color: SellerHeaderColors.background, fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.85 },
});
