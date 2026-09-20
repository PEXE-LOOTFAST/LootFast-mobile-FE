import { SellerPlaceholderScreen } from '@/features/seller/components/seller-placeholder-screen';
import { SellerIcons } from '@/features/seller/constants/icons';

export default function SellerOrdersRoute() {
  return (
    <SellerPlaceholderScreen
      description="Danh sách đơn của quán, xác nhận và giao cho khách sẽ có ở đây."
      icon={SellerIcons.bag}
      title="Đơn hàng của quán"
    />
  );
}
