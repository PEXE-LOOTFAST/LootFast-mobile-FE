import { SellerEditDealScreen } from '@/features/seller/components/seller-edit-deal-screen';
import { withSellerApproval } from '@/features/seller/components/seller-approved-only';

export default withSellerApproval(SellerEditDealScreen, 'Sửa bản nháp');
