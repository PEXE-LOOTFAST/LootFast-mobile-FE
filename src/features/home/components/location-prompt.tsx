import { Platform, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { HomeIcons } from '@/features/home/constants/icons';
import type { LocationStatus } from '@/hooks/use-user-location';
import { useTheme } from '@/hooks/use-theme';

type LocationPromptProps = {
  status: LocationStatus;
  canAskAgain: boolean;
  onRequest: () => void;
  /** Việc người dùng làm được sau khi bật vị trí, viết tiếp sau "để …". */
  purpose?: string;
};

// Thẻ nhắc bật vị trí, dùng ở nơi tính năng cần GPS (bán kính ở Trang chủ, tab Bản đồ).
export function LocationPrompt({
  status,
  canAskAgain,
  onRequest,
  purpose = 'xem deal gần bạn nhất',
}: LocationPromptProps) {
  const theme = useTheme();

  if (status === 'granted' || status === 'checking') return null;

  const copy =
    status === 'gps-off'
      ? {
          message: `GPS đang tắt. Bật GPS của thiết bị để ${purpose}.`,
          action: Platform.OS === 'android' ? 'Bật GPS' : 'Mở cài đặt',
        }
      : status === 'unavailable'
        ? {
            message: 'Không lấy được vị trí. Hãy kiểm tra tín hiệu GPS rồi thử lại.',
            action: 'Thử lại',
          }
        : canAskAgain
          ? {
              message: `Bật vị trí để ${purpose}.`,
              action: 'Bật vị trí',
            }
          : {
              message: `Quyền vị trí đang bị tắt. Mở Cài đặt để cho phép, bạn sẽ có thể ${purpose}.`,
              action: 'Mở cài đặt',
            };

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.card, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}
    >
      <View style={styles.row}>
        <Icon name={HomeIcons.location} color={theme.primary} size={18} />
        <Text style={[styles.message, { color: theme.text }]}>{copy.message}</Text>
      </View>
      <BrandButton onPress={onRequest} variant="secondary">
        {copy.action}
      </BrandButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md, borderWidth: 1, borderRadius: Radius.xl, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  message: { flex: 1, fontSize: FontSize.bodySm, fontWeight: FontWeight.medium, lineHeight: 19 },
});
