import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TabIcons } from '@/components/navigation/tab-icons';
import { useTheme } from '@/hooks/use-theme';

export function AppTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const theme = useTheme();
  const focusedKey = state.routes[state.index]?.key;
  // Route không có trong TabIcons (vd. deal/[id]) là màn phụ, không hiện nút trên thanh tab.
  const tabRoutes = state.routes.filter((route) => route.name in TabIcons);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {tabRoutes.map((route) => {
        const isFocused = route.key === focusedKey;
        const label = descriptors[route.key]?.options.title ?? route.name;
        const icon = TabIcons[route.name as keyof typeof TabIcons];
        const color = isFocused ? theme.primary : theme.text;

        // Phát tabPress trước để listener ở _layout (chặn khách) có cơ hội gọi preventDefault.
        const handlePress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return (
          <Pressable
            key={route.key}
            accessibilityLabel={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            onPress={handlePress}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <View style={[styles.indicator, isFocused && { backgroundColor: theme.primarySoft }]}>
              {icon ? <SymbolView name={icon} size={24} tintColor={color} /> : null}
            </View>
            <Text
              numberOfLines={1}
              style={[styles.label, { color }, isFocused && styles.labelActive]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 8,
    boxShadow: '0px -6px 20px rgba(23, 33, 27, 0.06)',
  },
  item: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 2 },
  indicator: {
    width: 60,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  label: { fontSize: 13, fontWeight: '600' },
  labelActive: { fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
