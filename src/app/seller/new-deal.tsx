import { SellerPlaceholderScreen } from '@/features/seller/components/seller-placeholder-screen';
import { SellerIcons } from '@/features/seller/constants/icons';

export default function SellerNewDealRoute() {
  return (
    <SellerPlaceholderScreen
      description="Biểu mẫu đăng deal cuối ngày: chọn món, số phần, mức giảm và khung giờ nhận."
      icon={SellerIcons.plus}
      title="Đăng deal mới"
    />
  );
}
