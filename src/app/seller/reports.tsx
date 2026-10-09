import { SellerReportScreen } from '@/features/seller/components/seller-report-screen';
import { withSellerApproval } from '@/features/seller/components/seller-approved-only';

export default withSellerApproval(SellerReportScreen, 'Báo cáo');
