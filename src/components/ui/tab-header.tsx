import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BrandMark } from '@/components/ui/brand-mark';
import { HeroBand } from '@/components/ui/hero-band';
import { Icon, type IconName } from '@/components/ui/icon';
import { UiIcons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Khu đang đứng: `seller` và `admin` thêm nhãn nhỏ cạnh tiêu đề, để người vừa mua vừa bán, hay
 * admin, luôn biết mình đang ở chế độ nào.
 */
export type HeaderVariant = 'buyer' | 'seller' | 'admin';

const VARIANT_LABELS: Record<HeaderVariant, string | null> = {
  buyer: null,
  seller: 'Người bán',
  admin: 'Quản trị',
};

const LOGO_SIZE = 40;

type TabHeaderProps = {
  title: string;
  /** Một dòng phụ; dài quá sẽ bị cắt để header luôn cùng chiều cao giữa các tab. */
  subtitle?: string;
  subtitleIcon?: IconName;
  /** Có thì hiện nút quay lại thay cho logo (màn phụ mở từ một tab). */
  onBack?: () => void;
  /** Cụm nút hành động bên phải; nút icon dùng `tone="hero"` để hợp nền xanh. */
  trailing?: ReactNode;
  variant?: HeaderVariant;
};

/**
 * Header dùng chung cho mọi tab và màn phụ: cùng dải thương hiệu với Trang chủ, cùng chiều cao,
 * cùng cấu trúc (logo hoặc nút quay lại, tiêu đề + dòng phụ, hành động bên phải) để chuyển tab
 * không thấy khung nhảy.
 */
export function TabHeader({
  title,
  subtitle,
  subtitleIcon,
  onBack,
  trailing,
  variant = 'buyer',
}: TabHeaderProps) {
  const theme = useTheme();
  const variantLabel = VARIANT_LABELS[variant];

  return (
    <HeroBand>
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            accessibilityLabel="Quay lại"
            accessibilityRole="button"
            hitSlop={Spacing.xs}
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.heroButton },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={UiIcons.back} color={theme.onHero} size={20} />
          </Pressable>
        ) : (
          <BrandMark size={LOGO_SIZE} />
        )}

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <AppText
              accessibilityRole="header"
              color={theme.onHero}
              numberOfLines={1}
              style={styles.title}
              variant="title"
              weight="heavy"
            >
              {title}
            </AppText>
            {variantLabel ? (
              <View style={[styles.variantPill, { backgroundColor: theme.heroButton }]}>
                <AppText color={theme.onHero} variant="micro" weight="heavy">
                  {variantLabel}
                </AppText>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <View style={styles.subtitleRow}>
              {subtitleIcon ? (
                <Icon name={subtitleIcon} color={theme.onHeroMuted} size={13} />
              ) : null}
              <AppText
                color={theme.onHeroMuted}
                numberOfLines={1}
                style={styles.subtitle}
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
    </HeroBand>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  pressed: { opacity: 0.8 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  copy: { flex: 1, minWidth: 0, gap: Spacing.xxs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { flexShrink: 1, letterSpacing: -0.3 },
  variantPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  subtitle: { flexShrink: 1 },
});
