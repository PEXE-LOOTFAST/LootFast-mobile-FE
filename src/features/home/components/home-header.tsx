import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import logoMark from '@/assets/images/logo-mark.png';
import { useUnreadCount } from '@/api/notifications';
import { AppText } from '@/components/ui/app-text';
import { FocusedStatusBar } from '@/components/ui/focused-status-bar';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { NotificationSheet } from '@/features/home/components/notification-sheet';
import { HomeIcons } from '@/features/home/constants/icons';
import { useGpsNote } from '@/features/home/hooks/use-gps-note';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import type { LocationStatus } from '@/hooks/use-user-location';
import { withAuth } from '@/lib/auth-session';

/** Feed chỉ lấy một trang 50 deal; chạm trần thì ghi "50+" thay vì nói đúng 50. */
const FEED_PAGE_SIZE = 50;

type HomeHeaderProps = {
  /** Số deal đang mở quanh người dùng; bỏ trống khi đang tải hoặc đang lọc. */
  dealCount?: number;
};

/**
 * Dải thương hiệu đầu Trang chủ: logo, lời chào theo giờ, vị trí đang dùng kèm số deal đang mở,
 * và lối vào thông báo hoặc đăng nhập. Chạm vào dòng vị trí để bật GPS hoặc xem đang tìm quanh
 * đâu, thay cho icon GPS khó hiểu của header cũ.
 */
export function HomeHeader({ dealCount }: HomeHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const now = useNow(5 * 60_000);
  const { isAuthenticated } = useAuthSession();
  const { data: unreadData } = useUnreadCount(isAuthenticated);
  const {
    ref: gpsRef,
    status: gpsStatus,
    label: gpsLabel,
    onPress: onPressGps,
    popover: gpsPopover,
  } = useGpsNote({ align: 'left' });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const locationText = locationLine(gpsStatus, dealCount);

  return (
    <>
      <FocusedStatusBar style="light" />

      <View
        style={[styles.band, { backgroundColor: theme.hero, paddingTop: insets.top + Spacing.md }]}
      >
        <View style={[styles.decor, { backgroundColor: theme.heroDecor }]} />

        <View style={styles.row}>
          <Image
            accessibilityIgnoresInvertColors
            accessible={false}
            source={logoMark}
            style={[styles.logo, { borderColor: theme.onHero }]}
          />

          <View style={styles.copy}>
            <AppText
              accessibilityRole="header"
              color={theme.onHero}
              numberOfLines={1}
              style={styles.greeting}
              variant="title"
              weight="heavy"
            >
              {greetingFor(new Date(now).getHours())}
            </AppText>

            <Pressable
              ref={gpsRef}
              accessibilityLabel={`${locationText}. ${gpsLabel}`}
              accessibilityRole="button"
              hitSlop={Spacing.sm}
              onPress={onPressGps}
              style={({ pressed }) => [styles.location, pressed && styles.pressed]}
            >
              <Icon
                name={gpsStatus === 'granted' ? HomeIcons.location : HomeIcons.gpsOff}
                color={theme.onHeroMuted}
                size={14}
              />
              <AppText
                color={theme.onHeroMuted}
                numberOfLines={1}
                style={styles.locationText}
                variant="footnote"
                weight="bold"
              >
                {locationText}
              </AppText>
              <Icon name={HomeIcons.chevronDown} color={theme.onHeroMuted} size={14} />
            </Pressable>
          </View>

          {/* Khách chưa đăng nhập không có thông báo để xem, nên chỗ này là nút đăng nhập có chữ. */}
          {isAuthenticated ? (
            <IconButton
              accessibilityLabel="Thông báo"
              badgeCount={unreadData?.unreadCount ?? 0}
              icon={HomeIcons.bell}
              onPress={() => setIsNotificationsOpen(true)}
              tone="hero"
            />
          ) : (
            <Pressable
              accessibilityRole="button"
              hitSlop={Spacing.xs}
              onPress={withAuth()}
              style={({ pressed }) => [
                styles.signIn,
                { backgroundColor: theme.onHero },
                pressed && styles.pressed,
              ]}
            >
              <AppText color={theme.hero} variant="bodySm" weight="heavy">
                Đăng nhập
              </AppText>
            </Pressable>
          )}
        </View>
      </View>

      {gpsPopover}

      <NotificationSheet
        onClose={() => setIsNotificationsOpen(false)}
        visible={isNotificationsOpen}
      />
    </>
  );
}

// Deal LootFast chủ yếu mở cuối ngày, nên buổi tối là lúc lời chào rủ đi săn deal.
function greetingFor(hour: number) {
  if (hour >= 5 && hour < 11) return 'Chào buổi sáng!';
  if (hour >= 11 && hour < 14) return 'Trưa nay ăn gì?';
  if (hour >= 14 && hour < 17) return 'Chào buổi chiều!';
  if (hour >= 17 && hour < 22) return 'Tối nay săn deal nhé!';
  return 'Chào bạn!';
}

// Ngắn để vừa một dòng cạnh nút Đăng nhập trên máy 360dp; cách bật vị trí đã có thẻ riêng bên
// dưới và chú thích khi chạm vào dòng này.
function locationLine(status: LocationStatus, dealCount?: number) {
  switch (status) {
    case 'checking':
      return 'Đang tìm vị trí…';
    case 'granted':
      if (dealCount === undefined) return 'Quanh vị trí của bạn';
      if (dealCount === 0) return 'Chưa có deal gần đây';
      return `${dealCount >= FEED_PAGE_SIZE ? `${FEED_PAGE_SIZE}+` : dealCount} deal quanh bạn`;
    case 'unavailable':
      return 'Chưa lấy được vị trí';
    default:
      return 'Khu vực TP.HCM';
  }
}

const LOGO_SIZE = 48;
const DECOR_SIZE = 220;

const styles = StyleSheet.create({
  band: {
    overflow: 'hidden',
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    paddingBottom: Spacing.lg,
  },
  // Vòng tròn sáng hơn nền ở góc phải, lặp lại hình tròn trong icon app.
  decor: {
    position: 'absolute',
    top: -DECOR_SIZE / 2,
    right: -DECOR_SIZE / 4,
    width: DECOR_SIZE,
    height: DECOR_SIZE,
    borderRadius: Radius.full,
  },
  row: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderWidth: 2,
    borderRadius: Radius.lg,
  },
  copy: { flex: 1, minWidth: 0, gap: Spacing.xxs },
  greeting: { letterSpacing: -0.3 },
  location: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  locationText: { flexShrink: 1 },
  signIn: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
  },
  pressed: { opacity: 0.8 },
});
