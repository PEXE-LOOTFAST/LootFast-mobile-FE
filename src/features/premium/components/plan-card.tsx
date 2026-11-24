import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { FontSize, FontWeight, PremiumColors, Radius, Spacing } from '@/constants/theme';
import { PremiumIcons } from '@/features/premium/constants/icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export type PlanBenefit = {
  label: string;
  badge?: string;
};

export function usePremiumPalette() {
  const scheme = useColorScheme();

  return PremiumColors[scheme === 'dark' ? 'dark' : 'light'];
}

function BenefitRow({
  benefit,
  accent,
  badgeBg,
}: {
  benefit: PlanBenefit;
  accent: string;
  badgeBg: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIcon}>
        <Icon name={PremiumIcons.check} color={accent} size={16} />
      </View>
      {/* Nhãn dài xuống dòng ngay cạnh icon; huy hiệu nối tiếp nhãn, hết chỗ thì xuống dòng. */}
      <View style={styles.benefitCopy}>
        <Text style={[styles.benefitLabel, { color: theme.text }]}>{benefit.label}</Text>
        {benefit.badge ? (
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: accent }]}>{benefit.badge}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Thẻ một gói dịch vụ: tên, giá, quyền lợi và phần chân (nút đăng ký hoặc "Đang dùng").
 * Gói Cao cấp dùng bảng màu xanh dương riêng để tách khỏi màu xanh lá thương hiệu.
 */
export function PlanCard({
  benefits,
  children,
  period,
  premium = false,
  price,
  ribbon,
  title,
}: {
  benefits: PlanBenefit[];
  children?: ReactNode;
  /** Chu kỳ tính phí đứng sau giá, vd. "/ tháng". */
  period?: string;
  premium?: boolean;
  price: string;
  /** Nhãn nhỏ trên góc thẻ, vd. "Đang dùng" hoặc "Đề xuất". */
  ribbon?: string;
  title: string;
}) {
  const theme = useTheme();
  const pc = usePremiumPalette();
  const accent = premium ? pc.accent : theme.textSecondary;

  return (
    <View
      style={[
        styles.planCard,
        premium
          ? { backgroundColor: pc.cardBg, borderColor: pc.cardBorder }
          : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <View style={styles.planHeader}>
        <View style={styles.planHeading}>
          <View style={styles.titleRow}>
            {premium ? <Icon name={PremiumIcons.crown} color={pc.accent} size={20} /> : null}
            <Text style={[styles.planTitle, { color: theme.text }]}>{title}</Text>
          </View>
          <Text style={[styles.planPrice, { color: premium ? pc.accent : theme.text }]}>
            {price}
            {period ? (
              <Text style={[styles.planPeriod, { color: theme.textSecondary }]}> {period}</Text>
            ) : null}
          </Text>
        </View>
        {ribbon ? (
          <View
            style={[styles.ribbon, { backgroundColor: premium ? pc.buyButton : theme.primarySoft }]}
          >
            <Text style={[styles.ribbonText, { color: premium ? pc.onBuyButton : theme.primary }]}>
              {ribbon}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.benefits}>
        {benefits.map((benefit) => (
          <BenefitRow
            accent={premium ? pc.accentSoft : accent}
            badgeBg={premium ? pc.badgeBg : theme.background}
            benefit={benefit}
            key={benefit.label}
          />
        ))}
      </View>
      {children}
    </View>
  );
}

/** Chân thẻ của gói người dùng đang có. */
export function CurrentPlanBox({ note }: { note?: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.currentBox, { borderColor: theme.border }]}>
      <Text style={[styles.currentText, { color: theme.text }]}>Đang dùng</Text>
      {note ? (
        <Text style={[styles.currentNote, { color: theme.textSecondary }]}>{note}</Text>
      ) : null}
    </View>
  );
}

/** "/ tháng" cho gói 30 ngày, còn lại ghi rõ số ngày. */
export function formatPlanPeriod(durationDays: number) {
  if (durationDays === 30 || durationDays === 31) return '/ tháng';
  if (durationDays === 365) return '/ năm';

  return `/ ${durationDays} ngày`;
}

const styles = StyleSheet.create({
  planCard: {
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    gap: 14,
    marginTop: Spacing.sm,
    padding: Spacing.lg,
  },
  planHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  planHeading: { flexShrink: 1 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.xs },
  planTitle: { fontSize: FontSize.subtitle, fontWeight: FontWeight.heavy },
  planPrice: { fontSize: FontSize.headline, fontWeight: FontWeight.heavy, marginTop: Spacing.xs },
  planPeriod: { fontSize: FontSize.bodySm, fontWeight: FontWeight.medium },
  ribbon: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  ribbonText: { fontSize: FontSize.micro, fontWeight: FontWeight.heavy },
  benefits: { gap: 9 },
  benefitRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 7 },
  benefitIcon: { marginTop: 1 },
  benefitCopy: { alignItems: 'center', flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  benefitLabel: {
    flexShrink: 1,
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
  badge: { borderRadius: Radius.sm, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: FontSize.micro, fontWeight: FontWeight.heavy },
  currentBox: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 2,
    justifyContent: 'center',
    marginTop: Spacing.xxs,
    minHeight: 44,
    paddingVertical: Spacing.xs,
  },
  currentText: { fontSize: FontSize.body, fontWeight: FontWeight.heavy },
  currentNote: { fontSize: FontSize.footnote },
});
