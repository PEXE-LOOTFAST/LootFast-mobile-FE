import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Divider } from '@/components/ui/divider';
import { LIST_ROW_ICON_SIZE, ListRow, type ListRowProps } from '@/components/ui/list-row';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type MenuItem = Omit<ListRowProps, 'compact'> & { key: string };

type MenuSectionProps = {
  /** Nhãn in hoa ở đầu khối, bỏ trống khi danh sách đứng riêng dưới header. */
  title?: string;
  items?: MenuItem[];
  /** Hàng tự dựng (vd. hàng có Switch), đặt sau `items`, cũng được ngăn bằng đường kẻ. */
  children?: ReactNode;
  compact?: boolean;
};

// Khối danh sách dạng thẻ bo góc, các hàng ngăn bằng đường kẻ thụt thẳng hàng với chữ.
export function MenuSection({ title, items = [], children, compact = false }: MenuSectionProps) {
  const theme = useTheme();
  const rows = [
    ...items.map(({ key, ...item }) => <ListRow key={key} compact={compact} {...item} />),
    ...Children.toArray(children),
  ];
  // Thụt đường kẻ tới mép chữ: lề trái + cột icon + khoảng cách icon–chữ.
  const dividerInset = Spacing.lg + (compact ? 18 : LIST_ROW_ICON_SIZE) + Spacing.md;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      {title ? (
        <AppText
          accessibilityRole="header"
          style={[styles.title, { borderBottomColor: theme.border }]}
          tone="textSecondary"
          variant="caption"
          weight="heavy"
        >
          {title}
        </AppText>
      ) : null}

      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 ? <Divider style={{ marginLeft: dividerInset }} /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderWidth: 1, borderRadius: Radius.lg },
  title: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + Spacing.xxs,
  },
});
