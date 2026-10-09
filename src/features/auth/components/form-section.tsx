import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type FormSectionProps = {
  title: string;
  titleSize?: number;
  highlighted?: boolean;
  children: ReactNode;
};

export function FormSection({
  title,
  titleSize = 12,
  highlighted = false,
  children,
}: FormSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.heading,
          highlighted && [styles.tag, { backgroundColor: theme.primarySoft }],
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: highlighted ? theme.primary : theme.text, fontSize: titleSize },
          ]}
        >
          {title}
        </Text>
      </View>
      <View style={styles.fields}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { alignSelf: 'flex-start', maxWidth: '100%' },
  tag: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  title: { fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  fields: { gap: 14 },
});
