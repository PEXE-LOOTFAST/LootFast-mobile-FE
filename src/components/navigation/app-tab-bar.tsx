import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { TabBar } from '@/components/navigation/tab-bar';
import { TabIcons } from '@/components/navigation/tab-icons';

export function AppTabBar(props: BottomTabBarProps) {
  return <TabBar {...props} icons={TabIcons} labelVariant="bodySm" />;
}
