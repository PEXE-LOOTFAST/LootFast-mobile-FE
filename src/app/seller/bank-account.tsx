import { SellerBankAccountScreen } from '@/features/seller/components/seller-bank-account-screen';
import { withSellerApproval } from '@/features/seller/components/seller-approved-only';

export default withSellerApproval(SellerBankAccountScreen, 'Tài khoản nhận tiền');
