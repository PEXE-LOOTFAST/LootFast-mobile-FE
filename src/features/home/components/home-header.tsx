import { TabHeader } from '@/components/ui/tab-header';
import { IconButton } from '@/features/home/components/icon-button';
import { HomeIcons } from '@/features/home/constants/icons';
import type { LocationStatus } from '@/hooks/use-user-location';

type HomeHeaderProps = {
  locationLabel: string;
  unreadCount: number;
  isAuthenticated: boolean;
  gpsStatus: LocationStatus;
  onPressGps?: () => void;
  onPressNotifications?: () => void;
  onPressSignIn?: () => void;
};

const GPS_LABELS: Record<LocationStatus, string> = {
  checking: 'Đang kiểm tra GPS',
  granted: 'GPS đang bật',
  denied: 'GPS chưa được cấp quyền. Chạm để bật',
  'gps-off': 'GPS đang tắt. Chạm để bật',
  unavailable: 'Không lấy được vị trí. Chạm để thử lại',
};

export function HomeHeader({
  locationLabel,
  unreadCount,
  isAuthenticated,
  gpsStatus,
  onPressGps,
  onPressNotifications,
  onPressSignIn,
}: HomeHeaderProps) {
  return (
    <TabHeader
      subtitle={locationLabel}
      subtitleIcon={HomeIcons.location}
      title="Deal cuối ngày"
      trailing={
        <>
          <IconButton
            accessibilityLabel={GPS_LABELS[gpsStatus]}
            icon={gpsStatus === 'granted' ? HomeIcons.gpsOn : HomeIcons.gpsOff}
            indicator={
              gpsStatus === 'granted' ? 'on' : gpsStatus === 'checking' ? undefined : 'off'
            }
            onPress={onPressGps}
            tone="header"
          />

          {/* Khách chưa đăng nhập không có thông báo nào để xem, nên chỗ này là lối đăng nhập. */}
          {isAuthenticated ? (
            <IconButton
              accessibilityLabel="Thông báo"
              badgeCount={unreadCount}
              icon={HomeIcons.bell}
              onPress={onPressNotifications}
              tone="header"
            />
          ) : (
            <IconButton
              accessibilityLabel="Đăng nhập"
              icon={HomeIcons.login}
              onPress={onPressSignIn}
              tone="header"
            />
          )}
        </>
      }
    />
  );
}
