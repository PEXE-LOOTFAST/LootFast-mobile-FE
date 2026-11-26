import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorState } from '@/components/ui/error-state';
import { Icon } from '@/components/ui/icon';
import { LoadingState } from '@/components/ui/loading-state';
import { FontSize, FontWeight, Radius, Spacing, StaticColors } from '@/constants/theme';
import type { PlanAudience } from '@/features/premium/api/premium';
import { usePremiumPalette } from '@/features/premium/components/plan-card';
import { PremiumIcons } from '@/features/premium/constants/icons';
import {
  PREMIUM_BANK,
  isPremiumBankConfigured,
  premiumQrImageUrl,
  premiumTransferNote,
} from '@/features/premium/constants/premium-bank';
import { getCurrentUser } from '@/features/profile/api/profile';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useTheme } from '@/hooks/use-theme';
import { requireAuth } from '@/lib/auth-session';
import { formatPrice } from '@/lib/format';

type PremiumTransferProps = {
  audience: PlanAudience;
  planName: string;
  price: number;
  durationDays: number;
};

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{label}</Text>
      {/* selectable: app chưa có thư viện clipboard, nhấn giữ để sao chép số tài khoản, nội dung. */}
      <Text selectable style={[strong ? styles.rowTotal : styles.rowValue, { color: theme.text }]}>
        {value}
      </Text>
    </View>
  );
}

/**
 * Chân thẻ gói Cao cấp: thanh toán bằng chuyển khoản VietQR vào tài khoản của LootFast. Không có
 * cổng thanh toán nên app chỉ đưa mã QR đã điền sẵn số tiền và nội dung; quản trị viên đối soát
 * rồi kích hoạt gói, màn gói tự thấy khi tải lại trạng thái.
 */
export function PremiumTransfer({ audience, planName, price, durationDays }: PremiumTransferProps) {
  const theme = useTheme();
  const pc = usePremiumPalette();
  const { user } = useAuthSession();
  const userKey = user?.email.toLowerCase() ?? null;
  const [isOpen, setIsOpen] = useState(false);
  // Cùng khoá với các nơi khác đọc /users/me nên thường đã có sẵn, không gọi lại API.
  const me = useQuery({
    queryKey: ['current-user', userKey],
    queryFn: getCurrentUser,
    staleTime: Infinity,
    enabled: isOpen && Boolean(user),
  });
  const note = me.data ? premiumTransferNote(audience, me.data.publicId) : null;

  return (
    <View
      style={[styles.box, { backgroundColor: theme.backgroundElement, borderColor: pc.cardBorder }]}
    >
      <Text style={[styles.heading, { color: pc.accent }]}>ĐĂNG KÝ GÓI</Text>
      <Row label="Gói" value={planName} />
      <Row label="Thời hạn" value={`${durationDays} ngày, không tự gia hạn`} />
      <Row label="Thanh toán" value="Chuyển khoản VietQR" />
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
      <Row label="Tổng thanh toán" strong value={formatPrice(price)} />

      {!isOpen ? (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={() => requireAuth(() => setIsOpen(true))}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: pc.buyButton },
              pressed && styles.pressed,
            ]}
          >
            <Icon name={PremiumIcons.qr} color={pc.onBuyButton} size={18} />
            <Text style={[styles.ctaText, { color: pc.onBuyButton }]}>Đăng ký gói Cao cấp</Text>
          </Pressable>
          <Text style={[styles.note, { color: theme.textSecondary }]}>
            Bấm để lấy mã VietQR, quét bằng app ngân hàng bất kỳ để thanh toán.
          </Text>
        </>
      ) : !isPremiumBankConfigured ? (
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          LootFast tạm chưa nhận đăng ký gói. Vui lòng thử lại sau.
        </Text>
      ) : me.isError ? (
        <ErrorState
          message="Chưa tải được thông tin tài khoản để tạo mã chuyển khoản."
          onRetry={() => void me.refetch()}
          retrying={me.isRefetching}
        />
      ) : !note ? (
        <LoadingState size="small" />
      ) : (
        <>
          <View style={styles.qrFrame}>
            <Image
              accessibilityLabel={`Mã VietQR thanh toán ${formatPrice(price)}`}
              contentFit="contain"
              source={{ uri: premiumQrImageUrl(price, note) }}
              style={styles.qr}
            />
          </View>
          <Row label="Ngân hàng" value={PREMIUM_BANK.bankName || `BIN ${PREMIUM_BANK.bin}`} />
          <Row label="Số tài khoản" value={PREMIUM_BANK.accountNumber} />
          <Row label="Chủ tài khoản" value={PREMIUM_BANK.accountName} />
          <Row label="Số tiền" value={formatPrice(price)} />
          <View style={[styles.reference, { backgroundColor: pc.badgeBg }]}>
            <Text style={[styles.referenceLabel, { color: theme.textSecondary }]}>
              Nội dung chuyển khoản
            </Text>
            <Text selectable style={[styles.referenceValue, { color: pc.accent }]}>
              {note}
            </Text>
          </View>
          <Text style={[styles.note, { color: theme.textSecondary }]}>
            Giữ đúng số tiền và nội dung để LootFast nhận ra tài khoản của bạn. Gói được kích hoạt
            sau khi LootFast xác nhận đã nhận tiền, trang này sẽ tự cập nhật.
          </Text>
        </>
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  rowLabel: { fontSize: FontSize.bodySm },
  rowValue: {
    flexShrink: 1,
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
  rowTotal: { fontSize: FontSize.title, fontWeight: FontWeight.heavy },
  divider: { height: StyleSheet.hairlineWidth },
  cta: {
    alignItems: 'center',
    borderRadius: Radius.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginTop: Spacing.xs,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
  },
  ctaText: { fontSize: FontSize.body, fontWeight: FontWeight.heavy },
  pressed: { opacity: 0.85 },
  qrFrame: {
    alignItems: 'center',
    backgroundColor: StaticColors.white,
    borderRadius: Radius.md,
    marginVertical: Spacing.xs,
    padding: Spacing.sm,
  },
  qr: { height: 240, width: '100%' },
  reference: { borderRadius: Radius.md, gap: 2, padding: Spacing.sm },
  referenceLabel: { fontSize: FontSize.footnote },
  referenceValue: { fontSize: FontSize.bodySm, fontWeight: FontWeight.heavy, letterSpacing: 0.2 },
  note: { fontSize: FontSize.footnote, lineHeight: 17, textAlign: 'center' },
});
