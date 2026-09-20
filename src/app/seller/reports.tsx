import { SellerPlaceholderScreen } from '@/features/seller/components/seller-placeholder-screen';
import { SellerIcons } from '@/features/seller/constants/icons';

export default function SellerReportsRoute() {
  return (
    <SellerPlaceholderScreen
      description="Báo cáo doanh thu, tỷ lệ bán hết và hiệu quả từng deal theo thời gian."
      icon={SellerIcons.trend}
      title="Báo cáo"
    />
  );
}
