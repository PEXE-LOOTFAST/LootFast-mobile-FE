import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Không tìm thấy', headerShown: true }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Trang này không tồn tại.</Text>
        <Link href="/" style={[styles.link, { color: theme.textSecondary }]}>
          Về trang chủ
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  title: { fontSize: FontSize.title, fontWeight: FontWeight.medium },
  link: { fontSize: FontSize.body, textDecorationLine: 'underline' },
});
