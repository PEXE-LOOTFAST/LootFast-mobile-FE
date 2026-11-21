import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight } from '@/constants/theme';
import { useUnreadCount } from '@/api/notifications';
import { Popover } from '@/components/ui/popover';
import { TabHeader } from '@/components/ui/tab-header';
import { IconButton } from '@/components/ui/icon-button';
import { NotificationSheet } from '@/features/home/components/notification-sheet';
import { HomeIcons } from '@/features/home/constants/icons';
import { useAnchor } from '@/hooks/use-anchor';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { useUserLocation, type LocationStatus } from '@/hooks/use-user-location';
import { withAuth } from '@/lib/auth-session';
import type { IconName } from '@/components/ui/icon';

const BRAND_NAME = 'LootFast';
const NOTE_WIDTH = 248;
const NOTE_VISIBLE_MS = 3500;

const GPS_LABELS: Record<LocationStatus, string> = {
  checking: 'Đang kiểm tra GPS',
  granted: 'GPS đang bật',
  denied: 'GPS chưa được cấp quyền. Chạm để bật',
  'gps-off': 'GPS đang tắt. Chạm để bật',
  unavailable: 'Không lấy được vị trí. Chạm để thử lại',
};

// Chú thích hiện khi chạm icon GPS: nói rõ app đang dùng vị trí nào và người dùng cần làm gì.
const GPS_NOTES: Record<LocationStatus, { title: string; body: string }> = {
  checking: { title: 'Đang kiểm tra GPS', body: 'Vui lòng chờ trong giây lát.' },
  granted: {
    title: 'GPS đang bật',
    body: 'Deal được tìm quanh vị trí hiện tại của bạn.',
  },
  denied: {
    title: 'Chưa cấp quyền vị trí',
    body: 'Đang dùng khu vực mặc định (TP.HCM). Cho phép vị trí để thấy deal gần bạn.',
  },
  'gps-off': {
    title: 'GPS đang tắt',
    body: 'Đang dùng khu vực mặc định (TP.HCM). Bật GPS của thiết bị để thấy deal gần bạn.',
  },
  unavailable: {
    title: 'Không lấy được vị trí',
    body: 'Hãy kiểm tra tín hiệu GPS rồi chạm lại để thử.',
  },
};

type BuyerHeaderProps = {
  title: string;
  subtitle?: string;
  subtitleIcon?: IconName;
  onBack?: () => void;
};

export function BuyerHeader({ title, subtitle, subtitleIcon, onBack }: BuyerHeaderProps) {
  const theme = useTheme();
  const { isAuthenticated } = useAuthSession();
  const { data: unreadData } = useUnreadCount(isAuthenticated);
  const unreadCount = unreadData?.unreadCount ?? 0;
  const location = useUserLocation();
  const { ref: gpsRef, anchor: gpsAnchor, open: openGpsNote, close: closeGpsNote } = useAnchor();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Chú thích tự tắt sau vài giây để không phải chạm ra ngoài mới đóng.
  useEffect(() => {
    if (!gpsAnchor) return;

    const timer = setTimeout(closeGpsNote, NOTE_VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [gpsAnchor, closeGpsNote]);

  const handlePressGps = async () => {
    // GPS chưa sẵn sàng thì vừa xử lý (xin quyền / bật GPS) vừa giải thích; chú thích hiện sau khi
    // có kết quả để nội dung khớp trạng thái mới.
    if (!location.isReady) await location.request();
    openGpsNote();
  };

  const note = GPS_NOTES[location.status];

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
              accessibilityLabel={GPS_LABELS[location.status]}
              icon={location.status === 'granted' ? HomeIcons.gpsOn : HomeIcons.gpsOff}
              indicator={
                location.status === 'granted'
                  ? 'on'
                  : location.status === 'checking'
                    ? undefined
                    : 'off'
              }
              onPress={() => void handlePressGps()}
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

      <Popover align="right" anchor={gpsAnchor} onClose={closeGpsNote} width={NOTE_WIDTH}>
        <View accessibilityLiveRegion="polite" style={styles.note}>
          <Text style={[styles.noteTitle, { color: theme.text }]}>{note.title}</Text>
          <Text style={[styles.noteBody, { color: theme.textSecondary }]}>{note.body}</Text>
        </View>
      </Popover>

      <NotificationSheet
        onClose={() => setIsNotificationsOpen(false)}
        visible={isNotificationsOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  note: { gap: 3 },
  noteTitle: { fontSize: FontSize.body, fontWeight: FontWeight.bold },
  noteBody: { fontSize: FontSize.bodySm, lineHeight: 18 },
});
