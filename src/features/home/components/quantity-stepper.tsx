import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type QuantityStepperProps = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  /** Khoá lại sau khi đặt xong để khách không tưởng là đổi được số phần của đơn đã giữ. */
  disabled?: boolean;
};

// Bộ chọn số lượng nhỏ (− số +). Khoảng chọn chỉ vài phần nên nút bấm tiện hơn ô nhập chữ và không
// thể nhập số vô nghĩa.
export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
}: QuantityStepperProps) {
  const theme = useTheme();
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  const renderButton = (
    label: string,
    accessibilityLabel: string,
    enabled: boolean,
    next: number,
  ) => (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      hitSlop={6}
      onPress={() => onChange(next)}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.primarySoft, borderColor: theme.border },
        !enabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, { color: theme.primary }]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {renderButton('−', 'Giảm số lượng', canDecrease, value - 1)}
      <Text
        accessibilityLabel={`Số lượng ${value}`}
        accessibilityLiveRegion="polite"
        style={[styles.value, { color: theme.text }]}
      >
        {value}
      </Text>
      {renderButton('+', 'Tăng số lượng', canIncrease, value + 1)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 20,
  },
  buttonText: { fontSize: 22, fontWeight: '800', lineHeight: 26 },
  value: { minWidth: 28, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
});
