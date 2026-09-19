import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TabIcons } from '@/components/navigation/tab-icons';
import { useTheme } from '@/hooks/use-theme';

export function MapScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Bản đồ</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Tìm deal cuối ngày quanh bạn
        </Text>

        <View
          style={[
            styles.placeholder,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
            <SymbolView name={TabIcons.map} size={32} tintColor={theme.primary} />
          </View>
          <Text style={[styles.placeholderTitle, { color: theme.text }]}>
            Bản đồ đang được phát triển
          </Text>
          <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
            Sắp tới bạn có thể xem các cửa hàng đang có deal ngay trên bản đồ.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, padding: 20 },
  title: { marginTop: 10, fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { marginTop: 7, fontSize: 14 },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 22,
    padding: 24,
  },
  iconWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  placeholderTitle: { marginTop: 6, fontSize: 16, fontWeight: '800' },
  placeholderText: { maxWidth: 280, textAlign: 'center', fontSize: 13, lineHeight: 20 },
});
