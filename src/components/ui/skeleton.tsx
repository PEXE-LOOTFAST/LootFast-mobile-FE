import { useEffect } from 'react';
import { type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Radius, type RadiusToken } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SkeletonProps = {
  width?: DimensionValue;
  height: number;
  radius?: RadiusToken;
  style?: StyleProp<ViewStyle>;
};

/**
 * Khối xám nhấp nháy giữ chỗ cho nội dung đang tải. Dựng đúng hình dáng thẻ sắp hiện để người
 * dùng thấy ngay bố cục và không bị giật khi dữ liệu về, thay vì một vòng xoay giữa màn trống.
 */
export function Skeleton({ width = '100%', height, radius = 'sm', style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.45, { duration: 750 }), -1, true);
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: Radius[radius], backgroundColor: theme.backgroundSelected },
        pulse,
        style,
      ]}
    />
  );
}
