import { SellerNewDealScreen } from '@/features/seller/components/seller-new-deal-screen';
import { withSellerApproval } from '@/features/seller/components/seller-approved-only';

export default withSellerApproval(SellerNewDealScreen, 'Đăng deal mới');
