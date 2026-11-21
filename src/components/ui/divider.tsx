import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing, type SpacingToken } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DividerProps = {
  /** Thụt lề hai đầu (vd. thẳng hàng với chữ, bỏ qua cột icon). */
  inset?: SpacingToken;
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Đường kẻ mảnh ngăn các hàng trong một nhóm.
export function Divider({ inset, vertical = false, style }: DividerProps) {
  const theme = useTheme();
  const margin = inset ? Spacing[inset] : 0;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        vertical
          ? { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginVertical: margin }
          : { height: StyleSheet.hairlineWidth, marginHorizontal: margin },
        { backgroundColor: theme.border },
        style,
      ]}
    />
  );
}
