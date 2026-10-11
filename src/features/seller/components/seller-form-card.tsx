import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

// Khung trắng bo góc bọc nhóm ô nhập trên các trang Cài đặt.
export function SellerFormCard({
  children,
  compact = false,
}: {
  children: ReactNode;
  /** Khoảng cách và lề trong nhỏ hơn, cho form dài nhiều nhóm ô. */
  compact?: boolean;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        compact && styles.compact,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    boxShadow: '0px 4px 12px rgba(23, 33, 27, 0.05)',
  },
  compact: { gap: 10, padding: 12 },
});
