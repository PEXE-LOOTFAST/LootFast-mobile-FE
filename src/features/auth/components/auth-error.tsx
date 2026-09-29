import { StyleSheet, Text, View } from 'react-native';

import { FieldIcon } from '@/features/auth/components/field-icon';
import { AuthIcons } from '@/features/auth/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type AuthErrorProps = {
  message: string;
};

export function AuthError({ message }: AuthErrorProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.container, { backgroundColor: `${theme.danger}1F` }]}
    >
      <FieldIcon name={AuthIcons.warning} color={theme.danger} />
      <Text style={[styles.message, { color: theme.danger }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12 },
  message: { flex: 1, fontSize: 13, fontWeight: '700', lineHeight: 19 },
});
