import { useState } from 'react';

import { useUnreadCount } from '@/api/notifications';
import { TabHeader } from '@/components/ui/tab-header';
import { IconButton } from '@/components/ui/icon-button';
import { NotificationSheet } from '@/features/home/components/notification-sheet';
import { HomeIcons } from '@/features/home/constants/icons';
import { useGpsNote } from '@/features/home/hooks/use-gps-note';
import { useAuthSession } from '@/hooks/use-auth-session';
import { withAuth } from '@/lib/auth-session';
import type { IconName } from '@/components/ui/icon';

const BRAND_NAME = 'LootFast';

type BuyerHeaderProps = {
  title: string;
  subtitle?: string;
  subtitleIcon?: IconName;
  onBack?: () => void;
};

export function BuyerHeader({ title, subtitle, subtitleIcon, onBack }: BuyerHeaderProps) {
  const { isAuthenticated } = useAuthSession();
  const { data: unreadData } = useUnreadCount(isAuthenticated);
  const unreadCount = unreadData?.unreadCount ?? 0;
  const {
    ref: gpsRef,
    status: gpsStatus,
    label: gpsLabel,
    onPress: onPressGps,
    popover: gpsPopover,
  } = useGpsNote({ align: 'right' });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <>
      <TabHeader
        onBack={onBack}
        subtitle={subtitle}
        subtitleIcon={subtitleIcon}
        title={`${BRAND_NAME} · ${title}`}
        trailing={
          <>
            <IconButton
              ref={gpsRef}
              accessibilityLabel={gpsLabel}
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
                onPress={() => setIsNotificationsOpen(true)}
                tone="header"
              />
            ) : (
              <IconButton
                accessibilityLabel="Đăng nhập"
                icon={HomeIcons.login}
                onPress={withAuth()}
                tone="header"
              />
            )}
          </>
        }
      />

      {gpsPopover}

      <NotificationSheet
        onClose={() => setIsNotificationsOpen(false)}
        visible={isNotificationsOpen}
      />
    </>
  );
}
