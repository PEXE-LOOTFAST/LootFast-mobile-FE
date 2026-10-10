import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { SellerHeaderColors } from '@/features/home/constants/colors';
import { SellerIcons } from '@/features/seller/constants/icons';
import { formatFullDate } from '@/lib/format';

type SellerOverviewHeaderProps = {
  shopName: string;
  isVerified: boolean;
  date: Date;
  onPressCreateDeal: () => void;
};

// Cùng kiểu header xanh đậm với Trang chủ và Đơn hàng để các tab chính đồng bộ.
export function SellerOverviewHeader({
  shopName,
  isVerified,
  date,
  onPressCreateDeal,
}: SellerOverviewHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.decorationLayer}>
        <View style={styles.decoration} />
      </View>

      <Text accessibilityRole="header" style={styles.title}>
        Tổng quan
      </Text>

      <View style={styles.metaRow}>
        <Text numberOfLines={1} style={styles.shopName}>
          {shopName}
        </Text>
        {isVerified ? (
          <Icon name={SellerIcons.verified} color={SellerHeaderColors.textMuted} size={14} />
        ) : null}
        <Text style={styles.dot}>·</Text>
        <Text style={styles.date}>{formatFullDate(date)}</Text>
      </View>

      <Pressable
        accessibilityLabel="Đăng deal mới"
        accessibilityRole="button"
        onPress={onPressCreateDeal}
        style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
      >
        <Icon name={SellerIcons.plus} color={SellerHeaderColors.text} size={15} />
        <Text style={styles.createLabel}>Đăng deal mới</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    gap: 6,
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
    width: 220,
    height: 220,
    top: -30,
    right: -70,
    borderRadius: 110,
    backgroundColor: SellerHeaderColors.decoration,
    opacity: 0.5,
  },
  title: { color: SellerHeaderColors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  shopName: { flexShrink: 1, color: SellerHeaderColors.textMuted, fontSize: 13, fontWeight: '700' },
  dot: { color: SellerHeaderColors.textMuted, fontSize: 13, fontWeight: '700' },
  date: { color: SellerHeaderColors.textMuted, fontSize: 13, fontWeight: '600' },
  createButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createLabel: { color: SellerHeaderColors.text, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.85 },
});
