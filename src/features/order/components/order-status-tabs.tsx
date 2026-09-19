import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ORDER_STATUS_TABS } from '@/features/order/constants/order-status';
import type { OrderStatus } from '@/features/order/types';
import { useTheme } from '@/hooks/use-theme';

type OrderStatusTabsProps = {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
};

export function OrderStatusTabs({ value, onChange }: OrderStatusTabsProps) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.content}
        showsHorizontalScrollIndicator={false}
      >
        {ORDER_STATUS_TABS.map((tab) => {
          const isActive = tab.id === value;

          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(tab.id)}
              style={[
                styles.tab,
                isActive && [styles.activeTab, { backgroundColor: theme.backgroundElement }],
              ]}
            >
              <Text
                style={[
                  styles.label,
                  { color: isActive ? theme.text : theme.textSecondary },
                  isActive && styles.activeLabel,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', borderRadius: 18 },
  content: { gap: 4, padding: 4 },
  tab: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  activeTab: { boxShadow: '0px 2px 8px rgba(23, 33, 27, 0.1)' },
  label: { fontSize: 12, fontWeight: '700' },
  activeLabel: { fontWeight: '800' },
});
