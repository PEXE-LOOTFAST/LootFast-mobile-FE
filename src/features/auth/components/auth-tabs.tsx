import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  tab: { flex: 1, alignItems: 'center', paddingTop: 20 },
  label: { fontSize: 16, fontWeight: '700' },
  activeLabel: { fontWeight: '800' },
  indicator: { alignSelf: 'stretch', height: 3, marginTop: 16, borderRadius: 3 },
});
