import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { UiIcons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Cột icon tròn của hàng thường; dùng để thụt đường kẻ cho thẳng hàng với chữ. */
export const LIST_ROW_ICON_SIZE = 38;

export type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Hàng thấp, icon không có nền tròn — cho danh sách phụ như Cài đặt. */
  compact?: boolean;
  /** `danger` cho thao tác phá huỷ (đăng xuất, xoá). */
  tone?: 'default' | 'danger';
  /** Mặc định có mũi tên khi hàng bấm được. Truyền node riêng (vd. Switch) hoặc `null` để bỏ. */
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

// Một hàng điều hướng/cài đặt: icon, tiêu đề, dòng phụ và mũi tên (hoặc control) bên phải.
export function ListRow({
  title,
  subtitle,
  icon,
  compact = false,
  tone = 'default',
  trailing,
  onPress,
  disabled,
}: ListRowProps) {
  const theme = useTheme();
  const accent = tone === 'danger' ? theme.danger : theme.primary;
  const trailingNode =
    trailing !== undefined ? (
      trailing
    ) : onPress ? (
      <Icon name={UiIcons.chevronRight} color={theme.textSecondary} size={16} />
    ) : null;

  const content = (
    <>
      {icon ? (
        compact ? (
          <Icon name={icon} color={accent} size={18} />
        ) : (
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: tone === 'danger' ? `${theme.danger}1F` : theme.primarySoft },
            ]}
          >
            <Icon name={icon} color={accent} size={19} />
          </View>
        )
      ) : null}

      <View style={styles.copy}>
        <AppText tone={tone === 'danger' ? 'danger' : 'text'} weight="bold">
          {title}
        </AppText>
        {subtitle ? (
          <AppText style={styles.subtitle} tone="textSecondary" variant="footnote">
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {trailingNode}
    </>
  );

  const rowStyle = [styles.row, compact ? styles.rowCompact : styles.rowRegular];

  if (!onPress) {
    return <View style={rowStyle}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityHint={subtitle}
      accessibilityLabel={title}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        rowStyle,
        pressed && { backgroundColor: theme.backgroundSelected },
        disabled && styles.disabled,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg },
  rowRegular: { minHeight: 60, gap: Spacing.md, paddingVertical: Spacing.md },
  rowCompact: { minHeight: 50, gap: Spacing.md, paddingVertical: Spacing.sm },
  iconBadge: {
    width: LIST_ROW_ICON_SIZE,
    height: LIST_ROW_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  copy: { flex: 1, gap: Spacing.xxs },
  subtitle: { lineHeight: 17 },
  disabled: { opacity: 0.5 },
});
