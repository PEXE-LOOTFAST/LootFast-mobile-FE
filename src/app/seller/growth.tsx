import { SellerGrowthScreen } from '@/features/seller/components/seller-growth-screen';
import { withSellerApproval } from '@/features/seller/components/seller-approved-only';

export default withSellerApproval(SellerGrowthScreen, 'Chương trình tăng trưởng');
