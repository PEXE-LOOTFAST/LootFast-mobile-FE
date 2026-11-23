import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { HomeIcons } from '@/features/home/constants/icons';
import { StarRating } from '@/features/review/components/star-rating';
import { usePendingReview } from '@/features/review/hooks/use-pending-review';
import { useTheme } from '@/hooks/use-theme';

/**
 * Nhắc khách chấm sao bữa vừa nhận, ngay trên trang chủ. Chạm một ngôi sao là mở đơn với số sao
 * đó đã chọn sẵn, chỉ còn bấm gửi.
 */
export function PendingReviewCard() {
  const theme = useTheme();
  const { order, dismiss } = usePendingReview();

  if (!order) return null;

  const openReview = (rating: number) =>
    router.push({ pathname: '/order/[id]', params: { id: order.orderId, rating: String(rating) } });

  return (
    <Card elevated gap="sm">
      <View style={styles.header}>
        <AppText numberOfLines={2} style={styles.title} variant="subtitle" weight="heavy">
          Món “{order.dealName}” thế nào?
        </AppText>
        <Pressable
          accessibilityLabel="Để sau, không nhắc đơn này nữa"
          accessibilityRole="button"
          hitSlop={Spacing.sm}
          onPress={dismiss}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Icon name={HomeIcons.close} color={theme.textSecondary} size={18} />
        </Pressable>
      </View>
      <AppText tone="textSecondary" variant="bodySm">
        Chấm sao để quán biết bạn thấy sao, người mua khác cũng dễ chọn hơn.
      </AppText>
      <StarRating onChange={openReview} size={30} value={0} />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  title: { flex: 1 },
  pressed: { opacity: 0.6 },
});
