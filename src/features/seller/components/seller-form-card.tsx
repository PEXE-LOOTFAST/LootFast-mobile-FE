import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

// Khung trắng bo góc bọc nhóm ô nhập trên các trang Cài đặt.
export function SellerFormCard({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
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
});
