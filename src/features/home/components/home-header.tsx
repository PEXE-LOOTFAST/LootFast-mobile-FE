import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeIcon } from '@/features/home/components/home-icon';
import { IconButton } from '@/features/home/components/icon-button';
import { HomeHeaderColors } from '@/features/home/constants/colors';
import { HomeIcons } from '@/features/home/constants/icons';

type HomeHeaderProps = {
  address: string;
  unreadCount: number;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
};

export function HomeHeader({
  address,
  unreadCount,
  onPressNotifications,
  onPressProfile,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={[styles.decoration, styles.decorationLarge]} />
      <View style={[styles.decoration, styles.decorationSmall]} />

      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Săn deal - cứu thực phẩm</Text>
          <Text accessibilityRole="header" style={styles.title}>
            Deal cuối ngày
          </Text>
          <View style={styles.locationRow}>
            <HomeIcon name={HomeIcons.location} color={HomeHeaderColors.textMuted} size={16} />
            <Text numberOfLines={1} style={styles.address}>
              {address}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <IconButton
            accessibilityLabel="Thông báo"
            badgeCount={unreadCount}
            icon={HomeIcons.bell}
            onPress={onPressNotifications}
            tone="header"
          />
          <IconButton
            accessibilityLabel="Tài khoản"
            icon={HomeIcons.person}
            onPress={onPressProfile}
            tone="header"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: HomeHeaderColors.background,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 64,
  },
  decoration: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: HomeHeaderColors.decoration,
  },
  decorationLarge: { width: 240, height: 240, top: -60, right: -70, opacity: 0.6 },
  decorationSmall: { width: 130, height: 130, bottom: -70, right: 110, opacity: 0.35 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  copy: { flex: 1, gap: 4 },
  eyebrow: {
    color: HomeHeaderColors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { color: HomeHeaderColors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  address: { flexShrink: 1, color: HomeHeaderColors.textMuted, fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
