import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Shadow, Spacing } from '@/constants/theme';
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
        <Text style={[styles.logoText, { color: theme.onPrimary }]}>L</Text>
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
    borderRadius: Radius.lg,
  },
  logo: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xxl,
    boxShadow: Shadow.brandStrong,
  },
  logoText: { fontSize: FontSize.hero, fontWeight: FontWeight.heavy },
  brand: {
    marginTop: 18,
    fontSize: FontSize.hero,
    fontWeight: FontWeight.heavy,
    letterSpacing: -0.8,
  },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  tagline: { fontSize: FontSize.body, fontWeight: FontWeight.medium },
});
