import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeIcon } from '@/features/home/components/home-icon';
import { HomeHeaderColors } from '@/features/home/constants/colors';
import { SellerIcons } from '@/features/seller/constants/icons';

type SellerShopHeaderProps = {
  shopName: string;
  email: string;
  onPressAvatar: () => void;
};

// Header tab Hồ sơ quán: ảnh đại diện quán to bên trái, tên quán và email đăng nhập.
export function SellerShopHeader({ shopName, email, onPressAvatar }: SellerShopHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.decorationLayer}>
        <View style={styles.decoration} />
      </View>

      <View style={styles.identity}>
        <Pressable
          accessibilityLabel="Đổi ảnh đại diện quán"
          accessibilityRole="button"
          onPress={onPressAvatar}
          style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
        >
          <HomeIcon name={SellerIcons.store} color={HomeHeaderColors.textMuted} size={30} />
          <View style={styles.cameraBadge}>
            <HomeIcon name={SellerIcons.camera} color={HomeHeaderColors.background} size={12} />
          </View>
        </Pressable>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Hồ sơ quán</Text>
          <Text accessibilityRole="header" numberOfLines={2} style={styles.title}>
            {shopName}
          </Text>
        </View>
      </View>

      <Text numberOfLines={1} style={styles.email}>
        {email}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    gap: 6,
    backgroundColor: HomeHeaderColors.background,
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
    width: 180,
    height: 180,
    right: -50,
    bottom: -90,
    borderRadius: 90,
    backgroundColor: HomeHeaderColors.decoration,
    opacity: 0.5,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cameraBadge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: HomeHeaderColors.background,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  copy: { flex: 1, gap: 2 },
  eyebrow: { color: HomeHeaderColors.textMuted, fontSize: 11, fontWeight: '700' },
  title: { color: HomeHeaderColors.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  email: { color: HomeHeaderColors.textMuted, fontSize: 13, fontWeight: '600' },
  pressed: { opacity: 0.8 },
});
