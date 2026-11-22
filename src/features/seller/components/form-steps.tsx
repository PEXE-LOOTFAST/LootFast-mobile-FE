import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FormStepsProps = {
  steps: readonly string[];
  /** Bước đang làm, tính từ 0. */
  current: number;
};

/**
 * Thanh bước của form nhiều màn: bước đã qua và bước đang làm tô màu chính, bước sau để xám,
 * để người bán biết còn bao nhiêu việc trước khi đăng.
 */
export function FormSteps({ steps, current }: FormStepsProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={`Bước ${current + 1} trên ${steps.length}: ${steps[current] ?? ''}`}
      accessible
      style={styles.row}
    >
      {steps.map((label, index) => {
        const isCurrent = index === current;

        return (
          <View key={label} style={styles.step}>
            <View
              style={[
                styles.bar,
                { backgroundColor: index <= current ? theme.primary : theme.border },
              ]}
            />
            <AppText
              numberOfLines={1}
              tone={isCurrent ? 'primary' : 'textSecondary'}
              variant="footnote"
              weight={isCurrent ? 'bold' : 'medium'}
            >
              {index + 1}. {label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.xs },
  step: { flex: 1, gap: Spacing.xs },
  bar: { height: 4, borderRadius: Radius.full },
});
