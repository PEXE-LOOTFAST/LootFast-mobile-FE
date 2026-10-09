import { DealImagesScreen } from '@/features/seller/components/deal-images-screen';
import { withSellerApproval } from '@/features/seller/components/seller-approved-only';

export default withSellerApproval(DealImagesScreen, 'Ảnh deal');
