import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import {
  getCheckoutErrorMessage,
  usePremiumCheckout,
  type PremiumPlanDto,
} from '@/features/premium/api/premium';
import { usePremiumPalette } from '@/features/premium/components/plan-card';
import { PremiumIcons } from '@/features/premium/constants/icons';
import { useTheme } from '@/hooks/use-theme';
import { requireAuth } from '@/lib/auth-session';
import { formatPrice } from '@/lib/format';

type PremiumCheckoutProps = {
  /** Gói đang công bố; `null` khi backend chưa công bố gói nào cho phía này. */
  plan: PremiumPlanDto | null | undefined;
  planLoading: boolean;
  planName: string;
  price: number;
  durationDays: number;
};

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const theme = useTheme();

  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[strong ? styles.summaryTotal : styles.summaryValue, { color: theme.text }]}>
        {value}
      </Text>
    </View>
  );
}

/**
 * Chân thẻ gói Cao cấp: tóm tắt đơn, đồng ý điều khoản rồi mở trang thanh toán VNPay.
 * Khi backend chưa công bố gói, vẫn hiện đủ các bước nhưng nút thanh toán khoá kèm lý do.
 */
export function PremiumCheckout({
  plan,
  planLoading,
  planName,
  price,
  durationDays,
}: PremiumCheckoutProps) {
  const theme = useTheme();
  const pc = usePremiumPalette();
  const checkout = usePremiumCheckout();
  const [accepted, setAccepted] = useState(false);
  const [returned, setReturned] = useState(false);
  const canPay = Boolean(plan?.termsDocumentId) && accepted && !checkout.isPending;
  const notOpenYet = !planLoading && !plan?.termsDocumentId;

  const pay = () => {
    if (!plan) return;
    requireAuth(() => {
      setReturned(false);
      checkout.mutate(plan, { onSuccess: () => setReturned(true) });
    });
  };

  return (
    <View
      style={[styles.box, { backgroundColor: theme.backgroundElement, borderColor: pc.cardBorder }]}
    >
      <Text style={[styles.heading, { color: pc.accent }]}>ĐĂNG KÝ GÓI</Text>
      <SummaryRow label="Gói" value={planName} />
      <SummaryRow label="Thời hạn" value={`${durationDays} ngày, không tự gia hạn`} />
      <SummaryRow label="Thanh toán qua" value="VNPay (ATM, QR, thẻ)" />
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <SummaryRow label="Tổng thanh toán" strong value={formatPrice(price)} />

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => setAccepted((value) => !value)}
        style={styles.termsRow}
      >
        <Icon
          name={accepted ? PremiumIcons.checkboxOn : PremiumIcons.checkbox}
          color={accepted ? pc.accent : theme.textSecondary}
          size={20}
        />
        <Text style={[styles.termsText, { color: theme.text }]}>
          Tôi đồng ý với điều khoản gói Cao cấp
          {plan?.termsVersion ? ` (phiên bản ${plan.termsVersion})` : ''}.
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canPay, busy: checkout.isPending }}
        disabled={!canPay}
        onPress={pay}
        style={({ pressed }) => [
          styles.payButton,
          { backgroundColor: pc.buyButton },
          !canPay && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Icon name={PremiumIcons.secure} color={pc.onBuyButton} size={18} />
        <Text style={[styles.payText, { color: pc.onBuyButton }]}>
          {checkout.isPending ? 'Đang mở VNPay…' : `Thanh toán ${formatPrice(price)} qua VNPay`}
        </Text>
      </Pressable>

      {checkout.isError ? <InlineAlert message={getCheckoutErrorMessage(checkout.error)} /> : null}
      {returned ? (
        <InlineAlert
          message="Đã gửi yêu cầu thanh toán. Quyền lợi sẽ bật ngay khi VNPay xác nhận giao dịch thành công."
          tone="success"
        />
      ) : null}
      {notOpenYet ? (
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Gói đang chờ mở bán trên hệ thống nên chưa thanh toán được. Giá trên là giá dự kiến.
        </Text>
      ) : (
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Bạn sẽ được chuyển sang trang VNPay an toàn. LootFast không lưu thông tin thẻ của bạn.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
    marginTop: Spacing.xxs,
    padding: Spacing.md,
  },
  heading: { fontSize: FontSize.caption, fontWeight: FontWeight.heavy, letterSpacing: 0.4 },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  summaryLabel: { fontSize: FontSize.bodySm },
  summaryValue: {
    flexShrink: 1,
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  summaryTotal: { fontSize: FontSize.title, fontWeight: FontWeight.heavy },
  divider: { height: StyleSheet.hairlineWidth },
  termsRow: { alignItems: 'flex-start', flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  termsText: { flex: 1, fontSize: FontSize.footnote, lineHeight: 17 },
  payButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.md,
  },
  payText: { fontSize: FontSize.body, fontWeight: FontWeight.heavy },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  note: { fontSize: FontSize.footnote, lineHeight: 17, textAlign: 'center' },
});
