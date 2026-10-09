import { router } from 'expo-router';
import { useEffect, type ComponentType } from 'react';

import { MerchantRegistrationRequired } from '@/features/seller/components/merchant-registration-required';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { useMyMerchantApplication } from '@/features/seller/api/use-merchant-application';
import { useAuthSession } from '@/hooks/use-auth-session';
import { syncSessionRoles } from '@/lib/auth-session';

type SellerApprovedOnlyProps = {
  title: string;
  children: React.ReactNode;
};

/**
 * Chức năng bán hàng (tổng quan, đơn hàng, đăng deal, báo cáo...) chỉ dùng được sau khi admin duyệt
 * giấy phép kinh doanh. Người mua mới vào khu người bán thì chỉ thấy thẻ trạng thái đăng ký ở đây
 * (chưa gửi, chờ duyệt, bị từ chối); riêng trang Thông tin quán vẫn mở để nộp hồ sơ.
 *
 * Quyền người bán nằm trong access token nên vừa được duyệt là chưa có hiệu lực: thấy đơn đã được
 * duyệt thì làm mới token ngay để các chức năng mở ra mà không phải đăng nhập lại.
 */
export function SellerApprovedOnly({ title, children }: SellerApprovedOnlyProps) {
  const { user } = useAuthSession();
  const isMerchant = Boolean(user?.roles.includes('MERCHANT'));
  const application = useMyMerchantApplication(Boolean(user) && !isMerchant);
  const isApproved = application.data?.status === 'APPROVED';

  useEffect(() => {
    if (isApproved && !isMerchant) void syncSessionRoles();
  }, [isApproved, isMerchant]);

  if (isMerchant) return <>{children}</>;

  return (
    <SellerPageScaffold
      onPressBack={() => (router.canGoBack() ? router.back() : router.navigate('/seller/reports'))}
      subtitle="Cần được duyệt đăng ký bán hàng để dùng chức năng này"
      title={title}
    >
      <MerchantRegistrationRequired />
    </SellerPageScaffold>
  );
}

/** Bọc một màn hình người bán bằng SellerApprovedOnly, dùng ở file route. */
export function withSellerApproval<P extends object>(Screen: ComponentType<P>, title: string) {
  return function ApprovedScreen(props: P) {
    return (
      <SellerApprovedOnly title={title}>
        <Screen {...props} />
      </SellerApprovedOnly>
    );
  };
}
