import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { RatingColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StarRatingProps = {
  /** Số sao đang chọn/hiển thị, 0–5. */
  value: number;
  /** Có thì cho chạm để chọn; không có thì chỉ hiển thị. */
  onChange?: (value: number) => void;
  size?: number;
  disabled?: boolean;
};

const STARS = [1, 2, 3, 4, 5];
const STAR_PATH =
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

// Vẽ sao bằng SVG vì icon hệ thống trên Android chỉ có dạng viền, không phân biệt được sao đã chọn.
// Sao đã chọn tô đặc màu xanh dương (cùng màu sao ở thẻ deal); sao chưa chọn chỉ có viền.
export function StarRating({ value, onChange, size = 14, disabled = false }: StarRatingProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={onChange ? 'Chọn số sao' : `${value} sao`}
      accessibilityRole={onChange ? 'radiogroup' : 'image'}
      style={[styles.container, onChange && styles.interactive]}
    >
      {STARS.map((star) => {
        const isFilled = star <= value;
        const icon = (
          <Svg height={size} viewBox="0 0 24 24" width={size}>
            <Path
              d={STAR_PATH}
              fill={isFilled ? RatingColor : 'none'}
              stroke={isFilled ? RatingColor : theme.textSecondary}
              strokeLinejoin="round"
              strokeWidth={1.6}
            />
          </Svg>
        );

        if (!onChange) return <View key={star}>{icon}</View>;

        return (
          <Pressable
            key={star}
            accessibilityLabel={`${star} sao`}
            accessibilityRole="radio"
            accessibilityState={{ checked: star === value, disabled }}
            disabled={disabled}
            hitSlop={4}
            onPress={() => onChange(star)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 2 },
  interactive: { gap: 8 },
  pressed: { opacity: 0.7 },
});
