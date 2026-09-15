import { SymbolView } from 'expo-symbols';

import type { HomeIconName } from '@/features/home/constants/icons';

type HomeIconProps = {
  name: HomeIconName;
  color: string;
  size?: number;
};

export function HomeIcon({ name, color, size = 18 }: HomeIconProps) {
  return <SymbolView name={name} size={size} tintColor={color} />;
}
