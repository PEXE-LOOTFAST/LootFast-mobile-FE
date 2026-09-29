import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { AdminTabIcons } from '@/components/navigation/admin-tab-icons';
import { TabBar } from '@/components/navigation/tab-bar';

// Không có nút nổi ở giữa: admin không có thao tác nào nổi trội hơn hẳn các mục còn lại.
export function AdminTabBar(props: BottomTabBarProps) {
  return <TabBar {...props} icons={AdminTabIcons} iconSize={22} />;
}
