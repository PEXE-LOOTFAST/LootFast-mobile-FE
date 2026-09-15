import { ScrollView, StyleSheet, View } from 'react-native';

import { LowStockCard } from '@/features/home/components/low-stock-card';
import { SectionHeader } from '@/features/home/components/section-header';
import type { Deal } from '@/features/home/types';

type LowStockSectionProps = {
  deals: Deal[];
  horizontalInset: number;
  onPressDeal?: (deal: Deal) => void;
};

export function LowStockSection({ deals, horizontalInset, onPressDeal }: LowStockSectionProps) {
  if (deals.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader title="Sắp hết suất" subtitle="Nhanh tay kẻo lỡ, mỗi deal chỉ còn vài phần" />

      {/* Kéo rail tràn ra sát mép màn hình để người dùng nhận ra danh sách này vuốt ngang được. */}
      <ScrollView
        horizontal
        contentContainerStyle={[styles.rail, { paddingHorizontal: horizontalInset }]}
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -horizontalInset }}
      >
        {deals.map((deal) => (
          <LowStockCard
            key={deal.id}
            deal={deal}
            onPress={onPressDeal ? () => onPressDeal(deal) : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  rail: { gap: 12 },
});
