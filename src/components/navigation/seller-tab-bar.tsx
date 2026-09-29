import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { SELLER_CENTER_TAB, SellerTabIcons } from '@/components/navigation/seller-tab-icons';
import { TabBar } from '@/components/navigation/tab-bar';

// Mục giữa ("Đăng deal") là nút tròn nổi lên trên, vì đăng deal là việc người bán làm nhiều nhất.
export function SellerTabBar(props: BottomTabBarProps) {
  return <TabBar {...props} centerRoute={SELLER_CENTER_TAB} icons={SellerTabIcons} />;
}
