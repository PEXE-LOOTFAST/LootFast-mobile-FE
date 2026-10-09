import { SellerShopInfoScreen } from '@/features/seller/components/seller-shop-info-screen';
import { withSellerApproval } from '@/features/seller/components/seller-approved-only';

export default withSellerApproval(SellerShopInfoScreen, 'Thông tin quán');
