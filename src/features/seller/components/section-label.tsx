import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

// Nhãn mục dạng chữ in hoa nằm giữa hai đường kẻ, dùng để chia trang Tổng quan thành từng khối.
export function SectionLabel({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
      <Text accessibilityRole="header" style={[styles.label, { color: theme.textSecondary }]}>
        {title}
      </Text>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
});
