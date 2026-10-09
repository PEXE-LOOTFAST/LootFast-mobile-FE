import { SellerOrderScreen } from '@/features/seller/components/seller-order-screen';
import { withSellerApproval } from '@/features/seller/components/seller-approved-only';

export default withSellerApproval(SellerOrderScreen, 'Đơn hàng');
