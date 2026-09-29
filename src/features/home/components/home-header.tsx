import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/features/home/components/icon-button';
import { HomeHeaderColors } from '@/features/home/constants/colors';
import { HomeIcons } from '@/features/home/constants/icons';

type HomeHeaderProps = {
  locationLabel: string;
  unreadCount: number;
  onPressNotifications?: () => void;
};

export function HomeHeader({ locationLabel, unreadCount, onPressNotifications }: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Vòng trang trí nằm trong lớp cắt riêng: nếu tràn trực tiếp trong container, trình duyệt
          coi container cuộn ngang được và dịch cả chữ sang trái khi focus vào nút thông báo. */}
      <View style={styles.decorationLayer}>
        <View style={styles.decoration} />
      </View>

      <View style={styles.row}>
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.title}>
            Deal cuối ngày
          </Text>
          <View style={styles.locationRow}>
            <Icon name={HomeIcons.location} color={HomeHeaderColors.textMuted} size={15} />
            <Text numberOfLines={1} style={styles.location}>
              {locationLabel}
            </Text>
          </View>
        </View>

        <IconButton
          accessibilityLabel="Thông báo"
          badgeCount={unreadCount}
          icon={HomeIcons.bell}
          onPress={onPressNotifications}
          tone="header"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
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
    width: 200,
    height: 200,
    top: -40,
    right: -60,
    borderRadius: 100,
    backgroundColor: HomeHeaderColors.decoration,
    opacity: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 2 },
  title: { color: HomeHeaderColors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { flexShrink: 1, color: HomeHeaderColors.textMuted, fontSize: 13, fontWeight: '600' },
});
