import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: SellerIcons.camera,
    title: 'Đăng món còn dư',
    body: 'Chụp ảnh món, đặt giá giảm, số phần và giờ bán trong bốn bước ngắn.',
  },
  {
    icon: SellerIcons.bag,
    title: 'Khách quanh quán đặt giữ',
    body: 'Deal hiện trên Trang chủ và bản đồ; khách đặt trước rồi hẹn giờ đến lấy.',
  },
  {
    icon: SellerIcons.qrCode,
    title: 'Quét mã khi khách tới',
    body: 'Mở tab Đơn hàng, quét QR của khách là biết giao món gì, có phải thu tiền không.',
  },
];

/**
 * Người bán mới chưa đăng được deal (hồ sơ quán còn thiếu) vẫn nên biết đăng xong thì chuyện gì
 * xảy ra: ba bước từ lúc đăng tới lúc giao món, thay cho khoảng trống dưới danh sách việc cần làm.
 */
export function DealHowItWorks() {
  const theme = useTheme();

  return (
    <Card gap="md" tone="outline">
      <AppText accessibilityRole="header" variant="bodyLg" weight="heavy">
        Đăng deal hoạt động thế nào?
      </AppText>

      {STEPS.map((step, index) => (
        <View key={step.title} style={styles.step}>
          <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
            <Icon name={step.icon} color={theme.primary} size={18} />
          </View>
          <View style={styles.copy}>
            <AppText variant="body" weight="bold">
              {index + 1}. {step.title}
            </AppText>
            <AppText tone="textSecondary" variant="footnote">
              {step.body}
            </AppText>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  copy: { flex: 1, gap: Spacing.xxs },
});
