import { StyleSheet, View } from 'react-native';

import { EmptyCard } from '@/components/ui/empty-card';

// MapLibre chỉ có bản native, nên trên web chỉ hiện thông báo thay vì làm sập cả bundle web.
export function DealMap() {
  return (
    <View style={styles.container}>
      <EmptyCard
        description="Bản đồ chỉ hiển thị trên ứng dụng Android và iOS."
        title="Chưa hỗ trợ bản đồ trên web"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
