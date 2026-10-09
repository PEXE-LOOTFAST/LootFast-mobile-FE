import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/ui/brand-button';
import { Icon } from '@/components/ui/icon';
import { HomeIcons } from '@/features/home/constants/icons';
import { useTheme } from '@/hooks/use-theme';

type EmptyDealsProps = {
  /** Người dùng đang áp bộ lọc/từ khoá. Chưa lọc gì thì rỗng nghĩa là quanh đây chưa có deal. */
  isFiltering: boolean;
  radiusLabel: string;
  onReset: () => void;
};

export function EmptyDeals({ isFiltering, radiusLabel, onReset }: EmptyDealsProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
        <Icon name={HomeIcons.search} color={theme.primary} size={26} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>
        {isFiltering ? 'Chưa tìm thấy deal phù hợp' : 'Chưa có deal quanh bạn'}
      </Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {isFiltering
          ? 'Thử từ khoá khác hoặc xem lại tất cả deal quanh bạn.'
          : `Hiện chưa có deal nào trong bán kính ${radiusLabel}. Thử mở rộng bán kính hoặc quay lại sau.`}
      </Text>
      {isFiltering ? (
        <View style={styles.action}>
          <BrandButton variant="secondary" onPress={onReset}>
            Xoá bộ lọc
          </BrandButton>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 24,
  },
  icon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderRadius: 28,
  },
  title: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  description: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  action: { alignSelf: 'stretch', marginTop: 8 },
});
