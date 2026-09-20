import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type SegmentedTabsProps<Id extends string> = {
  items: { id: Id; label: string }[];
  value: Id;
  onChange: (id: Id) => void;
  size?: 'medium' | 'small';
};

// Dải tab dạng viên thuốc, mục đang chọn nổi lên nền trắng. Dùng cho cả ba mục lớn
// của trang và các nhóm đơn bên trong.
export function SegmentedTabs<Id extends string>({
  items,
  value,
  onChange,
  size = 'medium',
}: SegmentedTabsProps<Id>) {
  const theme = useTheme();
  const isSmall = size === 'small';

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
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
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                isSmall && styles.labelSmall,
                { color: isActive ? theme.text : theme.textSecondary },
                isActive && styles.activeLabel,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', gap: 4, borderRadius: 18, padding: 4 },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 9,
  },
  tabSmall: { paddingHorizontal: 2, paddingVertical: 7 },
  activeTab: { boxShadow: '0px 2px 8px rgba(23, 33, 27, 0.1)' },
  label: { fontSize: 12, fontWeight: '700' },
  labelSmall: { fontSize: 10 },
  activeLabel: { fontWeight: '800' },
});
