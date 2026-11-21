import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Badge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon';
import { UiIcons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Khu đang đứng: `seller` thêm nhãn "Người bán" để người vừa mua vừa bán biết mình ở chế độ nào. */
export type HeaderVariant = 'buyer' | 'seller';

type TabHeaderProps = {
  title: string;
  /** Một dòng phụ; dài quá sẽ bị cắt để header luôn cùng chiều cao giữa các tab. */
  subtitle?: string;
  subtitleIcon?: IconName;
  /** Có thì hiện nút quay lại bên trái tiêu đề. */
  onBack?: () => void;
  /** Cụm nút hành động bên phải (vd. GPS, thông báo). */
  trailing?: ReactNode;
  variant?: HeaderVariant;
};

/**
 * Header dùng chung cho các tab: cùng chiều cao, cùng cấu trúc (tiêu đề + dòng phụ bên trái,
 * hành động bên phải) để chuyển tab không thấy khung nhảy. Nền trùng nền trang thay vì một mảng
 * màu đậm, để nội dung bên dưới là thứ nổi bật nhất.
 */
export function TabHeader({
  title,
  subtitle,
  subtitleIcon,
  onBack,
  trailing,
  variant = 'buyer',
}: TabHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.background },
      ]}
    >
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={Spacing.xs}
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={UiIcons.back} color={theme.text} size={20} />
          </Pressable>
        ) : null}

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <AppText
              accessibilityRole="header"
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              numberOfLines={1}
              style={styles.title}
              variant="titleLg"
              weight="heavy"
            >
              {title}
            </AppText>
            {variant === 'seller' ? <Badge label="Người bán" size="sm" tone="primarySoft" /> : null}
          </View>
          {subtitle ? (
            <View style={styles.subtitleRow}>
              {subtitleIcon ? (
                <Icon name={subtitleIcon} color={theme.textSecondary} size={13} />
              ) : null}
              <AppText
                numberOfLines={1}
                style={styles.subtitle}
                tone="textSecondary"
                variant="footnote"
                weight="medium"
              >
                {subtitle}
              </AppText>
            </View>
          ) : null}
        </View>

        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
  },
  pressed: { opacity: 0.8 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  copy: { flex: 1, minWidth: 0, gap: Spacing.xxs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { flexShrink: 1, letterSpacing: -0.3 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  subtitle: { flexShrink: 1 },
});
