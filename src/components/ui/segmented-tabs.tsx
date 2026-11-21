import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SegmentedTabsProps<Id extends string> = {
  items: { id: Id; label: string }[];
  value: Id;
  onChange: (id: Id) => void;
  size?: 'medium' | 'small';
};

// Dải tab dạng viên thuốc, mục đang chọn nổi lên nền trắng. Dùng cho các mục lớn của trang
// và các nhóm nhỏ bên trong (đơn hàng, báo cáo, duyệt cửa hàng).
export function SegmentedTabs<Id extends string>({
  items,
  value,
  onChange,
  size = 'medium',
}: SegmentedTabsProps<Id>) {
  const theme = useTheme();
  const isSmall = size === 'small';

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.track, { backgroundColor: theme.backgroundSelected }]}
    >
      {items.map((item) => {
        const isActive = item.id === value;

        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(item.id)}
            style={[
              styles.tab,
              isSmall && styles.tabSmall,
              isActive && [styles.activeTab, { backgroundColor: theme.backgroundElement }],
            ]}
          >
            <AppText
              numberOfLines={1}
              tone={isActive ? 'text' : 'textSecondary'}
              variant={isSmall ? 'micro' : 'footnote'}
              weight={isActive ? 'bold' : 'medium'}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', gap: Spacing.xs, borderRadius: Radius.lg, padding: Spacing.xs },
  // Bo góc trong = bo góc ngoài - padding, để hai lớp đồng tâm.
  tab: {
    flex: 1,
    // Cộng padding của dải tab là đủ 44–48px, mức ngón tay bấm trúng dễ dàng.
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xs,
  },
  tabSmall: { minHeight: 36, paddingHorizontal: Spacing.xxs },
  activeTab: { boxShadow: Shadow.raised },
});
