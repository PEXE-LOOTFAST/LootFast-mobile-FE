import { StyleSheet, Text, View } from 'react-native';

import { FieldIcon } from '@/features/auth/components/field-icon';
import { AuthIcons } from '@/features/auth/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type AuthNoticeProps = {
  message: string;
};

export function AuthNotice({ message }: AuthNoticeProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.container, { backgroundColor: theme.primarySoft }]}
    >
      <FieldIcon name={AuthIcons.success} color={theme.primary} />
      <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12 },
  message: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 19 },
});
