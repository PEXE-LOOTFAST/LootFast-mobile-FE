import { SymbolView } from 'expo-symbols';

import type { AuthIconName } from '@/features/auth/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type FieldIconProps = {
  name: AuthIconName;
  color?: string;
  size?: number;
};

export function FieldIcon({ name, color, size = 18 }: FieldIconProps) {
  const theme = useTheme();

  return <SymbolView name={name} size={size} tintColor={color ?? theme.textSecondary} />;
}
