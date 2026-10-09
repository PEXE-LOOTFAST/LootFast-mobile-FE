import { Redirect, router } from 'expo-router';

import { MerchantRegistrationSection } from '@/features/seller/components/merchant-registration-section';
import { SellerPageScaffold } from '@/features/seller/components/seller-page-scaffold';
import { useAuthSession } from '@/hooks/use-auth-session';

export default function MerchantApplicationRoute() {
  const { isAuthenticated, user } = useAuthSession();

  if (!isAuthenticated) return <Redirect href="/" />;
  if (user?.roles.includes('MERCHANT')) return <Redirect href="/seller" />;

  return (
    <SellerPageScaffold
      onPressBack={() => router.back()}
      subtitle="Gửi giấy phép kinh doanh để đăng ký bán hàng trên LootFast"
      title="Đăng ký bán hàng"
    >
      <MerchantRegistrationSection />
    </SellerPageScaffold>
  );
}
