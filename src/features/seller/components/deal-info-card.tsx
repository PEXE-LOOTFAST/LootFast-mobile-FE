import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { DEAL_CATEGORIES } from '@/features/home/constants/deal-categories';
import type { DealStatusDto, MerchantDealDto } from '@/features/seller/api/merchant-deals';
import { toTimeInput, vietnamDateKey } from '@/features/seller/deal-schedule';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';

const STATUS_LABELS: Record<DealStatusDto, string> = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang bán',
  HIDDEN: 'Đang ẩn',
  SOLD_OUT: 'Hết hàng',
  REMOVED: 'Đã gỡ',
};

// "19:35 · 11/10", cùng dạng với mốc đóng đặt trên thẻ deal.
function toDateTimeLabel(value: string) {
  const day = vietnamDateKey(value).slice(5).split('-').reverse().join('/');
  return `${toTimeInput(value)} · ${day}`;
}

function Row({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

/** Thông tin deal người bán cần nắm: giá, số suất, khung giờ, trạng thái. */
export function DealInfoCard({ deal }: { deal: MerchantDealDto }) {
  const theme = useTheme();
  const category = DEAL_CATEGORIES.find((item) => item.id === deal.categoryCode);
  const sold = deal.totalQuantity - deal.remainingQuantity;

  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Text style={[styles.name, { color: theme.text }]}>{deal.name}</Text>

      <Row label="Trạng thái" value={STATUS_LABELS[deal.status]} />
      <Row label="Nhóm món" value={category?.label ?? deal.categoryCode} />
      <Row
        label="Giá deal"
        value={`${formatPrice(deal.discountedPrice)} (giảm ${deal.discountPercent}%)`}
      />
      <Row label="Giá gốc" value={formatPrice(deal.originalPrice)} />
      <Row
        label="Số suất"
        value={`Còn ${deal.remainingQuantity}/${deal.totalQuantity} · đã bán ${sold}`}
      />
      <Row label="Nhận đặt từ" value={toDateTimeLabel(deal.saleStartsAt)} />
      <Row label="Nhận đặt đến" value={toDateTimeLabel(deal.saleEndsAt)} />
      <Row label="Chuẩn bị món" value={`${deal.preparationMinutes} phút`} />
      <Row label="Tạo lúc" value={toDateTimeLabel(deal.createdAt)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg },
  name: { fontSize: FontSize.subtitle, fontWeight: FontWeight.bold },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  label: { fontSize: FontSize.bodySm, fontWeight: FontWeight.medium },
  value: {
    flexShrink: 1,
    fontSize: FontSize.bodySm,
    fontWeight: FontWeight.bold,
    textAlign: 'right',
  },
});
