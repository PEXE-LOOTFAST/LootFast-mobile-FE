import { SellerOverviewScreen } from '@/features/seller/components/seller-overview-screen';
import { withSellerApproval } from '@/features/seller/components/seller-approved-only';

export default withSellerApproval(SellerOverviewScreen, 'Tổng quan');
