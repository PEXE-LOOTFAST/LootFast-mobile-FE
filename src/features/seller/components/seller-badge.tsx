import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type SellerBadgeProps = {
  label: string;
  /** 'solid' nổi bật trạng thái đang áp dụng, 'soft' cho nhãn phân loại. */
  tone?: 'solid' | 'soft';
};

// Nhãn viên thuốc nhỏ cạnh tiêu đề thẻ, vd. "Đang dùng", "Thuộc gói Cao cấp".
export function SellerBadge({ label, tone = 'soft' }: SellerBadgeProps) {
  const theme = useTheme();
  const isSolid = tone === 'solid';

  return (
    <View
      style={[
        styles.badge,
        isSolid
          ? { backgroundColor: theme.primary, borderColor: theme.primary }
          : { backgroundColor: theme.primarySoft, borderColor: theme.primarySoft },
      ]}
    >
      <Text style={[styles.label, { color: isSolid ? theme.onPrimary : theme.primary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: { fontSize: 11, fontWeight: '800' },
});
