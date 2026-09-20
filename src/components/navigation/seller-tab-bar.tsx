import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SELLER_CENTER_TAB, SellerTabIcons } from '@/components/navigation/seller-tab-icons';
import { useTheme } from '@/hooks/use-theme';

// Thanh tab của người bán: cùng bố cục với thanh của người mua nhưng mục giữa ("Đăng deal")
// là nút tròn nổi lên trên, vì đăng deal là việc người bán làm nhiều nhất trong ngày.
export function SellerTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const theme = useTheme();
  const focusedKey = state.routes[state.index]?.key;
  // Route không có trong SellerTabIcons là màn phụ, không hiện nút trên thanh tab.
  const tabRoutes = state.routes.filter((route) => route.name in SellerTabIcons);

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
        const isCenter = route.name === SELLER_CENTER_TAB;
        const label = descriptors[route.key]?.options.title ?? route.name;
        const icon = SellerTabIcons[route.name as keyof typeof SellerTabIcons];
        const color = isFocused || isCenter ? theme.primary : theme.text;

        // Phát tabPress trước để listener ở _layout có cơ hội gọi preventDefault.
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
            {isCenter ? (
              <View style={[styles.centerButton, { backgroundColor: theme.primary }]}>
                <SymbolView name={icon} size={28} tintColor="#FFFFFF" />
              </View>
            ) : (
              <View style={[styles.indicator, isFocused && { backgroundColor: theme.primarySoft }]}>
                <SymbolView name={icon} size={24} tintColor={color} />
              </View>
            )}

            <Text
              numberOfLines={1}
              style={[styles.label, { color }, (isFocused || isCenter) && styles.labelActive]}
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
  // Nhô lên khỏi thanh tab: marginTop âm bù lại chiều cao dư để nhãn vẫn thẳng hàng.
  centerButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    marginTop: -24,
    marginBottom: 2,
    boxShadow: '0px 8px 18px rgba(22, 121, 75, 0.35)',
  },
  label: { fontSize: 12, fontWeight: '600' },
  labelActive: { fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
