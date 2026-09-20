import { SellerPlaceholderScreen } from '@/features/seller/components/seller-placeholder-screen';
import { SellerIcons } from '@/features/seller/constants/icons';

export default function SellerShopRoute() {
  return (
    <SellerPlaceholderScreen
      description="Thông tin quán, giờ mở cửa, địa chỉ nhận món và tài khoản nhận tiền."
      icon={SellerIcons.verified}
      title="Hồ sơ quán"
    />
  );
}
