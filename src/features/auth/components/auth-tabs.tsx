import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import type { AuthTab } from '@/features/auth/types';
import { useTheme } from '@/hooks/use-theme';

const TABS: { key: AuthTab; label: string }[] = [
  { key: 'login', label: 'Đăng nhập' },
  { key: 'register', label: 'Đăng ký' },
];

type AuthTabsProps = {
  value: AuthTab;
  onChange: (tab: AuthTab) => void;
};

export function AuthTabs({ value, onChange }: AuthTabsProps) {
  const theme = useTheme();

  return (
    <View accessibilityRole="tablist" style={[styles.container, { borderColor: theme.border }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === value;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.key)}
            style={styles.tab}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? theme.primary : theme.textSecondary },
                isActive && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>
            <View
              style={[
                styles.indicator,
                { backgroundColor: isActive ? theme.primary : 'transparent' },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingTop: Spacing.xl },
  label: { fontSize: FontSize.subtitle, fontWeight: FontWeight.bold },
  activeLabel: { fontWeight: FontWeight.bold },
  indicator: { alignSelf: 'stretch', height: 3, marginTop: Spacing.lg, borderRadius: Radius.full },
});
