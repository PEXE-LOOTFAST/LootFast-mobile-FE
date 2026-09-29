import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { AuthIcons } from '@/features/auth/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type AuthHeaderProps = {
  onBack?: () => void;
};

export function AuthHeader({ onBack }: AuthHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {onBack ? (
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onBack}
            style={[
              styles.backButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}
          >
            <Icon name={AuthIcons.back} color={theme.text} />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.logo, { backgroundColor: theme.primary }]}>
        <Text style={styles.logoText}>L</Text>
      </View>

      <Text accessibilityRole="header" style={[styles.brand, { color: theme.text }]}>
        Loot<Text style={{ color: theme.primary }}>Fast</Text>
      </Text>

      <View style={styles.taglineRow}>
        <Icon name={AuthIcons.leaf} color={theme.primary} size={16} />
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
          Ăn ngon - tiết kiệm - cứu thực phẩm
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  topBar: { alignSelf: 'stretch', height: 44, justifyContent: 'center' },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
  },
  logo: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    boxShadow: '0px 12px 28px rgba(22, 121, 75, 0.32)',
  },
  logoText: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' },
  brand: { marginTop: 18, fontSize: 34, fontWeight: '900', letterSpacing: -0.8 },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  tagline: { fontSize: 14, fontWeight: '500' },
});
