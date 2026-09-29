import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconMap } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

type TabBarProps = BottomTabBarProps & {
  /** Route không có trong bảng này là màn phụ, không hiện nút trên thanh tab. */
  icons: IconMap;
  /** Tên route được vẽ thành nút tròn nổi lên trên thay vì một mục thường. */
  centerRoute?: string;
  iconSize?: number;
  labelSize?: number;
};

// Thanh tab dùng chung cho cả ba khu vực (người mua, người bán, quản trị): cùng bố cục,
// khác nhau ở bảng icon và việc có nút nổi ở giữa hay không.
export function TabBar({
  state,
  descriptors,
  navigation,
  insets,
  icons,
  centerRoute,
  iconSize = 24,
  labelSize = 12,
}: TabBarProps) {
  const theme = useTheme();
  const focusedKey = state.routes[state.index]?.key;
  const tabRoutes = state.routes.filter((route) => route.name in icons);

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
        const isCenter = route.name === centerRoute;
        const label = descriptors[route.key]?.options.title ?? route.name;
        const icon = icons[route.name];
        if (!icon) return null;

        const color = isFocused || isCenter ? theme.primary : theme.text;

        // Phát tabPress trước để listener ở _layout (vd. chặn khách) có cơ hội gọi preventDefault.
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
                <Icon name={icon} color="#FFFFFF" size={28} />
              </View>
            ) : (
              <View style={[styles.indicator, isFocused && { backgroundColor: theme.primarySoft }]}>
                <Icon name={icon} color={color} size={iconSize} />
              </View>
            )}

            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color, fontSize: labelSize },
                (isFocused || isCenter) && styles.labelActive,
              ]}
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
  label: { fontWeight: '600' },
  labelActive: { fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
