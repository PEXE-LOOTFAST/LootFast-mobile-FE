import { SellerSettingsScreen } from '@/features/seller/components/seller-settings-screen';
import { withSellerApproval } from '@/features/seller/components/seller-approved-only';

export default withSellerApproval(SellerSettingsScreen, 'Cài đặt');
