import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeIcon } from '@/features/home/components/home-icon';
import type { HomeIconName } from '@/features/home/constants/icons';
import { SellerIcons } from '@/features/seller/constants/icons';
import { useTheme } from '@/hooks/use-theme';

export type SellerMenuItem = {
  key: string;
  icon: HomeIconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

type SellerMenuListProps = {
  items: SellerMenuItem[];
  /** Nhãn in hoa ở đầu khối, bỏ trống khi danh sách đứng riêng dưới header. */
  title?: string;
  /** Hàng thấp, icon không có nền tròn — dùng cho danh sách phụ như Cài đặt. */
  compact?: boolean;
};

// Khối danh sách điều hướng dạng thẻ bo góc, mỗi hàng có icon, tiêu đề và mũi tên sang phải.
export function SellerMenuList({ items, title, compact = false }: SellerMenuListProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      {title ? (
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.textSecondary, borderBottomColor: theme.border }]}
        >
          {title}
        </Text>
      ) : null}

      {items.map((item, index) => (
        <Fragment key={item.key}>
          {index > 0 ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
          <Pressable
            accessibilityHint={item.subtitle}
            accessibilityLabel={item.title}
            accessibilityRole="button"
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.row,
              compact ? styles.rowCompact : styles.rowRegular,
              pressed && { backgroundColor: theme.backgroundSelected },
            ]}
          >
            {compact ? (
              <HomeIcon name={item.icon} color={theme.primary} size={18} />
            ) : (
              <View style={[styles.iconBadge, { backgroundColor: theme.primarySoft }]}>
                <HomeIcon name={item.icon} color={theme.primary} size={19} />
              </View>
            )}

            <View style={styles.copy}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                  {item.subtitle}
                </Text>
              ) : null}
            </View>

            <HomeIcon name={SellerIcons.chevronRight} color={theme.text} size={16} />
          </Pressable>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderWidth: 1, borderRadius: 18 },
  title: {
    borderBottomWidth: 1,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  rowRegular: { minHeight: 60, gap: 14, paddingVertical: 12 },
  rowCompact: { minHeight: 50, gap: 12, paddingVertical: 10 },
  iconBadge: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  copy: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 14, fontWeight: '800' },
  rowSubtitle: { fontSize: 12, lineHeight: 17 },
  divider: { height: 1 },
});
