import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import type { MerchantApplicationStatusDto } from '@/features/seller/api/merchant-application';
import { useMyMerchantApplication } from '@/features/seller/api/use-merchant-application';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';

const COPY: Record<MerchantApplicationStatusDto | 'NONE', { title: string; body: string }> = {
  NONE: {
    title: 'Chưa đăng ký bán hàng',
    body: 'Bạn cần nộp giấy phép kinh doanh và được quản trị viên duyệt trước khi đăng bài bán hoặc dùng các chức năng bán hàng.',
  },
  UPLOADING: {
    title: 'Hồ sơ đang được xử lý',
    body: 'Ảnh giấy phép đang được tải lên. Bạn chưa đăng bài bán được cho tới khi quản trị viên duyệt.',
  },
  UPLOAD_FAILED: {
    title: 'Hồ sơ chưa gửi được',
    body: 'Ảnh giấy phép chưa lên được hệ thống. Hãy gửi lại hồ sơ đăng ký bán hàng.',
  },
  PENDING: {
    title: 'Hồ sơ đang chờ duyệt',
    body: 'Quản trị viên đang xem xét giấy phép của bạn. Bạn chưa đăng bài bán được cho tới khi hồ sơ được duyệt.',
  },
  APPROVED: {
    title: 'Hồ sơ đã được duyệt',
    body: 'Hồ sơ đã được duyệt, đang cập nhật quyền người bán. Chờ một chút rồi mở lại chức năng này.',
  },
  REJECTED: {
    title: 'Hồ sơ bị từ chối',
    body: 'Hồ sơ không được duyệt nên chưa đăng bài bán được. Xem lý do, chuẩn bị giấy tờ đúng rồi gửi lại.',
  },
};

/**
 * Tài khoản đã mang quyền người bán nhưng chưa có hồ sơ quán — thường do quyền được cấp thẳng
 * trong hệ thống chứ không qua duyệt đơn đăng ký. Backend từ chối đơn đăng ký mới của tài khoản đã
 * là người bán (MERCHANT_ALREADY_APPROVED) và không có API tạo hồ sơ, nên app không có đường nào
 * tự xử lý: cần quản trị viên khởi tạo hồ sơ quán. Nói thẳng điều đó thay vì mời đăng ký lại.
 */
export function MerchantProfileNotCreated() {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.header}>
        <Icon name={SellerIcons.store} color={theme.primary} size={20} />
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          Chưa có hồ sơ quán
        </Text>
      </View>
      <Text style={[styles.body, { color: theme.textSecondary }]}>
        Tài khoản của bạn đã được duyệt làm người bán nhưng hồ sơ quán chưa được khởi tạo trên hệ
        thống, nên chưa lưu được thông tin quán. Vui lòng liên hệ quản trị viên để được khởi tạo.
      </Text>
    </View>
  );
}

/**
 * Backend không có API tạo hồ sơ quán: nó chỉ xuất hiện khi admin duyệt đơn đăng ký bán hàng.
 * Tài khoản chưa có hồ sơ thì mọi API sửa thông tin quán đều trả MERCHANT_PROFILE_NOT_FOUND, nên
 * thay vì cho nhập form rồi báo lỗi lúc lưu, ta chỉ trạng thái đơn đăng ký và đường đi tiếp.
 */
export function MerchantRegistrationRequired() {
  const theme = useTheme();
  const { user } = useAuthSession();
  const application = useMyMerchantApplication(true);

  const status = application.data?.status ?? 'NONE';
  const copy = COPY[status];
  const canResubmit = status === 'NONE' || status === 'REJECTED' || status === 'UPLOAD_FAILED';

  // Đã là người bán mà vẫn thiếu hồ sơ quán: mời đăng ký sẽ chỉ bị backend từ chối.
  if (user?.roles.includes('MERCHANT') && status !== 'APPROVED')
    return <MerchantProfileNotCreated />;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.header}>
        <Icon name={SellerIcons.store} color={theme.primary} size={20} />
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          {copy.title}
        </Text>
        {application.isLoading ? <ActivityIndicator color={theme.primary} /> : null}
      </View>
      <Text style={[styles.body, { color: theme.textSecondary }]}>{copy.body}</Text>
      {application.data?.rejectionReason ? (
        <Text style={[styles.body, { color: theme.danger }]}>
          Lý do từ chối: {application.data.rejectionReason}
        </Text>
      ) : null}
      <BrandButton onPress={() => router.navigate('/merchant-application')}>
        {canResubmit ? 'Đăng ký' : 'Xem trạng thái đăng ký'}
      </BrandButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md, borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: {
    flex: 1,
    fontSize: FontSize.subtitle,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.2,
  },
  body: { fontSize: FontSize.bodySm, lineHeight: 20 },
});
