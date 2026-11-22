import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Popover } from '@/components/ui/popover';
import { Spacing } from '@/constants/theme';
import { useAnchor } from '@/hooks/use-anchor';
import { useUserLocation, type LocationStatus } from '@/hooks/use-user-location';

const NOTE_WIDTH = 248;
const NOTE_VISIBLE_MS = 3500;

/** Nhãn đọc cho trình đọc màn hình của nút/dòng vị trí. */
export const GPS_LABELS: Record<LocationStatus, string> = {
  checking: 'Đang kiểm tra GPS',
  granted: 'GPS đang bật',
  denied: 'GPS chưa được cấp quyền. Chạm để bật',
  'gps-off': 'GPS đang tắt. Chạm để bật',
  unavailable: 'Không lấy được vị trí. Chạm để thử lại',
};

// Chú thích hiện khi chạm vào vị trí: nói rõ app đang dùng vị trí nào và người dùng cần làm gì.
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

/**
 * Chạm vào chỗ hiện vị trí: GPS chưa sẵn sàng thì xin quyền / bật GPS trước, rồi hiện chú thích
 * khớp trạng thái mới. Chú thích tự tắt sau vài giây để không phải chạm ra ngoài mới đóng.
 */
export function useGpsNote({ align }: { align: 'left' | 'right' }) {
  const location = useUserLocation();
  const { ref, anchor, open, close } = useAnchor();

  useEffect(() => {
    if (!anchor) return;

    const timer = setTimeout(close, NOTE_VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [anchor, close]);

  const handlePress = async () => {
    if (!location.isReady) await location.request();
    open();
  };

  const note = GPS_NOTES[location.status];

  return {
    ref,
    status: location.status,
    label: GPS_LABELS[location.status],
    onPress: () => void handlePress(),
    popover: (
      <Popover align={align} anchor={anchor} onClose={close} width={NOTE_WIDTH}>
        <View accessibilityLiveRegion="polite" style={styles.note}>
          <AppText variant="body" weight="bold">
            {note.title}
          </AppText>
          <AppText tone="textSecondary" variant="bodySm">
            {note.body}
          </AppText>
        </View>
      </Popover>
    ),
  };
}

const styles = StyleSheet.create({
  note: { gap: Spacing.xxs },
});
