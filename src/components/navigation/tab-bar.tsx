import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconMap } from '@/components/ui/icon';
import { Radius, Shadow, Spacing, type FontSizeToken } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabBarProps = BottomTabBarProps & {
  /** Route không có trong bảng này là màn phụ, không hiện nút trên thanh tab. */
  icons: IconMap;
  /** Tên route được vẽ thành nút tròn nổi lên trên thay vì một mục thường. */
  centerRoute?: string;
  iconSize?: number;
  labelVariant?: FontSizeToken;
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
  labelVariant = 'footnote',
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
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
        },
      ]}
    >
      {tabRoutes.map((route) => {
        const isFocused = route.key === focusedKey;
        const isCenter = route.name === centerRoute;
        const options = descriptors[route.key]?.options;
        const label = options?.title ?? route.name;
        const badge = options?.tabBarBadge;
        const icon = icons[route.name];
        if (!icon) return null;

        // Mục chưa chọn dùng màu chữ phụ để mục đang chọn nổi rõ mà không cần đọc nhãn.
        const color = isFocused || isCenter ? theme.primary : theme.textSecondary;

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
            accessibilityLabel={badge === undefined ? label : `${label}, ${badge} mục cần xử lý`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            onPress={handlePress}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            {isCenter ? (
              <View style={[styles.centerButton, { backgroundColor: theme.primary }]}>
                <Icon name={icon} color={theme.onPrimary} size={28} />
              </View>
            ) : (
              <View style={[styles.indicator, isFocused && { backgroundColor: theme.primarySoft }]}>
                <Icon name={icon} color={color} size={iconSize} />
                {badge === undefined ? null : (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: theme.danger, borderColor: theme.backgroundElement },
                    ]}
                  >
                    <AppText color={theme.onDanger} variant="micro" weight="heavy">
                      {typeof badge === 'number' && badge > 99 ? '99+' : badge}
                    </AppText>
                  </View>
                )}
              </View>
            )}

            <AppText
              color={color}
              numberOfLines={1}
              variant={labelVariant}
              weight={isFocused || isCenter ? 'bold' : 'medium'}
            >
              {label}
            </AppText>
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
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  item: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xxs,
  },
  indicator: {
    width: 60,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  // Số đếm đỏ ở góc icon (vd. đơn đang chờ lấy), đặt theo `tabBarBadge` của từng màn.
  badge: {
    position: 'absolute',
    top: -Spacing.xxs,
    right: Spacing.sm,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xxs,
  },
  // Nhô lên khỏi thanh tab: marginTop âm bù lại chiều cao dư để nhãn vẫn thẳng hàng.
  centerButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    marginTop: -24,
    marginBottom: Spacing.xxs,
    boxShadow: Shadow.brand,
  },
  pressed: { opacity: 0.7 },
});
