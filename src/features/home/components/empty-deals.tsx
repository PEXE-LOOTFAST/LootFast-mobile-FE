import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
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
    gap: Spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
  },
  icon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    borderRadius: Radius.full,
  },
  title: { fontSize: FontSize.subtitle, fontWeight: FontWeight.bold, textAlign: 'center' },
  description: { fontSize: FontSize.bodySm, lineHeight: 19, textAlign: 'center' },
  action: { alignSelf: 'stretch', marginTop: Spacing.sm },
});
